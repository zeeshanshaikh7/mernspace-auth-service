import createHttpError from 'http-errors';
import { JwtPayload, sign } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { Config } from '../config';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';

export class TokenService {
    constructor(
        private readonly refreshTokenRepository: Repository<RefreshToken>,
    ) {}

    generateAccessToken(payload: JwtPayload) {
        if (!Config.PRIVATE_KEY) {
            const error = createHttpError(
                500,
                'Error while reading private key',
            );
            throw error;
        }

        const privateKey = Config.PRIVATE_KEY;

        const accessToken = sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        });

        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload, payloadId: string) {
        if (!Config.REFRESH_TOKEN_SECRET) {
            const error = createHttpError(
                500,
                'Error while reading refresh token secrete',
            );
            throw error;
        }

        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
            jwtid: payloadId,
        });

        return refreshToken;
    }

    async persistRefreshToken(user: User) {
        const MS_IN_ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

        const newRefreshToken = await this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_ONE_YEAR),
        });

        return newRefreshToken;
    }

    async invalidateRefreshToken(jti: number) {
        await this.refreshTokenRepository.delete({ id: jti });
    }
}
