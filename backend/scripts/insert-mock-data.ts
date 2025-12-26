import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fixed UUIDs for consistency
const AUTHOR_IDS = {
  solHn: '00000000-0000-0000-0000-000000000001',
  luca: '00000000-0000-0000-0000-000000000002',
  eyuZe: '00000000-0000-0000-0000-000000000003',
};

const NEWS_IDS = {
  welcome: '10000000-0000-0000-0000-000000000001',
  anniversary: '10000000-0000-0000-0000-000000000002',
  recognition: '10000000-0000-0000-0000-000000000003',
  meeting: '10000000-0000-0000-0000-000000000004',
};

const ARTICLE_IDS = {
  nuke: '20000000-0000-0000-0000-000000000001',
  gates: '20000000-0000-0000-0000-000000000002',
  basket: '20000000-0000-0000-0000-000000000003',
};

const EVENT_IDS = {
  meeting: '30000000-0000-0000-0000-000000000001',
  anniversary: '30000000-0000-0000-0000-000000000002',
  fundraising: '30000000-0000-0000-0000-000000000003',
  choir: '30000000-0000-0000-0000-000000000004',
};

const FEAST_IDS = {
  genna: '40000000-0000-0000-0000-000000000001',
  timket: '40000000-0000-0000-0000-000000000002',
  fasika: '40000000-0000-0000-0000-000000000003',
};

