/* =========================================================
   Amber & Bloom — shared front-end logic
   Cart, checkout and accounts are simulated entirely in the
   browser using localStorage. There is no real server, so:
     - orders are not actually shipped or charged
     - "accounts" are not secure — do not reuse a real password
   Swap this for real auth/payment endpoints before going live.
   ========================================================= */

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
   users: { [email]: { name, email, password, addresses:[] } }
   demo-only "password storage" — never do this for a real product. */
function getUsers(){
  try{ return JSON.parse(localStorage.getItem("abr_users") || "{}"); }
  catch(e){ return {}; }
}
function saveUsers(users){
  localStorage.setItem("abr_users", JSON.stringify(users));
}
function getCurrentUserEmail(){
  return localStorage.getItem("abr_current_user") || null;
}
function getCurrentUser(){
  const email = getCurrentUserEmail();
  if(!email) return null;
  return getUsers()[email] || null;
}
function signup(name, email, password){
  email = email.trim().toLowerCase();
  const users = getUsers();
  if(users[email]) return {ok:false, error:"An account with that email already exists. Try logging in instead."};
  users[email] = {name, email, password, addresses:[]};
  saveUsers(users);
  localStorage.setItem("abr_current_user", email);
  return {ok:true};
}
function login(email, password){
  email = email.trim().toLowerCase();
  const users = getUsers();
  const user = users[email];
  if(!user || user.password !== password) return {ok:false, error:"That email and password don't match any account."};
  localStorage.setItem("abr_current_user", email);
  return {ok:true};
}
function logout(){
  localStorage.removeItem("abr_current_user");
}
function requireLogin(redirectTo){
  if(!getCurrentUser()){
    location.href = "account.html?next=" + encodeURIComponent(redirectTo || location.pathname);
    return false;
  }
  return true;
}

/* ---------- orders ----------
   orders: [{ id, email, items:[{id,name,qty,price}], subtotal, shipping, total, address, date, status }] */
function getOrders(){
  try{ return JSON.parse(localStorage.getItem("abr_orders") || "[]"); }
  catch(e){ return []; }
}
function saveOrder(order){
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem("abr_orders", JSON.stringify(orders));
}
function ordersForCurrentUser(){
  const email = getCurrentUserEmail();
  if(!email) return [];
  return getOrders().filter(o=>o.email===email);
}
function placeOrder(address){
  const lines = cartLinesWithProducts();
  if(!lines.length) return {ok:false, error:"Your cart is empty."};
  const subtotal = cartSubtotal();
  const shipping = SHIPPING_FLAT;
  const order = {
    id: "AB" + Date.now().toString().slice(-8),
    email: getCurrentUserEmail() || "guest",
    items: lines.map(l=>({id:l.id, name:l.product.name, qty:l.qty, price:l.product.price})),
    subtotal, shipping, total: subtotal + shipping,
    address,
    date: new Date().toISOString(),
    status: "Processing"
  };
  saveOrder(order);
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
      ${p.badge ? `<span class="product-card__badge">${p.badge}</span>` : ""}
      ${resinArt(p.shape, p.a, p.b)}
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
    ${resinBlobBackground(c.a, c.b)}
    <div class="collection-card__label">
      <span class="eyebrow">Collection</span>
      <h3>${c.name}</h3>
    </div>
  </a>`;
}

/* ---------- shared chrome ---------- */
function renderHeader(active){
  const links = [
    {href:"index.html", label:"Home"},
    {href:"collections.html", label:"Collections"},
    {href:"products.html", label:"Products"},
  ];
  const navLinks = links.map(l=>`<a href="${l.href}" class="${active===l.label?'active':''}">${l.label}</a>`).join("");
  const user = getCurrentUser();
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
