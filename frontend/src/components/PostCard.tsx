import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Avatar, Card } from "@heroui/react";
import { motion } from "framer-motion";
import { PostActionMenu } from "../components/PostActionMenu";

export interface PostOwner {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
}

export interface PostData {
    id: string;
    content: string;
    authorUsername: string; // usually @username
    authorDisplayName: string;
    authorAvatarUrl?: string;
    createdAt: string;
    imageUrls?: string[];
    repliesCount?: number;
    likeCount?: number;
    retweetCount?: number;
    isLikedByMe?: boolean; // We might need this for local state
    isBookmarkedByMe?: boolean;
    visibility?: string; // 'Public', 'FollowersOnly', 'MutualFollowersOnly', 'Private'
    retweetOriginalPostId?: string;
    retweetOriginalPost?: {
        id: string;
        content: string;
        authorUsername: string;
        authorDisplayName: string;
        authorAvatarUrl?: string;
        imageUrls?: string[];
    };
}

interface PostCardProps {
    post: PostData;
    isOwner: boolean;
    onNavigate?: (id: string) => void;
    onPostAction?: (key: string, postId: string) => void;
    onToggleLike?: (postId: string, isCurrentlyLiked: boolean) => void;
    onToggleRetweet?: (postId: string) => void;
    onToggleBookmark?: (postId: string, isCurrentlyBookmarked: boolean) => void;
}

