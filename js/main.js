'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title');
const rating = document.querySelector('.rating');
const minPrice = document.querySelector('.price');
const category = document.querySelector('.category');
const inputSearch = document.querySelector('.input-search');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');
const cart = [];
let login = localStorage.getItem('auth');


const getData = async function (url) {
	const responce = await fetch(url)

	if (!responce.ok) {
		throw new Error(`Ошибка по адресу ${url}, 
		статус ошибки ${responce.status}`)
	}

	return await responce.json();
}


function toggleModal() {

	modal.classList.toggle("is-open");
}

function toggleModalAuth() {
	modalAuth.classList.toggle('is-open');
}

function authorized() {

	function logOut() {
		login = null;
		localStorage.removeItem('auth');
		buttonAuth.style.display = '';
		userName.style.display = '';
		buttonOut.style.display = '';	
		cartButton.style.display = '';
		buttonOut.removeEventListener('click', logOut);
		checkAuth();
	}

	userName.textContent = login;

	buttonAuth.style.display = 'none';
	userName.style.display = 'inline';
	buttonOut.style.display = 'flex';
	cartButton.style.display = 'flex';
	buttonOut.addEventListener('click', logOut);
}

function notAuthorized() {

	function logIn(event) {
		event.preventDefault();
		login = loginInput.value;

		localStorage.setItem('auth', login);

		toggleModalAuth();
		buttonAuth.removeEventListener('click', toggleModalAuth);
		closeAuth.removeEventListener('click', toggleModalAuth);
		logInForm.removeEventListener('submit', logIn);
		logInForm.reset();
		checkAuth();
	}

	buttonAuth.addEventListener('click', toggleModalAuth);
	closeAuth.addEventListener('click', toggleModalAuth);
	logInForm.addEventListener('submit', logIn);
}

function checkAuth() {
	if (login) {
		authorized();
	} else {
		notAuthorized();
	}
}

function createCardRestaurants(restaurant) {

	const {
		image,
		kitchen,
		name,
		price,
		products,
		stars,
		time_of_delivery: timeOfDeleviry
	} = restaurant;

	const card = document.createElement('a');
	card.classList.add('card');
	card.classList.add('card-restaurant');
	card.products = products;
	card.info = [name, price, stars, kitchen];

	card.insertAdjacentHTML('beforeend',
		`
		<img src="${image}" alt="image" class="card-image"/>
		<div class="card-text">
		<div class="card-heading">
			<h3 class="card-title">${name}</h3>
			<span class="card-tag tag">${timeOfDeleviry} мин</span>
		</div>
		<!-- /.card-heading -->
		<div class="card-info">
			<div class="rating">
			${stars}
			</div>
			<div class="price">От ${price} ₽</div>
			<div class="category">${kitchen}</div>
		</div>
		</div>
		`);

	cardsRestaurants.insertAdjacentElement('beforeend', card);

}

function createCardGood({
	description,
	id,
	image,
	name,
	price
}) {
	const card = document.createElement('div');
	card.className = 'card';
	card.id = id;
	card.insertAdjacentHTML('beforeend', `
		<img src="${image}" alt="${name}" class="card-image"/>
		<div class="card-text">
			<div class="card-heading">
				<h3 class="card-title card-title-reg">${name}</h3>
			</div>
			<div class="card-info">
				<div class="ingredients">
				${description}
				</div>
			</div>
			<div class="card-buttons">
				<button class="button button-primary button-add-cart">
					<span class="button-card-text">В корзину</span>
					<span class="button-cart-svg"></span>
				</button>
				<strong class="card-price card-price-bold">${price} ₽</strong>
			</div>
		</div>`);

	cardsMenu.insertAdjacentElement('beforeend', card);
}

function openGoods(event) {
	const target = event.target;
	const restaurant = target.closest('.card-restaurant');

	if (restaurant) {

		if (login) {
			/* 			const info = restaurant.dataset.info.split(','); */
			const [name, price, stars, kitchen] = restaurant.info;

			containerPromo.classList.add('hide');
			restaurants.classList.add('hide');
			menu.classList.remove('hide');

			cardsMenu.textContent = '';
			restaurantTitle.textContent = name;
			rating.textContent = stars;
			minPrice.textContent = 'От' + price + ' ₽';
			category.textContent = kitchen;

			getData(`db/${restaurant.products}`).then(function (data) {
				console.log('data: ', data);
				data.forEach(createCardGood);
			});
		} else {
			toggleModalAuth();
		}
	}
}

function addToCard(event) {
	const target = event.target;

	const buttonAddToCard = target.closest('.button-add-cart');

	if (buttonAddToCard) {
		const card = target.closest('.card');
		const title = card.querySelector('.card-title-reg').textContent;
		const cost = card.querySelector('.card-price').textContent;
		const id = card.id;

		const food = cart.find(function(item) {
			return item.id === id;
		});

		if (food) {
			food.count += 1;
		} else {
			cart.push({
				id,
				title,
				cost,
				count: 1
			});
		}
		console.log(cart);
		
	}


}

function renderCart() {
	modalBody.textContent = '';
	cart.forEach(function({ id, title, cost, count }) {
		const itemCart = `
		<div class="food-row">
			<span class="food-name">${title}</span>
			<strong class="food-price">${cost}</strong>
			<div class="food-counter">
				<button class="counter-button counter-minus" data-id="${id}">-</button>
				<span class="counter">${count}</span>
				<button class="counter-button counter-plus" data-id="${id}">+</button>
			</div>
		</div>
		`;
		modalBody.insertAdjacentHTML('afterbegin', itemCart);
	});

	const totalPrice = cart.reduce(function(result, item) {
		return result + (parseFloat(item.cost) * item.count);
	}, 0);

	modalPrice.textContent = totalPrice + ' ₽';
}

function changeCount(event) {
	const target = event.target;

	if (target.classList.contains('counter-button')) {
		const food = cart.find(function(item) {
				return item.id === target.dataset.id;
			});

		if (target.classList.contains('counter-minus')) {
			food.count--;
			if (food.count === 0) {
				cart.splice(cart.indexOf(food), 1);
			}
		}
		if (target.classList.contains('counter-plus')) food.count++;
		renderCart();
	}
}

function init() {

	getData('db/partners.json').then(function (data) {
		data.forEach(createCardRestaurants);
	});

	checkAuth();
	new Swiper('.swiper-container', {
		loop: true,
		autoplay: true,
	});

	modalBody.addEventListener('click', changeCount);

	buttonClearCart.addEventListener('click', function(){
		cart.length = 0;
		renderCart();
	});

	cartButton.addEventListener("click", function() {
		renderCart();
		toggleModal();
	});
	close.addEventListener("click", toggleModal);
	cardsRestaurants.addEventListener('click', openGoods);
	cardsMenu.addEventListener('click', addToCard);
	inputSearch.addEventListener('keydown', function (event) {
		if (event.keyCode === 13) {

			const target = event.target.value;
			const goods = [];
			getData('db/partners.json').then(function (data) {
				const products = data.map(function (item) {
					return item.products;
				});
				products.forEach(function (product) {
					getData('db/' + product).then(function (data) {
						goods.push(...data);
					});
				});
			})
		}
	});
	logo.addEventListener('click', function () {
		containerPromo.classList.remove('hide');
		restaurants.classList.remove('hide');
		menu.classList.add('hide');
	});
}

init();