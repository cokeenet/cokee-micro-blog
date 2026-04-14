# Cokee.MicroBlog Workspace

## Architecture
This is a monorepo containing multiple associated projects:
- `backend/`: C# .NET Web API implementing Clean Architecture with EF Core.
- `frontend/`: Modern React 19 + Vite frontend utilizing Tailwind CSS v4 and HeroUI v3.

## General Guidelines
- Check sub-folder `AGENTS.md` specifically `backend/AGENTS.md` and `frontend/AGENTS.md` for project-centric instructions.
- Ensure package manager (`npm` or `pnpm` depending on lockfile presence) is run in respective frontend directories, while `dotnet` CLI is run indicating the correct `.csproj` or `.slnx` file.
- 只能使用VSCode给你的读写文件工具；不能使用如cat,Get-Content之类的命令行读写文件工具；不能使用编程语言来更改文件；不能创建脚本来更改文件!