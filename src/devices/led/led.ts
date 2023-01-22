import { Led } from "./led.class.js";

export const leds = (board: any) => {
  
  const greenLed = new Led({ pin: 12, customName: "greenLed" }, board);
  const redLed = new Led({ pin: 13, customName: "redLed" }, board);

  return [
    greenLed,
    redLed
  ];
};
