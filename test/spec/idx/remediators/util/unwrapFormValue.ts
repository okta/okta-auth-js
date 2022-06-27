import { unwrapFormValue } from '../../../../../lib/idx/remediators/GenericRemediator/util';

describe('unwrapFormValue - this function only unwrap forms that have one "value" field', () => {
  it('can unwrap top level form', () => {
    const remediation = {
      'name': 'credentials',
      'type': 'object',
      'form': {
        'value': [
          {
            'name': 'passcode',
            'label': 'Insert then tap your YubiKey',
            'required': true,
            'secret': true
          }
        ]
      },
      'required': true
    };
    const res = unwrapFormValue(remediation);
    expect(res).toEqual({
      'name': 'credentials',
      'type': 'object',
      'value': [
        {
          'name': 'passcode',
          'label': 'Insert then tap your YubiKey',
          'required': true,
          'secret': true
        }
      ],
      'required': true
    });
  });

  it('can unwrap forms nested in array', () => {
    const remediation = {
      'name': 'authenticator',
      'type': 'object',
      'options': [
        {
          'label': 'Yubikey Authenticator',
          'value': {
            'form': {
              'value': [
                {
                  'name': 'id',
                  'required': true,
                  'value': 'aut10faWWbNaNWBaH0g4',
                  'mutable': false
                },
                {
                  'name': 'methodType',
                  'required': false,
                  'value': 'otp',
                  'mutable': false
                }
              ]
            }
          },
          'relatesTo': {}
        }
      ]
    };
    const res = unwrapFormValue(remediation);
    expect(res).toEqual({
      'name': 'authenticator',
      'type': 'object',
      'options': [
        {
          'label': 'Yubikey Authenticator',
          'value': [
            {
              'name': 'id',
              'required': true,
              'value': 'aut10faWWbNaNWBaH0g4',
              'mutable': false
            },
            {
              'name': 'methodType',
              'required': false,
              'value': 'otp',
              'mutable': false
            }
          ],
          'relatesTo': {}
        }
      ]
    });
  });

  it('can unwrap value -> form -> value pattern', () => {
    const remediation = {
      'label': 'Phone',
      'value': {
        'form': {
          'value': [
            {
              'name': 'id',
              'required': true,
              'value': 'aut323vqRuvzGjk2T0g4',
              'mutable': false
            },
            {
              'name': 'methodType',
              'type': 'string',
              'required': false,
              'options': [{ 'label': 'SMS', 'value': 'sms' }]
            },
            {
              'name': 'phoneNumber',
              'label': 'Phone number',
              'required': false
            }
          ]
        }
      },
      'relatesTo': {}
    };
    const res = unwrapFormValue(remediation);
    expect(res).toEqual({
      'label': 'Phone',
      'value': [
        {
          'name': 'id',
          'required': true,
          'value': 'aut323vqRuvzGjk2T0g4',
          'mutable': false
        },
        {
          'name': 'methodType',
          'type': 'string',
          'required': false,
          'options': [{ 'label': 'SMS', 'value': 'sms' }]
        },
        {
          'name': 'phoneNumber',
          'label': 'Phone number',
          'required': false
        }
      ],
      'relatesTo': {}
    });
  });

  it('keeps form with other more than one value fields unchanged', () => {
    const remediation = {
      'name': 'credentials',
      'type': 'object',
      'form': {
        'fake': 'fake',
        'value': [
          {
            'name': 'passcode',
            'label': 'Insert then tap your YubiKey',
            'required': true,
            'secret': true
          }
        ]
      },
      'required': true
    };
    const res = unwrapFormValue(remediation);
    expect(res).toEqual({
      'name': 'credentials',
      'type': 'object',
      'form': {
        'fake': 'fake',
        'value': [
          {
            'name': 'passcode',
            'label': 'Insert then tap your YubiKey',
            'required': true,
            'secret': true
          }
        ]
      },
      'required': true
    });
  });

  describe('field level message', () => {
    it('handles general field level message', () => {
      const data = {
        "type":"array",
        "value":[
          {
            "message":"The security question answer must be at least 4 characters in length",
            "i18n":{
              "key":"securityQuestion.answer.tooShort.arg",
            },
            "class":"ERROR"
          }
        ]
      };
      const res = unwrapFormValue(data);
      expect(res).toEqual({
        "type":"array",
        "value":[
          {
            "message":"The security question answer must be at least 4 characters in length",
            "i18n":{
              "key":"securityQuestion.answer.tooShort.arg",
            },
            "class":"ERROR"
          }
        ]
      });
    });

    it('handles field level message with number params', () => {
      const data = {
        "type":"array",
        "value":[
          {
            "message":"The security question answer must be at least 4 characters in length",
            "i18n":{
              "key":"securityQuestion.answer.tooShort.arg",
              "params":[ 4, 'fakeParam' ]
            },
            "class":"ERROR"
          }
        ]
      };
      const res = unwrapFormValue(data);
      expect(res).toEqual({
        "type":"array",
        "value":[
          {
            "message":"The security question answer must be at least 4 characters in length",
            "i18n":{
              "key":"securityQuestion.answer.tooShort.arg",
              "params":[ 4, 'fakeParam' ]
            },
            "class":"ERROR"
          }
        ]
      });
    });

  });
  

});
