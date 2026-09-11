// src/utils/api.js

import axiosInstance from '@/axios'; // Asumiendo que tienes una instancia de axios configurada
export async function handleRequest({ endpoint, method = 'GET', data = null, params = null, includeToken = true  }) {
  try {
    const config = {
      method: method.toUpperCase(), // Asegura que el método esté en mayúsculas (GET, POST, etc.)
      url: endpoint,
      ...(data && { data }), // Incluye `data` si no es nulo (para POST, PUT, PATCH)
      ...(params && { params }), // Incluye `params` si no es nulo (para GET o filtros en URL)
      includeToken
    };

    const response = await axiosInstance(config);

    if (response.status === 200 || response.status === 201) {
      return { success: true, message: "Operación realizada correctamente", data: response.data  };
    } else if (response.status === 204) {
      return { success: false, message: 'No encontrado.', data: null  };
    }

  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data ?? {};
      const getMessage = (data, fallback = 'Error desconocido') => {
        if (typeof data === 'string') {
          return data;
        }

        if (!data || typeof data !== 'object') {
          return fallback;
        }

        if (typeof data.msg === 'string' && data.msg.trim()) {
          return data.msg;
        }

        if (typeof data.message === 'string' && data.message.trim()) {
          return data.message;
        }

        if (data.errors) {
          const validationErrors = Object.values(data.errors)
            .flat(Infinity)
            .filter((message) => typeof message === 'string' && message.trim());

          if (validationErrors.length) {
            return `Errores de validación: ${validationErrors.join(', ')}`;
          }
        }

        if (typeof data.error === 'string' && data.error.trim()) {
          return data.error;
        }

        return fallback;
      };

      switch (status) {
        case 400:
        case 409:
        case 422:
          return {
            success: false,
            message: getMessage(responseData, status === 409
              ? 'El registro entra en conflicto con otro existente.'
              : 'Ocurrió un error de validación.'),
            data: responseData,
            status,
          };
        case 401:
          return {
            success: false,
            message: `Acceso no autorizado: ${getMessage(responseData, 'Revocado o no válido.')}`,
            data: responseData,
            status,
          };
        case 404:
          return { success: false, message: getMessage(responseData, 'Recurso no encontrado.'), data: responseData, status };
        case 500:
          return { success: false, message: getMessage(responseData, 'Error interno del servidor.'), data: responseData, status };
        default:
          return { success: false, message: getMessage(responseData, `Error inesperado: ${status}`), data: responseData, status };
      }
    } else if (error.request) {
      return { success: false, message: 'No se recibió respuesta del servidor.' };
    } else {
      return { success: false, message: 'Error al enviar la solicitud.' };
    }
  }
}
