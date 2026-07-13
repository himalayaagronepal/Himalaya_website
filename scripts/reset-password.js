(async function(){
  try{
    require('dotenv').config({ path: '.env.local' });
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
    const bcrypt = require('bcryptjs');
    const email = process.env.RESET_EMAIL || process.argv[2];
    const newPass = process.env.RESET_PASSWORD || process.argv[3];
    if (!email || !newPass) {
      console.error('Usage: node scripts/reset-password.js <email> <newPassword>');
      process.exit(1);
    }
    const userSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String }, { timestamps: true });
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const user = await User.findOne({ email }).exec();
    if (!user) {
      console.error('user-not-found');
      process.exit(2);
    }
    const hashed = await bcrypt.hash(newPass, 10);
    await User.updateOne({ email }, { $set: { password: hashed } });
    const updated = await User.findOne({ email }).lean();
    const ok = await bcrypt.compare(newPass, updated.password || '');
    console.log('reset_ok', ok, 'email', email, 'id', updated._id.toString());
    await mongoose.disconnect();
    process.exit(0);
  }catch(err){
    console.error(err);
    process.exit(1);
  }
})();