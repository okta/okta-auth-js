declare namespace OktaAuth {
  type HttpRequestor = (method: string, url: string, args?: any) => Promise<any>;
}