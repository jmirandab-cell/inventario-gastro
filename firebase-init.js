// =================================================================
// ARCHIVO: firebase-init.js (VERSIÓN CON ARRAY TOOLS)
// =================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// 👇 AGREGAMOS arrayUnion, arrayRemove e increment 👇
import { 
    getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc, 
    query, where, orderBy, limit, serverTimestamp, collectionGroup, writeBatch, runTransaction, onSnapshot,
    arrayUnion, arrayRemove, increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, 
    GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBiOXLhDiMpr9zUOwH8NWGJ_YvQ_8y-_Hs",
    authDomain: "inventario-gastro-hcuch.firebaseapp.com",
    projectId: "inventario-gastro-hcuch",
    storageBucket: "inventario-gastro-hcuch.firebasestorage.app",
    messagingSenderId: "958769620035",
    appId: "1:958769620035:web:dfeea27f224376446ea0f6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const appId = "inventario-gastro-hcuch"; 

// EXPORTAR A WINDOW
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
// 👇 NUEVAS HERRAMIENTAS 👇
window.arrayUnion = arrayUnion;
window.arrayRemove = arrayRemove;
window.increment = increment;

// STORAGE
window.ref = ref;
window.uploadBytes = uploadBytes;
window.uploadBytesResumable = uploadBytesResumable;
window.getDownloadURL = getDownloadURL;
window.deleteObject = deleteObject;

console.log("✅ Firebase actualizado: Herramientas de Array listas.");