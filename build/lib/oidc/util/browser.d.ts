import { OktaAuth } from '../../types';
export declare function addListener(eventTarget: any, name: any, fn: any): void;
export declare function removeListener(eventTarget: any, name: any, fn: any): void;
export declare function loadFrame(src: any): HTMLIFrameElement;
export declare function loadPopup(src: any, options: any): Window;
export declare function addPostMessageListener(sdk: OktaAuth, timeout: any, state: any): Promise<unknown>;
