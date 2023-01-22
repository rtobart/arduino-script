# ArduinoScript
## _Proyecto de desarrollo arduino en typescrip_
#### powered by firmata

Para iniciar el proyecto bastara con que instales las dependencias y comiences a programar.
```sh
npm i
npm run start:dev
```
este proyecto funciona con nodemon y tsc por lo que si tienes el Arduino conectado a la computadora, cada vez que guardes el codigo, este se compilara y se inyectara automaticamente en tu arduino

## Arquitectura
Decidi darle a este proyect una arquitectura modular, similar a la que encontrariamos en un proyecto de nestjs, una guia rapida de los archivos que encontraras 

- /config/board.config.ts:
Aqui se encuentra la definicion del controlador de errores y el cargador del arduino

- main.ts:
Aqui encontraras la estructura basica solicitada por firmata para correr tu proyecto de arduino en javascript, ten en cuenta que el controlador de errores, el cargador de la instancia de la placa, los perifericos y la logica de programacion, han sido importadas aqui desde sus respectivos paths. Este archivo no nocesita ser modificado, a continuacion veremos donde agregaremos nuestra logica

- app.pipeline.ts:
Aqui es donde encontraremos la carga de perifericos y la logica de programacion central. Aqui encontraremos un metodo llamado run(), en el cuerpo de este es donde pondremos el codigo que ejecutara arduino

- app.module.ts
En este archivo encontramos un metodo que nos servira para inyectar los dispositivos perifericos que agreguemos a nuestro arduino a la logico de ejecucion

- /devices
En este directorio agregaremos los directorios de los dispositivos que vayamos agregando a nuestro proyecto, de esta forma compondremos una logica de configuracion y preparacion limpia, estructurada y ordenada, que nos permitira mayor comprension a la hora de codificar en nuestro archivo pipeline.ts

- /common
En este directorio encontraremos DTOs, funciones comunes, interfaces y otro archivos que necesitemos consumir desde distintas partes de nuetro codigo

## Agregar un dispositivo
En el caso del repositorio, si revisas el directorio /devices veras que ya existe un directorio llamado "led", a continuacion te explicare los pasos para que puedas agregr un dispositivo que necesites

Todos queremos ponerno de inmediato a programar, pero es importante definamos los tipos y clases que utilizaremos, ya que no los consumiremos de ninguna bibliotecam y esto nos permitira, ver en el editor de codigo sugerencias y errores de asignaciones y demases que puedan ocurrir, sin mas, manos a la obra
(para este ejemplo revisaremos los pasos para agregar un led, a pesar de que este ya se encuentra agregado, conocer los pasos te ayudara a agregar nuevos perifericos)

- crea la clase de tu periferico:
- Dentro del directorio '/devices' agregaremos un directorio de nombre '/led'
- Dentro del directorio '/led' agregaremos un archivo de clase: 'led.class.ts'
- En el archivo de clase importaremos el DigitalDto desde 'src/common/digitalDevice.dto':
esto nos permitira consumir la estructura basica de un periferico digital (solo de salida)
- importaremos 'Board' from 'firmata'
- crearemos la classe Led, la exportaremos y le pasaremos al constructor las dos importaciones anteriores
```sh
export class Led {
    constructor(private led: DigitalDto, private board: Board) {}
}
```
- Agregaremos el primero metodo que pondra en modo de salida nuestro dispositivo 
```sh
export class Led {
    constructor(private led: DigitalDto, private board: Board) {}
    mode() {
    this.board.pinMode(this.led.pin, this.board.MODES['OUTPUT']);
    }
}
```
- A continuacion podremos agregar todos los metodos que necesitemos, dependiendo del dispositivo, en este caso se agregaron los metodos para encender y apagar, el led, ademas de metodos para acceder a informacion de la estructura de la interface DigitalDto
```sh
import { DigitalDto } from "../../common/digitalDevice.dto";
import Board from "firmata";

export class Led {
  constructor(private led: DigitalDto, private board: Board) {}
  mode() {
    this.board.pinMode(this.led.pin, this.board.MODES['OUTPUT']);
  }

  turnOn() {
    this.board.digitalWrite(this.led.pin, this.board.HIGH);
    this.led.state = "on";
  }

  turnOff() {
    this.board.digitalWrite(this.led.pin, this.board.LOW);
    this.led.state = "off";
  }

  getPin() {
    return this.led.pin;
  }

  getState() {
    return this.led.state;
  }

  getCustomName() {
    return this.led.customName;
  }
}
```

