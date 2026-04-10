import { Button, Card, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, TextArea } from '@heroui/react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export default function ComposePage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState('所有人可以回复');
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
            const res = await fetch('http://localhost:5246/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content, type: 0 })
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

                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant="secondary">
                                {visibility}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="可见性"
                            onAction={(key) => setVisibility(String(key))}
                        >
                            <DropdownItem key="所有人可以回复">所有人可以回复</DropdownItem>
                            <DropdownItem key="我关注的人可以回复">我关注的人可以回复</DropdownItem>
                            <DropdownItem key="仅提及的人可以回复">仅提及的人可以回复</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>

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
