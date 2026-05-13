import sequelize from '../../config/db.js';

export const getDashboard = async (req, res) => {
  try {
  const [[totals]] = await sequelize.query(`
    SELECT
      (SELECT COUNT(*) FROM articles)                          AS totalArticles,
      (SELECT COUNT(*) FROM articles WHERE status='published') AS publishedArticles,
      (SELECT COALESCE(SUM(views),0) FROM articles)           AS totalViews,
      (SELECT COUNT(*) FROM ads WHERE status='active')        AS totalAds,
      (SELECT COUNT(*) FROM customers)                        AS totalCustomers,
      (SELECT COALESCE(SUM(price_paid),0) FROM ads)           AS adRevenue
  `);

  const [topArticles] = await sequelize.query(`
    SELECT a.title, a.slug, a.views, a.published_at, c.name AS category_name, c.color AS category_color
    FROM articles a LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'published' ORDER BY a.views DESC LIMIT 5
  `);

  const [recentArticles] = await sequelize.query(`
    SELECT a.id, a.title, a.status, a.created_at, a.views, c.name AS category_name
    FROM articles a LEFT JOIN categories c ON a.category_id = c.id
    ORDER BY a.created_at DESC LIMIT 5
  `);

  const [adStats] = await sequelize.query(`
    SELECT a.title, a.clicks, a.impressions, ap.name AS placement_name, c.company AS customer_name,
    CASE WHEN a.impressions > 0 THEN ROUND(a.clicks * 100.0 / a.impressions, 2) ELSE 0 END AS ctr
    FROM ads a
    LEFT JOIN ad_placements ap ON a.placement_id = ap.id
    LEFT JOIN customers c ON a.customer_id = c.id
    WHERE a.status = 'active' ORDER BY a.impressions DESC LIMIT 5
  `);

  const [viewsByDay] = await sequelize.query(`
    SELECT DATE(created_at) AS date, COUNT(*) AS views
    FROM page_views
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at) ORDER BY date ASC
  `);

  const [categoryBreakdown] = await sequelize.query(`
    SELECT c.name, c.color, COUNT(a.id) AS article_count, COALESCE(SUM(a.views), 0) AS total_views
    FROM categories c LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
    GROUP BY c.id ORDER BY total_views DESC
  `);

  res.json({
    stats: totals,
    topArticles,
    recentArticles,
    adStats,
    viewsByDay,
    categoryBreakdown,
  });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
