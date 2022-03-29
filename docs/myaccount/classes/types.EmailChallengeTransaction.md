[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / [types](../modules/types.md) / EmailChallengeTransaction

# Class: EmailChallengeTransaction

[types](../modules/types.md).EmailChallengeTransaction

## Hierarchy

- [`BaseTransaction`](types.BaseTransaction.md)

  ↳ **`EmailChallengeTransaction`**

## Table of contents

### Constructors

- [constructor](types.EmailChallengeTransaction.md#constructor)

### Properties

- [\_http](types.EmailChallengeTransaction.md#_http)
- [expiresAt](types.EmailChallengeTransaction.md#expiresat)
- [headers](types.EmailChallengeTransaction.md#headers)
- [id](types.EmailChallengeTransaction.md#id)
- [poll](types.EmailChallengeTransaction.md#poll)
- [profile](types.EmailChallengeTransaction.md#profile)
- [status](types.EmailChallengeTransaction.md#status)
- [verify](types.EmailChallengeTransaction.md#verify)

## Constructors

### constructor

• **new EmailChallengeTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](types.BaseTransaction.md).[constructor](types.BaseTransaction.md#constructor)

#### Defined in

[transactions/EmailChallengeTransaction.ts:19](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L19)

## Properties

### \_http

• **\_http**: `Record`<`string`, `string` \| `object`\>

#### Inherited from

[BaseTransaction](types.BaseTransaction.md).[_http](types.BaseTransaction.md#_http)

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

[BaseTransaction](types.BaseTransaction.md).[headers](types.BaseTransaction.md#headers)

#### Defined in

[transactions/Base.ts:16](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L16)

___

### id

• **id**: `string`

#### Defined in

[transactions/EmailChallengeTransaction.ts:11](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L11)

___

### poll

• **poll**: () => `Promise`<[`EmailStatusTransaction`](types.EmailStatusTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`EmailStatusTransaction`](types.EmailStatusTransaction.md)\>

##### Returns

`Promise`<[`EmailStatusTransaction`](types.EmailStatusTransaction.md)\>

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

• **verify**: (`payload`: [`VerificationPayload`](../modules/types.md#verificationpayload)) => `Promise`<[`EmailChallengeTransaction`](types.EmailChallengeTransaction.md)\>

#### Type declaration

▸ (`payload`): `Promise`<[`EmailChallengeTransaction`](types.EmailChallengeTransaction.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`VerificationPayload`](../modules/types.md#verificationpayload) |

##### Returns

`Promise`<[`EmailChallengeTransaction`](types.EmailChallengeTransaction.md)\>

#### Defined in

[transactions/EmailChallengeTransaction.ts:17](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L17)
