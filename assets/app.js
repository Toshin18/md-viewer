/**
 * md viewer - Comprehensive Markdown Viewer & Interactive Architecture Studio
 */

// Application State
const state = {
  rawContent: '',
  filePath: '',
  fileDir: '',
  fileName: 'Untitled.md',
  currentView: 'preview', // 'preview' | 'code' | 'split' | 'arch'
  theme: 'dark',
  zoomLevel: 1.0,
  headings: [],
  searchResults: [],
  currentSearchIndex: -1,
  splitSyncing: false,
  activeDiagramIndex: -1
};

// Architecture Studio State & History
const archState = {
  nodes: [
    { id: 'node_1', label: 'Client / UI', type: 'oval', color: '#f85149', x: 80, y: 160, width: 140, height: 60 },
    { id: 'node_2', label: 'API Gateway', type: 'rectangle', color: '#2f81f7', x: 320, y: 160, width: 150, height: 60 },
    { id: 'node_3', label: 'Auth Check', type: 'circle', color: '#a371f7', x: 560, y: 70, width: 96, height: 96 },
    { id: 'node_4', label: 'Database Storage', type: 'database', color: '#3fb950', x: 560, y: 240, width: 160, height: 60 }
  ],
  edges: [
    { id: 'edge_1', from: 'node_1', to: 'node_2', fromPort: 'right', toPort: 'left', direction: 'bi', style: 'solid', color: '#58a6ff', label: 'HTTPS' },
    { id: 'edge_2', from: 'node_2', to: 'node_3', fromPort: 'right', toPort: 'left', direction: 'uni', style: 'solid', color: '#a371f7', label: 'verify' },
    { id: 'edge_3', from: 'node_2', to: 'node_4', fromPort: 'right', toPort: 'left', direction: 'uni', style: 'dashed', color: '#3fb950', label: 'SQL / Pool' }
  ],
  clusters: [
    { id: 'cluster_1', label: 'Backend Services', x: 280, y: 30, width: 460, height: 300 }
  ],
  zoom: 1.0,
  panX: 40,
  panY: 40,
  selectedNodeId: null,
  selectedEdgeId: null,
  selectedClusterId: null,
  isConnecting: false,
  connectStart: null,
  isInitialized: false,
  contextMenuTarget: null
};

const archHistory = {
  past: [],
  future: []
};

// Architecture Studio Clipboard
const archClipboard = {
  item: null,
  pasteCount: 0
};

// SVGs
const ICONS = {
  copy: `<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>`,
  check: `<svg viewBox="0 0 16 16" width="14" height="14" fill="#3fb950"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg>`,
  anchor: `<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0 2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path></svg>`,
  alertNote: `<svg viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`,
  alertTip: `<svg viewBox="0 0 16 16"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.098-.117-.202-.238-.309-.364C3.125 7.64 2.5 6.64 2.5 5.25 2.5 2.22 4.887 0 8 0s5.5 2.22 5.5 5.25c0 1.39-.625 2.39-1.272 3.206-.107.126-.211.247-.309.364-.173.206-.356.425-.542.68-.207.3-.33.565-.37.847a.75.75 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5Zm1 3h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1 0-1.5Z"></path></svg>`,
  alertImportant: `<svg viewBox="0 0 16 16"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h3a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h5.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm6.478 2.78v3.107a.75.75 0 0 1-1.5 0V4.28a.75.75 0 0 1 1.5 0ZM8 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`,
  alertWarning: `<svg viewBox="0 0 16 16"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>`,
  alertCaution: `<svg viewBox="0 0 16 16"><path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`
};

// Initialize Mermaid
if (window.mermaid) {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
  });
}

// IPC Helper to Python backend
function postToPython(action, payload = {}) {
  const msg = JSON.stringify({ action, ...payload });
  if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.appBridge) {
    window.webkit.messageHandlers.appBridge.postMessage(msg);
  } else {
    console.log('[AppBridge -> Python]', action, payload);
  }
}

// Save active document to disk
function saveCurrentFile() {
  postToPython('saveFile', {
    content: state.rawContent,
    path: state.filePath
  });
}

// Toast notification
function showToast(message, duration = 2400) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `${ICONS.check} <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-fade');
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// Set Theme
function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('mdviewer_theme', theme);

  if (window.mermaid) {
    const mermaidTheme = theme === 'light' ? 'default' : 'dark';
    mermaid.initialize({ theme: mermaidTheme });
  }

  document.querySelectorAll('.theme-option').forEach(el => {
    el.classList.toggle('active', el.dataset.theme === theme);
  });
}

// Document Zoom Controls
function applyDocZoom(delta) {
  state.zoomLevel = Math.min(2.0, Math.max(0.6, state.zoomLevel + delta));
  const zoomResetBtn = document.getElementById('btn-zoom-reset');
  if (zoomResetBtn) {
    zoomResetBtn.textContent = `${Math.round(state.zoomLevel * 100)}%`;
  }
  document.body.style.zoom = state.zoomLevel;
}

function resetDocZoom() {
  state.zoomLevel = 1.0;
  const zoomResetBtn = document.getElementById('btn-zoom-reset');
  if (zoomResetBtn) {
    zoomResetBtn.textContent = '100%';
  }
  document.body.style.zoom = 1.0;
}

// ========================================================
// Diagram Block Detection & Bi-Directional Synchronization
// ========================================================

function findMermaidDiagrams(markdown) {
  if (!markdown) return [];
  const regex = /```mermaid\s*([\s\S]*?)```/g;
  const list = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    list.push({
      index: list.length,
      fullMatch: match[0],
      code: match[1].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }
  return list;
}

function updateDiagramSelector() {
  const select = document.getElementById('arch-diagram-select');
  const badge = document.getElementById('arch-session-badge');
  const label = document.getElementById('arch-session-label');
  if (!select) return;

  const diagrams = findMermaidDiagrams(state.rawContent);
  select.innerHTML = '';

  if (diagrams.length === 0) {
    const opt = document.createElement('option');
    opt.value = "-1";
    opt.textContent = "New Blank Diagram";
    select.appendChild(opt);
    if (badge) badge.textContent = "New Diagram";
    if (label) label.textContent = "Create visual blocks";
    state.activeDiagramIndex = -1;
    return;
  }

  diagrams.forEach((d, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    const lines = d.code.split('\n').filter(l => l.trim() && !l.trim().startsWith('graph') && !l.trim().startsWith('flowchart'));
    opt.textContent = `Diagram #${idx + 1} (${lines.length} items)`;
    select.appendChild(opt);
  });

  const optNew = document.createElement('option');
  optNew.value = "-1";
  optNew.textContent = "+ Create New Diagram";
  select.appendChild(optNew);

  if (state.activeDiagramIndex >= 0 && state.activeDiagramIndex < diagrams.length) {
    select.value = state.activeDiagramIndex;
    if (badge) badge.textContent = `Diagram #${state.activeDiagramIndex + 1}`;
    if (label) label.textContent = "Editing from document";
  } else {
    select.value = "-1";
    if (badge) badge.textContent = "New Diagram";
    if (label) label.textContent = "Insert will append to doc";
  }
}

function openDiagramInStudio(idx) {
  const diagrams = findMermaidDiagrams(state.rawContent);
  if (diagrams[idx]) {
    state.activeDiagramIndex = idx;
    loadMermaidIntoArch(diagrams[idx].code);
    updateDiagramSelector();
    switchView('arch');
    showToast(`Loaded Diagram #${idx + 1} into Architecture Studio!`);
  }
}

function updateDiagramInDoc() {
  const diagrams = findMermaidDiagrams(state.rawContent);
  const newCode = exportArchToMermaid();
  if (state.activeDiagramIndex >= 0 && state.activeDiagramIndex < diagrams.length) {
    const target = diagrams[state.activeDiagramIndex];
    const before = state.rawContent.substring(0, target.startIndex);
    const after = state.rawContent.substring(target.endIndex);
    state.rawContent = before + newCode + after;
    setContent(state.rawContent, state.filePath, true);
    saveCurrentFile();
    showToast(`Updated Diagram #${state.activeDiagramIndex + 1} in document and saved!`);
  } else {
    insertDiagramAsNew();
  }
}

function insertDiagramAsNew() {
  const newCode = exportArchToMermaid();
  const sep = state.rawContent.trim() ? '\n\n' : '';
  state.rawContent = state.rawContent.trim() + sep + '## Architecture Diagram\n\n' + newCode + '\n';
  const diagrams = findMermaidDiagrams(state.rawContent);
  state.activeDiagramIndex = diagrams.length - 1;
  setContent(state.rawContent, state.filePath, true);
  saveCurrentFile();
  updateDiagramSelector();
  showToast('Inserted new diagram into document and saved!');
}

// ========================================================
// Markdown Processing Engine
// ========================================================
function processMarkdown(markdown) {
  const mathBlocks = [];
  let processed = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    const placeholder = `@@MATH_BLOCK_${mathBlocks.length}@@`;
    mathBlocks.push({ type: 'block', formula: formula.trim() });
    return placeholder;
  });

  processed = processed.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (match, formula) => {
    const placeholder = `@@MATH_INLINE_${mathBlocks.length}@@`;
    mathBlocks.push({ type: 'inline', formula: formula.trim() });
    return placeholder;
  });

  marked.setOptions({
    gfm: true,
    breaks: false,
    headerIds: true,
    mangle: false
  });

  let html = marked.parse(processed);

  mathBlocks.forEach((item, index) => {
    const ph = item.type === 'block' ? `@@MATH_BLOCK_${index}@@` : `@@MATH_INLINE_${index}@@`;
    let rendered = '';
    try {
      if (window.katex) {
        rendered = katex.renderToString(item.formula, {
          displayMode: item.type === 'block',
          throwOnError: false
        });
      } else {
        rendered = `<code>${item.formula}</code>`;
      }
    } catch (e) {
      rendered = `<span class="katex-error">${item.formula}</span>`;
    }
    html = html.split(`<p>${ph}</p>`).join(rendered);
    html = html.split(ph).join(rendered);
  });

  const alertTypes = [
    { tag: 'NOTE', cls: 'markdown-alert-note', title: 'Note', icon: ICONS.alertNote },
    { tag: 'TIP', cls: 'markdown-alert-tip', title: 'Tip', icon: ICONS.alertTip },
    { tag: 'IMPORTANT', cls: 'markdown-alert-important', title: 'Important', icon: ICONS.alertImportant },
    { tag: 'WARNING', cls: 'markdown-alert-warning', title: 'Warning', icon: ICONS.alertWarning },
    { tag: 'CAUTION', cls: 'markdown-alert-caution', title: 'Caution', icon: ICONS.alertCaution }
  ];

  alertTypes.forEach(alert => {
    const regex = new RegExp(`<blockquote>\\s*<p>\\[!${alert.tag}\\]\\s*([\\s\\S]*?)<\\/blockquote>`, 'gi');
    html = html.replace(regex, (match, inner) => {
      return `<div class="markdown-alert ${alert.cls}">
        <div class="markdown-alert-title">${alert.icon} ${alert.title}</div>
        <p>${inner}
      </div>`;
    });
  });

  return html;
}

// Post-process DOM
function postProcessDOM(container) {
  state.headings = [];
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach((heading, idx) => {
    const level = parseInt(heading.tagName[1]);
    const text = heading.textContent.trim();
    let id = heading.id || text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
    if (!id) id = `heading-${idx}`;
    heading.id = id;

    if (!heading.querySelector('.anchor-link')) {
      const anchor = document.createElement('a');
      anchor.className = 'anchor-link';
      anchor.href = `#${id}`;
      anchor.innerHTML = ICONS.anchor;
      anchor.title = 'Direct link to this heading';
      heading.insertBefore(anchor, heading.firstChild);
    }

    state.headings.push({ id, text, level });
  });

  renderOutline();

  // Resolve local relative images relative to document folder
  if (state.fileDir) {
    container.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || '';
      if (src && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:') && !src.startsWith('file://')) {
        img.src = 'file://' + state.fileDir + '/' + src.replace(/^\.\//, '');
      }
    });
  }

  let mermaidCount = 0;
  const pres = container.querySelectorAll('pre');
  pres.forEach(pre => {
    if (pre.parentElement && pre.parentElement.classList.contains('code-block-wrapper')) return;

    const code = pre.querySelector('code');
    const fullText = code ? code.innerText : pre.innerText;

    let lang = '';
    if (code && code.className) {
      const match = code.className.match(/language-([a-zA-Z0-9_\-]+)/);
      if (match) lang = match[1];
    }

    // Mermaid Diagram Handling with Direct Edit in Studio & Pan-Zoom Controls
    if (lang === 'mermaid') {
      const currentDiagramIdx = mermaidCount++;
      const mermaidDiv = document.createElement('div');
      mermaidDiv.className = 'mermaid-wrapper';

      const toolbar = document.createElement('div');
      toolbar.className = 'mermaid-diagram-toolbar';
      toolbar.innerHTML = `
        <div class="mermaid-diagram-title">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
            <path d="M1.5 2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-3zm9 0a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-3zm-4.5 7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-3z"/>
          </svg>
          <span>Diagram #${currentDiagramIdx + 1}: Architecture</span>
        </div>
        <div class="mermaid-diagram-actions">
          <button class="mermaid-btn mermaid-zoom-out" title="Zoom Out">−</button>
          <span class="mermaid-btn mermaid-zoom-label" style="cursor: default;">100%</span>
          <button class="mermaid-btn mermaid-zoom-in" title="Zoom In">+</button>
          <button class="mermaid-btn mermaid-reset-view" title="Reset View">Reset</button>
          <button class="mermaid-btn mermaid-edit-btn" title="Edit this diagram in Architecture Studio">✏️ Edit in Studio</button>
        </div>
      `;

      const viewport = document.createElement('div');
      viewport.className = 'mermaid-viewport';

      const content = document.createElement('div');
      content.className = 'mermaid-content';

      const mPre = document.createElement('pre');
      mPre.className = 'mermaid';
      mPre.textContent = fullText;

      content.appendChild(mPre);
      viewport.appendChild(content);

      mermaidDiv.appendChild(toolbar);
      mermaidDiv.appendChild(viewport);

      // Pan & Zoom state for this diagram in Preview
      let dZoom = 1.0;
      let dPanX = 0, dPanY = 0;
      let isPanning = false;
      let startX = 0, startY = 0;

      const updateTransform = () => {
        content.style.transform = `translate(${dPanX}px, ${dPanY}px) scale(${dZoom})`;
        const lbl = toolbar.querySelector('.mermaid-zoom-label');
        if (lbl) lbl.textContent = `${Math.round(dZoom * 100)}%`;
      };

      toolbar.querySelector('.mermaid-zoom-in').addEventListener('click', () => {
        dZoom = Math.min(3.0, dZoom + 0.2);
        updateTransform();
      });

      toolbar.querySelector('.mermaid-zoom-out').addEventListener('click', () => {
        dZoom = Math.max(0.4, dZoom - 0.2);
        updateTransform();
      });

      toolbar.querySelector('.mermaid-reset-view').addEventListener('click', () => {
        dZoom = 1.0;
        dPanX = 0;
        dPanY = 0;
        updateTransform();
      });

      toolbar.querySelector('.mermaid-edit-btn').addEventListener('click', () => {
        openDiagramInStudio(currentDiagramIdx);
      });

      viewport.addEventListener('mousedown', (me) => {
        isPanning = true;
        viewport.classList.add('panning');
        startX = me.clientX - dPanX;
        startY = me.clientY - dPanY;
      });

      window.addEventListener('mousemove', (me) => {
        if (!isPanning) return;
        dPanX = me.clientX - startX;
        dPanY = me.clientY - startY;
        updateTransform();
      });

      window.addEventListener('mouseup', () => {
        if (isPanning) {
          isPanning = false;
          viewport.classList.remove('panning');
        }
      });

      viewport.addEventListener('wheel', (we) => {
        we.preventDefault();
        const factor = we.deltaY < 0 ? 1.1 : 0.9;
        dZoom = Math.min(3.0, Math.max(0.4, dZoom * factor));
        updateTransform();
      }, { passive: false });

      pre.replaceWith(mermaidDiv);
      return;
    }

    // Standard Code Block with syntax highlighting and copy
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';

    const header = document.createElement('div');
    header.className = 'code-block-header';
    header.innerHTML = `
      <span>${lang || 'text'}</span>
      <button class="copy-code-btn" title="Copy code">${ICONS.copy} <span>Copy</span></button>
    `;

    const copyBtn = header.querySelector('.copy-code-btn');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(fullText).then(() => {
        copyBtn.innerHTML = `${ICONS.check} <span>Copied!</span>`;
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.innerHTML = `${ICONS.copy} <span>Copy</span>`;
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);

    if (window.Prism && code) {
      Prism.highlightElement(code);
    }
  });

  if (window.mermaid) {
    try {
      mermaid.run({
        nodes: container.querySelectorAll('.mermaid')
      });
    } catch (e) {
      console.error('Mermaid render error:', e);
    }
  }

  // Interactive Task Lists: Toggle checkbox updates document and persists!
  const taskCheckboxes = container.querySelectorAll('li > input[type="checkbox"]');
  taskCheckboxes.forEach((cb, index) => {
    cb.classList.add('task-list-item-checkbox');
    cb.removeAttribute('disabled');
    cb.addEventListener('change', () => {
      let taskIdx = 0;
      state.rawContent = state.rawContent.replace(/\[([ xX])\]/g, (match) => {
        if (taskIdx++ === index) {
          return cb.checked ? '[x]' : '[ ]';
        }
        return match;
      });
      updateCodeEditors(state.rawContent);
      saveCurrentFile();
      showToast(cb.checked ? 'Task marked complete' : 'Task marked incomplete', 1200);
    });
  });

  setupTocObserver();
}

