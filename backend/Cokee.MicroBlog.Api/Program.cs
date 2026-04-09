using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Cokee.MicroBlog.Domain.Entities;
using Cokee.MicroBlog.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(connectionString);
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

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
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
    
    return Results.Ok(new { 
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

// ----------------- ADMIN ENDPOINTS -----------------
app.MapGet("/api/admin/stats", async (ApplicationDbContext db) =>
{
    var totalUsers = await db.Users.CountAsync();
    var totalPosts = await db.Posts.CountAsync();
    var todayLogins = await db.Users.Where(u => u.CreatedAt >= DateTime.UtcNow.Date).CountAsync();
    
    return Results.Ok(new {
        TotalUsers = totalUsers,
        TotalPosts = totalPosts,
        TodayLogins = todayLogins,
        ActiveStorage = "542 GB"
    });
});

app.MapGet("/api/admin/users", async (ApplicationDbContext db) =>
{
    return Results.Ok(await db.Users.OrderByDescending(u => u.CreatedAt).Take(20).ToListAsync());
});

app.Run();


public class LoginDto { public string Username { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }