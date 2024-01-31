/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const dynamic_mapping_models_en = {
    // --- models --- //
    'models/GeneratorSynchronousThreeWindings':
        'Generator Synchronous Three Windings',
    'models/GeneratorSynchronousFourWindings':
        'Generator Synchronous Four Windings',
    'models/GeneratorSynchronousThreeWindingsProportionalRegulations':
        'Generator Synchronous Three Windings Proportional Regulations',
    'models/GeneratorSynchronousFourWindingsProportionalRegulations':
        'Generator Synchronous Four Windings Proportional Regulations',
    'models/GeneratorPQ': 'Generator PQ',
    'models/GeneratorPV': 'Generator PV',
    'models/LoadAlphaBeta': 'Load Alpha Beta',
    'models/LoadPQ': 'Load PQ',
    'models/CurrentLimitAutomaton': 'Current Limit Automaton',
    'models/TapChangerBlockingAutomaton': 'TapChanger Blocking Automaton',
    'models/StaticVarCompensator': 'Static Var Compensator',
    'models/DefaultBus': 'Default Bus',

    // --- variables --- //
    // Generator
    'variables/generator_omegaPu': 'generator omegaPu',
    'variables/generator_PGen': 'generator P Gen',
    'variables/generator_PGenPu': 'generator P Gen Pu',
    'variables/generator_QGen': 'generator Q Gen',
    'variables/generator_QGenPu': 'generator Q Gen Pu',
    'variables/generator_running_value': 'generator running value',
    'variables/generator_UStatorPu': 'generator U Stator Pu',
    'variables/voltageRegulator_EfdPu': 'voltage Regulator Efd Pu',

    // Load
    'variables/load_PPu': 'load P Pu',
    'variables/load_PRefPu': 'load P Ref Pu',
    'variables/load_QPu': 'load Q Pu',
    'variables/load_QRefPu': 'load Q Ref Pu',
    'variables/load_running_value': 'load running value',

    // Bus
    'variables/U_value': 'U value',
    'variables/Upu_value': 'Upu value',
    'variables/phi_value': 'phi value',

    // StaticVarCompensator
    'variables/SVarC_injector_BPu': 'SVarC injector B Pu',
    'variables/SVarC_injector_PInjPu': 'SVarC injector P Inj Pu',
    'variables/SVarC_injector_QInjPu': 'SVarC injector Q Inj Pu',
    'variables/SVarC_injector_UPu': 'SVarC injector U Pu',
    'variables/SVarC_modeHandling_mode_value': 'SVarC mode Handling mode value',

    // --- variableSets --- //
    'variableSets/Generator': 'Generator',
    'variableSets/VoltageRegulator': 'Voltage Regulator',
    'variableSets/GeneratorPQ': 'Generator PQ',
    'variableSets/GeneratorPV': 'Generator PV',
};

export default dynamic_mapping_models_en;
