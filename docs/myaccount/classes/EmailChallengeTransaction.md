[@okta/okta-auth-js/myaccount](../README.md) / [Exports](../modules.md) / EmailChallengeTransaction

# Class: EmailChallengeTransaction

## Hierarchy

- [`BaseTransaction`](BaseTransaction.md)

  ↳ **`EmailChallengeTransaction`**

## Table of contents

### Constructors

- [constructor](EmailChallengeTransaction.md#constructor)

### Properties

- [expiresAt](EmailChallengeTransaction.md#expiresat)
- [headers](EmailChallengeTransaction.md#headers)
- [id](EmailChallengeTransaction.md#id)
- [poll](EmailChallengeTransaction.md#poll)
- [profile](EmailChallengeTransaction.md#profile)
- [status](EmailChallengeTransaction.md#status)
- [verify](EmailChallengeTransaction.md#verify)

## Constructors

### constructor

• **new EmailChallengeTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](BaseTransaction.md).[constructor](BaseTransaction.md#constructor)

#### Defined in

[myaccount/transactions/EmailChallengeTransaction.ts:20](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L20)

## Properties

### expiresAt

• **expiresAt**: `string`

#### Defined in

[myaccount/transactions/EmailChallengeTransaction.ts:12](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L12)

___

### headers

• `Optional` **headers**: `Record`<`string`, `string`\>

#### Inherited from

[BaseTransaction](BaseTransaction.md).[headers](BaseTransaction.md#headers)

#### Defined in

[myaccount/transactions/Base.ts:15](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L15)

___

### id

• **id**: `string`

#### Defined in

[myaccount/transactions/EmailChallengeTransaction.ts:11](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L11)

___

### poll

• **poll**: () => `Promise`<[`EmailStatusTransaction`](EmailStatusTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`EmailStatusTransaction`](EmailStatusTransaction.md)\>

##### Returns

`Promise`<[`EmailStatusTransaction`](EmailStatusTransaction.md)\>

#### Defined in

[myaccount/transactions/EmailChallengeTransaction.ts:16](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L16)

___

### profile

• **profile**: [`EmailProfile`](../modules.md#emailprofile)

#### Defined in

[myaccount/transactions/EmailChallengeTransaction.ts:13](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L13)

___

### status

• **status**: [`Status`](../enums/Status.md)

#### Defined in

[myaccount/transactions/EmailChallengeTransaction.ts:14](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L14)

___

### verify

• **verify**: (`payload`: [`VerificationPayload`](../modules.md#verificationpayload)) => `Promise`<[`EmailChallengeTransaction`](EmailChallengeTransaction.md)\>

#### Type declaration

▸ (`payload`): `Promise`<[`EmailChallengeTransaction`](EmailChallengeTransaction.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`VerificationPayload`](../modules.md#verificationpayload) |

##### Returns

`Promise`<[`EmailChallengeTransaction`](EmailChallengeTransaction.md)\>

#### Defined in

[myaccount/transactions/EmailChallengeTransaction.ts:18](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailChallengeTransaction.ts#L18)
