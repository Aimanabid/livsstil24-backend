import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import { generateId } from '../../utils/id.js';

const Article = sequelize.define('Article', {
  id: { type: DataTypes.STRING(16), defaultValue: generateId, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  excerpt: { type: DataTypes.TEXT },
  content: { type: DataTypes.TEXT('long') },
  featured_image: { type: DataTypes.STRING },
  category_id: { type: DataTypes.STRING(16) },
  author_id: { type: DataTypes.STRING(16) },
  status: { type: DataTypes.STRING, defaultValue: 'draft' },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  read_time: { type: DataTypes.INTEGER, defaultValue: 5 },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  seo_title: { type: DataTypes.STRING },
  seo_description: { type: DataTypes.TEXT },
  published_at: { type: DataTypes.DATE },
}, {
  tableName: 'articles',
  underscored: true,
});

export default Article;
