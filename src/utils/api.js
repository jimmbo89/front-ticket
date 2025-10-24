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
      const getMessage = (d) => d?.message || d?.msg || 'Error desconocido';
      const status = error.response.status;
      switch (status) {
        case 400:
          if (error.response.data.msg) {
            return { success: false, message: error.response.data.msg };
          } else if (error.response.data.errors) {
            const validationErrors = Object.values(error.response.data.errors).flat();
            return { success: false, message: `Errores de validación: ${validationErrors.join(', ')}` };
          } else {
            return { success: false, message: `Error: ${error.response.data.error || 'Ocurrió un error de validación'}` };
          }
        case 401:
          return { success: false, message: `Acceso no autorizado: Revocado o no válido.:${error.response}` };
          case 404:
          // ✅ Manejo específico para 404 con mensaje del backend
          return { success: false, message: getMessage(data) };
        case 500:
          return { success: false, message: 'Error interno del servidor.' };
        default:
          return { success: false, message: `Error inesperado: ${status}:${error.response}` };
      }
    } else if (error.request) {
      return { success: false, message: 'No se recibió respuesta del servidor.' };
    } else {
      return { success: false, message: 'Error al enviar la solicitud.' };
    }
  }
}
