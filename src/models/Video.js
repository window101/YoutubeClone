
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title : { type: String, required: true, trim: true, maxLength: 80},
    description : {type: String, required:true, trim: true, minLength: 20 },
    createdAt : { type: Date, required: true, default: Date.now },
    hashtags: [{ type: String, trim: true}],
    meta: {
        views: { type:Number, default:0, required:true },
        rating: { type:Number, default:0, required:true },
    },
});

videoSchema.pre('save', async function() { // mongoose middleware, 모델 생성전에 정의해야 함
    console.log('pre hashtags', this.hashtags);
    this.hashtags = this.hashtags[0]
    .split(",")
    .map((word) => word.startsWith('#') ? word : `#${word}`)
    console.log('after hashtags', this.hashtags);
})


const Video = mongoose.model("Video", videoSchema);

export default Video;