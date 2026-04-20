import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HoverEffectCard from '../../components/HoverEffectCard';
import { fetchWithAuth } from '../../config/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [dockerStatus, setDockerStatus] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Ignore missing endpoints for stats/users right now to focus on docker list
                const statsRes = await fetchWithAuth('/api/admin/stats').catch(() => null);
                if (statsRes && statsRes.ok) setStats(await statsRes.json());

                const usersRes = await fetchWithAuth('/api/admin/users').catch(() => null);
                if (usersRes && usersRes.ok) setUsers(await usersRes.json());

                const dockerRes = await fetchWithAuth('/api/admin/docker-status');
                if (dockerRes.ok) {
                    setDockerStatus(await dockerRes.json());
                }
            } catch (err) {
                console.error('Failed to load admin data:', err);
            }
        };
        fetchDashboardData();

        // Polling docker status every 5 seconds
        const id = setInterval(async () => {
            const dockerRes = await fetchWithAuth('/api/admin/docker-status').catch(() => null);
            if (dockerRes && dockerRes.ok) setDockerStatus(await dockerRes.json());
        }, 5000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-on-surface">系统总览</h2>
                    <p className="text-sm text-on-surface-variant mt-1">服务器状态和核心数据</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                <HoverEffectCard className="rounded-panel p-5 flex flex-col gap-2 relative">
                    <div className="flex justify-between items-start z-10 relative pointer-events-none">
                        <span className="text-on-surface-variant text-sm font-semibold">Total Users</span>
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">group</span>
                        </span>
                    </div>
                    <span className="text-3xl font-black text-on-surface z-10 relative pointer-events-none">{stats?.totalUsers ?? users.length ?? 0}</span>
                </HoverEffectCard>

                <HoverEffectCard className="rounded-panel p-5 flex flex-col gap-2 relative">
                    <div className="flex justify-between items-start z-10 relative pointer-events-none">
                        <span className="text-on-surface-variant text-sm font-semibold">Total Posts</span>
                        <span className="text-[10px] bg-blue-500/15 text-blue-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">edit_document</span>
                        </span>
                    </div>
                    <span className="text-3xl font-black text-on-surface z-10 relative pointer-events-none">{stats?.totalPosts ?? 0}</span>
                </HoverEffectCard>

                <HoverEffectCard className="rounded-panel p-5 flex flex-col gap-2 relative">
                    <div className="flex justify-between items-start z-10 relative pointer-events-none">
                        <span className="text-on-surface-variant text-sm font-semibold">Today Logins</span>
                        <span className="text-[10px] bg-amber-500/15 text-amber-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">login</span>
                        </span>
                    </div>
                    <span className="text-3xl font-black text-on-surface z-10 relative pointer-events-none">{stats?.todayLogins ?? 0}</span>
                </HoverEffectCard>

                <HoverEffectCard className="rounded-panel p-5 flex flex-col gap-2 relative">
                    <div className="flex justify-between items-start z-10 relative pointer-events-none">
                        <span className="text-on-surface-variant text-sm font-semibold">Active Storage</span>
                        <span className="text-[10px] bg-purple-500/15 text-purple-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">cloud</span>
                        </span>
                    </div>
                    <span className="text-3xl font-black text-on-surface z-10 relative pointer-events-none">{stats?.activeStorage ?? 'N/A'}</span>
                </HoverEffectCard>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
                <HoverEffectCard className="rounded-panel p-5 flex flex-col gap-2 relative">
                    <div className="flex justify-between items-start z-10 relative pointer-events-none">
                        <span className="text-on-surface-variant text-sm font-semibold">API Gateway</span>
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">router</span>
                        </span>
                    </div>
                    <span className="text-2xl font-black text-on-surface z-10 relative pointer-events-none">{stats?.apiGateway ?? 'N/A'}</span>
                </HoverEffectCard>

                <HoverEffectCard className="rounded-panel p-5 flex flex-col gap-2 relative">
                    <div className="flex justify-between items-start z-10 relative pointer-events-none">
                        <span className="text-on-surface-variant text-sm font-semibold">CDN Status</span>
                        <span className="text-[10px] bg-blue-500/15 text-blue-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">public</span>
                        </span>
                    </div>
                    <span className="text-2xl font-black text-on-surface z-10 relative pointer-events-none">{stats?.cdnStatus ?? 'N/A'}</span>
                </HoverEffectCard>

                <HoverEffectCard className="rounded-panel p-5 flex flex-col gap-2 relative">
                    <div className="flex justify-between items-start z-10 relative pointer-events-none">
                        <span className="text-on-surface-variant text-sm font-semibold">DB Cluster</span>
                        <span className="text-[10px] bg-amber-500/15 text-amber-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">database</span>
                        </span>
                    </div>
                    <span className="text-2xl font-black text-on-surface z-10 relative pointer-events-none">{stats?.dbCluster ?? 'N/A'}</span>
                </HoverEffectCard>

                <HoverEffectCard className="rounded-panel p-5 flex flex-col gap-2 relative">
                    <div className="flex justify-between items-start z-10 relative pointer-events-none">
                        <span className="text-on-surface-variant text-sm font-semibold">{stats?.isDocker ? 'Containers Up' : 'Active Nodes'}</span>
                        <span className="text-[10px] bg-sky-500/15 text-sky-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">dns</span>
                        </span>
                    </div>
                    <span className="text-2xl font-black text-on-surface z-10 relative pointer-events-none mt-1">
                        {stats?.isDocker
                            ? dockerStatus.filter((c: any) => c.state === 'running').length || 0
                            : 1
                        }
                    </span>
                </HoverEffectCard>
            </div>

            <div className="bg-surface border border-outline-variant/40 rounded-[24px] shadow-soft p-6 mb-4">
                <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">terminal</span>
                    系统主机运行环境数据 {stats?.isDocker && "(Docker Host)"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 border-b border-outline-variant/30 pb-3">
                        <span className="text-xs text-on-surface-variant font-semibold">操作系统平台</span>
                        <span className="text-sm font-bold text-on-surface">{stats?.os || '未知'}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-outline-variant/30 pb-3">
                        <span className="text-xs text-on-surface-variant font-semibold">运行框架</span>
                        <span className="text-sm font-bold text-on-surface">{stats?.framework || '未知'}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-outline-variant/30 pb-3 sm:border-none sm:pb-0">
                        <span className="text-xs text-on-surface-variant font-semibold">逻辑处理器核心</span>
                        <span className="text-sm font-bold text-on-surface">{stats?.procCount ? `${stats.procCount} Cores` : '未知'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-on-surface-variant font-semibold">当前内存占用</span>
                        <span className="text-sm font-bold text-on-surface">{stats?.memoryUsage ? `${(stats.memoryUsage / 1024 / 1024).toFixed(2)} MB` : '未知'}</span>
                    </div>
                </div>
            </div>

            {stats?.isDocker && (
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-black text-on-surface">Docker Server Nodes</h2>
                            <span className="glass-chip px-2 py-0.5 rounded-full text-xs font-bold text-on-surface-variant"><span className="animate-pulse mr-1">•</span> Live</span>
                        </div>
                    </div>

                    <div className="bg-surface border border-outline-variant/40 rounded-[24px] shadow-soft overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-surface-variant/10 text-on-surface-variant text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Container ID</th>
                                        <th className="px-6 py-4">Image</th>
                                        <th className="px-6 py-4">Ports</th>
                                        <th className="px-6 py-4 text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/40">
                                    <AnimatePresence>
                                        {dockerStatus.map((c: any) => (
                                            <motion.tr
                                                key={c.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.3 }}
                                                className="hover:bg-surface-variant/30 transition-colors group relative"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="relative flex h-3 w-3">
                                                            {c.state === 'running' && (
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                            )}
                                                            <span className={`relative inline-flex rounded-full h-3 w-3 ${c.state === 'running' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                        </span>
                                                        <span className="font-bold text-on-surface capitalize">{c.state}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-on-surface text-sm">{c.names || 'Unknown'}</span>
                                                        <span className="text-[12px] font-mono text-on-surface-variant">{c.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">layers</span>
                                                        <span className="truncate max-w-[200px]" title={c.image}>{c.image.split('@')[0]}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {c.ports?.map((p: any, i: number) => (
                                                            <span key={i} className="text-[10px] font-mono bg-surface-variant/50 text-on-surface-variant px-1.5 py-0.5 rounded">
                                                                {p.publicPort}:{p.privatePort}
                                                            </span>
                                                        ))}
                                                        {(!c.ports || c.ports.length === 0) && <span className="text-on-surface-variant text-xs italic">Internal</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-on-surface-variant text-xs font-semibold">{c.status}</span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    {(!dockerStatus || dockerStatus.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                                                Loading container metrics...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}