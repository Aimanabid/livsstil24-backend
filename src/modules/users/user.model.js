import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import { generateId } from '../../utils/id.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.STRING(16), defaultValue: generateId, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'editor' },
  avatar: { type: DataTypes.STRING },
}, {
  tableName: 'users',
  underscored: true,
  updatedAt: false,
});

export default User;
