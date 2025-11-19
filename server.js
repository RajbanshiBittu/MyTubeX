import express from 'express';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';

import { ConnectDB } from './Config/db.config.js';
import userRoutes from './Routes/user.routes.js';
import videoRoutes from './Routes/video.routes.js';
import commentRoutes from './Routes/comment.routes.js';
import dotenv from 'dotenv';
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
