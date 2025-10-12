import { UseQueryOptions, UseMutateAsyncFunction } from '@tanstack/react-query';

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
    searchBySingleField?: {
        by: string;
        value: string | number;
    } | null;
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
declare function useQueryCustomObjects<T = any>(params: HookParams<T>): HookReturn<T>;

/**
 * Base structure required for all custom object records
 */
type RequiredCustomObjectFields$1 = {
    /** The display name for the custom object record */
    name: string;
    /** Custom fields specific to your custom object type */
    custom_object_fields: Record<string, any>;
};
/**
 * Parameters for the usePostCustomObjects hook
 */
type PostHookInput = {
    /** The key/identifier for the custom object type to create records for */
    customObjectKey: string;
    /** Optional callback function to execute after a successful record creation */
    postActionFn?: () => void;
};
/**
 * Return type for the usePostCustomObjects hook
 */
type PostHookReturn<T extends RequiredCustomObjectFields$1> = {
    /**
     * Async function to execute the mutation.
     * Accepts input data of type T (which must include name and custom_object_fields).
     */
    execute: UseMutateAsyncFunction<{
        customObjectUrl: string;
        name: string;
        id: string;
    }, Error, {
        input: T;
    }, unknown>;
    /** Loading state indicator - true while the request is in progress */
    isLoading: boolean;
    /** Error state indicator - true if the last mutation failed */
    isError: boolean;
    /** Error object if the mutation failed, null otherwise */
    error: Error | null;
    /** Function to reset the mutation state (clears data, error, etc.) */
    reset: () => void;
    /**
     * Data returned from successful mutation containing the created record info.
     * Undefined if no successful mutation has occurred yet.
     */
    data: {
        customObjectUrl: string;
        name: string;
        id: string;
    } | undefined;
};
/**
 * Custom hook for creating/inserting new Zendesk custom object records with React Query integration.
 *
 * This hook provides mutation functionality with automatic cache invalidation and error handling.
 * When a record is successfully created, it automatically invalidates related query caches to ensure
 * data consistency across your application.
 *
 * @param params Configuration object for the mutation
 * @returns Object containing execute function, loading state, error state, and result data
 *
 * @example
 * ```tsx
 * // Define your custom object type
 * type UserInput = {
 *   name: string;
 *   custom_object_fields: {
 *     email: string;
 *     age: number;
 *     status: 'active' | 'inactive';
 *   };
 * };
 *
 * const { execute, isLoading, error, data } = usePostCustomObjects<UserInput>({
 *   customObjectKey: "users",
 *   postActionFn: () => console.log('User created successfully!')
 * });
 *
 * // Execute the mutation
 * const handleSubmit = async (formData: UserInput) => {
 *   try {
 *     const result = await execute({
 *       input: {
 *         name: formData.name,
 *         custom_object_fields: {
 *           email: formData.email,
 *           age: formData.age,
 *           status: formData.status
 *         }
 *       }
 *     });
 *     console.log('Created record:', result);
 *   } catch (error) {
 *     console.error('Failed to create record:', error);
 *   }
 * };
 * ```
 */
declare function usePostCustomObjects<T extends RequiredCustomObjectFields$1>({ customObjectKey, postActionFn }: PostHookInput): PostHookReturn<T>;

/**
 * Return type for the useDeleteCustomObjects hook
 */
type DeleteHookReturn = {
    /**
     * Async function to execute the deletion mutation.
     * Accepts an object with the id of the record to delete.
     */
    execute: any;
    /** Loading state indicator - true while the deletion request is in progress */
    isLoading: boolean;
    /** Error state indicator - true if the last deletion failed */
    isError: boolean;
    /** Error object if the deletion failed, null otherwise */
    error: Error | null;
    /**
     * Data returned from successful deletion containing the deleted record ID.
     * Undefined if no successful deletion has occurred yet.
     */
    data: {
        deletedId: string;
    } | undefined;
};
/**
 * Parameters for the useDeleteCustomObjects hook
 */
type DeleteHookInput = {
    /** The key/identifier for the custom object type to delete records from */
    customObjectKey: string;
    /**
     * Optional callback function to execute after a successful deletion.
     * This is called after onSuccessFn.
     */
    postActionFn?: () => void;
    /**
     * Optional callback function to execute immediately when deletion succeeds.
     * This is called first, before postActionFn.
     */
    onSuccessFn?: () => void;
};
/**
 * Custom hook for deleting Zendesk custom object records with React Query integration.
 *
 * This hook provides mutation functionality for removing custom object records with
 * error handling and success callbacks. When a record is successfully deleted, it
 * executes the provided success callbacks in sequence.
 *
 * @param params Configuration object for the deletion mutation
 * @returns Object containing execute function, loading state, error state, and result data
 *
 * @example
 * ```tsx
 * const { execute, isLoading, error, data } = useDeleteCustomObjects({
 *   customObjectKey: "users",
 *   onSuccessFn: () => {
 *     console.log('Record deleted successfully');
 *   },
 *   postActionFn: () => {
 *     // Navigate away or show success message
 *     router.push('/users');
 *   }
 * });
 *
 * // Execute the deletion
 * const handleDelete = async (recordId: string) => {
 *   try {
 *     const result = await execute({ id: recordId });
 *     console.log('Deleted record ID:', result.deletedId);
 *   } catch (error) {
 *     console.error('Failed to delete record:', error);
 *   }
 * };
 * ```
 */
