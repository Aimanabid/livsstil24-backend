import { Op } from 'sequelize';
import sequelize from '../../config/db.js';
import { Ad, AdPlacement, Customer, AdEvent } from '../../models/index.js';

export const getByPlacement = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;

  const placement = await AdPlacement.findOne({ where: { position_key: req.params.key, is_active: true } });
  if (!placement) return res.json([]);

  let ads = await Ad.findAll({
    where: {
      placement_id: placement.id,
      status: 'active',
      [Op.and]: [
        { [Op.or]: [{ start_date: null }, { start_date: { [Op.lte]: today } }] },
        { [Op.or]: [{ end_date: null },   { end_date:   { [Op.gte]: today } }] },
        { [Op.or]: [{ max_impressions: null }, sequelize.literal('`Ad`.`impressions` < `Ad`.`max_impressions`')] },
      ],
    },
    order: sequelize.random(),
    limit: placement.max_ads,
  });

  // Filter by per-IP frequency cap (split by window type)
  const capped = ads.filter(a => a.freq_cap && ip);
  if (capped.length > 0) {
    const seen = {};
    const dailyIds    = capped.filter(a => a.freq_cap_window !== 'lifetime').map(a => a.id);
    const lifetimeIds = capped.filter(a => a.freq_cap_window === 'lifetime').map(a => a.id);

    if (dailyIds.length > 0) {
      const [rows] = await sequelize.query(
        `SELECT ad_id, COUNT(*) AS cnt FROM ad_events
         WHERE event_type = 'impression' AND ip_address = ? AND ad_id IN (?)
           AND created_at >= NOW() - INTERVAL 24 HOUR
         GROUP BY ad_id`,
        { replacements: [ip, dailyIds] }
      );
      rows.forEach(r => { seen[r.ad_id] = Number(r.cnt); });
    }

    if (lifetimeIds.length > 0) {
      const [rows] = await sequelize.query(
        `SELECT ad_id, COUNT(*) AS cnt FROM ad_events
         WHERE event_type = 'impression' AND ip_address = ? AND ad_id IN (?)
         GROUP BY ad_id`,
        { replacements: [ip, lifetimeIds] }
      );
      rows.forEach(r => { seen[r.ad_id] = Number(r.cnt); });
    }

    ads = ads.filter(a => !a.freq_cap || (seen[a.id] || 0) < a.freq_cap);
  }

  res.set('Cache-Control', 'no-store');
  res.json(ads.map(a => ({ ...a.toJSON(), placement_name: placement.name })));
};

export const trackImpression = async (req, res) => {
  if (req.user) return res.json({ success: true });
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  await Ad.increment('impressions', { where: { id: req.params.id } });
  await AdEvent.create({ ad_id: req.params.id, event_type: 'impression', ip_address: ip });
  res.json({ success: true });
};

export const trackClick = async (req, res) => {
  if (req.user) return res.json({ success: true });
  await Ad.increment('clicks', { where: { id: req.params.id } });
  await AdEvent.create({ ad_id: req.params.id, event_type: 'click' });
  res.json({ success: true });
};

export const getAll = async (req, res) => {
  const ads = await Ad.findAll({
    include: [
      { model: AdPlacement, as: 'placement', attributes: ['name', 'size', 'position_key', 'cpm_rate'] },
      { model: Customer,    as: 'customer',  attributes: ['company'] },
    ],
    order: [['created_at', 'DESC']],
  });
  res.json(ads.map(a => ({
    ...a.toJSON(),
    placement_name: a.placement?.name ?? null,
    position_key:   a.placement?.position_key ?? null,
    customer_name:  a.customer?.company ?? null,
    cpm_rate:       a.placement?.cpm_rate ?? null,
  })));
};

export const getPlacements = async (req, res) => {
  const [placements] = await sequelize.query(`
    SELECT ap.*,
           ap.position_key AS \`key\`,
           COUNT(a.id)     AS active_ads
    FROM ad_placements ap
    LEFT JOIN ads a ON ap.id = a.placement_id AND a.status = 'active'
    GROUP BY ap.id
    ORDER BY cpm_rate DESC
  `);
  res.json(placements);
};

export const createPlacement = async (req, res) => {
  const { name, key, description, cpm_rate, max_ads } = req.body;
  try {
    const p = await AdPlacement.create({
      name, position_key: key, description: description || '',
      cpm_rate: cpm_rate || 0, max_ads: max_ads || 1,
    });
    res.status(201).json({ ...p.toJSON(), key: p.position_key });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updatePlacement = async (req, res) => {
  const { name, key, description, cpm_rate, max_ads, is_active } = req.body;
  try {
    await AdPlacement.update({
      name, position_key: key, description: description || '',
      cpm_rate: cpm_rate || 0, max_ads: max_ads || 1,
      is_active: is_active !== undefined ? is_active : true,
    }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  const { title, image_url, link_url, alt_text, ad_type, video_url, placement_id, customer_id, status, start_date, end_date, max_impressions, freq_cap, freq_cap_window } = req.body;
  const ad = await Ad.create({ title, image_url, link_url, alt_text, ad_type: ad_type || 'image', video_url, placement_id, customer_id, status: status || 'active', start_date, end_date, max_impressions: max_impressions || null, freq_cap: freq_cap || null, freq_cap_window: freq_cap_window || '24h' });
  const full = await Ad.findByPk(ad.id, {
    include: [
      { model: AdPlacement, as: 'placement', attributes: ['name'] },
      { model: Customer,    as: 'customer',  attributes: ['company'] },
    ],
  });
  res.status(201).json({ ...full.toJSON(), placement_name: full.placement?.name ?? null, customer_name: full.customer?.company ?? null });
};

export const update = async (req, res) => {
  const { title, image_url, link_url, alt_text, ad_type, video_url, placement_id, customer_id, status, start_date, end_date, max_impressions, freq_cap, freq_cap_window } = req.body;
  await Ad.update({ title, image_url, link_url, alt_text, ad_type, video_url, placement_id, customer_id, status, start_date, end_date, max_impressions: max_impressions || null, freq_cap: freq_cap || null, freq_cap_window: freq_cap_window || '24h' }, { where: { id: req.params.id } });
  res.json({ success: true });
};

export const remove = async (req, res) => {
  await Ad.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
};
