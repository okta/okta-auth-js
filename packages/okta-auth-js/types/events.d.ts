

declare namespace OktaAuth {
  interface EventSource {
    on(event: string, handler: Function, context?: object): void;
    off(event: string, handler: Function): void;
  }

  interface EventEmitter extends EventSource {
    emit(event: string, arg1?: any, arg2?: any): void;
  }
}