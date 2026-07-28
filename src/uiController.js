/* ─── UI CONTROLLER ────────────────────────────────────────────── */
let isMenuOpen = false;
function toggleMenu() {
  const menu = document.getElementById('tools-menu');
  isMenuOpen = !isMenuOpen;
  if (isMenuOpen) {
    menu.style.display = 'flex';
    gsap.fromTo(menu, { opacity: 0, y: -10, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" });
  } else {
    gsap.to(menu, { opacity: 0, y: -10, scale: 0.95, duration: 0.2, onComplete: () => menu.style.display = 'none' });
  }
}

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
  const menu = document.getElementById('tools-menu');
  const trigger = document.getElementById('tools-trigger');
  if (menu && trigger) {
    if (isMenuOpen && !menu.contains(e.target) && !trigger.contains(e.target)) {
      toggleMenu();
    }
  }
});

const PRESET_ANCHOS = [
  { label: '160 cm', value: 160 },
  { label: '120 cm', value: 120 },
  { label: '80 cm', value: 80 },
  { label: '40 cm', value: 40 },
  { label: '148 cm', value: 148 },
  { label: '111 cm', value: 111 },
  { label: '74 cm', value: 74 },
  { label: '37 cm', value: 37 },
  { label: '140 cm', value: 140 },
  { label: '105 cm', value: 105 },
  { label: '70 cm', value: 70 },
  { label: 'Otro', value: 'other' }
];

// El cero sólo está disponible para Bobina B de PRENSA, cuando la tirada se hace sólo por A.
const PRESET_ANCHOS_PRENSA_B = [
  { label: '0 cm (sin bobina)', value: 0 },
  ...PRESET_ANCHOS
];

