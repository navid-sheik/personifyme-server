


const loggerHandler = (err, req, res, next) => {

    logger.info(`METHOD: ${req.method} - URL: ${req.originalUrl} - IP: ${req.ip}`);
    logger.info(`ERROR: ${err.message} - ${err.stack}`);
    
}

export default loggerHandler;
