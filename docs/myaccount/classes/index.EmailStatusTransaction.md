[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / [index](../modules/index.md) / EmailStatusTransaction

# Class: EmailStatusTransaction

[index](../modules/index.md).EmailStatusTransaction

## Hierarchy

- [`BaseTransaction`](index.BaseTransaction.md)

  ↳ **`EmailStatusTransaction`**

## Table of contents

### Constructors

- [constructor](index.EmailStatusTransaction.md#constructor)

### Properties

- [\_http](index.EmailStatusTransaction.md#_http)
- [expiresAt](index.EmailStatusTransaction.md#expiresat)
- [headers](index.EmailStatusTransaction.md#headers)
- [id](index.EmailStatusTransaction.md#id)
- [profile](index.EmailStatusTransaction.md#profile)
- [status](index.EmailStatusTransaction.md#status)

## Constructors

### constructor

• **new EmailStatusTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](index.BaseTransaction.md).[constructor](index.BaseTransaction.md#constructor)

#### Defined in

[transactions/EmailStatusTransaction.ts:10](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailStatusTransaction.ts#L10)

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

[transactions/EmailStatusTransaction.ts:6](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailStatusTransaction.ts#L6)

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
