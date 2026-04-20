import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Input, Card } from '@heroui/react';
import { PostCard } from '../components/PostCard';
import { fetchWithAuth } from '../config/api';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [searchInput, setSearchInput] = useState(query);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        if (query) {
            performSearch();
        }
    }, [query, page]);

    const performSearch = async () => {
        if (!query || query.trim().length < 2) {
            setPosts([]);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetchWithAuth(
                `/api/posts/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`
            );
            if (res.ok) {
                const data = await res.json();
                setPosts(data.data || []);
                setTotalResults(data.data?.length || 0);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim().length >= 2) {
            setSearchParams({ q: searchInput });
            setPage(1);
        }
    };

    const hasNextPage = totalResults === pageSize;

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Search Header */}
            <Card className="sticky top-0 z-10 mb-4 bg-surface/95 backdrop-blur border-b border-outline-variant/30 rounded-none">
                <Card.Content className="p-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            isClearable
                            type="text"
                            placeholder="搜索推文..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="flex-1"
                            startContent={
                                <span className="material-symbols-outlined text-muted text-[20px]">search</span>
                            }
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity"
                        >
                            搜索
                        </button>
                    </form>
                </Card.Content>
            </Card>

            {/* Results */}
            <div className="space-y-1">
                {isLoading ? (
                    <div className="text-center py-8 text-muted">搜索中...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                        {query ? '未找到相关推文' : '输入至少 2 个字符开始搜索'}
                    </div>
                ) : (
                    <>
                        <div className="text-sm text-muted px-4 py-3 border-b border-outline-variant/30">
                            找到 {totalResults} 条结果
                        </div>
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                isOwner={false}
                                onPostAction={() => {}}
                            />
                        ))}
                        {hasNextPage && (
                            <button
                                onClick={() => setPage(page + 1)}
                                className="w-full py-4 text-primary hover:bg-surface-secondary transition-colors"
                            >
                                加载更多
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
