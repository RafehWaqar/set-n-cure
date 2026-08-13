/* ---------- Brand data ---------- */

const COLLECTIONS = [
  { key:"Jewellery",      name:"Jewellery", desc:"Statement plaques for the big day, personalised with names and dates."},
  { key:"Covers",   name:"Mobile Covers", desc:"Real blooms sealed in resin and worn as earrings, rings and pendants."},
  { key:"Bookmarks",     name:"Bookmarks", desc:"Custom lettering and colour, poured and cured just for you."},
  { key:"Keyrings",      name:"Keyrings", desc:"Geode and floral faces that turn a wall into a centrepiece."},
  { key:"Plates",    name:"Plates", desc:"Tableware that doubles as a conversation piece."},
  { key:"Coasters", name:"Coasters", desc:"Small everyday pieces with a handmade, one-of-one finish."},
  { key:"Rehal",   name:"Rehal", desc:"Ayat and calligraphy pieces poured with care and gold leaf detail."},
];

const PRODUCTS = [
  { id:"mobile-cover",        name:"Resin Mobile Cover", cat:"Covers",   price:2500, badge:"Bestseller" },
  { id:"keyring",  name:"Customizable Resin Initial Keyring", cat:"Keyrings",     price:4200, badge:"Made to order" },
  { id:"pendant-earing-set",    name:"Resin Pendant & Earring Set", cat:"Jewellery", price:2800},
  { id:"bookmark-paperclip-set", name:"Resin Bookmark & Paperclip Set", cat:"Bookmarks", price:1800, badge:"Bestseller" },
  { id:"bookmark",       name:"Resin Bookmark", cat:"Bookmarks",         price:1200},
  { id:"butterfly-pendant",   name:"Butterfly Pendant", cat:"Jewellery",         price:1500},
  { id:"rose-perserved-bracelet",    name:"Rose Perserved Bracelet", cat:"Jewellery",     price:800},
  { id:"qul-plate",    name:"Customizable Resin Qul Plate", cat:"Plates",           price:6000},
  { id:"resin-plate",   name:"Customizable Resin Plate", cat:"Plates",       price:3000},
  { id:"coaster",    name:"Customizable Resin Coaster", cat:"Coasters",price:1800},
  { id:"quran-rehal",   name:"Customizable Resin Butterfly Quran Rehal", cat:"Rehal",   price:7500},
  { id:"jewellery-box",     name:"Customizable Resin Jewellery Box", cat:"Jewellery",price:2500},
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
