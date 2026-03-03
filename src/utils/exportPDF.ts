import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DayEntry, HealthGoals } from '../types/health';

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function exportVitalsPDF(
  entries: DayEntry[],
  goals: HealthGoals,
  dateRange: { from: string; to: string },
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // ── Header ──────────────────────────────────────────────────────────
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('VitalTrack – Vitals Summary', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Patient: ${goals.patientName}`, margin, 20);
  doc.text(
    `Period: ${fmtDate(dateRange.from)} – ${fmtDate(dateRange.to)}`,
    pageWidth - margin,
    20,
    { align: 'right' },
  );

  // ── Date-stamped disclaimer ─────────────────────────────────────────
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFontSize(8);
  doc.text(
    `Generated on ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`,
    margin,
    36,
  );

  // ── Goals reference row ─────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Daily Goals:', margin, 44);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Steps ${goals.steps.toLocaleString()}  ·  Water ${goals.waterGlasses} gl  ·  Sleep ${goals.sleepHours} hrs  ·  Calories ${goals.calories.toLocaleString()} kcal  ·  Workout ${goals.workoutMinutes} min`,
    margin + 22,
    44,
  );

  // ── Data table ──────────────────────────────────────────────────────
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  autoTable(doc, {
    startY: 50,
    head: [['Date', 'Steps', 'Water (gl)', 'Sleep (hrs)', 'Calories (kcal)', 'Workout (min)', 'Weight (kg)']],
    body: sorted.map(e => [
      fmtDate(e.date),
      e.steps.toLocaleString(),
      String(e.waterGlasses),
      String(e.sleepHours),
      e.calories.toLocaleString(),
      String(e.workoutMinutes),
      e.weight !== null ? String(e.weight) : '—',
    ]),
    foot: sorted.length > 1
      ? [[
          'Average',
          Math.round(sorted.reduce((s, e) => s + e.steps, 0) / sorted.length).toLocaleString(),
          (sorted.reduce((s, e) => s + e.waterGlasses, 0) / sorted.length).toFixed(1),
          (sorted.reduce((s, e) => s + e.sleepHours, 0) / sorted.length).toFixed(1),
          Math.round(sorted.reduce((s, e) => s + e.calories, 0) / sorted.length).toLocaleString(),
          Math.round(sorted.reduce((s, e) => s + e.workoutMinutes, 0) / sorted.length).toString(),
          '—',
        ]]
      : [],
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: margin, right: margin },
    styles: { cellPadding: 3 },
  });

  // ── Bar chart (steps) ───────────────────────────────────────────────
  const finalY: number = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 50;

  if (sorted.length > 0 && finalY + 60 < doc.internal.pageSize.getHeight()) {
    const chartTop = finalY + 10;
    const chartLeft = margin;
    const chartWidth = pageWidth - margin * 2;
    const chartHeight = 44;
    const barAreaHeight = chartHeight - 14;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('Steps per Day', chartLeft, chartTop + 5);

    const maxSteps = Math.max(...sorted.map(e => e.steps), 1);
    const barW = Math.min(chartWidth / sorted.length - 3, 18);

    sorted.forEach((e, i) => {
      const x = chartLeft + i * (chartWidth / sorted.length) + 1;
      const barH = (e.steps / maxSteps) * barAreaHeight;
      const y = chartTop + 8 + barAreaHeight - barH;

      // color logic: green if goal met, blue otherwise
      const fill: [number, number, number] = e.steps >= goals.steps ? [34, 197, 94] : [37, 99, 235];
      doc.setFillColor(...fill);
      doc.rect(x, y, barW, barH, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      const dayLabel = new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
      doc.text(dayLabel, x + barW / 2, chartTop + 8 + barAreaHeight + 5, { align: 'center' });
    });

    // goal reference line
    const goalY = chartTop + 8 + barAreaHeight - (goals.steps / maxSteps) * barAreaHeight;
    if (goalY >= chartTop + 8) {
      doc.setDrawColor(239, 68, 68);
      doc.setLineWidth(0.3);
      doc.setLineDashPattern([1.5, 1.5], 0);
      doc.line(chartLeft, goalY, chartLeft + chartWidth, goalY);
      doc.setLineDashPattern([], 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(239, 68, 68);
      doc.text(`Goal: ${goals.steps.toLocaleString()}`, chartLeft + chartWidth + 1, goalY + 1);
    }
  }

  // ── Footer ──────────────────────────────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('VitalTrack – Confidential health record', margin, pageHeight - 8);
  doc.text(`Page 1`, pageWidth - margin, pageHeight - 8, { align: 'right' });

  const filename = `vitals-summary-${goals.patientName.replace(/\s+/g, '-').toLowerCase()}-${dateRange.from}_${dateRange.to}.pdf`;
  doc.save(filename);
}
