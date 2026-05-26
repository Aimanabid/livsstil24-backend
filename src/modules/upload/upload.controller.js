const buildUrl = (req, filename) =>
  `${req.protocol}://${req.get('host')}/uploads/${filename}`;

export const uploadSingle = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Ingen fil' });
  res.json({ url: buildUrl(req, req.file.filename), filename: req.file.filename, size: req.file.size });
};

export const uploadMultiple = (req, res) => {
  const files = req.files.map(f => ({
    url: buildUrl(req, f.filename),
    filename: f.filename,
    size: f.size,
  }));
  res.json(files);
};
