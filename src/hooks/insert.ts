/* eslint-disable prefer-const */
import {
  UseMutateAsyncFunction,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import { InsertCOReturn, PostCustomObjectRecord } from '../types';
import { useInternalZafClient } from '../lib/context';
import { createNetworkClient } from '../lib/core';

/**
 * Base structure required for all custom object records
 */
type RequiredCustomObjectFields = {
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
type PostHookReturn<T extends RequiredCustomObjectFields> = {
  /** 
   * Async function to execute the mutation. 
   * Accepts input data of type T (which must include name and custom_object_fields).
   */
  execute: UseMutateAsyncFunction<
    {
      customObjectUrl: string;
      name: string;
      id: string;
    },
    Error,
    { input: T },
    unknown
  >;

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
  data: { customObjectUrl: string; name: string; id: string } | undefined;
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
function usePostCustomObjects<T extends RequiredCustomObjectFields>({
  customObjectKey,
  postActionFn
}: PostHookInput): PostHookReturn<T> {
  const queryClient = useQueryClient();
  if (!customObjectKey || typeof customObjectKey !== 'string') {
    throw new Error("invalid customObjectKey");
  }

  const { zaf } = useInternalZafClient();
  const client = createNetworkClient({ zaf, customObjectKey });

  const mutation = useMutation<InsertCOReturn, Error, { input: T }>({
    mutationFn: async ({ input }: { input: T }) => {
      if (!input.name || typeof input.name !== 'string') {
        throw new Error("name is required and must be a string");
      }
      if (!input.custom_object_fields || typeof input.custom_object_fields !== 'object') {
        throw new Error("custom_object_fields is required and must be an object");
      }

      const body: PostCustomObjectRecord = {
        custom_object_record: {
          name: input.name,
          custom_object_fields: input.custom_object_fields,
        }
      };
      const data = await client.fire({
        endpoint: '/records',
        pathParams: { customObjectKey },
        method: 'POST',
        data: body
      });

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`query-custom-objects-${customObjectKey}`]
      });

      if (postActionFn) postActionFn();
    },

    onError: (error) => {
      console.error("Error creating custom object record:", error);
    }
  });

  return {
    execute: mutation.mutateAsync,
    data: mutation.data,
    reset: mutation.reset,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error as Error | null
  };
}

export { usePostCustomObjects };

export type { RequiredCustomObjectFields };