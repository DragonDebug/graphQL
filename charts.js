// ── Formatting ──

export function formatBytes(bytes, decimals = 0) {
  if (bytes === 0) return "0 Bytes";
  const k = 1000;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  const factor = Math.pow(10, decimals);
  const rounded = Math.round((bytes / Math.pow(k, i)) * factor) / factor;
  return rounded + " " + sizes[i];
}

// ── Progress Bar ──

export function createSVGProgressBar(percent, value = "", color = "#3b82f6") {
  const totalWidth = 490;

  // percent value between 0 and 100
  let percentValue = percent;
  if (percentValue < 0) percentValue = 0;
  if (percentValue > 100) percentValue = 100;

  let filledWidth = (totalWidth * percentValue) / 100;
  let labelX = totalWidth - 10;

  let background = `<rect x="0" y="15" width="${totalWidth}" height="20" rx="10" fill="#1e293b"/>`;
  let filled = `<rect x="0" y="15" width="${filledWidth}" height="20" rx="10" fill="${color}"/>`;
  let label = `<text x="${labelX}" y="10" font-size="12" font-weight="bold" fill="#94a3b8" text-anchor="end">${value}</text>`;

  return `<svg viewBox="0 0 ${totalWidth} 40" width="100%">
    ${background}
    ${filled}
    ${label}
  </svg>`;
}

// ── XP Line Chart ──

export function createXPBarChart(monthlyData) {
  if (!monthlyData?.length) return "<p>No data</p>";

  // ── Layout constants ──
  const columnWidth = 80;
  const paddingLeft = 50;
  const paddingRight = 30;
  const chartHeight = 220;
  const topPadding = 40;

  // ── Derived dimensions ──
  const bottomY = topPadding + chartHeight;
  const svgWidth =
    paddingLeft + monthlyData.length * columnWidth + paddingRight;
  const svgHeight = bottomY + 50;

  // ── Find the highest XP to scale bars against ──
  const allXPValues = monthlyData.map((d) => d.totalXP);
  const maxXP = Math.max(...allXPValues);

  // ── Start building SVG content ──
  let svgContent = "";

  // Draw the horizontal baseline
  svgContent += `<line x1="${paddingLeft}" y1="${bottomY}" x2="${svgWidth - paddingRight}" y2="${bottomY}" stroke="#334155"/>`;

  // ── Draw each month's bar ──
  for (let i = 0; i < monthlyData.length; i++) {
    const entry = monthlyData[i];
    const centerX = paddingLeft + i * columnWidth;

    // Calculate bar height proportional to max XP
    let barHeight = 0;
    if (maxXP > 0) {
      barHeight = (entry.totalXP / maxXP) * chartHeight;
    }

    // Draw the bar
    const barX = centerX - 8;
    const barY = bottomY - barHeight;
    svgContent += `<rect x="${barX}" y="${barY}" width="16" height="${barHeight}" rx="3" fill="#3b82f6"/>`;

    // Show month label for every month
    const [month, year] = entry.month.split(" ");
    const shortMonth = month.slice(0, 3);
    const shortYear = year.slice(2);
    const labelY = bottomY + 18;
    svgContent += `<text x="${centerX}" y="${labelY}" text-anchor="middle" font-size="10" fill="#64748b">${shortMonth} ${shortYear}</text>`;

    // Show XP value above the bar (skip if zero)
    if (entry.totalXP > 0) {
      const valueY = barY - 8;
      const label = formatBytes(entry.totalXP);
      svgContent += `<text x="${centerX}" y="${valueY}" text-anchor="middle" font-size="9" fill="#94a3b8">${label}</text>`;
    }
  }

  return `<svg width="${svgWidth}" height="${svgHeight}">${svgContent}</svg>`;
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
