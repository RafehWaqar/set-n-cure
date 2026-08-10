/* ---------- Product quick-view modal ----------
   Include this file (after data.js / app.js) on any page that renders
   .product-card items. Call wireProductCardClicks(gridEl, ()=>itemsArray)
   right after you render a grid of product cards, and clicking a card
   (anywhere except the "Add to cart" button) will open a bigger product
   view with name, price, description and a quantity counter.
*/

(function(){

  // ---- inject modal markup once ----
  const modalHTML = `
    <div class="modal-overlay" data-product-modal-overlay>
      <div class="product-modal" data-product-modal role="dialog" aria-modal="true">
        <button class="modal-close" data-modal-close aria-label="Close">&times;</button>
        <div class="product-modal__art">
          <img data-modal-img src="" alt="">
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

  let overlay, modal, qty = 1, activeProduct = null;

  function init(){
    if(document.querySelector("[data-product-modal-overlay]")) return; // already injected
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    overlay = document.querySelector("[data-product-modal-overlay]");
    modal = document.querySelector("[data-product-modal]");

    overlay.addEventListener("click", (e)=>{
      if(e.target === overlay) closeProductModal();
    });
    document.querySelector("[data-modal-close]").addEventListener("click", closeProductModal);
    document.addEventListener("keydown", (e)=>{
      if(e.key === "Escape") closeProductModal();
    });

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
      if(typeof window.showToast === "function"){
        window.showToast(`Added ${qty} to cart`);
      }
      closeProductModal();
    });
  }

  // ---- helpers to read product fields defensively (schema-agnostic) ----
  function pick(obj, keys, fallback){
    for(const k of keys){
      if(obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
    }
    return fallback;
  }

  function formatPrice(p){
    const raw = pick(p, ["priceLabel", "price"], "");
    if(typeof raw === "number"){
      return `Rs.${raw.toLocaleString()} PKR`;
    }
    return raw;
  }

  function catLabel(p){
    const key = pick(p, ["cat", "category"], "");
    if(typeof COLLECTIONS !== "undefined" && Array.isArray(COLLECTIONS)){
      const match = COLLECTIONS.find(c => c.key === key);
      if(match) return match.name;
    }
    return key;
  }

  // ---- open / close ----
  function openProductModal(product){
    if(!overlay) init();
    activeProduct = product;
    qty = 1;

    document.querySelector("[data-modal-img]").src = pick(product, ["id", "image", "thumbnail", "photo"], "") + ".jpg";
    document.querySelector("[data-modal-img]").alt = pick(product, ["name", "title"], "Product");
    document.querySelector("[data-modal-cat]").textContent = catLabel(product);
    document.querySelector("[data-modal-name]").textContent = pick(product, ["name", "title"], "");
    document.querySelector("[data-modal-price]").textContent = formatPrice(product);
    document.querySelector("[data-modal-desc]").textContent = pick(
      product,
      ["description", "desc", "details", "longDesc"],
      "Handmade and poured to order — every piece is one of a kind, so small variations in colour and placement are part of the charm."
    );
    document.querySelector("[data-qty-value]").textContent = qty;

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";


    console.log("Product modal opened for:", activeProduct);
  }

  function closeProductModal(){
    if(!overlay) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    activeProduct = null;
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
