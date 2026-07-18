/* ---------- Brand data ---------- */

const COLLECTIONS = [
  { key:"nikkah",      name:"Nikkah & Wedding Plaques", desc:"Statement plaques for the big day, personalised with names and dates.",       shape:"plaque", a:"#1f3b2c", b:"#c89b3c" },
  { key:"preserved",   name:"Preserved Flower Jewellery", desc:"Real blooms sealed in resin and worn as earrings, rings and pendants.",        shape:"circle", a:"#c97b84", b:"#e8c77a" },
  { key:"plaques",     name:"Personalised Name Plaques", desc:"Custom lettering and colour, poured and cured just for you.",                    shape:"plaque", a:"#2f5641", b:"#e6b6bd" },
  { key:"clocks",      name:"Resin Clocks", desc:"Geode and floral faces that turn a wall into a centrepiece.",                                  shape:"clock",  a:"#c89b3c", b:"#1f3b2c" },
  { key:"accessories", name:"Keychains & Accessories", desc:"Small everyday pieces with a handmade, one-of-one finish.",                          shape:"tag",    a:"#c97b84", b:"#1f3b2c" },
  { key:"coasters",    name:"Coasters & Trays", desc:"Tableware that doubles as a conversation piece.",                                          shape:"circle", a:"#e8c77a", b:"#2f5641" },
  { key:"religious",   name:"Religious Art", desc:"Ayat and calligraphy pieces poured with care and gold leaf detail.",                          shape:"arch",   a:"#1f3b2c", b:"#e8c77a" },
  { key:"candles",     name:"Soy Candles", desc:"Hand-poured soy candles to pair alongside your gift.",                                          shape:"jar",    a:"#c97b84", b:"#c89b3c" },
];

const PRODUCTS = [
  { id:"gulab-jhumka",        name:"Gulab Preserved Rose Jhumka", cat:"preserved",   price:3000, shape:"circle", a:"#c97b84", b:"#e8c77a", badge:"Bestseller" },
  { id:"nikkah-plaque-gold",  name:"Nikkah Date Plaque, Gold Leaf", cat:"nikkah",     price:4200, shape:"plaque", a:"#1f3b2c", b:"#c89b3c", badge:"Made to order" },
  { id:"name-plaque-arch",    name:"Arched Name Plaque", cat:"plaques",              price:1900, shape:"arch",   a:"#2f5641", b:"#e6b6bd" },
  { id:"geode-clock-emerald", name:"Emerald Geode Wall Clock", cat:"clocks",         price:5400, shape:"clock",  a:"#1f3b2c", b:"#e8c77a", badge:"Bestseller" },
  { id:"rose-keychain",       name:"Rose Petal Keychain", cat:"accessories",         price:1000, shape:"tag",    a:"#c97b84", b:"#1f3b2c" },
  { id:"gajra-coaster-set",   name:"Gajra Coaster Set of 4", cat:"coasters",         price:2600, shape:"circle", a:"#e8c77a", b:"#2f5641" },
  { id:"ayat-frame-round",    name:"Round Ayat-ul-Kursi Frame", cat:"religious",     price:3800, shape:"arch",   a:"#1f3b2c", b:"#c89b3c" },
  { id:"amber-soy-candle",    name:"Amber Rose Soy Candle", cat:"candles",           price:1500, shape:"jar",    a:"#c97b84", b:"#c89b3c" },
  { id:"vanity-tray-blush",   name:"Blush Marble Vanity Tray", cat:"coasters",       price:3200, shape:"circle", a:"#e6b6bd", b:"#1f3b2c" },
  { id:"cufflinks-forest",    name:"Forest Green Resin Cufflinks", cat:"accessories",price:1800, shape:"tag",    a:"#2f5641", b:"#e8c77a" },
  { id:"engagement-plaque",   name:"Engagement Announcement Plaque", cat:"nikkah",   price:3900, shape:"plaque", a:"#c89b3c", b:"#1f3b2c" },
  { id:"initial-pendant",     name:"Pressed Flower Initial Pendant", cat:"preserved",price:2200, shape:"circle", a:"#e8c77a", b:"#c97b84" },
  { id:"rose-gold-clock",     name:"Rose & Gold Table Clock", cat:"clocks",          price:4600, shape:"clock",  a:"#c97b84", b:"#e8c77a" },
  { id:"quran-verse-tag",     name:"Quran Verse Bookmark Tag", cat:"religious",      price:1200, shape:"tag",    a:"#1f3b2c", b:"#e6b6bd" },
];

/* ---------- Resin-pour SVG art generator ----------
   Every piece uses the same signature language: two translucent
   poured layers behind a category silhouette, so the whole catalog
   reads as "one artist's hand" even though every item differs. */