const CONFIG = {
  rotativa: {
    title: "Comercial",
    modes: [{id: 'e2k', label: 'Ejs → Kilos'}, {id: 'k2e', label: 'Kilos → Ejs'}],
    fields: {
      e2k: [
        {id: 'tirada', label: 'Tirada (Ejemplares)', val: 20000},
        {id: 'gramaje', label: 'Gramaje (g/m²)', val: 80},
        {id: 'bobina', label: 'Ancho Bobina (cm)', val: 88},
        {id: 'desarrollo', label: 'Desarrollo (cm)', val: 124, options: [
          { label: 'Lithoman-Kba 124 cm', value: 124 },
          { label: 'Rotoman', value: 63 },
          { label: 'Komori', value: 62 },
          { label: 'Otro', value: 'other' }
        ]},
        {id: 'vueltasArranque', label: 'Arranque (Vueltas)', val: 1500},
        {id: 'perdidoPct', label: '% Perdido (Merma)', val: 8},
        {id: 'efectos', label: 'Efectos', val: 1},
        {id: 'pliegos', label: 'Pliegos', val: 1}
      ],
      k2e: [
        {id: 'kilos', label: 'Kilos Disponibles', val: 1000},
        {id: 'gramaje', label: 'Gramaje (g/m²)', val: 80},
        {id: 'bobina', label: 'Ancho Bobina (cm)', val: 88},
        {id: 'desarrollo', label: 'Desarrollo (cm)', val: 124, options: [
          { label: 'Lithoman-Kba 124 cm', value: 124 },
          { label: 'Rotoman', value: 63 },
          { label: 'Komori', value: 62 },
          { label: 'Otro', value: 'other' }
        ]},
        {id: 'perdidoPct', label: '% Perdido (Merma)', val: 8},
        {id: 'arranque', label: 'Arranque (Vueltas)', val: 1500},
        {id: 'efectos', label: 'Efectos', val: 1},
        {id: 'pliegos', label: 'Pliegos', val: 1}
      ]
    }
  },
  plano: {
    title: "Pliego",
    modes: [{id: 'p2k', label: 'Pliegos → Kilos'}, {id: 'k2p', label: 'Kilos → Pliegos'}],
    fields: {
      p2k: [
        {id: 'pliegos', label: 'Cantidad Pliegos', val: 5000},
        {id: 'alto', label: 'Alto Hoja (cm)', val: 100},
        {id: 'ancho', label: 'Ancho Hoja (cm)', val: 70},
        {id: 'gramaje', label: 'Gramaje (g/m²)', val: 115}
      ],
      k2p: [
        {id: 'kilos', label: 'Kilos Totales', val: 250},
        {id: 'alto', label: 'Alto Hoja (cm)', val: 100},
        {id: 'ancho', label: 'Ancho Hoja (cm)', val: 70},
        {id: 'gramaje', label: 'Gramaje (g/m²)', val: 115}
      ]
    }
  },
  prensa: {
    title: "Prensa",
    modes: [{id: 'e2k', label: 'Ejs → Kilos'}, {id: 'k2e', label: 'Kilos → Ejs'}],
    fields: {
      e2k: [
        {id: 'tirada', label: 'Tirada (Ejs)', val: 15000},
        {id: 'paginas', label: 'Páginas Totales', val: 32, options: [
          {label: '64', value: 64}, {label: '48', value: 48}, {label: '40', value: 40}, 
          {label: '36', value: 36}, {label: '32', value: 32}, {label: '24', value: 24}, 
          {label: '20', value: 20}, {label: '12', value: 12}, {label: '8', value: 8}, {label: 'Otro', value: 'other'}
        ]},
        {id: 'gramaje', label: 'Gramaje (g/m²)', val: 48.8, options: [
          {label: '48,8', value: 48.8}, {label: '40', value: 40}, {label: '36', value: 36}, {label: 'Otro', value: 'other'}
        ]},
        {id: 'desarrollo', label: 'Desarrollo (cm)', val: 28.9, options: [
          { label: 'Wifag-Kba Comet', value: 28.9 },
          { label: 'Colorman', value: 25.5 },
          { label: 'Otro', value: 'other' }
        ]},
        {id: 'altoPagina', label: 'Alto Pág (cm)', val: 40, options: [
          {label: '40', value: 40}, {label: '37', value: 37}, {label: 'Otro', value: 'other'}
        ]},
        {id: 'arranque', label: 'Arranque (Ejs)', val: 5000},
        {id: 'perdidoPct', label: '% Perdido', val: 7.5},
        {id: 'versiones', label: 'Arranques Versión', val: 1},
        {id: 'bobinaA_ancho', label: 'Ancho Bobina A (cm)', val: 160, group: 'A', options: PRESET_ANCHOS},
        {id: 'bobinaA_web', label: 'Torres', val: 1, group: 'A', options: [
          {label: '1', value: 1}, {label: '2', value: 2}, {label: '3', value: 3}, 
          {label: '4', value: 4}, {label: '5', value: 5}, {label: 'Otro', value: 'other'}
        ]},
        {id: 'bobinaA_efectos', label: 'Efectos', val: 2, group: 'A', options: [
          {label: '1', value: 1}, {label: '2', value: 2}
        ]},
        {id: 'bobinaB_ancho', label: 'Ancho Bobina B (cm)', val: 80, group: 'B', options: PRESET_ANCHOS_PRENSA_B},
        {id: 'bobinaB_web', label: 'Torres', val: 1, group: 'B', options: [
          {label: '1', value: 1}, {label: '2', value: 2}, {label: '3', value: 3}, 
          {label: '4', value: 4}, {label: '5', value: 5}, {label: 'Otro', value: 'other'}
        ]},
        {id: 'bobinaB_efectos', label: 'Efectos', val: 2, group: 'B', options: [
          {label: '1', value: 1}, {label: '2', value: 2}
        ]}
      ],
      k2e: [
        {id: 'kilosTotal', label: 'Kilos Totales', val: 850},
        {id: 'paginas', label: 'Páginas Totales', val: 32, options: [
          {label: '64', value: 64}, {label: '48', value: 48}, {label: '40', value: 40}, 
          {label: '36', value: 36}, {label: '32', value: 32}, {label: '24', value: 24}, 
          {label: '20', value: 20}, {label: '12', value: 12}, {label: '8', value: 8}, {label: 'Otro', value: 'other'}
        ]},
        {id: 'gramaje', label: 'Gramaje (g/m²)', val: 48.8, options: [
          {label: '48,8', value: 48.8}, {label: '40', value: 40}, {label: '36', value: 36}, {label: 'Otro', value: 'other'}
        ]},
        {id: 'desarrollo', label: 'Desarrollo (cm)', val: 28.9, options: [
          { label: 'Wifag-Kba Comet', value: 28.9 },
          { label: 'Colorman', value: 25.5 },
          { label: 'Otro', value: 'other' }
        ]},
        {id: 'altoPagina', label: 'Alto Pág (cm)', val: 40, options: [
          {label: '40', value: 40}, {label: '37', value: 37}, {label: 'Otro', value: 'other'}
        ]},
        {id: 'arranque', label: 'Arranque (Ejs)', val: 5000},
        {id: 'perdidoPct', label: '% Perdido', val: 7.5},
        {id: 'versiones', label: 'Arranques Versión', val: 1},
        {id: 'bobinaA_ancho', label: 'Ancho Bobina A (cm)', val: 160, group: 'A', options: PRESET_ANCHOS},
        {id: 'bobinaA_web', label: 'Torres', val: 1, group: 'A', options: [
          {label: '1', value: 1}, {label: '2', value: 2}, {label: '3', value: 3}, 
          {label: '4', value: 4}, {label: '5', value: 5}, {label: 'Otro', value: 'other'}
        ]},
        {id: 'bobinaA_efectos', label: 'Efectos', val: 2, group: 'A', options: [
          {label: '1', value: 1}, {label: '2', value: 2}
        ]},
        {id: 'bobinaB_ancho', label: 'Ancho Bobina B (cm)', val: 80, group: 'B', options: PRESET_ANCHOS_PRENSA_B},
        {id: 'bobinaB_web', label: 'Torres', val: 1, group: 'B', options: [
          {label: '1', value: 1}, {label: '2', value: 2}, {label: '3', value: 3}, 
          {label: '4', value: 4}, {label: '5', value: 5}, {label: 'Otro', value: 'other'}
        ]},
        {id: 'bobinaB_efectos', label: 'Efectos', val: 2, group: 'B', options: [
          {label: '1', value: 1}, {label: '2', value: 2}
        ]}
      ]
    }
  },
  publicaciones: {
    title: "Publicaciones",
    modes: [{id: 'std', label: 'Cálculo de Pesos'}],
    fields: {
      std: [
        {id: 'pub_tirada', label: 'Tirada (Ejs)', val: 5000},
        {id: 'pub_ancho', label: 'Ancho Pág (cm)', val: 21},
        {id: 'pub_alto', label: 'Alto Pág (cm)', val: 29.7},
        {id: 'pub_int_paginas', label: 'Págs Interior', val: 64, group: 'int'},
        {id: 'pub_int_gramaje', label: 'Gramaje Interior', val: 80, group: 'int'},
        {id: 'pub_cub_paginas', label: 'Págs Cubierta', val: 4, group: 'cub'},
        {id: 'pub_cub_gramaje', label: 'Gramaje Cubierta', val: 200, group: 'cub'},
        {id: 'pub_por_paginas', label: 'Págs Portadilla', val: 0, group: 'por'},
        {id: 'pub_por_gramaje', label: 'Gramaje Portadilla', val: 0, group: 'por'},
        {id: 'pub_cup_paginas', label: 'Págs Cupón', val: 0, group: 'cup'},
        {id: 'pub_cup_gramaje', label: 'Gramaje Cupón', val: 0, group: 'cup'}
      ]
    }
  }
};

