const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const samplesDir = path.join(__dirname, '..', 'public', 'samples');

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });
if (!fs.existsSync(samplesDir)) fs.mkdirSync(samplesDir, { recursive: true });

// 1. App Icon SVG
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a101d"/>
      <stop offset="50%" stop-color="#0d1b2a"/>
      <stop offset="100%" stop-color="#050a12"/>
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f0ff"/>
      <stop offset="100%" stop-color="#0077ff"/>
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#7928ca" stop-opacity="0.9"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>
  <rect width="504" height="504" x="4" y="4" rx="106" fill="none" stroke="#00f0ff" stroke-opacity="0.3" stroke-width="4"/>

  <!-- Forensic Grid Pattern -->
  <g stroke="#00f0ff" stroke-opacity="0.08" stroke-width="1.5">
    <line x1="64" y1="64" x2="448" y2="64"/>
    <line x1="64" y1="128" x2="448" y2="128"/>
    <line x1="64" y1="192" x2="448" y2="192"/>
    <line x1="64" y1="256" x2="448" y2="256"/>
    <line x1="64" y1="320" x2="448" y2="320"/>
    <line x1="64" y1="384" x2="448" y2="384"/>
    <line x1="64" y1="448" x2="448" y2="448"/>
    <line x1="128" y1="64" x2="128" y2="448"/>
    <line x1="192" y1="64" x2="192" y2="448"/>
    <line x1="256" y1="64" x2="256" y2="448"/>
    <line x1="320" y1="64" x2="320" y2="448"/>
    <line x1="384" y1="64" x2="384" y2="448"/>
  </g>

  <!-- Document Silhouette -->
  <path d="M140 100 H310 L380 170 V410 H140 Z" fill="#131e33" stroke="url(#cyanGrad)" stroke-width="6" rx="8" filter="url(#glow)"/>
  <!-- Folded Corner -->
  <path d="M310 100 V170 H380 Z" fill="#1e2f4f" stroke="url(#cyanGrad)" stroke-width="4"/>

  <!-- Scanning Laser Beam -->
  <line x1="110" y1="260" x2="410" y2="260" stroke="#00f0ff" stroke-width="5" filter="url(#glow)"/>
  <rect x="130" y="240" width="260" height="40" fill="#00f0ff" fill-opacity="0.15"/>

  <!-- Forensic Shield Emblem in Center -->
  <path d="M256 180 C310 180 340 210 340 270 C340 340 256 385 256 385 C256 385 172 340 172 270 C172 210 202 180 256 180 Z" 
        fill="url(#shieldGrad)" stroke="#00f0ff" stroke-width="5" filter="url(#glow)"/>

  <!-- Security Check Icon inside Shield -->
  <path d="M225 275 L248 298 L295 245" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Binary Matrix Details -->
  <circle cx="160" cy="130" r="4" fill="#00f0ff"/>
  <circle cx="180" cy="130" r="4" fill="#00f0ff"/>
  <circle cx="200" cy="130" r="4" fill="#00f0ff"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), iconSvg);
fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), iconSvg);
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), iconSvg);

