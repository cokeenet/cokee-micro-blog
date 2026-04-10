import { Dropdown, Label, Button } from '@heroui/react';

interface PostActionMenuProps {
    isOwner: boolean;
    onAction: (action: string) => void;
}

const ownerActions = [
    { key: 'share', label: '分享' },
    { key: 'pin', label: '置顶' },
    { key: 'promote', label: '推广' },
    { key: 'followers', label: '转为粉丝可见' },
    { key: 'friends', label: '转为好友圈可见' },
    { key: 'private', label: '转为自己可见' },
    { key: 'delete', label: '删除' }
];

const viewerActions = [
    { key: 'special-follow', label: '设为特别关注' },
    { key: 'favorite', label: '收藏' },
    { key: 'not-interested', label: '对此条不感兴趣' },
    { key: 'mute-author', label: '屏蔽该博主' },
    { key: 'mute-keyword', label: '屏蔽关键词' },
    { key: 'mute-post', label: '屏蔽此条微博' },
    { key: 'report', label: '投诉' },
    { key: 'unfollow', label: '取消关注' }
];

export function PostActionMenu({ isOwner, onAction }: PostActionMenuProps) {
    const actions = isOwner ? ownerActions : viewerActions;

    return (
        <Dropdown>
            <Button
                aria-label="博文菜单"
                isIconOnly
                variant="ghost"
                className="rounded-full border-none text-on-surface-variant transition hover:bg-black/5 dark:hover:bg-white/10 hover:text-on-surface"
            >
                <span className="material-symbols-outlined text-lg">more_horiz</span>
            </Button>
            <Dropdown.Popover>
                <Dropdown.Menu aria-label="博文操作" onAction={(key) => onAction(String(key))}>
                    {actions.map((action) => (
                        <Dropdown.Item id={action.key} textValue={action.label}>
                            <Label>{action.label}</Label>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}
