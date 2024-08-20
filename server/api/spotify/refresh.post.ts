import axios from "axios";
import * as qs from 'qs';

export default defineEventHandler(async (event) => {

  const body = await readBody(event);
  if (typeof body.refreshToken === "undefined") {
    throw createError({
      statusCode: 400,
      statusMessage: "No Refresh Token",
    });
  }

  const runtimeConfig = useRuntimeConfig();
  const clientId = runtimeConfig.spotify.clientId;
  const secretId = runtimeConfig.spotify.clientSecret;

  const tokenRequestBody = qs.stringify({
    grant_type: "refresh_token",
    refresh_token: body.refreshToken,
  });

  const tokenRequest = await axios.request({
    method: 'post',
    url: "https://accounts.spotify.com/api/token",
    // maxBodyLength: Infinity,
    headers: { 
      'Authorization': "Basic " + Buffer.from(clientId + ":" + secretId).toString("base64"), 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: tokenRequestBody
  });

  return tokenRequest.data;

});
