const FILTER = {
  POPULARITY: "sort-by-popularity",
  TODAYS_PICK: "todays-pick",
  TRENDING: "trending",
};
let selectedCategory = {};
const categories = document.getElementsByClassName("category");
const modalContainer = document.getElementById("modal-container");
const modal = document.querySelector("#modal-container .wrapper .modal");
const loadingWrapper = document.querySelector(".loading-wrapper");
const mainLoader = document.querySelector(".profile-main-loader");
const cards = document.getElementById("cards");
let apiURL = "";
let savedArticles = [];

const handleCategoryClick = (event) => {
  // deactivate the active filter effect;
  const activeButton = document.querySelector(".filter.btn.active");
  if (activeButton) activeButton.classList.remove("active");

  const prevActiveCategory = document.querySelector(".category.active");
  if (prevActiveCategory) prevActiveCategory.classList.remove("active");

  event.target.classList.add("active");
  const categoryID = event.target.getAttribute("data-category-id");
  const categoryName = event.target.innerText;
  toggleSpinner(true);
  fetchArticles(categoryID, categoryName);
};

const getCategories = async () => {
  const API_URL = "https://openapi.programming-hero.com/api/news/categories";
  try {
    const res = await fetch(API_URL);
    const {
      data: { news_category },
    } = await res.json();
    displayCategories(news_category);
  } catch (error) {
    console.log(error);
  }
};

const displayCategories = (categories) => {
  const categoryContainer = document.querySelector(".category-container");
  categories.forEach((category, i) => {
    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("data-category-id", category.category_id.toString());
    btn.classList.add("btn", "category");
    if (i === 7) {
      btn.classList.add("active");
      fetchArticles(category.category_id, category.category_name);
    }
    btn.onclick = handleCategoryClick;
    btn.innerText = category.category_name;
    categoryContainer.appendChild(btn);
  });
};

const fetchArticles = async (categoryID, categoryName) => {
  selectedCategory.id = categoryID;
  selectedCategory.name = categoryName;
  const API_URL = `https://openapi.programming-hero.com/api/news/category/${categoryID}`;
  try {
    const res = await fetch(API_URL);
    const { data } = await res.json();
    savedArticles = data;
    displayTotalResults(data.length, categoryName);
    displayArticles();
  } catch (error) {
    console.log(error);
  }
};

const displayTotalResults = (totalArticles, categoryName) => {
  const totalResults = document.querySelector(".total-results");
  // console.log(totalResults);
  totalResults.innerText = `Total ${totalArticles} news found for category ${categoryName}`;
};

