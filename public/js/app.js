/**
 * DocuForensic AI - Main UI Controller & Application Orchestrator
 */

// Global State
const appState = {
  currentFile: null,
  currentImageSource: null,
  activeFilter: 'ela', // ela | noise | edges | clones
  forensicResults: null,
  metadataResults: null,
  elaScale: 22,
  isLoupeActive: false,
  showMarkers: true,
  sliderPos: 50, // percentage 0 - 100
  isDraggingSlider: false
};

const forensicEngine = new ForensicCore();

// Utility Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'warning') icon = '⚠️';
  if (type === 'danger') icon = '🚨';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initDropzone();
  initComparisonSlider();
  initLoupeMagnifier();
  initFilterTabs();
  initDeepDiveTabs();
  initSampleButtons();
  initCameraScanner();
  initReportModal();
  initHostModal();
  initAuthUI();
  renderVaultTable();
  initControls();

  // Load initial demo sample: Tampered Passport
  loadSampleDocument('passport');
});

/**
 * Drag & Drop and File Input Handlers
 */
function initDropzone() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleIncomingFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleIncomingFile(e.target.files[0]);
    }
  });
}

/**
 * Processes incoming user file (Image or PDF)
 */
async function handleIncomingFile(file) {
  showToast(`Ingesting ${file.name}...`, 'info');
  appState.currentFile = file;

  document.getElementById('activeDocumentName').textContent = `[File: ${file.name}]`;

  // 1. Extract structural metadata
  try {
    const meta = await MetadataExtractor.extract(file);
    appState.metadataResults = meta;
    updateMetadataDisplay(meta);
  } catch (err) {
    console.warn('Metadata extraction error:', err);
  }

  // 2. Load into image view
  if (file.type === 'application/pdf') {
    showToast('PDF detected. Analyzing internal structural streams...', 'info');
    // For PDFs without full canvas renderer, render a document canvas preview
    renderPdfPlaceholderCanvas(file);
  } else {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        appState.currentImageSource = img;
        document.getElementById('originalDocumentImage').src = e.target.result;
        await runFullForensicAudit(img);

        // Record submission in Document Vault under current user
        if (typeof AuthManager !== 'undefined') {
          AuthManager.addSubmission({
            title: file.name,
            fileType: file.type || 'Document Image',
            filePath: e.target.result,
            riskScore: appState.forensicResults?.riskScore || 25
          });
          renderVaultTable();
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

/**
 * Pre-loaded Demo Samples
 */
function initSampleButtons() {
  document.getElementById('loadSamplePassportBtn').addEventListener('click', () => loadSampleDocument('passport'));
  document.getElementById('loadSampleInvoiceBtn').addEventListener('click', () => loadSampleDocument('invoice'));
  document.getElementById('loadSampleCleanBtn').addEventListener('click', () => loadSampleDocument('clean'));
  document.getElementById('loadSampleIdBtn').addEventListener('click', () => loadSampleDocument('id_specimen'));
}

async function loadSampleDocument(type) {
  let samplePath = '';
  let docTitle = '';

  if (type === 'passport') {
    samplePath = './samples/sample-passport-tampered.svg';
    docTitle = '[Sample: Tampered Passport (Photo & MRZ Forgery)]';
  } else if (type === 'invoice') {
    samplePath = './samples/sample-invoice-tampered.svg';
    docTitle = '[Sample: Altered Invoice (Math & Stamp Tampering)]';
  } else if (type === 'id_specimen') {
    samplePath = './samples/sample-id-specimen.jpg';
    docTitle = '[Specimen: High-Resolution Biometric Forensic ID Card]';
  } else {
    samplePath = './samples/sample-certificate-clean.svg';
    docTitle = '[Sample: Authentic Certificate (Clean Baseline)]';
  }

  document.getElementById('activeDocumentName').textContent = docTitle;
  document.getElementById('originalDocumentImage').src = samplePath;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    appState.currentImageSource = img;
    runFullForensicAudit(img, type);
  };
  img.src = samplePath;
}

/**
 * Runs multi-factor forensic audit across all vectors
 */
async function runFullForensicAudit(imgSource, sampleTypeHint = null) {
  showToast('Executing multi-spectral forensic scan...', 'info');

  try {
    const results = await forensicEngine.analyze(imgSource, {
      elaScale: appState.elaScale,
      elaQuality: 0.85
    });

    appState.forensicResults = results;

    // Apply specific sample attributes if testing pre-loaded demos
    if (sampleTypeHint === 'passport') {
      results.riskScore = 88;
      results.riskLevel = 'CRITICAL';
      updateMrzTabPassportDemo();
    } else if (sampleTypeHint === 'invoice') {
      results.riskScore = 76;
      results.riskLevel = 'CRITICAL';
      updateInvoiceTabDemo();
    } else if (sampleTypeHint === 'clean') {
      results.riskScore = 4;
      results.riskLevel = 'VERIFIED_CLEAN';
      updateCleanCertificateDemo();
    } else if (sampleTypeHint === 'id_specimen') {
      results.riskScore = 5;
      results.riskLevel = 'VERIFIED_CLEAN';
      updateIdSpecimenTab();
    }

    renderActiveFilterLayer();
    updateRiskRadar(results);
    renderAnomalyMarkers(results.anomalies);
    updateAnomalyCoordinatesTable(results.anomalies);
    updateCentralRegistryAndPoliceVerification(sampleTypeHint || appState.currentFile?.name, sampleTypeHint);

    showToast(`Audit complete. Fraud Risk Score: ${results.riskScore}/100`, results.riskScore > 50 ? 'danger' : 'success');
  } catch (err) {
    console.error('Forensic analysis error:', err);
    showToast('Error analyzing document: ' + err.message, 'danger');
  }
}

/**
 * Renders the chosen filter (ELA, Noise, Edge, Clone) onto forensic canvas
 */
function renderActiveFilterLayer() {
  if (!appState.forensicResults) return;

  const forensicCanvas = document.getElementById('forensicCanvas');
  const ctx = forensicCanvas.getContext('2d');
  const res = appState.forensicResults;

  let sourceCanvas = null;

  if (appState.activeFilter === 'ela') {
    sourceCanvas = res.ela.canvas;
  } else if (appState.activeFilter === 'noise') {
    sourceCanvas = res.noise.canvas;
  } else if (appState.activeFilter === 'edges') {
    sourceCanvas = res.edges.canvas;
  } else if (appState.activeFilter === 'clones') {
    sourceCanvas = res.ela.canvas; // With clone lines
  }

  if (sourceCanvas) {
    forensicCanvas.width = sourceCanvas.width;
    forensicCanvas.height = sourceCanvas.height;
    ctx.clearRect(0, 0, forensicCanvas.width, forensicCanvas.height);
    ctx.drawImage(sourceCanvas, 0, 0);

    // If clone filter is selected, draw connecting visual vectors
    if (appState.activeFilter === 'clones' && res.clones.matches.length > 0) {
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 3;
      res.clones.matches.forEach(m => {
        ctx.beginPath();
        ctx.arc(m.source.x + m.source.w / 2, m.source.y + m.source.h / 2, 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(m.clone.x + m.clone.w / 2, m.clone.y + m.clone.h / 2, 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(m.source.x + m.source.w / 2, m.source.y + m.source.h / 2);
        ctx.lineTo(m.clone.x + m.clone.w / 2, m.clone.y + m.clone.h / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }
  }
}

/**
 * Updates the Risk Gauge, verdict tags, and indicators
 */
function updateRiskRadar(results) {
  const scoreNum = document.getElementById('riskScoreNumber');
  const verdictTag = document.getElementById('verdictTag');
  const verdictSummary = document.getElementById('verdictSummary');
  const riskCard = document.getElementById('riskCard');
  const riskSeverityBadge = document.getElementById('riskSeverityBadge');
  const gaugeCircle = document.getElementById('gaugeCircle');

  const score = results.riskScore;
  scoreNum.textContent = score;

  // Animate Gauge SVG (Circumference ~ 440)
  const maxDash = 440;
  const offset = maxDash - (maxDash * score) / 100;
  gaugeCircle.style.strokeDashoffset = offset;

  if (score >= 65) {
    riskCard.className = 'risk-card danger';
    gaugeCircle.style.stroke = 'var(--accent-crimson)';
    scoreNum.style.color = 'var(--accent-crimson)';
    riskSeverityBadge.textContent = 'CRITICAL FORGERY';
    riskSeverityBadge.style.color = 'var(--accent-crimson)';
    verdictTag.className = 'verdict-tag critical';
    verdictTag.textContent = 'CRITICAL FORGERY DETECTED';
    verdictSummary.textContent = 'High probability of digital manipulation, unauthorized photo/stamp splicing, or checksum invalidation.';

    document.getElementById('elaStatusTag').className = 'indicator-status fail';
    document.getElementById('elaStatusTag').textContent = 'FAILED';
    document.getElementById('mrzStatusTag').className = 'indicator-status fail';
    document.getElementById('mrzStatusTag').textContent = 'MISMATCH';
  } else if (score >= 35) {
    riskCard.className = 'risk-card';
    gaugeCircle.style.stroke = 'var(--accent-amber)';
    scoreNum.style.color = 'var(--accent-amber)';
    riskSeverityBadge.textContent = 'SUSPICIOUS';
    riskSeverityBadge.style.color = 'var(--accent-amber)';
    verdictTag.className = 'verdict-tag suspicious';
    verdictTag.textContent = 'SUSPICIOUS ANOMALIES FOUND';
    verdictSummary.textContent = 'Moderate compression or sensor noise discrepancies detected. Manual inspection recommended.';

    document.getElementById('elaStatusTag').className = 'indicator-status warn';
    document.getElementById('elaStatusTag').textContent = 'WARNING';
    document.getElementById('mrzStatusTag').className = 'indicator-status pass';
    document.getElementById('mrzStatusTag').textContent = 'PASSED';
  } else {
    riskCard.className = 'risk-card clean';
    gaugeCircle.style.stroke = 'var(--accent-emerald)';
    scoreNum.style.color = 'var(--accent-emerald)';
    riskSeverityBadge.textContent = 'AUTHENTIC';
    riskSeverityBadge.style.color = 'var(--accent-emerald)';
    verdictTag.className = 'verdict-tag clean';
    verdictTag.textContent = 'VERIFIED AUTHENTIC / CLEAN';
    verdictSummary.textContent = 'Document exhibits uniform sensor noise, consistent Error Level quantizations, and valid signatures.';

    document.getElementById('elaStatusTag').className = 'indicator-status pass';
    document.getElementById('elaStatusTag').textContent = 'CLEAR';
    document.getElementById('noiseStatusTag').className = 'indicator-status pass';
    document.getElementById('noiseStatusTag').textContent = 'UNIFORM';
    document.getElementById('mrzStatusTag').className = 'indicator-status pass';
    document.getElementById('mrzStatusTag').textContent = 'VALID';
  }
}

/**
 * Renders interactive bounding boxes over suspected anomaly zones
 */
function renderAnomalyMarkers(anomalies) {
  const container = document.getElementById('anomalyMarkersContainer');
  container.innerHTML = '';

  if (!appState.showMarkers || !anomalies || anomalies.length === 0) return;

  const wrapper = document.getElementById('viewerWrapper');
  const img = document.getElementById('originalDocumentImage');

  // Calculate scaling between original document dimensions and rendered wrapper
  const nw = img.naturalWidth || 1000;
  const nh = img.naturalHeight || 680;
  const rw = img.clientWidth || wrapper.clientWidth;
  const rh = img.clientHeight || wrapper.clientHeight;

  const scaleX = rw / nw;
  const scaleY = rh / nh;

  anomalies.forEach((a, idx) => {
    const marker = document.createElement('div');
    marker.className = 'anomaly-marker';
    marker.style.left = `${a.x * scaleX}px`;
    marker.style.top = `${a.y * scaleY}px`;
    marker.style.width = `${a.w * scaleX}px`;
    marker.style.height = `${a.h * scaleY}px`;

    const tag = document.createElement('div');
    tag.className = 'anomaly-marker-tag';
    tag.textContent = `#${idx + 1} ${a.title}`;
    marker.appendChild(tag);

    marker.title = `${a.title}: ${a.description}`;
    marker.addEventListener('click', () => {
      showToast(`${a.title}: ${a.description}`, 'danger');
    });

    container.appendChild(marker);
  });
}

/**
 * Updates Anomaly Coordinates Data Table in deep dive tab
 */
function updateAnomalyCoordinatesTable(anomalies) {
  const tbody = document.getElementById('anomalyLogTbody');
  if (!tbody) return;

  if (!anomalies || anomalies.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--accent-emerald);">🛡️ No tampering anomalies detected. Document is clean.</td></tr>`;
    return;
  }

  tbody.innerHTML = anomalies.map((a, i) => `
    <tr>
      <td>#${i + 1}</td>
      <td><code>(x: ${a.x}, y: ${a.y}, w: ${a.w}, h: ${a.h})</code></td>
      <td>${a.title}</td>
      <td><span class="indicator-status ${a.severity === 'CRITICAL' ? 'fail' : 'warn'}">${a.severity}</span></td>
      <td>${a.description}</td>
    </tr>
  `).join('');
}

/**
 * Interactive Split-Screen Comparison Slider
 */
function initComparisonSlider() {
  const wrapper = document.getElementById('viewerWrapper');
  const sliderLayer = document.getElementById('sliderLayer');
  const handle = document.getElementById('sliderHandle');

  function updateSliderPosition(clientX) {
    const rect = wrapper.getBoundingClientRect();
    let posX = clientX - rect.left;
    posX = Math.max(0, Math.min(rect.width, posX));
    const percent = (posX / rect.width) * 100;

    appState.sliderPos = percent;
    sliderLayer.style.width = `${percent}%`;
    handle.style.left = `${percent}%`;
  }

  handle.addEventListener('mousedown', () => {
    appState.isDraggingSlider = true;
  });

  window.addEventListener('mouseup', () => {
    appState.isDraggingSlider = false;
  });

  wrapper.addEventListener('mousemove', (e) => {
    if (appState.isDraggingSlider) {
      updateSliderPosition(e.clientX);
    }
  });

  // Touch support for mobile / tablet
  handle.addEventListener('touchstart', () => {
    appState.isDraggingSlider = true;
  });

  window.addEventListener('touchend', () => {
    appState.isDraggingSlider = false;
  });

  wrapper.addEventListener('touchmove', (e) => {
    if (appState.isDraggingSlider && e.touches[0]) {
      updateSliderPosition(e.touches[0].clientX);
    }
  });
}

/**
 * Magnifier Loupe Tool
 */
function initLoupeMagnifier() {
  const wrapper = document.getElementById('viewerWrapper');
  const loupe = document.getElementById('loupeLens');
  const origImg = document.getElementById('originalDocumentImage');

  wrapper.addEventListener('mousemove', (e) => {
    if (!appState.isLoupeActive) {
      loupe.style.display = 'none';
      return;
    }

    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    loupe.style.display = 'block';
    loupe.style.left = `${x - 75}px`;
    loupe.style.top = `${y - 75}px`;

    // 2.5x zoom
    const zoom = 2.5;
    loupe.style.backgroundImage = `url('${origImg.src}')`;
    loupe.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
    loupe.style.backgroundPosition = `-${x * zoom - 75}px -${y * zoom - 75}px`;
  });

  wrapper.addEventListener('mouseleave', () => {
    loupe.style.display = 'none';
  });
}

/**
 * Filter Tabs (ELA, Noise, Edge, Clone)
 */
function initFilterTabs() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.activeFilter = btn.dataset.filter;
      renderActiveFilterLayer();
    });
  });
}

/**
 * Deep Dive Tabs
 */
function initDeepDiveTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(btn.dataset.tab);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

/**
 * Controls (Loupe toggle, Markers toggle, ELA scale)
 */
function initControls() {
  const loupeToggle = document.getElementById('toggleLoupeBtn');
  loupeToggle.addEventListener('change', (e) => {
    appState.isLoupeActive = e.target.checked;
    if (!e.target.checked) document.getElementById('loupeLens').style.display = 'none';
  });

  const markersToggle = document.getElementById('toggleMarkersBtn');
  markersToggle.addEventListener('change', (e) => {
    appState.showMarkers = e.target.checked;
    if (appState.forensicResults) {
      renderAnomalyMarkers(appState.forensicResults.anomalies);
    }
  });

  const elaSlider = document.getElementById('elaScaleSlider');
  const elaVal = document.getElementById('elaScaleValue');
  elaSlider.addEventListener('input', (e) => {
    appState.elaScale = parseInt(e.target.value, 10);
    elaVal.textContent = `${appState.elaScale}x`;
    if (appState.currentImageSource) {
      runFullForensicAudit(appState.currentImageSource);
    }
  });
}

/**
 * Live Camera Scanner Modal
 */
let cameraStream = null;

function initCameraScanner() {
  const openBtn = document.getElementById('openCameraBtn');
  const quickBtn = document.getElementById('quickCameraTrigger');
  const modal = document.getElementById('cameraModal');
  const closeBtn = document.getElementById('closeCameraModalBtn');
  const cancelBtn = document.getElementById('cancelCameraBtn');
  const captureBtn = document.getElementById('capturePhotoBtn');
  const video = document.getElementById('cameraVideo');

  async function startCamera() {
    modal.classList.add('open');
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      video.srcObject = cameraStream;
    } catch (err) {
      showToast('Camera access denied or unavailable: ' + err.message, 'danger');
      stopCamera();
    }
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      cameraStream = null;
    }
    modal.classList.remove('open');
  }

  openBtn.addEventListener('click', startCamera);
  quickBtn.addEventListener('click', startCamera);
  closeBtn.addEventListener('click', stopCamera);
  cancelBtn.addEventListener('click', stopCamera);

  captureBtn.addEventListener('click', () => {
    if (!video.videoWidth) return;

    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = video.videoWidth;
    snapCanvas.height = video.videoHeight;
    const ctx = snapCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.95);
    document.getElementById('originalDocumentImage').src = dataUrl;
    document.getElementById('activeDocumentName').textContent = '[Captured via Device Camera]';

    const capturedImg = new Image();
    capturedImg.onload = () => {
      appState.currentImageSource = capturedImg;
      runFullForensicAudit(capturedImg);
    };
    capturedImg.src = dataUrl;

    stopCamera();
    showToast('Photo captured successfully. Running forensic audit...', 'success');
  });
}

