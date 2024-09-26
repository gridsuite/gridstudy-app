import { addFolderLabel, createFolderLabel, createStudyLabel, gridExploreUrl } from '../support/constants';
const currentFolder = 'test-studies';
describe('element creation in gridexplore', () => {
    beforeEach(function () {});

    it('create a folder for studies', () => {
        // runs once before all tests in the block
        cy.loginToGridsuite('jamal', 'password', gridExploreUrl);
        cy.visit(gridExploreUrl);
        cy.wait(500);

        cy.get('[aria-label="tests-cy"]').click();
        cy.contains(addFolderLabel).click();
        cy.contains(createFolderLabel).click();
        cy.get('#nameProperty').type(currentFolder);
        cy.get('button').contains('Validate').click();
        cy.intercept('GET', '**/api/gateway/directory/v1/directories/**/elements').as('getElements');
        cy.wait('@getElements').then((interception) => {
            console.log('interception ####### ', interception?.response?.body.elements);
        });
        cy.contains(currentFolder).should('exist');
    });

    it('create a study in new folder', () => {
        cy.loginToGridsuite('jamal', 'password', gridExploreUrl);
        cy.visit(gridExploreUrl);
        cy.wait(500);

        cy.get('[aria-label="tests-cy"]').click();
        cy.contains(currentFolder).click();
        cy.contains(addFolderLabel).click();
        //click on the create study button
        cy.contains(createStudyLabel).click();
        cy.get('input[name=studyName]').type('newStudy');
        cy.get('input[type=file]').attachFile('data-files/MicroGridBE.xiidm');

        cy.get('button').contains('Validate').click();
        //wait for the study to be created
        cy.contains('newStudy').should('exist');
        cy.contains('creation in').should('not.exist');
        cy.contains('upload in').should('not.exist');
        cy.get('[data-testid="PhotoLibraryIcon"]').should('exist');

        // TODO : intercept the query containing the study uuid
        // http://localhost/api/gateway/explore/v1/explore/elements/metadata?ids=8b0eec5e-66c8-423c-a9dc-9cbc6d8c8b23&ids=b38e9420-4e98-4713-8541-510039101fb9
        
        
    });

    it('open a study', () => {
        cy.loginToGridsuite('jamal', 'password', gridExploreUrl);
        cy.visit(gridExploreUrl);
        cy.wait(500);

        cy.get('[aria-label="tests-cy"]').click();
        cy.contains(currentFolder).click();
        cy.contains('newStudy').click().then(() => {
            cy.url().should('include', '/studies/'); // Replace with the actual expected URL
        });

        // cy.loginToGridsuite('jamal', 'password', gridStudyUrl+'studies/37a44f54-e7ba-48ea-96a3-1513431f85bd');
        // cy.visit(gridStudyUrl+'studies/37a44f54-e7ba-48ea-96a3-1513431f85bd');
        // cy.wait(500);
    });

    it('delete a folder', () => {
        cy.get('[aria-label="tests-cy"]').click();
        cy.contains(currentFolder).rightclick();
        cy.contains('Delete').click();
        cy.get('button').contains('Delete').click();
    });
});
