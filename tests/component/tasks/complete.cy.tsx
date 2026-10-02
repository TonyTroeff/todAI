import { mountWorkspace, task } from "../../support/tasks";

const toggle = '[aria-label="Mark Buy groceries as completed"]';

describe("Complete tasks", () => {
  it("marks a task completed → fills the tick green, and reverts on a second click", () => {
    cy.intercept("PATCH", "/api/tasks/42", (req) => {
      req.reply({ statusCode: 200, body: task({ completed: req.body.completed }) });
    }).as("toggleTask");
    mountWorkspace([task()]);

    cy.get(toggle).should("have.attr", "aria-pressed", "false").and("have.class", "text-muted");
    cy.get(toggle).click();
    cy.wait("@toggleTask").its("request.body").should("deep.equal", { completed: true });
    cy.get(toggle).should("have.attr", "aria-pressed", "true").and("have.class", "text-success");
    cy.get('section[aria-label="Task list"] li').should("have.attr", "data-completed", "true");

    cy.get(toggle).should("be.enabled").click();
    cy.wait("@toggleTask").its("request.body").should("deep.equal", { completed: false });
    cy.get(toggle).should("have.attr", "aria-pressed", "false").and("have.class", "text-muted");
  });

  it("fails to save → reverts the tick and shows an error", () => {
    cy.intercept("PATCH", "/api/tasks/42", { statusCode: 500, body: {} }).as("toggleTask");
    mountWorkspace([task()]);
    cy.get(toggle).click();
    cy.wait("@toggleTask");
    cy.get(toggle).should("have.attr", "aria-pressed", "false");
    cy.get('[role="alert"]').should("contain.text", "Unable to update the task.");
  });
});
