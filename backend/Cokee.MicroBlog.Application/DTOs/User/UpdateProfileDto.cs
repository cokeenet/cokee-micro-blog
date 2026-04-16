namespace Cokee.MicroBlog.Application.DTOs.User;

public class UpdateProfileDto
{
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? CoverUrl { get; set; }
}