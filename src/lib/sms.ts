import https from 'https';

interface SendSmsParams {
  message: string;
  recipients: string[];
}

interface SmsResponse {
  success: boolean;
  responses?: Array<{
    mobile: string;
    'response-description': string;
    'messageid'?: string;
  }>;
  error?: string;
}

export async function sendSms(params: SendSmsParams): Promise<SmsResponse> {
  const { CELCOM_API_KEY, CELCOM_PARTNER_ID, CELCOM_SENDER_ID } = process.env;

  if (!CELCOM_API_KEY || !CELCOM_PARTNER_ID || !CELCOM_SENDER_ID) {
    console.error('SMS configuration is missing');
    return { success: false, error: 'SMS configuration is missing' };
  }

  const url = 'https://isms.celcomafrica.com/api/services/sendsms/';
  const mobileNumbers = params.recipients.join(',');

  const payload = JSON.stringify({
    apikey: CELCOM_API_KEY,
    partnerID: CELCOM_PARTNER_ID,
    message: params.message,
    shortcode: CELCOM_SENDER_ID,
    mobile: mobileNumbers,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'isms.celcomafrica.com',
      port: 443,
      path: '/api/services/sendsms/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const result = JSON.parse(data);
            console.log('--- SMS Dispatch Summary ---');
            result.responses?.forEach((item: any) => {
              console.log(`To: ${item.mobile} | Status: ${item['response-description']}`);
            });
            resolve({ success: true, responses: result.responses });
          } else {
            console.error(`HTTP Error: ${res.statusCode}`);
            console.error('Response:', data);
            resolve({ success: false, error: `HTTP Error: ${res.statusCode}` });
          }
        } catch (error) {
          console.error('Error parsing SMS response:', error);
          resolve({ success: false, error: 'Failed to parse response' });
        }
      });
    });

    req.on('error', (error) => {
      console.error('SMS request error:', error);
      resolve({ success: false, error: error.message });
    });

    req.write(payload);
    req.end();
  });
}

export async function checkDeliveryStatus(messageId: string): Promise<any> {
  const { CELCOM_API_KEY, CELCOM_PARTNER_ID } = process.env;

  if (!CELCOM_API_KEY || !CELCOM_PARTNER_ID) {
    return { error: 'SMS configuration is missing' };
  }

  const payload = JSON.stringify({
    apikey: CELCOM_API_KEY,
    partnerID: CELCOM_PARTNER_ID,
    messageID: messageId,
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'isms.celcomafrica.com',
      port: 443,
      path: '/api/services/getdlr/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('Final Delivery Status:', result);
          resolve(result);
        } catch (error) {
          console.error('Error parsing delivery status:', error);
          resolve({ error: 'Failed to parse response' });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Delivery status request error:', error);
      resolve({ error: error.message });
    });

    req.write(payload);
    req.end();
  });
}
