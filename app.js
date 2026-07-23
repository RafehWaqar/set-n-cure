/* =========================================================
   Amber & Bloom — shared front-end logic

   Cart stays in localStorage (it's fine for pre-purchase, throwaway
   state). Accounts and orders now use Supabase (Postgres + built-in
   auth) — see backend/schema.sql for the table this depends on.
   Fill in your own project's URL and anon key below; both are safe
   to expose in client-side code (that's what row-level security in
   schema.sql is for — it's what actually restricts access).
   ========================================================= */
const SUPABASE_URL = "https://oqakvkmgrccubejxrzwm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYWt2a21ncmNjdWJlanhyendtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTc5NDQsImV4cCI6MjEwMDM3Mzk0NH0.lu7pDu_M_uxKJ0lb9OXZPjnlQGIhBizm8N5xV1OMSok";
if(typeof window.supabase === "undefined"){
  console.error("Supabase client library not found. Make sure the CDN <script> tag for @supabase/supabase-js comes BEFORE app.js in every HTML file.");
}
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------- cart ----------
   cart shape: [{ id, qty }] */
function getCart(){
  try{ return JSON.parse(localStorage.getItem("abr_cart") || "[]"); }
  catch(e){ return []; }
}
function setCart(cart){
  localStorage.setItem("abr_cart", JSON.stringify(cart));
  updateCartCount();
}
function addToCart(id, name, qty){
  qty = qty || 1;
  const cart = getCart();
  const line = cart.find(l=>l.id===id);
  if(line) line.qty += qty;
  else cart.push({id, qty});
  setCart(cart);
  showToast(`${name} added to cart`);
}
function updateCartQty(id, qty){
  let cart = getCart();
  if(qty <= 0){
    cart = cart.filter(l=>l.id!==id);
  }else{
    const line = cart.find(l=>l.id===id);
    if(line) line.qty = qty;
  }
  setCart(cart);
}
function removeFromCart(id){
  setCart(getCart().filter(l=>l.id!==id));
}
function clearCart(){
  setCart([]);
}
function cartLinesWithProducts(){
  return getCart().map(line=>{
    const product = PRODUCTS.find(p=>p.id===line.id);
    return product ? {...line, product} : null;
  }).filter(Boolean);
}
function cartCount(){
  return getCart().reduce((sum,l)=>sum+l.qty, 0);
}
function cartSubtotal(){
  return cartLinesWithProducts().reduce((sum,l)=>sum + l.product.price*l.qty, 0);
}
const SHIPPING_FLAT = 250;
function updateCartCount(){
  document.querySelectorAll("[data-cart-count]").forEach(el=>{
    el.textContent = cartCount();
  });
}

/* ---------- accounts ----------
   Handled by Supabase Auth. "name" is stored in the user's
   metadata at signup time rather than a separate table, since
   that's all we need beyond what auth.users already tracks. */
async function getCurrentUser(){
  try{
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return null;
    return { id:user.id, email:user.email, name: user.user_metadata?.name || user.email };
  }catch(e){
    console.error("Supabase auth check failed:", e);
    return null;
  }
}
async function signup(name, email, password){
  const { error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { name } }
  });
  if(error) return {ok:false, error:error.message};
  return {ok:true};
}
async function login(email, password){
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });
  if(error) return {ok:false, error:"That email and password don't match any account."};
  return {ok:true};
}
async function logout(){
  await supabase.auth.signOut();
}
async function requireLogin(redirectTo){
  const user = await getCurrentUser();
  if(!user){
    location.href = "account.html?next=" + encodeURIComponent(redirectTo || location.pathname);
    return false;
  }
  return true;
}

/* ---------- orders ----------
   Stored in the `orders` table (see backend/schema.sql). Row-level
   security means a logged-in shopper can only ever read or insert
   their own rows — enforced by Postgres, not by this JS. */
async function ordersForCurrentUser(){
  const user = await getCurrentUser();
  if(!user) return [];
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending:false });
  if(error){ console.error(error); return []; }
  return data;
}
async function placeOrder(address){
  const lines = cartLinesWithProducts();
  if(!lines.length) return {ok:false, error:"Your cart is empty."};
  const user = await getCurrentUser();
  if(!user) return {ok:false, error:"Please log in before checking out."};

  const subtotal = cartSubtotal();
  const shipping = SHIPPING_FLAT;
  const order = {
    id: "AB" + Date.now().toString().slice(-8),
    user_id: user.id,
    items: lines.map(l=>({id:l.id, name:l.product.name, qty:l.qty, price:l.product.price})),
    subtotal, shipping, total: subtotal + shipping,
    address,
    status: "Processing"
  };
  const { error } = await supabase.from("orders").insert(order);
  if(error) return {ok:false, error:error.message};
  clearCart();
  return {ok:true, order};
}

