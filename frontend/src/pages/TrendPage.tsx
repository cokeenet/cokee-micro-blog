import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from '@heroui/react';
import { PostCard } from '../components/PostCard';
import { useAuth } from '../hooks/useAuth';
import { fetchWithAuth } from '../config/api';

export default function TrendPage() {
    const { hashtag } = useParams<{ hashtag: string }>();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [hasMore, setHasMore] = useState(false);
    const [trendInfo, setTrendInfo] = useState<any>(null);

    useEffect(() => {
        loadTrendPosts();
    }, [hashtag, page]);

    const loadTrendPosts = async () => {
        if (!hashtag) {
            navigate('/');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetchWithAuth(
                `/api/trends/${encodeURIComponent(hashtag)}/posts?page=${page}&pageSize=${pageSize}`
            );
            if (res.ok) {
                const data = await res.json();
                setPosts(data.data || []);
                setTrendInfo({ hashtag: data.hashtag, postCount: data.data?.length || 0 });
                setHasMore((data.data || []).length === pageSize);
            }
        } catch (error) {
            console.error('Failed to load trend posts:', error);
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
            if (!res.ok) throw new Error('操作失败');
        } catch (e) {
            console.error('Like failed', e);
            setPosts(originalPosts);
        }
    };

    const handleToggleBookmark = async (postId: string, isCurrentlyBookmarked: boolean) => {
        const originalPosts = [...posts];
        setPosts(posts.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    isBookmarkedByMe: !isCurrentlyBookmarked
                };
            }
            return p;
        }));

        try {
            const res = await fetchWithAuth(`/api/posts/${postId}/bookmark`, {
                method: isCurrentlyBookmarked ? 'DELETE' : 'POST'
            });
            if (!res.ok) throw new Error('操作失败');
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
            if (!res.ok) throw new Error('操作失败');
        } catch (e) {
            console.error('Retweet failed', e);
            setPosts(originalPosts);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <Card className="sticky top-0 z-10 mb-4 bg-surface/95 backdrop-blur border-b border-outline-variant/30 rounded-none">
                <Card.Content className="p-4">
                    <div className="flex items-start gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold">{trendInfo?.hashtag}</h2>
                            <p className="text-sm text-muted">{trendInfo?.postCount} 条推文</p>
                        </div>
                    </div>
                </Card.Content>
            </Card>

            {/* Posts */}
            <div className="space-y-1">
                {isLoading ? (
                    <div className="text-center py-12 text-muted">加载中...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 text-muted">
                        <span className="material-symbols-outlined block text-4xl mb-2 opacity-50">tag</span>
                        暂无相关推文
                    </div>
                ) : (
                    <>
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                isOwner={user?.username === post.authorUsername}
                                onPostAction={() => { }}
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
