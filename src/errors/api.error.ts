export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }

    static badRequest(message: string, details?: any): ApiError {
        return new ApiError(400, message, details);
    }

    static notFound(message: string, details?: any): ApiError {
        return new ApiError(404, message, details);
    }

    static internal(message: string, details?: any): ApiError {
        return new ApiError(500, message, details);
    }
}