import { UseQueryOptions } from '@tanstack/react-query';
type HookParams<T> = {
    customObjectKey: string;
    filterCriteria?: Record<"filter", any>;
    translateFn: (raw: any) => T[];
    refetchOnTabChange: boolean;
    reactQueryOptions?: Omit<UseQueryOptions<T[], Error>, 'queryKey' | 'queryFn'>;
};
type HookReturn<T> = {
    data: T[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
};
declare function useQueryCustomObjects<T = any>(params: HookParams<T>): HookReturn<T>;
export { useQueryCustomObjects };
