export default interface Expander {
  dataFn?: Function;
  expanded?: boolean;
  render?: Function;
  tpl?: string;
}