describe('Room Flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login').as('login');
    cy.intercept('POST', '/api/rooms').as('createRoom');
    cy.intercept('GET', '/api/youtube/search').as('searchSongs');
  });

  it('completes full room creation and song queue flow', () => {
    // Login
    cy.login('test@example.com', 'Password123!');
    cy.wait('@login');

    // Create room
    cy.createRoom();
    cy.wait('@createRoom');

    // Search and add songs
    cy.addToQueue('Test Song');
    cy.wait('@searchSongs');

    // Verify queue
    cy.findByText('Test Song').should('exist');
    cy.findByText(/now playing/i).should('not.exist');

    // Start playback
    cy.findByRole('button', { name: /play/i }).click();
    cy.findByText(/now playing/i).should('exist');
  });

  it('handles device pairing through QR code', () => {
    // Setup mock for QR code scanning
    cy.intercept('POST', '/api/rooms/join', {
      statusCode: 200,
      body: { roomId: 'test-room-id' },
    }).as('joinRoom');

    // Login on first device
    cy.login('test@example.com', 'Password123!');
    cy.createRoom();

    // Get room QR code
    cy.get('[data-testid="qr-code"]')
      .should('be.visible')
      .then(($qr) => {
        // Simulate scanning QR code on second device
        const roomId = $qr.attr('data-room-id');
        
        // Open new window for remote device
        cy.window().then((win) => {
          win.open('/remote', '_blank');
        });

        // Switch to remote window
        cy.window().then((win) => {
          const remote = win.open('/remote');
          cy.wrap(remote).as('remoteWindow');
        });

        // Join room in remote window
        cy.get('@remoteWindow').then((remote: any) => {
          cy.wrap(remote)
            .findByText(/scan qr code/i)
            .click();
          
          cy.wrap(remote)
            .findByText(/connected to room/i)
            .should('exist');
        });
      });
  });

  it('synchronizes queue between devices', () => {
    // Login and create room
    cy.login('test@example.com', 'Password123!');
    cy.createRoom();

    // Add song from main device
    cy.addToQueue('First Song');

    // Open remote window
    cy.window().then((win) => {
      win.open('/remote', '_blank');
    });

    // Verify song appears in remote
    cy.get('@remoteWindow').then((remote: any) => {
      cy.wrap(remote)
        .findByText('First Song')
        .should('exist');

      // Add song from remote
      cy.wrap(remote).addToQueue('Second Song');
    });

    // Verify both songs appear in main window
    cy.findByText('First Song').should('exist');
    cy.findByText('Second Song').should('exist');
  });

  it('handles error states gracefully', () => {
    // Test network error
    cy.intercept('GET', '/api/youtube/search', {
      statusCode: 500,
      body: { error: 'Server error' },
    }).as('searchError');

    cy.login('test@example.com', 'Password123!');
    cy.createRoom();

    cy.findByPlaceholderText(/search for songs/i).type('Test Song');
    cy.wait('@searchError');
    cy.findByText(/an error occurred/i).should('exist');

    // Test room closure
    cy.intercept('POST', '/api/rooms/*/close', {
      statusCode: 200,
    }).as('closeRoom');

    cy.findByText(/close room/i).click();
    cy.wait('@closeRoom');
    cy.url().should('equal', Cypress.config().baseUrl + '/');
  });
}); 