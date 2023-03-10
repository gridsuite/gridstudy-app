/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const EQUIPMENT_ID = 'equipmentId';
export const EQUIPMENT_NAME = 'equipmentName';
export const LOAD_TYPE = 'loadType';
export const ACTIVE_POWER = 'activePower';
export const REACTIVE_POWER = 'reactivePower';

export const CONNECTIVITY = 'connectivity';
export const VOLTAGE_LEVEL = 'voltageLevel';
export const ID = 'id';
export const NAME = 'name';
export const SUBSTATION_ID = 'substationId';
export const NOMINAL_VOLTAGE = 'nominalVoltage';
export const TOPOLOGY_KIND = 'topologyKind';
export const BUS_OR_BUSBAR_SECTION = 'busOrBusbarSection';
export const CONNECTION_DIRECTION = 'connectionDirection';
export const CONNECTION_NAME = 'connectionName';
export const CONNECTION_POSITION = 'connectionPosition';

export const EQUIPMENT = 'equipment';
export const TYPE = 'type';

export const CHARACTERISTICS = 'characteristics';
export const SERIES_RESISTANCE = 'seriesResistance';
export const SERIES_REACTANCE = 'seriesReactance';
export const MAGNETIZING_CONDUCTANCE = 'magnetizingConductance';
export const MAGNETIZING_SUSCEPTANCE = 'magnetizingSusceptance';
export const RATED_S = 'ratedS';
export const RATED_VOLTAGE_1 = 'ratedVoltage1';
export const RATED_VOLTAGE_2 = 'ratedVoltage2';
export const CURRENT_LIMITS_1 = 'currentLimits1';
export const CURRENT_LIMITS_2 = 'currentLimits2';
export const PERMANENT_LIMIT = 'permanentLimit';
export const CONNECTIVITY_1 = 'connectivity1';
export const CONNECTIVITY_2 = 'connectivity2';

export const ENERGY_SOURCE = 'energySource';
export const MAXIMUM_ACTIVE_POWER = 'maximumActivePower';
export const MINIMUM_ACTIVE_POWER = 'minimumActivePower';
export const RATED_NOMINAL_POWER = 'ratedNominalPower';
export const ACTIVE_POWER_SET_POINT = 'activePowerSetpoint';
export const VOLTAGE_REGULATION = 'voltageRegulation';
export const REACTIVE_POWER_SET_POINT = 'reactivePowerSetpoint';
export const VOLTAGE_REGULATION_TYPE = 'voltageRegulationType';
export const VOLTAGE_SET_POINT = 'voltageSetPoint';
export const TRANSIENT_REACTANCE = 'transientReactance';
export const Q_PERCENT = 'qPercent';
export const FREQUENCY_REGULATION = 'frequencyRegulation';
export const DROOP = 'droop';
export const TRANSFORMER_REACTANCE = 'transformerReactance';
export const PLANNED_ACTIVE_POWER_SET_POINT = 'plannedActivePowerSetPoint';
export const STARTUP_COST = 'startupCost';
export const MARGINAL_COST = 'marginalCost';
export const PLANNED_OUTAGE_RATE = 'plannedOutageRate';
export const FORCED_OUTAGE_RATE = 'forcedOutageRate';
export const REACTIVE_CAPABILITY_CURVE_CHOICE = 'reactiveCapabilityCurveChoice';
export const REACTIVE_CAPABILITY_CURVE_TABLE = 'reactiveCapabilityCurveTable';
export const MINIMUM_REACTIVE_POWER = 'minimumReactivePower';
export const MAXIMUM_REACTIVE_POWER = 'maximumReactivePower';
export const Q_MAX_P = 'qmaxP';
export const Q_MIN_P = 'qminP';
export const P = 'p';

export const ENABLED = 'enabled';
export const REGULATING = 'regulating';
export const REGULATION_TYPE = 'regulationType';
export const TARGET_DEADBAND = 'targetDeadband';
export const LOW_TAP_POSITION = 'lowTapPosition';
export const HIGH_TAP_POSITION = 'highTapPosition';
export const TAP_POSITION = 'tapPosition';
export const REGULATION_SIDE = 'regulationSide';

