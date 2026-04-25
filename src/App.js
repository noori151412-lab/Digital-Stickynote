import { auth, db } from './firebase-config';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "firebase/auth";
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc,
    orderBy
} from "firebase/firestore";

// --- 1. Naya Landing Page Render karne wala function ---
function renderLandingPage(onGetStarted) {
    const root = document.getElementById('app-root');
    root.innerHTML = `
        <div id="landing-page" class="text-center container">
            <div class="row justify-content-center">
                <div class="col-12 col-md-8">
                    <h1 style="font-size: clamp(2.5rem, 8vw, 4.5rem); color: white; text-shadow: 3px 3px 6px rgba(0,0,0,0.3); font-weight: 800;">
                        Sticky Notes App ✨
                    </h1>
                    <p class="text-white mb-4" style="font-size: 1.2rem; opacity: 0.9;">
                         Keep your essential thoughts and tasks secure.
                    </p>
                    <button id="get-started-btn" class="btn btn-warning btn-lg px-5 shadow" style="border-radius: 30px; font-weight: bold;">
                        Get Started 🚀
                    </button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('get-started-btn').onclick = onGetStarted;
}

// --- 2. Login/Signup Form Render karne wala function ---
function renderAuthForm() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
        <div id="auth-container" class="container">
            <div class="row justify-content-center">
                <div class="col-11 col-sm-8 col-md-5 card shadow" style="border: 6px solid #b55464; border-radius: 15px; background-color: #eeaf877b; padding: 40px !important;">
                    <h3 class="text-center" style="color: #333; font-weight: 700; margin-bottom: 20px;">Login / Signup</h3>
                    <input type="email" id="login-email" class="form-control mb-3" placeholder="Email">
                    <input type="password" id="login-pass" class="form-control mb-3" placeholder="Password">
                    <button id="signup-btn" class="btn btn-primary w-100 mb-2" style="font-weight: 600; border-radius: 8px;">Sign Up</button>
                    <button id="login-btn" class="btn btn-success w-100" style="font-weight: 600; border-radius: 8px;">Login</button>
                </div>
            </div>
        </div>
    `;
    setupAuthButtons();
}

function setupAuthButtons() {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');

    signupBtn.onclick = async () => {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        if (!email || !pass) return alert("Please fill all fields");
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
            alert("Account Created!");
        } catch (err) { alert("Signup Error: " + err.message); }
    };

    loginBtn.onclick = async () => {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        
        if (auth.currentUser) {
            document.getElementById('app-root').innerHTML = "";
            document.getElementById('notes-container').style.display = 'block';
            loadUserNotes(auth.currentUser.uid);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (err) { alert("Login Error: " + err.message); }
    };
}

export function initApp() {
    const addNoteBtn = document.getElementById('add-btn');
    const backBtn = document.getElementById('back-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const mainHeading = document.getElementById('main-heading');

    if (addNoteBtn) {
        addNoteBtn.onclick = async () => {
            const noteInput = document.getElementById('note-input');
            if (noteInput && noteInput.value.trim() !== "") {
                try {
                    await addDoc(collection(db, "notes"), {
                        text: noteInput.value,
                        uid: auth.currentUser.uid,
                        createdAt: serverTimestamp()
                    });
                    noteInput.value = "";
                } catch (err) { alert("Error adding note: " + err.message); }
            } else { alert("Please write something!"); }
        };
    }

    if (backBtn) {
        backBtn.onclick = () => {
            document.getElementById('notes-container').style.display = 'none';
            renderLandingPage(() => {
                renderAuthForm();
            });
        };
    }

    // --- Logout Logic (Updated with Confirm for OK/Cancel) ---
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if (window.confirm("Are you sure you want to log out?")) {
                signOut(auth).then(() => { 
                    alert("Logged Out Successfully!"); 
                }).catch(err => alert("Error: " + err.message));
            }
        };
    }

    onAuthStateChanged(auth, (user) => {
        const root = document.getElementById('app-root');
        const notesDiv = document.getElementById('notes-container');

        if (user) {
            root.innerHTML = ""; 
            notesDiv.style.display = 'block';
            if (mainHeading) mainHeading.style.display = 'none';
            loadUserNotes(user.uid);
        } else {
            notesDiv.style.display = 'none';
            if (mainHeading) mainHeading.style.display = 'block';
            
            renderLandingPage(() => {
                renderAuthForm();
            });
        }
    });
}

async function loadUserNotes(userId) {
    const q = query(
        collection(db, "notes"), 
        where("uid", "==", userId), 
        orderBy("createdAt", "desc") 
    );

    onSnapshot(q, (snapshot) => {
        const list = document.getElementById('notes-list');
        if (list) {
            list.innerHTML = "";
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const displayTime = data.createdAt 
                    ? data.createdAt.toDate().toLocaleString('en-PK', { hour12: true }) 
                    : "Just now...";

                list.innerHTML += `
                    <div class="col-md-4 mb-3">
                        <div class="card shadow-sm custom-note-card position-relative">
                            <button class="btn btn-sm position-absolute top-0 end-0 m-2" 
                                    onclick="window.copyNote('${data.text.replace(/'/g, "\\'")}')" 
                                    title="Copy Note">📋</button>
                            <div class="card-body mt-2">
                                <p class="card-text text-dark">${data.text}</p>
                                <hr>
                                <p style="font-size: 0.7rem; color: #555; font-style: italic;">📅 ${displayTime}</p>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-sm btn-primary" onclick="window.editNote('${docSnap.id}', '${data.text.replace(/'/g, "\\'")}')">Edit</button>
                                    <button class="btn btn-sm btn-danger" onclick="window.deleteNote('${docSnap.id}')">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>`;
            });
        }
    });
}

window.editNote = async (id, oldText) => {
    const newText = window.prompt("Apna note edit karein:", oldText);
    if (newText !== null && newText.trim() !== "") {
        try {
            await updateDoc(doc(db, "notes", id), {
                text: newText,
                updatedAt: serverTimestamp()
            });
        } catch (err) { alert("Edit Error: " + err.message); }
    }
};

window.deleteNote = async (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
        try { await deleteDoc(doc(db, "notes", id)); } catch (err) { alert("Delete error: " + err.message); }
    }
};

window.copyNote = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        alert("Note copied to clipboard! ✅");
    }).catch(err => alert("Copy failed: " + err));
};