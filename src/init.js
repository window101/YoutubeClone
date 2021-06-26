

import "./db"; // db.js 파일 import 하면 자동 실행됨
import "./models/Video";
import "./models/User";
import app from "./server";

const PORT = 4000;
const handleListening = () => {
    console.log(`✔️  Server Listeniung on port ${PORT}`)
}

app.listen(PORT, handleListening);
