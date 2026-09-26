// Shrinks photos in the browser before upload so they fit the ~4 MB request
// limit and upload fast. Other files pass through unchanged.

const MAX_SIDE = 1800;

export async function prepareFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // e.g. HEIC in browsers that can't decode it
  }
}

export const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// For <input accept>: extensions for desktop pickers, MIME types for phone pickers.
export const ACCEPTED_FILES = [".pdf", ".docx", ".txt", ".md", ".csv", ".tsv", "application/pdf", DOCX_TYPE, "text/plain", "image/*"].join(",");

export function fileKind(file: File) {
  const n = file.name.toLowerCase();
  if (file.type === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  if (file.type.startsWith("image/")) return "image";
  if (file.type === DOCX_TYPE || n.endsWith(".docx")) return "doc";
  if (n.endsWith(".doc") || file.type === "application/msword") return "old-doc";
  if (/\.(txt|md|csv|tsv)$/.test(n)) return "text";
  return "other";
}

// Pulls the plain text out of a Word (.docx) file, in the browser.
export async function readDocx(file: File) {
  const mammoth = (await import("mammoth")).default;
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  // Word separates every paragraph with a blank line; one line each reads better.
  return value.replace(/\n\s*\n/g, "\n").trim();
}
