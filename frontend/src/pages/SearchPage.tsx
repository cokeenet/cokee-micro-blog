import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Input, Card } from '@heroui/react';
import { PostCard } from '../components/PostCard';
import { useAuth } from '../hooks/useAuth';
import { fetchWithAuth } from '../config/api';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const query = searchParams.get('q') || '';
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [searchInput, setSearchInput] = useState(query);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        if (query) {
            performSearch();
        }
    }, [query, page]);

    const performSearch = async () => {
        if (!query || query.trim().length < 2) {
            setPosts([]);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetchWithAuth(
                `/api/posts/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`
            );
            if (res.ok) {
                const data = await res.json();
                setPosts(data.data || []);
                setTotalResults(data.data?.length || 0);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim().length >= 2) {
            setSearchParams({ q: searchInput });
            setPage(1);
        }
    };

    const hasNextPage = totalResults === pageSize;

    const handleToggleLike = async (postId: string, isCurrentlyLiked: boolean) => {
        if (!token) {
            navigate('/login');
            return;
        }

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
        if (!token) {
            navigate('/login');
            return;
        }

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
            if (!res.ok) {
                throw new Error('操作失败');
            }
        } catch (e) {
            console.error('Bookmark failed', e);
            setPosts(originalPosts);
        }
    };

    const handleToggleRetweet = async (postId: string, isCurrentlyRetweeted: boolean) => {
        if (!token) {
            navigate('/login');
            return;
        }

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
            {/* Search Header */}
            <Card className="sticky top-0 z-10 mb-4 bg-surface/95 backdrop-blur border-b border-outline-variant/30 rounded-none">
                <Card.Content className="p-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="搜索推文..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="flex-1"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity"
                        >
                            搜索
                        </button>
                    </form>
                </Card.Content>
            </Card>

            {/* Results */}
            <div className="space-y-1">
                {isLoading ? (
                    <div className="text-center py-8 text-muted">搜索中...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                        {query ? '未找到相关推文' : '输入至少 2 个字符开始搜索'}
                    </div>
                ) : (
                    <>
                        <div className="text-sm text-muted px-4 py-3 border-b border-outline-variant/30">
                            找到 {totalResults} 条结果
                        </div>
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                isOwner={false}
                                onPostAction={() => { }}
                                onToggleLike={handleToggleLike}
                                onToggleBookmark={handleToggleBookmark}
                                onToggleRetweet={(postId) => handleToggleRetweet(postId, !!post.isRetweetedByMe)}
                            />
                        ))}
                        {hasNextPage && (
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
