// =================================================================
// ARCHIVO: firebase-init.js (Capa de Compatibilidad)
// =================================================================
// Este archivo ahora importa la configuración central desde config.js
// y sigue exportando las funciones de Firebase al objeto 'window'
// para mantener la compatibilidad con el resto de la aplicación.

import { db, auth, storage } from './config.js'; // <- ¡IMPORTANTE!

import {
    collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc,
    query, where, orderBy, limit, serverTimestamp, collectionGroup, writeBatch, runTransaction, onSnapshot,
    arrayUnion, arrayRemove, increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    onAuthStateChanged, signOut, signInWithEmailAndPassword,
    GoogleAuthProvider, signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// La configuración y la inicialización de 'app', 'db', 'auth' y 'storage'
// se han movido a 'config.js'.

// Mantenemos el appId que ahora también lee desde las variables de entorno.
const appId = import.meta.env.VITE_PROJECT_ID;

// EXPORTAR A WINDOW (La razón de ser de este archivo)
window.db = db;
window.auth = auth;
window.storage = storage;
window.appId = appId;

// AUTH
window.onAuthStateChanged = onAuthStateChanged;
window.signOut = signOut;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signInWithPopup = signInWithPopup;
window.GoogleAuthProvider = GoogleAuthProvider;

// FIRESTORE
window.doc = doc;
window.getDoc = getDoc;
window.getDocs = getDocs;
window.addDoc = addDoc;
window.updateDoc = updateDoc;
window.deleteDoc = deleteDoc;
window.setDoc = setDoc;
window.collection = collection;
window.query = query;
window.where = where;
window.orderBy = orderBy;
window.limit = limit;
window.serverTimestamp = serverTimestamp;
window.collectionGroup = collectionGroup;
window.writeBatch = writeBatch;
window.runTransaction = runTransaction;
window.onSnapshot = onSnapshot;
window.arrayUnion = arrayUnion;
window.arrayRemove = arrayRemove;
window.increment = increment;

// STORAGE
window.ref = ref;
window.uploadBytes = uploadBytes;
window.uploadBytesResumable = uploadBytesResumable;
window.getDownloadURL = getDownloadURL;
window.deleteObject = deleteObject;

console.log("✅ Capa de compatibilidad de Firebase lista. Usando config.js centralizado.");
