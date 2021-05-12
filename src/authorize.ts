import { onschedApiAuthUrl, TOKEN_PATH } from './constants';
import * as oauth2 from 'simple-oauth2';

function getConfig(): oauth2.ModuleOptions<"client_id"> {
    return {
        client: {
          id: process.env.CLIENT_ID!,
          secret: process.env.CLIENT_SECRET!
        },
        auth: {
          tokenHost: onschedApiAuthUrl!,
          tokenPath: TOKEN_PATH!,
        }
    };
}
let accessToken: oauth2.AccessToken | null = null;
const client = new oauth2.ClientCredentials(getConfig());
/**
 * Checks to see if the access token is still usable else grabs a new token
 * @returns An Access Token or null
 */
export default async function authorize(): Promise<oauth2.AccessToken | null> {
    if (accessToken && !accessToken.expired) {
        return accessToken;
    }
    if (!accessToken || accessToken.expired) {
        // grab a new token
        const tokenParams = {
            scope: "OnSchedApi",
        };
        try {
            const oauthAccessToken = await client.getToken(tokenParams);
            accessToken = oauthAccessToken;
            return accessToken
        } 
        catch (error) {
            console.log('Access Token error', error.message);
        }
    }
    return null;
  }