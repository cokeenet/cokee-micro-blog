import { Avatar } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState, ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import HoverEffectCard from './components/HoverEffectCard';
import { PostCard } from './components/PostCard';
import { PostSkeleton } from './components/PostSkeleton';
import { useAuth } from './hooks/useAuth';
import { AppLayout } from './layouts/AppLayout';
import AuthPromptPage from './pages/AuthPromptPage';
import { AuthHeroCard } from './pages/AuthPromptPage';
import ComposePage from './pages/ComposePage';
import ExplorePage from './pages/ExplorePage';
import Login from './pages/Login';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import { fetchWithAuth } from './config/api';

// Admin imports
import { AdminLayout } from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPosts from './pages/admin/AdminPosts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTrends from './pages/admin/AdminTrends';
import AdminSettings from './pages/admin/AdminSettings';

type FeedType = 'recommended' | 'following';

const Home = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [activeFeed, setActiveFeed] = useState<FeedType>('recommended');

    const endpoint = useMemo(
        () => (activeFeed === 'following' ? `/api/posts/following` : `/api/posts`),
        [activeFeed]
    );

    const loadPosts = async () => {
        setIsLoading(true);
        if (activeFeed === 'following' && !token) {
            setPosts([]);
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetchWithAuth(endpoint);
            if (!res.ok) {
                throw new Error(`加载失败: ${res.status}`);
            }
            const data = await res.json();
            setPosts(data);
        } catch {
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [endpoint, token]);

    const handleProtectedEntry = () => {
        navigate('/login', { state: { from: location.pathname } });
    };

    const handlePostAction = async (action: string, postId: string) => {
        const label = {
            share: '分享',
            pin: '置顶',
            promote: '推广',
            followers: '转为粉丝可见',
            friends: '转为好友圈可见',
            private: '转为自己可见',
            delete: '删除',
            retweet: '转发',
            'special-follow': '设为特别关注',
            favorite: '收藏',
            'not-interested': '不感兴趣',
            'mute-author': '屏蔽该博主',
            'mute-keyword': '屏蔽关键词',
            'mute-post': '屏蔽该条微博',
            report: '投诉',
            unfollow: '取消关注'
        }[action] || action;

        if (action === 'delete') {
            if (!window.confirm('确定要删除这条动态吗？')) return;
            try {
                const res = await fetchWithAuth(`/api/posts/${postId}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    setPosts(posts.filter((p: any) => p.id !== postId));
                }
            } catch (e) {
                console.error(e);
            }
        } else if (action === 'retweet') {
            if (!token) return alert('请先登录');
            if (!window.confirm('确定要转发这条动态吗？')) return;
            try {
                const res = await fetchWithAuth(`/api/posts/${postId}/retweet`, {
                    method: 'POST'
                });
                if (res.ok) {
                    loadPosts();
                    alert('转发成功');
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            alert(`已触发操作: ${label}`);
        }
    };

    const [homeComposeText, setHomeComposeText] = useState("");

    const handleToggleLike = async (postId: string, isCurrentlyLiked: boolean) => {
        if (!token) {
            handleProtectedEntry();
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
            setPosts(originalPosts); // 回退状态
        }
    };

    const handleHomeCompose = async () => {
        if (!homeComposeText.trim()) return;
        try {
            const res = await fetchWithAuth(`/api/posts`, {
                method: 'POST',
                body: JSON.stringify({
                    content: homeComposeText,
                    visibility: 'Public' // 默认公开
                })
            });
            if (res.ok) {
                setHomeComposeText('');
                loadPosts();
            }
        } catch (e) {
            console.error('Post failed', e);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-surface/30 backdrop-blur-xl border-b border-outline-variant/60 flex justify-between items-center px-4 py-3 w-full">
                <div className="flex items-center gap-8">
                    <span className="text-xl font-black text-on-surface">首页</span>
                    <div className="flex gap-6">
                        <button
                            className={`pb-2 font-inter text-sm font-medium cursor-pointer transition-all active:opacity-70 ${activeFeed === 'recommended' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary/70'}`}
                            onClick={() => setActiveFeed('recommended')}
                        >推荐</button>
                        <button
                            className={`pb-2 font-inter text-sm font-medium cursor-pointer transition-all active:opacity-70 ${activeFeed === 'following' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary/70'}`}
                            onClick={() => {
                                if (!token) {
                                    handleProtectedEntry();
                                    return;
                                }
                                setActiveFeed('following');
                            }}
                        >关注</button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">settings</span>
                </div>
            </header>

            {!token && (
                <section className="px-4 py-4 border-b border-outline-variant/60 app-page-enter">
                    <AuthHeroCard />
                </section>
            )}

            {token && (
                <div className="p-4 border-b border-outline-variant/60">
                    <div className="flex gap-4">
                        <Avatar className="w-12 h-12">
                            <Avatar.Image src={user?.avatarUrl || undefined} />
                            <Avatar.Fallback>{(user?.displayName || 'G').charAt(0).toUpperCase()}</Avatar.Fallback>
                        </Avatar>
                        <HoverEffectCard className="flex-1 glass-panel rounded-card" maxXRotation={2} maxYRotation={2}>
                            <div className="p-3">
                                <textarea
                                    className="w-full bg-transparent border-none focus:ring-0 text-xl placeholder:text-on-surface-variant text-on-surface resize-none h-20 outline-none"
                                    placeholder="有什么新鲜事？"
                                    value={homeComposeText}
                                    onChange={(e) => setHomeComposeText(e.target.value)}
                                ></textarea>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-outline-variant/50">
                                    <div className="flex gap-1">
                                        <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                                            <span className="material-symbols-outlined">image</span>
                                        </button>
                                        <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                                            <span className="material-symbols-outlined">gif_box</span>
                                        </button>
                                        <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                                            <span className="material-symbols-outlined">ballot</span>
                                        </button>
                                        <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                                            <span className="material-symbols-outlined">sentiment_satisfied</span>
                                        </button>
                                    </div>
                                    <button
                                        className={`bg-primary text-on-primary-fixed px-6 py-2 rounded-full font-bold transition-opacity ${!homeComposeText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                                        onClick={handleHomeCompose}
                                        disabled={!homeComposeText.trim()}
                                    >
                                        发布
                                    </button>
                                </div>
                            </div>
                        </HoverEffectCard>
                    </div>
                </div>
            )}

            <section className="flex flex-col gap-4 py-4 px-4 bg-surface/30">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="app-page-enter">
                            <PostSkeleton />
                        </div>
                    ))
                ) : posts.length > 0 ? (
                    posts.map((post, idx) => {
                        const isOwner = !!user && post.authorUsername === `@${user.username}`;

                        return (
                            <div key={post.id || idx} className="app-page-enter">
                                <PostCard
                                    post={post}
                                    isOwner={isOwner}
                                    onPostAction={handlePostAction}
                                    onToggleRetweet={(postId) => handlePostAction('retweet', postId)}
                                    onToggleLike={handleToggleLike}
                                />
                            </div>
                        );
                    })
                ) : (
                    <div className="p-10 text-center text-on-surface-variant font-medium">
                        {activeFeed === 'following' && !token ? '请先登录后查看关注流' : '暂无内容'}
                    </div>
                )}
            </section>
        </>
    );
};

const RequireAuth = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
};

const PageTransition = ({ children }: { children: ReactNode }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    );
};

export default function App() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/auth-required" element={<PageTransition><AppLayout><AuthPromptPage /></AppLayout></PageTransition>} />
                <Route path="/" element={<PageTransition><AppLayout><Home /></AppLayout></PageTransition>} />
                <Route path="/explore" element={<PageTransition><AppLayout><ExplorePage /></AppLayout></PageTransition>} />
                <Route path="/search" element={<PageTransition><AppLayout><SearchPage /></AppLayout></PageTransition>} />
                <Route path="/post/:id" element={<PageTransition><AppLayout><PostDetailPage /></AppLayout></PageTransition>} />
                <Route path="/notifications" element={<RequireAuth><PageTransition><AppLayout><NotificationsPage /></AppLayout></PageTransition></RequireAuth>} />
                <Route path="/profile" element={<RequireAuth><PageTransition><AppLayout><ProfilePage /></AppLayout></PageTransition></RequireAuth>} />
                <Route path="/profile/:username" element={<PageTransition><AppLayout><ProfilePage /></AppLayout></PageTransition>} />
                <Route path="/compose" element={<RequireAuth><PageTransition><AppLayout><ComposePage /></AppLayout></PageTransition></RequireAuth>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="posts" element={<AdminPosts />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="trends" element={<AdminTrends />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<PageTransition><AppLayout><NotFoundPage /></AppLayout></PageTransition>} />
            </Routes>
        </AnimatePresence>
    );
}

