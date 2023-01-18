import { DataSource, DataSourceOptions } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: process.env.MYSQL_HOST,
    port: +process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE_NAME,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    entities: ["dist/**/*.entity{ .ts,.js}"],
    migrations: ["dist/database/migrations/*{.ts,.js}"],
}

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
