// CV ni PDF formatda yaratish - jsPDF bilan 3 xil shablon
import { jsPDF } from "jspdf";

const BRAND = [69, 81, 234]; // brand-600 RGB

function safe(v) {
  return v ? String(v) : "";
}

/**
 * cv - { personalInfo, experience, education, skills, languages, template }
 * personalInfo: { fullName, position, phone, email, address, about }
 */
export function downloadCvPdf(cv) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
  const p = cv.personalInfo || {};

  if (cv.template === "classic") drawClassic(doc, p, cv);
  else if (cv.template === "minimal") drawMinimal(doc, p, cv);
  else drawModern(doc, p, cv);

  // Fayl nomi: AliValiyev-CV.pdf
  const name = (safe(p.fullName) || "CV").replace(/\s+/g, "");
  doc.save(`${name}-CV.pdf`);
}

/* ===================== MODERN SHABLON ===================== */
function drawModern(doc, p, cv) {
  // Chap rangli panel
  const sidebarW = 68;
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, sidebarW, 297, "F");

  let sy = 20;
  const sl = 10; // chap panel padding

  // Ism boshi (oq matn)
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(safe(p.fullName).toUpperCase(), sl, sy, { maxWidth: sidebarW - 2 * sl });
  sy += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(safe(p.position), sl, sy, { maxWidth: sidebarW - 2 * sl });

  // Aloqa ma'lumotlari
  sy += 14;
  doc.setFontSize(9);
  doc.setDrawColor(255, 255, 255);
  doc.line(sl, sy - 5, sidebarW - sl, sy - 5);
  const contacts = [
    ["Tel:", p.phone],
    ["Email:", p.email],
    ["Manzil:", p.address],
  ].filter(([, v]) => safe(v));
  for (const [k, v] of contacts) {
    doc.setFont("helvetica", "bold");
    doc.text(k, sl, sy);
    doc.setFont("helvetica", "normal");
    doc.text(safe(v), sl + 13, sy, { maxWidth: sidebarW - sl - 16 });
    sy += Math.max(6, doc.splitTextToSize(safe(v), sidebarW - sl - 16).length * 4.4 + 1.6);
  }

  // Ko'nikmalar (chap panel pastida)
  if ((cv.skills || []).length) {
    sy += 8;
    sectionTitle(doc, "KO'NIKMALAR", sl, sy, "#fff");
    sy += 7;
    doc.setFontSize(9);
    for (const s of cv.skills) {
      doc.circle(sl + 1.2, sy - 1.2, 1, "F");
      doc.text(safe(s), sl + 5, sy, { maxWidth: sidebarW - sl - 8 });
      sy += Math.max(5.4, doc.splitTextToSize(safe(s), sidebarW - sl - 8).length * 4.2);
    }
  }

  // Tillar
  if ((cv.languages || []).length) {
    sy += 8;
    sectionTitle(doc, "TILLAR", sl, sy, "#fff");
    sy += 7;
    doc.setFontSize(9);
    for (const l of cv.languages) {
      doc.circle(sl + 1.2, sy - 1.2, 1, "F");
      doc.text(safe(l), sl + 5, sy, { maxWidth: sidebarW - sl - 8 });
      sy += 5.4;
    }
  }

  /* --- O'ng asosiy ustun --- */
  const mx = sidebarW + 12;
  const mw = W - mx - 14;
  let my = 22;

  doc.setTextColor(40, 40, 60);
  if (safe(p.about)) {
    sectionTitle(doc, "MEN HAQIMDA", mx, my);
    my += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(70, 70, 90);
    my += printWrapped(doc, safe(p.about), mx, my, mw, 4.6) + 6;
  }

  // Ish tajribasi
  if ((cv.experience || []).length) {
    doc.setTextColor(40, 40, 60);
    sectionTitle(doc, "ISH TAJRIBASI", mx, my);
    my += 8;
    for (const e of cv.experience) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 30, 50);
      doc.text(safe(e.position), mx, my);
      my += 5;
      doc.setFont("helvetica", "bolditalic");
      doc.setFontSize(9);
      doc.setTextColor(...BRAND);
      const period = `${safe(e.start)} — ${safe(e.end) || "hozirgacha"}`;
      doc.text(`${safe(e.company)}  |  ${period}`, mx, my);
      my += 4.6;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 90);
      if (safe(e.description)) my += printWrapped(doc, e.description, mx, my, mw, 4.4);
      my += 6;
    }
  }

  // Ta'lim
  if ((cv.education || []).length) {
    doc.setTextColor(40, 40, 60);
    sectionTitle(doc, "TA'LIM", mx, my);
    my += 8;
    for (const ed of cv.education) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 30, 50);
      doc.text(safe(ed.school), mx, my);
      my += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(70, 70, 90);
      doc.text(`${safe(ed.degree)}  |  ${safe(ed.start)}—${safe(ed.end)}`, mx, my);
      my += 8;
    }
  }
}

