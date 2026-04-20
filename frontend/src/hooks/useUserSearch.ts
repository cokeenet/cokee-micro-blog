import { useState, useCallback } from 'react';
import { fetchWithAuth } from '../config/api';

export interface User {
    username: string;
    displayName: string;
    avatarUrl?: string;
    followersCount: number;
}

export function useUserSearch() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const search = useCallback(async (query: string) => {
        if (!query || query.length < 1) {
            setUsers([]);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetchWithAuth(`/api/users/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { users, isLoading, search };
}
