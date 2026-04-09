import AdminDashboard from './pages/AdminDashboard';
import React from 'react';
import { Routes, Route } from 'react-router';
import { AppLayout } from './layouts/AppLayout';

const Home = () => {
    return (
        <>
            {/* TopNavBar (Sticky) */}
            <header className="sticky top-0 z-50 bg-slate-950/75 backdrop-blur-2xl border-b border-sky-300/10 flex justify-between items-center px-4 py-2 w-full">
                <div className="flex items-center gap-8">
                    <span className="text-xl font-black text-sky-300">首页</span>
                    <div className="flex gap-6">
                        <button className="text-sky-300 border-b-2 border-sky-300 pb-2 font-inter text-sm font-medium cursor-pointer transition-opacity active:opacity-70">
                            推荐
                        </button>
                        <button className="text-slate-400 pb-2 font-inter text-sm font-medium hover:text-sky-200 cursor-pointer transition-opacity active:opacity-70">
                            关注
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant hover:text-sky-300 cursor-pointer transition-colors">
                        settings
                    </span>
                </div>
            </header>

            {/* Post Composer */}
            <div className="p-4 border-b border-sky-300/10 glass-panel">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex-shrink-0"></div>
                    <div className="flex-1">
                        <textarea
                            className="w-full bg-transparent border-none focus:ring-0 text-xl placeholder:text-on-surface-variant text-on-surface resize-none h-20 outline-none"
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
                            <button className="bg-primary text-on-primary-fixed px-6 py-2 rounded-full font-bold opacity-50 cursor-not-allowed">
                                发布
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed */}
            <div className="divide-y divide-sky-300/10">
                {/* Post 1 */}
                <article className="p-4 hover:bg-white/5 transition-colors cursor-pointer glass-panel border-none rounded-none">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-800 flex-shrink-0"></div>
                        <div className="flex-1">
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-on-surface">Frost Photo</span>
                                <span className="text-on-surface-variant text-sm">@frost_lens · 8小时</span>
                            </div>
                            <p className="text-on-surface mt-1 leading-relaxed mb-3">
                                晨光照在晶体结构上。绝对的魔法。🏔️
                            </p>
                            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-80 rounded-xl overflow-hidden">
                                <div className="row-span-2 rounded-lg overflow-hidden glass-elevated bg-slate-800 flex items-center justify-center text-sm text-slate-500">Image 1</div>
                                <div className="rounded-lg overflow-hidden glass-elevated bg-slate-800 flex items-center justify-center text-sm text-slate-500">Image 2</div>
                                <div className="rounded-lg overflow-hidden glass-elevated bg-slate-800 flex items-center justify-center text-sm text-slate-500">Image 3</div>
                            </div>
                            <div className="flex justify-between mt-4 max-w-md text-on-surface-variant">
                                <button className="flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xl group-hover:text-sky-400 group-hover:bg-sky-400/10 p-2 rounded-full transition-colors">chat_bubble</span>
                                    <span className="text-sm">112</span>
                                </button>
                                <button className="flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xl group-hover:text-emerald-400 group-hover:bg-emerald-400/10 p-2 rounded-full transition-colors">repeat</span>
                                    <span className="text-sm">204</span>
                                </button>
                                <button className="flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xl group-hover:text-rose-400 group-hover:bg-rose-400/10 p-2 rounded-full transition-colors">favorite</span>
                                    <span className="text-sm">1.4k</span>
                                </button>
                                <button className="flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xl group-hover:text-sky-400 group-hover:bg-sky-400/10 p-2 rounded-full transition-colors">share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Post 2 */}
                <article className="p-4 hover:bg-white/5 transition-colors cursor-pointer glass-panel border-none rounded-none">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0"></div>
                        <div className="flex-1">
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-on-surface">Ice Architect</span>
                                <span className="text-on-surface-variant text-sm">@structure_ice · 5小时</span>
                            </div>
                            <p className="text-on-surface mt-1 leading-relaxed">
                                为未来而设计意味着拥抱透明度和深度。这个生态系统中表面的分层是现代 UI 设计的典范。 #GuGu饼干 #设计系统
                            </p>
                            <div className="flex justify-between mt-4 max-w-md text-on-surface-variant">
                                <button className="flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xl group-hover:text-sky-400 group-hover:bg-sky-400/10 p-2 rounded-full transition-colors">chat_bubble</span>
                                    <span className="text-sm">8</span>
                                </button>
                                <button className="flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xl group-hover:text-emerald-400 group-hover:bg-emerald-400/10 p-2 rounded-full transition-colors">repeat</span>
                                    <span className="text-sm">42</span>
                                </button>
                                <button className="flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xl group-hover:text-rose-400 group-hover:bg-rose-400/10 p-2 rounded-full transition-colors">favorite</span>
                                    <span className="text-sm">89</span>
                                </button>
                                <button className="flex items-center gap-2 group">
                                    <span className="material-symbols-outlined text-xl group-hover:text-sky-400 group-hover:bg-sky-400/10 p-2 rounded-full transition-colors">share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </>
    );
};

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<AppLayout><Home /></AppLayout>} />
            <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
    );
}