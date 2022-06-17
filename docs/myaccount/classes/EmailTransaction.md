[@okta/okta-auth-js/myaccount](../README.md) / [Exports](../modules.md) / EmailTransaction

# Class: EmailTransaction

## Hierarchy

- [`BaseTransaction`](BaseTransaction.md)

  ↳ **`EmailTransaction`**

## Table of contents

### Constructors

- [constructor](EmailTransaction.md#constructor)

### Properties

- [\_http](EmailTransaction.md#_http)
- [challenge](EmailTransaction.md#challenge)
- [delete](EmailTransaction.md#delete)
- [get](EmailTransaction.md#get)
- [headers](EmailTransaction.md#headers)
- [id](EmailTransaction.md#id)
- [poll](EmailTransaction.md#poll)
- [profile](EmailTransaction.md#profile)
- [roles](EmailTransaction.md#roles)
- [status](EmailTransaction.md#status)
- [verify](EmailTransaction.md#verify)

## Constructors

### constructor

• **new EmailTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](BaseTransaction.md).[constructor](BaseTransaction.md#constructor)

#### Defined in

[transactions/EmailTransaction.ts:19](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L19)

## Properties

### \_http

• **\_http**: `Record`<`string`, `string` \| `object`\>

#### Inherited from

[BaseTransaction](BaseTransaction.md).[_http](BaseTransaction.md#_http)

#### Defined in

[transactions/Base.ts:17](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L17)

___

### challenge

• **challenge**: () => `Promise`<[`EmailChallengeTransaction`](EmailChallengeTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`EmailChallengeTransaction`](EmailChallengeTransaction.md)\>

##### Returns

`Promise`<[`EmailChallengeTransaction`](EmailChallengeTransaction.md)\>

#### Defined in

[transactions/EmailTransaction.ts:15](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L15)

___

### delete

• **delete**: () => `Promise`<[`BaseTransaction`](BaseTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`BaseTransaction`](BaseTransaction.md)\>

##### Returns

`Promise`<[`BaseTransaction`](BaseTransaction.md)\>

#### Defined in

[transactions/EmailTransaction.ts:14](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L14)

___

### get

• **get**: () => `Promise`<[`EmailTransaction`](EmailTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`EmailTransaction`](EmailTransaction.md)\>

##### Returns

`Promise`<[`EmailTransaction`](EmailTransaction.md)\>

#### Defined in

[transactions/EmailTransaction.ts:13](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L13)

___

### headers

• `Optional` **headers**: `Record`<`string`, `string`\>

#### Inherited from

[BaseTransaction](BaseTransaction.md).[headers](BaseTransaction.md#headers)

#### Defined in

[transactions/Base.ts:16](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L16)

___

### id

• **id**: `string`

#### Defined in

[transactions/EmailTransaction.ts:7](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L7)

___

### poll

• `Optional` **poll**: () => `Promise`<[`EmailStatusTransaction`](EmailStatusTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`EmailStatusTransaction`](EmailStatusTransaction.md)\>

##### Returns

`Promise`<[`EmailStatusTransaction`](EmailStatusTransaction.md)\>

#### Defined in

[transactions/EmailTransaction.ts:16](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L16)

___

### profile

• **profile**: [`EmailProfile`](../modules.md#emailprofile)

#### Defined in

[transactions/EmailTransaction.ts:8](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L8)

___

### roles

• **roles**: [`EmailRole`](../enums/EmailRole.md)[]

#### Defined in

[transactions/EmailTransaction.ts:9](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L9)

___

### status

• **status**: [`Status`](../enums/Status.md)

#### Defined in

[transactions/EmailTransaction.ts:10](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L10)

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

[transactions/EmailTransaction.ts:17](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailTransaction.ts#L17)
