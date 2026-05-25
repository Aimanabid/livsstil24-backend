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
  max_impressions: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  freq_cap: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  freq_cap_window: { type: DataTypes.STRING(20), defaultValue: '24h' },
}, {
  tableName: 'ads',
  underscored: true,
  updatedAt: false,
});

export default Ad;
