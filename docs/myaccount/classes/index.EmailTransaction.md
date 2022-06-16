[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / [index](../modules/index.md) / EmailTransaction

# Class: EmailTransaction

[index](../modules/index.md).EmailTransaction

## Hierarchy

- [`BaseTransaction`](index.BaseTransaction.md)

  ↳ **`EmailTransaction`**

## Table of contents

### Constructors

- [constructor](index.EmailTransaction.md#constructor)

### Properties

- [\_http](index.EmailTransaction.md#_http)
- [challenge](index.EmailTransaction.md#challenge)
- [delete](index.EmailTransaction.md#delete)
- [get](index.EmailTransaction.md#get)
- [headers](index.EmailTransaction.md#headers)
- [id](index.EmailTransaction.md#id)
- [poll](index.EmailTransaction.md#poll)
- [profile](index.EmailTransaction.md#profile)
- [roles](index.EmailTransaction.md#roles)
- [status](index.EmailTransaction.md#status)
- [verify](index.EmailTransaction.md#verify)

## Constructors

### constructor

• **new EmailTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](index.BaseTransaction.md).[constructor](index.BaseTransaction.md#constructor)

#### Defined in

[transactions/EmailTransaction.ts:19](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L19)

## Properties

### \_http

• **\_http**: `Record`<`string`, `string` \| `object`\>

#### Inherited from

[BaseTransaction](index.BaseTransaction.md).[_http](index.BaseTransaction.md#_http)

#### Defined in

[transactions/Base.ts:17](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L17)

___

### challenge

• **challenge**: () => `Promise`<[`EmailChallengeTransaction`](index.EmailChallengeTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`EmailChallengeTransaction`](index.EmailChallengeTransaction.md)\>

##### Returns

`Promise`<[`EmailChallengeTransaction`](index.EmailChallengeTransaction.md)\>

#### Defined in

[transactions/EmailTransaction.ts:15](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L15)

___

### delete

• **delete**: () => `Promise`<[`BaseTransaction`](index.BaseTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`BaseTransaction`](index.BaseTransaction.md)\>

##### Returns

`Promise`<[`BaseTransaction`](index.BaseTransaction.md)\>

#### Defined in

[transactions/EmailTransaction.ts:14](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L14)

___

### get

• **get**: () => `Promise`<[`EmailTransaction`](index.EmailTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`EmailTransaction`](index.EmailTransaction.md)\>

##### Returns

`Promise`<[`EmailTransaction`](index.EmailTransaction.md)\>

#### Defined in

[transactions/EmailTransaction.ts:13](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L13)

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

[transactions/EmailTransaction.ts:7](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L7)

___

### poll

• `Optional` **poll**: () => `Promise`<[`EmailStatusTransaction`](index.EmailStatusTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`EmailStatusTransaction`](index.EmailStatusTransaction.md)\>

##### Returns

`Promise`<[`EmailStatusTransaction`](index.EmailStatusTransaction.md)\>

#### Defined in

[transactions/EmailTransaction.ts:16](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L16)

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

[transactions/EmailTransaction.ts:17](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L17)