// Table of Contents
function renderOutline() {
  const tocContainer = document.getElementById('toc-list');
  const countEl = document.getElementById('outline-count');
  if (!tocContainer) return;

  if (countEl) countEl.textContent = state.headings.length;
  tocContainer.innerHTML = '';

  if (state.headings.length === 0) {
    tocContainer.innerHTML = '<li style="padding: 10px; color: var(--color-fg-muted); font-size: 12px;">No headings found in document.</li>';
    return;
  }

  state.headings.forEach(h => {
    const li = document.createElement('li');
    li.className = `toc-item toc-level-${h.level}`;
    const a = document.createElement('a');
    a.className = 'toc-link';
    a.href = `#${h.id}`;
    a.textContent = h.text;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(h.id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    li.appendChild(a);
    tocContainer.appendChild(li);
  });
}

let activeHeadingObserver = null;
function setupTocObserver() {
  if (activeHeadingObserver) activeHeadingObserver.disconnect();

  const callback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.querySelectorAll('.toc-link').forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  };

  activeHeadingObserver = new IntersectionObserver(callback, {
    rootMargin: '0px 0px -70% 0px',
    threshold: 0.1
  });

  document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3').forEach(el => {
    activeHeadingObserver.observe(el);
  });
}

// Code Editors Synchronization
function updateCodeEditors(text) {
  const lines = text.split('\n');
  const numbersHtml = lines.map((_, i) => `<div>${i + 1}</div>`).join('');

  const rawLines = document.getElementById('raw-line-numbers');
  const splitLines = document.getElementById('split-line-numbers');
  if (rawLines) rawLines.innerHTML = numbersHtml;
  if (splitLines) splitLines.innerHTML = numbersHtml;

  const rawEditor = document.getElementById('raw-code-editor');
  const splitEditor = document.getElementById('split-code-editor');
  if (rawEditor && rawEditor.value !== text) rawEditor.value = text;
  if (splitEditor && splitEditor.value !== text) splitEditor.value = text;
}

let editorDebounceTimer = null;
function handleEditorInput(val, sourceEditor) {
  state.rawContent = val;
  const lines = val.split('\n');
  const numbersHtml = lines.map((_, i) => `<div>${i + 1}</div>`).join('');

  const rawLines = document.getElementById('raw-line-numbers');
  const splitLines = document.getElementById('split-line-numbers');
  if (rawLines) rawLines.innerHTML = numbersHtml;
  if (splitLines) splitLines.innerHTML = numbersHtml;

  const other = (sourceEditor && sourceEditor.id === 'raw-code-editor')
    ? document.getElementById('split-code-editor')
    : document.getElementById('raw-code-editor');
  if (other && other.value !== val) other.value = val;

  clearTimeout(editorDebounceTimer);
  editorDebounceTimer = setTimeout(() => {
    const mdContainer = document.getElementById('markdown-preview');
    const splitMarkdown = document.getElementById('split-markdown');
    if (mdContainer) {
      mdContainer.innerHTML = processMarkdown(val);
      postProcessDOM(mdContainer);
    }
    if (splitMarkdown) {
      splitMarkdown.innerHTML = processMarkdown(val);
      postProcessDOM(splitMarkdown);
    }
    updateStats(val, state.filePath);
    updateDiagramSelector();
  }, 250);
}

function setupCodeEditors() {
  const rawEditor = document.getElementById('raw-code-editor');
  const splitEditor = document.getElementById('split-code-editor');

  const onInput = (e) => handleEditorInput(e.target.value, e.target);
  const onKeydown = function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;
      this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 2;
      handleEditorInput(this.value, this);
    }
  };

  const onScroll = function () {
    const lineNum = this.previousElementSibling;
    if (lineNum) lineNum.scrollTop = this.scrollTop;
  };

  if (rawEditor) {
    rawEditor.addEventListener('input', onInput);
    rawEditor.addEventListener('keydown', onKeydown);
    rawEditor.addEventListener('scroll', onScroll);
  }
  if (splitEditor) {
    splitEditor.addEventListener('input', onInput);
    splitEditor.addEventListener('keydown', onKeydown);
    splitEditor.addEventListener('scroll', onScroll);
  }
}

function updateStats(text, path) {
  const lines = text ? text.split('\n').length : 0;
  const words = text ? (text.trim().match(/\S+/g) || []).length : 0;
  const bytes = new Blob([text]).size;
  const sizeFormatted = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

  const linesEl = document.getElementById('stat-lines');
  const wordsEl = document.getElementById('stat-words');
  const sizeEl = document.getElementById('stat-size');

  if (linesEl) linesEl.textContent = `${lines} lines`;
  if (wordsEl) wordsEl.textContent = `${words} words`;
  if (sizeEl) sizeEl.textContent = sizeFormatted;

  updateBreadcrumbs(path || state.fileName);
}

function updateBreadcrumbs(path) {
  const container = document.getElementById('breadcrumb-container');
  if (!container) return;

  const fullPath = (path || state.filePath || state.fileName || 'Untitled.md').replace(/\\/g, '/');
  container.title = `File: ${fullPath}`;

  const parts = fullPath.split('/').filter(Boolean);
  if (parts.length === 0) {
    container.innerHTML = `<span class="breadcrumb-current">${state.fileName || 'Untitled.md'}</span>`;
    return;
  }

  const fileName = parts[parts.length - 1];
  const parentDir = parts.length > 1 ? parts[parts.length - 2] : '';

  let html = '';
  if (parts.length > 2) {
    html += `<span class="breadcrumb-root" title="${fullPath}">...</span><span class="breadcrumb-divider">/</span>`;
  }
  if (parentDir) {
    html += `<span class="breadcrumb-folder" title="${fullPath}">${parentDir}</span><span class="breadcrumb-divider">/</span>`;
  }
  html += `<span class="breadcrumb-current" title="${fullPath}">${fileName}</span>`;

  container.innerHTML = html;
}

// ========================================================
// YAML Frontmatter Metadata Parser & Renderer
// ========================================================
function parseFrontmatter(markdown) {
  if (!markdown) return { frontmatter: null, content: '' };
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { frontmatter: null, content: markdown };

  const yamlText = match[1];
  const data = {};
  const lines = yamlText.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      const key = trimmed.slice(0, colonIdx).trim();
      let val = trimmed.slice(colonIdx + 1).trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      } else {
        val = val.replace(/^["']|["']$/g, '');
      }
      data[key] = val;
    }
  }

  const cleanMarkdown = markdown.slice(match[0].length);
  return { frontmatter: data, content: cleanMarkdown };
}

function renderFrontmatter(data) {
  const container = document.getElementById('frontmatter-container');
  if (!container) return;
  if (!data || Object.keys(data).length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  container.style.display = 'block';
  let html = `
    <div class="frontmatter-header">
      <div class="frontmatter-badge-label">
        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor"><path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 15H2.75A1.75 1.75 0 0 1 1 13.25Zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25Z"/><path d="M4 4.5h8v1.5H4Zm0 3h8v1.5H4Zm0 3h5v1.5H4Z"/></svg>
        <span>Metadata / Frontmatter</span>
      </div>
    </div>
    <div class="frontmatter-grid">
  `;

  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) {
      const tags = v.map(tag => `<span class="frontmatter-tag">${tag}</span>`).join('');
      html += `<div class="frontmatter-field"><span class="frontmatter-key">${k}:</span> <span class="frontmatter-val">${tags}</span></div>`;
    } else {
      html += `<div class="frontmatter-field"><span class="frontmatter-key">${k}:</span> <span class="frontmatter-val">${v}</span></div>`;
    }
  }

  html += '</div>';
  container.innerHTML = html;
}

// ========================================================
// Recent Files Storage & Dropdown Manager
// ========================================================
const RECENT_STORAGE_KEY = 'mdviewer_recent_files';

function getRecentFiles() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function addRecentFile(path, name) {
  if (!path || path.startsWith('Welcome') || path === 'sample.md') return;
  const recent = getRecentFiles().filter(item => item.path !== path);
  recent.unshift({
    path,
    name: name || path.split(/[\/\\]/).pop(),
    timestamp: Date.now()
  });
  if (recent.length > 10) recent.length = 10;
  localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent));
  renderRecentFiles();
}

function clearRecentFiles() {
  localStorage.removeItem(RECENT_STORAGE_KEY);
  renderRecentFiles();
  showToast('Cleared recent files history');
}

function openRecentFile(path) {
  if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.appBridge) {
    postToPython('openFile', { path });
  } else {
    showToast(`Opening ${path}...`);
    fetch(path)
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(text => setContent(text, path))
      .catch(() => showToast(`Could not open ${path}`));
  }
}

function renderRecentFiles() {
  const list = document.getElementById('recent-files-list');
  if (!list) return;
  const recent = getRecentFiles();
  if (recent.length === 0) {
    list.innerHTML = '<div class="recent-empty">No recent files</div>';
    return;
  }

  list.innerHTML = recent.map(item => `
    <div class="recent-item" data-path="${item.path}">
      <span class="recent-name">${item.name}</span>
      <span class="recent-path" title="${item.path}">${item.path}</span>
    </div>
  `).join('') + '<button class="recent-clear-btn" id="btn-clear-recent">Clear History</button>';

  list.querySelectorAll('.recent-item').forEach(el => {
    el.addEventListener('click', () => {
      const p = el.getAttribute('data-path');
      openRecentFile(p);
      const dropdown = document.getElementById('recent-dropdown');
      if (dropdown) dropdown.classList.remove('open');
    });
  });

  const clearBtn = list.querySelector('#btn-clear-recent');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearRecentFiles();
    });
  }
}

function setContent(markdown, path = '', retainScroll = false) {
  hideWelcomeScreen();
  state.rawContent = markdown;
  if (path) {
    state.filePath = path;
    state.fileName = path.split(/[\/\\]/).pop() || 'Untitled.md';
    document.title = `md viewer - ${state.fileName}`;
    addRecentFile(path, state.fileName);
  }

  const { frontmatter, content: cleanMarkdown } = parseFrontmatter(markdown);
  renderFrontmatter(frontmatter);

  const previewPane = document.getElementById('pane-preview');
  const rawPane = document.getElementById('pane-code');
  const splitLeft = document.getElementById('split-left');
  const splitRight = document.getElementById('split-right');

  const prevScroll = {
    preview: previewPane ? previewPane.scrollTop : 0,
    raw: rawPane ? rawPane.scrollTop : 0,
    splitLeft: splitLeft ? splitLeft.scrollTop : 0,
    splitRight: splitRight ? splitRight.scrollTop : 0
  };

  const mdContainer = document.getElementById('markdown-preview');
  if (mdContainer) {
    mdContainer.innerHTML = processMarkdown(cleanMarkdown);
    postProcessDOM(mdContainer);
  }

  const splitMarkdown = document.getElementById('split-markdown');
  if (splitMarkdown) {
    splitMarkdown.innerHTML = processMarkdown(cleanMarkdown);
    postProcessDOM(splitMarkdown);
  }

  updateCodeEditors(markdown);
  updateStats(markdown, path);
  updateDiagramSelector();

  if (retainScroll) {
    if (previewPane) previewPane.scrollTop = prevScroll.preview;
    if (rawPane) rawPane.scrollTop = prevScroll.raw;
    if (splitLeft) splitLeft.scrollTop = prevScroll.splitLeft;
    if (splitRight) splitRight.scrollTop = prevScroll.splitRight;
  }
}

// Switch View Modes
function switchView(view) {
  state.currentView = view;

  const btnPreview = document.getElementById('btn-view-preview');
  const btnCode = document.getElementById('btn-view-code');
  const btnSplit = document.getElementById('btn-view-split');
  const btnArch = document.getElementById('btn-view-arch');

  const panePreview = document.getElementById('pane-preview');
  const paneCode = document.getElementById('pane-code');
  const paneSplit = document.getElementById('pane-split');
  const paneArch = document.getElementById('pane-architecture');

  [btnPreview, btnCode, btnSplit, btnArch].forEach(b => b && b.classList.remove('active'));
  [panePreview, paneCode, paneSplit, paneArch].forEach(p => p && (p.style.display = 'none'));

  if (view === 'preview') {
    if (btnPreview) btnPreview.classList.add('active');
    if (panePreview) panePreview.style.display = 'block';
  } else if (view === 'code') {
    if (btnCode) btnCode.classList.add('active');
    if (paneCode) paneCode.style.display = 'block';
  } else if (view === 'split') {
    if (btnSplit) btnSplit.classList.add('active');
    if (paneSplit) paneSplit.style.display = 'flex';
  } else if (view === 'arch') {
    if (btnArch) btnArch.classList.add('active');
    if (paneArch) {
      paneArch.style.display = 'flex';
      initArchStudio();
    }
  }
}

function setupSplitScrollSync() {
  const editor = document.getElementById('split-code-editor');
  const right = document.getElementById('split-right');
  if (!editor || !right) return;

  editor.addEventListener('scroll', () => {
    if (state.splitSyncing) return;
    state.splitSyncing = true;
    const ratio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
    right.scrollTop = ratio * (right.scrollHeight - right.clientHeight);
    setTimeout(() => { state.splitSyncing = false; }, 50);
  });

  right.addEventListener('scroll', () => {
    if (state.splitSyncing) return;
    state.splitSyncing = true;
    const ratio = right.scrollTop / (right.scrollHeight - right.clientHeight || 1);
    editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight);
    const lineNum = document.getElementById('split-line-numbers');
    if (lineNum) lineNum.scrollTop = editor.scrollTop;
    setTimeout(() => { state.splitSyncing = false; }, 50);
  });
}

