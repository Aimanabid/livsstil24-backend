import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../data/livsstil24.db');

let db;

export function getDB() {
  if (!db) throw new Error('DB not initialized. Call initDB() first.');
  return db;
}

export function initDB() {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'editor',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT '#C9A96E',
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT,
      featured_image TEXT,
      category_id TEXT REFERENCES categories(id),
      author_id TEXT REFERENCES users(id),
      status TEXT DEFAULT 'draft',
      featured INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      read_time INTEGER DEFAULT 5,
      tags TEXT DEFAULT '[]',
      seo_title TEXT,
      seo_description TEXT,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      contact_name TEXT,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      org_number TEXT,
      address TEXT,
      website TEXT,
      notes TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ad_placements (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      size TEXT,
      width INTEGER,
      height INTEGER,
      price_monthly INTEGER DEFAULT 0,
      max_ads INTEGER DEFAULT 1,
      page_location TEXT,
      position_key TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ads (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      image_url TEXT,
      link_url TEXT,
      alt_text TEXT,
      placement_id TEXT REFERENCES ad_placements(id),
      customer_id TEXT REFERENCES customers(id),
      status TEXT DEFAULT 'active',
      start_date DATE,
      end_date DATE,
      clicks INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      price_paid INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id TEXT REFERENCES articles(id),
      page TEXT,
      referrer TEXT,
      country TEXT,
      device TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ad_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ad_id TEXT REFERENCES ads(id),
      event_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Schema migrations — safe to run on every startup
  const placementCols = db.prepare("PRAGMA table_info(ad_placements)").all().map(c => c.name);
  if (!placementCols.includes('max_ads')) {
    db.exec('ALTER TABLE ad_placements ADD COLUMN max_ads INTEGER DEFAULT 1');
    console.log('✅ Migrated: added ad_placements.max_ads');
  }
  if (!placementCols.includes('page_location')) {
    db.exec('ALTER TABLE ad_placements ADD COLUMN page_location TEXT');
    console.log('✅ Migrated: added ad_placements.page_location');
  }

  const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)').run(
      uuidv4(), 'admin@livsstil24.se', hash, 'Admin', 'admin'
    );
    console.log('✅ Default admin: admin@livsstil24.se / admin123');
  }

  const catExists = db.prepare('SELECT id FROM categories LIMIT 1').get();
  if (!catExists) {
    const cats = [

      { name: 'Mode', slug: 'mode', color: '#D4A5A5', icon: '👗', sort: 1 },
      { name: 'Skönhet', slug: 'skonhet', color: '#E8C4B8', icon: '✨', sort: 2 },
      { name: 'Träning & Hälsa', slug: 'traning-halsa', color: '#A8C5A0', icon: '🌿', sort: 3 },
      { name: 'Mat & Dryck', slug: 'mat-dryck', color: '#C9A96E', icon: '🍷', sort: 4 },
      { name: 'Inredning', slug: 'inredning', color: '#B8C4D4', icon: '🏠', sort: 5 },
      { name: 'Resor', slug: 'resor', color: '#A5C4C9', icon: '✈️', sort: 6 },
      { name: 'Nöje', slug: 'noje', color: '#C4A5C9', icon: '🎭', sort: 7 },
    ];
    const stmt = db.prepare('INSERT INTO categories (id, name, slug, color, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    cats.forEach(c => stmt.run(uuidv4(), c.name, c.slug, c.color, c.icon, c.sort));

    const placements = [
      { name: 'Hero Banner', desc: 'Stor banner högst upp på startsidan', size: '1200x300', w: 1200, h: 300, price: 8900, max: 1, loc: 'homepage', key: 'hero_banner' },
      { name: 'Sidebar Topp', desc: 'Sidebar position 1 – höger kolumn', size: '300x250', w: 300, h: 250, price: 3500, max: 1, loc: 'all_pages', key: 'sidebar_top' },
      { name: 'Sidebar Mitten', desc: 'Sidebar position 2', size: '300x250', w: 300, h: 250, price: 2800, max: 1, loc: 'all_pages', key: 'sidebar_mid' },
      { name: 'Artikel Inline', desc: 'Mitt i artikeltexten', size: '728x90', w: 728, h: 90, price: 4200, max: 3, loc: 'articles', key: 'article_inline' },
      { name: 'Footer Banner', desc: 'Bred banner i sidfoten', size: '728x90', w: 728, h: 90, price: 2500, max: 2, loc: 'all_pages', key: 'footer_banner' },
      { name: 'Kategori Topp', desc: 'Topp av kategorisida', size: '728x90', w: 728, h: 90, price: 3200, max: 1, loc: 'category', key: 'category_top' },
    ];
    const pstmt = db.prepare('INSERT INTO ad_placements (id, name, description, size, width, height, price_monthly, max_ads, page_location, position_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    placements.forEach(p => pstmt.run(uuidv4(), p.name, p.desc, p.size, p.w, p.h, p.price, p.max, p.loc, p.key));

    // Demo customer
    db.prepare('INSERT OR IGNORE INTO customers (id, company, contact_name, email, phone, status) VALUES (?, ?, ?, ?, ?, ?)').run(
      uuidv4(), 'H&M Sverige AB', 'Maria Lindgren', 'maria.lindgren@hm.com', '08-123 456', 'active'
    );

    console.log('✅ Demo data seeded');
  }

  // Article seeding — runs independently so it can populate an existing DB
  const articleCount = db.prepare('SELECT COUNT(*) as count FROM articles').get();
  if (articleCount.count < 16) {
    const adminUser = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
    const modecat      = db.prepare('SELECT id FROM categories WHERE slug = ?').get('mode');
    const skonhetCat   = db.prepare('SELECT id FROM categories WHERE slug = ?').get('skonhet');
    const traningCat   = db.prepare('SELECT id FROM categories WHERE slug = ?').get('traning-halsa');
    const matCat       = db.prepare('SELECT id FROM categories WHERE slug = ?').get('mat-dryck');
    const inredningCat = db.prepare('SELECT id FROM categories WHERE slug = ?').get('inredning');
    const resorCat     = db.prepare('SELECT id FROM categories WHERE slug = ?').get('resor');
    const nojeCat      = db.prepare('SELECT id FROM categories WHERE slug = ?').get('noje');

    const day = 86400000;
    const articles = [
      // ── Mode ──────────────────────────────────────────────
      {
        title: 'Vårens viktigaste trender 2026',
        slug: 'varens-viktigaste-trender-2026',
        excerpt: 'Från minimalism till maximalismens återkomst – vi guidar dig genom säsongens hetaste trender.',
        content: '<p>Våren 2026 bjuder på en spännande blandning av minimalism och djärva färgval. De stora modeskaparna har talat och vi har sammanfattat det viktigaste för dig.</p><h2>Mjuka pasteller möter djärva accenter</h2><p>Årets vårpalett domineras av mjuka pudertoner som kompletteras med överraskande starka accenter i koboltblått och terrakotta.</p>',
        featured_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        category_id: modecat?.id, author_id: adminUser?.id, status: 'published', featured: 1, views: 1247, read_time: 4,
        published_at: new Date(Date.now() - day).toISOString()
      },
      {
        title: 'Denim är tillbaka – så bär du den rätt',
        slug: 'denim-ar-tillbaka-2026',
        excerpt: 'Jeans, jackor och kjolar i denim dominerar vårens kollektioner. Här är de snyggaste sätten att bära trenden.',
        content: '<p>Det är ingen tvekan om att denim är årets material. Från wide-leg jeans till oversized denimjackor – modet har gett oss en mångsidig trend att leka med.</p><h2>Wide-leg vs slim</h2><p>I år dominerar wide-leg siluetten men styling-experterna tipsar om att balansera med ett tightare plagg på överkroppen.</p><h2>Double denim</h2><p>Törs du bära hela outfiten i denim? Det är en av säsongens modigaste looks och fungerar fantastiskt med rätt fit.</p>',
        featured_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        category_id: modecat?.id, author_id: adminUser?.id, status: 'published', featured: 0, views: 834, read_time: 3,
        published_at: new Date(Date.now() - 3*day).toISOString()
      },
      {
        title: 'Accessoarer som lyfter varje outfit',
        slug: 'accessoarer-som-lyfter-outfit-2026',
        excerpt: 'Rätt väska, smycken och skor kan förvandla en simpel look till något minnesvärt.',
        content: '<p>Accessoarer är modens hemliga vapen. En neutral outfit kan totalt förvandlas med rätt detaljer.</p><h2>Stora statement-örhängen</h2><p>Överdimensionerade örhängen i guld eller silver är årets mest bärda accessoar.</p><h2>Strukturerade väskor</h2><p>Den mjuka hobo-väskan har fått konkurrens av strikta, geometriska former i läder och material.</p>',
        featured_image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
        category_id: modecat?.id, author_id: adminUser?.id, status: 'published', featured: 1, views: 612, read_time: 3,
        published_at: new Date(Date.now() - 5*day).toISOString()
      },
      {
        title: 'Hållbar mode – märken du bör känna till',
        slug: 'hallbar-mode-marken-2026',
        excerpt: 'Att klä sig stiligt och hållbart behöver inte vara en kompromiss. Vi presenterar de bästa hållbara märkena just nu.',
        content: '<p>Hållbar mode har gått från nischtrend till mainstream. Fler och fler konsumenter efterfrågar plagg med etisk produktion och miljövänliga material.</p><h2>Scandinavian Sustainable</h2><p>De nordiska märkena leder vägen med transparenta leverantörskedjor och organiska material.</p>',
        featured_image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',
        category_id: modecat?.id, author_id: adminUser?.id, status: 'published', featured: 0, views: 445, read_time: 5,
        published_at: new Date(Date.now() - 8*day).toISOString()
      },

      // ── Skönhet ───────────────────────────────────────────
      {
        title: 'Skin-first beauty – Mindre smink, mer hud',
        slug: 'skin-first-beauty-2026',
        excerpt: 'Den nya skönhetsrörelsen handlar om att ta hand om huden snarare än att dölja den.',
        content: '<p>Skin-first beauty är 2026 års stora skönhetstrend. Istället för att täcka huden med tjockt foundation handlar det om att vårda och visa upp den naturliga huden.</p>',
        featured_image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800',
        category_id: skonhetCat?.id, author_id: adminUser?.id, status: 'published', featured: 1, views: 892, read_time: 3,
        published_at: new Date(Date.now() - 2*day).toISOString()
      },
      {
        title: 'Morgonrutinen som förändrar din hud',
        slug: 'morgonrutinen-som-forandrar-din-hud',
        excerpt: 'Fem enkla steg på morgonen som gör att din hud mår och ser bättre ut under hela dagen.',
        content: '<p>En välstrukturerad morgonrutin behöver inte ta lång tid. Med rätt produkter och rätt ordning kan du maximera resultaten.</p><h2>Steg 1: Rengöring</h2><p>Börja alltid med en mild rengöring för att ta bort nattens talg och orenheter.</p><h2>Steg 2: Toner</h2><p>En fuktighetshöjande toner förbereder huden för efterföljande produkter.</p><h2>Steg 3: Serum</h2><p>Välj ett serum anpassat till ditt hudproblem – C-vitamin för lyster, hyaluronsyra för fukt.</p>',
        featured_image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
        category_id: skonhetCat?.id, author_id: adminUser?.id, status: 'published', featured: 0, views: 1103, read_time: 4,
        published_at: new Date(Date.now() - 4*day).toISOString()
      },
      {
        title: 'SPF varje dag – därför är det ett måste',
        slug: 'spf-varje-dag-maste-2026',
        excerpt: 'Solskydd är den viktigaste anti-agingprodukten du kan använda, oavsett väder och årstid.',
        content: '<p>Dermatologer är eniga: daglig solskydd är det bästa du kan göra för din hud på lång sikt. UV-strålning orsakar upp till 80% av hudens synliga åldrande.</p><h2>Välj rätt SPF</h2><p>SPF 30 skyddar mot 97% av UVB-strålning, SPF 50 mot 98%. Skillnaden är liten men konsekvent användning är nyckeln.</p>',
        featured_image: 'https://images.unsplash.com/photo-1526758097130-bab247274f58?w=800',
        category_id: skonhetCat?.id, author_id: adminUser?.id, status: 'published', featured: 0, views: 678, read_time: 3,
        published_at: new Date(Date.now() - 7*day).toISOString()
      },

      // ── Träning & Hälsa ───────────────────────────────────
      {
        title: '30-dagars utmaning: Forma din kropp hemma',
        slug: '30-dagars-utmaning-hemma-2026',
        excerpt: 'Inget gym, ingen utrustning – bara din egen kroppsvikt och vår guide. Här är programmet.',
        content: '<p>Du behöver inte ett gymmedlemskap för att komma i form. Kroppsviktsträning är effektivt, flexibelt och kan anpassas till alla nivåer.</p><h2>Vecka 1: Grunderna</h2><p>Fokus på korrekt teknik i basrörelserna: knäböj, armhävningar, utfall och plankan.</p><h2>Vecka 2–4: Progression</h2><p>Öka repetitioner och lägg till variationer för att fortsätta utmana kroppen.</p>',
        featured_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        category_id: traningCat?.id, author_id: adminUser?.id, status: 'published', featured: 1, views: 2341, read_time: 6,
        published_at: new Date(Date.now() - 2*day).toISOString()
      },
      {
        title: 'Mindfulness och rörelse – den perfekta kombinationen',
        slug: 'mindfulness-och-rorelse-2026',
        excerpt: 'Att träna kropp och sinne samtidigt ger resultat som varken yoga eller HIIT kan ge var för sig.',
        content: '<p>Forskning visar att kombinationen av medveten rörelse och andningsövningar reducerar stresshormonet kortisol mer effektivt än enbart konditionsträning.</p><h2>Vad är mindful movement?</h2><p>Det handlar om att vara fullt närvarande i rörelsen – känna musklerna arbeta, fokusera på andningen och släppa tankarna.</p>',
        featured_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
        category_id: traningCat?.id, author_id: adminUser?.id, status: 'published', featured: 0, views: 789, read_time: 4,
        published_at: new Date(Date.now() - 6*day).toISOString()
      },
      {
        title: 'Vad du bör äta före och efter träning',
        slug: 'vad-ata-fore-efter-traning-2026',
        excerpt: 'Näringen kring träningspasset är avgörande för prestation och återhämtning. Så här gör du rätt.',
        content: '<p>Timing och innehåll i målen runt träning påverkar direkt hur effektiv din session blir och hur snabbt du återhämtar dig.</p><h2>Före träning</h2><p>Ät kolhydrater 1–2 timmar innan för att fylla glykogenförråden. Undvik fett och fiber nära inpå träning.</p><h2>Efter träning</h2><p>Protein inom 30–60 minuter stimulerar muskelsyntesen. Sikta på 20–30g protein och kolhydrater för återhämtning.</p>',
        featured_image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
        category_id: traningCat?.id, author_id: adminUser?.id, status: 'published', featured: 0, views: 534, read_time: 4,
        published_at: new Date(Date.now() - 10*day).toISOString()
      },

      // ── Mat & Dryck ───────────────────────────────────────
      {
        title: 'Medelhavsköket – hälsosammare och godare',
        slug: 'medelhavskoken-halsosammare-2026',
        excerpt: 'Medelhavskosten toppar hälsolistorna år efter år. Vi visar varför – och ger dig fem enkla recept.',
        content: '<p>Medelhavskosten är inte en diet i traditionell mening utan ett sätt att äta som inspirerats av länderna runt Medelhavet.</p><h2>Olivolja som bas</h2><p>Hjärtvänliga fetter från olivolja är grundpelaren. Ersätt smör och margarin i matlagningen.</p><h2>Grönsaker i centrum</h2><p>Hälften av tallriken bör bestå av grönsaker, helst i säsong och lokalt odlade.</p>',
        featured_image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
        category_id: matCat?.id, author_id: adminUser?.id, status: 'published', featured: 1, views: 1567, read_time: 5,
        published_at: new Date(Date.now() - 3*day).toISOString()
      },
      {
        title: 'Naturviner att prova i vår',
        slug: 'naturviner-att-prova-var-2026',
        excerpt: 'Naturvin har exploderat i popularitet. Här är producenter och flaskor vi rekommenderar till vårens middagar.',
        content: '<p>Naturvin görs med minimala ingrepp i vinframställningsprocessen. Inga tillsatser, ingen filtrering – bara druvor och tid.</p><h2>Vad är naturvin?</h2><p>Det finns ingen lagstadgad definition men generellt innebär det ekologisk odling, vildförjäsning och ingen eller minimal SO₂.</p><h2>Våra favoriter</h2><p>Från Georgiens amforor till Loire-dalens mousserande viner – vi guidar dig genom årets mest spännande flaskor.</p>',
        featured_image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
        category_id: matCat?.id, author_id: adminUser?.id, status: 'published', featured: 0, views: 423, read_time: 4,
        published_at: new Date(Date.now() - 9*day).toISOString()
      },

      // ── Inredning ─────────────────────────────────────────
      {
        title: 'Biophilic design – naturen in i hemmet',
        slug: 'biophilic-design-naturen-hemmet-2026',
        excerpt: 'Att integrera naturliga material och levande växter i inredningen är årets starkaste heminredningstrend.',
        content: '<p>Biophilic design handlar om att stärka kopplingen mellan människa och natur inomhus. Forskning visar att det minskar stress och ökar välmående.</p><h2>Växter som designelement</h2><p>Stora bladsväxter som monstera och fikusar skapar omedelbar naturkänsla. Placera dem i hörn och vid fönster för bäst effekt.</p><h2>Naturliga material</h2><p>Trä, sten, lin och korg – ju mer obehandlat desto bättre för den biophiliska känslan.</p>',
        featured_image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
        category_id: inredningCat?.id, author_id: adminUser?.id, status: 'published', featured: 1, views: 987, read_time: 5,
        published_at: new Date(Date.now() - 4*day).toISOString()
      },
      {
        title: 'Konsten att inreda ett litet rum',
        slug: 'inreda-litet-rum-2026',
        excerpt: 'Begränsat utrymme är ingen begränsning för stil. Dessa knep maximerar både funktion och känsla.',
        content: '<p>Att inreda ett litet rum handlar om att tänka smart, inte om att kompromissa med stil.</p><h2>Speglar och ljus</h2><p>Strategiskt placerade speglar fördubblar det upplevda utrymmet och sprider naturligt ljus i rummet.</p><h2>Vertikal förvaring</h2><p>Utnyttja höjden – hyllor upp mot taket skapar förvaring utan att ta golvyta.</p>',
        featured_image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        category_id: inredningCat?.id, author_id: adminUser?.id, status: 'published', featured: 0, views: 756, read_time: 4,
        published_at: new Date(Date.now() - 11*day).toISOString()
      },

      // ── Resor ─────────────────────────────────────────────
      {
        title: 'Europas bästa städer för en lång helg',
        slug: 'europas-basta-stader-lang-helg-2026',
        excerpt: 'Från Lissabons kullersten till Prags barockarkitektur – vår guide till vårens mest lockande storstäder.',
        content: '<p>En lång helg i en europeisk storstad är en av de bästa semestertyperna – nära, prisvärt och fullt av upplevelser.</p><h2>Lissabon</h2><p>Portugals huvudstad kombinerar fantastisk mat, mjukt ljus och en avslappnad stämning som är svårslagen i Europa.</p><h2>Krakow</h2><p>En av Europas vackraste medeltida stadskärnor med en pulserande restaurang- och kulturscen.</p>',
        featured_image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
        category_id: resorCat?.id, author_id: adminUser?.id, status: 'published', featured: 1, views: 1834, read_time: 6,
        published_at: new Date(Date.now() - 5*day).toISOString()
      },
      {
        title: 'Slow travel – att resa utan stress',
        slug: 'slow-travel-resa-utan-stress-2026',
        excerpt: 'Tröttnat på att checka av sevärdheter? Slow travel handlar om att verkligen uppleva en plats.',
        content: '<p>Slow travel är en reaktion mot den moderna resekulturen av hetsigt sightseeing och instagramvänliga hotspots.</p><h2>Vad innebär slow travel?</h2><p>Att stanna längre på färre platser, leva som en lokal, laga mat på marknaden, ta bussen istället för turistbussen.</p><h2>Välj rätt destination</h2><p>Platser med stark lokal kultur och genuina grannskaper passar bäst för slow travel-resenären.</p>',
        featured_image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
        category_id: resorCat?.id, author_id: adminUser?.id, status: 'published', featured: 0, views: 645, read_time: 4,
        published_at: new Date(Date.now() - 13*day).toISOString()
      },

      // ── Nöje ──────────────────────────────────────────────
      {
        title: 'Vårens mest väntade filmer och serier',
        slug: 'varens-mest-vantade-filmer-serier-2026',
        excerpt: 'Från Cannes-favoriter till storbudgetseria – vi listar vad du inte får missa denna säsong.',
        content: '<p>Filmsäsongen 2026 lovar att bli en av de starkaste på år. Streaming-plattformarna satsar hårt och biograferna svarar med publikmagneter.</p><h2>Att se på bio</h2><p>Tre filmer som definitivt förtjänar en bioskärm och inte bör ses på laptop.</p><h2>Binge-värda serier</h2><p>Fem nya serier som redan skapat buzz och fått kritikerna att jubla.</p>',
        featured_image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
        category_id: nojeCat?.id, author_id: adminUser?.id, status: 'published', featured: 1, views: 2109, read_time: 5,
        published_at: new Date(Date.now() - 1*day).toISOString()
      },
      {
        title: 'Musikfestivaler att boka redan nu',
        slug: 'musikfestivaler-att-boka-2026',
        excerpt: 'Sommaren 2026 har ett fantastiskt festivalprogram. Vi guidar dig genom biljettköp och inköpsguide.',
        content: '<p>Festivalplanering börjar tidigt – många säljer ut sina biljetter månader i förväg. Här är vad du bör veta för att inte missa ditt drömfestival.</p><h2>Skandinaviens starkaste festivaler</h2><p>Way Out West, Roskilde och Ruisrock erbjuder alla world-class upplevelser i en nordisk sommarmiljö.</p>',
        featured_image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
        category_id: nojeCat?.id, author_id: adminUser?.id, status: 'published', featured: 0, views: 1203, read_time: 3,
        published_at: new Date(Date.now() - 7*day).toISOString()
      },
    ];

    const astmt = db.prepare(`INSERT OR IGNORE INTO articles (id, title, slug, excerpt, content, featured_image, category_id, author_id, status, featured, views, read_time, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    articles.forEach(a => astmt.run(uuidv4(), a.title, a.slug, a.excerpt, a.content, a.featured_image, a.category_id, a.author_id, a.status, a.featured, a.views, a.read_time, a.published_at));
    console.log('✅ Articles seeded');
  }

  console.log('✅ Database ready');
  return db;
}