// Generate SVG based sample documents:
// Sample 1: Tampered Passport (Photo altered, MRZ checksum mismatch)
const passportSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 680" width="1000" height="680">
  <defs>
    <linearGradient id="passBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141a29"/>
      <stop offset="100%" stop-color="#0a0e17"/>
    </linearGradient>
    <filter id="alteredGlow">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#ff0055" flood-opacity="0.7"/>
    </filter>
  </defs>

  <rect width="1000" height="680" rx="20" fill="url(#passBg)" stroke="#303b54" stroke-width="4"/>

  <!-- Guilloche Security Pattern simulation -->
  <g stroke="#233554" stroke-width="1.2" fill="none" opacity="0.4">
    <ellipse cx="500" cy="340" rx="420" ry="280"/>
    <ellipse cx="500" cy="340" rx="380" ry="240"/>
    <ellipse cx="500" cy="340" rx="340" ry="200"/>
    <circle cx="500" cy="340" r="160"/>
    <circle cx="500" cy="340" r="120"/>
  </g>

  <!-- Header -->
  <text x="60" y="70" font-family="'Courier New', monospace" font-size="28" font-weight="bold" fill="#00f0ff" letter-spacing="4">UNITED FEDERATION PASSPORT</text>
  <text x="60" y="100" font-family="'Segoe UI', sans-serif" font-size="14" fill="#8892b0">PASSEPORT / OFFICIAL TRAVEL DOCUMENT</text>
  <line x1="60" y1="120" x2="940" y2="120" stroke="#00f0ff" stroke-width="2" opacity="0.4"/>

  <!-- Photo Box (TAMPERED: Spliced photo boundary) -->
  <g filter="url(#alteredGlow)">
    <rect x="70" y="150" width="220" height="280" rx="8" fill="#1b253b" stroke="#ff0055" stroke-width="3" stroke-dasharray="6,3"/>
    <!-- Photo Avatar -->
    <circle cx="180" cy="240" r="50" fill="#2d3f66"/>
    <path d="M120 370 C120 300 240 300 240 370 Z" fill="#2d3f66"/>
    <!-- Stamp splice cut -->
    <path d="M220 180 L290 250" stroke="#ff0055" stroke-width="2"/>
    <text x="75" y="450" font-family="sans-serif" font-size="11" fill="#ff4d79" font-weight="bold">[TAMPERED PHOTO SPLICE DETECTED]</text>
  </g>

  <!-- Bio Fields -->
  <g font-family="'Segoe UI', monospace" font-size="13" fill="#8892b0">
    <text x="330" y="165">TYPE / TYPE</text>
    <text x="330" y="190" font-size="18" fill="#ffffff" font-weight="bold">P</text>

    <text x="450" y="165">CODE / CODE</text>
    <text x="450" y="190" font-size="18" fill="#ffffff" font-weight="bold">UTO</text>

    <text x="620" y="165">PASSPORT NO. / NO DU PASSEPORT</text>
    <!-- TAMPERED NUMBER WITH DIFFERENT FONT & ARTIFACT -->
    <text x="620" y="190" font-size="20" fill="#ffdd55" font-weight="bold" font-family="'Arial Black', sans-serif">A98442109</text>

    <text x="330" y="235">SURNAME / NOM</text>
    <text x="330" y="260" font-size="19" fill="#ffffff" font-weight="bold">VANCE</text>

    <text x="330" y="305">GIVEN NAMES / PRENOMS</text>
    <text x="330" y="330" font-size="19" fill="#ffffff" font-weight="bold">ELIZABETH CLARA</text>

    <text x="330" y="375">NATIONALITY / NATIONALITE</text>
    <text x="330" y="400" font-size="17" fill="#ffffff">UTOPIAN</text>

    <text x="560" y="375">DATE OF BIRTH / DATE DE NAISSANCE</text>
    <text x="560" y="400" font-size="17" fill="#ffffff">14 AUG / AOU 1989</text>

    <text x="780" y="375">SEX / SEXE</text>
    <text x="780" y="400" font-size="17" fill="#ffffff">F</text>
  </g>

  <!-- MRZ Zone (ICAO 9303) WITH INVALID CHECK DIGIT -->
  <rect x="50" y="520" width="900" height="130" rx="8" fill="#060911" stroke="#233554" stroke-width="2"/>
  <text x="75" y="565" font-family="'Courier New', monospace" font-size="23" fill="#00f0ff" letter-spacing="3.8">P&lt;UTOVANCE&lt;&lt;ELIZABETH&lt;CLARA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
  <!-- Line 2: Document number A98442109 followed by INVALID check digit '9' instead of '4', triggering MRZ failure! -->
  <text x="75" y="615" font-family="'Courier New', monospace" font-size="23" fill="#ff0055" letter-spacing="3.8">A984421099UTO8908144F3112318&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</text>
