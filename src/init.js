
import "regenerator-runtime";
import "dotenv/config"; 
import "./db.js"; // db.js 파일 import 하면 자동 실행됨
import "./models/Video.js";
import "./models/User.js";
import "./models/Comment.js";
import app from "./server.js";

const PORT = 4000;
const handleListening = () => {
    console.log(`✔️  Server Listeniung on port ${PORT}`)
}

app.listen(PORT, handleListening);
