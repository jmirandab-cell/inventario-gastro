console.log("Prueba");
// =============================================================
// SECCIÓN A: SISTEMA DE ESCÁNER (Html5Qrcode)
// =============================================================

console.log("📸 Cargando sistema de escáner...");

window.lectorQR = null;

// Función para abrir el modal y encender la cámara
window.abrirScannerUniversal = function () {
    // 1. Limpieza preventiva
    document.querySelectorAll('#modal-qr-generado').forEach(el => {
        el.classList.add('hidden');
        el.style.display = 'none';
    });

    // 2. Mostrar el modal
    const modal = document.getElementById('modal-qr-generado');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    } else {
        console.error("❌ Error: Falta el modal 'modal-qr-generado' en el HTML.");
        alert("Error: Falta el modal de escáner en el HTML.");
        return;
    }

    // 3. Iniciar cámara
    setTimeout(iniciarCamaraFinal, 300);
};

function iniciarCamaraFinal() {
    if (typeof Html5Qrcode === 'undefined') {
        alert("Error: La librería del escáner no cargó. Revisa el Paso 1 del HTML.");
        return;
    }

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    if (window.lectorQR) {
        try { window.lectorQR.clear(); } catch (e) { }
    }

    // "reader-box" debe existir en tu HTML dentro del modal
    window.lectorQR = new Html5Qrcode("reader-box");

    window.lectorQR.start(
        { facingMode: "environment" },
        config,
        procesarLecturaFinal,
        (errorMessage) => { /* Ignoramos errores de frame vacío */ }
    ).catch(err => {
        console.warn("Fallo cámara trasera, intentando frontal...", err);
        window.lectorQR.start({ facingMode: "user" }, config, procesarLecturaFinal, () => { });
    });
}

function procesarLecturaFinal(textoRaw) {
    const idEscaneado = textoRaw.trim();
    console.log("✅ Código detectado:", idEscaneado);

    window.cerrarScannerUniversal();

    let textoFinal = idEscaneado;

    // LÓGICA INTELIGENTE: Busca en los items descargados (currentItems o itemsGlobal)
    // Usamos 'currentItems' porque vi que así se llama tu variable global abajo
    const listaBusqueda = window.currentItems || [];

    if (listaBusqueda.length > 0) {
        const equipo = listaBusqueda.find(item => item.id === idEscaneado || item.internalId === idEscaneado);

        if (equipo) {
            if (equipo.serial && equipo.serial.trim() !== "") {
                textoFinal = equipo.serial;
            } else if (equipo.internalId && equipo.internalId.trim() !== "") {
                textoFinal = equipo.internalId;
            } else {
                textoFinal = equipo.name;
            }
        }
    }

    // INYECTAR EN EL BUSCADOR
    const input = document.getElementById('search-input');
    if (input) {
        input.value = textoFinal;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => {
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }, 100);

        // Usamos tu sistema de toast si existe, si no un alert simple
        if (typeof showToast === 'function') {
            showToast(`Escaneado: ${textoFinal}`, "success");
        }
    }
}

window.cerrarScannerUniversal = function () {
    const modal = document.getElementById('modal-qr-generado');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }

    if (window.lectorQR) {
        window.lectorQR.stop().then(() => window.lectorQR.clear()).catch(() => window.lectorQR.clear());
    }
};


let db, auth, storage;

// Funciones Espejo (Auth)
const onAuthStateChanged = (...args) => window.onAuthStateChanged(...args);
const signOut = (...args) => window.signOut(...args);
const signInWithEmailAndPassword = (...args) => window.signInWithEmailAndPassword(...args);
const signInWithPopup = (...args) => window.signInWithPopup(...args);
const GoogleAuthProvider = window.GoogleAuthProvider;

// Funciones Espejo (Firestore)
const collection = (...args) => window.collection(...args);
const doc = (...args) => window.doc(...args);
const getDoc = (...args) => window.getDoc(...args);
const getDocs = (...args) => window.getDocs(...args);
const addDoc = (...args) => window.addDoc(...args);
const updateDoc = (...args) => window.updateDoc(...args);
const deleteDoc = (...args) => window.deleteDoc(...args);
const setDoc = (...args) => window.setDoc(...args);
const query = (...args) => window.query(...args);
const where = (...args) => window.where(...args);
const orderBy = (...args) => window.orderBy(...args);
const limit = (...args) => window.limit(...args);
const serverTimestamp = (...args) => window.serverTimestamp(...args);
const collectionGroup = (...args) => window.collectionGroup(...args);
const writeBatch = (...args) => window.writeBatch(...args);
const runTransaction = (...args) => window.runTransaction(...args);
const onSnapshot = (...args) => window.onSnapshot(...args);
// 👇 NUEVAS PARA TUS TICKETS 👇
const arrayUnion = (...args) => window.arrayUnion(...args);
const arrayRemove = (...args) => window.arrayRemove(...args);
const increment = (...args) => window.increment(...args);

// Funciones Espejo (Storage)
const ref = (...args) => window.ref(...args);
const uploadBytes = (...args) => window.uploadBytes(...args);
const uploadBytesResumable = (...args) => window.uploadBytesResumable(...args);
const getDownloadURL = (...args) => window.getDownloadURL(...args);
const deleteObject = (...args) => window.deleteObject(...args);


// -------------------------------------------------------------
// 2. TUS VARIABLES GLOBALES
// -------------------------------------------------------------
let imageFileToUpload = null;
let cropperInstance = null;
let currentUserId = null;
let selectedItemId = null;
let selectedItemData = null;
let reportsUnsubscribe = null;
let currentItems = [];
let allRooms = [];
let maintenanceTicketsUnsubscribe = null;
let allReports = [];
let reportsCurrentPage = 1;
let reportsItemsPerPage = 5;
let manualFilesToUpload = [];
let insertFilesToUpload = [];
let receptionFilesToUpload = [];
let reportFilesToUpload = [];
let selectionMode = false;
let selectedPipettes = new Set();
let currentBatchId = null;
let maintenanceAlerts = [];
let currentView = 'equipment';
let appPassword = null;
let passwordCallback = null;
let settingsLoaded = false;
let itemsUnsubscribe = null; // 👈 ¡ESTA ES LA PIEZA PERDIDA!
let appId = "inventario-gastro-hcuch";

const DEBUG = true;
if (!DEBUG) { console.log = function () { }; }
const wordTemplateUrl = "https://firebasestorage.googleapis.com/v0/b/inventario-gastro-hcuch.firebasestorage.app/o/SOLICITUD%20DE%20TRABAJO%20INTERNA.doc?alt=media&token=bc9f7fdd-747b-47c6-b570-9128065bd8d1";

// -------------------------------------------------------------
// 3. REFERENCIAS UI
// -------------------------------------------------------------
const ui = {
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'), // ¡Solo una vez!
    hamburgerBtn: document.getElementById('hamburger-btn'),     // Aquí está tu botón clave
    dashboardView: document.getElementById('dashboard-view'),
    detailsView: document.getElementById('details-view'),
    itemList: document.getElementById('item-list'),
    reportsList: document.getElementById('reports-list'),
    noReportsView: document.getElementById('no-reports-view'),
    searchInput: document.getElementById('search-input'),
    itemModal: document.getElementById('item-modal'),
    reportModal: document.getElementById('report-modal'),
    confirmModal: document.getElementById('confirm-modal'),
    settingsModal: document.getElementById('settings-modal'),
    passwordModal: document.getElementById('password-modal'),
    copyDataModal: document.getElementById('copy-data-modal'),
    addTicketStepModal: document.getElementById('add-ticket-step-modal'),
    manualsModal: document.getElementById('manuals-modal'),
    insertsModal: document.getElementById('inserts-modal'),
    geminiSummaryModal: document.getElementById('gemini-summary-modal'),
    itemForm: document.getElementById('item-form'),
    reportForm: document.getElementById('report-form'),
    sidebarTitle: document.getElementById('sidebar-title'),
    addBtnText: document.getElementById('add-btn-text'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    reportsSection: document.getElementById('reports-section'),
    maintenanceTrackingSection: document.getElementById('maintenance-tracking-section'),
    imagePreview: document.getElementById('image-preview'),
    itemImageInput: document.getElementById('item-image'),
    roomsList: document.getElementById('rooms-list'),
    maintenanceTicketsList: document.getElementById('maintenance-tickets-list'),
    noMaintenanceTicketsView: document.getElementById('no-maintenance-tickets-view'),
    notificationsBtn: document.getElementById('notifications-btn'),
    notificationDot: document.getElementById('notification-dot'),
    notificationsModal: document.getElementById('notifications-modal'),
    notificationsList: document.getElementById('notifications-list'),
    convertToInventoryBtn: document.getElementById('convert-to-inventory-btn'),
    maintenanceTypeModal: document.getElementById('maintenance-type-modal'),
    maintenancePaginationControls: document.getElementById('maintenance-pagination-controls'),
    reportsPaginationControls: document.getElementById('reports-pagination-controls'),
    multiSelectBtn: document.getElementById('multi-select-btn'),
    selectionActionBar: document.getElementById('selection-action-bar'),
    selectionCount: document.getElementById('selection-count'),
    createBatchModal: document.getElementById('create-batch-modal'),
    batchPipetteList: document.getElementById('batch-pipette-list'),
    batchDetailsModal: document.getElementById('batch-details-modal'),
    batchList: document.getElementById('batch-list')
};

// -------------------------------------------------------------
// 4. FUNCIONES DE UTILIDAD
// -------------------------------------------------------------
function resizeImage(file, maxWidth, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            callback(dataUrl);
        };
    };
}

/**
 * Función auxiliar BLINDADA para cargar datos
 */
async function setupLoggedInUser(user) {
    console.log(`✅ Conectado como: ${user.email}`);

    try {
        // 1. Asignar ID global
        currentUserId = user.uid;

        // 🚨 FUERZA BRUTA 1: Asegurar que DB existe
        if (!db) {
            console.warn("⚠️ DB no estaba definida, forzando conexión...");
            db = window.db;
        }

        // 🚨 FUERZA BRUTA 2: Obligar a que la vista sea 'equipment' si está vacía
        if (!currentView) {
            console.warn("⚠️ currentView estaba vacía. Forzando a 'equipment'");
            currentView = 'equipment';
        }

        // 2. Actualizar UI
        const authStatus = document.getElementById('auth-status');
        if (authStatus) {
            authStatus.innerHTML = '';
            const p = document.createElement('p');
            p.className = 'font-semibold';
            const safeEmail = user.email.split('@')[0].replace(/</g, "&lt;").replace(/>/g, "&gt;");
            p.textContent = `Hola, ${safeEmail}`;
            authStatus.appendChild(p);
        }

        // 3. Cargar configuraciones
        if (typeof loadUserRole === 'function') await loadUserRole(user.uid);
        if (typeof loadSettings === 'function') await loadSettings();

        // 4. CARGAR EQUIPOS
        console.log(`🚀 Intentando cargar vista: ${currentView}`);

        // 🚨 FUERZA BRUTA 3: Probar las dos formas de llamar a la función
        if (typeof loadDataForCurrentView === 'function') {
            console.log("✅ Llamando a loadDataForCurrentView()...");
            await loadDataForCurrentView();
        } else if (typeof window.loadDataForCurrentView === 'function') {
            console.log("✅ Llamando a window.loadDataForCurrentView()...");
            await window.loadDataForCurrentView();
        } else {
            console.error("❌ CRÍTICO: La función loadDataForCurrentView NO EXISTE en ninguna parte.");
            alert("Error crítico: No encuentro la función de carga.");
        }

        // 5. Extras
        if (typeof checkMaintenanceAlerts === 'function') checkMaintenanceAlerts();
        if (typeof loadRecentActivity === 'function') loadRecentActivity();

    } catch (dataError) {
        console.error("❌ ERROR CARGA DE DATOS:", dataError);
        alert("Error al cargar: " + dataError.message);
    }
}
window.initialize = async function () {
    console.log("🚀 1. App iniciada. Esperando a Firebase...");

    // 🛑 SEMÁFORO DE SEGURIDAD
    let intentos = 0;
    while (!window.onAuthStateChanged && intentos < 50) {
        await new Promise(r => setTimeout(r, 100));
        intentos++;
    }

    if (!window.onAuthStateChanged) {
        alert("La conexión es lenta. Por favor recarga la página.");
        return;
    }

    // ✅ CARGA DE VARIABLES GLOBALES
    db = window.db;
    auth = window.auth;
    storage = window.storage;

    // 🟢 FORZAMOS LA ID AQUÍ PARA QUE NO FALLE NUNCA
    appId = "inventario-gastro-hcuch";
    window.appId = appId; // Por si acaso algo más lo busca en window

    try {
        console.log("🚀 2. Firebase listo.");

        // Escuchamos el estado de la sesión
        window.onAuthStateChanged(auth, async (user) => {
            console.log("🚀 3. Auth respondió.");

            if (user) {
                // Si hay usuario, llamamos a la función auxiliar
                setupLoggedInUser(user);
            } else {
                // Si no hay usuario, mandamos al login
                window.location.href = 'login.html';
            }
        });

    } catch (error) {
        console.error("❌ Error initialize:", error);
    }
};

async function loadSettings() {
    // ASEGURATE que appId sea "inventario-gastro-hcuch" o el ID que prefieras como base
    const settingsDocRef = doc(db, `artifacts/${appId}/public/data/settings`, 'config');

    try {
        console.log("Intentando cargar configuración desde:", appId);
        const docSnap = await getDoc(settingsDocRef);

        if (docSnap.exists()) {
            const settings = docSnap.data();
            appPassword = settings.password || null;

            // Manejo de salas
            if (settings.rooms && Array.isArray(settings.rooms) && settings.rooms.length > 0) {
                allRooms = settings.rooms;
            } else {
                allRooms = ['Laboratorio Principal', 'Sala de Endoscopía', 'Sala de Muestras', 'Bodega'];
            }

            // Aplicar tema
            const localTheme = localStorage.getItem('appThemeColor');
            if (localTheme) applyTheme(localTheme);
            else if (settings.themeColor) applyTheme(settings.themeColor);

            // Actualizar contadores en la UI (con validación de existencia)
            const yearEl = document.getElementById('counter-year');
            const nextValEl = document.getElementById('next-counter-value');
            if (yearEl) yearEl.textContent = settings.maintenanceRequestYear || new Date().getFullYear();
            if (nextValEl) nextValEl.value = (settings.maintenanceRequestCounter || 0) + 1;

            allRooms.sort();
            renderRoomsList();
        } else {
            console.warn("Documento de configuración no existe en Firestore. Usando valores por defecto.");
            allRooms = ['Laboratorio Principal', 'Sala de Endoscopía', 'Sala de Muestras', 'Bodega'];
            appPassword = null;
        }

        // --- ESTO ES LO QUE HACE QUE LOS BOTONES FUNCIONEN ---
        settingsLoaded = true;

        const roomSelect = document.getElementById('item-room');
        if (roomSelect) {
            populateRoomsDropdown();
        }

        // Intentar cargar lotes (si falla esta, no debería bloquear los botones)
        try {
            await loadCalibrationBatches();
        } catch (e) {
            console.error("Error al cargar lotes existentes:", e);
        }

    } catch (error) {
        // Si hay un 404 o 400, lo atrapamos aquí para que la app no se muera
        console.error("Error capturado en loadSettings:", error);
        settingsLoaded = true; // Forzamos true para que otros procesos no esperen eternamente
    }
}

function renderRoomsList() {
    ui.roomsList.innerHTML = '';
    if (allRooms.length === 0) {
        ui.roomsList.innerHTML = '<p class="text-slate-500 text-center">No hay salas definidas.</p>';
    }
    allRooms.forEach(roomName => {
        const t = document.getElementById('room-management-item-template').content.cloneNode(true);
        t.querySelector('.room-name').textContent = roomName;
        t.querySelector('.delete-room-btn').addEventListener('click', () => {
            openPasswordModal(() => {
                showConfirmModal('Eliminar Sala', `¿Estás seguro de que quieres eliminar la sala "${roomName}"?`, () => deleteRoom(roomName));
            });
        });
        ui.roomsList.appendChild(t);
    });
}

async function addRoom(event) {
    event.preventDefault();
    const newRoomNameInput = document.getElementById('new-room-name');
    const roomName = newRoomNameInput.value.trim();

    if (roomName && !allRooms.some(r => r.toLowerCase() === roomName.toLowerCase())) {
        const settingsDocRef = doc(db, `artifacts/${appId}/public/data/settings`, 'config');
        await updateDoc(settingsDocRef, { rooms: arrayUnion(roomName) });
        allRooms.push(roomName);
        allRooms.sort();
        renderRoomsList();
        newRoomNameInput.value = '';
        showToast('Sala añadida con éxito.', 'success');
    } else if (roomName) {
        showToast("Ya existe una sala con ese nombre.", 'error');
    }
}

async function deleteRoom(roomName) {
    const itemsInRoomQuery = query(collection(db, `artifacts/${appId}/public/data/items`), where("room", "==", roomName), where("isDeleted", "==", false));
    const querySnapshot = await getDocs(itemsInRoomQuery);

    if (!querySnapshot.empty) {
        showToast(`No se puede eliminar. Aún hay items en esta sala.`, 'error', 5000);
        return;
    }

    try {
        const settingsDocRef = doc(db, `artifacts/${appId}/public/data/settings`, 'config');
        await updateDoc(settingsDocRef, { rooms: arrayRemove(roomName) });
        showToast('Sala eliminada con éxito.', 'success');
    } catch (error) {
        console.error("Error eliminando sala:", error);
        showToast('No se pudo eliminar la sala.', 'error');
    }
}

function populateRoomsDropdown(selectedValue) {
    const select = document.getElementById('item-room');
    if (!select) return;

    select.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = "Selecciona una sala";
    select.appendChild(defaultOption);

    if (allRooms && allRooms.length > 0) {
        allRooms.forEach(roomName => {
            const option = document.createElement('option');
            option.value = roomName;
            option.textContent = roomName;
            select.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = "Cargando salas... (o lista vacía)";
        select.appendChild(option);

        if (!settingsLoaded) {
            setTimeout(() => populateRoomsDropdown(selectedValue), 1000);
        }
    }

    if (selectedValue) {
        const exists = Array.from(select.options).some(opt => opt.value === selectedValue);
        if (exists) {
            select.value = selectedValue;
        } else if (allRooms.length > 0) {
            const ghostOption = document.createElement('option');
            ghostOption.value = selectedValue;
            ghostOption.textContent = `${selectedValue} (Sala eliminada)`;
            select.appendChild(ghostOption);
            select.value = selectedValue;
        }
    }
}

async function changePassword(event) {
    event.preventDefault();
    const form = document.getElementById('change-password-form');
    const button = form.querySelector('button[type="submit"]');
    setButtonLoading(button, true, 'Cambiar Contraseña');

    if (!settingsLoaded) {
        showToast("La configuración aún se está cargando. Intenta de nuevo.", 'error');
        setButtonLoading(button, false, 'Cambiar Contraseña');
        return;
    }
    const currentPass = document.getElementById('current-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-new-password').value;

    // If an admin password exists, require it. If appPassword is null (first-time setup), allow setting a new password.
    if (appPassword && currentPass !== appPassword) { showToast("La contraseña actual es incorrecta.", 'error'); setButtonLoading(button, false, 'Cambiar Contraseña'); return; }
    if (newPass.length < 4) { showToast("La nueva contraseña debe tener al menos 4 caracteres.", 'error'); setButtonLoading(button, false, 'Cambiar Contraseña'); return; }
    if (newPass !== confirmPass) { showToast("Las nuevas contraseñas no coinciden.", 'error'); setButtonLoading(button, false, 'Cambiar Contraseña'); return; }

    try {
        const settingsDocRef = doc(db, `artifacts/${appId}/public/data/settings`, 'config');
        await updateDoc(settingsDocRef, { password: newPass });
        showToast("Contraseña cambiada con éxito.", 'success');
        form.reset();
    } catch (error) {
        console.error("Error cambiando contraseña:", error);
        showToast("Hubo un error al cambiar la contraseña.", 'error');
    } finally {
        setButtonLoading(button, false, 'Cambiar Contraseña');
    }
}

async function updateMaintenanceCounter(event) {
    event.preventDefault();
    const newValue = parseInt(document.getElementById('next-counter-value').value, 10);
    if (isNaN(newValue) || newValue < 1) {
        showToast("Por favor, ingresa un número válido para el correlativo.", 'error');
        return;
    }
    try {
        const settingsDocRef = doc(db, `artifacts/${appId}/public/data/settings`, 'config');
        await updateDoc(settingsDocRef, { maintenanceRequestCounter: newValue - 1 });
        showToast("Correlativo actualizado con éxito.", 'success');
    } catch (error) {
        console.error("Error actualizando correlativo:", error);
        showToast("Hubo un error al actualizar el correlativo.", 'error');
    }
}

function openPasswordModal(callback) {
    passwordCallback = callback;
    document.getElementById('password-form').reset();
    document.getElementById('password-error').classList.add('hidden');
    ui.passwordModal.classList.remove('hidden');
    ui.passwordModal.classList.add('flex');
    document.getElementById('password-input').focus();
}

function closePasswordModal() {
    ui.passwordModal.classList.add('hidden');
    ui.passwordModal.classList.remove('flex');
    passwordCallback = null;
}

function handlePasswordSubmit(event) {
    event.preventDefault();
    const passInput = document.getElementById('password-input').value;
    if (passInput === appPassword) {
        const actionToExecute = passwordCallback;
        closePasswordModal();
        if (typeof actionToExecute === 'function') {
            actionToExecute();
        }
    } else {
        const errorEl = document.getElementById('password-error');
        errorEl.classList.remove('hidden');
        setTimeout(() => errorEl.classList.add('hidden'), 2000);
    }
}

function uploadFile(file, path, onProgress) {
    if (!file) return Promise.reject(new Error("Archivo inválido."));
    if (!path) return Promise.reject(new Error("Ruta inválida."));

    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => {
                console.error("Error durante la subida (uploadTask.on):", error);
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({ downloadURL, filePath: path, name: file.name });
                } catch (error) {
                    console.error("Error obteniendo URL de descarga:", error);
                    reject(error);
                }
            }
        );
    });
}
// Esta función usa tu 'uploadFile' para guardar específicamente en los LOTES
async function subirArchivoLote(file) {
    if (!window.currentBatchId) {
        alert("Error: No hay un lote seleccionado.");
        return;
    }

    // 1. Buscamos el botón para mostrar que está trabajando
    const batchInput = document.getElementById('batch-file-input');
    const uploadBtn = batchInput ? batchInput.nextElementSibling : null;
    const originalText = uploadBtn ? uploadBtn.innerHTML : '';

    if (uploadBtn) {
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
        uploadBtn.disabled = true;
    }

    try {
        // 2. Definimos la ruta en la nube (Usamos la función que encontraste)
        const path = `docs/${appId}/batches/${window.currentBatchId}/${file.name}`;

        // Llamamos a tu función original
        const resultado = await uploadFile(file, path, (progreso) => {
            console.log(`Subida: ${progreso.toFixed(0)}%`);
        });

        // 3. Guardamos el enlace en la base de datos
        const batchRef = doc(db, `artifacts/${appId}/public/data/calibrationBatches`, window.currentBatchId);
        await updateDoc(batchRef, {
            attachments: arrayUnion({
                name: file.name,
                url: resultado.downloadURL,
                docDate: new Date().toISOString()
            })
        });

        showToast("Archivo guardado con éxito", "success");

        // 4. Refrescamos la vista para que veas el archivo en la lista
        if (typeof openBatchDetailsModal === 'function') {
            openBatchDetailsModal(window.currentBatchId);
        }

    } catch (error) {
        console.error("Error al procesar el archivo:", error);
        alert("No se pudo subir el archivo: " + error.message);
    } finally {
        // Devolvemos el botón a su estado normal
        if (uploadBtn) {
            uploadBtn.innerHTML = originalText;
            uploadBtn.disabled = false;
        }
    }
}
function handleItemFormSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('item-id').value;
    if (id) {
        openPasswordModal(executeSaveItem);
    } else {
        executeSaveItem();
    }
}

