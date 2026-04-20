import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@heroui/react';
import { PostCard } from '../components/PostCard';
import { useAuth } from '../hooks/useAuth';
import { fetchWithAuth } from '../config/api';

export default function BookmarksPage() {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        loadBookmarks();
    }, [page]);

    const loadBookmarks = async () => {
        if (!token) {
            navigate('/login');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetchWithAuth(`/api/posts/bookmarks?page=${page}&pageSize=${pageSize}`);
            if (res.ok) {
                const data = await res.json();
                setPosts(data.data || []);
                setHasMore((data.data || []).length === pageSize);
            } else if (res.status === 401) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleLike = async (postId: string, isCurrentlyLiked: boolean) => {
        const originalPosts = [...posts];
        setPosts(posts.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    isLikedByMe: !isCurrentlyLiked,
                    likeCount: (p.likeCount || 0) + (isCurrentlyLiked ? -1 : 1)
                };
            }
            return p;
        }));

        try {
            const res = await fetchWithAuth(`/api/posts/${postId}/like`, {
                method: isCurrentlyLiked ? 'DELETE' : 'POST'
            });
            if (!res.ok) {
                throw new Error('操作失败');
            }
        } catch (e) {
            console.error('Like failed', e);
            setPosts(originalPosts);
        }
    };

    const handleToggleBookmark = async (postId: string, isCurrentlyBookmarked: boolean) => {
        const originalPosts = [...posts];

        // 收藏页面中移除取消收藏的项目
        if (isCurrentlyBookmarked) {
            setPosts(posts.filter(p => p.id !== postId));
        } else {
            setPosts(posts.map(p => {
                if (p.id === postId) {
                    return { ...p, isBookmarkedByMe: true };
                }
                return p;
            }));
        }

        try {
            const res = await fetchWithAuth(`/api/posts/${postId}/bookmark`, {
                method: isCurrentlyBookmarked ? 'DELETE' : 'POST'
            });
            if (!res.ok) {
                throw new Error('操作失败');
            }
        } catch (e) {
            console.error('Bookmark failed', e);
            setPosts(originalPosts);
        }
    };

    const handleToggleRetweet = async (postId: string, isCurrentlyRetweeted: boolean) => {
        if (!window.confirm('确定要转发这条推文吗？')) return;

        const originalPosts = [...posts];
        setPosts(posts.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    isRetweetedByMe: !isCurrentlyRetweeted,
                    retweetCount: (p.retweetCount || 0) + (isCurrentlyRetweeted ? -1 : 1)
                };
            }
            return p;
        }));

        try {
            const res = await fetchWithAuth(`/api/posts/${postId}/retweet`, {
                method: 'POST'
            });
            if (!res.ok) {
                throw new Error('操作失败');
            }
        } catch (e) {
            console.error('Retweet failed', e);
            setPosts(originalPosts);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <Card className="sticky top-0 z-10 mb-4 bg-surface/95 backdrop-blur border-b border-outline-variant/30 rounded-none">
                <Card.Content className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold">我的收藏</h1>
                        <span className="text-sm text-muted">共 {posts.length} 条</span>
                    </div>
                </Card.Content>
            </Card>

            {/* Content */}
            <div className="space-y-1">
                {isLoading ? (
                    <div className="text-center py-12 text-muted">加载中...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 text-muted">
                        <span className="material-symbols-outlined block text-4xl mb-2 opacity-50">bookmark</span>
                        还没有收藏任何推文
                    </div>
                ) : (
                    <>
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                isOwner={false}
                                onPostAction={() => {}}
                                onToggleLike={handleToggleLike}
                                onToggleBookmark={handleToggleBookmark}
                                onToggleRetweet={(postId) => handleToggleRetweet(postId, !!post.isRetweetedByMe)}
                            />
                        ))}
                        {hasMore && (
                            <button
                                onClick={() => setPage(page + 1)}
                                className="w-full py-4 text-primary hover:bg-surface-secondary transition-colors"
                            >
                                加载更多
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
