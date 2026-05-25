import SiteSetting from './siteSettings.model.js';

const DEFAULTS = {
  site_description: 'Din digitala livsstilstidning för mode, skönhet och det moderna livet.',
  instagram_url:    '',
  facebook_url:     '',
  tiktok_url:       '',
  youtube_url:      '',
  linkedin_url:     '',
  logo_url:         '',
  favicon_url:      '',
};

export const getAll = async (req, res) => {
  try {
    const rows = await SiteSetting.findAll();
    const settings = { ...DEFAULTS };
    for (const row of rows) settings[row.key] = row.value ?? '';
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const allowed = Object.keys(DEFAULTS);
    for (const key of allowed) {
      if (key in req.body) {
        await SiteSetting.upsert({ key, value: req.body[key] ?? '' });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