function setupSplitGutter() {
  const gutter = document.getElementById('split-gutter');
  const left = document.getElementById('split-left');
  const right = document.getElementById('split-right');
  const container = document.getElementById('pane-split');
  if (!gutter || !left || !right || !container) return;

  let isDragging = false;

  gutter.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    gutter.classList.add('is-dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const contRect = container.getBoundingClientRect();
    if (contRect.width <= 0) return;

    const mouseX = e.clientX - contRect.left;
    const minWidth = 150;
    const maxWidth = contRect.width - minWidth;
    const clampedX = Math.max(minWidth, Math.min(mouseX, maxWidth));

    const leftPercent = (clampedX / contRect.width) * 100;
    const rightPercent = 100 - leftPercent;

    left.style.flex = `0 0 ${leftPercent}%`;
    right.style.flex = `0 0 ${rightPercent}%`;
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      gutter.classList.remove('is-dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

function setupWindowResizeHandlers() {
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // 1. Clamp Architecture Studio floating toolbar inside viewport
      const toolbar = document.getElementById('arch-toolbar');
      const container = document.getElementById('pane-architecture');
      if (toolbar && container) {
        const contRect = container.getBoundingClientRect();
        const tbRect = toolbar.getBoundingClientRect();
        if (tbRect.width > 0 && contRect.width > 0) {
          const currentLeft = parseFloat(toolbar.style.left);
          const currentTop = parseFloat(toolbar.style.top);
          if (!isNaN(currentLeft)) {
            const clampedLeft = Math.max(10, Math.min(currentLeft, contRect.width - tbRect.width - 10));
            toolbar.style.left = `${clampedLeft}px`;
          }
          if (!isNaN(currentTop)) {
            const clampedTop = Math.max(10, Math.min(currentTop, contRect.height - tbRect.height - 10));
            toolbar.style.top = `${clampedTop}px`;
          }
        }
      }

      // 2. Synchronize line numbers and editor heights
      const rawEditor = document.getElementById('raw-code-editor');
      const rawLines = document.getElementById('raw-line-numbers');
      if (rawEditor && rawLines) rawLines.scrollTop = rawEditor.scrollTop;

      const splitEditor = document.getElementById('split-code-editor');
      const splitLines = document.getElementById('split-line-numbers');
      if (splitEditor && splitLines) splitLines.scrollTop = splitEditor.scrollTop;

      // 3. If in slides mode, scale presentation slide
      if (typeof slidesState !== 'undefined' && slidesState.isActive) {
        renderCurrentSlide();
      }
    }, 100);
  });
}

// In-Page Search Engine (Ctrl+F)
function toggleSearch(show) {
  const searchBar = document.getElementById('search-bar');
  const searchInput = document.getElementById('search-input');
  if (!searchBar) return;

  const shouldOpen = show !== undefined ? show : !searchBar.classList.contains('open');
  if (shouldOpen) {
    searchBar.classList.add('open');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  } else {
    searchBar.classList.remove('open');
    clearSearchHighlights();
  }
}

function clearSearchHighlights() {
  document.querySelectorAll('mark.search-highlight').forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });
  state.searchResults = [];
  state.currentSearchIndex = -1;
  const countEl = document.getElementById('search-count');
  if (countEl) countEl.textContent = '0 of 0';
}

function performSearch(query) {
  clearSearchHighlights();
  if (!query || query.trim().length === 0) return;

  const container = state.currentView === 'code' ?
    document.getElementById('pane-code') :
    (state.currentView === 'split' ? document.getElementById('pane-split') : document.getElementById('pane-preview'));

  if (!container) return;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
  const textNodes = [];

  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement && !['SCRIPT', 'STYLE', 'TEXTAREA'].includes(node.parentElement.tagName)) {
      textNodes.push(node);
    }
  }

  textNodes.forEach(node => {
    if (regex.test(node.textContent)) {
      const span = document.createElement('span');
      span.innerHTML = node.textContent.replace(regex, '<mark class="search-highlight">$1</mark>');
      node.parentNode.replaceChild(span, node);
    }
  });

  state.searchResults = Array.from(document.querySelectorAll('mark.search-highlight'));
  const countEl = document.getElementById('search-count');
  if (state.searchResults.length > 0) {
    state.currentSearchIndex = 0;
    updateSearchFocus();
  } else {
    if (countEl) countEl.textContent = '0 of 0';
  }
}

