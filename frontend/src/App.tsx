import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { AppLayout } from './layouts/AppLayout';
import { useAuth } from './hooks/useAuth';

const Home = () => {
    const { user, token } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [content, setContent] = useState('');

    useEffect(() => {
        fetch('http://localhost:5246/api/posts')
            .then(res => res.json())
            .then(data => setPosts(data))
            .catch(err => console.error(err));
    }, []);

    const handlePost = async () => {
        if (!content.trim()) return;
        try {
            const res = await fetch('http://localhost:5246/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content, type: 0 })
            });
            if (res.ok) {
                setContent('');
                const newPost = await res.json();
                newPost.authorUsername = `@${user?.username}`;
                setPosts([newPost, ...posts]);
            } else {
                alert('发送失败，请检查登录状态');
            }
        } catch (e) {
            alert('请求失败');
        }
    };

    return (
        <>
            {/* TopNavBar (Sticky) */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/75 backdrop-blur-2xl border-b border-slate-200 dark:border-sky-300/10 flex justify-between items-center px-4 py-2 w-full">
                <div className="flex items-center gap-8">
                    <span className="text-xl font-black text-sky-500 dark:text-sky-300">首页</span>
                    <div className="flex gap-6">
                        <button className="text-sky-500 dark:text-sky-300 border-b-2 border-sky-300 pb-2 font-inter text-sm font-medium cursor-pointer transition-opacity active:opacity-70">
                            推荐
                        </button>
                        <button className="text-slate-600 dark:text-slate-400 pb-2 font-inter text-sm font-medium hover:text-sky-600 dark:hover:text-sky-200 cursor-pointer transition-opacity active:opacity-70">
                            关注
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant hover:text-sky-500 dark:text-sky-300 cursor-pointer transition-colors">
                        settings
                    </span>
                </div>
            </header>

            {/* Post Composer */}
            <div className="p-4 border-b border-slate-200 dark:border-sky-300/10 glass-panel">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex-shrink-0"></div>
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-xl placeholder:text-slate-400 dark:placeholder:text-on-surface-variant text-slate-800 dark:text-on-surface resize-none h-20 outline-none"
                            placeholder="有什么新鲜事？"
                        ></textarea>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-sky-300/5">
                            <div className="flex gap-1">
                                <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center">
                                    <span className="material-symbols-outlined">image</span>
                                </button>
                                <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center">
                                    <span className="material-symbols-outlined">gif_box</span>
                                </button>
                                <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center">
                                    <span className="material-symbols-outlined">ballot</span>
                                </button>
                                <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center">
                                    <span className="material-symbols-outlined">sentiment_satisfied</span>
                                </button>
                            </div>
                            <button
                                onClick={handlePost}
                                disabled={!content.trim()}
                                className={`bg-primary text-white dark:text-on-primary-fixed px-6 py-2 rounded-full font-bold ${!content.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-600 transition-colors shadow-md'}`}
                            >
                                发布
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed */}
            <div className="divide-y divide-sky-300/10">
                {posts.map((post, idx) => (
                    <article key={post.id || idx} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer glass-panel border-none rounded-none">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-sky-500 dark:bg-sky-800 flex-shrink-0 flex items-center justify-center text-white font-bold">
                                {post.authorUsername?.[1]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-slate-800 dark:text-on-surface">
                                        {post.authorUsername?.replace('@', '') || 'Unknown User'}
                                    </span>
                                    <span className="text-slate-500 dark:text-on-surface-variant text-sm">
                                        {post.authorUsername} �� {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-slate-800 dark:text-on-surface mt-1 leading-relaxed mb-3 whitespace-pre-wrap">
                                    {post.content}
                                </p>
                                <div className="flex justify-between mt-4 max-w-md text-slate-500 dark:text-on-surface-variant">
                                    <button className="flex items-center gap-2 group">
                                        <span className="material-symbols-outlined text-xl group-hover:text-sky-500 group-hover:bg-sky-100 dark:group-hover:text-sky-400 dark:group-hover:bg-sky-400/10 p-2 rounded-full transition-colors">chat_bubble</span>
                                        <span className="text-sm">0</span>
                                    </button>
                                    <button className="flex items-center gap-2 group">
                                        <span className="material-symbols-outlined text-xl group-hover:text-emerald-500 group-hover:bg-emerald-100 dark:group-hover:text-emerald-400 dark:group-hover:bg-emerald-400/10 p-2 rounded-full transition-colors">repeat</span>
                                        <span className="text-sm">0</span>
                                    </button>
                                    <button className="flex items-center gap-2 group">
                                        <span className="material-symbols-outlined text-xl group-hover:text-rose-500 group-hover:bg-rose-100 dark:group-hover:text-rose-400 dark:group-hover:bg-rose-400/10 p-2 rounded-full transition-colors">favorite</span>
                                        <span className="text-sm">0</span>
                                    </button>
                                    <button className="flex items-center gap-2 group">
                                        <span className="material-symbols-outlined text-xl group-hover:text-sky-500 group-hover:bg-sky-100 dark:group-hover:text-sky-400 dark:group-hover:bg-sky-400/10 p-2 rounded-full transition-colors">share</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
                {posts.length === 0 && (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        ��û���˷�����������һ���ɣ�
                    </div>
                )}
            </div>
        </>
    );
};

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout><Home /></AppLayout>} />
            <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
    );
}