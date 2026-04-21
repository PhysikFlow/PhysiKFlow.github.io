import { getDashboardData, getMonthlyRevenue } from "./services.js";

// THEME
const toggle = document.getElementById("themeToggle");
toggle.addEventListener("change", () => {
    document.body.classList.toggle("dark", toggle.checked);
});

// CARDS
async function loadCards() {
    const data = await getDashboardData();

    document.getElementById("cards").innerHTML = `
        <div class="card">
            <div class="card-title">Total</div>
            <div class="card-value">${data.total.toFixed(2)}</div>
        </div>

        <div class="card">
            <div class="card-title">Alunos</div>
            <div class="card-value">${data.alunos}</div>
        </div>
    `;
}

// RELATÓRIOS
const reports = [
    { id: "mensal", label: "Faturamento Mensal" },
    { id: "ranking", label: "Ranking Alunos" },
    { id: "atraso", label: "Em Atraso" }
];

function loadReportButtons() {
    const el = document.getElementById("reportButtons");

    reports.forEach(r => {
        const btn = document.createElement("button");
        btn.textContent = r.label;

        btn.onclick = () => loadReport(r.id);

        el.appendChild(btn);
    });
}

async function loadReport(type) {
    const area = document.getElementById("reportArea");

    if (type === "mensal") {
        const data = await getMonthlyRevenue();

        area.innerHTML = Object.entries(data)
            .map(([mes, valor]) => `<div>${mes}: ${valor}</div>`)
            .join("");
    }

    if (type === "ranking") {
        area.innerHTML = "Ranking (a fazer)";
    }

    if (type === "atraso") {
        area.innerHTML = "Atrasados (a fazer)";
    }
}

// INIT
loadCards();
loadReportButtons();