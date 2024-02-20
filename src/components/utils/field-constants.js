/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const EQUIPMENT_ID = 'equipmentId';
export const EQUIPMENT_NAME = 'equipmentName';
export const LOAD_TYPE = 'loadType';
export const CONNECTIVITY = 'connectivity';
export const Q0 = 'q0';
export const VOLTAGE_LEVEL = 'voltageLevel';
export const ID = 'id';
export const NAME = 'name';
export const SUBSTATION_ID = 'substationId';
export const NOMINAL_VOLTAGE = 'nominalVoltage';
export const TOPOLOGY_KIND = 'topologyKind';
export const BUS_OR_BUSBAR_SECTION = 'busOrBusbarSection';
export const BUS_OR_BUSBAR_SECTION_ID = 'busOrBusbarSectionId';
export const CONNECTION_DIRECTION = 'connectionDirection';
export const CONNECTION_NAME = 'connectionName';
export const CONNECTION_POSITION = 'connectionPosition';
export const CONNECTED = 'connected';
export const CONNECTED1 = 'connected1';
export const CONNECTED2 = 'connected2';

export const EQUIPMENT = 'equipment';
export const TYPE = 'type';
export const MODIFICATIONS_TABLE = 'modificationsTable';
export const CREATIONS_TABLE = 'creationsTable';

export const CHARACTERISTICS = 'characteristics';
export const R = 'r';
export const X = 'x';
export const G = 'g';
export const B = 'b';
export const RATED_S = 'ratedS';

export const RATED_U1 = 'ratedU1';
export const RATED_U2 = 'ratedU2';
export const CURRENT_LIMITS_1 = 'currentLimits1';
export const CURRENT_LIMITS_2 = 'currentLimits2';
export const PERMANENT_LIMIT = 'permanentLimit';
export const CONNECTIVITY_1 = 'connectivity1';
export const CONNECTIVITY_2 = 'connectivity2';

export const ENERGY_SOURCE = 'energySource';
export const MAXIMUM_ACTIVE_POWER = 'maximumActivePower';
export const MINIMUM_ACTIVE_POWER = 'minimumActivePower';
export const MAX_ACTIVE_POWER = 'maxActivePower';
export const MIN_ACTIVE_POWER = 'minActivePower';
export const RATED_NOMINAL_POWER = 'ratedNominalPower';
export const ACTIVE_POWER_SET_POINT = 'activePowerSetpoint';
export const VOLTAGE_REGULATION = 'voltageRegulation';
export const REACTIVE_POWER_SET_POINT = 'reactivePowerSetpoint';
export const VOLTAGE_REGULATION_TYPE = 'voltageRegulationType';
export const VOLTAGE_SET_POINT = 'voltageSetpoint';
export const TRANSIENT_REACTANCE = 'transientReactance';
export const Q_PERCENT = 'qPercent';
export const FREQUENCY_REGULATION = 'frequencyRegulation';
export const PARTICIPATE = 'participate';
export const DROOP = 'droop';
export const TRANSFORMER_REACTANCE = 'transformerReactance';
export const PLANNED_ACTIVE_POWER_SET_POINT = 'plannedActivePowerSetPoint';
export const MARGINAL_COST = 'marginalCost';
export const PLANNED_OUTAGE_RATE = 'plannedOutageRate';
export const FORCED_OUTAGE_RATE = 'forcedOutageRate';
export const REACTIVE_LIMITS = 'reactiveLimits';
export const REACTIVE_CAPABILITY_CURVE = 'reactiveCapabilityCurve';
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
export const CHARACTERISTICS_CHOICE = 'characteristicsChoice';
export const SHUNT_COMPENSATOR_TYPE = 'shuntCompensatorType';
export const CHARACTERISTICS_CHOICES = {
    Q_AT_NOMINAL_V: { id: 'Q_AT_NOMINAL_V', label: 'QatNominalVLabel' },
    SUSCEPTANCE: { id: 'SUSCEPTANCE', label: 'SusceptanceLabel' },
};
export const MAXIMUM_SECTION_COUNT = 'maximumSectionCount';
export const SWITCHED_ON_Q_AT_NOMINAL_V = 'switchedOnQAtNominalV';
export const SWITCHED_ON_SUSCEPTANCE = 'switchedOnSusceptance';
export const MAX_SUSCEPTANCE = 'maxSusceptance';
export const MAX_Q_AT_NOMINAL_V = 'maxQAtNominalV';
//line
export const G1 = 'g1';
export const B1 = 'b1';
export const G2 = 'g2';
export const B2 = 'b2';
export const LIMITS = 'limits';
export const TAB_HEADER = 'tabHeader';
export const TEMPORARY_LIMITS = 'temporaryLimits';
export const TEMPORARY_LIMIT_NAME = 'name';
export const TEMPORARY_LIMIT_DURATION = 'acceptableDuration';
export const TEMPORARY_LIMIT_VALUE = 'value';
export const TEMPORARY_LIMIT_MODIFICATION_TYPE = {
    MODIFIED: 'MODIFIED',
    ADDED: 'ADDED',
    DELETED: 'DELETED',
};
export const SEGMENT_DISTANCE_VALUE = 'segmentDistanceValue';
export const SEGMENT_TYPE_VALUE = 'segmentTypeValue';
export const SEGMENT_TYPE_ID = 'segmentTypeId';
export const SEGMENT_RESISTANCE = 'segmentResistance';
export const SEGMENT_REACTANCE = 'segmentReactance';
export const SEGMENT_SUSCEPTANCE = 'segmentSusceptance';
export const TOTAL_RESISTANCE = 'totalResistance';
export const TOTAL_REACTANCE = 'totalReactance';
export const TOTAL_SUSCEPTANCE = 'totalSusceptance';
export const SEGMENTS = 'segments';

