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
            .expect({ count: 3 })
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
