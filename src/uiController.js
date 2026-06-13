/**
 * Controlador de Interfaz de Usuario (UI) para la Calculadora Gráfica Pro.
 * Sigue el patrón SoC (Separación de Responsabilidades): lee inputs,
 * invoca la lógica en CalculatorCore, maneja estados, tema claro/oscuro y actualiza el DOM.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Estado de la Aplicación ---
  const state = {
    activeTab: 'rotativa', // 'rotativa' | 'plano' | 'prensa'
    rotativaMode: 'ejAKilos', // 'ejAKilos' | 'kilosAEj'
    planoMode: 'plAKilos', // 'plAKilos' | 'kilosAPl'
    prensaMode: 'ejAKilos' // 'ejAKilos' | 'kilosAEj'
  };

  // --- Elementos del DOM ---
  const tabs = {
    rotativa: document.getElementById('tab-rotativa'),
    plano: document.getElementById('tab-plano'),
    prensa: document.getElementById('tab-prensa')
  };

  const sections = {
    rotativa: document.getElementById('section-rotativa'),
    plano: document.getElementById('section-plano'),
    prensa: document.getElementById('section-prensa')
  };

  // --- Lógica del Tema Claro / Oscuro ---
  function initTheme() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (!themeBtn) return;

    // Obtener preferencia guardada o por sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Event listener del botón
    themeBtn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  // --- Inicialización y Eventos de Navegación ---
  function initNavigation() {
    Object.keys(tabs).forEach(tabKey => {
      tabs[tabKey].addEventListener('click', () => {
        // Desactivar pestañas activas
        Object.keys(tabs).forEach(k => {
          tabs[k].classList.remove('active');
          sections[k].classList.add('hidden');
        });

        // Activar pestaña seleccionada
        tabs[tabKey].classList.add('active');
        sections[tabKey].classList.remove('hidden');

        state.activeTab = tabKey;
        calculateAll();
      });
    });

    // Toggles de modo de cálculo (con estilo brutalista)
    setupToggle('rot-mode-toggle', 'rotativaMode', ['ejAKilos', 'kilosAEj'], ['rot-form-ejakilos', 'rot-form-kilosej']);
    setupToggle('plano-mode-toggle', 'planoMode', ['plAKilos', 'kilosAPl'], ['plano-form-plakilos', 'plano-form-kilosepl']);
    setupToggle('prensa-mode-toggle', 'prensaMode', ['ejAKilos', 'kilosAEj'], ['prensa-form-ejakilos', 'prensa-form-kilosej']);
  }

  function setupToggle(toggleId, stateKey, modes, formIds) {
    const container = document.getElementById(toggleId);
    if (!container) return;

    const buttons = container.querySelectorAll('button');
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => {
          b.classList.remove('active');
        });
        btn.classList.add('active');

        state[stateKey] = modes[index];

        // Mostrar / Ocultar formularios correspondientes
        formIds.forEach((formId, fIndex) => {
          const formEl = document.getElementById(formId);
          if (formEl) {
            if (fIndex === index) {
              formEl.classList.remove('hidden');
            } else {
              formEl.classList.add('hidden');
            }
          }
        });

        calculateAll();
      });
    });
  }

  // --- Captura segura de datos y validación ---
  function getFloatValue(id, defaultVal = 0) {
    const el = document.getElementById(id);
    if (!el || el.value.trim() === '') return defaultVal;
    const val = parseFloat(el.value);
    return isNaN(val) ? defaultVal : val;
  }

  function setOutputText(id, value, isInteger = true) {
    const el = document.getElementById(id);
    if (!el) return;
    if (value === null || value === undefined || isNaN(value)) {
      el.textContent = '---';
      return;
    }
    // Formatear número
    const formatted = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: isInteger ? 0 : 2,
      maximumFractionDigits: isInteger ? 0 : 4
    }).format(value);
    
    // Animar al recalcular si cambia el valor
    if (el.textContent !== formatted && ['rot-res-display', 'plano-res-display', 'prensa-res-kilos-total', 'prensa-res-tirada'].includes(id)) {
      el.classList.remove('recalculating-pulse');
      void el.offsetWidth; // Reflow
      el.classList.add('recalculating-pulse');
    }

    el.textContent = formatted;
  }

  // --- Real-time Auto-Calculation bindings ---
  function bindInputs() {
    const allInputs = document.querySelectorAll('input');
    allInputs.forEach(input => {
      input.addEventListener('input', calculateAll);
    });
  }

  // --- Lógica de cálculo por módulo ---
  
  // 1. ROTATIVA
  function calculateRotativa() {
    const unitEl = document.getElementById('rot-res-unit');
    
    if (state.rotativaMode === 'ejAKilos') {
      if (unitEl) unitEl.textContent = 'KILOS DE PAPEL';
      
      const inputs = {
        vueltasArranque: getFloatValue('rot-vueltas-arranque', 0),
        perdidoPct: getFloatValue('rot-perdido-pct', 0),
        tirada: getFloatValue('rot-tirada', 0),
        gramaje: getFloatValue('rot-gramaje', 0),
        pliegos: getFloatValue('rot-pliegos', 1),
        efectos: getFloatValue('rot-efectos', 1),
        desarrollo: getFloatValue('rot-desarrollo', 0),
        bobina: getFloatValue('rot-bobina', 0),
        cambios4_0: getFloatValue('rot-cambios-40', 0),
        mermaCambio4_0: getFloatValue('rot-merma-40', 0),
        cambios4_4: getFloatValue('rot-cambios-44', 0),
        mermaCambio4_4: getFloatValue('rot-merma-44', 0)
      };

      if (inputs.efectos <= 0) {
        showError('rot-efectos', 'Efectos debe ser mayor a 0');
        setOutputText('rot-res-display', null);
        return;
      }
      clearError('rot-efectos');

      const kilos = CalculatorCore.rotativa.ejemplaresAKilos(inputs);
      setOutputText('rot-res-display', kilos);
    } else {
      // Kilos a Ejemplares
      if (unitEl) unitEl.textContent = 'EJEMPLARES (TIRADA)';
      
      const inputs = {
        kilos: getFloatValue('rot-inv-kilos', 0),
        bobina: getFloatValue('rot-inv-bobina', 0),
        gramaje: getFloatValue('rot-inv-gramaje', 0),
        perdidoPct: getFloatValue('rot-inv-perdido-pct', 0),
        efectos: getFloatValue('rot-inv-efectos', 1),
        desarrollo: getFloatValue('rot-inv-desarrollo', 0),
        arranque: getFloatValue('rot-inv-arranque', 0),
        pliegos: getFloatValue('rot-inv-pliegos', 1)
      };

      if (inputs.efectos <= 0) {
        showError('rot-inv-efectos', 'Efectos debe ser mayor a 0');
        setOutputText('rot-res-display', null);
        return;
      }
      clearError('rot-inv-efectos');

      const tirada = CalculatorCore.rotativa.kilosAEjemplares(inputs);
      setOutputText('rot-res-display', tirada, true);
    }
  }

  // 2. PLANO
  function calculatePlano() {
    const alto = getFloatValue('plano-alto', 0);
    const ancho = getFloatValue('plano-ancho', 0);
    const gramaje = getFloatValue('plano-gramaje', 0);

    // Peso de una hoja
    const pesoHoja = CalculatorCore.plano.calcularPesoHoja(alto, ancho, gramaje);
    setOutputText('plano-res-peso-hoja', pesoHoja, false);

    const unitEl = document.getElementById('plano-res-unit');

    if (state.planoMode === 'plAKilos') {
      if (unitEl) unitEl.textContent = 'KILOS DE PAPEL';
      const pliegos = getFloatValue('plano-pliegos', 0);
      const kilos = CalculatorCore.plano.pliegosAKilos(pliegos, alto, ancho, gramaje);
      setOutputText('plano-res-display', kilos);
    } else {
      if (unitEl) unitEl.textContent = 'PLIEGOS DE PAPEL';
      const kilos = getFloatValue('plano-kilos', 0);
      const pliegos = CalculatorCore.plano.kilosAPliegos(kilos, alto, ancho, gramaje);
      setOutputText('plano-res-display', pliegos, true);
    }
  }

  // 3. PRENSA
  function calculatePrensa() {
    const generalInputs = {
      paginas: getFloatValue('prensa-paginas', 0),
      arranque: getFloatValue('prensa-arranque', 0),
      anchoPagina: getFloatValue('prensa-ancho-pag', 0),
      altoPagina: getFloatValue('prensa-alto-pag', 0),
      perdidoPct: getFloatValue('prensa-perdido-pct', 0),
      gramaje: getFloatValue('prensa-gramaje', 0),
      arranquesVersiones: getFloatValue('prensa-versiones', 1),
      bobinaA: {
        ancho: getFloatValue('prensa-bobina-a-ancho', 0),
        web: getFloatValue('prensa-bobina-a-web', 0),
        efectos: getFloatValue('prensa-bobina-a-efectos', 1)
      },
      bobinaB: {
        ancho: getFloatValue('prensa-bobina-b-ancho', 0),
        web: getFloatValue('prensa-bobina-b-web', 0),
        efectos: getFloatValue('prensa-bobina-b-efectos', 1)
      }
    };

    // Actualizar etiquetas dinámicas de ancho de bobina
    const lblA = document.getElementById('prensa-lbl-a');
    const lblB = document.getElementById('prensa-lbl-b');
    const lblInvA = document.getElementById('prensa-lbl-inv-a');
    const lblInvB = document.getElementById('prensa-lbl-inv-b');
    
    if (lblA) lblA.textContent = `Kilos Bobina A (${generalInputs.bobinaA.ancho} cm)`;
    if (lblB) lblB.textContent = `Kilos Bobina B (${generalInputs.bobinaB.ancho} cm)`;
    if (lblInvA) lblInvA.textContent = `Desglose Bobina A (${generalInputs.bobinaA.ancho} cm)`;
    if (lblInvB) lblInvB.textContent = `Desglose Bobina B (${generalInputs.bobinaB.ancho} cm)`;

    // Validaciones
    if (generalInputs.bobinaA.efectos <= 0) {
      showError('prensa-bobina-a-efectos', 'Efectos debe ser > 0');
      clearPrensaOutputs();
      return;
    }
    clearError('prensa-bobina-a-efectos');

    if (generalInputs.bobinaB.efectos <= 0) {
      showError('prensa-bobina-b-efectos', 'Efectos debe ser > 0');
      clearPrensaOutputs();
      return;
    }
    clearError('prensa-bobina-b-efectos');

    const outputA = document.getElementById('prensa-res-ejakilos-output');
    const outputB = document.getElementById('prensa-res-kilosej-output');

    if (state.prensaMode === 'ejAKilos') {
      if (outputA) outputA.classList.remove('hidden');
      if (outputB) outputB.classList.add('hidden');

      generalInputs.tirada = getFloatValue('prensa-tirada', 0);
      const res = CalculatorCore.prensa.ejemplaresAKilos(generalInputs);
      
      setOutputText('prensa-res-kilos-a', res.kilosA);
      setOutputText('prensa-res-kilos-b', res.kilosB);
      setOutputText('prensa-res-kilos-total', res.kilosTotal);
    } else {
      if (outputA) outputA.classList.add('hidden');
      if (outputB) outputB.classList.remove('hidden');

      // Kilos a Ejemplares
      const kilosTotal = getFloatValue('prensa-inv-kilos', 0);
      
      // Calcular la tirada
      const tirada = CalculatorCore.prensa.kilosAEjemplares({
        kilosTotal,
        ...generalInputs
      });
      setOutputText('prensa-res-tirada', tirada, true);

      // Distribuir el peso en A y B para mostrar el desglose
      const factA = CalculatorCore.prensa.calcularFactorEfectivo(
        generalInputs.bobinaA.ancho, 
        generalInputs.bobinaA.web, 
        generalInputs.bobinaA.efectos
      );
      const factB = CalculatorCore.prensa.calcularFactorEfectivo(
        generalInputs.bobinaB.ancho, 
        generalInputs.bobinaB.web, 
        generalInputs.bobinaB.efectos
      );
      const factTotal = factA + factB;
      
      if (factTotal > 0) {
        setOutputText('prensa-res-inv-kilos-a', kilosTotal * (factA / factTotal));
        setOutputText('prensa-res-inv-kilos-b', kilosTotal * (factB / factTotal));
      } else {
        setOutputText('prensa-res-inv-kilos-a', 0);
        setOutputText('prensa-res-inv-kilos-b', 0);
      }
    }
  }

  function clearPrensaOutputs() {
    setOutputText('prensa-res-kilos-a', null);
    setOutputText('prensa-res-kilos-b', null);
    setOutputText('prensa-res-kilos-total', null);
    setOutputText('prensa-res-inv-kilos-a', null);
    setOutputText('prensa-res-inv-kilos-b', null);
    setOutputText('prensa-res-tirada', null);
  }

  // --- Despachador principal ---
  function calculateAll() {
    try {
      if (state.activeTab === 'rotativa') {
        calculateRotativa();
      } else if (state.activeTab === 'plano') {
        calculatePlano();
      } else if (state.activeTab === 'prensa') {
        calculatePrensa();
      }
    } catch (err) {
      console.error("Error en cálculos: ", err);
    }
  }

  // --- Ayudantes de validación visual ---
  function showError(inputId, message) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;
    inputEl.classList.add('border-red-500', 'focus:border-red-500');
    
    // Buscar o crear etiqueta de error debajo del input
    let errorEl = inputEl.parentNode.querySelector('.error-msg');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'error-msg text-red-500 text-xs mt-1 font-sans';
      inputEl.parentNode.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  function clearError(inputId) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;
    inputEl.classList.remove('border-red-500', 'focus:border-red-500');
    
    const errorEl = inputEl.parentNode.querySelector('.error-msg');
    if (errorEl) {
      errorEl.remove();
    }
  }

  // --- Módulo para Compartir (Email y PDF) ---
  function initShareModal() {
    const shareModal = document.getElementById('share-modal');
    if (!shareModal) return;

    const shareCloseBtn = document.getElementById('share-close-btn');
    const shareEmailBtn = document.getElementById('share-email-btn');
    const sharePdfBtn = document.getElementById('share-pdf-btn');
    const shareTriggerBtns = document.querySelectorAll('.share-trigger-btn');

    // Abrir modal
    shareTriggerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        shareModal.classList.remove('hidden');
      });
    });

    // Cerrar modal
    const closeModal = () => {
      shareModal.classList.add('hidden');
    };

    if (shareCloseBtn) {
      shareCloseBtn.addEventListener('click', closeModal);
    }

    shareModal.addEventListener('click', (e) => {
      if (e.target === shareModal) {
        closeModal();
      }
    });

    // Recopilar datos según el tab activo y modo
    function getCalculationReportData() {
      const data = {
        modulo: '',
        modo: '',
        entradas: [],
        resultado: '',
        unidad: ''
      };

      const dateStr = new Date().toLocaleDateString('es-ES');
      data.fecha = dateStr;

      if (state.activeTab === 'rotativa') {
        data.modulo = 'Rotativa';
        if (state.rotativaMode === 'ejAKilos') {
          data.modo = 'Ejemplares a Kilos';
          data.unidad = 'Kilos de Papel';
          data.resultado = document.getElementById('rot-res-display')?.textContent || '---';
          data.entradas = [
            { label: 'Tirada (Ejemplares)', id: 'rot-tirada' },
            { label: 'Vueltas Arranque', id: 'rot-vueltas-arranque' },
            { label: '% Perdido (Merma)', id: 'rot-perdido-pct', suffix: '%' },
            { label: 'Gramaje (g)', id: 'rot-gramaje', suffix: ' g' },
            { label: 'Pliegos', id: 'rot-pliegos' },
            { label: 'Efectos', id: 'rot-efectos' },
            { label: 'Desarrollo (cm)', id: 'rot-desarrollo', suffix: ' cm' },
            { label: 'Bobina (cm)', id: 'rot-bobina', suffix: ' cm' },
            { label: 'Cambios 4/0', id: 'rot-cambios-40' },
            { label: 'Vueltas Merma 4/0', id: 'rot-merma-40' },
            { label: 'Cambios 4/4', id: 'rot-cambios-44' },
            { label: 'Vueltas Merma 4/4', id: 'rot-merma-44' }
          ];
        } else {
          data.modo = 'Kilos a Ejemplares';
          data.unidad = 'Ejemplares (Tirada)';
          data.resultado = document.getElementById('rot-res-display')?.textContent || '---';
          data.entradas = [
            { label: 'Kilos Disponibles', id: 'rot-inv-kilos', suffix: ' kg' },
            { label: 'Bobina (cm)', id: 'rot-inv-bobina', suffix: ' cm' },
            { label: 'Gramaje (g)', id: 'rot-inv-gramaje', suffix: ' g' },
            { label: '% Perdido (Merma)', id: 'rot-inv-perdido-pct', suffix: '%' },
            { label: 'Efectos', id: 'rot-inv-efectos' },
            { label: 'Desarrollo (cm)', id: 'rot-inv-desarrollo', suffix: ' cm' },
            { label: 'Pliegos', id: 'rot-inv-pliegos' },
            { label: 'Vueltas de Arranque', id: 'rot-inv-arranque' }
          ];
        }
      } else if (state.activeTab === 'plano') {
        data.modulo = 'Plano';
        const pesoHoja = document.getElementById('plano-res-peso-hoja')?.textContent || '---';
        if (state.planoMode === 'plAKilos') {
          data.modo = 'Pliegos a Kilos';
          data.unidad = 'Kilos de Papel';
          data.resultado = document.getElementById('plano-res-display')?.textContent || '---';
          data.entradas = [
            { label: 'Cantidad de Pliegos', id: 'plano-pliegos' },
            { label: 'Alto (cm)', id: 'plano-alto', suffix: ' cm' },
            { label: 'Ancho (cm)', id: 'plano-ancho', suffix: ' cm' },
            { label: 'Gramaje (g)', id: 'plano-gramaje', suffix: ' g' },
            { label: 'Peso de una sola hoja', value: pesoHoja + ' kg' }
          ];
        } else {
          data.modo = 'Kilos a Pliegos';
          data.unidad = 'Pliegos de Papel';
          data.resultado = document.getElementById('plano-res-display')?.textContent || '---';
          data.entradas = [
            { label: 'Kilos Totales', id: 'plano-kilos', suffix: ' kg' },
            { label: 'Alto (cm)', id: 'plano-alto', suffix: ' cm' },
            { label: 'Ancho (cm)', id: 'plano-ancho', suffix: ' cm' },
            { label: 'Gramaje (g)', id: 'plano-gramaje', suffix: ' g' },
            { label: 'Peso de una sola hoja', value: pesoHoja + ' kg' }
          ];
        }
      } else if (state.activeTab === 'prensa') {
        data.modulo = 'Prensa';
        const generalEntradas = [
          { label: 'Páginas Totales', id: 'prensa-paginas' },
          { label: 'Gramaje (g)', id: 'prensa-gramaje', suffix: ' g' },
          { label: 'Ancho Página (cm)', id: 'prensa-ancho-pag', suffix: ' cm' },
          { label: 'Alto Página (cm)', id: 'prensa-alto-pag', suffix: ' cm' },
          { label: 'Arranque (Ejemplares)', id: 'prensa-arranque' },
          { label: 'Arranques V.', id: 'prensa-versiones' },
          { label: '% Perdido (Merma)', id: 'prensa-perdido-pct', suffix: '%' },
          { label: 'Ancho Bobina A (cm)', id: 'prensa-bobina-a-ancho', suffix: ' cm' },
          { label: 'Web Bobina A', id: 'prensa-bobina-a-web' },
          { label: 'Efectos Bobina A', id: 'prensa-bobina-a-efectos' },
          { label: 'Ancho Bobina B (cm)', id: 'prensa-bobina-b-ancho', suffix: ' cm' },
          { label: 'Web Bobina B', id: 'prensa-bobina-b-web' },
          { label: 'Efectos Bobina B', id: 'prensa-bobina-b-efectos' }
        ];

        if (state.prensaMode === 'ejAKilos') {
          data.modo = 'Ejemplares a Kilos';
          data.unidad = 'Kilos de Papel';
          data.resultado = document.getElementById('prensa-res-kilos-total')?.textContent || '---';
          
          const kilosA = document.getElementById('prensa-res-kilos-a')?.textContent || '---';
          const kilosB = document.getElementById('prensa-res-kilos-b')?.textContent || '---';
          const bobinaAAncho = document.getElementById('prensa-bobina-a-ancho')?.value || '---';
          const bobinaBAncho = document.getElementById('prensa-bobina-b-ancho')?.value || '---';

          data.entradas = [
            { label: 'Tirada Objetivo (Ejemplares)', id: 'prensa-tirada' },
            ...generalEntradas,
            { label: `Kilos Bobina A (${bobinaAAncho} cm)`, value: kilosA + ' kg' },
            { label: `Kilos Bobina B (${bobinaBAncho} cm)`, value: kilosB + ' kg' }
          ];
        } else {
          data.modo = 'Kilos a Ejemplares';
          data.unidad = 'Ejemplares (Tirada)';
          data.resultado = document.getElementById('prensa-res-tirada')?.textContent || '---';
          
          const kilosTotal = document.getElementById('prensa-inv-kilos')?.value || '---';
          const desgloseA = document.getElementById('prensa-res-inv-kilos-a')?.textContent || '---';
          const desgloseB = document.getElementById('prensa-res-inv-kilos-b')?.textContent || '---';
          const bobinaAAncho = document.getElementById('prensa-bobina-a-ancho')?.value || '---';
          const bobinaBAncho = document.getElementById('prensa-bobina-b-ancho')?.value || '---';

          data.entradas = [
            { label: 'Kilos Totales Disponibles', value: kilosTotal + ' kg' },
            ...generalEntradas,
            { label: `Desglose Bobina A (${bobinaAAncho} cm)`, value: desgloseA + ' kg' },
            { label: `Desglose Bobina B (${bobinaBAncho} cm)`, value: desgloseB + ' kg' }
          ];
        }
      }

      // Procesar valores de inputs de forma amigable
      data.entradas = data.entradas.map(item => {
        if (item.value !== undefined) return item;
        const inputEl = document.getElementById(item.id);
        let valText = '---';
        if (inputEl) {
          const rawVal = parseFloat(inputEl.value);
          if (!isNaN(rawVal)) {
            valText = new Intl.NumberFormat('es-ES').format(rawVal);
          } else {
            valText = inputEl.value;
          }
        }
        return {
          label: item.label,
          value: valText + (item.suffix || '')
        };
      });

      return data;
    }

    // Compartir por Email
    if (shareEmailBtn) {
      shareEmailBtn.addEventListener('click', () => {
        const report = getCalculationReportData();
        const subject = `Reporte de Consumo - SuiPress Pro [${report.modulo}]`;
        
        let body = `SuiPress Pro - Reporte Técnico\r\n`;
        body += `=========================================\r\n`;
        body += `Fecha: ${report.fecha}\r\n`;
        body += `Módulo: ${report.modulo}\r\n`;
        body += `Tipo de Cálculo: ${report.modo}\r\n\r\n`;
        
        body += `DATOS DE ENTRADA:\r\n`;
        report.entradas.forEach(item => {
          body += `- ${item.label}: ${item.value}\r\n`;
        });
        
        body += `\r\nRESULTADO ESTIMADO FINAL:\r\n`;
        body += `➔ ${report.resultado} ${report.unidad}\r\n\r\n`;
        
        body += `-----------------------------------------\r\n`;
        body += `Este reporte fue generado de forma stateless y local desde la app SuiPress Pro.\r\n`;

        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        closeModal();
      });
    }

    // Compartir por PDF (Impresión del Navegador)
    if (sharePdfBtn) {
      sharePdfBtn.addEventListener('click', () => {
        const report = getCalculationReportData();
        
        // Rellenar área invisible de impresión
        const printDateEl = document.getElementById('print-date');
        const printModuleEl = document.getElementById('print-module-name');
        const printModeEl = document.getElementById('print-calculation-mode');
        const printResultValEl = document.getElementById('print-result-val');
        const printResultUnitEl = document.getElementById('print-result-unit-label');
        const printTableBody = document.querySelector('#print-inputs-table tbody');

        if (printDateEl) printDateEl.textContent = `Fecha: ${report.fecha}`;
        if (printModuleEl) printModuleEl.textContent = report.modulo;
        if (printModeEl) printModeEl.textContent = report.modo;
        if (printResultValEl) printResultValEl.textContent = report.resultado;
        if (printResultUnitEl) printResultUnitEl.textContent = report.unidad;

        if (printTableBody) {
          printTableBody.innerHTML = '';
          report.entradas.forEach(item => {
            const tr = document.createElement('tr');
            const tdLabel = document.createElement('td');
            tdLabel.textContent = item.label;
            tdLabel.style.fontWeight = '500';
            const tdVal = document.createElement('td');
            tdVal.textContent = item.value;
            tdVal.style.textAlign = 'right';
            tdVal.style.fontFamily = 'monospace';
            
            tr.appendChild(tdLabel);
            tr.appendChild(tdVal);
            printTableBody.appendChild(tr);
          });
        }

        closeModal();
        
        // Dar un pequeño delay para que se renderice el DOM oculto antes de disparar la impresión
        setTimeout(() => {
          window.print();
        }, 150);
      });
    }
  }

  // --- Ejecución Inicial ---
  initTheme();
  initNavigation();
  bindInputs();
  initShareModal();
  calculateAll();
});
