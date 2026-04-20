using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Linq;
using Cokee.MicroBlog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Cokee.MicroBlog.Api.Endpoints;

public class AdminConfigDto
{
    public string Mode { get; set; } = "random";
    public List<Guid> Users { get; set; } = new List<Guid>();
}

public static class AdminConfig
{
    public static string RecommendMode { get; set; } = "random";
    public static List<Guid> RecommendedUserIds { get; set; } = new List<Guid>();
}

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var adminGroup = app.MapGroup("/api").RequireAuthorization("AdminOnly");

        // Admin Recommendation settings
        adminGroup.MapGet("/admin/recommend-config", async (ApplicationDbContext db) =>
        {
            var users = await db.Users.Where(u => AdminConfig.RecommendedUserIds.Contains(u.Id)).Select(u => new { id = u.Id, name = u.DisplayName, username = u.Username, avatar = u.AvatarUrl }).ToListAsync();
            return Results.Ok(new { mode = AdminConfig.RecommendMode, users });
        });

        adminGroup.MapPost("/admin/recommend-config", (AdminConfigDto dto) =>
        {
            AdminConfig.RecommendMode = dto.Mode;
            AdminConfig.RecommendedUserIds = dto.Users;
            return Results.Ok();
        });

        // System Level Stats
        adminGroup.MapGet("/admin/stats", async (ApplicationDbContext db) =>
        {
            var totalUsers = await db.Users.CountAsync();
            var totalPosts = await db.Posts.CountAsync();
            var todayLogins = await db.Users.Where(u => u.CreatedAt >= DateTime.UtcNow.Date).CountAsync();
            var isDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";
            var os = System.Runtime.InteropServices.RuntimeInformation.OSDescription;
            var framework = System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription;
            var procCount = Environment.ProcessorCount;
            var memoryUsage = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64;
            return Results.Ok(new
            {
                totalUsers,
                totalPosts,
                todayLogins,
                activeStorage = "192 MB",
                apiGateway = "99.98%",
                cdnStatus = "正常运行",
                dbCluster = "96%",
                isDocker,
                os,
                framework,
                procCount,
                memoryUsage
            });
        });

        // User Management (Admin specific list, or general list if authorized properly)
        adminGroup.MapGet("/users", async (ApplicationDbContext db) =>
        {
            var users = await db.Users
                .Select(u => new { u.Id, u.Username, u.DisplayName, u.Email, u.AvatarUrl, u.Bio, u.CreatedAt })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
            return Results.Ok(users);
        });

        // Trends Management (Admin specific list)
        adminGroup.MapGet("/trends/admin", async (ApplicationDbContext db) =>
        {
            var dbTrends = await db.Trends.ToListAsync();

            var posts = await db.Posts
                .OrderByDescending(p => p.CreatedAt)
                .Take(1000)
                .Select(p => p.Content)
                .ToListAsync();

            var hashtagRegex = new System.Text.RegularExpressions.Regex("#([\\p{L}\\p{N}_]+)");
            var dynamicTrends = posts
                .SelectMany(content => hashtagRegex.Matches(content ?? string.Empty).Select(m => m.Groups[1].Value.ToLowerInvariant()))
                .GroupBy(tag => tag)
                .Select(g => new Cokee.MicroBlog.Domain.Entities.Trend
                {
                    Id = Guid.NewGuid(),
                    Name = "#" + g.Key,
                    Category = "话题",
                    PostCount = g.Count(),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                })
                .ToList();

            // Merge manually created DB trends with dynamically generated ones, avoiding duplicates by Name
            var result = dbTrends.Concat(dynamicTrends.Where(d => !dbTrends.Any(dbItem => string.Equals(dbItem.Name, d.Name, StringComparison.OrdinalIgnoreCase))))
                .OrderByDescending(x => x.PostCount)
                .Take(50)
                .ToList();

            return Results.Ok(result);
        });

        adminGroup.MapPost("/trends/admin", async (ApplicationDbContext db, Cokee.MicroBlog.Domain.Entities.Trend input) =>
        {
            input.Id = Guid.NewGuid();
            if (string.IsNullOrEmpty(input.Category)) input.Category = "自定义";
            if (!input.Name.StartsWith("#")) input.Name = "#" + input.Name;

            db.Trends.Add(input);
            await db.SaveChangesAsync();
            return Results.Ok(input);
        });

        adminGroup.MapPut("/trends/admin/{id:guid}", async (ApplicationDbContext db, Guid id, Cokee.MicroBlog.Domain.Entities.Trend input) =>
        {
            var trend = await db.Trends.FindAsync(id);
            if (trend == null)
            {
                // Dynamic trend pinning logic (promotes to DB)
                input.Id = Guid.NewGuid();
                db.Trends.Add(input);
            }
            else
            {
                trend.Name = input.Name.StartsWith("#") ? input.Name : "#" + input.Name;
                trend.Category = string.IsNullOrEmpty(input.Category) ? "自定义" : input.Category;
                trend.PostCount = input.PostCount;
                trend.IsActive = input.IsActive;
            }
            await db.SaveChangesAsync();
            return Results.Ok(trend ?? input);
        });

        adminGroup.MapDelete("/trends/admin/{id:guid}", async (ApplicationDbContext db, Guid id) =>
        {
            var trend = await db.Trends.FindAsync(id);
            if (trend != null)
            {
                db.Trends.Remove(trend);
                await db.SaveChangesAsync();
                return Results.Ok();
            }
            return Results.NotFound();
        });

        // Combined Posts & Comments endpoints for Admin
        adminGroup.MapGet("/admin/posts", async (ApplicationDbContext db, string? type) =>
        {
            var query = db.Posts.Include(p => p.User).AsQueryable();
            if (type == "comment")
            {
                query = query.Where(p => p.ParentPostId != null);
            }
            else if (type == "post")
            {
                query = query.Where(p => p.ParentPostId == null);
            }
            var posts = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
            return Results.Ok(posts.Select(p => new
            {
                p.Id,
                p.Content,
                p.CreatedAt,
                p.RetweetOriginalPostId,
                p.ParentPostId,
                p.LikeCount,
                p.ViewCount,
                p.Type,
                p.ImageUrls,
                AuthorDisplayName = p.User?.DisplayName,
                AuthorUsername = p.User?.Username,
                ReplyCount = db.Posts.Count(r => r.ParentPostId == p.Id),
                RetweetCount = db.Posts.Count(r => r.RetweetOriginalPostId == p.Id)
            }));
        });

        adminGroup.MapPut("/admin/posts/{id:guid}", async (ApplicationDbContext db, Guid id, Cokee.MicroBlog.Domain.Entities.Post input) =>
        {
            var post = await db.Posts.FindAsync(id);
            if (post == null) return Results.NotFound();

            post.Content = input.Content;
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        adminGroup.MapDelete("/admin/posts/{id:guid}", async (ApplicationDbContext db, Guid id) =>
        {
            var post = await db.Posts.FindAsync(id);
            if (post == null) return Results.NotFound();

            // Delete interactions / child posts sequentially using cascaded or manual removes
            var childPosts = await db.Posts.Where(p => p.ParentPostId == id || p.RetweetOriginalPostId == id).ToListAsync();
            db.Posts.RemoveRange(childPosts);
            var interactions = await db.Interactions.Where(i => i.PostId == id).ToListAsync();
            db.Interactions.RemoveRange(interactions);

            db.Posts.Remove(post);
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        // User CRUD specifics for Admin
        adminGroup.MapPost("/users", async (ApplicationDbContext db, Cokee.MicroBlog.Domain.Entities.User input) =>
        {
            if (string.IsNullOrWhiteSpace(input.Username) || string.IsNullOrWhiteSpace(input.Email) || string.IsNullOrWhiteSpace(input.PasswordHash))
                return Results.BadRequest(new { message = "用户名、邮箱和密码不能为空" });

            if (await db.Users.AnyAsync(u => u.Username == input.Username))
                return Results.BadRequest(new { message = "用户名已存在" });

            if (await db.Users.AnyAsync(u => u.Email == input.Email))
                return Results.BadRequest(new { message = "邮箱已存在" });

            input.Id = Guid.NewGuid();
            input.CreatedAt = DateTime.UtcNow;
            input.PasswordHash = BCrypt.Net.BCrypt.HashPassword(input.PasswordHash);
            db.Users.Add(input);
            await db.SaveChangesAsync();
            return Results.Ok(new { id = input.Id, username = input.Username, email = input.Email });
        });

        adminGroup.MapPut("/users/{id:guid}", async (ApplicationDbContext db, Guid id, Cokee.MicroBlog.Domain.Entities.User input) =>
        {
            var user = await db.Users.FindAsync(id);
            if (user == null) return Results.NotFound(new { message = "用户不存在" });

            // Check uniqueness for username and email
            if (!string.IsNullOrWhiteSpace(input.Username) && input.Username != user.Username)
            {
                if (await db.Users.AnyAsync(u => u.Username == input.Username))
                    return Results.BadRequest(new { message = "用户名已存在" });
                user.Username = input.Username;
            }

            if (!string.IsNullOrWhiteSpace(input.Email) && input.Email != user.Email)
            {
                if (await db.Users.AnyAsync(u => u.Email == input.Email))
                    return Results.BadRequest(new { message = "邮箱已存在" });
                user.Email = input.Email;
            }

            if (!string.IsNullOrWhiteSpace(input.DisplayName))
                user.DisplayName = input.DisplayName;

            if (input.Bio != null)
                user.Bio = input.Bio;

            await db.SaveChangesAsync();
            return Results.Ok(new { message = "用户已更新" });
        });

        adminGroup.MapDelete("/users/{id:guid}", async (ApplicationDbContext db, Guid id) =>
        {
            var user = await db.Users.FindAsync(id);
            if (user == null) return Results.NotFound();

            db.Users.Remove(user);
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        adminGroup.MapGet("/admin/docker-status", async () =>
        {
            try
            {
                using var client = new DockerClientConfiguration(new Uri("unix:///var/run/docker.sock")).CreateClient();
                var containers = await client.Containers.ListContainersAsync(new ContainersListParameters() { All = true });

                return Results.Ok(containers.Select(c => new
                {
                    Id = c.ID.Substring(0, 12),
                    Names = c.Names.FirstOrDefault()?.TrimStart('/'),
                    Image = c.Image,
                    State = c.State,
                    Status = c.Status,
                    Ports = c.Ports.Select(p => new { p.PublicPort, p.PrivatePort, p.Type })
                }));
            }
            catch (Exception ex)
            {
                return Results.Problem($"Failed to connect to Docker socket: {ex.Message}");
            }
        });
    }
}
