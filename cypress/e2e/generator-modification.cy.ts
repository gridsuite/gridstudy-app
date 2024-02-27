/* eslint-disable no-restricted-globals */

describe('Modification Test', () => {
    before(function () {
        // runs once before all tests in the block
        cy.loginToGridsuite('jamal', 'password');
        cy.visit(
            'http://localhost:3000/studies/89b87a33-bd31-496c-b372-04aaf33af291'
        );

        cy.wait(7000);
    });

    function createModification(type: 'Créer' | 'Modifier', equipment: string) {
        cy.wait(7000);
        cy.get('button').contains('N1').click();

        //add modification
        cy.get('[data-testid="add-modification-icon"]').click();

        //select the modification
        cy.get('li')
            .contains(type)
            .trigger('mouseover')
            .get('li')
            .contains(equipment)
            .click();
    }

    it('should create a generator modification', () => {
        createModification('Modifier', 'Groupe');

        //click to display equipement ids
        cy.get('input[role="combobox"]').click().type('G');
        cy.wait(3000);
        //get a modal that contains "dialog-modification-generator'
        cy.get('[data-cy="equipement-id-selector"]');
        cy.get('[data-cy="equipement-id-selector"]').find('li').first().click();

        cy.get('input[id=Name]').type('newName');
        cy.get('button').contains('Valider').click();
    });

    // it('should create a vsc modification', () => {

    //     createModification('Modifier', 'Groupe');

    //     //click to display equipement ids
    //     cy.get('input[role="combobox"]').click().type('3');
    //     //select equipement with the id: 3a3b27be-b18b-4385-b557-6735d733baf0
    //     cy.get('li').contains('HVDC1').click();

    //     cy.get('input[id=Name]').type('newName');
    //     cy.get('button').contains('Valider').click();
    // });
});