//tap-changer-pane-taps
export const STEPS = 'steps';
export const STEPS_TAP = 'index';
export const STEPS_RESISTANCE = 'r';
export const STEPS_REACTANCE = 'x';
export const STEPS_CONDUCTANCE = 'g';
export const STEPS_SUSCEPTANCE = 'b';
export const STEPS_RATIO = 'rho';
export const STEPS_ALPHA = 'alpha';

//tab ratio_tap_changer
export const RATIO_TAP_CHANGER = 'ratioTapChanger';
export const LOAD_TAP_CHANGING_CAPABILITIES = 'loadTapChangingCapabilities';
export const TARGET_V = 'targetV';

//tab phase_tap_changer
export const PHASE_TAP_CHANGER = 'phaseTapChanger';
export const REGULATION_MODE = 'regulationMode';
export const CURRENT_LIMITER_REGULATING_VALUE = 'currentLimiterRegulatingValue';
export const FLOW_SET_POINT_REGULATING_VALUE = 'flowSetPointRegulatingValue';

//ShuntCompensator
export const MAXIMUM_NUMBER_OF_SECTIONS = 'maximumNumberOfSections';
export const CURRENT_NUMBER_OF_SECTIONS = 'currentNumberOfSections';
export const IDENTICAL_SECTIONS = 'identicalSections';
export const SUSCEPTANCE_PER_SECTION = 'susceptancePerSection';
export const CHARACTERISTICS_CHOICE = 'characteristicsChoice';
export const Q_AT_NOMINAL_V = 'qatNominalV';
export const SHUNT_COMPENSATOR_TYPE = 'shuntCompensatorType';
export const CHARACTERISTICS_CHOICES = {
    Q_AT_NOMINAL_V: { id: 'Q_AT_NOMINAL_V', label: 'QatNominalVLabel' },
    SUSCEPTANCE: { id: 'SUSCEPTANCE', label: 'SusceptanceLabel' },
};
export const SHUNT_COMPENSATOR_TYPES = {
    REACTOR: { id: 'REACTOR', label: 'Reactor' },
    CAPACITOR: { id: 'CAPACITOR', label: 'Capacitor' },
};
//line
export const SHUNT_CONDUCTANCE_1 = 'shuntConductance1';
export const SHUNT_CONDUCTANCE_2 = 'shuntConductance2';
export const SHUNT_SUSCEPTANCE_1 = 'shuntSusceptance1';
export const SHUNT_SUSCEPTANCE_2 = 'shuntSusceptance2';

// Voltage level
export const BUS_BAR_SECTIONS = 'busbarSections';
export const HORIZONTAL_POSITION = 'horizPos';
export const VERTICAL_POSITION = 'vertPos';
export const BUS_BAR_CONNECTIONS = 'busbarConnections';
export const FROM_BBS = 'fromBBS';
export const TO_BBS = 'toBBS';
export const SWITCH_KIND = 'switchKind';
// dnd table
export const SELECTED = 'selected';

// voltage-level-on-line, attach line to another line, etc
export const LINE_TO_ATTACH_TO_1_ID = 'lineToAttachTo1Id';
export const LINE_TO_ATTACH_TO_2_ID = 'lineToAttachTo2Id';

// scaling
export const VARIATIONS = 'variations';
export const VARIATION_MODE = 'variationMode';
export const FILTERS = 'filters';
export const VARIATION_TYPE = 'variationType';
export const VARIATION_VALUE = 'variationValue';
export const REACTIVE_VARIATION_MODE = 'reactiveVariationMode';

// elements and directories
export const SPECIFIC_METADATA = 'specificMetadata';

export const ATTACHED_LINE_ID = 'attachedLineId';
export const VOLTAGE_LEVEL_ID = 'voltageLevelId';
export const BUS_BAR_SECTION_ID = 'bbsBusId';
export const REPLACING_LINE_1_ID = 'replacingLine1Id';
export const REPLACING_LINE_2_ID = 'replacingLine2Id';
export const REPLACING_LINE_1_NAME = 'replacingLine1Name';
export const REPLACING_LINE_2_NAME = 'replacingLine2Name';
