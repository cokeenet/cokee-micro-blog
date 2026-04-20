import React from 'react';
import { useNavigate } from 'react-router';

/**
 * 解析内容中的#话题并换成可点击的链接
 */
export function ParseHashtagsAndMentions({ content, navigate }: { content: string; navigate: (path: string) => void }) {
    // 匹配@提及和#话题
    const parts = content.split(/(@[\w\u4e00-\u9fff]+|#[\w\u4e00-\u9fff]+)/g);

    return (
        <>
            {parts.map((part, idx) => {
                if (part?.startsWith('#')) {
                    // 话题链接
                    return (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/trend/${encodeURIComponent(part)}`);
                            }}
                            className="text-primary hover:underline transition-colors"
                        >
                            {part}
                        </button>
                    );
                } else if (part?.startsWith('@')) {
                    // 用户提及链接
                    return (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/profile/${part.substring(1)}`);
                            }}
                            className="text-primary hover:underline transition-colors"
                        >
                            {part}
                        </button>
                    );
                } else {
                    return <span key={idx}>{part}</span>;
                }
            })}
        </>
    );
}
