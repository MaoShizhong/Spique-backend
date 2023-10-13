const request = require('supertest');
const channelRouter = require('../routes/channel_router');
const express = require('express');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use('/channels', channelRouter);

const { channelUserIDs } = require('./config/test_IDs');
const { messages } = require('./config/test_messages');

const nonexistantObjectID = '65269890203feea7cca8826b';
const users = channelUserIDs.map((objectId) => objectId.valueOf());
const channel0 = require('./config/test_channels').channels[0]._id.valueOf();
const channel1 = require('./config/test_channels').channels[1]._id.valueOf();

const messageIDs = messages.map((message) => message._id.valueOf());

const oneToNinety = Array.from(Array(91).keys()).slice(1);
const oneToNinetyStrings = oneToNinety.reverse().map((number) => number.toString());
const MESSAGES_PER_PAGE = 40;

const MESSAGE_CHAR_LIMIT = 2000;
const overlyLongText = 'a'.repeat(MESSAGE_CHAR_LIMIT + 1);

describe('GET messages', () => {
    it(`Returns up to the latest ${MESSAGES_PER_PAGE} messages in a channel by default (either omitting or with a page query of 1)`, async () => {
        const getRes0 = await request(app).get(`/channels/${channel0}/messages?page=1`);
        expect(getRes0.status).toBe(200);

        const messages = getRes0.body.map((message) => message.text);
        expect(messages).toEqual([
            'user1->user0 message2',
            'user0->user1 message1',
            'user0->user1 message0',
        ]);

        const getRes1 = await request(app).get(`/channels/${channel1}/messages`);
        expect(getRes1.status).toBe(200);

        const firstFortyMessages = getRes1.body.map((message) => message.text);
        expect(firstFortyMessages).toEqual(oneToNinetyStrings.slice(0, MESSAGES_PER_PAGE));
    });

    it(`Returns max. ${MESSAGES_PER_PAGE} further messages when a page query (greater than 1) is sent`, async () => {
        const getPage2Res = await request(app).get(`/channels/${channel1}/messages?page=2`);
        expect(getPage2Res.status).toBe(200);
        const nextThirtyMessages = getPage2Res.body.map((message) => message.text);
        expect(nextThirtyMessages).toEqual(
            oneToNinetyStrings.slice(MESSAGES_PER_PAGE, MESSAGES_PER_PAGE * 2)
        );

        const getPage3Res = await request(app).get(`/channels/${channel1}/messages?page=3`);
        expect(getPage3Res.status).toBe(200);
        const lastTenMessages = getPage3Res.body.map((message) => message.text);
        expect(lastTenMessages).toEqual(oneToNinetyStrings.slice(MESSAGES_PER_PAGE * 2));
    });

    it('Returns a 400 if the page query is present but cannot be parsed as an int >= 1', async () => {
        const zeroRes = await request(app).get(`/channels/${channel1}/messages?page=0`);
        const NaNRes = await request(app).get(`/channels/${channel1}/messages?page=foobar`);
        expect(zeroRes.status).toBe(400);
        expect(NaNRes.status).toBe(400);
    });

    it('Returns a 404 if no messages could be found from a valid page query (int >= 1)', async () => {
        const threeMessagesRes = await request(app).get(`/channels/${channel0}/messages?page=2`);
        const eightyMessagesRes = await request(app).get(`/channels/${channel1}/messages?page=4`);
        expect(threeMessagesRes.status).toBe(404);
        expect(eightyMessagesRes.status).toBe(404);
    });
});

describe('POST messages', () => {
    it('Returns the newly sent message as JSON upon a successful send from a valid channel participant', async () => {
        return request(app)
            .post(`/channels/${channel0}/messages?userID=${users[0]}`)
            .type('form')
            .send({ text: 'foobar' })
            .expect('Content-Type', /json/)
            .expect(201)
            .then((res) => {
                expect(res.body).toMatchObject({
                    user: users[0],
                    channel: channel0,
                    text: 'foobar',
                });
            });
    });

    it('Includes the newly added message (sorted latest->earliest) when getting channel messages', async () => {
        return request(app)
            .get(`/channels/${channel0}/messages`)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.body.length).toBe(4);
                expect(res.body[0].text).toEqual('foobar');
            });
    });

    it(`Rejects message if the text exceeds the ${MESSAGE_CHAR_LIMIT} character limit`, (done) => {
        request(app)
            .post(`/channels/${channel0}/messages`)
            .type('form')
            .send({ text: overlyLongText })
            .expect(400, done);
    });

    it('Returns a 400 if no user query is provided or user query/channelID is an invalid ObjectId', async () => {
        const res = await request(app).post(`/channels/${channel1}/messages`);
        expect(res.status).toBe(400);

        const res2 = await request(app).post(`/channels/${channel1}/messages?userID=foobar`);
        expect(res2.status).toBe(400);

        const res3 = await request(app).post(`/channels/foobar/messages?userID=${users[0]}`);
        expect(res3.status).toBe(400);
    });

    it('Returns a 404 if the requested channel could not be found', async () => {
        const res = await request(app).post(`/channels/${nonexistantObjectID}/messages`);
        expect(res.status).toBe(400);
    });

    it('Returns a 403 if the queried user is not a participant in the channel (includes nonexistant userID)', (done) => {
        request(app)
            .post(`/channels/${channel0}/messages?userID=${nonexistantObjectID}`)
            .type('form')
            .send({ text: 'foobar' })
            .expect(403, done);
    });
});

