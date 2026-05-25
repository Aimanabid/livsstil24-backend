import sequelize from '../../config/db.js';
import { Customer, Ad, AdPlacement } from '../../models/index.js';

export const getAll = async (req, res) => {
  const [customers] = await sequelize.query(`
    SELECT c.*, COUNT(a.id) AS ad_count,
           ROUND(COALESCE(SUM(a.impressions * ap.cpm_rate / 1000.0), 0), 2) AS total_revenue
    FROM customers c
    LEFT JOIN ads a ON c.id = a.customer_id
    LEFT JOIN ad_placements ap ON a.placement_id = ap.id
    GROUP BY c.id ORDER BY c.created_at DESC
  `);
  res.json(customers);
};

export const getById = async (req, res) => {
  const customer = await Customer.findByPk(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Kund hittades inte' });

  const ads = await Ad.findAll({
    where: { customer_id: req.params.id },
    include: [{ model: AdPlacement, as: 'placement', attributes: ['name'] }],
    order: [['created_at', 'DESC']],
  });

  res.json({ ...customer.toJSON(), ads: ads.map(a => ({ ...a.toJSON(), placement_name: a.placement?.name ?? null })) });
};

export const create = async (req, res) => {
  const { company, contact_name, email, phone, org_number, address, website, notes } = req.body;
  if (!company || !email) return res.status(400).json({ error: 'Företag och e-post krävs' });
  try {
    const customer = await Customer.create({ company, contact_name, email, phone, org_number, address, website, notes });
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  const { company, contact_name, email, phone, org_number, address, website, notes, status } = req.body;
  await Customer.update({ company, contact_name, email, phone, org_number, address, website, notes, status }, { where: { id: req.params.id } });
  res.json(await Customer.findByPk(req.params.id));
};

export const remove = async (req, res) => {
  await Customer.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
};
