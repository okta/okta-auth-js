[@okta/okta-auth-js/myaccount](../README.md) / [Exports](../modules.md) / ProfileTransaction

# Class: ProfileTransaction

## Hierarchy

- [`BaseTransaction`](BaseTransaction.md)

  ↳ **`ProfileTransaction`**

## Table of contents

### Constructors

- [constructor](ProfileTransaction.md#constructor)

### Properties

- [\_http](ProfileTransaction.md#_http)
- [createdAt](ProfileTransaction.md#createdat)
- [headers](ProfileTransaction.md#headers)
- [modifiedAt](ProfileTransaction.md#modifiedat)
- [profile](ProfileTransaction.md#profile)

## Constructors

### constructor

• **new ProfileTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](BaseTransaction.md).[constructor](BaseTransaction.md#constructor)

#### Defined in

[transactions/ProfileTransaction.ts:8](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/ProfileTransaction.ts#L8)

## Properties

### \_http

• **\_http**: `Record`<`string`, `string` \| `object`\>

#### Inherited from

[BaseTransaction](BaseTransaction.md).[_http](BaseTransaction.md#_http)

#### Defined in

[transactions/Base.ts:17](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L17)

___

### createdAt

• **createdAt**: `string`

#### Defined in

[transactions/ProfileTransaction.ts:4](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/ProfileTransaction.ts#L4)

___

### headers

• `Optional` **headers**: `Record`<`string`, `string`\>

#### Inherited from

[BaseTransaction](BaseTransaction.md).[headers](BaseTransaction.md#headers)

#### Defined in

[transactions/Base.ts:16](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L16)

___

### modifiedAt

• **modifiedAt**: `string`

#### Defined in

[transactions/ProfileTransaction.ts:5](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/ProfileTransaction.ts#L5)

___

### profile

• **profile**: `Record`<`string`, `string`\>

#### Defined in

[transactions/ProfileTransaction.ts:6](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/ProfileTransaction.ts#L6)
