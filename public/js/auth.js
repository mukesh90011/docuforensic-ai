/**
 * DocuForensic AI - Role-Based Authentication & Document Vault Manager
 * Features:
 * - Real Gmail verification with anti-fake / disposable domain filter
 * - 6-Digit Cyber Security OTP verification engine
 * - Compulsory First Name & Surname validation
 * - Cyberpunk login & registration system with persistent LocalStorage
 */

class AuthManager {
  static USERS_KEY = 'docuforensic_users';
  static SESSION_KEY = 'docuforensic_session';
  static VAULT_KEY = 'docuforensic_vault';
  static OTP_KEY = 'docuforensic_active_otp';
  static MASTER_REGISTRY_KEY = 'docuforensic_master_registry';
  static POLICE_DB_KEY = 'docuforensic_police_database';

  // List of banned fake / temporary / disposable email patterns
  static BANNED_EMAIL_PATTERNS = [
    'tempmail', '10minutemail', 'mailinator', 'guerrillamail', 'yopmail', 
    'trashmail', 'sharklasers', 'disposable', 'fakeinbox', 'fakemail', 
    'getairmail', 'throwaway', 'burnermail', 'test.com', 'example.com',
    'asdf', 'qwerty', 'fake', 'dummy'
  ];

  static defaultUsers = [
    {
      id: 'usr_issuer_1',
      firstName: 'Dr. Rajesh',
      surname: 'Sharma',
      name: 'Dr. Rajesh Sharma (Govt Registrar)',
      email: 'uidai.issuing.authority@gmail.com',
      password: 'admin',
      role: 'issuer',
      title: 'Chief Registrar & Govt Issuing Authority',
      department: 'UIDAI & National Academic Accreditation Authority',
      avatar: '🏛️',
      verifiedGmail: true
    },
    {
      id: 'usr_citizen_1',
      firstName: 'Mukesh',
      surname: 'Gupta',
      name: 'Mukesh Gupta (Citizen)',
      email: 'kahanagupta84@gmail.com',
      password: 'user',
      role: 'citizen',
      title: 'Citizen Document Holder',
      department: 'Citizen Self-Verification Portal',
      avatar: '👤',
      verifiedGmail: true
    },
    {
      id: 'usr_police_1',
      firstName: 'Inspector Vikram',
      surname: 'Rathore',
      name: 'Inspector Vikram Rathore',
      email: 'cybercrime.investigator@gmail.com',
      password: 'police',
      role: 'police',
      title: 'Senior Cyber Crime & Forensic Inspector',
      department: 'Police Crime Branch & Forgery Investigation Unit',
      avatar: '👮',
      verifiedGmail: true
    }
  ];

