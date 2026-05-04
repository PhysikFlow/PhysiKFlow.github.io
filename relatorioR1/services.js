import { db } from "./firebase.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// -------- CARDS --------
export async function getDashboardData() {
    const snapshot = await getDocs(collection(db, "pagamentos"));

    let total = 0;
    let count = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        total += data.valor;
        count++;
    });

    return {
        total,
        alunos: count
    };
}

// -------- RELATÓRIOS --------
export async function getMonthlyRevenue() {
    const snapshot = await getDocs(collection(db, "pagamentos"));

    const meses = {};

    snapshot.forEach(doc => {
        const d = doc.data();
        const mes = new Date(d.data).toISOString().slice(0,7);

        if (!meses[mes]) meses[mes] = 0;
        meses[mes] += d.valor;
    });

    return meses;
}