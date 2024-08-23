/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const network_modifications_locale_en = {
    'network_modifications.modificationsCount':
        '{hide, select, false {{count, plural, =0 {no modification} =1 {{count} modification} other {{count} modifications}}} other {...}}',
    'network_modifications.EQUIPMENT_DELETION': 'Deletion of {computedLabel}',
    'network_modifications.BY_FILTER_DELETION': 'By filter deletion ({computedLabel})',
    'network_modifications.SUBSTATION_CREATION': 'Creating substation {computedLabel}',
    'network_modifications.SUBSTATION_MODIFICATION': 'Modifying substation {computedLabel}',
    'network_modifications.VOLTAGE_LEVEL_CREATION': 'Creating voltage level {computedLabel}',
    'network_modifications.VOLTAGE_LEVEL_MODIFICATION': 'Modifying voltage level {computedLabel}',
    'network_modifications.LINE_SPLIT_WITH_VOLTAGE_LEVEL': 'Splitting a line {computedLabel}',
    'network_modifications.LINE_ATTACH_TO_VOLTAGE_LEVEL': 'Attaching line {computedLabel}',
    'network_modifications.LINES_ATTACH_TO_SPLIT_LINES': 'Attaching lines to splitting lines {computedLabel}',
    'network_modifications.LOAD_SCALING': 'Load scaling {computedLabel}',
    'network_modifications.DELETE_VOLTAGE_LEVEL_ON_LINE': 'Deleting a voltage level on a line {computedLabel}',
    'network_modifications.DELETE_ATTACHING_LINE': 'Deleting attaching line {computedLabel}',
    'network_modifications.LOAD_CREATION': 'Creating load {computedLabel}',
    'network_modifications.LOAD_MODIFICATION': 'Modifying load {computedLabel}',
    'network_modifications.BATTERY_CREATION': 'Creating battery {computedLabel}',
    'network_modifications.BATTERY_MODIFICATION': 'Modifying battery {computedLabel}',
    'network_modifications.GENERATOR_CREATION': 'Creating generator {computedLabel}',
    'network_modifications.GENERATOR_MODIFICATION': 'Modifying generator {computedLabel}',
    'network_modifications.LINE_CREATION': 'Creating line {computedLabel}',
    'network_modifications.LINE_MODIFICATION': 'Modifying line {computedLabel}',
    'network_modifications.TWO_WINDINGS_TRANSFORMER_CREATION': 'Creating 2 windings transformer {computedLabel}',
    'network_modifications.TWO_WINDINGS_TRANSFORMER_MODIFICATION': 'Modifying 2 windings transformer {computedLabel}',
    'network_modifications.OPERATING_STATUS_MODIFICATION':
        '{action, select, TRIP {Trip {computedLabel}} LOCKOUT {Lock out {computedLabel}} ENERGISE_END_ONE {Energise {computedLabel} on {energizedEnd}} ENERGISE_END_TWO {Energise {computedLabel} on {energizedEnd}} SWITCH_ON {Switch on {computedLabel}} other {Equipment operating status modification {computedLabel}}}',
    'network_modifications.SHUNT_COMPENSATOR_CREATION': 'Creating shunt compensator {computedLabel}',
    'network_modifications.SHUNT_COMPENSATOR_MODIFICATION': 'Modifying shunt compensator {computedLabel}',
    'network_modifications.GENERATOR_SCALING': 'Generator scaling {computedLabel}',
    'network_modifications.VSC_CREATION': 'Creating HVDC (VSC) {computedLabel}',
    'network_modifications.VSC_MODIFICATION': 'Modifing HVDC (VSC) {computedLabel}',
    'network_modifications.GROOVY_SCRIPT': 'Modification by script',
    'network_modifications.EQUIPMENT_ATTRIBUTE_MODIFICATION':
        '{equipmentAttributeName, select, open {{equipmentAttributeValue, select, true {Open {computedLabel}} other {Close {computedLabel}}}} other {Equipment modification {computedLabel}}}',
    'network_modifications.creatingModification': 'Creating modification ...',
    'network_modifications.deletingModification': 'Deleting modification ...',
    'network_modifications.updatingModification': 'Updating modification ...',
    'network_modifications.stashingModification': 'Stashing modification ...',
    'network_modifications.restoringModification': 'Restoring modification ...',
    'network_modifications.modifications': 'Updating modification list ...',
    'network_modifications.GENERATION_DISPATCH': 'Generation dispatch {computedLabel}',
    'network_modifications.VOLTAGE_INIT_MODIFICATION': 'Voltage profile initialization {computedLabel}',
    'network_modifications.TABULAR_MODIFICATION': 'Tabular modification - {computedLabel}',
    'network_modifications.tabular.GENERATOR_MODIFICATION': 'generator modifications',
    'network_modifications.tabular.LOAD_MODIFICATION': 'load modifications',
    'network_modifications.BY_FORMULA_MODIFICATION': 'By formula modification {computedLabel}',
    'network_modifications.tabular.LINE_MODIFICATION': 'line modifications',
    'network_modifications.tabular.BATTERY_MODIFICATION': 'battery modifications',
    'network_modifications.tabular.VOLTAGE_LEVEL_MODIFICATION': 'voltage level modifications',
    'network_modifications.tabular.TWO_WINDINGS_TRANSFORMER_MODIFICATION': 'two windings transformer modifications',
    'network_modifications.tabular.SHUNT_COMPENSATOR_MODIFICATION': 'linear shunt compensator modifications',
    'network_modifications.tabular.SUBSTATION_MODIFICATION': 'substation modifications',
    'network_modifications.TABULAR_CREATION': 'Tabular creation - {computedLabel}',
    'network_modifications.tabular.GENERATOR_CREATION': 'generator creations',
};

export default network_modifications_locale_en;
