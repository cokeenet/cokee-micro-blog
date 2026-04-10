using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Cokee.MicroBlog.Domain.Entities;
using Cokee.MicroBlog.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MySqlConnector;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

// ----------------- JWT AUTHENTICATION -----------------
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings.GetValue<string>("Key") ?? "super_secret_fallback_key_for_dev_only_1234567890";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Dev environment
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();

// ----------------- CORS -----------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

var app = builder.Build();

// Bootstrap local database in development so first run does not fail on missing DB.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    if (!string.IsNullOrWhiteSpace(connectionString))
    {
        var csb = new MySqlConnectionStringBuilder(connectionString);
        var databaseName = csb.Database;
        csb.Database = string.Empty;

        await using var conn = new MySqlConnection(csb.ConnectionString);
        await conn.OpenAsync();

        await using var cmd = conn.CreateCommand();
        cmd.CommandText = $"CREATE DATABASE IF NOT EXISTS `{databaseName}`";
        await cmd.ExecuteNonQueryAsync();
    }

    await db.Database.EnsureCreatedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// ----------------- AUTH ENDPOINTS -----------------
app.MapPost("/api/auth/register", async (ApplicationDbContext db, User dto) =>
{
    if (await db.Users.AnyAsync(u => u.Username == dto.Username || u.Email == dto.Email))
        return Results.BadRequest(new { message = "字符或邮箱已存在" });

    // In a real app, hash password: BCrypt.Net.BCrypt.HashPassword(dto.PasswordHash)
    var user = new User
    {
        Username = dto.Username,
        Email = dto.Email,
        DisplayName = string.IsNullOrEmpty(dto.DisplayName) ? dto.Username : dto.DisplayName,
        PasswordHash = dto.PasswordHash // For demo, assuming clear text / pre-hashed. We will simplify.
    };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    return Results.Ok(new { message = "注册成功" });
});



app.MapPost("/api/auth/login", async (ApplicationDbContext db, LoginDto login) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.Username == login.Username && u.PasswordHash == login.Password);
    if (user == null) return Results.Unauthorized();

    var tokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.UTF8.GetBytes(secretKey);
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username)
        }),
        Expires = DateTime.UtcNow.AddDays(7),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };
    var token = tokenHandler.CreateToken(tokenDescriptor);

    return Results.Ok(new
    {
        token = tokenHandler.WriteToken(token),
        user = new { user.Id, user.Username, user.DisplayName, user.AvatarUrl }
    });
});

// ----------------- TIMELINE ENDPOINTS -----------------
app.MapGet("/api/posts", async (ApplicationDbContext db) =>
{
    var posts = await db.Posts
        .Include(p => p.User)
        .OrderByDescending(p => p.CreatedAt)
        .Take(50)
        .Select(p => new
        {
            p.Id,
            p.Content,
            AuthorUsername = "@" + p.User.Username,
            p.CreatedAt
        })
        .ToListAsync();
    return Results.Ok(posts);
});

app.MapGet("/api/posts/following", [Authorize] async (ApplicationDbContext db, ClaimsPrincipal claims) =>
{
    var userIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        return Results.Unauthorized();

    var followingIds = await db.Follows
        .Where(f => f.FollowerId == userId)
        .Select(f => f.FolloweeId)
        .ToListAsync();

    followingIds.Add(userId); // Include self posts in following feed

    var posts = await db.Posts
        .Include(p => p.User)
        .Where(p => followingIds.Contains(p.UserId))
        .OrderByDescending(p => p.CreatedAt)
        .Take(50)
        .Select(p => new
        {
            p.Id,
            p.Content,
            AuthorUsername = "@" + p.User.Username,
            p.CreatedAt
        })
        .ToListAsync();

    return Results.Ok(posts);
});

app.MapPost("/api/posts", [Authorize] async (ApplicationDbContext db, Post post, ClaimsPrincipal claims) =>
{
    var userIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        return Results.Unauthorized();

    post.UserId = userId; // Bind the current authorized user
    post.CreatedAt = DateTime.UtcNow;

    db.Posts.Add(post);
    await db.SaveChangesAsync();

    return Results.Created($"/api/posts/{post.Id}", post);
});

// ----------------- SOCIAL GRAPH ENDPOINTS -----------------
app.MapPost("/api/users/{followeeId:guid}/follow", [Authorize] async (ApplicationDbContext db, ClaimsPrincipal claims, Guid followeeId) =>
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

app.MapDelete("/api/users/{followeeId:guid}/follow", [Authorize] async (ApplicationDbContext db, ClaimsPrincipal claims, Guid followeeId) =>
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

// ----------------- ADMIN ENDPOINTS -----------------
app.MapGet("/api/admin/stats", async (ApplicationDbContext db) =>
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

app.MapGet("/api/admin/users", async (ApplicationDbContext db) =>
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

app.MapGet("/api/users/suggestions", async (ApplicationDbContext db, ClaimsPrincipal claims) =>
{
    Guid? currentUserId = null;
    var userIdStr = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!string.IsNullOrEmpty(userIdStr) && Guid.TryParse(userIdStr, out var parsedId))
        currentUserId = parsedId;

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

app.Run();


public class LoginDto { public string Username { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }