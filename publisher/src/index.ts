import * as Amqp from 'amqp-ts'
import Web3 from 'web3'
import express from 'express'

interface Message {
  number: number
  timestamp: number
}

const DEFAULT_RABBIT_MQ_USER = 'quest'
const DEFAULT_RABBIT_MQ_PASSWORD = 'quest'

let latestKnownBlockNumber = -1
let latestBlockTime = -1

const { RABBITMQ_DEFAULT_USER, RABBITMQ_DEFAULT_PASS, FETCH_BLOCKS_INTERVAL_MS ,DATA_SOURCE_URL} = process.env

const restClient = new Web3(DATA_SOURCE_URL)
const connectionString = `amqp://${RABBITMQ_DEFAULT_USER || DEFAULT_RABBIT_MQ_USER}:${RABBITMQ_DEFAULT_PASS || DEFAULT_RABBIT_MQ_PASSWORD}@rmq`
const connection = new Amqp.Connection(connectionString)
const fetchInterval = +FETCH_BLOCKS_INTERVAL_MS || 1000

connection.on('close_connection', () => {console.info(`close connection ${connectionString}`)})
connection.on('lost_connection', () => {console.info(`lost connection ${connectionString}`)})
connection.on('trying_connect', () => {console.info(`trying connect to ${connectionString}`)})
connection.on('error_connection', err => {console.error(`error connection to ${connectionString}. error:`, err)})

const exchange = connection.declareExchange('Blocks')
const queue = connection.declareQueue('blocks')

queue.bind(exchange)

connection.completeConfiguration().then(() => {
  setInterval(() => {
    console.info('Fetching block number...')
    restClient.eth.getBlockNumber((error, blockNumber) => {
      console.info(`Fetched block number #${blockNumber}. Fetching block info by number`)

      restClient.eth.getBlock(blockNumber).then((currentBlock) => {
        console.info('Block info fetched.')

        if (latestKnownBlockNumber !== currentBlock.number && latestBlockTime !== currentBlock.timestamp) {
          console.info('Send block info to rabbit mq')
          const info: Message = {
            number: currentBlock.number,
            timestamp: +currentBlock.timestamp
          }
          const msg = new Amqp.Message(info)
          exchange.send(msg)
          latestKnownBlockNumber =  currentBlock.number
          latestBlockTime = +currentBlock.timestamp
        } else {
          console.info('Fetched block is not new')
        }
      })
    })
  }, fetchInterval)
})

const app = express();

app.get("/health", (req, res) => {
  res.send(true);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});