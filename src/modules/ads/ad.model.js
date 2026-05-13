import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import { generateId } from '../../utils/id.js';

const Ad = sequelize.define('Ad', {
  id: { type: DataTypes.STRING(16), defaultValue: generateId, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  image_url: { type: DataTypes.STRING },
  link_url: { type: DataTypes.STRING },
  alt_text: { type: DataTypes.STRING },
  placement_id: { type: DataTypes.STRING(16) },
  customer_id: { type: DataTypes.STRING(16) },
  ad_type:   { type: DataTypes.STRING, defaultValue: 'image' }, // 'image' | 'video'
  video_url: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  start_date: { type: DataTypes.DATEONLY },
  end_date: { type: DataTypes.DATEONLY },
  clicks: { type: DataTypes.INTEGER, defaultValue: 0 },
  impressions: { type: DataTypes.INTEGER, defaultValue: 0 },
  price_paid: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'ads',
  underscored: true,
  updatedAt: false,
});

export default Ad;
