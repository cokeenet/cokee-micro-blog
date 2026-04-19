using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Cokee.MicroBlog.Domain.Entities;
using Cokee.MicroBlog.Infrastructure.Data;
using Cokee.MicroBlog.Api.Endpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MySqlConnector;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var connectionString = builder.Configuration.GetConnectionString("localdb");

// 2. 如果没读到，直接读取 Azure 的原生环境变量 MYSQLCONNSTR_localdb
if (string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = Environment.GetEnvironmentVariable("MYSQLCONNSTR_localdb");
    connectionString = connectionString?.Replace(':', ',');
}

// 3. 如果还是空的，读取 Azure MySQL In-App 的物理文本文件
if (string.IsNullOrWhiteSpace(connectionString))
{
    // 使用 %HOME% 环境变量兼容 C:\home 或 D:\home Environment.GetEnvironmentVariable("HOME") ??
    var homePath = @"C:\home";
    var txtFilePath = Path.Combine(homePath, @"data\mysql\MYSQLCONNSTR_localdb.txt");

    if (File.Exists(txtFilePath))
    {
        // 读取文件内容并去掉多余的换行/空格
        connectionString = File.ReadAllText(txtFilePath).Trim();
    }
}
// 4. 如果读到了字符串，执行你的自定义处理逻辑
if (!string.IsNullOrWhiteSpace(connectionString))
{
    // 【注意】如果你用的是 MySQL，连接字符串里写端口通常是 "Port=3306" 格式。
    // 如果 txt 里的内容类似 "Data Source=127.0.0.1:55553"，替换成逗号(,)可能并不被 MySQLConnector 支持。
    // 如果连接依然报错，请检查这一行 Replace 逻辑。
    connectionString = connectionString.Replace(':', ',');
}

// 5. 安全检查：如果还是空的，直接报错拦截
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("connectionString Notfound: 未找到数据库连接字符串！请检查 appsettings.json、环境变量或 MYSQLCONNSTR_localdb.txt 文件。");
}
// 注册 DbContext
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
            .WithOrigins(
                "http://localhost:5173", "http://127.0.0.1:5173",
                "http://localhost:5176", "http://127.0.0.1:5176",
                "http://localhost:80", "http://127.0.0.1:80",
                "http://localhost:8088", "http://127.0.0.1:8088",
                "http://localhost"
            )
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

// app.UseHttpsRedirection(); // Disable inside Docker to prevent breaking non-HTTPS proxy requests
app.UseStaticFiles();
//app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints(secretKey);
app.MapPostEndpoints();
app.MapSocialEndpoints();
app.MapUserEndpoints();
app.MapAdminEndpoints();

app.Run();

