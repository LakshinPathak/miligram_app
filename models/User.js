const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true , unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String },
  profileImageUrl: { type: String }
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

module.exports = mongoose.model('User', UserSchema);
