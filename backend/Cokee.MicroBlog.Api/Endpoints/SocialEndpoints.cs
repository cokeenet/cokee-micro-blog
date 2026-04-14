using System.Security.Claims;
using Cokee.MicroBlog.Domain.Entities;
using Cokee.MicroBlog.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Cokee.MicroBlog.Api.Endpoints;

public static class SocialEndpoints
{
    public static void MapSocialEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api");

        // ----------------- SOCIAL GRAPH ENDPOINTS -----------------
        group.MapPost("/users/{followeeId:guid}/follow", [Authorize] async (ApplicationDbContext db, ClaimsPrincipal claims, Guid followeeId) =>
        {
            var userIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var followerId))
                return Results.Unauthorized();

            if (followerId == followeeId)
                return Results.BadRequest(new { message = "不能关注自己" });

            var followeeExists = await db.Users.AnyAsync(u => u.Id == followeeId);
            if (!followeeExists)
                return Results.NotFound(new { message = "用户不存在" });

            var alreadyFollowing = await db.Follows.AnyAsync(f => f.FollowerId == followerId && f.FolloweeId == followeeId);
            if (alreadyFollowing)
                return Results.Ok(new { message = "已关注" });

            db.Follows.Add(new Follow
            {
                FollowerId = followerId,
                FolloweeId = followeeId,
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "关注成功" });
        });

        group.MapDelete("/users/{followeeId:guid}/follow", [Authorize] async (ApplicationDbContext db, ClaimsPrincipal claims, Guid followeeId) =>
        {
            var userIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var followerId))
                return Results.Unauthorized();

            var relation = await db.Follows.FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FolloweeId == followeeId);
            if (relation == null)
                return Results.NotFound(new { message = "尚未关注该用户" });

            db.Follows.Remove(relation);
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "已取消关注" });
        });

        // ----------------- FILE UPLOAD -----------------
        group.MapPost("/upload", async (HttpRequest request) =>
        {
            if (!request.HasFormContentType)
                return Results.BadRequest(new { message = "必须包含文件数据" });

            var form = await request.ReadFormAsync();
            var file = form.Files.GetFile("file");

            if (file is null || file.Length == 0)
                return Results.BadRequest(new { message = "未选择任何文件或文件为空" });

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Results.Ok(new { url = $"/uploads/{fileName}" });
        })
        .RequireAuthorization()
        .DisableAntiforgery();

        // ----------------- ADMIN ENDPOINTS -----------------
        var adminGroup = app.MapGroup("/api/admin");

        adminGroup.MapGet("/stats", async (ApplicationDbContext db) =>
        {
            var totalUsers = await db.Users.CountAsync();
            var totalPosts = await db.Posts.CountAsync();
            var todayLogins = await db.Users.Where(u => u.CreatedAt >= DateTime.UtcNow.Date).CountAsync();

            return Results.Ok(new
            {
                TotalUsers = totalUsers,
                TotalPosts = totalPosts,
                TodayLogins = todayLogins,
                ActiveStorage = "192 MB", // Placeholder for actual calculation
                ApiGateway = "99.98%",
                CdnStatus = "正常运行",
                DbCluster = "96%"
            });
        });

        adminGroup.MapGet("/users", async (ApplicationDbContext db) =>
        {
            return Results.Ok(await db.Users.OrderByDescending(u => u.CreatedAt).Take(20).ToListAsync());
        });

        // ----------------- SIDEBAR ENDPOINTS -----------------
        app.MapGet("/api/trends", async (ApplicationDbContext db) =>
        {
            var posts = await db.Posts
                .OrderByDescending(p => p.CreatedAt)
                .Take(300)
                .Select(p => p.Content)
                .ToListAsync();

            var hashtagRegex = new System.Text.RegularExpressions.Regex("#([\\p{L}\\p{N}_]+)", System.Text.RegularExpressions.RegexOptions.Compiled);

            var trends = posts
                .SelectMany(content => hashtagRegex.Matches(content ?? string.Empty).Select(m => m.Groups[1].Value.ToLowerInvariant()))
                .GroupBy(tag => tag)
                .Select(g => new
                {
                    Category = "热门话题",
                    Name = "#" + g.Key,
                    Posts = g.Count()
                })
                .OrderByDescending(x => x.Posts)
                .Take(10)
                .ToList();

            return Results.Ok(trends);
        });

        app.MapGet("/api/users/suggestions", [Authorize] async (ApplicationDbContext db, ClaimsPrincipal claims) =>
        {
            var claimsUserIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid? currentUserId = null;
            if (!string.IsNullOrEmpty(claimsUserIdStr) && Guid.TryParse(claimsUserIdStr, out var parsedId))
            {
                currentUserId = parsedId;
            }

            var excludedIds = new List<Guid>();
            if (currentUserId.HasValue)
            {
                excludedIds = await db.Follows
                    .Where(f => f.FollowerId == currentUserId.Value)
                    .Select(f => f.FolloweeId)
                    .ToListAsync();

                excludedIds.Add(currentUserId.Value);
            }

            var query = db.Users.AsQueryable();
            if (excludedIds.Count > 0)
                query = query.Where(u => !excludedIds.Contains(u.Id));

            var suggestions = await query
                .OrderByDescending(u => u.CreatedAt)
                .Take(8)
                .Select(u => new
                {
                    u.Id,
                    u.DisplayName,
                    u.Username,
                    u.AvatarUrl
                })
                .ToListAsync();

            return Results.Ok(suggestions);
        });
    }
}
