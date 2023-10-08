const request = require('supertest');
const userRouter = require('../routes/user_router');
const express = require('express');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use('/users', userRouter);

describe('GET /users', () => {
    test('In-memory database has 3 test users loaded on test start', (done) => {
        request(app)
            .get('/users')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect((res) => res.body.users.length === 3)
            .expect(200, done);
    });

    it('Gets user0 from in-memory test database', (done) => {
        request(app)
            .get('/users/65218a70437ced46f36858d8')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect({ username: 'user0' })
            .expect(200, done);
    });

    it('Returns 404 when fetching non-existant user', (done) => {
        request(app)
            .get('/users/65218a70437ced46f36858d9')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect({ error: 'User not found' })
            .expect(404, done);
    });

    it('Returns 400 when fetching with invalid ObjectID pattern', (done) => {
        request(app)
            .get('/users/65218a70437ced46f36858dk')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect({ error: 'Invalid ObjectID pattern' })
            .expect(400, done);
    });
});

describe('POST /users', () => {
    it('Adds a fourth user to the test database if all form fields pass validation', (done) => {
        request(app)
            .post('/users')
            .type('form')
            .send({
                username: 'user3',
                email: 'user3@test.com',
                password: 'asdfASDF3',
                friends: [],
            })
            .then(() => {
                request(app)
                    .get('/users')
                    .expect((res) => {
                        if (res.body.users.length !== 4) throw new Error('User was not added');
                    })
                    .end(done);
            });
    });

    it('Rejects new user submission if password does not match constraints', (done) => {
        request(app)
            .post('/users')
            .type('form')
            .send({
                username: 'user4',
                email: 'user4@test.com',
                password: 'password',
                friends: [],
            })
            .then(() => {
                request(app)
                    .get('/users')
                    .expect((res) => {
                        if (res.body.users.length !== 4) throw new Error('User incorrectly added');
                    })
                    .end(done);
            });
    });
});

describe('PUT /users', () => {
    const { testUsers } = require('./config/friend_test_docs');

    it("Stores user1 as pending friend in user0's friends list upon friend request", (done) => {
        request(app)
            .put('/users/65218a70437ced46f36858d8/friends?action=add&user=65218ac212fde91aa80bd115')
            .then(() => {
                request(app)
                    .get('/users/65218a70437ced46f36858d8')
                    .expect({ user: testUsers.user0AddedUser1 }, done);
            });
    });

    it("Adds the incoming friend request to user1's friends list before accept", (done) => {
        request(app)
            .get('/users/65218a70437ced46f36858d8')
            .expect({ user: testUsers.user1IncomingUser0 }, done);
    });

    it("Marks both user's pending friend request as accepted with user1 accepts the request", (done) => {
        request(app)
            .put(
                '/users/65218ac212fde91aa80bd115/friends?action=accept&user=65218a70437ced46f36858d8'
            )
            .then(() => {
                request(app)
                    .get('/users/65218a70437ced46f36858d8')
                    .expect({ user: testUsers.user0FriendedUser1 })
                    .get('/users/65218ac212fde91aa80bd115')
                    .expect({ user: testUsers.user1FriendedUser0 }, done);
            });
    });

    it('Adds requested friend to user1 and incoming friend request to user2 upon friend request', (done) => {
        request(app)
            .put('/users/65218ac212fde91aa80bd115/friends?action=add&user=65218ac5dc04264ac8a44906')
            .then(() => {
                request(app)
                    .get('/users/65218ac212fde91aa80bd115')
                    .expect({ user: testUsers.user1AddedUser2 })
                    .get('/users/65218ac5dc04264ac8a44906')
                    .expect({ user: testUsers.user2IncomingUser1 }, done);
            });
    });

    it("Removes pending entry from both users' friends lists upon rejection", (done) => {
        request(app)
            .put(
                '/users/65218ac5dc04264ac8a44906/friends?action=reject&user=65218ac212fde91aa80bd115'
            )
            .then(() => {
                request(app)
                    .get('/users/65218ac212fde91aa80bd115')
                    .expect({ user: testUsers.user1RejectedByUser2 })
                    .get('/users/65218ac5dc04264ac8a44906')
                    .expect({ user: testUsers.user2ARejectedUser1 }, done);
            });
    });
});

describe('DELETE /users', async () => {
    const User = require('../models/User');
    const user3 = await User.findOne({ username: 'user3' }).exec();

    it('Deletes user3', (done) => {
        request(app)
            .delete(`/users/${user3._id}`)
            .then(() => {
                request(app)
                    .get('/users')
                    .expect((res) => {
                        if (res.body.users.length !== 3) throw new Error('User not deleted');
                    })
                    .expect((res) => {
                        if (res.body.users.find((user) => user.username === 'user3'))
                            throw new Error('user3 was not deleted');
                    })
                    .end(done);
            });
    });

    it('Returns 404 upon an attempt to delete a non-existant user', (done) => {
        request(app)
            .delete('/users/62218a22128de91a680ba11b')
            .expect({ error: 'User not found' })
            .expect(404, done);
    });
});
