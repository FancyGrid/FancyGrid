export default interface Lang {
  paging?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
    info?: string;
    page?: string;
    of?: string;
  },
  loadingText?: string;
  thousandSeparator?: ','|'.'|' '|'';
  decimalSeparator?: ','|'.'|' '|'';
  currencySign?: string;
  sourceText?: string;
  date?: {
    read?: string;
    write?: string;
    edit?: string;
    today?: string;
    startDay?: number;
    days?: string[];
    months?: string[];
    am?: string;
    pm?: string;
    AM?: string;
    PM?: string
    ok?: string;
    cancel?: string;
  },
  yes?: string;
  no?: string;
  dragText?: string;
  update?: string;
  cancel?: string;
  columns?: string;
  autoSizeColumn?: string;
  autoSizeColumns?: string;
  sortAsc?: string;
  sortDesc?: string;
  lock?: string;
  unlock?: string;
  rightLock?: string;
}