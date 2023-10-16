//Scrapper para saber las corridas de pachuca a tulancigo en un día específico

const puppeteer = require('puppeteer');
const uuid = require('uuid');

const navegadores = {};

//Funcion con parametro del dia
async function busScrapper(dia, origen, destino) {

  //Variable que almacena el valor del día de hoy
  const hoy = new Date();
  let calendaryDay = hoy.getDate();

    //Creacion de puppeteer brows

    //Creacion de identificador unico para cada navegador
    const id = uuid.v4();
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('https://futura.com.mx', { waitUntil: 'networkidle2' });
    navegadores[id] = { browser, page };

    //Clic en dropdownOrigen
    const dropdownOrigen = await page.waitForSelector('#mat-select-1')
    await dropdownOrigen.click();
    //Clic en Origen
    const pachuca = await page.waitForXPath(`//span[normalize-space(text())='${origen}' and contains(@class,'text-autocomplete') ]`) //Esperar a que cargue origen
    await pachuca.click()
    //Clic en Destino
    await page.waitForXPath(`//*[@id="mat-select-0-panel"]`) //Esperar a que cargue todo el dropdown
    const tulancingo = await page.waitForXPath(`//span[normalize-space(text())='${destino}' and contains(@class,'text-autocomplete') ]`) //Esperar a que cargue destino
    await tulancingo.click()
  //await page.click('#mat-option-550')

    //Focus en el datepicker
    //await page.focus('.mat-form-field-wrapper .ng-tns-c104-3')

    /*Mientras el día no sea igual al seleccionado en el datepicker
    entonces avanzar hasta encontrarlo*/
    
        while(calendaryDay != dia){
        //Seguir con la selección del día hasta encontrar el especificado
        await page.keyboard.press('ArrowRight');
        //Seleccionar el texto del dia apuntado
        calendaryDay = await page.$eval('.mat-calendar-body-active',el => el.innerText);
        console.log(calendaryDay);
        }
        
    //Al tener el día dar enter para registrarlo en el input
    await page.keyboard.press('Enter')
    
    //Click en pasajeros
    await page.click('#search-engine-passenger > mat-form-field > div > div.mat-form-field-flex.ng-tns-c104-5 > div.mat-form-field-infix.ng-tns-c104-5 > div > button');
    //Esperar el elemento de incremento y clickarlo
    await page.waitForSelector('#search-engine-passenger > mat-form-field > div > div.mat-form-field-flex.ng-tns-c104-5 > div.mat-form-field-infix.ng-tns-c104-5 > div > div > div:nth-child(1) > div.dropdown-item-controls > button.btn-increment')
    await page.click('#search-engine-passenger > mat-form-field > div > div.mat-form-field-flex.ng-tns-c104-5 > div.mat-form-field-infix.ng-tns-c104-5 > div > div > div:nth-child(1) > div.dropdown-item-controls > button.btn-increment');
    //Obtener el elemento button y clickarlo
    await page.$eval("button[class='mat-focus-indicator mat-raised-button mat-button-base']", elem => elem.click());

    //Esperar a que carguen las tarjetas y contarlas
    await page.waitForSelector('#card-ticket');
    
    //Funcion que retacha todas las tarjetas de la pagina y poder mostrarselas al cliente (corridas restantes del dia)
    const tarjetas = await page.$$eval('#card-ticket', tarjetas => {
        return tarjetas.map(tarjeta => {

          //Algunos boletos solo se pueden comprar en taquilla, si se encuentra la siguiente clase entonces solo es en taquilla
          let soloTaquilla = tarjeta.querySelector('#card-ticket > div.card-alert.ng-star-inserted > div');
          if(soloTaquilla){
            soloTaquilla = 'si';
          }else{
            soloTaquilla = 'no';
          }
          
          const salida = tarjeta.querySelector('#card-ticket > div.card-body.border-gray-75 > div > div:nth-child(1) > div > div.text-primary.font-weight-lighter > span:nth-child(2)').innerText.trim();
          const llegada = tarjeta.querySelector('#card-ticket > div.card-body.border-gray-75 > div > div:nth-child(3) > div > div.text-primary.font-weight-lighter > span:nth-child(2)').innerText.trim();
          const origen = tarjeta.querySelector('#card-ticket > div.card-body.border-gray-75 > div > div:nth-child(1) > div > div.origen.font-weight-lighter').innerText.trim();
          const destino = tarjeta.querySelector('#card-ticket > div.card-body.border-gray-75 > div > div:nth-child(3) > div > div.origen.font-weight-lighter').innerText.trim();
          const tipo = tarjeta.querySelector('#card-ticket > div.info-viaje.d-none.d-md-block.py-2.px-2.border-top.border-gray-50 > div > div.info.text-capitalize').innerText.trim();
          const recorrido = tarjeta.querySelector('#card-ticket > div.info-viaje.d-none.d-md-block.py-2.px-2.border-top.border-gray-50 > div > app-tooltip-custom > div').innerText.trim();
          const duracion = tarjeta.querySelector('#card-ticket > div.info-viaje.d-none.d-md-block.py-2.px-2.border-top.border-gray-50 > div > div:nth-child(3) > div.duracion').innerText.trim();
          const asientosDisp = tarjeta.querySelector('#card-ticket > div.info-viaje.d-none.d-md-block.py-2.px-2.border-top.border-gray-50 > div > div:nth-child(4) > div.asientos-disponibles').innerText.trim();
          
          const resultado = { soloTaquilla, salida, llegada, origen, destino, tipo, recorrido, duracion, asientosDisp};
          return resultado;
        });
      });
      
    //await browser.close();

    return {id, tarjetas};
    
}

//Funcion para entrar al detalle de pago y extraer la cantidad a pagar y otros detalles
async function detallePago(salida, navegadorId) {
    const { page } = await recuperarNavegador(navegadorId);

    //Alerta para verificar el navegado
    /*
    await page.evaluate((id) => {
      alert(`¡Este es el navegador '${id}'!`);
    }, navegadorId);

    */

    //Ruta de el elemento anchor, para avanzar a la siguiente pantalla
    const anchor = await page.$x(`//div[contains(@id, 'card-ticket') and .//span[contains(text(),'SALIDA')]//following-sibling::span[contains(text(),'${salida}')]]//a`);
    
    //Pero antes verificamos si el array de elementos esta vacío
    if (anchor.length === 0) {
      console.error(`No se encontraron elementos que contengan "${salida}"`);
      return; 
    }

    //Si no esta vacio entonces procede a dar clic en el segundo elemento (el boton llamado "Elegir")
    console.log('anchor:', anchor);
    const elegirIda = anchor[1];
    await elegirIda.click();

    //Ahora, ya que se encuetre en la pagina de pago, selecciona los datos y los muestra al cliente
    //Clic en origen
    //Funcion que retacha todas las tarjetas de la pagina y poder mostrarselas al cliente (corridas restantes del dia)
    await page.waitForSelector('td.text-right');
    const pagos = await page.$x(`//td[contains(@class, 'text-right')]`);
    console.log(pagos);
    //Extraer el texto de los elementos 'CDPElementHandle'
    const textos = await Promise.all(pagos.map(async (el) => {
      return await el.evaluate((node) => node.innerText.trim());
    }));
     //Destructuración del array
    const [subtotal, iva, total] = textos;
   return {subtotal, iva, total};
}

//Metodo para recuperar el navegador con el que se esta trabajando
async function recuperarNavegador(id) {
  return navegadores[id];
}
 
//Para trabajar con las funciones en index.js
module.exports = {
  busScrapper: busScrapper,
  detallePago: detallePago
};