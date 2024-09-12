const SHOP_LOCAL_STORAGE_KEY = "shop-e3b0c442-98fc-1e5b-9d73-f0d3dd31bd52";
const foxesList = [];
let cart = [];
let activeBreed = null;
let totalPrice = 0;

function fetchData() {
  return fetch("../data.json")
    .then((response) => response.json())
    .catch((error) => {
      console.error("Помилка завантаження JSON:", error);
      throw error;
    });
}

function initializeApp() {
  fetchData().then((data) => {
    foxesList.push(...data);
    foxesList.forEach((fox) => createCard(fox));
    loadCartFromLocalStorage();
  });
}
function createCard(fox) {
  const id = parseFloat(fox.id);
  const name = fox.name;
  const image = fox.image;
  const price = parseFloat(fox.price);
  const breed = fox.breed;

  const allFoxContainer = document.getElementById("allFoxContainer");

  const card = document.createElement("div");
  card.classList.add("main__card");
  card.id = id;
  card.innerHTML = `<img class="card__img" src="${image}" alt="fox-item" />
     <button  class="card__add-btn">
         <p class="add-btn__plus">+</p>
         <p class="add-btn__text">Add</p>
      </button>
     <div class="card__info-container">
        <h2 class="fox-name">${name}</h2>
         <p class="card__price">$${price}</p>
          <img src="../img/stars.svg" alt="stars" />
         <p class="card__breed">${breed}</p>
     </div>`;

  allFoxContainer.appendChild(card);
}

function showProductsByName(breed) {
  allFoxContainer.innerHTML = "";
  let filteredFoxes;
  if (breed === "all") {
    filteredFoxes = foxesList;
  } else {
    filteredFoxes = foxesList.filter(
      (fox) => fox.breed.toLowerCase() === breed
    );
  }

  filteredFoxes.forEach((fox) => createCard(fox));
}

function showFoxByName(foxName) {
  allFoxContainer.innerHTML = "";
  filteredFoxes = foxesList.filter((fox) =>
    fox.name.toLowerCase().includes(foxName.toLowerCase())
  );

  filteredFoxes.forEach((fox) => createCard(fox));
}

function openshoppingCart() {
  overlay.classList.add("display-flex");
  document.body.classList.add("modal-open");
}

function displayCardInCartContainer(fox) {
  const id = parseFloat(fox.id);
  const image = fox.image;
  const name = fox.name;
  const price = parseFloat(fox.price);
  const amount = fox.amount || 1;

  const card = document.createElement("div");
  card.classList.add("shopping-cart__card");
  card.id = id;
  card.innerHTML = `
   <div>
       <img class="cart__card-img" src="${image}" alt="fox" />
       <div class="card-img__text-container">
            <h2 class="card-img__title">${name}</h2>
             <p class="card-img__price">$${price}</p>
       </div>
   </div>
    <div>
      <div class="cart__card-buttons-container">
         <button class="cart__minus-btn">-</button>
         <p class="card-amount">${amount}</p>
         <button class="cart__plus-btn">+</button>
      </div>
      <div class="cart__card_remove-container">
         <p class="cart__card_remove-text">Remove</p>
           <img
             class="close-circle-icon"
             src="../img/close-circle.svg"
             alt="close-circle-icon"
           />
     </div>
     </div>`;

  cartsContainer.appendChild(card);
}

function closeopenshoppingCart() {
  overlay.classList.remove("display-flex");
  document.body.classList.remove("modal-open");
}

function saveCartToLocalStorage() {
  const cartIds = cart.map((item) => ({
    id: item.id,
    amount: item.amount,
  }));
  localStorage.setItem(SHOP_LOCAL_STORAGE_KEY, JSON.stringify(cartIds));
}

function loadCartFromLocalStorage() {
  const savedCartIds = JSON.parse(localStorage.getItem(SHOP_LOCAL_STORAGE_KEY));
  if (savedCartIds && Array.isArray(savedCartIds)) {
    savedCartIds.forEach((savedItem) => {
      const fox = foxesList.find((fox) => parseFloat(fox.id) === savedItem.id);

      if (fox) {
        fox.amount = savedItem.amount;
        cart.push(fox);
        displayCardInCartContainer(fox);
        totalPrice += fox.price * fox.amount;
      }
    });
    updateTotalPriceDisplay();
  }
}