export function PostCard({ post, isOwner, onNavigate, onPostAction, onToggleLike, onToggleRetweet, onToggleBookmark }: PostCardProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onNavigate) {
            onNavigate(post.id);
        } else {
            navigate(`/post/${post.id}`);
        }
    };

    const authorName = post.authorDisplayName || post.authorUsername.replace("@", "");

    const getVisibilityLabel = (visibility?: string) => {
        switch (visibility) {
            case 'FollowersOnly':
                return '仅粉丝可见';
            case 'MutualFollowersOnly':
                return '好友可见';
            case 'Private':
                return '私密';
            default:
                return null;
        }
    };

    const visibilityLabel = getVisibilityLabel(post.visibility);

    return (
        <Card
            className="w-full hover:bg-surface-secondary/50 transition-colors cursor-pointer"
            variant="default"
            onClick={handleNavigate}
        >
            <Card.Content className="pt-4 px-4 pb-0">
                {visibilityLabel && (
                    <div className="flex items-center gap-1.5 mb-3 text-xs text-muted font-medium">
                        {post.visibility === 'FollowersOnly' && <span className="material-symbols-outlined text-sm">lock</span>}
                        {post.visibility === 'MutualFollowersOnly' && <span className="material-symbols-outlined text-sm">group</span>}
                        {post.visibility === 'Private' && <span className="material-symbols-outlined text-sm">visibility_off</span>}
                        <span>{visibilityLabel}</span>
                    </div>
                )}

                {post.retweetOriginalPostId && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-muted font-medium ml-12">
                        <span className="material-symbols-outlined text-sm">repeat</span>
                        <span>{authorName} 转发了</span>
                    </div>
                )}

                <div className="flex gap-3">
                    <Avatar
                        aria-label={`${authorName}'s profile picture`}
                        className="size-10 shrink-0"
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.authorUsername.replace('@', '')}`); }}
                    >
                        <Avatar.Image src={typeof (post.authorAvatarUrl || undefined) === 'string' ? (post.authorAvatarUrl || undefined)?.replace('5253', '8080') : (post.authorAvatarUrl || undefined)} />
                        <Avatar.Fallback>{authorName.charAt(0).toUpperCase()}</Avatar.Fallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 truncate">
                                <span className="font-bold text-foreground text-base truncate">{authorName}</span>
                                <span className="text-muted text-sm flex items-center gap-1 shrink-0">
                                    <span>{post.authorUsername} · {new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                                    {post.visibility === 'FollowersOnly' && <span className="material-symbols-outlined text-[13px]" title="仅粉丝可见">lock</span>}
                                    {post.visibility === 'MutualFollowersOnly' && <span className="material-symbols-outlined text-[13px]" title="互关好友">group</span>}
                                    {post.visibility === 'Private' && <span className="material-symbols-outlined text-[13px]" title="私密">visibility_off</span>}
                                </span>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                                <PostActionMenu isOwner={isOwner} onAction={(key) => { if (key === 'edit') { navigate('/compose?edit=' + post.id, { state: { backgroundLocation: location } }); } else { onPostAction?.(String(key), post.id); } }} />
                            </div>
                        </div>

                        <p className="text-foreground mt-1 text-base leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>

                        {/* Original Post (Quote/Retweet) */}
                        {post.retweetOriginalPost && (
                            <Card
                                className="mt-3 w-full border border-border"
                                variant="transparent"
                                onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.retweetOriginalPost?.id}`); }}
                            >
                                <Card.Content className="p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-foreground text-sm truncate">
                                            {post.retweetOriginalPost.authorDisplayName || post.retweetOriginalPost.authorUsername?.replace('@', '')}
                                        </span>
                                        <span className="text-muted text-xs truncate">{post.retweetOriginalPost.authorUsername}</span>
                                    </div>
                                    <p className="text-sm text-foreground mb-2 break-words">{post.retweetOriginalPost.content}</p>

                                    {post.retweetOriginalPost.imageUrls && post.retweetOriginalPost.imageUrls.length > 0 && (
                                        <div className={`grid gap-1 ${post.retweetOriginalPost.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1 max-w-sm'}`}>
                                            {post.retweetOriginalPost.imageUrls.map((url, i) => (
                                                <div key={i} className="overflow-hidden rounded-lg border border-border/50">
                                                    <img src={typeof (url) === 'string' ? (url).replace('5253', '8080') : (url)} alt={`original post image ${i}`} className="object-cover w-full h-full max-h-40" loading="lazy" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card.Content>
                            </Card>
                        )}

                        {/* Post Images Grid */}
                        {post.imageUrls && post.imageUrls.length > 0 && (
                            <div className={`mt-3 grid gap-2 ${post.imageUrls.length === 1 ? 'grid-cols-1 max-w-lg' : post.imageUrls.length === 2 ? 'grid-cols-2' : post.imageUrls.length === 3 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                                {post.imageUrls.map((url, i) => (
                                    <div key={i} className={`overflow-hidden rounded-2xl border border-border/50 bg-surface-secondary ${post.imageUrls!.length === 3 && i === 0 ? 'col-span-2 sm:col-span-1' : ''}`}>
                                        <img src={typeof (url) === 'string' ? (url).replace('5253', '8080') : (url)} alt={`post image ${i}`} className="object-cover w-full h-full max-h-[300px]" loading="lazy" />
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            </Card.Content>

            <Card.Footer className="px-4 py-3 ml-12">
                <div className="flex justify-between w-full max-w-md text-muted">
                    <button
                        className="flex items-center gap-1.5 group hover:text-primary transition-colors focus:outline-none"
                        onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id}`); }}
                    >
                        <span className="material-symbols-outlined text-[20px] group-hover:bg-primary/10 p-1.5 -ml-1.5 rounded-full transition-colors">chat_bubble</span>
                        <span className="text-[13px]">{post.repliesCount || 0}</span>
                    </button>

                    <button
                        className="flex items-center gap-1.5 group focus:outline-none"
                        onClick={(e) => { e.stopPropagation(); onToggleRetweet?.(post.id); }}
                    >
                        <span className="material-symbols-outlined text-[20px] group-hover:text-emerald-500 group-hover:bg-emerald-500/10 p-1.5 -ml-1.5 rounded-full transition-colors">repeat</span>
                        <span className="text-[13px] group-hover:text-emerald-500">{post.retweetCount || 0}</span>
                    </button>

                    <button
                        className={`flex items-center gap-1.5 group focus:outline-none ${post.isLikedByMe ? 'text-rose-500' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onToggleLike?.(post.id, !!post.isLikedByMe); }}
                    >
                        <div className="relative flex items-center justify-center p-1.5 -ml-1.5 rounded-full transition-colors group-hover:bg-rose-500/10">
                            {post.isLikedByMe && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0 rounded-full bg-rose-500"
                                />
                            )}
                            <motion.span
                                animate={post.isLikedByMe ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`material-symbols-outlined text-[20px] relative z-10 ${post.isLikedByMe ? 'text-rose-500' : 'group-hover:text-rose-500'}`}
                                style={post.isLikedByMe ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                                favorite
                            </motion.span>
                        </div>
                        <span className={`text-[13px] ${post.isLikedByMe ? '' : 'group-hover:text-rose-500'}`}>{post.likeCount || 0}</span>
                    </button>

                    <button
                        className={`flex items-center gap-1.5 group focus:outline-none ${post.isBookmarkedByMe ? 'text-primary' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onToggleBookmark?.(post.id, !!post.isBookmarkedByMe); }}
                        title={post.isBookmarkedByMe ? "取消收藏" : "收藏"}
                    >
                        <span
                            className={`material-symbols-outlined text-[20px] group-hover:bg-primary/10 p-1.5 -ml-1.5 rounded-full transition-colors ${post.isBookmarkedByMe ? 'text-primary' : 'group-hover:text-primary'}`}
                            style={post.isBookmarkedByMe ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                            bookmark
                        </span>
                    </button>

                    <button
                        className="flex items-center gap-1.5 group hover:text-primary transition-colors focus:outline-none"
                        onClick={(e) => { e.stopPropagation(); }}
                    >
                        <span className="material-symbols-outlined text-[20px] group-hover:bg-primary/10 p-1.5 -ml-1.5 rounded-full transition-colors">share</span>
                    </button>
                </div>
            </Card.Footer>
        </Card>
    );
}





