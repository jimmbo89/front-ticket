/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import { Intersect } from "vuetify/directives";
import { es } from "vuetify/locale";

// Composables
//import { createVuetify } from "vuetify";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  locale: {
    locale: "es",
    fallback: "es",
    messages: {
      es: {
        ...es,
        dataTable: {
          ...es.dataTable,
          itemsPerPageText: "Filas por página:",
        },
        dataFooter: {
          ...es.dataFooter,
          itemsPerPageText: "Elementos por página:",
        },
        datePicker: {
          ...es.datePicker,
          itemsSelected: "{0} seleccionadas",
          range: {
            title: "Seleccionar fechas",
            header: "Ingrese fechas",
          },
          title: "Seleccionar fecha",
          header: "Ingrese fecha",
          input: {
            placeholder: "Ingrese fecha",
          },
        },
      },
    },
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: "#1867C0",
          secondary: "#5CBBF6",
        },
      },
    },
  },
  components: {
  
  },
  directives: {
    Intersect,
  },
});


