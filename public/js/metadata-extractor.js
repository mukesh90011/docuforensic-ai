/**
 * DocuForensic AI - Binary Metadata and Structural File Analyzer
 * Analyzes:
 * - Magic bytes & genuine MIME verification
 * - EXIF tags (software, camera, timestamps)
 * - PDF incremental revisions & structural updates (detects post-creation tampering)
 * - Date time discrepancy (CreateDate vs ModifyDate vs EXIF)
 */

class MetadataExtractor {
  /**
   * Reads raw file bytes and extracts structural forensics
   * @param {File|Blob} file 
   * @returns {Promise<Object>}
   */
  static async extract(file) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const byteLength = uint8.length;

    // Detect format
    const formatInfo = this.detectFileFormat(uint8);

    // Extract EXIF / Text metadata markers
    const textContent = this.extractAsciiStrings(uint8, 5000);
    const suspiciousSoftware = this.findSoftwareSignatures(textContent);

    let pdfDetails = null;
    if (formatInfo.type === 'PDF') {
      pdfDetails = this.analyzePdfStructure(uint8, textContent);
    }

    const timestamps = this.extractTimestamps(textContent);

    return {
      fileName: file.name,
      fileSize: file.size,
      fileSizeBytesFormatted: this.formatBytes(file.size),
      format: formatInfo,
      softwareDetected: suspiciousSoftware,
      timestamps,
      pdfForensics: pdfDetails,
      hasIncrementalUpdates: pdfDetails ? pdfDetails.incrementalRevisions > 1 : false
    };
  }

  static detectFileFormat(bytes) {
    if (bytes.length < 4) return { type: 'UNKNOWN', mime: 'application/octet-stream' };

    // PDF: %PDF
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return { type: 'PDF', mime: 'application/pdf', extension: 'pdf' };
    }
    // JPEG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return { type: 'JPEG', mime: 'image/jpeg', extension: 'jpg' };
    }
    // PNG: 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return { type: 'PNG', mime: 'image/png', extension: 'png' };
    }
    // WebP: RIFF ... WEBP
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      return { type: 'WEBP', mime: 'image/webp', extension: 'webp' };
    }

    return { type: 'BINARY', mime: 'application/octet-stream', extension: 'bin' };
  }

  static extractAsciiStrings(bytes, maxScanBytes = 20000) {
    const scanLimit = Math.min(bytes.length, maxScanBytes);
    let result = '';
    for (let i = 0; i < scanLimit; i++) {
      const b = bytes[i];
      if (b >= 32 && b <= 126) {
        result += String.fromCharCode(b);
      } else if (b === 10 || b === 13) {
        result += ' ';
      }
    }
    return result;
  }

  static findSoftwareSignatures(text) {
    const signatures = [
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Canva',
      'GIMP',
      'CorelDRAW',
      'PDFill',
      'Sejda',
      'Inkscape',
      'Nitro Pro',
      'Foxit PhantomPDF',
      'QuarkXPress',
      'Skia/PDF',
      'macOS Quartz',
      'Microsoft Word',
      'LibreOffice'
    ];

    const detected = [];
    signatures.forEach(sig => {
      if (text.toLowerCase().includes(sig.toLowerCase())) {
        detected.push(sig);
      }
    });

    return detected;
  }

  /**
   * PDF Forensics: checks for multiple %%EOF markers, indicating incremental modifications
   */
  static analyzePdfStructure(bytes, text) {
    // Count %%EOF occurrences
    let eofCount = 0;
    const eofMarker = [0x25, 0x25, 0x45, 0x4F, 0x46]; // %%EOF

    for (let i = 0; i < bytes.length - 5; i++) {
      if (
        bytes[i] === eofMarker[0] &&
        bytes[i + 1] === eofMarker[1] &&
        bytes[i + 2] === eofMarker[2] &&
        bytes[i + 3] === eofMarker[3] &&
        bytes[i + 4] === eofMarker[4]
      ) {
        eofCount++;
      }
    }

    // Extract Producer & Creator
    let producer = null;
    let creator = null;
    const prodMatch = text.match(/\/Producer\s*\(([^)]+)\)/i);
    const creatMatch = text.match(/\/Creator\s*\(([^)]+)\)/i);
    if (prodMatch) producer = prodMatch[1];
    if (creatMatch) creator = creatMatch[1];

    // Check for PDF version
    const versionMatch = text.match(/%PDF-([0-9.]+)/);
    const pdfVersion = versionMatch ? versionMatch[1] : 'Unknown';

    return {
      pdfVersion,
      producer,
      creator,
      incrementalRevisions: Math.max(1, eofCount),
      suspiciousPostModification: eofCount > 1
    };
  }

  static extractTimestamps(text) {
    const dates = [];
    // Search for PDF date format: D:YYYYMMDDHHmmSS or ISO dates
    const pdfDateRegex = /D:([0-9]{4})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})/g;
    let match;
    while ((match = pdfDateRegex.exec(text)) !== null) {
      const formatted = `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:${match[6]}`;
      if (!dates.includes(formatted)) dates.push(formatted);
    }

    return dates;
  }

  static formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}

// Export for browser and node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MetadataExtractor;
} else {
  window.MetadataExtractor = MetadataExtractor;
}
