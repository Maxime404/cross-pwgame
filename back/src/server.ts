import express from 'express'
import dotenv from 'dotenv'
import chalk from 'chalk'
import io, { Socket } from 'socket.io'

import { isNull, display } from './utils'

interface User {
  nickname?: string
}

// prelude -- loading environment variable
dotenv.config()
if (isNull(process.env.PORT)) {
  throw 'Sorry missing PORT env'
}

const port = parseInt(process.env.PORT)
const app = express()

const server = app.listen(port, () => {
  display(chalk.magenta(`crossPWAGame server is running on 0.0.0.0:${port}`))
})

const socketio = io(server)

const users: Record<string, User> = {}

socketio.on('connection', (socket: Socket) => {
  // CURRENT SOCKET/PLAYER

  display(chalk.cyan(`Connection opened for ( ${socket.id} )`))

  socket.on('disconnect', () => {
    if (users[socket.id]?.nickname) {
      const { nickname } = users[socket.id]
      display(chalk.yellow(`Goodbye ${nickname}`))
    }
    display(chalk.cyan(`Connection closed for ( ${socket.id} )`))
  })

  socket.on('game::sendNickname', payload => {
    const user = JSON.parse(payload)
    const { nickname } = user
    display(chalk.yellow(`Here comes a new challenger : ${nickname} ( from ${socket.id} )`))

    users[socket.id] = { nickname }

    socket.emit('game::start', {
      points: 1337,
    })
  })
})