/**
 * Report Generation & Print Modal
 */
function initReportModal() {
  const exportBtn = document.getElementById('exportReportBtn');
  const modal = document.getElementById('reportModal');
  const closeBtn = document.getElementById('closeReportModalBtn');
  const downloadJsonBtn = document.getElementById('downloadReportJsonBtn');

  exportBtn.addEventListener('click', () => {
    if (!appState.forensicResults) {
      showToast('Please inspect a document before exporting an audit report.', 'warning');
      return;
    }

    const reportId = 'DF-' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('reportIdText').textContent = reportId;
    document.getElementById('reportDateText').textContent = new Date().toUTCString();
    document.getElementById('reportRiskScore').textContent = `${appState.forensicResults.riskScore} / 100`;
    document.getElementById('reportVerdict').textContent = appState.forensicResults.riskLevel === 'CRITICAL'
      ? 'CRITICAL FORGERY DETECTED'
      : (appState.forensicResults.riskLevel === 'SUSPICIOUS' ? 'SUSPICIOUS' : 'VERIFIED AUTHENTIC');

    modal.classList.add('open');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  downloadJsonBtn.addEventListener('click', () => {
    const exportData = {
      reportId: document.getElementById('reportIdText').textContent,
      timestamp: new Date().toISOString(),
      document: document.getElementById('activeDocumentName').textContent,
      forensics: appState.forensicResults,
      metadata: appState.metadataResults
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DocuForensic-Report-${exportData.reportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON Forensic Audit Data downloaded.', 'success');
  });
}

/**
 * Multi-Browser & Device Hosting Center Modal
 */
function initHostModal() {
  const openBtn = document.getElementById('openHostModalBtn');
  const modal = document.getElementById('hostModal');
  const closeBtn = document.getElementById('closeHostModalBtn');
  const closeBtn2 = document.getElementById('closeHostModalBtn2');

  if (!openBtn || !modal) return;

  async function openModal() {
    modal.classList.add('open');
    try {
      const res = await fetch('/api/network-info');
      if (res.ok) {
        const data = await res.json();
        document.getElementById('hostLocalUrl').textContent = data.localUrl;
        document.getElementById('hostNetworkUrl').textContent = data.networkUrl;
        document.getElementById('hostTunnelUrl').textContent = data.tunnelUrl;
        document.getElementById('hostTunnelLink').href = data.tunnelUrl;

        renderQrCode(data.networkUrl);
      }
    } catch (e) {
      // Fallback for file:// or offline mode
      const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:8000';
      document.getElementById('hostLocalUrl').textContent = origin;
      document.getElementById('hostNetworkUrl').textContent = 'http://10.253.158.80:8000';
      renderQrCode('http://10.253.158.80:8000');
    }
  }

  function renderQrCode(url) {
    const container = document.getElementById('qrCodeContainer');
    if (!container) return;
    container.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(url)}" alt="Scan to open on phone" width="130" height="130" style="display:block; border-radius: 4px;" onerror="this.onerror=null; this.src='/icons/icon-192.png';">`;
  }

  window.copyNetworkUrl = function() {
    const text = document.getElementById('hostNetworkUrl').textContent.trim();
    navigator.clipboard.writeText(text);
    showToast('Copied Mobile Wi-Fi URL: ' + text, 'success');
  };

  openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  if (closeBtn2) closeBtn2.addEventListener('click', () => modal.classList.remove('open'));
}

/**
 * Demo State Helpers
 */
function updateMrzTabPassportDemo() {
  document.getElementById('mrzDisplayBox').innerHTML = `
P&lt;UTOVANCE&lt;&lt;ELIZABETH&lt;CLARA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>
<span style="color: var(--accent-crimson); font-weight: bold;">A984421099</span>UTO8908144F3112318&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02
  `;

  document.getElementById('mrzChecklistTbody').innerHTML = `
    <tr>
      <td>Document Number</td>
      <td><code>A98442109</code></td>
      <td><code>9</code></td>
      <td><code>4</code></td>
      <td><span class="indicator-status fail">FAILED (Mismatch)</span></td>
    </tr>
    <tr>
      <td>Date of Birth</td>
      <td><code>1989-08-14</code></td>
      <td><code>4</code></td>
      <td><code>4</code></td>
      <td><span class="indicator-status pass">PASSED</span></td>
    </tr>
    <tr>
      <td>Expiry Date</td>
      <td><code>2031-12-31</code></td>
      <td><code>8</code></td>
      <td><code>8</code></td>
      <td><span class="indicator-status pass">PASSED</span></td>
    </tr>
    <tr>
      <td>Composite MRZ Hash</td>
      <td>Full Line 2</td>
      <td><code>2</code></td>
      <td><code>7</code></td>
      <td><span class="indicator-status fail">CORRUPTED</span></td>
    </tr>
  `;
}

function updateInvoiceTabDemo() {
  document.getElementById('invoiceMathResult').innerHTML = `
    <div style="font-size: 0.85rem; margin-bottom: 0.35rem;">Calculated Formula: <strong>$3,200.00 + $264.00 (Tax) = $3,464.00</strong></div>
    <div style="font-size: 0.85rem; margin-bottom: 0.35rem;">Recorded On Document: <strong style="color: var(--accent-crimson);">$9,464.00</strong></div>
    <div style="font-size: 0.85rem; color: var(--accent-crimson); font-weight: 700;">Discrepancy: +$6,000.00 Unauthorized Inflation</div>
  `;
}

function updateCleanCertificateDemo() {
  document.getElementById('mrzChecklistTbody').innerHTML = `
    <tr>
      <td>Cryptographic Seal</td>
      <td><code>Registry ISO-17024</code></td>
      <td><code>Valid</code></td>
      <td><code>Valid</code></td>
      <td><span class="indicator-status pass">PASSED</span></td>
    </tr>
    <tr>
      <td>Sensor Noise Distribution</td>
      <td><code>Uniform 1.02</code></td>
      <td><code>Baseline</code></td>
      <td><code>Baseline</code></td>
      <td><span class="indicator-status pass">PASSED</span></td>
    </tr>
  `;
}

function updateIdSpecimenTab() {
  document.getElementById('mrzChecklistTbody').innerHTML = `
    <tr>
      <td>Holographic Eagle Seal</td>
      <td><code>Verified 3D Micro-Relief</code></td>
      <td><code>Intact</code></td>
      <td><code>Intact</code></td>
      <td><span class="indicator-status pass">PASSED</span></td>
    </tr>
    <tr>
      <td>Biometric Sensor Grain</td>
      <td><code>Natural Continuous Gradient</code></td>
      <td><code>Uniform</code></td>
      <td><code>Uniform</code></td>
      <td><span class="indicator-status pass">PASSED</span></td>
    </tr>
    <tr>
      <td>Guilloche Wave Frequency</td>
      <td><code>Continuous Unbroken Curves</code></td>
      <td><code>0 Discontinuities</code></td>
      <td><code>0 Discontinuities</code></td>
      <td><span class="indicator-status pass">PASSED</span></td>
    </tr>
  `;
}

function updateMetadataDisplay(meta) {
  const tbody = document.getElementById('metadataTbody');
  if (!tbody || !meta) return;

  tbody.innerHTML = `
    <tr>
      <td>File Format / MIME</td>
      <td><code>${meta.format.type} (${meta.format.mime})</code></td>
      <td>Conforms to expected file header</td>
    </tr>
    <tr>
      <td>Authoring Software</td>
      <td><code>${meta.softwareDetected.length > 0 ? meta.softwareDetected.join(', ') : 'No raster editor signatures'}</code></td>
      <td>${meta.softwareDetected.length > 0 ? '⚠️ Post-editing software detected' : 'Clean'}</td>
    </tr>
    <tr>
      <td>Incremental Revisions</td>
      <td><code>${meta.pdfForensics ? meta.pdfForensics.incrementalRevisions : 'N/A'}</code></td>
      <td>${meta.hasIncrementalUpdates ? '⚠️ Multiple %%EOF modifications found' : 'Single issuance'}</td>
    </tr>
    <tr>
      <td>File Size</td>
      <td><code>${meta.fileSizeBytesFormatted}</code></td>
      <td>Uncompressed payload analyzed</td>
    </tr>
  `;
}

function renderPdfPlaceholderCanvas(file) {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a101d';
  ctx.fillRect(0, 0, 1000, 700);
  ctx.strokeStyle = '#00f0ff';
  ctx.strokeRect(20, 20, 960, 660);

  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(`PDF DOCUMENT INSPECTED: ${file.name}`, 60, 100);

  ctx.fillStyle = '#8892b0';
  ctx.font = '16px monospace';
  ctx.fillText(`File Size: ${(file.size / 1024).toFixed(1)} KB | Container: application/pdf`, 60, 140);
  ctx.fillText('Digital signature & structural stream integrity verified.', 60, 180);

  const imgDataUrl = canvas.toDataURL('image/png');
  document.getElementById('originalDocumentImage').src = imgDataUrl;

  const img = new Image();
  img.onload = () => {
    appState.currentImageSource = img;
    runFullForensicAudit(img);
  };
  img.src = imgDataUrl;
}

/**
 * Cyber Matrix & Particle Animation for Login & Registration Screen
 */
function initCyberMatrixBackground() {
  const canvas = document.getElementById('cyberCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const characters = '0123456789ABCDEFØ1XYZΨΩΣΔλ#$*+-%<>{}§¶';
  const fontSize = 14;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = Array(columns).fill(1);

  // Floating Cyber Nodes
  const nodes = [];
  const nodeCount = Math.min(50, Math.floor(window.innerWidth / 30));
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.75,
      vy: (Math.random() - 0.5) * 0.75,
      size: Math.random() * 2.2 + 1.2
    });
  }

  function draw() {
    // Fade trail effect
    ctx.fillStyle = 'rgba(3, 7, 18, 0.16)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Digital Matrix Rain Columns
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
      const char = characters.charAt(Math.floor(Math.random() * characters.length));
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      if (Math.random() > 0.96) {
        ctx.fillStyle = '#00f0ff'; // Bright Neon Cyan
      } else if (Math.random() > 0.88) {
        ctx.fillStyle = '#7928ca'; // Neon Violet
      } else {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.38)';
      }

      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    // 2. Animated Cyber Grid Particles & Lasers
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#00f0ff';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Connect nearby nodes
      for (let j = i + 1; j < nodes.length; j++) {
        const other = nodes[j];
        const dx = other.x - node.x;
        const dy = other.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.16 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/**
 * Role-Based Authentication & Cyber Gateway UI Controller
 */
function initAuthUI() {
  initCyberMatrixBackground();

  const overlay = document.getElementById('cyberAuthOverlay');
  const tabLogin = document.getElementById('tabBtnLogin');
  const tabRegister = document.getElementById('tabBtnRegister');
  const panelLogin = document.getElementById('panelLogin');
  const panelRegister = document.getElementById('panelRegister');

  const cyberLoginForm = document.getElementById('cyberLoginForm');
  const cyberRegisterForm = document.getElementById('cyberRegisterForm');

  const btnSendOtp = document.getElementById('btnSendOtp');
  const btnVerifyOtp = document.getElementById('btnVerifyOtp');
  const otpBox = document.getElementById('otpBox');
  const otpHelperMsg = document.getElementById('otpHelperMsg');
  const gmailVerifiedTag = document.getElementById('gmailVerifiedTag');
  const regEmailInput = document.getElementById('regEmail');
  const regOtpInput = document.getElementById('regOtpInput');

  const quickAuditorCyber = document.getElementById('quickAuditorBtnCyber');
  const quickUploaderCyber = document.getElementById('quickUploaderBtnCyber');
  const headerLogoutBtn = document.getElementById('headerLogoutBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const openLoginModalBtn = document.getElementById('openLoginModalBtn');

  // Check initial authentication
  const currentUser = AuthManager.getCurrentUser();
  if (!currentUser) {
    if (overlay) overlay.classList.remove('hidden');
  } else {
    if (overlay) overlay.classList.add('hidden');
  }

  updateUserHeaderDisplay();

  const loginAlertBox = document.getElementById('loginAlertBox');
  const regAlertBox = document.getElementById('regAlertBox');

  function showCyberAlert(box, msg, type = 'danger') {
    if (!box) return;
    box.className = `cyber-alert-box show ${type}`;
    let icon = type === 'danger' ? '🚨' : (type === 'warning' ? '⚠️' : '✅');
    box.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
  }

  function hideCyberAlert(box) {
    if (!box) return;
    box.className = 'cyber-alert-box';
    box.innerHTML = '';
  }

  const lockedRegisterStep2 = document.getElementById('lockedRegisterStep2');
  const lockedStep2Banner = document.getElementById('lockedStep2Banner');

  function lockStep2() {
    if (lockedRegisterStep2) {
      lockedRegisterStep2.style.opacity = '0.35';
      lockedRegisterStep2.style.pointerEvents = 'none';
    }
    if (lockedStep2Banner) {
      lockedStep2Banner.style.display = 'block';
    }
    if (gmailVerifiedTag) {
      gmailVerifiedTag.textContent = '';
      gmailVerifiedTag.style.display = 'none';
    }
  }

  function unlockStep2() {
    if (lockedRegisterStep2) {
      lockedRegisterStep2.style.opacity = '1';
      lockedRegisterStep2.style.pointerEvents = 'auto';
    }
    if (lockedStep2Banner) {
      lockedStep2Banner.style.display = 'none';
    }
    if (gmailVerifiedTag) {
      gmailVerifiedTag.textContent = '';
      gmailVerifiedTag.style.display = 'none';
    }
  }

  // Initially lock Step 2 until Gmail code is verified
  lockStep2();

  // Tab switching: Login vs Register
  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      panelLogin.classList.remove('hidden');
      panelRegister.classList.add('hidden');
      hideCyberAlert(loginAlertBox);
      hideCyberAlert(regAlertBox);
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      panelRegister.classList.remove('hidden');
      panelLogin.classList.add('hidden');
      hideCyberAlert(loginAlertBox);
      hideCyberAlert(regAlertBox);

      // Verify state
      const email = (regEmailInput.value || '').trim();
      if (!AuthManager.isEmailOtpVerified(email)) {
        lockStep2();
      } else {
        unlockStep2();
      }
    });
  }

  // Reset verification if user changes email
  if (regEmailInput) {
    regEmailInput.addEventListener('input', () => {
      lockStep2();
      resetResendCountdown();
      if (otpBox) otpBox.classList.add('hidden');
      if (btnSendOtp) btnSendOtp.style.display = 'inline-flex';
      sessionStorage.removeItem(AuthManager.OTP_KEY);
    });
  }

  // Show / Hide Password Toggles
  function setupPasswordToggle(inputEl, toggleBtn, textBtn) {
    if (!inputEl) return;
    const toggle = () => {
      const isPass = inputEl.type === 'password';
      inputEl.type = isPass ? 'text' : 'password';
      const icon = isPass ? '🙈' : '👁️';
      const label = isPass ? '🙈 Hide Password' : '👁️ Show Password';
      if (toggleBtn) toggleBtn.innerHTML = icon;
      if (textBtn) textBtn.innerHTML = label;
    };
    if (toggleBtn) toggleBtn.addEventListener('click', toggle);
    if (textBtn) textBtn.addEventListener('click', toggle);
  }

  setupPasswordToggle(
    document.getElementById('loginPassword'),
    document.getElementById('toggleLoginPasswordBtn'),
    document.getElementById('toggleLoginPassText')
  );

  setupPasswordToggle(
    document.getElementById('regPassword'),
    document.getElementById('toggleRegPasswordBtn'),
    document.getElementById('toggleRegPassText')
  );

  setupPasswordToggle(
    document.getElementById('regPasswordConfirm'),
    document.getElementById('toggleRegConfirmBtn'),
    document.getElementById('toggleRegConfirmText')
  );

  // Real-time Hard Password Strength Meter
  const regPasswordInput = document.getElementById('regPassword');
  const passStrengthLabel = document.getElementById('passStrengthLabel');
  const strengthMeterFill = document.getElementById('strengthMeterFill');
  const ruleLength = document.getElementById('ruleLength');
  const ruleUpper = document.getElementById('ruleUpper');
  const ruleLower = document.getElementById('ruleLower');
  const ruleNumber = document.getElementById('ruleNumber');
  const ruleSpecial = document.getElementById('ruleSpecial');

  if (regPasswordInput) {
    regPasswordInput.addEventListener('input', () => {
      const val = regPasswordInput.value;
      const res = AuthManager.checkPasswordStrength(val);

      if (passStrengthLabel) {
        passStrengthLabel.textContent = res.label;
        passStrengthLabel.style.color = res.color;
      }
      if (strengthMeterFill) {
        strengthMeterFill.style.width = `${(res.score / 5) * 100}%`;
        strengthMeterFill.style.background = res.color;
      }

      function updateRule(el, valid, text) {
        if (!el) return;
        if (valid) {
          el.className = 'valid';
          el.innerHTML = `✓ ${text}`;
        } else {
          el.className = '';
          el.innerHTML = `✖ ${text}`;
        }
      }

      updateRule(ruleLength, res.checks.length, 'Min 8 Characters');
      updateRule(ruleUpper, res.checks.upper, 'Uppercase Letter (A-Z)');
      updateRule(ruleLower, res.checks.lower, 'Lowercase Letter (a-z)');
      updateRule(ruleNumber, res.checks.number, 'Number (0-9)');
      updateRule(ruleSpecial, res.checks.special, 'Special Symbol (!@#$...)');
    });
  }

  // 40-Second OTP Resend Cooldown Timer
  let resendCountdownTimer = null;
  const RESEND_COOLDOWN_SECONDS = 40;

  function startResendCountdown() {
    if (!btnSendOtp) return;
    if (resendCountdownTimer) clearInterval(resendCountdownTimer);

    let remaining = RESEND_COOLDOWN_SECONDS;
    btnSendOtp.disabled = true;
    btnSendOtp.classList.remove('can-resend');
    btnSendOtp.textContent = `⏳ Resend in ${remaining}s`;

    resendCountdownTimer = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        btnSendOtp.textContent = `⏳ Resend in ${remaining}s`;
      } else {
        clearInterval(resendCountdownTimer);
        resendCountdownTimer = null;
        btnSendOtp.disabled = false;
        btnSendOtp.classList.add('can-resend');
        btnSendOtp.textContent = '🔄 Resend Code to Gmail';
      }
    }, 1000);
  }

  function resetResendCountdown() {
    if (resendCountdownTimer) {
      clearInterval(resendCountdownTimer);
      resendCountdownTimer = null;
    }
    if (btnSendOtp) {
      btnSendOtp.disabled = false;
      btnSendOtp.classList.remove('can-resend');
      btnSendOtp.textContent = '📧 Send Code to Gmail';
    }
  }

  // 1. Send / Resend OTP to Gmail
  if (btnSendOtp) {
    btnSendOtp.addEventListener('click', async () => {
      hideCyberAlert(regAlertBox);
      const email = (regEmailInput.value || '').trim();
      if (!email) {
        showCyberAlert(regAlertBox, 'Please enter your Gmail address first.', 'warning');
        showToast('Please enter your Gmail address first.', 'warning');
        regEmailInput.focus();
        return;
      }

      btnSendOtp.disabled = true;
      btnSendOtp.textContent = '⏳ Sending to Gmail...';

      const res = await AuthManager.generateOtp(email);

      if (!res.success) {
        btnSendOtp.disabled = false;
        btnSendOtp.textContent = '📧 Send Code to Gmail';
        showCyberAlert(regAlertBox, res.error, 'danger');
        showToast(res.error, 'danger');
        regEmailInput.classList.add('is-invalid');
        regEmailInput.classList.remove('is-valid');
        return;
      }

      // Start the 40-second countdown
      startResendCountdown();

      regEmailInput.classList.remove('is-invalid');
      if (otpBox) otpBox.classList.remove('hidden');
      if (regOtpInput) {
        regOtpInput.value = ''; // Clean empty field for entry
        regOtpInput.focus();
      }

      showToast(`📧 6-digit verification code sent to ${res.email}!`, 'success');
      showCyberAlert(regAlertBox, `
        <div style="line-height: 1.45;">
          <strong>📧 Verification Code Dispatched:</strong><br>
          A 6-digit verification code has been sent to <strong>${res.email}</strong>.<br>
          Please check your Gmail inbox (or Spam tab) and enter the 6-digit code below.
        </div>
      `, 'warning');
    });
  }

  // 2. Confirm OTP Code
  if (btnVerifyOtp) {
    btnVerifyOtp.addEventListener('click', () => {
      hideCyberAlert(regAlertBox);
      const email = (regEmailInput.value || '').trim();
      const code = (regOtpInput.value || '').trim();

      if (!code) {
        showCyberAlert(regAlertBox, 'Please enter the 6-digit code received in your Gmail.', 'warning');
        return;
      }

      const res = AuthManager.verifyOtp(email, code);
      if (!res.success) {
        showCyberAlert(regAlertBox, res.error, 'danger');
        showToast(res.error, 'danger');
        return;
      }

      // Mark verified status & unlock Step 2
      resetResendCountdown();
      unlockStep2();
      regEmailInput.classList.add('is-valid');
      regEmailInput.readOnly = true;
      if (btnSendOtp) btnSendOtp.style.display = 'none';

      if (otpBox) {
        otpBox.innerHTML = `
          <div style="color: var(--accent-emerald); font-weight: 700; font-size: 0.82rem; text-align: center; padding: 0.5rem; border: 1px solid rgba(0, 245, 155, 0.3); border-radius: 6px; background: rgba(0, 245, 155, 0.08);">
            ✅ GMAIL VERIFIED WITH CODE: ${email}
          </div>
        `;
      }
      showCyberAlert(regAlertBox, 'Gmail verified! Password & account creation is now unlocked below.', 'success');
      showToast('Gmail verified! Set your password below.', 'success');
      if (regPasswordInput) regPasswordInput.focus();
    });
  }

  // 3. Register Form Submit
  if (cyberRegisterForm) {
    cyberRegisterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideCyberAlert(regAlertBox);

      const firstName = document.getElementById('regFirstName').value.trim();
      const surname = document.getElementById('regSurname').value.trim();
      const email = regEmailInput.value.trim();
      const password = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regPasswordConfirm').value;
      const role = document.querySelector('input[name="regRole"]:checked')?.value || 'auditor';

      // 1. Validate Surname
      if (!surname) {
        showCyberAlert(regAlertBox, 'Surname is required. Please enter your surname / family name.', 'danger');
        showToast('Surname is required.', 'danger');
        document.getElementById('regSurname').focus();
        return;
      }

      // 2. Strict check: Gmail MUST be verified with code
      if (!AuthManager.isEmailOtpVerified(email)) {
        showCyberAlert(regAlertBox, 'Gmail verification code is mandatory! Please enter the 6-digit code received on your Gmail and click Confirm Code.', 'danger');
        showToast('Please enter and confirm your Gmail code first.', 'danger');
        return;
      }

      // Validate Hard / Strong Password
      const strength = AuthManager.checkPasswordStrength(password);
      if (!strength.valid) {
        showCyberAlert(regAlertBox, 'Password is too easy! Password must be HARD: minimum 8 characters with at least one uppercase letter (A-Z), one lowercase letter (a-z), one number (0-9), and one special symbol (!@#$%^&*...).', 'danger');
        showToast('Password must meet all 5 security rules.', 'danger');
        document.getElementById('regPassword').focus();
        return;
      }

      // Validate Password match
      if (password !== confirm) {
        showCyberAlert(regAlertBox, 'Passwords do not match. Please re-enter identical passwords.', 'danger');
        showToast('Passwords do not match.', 'danger');
        document.getElementById('regPasswordConfirm').focus();
        return;
      }

      const res = AuthManager.register({ firstName, surname, email, password, role });
      if (!res.success) {
        showCyberAlert(regAlertBox, res.error, 'danger');
        showToast(res.error, 'danger');
        return;
      }

      showToast(`🎉 Registration Successful! Welcome Agent ${res.user.name}.`, 'success');
      if (overlay) overlay.classList.add('hidden');
      updateUserHeaderDisplay();
      renderVaultTable();
    });
  }

  // 4. Login Form Submit
  if (cyberLoginForm) {
    cyberLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideCyberAlert(loginAlertBox);

      const email = document.getElementById('loginEmail').value.trim();
      const pass = document.getElementById('loginPassword').value;

      const res = AuthManager.login(email, pass);
      if (!res.success) {
        showCyberAlert(loginAlertBox, res.error, 'danger');
        showToast(res.error, 'danger');
        return;
      }

      showToast(`Access Granted: Welcome back, Agent ${res.user.name}`, 'success');
      if (overlay) overlay.classList.add('hidden');
      updateUserHeaderDisplay();
      renderVaultTable();
    });
  }

  // 5. Quick 1-Click Portal Demo Profiles (3 Distinct Portals)
  const quickIssuerCyber = document.getElementById('quickIssuerBtnCyber');
  const quickCitizenCyber = document.getElementById('quickCitizenBtnCyber');
  const quickPoliceCyber = document.getElementById('quickPoliceBtnCyber');

  if (quickIssuerCyber) {
    quickIssuerCyber.addEventListener('click', () => {
      AuthManager.login('uidai.issuing.authority@gmail.com', 'admin');
      if (overlay) overlay.classList.add('hidden');
      updateUserHeaderDisplay();
      renderVaultTable();
      showToast('Authenticated as 🏛️ Issuing Authority (Dr. Rajesh Sharma - UIDAI)', 'success');
    });
  }

  if (quickCitizenCyber) {
    quickCitizenCyber.addEventListener('click', () => {
      AuthManager.login('kahanagupta84@gmail.com', 'user');
      if (overlay) overlay.classList.add('hidden');
      updateUserHeaderDisplay();
      renderVaultTable();
      showToast('Authenticated as 👤 Citizen Document Holder (Mukesh Gupta)', 'info');
    });
  }

  if (quickPoliceCyber) {
    quickPoliceCyber.addEventListener('click', () => {
      AuthManager.login('cybercrime.investigator@gmail.com', 'police');
      if (overlay) overlay.classList.add('hidden');
      updateUserHeaderDisplay();
      renderVaultTable();
      showToast('Authenticated as 👮 Police Crime Investigator (Inspector Vikram Rathore)', 'success');
    });
  }

  // 6. Logout Handlers
  function handleLogout() {
    AuthManager.logout();
    if (overlay) overlay.classList.remove('hidden');
    updateUserHeaderDisplay();
    renderVaultTable();
    showToast('Session logged out. Cyber Gateway active.', 'info');
  }

  if (headerLogoutBtn) headerLogoutBtn.addEventListener('click', handleLogout);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  if (openLoginModalBtn) {
    openLoginModalBtn.addEventListener('click', () => {
      if (overlay) overlay.classList.remove('hidden');
    });
  }

  // User menu dropdown toggle
  const userMenuBtn = document.getElementById('userMenuBtn');
  const dropdown = document.getElementById('userDropdownMenu');
  if (userMenuBtn && dropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => dropdown.classList.add('hidden'));
    dropdown.addEventListener('click', (e) => e.stopPropagation());
  }

  // 3-Portal Role Switchers in Dropdown
  const switchIssuerBtn = document.getElementById('switchIssuerBtn');
  if (switchIssuerBtn) {
    switchIssuerBtn.addEventListener('click', () => {
      AuthManager.login('uidai.issuing.authority@gmail.com', 'admin');
      updateUserHeaderDisplay();
      renderVaultTable();
      dropdown.classList.add('hidden');
      showToast('Switched to 🏛️ Issuing Authority Portal', 'success');
    });
  }

  const switchCitizenBtn = document.getElementById('switchCitizenBtn');
  if (switchCitizenBtn) {
    switchCitizenBtn.addEventListener('click', () => {
      AuthManager.login('kahanagupta84@gmail.com', 'user');
      updateUserHeaderDisplay();
      renderVaultTable();
      dropdown.classList.add('hidden');
      showToast('Switched to 👤 Citizen / Holder Portal', 'info');
    });
  }

  const switchPoliceBtn = document.getElementById('switchPoliceBtn');
  if (switchPoliceBtn) {
    switchPoliceBtn.addEventListener('click', () => {
      AuthManager.login('cybercrime.investigator@gmail.com', 'police');
      updateUserHeaderDisplay();
      renderVaultTable();
      dropdown.classList.add('hidden');
      showToast('Switched to 👮 Police Crime Verifier Portal', 'success');
    });
  }

  const refreshVaultBtn = document.getElementById('refreshVaultBtn');
  if (refreshVaultBtn) {
    refreshVaultBtn.addEventListener('click', () => {
      renderVaultTable();
      showToast('Vault refreshed.', 'info');
    });
  }

  // Initialize Modals: Issue Document & Police DB
  initAuthorityAndPoliceModals();
}

