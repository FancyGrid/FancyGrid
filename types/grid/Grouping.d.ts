export default interface Grouping {
  by?: string;
  collapsed?: boolean;
  order?: number[];
  sortGroups?: boolean|string;
  tpl?: string;
}