import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "mg",
  process.env.DB_USER || "mg",
  process.env.DB_PASSWORD || "mg110!",
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

export default sequelize;
