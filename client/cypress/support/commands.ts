import '@testing-library/cypress/add-commands';

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.findByLabelText(/email/i).type(email);
  cy.findByLabelText(/password/i).type(password);
  cy.findByRole('button', { name: /login/i }).click();
});

Cypress.Commands.add('createRoom', () => {
  cy.findByText(/create room/i).click();
  cy.url().should('include', '/screen');
});

Cypress.Commands.add('addToQueue', (songTitle: string) => {
  cy.findByPlaceholderText(/search for songs/i).type(songTitle);
  cy.findByText(/add to queue/i).click();
  cy.findByText(songTitle).should('exist');
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createRoom(): Chainable<void>;
      addToQueue(songTitle: string): Chainable<void>;
    }
  }
} 