import { Op } from 'sequelize';
import sequelize from '../../config/db.js';
import { Ad, AdPlacement, Customer, AdEvent } from '../../models/index.js';

export const getByPlacement = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const placement = await AdPlacement.findOne({ where: { position_key: req.params.key, is_active: true } });
  if (!placement) return res.json([]);

  const ads = await Ad.findAll({
    where: {
      placement_id: placement.id,
      status: 'active',
      [Op.and]: [
        { [Op.or]: [{ start_date: null }, { start_date: { [Op.lte]: today } }] },
        { [Op.or]: [{ end_date: null },   { end_date:   { [Op.gte]: today } }] },
      ],
    },
    order: sequelize.random(),
    limit: placement.max_ads,
  });

  for (const ad of ads) {
    await ad.increment('impressions');
    await AdEvent.create({ ad_id: ad.id, event_type: 'impression' });
  }

  res.json(ads.map(a => ({ ...a.toJSON(), placement_name: placement.name })));
};

export const trackClick = async (req, res) => {
  await Ad.increment('clicks', { where: { id: req.params.id } });
  await AdEvent.create({ ad_id: req.params.id, event_type: 'click' });
  res.json({ success: true });
};

export const getAll = async (req, res) => {
  const ads = await Ad.findAll({
    include: [
      { model: AdPlacement, as: 'placement', attributes: ['name', 'size', 'position_key'] },
      { model: Customer,    as: 'customer',  attributes: ['company'] },
    ],
    order: [['created_at', 'DESC']],
  });
  res.json(ads.map(a => ({
    ...a.toJSON(),
    placement_name: a.placement?.name ?? null,
    position_key:   a.placement?.position_key ?? null,
    customer_name:  a.customer?.company ?? null,
  })));
};

export const getPlacements = async (req, res) => {
  const [placements] = await sequelize.query(`
    SELECT ap.*,
           ap.position_key  AS \`key\`,
           ap.price_monthly AS price_per_month,
           COUNT(a.id)      AS active_ads
    FROM ad_placements ap
    LEFT JOIN ads a ON ap.id = a.placement_id AND a.status = 'active'
    GROUP BY ap.id
    ORDER BY ap.price_monthly DESC
  `);
  res.json(placements);
};

export const createPlacement = async (req, res) => {
  const { name, key, description, price_per_month, max_ads } = req.body;
  try {
    const p = await AdPlacement.create({
      name, position_key: key, description: description || '',
      price_monthly: price_per_month || 0, max_ads: max_ads || 1,
    });
    res.status(201).json({ ...p.toJSON(), key: p.position_key, price_per_month: p.price_monthly });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updatePlacement = async (req, res) => {
  const { name, key, description, price_per_month, max_ads, is_active } = req.body;
  try {
    await AdPlacement.update({
      name, position_key: key, description: description || '',
      price_monthly: price_per_month || 0, max_ads: max_ads || 1,
      is_active: is_active !== undefined ? is_active : true,
    }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  const { title, image_url, link_url, alt_text, ad_type, video_url, placement_id, customer_id, status, start_date, end_date, price_paid } = req.body;
  const ad = await Ad.create({ title, image_url, link_url, alt_text, ad_type: ad_type || 'banner', video_url, placement_id, customer_id, status: status || 'active', start_date, end_date, price_paid: price_paid || 0 });
  const full = await Ad.findByPk(ad.id, {
    include: [
      { model: AdPlacement, as: 'placement', attributes: ['name'] },
      { model: Customer,    as: 'customer',  attributes: ['company'] },
    ],
  });
  res.status(201).json({ ...full.toJSON(), placement_name: full.placement?.name ?? null, customer_name: full.customer?.company ?? null });
};

export const update = async (req, res) => {
  const { title, image_url, link_url, alt_text, ad_type, video_url, placement_id, customer_id, status, start_date, end_date, price_paid } = req.body;
  await Ad.update({ title, image_url, link_url, alt_text, ad_type, video_url, placement_id, customer_id, status, start_date, end_date, price_paid }, { where: { id: req.params.id } });
  res.json({ success: true });
};

export const remove = async (req, res) => {
  await Ad.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
};