declare function useDeleteCustomObjects({ customObjectKey, postActionFn, onSuccessFn }: DeleteHookInput): DeleteHookReturn;

type RequiredCustomObjectFields = {
    name?: string;
    custom_object_fields: Partial<Record<string, any>>;
};
/**
 * Parameters for the useUpdateCustomObjects hook
 */
type UpdateHookInput<T> = {
    /** The key/identifier for the custom object type to update records for */
    customObjectKey: string;
    /**
     * Optional callback function to execute after a successful update.
     * This is called after onSuccessFn and cache invalidation.
     */
    postActionFn?: () => void;
    /**
     * Optional callback function to execute immediately when update succeeds.
     * Receives the updated record ID as a parameter.
     * This is called first, before cache invalidation and postActionFn.
     */
    onSuccessFn?: (id: string) => void;
};
/**
 * Return type for the useUpdateCustomObjects hook
 */
type UpdateHookReturn<T extends RequiredCustomObjectFields> = {
    /**
     * Async function to execute the update mutation.
     * Accepts raw input data that will be passed to the mapperFn.
     */
    execute: UseMutateAsyncFunction<{
        id: string;
    }, Error, {
        input: T;
        id: string;
    }, unknown>;
    /**
     * Data returned from successful update containing the updated record ID.
     * Undefined if no successful update has occurred yet.
     */
    data: {
        id: string;
    };
    /** Loading state indicator - true while the update request is in progress */
    isLoading: boolean;
    /** Error object if the update failed, null otherwise */
    error: Error | null;
    /** Error state indicator - true if the last update failed */
    isError: boolean;
    /** Function to reset the mutation state (clears data, error, etc.) */
    reset: () => void;
};
/**
 * Custom hook for updating existing Zendesk custom object records with React Query integration.
 *
 * This hook provides mutation functionality for modifying custom object records with automatic
 * cache invalidation and error handling. When a record is successfully updated, it automatically
 * invalidates related query caches to ensure data consistency across your application.
 *
 * @param params Configuration object for the update mutation
 * @returns Object containing execute function, loading state, error state, and result data
 *
 * @example
 * ```tsx
 * const { execute, isLoading, error, data } = useUpdateCustomObjects({
 *   customObjectKey: "users",
 *   mapperFn: (rawData) => ({
 *     recordId: rawData.recordId,
 *     custom_object_fields: {
 *       name: rawData.name,
 *       email: rawData.email,
 *       status: rawData.status
 *     }
 *   }),
 *   onSuccessFn: (updatedId) => {
 *     console.log('Record updated successfully:', updatedId);
 *   },
 *   postActionFn: () => {
 *     // Navigate or show success message
 *     router.push('/users');
 *   }
 * });
 *
 * // Execute the update
 * const handleUpdate = async (formData) => {
 *   try {
 *     const result = await execute({ rawInput: { ...formData, recordId: '123' } });
 *     console.log('Updated record ID:', result.updatedId);
 *   } catch (error) {
 *     console.error('Failed to update record:', error);
 *   }
 * };
 * ```
 */
declare function useUpdateCustomObjects<T extends RequiredCustomObjectFields>({ customObjectKey, postActionFn, onSuccessFn }: UpdateHookInput<T>): UpdateHookReturn<T>;

type Props = {
    client: any;
    children: React.ReactNode;
};
type ContextProps = {
    zaf: any;
};
declare const CustomObjectsProvider: React.FC<Props>;
declare const useInternalZafClient: () => ContextProps;

type NetworkConnector = {
    zaf: any;
    customObjectKey: string;
    timeout?: number;
};
type FirePayload = {
    data: any;
    endpoint: string;
    pathParams?: Record<string, string | number>;
    params?: Record<string, string | number>;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
};

export { CustomObjectsProvider, type FirePayload, type NetworkConnector, type RequiredCustomObjectFields$1 as RequiredCustomObjectFields, useDeleteCustomObjects, useInternalZafClient, usePostCustomObjects, useQueryCustomObjects, useUpdateCustomObjects };