// Voltage level
export const BUS_BAR_SECTIONS = 'busbarSections';
export const BUS_BAR_SECTION_ID1 = 'busbarSectionId1';
export const BUS_BAR_SECTION_ID2 = 'busbarSectionId2';
export const SWITCH_KIND = 'switchKind';
export const HIGH_VOLTAGE_LIMIT = 'highVoltageLimit';
export const LOW_VOLTAGE_LIMIT = 'lowVoltageLimit';
export const LOW_SHORT_CIRCUIT_CURRENT_LIMIT = 'lowShortCircuitCurrentLimit';
export const HIGH_SHORT_CIRCUIT_CURRENT_LIMIT = 'highShortCircuitCurrentLimit';
export const BUS_BAR_COUNT = 'busbarCount';
export const SECTION_COUNT = 'sectionCount';
export const SWITCHES_BETWEEN_SECTIONS = 'switchesBetweenSections';
export const COUPLING_OMNIBUS = 'couplingOmnibus';
export const SWITCH_KINDS = 'switchKinds';
// dnd table
export const SELECTED = 'selected';

export const COUNT = 'count';

export const ACTIVATED = 'activated';

//generator
export const VOLTAGE_REGULATION_ON = 'voltageRegulationOn';
export const STEP_UP_TRANSFORMER_REACTANCE = 'stepUpTransformerReactance';
export const REGULATING_TERMINAL = 'regulatingTerminal';
export const REGULATING_TERMINAL_ID = 'regulatingTerminalId';
export const REGULATING_TERMINAL_VOLTAGE_LEVEL_ID = 'regulatingTerminalVlId';
export const REGULATING_TERMINAL_TYPE = 'regulatingTerminalType';

export const ACTIVE_POWER_CONTROL_ON = 'activePowerControlOn';
export const GENERATOR = 'generator';
//line-attach-to-voltage-level
export const LINE_TO_ATTACH_OR_SPLIT_ID = 'lineToAttachOrSplitId';
export const ATTACHMENT_POINT_ID = 'attachmentPointId';
export const ATTACHMENT_POINT_NAME = 'attachmentPointName';
export const ATTACHMENT_LINE_ID = 'attachmentLineId';
export const LINE1_NAME = 'Line1Name';
export const LINE2_NAME = 'Line2Name';
export const LINE1_ID = 'Line1Id';
export const LINE2_ID = 'Line2Id';

//percentage-area
export const PERCENTAGE_AREA = 'percentageArea';
export const LEFT_SIDE_PERCENTAGE = 'leftSidePercentage';
export const RIGHT_SIDE_PERCENTAGE = 'rightSidePercentage';
export const SLIDER_PERCENTAGE = 'sliderPercentage';

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

