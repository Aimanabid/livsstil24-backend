import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const PageView = sequelize.define('PageView', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  article_id: { type: DataTypes.STRING(16) },
  page: { type: DataTypes.STRING },
  referrer: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  device: { type: DataTypes.STRING },
}, {
  tableName: 'page_views',
  underscored: true,
  updatedAt: false,
});

export default PageView;
