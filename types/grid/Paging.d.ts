export default interface Paging {
  barType?: 'tbar' | 'both' | 'none';
  inputWidth?: number;
  pageSize?: number;
  pageOverFlowType?: 'first' | 'last';
  pageSizeData?: number[];
  refreshButton?: boolean;
}