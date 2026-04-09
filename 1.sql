-- ==========================================
-- Cokee.MicroBlog 核心数据库初始化脚本
-- 适用数据库: MySQL 8.0+
-- ==========================================

-- 创建数据库并指定字符集为 utf8mb4 (完美支持 Emoji 和多语言)
CREATE DATABASE IF NOT EXISTS `CokeeMicroBlog`
  DEFAULT CHARACTER SET `utf8mb4`
  COLLATE `utf8mb4_unicode_ci`;

USE `CokeeMicroBlog`;

-- ==========================================
-- 1. Users 表 (用户基础信息)
-- ==========================================
CREATE TABLE `Users` (
    `Id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `Username` VARCHAR(50) NOT NULL COMMENT '唯一用户名 (如 @cokee_dev)',
    `DisplayName` VARCHAR(100) NOT NULL COMMENT '显示昵称',
    `Bio` VARCHAR(500) NULL COMMENT '个人主页简介',
    `AvatarUrl` VARCHAR(500) NULL COMMENT '头像图片链接',
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '账号创建时间',
    PRIMARY KEY (`Id`),
    UNIQUE KEY `UX_Users_Username` (`Username`) -- 保证用户名全局唯一
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. Posts 表 (推文与长文章)
-- 包含自引用设计以支持线索回复 (Threaded Replies)
-- ==========================================
CREATE TABLE `Posts` (
    `Id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `UserId` CHAR(36) NOT NULL COMMENT '发帖人ID',
    `Content` LONGTEXT NOT NULL COMMENT '推文或文章内容(文本/Markdown等)',
    `Type` TINYINT NOT NULL DEFAULT 0 COMMENT '0=ShortTweet(短文), 1=Article(长文)',
    `ImageUrls` JSON NULL COMMENT '图片链接数组 ["url1", "url2"]',
    `ParentPostId` CHAR(36) NULL COMMENT '父推文ID(用于回复/评论，空为独立推文)',
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '发帖时间',
    `IsDeleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '软删除标记 (0=正常, 1=已删除)',
    PRIMARY KEY (`Id`),
    
    -- 外键约束
    CONSTRAINT `FK_Posts_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Posts_Posts_ParentPostId` FOREIGN KEY (`ParentPostId`) REFERENCES `Posts` (`Id`) ON DELETE SET NULL,
    
    -- 核心查询索引
    INDEX `IX_Posts_UserId_CreatedAt` (`UserId`, `CreatedAt` DESC), -- 用户主页时间线索引
    INDEX `IX_Posts_ParentPostId` (`ParentPostId`),                 -- 回复树展开索引
    INDEX `IX_Posts_CreatedAt` (`CreatedAt` DESC)                   -- 全局公开时间线索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. Interactions 表 (互动：点赞, 转推, 引用)
-- 分离高频写操作，缓解并发时的行锁竞争
-- ==========================================
CREATE TABLE `Interactions` (
    `Id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
    `UserId` CHAR(36) NOT NULL COMMENT '发起互动的用户ID',
    `PostId` CHAR(36) NOT NULL COMMENT '被互动的推文ID',
    `Type` TINYINT NOT NULL COMMENT '0=Like(点赞), 1=Retweet(转推), 2=Quote(引用)',
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '互动时间',
    PRIMARY KEY (`Id`),
    
    -- 外键约束
    CONSTRAINT `FK_Interactions_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Interactions_Posts_PostId` FOREIGN KEY (`PostId`) REFERENCES `Posts` (`Id`) ON DELETE CASCADE,
    
    -- 互动查重防刷索引 (保证一个用户对一篇文章只能有一种类型的互动一次)
    UNIQUE KEY `UX_Interactions_User_Post_Type` (`UserId`, `PostId`, `Type`),
    
    -- 反向查询索引 (查某篇推文的点赞列表)
    INDEX `IX_Interactions_PostId_Type_CreatedAt` (`PostId`, `Type`, `CreatedAt` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. Follows 表 (社交图谱：关注关系)
-- 复合主键设计，极致精简
-- ==========================================
CREATE TABLE `Follows` (
    `FollowerId` CHAR(36) NOT NULL COMMENT '粉丝ID (谁发起了关注)',
    `FolloweeId` CHAR(36) NOT NULL COMMENT '博主ID (被关注的人)',
    `CreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '关注时间',
    
    -- 复合主键，天然防重复关注，并作为正向查询索引 (查我关注了谁)
    PRIMARY KEY (`FollowerId`, `FolloweeId`),
    
    -- 外键约束
    CONSTRAINT `FK_Follows_Users_FollowerId` FOREIGN KEY (`FollowerId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_Follows_Users_FolloweeId` FOREIGN KEY (`FolloweeId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
    
    -- 辅助反向查询索引 (查谁关注了我)
    INDEX `IX_Follows_FolloweeId_CreatedAt` (`FolloweeId`, `CreatedAt` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
