import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import { generateId } from '../../utils/id.js';

const Category = sequelize.define('Category', {
  id: { type: DataTypes.STRING(16), defaultValue: generateId, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  color: { type: DataTypes.STRING, defaultValue: '#C9A96E' },
  icon: { type: DataTypes.STRING },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'categories',
  underscored: true,
  updatedAt: false,
});

export default Category;