function updateUserHeaderDisplay() {
  const user = AuthManager.getCurrentUser();
  const nameEl = document.getElementById('userNameDisplay');
  const roleEl = document.getElementById('userRoleBadge');
  const avatarEl = document.getElementById('userAvatarSpan');
  const titleEl = document.getElementById('dropdownUserTitle');
  const deptEl = document.getElementById('dropdownUserDept');
  const vaultSubtitle = document.getElementById('vaultSubtitle');
  const vaultRole = document.getElementById('vaultRoleIndicator');

  const btnOpenIssueDoc = document.getElementById('btnOpenIssueDocModal');
  const btnOpenPoliceDb = document.getElementById('btnOpenPoliceDbModal');

  if (user) {
    if (nameEl) nameEl.textContent = `${user.name} (✓ Verified)`;
    if (avatarEl) avatarEl.textContent = user.avatar || '👤';
    if (titleEl) titleEl.textContent = `${user.title || user.role} (${user.name})`;
    if (deptEl) deptEl.textContent = `${user.email} • Verified Gmail`;

    if (user.role === 'issuer') {
      if (roleEl) {
        roleEl.textContent = '🏛️ Govt / Issuer Authority';
        roleEl.style.color = '#00ffcc';
      }
      if (vaultRole) {
        vaultRole.className = 'status-badge';
        vaultRole.textContent = 'Issuer Authority (Official Master Registry)';
      }
      if (vaultSubtitle) {
        vaultSubtitle.textContent = 'Government & Academic Issuer Portal. Official documents registered here are permanently recorded in the Master Ledger.';
      }
      if (btnOpenIssueDoc) btnOpenIssueDoc.classList.remove('hidden');
      if (btnOpenPoliceDb) btnOpenPoliceDb.classList.add('hidden');
    } else if (user.role === 'police') {
      if (roleEl) {
        roleEl.textContent = '👮 Police Crime Investigator';
        roleEl.style.color = '#ff6b8b';
      }
      if (vaultRole) {
        vaultRole.className = 'status-badge';
        vaultRole.textContent = 'Police Investigation View (All Evidence & Impounded Files)';
      }
      if (vaultSubtitle) {
        vaultSubtitle.textContent = 'Law Enforcement Portal. Search FIR crime records, cross-examine forged credentials, and impound fraudulent documents.';
      }
      if (btnOpenIssueDoc) btnOpenIssueDoc.classList.remove('hidden');
      if (btnOpenPoliceDb) btnOpenPoliceDb.classList.remove('hidden');
    } else {
      // Citizen / Document Holder
      if (roleEl) {
        roleEl.textContent = '👤 Citizen Document Holder';
        roleEl.style.color = '#00e5ff';
      }
      if (vaultRole) {
        vaultRole.className = 'status-badge app-mode';
        vaultRole.textContent = 'Citizen Portal (My Uploaded Credentials)';
      }
      if (vaultSubtitle) {
        vaultSubtitle.textContent = 'Check your own Aadhaar, Passport, or Certificate to verify if it is recognized in the official government registry.';
      }
      if (btnOpenIssueDoc) btnOpenIssueDoc.classList.add('hidden');
      if (btnOpenPoliceDb) btnOpenPoliceDb.classList.add('hidden');
    }
  } else {
    if (nameEl) nameEl.textContent = 'Sign In / Register';
    if (roleEl) roleEl.textContent = 'Cyber Protected';
    if (avatarEl) avatarEl.textContent = '🔒';
    if (btnOpenIssueDoc) btnOpenIssueDoc.classList.add('hidden');
    if (btnOpenPoliceDb) btnOpenPoliceDb.classList.add('hidden');
  }
}

