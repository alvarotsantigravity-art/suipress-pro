/**
 * Núcleo de cálculo matemático inmutable para estimación de consumo de papel.
 * Cumple con la directiva de Separación de Responsabilidades (SoC) y no interactúa con la UI.
 */

const normalizarNumeroEntrada = (valor) => {
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  if (typeof valor !== 'string') return null;

  const texto = valor.trim().replace(/\s/g, '');
  if (!texto || texto === '-' || texto === '+' || texto === ',' || texto === '.' || /[,.]$/.test(texto)) return null;

  // Acepta tanto el formato habitual español (1.234,5) como el técnico (1234.5).
  const normalizado = texto.includes(',') && texto.includes('.')
    ? texto.replace(/\./g, '').replace(',', '.')
    : texto.replace(',', '.');
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
};

const numeroNoNegativo = (valor, predeterminado = 0) => {
  const numero = normalizarNumeroEntrada(valor);
  return numero !== null && numero >= 0 ? numero : predeterminado;
};

const resultadoSeguro = (valor, predeterminado = 0) => Number.isFinite(valor) && valor >= 0 ? valor : predeterminado;

const CalculatorCore = {
  normalizarNumeroEntrada,
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
      vueltasArranque = numeroNoNegativo(vueltasArranque);
      perdidoPct = numeroNoNegativo(perdidoPct);
      tirada = numeroNoNegativo(tirada);
      gramaje = numeroNoNegativo(gramaje);
      pliegos = numeroNoNegativo(pliegos, 1);
      efectos = numeroNoNegativo(efectos, 1);
      desarrollo = numeroNoNegativo(desarrollo);
      bobina = numeroNoNegativo(bobina);
      cambios4_0 = numeroNoNegativo(cambios4_0);
      mermaCambio4_0 = numeroNoNegativo(mermaCambio4_0);
      cambios4_4 = numeroNoNegativo(cambios4_4);
      mermaCambio4_4 = numeroNoNegativo(mermaCambio4_4);
      if (vueltasArranque === 0 && tirada === 0 || efectos === 0) return 0;
      
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
        
      return resultadoSeguro(totalRevoluciones * pesoPorRevolucionKg);
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
      kilos = numeroNoNegativo(kilos);
      bobina = numeroNoNegativo(bobina);
      gramaje = numeroNoNegativo(gramaje);
      perdidoPct = numeroNoNegativo(perdidoPct);
      efectos = numeroNoNegativo(efectos, 1);
      desarrollo = numeroNoNegativo(desarrollo);
      arranque = numeroNoNegativo(arranque);
      pliegos = numeroNoNegativo(pliegos, 1);
      if (kilos === 0 || efectos === 0) return 0;
      
      const pesoPorRevolucionKg = 
        (desarrollo / 100) * 
        (bobina / 100) * 
        (gramaje / 1000) * 
        pliegos;
        
      if (pesoPorRevolucionKg === 0) return 0;

      const numerador = 100 * (kilos - (arranque * pesoPorRevolucionKg));
      const denominador = (100 + perdidoPct) * pesoPorRevolucionKg;
      
      if (denominador === 0) return 0;
      
      return resultadoSeguro((numerador / denominador) * efectos);
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
      return resultadoSeguro((numeroNoNegativo(alto) / 100) * (numeroNoNegativo(ancho) / 100) * (numeroNoNegativo(gramaje) / 1000));
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
      return resultadoSeguro(ph * numeroNoNegativo(pliegos));
    },

    /**
     * Convierte Kilos a Pliegos
     */
    kilosAPliegos(kilos, alto, ancho, gramaje) {
      const ph = this.pesoHoja(alto, ancho, gramaje);
      if (ph === 0) return 0;
      return resultadoSeguro(numeroNoNegativo(kilos) / ph);
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
      const ancho = numeroNoNegativo(anchoBobina);
      const torres = numeroNoNegativo(web);
      const numeroEfectos = numeroNoNegativo(efectos);
      if (numeroEfectos === 0) return 0;
      return resultadoSeguro((ancho * torres) / numeroEfectos);
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
      paginas = numeroNoNegativo(paginas);
      tirada = numeroNoNegativo(tirada);
      arranque = numeroNoNegativo(arranque);
      anchoPagina = numeroNoNegativo(anchoPagina);
      desarrollo = numeroNoNegativo(desarrollo);
      altoPagina = numeroNoNegativo(altoPagina);
      perdidoPct = numeroNoNegativo(perdidoPct);
      gramaje = numeroNoNegativo(gramaje);
      arranquesVersiones = numeroNoNegativo(arranquesVersiones, 1);
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
        kilosA: resultadoSeguro(kilosA),
        kilosB: resultadoSeguro(kilosB),
        kilosTotal: resultadoSeguro(kilosA + kilosB)
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
      kilosTotal = numeroNoNegativo(kilosTotal);
      paginas = numeroNoNegativo(paginas);
      arranque = numeroNoNegativo(arranque);
      anchoPagina = numeroNoNegativo(anchoPagina);
      desarrollo = numeroNoNegativo(desarrollo);
      altoPagina = numeroNoNegativo(altoPagina);
      perdidoPct = numeroNoNegativo(perdidoPct);
      gramaje = numeroNoNegativo(gramaje);
      arranquesVersiones = numeroNoNegativo(arranquesVersiones, 1);
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
      
      return resultadoSeguro(totalEjemplaresDeTirada / factorPerdida);
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
      return resultadoSeguro((numeroNoNegativo(ancho) / 100) * (numeroNoNegativo(alto) / 100) * (numeroNoNegativo(gramaje) / 1000) * (numeroNoNegativo(paginas) / 2));
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
      const totalTirada = conTinta * numeroNoNegativo(inputs.pub_tirada);
      
      return { 
        pesoUnitario: resultadoSeguro(conTinta * 1000), // pesoUnitario en gramos
        totalTirada: resultadoSeguro(totalTirada)
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
