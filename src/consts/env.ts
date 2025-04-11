// Variables de entorno para Twitch
export const TWITCH_CLIENT_ID = import.meta.env.PUBLIC_TWITCH_CLIENT_ID || '';
export const TWITCH_REDIRECT_URI = import.meta.env.PUBLIC_TWITCH_REDIRECT_URI || 'http://localhost:4321/auth/callback';