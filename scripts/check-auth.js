(async function(){
  try{
    require('dotenv').config({ path: '.env.local' });
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
    const bcrypt = require('bcryptjs');
    const userSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String }, { timestamps: true });
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const emails = ['user@example.com','signup-test@example.com'];
    for(const e of emails){
      const user = await User.findOne({ email: e }).lean();
      console.log('email:', e, 'exists?', !!user);
      if(user){
        console.log('  id:', user._id.toString());
        console.log('  hasPassword:', !!user.password, 'len:', user.password ? user.password.length : 0);
        const ok = await bcrypt.compare('password123', user.password || '');
        console.log('  password123 matches?', ok);
      }
    }
    await mongoose.disconnect();
    process.exit(0);
  }catch(err){
    console.error(err);
    process.exit(1);
  }
})();