import * as Amqp from 'amqp-ts'
import { Client } from 'pg'
import redis from 'redis'

interface Message {
  number: number
  timestamp: number
}
const DEFAULT_RABBIT_MQ_USER = 'quest'
const DEFAULT_RABBIT_MQ_PASSWORD = 'quest'

const {
  RABBITMQ_DEFAULT_USER,
  RABBITMQ_DEFAULT_PASS ,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD
} = process.env

const connectionString = `amqp://${RABBITMQ_DEFAULT_USER || DEFAULT_RABBIT_MQ_USER}:${RABBITMQ_DEFAULT_PASS || DEFAULT_RABBIT_MQ_PASSWORD}@rmq`
const rmqConnection = new Amqp.Connection(connectionString)
const rmqExchange = rmqConnection.declareExchange('Blocks')
const rmqQueue = rmqConnection.declareQueue('blocks')

rmqConnection.on('close_connection', () => {console.info(`close connection ${connectionString}`)})
rmqConnection.on('lost_connection', () => {console.info(`lost connection ${connectionString}`)})
rmqConnection.on('trying_connect', () => {console.info(`trying connect to ${connectionString}`)})
rmqConnection.on('error_connection', err => {console.error(`error connection to ${connectionString}. error:`, err)})

const redisClient = redis.createClient({
  host: 'redis',
  port: 6379
})

redisClient.on('ready', () => {console.info('ready')})
redisClient.on('connect', () => {console.info('connect')})
redisClient.on('connect', () => {console.info('reconnecting')})
redisClient.on('error', error => {console.error(`error: ${error}`)})
redisClient.on('end', () => {console.error(`end`)})
redisClient.on('end', () => {console.error(`warning`)})

async function insertInstorages(data: Message) {
  await pgClient.query(`
INSERT INTO block_numbers (block_number)
  SELECT ${data.number}
  WHERE NOT EXISTS (
    SELECT id FROM block_numbers WHERE block_number = ${data.number}
  )
`)

  const blockTimesQueryResult = await pgClient.query(`
INSERT INTO block_times (block_id,block_time)
SELECT (
    SELECT id FROM block_numbers 
    WHERE block_number=${data.number}
), ${data.timestamp}
WHERE NOT EXISTS (
    SELECT id FROM block_times WHERE block_id = (
      SELECT id FROM block_numbers WHERE block_number=${data.number}
    )
) 
`)

  if (blockTimesQueryResult.rowCount === 1) {
    console.info(`Block ${JSON.stringify(data)} inserted in DB`)
    console.info(`Try increment redis counter...`)

    redisClient.incr('blockAmount', (err, reply) => {
      if (err) console.error(err)
      console.info(`Block counter in resid incrementes to ${reply}`)
    })
  }
}


const pgClient = new Client({
  host: 'postgres',
  port: 5432,
  password: POSTGRES_PASSWORD,
  user: POSTGRES_USER,
  database: POSTGRES_DB
})

pgClient.connect().then(r => {
  rmqQueue.bind(rmqExchange)
  rmqQueue.activateConsumer((message) => {
    const data = message.getContent() as Message
    insertInstorages(data)
  })
}).catch(reason => {
  console.log(reason)
  process.exit(1)
})



