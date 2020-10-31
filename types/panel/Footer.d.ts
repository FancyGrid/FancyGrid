export default interface Footer {
  status?: string;
  source?: string|{
    link?: string;
    sourceText?: string;
    text?: string;
  };
}