export type NetworkConnector = {
    zaf: any;
    customObjectKey: string;
    timeout?: number;
};
export type FirePayload = {
    data: any;
    endpoint: string;
    pathParams?: Record<string, string | number>;
    params?: Record<string, string | number>;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
};
