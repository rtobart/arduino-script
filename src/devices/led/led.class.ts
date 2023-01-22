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
