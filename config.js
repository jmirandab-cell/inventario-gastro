// config.js - Centro de Conexión Firebase + HCUCH
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    browserSessionPersistence, 
    setPersistence 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Configuración usando las variables de tu archivo .env
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 1. Inicializar Firebase
const app = initializeApp(firebaseConfig);

// 2. Inicializar Servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 3. Configuración de Gemini (IA)
export const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

// 4. Forzar Persistencia
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("✅ Persistencia de sesión configurada.");
  })
  .catch((error) => {
    console.error("❌ Error configurando persistencia:", error);
  });

// 5. Exponer a la ventana global para fácil acceso
window.auth = auth;
window.db = db;
window.storage = storage;
window.geminiApiKey = geminiApiKey;

console.log("✅ Conexión establecida: Firebase + Gemini listos.");