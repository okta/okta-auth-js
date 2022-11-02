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

  ↳ [`PasswordTransaction`](PasswordTransaction.md)

## Table of contents

### Constructors

- [constructor](BaseTransaction.md#constructor)

### Properties

- [headers](BaseTransaction.md#headers)

## Constructors

### constructor

• **new BaseTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthHttpInterface`<`StorageManagerInterface`, `OktaAuthHttpOptions`\> |
| `options` | `TransactionOptions` |

#### Defined in

[myaccount/transactions/Base.ts:17](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L17)

## Properties

### headers

• `Optional` **headers**: `Record`<`string`, `string`\>

#### Defined in

[myaccount/transactions/Base.ts:15](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L15)
