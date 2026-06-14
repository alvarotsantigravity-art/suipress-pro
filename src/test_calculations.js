const CalculatorCore = require('./calculatorCore.js');

function assertAlmostEqual(actual, expected, tolerance = 0.01, message = "") {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    console.error(`❌ FAIL: ${message}`);
    console.error(`   Actual:   ${actual}`);
    console.error(`   Expected: ${expected}`);
    console.error(`   Diff:     ${diff}`);
    return false;
  } else {
    console.log(`✅ PASS: ${message} (Actual: ${actual.toFixed(4)})`);
    return true;
  }
}

let allPassed = true;

console.log("=== RUNNING UNIT TESTS FOR CALCULATOR CORE ===\n");

// 1. ROTATIVA (ROTt) - Ejemplares a Kilos
// Fila 2 de Excel ROTt:
// B2 (vueltasArranque) = 5000
// C2 (perdido) = 0.085 (es decir, 8.5%)
// D2 (tirada) = 50000
// E2 (gramaje) = 65
// F2 (pliegos) = 1
// G2 (efectos) = 2
// H2 (desarrollo) = 124
// I2 (bobina) = 143
// K2 (cambios 4/0) = 0
// L2 (merma 4/0) = 0
// M2 (cambios 4/4) = 0
// N2 (merma 4/4) = 0
// Esperado J2 = 3702.66325 Kilos
const rot1 = CalculatorCore.rotativa.ejemplaresAKilos({
  vueltasArranque: 5000,
  perdidoPct: 8.5,
  tirada: 50000,
  gramaje: 65,
  pliegos: 1,
  efectos: 2,
  desarrollo: 124,
  bobina: 143,
  cambios4_0: 0,
  mermaCambio4_0: 0,
  cambios4_4: 0,
  mermaCambio4_4: 0
});
allPassed &= assertAlmostEqual(rot1, 3702.66325, 0.01, "ROTt Ejemplares a Kilos - Fila 2");

// Fila 3 de Excel ROTt:
// B3=5000, C3=8.5% (0.085), D3=51000, E3=65, F3=1, G3=2, H3=124, I3=143
// Esperado J3 = 3765.190715
const rot2 = CalculatorCore.rotativa.ejemplaresAKilos({
  vueltasArranque: 5000,
  perdidoPct: 8.5,
  tirada: 51000,
  gramaje: 65,
  pliegos: 1,
  efectos: 2,
  desarrollo: 124,
  bobina: 143
});
allPassed &= assertAlmostEqual(rot2, 3765.190715, 0.01, "ROTt Ejemplares a Kilos - Fila 3");


// 2. ROTATIVA (ROTt) - Kilos a Ejemplares
// Fila 22 de Excel ROTt:
// B22 (kilos) = 3000
// C22 (bobina) = 122
// D22 (gramaje) = 57
// E22 (perdido) = 8.0 (8%)
// G22 (efectos) = 1
// H22 (desarrollo) = 124
// I22 (arranque) = 3000
// Esperado J22 = 29435.96063
const rotInv1 = CalculatorCore.rotativa.kilosAEjemplares({
  kilos: 3000,
  bobina: 122,
  gramaje: 57,
  perdidoPct: 8.0,
  efectos: 1,
  desarrollo: 124,
  arranque: 3000
});
allPassed &= assertAlmostEqual(rotInv1, 29435.96063, 0.01, "ROTt Kilos a Ejemplares - Fila 22");


// 3. PLIEGO PLANO
// Hoja de Excel PLANO:
// Alto = 65, Ancho = 90, Gramaje = 300
// Peso hoja esperado = 0.65 * 0.9 * 0.3 = 0.1755
const pesoHoja = CalculatorCore.plano.calcularPesoHoja(65, 90, 300);
allPassed &= assertAlmostEqual(pesoHoja, 0.1755, 0.0001, "PLANO - Peso de una hoja");

