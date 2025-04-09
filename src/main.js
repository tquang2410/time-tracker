import './assets/main.css'
import PrimeVue from 'primevue/config';
import { createApp } from 'vue'
import App from './App.vue'
import Aura from '@primeuix/themes/aura';
import DatePicker from 'primevue/datepicker';
const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.component('DatePicker', DatePicker);
app.mount('#app')