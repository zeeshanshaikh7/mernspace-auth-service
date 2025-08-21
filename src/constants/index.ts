export const Roles = {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
    MANAGER: 'manager',
} as const;

export type IRole = (typeof Roles)[keyof typeof Roles];
