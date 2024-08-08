/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// Note: Translation keys (not taken into account prefix) come from db of dynamic-mapping-server
const dynamic_mapping_models_fr = {
    // --- models --- //
    'models.GeneratorSynchronousThreeWindings': 'Machine synchrone trois enroulements',
    'models.GeneratorSynchronousFourWindings': 'Machine synchrone quatre enroulements',
    'models.GeneratorSynchronousThreeWindingsProportionalRegulations':
        'Machine synchrone trois enroulements avec régulations proportionnelles',
    'models.GeneratorSynchronousFourWindingsProportionalRegulations':
        'Machine synchrone quatre enroulements avec régulations proportionnelles',
    'models.GeneratorPQ': 'Groupe PQ',
    'models.GeneratorPV': 'Groupe PV',
    'models.LoadAlphaBeta': 'Consommation dépendante à la tension',
    'models.LoadPQ': 'Consommation fixe PQ',
    'models.CurrentLimitAutomaton': 'ADA',
    'models.TapChangerBlockingAutomaton': 'Automate de blocage régleur',
    'models.StaticVarCompensator': 'CSPR',
    'models.DefaultBus': 'Bus',

    // --- variables --- //
    // Generator
    'variables.generator_omegaPu': 'Fréquence angulaire en pu (base omegaNom)',
    'variables.generator_PGen': 'Puissance active en MW',
    'variables.generator_PGenPu': 'Puissance active en pu',
    'variables.generator_QGen': 'Puissance réactive en Mvar',
    'variables.generator_QGenPu': 'Puissance réactive en pu',
    'variables.generator_running_value': 'generator_running_value',
    'variables.generator_UStatorPu': 'Module de la tension stator en pu (base UNom)',
    'variables.voltageRegulator_EfdPu': 'EfdPu en pu (tension de base sélectionnée)',

    // Load
    'variables.load_PPu': 'Puissance active consommée en pu',
    'variables.load_PRefPu': 'Puissance active soutirée à la tension nominale en MW',
    'variables.load_QPu': 'Puissance réactive consommée en pu',
    'variables.load_QRefPu': 'Puissance réactive soutirée à la tension nominale en Mvar',
    'variables.load_running_value': 'load_running_value',

    // Bus
    'variables.U_value': 'Tension du noeud en kV',
    'variables.Upu_value': 'Tension du noeud en pu',
    'variables.phi_value': 'Phase du noeud en degrés',

    // StaticVarCompensator
    'variables.SVarC_injector_BPu': 'Susceptance totale en pu (base SNom, UNom)',
    'variables.SVarC_injector_PInjPu': 'Puissance active injectée en pu',
    'variables.SVarC_injector_QInjPu': 'Puissance réactive injectée en pu',
    'variables.SVarC_injector_UPu': 'Tension nominale en pu',
    'variables.SVarC_modeHandling_mode_value': 'Mode de régulation',

    // --- variableSets --- //
    'variableSets.Generator': 'Groupe',
    'variableSets.VoltageRegulator': 'Régulation de tension',
    'variableSets.GeneratorPQ': 'Groupe PQ',
    'variableSets.GeneratorPV': 'Groupe PV',
};

export default dynamic_mapping_models_fr;
