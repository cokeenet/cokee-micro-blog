import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../config/api';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);

    const fetchUsers = async () => {
        try {
            const res = await fetchWithAuth('/api/admin/users');
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditUser = async (user: any) => {
        const newDisplayName = window.prompt('编辑昵称', user.displayName || user.username);
        if (!newDisplayName) return;
        const newUsername = window.prompt('编辑用户名', user.username) || user.username;
        const newEmail = window.prompt('编辑邮箱', user.email) || user.email;

        try {
            const res = await fetchWithAuth(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...user, displayName: newDisplayName, username: newUsername, email: newEmail })
            });
            if (res.ok) fetchUsers();
            else alert('修改失败');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('警告：此操作不可逆！确认删除用户？')) return;
        try {
            const res = await fetchWithAuth(`/api/admin/users/${userId}`, { method: 'DELETE' });
            if (res.ok) fetchUsers();
            else alert('删除失败');
        } catch (err) {
            console.error(err);
        }
    };

    const toggleAdminRole = async (userId: string, currentRoles: string[]) => {
        const isAdmin = currentRoles.includes('Admin');
        try {
            const res = await fetchWithAuth(`/api/admin/users/${userId}/roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roles: isAdmin ? currentRoles.filter(r => r !== 'Admin') : [...currentRoles, 'Admin']
                })
            });
            if (res.ok) fetchUsers();
            else alert('权限更新失败，可能是当前用户权限不足');
        } catch (error) {
            console.error('Role update error', error);
        }
    };

    const handleCreateUser = async () => {
        const username = window.prompt('请输入用户名');
        if (!username) return;
        const passwordHash = window.prompt('请输入密码', '123456');
        if (!passwordHash) return;
        const displayName = window.prompt('请输入昵称 (可选)', username) || username;
        const email = window.prompt('请输入邮箱 (可选)', '') || '';

        try {
            const res = await fetchWithAuth('/api/admin/users', {
                method: 'POST',
                body: JSON.stringify({ username, passwordHash, displayName, email, roles: ['User'] })
            });
            if (res.ok) fetchUsers();
            else alert('创建失败');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black text-on-surface">全站用户管理</h2>
                    <span className="glass-chip px-2 py-0.5 rounded-full text-xs font-bold text-on-surface-variant">
                        {users.length} 名用户
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button onClick={handleCreateUser} className="bg-primary text-on-primary hover:bg-primary-600 px-3 py-1.5 rounded-card text-sm font-semibold flex items-center gap-1.5 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">add</span> 新建用户
                    </button>
                    <button className="glass-chip px-3 py-1.5 rounded-card text-sm font-semibold flex items-center gap-1.5 hover:bg-surface-variant/50 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">filter_list</span> 状态过滤
                    </button>
                    <div className="relative flex-1 sm:flex-none">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
                        <input type="text" placeholder="搜索用户名、邮箱..." className="glass-chip border-none outline-none py-1.5 pl-9 pr-3 rounded-card text-sm text-on-surface placeholder:text-on-surface-variant w-full sm:w-48" />
                    </div>
                </div>
            </div>

            <div className="glass-elevated rounded-panel overflow-x-auto border-none mb-8">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface/40 backdrop-blur-xl border-b border-outline-variant/40 text-on-surface-variant font-semibold">
                        <tr>
                            <th className="px-6 py-4">用户资料</th>
                            <th className="px-6 py-4">系统角色</th>
                            <th className="px-6 py-4">状态</th>
                            <th className="px-6 py-4">注册时间</th>
                            <th className="px-6 py-4 text-right">管理操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl.replace('5253', '8080')} alt={user.userName} className="w-10 h-10 rounded-full object-cover shadow-soft" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-soft">
                                            {user.displayName ? user.displayName.substring(0, 1).toUpperCase() : user.userName.substring(0, 1).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="font-bold text-on-surface text-base">{user.displayName || user.userName}</span>
                                        <span className="text-xs text-on-surface-variant">@{user.userName} • {user.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-1.5">
                                        {(user.roles && user.roles.length > 0 ? user.roles : ['User']).map((role: string) => (
                                            <span key={role} className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${role === 'Admin' ? 'border-primary/50 text-primary bg-primary/10' : 'border-outline-variant/50 text-on-surface-variant bg-surface-variant/30'}`}>
                                                {role === 'Admin' ? '管理员' : '普通用户'}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 正常
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-semibold text-on-surface-variant">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => toggleAdminRole(user.id, user.roles || [])}
                                            className="px-3 py-1.5 rounded-card text-xs font-bold border border-outline-variant/50 text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
                                        >
                                            {(user.roles || []).includes('Admin') ? '剥夺管理员' : '设为管理员'}
                                        </button>
                                        <button onClick={() => handleEditUser(user)} className="glass-chip p-1.5 rounded-full hover:bg-surface-variant/80 transition-colors text-primary hover:text-primary-600 ml-1" title="编辑资料">
                                            <span className="material-symbols-outlined text-[16px] block">edit</span>
                                        </button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 p-1.5 rounded-full transition-colors ml-1" title="删除账号">
                                            <span className="material-symbols-outlined text-[16px] block">delete_forever</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant font-semibold">
                                    暂无用户数据
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}