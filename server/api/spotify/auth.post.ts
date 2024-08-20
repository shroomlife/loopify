import axios from "axios";
import * as qs from 'qs';

export default defineEventHandler(async (event) => {

  const body = await readBody(event);
  if (typeof body.code === "undefined") {
    throw createError({
      statusCode: 400,
      statusMessage: "No Code",
    });
  }

  const runtimeConfig = useRuntimeConfig();
  const clientId = runtimeConfig.spotify.clientId;
  const secretId = runtimeConfig.spotify.clientSecret;

  const config = useRuntimeConfig()
  console.log('config', config)
  const requestUrl = config.public.spotifyRedirectUrl;

  const tokenRequestBody = qs.stringify({
    code: body.code,
    redirect_uri: requestUrl,
    grant_type: "authorization_code",
  });

  const tokenRequest = await axios.request({
    method: 'post',
    url: "https://accounts.spotify.com/api/token",
    maxBodyLength: Infinity,
    headers: { 
      'Authorization': "Basic " + Buffer.from(clientId + ":" + secretId).toString("base64"), 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: tokenRequestBody
  });

  return tokenRequest.data;

});
