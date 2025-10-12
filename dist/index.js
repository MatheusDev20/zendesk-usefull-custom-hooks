"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CustomObjectsProvider: () => CustomObjectsProvider,
  useDeleteCustomObjects: () => useDeleteCustomObjects,
  useInternalZafClient: () => useInternalZafClient,
  usePostCustomObjects: () => usePostCustomObjects,
  useQueryCustomObjects: () => useQueryCustomObjects,
  useUpdateCustomObjects: () => useUpdateCustomObjects
});
module.exports = __toCommonJS(index_exports);

// src/hooks/query.ts
var import_react_query = require("@tanstack/react-query");

// src/lib/context.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var CustomObjectsContext = (0, import_react.createContext)(null);
var CustomObjectsProvider = ({
  client,
  children
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomObjectsContext.Provider, { value: { zaf: client }, children });
};
var useInternalZafClient = () => {
  const ctx = (0, import_react.useContext)(CustomObjectsContext);
  if (!ctx) throw new Error("useInternalZafClient must be used within CustomObjectsProvider");
  return ctx;
};

// src/utils.ts
function convertPathParams(path, params) {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`{${key}}`, value),
    path
  );
}
function convertQueryParams(path, params) {
  return `${path}?` + Object.entries(params).map(([key, value]) => `${key}=${value}`).join("&");
}

// src/lib/core.ts
function createNetworkClient(options) {
  let headers = { "Content-Type": "application/json" };
  let baseEndpoint = "/api/v2/custom_objects/";
  const { customObjectKey, timeout } = options;
  const { zaf } = useInternalZafClient();
  return {
    async fire(payload) {
      const { endpoint, pathParams, params } = payload;
      let url = `${baseEndpoint}${customObjectKey}${endpoint}`;
      if (pathParams) url = convertPathParams(url, pathParams);
      if (params) url = convertQueryParams(url, params);
      try {
        return await zaf.request({
          url,
          type: payload.method,
          data: payload.data !== null ? JSON.stringify(payload.data) : void 0,
          timeout: timeout || 15e3,
          headers,
          secure: true
        });
      } catch (error) {
        const normalizedError = error;
        if (!normalizedError.status) throw new Error(String(error));
        throw new Error(normalizedError);
      }
    }
  };
}

// src/hooks/query.ts
function useQueryCustomObjects(params) {
  if (!params.customObjectKey || typeof params.customObjectKey !== "string") throw new Error("invalid customObjectKey");
  const { zaf } = useInternalZafClient();
  const client = createNetworkClient({ zaf, customObjectKey: params.customObjectKey });
  let filterKey = "";
  const { customObjectKey, translateFn, refetchOnTabChange, filterCriteria, searchBySingleField } = params;
  if (filterCriteria && searchBySingleField) throw new Error("You must choose either filterCriteria or searchBySingleField");
  if (searchBySingleField) filterKey = `custom_object_fields.${searchBySingleField?.by}`;
  const criteria = searchBySingleField ? { $and: [
    { [filterKey]: { $eq: searchBySingleField.value } }
  ] } : filterCriteria || {};
  const { data, isFetching, error, refetch } = (0, import_react_query.useQuery)({
    queryKey: [`query-custom-objects-${customObjectKey}`, customObjectKey],
    queryFn: () => client.fire({
      data: criteria,
      endpoint: "/{customObjectKey}/records/search",
      pathParams: { customObjectKey },
      method: "POST"
    }),
    refetchOnWindowFocus: refetchOnTabChange,
    staleTime: 1e3 * 60 * 1,
    ...params.reactQueryOptions
  });
  const transformedData = translateFn ? data ? translateFn(data) : [] : data;
  return {
    data: transformedData,
    isLoading: isFetching,
    refetch,
    error
  };
}

// src/hooks/insert.ts
var import_react_query2 = require("@tanstack/react-query");
function usePostCustomObjects({
  customObjectKey,
  postActionFn
}) {
  const queryClient = (0, import_react_query2.useQueryClient)();
  if (!customObjectKey || typeof customObjectKey !== "string") {
    throw new Error("invalid customObjectKey");
  }
  const { zaf } = useInternalZafClient();
  const client = createNetworkClient({ zaf, customObjectKey });
  const mutation = (0, import_react_query2.useMutation)({
    mutationFn: async ({ input }) => {
      if (!input.name || typeof input.name !== "string") {
        throw new Error("name is required and must be a string");
      }
      if (!input.custom_object_fields || typeof input.custom_object_fields !== "object") {
        throw new Error("custom_object_fields is required and must be an object");
      }
      const body = {
        custom_object_record: {
          name: input.name,
          custom_object_fields: input.custom_object_fields
        }
      };
      const data = await client.fire({
        endpoint: "/records",
        pathParams: { customObjectKey },
        method: "POST",
        data: body
      });
      return data;
    },
    onSuccess: () => {
      console.log("Mutation successful, invalidating queries...");
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
    error: mutation.error
  };
}

// src/hooks/remove.ts
var import_react_query3 = require("@tanstack/react-query");
function useDeleteCustomObjects({
  customObjectKey,
  postActionFn,
  onSuccessFn
}) {
  const queryClient = (0, import_react_query3.useQueryClient)();
  if (!customObjectKey || typeof customObjectKey !== "string") {
    throw new Error("invalid customObjectKey");
  }
  const zaf = useInternalZafClient();
  const client = createNetworkClient({ zaf, customObjectKey });
  const mutation = (0, import_react_query3.useMutation)({
    mutationFn: async ({ id }) => {
      if (!id || typeof id !== "string") {
        throw new Error("invalid record id");
      }
      await client.fire({
        method: "DELETE",
        endpoint: "/records/{id}",
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
    error: mutation.error,
    isError: mutation.isError
  };
}

// src/hooks/update.ts
var import_react_query4 = require("@tanstack/react-query");
function useUpdateCustomObjects({
  customObjectKey,
  postActionFn,
  onSuccessFn
}) {
  if (!customObjectKey || typeof customObjectKey !== "string") {
    throw new Error("invalid customObjectKey");
  }
  const { zaf } = useInternalZafClient();
  const client = createNetworkClient({ zaf, customObjectKey });
  const mutation = (0, import_react_query4.useMutation)({
    mutationFn: async ({ input, id }) => {
      const body = {
        custom_object_record: {
          custom_object_fields: input.custom_object_fields
        }
      };
      if (input.name) body.custom_object_record.name = input.name;
      if (!id || typeof id !== "string") {
        throw new Error("invalid recordId - must be provided in the mapped data");
      }
      await client.fire({
        data: body,
        endpoint: `/records/{id}`,
        method: "PUT",
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
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    reset: mutation.reset
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CustomObjectsProvider,
  useDeleteCustomObjects,
  useInternalZafClient,
  usePostCustomObjects,
  useQueryCustomObjects,
  useUpdateCustomObjects
});
