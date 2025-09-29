import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import bcrypt from 'bcryptjs';

export async function ensureAdminUser(dataSource: DataSource) {
    const userRepo = dataSource.getRepository(User);

    // Check if an admin user exists
    const adminExists = await userRepo.findOneBy({ role: 'admin' });

    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = userRepo.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@mern.space',
            role: 'admin',
            password: hashedPassword,
        });

        await userRepo.save(adminUser);
        console.log('Admin user created!');
    } else {
        console.log('Admin user already exists.');
    }
}
