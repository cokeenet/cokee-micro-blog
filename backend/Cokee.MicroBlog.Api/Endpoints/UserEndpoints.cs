using System.Security.Claims;
using Cokee.MicroBlog.Domain.Entities;
using Cokee.MicroBlog.Infrastructure.Data;
using Cokee.MicroBlog.Application.DTOs.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Cokee.MicroBlog.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users");

        group.MapGet("/{username}", async (ApplicationDbContext db, HttpContext httpContext, string username) =>
        {
            // Remove '@' prefix if passed
            var cleanUsername = username.StartsWith("@") ? username.Substring(1) : username;

            var currentUserId = Guid.Empty;
            if (httpContext.User.Identity?.IsAuthenticated == true)
            {
                var userIdStr = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Guid.TryParse(userIdStr, out currentUserId);
            }

            var user = await db.Users
                .Where(u => u.Username == cleanUsername)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.DisplayName,
                    u.Bio,
                    u.AvatarUrl,
                    u.CreatedAt,
                    FollowersCount = u.Followers.Count,
                    FollowingCount = u.Following.Count,
                    IsFollowing = currentUserId != Guid.Empty && u.Followers.Any(f => f.FollowerId == currentUserId)
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return Results.NotFound(new { message = "用户不存在" });

            return Results.Ok(user);
        });

        group.MapGet("/{username}/posts", async (ApplicationDbContext db, string username) =>
        {
            var cleanUsername = username.StartsWith("@") ? username.Substring(1) : username;

            var posts = await db.Posts
                .Include(p => p.User)
                .Include(p => p.RetweetOriginalPost).ThenInclude(op => op!.User)
                .Where(p => p.User.Username == cleanUsername)
                .Where(p => p.ParentPostId == null) // usually profile shows top-level posts and retweets
                .OrderByDescending(p => p.CreatedAt)
                .Take(50)
                .Select(p => new
                {
                    p.Id,
                    p.Content,
                    AuthorUsername = "@" + p.User.Username,
                    AuthorDisplayName = p.User.DisplayName,
                    AuthorAvatarUrl = p.User.AvatarUrl,
                    p.ImageUrls,
                    p.ParentPostId,
                    p.Visibility,
                    RetweetOriginalPostId = p.RetweetOriginalPostId,
                    RetweetOriginalPost = p.RetweetOriginalPost != null ? new
                    {
                        p.RetweetOriginalPost.Id,
                        p.RetweetOriginalPost.Content,
                        AuthorUsername = "@" + p.RetweetOriginalPost.User.Username,
                        AuthorDisplayName = p.RetweetOriginalPost.User.DisplayName,
                        AuthorAvatarUrl = p.RetweetOriginalPost.User.AvatarUrl,
                        p.RetweetOriginalPost.ImageUrls
                    } : null,
                    RepliesCount = p.Replies.Count,
                    p.LikeCount,
                    p.CreatedAt
                })
                .ToListAsync();

            return Results.Ok(posts);
        });

        group.MapPut("/profile", [Authorize] async (ApplicationDbContext db, ClaimsPrincipal claims, UpdateProfileDto dto) =>
        {
            var userIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            var user = await db.Users.FindAsync(userId);
            if (user == null)
                return Results.NotFound(new { message = "用户不存在" });

            if (!string.IsNullOrWhiteSpace(dto.DisplayName))
            {
                user.DisplayName = dto.DisplayName;
            }
            if (dto.Bio != null) // allow empty string to clear bio
            {
                user.Bio = dto.Bio;
            }
            if (!string.IsNullOrWhiteSpace(dto.AvatarUrl))
            {
                user.AvatarUrl = dto.AvatarUrl;
            }

            await db.SaveChangesAsync();

            return Results.Ok(new
            {
                message = "资料已更新",
                user = new { user.Id, user.Username, user.DisplayName, user.Bio, user.AvatarUrl }
            });
        });

        group.MapPost("/{username}/follow", [Authorize] async (ApplicationDbContext db, ClaimsPrincipal claims, string username) =>
        {
            var cleanUsername = username.StartsWith("@") ? username.Substring(1) : username;

            var userIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var followerId))
                return Results.Unauthorized();

            var followee = await db.Users.FirstOrDefaultAsync(u => u.Username == cleanUsername);
            if (followee == null)
                return Results.NotFound(new { message = "关注的目标用户不存在" });

            if (followerId == followee.Id)
                return Results.BadRequest(new { message = "不能关注自己" });

            var exists = await db.Follows.AnyAsync(f => f.FollowerId == followerId && f.FolloweeId == followee.Id);
            if (exists)
                return Results.Ok(new { message = "已关注" });

            db.Follows.Add(new Follow
            {
                FollowerId = followerId,
                FolloweeId = followee.Id,
                CreatedAt = DateTime.UtcNow
            });

            await db.SaveChangesAsync();
            return Results.Ok(new { message = "关注成功" });
        });

        group.MapDelete("/{username}/follow", [Authorize] async (ApplicationDbContext db, ClaimsPrincipal claims, string username) =>
        {
            var cleanUsername = username.StartsWith("@") ? username.Substring(1) : username;

            var userIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var followerId))
                return Results.Unauthorized();

            var followee = await db.Users.FirstOrDefaultAsync(u => u.Username == cleanUsername);
            if (followee == null)
                return Results.NotFound(new { message = "取消关注的目标用户不存在" });

            var follow = await db.Follows.FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FolloweeId == followee.Id);
            if (follow == null)
                return Results.Ok(new { message = "尚未关注" });

            db.Follows.Remove(follow);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "已取消关注" });
        });

        group.MapGet("/search", async (ApplicationDbContext db, string q) =>
        {
            if (string.IsNullOrWhiteSpace(q)) return Results.Ok(new List<object>());

            var users = await db.Users
                .Where(u => u.Username.Contains(q) || u.DisplayName.Contains(q))
                .Select(u => new
                {
                    u.Username,
                    u.DisplayName,
                    u.AvatarUrl,
                    u.Bio,
                    FollowersCount = u.Followers.Count
                })
                .Take(20)
                .ToListAsync();

            return Results.Ok(users);
        });

        group.MapGet("/notifications", [Authorize] async (ApplicationDbContext db, ClaimsPrincipal claims) =>
        {
            var userIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            // Notifications: New followers, Likes on posts, Replies on posts
            // This is a minimal approximation using Interaction, Follow, and Post replies.
            var likeInteractions = await db.Interactions
                .Include(i => i.User)
                .Include(i => i.Post)
                .Where(i => i.Post.UserId == userId && i.UserId != userId)
                .OrderByDescending(i => i.CreatedAt)
                .Take(20)
                .Select(i => new { Type = "Like", ActorUsername = i.User.Username, ActorDisplayName = i.User.DisplayName, ActorAvatarUrl = i.User.AvatarUrl, ActionText = "点赞了你的帖子", PostId = i.PostId, Content = i.Post.Content, i.CreatedAt })
                .ToListAsync();

            var newFollowers = await db.Follows
                .Include(f => f.Follower)
                .Where(f => f.FolloweeId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .Take(20)
                .Select(f => new { Type = "Follow", ActorUsername = f.Follower.Username, ActorDisplayName = f.Follower.DisplayName, ActorAvatarUrl = f.Follower.AvatarUrl, ActionText = "开始关注你", PostId = (Guid?)null, Content = (string)null, f.CreatedAt })
                .ToListAsync();

            var replies = await db.Posts
                .Include(p => p.User)
                .Include(p => p.ParentPost)
                .Where(p => p.ParentPost != null && p.ParentPost.UserId == userId && p.UserId != userId)
                .OrderByDescending(p => p.CreatedAt)
                .Take(20)
                .Select(p => new { Type = "Reply", ActorUsername = p.User.Username, ActorDisplayName = p.User.DisplayName, ActorAvatarUrl = p.User.AvatarUrl, ActionText = "回复了你的帖子", PostId = p.ParentPostId, Content = p.Content, p.CreatedAt })
                .ToListAsync();

            var allNotifications = likeInteractions.Cast<object>()
                .Concat(newFollowers.Cast<object>())
                .Concat(replies.Cast<object>())
                // Cannot order dynamic objects securely without more definition, let's keep it simple
                .OrderByDescending(n => ((dynamic)n).CreatedAt)
                .Take(30)
                .ToList();

            return Results.Ok(allNotifications);
        });

        group.MapGet("/suggestions", [AllowAnonymous] async (ApplicationDbContext db, ClaimsPrincipal claims) =>
        {
            var userIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid.TryParse(userIdStr, out var userId);

            // Get 3 random users. Excluding current user and users already followed.
            var query = db.Users.AsQueryable();

            if (userId != Guid.Empty)
            {
                var followingIds = await db.Follows.Where(f => f.FollowerId == userId).Select(f => f.FolloweeId).ToListAsync();
                query = query.Where(u => u.Id != userId && !followingIds.Contains(u.Id));
            }

            var suggestions = await query
                .OrderBy(u => Guid.NewGuid()) // Random order
                .Take(3)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.DisplayName,
                    u.AvatarUrl,
                    u.Bio
                })
                .ToListAsync();

            return Results.Ok(suggestions);
        });

        // 简单模拟趋势列表，后续可通过管理端增加/删除趋势，此处暂存于内存或者直接Mock
        app.MapGet("/api/trends", () =>
        {
            var trends = new[]
            {
                new { name = "#React19", posts = "5.2万", category = "Tech" },
                new { name = "#C#", posts = "3.1万", category = "Tech" },
                new { name = "#MicroBlog", posts = "1.2万", category = "Tech" }
            };
            return Results.Ok(trends);
        });
    }
}
