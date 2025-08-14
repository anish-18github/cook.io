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



export const /** {Array} */ cardQueries = [
    ["field", "url"],
    ["field", "label"],
    ["field", "image"],
    ["field", "totalTime"]
];

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