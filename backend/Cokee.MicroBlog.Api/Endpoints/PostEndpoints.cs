using System.Security.Claims;
using Cokee.MicroBlog.Domain.Entities;
using Cokee.MicroBlog.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Cokee.MicroBlog.Api.Endpoints;

public static class PostEndpoints
{
    public static void MapPostEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/posts");

        group.MapGet("/", async (ApplicationDbContext db, ClaimsPrincipal claims) =>
        {
            Guid? currentUserId = null;
            var userIdStr = claims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdStr, out var u)) currentUserId = u;

            List<Guid> followingIds = new();
            List<Guid> mutualIds = new();

            if (currentUserId.HasValue)
            {
                followingIds = await db.Follows.Where(f => f.FollowerId == currentUserId).Select(f => f.FolloweeId).ToListAsync();
                var followerIds = await db.Follows.Where(f => f.FolloweeId == currentUserId).Select(f => f.FollowerId).ToListAsync();
                mutualIds = followingIds.Intersect(followerIds).ToList();
            }

            var query = db.Posts
                .Include(p => p.User)
                .Include(p => p.RetweetOriginalPost).ThenInclude(op => op!.User)
                .Where(p => p.ParentPostId == null)
                .Where(p =>
                    p.Visibility == PostVisibility.Public ||
                    (currentUserId.HasValue && p.UserId == currentUserId.Value) ||
                    (currentUserId.HasValue && p.Visibility == PostVisibility.FollowersOnly && followingIds.Contains(p.UserId)) ||
                    (currentUserId.HasValue && p.Visibility == PostVisibility.MutualFollowersOnly && mutualIds.Contains(p.UserId)))
                .OrderBy(p => EF.Functions.Random())
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
                    p.CreatedAt,
                    p.LikeCount,
                    p.ViewCount,
                    IsLikedByMe = currentUserId.HasValue && p.Interactions.Any(i => i.UserId == currentUserId && i.Type == InteractionType.Like)
                })
                .Take(50);

            return Results.Ok(await query.ToListAsync());
        });

        group.MapGet("/following", [Authorize] async (ApplicationDbContext db, ClaimsPrincipal claims) =>
        {
            var userIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            var followingIds = await db.Follows
                .Where(f => f.FollowerId == userId)
                .Select(f => f.FolloweeId)
                .ToListAsync();

            var followerIds = await db.Follows
                .Where(f => f.FolloweeId == userId)
                .Select(f => f.FollowerId)
                .ToListAsync();

            var mutualIds = followingIds.Intersect(followerIds).ToList();

            followingIds.Add(userId);

            var posts = await db.Posts
                .Include(p => p.User)
                .Include(p => p.RetweetOriginalPost).ThenInclude(op => op!.User)
                .Where(p => p.ParentPostId == null)
                .Where(p => followingIds.Contains(p.UserId))
                .Where(p => p.Visibility == PostVisibility.Public
                         || p.Visibility == PostVisibility.FollowersOnly
                         || (p.Visibility == PostVisibility.MutualFollowersOnly && (mutualIds.Contains(p.UserId) || p.UserId == userId))
                         || p.UserId == userId)
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
                    p.CreatedAt
                })
                .ToListAsync();

            return Results.Ok(posts);
        });

        group.MapPost("/", [Authorize] async (ApplicationDbContext db, Post post, ClaimsPrincipal claims) =>
        {
            var userIdStr = claims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            post.UserId = userId;
            post.CreatedAt = DateTime.UtcNow;

            db.Posts.Add(post);
            await db.SaveChangesAsync();

            await db.Entry(post).Reference(p => p.User).LoadAsync();

            var result = new
            {
                Id = post.Id,
                Content = post.Content,
                AuthorUsername = "@" + post.User?.Username,
                AuthorDisplayName = post.User?.DisplayName,
                AuthorAvatarUrl = post.User?.AvatarUrl,
                ImageUrls = post.ImageUrls,
                ParentPostId = post.ParentPostId,
                RepliesCount = 0,
                CreatedAt = post.CreatedAt,
                LikeCount = post.LikeCount,
                ViewCount = post.ViewCount,
                IsLikedByMe = false
            };

            return Results.Created($"/api/posts/{post.Id}", result);
        });

        group.MapPost("/{id:guid}/retweet", [Authorize] async (ApplicationDbContext db, Guid id, ClaimsPrincipal claims) =>
        {
            var userIdStr = claims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            var originalPost = await db.Posts.FindAsync(id);
            if (originalPost == null)
                return Results.NotFound(new { message = "原推文不存在" });

            var retweet = new Post
            {
                UserId = userId,
                Content = "",
                RetweetOriginalPostId = id,
                CreatedAt = DateTime.UtcNow,
                Visibility = PostVisibility.Public
            };

            db.Posts.Add(retweet);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "转发成功", id = retweet.Id });
        });

        group.MapPut("/{id:guid}", [Authorize] async (ApplicationDbContext db, Guid id, Post inputPost, ClaimsPrincipal claims) =>
        {
            var userIdStr = claims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var username = claims.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            var post = await db.Posts.FindAsync(id);
            if (post == null) return Results.NotFound(new { message = "推文不存在" });

            if (post.UserId != userId && username != "admin")
                return Results.Forbid();

            post.Content = inputPost.Content;
            post.Visibility = inputPost.Visibility;
            post.ReplyPermission = inputPost.ReplyPermission;
            if (inputPost.ImageUrls != null)
            {
                post.ImageUrls = inputPost.ImageUrls;
            }

            await db.SaveChangesAsync();

            return Results.Ok(new { message = "修改成功" });
        });

        group.MapPost("/{id:guid}/like", [Authorize] async (ApplicationDbContext db, Guid id, ClaimsPrincipal claims) =>
        {
            var userIdStr = claims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            var post = await db.Posts.FindAsync(id);
            if (post == null) return Results.NotFound(new { message = "推文不存在" });

            var existingLike = await db.Interactions.FirstOrDefaultAsync(i => i.PostId == id && i.UserId == userId && i.Type == InteractionType.Like);
            if (existingLike != null) return Results.Ok(new { message = "已点赞" });

            db.Interactions.Add(new Interaction
            {
                PostId = id,
                UserId = userId,
                Type = InteractionType.Like
            });
            post.LikeCount++;

            await db.SaveChangesAsync();
            return Results.Ok(new { message = "点赞成功" });
        });

        group.MapDelete("/{id:guid}/like", [Authorize] async (ApplicationDbContext db, Guid id, ClaimsPrincipal claims) =>
        {
            var userIdStr = claims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            var interaction = await db.Interactions.FirstOrDefaultAsync(i => i.PostId == id && i.UserId == userId && i.Type == InteractionType.Like);
            if (interaction == null) return Results.NotFound(new { message = "尚未点赞" });

            var post = await db.Posts.FindAsync(id);
            if (post != null && post.LikeCount > 0) post.LikeCount--;

            db.Interactions.Remove(interaction);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "已取消点赞" });
        });

        group.MapDelete("/{id:guid}", [Authorize] async (ApplicationDbContext db, Guid id, ClaimsPrincipal claims) =>
        {
            var userIdStr = claims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            var post = await db.Posts.FindAsync(id);
            if (post == null)
                return Results.NotFound(new { message = "推文不存在" });

            if (post.UserId != userId)
                return Results.Forbid();

            db.Posts.Remove(post);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "推文已删除" });
        });

        group.MapGet("/{id:guid}", async (ApplicationDbContext db, Guid id) =>
        {
            var post = await db.Posts
                .Include(p => p.User)
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Content,
                    AuthorUsername = "@" + p.User.Username,
                    AuthorDisplayName = p.User.DisplayName,
                    AuthorAvatarUrl = p.User.AvatarUrl,
                    p.ImageUrls,
                    p.ParentPostId,
                    RepliesCount = p.Replies.Count,
                    p.CreatedAt,
                    p.LikeCount,
                    ViewCount = p.ViewCount
                })
                .FirstOrDefaultAsync();

            return post is not null ? Results.Ok(post) : Results.NotFound();
        });

        group.MapGet("/{id:guid}/comments", async (ApplicationDbContext db, Guid id) =>
        {
            var comments = await db.Posts
                .Include(p => p.User)
                .Where(p => p.ParentPostId == id)
                .OrderBy(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.Content,
                    AuthorUsername = "@" + p.User.Username,
                    AuthorDisplayName = p.User.DisplayName,
                    AuthorAvatarUrl = p.User.AvatarUrl,
                    p.ImageUrls,
                    p.ParentPostId,
                    RepliesCount = p.Replies.Count,
                    p.CreatedAt,
                    p.LikeCount,
                    p.ViewCount
                })
                .ToListAsync();

            return Results.Ok(comments);
        });
    }
}
