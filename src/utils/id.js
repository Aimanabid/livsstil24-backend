import { randomBytes } from 'crypto';

export const generateId = () => randomBytes(8).toString('hex');
