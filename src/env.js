// src/env.js
const IS_PROD = false;

export const api_url = IS_PROD
  ? "https://xypdmnido2.execute-api.us-west-1.amazonaws.com/api"
  : "http://localhost:8000/api";

export const front_url = IS_PROD
  ? "https://wishveil-front.vercel.app"
  : "http://localhost:3000";
