export const uploadSingle = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Ingen fil' });
  const url = `${process.env.API_URL || 'http://localhost:3001'}/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename, size: req.file.size });
};

export const uploadMultiple = (req, res) => {
  const files = req.files.map(f => ({
    url: `${process.env.API_URL || 'http://localhost:3001'}/uploads/${f.filename}`,
    filename: f.filename,
    size: f.size,
  }));
  res.json(files);
};
