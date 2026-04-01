import { Authenticator, Credentials } from './Authenticator';

export interface WebauthnEnrollValues {
  id?: string;
  clientData?: string;
  attestation?: string;
  credentials?: Credentials;
  transports?: string;
}

export class WebauthnEnrollment extends Authenticator<WebauthnEnrollValues> {
  canVerify(values: WebauthnEnrollValues) {
    const { credentials } = values;
    const obj = credentials || values;
    const { clientData, attestation } = obj;
    return !!(clientData && attestation);
  }

  mapCredentials(values: WebauthnEnrollValues): Credentials | undefined {
    const { credentials, clientData, attestation, transports } = values;
    if (!credentials && !clientData && !attestation) {
      return;
    }
    return credentials || ({
      clientData,
      attestation,
      ...(transports && { transports }),
    });
  }

  getInputs() {
    return [
      { name: 'clientData', type: 'string', required: true, visible: false, label: 'Client Data' },
      { name: 'attestation', type: 'string', required: true, visible: false, label: 'Attestation' },
    ];
  }
}
