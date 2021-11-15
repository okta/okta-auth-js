/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


import assert from 'assert';
import TestApp from '../pageobjects/TestApp';

const ISSUER = process.env.ISSUER;
const CLIENT_ID = process.env.CLIENT_ID;

const flows = ['implicit', 'pkce'];

async function openImplicit(options, openInNewWindow) {
  options = Object.assign({ issuer: ISSUER, clientId: CLIENT_ID, pkce: false }, options);
  await TestApp.open(options, openInNewWindow);
  await TestApp.selectPkceOptionOff();
  await TestApp.pkceOptionOff.then( el=> el.isSelected().then(isSelected=>{
    assert(isSelected === true);
  }));
  await TestApp.issuer.then(el => el.getValue()).then(value => {
    assert(value === ISSUER);
  });
  await TestApp.clientId.then(el => el.getValue()).then(value => {
    assert(value === CLIENT_ID);
  });
}

async function openPKCE(options, openInNewWindow) {
  options = Object.assign({ issuer: ISSUER, clientId: CLIENT_ID, pkce: true }, options);
  await TestApp.open(options, openInNewWindow);
  await TestApp.pkceOptionOn.then(el => el.isSelected()).then(isSelected => {
    assert(isSelected);
  });
  await TestApp.issuer.then(el => el.getValue()).then(val => {
    assert(val === options.issuer);
  });
  await TestApp.clientId.then(el => el.getValue()).then(val => {
    assert(val === options.clientId);
  });
}

export { flows, openImplicit, openPKCE };
