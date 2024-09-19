/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// Note: Translation keys (not taken into account prefix) come from db of dynamic-mapping-server
const dynamic_mapping_models_en = {
    // --- models --- //
    'models.GeneratorSynchronousThreeWindings': 'Three windings synchronous generator',
    'models.GeneratorSynchronousFourWindings': 'Four windings synchronous generator',
    'models.GeneratorSynchronousThreeWindingsProportionalRegulations':
        'Three windings synchronous generator with proportional regulations',
    'models.GeneratorSynchronousFourWindingsProportionalRegulations':
        'Four windings synchronous generator with proportional regulations',
    'models.GeneratorPQ': 'PQ generator',
    'models.GeneratorPV': 'PV generator',
    'models.LoadAlphaBeta': 'Voltage-dependent load',
    'models.LoadPQ': 'PQ load',
    'models.CurrentLimitAutomaton': 'Current-limiter automaton',
    'models.TapChangerBlockingAutomaton': 'Block tap-changers automaton',
    'models.StaticVarCompensator': 'Static var compensator',
    'models.DefaultBus': 'Bus',

    // --- variables --- //
    // Generator
    'variables.generator_omegaPu': 'Angular frequency in pu (base omegaNom)',
    'variables.generator_PGen': 'Active power in MW',
    'variables.generator_PGenPu': 'Active power in pu',
    'variables.generator_QGen': 'Reactive power in Mvar',
    'variables.generator_QGenPu': 'Reactive power in pu',
    'variables.generator_running_value': 'Running',
    'variables.generator_UStatorPu': 'Stator voltage amplitude in pu (base UNom)',
    'variables.voltageRegulator_EfdPu': 'EfdPu in pu (user-selected base voltage)',

    // Load
    'variables.load_PPu': 'Active power consumed in pu',
    'variables.load_PRefPu': 'Active power consumed at nominal voltage in MW',
    'variables.load_QPu': 'Reactive power consumed in pu',
    'variables.load_QRefPu': 'Reactive power consumed at nominal voltage in Mvar',
    'variables.load_running_value': 'Running',

    // Bus
    'variables.U_value': 'Bus voltage in kV',
    'variables.Upu_value': 'Bus voltage in pu',
    'variables.phi_value': 'Bus phase in degrees',

    // StaticVarCompensator
    'variables.SVarC_injector_BPu': 'Total susceptance in pu (base SNom, UNom)',
    'variables.SVarC_injector_PInjPu': 'Injected P in pu',
    'variables.SVarC_injector_QInjPu': 'Injected Q in pu',
    'variables.SVarC_injector_UPu': 'Nominal voltage in kV',
    'variables.SVarC_modeHandling_mode_value': 'Regulation mode',

    // --- variableSets --- //
    'variableSets.Generator': 'Generator',
    'variableSets.VoltageRegulator': 'Voltage regulator',
    'variableSets.GeneratorPQ': 'PQ generator',
    'variableSets.GeneratorPV': 'PV generator',
};

export default dynamic_mapping_models_en;
