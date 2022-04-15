import { RemediationFlow } from '../flow';
import { RemediateAction } from '../remediate';
import { FlowIdentifier } from './FlowIdentifier';
import {
  AuthenticatorVerificationDataValues,
  EnrollProfileValues,
  ResetAuthenticatorValues,
  SelectAuthenticatorUnlockAccountValues,
  SkipValues,
  EnrollPollValues as EnrollPollOptions,
  SelectEnrollmentChannelValues as SelectEnrollmentChannelOptions,
  IdentifyValues,
  SelectAuthenticatorAuthenticateValues,
  ChallengeAuthenticatorValues,
  ReEnrollAuthenticatorValues,
  AuthenticatorEnrollmentDataValues,
  SelectAuthenticatorEnrollValues,
  EnrollAuthenticatorValues,
} from '../remediators';

export interface IdxOptions {
  flow?: FlowIdentifier;
  exchangeCodeForTokens?: boolean;
  autoRemediate?: boolean;
  step?: string;
  withCredentials?: boolean;
}

export interface InteractOptions extends IdxOptions {
  state?: string;
  scopes?: string[];
  codeChallenge?: string;
  codeChallengeMethod?: string;
  activationToken?: string;
  recoveryToken?: string;
  clientSecret?: string;
}

export interface IntrospectOptions extends IdxOptions {
  interactionHandle?: string;
  stateHandle?: string;
  version?: string;
}

export interface RemediateOptions extends IdxOptions {
  remediators?: RemediationFlow;
  actions?: RemediateAction[];
  shouldProceedWithEmailAuthenticator?: boolean; // will be removed in next major version
}

export interface RunOptions extends RemediateOptions, InteractOptions, IntrospectOptions {}

export interface AuthenticationOptions extends
  RunOptions, 
  IdentifyValues,
  SelectAuthenticatorAuthenticateValues,
  SelectAuthenticatorEnrollValues,
  ChallengeAuthenticatorValues,
  ReEnrollAuthenticatorValues,
  AuthenticatorEnrollmentDataValues,
  EnrollAuthenticatorValues
{}

export interface RegistrationOptions extends
  RunOptions,
  IdentifyValues,
  EnrollProfileValues,
  SelectAuthenticatorEnrollValues,
  EnrollAuthenticatorValues,
  AuthenticatorEnrollmentDataValues,
  SkipValues
{}

export interface PasswordRecoveryOptions extends 
  RunOptions,
  IdentifyValues,
  SelectAuthenticatorAuthenticateValues,
  ChallengeAuthenticatorValues,
  ResetAuthenticatorValues,
  AuthenticatorVerificationDataValues,
  ReEnrollAuthenticatorValues
{}

export interface AccountUnlockOptions extends
  RunOptions,
  IdentifyValues,
  SelectAuthenticatorUnlockAccountValues,
  SelectAuthenticatorAuthenticateValues,
  ChallengeAuthenticatorValues,
  AuthenticatorVerificationDataValues
{}

export interface ProceedOptions extends
  AuthenticationOptions,
  RegistrationOptions,
  PasswordRecoveryOptions,
  AccountUnlockOptions,
  EnrollPollOptions,
  SelectEnrollmentChannelOptions
{}

export type CancelOptions = IdxOptions

export type StartOptions = RunOptions
