import { Card } from '@heroui/react';
import { useNavigate } from 'react-router';
import HoverEffectCard from '../components/HoverEffectCard';

export function AuthHeroCard({ compact = false }: { compact?: boolean }) {
    const navigate = useNavigate();

    return (
        <HoverEffectCard className={`overflow-hidden glass-elevated ${compact ? 'rounded-card' : 'rounded-panel'} text-on-surface`} maxXRotation={3} maxYRotation={3}>
            <Card.Content className={`${compact ? 'px-6 py-6' : 'px-8 py-8'} space-y-4`}>
                <h1 className={`${compact ? 'text-2xl' : 'text-3xl'} font-black text-on-surface`}>加入冰川社交网络</h1>
                <p className="text-sm text-on-surface-variant">最为空灵的社交体验。保持冷静，与全球趋势实时连接。</p>
                <div className="flex gap-3 pt-1">
                    <button
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-glow-soft"
                        onClick={() => navigate('/login', { state: { mode: 'register' } })}
                    >
                        创建账号
                    </button>
                    <button
                        className="bg-transparent border border-outline hover:bg-white/40 dark:hover:bg-white/5 text-on-surface px-6 py-2 rounded-full font-bold transition-colors"
                        onClick={() => navigate('/login')}
                    >
                        登录
                    </button>
                </div>
            </Card.Content>
        </HoverEffectCard>
    );
}

export default function AuthPromptPage() {
    return (
        <section className="p-6 app-page-enter">
            <AuthHeroCard />
        </section>
    );
}

