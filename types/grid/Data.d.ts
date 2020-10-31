import {Proxy} from "./Proxy";

export default interface Data {
  chart?: any[];
  fields?: string[]|number[];
  items?: any[];
  proxy?: Proxy;
  pageSize?: number;
  remoteFilter?: boolean;
  remotePage?: boolean;
  remoteSort?: boolean;
}