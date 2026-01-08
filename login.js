// =================================================================
// login.js - Versión Optimizada y Conectada a config.js
// =================================================================

// 1. Importamos la conexión central y las funciones de Firebase
import { auth } from "./config.js"; 
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// 2. Control de Logs (para que no ensucie la consola en producción)
const DEBUG = false;
if (!DEBUG) { console.log = function() {}; }

// 3. Obtenemos los elementos de la interfaz
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');
const loginButtonText = document.getElementById('login-button-text');
const loginSpinner = document.getElementById('login-spinner');
const loginError = document.getElementById('login-error');

// 4. Proceso de Inicio de Sesión
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se refresque

    // Activamos el estado visual de "Cargando..."
    setLoading(true);

    const email = loginEmail.value;
    const password = loginPassword.value;

    try {
        // Intentamos entrar usando la conexión central 'auth'
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        console.debug && console.debug('Usuario autenticado con éxito');
        
        // Si todo sale bien, vamos al panel principal
        window.location.href = 'index.html';

    } catch (error) {
        // Si hay un error, lo mostramos de forma amigable
        console.error('Error de acceso:', error.code);
        
        if (error.code === 'auth/invalid-credential' || 
            error.code === 'auth/wrong-password' || 
            error.code === 'auth/user-not-found') {
            showError('Email o contraseña incorrectos.');
        } else {
            showError('No se pudo conectar. Revisa tu internet.');
        }
        
        // Como falló, volvemos a activar el botón para reintentar
        setLoading(false);
    }
});

/**
 * Función para manejar el estado visual del botón
 */
function setLoading(isLoading) {
    if (isLoading) {
        loginButton.disabled = true;
        loginButtonText.classList.add('hidden');
        loginSpinner.classList.remove('hidden');
        loginError.classList.add('hidden');
    } else {
        loginButton.disabled = false;
        loginButtonText.classList.remove('hidden');
        loginSpinner.classList.add('hidden');
    }
}

/**
 * Función para mostrar mensajes de error en pantalla
 */
function showError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
}