import { Button, Card, Dropdown, Label, TextArea } from '@heroui/react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../config/api';

export default function ComposePage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [content, setContent] = useState('');
    const [replyPermission, setReplyPermission] = useState('所有人可以回复');
    const [postVisibility, setPostVisibility] = useState('公开');
    const [submitting, setSubmitting] = useState(false);

    const canSubmit = useMemo(() => content.trim().length > 0 && !submitting, [content, submitting]);

    const handlePublish = async () => {
        if (!token) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        if (!canSubmit) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content, type: 0, replyPermission, visibility: postVisibility })
            });

            if (!res.ok) {
                throw new Error('发布失败');
            }

            navigate('/');
        } catch {
            alert('发布失败，请稍后重试');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="mx-auto max-w-2xl p-6 app-page-enter">
            <Card className="glass-elevated rounded-panel">
                <Card.Content className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-black text-on-surface">有什么新鲜事？</h1>
                        <span className="text-sm text-on-surface-variant">Web端</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <Dropdown>
                            <Button variant="secondary" className="px-3 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">public</span>
                                {postVisibility}
                            </Button>
                            <Dropdown.Popover>
                                <Dropdown.Menu
                                    aria-label="帖子可见性"
                                    onAction={(key) => setPostVisibility(String(key))}
                                >
                                    <Dropdown.Item id="公开" textValue="公开">
                                        <Label>公开</Label>
                                    </Dropdown.Item>
                                    <Dropdown.Item id="粉丝" textValue="粉丝">
                                        <Label>粉丝</Label>
                                    </Dropdown.Item>
                                    <Dropdown.Item id="好友圈" textValue="好友圈">
                                        <Label>好友圈</Label>
                                    </Dropdown.Item>
                                    <Dropdown.Item id="仅自己可见" textValue="仅自己可见">
                                        <Label>仅自己可见</Label>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>

                        <Dropdown>
                            <Button variant="secondary" className="px-3">
                                {replyPermission}
                            </Button>
                            <Dropdown.Popover>
                                <Dropdown.Menu
                                    aria-label="可见性"
                                    onAction={(key) => setReplyPermission(String(key))}
                                >
                                    <Dropdown.Item id="所有人可以回复" textValue="所有人可以回复">
                                        <Label>所有人可以回复</Label>
                                    </Dropdown.Item>
                                    <Dropdown.Item id="我关注的人可以回复" textValue="我关注的人可以回复">
                                        <Label>我关注的人可以回复</Label>
                                    </Dropdown.Item>
                                    <Dropdown.Item id="仅提及的人可以回复" textValue="仅提及的人可以回复">
                                        <Label>仅提及的人可以回复</Label>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                    </div>

                    <TextArea rows={8} placeholder="分享你的想法..." value={content} onChange={(e) => setContent(e.target.value)} />

                    <div className="flex items-center justify-between">
                        <div className="flex gap-2 text-sky-500">
                            <span className="material-symbols-outlined">image</span>
                            <span className="material-symbols-outlined">gif_box</span>
                            <span className="material-symbols-outlined">mood</span>
                            <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <Button variant="primary" isDisabled={!canSubmit} onPress={handlePublish}>
                            {submitting ? '发布中...' : '发布'}
                        </Button>
                    </div>
                </Card.Content>
            </Card>
        </section>
    );
}
