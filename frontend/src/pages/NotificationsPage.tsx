import { Card, Avatar } from '@heroui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { fetchWithAuth } from '../config/api';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const res = await fetchWithAuth('/api/users/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    return (
        <section className="p-6 app-page-enter">
            <h1 className="text-3xl font-black text-on-surface mb-6">通知</h1>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse glass-panel rounded-lg h-24" />
                    ))}
                </div>
            ) : notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map((notif: any, i: number) => (
                        <Card
                            key={i}
                            className="glass-elevated rounded-card bg-surface/40 hover:bg-surface/60 transition-colors cursor-pointer border-none shadow-none"
                        >
                            <div
                                className="p-4 flex items-start gap-4"
                                onClick={() => {
                                    if (notif.postId) {
                                        navigate(`/post/${notif.postId}`);
                                    } else {
                                        navigate(`/profile/${notif.actorUsername}`);
                                    }
                                }}
                            >
                                <div className="text-2xl pt-1">
                                    {notif.type === 'Like' && <span className="text-red-500 material-symbols-outlined material-fill">favorite</span>}
                                    {notif.type === 'Follow' && <span className="text-primary material-symbols-outlined material-fill">person</span>}
                                    {notif.type === 'Reply' && <span className="text-blue-400 material-symbols-outlined material-fill">chat_bubble</span>}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <Avatar.Image src={typeof (notif.actorAvatarUrl || undefined) === 'string' ? (notif.actorAvatarUrl || undefined).replace('5253', '8080') : (notif.actorAvatarUrl || undefined)} />
                                            <Avatar.Fallback className="bg-surface-variant text-on-surface text-xs">{(notif.actorDisplayName || notif.actorUsername).charAt(0).toUpperCase()}</Avatar.Fallback>
                                        </Avatar>
                                        <span className="font-bold text-on-surface">{notif.actorDisplayName || notif.actorUsername}</span>
                                        <span className="text-on-surface-variant">@{notif.actorUsername}</span>
                                        <span className="text-on-surface-variant">{notif.actionText}</span>
                                        <span className="text-on-surface-variant ml-auto text-sm">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {notif.content && (
                                        <p className="text-on-surface-variant italic">
                                            "{notif.content}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="mt-4 glass-panel rounded-panel text-center py-10">
                    <Card.Content className="text-on-surface-variant">
                        暂无新通知.
                    </Card.Content>
                </Card>
            )}
        </section>
    );
}


