[@okta/okta-auth-js/myaccount](../README.md) / [Exports](../modules.md) / OktaAuthMyAccountInterface

# Interface: OktaAuthMyAccountInterface<M, S, O\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `OAuthTransactionMeta` = `PKCETransactionMeta` |
| `S` | extends `OAuthStorageManagerInterface`<`M`\> = `OAuthStorageManagerInterface`<`M`\> |
| `O` | extends `OktaAuthOAuthOptions` = `OktaAuthOAuthOptions` |

## Hierarchy

- `OktaAuthOAuthInterface`<`M`, `S`, `O`\>

  ↳ **`OktaAuthMyAccountInterface`**

## Table of contents

### Properties

- [\_oktaUserAgent](OktaAuthMyAccountInterface.md#_oktauseragent)
- [emitter](OktaAuthMyAccountInterface.md#emitter)
- [features](OktaAuthMyAccountInterface.md#features)
- [http](OktaAuthMyAccountInterface.md#http)
- [myaccount](OktaAuthMyAccountInterface.md#myaccount)
- [options](OktaAuthMyAccountInterface.md#options)
- [pkce](OktaAuthMyAccountInterface.md#pkce)
- [session](OktaAuthMyAccountInterface.md#session)
- [storageManager](OktaAuthMyAccountInterface.md#storagemanager)
- [token](OktaAuthMyAccountInterface.md#token)
- [tokenManager](OktaAuthMyAccountInterface.md#tokenmanager)
- [transactionManager](OktaAuthMyAccountInterface.md#transactionmanager)

### Methods

- [clearStorage](OktaAuthMyAccountInterface.md#clearstorage)
- [closeSession](OktaAuthMyAccountInterface.md#closesession)
- [getAccessToken](OktaAuthMyAccountInterface.md#getaccesstoken)
- [getIdToken](OktaAuthMyAccountInterface.md#getidtoken)
- [getIssuerOrigin](OktaAuthMyAccountInterface.md#getissuerorigin)
- [getOriginalUri](OktaAuthMyAccountInterface.md#getoriginaluri)
- [getRefreshToken](OktaAuthMyAccountInterface.md#getrefreshtoken)
- [getUser](OktaAuthMyAccountInterface.md#getuser)
- [isAuthenticated](OktaAuthMyAccountInterface.md#isauthenticated)
- [isLoginRedirect](OktaAuthMyAccountInterface.md#isloginredirect)
- [isPKCE](OktaAuthMyAccountInterface.md#ispkce)
- [removeOriginalUri](OktaAuthMyAccountInterface.md#removeoriginaluri)
- [revokeAccessToken](OktaAuthMyAccountInterface.md#revokeaccesstoken)
- [revokeRefreshToken](OktaAuthMyAccountInterface.md#revokerefreshtoken)
- [setHeaders](OktaAuthMyAccountInterface.md#setheaders)
- [setOriginalUri](OktaAuthMyAccountInterface.md#setoriginaluri)
- [signInWithRedirect](OktaAuthMyAccountInterface.md#signinwithredirect)
- [signOut](OktaAuthMyAccountInterface.md#signout)
- [storeTokensFromRedirect](OktaAuthMyAccountInterface.md#storetokensfromredirect)
- [webfinger](OktaAuthMyAccountInterface.md#webfinger)

## Properties

### \_oktaUserAgent

• **\_oktaUserAgent**: `OktaUserAgent`

#### Inherited from

OktaAuthOAuthInterface.\_oktaUserAgent

#### Defined in

[http/types.ts:87](https://github.com/okta/okta-auth-js/blob/master/lib/http/types.ts#L87)

___

### emitter

• **emitter**: `EventEmitter`

#### Inherited from

OktaAuthOAuthInterface.emitter

#### Defined in

[base/types.ts:46](https://github.com/okta/okta-auth-js/blob/master/lib/base/types.ts#L46)

___

### features

• **features**: `FeaturesAPI`

#### Inherited from

OktaAuthOAuthInterface.features

#### Defined in

[base/types.ts:47](https://github.com/okta/okta-auth-js/blob/master/lib/base/types.ts#L47)

___

### http

• **http**: `HttpAPI`

#### Inherited from

OktaAuthOAuthInterface.http

#### Defined in

[http/types.ts:88](https://github.com/okta/okta-auth-js/blob/master/lib/http/types.ts#L88)

___

### myaccount

• **myaccount**: `any`

#### Defined in

[myaccount/types.ts:117](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L117)

___

### options

• **options**: `O`

#### Inherited from

OktaAuthOAuthInterface.options

#### Defined in

[base/types.ts:45](https://github.com/okta/okta-auth-js/blob/master/lib/base/types.ts#L45)

___

### pkce

• **pkce**: `PkceAPI`

#### Inherited from

OktaAuthOAuthInterface.pkce

#### Defined in

[oidc/types/api.ts:134](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L134)

___

### session

• **session**: `SessionAPI`

#### Inherited from

OktaAuthOAuthInterface.session

#### Defined in

[session/types.ts:26](https://github.com/okta/okta-auth-js/blob/master/lib/session/types.ts#L26)

___

### storageManager

• **storageManager**: `S`

#### Inherited from

OktaAuthOAuthInterface.storageManager

#### Defined in

[storage/types.ts:106](https://github.com/okta/okta-auth-js/blob/master/lib/storage/types.ts#L106)

___

### token

• **token**: `TokenAPI`

#### Inherited from

OktaAuthOAuthInterface.token

#### Defined in

[oidc/types/api.ts:132](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L132)

___

### tokenManager

• **tokenManager**: `TokenManagerInterface`

#### Inherited from

OktaAuthOAuthInterface.tokenManager

#### Defined in

[oidc/types/api.ts:133](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L133)

___

### transactionManager

• **transactionManager**: `TransactionManagerInterface`

#### Inherited from

OktaAuthOAuthInterface.transactionManager

#### Defined in

[oidc/types/api.ts:135](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L135)

## Methods

### clearStorage

▸ **clearStorage**(): `void`

#### Returns

`void`

#### Inherited from

OktaAuthOAuthInterface.clearStorage

#### Defined in

[storage/types.ts:107](https://github.com/okta/okta-auth-js/blob/master/lib/storage/types.ts#L107)

___

### closeSession

▸ **closeSession**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

#### Inherited from

OktaAuthOAuthInterface.closeSession

#### Defined in

[session/types.ts:27](https://github.com/okta/okta-auth-js/blob/master/lib/session/types.ts#L27)

___

### getAccessToken

▸ **getAccessToken**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Inherited from

OktaAuthOAuthInterface.getAccessToken

#### Defined in

[oidc/types/api.ts:139](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L139)

___

### getIdToken

▸ **getIdToken**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Inherited from

OktaAuthOAuthInterface.getIdToken

#### Defined in

[oidc/types/api.ts:138](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L138)

___

### getIssuerOrigin

▸ **getIssuerOrigin**(): `string`

#### Returns

`string`

#### Inherited from

OktaAuthOAuthInterface.getIssuerOrigin

#### Defined in

[http/types.ts:91](https://github.com/okta/okta-auth-js/blob/master/lib/http/types.ts#L91)

___

### getOriginalUri

▸ **getOriginalUri**(`state?`): `undefined` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state?` | `string` |

#### Returns

`undefined` \| `string`

#### Inherited from

OktaAuthOAuthInterface.getOriginalUri

#### Defined in

[oidc/types/api.ts:117](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L117)

___

### getRefreshToken

▸ **getRefreshToken**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Inherited from

OktaAuthOAuthInterface.getRefreshToken

#### Defined in

[oidc/types/api.ts:140](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L140)

___

### getUser

▸ **getUser**<`T`\>(): `Promise`<`UserClaims`<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `CustomUserClaims` = `CustomUserClaims` |

#### Returns

`Promise`<`UserClaims`<`T`\>\>

#### Inherited from

OktaAuthOAuthInterface.getUser

#### Defined in

[oidc/types/api.ts:146](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L146)

___

### isAuthenticated

▸ **isAuthenticated**(`options?`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `IsAuthenticatedOptions` |

#### Returns

`Promise`<`boolean`\>

#### Inherited from

OktaAuthOAuthInterface.isAuthenticated

#### Defined in

[oidc/types/api.ts:142](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L142)

___

### isLoginRedirect

▸ **isLoginRedirect**(): `boolean`

#### Returns

`boolean`

#### Inherited from

OktaAuthOAuthInterface.isLoginRedirect

#### Defined in

[oidc/types/api.ts:144](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L144)

___

### isPKCE

▸ **isPKCE**(): `boolean`

#### Returns

`boolean`

#### Inherited from

OktaAuthOAuthInterface.isPKCE

#### Defined in

[oidc/types/api.ts:137](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L137)

___

### removeOriginalUri

▸ **removeOriginalUri**(`state?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state?` | `string` |

#### Returns

`void`

#### Inherited from

OktaAuthOAuthInterface.removeOriginalUri

#### Defined in

[oidc/types/api.ts:119](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L119)

___

### revokeAccessToken

▸ **revokeAccessToken**(`accessToken?`): `Promise`<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `accessToken?` | `AccessToken` |

#### Returns

`Promise`<`unknown`\>

#### Inherited from

OktaAuthOAuthInterface.revokeAccessToken

#### Defined in

[oidc/types/api.ts:149](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L149)

___

### revokeRefreshToken

▸ **revokeRefreshToken**(`refreshToken?`): `Promise`<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `refreshToken?` | `RefreshToken` |

#### Returns

`Promise`<`unknown`\>

#### Inherited from

OktaAuthOAuthInterface.revokeRefreshToken

#### Defined in

[oidc/types/api.ts:150](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L150)

___

### setHeaders

▸ **setHeaders**(`headers`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `headers` | `any` |

#### Returns

`void`

#### Inherited from

OktaAuthOAuthInterface.setHeaders

#### Defined in

[http/types.ts:90](https://github.com/okta/okta-auth-js/blob/master/lib/http/types.ts#L90)

___

### setOriginalUri

▸ **setOriginalUri**(`originalUri`, `state?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `originalUri` | `string` |
| `state?` | `string` |

#### Returns

`void`

#### Inherited from

OktaAuthOAuthInterface.setOriginalUri

#### Defined in

[oidc/types/api.ts:118](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L118)

___

### signInWithRedirect

▸ **signInWithRedirect**(`opts?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | `SigninWithRedirectOptions` |

#### Returns

`Promise`<`void`\>

#### Inherited from

OktaAuthOAuthInterface.signInWithRedirect

#### Defined in

[oidc/types/api.ts:147](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L147)

___

### signOut

▸ **signOut**(`opts?`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | `SignoutOptions` |

#### Returns

`Promise`<`boolean`\>

#### Inherited from

OktaAuthOAuthInterface.signOut

#### Defined in

[oidc/types/api.ts:143](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L143)

___

### storeTokensFromRedirect

▸ **storeTokensFromRedirect**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Inherited from

OktaAuthOAuthInterface.storeTokensFromRedirect

#### Defined in

[oidc/types/api.ts:145](https://github.com/okta/okta-auth-js/blob/master/lib/oidc/types/api.ts#L145)

___

### webfinger

▸ **webfinger**(`opts`): `Promise`<`object`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `any` |

#### Returns

`Promise`<`object`\>

#### Inherited from

OktaAuthOAuthInterface.webfinger

#### Defined in

[http/types.ts:92](https://github.com/okta/okta-auth-js/blob/master/lib/http/types.ts#L92)
