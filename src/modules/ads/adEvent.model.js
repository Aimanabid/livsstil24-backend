import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const AdEvent = sequelize.define('AdEvent', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ad_id: { type: DataTypes.STRING(16) },
  event_type: { type: DataTypes.STRING },
  ip_address: { type: DataTypes.STRING(45), allowNull: true },
}, {
  tableName: 'ad_events',
  underscored: true,
  updatedAt: false,
});

export default AdEvent;
