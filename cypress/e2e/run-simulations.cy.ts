import { studyMicroBEUuid, gridStudyUrl } from '../support/constants';

describe('run simulations', () => {
    beforeEach(function () {
        const gridStudyFullUrl = gridStudyUrl + 'studies/' + studyMicroBEUuid;
        // runs once before all tests in the block
        cy.loginToGridsuite('jamal', 'password', gridStudyFullUrl);
        cy.visit(gridStudyFullUrl);
        cy.wait(500);
    });

    it('run a load flow', () => {
        // wait to make sure map is loaded , intercept the request and wait for it to be done
        // http://localhost:84/api/gateway/study/v1/studies/b38e9420-4e98-4713-8541-510039101fb9/nodes/2619cf5f-16ad-43d2-bf1d-d28f1a95194e/geo-data/lines
        //
        cy.intercept('GET', '**/api/gateway/study/v1/studies/**/nodes/**/geo-data/lines').as('geoData');
        //wait for the geo data to be loaded
        cy.wait('@geoData');
        //
        cy.get('button').contains('N1').click();

        cy.get('button').contains('N1').rightclick();
        cy.contains('new node').click();

        cy.contains('in a new branch').click();

        cy.get('button').contains('N2').click();
        cy.get('[data-testid="EditIcon"]').click();

        cy.get('input[value="N2"]').clear();
        cy.get('input[value=""]').type('tmpNodeForLoadflow');
        cy.get('button').contains('Validate').click();

        cy.get('button').contains('tmpNodeForLoadflow').rightclick();
        cy.contains('Build node').click();
    });

    it('run a security analysis', () => {});
});
