// src/environments/environment.ts
export const environment = {
  production: false,
  API_BASE_URL: 'http://localhost:8080/api', // O la URL de tu backend
  TOKEN_KEY: 'jwtToken', // Clave para almacenar el token JWT
  USERNAME_KEY: 'username', // Clave para almacenar el nombre de usuario
  ROLE_KEY: 'role' // Clave para almacenar el rol del usuario
};