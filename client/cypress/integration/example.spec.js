describe('My First Test', () => {
    it('Visits the app and checks the title', () => {
        cy.visit('http://localhost:4200'); // Change this to your app's URL
        cy.title().should('include', 'Your App Title'); // Adjust to your app's title
    });
});