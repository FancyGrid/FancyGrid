import Panel from "../panel/Panel";
import Field from "./Field";

export default interface FormOptions extends Panel {
  defaults?: Field;
  events?: any[];
  items?: Field[];
  method?: string;
  params?: object;
  scrollable?: boolean;
  url?: string;
}