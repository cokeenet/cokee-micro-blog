import { Card, Avatar } from '@heroui/react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { API_BASE_URL, fetchWithAuth } from '../config/api';
import { PostCard } from '../components/PostCard';
import { PostSkeleton } from '../components/PostSkeleton';
import { useAuth } from '../hooks/useAuth';

export default function ExplorePage() {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [searchParams] = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
    const [debouncedQuery, setDebouncedQuery] = useState(() => searchParams.get('q') || '');

    const [popularPosts, setPopularPosts] = useState<any[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [activeTab, setActiveTab] = useState(0);
    const [trends, setTrends] = useState<any[]>([]);
    const [isLoadingTrends, setIsLoadingTrends] = useState(false);

    useEffect(() => {
        const fetchPopular = async () => {
            setIsLoadingPosts(true);
            try {
                const res = await (token ? fetchWithAuth(`/api/posts`) : fetch(`${API_BASE_URL}/api/posts`));
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
        if (activeTab === 1 && trends.length === 0) {
            const fetchTrends = async () => {
                setIsLoadingTrends(true);
                try {
                    const res = await fetch(`${API_BASE_URL}/api/trends`);
                    if (res.ok) {
                        const data = await res.json();
                        setTrends(Array.isArray(data) ? data : data.items || []);
                    }
                } catch (e) {
                    console.error('fetchTrends failed', e);
                } finally {
                    setIsLoadingTrends(false);
                }
            };
            fetchTrends();
        }
    }, [activeTab]);

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
                const res = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(debouncedQuery)}`);
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
            if (!window.confirm('确定要转发这条动态吗')) return;
            try {
                const res = await fetchWithAuth(`/api/posts/${postId}/retweet`, { method: 'POST' });
                if (res.ok) { alert('转发成功'); }
            } catch (e) { }
        } else {
            alert(`已触发操作 ${action}`);
        }
    };

    return (
        <section className="app-page-enter">
            <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-xl pt-3">
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
                        <button
                            key={tab}
                            onClick={() => setActiveTab(i)}
                            className={`relative flex-1 min-w-[70px] pb-3 text-[15px] hover:bg-surface-variant/30 transition-colors ${activeTab === i ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant hover:text-on-surface'}`}
                        >
                            {tab}
                            {activeTab === i && <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-primary rounded-t-full" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-0">
                {debouncedQuery.trim() ? (
                    <div className="mt-6 space-y-4">
                        <h2 className="text-xl font-bold text-on-surface mb-2">搜索结果</h2>
                        {isSearching ? (
                            <div className="text-on-surface-variant p-4">搜索..</div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map(u => (
                                <Card key={u.username} className="glass-elevated rounded-card bg-surface/40 hover:bg-surface/60 transition-colors cursor-pointer border-none shadow-none">
                                    <div className="p-4 flex items-center justify-between" onClick={() => navigate(`/profile/${u.username}`)}>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <Avatar.Image src={typeof (u.avatarUrl || undefined) === 'string' ? (u.avatarUrl || undefined).replace('5253', '8080') : (u.avatarUrl || undefined)} />
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
                        <div className="flex flex-col gap-0 py-2 px-0 min-h-screen bg-surface/30">
                            {activeTab === 0 ? (
                                <>
                                    {isLoadingPosts ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className="px-4 py-2"><PostSkeleton /></div>
                                        ))
                                    ) : popularPosts.length > 0 ? (
                                        popularPosts.map((post: any) => (
                                            <div key={post.id} className="px-4 py-2 hover:bg-surface-variant/10 transition-colors">
                                                <PostCard
                                                    post={post}
                                                    isOwner={user?.username === post.authorUsername.replace('@', '')}
                                                    onToggleLike={handleToggleLike}
                                                    onToggleRetweet={() => handlePostAction('retweet', post.id)}
                                                    onPostAction={handlePostAction}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-on-surface-variant p-4 text-center">暂无推荐内容</div>
                                    )}
                                </>
                            ) : activeTab === 1 ? (
                                <div className="flex flex-col px-4">
                                    {isLoadingTrends ? (
                                        <div className="py-8 text-center text-on-surface-variant">加载趋势中...</div>
                                    ) : trends.length > 0 ? (
                                        <div className="flex flex-col bg-surface border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm mt-4">
                                            {trends.map((item, index) => (
                                                <div key={item.id || index} className="flex justify-between items-center p-4 border-b border-outline-variant/20 hover:bg-surface-variant/20 transition-colors cursor-pointer">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                                                            {index < 3 && <span className="text-primary material-symbols-outlined text-[12px]">local_fire_department</span>}
                                                            {index + 1}. 热门话题
                                                        </span>
                                                        <span className="font-bold text-[16px] text-on-surface mt-0.5">{item.name}</span>
                                                        <span className="text-xs text-on-surface-variant mt-1">{item.postCount || Math.floor(Math.random() * 10000)} 次互动</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-on-surface-variant">more_horiz</span>
                                                </div>
                                            ))}
                                            <div className="p-4 text-primary text-sm font-semibold hover:bg-surface-variant/20 transition-colors cursor-pointer rounded-b-2xl">
                                                显示更多
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-on-surface-variant p-4 text-center">暂无趋势排行信息</div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-10 text-center text-on-surface-variant font-medium">即将推出...</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}



