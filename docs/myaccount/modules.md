[@okta/okta-auth-js/myaccount](README.md) / Exports

# @okta/okta-auth-js/myaccount

## Table of contents

### Enumerations

- [EmailRole](enums/EmailRole.md)
- [Status](enums/Status.md)

### Classes

- [BaseTransaction](classes/BaseTransaction.md)
- [EmailChallengeTransaction](classes/EmailChallengeTransaction.md)
- [EmailStatusTransaction](classes/EmailStatusTransaction.md)
- [EmailTransaction](classes/EmailTransaction.md)
- [PhoneTransaction](classes/PhoneTransaction.md)
- [ProfileSchemaTransaction](classes/ProfileSchemaTransaction.md)
- [ProfileTransaction](classes/ProfileTransaction.md)

### Type Aliases

- [AddEmailPayload](modules.md#addemailpayload)
- [AddPhonePayload](modules.md#addphonepayload)
- [ChallengePhonePayload](modules.md#challengephonepayload)
- [EmailProfile](modules.md#emailprofile)
- [IAPIFunction](modules.md#iapifunction)
- [MyAccountRequestOptions](modules.md#myaccountrequestoptions)
- [PhoneProfile](modules.md#phoneprofile)
- [UpdateProfilePayload](modules.md#updateprofilepayload)
- [VerificationPayload](modules.md#verificationpayload)

### Functions

- [addEmail](modules.md#addemail)
- [addPhone](modules.md#addphone)
- [deleteEmail](modules.md#deleteemail)
- [deletePhone](modules.md#deletephone)
- [getEmail](modules.md#getemail)
- [getEmailChallenge](modules.md#getemailchallenge)
- [getEmails](modules.md#getemails)
- [getPhone](modules.md#getphone)
- [getPhones](modules.md#getphones)
- [getProfile](modules.md#getprofile)
- [getProfileSchema](modules.md#getprofileschema)
- [sendEmailChallenge](modules.md#sendemailchallenge)
- [sendPhoneChallenge](modules.md#sendphonechallenge)
- [updateProfile](modules.md#updateprofile)
- [verifyEmailChallenge](modules.md#verifyemailchallenge)
- [verifyPhoneChallenge](modules.md#verifyphonechallenge)

## Type Aliases

### AddEmailPayload

Ƭ **AddEmailPayload**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `profile` | { `email`: `string`  } |
| `profile.email` | `string` |
| `role` | [`EmailRole`](enums/EmailRole.md) |
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

Ƭ **IAPIFunction**<`T`\>: (`oktaAuth`: `OktaAuthInterface`, `options?`: [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions)) => `Promise`<`T`\>

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
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

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
| `payload?` | [`AddEmailPayload`](modules.md#addemailpayload) \| [`AddPhonePayload`](modules.md#addphonepayload) \| [`ChallengePhonePayload`](modules.md#challengephonepayload) \| [`VerificationPayload`](modules.md#verificationpayload) \| [`UpdateProfilePayload`](modules.md#updateprofilepayload) |

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

## Functions

### addEmail

▸ **addEmail**(`oktaAuth`, `options?`): `Promise`<[`EmailTransaction`](classes/EmailTransaction.md)\>

**`scope:`** okta.myaccount.email.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailTransaction`](classes/EmailTransaction.md)\>

#### Defined in

[emailApi.ts:45](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L45)

___

### addPhone

▸ **addPhone**(`oktaAuth`, `options?`): `Promise`<[`PhoneTransaction`](classes/PhoneTransaction.md)\>

**`scope:`** okta.myaccount.phone.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`PhoneTransaction`](classes/PhoneTransaction.md)\>

#### Defined in

[phoneApi.ts:44](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/phoneApi.ts#L44)

___

### deleteEmail

▸ **deleteEmail**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

**`scope:`** okta.myaccount.email.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

#### Defined in

[emailApi.ts:63](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L63)

___

### deletePhone

▸ **deletePhone**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

**`scope:`** okta.myaccount.phone.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

#### Defined in

[phoneApi.ts:62](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/phoneApi.ts#L62)

___

### getEmail

▸ **getEmail**(`oktaAuth`, `options?`): `Promise`<[`EmailTransaction`](classes/EmailTransaction.md)\>

**`scope:`** okta.myaccount.email.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailTransaction`](classes/EmailTransaction.md)\>

#### Defined in

[emailApi.ts:28](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L28)

___

### getEmailChallenge

▸ **getEmailChallenge**(`oktaAuth`, `options?`): `Promise`<[`EmailChallengeTransaction`](classes/EmailChallengeTransaction.md)\>

**`scope:`** okta.myaccount.email.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailChallengeTransaction`](classes/EmailChallengeTransaction.md)\>

#### Defined in

[emailApi.ts:96](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L96)

___

### getEmails

▸ **getEmails**(`oktaAuth`, `options?`): `Promise`<[`EmailTransaction`](classes/EmailTransaction.md)[]\>

**`scope:`** okta.myaccount.email.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailTransaction`](classes/EmailTransaction.md)[]\>

#### Defined in

[emailApi.ts:12](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L12)

___

### getPhone

▸ **getPhone**(`oktaAuth`, `options?`): `Promise`<[`PhoneTransaction`](classes/PhoneTransaction.md)\>

**`scope:`** okta.myaccount.phone.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`PhoneTransaction`](classes/PhoneTransaction.md)\>

#### Defined in

[phoneApi.ts:27](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/phoneApi.ts#L27)

___

### getPhones

▸ **getPhones**(`oktaAuth`, `options?`): `Promise`<[`PhoneTransaction`](classes/PhoneTransaction.md)[]\>

**`scope:`** okta.myaccount.phone.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`PhoneTransaction`](classes/PhoneTransaction.md)[]\>

#### Defined in

[phoneApi.ts:11](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/phoneApi.ts#L11)

___

### getProfile

▸ **getProfile**(`oktaAuth`, `options?`): `Promise`<[`ProfileTransaction`](classes/ProfileTransaction.md)\>

**`scope:`** okta.myaccount.profile.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`ProfileTransaction`](classes/ProfileTransaction.md)\>

#### Defined in

[profileApi.ts:11](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/profileApi.ts#L11)

___

### getProfileSchema

▸ **getProfileSchema**(`oktaAuth`, `options?`): `Promise`<[`ProfileSchemaTransaction`](classes/ProfileSchemaTransaction.md)\>

**`scope:`** okta.myaccount.profile.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`ProfileSchemaTransaction`](classes/ProfileSchemaTransaction.md)\>

#### Defined in

[profileApi.ts:42](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/profileApi.ts#L42)

___

### sendEmailChallenge

▸ **sendEmailChallenge**(`oktaAuth`, `options?`): `Promise`<[`EmailChallengeTransaction`](classes/EmailChallengeTransaction.md)\>

**`scope:`** okta.myaccount.email.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailChallengeTransaction`](classes/EmailChallengeTransaction.md)\>

#### Defined in

[emailApi.ts:79](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L79)

___

### sendPhoneChallenge

▸ **sendPhoneChallenge**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

**`scope:`** okta.myaccount.phone.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

#### Defined in

[phoneApi.ts:78](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/phoneApi.ts#L78)

___

### updateProfile

▸ **updateProfile**(`oktaAuth`, `options?`): `Promise`<[`ProfileTransaction`](classes/ProfileTransaction.md)\>

**`scope:`** okta.myaccount.profile.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`ProfileTransaction`](classes/ProfileTransaction.md)\>

#### Defined in

[profileApi.ts:24](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/profileApi.ts#L24)

___

### verifyEmailChallenge

▸ **verifyEmailChallenge**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

**`scope:`** okta.myaccount.email.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

#### Defined in

[emailApi.ts:113](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L113)

___

### verifyPhoneChallenge

▸ **verifyPhoneChallenge**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

**`scope:`** okta.myaccount.phone.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

#### Defined in

[phoneApi.ts:95](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/phoneApi.ts#L95)