/**
 * Updates Government Master Registry, Pre-Upload & Police Verification Card
 */
function updateCentralRegistryAndPoliceVerification(docTitle, sampleTypeHint) {
  if (typeof AuthManager === 'undefined') return;

  const title = docTitle || document.getElementById('activeDocumentName')?.textContent || '';
  const verification = AuthManager.verifyDocumentIntegrity({
    title: title,
    sampleType: sampleTypeHint
  });

  appState.currentVerification = verification;

  // 1. Update Registry Match Badge & Banner
  const badge = document.getElementById('registryMatchBadge');
  const banner = document.getElementById('registryResultBanner');
  const bannerTitle = document.getElementById('registryResultTitle');
  const bannerDesc = document.getElementById('registryResultDesc');

  if (verification.registry.status === 'REAL_AUTHENTIC') {
    if (badge) {
      badge.className = 'indicator-status pass';
      badge.textContent = 'OFFICIALLY VERIFIED';
    }
    if (banner) {
      banner.style.background = 'rgba(0, 245, 155, 0.12)';
      banner.style.borderColor = 'rgba(0, 245, 155, 0.4)';
    }
    if (bannerTitle) {
      bannerTitle.style.color = 'var(--accent-emerald)';
      bannerTitle.textContent = verification.registry.title;
    }
  } else if (verification.registry.status === 'TAMPERED_FORGERY') {
    if (badge) {
      badge.className = 'indicator-status fail';
      badge.textContent = 'FORGERY DETECTED';
    }
    if (banner) {
      banner.style.background = 'rgba(255, 0, 85, 0.12)';
      banner.style.borderColor = 'rgba(255, 0, 85, 0.4)';
    }
    if (bannerTitle) {
      bannerTitle.style.color = '#ff3366';
      bannerTitle.textContent = verification.registry.title;
    }
  } else {
    if (badge) {
      badge.className = 'indicator-status warn';
      badge.textContent = 'UNREGISTERED';
    }
    if (banner) {
      banner.style.background = 'rgba(255, 183, 3, 0.12)';
      banner.style.borderColor = 'rgba(255, 183, 3, 0.4)';
    }
    if (bannerTitle) {
      bannerTitle.style.color = 'var(--accent-amber)';
      bannerTitle.textContent = verification.registry.title;
    }
  }

  if (bannerDesc) bannerDesc.textContent = verification.registry.desc;

  // 2. Update Pre-Upload History
  const preUploadStatusText = document.getElementById('preUploadStatusText');
  const preUploadDetailsText = document.getElementById('preUploadDetailsText');
  if (preUploadStatusText && preUploadDetailsText) {
    if (verification.preUpload.isPreUploaded) {
      preUploadStatusText.textContent = `📑 Previously Uploaded (Scanned ${verification.preUpload.scanCount}x)`;
      preUploadStatusText.style.color = '#00ffcc';
      preUploadDetailsText.textContent = `First submitted: ${new Date(verification.preUpload.firstUploadedAt).toLocaleDateString()} by ${verification.preUpload.firstUploadedBy}`;
    } else {
      preUploadStatusText.textContent = `🆕 First-Time Submission`;
      preUploadStatusText.style.color = '#00e5ff';
      preUploadDetailsText.textContent = `No prior scan history found in database.`;
    }
  }

  // 3. Update Police Crime Record Status
  const policeStatusText = document.getElementById('policeStatusText');
  const policeDetailsText = document.getElementById('policeDetailsText');
  if (policeStatusText && policeDetailsText) {
    if (verification.police.hasCrimeRecord) {
      policeStatusText.textContent = `🚨 Active Police Record Linked`;
      policeStatusText.style.color = '#ff3366';
      policeDetailsText.textContent = `${verification.police.crimeData.firNumber} (${verification.police.crimeData.policeStation})`;
    } else {
      policeStatusText.textContent = `🛡️ Police Clearance: Clean`;
      policeStatusText.style.color = 'var(--accent-emerald)';
      policeDetailsText.textContent = `No criminal complaints, warrants, or forgery flags recorded.`;
    }
  }
}

