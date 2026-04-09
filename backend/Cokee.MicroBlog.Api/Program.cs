using Cokee.MicroBlog.Domain.Entities;
using Cokee.MicroBlog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

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

app.MapPost("/api/posts", async (ApplicationDbContext db, Post post) =>
{
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
    var todayLogins = await db.Users.Where(u => u.CreatedAt >= DateTime.UtcNow.Date).CountAsync(); // Example

    return Results.Ok(new
    {
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
