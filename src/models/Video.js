
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title : { type: String, required: true, trim: true, maxLength: 80},
    fileUrl: {type : String, required:true }, // 비디오가 실제로 존재하는 경로
    description : {type: String, required:true, trim: true, minLength: 20 },
    createdAt : { type: Date, required: true, default: Date.now },
    hashtags: [{ type: String, trim: true}],
    meta: {
        views: { type:Number, default:0, required:true },
        rating: { type:Number, default:0, required:true },
    },
    comments: [{type: mongoose.Schema.Types.ObjectId, required:true, ref:"Comment"}],
    owner: {type:mongoose.Schema.Types.ObjectId, required:true , ref: "User"}, // User model의 object id를 저장
});

videoSchema.static('formatHashtags', function(hashtags) { // Video.create와 같이 자체적으로 만들 수 있다.
    return hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);

export default Video;