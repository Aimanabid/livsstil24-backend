import bcrypt from 'bcryptjs';
import sequelize from './config/db.js';
import { User, Category, Article, Customer, AdPlacement } from './models/index.js';

await sequelize.authenticate();

// ── Users ────────────────────────────────────────────────────────────────────
const [admin] = await User.findOrCreate({
  where: { email: 'admin@livsstil24.se' },
  defaults: {
    name: 'Admin',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
  },
});
console.log('✅ User:', admin.email, '/ password: admin123');

// ── Categories ───────────────────────────────────────────────────────────────
const categoryData = [
  { name: 'Hälsa',     slug: 'halsa',     color: '#6BAE75', icon: '🌿', sort_order: 1 },
  { name: 'Mode',      slug: 'mode',      color: '#C9A96E', icon: '👗', sort_order: 2 },
  { name: 'Mat',       slug: 'mat',       color: '#E07A5F', icon: '🍽️', sort_order: 3 },
  { name: 'Resor',     slug: 'resor',     color: '#3D405B', icon: '✈️', sort_order: 4 },
  { name: 'Hem',       slug: 'hem',       color: '#81B29A', icon: '🏡', sort_order: 5 },
  { name: 'Skönhet',   slug: 'skonhet',   color: '#F2CC8F', icon: '💄', sort_order: 6 },
];

const categories = {};
for (const data of categoryData) {
  const [cat] = await Category.findOrCreate({ where: { slug: data.slug }, defaults: data });
  categories[data.slug] = cat;
  console.log('✅ Category:', cat.name);
}

