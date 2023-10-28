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
const { localStrategy, githubStrategy } = require('./passport/strategies');
const { serialize, deserialize } = require('./passport/serialize');

passport.use(localStrategy);
passport.use(githubStrategy);

passport.serializeUser(serialize);
passport.deserializeUser(deserialize);

/*
    - Initialise middleware
*/

app.use(logger('dev'));
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.ALLOWED_ORIGINS.split(','),
        credentials: true,
    })
);
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ client: mongoose.connection.getClient() }),
        cookie: {
            // secure: process.env.MODE === 'prod',
            secure: true,
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days (refreshed every successful request)
            // httpOnly: process.env.MODE === 'prod',
            httpOnly: false,
            sameSite: process.env.MODE === 'prod' ? 'none' : 'lax',
        },
    })
);
app.use(passport.initialize());
app.use(passport.session());

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
