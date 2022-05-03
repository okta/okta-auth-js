import { Authenticator, Credentials } from './Authenticator';

export interface WebauthnVerificationValues {
  clientData?: string;
  authenticatorData?: string;
  signatureData?: string;
  credentials?: Credentials;
}

export class WebauthnVerification extends Authenticator<WebauthnVerificationValues> {
  canVerify(values: WebauthnVerificationValues) {
    const { credentials } = values;
    const obj = credentials || values;
    const { clientData, authenticatorData, signatureData } = obj;
    return !!(clientData && authenticatorData && signatureData);
  }

  mapCredentials(values: WebauthnVerificationValues): Credentials | undefined {
    const { credentials, authenticatorData, clientData, signatureData } = values;
    if (!credentials && !authenticatorData && !clientData && !signatureData) {
      return;
    }
    return credentials || ({
      authenticatorData,
      clientData,
      signatureData
    });
  }

  getInputs() {
    return [
      { name: 'authenticatorData', type: 'string', label: 'Authenticator Data', required: true, visible: false },
      { name: 'clientData', type: 'string', label: 'Client Data', required: true, visible: false },
      { name: 'signatureData', type: 'string', label: 'Signature Data', required: true, visible: false },
    ];
  }
}
