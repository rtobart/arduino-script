import Board from 'firmata'
import { handledError, connect } from './config/board.config.js'
import { App } from './app.pipeline.js'

Board.requestPort((error: any, port: any) => {
  // if error, throw error
  handledError(error)
  // connect Arduino board
  const board = connect(Board, port)
  // app instance
  const app = new App(board)
  // setup board
  app.setup()
  // when board is ready
  board.on('ready', () => {
    // run app
    app.run()
  })
})
