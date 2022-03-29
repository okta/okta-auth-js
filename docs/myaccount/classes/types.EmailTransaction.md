[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / [types](../modules/types.md) / EmailTransaction

# Class: EmailTransaction

[types](../modules/types.md).EmailTransaction

## Hierarchy

- [`BaseTransaction`](types.BaseTransaction.md)

  ↳ **`EmailTransaction`**

## Table of contents

### Constructors

- [constructor](types.EmailTransaction.md#constructor)

### Properties

- [\_http](types.EmailTransaction.md#_http)
- [challenge](types.EmailTransaction.md#challenge)
- [delete](types.EmailTransaction.md#delete)
- [get](types.EmailTransaction.md#get)
- [headers](types.EmailTransaction.md#headers)
- [id](types.EmailTransaction.md#id)
- [poll](types.EmailTransaction.md#poll)
- [profile](types.EmailTransaction.md#profile)
- [roles](types.EmailTransaction.md#roles)
- [status](types.EmailTransaction.md#status)
- [verify](types.EmailTransaction.md#verify)

## Constructors

### constructor

• **new EmailTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](types.BaseTransaction.md).[constructor](types.BaseTransaction.md#constructor)

#### Defined in

[transactions/EmailTransaction.ts:18](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L18)

## Properties

### \_http

• **\_http**: `Record`<`string`, `string` \| `object`\>

#### Inherited from

[BaseTransaction](types.BaseTransaction.md).[_http](types.BaseTransaction.md#_http)

#### Defined in

[transactions/Base.ts:17](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L17)

___

### challenge

• **challenge**: () => `Promise`<[`EmailChallengeTransaction`](types.EmailChallengeTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`EmailChallengeTransaction`](types.EmailChallengeTransaction.md)\>

##### Returns

`Promise`<[`EmailChallengeTransaction`](types.EmailChallengeTransaction.md)\>

#### Defined in

[transactions/EmailTransaction.ts:14](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L14)

___

### delete

• **delete**: () => `Promise`<[`BaseTransaction`](types.BaseTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`BaseTransaction`](types.BaseTransaction.md)\>

##### Returns

`Promise`<[`BaseTransaction`](types.BaseTransaction.md)\>

#### Defined in

[transactions/EmailTransaction.ts:13](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L13)

___

### get

• **get**: () => `Promise`<[`EmailTransaction`](types.EmailTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`EmailTransaction`](types.EmailTransaction.md)\>

##### Returns

`Promise`<[`EmailTransaction`](types.EmailTransaction.md)\>

#### Defined in

[transactions/EmailTransaction.ts:12](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L12)

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

[transactions/EmailTransaction.ts:7](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L7)

___

### poll

• `Optional` **poll**: () => `Promise`<[`EmailStatusTransaction`](types.EmailStatusTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`EmailStatusTransaction`](types.EmailStatusTransaction.md)\>

##### Returns

`Promise`<[`EmailStatusTransaction`](types.EmailStatusTransaction.md)\>

#### Defined in

[transactions/EmailTransaction.ts:15](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L15)

___

### profile

• **profile**: [`EmailProfile`](../modules/types.md#emailprofile)

#### Defined in

[transactions/EmailTransaction.ts:8](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L8)

___

### roles

• **roles**: [`EmailRole`](../enums/types.EmailRole.md)[]

#### Defined in

[transactions/EmailTransaction.ts:9](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L9)

___

### status

• **status**: [`Status`](../enums/types.Status.md)

#### Defined in

[transactions/EmailTransaction.ts:10](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L10)

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

[transactions/EmailTransaction.ts:16](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L16)
