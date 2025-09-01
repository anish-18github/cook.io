/**
 * @license MIT
 * @copyright 2025 codegg
 * @author codegg <codeegg401@gmail.com>
 */

"use strict";

import { fetchData } from "./api.js";
import { $skeletonCard } from "./global.js";
import { getTime } from "./module.js";

/* Accordion */
const $accordions = document.querySelectorAll("[data-accordion]");
const initAccordion = function ($element) {
    const $button = $element.querySelector("[data-accordion-btn]");
    let isExpanded = false;
    $button.addEventListener("click", function () {
        isExpanded = !isExpanded;
        this.setAttribute("aria-expanded", isExpanded);
    });
};
for (const $accordion of $accordions) initAccordion($accordion);

/* Filter bar toggler for mobile screen */
const $filterBar = document.querySelector("[data-filter-bar]");
const $filterTogglers = document.querySelectorAll("[data-filter-toggler]");
const $overlay = document.querySelector("[data-overlay]");
window.addEventOnElements($filterTogglers, "click", function () {
    $filterBar.classList.toggle("active");
    $overlay.classList.toggle("active");
    const bodyOverFlow = document.body.style.overflow;
    document.body.style.overflow = bodyOverFlow === "hidden" ? "visible" : "hidden";
});

/* Filter submit and clear */
const $filterSubmit = document.querySelector("[data-filter-submit]");
const $filterClear = document.querySelector("[data-filter-clear]");
const $filterSearch = $filterBar.querySelector("input[type='search']");

$filterSubmit.addEventListener("click", function () {
    const $filterCheckboxes = $filterBar.querySelectorAll("input:checked");
    const queries = [];
    if ($filterSearch.value) queries.push(["q", $filterSearch.value]);
    if ($filterCheckboxes.length) {
        for (const $checkbox of $filterCheckboxes) {
            const key = $checkbox.parentElement.parentElement.dataset.filter;
            queries.push([key, $checkbox.value]);
        }
    }
    window.location = queries.length ? `?${queries.join("&").replace(/,/g, "=")}` : "/recipes.html";
});

$filterSearch.addEventListener("keydown", e => {
    if (e.key === "Enter") $filterSubmit.click();
});

$filterClear.addEventListener("click", function () {
    const $filterCheckboxes = $filterBar.querySelectorAll("input:checked");
    $filterCheckboxes?.forEach(elem => elem.checked = false);
    $filterSearch.value &&= "";
});

const queryStr = window.location.search.slice(1);
const queriesArr = queryStr && queryStr.split("&").map(i => i.split("="));
const $filterCount = document.querySelector("[data-filter-count]");
if (queriesArr.length) {
    $filterCount.style.display = "block";
    $filterCount.innerHTML = queriesArr.length;
} else {
    $filterCount.style.display = "none";
}
queryStr && queryStr.split("&").map(i => {
    if (i.split("=")[0] === "q") {
        $filterBar.querySelector("input[type='search']").value = i.split("=")[1].replace(/%20/g, " ");
    } else {
        $filterBar.querySelector(`[value="${i.split("=")[1].replace(/%20/g, " ")}"]`).checked = true;
    }
});

const $filterBtn = document.querySelector("[data-filter-btn]");
window.addEventListener("scroll", e => {
    $filterBtn.classList[window.scrollY >= 120 ? "add" : "remove"]("active");
});

/* Request recipes and render */
const $gridList = document.querySelector("[data-grid-list]");
const $loadMore = document.querySelector("[data-load-more]");
$gridList.innerHTML = $skeletonCard.repeat(20);

let nextPageSkip = 0;
let requestedBefore = true;

const renderRecipes = data => {
    data.recipes.forEach((recipe, index) => {
        const {
            image,
            name: title,
            cookTimeMinutes: cookingTime,
            id
        } = recipe;
        const isSaved = window.localStorage.getItem(`cookio-recipe${id}`);
        const $card = document.createElement("div");
        $card.classList.add("card");
        $card.style.animationDelay = `${100 * index}ms`;
        $card.innerHTML = `
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
        $gridList.appendChild($card);
    });
};

function buildQueryParams(queriesArr, skip = 0, limit = 20) {
    const params = { skip, limit };
    if (queriesArr && queriesArr.length) {
        queriesArr.forEach(([key, value]) => {
            if (key === "q") params.search = value;
            else params[key] = value;
        });
    }
    return params;
}

function fetchAndRenderRecipes(skip = 0) {
    $gridList.innerHTML = $skeletonCard.repeat(20);
    const params = buildQueryParams(queriesArr, skip, 20);
    fetchData("/recipes", params, data => {
        $gridList.innerHTML = "";
        requestedBefore = false;
        if (data.recipes.length) {
            renderRecipes(data);
            nextPageSkip = skip + data.recipes.length;
        } else {
            $loadMore.innerHTML = `<p class="body-medium info-text">No Recipe Found !!!</p>`;
        }
    });
}

fetchAndRenderRecipes();

window.addEventListener("scroll", async () => {
    if (
        $loadMore.getBoundingClientRect().top < window.innerHeight &&
        !requestedBefore
    ) {
        $loadMore.innerHTML = $skeletonCard.repeat(6);
        requestedBefore = true;
        fetchData("/recipes", buildQueryParams(queriesArr, nextPageSkip, 20), data => {
            if (data.recipes.length) {
                renderRecipes(data);
                nextPageSkip += data.recipes.length;
                $loadMore.innerHTML = "";
                requestedBefore = false;
            } else {
                $loadMore.innerHTML = `<p class="body-medium info-text">No more recipes</p>`;
            }
        });
    }
});