// import request from 'supertest';
// import { DataSource } from 'typeorm';
// import app from '../../src/app';
// import { User } from '../../src/entity/User';
// import { AppDataSource } from './../../src/config/data-source';
// import createJWKSMock from 'mock-jwks';
// import { Roles } from '../../src/constants';

// const userData = {
//     firstName: 'zeeshan',
//     lastName: 'shaikh',
//     email: 'test@example.com',
//     password: 'hashedpassword',
//     role: Roles.CUSTOMER,
// };

// describe('POST /auth/refresh', () => {
//     let connection: DataSource;
//     let jwks: ReturnType<typeof createJWKSMock>;

//     beforeAll(async () => {
//         jwks = createJWKSMock('http://localhost:5501');
//         connection = await AppDataSource.initialize();
//         await connection.synchronize(true);
//     });

//     beforeEach(async () => {
//         jwks.start();
//         await connection.dropDatabase();
//         await connection.synchronize();
//     });

//     afterEach(async () => {
//         jwks.stop();
//     });

//     afterAll(async () => {
//         if (connection && connection.isInitialized) {
//             await connection.destroy();
//         }
//     });

//     it('should return 400 if user does not exist', async () => {
//         // No user saved in DB
//         const refreshToken = jwks.token({
//             sub: '999',
//             role: Roles.CUSTOMER,
//             jti: '1',
//         });

//         const response = await request(app)
//             .post('/auth/refresh')
//             .set('Cookie', [`refreshToken=${refreshToken}`])
//             .send();

//         expect(response.statusCode).toBe(400);
//         expect(response.body.message).toBe('User with the token not found');
//     });

//     it('should return 401 if refresh token is missing', async () => {
//         const response = await request(app).post('/auth/refresh').send();
//         expect(response.statusCode).toBe(401);
//     });
// });
