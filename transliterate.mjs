import fs from 'fs';
import { transliterate } from 'hebrew-transliteration';

const dataPath = './src/data/haggadah_full.json';
const haggadah = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log("Starting Phonetic Transliteration of", haggadah.length, "sections...");

for (const passage of haggadah) {
  if (passage.hebrew) {
    passage.transliteration = passage.hebrew.map(line => {
      if (!line) return "";
      // Strip HTML
      let clean = line.replace(/<[^>]*>?/gm, '');
      // Transliterate
      let phonemes = transliterate(clean);
      return phonemes;
    });
  }
}

fs.writeFileSync(dataPath, JSON.stringify(haggadah, null, 2));
console.log("Transliteration injected successfully into haggadah_full.json");
