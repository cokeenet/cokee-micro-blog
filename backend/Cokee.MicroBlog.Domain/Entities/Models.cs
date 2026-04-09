using System;
using System.Collections.Generic;

namespace Cokee.MicroBlog.Domain.Entities
{
    public enum PostType
    {
        ShortTweet,  // 短推文（含图片网格）
        Article      // 长文章（Markdown/富文本）
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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Interaction> Interactions { get; set; } = new List<Interaction>();
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
}
