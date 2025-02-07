class BoilerplatePage {
  constructor(page) {
    this.page = page;
    this.searchInput = 'input[name="q"]';
    this.searchResults = "#search";
  }

  async goToGoogle(url) {
    await this.page.goto(url);
  }

  async searchFor(query) {
    await this.page.fill(this.searchInput, query);
    await this.page.press(this.searchInput, "Enter");
  }

  async waitForSearchResults() {
    await this.page.waitForSelector(this.searchResults);
  }

  async getPageTitle() {
    return this.page.title();
  }
}

module.exports = BoilerplatePage;
