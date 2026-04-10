-- ==========================================
-- Cokee.MicroBlog 数据库初始化脚本（与当前后端模型对齐）
-- 适用数据库: MySQL 8.0+
-- ==========================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `CokeeMicroBlog`
    DEFAULT CHARACTER SET `utf8mb4`
    COLLATE `utf8mb4_unicode_ci`;

USE `CokeeMicroBlog`;

-- 允许重复执行：先删表再建表
DROP TABLE IF EXISTS `Interactions`;
DROP TABLE IF EXISTS `Follows`;
DROP TABLE IF EXISTS `Posts`;
DROP TABLE IF EXISTS `Users`;

-- ==========================================
-- 1. Users
-- 对齐实体: User (包含登录必需字段 Email / PasswordHash)
-- ==========================================
CREATE TABLE `Users` (
        `Id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
        `Username` VARCHAR(50) NOT NULL COMMENT '唯一用户名',
        `Email` VARCHAR(255) NOT NULL COMMENT '登录邮箱',
        `PasswordHash` LONGTEXT NOT NULL COMMENT '密码哈希或示例明文（开发环境）',
        `DisplayName` VARCHAR(100) NOT NULL COMMENT '显示昵称',
        `Bio` VARCHAR(500) NULL COMMENT '个人简介',
        `AvatarUrl` LONGTEXT NULL COMMENT '头像链接',
        `CreatedAt` DATETIME(6) NOT NULL COMMENT '创建时间(UTC)',
        PRIMARY KEY (`Id`),
        UNIQUE KEY `UX_Users_Username` (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. Posts
-- 对齐实体: Post（无 IsDeleted 字段）
-- ==========================================
CREATE TABLE `Posts` (
        `Id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
        `UserId` CHAR(36) NOT NULL COMMENT '作者用户ID',
        `Content` LONGTEXT NOT NULL COMMENT '正文',
        `Type` TINYINT NOT NULL DEFAULT 0 COMMENT '0=ShortTweet, 1=Article',
        `ImageUrls` JSON NOT NULL COMMENT '图片链接数组',
        `ParentPostId` CHAR(36) NULL COMMENT '父贴ID(回复链)',
        `CreatedAt` DATETIME(6) NOT NULL COMMENT '创建时间(UTC)',
        PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Posts_Users_UserId`
            FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
        CONSTRAINT `FK_Posts_Posts_ParentPostId`
            FOREIGN KEY (`ParentPostId`) REFERENCES `Posts` (`Id`) ON DELETE SET NULL,
        INDEX `IX_Posts_UserId_CreatedAt` (`UserId`, `CreatedAt` DESC),
        INDEX `IX_Posts_ParentPostId` (`ParentPostId`),
        INDEX `IX_Posts_CreatedAt` (`CreatedAt` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. Interactions
-- 对齐实体: Interaction
-- ==========================================
CREATE TABLE `Interactions` (
        `Id` CHAR(36) NOT NULL COMMENT 'UUID 主键',
        `UserId` CHAR(36) NOT NULL COMMENT '发起互动的用户ID',
        `PostId` CHAR(36) NOT NULL COMMENT '被互动的帖子ID',
        `Type` TINYINT NOT NULL COMMENT '0=Like, 1=Retweet, 2=Quote',
        `CreatedAt` DATETIME(6) NOT NULL COMMENT '创建时间(UTC)',
        PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Interactions_Users_UserId`
            FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
        CONSTRAINT `FK_Interactions_Posts_PostId`
            FOREIGN KEY (`PostId`) REFERENCES `Posts` (`Id`) ON DELETE CASCADE,
        UNIQUE KEY `UX_Interactions_User_Post_Type` (`UserId`, `PostId`, `Type`),
        INDEX `IX_Interactions_PostId` (`PostId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. Follows
-- 对齐实体: Follow（复合主键）
-- ==========================================
CREATE TABLE `Follows` (
        `FollowerId` CHAR(36) NOT NULL COMMENT '关注者ID',
        `FolloweeId` CHAR(36) NOT NULL COMMENT '被关注者ID',
        `CreatedAt` DATETIME(6) NOT NULL COMMENT '创建时间(UTC)',
        PRIMARY KEY (`FollowerId`, `FolloweeId`),
        CONSTRAINT `FK_Follows_Users_FollowerId`
            FOREIGN KEY (`FollowerId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
        CONSTRAINT `FK_Follows_Users_FolloweeId`
            FOREIGN KEY (`FolloweeId`) REFERENCES `Users` (`Id`) ON DELETE NO ACTION,
        INDEX `IX_Follows_FolloweeId_CreatedAt` (`FolloweeId`, `CreatedAt` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
