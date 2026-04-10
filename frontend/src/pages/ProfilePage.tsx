import { Avatar, Button, Card, Chip, ComboBox, Input, ListBox } from '@heroui/react';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../config/api';

export default function ProfilePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('posts');
    const [userPosts, setUserPosts] = useState<any[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Since there is no specific user post API yet, we fetch all and filter client-side for now
                const res = await fetch(`${API_BASE_URL}/posts`);
                const data: any[] = await res.json();
                if (user) {
                    setUserPosts(data.filter((p: any) => p.authorUsername === `@${user.username}`));
                }
            } catch (err) {
                console.error(err);
            }
        };

        if (user) {
            fetchPosts();
        }
    }, [user]);

    if (!user) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-on-surface-variant app-page-enter">
                请先登录以查看个人资料
            </div>
        );
    }

    return (
        <section className="app-page-enter">
            <header className="sticky top-0 z-20 border-b border-outline-variant/60 glass-panel px-4 py-3">
                <div className="text-sm text-on-surface-variant">{userPosts.length} 帖子</div>
                <h1 className="text-2xl font-extrabold text-on-surface">{user.displayName || user.username}</h1>
            </header>

            <div className="relative h-52 overflow-hidden bg-slate-200 dark:bg-slate-800 soft-surface">
                {/* Fallback cover image */}
                <div className="h-full w-full bg-gradient-to-r from-primary/30 to-secondary/30"></div>
            </div>

            <div className="px-5 pb-8">
                <div className="-mt-16 flex items-end justify-between">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl dark:border-surface drop-shadow-md">
                        <Avatar.Image src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.username || 'U')}&background=bfdbfe&color=0f172a`} />
                        <Avatar.Fallback className="text-4xl bg-surface-variant text-on-surface">{(user?.displayName || user?.username || 'U').charAt(0).toUpperCase()}</Avatar.Fallback>
                    </Avatar>
                    <Button variant="outline" className="glass-chip">
                        编辑个人资料
                    </Button>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-4xl font-black tracking-tight text-on-surface">{user.displayName || user.username}</h2>
                        <Chip variant="soft" size="sm" className="border border-primary text-primary">
                            已认证
                        </Chip>
                    </div>
                    <p className="text-lg text-on-surface-variant">@{user.username}</p>
                    <div className="flex gap-5 text-sm text-on-surface pt-2">
                        <span><b>0</b> 正在关注</span>
                        <span><b>0</b> 关注者</span>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: 'posts', label: '帖子' },
                                { key: 'replies', label: '回复' },
                                { key: 'highlights', label: '亮点' },
                                { key: 'articles', label: '文章' },
                                { key: 'media', label: '媒体' },
                                { key: 'likes', label: '喜欢' }
                            ].map((tab) => (
                                <Button key={tab.key} variant={activeTab === tab.key ? 'primary' : 'ghost'} size="sm" onPress={() => setActiveTab(tab.key)}>
                                    {tab.label}
                                </Button>
                            ))}
                        </div>
                        <ComboBox className="w-40 -mt-1">
                            <ComboBox.InputGroup>
                                <Input placeholder="Filter items..." />
                                <ComboBox.Trigger />
                            </ComboBox.InputGroup>
                            <ComboBox.Popover>
                                <ListBox>
                                    <ListBox.Item id="all" textValue="All">All Items</ListBox.Item>
                                    <ListBox.Item id="recent" textValue="Recent">Recent</ListBox.Item>
                                    <ListBox.Item id="popular" textValue="Popular">Popular</ListBox.Item>
                                </ListBox>
                            </ComboBox.Popover>
                        </ComboBox>
                    </div>

                    {activeTab === 'posts' && (
                        <div className="flex flex-col gap-4 mt-4">
                            {userPosts.length > 0 ? (
                                userPosts.map((post: any) => (
                                    <ProfilePost key={post.id} post={post} user={user} />
                                ))
                            ) : (
                                <Placeholder text="还没有发布过任何帖子" />
                            )}
                        </div>
                    )}
                    {activeTab === 'replies' && <Placeholder text="还没有回复内容" />}
                    {activeTab === 'highlights' && <Placeholder text="还没有亮点内容" />}
                    {activeTab === 'articles' && <Placeholder text="还没有长文" />}
                    {activeTab === 'media' && <Placeholder text="还没有媒体内容" />}
                    {activeTab === 'likes' && <Placeholder text="还没有喜欢内容" />}
                </div>
            </div>
        </section>
    );
}

function Placeholder({ text }: { text: string }) {
    return (
        <Card className="mt-4 glass-elevated rounded-card bg-transparent shadow-none border-none">
            <div className="py-10 text-center text-on-surface-variant">{text}</div>
        </Card>
    );
}

function ProfilePost({ post, user }: { post: any, user: any }) {
    return (
        <Card className="glass-elevated rounded-card bg-surface/40 hover:bg-surface/60 transition-colors cursor-pointer border-none shadow-none">
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <Avatar className="shrink-0">
                        <Avatar.Image src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.username || 'U')}&background=bfdbfe&color=0f172a`} />
                        <Avatar.Fallback className="bg-surface-variant text-on-surface">{(user?.displayName || user?.username || 'U').charAt(0).toUpperCase()}</Avatar.Fallback>
                    </Avatar>
                    <div className="space-y-1 w-full">
                        <div className="text-sm text-on-surface-variant flex items-center justify-between">
                            <div className="flex gap-2">
                                <span className="font-bold text-on-surface">{user?.displayName || user?.username}</span>
                                <span>{post.authorUsername || `@${user?.username}`}</span>
                                <span>·</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <p className="text-base leading-relaxed text-on-surface whitespace-pre-wrap">
                            {post.content}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
