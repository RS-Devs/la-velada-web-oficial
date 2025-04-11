import { TWITCH_CLIENT_ID, TWITCH_REDIRECT_URI } from '../consts/env';

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
}

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('twitch_token') !== null;
};

export const getCurrentUser = (): TwitchUser | null => {
  const userJson = localStorage.getItem('twitch_user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Error al obtener el usuario actual:', error);
    return null;
  }
};

export const loginWithTwitch = (): void => {
  const scope = 'user:read:email';
  const responseType = 'token';
  
  const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');
  authUrl.searchParams.append('client_id', TWITCH_CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', TWITCH_REDIRECT_URI);
  authUrl.searchParams.append('response_type', responseType);
  authUrl.searchParams.append('scope', scope);
  
  window.location.href = authUrl.toString();
};

export const handleTwitchCallback = async (): Promise<TwitchUser | null> => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  
  if (!accessToken) return null;
  
  try {
    // Guardar el token
    localStorage.setItem('twitch_token', accessToken);
    
    // Obtener información del usuario
    const response = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': TWITCH_CLIENT_ID
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener información del usuario');
    }
    
    const data = await response.json();
    const user = data.data[0];
    
    // Guardar información del usuario
    localStorage.setItem('twitch_user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Error en el callback de Twitch:', error);
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem('twitch_token');
  localStorage.removeItem('twitch_user');
};