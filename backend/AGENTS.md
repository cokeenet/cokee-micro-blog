# Backend Project Guidelines

## Code Style
- C# 13, ASP.NET Core 10 (or target runtime standard). Minimal APIs instead of Controllers.
- Utilize Clean Architecture principles: `Api`, `Application`, `Domain`, `Infrastructure`.
- Prefer file-scoped namespaces except for `Program.cs`.

## Architecture
- `Cokee.MicroBlog.Api`: Minimal API endpoints, DI registration, configuration mapping, JWT Auth.
- `Cokee.MicroBlog.Application`: Application logic (services, CQRS mediators or standard interfaces) and DTOs.
- `Cokee.MicroBlog.Domain`: Core business models (`Entities/`), enums, and exceptions. No dependencies on outer layers.
- `Cokee.MicroBlog.Infrastructure`: Database implementation such as `ApplicationDbContext`, EF Core migrations, external SDKs (MySqlConnector).

## Build and Test
- Build: `dotnet build Cokee.MicroBlog.slnx`
- Watch/Dev: `dotnet watch run --project Cokee.MicroBlog.Api/Cokee.MicroBlog.Api.csproj`
- Migrations: `dotnet ef migrations add <Name> --project Cokee.MicroBlog.Infrastructure/Cokee.MicroBlog.Infrastructure.csproj --startup-project Cokee.MicroBlog.Api/Cokee.MicroBlog.Api.csproj`
- Publish: `dotnet publish Cokee.MicroBlog.Api/Cokee.MicroBlog.Api.csproj`

## Conventions
- Return strongly typed minimal results (`Results.Ok(value)`, `Results.NotFound()`).
- Use asynchronous methods natively throughout (`async/await` and `CancellationToken`).
- Rely on constructor injection in classes, endpoint injection in Minimal APIs.