function updateSearchFocus() {
  state.searchResults.forEach((el, idx) => {
    el.classList.toggle('active', idx === state.currentSearchIndex);
  });

  const countEl = document.getElementById('search-count');
  if (countEl) {
    countEl.textContent = `${state.currentSearchIndex + 1} of ${state.searchResults.length}`;
  }

  const active = state.searchResults[state.currentSearchIndex];
  if (active) {
    active.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function nextSearchMatch() {
  if (state.searchResults.length === 0) return;
  state.currentSearchIndex = (state.currentSearchIndex + 1) % state.searchResults.length;
  updateSearchFocus();
}

function prevSearchMatch() {
  if (state.searchResults.length === 0) return;
  state.currentSearchIndex = (state.currentSearchIndex - 1 + state.searchResults.length) % state.searchResults.length;
  updateSearchFocus();
}

function copyRawContent() {
  navigator.clipboard.writeText(state.rawContent).then(() => {
    showToast('Copied raw markdown to clipboard!');
  });
}

// ========================================================
// Interactive Architecture Block Studio Engine
// ========================================================

function pushArchHistory() {
  archHistory.past.push({
    nodes: JSON.parse(JSON.stringify(archState.nodes)),
    edges: JSON.parse(JSON.stringify(archState.edges)),
    clusters: JSON.parse(JSON.stringify(archState.clusters || []))
  });
  if (archHistory.past.length > 40) archHistory.past.shift();
  archHistory.future = [];
}

function undoArch() {
  if (archHistory.past.length === 0) {
    showToast('Nothing to undo');
    return;
  }
  archHistory.future.push({
    nodes: JSON.parse(JSON.stringify(archState.nodes)),
    edges: JSON.parse(JSON.stringify(archState.edges)),
    clusters: JSON.parse(JSON.stringify(archState.clusters || []))
  });
  const prev = archHistory.past.pop();
  archState.nodes = prev.nodes;
  archState.edges = prev.edges;
  archState.clusters = prev.clusters || [];
  renderArchWorld();
  showToast('Undo action');
}

function redoArch() {
  if (archHistory.future.length === 0) {
    showToast('Nothing to redo');
    return;
  }
  archHistory.past.push({
    nodes: JSON.parse(JSON.stringify(archState.nodes)),
    edges: JSON.parse(JSON.stringify(archState.edges)),
    clusters: JSON.parse(JSON.stringify(archState.clusters || []))
  });
  const next = archHistory.future.pop();
  archState.nodes = next.nodes;
  archState.edges = next.edges;
  archState.clusters = next.clusters || [];
  renderArchWorld();
  showToast('Redo action');
}

function getPortCoordinates(node, port) {
  const w = node.width || (node.type === 'circle' ? 96 : 150);
  const h = node.height || (node.type === 'circle' ? 96 : 60);
  if (port === 'top') return { x: node.x + w / 2, y: node.y };
  if (port === 'right') return { x: node.x + w, y: node.y + h / 2 };
  if (port === 'bottom') return { x: node.x + w / 2, y: node.y + h };
  if (port === 'left') return { x: node.x, y: node.y + h / 2 };
  return { x: node.x + w / 2, y: node.y + h / 2 };
}

function getBezierPath(p1, p2, fromPort, toPort) {
  const dx = Math.abs(p2.x - p1.x) * 0.5;
  const dy = Math.abs(p2.y - p1.y) * 0.5;
  let cx1 = p1.x, cy1 = p1.y, cx2 = p2.x, cy2 = p2.y;

  if (fromPort === 'right') cx1 = p1.x + Math.max(dx, 40);
  else if (fromPort === 'left') cx1 = p1.x - Math.max(dx, 40);
  else if (fromPort === 'bottom') cy1 = p1.y + Math.max(dy, 40);
  else if (fromPort === 'top') cy1 = p1.y - Math.max(dy, 40);

  if (toPort === 'left') cx2 = p2.x - Math.max(dx, 40);
  else if (toPort === 'right') cx2 = p2.x + Math.max(dx, 40);
  else if (toPort === 'top') cy2 = p2.y - Math.max(dy, 40);
  else if (toPort === 'bottom') cy2 = p2.y + Math.max(dy, 40);

  return `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;
}

function updateArchTransform() {
  const world = document.getElementById('arch-world');
  const zoomVal = document.getElementById('arch-zoom-val');
  if (world) {
    world.style.transform = `translate(${archState.panX}px, ${archState.panY}px) scale(${archState.zoom})`;
  }
  if (zoomVal) {
    zoomVal.textContent = `${Math.round(archState.zoom * 100)}%`;
  }
}

function renderArchWorld() {
  renderArchClusters();
  renderArchNodes();
  renderArchEdges();
  updateArchTransform();
}

function startInlineRename(node, titleEl) {
  const currentText = node.label;
  const input = document.createElement('input');
  input.className = 'arch-node-input';
  input.value = currentText;
  titleEl.replaceWith(input);
  input.focus();
  input.select();

  let finished = false;
  const finishEdit = () => {
    if (finished) return;
    finished = true;
    const val = input.value.trim() || currentText;
    if (val !== currentText) {
      pushArchHistory();
    }
    node.label = val;
    titleEl.textContent = val;
    if (input.parentNode) input.replaceWith(titleEl);
  };

  input.addEventListener('blur', finishEdit);
  input.addEventListener('keydown', (ke) => {
    if (ke.key === 'Enter') finishEdit();
    if (ke.key === 'Escape') {
      finished = true;
      titleEl.textContent = currentText;
      if (input.parentNode) input.replaceWith(titleEl);
    }
  });
}

function renderArchNodes() {
  const layer = document.getElementById('arch-nodes-layer');
  if (!layer) return;
  layer.innerHTML = '';

  archState.nodes.forEach(node => {
    const el = document.createElement('div');
    const shapeType = node.type || 'rectangle';
    el.className = `arch-node node-type-${shapeType}`;
    el.id = `arch-el-${node.id}`;
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;

    const w = node.width || (shapeType === 'circle' ? 96 : (shapeType === 'database' ? 160 : 150));
    const h = node.height || (shapeType === 'circle' ? 96 : 60);
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;

    if (node.color) {
      el.style.setProperty('--node-color', node.color);
      el.dataset.customColor = "true";
    }

    if (archState.selectedNodeId === node.id) {
      el.classList.add('selected');
    }

    el.innerHTML = `
      <div class="arch-node-header">
        <span>${shapeType}</span>
        <button class="arch-node-del" title="Delete block" data-id="${node.id}">✕</button>
      </div>
      <div class="arch-node-title" id="title-${node.id}">${node.label}</div>
      <div class="arch-port port-top" data-node="${node.id}" data-port="top" title="Connect top"></div>
      <div class="arch-port port-right" data-node="${node.id}" data-port="right" title="Connect right"></div>
      <div class="arch-port port-bottom" data-node="${node.id}" data-port="bottom" title="Connect bottom"></div>
      <div class="arch-port port-left" data-node="${node.id}" data-port="left" title="Connect left"></div>
      <div class="arch-node-resize" data-node="${node.id}" title="Drag to resize block"></div>
    `;

    // Right-Click Context Menu on Block
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openArchContextMenu('node', node.id, e.clientX, e.clientY);
    });

    // Inline Rename on Double Click
    const titleEl = el.querySelector('.arch-node-title');
    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      startInlineRename(node, titleEl);
    });

    // Delete Button
    el.querySelector('.arch-node-del').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteArchNode(node.id);
    });

    layer.appendChild(el);
  });
}

function selectArchNode(nodeId) {
  archState.selectedNodeId = nodeId;
  archState.selectedEdgeId = null;
  document.querySelectorAll('.arch-node').forEach(n => n.classList.remove('selected'));
  document.querySelectorAll('.arch-edge').forEach(ed => ed.classList.remove('selected'));

  const el = document.getElementById(`arch-el-${nodeId}`);
  if (el) el.classList.add('selected');

  const node = archState.nodes.find(n => n.id === nodeId);
  if (node) {
    const shapeSelect = document.getElementById('arch-node-type-select');
    if (shapeSelect) shapeSelect.value = node.type || 'rectangle';
  }
}

function selectArchEdge(edgeId) {
  archState.selectedEdgeId = edgeId;
  archState.selectedNodeId = null;
  document.querySelectorAll('.arch-node').forEach(n => n.classList.remove('selected'));
  document.querySelectorAll('.arch-edge').forEach(ed => ed.classList.remove('selected'));

  const path = document.getElementById(`edge-path-${edgeId}`);
  if (path) path.classList.add('selected');

  const edge = archState.edges.find(e => e.id === edgeId);
  if (!edge) return;

  const linkSelect = document.getElementById('arch-link-dir-select');
  if (linkSelect) {
    if (edge.style === 'dotted') {
      linkSelect.value = 'dotted';
    } else if (edge.style === 'dashed' || edge.dashed) {
      linkSelect.value = 'dashed';
    } else {
      linkSelect.value = edge.direction || 'uni';
    }
  }
}

function renderArchEdges() {
  const group = document.getElementById('arch-edges-group');
  const labelGroup = document.getElementById('arch-edge-labels-group');
  if (!group) return;
  group.innerHTML = '';
  if (labelGroup) labelGroup.innerHTML = '';

  archState.edges.forEach(edge => {
    const fromNode = archState.nodes.find(n => n.id === edge.from);
    const toNode = archState.nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return;

    const p1 = getPortCoordinates(fromNode, edge.fromPort || 'right');
    const p2 = getPortCoordinates(toNode, edge.toPort || 'left');
    const d = getBezierPath(p1, p2, edge.fromPort || 'right', edge.toPort || 'left');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const isSelected = archState.selectedEdgeId === edge.id;
    const dirClass = `edge-${edge.direction || 'uni'}`;
    let styleClass = '';
    if (edge.style === 'dotted') styleClass = 'edge-dotted';
    else if (edge.style === 'dashed' || edge.dashed) styleClass = 'edge-dashed';

    path.setAttribute('class', `arch-edge ${dirClass} ${styleClass} ${isSelected ? 'selected' : ''}`);
    path.setAttribute('id', `edge-path-${edge.id}`);
    path.setAttribute('d', d);

    if (edge.color) {
      path.style.stroke = edge.color;
    }

    path.addEventListener('click', (e) => {
      e.stopPropagation();
      selectArchEdge(edge.id);
    });

    path.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openArchContextMenu('edge', edge.id, e.clientX, e.clientY);
    });

    group.appendChild(path);

    // Edge Label Pill
    if (labelGroup && edge.label && edge.label.trim()) {
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const textLen = edge.label.length;
      const boxW = Math.max(50, textLen * 7 + 16);
      const boxH = 22;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'arch-edge-label-group');
      g.setAttribute('id', `edge-label-${edge.id}`);
      g.setAttribute('transform', `translate(${mx}, ${my})`);

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('class', 'arch-edge-label-bg');
      rect.setAttribute('x', -boxW / 2);
      rect.setAttribute('y', -boxH / 2);
      rect.setAttribute('width', boxW);
      rect.setAttribute('height', boxH);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'arch-edge-label-text');
      text.textContent = edge.label;

      g.appendChild(rect);
      g.appendChild(text);

      g.addEventListener('click', (e) => {
        e.stopPropagation();
        selectArchEdge(edge.id);
      });
      g.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const newLbl = prompt('Edit line label / annotation:', edge.label);
        if (newLbl !== null) {
          pushArchHistory();
          edge.label = newLbl.trim();
          renderArchEdges();
        }
      });
      g.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openArchContextMenu('edge', edge.id, e.clientX, e.clientY);
      });

      labelGroup.appendChild(g);
    }
  });
}

// Dynamic real-time edge update when moving a node
function updateEdgesForNode(nodeId) {
  archState.edges.forEach(edge => {
    if (edge.from === nodeId || edge.to === nodeId) {
      const fromNode = archState.nodes.find(n => n.id === edge.from);
      const toNode = archState.nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return;

      const p1 = getPortCoordinates(fromNode, edge.fromPort || 'right');
      const p2 = getPortCoordinates(toNode, edge.toPort || 'left');
      const d = getBezierPath(p1, p2, edge.fromPort || 'right', edge.toPort || 'left');

      const path = document.getElementById(`edge-path-${edge.id}`);
      if (path) path.setAttribute('d', d);

      const labelEl = document.getElementById(`edge-label-${edge.id}`);
      if (labelEl) {
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        labelEl.setAttribute('transform', `translate(${mx}, ${my})`);
      }
    }
  });
}

function addArchNode(label, type, x, y, color) {
  pushArchHistory();
  const id = `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const shape = type || 'rectangle';
  const isCircle = shape === 'circle';
  const newNode = {
    id,
    label: label || `New ${shape.charAt(0).toUpperCase() + shape.slice(1)}`,
    type: shape,
    color: color || null,
    x: x !== undefined ? Math.round(x) : (100 + Math.random() * 200),
    y: y !== undefined ? Math.round(y) : (100 + Math.random() * 200),
    width: isCircle ? 96 : (shape === 'database' ? 160 : 150),
    height: isCircle ? 96 : 60
  };

  archState.nodes.push(newNode);
  renderArchWorld();
  showToast(`Added ${shape}: ${newNode.label}`);
  return newNode;
}

function deleteArchNode(nodeId) {
  pushArchHistory();
  archState.nodes = archState.nodes.filter(n => n.id !== nodeId);
  archState.edges = archState.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
  if (archState.selectedNodeId === nodeId) archState.selectedNodeId = null;
  renderArchWorld();
  showToast('Block removed');
}

function addArchCluster(label, x, y, width, height) {
  pushArchHistory();
  const id = `cluster_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const newCluster = {
    id,
    label: label || 'Boundary Group',
    x: x !== undefined ? Math.round(x) : (80 + Math.random() * 100),
    y: y !== undefined ? Math.round(y) : (60 + Math.random() * 60),
    width: width || 420,
    height: height || 260
  };
  archState.clusters = archState.clusters || [];
  archState.clusters.push(newCluster);
  renderArchWorld();
  showToast(`Added Cluster: ${newCluster.label}`);
  return newCluster;
}

function renderArchClusters() {
  const group = document.getElementById('arch-clusters-group');
  if (!group) return;
  group.innerHTML = '';

  (archState.clusters || []).forEach(cluster => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `arch-cluster-group ${archState.selectedClusterId === cluster.id ? 'selected' : ''}`);
    g.setAttribute('id', `cluster-${cluster.id}`);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'arch-cluster-rect');
    rect.setAttribute('x', cluster.x);
    rect.setAttribute('y', cluster.y);
    rect.setAttribute('width', cluster.width);
    rect.setAttribute('height', cluster.height);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'arch-cluster-label');
    text.setAttribute('x', cluster.x + 14);
    text.setAttribute('y', cluster.y + 22);
    text.textContent = cluster.label;

    g.appendChild(rect);
    g.appendChild(text);

    let isDragging = false;
    let startX = 0, startY = 0;
    let origClusterX = cluster.x, origClusterY = cluster.y;
    let memberNodes = [];

    g.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      archState.selectedClusterId = cluster.id;
      archState.selectedNodeId = null;
      archState.selectedEdgeId = null;
      renderArchClusters();

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origClusterX = cluster.x;
      origClusterY = cluster.y;

      memberNodes = archState.nodes.filter(n => {
        const cx = n.x + (n.width || 150) / 2;
        const cy = n.y + (n.height || 60) / 2;
        return cx >= cluster.x && cx <= cluster.x + cluster.width &&
          cy >= cluster.y && cy <= cluster.y + cluster.height;
      }).map(n => ({ node: n, origX: n.x, origY: n.y }));

      const onMouseMove = (me) => {
        if (!isDragging) return;
        const dx = (me.clientX - startX) / archState.zoom;
        const dy = (me.clientY - startY) / archState.zoom;
        cluster.x = Math.round(origClusterX + dx);
        cluster.y = Math.round(origClusterY + dy);
        rect.setAttribute('x', cluster.x);
        rect.setAttribute('y', cluster.y);
        text.setAttribute('x', cluster.x + 14);
        text.setAttribute('y', cluster.y + 22);

        memberNodes.forEach(m => {
          m.node.x = Math.round(m.origX + dx);
          m.node.y = Math.round(m.origY + dy);
          const nodeEl = document.getElementById(`arch-el-${m.node.id}`);
          if (nodeEl) {
            nodeEl.style.left = `${m.node.x}px`;
            nodeEl.style.top = `${m.node.y}px`;
          }
          updateEdgesForNode(m.node.id);
        });
      };

      const onMouseUp = () => {
        if (isDragging) {
          isDragging = false;
          pushArchHistory();
          renderArchWorld();
        }
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    g.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const newLabel = prompt('Rename Subgraph Cluster:', cluster.label);
      if (newLabel && newLabel.trim()) {
        pushArchHistory();
        cluster.label = newLabel.trim();
        text.textContent = cluster.label;
      }
    });

    g.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm(`Delete Subgraph Cluster "${cluster.label}"?`)) {
        pushArchHistory();
        archState.clusters = archState.clusters.filter(c => c.id !== cluster.id);
        renderArchWorld();
      }
    });

    group.appendChild(g);
  });
}

function deleteSelectedArchItem() {
  if (archState.selectedClusterId) {
    pushArchHistory();
    archState.clusters = archState.clusters.filter(c => c.id !== archState.selectedClusterId);
    archState.selectedClusterId = null;
    renderArchWorld();
    showToast('Cluster deleted');
    return;
  }
  if (archState.selectedNodeId) {
    deleteArchNode(archState.selectedNodeId);
  } else if (archState.selectedEdgeId) {
    pushArchHistory();
    archState.edges = archState.edges.filter(e => e.id !== archState.selectedEdgeId);
    archState.selectedEdgeId = null;
    renderArchEdges();
    showToast('Connecting line deleted');
  }
}

// Architecture Studio Clipboard System (Ctrl+C, Ctrl+V, Ctrl+D)
function copyArchItem(type, targetId) {
  let kind = type;
  let id = targetId;

  if (!kind) {
    if (archState.selectedNodeId) {
      kind = 'node';
      id = archState.selectedNodeId;
    } else if (archState.selectedClusterId) {
      kind = 'cluster';
      id = archState.selectedClusterId;
    }
  }

  if (kind === 'node') {
    const node = archState.nodes.find(n => n.id === id);
    if (!node) return false;
    archClipboard.item = {
      kind: 'node',
      data: JSON.parse(JSON.stringify(node))
    };
    archClipboard.pasteCount = 0;
    showToast(`Copied block "${node.label}" (Ctrl+C)`);
    return true;
  }

  if (kind === 'cluster') {
    const cluster = (archState.clusters || []).find(c => c.id === id);
    if (!cluster) return false;
    archClipboard.item = {
      kind: 'cluster',
      data: JSON.parse(JSON.stringify(cluster))
    };
    archClipboard.pasteCount = 0;
    showToast(`Copied group "${cluster.label}" (Ctrl+C)`);
    return true;
  }

  showToast('Select a block or cluster first to copy (Ctrl+C)');
  return false;
}

function pasteArchItem(targetX, targetY) {
  if (!archClipboard.item) {
    showToast('Clipboard is empty. Select and copy a block first (Ctrl+C)');
    return null;
  }

  archClipboard.pasteCount++;
  const offset = 36 * (archClipboard.pasteCount % 12);

  if (archClipboard.item.kind === 'node') {
    const orig = archClipboard.item.data;
    const posX = targetX !== undefined ? Math.round(targetX) : Math.round(orig.x + offset);
    const posY = targetY !== undefined ? Math.round(targetY) : Math.round(orig.y + offset);

    const newNode = addArchNode(
      orig.label ? `${orig.label} (Copy)` : 'Pasted Block',
      orig.type || 'rectangle',
      posX,
      posY,
      orig.color || null
    );

    if (newNode) {
      selectArchNode(newNode.id);
      renderArchWorld();
      showToast(`Pasted "${newNode.label}" (Ctrl+V)`);
      return newNode;
    }
  } else if (archClipboard.item.kind === 'cluster') {
    const orig = archClipboard.item.data;
    const posX = targetX !== undefined ? Math.round(targetX) : Math.round(orig.x + offset);
    const posY = targetY !== undefined ? Math.round(targetY) : Math.round(orig.y + offset);

    const newCluster = addArchCluster(
      orig.label ? `${orig.label} (Copy)` : 'Pasted Boundary',
      posX,
      posY,
      orig.width,
      orig.height
    );

    if (newCluster) {
      archState.selectedClusterId = newCluster.id;
      archState.selectedNodeId = null;
      archState.selectedEdgeId = null;
      renderArchWorld();
      showToast(`Pasted group "${newCluster.label}" (Ctrl+V)`);
      return newCluster;
    }
  }

  return null;
}

function duplicateArchItem(type, targetId) {
  if (copyArchItem(type, targetId)) {
    return pasteArchItem();
  }
  return null;
}

// Auto-Arrange Layout Algorithm (Layered Hierarchical Graph Placement)
function autoArrangeArch() {
  if (archState.nodes.length === 0) return;
  pushArchHistory();

  const inDegree = new Map();
  const adj = new Map();
  archState.nodes.forEach(n => {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  });

  archState.edges.forEach(e => {
    if (inDegree.has(e.to)) inDegree.set(e.to, inDegree.get(e.to) + 1);
    if (adj.has(e.from)) adj.get(e.from).push(e.to);
  });

  const rank = new Map();
  const queue = [];
  archState.nodes.forEach(n => {
    if (inDegree.get(n.id) === 0) {
      rank.set(n.id, 0);
      queue.push(n.id);
    }
  });

  if (queue.length === 0 && archState.nodes.length > 0) {
    rank.set(archState.nodes[0].id, 0);
    queue.push(archState.nodes[0].id);
  }

  while (queue.length > 0) {
    const u = queue.shift();
    const curRank = rank.get(u) || 0;
    (adj.get(u) || []).forEach(v => {
      const nextRank = curRank + 1;
      if (!rank.has(v) || rank.get(v) < nextRank) {
        rank.set(v, nextRank);
        queue.push(v);
      }
    });
  }

  archState.nodes.forEach((n, idx) => {
    if (!rank.has(n.id)) rank.set(n.id, idx % 3);
  });

  const rankGroups = new Map();
  archState.nodes.forEach(n => {
    const r = rank.get(n.id) || 0;
    if (!rankGroups.has(r)) rankGroups.set(r, []);
    rankGroups.get(r).push(n);
  });

  const sortedRanks = Array.from(rankGroups.keys()).sort((a, b) => a - b);
  sortedRanks.forEach((r, rankIdx) => {
    const group = rankGroups.get(r);
    group.forEach((node, nodeIdx) => {
      node.x = 80 + rankIdx * 250;
      node.y = 80 + nodeIdx * 115;
    });
  });

  renderArchWorld();
  showToast('Auto-arranged blocks cleanly!');
}

// Convert Architecture graph to Mermaid syntax
function exportArchToMermaid() {
  let mermaid = '```mermaid\ngraph TD\n';

  // Subgraph clusters
  if (archState.clusters && archState.clusters.length > 0) {
    archState.clusters.forEach(cluster => {
      const cleanClusterId = cluster.id.replace(/[^a-zA-Z0-9_]/g, '_');
      mermaid += `  subgraph ${cleanClusterId} ["${cluster.label}"]\n`;
      const insideNodes = archState.nodes.filter(n => {
        const cx = n.x + (n.width || 150) / 2;
        const cy = n.y + (n.height || 60) / 2;
        return cx >= cluster.x && cx <= cluster.x + cluster.width &&
          cy >= cluster.y && cy <= cluster.y + cluster.height;
      });
      insideNodes.forEach(n => {
        mermaid += `    ${n.id.replace(/[^a-zA-Z0-9_]/g, '_')}\n`;
      });
      mermaid += `  end\n`;
    });
  }

  archState.nodes.forEach(node => {
    const cleanId = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
    let shapeStart = '["', shapeEnd = '"]';
    const shape = node.type || 'rectangle';
    if (shape === 'database') { shapeStart = '[("'; shapeEnd = '")]'; }
    else if (shape === 'process') { shapeStart = '{"'; shapeEnd = '"}'; }
    else if (shape === 'circle') { shapeStart = '(("'; shapeEnd = '"))'; }
    else if (shape === 'oval') { shapeStart = '(["'; shapeEnd = '"])'; }
    else if (shape === 'rounded') { shapeStart = '("'; shapeEnd = '")'; }
    else { shapeStart = '["'; shapeEnd = '"]'; }

    mermaid += `    ${cleanId}${shapeStart}${node.label}${shapeEnd}\n`;
  });

  archState.edges.forEach(edge => {
    const fromId = edge.from.replace(/[^a-zA-Z0-9_]/g, '_');
    const toId = edge.to.replace(/[^a-zA-Z0-9_]/g, '_');
    let arrow = '-->';
    if (edge.style === 'dotted' || edge.style === 'dashed' || edge.dashed) arrow = '-.->';
    else if (edge.direction === 'bi') arrow = '<-->';
    else if (edge.direction === 'none') arrow = '---';

    if (edge.label && edge.label.trim()) {
      const cleanLbl = edge.label.trim().replace(/\|/g, '');
      mermaid += `    ${fromId} ${arrow}|${cleanLbl}| ${toId}\n`;
    } else {
      mermaid += `    ${fromId} ${arrow} ${toId}\n`;
    }
  });

  // Custom node colors styling
  archState.nodes.forEach(node => {
    if (node.color) {
      const cleanId = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
      mermaid += `    style ${cleanId} stroke:${node.color},stroke-width:2px\n`;
    }
  });

  mermaid += '```';
  return mermaid;
}

// Parse node definition token: e.g. A["Client"], B[("DB")], C(("Auth"))
function parseNodeToken(token) {
  token = token.trim();
  if (token.toLowerCase() === 'end') return null;
  let m = token.match(/^([a-zA-Z0-9_\-]+)\s*\[\(\s*["']?([\s\S]*?)["']?\s*\)\]$/);
  if (m) return { id: m[1], label: m[2], type: 'database' };
  m = token.match(/^([a-zA-Z0-9_\-]+)\s*\(\[\s*["']?([\s\S]*?)["']?\s*\]\)$/);
  if (m) return { id: m[1], label: m[2], type: 'oval' };
  m = token.match(/^([a-zA-Z0-9_\-]+)\s*\(\(\s*["']?([\s\S]*?)["']?\s*\)\)$/);
  if (m) return { id: m[1], label: m[2], type: 'circle' };
  m = token.match(/^([a-zA-Z0-9_\-]+)\s*\{\s*["']?([\s\S]*?)["']?\s*\}$/);
  if (m) return { id: m[1], label: m[2], type: 'process' };
  m = token.match(/^([a-zA-Z0-9_\-]+)\s*\(\s*["']?([\s\S]*?)["']?\s*\)$/);
  if (m) return { id: m[1], label: m[2], type: 'rounded' };
  m = token.match(/^([a-zA-Z0-9_\-]+)\s*\[\s*["']?([\s\S]*?)["']?\s*\]$/);
  if (m) return { id: m[1], label: m[2], type: 'rectangle' };
  m = token.match(/^([a-zA-Z0-9_\-]+)$/);
  if (m) {
    if (m[1].toLowerCase() === 'end') return null;
    return { id: m[1], label: m[1], type: 'rectangle' };
  }
  return null;
}

// Parse Mermaid diagram into visual nodes & edges with full Subgraph Cluster support
function loadMermaidIntoArch(mermaidCode) {
  pushArchHistory();
  const lines = mermaidCode.split('\n');
  const newNodes = [];
  const newEdges = [];
  const newClusters = [];
  const nodeMap = new Map();

  let activeCluster = null;
  const clusterMembers = new Map();

  let graphDir = 'TD';
  for (const raw of lines) {
    const l = raw.trim();
    const dMatch = l.match(/^(?:graph|flowchart)\s+(TD|TB|LR|RL)/i);
    if (dMatch) {
      const d = dMatch[1].toUpperCase();
      graphDir = (d === 'LR' || d === 'RL') ? 'LR' : 'TD';
      break;
    }
  }

  const registerNode = (parsed) => {
    if (!parsed || parsed.id.toLowerCase() === 'end') return;
    if (!nodeMap.has(parsed.id)) {
      const isCircle = parsed.type === 'circle';
      const n = {
        id: parsed.id,
        label: parsed.label || parsed.id,
        type: parsed.type || 'rectangle',
        x: 100, y: 100,
        width: isCircle ? 96 : (parsed.type === 'database' ? 160 : 150),
        height: isCircle ? 96 : 60
      };
      newNodes.push(n);
      nodeMap.set(parsed.id, n);
    } else {
      if (parsed.label && parsed.label !== parsed.id) {
        nodeMap.get(parsed.id).label = parsed.label;
        nodeMap.get(parsed.id).type = parsed.type;
      }
    }
    if (activeCluster) {
      const members = clusterMembers.get(activeCluster.id) || [];
      if (!members.includes(parsed.id)) {
        members.push(parsed.id);
        clusterMembers.set(activeCluster.id, members);
      }
    }
  };

  lines.forEach(rawLine => {
    let line = rawLine.trim();
    if (!line || line.startsWith('graph') || line.startsWith('flowchart') || line.startsWith('```') || line.startsWith('%%')) return;

    // End of subgraph
    if (line.toLowerCase() === 'end') {
      activeCluster = null;
      return;
    }

    // Start of subgraph: e.g. subgraph "1. Data Ingestion & Annotation" or subgraph id ["Title"]
    if (line.toLowerCase().startsWith('subgraph')) {
      let cId = `cluster_${newClusters.length + 1}`;
      let cLabel = `Group ${newClusters.length + 1}`;

      const mBracket = line.match(/^subgraph\s+([a-zA-Z0-9_\-]+)\s*\[["']?(.*?)["']?\]/i);
      const mQuotes = line.match(/^subgraph\s+["'](.*?)["']$/i);
      const mNamed = line.match(/^subgraph\s+([a-zA-Z0-9_\-]+)\s+(.*)$/i);
      const mPlain = line.match(/^subgraph\s+(.+)$/i);

      if (mBracket) {
        cId = mBracket[1];
        cLabel = mBracket[2] || mBracket[1];
      } else if (mQuotes) {
        cLabel = mQuotes[1];
      } else if (mNamed) {
        cId = mNamed[1];
        cLabel = mNamed[2].replace(/^["']|["']$/g, '');
      } else if (mPlain) {
        cLabel = mPlain[1].replace(/^["']|["']$/g, '');
      }

      activeCluster = {
        id: cId,
        label: cLabel,
        x: 60, y: 60,
        width: 440, height: 260
      };
      newClusters.push(activeCluster);
      clusterMembers.set(activeCluster.id, []);
      return;
    }

    // Style line: style NodeId stroke:#3fb950
    const styleMatch = line.match(/^style\s+([a-zA-Z0-9_\-]+)\s+.*stroke:([#a-zA-Z0-9]+)/i);
    if (styleMatch) {
      const sId = styleMatch[1];
      const sColor = styleMatch[2];
      if (nodeMap.has(sId)) {
        nodeMap.get(sId).color = sColor;
      }
      return;
    }

    // Connections: fromNode --> toNode with optional |label|
    const connRegex = /^(.*?)\s*(<-->|-\.->|-->|---|==>)\s*(?:\|([^|]+)\|)?\s*(.*)$/;
    const connMatch = line.match(connRegex);
    if (connMatch) {
      const fromToken = connMatch[1];
      const arrowSymbol = connMatch[2];
      const edgeLabel = connMatch[3] ? connMatch[3].trim() : '';
      const toToken = connMatch[4];

      const fromParsed = parseNodeToken(fromToken);
      const toParsed = parseNodeToken(toToken);

      if (fromParsed) registerNode(fromParsed);
      if (toParsed) registerNode(toParsed);

      if (fromParsed && toParsed && fromParsed.id.toLowerCase() !== 'end' && toParsed.id.toLowerCase() !== 'end') {
        let direction = 'uni';
        let style = 'solid';
        if (arrowSymbol === '<-->') direction = 'bi';
        else if (arrowSymbol === '---') direction = 'none';
        else if (arrowSymbol === '-.->') style = 'dashed';

        newEdges.push({
          id: `edge_${Date.now()}_${newEdges.length}`,
          from: fromParsed.id,
          to: toParsed.id,
          fromPort: graphDir === 'TD' ? 'bottom' : 'right',
          toPort: graphDir === 'TD' ? 'top' : 'left',
          direction: direction,
          style: style,
          dashed: style === 'dashed',
          label: edgeLabel
        });
      }
      return;
    }

    // Standalone node definition
    const singleNode = parseNodeToken(line);
    if (singleNode && singleNode.id.toLowerCase() !== 'end') {
      registerNode(singleNode);
    }
  });

  // Position subgraphs and internal nodes cleanly
  if (newClusters.length > 0) {
    let currentY = 50;
    const clusterX = 80;

    newClusters.forEach((cluster) => {
      const memberIds = clusterMembers.get(cluster.id) || [];
      const memberNodes = memberIds.map(id => nodeMap.get(id)).filter(Boolean);

      cluster.x = clusterX;
      cluster.y = currentY;

      if (memberNodes.length === 0) {
        cluster.width = 400;
        cluster.height = 160;
        currentY += cluster.height + 40;
        return;
      }

      // Arrange nodes inside cluster into rows
      const cols = Math.min(3, Math.max(1, Math.ceil(Math.sqrt(memberNodes.length))));
      const nodeW = 180;
      const nodeH = 64;
      const padX = 28;
      const padY = 44; // leave space for cluster label header
      const gapX = 32;
      const gapY = 24;

      let maxColsInRow = Math.min(memberNodes.length, cols);
      const computedClusterWidth = Math.max(420, padX * 2 + maxColsInRow * nodeW + (maxColsInRow - 1) * gapX);

      memberNodes.forEach((node, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        node.width = nodeW;
        node.height = nodeH;
        node.x = cluster.x + padX + col * (nodeW + gapX);
        node.y = cluster.y + padY + row * (nodeH + gapY);
      });

      const totalRows = Math.ceil(memberNodes.length / cols);
      cluster.width = computedClusterWidth;
      cluster.height = padY + totalRows * nodeH + (totalRows - 1) * gapY + 28;

      currentY += cluster.height + 40;
    });

    // Position any orphan nodes outside clusters
    const allMemberIds = new Set([].concat(...Array.from(clusterMembers.values())));
    const orphanNodes = newNodes.filter(n => !allMemberIds.has(n.id));
    orphanNodes.forEach((n, idx) => {
      n.x = clusterX + 500 + 40;
      n.y = 60 + idx * 90;
    });
  } else {
    archState.nodes = newNodes;
    archState.edges = newEdges;
    archState.clusters = [];
    autoArrangeArch();
    return;
  }

  archState.nodes = newNodes;
  archState.edges = newEdges;
  archState.clusters = newClusters;
  renderArchWorld();
  showToast(`Loaded diagram with ${newNodes.length} blocks & ${newClusters.length} subgraphs!`);
}

// Export Architecture Canvas as Vector SVG
function exportArchAsSVG() {
  if (archState.nodes.length === 0) return;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  archState.nodes.forEach(n => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + (n.width || 150));
    maxY = Math.max(maxY, n.y + (n.height || 60));
  });
  if (minX === Infinity) { minX = 0; minY = 0; maxX = 800; maxY = 600; }
  minX -= 40; minY -= 40; maxX += 40; maxY += 40;
  const w = maxX - minX;
  const h = maxY - minY;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${w} ${h}" width="${w}" height="${h}">\n`;
  svgContent += `<rect x="${minX}" y="${minY}" width="${w}" height="${h}" fill="#0d1117" rx="8"/>\n`;

  // Draw Edges
  archState.edges.forEach(e => {
    const fn = archState.nodes.find(n => n.id === e.from);
    const tn = archState.nodes.find(n => n.id === e.to);
    if (!fn || !tn) return;
    const p1 = getPortCoordinates(fn, e.fromPort || 'right');
    const p2 = getPortCoordinates(tn, e.toPort || 'left');
    const d = getBezierPath(p1, p2, e.fromPort || 'right', e.toPort || 'left');
    const stroke = e.color || '#58a6ff';
    let dash = '';
    if (e.style === 'dashed') dash = 'stroke-dasharray="6,4"';
    if (e.style === 'dotted') dash = 'stroke-dasharray="2,3"';
    svgContent += `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="2" ${dash}/>\n`;

    if (e.label) {
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const lw = Math.max(50, e.label.length * 7 + 16);
      svgContent += `<rect x="${mx - lw / 2}" y="${my - 10}" width="${lw}" height="20" fill="#161b22" stroke="${stroke}" rx="4"/>\n`;
      svgContent += `<text x="${mx}" y="${my}" fill="#c9d1d9" font-family="sans-serif" font-size="11" text-anchor="middle" dominant-baseline="central">${e.label}</text>\n`;
    }
  });

  // Draw Nodes
  archState.nodes.forEach(n => {
    const nw = n.width || 150;
    const nh = n.height || 60;
    const color = n.color || '#2f81f7';
    let rx = 6;
    if (n.type === 'rounded') rx = 16;
    else if (n.type === 'circle' || n.type === 'oval') rx = nh / 2;

    svgContent += `<g transform="translate(${n.x}, ${n.y})">
      <rect width="${nw}" height="${nh}" rx="${rx}" fill="#161b22" stroke="${color}" stroke-width="2"/>
      <text x="${nw / 2}" y="${nh / 2}" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="600" text-anchor="middle" dominant-baseline="central">${n.label}</text>
    </g>\n`;
  });

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `architecture-${state.fileName.replace(/\.md$/, '') || 'diagram'}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Exported diagram as SVG vector!');
}

// Export Architecture Canvas as High-Res PNG
function exportArchAsPNG() {
  if (archState.nodes.length === 0) return;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  archState.nodes.forEach(n => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + (n.width || 150));
    maxY = Math.max(maxY, n.y + (n.height || 60));
  });
  if (minX === Infinity) { minX = 0; minY = 0; maxX = 800; maxY = 600; }
  minX -= 40; minY -= 40; maxX += 40; maxY += 40;
  const w = maxX - minX;
  const h = maxY - minY;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${w} ${h}" width="${w}" height="${h}">\n`;
  svgContent += `<rect x="${minX}" y="${minY}" width="${w}" height="${h}" fill="#0d1117" rx="8"/>\n`;

  archState.edges.forEach(e => {
    const fn = archState.nodes.find(n => n.id === e.from);
    const tn = archState.nodes.find(n => n.id === e.to);
    if (!fn || !tn) return;
    const p1 = getPortCoordinates(fn, e.fromPort || 'right');
    const p2 = getPortCoordinates(tn, e.toPort || 'left');
    const d = getBezierPath(p1, p2, e.fromPort || 'right', e.toPort || 'left');
    const stroke = e.color || '#58a6ff';
    let dash = '';
    if (e.style === 'dashed') dash = 'stroke-dasharray="6,4"';
    if (e.style === 'dotted') dash = 'stroke-dasharray="2,3"';
    svgContent += `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="2" ${dash}/>\n`;
    if (e.label) {
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const lw = Math.max(50, e.label.length * 7 + 16);
      svgContent += `<rect x="${mx - lw / 2}" y="${my - 10}" width="${lw}" height="20" fill="#161b22" stroke="${stroke}" rx="4"/>\n`;
      svgContent += `<text x="${mx}" y="${my}" fill="#c9d1d9" font-family="sans-serif" font-size="11" text-anchor="middle" dominant-baseline="central">${e.label}</text>\n`;
    }
  });

  archState.nodes.forEach(n => {
    const nw = n.width || 150;
    const nh = n.height || 60;
    const color = n.color || '#2f81f7';
    let rx = 6;
    if (n.type === 'rounded') rx = 16;
    else if (n.type === 'circle' || n.type === 'oval') rx = nh / 2;

    svgContent += `<g transform="translate(${n.x}, ${n.y})">
      <rect width="${nw}" height="${nh}" rx="${rx}" fill="#161b22" stroke="${color}" stroke-width="2"/>
      <text x="${nw / 2}" y="${nh / 2}" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="600" text-anchor="middle" dominant-baseline="central">${n.label}</text>
    </g>\n`;
  });
  svgContent += `</svg>`;

  const img = new Image();
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = w * 2;
    canvas.height = h * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `architecture-${state.fileName.replace(/\.md$/, '') || 'diagram'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Exported diagram as high-res PNG image!');
  };
  img.src = url;
}

// Search & highlight block on canvas
function setupArchBlockSearch() {
  const input = document.getElementById('arch-find-node');
  if (!input) return;
  input.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      document.querySelectorAll('.arch-node').forEach(el => el.classList.remove('selected'));
      return;
    }
    const found = archState.nodes.find(n => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
    if (found) {
      selectArchNode(found.id);
      const vp = document.getElementById('arch-viewport');
      if (vp) {
        archState.panX = (vp.clientWidth / 2) - found.x * archState.zoom;
        archState.panY = (vp.clientHeight / 2) - found.y * archState.zoom;
        updateArchTransform();
      }
    }
  });
}

// Floating Context Menu / Properties Inspector Handler
function openArchContextMenu(type, targetId, clientX, clientY) {
  const menu = document.getElementById('arch-context-menu');
  const nodeSec = document.getElementById('ctx-node-section');
  const edgeSec = document.getElementById('ctx-edge-section');
  const canvasSec = document.getElementById('ctx-canvas-section');
  const viewport = document.getElementById('arch-viewport');
  if (!menu || !viewport) return;

  archState.contextMenuTarget = { type, id: targetId, clientX, clientY };

  if (nodeSec) nodeSec.style.display = 'none';
  if (edgeSec) edgeSec.style.display = 'none';
  if (canvasSec) canvasSec.style.display = 'none';

  if (type === 'node') {
    const node = archState.nodes.find(n => n.id === targetId);
    if (!node) return;
    selectArchNode(node.id);

    if (nodeSec) {
      nodeSec.style.display = 'flex';
      const nameEl = document.getElementById('ctx-node-name');
      const badgeEl = document.getElementById('ctx-node-type-badge');
      if (nameEl) nameEl.textContent = node.label;
      if (badgeEl) badgeEl.textContent = node.type || 'Rectangle';

      nodeSec.querySelectorAll('.ctx-shape-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.shape === (node.type || 'rectangle'));
      });

      nodeSec.querySelectorAll('.ctx-color-swatch').forEach(sw => {
        sw.classList.toggle('active', sw.dataset.color === node.color);
      });
    }
  } else if (type === 'edge') {
    const edge = archState.edges.find(e => e.id === targetId);
    if (!edge) return;
    selectArchEdge(edge.id);

    if (edgeSec) {
      edgeSec.style.display = 'flex';
      const badgeEl = document.getElementById('ctx-edge-type-badge');
      if (badgeEl) badgeEl.textContent = edge.direction === 'bi' ? 'Bidirectional' : (edge.direction === 'none' ? 'Undirected' : 'Unidirectional');

      const labelInput = document.getElementById('ctx-edge-label-input');
      if (labelInput) labelInput.value = edge.label || '';

      edgeSec.querySelectorAll('[data-dir]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.dir === (edge.direction || 'uni'));
      });

      const currentStyle = edge.style || (edge.dashed ? 'dashed' : 'solid');
      edgeSec.querySelectorAll('[data-style]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.style === currentStyle);
      });

      edgeSec.querySelectorAll('[data-edge-color]').forEach(sw => {
        sw.classList.toggle('active', sw.dataset.edgeColor === edge.color);
      });
    }
  } else if (type === 'canvas') {
    if (canvasSec) canvasSec.style.display = 'flex';
  }

  menu.style.display = 'flex';

  const vpRect = viewport.getBoundingClientRect();
  let menuX = clientX - vpRect.left;
  let menuY = clientY - vpRect.top;

  const menuWidth = 240;
  const menuHeight = 340;
  if (menuX + menuWidth > vpRect.width) menuX = Math.max(10, vpRect.width - menuWidth - 10);
  if (menuY + menuHeight > vpRect.height) menuY = Math.max(10, vpRect.height - menuHeight - 10);

  menu.style.left = `${menuX}px`;
  menu.style.top = `${menuY}px`;
}

function closeArchContextMenu() {
  const menu = document.getElementById('arch-context-menu');
  if (menu) menu.style.display = 'none';
  archState.contextMenuTarget = null;
}

// Setup Movable Architecture Toolbar
function setupMovableToolbar() {
  const toolbar = document.getElementById('arch-toolbar');
  const handle = document.getElementById('arch-toolbar-handle');
  const container = document.getElementById('pane-architecture');
  if (!toolbar || !container) return;

  let isDraggingToolbar = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;

  const startDrag = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button:not(#arch-toolbar-handle), select, option, input, label')) return;

    isDraggingToolbar = true;
    toolbar.classList.add('is-dragging');

    const rect = toolbar.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();

    if (toolbar.style.transform !== 'none') {
      toolbar.style.left = `${rect.left - contRect.left}px`;
      toolbar.style.top = `${rect.top - contRect.top}px`;
      toolbar.style.transform = 'none';
    }

    initialLeft = parseFloat(toolbar.style.left) || (rect.left - contRect.left);
    initialTop = parseFloat(toolbar.style.top) || (rect.top - contRect.top);
    startX = e.clientX;
    startY = e.clientY;

    e.preventDefault();
  };

  if (handle) handle.addEventListener('mousedown', startDrag);
  toolbar.addEventListener('mousedown', startDrag);

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingToolbar) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const contRect = container.getBoundingClientRect();
    const tbRect = toolbar.getBoundingClientRect();

    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;

    newLeft = Math.max(10, Math.min(newLeft, contRect.width - tbRect.width - 10));
    newTop = Math.max(10, Math.min(newTop, contRect.height - tbRect.height - 10));

    toolbar.style.left = `${newLeft}px`;
    toolbar.style.top = `${newTop}px`;
  });

  window.addEventListener('mouseup', () => {
    if (isDraggingToolbar) {
      isDraggingToolbar = false;
      toolbar.classList.remove('is-dragging');
    }
  });
}

// Setup Canvas Dragging, Connecting, and Pan-Zoom interactions
function setupArchInteractions() {
  const viewport = document.getElementById('arch-viewport');
  const tempLine = document.getElementById('arch-temp-line');
  if (!viewport) return;

  let isPanning = false;
  let panStartX = 0, panStartY = 0;

  let draggingNode = null;
  let dragOffset = { x: 0, y: 0 };
  let didMoveNode = false;

  let resizingNode = null;
  let didResizeNode = false;
  let resizeStart = { x: 0, y: 0, width: 0, height: 0 };

  // Canvas Mouse Down
  viewport.addEventListener('mousedown', (e) => {
    closeArchContextMenu();

    // 1. Connection Port Handle click
    if (e.target.classList.contains('arch-port')) {
      e.stopPropagation();
      const nodeId = e.target.dataset.node;
      const port = e.target.dataset.port;
      archState.isConnecting = true;
      archState.connectStart = { nodeId, port };

      const fromNode = archState.nodes.find(n => n.id === nodeId);
      const p1 = getPortCoordinates(fromNode, port);

      tempLine.style.display = 'block';
      tempLine.setAttribute('d', `M ${p1.x} ${p1.y} L ${p1.x} ${p1.y}`);
      viewport.classList.add('is-connecting');
      return;
    }

    // 1.5 Node Resize Handle click
    if (e.target.classList.contains('arch-node-resize')) {
      e.stopPropagation();
      const nodeId = e.target.dataset.node;
      const node = archState.nodes.find(n => n.id === nodeId);
      if (node) {
        resizingNode = node;
        didResizeNode = false;
        resizeStart = {
          x: e.clientX,
          y: e.clientY,
          width: node.width || (node.type === 'circle' ? 96 : (node.type === 'database' ? 160 : 150)),
          height: node.height || (node.type === 'circle' ? 96 : 60)
        };
        selectArchNode(node.id);
        const el = document.getElementById(`arch-el-${node.id}`);
        if (el) el.classList.add('resizing');
      }
      return;
    }

    // 2. Node Dragging
    const nodeEl = e.target.closest('.arch-node');
    if (nodeEl && !e.target.classList.contains('arch-node-del') && !e.target.classList.contains('arch-node-input')) {
      if (e.button !== 0) return;
      e.stopPropagation();
      const nodeId = nodeEl.id.replace('arch-el-', '');
      const node = archState.nodes.find(n => n.id === nodeId);
      if (node) {
        draggingNode = node;
        didMoveNode = false;
        nodeEl.classList.add('dragging');

        selectArchNode(node.id);

        const mouseCanvasX = (e.clientX - viewport.getBoundingClientRect().left - archState.panX) / archState.zoom;
        const mouseCanvasY = (e.clientY - viewport.getBoundingClientRect().top - archState.panY) / archState.zoom;
        dragOffset.x = mouseCanvasX - node.x;
        dragOffset.y = mouseCanvasY - node.y;
      }
      return;
    }

    // 3. Canvas Background Panning
    if (e.button === 0 && (e.target === viewport || e.target.id === 'arch-svg-layer' || e.target.id === 'arch-world')) {
      isPanning = true;
      viewport.classList.add('panning');
      panStartX = e.clientX - archState.panX;
      panStartY = e.clientY - archState.panY;
      archState.selectedNodeId = null;
      archState.selectedEdgeId = null;
      document.querySelectorAll('.arch-node').forEach(n => n.classList.remove('selected'));
      document.querySelectorAll('.arch-edge').forEach(ed => ed.classList.remove('selected'));
    }
  });

  // Canvas Right Click
  viewport.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.arch-node') || e.target.closest('.arch-edge') || e.target.closest('.arch-toolbar') || e.target.closest('.arch-context-menu') || e.target.closest('.arch-edge-label-group')) {
      return;
    }
    e.preventDefault();
    openArchContextMenu('canvas', null, e.clientX, e.clientY);
  });

  // Global Mouse Move
  window.addEventListener('mousemove', (e) => {
    // Updating Connection Preview Line
    if (archState.isConnecting && archState.connectStart) {
      const fromNode = archState.nodes.find(n => n.id === archState.connectStart.nodeId);
      if (fromNode) {
        const p1 = getPortCoordinates(fromNode, archState.connectStart.port);
        const rect = viewport.getBoundingClientRect();
        const curX = (e.clientX - rect.left - archState.panX) / archState.zoom;
        const curY = (e.clientY - rect.top - archState.panY) / archState.zoom;
        const d = getBezierPath(p1, { x: curX, y: curY }, archState.connectStart.port, 'left');
        tempLine.setAttribute('d', d);
      }
      return;
    }

    // Resizing Node Shape
    if (resizingNode) {
      didResizeNode = true;
      const dx = (e.clientX - resizeStart.x) / archState.zoom;
      const dy = (e.clientY - resizeStart.y) / archState.zoom;

      if (resizingNode.type === 'circle') {
        const side = Math.max(64, Math.round(resizeStart.width + Math.max(dx, dy)));
        resizingNode.width = side;
        resizingNode.height = side;
      } else {
        resizingNode.width = Math.max(80, Math.round(resizeStart.width + dx));
        resizingNode.height = Math.max(40, Math.round(resizeStart.height + dy));
      }

      const el = document.getElementById(`arch-el-${resizingNode.id}`);
      if (el) {
        el.style.width = `${resizingNode.width}px`;
        el.style.height = `${resizingNode.height}px`;
      }
      updateEdgesForNode(resizingNode.id);
      return;
    }

    // Dragging Node & Live Reconnecting Lines
    if (draggingNode) {
      didMoveNode = true;
      const rect = viewport.getBoundingClientRect();
      const mouseCanvasX = (e.clientX - rect.left - archState.panX) / archState.zoom;
      const mouseCanvasY = (e.clientY - rect.top - archState.panY) / archState.zoom;

      draggingNode.x = Math.round(mouseCanvasX - dragOffset.x);
      draggingNode.y = Math.round(mouseCanvasY - dragOffset.y);

      const el = document.getElementById(`arch-el-${draggingNode.id}`);
      if (el) {
        el.style.left = `${draggingNode.x}px`;
        el.style.top = `${draggingNode.y}px`;
      }

      updateEdgesForNode(draggingNode.id);
      return;
    }

    // Panning Canvas
    if (isPanning) {
      archState.panX = e.clientX - panStartX;
      archState.panY = e.clientY - panStartY;
      updateArchTransform();
    }
  });

  // Global Mouse Up
  window.addEventListener('mouseup', (e) => {
    if (archState.isConnecting) {
      tempLine.style.display = 'none';
      viewport.classList.remove('is-connecting');

      const targetPortEl = document.elementFromPoint(e.clientX, e.clientY);
      if (targetPortEl && targetPortEl.classList.contains('arch-port')) {
        const targetNodeId = targetPortEl.dataset.node;
        const targetPort = targetPortEl.dataset.port;

        if (targetNodeId && targetNodeId !== archState.connectStart.nodeId) {
          pushArchHistory();
          const linkSelect = document.getElementById('arch-link-dir-select');
          const currentLinkType = linkSelect ? linkSelect.value : 'uni';
          const isDashed = currentLinkType === 'dashed';
          const isDotted = currentLinkType === 'dotted';
          const direction = (isDashed || isDotted) ? 'uni' : currentLinkType;
          const style = isDotted ? 'dotted' : (isDashed ? 'dashed' : 'solid');

          const edgeId = `edge_${Date.now()}`;
          archState.edges.push({
            id: edgeId,
            from: archState.connectStart.nodeId,
            to: targetNodeId,
            fromPort: archState.connectStart.port,
            toPort: targetPort,
            direction: direction,
            style: style,
            dashed: isDashed,
            label: ''
          });
          renderArchEdges();
          showToast(`Blocks connected (${currentLinkType})!`);
        }
      }

      archState.isConnecting = false;
      archState.connectStart = null;
    }

    if (resizingNode) {
      if (didResizeNode) pushArchHistory();
      const el = document.getElementById(`arch-el-${resizingNode.id}`);
      if (el) el.classList.remove('resizing');
      resizingNode = null;
      didResizeNode = false;
    }

    if (draggingNode) {
      if (didMoveNode) {
        pushArchHistory();
      }
      const el = document.getElementById(`arch-el-${draggingNode.id}`);
      if (el) el.classList.remove('dragging');
      draggingNode = null;
      didMoveNode = false;
    }

    if (isPanning) {
      isPanning = false;
      viewport.classList.remove('panning');
    }
  });

  // Canvas Mouse Wheel Zoom
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(2.5, Math.max(0.4, archState.zoom * zoomFactor));

    const rect = viewport.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    archState.panX = mouseX - (mouseX - archState.panX) * (newZoom / archState.zoom);
    archState.panY = mouseY - (mouseY - archState.panY) * (newZoom / archState.zoom);
    archState.zoom = newZoom;

    updateArchTransform();
  }, { passive: false });

  // Context Menu Action Listeners
  const ctxMenu = document.getElementById('arch-context-menu');
  if (ctxMenu) {
    // 1. Shape Switch Buttons
    ctxMenu.querySelectorAll('.ctx-shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (archState.contextMenuTarget && archState.contextMenuTarget.type === 'node') {
          const node = archState.nodes.find(n => n.id === archState.contextMenuTarget.id);
          if (node) {
            pushArchHistory();
            node.type = btn.dataset.shape;
            renderArchWorld();
            showToast(`Shape changed to ${btn.dataset.shape}`);
          }
        }
        closeArchContextMenu();
      });
    });

    // 2. Node Color Swatches
    ctxMenu.querySelectorAll('#ctx-node-colors .ctx-color-swatch').forEach(sw => {
      btn = sw;
      sw.addEventListener('click', () => {
        if (archState.contextMenuTarget && archState.contextMenuTarget.type === 'node') {
          const node = archState.nodes.find(n => n.id === archState.contextMenuTarget.id);
          if (node) {
            pushArchHistory();
            node.color = sw.dataset.color;
            renderArchWorld();
            showToast('Block color updated!');
          }
        }
        closeArchContextMenu();
      });
    });

    // 3. Rename Action
    const renameBtn = document.getElementById('ctx-action-rename');
    if (renameBtn) {
      renameBtn.addEventListener('click', () => {
        if (archState.contextMenuTarget && archState.contextMenuTarget.type === 'node') {
          const node = archState.nodes.find(n => n.id === archState.contextMenuTarget.id);
          const el = document.getElementById(`arch-el-${node.id}`);
          if (node && el) {
            const titleEl = el.querySelector('.arch-node-title');
            closeArchContextMenu();
            if (titleEl) startInlineRename(node, titleEl);
            return;
          }
        }
        closeArchContextMenu();
      });
    }

    // 3.5 Copy Block Action
    const ctxCopyNodeBtn = document.getElementById('ctx-action-copy');
    if (ctxCopyNodeBtn) {
      ctxCopyNodeBtn.addEventListener('click', () => {
        if (archState.contextMenuTarget && archState.contextMenuTarget.type === 'node') {
          copyArchItem('node', archState.contextMenuTarget.id);
        }
        closeArchContextMenu();
      });
    }

    // 4. Duplicate Block Action
    const dupBtn = document.getElementById('ctx-action-duplicate');
    if (dupBtn) {
      dupBtn.addEventListener('click', () => {
        if (archState.contextMenuTarget && archState.contextMenuTarget.type === 'node') {
          duplicateArchItem('node', archState.contextMenuTarget.id);
        }
        closeArchContextMenu();
      });
    }

    // 5. Delete Block Action
    const delNodeBtn = document.getElementById('ctx-action-delete-node');
    if (delNodeBtn) {
      delNodeBtn.addEventListener('click', () => {
        if (archState.contextMenuTarget && archState.contextMenuTarget.type === 'node') {
          deleteArchNode(archState.contextMenuTarget.id);
        }
        closeArchContextMenu();
      });
    }

    // 6. Line Label input and set button
    const edgeLabelInput = document.getElementById('ctx-edge-label-input');
    const edgeLabelSave = document.getElementById('ctx-edge-label-save');
    if (edgeLabelSave && edgeLabelInput) {
      edgeLabelSave.addEventListener('click', () => {
        if (archState.contextMenuTarget && archState.contextMenuTarget.type === 'edge') {
          const edge = archState.edges.find(e => e.id === archState.contextMenuTarget.id);
          if (edge) {
            pushArchHistory();
            edge.label = edgeLabelInput.value.trim();
            renderArchEdges();
            showToast('Line annotation updated!');
          }
        }
        closeArchContextMenu();
      });
      edgeLabelInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') edgeLabelSave.click();
      });
    }

    // 7. Line Direction Chips
    ctxMenu.querySelectorAll('[data-dir]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (archState.contextMenuTarget && archState.contextMenuTarget.type === 'edge') {
          const edge = archState.edges.find(e => e.id === archState.contextMenuTarget.id);
          if (edge) {
            pushArchHistory();
            edge.direction = btn.dataset.dir;
            renderArchEdges();
            showToast(`Line direction set to ${btn.dataset.dir}`);
          }
        }
        closeArchContextMenu();
      });
    });

    // 8. Line Style Chips (Solid, Dashed, Dotted)
    ctxMenu.querySelectorAll('[data-style]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (archState.contextMenuTarget && archState.contextMenuTarget.type === 'edge') {
          const edge = archState.edges.find(e => e.id === archState.contextMenuTarget.id);
          if (edge) {
            pushArchHistory();
            edge.style = btn.dataset.style;
            edge.dashed = (btn.dataset.style === 'dashed');
            renderArchEdges();
            showToast(`Line style set to ${btn.dataset.style}`);
          }
        }
        closeArchContextMenu();
      });
    });

    // 9. Line Color Swatches
    ctxMenu.querySelectorAll('#ctx-edge-colors .ctx-color-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        if (archState.contextMenuTarget && archState.contextMenuTarget.type === 'edge') {
          const edge = archState.edges.find(e => e.id === archState.contextMenuTarget.id);
          if (edge) {
            pushArchHistory();
            edge.color = sw.dataset.edgeColor;
            renderArchEdges();
            showToast('Line color updated!');
          }
        }
        closeArchContextMenu();
      });
    });

    // 10. Delete Line Action
    const delEdgeBtn = document.getElementById('ctx-action-delete-edge');
    if (delEdgeBtn) {
      delEdgeBtn.addEventListener('click', () => {
        if (archState.contextMenuTarget && archState.contextMenuTarget.type === 'edge') {
          pushArchHistory();
          archState.edges = archState.edges.filter(e => e.id !== archState.contextMenuTarget.id);
          archState.selectedEdgeId = null;
          renderArchEdges();
          showToast('Connecting line deleted');
        }
        closeArchContextMenu();
      });
    }

    // 11. Canvas Add Shape Choices
    ctxMenu.querySelectorAll('[data-add-shape]').forEach(btn => {
      btn.addEventListener('click', () => {
        const shape = btn.dataset.addShape;
        const rect = viewport.getBoundingClientRect();
        let posX = 120, posY = 120;
        if (archState.contextMenuTarget && archState.contextMenuTarget.clientX) {
          posX = (archState.contextMenuTarget.clientX - rect.left - archState.panX) / archState.zoom;
          posY = (archState.contextMenuTarget.clientY - rect.top - archState.panY) / archState.zoom;
        }
        if (shape === 'cluster') {
          addArchCluster('Boundary Group', posX, posY);
        } else {
          addArchNode(`New ${shape.charAt(0).toUpperCase() + shape.slice(1)}`, shape, posX, posY);
        }
        closeArchContextMenu();
      });
    });

    // 11.5 Canvas Paste Action
    const ctxPasteBtn = document.getElementById('ctx-action-paste');
    if (ctxPasteBtn) {
      ctxPasteBtn.addEventListener('click', () => {
        const rect = viewport.getBoundingClientRect();
        let posX, posY;
        if (archState.contextMenuTarget && archState.contextMenuTarget.clientX !== undefined) {
          posX = (archState.contextMenuTarget.clientX - rect.left - archState.panX) / archState.zoom;
          posY = (archState.contextMenuTarget.clientY - rect.top - archState.panY) / archState.zoom;
        }
        pasteArchItem(posX, posY);
        closeArchContextMenu();
      });
    }

    // 12. Canvas Center View
    const centerBtn = document.getElementById('ctx-action-center-view');
    if (centerBtn) {
      centerBtn.addEventListener('click', () => {
        archState.zoom = 1.0;
        archState.panX = 60;
        archState.panY = 60;
        updateArchTransform();
        closeArchContextMenu();
      });
    }
  }

  // Close context menu on outside click or escape
  window.addEventListener('click', (e) => {
    if (!e.target.closest('#arch-context-menu')) {
      closeArchContextMenu();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeArchContextMenu();
  });

  // Toolbar button handlers
  const linkDirSelect = document.getElementById('arch-link-dir-select');
  if (linkDirSelect) {
    linkDirSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (archState.selectedEdgeId) {
        const edge = archState.edges.find(ed => ed.id === archState.selectedEdgeId);
        if (edge) {
          pushArchHistory();
          if (val === 'dashed') {
            edge.dashed = true;
            edge.style = 'dashed';
            edge.direction = 'uni';
          } else if (val === 'dotted') {
            edge.dashed = false;
            edge.style = 'dotted';
            edge.direction = 'uni';
          } else {
            edge.dashed = false;
            edge.style = 'solid';
            edge.direction = val;
          }
          renderArchEdges();
          showToast(`Link set to ${val}`);
        }
      }
    });
  }

  const shapeSelect = document.getElementById('arch-node-type-select');
  if (shapeSelect) {
    shapeSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (archState.selectedNodeId) {
        const node = archState.nodes.find(n => n.id === archState.selectedNodeId);
        if (node) {
          pushArchHistory();
          node.type = val;
          renderArchWorld();
          showToast(`Block shape set to ${val}`);
        }
      }
    });
  }

  const btnAdd = document.getElementById('arch-add-node');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      const typeSelect = document.getElementById('arch-node-type-select');
      const type = typeSelect ? typeSelect.value : 'rectangle';
      addArchNode(`New ${type.charAt(0).toUpperCase() + type.slice(1)}`, type);
    });
  }

  const btnAddCluster = document.getElementById('arch-add-cluster');
  if (btnAddCluster) {
    btnAddCluster.addEventListener('click', () => {
      addArchCluster();
    });
  }

  const btnDel = document.getElementById('arch-delete-selected');
  if (btnDel) {
    btnDel.addEventListener('click', deleteSelectedArchItem);
  }

  const btnCopy = document.getElementById('arch-copy');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => copyArchItem());
  }

  const btnPaste = document.getElementById('arch-paste');
  if (btnPaste) {
    btnPaste.addEventListener('click', () => pasteArchItem());
  }

  const btnUndo = document.getElementById('arch-undo');
  if (btnUndo) btnUndo.addEventListener('click', undoArch);

  const btnRedo = document.getElementById('arch-redo');
  if (btnRedo) btnRedo.addEventListener('click', redoArch);

  const btnAutoLayout = document.getElementById('arch-auto-layout');
  if (btnAutoLayout) btnAutoLayout.addEventListener('click', autoArrangeArch);

  const btnExportPNG = document.getElementById('arch-export-png');
  if (btnExportPNG) btnExportPNG.addEventListener('click', exportArchAsPNG);

  const btnExportSVG = document.getElementById('arch-export-svg');
  if (btnExportSVG) btnExportSVG.addEventListener('click', exportArchAsSVG);

  const btnExportMermaid = document.getElementById('arch-export-mermaid');
  if (btnExportMermaid) {
    btnExportMermaid.addEventListener('click', () => {
      const code = exportArchToMermaid();
      navigator.clipboard.writeText(code).then(() => {
        showToast('Mermaid diagram copied to clipboard!');
      });
    });
  }

  const btnUpdateDoc = document.getElementById('arch-update-doc');
  if (btnUpdateDoc) {
    btnUpdateDoc.addEventListener('click', updateDiagramInDoc);
  }

  const btnInsert = document.getElementById('arch-insert-doc');
  if (btnInsert) {
    btnInsert.addEventListener('click', insertDiagramAsNew);
  }

  const diagramSelect = document.getElementById('arch-diagram-select');
  if (diagramSelect) {
    diagramSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value);
      state.activeDiagramIndex = idx;
      if (idx >= 0) {
        const diagrams = findMermaidDiagrams(state.rawContent);
        if (diagrams[idx]) {
          loadMermaidIntoArch(diagrams[idx].code);
          showToast(`Switched to Diagram #${idx + 1}`);
        }
      } else {
        archState.nodes = [];
        archState.edges = [];
        addArchNode('Component 1', 'rectangle', 100, 100);
        addArchNode('Database 1', 'database', 350, 100);
        renderArchWorld();
        showToast('Created new blank diagram');
      }
      updateDiagramSelector();
    });
  }

  const btnResetView = document.getElementById('arch-reset-view');
  if (btnResetView) {
    btnResetView.addEventListener('click', () => {
      archState.zoom = 1.0;
      archState.panX = 60;
      archState.panY = 60;
      updateArchTransform();
    });
  }

  const btnZoomIn = document.getElementById('arch-zoom-in');
  const btnZoomOut = document.getElementById('arch-zoom-out');
  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      archState.zoom = Math.min(2.5, archState.zoom + 0.15);
      updateArchTransform();
    });
  }
  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      archState.zoom = Math.max(0.4, archState.zoom - 0.15);
      updateArchTransform();
    });
  }

  setupArchBlockSearch();
}

function initArchStudio() {
  if (!archState.isInitialized) {
    archState.isInitialized = true;
    setupMovableToolbar();
    setupArchInteractions();
  }
  updateDiagramSelector();
  renderArchWorld();
}

// ========================================================
// Standalone HTML Document Exporter
// ========================================================
function exportDocumentAsHTML() {
  const { frontmatter, content } = parseFrontmatter(state.rawContent);
  const bodyHtml = processMarkdown(content);

  let frontmatterHtml = '';
  if (frontmatter && Object.keys(frontmatter).length > 0) {
    frontmatterHtml = `
    <div style="margin-bottom: 24px; padding: 16px 20px; border: 1px solid var(--color-border-default); border-radius: 6px; background-color: var(--color-canvas-subtle);">
      <h4 style="margin: 0 0 10px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-accent-fg);">Document Metadata</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 12px 20px; font-size: 12px;">
        ${Object.entries(frontmatter).map(([k, v]) => `<div><strong>${k}:</strong> ${Array.isArray(v) ? v.join(', ') : v}</div>`).join('')}
      </div>
    </div>`;
  }

  const completeHtml = `<!DOCTYPE html>
<html lang="en" data-theme="${state.theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${state.fileName}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    :root {
      --color-canvas-default: ${state.theme === 'light' ? '#ffffff' : '#0d1117'};
      --color-canvas-subtle: ${state.theme === 'light' ? '#f6f8fa' : '#161b22'};
      --color-border-default: ${state.theme === 'light' ? '#d0d7de' : '#30363d'};
      --color-fg-default: ${state.theme === 'light' ? '#1f2328' : '#e6edf3'};
      --color-accent-fg: #58a6ff;
    }
    body {
      background-color: var(--color-canvas-default);
      color: var(--color-fg-default);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      padding: 40px 20px;
      margin: 0;
    }
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
      background-color: var(--color-canvas-default);
      border: 1px solid var(--color-border-default);
      border-radius: 8px;
    }
    @media (max-width: 767px) {
      .markdown-body { padding: 15px; }
    }
  </style>
</head>
<body class="markdown-body">
  ${frontmatterHtml}
  ${bodyHtml}
</body>
</html>`;

  const blob = new Blob([completeHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = state.fileName.replace(/\.md$/i, '') + '.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported ${a.download}`);
}

// ========================================================
// Presentation / Slide Deck Mode Engine
// ========================================================
const slidesState = {
  slides: [],
  currentIndex: 0,
  isActive: false
};

function splitIntoSlides(markdown) {
  const { content } = parseFrontmatter(markdown);
  let parts = content.split(/(?:^|\n)\s*---\s*(?:\n|$)/).map(s => s.trim()).filter(Boolean);
  if (parts.length <= 1) {
    const headingSplit = content.split(/(?=(?:^|\n)#{1,2}\s)/).map(s => s.trim()).filter(Boolean);
    if (headingSplit.length > 1) {
      parts = headingSplit;
    }
  }
  return parts.length > 0 ? parts : [content];
}

function startPresentation() {
  const slides = splitIntoSlides(state.rawContent);
  slidesState.slides = slides;
  slidesState.currentIndex = 0;
  slidesState.isActive = true;

  const overlay = document.getElementById('presentation-overlay');
  if (overlay) overlay.style.display = 'flex';

  const docTitle = document.getElementById('presentation-doc-title');
  if (docTitle) docTitle.textContent = state.fileName;

  showSlide(0);
}

function exitPresentation() {
  slidesState.isActive = false;
  const overlay = document.getElementById('presentation-overlay');
  if (overlay) overlay.style.display = 'none';
}

function showSlide(index) {
  if (index < 0 || index >= slidesState.slides.length) return;
  slidesState.currentIndex = index;

  const slideBody = document.getElementById('presentation-slide-body');
  if (slideBody) {
    slideBody.innerHTML = processMarkdown(slidesState.slides[index]);
    postProcessDOM(slideBody);
  }

  const counter = document.getElementById('presentation-slide-counter');
  if (counter) counter.textContent = `Slide ${index + 1} of ${slidesState.slides.length}`;

  const bar = document.getElementById('presentation-progress-bar');
  if (bar) bar.style.width = `${((index + 1) / slidesState.slides.length) * 100}%`;
}

function nextSlide() {
  if (slidesState.currentIndex < slidesState.slides.length - 1) {
    showSlide(slidesState.currentIndex + 1);
  }
}

function prevSlide() {
  if (slidesState.currentIndex > 0) {
    showSlide(slidesState.currentIndex - 1);
  }
}

// Setup Event Listeners & Global Shortcuts
function setupEventListeners() {
  const btnOutline = document.getElementById('btn-toggle-outline');
  const btnCloseOutline = document.getElementById('btn-close-outline');
  const outlineSidebar = document.getElementById('outline-sidebar');

  const toggleOutline = () => {
    if (outlineSidebar) {
      outlineSidebar.classList.toggle('collapsed');
      const isExpanded = !outlineSidebar.classList.contains('collapsed');
      if (btnOutline) btnOutline.classList.toggle('active', isExpanded);
    }
  };

  if (btnOutline) btnOutline.addEventListener('click', toggleOutline);
  if (btnCloseOutline) btnCloseOutline.addEventListener('click', toggleOutline);

  // View switchers
  const btnPreview = document.getElementById('btn-view-preview');
  const btnCode = document.getElementById('btn-view-code');
  const btnSplit = document.getElementById('btn-view-split');
  const btnArch = document.getElementById('btn-view-arch');
  const btnSlides = document.getElementById('btn-view-slides');

  if (btnPreview) btnPreview.addEventListener('click', () => switchView('preview'));
  if (btnCode) btnCode.addEventListener('click', () => switchView('code'));
  if (btnSplit) btnSplit.addEventListener('click', () => switchView('split'));
  if (btnArch) btnArch.addEventListener('click', () => switchView('arch'));
  if (btnSlides) btnSlides.addEventListener('click', startPresentation);

  // Document Zoom buttons
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnZoomReset = document.getElementById('btn-zoom-reset');

  if (btnZoomIn) btnZoomIn.addEventListener('click', () => applyDocZoom(0.1));
  if (btnZoomOut) btnZoomOut.addEventListener('click', () => applyDocZoom(-0.1));
  if (btnZoomReset) btnZoomReset.addEventListener('click', resetDocZoom);

  // Save Document to Disk
  const btnSave = document.getElementById('btn-save-doc');
  if (btnSave) btnSave.addEventListener('click', saveCurrentFile);

  // Export HTML button
  const btnExportHtml = document.getElementById('btn-export-html');
  if (btnExportHtml) btnExportHtml.addEventListener('click', exportDocumentAsHTML);

  // Recent Files Dropdown
  const recentDropdown = document.getElementById('recent-dropdown');
  const btnRecent = document.getElementById('btn-recent-files');
  if (btnRecent && recentDropdown) {
    btnRecent.addEventListener('click', (e) => {
      e.stopPropagation();
      recentDropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      recentDropdown.classList.remove('open');
    });
  }

  // Presentation Mode Header & Controls
  const btnPresPrev = document.getElementById('btn-pres-prev');
  const btnPresNext = document.getElementById('btn-pres-next');
  const btnPresExit = document.getElementById('btn-pres-exit');

  if (btnPresPrev) btnPresPrev.addEventListener('click', prevSlide);
  if (btnPresNext) btnPresNext.addEventListener('click', nextSlide);
  if (btnPresExit) btnPresExit.addEventListener('click', exitPresentation);

  // Action Buttons
  const btnCopy = document.getElementById('btn-copy-raw');
  if (btnCopy) btnCopy.addEventListener('click', copyRawContent);

  const btnOpen = document.getElementById('btn-open-file');
  if (btnOpen) btnOpen.addEventListener('click', () => postToPython('openFileDialog'));

  const btnPrint = document.getElementById('btn-print');
  if (btnPrint) btnPrint.addEventListener('click', () => window.print());

  // Search Bar
  const btnSearch = document.getElementById('btn-search');
  if (btnSearch) btnSearch.addEventListener('click', () => toggleSearch());

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => performSearch(e.target.value));
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (e.shiftKey) prevSearchMatch();
        else nextSearchMatch();
      } else if (e.key === 'Escape') {
        toggleSearch(false);
      }
    });
  }

  const btnSearchNext = document.getElementById('btn-search-next');
  const btnSearchPrev = document.getElementById('btn-search-prev');
  const btnSearchClose = document.getElementById('btn-search-close');

  if (btnSearchNext) btnSearchNext.addEventListener('click', nextSearchMatch);
  if (btnSearchPrev) btnSearchPrev.addEventListener('click', prevSearchMatch);
  if (btnSearchClose) btnSearchClose.addEventListener('click', () => toggleSearch(false));

  // Theme Dropdown
  const themeDropdown = document.getElementById('theme-dropdown');
  const btnTheme = document.getElementById('btn-theme-dropdown');

  if (btnTheme && themeDropdown) {
    btnTheme.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      themeDropdown.classList.remove('open');
    });

    document.querySelectorAll('.theme-option').forEach(opt => {
      opt.addEventListener('click', () => {
        setTheme(opt.dataset.theme);
        themeDropdown.classList.remove('open');
      });
    });
  }

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Presentation Mode Active Shortcuts
    if (slidesState.isActive) {
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(e.key) || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        nextSlide();
        return;
      }
      if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key) || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        prevSlide();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        exitPresentation();
        return;
      }
    }

    // Toggle Presentation Mode: Ctrl+Shift+P
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      if (slidesState.isActive) exitPresentation();
      else startPresentation();
      return;
    }

    // Save shortcut: Ctrl+S
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveCurrentFile();
      return;
    }

    // Studio Undo / Redo / Copy / Paste / Duplicate
    if (state.currentView === 'arch') {
      const isEditingText = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redoArch();
        else undoArch();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redoArch();
        return;
      }
      if (!isEditingText) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && !e.shiftKey) {
          e.preventDefault();
          copyArchItem();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && !e.shiftKey) {
          e.preventDefault();
          pasteArchItem();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && !e.shiftKey) {
          e.preventDefault();
          duplicateArchItem();
          return;
        }
      }
    }

    // Zoom shortcuts
    if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
      e.preventDefault();
      applyDocZoom(0.1);
    } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault();
      applyDocZoom(-0.1);
    } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
      e.preventDefault();
      resetDocZoom();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      toggleSearch();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
      e.preventDefault();
      postToPython('openFileDialog');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      window.print();
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      copyRawContent();
    } else if ((e.ctrlKey || e.metaKey) && e.key === '1') {
      e.preventDefault();
      switchView('preview');
    } else if ((e.ctrlKey || e.metaKey) && e.key === '2') {
      e.preventDefault();
      switchView('code');
    } else if ((e.ctrlKey || e.metaKey) && e.key === '3') {
      e.preventDefault();
      switchView('split');
    } else if ((e.ctrlKey || e.metaKey) && e.key === '4') {
      e.preventDefault();
      switchView('arch');
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
      e.preventDefault();
      toggleOutline();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (state.currentView === 'arch' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        deleteSelectedArchItem();
      }
    }
  });

  setupCodeEditors();
  setupSplitScrollSync();
  setupSplitGutter();
  setupWindowResizeHandlers();
}

// ========================================================
// Welcome Screen (md viewer Brand & First-Time Prompt)
// ========================================================
function showWelcomeScreen() {
  const ws = document.getElementById('welcome-screen');
  if (ws) ws.style.display = 'flex';
}

function hideWelcomeScreen() {
  const ws = document.getElementById('welcome-screen');
  if (ws) ws.style.display = 'none';
}

function setupWelcomeScreen() {
  const btnOpen = document.getElementById('welcome-open-file');
  const btnNew = document.getElementById('welcome-new-file');
  const btnSample = document.getElementById('welcome-open-sample');
  const dropzone = document.getElementById('welcome-dropzone');

  if (btnOpen) {
    btnOpen.addEventListener('click', () => postToPython('openFileDialog'));
  }

  if (btnNew) {
    btnNew.addEventListener('click', () => {
      hideWelcomeScreen();
      setContent('# New Document\n\nStart writing here...', 'Untitled.md');
      switchView('preview');
      showToast('Created new blank document');
    });
  }

  if (btnSample) {
    btnSample.addEventListener('click', () => {
      hideWelcomeScreen();
      fetch('../sample.md')
        .then(r => r.ok ? r.text() : Promise.reject())
        .then(text => setContent(text, 'sample.md'))
        .catch(() => {
          setContent('# Welcome to md viewer\n\nStart exploring.', 'Welcome.md');
        });
    });
  }

  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          hideWelcomeScreen();
          setContent(event.target.result, file.name);
          showToast(`Loaded ${file.name}`);
        };
        reader.readAsText(file);
      }
    });
  }
}

// ========================================================
// Google Docs / MS Word Document Layout & Formatting Ribbon
// ========================================================
function htmlToMarkdown(html) {
  const div = document.createElement('div');
  div.innerHTML = html;

  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue;
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName.toLowerCase();
    const children = Array.from(node.childNodes).map(traverse).join('');

    if (tag === 'h1') return `\n# ${children.trim()}\n\n`;
    if (tag === 'h2') return `\n## ${children.trim()}\n\n`;
    if (tag === 'h3') return `\n### ${children.trim()}\n\n`;
    if (tag === 'h4') return `\n#### ${children.trim()}\n\n`;
    if (tag === 'p') return `\n${children.trim()}\n\n`;
    if (tag === 'strong' || tag === 'b') return `**${children}**`;
    if (tag === 'em' || tag === 'i') return `*${children}*`;
    if (tag === 'u') return `<u>${children}</u>`;
    if (tag === 's' || tag === 'strike' || tag === 'del') return `~~${children}~~`;
    if (tag === 'code') return `\`${children}\``;
    if (tag === 'pre') return `\n\`\`\`\n${children.trim()}\n\`\`\`\n\n`;
    if (tag === 'blockquote') return `\n> ${children.trim()}\n\n`;
    if (tag === 'ul') return `\n${children}\n`;
    if (tag === 'ol') {
      let idx = 1;
      return '\n' + Array.from(node.children).map(li => `${idx++}. ${traverse(li).trim()}`).join('\n') + '\n\n';
    }
    if (tag === 'li') return `- ${children.trim()}\n`;
    if (tag === 'hr') return `\n---\n\n`;
    if (tag === 'br') return '\n';
    if (tag === 'table') {
      const rows = Array.from(node.querySelectorAll('tr'));
      if (rows.length === 0) return '';
      let mdTable = '\n';
      rows.forEach((r, rIdx) => {
        const cells = Array.from(r.querySelectorAll('th, td')).map(c => traverse(c).trim());
        mdTable += `| ${cells.join(' | ')} |\n`;
        if (rIdx === 0) {
          mdTable += `| ${cells.map(() => '---').join(' | ')} |\n`;
        }
      });
      return mdTable + '\n';
    }
    return children;
  }

  let md = traverse(div).trim();
  return md.replace(/\n{3,}/g, '\n\n');
}

