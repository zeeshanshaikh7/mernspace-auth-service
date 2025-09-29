import { Config } from './config';
import app from './app';
import logger from './config/logger';
import { AppDataSource } from './config/data-source';
import { ensureAdminUser } from './utils/ensureAdminUser';

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();

        logger.info('Database connection established');
        ensureAdminUser(AppDataSource);

        app.listen(PORT, () => {
            logger.info('Server Listening on port', { port: PORT });
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer()
    .then(() => {
        logger.info('Server started successfully');
    })
    .catch((error) => {
        logger.error('Error starting server', { error });
    });
