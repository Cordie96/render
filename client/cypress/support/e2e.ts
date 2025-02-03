import '@testing-library/cypress/add-commands';
import './commands';

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createRoom(): Chainable<void>;
      addToQueue(songTitle: string): Chainable<void>;
    }
  }
} 