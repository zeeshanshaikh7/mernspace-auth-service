/* eslint-disable @typescript-eslint/no-unused-vars */
import { expressjwt } from 'express-jwt';
import { Config } from '../config';
import { Request } from 'express';
import { AuthCookie, IRefreshTokenPayload } from '../types';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import logger from '../config/logger';

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;

        return refreshToken;
    },
    async isRevoked(req: Request, token) {
        console.log('Checking if token is revoked:', token);
        try {
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepo.findOne({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload)?.jti),
                    user: {
                        id: Number(
                            (token?.payload as IRefreshTokenPayload)?.sub,
                        ),
                    },
                },
            });

            return refreshToken ? false : true;
        } catch (error) {
            logger.error('Error occurred while checking if token is revoked:', {
                id: (token?.payload as IRefreshTokenPayload)?.jti,
            });
            return true;
        }
    },
});
