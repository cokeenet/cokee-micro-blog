import { Button, Card, Input } from '@heroui/react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import HoverEffectCard from '../components/HoverEffectCard';
import PageBackground from '../components/PageBackground';
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
            const endpoint = isRegister ? '/auth/register' : '/auth/login';
            const body = isRegister ? { username, email, passwordHash: password } : { username, password };

            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
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
        <div className="min-h-screen px-4 py-10 relative isolate overflow-hidden">
            <PageBackground />
            <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2 relative z-10 app-page-enter">
                <HoverEffectCard className="glass-elevated rounded-panel text-on-surface" maxXRotation={3} maxYRotation={3}>
                    <Card.Content className="space-y-4 p-8">
                        <h1 className="text-5xl font-black leading-tight">加入冰川社交网络</h1>
                        <p className="text-lg text-on-surface-variant">最为空灵的社交体验。保持冷静，与全球趋势实时连接。</p>
                        <div className="flex gap-3 pt-2">
                            <Button variant="primary" className="shadow-glow-soft" onPress={() => setMode('register')}>
                                创建账号
                            </Button>
                            <Button variant="outline" className="border-outline text-on-surface" onPress={() => setMode('login')}>
                                登录
                            </Button>
                        </div>
                    </Card.Content>
                </HoverEffectCard>

                <Card className="glass-elevated rounded-panel">
                    <Card.Content className="p-6">
                        <div className="flex gap-2">
                            <Button variant={mode === 'login' ? 'primary' : 'ghost'} onPress={() => setMode('login')}>
                                登录
                            </Button>
                            <Button variant={mode === 'register' ? 'primary' : 'ghost'} onPress={() => setMode('register')}>
                                注册
                            </Button>
                        </div>

                        <div className="mt-5 space-y-3">
                            <Input placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} />
                            {isRegister && <Input placeholder="邮箱" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
                            <Input placeholder="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        {message && (
                            <div className={`mt-4 rounded-xl p-3 text-sm ${message.includes('成功') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'}`}>
                                {message}
                            </div>
                        )}

                        <Button className="mt-5 w-full" variant="primary" onPress={handleSubmit}>
                            {submitLabel}
                        </Button>
                    </Card.Content>
                </Card>
            </div>
        </div>
    );
}
