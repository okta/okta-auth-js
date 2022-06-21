[@okta/okta-auth-js/myaccount](../README.md) / [Exports](../modules.md) / EmailStatusTransaction

# Class: EmailStatusTransaction

## Hierarchy

- [`BaseTransaction`](BaseTransaction.md)

  ↳ **`EmailStatusTransaction`**

## Table of contents

### Constructors

- [constructor](EmailStatusTransaction.md#constructor)

### Properties

- [expiresAt](EmailStatusTransaction.md#expiresat)
- [headers](EmailStatusTransaction.md#headers)
- [id](EmailStatusTransaction.md#id)
- [profile](EmailStatusTransaction.md#profile)
- [status](EmailStatusTransaction.md#status)

## Constructors

### constructor

• **new EmailStatusTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](BaseTransaction.md).[constructor](BaseTransaction.md#constructor)

#### Defined in

[transactions/EmailStatusTransaction.ts:10](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailStatusTransaction.ts#L10)

## Properties

### expiresAt

• **expiresAt**: `string`

#### Defined in

[transactions/EmailStatusTransaction.ts:6](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailStatusTransaction.ts#L6)

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

[transactions/EmailStatusTransaction.ts:5](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailStatusTransaction.ts#L5)

___

### profile

• **profile**: [`EmailProfile`](../modules.md#emailprofile)

#### Defined in

[transactions/EmailStatusTransaction.ts:7](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailStatusTransaction.ts#L7)

___

### status

• **status**: [`Status`](../enums/Status.md)

#### Defined in

[transactions/EmailStatusTransaction.ts:8](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/EmailStatusTransaction.ts#L8)
