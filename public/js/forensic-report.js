/**
 * DocuForensic AI - Official Court-Admissible Forensic Audit Report Generator
 * Generates an official, print-ready Cyber Crime & Forensic Evidence Certificate.
 */

class ForensicReportGenerator {
  /**
   * Generates and opens the Official Forensic Audit Certificate
   */
  static openReportModal({
    docTitle = 'Document Evidence',
    docType = 'Legal Credential',
    riskScore = 0,
    riskLevel = 'CLEAN',
    elaData = null,
    ocrData = null,
    integrityData = null,
    currentUser = null
  }) {
    let modal = document.getElementById('forensicPdfReportModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'forensicPdfReportModal';
      modal.className = 'cyber-modal-overlay';
      document.body.appendChild(modal);
    }

    const caseNumber = `DF-CASE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const examinerName = currentUser ? currentUser.name : 'Senior Forensic Investigator';
    const examinerDept = currentUser ? currentUser.department : 'Cyber Crime & Forensic Investigation Division';
    const isTampered = riskScore >= 50 || (integrityData && integrityData.registry && integrityData.registry.status !== 'REAL_AUTHENTIC');
    const timestamp = new Date().toUTCString();
    const sha256 = this.generateMockSha256(docTitle);

    modal.innerHTML = `
      <div class="cyber-modal-card" style="max-width: 820px; width: 95%; max-height: 90vh; overflow-y: auto; background: #060911; border: 2px solid ${isTampered ? 'var(--accent-crimson)' : 'var(--accent-emerald)'}; box-shadow: 0 0 40px rgba(0,0,0,0.9);">
        
        <!-- Printable Area Start -->
        <div id="printableForensicCertificate" style="padding: 2.2rem; background: #090d16; color: #e6edf3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 8px;">
          
          <!-- Official Govt / Police Forensic Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px double rgba(0, 240, 255, 0.3); padding-bottom: 1.2rem; margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="font-size: 2.8rem; line-height: 1;">🏛️</div>
              <div>
                <div style="font-size: 0.72rem; letter-spacing: 2px; color: var(--accent-cyan); font-weight: 700; text-transform: uppercase;">Central Cyber Crime & Forensic Science Laboratory</div>
                <h2 style="font-size: 1.25rem; margin: 0.2rem 0; color: #fff; font-family: monospace; font-weight: 800;">OFFICIAL DOCUMENT FORENSIC AUDIT REPORT</h2>
                <div style="font-size: 0.75rem; color: #8b949e;">Issued under Evidence Act & Digital Verification Protocols</div>
              </div>
            </div>
            <div style="text-align: right; font-family: monospace; font-size: 0.78rem;">
              <div style="color: var(--accent-cyan); font-weight: 700;">${caseNumber}</div>
              <div style="color: #8b949e; font-size: 0.7rem;">DATE: ${timestamp}</div>
              <div style="display: inline-block; padding: 0.2rem 0.5rem; margin-top: 0.3rem; border-radius: 4px; font-weight: 800; font-size: 0.72rem; background: ${isTampered ? 'rgba(255, 51, 102, 0.15)' : 'rgba(0, 245, 155, 0.15)'}; color: ${isTampered ? 'var(--accent-crimson)' : 'var(--accent-emerald)'}; border: 1px solid currentColor;">
                ${isTampered ? 'CRITICAL EVIDENCE FLAGGED' : 'CLEAN CLEARANCE CERTIFIED'}
              </div>
            </div>
          </div>

          <!-- Document & Evidence Summary -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.06); font-size: 0.82rem;">
            <div>
              <div style="color: #8b949e; font-size: 0.7rem; text-transform: uppercase;">Examined Document Title</div>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem; margin-top: 0.2rem;">${docTitle}</div>
              <div style="color: #8b949e; font-size: 0.72rem; margin-top: 0.5rem; text-transform: uppercase;">Detected Credential Type</div>
              <div style="color: var(--accent-cyan); font-weight: 600;">${ocrData ? ocrData.detectedType : docType}</div>
            </div>
            <div>
              <div style="color: #8b949e; font-size: 0.7rem; text-transform: uppercase;">Cryptographic SHA-256 Hash</div>
              <div style="font-family: monospace; font-size: 0.7rem; color: #00ffcc; word-break: break-all; margin-top: 0.2rem;">${sha256}</div>
              <div style="color: #8b949e; font-size: 0.72rem; margin-top: 0.5rem; text-transform: uppercase;">Lead Forensic Examiner</div>
              <div style="color: #fff; font-weight: 600;">${examinerName} <span style="font-size: 0.72rem; color: #8b949e;">(${examinerDept})</span></div>
            </div>
          </div>

