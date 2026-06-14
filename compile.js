const fs = require('fs');
const path = require('path');

console.log('=== STARTING SUIPRESS COMPILATION ===');

try {
  const templatePath = path.join(__dirname, 'src', 'template.html');
  const cssPath = path.join(__dirname, 'src', 'index.css');
  const coreJsPath = path.join(__dirname, 'src', 'calculatorCore.js');
  const uiJsPath = path.join(__dirname, 'src', 'uiController.js');
  const outputPath = path.join(__dirname, 'index.html');

  console.log(`Reading components...`);
  let html = fs.readFileSync(templatePath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const coreJs = fs.readFileSync(coreJsPath, 'utf8');
  const uiJs = fs.readFileSync(uiJsPath, 'utf8');

  console.log(`Inlining CSS...`);
  html = html.replace('/* STYLES_PLACEHOLDER */', css);

  console.log(`Inlining CalculatorCore...`);
  html = html.replace('/* CALCULATOR_CORE_PLACEHOLDER */', coreJs);

  console.log(`Inlining UI Controller...`);
  html = html.replace('/* UI_CONTROLLER_PLACEHOLDER */', uiJs);

  console.log(`Writing unified index.html...`);
  fs.writeFileSync(outputPath, html, 'utf8');

  console.log('🎉 COMPILATION COMPLETED SUCCESSFULLY!');
} catch (error) {
  console.error('❌ COMPILATION FAILED:', error);
  process.exit(1);
}
