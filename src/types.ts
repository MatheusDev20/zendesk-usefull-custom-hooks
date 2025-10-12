export type NetworkConnector = {
  zaf: any
  customObjectKey: string;
  timeout?: number;
} 

export type FirePayload = {
  data: any;
  endpoint: string;
  pathParams?: Record<string, string | number>;
  params?: Record<string, string | number>;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export type PostCustomObjectRecord = {
  custom_object_record: {
    custom_object_fields: Record<string, any>
    name: string;
  };
};

export type UpdateCustomObjectRecord = { 
  custom_object_record: {
    custom_object_fields: Partial<Record<string, any>>
    name?: string;
  };
}

export type InsertCOReturn = {
  customObjectUrl: string;
  name: string;
  id: string;
}
