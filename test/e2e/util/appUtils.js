import assert from 'assert';
import TestApp from '../pageobjects/TestApp';

const ISSUER = process.env.ISSUER;
const CLIENT_ID = process.env.CLIENT_ID;

const flows = ['implicit', 'pkce'];

function openImplicit() {
  TestApp.open({ issuer: ISSUER, clientId: CLIENT_ID });
  assert(TestApp.pkceOption.isSelected() === false);
  assert(TestApp.issuer.getValue() === ISSUER);
  assert(TestApp.clientId.getValue() === CLIENT_ID);
}

function openPKCE() {
  TestApp.open({ issuer: ISSUER, clientId: CLIENT_ID, pkce: true });
  assert(TestApp.pkceOption.isSelected());
  assert(TestApp.issuer.getValue() === ISSUER);
  assert(TestApp.clientId.getValue() === CLIENT_ID);
}

export { flows, openImplicit, openPKCE };
