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
     */
    pesoHoja(alto, ancho, gramaje) {
      return (alto / 100) * (ancho / 100) * (gramaje / 1000);
    },

    // Para mantener compatibilidad con tests anteriores
    calcularPesoHoja(alto, ancho, gramaje) {
      return this.pesoHoja(alto, ancho, gramaje);
    },

    /**
     * Convierte Pliegos a Kilos
     */
    pliegosAKilos(pliegos, alto, ancho, gramaje) {
      const ph = this.pesoHoja(alto, ancho, gramaje);
      return ph * pliegos;
    },

    /**
     * Convierte Kilos a Pliegos
     */
    kilosAPliegos(kilos, alto, ancho, gramaje) {
      const ph = this.pesoHoja(alto, ancho, gramaje);
      if (ph === 0) return 0;
      return kilos / ph;
    }
  },

  /**
   * Módulo 3: PAPEL PRENSA (PRENSA)
   */
  prensa: {
    /**
     * Calcula el factor de ancho de bobina efectivo
     */
    calcularFactorEfectivo(anchoBobina, web, efectos) {
      if (efectos === 0) return 0;
      return (anchoBobina * web) / efectos;
    },

    /**
     * Calcula Kilos por bobina y Total de Ejemplares a Kilos
     */
    ejemplaresAKilos({
      paginas = 0,
      tirada = 0,
      arranque = 0,
      anchoPagina = 0,
      desarrollo = 0,
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

      const ejemplaresTotal = tirada * (1 + (perdidoPct / 100)) + (arranquesVersiones * arranque);

      const d = desarrollo || anchoPagina;

      const pesoTotal = 
        (paginas / 2) * 
        (altoPagina / 100) * 
        (d / 100) * 
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
     */
    kilosAEjemplares({
      kilosTotal = 0,
      paginas = 0,
      arranque = 0,
      anchoPagina = 0,
      desarrollo = 0,
      altoPagina = 0,
      perdidoPct = 0,
      gramaje = 0,
      arranquesVersiones = 1
    }) {
      if (kilosTotal === 0) return 0;

      const d = desarrollo || anchoPagina;

      const pesoPorEjemplarKg = 
        (paginas / 2) * 
        (altoPagina / 100) * 
        (d / 100) * 
        (gramaje / 1000);

      if (pesoPorEjemplarKg === 0) return 0;

      const totalEjemplaresDeTirada = (kilosTotal / pesoPorEjemplarKg) - (arranquesVersiones * arranque);
      
      const factorPerdida = 1 + (perdidoPct / 100);
      
      return totalEjemplaresDeTirada / factorPerdida;
    }
  },

  /**
   * Módulo 4: PUBLICACIONES
   */
  publicaciones: {
    /**
     * Calcula el peso de una parte de la publicación en kg
     */
    pesoParte(ancho, alto, gramaje, paginas) {
      return (ancho / 100) * (alto / 100) * (gramaje / 1000) * (paginas / 2);
    },

    /**
     * Calcula el total de pesos de la publicación
     */
    calcularTotal(inputs) {
      const pInterior = this.pesoParte(inputs.pub_ancho, inputs.pub_alto, inputs.pub_int_gramaje, inputs.pub_int_paginas);
      const pCubierta = this.pesoParte(inputs.pub_ancho, inputs.pub_alto, inputs.pub_cub_gramaje, inputs.pub_cub_paginas);
      const pPortadilla = this.pesoParte(inputs.pub_ancho, inputs.pub_alto, inputs.pub_por_gramaje, inputs.pub_por_paginas);
      const pCupon = this.pesoParte(inputs.pub_ancho, inputs.pub_alto, inputs.pub_cup_gramaje, inputs.pub_cup_paginas);
      
      const pesoUnitario = pInterior + pCubierta + pPortadilla + pCupon;
      const conTinta = pesoUnitario * 1.01; // +1% por tinta
      const totalTirada = conTinta * inputs.pub_tirada;
      
      return { 
        pesoUnitario: conTinta * 1000, // pesoUnitario en gramos
        totalTirada 
      };
    }
  }
};

// Exportar para Node (pruebas) y Navegador
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = CalculatorCore;
} else {
  window.CalculatorCore = CalculatorCore;
}
