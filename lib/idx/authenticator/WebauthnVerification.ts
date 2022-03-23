import { Authenticator, Credentials } from './Authenticator';

export interface WebauthnVerificationValues {
  clientData?: string;
  authenticatorData?: string;
  signatureData?: string;
}

export class WebauthnVerification extends Authenticator<WebauthnVerificationValues> {
  canVerify(values: WebauthnVerificationValues) {
    const { clientData, authenticatorData, signatureData } = values;
    return !!(clientData && authenticatorData && signatureData);
  }

  mapCredentials(values: WebauthnVerificationValues): Credentials | undefined {
    const { authenticatorData, clientData, signatureData } = values;
    if (!authenticatorData && !clientData && !signatureData) {
      return;
    }
    return {
      authenticatorData,
      clientData,
      signatureData
    };
  }

  getInputs() {
    return [
      { name: 'authenticatorData', type: 'string', label: 'Authenticator Data', required: true, visible: false },
      { name: 'clientData', type: 'string', label: 'Client Data', required: true, visible: false },
      { name: 'signatureData', type: 'string', label: 'Signature Data', required: true, visible: false },
    ];
  }
}
