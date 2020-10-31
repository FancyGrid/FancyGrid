interface Data {
  proxy: {
    reader?: {
      root?: string;
    }
    url?: string;
  }
}

export default interface Field {
  column?: boolean;
  data?: Data;
  defaults?: object;
  disabled?: boolean;
  displayKey?: string;
  editable?: boolean;
  emptyText?: string;
  events?: object[];
  format?: {
    edit?: string;
    inputFn?: Function;
    read?: string;
    write?: string;
  }
  itemCheckBox?: boolean;
  inputHeight?: number;
  inputLabel?: string;
  inputWidth?: string;
  label?: string;
  labelAlign?: string;
  labelWidth?: number;
  listItemTpl?: string;
  leftTpl?: string;
  max?: number|Date;
  min?: number|Date;
  minListWidth?: number;
  multiSelect?: boolean;
  multiToggle?: boolean;
  name?: string;
  showPassTip?: boolean;
  spin?: boolean;
  step?: number;
  subSearch?: boolean;
  tabIndex?: number;
  tip?: string|Function;
  type?: string;
  value?: any;
  valueKey?: string;
  vtype?: any;
  width?: number;
}