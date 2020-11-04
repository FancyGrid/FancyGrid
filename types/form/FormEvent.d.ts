import FormApi from "./FormApi";

export default interface FormEvent {
  delay?: number;
  init?(form: FormApi): void;
  scope?: object;
  set?(form: FormApi, params: any): void;
}