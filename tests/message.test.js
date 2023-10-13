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
const channel0 = require('./config/test_channels').channels[0];
const channel1 = require('./config/test_channels').channels[1];
const messageIDs = messages.map((message) => message._id.valueOf());

const oneToEighty = Array.from(Array(81).keys()).slice(1);
const oneToEightyStrings = oneToEighty.map((number) => number.toString());

describe('GET messages', () => {
    it('Returns up to the latest 40 messages in a channel by default (either omitting or with a page query of 1)', async () => {
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
        expect(firstFortyMessages).toEqual(oneToSeventyStrings.slice(0, 40));
    });

    it('Returns max. 30 further messages when a page query (greater than 1) is sent', async () => {
        const getPage2Res = await request(app).get(`/channels/${channel1}/messages?page=2`);
        expect(getPage2Res.status).toBe(200);
        const nextThirtyMessages = getPage2Res.body.map((message) => message.text);
        expect(nextThirtyMessages).toEqual(nextThirtyMessages.slice(41, 70));

        const getPage3Res = await request(app).get(`/channels/${channel1}/messages?page=3`);
        expect(getPage3Res.status).toBe(200);
        const lastTenMessages = getPage3Res.body.map((message) => message.text);
        expect(lastTenMessages).toEqual(lastTenMessages.slice(70));
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
            .post(`/channels/${channel0}/messages?user=${users[0]}`)
            .type('form')
            .send({ text: 'foobar' })
            .expect('Content-Type', /json/)
            .expect(201)
            .then((res) => {
                expect(res.body).toMatchObject({
                    user: users[0],
                    channel: channel0,
                    test: 'foobar',
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

    it('Returns a 400 if no user query is provided or is an invalid ObjectId', async () => {
        const res = await request(app).post(`/channels/${channel1}/messages`);
        expect(res.status).toBe(400);

        const res2 = await request(app).post(`/channels/${channel1}/messages?userID=foobar`);
        expect(res2.status).toBe(400);
    });

    it('Returns a 403 if the queried user is not a participant in the channel', async () => {
        const res = await request(app).post(
            `/channels/${channel0}/messages?userID=${nonexistantObjectID}`
        );
    });
});
