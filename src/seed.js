import bcrypt from 'bcryptjs';
import sequelize from './config/db.js';
import { User, Category, Article, Customer, AdPlacement, Ad, AdEvent, PageView } from './models/index.js';
import { generateId } from './utils/id.js';

await sequelize.authenticate();

// ── Helpers ───────────────────────────────────────────────────────────────────
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = d => { const dt = new Date(); dt.setDate(dt.getDate() - d); return dt; };
const randomDate = (daysBack) => daysAgo(randInt(0, daysBack));

// ── Users ────────────────────────────────────────────────────────────────────
const [admin] = await User.findOrCreate({
  where: { email: 'admin@livsstil24.se' },
  defaults: { name: 'Admin', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
});
console.log('✅ User:', admin.email, '/ password: admin123');

const [editor] = await User.findOrCreate({
  where: { email: 'editor@livsstil24.se' },
  defaults: { name: 'Sara Lindgren', password: bcrypt.hashSync('editor123', 10), role: 'editor' },
});
console.log('✅ User:', editor.email, '/ password: editor123');

const [adManager] = await User.findOrCreate({
  where: { email: 'annonser@livsstil24.se' },
  defaults: { name: 'Mikael Ström', password: bcrypt.hashSync('ads123', 10), role: 'ad_manager' },
});
console.log('✅ User:', adManager.email, '/ password: ads123');

// ── Categories ───────────────────────────────────────────────────────────────
const categoryData = [
  { name: 'Hälsa',         slug: 'halsa',         color: '#6BAE75', icon: '🌿', sort_order: 1 },
  { name: 'Mode',          slug: 'mode',          color: '#C9A96E', icon: '👗', sort_order: 2 },
  { name: 'Mat',           slug: 'mat',           color: '#E07A5F', icon: '🍽️', sort_order: 3 },
  { name: 'Resor',         slug: 'resor',         color: '#3D405B', icon: '✈️', sort_order: 4 },
  { name: 'Hem',           slug: 'hem',           color: '#81B29A', icon: '🏡', sort_order: 5 },
  { name: 'Skönhet',       slug: 'skonhet',       color: '#F2CC8F', icon: '💄', sort_order: 6 },
  { name: 'Livsstil24 TV', slug: 'livsstil24-tv', color: '#E63946', icon: '📺', sort_order: 7 },
];

const categories = {};
for (const data of categoryData) {
  const [cat] = await Category.findOrCreate({ where: { slug: data.slug }, defaults: data });
  categories[data.slug] = cat;
  console.log('✅ Category:', cat.name);
}

// ── Articles ─────────────────────────────────────────────────────────────────
const articleData = [
  { title: '10 tips för ett hälsosammare liv', slug: '10-tips-for-ett-halsosammare-liv', excerpt: 'Enkla vanor som gör stor skillnad för din hälsa och välmående.', content: '<p>Att leva ett hälsosamt liv behöver inte vara komplicerat. Här är tio enkla tips som hjälper dig på vägen mot ett bättre mående.</p><p>1. Drick tillräckligt med vatten varje dag. 2. Rör på dig minst 30 minuter om dagen. 3. Ät mer grönsaker och frukt. 4. Prioritera sömnen. 5. Minska stressen med mindfulness.</p>', featured_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&auto=format&fit=crop', category_id: categories['halsa'].id, author_id: admin.id, status: 'published', featured: true, read_time: 4, tags: ['hälsa', 'tips', 'livsstil'], published_at: new Date('2026-04-10'), views: randInt(800, 2400) },
  { title: 'Höstens hetaste modetrender 2024', slug: 'hostens-hetaste-modetrender-2024', excerpt: 'Från catwalk till vardagsgarderob — dessa trender dominerar hösten.', content: '<p>Hösten 2024 handlar om jordtoner, oversized silhuetter och hållbara material.</p>', featured_image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop', category_id: categories['mode'].id, author_id: editor.id, status: 'published', featured: true, read_time: 5, tags: ['mode', 'trender', 'höst'], published_at: new Date('2026-04-15'), views: randInt(600, 1800) },
  { title: 'Recept: Krämig pasta med rostad pumpa', slug: 'recept-kramig-pasta-med-rostad-pumpa', excerpt: 'En höstlig rätt som värmer från insidan — klar på 30 minuter.', content: '<p>Den här enkla pastasåsen med rostad pumpa och salvia är perfekt för höstkvällarna.</p>', featured_image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&auto=format&fit=crop', category_id: categories['mat'].id, author_id: editor.id, status: 'published', featured: true, read_time: 3, tags: ['recept', 'mat', 'vegetariskt'], published_at: new Date('2026-04-18'), views: randInt(500, 1500) },
  { title: 'Drömresan till Mallorca — vad du inte får missa', slug: 'dromresan-till-mallorca', excerpt: 'Bortom turistfällorna: de bästa stränderna, restaurangerna och upplevelserna.', content: '<p>Mallorca är mer än bara sol och bad. Vi har utforskat de gömda pärlorna.</p>', featured_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop', category_id: categories['resor'].id, author_id: admin.id, status: 'published', featured: true, read_time: 6, tags: ['resor', 'mallorca', 'semester'], published_at: new Date('2026-04-20'), views: randInt(700, 2000) },
  { title: 'Inredningstrender: Minimalism möter värme', slug: 'inredningstrender-minimalism-moter-varme', excerpt: 'Hur skapar du ett hem som känns både stilrent och ombonat?', content: '<p>Den nya minimalismen handlar inte om kala ytor — det handlar om att välja rätt.</p>', featured_image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop', category_id: categories['hem'].id, author_id: editor.id, status: 'published', featured: true, read_time: 5, tags: ['hem', 'inredning', 'minimalism'], published_at: new Date('2026-04-22'), views: randInt(400, 1200) },
  { title: 'Skönhetsrutiner för en strålande hy', slug: 'skonhetsrutiner-for-en-strålande-hy', excerpt: 'Enkla steg som ger synliga resultat — utan lyxbudget.', content: '<p>En bra hudvårdsrutin behöver inte vara komplicerad eller dyr.</p>', featured_image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&auto=format&fit=crop', category_id: categories['skonhet'].id, author_id: editor.id, status: 'published', featured: true, read_time: 4, tags: ['skönhet', 'hudvård', 'rutin'], published_at: new Date('2026-04-25'), views: randInt(600, 1600) },
  { title: 'Morgonrutiner som förändrar din dag', slug: 'morgonrutiner-som-forandrar-din-dag', excerpt: 'Vad du gör de första 30 minuterna avgör hela dagen.', content: '<p>Framgångsrika människor delar ofta en sak — en stark morgonrutin.</p>', featured_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop', category_id: categories['halsa'].id, author_id: admin.id, status: 'published', featured: false, read_time: 4, tags: ['hälsa', 'rutin', 'produktivitet'], published_at: new Date('2026-04-28'), views: randInt(300, 900) },
  { title: 'Capsule wardrobe: bygg en tidlös garderob', slug: 'capsule-wardrobe-bygg-en-tidlos-garderob', excerpt: 'Färre plagg, mer stil — principerna bakom den perfekta garderoben.', content: '<p>En capsule wardrobe handlar om att investera i rätt basplagg.</p>', featured_image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop', category_id: categories['mode'].id, author_id: editor.id, status: 'published', featured: false, read_time: 5, tags: ['mode', 'garderob', 'hållbarhet'], published_at: new Date('2026-05-01'), views: randInt(400, 1100) },
  { title: 'Tokyo på 5 dagar — den ultimata guiden', slug: 'tokyo-pa-5-dagar-den-ultimata-guiden', excerpt: 'Temples, street food och neonljus — allt du behöver veta.', content: '<p>Tokyo är en av världens mest spännande städer.</p>', featured_image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&auto=format&fit=crop', category_id: categories['resor'].id, author_id: admin.id, status: 'published', featured: false, read_time: 7, tags: ['resor', 'tokyo', 'japan'], published_at: new Date('2026-05-03'), views: randInt(500, 1400) },
  { title: 'Växtbaserad kost — en nybörjarguide', slug: 'vaxtbaserad-kost-en-nyborjarguide', excerpt: 'Allt du behöver veta för att komma igång med ett mer växtbaserat ätande.', content: '<p>Att äta mer växtbaserat är en av de bästa sakerna du kan göra.</p>', featured_image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop', category_id: categories['mat'].id, author_id: editor.id, status: 'published', featured: false, read_time: 5, tags: ['mat', 'veganskt', 'hälsa'], published_at: new Date('2026-05-06'), views: randInt(350, 1000) },
  { title: 'Hållbara heminredningsval som gör skillnad', slug: 'hallbara-heminredningsval-som-gor-skillnad', excerpt: 'Vackert hem och gott samvete — det går att kombinera.', content: '<p>Hållbar inredning handlar om att välja material och producenter med omsorg.</p>', featured_image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop', category_id: categories['hem'].id, author_id: editor.id, status: 'published', featured: false, read_time: 4, tags: ['hem', 'hållbarhet', 'inredning'], published_at: new Date('2026-05-08'), views: randInt(250, 800) },
  { title: 'Naturlig makeup: less is more', slug: 'naturlig-makeup-less-is-more', excerpt: 'Få en fräsch look på under tio minuter med rätt produkter.', content: '<p>Den naturliga makeuptrenden är här för att stanna.</p>', featured_image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop', category_id: categories['skonhet'].id, author_id: editor.id, status: 'published', featured: false, read_time: 3, tags: ['skönhet', 'makeup', 'naturlig'], published_at: new Date('2026-05-10'), views: randInt(400, 1200) },
  { title: 'Bättre sömn på 7 dagar — vetenskapliga råd', slug: 'battre-somn-pa-7-dagar', excerpt: 'Sömnforskningens bästa knep för att somna snabbare och vakna utvilad.', content: '<p>Sömnbrist påverkar allt från humör till immunförsvar. Här är sju bevisade strategier.</p>', featured_image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=1200&auto=format&fit=crop', category_id: categories['halsa'].id, author_id: admin.id, status: 'published', featured: false, read_time: 5, tags: ['hälsa', 'sömn', 'välmående'], published_at: new Date('2026-05-12'), views: randInt(600, 1700) },
  { title: 'Streetstyle från Stockholm Fashion Week', slug: 'streetstyle-fran-stockholm-fashion-week', excerpt: 'De bästa outfitsen utanför visningarna — inspiration från gatorna.', content: '<p>Stockholm Fashion Week levererar alltid lika mycket inspiration.</p>', featured_image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&auto=format&fit=crop', category_id: categories['mode'].id, author_id: editor.id, status: 'published', featured: false, read_time: 4, tags: ['mode', 'stockholm', 'streetstyle'], published_at: new Date('2026-05-13'), views: randInt(450, 1300) },
  { title: 'Lissabon — Europas bäst bevarade hemlighet', slug: 'lissabon-europas-bast-bevarade-hemlighet', excerpt: 'Fado, pastéis de nata och solnedgångar som stannar kvar i minnet.', content: '<p>Lissabon har länge levt i skuggan av Barcelona och Paris.</p>', featured_image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&auto=format&fit=crop', category_id: categories['resor'].id, author_id: admin.id, status: 'published', featured: false, read_time: 6, tags: ['resor', 'lissabon', 'portugal'], published_at: new Date('2026-05-15'), views: randInt(500, 1500) },
];

const articles = {};
for (const data of articleData) {
  const [art, created] = await Article.findOrCreate({ where: { slug: data.slug }, defaults: data });
  if (!created) await art.update({ views: data.views, featured_image: data.featured_image });
  articles[data.slug] = art;
  console.log(`${created ? '✅' : '⏭️ '} Article: ${art.title}`);
}

// ── Customers ─────────────────────────────────────────────────────────────────
const customerData = [
  { company: 'Naturliga Skönhet AB', contact_name: 'Anna Lindqvist',  email: 'anna@naturligaskonhet.se',  phone: '070-123 45 67', org_number: '556123-4567', status: 'active' },
  { company: 'Svensk Mode Group',    contact_name: 'Erik Johansson',  email: 'erik@svenskmode.se',        phone: '073-234 56 78', org_number: '556234-5678', status: 'active' },
  { company: 'FitLife Sverige',      contact_name: 'Maria Petersson', email: 'maria@fitlife.se',          phone: '076-345 67 89', org_number: '556345-6789', status: 'active' },
  { company: 'Resebyrån Äventyr',    contact_name: 'Johan Berg',      email: 'johan@aventyr.se',          phone: '070-456 78 90', org_number: '556456-7890', status: 'active' },
];

for (const data of customerData) {
  const [cust, created] = await Customer.findOrCreate({ where: { email: data.email }, defaults: data });
  console.log(`${created ? '✅' : '⏭️ '} Customer: ${cust.company}`);
}

// ── Ad Placements (CPM-based) ─────────────────────────────────────────────────
const placementData = [
  { name: 'Hero Banner',    position_key: 'hero_banner',    cpm_rate: 150.00, max_ads: 1, description: 'Startsida — stor hero-bild överst' },
  { name: 'Article Inline', position_key: 'article_inline', cpm_rate: 70.00,  max_ads: 1, description: 'Artikelsidor — video/banner efter texten' },
  { name: 'Article Mid',    position_key: 'article_mid',    cpm_rate: 90.00,  max_ads: 1, description: 'Artikelsidor — annons mitt i artikeln' },
  { name: 'Sidebar Top',    position_key: 'sidebar_top',    cpm_rate: 80.00,  max_ads: 1, description: 'Sidopanel — övre annonsplats' },
  { name: 'Sidebar Mid',    position_key: 'sidebar_mid',    cpm_rate: 60.00,  max_ads: 1, description: 'Sidopanel — nedre annonsplats' },
];

const placements = {};
for (const data of placementData) {
  const [pl, created] = await AdPlacement.findOrCreate({ where: { position_key: data.position_key }, defaults: data });
  if (!created) await pl.update({ cpm_rate: data.cpm_rate, name: data.name });
  placements[data.position_key] = pl;
  console.log(`${created ? '✅' : '⏭️ '} Placement: ${pl.name} — ${data.cpm_rate} kr/1000`);
}

// ── Customers map ─────────────────────────────────────────────────────────────
const customers = {};
for (const data of customerData) {
  customers[data.email] = await Customer.findOne({ where: { email: data.email } });
}

// ── Ads ───────────────────────────────────────────────────────────────────────
const adData = [
  {
    title: 'Naturliga Skönhet — Sommarkollektion',
    alt_text: 'Upp till 30% rabatt på hela sortimentet',
    image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&auto=format&fit=crop',
    link_url: 'https://example.com/naturliga-skonhet',
    ad_type: 'image',
    placement_id: placements['hero_banner'].id,
    customer_id: customers['anna@naturligaskonhet.se'].id,
    status: 'active',
    start_date: '2026-05-01',
    end_date: '2026-07-31',
    impressions: 14200,
    clicks: 43,
    max_impressions: 50000,
    freq_cap: 5,
    freq_cap_window: '24h',
  },
  {
    title: 'Svensk Mode Group — Ny Kollektion',
    alt_text: 'Upptäck säsongens nyheter',
    image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop',
    link_url: 'https://example.com/svensk-mode',
    ad_type: 'image',
    placement_id: placements['sidebar_top'].id,
    customer_id: customers['erik@svenskmode.se'].id,
    status: 'active',
    start_date: '2026-05-01',
    end_date: '2026-08-31',
    impressions: 8600,
    clicks: 19,
    freq_cap: 3,
    freq_cap_window: '24h',
  },
  {
    title: 'FitLife Sverige — Träna smartare',
    alt_text: 'Personliga träningsprogram från 199 kr/mån',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&auto=format&fit=crop',
    link_url: 'https://example.com/fitlife',
    ad_type: 'image',
    placement_id: placements['sidebar_mid'].id,
    customer_id: customers['maria@fitlife.se'].id,
    status: 'active',
    start_date: '2026-05-01',
    end_date: '2026-09-30',
    impressions: 7300,
    clicks: 14,
  },
  {
    title: 'Naturliga Skönhet — Hudvårdsrutinen',
    alt_text: 'Prova vår bästsäljande serum gratis',
    image_url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200&auto=format&fit=crop',
    link_url: 'https://example.com/naturliga-skonhet/serum',
    ad_type: 'image',
    placement_id: placements['article_inline'].id,
    customer_id: customers['anna@naturligaskonhet.se'].id,
    status: 'active',
    start_date: '2026-05-01',
    end_date: '2026-07-31',
    impressions: 9800,
    clicks: 31,
    max_impressions: 30000,
  },
  {
    title: 'FitLife Sverige — Sommarkampanj',
    alt_text: 'Kom i form till sommaren — första månaden gratis',
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&auto=format&fit=crop',
    link_url: 'https://example.com/fitlife/sommar',
    ad_type: 'image',
    placement_id: placements['article_mid'].id,
    customer_id: customers['maria@fitlife.se'].id,
    status: 'active',
    start_date: '2026-05-01',
    end_date: '2026-08-31',
    impressions: 6900,
    clicks: 11,
    freq_cap: 1,
    freq_cap_window: 'lifetime',
  },
];

const createdAds = [];
for (const data of adData) {
  const existing = await Ad.findOne({ where: { title: data.title, placement_id: data.placement_id } });
  if (!existing) {
    const ad = await Ad.create(data);
    createdAds.push(ad);
    console.log('✅ Ad:', data.title);
  } else {
    await existing.update({ impressions: data.impressions, clicks: data.clicks, image_url: data.image_url, max_impressions: data.max_impressions || null, freq_cap: data.freq_cap || null, freq_cap_window: data.freq_cap_window || '24h' });
    createdAds.push(existing);
    console.log('⏭️  Ad:', data.title);
  }
}

// ── Ad Events (impressions + clicks spread over 30 days) ─────────────────────
const existingEvents = await AdEvent.count();
if (existingEvents < 100) {
  console.log('Seeding ad events...');
  const eventRows = [];
  for (const ad of createdAds) {
    const adRecord = adData.find(d => d.title === ad.title);
    if (!adRecord) continue;
    // Distribute ~80% of impressions as events over last 30 days
    const eventCount = Math.floor(adRecord.impressions * 0.8);
    const clickCount = Math.floor(adRecord.clicks * 0.8);
    for (let i = 0; i < eventCount; i++) {
      eventRows.push({ ad_id: ad.id, event_type: 'impression', created_at: randomDate(30) });
    }
    for (let i = 0; i < clickCount; i++) {
      eventRows.push({ ad_id: ad.id, event_type: 'click', created_at: randomDate(30) });
    }
  }
  // Batch insert in chunks of 500
  for (let i = 0; i < eventRows.length; i += 500) {
    await AdEvent.bulkCreate(eventRows.slice(i, i + 500));
  }
  console.log(`✅ Ad events: ${eventRows.length} rows`);
} else {
  console.log('⏭️  Ad events already seeded');
}

// ── Page Views (spread over 30 days with IPs + session IDs) ──────────────────
const existingViews = await PageView.count();
if (existingViews < 100) {
  console.log('Seeding page views...');
  const ips = ['203.0.113.10', '203.0.113.20', '203.0.113.35', '198.51.100.5', '198.51.100.42', '198.51.100.78', '192.0.2.15', '192.0.2.88', '192.0.2.200', '10.20.30.40'];
  const articleList = Object.values(articles);
  const pageViewRows = [];

  for (const ip of ips) {
    // Each IP has 2-5 sessions
    const sessionCount = randInt(2, 5);
    for (let s = 0; s < sessionCount; s++) {
      const sessionId = generateId() + generateId(); // 32-char as UUID substitute
      const sessionDate = randomDate(30);
      const device = Math.random() > 0.4 ? 'desktop' : 'mobile';
      const pagesInSession = randInt(1, 5);
      // Homepage visit
      pageViewRows.push({ article_id: null, page: '/', device, visitor_id: generateId(), session_id: sessionId, ip_address: ip, created_at: sessionDate });
      // Article visits within session
      for (let p = 0; p < pagesInSession; p++) {
        const art = articleList[randInt(0, articleList.length - 1)];
        pageViewRows.push({ article_id: art.id, page: `/artikel/${art.slug}`, device, visitor_id: generateId(), session_id: sessionId, ip_address: ip, created_at: sessionDate });
      }
    }
  }

  await PageView.bulkCreate(pageViewRows);
  console.log(`✅ Page views: ${pageViewRows.length} rows`);
} else {
  console.log('⏭️  Page views already seeded');
}

console.log('\n🎉 Seed complete!');
console.log('   admin@livsstil24.se   / admin123');
console.log('   editor@livsstil24.se  / editor123');
console.log('   annonser@livsstil24.se / ads123');

await sequelize.close();
