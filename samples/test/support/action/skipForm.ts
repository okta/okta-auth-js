import SelectAuthenticator from '../selectors/SelectAuthenticator';

export default async function () {
    await (await $(SelectAuthenticator.skip)).click();
}