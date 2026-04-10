import { Avatar, SearchField } from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import HoverEffectCard from '../components/HoverEffectCard';
import PageBackground from '../components/PageBackground';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { API_BASE_URL } from '../config/api';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [trends, setTrends] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const loadSidebarData = async () => {
        try {
            const trendRes = await fetch(`${API_BASE_URL}/trends`);
            const trendData = await trendRes.json();
            setTrends(trendData);
        } catch {
            setTrends([]);
        }

        try {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;

            const suggestionRes = await fetch(`${API_BASE_URL}/users/suggestions`, { headers });
            const suggestionData = await suggestionRes.json();
            setSuggestions(suggestionData);
        } catch {
            setSuggestions([]);
        }
    };

    useEffect(() => {
        loadSidebarData();
        // Removed forced dark mode class for default light mode
    }, [token]);

    const handleFollow = async (targetUserId: string) => {
        if (!token) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        const res = await fetch(`${API_BASE_URL}/users/${targetUserId}/follow`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            alert('关注失败，请稍后重试');
            return;
        }

        await loadSidebarData();
    };

    const navigation = [
        { name: '首页', path: '/', icon: 'home' },
        { name: '探索', path: '/explore', icon: 'search' },
        { name: '通知', path: '/notifications', icon: 'notifications' },
        { name: '个人资料', path: '/profile', icon: 'person' },
        { name: '撰写', path: '/compose', icon: 'edit' }
    ];

    return (
        <div className="bg-background text-on-background min-h-screen font-body selection:bg-primary/30 relative isolate">
            <PageBackground />
            <div className="max-w-[1320px] mx-auto flex min-h-screen px-2 sm:px-4 lg:px-6">
                {/* Left Column: SideNavBar */}
                <aside className="hidden md:block w-72 h-screen sticky top-0 py-4">
                    <div className="glass-elevated rounded-panel flex flex-col h-[calc(100vh-2rem)] px-5 py-6 gap-2">
                        <div className="mb-6 px-2 flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-glow-soft" />
                            <span className="text-2xl font-black text-on-surface tracking-tight">Glacier</span>
                        </div>

                        <nav className="flex flex-col gap-1 flex-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`flex items-center gap-4 px-4 py-3 font-bold rounded-full transition-all active:scale-95 ${isActive
                                            ? 'text-primary bg-primary/14 shadow-glow-soft'
                                            : 'text-on-surface-variant hover:bg-white/45 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                                        <span className="font-inter text-base">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <button
                            className="w-full bg-primary text-white py-3 rounded-full font-bold text-lg active:scale-95 transition-transform shadow-glow-soft"
                            onClick={() => navigate('/compose')}
                        >
                            发布
                        </button>

                        <div className="mt-auto flex items-center gap-3 p-2 rounded-full hover:bg-white/45 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(token ? '/profile' : '/login')}>
                            <Avatar className="w-10 h-10">
                                <Avatar.Image src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'Guest')}&background=bfdbfe&color=0f172a`} />
                                <Avatar.Fallback>{(user?.displayName || 'G').charAt(0)}</Avatar.Fallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-sm font-bold text-on-surface truncate">{user?.displayName || '未登录'}</span>
                                <span className="text-xs text-on-surface-variant truncate">@{user?.username || 'guest'}</span>
                            </div>
                        </div>

                        <button
                            className="mt-2 flex items-center justify-center p-2 rounded-full hover:bg-white/45 dark:hover:bg-white/5 transition-colors text-on-surface-variant w-full"
                            onClick={toggleTheme}
                        >
                            <span className="material-symbols-outlined text-lg">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                            <span className="ml-2 font-bold text-sm">{theme === 'dark' ? '亮色模式' : '深色模式'}</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 bg-transparent mt-4 md:mx-4 flex flex-col relative glass-panel rounded-panel h-[calc(100vh-2rem)]">
                    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-0 rounded-panel">
                        {children}
                    </div>
                </main>

                {/* Right Column: Trends & Suggestions */}
                <aside className="hidden w-80 px-4 py-4 flex-col gap-6 sticky top-0 h-screen xl:flex">
                    <SearchField className="w-full relative group">
                        <SearchField.Group className="w-full border border-outline-variant focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 rounded-full text-sm transition-all glass-panel">
                            <span className="material-symbols-outlined pl-4 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
                            {/* <SearchField.SearchIcon /> */}
                            <SearchField.Input className="w-full bg-transparent border-none outline-none py-3 pl-3 pr-4 text-on-surface placeholder:text-on-surface-variant" placeholder="搜索 Glacier" />
                            <SearchField.ClearButton className="mr-2" />
                        </SearchField.Group>
                    </SearchField>

                    <HoverEffectCard className="glass-elevated rounded-panel flex flex-col gap-4">
                        <div className="p-4 gap-4 overflow-visible flex flex-col">
                            <h2 className="text-xl font-black text-on-surface">为您推荐的趋势</h2>
                            <div className="flex flex-col gap-4">
                                {trends.length > 0 ? (
                                    trends.slice(0, 5).map((trend: any, i) => (
                                        <div key={i} className="flex justify-between items-start group cursor-pointer">
                                            <div>
                                                <p className="text-xs text-on-surface-variant">热门·趋势</p>
                                                <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{trend.name}</p>
                                                <p className="text-xs text-on-surface-variant">{trend.posts || '1.25万'} 博文</p>
                                            </div>
                                            <button className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-sm">more_horiz</span>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-on-surface-variant">
                                        <div><p className="text-xs text-on-surface-variant">技术·趋势</p><p className="text-sm font-bold text-on-surface hover:text-primary transition-colors">#玻璃拟态</p><p className="text-xs text-on-surface-variant">1.25万 博文</p></div>
                                        <div className="mt-4"><p className="text-xs text-on-surface-variant">设计·趋势</p><p className="text-sm font-bold text-on-surface hover:text-primary transition-colors">冷光 UI</p><p className="text-xs text-on-surface-variant">8,200 博文</p></div>
                                    </div>
                                )}
                            </div>
                            <button className="text-primary text-sm font-bold self-start hover:underline">显示更多</button>
                        </div>
                    </HoverEffectCard>

                    <HoverEffectCard className="glass-elevated rounded-panel flex flex-col gap-4" maxXRotation={3} maxYRotation={3}>
                        <div className="p-4 gap-4 overflow-visible flex flex-col">
                            <h2 className="text-xl font-black text-on-surface">推荐关注</h2>
                            <div className="flex flex-col gap-4">
                                {suggestions.length > 0 ? (
                                    suggestions.slice(0, 3).map((suggestedUser: any, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar size="sm">
                                                    <Avatar.Image src={suggestedUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(suggestedUser.displayName || 'U')}&background=bfdbfe&color=0f172a`} />
                                                    <Avatar.Fallback>{(suggestedUser.displayName || 'U').charAt(0)}</Avatar.Fallback>
                                                </Avatar>
                                                <div className="min-w-0 pr-2">
                                                    <p className="text-sm font-bold text-on-surface truncate">{suggestedUser.displayName}</p>
                                                    <p className="text-xs text-on-surface-variant truncate">@{suggestedUser.username}</p>
                                                </div>
                                            </div>
                                            <button
                                                className="whitespace-nowrap bg-on-surface text-inverse-on-surface px-4 py-1.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
                                                onClick={() => handleFollow(suggestedUser.id)}
                                            >
                                                关注
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar size="sm">
                                                    <Avatar.Image src="https://ui-avatars.com/api/?name=Crystal+Dev&background=bfdbfe&color=0f172a" />
                                                    <Avatar.Fallback>C</Avatar.Fallback>
                                                </Avatar>
                                                <div className="min-w-0 pr-2">
                                                    <p className="text-sm font-bold text-on-surface truncate">Crystal Dev</p>
                                                    <p className="text-xs text-on-surface-variant truncate">@crys_dev</p>
                                                </div>
                                            </div>
                                            <button className="whitespace-nowrap bg-on-surface text-inverse-on-surface px-4 py-1.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">关注</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button className="text-primary text-sm font-bold self-start mt-2 hover:underline">显示更多</button>
                        </div>
                    </HoverEffectCard>

                    <div className="text-xs text-on-surface-variant/70 flex flex-wrap gap-x-3 gap-y-1 px-2">
                        <a href="#" className="hover:underline">服务条款</a>
                        <a href="#" className="hover:underline">隐私政策</a>
                        <a href="#" className="hover:underline">Cookie 政策</a>
                        <a href="#" className="hover:underline">无障碍性</a>
                        <a href="#" className="hover:underline">广告信息</a>
                        <span>© 2024 Glacier Corp.</span>
                    </div>
                </aside>
            </div>

            <nav className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-lg glass-elevated rounded-full px-3 py-2 z-50">
                <div className="flex items-center justify-between">
                    {navigation.slice(0, 4).map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${isActive ? 'text-primary bg-primary/12' : 'text-on-surface-variant'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                                <span className="text-[11px]">{item.name}</span>
                            </Link>
                        );
                    })}
                    <button
                        className="flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors text-on-surface-variant hover:text-primary"
                        onClick={toggleTheme}
                    >
                        <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                        <span className="text-[11px]">主题</span>
                    </button>
                </div>
            </nav>
        </div >
    );
};
