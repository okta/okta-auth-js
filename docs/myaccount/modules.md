[@okta/okta-auth-js/myaccount](README.md) / Exports

# @okta/okta-auth-js/myaccount

## Table of contents

### Enumerations

- [EmailRole](enums/EmailRole.md)
- [PasswordStatus](enums/PasswordStatus.md)
- [Status](enums/Status.md)

### Classes

- [BaseTransaction](classes/BaseTransaction.md)
- [EmailChallengeTransaction](classes/EmailChallengeTransaction.md)
- [EmailStatusTransaction](classes/EmailStatusTransaction.md)
- [EmailTransaction](classes/EmailTransaction.md)
- [PasswordTransaction](classes/PasswordTransaction.md)
- [PhoneTransaction](classes/PhoneTransaction.md)
- [ProfileSchemaTransaction](classes/ProfileSchemaTransaction.md)
- [ProfileTransaction](classes/ProfileTransaction.md)

### Interfaces

- [OktaAuthMyAccountInterface](interfaces/OktaAuthMyAccountInterface.md)

### Type Aliases

- [AddEmailPayload](modules.md#addemailpayload)
- [AddPhonePayload](modules.md#addphonepayload)
- [ChallengePhonePayload](modules.md#challengephonepayload)
- [EmailProfile](modules.md#emailprofile)
- [EnrollPasswordPayload](modules.md#enrollpasswordpayload)
- [IAPIFunction](modules.md#iapifunction)
- [MyAccountRequestOptions](modules.md#myaccountrequestoptions)
- [PhoneProfile](modules.md#phoneprofile)
- [UpdatePasswordPayload](modules.md#updatepasswordpayload)
- [UpdateProfilePayload](modules.md#updateprofilepayload)
- [VerificationPayload](modules.md#verificationpayload)

### Functions

- [addEmail](modules.md#addemail)
- [addPhone](modules.md#addphone)
- [createOktaAuthMyAccount](modules.md#createoktaauthmyaccount)
- [deleteEmail](modules.md#deleteemail)
- [deletePassword](modules.md#deletepassword)
- [deletePhone](modules.md#deletephone)
- [enrollPassword](modules.md#enrollpassword)
- [getEmail](modules.md#getemail)
- [getEmailChallenge](modules.md#getemailchallenge)
- [getEmails](modules.md#getemails)
- [getPassword](modules.md#getpassword)
- [getPhone](modules.md#getphone)
- [getPhones](modules.md#getphones)
- [getProfile](modules.md#getprofile)
- [getProfileSchema](modules.md#getprofileschema)
- [mixinMyAccount](modules.md#mixinmyaccount)
- [sendEmailChallenge](modules.md#sendemailchallenge)
- [sendPhoneChallenge](modules.md#sendphonechallenge)
- [updatePassword](modules.md#updatepassword)
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

[myaccount/types.ts:39](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L39)

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

[myaccount/types.ts:53](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L53)

___

### ChallengePhonePayload

Ƭ **ChallengePhonePayload**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `method` | `string` |

#### Defined in

[myaccount/types.ts:61](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L61)

___

### EmailProfile

Ƭ **EmailProfile**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `email` | `string` |

#### Defined in

[myaccount/types.ts:35](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L35)

___

### EnrollPasswordPayload

Ƭ **EnrollPasswordPayload**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `profile` | { `password`: `string`  } |
| `profile.password` | `string` |

#### Defined in

[myaccount/types.ts:69](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L69)

___

### IAPIFunction

Ƭ **IAPIFunction**<`T`\>: (`oktaAuth`: `OktaAuthOAuthInterface`, `options?`: [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions)) => `Promise`<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`oktaAuth`, `options?`): `Promise`<`T`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

##### Returns

`Promise`<`T`\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

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

[myaccount/types.ts:92](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L92)

___

### PhoneProfile

Ƭ **PhoneProfile**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `profile` | { `phoneNumber`: `string`  } |
| `profile.phoneNumber` | `string` |

#### Defined in

[myaccount/types.ts:47](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L47)

___

### UpdatePasswordPayload

Ƭ **UpdatePasswordPayload**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `profile` | { `currentPassword?`: `string` ; `password`: `string`  } |
| `profile.currentPassword?` | `string` |
| `profile.password` | `string` |

#### Defined in

[myaccount/types.ts:75](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L75)

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

[myaccount/types.ts:82](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L82)

___

### VerificationPayload

Ƭ **VerificationPayload**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `verificationCode` | `string` |

#### Defined in

[myaccount/types.ts:65](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L65)

## Functions

### addEmail

▸ **addEmail**(`oktaAuth`, `options?`): `Promise`<[`EmailTransaction`](classes/EmailTransaction.md)\>

@scope: okta.myAccount.email.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailTransaction`](classes/EmailTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### addPhone

▸ **addPhone**(`oktaAuth`, `options?`): `Promise`<[`PhoneTransaction`](classes/PhoneTransaction.md)\>

@scope: okta.myAccount.phone.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`PhoneTransaction`](classes/PhoneTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### createOktaAuthMyAccount

▸ **createOktaAuthMyAccount**<`M`, `S`, `O`, `TM`\>(`StorageManagerConstructor`, `OptionsConstructor`, `TransactionManager`): `OktaAuthConstructor`<[`OktaAuthMyAccountInterface`](interfaces/OktaAuthMyAccountInterface.md)<`M`, `S`, `O`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `PKCETransactionMeta`<`M`\> = `PKCETransactionMeta` |
| `S` | extends `OAuthStorageManagerInterface`<`M`, `S`\> = `OAuthStorageManagerInterface`<`M`\> |
| `O` | extends `OktaAuthCoreOptions`<`O`\> = `OktaAuthCoreOptions` |
| `TM` | extends `TransactionManagerInterface` = `TransactionManagerInterface` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `StorageManagerConstructor` | `StorageManagerConstructor`<`S`\> |
| `OptionsConstructor` | `OktaAuthOptionsConstructor`<`O`\> |
| `TransactionManager` | `TransactionManagerConstructor`<`TM`\> |

#### Returns

`OktaAuthConstructor`<[`OktaAuthMyAccountInterface`](interfaces/OktaAuthMyAccountInterface.md)<`M`, `S`, `O`\>\>

#### Defined in

[myaccount/factory.ts:14](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/factory.ts#L14)

___

### deleteEmail

▸ **deleteEmail**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

@scope: okta.myAccount.email.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### deletePassword

▸ **deletePassword**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

@scope: okta.myAccount.password.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### deletePhone

▸ **deletePhone**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

@scope: okta.myAccount.phone.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### enrollPassword

▸ **enrollPassword**(`oktaAuth`, `options?`): `Promise`<[`PasswordTransaction`](classes/PasswordTransaction.md)\>

@scope: okta.myAccount.password.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`PasswordTransaction`](classes/PasswordTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### getEmail

▸ **getEmail**(`oktaAuth`, `options?`): `Promise`<[`EmailTransaction`](classes/EmailTransaction.md)\>

@scope: okta.myAccount.email.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailTransaction`](classes/EmailTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### getEmailChallenge

▸ **getEmailChallenge**(`oktaAuth`, `options?`): `Promise`<[`EmailChallengeTransaction`](classes/EmailChallengeTransaction.md)\>

@scope: okta.myAccount.email.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailChallengeTransaction`](classes/EmailChallengeTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### getEmails

▸ **getEmails**(`oktaAuth`, `options?`): `Promise`<[`EmailTransaction`](classes/EmailTransaction.md)[]\>

@scope: okta.myAccount.email.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailTransaction`](classes/EmailTransaction.md)[]\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### getPassword

▸ **getPassword**(`oktaAuth`, `options?`): `Promise`<[`PasswordTransaction`](classes/PasswordTransaction.md)\>

@scope: okta.myAccount.password.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`PasswordTransaction`](classes/PasswordTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### getPhone

▸ **getPhone**(`oktaAuth`, `options?`): `Promise`<[`PhoneTransaction`](classes/PhoneTransaction.md)\>

@scope: okta.myAccount.phone.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`PhoneTransaction`](classes/PhoneTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### getPhones

▸ **getPhones**(`oktaAuth`, `options?`): `Promise`<[`PhoneTransaction`](classes/PhoneTransaction.md)[]\>

@scope: okta.myAccount.phone.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`PhoneTransaction`](classes/PhoneTransaction.md)[]\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### getProfile

▸ **getProfile**(`oktaAuth`, `options?`): `Promise`<[`ProfileTransaction`](classes/ProfileTransaction.md)\>

@scope: okta.myAccount.profile.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`ProfileTransaction`](classes/ProfileTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### getProfileSchema

▸ **getProfileSchema**(`oktaAuth`, `options?`): `Promise`<[`ProfileSchemaTransaction`](classes/ProfileSchemaTransaction.md)\>

@scope: okta.myAccount.profile.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`ProfileSchemaTransaction`](classes/ProfileSchemaTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### mixinMyAccount

▸ **mixinMyAccount**<`M`, `S`, `O`, `TBase`\>(`Base`): `TBase` & `OktaAuthConstructor`<[`OktaAuthMyAccountInterface`](interfaces/OktaAuthMyAccountInterface.md)<`M`, `S`, `O`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `OAuthTransactionMeta`<`M`\> = `PKCETransactionMeta` |
| `S` | extends `OAuthStorageManagerInterface`<`M`, `S`\> = `OAuthStorageManagerInterface`<`M`\> |
| `O` | extends `OktaAuthOAuthOptions`<`O`\> = `OktaAuthOAuthOptions` |
| `TBase` | extends `OktaAuthConstructor`<`OktaAuthOAuthInterface`<`M`, `S`, `O`, `TransactionManagerInterface`\>, `TBase`\> = `OktaAuthConstructor`<`OktaAuthOAuthInterface`<`M`, `S`, `O`, `TransactionManagerInterface`\>\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `Base` | `TBase` |

#### Returns

`TBase` & `OktaAuthConstructor`<[`OktaAuthMyAccountInterface`](interfaces/OktaAuthMyAccountInterface.md)<`M`, `S`, `O`\>\>

#### Defined in

[myaccount/mixin.ts:13](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/mixin.ts#L13)

___

### sendEmailChallenge

▸ **sendEmailChallenge**(`oktaAuth`, `options?`): `Promise`<[`EmailChallengeTransaction`](classes/EmailChallengeTransaction.md)\>

@scope: okta.myAccount.email.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailChallengeTransaction`](classes/EmailChallengeTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### sendPhoneChallenge

▸ **sendPhoneChallenge**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

@scope: okta.myAccount.phone.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### updatePassword

▸ **updatePassword**(`oktaAuth`, `options?`): `Promise`<[`PasswordTransaction`](classes/PasswordTransaction.md)\>

@scope: okta.myAccount.password.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`PasswordTransaction`](classes/PasswordTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### updateProfile

▸ **updateProfile**(`oktaAuth`, `options?`): `Promise`<[`ProfileTransaction`](classes/ProfileTransaction.md)\>

@scope: okta.myAccount.profile.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`ProfileTransaction`](classes/ProfileTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### verifyEmailChallenge

▸ **verifyEmailChallenge**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

@scope: okta.myAccount.email.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)

___

### verifyPhoneChallenge

▸ **verifyPhoneChallenge**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

@scope: okta.myAccount.phone.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthOAuthInterface`<`PKCETransactionMeta`, `OAuthStorageManagerInterface`<`PKCETransactionMeta`\>, `OktaAuthOAuthOptions`, `TransactionManagerInterface`\> |
| `options?` | [`MyAccountRequestOptions`](modules.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](classes/BaseTransaction.md)\>

#### Defined in

[myaccount/types.ts:104](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/types.ts#L104)