function setupPreviewDocEditor() {
  const editToggleBtn = document.getElementById('btn-toggle-doc-edit');
  const pageToggleBtn = document.getElementById('btn-toggle-page-layout');
  const previewEl = document.getElementById('markdown-preview');
  const pageContainer = document.getElementById('doc-page-container');
  const docToolbar = document.getElementById('doc-toolbar');
  if (!editToggleBtn || !previewEl) return;

  let isDocEditMode = false;
  let isPaperMode = false;

  // Toggle Edit Mode
  editToggleBtn.addEventListener('click', () => {
    isDocEditMode = !isDocEditMode;
    editToggleBtn.classList.toggle('active', isDocEditMode);
    previewEl.contentEditable = isDocEditMode ? 'true' : 'false';
    if (docToolbar) docToolbar.style.display = isDocEditMode ? 'flex' : 'none';
    const textSpan = document.getElementById('btn-toggle-doc-edit-text');
    if (textSpan) textSpan.textContent = isDocEditMode ? 'Done Editing' : 'Edit Document';

    if (isDocEditMode) {
      previewEl.focus();
      showToast('Live Document Edit mode active (Google Docs / Word style)');
    } else {
      showToast('Saved document changes');
    }
  });

  // Toggle Paper Page View (Google Docs / Word page layout)
  if (pageToggleBtn && pageContainer) {
    pageToggleBtn.addEventListener('click', () => {
      isPaperMode = !isPaperMode;
      pageToggleBtn.classList.toggle('active', isPaperMode);
      pageContainer.classList.toggle('paper-mode', isPaperMode);
      const textSpan = document.getElementById('btn-toggle-page-layout-text');
      if (textSpan) textSpan.textContent = isPaperMode ? 'Web View' : 'Paper View';
      showToast(isPaperMode ? 'Switched to Paper Page layout (Word / Docs)' : 'Switched to Full Web layout');
    });
  }

  // Formatting Ribbon Commands
  const formatCmd = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    previewEl.focus();
    syncPreviewHtmlToMarkdown();
  };

  document.getElementById('doc-tool-bold')?.addEventListener('click', () => formatCmd('bold'));
  document.getElementById('doc-tool-italic')?.addEventListener('click', () => formatCmd('italic'));
  document.getElementById('doc-tool-underline')?.addEventListener('click', () => formatCmd('underline'));
  document.getElementById('doc-tool-strike')?.addEventListener('click', () => formatCmd('strikeThrough'));
  document.getElementById('doc-tool-ul')?.addEventListener('click', () => formatCmd('insertUnorderedList'));
  document.getElementById('doc-tool-ol')?.addEventListener('click', () => formatCmd('insertOrderedList'));
  document.getElementById('doc-tool-align-left')?.addEventListener('click', () => formatCmd('justifyLeft'));
  document.getElementById('doc-tool-align-center')?.addEventListener('click', () => formatCmd('justifyCenter'));
  document.getElementById('doc-tool-hr')?.addEventListener('click', () => formatCmd('insertHorizontalRule'));

  const headingSelect = document.getElementById('doc-tool-heading');
  if (headingSelect) {
    headingSelect.addEventListener('change', (e) => {
      formatCmd('formatBlock', `<${e.target.value}>`);
    });
  }

  const tableBtn = document.getElementById('doc-tool-table');
  if (tableBtn) {
    tableBtn.addEventListener('click', () => {
      const tableHtml = `
        <table>
          <thead><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr></thead>
          <tbody>
            <tr><td>Cell 1</td><td>Cell 2</td><td>Cell 3</td></tr>
            <tr><td>Cell 4</td><td>Cell 5</td><td>Cell 6</td></tr>
          </tbody>
        </table><p><br></p>
      `;
      document.execCommand('insertHTML', false, tableHtml);
      syncPreviewHtmlToMarkdown();
    });
  }

  // Sync content back to rawContent and Code Editor on typing in Preview
  let syncTimer = null;
  const syncPreviewHtmlToMarkdown = () => {
    const newMarkdown = htmlToMarkdown(previewEl.innerHTML);
    state.rawContent = newMarkdown;
    const rawEditor = document.getElementById('raw-code-editor');
    const splitEditor = document.getElementById('split-code-editor');
    if (rawEditor && rawEditor.value !== newMarkdown) rawEditor.value = newMarkdown;
    if (splitEditor && splitEditor.value !== newMarkdown) splitEditor.value = newMarkdown;
    updateStats(newMarkdown, state.filePath);
    updateDiagramSelector();
  };

  previewEl.addEventListener('input', () => {
    if (!isDocEditMode) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncPreviewHtmlToMarkdown, 400);
  });
}

