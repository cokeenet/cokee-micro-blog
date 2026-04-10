import { Card, Input } from '@heroui/react';

export default function ExplorePage() {
    return (
        <section className="p-6 app-page-enter">
            <h1 className="text-3xl font-black text-on-surface">探索</h1>
            <div className="mt-4 max-w-xl">
                <Input className="glass-panel rounded-full" placeholder="搜索话题、用户或内容" />
            </div>
            <Card className="mt-6 glass-elevated rounded-panel">
                <Card.Content className="text-on-surface-variant">
                    热门趋势和推荐内容将显示在这里。
                </Card.Content>
            </Card>
        </section>
    );
}