async function executeSaveItem() {
    const submitBtn = document.getElementById('submit-item-btn');
    setButtonLoading(submitBtn, true, 'Guardar');

    const imageInput = document.getElementById('item-image');

    try {
        const id = document.getElementById('item-id').value;
        let type = document.getElementById('item-type').value;

        let data = {
            name: document.getElementById('item-name').value,
            room: document.getElementById('item-room').value,
            status: document.getElementById('item-status').value,
            type: type,
            category: currentView === 'testing' ? 'testing' : 'inventory',
            ownership: document.getElementById('item-ownership').value,
            loanCompany: document.getElementById('item-loan-company').value,
            internalId: document.getElementById('item-internal-id').value,
            frequency: document.getElementById('item-frequency') ? document.getElementById('item-frequency').value : 'No aplica',
            isDeleted: false
        };

        if (type === 'equipment') {
            data.model = document.getElementById('item-model').value;
            data.serial = document.getElementById('item-serial').value;
            data.lastMaintenance = document.getElementById('item-last-maintenance').value;
            data.nextMaintenance = document.getElementById('item-next-maintenance').value;
        } else if (type === 'pipettes') {
            data.brand = document.getElementById('item-brand').value;
            data.volume = document.getElementById('item-volume').value;
            data.serial = document.getElementById('pipette-serial').value;
            data.lastCalibration = document.getElementById('item-last-calibration').value;
            data.nextCalibration = document.getElementById('item-next-calibration').value;
            if (data.status === 'Operativo') data.batchId = null;
            else if (selectedItemData && selectedItemData.batchId) data.batchId = selectedItemData.batchId;
            else data.batchId = null;
        } else if (type === 'refrigerators') {
            data.brand = document.getElementById('refrigerator-brand').value;
            data.model = document.getElementById('refrigerator-model').value;
            data.temperature = document.getElementById('refrigerator-temperature').value;
            data.lastMaintenance = document.getElementById('refrigerator-last-maintenance').value;
            data.nextMaintenance = document.getElementById('refrigerator-next-maintenance').value;
        }

        const activeInput = document.getElementById('item-image');

        const finalFile = imageFileToUpload || (activeInput && activeInput.files ? activeInput.files[0] : null);

        console.log("💾 Guardando equipo. Archivo de imagen:", finalFile ? finalFile.name : "Ninguno");

        if (finalFile) {
            document.getElementById('image-upload-progress-container').classList.remove('hidden');
            const { downloadURL, filePath } = await uploadFile(finalFile, `items/${Date.now()}_foto.jpg`, (progress) => {
                document.getElementById('image-upload-progress-bar').style.width = progress + '%';
                document.getElementById('image-upload-progress-text').textContent = Math.round(progress) + '%';
            });
            data.imageUrl = downloadURL;
            data.imagePath = filePath;

            if (id && selectedItemData && selectedItemData.imagePath) {
                try { await deleteObject(ref(storage, selectedItemData.imagePath)); } catch (e) { console.warn("No se pudo borrar anterior"); }
            }
        } else if (id && selectedItemData) {
            if (selectedItemData.imageUrl) data.imageUrl = selectedItemData.imageUrl;
            if (selectedItemData.imagePath) data.imagePath = selectedItemData.imagePath;
        }

        const coll = collection(db, `artifacts/${appId}/public/data/items`);
        if (id) await setDoc(doc(coll, id), data, { merge: true });
        else await addDoc(coll, data);

        showToast('Guardado correctamente', 'success');
        // --- AUDITORÍA: GUARDAR EQUIPO ---
        const actionType = id ? "Editar" : "Crear";
        const details = id ? "Se actualizaron los datos del equipo." : "Ingreso de nuevo equipo.";
        // Nota: Si es nuevo, usamos 'PENDIENTE' porque el ID no está disponible fácil en esta estructura
        logAuditAction(actionType, details, id || "NUEVO_ITEM", data.name);
        closeItemModal();

    } catch (e) {
        console.error(e);
        showToast("Error al guardar: " + e.message, 'error');
    } finally {
        setButtonLoading(submitBtn, false, 'Guardar');
        document.getElementById('image-upload-progress-container').classList.add('hidden');
        imageFileToUpload = null;
        if (imageInput) imageInput.value = '';
    }
}

async function executeSaveReport() {
    if (!selectedItemId) return;
    const submitBtn = document.getElementById('submit-report-btn');
    setButtonLoading(submitBtn, true, 'Guardar Informe');

    const reportData = {
        reportType: document.getElementById('report-type').value,
        reportDate: document.getElementById('report-date').value,
        technician: document.getElementById('report-technician').value,
        findings: document.getElementById('report-findings').value,
        createdAt: serverTimestamp(),
        attachments: []
    };

    // Subida de archivos (igual que antes)
    if (reportFilesToUpload.length > 0) {
        document.getElementById('upload-progress-container').classList.remove('hidden');
        try {
            const uploadPromises = reportFilesToUpload.map(file =>
                uploadFile(file, `reports/${selectedItemId}/${Date.now()}_${file.name}`)
            );
            const uploadedFiles = await Promise.all(uploadPromises);
            reportData.attachments = uploadedFiles.map(f => ({ name: f.name, url: f.downloadURL, path: f.filePath }));
        } catch (error) {
            console.error("Error subiendo archivos:", error);
            showToast(`Error al subir archivos: ${error.message}.`, 'error');
            setButtonLoading(submitBtn, false, 'Guardar Informe');
            document.getElementById('upload-progress-container').classList.add('hidden');
            return;
        }
    }

    try {
        // Guardamos el informe
        await addDoc(collection(db, `artifacts/${appId}/public/data/items/${selectedItemId}/reports`), reportData);

        // ===============================================================
        // 🧠 LÓGICA MAESTRA: CALENDARIO INTELIGENTE (CORREGIDA)
        // ===============================================================

        console.log("🔄 Procesando lógica de fechas...");

        // 1. Detectar intención (USAMOS reportData PARA MAYOR SEGURIDAD)
        // Convertimos a minúsculas para comparar sin errores
        const typeOfReport = reportData.reportType.toLowerCase();

        // 2. Configurar variables
        const isPipette = selectedItemData.type === 'pipettes';
        const dateField = isPipette ? 'lastCalibration' : 'lastMaintenance';
        const nextDateField = isPipette ? 'nextCalibration' : 'nextMaintenance';

        // 3. Objeto base
        let updates = {
            status: 'Operativo',
            hasOpenTicket: false
        };

        // 4. DECISIÓN DE FECHAS (Aquí estaba el error antes)
        // Ahora detectamos si la palabra "preventivo" está en CUALQUIER parte del texto
        if (typeOfReport.includes('preventivo') || typeOfReport.includes('calibraci')) {
            console.log(`📅 Preventivo detectado: Actualizando ${dateField}...`);

            // A. Actualizamos la "Última Vez"
            updates[dateField] = reportData.reportDate;

            // B. Calculamos la "Próxima Vez"
            if (selectedItemData && selectedItemData.frequency && selectedItemData.frequency !== 'No aplica') {
                const dateObj = new Date(reportData.reportDate + 'T00:00:00'); // Forzar hora local

                const freq = selectedItemData.frequency.toLowerCase().trim();
                let addedMonths = 0;

                if (freq.includes('semestral')) addedMonths = 6;
                else if (freq.includes('trimestral')) addedMonths = 3;
                else if (freq.includes('mensual')) addedMonths = 1;
                else if (freq.includes('anual')) addedMonths = 12;

                if (addedMonths > 0) {
                    dateObj.setMonth(dateObj.getMonth() + addedMonths);

                    // Formatear a YYYY-MM-DD
                    const y = dateObj.getFullYear();
                    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const d = String(dateObj.getDate()).padStart(2, '0');

                    updates[nextDateField] = `${y}-${m}-${d}`;
                    console.log(`✅ Próxima fecha calculada: ${updates[nextDateField]}`);
                }
            }

            // C. Refresco visual inmediato
            if (selectedItemData) {
                selectedItemData[dateField] = reportData.reportDate;
                // Si calculamos próxima fecha, actualízala visualmente también
                if (updates[nextDateField]) {
                    selectedItemData[nextDateField] = updates[nextDateField];
                }
            }

        } else {
            console.log("🛠️ Correctivo detectado: Se guarda informe pero NO se cambia el cronograma.");
        }

        // 5. GUARDAR EN DATABASE
        await updateDoc(doc(db, `artifacts/${appId}/public/data/items`, selectedItemId), updates);
        // 👇 AGREGA ESTO AQUÍ PARA QUE LA VENTANA SE CIERRE:
        showToast('Informe guardado correctamente.', 'success');
        closeReportModal();
    } catch (e) {
        console.error("Error guardando informe:", e);
        showToast(`Error al guardar informe: ${e.message}`, 'error');
    } finally {
        setButtonLoading(submitBtn, false, 'Guardar Informe');
        document.getElementById('upload-progress-container').classList.add('hidden');
    }
}

function exportToCSV() {
    let itemsToExport = [];
    const searchTerm = ui.searchInput.value.toLowerCase();

    itemsToExport = currentItems.filter(item =>
    (item.name.toLowerCase().includes(searchTerm) ||
        (item.room && item.room.toLowerCase().includes(searchTerm)) ||
        (item.model && item.model.toLowerCase().includes(searchTerm)) ||
        (item.serial && item.serial.toLowerCase().includes(searchTerm)) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm)))
    );

    if (itemsToExport.length === 0) {
        showToast("No hay datos para exportar en la vista actual.", 'info');
        return;
    }

    let csvContent = "";
    let headers;
    if (currentView === 'pipettes') {
        headers = ["Nombre", "N° Interno", "Sala", "Marca", "N/Serie", "Rango de Volumen", "Estado", "Última Calibración", "Próxima Calibración"];
    } else if (currentView === 'refrigerators') {
        headers = ["Nombre", "N° Interno", "Sala", "Marca", "Modelo", "Temperatura", "Estado", "Último Mantenimiento", "Próximo Mantenimiento"];
    } else {
        headers = ["Nombre", "N° Interno", "Sala", "Modelo", "N/Serie", "Estado", "Último Mantenimiento", "Próximo Mantenimiento"];
    }

    csvContent += headers.join(";") + "\r\n";
    const clean = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;

    itemsToExport.forEach(item => {
        let row;
        if (item.type === 'pipettes') {
            row = [clean(item.name), clean(item.internalId), clean(item.room), clean(item.brand), clean(item.serial), clean(item.volume), clean(item.status), clean(item.lastCalibration), clean(item.nextCalibration)].join(";");
        } else if (item.type === 'refrigerators') {
            row = [clean(item.name), clean(item.internalId), clean(item.room), clean(item.brand), clean(item.model), clean(item.temperature), clean(item.status), clean(item.lastMaintenance), clean(item.nextMaintenance)].join(";");
        } else {
            row = [clean(item.name), clean(item.internalId), clean(item.room), clean(item.model), clean(item.serial), clean(item.status), clean(item.lastMaintenance), clean(item.nextMaintenance)].join(";");
        }
        csvContent += row + "\r\n";
    });

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const filename = `inventario_${currentView}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// --- MODAL DE AVANZAR (AGREGAR PASO) ---
function openAddTicketStepModal(ticketId) {
    const idInput = document.getElementById('ticket-id-input');
    const form = document.getElementById('add-ticket-step-form');
    const dateInput = document.getElementById('ticket-step-date');
    const modal = document.getElementById('add-ticket-step-modal');

    if (idInput) idInput.value = ticketId;
    if (form) form.reset();
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}


function renderMaintenanceTicket(id, data) {
    const t = document.getElementById('maintenance-ticket-template').content.cloneNode(true);
    const lastEvent = data.events[data.events.length - 1];

    t.querySelector('.ticket-title').textContent = `Solicitud N° ${data.ticketId}`;
    const badge = t.querySelector('.ticket-type-badge');
    if (data.maintenanceType) {
        badge.textContent = data.maintenanceType;
        badge.classList.remove('hidden');
        if (data.maintenanceType === 'Preventivo') {
            badge.classList.add('bg-sky-500/20', 'text-sky-300');
        } else if (data.maintenanceType === 'Correctivo') {
            badge.classList.add('bg-orange-500/20', 'text-orange-300');
        }
    }

    const statusSpan = t.querySelector('.ticket-status');
    statusSpan.textContent = lastEvent.status;
    if (data.status === 'Cerrada') {
        statusSpan.classList.add('text-green-400');
    } else {
        statusSpan.classList.add('text-blue-400');
    }

    const historyContainer = t.querySelector('.ticket-history-container');
    const toggleBtn = t.querySelector('.toggle-ticket-history-btn');
    toggleBtn.addEventListener('click', () => {
        historyContainer.classList.toggle('hidden');
        toggleBtn.textContent = historyContainer.classList.contains('hidden') ? 'Ver Historial' : 'Ocultar Historial';
    });

    const timeline = t.querySelector('.ticket-timeline');
    timeline.innerHTML = '';
    [...data.events].reverse().forEach(event => {
        const eventTemplate = document.getElementById('timeline-item-template').content.cloneNode(true);
        eventTemplate.querySelector('.timeline-status').textContent = event.status;
        eventTemplate.querySelector('.timeline-date').textContent = formatDate(event.date);

        const notesEl = eventTemplate.querySelector('.timeline-notes');
        if (event.notes && event.notes.trim() !== '') {
            notesEl.textContent = event.notes;
        } else {
            notesEl.style.display = 'none';
        }

        const icon = eventTemplate.querySelector('i');
        if (event.status.includes('Realizada') || event.status.includes('baja')) {
            icon.className = 'fas fa-check-circle text-green-400';
        } else {
            icon.className = 'fas fa-circle text-blue-400';
        }
        timeline.appendChild(eventTemplate);
    });

    t.querySelector('.add-ticket-step-btn').addEventListener('click', () => openAddTicketStepModal(id));
    t.querySelector('.delete-ticket-btn').addEventListener('click', () => {
        openPasswordModal(() => {
            showConfirmModal('Eliminar Ticket', `¿Estás seguro de que quieres eliminar el ticket de solicitud N° ${data.ticketId}?`, () => deleteMaintenanceTicket(id));
        });
    });

    ui.maintenanceTicketsList.appendChild(t);
}

async function saveTicketStep(event) {
    event.preventDefault();
    const ticketId = document.getElementById('ticket-id-input').value;

    // 1. REFERENCIAS (Las definimos una sola vez aquí arriba)
    const ticketRef = doc(db, `artifacts/${appId}/public/data/items/${selectedItemId}/maintenanceTickets`, ticketId);
    const itemRef = doc(db, `artifacts/${appId}/public/data/items`, selectedItemId); // <--- AQUÍ ESTÁ LA MAGIA

    // Datos del formulario
    const newEvent = {
        status: document.getElementById('ticket-step-status').value,
        date: document.getElementById('ticket-step-date').value,
        notes: document.getElementById('ticket-step-notes').value.trim()
    };

    const finalStatus = ['Mantención Realizada', 'Equipo dado de baja'];
    const isClosed = finalStatus.includes(newEvent.status);

    try {
        // 2. ACTUALIZAR EL TICKET (Historial)
        await updateDoc(ticketRef, {
            events: arrayUnion(newEvent),
            status: isClosed ? 'Cerrada' : 'Abierta'
        });

        // 3. PREPARAR ACTUALIZACIÓN DEL EQUIPO
        // En lugar de llamar a updateDoc muchas veces, llenamos este objeto
        let itemUpdates = null;

        // CASO A: Mantención Terminada
        if (newEvent.status === 'Mantención Realizada') {
            console.log("✅ Mantenimiento completado.");
            const dateField = selectedItemData.type === 'pipettes' ? 'lastCalibration' : 'lastMaintenance';

            itemUpdates = {
                [dateField]: newEvent.date,
                status: 'Operativo',
                hasOpenTicket: false
            };
        }
        // CASO B: Equipo dado de baja
        else if (newEvent.status === 'Equipo dado de baja') {
            console.log("⚠️ Equipo dado de baja.");
            itemUpdates = {
                status: 'Fuera de Servicio',
                hasOpenTicket: false
            };
        }
        // CASO C: Avance normal (Verificar si quedan otros tickets abiertos)
        else {
            // Buscamos si hay OTROS tickets abiertos
            const q = query(collection(db, `artifacts/${appId}/public/data/items/${selectedItemId}/maintenanceTickets`), where("status", "==", "Abierta"));
            const openTickets = await getDocs(q);

            // Si ya no quedan tickets abiertos, liberamos la bandera del equipo
            if (openTickets.empty) {
                itemUpdates = { hasOpenTicket: false };
            }
        }

        // 4. EJECUTAR ACTUALIZACIÓN DEL EQUIPO (UNA SOLA VEZ)
        if (itemUpdates) {
            await updateDoc(itemRef, itemUpdates);

            // Actualización visual inmediata
            if (selectedItemData) {
                Object.assign(selectedItemData, itemUpdates); // Mezcla los cambios en el objeto local
                // selectItem(selectedItemId, selectedItemData); // Descomenta si necesitas refrescar todo el panel
            }
        }

        // 5. Finalización
        logAuditAction("Mantenimiento", `Avance en solicitud: ${newEvent.status}`, selectedItemId, selectedItemData.name);
        showToast('Paso añadido correctamente.', 'success');
        ui.addTicketStepModal.classList.add('hidden');
        ui.addTicketStepModal.classList.remove('flex');

    } catch (e) {
        console.error("Error guardando paso:", e);
        showToast("Error al guardar el avance.", "error");
    }
}

async function deleteMaintenanceTicket(ticketId) {
    await deleteDoc(doc(db, `artifacts/${appId}/public/data/items/${selectedItemId}/maintenanceTickets`, ticketId));
    const q = query(collection(db, `artifacts/${appId}/public/data/items/${selectedItemId}/maintenanceTickets`), where("status", "==", "Abierta"));
    const openTickets = await getDocs(q);
    if (openTickets.empty) {
        await updateDoc(doc(db, `artifacts/${appId}/public/data/items`, selectedItemId), { hasOpenTicket: false });
    }
    showToast('Ticket de seguimiento eliminado.', 'success');
}

// =================================================================
// CARGA DE DATOS (VERSIÓN DESBLOQUEADA - SIN ÍNDICES COMPLEJOS)
// =================================================================
function loadDataForCurrentView() {
    console.log("Prueba - Entró a loadDataForCurrentView");
    
    if (itemsUnsubscribe) {
        itemsUnsubscribe();
    }

    ui.multiSelectBtn.classList.add('hidden');
    toggleSelectionMode(false);

    const itemsCollection = collection(db, `artifacts/${appId}/public/data/items`);
    let q;

    console.log(`🔄 Solicitando datos para: ${currentView}...`);

    switch (currentView) {
        case 'equipment':
            q = query(itemsCollection,
                where("isDeleted", "==", false),
                where("type", "==", "equipment"),
                where("category", "==", "inventory")
                // ❌ HE BORRADO LA LÍNEA DEL '!=' AQUÍ PARA QUE NO SE PEGUE
            );
            break;
        case 'pipettes':
            ui.multiSelectBtn.classList.remove('hidden');
            q = query(itemsCollection,
                where("isDeleted", "==", false),
                where("type", "==", "pipettes")
            );
            break;
        case 'pipette-maintenance':
            q = query(itemsCollection,
                where("isDeleted", "==", false),
                where("type", "==", "pipettes"),
                where("status", "==", "En Mantenimiento")
            );
            break;
        case 'refrigerators':
            q = query(itemsCollection,
                where("isDeleted", "==", false),
                where("type", "==", "refrigerators")
            );
            break;
        case 'testing':
            q = query(itemsCollection,
                where("isDeleted", "==", false),
                where("category", "==", "testing")
            );
            break;
        case 'maintenance':
            q = query(itemsCollection,
                where("isDeleted", "==", false),
                where("hasOpenTicket", "==", true)
            );
            break;
        case 'out-of-service':
            q = query(itemsCollection,
                where("isDeleted", "==", false),
                where("status", "==", "Fuera de Servicio")
            );
            break;
        default:
            console.warn("Vista desconocida:", currentView);
            currentItems = [];
            renderItemList();
            return;
    }

    itemsUnsubscribe = onSnapshot(q, snapshot => {
        console.log("✅ Datos recibidos de Firebase:", snapshot.size);

        // FILTRADO EN CLIENTE (Aquí aplicamos la lógica que quitamos de la query)
        let rawItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (currentView === 'equipment' || currentView === 'pipettes' || currentView === 'refrigerators') {
            // ✅ Filtramos visualmente los que están "Fuera de Servicio" AQUÍ
            currentItems = rawItems.filter(item => item.status !== 'Fuera de Servicio');
        } else {
            currentItems = rawItems;
        }

        // ==============================================================
        // 🚨 AGREGA ESTA LÍNEA EXACTA AQUÍ (EL PUENTE PARA EL ESCÁNER)
        window.datosGlobales = currentItems;   // <<< ¡ESTA ES LA CLAVE!
        // ==============================================================

        renderItemList();

        // Refrescar vista de detalles si está abierta
        if (!ui.detailsView.classList.contains('hidden') && selectedItemId) {
            if (!currentItems.some(item => item.id === selectedItemId)) {
                showDashboardView();
            }
        }
    }, (error) => {
        console.error("❌ Error recibiendo datos:", error);
        showToast("Error...", "error");
    }); // Cierre del onSnapshot
} // <---- ¿TIENES ESTA LLAVE FINAL?

// =================================================================
// RENDERIZADO INTELIGENTE (CORREGIDO PARA EVITAR PARPADEO)
// =================================================================
function renderItemList() {
    const list = ui.itemList;
    if (!list) return;

    const searchTerm = ui.searchInput ? ui.searchInput.value.toLowerCase().trim() : '';

    // ❌ BORRA O COMENTA TODO EL BLOQUE DEL "ESCUDO ANTI-PARPADEO" ❌
    // Si lo dejas, no verás los cambios cuando edites un equipo.
    /* if (searchTerm === '' && list.children.length > 0 && currentItems.length > 0) {
        ...
        return; 
    }
    */

    // Limpiamos la lista para redibujar con datos frescos
    ui.itemList.innerHTML = '';

    // 1. Filtramos los ítems según la búsqueda
    const filtered = currentItems.filter(item => {
        // Aseguramos que las propiedades existan antes de usar toLowerCase() para evitar errores
        const name = item.name ? item.name.toLowerCase() : '';
        const room = item.room ? item.room.toLowerCase() : '';
        const model = item.model ? item.model.toLowerCase() : '';
        const serial = item.serial ? item.serial.toLowerCase() : '';
        const brand = item.brand ? item.brand.toLowerCase() : '';
        const status = item.status ? item.status.toLowerCase() : '';

        return (name.includes(searchTerm) ||
            room.includes(searchTerm) ||
            model.includes(searchTerm) ||
            serial.includes(searchTerm) ||
            brand.includes(searchTerm) ||
            status.includes(searchTerm));
    });

    // 2. Si no hay resultados (Empty State)
    if (filtered.length === 0) {
        const isSearching = searchTerm.length > 0;
        const icon = isSearching ? 'fa-search' : 'fa-box-open';
        const title = isSearching ? 'Sin resultados' : 'Está un poco vacío aquí';
        const subtitle = isSearching
            ? `No encontramos coincidencias para "${ui.searchInput.value}".` // Quitamos escapeHtml si no tienes esa función definida
            : 'No hay ítems en esta categoría todavía.';

        ui.itemList.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-center px-4 animate-fade-in">
                <div class="bg-slate-700/50 p-6 rounded-full mb-4">
                    <i class="fas ${icon} text-4xl text-slate-500"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-700 mb-1">${title}</h3>
                <p class="text-sm text-slate-400 max-w-xs mx-auto">${subtitle}</p>
                 ${!isSearching ? `
                    <button onclick="document.getElementById('add-item-btn').click()" class="mt-4 text-sm text-blue-600 hover:underline font-medium">
                        + Agregar el primero
                    </button>
                ` : ''}
            </div>
        `;
        // Ajuste visual: si el fondo es oscuro, cambia text-slate-700 por text-white arriba
        return;
    }

    // 3. Renderizado (Lista Plana vs Agrupada)
    if (searchTerm.length > 0) {
        // MODO BÚSQUEDA
        const searchTitle = document.createElement('div');
        searchTitle.className = "p-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 mb-2 bg-slate-50";
        searchTitle.textContent = `Resultados de búsqueda (${filtered.length})`;
        ui.itemList.appendChild(searchTitle);

        filtered.forEach(item => {
            renderItem(item.id, item, ui.itemList);
        });

    } else {
        // MODO NORMAL (Por Salas)
        const byRoom = filtered.reduce((acc, item) => {
            const room = item.room || 'Sin Asignar';
            if (!acc[room]) acc[room] = [];
            acc[room].push(item);
            return acc;
        }, {});

        Object.keys(byRoom).sort((a, b) => a === 'Sin Asignar' ? 1 : b === 'Sin Asignar' ? -1 : a.localeCompare(b)).forEach(room => {
            // VERIFICACIÓN DE SEGURIDAD: ¿Existe el template?
            const template = document.getElementById('room-header-template');
            if (template) {
                const h = template.content.cloneNode(true);
                h.querySelector('h4').textContent = room;
                const itemContainer = h.querySelector('.item-container');
                byRoom[room].forEach(item => renderItem(item.id, item, itemContainer));
                ui.itemList.appendChild(h);
            } else {
                // Fallback si no hay template de headers (solo lista plana)
                byRoom[room].forEach(item => renderItem(item.id, item, ui.itemList));
            }
        });
    }

    // 4. Re-aplicar selección si existe
    if (selectedItemId) {
        const activeItem = document.querySelector(`.sidebar-item[data-id="${selectedItemId}"]`);
        if (activeItem) {
            activeItem.classList.add('selected');
            // Opcional: Hacer scroll hacia el ítem seleccionado si no se ve
            // activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        }
    }
}
function renderItem(id, data, container) {
    const t = document.getElementById('item-template').content.cloneNode(true);
    const e = t.querySelector('.sidebar-item');
    e.dataset.id = id;
    // ============================================================
    // NUEVO: Asignar borde de color según el estado
    // ============================================================
    if (currentView === 'testing') {
        e.classList.add('status-border-testing');
    } else {
        switch (data.status) {
            case 'Operativo':
                e.classList.add('status-border-operativo');
                break;
            case 'En Mantenimiento':
                e.classList.add('status-border-mantencion');
                break;
            case 'Fuera de Servicio':
                e.classList.add('status-border-falla');
                break;
            default:
                // Si no tiene estado definido, no ponemos borde o ponemos uno gris
                break;
        }
    }
    // ============================================================
    e.querySelector('h3').textContent = data.name;

    let subtext = '';
    if (data.type === 'equipment') {
        subtext = `${data.model || ''} - S/N: ${data.serial || ''}`;
    } else if (data.type === 'pipettes') {
        subtext = `${data.brand || ''} - ${data.volume || ''}`;
        if (data.serial) subtext += ` - S/N: ${data.serial}`;
    } else {
        subtext = `${data.brand || ''} - ${data.model || ''}`;
    }
    e.querySelector('p').textContent = subtext;

    e.querySelector('.item-thumbnail').src = data.imageUrl || 'https://placehold.co/40x40/334155/94a3b8?text=...';

    const dot = e.querySelector('.status-dot');
    const dateString = data.type === 'pipettes' ? data.nextCalibration : data.nextMaintenance;
    const maintenanceStatus = getMaintenanceStatus(dateString);
    dot.className = 'status-dot w-3 h-3 rounded-full ml-auto flex-shrink-0 ';

    if (data.status === 'Fuera de Servicio') {
        dot.classList.add('bg-red-500');
        dot.title = 'Fuera de Servicio';
    } else if (data.status === 'En Mantenimiento') {
        dot.classList.add('bg-blue-500');
        dot.title = 'En Mantenimiento';
    } else if (maintenanceStatus === 'ok') {
        dot.classList.add('bg-green-500');
        dot.title = 'Al día';
    } else if (maintenanceStatus === 'due-soon') {
        dot.classList.add('bg-yellow-400');
        dot.title = 'Próximo a vencer';
    } else {
        dot.classList.add('bg-red-500');
        dot.title = 'Vencido';
    }

    if (currentView === 'testing') {
        dot.classList.remove('bg-green-500', 'bg-yellow-400', 'bg-red-500', 'bg-blue-500');
        dot.classList.add('bg-indigo-500');
        dot.title = 'En Prueba';
    }

    // 1. Manejo del click en la tarjeta (Optimizado)
    e.onclick = (event) => {
        // Si el modo selección está activo (botón azul presionado)
        if (typeof selectionMode !== 'undefined' && selectionMode) {
            event.stopPropagation();
            const cb = e.querySelector('.selection-checkbox');
            if (cb && event.target !== cb) {
                cb.checked = !cb.checked;
                // Forzamos el evento de cambio para que la función toggle se entere
                togglePipetteSelection(id, e);
            }
        } else {
            // Si no hay modo selección, abrir el detalle normal
            selectItem(id, data);
        }
    };

    // 2. Configuración del Checkbox (Aseguramos que aparezca)
    const checkbox = e.querySelector('.selection-checkbox');
    if (checkbox) {
        // Es vital que el checkbox tenga el ID
        checkbox.value = id;

        // Verificamos condiciones para mostrarlo
        const isSelectionActive = (typeof selectionMode !== 'undefined' && selectionMode);
        const isPipette = (data.type === 'pipettes');
        const isNotMaintenance = (data.status !== 'En Mantenimiento');

        if (isSelectionActive && isPipette && isNotMaintenance) {
            checkbox.classList.remove('hidden');
            // Verificamos si ya estaba seleccionado en el Set global
            if (typeof selectedPipettes !== 'undefined') {
                checkbox.checked = selectedPipettes.has(id);
            }

            // Evento directo al checkbox
            checkbox.onclick = (event) => {
                event.stopPropagation();
                togglePipetteSelection(id, e);
            };
        } else {
            checkbox.classList.add('hidden');
            checkbox.checked = false;
        }
    }

    // 3. Agregar al contenedor final
    container.appendChild(t);
}

