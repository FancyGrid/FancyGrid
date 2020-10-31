import GridApi from "./grid/GridApi";

declare const Fancy : {
  getWidget(id: string): GridApi;
  currency: {
    AUD: string;
    BRL: string;
    CAD: string;
    CNY: string;
    CZK: string;
    DKK: string;
    EUR: string;
    GBP: string;
    IDR: string;
    JPY: string;
    KRW: string;
    NOK: string;
    PLN: string;
    RUB: string;
    SEK: string;
    TRY: string;
    USD: string;
  };
  COLORS: string[];
  version: string;
}

export default Fancy;