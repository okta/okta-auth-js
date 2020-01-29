import assert from 'assert';
import TestApp from '../pageobjects/TestApp';

const ISSUER = process.env.ISSUER;
const CLIENT_ID = process.env.CLIENT_ID;

const flows = ['implicit', 'pkce'];

async function openImplicit(options) {
  await TestApp.open(Object.assign({ issuer: ISSUER, clientId: CLIENT_ID }, options));
  await TestApp.pkceOption.then(el => el.isSelected()).then(isSelected => {
    assert(isSelected === false);
  });
  await TestApp.issuer.then(el => el.getValue()).then(value => {
    assert(value === ISSUER);
  });
  await TestApp.clientId.then(el => el.getValue()).then(value => {
    assert(value === CLIENT_ID);
  });
}

async function openPKCE(options) {
  await TestApp.open(Object.assign({ issuer: ISSUER, clientId: CLIENT_ID, pkce: true }, options));
  await TestApp.pkceOption.then(el => el.isSelected()).then(isSelected => {
    assert(isSelected);
  });
  await TestApp.issuer.then(el => el.getValue()).then(val => {
    assert(val === ISSUER);
  });
  await TestApp.clientId.then(el => el.getValue()).then(val => {
    assert(val === CLIENT_ID);
  });
}

export { flows, openImplicit, openPKCE };
