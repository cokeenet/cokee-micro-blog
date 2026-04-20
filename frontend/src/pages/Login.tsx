import { Button, Card, Tabs } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import PageBackground from '../components/PageBackground';
import HoverEffectCard from '../components/HoverEffectCard';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../config/api';

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const initialMode = (location.state as { mode?: string } | null)?.mode === 'register' ? 'register' : 'login';
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const redirectTo = (location.state as { from?: string } | null)?.from || '/';
    const isRegister = mode === 'register';

    const submitLabel = useMemo(() => (isRegister ? '创建账号' : '登录'), [isRegister]);

    const handleSubmit = async () => {
        setMessage('');

        try {
            const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
            const body = isRegister ? { username, email, password } : { username, password };

            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json().catch(() => null);
            if (!res.ok || (data && data.code && data.code !== 200)) {
                throw new Error(data?.message || '请求失败');
            }

            if (isRegister) {
                setMode('login');
                setPassword('');
                setMessage('注册成功，请登录');
                return;
            }

            login(data.token, data.user);
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setMessage((err as Error).message);
        }
    };

    return (
        <div className="min-h-screen relative isolate overflow-hidden flex items-center justify-center p-4">
            <PageBackground />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 120, damping: 20 }}
                className="w-[480px] max-w-full relative z-10"
            >
                <HoverEffectCard className="glass-elevated rounded-[2rem] text-on-surface border border-white/20 dark:border-white/5 shadow-2xl backdrop-blur-xl" maxXRotation={2} maxYRotation={2}>
                    <Card.Header className="flex flex-col items-center gap-1 pt-12 pb-4 px-10 border-b-0">
                        <div className="bg-primary/10 p-4 rounded-full mb-3 shadow-glow-soft">
                            <span className="material-symbols-outlined text-4xl text-primary block">ac_unit</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-primary to-rose-400 bg-clip-text text-transparent">
                            Glacier Network
                        </h1>
                        <p className="text-sm text-on-surface-variant font-medium text-center opacity-80 mt-2">
                            {mode === 'login' ? '欢迎回来，保持冷静，连接世界。' : '加入冰川，体验最纯粹的社交。'}
                        </p>
                    </Card.Header>

                    <Card.Content className="px-10 pb-12 pt-2 space-y-6">
                        <Tabs
                            aria-label="Authentication modes"
                            selectedKey={mode}
                            onSelectionChange={(key) => {
                                setMode(key as 'login' | 'register');
                                setMessage('');
                            }}
                            className="bg-surface-variant/50 w-full backdrop-blur-xl p-1 border border-outline-variant/30 flex"
                        >
                            <Tabs.ListContainer>
                                <Tabs.List>
                                    <Tabs.Tab id="login">登录<Tabs.Indicator /></Tabs.Tab>
                                    <Tabs.Tab id="register">注册<Tabs.Indicator /></Tabs.Tab>
                                </Tabs.List>
                            </Tabs.ListContainer>
                        </Tabs>

                        <div className="space-y-4 flex flex-col">
                            {/* Username input capsule */}
                            <div className="relative flex flex-col w-full bg-surface-variant/40 hover:bg-surface-variant/60 focus-within:!bg-surface-variant/80 border border-outline-variant/30 rounded-[24px] px-6 py-3 transition-colors shadow-sm cursor-text group overflow-hidden">
                                <label className="text-xs font-semibold text-on-surface-variant opacity-80 cursor-text pointer-events-none group-focus-within:text-primary transition-colors">
                                    用户名 (Username)
                                </label>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant opacity-70 group-focus-within:text-primary transition-colors">person</span>
                                    <input
                                        type="text"
                                        placeholder="输入你的用户名"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="flex-1 bg-transparent outline-none text-on-surface text-lg placeholder-on-surface-variant/30 font-medium"
                                    />
                                    {username && (
                                        <button onClick={() => setUsername('')} className="bg-on-surface-variant/20 rounded-full w-5 h-5 flex items-center justify-center text-on-surface hover:bg-on-surface-variant/40 transition-colors">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {isRegister && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* Email input capsule */}
                                        <div className="relative flex flex-col w-full bg-surface-variant/40 hover:bg-surface-variant/60 focus-within:!bg-surface-variant/80 border border-outline-variant/30 rounded-[24px] px-6 py-3 transition-colors shadow-sm cursor-text group overflow-hidden">
                                            <label className="text-xs font-semibold text-on-surface-variant opacity-80 cursor-text pointer-events-none group-focus-within:text-primary transition-colors">
                                                邮箱 (Email)
                                            </label>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="material-symbols-outlined text-[20px] text-on-surface-variant opacity-70 group-focus-within:text-primary transition-colors">mail</span>
                                                <input
                                                    type="email"
                                                    placeholder="输入你的邮箱地址"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="flex-1 bg-transparent outline-none text-on-surface text-lg placeholder-on-surface-variant/30 font-medium"
                                                />
                                                {email && (
                                                    <button onClick={() => setEmail('')} className="bg-on-surface-variant/20 rounded-full w-5 h-5 flex items-center justify-center text-on-surface hover:bg-on-surface-variant/40 transition-colors">
                                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Password input capsule */}
                            <div className="relative flex flex-col w-full bg-surface-variant/40 hover:bg-surface-variant/60 focus-within:!bg-surface-variant/80 border border-outline-variant/30 rounded-[24px] px-6 py-3 transition-colors shadow-sm cursor-text group overflow-hidden">
                                <label className="text-xs font-semibold text-on-surface-variant opacity-80 cursor-text pointer-events-none group-focus-within:text-primary transition-colors">
                                    密码 (Password)
                                </label>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant opacity-70 group-focus-within:text-primary transition-colors">key</span>
                                    <input
                                        type="password"
                                        placeholder="输入你的密码"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex-1 bg-transparent outline-none text-on-surface text-lg placeholder-on-surface-variant/30 font-medium tracking-widest"
                                    />
                                    {password && (
                                        <button onClick={() => setPassword('')} className="bg-on-surface-variant/20 rounded-full w-5 h-5 flex items-center justify-center text-on-surface hover:bg-on-surface-variant/40 transition-colors">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className={`rounded-xl p-4 text-sm font-semibold border backdrop-blur-xl flex items-center gap-2 ${message.includes('成功')
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {message.includes('成功') ? 'check_circle' : 'error'}
                                    </span>
                                    {message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            className="w-full bg-primary text-white shadow-glow-soft font-bold text-base h-14 rounded-xl mt-2"
                            onPress={handleSubmit}
                        >
                            {submitLabel}
                        </Button>
                    </Card.Content>
                </HoverEffectCard>
            </motion.div>
        </div>
    );
}

