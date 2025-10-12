import { FirePayload, NetworkConnector } from "../types";
export declare function createNetworkClient(options: NetworkConnector): {
    fire(payload: FirePayload): Promise<any>;
};
