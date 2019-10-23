import assert from 'assert';
import TestApp from '../pageobjects/TestApp';
import toQueryParams from './toQueryParams';

const ISSUER = process.env.ISSUER;
const CLIENT_ID = process.env.CLIENT_ID;
const BASE_URL = 'http://localhost:8080';
const flows = ['implicit', 'pkce'];

function buildUrl(queryObj) {
  return BASE_URL + toQueryParams(queryObj);
}

const PKCE_URL = buildUrl({ issuer: ISSUER, clientId: CLIENT_ID, pkce: true });
const IMPLICIT_URL = buildUrl({ issuer: ISSUER, clientId: CLIENT_ID });

// function openImplicit() {
//   TestApp.open({ issuer: ISSUER, clientId: CLIENT_ID });
//   assert(TestApp.pkceOption.isSelected() === false);
//   assert(TestApp.issuer.getValue() === ISSUER);
//   assert(TestApp.clientId.getValue() === CLIENT_ID);
// }

// function openPKCE() {
//   TestApp.open({ issuer: ISSUER, clientId: CLIENT_ID, pkce: true });
//   assert(TestApp.pkceOption.isSelected());
//   assert(TestApp.issuer.getValue() === ISSUER);
//   assert(TestApp.clientId.getValue() === CLIENT_ID);
// }



export { flows, PKCE_URL, IMPLICIT_URL };
