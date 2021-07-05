
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required:true, unique:true },
    avatarUrl: {type: String},
    socialOnly: {type: Boolean, default: false},
    username: {type: String, required:true, unique: true},
    password: {type: String},
    name: {type: String, required:true},
    location: String,
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
})

userSchema.pre("save", async function() { // User가 form에 입력하고 db에 저장되기 전에 실행되는 미들웨어
    // this : create되는 User를 가리킨다
    
    if(this.isModified("password")) { // 비밀번호가 수정될 때만 해쉬
        this.password = await bcrypt.hash(this.password, 5);
    }
    
    
})

const User = mongoose.model('User', userSchema);

export default User;