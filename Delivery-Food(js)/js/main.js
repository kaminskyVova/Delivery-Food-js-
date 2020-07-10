"use strict";

// Ctrl+Shift+L -- console.log()

// open/close cart
const cartButton = document.querySelector(".button-cart");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");

// авторизация
// buttons
const buttonAuth = document.querySelector(".button-auth"),
  modalAuth = document.querySelector(".modal-auth"),
  closeAuth = document.querySelector(".close-auth");

// form elements
const logInForm = document.getElementById("logInForm"),
  loginInput = document.getElementById("login"),
  loginPassword = document.getElementById("password");
const userName = document.querySelector(".user-name");
const buttonOut = document.querySelector(".button-out");

// блок карточек товаров
const cardsRestaurants = document.querySelector(".cards-restaurants");
const containerPromo = document.querySelector(".container-promo");
const restaurants = document.querySelector(".restaurants");
const menu = document.querySelector(".menu");
const logo = document.querySelector(".logo");
const cardsMenu = document.querySelector(".cards-menu");

//рестораны
const restaurantTitle = document.querySelector(".restaurant-title");
const rating = document.querySelector(".rating");
const minPrice = document.querySelector(".price");
const category = document.querySelector(".category");

//поиск
const inputSearch = document.querySelector(".input-search");

let login = localStorage.getItem("AuthorizedUser");

//корзина
const cart = [];


// const saveCart = function() {
//   localStorage.setItem("DeliveryCard", cart);
// }




