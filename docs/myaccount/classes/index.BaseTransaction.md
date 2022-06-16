[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / [index](../modules/index.md) / BaseTransaction

# Class: BaseTransaction

[index](../modules/index.md).BaseTransaction

## Hierarchy

- **`BaseTransaction`**

  ↳ [`EmailTransaction`](index.EmailTransaction.md)

  ↳ [`EmailStatusTransaction`](index.EmailStatusTransaction.md)

  ↳ [`EmailChallengeTransaction`](index.EmailChallengeTransaction.md)

  ↳ [`PhoneTransaction`](index.PhoneTransaction.md)

  ↳ [`ProfileTransaction`](index.ProfileTransaction.md)

  ↳ [`ProfileSchemaTransaction`](index.ProfileSchemaTransaction.md)

## Table of contents

### Constructors

- [constructor](index.BaseTransaction.md#constructor)

### Properties

- [\_http](index.BaseTransaction.md#_http)
- [headers](index.BaseTransaction.md#headers)

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