</svg>`;

// Sample 2: Altered Invoice (Math calculation mismatch & cloned stamp)
const invoiceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100" width="900" height="1100">
  <rect width="900" height="1100" fill="#0d131f" stroke="#233554" stroke-width="4"/>

  <!-- Brand / Header -->
  <text x="60" y="90" font-family="'Segoe UI', sans-serif" font-size="28" font-weight="900" fill="#00f0ff">APEX CLOUD LOGISTICS INC.</text>
  <text x="60" y="120" font-family="sans-serif" font-size="14" fill="#8892b0">Tax ID: US-882941049 | 100 Tech Boulevard, Suite 400</text>
  <line x1="60" y1="150" x2="840" y2="150" stroke="#233554" stroke-width="2"/>

  <!-- Meta Info -->
  <text x="60" y="200" font-family="sans-serif" font-size="14" fill="#8892b0">INVOICE NUMBER:</text>
  <text x="60" y="225" font-family="monospace" font-size="18" fill="#ffffff" font-weight="bold">INV-2026-99042</text>

  <text x="320" y="200" font-family="sans-serif" font-size="14" fill="#8892b0">ISSUE DATE:</text>
  <text x="320" y="225" font-family="sans-serif" font-size="16" fill="#ffffff">October 14, 2026</text>

  <text x="580" y="200" font-family="sans-serif" font-size="14" fill="#8892b0">PAYMENT TERMS:</text>
  <text x="580" y="225" font-family="sans-serif" font-size="16" fill="#00f0ff">Net 30 Days</text>

  <!-- Table Header -->
  <rect x="60" y="270" width="780" height="45" fill="#141d2f" rx="4"/>
  <text x="80" y="300" font-family="sans-serif" font-size="14" font-weight="bold" fill="#00f0ff">DESCRIPTION</text>
  <text x="460" y="300" font-family="sans-serif" font-size="14" font-weight="bold" fill="#00f0ff">QTY</text>
  <text x="570" y="300" font-family="sans-serif" font-size="14" font-weight="bold" fill="#00f0ff">UNIT PRICE</text>
  <text x="730" y="300" font-family="sans-serif" font-size="14" font-weight="bold" fill="#00f0ff">AMOUNT</text>

  <!-- Items -->
  <text x="80" y="360" font-family="sans-serif" font-size="15" fill="#ffffff">High-Availability Cloud Cluster Node (Month)</text>
  <text x="470" y="360" font-family="monospace" font-size="15" fill="#ffffff">4</text>
  <text x="570" y="360" font-family="monospace" font-size="15" fill="#ffffff">$600.00</text>
  <text x="730" y="360" font-family="monospace" font-size="15" fill="#ffffff">$2,400.00</text>

  <line x1="60" y1="390" x2="840" y2="390" stroke="#1b253b" stroke-width="1"/>

  <text x="80" y="430" font-family="sans-serif" font-size="15" fill="#ffffff">Dedicated Fiber Gateway Tunnel (10 Gbps)</text>
  <text x="470" y="430" font-family="monospace" font-size="15" fill="#ffffff">1</text>
  <text x="570" y="430" font-family="monospace" font-size="15" fill="#ffffff">$800.00</text>
  <text x="730" y="430" font-family="monospace" font-size="15" fill="#ffffff">$800.00</text>

  <line x1="60" y1="460" x2="840" y2="460" stroke="#1b253b" stroke-width="1"/>

  <!-- Math Calculations Breakdown -->
  <text x="520" y="550" font-family="sans-serif" font-size="15" fill="#8892b0">Subtotal:</text>
  <text x="730" y="550" font-family="monospace" font-size="16" fill="#ffffff">$3,200.00</text>

  <text x="520" y="590" font-family="sans-serif" font-size="15" fill="#8892b0">Tax (8.25%):</text>
  <text x="730" y="590" font-family="monospace" font-size="16" fill="#ffffff">$264.00</text>

  <!-- TAMPERED TOTAL FIELD (Original should be $3,464.00, edited to $9,464.00) -->
  <rect x="490" y="630" width="350" height="70" fill="#24111d" stroke="#ff0055" stroke-width="3" rx="8"/>
  <text x="510" y="675" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ff4d79">TOTAL DUE:</text>
  <text x="680" y="678" font-family="'Impact', sans-serif" font-size="28" fill="#ff0055">$9,464.00</text>
  <text x="510" y="720" font-family="sans-serif" font-size="12" fill="#ff6b8b">[ARITHMETIC DISCREPANCY: 3,200 + 264 != 9,464]</text>

  <!-- Cloned Audit Stamp -->
  <g transform="translate(120, 680) rotate(-12)">
    <rect width="180" height="80" rx="10" fill="none" stroke="#ff0055" stroke-width="3" stroke-dasharray="8,4"/>
    <text x="25" y="48" font-family="sans-serif" font-size="18" font-weight="900" fill="#ff0055">VERIFIED</text>
    <text x="28" y="68" font-family="sans-serif" font-size="10" fill="#ff4d79">OFFICIAL AUDIT</text>
  </g>

  <!-- IBAN Information -->
  <text x="60" y="850" font-family="sans-serif" font-size="14" fill="#8892b0">REMITTANCE IBAN:</text>
  <!-- Invalid IBAN checksum -->
  <text x="60" y="880" font-family="monospace" font-size="16" fill="#ffdd55">DE89 3704 0044 0532 0130 99</text>
</svg>`;

