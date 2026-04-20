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
// 4. 重点：清洗和转换 Azure 特殊格式的连接字符串，适配 MySqlConnector
if (!string.IsNullOrWhiteSpace(connectionString))
{
    try
    {
        // 使用 MySqlConnector 提供的类来安全修改连接字符串
        var csb = new MySqlConnectionStringBuilder(connectionString);

        // Azure 经常把端口写进 Server(Data Source) 里，如 "127.0.0.1:55553"
        // MySQL 驱动需要把它们拆开：Server="127.0.0.1", Port=55553
        if (csb.Server.Contains(":"))
        {
            var parts = csb.Server.Split(':');
            csb.Server = parts[0];
            csb.Port = uint.Parse(parts[1]);
        }

        // 重新生成标准 MySQL 格式的连接字符串
        connectionString = csb.ConnectionString;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"清洗连接字符串时发生异常: {ex.Message}");
    }
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
var secretKey = jwtSettings.GetValue<string>("Key");

if (string.IsNullOrWhiteSpace(secretKey))
{
    throw new InvalidOperationException("JWT key not configured. Please set 'Jwt:Key' in appsettings or environment variables.");
}

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

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireClaim("IsAdmin", "true"));
});

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
                "http://localhost", "https://cokee.ourcraft.club", "https://cokee-microblog.azurewebsites.net/"
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
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints(secretKey);
app.MapPostEndpoints();
app.MapSocialEndpoints();
app.MapUserEndpoints();
app.MapAdminEndpoints();

app.Run();

