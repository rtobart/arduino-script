import { leds } from './devices/led/led.js'

export const injectDevices = (board: any) => {
    return {
        leds: leds(board)
    }
}