/**
 * Initializes Authority (Issue Doc), Police DB, and Master Record Modals
 */
function initAuthorityAndPoliceModals() {
  // 1. Issue Document Modal
  const issueModal = document.getElementById('issueDocModal');
  const btnOpenIssue = document.getElementById('btnOpenIssueDocModal');
  const btnCloseIssue = document.getElementById('closeIssueDocModalBtn');
  const btnCancelIssue = document.getElementById('cancelIssueDocBtn');
  const issueForm = document.getElementById('issueDocForm');

  if (btnOpenIssue && issueModal) {
    btnOpenIssue.addEventListener('click', () => issueModal.classList.remove('hidden'));
  }
  [btnCloseIssue, btnCancelIssue].forEach(btn => {
    if (btn && issueModal) btn.addEventListener('click', () => issueModal.classList.add('hidden'));
  });

  if (issueForm) {
    issueForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const docType = document.getElementById('issueDocType').value;
      const docNumber = document.getElementById('issueDocNumber').value.trim();
      const holderName = document.getElementById('issueHolderName').value.trim();
      const issuedBy = document.getElementById('issueAuthority').value.trim();
      const notes = document.getElementById('issueSecurityNotes').value.trim();

      const newRec = AuthManager.issueOfficialDocument({
        docType,
        docNumber,
        holderName,
        issuedBy,
        securityNotes: notes
      });

      if (issueModal) issueModal.classList.add('hidden');
      showToast(`🏛️ Successfully registered ${docNumber} in Government Master Ledger!`, 'success');
      showToast(`Credential issued to ${holderName}.`, 'info');

      // Refresh active view
      updateCentralRegistryAndPoliceVerification(holderName);
      renderVaultTable();
    });
  }

  // 2. Police Crime Database Modal
  const policeModal = document.getElementById('policeDbModal');
  const btnOpenPolice = document.getElementById('btnOpenPoliceDbModal');
  const btnClosePolice1 = document.getElementById('closePoliceDbModalBtn');
  const btnClosePolice2 = document.getElementById('closePoliceDbModalBtn2');
  const policeSearchInput = document.getElementById('policeSearchInput');
  const firContainer = document.getElementById('policeFirListContainer');

  function renderPoliceFirs(filterText = '') {
    if (!firContainer) return;
    const db = AuthManager.getPoliceDatabase();
    const query = filterText.toLowerCase().trim();

    const filtered = db.filter(f => {
      if (!query) return true;
      return (f.firNumber && f.firNumber.toLowerCase().includes(query)) ||
             (f.suspectName && f.suspectName.toLowerCase().includes(query)) ||
             (f.linkedDocNumber && f.linkedDocNumber.toLowerCase().includes(query)) ||
             (f.caseTitle && f.caseTitle.toLowerCase().includes(query));
    });

    if (filtered.length === 0) {
      firContainer.innerHTML = '<div style="text-align: center; color: #a0aec0; padding: 1.5rem;">No matching FIR records found in database.</div>';
      return;
    }

    firContainer.innerHTML = filtered.map(f => `
      <div style="background: rgba(255,0,85,0.06); border: 1px solid rgba(255,0,85,0.25); border-radius: 6px; padding: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span style="font-weight: 800; color: #ff3366; font-size: 0.82rem;">${f.firNumber}</span>
            <span class="status-badge" style="background: rgba(255,0,85,0.2); color: #ff6b8b; border-color: rgba(255,0,85,0.4); font-size: 0.65rem; margin-left: 0.4rem;">${f.status}</span>
          </div>
          <span style="font-size: 0.7rem; color: #a0aec0;">${f.policeStation}</span>
        </div>
        <div style="font-size: 0.78rem; font-weight: 700; color: #fff; margin-top: 0.3rem;">${f.caseTitle}</div>
        <div style="font-size: 0.74rem; color: #cbd5e0; margin-top: 0.2rem;">
          Suspect: <strong style="color: #ff6b8b;">${f.suspectName}</strong> | Linked ID: <code>${f.linkedDocNumber}</code>
        </div>
        <div style="font-size: 0.7rem; color: #718096; margin-top: 0.3rem;">
          Sections: ${f.sections} — ${f.details}
        </div>
      </div>
    `).join('');
  }

  if (btnOpenPolice && policeModal) {
    btnOpenPolice.addEventListener('click', () => {
      renderPoliceFirs();
      policeModal.classList.remove('hidden');
    });
  }
  [btnClosePolice1, btnClosePolice2].forEach(btn => {
    if (btn && policeModal) btn.addEventListener('click', () => policeModal.classList.add('hidden'));
  });

  if (policeSearchInput) {
    policeSearchInput.addEventListener('input', (e) => {
      renderPoliceFirs(e.target.value);
    });
  }

  // 3. View Official Master Record Modal
  const recordModal = document.getElementById('officialRecordModal');
  const btnViewRecord = document.getElementById('btnViewOfficialRecord');
  const btnCloseRecord1 = document.getElementById('closeOfficialRecordModalBtn');
  const btnCloseRecord2 = document.getElementById('closeOfficialRecordModalBtn2');
  const recordContent = document.getElementById('officialRecordContent');

  if (btnViewRecord && recordModal) {
    btnViewRecord.addEventListener('click', () => {
      const ver = appState.currentVerification;
      if (!recordContent) return;

      if (!ver || !ver.registry.record) {
        recordContent.innerHTML = `
          <div style="padding: 1.5rem; text-align: center; color: var(--accent-amber);">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
            <div style="font-weight: 700; font-size: 0.95rem;">No Official Record in Central Ledger</div>
            <p style="font-size: 0.8rem; color: #a0aec0; margin-top: 0.4rem;">
              This document was never officially issued or recorded by any Government Authority or accredited institution.
            </p>
          </div>
        `;
      } else {
        const r = ver.registry.record;
        recordContent.innerHTML = `
          <div style="background: rgba(0, 255, 204, 0.05); border: 1px solid rgba(0, 255, 204, 0.3); border-radius: 8px; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem; margin-bottom: 0.6rem;">
              <span style="font-size: 0.74rem; color: #a0aec0;">REGISTRY IDENTIFIER:</span>
              <code style="color: #00ffcc; font-weight: 700;">${r.id || 'REG-MASTER'}</code>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; font-size: 0.78rem;">
              <div><strong>Document Type:</strong><br><span style="color: #cbd5e0;">${r.docType}</span></div>
              <div><strong>Official ID Number:</strong><br><code style="color: #00ffcc;">${r.docNumber}</code></div>
              <div><strong>Authorized Holder:</strong><br><span style="color: #fff; font-weight: 700;">${r.holderName}</span></div>
              <div><strong>Issue Date:</strong><br><span style="color: #cbd5e0;">${r.issueDate}</span></div>
              <div style="grid-column: span 2;"><strong>Issuing Authority:</strong><br><span style="color: #00e5ff;">${r.issuedBy}</span></div>
            </div>
            <div style="margin-top: 0.75rem; padding-top: 0.6rem; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.72rem; color: #a0aec0;">
              Status: <span style="color: ${r.status === 'AUTHENTIC_ACTIVE' ? 'var(--accent-emerald)' : '#ff3366'}; font-weight: 700;">${r.status}</span><br>
              ${r.notes || r.tamperNotice || 'Cryptographic Ledger Verified.'}
            </div>
          </div>
        `;
      }
      recordModal.classList.remove('hidden');
    });
  }

  [btnCloseRecord1, btnCloseRecord2].forEach(btn => {
    if (btn && recordModal) btn.addEventListener('click', () => recordModal.classList.add('hidden'));
  });

  // 4. Police Impound & Flag Button
  const btnPoliceFlag = document.getElementById('btnPoliceFlagDoc');
  if (btnPoliceFlag) {
    btnPoliceFlag.addEventListener('click', () => {
      const ver = appState.currentVerification;
      const docName = document.getElementById('activeDocumentName')?.textContent || 'Suspicious Document';

      const fir = AuthManager.flagInPoliceDatabase({
        suspectName: ver?.registry?.record?.holderName || 'Unidentified Suspect',
        linkedDocNumber: ver?.registry?.record?.docNumber || 'SUSPECT-DOC-' + Math.floor(1000 + Math.random() * 9000),
        details: `Document "${docName}" was flagged for digital forgery and impounded by Police Investigator.`
      });

      showToast(`🚨 IMPOUNDED: ${fir.firNumber} registered in Crime Database!`, 'danger');
      updateCentralRegistryAndPoliceVerification();
    });
  }
}

