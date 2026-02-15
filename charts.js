// ── Formatting ──

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1000;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

export function formatXP(xp) {
  return new Intl.NumberFormat("en-US").format(xp);
}

function shortXP(xp) {
  if (xp >= 1_000_000) return (xp / 1_000_000).toFixed(1) + "M";
  if (xp >= 1_000) return (xp / 1_000).toFixed(1) + "K";
  return xp.toString();
}

// ── Progress Bar ──

export function createSVGProgressBar(percent, value = "", color = "#3b82f6") {
  const w = 490;
  const filled = (w * Math.max(0, Math.min(100, percent))) / 100;

  return `<svg viewBox="0 0 ${w} 40" width="100%">
    <rect x="0" y="15" width="${w}" height="20" rx="10" fill="#1e293b"/>
    <rect x="0" y="15" width="${filled}" height="20" rx="10" fill="${color}"/>
    <text x="${w - 10}" y="10" font-size="12" font-weight="bold" fill="#94a3b8" text-anchor="end">${value}</text>
  </svg>`;
}

// ── XP Line Chart ──

export function createXPBarChart(monthlyData) {
  if (!monthlyData?.length) return "<p>No data</p>";

  // Same container size as before
  const colW = 80,
    padL = 50,
    padR = 30,
    chartH = 220,
    topPad = 40;
  const bottom = topPad + chartH;
  const svgW = padL + monthlyData.length * colW + padR;
  const svgH = bottom + 50;
  const maxXP = Math.max(...monthlyData.map((d) => d.totalXP));

  let svg = "";

  // Baseline
  svg += `<line x1="${padL}" y1="${bottom}" x2="${svgW - padR}" y2="${bottom}" stroke="#334155"/>`;

  // Plot each month: bar + label
  for (let i = 0; i < monthlyData.length; i++) {
    const entry = monthlyData[i];
    const x = padL + i * colW;
    const barH = maxXP > 0 ? (entry.totalXP / maxXP) * chartH : 0;

    // Solid vertical bar
    svg += `<rect x="${x - 8}" y="${bottom - barH}" width="16" height="${barH}" rx="3" fill="#3b82f6"/>`;

    // Month label (every 3rd + last)
    if (i % 3 === 0 || i === monthlyData.length - 1) {
      const [month, year] = entry.month.split(" ");
      svg += `<text x="${x}" y="${bottom + 18}" text-anchor="middle" font-size="10" fill="#64748b">${month.slice(0, 3)} ${year.slice(2)}</text>`;
    }

    // XP value above the bar (only if non-zero)
    if (entry.totalXP > 0) {
      svg += `<text x="${x}" y="${bottom - barH - 8}" text-anchor="middle" font-size="9" fill="#94a3b8">${shortXP(entry.totalXP)}</text>`;
    }
  }

  return `<svg width="${svgW}" height="${svgH}">${svg}</svg>`;
}

// ── Projects Bar Chart ──

export function createProjectsSVG(projects) {
  if (!projects?.length) return "<p>No projects</p>";

  const rowH = 40,
    labelW = 200,
    barMax = 300;
  const svgW = labelW + barMax + 80;
  const svgH = projects.length * rowH + 10;
  const maxXP = Math.max(...projects.map((p) => p.xp));

  let svg = "";
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const y = i * rowH + 5;
    const barW = maxXP > 0 ? (p.xp / maxXP) * barMax : 0;

    svg += `<text x="${labelW - 10}" y="${y + 24}" text-anchor="end" font-size="12" fill="#cbd5e1">${p.name}</text>`;
    svg += `<rect x="${labelW}" y="${y + 8}" width="${barW}" height="22" rx="4" fill="#3b82f6"/>`;
    svg += `<text x="${labelW + barW + 8}" y="${y + 24}" font-size="11" fill="#94a3b8" font-weight="600">${formatBytes(p.xp)}</text>`;
  }

  return `<svg width="${svgW}" height="${svgH}">${svg}</svg>`;
}
