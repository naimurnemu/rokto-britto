import { ZodError } from 'zod';
export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation Error',
                        details: error.errors.map((err) => ({
                            field: err.path.join('.'),
                            message: err.message,
                        })),
                    },
                });
            }
            return next(error);
        }
    };
};
