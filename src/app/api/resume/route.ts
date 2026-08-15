import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumeDocument } from "@/lib/resume-pdf";
import { resume } from "@/content/resume";

// Real PDF generation (not a print-this-page shortcut) — reachable from
// both classic and immersive views per docs/08-roadmap.md Phase 4.
export async function GET() {
  const buffer = await renderToBuffer(createElement(ResumeDocument));
  const filename = `${resume.name.replace(/\s+/g, "-")}-resume.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
