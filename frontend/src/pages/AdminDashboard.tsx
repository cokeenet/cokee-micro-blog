import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../config/api';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('Overview');
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 假设后端有这些接口，没有的话可以用真实接口替换
                const statsRes = await fetchWithAuth(`/api/admin/stats`);
                if (statsRes.ok) setStats(await statsRes.json());
            } catch (err) {
                console.error('Failed to load admin data:', err);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            {/* Controls Row */}
            <div className="flex flex-col xl:flex-row justify-between gap-4">
                <div className="glass-panel p-1 rounded-full flex gap-1 items-center self-start">
                    {['概览', '用户分析', '内容趋势'].map(tab => (
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
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
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
            </div>
        </div>
    );
}