> Para informacion sobre los metodos de la clase Board como 'board.digitalWrite'
> te recomiendo hacer uso de la documentacion de Arduino y firmata
> ademas inspeccionar los metodos de la clase board desde el proyecto 
> te ayudara a tener una mejor nocion del funcionamiento interno de esta biblioteca de integracion

- Ahora podemos crar el archivo leds que sera donde configuraremos cada led que queramos agregar al proyecto. Para esto importamos la clase Led y exportamos una funcion que reciba por parametro una instancia de la clase Board y retorne una lista con los dispositivos que responden a la categoria que estamos creando, en este caso, Leds 
```sh
import { Led } from "./led.class.js";

export const leds = (board: any) => {
  
  const greenLed = new Led({ pin: 12, customName: "greenLed" }, board);
  const redLed = new Led({ pin: 13, customName: "redLed" }, board);

  return [
    greenLed,
    redLed
  ];
};
```
- Como vemos en el ejemplo, agregamos 2 leds, uno verde y uno rojo, en los pines 12 y 13 respectivamente 
- Te recomiendo seguir esta misma estructura para agregar nuevos leds y otros dispositivos, ya que le metodo de inyeccion que continua, una esta estructura para invocar los dispositivos en el pipeline run 
- Ahora revisemos el archivo app.module.ts 
```sh
import { leds } from './devices/led/led.js'

export const injectDevices = (board: any) => {
    return {
        leds: leds(board)
    }
}
```
- Como podras ver, en este archivo el unico cambio que iremos realizando sera el importar nuevos dispositivos (categorias como led, monitor y otros) para luego retornarlos en el metodo injectDevices y agregar la instancia board a nuestra funcion exportada en el archivo led.ts
- ya estamos listos para dirigirnos a nuestro pipeline, donde podremos inyectar todos los dispositivos desde app.module.ts y usarlos como cualquier clase de javascript que ya conoscamos 
```sh
import { injectDevices } from "./app.module.js";
import { Led } from "./devices/led/led.class.js";
import { getDevice } from "./common/getDevice.js";

export const run = (board: any) => {
  const devices = injectDevices(board);
  const { leds } = devices
  
  // active all devices of category
  leds.forEach((led: Led) => {
    led.mode()
  })

  // extract individual led or any device
  // this method can use with pin or customName and return one device
  const greenLed = getDevice(leds, 'pin', 13)
  const redLed = getDevice(leds, 'pin', 12)

  // code
  greenLed.turnOff()
  redLed.turnOff()
};
```
- Como podemos ver, se importo la clase Led para tipar las instancias de los dispositivos y asi obtener las sugerencias de los metodos en nuestro editor de codigo
- tambien se instancia nuestro inyector pasandole por parametro la instancia de board que viene en el parametro de nuestra funcion exportada run()
- es importante que todo el codigo de ejecucion este dentro del cuerpo de la funcion run() ya que esta es la que llegara al codigo centra a ejecutarse 
- y como puedes ver, al pasar nuestros dispositivos en un arreglo, podemos recorrerlos para activarlos todos de una sola ves con el metodo .mode(), que definira segun el tipo de dispositivo di sera de entrada, salida o vi direccional
- luego con la clase getDevice, se puede recuperar el dispositivo especifico, desde la lista de devies que inyectamos, este metodo recibe tres parametros 
1) array de dispositivos 
2) un strig con el nombre del campo que usaremos para recuperar, este puede ser el customName o el pin,
3) el valor del campo seleccionado en el paso anterior, amobos atributos fueron asignados en el archivo led.ts
- en este ejemplo se uso el pin para recuperar cada dispositivo
- y finalmente ya puedes usar todos tus conocimientos de javascript para exprimir al maximo tu Arduino