export const MONITORED_BRANCHES_EQUIPMENT = 'monitoredBranchesEquipment';
// elements and directories
export const SPECIFIC_METADATA = 'specificMetadata';

export const ATTACHED_LINE_ID = 'attachedLineId';
export const VOLTAGE_LEVEL_ID = 'voltageLevelId';
export const BUS_BAR_SECTION_ID = 'bbsBusId';
export const REPLACING_LINE_1_ID = 'replacingLine1Id';
export const REPLACING_LINE_2_ID = 'replacingLine2Id';
export const REPLACING_LINE_1_NAME = 'replacingLine1Name';
export const REPLACING_LINE_2_NAME = 'replacingLine2Name';

// substation
export const COUNTRY = 'country';
export const VALUE = 'value';
export const PREVIOUS_VALUE = 'previousValue';
export const ADDED = 'added';
export const DELETION_MARK = 'deletionMark';
export const ADDITIONAL_PROPERTIES = 'AdditionalProperties';

// generation dispatch
export const LOSS_COEFFICIENT = 'lossCoefficient';
export const DEFAULT_OUTAGE_RATE = 'defaultOutageRate';
export const GENERATORS_WITHOUT_OUTAGE = 'generatorsWithoutOutage';
export const GENERATORS_WITH_FIXED_ACTIVE_POWER =
    'generatorsWithFixedActivePower';
export const GENERATORS_FREQUENCY_RESERVES = 'generatorsFrequencyReserve';
export const GENERATORS_FILTERS = 'generatorsFilters';
export const FREQUENCY_RESERVE = 'frequencyReserve';
export const SUBSTATIONS_GENERATORS_ORDERING = 'substationsGeneratorsOrdering';
export const SUBSTATION_IDS = 'substationIds';

// voltage init
export const VOLTAGE_LIMITS_MODIFICATION = 'voltageLimitsModification';
export const VOLTAGE_LIMITS_DEFAULT = 'voltageLimitsDefault';
export const FIXED_GENERATORS = 'constantQGenerators';
export const VARIABLE_TRANSFORMERS = 'variableTwoWindingsTransformers';
export const VARIABLE_SHUNT_COMPENSATORS = 'variableShuntCompensators';
export const RATIO_TAP_CHANGER_POSITION = 'ratioTapChangerPosition';
export const LEG_SIDE = 'legSide';

export const PRIORITY = 'priority';
export const FILTER_ID = 'filterId';
export const FILTER_NAME = 'filterName';
export const CONNECT = 'connect';

export const CONTAINER_ID = 'containerId';
export const CONTAINER_NAME = 'containerName';

// HVDC deletion
export const DELETION_SPECIFIC_DATA = 'equipmentInfos';
export const DELETION_SPECIFIC_TYPE = 'specificType';
export const HVDC_LINE_LCC_DELETION_SPECIFIC_TYPE = 'HVDC_LINE_WITH_LCC';
export const SHUNT_COMPENSATOR_SIDE_1 = 'mcsOnSide1';
export const SHUNT_COMPENSATOR_SIDE_2 = 'mcsOnSide2';
export const MCS_SELECTED = 'connectedToHvdc';
export const PROVIDER = 'provider';
export const FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD =
    'flowFlowSensitivityValueThreshold';
export const ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD =
    'angleFlowSensitivityValueThreshold';
export const FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD =
    'flowVoltageSensitivityValueThreshold';
export const PARAMETER_SENSI_INJECTIONS_SET = 'sensitivityInjectionsSet';
export const SENSI_INJECTIONS_SET = 'sensitivityInjectionsSet';
export const SENSI_INJECTION = 'sensiInjection';
export const PARAMETER_SENSI_INJECTION = 'sensitivityInjection';
export const PARAMETER_SENSI_HVDC = 'sensitivityHVDC';
export const PARAMETER_SENSI_PST = 'sensitivityPST';
export const PARAMETER_SENSI_NODES = 'sensitivityNodes';
export const CONTINGENCIES = 'contingencies';
export const EQUIPMENTS_IN_VOLTAGE_REGULATION = 'equipmentsInVoltageRegulation';
export const SUPERVISED_VOLTAGE_LEVELS = 'monitoredVoltageLevels';
export const MONITORED_BRANCHES = 'monitoredBranches';
export const HVDC_LINES = 'hvdcs';
export const SENSITIVITY_TYPE = 'sensitivityType';
export const INJECTIONS = 'injections';
export const DISTRIBUTION_TYPE = 'distributionType';
export const PSTS = 'psts';

