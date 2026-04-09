import React from 'react';
import { Link, useLocation } from 'react-router';
import { useTheme } from '../hooks/useTheme';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: '首页', path: '/', icon: 'home' },
    { name: '探索', path: '/explore', icon: 'search' },
    { name: '通知', path: '/notifications', icon: 'notifications' },
    { name: '个人资料', path: '/profile', icon: 'person' },
    { name: '撰写', path: '/compose', icon: 'edit' },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen font-inter">
      <div className="max-w-[1280px] mx-auto flex min-h-screen relative">
        {/* SideNavBar */}
        <aside className="hidden lg:flex w-64 h-screen sticky top-0 border-r border-sky-300/10 bg-slate-950/60 backdrop-blur-xl flex-col py-4 px-6 gap-2 shadow-[0_0_30px_rgba(125,211,252,0.05)]">
          <div className="mb-8 px-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-sky-300">cookie</span>
            <span className="text-2xl font-black text-sky-300 tracking-tight">咕咕饼干</span>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 font-inter text-base rounded-full transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'text-sky-300 font-bold bg-sky-300/10'
                      : 'text-slate-400 font-regular hover:bg-slate-800/50'
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 py-3 rounded-full font-bold text-lg active:scale-95 transition-transform shadow-[0_0_20px_rgba(125,211,252,0.1)]">
            发布
          </button>


          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 mb-4 bg-surface-container hover:bg-surface-container-highest text-on-surface border border-outline py-2 rounded-full font-regular text-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-lg">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span>{theme === 'dark' ? '�л�����ģʽ' : '�л���ҹģʽ'}</span>
          </button>
          <div className="mt-auto flex items-center gap-3 p-2 rounded-full hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-background font-bold">
              G
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-on-surface">GuGu User</span>
              <span className="text-xs text-on-surface-variant">@gugu_user</span>
            </div>
            <span className="material-symbols-outlined ml-auto text-on-surface-variant">more_horiz</span>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-[600px] border-r border-sky-300/10">
          {children}
        </main>

        {/* Trends & Suggestions */}
        <aside className="hidden xl:flex w-80 px-6 py-4 flex-col gap-6 sticky top-0 h-screen overflow-y-auto no-scrollbar">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input
              className="w-full bg-surface-container border border-outline-variant focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-full py-3 pl-12 pr-4 text-sm transition-all glass-panel outline-none text-on-surface"
              placeholder="搜索 咕咕饼干"
              type="text"
            />
          </div>

          {/* Trends */}
          <section className="glass-elevated rounded-xl p-4 flex flex-col gap-4">
            <h2 className="text-xl font-black text-on-surface">为您推荐的趋势</h2>
            <div className="flex flex-col gap-4">
              {[
                { category: '技术', name: '#玻璃拟态', posts: '1.25万' },
                { category: '设计', name: '冷光 UI', posts: '8,200' },
                { category: '天气', name: '北极风暴', posts: '4.51万' },
                { category: '娱乐', name: '#GuGu音乐', posts: '2,100' },
              ].map((trend, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="flex justify-between items-center text-xs text-on-surface-variant">
                    <span>{trend.category} · 趋势</span>
                    <span className="material-symbols-outlined text-sm">more_horiz</span>
                  </div>
                  <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{trend.name}</p>
                  <span className="text-xs text-on-surface-variant">{trend.posts} 博文</span>
                </div>
              ))}
            </div>
            <button className="text-primary text-sm font-medium hover:underline text-left">显示更多</button>
          </section>

          {/* Who to follow */}
          <section className="glass-elevated rounded-xl p-4 flex flex-col gap-4">
            <h2 className="text-xl font-black text-on-surface">推荐关注</h2>
            <div className="flex flex-col gap-4">
              {[
                { name: 'Crystal Dev', handle: '@crys_dev', letter: 'C' },
                { name: 'Prism Artist', handle: '@prism_art', letter: 'P' },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sky-200">
                      {user.letter}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold text-sm text-on-surface truncate">{user.name}</span>
                      <span className="text-xs text-on-surface-variant truncate">{user.handle}</span>
                    </div>
                  </div>
                  <button className="bg-on-surface text-background px-4 py-1.5 rounded-full text-sm font-bold hover:bg-on-surface/90 transition-colors">
                    关注
                  </button>
                </div>
              ))}
            </div>
            <button className="text-primary text-sm font-medium hover:underline text-left">显示更多</button>
          </section>

          {/* Footer Links */}
          <footer className="flex flex-wrap gap-x-4 gap-y-2 px-4 text-xs text-on-surface-variant pb-8">
            <a className="hover:underline" href="#">服务条款</a>
            <a className="hover:underline" href="#">隐私政策</a>
            <a className="hover:underline" href="#">Cookie 政策</a>
            <a className="hover:underline" href="#">无障碍性</a>
            <a className="hover:underline" href="#">广告信息</a>
            <span>© 2026 GuGu Biscuit Corp.</span>
          </footer>
        </aside>
      </div>
    </div>
  );
};