function getPriceFromCard(card) {
  return parseFloat(
    card.querySelector(".card-img__price").textContent.replace("$", "")
  );
}

function updateTotalPrice(amount) {
  totalPrice += amount;
  updateTotalPriceDisplay();
}

function updateTotalPriceDisplay() {
  totalPriceText.textContent = `${totalPrice.toFixed(2)}`;
}

headerDots.addEventListener("click", function (event) {
  mainHeader.classList.add("display-none");
  headerDropMenu.classList.add("display-flex");
});

headerCloseIcon.addEventListener("click", function (event) {
  mainHeader.classList.remove("display-none");
  headerDropMenu.classList.remove("display-flex");
});

sidebarInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const inputValue = sidebarInput.value;
    showFoxByName(inputValue);
    sidebarInput.value = "";
  }
});

allFoxesBtn.addEventListener("click", function () {
  allFoxContainer.innerHTML = "";
  foxesList.forEach((fox) => createCard(fox));
  const previousButton = document.querySelector(
    `.sidebar__btns-container button[data-breed="${activeBreed}"]`
  );
  if (previousButton) {
    previousButton.classList.remove("selected-header-button");
  }
});

sidebarBtnContaner.addEventListener("click", function (e) {
  if (e.target.tagName !== "BUTTON") return;

  const breed = e.target.dataset.breed;
  if (breed === activeBreed) return;

  if (activeBreed !== null) {
    const previousButton = document.querySelector(
      `.sidebar__btns-container button[data-breed="${activeBreed}"]`
    );
    if (previousButton) {
      previousButton.classList.remove("selected-header-button");
    }
  }
  e.target.classList.add("selected-header-button");
  activeBreed = breed;
  showProductsByName(breed);
});

allFoxContainer.addEventListener("click", function (event) {
  if (event.target.closest(".card__add-btn")) {
    const card = event.target.closest(".main__card");
    const id = parseFloat(card.id);
    const name = card.querySelector(".fox-name").innerHTML;
    const image = card.querySelector(".card__img").src;
    const price = parseFloat(
      card.querySelector(".card__price").textContent.replace("$", "")
    );

    const foxObject = {
      id: id,
      image: image,
      name: name,
      price: price,
      amount: 1,
    };
    const isAlreadyInCart = cart.some((item) => item.id === foxObject.id);
    const foxPrice = parseFloat(foxObject.price);
    if (!isAlreadyInCart) {
      cart.push(foxObject);
      displayCardInCartContainer(foxObject);
      updateTotalPrice(foxPrice);
      openshoppingCart();
      saveCartToLocalStorage();
    } else {
      alert("Цей товар вже додано в корзину!");
    }
  }
});

cartsContainer.addEventListener("click", function (event) {
  const isPlusBtn = event.target.closest(".cart__plus-btn");
  const isMinusBtn = event.target.closest(".cart__minus-btn");
  const removeBtn = event.target.closest(".close-circle-icon");

  const card = event.target.closest(".shopping-cart__card");
  const price = getPriceFromCard(card);
  const id = parseFloat(card.id);
  const amountElement = card.querySelector(".card-amount");
  const cartItem = cart.find((item) => parseFloat(item.id) === id);

  if (isPlusBtn) {
    cartItem.amount += 1;
    updateTotalPrice(price);
  } else if (isMinusBtn && cartItem.amount > 1) {
    cartItem.amount -= 1;
    updateTotalPrice(-price);
  }

  amountElement.textContent = cartItem.amount;
  if (removeBtn) {
    updateTotalPrice(-price * cartItem.amount);
    cart = cart.filter((fox) => fox.id !== id);
    cartsContainer.innerHTML = "";
    cart.forEach((fox) => displayCardInCartContainer(fox));
  }
  saveCartToLocalStorage();
});

document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  loadCartFromLocalStorage();
  cart.forEach((fox) => displayCardInCartContainer(fox));
});
