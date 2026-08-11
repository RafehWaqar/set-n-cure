/* ---------- Product quick-view modal ----------
   Include this file (after data.js / app.js) on any page that renders
   .product-card items. Call wireProductCardClicks(gridEl, ()=>itemsArray)
   right after you render a grid of product cards, and clicking a card
   (anywhere except the "Add to cart" button) will open a bigger product
   view with name, price, description, a picture gallery (if more than
   one photo exists for that product) and a quantity counter.

   Gallery naming convention: additional photos for a product live at
   "Website PICTURES/{product.name}{n}.jpg" for n = 1, 2, 3, ...
   The modal probes those URLs in order and stops at the first one that
   fails to load. If none are found, it falls back to the single image
   already used on the product card ("Website PICTURES/{product.id}.jpg").
*/

(function(){

  const GALLERY_MAX = 10; // safety cap on how many numbered photos we probe for

  // ---- inject modal markup once ----
  const modalHTML = `
    <div class="modal-overlay" data-product-modal-overlay>
      <div class="product-modal" data-product-modal role="dialog" aria-modal="true">
        <button class="modal-close" data-modal-close aria-label="Close">&times;</button>
        <div class="product-modal__art">
          <img data-modal-img src="" alt="">
          <button class="modal-nav modal-nav--prev" data-modal-prev aria-label="Previous picture">&larr;</button>
          <button class="modal-nav modal-nav--next" data-modal-next aria-label="Next picture">&rarr;</button>
          <div class="modal-dots" data-modal-dots></div>
        </div>
        <div class="product-modal__body">
          <span class="product-modal__cat" data-modal-cat></span>
          <h2 class="product-modal__name" data-modal-name></h2>
          <p class="product-modal__price" data-modal-price></p>
          <p class="product-modal__desc" data-modal-desc></p>
          <div class="qty-counter">
            <button class="qty-btn" data-qty-minus aria-label="Decrease quantity">&minus;</button>
            <span class="qty-value" data-qty-value>1</span>
            <button class="qty-btn" data-qty-plus aria-label="Increase quantity">&plus;</button>
          </div>
          <button class="btn btn-primary modal-add-btn" data-modal-add>Add to cart</button>
        </div>
      </div>
    </div>`;

  document.addEventListener("DOMContentLoaded", init);
  if(document.readyState === "complete" || document.readyState === "interactive"){
    // scripts placed at the end of <body> — DOM is already parsed
    init();
  }

  let overlay, qty = 1, activeProduct = null;
  let galleryImages = [], galleryIndex = 0;
  let galleryRequestId = 0; // guards against a stale async probe overwriting a newer one

  function init(){
    if(document.querySelector("[data-product-modal-overlay]")) return; // already injected
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    overlay = document.querySelector("[data-product-modal-overlay]");

    overlay.addEventListener("click", (e)=>{
      if(e.target === overlay) closeProductModal();
    });
    document.querySelector("[data-modal-close]").addEventListener("click", closeProductModal);
    document.addEventListener("keydown", (e)=>{
      if(!overlay.classList.contains("active")) return;
      if(e.key === "Escape") closeProductModal();
      if(e.key === "ArrowLeft") showGalleryImage(galleryIndex - 1);
      if(e.key === "ArrowRight") showGalleryImage(galleryIndex + 1);
    });

    document.querySelector("[data-modal-prev]").addEventListener("click", ()=> showGalleryImage(galleryIndex - 1));
    document.querySelector("[data-modal-next]").addEventListener("click", ()=> showGalleryImage(galleryIndex + 1));

    document.querySelector("[data-qty-minus]").addEventListener("click", ()=>{
      qty = Math.max(1, qty - 1);
      document.querySelector("[data-qty-value]").textContent = qty;
    });
    document.querySelector("[data-qty-plus]").addEventListener("click", ()=>{
      qty = qty + 1;
      document.querySelector("[data-qty-value]").textContent = qty;
    });

    document.querySelector("[data-modal-add]").addEventListener("click", ()=>{
      if(!activeProduct) return;
      if(typeof window.addToCart === "function"){
        window.addToCart(activeProduct.id, activeProduct.name, qty);
      }
      closeProductModal();
    });
  }

  function money(n){
    if(typeof window.money === "function") return window.money(n);
    return "Rs." + Number(n).toLocaleString("en-PK") + " PKR";
  }

  function catLabel(product){
    const collection = (typeof COLLECTIONS !== "undefined" ? COLLECTIONS : []).find(c => c.key === product.cat);
    return collection ? collection.name : (product.cat || "");
  }

  function descriptionFor(product){
    const collection = (typeof COLLECTIONS !== "undefined" ? COLLECTIONS : []).find(c => c.key === product.cat);
    return product.description
      || product.desc
      || (collection && collection.desc)
      || "Handmade and poured to order — every piece is one of a kind, so small variations in colour and placement are part of the charm.";
  }

  // ---- picture gallery ----
  function imageExists(url){
    return new Promise(resolve=>{
      const img = new Image();
      img.onload = ()=> resolve(true);
      img.onerror = ()=> resolve(false);
      img.src = url;
    });
  }

  async function findGalleryImages(product){
    const found = [];
    for(let n = 1; n <= GALLERY_MAX; n++){
      const url = `Website PICTURES/${product.id}${n}.jpg`;
      const ok = await imageExists(url);
      if(!ok) break;
      found.push(url);
    }
    return found;
  }

  function showGalleryImage(index){
    if(!galleryImages.length) return;
    galleryIndex = (index + galleryImages.length) % galleryImages.length;
    document.querySelector("[data-modal-img]").src = galleryImages[galleryIndex];

    const dotsEl = document.querySelector("[data-modal-dots]");
    dotsEl.querySelectorAll(".modal-dot").forEach((dot, i)=>{
      dot.classList.toggle("active", i === galleryIndex);
    });
  }

  function renderGalleryControls(){
    const prevBtn = document.querySelector("[data-modal-prev]");
    const nextBtn = document.querySelector("[data-modal-next]");
    const dotsEl = document.querySelector("[data-modal-dots]");
    const multi = galleryImages.length > 1;

    prevBtn.style.display = multi ? "flex" : "none";
    nextBtn.style.display = multi ? "flex" : "none";

    dotsEl.innerHTML = multi
      ? galleryImages.map((_, i)=>`<button class="modal-dot ${i===0?'active':''}" data-dot-index="${i}" aria-label="Show picture ${i+1}"></button>`).join("")
      : "";
    dotsEl.querySelectorAll(".modal-dot").forEach(dot=>{
      dot.addEventListener("click", ()=> showGalleryImage(parseInt(dot.dataset.dotIndex, 10)));
    });
  }

  // ---- open / close ----
  async function openProductModal(product){
    if(!overlay) init();
    activeProduct = product;
    qty = 1;

    // show the card's existing image immediately, then swap in the
    // gallery once probing finishes so the modal never looks empty
    const fallbackImg = `Website PICTURES/${product.id}.jpg`;
    galleryImages = [fallbackImg];
    galleryIndex = 0;
    document.querySelector("[data-modal-img]").src = fallbackImg;
    document.querySelector("[data-modal-img]").alt = product.name || "Product";
    renderGalleryControls();

    document.querySelector("[data-modal-cat]").textContent = catLabel(product);
    document.querySelector("[data-modal-name]").textContent = product.name || "";
    document.querySelector("[data-modal-price]").textContent = money(product.price);
    document.querySelector("[data-modal-desc]").textContent = descriptionFor(product);
    document.querySelector("[data-qty-value]").textContent = qty;

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";

    const requestId = ++galleryRequestId;
    const found = await findGalleryImages(product);
    if(requestId !== galleryRequestId) return; // a newer product was opened meanwhile
    if(found.length){
      galleryImages = found;
      galleryIndex = 0;
      document.querySelector("[data-modal-img]").src = galleryImages[0];
      renderGalleryControls();
    }
  }

  function closeProductModal(){
    if(!overlay) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    activeProduct = null;
    galleryRequestId++; // invalidate any in-flight gallery probe
  }

  // ---- wire up a rendered grid of .product-card elements ----
  // gridEl: the container element holding .product-card children
  // getItems: a function returning the array of product objects currently
  //           rendered in that grid, in the same order as the DOM cards
  function wireProductCardClicks(gridEl, getItems){
    if(!gridEl || gridEl.dataset.modalWired) return;
    gridEl.dataset.modalWired = "true";
    gridEl.addEventListener("click", (e)=>{
      if(e.target.closest(".add-btn")) return; // let "Add to cart" behave as before
      const card = e.target.closest(".product-card");
      if(!card || !gridEl.contains(card)) return;
      if(e.target.closest("a")) e.preventDefault(); // card links to products.html#id — open the modal instead
      const cards = Array.from(gridEl.querySelectorAll(".product-card"));
      const idx = cards.indexOf(card);
      const items = getItems ? getItems() : [];
      const product = items[idx];
      if(product) openProductModal(product);
    });
  }

  window.openProductModal = openProductModal;
  window.closeProductModal = closeProductModal;
  window.wireProductCardClicks = wireProductCardClicks;

})();