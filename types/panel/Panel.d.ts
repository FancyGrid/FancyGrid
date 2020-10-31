import {BarButton, SubTBarButton, TBarButton} from "./BarButton";
import Footer from "./Footer";
import Lang from "../Lang";
import {Title, SubTitle} from "./Title";

export default interface Panel {
  barHeight?: number;
  bbar?: BarButton[];
  bbarHeight?: number;
  bbarHidden?: boolean;
  buttons?: BarButton[];
  buttonsHeight?: number;
  buttonsHidden?: boolean;
  cls?: string;
  footer?: Footer;
  height?: string|number;
  id?: string;
  i18n?: string;
  lang?: Lang;
  modal?: boolean;
  renderOuter?: any;
  renderTo?: any;
  shadow?: boolean;
  subTBar?: SubTBarButton[];
  subTBarHeight?: number;
  subTBarHidden?: boolean;
  subHeaderFilter?: boolean;
  subTitle?: string|SubTitle;
  tabScrollStep?: number;
  tbar?: TBarButton[];
  tbarHeight?: number;
  tbarHidden?: boolean;
  theme?: any;
  title?: string|Title;
  titleHeight?: number;
  width?: string|number;
  window?: boolean;
}