using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cokee.MicroBlog.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReplyPermission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReplyPermission",
                table: "Posts",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReplyPermission",
                table: "Posts");
        }
    }
}
