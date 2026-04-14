import { Button } from '@heroui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import HoverEffectCard from '../components/HoverEffectCard';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="flex h-[80vh] items-center justify-center p-6 bg-surface">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-full max-w-md text-center"
            >
                <HoverEffectCard className="glass-panel p-8 md:p-12 rounded-[24px]">
                    <div className="text-[120px] font-black leading-none bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                        404
                    </div>
                    <h1 className="text-2xl font-bold text-on-surface mb-2">迷失在冰川之中</h1>
                    <p className="text-on-surface-variant font-medium mb-8">
                        你要寻找的页面已经被冰雪覆盖，或者根本不曾存在。
                    </p>

                    <Button
                        size="lg"
                        className="bg-primary text-white font-bold w-full rounded-2xl shadow-glow-soft"
                        onPress={() => navigate('/')}
                    >
                        返回主页
                    </Button>
                </HoverEffectCard>
            </motion.div>
        </div>
    );
}