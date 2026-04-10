import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function exportReportToPdf({ reportDraft, entities, selectedBpcSummary }) {
  if (!reportDraft || !reportDraft.trim()) {
    throw new Error("Generate a report draft first before exporting PDF.");
  }

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.background = "#ffffff";
  container.style.padding = "28px 34px";
  container.style.color = "#111827";
  container.style.fontFamily = "Noto Sans Bengali, Kalpurush, SolaimanLipi, Arial, sans-serif";
  container.style.lineHeight = "1.58";

  container.innerHTML = `
    <div style="background:#082f49;color:#fff;padding:10px 14px;border-radius:8px 8px 0 0;font-size:16px;font-weight:700;">
      Dhaka Metropolitan Police - DMP Shohayok
    </div>
    <div style="border-top:4px solid #047857;margin-top:4px;"></div>
    <h2 style="margin:16px 0 8px;font-size:18px;">POLICE REPORT</h2>
    <div style="font-size:13px;margin-bottom:10px;">
      <strong>Station:</strong> ${escapeHtml(entities.location_thana || "[Thana Name]")}
      &nbsp;&nbsp;&nbsp; <strong>Report No:</strong> [Auto/Manual]
    </div>
    <div style="font-size:13px;margin-bottom:12px;">
      <strong>Date:</strong> ${escapeHtml(entities.incident_date || "[DD/MM/YYYY]")}
      &nbsp;&nbsp;&nbsp; <strong>Time:</strong> ${escapeHtml(entities.incident_time || "[HH:MM]")}
    </div>
    ${
      selectedBpcSummary
        ? `<div style="font-size:13px;margin-bottom:12px;"><strong>Applicable Sections:</strong> ${escapeHtml(selectedBpcSummary)}</div>`
        : ""
    }
    <div style="font-size:14px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(reportDraft)}</div>
    <div style="margin-top:28px;font-size:12px;display:flex;justify-content:space-between;">
      <div style="width:45%;border-top:1px solid #6b7280;padding-top:6px;">Duty Officer Signature</div>
      <div style="width:45%;border-top:1px solid #6b7280;padding-top:6px;text-align:right;">Official Seal / Stamp</div>
    </div>
  `;

  document.body.appendChild(container);
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font readiness errors and continue rendering
    }
  }

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });
  document.body.removeChild(container);

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/png");

  let heightLeft = imgHeight;
  let position = margin;
  pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
  heightLeft -= pageHeight - margin * 2;

  while (heightLeft > 0) {
    position = margin - (imgHeight - heightLeft);
    pdf.addPage();
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  pdf.save("dmp-police-report.pdf");
}
