import redis from 'redis'
import Sequelize from 'sequelize'

try {
  // Sequelize setup
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'app1',
    password: 'welcome123',
    database: 'ismv4'
  })

  const User = sequelize.define('user', {
    username: Sequelize.STRING
  })

  // Redis setup
  const redisUrl = 'redis://127.0.0.1:6379'
  const client = redis.createClient(redisUrl)
  await client.connect()

  User.addHook('afterFind', async (user, options) => {
    if (options.fromCache) return

    const key = `User_${options.where.id}`
    client.setEx(key, 60, JSON.stringify(user))
  })

  User.addHook('afterCreate', async (user) => {
    const key = `User_${user.id}`
    client.setEx(key, 60, JSON.stringify(user))
  })

  User.addHook('afterUpdate', async (user) => {
    const key = `User_${user.id}`
    client.del(key)
  })

  User.addHook('afterDestroy', async (user) => {
    const key = `User_${user.id}`
    client.del(key)
  })

  await sequelize.sync({ force: true })
  await User.create({ username: 'someuser' })

  async function getUserById(id) {
    const key = `User_${id}`;
    const cachedUser = await client.get(key);
    if (cachedUser) {
      console.log('from cache')
      return JSON.parse(cachedUser);
    } else {
      console.log('not cached')
    }

    const user = await User.findByPk(id);
    return user.get({ plain: true });
  }

  let user = getUserById(1)
  user = getUserById(1)

} catch (error) {
  console.warn(error)
}
