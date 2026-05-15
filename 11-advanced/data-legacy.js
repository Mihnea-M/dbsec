import mongoose from 'mongoose'

// Connect to MongoDB
mongoose.connect('mongodb://localhost/datalegacy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Define the User schema
const UserSchema = new mongoose.Schema({
  name: String,
})

// Define the Resource schema
const ResourceSchema = new mongoose.Schema({
  content: String,
  enabled: Boolean,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

// Define the ResourceVersions schema
const ResourceVersionsSchema = new mongoose.Schema({
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
  },
  previousVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResourceVersions',
  },
  operation: String,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

// Define the pre-save hook for Resource
ResourceSchema.pre('save', async function () {
  const resource = this

  // Check if it's a new resource
  if (resource.isNew) {
    // Set the createdBy field to the current user
    resource.enabled = true
    resource.createdBy = resource.$$user // Replace with the actual user ID
  } else {
    let previousVersion
    console.warn(resource)
    if (resource.enabled === true) {
      // If it's an update, save the previous version to ResourceVersions
      previousVersion = new ResourceVersions({
        resourceId: resource._id,
        previousVersion: resource._id,
        operation: 'update',
        performedBy: resource.$$user, // Replace with the actual user ID
      })
    } else {
      // If it's an delete, save the previous version to ResourceVersions
      previousVersion = new ResourceVersions({
        resourceId: resource._id,
        previousVersion: resource._id,
        operation: 'delete',
        performedBy: resource.$$user, // Replace with the actual user ID
      })      
    }
    await previousVersion.save()
  }
})

// Create the models
const User = mongoose.model('User', UserSchema)
const Resource = mongoose.model('Resource', ResourceSchema)
const ResourceVersions = mongoose.model('ResourceVersions', ResourceVersionsSchema)

// Usage example
try {
// Create a user
const user = new User({ name: 'John Doe' })
await user.save()

// Create a resource
const resource = new Resource({ content: 'Sample content', $$user: user._id })
await resource.save()

// Update the resource
resource.content = 'Updated content'
resource.$$user = user._id
await resource.save()

// Delete the resource
resource.enabled = false
resource.$$user = user._id
await resource.save()

// // Find all versions of a resource
// const versions = await ResourceVersions.find({ resourceId: resource._id }).populate('performedBy')
// console.log(versions)
} catch (error) {
  console.warn(error)
}
