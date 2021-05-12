import fetch from 'node-fetch';
import { CallBackendArguments } from 'swagger-to-graphql';
import { URLSearchParams } from 'url';
import authorize from './authorize';

function getBodyAndHeaders(
  body: any,
  bodyType: 'json' | 'formData',
  headers: { [key: string]: string } | undefined,
) {
  if (!body) {
    return { headers };
  }
  if (bodyType === 'json') {
    return {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    };
  }
  return {
    headers,
    body: new URLSearchParams(body),
  };
}


export async function callBackend({
  context,
  requestOptions: { method, body, path, query, bodyType },
}: CallBackendArguments<{}>) {
  console.log('context: ', context);
  const res = await authorize();
  console.log('res: ', res);
  const searchPath = query ? `?${new URLSearchParams(query)}` : '';
  const url = `${process.env.ONSCHED_CONSUMER_API_URL}${path}${searchPath}`;
  console.log('url: ', url);
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `${res!.token['token_type']} ${res!.token['access_token']}`
  }
  const bodyAndHeaders = getBodyAndHeaders(body, bodyType, headers);
  console.log('body and headers: ', bodyAndHeaders);
  const response = await fetch(url, {
    method,
    ...bodyAndHeaders,
  });
  const text = await response.text();
  if (response.ok) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }
  throw new Error(`Response: ${response.status} - ${text}`);
}