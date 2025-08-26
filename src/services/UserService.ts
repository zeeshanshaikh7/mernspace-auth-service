/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
        const user = await this.userRepository.findOne({ where: { email } });

        if (user) {
            const error = createHttpError(400, 'Email is already exists');
            throw error;
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
                tenant: tenantId ? { id: tenantId } : undefined,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store the data in the database',
            );
            throw error;
        }
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOne({ where: { email } });
    }

    async findByEmailWithPassword(email: string) {
        return await this.userRepository.findOne({
            where: { email },
            select: [
                'id',
                'firstName',
                'lastName',
                'email',
                'password',
                'role',
            ],
        });
    }

    async findById(id: number) {
        try {
            return await this.userRepository.findOne({ where: { id } });
        } catch (error) {
            const httpError = createHttpError(
                500,
                'Failed to retrieve user from the database',
            );
            throw httpError;
        }
    }
}
