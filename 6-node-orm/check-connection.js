import Sequelize from 'sequelize'

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'root',
  password: 'root',
  database: 'midgard'
})

try {
  await sequelize.authenticate()
  console.log('we are connected')
} catch (error) {
  console.warn(error)  
} finally {
  await sequelize.close()
}