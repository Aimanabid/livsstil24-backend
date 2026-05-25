import sequelize from '../../config/db.js';

const dateRe = /^\d{4}-\d{2}-\d{2}$/;

function getDateRange(query) {
  const today = new Date().toISOString().split('T')[0];
  const defaultFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const from = dateRe.test(query.from) ? query.from : defaultFrom;
  const to   = dateRe.test(query.to)   ? query.to   : today;
  return {
    fromEsc: sequelize.escape(from),
    toEsc:   sequelize.escape(to + ' 23:59:59'),
  };
}

// Fast queries — KPI cards, chart, top articles, categories, devices
export const getOverview = async (req, res) => {
  try {
    const { fromEsc, toEsc } = getDateRange(req.query);

    const [
      [[totals]],
      [viewsByDay],
      [topArticles],
      [recentArticles],
      [categoryBreakdown],
      [deviceBreakdown],
    ] = await Promise.all([
      sequelize.query(`
        SELECT
          (SELECT COUNT(*) FROM articles WHERE status='published') AS publishedArticles,
          (SELECT COUNT(*) FROM ads WHERE status='active')         AS totalAds,
          (SELECT COUNT(*) FROM customers)                         AS totalCustomers,
          (SELECT ROUND(COALESCE(SUM(a.impressions * ap.cpm_rate / 1000.0), 0), 2)
           FROM ads a LEFT JOIN ad_placements ap ON a.placement_id = ap.id) AS adRevenue,
          (SELECT COUNT(*) FROM page_views
           WHERE article_id IS NOT NULL AND created_at BETWEEN ${fromEsc} AND ${toEsc}) AS totalViews,
          (SELECT COUNT(DISTINCT visitor_id) FROM page_views
           WHERE visitor_id IS NOT NULL AND created_at BETWEEN ${fromEsc} AND ${toEsc}) AS uniqueVisitors
      `),
      sequelize.query(`
        SELECT DATE(created_at) AS date, COUNT(*) AS views
        FROM page_views
        WHERE article_id IS NOT NULL AND created_at BETWEEN ${fromEsc} AND ${toEsc}
        GROUP BY DATE(created_at) ORDER BY date ASC
      `),
      sequelize.query(`
        SELECT a.title, a.slug, COUNT(pv.id) AS views, a.published_at,
               c.name AS category_name, c.color AS category_color
        FROM page_views pv
        JOIN articles a ON pv.article_id = a.id
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE pv.created_at BETWEEN ${fromEsc} AND ${toEsc} AND a.status = 'published'
        GROUP BY a.id ORDER BY views DESC LIMIT 5
      `),
      sequelize.query(`
        SELECT a.id, a.title, a.status, a.created_at, a.views, c.name AS category_name
        FROM articles a LEFT JOIN categories c ON a.category_id = c.id
        ORDER BY a.created_at DESC LIMIT 5
      `),
      sequelize.query(`
        SELECT c.name, c.color, COUNT(DISTINCT a.id) AS article_count,
               COUNT(pv.id) AS total_views
        FROM categories c
        LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
        LEFT JOIN page_views pv ON a.id = pv.article_id AND pv.created_at BETWEEN ${fromEsc} AND ${toEsc}
        GROUP BY c.id ORDER BY total_views DESC
      `),
      sequelize.query(`
        SELECT COALESCE(device, 'okänd') AS device, COUNT(*) AS views
        FROM page_views
        WHERE created_at BETWEEN ${fromEsc} AND ${toEsc}
        GROUP BY device ORDER BY views DESC
      `),
    ]);

    res.json({ stats: totals, viewsByDay, topArticles, recentArticles, categoryBreakdown, deviceBreakdown });
  } catch (err) {
    console.error('Stats overview error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Slower queries — ad events, SOV, article tables, IP stats
export const getDetails = async (req, res) => {
  try {
    const { fromEsc, toEsc } = getDateRange(req.query);

    const [
      [adStats],
      [articleStats],
      [customerStats],
      [customerAdsByDay],
      [sovStats],
      [ipStats],
    ] = await Promise.all([
      sequelize.query(`
        SELECT a.title, ap.name AS placement_name, c.company AS customer_name,
          COUNT(CASE WHEN ae.event_type = 'impression' THEN 1 END) AS impressions,
          COUNT(CASE WHEN ae.event_type = 'click'      THEN 1 END) AS clicks,
          CASE WHEN COUNT(CASE WHEN ae.event_type = 'impression' THEN 1 END) > 0
            THEN ROUND(COUNT(CASE WHEN ae.event_type = 'click' THEN 1 END) * 100.0
                 / COUNT(CASE WHEN ae.event_type = 'impression' THEN 1 END), 2)
            ELSE 0 END AS ctr,
          ap.cpm_rate,
          ROUND(a.impressions * ap.cpm_rate / 1000.0, 2) AS revenue,
          a.impressions AS total_impressions,
          a.max_impressions
        FROM ads a
        LEFT JOIN ad_placements ap ON a.placement_id = ap.id
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN ad_events ae ON a.id = ae.ad_id AND ae.created_at BETWEEN ${fromEsc} AND ${toEsc}
        WHERE a.status = 'active'
        GROUP BY a.id ORDER BY impressions DESC LIMIT 5
      `),
      sequelize.query(`
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
      `),
      sequelize.query(`
        SELECT c.company AS name, COUNT(a.id) AS ad_count,
               ROUND(COALESCE(SUM(a.impressions * ap.cpm_rate / 1000.0), 0), 2) AS total_revenue
        FROM customers c
        LEFT JOIN ads a ON c.id = a.customer_id
        LEFT JOIN ad_placements ap ON a.placement_id = ap.id
        GROUP BY c.id ORDER BY total_revenue DESC LIMIT 8
      `),
      sequelize.query(`
        SELECT DATE(ae.created_at) AS date,
               COUNT(CASE WHEN ae.event_type = 'impression' THEN 1 END) AS impressions,
               COUNT(CASE WHEN ae.event_type = 'click'      THEN 1 END) AS clicks
        FROM ad_events ae
        WHERE ae.created_at BETWEEN ${fromEsc} AND ${toEsc}
        GROUP BY DATE(ae.created_at) ORDER BY date ASC
      `),
      sequelize.query(`
        SELECT
          ap.name            AS placement_name,
          ap.position_key,
          a.id               AS ad_id,
          a.title            AS ad_title,
          c.company          AS customer_name,
          COUNT(CASE WHEN ae.event_type = 'impression' THEN 1 END) AS impressions,
          pt.total           AS total_placement_impressions,
          CASE WHEN pt.total > 0
            THEN ROUND(COUNT(CASE WHEN ae.event_type = 'impression' THEN 1 END) * 100.0 / pt.total, 1)
            ELSE 0 END       AS sov
        FROM ads a
        JOIN ad_placements ap ON a.placement_id = ap.id
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN ad_events ae ON a.id = ae.ad_id AND ae.created_at BETWEEN ${fromEsc} AND ${toEsc}
        JOIN (
          SELECT a2.placement_id, COUNT(ae2.id) AS total
          FROM ads a2
          LEFT JOIN ad_events ae2 ON a2.id = ae2.ad_id
            AND ae2.event_type = 'impression'
            AND ae2.created_at BETWEEN ${fromEsc} AND ${toEsc}
          GROUP BY a2.placement_id
        ) pt ON a.placement_id = pt.placement_id
        WHERE a.status = 'active'
        GROUP BY a.id, ap.id, pt.total
        HAVING impressions > 0
        ORDER BY ap.name ASC, impressions DESC
      `),
      sequelize.query(`
        SELECT
          ip_address,
          COUNT(DISTINCT COALESCE(session_id, UUID())) AS visits,
          COUNT(*) AS page_views,
          COUNT(DISTINCT DATE(created_at)) AS active_days,
          MIN(created_at) AS first_seen,
          MAX(created_at) AS last_seen
        FROM page_views
        WHERE ip_address IS NOT NULL AND created_at BETWEEN ${fromEsc} AND ${toEsc}
        GROUP BY ip_address
        ORDER BY visits DESC
        LIMIT 20
      `),
    ]);

    res.json({ adStats, articleStats, customerStats, customerAdsByDay, sovStats, ipStats });
  } catch (err) {
    console.error('Stats details error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