function selectItem(id, data) {
    const btnSaveBatch = document.getElementById('save-batch-report-btn');
    const btnFinBatch = document.getElementById('finalize-batch-btn');
    const noteBatch = document.getElementById('batch-details-notes');

    // Forzamos que se oculten, por si quedaron abiertos del lote anterior
    if (btnSaveBatch) btnSaveBatch.style.display = 'none';
    if (btnFinBatch) btnFinBatch.style.display = 'none';

    if (selectedItemId === id) return;
    selectedItemId = id;
    selectedItemData = data;

    // Resaltar en la lista lateral
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('selected'));
    const currentItemElement = document.querySelector(`[data-id="${id}"]`);
    if (currentItemElement) currentItemElement.classList.add('selected');

    // Actualizar cabecera de detalles
    document.getElementById('details-name').textContent = data.name;
    document.getElementById('details-image').src = data.imageUrl || 'https://placehold.co/128x128/1e293b/94a3b8?text=Sin+Foto';

    const s = document.getElementById('details-status');
    s.textContent = data.status;
    s.className = 'text-lg font-bold '; // Reset clases
    if (data.status === 'Operativo') s.classList.add('text-green-500');
    else if (data.status.includes('Mantenimiento')) s.classList.add('text-blue-500');
    else s.classList.add('text-red-500');

    // Botón "Convertir a Inventario" (Solo para Pruebas)
    if (ui.convertToInventoryBtn) {
        ui.convertToInventoryBtn.classList.toggle('hidden', data.category !== 'testing');
    }

    // =================================================================
    // LÓGICA DE BOTONES (COLORES DINÁMICOS + ESTADOS)
    // =================================================================

    // 1. Botón MANUALES
    const manualBtn = document.getElementById('manual-btn');
    manualBtn.onclick = () => openManualsModal(data.manuals || []);
    manualBtn.className = 'btn-action bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 p-2.5 rounded-lg shadow-sm transition-all'; 

    if (data.manuals && data.manuals.length > 0) {
        manualBtn.classList.remove('bg-white', 'text-slate-500');
        manualBtn.classList.add('bg-indigo-50', 'text-indigo-600', 'border-indigo-200', 'hover:bg-indigo-100');
        manualBtn.title = `Ver ${data.manuals.length} Manuales`;
    } else {
        manualBtn.title = "Subir Manual";
    }

    // 2. Botón INSERTOS
    const insertBtn = document.getElementById('inserts-btn');
    insertBtn.onclick = () => openInsertsModal(data.inserts || []);
    insertBtn.className = 'btn-action bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 p-2.5 rounded-lg shadow-sm transition-all';

    if (data.inserts && data.inserts.length > 0) {
        insertBtn.classList.remove('bg-white', 'text-slate-500');
        insertBtn.classList.add('bg-cyan-50', 'text-cyan-600', 'border-cyan-200', 'hover:bg-cyan-100');
        insertBtn.title = `Ver ${data.inserts.length} Insertos`;
    } else {
        insertBtn.title = "Subir Inserto";
    }

    // 3. Botón RECEPCIÓN
    const recepBtn = document.getElementById('reception-docs-btn');
    const recepDocs = data.receptionDocuments || [];
    recepBtn.onclick = () => openReceptionDocsModal(recepDocs);
    recepBtn.className = 'btn-action bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 p-2.5 rounded-lg shadow-sm transition-all';

    if (recepDocs.length > 0) {
        recepBtn.classList.remove('bg-white', 'text-slate-500');
        recepBtn.classList.add('bg-teal-50', 'text-teal-600', 'border-teal-200', 'hover:bg-teal-100');
        recepBtn.title = `Ver ${recepDocs.length} Docs de Recepción`;
    } else {
        recepBtn.title = "Subir Docs de Recepción";
    }

    // =================================================================

    // Configurar secciones inferiores
    const isMaintainable = data.type === 'equipment' || data.type === 'refrigerators' || data.type === 'pipettes';
    ui.maintenanceTrackingSection.style.display = isMaintainable ? 'block' : 'none';
    if (isMaintainable) loadMaintenanceTickets(id);

    // Banner de Lotes (Pipetas)
    const batchBanner = document.getElementById('batch-info-banner');
    if (data.type === 'pipettes' && data.batchId) {
        document.getElementById('batch-id-banner').textContent = `Lote ${data.batchId}`;
        document.getElementById('view-batch-btn').onclick = () => openBatchDetailsModal(data.batchId);
        batchBanner.classList.remove('hidden');
    } else {
        batchBanner.classList.add('hidden');
    }

    // Configurar Grid de Fechas
    ui.reportsSection.style.display = 'none';
    document.getElementById('details-date1-label').parentElement.style.display = 'none';
    document.getElementById('details-date2-label').parentElement.style.display = 'none';

    const subtextContainer = document.getElementById('details-subtext-container');
    subtextContainer.innerHTML = createDetailBadge('fa-map-marker-alt', 'Sala', data.room);

    if (data.ownership === 'Comodato') {
        subtextContainer.innerHTML += createDetailBadge('fa-handshake', 'Comodato', data.loanCompany);
    }

    // Lógica específica por tipo de equipo
    if (data.type === 'equipment') {
        ui.reportsSection.style.display = 'block';
        subtextContainer.innerHTML += createDetailBadge('fa-tag', 'Modelo', data.model);
        subtextContainer.innerHTML += createDetailBadge('fa-barcode', 'S/N', data.serial);
        if (data.category !== 'testing') {
            document.getElementById('details-date1-label').parentElement.style.display = 'block';
            document.getElementById('details-date2-label').parentElement.style.display = 'block';
            document.getElementById('details-date1-label').textContent = 'Último Mantenimiento';
            document.getElementById('details-date1-value').textContent = formatDate(data.lastMaintenance);
            document.getElementById('details-date2-label').textContent = 'Próximo Mantenimiento';
            document.getElementById('details-date2-value').textContent = formatDate(data.nextMaintenance);
        }
        loadReports(id);
    } else if (data.type === 'pipettes') {
        ui.reportsSection.style.display = 'block';
        loadReports(id);
        subtextContainer.innerHTML += createDetailBadge('fa-tag', 'Marca', data.brand);
        subtextContainer.innerHTML += createDetailBadge('fa-barcode', 'S/N', data.serial);
        subtextContainer.innerHTML += createDetailBadge('fa-ruler-vertical', 'Volumen', data.volume);

        document.getElementById('details-date1-label').parentElement.style.display = 'block';
        document.getElementById('details-date2-label').parentElement.style.display = 'block';
        document.getElementById('details-date1-label').textContent = 'Última Calibración';
        document.getElementById('details-date1-value').textContent = formatDate(data.lastCalibration);
        document.getElementById('details-date2-label').textContent = 'Próxima Calibración';
        document.getElementById('details-date2-value').textContent = formatDate(data.nextCalibration);
    } else if (data.type === 'refrigerators') {
        subtextContainer.innerHTML += createDetailBadge('fa-tag', 'Marca', data.brand);
        subtextContainer.innerHTML += createDetailBadge('fa-thermometer-half', 'Temp', data.temperature);

        document.getElementById('details-date1-label').parentElement.style.display = 'block';
        document.getElementById('details-date2-label').parentElement.style.display = 'block';
        document.getElementById('details-date1-label').textContent = 'Último Mantenimiento';
        document.getElementById('details-date1-value').textContent = formatDate(data.lastMaintenance);
        document.getElementById('details-date2-label').textContent = 'Próximo Mantenimiento';
        document.getElementById('details-date2-value').textContent = formatDate(data.nextMaintenance);
    }

    // Mostrar la vista
    showDetailsView();

    // ⬇️ SOLUCIÓN PARA MÓVILES (SIN USAR closeSidebar) ⬇️
    if (window.innerWidth < 768) {
        // Usamos la función oficial que ya maneja animaciones y seguridad
        if (window.closeSidebar) {
            window.closeSidebar();
        }
    }

    history.pushState({ itemId: id }, `Detalles ${data.name}`, `#item=${id}`);

    // Scroll al inicio para ver los detalles
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function openItemModal(mode, data = {}) {
    // 1. UX INSTANTÁNEA: Mostramos el modal de inmediato
    // Esto evita la sensación de "botón roto" si la base de datos tarda en responder
    ui.itemModal.classList.remove('hidden');
    ui.itemModal.classList.add('flex');

    // 2. Limpieza inicial
    ui.itemForm.reset();
    imageFileToUpload = null;
    
    // Ocultar barra de progreso de imagen si quedó abierta
    const progressContainer = document.getElementById('image-upload-progress-container');
    if (progressContainer) progressContainer.classList.add('hidden');

    // 3. Preparación de datos
    populateRoomsDropdown(data.room);
    const isEdit = mode === 'edit';

    // 4. VERIFICACIÓN DE "LOTE FANTASMA" (Lógica Asíncrona)
    // Se ejecuta mientras el usuario ya ve el modal abriéndose
    if (isEdit && data.type === 'pipettes' && data.batchId) {
        try {
            const batchRef = doc(db, `artifacts/${appId}/public/data/calibrationBatches`, data.batchId);
            const batchSnap = await getDoc(batchRef);

            if (!batchSnap.exists()) {
                console.warn("⚠️ Detectado lote fantasma. Limpiando referencia...");
                showToast('Limpiando referencia de lote inválida...', 'info');
                
                // Corregimos en la base de datos
                const itemRef = doc(db, `artifacts/${appId}/public/data/items`, selectedItemId);
                await updateDoc(itemRef, {
                    batchId: null,
                    status: 'Operativo'
                });

                // Corregimos los datos locales en memoria para que el formulario se llene bien
                data.batchId = null;
                data.status = 'Operativo';
                
                // Si existe selectedItemData, lo actualizamos también
                if (typeof selectedItemData !== 'undefined' && selectedItemData) {
                    selectedItemData.batchId = null;
                    selectedItemData.status = 'Operativo';
                }

                showToast('Pipeta liberada del lote eliminado.', 'success');
            }
        } catch (err) {
            console.error("Error al verificar lote huérfano:", err);
            // No bloqueamos el flujo, solo avisamos
            showToast('Advertencia: No se pudo verificar el estado del lote.', 'error');
        }
    }

    // 5. Configuración de la Vista (Campos a mostrar)
    let effectiveView = currentView;
    if (currentView === 'pipette-maintenance') {
        effectiveView = 'pipettes';
    }
    const isTesting = effectiveView === 'testing';

    let typeName;
    if (isTesting) { typeName = 'Equipo de Prueba'; }
    else { typeName = effectiveView === 'equipment' ? 'Equipo' : effectiveView === 'pipettes' ? 'Pipeta' : 'Refrigerador'; }

    // Títulos e imágenes
    document.getElementById('item-modal-title').textContent = `${isEdit ? 'Editar' : 'Añadir'} ${typeName}`;
    document.getElementById('item-id').value = isEdit ? selectedItemId : '';
    document.getElementById('item-type').value = effectiveView;
    ui.imagePreview.src = (isEdit && data.imageUrl) ? data.imageUrl : 'https://placehold.co/80x80/334155/475569?text=Foto';

    // Mostrar/Ocultar secciones según el tipo
    const generalFields = document.getElementById('general-fields');
    const pipetteFields = document.getElementById('pipette-fields');
    const fridgeFields = document.getElementById('refrigerator-fields');
    const maintFields = document.getElementById('maintenance-fields-container');

    if (generalFields) generalFields.style.display = (effectiveView === 'equipment' || isTesting) ? 'block' : 'none';
    if (pipetteFields) pipetteFields.style.display = effectiveView === 'pipettes' ? 'block' : 'none';
    if (fridgeFields) fridgeFields.style.display = effectiveView === 'refrigerators' ? 'block' : 'none';
    if (maintFields) maintFields.style.display = isTesting ? 'none' : 'block';

    // 6. Llenado de campos (Si es edición)
    if (isEdit) {
        document.getElementById('item-name').value = data.name || '';
        document.getElementById('item-room').value = data.room || '';
        document.getElementById('item-status').value = data.status || 'Operativo';
        document.getElementById('item-ownership').value = data.ownership || 'HCUCH';
        document.getElementById('item-loan-company').value = data.loanCompany || '';
        document.getElementById('item-internal-id').value = data.internalId || '';
        
        const freqSelect = document.getElementById('item-frequency');
        if (freqSelect) freqSelect.value = data.frequency || 'No aplica';

        // Campos específicos
        if (data.type === 'equipment' || data.category === 'testing') {
            document.getElementById('item-model').value = data.model || '';
            document.getElementById('item-serial').value = data.serial || '';
            if (!isTesting) {
                document.getElementById('item-last-maintenance').value = data.lastMaintenance || '';
                document.getElementById('item-next-maintenance').value = data.nextMaintenance || '';
            }
        } else if (data.type === 'pipettes') {
            document.getElementById('item-brand').value = data.brand || '';
            document.getElementById('pipette-serial').value = data.serial || '';
            document.getElementById('item-volume').value = data.volume || '';
            document.getElementById('item-last-calibration').value = data.lastCalibration || '';
            document.getElementById('item-next-calibration').value = data.nextCalibration || '';
        } else { // Refrigeradores
            document.getElementById('refrigerator-brand').value = data.brand || '';
            document.getElementById('refrigerator-model').value = data.model || '';
            document.getElementById('refrigerator-temperature').value = data.temperature || '';
            document.getElementById('refrigerator-last-maintenance').value = data.lastMaintenance || '';
            document.getElementById('refrigerator-next-maintenance').value = data.nextMaintenance || '';
        }

        // Bloqueo de estado si está en un lote
        const statusSelect = document.getElementById('item-status');
        if (data.type === 'pipettes' && data.batchId) {
            statusSelect.disabled = true;
            statusSelect.title = 'No se puede cambiar el estado, pertenece a un lote.';
            // Forzar visualmente el estado
            if (!data.status.includes('Mantenimiento')) {
                 statusSelect.value = data.status; 
            }
        } else {
            statusSelect.disabled = false;
            statusSelect.title = '';
        }

    } else {
        // MODO CREACIÓN: Asegurar que el selector de estado esté habilitado
        const statusSelect = document.getElementById('item-status');
        if (statusSelect) {
            statusSelect.disabled = false;
            statusSelect.title = '';
            statusSelect.value = 'Operativo';
        }
    }

    // Mostrar/Ocultar campo de empresa comodato
    const ownershipSelect = document.getElementById('item-ownership');
    const companyContainer = document.getElementById('item-loan-company-container');
    if (ownershipSelect && companyContainer) {
        companyContainer.classList.toggle('hidden', ownershipSelect.value !== 'Comodato');
    }
}

async function deleteSelectedItem() {
    if (!selectedItemId) return;

    if (selectedItemData.type === 'pipettes' && selectedItemData.batchId) {
        showToast('No se puede eliminar. La pipeta pertenece a un lote de calibración.', 'error');
        return;
    }

    try {
        await updateDoc(doc(db, `artifacts/${appId}/public/data/items`, selectedItemId), { isDeleted: true });

        showToast('Ítem enviado a la papelera.', 'success');
        // AUDITORÍA
        logAuditAction("Eliminar", "Equipo enviado a papelera", selectedItemId, selectedItemData.name);
        showDashboardView();
    } catch (error) {
        console.error("Error enviando a la papelera:", error);
        showToast('No se pudo eliminar el ítem.', 'error');
    }
}

