[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / [types](../modules/types.md) / PhoneTransaction

# Class: PhoneTransaction

[types](../modules/types.md).PhoneTransaction

## Hierarchy

- [`BaseTransaction`](types.BaseTransaction.md)

  ↳ **`PhoneTransaction`**

## Table of contents

### Constructors

- [constructor](types.PhoneTransaction.md#constructor)

### Properties

- [\_http](types.PhoneTransaction.md#_http)
- [challenge](types.PhoneTransaction.md#challenge)
- [delete](types.PhoneTransaction.md#delete)
- [get](types.PhoneTransaction.md#get)
- [headers](types.PhoneTransaction.md#headers)
- [id](types.PhoneTransaction.md#id)
- [profile](types.PhoneTransaction.md#profile)
- [status](types.PhoneTransaction.md#status)
- [verify](types.PhoneTransaction.md#verify)

## Constructors

### constructor

• **new PhoneTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](types.BaseTransaction.md).[constructor](types.BaseTransaction.md#constructor)

#### Defined in

[transactions/PhoneTransaction.ts:15](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L15)

## Properties

### \_http

• **\_http**: `Record`<`string`, `string` \| `object`\>

#### Inherited from

[BaseTransaction](types.BaseTransaction.md).[_http](types.BaseTransaction.md#_http)

#### Defined in

[transactions/Base.ts:17](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L17)

___

### challenge

• **challenge**: (`payload`: [`ChallengePhonePayload`](../modules/types.md#challengephonepayload)) => `Promise`<[`BaseTransaction`](types.BaseTransaction.md)\>

#### Type declaration

▸ (`payload`): `Promise`<[`BaseTransaction`](types.BaseTransaction.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`ChallengePhonePayload`](../modules/types.md#challengephonepayload) |

##### Returns

`Promise`<[`BaseTransaction`](types.BaseTransaction.md)\>

#### Defined in

[transactions/PhoneTransaction.ts:12](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L12)

___

### delete

• **delete**: () => `Promise`<[`BaseTransaction`](types.BaseTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`BaseTransaction`](types.BaseTransaction.md)\>

##### Returns

`Promise`<[`BaseTransaction`](types.BaseTransaction.md)\>

#### Defined in

[transactions/PhoneTransaction.ts:11](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L11)

___

### get

• **get**: () => `Promise`<[`PhoneTransaction`](types.PhoneTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`PhoneTransaction`](types.PhoneTransaction.md)\>

##### Returns

`Promise`<[`PhoneTransaction`](types.PhoneTransaction.md)\>

#### Defined in

[transactions/PhoneTransaction.ts:10](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L10)

___

### headers

• `Optional` **headers**: `Record`<`string`, `string`\>

#### Inherited from

[BaseTransaction](types.BaseTransaction.md).[headers](types.BaseTransaction.md#headers)

#### Defined in

[transactions/Base.ts:16](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L16)

___

### id

• **id**: `string`

#### Defined in

[transactions/PhoneTransaction.ts:6](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L6)

___

### profile

• **profile**: [`PhoneProfile`](../modules/types.md#phoneprofile)

#### Defined in

[transactions/PhoneTransaction.ts:7](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L7)

___

### status

• **status**: [`Status`](../enums/types.Status.md)

#### Defined in

[transactions/PhoneTransaction.ts:8](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L8)

___

### verify

• `Optional` **verify**: (`payload`: [`VerificationPayload`](../modules/types.md#verificationpayload)) => `Promise`<[`BaseTransaction`](types.BaseTransaction.md)\>

#### Type declaration

▸ (`payload`): `Promise`<[`BaseTransaction`](types.BaseTransaction.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`VerificationPayload`](../modules/types.md#verificationpayload) |

##### Returns

`Promise`<[`BaseTransaction`](types.BaseTransaction.md)\>

#### Defined in

[transactions/PhoneTransaction.ts:13](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L13)
