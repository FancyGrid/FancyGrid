import Panel from "../panel/Panel";
import Field from "./Field";
import FormEvent from "./FormEvent";

export default interface FormOptions extends Panel {
  defaults?: Field;
  events?: FormEvent[];
  items?: Field[];
  method?: string;
  params?: object;
  scrollable?: boolean;
  type?: string;
  url?: string;
}