import express from 'express';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';

import { ConnectDB } from './Config/db.config.js';
import userRoutes from './Routes/user.routes.js';
import videoRoutes from './Routes/video.routes.js';
import commentRoutes from './Routes/comment.routes.js';

dotenv.config();

const app = express();
ConnectDB();

app.use(bodyParser.json());

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}))

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/video', videoRoutes);
app.use('/api/v1/comment', commentRoutes);


// app.get("/", (req, res) => {
//     res.status(200).send(`Welcome to our homepage`);
// })

app.listen(process.env.PORT, () => {
    console.log(`Server is running at Localhost:${process.env.PORT}`);
})


//bearer token
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGFjMjlhODJmZjk4ZmM0NjA5NDliMzIiLCJDaGFubmVsTmFtZSI6IkhlbGxvQml0dHUiLCJlbWFpbCI6ImJpdHR1QGdtYWlsLmNvbSIsInBob25lIjoiODkyNzU2NzIzIiwibG9nb0lkIjoieTJ3cHF4Znk0cjhnNmc0bHlkbnIiLCJpYXQiOjE3NTYxMTMzNjYsImV4cCI6MTc1Njk3NzM2Nn0.fTimB0l1IVJUBlUup0D_i5RG-4Ak82bfkOh0F9JynEs