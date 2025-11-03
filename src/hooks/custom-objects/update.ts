import { UseMutateAsyncFunction, useMutation, useQueryClient } from "@tanstack/react-query";
import { createNetworkClient } from "../../lib/core";
import { useInternalZafClient } from "../../lib/providers/custom-objects";
import { UpdateCustomObjectRecord } from "../../types";


type RequiredCustomObjectFields = {
  name?: string;
  custom_object_fields: Partial<Record<string, any>>
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
  execute: UseMutateAsyncFunction<
    {
      id: string
    },
    Error,
    { input: T, id: string },
    unknown
  >;

  /** 
   * Data returned from successful update containing the updated record ID.
   * Undefined if no successful update has occurred yet.
   */
  data: { id: string };

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
function useUpdateCustomObjects<T extends RequiredCustomObjectFields>({
  customObjectKey,
  postActionFn,
  onSuccessFn
}: UpdateHookInput<T>): UpdateHookReturn<T> {
  // Validate required parameters
  if (!customObjectKey || typeof customObjectKey !== 'string') {
    throw new Error("invalid customObjectKey");
  }

  const { zaf } = useInternalZafClient();
  const client = createNetworkClient({ zaf, customObjectKey });

  const mutation = useMutation({
    mutationFn: async ({ input, id }: { input: T, id: string }) => {
      const body: UpdateCustomObjectRecord = {
        custom_object_record: {
          custom_object_fields: input.custom_object_fields,
        }
      };

      if (input.name) body.custom_object_record.name = input.name;

      if (!id || typeof id !== 'string') {
        throw new Error("invalid recordId - must be provided in the mapped data");
      }

      await client.fire({
        data: body,
        endpoint: `/records/{id}`,
        method: 'PUT',
        pathParams: { id }
      });
      return { id };
    },

    onSuccess: ({ id }) => {
      if (onSuccessFn) onSuccessFn(id);
      if (postActionFn) postActionFn();
    },

    onError: (error) => {
      throw new Error(`Error updating custom object record with key ${customObjectKey}`);
    }
  });

  return {
    execute: mutation.mutateAsync,
    data: mutation.data as { id: string },
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
    isError: mutation.isError,
    reset: mutation.reset
  };
}

export { useUpdateCustomObjects };