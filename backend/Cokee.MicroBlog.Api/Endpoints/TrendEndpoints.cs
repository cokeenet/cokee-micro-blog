using System.Security.Claims;
using System.Text.RegularExpressions;
using Cokee.MicroBlog.Domain.Entities;
using Cokee.MicroBlog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Cokee.MicroBlog.Api.Endpoints;

public static class TrendEndpoints
{
    public static void MapTrendEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/trends");

        // Get trending topics
        group.MapGet("/", async (ApplicationDbContext db) =>
        {
            var trends = await db.Trends
                .Where(t => t.IsActive)
                .OrderByDescending(t => t.PostCount)
                .ThenBy(t => t.SortOrder)
                .Take(30)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Category,
                    PostCount = t.PostCount,
                    t.CreatedAt
                })
                .ToListAsync();

            return Results.Ok(trends);
        });

        // Get posts by trend/hashtag
        group.MapGet("/{hashtag}/posts", async (ApplicationDbContext db, ClaimsPrincipal claims, string hashtag, int page = 1, int pageSize = 20) =>
        {
            if (string.IsNullOrWhiteSpace(hashtag) || hashtag.Length < 2)
                return Results.BadRequest(new { message = "话题名称无效" });

            const int maxPageSize = 100;
            if (pageSize > maxPageSize) pageSize = maxPageSize;
            if (page < 1) page = 1;

            // Normalize hashtag (remove # if present, add it for search)
            var cleanHashtag = hashtag.StartsWith("#") ? hashtag : "#" + hashtag;
            var searchPattern = cleanHashtag.ToLower();

            Guid? currentUserId = null;
            var userIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdStr, out var u)) currentUserId = u;

            var posts = await db.Posts
                .Include(p => p.User)
                .Include(p => p.RetweetOriginalPost).ThenInclude(op => op!.User)
                .Include(p => p.Interactions)
                .Include(p => p.Bookmarks)
                .Where(p => p.ParentPostId == null)
                .Where(p => p.Visibility == PostVisibility.Public || p.Visibility == PostVisibility.FollowersOnly || p.Visibility == PostVisibility.MutualFollowersOnly)
                .Where(p => EF.Functions.Like(p.Content.ToLower(), $"%{searchPattern}%"))
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
                    IsLikedByMe = currentUserId.HasValue && p.Interactions.Any(i => i.UserId == currentUserId && i.Type == InteractionType.Like),
                    IsBookmarkedByMe = currentUserId.HasValue && p.Bookmarks.Any(b => b.UserId == currentUserId)
                })
                .ToListAsync();

            // Get retweet counts and states after initial query
            var retweetCounts = await db.Posts
                .Where(rp => posts.Select(p => p.Id).Contains(rp.RetweetOriginalPostId!.Value))
                .GroupBy(rp => rp.RetweetOriginalPostId)
                .Select(g => new { PostId = g.Key, Count = g.Count() })
                .ToListAsync();

            var retweetedByMe = currentUserId.HasValue
                ? await db.Posts
                    .Where(rp => posts.Select(p => p.Id).Contains(rp.RetweetOriginalPostId!.Value) && rp.UserId == currentUserId)
                    .Select(rp => rp.RetweetOriginalPostId!.Value)
                    .ToListAsync()
                : new List<Guid>();

            // Merge retweet data into posts
            var postsWithRetweets = posts.Select(p => new
            {
                p.Id,
                p.Content,
                p.AuthorUsername,
                p.AuthorDisplayName,
                p.AuthorAvatarUrl,
                p.ImageUrls,
                p.ParentPostId,
                p.Visibility,
                p.RetweetOriginalPostId,
                p.RetweetOriginalPost,
                p.RepliesCount,
                p.CreatedAt,
                p.LikeCount,
                p.ViewCount,
                RetweetCount = retweetCounts.FirstOrDefault(rc => rc.PostId == p.Id)?.Count ?? 0,
                p.IsLikedByMe,
                IsRetweetedByMe = retweetedByMe.Contains(p.Id),
                p.IsBookmarkedByMe
            }).ToList();

            return Results.Ok(new { page, pageSize, hashtag = cleanHashtag, data = postsWithRetweets });
        });

        // Search trends
        group.MapGet("/search", async (ApplicationDbContext db, string q) =>
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length < 1)
                return Results.Ok(new List<object>());

            var searchTerm = q.ToLower();
            var trends = await db.Trends
                .Where(t => t.IsActive && (t.Name.ToLower().Contains(searchTerm) || t.Category.ToLower().Contains(searchTerm)))
                .Take(10)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Category,
                    t.PostCount
                })
                .ToListAsync();

            return Results.Ok(trends);
        });

        // Get trend details
        group.MapGet("/{id:guid}", async (ApplicationDbContext db, Guid id) =>
        {
            var trend = await db.Trends
                .Where(t => t.Id == id)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Category,
                    t.PostCount,
                    t.IsActive,
                    t.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (trend == null)
                return Results.NotFound(new { message = "话题不存在" });

            return Results.Ok(trend);
        });
    }

    // Helper method to extract hashtags from content
    public static List<string> ExtractHashtags(string content)
    {
        var hashtags = new List<string>();
        var pattern = @"#[\w\u4e00-\u9fff]+";
        var matches = Regex.Matches(content, pattern);

        foreach (Match match in matches)
        {
            hashtags.Add(match.Value.ToLower());
        }

        return hashtags;
    }

    // Helper method to update trends after post creation
    public static async Task UpdateTrendsFromPost(ApplicationDbContext db, Post post)
    {
        var hashtags = ExtractHashtags(post.Content);

        foreach (var hashtag in hashtags)
        {
            var trend = await db.Trends.FirstOrDefaultAsync(t => t.Name == hashtag);
            if (trend == null)
            {
                // Create new trend
                db.Trends.Add(new Trend
                {
                    Name = hashtag,
                    PostCount = 1,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else
            {
                // Update existing trend
                trend.PostCount++;
            }
        }

        await db.SaveChangesAsync();
    }
}
