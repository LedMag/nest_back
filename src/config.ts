import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
    return {
        BACKEND_PORT: process.env.BACKEND_PORT,
        MYSQL_HOST: process.env.MYSQL_HOST, 
        MYSQL_PORT: process.env.MYSQL_PORT, 
        MYSQL_DATABASE: process.env.MYSQL_DATABASE, 
        MYSQL_USERNAME: process.env.MYSQL_USERNAME, 
        MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
    };
});