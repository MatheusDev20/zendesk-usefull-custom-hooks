"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQueryCustomObjects = useQueryCustomObjects;
const react_query_1 = require("@tanstack/react-query");
const context_1 = require("../lib/context");
const core_1 = require("../lib/core");
function useQueryCustomObjects(params) {
    const { zaf } = (0, context_1.useInternalZafClient)();
    const client = (0, core_1.createNetworkClient)({ zaf, customObjectKey: params.customObjectKey });
    const { customObjectKey, translateFn, refetchOnTabChange, filterCriteria } = params;
    // if (by === 'documento_cliente') {
    //   const maskedDocument = getDocumentMask(value);
    //   filter.$and.push({ [filterKey]: { $eq: maskedDocument } });
    // }
    const { data, isFetching, error, refetch } = (0, react_query_1.useQuery)(Object.assign({ queryKey: [`query-custom-objects-${customObjectKey}`, customObjectKey], queryFn: () => client.fire({
            data: filterCriteria,
            endpoint: '/api/v2/custom_objects/{customObjectKey}/records/search',
            method: 'POST',
        }), enabled: filterCriteria !== undefined, refetchOnWindowFocus: refetchOnTabChange, staleTime: 1000 * 60 * 1 }, params.reactQueryOptions));
    const transformedData = translateFn ? data ? translateFn(data) : [] : data;
    return {
        data: transformedData,
        isLoading: isFetching,
        refetch,
        error
    };
}
//# sourceMappingURL=query.js.map