// Sample 3: Authentic Clean Certificate (Score: 4%, Clean)
const cleanCertSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <rect width="1000" height="700" fill="#080f1a" stroke="#00f0ff" stroke-width="3"/>
  <rect x="20" y="20" width="960" height="660" fill="none" stroke="#1d2d48" stroke-width="2"/>

  <!-- Ornate corners -->
  <path d="M40 70 V40 H70 M930 40 H960 V70 M960 630 V660 H930 M70 660 H40 V630" stroke="#00f0ff" stroke-width="3" fill="none"/>

  <text x="500" y="120" text-anchor="middle" font-family="'Georgia', serif" font-size="34" font-weight="bold" fill="#00f0ff">NATIONAL ACCREDITATION BOARD</text>
  <text x="500" y="160" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#8892b0" letter-spacing="3">OFFICIAL CERTIFICATE OF AUTHENTICITY</text>
  <line x1="250" y1="180" x2="750" y2="180" stroke="#233554" stroke-width="2"/>

  <text x="500" y="240" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#ccd6f6">This is to certify that the credentials of</text>
  <text x="500" y="300" text-anchor="middle" font-family="'Georgia', serif" font-size="36" font-weight="bold" fill="#ffffff">DR. ELEANOR STERLING</text>
  <text x="500" y="350" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#ccd6f6">have been rigorously examined and confirmed compliant under Registry ISO-17024.</text>

  <g transform="translate(200, 480)">
    <line x1="0" y1="50" x2="220" y2="50" stroke="#485c7e" stroke-width="1.5"/>
    <text x="110" y="75" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#8892b0">Director General</text>
  </g>

  <!-- Authentic Verified Cryptographic Seal -->
  <g transform="translate(500, 520)">
    <circle r="55" fill="#0d1b2a" stroke="#00f0ff" stroke-width="3"/>
    <circle r="46" fill="none" stroke="#00f0ff" stroke-width="1" stroke-dasharray="4,2"/>
    <text y="5" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#00f0ff">OFFICIAL SEAL</text>
  </g>

  <g transform="translate(600, 480)">
    <line x1="0" y1="50" x2="220" y2="50" stroke="#485c7e" stroke-width="1.5"/>
    <text x="110" y="75" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#8892b0">Registrar of Records</text>
  </g>

  <text x="500" y="640" text-anchor="middle" font-family="monospace" font-size="12" fill="#485c7e">VERIFICATION HASH: 8f4b0021c4e97a33d99e52b801a2f64c1e099b24</text>
</svg>`;

fs.writeFileSync(path.join(samplesDir, 'sample-passport-tampered.svg'), passportSvg);
fs.writeFileSync(path.join(samplesDir, 'sample-invoice-tampered.svg'), invoiceSvg);
fs.writeFileSync(path.join(samplesDir, 'sample-certificate-clean.svg'), cleanCertSvg);

console.log('Sample documents and icons generated successfully in public/samples and public/icons');