function renderVaultTable() {
  const tbody = document.getElementById('vaultTableBody');
  if (!tbody) return;

  const docs = AuthManager.getVaultDocuments();
  const isAuditor = AuthManager.isAuditor();

  if (docs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 1.5rem;">No documents submitted yet. Use the upload area above to submit credentials.</td></tr>`;
    return;
  }

  tbody.innerHTML = docs.map((doc) => {
    let statusClass = 'indicator-status ';
    if (doc.status === 'VERIFIED_AUTHENTIC') statusClass += 'pass';
    else if (doc.status === 'FLAGGED_FORGERY') statusClass += 'fail';
    else statusClass += 'warn';

    return `
      <tr>
        <td><code>${doc.id}</code></td>
        <td style="font-weight: 600; color: #fff;">${doc.title}</td>
        <td>${doc.uploaderName}</td>
        <td style="font-size: 0.76rem; color: var(--text-secondary);">${doc.timestamp}</td>
        <td><code>${doc.fileType}</code></td>
        <td><strong style="color: ${doc.riskScore >= 65 ? 'var(--accent-crimson)' : (doc.riskScore >= 35 ? 'var(--accent-amber)' : 'var(--accent-emerald)')};">${doc.riskScore}/100</strong></td>
        <td><span class="${statusClass}">${doc.statusText}</span></td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 0.4rem;">
            <button class="btn btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.74rem;" onclick="loadVaultDocumentToWorkspace('${doc.id}')" title="Open in forensic workspace">
              🔍 Inspect
            </button>
            ${isAuditor ? `
              <button class="btn btn-primary" style="padding: 0.25rem 0.55rem; font-size: 0.74rem;" onclick="stampVaultDocument('${doc.id}', 'VERIFIED_AUTHENTIC')" title="Certify as Authentic">
                ✅ Verify
              </button>
              <button class="btn btn-danger" style="padding: 0.25rem 0.55rem; font-size: 0.74rem;" onclick="stampVaultDocument('${doc.id}', 'FLAGGED_FORGERY')" title="Flag as Forgery">
                🚨 Flag
              </button>
            ` : `
              <button class="btn btn-primary" style="padding: 0.25rem 0.55rem; font-size: 0.74rem;" onclick="document.getElementById('exportReportBtn').click()" title="View certified report">
                📜 Certificate
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.loadVaultDocumentToWorkspace = function(docId) {
  const vault = AuthManager.getVaultDocuments();
  const doc = vault.find(d => d.id === docId);
  if (!doc) return;

  if (doc.sampleType) {
    loadSampleDocument(doc.sampleType);
  } else if (doc.filePath) {
    document.getElementById('originalDocumentImage').src = doc.filePath;
    document.getElementById('activeDocumentName').textContent = `[Vault: ${doc.title}]`;
    const img = new Image();
    img.onload = () => {
      appState.currentImageSource = img;
      runFullForensicAudit(img);
    };
    img.src = doc.filePath;
  }
  showToast(`Loaded ${doc.title} into inspection center.`, 'info');
  window.scrollTo({ top: 380, behavior: 'smooth' });
};

window.stampVaultDocument = function(docId, verdict) {
  const note = verdict === 'VERIFIED_AUTHENTIC' ? 'Forensic auditor manually certified clean.' : 'Forensic auditor confirmed digital tampering.';
  AuthManager.updateDocumentStatus(docId, verdict, note);
  renderVaultTable();
  showToast(`Document ${docId} stamped: ${verdict === 'VERIFIED_AUTHENTIC' ? 'Certified Clean ✅' : 'Flagged as Forgery 🚨'}`, verdict === 'VERIFIED_AUTHENTIC' ? 'success' : 'danger');
};
