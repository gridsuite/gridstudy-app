
describe('template spec', () => {
    beforeEach(function () {
        const gridExploreUrl = 'http://localhost:3000/';
        // runs once before all tests in the block
        cy.loginToGridsuite('jamal', 'password', gridExploreUrl);
        cy.visit(gridExploreUrl);

        //create a loop to wait for the page to load
        //while (cy.get('button').contains('Connexion').should('not.exist')) {
        cy.wait(500);
        //}
    });

    it('create a folder', () => {
        cy.get('[aria-label="tests-cy"]').click();
        cy.contains('ADD AN ELEMENT').click();
        cy.contains('Create folder').click();
        cy.get('#nameProperty').type('newFolder');
        cy.get('button').contains('Validate').click();
        cy.contains('newFolder').should('exist');
    });

    it('create a study in new folder', () => {
        cy.get('[aria-label="tests-cy"]').click();
        cy.contains('newFolder').click();
        cy.contains('ADD AN ELEMENT').click();
        //click on the create study button
        cy.contains('Create a study').click();
        cy.get('input[name=studyName]').type('newStudy');
        cy.get('input[type=file]').attachFile('data-files/MicroGridBE.xiidm');

        cy.get('button').contains('Validate').click();
        //wait for the study to be created
        cy.contains('newStudy').should('exist');
        cy.contains('creation in').should('not.exist');
        cy.contains('upload in').should('not.exist');
        cy.get('[data-testid="PhotoLibraryIcon"]').should('exist');
    });

    it('delete a study', () => {
        cy.get('[aria-label="tests-cy"]').click();
        cy.get('[aria-label="newFolder"]').click();
        cy.contains('newStudy').rightclick();
        cy.contains('Delete').click();
        cy.get('button').contains('Delete').click();
    });

    it('delete a folder', () => {
        cy.get('[aria-label="tests-cy"]').click();
        cy.contains('newFolder').rightclick();
        cy.contains('Delete').click();
        cy.get('button').contains('Delete').click();
    });
});