const displayArticles = (sortBy = FILTER.POPULARITY) => {
  let articles = [];

  if (sortBy === FILTER.POPULARITY) {
    articles = savedArticles.sort((a, b) => b.total_view - a.total_view);
  } else if (sortBy === FILTER.TODAYS_PICK) {
    articles = savedArticles.filter(
      (article) => article.others_info.is_todays_pick
    );
  } else if (sortBy === FILTER.TRENDING) {
    articles = savedArticles.filter(
      (article) => article.others_info.is_trending
    );
  }
  const zeroResults = document.querySelector(".zero-result");
  cards.innerHTML = "";
  if (articles.length === 0) {
    zeroResults.style.display = "flex";
    toggleSpinner(false);
    return;
  }
  zeroResults.style.display = "none";
  articles.forEach(
    ({
      _id,
      rating: { number },
      total_view,
      title,
      author: { name, published_date, img },
      image_url,
      thumbnail_url,
      details,
    }) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
    <div class="thumbnail">
            <img
              src="${thumbnail_url}"
              alt="thumbnail"
            />
          </div>
          <div class="card-content">
            <div class="card-header">
              <h3 onclick="fetchArticle('${_id}')" class="title">
                ${title}
              </h3>
            </div>
            <div class="card-body">
              <p class="desc">
                ${details}
              </p>
            </div>
            <div class="card-footer">
              <div class="author">
                <div class="avatar">
                  <img src="${img}" />
                </div>

                <div>
                  <p class="name">${name ? name : "Unknown Author"}</p>
                  <p><i class="fa-solid fa-calendar-days"color="red"></i> <span class="date">${
                    published_date ? published_date.split(" ")[0] : "Unknown"
                  }</span></p>
                </div>

              </div>
              <div class="views">
                    <div class="rating">
                      ${displayRating(number)}
                    </div>
                    <div><i class="fa-regular fa-eye"></i>${
                      total_view ? total_view + " K" : "Unknown"
                    }</div>
              </div>
              <div class="read-more">
                  <button onclick="fetchArticle('${_id}')" class="btn">Read More <i class="fa-solid fa-arrow-right"></i> </button>
              </div>
              
            </div>
          </div>
    `;
      cards.appendChild(card);
    }
  );
  toggleSpinner(false);
};

const fetchArticle = async (newsID) => {
  modalContainer.style.opacity = 1;
  modalContainer.style.pointerEvents = "auto";
  modal.style.transform = "scale(1)";
  modal.innerHTML = "";
  const NEWS_API_URL = `https://openapi.programming-hero.com/api/news/${newsID}`;
  try {
    const res = await fetch(NEWS_API_URL);
    const {
      data: [article],
    } = await res.json();
    openArticle(article);
  } catch (error) {
    console.log(error);
  }
};

const openArticle = ({
  rating: { number },
  total_view,
  title,
  author: { name, published_date, img },
  image_url,
  details,
}) => {
  modal.innerHTML = `
  <button onclick="closeArticle()" class="btn modal-close-btn">
              <i class="fa-solid fa-xmark"></i>
  </button>
  <div class="left-content">
              <div class="author">
                <div class="avatar">
                  <img
                    src="${img}"
                    alt="author"
                  />
                </div>
                <div class="name">${name ? name : "Unknown"}</div>
              </div>
              <div class="block">
                <i
                  class="fa-solid fa-calendar-days"
                  style="font-size: 1.5rem"
                ></i>
                <p class="date">${published_date}</p>
              </div>
              <div class="block">
                <i class="fa-regular fa-eye" style="font-size: 1.5rem"></i>
                <p>${total_view ? total_view + " K" : "Unknown"}</p>
              </div>
              <div class="block">
                <span class="star"><i class="fa-solid fa-star"></i></span
                ><span class="star"><i class="fa-solid fa-star"></i></span
                ><span class="star"><i class="fa-solid fa-star"></i></span
                ><span class="star"><i class="fa-solid fa-star"></i></span
                ><span class="star"
                  ><i class="fa-regular fa-star-half-stroke"></i
                ></span>
              </div>
  </div>

  <div class="content">
              <div class="image-container">
                <img
                  src="${image_url}"
                  alt="thumbnail"
                />
              </div>
              <h4 class="title">
                ${title}
              </h4>
              <div class="info">
                <div class="author">
                  <div class="avatar">
                    <img
                      src="${img}"
                      alt=""
                    />
                  </div>
                  <div>
                    <div class="name">${name ? name : "Unknown Author"}</div>
                    <p class="date"><i class="fa-solid fa-calendar-days"color="red"></i> <span>${published_date}</span></p>
                  </div>

                  <div class="views">
                    <div class="rating">
                      ${displayRating(number)}
                    </div>
                    <div><i class="fa-regular fa-eye"></i>${
                      total_view ? total_view + " K" : "Unknown"
                    }</div>
                  </div>
                </div>
              </div>
              <p class="desc">
                ${details}
              </p>
            </div>
  `;
};

const closeArticle = () => {
  modalContainer.style.opacity = 0;
  modalContainer.style.pointerEvents = "none";
  modal.style.transform = "scale(0)";
};

const toggleSpinner = (isLoading) => {
  if (isLoading) {
    loadingWrapper.classList.add("active");
    mainLoader.classList.add("active");
    cards.innerHTML = "";
  } else {
    loadingWrapper.classList.remove("active");
    mainLoader.classList.remove("active");
  }
};

const displayRating = (value) => {
  // value = parseFloat(value);
  let string = "";
  for (let i = 1; i <= 5; i++) {
    if (i < value) {
      string += `<span class="star"><i class="fa-solid fa-star"></i></span>`;
    } else {
      if (i === Math.ceil(value)) {
        string += `<span class="star"><i class="fa-regular fa-star-half-stroke"></i
      ></span>`;
      } else {
        string += `<span class="star"><i class="fa-regular fa-star"></i></span>`;
      }
    }
  }
  return string;
};

const filterArticle = (event, filter) => {
  const activeButton = document.querySelector(".filter.btn.active");
  if (activeButton) activeButton.classList.remove("active");
  // console.log(activeButton);
  event.target.classList.add("active");
  // console.log(event.target.parentElement.children);
  displayArticles(filter);
};