// Pliegos = 1740. Esperado Kilos = 305.37
const planoKilos = CalculatorCore.plano.pliegosAKilos(1740, 65, 90, 300);
allPassed &= assertAlmostEqual(planoKilos, 305.37, 0.01, "PLANO Pliegos a Kilos - Fila 11");

// Kilos = 298. Esperado Pliegos = 1698.0057
const planoPliegos = CalculatorCore.plano.kilosAPliegos(298, 65, 90, 300);
allPassed &= assertAlmostEqual(planoPliegos, 1698.0057, 0.01, "PLANO Kilos a Pliegos - Fila 11");


// 4. PAPEL PRENSA
// Excel PRENSA:
// Pag=40, Tirada=2,800,000, Arranque=10000, Ancho=40, Alto=28.9, Perdido=7.5 (7.5%), Gramaje=40, ArranquesVersiones=1
// Bobina A: Ancho=160, Web=1, Efectos=2
// Bobina B: Ancho=120, Web=2, Efectos=2
// Esperado: KilosA = 111715.84, KilosB = 167573.76, KilosTotal = 279289.6
const prensaRes = CalculatorCore.prensa.ejemplaresAKilos({
  paginas: 40,
  tirada: 2800000,
  arranque: 10000,
  anchoPagina: 40,
  altoPagina: 28.9,
  perdidoPct: 7.5,
  gramaje: 40,
  arranquesVersiones: 1,
  bobinaA: { ancho: 160, web: 1, efectos: 2 },
  bobinaB: { ancho: 120, web: 2, efectos: 2 }
});
allPassed &= assertAlmostEqual(prensaRes.kilosA, 111715.84, 0.01, "PRENSA - Kilos Bobina A");
allPassed &= assertAlmostEqual(prensaRes.kilosB, 167573.76, 0.01, "PRENSA - Kilos Bobina B");
allPassed &= assertAlmostEqual(prensaRes.kilosTotal, 279289.6, 0.01, "PRENSA - Kilos Total");


// 5. PAPEL PRENSA - Inverso
// Si le pasamos KilosTotal = 279289.6, debe calcular Tirada = 2800000
const prensaInv = CalculatorCore.prensa.kilosAEjemplares({
  kilosTotal: 279289.6,
  paginas: 40,
  arranque: 10000,
  anchoPagina: 40,
  altoPagina: 28.9,
  perdidoPct: 7.5,
  gramaje: 40,
  arranquesVersiones: 1
});
allPassed &= assertAlmostEqual(prensaInv, 2800000, 1.0, "PRENSA Kilos a Ejemplares (Inversa)");


// 6. PUBLICACIONES
// Entradas por defecto:
// pub_tirada = 5000, pub_ancho = 21, pub_alto = 29.7
// pub_int_paginas = 64, pub_int_gramaje = 80
// pub_cub_paginas = 4, pub_cub_gramaje = 200
// pub_por_paginas = 0, pub_por_gramaje = 0
// pub_cup_paginas = 0, pub_cup_gramaje = 0
// Esperado: pesoUnitario = 186.46135 gr, totalTirada = 932.30676 kg
const pubRes = CalculatorCore.publicaciones.calcularTotal({
  pub_tirada: 5000,
  pub_ancho: 21,
  pub_alto: 29.7,
  pub_int_paginas: 64,
  pub_int_gramaje: 80,
  pub_cub_paginas: 4,
  pub_cub_gramaje: 200,
  pub_por_paginas: 0,
  pub_por_gramaje: 0,
  pub_cup_paginas: 0,
  pub_cup_gramaje: 0
});
allPassed &= assertAlmostEqual(pubRes.pesoUnitario, 186.46135, 0.01, "PUBLICACIONES - Peso Unitario (gramos)");
allPassed &= assertAlmostEqual(pubRes.totalTirada, 932.30676, 0.01, "PUBLICACIONES - Kilos Total Tirada");


console.log("\n==============================================");
if (allPassed) {
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
} else {
  console.error("❌ SOME TESTS FAILED.");
  process.exit(1);
}
