import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../config/api';

export default function AdminTrends() {
    const [trends, setTrends] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTrendName, setNewTrendName] = useState('');
    const [newTrendCategory, setNewTrendCategory] = useState('话题');

    // 推荐关注设置
    const [recommendMode, setRecommendMode] = useState<'random' | 'specific'>('random');
    const [recommendedUsers, setRecommendedUsers] = useState<{ id: string, name: string, username: string, avatar: string }[]>([]);
    const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
    const [searchUsername, setSearchUsername] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const loadTrends = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth('/api/trends/admin');
            if (res.ok) {
                const data = await res.json();
                setTrends(Array.isArray(data) ? data : data.items || []);
            } else {
                setTrends([]);
            }
        } catch (e) {
            console.error('Failed to load trends', e);
        } finally {
            setIsLoading(false);
        }
    };

    const loadConfig = async () => {
        try {
            const res = await fetchWithAuth('/api/admin/recommend-config');
            if (res.ok) {
                const data = await res.json();
                setRecommendMode(data.mode);
                setRecommendedUsers(data.users || []);
            }
        } catch (e) {
            console.error('Failed to load config', e);
        }
    };

    const saveConfig = async (mode: string, users: any[]) => {
        try {
            await fetchWithAuth('/api/admin/recommend-config', {
                method: 'POST',
                body: JSON.stringify({
                    mode: mode,
                    users: users.map(u => u.id)
                })
            });
        } catch (e) {
            console.error('Failed to save config', e);
        }
    };

    useEffect(() => {
        loadTrends();
        loadConfig();
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!searchUsername.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                const res = await fetchWithAuth(`/api/users/search?q=${encodeURIComponent(searchUsername)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                }
            } catch (e) {
                console.error(e);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchUsername]);

    const handleDeleteTrend = async (id: string) => {
        if (!window.confirm('确定要删除这个趋势吗？')) return;
        try {
            const res = await fetchWithAuth(`/api/trends/admin/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadTrends();
            } else {
                alert('删除失败');
            }
        } catch {
            alert('网络错误');
        }
    };

    const handleEditTrend = async (trend: any) => {
        const newName = window.prompt('编辑话题名称', trend.name);
        if (!newName) return;
        try {
            const res = await fetchWithAuth(`/api/trends/admin/${trend.id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...trend, name: newName })
            });
            if (res.ok) {
                loadTrends();
            } else {
                alert('编辑失败');
            }
        } catch {
            alert('网络错误');
        }
    };

    const handleCreateTrend = async () => {
        if (!newTrendName.trim()) return;
        try {
            const res = await fetchWithAuth('/api/trends/admin', {
                method: 'POST',
                body: JSON.stringify({
                    name: newTrendName,
                    category: newTrendCategory
                })
            });
            if (res.ok) {
                setIsModalOpen(false);
                setNewTrendName('');
                loadTrends(); // reload to get new list
            } else {
                alert('创建失败');
            }
        } catch (e) {
            alert('网络错误');
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-on-surface">发现页管理与系统推荐</h2>
                    <p className="text-sm text-on-surface-variant mt-1">管理全站趋势话题以及推荐关注机制</p>
                </div>
            </div>

            {/* 推荐关注设置区 */}
            <div className="bg-surface border border-outline-variant/40 rounded-[24px] shadow-soft p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">group_add</span>
                        新用户推荐关注配置
                    </h3>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 p-3 bg-surface-variant/20 rounded-xl border border-outline-variant/30">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="recMode"
                                className="w-4 h-4 accent-primary"
                                checked={recommendMode === 'random'}
                                onChange={() => {
                                    setRecommendMode('random');
                                    saveConfig('random', recommendedUsers);
                                }}
                            />
                            <span className="text-sm font-semibold text-on-surface">模式 1：智能随机推荐 3 个优质活跃博主</span>
                        </label>
                        <p className="text-xs text-on-surface-variant pl-7">根据算法与系统活跃度，动态生成要展示的 3 个待关注用户卡片。</p>
                    </div>

                    <div className="flex flex-col gap-2 p-3 bg-surface-variant/20 rounded-xl border border-outline-variant/30">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="recMode"
                                className="w-4 h-4 accent-primary"
                                checked={recommendMode === 'specific'}
                                onChange={() => {
                                    setRecommendMode('specific');
                                    saveConfig('specific', recommendedUsers);
                                }}
                            />
                            <span className="text-sm font-semibold text-on-surface">模式 2：固定推荐特定账号（最多 3 个）</span>
                        </label>
                        <p className="text-xs text-on-surface-variant pl-7">强运营模式，手动干预设定必须引导新用户关注的重要大 V。仅配置了 {recommendedUsers.length} / 3 个。</p>

                        {recommendMode === 'specific' && (
                            <div className="pl-7 mt-2 flex flex-col gap-3">
                                <div className="flex gap-2">
                                    {recommendedUsers.map((rUser) => (
                                        <div key={rUser.id} className="flex items-center gap-2 bg-surface border border-outline-variant/40 rounded-full px-3 py-1.5 shadow-sm">
                                            <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                                {rUser.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold leading-tight">{rUser.name}</span>
                                                <span className="text-[10px] text-on-surface-variant leading-tight">@{rUser.username}</span>
                                            </div>
                                            <button
                                                className="ml-1 text-on-surface-variant hover:text-red-500 transition-colors"
                                                onClick={() => {
                                                    const nu = recommendedUsers.filter(u => u.id !== rUser.id);
                                                    setRecommendedUsers(nu);
                                                    saveConfig(recommendMode, nu);
                                                }}
                                            >
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </div>
                                    ))}

                                    {recommendedUsers.length < 3 && (
                                        <button
                                            className="flex items-center gap-1 border border-dashed border-primary/50 text-primary hover:bg-primary/5 px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
                                            onClick={() => setIsUserSearchOpen(true)}
                                        >
                                            <span className="material-symbols-outlined text-[14px]">add</span> 添加
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 用户搜索选择 Modal */}
            {isUserSearchOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-xl">
                    <div className="bg-surface p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-outline-variant/30 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-on-surface">选择推荐用户</h3>
                            <button onClick={() => setIsUserSearchOpen(false)} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <input
                            className="bg-surface-variant/30 border border-outline-variant/50 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary w-full text-on-surface"
                            placeholder="搜索用户名..."
                            value={searchUsername}
                            onChange={e => setSearchUsername(e.target.value)}
                        />
                        <div className="mt-4 flex flex-col gap-2 min-h-[120px]">
                            {searchUsername.trim() ? (
                                searchResults.length > 0 ? (
                                    searchResults.map(user => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-2 hover:bg-surface-variant/30 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-primary/20"
                                            onClick={() => {
                                                if (recommendedUsers.some(u => u.id === user.id)) return;
                                                const nu = [...recommendedUsers, { id: user.id, name: user.displayName || user.username, username: user.username, avatar: user.avatarUrl || '' }];
                                                setRecommendedUsers(nu);
                                                saveConfig(recommendMode, nu);
                                                setSearchUsername('');
                                                setIsUserSearchOpen(false);
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold">{(user.displayName || user.username).charAt(0).toUpperCase()}</div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">{user.displayName || user.username}</span>
                                                    <span className="text-[10px] text-on-surface-variant">@{user.username}</span>
                                                </div>
                                            </div>
                                            {recommendedUsers.some(u => u.id === user.id) ? (
                                                <span className="text-on-surface-variant text-xs font-bold px-2 py-1">已添加</span>
                                            ) : (
                                                <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-full">添加</span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-xs text-on-surface-variant py-8">找不到改用户</div>
                                )
                            ) : (
                                <div className="text-center text-xs text-on-surface-variant py-8">输入用户名以搜索，点击即可选中</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mt-2">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-on-surface">全站热度趋势榜</h2>
                    <p className="text-sm text-on-surface-variant mt-1">管理手工创建以及系统自动聚合的话题趋势</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white shadow-glow-soft px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-[18px]">add</span> 新建手工趋势
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xl">
                    <div className="bg-surface p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-outline-variant/30">
                        <h3 className="text-xl font-bold mb-4 text-on-surface">新建手工趋势</h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm text-on-surface-variant mb-1 block">话题名称 (如 #前端开发)</label>
                                <input
                                    className="w-full bg-surface-variant/30 border border-outline-variant/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary text-on-surface"
                                    value={newTrendName}
                                    onChange={e => setNewTrendName(e.target.value)}
                                    placeholder="#话题"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-on-surface-variant mb-1 block">分类 (默认 话题)</label>
                                <input
                                    className="w-full bg-surface-variant/30 border border-outline-variant/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary text-on-surface"
                                    value={newTrendCategory}
                                    onChange={e => setNewTrendCategory(e.target.value)}
                                    placeholder="话题"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end mt-6">
                            <button className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-variant/50 text-on-surface" onClick={() => setIsModalOpen(false)}>取消</button>
                            <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90" onClick={handleCreateTrend}>确认创建</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-surface border border-outline-variant/40 rounded-[24px] shadow-soft overflow-hidden">
                <div className="p-6 border-b border-outline-variant/40 bg-surface-variant/20 flex items-center justify-between">
                    <h3 className="font-bold text-on-surface">热度话题排行榜</h3>
                    <button onClick={loadTrends} disabled={isLoading} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        {isLoading ? '加载中...' : '手动刷新重新计算'}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-surface-variant/10 text-on-surface-variant text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">排名</th>
                                <th className="px-6 py-4">标签/话题名称</th>
                                <th className="px-6 py-4">累计内容数</th>
                                <th className="px-6 py-4">近 24 小时增长趋势</th>
                                <th className="px-6 py-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/40">
                            {trends.map((item, index) => (
                                <tr key={item.id} className="hover:bg-surface-variant/30 transition-colors">
                                    <td className="px-6 py-4 font-black text-xl text-on-surface-variant w-16">
                                        #{index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-[20px]">tag</span>
                                            <span className="font-bold text-base text-on-surface">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-on-surface-variant">
                                        {item.postCount || 0}
                                    </td>
                                    <td className="px-6 py-4 font-bold">
                                        +0%
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-xs text-on-surface-variant hover:text-red-500 font-bold uppercase transition-colors mr-3" onClick={() => handleDeleteTrend(item.id)}>
                                            删除
                                        </button>
                                        <button className="text-xs text-primary font-bold uppercase transition-colors" onClick={() => handleEditTrend(item)}>
                                            编辑名字
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}