async function convertToInventory() {
    if (!selectedItemId || !selectedItemData) {
        showToast('No hay ningún ítem seleccionado.', 'error');
        return;
    }

    if (selectedItemData.category !== 'testing') {
        showToast('Este ítem ya está en el inventario.', 'info');
        return;
    }

    const confirmCallback = async () => {
        try {
            const itemRef = doc(db, `artifacts/${appId}/public/data/items`, selectedItemId);
            await updateDoc(itemRef, {
                category: 'inventory'
            });

            showToast(`'${selectedItemData.name}' movido a Inventario.`, 'success');
            showDashboardView();

        } catch (error) {
            console.error("Error al convertir a inventario:", error);
            showToast('No se pudo mover el ítem.', 'error');
        }
    };

    showConfirmModal(
        'Convertir a Inventario',
        `¿Estás seguro de que quieres mover '${selectedItemData.name}' de "Pruebas" al inventario permanente?`,
        () => {
            openPasswordModal(confirmCallback);
        }
    );
}

function loadReports(itemId) {
    if (reportsUnsubscribe) reportsUnsubscribe();
    const q = query(collection(db, `artifacts/${appId}/public/data/items/${itemId}/reports`));
    reportsUnsubscribe = onSnapshot(q, snapshot => {
        allReports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        reportsCurrentPage = 1;
        renderPaginatedReports();
    });
}
function renderPaginatedReports() {
    const typeFilter = document.getElementById('report-type-filter').value;
    const dateFrom = document.getElementById('report-date-from').value;
    const dateTo = document.getElementById('report-date-to').value;

    // ❌ INCORRECTO: allReports.sort(...) modifica el original
    // ✅ CORRECTO: [...allReports].sort(...) crea una copia temporal
    let filteredReports = [...allReports].sort((a, b) => (b.reportDate > a.reportDate) ? 1 : -1);
 
    if (typeFilter !== 'all') {
        filteredReports = filteredReports.filter(r => r.reportType === typeFilter);
    }
    if (dateFrom) {
        filteredReports = filteredReports.filter(r => r.reportDate >= dateFrom);
    }
    if (dateTo) {
        filteredReports = filteredReports.filter(r => r.reportDate <= dateTo);
    }

    ui.reportsList.innerHTML = '';
    ui.noReportsView.classList.toggle('hidden', filteredReports.length > 0);
    const paginatedItems = filteredReports.slice((reportsCurrentPage - 1) * reportsItemsPerPage, reportsCurrentPage * reportsItemsPerPage);
    paginatedItems.forEach(report => renderReportItem(report.id, report));
    renderPaginationControls(ui.reportsPaginationControls, reportsCurrentPage, Math.ceil(filteredReports.length / reportsItemsPerPage), (page) => {
        reportsCurrentPage = page;
        renderPaginatedReports();
    });
}
function renderReportItem(id, data) {
    const t = document.getElementById('report-item-template').content.cloneNode(true);
    t.querySelector('.report-title-text').textContent = data.reportType || "Informe";
    const badge = t.querySelector('.report-type-badge');
    if (data.reportType) {
        badge.textContent = data.reportType.split(' ')[1];
        badge.classList.remove('hidden');
        if (data.reportType === 'Mantenimiento Preventivo') {
            badge.classList.add('bg-sky-500/20', 'text-sky-300');
        } else if (data.reportType === 'Mantenimiento Correctivo') {
            badge.classList.add('bg-orange-500/20', 'text-orange-300');
        }
    }

    t.querySelector('.report-date').textContent = formatDate(data.reportDate);
    t.querySelector('.report-technician').textContent = data.technician;
    t.querySelector('.report-findings').textContent = data.findings;

    const attachmentsContainer = t.querySelector('.report-attachments-list');
    if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach(file => {
            const link = document.createElement('a');
            link.href = file.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded-full inline-flex items-center gap-2";
            // Be careful: file.name can come from user data -> escape to avoid XSS
            link.innerHTML = `<i class="fas fa-file-alt"></i> ` + escapeHtml(file.name);
            attachmentsContainer.appendChild(link);
        });
    }

    const toggleBtn = t.querySelector('.toggle-details-btn');
    const findingsContainer = t.querySelector('.report-findings-container');
    toggleBtn.addEventListener('click', () => { findingsContainer.classList.toggle('hidden'); toggleBtn.textContent = findingsContainer.classList.contains('hidden') ? 'Ver detalles' : 'Ocultar detalles'; });
    t.querySelector('.delete-report-btn').addEventListener('click', e => { e.stopPropagation(); openPasswordModal(() => showConfirmModal('Eliminar Informe', 'Esta acción es permanente y también borrará el archivo adjunto.', () => deleteReport(id))); });
    ui.reportsList.appendChild(t);
}
function openManualsModal(manuals = []) {
    document.getElementById('add-manual-form').reset();
    manualFilesToUpload = [];
    document.getElementById('manual-files-list').innerHTML = '';
    const listEl = document.getElementById('manuals-list');
    listEl.innerHTML = '';
    if (manuals.length === 0) {
        listEl.innerHTML = '<p class="text-slate-400 text-center">No hay manuales para este ítem.</p>';
    } else {
        manuals.forEach(manual => {
            const t = document.getElementById('manual-item-template').content.cloneNode(true);
            t.querySelector('.manual-name').textContent = manual.name;
            t.querySelector('.view-manual-btn').href = manual.url;
            t.querySelector('.delete-manual-btn').addEventListener('click', () => {
                openPasswordModal(() => {
                    showConfirmModal('Eliminar Manual', `¿Estás seguro de que quieres eliminar el manual "${manual.name}"?`, () => deleteManual(manual));
                });
            });
            listEl.appendChild(t);
        });
    }
    ui.manualsModal.classList.remove('hidden');
    ui.manualsModal.classList.add('flex');
}
async function saveManual(event) {
    event.preventDefault();
    if (!selectedItemId || manualFilesToUpload.length === 0) {
        showToast("Por favor, selecciona al menos un archivo para subir.", 'error');
        return;
    }
    const submitBtn = document.getElementById('submit-manual-btn');
    setButtonLoading(submitBtn, true, 'Subir Manuales');

    try {
        const uploadPromises = manualFilesToUpload.map(file =>
            uploadFile(file, `manuals/${selectedItemId}/${Date.now()}_${file.name}`)
        );

        const uploadedFiles = await Promise.all(uploadPromises);

        const newManuals = uploadedFiles.map(file => ({
            name: file.name,
            url: file.downloadURL,
            path: file.filePath,
            createdAt: new Date()
        }));

        const itemRef = doc(db, `artifacts/${appId}/public/data/items`, selectedItemId);
        await updateDoc(itemRef, {
            manuals: arrayUnion(...newManuals)
        });

        showToast(`Se subieron ${uploadedFiles.length} manual(es) con éxito.`, 'success');

        document.getElementById('manuals-modal').classList.add('hidden');
        document.getElementById('manuals-modal').classList.remove('flex');

        const updatedSnap = await getDoc(itemRef);
        if (updatedSnap.exists()) {
            selectItem(selectedItemId, updatedSnap.data());
        }

    } catch (error) {
        console.error("Error subiendo archivos de manual:", error);
        showToast(`Error al subir manuales: ${error.message}.`, 'error');
    } finally {
        setButtonLoading(submitBtn, false, 'Subir Manuales');
    }
}
async function deleteManual(manual) {
    if (!selectedItemId) return;
    try {
        await deleteObject(ref(storage, manual.path));
        
        const itemRef = doc(db, `artifacts/${appId}/public/data/items`, selectedItemId);
        
        // 1. Borrar de base de datos
        await updateDoc(itemRef, { manuals: arrayRemove(manual) });
        
        showToast("Manual eliminado con éxito.", 'success');

        // 2. ACTUALIZACIÓN VISUAL (FALTABA ESTO)
        // Eliminamos el elemento del DOM directamente para que sea instantáneo
        const btn = document.activeElement; // El botón que se presionó (papelera)
        if(btn) {
             const row = btn.closest('div.flex'); // Ajustar selector según tu HTML
             if(row) row.remove();
        }

        // O opción más segura: Recargar todo el ítem para refrescar la lista
        const updatedSnap = await getDoc(itemRef);
        if (updatedSnap.exists()) {
            // Actualizamos la variable global y la vista de fondo
            selectItem(selectedItemId, updatedSnap.data());
            // Y refrescamos la lista del modal abierto
            openManualsModal(updatedSnap.data().manuals || []);
        }

    } catch (error) {
        console.error("Error eliminando manual:", error);
        showToast("No se pudo eliminar el manual.", 'error');
    }
}

function openInsertsModal(inserts = []) {
    document.getElementById('add-insert-form').reset();
    insertFilesToUpload = [];
    document.getElementById('insert-files-list').innerHTML = '';
    const listEl = document.getElementById('inserts-list');
    listEl.innerHTML = '';
    if (inserts.length === 0) {
        listEl.innerHTML = '<p class="text-slate-400 text-center">No hay insertos para este ítem.</p>';
    } else {
        inserts.forEach(insert => {
            const t = document.getElementById('manual-item-template').content.cloneNode(true);
            t.querySelector('.manual-name').textContent = insert.name;
            t.querySelector('.view-manual-btn').href = insert.url;
            t.querySelector('.delete-manual-btn').addEventListener('click', () => {
                openPasswordModal(() => {
                    showConfirmModal('Eliminar Inserto', `¿Estás seguro de que quieres eliminar el inserto "${insert.name}"?`, () => deleteInsert(insert));
                });
            });
            listEl.appendChild(t);
        });
    }
    ui.insertsModal.classList.remove('hidden');
    ui.insertsModal.classList.add('flex');
}

async function saveInsert(event) {
    event.preventDefault();
    if (!selectedItemId || insertFilesToUpload.length === 0) {
        showToast("Por favor, selecciona al menos un archivo para subir.", 'error');
        return;
    }
    const submitBtn = document.getElementById('submit-insert-btn');
    setButtonLoading(submitBtn, true, 'Subir Insertos');

    try {
        const uploadPromises = insertFilesToUpload.map(file =>
            uploadFile(file, `inserts/${selectedItemId}/${Date.now()}_${file.name}`)
        );

        const uploadedFiles = await Promise.all(uploadPromises);

        const newInserts = uploadedFiles.map(file => ({
            name: file.name,
            url: file.downloadURL,
            path: file.filePath,
            createdAt: new Date()
        }));

        const itemRef = doc(db, `artifacts/${appId}/public/data/items`, selectedItemId);
        await updateDoc(itemRef, {
            inserts: arrayUnion(...newInserts)
        });

        showToast(`Se subieron ${uploadedFiles.length} inserto(s) con éxito.`, 'success');

        document.getElementById('inserts-modal').classList.add('hidden');
        document.getElementById('inserts-modal').classList.remove('flex');

        const updatedSnap = await getDoc(itemRef);
        if (updatedSnap.exists()) {
            selectItem(selectedItemId, updatedSnap.data());
        }

    } catch (error) {
        console.error("Error subiendo archivos de inserto:", error);
        showToast(`Error al subir insertos: ${error.message}.`, 'error');
    } finally {
        setButtonLoading(submitBtn, false, 'Subir Insertos');
    }
}

async function deleteInsert(insert) {
    if (!selectedItemId) return;
    try {
        await deleteObject(ref(storage, insert.path));
        const itemRef = doc(db, `artifacts/${appId}/public/data/items`, selectedItemId);
        await updateDoc(itemRef, { inserts: arrayRemove(insert) });
        showToast("Inserto eliminado con éxito.", 'success');
    } catch (error) {
        console.error("Error eliminando inserto:", error);
        showToast("No se pudo eliminar el inserto.", 'error');
    }
}

function openReceptionDocsModal(docs = []) {
    document.getElementById('add-reception-doc-form').reset();

    const dateInput = document.getElementById('reception-doc-date');
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

    receptionFilesToUpload = [];
    document.getElementById('reception-files-list').innerHTML = '';
    const listEl = document.getElementById('reception-docs-list');
    listEl.innerHTML = '';

    if (!docs || docs.length === 0) {
        listEl.innerHTML = '<p class="text-slate-400 text-center">No hay documentos.</p>';
    } else {
        docs.forEach(docItem => {
            const t = document.getElementById('manual-item-template').content.cloneNode(true);

            const dateStr = docItem.docDate ? ` (${formatDate(docItem.docDate)})` : '';
            t.querySelector('.manual-name').textContent = docItem.name + dateStr;

            t.querySelector('.view-manual-btn').href = docItem.url;
            t.querySelector('.delete-manual-btn').addEventListener('click', () => {
                openPasswordModal(() => {
                    showConfirmModal('Eliminar Documento', `¿Borrar "${docItem.name}"?`, () => deleteReceptionDoc(docItem));
                });
            });
            listEl.appendChild(t);
        });
    }
    const modal = document.getElementById('reception-docs-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

async function saveReceptionDoc(event) {
    event.preventDefault();
    if (!selectedItemId || receptionFilesToUpload.length === 0) {
        showToast("Selecciona al menos un archivo.", 'error'); return;
    }

    const docDate = document.getElementById('reception-doc-date').value;
    if (!docDate) {
        showToast("Debes seleccionar una fecha.", 'error'); return;
    }

    const submitBtn = document.getElementById('submit-reception-doc-btn');
    setButtonLoading(submitBtn, true, 'Guardar Documentos');

    try {
        const uploadPromises = receptionFilesToUpload.map(file =>
            uploadFile(file, `reception/${selectedItemId}/${Date.now()}_${file.name}`)
        );
        const uploadedFiles = await Promise.all(uploadPromises);

        const newDocs = uploadedFiles.map(f => ({
            name: f.name,
            url: f.downloadURL,
            path: f.filePath,
            docDate: docDate,
            createdAt: new Date()
        }));

        const itemRef = doc(db, `artifacts/${appId}/public/data/items`, selectedItemId);
        await updateDoc(itemRef, { receptionDocuments: arrayUnion(...newDocs) });

        showToast(`Se guardaron ${uploadedFiles.length} documento(s).`, 'success');
        document.getElementById('reception-docs-modal').classList.add('hidden');
        document.getElementById('reception-docs-modal').classList.remove('flex');

        const updatedSnap = await getDoc(itemRef);
        if (updatedSnap.exists()) selectItem(selectedItemId, updatedSnap.data());

    } catch (error) {
        console.error("Error:", error); showToast("Error al guardar.", 'error');
    } finally { setButtonLoading(submitBtn, false, 'Guardar Documentos'); }
}

async function deleteReceptionDoc(docItem) {
    if (!selectedItemId) return;
    try {
        await deleteObject(ref(storage, docItem.path));
        const itemRef = doc(db, `artifacts/${appId}/public/data/items`, selectedItemId);
        await updateDoc(itemRef, { receptionDocuments: arrayRemove(docItem) });
        showToast("Documento eliminado.", 'success');
        document.getElementById('reception-docs-modal').classList.add('hidden');
        document.getElementById('reception-docs-modal').classList.remove('flex');
        const updatedSnap = await getDoc(itemRef);
        if (updatedSnap.exists()) selectItem(selectedItemId, updatedSnap.data());
    } catch (e) { console.error(e); showToast("Error al eliminar.", 'error'); }
}

// =================================================================
// FUNCIÓN PARA ACTIVAR/DESACTIVAR SELECCIÓN MÚLTIPLE
// =================================================================
function toggleSelectionMode(active) {
    // Actualizamos la variable global
    selectionMode = active;

    console.log("Modo selección cambiado a:", selectionMode); // Para ver en consola

    // 1. Cambiar visualmente el botón
    if (ui.multiSelectBtn) {
        if (selectionMode) {
            // ACTIVO: Azul oscuro, texto claro
            ui.multiSelectBtn.classList.add('bg-blue-600', 'text-white');
            ui.multiSelectBtn.classList.remove('bg-blue-50', 'text-blue-600');
        } else {
            // INACTIVO: Azul claro, texto azul
            ui.multiSelectBtn.classList.remove('bg-blue-600', 'text-white');
            ui.multiSelectBtn.classList.add('bg-blue-50', 'text-blue-600');
        }
    }

    // 2. Barra de acciones inferior
    if (ui.selectionActionBar) {
        if (selectionMode) {
            ui.selectionActionBar.classList.remove('hidden');
            ui.selectionActionBar.classList.add('flex');
        } else {
            ui.selectionActionBar.classList.add('hidden');
            ui.selectionActionBar.classList.remove('flex');
        }
    }

    // 3. Limpieza si apagamos
    if (!selectionMode) {
        if (typeof selectedPipettes !== 'undefined') selectedPipettes.clear();
        if (ui.selectionCount) ui.selectionCount.textContent = "0 seleccionadas";
    }

    // 4. Redibujar lista para mostrar/ocultar checkboxes
    // (Solo si estamos en la vista de inventario)
    if (currentView === 'equipment' && typeof renderItemList === 'function') {
        renderItemList();
    }
}

function togglePipetteSelection(id, element) {
    if (selectedPipettes.has(id)) {
        selectedPipettes.delete(id);
        element.classList.remove('selected');
    } else {
        selectedPipettes.add(id);
        element.classList.add('selected');
    }
    updateSelectionCount();
}

function updateSelectionCount() {
    ui.selectionCount.textContent = `${selectedPipettes.size} seleccionadas`;
}

function openCreateBatchModal() {
    if (selectedPipettes.size === 0) {
        showToast('Debes seleccionar al menos una pipeta.', 'info');
        return;
    }

    ui.batchPipetteList.innerHTML = '';
    let pipettesData = [];

    selectedPipettes.forEach(id => {
        const item = currentItems.find(i => i.id === id);
        if (item) {
            pipettesData.push(item);
            const div = document.createElement('div');
            div.className = 'p-2 bg-slate-700 rounded text-sm';
            div.textContent = `${item.name} (S/N: ${item.serial || 'N/A'})`;
            ui.batchPipetteList.appendChild(div);
        }
    });

    document.getElementById('batch-notes').value = '';
    ui.createBatchModal.classList.remove('hidden');
    ui.createBatchModal.classList.add('flex');
}

// =============================================================
// REEMPLAZO RONDA 4.1: GUARDAR LOTE (Tu versión mejorada + Global)
// =============================================================
window.saveCalibrationBatch = async function () {
    console.log("💾 Ejecutando creación de lote...");
    const submitBtn = document.getElementById('confirm-create-batch-btn');

    // Usamos tu helper si existe, si no, manual
    if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, true, 'Confirmar y Crear');
    else if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Guardando...'; }

    const notes = document.getElementById('batch-notes').value;

    // Aseguramos que selectedPipettes exista
    const pipetteIds = (typeof selectedPipettes !== 'undefined') ? Array.from(selectedPipettes) : [];

    if (pipetteIds.length === 0) {
        if (typeof showToast === 'function') showToast('No hay pipetas seleccionadas.', 'error');
        else alert('No hay pipetas seleccionadas.');

        if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, false, 'Confirmar y Crear');
        else if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Confirmar y Crear'; }
        return;
    }

    try {
        // 1. Crear el documento del lote
        const batchRef = collection(db, `artifacts/${appId}/public/data/calibrationBatches`);
        const batchDoc = await addDoc(batchRef, {
            createdAt: serverTimestamp(),
            status: 'Abierto',
            notes: notes,
            pipetteIds: pipetteIds,
            attachments: []
        });

        // 2. Actualizar las pipetas en lote (WriteBatch) -> ¡Muy buena práctica!
        const batch = writeBatch(db);
        pipetteIds.forEach(id => {
            const itemRef = doc(db, `artifacts/${appId}/public/data/items`, id);
            batch.update(itemRef, {
                status: 'En Mantenimiento',
                batchId: batchDoc.id
            });
        });
        await batch.commit();

        // 3. Éxito
        if (typeof showToast === 'function') showToast(`Lote ${batchDoc.id} creado con ${pipetteIds.length} pipetas.`, 'success');

        // Cerrar modal usando tu objeto ui o el DOM directo como respaldo
        if (typeof ui !== 'undefined' && ui.createBatchModal) {
            ui.createBatchModal.classList.add('hidden');
            ui.createBatchModal.classList.remove('flex');
        } else {
            const m = document.getElementById('create-batch-modal');
            if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
        }

        // Refrescar vista
        if (typeof toggleSelectionMode === 'function') toggleSelectionMode(false);
        if (typeof loadCalibrationBatches === 'function') loadCalibrationBatches();

    } catch (error) {
        console.error("Error creando lote:", error);
        if (typeof showToast === 'function') showToast('No se pudo crear el lote.', 'error');
        else alert('Error al crear lote: ' + error.message);
    } finally {
        if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, false, 'Confirmar y Crear');
        else if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Confirmar y Crear'; }
    }
};

function loadCalibrationBatches() {
    const q = query(collection(db, `artifacts/${appId}/public/data/calibrationBatches`), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
        ui.batchList.innerHTML = '';
        if (snapshot.empty) {
            ui.batchList.innerHTML = '<p class="text-slate-400 text-center">No hay lotes de calibración.</p>';
            return;
        }
        snapshot.forEach(doc => {
            renderBatchInSettings(doc.id, doc.data());
        });
    }, (error) => {
        console.error("Error cargando lotes: ", error);
        ui.batchList.innerHTML = '<p class="text-red-400 text-center">Error al cargar lotes.</p>';
    });
}

// =============================================================
// REEMPLAZO 1: RENDERIZADO DE LOTES (Corrección de botones)
// =============================================================
function renderBatchInSettings(id, data) {
    const list = document.getElementById('batch-list');
    if (!list) return;

    const div = document.createElement('div');
    div.className = 'flex justify-between items-center bg-slate-700 p-3 rounded-lg mb-2 shadow-sm border border-slate-600';

    // Formato de fecha y color
    const dateStr = data.createdAt && data.createdAt.seconds
        ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
        : 'Sin fecha';
    const statusColor = data.status === 'Abierto' ? 'text-blue-400 font-bold' : 'text-green-400 font-bold';

    div.innerHTML = `
        <div>
            <div class="flex items-center gap-2">
                <span class="text-white font-mono text-sm bg-slate-800 px-2 py-0.5 rounded">${id}</span>
                <span class="text-xs text-slate-400">(${dateStr})</span>
            </div>
            <p class="text-xs ${statusColor} mt-1">
                ${data.status ? data.status.toUpperCase() : 'ESTADO'} - ${data.pipetteIds ? data.pipetteIds.length : 0} pipetas
            </p>
        </div>
        <div class="flex gap-3">
            <button class="btn-ver-lote text-sky-400 hover:text-sky-200 transition-colors p-1" 
                    data-id="${id}" type="button" title="Ver Detalles">
                <i class="fas fa-eye fa-lg"></i>
            </button>
            
            <button class="btn-borrar-lote text-red-400 hover:text-red-200 transition-colors p-1" 
                    data-id="${id}" type="button" title="Eliminar Lote">
                <i class="fas fa-trash-alt fa-lg"></i>
            </button>
        </div>
    `;
    list.appendChild(div);
}

