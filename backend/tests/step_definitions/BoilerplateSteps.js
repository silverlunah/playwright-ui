const { Given, When, Then } = require("@cucumber/cucumber");

Given("I open the Google homepage", async function () {
  await this.boilerplatePage.goToGoogle("https://www.google.com");
});

When("I search for {string}", async function (searchQuery) {
  await page.fill('input[name="q"]', searchQuery);
  await page.press('input[name="q"]', "Enter");
});

Then("I should see search results for {string}", async function (searchQuery) {
  await page.waitForSelector("#search");
  const title = await page.title();
  if (!title.includes(searchQuery)) {
    throw new Error(`Search results for "${searchQuery}" not found!`);
  }
  await browser.close();
});
