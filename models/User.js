const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// Define the UserSchema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String },
  profileImageUrl: { type: String },
  isAdmin:{ type: Boolean}
});

// Hash password before saving user to the database
// UserSchema.pre('save', async function(next) {
//   const user = this;
//   if (!user.isModified('password')) return next();
//   try {
//     const hashedPassword = await bcrypt.hash(user.password, 10); // Salt rounds: 10
//     user.password = hashedPassword;
//     next();
//   } catch (error) {
//     return next(error);
//   }
// });

// UserSchema.methods.comparePassword = async function(candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// Define the PostSchema
const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  username: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Reference to the User model who liked the post
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Reference to the User who commented
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    person_name: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});




const MasterSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    unique: true
  },
  profileImageUrl: { type: String }
});


// Define the RelationshipSchema
const RelationshipSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  following: {
    type: [String], // Array of strings
    default: [] // Default value as empty array
  },
  followers: {
    type: [String], // Array of strings
    default: [] // Default value as empty array
  }
});


// Create models for both schemas
const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);
const Master = mongoose.model('Master', MasterSchema);
const Relationship = mongoose.model('Relationship', RelationshipSchema);


// Export the models
module.exports = {
  User,
  Post,
  Master,
  Relationship
};
