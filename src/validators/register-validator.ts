import { checkSchema } from 'express-validator';

const registerValidator = checkSchema({
    email: {
        errorMessage: 'Email is required',
        notEmpty: true,
    },
});

export default registerValidator;
