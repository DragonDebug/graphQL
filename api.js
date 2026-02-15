import { fetchGraphQL } from "./graphql.js";
import * as queries from "./queries.js";

// ── User ──

export async function getUserLoginInfo() {
  const data = await fetchGraphQL(queries.GET_USER_LOGIN_INFO);
  const user = data.user?.[0];
  if (!user) return null;

  return {
    id: user.id,
    login: user.login,
    firstName: user.attrs.firstName || "",
    lastName: user.attrs.lastName || "",
    email: user.attrs.email || "",
    phone: user.attrs.PhoneNumber || "",
    CPRnumber: user.attrs.CPRnumber || "",
  };
}

// ── Audit Ratio ──

export async function getAuditRatio(userId) {
  const data = await fetchGraphQL(queries.GET_AUDIT_RATIO, { userId });
  const user = data.user[0] || {};

  return {
    ratio: user.auditRatio || 0,
    totalUp: user.totalUp || 0,
    totalDown: user.totalDown || 0,
  };
}

// ── XP Transactions ──

export async function getXPTransactions(userId) {
  const data = await fetchGraphQL(queries.GET_XP_TRANSACTIONS, { userId });
  const transactions = data.transaction || [];

  return {
    transactions,
    byMonth: groupByMonth(transactions),
  };
}

/**
 * Groups transactions by project name, sums XP, sorts highest first.
 */
export function getFinishedProjects(transactions) {
  const totals = {};

  for (const t of transactions) {
    const name = t.object?.name || "Unknown";
    totals[name] = (totals[name] || 0) + t.amount;
  }

  return Object.entries(totals)
    .map(([name, xp]) => ({ name, xp }))
    .sort((a, b) => b.xp - a.xp);
}

// ── Helpers ──

/**
 * Groups transactions into monthly totals, filling gaps with 0.
 */
function groupByMonth(transactions) {
  if (transactions.length === 0) return [];

  // Sum XP per month key (e.g. "2024-06")
  const monthTotals = {};
  for (const t of transactions) {
    const d = new Date(t.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthTotals[key] = (monthTotals[key] || 0) + t.amount;
  }

  // Walk from first to last month, filling gaps
  const first = new Date(transactions[0].createdAt);
  const last = new Date(transactions[transactions.length - 1].createdAt);
  const cursor = new Date(first.getFullYear(), first.getMonth(), 1);
  const end = new Date(last.getFullYear(), last.getMonth(), 1);
  const result = [];

  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    result.push({
      month: cursor.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      }),
      totalXP: monthTotals[key] || 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return result;
}
