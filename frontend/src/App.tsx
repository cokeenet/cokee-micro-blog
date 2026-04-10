import { Avatar } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState, ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import HoverEffectCard from './components/HoverEffectCard';
import { PostActionMenu } from './components/PostActionMenu';
import { useAuth } from './hooks/useAuth';
import { AppLayout } from './layouts/AppLayout';
import AdminDashboard from './pages/AdminDashboard';
import AuthPromptPage from './pages/AuthPromptPage';
import { AuthHeroCard } from './pages/AuthPromptPage';
import ComposePage from './pages/ComposePage';
import ExplorePage from './pages/ExplorePage';
import Login from './pages/Login';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import { API_BASE_URL } from './config/api';

type FeedType = 'recommended' | 'following';

const Home = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [posts, setPosts] = useState<any[]>([]);
    const [activeFeed, setActiveFeed] = useState<FeedType>('recommended');

    const endpoint = useMemo(
        () => (activeFeed === 'following' ? `${API_BASE_URL}/posts/following` : `${API_BASE_URL}/posts`),
        [activeFeed]
    );

    const loadPosts = async () => {
        if (activeFeed === 'following' && !token) {
            setPosts([]);
            return;
        }

        const headers: Record<string, string> = {};
        if (activeFeed === 'following' && token) {
            headers.Authorization = `Bearer ${token}`;
        }

        try {
            const res = await fetch(endpoint, { headers });
            if (!res.ok) {
                throw new Error(`加载失败: ${res.status}`);
            }
            const data = await res.json();
            setPosts(data);
        } catch {
            setPosts([]);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [endpoint, token]);

    const handleProtectedEntry = () => {
        navigate('/login', { state: { from: location.pathname } });
    };

    const handlePostAction = (action: string) => {
        const label = {
            share: '分享',
            pin: '置顶',
            promote: '推广',
            followers: '转为粉丝可见',
            friends: '转为好友圈可见',
            private: '转为自己可见',
            delete: '删除',
            'special-follow': '设为特别关注',
            favorite: '收藏',
            'not-interested': '不感兴趣',
            'mute-author': '屏蔽该博主',
            'mute-keyword': '屏蔽关键词',
            'mute-post': '屏蔽该条微博',
            report: '投诉',
            unfollow: '取消关注'
        }[action] || action;

        alert(`已触发操作: ${label}`);
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
                            <Avatar.Image src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'Guest')}&background=bfdbfe&color=0f172a`} />
                            <Avatar.Fallback>{(user?.displayName || 'G').charAt(0)}</Avatar.Fallback>
                        </Avatar>
                        <HoverEffectCard className="flex-1 glass-panel rounded-card" maxXRotation={2} maxYRotation={2}>
                            <div className="p-3">
                                <textarea
                                    className="w-full bg-transparent border-none focus:ring-0 text-xl placeholder:text-on-surface-variant text-on-surface resize-none h-20 outline-none"
                                    placeholder="有什么新鲜事？"
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
                                    <button className="bg-primary text-on-primary-fixed px-6 py-2 rounded-full font-bold opacity-50 cursor-not-allowed">
                                        发布
                                    </button>
                                </div>
                            </div>
                        </HoverEffectCard>
                    </div>
                </div>
            )}

            <section className="divide-y divide-outline-variant/60">
                {posts.map((post, idx) => {
                    const authorName = post.authorUsername?.replace('@', '') || 'Unknown';
                    const isOwner = !!user && post.authorUsername === `@${user.username}`;

                    return (
                        <article key={post.id || idx} className="p-4 hover:bg-white/45 dark:hover:bg-white/5 transition-colors cursor-pointer app-page-enter">
                            <div className="flex gap-3">
                                <Avatar size="sm">
                                    <Avatar.Image src={`https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=bfdbfe&color=0f172a`} />
                                    <Avatar.Fallback>{authorName.charAt(0)}</Avatar.Fallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-on-surface">{authorName}</span>
                                            <span className="text-on-surface-variant text-sm">
                                                {post.authorUsername} · {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <PostActionMenu isOwner={isOwner} onAction={handlePostAction} />
                                    </div>

                                    <p className="text-on-surface mt-1 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                                    <div className="flex justify-between mt-4 max-w-md text-on-surface-variant">
                                        <button className="flex items-center gap-2 group">
                                            <span className="material-symbols-outlined text-xl group-hover:text-primary group-hover:bg-primary/10 p-2 rounded-full transition-colors">chat_bubble</span>
                                            <span className="text-sm">0</span>
                                        </button>
                                        <button className="flex items-center gap-2 group">
                                            <span className="material-symbols-outlined text-xl group-hover:text-emerald-500 group-hover:bg-emerald-500/10 p-2 rounded-full transition-colors">repeat</span>
                                            <span className="text-sm">0</span>
                                        </button>
                                        <button className="flex items-center gap-2 group">
                                            <span className="material-symbols-outlined text-xl group-hover:text-rose-500 group-hover:bg-rose-500/10 p-2 rounded-full transition-colors">favorite</span>
                                            <span className="text-sm">0</span>
                                        </button>
                                        <button className="flex items-center gap-2 group">
                                            <span className="material-symbols-outlined text-xl group-hover:text-primary group-hover:bg-primary/10 p-2 rounded-full transition-colors">share</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}

                {posts.length === 0 && (
                    <div className="p-10 text-center text-on-surface-variant">
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
                <Route path="/notifications" element={<RequireAuth><PageTransition><AppLayout><NotificationsPage /></AppLayout></PageTransition></RequireAuth>} />
                <Route path="/profile" element={<RequireAuth><PageTransition><AppLayout><ProfilePage /></AppLayout></PageTransition></RequireAuth>} />
                <Route path="/compose" element={<RequireAuth><PageTransition><AppLayout><ComposePage /></AppLayout></PageTransition></RequireAuth>} />
                <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
}