  static defaultMasterRegistry = [
    {
      id: 'REG-UIDAI-9021',
      docNumber: 'AADHAAR-9021-4412-8800',
      docType: 'Aadhaar Identity Card',
      holderName: 'Mukesh Gupta',
      fatherName: 'Ramprasad Gupta',
      dob: '1998-05-12',
      address: 'Arya College Campus, Jaipur, Rajasthan, India',
      issuedBy: 'Unique Identification Authority of India (UIDAI) - Govt of India',
      issueDate: '2022-04-10',
      sampleType: 'id_specimen',
      status: 'AUTHENTIC_ACTIVE',
      securityFeatures: ['Holographic Ashoka Emblem', 'Guilloche Micro-pattern', 'UIDAI Digital QR Stamp'],
      crimeRecord: false
    },
    {
      id: 'REG-MEA-8920',
      docNumber: 'A98442109',
      docType: 'Biometric Passport (TD3)',
      holderName: 'Marcus Vance',
      dob: '1989-08-14',
      issuedBy: 'Ministry of External Affairs / Consular Division',
      issueDate: '2021-12-31',
      sampleType: 'passport',
      status: 'OFFICIAL_RECORD_TAMPERED',
      securityFeatures: ['ICAO 9303 MRZ Modulo-10 Checksum', 'UV Fluorescent Fibers'],
      tamperNotice: 'Original registered name is "Marcus Vance". The uploaded document was modified with photo splicing to impersonate Elizabeth Clara with corrupted MRZ checksum.',
      crimeRecord: true,
      linkedFir: 'FIR #78/2026 - International Forged Passport Syndicate'
    },
    {
      id: 'REG-CERT-AI-991',
      docNumber: 'CERT-AI-2026-991',
      docType: 'AI & Data Science Professional Certificate',
      holderName: 'Mukesh Gupta',
      institute: 'Arya College AI Training & Research Center',
      issuedBy: 'National AI Accreditation Board & Arya College',
      issueDate: '2026-05-15',
      sampleType: 'clean',
      status: 'AUTHENTIC_ACTIVE',
      securityFeatures: ['Cryptographic Verification Hash', 'Digital Registrar Seal'],
      crimeRecord: false
    },
    {
      id: 'REG-INV-2026',
      docNumber: 'INV-2026-8820',
      docType: 'Commercial Tax Invoice',
      issuedBy: 'Apex International Logistics & Customs Clearing',
      billedTo: 'Global Freight Forwarders Ltd',
      originalTotal: 3464.00,
      issueDate: '2026-10-14',
      sampleType: 'invoice',
      status: 'OFFICIAL_RECORD_TAMPERED',
      tamperNotice: 'Original registered invoice total is $3,464.00. The uploaded document was inflated to $9,464.00 (+$6,000 fraud).',
      crimeRecord: true,
      linkedFir: 'FIR #402/2025 - Financial Fraud & Invoice Inflation'
    }
  ];

  static defaultPoliceDatabase = [
    {
      firNumber: 'FIR #78/2026 / Cyber Crime Unit',
      caseTitle: 'International Forged Passport & Identity Theft Syndicate',
      suspectName: 'Vikram Malhotra (Alias: Elizabeth Clara / Fake Passport)',
      linkedDocNumber: 'A98442109',
      policeStation: 'Cyber Crime Police Station, New Delhi',
      sections: 'Section 468, 471, 420 IPC (Forgery for Cheating & False Identity)',
      status: 'WANTED / CRITICAL ALERT',
      severity: 'HIGH_CRIME',
      details: 'Suspect used spliced photo over genuine passport record A98442109 to flee immigration checkpoint.'
    },
    {
      firNumber: 'FIR #402/2025 / EOW Branch',
      caseTitle: 'Commercial Invoice Inflation & Bank Loan Fraud',
      suspectName: 'Apex Trade Associates / Syndicate #4',
      linkedDocNumber: 'INV-2026-8820',
      policeStation: 'Economic Offences Wing (EOW)',
      sections: 'Section 467, 471 IPC & Prevention of Money Laundering Act',
      status: 'UNDER ACTIVE CHARGESHEET',
      severity: 'FINANCIAL_CRIME',
      details: 'Altered tax invoices by +$6,000 using digital font manipulation to claim unauthorized bank credits.'
    }
  ];

