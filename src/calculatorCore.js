/**
 * Núcleo de cálculo matemático inmutable para estimación de consumo de papel.
 * Cumple con la directiva de Separación de Responsabilidades (SoC) y no interactúa con la UI.
 */

const CalculatorCore = {
  /**
   * Módulo 1: ROTATIVA (ROTt)
   */
  rotativa: {
    /**
     * Calcula Kilos a partir de Ejemplares (Tirada)
     * @param {Object} params
     * @param {number} params.vueltasArranque - Vueltas de arranque (B)
     * @param {number} params.perdidoPct - % Perdido (C) (ej: 8.5 para 8.5%)
     * @param {number} params.tirada - Tirada en ejemplares (D)
     * @param {number} params.gramaje - Gramaje en g/m² (E)
     * @param {number} params.pliegos - Pliegos (F)
     * @param {number} params.efectos - Efectos (G)
     * @param {number} params.desarrollo - Desarrollo en cm (H)
     * @param {number} params.bobina - Ancho bobina en cm (I)
     * @param {number} params.cambios4_0 - Cambios 4/0 (K)
     * @param {number} params.mermaCambio4_0 - Merma por cambio 4/0 (L)
     * @param {number} params.cambios4_4 - Cambios 4/4 (M)
     * @param {number} params.mermaCambio4_4 - Merma por cambio 4/4 (N)
     * @returns {number} Kilos calculados
     */
    ejemplaresAKilos({
      vueltasArranque = 0,
      perdidoPct = 0,
      tirada = 0,
      gramaje = 0,
      pliegos = 1,
      efectos = 1,
      desarrollo = 0,
      bobina = 0,
      cambios4_0 = 0,
      mermaCambio4_0 = 0,
      cambios4_4 = 0,
      mermaCambio4_4 = 0
    }) {
      if (vueltasArranque === 0 && tirada === 0) return 0;
      
      const perdidoTantoPorUno = perdidoPct / 100;
      const totalRevoluciones = 
        ((tirada / efectos) * (1 + perdidoTantoPorUno)) + 
        vueltasArranque + 
        (cambios4_0 * mermaCambio4_0) + 
        (cambios4_4 * mermaCambio4_4);
        
      const pesoPorRevolucionKg = 
        (gramaje / 1000) * 
        (desarrollo / 100) * 
        (bobina / 100) * 
        pliegos;
        
      return totalRevoluciones * pesoPorRevolucionKg;
    },

    /**
     * Calcula Ejemplares (Tirada) a partir de Kilos
     * @param {Object} params
     * @param {number} params.kilos - Kilos objetivo (B)
     * @param {number} params.bobina - Ancho bobina en cm (C)
     * @param {number} params.gramaje - Gramaje en g/m² (D)
     * @param {number} params.perdidoPct - % Perdido (E) (ej: 8.0 para 8%)
     * @param {number} params.efectos - Efectos (G)
     * @param {number} params.desarrollo - Desarrollo en cm (H)
     * @param {number} params.arranque - Vueltas de arranque (I)
     * @param {number} [params.pliegos=1] - Pliegos (opcional)
     * @returns {number} Tirada (Ejemplares)
     */
    kilosAEjemplares({
      kilos = 0,
      bobina = 0,
      gramaje = 0,
      perdidoPct = 0,
      efectos = 1,
      desarrollo = 0,
      arranque = 0,
      pliegos = 1
    }) {
      if (kilos === 0) return 0;
      
      const pesoPorRevolucionKg = 
        (desarrollo / 100) * 
        (bobina / 100) * 
        (gramaje / 1000) * 
        pliegos;
        
      if (pesoPorRevolucionKg === 0) return 0;

      const numerador = 100 * (kilos - (arranque * pesoPorRevolucionKg));
      const denominador = (100 + perdidoPct) * pesoPorRevolucionKg;
      
      if (denominador === 0) return 0;
      
      return (numerador / denominador) * efectos;
    }
  },

  /**
   * Módulo 2: PLIEGO PLANO (PLANO)
   */
  plano: {
    /**
     * Calcula el peso de una sola hoja en kg
     * @param {number} alto - Alto en cm
     * @param {number} ancho - Ancho en cm
     * @param {number} gramaje - Gramaje en g/m²
     * @returns {number} Peso de la hoja en kg
     */
    calcularPesoHoja(alto, ancho, gramaje) {
      return (alto / 100) * (ancho / 100) * (gramaje / 1000);
    },

    /**
     * Convierte Pliegos a Kilos
     * @param {number} pliegos - Cantidad de pliegos
     * @param {number} alto - Alto en cm
     * @param {number} ancho - Ancho en cm
     * @param {number} gramaje - Gramaje en g/m²
     * @returns {number} Kilos resultantes
     */
    pliegosAKilos(pliegos, alto, ancho, gramaje) {
      const pesoHoja = this.calcularPesoHoja(alto, ancho, gramaje);
      return pesoHoja * pliegos;
    },

    /**
     * Convierte Kilos a Pliegos
     * @param {number} kilos - Kilos de papel
     * @param {number} alto - Alto en cm
     * @param {number} ancho - Ancho en cm
     * @param {number} gramaje - Gramaje en g/m²
     * @returns {number} Pliegos resultantes
     */
    kilosAPliegos(kilos, alto, ancho, gramaje) {
      const pesoHoja = this.calcularPesoHoja(alto, ancho, gramaje);
      if (pesoHoja === 0) return 0;
      return kilos / pesoHoja;
    }
  },

  /**
   * Módulo 3: PAPEL PRENSA (PRENSA)
   */
  prensa: {
    /**
     * Calcula el factor de ancho de bobina efectivo
     * @param {number} anchoBobina - Ancho bobina en cm
     * @param {number} web - Web (cantidad de bandas)
     * @param {number} efectos - Efectos
     * @returns {number} Factor efectivo
     */
    calcularFactorEfectivo(anchoBobina, web, efectos) {
      if (efectos === 0) return 0;
      return (anchoBobina * web) / efectos;
    },

    /**
     * Calcula Kilos por bobina y Total de Ejemplares a Kilos
     * @param {Object} params
     * @param {number} params.paginas - Páginas totales (B26)
     * @param {number} params.tirada - Tirada en ejemplares (B27)
     * @param {number} params.arranque - Arranque en ejemplares (B28)
     * @param {number} params.anchoPagina - Ancho de página en cm (B29)
     * @param {number} params.altoPagina - Alto de página en cm (B30)
     * @param {number} params.perdidoPct - % Perdido (B31) (ej: 7.5 para 7.5%)
     * @param {number} params.gramaje - Gramaje en g/m² (B33)
     * @param {number} params.arranquesVersiones - Arranques de versiones (B34)
     * @param {Object} params.bobinaA - Parámetros bobina A
     * @param {number} params.bobinaA.ancho - Ancho bobina A en cm (B35)
     * @param {number} params.bobinaA.web - Web A (C35)
     * @param {number} params.bobinaA.efectos - Efectos A (D35)
     * @param {Object} params.bobinaB - Parámetros bobina B
     * @param {number} params.bobinaB.ancho - Ancho bobina B en cm (B36)
     * @param {number} params.bobinaB.web - Web B (C36)
     * @param {number} params.bobinaB.efectos - Efectos B (D36)
     * @returns {Object} { kilosA, kilosB, kilosTotal }
     */
    ejemplaresAKilos({
      paginas = 0,
      tirada = 0,
      arranque = 0,
      anchoPagina = 0,
      altoPagina = 0,
      perdidoPct = 0,
      gramaje = 0,
      arranquesVersiones = 1,
      bobinaA = { ancho: 0, web: 0, efectos: 1 },
      bobinaB = { ancho: 0, web: 0, efectos: 1 }
    }) {
      const factA = this.calcularFactorEfectivo(bobinaA.ancho, bobinaA.web, bobinaA.efectos);
      const factB = this.calcularFactorEfectivo(bobinaB.ancho, bobinaB.web, bobinaB.efectos);
      const factTotal = factA + factB;

      if (factTotal === 0) {
        return { kilosA: 0, kilosB: 0, kilosTotal: 0 };
      }

      // Total de ejemplares considerando tirada con pérdida y arranques de versión
      const ejemplaresTotal = tirada * (1 + (perdidoPct / 100)) + (arranquesVersiones * arranque);

      // Peso total calculado según la fórmula original
      const pesoTotal = 
        (paginas / 2) * 
        (altoPagina / 100) * 
        (anchoPagina / 100) * 
        (gramaje / 1000) * 
        ejemplaresTotal;

      const kilosA = pesoTotal * (factA / factTotal);
      const kilosB = pesoTotal * (factB / factTotal);

      return {
        kilosA,
        kilosB,
        kilosTotal: kilosA + kilosB
      };
    },

    /**
     * Calcula la Tirada (Ejemplares) a partir de los Kilos Totales (inversa)
     * @param {Object} params
     * @param {number} params.kilosTotal - Kilos totales objetivo
     * @param {number} params.paginas - Páginas totales (B26)
     * @param {number} params.arranque - Arranque en ejemplares (B28)
     * @param {number} params.anchoPagina - Ancho de página en cm (B29)
     * @param {number} params.altoPagina - Alto de página en cm (B30)
     * @param {number} params.perdidoPct - % Perdido (B31) (ej: 7.5 para 7.5%)
     * @param {number} params.gramaje - Gramaje en g/m² (B33)
     * @param {number} params.arranquesVersiones - Arranques de versiones (B34)
     * @returns {number} Tirada estimada
     */
    kilosAEjemplares({
      kilosTotal = 0,
      paginas = 0,
      arranque = 0,
      anchoPagina = 0,
      altoPagina = 0,
      perdidoPct = 0,
      gramaje = 0,
      arranquesVersiones = 1
    }) {
      if (kilosTotal === 0) return 0;

      const pesoPorEjemplarKg = 
        (paginas / 2) * 
        (altoPagina / 100) * 
        (anchoPagina / 100) * 
        (gramaje / 1000);

      if (pesoPorEjemplarKg === 0) return 0;

      // Despejando:
      // KilosTotal = pesoPorEjemplarKg * (Tirada * (1 + perdido/100) + V * Arr)
      // Tirada * (1 + perdido/100) = (KilosTotal / pesoPorEjemplarKg) - V * Arr
      const totalEjemplaresDeTirada = (kilosTotal / pesoPorEjemplarKg) - (arranquesVersiones * arranque);
      
      const factorPerdida = 1 + (perdidoPct / 100);
      
      return totalEjemplaresDeTirada / factorPerdida;
    }
  }
};

// Exportar para Node (pruebas) y Navegador
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = CalculatorCore;
} else {
  window.CalculatorCore = CalculatorCore;
}