function resinArt(shape, colorA, colorB, seed){
  const id = "g" + Math.random().toString(36).slice(2,8);
  const rot = (seed || 0) % 2 === 0 ? 6 : -5;
  const blobs = `
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${colorA}" stop-opacity="0.9"/>
        <stop offset="1" stop-color="${colorB}" stop-opacity="0.85"/>
      </linearGradient>
      <radialGradient id="${id}-sheen" cx="30%" cy="25%" r="60%">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
        <stop offset="55%" stop-color="#ffffff" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="300" height="300" fill="#f4ede0"/>
    <circle cx="215" cy="70" r="90" fill="${colorB}" opacity="0.16"/>
    <circle cx="60" cy="240" r="70" fill="${colorA}" opacity="0.14"/>
  `;
  let sil = "";
  const cx = 150, cy = 150;
  if(shape === "circle"){
    sil = `<circle cx="${cx}" cy="${cy}" r="82" fill="url(#${id})"/>
           <circle cx="${cx}" cy="${cy}" r="82" fill="url(#${id}-sheen)"/>
           <circle cx="${cx}" cy="${cy}" r="82" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="2"/>
           <circle cx="${cx-18}" cy="${cy-14}" r="7" fill="#fff" opacity="0.5"/>`;
  } else if(shape === "plaque"){
    sil = `<g transform="rotate(${rot} ${cx} ${cy})">
             <rect x="${cx-95}" y="${cy-62}" width="190" height="124" rx="14" fill="url(#${id})"/>
             <rect x="${cx-95}" y="${cy-62}" width="190" height="124" rx="14" fill="url(#${id}-sheen)"/>
             <rect x="${cx-95}" y="${cy-62}" width="190" height="124" rx="14" fill="none" stroke="#fff" stroke-opacity="0.3" stroke-width="2"/>
             <line x1="${cx-55}" y1="${cy-6}" x2="${cx+55}" y2="${cy-6}" stroke="#fff" stroke-opacity="0.55" stroke-width="3" stroke-linecap="round"/>
             <line x1="${cx-38}" y1="${cy+16}" x2="${cx+38}" y2="${cy+16}" stroke="#fff" stroke-opacity="0.4" stroke-width="3" stroke-linecap="round"/>
           </g>`;
  } else if(shape === "clock"){
    sil = `<circle cx="${cx}" cy="${cy}" r="86" fill="url(#${id})"/>
           <circle cx="${cx}" cy="${cy}" r="86" fill="url(#${id}-sheen)"/>
           <circle cx="${cx}" cy="${cy}" r="86" fill="none" stroke="#fff" stroke-opacity="0.4" stroke-width="2"/>
           <circle cx="${cx}" cy="${cy}" r="4" fill="#fff"/>
           <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy-46}" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
           <line x1="${cx}" y1="${cy}" x2="${cx+32}" y2="${cy+16}" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
           ${[0,30,60,90,120,150].map(d=>`<line transform="rotate(${d} ${cx} ${cy})" x1="${cx}" y1="${cy-78}" x2="${cx}" y2="${cy-70}" stroke="#fff" stroke-opacity="0.5" stroke-width="2"/>`).join("")}`;
  } else if(shape === "tag"){
    sil = `<g transform="rotate(${rot} ${cx} ${cy})">
             <path d="M ${cx-70} ${cy-40} L ${cx+40} ${cy-40} L ${cx+80} ${cy} L ${cx+40} ${cy+40} L ${cx-70} ${cy+40} Z" fill="url(#${id})"/>
             <path d="M ${cx-70} ${cy-40} L ${cx+40} ${cy-40} L ${cx+80} ${cy} L ${cx+40} ${cy+40} L ${cx-70} ${cy+40} Z" fill="url(#${id}-sheen)"/>
             <circle cx="${cx-48}" cy="${cy}" r="10" fill="#f4ede0" stroke="#fff" stroke-opacity="0.5" stroke-width="2"/>
           </g>`;
  } else if(shape === "arch"){
    sil = `<path d="M ${cx-70} ${cy+80} L ${cx-70} ${cy-10} A 70 70 0 0 1 ${cx+70} ${cy-10} L ${cx+70} ${cy+80} Z" fill="url(#${id})"/>
           <path d="M ${cx-70} ${cy+80} L ${cx-70} ${cy-10} A 70 70 0 0 1 ${cx+70} ${cy-10} L ${cx+70} ${cy+80} Z" fill="url(#${id}-sheen)"/>
           <path d="M ${cx-70} ${cy+80} L ${cx-70} ${cy-10} A 70 70 0 0 1 ${cx+70} ${cy-10} L ${cx+70} ${cy+80}" fill="none" stroke="#fff" stroke-opacity="0.3" stroke-width="2"/>
           <circle cx="${cx}" cy="${cy+20}" r="5" fill="#fff" opacity="0.6"/>`;
  } else if(shape === "jar"){
    sil = `<g>
             <rect x="${cx-48}" y="${cy-70}" width="96" height="130" rx="18" fill="url(#${id})"/>
             <rect x="${cx-48}" y="${cy-70}" width="96" height="130" rx="18" fill="url(#${id}-sheen)"/>
             <rect x="${cx-30}" y="${cy-92}" width="60" height="24" rx="6" fill="${colorB}"/>
             <ellipse cx="${cx-8}" cy="${cy-30}" rx="10" ry="16" fill="#fff" opacity="0.5"/>
           </g>`;
  }
  return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img">${blobs}${sil}</svg>`;
}

function resinBlobBackground(colorA, colorB){
  const id = "bg" + Math.random().toString(36).slice(2,8);
  return `<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${colorA}"/>
        <stop offset="1" stop-color="${colorB}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="500" fill="url(#${id})"/>
    <circle cx="330" cy="60" r="140" fill="#ffffff" opacity="0.08"/>
    <circle cx="40" cy="460" r="120" fill="#000000" opacity="0.08"/>
    <path d="M0 380 Q100 320 200 380 T400 380 V500 H0 Z" fill="#ffffff" opacity="0.06"/>
  </svg>`;
}

function money(n){
  return "Rs." + n.toLocaleString("en-PK") + " PKR";
}
