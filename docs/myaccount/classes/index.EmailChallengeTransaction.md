[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / [index](../modules/index.md) / EmailChallengeTransaction

# Class: EmailChallengeTransaction

[index](../modules/index.md).EmailChallengeTransaction

## Hierarchy

- [`BaseTransaction`](index.BaseTransaction.md)

  ↳ **`EmailChallengeTransaction`**

## Table of contents

### Constructors

- [constructor](index.EmailChallengeTransaction.md#constructor)

### Properties

- [\_http](index.EmailChallengeTransaction.md#_http)
- [expiresAt](index.EmailChallengeTransaction.md#expiresat)
- [headers](index.EmailChallengeTransaction.md#headers)
- [id](index.EmailChallengeTransaction.md#id)
- [poll](index.EmailChallengeTransaction.md#poll)
- [profile](index.EmailChallengeTransaction.md#profile)
- [status](index.EmailChallengeTransaction.md#status)
- [verify](index.EmailChallengeTransaction.md#verify)

## Constructors

### constructor

• **new EmailChallengeTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](index.BaseTransaction.md).[constructor](index.BaseTransaction.md#constructor)

#### Defined in

[transactions/EmailChallengeTransaction.ts:20](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L20)

## Properties

### \_http

• **\_http**: `Record`<`string`, `string` \| `object`\>

#### Inherited from

[BaseTransaction](index.BaseTransaction.md).[_http](index.BaseTransaction.md#_http)

#### Defined in

[transactions/Base.ts:17](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L17)

___

### expiresAt

• **expiresAt**: `string`

#### Defined in

[transactions/EmailChallengeTransaction.ts:12](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L12)

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

[transactions/EmailChallengeTransaction.ts:11](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L11)

___

### poll

• **poll**: () => `Promise`<[`EmailStatusTransaction`](index.EmailStatusTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`EmailStatusTransaction`](index.EmailStatusTransaction.md)\>

##### Returns

`Promise`<[`EmailStatusTransaction`](index.EmailStatusTransaction.md)\>

#### Defined in

[transactions/EmailChallengeTransaction.ts:16](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L16)

___

### profile

• **profile**: [`EmailProfile`](../modules/types.md#emailprofile)

#### Defined in

[transactions/EmailChallengeTransaction.ts:13](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L13)

___

### status

• **status**: [`Status`](../enums/types.Status.md)

#### Defined in

[transactions/EmailChallengeTransaction.ts:14](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L14)

___

### verify

• **verify**: (`payload`: [`VerificationPayload`](../modules/types.md#verificationpayload)) => `Promise`<[`EmailChallengeTransaction`](index.EmailChallengeTransaction.md)\>

#### Type declaration

▸ (`payload`): `Promise`<[`EmailChallengeTransaction`](index.EmailChallengeTransaction.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`VerificationPayload`](../modules/types.md#verificationpayload) |

##### Returns

`Promise`<[`EmailChallengeTransaction`](index.EmailChallengeTransaction.md)\>

#### Defined in

[transactions/EmailChallengeTransaction.ts:18](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L18)
