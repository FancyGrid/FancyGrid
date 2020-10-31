export interface BarButton {
  allowToggle?: boolean;
  cls?: string;
  data?: any[];
  disabled?: boolean;
  displayKey?: string;
  editable?: boolean;
  emptyText?: string;
  enableToggle?: boolean;
  events?: any[];
  format?: any;
  handler?: Function;
  hidden?: boolean;
  id?: string;
  imageCls?: string;
  inputHeight?: number;
  itemCheckBox?: boolean;
  items?: any[];
  leftTpl?: string;
  leftWidth?: number;
  max?: number|Date;
  menu?: any[];
  min?: number|Date;
  minListWidth?: number;
  multiSelect?: boolean;
  multiToggle?: boolean;
  pressed?: boolean;
  spin?: boolean;
  step?: number;
  subSearch?: boolean;
  text?: string;
  tip?: string;
  toggleGroup?: boolean;
  type?: string;
  value?: any;
  valueKey?: string;
  vtype?: any;
  width?: number;
}

export interface TBarButton extends BarButton {
  action?: string;
  paramsMenu?: boolean;
  paramsText?: string;
}

export interface SubTBarButton extends TBarButton {}