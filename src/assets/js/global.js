/**
 * @license MIT
 * @copyright 2025 codegg
 * @author codegg <codeegg401@gmail.com>
 */

"use strict";




/**
 * Add event on multiple elements
 * 
 * @param {NodeList} $elements NodeList
 * @param {string} eventType Event type string 
 * @param {Function} callback callback function
 */

window.addEventOnElements = ($elements, eventType, callback) => {
    for (const $element of $elements) {
        $element.addEventListener(eventType, callback);
    }
}



// export const /** {Array} */ cardQueries = [
//     ["field", "url"],
//     ["field", "label"],
//     ["field", "image"],
//     ["field", "totalTime"]
// ];

/**
 * skeleton
 */

export const /** {String} */ $skeletonCard = `
    <div class="card skeleton-card">

        <div class="skeleton card-banner"></div>

        <div class="card-body">
            <div class="skeleton card-title"></div>

            <div class="skeleton card-text"></div>
        </div>

    </div>
`

// SAVE RECIPE

const /** {String} */ ROOT = "https://dummyjson.com/recipes";

window.saveRecipe = function (element, recipeId) {
    const /** {String} */ storageKey = `cookio-recipe${recipeId}`;
    const /** {String} */ isSaved = window.localStorage.getItem(storageKey);

    if (!isSaved) {

        fetch(`${ROOT}/${recipeId}`)
            .then(response => response.json())
            .then(data => {

                // Save to localstorage
                window.localStorage.setItem(storageKey, JSON.stringify(data));

                // Update UI
                element.classList.toggle("saved");
                element.classList.toggle("removed");

                // Show notification
                showNotification("Addedd to Recipe book");
            })
            .catch(error => console.error("Error fetching recipe:", error));
    } else {
        // Remove from localStorage
        window.localStorage.removeItem(storageKey);

        // Update UI
        element.classList.toggle("saved");
        element.classList.toggle("removed");

        // Show notification
        showNotification("Removed from Recipe book");
    }
};



const /** {NodeElement} */ $snackbarContainer = document.createElement("div");
$snackbarContainer.classList.add("snackbar-container");
document.body.appendChild($snackbarContainer);

function showNotification(message) {
    const /** {NodeElement} */ $snackbar = document.createElement("div");
    $snackbar.classList.add("snackbar");
    $snackbar.innerHTML = `<p class="body-medium">${message}</p>`;
    $snackbarContainer.appendChild($snackbar);
    $snackbar.addEventListener("animationend", e => $snackbarContainer.removeChild($snackbar));

}