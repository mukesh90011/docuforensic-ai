/**
 * DocuForensic AI - Reactive Dynamic Background Engine
 * Context-aware, auto-morphing ambient particle and lighting canvas system.
 * Automatically adapts theme, color palette, speed, and particle visual effects
 * whenever a page portal changes, modal popup opens, or document analysis verdicts occur.
 */

(function () {
  'use strict';

  // Master Color Palettes & Ambient Configurations
  const THEMES = {
    forensic: {
      name: 'Forensic Tactical Cyber',
      primary: [0, 240, 255],      // Neon Cyan
      secondary: [121, 40, 202],   // Cyber Violet
      accent: [0, 102, 255],       // Electric Blue
      glowColor: 'rgba(0, 240, 255, 0.22)',
      bgTint: 'rgba(7, 10, 19, 0.92)',
      speed: 0.65,
      nodeCount: 45,
      effect: 'matrix',
      matrixChars: '0123456789ABCDEFØ1XYZΨΩΣΔλ#$*+-%<>{}§¶'
    },
    issuer: {
      name: 'Government & Issuer Authority',
      primary: [255, 215, 0],      // Regal Imperial Gold
      secondary: [0, 255, 204],    // Sovereign Emerald
      accent: [245, 158, 11],      // Warm Amber
      glowColor: 'rgba(255, 215, 0, 0.26)',
      bgTint: 'rgba(10, 15, 12, 0.92)',
      speed: 0.5,
      nodeCount: 50,
      effect: 'goldenSovereign',
      matrixChars: '🏛️GOVT★OFFICIAL★SEAL★VERIFIED★UIDAI★1860★ACADEMIC★LEDGER'
    },
    citizen: {
      name: 'Citizen & Document Holder',
      primary: [0, 229, 255],      // Sky Cyan
      secondary: [59, 130, 246],   // Trust Azure
      accent: [255, 255, 255],     // Pristine White
      glowColor: 'rgba(0, 229, 255, 0.22)',
      bgTint: 'rgba(5, 12, 22, 0.92)',
      speed: 0.55,
      nodeCount: 40,
      effect: 'citizenWave',
      matrixChars: '01•DOC★HOLDER★PASS★AADHAAR★PAN★CERT★SECURE'
    },
    police: {
      name: 'Police Crime & FIR Enforcement',
      primary: [255, 0, 85],       // Tactical Crimson
      secondary: [37, 99, 235],    // Police Siren Blue
      accent: [255, 51, 102],      // Beacon Pink/Red
      glowColor: 'rgba(255, 0, 85, 0.35)',
      bgTint: 'rgba(18, 5, 10, 0.92)',
      speed: 1.25,
      nodeCount: 60,
      effect: 'policeSiren',
      matrixChars: 'POLICE★CRIME★FIR★LAW★IPC420★SECTION468★WARRANT★ARREST'
    },
    threat: {
      name: 'Critical Forgery Threat Alarm',
      primary: [255, 0, 51],       // Critical Alarm Red
      secondary: [255, 107, 0],    // Warning Amber
      accent: [255, 23, 68],
      glowColor: 'rgba(255, 0, 51, 0.45)',
      bgTint: 'rgba(20, 4, 8, 0.92)',
      speed: 1.6,
      nodeCount: 70,
      effect: 'threatAlert',
      matrixChars: 'TAMPERED★FORGERY★HIGH_RISK★ALTERATION★FRAUD★CORRUPTED'
    },
    clean: {
      name: 'Verified Authentic Document',
      primary: [0, 245, 155],      // Authentic Emerald Green
      secondary: [0, 240, 255],    // Pure Cyan
      accent: [16, 185, 129],
      glowColor: 'rgba(0, 245, 155, 0.3)',
      bgTint: 'rgba(4, 18, 14, 0.92)',
      speed: 0.45,
      nodeCount: 45,
      effect: 'cleanTranquil',
      matrixChars: '✓GENUINE★AUTHENTIC★OFFICIAL★VERIFIED★100%VALID'
    },
    camera: {
      name: 'Optical Scanner & Lens Sweep',
      primary: [0, 255, 102],      // Laser Scanner Green
      secondary: [0, 245, 155],    // Cyber Mint
      accent: [0, 230, 118],
      glowColor: 'rgba(0, 255, 102, 0.28)',
      bgTint: 'rgba(4, 15, 10, 0.92)',
      speed: 0.85,
      nodeCount: 50,
      effect: 'laserScan',
      matrixChars: 'SCAN★LENS★OPTICAL★365NM★IR★LASER★DIFFRACTION'
    },
    report: {
      name: 'Official Forensic Audit Certificate',
      primary: [226, 232, 240],    // Platinum Silver
      secondary: [56, 189, 248],   // Crystal Blue
      accent: [148, 163, 184],
      glowColor: 'rgba(56, 189, 248, 0.22)',
      bgTint: 'rgba(8, 12, 18, 0.92)',
      speed: 0.5,
      nodeCount: 40,
      effect: 'labCrystalline',
      matrixChars: 'COURT★EVIDENCE★SECTION65B★CERTIFICATE★HASH★AUTHENTIC'
    },
    host: {
      name: 'Multi-Browser Neural Network',
      primary: [168, 85, 247],     // Quantum Violet
      secondary: [99, 102, 241],   // Indigo Network
      accent: [192, 132, 252],
      glowColor: 'rgba(168, 85, 247, 0.28)',
      bgTint: 'rgba(12, 6, 22, 0.92)',
      speed: 0.8,
      nodeCount: 55,
      effect: 'neuralNetwork',
      matrixChars: 'P2P★NODE★SOCKET★CLOUD★WEBRTC★TUNNEL★ENCRYPT'
    },
    auth: {
      name: 'Cyber Gateway Access',
      primary: [0, 240, 255],      // Neon Cyan
      secondary: [121, 40, 202],   // Violet
      accent: [0, 102, 255],
      glowColor: 'rgba(0, 240, 255, 0.3)',
      bgTint: 'rgba(5, 8, 16, 0.94)',
      speed: 0.9,
      nodeCount: 50,
      effect: 'matrix',
      matrixChars: '0123456789ABCDEFØ1XYZΨΩΣΔλ#$*+-%<>{}§¶'
    }
  };

  class ReactiveBackgroundEngine {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.activeThemeKey = 'forensic';
      this.previousRoleTheme = 'forensic';
      this.targetTheme = THEMES.forensic;

      // Interpolated colors (Current RGB floats for smooth morphing)
      this.curPrimary = [...this.targetTheme.primary];
      this.curSecondary = [...this.targetTheme.secondary];
      this.curAccent = [...this.targetTheme.accent];
      this.curSpeed = this.targetTheme.speed;

      // Particle Constellation
      this.nodes = [];
      this.matrixDrops = [];
      this.matrixFontSize = 14;
      this.matrixColumns = 0;

      // Interactive mouse light
      this.mouse = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.3, targetX: window.innerWidth * 0.5, targetY: window.innerHeight * 0.3 };
      this.animTime = 0;
      this.temporaryTimer = null;
      this.isDocumentHidden = false;

      // Laser sweep variable for camera mode
      this.laserY = 0;

      // Police beacon phase (0 to 2PI)
      this.policeBeaconAngle = 0;

      this.init();
    }

    init() {
      // Find or create the canvas
      let canvas = document.getElementById('ambientDynamicCanvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'ambientDynamicCanvas';
        canvas.className = 'dynamic-ambient-canvas';
        document.body.prepend(canvas);
      }
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = e.clientX;
        this.mouse.targetY = e.clientY;
      }, { passive: true });

      // Handle tab visibility to conserve performance
      document.addEventListener('visibilitychange', () => {
        this.isDocumentHidden = document.hidden;
      });

      // Initialize nodes
      this.initNodes();

      // Start animation loop
      requestAnimationFrame((t) => this.render(t));

      // Setup DOM observers to detect modal opens/closes & role changes
      this.setupContextObservers();
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;

      this.matrixColumns = Math.floor(this.canvas.width / this.matrixFontSize);
      this.matrixDrops = Array(this.matrixColumns).fill(1).map(() => Math.floor(Math.random() * -50));

      this.initNodes();
    }

    initNodes() {
      const count = Math.min(
        this.targetTheme.nodeCount || 45,
        Math.floor(window.innerWidth / (window.innerWidth < 768 ? 20 : 32))
      );
      this.nodes = [];
      for (let i = 0; i < count; i++) {
        this.nodes.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 2.2 + 1.2,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03
        });
      }
    }

    /**
     * Switch theme smoothly
     * @param {string} themeKey - Key from THEMES
     * @param {number} temporaryMs - Revert back to role theme after X milliseconds (optional)
     */
    setTheme(themeKey, temporaryMs = 0) {
      if (!THEMES[themeKey]) themeKey = 'forensic';

      if (this.temporaryTimer) {
        clearTimeout(this.temporaryTimer);
        this.temporaryTimer = null;
      }

      this.activeThemeKey = themeKey;
      this.targetTheme = THEMES[themeKey];

      // Update Body attribute for CSS variables & overlay grids
      document.body.setAttribute('data-theme', themeKey);

      // Notify user console for debugging
      // console.log(`[DynamicBackground] Switched ambient mood to: ${this.targetTheme.name}`);

      if (temporaryMs > 0) {
        this.temporaryTimer = setTimeout(() => {
          this.revertToCurrentState();
        }, temporaryMs);
      }
    }

    /**
     * Revert background to the currently active portal or open popup state
     */
    revertToCurrentState() {
      // 1. Check if any modal is currently visible
      const modalTheme = this.detectActiveModalTheme();
      if (modalTheme) {
        this.setTheme(modalTheme);
        return;
      }

      // 2. Check active user role
      if (window.AuthManager) {
        const user = window.AuthManager.getCurrentUser();
        if (user) {
          if (user.role === 'issuer') {
            this.setTheme('issuer');
            return;
          } else if (user.role === 'police') {
            this.setTheme('police');
            return;
          } else if (user.role === 'user') {
            this.setTheme('citizen');
            return;
          }
        }
      }

      // 3. Fallback to forensic default
      this.setTheme('forensic');
    }

    detectActiveModalTheme() {
      // Check auth overlay
      const authOverlay = document.getElementById('cyberAuthOverlay');
      if (authOverlay && !authOverlay.classList.contains('hidden') && authOverlay.style.display !== 'none') {
        return 'auth';
      }

      // Check modals by ID and class
      const modals = [
        { id: 'issueDocModal', theme: 'issuer' },
        { id: 'officialRecordModal', theme: 'issuer' },
        { id: 'policeDbModal', theme: 'police' },
        { id: 'cameraModal', theme: 'camera' },
        { id: 'reportModal', theme: 'report' },
        { id: 'hostModal', theme: 'host' },
        { id: 'loginModal', theme: 'auth' }
      ];

      for (const m of modals) {
        const el = document.getElementById(m.id);
        if (el) {
          const isOpen = el.classList.contains('open') || (!el.classList.contains('hidden') && el.style.display !== 'none' && window.getComputedStyle(el).display !== 'none');
          if (isOpen) return m.theme;
        }
      }
      return null;
    }

    setupContextObservers() {
      // Watch for class and style mutations on document body & modals
      const observer = new MutationObserver(() => {
        // Only auto-revert if we aren't in a temporary alert (threat/clean)
        if (!this.temporaryTimer) {
          const expectedTheme = this.detectActiveModalTheme();
          if (expectedTheme && expectedTheme !== this.activeThemeKey) {
            this.setTheme(expectedTheme);
          } else if (!expectedTheme) {
            // No modal open, check role theme
            let roleTheme = 'forensic';
            if (window.AuthManager) {
              const u = window.AuthManager.getCurrentUser();
              if (u) {
                if (u.role === 'issuer') roleTheme = 'issuer';
                else if (u.role === 'police') roleTheme = 'police';
                else if (u.role === 'user') roleTheme = 'citizen';
              }
            }
            if (roleTheme !== this.activeThemeKey && !['threat', 'clean'].includes(this.activeThemeKey)) {
              this.setTheme(roleTheme);
            }
          }
        }
      });

      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class', 'style', 'aria-hidden']
      });

      // Hook click events on portal switch buttons
      const bindClick = (id, theme) => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.addEventListener('click', () => {
            setTimeout(() => this.setTheme(theme), 50);
          });
        }
      };

      bindClick('switchIssuerBtn', 'issuer');
      bindClick('switchCitizenBtn', 'citizen');
      bindClick('switchPoliceBtn', 'police');
      bindClick('btnOpenIssueDocModal', 'issuer');
      bindClick('btnOpenPoliceDbModal', 'police');
      bindClick('openCameraBtn', 'camera');
      bindClick('quickCameraTrigger', 'camera');
      bindClick('exportReportBtn', 'report');
      bindClick('openHostModalBtn', 'host');
      bindClick('openLoginModalBtn', 'auth');

      // Hook close buttons
      const closeButtons = [
        'closeCameraModalBtn', 'cancelCameraBtn',
        'closeReportModalBtn',
        'closeHostModalBtn', 'closeHostModalBtn2',
        'closeLoginModalBtn',
        'closeIssueDocModalBtn',
        'closePoliceDbModalBtn', 'closePoliceDbModalBtn2',
        'closeOfficialRecordModalBtn', 'closeOfficialRecordModalBtn2'
      ];

      closeButtons.forEach((btnId) => {
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.addEventListener('click', () => {
            setTimeout(() => this.revertToCurrentState(), 60);
          });
        }
      });

      // Initial state sync
      setTimeout(() => this.revertToCurrentState(), 100);
    }

    render(timestamp) {
      if (!this.canvas || !this.ctx) return;

      // Throttle if tab is not focused
      if (this.isDocumentHidden) {
        setTimeout(() => requestAnimationFrame((t) => this.render(t)), 250);
        return;
      }

      this.animTime += 0.02;

      // 1. Smooth Color Morphing (Linear Interpolation - Lerp)
      const lerpSpeed = 0.055;
      for (let i = 0; i < 3; i++) {
        this.curPrimary[i] += (this.targetTheme.primary[i] - this.curPrimary[i]) * lerpSpeed;
        this.curSecondary[i] += (this.targetTheme.secondary[i] - this.curSecondary[i]) * lerpSpeed;
        this.curAccent[i] += (this.targetTheme.accent[i] - this.curAccent[i]) * lerpSpeed;
      }
      this.curSpeed += (this.targetTheme.speed - this.curSpeed) * lerpSpeed;

      // Smooth mouse easing
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      const pR = Math.round(this.curPrimary[0]);
      const pG = Math.round(this.curPrimary[1]);
      const pB = Math.round(this.curPrimary[2]);

      const sR = Math.round(this.curSecondary[0]);
      const sG = Math.round(this.curSecondary[1]);
      const sB = Math.round(this.curSecondary[2]);

      const aR = Math.round(this.curAccent[0]);
      const aG = Math.round(this.curAccent[1]);
      const aB = Math.round(this.curAccent[2]);

      const ctx = this.ctx;
      const W = this.canvas.width;
      const H = this.canvas.height;

      // 2. Clear canvas with dark gradient trailing tint
      ctx.fillStyle = 'rgba(7, 10, 19, 0.22)';
      ctx.fillRect(0, 0, W, H);

      // 3. Ambient Moving Glow Orbs (Dynamic Lighting Layer)
      this.renderAmbientGlowOrbs(ctx, W, H, pR, pG, pB, sR, sG, sB);

      // 4. Mode-Specific Visual Effects
      const currentEffect = this.targetTheme.effect;

      if (currentEffect === 'policeSiren') {
        this.renderPoliceSirenEffect(ctx, W, H, pR, pG, pB, sR, sG, sB);
      } else if (currentEffect === 'laserScan') {
        this.renderLaserScanEffect(ctx, W, H, pR, pG, pB);
      } else if (currentEffect === 'threatAlert') {
        this.renderThreatGlitchEffect(ctx, W, H, pR, pG, pB);
      } else if (currentEffect === 'cleanTranquil') {
        this.renderCleanRippleEffect(ctx, W, H, pR, pG, pB);
      } else if (currentEffect === 'goldenSovereign') {
        this.renderSovereignDust(ctx, W, H, pR, pG, pB);
      }

      // 5. Digital Matrix Rain (for Cyber, Police & Threat)
      if (['matrix', 'policeSiren', 'threatAlert'].includes(currentEffect)) {
        this.renderMatrixRain(ctx, W, H, pR, pG, pB, sR, sG, sB);
      }

      // 6. Constellation Particle Nodes & Laser Grid Lines
      this.renderParticlesAndLasers(ctx, W, H, pR, pG, pB, sR, sG, sB, aR, aG, aB);

      requestAnimationFrame((t) => this.render(t));
    }

    renderAmbientGlowOrbs(ctx, W, H, pR, pG, pB, sR, sG, sB) {
      // Dynamic Orb 1: Orbits softly in top-left / center
      const orb1X = W * 0.25 + Math.sin(this.animTime * 0.4) * 140;
      const orb1Y = H * 0.28 + Math.cos(this.animTime * 0.3) * 110;
      const rad1 = Math.max(W, H) * 0.38;

      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, rad1);
      grad1.addColorStop(0, `rgba(${pR}, ${pG}, ${pB}, 0.12)`);
      grad1.addColorStop(0.5, `rgba(${pR}, ${pG}, ${pB}, 0.04)`);
      grad1.addColorStop(1, 'transparent');

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, W, H);

      // Dynamic Orb 2: Follows mouse lightly in bottom-right
      const orb2X = this.mouse.x;
      const orb2Y = this.mouse.y;
      const rad2 = Math.max(W, H) * 0.32;

      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, rad2);
      grad2.addColorStop(0, `rgba(${sR}, ${sG}, ${sB}, 0.10)`);
      grad2.addColorStop(0.6, `rgba(${sR}, ${sG}, ${sB}, 0.02)`);
      grad2.addColorStop(1, 'transparent');

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, W, H);
    }

    renderPoliceSirenEffect(ctx, W, H, pR, pG, pB, sR, sG, sB) {
      // Tactical Law Enforcement Strobe Beacon
      this.policeBeaconAngle += 0.045;
      const sweepX = (Math.sin(this.policeBeaconAngle) + 1) * 0.5 * W;

      // Strobe pulse alternate (Red on Left, Blue on Right)
      const isRedPulse = Math.sin(this.policeBeaconAngle * 3) > 0;
      const pulseColor = isRedPulse ? `rgba(${pR}, ${pG}, ${pB}, 0.14)` : `rgba(${sR}, ${sG}, ${sB}, 0.14)`;

      const beaconGrad = ctx.createRadialGradient(sweepX, H * 0.1, 0, sweepX, H * 0.1, W * 0.55);
      beaconGrad.addColorStop(0, pulseColor);
      beaconGrad.addColorStop(0.7, 'transparent');

      ctx.fillStyle = beaconGrad;
      ctx.fillRect(0, 0, W, H);

      // Corner Red/Blue emergency beacon indicators
      ctx.fillStyle = `rgba(${pR}, ${pG}, ${pB}, ${isRedPulse ? 0.35 : 0.05})`;
      ctx.fillRect(0, 0, 18, H);
      ctx.fillStyle = `rgba(${sR}, ${sG}, ${sB}, ${!isRedPulse ? 0.35 : 0.05})`;
      ctx.fillRect(W - 18, 0, 18, H);
    }

    renderLaserScanEffect(ctx, W, H, pR, pG, pB) {
      // Green Optical Document Laser Sweep
      this.laserY = (this.laserY + 3.8) % H;

      ctx.save();
      const laserGrad = ctx.createLinearGradient(0, this.laserY - 24, 0, this.laserY + 24);
      laserGrad.addColorStop(0, 'transparent');
      laserGrad.addColorStop(0.5, `rgba(${pR}, ${pG}, ${pB}, 0.75)`);
      laserGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = laserGrad;
      ctx.fillRect(0, this.laserY - 24, W, 48);

      // Bright laser core beam
      ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
      ctx.fillRect(0, this.laserY - 1, W, 2);
      ctx.restore();
    }

    renderThreatGlitchEffect(ctx, W, H, pR, pG, pB) {
      // Erratic Crimson Alert Pulse
      const glitchIntensity = Math.random() > 0.88 ? 0.28 : 0.08;
      ctx.fillStyle = `rgba(${pR}, ${pG}, ${pB}, ${glitchIntensity})`;
      ctx.fillRect(0, 0, W, H);

      // Horizontal alert glitch slices
      if (Math.random() > 0.82) {
        const sliceY = Math.random() * H;
        const sliceH = Math.random() * 25 + 6;
        ctx.fillStyle = `rgba(${pR}, 255, 255, 0.45)`;
        ctx.fillRect(0, sliceY, W, sliceH);
      }
    }

    renderCleanRippleEffect(ctx, W, H, pR, pG, pB) {
      // Tranquil Authentic Emerald Harmonic Ripple
      const waveRadius = (this.animTime * 70) % (Math.max(W, H) * 0.65);
      const waveAlpha = Math.max(0, 0.28 * (1 - waveRadius / (Math.max(W, H) * 0.65)));

      ctx.save();
      ctx.beginPath();
      ctx.arc(W * 0.5, H * 0.45, waveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${pR}, ${pG}, ${pB}, ${waveAlpha})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgba(${pR}, ${pG}, ${pB}, 0.6)`;
      ctx.stroke();
      ctx.restore();
    }

    renderSovereignDust(ctx, W, H, pR, pG, pB) {
      // Golden Embers Floating Upward (Regal Government Sovereign Aura)
      ctx.save();
      for (let i = 0; i < 15; i++) {
        const x = (Math.sin(this.animTime + i * 2) * 0.5 + 0.5) * W;
        const y = (H - ((this.animTime * 45 + i * 85) % H));
        const size = (Math.sin(i + this.animTime) * 1.5 + 2);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pR}, ${pG}, ${pB}, 0.45)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${pR}, ${pG}, ${pB}, 0.8)`;
        ctx.fill();
      }
      ctx.restore();
    }

    renderMatrixRain(ctx, W, H, pR, pG, pB, sR, sG, sB) {
      const chars = this.targetTheme.matrixChars || '0123456789ABCDEF';
      ctx.font = `${this.matrixFontSize}px monospace`;

      for (let i = 0; i < this.matrixDrops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * this.matrixFontSize;
        const y = this.matrixDrops[i] * this.matrixFontSize;

        if (y > 0 && y < H) {
          if (Math.random() > 0.94) {
            ctx.fillStyle = `rgba(255, 255, 255, 0.9)`; // Lead glowing white spark
          } else if (Math.random() > 0.82) {
            ctx.fillStyle = `rgba(${pR}, ${pG}, ${pB}, 0.65)`;
          } else {
            ctx.fillStyle = `rgba(${sR}, ${sG}, ${sB}, 0.28)`;
          }
          ctx.fillText(text, x, y);
        }

        if (y > H && Math.random() > 0.978) {
          this.matrixDrops[i] = 0;
        }
        this.matrixDrops[i] += this.curSpeed * 0.85;
      }
    }

    renderParticlesAndLasers(ctx, W, H, pR, pG, pB, sR, sG, sB, aR, aG, aB) {
      const nodes = this.nodes;
      const speed = this.curSpeed;

      // Update positions
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx * speed;
        node.y += node.vy * speed;
        node.pulse += node.pulseSpeed;

        if (node.x < 0) node.x = W;
        if (node.x > W) node.x = 0;
        if (node.y < 0) node.y = H;
        if (node.y > H) node.y = 0;

        // Draw node
        const currentSize = node.size + Math.sin(node.pulse) * 0.8;
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(0.8, currentSize), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pR}, ${pG}, ${pB}, 0.75)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${pR}, ${pG}, ${pB}, 0.6)`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby nodes with glowing laser lines
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 125;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(${pR}, ${pG}, ${pB}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }
  }

  // Instantiate and expose globally
  window.DynamicBackground = new ReactiveBackgroundEngine();

})();
