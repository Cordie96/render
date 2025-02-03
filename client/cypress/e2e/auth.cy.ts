describe('Authentication', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login').as('login');
    cy.intercept('POST', '/api/auth/register').as('register');
  });

  it('handles login flow', () => {
    cy.visit('/login');

    // Test validation
    cy.findByRole('button', { name: /login/i }).click();
    cy.findByText(/email is required/i).should('exist');

    // Test successful login
    cy.findByLabelText(/email/i).type('test@example.com');
    cy.findByLabelText(/password/i).type('Password123!');
    cy.findByRole('button', { name: /login/i }).click();

    cy.wait('@login');
    cy.url().should('equal', Cypress.config().baseUrl + '/');
  });

  it('handles registration flow', () => {
    cy.visit('/register');

    // Fill registration form
    cy.findByLabelText(/username/i).type('testuser');
    cy.findByLabelText(/email/i).type('test@example.com');
    cy.findByLabelText(/password/i).type('Password123!');
    cy.findByLabelText(/confirm password/i).type('Password123!');

    cy.findByRole('button', { name: /register/i }).click();
    cy.wait('@register');

    // Should redirect to login
    cy.url().should('include', '/login');
  });

  it('handles logout', () => {
    // Login first
    cy.login('test@example.com', 'Password123!');
    cy.wait('@login');

    // Logout
    cy.findByText(/logout/i).click();
    cy.url().should('include', '/login');

    // Verify protected route redirect
    cy.visit('/screen');
    cy.url().should('include', '/login');
  });
}); 