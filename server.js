try {
  require('dotenv').config();
} catch (e) {
  // In cloud environments (Render, Cloud Run, Vercel), env vars are provided directly by host
}
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const nodemailer = require('nodemailer');

const DocumentValidator = require('./public/js/document-validator');
const MetadataExtractor = require('./public/js/metadata-extractor');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Global tunnel URL store
let activeTunnelUrl = 'https://clear-dancers-wonder.loca.lt';

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Setup temporary upload storage for large documents
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Setup Central Multi-Device Database Storage
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'database.json');

function getDb() {
  try {
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading central database:', e);
  }
  return { users: [], masterRegistry: [], policeDatabase: [], scans: [] };
}

function saveDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing central database:', e);
    return false;
  }
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 40 * 1024 * 1024 } // 40MB limit
});

// Helper to get local IPv4 address
function getLocalIpv4() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

// Serve public static frontend & PWA assets with fresh no-cache headers for instant updates
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    if (filePath.endsWith('.webmanifest')) {
      res.setHeader('Content-Type', 'application/manifest+json');
    }
  }
}));

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    version: '1.0.0',
    app: 'DocuForensic AI',
    timestamp: new Date().toISOString()
  });
});

// ===================================================================
// CENTRAL MULTI-DEVICE DATABASE API (Real-Time Sync Across Phones & PCs)
// ===================================================================

// 1. Full Database Sync for Clients
app.get('/api/db/sync', (req, res) => {
  const db = getDb();
  res.json({
    success: true,
    users: db.users || [],
    masterRegistry: db.masterRegistry || [],
    policeDatabase: db.policeDatabase || [],
    scans: db.scans || [],
    timestamp: new Date().toISOString()
  });
});

// 2. Central User Registration
app.post('/api/db/user/register', (req, res) => {
  const { firstName, surname, name, email, password, role, title, department } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required.' });
  }

  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();
  const existing = (db.users || []).find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ success: false, error: 'This Gmail is already registered in Central Database.' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    firstName: firstName || 'Agent',
    surname: surname || '',
    name: name || `${firstName} ${surname}`.trim(),
    email: cleanEmail,
    password: password,
    role: role || 'citizen',
    title: title || (role === 'police' ? 'Police Inspector' : role === 'issuer' ? 'Govt Registrar' : 'Citizen Document Holder'),
    department: department || 'Cyber Verification Division',
    avatar: role === 'police' ? '👮' : role === 'issuer' ? '🏛️' : '👤',
    verifiedGmail: true,
    createdAt: new Date().toISOString()
  };

  db.users = db.users || [];
  db.users.push(newUser);
  saveDb(db);

  console.log(`👤 [Central DB]: User registered successfully: ${newUser.email} (${newUser.role})`);
  res.json({ success: true, user: newUser });
});

// 3. Central User Login
app.post('/api/db/user/login', (req, res) => {
  const { email, password, role } = req.body;
  const db = getDb();
  const cleanEmail = (email || '').trim().toLowerCase();

  const user = (db.users || []).find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid Gmail address or Cyber Password.' });
  }

  // If role specified and doesn't match
  if (role && user.role !== role) {
    return res.status(403).json({ 
      success: false, 
      error: `Access Denied: Account registered as "${user.role.toUpperCase()}", not "${role.toUpperCase()}".` 
    });
  }

  res.json({ success: true, user });
});

// 4. Central Issuing Authority: Issue New Official Record
app.post('/api/db/registry/issue', (req, res) => {
  const record = req.body;
  if (!record || !record.docNumber) {
    return res.status(400).json({ success: false, error: 'Document Number is required.' });
  }

  const db = getDb();
  db.masterRegistry = db.masterRegistry || [];

  const newRecord = {
    id: `REG-${Date.now()}`,
    docNumber: record.docNumber.trim(),
    docType: record.docType || 'Official Credential',
    holderName: record.holderName || 'Authorized Holder',
    fatherName: record.fatherName || '',
    dob: record.dob || '',
    address: record.address || '',
    issuedBy: record.issuedBy || 'Government / University Registry',
    issueDate: record.issueDate || new Date().toISOString().split('T')[0],
    sampleType: record.sampleType || 'clean',
    status: record.status || 'AUTHENTIC_ACTIVE',
    securityFeatures: record.securityFeatures || ['Cryptographic Ledger Hash', 'Digital Seal'],
    crimeRecord: false
  };

  db.masterRegistry.unshift(newRecord);
  saveDb(db);

  console.log(`🏛️ [Central DB]: New document issued into Master Ledger: ${newRecord.docNumber}`);
  res.json({ success: true, record: newRecord });
});

