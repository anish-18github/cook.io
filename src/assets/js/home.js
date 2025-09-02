/**
 * @license MIT
 * @copyright 2025 codewithsadee
 * @author codegg <codeegg401@gmail.com>
 */

"use strict";


/**
 * Imports
 */

import { fetchData } from "./api.js";
import { $skeletonCard } from "./global.js";
import { getTime } from "./module.js";




/**
 * Home page search
 */

const /** {NodeElement} */ $searchField = document.querySelector("[data-search-field]");
const /** {NodeElement} */ $searchBtn = document.querySelector("[data-search-btn]");

$searchBtn.addEventListener("click", function () {
  if ($searchField.value) window.location = `./recipes.html?q=${$searchField.value}`;
})

/**
 * Search submit when press "Enter" key.
 */

$searchField.addEventListener("keydown", e => {
  if (e.key === "Enter") $searchBtn.click();
})


/**
 * Tab panel navigation
 */

const /** {NodeElement} */ $tabBtns = document.querySelectorAll("[data-tab-btn]");
const /** {NodeElement} */ $tabPanels = document.querySelectorAll("[data-tab-panel]");

let /** {NodeElement} */ $lastActiveTabPanel = $tabPanels[0] || null;
let /** {NodeElement} */ $lastActiveTabBtn = $tabBtns[0] || null;

addEventOnElements($tabBtns, "click", function () {
  if ($lastActiveTabBtn === this) return; // Avoid redundant fetch

  if ($lastActiveTabPanel) $lastActiveTabPanel.setAttribute("hidden", "");
  if ($lastActiveTabBtn) {
    $lastActiveTabBtn.setAttribute("aria-selected", false);
    $lastActiveTabBtn.setAttribute("tabindex", -1);
  }

  const $currentTabPanel = document.querySelector(`#${this.getAttribute("aria-controls")}`);

  if (!$currentTabPanel) {
    console.error("Panel not found for:", this.getAttribute("aria-controls"));
    return;
  }

  $currentTabPanel.removeAttribute("hidden");
  this.setAttribute("aria-selected", true);
  this.setAttribute("tabindex", 0);

  $lastActiveTabPanel = $currentTabPanel;
  $lastActiveTabBtn = this;

  addTabContent(this, $currentTabPanel);
});

// const /** {NodeElement} */ $tabBtns = document.querySelectorAll("[data-tab-btn]");
// const /** {NodeElement} */ $tabPanels = document.querySelectorAll("[data-tab-panel]");

// let /** {NodeElement} */[$lastActiveTabPanel] = $tabPanels;
// let /** {NodeElement} */[$lastActiveTabBtn] = $tabBtns;

// addEventOnElements($tabBtns, "click", function () {
//     $lastActiveTabPanel.setAttribute("hidden", "");
//     $lastActiveTabBtn.setAttribute("aria-selected", false);
//     $lastActiveTabBtn.setAttribute("tabindex", -1);

//     const /** {NodeElement} */ $currentTabPanel = document.querySelector(`#${this.getAttribute("aria-controls")}`);
//     $currentTabPanel.removeAttribute("hidden");
//     this.setAttribute("aria-selected", true);
//     this.setAttribute("tabindex", 0);

//     $lastActiveTabPanel = $currentTabPanel;
//     $lastActiveTabBtn = this;

//     addTabContent(this, $currentTabPanel);
// });

/**
 * Navigate tab with arrow keys
 */

addEventOnElements($tabBtns, "keydown", function (e) {

  const /** {NodeElement} */ $nextElement = this.nextElementSibling;
  const /** {NodeElement} */ $previousElement = this.previousElementSibling;

  if (e.key === "ArrowRight" && $nextElement) {
    this.setAttribute("tabindex", -1)
    $nextElement.setAttribute("tabindex", 0);
    $nextElement.focus();
  } else if (e.key === "ArrowLeft" && $previousElement) {
    this.setAttribute("tabindex", -1);
    $previousElement.setAttribute("tabindex", 0);
    $previousElement.focus();
  } else if (e.key === "Tab") {
    this.setAttribute("tabindex", -1);
    $lastActiveTabBtn.setAttribute("tabindex", 0)
  }
});



/**
 * Work with API
 * fetch data for tab content
 */

