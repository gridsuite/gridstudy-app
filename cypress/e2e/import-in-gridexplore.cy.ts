describe('template spec', () => {
    before(function () {
        const gridExploreUrl = 'http://localhost:3000/';
        // runs once before all tests in the block
        cy.loginToGridsuite('jamal', 'password', gridExploreUrl);
        cy.visit(gridExploreUrl);

        //create a loop to wait for the page to load
        //while (cy.get('button').contains('Connexion').should('not.exist')) {
        cy.wait(500);
        //}
    });
    beforeEach(() => {
        const cookiesToPreserve = ['access_token', 'expires_at', 'id_token', 'profile', 'scope', 'token_type'];
        cookiesToPreserve.forEach((cookie) => {
            cy.getCookie(cookie).then((cookieValue) => {
                if (cookieValue) {
                    cy.setCookie(cookie, cookieValue.value);
                }
            });
        });
    });

    it('create a study', () => {
        const gridExploreUrl = 'http://localhost:3000/';
        cy.visit(gridExploreUrl);
        // cy.get('button').contains('Connexion').should('exist')
        cy.get('[aria-label="tests-cy"]').click();
        //cy.contains('Dossier vide').should('exist')
        //click right on the empty folder
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
        const gridExploreUrl = 'http://localhost:3000/';
        cy.visit(gridExploreUrl);
        cy.contains('newStudy').rightclick();
        cy.contains('Delete').click();
        cy.contains('newStudy').should('not.exist');
    });

    // //CGMES_v2.4.15_RealGridTestConfiguration_v2.zip
    // it('create a cgmes study', () => {
    //   // cy.get('button').contains('Connexion').should('exist')
    //   cy.get('[aria-label="tests-cy"]').click();
    //   cy.get('.ag-header-row').rightclick();
    //   //click on the create study button
    //   cy.contains('Créer une étude').click();
    //   cy.get('input[name=studyName]').type('RealGridTest');
    //   cy.get('input[type=file]').attachFile("data-files/CGMES_v2.4.15_RealGridTestConfiguration_v2.zip");

    //   cy.get('button').contains('Valider').click();
    // })

    it('duplicate studies', () => {
        // cy.get('button').contains('Connexion').should('exist')
        cy.get('[aria-label="tests-cy"]').click();
        const nb = 20;
        for (let i = 0; i < nb; i++) {
            cy.contains('RealGridTest').rightclick();
            cy.contains('Dupliquer').click({ multiple: true, force: true });
        }
    });
});
