//Dar un clic normal
const clic = async (page, selector) => {
    const select = await page.waitForSelector(selector);
    await page.click(select);
};

//Dar clic normal con xPath
const pathClic = async (page, selector) => {
    const select = await page.waitForXPath(selector);
    await page.click(select);
};

//Escribir en algun input
const escribir = async (page, selector, texto) => {
    const select = await page.waitForSelector(selector);
    await page.type(select, texto);
};

//Presionar una tecla
const presionar = async (page, tecla) => {
    await page.keyboard.press(tecla);
};


const datos = async (page, se) => {
    await page.keyboard.press(tecla);
};

const datosTarjeta = async (page, tecla) => {
    await page.keyboard.press(tecla);
};

// Obtener el número de tarjetas en la página
const numTarjetas = async (page, selector) => {
    const elementos = await page.$$(selector);
    return elementos.length;
};
  

module.exports = {
hacerClic,
escribirTexto
};