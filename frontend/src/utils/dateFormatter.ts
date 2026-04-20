/**
 * 格式化时间为本地时区显示
 */
export function formatLocalTime(dateString: string | Date): string {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString as string;
        }

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // 相对时间显示
        if (diffMins < 1) {
            return '刚刚';
        } else if (diffMins < 60) {
            return `${diffMins}分钟前`;
        } else if (diffHours < 24) {
            return `${diffHours}小时前`;
        } else if (diffDays < 7) {
            return `${diffDays}天前`;
        }

        // 格式化为本地日期时间
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return String(dateString);
    }
}

/**
 * 格式化为日期（带相对时间的短版本）
 */
export function formatLocalDate(dateString: string | Date): string {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString as string;
        }

        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

        if (diffDays === 0) {
            return date.toLocaleString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffDays === 1) {
            return '昨天';
        } else if (diffDays < 7) {
            return `${diffDays}天前`;
        }

        return date.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        return String(dateString);
    }
}

/**
 * 格式化为完整本地日期时间
 */
export function formatFullLocalDateTime(dateString: string | Date): string {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString as string;
        }

        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (e) {
        return String(dateString);
    }
}