let state = { mod: 'rotativa', mode: 'e2k' };

function switchModule(mod) {
  state.mod = mod;
  state.mode = CONFIG[mod].modes[0].id;
  
  document.querySelectorAll('.tab-btn').forEach(b => {
    const isActive = b.id.includes(mod);
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-selected', isActive);
  });
  
  gsap.to('#module-container', { opacity: 0, y: 10, duration: 0.2, onComplete: render });
}

function switchMode(mode) {
  state.mode = mode;
  gsap.to('#module-container', { opacity: 0, x: -10, duration: 0.2, onComplete: render });
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('suiPress-darkMode', document.body.classList.contains('dark-mode'));
}

if (localStorage.getItem('suiPress-darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

function shareResults() {
  const modData = CONFIG[state.mod];
  const modeData = modData.modes.find(m => m.id === state.mode);
  let text = `SuiPress - Informe: ${modData.title} (${modeData.label})\n\nESPECIFICACIONES:\n`;
  
  const currentFields = modData.fields[state.mode];
  if (currentFields) {
    currentFields.forEach(f => {
      text += `- ${f.label}: ${getFieldValue(f.id)}\n`;
    });
  } else {
    // For single-mode modules like 'publicaciones'
    const defaultFields = modData.fields['std'] || [];
    defaultFields.forEach(f => {
      text += `- ${f.label}: ${getFieldValue(f.id)}\n`;
    });
  }

  text += `\nRESULTADOS:\n`;
  const activeResults = document.querySelectorAll('.results-area .result-block, .results-area .result-card .result-block');
  activeResults.forEach(block => {
    const label = block.querySelector('.result-label')?.innerText;
    const value = block.querySelector('.result-value')?.innerText;
    if (label && value) text += `${label}: ${value}\n`;
  });
  
  text += "\nGenerado por SuiPress Engineering.";
  
  if (navigator.share) {
    navigator.share({ title: 'SuiPress Result', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => alert('Informe completo copiado al portapapeles.'));
  }
}

function exportToPDF() {
  const modData = CONFIG[state.mod];
  const modeData = modData.modes.find(m => m.id === state.mode);
  
  document.getElementById('report-date').innerText = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  document.getElementById('report-id').innerText = `ID: SP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  document.getElementById('report-module-title').innerText = modData.title;
  document.getElementById('report-mode-label').innerText = modeData.label;

  const inputContainer = document.getElementById('report-inputs');
  inputContainer.innerHTML = '';
  
  const activeFields = modData.fields[state.mode] || modData.fields['std'] || [];
  activeFields.forEach(f => {
    let valText = getFieldValue(f.id) || '0';
    if (f.options) {
      const opt = f.options.find(o => o.value == valText);
      if (opt && opt.value !== 'other') valText = opt.label;
    }
    const item = document.createElement('div');
    item.style.display = 'flex'; item.style.justifyContent = 'space-between';
    item.style.fontSize = '12px'; item.style.padding = '4px 0'; item.style.borderBottom = '1px solid #f0f0f0';
    item.innerHTML = `<span style="color: #86868b;">${f.label}</span><span style="font-weight: 600;">${valText}</span>`;
    inputContainer.appendChild(item);
  });

  const resultsContainer = document.getElementById('report-results');
  resultsContainer.innerHTML = '';
  const activeResults = document.querySelectorAll('.results-area .result-block, .results-area .result-card .result-block');
  
  activeResults.forEach(block => {
    const label = block.querySelector('.result-label')?.innerText;
    const value = block.querySelector('.result-value')?.innerText;
    if (label && value) {
      const item = document.createElement('div');
      item.style.padding = '20px'; item.style.background = '#f9f9fb';
      item.style.borderRadius = '12px'; item.style.border = '1px solid #e8e8ed';
      item.innerHTML = `
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #0071e3; letter-spacing: 0.1em; font-weight: 700;">${label}</p>
        <p style="margin: 8px 0 0; font-size: 28px; font-weight: 700; color: #1d1d1f; letter-spacing: -0.02em;">${value}</p>
      `;
      resultsContainer.appendChild(item);
    }
  });

  const template = document.getElementById('pdf-template');
  template.style.opacity = '1';

  const opt = {
    margin: [40, 40, 40, 40],
    filename: `SuiPress_${modData.title}_${new Date().getTime()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
  };

  setTimeout(() => {
    html2pdf().from(document.getElementById('report-content')).set(opt).save().then(() => {
      template.style.opacity = '0';
    });
  }, 150);
}

const formState = {};

function currentFormKey() {
  return `${state.mod}:${state.mode}`;
}

function getCurrentFields() {
  return CONFIG[state.mod].fields[state.mode] || CONFIG[state.mod].fields.std || [];
}

function getFormState() {
  const key = currentFormKey();
  if (!formState[key]) {
    formState[key] = { values: {}, presets: {} };
    getCurrentFields().forEach(field => {
      formState[key].values[field.id] = String(field.val).replace('.', ',');
      if (field.options) formState[key].presets[field.id] = field.options.some(option => String(option.value) === String(field.val)) ? String(field.val) : 'other';
    });
  }
  return formState[key];
}

function getFieldValue(fieldId) {
  return getFormState().values[fieldId] ?? '';
}

function parseInputValue(rawValue) {
  return CalculatorCore.normalizarNumeroEntrada(rawValue);
}

function isIntegerField(field) {
  return /tirada|pliegos|paginas|efectos|versiones|_web$|arranque|vueltas/i.test(field.id);
}

function allowsZero(field) {
  return /perdidoPct|arranque|vueltas|pub_(por|cup)_/i.test(field.id)
    || (state.mod === 'prensa' && field.id === 'bobinaB_ancho');
}

function validateField(field, rawValue) {
  const value = parseInputValue(rawValue);
  if (value === null) return 'Introduce un número válido.';
  if (value < 0) return 'No puede ser negativo.';
  if (!allowsZero(field) && value === 0) return 'Debe ser mayor que cero.';
  if (isIntegerField(field) && !Number.isInteger(value)) return 'Debe ser un número entero.';
  if (/paginas/i.test(field.id) && value % 2 !== 0) return 'El número de páginas debe ser par.';
  return '';
}

function validateCurrentForm() {
  const fields = getCurrentFields();
  const values = {};
  const errors = {};
  fields.forEach(field => {
    const rawValue = getFieldValue(field.id);
    const error = validateField(field, rawValue);
    if (error) errors[field.id] = error;
    else values[field.id] = parseInputValue(rawValue);
  });
  return { values, errors, isValid: Object.keys(errors).length === 0 };
}

function applyValidation(validation) {
  getCurrentFields().forEach(field => {
    const error = validation.errors[field.id] || '';
    const input = document.getElementById(field.id);
    const container = document.getElementById(`field-${field.id}`);
    const message = document.getElementById(`error-${field.id}`);
    if (input) {
      input.classList.toggle('is-invalid', Boolean(error));
      input.setAttribute('aria-invalid', String(Boolean(error)));
    }
    if (container) container.classList.toggle('has-error', Boolean(error));
    if (message) message.textContent = error;
  });
}

function handleInput(id, rawValue) {
  getFormState().values[id] = rawValue;
  const validation = validateCurrentForm();
  applyValidation(validation);
  if (validation.isValid) debouncedCalculate();
}

function handleFieldKey(event, fieldId) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  const fields = Array.from(document.querySelectorAll('#module-container .field-input'));
  const index = fields.findIndex(input => input.id === fieldId);
  if (index >= 0 && fields[index + 1]) fields[index + 1].focus();
  else event.target.blur();
}

function updatePredefined(fieldId, selectValue) {
  const store = getFormState();
  store.presets[fieldId] = selectValue;
  if (selectValue !== 'other') store.values[fieldId] = String(selectValue).replace('.', ',');
  render();
  if (selectValue === 'other') {
    setTimeout(() => document.getElementById(fieldId)?.focus(), 0);
  }
}

function renderField(field) {
  const store = getFormState();
  const hasOptions = field.options && field.options.length > 0;
  const selectedPreset = store.presets[field.id] || 'other';
  const showInput = !hasOptions || selectedPreset === 'other';
  const inputMode = isIntegerField(field) ? 'numeric' : 'decimal';
  return `
    <div class="field-box" id="field-${field.id}">
      <label for="${hasOptions ? `select-${field.id}` : field.id}">${field.label}</label>
      ${hasOptions ? `
        <select id="select-${field.id}" class="field-select" aria-label="Preajuste para ${field.label}" onchange="updatePredefined('${field.id}', this.value)">
          ${field.options.map(option => `<option value="${option.value}" ${String(option.value) === selectedPreset ? 'selected' : ''}>${option.label}</option>`).join('')}
        </select>
      ` : ''}
      ${showInput ? `
        <input class="field-input" type="text" inputmode="${inputMode}" id="${field.id}" value="${getFieldValue(field.id)}"
          oninput="handleInput('${field.id}', this.value)" onkeydown="handleFieldKey(event, '${field.id}')"
          autocomplete="off" aria-required="true" aria-describedby="error-${field.id}">
      ` : ''}
      <span class="field-error" id="error-${field.id}" role="alert"></span>
    </div>
  `;
}

let calcTimeout;
function debouncedCalculate() {
  clearTimeout(calcTimeout);
  calcTimeout = setTimeout(calculate, 80);
}

function render() {
  const modData = CONFIG[state.mod];
  let fieldsHtml = '';

  if (state.mod === 'prensa') {
    const currentFields = modData.fields[state.mode];
    const commonFields = currentFields.filter(f => !f.group);
    const groupA = currentFields.filter(f => f.group === 'A');
    const groupB = currentFields.filter(f => f.group === 'B');

    fieldsHtml = `
      <div class="prensa-container">
        <div class="input-grid">
          ${commonFields.map(f => renderField(f)).join('')}
        </div>
        <div class="bobina-row">
          <div class="bobina-col a">
            <h3>Bobina A</h3>
            ${groupA.map(f => renderField(f)).join('')}
          </div>
          <div class="bobina-col b">
            <h3>Bobina B</h3>
            ${groupB.map(f => renderField(f)).join('')}
          </div>
        </div>
      </div>
    `;
  } else if (state.mod === 'publicaciones') {
    const f = modData.fields[state.mode];
    const common = f.filter(x => !x.group);
    const sections = [
      {id: 'int', label: 'Interior'},
      {id: 'cub', label: 'Cubierta'},
      {id: 'por', label: 'Portadilla'},
      {id: 'cup', label: 'Cupón'}
    ];

    fieldsHtml = `
      <div class="pub-container">
        <div class="input-grid">
          ${common.map(x => renderField(x)).join('')}
        </div>
        <div class="pub-grid">
          ${sections.map(s => `
            <div class="pub-section">
              <h3>${s.label}</h3>
              ${f.filter(x => x.group === s.id).map(x => renderField(x)).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    fieldsHtml = `
      <div class="input-grid">
        ${modData.fields[state.mode].map(f => renderField(f)).join('')}
      </div>
    `;
  }

  const html = `
    <div class="module-transition" role="tabpanel" aria-labelledby="tab-${state.mod}">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; gap: 20px; flex-wrap: wrap;">
        <div>
          <span class="eyebrow-mod">Cálculo Dinámico</span>
          <h2 class="h2" style="margin: 0; font-size: 32px;">${modData.title}</h2>
        </div>
        <div class="tabs-nav" role="tablist">
          ${modData.modes.map(m => `
            <button class="tab-btn ${state.mode === m.id ? 'active' : ''}" 
              role="tab" 
              aria-selected="${state.mode === m.id}" 
              onclick="switchMode('${m.id}')">${m.label}</button>
          `).join('')}
        </div>
      </div>
      ${fieldsHtml}
    </div>
  `;
  document.getElementById('module-container').innerHTML = html;
  gsap.fromTo('#module-container', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
  calculate();
}

function calculate() {
  const validation = validateCurrentForm();
  applyValidation(validation);
  if (!validation.isValid) return;
  const inputs = validation.values;
  
  let res = 0, sec = 0, label = "Cálculo de Consumo", secLabel = "Peso por Revolución", unit = "Kilos (kg)", extra = "";

  if (state.mod === 'rotativa') {
    const pesoRev = (inputs.gramaje / 1000) * (inputs.desarrollo / 100) * (inputs.bobina / 100) * (inputs.pliegos || 1);
    sec = pesoRev;
    if (state.mode === 'e2k') {
      res = CalculatorCore.rotativa.ejemplaresAKilos(inputs);
    } else {
      res = CalculatorCore.rotativa.kilosAEjemplares(inputs);
      label = "Tirada Estimada"; unit = "Ejemplares";
    }
  } else if (state.mod === 'plano') {
    sec = CalculatorCore.plano.pesoHoja(inputs.alto, inputs.ancho, inputs.gramaje);
    secLabel = "Peso por Hoja";
    if (state.mode === 'p2k') {
      res = CalculatorCore.plano.pliegosAKilos(inputs.pliegos, inputs.alto, inputs.ancho, inputs.gramaje);
    } else {
      res = CalculatorCore.plano.kilosAPliegos(inputs.kilos, inputs.alto, inputs.ancho, inputs.gramaje);
      label = "Pliegos Estimados"; unit = "Hojas";
    }
  } else if (state.mod === 'prensa') {
    sec = (inputs.paginas / 2) * (inputs.altoPagina / 100) * (inputs.desarrollo / 100) * (inputs.gramaje / 1000);
    secLabel = "Peso por Ejemplar";
    
    const bobinaA = { ancho: inputs.bobinaA_ancho, web: inputs.bobinaA_web, efectos: inputs.bobinaA_efectos };
    const bobinaB = { ancho: inputs.bobinaB_ancho, web: inputs.bobinaB_web, efectos: inputs.bobinaB_efectos };

    if (state.mode === 'e2k') {
      const p = CalculatorCore.prensa.ejemplaresAKilos({
        ...inputs,
        bobinaA,
        bobinaB,
        arranquesVersiones: inputs.versiones
      });
      updateUIPrensa(p, sec, inputs.bobinaA_ancho, inputs.bobinaB_ancho);
      return;
    } else {
      const factA = CalculatorCore.prensa.calcularFactorEfectivo(bobinaA.ancho, bobinaA.web, bobinaA.efectos);
      const factB = CalculatorCore.prensa.calcularFactorEfectivo(bobinaB.ancho, bobinaB.web, bobinaB.efectos);
      const factTotal = factA + factB;
      
      let p = { kilosA: 0, kilosB: 0, kilosTotal: inputs.kilosTotal };
      if (factTotal > 0) {
        p.kilosA = inputs.kilosTotal * (factA / factTotal);
        p.kilosB = inputs.kilosTotal * (factB / factTotal);
      }
      
      res = CalculatorCore.prensa.kilosAEjemplares({...inputs, arranquesVersiones: inputs.versiones});
      updateUIPrensa(p, sec, inputs.bobinaA_ancho, inputs.bobinaB_ancho, true, res);
      return;
    }
  } else if (state.mod === 'publicaciones') {
    const p = CalculatorCore.publicaciones.calcularTotal(inputs);
    updateUIPublicaciones(p);
    return;
  }

  updateUI(res, sec, label, secLabel, unit, extra);
}

function updateUI(val, sec, label, secLabel, unit) {
  const resultsArea = document.querySelector('.results-area');
  resultsArea.classList.remove('prensa-mode');
  
  const prevVal = document.getElementById('main-result-value')?.innerText;
  const currentVal = val.toLocaleString('es-ES', { maximumFractionDigits: 0 });
  
  resultsArea.innerHTML = `
    <div class="result-block">
      <span class="result-label">${label}</span>
      <span class="result-value" id="main-result-value">${currentVal}</span>
      <span style="font-size: 15px; font-weight: 600; color: var(--muted); margin-top: 10px;">${unit}</span>
    </div>
    <div class="result-block">
      <span class="result-label">${secLabel}</span>
      <span class="result-value" style="font-size: 32px; color: var(--fg-2);">${sec.toLocaleString('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span>
      <span style="font-size: 15px; font-weight: 600; color: var(--muted); margin-top: 10px;">kg/u</span>
    </div>
  `;
  
  if (prevVal !== currentVal) {
    gsap.fromTo('#main-result-value', { scale: 1.1, color: 'var(--accent)' }, { scale: 1, color: 'var(--fg)', duration: 0.4, ease: "power2.out" });
  }
  gsap.from('.result-block', { opacity: 0, y: 10, stagger: 0.1, duration: 0.3 });
}

function updateUIPrensa(p, sec, anchoA, anchoB, isK2E = false, resEjs = 0) {
  const resultsArea = document.querySelector('.results-area');
  resultsArea.classList.add('prensa-mode');
  
  const valA = p.kilosA.toLocaleString('es-ES', {maximumFractionDigits: 0});
  const valB = p.kilosB.toLocaleString('es-ES', {maximumFractionDigits: 0});

  let mainResultHtml = '';
  if (isK2E) {
    mainResultHtml = `
      <div class="result-card" style="border-color: var(--accent); background: var(--surface-warm); margin-bottom: 24px;">
        <span class="result-label">Tirada Estimada</span>
        <span class="result-value" id="res-ejs-value" style="color: var(--accent);">${resEjs.toLocaleString('es-ES', {maximumFractionDigits: 0})}</span>
        <span style="font-size: 15px; font-weight: 600; color: var(--muted); margin-top: 10px;">Ejemplares</span>
      </div>
    `;
  }

  resultsArea.innerHTML = `
    ${mainResultHtml}
    
    <div class="result-card accent-blue">
      <!-- Bobina A -->
      <div class="result-block">
        <span class="result-label" style="color: var(--accent);">Consumo Bobina A</span>
        <span class="result-value" id="kilosA-value" style="margin-top: 8px;">${valA} <small style="font-size: 18px; color: var(--meta);">kg</small></span>
        <span class="result-value" style="font-size: 56px; color: var(--accent); margin-top: 16px;">${anchoA} <small style="font-size: 18px;">cm</small></span>
        <span class="result-label" style="margin-top: 4px;">Ancho Bobina A</span>
      </div>

      <div style="height: 1px; background: var(--border); margin: 40px 0; opacity: 0.5;"></div>

      <!-- Bobina B -->
      <div class="result-block">
        <span class="result-label" style="color: var(--accent);">Consumo Bobina B</span>
        <span class="result-value" id="kilosB-value" style="margin-top: 8px;">${valB} <small style="font-size: 18px; color: var(--meta);">kg</small></span>
        <span class="result-value" style="font-size: 56px; color: var(--accent); margin-top: 16px;">${anchoB} <small style="font-size: 18px;">cm</small></span>
        <span class="result-label" style="margin-top: 4px;">Ancho Bobina B</span>
      </div>

      <div style="height: 1px; background: var(--border); margin: 40px 0; opacity: 0.5;"></div>

      <!-- Peso por Ejemplar -->
      <div class="result-block">
        <span class="result-label">Peso Total por Ejemplar</span>
        <span class="result-value" style="font-size: 32px; color: var(--fg-2); margin-top: 8px;">${sec.toLocaleString('es-ES', {minimumFractionDigits: 4, maximumFractionDigits: 4})} <small style="font-size: 18px; color: var(--muted);">kg/u</small></span>
      </div>
    </div>
  `;

  gsap.from('.result-card', { opacity: 0, scale: 0.98, y: 20, stagger: 0.1, duration: 0.5, ease: "power2.out" });
}

function updateUIPublicaciones(p) {
  const resultsArea = document.querySelector('.results-area');
  resultsArea.classList.remove('prensa-mode');
  
  const prevVal = document.getElementById('pub-total-value')?.innerText;
  const currentVal = p.totalTirada.toLocaleString('es-ES', { maximumFractionDigits: 0 });

  resultsArea.innerHTML = `
    <div class="result-block">
      <span class="result-label">Peso Total Tirada</span>
      <span class="result-value" id="pub-total-value">${currentVal}</span>
      <span style="font-size: 15px; font-weight: 600; color: var(--muted); margin-top: 10px;">Kilos (kg)</span>
    </div>
    <div class="result-block">
      <span class="result-label">Peso 1 Ejemplar</span>
      <span class="result-value" style="font-size: 32px; color: var(--fg-2);">${p.pesoUnitario.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      <span style="font-size: 15px; font-weight: 600; color: var(--muted); margin-top: 10px;">Gramos (gr)</span>
    </div>
    <div style="width: 100%; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); font-size: 12px; color: var(--meta);">
      * Incluye un 1% adicional estimado por peso de tinta.
    </div>
  `;

  if (prevVal !== currentVal) {
    gsap.fromTo('#pub-total-value', { scale: 1.1, color: 'var(--accent)' }, { scale: 1, color: 'var(--fg)', duration: 0.4, ease: "power2.out" });
  }
  gsap.from('.results-area .result-block', { opacity: 0, y: 10, stagger: 0.1, duration: 0.3 });
}

switchModule('rotativa');
