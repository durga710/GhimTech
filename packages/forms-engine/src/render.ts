/**
 * Print rendering: form documents → standalone print-optimized HTML. The web
 * app serves this through a print stylesheet; browsers produce the PDF. All
 * values arrive pre-masked from the mappers — nothing sensitive is added here.
 */
import type { FormDocument } from "./types.js";

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function money(value: number | undefined): string {
  if (value === undefined) return "";
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US")}`;
}

const WATERMARK_LABELS: Record<FormDocument["watermark"], string> = {
  DRAFT: "DRAFT — NOT FOR FILING",
  REVIEW_COPY: "REVIEW COPY",
  CLIENT_COPY: "CLIENT COPY",
  FILING_COPY: "",
};

export function renderFormHtml(doc: FormDocument): string {
  const watermark = WATERMARK_LABELS[doc.watermark];
  const sections = doc.sections
    .map(
      (section) => `
      <section>
        <h2>${esc(section.title)}</h2>
        <table>
          ${section.lines
            .map(
              (line) => `
            <tr>
              <td class="line">${esc(line.line)}</td>
              <td class="label">${esc(line.label)}</td>
              <td class="value">${line.text !== undefined ? esc(line.text) : money(line.value)}</td>
            </tr>`,
            )
            .join("")}
        </table>
      </section>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(doc.title)}</title>
<style>
  @page { size: letter; margin: 0.75in; }
  body { font-family: Georgia, "Times New Roman", serif; color: #14213d; margin: 0; position: relative; }
  header { border-bottom: 3px double #14213d; padding-bottom: 12px; margin-bottom: 20px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .meta { font-size: 12px; color: #445; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #99a; padding-bottom: 4px; margin: 22px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td { padding: 4px 6px; border-bottom: 1px dotted #ccd; vertical-align: top; }
  td.line { width: 48px; color: #667; }
  td.value { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; width: 120px; }
  .watermark { position: fixed; top: 40%; left: 8%; right: 8%; text-align: center; transform: rotate(-24deg); font-size: 54px; color: rgba(180, 30, 30, 0.14); font-weight: bold; letter-spacing: 0.1em; pointer-events: none; }
  footer { margin-top: 28px; font-size: 11px; color: #667; border-top: 1px solid #99a; padding-top: 8px; }
</style>
</head>
<body>
${watermark ? `<div class="watermark">${esc(watermark)}</div>` : ""}
<header>
  <h1>${esc(doc.title)}</h1>
  <div class="meta">
    Taxpayer: ${esc(doc.taxpayerName)} · ${esc(doc.taxpayerTinMasked)}
    ${doc.spouseName ? ` · Spouse: ${esc(doc.spouseName)} · ${esc(doc.spouseTinMasked ?? "")}` : ""}
  </div>
  <div class="meta">Tax year ${doc.taxYear} · Rule version ${esc(doc.ruleVersion)}</div>
</header>
${sections}
<footer>GhimTech Tax — Built by GhimTech. Prepared with deterministic, versioned tax rules; every value traceable to its source.</footer>
</body>
</html>`;
}
