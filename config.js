// config.js - Este es el "cerebro" que conecta tu app con Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Estos son los datos de tu proyecto (sacados de tu login.js actual)
const firebaseConfig = {
  apiKey: "AIzaSyBiOXLhDiMpr9zUOwH8NWGJ_YvQ_8y-_Hs",
  authDomain: "inventario-gastro-hcuch.firebaseapp.com",
  projectId: "inventario-gastro-hcuch",
  storageBucket: "inventario-gastro-hcuch.firebasestorage.app",
  messagingSenderId: "958769620035",
  appId: "1:958769620035:web:dfeea27f224376446ea0f6"
};

// Inicializamos Firebase una sola vez
const app = initializeApp(firebaseConfig);

// Exportamos 'auth' (para el login) y 'db' (para los datos) 
// para que otros archivos puedan usarlos sin repetir la configuración
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("✅ Conexión central de Firebase lista.");