// 5. Central Police Database: Flag / Impound Document
app.post('/api/db/police/flag', (req, res) => {
  const fir = req.body;
  if (!fir || !fir.linkedDocNumber) {
    return res.status(400).json({ success: false, error: 'Linked Document Number is required.' });
  }

  const db = getDb();
  db.policeDatabase = db.policeDatabase || [];

  const newFir = {
    firNumber: fir.firNumber || `FIR #${Math.floor(100 + Math.random() * 900)}/${new Date().getFullYear()}`,
    caseTitle: fir.caseTitle || 'Criminal Forgery & Fraud Investigation',
    suspectName: fir.suspectName || 'Unknown Suspect / Impersonator',
    linkedDocNumber: fir.linkedDocNumber.trim(),
    policeStation: fir.policeStation || 'Central Cyber Crime Police Station',
    sections: fir.sections || 'Section 468, 471 IPC (Forgery of Valuable Security)',
    status: 'IMPOUNDED / ACTIVE INVESTIGATION',
    severity: 'HIGH_CRIME',
    details: fir.details || 'Document flagged for unauthorized tampering and impounded by Cyber Police Unit.',
    timestamp: new Date().toISOString()
  };

  db.policeDatabase.unshift(newFir);

  // Also update masterRegistry status if present
  if (db.masterRegistry) {
    const match = db.masterRegistry.find(r => r.docNumber === newFir.linkedDocNumber);
    if (match) {
      match.crimeRecord = true;
      match.linkedFir = newFir.firNumber;
      match.status = 'OFFICIAL_RECORD_TAMPERED';
    }
  }

  saveDb(db);

  console.log(`👮 [Central DB]: Document impounded by Police in Central Ledger: ${newFir.linkedDocNumber}`);
  res.json({ success: true, fir: newFir });
});

// 6. Central Network Scan Logging & Duplicate Cross-Device Tracking
app.post('/api/db/scan/record', (req, res) => {
  const { title, sampleType, riskScore, verdict, checksum } = req.body;
  const db = getDb();
  db.scans = db.scans || [];

  const lowerTitle = (title || '').toLowerCase();
  const priorScans = db.scans.filter(s => {
    if (sampleType && s.sampleType === sampleType) return true;
    if (checksum && s.checksum === checksum) return true;
    if (lowerTitle && s.title && s.title.toLowerCase().includes(lowerTitle)) return true;
    return false;
  });

  const scanCount = priorScans.length + 1;
  const isPreUploaded = priorScans.length > 0;
  const firstSeen = isPreUploaded ? priorScans[priorScans.length - 1] : null;

  const newScan = {
    id: `SCAN-${Date.now()}`,
    title: title || 'Unknown Document',
    sampleType: sampleType || null,
    riskScore: riskScore || 0,
    verdict: verdict || 'UNKNOWN',
    checksum: checksum || null,
    timestamp: new Date().toISOString()
  };

  db.scans.unshift(newScan);
  // Keep last 500 scans
  if (db.scans.length > 500) db.scans.pop();
  saveDb(db);

  res.json({
    success: true,
    scanCount,
    isPreUploaded,
    firstSeen: firstSeen ? firstSeen.timestamp : newScan.timestamp,
    totalNetworkScans: db.scans.length
  });
});

// 7. Client Rehydration & Resilient Storage Sync (Prevents Container Restart Data Loss)
app.post('/api/db/client-sync', (req, res) => {
  const clientData = req.body;
  if (!clientData) return res.json({ success: true });

  const db = getDb();
  let changed = false;

  // Merge users
  if (Array.isArray(clientData.users)) {
    clientData.users.forEach(cu => {
      if (cu.email && !db.users.some(u => u.email.toLowerCase() === cu.email.toLowerCase())) {
        db.users.push(cu);
        changed = true;
      }
    });
  }

  // Merge masterRegistry
  if (Array.isArray(clientData.masterRegistry)) {
    clientData.masterRegistry.forEach(cr => {
      if (cr.docNumber && !db.masterRegistry.some(r => r.docNumber === cr.docNumber)) {
        db.masterRegistry.unshift(cr);
        changed = true;
      }
    });
  }

  // Merge policeDatabase
  if (Array.isArray(clientData.policeDatabase)) {
    clientData.policeDatabase.forEach(cp => {
      if (cp.linkedDocNumber && !db.policeDatabase.some(p => p.linkedDocNumber === cp.linkedDocNumber)) {
        db.policeDatabase.unshift(cp);
        changed = true;
      }
    });
  }

  if (changed) {
    saveDb(db);
    console.log('🔄 [Central DB]: Resilient Client Auto-Rehydration Synced Successfully.');
  }

  res.json({
    success: true,
    users: db.users,
    masterRegistry: db.masterRegistry,
    policeDatabase: db.policeDatabase
  });
});

// API: Network & Hosting Information (for multi-browser and mobile QR connecting)
app.get('/api/network-info', (req, res) => {
  const localIp = getLocalIpv4();
  res.json({
    port: PORT,
    localUrl: `http://localhost:${PORT}`,
    networkUrl: `http://${localIp}:${PORT}`,
    tunnelUrl: activeTunnelUrl,
    ip: localIp,
    platform: process.platform,
    timestamp: new Date().toISOString()
  });
});