async function insertAuthors() {
  console.log('Inserting authors...');
  const passwordHash = '$2a$10$rKN3HPJkHbtDYpXG8JILi.N.ELv0QKpS.C1v8XsBFcLdUTVjqlOXK'; // password123

  const authors = [
    {
      id: AUTHOR_IDS.solHn,
      name: 'Sol Hn',
      email: 'sol.hn@hamerenoh.org',
      password_hash: passwordHash,
      role: 'publisher',
      status: 'active',
      profile: { bio: 'Spiritual writer and teacher', avatarUrl: 'https://via.placeholder.com/150' },
    },
    {
      id: AUTHOR_IDS.luca,
      name: 'Luca',
      email: 'luca@hamerenoh.org',
      password_hash: passwordHash,
      role: 'publisher',
      status: 'active',
      profile: { bio: 'Orthodox Christian author', avatarUrl: 'https://via.placeholder.com/150' },
    },
    {
      id: AUTHOR_IDS.eyuZe,
      name: 'Eyu Ze Ethiopia',
      email: 'eyu.ze@hamerenoh.org',
      password_hash: passwordHash,
      role: 'publisher',
      status: 'active',
      profile: { bio: 'Ethiopian Orthodox spiritual guide', avatarUrl: 'https://via.placeholder.com/150' },
    },
  ];

  for (const author of authors) {
    const { data: existing } = await supabase.from('users').select('id').eq('email', author.email).single();
    
    if (existing) {
      const { error } = await supabase
        .from('users')
        .update({ name: author.name, profile: author.profile, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) console.error(`Error updating author ${author.name}:`, error.message);
      else console.log(`✓ Updated author: ${author.name}`);
    } else {
      const { error } = await supabase.from('users').insert(author);
      if (error) console.error(`Error inserting author ${author.name}:`, error.message);
      else console.log(`✓ Created author: ${author.name}`);
    }
  }
}

async function insertNews() {
  console.log('\nInserting news articles...');
  
  const newsItems = [
    {
      id: NEWS_IDS.welcome,
      title: 'ወደ ማኅበራችን መረጃ ቻናል እንኳን በደህና መጡ!',
      summary: 'ይህ ቻናል የማኅበራችን ተግባራትን፣ የተካሄዱ ስራዎችንና የተደረጉ ስኬቶችን በዜና መልክ ለአባላት ለማቅረብ የተከፈተ ነው።',
      body: 'ወደ ማኅበራችን መረጃ ቻናል እንኳን በደህና መጡ!\nይህ ቻናል የማኅበራችን ተግባራትን፣ የተካሄዱ ስራዎችንና የተደረጉ ስኬቶችን በዜና መልክ ለአባላት ለማቅረብ የተከፈተ ነው።\nከዚህ  ጀምሮ የማኅበራችን ልዩ ልዩ መረጃዎችንና ማስታወቂያዎችን በፍጥነትና በታማኝነት በዚህ ቻናል ላይ ታገኛላችሁ።\nከእናንተ ጋር በመሆን የማኅበራችን ጉዞ በተስፋ እና በስኬት ይቀጥላል።',
      tags: ['announcement', 'welcome'],
      author_id: AUTHOR_IDS.solHn,
      status: 'published',
      published_at: '2025-11-18T16:20:00Z',
      created_at: '2025-11-18T16:15:00Z',
      updated_at: '2025-11-18T16:15:00Z',
    },
    {
      id: NEWS_IDS.anniversary,
      title: 'የአንደኛ ዓመት የምስረታ በዓላችን',
      summary: 'ሐመረ ኖኅ ሀ ብላ እንደ ማኅበር ከተቋቋመችበት ከጥቅምት 1/ 2017 ዓ.ም ጀምሮ እስካሁን ማለትም ጥቅምት 1 / 2018 ዓ.ም ድረስ ያሳካችውን ፣ ያጋጠማትን  እንዲሁም ወደፊት አሳካዋለው ያለችውን እቅዷን እና አጠቃላይ የስራ ክንውን  ሪፖርት ለአባላቷ ለመግለጽ በተዘጋጀው የአንደኛ ዓመቷ ምስረታ በዓል ላይ የተከናወኑትን መርሐ ግብራት እና አጠቃላይ  በዓሉ ላይ  የነበሩትን ሁነቶች የሚከተሉት ነበሩ።',
      body: 'ሐመረ ኖኅ ሀ ብላ እንደ ማኅበር ከተቋቋመችበት ከጥቅምት 1/ 2017 ዓ.ም ጀምሮ እስካሁን ማለትም ጥቅምት 1 / 2018 ዓ.ም ድረስ ያሳካችውን ፣ ያጋጠማትን  እንዲሁም ወደፊት አሳካዋለው ያለችውን እቅዷን እና አጠቃላይ የስራ ክንውን  ሪፖርት ለአባላቷ ለመግለጽ በተዘጋጀው የአንደኛ ዓመቷ ምስረታ በዓል ላይ የተከናወኑትን መርሐ ግብራት እና አጠቃላይ  በዓሉ ላይ  የነበሩትን ሁነቶች የሚከተሉት ነበሩ።\n\nየአንደኛ ዓመት የምስረታ በዓላችን ያከበርነው በዕለተ እሑድ ጥቅምት 2/ 2018 ዓ.ም በላፍቶ በደብረ ትጉሃን ቅዱስ ሚካኤል ቤተክርስቲያን በሚገኘው የሰንበቴ ማኅበር አዳራሽ ውስጥ ነበር ።\n\nበዕለቱም ከ120 በላይ  የሚሆኑ ሰዎች የተገኙ ሲሆን ከነዚህም መካከል የደብራት  አስተዳዳሪዎች ፣መነኮሳት ፣ሊቃውንት ፣ ካህናት ፣ዲያቆናት ፣ የሰንበት ተማሪዎች  በእድሜ የገፉ አባቶች እና እናቶች ፣ ወጣቶች  እንዲሁም ሕጻናትም ጭምር   ተገኝተዋል።\n\nመርሐግብራችን በ7 ፡35 በመላከ ትጉሃን አባ ገብረ ሕይወት መሪነት በተደረገው ጸሎተ ወንጌል የተጀመረ ሲሆን ፣ በመቀጠልም  የመክፈቻ ንግግር በአቶ ዮናስ ሀጎስ  ቀርቧል።',
      tags: ['anniversary', 'celebration', 'report'],
      author_id: AUTHOR_IDS.solHn,
      status: 'published',
      published_at: '2025-11-18T16:21:00Z',
      created_at: '2025-11-18T16:21:00Z',
      updated_at: '2025-11-18T16:21:00Z',
    },
    {
      id: NEWS_IDS.recognition,
      title: 'ለማኅበራችን የምስጋና የምስክር ወረቀት ተበረከተላት',
      summary: 'በዕለተ ማክሰኞ ኅዳር 9/2018 ዓ.ም ከረፋዱ 4 ፡00 ላይ በኢትዮጲያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን በሰሜን ሸዋ ሀገረ ስብከት በመንዝ ማማ ምድር ወረዳ የእመጓ ደብረ ምህረት መድኃኔዓለም ቤተክርስቲያን ሕንፃ አሰሪ ኮሚቴ የሆኑት አቶ ፍቅሬ ተሾመ በሐመረ ኖኅ ቢሮ ተገኝተው ሕንፃ ቤተክርስቲያኑን ለማሰራት ባዘጋጁት የገቢ ማሰባሰቢያ  መርሐግብር  ላይ ማኅበራችን ላደረገችላቸው ሙያዊ እና ቁሳዊ ድጋፍ የምስጋና ምስክር ወረቀት አበርክተውላታል ።',
      body: 'ለማኅበራችን የምስጋና የምስክር ወረቀት ተበረከተላት ፣\nበዕለተ ማክሰኞ ኅዳር 9/2018 ዓ.ም ከረፋዱ 4 ፡00 ላይ በኢትዮጲያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን በሰሜን ሸዋ ሀገረ ስብከት በመንዝ ማማ ምድር ወረዳ የእመጓ ደብረ ምህረት መድኃኔዓለም ቤተክርስቲያን ሕንፃ አሰሪ ኮሚቴ የሆኑት አቶ ፍቅሬ ተሾመ በሐመረ ኖኅ ቢሮ ተገኝተው ሕንፃ ቤተክርስቲያኑን ለማሰራት ባዘጋጁት የገቢ ማሰባሰቢያ  መርሐግብር  ላይ ማኅበራችን ላደረገችላቸው ሙያዊ እና ቁሳዊ ድጋፍ የምስጋና ምስክር ወረቀት አበርክተውላታል ።',
      tags: ['recognition', 'support', 'church'],
      author_id: AUTHOR_IDS.solHn,
      status: 'published',
      published_at: '2025-11-20T14:55:00Z',
      created_at: '2025-11-20T14:55:00Z',
      updated_at: '2025-11-20T14:55:00Z',
    },
    {
      id: NEWS_IDS.meeting,
      title: 'የኑ ከዚህ ዓለም እንውጣ የኅዳር ወር ጉባኤ',
      summary: 'የኑ ከዚህ ዓለም እንውጣ የኅዳር ወር ጉባኤ የተካሄደው በኅዳር 7 / 2018 ዓ.ም ሲሆን  እንደ ጉባኤ ለ10ኛ ጊዜ በሐመረ ኖኅ አዳራሽ ራሱን  ችሎ ሲደረግ ደግሞ የመጀመሪያው ነበር ።',
      body: 'የኑ ከዚህ ዓለም እንውጣ የኅዳር ወር ጉባኤ የተካሄደው በኅዳር 7 / 2018 ዓ.ም ሲሆን  እንደ ጉባኤ ለ10ኛ ጊዜ በሐመረ ኖኅ አዳራሽ ራሱን  ችሎ ሲደረግ ደግሞ የመጀመሪያው ነበር ። በዕለቱም ወደ 25 የሚጠጉ አባላት ተገኝተዋል ።\n\nየነበሩትም መርሐግብራት ጸሎተ ወንጌል ፣ ዝማሬ ፣ ትምህርተ ወንጌል እንዲሁም ለማኅበረ እስጢፋኖስ በአደራነት የተሰጠው የቤት ለቤት የአብነት ትምህርት (ፈለገ ሕይወት ) ገለፃ (presentation) ሲሆኑ ፤ ጉባኤያችን 9፡30 ላይ በጸሎተ ወንጌል ተጀምሮ በመቀጠልም የመክፈቻ መዝሙር ከተዘመረ በኋላ  "አደራህን ጠብቅ" በሚል ርዕስ መጋቢ ብሉይ ጽጌ ትምህርተ ወንጌልን ለ 1 ሰዓት ያክል አስተምረዋል ።\n\nከትምህርቱ በመቀጠልም የጋራ ዝማሬን እንዲሁም የፈለገ ሕይወት ገለፃ በዲ/ን ተክለ ማርያም ተደርጎ 11 ፡ 50 ላይ   መርሐግብ በጸሎት ተፈጽሟል። በመጨረሻም ለመጀመሪያ ጊዜ የመጡ እንግዶቻችንን  የቢሮ ጉብኝት እንዲሁም ገልጻ ተደርጎላቸዋል ።',
      tags: ['meeting', 'gathering', 'spiritual'],
      author_id: AUTHOR_IDS.solHn,
      status: 'published',
      published_at: '2025-11-18T17:10:00Z',
      created_at: '2025-11-18T17:10:00Z',
      updated_at: '2025-11-18T17:10:00Z',
    },
  ];

  for (const news of newsItems) {
    const { data: existing } = await supabase.from('news').select('id').eq('id', news.id).single();
    
    if (existing) {
      const { error } = await supabase.from('news').update(news).eq('id', news.id);
      if (error) console.error(`Error updating news ${news.title}:`, error.message);
      else console.log(`✓ Updated news: ${news.title.substring(0, 30)}...`);
    } else {
      const { error } = await supabase.from('news').insert(news);
      if (error) console.error(`Error inserting news ${news.title}:`, error.message);
      else console.log(`✓ Created news: ${news.title.substring(0, 30)}...`);
    }
  }
}

async function insertArticles() {
  console.log('\nInserting articles...');
  
  // Random placeholder images from Unsplash
  const placeholderImages = [
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
  ];
  
  // Helper to get random images (1-4 images per article)
  const getRandomImages = () => {
    const count = Math.floor(Math.random() * 4) + 1; // 1-4 images
    const shuffled = [...placeholderImages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  const articles = [
    {
      id: ARTICLE_IDS.nuke,
      title: 'ኑ ከዚህ አለም እንውጣ',
      slug: 'nuke-kezih-alem-enwet',
      content: 'ኑ ከዚህ አለም እንውጣ\n\n"እኛ ሀገራችን በሰማይ ነውና ከዚያም ደግሞ የሚመጣ መድኃኒትን እርሱንም ጌታ ኢየሱስ ክርስቶስን እንጠባበቃለን ።"\nፊሊጲ.  3፥20\n\n✝️ከአለም መውጣት የሚባለው ሃሳብ ብዙዉን ጊዜ ለመረዳት የሚከብድ እና ትርጓሜውም ግራ  የሚያጋባ ሊመስል ይችላል።         ዳሩ ግን ይህ ዓለም ጊዜአዊ መቋቋሚያ እንጂ የመጨረሻ ቤታችን አይደለም ። ጌታችን በወንጌል እንዲህ ብሎናልና " እኔ ከዓለም እንዳይደለሁ ከዓለም አይደሉም ………" ይለናል ልብ ብለን ልንረዳው የሚገባው በዓለም ስንኖር ከዓለም መጥፎ ሃሳቦች በሙሉ ልንወጣ እንደሚገባ ነው ፤ የዓለም ሃሳቧ ምንድነው ? ቢሉ በገንዘብ ፣ በሥልጣን ፣ በዝሙትና በጊዜያዊ ምኞቶች ላይ ያተኮረ ሆኖ እናገኘዋለን እኛ በክርስቶስ ክርስቲያን የተባልን ግን እንደ ሐዋርያው መልዕክት " በእግዚአብሔር ፈቃድ እርሱን በጎና ደስ የሚያሰኝ ፍጹም የሆነው ነገር ምን እንደሆነ ፈትናችሁ ታውቁ ዘንድ በልባችሁ መታደስ ተለወጡ እንጂ ይህንን ዓለም አትምሰሉ " ብሎናል ሮሜ 12፥2 ስለዚህም ህይወታችን በሙሉ በክርስቶስ ባህሪይና በእግዚአብሔር ፈቃድ ላይ የተመሰረተ መሆን ዓለበት ስለዚህም ከዓለም አስተሳሰብ መለየት በቅድስና ለመኖር የምናደርገው ትልቅ ውሳኔ ነው ። ሐዋርያው ቅዱስ ጳውሎስ " ከመካከላቸው ውጡና ተለዩአቸው ሲል ርኩሱንም አትንኩ ። 2ኛ ቆሮ. 6፥17-18 ይለናል በዚህ መሰረት ከጨለማ ምግባር እና እግዚአበሔርን ከሚቃወም ማንኛውም ነገር መለየት ፣ መተውና መውጣት ያስፈልጋል ።\n\nስለዚህም ዕለት ተዕለት ከዚህ ዓለም ሃሳብ እና ክፋት ልንወጣ ያስፈልጋል ። ይህንን የምናደርገውም በመንፈሳዊ ሕይወት ክርስቶስን ወደ መምሰል ለማደግ ነው ።',
      excerpt: 'ከአለም መውጣት የሚባለው ሃሳብ ብዙዉን ጊዜ ለመረዳት የሚከብድ እና ትርጓሜውም ግራ  የሚያጋባ ሊመስል ይችላል።',
      author_id: AUTHOR_IDS.solHn,
      images: getRandomImages(),
      published_at: '2025-11-27T14:47:00Z',
      related_event_ids: [EVENT_IDS.meeting],
      related_feast_ids: [],
      created_at: '2025-11-27T14:47:00Z',
      updated_at: '2025-11-27T14:47:00Z',
    },
    {
      id: ARTICLE_IDS.gates,
      title: 'የገሐነም ደጆች አይችሏትም',
      slug: 'yegehenem-degot-ayichilot',
      content: 'የእግዚአብሔርን ታምር ተመልከቱ ቦታው ሶርያ ነው የቤተክርስትያኑ ስም Saydania ይባላል::\n\nእንደተለመደው የዘወትር  ፀሎቷ ለህዝቧም ለዓለምም እያደረሰች  ባለችበት ሰዓት  አንድ ሰው ወደ \nመነኩሴዋ እማሁይ Marina  Almaloof ቀርቦ  \n"ሥዕለት ለመስጠት ነበር፤  እባከዎ ይሄን ብር  ሳጥን ውስጥ ያስገቡልኝ፤  በእጅ የያዘውን 160ሳ.ሜ\nየሆነውን ሻማ  ይሄን ደግሞ በስዕለ ማርያም ፊት  ያብሩልኝ፤  እኔ በጣም ሰለምቸኩል ነው" ይልና  \nበፍጥነት  ይወጣል::  መነኩሴዋም ክብሪት አነሱ አቤቱ የሰራዊት  ጌታ ስዕለቱን ተቀበለው አሉ፡፡\nክብሪቱን ጫሩ  ሻማው ጫፍ አቀረቡት ሻማው ሳይቃጠል  ክብሪቱ ተቃጥሎ አለቀ በድጋሜ ሞከሩ፤\nሞከሩ፡፡  ሻማው ባለመቃጠሉ እየተገረሙ  ከወደ ውጪ ጩኸት ተሰማ፡፡  መነኩሴዋም ወጡ ከታች\nመጨረሻ ደረጃው  ላይ አንድ ሰው ወድቆ የሞተ ሰው ያያሉ፡፡ "ይሄ  አሁን ስለት የሰጠኝ ሰውየ  ነው"\nአሉ፡፡  ስልክ ለሶርያ ፖሊስ ተደወለ፤  በፍጥነት  መጡ ነገሩ ተጣራ፡፡  እስኪ ሻማው?  አለ ፖሊስ፡፡  \nሻማው ተመረመረ  በውስጡ ዳይናሜት TNT የተባለ  አደገኛ  ተቀጣጣይ ፈንጆች የተሞላ ሆኖ ተገኘ\nሰውየውን የሚያውቅ ሠው አልተገኝም፡፡  ሰውየው በልብ ድካም ነው  የሞተው ተባለ፡፡  ወላዲተ አምላክ\nእመቤታችን ቅድስት ድንግል ማርያም  ህዝቧንም ቤተክርስትያኑንም ታደገች፡፡\nእንዲህ ናት የኛ እመቤት ንጽህተ ንጹሐን ቅድስተ ቅዱሣን ንዕድ ክብርት ብጽዕት ድንግል ማርያም!\nጸሎቷና በረከቷ ሁሌም ይጠብቀናል፡፡',
      excerpt: 'የእግዚአብሔርን ታምር ተመልከቱ ቦታው ሶርያ ነው',
      author_id: AUTHOR_IDS.luca,
      images: getRandomImages(),
      published_at: '2025-11-30T14:52:00Z',
      related_event_ids: [],
      related_feast_ids: [],
      created_at: '2025-11-30T14:52:00Z',
      updated_at: '2025-11-30T14:52:00Z',
    },
    {
      id: ARTICLE_IDS.basket,
      title: 'ባለ ቅርጫቱ መነኩሴ',
      slug: 'bale-qirchatu-menekuse',
      content: '"እንዳይፈረድባችሁ አትፈረዱ፤ በምትፈርዱበት ፍርድ ይፈረድባችኋልና፥ በምትሰፍሩበትም መስፈሪያ ይሰፈርባችኋል።" (ማቴ. 7:1-2)\n\nበአንድ  ገዳም ውስጥ አባ ቴዎድሮስ የሚባሉ ታላቅ አባት ነበሩ። አባ ቴዎድሮስ በገዳሙ ውስጥ ካሉት መነኮሳት ሁሉ በምንኩስና ሕይወታቸው የተመረከረላቸውና በእድሜያቸውም ከሁሉም የገዳሙ አባቶች የገፉ ነበሩ፤ ብዙዎቹም የገዳሙ አባቶች ከልብ ይታዘዟቸውና ያከብሯቸው ነበር። ነገር ግን እርሳቸው የሚያሳዩት ትሕትና ከእድሜያቸው የበለጠ ነበር።\n\nአንድ ወጣት መነኩሴ በስሕተት ተከሶ ነበርና የገዳሙ አባቶችና ሽማግሌዎች ሊመክሩትና ሊያስተምሩት በገዳሙ ሥርዓት መሠረት የገዳሙ መነኮሳት ጉባኤ አደረጉ።  አባ ቴዎድሮስም በጉባኤው እንዲሳተፉ ተጠርተው ነበር። ጉባኤው ከተጀመረ በኋላ፣ ሁሉም አባቶች ስለ ወጣቱ መነኩሴ ስሕተት ሲናገሩና ሲመክሩ ቆዩ።\n\nበመጨረሻም አባ ቴዎድሮስ የተከሰሰውን ወጣት መነኩሴ እንዲመክሩት  ተጠየቁ። አባ ቴዎድሮስ ግን ምንም ቃል ሳይናገሩ ከመቀመጫቸው ተነሱና ፣ በአሸዋ የተሞላ ቅርጫት  ይዘው ወደ ጉባኤው መሀል ገቡና ቅርጫቱን በትከሻቸው ላይ ተሸክመው በመነኮሳቱ መካከል መመላለስ ጀመሩ። የገዳሙ መነኮሳት እና አበምኔቱ ይህን ሲያዩ በጣም ተገረሙ።  የገዳሙ አበምኔትም በአድናቆትና በጥያቄ ተሞልተው፣  \n"አባ ቴዎድሮስ! አባታችን!  ለምን እንዲህ አደረጉ?" ብለው ጠየቋቸው። አባ ቴዎድሮስም በትሕትና ራሳቸውን ዝቅ አድርገው በለስላሳ ድምፅ እንዲህ ሲሉ መለሱ፦ "ክቡራን አባቶቼ፣ በዚህ ቅርጫት ውስጥ የተሞላው አሸዋ የእኔን የኃጢአት ብዛት የሚያሳይ ነው። እኔ ከዚህ የአሸዋ ቁጥር በላይ የበዛ የራሴን ኃጢአት ማየት አልቻልኩም። የማየው ግን የዚህን ወጣት መነኩሴ ጥቃቅን ስሕተት ብቻ ነው። የራሴን ኃጢአት የማላይና በራሴ የማልፈርድ ሰው ሆኜ፣ በሌላው ሰው ኃጢአት ለመፍረድና ለመኮነን እንዴት ልቀመጥ እችላለሁ?" አሉና  ቅርጫቱን አውርደው በጸጥታ ወደ ወንበራቸው ተመለሱ።\n\nየጉባኤው የተሰበሰቡ  አባቶች ሁሉ በአባ ቴዎድሮስ በጥልቅ ትሕትናና በእውነት ላይ በተመሠረተ ምክር ተገረሙ። ወዲያውኑም ንስሐ ገብተው ወጣቱን መነኩሴ በይቅርታና በፍቅር መክረው አሰናበቱት። ከዚያን ቀን ጀምሮም፣ አባ ቴዎድሮስ ያሳዩት ትሕትና በገዳሙ ሁሉ ዘንድ እንደ ታላቅ መንፈሳዊ ትምህርት ሲነገር ኖረ።\n\nእውነተኛ መንፈሳዊ እድገት በሌሎች ፊት በመኩራራት ወይም ራስን በማጉላት ሳይሆን፣ ራስን ዝቅ በማድረግና ሁልጊዜ ኃጢአተኛ መሆናችንን መቀበልና ሌላው ላይ ከመፍረዳችን በፊት የራሳችንን ስሕተቶችና ድክገቶች መፈተሽ አለብን። ሁልጊዜ ሞልተው የሚፈሱትን የራሳችንን ኃጢአቶች ሳናይ የሌላውን ትንሽ ስሕተት ብቻ እንመልከት።',
      excerpt: '"እንዳይፈረድባችሁ አትፈረዱ፤ በምትፈርዱበት ፍርድ ይፈረድባችኋልና፥ በምትሰፍሩበትም መስፈሪያ ይሰፈርባችኋል።"',
      author_id: AUTHOR_IDS.eyuZe,
      images: getRandomImages(),
      published_at: '2025-11-24T14:55:00Z',
      related_event_ids: [],
      related_feast_ids: [],
      created_at: '2025-11-24T14:55:00Z',
      updated_at: '2025-11-24T14:55:00Z',
    },
  ];

  for (const article of articles) {
    const { data: existing } = await supabase.from('articles').select('id').eq('id', article.id).single();
    
    if (existing) {
      const { error } = await supabase.from('articles').update(article).eq('id', article.id);
      if (error) console.error(`Error updating article ${article.title}:`, error.message);
      else console.log(`✓ Updated article: ${article.title.substring(0, 30)}...`);
    } else {
      const { error } = await supabase.from('articles').insert(article);
      if (error) console.error(`Error inserting article ${article.title}:`, error.message);
      else console.log(`✓ Created article: ${article.title.substring(0, 30)}...`);
    }
  }
}

async function insertEvents() {
  console.log('\nInserting events...');
  
  const events = [
    {
      id: EVENT_IDS.meeting,
      name: 'የኑ ከዚህ ዓለም እንውጣ የኅዳር ወር ጉባኤ',
      start_date: '2025-12-15T09:30:00Z',
      end_date: '2025-12-15T12:00:00Z',
      location: 'ሐመረ ኖኅ አዳራሽ, አዲስ አበባ',
      description: 'የኅዳር ወር መደበኛ ጉባኤ - ጸሎተ ወንጌል፣ ዝማሬ፣ ትምህርተ ወንጌል',
      featured: true,
      created_at: '2025-12-02T12:57:00Z',
      updated_at: '2025-12-02T12:57:00Z',
    },
    {
      id: EVENT_IDS.anniversary,
      name: 'የአንደኛ ዓመት የምስረታ በዓል',
      start_date: '2025-12-20T07:35:00Z',
      end_date: '2025-12-20T11:00:00Z',
      location: 'ደብረ ትጉሃን ቅዱስ ሚካኤል ቤተክርስቲያን, ላፍቶ',
      description: 'ሐመረ ኖኅ ማኅበር የአንደኛ ዓመት ምስረታ በዓል - ጸሎተ ወንጌል፣ ዝማሬ፣ ትምህርተ ወንጌል፣ የስራ ሪፖርት',
      featured: true,
      created_at: '2025-12-02T12:57:00Z',
      updated_at: '2025-12-02T12:57:00Z',
    },
    {
      id: EVENT_IDS.fundraising,
      name: 'የገቢ ማሰባሰቢያ መርሐግብር',
      start_date: '2025-12-10T16:00:00Z',
      end_date: '2025-12-10T18:00:00Z',
      location: 'ደብረ ምህረት መድኃኔዓለም ቤተክርስቲያን, መንዝ',
      description: 'የቤተክርስቲያን ሕንፃ ለማሰራት የገቢ ማሰባሰቢያ መርሐግብር',
      featured: false,
      created_at: '2025-12-02T12:59:00Z',
      updated_at: '2025-12-02T12:59:00Z',
    },
    {
      id: EVENT_IDS.choir,
      name: 'የሰንበት ትምህርት ቤት ዝማሬ',
      start_date: '2025-12-22T10:00:00Z',
      end_date: '2025-12-22T12:00:00Z',
      location: 'ኰኵሐ ሃይማኖት ሰንበት ትምህርት ቤት',
      description: 'የሰንበት ትምህርት ቤት ተማሪዎች መዝሙር ማቅረብ',
      featured: false,
      created_at: '2025-12-02T13:05:00Z',
      updated_at: '2025-12-02T13:05:00Z',
    },
  ];

  for (const event of events) {
    const { data: existing } = await supabase.from('events').select('id').eq('id', event.id).single();
    
    if (existing) {
      const { error } = await supabase.from('events').update(event).eq('id', event.id);
      if (error) console.error(`Error updating event ${event.name}:`, error.message);
      else console.log(`✓ Updated event: ${event.name.substring(0, 30)}...`);
    } else {
      const { error } = await supabase.from('events').insert(event);
      if (error) console.error(`Error inserting event ${event.name}:`, error.message);
      else console.log(`✓ Created event: ${event.name.substring(0, 30)}...`);
    }
  }
}

async function insertFeasts() {
  console.log('\nInserting feasts...');
  
  const feasts = [
    {
      id: FEAST_IDS.genna,
      name: 'ገና (የክርስቶስ ልደት)',
      date: '2025-01-07T00:00:00Z',
      region: 'Ethiopian Orthodox',
      description: 'የኢየሱስ ክርስቶስ ልደት በዓል',
      icon: 'feast-genna.png',
      article_ids: [ARTICLE_IDS.nuke],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: FEAST_IDS.timket,
      name: 'ጥምቀት (የክርስቶስ ጥምቀት)',
      date: '2025-01-19T00:00:00Z',
      region: 'Ethiopian Orthodox',
      description: 'የኢየሱስ ክርስቶስ ጥምቀት በዓል',
      icon: 'feast-timket.png',
      article_ids: [],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: FEAST_IDS.fasika,
      name: 'ፋሲካ (የትንሣኤ)',
      date: '2025-04-20T00:00:00Z',
      region: 'Ethiopian Orthodox',
      description: 'የኢየሱስ ክርስቶስ ትንሣኤ በዓል',
      icon: 'feast-fasika.png',
      article_ids: [],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ];

  for (const feast of feasts) {
    const { data: existing } = await supabase.from('feasts').select('id').eq('id', feast.id).single();
    
    if (existing) {
      const { error } = await supabase.from('feasts').update(feast).eq('id', feast.id);
      if (error) console.error(`Error updating feast ${feast.name}:`, error.message);
      else console.log(`✓ Updated feast: ${feast.name.substring(0, 30)}...`);
    } else {
      const { error } = await supabase.from('feasts').insert(feast);
      if (error) console.error(`Error inserting feast ${feast.name}:`, error.message);
      else console.log(`✓ Created feast: ${feast.name.substring(0, 30)}...`);
    }
  }
}

async function insertReadings() {
  console.log('\nInserting daily readings...');
  
  const readings = [
    {
      date: '2025-12-24',
      gospel: {
        title: 'የኢየሱስ ክርስቶስ ልደት',
        reference: 'ማቴዎስ 1:18-25',
        body: 'የኢየሱስ ክርስቶስ ልደት በዚህ መልኩ ሆነ። እናቱ ማርያም ለዮሴፍ ተገባሽ ነበር፥ ነገር ግን አስቀድሞ አንድ ላይ ከመሆናቸው በፊት በመንፈስ ቅዱስ እርግዝና አገኘች።',
        audioUrl: 'gospel-2025-12-24.mp3',
      },
      epistle: {
        title: 'ጴጥሮስ',
        reference: 'ጴጥሮስ 1:1-2',
        body: 'ጴጥሮስ አልጋው ለተበተኑት ለመጻሕፍት ለሚኖሩት ለአሕዛብ ለአሕዛብ ለአሕዛብ ለአሕዛብ',
      },
      psalms: ['ጌታ እረዳቴ ነው፥ ምንም አልጠጋም።'],
      reflections: ['ዛሬ የኢየሱስ ክርስቶስን ልደት እናስታውሳለን። ይህ ታላቅ በዓል ለእኛ ሁሉ የመድኃኒት ተስፋ ነው።'],
      language: 'amharic',
    },
    {
      date: '2025-12-25',
      gospel: {
        title: 'የክርስቶስ ልደት',
        reference: 'ሉቃስ 2:1-20',
        body: 'በዚያን ጊዜ የሴሳር አውግስጦስ ከሮም የመንግሥት ትዕዛዝ ወጣ፥ ሁሉም ወገን ይመዘግብ ዘንድ ነበር።',
        audioUrl: 'gospel-2025-12-25.mp3',
      },
      epistle: null,
      psalms: null,
      reflections: ['የክርስቶስ ልደት በዓል ለእኛ ሁሉ የመድኃኒት ተስፋ ነው።'],
      language: 'amharic',
    },
  ];

  for (const reading of readings) {
    const { data: existing } = await supabase.from('daily_readings').select('id').eq('date', reading.date).single();
    
    const readingData: any = {
      date: reading.date,
      gospel: reading.gospel,
      language: reading.language,
    };
    
    if (reading.epistle) readingData.epistle = reading.epistle;
    if (reading.psalms) readingData.psalms = reading.psalms;
    if (reading.reflections) readingData.reflections = reading.reflections;
    
    if (existing) {
      const { error } = await supabase.from('daily_readings').update(readingData).eq('date', reading.date);
      if (error) console.error(`Error updating reading for ${reading.date}:`, error.message);
      else console.log(`✓ Updated reading: ${reading.date}`);
    } else {
      const { error } = await supabase.from('daily_readings').insert(readingData);
      if (error) console.error(`Error inserting reading for ${reading.date}:`, error.message);
      else console.log(`✓ Created reading: ${reading.date}`);
    }
  }
}

async function insertProgressReports() {
  console.log('\nInserting progress reports...');
  
  const reports = [
    {
      id: '60000000-0000-0000-0000-000000000001',
      title: 'የቤተክርስቲያን ሕንፃ የግንባታ ስራ',
      summary: 'ደብረ ምህረት መድኃኔዓለም ቤተክርስቲያን ሕንፃ የግንባታ ስራ ሪፖርት',
      pdf_url: 'progress-report-1.pdf',
      before_image: 'progress-1-before-1.jpg',
      after_image: 'progress-1-after-1.jpg',
      media_gallery: ['progress-1-1.jpg', 'progress-1-2.jpg', 'progress-1-after-2.jpg'],
      timeline: [
        { date: '2025-09-01', title: 'የግንባታ ስራ መጀመር', description: 'የመሠረት ስራ ተጀምሯል' },
        { date: '2025-10-01', title: 'የግድግዳ ስራ', description: 'የግድግዳ ስራ ተጠናቋል' },
        { date: '2025-10-15', title: 'የጣሪያ ስራ', description: 'የጣሪያ ስራ በመሻሻል ላይ' },
      ],
      likes: 24,
      comments_count: 8,
      created_at: '2025-10-15T20:59:00Z',
      updated_at: '2025-10-15T20:59:00Z',
    },
    {
      id: '60000000-0000-0000-0000-000000000002',
      title: 'የሰንበት ትምህርት ቤት ዝማሬ',
      summary: 'የሰንበት ትምህርት ቤት ተማሪዎች ዝማሬ ማቅረብ',
      pdf_url: null,
      before_image: null,
      after_image: null,
      media_gallery: ['progress-2-1.jpg'],
      timeline: [
        { date: '2025-09-01', title: 'የዝማሬ ማሰልጠኛ', description: 'ተማሪዎች ዝማሬ ማሰልጠን ጀምረዋል' },
        { date: '2025-09-12', title: 'የዝማሬ ማቅረብ', description: 'በበዓል ላይ ዝማሬ ተቀርቧል' },
      ],
      likes: 18,
      comments_count: 5,
      created_at: '2025-09-12T19:21:00Z',
      updated_at: '2025-09-12T19:21:00Z',
    },
  ];

  for (const report of reports) {
    const { data: existing } = await supabase.from('progress_reports').select('id').eq('id', report.id).single();
    
    if (existing) {
      const { error } = await supabase.from('progress_reports').update(report).eq('id', report.id);
      if (error) console.error(`Error updating progress report ${report.title}:`, error.message);
      else console.log(`✓ Updated progress report: ${report.title.substring(0, 30)}...`);
    } else {
      const { error } = await supabase.from('progress_reports').insert(report);
      if (error) console.error(`Error inserting progress report ${report.title}:`, error.message);
      else console.log(`✓ Created progress report: ${report.title.substring(0, 30)}...`);
    }
  }
}

async function main() {
  try {
    console.log('Starting mock data insertion...\n');
    
    await insertAuthors();
    await insertNews();
    await insertArticles();
    await insertEvents();
    await insertFeasts();
    await insertReadings();
    await insertProgressReports();
    
    console.log('\n✓ Mock data insertion completed!');
    
    // Print summary
    const { data: users } = await supabase.from('users').select('id', { count: 'exact' }).eq('role', 'publisher');
    const { data: news } = await supabase.from('news').select('id', { count: 'exact' });
    const { data: articles } = await supabase.from('articles').select('id', { count: 'exact' });
    const { data: events } = await supabase.from('events').select('id', { count: 'exact' });
    const { data: feasts } = await supabase.from('feasts').select('id', { count: 'exact' });
    const { data: readings } = await supabase.from('daily_readings').select('id', { count: 'exact' });
    const { data: progress } = await supabase.from('progress_reports').select('id', { count: 'exact' });
    
    console.log('\nSummary:');
    console.log(`  Authors: ${users?.length || 0}`);
    console.log(`  News: ${news?.length || 0}`);
    console.log(`  Articles: ${articles?.length || 0}`);
    console.log(`  Events: ${events?.length || 0}`);
    console.log(`  Feasts: ${feasts?.length || 0}`);
    console.log(`  Daily Readings: ${readings?.length || 0}`);
    console.log(`  Progress Reports: ${progress?.length || 0}`);
  } catch (error) {
    console.error('Error inserting mock data:', error);
    process.exit(1);
  }
}

main().catch(console.error);

