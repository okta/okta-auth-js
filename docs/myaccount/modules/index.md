[@okta/okta-auth-js/myaccount](../README.md) / [Modules](../modules.md) / index

# Module: index

## Table of contents

### Functions

- [addEmail](index.md#addemail)
- [addPhone](index.md#addphone)
- [deleteEmail](index.md#deleteemail)
- [deletePhone](index.md#deletephone)
- [getEmail](index.md#getemail)
- [getEmailChallenge](index.md#getemailchallenge)
- [getEmails](index.md#getemails)
- [getPhone](index.md#getphone)
- [getPhones](index.md#getphones)
- [getProfile](index.md#getprofile)
- [getProfileSchema](index.md#getprofileschema)
- [sendEmailChallenge](index.md#sendemailchallenge)
- [sendPhoneChallenge](index.md#sendphonechallenge)
- [updateProfile](index.md#updateprofile)
- [verifyEmailChallenge](index.md#verifyemailchallenge)
- [verifyPhoneChallenge](index.md#verifyphonechallenge)

## Functions

### addEmail

▸ **addEmail**(`oktaAuth`, `options?`): `Promise`<[`EmailTransaction`](../classes/types.EmailTransaction.md)\>

**`scope:`** okta.myaccount.email.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailTransaction`](../classes/types.EmailTransaction.md)\>

#### Defined in

[emailApi.ts:45](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L45)

___

### addPhone

▸ **addPhone**(`oktaAuth`, `options?`): `Promise`<[`PhoneTransaction`](../classes/types.PhoneTransaction.md)\>

**`scope:`** okta.myaccount.phone.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`PhoneTransaction`](../classes/types.PhoneTransaction.md)\>

#### Defined in

[phoneApi.ts:44](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/phoneApi.ts#L44)

___

### deleteEmail

▸ **deleteEmail**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](../classes/types.BaseTransaction.md)\>

**`scope:`** okta.myaccount.email.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](../classes/types.BaseTransaction.md)\>

#### Defined in

[emailApi.ts:63](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L63)

___

### deletePhone

▸ **deletePhone**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](../classes/types.BaseTransaction.md)\>

**`scope:`** okta.myaccount.phone.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](../classes/types.BaseTransaction.md)\>

#### Defined in

[phoneApi.ts:62](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/phoneApi.ts#L62)

___

### getEmail

▸ **getEmail**(`oktaAuth`, `options?`): `Promise`<[`EmailTransaction`](../classes/types.EmailTransaction.md)\>

**`scope:`** okta.myaccount.email.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailTransaction`](../classes/types.EmailTransaction.md)\>

#### Defined in

[emailApi.ts:28](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L28)

___

### getEmailChallenge

▸ **getEmailChallenge**(`oktaAuth`, `options?`): `Promise`<[`EmailChallengeTransaction`](../classes/types.EmailChallengeTransaction.md)\>

**`scope:`** okta.myaccount.email.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailChallengeTransaction`](../classes/types.EmailChallengeTransaction.md)\>

#### Defined in

[emailApi.ts:96](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L96)

___

### getEmails

▸ **getEmails**(`oktaAuth`, `options?`): `Promise`<[`EmailTransaction`](../classes/types.EmailTransaction.md)[]\>

**`scope:`** okta.myaccount.email.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailTransaction`](../classes/types.EmailTransaction.md)[]\>

#### Defined in

[emailApi.ts:12](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L12)

___

### getPhone

▸ **getPhone**(`oktaAuth`, `options?`): `Promise`<[`PhoneTransaction`](../classes/types.PhoneTransaction.md)\>

**`scope:`** okta.myaccount.phone.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`PhoneTransaction`](../classes/types.PhoneTransaction.md)\>

#### Defined in

[phoneApi.ts:27](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/phoneApi.ts#L27)

___

### getPhones

▸ **getPhones**(`oktaAuth`, `options?`): `Promise`<[`PhoneTransaction`](../classes/types.PhoneTransaction.md)[]\>

**`scope:`** okta.myaccount.phone.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`PhoneTransaction`](../classes/types.PhoneTransaction.md)[]\>

#### Defined in

[phoneApi.ts:11](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/phoneApi.ts#L11)

___

### getProfile

▸ **getProfile**(`oktaAuth`, `options?`): `Promise`<[`ProfileTransaction`](../classes/types.ProfileTransaction.md)\>

**`scope:`** okta.myaccount.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`ProfileTransaction`](../classes/types.ProfileTransaction.md)\>

#### Defined in

[profileApi.ts:11](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/profileApi.ts#L11)

___

### getProfileSchema

▸ **getProfileSchema**(`oktaAuth`, `options?`): `Promise`<[`ProfileSchemaTransaction`](../classes/types.ProfileSchemaTransaction.md)\>

**`scope:`** okta.myaccount.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`ProfileSchemaTransaction`](../classes/types.ProfileSchemaTransaction.md)\>

#### Defined in

[profileApi.ts:42](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/profileApi.ts#L42)

___

### sendEmailChallenge

▸ **sendEmailChallenge**(`oktaAuth`, `options?`): `Promise`<[`EmailChallengeTransaction`](../classes/types.EmailChallengeTransaction.md)\>

**`scope:`** okta.myaccount.email.read

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`EmailChallengeTransaction`](../classes/types.EmailChallengeTransaction.md)\>

#### Defined in

[emailApi.ts:79](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L79)

___

### sendPhoneChallenge

▸ **sendPhoneChallenge**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](../classes/types.BaseTransaction.md)\>

**`scope:`** okta.myaccount.phone.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](../classes/types.BaseTransaction.md)\>

#### Defined in

[phoneApi.ts:78](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/phoneApi.ts#L78)

___

### updateProfile

▸ **updateProfile**(`oktaAuth`, `options?`): `Promise`<[`ProfileTransaction`](../classes/types.ProfileTransaction.md)\>

**`scope:`** okta.myaccount.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`ProfileTransaction`](../classes/types.ProfileTransaction.md)\>

#### Defined in

[profileApi.ts:24](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/profileApi.ts#L24)

___

### verifyEmailChallenge

▸ **verifyEmailChallenge**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](../classes/types.BaseTransaction.md)\>

**`scope:`** okta.myaccount.email.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](../classes/types.BaseTransaction.md)\>

#### Defined in

[emailApi.ts:113](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/emailApi.ts#L113)

___

### verifyPhoneChallenge

▸ **verifyPhoneChallenge**(`oktaAuth`, `options?`): `Promise`<[`BaseTransaction`](../classes/types.BaseTransaction.md)\>

**`scope:`** okta.myaccount.phone.manage

#### Parameters

| Name | Type |
| :------ | :------ |
| `oktaAuth` | `OktaAuthInterface` |
| `options?` | [`MyAccountRequestOptions`](types.md#myaccountrequestoptions) |

#### Returns

`Promise`<[`BaseTransaction`](../classes/types.BaseTransaction.md)\>

#### Defined in

[phoneApi.ts:95](https://github.com/okta/okta-auth-js/blob/master/lib/myaccount/phoneApi.ts#L95)