/* ---------- toast ---------- */
function showToast(msg){
  let toast = document.querySelector(".toast");
  if(!toast){
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>toast.classList.remove("show"), 2200);
}

/* ---------- product card ---------- */
function productCardHTML(p){
  const collection = COLLECTIONS.find(c=>c.key===p.cat);
  return `
  <article class="product-card">
    <div class="product-card__art">
      <img src="${p.id}.jpg" alt="${p.name}" loading="lazy"/>
    </div>
    <div class="product-card__body">
      <span class="product-card__cat">${collection ? collection.name : ""}</span>
      <a href="products.html#${p.id}" class="product-card__name">${p.name}</a>
      <div class="product-card__price">
        <span class="price">${money(p.price)}</span>
        <button class="add-btn" onclick="addToCart('${p.id}', '${p.name.replace(/'/g,"\\'")}')">Add to cart</button>
      </div>
    </div>
  </article>`;
}

function collectionCardHTML(c, big){
  return `
  <a class="collection-card" href="products.html?collection=${c.key}" style="${big?"aspect-ratio:16/10":""}">
    <div class="collection-card__label">
      <span class="eyebrow">Collection</span>
      <h3>${c.name}</h3>
    </div>
  </a>`;
}

/* ---------- shared chrome ---------- */
async function renderHeader(active){
  const links = [
    {href:"index.html", label:"Home"},
    {href:"collections.html", label:"Collections"},
    {href:"products.html", label:"Products"},
  ];
  const navLinks = links.map(l=>`<a href="${l.href}" class="${active===l.label?'active':''}">${l.label}</a>`).join("");
  const user = await getCurrentUser();
  document.querySelectorAll("[data-header]").forEach(el=>{
    el.innerHTML = `
    <div class="ticker">
      <div class="ticker__track">
        <span>Handmade in Pakistan</span><span>Preserves your flowers, forever</span><span>Made to order &mdash; 15&ndash;18 day processing</span>
        <span>Handmade in Pakistan</span><span>Preserves your flowers, forever</span><span>Made to order &mdash; 15&ndash;18 day processing</span>
      </div>
    </div>
    <header class="site">
      <div class="wrap nav">
        <a href="index.html" class="logo">
          <svg class="logo-mark" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#c89b3c" opacity="0.85"/>
            <circle cx="16" cy="17" r="10" fill="#1f3b2c" opacity="0.85"/>
          </svg>
          Amber &amp; Bloom
        </a>
        <nav class="nav__links" data-nav>${navLinks}</nav>
        <div class="nav__actions">
          <a class="account-link" href="account.html" aria-label="Account">${user ? "Hi, " + user.name.split(" ")[0] : "Log in"}</a>
          <a class="cart-btn" href="cart.html" aria-label="Cart">
            Cart <span class="cart-count" data-cart-count>0</span>
          </a>
          <button class="menu-toggle" aria-label="Menu" onclick="document.querySelector('[data-nav]').classList.toggle('open')">&#9776;</button>
        </div>
      </div>
    </header>`;
  });
  updateCartCount();
}

function renderFooter(){
  document.querySelectorAll("[data-footer]").forEach(el=>{
    el.innerHTML = `
    <footer class="site" id="contact-footer">
      <div class="wrap">
        <div class="footer-grid">
          <div>
            <div class="footer-logo">Amber &amp; Bloom Resin Co.</div>
            <p style="max-width:34ch; font-size:.9rem; color:#b6ac9f;">Small-batch resin art and preserved-flower keepsakes, poured to order.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><a href="products.html">All products</a></li>
              <li><a href="collections.html">Collections</a></li>
              <li><a href="cart.html">Cart</a></li>
              <li><a href="account.html">My account</a></li>
            </ul>
          </div>
          <div>
            <h4>Info</h4>
            <ul>
              <li><a href="#">Privacy policy</a></li>
              <li><a href="#">Terms &amp; conditions</a></li>
              <li><a href="#">How preservation works</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4>Follow</h4>
            <div class="footer-social">
              <a href="#" aria-label="Instagram">Instagram</a>
              <a href="#" aria-label="TikTok">TikTok</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; 2026 Amber &amp; Bloom Resin Co.</span>
          <span>Built with care, cured for 48 hours.</span>
        </div>
      </div>
    </footer>`;
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  updateCartCount();
});
