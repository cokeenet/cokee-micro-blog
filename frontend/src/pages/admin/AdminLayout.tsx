import { useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router';
import { Avatar } from '@heroui/react';
import { motion } from 'framer-motion';
import PageBackground from '../../components/PageBackground';
import { useAuth } from '../../hooks/useAuth';

export const AdminLayout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active menu from pathname
    const getActiveMenu = () => {
        if (location.pathname.includes('/admin/users')) return 'Users';
        if (location.pathname.includes('/admin/posts')) return 'Posts';
        if (location.pathname.includes('/admin/trends')) return 'Trends';
        if (location.pathname.includes('/admin/settings')) return 'Settings';
        return 'Dashboard';
    };

    const activeMenu = getActiveMenu();

    useEffect(() => {
        if (user === null) {
            navigate('/login');
        }
    }, [user, navigate]);

    const menuItems = [
        { name: 'Dashboard', label: '仪表盘', icon: 'space_dashboard', path: '/admin' },
        { name: 'Users', label: '用户管理', icon: 'group', path: '/admin/users' },
        { name: 'Posts', label: '内容管理', icon: 'article', badge: 'New', path: '/admin/posts' },
        { name: 'Trends', label: '热门趋势', icon: 'trending_up', path: '/admin/trends' },
        { name: 'Settings', label: '系统设置', icon: 'settings', path: '/admin/settings' }
    ];

    if (!user) return null; // Avoid flickering before redirect

    return (
        <div className="fixed inset-0 overflow-hidden flex font-body text-on-surface isolate bg-background selection:bg-primary/30">
            <PageBackground />

            {/* Left Sidebar */}
            <aside className="w-[260px] h-full glass-panel flex flex-col p-4 z-10 border-r border-outline-variant/40 rounded-none hidden md:flex">
                {/* Profile Widget */}
                <div className="glass-chip rounded-panel p-3 mb-8 flex items-center gap-3 cursor-pointer hover:bg-surface-variant/30 transition-colors">
                    <Avatar className="shrink-0 w-10 h-10 shadow-glow-soft border-none bg-transparent">
                        {user.avatarUrl && <Avatar.Image src={typeof (user.avatarUrl) === 'string' ? (user.avatarUrl).replace('5253', '8080') : (user.avatarUrl)} />}
                        <Avatar.Fallback className="bg-gradient-to-tr from-blue-300 to-indigo-400 text-white font-bold">
                            {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'A'}
                        </Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm truncate">{user.displayName || 'Administrator'}</span>
                        <span className="text-xs text-on-surface-variant truncate">超级管理员</span>
                    </div>
                </div>

                {/* Nav Menu */}
                <nav className="flex flex-col gap-1.5 flex-1 relative">
                    {menuItems.map(item => {
                        const isActive = activeMenu === item.name;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`relative flex items-center justify-between px-4 py-3 rounded-card transition-all font-semibold text-sm ${isActive ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="adminNavIndicator"
                                        className="absolute inset-0 bg-primary/15 shadow-glow-soft rounded-card"
                                        initial={false}
                                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                                    />
                                )}
                                <div className="flex items-center gap-3 relative z-10">
                                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="relative z-10 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-bold uppercase tracking-wider">{item.badge}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Links */}
                <div className="flex flex-col gap-1.5 mt-auto pt-4 border-t border-outline-variant/40">
                    <button className="flex items-center gap-3 px-4 py-3 rounded-card text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface transition-all text-sm font-semibold">
                        <span className="material-symbols-outlined text-[20px]">help</span>
                        帮助与支持
                    </button>
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-card text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface transition-all text-sm font-semibold">
                        <span className="material-symbols-outlined text-[20px]">home</span>
                        返回前台首页
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative z-10">
                <Outlet />
            </main>
        </div>
    );
};