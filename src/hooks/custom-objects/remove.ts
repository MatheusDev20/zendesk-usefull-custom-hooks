import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useInternalZafClient } from "../../lib/providers/custom-objects";
import { createNetworkClient } from "../../lib/core";

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
  data: { deletedId: string } | undefined;
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
function useDeleteCustomObjects({
  customObjectKey,
  postActionFn,
  onSuccessFn
}: DeleteHookInput): DeleteHookReturn {
  const queryClient = useQueryClient();

  if (!customObjectKey || typeof customObjectKey !== 'string') {
    throw new Error("invalid customObjectKey");
  }

  const zaf = useInternalZafClient();
  const client = createNetworkClient({ zaf, customObjectKey });

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!id || typeof id !== 'string') {
        throw new Error("invalid record id");
      }

      await client.fire({
        method: 'DELETE',
        endpoint: '/records/{id}',
        pathParams: { id },
        data: null
      });

      return { deletedId: id };
    },

    onSuccess: () => {
      if (onSuccessFn) {
        onSuccessFn();
      }

      queryClient.invalidateQueries({
        queryKey: [`query-custom-objects-${customObjectKey}`]
      });
      if (postActionFn) {
        postActionFn();
      }
    },

    onError: () => {
      throw new Error(`Error deleting custom object record with key ${customObjectKey}`);
    }
  });

  return {
    execute: mutation.mutateAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
    isError: mutation.isError
  };
}

export { useDeleteCustomObjects };