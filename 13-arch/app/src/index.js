import express from 'express'
import { sequelize, Student } from './db.js'
import { getCached, redis } from './cache.js'

const app = express()
app.use(express.json())

const cacheKeys = {
  studentsAll: 'students:all'
}

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    node: process.env.NODE_NAME
  })
})

app.post('/students', async (req, res) => {
  try {
    const student = await Student.create({
      name: req.body.name,
      className: req.body.className
    })

    await redis.del(cacheKeys.studentsAll)

    res.status(201).json({
      node: process.env.NODE_NAME,
      student
    })
  } catch (err) {
    res.status(500).json({
      error: err.message,
      node: process.env.NODE_NAME
    })
  }
})

app.get('/students', async (req, res) => {
  try {
    const result = await getCached(cacheKeys.studentsAll, async () => {
      return Student.findAll({
        order: [['id', 'ASC']]
      })
    })

    res.json({
      node: process.env.NODE_NAME,
      source: result.source,
      students: result.value
    })
  } catch (err) {
    res.status(500).json({
      error: err.message,
      node: process.env.NODE_NAME
    })
  }
})

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  for (let attempt = 1; attempt <= 60; attempt++) {
    try {
      await sequelize.authenticate()
      await sequelize.sync()

      app.listen(process.env.PORT || 3000, () => {
        console.log(`[${process.env.NODE_NAME}] listening`)
      })

      return
    } catch (err) {
      console.error(`[startup] attempt ${attempt} failed`, err.message)
      await wait(1000)
    }
  }

  process.exit(1)
}

main()
