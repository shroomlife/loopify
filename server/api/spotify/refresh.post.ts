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

  const clientId = "a4404ccecd5d4823b9d41ee6d538086e";
  const secretId = "3fe4672235c04d02b66d9b6de0efe6e9";

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
