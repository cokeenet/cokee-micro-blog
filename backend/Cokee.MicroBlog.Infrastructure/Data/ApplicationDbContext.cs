using Cokee.MicroBlog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cokee.MicroBlog.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Post> Posts => Set<Post>();
        public DbSet<Interaction> Interactions => Set<Interaction>();
        public DbSet<Follow> Follows => Set<Follow>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Fluent API configurations mapped directly to our designed optimal SQL schema

            // 1. User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).HasMaxLength(50).IsRequired();
                entity.HasIndex(e => e.Username).IsUnique(); // UX_Users_Username
                entity.Property(e => e.DisplayName).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Bio).HasMaxLength(500);
            });

            // 2. Post
            modelBuilder.Entity<Post>(entity =>
            {
                entity.HasKey(e => e.Id);

                // One-to-many: User -> Posts
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Posts)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Self-referencing: Post -> Replies (Threaded)
                entity.HasOne(e => e.ParentPost)
                      .WithMany(p => p.Replies)
                      .HasForeignKey(e => e.ParentPostId)
                      .OnDelete(DeleteBehavior.ClientSetNull);

                // EF Core 8.0+ support mapping to JSON for arrays of primitives
                // e.g., storing ImageUrls array into MySQL JSON type directly
                entity.Property(e => e.ImageUrls).HasColumnType("json");

                // Indexes mapped
                entity.HasIndex(p => new { p.UserId, p.CreatedAt }).IsDescending(false, true); // IX_Posts_UserId_CreatedAt
                entity.HasIndex(p => p.ParentPostId); // IX_Posts_ParentPostId
                entity.HasIndex(p => p.CreatedAt).IsDescending(); // IX_Posts_CreatedAt
            });

            // 3. Interaction
            modelBuilder.Entity<Interaction>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Interactions)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Post)
                      .WithMany(p => p.Interactions)
                      .HasForeignKey(e => e.PostId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Unique interaction constraint (Anti-Spam)
                entity.HasIndex(e => new { e.UserId, e.PostId, e.Type }).IsUnique();
            });

            // 4. Follow (Composite Key)
            modelBuilder.Entity<Follow>(entity =>
            {
                entity.HasKey(f => new { f.FollowerId, f.FolloweeId }); // Primary Key

                // Configuration for the follower
                entity.HasOne(f => f.Follower)
                      .WithMany(u => u.Following)
                      .HasForeignKey(f => f.FollowerId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Configuration for the followee
                entity.HasOne(f => f.Followee)
                      .WithMany(u => u.Followers)
                      .HasForeignKey(f => f.FolloweeId)
                      .OnDelete(DeleteBehavior.ClientCascade); // Prevent cyclical cascade paths in EF Core

                // Helper index for inverse query
                entity.HasIndex(f => new { f.FolloweeId, f.CreatedAt }).IsDescending(false, true);
            });
        }
    }
}
