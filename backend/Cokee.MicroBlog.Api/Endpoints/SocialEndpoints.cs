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

            const long maxFileSize = 10 * 1024 * 1024; // 10 MB
            if (file.Length > maxFileSize)
                return Results.BadRequest(new { message = "文件大小不能超过 10 MB" });

            var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"
            };
            var ext = Path.GetExtension(file.FileName);
            if (!allowedExtensions.Contains(ext))
                return Results.BadRequest(new { message = "仅支持上传图片文件（jpg、png、gif、webp、avif）" });

            var allowedContentTypes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"
            };
            if (!allowedContentTypes.Contains(file.ContentType))
                return Results.BadRequest(new { message = "文件类型不合法，请上传图片文件" });

            // Magic Bytes验证
            var magicBytes = new Dictionary<string, byte[]>(StringComparer.OrdinalIgnoreCase)
            {
                { ".jpg", new byte[] { 0xFF, 0xD8, 0xFF } },
                { ".jpeg", new byte[] { 0xFF, 0xD8, 0xFF } },
                { ".png", new byte[] { 0x89, 0x50, 0x4E, 0x47 } },
                { ".gif", new byte[] { 0x47, 0x49, 0x46 } },
                { ".webp", new byte[] { 0x52, 0x49, 0x46, 0x46 } },
                { ".avif", new byte[] { 0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70 } }
            };

            if (magicBytes.TryGetValue(ext, out var expectedBytes))
            {
                using var stream = file.OpenReadStream();
                var buffer = new byte[Math.Max(expectedBytes.Length, 8)];
                await stream.ReadAsync(buffer, 0, buffer.Length);

                if (!buffer.Take(expectedBytes.Length).SequenceEqual(expectedBytes))
                    return Results.BadRequest(new { message = "文件格式不匹配，请上传真实的图片文件" });
            }

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{ext}";
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
        var adminGroup = app.MapGroup("/api/admin").RequireAuthorization("AdminOnly");

        adminGroup.MapGet("/users", async (ApplicationDbContext db) =>
        {
            return Results.Ok(await db.Users
                .OrderByDescending(u => u.CreatedAt)
                .Take(20)
                .Select(u => new { u.Id, u.Username, u.DisplayName, u.AvatarUrl, u.CreatedAt })
                .ToListAsync());
        });

        // ----------------- SIDEBAR ENDPOINTS -----------------
        app.MapGet("/api/trends", async (ApplicationDbContext db) =>
        {
            var dbTrends = await db.Trends.Where(t => t.IsActive).ToListAsync();

            var posts = await db.Posts
                .OrderByDescending(p => p.CreatedAt)
                .Take(300)
                .Select(p => p.Content)
                .ToListAsync();

            var hashtagRegex = new System.Text.RegularExpressions.Regex("#([\\p{L}\\p{N}_]+)", System.Text.RegularExpressions.RegexOptions.Compiled);

            var dynamicTrends = posts
                .SelectMany(content => hashtagRegex.Matches(content ?? string.Empty).Select(m => m.Groups[1].Value.ToLowerInvariant()))
                .GroupBy(tag => tag)
                .Select(g => new
                {
                    Category = "热门话题",
                    Name = "#" + g.Key,
                    PostCount = g.Count()
                })
                .ToList();

            var trends = dbTrends.Select(t => new { Category = t.Category, Name = t.Name, PostCount = t.PostCount })
                .Concat(dynamicTrends.Where(d => !dbTrends.Any(dbItem => string.Equals(dbItem.Name, d.Name, StringComparison.OrdinalIgnoreCase))))
                .OrderByDescending(x => x.PostCount)
                .Take(10)
                .ToList();

            return Results.Ok(trends);
        });

        app.MapGet("/api/users/suggestions", [AllowAnonymous] async (ApplicationDbContext db, ClaimsPrincipal claims) =>
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

            if (AdminConfig.RecommendMode == "specific" && AdminConfig.RecommendedUserIds.Count > 0)
            {
                query = query.Where(u => AdminConfig.RecommendedUserIds.Contains(u.Id));
            }

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