// ── Articles ─────────────────────────────────────────────────────────────────
const articleData = [
  {
    title: '10 tips för ett hälsosammare liv',
    slug: '10-tips-for-ett-halsosammare-liv',
    excerpt: 'Enkla vanor som gör stor skillnad för din hälsa och välmående.',
    content: '<p>Att leva ett hälsosamt liv behöver inte vara komplicerat. Här är tio enkla tips som hjälper dig på vägen mot ett bättre mående.</p><p>1. Drick tillräckligt med vatten varje dag. 2. Rör på dig minst 30 minuter om dagen. 3. Ät mer grönsaker och frukt. 4. Prioritera sömnen. 5. Minska stressen med mindfulness.</p>',
    category_id: categories['halsa'].id,
    author_id: admin.id,
    status: 'published',
    featured: true,
    views: 342,
    read_time: 4,
    tags: ['hälsa', 'tips', 'livsstil'],
    published_at: new Date(),
  },
  {
    title: 'Höstens hetaste modetrender 2024',
    slug: 'hostens-hetaste-modetrender-2024',
    excerpt: 'Från catwalk till vardagsgarderob — dessa trender dominerar hösten.',
    content: '<p>Hösten 2024 handlar om jordtoner, oversized silhuetter och hållbara material. Vi guidar dig genom säsongens viktigaste trender.</p>',
    category_id: categories['mode'].id,
    author_id: admin.id,
    status: 'published',
    featured: true,
    views: 215,
    read_time: 5,
    tags: ['mode', 'trender', 'höst'],
    published_at: new Date(),
  },
  {
    title: 'Recept: Krämig pasta med rostad pumpa',
    slug: 'recept-kramig-pasta-med-rostad-pumpa',
    excerpt: 'En höstlig rätt som värmer från insidan — klar på 30 minuter.',
    content: '<p>Den här enkla pastasåsen med rostad pumpa och salvia är perfekt för höstkvällarna. Servera med nyriven parmesan och ett glas vitt vin.</p>',
    category_id: categories['mat'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    views: 178,
    read_time: 3,
    tags: ['recept', 'mat', 'vegetariskt'],
    published_at: new Date(),
  },
  {
    title: 'Drömresan till Mallorca — vad du inte får missa',
    slug: 'dromresan-till-mallorca',
    excerpt: 'Bortom turistfällorna: de bästa stränderna, restaurangerna och upplevelserna.',
    content: '<p>Mallorca är mer än bara sol och bad. Vi har utforskat de gömda pärlorna som gör ön till en destination för alla smaker.</p>',
    category_id: categories['resor'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    views: 89,
    read_time: 6,
    tags: ['resor', 'mallorca', 'semester'],
    published_at: new Date(),
  },
  {
    title: 'Inredningstrender: Minimalism möter värme',
    slug: 'inredningstrender-minimalism-moter-varme',
    excerpt: 'Hur skapar du ett hem som känns både stilrent och ombonat?',
    content: '<p>Den nya minimalismen handlar inte om kala ytor — det handlar om att välja rätt. Vi visar hur du kombinerar enkelhet med värme och personlighet.</p>',
    category_id: categories['hem'].id,
    author_id: admin.id,
    status: 'draft',
    featured: false,
    views: 0,
    read_time: 5,
    tags: ['hem', 'inredning', 'minimalism'],
    published_at: null,
  },
];

for (const data of articleData) {
  const [art, created] = await Article.findOrCreate({ where: { slug: data.slug }, defaults: data });
  console.log(`${created ? '✅' : '⏭️ '} Article: ${art.title}`);
}

// ── Customers ─────────────────────────────────────────────────────────────────
const customerData = [
  { company: 'Naturliga Skönhet AB',  contact_name: 'Anna Lindqvist',  email: 'anna@naturligaskonhet.se',  phone: '070-123 45 67', org_number: '556123-4567', status: 'active' },
  { company: 'Svensk Mode Group',     contact_name: 'Erik Johansson',  email: 'erik@svenskmode.se',        phone: '073-234 56 78', org_number: '556234-5678', status: 'active' },
  { company: 'FitLife Sverige',       contact_name: 'Maria Petersson', email: 'maria@fitlife.se',          phone: '076-345 67 89', org_number: '556345-6789', status: 'active' },
  { company: 'Resebyrån Äventyr',     contact_name: 'Johan Berg',      email: 'johan@aventyr.se',          phone: '070-456 78 90', org_number: '556456-7890', status: 'inactive' },
];

for (const data of customerData) {
  const [cust, created] = await Customer.findOrCreate({ where: { email: data.email }, defaults: data });
  console.log(`${created ? '✅' : '⏭️ '} Customer: ${cust.company}`);
}

// ── Ad Placements ─────────────────────────────────────────────────────────────
const placementData = [
  { name: 'Topbanner',       position_key: 'top-banner',       size: '970×90',  width: 970,  height: 90,  price_monthly: 4900, max_ads: 1, page_location: 'Alla sidor — överst',    description: 'Stor banner längst upp på sidan, synlig för alla besökare.' },
  { name: 'Sidopanel vänster', position_key: 'sidebar-left',   size: '300×250', width: 300,  height: 250, price_monthly: 2900, max_ads: 2, page_location: 'Artikelsidor — vänster', description: 'Rektangelannons i vänster sidopanel bredvid artiklar.' },
  { name: 'Sidopanel höger',  position_key: 'sidebar-right',   size: '300×600', width: 300,  height: 600, price_monthly: 3900, max_ads: 1, page_location: 'Artikelsidor — höger',  description: 'Bred halvsidesannons i höger sidopanel.' },
  { name: 'I artkel',         position_key: 'in-article',      size: '728×90',  width: 728,  height: 90,  price_monthly: 2400, max_ads: 3, page_location: 'Mitt i artikeltext',     description: 'Leaderboard-banner inbäddad mitt i artikeln.' },
  { name: 'Startsida hero',   position_key: 'homepage-hero',   size: '1200×400', width: 1200, height: 400, price_monthly: 6900, max_ads: 1, page_location: 'Startsida — hero',      description: 'Premium helbredd-banner på startsidan.' },
];

for (const data of placementData) {
  const [pl, created] = await AdPlacement.findOrCreate({ where: { position_key: data.position_key }, defaults: data });
  console.log(`${created ? '✅' : '⏭️ '} Placement: ${pl.name}`);
}

console.log('\n🎉 Seed complete!');
console.log('   Login: admin@livsstil24.se  /  admin123');

await sequelize.close();
