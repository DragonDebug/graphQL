import * as api from "./api.js";
import { config } from "./config.js";
import {
  createSVGProgressBar,
  formatBytes,
  createXPBarChart,
  createProjectsSVG,
} from "./charts.js";

// ── History API: Prevent back navigation after logout ──
window.history.pushState(null, "", window.location.href);
window.addEventListener("popstate", () => {
  if (!localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  } else {
    window.history.pushState(null, "", window.location.href);
  }
});

// ── Auth Guard ──

if (!localStorage.getItem("authToken")) {
  window.location.replace("index.html");
}

// ── Init ──

setupSignout();
const userId = await loadUserProfile();
await loadAuditData(userId);
await loadXPAndProjects(userId);

// ── Data Loading ──

async function loadUserProfile() {
  const user = await api.getUserLoginInfo();

  if (!user?.id) {
    localStorage.removeItem("authToken");
    window.location.replace("index.html");
    throw new Error("User not authenticated");
  }

  document.getElementById("nav-username").textContent = user.login;
  document.getElementById("username").textContent = user.login;
  document.getElementById("name").textContent =
    user.firstName + " " + user.lastName;
  document.getElementById("email").textContent = user.email;
  document.getElementById("cpr").textContent = user.CPRnumber;

  return user.id;
}

async function loadAuditData(userId) {
  const audit = await api.getAuditRatio(userId);

  const maxXP = Math.max(audit.totalUp, audit.totalDown, 1);
  const donePercent = (audit.totalUp / maxXP) * 100;
  const receivedPercent = (audit.totalDown / maxXP) * 100;

  document.getElementById("audit-progress-done").innerHTML =
    createSVGProgressBar(donePercent, formatBytes(audit.totalUp), "#10b981");
  document.getElementById("audit-progress-received").innerHTML =
    createSVGProgressBar(
      receivedPercent,
      formatBytes(audit.totalDown),
      "#3b82f6",
    );
  document.getElementById("audit-ratio-value").textContent =
    audit.ratio.toFixed(2);
}

async function loadXPAndProjects(userId) {
  const { transactions, byMonth } = await api.getXPTransactions(userId);

  console.log("XP Transactions:", transactions);

  // XP over time chart
  document.getElementById("xp-chart").innerHTML = createXPBarChart(byMonth);

  // Categorize and display projects in tabs
  const categories = categorizeTransactions(transactions);
  const projectsByCategory = {
    "bh-piscine": api.getFinishedProjects(categories["bh-piscine"]),
    "piscine-js": api.getFinishedProjects(categories["piscine-js"]),
    "bh-module": api.getFinishedProjects(categories["bh-module"]),
  };

  setupProjectTabs(projectsByCategory);
}

// ── Helpers ──

/**
 * Splits transactions into 3 categories based on path.
 * - bh-piscine: path contains "bh-piscine"
 * - piscine-js: path contains "piscine-js" (even under bh-module)
 * - bh-module: path contains "bh-module" but NOT "piscine-js"
 */
function categorizeTransactions(transactions) {
  const result = { "bh-piscine": [], "piscine-js": [], "bh-module": [] };

  for (const tx of transactions) {
    const path = tx.path || "";
    if (path.includes("bh-piscine")) result["bh-piscine"].push(tx);
    if (path.includes("piscine-js")) result["piscine-js"].push(tx);
    if (
      path.includes("bh-module") &&
      !path.includes("piscine-js") &&
      !path.includes("checkpoint")
    )
      result["bh-module"].push(tx);
  }

  return result;
}

function setupProjectTabs(projectsByCategory) {
  const tabs = document.querySelectorAll(".project-tab");
  const container = document.getElementById("projects-chart");

  // Show first tab by default
  container.innerHTML = createProjectsSVG(projectsByCategory["bh-piscine"]);

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Toggle active tab styling
      tabs.forEach((t) => {
        t.classList.remove("bg-blue-600", "text-white");
        t.classList.add("bg-slate-800", "text-slate-400");
      });
      tab.classList.remove("bg-slate-800", "text-slate-400");
      tab.classList.add("bg-blue-600", "text-white");

      container.innerHTML = createProjectsSVG(
        projectsByCategory[tab.dataset.category],
      );
    });
  });
}

function setupSignout() {
  document.getElementById("signout").addEventListener("click", () => {
    localStorage.removeItem(config.authTokenKey);
    // Replace current history entry so user can't navigate back to main page
    window.history.replaceState(null, "", "index.html");
    window.location.replace("index.html");
  });
}
