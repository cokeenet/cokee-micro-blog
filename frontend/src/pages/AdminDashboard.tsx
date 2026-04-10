import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@heroui/react';
import PageBackground from '../components/PageBackground';
import { API_BASE_URL } from '../config/api';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('Overview');
    const [activeMenu, setActiveMenu] = useState('Dashboard');
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const statsRes = await fetch(`${API_BASE_URL}/admin/stats`);
                setStats(await statsRes.json());

                const usersRes = await fetch(`${API_BASE_URL}/admin/users`);
                setUsers(await usersRes.json());
            } catch (err) {
                console.error('Failed to load admin data:', err);
            }
        };
        fetchDashboardData();
    }, []);

    const menuItems = [
        { name: 'Dashboard', icon: 'space_dashboard' },
        { name: 'Orders', icon: 'shopping_bag' },
        { name: 'Tracker', icon: 'checklist', badge: 'New' },
        { name: 'Analytics', icon: 'analytics' },
        { name: 'Settings', icon: 'settings' }
    ];

    return (
        <div className="fixed inset-0 overflow-hidden flex font-body text-on-surface isolate bg-background selection:bg-primary/30">
            <PageBackground />

            {/* Left Sidebar */}
            <aside className="w-[260px] h-full glass-panel flex flex-col p-4 z-10 border-r border-outline-variant/40 rounded-none hidden md:flex">
                {/* Profile Widget */}
                <div className="glass-chip rounded-panel p-3 mb-8 flex items-center gap-3 cursor-pointer hover:bg-surface-variant/30 transition-colors">
                    <Avatar className="shrink-0 w-10 h-10 shadow-glow-soft border-none bg-transparent">
                        <Avatar.Fallback className="bg-gradient-to-tr from-blue-300 to-indigo-400 text-white font-bold">KM</Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm truncate">Kate Moore</span>
                        <span className="text-xs text-on-surface-variant truncate">Admin</span>
                    </div>
                </div>

                {/* Nav Menu */}
                <nav className="flex flex-col gap-1.5 flex-1">
                    {menuItems.map(item => (
                        <button
                            key={item.name}
                            onClick={() => setActiveMenu(item.name)}
                            className={`flex items-center justify-between px-4 py-3 rounded-card transition-all font-semibold text-sm ${activeMenu === item.name
                                ? 'bg-primary/15 text-primary shadow-glow-soft'
                                : 'text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeMenu === item.name ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                                <span>{item.name}</span>
                            </div>
                            {item.badge && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-bold uppercase tracking-wider">{item.badge}</span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Footer Links */}
                <div className="flex flex-col gap-1.5 mt-auto pt-4 border-t border-outline-variant/40">
                    <button className="flex items-center gap-3 px-4 py-3 rounded-card text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface transition-all text-sm font-semibold">
                        <span className="material-symbols-outlined text-[20px]">help</span>
                        Help &amp; Information
                    </button>
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-card text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface transition-all text-sm font-semibold">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Log out
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full relative z-0 min-w-0">
                {/* Header */}
                <header className="flex justify-between items-center px-8 py-5 border-b border-outline-variant/40 bg-surface/20 backdrop-blur-md sticky top-0 z-20">
                    <h1 className="text-2xl font-black text-on-surface tracking-tight">Good morning, Kate</h1>
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined">search</span>
                        </button>
                        <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <button className="bg-primary text-white shadow-glow-soft px-5 py-2 rounded-card font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                            Invite
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 app-page-enter pb-24">

                    {/* Controls Row */}
                    <div className="flex flex-col xl:flex-row justify-between gap-4 mb-6">
                        <div className="glass-panel p-1 rounded-full flex gap-1 items-center self-start">
                            {['Overview', 'Sales', 'Expenses'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === tab
                                        ? 'bg-surface-variant text-on-surface shadow-sm'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3 items-center">
                            <button className="glass-chip p-2 rounded-full text-sm font-semibold flex items-center justify-center hover:bg-surface-variant/50 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">autorenew</span>
                            </button>
                            <button className="glass-chip px-4 py-1.5 rounded-card text-sm font-semibold flex items-center gap-2 hover:bg-surface-variant/50 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                Monthly
                                <span className="material-symbols-outlined text-[18px]">expand_more</span>
                            </button>
                            <button className="bg-secondary text-white shadow-glow-soft px-5 py-1.5 rounded-card font-bold text-sm hover:opacity-90 active:scale-95 transition-all">
                                Download
                            </button>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="glass-elevated rounded-panel p-5 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="text-on-surface-variant text-sm font-semibold">Total Users</span>
                                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[10px]">group</span>
                                </span>
                            </div>
                            <span className="text-3xl font-black text-on-surface">{stats?.totalUsers || 0}</span>
                        </div>
                        <div className="glass-elevated rounded-panel p-5 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="text-on-surface-variant text-sm font-semibold">Total Posts</span>
                                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[10px]">article</span>
                                </span>
                            </div>
                            <span className="text-3xl font-black text-on-surface">{stats?.totalPosts || 0}</span>
                        </div>
                        <div className="glass-elevated rounded-panel p-5 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="text-on-surface-variant text-sm font-semibold">Today Logins</span>
                                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[10px]">login</span>
                                </span>
                            </div>
                            <span className="text-3xl font-black text-on-surface">{stats?.todayLogins || 0}</span>
                        </div>
                        <div className="glass-elevated rounded-panel p-5 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="text-on-surface-variant text-sm font-semibold">System Status</span>
                                <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[10px]">check_circle</span>
                                </span>
                            </div>
                            <span className="text-3xl font-black text-on-surface">API {stats?.apiGateway || '99.9%'}</span>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                        {/* Bar Chart */}
                        <div className="glass-elevated rounded-panel p-5 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-on-surface">Sales Performance</h3>
                                <button className="glass-chip px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 hover:bg-surface-variant/50 transition-colors">
                                    Last 2 weeks <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                </button>
                            </div>
                            <div className="flex justify-between items-end gap-1 sm:gap-1.5 h-36 mt-auto">
                                {[30, 80, 45, 20, 60, 30, 25, 40, 20, 70, 60, 40].map((h, i) => (
                                    <div key={i} className="w-full relative group cursor-pointer flex justify-center h-full items-end pb-5">
                                        <div
                                            className="w-full bg-primary/20 group-hover:bg-primary transition-colors rounded-sm"
                                            style={{ height: `${h}%` }}
                                        ></div>
                                        <div className="absolute bottom-0 text-[10px] text-on-surface-variant font-semibold">
                                            {(i + 1).toString().padStart(2, '0')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Line Chart */}
                        <div className="glass-elevated rounded-panel p-5 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-on-surface">Traffic Source</h3>
                                <div className="flex items-center gap-3 text-xs font-semibold">
                                    <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-secondary"></span> Organic
                                    </div>
                                    <div className="flex items-center gap-1 text-on-surface-variant">
                                        <span className="w-2 h-2 rounded-full bg-outline-variant"></span> Paid Ads
                                    </div>
                                    <button className="text-on-surface-variant hover:text-on-surface pr-2">
                                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                    </button>
                                </div>
                            </div>
                            <div className="mb-2">
                                <span className="text-2xl font-black text-on-surface">231,856</span>
                                <p className="text-xs text-on-surface-variant">Sessions</p>
                            </div>
                            <div className="h-28 mt-auto relative w-full overflow-hidden">
                                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                                    <line x1="0" y1="30" x2="400" y2="30" stroke="currentColor" className="text-outline-variant/30" strokeWidth="1" />
                                    <line x1="0" y1="60" x2="400" y2="60" stroke="currentColor" className="text-outline-variant/30" strokeWidth="1" />
                                    <path d="M0,80 L40,30 L80,60 L120,50 L160,30 L200,80 L240,40 L280,30 L320,50 L360,20 L400,60" fill="none" stroke="currentColor" className="text-secondary drop-shadow-md" strokeWidth="2.5" strokeLinejoin="round" />
                                    <path d="M0,90 L40,50 L80,20 L120,80 L160,55 L200,95 L240,70 L280,60 L320,80 L360,50 L400,90" fill="none" stroke="currentColor" className="text-outline-variant drop-shadow-md" strokeWidth="2.5" strokeLinejoin="round" />
                                </svg>
                                <div className="flex justify-between text-[10px] font-semibold text-on-surface-variant mt-2 px-1">
                                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    {/* Data Table Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 mt-8">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-black text-on-surface">System Users</h2>
                            <span className="glass-chip px-2 py-0.5 rounded-full text-xs font-bold text-on-surface-variant">{users.length}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <button className="glass-chip px-3 py-1.5 rounded-card text-sm font-semibold flex items-center gap-1.5 hover:bg-surface-variant/50 transition-colors">
                                <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
                            </button>
                            <button className="glass-chip px-3 py-1.5 rounded-card text-sm font-semibold flex items-center gap-1.5 hover:bg-surface-variant/50 transition-colors">
                                <span className="material-symbols-outlined text-[16px]">sort</span> Sort
                            </button>
                            <button className="glass-chip px-3 py-1.5 rounded-card text-sm font-semibold flex items-center gap-1.5 hover:bg-surface-variant/50 transition-colors hidden md:flex">
                                <span className="material-symbols-outlined text-[16px]">view_column</span> Columns
                            </button>
                            <div className="relative flex-1 sm:flex-none">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
                                <input type="text" placeholder="Search..." className="glass-chip border-none outline-none py-1.5 pl-9 pr-3 rounded-card text-sm text-on-surface placeholder:text-on-surface-variant w-full sm:w-48" />
                            </div>
                        </div>
                    </div>

                    <div className="glass-elevated rounded-panel overflow-x-auto border-none mb-8">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-surface/40 backdrop-blur-md border-b border-outline-variant/40 text-on-surface-variant font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Worker ID</th>
                                    <th className="px-6 py-4">Member</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Worker Type</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/30">
                                {users.map((emp: any) => (
                                    <tr key={emp.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4 font-bold text-on-surface flex items-center gap-2 h-[68px]">
                                            {emp.id}
                                            <button className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-on-surface">
                                                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="shrink-0 w-8 h-8 shadow-glow-soft border-none bg-transparent">
                                                    <Avatar.Fallback className={`bg-gradient-to-tr ${emp.grad || 'from-primary to-secondary'} text-white font-bold text-xs`}>
                                                        {(emp.displayName || emp.username || emp.name || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                                    </Avatar.Fallback>
                                                </Avatar>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-on-surface leading-tight text-sm">{emp.displayName || emp.name || emp.username}</span>
                                                    <span className="text-[12px] text-on-surface-variant leading-tight mt-0.5">{emp.email || `${emp.username}@example.com`}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-on-surface-variant">{emp.role}</td>
                                        <td className="px-6 py-4 font-semibold text-on-surface-variant">{emp.type}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button className="glass-chip p-1.5 rounded-full hover:bg-surface-variant/80 transition-colors text-on-surface-variant hover:text-on-surface">
                                                    <span className="material-symbols-outlined text-[16px] block">visibility</span>
                                                </button>
                                                <button className="glass-chip p-1.5 rounded-full hover:bg-surface-variant/80 transition-colors text-on-surface-variant hover:text-on-surface">
                                                    <span className="material-symbols-outlined text-[16px] block">edit</span>
                                                </button>
                                                <button className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 p-1.5 rounded-full transition-colors ml-1">
                                                    <span className="material-symbols-outlined text-[16px] block">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </main>
        </div>
    );
}