const modalBody = document.querySelector(".modal-body");
const modalPrice = document.querySelector(".modal-pricetag");
const buttonClearCart = document.querySelector(".clear-cart");
// база данных
const getData = async function (url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка по адрессу ${url}, 
    статус ошибка ${response.status}!`);
  }

  return await response.json();
};
getData("./db/partners.json");

//name validation
const valid = (str) => {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
};

function toggleModal() {
  modal.classList.toggle("is-open");
}

// open/close modal authorized
function toggleModalAuth() {
  loginInput.style.borderColor = "";
  modalAuth.classList.toggle("is-open");
}

function returnMain() {
  containerPromo.classList.remove("hide");
  restaurants.classList.remove("hide");
  menu.classList.add("hide");
}

// если правильно заполнена форма авторизации
function authorized() {
  function logOut() {
    login = "";
    localStorage.removeItem("AuthorizedUser");
    buttonAuth.style.display = "";
    userName.style.display = "";
    buttonOut.style.display = "";
    cartButton.style.display = "";
    buttonOut.removeEventListener("click", logOut);
    checkAuth();
    returnMain();
  }

  userName.textContent = login;
  buttonAuth.style.display = "none";
  userName.style.display = "inline";
  buttonOut.style.display = "flex";
  cartButton.style.display = "flex";
  buttonOut.style.backgroundColor = "green";

  buttonOut.addEventListener("click", logOut);
}

// если не правильно заполнена форма авторизации
function notAuthorized() {
  function logIn(event) {
    event.preventDefault();

    if (valid(loginInput.value)) {
      login = loginInput.value;

      localStorage.setItem("AuthorizedUser", login);

      toggleModalAuth();

      buttonAuth.removeEventListener("click", toggleModalAuth);
      closeAuth.removeEventListener("click", toggleModalAuth);
      logInForm.removeEventListener("submit", logIn);

      logInForm.reset();

      checkAuth();
    } else {
      loginInput.style.borderColor = "red";
      // loginInput.value ="";
    }
  }

  buttonAuth.addEventListener("click", toggleModalAuth);
  closeAuth.addEventListener("click", toggleModalAuth);
  logInForm.addEventListener("submit", logIn);
}

// проверка заполнения полей
function checkAuth() {
  if (login) {
    authorized();
  } else {
    notAuthorized();
  }
}
checkAuth();

// создание и вывод карточек на страницу
function createCardRestaurant({
  image,
  kitchen,
  name,
  price,
  stars,
  products,
  time_of_delivery: timeOfDelivery,
}) {
  const card = document.createElement("a");
  card.classList.add("card");
  card.classList.add("card-restaurant");
  card.products = products;
  card.info = [name, price, stars, kitchen];

  card.insertAdjacentHTML(
    "beforeend",
    `
    <!-- card -->
        <img src="${image}" alt="image" class="card-image"/>
        <div class="card-text">
          <div class="card-heading">
            <h3 class="card-title">${name}</h3>
            <span class="card-tag tag">${timeOfDelivery} мин</span>
          </div>
          <!-- /.card-heading -->
          <div class="card-info">
            <div class="rating">
            ${stars}
            </div>
            <div class="price">От ${price} ₽</div>
            <div class="category">${kitchen}</div>
          </div>
          <!-- /.card-info -->
        </div>
        <!-- /.card-text -->
      <!-- /.card -->
  `
  );

  // вывод
  cardsRestaurants.insertAdjacentElement("beforeend", card);
}

function createCardGood({ description, id, image, name, price }) {
  const card = document.createElement("div");

  card.className = "card";

  card.insertAdjacentHTML(
    "beforeend",

    `
    <img src="${image}" alt="${name}" class="card-image" />
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title card-title-reg">${name}</h3>
      </div>
      <div class="card-info">
        <div class="ingredients">${description}</div>
      </div>
      <div class="card-buttons">
        <button class="button button-primary button-add-cart" id="${id}">
          <span class="button-card-text">В корзину</span>
          <span class="button-cart-svg"></span>
        </button>
        <strong class="card-price card-price-bold">${price} ₽</strong>
      </div>
    </div>
  `
  );
  cardsMenu.insertAdjacentElement("beforeend", card);
}

// открывает меню ресторана
function openGoods(e) {
  const target = e.target;

  if (login) {
    const restaurant = target.closest(".card-restaurant");
    // console.log('restaurant: ', restaurant);

    if (restaurant) {
      // const info = restaurant.dataset.info.split(",");

      const [name, price, stars, kitchen] = restaurant.info;

      cardsMenu.textContent = "";
      containerPromo.classList.add("hide");
      restaurants.classList.add("hide");
      menu.classList.remove("hide");

      restaurantTitle.textContent = name;
      rating.textContent = stars;
      minPrice.textContent = `От ${price} ₽`;
      category.textContent = kitchen;

      getData(`./db/${restaurant.products}`).then(function (data) {
        data.forEach(createCardGood);
      });
    }
  } else {
    toggleModalAuth();
  }
}

function addToCart(event) {
  let target = event.target;
  // console.log('target: ', target);

  const buttonAddToCart = target.closest(".button-add-cart");
  // console.log('buttonAddToCart: ', buttonAddToCart);
  if (buttonAddToCart) {
    const card = target.closest(".card");
    const title = card.querySelector(".card-title-reg").textContent;
    const cost = card.querySelector(".card-price").textContent;
    const id = buttonAddToCart.id;

    const food = cart.find(function (item) {
      return item.id === id;
    });

    if (food) {
      food.count += 1;
    } else {
      cart.push({
        id,
        title,
        cost,
        count: 1,
      });
    }
  }

  // saveCart()
}

function renderCart() {
  modalBody.textContent = "";

  cart.forEach(function ({ id, title, cost, count }) {
    const itemCart = `
    <div class="food-row">
			<span class="food-name">${title}</span>
			<strong class="food-price">${cost} ₽</strong>
			<div class="food-counter">
				<button class="counter-button counter-minus" data-id=${id}>-</button>
				<span class="counter">${count}</span>
				<button class="counter-button counter-plus" data-id=${id}>+</button>
			</div>
		</div>
    `;

    modalBody.insertAdjacentHTML("afterbegin", itemCart);
  });

  const totalPrice = cart.reduce(function (result, item) {
    return result + parseFloat(item.cost) * item.count;
  }, 0);

  modalPrice.textContent = totalPrice + " ₽";
}

function changeCount(event) {
  const target = event.target;

  if (target.classList.contains("counter-button")) {
    const food = cart.find(function (item) {
      return item.id === target.dataset.id;
    });

    if (target.classList.contains("counter-minus")) {
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(food), 1);
      }
    }
    if (target.classList.contains("counter-plus")) {
      food.count++;
    }
    renderCart();
  }


}

// если понадобиться перезапустить все вызовы
// перезапустим init();
// для этого она создана
function init() {
  getData("./db/partners.json").then(function (data) {
    data.forEach(createCardRestaurant);
  });

  cartButton.addEventListener("click", function () {
    renderCart();
    toggleModal();
  });

  buttonClearCart.addEventListener("click", function() {
    cart.length = 0;
    renderCart();
  });
  modalBody.addEventListener("click", changeCount);
  cardsMenu.addEventListener("click", addToCart);
  close.addEventListener("click", toggleModal);

  cardsRestaurants.addEventListener("click", openGoods);

  logo.addEventListener("click", returnMain);

  //поиск
  inputSearch.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
      const target = e.target;
      const value = target.value.toLowerCase().trim();
      target.value = "";

      if (!value || value.length < 3) {
        target.style.backgroundColor = "tomato";
        setTimeout(function () {
          target.style.backgroundColor = "";
        }, 2000);
        return;
      }

      const goods = [];

      getData("./db/partners.json").then(function (data) {
        const products = data.map(function (item) {
          return item.products;
        });
        // console.log(products);
        products.forEach(function (product) {
          getData(`./db/${product}`)
            .then(function (data) {
              // console.log(data);
              goods.push(...data);

              const searchGoods = goods.filter(function (item) {
                return item.name.toLowerCase().includes(value);
              });
              // console.log(searchGoods);

              cardsMenu.textContent = "";
              containerPromo.classList.add("hide");
              restaurants.classList.add("hide");
              menu.classList.remove("hide");

              restaurantTitle.textContent = "Результат поиска";
              rating.textContent = "";
              minPrice.textContent = "";
              category.textContent = "";

              return searchGoods;
            })
            .then(function (data) {
              data.forEach(createCardGood);
            });
        });
      });
    }
  });

  checkAuth();
  // connect swiper slider
  new Swiper(".swiper-container", {
    loop: true,
    autoplay: true,
    speed: 1100,
  });
}
init();
