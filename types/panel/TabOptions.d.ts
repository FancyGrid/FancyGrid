import {Title} from "./Title";
import FormOptions from "../form/FormOptions";
import GridOptions from "../grid/GridOptions";

interface TabOptions {
  renderTo?: any;
  title?: string|Title;
  theme?: any;
  width?: string|number;
  height?: string|number;
  activeTab?: number;
  resizable?: boolean;
  items?: (FormOptions|GridOptions)[];
}