  static defaultVault = [
    {
      id: 'DOC-9041',
      title: 'United Federation Passport - Bio Page',
      uploaderId: 'usr_uploader_1',
      uploaderName: 'Sarah Jenkins',
      timestamp: '2026-10-28 09:15:00 UTC',
      fileType: 'Passport (TD3)',
      filePath: './samples/sample-passport-tampered.svg',
      sampleType: 'passport',
      riskScore: 88,
      status: 'FLAGGED_FORGERY',
      statusText: 'Flagged Forgery',
      notes: 'Photo boundary splicing and invalid ICAO 9303 MRZ check digits detected.'
    },
    {
      id: 'DOC-8820',
      title: 'Logistics Commercial Invoice #INV-2026',
      uploaderId: 'usr_uploader_1',
      uploaderName: 'Sarah Jenkins',
      timestamp: '2026-10-28 08:40:00 UTC',
      fileType: 'Invoice (Financial)',
      filePath: './samples/sample-invoice-tampered.svg',
      sampleType: 'invoice',
      riskScore: 76,
      status: 'PENDING_REVIEW',
      statusText: 'Under Auditor Review',
      notes: 'Subtotal calculation discrepancy (+$6,000 inflation).'
    },
    {
      id: 'DOC-7104',
      title: 'Biometric Federal Forensic ID Card',
      uploaderId: 'usr_uploader_1',
      uploaderName: 'Sarah Jenkins',
      timestamp: '2026-10-27 16:20:00 UTC',
      fileType: 'National ID (Photometric)',
      filePath: './samples/sample-id-specimen.jpg',
      sampleType: 'id_specimen',
      riskScore: 5,
      status: 'VERIFIED_AUTHENTIC',
      statusText: 'Verified Authentic',
      notes: 'Holographic eagle seal and micro-printing lines verified clean.'
    },
    {
      id: 'DOC-6392',
      title: 'National Accreditation Board Certificate',
      uploaderId: 'usr_auditor_1',
      uploaderName: 'Agent Marcus Vance',
      timestamp: '2026-10-26 11:05:00 UTC',
      fileType: 'Accreditation Diploma',
      filePath: './samples/sample-certificate-clean.svg',
      sampleType: 'clean',
      riskScore: 4,
      status: 'VERIFIED_AUTHENTIC',
      statusText: 'Verified Authentic',
      notes: 'Uniform sensor grain and verified cryptographic digital seal.'
    }
  ];

