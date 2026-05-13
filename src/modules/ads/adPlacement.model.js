import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import { generateId } from '../../utils/id.js';

const AdPlacement = sequelize.define('AdPlacement', {
  id: { type: DataTypes.STRING(16), defaultValue: generateId, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  size: { type: DataTypes.STRING },
  width: { type: DataTypes.INTEGER },
  height: { type: DataTypes.INTEGER },
  price_monthly: { type: DataTypes.INTEGER, defaultValue: 0 },
  max_ads: { type: DataTypes.INTEGER, defaultValue: 1 },
  page_location: { type: DataTypes.STRING },
  position_key: { type: DataTypes.STRING, allowNull: false, unique: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'ad_placements',
  underscored: true,
  updatedAt: false,
});

export default AdPlacement;
