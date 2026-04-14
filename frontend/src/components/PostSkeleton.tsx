import { Card, Skeleton } from '@heroui/react';

export function PostSkeleton() {
    return (
        <Card className="rounded-none border-b border-outline-variant/60 shadow-none bg-surface/40 overflow-hidden app-page-enter">
            <Card.Content className="p-4 flex gap-3 h-full">
                {/* Avatar Skeleton */}
                <div className="shrink-0 flex flex-col items-center">
                    <Skeleton className="rounded-full w-10 h-10 bg-outline-variant/40" />
                </div>

                {/* Content Skeleton */}
                <div className="flex-1 w-full space-y-3">
                    {/* Header: Name and Username */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-32 rounded-md bg-outline-variant/40" />
                        <Skeleton className="h-3 w-24 rounded-md bg-outline-variant/20" />
                    </div>

                    {/* Text Body */}
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-full rounded-md bg-outline-variant/30" />
                        <Skeleton className="h-3 w-[90%] rounded-md bg-outline-variant/30" />
                        <Skeleton className="h-3 w-[60%] rounded-md bg-outline-variant/30" />
                    </div>

                    {/* Optional Media (Simulated randomly) */}
                    <div className="pt-2">
                        <Skeleton className="h-48 w-full rounded-xl bg-outline-variant/20" />
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-between pt-2 max-w-sm">
                        <Skeleton className="h-8 w-12 rounded-full bg-outline-variant/20" />
                        <Skeleton className="h-8 w-12 rounded-full bg-outline-variant/20" />
                        <Skeleton className="h-8 w-12 rounded-full bg-outline-variant/20" />
                        <Skeleton className="h-8 w-8 rounded-full bg-outline-variant/20" />
                    </div>
                </div>
            </Card.Content>
        </Card>
    );
}

export function PostDetailSkeleton() {
    return (
        <div className="p-4 space-y-4">
            {/* Header: Name and Username */}
            <div className="flex gap-3 items-center mb-4">
                <Skeleton className="rounded-full w-12 h-12 bg-outline-variant/40" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-32 rounded-md bg-outline-variant/40" />
                    <Skeleton className="h-3 w-24 rounded-md bg-outline-variant/20" />
                </div>
            </div>

            {/* Text Body */}
            <div className="space-y-3 mb-6">
                <Skeleton className="h-5 w-full rounded-md bg-outline-variant/30" />
                <Skeleton className="h-5 w-full rounded-md bg-outline-variant/30" />
                <Skeleton className="h-5 w-[80%] rounded-md bg-outline-variant/30" />
            </div>

            {/* Time */}
            <Skeleton className="h-4 w-64 rounded-md bg-outline-variant/20 my-4" />

            {/* Action Bar */}
            <div className="flex gap-6 py-4 border-y border-outline-variant/60">
                <Skeleton className="h-8 w-20 rounded-md bg-outline-variant/20" />
                <Skeleton className="h-8 w-20 rounded-md bg-outline-variant/20" />
            </div>
        </div>
    );
}
