@suite-1
Feature: Boilerplate

  @test-1
  Scenario: Boilerplate Fail
    Given I open the Google homepage
    When I search for "Playwright"
    Then I should see search results for "Playwright"

  @test-2
  Scenario: Boilerplate Pass
    Given I open the Google homepage