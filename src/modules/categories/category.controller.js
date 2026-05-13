import sequelize from '../../config/db.js';
import { Category, Article } from '../../models/index.js';

const DEFAULT_CATEGORIES = [
  { name: 'Hälsa',   slug: 'halsa',   color: '#6BAE75', icon: '🌿', sort_order: 1 },
  { name: 'Mode',    slug: 'mode',    color: '#C9A96E', icon: '👗', sort_order: 2 },
  { name: 'Mat',     slug: 'mat',     color: '#E07A5F', icon: '🍽️', sort_order: 3 },
  { name: 'Resor',   slug: 'resor',   color: '#3D405B', icon: '✈️', sort_order: 4 },
  { name: 'Hem',     slug: 'hem',     color: '#81B29A', icon: '🏡', sort_order: 5 },
  { name: 'Skönhet', slug: 'skonhet', color: '#F2CC8F', icon: '💄', sort_order: 6 },
];

export const getAll = async (req, res) => {
  const count = await Category.count();
  if (count === 0) {
    await Promise.all(DEFAULT_CATEGORIES.map(d => Category.findOrCreate({ where: { slug: d.slug }, defaults: d })));
  }

  const [categories] = await sequelize.query(`
    SELECT c.*, COUNT(a.id) AS article_count
    FROM categories c LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
    GROUP BY c.id ORDER BY c.sort_order ASC
  `);
  res.json(categories);
};

export const create = async (req, res) => {
  const { name, slug, color, icon } = req.body;
  const category = await Category.create({ name, slug, color, icon });
  res.status(201).json(category);
};

export const update = async (req, res) => {
  const { name, slug, color, icon } = req.body;
  await Category.update({ name, slug, color, icon }, { where: { id: req.params.id } });
  res.json(await Category.findByPk(req.params.id));
};

export const remove = async (req, res) => {
  const count = await Article.count({ where: { category_id: req.params.id } });
  if (count > 0) return res.status(400).json({ error: `Kategorin har ${count} artiklar kopplade` });
  await Category.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
};
