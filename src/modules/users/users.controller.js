import bcrypt from 'bcryptjs';
import { User } from '../../models/index.js';
import { generateId } from '../../utils/id.js';

export const getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'created_at'],
      order: [['created_at', 'ASC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Namn, e-post och lösenord krävs' });
  const validRoles = ['admin', 'editor', 'ad_manager'];
  if (role && !validRoles.includes(role)) return res.status(400).json({ error: 'Ogiltig roll' });

  try {
    const user = await User.create({
      id: generateId(),
      name,
      email,
      password: bcrypt.hashSync(password, 10),
      role: role || 'editor',
    });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ error: 'E-postadressen används redan' });
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  const { name, email, role, password } = req.body;
  const validRoles = ['admin', 'editor', 'ad_manager'];
  if (role && !validRoles.includes(role)) return res.status(400).json({ error: 'Ogiltig roll' });

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Användare hittades inte' });

    const updates = { name, email, role };
    if (password) updates.password = bcrypt.hashSync(password, 10);
    await user.update(updates);
    res.json({ success: true });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ error: 'E-postadressen används redan' });
    res.status(500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Du kan inte ta bort ditt eget konto' });
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
