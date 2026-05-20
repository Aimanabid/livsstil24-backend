import sequelize from '../../config/db.js';

const dateRe = /^\d{4}-\d{2}-\d{2}$/;

export const getDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const defaultFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const from = dateRe.test(req.query.from) ? req.query.from : defaultFrom;
    const to   = dateRe.test(req.query.to)   ? req.query.to   : today;
    const fromEsc = sequelize.escape(from);
    const toEsc   = sequelize.escape(to + ' 23:59:59');

    const [[totals]] = await sequelize.query(`
      SELECT
        (SELECT COUNT(*) FROM articles WHERE status='published') AS publishedArticles,
        (SELECT COUNT(*) FROM ads WHERE status='active')         AS totalAds,
        (SELECT COUNT(*) FROM customers)                         AS totalCustomers,
        (SELECT COALESCE(SUM(price_paid),0) FROM ads)            AS adRevenue,
        (SELECT COUNT(*) FROM page_views WHERE article_id IS NOT NULL AND created_at BETWEEN ${fromEsc} AND ${toEsc}) AS totalViews,
        (SELECT COUNT(DISTINCT visitor_id) FROM page_views WHERE article_id IS NOT NULL AND visitor_id IS NOT NULL AND created_at BETWEEN ${fromEsc} AND ${toEsc}) AS uniqueVisitors
    `);

    const [topArticles] = await sequelize.query(`
      SELECT a.title, a.slug, COUNT(pv.id) AS views, a.published_at,
             c.name AS category_name, c.color AS category_color
      FROM page_views pv
      JOIN articles a ON pv.article_id = a.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE pv.created_at BETWEEN ${fromEsc} AND ${toEsc} AND a.status = 'published'
      GROUP BY a.id ORDER BY views DESC LIMIT 5
    `);

    const [recentArticles] = await sequelize.query(`
      SELECT a.id, a.title, a.status, a.created_at, a.views, c.name AS category_name
      FROM articles a LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY a.created_at DESC LIMIT 5
    `);

    const [adStats] = await sequelize.query(`
      SELECT a.title, ap.name AS placement_name, c.company AS customer_name,
        COUNT(CASE WHEN ae.event_type = 'impression' THEN 1 END) AS impressions,
        COUNT(CASE WHEN ae.event_type = 'click'      THEN 1 END) AS clicks,
        CASE WHEN COUNT(CASE WHEN ae.event_type = 'impression' THEN 1 END) > 0
          THEN ROUND(COUNT(CASE WHEN ae.event_type = 'click' THEN 1 END) * 100.0
               / COUNT(CASE WHEN ae.event_type = 'impression' THEN 1 END), 2)
          ELSE 0 END AS ctr
      FROM ads a
      LEFT JOIN ad_placements ap ON a.placement_id = ap.id
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN ad_events ae ON a.id = ae.ad_id AND ae.created_at BETWEEN ${fromEsc} AND ${toEsc}
      WHERE a.status = 'active'
      GROUP BY a.id ORDER BY impressions DESC LIMIT 5
    `);

    const [viewsByDay] = await sequelize.query(`
      SELECT DATE(created_at) AS date, COUNT(*) AS views
      FROM page_views
      WHERE article_id IS NOT NULL AND created_at BETWEEN ${fromEsc} AND ${toEsc}
      GROUP BY DATE(created_at) ORDER BY date ASC
    `);

    const [articleStats] = await sequelize.query(`
      SELECT a.title, a.slug, a.published_at,
             COUNT(pv.id) AS period_views,
             c.name AS category_name, c.color AS category_color,
             u.name AS author_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN page_views pv ON a.id = pv.article_id AND pv.created_at BETWEEN ${fromEsc} AND ${toEsc}
      WHERE a.status = 'published'
      GROUP BY a.id ORDER BY period_views DESC LIMIT 10
    `);

    const [categoryBreakdown] = await sequelize.query(`
      SELECT c.name, c.color, COUNT(DISTINCT a.id) AS article_count,
             COUNT(pv.id) AS total_views
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
      LEFT JOIN page_views pv ON a.id = pv.article_id AND pv.created_at BETWEEN ${fromEsc} AND ${toEsc}
      GROUP BY c.id ORDER BY total_views DESC
    `);

    res.json({ stats: totals, topArticles, recentArticles, adStats, viewsByDay, categoryBreakdown, articleStats });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
