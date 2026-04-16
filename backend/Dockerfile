FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# 复制项目文件以便缓存还原层
COPY ["backend/Cokee.MicroBlog.Api/Cokee.MicroBlog.Api.csproj", "backend/Cokee.MicroBlog.Api/"]
COPY ["backend/Cokee.MicroBlog.Application/Cokee.MicroBlog.Application.csproj", "backend/Cokee.MicroBlog.Application/"]
COPY ["backend/Cokee.MicroBlog.Domain/Cokee.MicroBlog.Domain.csproj", "backend/Cokee.MicroBlog.Domain/"]
COPY ["backend/Cokee.MicroBlog.Infrastructure/Cokee.MicroBlog.Infrastructure.csproj", "backend/Cokee.MicroBlog.Infrastructure/"]
RUN dotnet restore "backend/Cokee.MicroBlog.Api/Cokee.MicroBlog.Api.csproj"

# 复制其余源代码并构建
COPY backend/ backend/
WORKDIR "/src/backend/Cokee.MicroBlog.Api"
RUN dotnet build "Cokee.MicroBlog.Api.csproj" -c Release -o /app/build

# 发布
FROM build AS publish
RUN dotnet publish "Cokee.MicroBlog.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 运行时构建最终镜像
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Cokee.MicroBlog.Api.dll"]