async function deleteBatch(batchId, deleteBtnId) {
    if (!batchId) return;

    showConfirmModal('Eliminar Lote', '¿Estás seguro de que quieres eliminar este lote? Esta acción es irreversible y eliminará los informes de calibración asociados a las pipetas.', async () => {

        openPasswordModal(async () => {
            const deleteBtn = document.getElementById(deleteBtnId);
            setButtonLoading(deleteBtn, true, '<i class="fas fa-trash-alt"></i>');

            try {
                const batchRef = doc(db, `artifacts/${appId}/public/data/calibrationBatches`, batchId);
                const batchSnap = await getDoc(batchRef);

                if (!batchSnap.exists()) {
                    showToast('Lote no encontrado.', 'error');
                    return;
                }
                const batchData = batchSnap.data();
                const pipetteIdsInBatch = batchData.pipetteIds || [];

                const batch = writeBatch(db);

                batch.delete(batchRef);

                for (const pipetteId of pipetteIdsInBatch) {
                    if (pipetteId && typeof pipetteId === 'string' && pipetteId.trim().length > 0) {
                        const cleanId = pipetteId.trim();

                        const reportsRef = collection(db, `artifacts/${appId}/public/data/items/${cleanId}/reports`);
                        const q = query(reportsRef,
                            where('reportType', '==', 'Calibración (Lote)'),
                            where('findings', '==', `Informe de calibración adjunto desde el Lote: ${batchId}`));

                        const querySnapshot = await getDocs(q);

                        querySnapshot.forEach(doc => {
                            batch.delete(doc.ref);
                        });
                    }
                }

                await batch.commit();

                showToast('Lote y sus informes asociados eliminados correctamente.', 'success');
                ui.batchDetailsModal.classList.add('hidden');
                ui.batchDetailsModal.classList.remove('flex');

            } catch (error) {
                console.error("Error eliminando lote:", error);
                showToast(`No se pudo eliminar el lote: ${error.message}`, 'error');
            } finally {
                if (deleteBtn) {
                    setButtonLoading(deleteBtn, false, '<i class="fas fa-trash-alt"></i>');
                }
            }
        });
    });
}

// =================================================================
// 1. NUEVA FUNCIÓN PARA ABRIR EL MODAL (Compatible con el nuevo diseño)
// =================================================================
window.openBatchDetailsModal = async function (batchId) {
    console.log("👁️ Abriendo lote:", batchId);
    window.currentBatchId = batchId; // Variable global vital

    const modal = document.getElementById('batch-details-modal');
    // Aseguramos que se muestre usando Flex para centrarlo
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    try {
        const docSnap = await getDoc(doc(db, `artifacts/${appId}/public/data/calibrationBatches`, batchId));
        if (!docSnap.exists()) {
            showToast('Error: Lote no encontrado', 'error');
            return;
        }

        const data = docSnap.data();
        const isFinalized = data.status === 'Finalizado';
        window.currentBatchStatus = data.status; // Guardamos estado

        // Llenar Textos
        document.getElementById('batch-details-title').textContent = `Detalles del Lote ${batchId.substring(0, 6)}...`;
        document.getElementById('batch-details-notes').value = data.notes || '';

        const statusEl = document.getElementById('batch-details-status');
        statusEl.textContent = data.status.toUpperCase();
        // Cambiar color según estado
        statusEl.className = isFinalized
            ? "text-sm font-bold text-green-400 mt-1"
            : "text-sm font-bold text-blue-400 mt-1";

        // Bloquear edición si está finalizado
        document.getElementById('batch-details-notes').disabled = isFinalized;
        document.getElementById('save-batch-report-btn').style.display = isFinalized ? 'none' : 'block';
        document.getElementById('finalize-batch-btn').style.display = isFinalized ? 'none' : 'block';
        document.getElementById('btn-delete-batch-modal').style.display = isFinalized ? 'none' : 'block';

        // Control del input de archivo
        const fileInputContainer = document.getElementById('batch-file-input')?.parentNode;
        if (fileInputContainer) fileInputContainer.style.display = isFinalized ? 'none' : 'flex';

        // Renderizar Pipetas
        const listEl = document.getElementById('batch-details-pipette-list');
        listEl.innerHTML = '<p class="text-slate-400 text-sm">Cargando...</p>';

        let htmlPipetas = '';
        if (data.pipetteIds && data.pipetteIds.length > 0) {
            for (const pid of data.pipetteIds) {
                // Buscamos info básica en memoria para no hacer mil lecturas
                const itemLocal = currentItems.find(i => i.id === pid);
                const nombre = itemLocal ? `${itemLocal.name} (${itemLocal.serial})` : pid;
                htmlPipetas += `
                    <div class="bg-slate-700/50 p-2 rounded border border-slate-600 text-xs text-slate-200 flex items-center gap-2">
                        <i class="fas fa-flask text-slate-400"></i> ${nombre}
                    </div>`;
            }
            listEl.innerHTML = htmlPipetas;
        } else {
            listEl.innerHTML = '<p class="text-slate-500 italic">Sin pipetas asignadas.</p>';
        }

        // Renderizar Archivos (Usamos función auxiliar)
        renderBatchAttachments(data.attachments || []);

    } catch (e) {
        console.error("Error abriendo lote", e);
        showToast("Error al cargar detalles del lote", "error");
    }
};

// =================================================================
// 2. FUNCIÓN AUXILIAR PARA MOSTRAR ARCHIVOS
// =================================================================
function renderBatchAttachments(attachments) {
    const container = document.getElementById('batch-attachments-list');
    if (!container) return;

    container.innerHTML = '';

    if (!attachments || attachments.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-xs italic">No hay archivos adjuntos.</p>';
        return;
    }

    attachments.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center bg-slate-700 px-3 py-2 rounded text-sm border border-slate-600 mb-1";

        // Botón de borrar (solo si no está finalizado)
        const deleteBtn = window.currentBatchStatus !== 'Finalizado'
            ? `<button onclick="removeBatchAttachment(${index})" class="text-red-400 hover:text-red-200 ml-3" title="Quitar archivo"><i class="fas fa-times"></i></button>`
            : '';

        div.innerHTML = `
            <a href="${file.url}" target="_blank" class="text-sky-400 hover:text-sky-300 truncate flex-1 flex items-center group">
                <i class="fas fa-file-pdf mr-2 group-hover:text-white transition-colors"></i> ${file.name}
            </a>
            ${deleteBtn}
        `;
        container.appendChild(div);
    });
}


// =============================================================
// REEMPLAZO: FINALIZAR LOTE (CON SEMÁFORO ANTI-DUPLICADOS)
// =============================================================
window.finalizeBatch = async function () {
    // 🚦 1. EL SEMÁFORO: Si ya está trabajando, no deja pasar otra vez.
    if (window.isBatchProcessing) return;
    window.isBatchProcessing = true; // Ponemos la luz roja

    const batchId = window.currentBatchId;
    if (!batchId) {
        alert("Error: No se identificó el lote.");
        window.isBatchProcessing = false; // Luz verde si hay error
        return;
    }

    // Confirmación
    if (!confirm("⚠️ ¿Finalizar Lote?\n\nSe crearán los reportes y se cerrará el lote.\nEsta acción es irreversible.")) {
        window.isBatchProcessing = false; // Luz verde si te arrepientes
        return;
    }

    const submitBtn = document.getElementById('finalize-batch-btn');
    // Deshabilitamos el botón visualmente para que se vea gris
    if (submitBtn) submitBtn.disabled = true;
    if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, true, 'Finalizando...');

    try {
        const batchRef = doc(db, `artifacts/${appId}/public/data/calibrationBatches`, batchId);
        const batchSnap = await getDoc(batchRef);

        if (!batchSnap.exists()) throw new Error('El lote ya no existe.');
        if (batchSnap.data().status === 'Finalizado') throw new Error('Este lote ya fue finalizado.');

        const batchData = batchSnap.data();
        const batchAttachments = batchData.attachments || [];
        const today = new Date().toISOString().slice(0, 10);
        const batchWrite = writeBatch(db);

        // LÓGICA DE ACTUALIZACIÓN (Evitamos duplicados usando Set)
        if (batchData.pipetteIds && Array.isArray(batchData.pipetteIds)) {
            const uniqueIds = [...new Set(batchData.pipetteIds)]; // Elimina IDs repetidas si las hubiera

            uniqueIds.forEach(cleanId => {
                if (cleanId) {
                    const itemRef = doc(db, `artifacts/${appId}/public/data/items`, cleanId);

                    // A. Actualizar Pipeta a Operativo
                    batchWrite.update(itemRef, {
                        status: 'Operativo',
                        batchId: null,
                        lastCalibration: today
                    });

                    // B. Crear UN SOLO Reporte
                    const reportRef = doc(collection(db, `artifacts/${appId}/public/data/items/${cleanId}/reports`));
                    batchWrite.set(reportRef, {
                        reportType: 'Calibración (Lote)',
                        reportDate: today,
                        technician: 'Sistema de Lotes',
                        findings: `Calibración finalizada desde Lote: ${batchId}`,
                        createdAt: serverTimestamp(),
                        attachments: batchAttachments
                    });
                }
            });
        }

        // C. Cerrar Lote
        batchWrite.update(batchRef, {
            status: 'Finalizado',
            finalizedAt: serverTimestamp()
        });

        await batchWrite.commit();

        if (typeof showToast === 'function') showToast('Lote finalizado correctamente.', 'success');

        // Cerrar modal
        if (typeof closeBatchDetailsModal === 'function') closeBatchDetailsModal();
        else {
            const m = document.getElementById('batch-details-modal');
            if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
        }

        if (typeof loadCalibrationBatches === 'function') loadCalibrationBatches();

    } catch (error) {
        console.error("❌ Error:", error);
        alert(error.message);
    } finally {
        // 🚦 2. ABRIR SEMÁFORO AL FINALIZAR
        window.isBatchProcessing = false;
        if (submitBtn) submitBtn.disabled = false;
        if (typeof setButtonLoading === 'function') setButtonLoading(submitBtn, false, 'Finalizar Lote');
    }
};

// =============================================================
// FUNCIÓN PRINCIPAL DEL DASHBOARD (El Jefe)
// =============================================================
window.renderDashboard = async function() {
    console.log("🖥️ Actualizando Dashboard...");

    // 1. Cargar Mantenimientos (Esta ya la tenías funcionando)
    if (typeof loadGlobalDashboard === 'function') {
        loadGlobalDashboard();
    }

    // 2. Dibujar el Resumen de Inventario (NUEVO DISEÑO)
    if (typeof renderDashboardInventorySummary === 'function') {
        renderDashboardInventorySummary();
    }

    // 3. Dibujar la Actividad Reciente (NUEVO DISEÑO)
    if (typeof renderDashboardRecentActivity === 'function') {
        renderDashboardRecentActivity();
    }
    
    // 4. Dibujar Vencimientos (Si la tienes)
    if (typeof renderDashboardExpirations === 'function') {
        renderDashboardExpirations();
    }
};

function showDashboardView() {
    ui.dashboardView.classList.remove('hidden');
    ui.detailsView.classList.add('hidden');
    // requestAnimationFrame(renderDashboard);
}
function showDetailsView() {
    ui.dashboardView.classList.add('hidden');
    ui.detailsView.classList.remove('hidden');
}
function closeItemModal() { ui.itemModal.classList.add('hidden'); ui.itemModal.classList.remove('flex'); }
function openReportModal() {
    ui.reportForm.reset();
    reportFilesToUpload = [];
    document.getElementById('report-files-list').innerHTML = '';
    document.getElementById('upload-progress-container').classList.add('hidden');
    document.getElementById('report-date').value = new Date().toISOString().slice(0, 10);
    ui.reportModal.classList.remove('hidden');
    ui.reportModal.classList.add('flex');
}
function closeReportModal() { ui.reportModal.classList.add('hidden'); ui.reportModal.classList.remove('flex'); }
let confirmCallback = null;
function showConfirmModal(title, message, callback) { document.getElementById('confirm-title').textContent = title; document.getElementById('confirm-message').textContent = message; confirmCallback = callback; ui.confirmModal.classList.remove('hidden'); ui.confirmModal.classList.add('flex'); }
function closeConfirmModal() { ui.confirmModal.classList.add('hidden'); ui.confirmModal.classList.remove('flex'); confirmCallback = null; }

