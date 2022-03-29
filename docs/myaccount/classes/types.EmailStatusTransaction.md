[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / [types](../modules/types.md) / EmailStatusTransaction

# Class: EmailStatusTransaction

[types](../modules/types.md).EmailStatusTransaction

## Hierarchy

- [`BaseTransaction`](types.BaseTransaction.md)

  ↳ **`EmailStatusTransaction`**

## Table of contents

### Constructors

- [constructor](types.EmailStatusTransaction.md#constructor)

### Properties

- [\_http](types.EmailStatusTransaction.md#_http)
- [expiresAt](types.EmailStatusTransaction.md#expiresat)
- [headers](types.EmailStatusTransaction.md#headers)
- [id](types.EmailStatusTransaction.md#id)
- [profile](types.EmailStatusTransaction.md#profile)
- [status](types.EmailStatusTransaction.md#status)

## Constructors

### constructor

• **new EmailStatusTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](types.BaseTransaction.md).[constructor](types.BaseTransaction.md#constructor)

#### Defined in

[transactions/EmailStatusTransaction.ts:10](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailStatusTransaction.ts#L10)

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

[transactions/EmailStatusTransaction.ts:6](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailStatusTransaction.ts#L6)

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

[transactions/EmailStatusTransaction.ts:5](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailStatusTransaction.ts#L5)

___

### profile

• **profile**: [`EmailProfile`](../modules/types.md#emailprofile)

#### Defined in

[transactions/EmailStatusTransaction.ts:7](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailStatusTransaction.ts#L7)

___

### status

• **status**: [`Status`](../enums/types.Status.md)

#### Defined in

[transactions/EmailStatusTransaction.ts:8](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailStatusTransaction.ts#L8)
