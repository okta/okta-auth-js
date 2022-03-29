[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / types

# Module: types

## Table of contents

### Enumerations

- [EmailRole](../enums/types.EmailRole.md)
- [Status](../enums/types.Status.md)

### Classes

- [BaseTransaction](../classes/types.BaseTransaction.md)
- [EmailChallengeTransaction](../classes/types.EmailChallengeTransaction.md)
- [EmailStatusTransaction](../classes/types.EmailStatusTransaction.md)
- [EmailTransaction](../classes/types.EmailTransaction.md)
- [PhoneTransaction](../classes/types.PhoneTransaction.md)
- [ProfileSchemaTransaction](../classes/types.ProfileSchemaTransaction.md)
- [ProfileTransaction](../classes/types.ProfileTransaction.md)

### Type aliases

- [AddEmailPayload](types.md#addemailpayload)
- [AddPhonePayload](types.md#addphonepayload)
- [ChallengePhonePayload](types.md#challengephonepayload)
- [EmailProfile](types.md#emailprofile)
- [IAPIFunction](types.md#iapifunction)
- [MyAccountRequestOptions](types.md#myaccountrequestoptions)
- [PhoneProfile](types.md#phoneprofile)
- [UpdateProfilePayload](types.md#updateprofilepayload)
- [VerificationPayload](types.md#verificationpayload)

## Type aliases

### AddEmailPayload

Ƭ **AddEmailPayload**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `profile` | { `email`: `string`  } |
| `profile.email` | `string` |
| `role` | [`EmailRole`](../enums/types.EmailRole.md) |
| `sendEmail` | `boolean` |

#### Defined in

[types.ts:32](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L32)

___

### AddPhonePayload

Ƭ **AddPhonePayload**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `method` | `string` |
| `profile` | { `phoneNumber`: `string`  } |
| `profile.phoneNumber` | `string` |
| `sendCode` | `boolean` |

#### Defined in

[types.ts:46](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L46)

___

### ChallengePhonePayload

Ƭ **ChallengePhonePayload**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `method` | `string` |

#### Defined in

[types.ts:54](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L54)

___

### EmailProfile

Ƭ **EmailProfile**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `email` | `string` |

#### Defined in

[types.ts:28](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L28)

___

### IAPIFunction

Ƭ **IAPIFunction**<`T`\>: (`oktaAuth`: `OktaAuthInterface`, `options?`: [`MyAccountRequestOptions`](types.md#myaccountrequestoptions)) => `Promise`<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`oktaAuth`, `options?`): `Promise`<`T`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

##### Returns

`Promise`<`T`\>

#### Defined in

[types.ts:13](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L13)

___

### MyAccountRequestOptions

Ƭ **MyAccountRequestOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accessToken?` | `string` |
| `challengeId?` | `string` |
| `emailId?` | `string` |
| `id?` | `string` |
| `payload?` | [`AddEmailPayload`](types.md#addemailpayload) \| [`AddPhonePayload`](types.md#addphonepayload) \| [`ChallengePhonePayload`](types.md#challengephonepayload) \| [`VerificationPayload`](types.md#verificationpayload) \| [`UpdateProfilePayload`](types.md#updateprofilepayload) |

#### Defined in

[types.ts:72](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L72)

___

### PhoneProfile

Ƭ **PhoneProfile**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `profile` | { `phoneNumber`: `string`  } |
| `profile.phoneNumber` | `string` |

#### Defined in

[types.ts:40](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L40)

___

### UpdateProfilePayload

Ƭ **UpdateProfilePayload**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `profile` | { `[property: string]`: `any`; `email?`: `string` ; `firstName?`: `string` ; `lastName?`: `string` ; `login?`: `string`  } |
| `profile.email?` | `string` |
| `profile.firstName?` | `string` |
| `profile.lastName?` | `string` |
| `profile.login?` | `string` |

#### Defined in

[types.ts:62](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L62)

___

### VerificationPayload

Ƭ **VerificationPayload**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `verificationCode` | `string` |

#### Defined in

[types.ts:58](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L58)
