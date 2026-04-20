using System;
using System.Collections.Generic;

namespace Cokee.MicroBlog.Domain.Entities
{
    public enum PostType
    {
        ShortTweet,  // 短推文（含图片网格）
        Article      // 长文章（Markdown/富文本）
    }

    public enum PostVisibility
    {
        Public,
        FollowersOnly,
        MutualFollowersOnly, // 好友圈
        Private
    }

    public enum ReplyPermission
    {
        Everyone,
        FollowingOnly,
        MentionedOnly
    }

    public enum InteractionType
    {
        Like,
        Retweet,
        Quote
    }

    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public string? CoverUrl { get; set; }
        public bool IsAdmin { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Post> Posts { get; set; } = new List<Post>();
        public ICollection<Interaction> Interactions { get; set; } = new List<Interaction>();

        // 分别映射关注者和被关注者
        public ICollection<Follow> Followers { get; set; } = new List<Follow>();
        public ICollection<Follow> Following { get; set; } = new List<Follow>();
    }

    public class Post
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public string Content { get; set; } = string.Empty;
        public PostType Type { get; set; } = PostType.ShortTweet;

        // MySQL 8.0+ 可以使用 JSON 字段存储图片列表
        public List<string> ImageUrls { get; set; } = new List<string>();

        // 线程化回复 / 引用支持
        public Guid? ParentPostId { get; set; }
        public Post? ParentPost { get; set; }
        public ICollection<Post> Replies { get; set; } = new List<Post>();

        // 转发支持
        public Guid? RetweetOriginalPostId { get; set; }
        public Post? RetweetOriginalPost { get; set; }

        // 权限与数据统计
        public PostVisibility Visibility { get; set; } = PostVisibility.Public;
        public ReplyPermission ReplyPermission { get; set; } = ReplyPermission.Everyone;
        public int ViewCount { get; set; } = 0;
        public int LikeCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Interaction> Interactions { get; set; } = new List<Interaction>();
        public ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();
    }

    public class Interaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid PostId { get; set; }
        public Post Post { get; set; } = null!;

        public InteractionType Type { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Follow
    {
        public Guid FollowerId { get; set; }
        public User Follower { get; set; } = null!;

        public Guid FolloweeId { get; set; }
        public User Followee { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Bookmark
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid PostId { get; set; }
        public Post Post { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Trend
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty; // e.g. "#HelloWorld"
        public string Category { get; set; } = "General";
        public int PostCount { get; set; } = 0;
        public int SortOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
