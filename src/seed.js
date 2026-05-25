import bcrypt from 'bcryptjs';
import sequelize from './config/db.js';
import { User, Category, Article, Customer, AdPlacement, Ad } from './models/index.js';

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
  { name: 'Skönhet',      slug: 'skonhet',      color: '#F2CC8F', icon: '💄', sort_order: 6 },
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
  {
    title: '10 tips för ett hälsosammare liv',
    slug: '10-tips-for-ett-halsosammare-liv',
    excerpt: 'Enkla vanor som gör stor skillnad för din hälsa och välmående.',
    content: '<p>Att leva ett hälsosamt liv behöver inte vara komplicerat. Här är tio enkla tips som hjälper dig på vägen mot ett bättre mående.</p><p>1. Drick tillräckligt med vatten varje dag. 2. Rör på dig minst 30 minuter om dagen. 3. Ät mer grönsaker och frukt. 4. Prioritera sömnen. 5. Minska stressen med mindfulness.</p>',
    featured_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&auto=format&fit=crop',
    category_id: categories['halsa'].id,
    author_id: admin.id,
    status: 'published',
    featured: true,
    read_time: 4,
    tags: ['hälsa', 'tips', 'livsstil'],
    published_at: new Date('2026-04-10'),
  },
  {
    title: 'Höstens hetaste modetrender 2024',
    slug: 'hostens-hetaste-modetrender-2024',
    excerpt: 'Från catwalk till vardagsgarderob — dessa trender dominerar hösten.',
    content: '<p>Hösten 2024 handlar om jordtoner, oversized silhuetter och hållbara material. Vi guidar dig genom säsongens viktigaste trender.</p>',
    featured_image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop',
    category_id: categories['mode'].id,
    author_id: admin.id,
    status: 'published',
    featured: true,
    read_time: 5,
    tags: ['mode', 'trender', 'höst'],
    published_at: new Date('2026-04-15'),
  },
  {
    title: 'Recept: Krämig pasta med rostad pumpa',
    slug: 'recept-kramig-pasta-med-rostad-pumpa',
    excerpt: 'En höstlig rätt som värmer från insidan — klar på 30 minuter.',
    content: '<p>Den här enkla pastasåsen med rostad pumpa och salvia är perfekt för höstkvällarna. Servera med nyriven parmesan och ett glas vitt vin.</p>',
    featured_image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&auto=format&fit=crop',
    category_id: categories['mat'].id,
    author_id: admin.id,
    status: 'published',
    featured: true,
    read_time: 3,
    tags: ['recept', 'mat', 'vegetariskt'],
    published_at: new Date('2026-04-18'),
  },
  {
    title: 'Drömresan till Mallorca — vad du inte får missa',
    slug: 'dromresan-till-mallorca',
    excerpt: 'Bortom turistfällorna: de bästa stränderna, restaurangerna och upplevelserna.',
    content: '<p>Mallorca är mer än bara sol och bad. Vi har utforskat de gömda pärlorna som gör ön till en destination för alla smaker.</p>',
    featured_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop',
    category_id: categories['resor'].id,
    author_id: admin.id,
    status: 'published',
    featured: true,
    read_time: 6,
    tags: ['resor', 'mallorca', 'semester'],
    published_at: new Date('2026-04-20'),
  },
  {
    title: 'Inredningstrender: Minimalism möter värme',
    slug: 'inredningstrender-minimalism-moter-varme',
    excerpt: 'Hur skapar du ett hem som känns både stilrent och ombonat?',
    content: '<p>Den nya minimalismen handlar inte om kala ytor — det handlar om att välja rätt. Vi visar hur du kombinerar enkelhet med värme och personlighet.</p>',
    featured_image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop',
    category_id: categories['hem'].id,
    author_id: admin.id,
    status: 'published',
    featured: true,
    read_time: 5,
    tags: ['hem', 'inredning', 'minimalism'],
    published_at: new Date('2026-04-22'),
  },
  {
    title: 'Skönhetsrutiner för en strålande hy',
    slug: 'skonhetsrutiner-for-en-strålande-hy',
    excerpt: 'Enkla steg som ger synliga resultat — utan lyxbudget.',
    content: '<p>En bra hudvårdsrutin behöver inte vara komplicerad eller dyr. Vi går igenom de viktigaste stegen för en frisk och strålande hy året om.</p>',
    featured_image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&auto=format&fit=crop',
    category_id: categories['skonhet'].id,
    author_id: admin.id,
    status: 'published',
    featured: true,
    read_time: 4,
    tags: ['skönhet', 'hudvård', 'rutin'],
    published_at: new Date('2026-04-25'),
  },
  {
    title: 'Morgonrutiner som förändrar din dag',
    slug: 'morgonrutiner-som-forandrar-din-dag',
    excerpt: 'Vad du gör de första 30 minuterna avgör hela dagen.',
    content: '<p>Framgångsrika människor delar ofta en sak — en stark morgonrutin. Här är de vanor som faktiskt gör skillnad.</p>',
    featured_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&auto=format&fit=crop',
    category_id: categories['halsa'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    read_time: 4,
    tags: ['hälsa', 'rutin', 'produktivitet'],
    published_at: new Date('2026-04-28'),
  },
  {
    title: 'Capsule wardrobe: bygg en tidlös garderob',
    slug: 'capsule-wardrobe-bygg-en-tidlos-garderob',
    excerpt: 'Färre plagg, mer stil — principerna bakom den perfekta garderoben.',
    content: '<p>En capsule wardrobe handlar om att investera i rätt basplagg som fungerar tillsammans. Vi guidar dig steg för steg.</p>',
    featured_image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop',
    category_id: categories['mode'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    read_time: 5,
    tags: ['mode', 'garderob', 'hållbarhet'],
    published_at: new Date('2026-05-01'),
  },
  {
    title: 'Tokyo på 5 dagar — den ultimata guiden',
    slug: 'tokyo-pa-5-dagar-den-ultimata-guiden',
    excerpt: 'Temples, street food och neonljus — allt du behöver veta.',
    content: '<p>Tokyo är en av världens mest spännande städer. Här är vår guide till hur du får ut det mesta av fem dagar i den japanska megastaden.</p>',
    featured_image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&auto=format&fit=crop',
    category_id: categories['resor'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    read_time: 7,
    tags: ['resor', 'tokyo', 'japan'],
    published_at: new Date('2026-05-03'),
  },
  {
    title: 'Växtbaserad kost — en nybörjarguide',
    slug: 'vaxtbaserad-kost-en-nybörjarguide',
    excerpt: 'Allt du behöver veta för att komma igång med ett mer växtbaserat ätande.',
    content: '<p>Att äta mer växtbaserat är en av de bästa sakerna du kan göra för både din hälsa och planeten. Så här börjar du.</p>',
    featured_image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop',
    category_id: categories['mat'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    read_time: 5,
    tags: ['mat', 'veganskt', 'hälsa'],
    published_at: new Date('2026-05-06'),
  },
  {
    title: 'Hållbara heminredningsval som gör skillnad',
    slug: 'hallbara-heminredningsval-som-gor-skillnad',
    excerpt: 'Vackert hem och gott samvete — det går att kombinera.',
    content: '<p>Hållbar inredning handlar om att välja material och producenter med omsorg. Vi tipsar om de bästa alternativen för ett miljömedvetet hem.</p>',
    featured_image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop',
    category_id: categories['hem'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    read_time: 4,
    tags: ['hem', 'hållbarhet', 'inredning'],
    published_at: new Date('2026-05-08'),
  },
  {
    title: 'Naturlig makeup: less is more',
    slug: 'naturlig-makeup-less-is-more',
    excerpt: 'Få en fräsch look på under tio minuter med rätt produkter.',
    content: '<p>Den naturliga makeuptrenden är här för att stanna. Vi visar hur du framhäver dina naturliga drag med minimala medel.</p>',
    featured_image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop',
    category_id: categories['skonhet'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    read_time: 3,
    tags: ['skönhet', 'makeup', 'naturlig'],
    published_at: new Date('2026-05-10'),
  },
  {
    title: 'Bättre sömn på 7 dagar — vetenskapliga råd',
    slug: 'battre-somn-pa-7-dagar',
    excerpt: 'Sömnforskningens bästa knep för att somna snabbare och vakna utvilad.',
    content: '<p>Sömnbrist påverkar allt från humör till immunförsvar. Här är sju bevisade strategier som förbättrar sömnkvaliteten på en vecka.</p><p>Dag 1: Sätt en fast sovtid och håll dig till den även på helger. Dag 2: Sänk rumstemperaturen till 18–19 grader. Dag 3: Undvik skärmar en timme innan läggdags. Dag 4: Testa ett magnesiumtillskott. Dag 5: Promenera 20 minuter utomhus under dagen. Dag 6: Begränsa koffein efter kl 14. Dag 7: Skapa en nedvarvningsrutin med läsning eller meditation.</p>',
    featured_image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=1200&auto=format&fit=crop',
    category_id: categories['halsa'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    read_time: 5,
    tags: ['hälsa', 'sömn', 'välmående'],
    published_at: new Date('2026-05-12'),
  },
  {
    title: 'Streetstyle från Stockholm Fashion Week',
    slug: 'streetstyle-fran-stockholm-fashion-week',
    excerpt: 'De bästa outfitsen utanför visningarna — inspiration från gatorna.',
    content: '<p>Stockholm Fashion Week levererar alltid lika mycket inspiration utanför visningslokalerna som innanför. Vi dokumenterade de mest minnesvärda outfitsen från årets upplaga.</p><p>Trenden som stack ut mest var lagertänket — tunna stickade plagg över collared shirts, kombinerat med vida byxor och chunky boots. Färgpaletten dominerades av olivgrönt, rostbrunt och crème.</p>',
    featured_image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&auto=format&fit=crop',
    category_id: categories['mode'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    read_time: 4,
    tags: ['mode', 'stockholm', 'streetstyle'],
    published_at: new Date('2026-05-13'),
  },
  {
    title: 'Perfekt surdegsbröd hemma — steg för steg',
    slug: 'perfekt-surdegsbrод-hemma',
    excerpt: 'Den kompletta guiden till att baka surdeg som en proffsbagare.',
    content: '<p>Surdegsbakning kräver tålamod men belöningen är ett bröd som slår allt du hittar i butiken. Här är vår kompletta guide från starter till färdigt bröd.</p><p>Dag 1–5: Mata din starter dagligen med 50g mjöl och 50g vatten. Dag 6: Blanda deg med 450g vetemjöl, 50g rågmjöl, 375g vatten och 10g salt. Forma och låt jäsa i kylskåp över natten. Grädda i gjutjärnsgryta i 250 grader.</p>',
    featured_image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop',
    category_id: categories['mat'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    read_time: 6,
    tags: ['mat', 'bakning', 'surdeg'],
    published_at: new Date('2026-05-14'),
  },
  {
    title: 'Lissabon — Europas bäst bevarade hemlighet',
    slug: 'lissabon-europas-bast-bevarade-hemlighet',
    excerpt: 'Fado, pastéis de nata och solnedgångar som stannar kvar i minnet.',
    content: '<p>Lissabon har länge levt i skuggan av Barcelona och Paris, men den portugisiska huvudstaden har allt — historia, mat, kultur och ett klimat som sällan sviker.</p><p>Miradouros, utsiktsplatserna utspridda över stadens sju kullar, erbjuder panoramavyer som är svåra att slå. Alfama-distriktet med sina smala kullerstensgator och live-fadokonserter varje kväll är ett måste. Och pastéis de nata — de krisp-krämiga vaniljgubbarnas hemstad är Pastéis de Belém.</p>',
    featured_image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&auto=format&fit=crop',
    category_id: categories['resor'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    read_time: 6,
    tags: ['resor', 'lissabon', 'portugal'],
    published_at: new Date('2026-05-15'),
  },
  {
    title: 'Balkong och uteplats — gör om till ett utomhusrum',
    slug: 'balkong-och-uteplats-gor-om-till-utomhusrum',
    excerpt: 'Maximera din utomhusyta med smart möblering och rätt växter.',
    content: '<p>Även den minsta balkong kan bli en grön oas med rätt approach. Nyckeln är att tänka i zoner precis som inomhus — en sittzon, en grönzon och kanske en liten matzon.</p><p>Välj möbler av teak eller aluminium som tål väder och vind. Krukor i olika höjder skapar djup och känsla. Ljusslingor och ett par lantlyktor förvandlar balkongen till kvällens favoritplats.</p>',
    featured_image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&auto=format&fit=crop',
    category_id: categories['hem'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    read_time: 4,
    tags: ['hem', 'balkong', 'trädgård'],
    published_at: new Date('2026-05-16'),
  },
  {
    title: 'Hårvård 2026: ingredienser som faktiskt fungerar',
    slug: 'harvard-2026-ingredienser-som-faktiskt-fungerar',
    excerpt: 'Skär igenom hypen — det är dessa ämnen din hårbotten verkligen behöver.',
    content: '<p>Hårvårdsmarknaden är full av löften men få ingredienser har riktigt vetenskapligt stöd. Vi reder ut vilka som faktiskt gör skillnad.</p><p>Niacinamid stärker hårstråets yttre lager och minskar brott. Peptider stimulerar hårsäckarna och kan bromsa tunnare hår. Hyaluronsyra i serum ger fukttillskott direkt till hårbotten. Undvik sulfater om du har färgat eller skadat hår — de tvättar bort för mycket av det naturliga fettet.</p>',
    featured_image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200&auto=format&fit=crop',
    category_id: categories['skonhet'].id,
    author_id: admin.id,
    status: 'published',
    featured: false,
    read_time: 5,
    tags: ['skönhet', 'hårvård', 'ingredienser'],
    published_at: new Date('2026-05-17'),
  },
];

for (const data of articleData) {
  const [art, created] = await Article.findOrCreate({ where: { slug: data.slug }, defaults: data });
  if (!created && data.featured_image) await art.update({ featured_image: data.featured_image });
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
  { name: 'Hero Banner',      position_key: 'hero_banner',    price_monthly: 6900, max_ads: 1, description: 'Startsida — stor hero-bild överst' },
  { name: 'Footer Banner',    position_key: 'footer_banner',  price_monthly: 2900, max_ads: 1, description: 'Alla sidor — banner längst ner' },
  { name: 'Category Top',     position_key: 'category_top',   price_monthly: 2400, max_ads: 1, description: 'Kategorisidor — banner under rubriken' },
  { name: 'Article Inline',   position_key: 'article_inline', price_monthly: 2400, max_ads: 1, description: 'Artikelsidor — video/banner efter texten' },
  { name: 'Article Mid',      position_key: 'article_mid',    price_monthly: 3200, max_ads: 1, description: 'Artikelsidor — annons mitt i artikeln' },
  { name: 'Sidebar Top',      position_key: 'sidebar_top',    price_monthly: 3900, max_ads: 1, description: 'Sidopanel — övre annonsplats' },
  { name: 'Sidebar Mid',      position_key: 'sidebar_mid',    price_monthly: 2900, max_ads: 1, description: 'Sidopanel — nedre annonsplats' },
];

for (const data of placementData) {
  const [pl, created] = await AdPlacement.findOrCreate({ where: { position_key: data.position_key }, defaults: data });
  console.log(`${created ? '✅' : '⏭️ '} Placement: ${pl.name}`);
}

// ── Ads ───────────────────────────────────────────────────────────────────────
const customers = {};
for (const data of customerData) {
  const cust = await Customer.findOne({ where: { email: data.email } });
  customers[data.email] = cust;
}

const placements = {};
for (const data of placementData) {
  const pl = await AdPlacement.findOne({ where: { position_key: data.position_key } });
  placements[data.position_key] = pl;
}

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
    price_paid: 6900,
  },
  {
    title: 'Svensk Mode Group — Nytt Kollektionen',
    alt_text: 'Upptäck säsongens nyheter',
    image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop',
    link_url: 'https://example.com/svensk-mode',
    ad_type: 'image',
    placement_id: placements['sidebar_top'].id,
    customer_id: customers['erik@svenskmode.se'].id,
    status: 'active',
    start_date: '2026-05-01',
    end_date: '2026-08-31',
    price_paid: 3900,
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
    price_paid: 2900,
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
    price_paid: 2400,
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
    price_paid: 3200,
  },
  {
    title: 'Svensk Mode Group — Footer',
    alt_text: 'Fri frakt på beställningar över 499 kr',
    image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop',
    link_url: 'https://example.com/svensk-mode/erbjudande',
    ad_type: 'image',
    placement_id: placements['footer_banner'].id,
    customer_id: customers['erik@svenskmode.se'].id,
    status: 'active',
    start_date: '2026-05-01',
    end_date: '2026-08-31',
    price_paid: 2900,
  },
];

for (const data of adData) {
  const existing = await Ad.findOne({ where: { title: data.title, placement_id: data.placement_id } });
  if (!existing) {
    await Ad.create(data);
    console.log('✅ Ad:', data.title);
  } else {
    await existing.update({ image_url: data.image_url });
    console.log('⏭️  Ad:', data.title);
  }
}

console.log('\n🎉 Seed complete!');
console.log('   Login: admin@livsstil24.se  /  admin123');

await sequelize.close();
