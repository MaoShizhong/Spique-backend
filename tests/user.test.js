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
            .expect('Content-Type', /json/)
            .expect((res) => {
                if (res.body.users.length !== 3)
                    throw new Error('In-memory DB did not start with 3 users');
            })
            .expect(200, done);
    });

    it('Returns only _id and usernames when getting all', (done) => {
        request(app)
            .get('/users')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => {
                const containsOnlyExpectedProperties = (user) => {
                    const properties = Object.getOwnPropertyNames(user);
                    const expectedProperties = ['_id', 'username'];

                    return JSON.stringify(properties) === JSON.stringify(expectedProperties);
                };

                if (!res.body.users.every(containsOnlyExpectedProperties)) {
                    throw new Error('Unexpected property/ies returned');
                }
            })
            .end(done);
    });

    it('Gets user0 from in-memory test database, omitting email and password information', () => {
        return request(app)
            .get('/users/65218a70437ced46f36858d8')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.body).toEqual({
                    _id: '65218a70437ced46f36858d8',
                    username: 'user0',
                    friends: [],
                });
            });
    });

    it('Returns 404 when fetching non-existant user', (done) => {
        request(app).get('/users/65218a70437ced46f36858d9').expect(404, done);
    });

    it('Returns 400 when fetching with invalid ObjectID pattern', (done) => {
        request(app).get('/users/65218a70437ced46f36858dk').expect(400, done);
    });
});

