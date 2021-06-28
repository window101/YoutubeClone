
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required:true, unique:true },
    socialOnly: {type: Boolean, default: false},
    username: {type: String, required:true, unique: true},
    password: {type: String},
    name: {type: String, required:true},
    location: String,
})

userSchema.pre("save", async function() { // User가 form에 입력하고 db에 저장되기 전에 실행되는 미들웨어
    // this : create되는 User를 가리킨다
    //console.log("User password", this.password);
    this.password = await bcrypt.hash(this.password, 5);
    //console.log("Hashed password", this.password);
})

const User = mongoose.model('User', userSchema);

export default User;