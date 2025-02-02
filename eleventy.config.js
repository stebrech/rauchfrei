import { EleventyI18nPlugin } from "@11ty/eleventy";

export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "src/assets/js": "/js",
    "src/assets/css": "/css",
    "src/assets/favicon": "/",
    "src/data": "/data",
  });
  eleventyConfig.addWatchTarget("src/**/*.{svg,webp,png,jpeg,css,js}");

  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    locales: ["de", "en"],
    defaultLanguage: "de",
  });
}

export const config = {
  // Control which files Eleventy will process
  // e.g.: *.md, *.njk, *.html, *.liquid
  templateFormats: ["md", "njk", "html", "liquid", "11ty.js"],

  // Pre-process *.md files with: (default: `liquid`)
  markdownTemplateEngine: "njk",

  // Pre-process *.html files with: (default: `liquid`)
  htmlTemplateEngine: "njk",

  // These are all optional:
  dir: {
    input: "src", // default: "."
    includes: "templates", // default: "_includes" (`input` relative)"
    data: "data", // default: "_data" (`input` relative)
    output: "_site",
  },

  // -----------------------------------------------------------------
  // Optional items:
  // -----------------------------------------------------------------

  // If your site deploys to a subdirectory, change `pathPrefix`.
  // Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

  // When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
  // it will transform any absolute URLs in your HTML to include this
  // folder name and does **not** affect where things go in the output folder.

  // pathPrefix: "/",
};