async function deleteReport(reportId) {
    if (!selectedItemId || !reportId) return;

    // Esta ruta debe ser IGUAL a la que usas para guardar/crear los reportes
    const reportPath = `artifacts/inventario-gastro-hcuch/public/data/items/${selectedItemId}/reports`;
    const reportRef = doc(db, reportPath, reportId);

    try {
        const reportDoc = await getDoc(reportRef);
        if (reportDoc.exists() && reportDoc.data().attachments) {
            // ... tu lógica de borrado de archivos adjuntos ...
            // (Esta parte no toca el HTML, solo limpia el Storage)
        }
        await deleteDoc(reportRef);
        showToast("Informe eliminado con éxito.", 'success');
        
        // OPCIONAL: Si quieres que el HTML se actualice al instante,
        // podrías llamar aquí a la función que refresca la lista:
        // loadReports(selectedItemId); 

    } catch (e) {
        console.warn("Error técnico:", e);
        showToast("Error al eliminar.", 'error');
    }
}
function getMaintenanceStatus(dateStr) { if (!dateStr) return 'ok'; const today = new Date(); today.setHours(0, 0, 0, 0); const [y, m, d] = dateStr.split('-').map(Number); const mDate = new Date(y, m - 1, d); const diffDays = Math.ceil((mDate - today) / (1000 * 60 * 60 * 24)); if (diffDays < 0) return 'overdue'; if (diffDays <= 30) return 'due-soon'; return 'ok'; }
function formatDate(date) {
    if (!date) return 'N/A';
    let dateObj;
    if (date.toDate) { dateObj = date.toDate(); }
    else if (typeof date === 'string') { const dateString = date.length === 10 ? date + 'T00:00:00Z' : date; dateObj = new Date(dateString); }
    else if (date instanceof Date) { dateObj = date; }
    else { return 'N/A'; }
    if (isNaN(dateObj.getTime())) { return 'Fecha inválida'; }
    return dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

async function generateGeminiSummary() {
    if (!selectedItemId) { 
        showToast("Por favor, selecciona un equipo primero.", 'info'); 
        return; 
    }

    const geminiModal = document.getElementById('gemini-summary-modal');
    const summaryContent = document.getElementById('gemini-summary-content');
    
    geminiModal.classList.remove('hidden');
    geminiModal.classList.add('flex');
    summaryContent.innerHTML = 'Consultando historial y analizando con IA... 🧠';

    try {
        // 1. Definir la base de datos y la ruta PRIMERO
        // Prueba primero con esta ruta corta que es la estándar de Firebase
        const baseRoute = `items/${selectedItemId}`; 
        
        // 2. Obtener los datos del equipo desde tu estado global
        const item = selectedItemData; 

        // 3. Consultar los tickets de mantenimiento
        // IMPORTANTE: Asegúrate de que 'query', 'collection', 'db', 'orderBy' y 'getDocs' estén importados de Firebase
        const ticketsQuery = query(collection(db, `${baseRoute}/maintenanceTickets`), orderBy("createdAt", "desc"));
        const ticketsSnapshot = await getDocs(ticketsQuery);
        
        let historyText = `Equipo: ${item.name || 'Sin nombre'}\nEstado: ${item.status || 'No definido'}\n`;

        if (!ticketsSnapshot.empty) {
            historyText += "\nHistorial de Tickets Recientes:\n";
            ticketsSnapshot.forEach(doc => {
                const t = doc.data();
                historyText += `- Ticket ${t.ticketId || 'S/N'}: ${t.status} (${t.type || 'General'})\n`;
            });
        } else {
            historyText += "\nNo hay tickets de mantenimiento registrados aún.";
        }

        // 4. Preparar la llamada a la IA
        const apiKey = window.geminiApiKey;
        if (!apiKey) throw new Error("La API Key de Gemini no está configurada.");

        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{
                    text: `Eres un ingeniero biomédico experto del Hospital Clínico Universidad de Chile (HCUCH). 
                    Analiza el siguiente historial del equipo y entrega un resumen muy breve (máximo 3 puntos) 
                    con recomendaciones técnicas: ${historyText}`
                }]
            }]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Error API Gemini: ${response.statusText}`);

        const result = await response.json();
        
        if (result.candidates && result.candidates[0]) {
            const aiText = result.candidates[0].content.parts[0].text;
            
            // Formatear negritas y saltos de línea para el HTML
            let formattedText = aiText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formattedText = formattedText.replace(/\n/g, '<br>');

            summaryContent.innerHTML = `
                <div class="prose prose-sm text-slate-700 leading-relaxed">
                    ${formattedText}
                </div>
            `;
        } else {
            throw new Error("Gemini no pudo generar una respuesta clara.");
        }

    } catch (error) {
        console.error("Error completo capturado:", error);
        summaryContent.innerHTML = `
            <div class="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p class="text-red-600 text-sm font-medium">No se pudo completar el análisis:</p>
                <p class="text-red-500 text-xs mt-1">${error.message}</p>
            </div>
        `;
    }
}

async function checkMaintenanceAlerts() {
    const q = query(collection(db, `artifacts/${appId}/public/data/items`),
        where("isDeleted", "==", false)
    );

    const itemsSnapshot = await getDocs(q);
    const allItemsForAlerts = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    maintenanceAlerts = [];
    allItemsForAlerts.forEach(item => {
        const dateStr = item.type === 'pipettes' ? item.nextCalibration : item.nextMaintenance;
        if (dateStr) {
            const status = getMaintenanceStatus(dateStr);
            if (status === 'due-soon' || status === 'overdue') {
                maintenanceAlerts.push({ ...item, maintenanceStatus: status });
            }
        }
    });

    maintenanceAlerts.sort((a, b) => {
        const dateA = new Date(a.type === 'pipettes' ? a.nextCalibration : a.nextMaintenance);
        const dateB = new Date(b.type === 'pipettes' ? b.nextCalibration : b.nextMaintenance);
        return dateA - dateB;
    });

    ui.notificationDot.classList.toggle('hidden', maintenanceAlerts.length === 0);
}

function openNotificationsModal() { renderNotifications(); ui.notificationsModal.classList.remove('hidden'); ui.notificationsModal.classList.add('flex'); }
function closeNotificationsModal() { ui.notificationsModal.classList.add('hidden'); ui.notificationsModal.classList.remove('flex'); }

function renderNotifications() {
    ui.notificationsList.innerHTML = '';
    if (maintenanceAlerts.length === 0) { ui.notificationsList.innerHTML = '<p class="text-slate-400 text-center py-4">No hay alertas de mantenimiento.</p>'; return; }
    maintenanceAlerts.forEach(item => {
        const t = document.getElementById('notification-item-template').content.cloneNode(true);
        t.querySelector('.item-name').textContent = item.name;
        const dateString = item.type === 'pipettes' ? item.nextCalibration : item.nextMaintenance;
        t.querySelector('.item-details').textContent = `Sala: ${item.room || 'N/A'}`;
        const dueDateEl = t.querySelector('.item-due-date');
        dueDateEl.textContent = `Vence: ${formatDate(dateString)}`;
        const itemEl = t.querySelector('.notification-item');
        if (item.maintenanceStatus === 'overdue') {
            itemEl.classList.add('bg-red-500/10', 'border-l-4', 'border-red-500'); dueDateEl.classList.add('text-red-400');
        } else { itemEl.classList.add('bg-yellow-500/10', 'border-l-4', 'border-yellow-400'); dueDateEl.classList.add('text-yellow-400'); }
        itemEl.addEventListener('click', () => {
            if (currentView !== item.type) { const tabButton = document.querySelector(`button[data-view="${item.type}"]`); if (tabButton) tabButton.click(); }
            setTimeout(() => {
                const itemElementInList = document.querySelector(`.sidebar-item[data-id="${item.id}"]`);
                if (itemElementInList) {
                    itemElementInList.click(); itemElementInList.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else { selectItem(item.id, item); }
                closeNotificationsModal();
            }, 150);
        });
        ui.notificationsList.appendChild(t);
    });
}

function renderPaginationControls(container, currentPage, totalPages, pageChangeCallback) {
    container.innerHTML = '';
    if (totalPages <= 1) {
        container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');
    container.classList.add('flex');

    const prevButton = document.createElement('button');
    prevButton.innerHTML = `<i class="fas fa-arrow-left mr-2"></i> Anterior`;
    prevButton.disabled = currentPage === 1;
    prevButton.className = "px-4 py-2 bg-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed";
    prevButton.addEventListener('click', () => pageChangeCallback(currentPage - 1));

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

    const nextButton = document.createElement('button');
    nextButton.innerHTML = `Siguiente <i class="fas fa-arrow-right ml-2"></i>`;
    nextButton.disabled = currentPage === totalPages;
    nextButton.className = "px-4 py-2 bg-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed";
    nextButton.addEventListener('click', () => pageChangeCallback(currentPage + 1));

    container.append(prevButton, pageInfo, nextButton);
}

function showToast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('show'); }, 10);
    setTimeout(() => { toast.classList.remove('show'); toast.addEventListener('transitionend', () => toast.remove()); }, duration);
}

function setButtonLoading(button, isLoading, originalText) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Procesando...`;
    } else {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

// Helper: very small HTML escaper to avoid injecting raw values into innerHTML
function escapeHtml(unsafe) {
    if (unsafe == null) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function createDetailBadge(icon, label, value) {
    if (!value) return '';
    // Escape inputs before putting into markup
    const safeLabel = escapeHtml(label);
    const safeValue = escapeHtml(value);
    return `
        <span class="inline-flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full">
            <i class="fas ${icon} text-slate-400"></i>
            <span class="font-medium text-slate-300">${safeLabel}:</span>
            <span class="text-white">${safeValue}</span>
        </span>
    `;
}

async function loadRecentActivity() {
    try {
        const reportsQuery = query(collectionGroup(db, 'reports'));
        const ticketsQuery = query(collectionGroup(db, 'maintenanceTickets'));

        const [reportsSnapshot, ticketsSnapshot] = await Promise.all([
            getDocs(reportsQuery),
            getDocs(ticketsQuery)
        ]);

        let activities = [];

        reportsSnapshot.forEach(doc => {
            if (doc.data().createdAt) {
                activities.push({ ...doc.data(), type: 'report', id: doc.id, parentId: doc.ref.parent.parent.id });
            }
        });

        ticketsSnapshot.forEach(doc => {
            if (doc.data().createdAt) {
                activities.push({ ...doc.data(), type: 'ticket', id: doc.id, parentId: doc.ref.parent.parent.id });
            }
        });

        activities.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
        activities = activities.slice(0, 5);

        const listEl = document.getElementById('recent-activity-list');
        listEl.innerHTML = '';

        if (activities.length === 0) {
            listEl.innerHTML = '<p class="text-slate-400">No hay actividad reciente.</p>';
            return;
        }

        for (const activity of activities) {
            const itemDoc = await getDoc(doc(db, `artifacts/${appId}/public/data/items`, activity.parentId));
            if (!itemDoc.exists() || itemDoc.data().isDeleted) continue;

            const itemData = { id: itemDoc.id, ...itemDoc.data() };
            const itemName = itemData.name || 'Equipo Desconocido';

            const div = document.createElement('div');
            div.className = 'flex items-start gap-3 p-2 rounded-md hover:bg-slate-700/50 cursor-pointer';
            let icon, text, subtext;

            if (activity.type === 'report') {
                icon = 'fas fa-file-alt text-teal-400';
                text = `Nuevo informe: <span class="font-semibold">${activity.reportType}</span>`;
                subtext = `Para: ${itemName}`;
            } else {
                icon = 'fas fa-ticket-alt text-blue-400';
                text = `Nueva solicitud: <span class="font-semibold">${activity.maintenanceType}</span>`;
                subtext = `Para: ${itemName}`;
            }
            div.innerHTML = `
                <i class="${icon} mt-1"></i>
                <div>
                    <p class="text-sm">${text}</p>
                    <p class="text-xs text-slate-400">${subtext} - ${formatDate(activity.createdAt)}</p>
                </div>
            `;

            div.addEventListener('click', () => {
                if (currentView !== itemData.type) {
                    const tabButton = document.querySelector(`button[data-view="${itemData.type}"]`);
                    if (tabButton) tabButton.click();
                }

                setTimeout(() => {
                    const itemElementInList = document.querySelector(`.sidebar-item[data-id="${itemData.id}"]`);
                    if (itemElementInList) {
                        itemElementInList.click();
                        itemElementInList.scrollIntoView({ behavior: 'smooth', block: 'center' });

                        setTimeout(() => {
                            if (activity.type === 'report') {
                                document.getElementById('reports-section').open = true;
                            } else {
                                document.getElementById('maintenance-tracking-section').open = true;
                            }
                        }, 200);

                    } else {
                        selectItem(itemData.id, itemData);
                    }
                }, 150);
            });

            listEl.appendChild(div);
        }

    } catch (error) {
        console.error("Error loading recent activity:", error);
        document.getElementById('recent-activity-list').innerHTML = '<p class="text-red-400">Error al cargar actividad.</p>';
    }
}

function updateSelectedFilesList(container, fileSourceArray) {
    container.innerHTML = '';
    fileSourceArray.forEach((file) => {
        const fileEl = document.createElement('div');
        fileEl.className = 'flex justify-between items-center bg-slate-700 p-2 rounded';
        fileEl.innerHTML = `<span class="truncate text-slate-300">${file.name}</span>`;

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = `&times;`;
        removeBtn.type = 'button';
        removeBtn.className = 'ml-2 text-red-400 hover:text-red-300 font-bold text-lg';

        removeBtn.onclick = (e) => {
            e.preventDefault();
            const fileIndex = fileSourceArray.indexOf(file);
            if (fileIndex > -1) {
                fileSourceArray.splice(fileIndex, 1);
            }
            updateSelectedFilesList(container, fileSourceArray);
        };

        fileEl.appendChild(removeBtn);
        container.appendChild(fileEl);
    });
}

function setupEventListeners() {
  

    // =========================================================
    // 2. LOGICA DE SELECCIÓN Y LOTES
    // =========================================================
    if (ui.multiSelectBtn) {
        ui.multiSelectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            selectionMode = !selectionMode;
            if (typeof toggleSelectionMode === 'function') {
                toggleSelectionMode(selectionMode);
            }
        });
    }

    // Conexión segura del botón "Crear Lote"
    const createBatchBtn = document.getElementById('create-batch-btn');
    if (createBatchBtn) {
        createBatchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof openCreateBatchModal === 'function') {
                openCreateBatchModal();
            }
        });
    }

    // =========================================================
    // 3. EVENTOS GLOBALES Y DE USUARIO
    // =========================================================
    window.addEventListener('popstate', (event) => {
        if (event.state === null || (event.state && event.state.itemId === undefined)) {
            showDashboardView();
            selectedItemId = null;
            selectedItemData = null;
            document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('selected'));
        }
    });

    document.getElementById('sign-out-btn').addEventListener('click', async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            showToast("No se pudo cerrar la sesión.", "error");
        }
    });

    // =========================================================
    // 4. NAVEGACIÓN POR PESTAÑAS
    // =========================================================
    ui.tabButtons.forEach(btn => btn.addEventListener('click', () => {
        currentView = btn.dataset.view;
        ui.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const typeNameMap = { equipment: 'Equipos', pipettes: 'Pipetas', 'pipette-maintenance': 'Pipetas en Mantención', refrigerators: 'Refrigeradores', maintenance: 'En Mantención', testing: 'Equipos de Prueba', 'out-of-service': 'Fuera de Servicio' };
        ui.sidebarTitle.textContent = typeNameMap[currentView];
        
        const canAddItem = currentView !== 'maintenance' && currentView !== 'out-of-service';
        ui.multiSelectBtn.classList.toggle('hidden', currentView !== 'pipettes');

        if (selectionMode && currentView !== 'pipettes') {
            toggleSelectionMode();
        }
        
        ui.addBtnText.parentElement.style.display = canAddItem ? 'flex' : 'none';
        
        showDashboardView();
        selectedItemId = null;
        selectedItemData = null;
        ui.searchInput.value = '';
        loadDataForCurrentView();
    }));

    // =========================================================
    // 5. BOTONES DE ACCIÓN (ESTÁTICOS - NO BORRAR)
    // =========================================================
    
    // Agregar ítem
    document.getElementById('add-item-btn').addEventListener('click', () => openItemModal('add'));
    
    // Exportar
    document.getElementById('export-data-btn').addEventListener('click', exportToCSV);
    
    // Configuración
    document.getElementById('settings-btn').addEventListener('click', () => { ui.settingsModal.classList.remove('hidden'); ui.settingsModal.classList.add('flex'); loadCalibrationBatches(); });
    document.getElementById('close-settings-modal').addEventListener('click', () => { ui.settingsModal.classList.add('hidden'); ui.settingsModal.classList.remove('flex'); });
    
    // Formularios varios
    document.getElementById('add-room-form').addEventListener('submit', addRoom);
    document.getElementById('change-password-form').addEventListener('submit', changePassword);
    document.getElementById('update-counter-form').addEventListener('submit', updateMaintenanceCounter);
    
    // Temas
    document.getElementById('update-theme-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newColor = document.getElementById('primary-color-picker').value;
        applyTheme(newColor);
        localStorage.setItem('appThemeColor', newColor);
        showToast("Tema guardado.", "success");
    });

    // Modal de ítems
    document.getElementById('cancel-item-modal').addEventListener('click', closeItemModal);
    ui.itemForm.addEventListener('submit', handleItemFormSubmit);
    ui.searchInput.addEventListener('input', renderItemList);
    
    // ✅ BOTÓN EDITAR (CRÍTICO: MANTENER)
    document.getElementById('edit-item-btn').addEventListener('click', async () => { 
        if (!selectedItemId) return; 
        const d = await getDoc(doc(db, `artifacts/${appId}/public/data/items`, selectedItemId)); 
        if (d.exists()) openItemModal('edit', d.data()); 
    });
    
    // Convertir a inventario
    ui.convertToInventoryBtn.addEventListener('click', convertToInventory);

    // ✅ BOTÓN ELIMINAR (CRÍTICO: MANTENER)
    document.getElementById('delete-item-btn').addEventListener('click', () => {
        const itemType = selectedItemData?.type;
        const typeName = itemType === 'equipment' ? 'Equipo' : itemType === 'pipettes' ? 'Pipeta' : 'Refrigerador';
        const title = `Eliminar ${typeName}`;
        const msg = `Esto enviará el ítem a la papelera. Podrás restaurarlo o eliminarlo permanentemente desde Configuración.`;

        openPasswordModal(() => {
            showConfirmModal(title, msg, deleteSelectedItem);
        });
    });

    // =========================================================
    // 6. REPORTES Y MANTENIMIENTO
    // =========================================================
    document.getElementById('add-report-btn').addEventListener('click', openReportModal);
    document.getElementById('cancel-report-modal').addEventListener('click', closeReportModal);
    document.getElementById('report-form').addEventListener('submit', (e) => { e.preventDefault(); openPasswordModal(executeSaveReport); });
    
    // Contraseñas y confirmaciones
    document.getElementById('password-form').addEventListener('submit', handlePasswordSubmit);
    document.getElementById('cancel-password-modal').addEventListener('click', closePasswordModal);
    document.getElementById('cancel-confirm-btn').addEventListener('click', closeConfirmModal);
    document.getElementById('confirm-action-btn').addEventListener('click', () => { if (typeof confirmCallback === 'function') { const action = confirmCallback; confirmCallback = null; action(); } closeConfirmModal(); });
    
    // Solicitud de Mantención (CRÍTICO: MANTENER)
    document.getElementById('generate-maintenance-request-btn').addEventListener('click', () => { ui.maintenanceTypeModal.classList.remove('hidden'); ui.maintenanceTypeModal.classList.add('flex'); });
    
    document.getElementById('preventive-maintenance-btn').addEventListener('click', () => generateMaintenanceRequest('Preventivo'));
    document.getElementById('corrective-maintenance-btn').addEventListener('click', () => generateMaintenanceRequest('Correctivo'));
    document.getElementById('cancel-maintenance-type-btn').addEventListener('click', () => { ui.maintenanceTypeModal.classList.add('hidden'); ui.maintenanceTypeModal.classList.remove('flex'); });
    
    // Copiar datos
    document.getElementById('close-copy-data-modal').addEventListener('click', () => { ui.copyDataModal.classList.add('hidden'); ui.copyDataModal.classList.remove('flex'); });
    document.getElementById('copy-data-btn').addEventListener('click', (e) => { const textarea = document.getElementById('copy-data-textarea'); textarea.select(); document.execCommand('copy'); e.target.textContent = '¡Copiado!'; setTimeout(() => { e.target.textContent = 'Copiar Datos'; }, 2000); });
    
    // Pasos de ticket
    document.getElementById('add-ticket-step-form').addEventListener('submit', saveTicketStep);
    document.getElementById('cancel-add-step-modal').addEventListener('click', () => { ui.addTicketStepModal.classList.add('hidden'); ui.addTicketStepModal.classList.remove('flex'); });
    
    // Manuales e Insertos
    document.getElementById('add-manual-form').addEventListener('submit', saveManual);
    document.getElementById('close-manuals-modal').addEventListener('click', () => { ui.manualsModal.classList.add('hidden'); ui.manualsModal.classList.remove('flex'); });
    document.getElementById('add-insert-form').addEventListener('submit', saveInsert);
    document.getElementById('close-inserts-modal').addEventListener('click', () => { ui.insertsModal.classList.add('hidden'); ui.insertsModal.classList.remove('flex'); });

    // =========================================================
    // 7. ARCHIVOS Y CÁMARA
    // =========================================================
    const receptionFileInput = document.getElementById('new-reception-file');
    if(receptionFileInput) {
        receptionFileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            const listContainer = document.getElementById('reception-files-list');
            if (!listContainer) return;
            files.forEach(newFile => {
                if (!receptionFilesToUpload.some(f => f.name === newFile.name && f.size === newFile.size)) {
                    receptionFilesToUpload.push(newFile);
                }
            });
            updateSelectedFilesList(listContainer, receptionFilesToUpload);
            e.target.value = '';
        });
        document.getElementById('reception-file-gallery-btn').addEventListener('click', () => { receptionFileInput.removeAttribute('capture'); receptionFileInput.click(); });
        document.getElementById('reception-file-camera-btn').addEventListener('click', () => { receptionFileInput.setAttribute('capture', 'environment'); receptionFileInput.click(); });
    }

    document.getElementById('add-reception-doc-form').addEventListener('submit', saveReceptionDoc);
    document.getElementById('close-reception-docs-modal').addEventListener('click', () => {
        document.getElementById('reception-docs-modal').classList.add('hidden');
        document.getElementById('reception-docs-modal').classList.remove('flex');
    });

    // Gemini Summary
    document.getElementById('gemini-summary-btn').addEventListener('click', generateGeminiSummary);
    document.getElementById('close-gemini-summary-modal').addEventListener('click', () => { ui.geminiSummaryModal.classList.add('hidden'); ui.geminiSummaryModal.classList.remove('flex'); });
    
    // Notificaciones
    ui.notificationsBtn.addEventListener('click', openNotificationsModal);
    document.getElementById('close-notifications-modal').addEventListener('click', closeNotificationsModal);
    
    // Selectores extra
    document.getElementById('item-ownership').addEventListener('change', (e) => {
        document.getElementById('item-loan-company-container').classList.toggle('hidden', e.target.value !== 'Comodato');
    });

    // Tarjetas dashboard
    document.getElementById('overdue-card').addEventListener('click', () => {
        const maintenanceTab = document.querySelector('button[data-view="maintenance"]');
        if (maintenanceTab) maintenanceTab.click();
    });
    document.getElementById('upcoming-card').addEventListener('click', () => {
        const maintenanceTab = document.querySelector('button[data-view="maintenance"]');
        if (maintenanceTab) maintenanceTab.click();
    });

    // Filtros de mantenimiento y reportes
    document.getElementById('maintenance-filter').addEventListener('change', renderPaginatedMaintenance);
    document.getElementById('maintenance-sort').addEventListener('change', renderPaginatedMaintenance);
    document.getElementById('report-type-filter').addEventListener('change', renderPaginatedReports);
    document.getElementById('report-date-from').addEventListener('change', renderPaginatedReports);
    document.getElementById('report-date-to').addEventListener('change', renderPaginatedReports);
    document.getElementById('clear-report-filters-btn').addEventListener('click', () => {
        document.getElementById('report-type-filter').value = 'all';
        document.getElementById('report-date-from').value = '';
        document.getElementById('report-date-to').value = '';
        renderPaginatedReports();
    });

    setupImageInputLogic();

    // Archivos de Manuales
    const manualFileInput = document.getElementById('new-manual-file');
    if(manualFileInput){
        manualFileInput.addEventListener('change', (e) => {
            const newFiles = e.target.files;
            const listContainer = document.getElementById('manual-files-list');
            if (!listContainer) return;
            Array.from(newFiles).forEach(newFile => {
                if (!manualFilesToUpload.some(f => f.name === newFile.name && f.size === newFile.size)) {
                    manualFilesToUpload.push(newFile);
                }
            });
            updateSelectedFilesList(listContainer, manualFilesToUpload);
            e.target.value = '';
        });
    }

    // =================================================================
    // LÓGICA DE INFORMES (RECORTE DE IMÁGENES SIEMPRE ACTIVO)
    // =================================================================
    const reportFileInput = document.getElementById('report-pdf');
    if(reportFileInput){
        reportFileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            const listContainer = document.getElementById('report-files-list');
            if (!listContainer) return;
            files.forEach(file => {
                // A. Si es IMAGEN -> Editor
                if (file.type.startsWith('image/')) {
                    const procesarRecorte = (blob) => {
                        const newFile = new File([blob], `doc_recortado_${Date.now()}.jpg`, { type: "image/jpeg" });
                        reportFilesToUpload.push(newFile);
                        updateSelectedFilesList(listContainer, reportFilesToUpload);
                    };
                    openCropModal(file, procesarRecorte);
                }
                // B. Si es PDF/DOC -> Directo
                else {
                    if (!reportFilesToUpload.some(f => f.name === file.name && f.size === file.size)) {
                        reportFilesToUpload.push(file);
                    }
                    updateSelectedFilesList(listContainer, reportFilesToUpload);
                }
            });
            e.target.value = '';
        });
        document.getElementById('report-file-gallery-btn').addEventListener('click', () => { reportFileInput.removeAttribute('capture'); reportFileInput.click(); });
        document.getElementById('report-file-camera-btn').addEventListener('click', () => { reportFileInput.setAttribute('capture', 'environment'); reportFileInput.click(); });
    }

    // Archivos de Insertos
    const insertFileInput = document.getElementById('new-insert-file');
    if(insertFileInput){
        insertFileInput.addEventListener('change', (e) => {
            const newFiles = e.target.files;
            const listContainer = document.getElementById('insert-files-list');
            if (!listContainer) return;
            Array.from(newFiles).forEach(newFile => {
                if (!insertFilesToUpload.some(f => f.name === newFile.name && f.size === newFile.size)) {
                    insertFilesToUpload.push(newFile);
                }
            });
            updateSelectedFilesList(listContainer, insertFilesToUpload);
            e.target.value = '';
        });
        document.getElementById('insert-file-gallery-btn').addEventListener('click', () => { insertFileInput.removeAttribute('capture'); insertFileInput.click(); });
        document.getElementById('insert-file-camera-btn').addEventListener('click', () => { insertFileInput.setAttribute('capture', 'environment'); insertFileInput.click(); });
    }

    // QR
    document.getElementById('generate-qr-btn').addEventListener('click', () => {
        const item = selectedItemData;
        if (item) {
            const qr = qrcode(0, 'L');
            qr.addData(selectedItemId);
            qr.make();
            document.getElementById('qr-code-container').innerHTML = qr.createImgTag(6, 8);
            document.getElementById('qr-item-name').textContent = item.name;
            const qrModal = document.getElementById('qr-modal');
            qrModal.classList.remove('hidden');
            qrModal.classList.add('flex');
        }
    });

    document.getElementById('close-qr-modal-btn').addEventListener('click', () => {
        const qrModal = document.getElementById('qr-modal');
        if (qrModal) {
            qrModal.classList.add('hidden');
            qrModal.classList.remove('flex');
        }
    });

    document.getElementById('print-qr-btn').addEventListener('click', () => {
        const itemName = document.getElementById('qr-item-name');
        const qrContainer = document.getElementById('qr-code-container');
        if (itemName && qrContainer) {
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Imprimir QR</title>');
            printWindow.document.write('<style>body { text-align: center; font-family: sans-serif; padding: 20px; } img { max-width: 100%; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(itemName.outerHTML);
            printWindow.document.write('<br>');
            printWindow.document.write(qrContainer.outerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 500);
        }
    });

    // Auditoría
    const btnViewLog = document.getElementById('view-audit-log-btn');
    if (btnViewLog) {
        btnViewLog.onclick = (e) => {
            e.preventDefault();
            openAuditLogModal();
        };
    }
    const closeAuditModalForce = () => {
        const modal = document.getElementById('audit-log-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            modal.style.display = 'none';
        }
    };
    const btnCloseLog = document.getElementById('close-audit-modal');
    if (btnCloseLog) btnCloseLog.onclick = closeAuditModalForce;

    const btnCloseLogBottom = document.getElementById('close-audit-btn-bottom');
    if (btnCloseLogBottom) btnCloseLogBottom.onclick = closeAuditModalForce;

} // FIN DE setupEventListeners

// =================================================================
// FUNCIÓN: CARGAR ROL DE USUARIO
// =================================================================
async function loadUserRole(uid) {
    console.log("   🔍 Buscando rol...");
    if (!uid) return 'guest';
    try {
        const userDocRef = doc(db, `users/${uid}`);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            return userDocSnap.data().role || 'user_lab';
        } else {
            return 'user_lab';
        }
    } catch (error) {
        console.error("   ❌ Error leyendo rol:", error);
        return 'user_lab';
    }
}

// =================================================================
// 1. FUNCIÓN DROPZONES (ARRASTRAR ARCHIVOS)
// =================================================================
function setupDropzones() {
    function configureDropzone(zoneId, onDropCallback) {
        const dropzone = document.getElementById(zoneId);
        if (!dropzone) return; // Si no existe, salimos sin error

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault(); e.stopPropagation();
            }, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => { dropzone.classList.add('dropzone-active'); }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => { dropzone.classList.remove('dropzone-active'); }, false);
        });

        dropzone.addEventListener('drop', onDropCallback, false);
    }

    // Helpers seguros
    const safeUpdate = (id, files) => {
        const container = document.getElementById(id);
        if (container && typeof updateSelectedFilesList === 'function') updateSelectedFilesList(container, files);
    };

    configureDropzone('manual-dropzone', (e) => {
        Array.from(e.dataTransfer.files).forEach(f => { if (!manualFilesToUpload.some(x => x.name === f.name)) manualFilesToUpload.push(f); });
        safeUpdate('manual-files-list', manualFilesToUpload);
    });
    configureDropzone('insert-dropzone', (e) => {
        Array.from(e.dataTransfer.files).forEach(f => { if (!insertFilesToUpload.some(x => x.name === f.name)) insertFilesToUpload.push(f); });
        safeUpdate('insert-files-list', insertFilesToUpload);
    });
    configureDropzone('report-dropzone', (e) => {
        Array.from(e.dataTransfer.files).forEach(f => { if (!reportFilesToUpload.some(x => x.name === f.name)) reportFilesToUpload.push(f); });
        safeUpdate('report-files-list', reportFilesToUpload);
    });
    configureDropzone('reception-dropzone', (e) => {
        Array.from(e.dataTransfer.files).forEach(f => { if (!receptionFilesToUpload.some(x => x.name === f.name)) receptionFilesToUpload.push(f); });
        safeUpdate('reception-files-list', receptionFilesToUpload);
    });
}

// =================================================================
// 2. LÓGICA DE FOTO DE EQUIPO (CONECTADA AL RECORTADOR)
// =================================================================
function setupImageInputLogic() {
    const inputImg = document.getElementById('item-image');
    const btnGallery = document.getElementById('item-image-gallery-btn');
    const btnCamera = document.getElementById('item-image-camera-btn');

    if (!inputImg || !btnGallery || !btnCamera) return;

    // Reset visual del input
    inputImg.classList.remove('hidden');
    inputImg.style.opacity = '0';
    inputImg.style.position = 'absolute';
    inputImg.style.zIndex = '-1';
    inputImg.style.width = '1px';
    inputImg.style.height = '1px';

    const newInput = inputImg.cloneNode(true);
    inputImg.parentNode.replaceChild(newInput, inputImg);

    newInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("📸 Foto equipo seleccionada. Abriendo editor...");
            openCropModal(file, (blob) => {
                imageFileToUpload = new File([blob], `equipo_crop_${Date.now()}.jpg`, { type: "image/jpeg" });
                const previewImg = document.getElementById('image-preview');
                if (previewImg) {
                    if (previewImg.src && previewImg.src.startsWith('blob:')) URL.revokeObjectURL(previewImg.src);
                    previewImg.src = URL.createObjectURL(blob);
                    previewImg.classList.remove('hidden');
                }
                if (typeof showToast === 'function') showToast("Foto lista.", "success");
            });
        }
        event.target.value = '';
    });

    btnGallery.onclick = (e) => { e.preventDefault(); newInput.removeAttribute('capture'); newInput.click(); };
    btnCamera.onclick = (e) => { e.preventDefault(); newInput.setAttribute('capture', 'environment'); newInput.click(); };
}

// =================================================================
// 3. HERRAMIENTA DE RECORTE (CROPPER)
// =================================================================
function injectCropperStyles() {
    if (document.getElementById('cropper-custom-styles')) return;
    const css = `.cropper-container img { -webkit-transform: translate3d(0, 0, 0); transform: translate3d(0, 0, 0); will-change: transform; } .cropper-container { touch-action: none; user-select: none; } .cropper-modal { background-color: #000; opacity: 0.8; } .cropper-view-box { outline: 2px solid #0ea5e9; } .cropper-line { background-color: #0ea5e9; } .cropper-point { background-color: #0ea5e9; width: 8px; height: 8px; }`;
    const style = document.createElement('style');
    style.id = 'cropper-custom-styles';
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
}

