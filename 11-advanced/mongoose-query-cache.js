import mongoose from 'mongoose'
import redis from 'redis'

try {
// Mongoose setup
await mongoose.connect('mongodb://localhost:27017/ismv4', {
  useNewUrlParser: true, 
  useUnifiedTopology: true
})

// await mongoose.connect('mongodb://root:example@localhost:27017/ismv4?authSource=admin&directConnection=true', {
//   useNewUrlParser: true, 
//   useUnifiedTopology: true
// })

// Define the User schema
const UserSchema = new mongoose.Schema({
  name: String,
})

const User = mongoose.model('User', UserSchema)


// Redis setup
const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)
await client.connect()

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function() {
  this.useCache = true
  return this 
}

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments)
  }

  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }))

  const cacheValue = await client.get(key)

  if (cacheValue) {
    console.log('Returning data from Redis Cache')
    const doc = JSON.parse(cacheValue)

    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc)
  } else {
    console.log('Not cached')
  }

  const result = await exec.apply(this, arguments)
  client.set(key, JSON.stringify(result), 'EX', 10)

  return result
}

const user = new User({ name: 'John' })
await user.save()

let results = await User.find({ name: 'Jim' }).cache()
results = await User.find({ name: 'Jim' }).cache()
  
} catch (error) {
  console.warn(error)
}
