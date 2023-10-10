const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const logger = require('morgan');
require('dotenv').config();

const app = express();

/*
    - Mongoose setup
*/
mongoose.set('strictQuery', false);

async function connectToDatabase() {
    await mongoose.connect(process.env.CONNECTION_STRING);
}

try {
    connectToDatabase();
    console.log('Connected to MongoDB');
} catch (error) {
    console.error(error);
    process.exit(1);
}

/*
    - Initialise middleware
*/
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    cors({
        origin: ['https://spique.netlify.app', 'http://localhost:5173'],
        credentials: true,
        exposedHeaders: 'Authorization',
    })
);

const userRouter = require('./routes/user_router');

app.use('/users', userRouter);

/*
    - Listen
*/

const PORT = process.env.PORT || '3000';

try {
    app.listen(PORT);
    console.log(`Listening on port: ${PORT}`);
} catch (error) {
    console.error('Could not listen:', error);
}
