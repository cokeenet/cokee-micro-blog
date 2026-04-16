import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../config/api';

export default function AdminPosts() {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // all, post, comment

    const loadPosts = async () => {
        setIsLoading(true);
        try {
            const res = await fetchWithAuth(`/api/admin/posts?type=${filterType}`);
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (err) {
            console.error('Failed to load posts:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, [filterType]);

    const handleEdit = async (post: any) => {
        const newContent = window.prompt('编辑内容', post.content);
        if (!newContent) return;
        try {
            const res = await fetchWithAuth(`/api/admin/posts/${post.id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...post, content: newContent })
            });
            if (res.ok) {
                loadPosts();
            } else {
                alert('编辑失败');
            }
        } catch (err) {
            console.error('Edit error:', err);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!window.confirm('确定删除？')) return;
        try {
            const res = await fetchWithAuth(`/api/admin/posts/${postId}`, { method: 'DELETE' });
            if (res.ok) {
                setPosts(posts.filter(p => p.id !== postId));
            } else {
                alert('删除失败');
            }
        } catch {
            console.error('Network error');
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black text-on-surface">全站内容管理</h2>
                    <span className="glass-chip px-2 py-0.5 rounded-full text-xs font-bold text-on-surface-variant">
                        {posts.length} 条记录
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <select
                        className="glass-chip border-none outline-none py-1.5 px-3 rounded-card text-sm text-on-surface focus:ring-2 focus:ring-primary/20 appearance-none pr-8 cursor-pointer"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">全部内容</option>
                        <option value="post">仅主贴</option>
                        <option value="comment">仅评论</option>
                    </select>
                    <div className="relative flex-1 sm:flex-none">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
                        <input type="text" placeholder="搜索内容、作者..." className="glass-chip border-none outline-none py-1.5 pl-9 pr-3 rounded-card text-sm text-on-surface placeholder:text-on-surface-variant w-full sm:w-48" />
                    </div>
                </div>
            </div>

            <div className="glass-elevated rounded-panel overflow-x-auto border-none mb-8">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-surface/40 backdrop-blur-xl border-b border-outline-variant/40 text-on-surface-variant font-semibold">
                        <tr>
                            <th className="px-6 py-4">内容</th>
                            <th className="px-6 py-4">作者</th>
                            <th className="px-6 py-4">转评赞</th>
                            <th className="px-6 py-4">发布时间</th>
                            <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">加载中...</td>
                            </tr>
                        ) : posts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">暂无发表内容</td>
                            </tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4 font-semibold text-on-surface max-w-[300px] truncate">
                                        {post.content || '无文字内容'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-on-surface text-sm">{post.authorDisplayName || '未知'}</span>
                                            <span className="text-xs text-on-surface-variant">{post.authorUsername}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-on-surface-variant text-xs">
                                        <div className="flex gap-3">
                                            <span title="转发"><span className="material-symbols-outlined text-[14px] align-middle">repeat</span> {post.retweetCount || 0}</span>
                                            <span title="评论"><span className="material-symbols-outlined text-[14px] align-middle">chat_bubble</span> {post.replyCount || 0}</span>
                                            <span title="点赞"><span className="material-symbols-outlined text-[14px] align-middle">favorite</span> {post.likeCount || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-on-surface-variant">
                                        {new Date(post.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button className="glass-chip p-1.5 rounded-full hover:bg-surface-variant/80 transition-colors text-on-surface-variant hover:text-on-surface" title="查看详情">
                                                <span className="material-symbols-outlined text-[16px] block">visibility</span>
                                            </button>
                                            <button className="glass-chip p-1.5 rounded-full hover:bg-surface-variant/80 transition-colors text-primary hover:text-primary-600" title="编辑" onClick={(e) => { e.stopPropagation(); handleEdit(post); }}>
                                                <span className="material-symbols-outlined text-[16px] block">edit</span>
                                            </button>
                                            <button
                                                className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 p-1.5 rounded-full transition-colors ml-1"
                                                title="下架/删除"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(post.id);
                                                }}
                                            >
                                                <span className="material-symbols-outlined text-[16px] block">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}