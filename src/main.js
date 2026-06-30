/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from "./App.vue";
// Composables
import { createApp } from "vue";
import snotify from "vue3-snotify";
import "vue3-snotify/style";
import axios from './axios' // Importa la instancia configurada
import 'vuetify/styles' 
import './assets/styles/busgo.css'
// Plugins
import { registerPlugins } from "@/plugins";

const app = createApp(App);

// Agregar axios a la instancia global de Vue
app.config.globalProperties.$axios = axios

app.use(snotify);

registerPlugins(app);

app.mount("#app");
