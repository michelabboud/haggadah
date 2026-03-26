import fs from 'fs';
import https from 'https';

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchAll() {
  const sections = [];
  let currentRef = 'Passover_Haggadah,_Kadesh';

  console.log('Starting full Haggadah fetch...');
  
  while (currentRef) {
    console.log(`Fetching: ${currentRef}`);
    const url = `https://www.sefaria.org/api/texts/${currentRef}?context=0&pad=0`;
    
    try {
      const data = await fetchJson(url);
      
      sections.push({
        ref: data.ref,
        heTitle: data.heTitle || data.heRef,
        enTitle: data.titleVariants ? data.titleVariants[0] : data.ref,
        hebrew: data.he || [],
        english: data.text || []
      });
      
      if (data.next) {
        currentRef = data.next.replace(/ /g, '_');
        await delay(200); // polite delay
      } else {
        currentRef = null;
      }
    } catch (err) {
      console.error(`Error fetching ${currentRef}:`, err);
      break;
    }
  }

  console.log(`Fetched ${sections.length} sections. Saving to src/data/haggadah_full.json`);
  fs.writeFileSync('src/data/haggadah_full.json', JSON.stringify(sections, null, 2));
  console.log('Done.');
}

fetchAll();
