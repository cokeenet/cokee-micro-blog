import { Avatar, Button, Dropdown } from '@heroui/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { PostDetailSkeleton } from '../components/PostSkeleton';
import { fetchWithAuth } from '../config/api';
import { motion } from 'framer-motion';

export default function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            setIsLoading(true);
            try {
                // Modified to use fetchWithAuth automatically handling jwt credentials
                const [postRes, commentsRes] = await Promise.all([
                    fetchWithAuth(`/api/posts/${id}`),
                    fetchWithAuth(`/api/posts/${id}/comments`)
                ]);

                if (postRes.ok) setPost(await postRes.json());
                if (commentsRes.ok) setComments(await commentsRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchPostAndComments();
    }, [id]);

    const handleReply = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!replyContent.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetchWithAuth(`/api/posts`, {
                method: 'POST',
                body: JSON.stringify({
                    content: replyContent,
                    type: 0,
                    parentPostId: id
                })
            });

            if (res.ok) {
                const newComment = await res.json();
                setComments(prev => [newComment, ...prev]); // Prepend to show at top
                setReplyContent('');
            }
        } catch (err) {
            alert('回复失败，请重试');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleLike = async (postId: string, currentState: boolean) => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Optimistic update
        setPost((prev: any) => ({
            ...prev,
            isLikedByMe: !currentState,
            likeCount: (prev.likeCount || 0) + (currentState ? -1 : 1)
        }));

        try {
            await fetchWithAuth(`/api/posts/${postId}/like`, { method: currentState ? 'DELETE' : 'POST' });
        } catch {
            // Revert on failure
            setPost((prev: any) => ({
                ...prev,
                isLikedByMe: currentState,
                likeCount: (prev.likeCount || 0) + (currentState ? 1 : -1)
            }));
        }
    };

    const handleToggleRetweet = async (postId: string) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            await fetchWithAuth(`/api/posts/${postId}/retweet`, { method: 'POST' });
            setPost((prev: any) => ({
                ...prev,
                retweetCount: (prev.retweetCount || 0) + 1
            }));
        } catch { }
    };

    if (isLoading) {
        return (
            <section className="app-page-enter max-w-2xl mx-auto border-x border-outline-variant/60 min-h-screen bg-surface">
                <header className="sticky top-0 z-20 flex items-center gap-6 border-b border-outline-variant/60 glass-panel px-4 py-3 cursor-pointer" onClick={() => navigate(-1)}>
                    <button className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-extrabold text-on-surface">帖子详情</h1>
                </header>
                <PostDetailSkeleton />
            </section>
        );
    }

    if (!post && !isLoading) {
        return <div className="p-8 text-center text-on-surface-variant flex items-center justify-center">帖子未找到或已被删除</div>;
    }

    return (
        <section className="app-page-enter max-w-2xl mx-auto border-x border-outline-variant/60 min-h-screen bg-surface">
            {/* Header */}
            <header className="sticky top-0 z-20 flex items-center gap-6 border-b border-outline-variant/60 glass-panel px-4 py-3 cursor-pointer" onClick={() => navigate(-1)}>
                <button className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-extrabold text-on-surface">帖子详情</h1>
            </header>

            {/* Main Post */}
            <article className="p-4 cursor-default pointer-events-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-3 items-center">
                        <Avatar size="md">
                            <Avatar.Image src={post.authorAvatarUrl || undefined} />
                            <Avatar.Fallback>{(post.authorDisplayName || post.authorUsername.replace('@', '')).charAt(0).toUpperCase()}</Avatar.Fallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-bold text-on-surface leading-tight text-[15px]">{post.authorDisplayName || post.authorUsername.replace('@', '')}</span>
                            <span className="text-on-surface-variant text-sm">{post.authorUsername}</span>
                        </div>
                    </div>
                    <Dropdown>
                        <Button
                            variant="ghost"
                            className="text-on-surface-variant min-w-0 px-2 rounded-full border-none h-auto bg-transparent hover:bg-on-surface/5"
                        >
                            <span className="material-symbols-outlined">more_horiz</span>
                        </Button>
                        <Dropdown.Popover>
                            <Dropdown.Menu aria-label="帖子操作">
                                <Dropdown.Item id="follow">
                                    关注 @{post.authorUsername.replace('@', '')}
                                </Dropdown.Item>
                                <Dropdown.Item id="report">
                                    举报此帖子
                                </Dropdown.Item>
                                {user?.username === post.authorUsername.replace('@', '') && (
                                    <Dropdown.Item id="delete" className="text-danger">
                                        删除
                                    </Dropdown.Item>
                                )}
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                </div>

                <div className="mb-2">
                    <button className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
                        <span className="material-symbols-outlined text-[16px]">translate</span>
                        显示翻译
                    </button>
                </div>

                <p className="text-on-surface mt-1 leading-relaxed whitespace-pre-wrap text-[17px] mb-4">{post.content}</p>

                {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className={`mt-3 grid gap-2 mb-4 ${post.imageUrls.length === 1 ? 'grid-cols-1' : post.imageUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
                        {post.imageUrls.map((url: string, i: number) => (
                            <div key={i} className={`overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-variant ${post.imageUrls.length === 3 && i === 0 ? 'col-span-2' : ''}`}>
                                <img src={url} alt={`post image ${i}`} className="object-cover w-full h-full" loading="lazy" />
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-on-surface-variant text-sm py-4">
                    {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} · <span className="font-bold text-on-surface">{post.viewCount || 0}</span> 查看
                </div>

                <div className="border-t border-outline-variant/60"></div>

                {/* Interaction Stats */}
                <div className="flex justify-between items-center py-3 text-on-surface-variant flex-wrap gap-2">
                    <button className="flex items-center gap-1.5 group hover:text-primary transition-colors focus:outline-none flex-1 justify-center sm:justify-start">
                        <span className="material-symbols-outlined text-[20px] group-hover:bg-primary/10 p-2 -ml-2 rounded-full transition-colors">chat_bubble</span>
                        <span className="text-[13px]">{comments.length}</span>
                    </button>

                    <button
                        className="flex items-center gap-1.5 group focus:outline-none flex-1 justify-center sm:justify-start"
                        onClick={(e) => { e.stopPropagation(); handleToggleRetweet(id!); }}
                    >
                        <span className="material-symbols-outlined text-[20px] group-hover:text-emerald-500 group-hover:bg-emerald-500/10 p-2 -ml-2 rounded-full transition-colors">repeat</span>
                        <span className="text-[13px] group-hover:text-emerald-500">{post.retweetCount || 0}</span>
                    </button>

                    <button
                        className={`flex items-center gap-1.5 group focus:outline-none flex-1 justify-center sm:justify-start ${post.isLikedByMe ? 'text-rose-500' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleToggleLike(id!, !!post.isLikedByMe); }}
                    >
                        <div className="relative flex items-center justify-center p-2 -ml-2 rounded-full transition-colors group-hover:bg-rose-500/10">
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

                    <button className="flex items-center gap-1.5 group hover:text-primary transition-colors focus:outline-none flex-1 justify-center sm:justify-start">
                        <span className="material-symbols-outlined text-[20px] group-hover:bg-primary/10 p-2 -ml-2 rounded-full transition-colors">bookmark</span>
                        <span className="text-[13px]">0</span>
                    </button>

                    <button className="flex items-center gap-1.5 group hover:text-primary transition-colors focus:outline-none flex-1 justify-end">
                        <span className="material-symbols-outlined text-[20px] group-hover:bg-primary/10 p-2 -ml-2 rounded-full transition-colors">upload</span>
                    </button>
                </div>

                <div className="border-t border-outline-variant/60"></div>
            </article>

            {/* Reply Composer */}
            {user ? (
                <div className="px-4 py-2 border-b border-outline-variant/60 flex items-center gap-3">
                    <Avatar size="sm" className="shrink-0">
                        <Avatar.Image src={user.avatarUrl || undefined} />
                        <Avatar.Fallback>{(user.displayName || user.username).charAt(0).toUpperCase()}</Avatar.Fallback>
                    </Avatar>
                    <div className="flex-1 flex items-center bg-transparent">
                        <input
                            type="text"
                            placeholder="发布你的回复"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="w-full bg-transparent border-none text-[15px] outline-none placeholder:text-on-surface-variant flex-1 h-10"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleReply();
                            }}
                        />
                        <Button
                            className="bg-[#1d9bf0] text-white rounded-full font-bold px-4 h-8 min-w-16 ml-2"
                            isDisabled={!replyContent.trim() || submitting}
                            onPress={handleReply}
                            size="sm"
                        >
                            {submitting ? '发送' : '回复'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="p-6 text-center text-on-surface-variant border-b border-outline-variant/60 cursor-pointer hover:bg-surface-variant/20 transition-colors" onClick={() => navigate('/login')}>
                    登录以参与交流
                </div>
            )}

            {/* Comments List */}
            <div className="divide-y divide-outline-variant/60 pb-16">
                {comments.map((comment) => (
                    <article key={comment.id} className="p-4 hover:bg-white/45 dark:hover:bg-white/5 transition-colors cursor-pointer app-page-enter">
                        <div className="flex gap-3">
                            <Avatar size="sm" className="shrink-0 mt-1">
                                <Avatar.Image src={comment.authorAvatarUrl || undefined} />
                                <Avatar.Fallback>{(comment.authorDisplayName || comment.authorUsername.replace('@', '')).charAt(0).toUpperCase()}</Avatar.Fallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <span className="font-bold text-on-surface truncate">{comment.authorDisplayName || comment.authorUsername.replace('@', '')}</span>
                                        <span className="text-on-surface-variant text-[15px] truncate">
                                            {comment.authorUsername} · {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <Dropdown>
                                        <Button
                                            variant="ghost"
                                            className="text-on-surface-variant min-w-0 px-1 ml-2 rounded-full border-none h-auto bg-transparent hover:bg-on-surface/10 hover:text-primary transition-colors shrink-0 aspect-square"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                                        </Button>
                                        <Dropdown.Popover>
                                            <Dropdown.Menu aria-label="评论菜单">
                                                <Dropdown.Item id="reply" textValue="Reply">
                                                    回复此评论
                                                </Dropdown.Item>
                                                <Dropdown.Item id="report" textValue="Report">
                                                    举报
                                                </Dropdown.Item>
                                                {user?.username === comment.authorUsername.replace('@', '') && (
                                                    <Dropdown.Item id="delete" textValue="Delete" className="text-danger">
                                                        删除
                                                    </Dropdown.Item>
                                                )}
                                            </Dropdown.Menu>
                                        </Dropdown.Popover>
                                    </Dropdown>
                                </div>
                                <p className="text-[15px] text-on-surface leading-relaxed whitespace-pre-wrap mt-0.5">{comment.content}</p>

                                <div className="flex justify-between items-center mt-3 text-on-surface-variant max-w-[425px]">
                                    <button className="flex items-center gap-1.5 group hover:text-primary transition-colors focus:outline-none">
                                        <span className="material-symbols-outlined text-[18px] group-hover:bg-primary/10 p-1.5 -ml-1.5 rounded-full transition-colors">chat_bubble</span>
                                        <span className="text-[13px]">{comment.repliesCount || 0}</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 group hover:text-emerald-500 transition-colors focus:outline-none">
                                        <span className="material-symbols-outlined text-[18px] group-hover:bg-emerald-500/10 p-1.5 -ml-1.5 rounded-full transition-colors">repeat</span>
                                        <span className="text-[13px]">{comment.retweetCount || 0}</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 group hover:text-rose-500 transition-colors focus:outline-none">
                                        <span className="material-symbols-outlined text-[18px] group-hover:bg-rose-500/10 p-1.5 -ml-1.5 rounded-full transition-colors">favorite</span>
                                        <span className="text-[13px]">{comment.likeCount || 0}</span>
                                    </button>
                                    <button className="flex items-center gap-1.5 group hover:text-primary transition-colors focus:outline-none">
                                        <span className="material-symbols-outlined text-[18px] group-hover:bg-primary/10 p-1.5 -ml-1.5 rounded-full transition-colors">upload</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}