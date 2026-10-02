import "../../src/app/globals.css";

beforeEach(() => {
  // Later, test-specific intercepts take precedence. Unexpected API calls fail
  // immediately rather than reaching a real backend or silently returning 404.
  cy.intercept("/api/**", (request) => {
    throw new Error(`Unmocked API request: ${request.method} ${request.url}`);
  });
});