describe('POST /users', () => {
    it('Adds a fourth user to the test database if all form fields pass validation', () => {
        return request(app)
            .post('/users')
            .type('form')
            .send({
                username: 'user3',
                email: 'user3@test.com',
                password: 'asdfASDF3',
                confirm: 'asdfASDF3',
            })
            .expect(201)
            .then(() => {
                request(app)
                    .get('/users')
                    .expect(200)
                    .expect((res) => {
                        if (res.body.users.length !== 4) throw new Error('User was not added');
                    })
                    .then((response) => {
                        expect(response.body.users.at(-1)).toMatchObject({
                            username: 'user3',
                        });
                    });
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
                confirm: 'password',
            })
            .expect(400)
            .then(() => {
                request(app)
                    .get('/users')
                    .expect((res) => {
                        if (res.body.users.length !== 4) throw new Error('User incorrectly added');
                    })
                    .end(done);
            });
    });

    it('Rejects new user submission if password fields do not match', (done) => {
        request(app)
            .post('/users')
            .type('form')
            .send({
                username: 'user4',
                email: 'user4@test.com',
                password: 'asdfASDF4',
                confirm: '4FDSAfdsa',
            })
            .expect(400)
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

describe.skip('PUT /users', () => {
    async function getUser3() {
        const User = require('../models/User');
        return await User.findOne({ username: 'user3' }).exec();
    }

    const user3 = getUser3();

    it("Stores user3 as pending friend in user0's friends list upon friend request", () => {
        return request(app)
            .put(`/users/65218a70437ced46f36858d8/friends?action=add&user=${user3._id}`)
            .expect(200)
            .then(() => {
                request(app)
                    .get('/users/65218a70437ced46f36858d8')
                    .then((res) => {
                        expect(res.body.friends).toEqual([{ _id: user3._id, status: 'requested' }]);
                    });
            });
    });

    it("Adds the incoming friend request to user3's friends list before accept", () => {
        return request(app)
            .get(`/users/${user3._id}`)
            .expect(200)
            .then((res) => {
                expect(res.body.friends).toEqual([
                    { _id: '65218a70437ced46f36858d8', status: 'incoming' },
                ]);
            });
    });

    it("Marks both users' pending friend requests as accepted when user3 accepts", () => {
        return request(app)
            .put(`/users/${user3._id}/friends?action=accept&user=65218a70437ced46f36858d8`)
            .expect(200)
            .then(() => {
                request(app)
                    .get('/users/65218a70437ced46f36858d8')
                    .expect(200)
                    .then((res) => {
                        expect(res.body.friends).toEqual([{ _id: user3._id, status: 'accepted' }]);
                    })
                    .get(`/users/${user3._id}`)
                    .expect(200)
                    .then((res) => {
                        expect(res.body.friends).toEqual([
                            { _id: '65218a70437ced46f36858d8', status: 'accepted' },
                        ]);
                    });
            });
    });

    it('Adds requested friend to user3 and incoming friend request to user2 upon friend request', () => {
        return request(app)
            .put(`/users/${user3._id}/friends?action=add&user=65218ac5dc04264ac8a44906`)
            .expect(200)
            .then(() => {
                request(app)
                    .get(`/users/${user3._id}`)
                    .expect(200)
                    .then((res) => {
                        expect(res.body.friends).toEqual([
                            { _id: '65218a70437ced46f36858d8', status: 'accepted' },
                            { _id: '65218ac5dc04264ac8a44906', status: 'requested' },
                        ]);
                    })
                    .get('/users/65218ac5dc04264ac8a44906')
                    .expect(200)
                    .then((res) => {
                        expect(res.body.friends).toEqual([{ _id: user3._id, status: 'incoming' }]);
                    });
            });
    });

    it("Removes pending entry from both users' friends lists upon rejection", () => {
        return request(app)
            .put(`/users/65218ac5dc04264ac8a44906/friends?action=reject&user=${user3._id}`)
            .expect(200)
            .then(() => {
                request(app)
                    .get(`/users/${user3._id}`)
                    .expect(200)
                    .then((res) => {
                        expect(res.body.friends).toEqual([
                            { _id: '65218a70437ced46f36858d8', status: 'accepted' },
                        ]);
                    })
                    .get('/users/65218ac5dc04264ac8a44906')
                    .expect(200)
                    .then((res) => {
                        expect(res.body.friends).toEqual([]);
                    });
            });
    });

    it('Prevents attempting to add a non-existant user as a friend, returning a 404', () => {
        return request(app)
            .put('/users/65218ac5dc04264ac8a44906/friends?action=add&user=6521aac212fde41aa85be1a0')
            .expect(404)
            .then(() => {
                request(app)
                    .get('/users/65218ac5dc04264ac8a44906')
                    .expect(200)
                    .then((res) => {
                        expect(res.body.friends).toEqual(
                            expect.not.arrayContaining([
                                expect.objectContaining({ _id: '6521aac212fde41aa85be1a0' }),
                            ])
                        );
                    });
            });
    });

    it('Prevents accepting a non-existant friend request, returning a 400', () => {
        return request(app)
            .put(
                '/users/65218ac5dc04264ac8a44906/friends?action=accept&user=6521aac212fde41aa85be1a0'
            )
            .expect(400)
            .then(() => {
                request(app)
                    .get('/users/65218ac5dc04264ac8a44906')
                    .expect(200)
                    .then((res) => {
                        expect(res.body.friends).toEqual(
                            expect.not.arrayContaining([
                                expect.objectContaining({ _id: '6521aac212fde41aa85be1a0' }),
                            ])
                        );
                    });
            });
    });
});

describe.skip('DELETE /users', () => {
    async function getUser3() {
        const User = require('../models/User');
        return await User.findOne({ username: 'user3' }).exec();
    }

    const user3 = getUser3();

    it('Deletes user3', (done) => {
        request(app)
            .delete(`/users/${user3._id}`)
            .then(() => {
                request(app)
                    .get('/users')
                    .expect(200)
                    .expect((res) => {
                        if (res.body.users.length !== 3) {
                            throw new Error('User not deleted');
                        }
                    })
                    .expect((res) => {
                        if (res.body.users.find((user) => user.username === 'user3')) {
                            throw new Error('user3 was not deleted');
                        }
                    })
                    .end(done);
            });
    });

    it("Removes user3 from any user0's friends list after deletion", () => {
        return request(app)
            .get('/users/65218a70437ced46f36858d8')
            .expect(200)
            .then((res) => {
                expect(res.body.friends).toEqual([]);
            });
    });

    it('Returns 404 upon an attempt to delete a non-existant user', (done) => {
        request(app).delete('/users/62218a22128de91a680ba11b').expect(404, done);
    });
});
