const request = require('supertest');
const userRouter = require('../routes/user_router');
const channelRouter = require('../routes/channel_router');
const express = require('express');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use('/users', userRouter);
app.use('/channels', channelRouter);

const { channelUserIDs } = require('./config/test_IDs');
const { channelUsers } = require('./config/test_users');
const { channels } = require('./config/test_channels');

const nonexistantObjectID = '65269890203feea7cca8826b';
const users = channelUserIDs.map((objectId) => objectId.valueOf());
const testChannels = channels.map((channel) => {
    return {
        _id: channel._id.valueOf(),
        participants: channel.participants.map((participant) => {
            const user = channelUsers.find(
                (person) => person._id.valueOf() === participant._id.valueOf()
            );
            return { username: user.username };
        }),
    };
});

describe('GET channels', () => {
    it('Returns a list of all channels (objectIDs) a user is in when getting their info', () => {
        return request(app)
            .get(`/users/${users[0]}/channels`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.body).toEqual(testChannels);
            });
    });

    it('GET /channels/:channelID lists all channel participants (viewed by channelUser0)', () => {
        return request(app)
            .get(`/channels/${testChannels[0]._id}?userID=${users[0]}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.body).toEqual({
                    _id: testChannels[0]._id,
                    name: 'channelUser1 & channelUser2',
                    participants: expect.arrayContaining([
                        { _id: users[0], username: 'channelUser0' },
                        { _id: users[1], username: 'channelUser1' },
                        { _id: users[2], username: 'channelUser2' },
                    ]),
                });
            });
    });

    it('Returns a 400 if user query could not find a valid user, or no user query provided', (done) => {
        request(app).get(`/channels/${testChannels[0]._id}`).expect(400, done);
    });

    it('Returns a 400 if requested channelID or user query are not valid objectID patterns', async () => {
        const [invalidChannelRes, invalidUserRes] = await Promise.all([
            request(app).get(`/channels/foobar?userID=${users[0]}`),
            request(app).get(`/channels/${testChannels[0]._id}?user=foobar`),
        ]);

        expect(invalidChannelRes.status).toBe(400);
        expect(invalidUserRes.status).toBe(400);
    });

    it('Returns a 404 when provided channelID or userID (valid objectID) do not exist in DB', async () => {
        const [nonexistantChannelRes, nonexistantUserRes] = await Promise.all([
            request(app).get(`/channels/${nonexistantObjectID}?userID=${users[0]}`),
            request(app).get(`/channels/${testChannels[0]._id}?userID=${nonexistantObjectID}`),
        ]);

        expect(nonexistantChannelRes.status).toBe(404);
        expect(nonexistantUserRes.status).toBe(404);
    });
});

describe('POST channels', () => {
    it('Creates a channel when opened by a user who is friends with all added participants', async () => {
        const res = await request(app).post(
            `/channels?creator=${users[0]}&participants=${users[1]},${users[2]}`
        );
        expect(res.status).toBe(200);

        const newChannelRes = await request(app).get(
            `${res.body.newChannelURL}?userID=${users[0]}`
        );
        expect(newChannelRes.status).toBe(200);
        expect(newChannelRes.body).toMatchObject({
            name: 'channelUser1 & channelUser2',
            participants: expect.arrayContaining([
                { _id: users[0], username: 'channelUser0' },
                { _id: users[1], username: 'channelUser1' },
                { _id: users[2], username: 'channelUser2' },
            ]),
        });
    });

    it('Creates another channel when opened by a user who is friends with all added participants', async () => {
        const res = await request(app).post(
            `/channels?creator=${users[2]}&participants=${users[0]}`
        );
        expect(res.status).toBe(200);

        const newChannelRes = await request(app).get(
            `${res.body.newChannelURL}?userID=${users[2]}`
        );
        expect(newChannelRes.status).toBe(200);
        expect(newChannelRes.body).toMatchObject({
            name: 'channelUser0',
            participants: expect.arrayContaining([
                { _id: users[0], username: 'channelUser0' },
                { _id: users[2], username: 'channelUser2' },
            ]),
        });
    });

    it('Does not create a channel if two users are not friends', (done) => {
        request(app)
            .post(`/channels?creator=${users[2]}&participants=${users[1]}`)
            .expect(403, done);
    });

    it('Does not create a channel if any of the provided user ObjectIDs are invalid ObjectIDs', (done) => {
        request(app).post(`/channels?creator=foobar&participants=${users[1]}`).expect(400, done);
    });

    it('Does not create a channel if any of the provided user _ids do not exist in the database', (done) => {
        request(app)
            .post(`/channels?creator=${users[2]}&participants=${nonexistantObjectID}`)
            .expect(403, done);
    });
});

describe('PUT /channels (adding members to and leaving channels)', () => {
    it('Adds a user to a channel if the user adding them is their friend', async () => {
        const putRes = await request(app).put(
            `/channels/${testChannels[1]._id}?action=add&requester=${users[0]}&target=${users[2]}`
        );
        expect(putRes.status).toBe(200);

        const getRes = await request(app).get(
            `/channels/${testChannels[1]._id}?userID=${users[0]}`
        );
        expect(getRes.status).toBe(200);
        expect(getRes.body).toMatchObject({
            name: 'channelUser1 & channelUser2',
            participants: expect.arrayContaining([
                { _id: users[0], username: 'channelUser0' },
                { _id: users[1], username: 'channelUser1' },
                { _id: users[2], username: 'channelUser2' },
            ]),
        });
    });

    it('Does not add a user to a channel if the user adding them is not their friend', async () => {
        const putRes = await request(app).put(
            `/channels/${testChannels[1]._id}?action=add&requester=${users[0]}&target=${users[3]}`
        );
        expect(putRes.status).toBe(403);

        const getRes = await request(app).get(
            `/channels/${testChannels[1]._id}?userID=${users[0]}`
        );
        expect(getRes.status).toBe(200);
        expect(getRes.body).toMatchObject({
            name: 'channelUser1 & channelUser2',
            participants: expect.arrayContaining([
                { _id: users[0], username: 'channelUser0' },
                { _id: users[1], username: 'channelUser1' },
                { _id: users[2], username: 'channelUser2' },
            ]),
        });
    });

    it('Prevents adding a user to a channel if they are already in it - returns 400', async () => {
        const putRes = await request(app).put(
            `/channels/${testChannels[1]._id}?action=add&requester=${users[0]}&target=${users[2]}`
        );
        expect(putRes.status).toBe(400);

        const getRes = await request(app).get(
            `/channels/${testChannels[1]._id}?userID=${users[0]}`
        );
        expect(getRes.status).toBe(200);
        expect(getRes.body).toMatchObject({
            name: 'channelUser1 & channelUser2',
            participants: expect.arrayContaining([
                { _id: users[0], username: 'channelUser0' },
                { _id: users[1], username: 'channelUser1' },
                { _id: users[2], username: 'channelUser2' },
            ]),
        });
    });

    it('Removes user when they leave a channel they are in', async () => {
        const putRes = await request(app).put(
            `/channels/${testChannels[1]._id}?action=leave&requester=${users[2]}`
        );
        expect(putRes.status).toBe(200);

        const getRes = await request(app).get(
            `/channels/${testChannels[1]._id}?userID=${users[0]}`
        );
        expect(getRes.status).toBe(200);
        expect(getRes.body).toMatchObject({
            name: 'channelUser1',
            participants: expect.arrayContaining([
                { _id: users[0], username: 'channelUser0' },
                { _id: users[1], username: 'channelUser1' },
            ]),
        });
    });

    it('Returns 404 if a user attempts to leave a channel they are not already in', async () => {
        const putRes = await request(app).put(
            `/channels/${testChannels[1]._id}?action=leave&requester=${users[2]}`
        );
        expect(putRes.status).toBe(404);
    });

    it('Returns 400 if trying to add a user without including a target user query', async () => {
        const putRes = await request(app).put(
            `/channels/${testChannels[1]._id}?action=add&requester=${users[0]}`
        );
        expect(putRes.status).toBe(400);
    });

    it('Returns 404 if any userID provided does not exist in the database', async () => {
        const [resOne, resTwo, resThree] = await Promise.all([
            request(app).put(
                `/channels/${testChannels[1]._id}?action=add&requester=${nonexistantObjectID}&target=${users[0]}`
            ),
            request(app).put(
                `/channels/${testChannels[1]._id}?action=add&requester=${users[0]}&target=${nonexistantObjectID}`
            ),
            request(app).put(
                `/channels/${testChannels[1]._id}?action=leave&requester=${nonexistantObjectID}`
            ),
        ]);

        expect([resOne, resTwo, resThree].every((res) => res.status === 404)).toBe(true);
    });

    it('Deletes channel when the last participant leaves', async () => {
        const firstLeaveRes = await request(app).put(
            `/channels/${testChannels[1]._id}?action=leave&requester=${users[1]}`
        );
        expect(firstLeaveRes.status).toBe(200);

        const secondLeaveRes = await request(app).put(
            `/channels/${testChannels[1]._id}?action=leave&requester=${users[0]}`
        );
        expect(secondLeaveRes.status).toBe(200);

        const getRes = await request(app).get(
            `/channels/${testChannels[1]._id}?userID=${users[0]}`
        );
        expect(getRes.status).toBe(404);
    });
});
