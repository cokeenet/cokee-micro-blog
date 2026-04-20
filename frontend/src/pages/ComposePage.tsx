import { Button, Dropdown, Label, TextArea } from '@heroui/react';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useUserSearch } from '../hooks/useUserSearch';
import { API_BASE_URL, fetchWithAuth } from '../config/api';

export default function ComposePage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { users, isLoading, search } = useUserSearch();

    const [content, setContent] = useState('');
    const [replyPermission, setReplyPermission] = useState('Everyone');
    const [postVisibility, setPostVisibility] = useState('Public');
    const [submitting, setSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [parentPostId, setParentPostId] = useState<string | null>(null);
    const [parentPost, setParentPost] = useState<any>(null);

    // Mention and hashtag states
    const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
    const [mentionStartPos, setMentionStartPos] = useState(-1);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const editIdParam = queryParams.get('edit');
        const replyIdParam = queryParams.get('reply');

        if (replyIdParam) {
            setParentPostId(replyIdParam);
            fetchWithAuth(`/api/posts/${replyIdParam}`).then(res => {
                if (res.ok) {
                    res.json().then(data => {
                        setParentPost(data);
                    });
                }
            });
        }

        if (editIdParam) {
            setIsEditMode(true);
            setEditId(editIdParam);
            // Fetch existing post content
            fetchWithAuth(`/api/posts/${editIdParam}`).then(res => {
                if (res.ok) {
                    res.json().then(data => {
                        setContent(data.content || '');
                        setPostVisibility(data.visibility || 'Public');
                        setReplyPermission(data.replyPermission || 'Everyone');
                        if (data.imageUrls && data.imageUrls.length > 0) {
                            setPreviewUrls(data.imageUrls);
                        }
                    });
                }
            });
        }
    }, [location.search]);

    const visibilityMap: Record<string, string> = {
        'Public': '公开',
        'FollowersOnly': '粉丝',
        'MutualFollowersOnly': '好友圈',
        'Private': '仅自己可见'
    };

    const replyMap: Record<string, string> = {
        'Everyone': '所有人可以回复',
        'FollowingOnly': '我关注的人可以回复',
        'MentionedOnly': '仅提及的人可以回复'
    };

    // Image logic
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedImages(prev => [...prev, ...filesArray]);

            const newPreviews = filesArray.map(f => URL.createObjectURL(f));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const canSubmit = useMemo(() => (content.trim().length > 0 || selectedImages.length > 0) && !submitting, [content, submitting, selectedImages]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);

        // Check for @ mention
        const cursorPos = e.target.selectionStart;
        const lastAt = newContent.lastIndexOf('@', cursorPos - 1);
        const lastSpace = newContent.lastIndexOf(' ', lastAt - 1);

        if (lastAt !== -1 && (lastSpace === -1 || lastAt > lastSpace)) {
            const mentionText = newContent.substring(lastAt + 1, cursorPos);
            if (mentionText.length > 0 && !mentionText.includes(' ')) {
                setMentionStartPos(lastAt);
                search(mentionText);
                setShowMentionSuggestions(true);
            } else if (mentionText.includes(' ')) {
                setShowMentionSuggestions(false);
            }
        } else {
            setShowMentionSuggestions(false);
        }
    };

    const insertMention = (username: string) => {
        const beforeAt = content.substring(0, mentionStartPos);
        const afterCursor = content.substring(content.indexOf(' ', mentionStartPos) === -1 ? content.length : content.indexOf(' ', mentionStartPos));
        const newContent = beforeAt + '@' + username + ' ' + afterCursor;
        setContent(newContent);
        setShowMentionSuggestions(false);
        textAreaRef.current?.focus();
    };

    const handlePublish = async () => {
        if (!token) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        if (!canSubmit) return;

        setSubmitting(true);
        try {
            let uploadedImageUrls: string[] = [];

            // Upload images first if any
            for (const file of selectedImages) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetchWithAuth('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    if (data.url) {
                        uploadedImageUrls.push(`${API_BASE_URL.replace('/api', '')}${data.url}`);
                    }
                }
            }

            const res = await fetchWithAuth(isEditMode ? `/api/posts/${editId}` : (parentPostId ? `/api/posts/${parentPostId}/comments` : '/api/posts'), {
                method: isEditMode ? 'PUT' : 'POST',
                body: JSON.stringify({
                    content,
                    type: 0,
                    replyPermission: isEditMode ? replyPermission : undefined,
                    visibility: isEditMode ? postVisibility : undefined,
                    imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined
                })
            });

            const data = await res.json().catch(() => null);
            if (!res.ok || (data && data.code && data.code !== 200 && data.code !== 201)) {
                throw new Error(data?.message || '发布失败');
            }

            navigate('/');
        } catch {
            alert('发布失败，请稍后重试');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex sm:items-start justify-center sm:pt-16 bg-black/40 backdrop-blur-xl app-page-enter px-0 sm:px-4">
            <section className="bg-surface text-on-surface w-full h-full sm:h-auto sm:min-h-[300px] sm:max-h-[85vh] sm:rounded-2xl sm:max-w-2xl sm:shadow-2xl flex flex-col relative overflow-hidden transition-all duration-300 border border-outline-variant/30">
                <div className="flex items-center justify-between p-4 border-b border-outline-variant/30">
                    <button className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors flex items-center justify-center -ml-2" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>

                    <div className="flex gap-4 items-center">
                        <span className="text-secondary font-medium text-[15px]">{isEditMode ? '修改草稿' : '草稿'}</span>
                        <Button
                            className="bg-[#1d9bf0] text-white px-5 py-4 min-h-0 h-8 rounded-full font-bold text-[14px] opacity-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a8cd8] transition-colors"
                            onPress={handlePublish}
                            isDisabled={submitting || (!content.trim() && selectedImages.length === 0 && previewUrls.length === 0)}
                        >
                            {submitting ? '发送中...' : (isEditMode ? '保存' : '发布')}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col flex-1 overflow-y-auto px-4 pt-3 pb-6 hide-scrollbar bg-surface">
                    {parentPost && (
                        <div className="mb-4 p-3 bg-surface-variant/30 rounded-lg border border-outline-variant/30">
                            <div className="text-xs text-muted mb-2">回复用户：{parentPost.authorDisplayName || parentPost.authorUsername}</div>
                            <p className="text-sm text-foreground">{parentPost.content}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex flex-wrap gap-2">
                            {!parentPostId && (
                                <>
                                    <Dropdown>
                                        <Button variant="secondary" className="px-3 flex items-center gap-1 rounded-full border border-outline-variant/50 bg-transparent hover:bg-on-surface/5 text-[#1d9bf0] text-sm h-7 min-h-0">
                                            <span className="material-symbols-outlined text-[16px]">public</span>
                                            {visibilityMap[postVisibility]}
                                            <span className="material-symbols-outlined text-[16px] ml-0.5">expand_more</span>
                                        </Button>
                                        <Dropdown.Popover>
                                            <Dropdown.Menu
                                                aria-label="帖子可见度"
                                                onAction={(key) => setPostVisibility(String(key))}
                                            >
                                                <Dropdown.Item id="Public" textValue="Public">
                                                    <Label>公开</Label>
                                                </Dropdown.Item>
                                                <Dropdown.Item id="FollowersOnly" textValue="FollowersOnly">
                                                    <Label>粉丝</Label>
                                                </Dropdown.Item>
                                                <Dropdown.Item id="MutualFollowersOnly" textValue="MutualFollowersOnly">
                                                    <Label>好友圈</Label>
                                                </Dropdown.Item>
                                                <Dropdown.Item id="Private" textValue="Private">
                                                    <Label>仅自己可见</Label>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown.Popover>
                                    </Dropdown>

                                    <Dropdown>
                                        <Button variant="secondary" className="px-3 flex items-center gap-1 rounded-full border border-outline-variant/50 bg-transparent hover:bg-on-surface/5 text-[#1d9bf0] text-sm h-7 min-h-0">
                                            {replyMap[replyPermission]}
                                        </Button>
                                        <Dropdown.Popover>
                                            <Dropdown.Menu
                                                aria-label="回复权限"
                                                onAction={(key) => setReplyPermission(String(key))}
                                            >
                                                <Dropdown.Item id="Everyone" textValue="Everyone">
                                                    <Label>所有人可以回复</Label>
                                                </Dropdown.Item>
                                                <Dropdown.Item id="FollowingOnly" textValue="FollowingOnly">
                                                    <Label>我关注的人可以回复</Label>
                                                </Dropdown.Item>
                                                <Dropdown.Item id="MentionedOnly" textValue="MentionedOnly">
                                                    <Label>仅提及的人可以回复</Label>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown.Popover>
                                    </Dropdown>
                                </>
                            )}
                        </div>

                        <TextArea className="text-lg bg-transparent text-on-surface placeholder:text-on-surface-variant resize-none h-40 border-none outline-none focus:ring-0 px-0 relative z-10" placeholder="有什么新鲜事？" value={content} onChange={handleContentChange} ref={textAreaRef} />

                        {showMentionSuggestions && users.length > 0 && (
                            <div className="absolute bg-surface border border-outline-variant/50 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto z-20">
                                {users.map(user => (
                                    <button
                                        key={user.username}
                                        className="w-full px-4 py-2 text-left hover:bg-surface-variant/50 transition-colors flex items-center gap-2"
                                        onClick={() => insertMention(user.username)}
                                    >
                                        <img src={user.avatarUrl?.replace('5253', '8080')} alt={user.username} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <div className="font-semibold text-sm">{user.displayName}</div>
                                            <div className="text-xs text-muted">@{user.username}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {previewUrls.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {previewUrls.map((url, i) => (
                                    <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-outline-variant/50">
                                        <img src={typeof (url) === 'string' ? (url).replace('5253', '8080') : (url)} alt="preview" className="object-cover w-full h-full" />
                                        <button
                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                                            onClick={() => removeImage(i)}
                                        >
                                            <span className="material-symbols-outlined text-[14px] block">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-b border-outline-variant/30 w-full mt-4 mb-2" />

                        <div className="flex items-center justify-between mt-2">
                            <div className="flex gap-2 text-[#1d9bf0]">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                />
                                <button
                                    className="p-2 hover:bg-[#1d9bf0] hover:bg-opacity-10 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <span className="material-symbols-outlined">image</span>
                                </button>
                                <span className="p-2 hover:bg-[#1d9bf0] hover:bg-opacity-10 rounded-full transition-colors material-symbols-outlined">gif_box</span>
                                <span className="p-2 hover:bg-[#1d9bf0] hover:bg-opacity-10 rounded-full transition-colors material-symbols-outlined">mood</span>
                                <span className="p-2 hover:bg-[#1d9bf0] hover:bg-opacity-10 rounded-full transition-colors material-symbols-outlined">schedule</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}