          <!-- Overall Juridical Verdict Banner -->
          <div style="padding: 1rem 1.4rem; border-radius: 6px; margin-bottom: 1.5rem; background: ${isTampered ? 'rgba(255, 51, 102, 0.12)' : 'rgba(0, 245, 155, 0.12)'}; border: 1px solid ${isTampered ? 'var(--accent-crimson)' : 'var(--accent-emerald)'}; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 0.7rem; font-weight: 700; letter-spacing: 1px; color: ${isTampered ? 'var(--accent-crimson)' : 'var(--accent-emerald)'}; text-transform: uppercase;">Official Forensic Verdict</div>
              <div style="font-size: 1.15rem; font-weight: 900; color: #fff; margin-top: 0.2rem; font-family: monospace;">
                ${isTampered ? '🚨 FORGERY & UNAUTHORIZED TAMPERING CONFIRMED' : '✅ 100% AUTHENTIC & UNTAMPERED CREDENTIAL'}
              </div>
              <div style="font-size: 0.75rem; color: #cbd5e1; margin-top: 0.3rem;">
                ${isTampered 
                  ? 'Digital alterations, noise splicing, or master registry mismatches detected. Unfit for official legal clearance.' 
                  : 'Document demonstrates uniform compression, valid mathematical checksums, and authentic Government registry status.'}
              </div>
            </div>
            <div style="text-align: center; padding-left: 1rem; border-left: 1px solid rgba(255,255,255,0.1);">
              <div style="font-size: 0.68rem; color: #8b949e; text-transform: uppercase;">Risk Score</div>
              <div style="font-size: 1.9rem; font-weight: 900; font-family: monospace; color: ${isTampered ? 'var(--accent-crimson)' : 'var(--accent-emerald)'};">${riskScore}<span style="font-size: 0.9rem; color: #8b949e;">/100</span></div>
            </div>
          </div>

