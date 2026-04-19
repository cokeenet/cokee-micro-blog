using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Cokee.MicroBlog.Application.DTOs.Auth;
using Cokee.MicroBlog.Domain.Entities;
using Cokee.MicroBlog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Cokee.MicroBlog.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app, string secretKey)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/register", async (ApplicationDbContext db, RegisterDto dto) =>
        {
            if (await db.Users.AnyAsync(u => u.Username == dto.Username || u.Email == dto.Email))
                return Results.BadRequest(new { code = 400, message = "用户名或邮箱已存在" });

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                DisplayName = string.IsNullOrEmpty(dto.DisplayName) ? dto.Username : dto.DisplayName,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return Results.Ok(new { code = 200, message = "注册成功" });
        });

        group.MapPost("/login", async (ApplicationDbContext db, LoginDto login) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Username == login.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(login.Password, user.PasswordHash))
                return Results.Json(new { code = 401, message = "用户名或密码错误" }, statusCode: 401);

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(secretKey);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username)
            };
            if (user.IsAdmin)
                claims.Add(new Claim("IsAdmin", "true"));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return Results.Ok(new
            {
                code = 200,
                token = tokenHandler.WriteToken(token),
                user = new { user.Id, user.Username, user.DisplayName, user.AvatarUrl }
            });
        });
    }
}
