/**
 * Check if a token with the given name exists in token storage
 * @param  {[type]}   name      The name of the token
 * @param  {[type]}   falseCase Whether or not to check if the token exists or
 *                              not
 */
export default async (name: string, falseCase: boolean) => {
  const TOKEN_STORAGE_NAME = 'okta-token-storage';
  const cookie = await browser.getCookies(TOKEN_STORAGE_NAME);
  const tokens = cookie.length ? JSON.parse(decodeURIComponent(cookie[0].value)) : {};
  const token = tokens[name] || null;

  if (falseCase) {
    expect(token)
      // @ts-expect-error
      .toEqual(null, `Expected "${name}" not to exists in storage but it does`);
  } else {
    expect(token)
      // @ts-expect-error
      .not.toEqual(null, `Expected "${name}" to exists in storage but it does not`);
  }

};