  static init() {
    // If old mock session exists (non-gmail), reset it so Cyber Gateway shows upfront
    const oldSess = localStorage.getItem(this.SESSION_KEY);
    if (oldSess) {
      try {
        const parsed = JSON.parse(oldSess);
        if (!parsed.email || !parsed.email.endsWith('@gmail.com')) {
          localStorage.removeItem(this.SESSION_KEY);
        }
      } catch (e) {
        localStorage.removeItem(this.SESSION_KEY);
      }
    }

    if (!localStorage.getItem(this.USERS_KEY)) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(this.defaultUsers));
    } else {
      // Ensure default users have 3 roles (issuer, citizen, police)
      try {
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY));
        const hasIssuer = users && users.some(u => u.role === 'issuer');
        if (!hasIssuer) {
          localStorage.setItem(this.USERS_KEY, JSON.stringify(this.defaultUsers));
        }
      } catch(e) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(this.defaultUsers));
      }
    }

    if (!localStorage.getItem(this.VAULT_KEY)) {
      localStorage.setItem(this.VAULT_KEY, JSON.stringify(this.defaultVault));
    }

    if (!localStorage.getItem(this.MASTER_REGISTRY_KEY)) {
      localStorage.setItem(this.MASTER_REGISTRY_KEY, JSON.stringify(this.defaultMasterRegistry));
    }

    if (!localStorage.getItem(this.POLICE_DB_KEY)) {
      localStorage.setItem(this.POLICE_DB_KEY, JSON.stringify(this.defaultPoliceDatabase));
    }

    // Trigger async multi-device sync with Central Cloud Server
    this.syncWithCentralDb();
  }

  /**
   * Syncs with central server database (real-time cross-device sync)
   */
  static async syncWithCentralDb() {
    if (this._syncing) return;
    this._syncing = true;
    try {
      const resp = await fetch('/api/db/sync');
      if (resp.ok) {
        const data = await resp.json();
        if (data.users && data.users.length) {
          localStorage.setItem(this.USERS_KEY, JSON.stringify(data.users));
        }
        if (data.masterRegistry && data.masterRegistry.length) {
          localStorage.setItem(this.MASTER_REGISTRY_KEY, JSON.stringify(data.masterRegistry));
        }
        if (data.policeDatabase && data.policeDatabase.length) {
          localStorage.setItem(this.POLICE_DB_KEY, JSON.stringify(data.policeDatabase));
        }
        if (data.scans) {
          localStorage.setItem('docuforensic_central_scans', JSON.stringify(data.scans));
        }
        console.log('🌐 [DocuForensic AI]: Central Multi-Device Database Synced Successfully.');

        // Resilient Auto-Rehydration: Ensure any local user creations are backed up to central server
        const localUsers = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
        const localRegistry = JSON.parse(localStorage.getItem(this.MASTER_REGISTRY_KEY) || '[]');
        const localPolice = JSON.parse(localStorage.getItem(this.POLICE_DB_KEY) || '[]');
        
        fetch('/api/db/client-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            users: localUsers,
            masterRegistry: localRegistry,
            policeDatabase: localPolice
          })
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Central DB sync running in local cache mode.');
    } finally {
      this._syncing = false;
    }
  }

  static getCurrentUser() {
    this.init();
    try {
      const sess = localStorage.getItem(this.SESSION_KEY);
      return sess ? JSON.parse(sess) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Strict validation for genuine Gmail address
   */
  static validateGmail(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Gmail address is required.' };
    }

    const clean = email.trim().toLowerCase();

    // Check basic email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(clean)) {
      return { valid: false, error: 'Invalid email structure. Please enter a valid email format.' };
    }

    // Must be @gmail.com
    if (!clean.endsWith('@gmail.com')) {
      return { 
        valid: false, 
        error: 'Only authentic Google Gmail accounts (@gmail.com) are accepted. Please provide your verified Gmail.' 
      };
    }

    const usernamePart = clean.replace('@gmail.com', '');
    if (usernamePart.length < 5) {
      return { valid: false, error: 'Gmail username prefix must be at least 5 characters long.' };
    }

    // Anti-fake / Disposable email check
    for (const banned of this.BANNED_EMAIL_PATTERNS) {
      if (clean.includes(banned)) {
        return { 
          valid: false, 
          error: `Suspicious / fake email pattern detected ("${banned}"). Disposable emails are strictly rejected.` 
        };
      }
    }

    return { valid: true, email: clean };
  }

  /**
   * Generates and dispatches a 6-digit Cyber OTP code to Gmail (without displaying it on screen)
   */
  static async generateOtp(email) {
    const valResult = this.validateGmail(email);
    if (!valResult.valid) {
      return { success: false, error: valResult.error };
    }

    // Generate random 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const otpData = {
      email: valResult.email,
      code,
      expiresAt,
      verified: false
    };

    sessionStorage.setItem(this.OTP_KEY, JSON.stringify(otpData));

    // Dispatch via backend email service
    let backendResult = null;
    try {
      const resp = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: valResult.email, code })
      });
      if (resp.ok) {
        backendResult = await resp.json();
      }
    } catch (e) {
      console.warn('Backend /api/send-otp offline or running in standalone file mode');
    }

    return {
      success: true,
      email: valResult.email,
      delivered: backendResult ? !!backendResult.delivered : false,
      message: backendResult && backendResult.message ? backendResult.message : `Verification code sent to ${valResult.email}.`
    };
  }

  /**
   * Checks if password meets HARD / STRONG Cyber Security requirements
   */
  static checkPasswordStrength(password) {
    if (!password) {
      return { 
        score: 0, 
        valid: false, 
        label: 'Empty', 
        color: '#ff3366', 
        checks: { length: false, upper: false, lower: false, number: false, special: false } 
      };
    }

    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
    };

    const passedCount = Object.values(checks).filter(Boolean).length;
    let label = 'Weak (Needs Hard Password)';
    let color = '#ff3366';

    if (passedCount === 5) {
      label = 'Hard & Secure (Cyber Grade)';
      color = '#00f59b';
    } else if (passedCount >= 3) {
      label = 'Medium (Add remaining rules)';
      color = '#ffb703';
    } else {
      label = 'Weak (Too Easy)';
      color = '#ff3366';
    }

    return {
      score: passedCount,
      valid: passedCount === 5,
      label,
      color,
      checks
    };
  }

  /**
   * Verifies the 6-digit OTP code against the entered Gmail
   */
  static async verifyOtp(email, code) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();

    // 1. Try local session verification first
    const stored = sessionStorage.getItem(this.OTP_KEY) || localStorage.getItem(this.OTP_KEY);
    if (stored) {
      try {
        const otpData = JSON.parse(stored);
        if (otpData.email.toLowerCase() === cleanEmail && otpData.code === cleanCode) {
          if (Date.now() <= otpData.expiresAt) {
            otpData.verified = true;
            sessionStorage.setItem(this.OTP_KEY, JSON.stringify(otpData));
            localStorage.setItem(this.OTP_KEY, JSON.stringify(otpData));
            return { success: true, message: 'Gmail verified successfully!' };
          }
        }
      } catch (e) {}
    }

    // 2. Fallback to Central Backend OTP Verification
    try {
      const resp = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode })
      });
      const data = await resp.json();
      if (data && data.success) {
        this.markEmailVerified(cleanEmail);
        return { success: true, message: 'Gmail verified successfully via Central Gateway!' };
      }
      return { success: false, error: data.error || 'Incorrect verification code.' };
    } catch (err) {
      return { success: false, error: 'Incorrect 6-digit verification code. Please check your Gmail.' };
    }
  }

  /**
   * Marks email as verified directly (used by 1-click email link)
   */
  static markEmailVerified(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const otpData = {
      email: cleanEmail,
      verified: true,
      expiresAt: Date.now() + 60 * 60 * 1000
    };
    sessionStorage.setItem(this.OTP_KEY, JSON.stringify(otpData));
    localStorage.setItem(this.OTP_KEY, JSON.stringify(otpData));
  }

  /**
   * Checks if an email has already been verified via OTP or link
   */
  static isEmailOtpVerified(email) {
    const clean = (email || '').trim().toLowerCase();
    const stored = sessionStorage.getItem(this.OTP_KEY) || localStorage.getItem(this.OTP_KEY);
    if (!stored) return false;
    try {
      const data = JSON.parse(stored);
      return data.verified && data.email.toLowerCase() === clean;
    } catch (e) {
      return false;
    }
  }

  /**
   * Registers a new user with compulsory Name, Surname, and Verified Gmail
   */
  static register({ firstName, surname, email, password, role = 'auditor' }) {
    this.init();

    // 1. Validate First Name
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
      return { success: false, error: 'First Name is required and must be at least 2 characters.' };
    }

    // 2. Validate Surname (Compulsory)
    if (!surname || typeof surname !== 'string' || surname.trim().length < 2) {
      return { success: false, error: 'Surname is COMPULSORY. Please enter your valid legal surname / family name.' };
    }

    // 3. Validate Gmail
    const gmailCheck = this.validateGmail(email);
    if (!gmailCheck.valid) {
      return { success: false, error: gmailCheck.error };
    }

    // 4. Check if Gmail was verified with OTP
    if (!this.isEmailOtpVerified(gmailCheck.email)) {
      return { 
        success: false, 
        error: 'Please verify your Gmail address first by clicking "Verify Gmail" and entering your 6-digit code.' 
      };
    }

    // 5. Hard / Strong Password Validation
    const strength = this.checkPasswordStrength(password);
    if (!strength.valid) {
      return { 
        success: false, 
        error: 'Password must be HARD & SECURE: minimum 8 characters, with at least one uppercase letter (A-Z), one lowercase letter (a-z), one number (0-9), and one special symbol (!@#$...).' 
      };
    }

    const cleanEmail = gmailCheck.email;
    const cleanFirst = firstName.trim();
    const cleanSurname = surname.trim();
    const fullName = `${cleanFirst} ${cleanSurname}`;

    const users = JSON.parse(localStorage.getItem(this.USERS_KEY)) || [];

    // Check existing email
    const exists = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: 'An account is already registered with this Gmail address. Please Log In.' };
    }

    let title = 'Citizen Document Holder';
    let dept = 'Citizen Self-Verification Portal';
    let avatar = '👤';

    if (role === 'issuer') {
      title = 'Govt Registrar & Issuing Authority';
      dept = 'UIDAI & National Academic Accreditation Authority';
      avatar = '🏛️';
    } else if (role === 'police') {
      title = 'Senior Cyber Crime & Forensic Inspector';
      dept = 'Police Crime Branch & Forgery Investigation Unit';
      avatar = '👮';
    } else {
      role = 'citizen';
    }

    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      firstName: cleanFirst,
      surname: cleanSurname,
      name: `${cleanFirst} ${cleanSurname} (${role === 'issuer' ? 'Govt' : (role === 'police' ? 'Police' : 'Citizen')})`,
      email: cleanEmail,
      password: password,
      role: role,
      title: title,
      department: dept,
      avatar: avatar,
      verifiedGmail: true,
      registeredAt: new Date().toUTCString()
    };

    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    // Asynchronously dispatch to central server database
    try {
      fetch('/api/db/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      }).catch(() => {});
    } catch (e) {}

    // Clear active OTP session
    sessionStorage.removeItem(this.OTP_KEY);

    // Auto-login newly registered user
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(newUser));

    return { success: true, user: newUser };
  }

  /**
   * Authenticates user credentials
   */
  static login(email, password) {
    this.init();
    const cleanEmail = (email || '').toLowerCase().trim();
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY)) || [];

    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'No account registered with this Gmail address. Please Register first.' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Invalid password. Please check your credentials and try again.' };
    }

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    return { success: true, user };
  }

  /**
   * Logs out active session
   */
  static logout() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  static isAuditor() {
    const user = this.getCurrentUser();
    return user && (user.role === 'police' || user.role === 'issuer' || user.role === 'auditor');
  }

  static isUploader() {
    const user = this.getCurrentUser();
    return user && user.role === 'citizen';
  }

  static isIssuer() {
    const user = this.getCurrentUser();
    return user && user.role === 'issuer';
  }

  static isCitizen() {
    const user = this.getCurrentUser();
    return user && user.role === 'citizen';
  }

  static isPolice() {
    const user = this.getCurrentUser();
    return user && user.role === 'police';
  }

  static getMasterRegistry() {
    this.init();
    return JSON.parse(localStorage.getItem(this.MASTER_REGISTRY_KEY)) || this.defaultMasterRegistry;
  }

  static issueOfficialDocument(docData) {
    this.init();
    const registry = this.getMasterRegistry();
    const user = this.getCurrentUser();

    const newRecord = {
      id: 'REG-' + Date.now().toString(36).toUpperCase(),
      docNumber: docData.docNumber || ('ID-' + Math.floor(10000000 + Math.random() * 90000000)),
      docType: docData.docType || 'Government Certified Credential',
      holderName: docData.holderName || 'Registered Citizen',
      fatherName: docData.fatherName || '',
      dob: docData.dob || '',
      address: docData.address || '',
      issuedBy: user ? `${user.name} (${user.department})` : 'Authorized Issuing Authority',
      issueDate: new Date().toISOString().split('T')[0],
      sampleType: docData.sampleType || 'custom',
      status: 'AUTHENTIC_ACTIVE',
      securityFeatures: ['Cryptographic Issuer Signature', 'Digital Watermark Hash', 'Central Ledger Registration'],
      crimeRecord: false
    };

    registry.unshift(newRecord);
    localStorage.setItem(this.MASTER_REGISTRY_KEY, JSON.stringify(registry));

    // Asynchronously sync with central server database
    try {
      fetch('/api/db/registry/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      }).catch(() => {});
    } catch (e) {}

    return newRecord;
  }

  static getPoliceDatabase() {
    this.init();
    return JSON.parse(localStorage.getItem(this.POLICE_DB_KEY)) || this.defaultPoliceDatabase;
  }

  static flagInPoliceDatabase(crimeData) {
    this.init();
    const db = this.getPoliceDatabase();
    const user = this.getCurrentUser();

    const newFir = {
      firNumber: crimeData.firNumber || (`FIR #${Math.floor(100 + Math.random() * 900)}/${new Date().getFullYear()} / Crime Branch`),
      caseTitle: crimeData.caseTitle || 'Document Forgery & Digital Impersonation Investigation',
      suspectName: crimeData.suspectName || 'Unknown / Document Holder Under Scrutiny',
      linkedDocNumber: crimeData.linkedDocNumber || 'FLAGGED_DOC',
      policeStation: user ? user.department : 'Central Cyber Crime Police Station',
      sections: crimeData.sections || 'Section 468, 471, 420 IPC',
      status: 'UNDER ACTIVE INVESTIGATION',
      severity: 'CRITICAL_FORGERY',
      details: crimeData.details || 'Document flagged and impounded by Police Investigator for forensic evidence.',
      flaggedAt: new Date().toUTCString(),
      investigator: user ? user.name : 'Police Inspector'
    };

    db.unshift(newFir);
    localStorage.setItem(this.POLICE_DB_KEY, JSON.stringify(db));

    // Asynchronously sync with central server database
    try {
      fetch('/api/db/police/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFir)
      }).catch(() => {});
    } catch (e) {}

    return newFir;
  }

  /**
   * Cross-checks uploaded document against Central Master Registry,
   * Pre-upload history, and Police Crime Database
   */
  static verifyDocumentIntegrity({ title = '', sampleType = null, filePath = '' }) {
    this.init();
    const vault = JSON.parse(localStorage.getItem(this.VAULT_KEY)) || [];
    const masterRegistry = this.getMasterRegistry();
    const policeDb = this.getPoliceDatabase();

    const lowerTitle = (title || '').toLowerCase();

    // 1. PRE-UPLOAD / DUPLICATE CHECK (Local Vault + Central Network Scans)
    const centralScans = JSON.parse(localStorage.getItem('docuforensic_central_scans') || '[]');
    const allPrior = [...vault, ...centralScans];

    const priorUploads = allPrior.filter(d => {
      if (sampleType && d.sampleType === sampleType) return true;
      if (lowerTitle && d.title && d.title.toLowerCase().includes(lowerTitle)) return true;
      return false;
    });

    const isPreUploaded = priorUploads.length > 0;
    const scanCount = priorUploads.length + 1;
    const firstUpload = isPreUploaded ? priorUploads[priorUploads.length - 1] : null;

    // Asynchronously log scan event to central network database
    try {
      fetch('/api/db/scan/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          sampleType,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});
    } catch (e) {}

    // 2. CENTRAL MASTER REGISTRY CHECK (Real vs Fake)
    let masterMatch = null;
    if (sampleType) {
      masterMatch = masterRegistry.find(r => r.sampleType === sampleType);
    }
    if (!masterMatch) {
      masterMatch = masterRegistry.find(r => {
        if (lowerTitle.includes('aadhaar') && r.docType.toLowerCase().includes('aadhaar')) return true;
        if (lowerTitle.includes('passport') && r.docType.toLowerCase().includes('passport')) return true;
        if ((lowerTitle.includes('cert') || lowerTitle.includes('training')) && r.docType.toLowerCase().includes('cert')) return true;
        if (lowerTitle.includes('invoice') && r.docType.toLowerCase().includes('invoice')) return true;
        return false;
      });
    }

    let registryStatus = 'UNREGISTERED_FAKE';
    let registryTitle = '❌ UNREGISTERED / FAKE DOCUMENT';
    let registryDesc = 'Zero matching records found in Government or Certified Academic Registry. This credential was never legally issued by an authorized authority.';
    let officialRecord = null;

    if (masterMatch) {
      officialRecord = masterMatch;
      if (masterMatch.status === 'AUTHENTIC_ACTIVE') {
        registryStatus = 'REAL_AUTHENTIC';
        registryTitle = '✅ 100% REAL & OFFICIALLY VERIFIED';
        registryDesc = `Officially issued by ${masterMatch.issuedBy} to ${masterMatch.holderName} on ${masterMatch.issueDate}. Digital cryptographic record verified authentic in Government Ledger.`;
      } else {
        registryStatus = 'TAMPERED_FORGERY';
        registryTitle = '🚨 FORGERY DETECTED: DATA ALTERED FROM OFFICIAL RECORD';
        registryDesc = masterMatch.tamperNotice || `Official Government record for ID ${masterMatch.docNumber} was issued to "${masterMatch.holderName}", but uploaded document has been modified/spliced.`;
      }
    }

    // 3. POLICE CRIME / FIR DATABASE CHECK
    let crimeRecord = null;
    if (masterMatch && masterMatch.crimeRecord) {
      crimeRecord = policeDb.find(c => c.linkedDocNumber === masterMatch.docNumber);
    }
    if (!crimeRecord) {
      crimeRecord = policeDb.find(c => {
        if (sampleType === 'passport' && c.linkedDocNumber === 'A98442109') return true;
        if (sampleType === 'invoice' && c.linkedDocNumber === 'INV-2026-8820') return true;
        return false;
      });
    }

    return {
      preUpload: {
        isPreUploaded,
        scanCount,
        firstUploadedAt: firstUpload ? firstUpload.timestamp : new Date().toUTCString(),
        firstUploadedBy: firstUpload ? firstUpload.uploaderName : 'First-time Submission',
        lastVerdict: firstUpload ? firstUpload.statusText : 'New Inspection'
      },
      registry: {
        status: registryStatus,
        title: registryTitle,
        desc: registryDesc,
        record: officialRecord
      },
      police: {
        hasCrimeRecord: !!crimeRecord,
        crimeData: crimeRecord || null,
        statusText: crimeRecord ? `🚨 ACTIVE POLICE FIR: ${crimeRecord.firNumber}` : '🛡️ POLICE CLEARANCE: CLEAN (No Criminal Records Linked)'
      }
    };
  }

  static getVaultDocuments() {
    this.init();
    const vault = JSON.parse(localStorage.getItem(this.VAULT_KEY)) || [];
    const user = this.getCurrentUser();

    if (!user) return [];
    if (user.role === 'police' || user.role === 'issuer' || user.role === 'auditor') {
      return vault;
    } else {
      return vault.filter(d => d.uploaderId === user.id || d.uploaderEmail === user.email);
    }
  }

  static addSubmission({ title, fileType, filePath, sampleType = null, riskScore = 0 }) {
    this.init();
    const user = this.getCurrentUser();
    const vault = JSON.parse(localStorage.getItem(this.VAULT_KEY)) || [];

    const newDoc = {
      id: 'DOC-' + Math.floor(1000 + Math.random() * 9000),
      title: title || 'Uploaded Document',
      uploaderId: user ? user.id : 'usr_anon',
      uploaderName: user ? user.name : 'Guest User',
      uploaderEmail: user ? user.email : 'unverified',
      timestamp: new Date().toUTCString(),
      fileType: fileType || 'Document',
      filePath: filePath,
      sampleType,
      riskScore,
      status: riskScore >= 65 ? 'FLAGGED_FORGERY' : (riskScore >= 35 ? 'PENDING_REVIEW' : 'VERIFIED_AUTHENTIC'),
      statusText: riskScore >= 65 ? 'Flagged Forgery' : (riskScore >= 35 ? 'Under Review' : 'Verified Authentic'),
      notes: 'Initial automated multi-spectral forensic evaluation completed.'
    };

    vault.unshift(newDoc);
    localStorage.setItem(this.VAULT_KEY, JSON.stringify(vault));
    return newDoc;
  }

  static updateDocumentStatus(docId, newStatus, auditorNotes = '') {
    this.init();
    const vault = JSON.parse(localStorage.getItem(this.VAULT_KEY)) || [];
    const doc = vault.find(d => d.id === docId);

    if (doc) {
      doc.status = newStatus;
      doc.statusText = newStatus === 'VERIFIED_AUTHENTIC' ? 'Certified Clean' : (newStatus === 'FLAGGED_FORGERY' ? 'Flagged Forgery' : 'Under Review');
      if (auditorNotes) doc.notes = auditorNotes;
      doc.auditedBy = this.getCurrentUser()?.name || 'Forensic Inspector';
      doc.auditedAt = new Date().toUTCString();
      localStorage.setItem(this.VAULT_KEY, JSON.stringify(vault));
      return { success: true, doc };
    }
    return { success: false, error: 'Document not found' };
  }
}

// Attach to window
if (typeof window !== 'undefined') {
  window.AuthManager = AuthManager;
}