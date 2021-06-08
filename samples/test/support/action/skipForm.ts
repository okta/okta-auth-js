import SelectAuthenticator from '../selectors/SelectAuthenticator';

export default async function (factorName: string) {
    await (await $(SelectAuthenticator.skip)).click();
}