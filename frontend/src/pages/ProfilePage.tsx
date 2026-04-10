import { Avatar, Button, Card, Chip } from '@heroui/react';
import { useState } from 'react';

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('posts');

    return (
        <section className="app-page-enter">
            <header className="sticky top-0 z-20 border-b border-outline-variant/60 glass-panel px-4 py-3">
                <div className="text-sm text-on-surface-variant">3 帖子</div>
                <h1 className="text-2xl font-extrabold text-on-surface">Cokee</h1>
            </header>

            <div className="relative h-52 overflow-hidden bg-slate-200 dark:bg-slate-800 soft-surface">
                <img
                    src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80"
                    alt="profile cover"
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="px-5 pb-8">
                <div className="-mt-16 flex items-end justify-between">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl dark:border-slate-900">
                        <Avatar.Image src="https://i.pravatar.cc/200?img=12" />
                        <Avatar.Fallback>C</Avatar.Fallback>
                    </Avatar>
                    <Button variant="outline" className="glass-chip">
                        编辑个人资料
                    </Button>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-4xl font-black tracking-tight text-on-surface">Cokee</h2>
                        <Chip color="accent" variant="primary" size="sm">
                            获得认证
                        </Chip>
                    </div>
                    <p className="text-lg text-on-surface-variant">@liquidcookie_</p>
                    <p className="text-on-surface-variant">2023年1月 加入</p>
                    <div className="flex gap-5 text-sm text-on-surface">
                        <span><b>34</b> 正在关注</span>
                        <span><b>1</b> 关注者</span>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
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

                    {activeTab === 'posts' && <ProfilePost />}
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
        <Card className="mt-4 glass-elevated rounded-card">
            <Card.Content className="py-10 text-center text-on-surface-variant">{text}</Card.Content>
        </Card>
    );
}

function ProfilePost() {
    return (
        <Card className="mt-4 glass-elevated rounded-card">
            <Card.Content>
                <div className="flex items-start gap-3">
                    <Avatar>
                        <Avatar.Image src="https://i.pravatar.cc/100?img=12" />
                        <Avatar.Fallback>C</Avatar.Fallback>
                    </Avatar>
                    <div className="space-y-2">
                        <div className="text-sm text-on-surface-variant">@liquidcookie_ · 2026年4月10日 · 来自 Web端</div>
                        <p className="text-base leading-relaxed text-on-surface">
                            Requesting #CSB funds from faucet on the #Crossbell blockchain.
                        </p>
                    </div>
                </div>
            </Card.Content>
        </Card>
    );
}
