/**
 * @type {import('workbox-build').GenerateSWOptions}
 */
module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{css,js,jpeg,ico,html,png,json}"],
  swDest: "dist/service-worker.js",
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  globIgnores: ["service-worker.js"],
  sourcemap: false,
  clientsClaim: true,
  skipWaiting: true,
  navigateFallback: "index.html",
};
