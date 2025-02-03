describe('Queue Management', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login').as('login');
    cy.intercept('GET', '/api/youtube/search').as('search');
    cy.intercept('POST', '/api/rooms/*/queue').as('addToQueue');
    cy.intercept('DELETE', '/api/rooms/*/queue/*').as('removeFromQueue');
    
    cy.login('test@example.com', 'Password123!');
    cy.wait('@login');
    cy.createRoom();
  });

  it('handles queue operations', () => {
    // Search and add song
    cy.findByPlaceholderText(/search/i).type('Test Song');
    cy.wait('@search');
    cy.findByText(/add to queue/i).first().click();
    cy.wait('@addToQueue');

    // Verify song in queue
    cy.findByText('Test Song').should('exist');

    // Remove song
    cy.findByText(/remove/i).click();
    cy.wait('@removeFromQueue');
    cy.findByText('Test Song').should('not.exist');
  });

  it('handles queue reordering', () => {
    // Add multiple songs
    ['First Song', 'Second Song', 'Third Song'].forEach(song => {
      cy.addToQueue(song);
    });

    // Verify initial order
    cy.get('[data-testid="queue-item"]').then($items => {
      expect($items.eq(0)).to.contain('First Song');
      expect($items.eq(1)).to.contain('Second Song');
      expect($items.eq(2)).to.contain('Third Song');
    });

    // Drag and drop to reorder
    cy.get('[data-testid="queue-item"]')
      .first()
      .drag('[data-testid="queue-item"]')
      .last();

    // Verify new order
    cy.get('[data-testid="queue-item"]').then($items => {
      expect($items.eq(0)).to.contain('Second Song');
      expect($items.eq(1)).to.contain('Third Song');
      expect($items.eq(2)).to.contain('First Song');
    });
  });
}); 