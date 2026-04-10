import { Card } from '@heroui/react';

export default function NotificationsPage() {
    return (
        <section className="p-6 app-page-enter">
            <h1 className="text-3xl font-black text-on-surface">通知</h1>
            <Card className="mt-4 glass-panel rounded-panel">
                <Card.Content className="text-on-surface-variant">
                    这里将展示点赞、评论、关注等动态通知。
                </Card.Content>
            </Card>
        </section>
    );
}
