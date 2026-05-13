import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import { generateId } from '../../utils/id.js';

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.STRING(16), defaultValue: generateId, primaryKey: true },
  company: { type: DataTypes.STRING, allowNull: false },
  contact_name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING },
  org_number: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  website: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
}, {
  tableName: 'customers',
  underscored: true,
  updatedAt: false,
});

export default Customer;
