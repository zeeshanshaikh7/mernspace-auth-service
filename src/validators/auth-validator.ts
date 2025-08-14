import { checkSchema } from 'express-validator';

const registerValidator = checkSchema({
    firstName: {
        errorMessage: 'First name is required',
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: 'Last name is required',
        notEmpty: true,
        trim: true,
    },
    email: {
        errorMessage: 'Email is required',
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: 'Invalid email format',
        },
    },
    password: {
        notEmpty: {
            errorMessage: 'Password is required',
        },
        trim: true,
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password must be at least 8 characters long',
        },
    },
});

const loginValidator = checkSchema({
    email: {
        errorMessage: 'Email is required',
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: 'Invalid email format',
        },
    },
    password: {
        notEmpty: {
            errorMessage: 'Password is required',
        },
        trim: true,
    },
});

export { registerValidator, loginValidator };
