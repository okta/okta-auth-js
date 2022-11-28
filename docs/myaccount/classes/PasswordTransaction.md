[@okta/okta-auth-js/myaccount](../README.md) / [Exports](../modules.md) / PasswordTransaction

# Class: PasswordTransaction

## Hierarchy

- [`BaseTransaction`](BaseTransaction.md)

  ↳ **`PasswordTransaction`**

## Table of contents

### Constructors

- [constructor](PasswordTransaction.md#constructor)

### Properties

- [created](PasswordTransaction.md#created)
- [delete](PasswordTransaction.md#delete)
- [enroll](PasswordTransaction.md#enroll)
- [get](PasswordTransaction.md#get)
- [headers](PasswordTransaction.md#headers)
- [id](PasswordTransaction.md#id)
- [lastUpdated](PasswordTransaction.md#lastupdated)
- [status](PasswordTransaction.md#status)
- [update](PasswordTransaction.md#update)

## Constructors

### constructor

• **new PasswordTransaction**(`oktaAuth`, `options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `any` |
| `options` | `any` |

#### Overrides

[BaseTransaction](BaseTransaction.md).[constructor](BaseTransaction.md#constructor)

#### Defined in

[myaccount/transactions/PasswordTransaction.ts:16](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PasswordTransaction.ts#L16)

## Properties

### created

• **created**: `string`

#### Defined in

[myaccount/transactions/PasswordTransaction.ts:7](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PasswordTransaction.ts#L7)

___

### delete

• `Optional` **delete**: () => `Promise`<[`BaseTransaction`](BaseTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`BaseTransaction`](BaseTransaction.md)\>

##### Returns

`Promise`<[`BaseTransaction`](BaseTransaction.md)\>

#### Defined in

[myaccount/transactions/PasswordTransaction.ts:14](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PasswordTransaction.ts#L14)

___

### enroll

• `Optional` **enroll**: (`payload`: [`EnrollPasswordPayload`](../modules.md#enrollpasswordpayload)) => `Promise`<[`PasswordTransaction`](PasswordTransaction.md)\>

#### Type declaration

▸ (`payload`): `Promise`<[`PasswordTransaction`](PasswordTransaction.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`EnrollPasswordPayload`](../modules.md#enrollpasswordpayload) |

##### Returns

`Promise`<[`PasswordTransaction`](PasswordTransaction.md)\>

#### Defined in

[myaccount/transactions/PasswordTransaction.ts:12](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PasswordTransaction.ts#L12)

___

### get

• **get**: () => `Promise`<[`PasswordTransaction`](PasswordTransaction.md)\>

#### Type declaration

▸ (): `Promise`<[`PasswordTransaction`](PasswordTransaction.md)\>

##### Returns

`Promise`<[`PasswordTransaction`](PasswordTransaction.md)\>

#### Defined in

[myaccount/transactions/PasswordTransaction.ts:11](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PasswordTransaction.ts#L11)

___

### headers

• `Optional` **headers**: `Record`<`string`, `string`\>

#### Inherited from

[BaseTransaction](BaseTransaction.md).[headers](BaseTransaction.md#headers)

#### Defined in

[myaccount/transactions/Base.ts:15](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/Base.ts#L15)

___

### id

• **id**: `string`

#### Defined in

[myaccount/transactions/PasswordTransaction.ts:6](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PasswordTransaction.ts#L6)

___

### lastUpdated

• **lastUpdated**: `string`

#### Defined in

[myaccount/transactions/PasswordTransaction.ts:8](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PasswordTransaction.ts#L8)

___

### status

• **status**: [`PasswordStatus`](../enums/PasswordStatus.md)

#### Defined in

[myaccount/transactions/PasswordTransaction.ts:9](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PasswordTransaction.ts#L9)

___

### update

• `Optional` **update**: (`payload`: [`UpdatePasswordPayload`](../modules.md#updatepasswordpayload)) => `Promise`<[`PasswordTransaction`](PasswordTransaction.md)\>

#### Type declaration

▸ (`payload`): `Promise`<[`PasswordTransaction`](PasswordTransaction.md)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | [`UpdatePasswordPayload`](../modules.md#updatepasswordpayload) |

##### Returns

`Promise`<[`PasswordTransaction`](PasswordTransaction.md)\>

#### Defined in

[myaccount/transactions/PasswordTransaction.ts:13](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/transactions/PasswordTransaction.ts#L13)
