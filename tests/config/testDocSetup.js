const { users, messages, channels } = require('./test_documents');
const User = require('../../models/User');
const Message = require('../../models/Message');
const Channel = require('../../models/Channel');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);

    mongoose.connection.on('error', async (e) => {
        if (e.message.code === 'ETIMEDOUT') {
            console.log(e);
            await mongoose.connect(mongoUri);
        }
        console.log(e);
    });

    mongoose.connection.once('open', () => {
        console.log(`MongoDB successfully connected to ${mongoUri}`);
    });

    const Users = users.map((user) => new User(user));
    const Messages = messages.map((message) => new Message(message));
    const Channels = channels.map((channel) => new Channel(channel));

    await Promise.all([
        User.insertMany(Users),
        Message.insertMany(Messages),
        Channel.insertMany(Channels),
    ]);
});

afterAll(async () => {
    await mongoose.connection.close();
});
