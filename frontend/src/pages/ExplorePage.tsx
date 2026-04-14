import { Card, Avatar } from '@heroui/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { API_BASE_URL, fetchWithAuth } from '../config/api';
import { PostCard } from '../components/PostCard';
import { PostSkeleton } from '../components/PostSkeleton';
import { useAuth } from '../hooks/useAuth';

export default function ExplorePage() {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const [popularPosts, setPopularPosts] = useState<any[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchPopular = async () => {
            setIsLoadingPosts(true);
            try {
                const res = await (token ? fetchWithAuth(`/api/posts`) : fetch(`${API_BASE_URL}/posts`));
                if (res.ok) {
                    const data = await res.json();
                    setPopularPosts(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingPosts(false);
            }
        };
        fetchPopular();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const doSearch = async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(debouncedQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        };
        doSearch();
    }, [debouncedQuery]);

    const handleToggleLike = async (postId: string, isCurrentlyLiked: boolean) => {
        if (!token) return alert('请先登录');
        const originalPosts = [...popularPosts];
        setPopularPosts(popularPosts.map((p: any) => p.id === postId ? { ...p, isLikedByMe: !isCurrentlyLiked, likeCount: (p.likeCount || 0) + (isCurrentlyLiked ? -1 : 1) } : p));
        try {
            const res = await fetchWithAuth(`/api/posts/${postId}/like`, { method: isCurrentlyLiked ? 'DELETE' : 'POST' });
            if (!res.ok) throw new Error('操作失败');
        } catch (e) {
            setPopularPosts(originalPosts);
        }
    };

    const handlePostAction = async (action: string, postId: string) => {
        if (action === 'retweet') {
            if (!token) return alert('请先登录');
            if (!window.confirm('确定要转发这条动态吗？')) return;
            try {
                const res = await fetchWithAuth(`/api/posts/${postId}/retweet`, { method: 'POST' });
                if (res.ok) { alert('转发成功'); }
            } catch (e) { }
        } else {
            alert(`已触发操作: ${action}`);
        }
    };

    return (
        <section className="app-page-enter">
            <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md pt-3">
                <div className="flex items-center gap-4 w-full px-4">
                    <div className="relative flex-1 bg-surface-variant/40 rounded-full flex items-center px-4 py-2 border border-transparent focus-within:border-primary focus-within:bg-surface transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant z-10">search</span>
                        <input
                            className="flex-1 bg-transparent border-none outline-none text-on-surface ml-2 placeholder:text-on-surface-variant text-[15px]"
                            placeholder="搜索"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="text-on-surface hover:bg-surface-variant/50 transition-colors p-2 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined shrink-0 text-xl font-light">settings</span>
                    </button>
                </div>

                <div className="flex overflow-x-auto border-b border-outline-variant/60 mt-3 no-scrollbar px-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                    {['为你推荐', '当前趋势', '新闻', '体育', '娱乐'].map((tab, i) => (
                        <button key={tab} className={`relative flex-1 min-w-[70px] pb-3 text-[15px] hover:bg-surface-variant/30 transition-colors ${i === 0 ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant hover:text-on-surface'}`}>
                            {tab}
                            {i === 0 && <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-0">
                {debouncedQuery.trim() ? (
                    <div className="mt-6 space-y-4">
                        <h2 className="text-xl font-bold text-on-surface mb-2">搜索结果：用户</h2>
                        {isSearching ? (
                            <div className="text-on-surface-variant p-4">搜索中...</div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map(u => (
                                <Card key={u.username} className="glass-elevated rounded-card bg-surface/40 hover:bg-surface/60 transition-colors cursor-pointer border-none shadow-none">
                                    <div className="p-4 flex items-center justify-between" onClick={() => navigate(`/profile/${u.username}`)}>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <Avatar.Image src={u.avatarUrl || undefined} />
                                                <Avatar.Fallback className="bg-surface-variant text-on-surface">{(u.displayName || u.username).charAt(0).toUpperCase()}</Avatar.Fallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-bold text-on-surface">{u.displayName || u.username}</div>
                                                <div className="text-sm text-on-surface-variant">@{u.username}</div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-on-surface-variant">
                                            {u.followersCount} 关注者
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-on-surface-variant p-4">没有找到相关用户</div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="bg-surface-variant/20 -mx-4 h-2 lg:hidden"></div>
                        <div className="flex flex-col gap-4 py-4 px-4 min-h-screen bg-surface/30">
                            {isLoadingPosts ? (
                                Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
                            ) : popularPosts.length > 0 ? (
                                popularPosts.map((post: any) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        isOwner={user?.username === post.authorUsername.replace('@', '')}
                                        onToggleLike={handleToggleLike}
                                        onToggleRetweet={() => handlePostAction('retweet', post.id)}
                                        onPostAction={handlePostAction}
                                    />
                                ))
                            ) : (
                                <div className="text-on-surface-variant p-4">暂无推荐内容</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
