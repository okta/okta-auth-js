declare interface PromiseConstructor {
  // eslint-disable-next-line max-len, @typescript-eslint/member-delimiter-style
  allSettled(promises: Array<Promise<any>>): Promise<Array<{status: 'fulfilled' | 'rejected', value?: any, reason?: any}>>;
}

declare interface Node {
  tagName: string;
  src: string;
}

declare interface Document {
  documentMode: number;
}