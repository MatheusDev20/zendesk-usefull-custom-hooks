
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useInternalZafClient } from '../lib/context';
import { createNetworkClient } from '../lib/core';

/**
 * Parameters for the useQueryCustomObjects hook
 */
type HookParams<T> = {
  /** The key/identifier for the custom object type to query */
  customObjectKey: string;

  /** 
   * Filter criteria for advanced querying. Should contain a "filter" property.
   * Cannot be used together with searchBySingleField.
   * Example: { filter: { status: "active" } }
   */
  filterCriteria?: Record<"filter", any>;

  /** 
   * Function to transform the raw API response into the desired data structure.
   * Receives the raw response and should return an array of transformed objects.
   */
  translateFn: (raw: any) => T[];

  /** Whether to refetch data when the browser tab becomes active/focused */
  refetchOnTabChange: boolean;

  /** 
   * Additional React Query options to customize caching, retry behavior, etc.
   * Excludes queryKey and queryFn which are handled internally.
   */
  reactQueryOptions?: Omit<UseQueryOptions<T[], Error>, 'queryKey' | 'queryFn'>;

  /** 
   * Simple search by a single field. Cannot be used together with filterCriteria.
   * Example: { by: "name", value: "John Doe" }
   */
  searchBySingleField?: { by: string, value: string | number } | null;
};

/**
 * Return type for the useQueryCustomObjects hook
 */
type HookReturn<T> = {
  /** The transformed data array, undefined while loading */
  data: T[] | undefined;

  /** Loading state indicator */
  isLoading: boolean;

  /** Error object if the query failed, null otherwise */
  error: Error | null;

  /** Function to manually trigger a refetch of the data */
  refetch: () => void;
};

/**
 * Custom hook for querying Zendesk custom objects with React Query integration.
 * 
 * @param params Configuration object for the query
 * @returns Object containing data, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useQueryCustomObjects({
 *   customObjectKey: "users",
 *   translateFn: (raw) => raw.map(item => ({ id: item.id, name: item.name })),
 *   refetchOnTabChange: true,
 *   searchBySingleField: { by: "status", value: "active" }
 * });
 * ```
 */

function useQueryCustomObjects<T = any>(params: HookParams<T>): HookReturn<T> {
  if (!params.customObjectKey || typeof params.customObjectKey !== 'string') throw new Error("invalid customObjectKey");

  const { zaf } = useInternalZafClient();
  const client = createNetworkClient({ zaf, customObjectKey: params.customObjectKey });
  let filterKey = '';

  const { customObjectKey, translateFn, refetchOnTabChange, filterCriteria, searchBySingleField } = params;
  if (filterCriteria && searchBySingleField) throw new Error("You must choose either filterCriteria or searchBySingleField");

  if (searchBySingleField) filterKey = `custom_object_fields.${searchBySingleField?.by}`;

  const criteria = searchBySingleField ? {
    $and: [
      { [filterKey]: { $eq: searchBySingleField.value } }
    ]
  } : filterCriteria || {};


  const { data, isFetching, error, refetch } = useQuery<T[], Error>({
    queryKey: [`query-custom-objects-${customObjectKey}`, customObjectKey],
    queryFn: () => client.fire({
      data: criteria,
      endpoint: '/{customObjectKey}/records/search',
      pathParams: { customObjectKey },
      method: 'POST',
    }),

    refetchOnWindowFocus: refetchOnTabChange,
    staleTime: 1000 * 60 * 1,
    ...params.reactQueryOptions,
  });

  const transformedData = translateFn ? data ? translateFn(data) : [] : data;

  return {
    data: transformedData,
    isLoading: isFetching,
    refetch,
    error
  };
}

export { useQueryCustomObjects };
