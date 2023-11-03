import {
  OAuthStorageManagerInterface,
  OAuthTransactionMeta,
  OktaAuthOAuthInterface,
  OktaAuthOAuthOptions,
  PKCETransactionMeta
} from '../oidc/types';

export type { 
  EmailTransaction, 
  EmailStatusTransaction,
  EmailChallengeTransaction,
  PhoneTransaction,
  ProfileTransaction,
  ProfileSchemaTransaction,
  PasswordTransaction,
  BaseTransaction
} from './transactions';

export enum EmailRole {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY'
}

export enum Status {
  VERIFIED = 'VERIFIED',
  UNVERIFIED = 'UNVERIFIED'
}

export enum PasswordStatus {
  NOT_ENROLLED = 'NOT_ENROLLED',
  ACTIVE = 'ACTIVE'
}

export type EmailProfile = {
  email: string;
}

export type AddEmailPayload = {
  profile: {
    email: string;
  };
  sendEmail: boolean;
  role: EmailRole;
}

export type PhoneProfile = {
  profile: {
    phoneNumber: string;
  };
}

export type AddPhonePayload = {
  profile: {
    phoneNumber: string;
  };
  sendCode: boolean;
  method: string;
};

export type ChallengePhonePayload = {
  method: string;
}

export type VerificationPayload = {
  verificationCode: string;
};

export type EnrollPasswordPayload = {
  profile: {
    password: string;
  }
}

export type UpdatePasswordPayload = {
  profile: {
    password: string;
    currentPassword?: string;
  }
}

export type UpdateProfilePayload = {
  profile: {
    firstName?: string;
    lastName?: string;
    email?: string;
    login?: string;
    [property: string]: any;
  };
};

export type MyAccountRequestOptions = {
  id?: string;
  emailId?: string;
  challengeId?: string;
  payload?: AddEmailPayload 
    | AddPhonePayload 
    | ChallengePhonePayload
    | VerificationPayload 
    | UpdateProfilePayload
    | EnrollPasswordPayload
    | UpdatePasswordPayload;
  accessToken?: string;
}

export type IAPIFunction<T> = (
  oktaAuth: OktaAuthOAuthInterface, 
  options?: MyAccountRequestOptions
) => Promise<T>;

export interface OktaAuthMyAccountInterface
<
  M extends OAuthTransactionMeta = PKCETransactionMeta,
  S extends OAuthStorageManagerInterface<M> = OAuthStorageManagerInterface<M>,
  O extends OktaAuthOAuthOptions = OktaAuthOAuthOptions
> 
  extends OktaAuthOAuthInterface<M, S, O>
{
  myaccount;
}