// Window Bridge Handlers
window.appBridgeReceive = function (payload) {
  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (data.action === 'loadFile') {
      state.fileDir = data.dir || '';
      setContent(data.content, data.path, false);
      showToast(`Loaded ${state.fileName}`);
    } else if (data.action === 'showWelcome') {
      showWelcomeScreen();
    } else if (data.action === 'fileChanged') {
      setContent(data.content, state.filePath, true);
      showToast('Live updated from file change', 1800);
    } else if (data.action === 'saveSuccess') {
      showToast(`Saved to ${state.fileName}!`);
    } else if (data.action === 'saveError') {
      showToast(`Save error: ${data.error}`, 4000);
    } else if (data.action === 'setTheme') {
      setTheme(data.theme);
    }
  } catch (err) {
    console.error('Error in appBridgeReceive:', err);
  }
};

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('mdviewer_theme') || 'dark';
  setTheme(savedTheme);

  renderRecentFiles();
  setupEventListeners();
  setupWelcomeScreen();
  setupPreviewDocEditor();

  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(event.target.result, file.name);
        showToast(`Loaded ${file.name}`);
      };
      reader.readAsText(file);
    }
  });

  if (!window.webkit || !window.webkit.messageHandlers || !window.webkit.messageHandlers.appBridge) {
    fetch('../sample.md')
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(text => setContent(text, 'sample.md'))
      .catch(() => {
        showWelcomeScreen();
      });
  }

  // Support URL query parameters for view and theme
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('theme')) {
    setTheme(urlParams.get('theme'));
  }
  if (urlParams.get('welcome') === 'true') {
    showWelcomeScreen();
  } else if (urlParams.get('view')) {
    if (urlParams.get('view') === 'slides') {
      setTimeout(() => startPresentation(), 200);
    } else {
      switchView(urlParams.get('view'));
    }
  }
  if (urlParams.get('recent') === 'open') {
    setTimeout(() => {
      const dropdown = document.getElementById('recent-dropdown');
      if (dropdown) dropdown.classList.add('open');
    }, 200);
  }

  postToPython('ready');
});
