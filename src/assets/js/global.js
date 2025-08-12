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