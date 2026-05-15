import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const SiteSetting = sequelize.define('SiteSetting', {
  key:   { type: DataTypes.STRING(100), primaryKey: true, allowNull: false },
  value: { type: DataTypes.TEXT },
}, {
  tableName: 'site_settings',
  timestamps: false,
});

export default SiteSetting;
