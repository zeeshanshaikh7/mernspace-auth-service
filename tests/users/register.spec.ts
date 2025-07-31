import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/register', () => {
    describe('Given all fields', () => {
        it('should return the 201 status code', async () => {
            // 1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'test@test.com',
                password: 'secrete',
            };
            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // 3. Assert
            expect(response.statusCode).toBe(201);
        });

        it('should return valid json response', async () => {
            // 1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'test@test.com',
                password: 'secrete',
            };
            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // 3. Assert
            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'));
        });

        it('should persist the user in the database', async () => {
            // 1. Arrange
            const userData = {
                firstName: 'zeeshan',
                lastName: 'shaikh',
                email: 'test@test.com',
                password: 'secrete',
            };
            // 2. Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            //assert
        });
    });

    describe('Fields are missing', () => {});
});
