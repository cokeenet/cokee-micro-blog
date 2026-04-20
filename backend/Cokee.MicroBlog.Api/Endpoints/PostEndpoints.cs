using System.Security.Claims;
using System.Text.RegularExpressions;
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

        group.MapGet("/search", async (ApplicationDbContext db, string q, int page = 1, int pageSize = 20, ClaimsPrincipal claims) =>
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
                return Results.BadRequest(new { message = "搜索词至少需要2个字符" });

            const int maxPageSize = 100;
            if (pageSize > maxPageSize) pageSize = maxPageSize;
            if (page < 1) page = 1;

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

            var searchLower = q.ToLower();
            var posts = await db.Posts
                .Include(p => p.User)
                .Include(p => p.RetweetOriginalPost).ThenInclude(op => op!.User)
                .Where(p => p.ParentPostId == null)
                .Where(p => p.Content.ToLower().Contains(searchLower) || p.User.Username.ToLower().Contains(searchLower) || p.User.DisplayName.ToLower().Contains(searchLower))
                .Where(p =>
                    p.Visibility == PostVisibility.Public ||
                    (currentUserId.HasValue && p.UserId == currentUserId.Value) ||
                    (currentUserId.HasValue && p.Visibility == PostVisibility.FollowersOnly && followingIds.Contains(p.UserId)) ||
                    (currentUserId.HasValue && p.Visibility == PostVisibility.MutualFollowersOnly && mutualIds.Contains(p.UserId)))
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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
                .ToListAsync();

            return Results.Ok(new { page, pageSize, data = posts });
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

            // Content validation
            const int maxContentLength = 5000;
            const int maxImageUrls = 4;

            if (post.RetweetOriginalPostId == null)
            {
                if (string.IsNullOrWhiteSpace(post.Content) && (post.ImageUrls == null || post.ImageUrls.Count == 0))
                    return Results.BadRequest(new { message = "推文内容或图片不能为空" });

                if (post.Content != null && post.Content.Length > maxContentLength)
                    return Results.BadRequest(new { message = $"内容长度不能超过{maxContentLength}字" });

                // XSS防护：检测危险的HTML标签
                if (post.Content != null && Regex.IsMatch(post.Content, @"<script|onerror=|onclick=|<iframe|<object|<embed", RegexOptions.IgnoreCase))
                    return Results.BadRequest(new { message = "内容包含非法字符" });
            }

            if (post.ImageUrls?.Count > maxImageUrls)
                return Results.BadRequest(new { message = $"图片数量不能超过{maxImageUrls}张" });

            post.UserId = userId;
            post.CreatedAt = DateTime.UtcNow;

            db.Posts.Add(post);
            await db.SaveChangesAsync();

            // Update trends if not a retweet or reply
            if (post.RetweetOriginalPostId == null && post.ParentPostId == null)
            {
                await TrendEndpoints.UpdateTrendsFromPost(db, post);
            }

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
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            var post = await db.Posts.FindAsync(id);
            if (post == null) return Results.NotFound(new { message = "推文不存在" });

            var isAdmin = claims.FindFirst("IsAdmin")?.Value == "true";
            if (post.UserId != userId && !isAdmin)
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

        group.MapPost("/{id:guid}/bookmark", [Authorize] async (ApplicationDbContext db, Guid id, ClaimsPrincipal claims) =>
        {
            var userIdStr = claims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            var post = await db.Posts.FindAsync(id);
            if (post == null) return Results.NotFound(new { message = "推文不存在" });

            var existingBookmark = await db.Bookmarks.FirstOrDefaultAsync(b => b.PostId == id && b.UserId == userId);
            if (existingBookmark != null) return Results.Ok(new { message = "已收藏" });

            db.Bookmarks.Add(new Bookmark
            {
                PostId = id,
                UserId = userId
            });

            await db.SaveChangesAsync();
            return Results.Ok(new { message = "收藏成功" });
        });

        group.MapDelete("/{id:guid}/bookmark", [Authorize] async (ApplicationDbContext db, Guid id, ClaimsPrincipal claims) =>
        {
            var userIdStr = claims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            var bookmark = await db.Bookmarks.FirstOrDefaultAsync(b => b.PostId == id && b.UserId == userId);
            if (bookmark == null) return Results.NotFound(new { message = "未收藏该推文" });

            db.Bookmarks.Remove(bookmark);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "取消收藏成功" });
        });

        group.MapGet("/bookmarks", [Authorize] async (ApplicationDbContext db, ClaimsPrincipal claims, int page = 1, int pageSize = 20) =>
        {
            var userIdStr = claims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            const int maxPageSize = 100;
            if (pageSize > maxPageSize) pageSize = maxPageSize;
            if (page < 1) page = 1;

            var posts = await db.Bookmarks
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(b => b.Post).ThenInclude(p => p.User)
                .Include(b => b.Post).ThenInclude(p => p.RetweetOriginalPost).ThenInclude(op => op!.User)
                .Select(b => new
                {
                    b.Post.Id,
                    b.Post.Content,
                    AuthorUsername = "@" + b.Post.User.Username,
                    AuthorDisplayName = b.Post.User.DisplayName,
                    AuthorAvatarUrl = b.Post.User.AvatarUrl,
                    b.Post.ImageUrls,
                    b.Post.ParentPostId,
                    b.Post.Visibility,
                    RetweetOriginalPostId = b.Post.RetweetOriginalPostId,
                    RepliesCount = b.Post.Replies.Count,
                    b.Post.CreatedAt,
                    b.Post.LikeCount,
                    b.Post.ViewCount,
                    IsLikedByMe = b.Post.Interactions.Any(i => i.UserId == userId && i.Type == InteractionType.Like),
                    IsBookmarkedByMe = true
                })
                .ToListAsync();

            return Results.Ok(new { page, pageSize, data = posts });
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

        group.MapPost("/{id:guid}/comments", [Authorize] async (ApplicationDbContext db, Guid id, Post comment, ClaimsPrincipal claims) =>
        {
            var userIdStr = claims.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            // Verify parent post exists
            var parentPost = await db.Posts.FindAsync(id);
            if (parentPost == null)
                return Results.NotFound(new { message = "被评论的推文不存在" });

            // Check reply permission
            if (parentPost.ReplyPermission == ReplyPermission.FollowingOnly)
            {
                var isFollowing = await db.Follows.AnyAsync(f => f.FollowerId == userId && f.FolloweeId == parentPost.UserId);
                if (!isFollowing && userId != parentPost.UserId)
                    return Results.Forbid();
            }
            else if (parentPost.ReplyPermission == ReplyPermission.MentionedOnly)
            {
                var isMentioned = comment.Content != null && comment.Content.Contains($"@{parentPost.User.Username}");
                if (!isMentioned && userId != parentPost.UserId)
                    return Results.Forbid();
            }

            // Validation
            const int maxCommentLength = 1000;
            if (string.IsNullOrWhiteSpace(comment.Content))
                return Results.BadRequest(new { message = "评论内容不能为空" });

            if (comment.Content.Length > maxCommentLength)
                return Results.BadRequest(new { message = $"评论长度不能超过{maxCommentLength}字" });

            comment.UserId = userId;
            comment.ParentPostId = id;
            comment.CreatedAt = DateTime.UtcNow;
            comment.Visibility = PostVisibility.Public;

            db.Posts.Add(comment);
            await db.SaveChangesAsync();

            await db.Entry(comment).Reference(p => p.User).LoadAsync();

            return Results.Created($"/api/posts/{comment.Id}", new
            {
                comment.Id,
                comment.Content,
                AuthorUsername = "@" + comment.User.Username,
                AuthorDisplayName = comment.User.DisplayName,
                AuthorAvatarUrl = comment.User.AvatarUrl,
                comment.ImageUrls,
                comment.ParentPostId,
                RepliesCount = 0,
                comment.CreatedAt,
                comment.LikeCount
            });
        });
    }
}
