import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8001/api/',
  //baseURL: 'https://busgo.api.wezen.cl/api/',
  timeout: 10000,
});

// Interceptor para agregar el token y manejar el `Content-Type` dinámicamente
instance.interceptors.request.use(
  (config) => { 
    // Encabezados anti-caché
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers.Pragma = 'no-cache';
    config.headers.Expires = '0';
    // Verifica si el token debe ser agregado
    if (config.includeToken !== false) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token.replace(/['"]+/g, '')}`;
      }
    }

    // Ajustar el Content-Type dinámicamente según los datos que se envían
    if (config.data instanceof FormData) {
      // Si los datos son un FormData, entonces el Content-Type será multipart/form-data
      config.headers['Content-Type'] = 'multipart/form-data';
    } else {
      // Si no es un FormData, se puede enviar como JSON
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
