import dotenv from 'dotenv';
import pino from 'pino';


const logger = pino({
    
    level: process.env.PINO_LOG_LEVEL || 'info',

    timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;