import SequelizeCockroachDB from 'sequelize-cockroachdb'

export const sequelize = new SequelizeCockroachDB(process.env.DATABASE_URL, {
  logging: false
})

export const Student = sequelize.define('Student', {
  name: {
    type: SequelizeCockroachDB.STRING,
    allowNull: false
  },
  className: {
    type: SequelizeCockroachDB.STRING,
    allowNull: false
  }
})
