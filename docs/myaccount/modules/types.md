[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / types

# Module: types

## Table of contents

### References

- [BaseTransaction](types.md#basetransaction)
- [EmailChallengeTransaction](types.md#emailchallengetransaction)
- [EmailStatusTransaction](types.md#emailstatustransaction)
- [EmailTransaction](types.md#emailtransaction)
- [PhoneTransaction](types.md#phonetransaction)
- [ProfileSchemaTransaction](types.md#profileschematransaction)
- [ProfileTransaction](types.md#profiletransaction)

### Enumerations

- [EmailRole](../enums/types.EmailRole.md)
- [Status](../enums/types.Status.md)

### Type Aliases

- [AddEmailPayload](types.md#addemailpayload)
- [AddPhonePayload](types.md#addphonepayload)
- [ChallengePhonePayload](types.md#challengephonepayload)
- [EmailProfile](types.md#emailprofile)
- [IAPIFunction](types.md#iapifunction)
- [MyAccountRequestOptions](types.md#myaccountrequestoptions)
- [PhoneProfile](types.md#phoneprofile)
- [UpdateProfilePayload](types.md#updateprofilepayload)
- [VerificationPayload](types.md#verificationpayload)

## References

### BaseTransaction

Re-exports [BaseTransaction](../classes/index.BaseTransaction.md)

___

### EmailChallengeTransaction

Re-exports [EmailChallengeTransaction](../classes/index.EmailChallengeTransaction.md)

___

### EmailStatusTransaction

Re-exports [EmailStatusTransaction](../classes/index.EmailStatusTransaction.md)

___

### EmailTransaction

Re-exports [EmailTransaction](../classes/index.EmailTransaction.md)

___

### PhoneTransaction

Re-exports [PhoneTransaction](../classes/index.PhoneTransaction.md)

___

### ProfileSchemaTransaction

Re-exports [ProfileSchemaTransaction](../classes/index.ProfileSchemaTransaction.md)

___

### ProfileTransaction

Re-exports [ProfileTransaction](../classes/index.ProfileTransaction.md)

## Type Aliases

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

[types.ts:27](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L27)

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

[types.ts:41](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L41)

___

### ChallengePhonePayload

Ƭ **ChallengePhonePayload**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `method` | `string` |

#### Defined in

[types.ts:49](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L49)

___

### EmailProfile

Ƭ **EmailProfile**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `email` | `string` |

#### Defined in

[types.ts:23](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L23)

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

[types.ts:79](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L79)

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

[types.ts:67](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L67)

___

### PhoneProfile

Ƭ **PhoneProfile**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `profile` | { `phoneNumber`: `string`  } |
| `profile.phoneNumber` | `string` |

#### Defined in

[types.ts:35](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L35)

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

[types.ts:57](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L57)

___

### VerificationPayload

Ƭ **VerificationPayload**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `verificationCode` | `string` |

#### Defined in

[types.ts:53](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L53)
