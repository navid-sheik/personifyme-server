
export const successResponse = (message, data, statusCode=200) => ({
    status: 'success',
    message,
    data,

});

export const errorResponse = (message, statusCode=500, errorType) =>  ({
    status: 'error',
    message,
    statusCode,
    errorType : errorType || "Server Error"
});