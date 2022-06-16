[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / [index](../modules/index.md) / PhoneTransaction

# Class: PhoneTransaction

[index](../modules/index.md).PhoneTransaction

## Hierarchy

- [`BaseTransaction`](index.BaseTransaction.md)

  ↳ **`PhoneTransaction`**

## Table of contents

### Constructors

- [constructor](index.PhoneTransaction.md#constructor)

### Properties

- [\_http](index.PhoneTransaction.md#_http)
- [challenge](index.PhoneTransaction.md#challenge)
- [delete](index.PhoneTransaction.md#delete)
- [get](index.PhoneTransaction.md#get)
- [headers](index.PhoneTransaction.md#headers)
- [id](index.PhoneTransaction.md#id)
- [profile](index.PhoneTransaction.md#profile)
- [status](index.PhoneTransaction.md#status)
- [verify](index.PhoneTransaction.md#verify)

## Constructors

### constructor

• **new PhoneTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](index.BaseTransaction.md).[constructor](index.BaseTransaction.md#constructor)

#### Defined in

[transactions/PhoneTransaction.ts:16](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L16)

## Properties

### \_http

• **\_http**: `Record`<`string`, `string` \| `object`\>

#### Inherited from

[BaseTransaction](index.BaseTransaction.md).[_http](index.BaseTransaction.md#_http)

#### Defined in

[transactions/Base.ts:17](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L17)

___

### challenge

• **challenge**: (`payload`: [`ChallengePhonePayload`](../modules/types.md#challengephonepayload)) => `Promise`<[`BaseTransaction`](index.BaseTransaction.md)\>

#### Type declaration

▸ (`payload`): `Promise`<[`BaseTransaction`](index.BaseTransaction.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`ChallengePhonePayload`](../modules/types.md#challengephonepayload) |

##### Returns

`Promise`<[`BaseTransaction`](index.BaseTransaction.md)\>

#### Defined in

[transactions/PhoneTransaction.ts:13](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L13)

___

### delete

• **delete**: () => `Promise`<[`BaseTransaction`](index.BaseTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`BaseTransaction`](index.BaseTransaction.md)\>

##### Returns

`Promise`<[`BaseTransaction`](index.BaseTransaction.md)\>

#### Defined in

[transactions/PhoneTransaction.ts:12](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L12)

___

### get

• **get**: () => `Promise`<[`PhoneTransaction`](index.PhoneTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`PhoneTransaction`](index.PhoneTransaction.md)\>

##### Returns

`Promise`<[`PhoneTransaction`](index.PhoneTransaction.md)\>

#### Defined in

[transactions/PhoneTransaction.ts:11](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L11)

___

### headers

• `Optional` **headers**: `Record`<`string`, `string`\>

#### Inherited from

[BaseTransaction](index.BaseTransaction.md).[headers](index.BaseTransaction.md#headers)

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

• `Optional` **verify**: (`payload`: [`VerificationPayload`](../modules/types.md#verificationpayload)) => `Promise`<[`BaseTransaction`](index.BaseTransaction.md)\>

#### Type declaration

▸ (`payload`): `Promise`<[`BaseTransaction`](index.BaseTransaction.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`VerificationPayload`](../modules/types.md#verificationpayload) |

##### Returns

`Promise`<[`BaseTransaction`](index.BaseTransaction.md)\>

#### Defined in

[transactions/PhoneTransaction.ts:14](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L14)
