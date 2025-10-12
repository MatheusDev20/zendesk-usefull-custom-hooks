"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNetworkClient = createNetworkClient;
function createNetworkClient(options) {
    let headers = { 'Content-Type': 'application/json' };
    let baseEndpoint = "/api/v2/custom_objects/";
    const { zaf: { request }, customObjectKey, timeout } = options;
    return {
        async fire(payload) {
            const { endpoint, pathParams, params } = payload;
            let url = `${baseEndpoint}${customObjectKey}${endpoint}`;
            if (pathParams)
                url = convertPathParams(url, pathParams);
            if (params)
                url = convertQueryParams(url, params);
            try {
                return await request({
                    url,
                    type: payload.method,
                    data: payload.data !== null ? JSON.stringify(payload.data) : undefined,
                    timeout: timeout || 15000,
                    headers,
                    secure: true
                });
            }
            catch (error) {
                const normalizedError = error;
                if (!normalizedError.status)
                    throw new Error(String(error));
                throw new Error(normalizedError);
            }
        }
    };
}
//# sourceMappingURL=core.js.map