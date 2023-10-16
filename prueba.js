const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');

const app = express();

app.set('port', '3000');
app.set('appName', 'scraper');

const imagePath = '/busScrapper';

(async () => {
  // Inicializar el navegador
  const browser = await puppeteer.launch({headless: true});

  // Abrir una nueva página
  const page = await browser.newPage();

  // Navegar a la URL deseada
  await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });

  // Tomar una captura de pantalla de toda la página
  await page.screenshot({ path: 'google.png', fullPage: true });

  //Clic en dropdownOrigen
  const busqueda = await page.waitForSelector('#body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input')
  await busqueda.type("muse");
  await page.keyboard.press('Enter');
  
  // Cerrar el navegador
  //await browser.close();
})();

// Ruta para acceder a cualquier imagen en el directorio
app.get('/images/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(imagePath, filename));
  });
  

app.listen(app.get('port'));
console.log(`server ${app.get('appName')} on port ${app.get('port')}`);