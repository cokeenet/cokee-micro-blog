import { Avatar, Button, Card, Chip, ComboBox, Input, ListBox, Drawer, Form, TextArea } from '@heroui/react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL, fetchWithAuth } from '../config/api';

import { PostSkeleton } from '../components/PostSkeleton';
import { PostCard } from '../components/PostCard';

export default function ProfilePage() {
    const { username: paramUsername } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('posts');
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [profileUser, setProfileUser] = useState<any>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    const isOwner = paramUsername ? user?.username === paramUsername : true;
    const currentViewUsername = paramUsername || user?.username;

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        displayName: '',
        avatarUrl: '',
        bio: ''
    });

    useEffect(() => {
        if (!currentViewUsername) {
            setIsLoadingProfile(false);
            setIsLoadingPosts(false);
            return;
        }

        const fetchProfile = async () => {
            setIsLoadingProfile(true);
            try {
                const endpoint = token
                    ? fetchWithAuth(`/api/users/${currentViewUsername}`)
                    : fetch(`${API_BASE_URL}/users/${currentViewUsername}`);
                const res = await endpoint;
                if (res.ok) {
                    const data = await res.json();
                    setProfileUser(data);
                } else if (res.status === 404) {
                    navigate('/404', { replace: true });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        const fetchPosts = async () => {
            setIsLoadingPosts(true);
            try {
                const endpoint = token
                    ? fetchWithAuth(`/api/users/${currentViewUsername}/posts`)
                    : fetch(`${API_BASE_URL}/users/${currentViewUsername}/posts`);

                const res = await endpoint;
                if (res.ok) {
                    const data = await res.json();
                    setUserPosts(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingPosts(false);
            }
        };

        fetchProfile();
        fetchPosts();
    }, [currentViewUsername, token, navigate]);

    const handleOpenEdit = () => {
        setEditForm({
            displayName: profileUser?.displayName || '',
            avatarUrl: profileUser?.avatarUrl || '',
            bio: profileUser?.bio || ''
        });
        setIsEditOpen(true);
    };

    const handleToggleFollow = async () => {
        if (!user) return alert("请先登录！");
        const actionUrl = `/api/users/${profileUser.username}/follow`;
        const method = profileUser.isFollowing ? 'DELETE' : 'POST';

        try {
            const res = await fetchWithAuth(actionUrl, { method });
            if (res.ok) {
                setProfileUser((prev: any) => ({
                    ...prev,
                    isFollowing: !prev.isFollowing,
                    followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
                }));
            } else {
                const data = await res.json().catch(() => null);
                alert(data?.message || "操作失败");
            }
        } catch (err) {
            console.error(err);
            alert("操作异常");
        }
    };

    const handleToggleLike = async (postId: string, isCurrentlyLiked: boolean) => {
        if (!token) return alert('请先登录');
        const originalPosts = [...userPosts];
        setUserPosts(userPosts.map((p: any) => p.id === postId ? { ...p, isLikedByMe: !isCurrentlyLiked, likeCount: (p.likeCount || 0) + (isCurrentlyLiked ? -1 : 1) } : p));
        try {
            const res = await fetchWithAuth(`/api/posts/${postId}/like`, { method: isCurrentlyLiked ? 'DELETE' : 'POST' });
            if (!res.ok) throw new Error('操作失败');
        } catch (e) {
            setUserPosts(originalPosts);
        }
    };

    const handlePostAction = async (action: string, postId: string) => {
        if (action === 'delete') {
            if (!window.confirm('确定要删除这条动态吗？')) return;
            try {
                const res = await fetchWithAuth(`/api/posts/${postId}`, { method: 'DELETE' });
                if (res.ok) setUserPosts(userPosts.filter((p: any) => p.id !== postId));
            } catch (e) { }
        } else if (action === 'retweet') {
            if (!token) return alert('请先登录');
            if (!window.confirm('确定要转发这条动态吗？')) return;
            try {
                const res = await fetchWithAuth(`/api/posts/${postId}/retweet`, { method: 'POST' });
                if (res.ok) { alert('转发成功'); }
            } catch (e) { }
        } else {
            alert(`已触发操作: ${action}`);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const res = await fetchWithAuth('/api/users/profile', {
                method: 'PUT',
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                window.location.reload();
            } else {
                alert('保存失败，请重试');
            }
        } catch (err) {
            console.error(err);
            alert('保存异常：' + err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingProfile) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-on-surface-variant app-page-enter">
                <PostSkeleton />
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-on-surface-variant app-page-enter">
                用户未找到
            </div>
        );
    }

    return (
        <section className="app-page-enter">
            <header className="sticky top-0 z-20 border-b border-outline-variant/60 glass-panel px-4 py-3">
                <div className="text-sm text-on-surface-variant">{userPosts.length} 帖子</div>
                <h1 className="text-2xl font-extrabold text-on-surface">{profileUser.displayName || profileUser.username}</h1>
            </header>

            <div className="relative h-52 overflow-hidden bg-slate-200 dark:bg-slate-800 soft-surface">
                {/* Fallback cover image */}
                <div className="h-full w-full bg-gradient-to-r from-primary/30 to-secondary/30"></div>
            </div>

            <div className="px-5 pb-8">
                <div className="-mt-16 flex items-end justify-between">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl dark:border-surface drop-shadow-md">
                        <Avatar.Image src={profileUser?.avatarUrl || undefined} />
                        <Avatar.Fallback className="text-4xl bg-surface-variant text-on-surface">{(profileUser?.displayName || profileUser?.username || 'U').charAt(0).toUpperCase()}</Avatar.Fallback>
                    </Avatar>
                    {isOwner ? (
                        <Button variant="outline" className="glass-chip" onPress={handleOpenEdit}>
                            编辑个人资料
                        </Button>
                    ) : (
                        <Button
                            variant={profileUser.isFollowing ? "outline" : "primary"}
                            className="shadow-lg"
                            onPress={handleToggleFollow}
                        >
                            {profileUser.isFollowing ? "已关注" : "+ 关注"}
                        </Button>
                    )}
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-4xl font-black tracking-tight text-on-surface">{profileUser.displayName || profileUser.username}</h2>
                        <Chip variant="soft" size="sm" className="border border-primary text-primary">
                            已认证
                        </Chip>
                    </div>
                    <p className="text-lg text-on-surface-variant">@{profileUser.username}</p>

                    {profileUser.bio && (
                        <p className="text-on-surface pt-2 break-words leading-relaxed max-w-2xl text-base opacity-90">
                            {profileUser.bio}
                        </p>
                    )}

                    <div className="flex gap-5 text-sm text-on-surface pt-2">
                        <span><b>{profileUser.followingCount || 0}</b> 正在关注</span>
                        <span><b>{profileUser.followersCount || 0}</b> 关注者</span>
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
                            {isLoadingPosts ? (
                                Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
                            ) : userPosts.length > 0 ? (
                                userPosts.map((post: any) => (
                                    <PostCard key={post.id} post={post} isOwner={isOwner && user?.username === post.authorUsername?.replace('@', '')} onToggleLike={handleToggleLike} onToggleRetweet={(postId) => handlePostAction('retweet', postId)} onPostAction={handlePostAction} />
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

            <Drawer>
                <Drawer.Backdrop isOpen={isEditOpen} onOpenChange={setIsEditOpen}>
                    <Drawer.Content placement="right" className="bg-surface/90 backdrop-blur-2xl border-l border-white/10 text-on-surface">
                        <Drawer.Dialog className="h-full flex flex-col pt-10">
                            <Drawer.Header className="border-b border-white/10 pb-4 px-6 md:px-8">
                                <h2 className="text-2xl font-black">编辑个人资料</h2>
                                <p className="text-sm font-medium text-on-surface-variant opacity-80 mt-1">更新你的数字面貌或设定。</p>
                            </Drawer.Header>
                            <Drawer.Body className="py-6 px-6 md:px-8 overflow-y-auto">
                                <Form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                                    <div className="flex flex-col gap-2 w-full">
                                        <label className="text-sm font-bold opacity-80">展示昵称 (DisplayName)</label>
                                        <Input
                                            placeholder="输入你的昵称..."
                                            value={editForm.displayName}
                                            onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                                            className="bg-surface-variant/40 hover:bg-surface-variant/60 focus-within:!bg-surface-variant/80 border border-outline-variant/30"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 w-full">
                                        <label className="text-sm font-bold opacity-80">头像地址 URL (Avatar)</label>
                                        <Input
                                            type="url"
                                            placeholder="https://example.com/avatar.png"
                                            value={editForm.avatarUrl}
                                            onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                                            className="bg-surface-variant/40 hover:bg-surface-variant/60 focus-within:!bg-surface-variant/80 border border-outline-variant/30"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 w-full">
                                        <label className="text-sm font-bold opacity-80">个人签名 (Bio)</label>
                                        <TextArea
                                            placeholder="介绍一下你自己..."
                                            rows={5}
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                            className="bg-surface-variant/40 hover:bg-surface-variant/60 focus-within:!bg-surface-variant/80 border border-outline-variant/30 text-on-surface"
                                        />
                                    </div>

                                    <p className="text-xs text-on-surface-variant mt-2 opacity-70 flex items-center gap-1 bg-primary/10 p-3 rounded-lg border border-primary/20">
                                        <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                                        <span>放空内容则会保留或清除当前属性。</span>
                                    </p>
                                </Form>
                            </Drawer.Body>
                            <Drawer.Footer className="border-t border-white/10 py-5 px-6 md:px-8 mt-auto flex gap-3">
                                <Button variant="outline" onPress={() => setIsEditOpen(false)} isDisabled={isSaving} className="flex-1 font-bold h-12 text-base">
                                    取消
                                </Button>
                                <Button className="bg-primary text-white flex-1 font-bold shadow-glow-soft h-12 text-base" onPress={handleSaveProfile} isDisabled={isSaving}>
                                    {isSaving ? "保存中..." : "保存资料"}
                                </Button>
                            </Drawer.Footer>
                        </Drawer.Dialog>
                    </Drawer.Content>
                </Drawer.Backdrop>
            </Drawer>
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
