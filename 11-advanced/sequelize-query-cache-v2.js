import Sequelize from 'sequelize'
import redis from 'redis'

// Initialize Sequelize and Redis
const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)
await client.connect()

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'app1',
  password: 'welcome123',
  database: 'ismv4',
  logging: false
})

// Define the User model
const User = sequelize.define('user', {
  username: Sequelize.STRING
})

// Add a beforeFind hook to the User model for caching
const findAll = User.findAll

User.findAll = async function (options) {
  if (options.cache) {
    const cacheKey = JSON.stringify(options.where || 'users')
    const cachedResult = await client.get(cacheKey)
    if (cachedResult) {
      console.warn('CACHED')
      return cachedResult
    } 
  }
  console.warn('NOT CACHED')
  return findAll.call(this, options)
}

User.addHook('afterFind', async (users, options) => {
  const cacheKey = JSON.stringify(options.where || 'users')
  client.setEx(cacheKey, 60, JSON.stringify(users))
})


await sequelize.sync({ force: true })
await User.create({ username: 'someuser' })

let user = await User.findAll({ where: { username: 'someuser' }, cache: true })
console.warn(user)
user = await User.findAll({ where: { username: 'someuser' }, cache: true })
console.warn(user)