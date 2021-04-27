const axios = require('axios');

async function getEmailVerificationCode(email) {
  const response = await axios.get(`https://email.ghostinspector.com/${email}/latest`);
  const emailCode = response.data.match(/(?:Enter this code|enter code intead): <b>(\d+)<\/b>/i)[1];
  return emailCode;
}

export { getEmailVerificationCode };
