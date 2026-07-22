export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("script.js");

  eleventyConfig.addCollection("articles", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("content/articles/*.md")
      .sort((articleA, articleB) => articleB.date - articleA.date)
  );

  eleventyConfig.addFilter("readableDate", (dateValue) =>
    new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      timeZone: "UTC",
      year: "numeric"
    }).format(new Date(dateValue))
  );

  eleventyConfig.addFilter("shortDate", (dateValue) =>
    new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
      year: "numeric"
    }).format(new Date(dateValue))
  );

  eleventyConfig.addFilter("isoDate", (dateValue) =>
    new Date(dateValue).toISOString().slice(0, 10)
  );

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["html", "md", "njk"]
  };
}
