const LETTERS_COUNT = 26;
const DIGITS_COUNT = 10;
const NUMERIC = '0';
const ALPHA_LOWER = 'a';
const ALPHA_UPPER = 'A';

function getRandomEmail() {
  return getRandomString(6) + '@okta.com';
}

function getRandomPassword() {
  return getRandomString(3, [ALPHA_UPPER]) + getRandomString(3, [ALPHA_LOWER]) + '_' + getRandomString(3, [NUMERIC]);
}

function getCharSet(length, firstChar) {
  return [...Array(length)].map((_, i) => String.fromCharCode(firstChar.charCodeAt(0) + i)).join('');
}

// an - array of NUMERIC, ALPHA_LOWER, ALPHA_UPPER
function getRandomString(length, an = [ALPHA_UPPER, ALPHA_LOWER, NUMERIC]) {
  const charset = (an.includes(NUMERIC) ? getCharSet(DIGITS_COUNT, '0') : '') + 
    (an.includes(ALPHA_LOWER) ? getCharSet(LETTERS_COUNT, 'a') : '') + 
    (an.includes(ALPHA_UPPER) ? getCharSet(LETTERS_COUNT, 'A') : '');
  const min = 0, max = charset.length;
  return [...Array(length)].map(() => {
    const r = Math.floor(Math.random() * (max - min) + min);
    return charset[r];
  }).join('');
}


export {
  getRandomPassword,
  getRandomEmail
};
