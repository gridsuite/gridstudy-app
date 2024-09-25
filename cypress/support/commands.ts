/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import 'cypress-file-upload';

declare namespace Cypress {
    interface Chainable<Subject = any> {
        login(username: string, password: string, url: string): Chainable<any>;
        loginToGridsuite(username: string, password: string, url: string): Chainable<any>;
    }
}

Cypress.Commands.add('login', (username: string = 'jamal', password = 'password', url: string) => {
    cy.visit(url);

    cy.wait(5000);

    cy.get('button').contains('Connexion').click();

    // should redirect to http://172.17.0.1:9090/interaction/
    cy.origin('http://172.17.0.1:9090', { args: { username, password } }, ({ username, password }) => {
        cy.get("input[name='login']").focus().type(username);
        cy.get("input[name='password']").focus().type(password);
        cy.get("button[type='submit']").click();

        cy.get('button').contains('Continue').click();
    });

    cy.url().should('equal', url);
});

Cypress.Commands.add('loginToGridsuite', (username: string, password: string, url: string) => {
    const log = Cypress.log({
        displayName: 'AUTH LOGIN',
        message: [`🔐 Authenticating | ${username}`],
        // @ts-ignore
        autoEnd: false,
    });
    log.snapshot('before');

    cy.session(
        `auth0-${username}`,
        () => {
            cy.login(username, password, url);
        },
        {
            validate: () => {
                // Validate presence of access token in localStorage.
                // cy.wrap(localStorage)
                //     .invoke('getItem', 'oidc.hack.authority')
                //     .should('exist');
            },
        }
    );

    log.snapshot('after');
    log.end();
});