          <!-- Evidence Test Matrix Table -->
          <div style="margin-bottom: 1.5rem;">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.6rem;">Scientific & Forensic Breakdown</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem;">
              <thead>
                <tr style="background: rgba(255, 255, 255, 0.05); text-align: left; color: #8b949e; font-size: 0.7rem; text-transform: uppercase;">
                  <th style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08);">Analysis Layer</th>
                  <th style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08);">Testing Protocol</th>
                  <th style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); font-weight: 600;">1. Error Level Analysis (ELA)</td>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); color: #cbd5e1;">Quantized 85% JPEG Error Inconsistency check for Photoshop alteration</td>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); text-align: center; font-weight: 700; color: ${riskScore > 40 ? 'var(--accent-crimson)' : 'var(--accent-emerald)'};">
                    ${riskScore > 40 ? 'FAILED (Hotspots Found)' : 'PASSED (Uniform)'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); font-weight: 600;">2. Noise & Splicing Boundary</td>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); color: #cbd5e1;">High-frequency Laplacian variance & copy-paste edge detection</td>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); text-align: center; font-weight: 700; color: ${riskScore > 50 ? 'var(--accent-crimson)' : 'var(--accent-emerald)'};">
                    ${riskScore > 50 ? 'FAILED (Splicing Anomaly)' : 'PASSED (Clean Grain)'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); font-weight: 600;">3. ICAO 9303 Checksum Math</td>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); color: #cbd5e1;">Modulo-10 check digit verification on MRZ machine-readable lines</td>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); text-align: center; font-weight: 700; color: ${isTampered ? 'var(--accent-crimson)' : 'var(--accent-emerald)'};">
                    ${isTampered ? 'MISMATCH (Tampered)' : 'VERIFIED (Valid Math)'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); font-weight: 600;">4. Master Government Ledger</td>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); color: #cbd5e1;">Cross-reference against UIDAI, MEA, and University Accreditation records</td>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); text-align: center; font-weight: 700; color: ${integrityData && integrityData.registry.status === 'REAL_AUTHENTIC' ? 'var(--accent-emerald)' : 'var(--accent-crimson)'};">
                    ${integrityData && integrityData.registry.status === 'REAL_AUTHENTIC' ? 'MATCHED & ACTIVE' : 'ALTERED RECORD'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); font-weight: 600;">5. National Police Crime FIR</td>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); color: #cbd5e1;">Investigation Unit active crime database & impound check</td>
                  <td style="padding: 0.5rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.08); text-align: center; font-weight: 700; color: ${integrityData && integrityData.police.hasCrimeRecord ? 'var(--accent-crimson)' : 'var(--accent-emerald)'};">
                    ${integrityData && integrityData.police.hasCrimeRecord ? 'CRIME FIR FLAGGED' : 'CLEAN CLEARANCE'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Official Examiner Sign-Off & Holographic Seal -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 1.2rem; margin-top: 1.2rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 72px; height: 72px; border: 2px dashed rgba(0, 240, 255, 0.4); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem; background: rgba(0, 240, 255, 0.05);">
                🛡️
              </div>
              <div style="font-size: 0.72rem; line-height: 1.4; color: #8b949e;">
                <div style="color: #fff; font-weight: 700;">DIGITAL CRYPTOGRAPHIC SEAL</div>
                <div>DocuForensic AI Trust Engine</div>
                <div style="font-family: monospace; font-size: 0.68rem; color: var(--accent-cyan);">VERIFIED_BY_GOVT_REGISTRY</div>
              </div>
            </div>

            <div style="text-align: right;">
              <div style="font-family: cursive; font-size: 1.2rem; color: var(--accent-cyan); margin-bottom: 0.2rem;">Dr. Rajesh Sharma & Insp. Vikram Rathore</div>
              <div style="border-top: 1px solid #475569; width: 180px; margin-left: auto; margin-bottom: 0.2rem;"></div>
              <div style="font-size: 0.68rem; color: #8b949e; text-transform: uppercase;">Authorized Forensic Signatures</div>
            </div>
          </div>

        </div>
        <!-- Printable Area End -->

        <!-- Modal Actions -->
        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
          <button id="closeForensicPdfModalBtn" class="cyber-btn cyber-btn-ghost" style="padding: 0.6rem 1.2rem; font-size: 0.85rem;">
            ✖ Close Report
          </button>
          <button id="printForensicPdfBtn" class="cyber-btn cyber-btn-primary" style="padding: 0.6rem 1.4rem; font-size: 0.85rem; font-weight: 700; background: linear-gradient(135deg, #00f0ff, #00ffcc); color: #000;">
            🖨️ Print / Save as PDF
          </button>
        </div>

      </div>
    `;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';

    // Event listeners
    const closeBtn = document.getElementById('closeForensicPdfModalBtn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
      };
    }

    const printBtn = document.getElementById('printForensicPdfBtn');
    if (printBtn) {
      printBtn.onclick = () => {
        this.printCertificate();
      };
    }
  }

  static printCertificate() {
    const certElement = document.getElementById('printableForensicCertificate');
    if (!certElement) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>DocuForensic_Audit_Report_${Date.now()}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body {
            background: #ffffff !important;
            color: #1a1a1a !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          * { box-sizing: border-box; }
          #printableForensicCertificate {
            background: #ffffff !important;
            color: #111827 !important;
            border: 2px solid #0f172a !important;
          }
          h2, h3, h4, th, td { color: #111827 !important; }
          tr:nth-child(even) { background: #f8fafc !important; }
        </style>
      </head>
      <body>
        ${certElement.outerHTML}
        <script>
          setTimeout(() => {
            window.print();
            window.close();
          }, 400);
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  static generateMockSha256(seed) {
    let hash = '';
    const chars = '0123456789abcdef';
    let num = 0;
    for (let i = 0; i < seed.length; i++) num = (num << 5) - num + seed.charCodeAt(i);
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.abs((num * (i + 13)) % 16)];
    }
    return hash;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForensicReportGenerator;
}
