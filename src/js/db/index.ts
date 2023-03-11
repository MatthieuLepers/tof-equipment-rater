import { Sequelize } from 'sequelize';
import path from 'path';
import WinstonInstance from '@/js/utils/WinstonInstance';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, './database.sqlite'),
  logging: (msg) => WinstonInstance.debug(msg),
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

export default sequelize;
