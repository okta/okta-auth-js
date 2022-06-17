[@okta/okta-auth-js/myaccount](../README.md) / [Exports](../modules.md) / BaseTransaction

# Class: BaseTransaction

## Hierarchy

- **`BaseTransaction`**

  ↳ [`EmailTransaction`](EmailTransaction.md)

  ↳ [`EmailStatusTransaction`](EmailStatusTransaction.md)

  ↳ [`EmailChallengeTransaction`](EmailChallengeTransaction.md)

  ↳ [`PhoneTransaction`](PhoneTransaction.md)

  ↳ [`ProfileTransaction`](ProfileTransaction.md)

  ↳ [`ProfileSchemaTransaction`](ProfileSchemaTransaction.md)

## Table of contents

### Constructors

- [constructor](BaseTransaction.md#constructor)

### Properties

- [\_http](BaseTransaction.md#_http)
- [headers](BaseTransaction.md#headers)

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
