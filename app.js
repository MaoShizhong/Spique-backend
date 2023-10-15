const cors = require('cors');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const logger = require('morgan');
require('dotenv').config();

const app = express();

/*
- Mongoose setup
*/
const mongoose = require('mongoose');

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
    - Initialise passport
*/
const passport = require('passport');
const LocalStrategy = require('./passport/strategies');
const { serialize, deserialize } = require('./passport/serialize');

passport.use(LocalStrategy);

passport.serializeUser(serialize);
passport.deserializeUser(deserialize);

/*
    - Initialise middleware
*/
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({ client: mongoose.connection.getClient() }),
        cookie: {
            secure: process.env.MODE === 'prod',
            maxAge: 10 * 60 * 1000,
            httpOnly: process.env.MODE === 'prod',
        },
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
    cors({
        origin: process.env.ALLOWED_ORIGINS.split(','),
        credentials: true,
    })
);

/*
    - Initialise routers
*/
const authRouter = require('./routes/auth_router');
const userRouter = require('./routes/user_router');
const channelRouter = require('./routes/channel_router');

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/channels', channelRouter);

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