const addTabContent = ($currentTabBtn, $currentTabPanel) => {
  const $gridList = document.createElement("div");
  $gridList.classList.add("grid-list");

  // Show skeleton cards while loading
  $currentTabPanel.innerHTML = `
        <div class="grid-list">
            ${$skeletonCard.repeat(12)}
        </div>
    `;

  // Fetch data (example: filter by mealType)
  const mealType = $currentTabBtn.textContent.trim().toLowerCase();

  fetchData(`/recipes/meal-type/${mealType}`, {}, data => {
    console.log(data);

    $currentTabPanel.innerHTML = ""; // clear loading skeletons

    if (data && data.recipes && data.recipes.length > 0) {
      const recipes = data.recipes.slice(0, 12);
      // .filter(recipe => recipe.mealType.some(type => type.toLowerCase() === mealType))


      if (recipes.length === 0) {
        $currentTabPanel.innerHTML = "<p>No recipes found for this category.</p>";
        return;
      }

      recipes.forEach((recipe, i) => {
        const {
          image,
          name: title,
          cookTimeMinutes,
          id
        } = recipe;

        const timeObj = getTime(cookTimeMinutes || 1);
        const /** {undefined || String} */ isSaved = window.localStorage.getItem(`cookio-recipe${id}`)

        const /** {NodeElement} */ $card = document.createElement("div");
        $card.classList.add("card");
        $card.style.animationDelay = `${100 * i}ms`;

        $card.innerHTML = `
                    <figure class="card-media img-holder">
                        <img src="${image}" width="200" height="200" loading="lazy"
                            alt="${title}" class="img-cover">
                    </figure>

                    <div class="card-body">
                        <h3 class="title-small">
                            <a href="./detail.html?id=${id}" class="card-link">${title ?? "Untitled"}</a>
                        </h3>

                        <div class="meta-wrapper">
                            <div class="meta-item">
                                <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
                                <span class="label-medium">${timeObj.time || "<1"} ${timeObj.timeUnit}</span>
                            </div>

                            <button class="icon-btn has-state ${isSaved ? "saved" : "removed"}" aria-label="Add to saved recipes" onclick="saveRecipe(this, '${id}')">
                                <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
                                <span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>
                            </button>
                        </div>
                    </div>
                `;

        $gridList.appendChild($card);
      });

      $currentTabPanel.appendChild($gridList);

      // Add "Show more" button like the tutorial
      $currentTabPanel.innerHTML += `
                <a href="./recipes.html?mealType=${mealType}" class="btn btn-secondary label-large has-state">
                    Show more
                </a>
            `;
    } else {
      $currentTabPanel.innerHTML = "<p>No recipes found.</p>";
    }
  });
};

// Example usage
addTabContent($lastActiveTabBtn, $lastActiveTabPanel);


/** 
 * Fetch data for slider card
 */

let cuisineType = ["Asian", "Italian"];
const sliderSections = document.querySelectorAll("[data-slider-section]");

for (const [index, sliderSection] of sliderSections.entries()) {
  sliderSection.innerHTML = `
    <div class="container">
      <h2 class="section-title headline-small" id="slider-label-${index}">
        Latest ${cuisineType[index]} Recipes
      </h2>
      <div class="slider">
        <ul class="slider-wrapper" data-slider-wrapper>
          ${`<li class="slider-item">${$skeletonCard}</li>`.repeat(10)}
        </ul>
      </div>
    </div>
  `;

  const sliderWrapper = sliderSection.querySelector("[data-slider-wrapper]");

  fetch(`https://dummyjson.com/recipes?limit=200`)
    .then(res => res.json())
    .then(data => {
      sliderWrapper.innerHTML = "";

      // Filter recipes where tags include the current cuisineType
      const filteredRecipes = data.recipes.filter(recipe =>
        recipe.tags.some(tag => tag.toLowerCase() === cuisineType[index].toLowerCase())
      );

      // Duplicate array if less than 10 to fill slider
      const recipesToShow = [];
      while (recipesToShow.length < 10 && filteredRecipes.length > 0) {
        recipesToShow.push(...filteredRecipes);
      }
      const recipes = recipesToShow.slice(0, 10);

      recipes.forEach(item => {
        const { id: recipeId, image, name: title, cookTimeMinutes: cookingTime } = item;
        const isSaved = window.localStorage.getItem(`cookio-recipe${recipeId}`);

        const sliderItem = document.createElement("li");
        sliderItem.classList.add("slider-item");

        sliderItem.innerHTML = `
          <div class="card">
            <figure class="card-media img-holder">
              <a href="./detail.html?recipe=${recipeId}">
                <img src="${image}" 
                     alt="${title}" 
                     class="img-cover"
                     loading="lazy"
                     width="195"
                     height="195">
              </a>
            </figure>

            <div class="card-body">
              <h3 class="title-small">
                <a href="./detail.html?recipe=${recipeId}" class="card-link">
                  ${title ?? "Untitled"}
                </a>
              </h3>

              <div class="meta-wrapper">
                <div class="meta-item">
                  <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
                  <span class="label-medium">${cookingTime || "<1"} min</span>
                </div>

                <button class="icon-btn has-state ${isSaved ? "saved" : "removed"}" 
                        aria-label="Add to saved recipes" 
                        onclick="saveRecipe(this, '${recipeId}')">
                  <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
                  <span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>
                </button>
              </div>
            </div>
          </div>
        `;

        sliderWrapper.appendChild(sliderItem);
      });

      // Show more card
      sliderWrapper.innerHTML += `
        <li class="slider-item" data-slider-item>
          <a href="./recipes.html?search=${cuisineType[index].toLowerCase()}" 
             class="load-more-card has-state">
            <span class="label-large">Show More</span>
            <span class="material-symbols-outlined bookmark-add" aria-hidden="true">navigate_next</span>
          </a>
        </li>
      `;
    })
    .catch(err => console.error("Error fetching slider data:", err));
}
