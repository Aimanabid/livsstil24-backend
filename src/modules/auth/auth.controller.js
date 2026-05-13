import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/index.js';
import { SECRET_KEY } from '../../middleware/auth.js';

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'E-post och lösenord krävs' });

  const user = await User.findOne({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Felaktig e-post eller lösenord' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    SECRET_KEY,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, COOKIE_OPTIONS);
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar } });
};

export const logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'strict' });
  res.json({ success: true });
};

export const getMe = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'email', 'name', 'role', 'avatar', 'created_at'],
  });
  if (!user) return res.status(404).json({ error: 'Användare hittades inte' });
  res.json(user);
};

export const updateMe = async (req, res) => {
  const { name, email } = req.body;
  await User.update({ name, email }, { where: { id: req.user.id } });
  res.json({ success: true });
};

export const updatePassword = async (req, res) => {
  const { current, next: newPass } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!bcrypt.compareSync(current, user.password)) {
    return res.status(400).json({ error: 'Fel nuvarande lösenord' });
  }
  await user.update({ password: bcrypt.hashSync(newPass, 10) });
  res.json({ success: true });
};
