/**
 * File Handler
 * Processes uploaded files (.txt, .docx) for text extraction
 */

/**
 * Extract text from plain text file
 */
export async function extractTextFromTxt(buffer: Buffer): Promise<string> {
  return buffer.toString("utf-8");
}

/**
 * Extract text from DOCX file
 * DOCX is a ZIP archive containing XML files
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    // Import JSZip dynamically to avoid issues if not installed
    const JSZip = await import("jszip").then((m) => m.default);
    const zip = new JSZip();
    const zipData = await zip.loadAsync(buffer);

    // Read document.xml which contains the main text
    const documentXml = zipData.file("word/document.xml");
    if (!documentXml) {
      throw new Error("Invalid DOCX file: missing document.xml");
    }

    const xmlContent = await documentXml.async("string");

    // Extract text from XML
    // Simple regex-based extraction - matches text between <w:t> tags
    const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    const text = textMatches
      .map((match: string) => {
        const textContent = match.replace(/<w:t[^>]*>|<\/w:t>/g, "");
        return textContent;
      })
      .join(" ");

    return text || "";
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error("Failed to extract text from DOCX file");
  }
}

/**
 * Process uploaded file and extract text
 */
export async function processUploadedFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop();

  if (ext === "txt") {
    return extractTextFromTxt(buffer);
  } else if (ext === "docx") {
    return extractTextFromDocx(buffer);
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }
}

/**
 * Validate file before processing
 */
export function validateFile(
  filename: string,
  size: number
): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedExtensions = ["txt", "docx"];

  const ext = filename.toLowerCase().split(".").pop();

  if (!ext || !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File type not supported. Allowed: ${allowedExtensions.join(", ")}`,
    };
  }

  if (size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit. Current size: ${(size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  return { valid: true };
}
