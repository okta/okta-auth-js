[@okta/okta-auth-js/myaccount](../README.md) / [Exports](../modules.md) / PhoneTransaction

# Class: PhoneTransaction

## Hierarchy

- [`BaseTransaction`](BaseTransaction.md)

  ↳ **`PhoneTransaction`**

## Table of contents

### Constructors

- [constructor](PhoneTransaction.md#constructor)

### Properties

- [challenge](PhoneTransaction.md#challenge)
- [delete](PhoneTransaction.md#delete)
- [get](PhoneTransaction.md#get)
- [headers](PhoneTransaction.md#headers)
- [id](PhoneTransaction.md#id)
- [profile](PhoneTransaction.md#profile)
- [status](PhoneTransaction.md#status)
- [verify](PhoneTransaction.md#verify)

## Constructors

### constructor

• **new PhoneTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](BaseTransaction.md).[constructor](BaseTransaction.md#constructor)

#### Defined in

[transactions/PhoneTransaction.ts:16](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L16)

## Properties

### challenge

• **challenge**: (`payload`: [`ChallengePhonePayload`](../modules.md#challengephonepayload)) => `Promise`<[`BaseTransaction`](BaseTransaction.md)\>

#### Type declaration

▸ (`payload`): `Promise`<[`BaseTransaction`](BaseTransaction.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`ChallengePhonePayload`](../modules.md#challengephonepayload) |

##### Returns

`Promise`<[`BaseTransaction`](BaseTransaction.md)\>

#### Defined in

[transactions/PhoneTransaction.ts:13](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L13)

___

### delete

• **delete**: () => `Promise`<[`BaseTransaction`](BaseTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`BaseTransaction`](BaseTransaction.md)\>

##### Returns

`Promise`<[`BaseTransaction`](BaseTransaction.md)\>

#### Defined in

[transactions/PhoneTransaction.ts:12](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L12)

___

### get

• **get**: () => `Promise`<[`PhoneTransaction`](PhoneTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`PhoneTransaction`](PhoneTransaction.md)\>

##### Returns

`Promise`<[`PhoneTransaction`](PhoneTransaction.md)\>

#### Defined in

[transactions/PhoneTransaction.ts:11](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L11)

___

### headers

• `Optional` **headers**: `Record`<`string`, `string`\>

#### Inherited from

[BaseTransaction](BaseTransaction.md).[headers](BaseTransaction.md#headers)

#### Defined in

[transactions/Base.ts:15](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L15)

___

### id

• **id**: `string`

#### Defined in

[transactions/PhoneTransaction.ts:6](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L6)

___

### profile

• **profile**: [`PhoneProfile`](../modules.md#phoneprofile)

#### Defined in

[transactions/PhoneTransaction.ts:7](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L7)

___

### status

• **status**: [`Status`](../enums/Status.md)

#### Defined in

[transactions/PhoneTransaction.ts:8](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L8)

___

### verify

• `Optional` **verify**: (`payload`: [`VerificationPayload`](../modules.md#verificationpayload)) => `Promise`<[`BaseTransaction`](BaseTransaction.md)\>

#### Type declaration

▸ (`payload`): `Promise`<[`BaseTransaction`](BaseTransaction.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`VerificationPayload`](../modules.md#verificationpayload) |

##### Returns

`Promise`<[`BaseTransaction`](BaseTransaction.md)\>

#### Defined in

[transactions/PhoneTransaction.ts:14](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PhoneTransaction.ts#L14)
