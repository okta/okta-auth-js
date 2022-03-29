[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / [types](../modules/types.md) / ProfileTransaction

# Class: ProfileTransaction

[types](../modules/types.md).ProfileTransaction

## Hierarchy

- [`BaseTransaction`](types.BaseTransaction.md)

  ↳ **`ProfileTransaction`**

## Table of contents

### Constructors

- [constructor](types.ProfileTransaction.md#constructor)

### Properties

- [\_http](types.ProfileTransaction.md#_http)
- [createdAt](types.ProfileTransaction.md#createdat)
- [headers](types.ProfileTransaction.md#headers)
- [modifiedAt](types.ProfileTransaction.md#modifiedat)
- [profile](types.ProfileTransaction.md#profile)

## Constructors

### constructor

• **new ProfileTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](types.BaseTransaction.md).[constructor](types.BaseTransaction.md#constructor)

#### Defined in

[transactions/ProfileTransaction.ts:8](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/ProfileTransaction.ts#L8)

## Properties

### \_http

• **\_http**: `Record`<`string`, `string` \| `object`\>

#### Inherited from

[BaseTransaction](types.BaseTransaction.md).[_http](types.BaseTransaction.md#_http)

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

[BaseTransaction](types.BaseTransaction.md).[headers](types.BaseTransaction.md#headers)

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