// API: Update active tunnel URL if launched dynamically
app.post('/api/set-tunnel', (req, res) => {
  const { url } = req.body;
  if (url) {
    activeTunnelUrl = url;
  }
  res.json({ success: true, tunnelUrl: activeTunnelUrl });
});

// API: Send Verification Code to Gmail
app.post('/api/send-otp', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ success: false, error: 'Email and OTP code are required' });
  }

  const timestamp = new Date().toLocaleTimeString();
  console.log('\n====================================================');
  console.log(`[${timestamp}] 📧 GMAIL SECURITY OTP DISPATCH`);
  console.log(`Destination: ${email}`);
  console.log(`Subject: DocuForensic AI — Email Verification`);
  console.log(`----------------------------------------------------`);
  console.log(`🔐 VERIFICATION CODE: [ ${code} ]`);
  console.log('====================================================\n');

  // Attempt real email dispatch via Gmail SMTP if credentials exist in .env
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });

      await transporter.sendMail({
        from: `"DocuForensic AI" <${emailUser}>`,
        to: email,
        subject: `🔐 DocuForensic AI — Your Verification Code: ${code}`,
        text: `Your DocuForensic AI verification code is: ${code}\nThis code will expire in 10 minutes.`,
        html: `
          <div style="background: #0b0f19; color: #ffffff; padding: 25px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border-radius: 8px; border: 1px solid #00f0ff; max-width: 500px;">
            <h2 style="color: #00f0ff; margin-top: 0; font-family: monospace;">🛡️ DocuForensic AI Gateway</h2>
            <p style="font-size: 14px; color: #a0aec0;">Use the following 6-digit verification code to complete your security registration:</p>
            <div style="font-size: 34px; font-weight: bold; letter-spacing: 6px; color: #00ffcc; background: rgba(0, 240, 255, 0.08); padding: 16px; border-radius: 6px; text-align: center; border: 1px dashed #00ffcc; margin: 18px 0; font-family: monospace;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #718096; margin-bottom: 0;">This code expires in 10 minutes. If you did not request this verification, ignore this message.</p>
          </div>
        `
      });

      console.log(`✅ [Real Email Delivered to ${email}]`);
      return res.json({
        success: true,
        delivered: true,
        message: `Real verification code sent to ${email}. Please check your Gmail inbox.`
      });
    } catch (mailErr) {
      console.warn(`⚠️ [Nodemailer SMTP Notice]: ${mailErr.message}`);
    }
  }

  // Fallback when SMTP is not configured yet or fails
  return res.json({
    success: true,
    delivered: false,
    code: code,
    message: `Verification code generated for ${email}. (Code: ${code})`
  });
});

// API: MRZ Validation
app.post('/api/verify-mrz', (req, res) => {
  const { mrz } = req.body;
  if (!mrz) {
    return res.status(400).json({ error: 'MRZ string is required' });
  }
  const result = DocumentValidator.validateMRZ(mrz);
  res.json(result);
});

// API: Financial Calculation Cross-Check
app.post('/api/verify-math', (req, res) => {
  const { subtotal, tax, discount, total } = req.body;
  const result = DocumentValidator.validateFinancialMath({ subtotal, tax, discount, total });
  res.json(result);
});

// API: IBAN Checksum Verification
app.post('/api/verify-iban', (req, res) => {
  const { iban } = req.body;
  const result = DocumentValidator.validateIBAN(iban);
  res.json(result);
});

// API: Server-side PDF & File Forensics
app.post('/api/analyze-file', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  try {
    const fileBytes = fs.readFileSync(filePath);
    const formatInfo = MetadataExtractor.detectFileFormat(fileBytes);
    const textContent = MetadataExtractor.extractAsciiStrings(fileBytes, 25000);
    const suspiciousSoftware = MetadataExtractor.findSoftwareSignatures(textContent);

    let pdfForensics = null;
    if (formatInfo.type === 'PDF') {
      pdfForensics = MetadataExtractor.analyzePdfStructure(fileBytes, textContent);
    }

    const timestamps = MetadataExtractor.extractTimestamps(textContent);

    // Clean up uploaded file
    fs.unlink(filePath, () => {});

    res.json({
      originalName: req.file.originalname,
      size: req.file.size,
      format: formatInfo,
      softwareDetected: suspiciousSoftware,
      pdfForensics,
      timestamps,
      hasIncrementalUpdates: pdfForensics ? pdfForensics.incrementalRevisions > 1 : false
    });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
});

// Fallback to index.html for single-page app / PWA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server on all interfaces (0.0.0.0)
app.listen(PORT, HOST, () => {
  const localIp = getLocalIpv4();
  console.log(`====================================================`);
  console.log(`🚀 DocuForensic AI Server running successfully!`);
  console.log(`🌐 Localhost URL: http://localhost:${PORT}`);
  console.log(`🌐 Network URL:   http://${localIp}:${PORT} (Open from any browser on phone/PC)`);
  console.log(`🌍 Public Tunnel: ${activeTunnelUrl}`);
  console.log(`📱 App (PWA):     Open any URL in browser and click 'Install App'`);
  console.log(`====================================================`);
});
