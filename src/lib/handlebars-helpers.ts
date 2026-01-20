/**
 * @file This file registers a set of useful comparison helpers for use in Handlebars templates.
 * These helpers provide basic logical comparisons that are not available by default.
 *
 * - `eq`: Checks for strict equality (`===`).
 * - `gt`: Checks if the first value is greater than the second (`>`).
 * - `gte`: Checks if the first value is greater than or equal to the second (`>=`).
 * - `lt`: Checks if the first value is less than the second (`<`).
 * - `lte`: Checks if the first value is less than or equal to the second (`<=`).
 * - `ne`: Checks for strict inequality (`!==`).
 */

import Handlebars from "handlebars";

Handlebars.registerHelper("eq", function(a, b) {
  return (a === b);
});
Handlebars.registerHelper("gt", function(a, b) {
  return (a > b);
});
Handlebars.registerHelper("gte", function(a, b) {
  return (a >= b);
});
Handlebars.registerHelper("lt", function(a, b) {
  return (a < b);
});
Handlebars.registerHelper("lte", function(a, b) {
  return (a <= b);
});
Handlebars.registerHelper("ne", function(a, b) {
  return (a !== b);
});

