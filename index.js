const express = require('express');
const puppe = require('./puppeteer');
const path = require('path');

const imagePath = '/busScrapper';

const app = express();

app.set('port', '3000');
app.set('appName', 'busScrapper');

app.use(express.json());

app.post('/ejecutar', async (req, res) => {
  try {
    const { dia, origen, destino } = req.body;
    const resultado = await puppe.busScrapper(dia, origen, destino);
    console.log(resultado);
    res.json(resultado);
    res.status(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocurrió un error al ejecutar el código Puppeteer');
  }
});

app.post('/horario', async (req, res) => {
  try {
    const { salida, navegadorId } = req.body;
    const resultado = await puppe.detallePago(salida, navegadorId)
    console.log(resultado);
    res.json(resultado);
    res.status(200);
  } catch (error) {
    console.error(error);
    res.send("Ocurrió un error al elegir el horario");
  }
});

// Ruta para acceder a cualquier imagen en el directorio
app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(imagePath, filename));
});

app.listen(app.get('port'));
console.log(`server ${app.get('appName')} on port ${app.get('port')}`);