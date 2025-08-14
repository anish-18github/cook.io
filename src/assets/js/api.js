/**
 * @license MIT
 * @copyright 2025 codegg
 * @author codegg <codegg401@gmail.com>
 */

"use strict";

window.ACCESS_POINT = "https://api.edamam.com/api/recipes/v2";
const /** {String} */ APP_ID = "50f57163";
const /** {String} */ API_KEY = "c3bf804e0992cbb70bcd8e5086880bf9";
const /** {String} */ TYPE = "public";


/**
 * @param {Array} queries Query array
 * @param {Function} successCallback Success callback function
 */

export const fetchData = async function (queries, successCallback) {
    const /** {String} */ query = queries?.join("&")
        .replace(/,/g, "=")
        .replace(/ /g, "%20")
        .replace(/\+/g, "%2B");

    const /** {String} */ url = `${ACCESS_POINT}?app_id=${APP_ID}&app_key=${API_KEY}&type=${TYPE}${query ? `&${query}` : ""}`;

    const /** {Object} */ response = await fetch(url);

    if (response.ok) {
        const data = await response.json();
        successCallback(data);
    }
}