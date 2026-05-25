import { Op } from 'sequelize';
import slugify from 'slugify';
import sequelize from '../../config/db.js';
import { Article, Category, User, PageView } from '../../models/index.js';

const include = [
  { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'color'] },
  { model: User,     as: 'author',   attributes: ['id', 'name'] },
];

const fmt = (a) => ({
  ...a.toJSON(),
  category_name:  a.category?.name  ?? null,
  category_slug:  a.category?.slug  ?? null,
  category_color: a.category?.color ?? null,
  author_name:    a.author?.name    ?? null,
});

export const getPublished = async (req, res) => {
  const { category, featured, limit = 20, offset = 0, search, tag } = req.query;
  const where = { status: 'published' };
  if (featured === 'true') where.featured = true;
  if (search) where.title = { [Op.like]: `%${search}%` };
  if (tag) where[Op.and] = sequelize.literal(`JSON_CONTAINS(articles.tags, ${sequelize.escape(JSON.stringify(tag))})`);

  const categoryWhere = category ? { slug: category } : undefined;

  const { rows, count } = await Article.findAndCountAll({
    where,
    include: include.map(i => ({ ...i, where: i.model === Category && categoryWhere ? categoryWhere : undefined })),
    order: [['published_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
  res.json({ articles: rows.map(fmt), total: count });
};

export const getBySlug = async (req, res) => {
  const article = await Article.findOne({ where: { slug: req.params.slug, status: 'published' }, include });
  if (!article) return res.status(404).json({ error: 'Artikel hittades inte' });
  res.json(fmt(article));
};

export const trackSiteVisit = async (req, res) => {
  try {
    const visitor_id = req.body?.visitor_id || null;
    if (!visitor_id) return res.json({ success: false });
    const device = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
    await PageView.create({ article_id: null, page: '/', device, visitor_id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const trackView = async (req, res) => {
  if (req.user) return res.json({ success: true, counted: false });
  try {
    const article = await Article.findOne({ where: { slug: req.params.slug, status: 'published' } });
    if (!article) return res.status(404).json({ error: 'Artikel hittades inte' });

    const device = req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop';
    const visitor_id = req.body?.visitor_id || null;

    await article.increment('views');
    await PageView.create({ article_id: article.id, page: `/artikel/${req.params.slug}`, device, visitor_id });
    res.json({ success: true, counted: true });
  } catch (err) {
    console.error('trackView error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getAllAdmin = async (req, res) => {
  const { status, limit = 50, offset = 0, search } = req.query;
  const where = {};
  if (status) where.status = status;
  if (search) where[Op.or] = [
    { title: { [Op.like]: `%${search}%` } },
    { excerpt: { [Op.like]: `%${search}%` } },
  ];

  const { rows, count } = await Article.findAndCountAll({
    where, include,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
  res.json({ articles: rows.map(fmt), total: count });
};

export const getByIdAdmin = async (req, res) => {
  const article = await Article.findByPk(req.params.id, { include });
  if (!article) return res.status(404).json({ error: 'Artikel hittades inte' });
  res.json(fmt(article));
};

export const create = async (req, res) => {
  const { title, excerpt, content, featured_image, video_url, category_id, status, featured, read_time, tags, seo_title, seo_description } = req.body;
  if (!title) return res.status(400).json({ error: 'Titel krävs' });
  if (!category_id) return res.status(400).json({ error: 'Kategori krävs' });

  let slug = slugify(title, { lower: true, strict: true, locale: 'sv' });
  if (await Article.findOne({ where: { slug } })) slug = `${slug}-${Date.now()}`;

  const article = await Article.create({
    title, slug, excerpt, content, featured_image, video_url: video_url || null, category_id,
    author_id: req.user.id, status: status || 'draft',
    featured: !!featured, read_time: read_time || 5,
    tags: tags || [], seo_title, seo_description,
    published_at: status === 'published' ? new Date() : null,
  });

  const full = await Article.findByPk(article.id, { include });
  res.status(201).json(fmt(full));
};

export const update = async (req, res) => {
  const { title, excerpt, content, featured_image, video_url, category_id, status, featured, read_time, tags, seo_title, seo_description } = req.body;

  const article = await Article.findByPk(req.params.id);
  if (!article) return res.status(404).json({ error: 'Artikel hittades inte' });

  const published_at = status === 'published' && !article.published_at ? new Date() : article.published_at;

  await article.update({ title, excerpt, content, featured_image, video_url: video_url || null, category_id, status, featured: !!featured, read_time, tags: tags || [], seo_title, seo_description, published_at });

  const full = await Article.findByPk(article.id, { include });
  res.json(fmt(full));
};

export const remove = async (req, res) => {
  await Article.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
};
