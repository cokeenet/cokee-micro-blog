namespace Cokee.MicroBlog.Application.DTOs.Auth;

public class ChangePasswordDto
{
    public string OldPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