describe('PUT messages', () => {
    it('Edits an existing message written by the requester', async () => {
        return request(app)
            .put(`/channels/${channel0}/messages/${messageIDs[0]}?userID=${users[0]}`)
            .type('form')
            .send({ text: 'barfoo' })
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.body).toMatchObject({
                    _id: messageIDs[0],
                    user: users[0],
                    channel: channel0,
                    text: 'barfoo',
                    edited: true,
                });
            });
    });

    it('Editing a message does not add or remove any messages to the channel', async () => {
        return request(app)
            .get(`/channels/${channel0}/messages`)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.body.length).toBe(4);
                expect(res.body.at(-1).text).toEqual('barfoo');
                expect(res.body.at(-1).edited).toBe(true);
            });
    });

    it(`Prevents editing a message if the new text exceeds the ${MESSAGE_CHAR_LIMIT} character limit`, (done) => {
        request(app)
            .put(`/channels/${channel0}/messages/${messageIDs[0]}`)
            .type('form')
            .send({ text: overlyLongText })
            .expect(400, done);
    });

    it(`Prevents editing a message not written by the requester - returns 403`, (done) => {
        request(app)
            .put(`/channels/${channel0}/messages/${messageIDs[0]}?userID=${users[1]}`)
            .type('form')
            .send({ text: 'I did not write this!' })
            .expect(403, done);
    });

    it('Returns a 400 if any of the provided params/query are not valid ObjectIds, or if the userID query is omitted', async () => {
        const res = await request(app).put(
            `/channels/${channel1}/messages/foobar?userID=${users[1]}`
        );
        const res2 = await request(app).put(
            `/channels/foobar/messages/${messageIDs[0]}?userID=${users[1]}`
        );
        const res3 = await request(app).put(`/channels/${channel1}/messages/${messageIDs[0]}`);

        expect(res.status).toBe(400);
        expect(res2.status).toBe(400);
        expect(res3.status).toBe(400);
    });

    it('Returns a 404 if the requested channel or message do not exist in the database', async () => {
        const res = await request(app)
            .put(`/channels/${channel1}/messages/${nonexistantObjectID}?userID=${users[1]}`)
            .type('form')
            .send({ text: "Message doesn't exist!" });
        const res2 = await request(app)
            .put(`/channels/${nonexistantObjectID}/messages/${users[0]}?userID=${users[1]}`)
            .type('form')
            .send({ text: "Channel doesn't exist!" });

        expect(res.status).toBe(404);
        expect(res2.status).toBe(404);
    });
});

describe('DELETE messages', () => {
    it('Deletes a message when requested by the message author (removes it entirely)', async () => {
        const deleteRes = await request(app).delete(
            `/channels/${channel0}/messages/${messageIDs[0]}?userID=${users[0]}`
        );
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body).toEqual({ _id: messageIDs[0] });

        const getRes = await request(app).get(`/channels/${channel0}/messages`);
        expect(getRes.status).toBe(200);
        expect(getRes.body.length).toBe(3);
        expect(getRes.body).toEqual(
            expect.arrayContaining([expect.not.objectContaining({ _id: messageIDs[0] })])
        );
    });

    it('Returns a 400 if any of the provided params/query are not valid ObjectIds, or if the userID query is omitted', async () => {
        const res = await request(app).delete(
            `/channels/${channel1}/messages/foobar?userID=${users[1]}`
        );
        const res2 = await request(app).delete(
            `/channels/foobar/messages/${messageIDs[0]}?userID=${users[1]}`
        );
        const res3 = await request(app).delete(`/channels/${channel1}/messages/${messageIDs[0]}`);

        expect(res.status).toBe(400);
        expect(res2.status).toBe(400);
        expect(res3.status).toBe(400);
    });

    it(`Prevents message deletion and returns 404 if a message could not be found with the given channel, user and messageIDs`, async () => {
        const res = await request(app).delete(
            `/channels/${channel0}/messages/${messageIDs[2]}?userID=${users[0]}`
        );
        const res2 = await request(app).delete(
            `/channels/${channel0}/messages/${nonexistantObjectID}?userID=${users[0]}`
        );
        const res3 = await request(app).delete(
            `/channels/${nonexistantObjectID}/messages/${messageIDs[2]}?userID=${users[0]}`
        );

        expect(res.status).toBe(404);
        expect(res2.status).toBe(404);
        expect(res3.status).toBe(404);

        const getRes = await request(app).get(`/channels/${channel0}/messages`);
        expect(getRes.status).toBe(200);
        expect(getRes.body.length).toBe(3);
    });
});
