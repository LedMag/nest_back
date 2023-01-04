import { DataSource, DataSourceOptions } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    database: 'lusine',
    username: 'root',
    password: 'root',
    entities: ["dist/**/*.entity{ .ts,.js}"],
    migrations: ["dist/database/migrations/*{.ts,.js}"],
}

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
