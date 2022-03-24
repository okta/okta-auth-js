export interface Page {
  isDisplayedElementSelector: string;
  isDisplayedElementText?: string | string[];
}

export abstract class PageWithTitle implements Page {
  title: string | string[] = '';

  get pageTitle() { return '#page-title-header'; }
  get isDisplayedElementSelector() { return this.pageTitle; }
  get isDisplayedElementText() { return this.title; }
}
