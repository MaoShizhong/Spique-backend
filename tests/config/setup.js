const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const user_router = require('../../routes/user_router');
const message_router = require('../../routes/message_router');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use('/user', user_router);
app.use('/messages', message_router);

async function initializeMongoServer() {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    mongoose.connect(mongoUri);

    mongoose.connection.on('error', (e) => {
        if (e.message.code === 'ETIMEDOUT') {
            console.log(e);
            mongoose.connect(mongoUri);
        }

        console.log(e);
    });

    mongoose.connection.once('open', () => {
        console.log(`MongoDB successfully connected to test DB: ${mongoUri}`);
    });
}

module.exports = { app, initializeMongoServer };
