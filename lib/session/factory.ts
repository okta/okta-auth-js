import { SessionAPI } from './types';
import { closeSession, getSession, refreshSession, sessionExists, setCookieAndRedirect } from './api';
import { OktaAuthBaseInterface } from '../base/types';

export function createSessionApi(sdk: OktaAuthBaseInterface): SessionAPI {
  const session = {
    close: closeSession.bind(null, sdk),
    exists: sessionExists.bind(null, sdk),
    get: getSession.bind(null, sdk),
    refresh: refreshSession.bind(null, sdk),
    setCookieAndRedirect: setCookieAndRedirect.bind(null, sdk)
  };
  return session;
}
