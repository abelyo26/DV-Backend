import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: { required: true, type: String },
    lastName: { type: String },
    email: { required: true, type: String, unique: true },
    emailVerified: { default: false, type: Boolean },
    password: { type: String },
    isSupport: { type: Boolean, default: true },
    isSystemAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.pre('save', async function callback(next) {
  this.wasNew = this.isNew;
  next();
});

userSchema.post('save', async function cb(doc, next) {
  // Send activation email to new users user and if not on test environment
  if (this.wasNew) {
    const { email, _id, password } = this;

    // if (nodeEnv !== 'test' && password) {
    // }
  }

  next();
});

export default userSchema;
