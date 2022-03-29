[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / [types](../modules/types.md) / BaseTransaction

# Class: BaseTransaction

[types](../modules/types.md).BaseTransaction

## Hierarchy

- **`BaseTransaction`**

  ↳ [`EmailTransaction`](types.EmailTransaction.md)

  ↳ [`EmailStatusTransaction`](types.EmailStatusTransaction.md)

  ↳ [`EmailChallengeTransaction`](types.EmailChallengeTransaction.md)

  ↳ [`PhoneTransaction`](types.PhoneTransaction.md)

  ↳ [`ProfileTransaction`](types.ProfileTransaction.md)

  ↳ [`ProfileSchemaTransaction`](types.ProfileSchemaTransaction.md)

## Table of contents

### Constructors

- [constructor](types.BaseTransaction.md#constructor)

### Properties

- [\_http](types.BaseTransaction.md#_http)
- [headers](types.BaseTransaction.md#headers)

## Constructors

### constructor

• **new BaseTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options` | `TransactionOptions` |

#### Defined in

[transactions/Base.ts:19](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L19)

## Properties

### \_http

• **\_http**: `Record`<`string`, `string` \| `object`\>

#### Defined in

[transactions/Base.ts:17](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L17)

___

### headers

• `Optional` **headers**: `Record`<`string`, `string`\>

#### Defined in

[transactions/Base.ts:16](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L16)