// VSC
export const ACTIVE_POWER = 'activePower';
export const REACTIVE_POWER = 'reactivePower';
export const DC_NOMINAL_VOLTAGE = 'dcNominalVoltage';
export const DC_RESISTANCE = 'dcResistance';
export const OPERATOR_ACTIVE_POWER_LIMIT_SIDE1 =
    'operatorActivePowerLimitSide1';
export const OPERATOR_ACTIVE_POWER_LIMIT_SIDE2 =
    'operatorActivePowerLimitSide2';
export const CONVERTERS_MODE = 'convertersMode';
export const ANGLE_DROOP_ACTIVE_POWER_CONTROL = 'angleDroopActivePowerControl';
export const P0 = 'p0';
export const CONVERTER_STATION_ID = 'converterStationId';
export const CONVERTER_STATION_NAME = 'converterStationName';
export const LOSS_FACTOR = 'lossFactor';
export const VOLTAGE = 'voltage';
export const HVDC_LINE_TAB = 'hvdcLineTab';
export const CONVERTER_STATION_1 = 'converterStation1';
export const CONVERTER_STATION_2 = 'converterStation2';

export const SHORT_CIRCUIT_WITH_FEEDER_RESULT = 'withFeederResult';
export const SHORT_CIRCUIT_PREDEFINED_PARAMS = 'predefinedParameters';
export const SHORT_CIRCUIT_WITH_LOADS = 'withLoads';
export const SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS =
    'withVSCConverterStations';
export const SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS = 'withShuntCompensators';
export const SHORT_CIRCUIT_WITH_NEUTRAL_POSITION = 'withNeutralPosition';
export const SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE =
    'initialVoltageProfileMode';

// By formula
export const EQUIPMENT_TYPE_FIELD = 'equipmentType';
export const FORMULAS = 'formulas';
export const EDITED_FIELD = 'editedField';
export const OPERATOR = 'operator';
export const REFERENCE_FIELD_OR_VALUE_1 = 'referenceFieldOrValue1';
export const REFERENCE_FIELD_OR_VALUE_2 = 'referenceFieldOrValue2';
export const EQUIPMENT_FIELD = 'equipmentField';

export const SUBSTATION_COUNTRY = 'substationCountry';

// non evacuated energy
export const GENERATION_STAGES_KIND = 'energySource';
export const GENERATION_STAGES_PERCENT_MAXP_1 = 'percentMaxP1';
export const GENERATION_STAGES_PERCENT_MAXP_2 = 'percentMaxP2';
export const GENERATION_STAGES_PERCENT_MAXP_3 = 'percentMaxP3';
export const STAGES_DEFINITION_INDEX = 'stagesDefinitonIndex';
export const PMAX_PERCENTS_INDEX = 'pMaxPercentsIndex';

export const SENSITIVITY_THRESHOLD = 'sensitivityThreshold';
export const GENERATORS_CAPPINGS_KIND = 'energySource';
export const GENERATORS_CAPPINGS_FILTER = 'generators';

export const BRANCHES = 'branches';
export const MONITORED_BRANCHES_IST_N = 'istN';
export const MONITORED_BRANCHES_LIMIT_NAME_N = 'limitNameN';
export const MONITORED_BRANCHES_COEFF_N = 'nCoefficient';
export const MONITORED_BRANCHES_IST_N_1 = 'istNm1';
export const MONITORED_BRANCHES_LIMIT_NAME_N_1 = 'limitNameNm1';
export const MONITORED_BRANCHES_COEFF_N_1 = 'nm1Coefficient';

export const GENERATORS_CAPPINGS = 'generatorsCappings';
export const STAGES_SELECTION = 'stagesSelection';
export const STAGES_DEFINITION = 'stagesDefinition';
export const STAGES_DEFINITION_GENERATORS = 'generators';
export const PMAX_PERCENTS = 'pMaxPercents';
export const GENERATORS_LIMIT = 'generatorsCappings';
