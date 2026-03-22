import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { IonicVue } from '@ionic/vue'
import { createPinia } from 'pinia'
import { database } from './database/sqliteDatabase'

/* Ionic CSS */
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'
// import '@ionic/vue/css/palettes/dark.system.css'

import './theme/variables.css'
import { Capacitor } from '@capacitor/core'

const app = createApp(App)
app
  .use(IonicVue)
  .use(createPinia())
  .use(router)

async function bootstrap() {
  try {
    // Only init SQLite on native — web uses mock data
    if (Capacitor.getPlatform() !== 'web') {
      await database.init()
    }

    await router.isReady()
    app.mount('#app')
  } catch (error) {
    console.error('App initialization failed:', error)
    document.body.innerHTML = `<pre style="color:red;padding:20px">${error}</pre>`
  }
}

bootstrap()