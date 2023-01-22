import { injectDevices } from "./app.module.js";
import { Led } from "./devices/led/led.class.js";
import { getDevice } from "./common/getDevice.js";

export class App {
  constructor(private board: any) {}
  devices = injectDevices(this.board);
  // asign devices to variables
  greenLed = getDevice(this.devices.leds, "pin", 13);
  redLed = getDevice(this.devices.leds, "customName", 'redLed');


  setup() {
    // active all devices of category
    this.devices.leds.forEach((led: Led) => {
      led.mode();
    });
  }

  run() {
    // code you want to run when board is ready
    this.greenLed.turnOff();
    this.redLed.turnOff();
    this.devices.leds[0].turnOff();
  }
}
