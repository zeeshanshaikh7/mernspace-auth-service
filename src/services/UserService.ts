/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import { Brackets, Repository } from 'typeorm';
import { User } from '../entity/User';
import { LimitedUserData, UserData, UserQueryParams } from '../types';

export class UserService {
    constructor(private readonly userRepository: Repository<User>) {}

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
            return await this.userRepository.findOne({
                where: { id },
                relations: {
                    tenant: true,
                },
            });
        } catch (error) {
            const httpError = createHttpError(
                500,
                'Failed to retrieve user from the database',
            );
            throw httpError;
        }
    }

    async update(
        userId: number,
        { firstName, lastName, role, email, tenantId }: LimitedUserData,
    ) {
        const result = await this.userRepository.update(userId, {
            firstName,
            lastName,
            role,
            email,
            tenant: tenantId ? { id: Number(tenantId) } : undefined,
        });
        if (result.affected === 0) {
            throw createHttpError(404, `User with id ${userId} not found`);
        }
        return result;
    }

    async getAll(validatedQuery: UserQueryParams) {
        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`;
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "CONCAT(user.firstName, ' ', user.lastName) ILike :q",
                        { q: searchTerm },
                    ).orWhere('user.email ILike :q', { q: searchTerm });
                }),
            );
        }

        if (validatedQuery.role) {
            queryBuilder.andWhere('user.role = :role', {
                role: validatedQuery.role,
            });
        }

        const result = await queryBuilder
            .leftJoinAndSelect('user.tenant', 'tenant')
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy('user.id', 'DESC')
            .getManyAndCount();
        console.log('get sql query', queryBuilder.getSql());
        return result;
    }

    async getOne(userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        return user;
    }

    async delete(userId: number) {
        const result = await this.userRepository.delete(userId);

        if (result.affected === 0) {
            throw createHttpError(404, `User with id ${userId} not found`);
        }

        return result;
    }
}
