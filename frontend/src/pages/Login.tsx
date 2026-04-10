import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { username, email, passwordHash: password }
        : { username, password };

      const res = await fetch(`http://localhost:5246${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || '请求失败');
      }

      if (isRegister) {
        setIsRegister(false);
        setPassword('');
        setError('注册成功，请登录');
      } else {
        login(data.token, data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-background">
      <div className="glass-elevated p-8 rounded-2xl w-full max-w-md shadow-lg border border-slate-200 dark:border-sky-300/10">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-5xl text-sky-500 mb-2">cookie</span>
          <h1 className="text-2xl font-black text-slate-800 dark:text-sky-300">{isRegister ? '注册账号' : '欢迎登录'}</h1>
        </div>

        {error && <div className={`p-3 mb-4 rounded-lg text-sm ${error.includes('成功') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">用户名</label>
            <input
              required
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-sky-300/20 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              placeholder="请输入用户名"
            />
          </div>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">邮箱地址</label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-sky-300/20 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                placeholder="请输入邮箱地址"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">密码</label>
            <input
              required
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-sky-300/20 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              placeholder="请输入密码"
            />
          </div>
          <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 rounded-full transition-all mt-4">
            {isRegister ? '立 即 注 册' : '登 录'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {isRegister ? '已有账号？' : '没有账号？'}
          <button onClick={() => setIsRegister(!isRegister)} className="text-sky-500 hover:text-sky-600 font-medium ml-1">
            {isRegister ? '直接登录' : '立即注册'}
          </button>
        </div>
      </div>
    </div>
  );
}