/* ===================== CLASSIC SHABLON ===================== */
function drawClassic(doc, p, cv) {
  const m = 18; // margin
  const w = W - 2 * m;
  let y = m + 4;

  // Markaziy sarlavha
  doc.setTextColor(25, 25, 35);
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.text(safe(p.fullName), W / 2, y, { align: "center" });
  y += 7;
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 110);
  doc.text(safe(p.position), W / 2, y, { align: "center" });
  y += 6;
  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.text(
    [p.phone, p.email, p.address].filter(safe).join("  •  "),
    W / 2,
    y,
    { align: "center", maxWidth: w }
  );
  y += 6;
  doc.setDrawColor(25, 25, 35);
  doc.setLineWidth(0.6);
  doc.line(m, y, W - m, y);
  y += 10;

  const section = (title) => {
    doc.setFont("times", "bold");
    doc.setFontSize(12.5);
    doc.setTextColor(25, 25, 35);
    doc.text(title.toUpperCase(), m, y);
    y += 2.4;
    doc.setDrawColor(180, 180, 190);
    doc.setLineWidth(0.3);
    doc.line(m, y, W - m, y);
    y += 6;
  };

  if (safe(p.about)) {
    section("Men haqimda");
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 70);
    y += printWrapped(doc, p.about, m, y, w, 4.8) + 6;
  }

  if ((cv.experience || []).length) {
    section("Ish tajribasi");
    for (const e of cv.experience) {
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.setTextColor(25, 25, 35);
      doc.text(`${safe(e.position)}, ${safe(e.company)}`, m, y);
      doc.setFont("times", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(110, 110, 120);
      doc.text(`${safe(e.start)} — ${safe(e.end) || "hozirgacha"}`, W - m, y, { align: "right" });
      y += 5;
      doc.setFont("times", "normal");
      doc.setTextColor(60, 60, 70);
      if (safe(e.description)) y += printWrapped(doc, e.description, m, y, w, 4.6);
      y += 5;
    }
    y += 2;
  }

  if ((cv.education || []).length) {
    section("Ta'lim");
    for (const ed of cv.education) {
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.setTextColor(25, 25, 35);
      doc.text(safe(ed.school), m, y);
      doc.setFont("times", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(110, 110, 120);
      doc.text(`${safe(ed.start)} — ${safe(ed.end)}`, W - m, y, { align: "right" });
      y += 5;
      if (safe(ed.degree)) {
        doc.setFont("times", "normal");
        doc.setTextColor(60, 60, 70);
        doc.text(safe(ed.degree), m, y);
        y += 5;
      }
      y += 3;
    }
    y += 2;
  }

  const listSection = (title, items) => {
    if (!(items || []).length) return;
    section(title);
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 70);
    doc.text(items.map(safe).join("   •   "), m, y, { maxWidth: w });
    y += 10;
  };
  listSection("Ko'nikmalar", cv.skills);
  listSection("Tillar", cv.languages);
}

/* ===================== MINIMAL SHABLON ===================== */
function drawMinimal(doc, p, cv) {
  const m = 18;
  const w = W - 2 * m;
  let y = 26;

  // Chap tekislangan minimal sarlavha
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(20, 20, 25);
  doc.text(safe(p.fullName), m, y);
  y += 8;
  doc.setFont("helvetica", "light");
  doc.setFontSize(12);
  doc.setTextColor(120, 120, 130);
  doc.text(safe(p.position), m, y);
  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 150);
  doc.text([p.phone, p.email, p.address].filter(safe).join("   |   "), m, y);
  y += 4;
  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.8);
  doc.line(m, y, W - m, y);
  y += 12;

  const section = (title) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 160);
    doc.text(title.toUpperCase(), m, y);
    doc.setDrawColor(240, 240, 245);
    doc.line(m + doc.getTextWidth(title.toUpperCase()) + 4, y - 1.2, W - m, y - 1.2);
    y += 7;
  };

  if (safe(p.about)) {
    section("Men haqimda");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 55, 65);
    y += printWrapped(doc, p.about, m, y, w, 4.8) + 7;
  }

  if ((cv.experience || []).length) {
    section("Ish tajribasi");
    for (const e of cv.experience) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 25);
      doc.text(safe(e.position), m, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 150);
      doc.text(`${safe(e.start)} — ${safe(e.end) || "hozirgacha"}`, W - m, y, { align: "right" });
      y += 4.8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...BRAND);
      doc.text(safe(e.company), m, y);
      y += 4.6;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 80);
      if (safe(e.description)) y += printWrapped(doc, e.description, m, y, w, 4.4);
      y += 6;
    }
  }

  if ((cv.education || []).length) {
    section("Ta'lim");
    for (const ed of cv.education) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 25);
      doc.text(safe(ed.school), m, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 150);
      doc.text(`${safe(ed.start)} — ${safe(ed.end)}`, W - m, y, { align: "right" });
      y += 4.8;
      if (safe(ed.degree)) {
        doc.setFontSize(9.5);
        doc.setTextColor(70, 70, 80);
        doc.text(safe(ed.degree), m, y);
        y += 4.6;
      }
      y += 4;
    }
  }

  const inlineList = (title, items) => {
    if (!(items || []).length) return;
    section(title);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 55, 65);
    doc.text(items.map(safe).join("     ·     "), m, y, { maxWidth: w });
    y += 10;
  };
  inlineList("Ko'nikmalar", cv.skills);
  inlineList("Tillar", cv.languages);
}

/* ===================== YORDAMCHILAR ===================== */

// Bo'lim sarlavhasi chizish (rang parametri bilan)
function sectionTitle(doc, text, x, y, color = "#4551ea") {
  const rgb = hexToRgb(color);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...rgb);
  doc.text(text, x, y);
  doc.setDrawColor(...rgb);
  doc.setLineWidth(0.5);
  doc.line(x, y + 1.8, x + doc.getTextWidth(text), y + 1.8);
}

// Matn qatorlar bo'yicha chop etish, ishlatilgan balandlikni qaytaradi
function printWrapped(doc, text, x, y, maxW, lineH) {
  const lines = doc.splitTextToSize(text, maxW);
  doc.text(lines, x, y);
  return lines.length * lineH;
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