function openCropModal(file, onSaveCallback) {
    injectCropperStyles();
    const oldModal = document.getElementById('crop-modal');
    if (oldModal) oldModal.remove();

    const modalHTML = `
        <div id="crop-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; z-index: 2147483647; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <div style="background: #1e293b; padding: 15px; border-radius: 12px; width: 95%; max-width: 600px; height: 90vh; display: flex; flex-direction: column; position: relative;">
                <h2 style="color: white; text-align: center; margin-bottom: 10px; font-weight: bold;">Recortar</h2>
                <div style="flex: 1; background: #000; position: relative; border-radius: 8px; overflow: hidden;">
                    <img id="image-to-crop" style="display: block; max-width: 100%; opacity: 0;">
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 15px; gap: 10px;">
                    <button id="dynamic-cancel-btn" style="flex: 1; padding: 15px; background: #475569; color: white; border: none; border-radius: 8px; font-weight: bold;">Cancelar</button>
                    <button id="dynamic-confirm-btn" style="flex: 1; padding: 15px; background: #0ea5e9; color: white; border: none; border-radius: 8px; font-weight: bold;">Usar Foto</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const imageElement = document.getElementById('image-to-crop');
    const cancelBtn = document.getElementById('dynamic-cancel-btn');
    const confirmBtn = document.getElementById('dynamic-confirm-btn');
    let localCropper = null;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            // Redimensionar si es gigante (evita crash en iPhone)
            let width = img.width, height = img.height;
            const maxWidth = 2000;
            if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }

            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);

            imageElement.src = canvas.toDataURL('image/jpeg', 0.9);
            imageElement.onload = () => {
                localCropper = new Cropper(imageElement, {
                    viewMode: 1, dragMode: 'move', autoCropArea: 0.8, checkOrientation: false,
                    ready: function () { imageElement.style.opacity = 1; }
                });
            };
        };
    };

    cancelBtn.onclick = () => {
        if (localCropper) localCropper.destroy();
        document.getElementById('crop-modal').remove();
        const rInput = document.getElementById('report-pdf'); if (rInput) rInput.value = '';
        const iInput = document.getElementById('new-insert-file'); if (iInput) iInput.value = '';
    };

    confirmBtn.onclick = () => {
        if (!localCropper) return;
        confirmBtn.textContent = "Procesando...";
        setTimeout(() => {
            localCropper.getCroppedCanvas({ maxWidth: 2048, maxHeight: 2048, fillColor: '#fff' })
                .toBlob((blob) => {
                    if (onSaveCallback) onSaveCallback(blob);
                    if (localCropper) localCropper.destroy();
                    document.getElementById('crop-modal').remove();
                }, 'image/jpeg', 0.9);
        }, 50);
    };
}

// =================================================================
// 5. AUDITORÍA Y UTILIDADES (Sidebar eliminado de aquí)
// =================================================================
async function logAuditAction(action, details, itemId, itemName) {
    try {
        if (!auth.currentUser) return;
        const userEmail = auth.currentUser.email;
        // CORREGIDO: Ruta fija segura con tu ID
        await addDoc(collection(db, 'artifacts/958769620035/public/data/auditLogs'), {
            action, details, itemId: itemId || null, itemName: itemName || 'Desconocido',
            user: userEmail.split('@')[0], email: userEmail, createdAt: serverTimestamp()
        });
    } catch (e) { console.error("Error log:", e); }
}

async function openAuditLogModal() {
    if (!selectedItemId) {
        if (typeof showToast === 'function') showToast("Selecciona un equipo.", "info");
        return;
    }
    const old = document.getElementById('audit-log-dynamic'); if (old) old.remove();

    const modalHTML = `
        <div id="audit-log-dynamic" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; justify-content: center; align-items: center;">
            <div style="background: #1e293b; width: 95%; max-width: 600px; max-height: 80vh; border-radius: 12px; display: flex; flex-direction: column; border: 1px solid #334155;">
                <div style="padding: 16px; display: flex; justify-content: space-between;">
                    <h2 style="color: white; font-weight: bold;">Historial</h2>
                    <button onclick="document.getElementById('audit-log-dynamic').remove()" style="color: #94a3b8; background:none; border:none; font-size: 1.5rem;">&times;</button>
                </div>
                <div id="audit-dynamic-list" style="flex: 1; overflow-y: auto; padding: 16px; color:white;">Cargando...</div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const list = document.getElementById('audit-dynamic-list');
    const q = query(collection(db, 'artifacts/958769620035/public/data/auditLogs'), where("itemId", "==", selectedItemId), orderBy("createdAt", "desc"), limit(50));
    const snaps = await getDocs(q);

    list.innerHTML = '';
    if (snaps.empty) list.innerHTML = '<p class="text-center text-slate-400">Sin registros.</p>';

    snaps.forEach(doc => {
        const d = doc.data();
        const row = `<div style="background: #334155; margin-bottom: 8px; padding: 10px; border-radius: 6px; border-left: 3px solid #60a5fa;">
            <strong>${d.action}</strong> - <small>${d.createdAt?.toDate().toLocaleString()}</small><br>
            <span style="color:#cbd5e1">${d.details}</span> <br> <small style="color:#64748b">User: ${d.user}</small>
        </div>`;
        list.insertAdjacentHTML('beforeend', row);
    });
}


function adjustColorBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}
function applyTheme(hex) {
    if (!hex) return;
    document.documentElement.style.setProperty('--color-primary', hex);
    document.documentElement.style.setProperty('--color-primary-hover', adjustColorBrightness(hex, -20));
    const p = document.getElementById('primary-color-picker'); if (p) p.value = hex;
}
// ===============================================================
// 🖨️ SOLUCIÓN FINAL DE IMPRESIÓN (GLOBAL SCOPE)
// ===============================================================

console.log("🚀 Cargando módulo de impresión...");

// 1. Abrir Modal (Conectado a Window)
window.openPrintModal = function () {
    console.log("🟢 CLICK RECIBIDO: Abriendo modal...");
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) settingsModal.classList.add('hidden');

    const printModal = document.getElementById('print-selection-modal');
    if (printModal) {
        printModal.classList.remove('hidden');
        printModal.classList.add('flex');
    } else {
        alert("ERROR CRÍTICO: No se encuentra el modal 'print-selection-modal' en el HTML.");
    }
}

// 2. Cerrar Modal
window.closePrintModal = function () {
    const printModal = document.getElementById('print-selection-modal');
    if (printModal) {
        printModal.classList.add('hidden');
        printModal.classList.remove('flex');
    }
}

// 3. Buscar e Imprimir
window.fetchAndPrintByCategory = async function (categoryType) {
    console.log(`🔄 Solicitando impresión para: ${categoryType}`);
    window.closePrintModal(); // Cerrar menú

    if (typeof showToast === 'function') showToast('Generando etiquetas...', 'info');

    try {
        // Asegúrate que 'db' y 'appId' existen en este archivo
        if (!db || !appId) { throw new Error("Error de conexión: DB o AppID no definidos."); }

        const itemsRef = collection(db, `artifacts/${appId}/public/data/items`);
        const q = query(itemsRef, where("type", "==", categoryType), where("isDeleted", "==", false));

        const querySnapshot = await getDocs(q);
        const itemsToPrint = [];
        querySnapshot.forEach((doc) => itemsToPrint.push({ id: doc.id, ...doc.data() }));

        console.log(`✅ Items encontrados: ${itemsToPrint.length}`);

        if (itemsToPrint.length === 0) {
            alert("No hay equipos registrados en esta categoría.");
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) { alert("⚠️ Habilita las ventanas emergentes (pop-ups)."); return; }

        let htmlContent = `
        <html>
        <head>
            <title>Imprimir Etiquetas</title>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <style>
                body { font-family: sans-serif; padding: 20px; }
                .grid-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
                .label-card { border: 1px dashed #ccc; padding: 10px; text-align: center; height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; page-break-inside: avoid; }
                .item-name { font-size: 12px; font-weight: bold; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
                .item-id { font-size: 10px; color: #555; margin-top: 5px; }
                svg { max-width: 100%; height: 50px; }
                @media print { .no-print { display: none; } .label-card { border: 1px solid #eee; } }
            </style>
        </head>
        <body>
            <div class="no-print" style="text-align: center; margin-bottom: 20px;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #4F46E5; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">🖨️ IMPRIMIR AHORA</button>
            </div>
            <div class="grid-container">`;

        itemsToPrint.forEach(item => {
            const code = item.internalId || item.id;
            const name = item.name || 'Sin Nombre';
            htmlContent += `
                <div class="label-card">
                    <div class="item-name">${name.substring(0, 25)}</div>
                    <svg class="barcode" jsbarcode-format="CODE128" jsbarcode-value="${code}" jsbarcode-textmargin="0" jsbarcode-fontoptions="bold"></svg>
                    <div class="item-id">${code}</div>
                </div>`;
        });

        htmlContent += `</div>
            <script> window.onload = function() { try { JsBarcode(".barcode").init(); } catch(e) { console.error(e); } } </script>
        </body></html>`;

        printWindow.document.write(htmlContent);
        printWindow.document.close();

    } catch (error) {
        console.error("Error al imprimir:", error);
        alert("Error: " + error.message);
    }
};

console.log("🏁 JS FINALIZADO: Las funciones de impresión están listas en WINDOW.");
// =============================================================================
//  🔻 ZONA FINAL: GESTIÓN DE MANTENIMIENTO, LOTES E INICIALIZACIÓN 🔻
//  (Este bloque controla Tickets, Lotes y el arranque de la App)
// =============================================================================

// --- 1. VARIABLES GLOBALES DE MANTENIMIENTO ---
var allMaintenanceTickets = [];
var maintenanceItemsPerPage = 5;
var maintenanceCurrentPage = 1;
var isGeneratingRequest = false;

// --- 2. GENERAR SOLICITUD MANTENIMIENTO (Word + Firebase) ---
// --- 2. GENERAR SOLICITUD MANTENIMIENTO (Word + Firebase) ---
async function generateMaintenanceRequest(type) {
    if (!type) return;
    if (isGeneratingRequest) { console.warn("✋ Proceso en curso."); return; }

    isGeneratingRequest = true;

    try {
        if (!selectedItemId || !selectedItemData) throw new Error("No hay equipo seleccionado.");

        // 1. Generar número correlativo
        let nextRequestNumber;
        const settingsRef = doc(db, `artifacts/${appId}/public/data/settings`, 'config');

        await runTransaction(db, async (t) => {
            const docSnap = await t.get(settingsRef);
            let currentCount = 0;
            let currentYear = new Date().getFullYear();

            if (docSnap.exists()) {
                const d = docSnap.data();
                if (d.maintenanceRequestYear === currentYear) {
                    currentCount = d.maintenanceRequestCounter || 0;
                }
            }
            const newCount = currentCount + 1;
            t.set(settingsRef, { maintenanceRequestCounter: newCount, maintenanceRequestYear: currentYear }, { merge: true });
            nextRequestNumber = `${newCount} - ${currentYear}`;
        });

        // 2. Crear Ticket en Firebase
        const newTicket = {
            ticketId: nextRequestNumber,
            status: 'Abierta',
            maintenanceType: type,
            createdAt: serverTimestamp(),
            description: `Solicitud ${type} N° ${nextRequestNumber}`,
            events: [{
                status: 'Solicitud Generada',
                date: new Date().toISOString().split('T')[0],
                notes: 'Creada automáticamente'
            }]
        };

        await addDoc(collection(db, `artifacts/${appId}/public/data/items/${selectedItemId}/maintenanceTickets`), newTicket);
        await updateDoc(doc(db, `artifacts/${appId}/public/data/items`, selectedItemId), { hasOpenTicket: true });

        // 3. Descargar Word (Simulado)
        if (typeof wordTemplateUrl !== 'undefined') {
            const link = document.createElement('a');
            link.href = wordTemplateUrl;
            link.download = `SOLICITUD_${nextRequestNumber}.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // 4. UI: Mostrar Resumen para Copiar
        const typeModal = document.getElementById('maintenance-type-modal');
        if (typeModal) typeModal.classList.add('hidden');

        const copyModal = document.getElementById('copy-data-modal');
        if (copyModal) {
            copyModal.classList.remove('hidden');
            copyModal.classList.add('flex');

            const txt = document.getElementById('copy-data-textarea');
            if (txt) {
                txt.value = `SOLICITUD ${nextRequestNumber}
---------------------------------
EQUIPO: ${selectedItemData.name || 'N/A'}
MODELO: ${selectedItemData.model || 'No especificado'}
SERIE: ${selectedItemData.serial || 'No especificada'}
N° INVENTARIO: ${selectedItemData.internalId || 'Sin registro'}
UBICACIÓN: ${selectedItemData.room || 'No asignada'}
---------------------------------
TIPO: Mantenimiento ${type}
FECHA: ${new Date().toLocaleDateString('es-CL')}`;
            }
        }

        // 5. Recargar la lista de tickets
        if (typeof window.loadMaintenanceTickets === 'function') {
            await window.loadMaintenanceTickets();
        }

    } catch (error) {
        console.error("Error generando solicitud:", error);
        alert("Error: " + error.message);
    } finally {
        isGeneratingRequest = false;
    }
}

// =============================================================
// REEMPLAZO RONDA 3.1: CARGAR TICKETS (Conexión a Global)
// =============================================================
window.loadMaintenanceTickets = async function () {
    console.log("📥 Cargando tickets de mantenimiento...");

    // 1. Validar conexión
    if (!db || !appId || !selectedItemId) {
        console.warn("Faltan datos de conexión para cargar tickets.");
        return;
    }

    try {
        // 2. Referencia a la colección
        const ticketsRef = collection(db, `artifacts/${appId}/public/data/items/${selectedItemId}/maintenanceTickets`);
        const snapshot = await getDocs(ticketsRef);

        // 3. Guardar en variable GLOBAL (Crucial para el renderizado)
        window.maintenanceTickets = [];

        snapshot.forEach(doc => {
            window.maintenanceTickets.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ ${window.maintenanceTickets.length} tickets cargados.`);

        // 4. Llamar al dibujante de la lista (Pestaña Mantenimiento)
        if (typeof renderPaginatedMaintenance === 'function') {
            renderPaginatedMaintenance();
        }

        // 5. ✅ Llamar al dibujante del Dashboard (El Widget Nuevo)
        if (typeof renderDashboardMaintenanceWidget === 'function') {
            renderDashboardMaintenanceWidget();
        }

    } catch (error) {
        console.error("❌ Error cargando tickets:", error);
        alert("Error de conexión al cargar tickets.");
    }
};
// Función para desplegar/contraer tickets finalizados
window.toggleTicketDetails = function(ticketId) {
    const details = document.getElementById(`details-${ticketId}`);
    const icon = document.getElementById(`icon-chevron-${ticketId}`);
    
    if (details.classList.contains('hidden')) {
        details.classList.remove('hidden');
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        details.classList.add('hidden');
        icon.classList.add('fa-chevron-down');
        icon.classList.remove('fa-chevron-up');
    }
};
// =============================================================
// REEMPLAZO MEJORADO: RENDERIZADO DE TICKETS (Con Títulos Inteligentes)
// =============================================================
window.renderPaginatedMaintenance = function () {
    const container = document.getElementById('maintenance-list');
    const paginationContainer = document.getElementById('maintenance-pagination');

    if (!container) return;
    container.innerHTML = ''; 

    // 1. Preparar datos
    let tickets = typeof maintenanceTickets !== 'undefined' ? maintenanceTickets : [];

    // Filtro
    const filterState = document.getElementById('maintenance-filter');
    if (filterState) {
        const filterVal = filterState.value;
        tickets = tickets.filter(t => {
            const isClosed = (t.status === 'Cerrada' || t.status === 'Finalizado' || t.status === 'Baja');
            return filterVal === 'closed' ? isClosed : !isClosed;
        });
    }

    // Ordenar
    tickets.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
        return dateB - dateA;
    });

    // 2. Paginación
    const itemsPerPage = 5;
    const totalPages = Math.ceil(tickets.length / itemsPerPage);

    if (typeof maintenanceCurrentPage === 'undefined') window.maintenanceCurrentPage = 1;
    if (window.maintenanceCurrentPage > totalPages) window.maintenanceCurrentPage = Math.max(1, totalPages);

    const start = (window.maintenanceCurrentPage - 1) * itemsPerPage;
    const paginatedItems = tickets.slice(start, start + itemsPerPage);

    // 3. Dibujar Elementos
    if (paginatedItems.length === 0) {
        container.innerHTML = '<div class="text-gray-400 text-center py-4">No hay tickets en esta categoría.</div>';
    } else {
        paginatedItems.forEach(ticket => {
            const dateStr = ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000).toLocaleDateString() : '-';
            
            // Detectar si está finalizado para contraer
            const isFinished = (ticket.status === 'Cerrada' || ticket.status === 'Finalizado' || ticket.status === 'Baja');

            // Título Inteligente
            let displayTitle = ticket.motive || 'Solicitud de Mantenimiento';
            if (!ticket.motive && ticket.maintenanceType) {
                displayTitle = `Mantenimiento ${ticket.maintenanceType}`;
            }

            // Iconos
            let iconType = '<i class="fas fa-tools text-slate-500"></i>';
            if (displayTitle.includes('Preventivo')) iconType = '<i class="fas fa-shield-alt text-blue-600"></i>';
            if (displayTitle.includes('Correctivo')) iconType = '<i class="fas fa-wrench text-orange-600"></i>';

            const div = document.createElement('div');

            // --- DISEÑO CONDICIONAL ---
            if (isFinished) {
                // === DISEÑO COMPACTO (VERDE) ===
                div.className = "bg-green-50 border border-green-200 rounded-lg mb-2 overflow-hidden shadow-sm transition-all hover:shadow-md";
                div.innerHTML = `
                    <div onclick="window.toggleTicketDetails('${ticket.id}')" 
                         class="p-3 flex justify-between items-center cursor-pointer hover:bg-green-100/50 transition-colors">
                        
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                                <i class="fas fa-check"></i>
                            </div>
                            <div>
                                <h4 class="text-slate-700 font-bold text-sm leading-tight">${displayTitle}</h4>
                                <div class="text-xs text-slate-500 font-mono">ID: ${ticket.ticketId || ticket.id.slice(0,6)} • ${dateStr}</div>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <span class="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800 font-bold uppercase shadow-sm">${ticket.status}</span>
                            <i id="icon-chevron-${ticket.id}" class="fas fa-chevron-down text-slate-400 transition-transform"></i>
                        </div>
                    </div>

                    <div id="details-${ticket.id}" class="hidden bg-white border-t border-green-100 p-4">
                        <p class="text-slate-600 text-sm mb-3"><span class="font-bold">Descripción:</span> ${ticket.description || 'Sin descripción'}</p>
                        
                        <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p class="text-[10px] text-slate-400 mb-2 font-bold uppercase">Historial Final:</p>
                            <div class="space-y-1">
                                ${(ticket.events && ticket.events.length > 0) ? ticket.events.map(ev => `
                                    <div class="text-xs flex gap-2 text-slate-500">
                                        <span class="font-bold text-slate-700 w-20">${ev.date}</span>
                                        <span>${ev.status}: ${ev.notes}</span>
                                    </div>
                                `).join('') : '<span class="text-xs">Sin datos</span>'}
                            </div>
                        </div>
                        
                         <div class="mt-3 flex justify-end">
                            <button onclick="window.openDeleteSecurityModal('${ticket.id}')" 
                                class="text-xs text-red-400 hover:text-red-600 underline">
                                Eliminar Registro
                            </button>
                        </div>
                    </div>
                `;

            } else {
                // === DISEÑO TARJETA AMARILLA (ACTIVOS) ===
                div.className = "bg-yellow-50 p-4 rounded-lg mb-3 border border-yellow-200 shadow-sm relative group hover:shadow-md hover:border-yellow-300 transition-all";
                div.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div class="w-full">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-xs font-mono text-slate-500 bg-white border border-yellow-100 px-2 py-0.5 rounded">ID: ${ticket.ticketId || ticket.id.slice(0,6)}</span>
                                <span class="text-xs text-slate-500 flex items-center gap-1">📅 ${dateStr}</span>
                            </div>
                            
                            <div class="flex items-center gap-3 mb-2">
                                <div class="text-2xl">${iconType}</div>
                                <div>
                                    <h4 class="text-slate-800 font-bold text-lg leading-tight">${displayTitle}</h4>
                                    <p class="text-slate-600 text-sm">${ticket.description || 'Sin descripción adicional'}</p>
                                </div>
                            </div>

                            <div class="flex flex-wrap gap-2 mt-2 items-center">
                                <span class="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold uppercase tracking-wide shadow-sm">${ticket.status}</span>
                            </div>
                        </div>
                        
                        <div class="flex flex-col gap-2 ml-4">
                            <button onclick="window.openAddTicketStepModal('${ticket.id}')" 
                                class="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 w-10 h-10 rounded-lg transition shadow-sm flex items-center justify-center" title="Agregar Avance">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button onclick="window.openDeleteSecurityModal('${ticket.id}')" 
                                class="bg-white hover:bg-red-50 text-red-600 border border-red-200 w-10 h-10 rounded-lg transition shadow-sm flex items-center justify-center" title="Eliminar Ticket">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-yellow-200">
                        <p class="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider">Historial de Avances</p>
                        <div class="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                            ${(ticket.events && ticket.events.length > 0) ? ticket.events.map(ev => `
                                <div class="text-xs bg-yellow-100/50 p-2 rounded border-l-2 border-yellow-400 hover:bg-yellow-100 transition">
                                    <div class="flex justify-between text-slate-500 mb-0.5">
                                        <span class="font-bold text-slate-700">${ev.status}</span>
                                        <span>${ev.date || '-'}</span>
                                    </div>
                                    <div class="text-slate-600 italic">"${ev.notes || ''}"</div>
                                </div>
                            `).join('') : '<div class="text-xs text-slate-400 italic">Sin avances registrados</div>'}
                        </div>
                    </div>
                `;
            }

            container.appendChild(div);
        });
    }

    // 4. Actualizar Paginación
    if (paginationContainer && typeof window.updateMaintenancePagination === 'function') {
        window.updateMaintenancePagination(totalPages);
    }
};

// =============================================================
// 5. PAGINACIÓN (VERSIÓN DEFINITIVA Y MEJORADA)
// =============================================================

// Actualiza los botones (Visual)
window.updateMaintenancePagination = function(totalItems) {
    const controls = document.getElementById('maintenance-pagination-controls');
    if (!controls) return;

    // Calculamos el total de forma segura (usa el total pasado o busca el array global)
    const total = (totalItems !== undefined) ? totalItems : (typeof allMaintenanceTickets !== 'undefined' ? allMaintenanceTickets.length : 0);
    
    // Calculamos cuántas páginas hay
    const totalPages = Math.ceil(total / maintenanceItemsPerPage);

    // Si hay 1 página o menos, ocultamos los botones
    if (totalPages <= 1) {
        controls.classList.add('hidden');
    } else {
        controls.classList.remove('hidden');
        controls.innerHTML = `
            <button onclick="changeMaintenancePage(-1)" ${maintenanceCurrentPage === 1 ? 'disabled' : ''} 
                class="px-3 py-1 rounded border transition-colors ${maintenanceCurrentPage === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm'}">
                Anterior
            </button>
            
            <span class="px-3 py-1 text-sm font-medium text-slate-600">
                Página ${maintenanceCurrentPage} de ${totalPages || 1}
            </span>
            
            <button onclick="changeMaintenancePage(1)" ${maintenanceCurrentPage >= totalPages ? 'disabled' : ''} 
                class="px-3 py-1 rounded border transition-colors ${maintenanceCurrentPage >= totalPages ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm'}">
                Siguiente
            </button>
        `;
    }
};

