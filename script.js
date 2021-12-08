function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

const sumPriceAndUpdateScreen = async () => {
  const olCartItems = document.querySelectorAll('.cart__item');
  let sumTotalItems = 0;
  olCartItems.forEach((item) => {
    let priceItem = item.innerText;
    const [, price] = priceItem.split('$');
    priceItem = price;
    sumTotalItems += Math.round(priceItem * 100) / 100;
  });
  document.querySelector('.total-price').innerText = sumTotalItems;
};

const saveLocalStorage = () => {
  localStorage.setItem('cart', document.querySelector('.cart__items').innerHTML);
  localStorage.setItem('price', document.querySelector('.total-price').innerText);
};

function cartItemClickListener(event) {
  // event.path[1].removeChild(event.path[0]);
  event.currentTarget.remove();
  sumPriceAndUpdateScreen();
  saveLocalStorage();
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

const findProductCartAPI = (itemId) => {
  const endpoint = `https://api.mercadolibre.com/items/${itemId}`;
  return fetch(endpoint);
};

const addItemCart = (event) => {
  findProductCartAPI(getSkuFromProductItem(event.currentTarget.parentElement))
    .then((response) => response.json())
    .then(({ id, title, price }) => {
      const olCartItems = document.getElementsByClassName('cart__items')[0];
      olCartItems.appendChild(createCartItemElement({ sku: id, name: title, salePrice: price }));
      sumPriceAndUpdateScreen();
      saveLocalStorage();
    });
};

const createDivLoad = () => {
  const divLoad = document.createElement('div');
  divLoad.className = 'loading';
  divLoad.innerText = 'loading...';
  return divLoad;
};

const findProductsAPI = (nameProduct) => {
  const endpoint = `https://api.mercadolibre.com/sites/MLB/search?q=${nameProduct}`;
  return fetch(endpoint);
};

const refreshPage = () => {
  const items = document.querySelector('.items');
  const divLoad = createDivLoad();
  items.appendChild(divLoad);
  findProductsAPI('computador')
    .then((response) => response.json())
    .then((data) => {
      data.results.forEach(({ id, title, thumbnail }) => {
        items.appendChild(createProductItemElement({ sku: id, name: title, image: thumbnail }));
        items.lastElementChild.lastElementChild.addEventListener('click', addItemCart);
      });
      setTimeout(() => {
        items.removeChild(divLoad);
      }, 2000);
    })
    .catch((err) => {
      items.innerHTML = `Oops! ${err}`;
    });
};

const loadStorage = () => {
  if (localStorage.getItem('cart')) {
    const oldCartItems = document.querySelector('.cart__items');
    oldCartItems.innerHTML = localStorage.getItem('cart');
    for (let index = 0; index < oldCartItems.childElementCount; index += 1) {
      oldCartItems.children[index].addEventListener('click', cartItemClickListener);
    }
  }
  if (localStorage.getItem('price')) {
    document.querySelector('.total-price').innerText = localStorage.getItem('price');
  }
};

const emptyCartClickListener = () => {
  document.querySelector('.cart__items').innerHTML = '';
  sumPriceAndUpdateScreen();
  localStorage.removeItem('cart');
  localStorage.removeItem('price');
};

const removeAllCart = () => {
  document.querySelector('.empty-cart').addEventListener('click', emptyCartClickListener);
};

window.onload = () => {
  refreshPage();
  document.querySelector('.cart').appendChild(createCustomElement('div', 'total-price', '0.00'));
  removeAllCart();
  loadStorage();
};
