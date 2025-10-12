import { FirePayload, NetworkConnector } from "../types";
import { convertPathParams, convertQueryParams } from "../utils";
import { useInternalZafClient } from "./context";


export function createNetworkClient(options: NetworkConnector) {
  let headers = { 'Content-Type': 'application/json' };
  let baseEndpoint = "/api/v2/custom_objects/";

  const { customObjectKey, timeout } = options;
  const { zaf } = useInternalZafClient();

  return {
    async fire(payload: FirePayload): Promise<any> {
      const { endpoint, pathParams, params } = payload;

      let url = `${baseEndpoint}${customObjectKey}${endpoint}`;
      if (pathParams) url = convertPathParams(url, pathParams);
      if (params) url = convertQueryParams(url, params);

      try {
        return await zaf.request({
          url,
          type: payload.method,
          data: payload.data !== null ? JSON.stringify(payload.data) : undefined,
          timeout: timeout || 15000,
          headers,
          secure: true
        });
      } catch (error) {
        const normalizedError = error as any;
        if (!normalizedError.status) throw new Error(String(error));
        throw new Error(normalizedError);
      }
    }
  }
}