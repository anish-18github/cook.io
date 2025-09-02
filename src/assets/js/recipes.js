/**
 * @license MIT
 * @copyright 2025 codegg
 * @author codegg401@gmail.com
 */

"use strict";

import { fetchData } from "./api.js";
import { $skeletonCard } from "./global.js";
import { getTime } from "./module.js";

/* Accordion */
const accordions = document.querySelectorAll("[data-accordion]");
for (const accordion of accordions) {
    const button = accordion.querySelector("[data-accordion-btn]");
    let isExpanded = false;
    button.addEventListener("click", function () {
        isExpanded = !isExpanded;
        this.setAttribute("aria-expanded", isExpanded);
    });
}

/* Filter bar toggler for mobile screen */
const filterBar = document.querySelector("[data-filter-bar]");
const filterTogglers = document.querySelectorAll("[data-filter-toggler]");
const overlay = document.querySelector("[data-overlay]");
window.addEventOnElements(filterTogglers, "click", function () {
    filterBar.classList.toggle("active");
    overlay.classList.toggle("active");
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = bodyOverflow === "hidden" ? "visible" : "hidden";
});

/* Filter submit and clear */
const filterSubmit = document.querySelector("[data-filter-submit]");
const filterClear = document.querySelector("[data-filter-clear]");
const filterSearch = filterBar.querySelector("input[type='search']");

filterSubmit.addEventListener("click", function () {
    const filterCheckboxes = filterBar.querySelectorAll("input:checked");
    const queries = [];
    const searchValue = filterSearch.value.trim();
    if (searchValue) queries.push(["q", searchValue]);
    if (filterCheckboxes.length) {
        for (const checkbox of filterCheckboxes) {
            const key = checkbox.parentElement.parentElement.dataset.filter;
            queries.push([key, checkbox.value]);
        }
    }
    // Only redirect if there is at least one filter or search value
    if (queries.length) {
        window.location = `?${queries.join("&").replace(/,/g, "=")}`;
    }
    // Otherwise, do nothing (or optionally reload to show all recipes)
});

filterSearch.addEventListener("keydown", e => {
    if (e.key === "Enter") filterSubmit.click();
});

filterClear.addEventListener("click", function () {
    const filterCheckboxes = filterBar.querySelectorAll("input:checked");
    filterCheckboxes?.forEach(elem => elem.checked = false);
    filterSearch.value &&= "";
});

const queryStr = window.location.search.slice(1);
const queries = queryStr ? queryStr.split("&").map(i => i.split("=")) : [];
const filterCount = document.querySelector("[data-filter-count]");
if (queries.length) {
    filterCount.style.display = "block";
    filterCount.innerHTML = queries.length;
} else {
    filterCount.style.display = "none";
}
queryStr && queryStr.split("&").map(i => {
    if (i.split("=")[0] === "q") {
        filterBar.querySelector("input[type='search']").value = i.split("=")[1].replace(/%20/g, " ");
    } else {
        filterBar.querySelector(`[value="${i.split("=")[1].replace(/%20/g, " ")}"]`).checked = true;
    }
});

const filterBtn = document.querySelector("[data-filter-btn]");
window.addEventListener("scroll", () => {
    filterBtn.classList[window.scrollY >= 120 ? "add" : "remove"]("active");
});

/* Request recipes and render */
const gridList = document.querySelector("[data-grid-list]");
const loadMore = document.querySelector("[data-load-more]");
gridList.innerHTML = $skeletonCard.repeat(20);

let nextPageSkip = 0;
let requestedBefore = true;

function filterRecipesClientSide(recipes, queries) {
    if (!queries || !queries.length) return recipes;
    return recipes.filter(recipe => {
        return queries.every(([key, value]) => {
            if (key === "q") {
                const searchVal = value.toLowerCase();
                return recipe.name.toLowerCase().includes(searchVal) ||
                    (recipe.ingredients && recipe.ingredients.join(" ").toLowerCase().includes(searchVal));
            }
            if (Array.isArray(recipe[key])) {
                // Case-insensitive match for arrays
                return recipe[key].some(v => v.toLowerCase() === value.toLowerCase());
            }
            if (typeof recipe[key] === "string") {
                // Case-insensitive match for strings
                return recipe[key].toLowerCase() === value.toLowerCase();
            }
            return recipe[key] === value;
        });
    });
}

const renderRecipes = data => {
    data.recipes.forEach((recipe, index) => {
        const { image, name: title, cookTimeMinutes: cookingTime, id } = recipe;
        const isSaved = window.localStorage.getItem(`cookio-recipe${id}`);
        const card = document.createElement("div");
        card.classList.add("card");
        card.style.animationDelay = `${100 * index}ms`;
        card.innerHTML = `
            <figure class="card-media img-holder">
                <a href="./detail.html?recipe=${id}">
                    <img src="${image}" alt="${title}" class="img-cover" loading="lazy" width="195" height="195">
                </a>
            </figure>
            <div class="card-body">
                <h3 class="title-small">
                    <a href="./detail.html?recipe=${id}" class="card-link">${title ?? "Untitled"}</a>
                </h3>
                <div class="meta-wrapper">
                    <div class="meta-item">
                        <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
                        <span class="label-medium">${getTime(cookingTime).time || "<1"} ${getTime(cookingTime).timeUnit}</span>
                    </div>
                    <button class="icon-btn has-state ${isSaved ? "saved" : "removed"}" aria-label="Add to saved recipes" onclick="saveRecipe(this, '${id}')">
                        <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
                        <span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>
                    </button>
                </div>
            </div>
        `;
        gridList.appendChild(card);
    });
};

function fetchAndRenderRecipes(skip = 0) {
    gridList.innerHTML = $skeletonCard.repeat(20);
    // Always fetch a large batch for client-side filtering
    fetchData("/recipes", { limit: 1000 }, data => {
        gridList.innerHTML = "";
        requestedBefore = false;
        let recipes = data.recipes;
        recipes = filterRecipesClientSide(recipes, queries);
        if (recipes.length) {
            renderRecipes({ recipes });
            nextPageSkip = skip + recipes.length;
        } else {
            loadMore.innerHTML = `<p class="body-medium info-text">No Recipe Found !!!</p>`;
        }
    });
}

fetchAndRenderRecipes();

const CONTAINER_MAX_WIDTH = 1200;
const CONTAINER_MAX_CARD = 6;

window.addEventListener("scroll", async () => {
    if (
        loadMore.getBoundingClientRect().top < window.innerHeight &&
        !requestedBefore
    ) {
        const skeletonCount = Math.round(
            (loadMore.clientWidth / CONTAINER_MAX_WIDTH) * CONTAINER_MAX_CARD
        );
        loadMore.innerHTML = $skeletonCard.repeat(skeletonCount);

        requestedBefore = true;
        fetchData("/recipes", { limit: 100, skip: nextPageSkip }, data => {
            let recipes = data.recipes;
            recipes = filterRecipesClientSide(recipes, queries);
            if (recipes.length) {
                renderRecipes({ recipes });
                nextPageSkip += recipes.length;
                loadMore.innerHTML = "";
                requestedBefore = false;
            } else {
                loadMore.innerHTML = `<p class="body-medium info-text">No more recipes</p>`;
            }
        });
    }
});