// Cambia la variable de página y redibuja
window.changeMaintenancePage = function(delta) {
    maintenanceCurrentPage += delta;
    
    // Redibujar la tabla con la nueva página
    if (typeof renderPaginatedMaintenance === 'function') {
        renderPaginatedMaintenance();
    } else {
        console.error("❌ Error: No se encuentra la función renderPaginatedMaintenance");
    }
};

// =================================================================
// 6. BLOQUE MAESTRO DE INTERACCIÓN Y SEGURIDAD (FINAL DE ARCHIVO)
// =================================================================

// A. VARIABLES GLOBALES DE CONTROL
window.ticketToDeleteId = null;
window.batchToDeleteId = null;

// B. SISTEMA DE BORRADO UNIFICADO
// -----------------------------------------------------------------
window.openDeleteSecurityModal = function (id, type = 'ticket') {
    console.log(`🗑️ Solicitud de borrado. Tipo: ${type}, ID: ${id}`);

    // Limpieza de variables
    window.ticketToDeleteId = null;
    window.batchToDeleteId = null;

    // Asignación correcta
    if (type === 'batch') {
        window.batchToDeleteId = id;
    } else {
        window.ticketToDeleteId = id; // Por defecto es ticket
    }

    const modal = document.getElementById('delete-security-modal');
    const passInput = document.getElementById('delete-auth-password');
    const errorMsg = document.getElementById('delete-error-msg');

    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        if (passInput) {
            passInput.value = '';
            passInput.classList.remove('border-red-500');
            setTimeout(() => passInput.focus(), 100);
        }
        if (errorMsg) errorMsg.classList.add('hidden');
    } else {
        console.error("Falta el modal 'delete-security-modal'");
    }
};

window.closeDeleteModal = function() {
    const modal = document.getElementById('delete-security-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    // ESTA ES LA FORMA CORRECTA:
    window.ticketToDeleteId = null; 
    window.batchToDeleteId = null;
};

window.confirmDeleteWithPassword = async function () {
    const passInput = document.getElementById('delete-auth-password');
    const errorMsg = document.getElementById('delete-error-msg');
    const CLAVE = "111111"; // <--- TU CLAVE MAESTRA

    if (!passInput || passInput.value !== CLAVE) {
        if (errorMsg) errorMsg.classList.remove('hidden');
        if (passInput) passInput.classList.add('border-red-500');
        return;
    }

    try {
        // CASO 1: BORRAR LOTE
        if (window.batchToDeleteId) {
            console.log("🔥 Ejecutando borrado de LOTE:", window.batchToDeleteId);
            if (typeof db !== 'undefined' && typeof appId !== 'undefined') {
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/calibrationBatches`, window.batchToDeleteId));
            }
            window.closeDeleteModal();
            if (typeof loadCalibrationBatches === 'function') await loadCalibrationBatches();
            if (typeof showToast === 'function') showToast("Lote eliminado.", "success");
        }
        // CASO 2: BORRAR TICKET
        else if (window.ticketToDeleteId) {
            console.log("🔥 Ejecutando borrado de TICKET:", window.ticketToDeleteId);
            if (typeof db !== 'undefined' && typeof selectedItemId !== 'undefined') {
                await deleteDoc(doc(db, `artifacts/${appId}/public/data/items/${selectedItemId}/maintenanceTickets`, window.ticketToDeleteId));
            }
            window.closeDeleteModal();
            if (typeof loadMaintenanceTickets === 'function') await loadMaintenanceTickets();
            if (typeof showToast === 'function') showToast("Ticket eliminado.", "success");
        } else {
            console.warn("⚠️ No hay ID seleccionado para borrar.");
            window.closeDeleteModal();
        }

    } catch (error) {
        console.error("Error crítico al borrar:", error);
        alert("Error técnico: " + error.message);
    }
};
// =============================================================
// REEMPLAZO FINAL: SISTEMA DE REPORTES Y ARCHIVOS (Separado)
// =============================================================

// 1. GUARDAR TEXTO (Notas y Fechas)
window.saveBatchReport = async function () {
    console.log("💾 Guardando datos del reporte...");
    const batchId = window.currentBatchId;
    if (!batchId) { showToast("Error: No hay lote seleccionado.", 'error'); return; }

    const btn = document.getElementById('save-batch-report-btn');
    if (typeof setButtonLoading === 'function') setButtonLoading(btn, true, 'Guardando...');

    try {
        // Obtenemos valores
        const dateInput = document.getElementById('batch-report-date');
        const notesInput = document.getElementById('batch-details-notes'); // Asegúrate que tu textarea tenga este ID o 'batch-notes'

        const updateData = { lastUpdated: serverTimestamp() };

        if (dateInput && dateInput.value) updateData.reportDate = dateInput.value;
        if (notesInput) updateData.notes = notesInput.value;

        // Guardamos en Firebase
        const batchRef = doc(db, `artifacts/${appId}/public/data/calibrationBatches`, batchId);
        await updateDoc(batchRef, updateData);

        showToast("Notas y fecha actualizadas.", "success");

    } catch (error) {
        console.error("Error guardando texto:", error);
        showToast("Error al guardar cambios.", "error");
    } finally {
        if (typeof setButtonLoading === 'function') setButtonLoading(btn, false, 'Guardar Cambios');
    }
};

// 2. SUBIR ARCHIVO (Inmediato al seleccionar)
window.uploadBatchFile = async function (inputElement) {
    const batchId = window.currentBatchId;
    if (!batchId) return;

    if (!inputElement.files || inputElement.files.length === 0) return;

    const file = inputElement.files[0];
    showToast(`Subiendo ${file.name}...`, 'info');

    try {
        // Subir a Storage
        const storageRef = ref(storage, `artifacts/${appId}/calibration_reports/${batchId}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Guardar referencia en DB
        const newAttachment = {
            name: file.name,
            url: downloadURL,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            docDate: document.getElementById('batch-report-date')?.value || new Date().toISOString()
        };

        const batchRef = doc(db, `artifacts/${appId}/public/data/calibrationBatches`, batchId);
        await updateDoc(batchRef, {
            attachments: arrayUnion(newAttachment)
        });

        showToast("Archivo adjuntado exitosamente.", "success");

        // Limpiar input y recargar vista
        inputElement.value = '';
        if (typeof openBatchDetailsModal === 'function') openBatchDetailsModal(batchId);

    } catch (error) {
        console.error("Error subiendo archivo:", error);
        showToast("Error al subir archivo.", "error");
    }
};

// 3. ELIMINAR ARCHIVO (Para la lista de adjuntos)
window.deleteBatchAttachment = async function (fileUrl) {
    if (!confirm("¿Borrar este adjunto?")) return;
    const batchId = window.currentBatchId;

    try {
        const batchRef = doc(db, `artifacts/${appId}/public/data/calibrationBatches`, batchId);
        const snap = await getDoc(batchRef);

        if (snap.exists()) {
            const attachments = snap.data().attachments || [];
            const newAttachments = attachments.filter(a => a.url !== fileUrl);

            await updateDoc(batchRef, { attachments: newAttachments });
            showToast("Adjunto eliminado.", "success");
            openBatchDetailsModal(batchId);
        }
    } catch (e) {
        console.error(e);
        showToast("Error al eliminar.", "error");
    }
};

// =================================================================
// 1. ESCUCHADOR DE EVENTOS GLOBAL (LOTES Y ACCIONES DINÁMICAS)
// =================================================================
document.addEventListener('click', async (e) => {

    // 1.1 VER LOTE (Prioridad Alta + StopPropagation)
    const btnVerLote = e.target.closest('.btn-ver-lote');
    if (btnVerLote) {
        e.preventDefault();
        e.stopPropagation(); 
        const id = btnVerLote.dataset.id;
        console.log("👁️ Click detectado: VER LOTE", id);
        if (typeof openBatchDetailsModal === 'function') openBatchDetailsModal(id);
        return;
    }

    // 1.2 BORRAR LOTE
    const btnBorrarLote = e.target.closest('.btn-borrar-lote');
    if (btnBorrarLote) {
        e.preventDefault();
        e.stopPropagation(); 
        const id = btnBorrarLote.dataset.id;
        console.log("🗑️ Click detectado: BORRAR LOTE", id);
        window.openDeleteSecurityModal(id, 'batch');
        return;
    }

    // 1.3 FINALIZAR LOTE
    if (e.target.closest('#finalize-batch-btn')) {
        e.preventDefault();
        if (typeof finalizeBatch === 'function') await finalizeBatch();
        return;
    }

    // 1.4 GUARDAR REPORTE LOTE
    if (e.target.closest('#save-batch-report-btn')) {
        e.preventDefault();
        if (typeof saveBatchReport === 'function') await saveBatchReport();
        return;
    }

    // 1.5 CREAR LOTE
    if (e.target.closest('#confirm-create-batch-btn')) {
        e.preventDefault();
        if (typeof saveCalibrationBatch === 'function') await saveCalibrationBatch();
        return;
    }
});

// Función infalible para abrir la ventana de archivos
window.abrirSelectorArchivos = function () {
    const input = document.getElementById('batch-file-input') || document.getElementById('file-input');
    if (input) {
        input.click();
    } else {
        console.error("No se encontró el selector de archivos en el HTML");
    }
};

// =================================================================
// 2. INICIALIZACIÓN GLOBAL UNIFICADA (DOM CONTENT LOADED)
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("🏁 Sistema inicializado correctamente.");

    // --- 2.1 GESTIÓN DEL SIDEBAR Y OVERLAY ---
    window.openSidebar = () => {
        if (ui.sidebar) ui.sidebar.classList.add('open');
        if (ui.sidebarOverlay) ui.sidebarOverlay.classList.add('show');
    };

    window.closeSidebar = () => {
        if (ui.sidebar) ui.sidebar.classList.remove('open');
        if (ui.sidebarOverlay) ui.sidebarOverlay.classList.remove('show');
    };

    if (ui.hamburgerBtn) {
        // Limpiamos listeners viejos clonando el botón para evitar duplicados
        const newBtn = ui.hamburgerBtn.cloneNode(true);
        ui.hamburgerBtn.parentNode.replaceChild(newBtn, ui.hamburgerBtn);
        ui.hamburgerBtn = newBtn; 

        ui.hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.openSidebar();
        });
    }

    if (ui.sidebarOverlay) {
        ui.sidebarOverlay.addEventListener('click', window.closeSidebar);
    }

    // Cerrar sidebar al seleccionar un item o al redimensionar (Solo en móviles)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.sidebar-item')) {
            if (window.innerWidth <= 768) window.closeSidebar();
        }
    });

    // --- 2.2 FUNCIONES DE SEGURIDAD Y TICKETS ---
    const delPass = document.getElementById('delete-auth-password');
    if (delPass) {
        delPass.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.confirmDeleteWithPassword();
        });
    }

    const stepForm = document.getElementById('add-ticket-step-form');
    if (stepForm) {
        stepForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const ticketId = document.getElementById('ticket-id-input').value;
            const status = document.getElementById('ticket-step-status').value;
            const date = document.getElementById('ticket-step-date').value;
            const notes = document.getElementById('ticket-step-notes').value;

            if (!ticketId || !status || !date) { alert("Faltan datos"); return; }

            try {
                if (typeof db === 'undefined') throw new Error("Firebase no inicializado");
                const ticketRef = doc(db, `artifacts/${appId}/public/data/items/${selectedItemId}/maintenanceTickets`, ticketId);
                
                await updateDoc(ticketRef, {
                    events: arrayUnion({ status, date, notes: notes || '' }),
                    status: status === 'Equipo dado de baja' ? 'Cerrada' :
                            (status === 'Mantención Realizada' ? 'Finalizado' : status),
                    lastUpdated: serverTimestamp()
                });

                if (status === 'Equipo dado de baja') {
                    await updateDoc(doc(db, `artifacts/${appId}/public/data/items`, selectedItemId), {
                        status: 'Baja', hasOpenTicket: false
                    });
                }
                document.getElementById('add-ticket-step-modal').classList.add('hidden');
                e.target.reset();
                if (typeof loadMaintenanceTickets === 'function') loadMaintenanceTickets();
                if (typeof showToast === 'function') showToast("Paso guardado con éxito", "success");
            } catch (error) {
                console.error("❌ Error:", error);
                alert("Error al guardar: " + error.message);
            }
        });
    }

    // --- 2.3 ARRANQUE DE FUNCIONES BASE ---
    if (typeof setupDropzones === 'function') setupDropzones();
    if (typeof initialize === 'function') initialize();
    if (typeof setupEventListeners === 'function') {
        try { setupEventListeners(); } catch (e) { console.warn("Error en listeners base:", e); }
    }

    // --- 2.4 CARGA RETARDADA DEL DASHBOARD ---
    setTimeout(window.loadGlobalDashboard, 2000);
});

// =============================================================
// 3. WIDGET DE MANTENIMIENTO (LÓGICA DE VISUALIZACIÓN)
// =============================================================
window.renderDashboardMaintenanceWidget = function() {
    const container = document.getElementById('dashboard-active-maintenance');
    if (!container) return;

    let tickets = typeof maintenanceTickets !== 'undefined' ? maintenanceTickets : [];
    const activeTickets = tickets.filter(t => !['Cerrada', 'Finalizado', 'Baja'].includes(t.status || ''));

    activeTickets.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
        return dateB - dateA;
    });

    const topTickets = activeTickets.slice(0, 4);
    container.innerHTML = '';

    if (topTickets.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8 text-slate-400 opacity-70">
                <i class="fas fa-check-circle text-4xl mb-2 text-green-400"></i>
                <span class="text-sm font-medium">¡Todo al día!</span>
            </div>`;
        return;
    }

    topTickets.forEach(ticket => {
        let displayTitle = ticket.motive || ticket.maintenanceType || 'Solicitud';
        let badgeColor = ticket.status === 'Abierta' ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700";
        const dateObj = ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000) : new Date();
        const dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });

        const item = document.createElement('div');
        item.className = "flex items-center justify-between p-3 bg-white hover:bg-blue-50 rounded-xl border border-slate-100 shadow-sm transition-all cursor-pointer group";
        
        item.onclick = async function() {
            if (!ticket.itemId) return alert("No se puede ir al equipo: Faltan datos.");
            window.selectedItemId = ticket.itemId;

            if (typeof showDetailsView === 'function') showDetailsView();
            if (typeof loadItemDetails === 'function') await loadItemDetails(ticket.itemId);
            if (typeof loadMaintenanceTickets === 'function') await loadMaintenanceTickets();

            // Activar pestaña mantenimiento
            const buttons = document.querySelectorAll('button');
            for (const btn of buttons) {
                if (btn.innerText.includes('Mantenimiento')) { btn.click(); break; }
            }
        };

        item.innerHTML = `
            <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                <div class="flex flex-col truncate pr-2">
                    <span class="text-sm font-bold text-slate-700 truncate group-hover:text-blue-700">${displayTitle}</span>
                    <span class="text-[10px] text-slate-400 font-mono">ID: ${ticket.ticketId || ticket.id.slice(0,6)}</span>
                </div>
            </div>
            <div class="flex flex-col items-end gap-1">
                <span class="text-[10px] px-2 py-0.5 rounded-full ${badgeColor} font-bold uppercase">${ticket.status}</span>
                <span class="text-[10px] text-slate-400">${dateStr}</span>
            </div>`;
        container.appendChild(item);
    });
};

// =============================================================
// 4. CARGA DE DATOS DESDE FIREBASE (GLOBAL)
// =============================================================
window.loadGlobalDashboard = async function() {
    const container = document.getElementById('dashboard-active-maintenance');
    if (!container) return;

    try {
        const q = window.query(
            window.collectionGroup(window.db, 'maintenanceTickets'),
            window.where('status', '!=', 'Cerrada')
        );

        const snapshot = await window.getDocs(q);
        let allTickets = [];

        snapshot.forEach(doc => {
            const equipmentRef = doc.ref.parent.parent; 
            allTickets.push({ 
                id: doc.id, 
                itemId: equipmentRef ? equipmentRef.id : null, 
                ...doc.data() 
            });
        });

        allTickets = allTickets.filter(t => t.status !== 'Finalizado' && t.status !== 'Baja');
        
        // Guardar en variable global temporalmente para el render
        const backup = window.maintenanceTickets; 
        window.maintenanceTickets = allTickets;   
        window.renderDashboardMaintenanceWidget();
        window.maintenanceTickets = backup;

    } catch (error) {
        console.error("❌ Error cargando Dashboard:", error);
        if (error.message && error.message.includes("indexes")) {
            container.innerHTML = `<div class="p-4 bg-red-50 text-red-700 text-xs rounded-lg">⚠️ Falta crear índice en Firebase. Revisa la consola (F12).</div>`;
        }
    }
};
// =============================================================
// 1. WIDGET: RESUMEN DE INVENTARIO (Diseño Nuevo)
// =============================================================
window.renderDashboardInventorySummary = function() {
    const container = document.getElementById('dashboard-inventory-summary');
    if (!container) return;

    // Calculamos datos (usamos inventoryData si existe, si no, ponemos 0)
    const items = typeof inventoryData !== 'undefined' ? inventoryData : [];
    const totalItems = items.length;
    
    // Calcular valor y bajo stock
    let totalValue = 0;
    let lowStockCount = 0;
    
    items.forEach(item => {
        totalValue += (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0);
        if ((parseFloat(item.quantity) || 0) <= (item.minStock || 5)) lowStockCount++;
    });

    const moneyFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

    // HTML PREMIUM
    container.innerHTML = `
        <div class="h-full bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <h3 class="font-bold text-slate-700 text-lg mb-4 flex items-center gap-2">
                📊 Resumen Global
            </h3>
            <div class="grid grid-cols-2 gap-4 flex-grow">
                <div class="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                    <span class="block text-2xl font-bold text-blue-700">${totalItems}</span>
                    <span class="text-xs font-bold text-blue-400 uppercase">Items</span>
                </div>
                <div class="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
                    <span class="block text-2xl font-bold text-orange-600">${lowStockCount}</span>
                    <span class="text-xs font-bold text-orange-400 uppercase">Bajo Stock</span>
                </div>
                <div class="col-span-2 bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
                    <span class="block text-xl font-bold text-emerald-700 truncate">${moneyFormatter.format(totalValue)}</span>
                    <span class="text-xs font-bold text-emerald-500 uppercase">Valor Total</span>
                </div>
            </div>
        </div>
    `;
};

// =============================================================
// 2. WIDGET: ACTIVIDAD RECIENTE (Diseño Nuevo)
// =============================================================
window.renderDashboardRecentActivity = function() {
    const container = document.getElementById('dashboard-recent-activity');
    if (!container) return;

    // Datos de ejemplo (o reales si tienes la variable recentActivityLog)
    const activities = (typeof recentActivityLog !== 'undefined' && recentActivityLog.length > 0) 
        ? recentActivityLog.slice(0, 4) 
        : [
            { text: "Sistema iniciado", time: new Date(), user: "Sistema" },
            { text: "Inventario cargado", time: new Date(), user: "Admin" }
        ];

    let listHtml = activities.map((act, index) => `
        <div class="flex gap-3 relative pb-4 last:pb-0">
            ${index !== activities.length - 1 ? '<div class="absolute left-[9px] top-6 bottom-0 w-0.5 bg-slate-200"></div>' : ''}
            <div class="w-5 h-5 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 z-10">
                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <div>
                <p class="text-xs font-medium text-slate-700">${act.text || "Actividad"}</p>
                <p class="text-[10px] text-slate-400">${act.user || 'Usuario'}</p>
            </div>
        </div>
    `).join('');

    // HTML PREMIUM
    container.innerHTML = `
        <div class="h-full bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <h3 class="font-bold text-slate-700 text-lg mb-4 flex items-center gap-2">
                🕒 Actividad
            </h3>
            <div class="flex-grow overflow-y-auto custom-scrollbar">
                ${listHtml}
            </div>
        </div>
    `;
};
/* ========================================================== */
/* LÓGICA DEL SIDEBAR (USANDO TU OBJETO UI)                   */
/* ========================================================== */

// Funciones usando las referencias de tu objeto 'ui'
function openSidebar() {
    if (ui.sidebar) ui.sidebar.classList.add('open');
    if (ui.sidebarOverlay) ui.sidebarOverlay.classList.add('show');
}

function closeSidebar() {
    if (ui.sidebar) ui.sidebar.classList.remove('open');
    if (ui.sidebarOverlay) ui.sidebarOverlay.classList.remove('show');
}

// --- EVENT LISTENERS ---

// 1. Botón Hamburguesa (Usamos ui.hamburgerBtn)
if (ui.hamburgerBtn) {
    // Truco: Clonamos el nodo para eliminar cualquier listener viejo/conflictivo
    const newBtn = ui.hamburgerBtn.cloneNode(true);
    ui.hamburgerBtn.parentNode.replaceChild(newBtn, ui.hamburgerBtn);
    
    // Actualizamos la referencia en el objeto ui
    ui.hamburgerBtn = newBtn;

    ui.hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSidebar();
        console.log("🍔 Menú abierto");
    });
} else {
    console.error("❌ Error: No se encontró 'hamburger-btn' en el objeto ui");
}

// 2. Click en el Overlay (Fondo gris)
if (ui.sidebarOverlay) {
    ui.sidebarOverlay.addEventListener('click', closeSidebar);
}

// 3. Click en items (Navegación móvil)
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    });
});
// ==========================================
// 🕵️‍♂️ DIAGNÓSTICO DE SIDEBAR (Borrar luego)
// ==========================================
setTimeout(() => {
    console.clear();
    console.log("%c 🕵️ INICIANDO DIAGNÓSTICO... ", "background: #222; color: #bada55; font-size: 14px");

    const elSidebar = document.getElementById('sidebar');
    const elBtn = document.getElementById('mobile-menu-btn');
    const elOverlay = document.getElementById('sidebar-overlay');

    // 1. CHEQUEO DE EXISTENCIA
    console.log("1️⃣  ¿Existe el Sidebar?      ", elSidebar ? "✅ SÍ" : "❌ NO (Revisa el ID 'sidebar')");
    console.log("2️⃣  ¿Existe el Botón Menú?   ", elBtn ? "✅ SÍ" : "❌ NO (Falta el botón en HTML)");
    console.log("3️⃣  ¿Existe el Overlay?      ", elOverlay ? "✅ SÍ" : "❌ NO (Falta el div overlay)");

    // 2. CHEQUEO DE VISIBILIDAD
    if (elBtn) {
        const estilo = window.getComputedStyle(elBtn);
        console.log("4️⃣  Botón visible?           ", estilo.display !== 'none' ? "✅ SÍ" : "⚠️ OCULTO (display: none)");
        console.log("     ➜ Z-Index del botón:    ", estilo.zIndex);
        
        // Agregar un "chivato" al hacer click
        elBtn.addEventListener('click', () => {
            console.log("%c 🖱️ CLICK DETECTADO EN EL BOTÓN ", "background: blue; color: white; font-size: 12px");
            if (elSidebar) {
                console.log("     ➜ Clases del Sidebar antes:", elSidebar.className);
            }
        });
    } else {
        console.error("🚨 ERROR CRÍTICO: No puedo probar clicks porque no encuentro el botón con ID 'mobile-menu-btn'");
    }

    console.log("%c 🏁 FIN DEL DIAGNÓSTICO ", "background: #222; color: #bada55");
}, 2000); // Esperamos 2 segundos para asegurar que todo cargó