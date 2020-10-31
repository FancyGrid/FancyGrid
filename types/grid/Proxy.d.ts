export default interface Proxy {
  afterRequest?: Function;
  api?: {
    create?: string;
    read?: string;
    update?: string;
    destroy?: string;
  }
  autoLoad?: boolean;
  autoSave?: boolean;
  batch?: boolean;
  beforeRequest?: Function;
  headers?: any;
  methods?: {
    create?: string;
    read?: string;
    update?: string;
    destroy?: string;
  }
  params?: any;
  reader?: {
    root?: string;
  }
  type?: string;
  url?: string;
  wrapper?: boolean;
  words?: {
    direction?: string;
    filter?: string;
    key?: string;
    limit?: string;
    page?: string;
    start?: string;
    sort?: string;
    value?: string;
  }
  writer?: {
    allFields?: boolean;
    type?: string;
  }
}