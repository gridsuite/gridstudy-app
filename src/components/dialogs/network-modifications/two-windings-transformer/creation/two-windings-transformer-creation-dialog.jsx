/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    convertInputValue,
    convertOutputValue,
    CustomFormProvider,
    FieldType,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
import {
    B,
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    CURRENT_LIMITER_REGULATING_VALUE,
    ENABLED,
    EQUIPMENT,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FLOW_SET_POINT_REGULATING_VALUE,
    G,
    ID,
    LIMITS,
    OPERATIONAL_LIMITS_GROUPS_1,
    OPERATIONAL_LIMITS_GROUPS_2,
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    PHASE_TAP_CHANGER,
    R,
    RATED_S,
    RATED_U1,
    RATED_U2,
    RATIO_TAP_CHANGER,
    REGULATING,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
    STEPS,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
    VOLTAGE_LEVEL,
    X,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FetchStatus } from '../../../../../services/utils';
import { sanitizeString } from '../../../dialog-utils';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useFormSearchCopy } from '../../../form-search-copy-hook';
import {
    FORM_LOADING_DELAY,
    PHASE_REGULATION_MODES,
    RATIO_REGULATION_MODES,
    REGULATION_TYPES,
    SIDE,
    UNDEFINED_CONNECTION_DIRECTION,
} from 'components/network/constants';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../../commons/modificationDialog';
import { getConnectivityFormData } from '../../../connectivity/connectivity-form-utils';
import {
    getPhaseTapChangerEmptyFormData,
    getPhaseTapChangerFormData,
    getPhaseTapChangerValidationSchema,
} from '../tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane-utils';
import {
    getRatioTapChangerEmptyFormData,
    getRatioTapChangerFormData,
    getRatioTapChangerValidationSchema,
} from '../tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import TwoWindingsTransformerCreationDialogTabs from './two-windings-transformer-creation-dialog-tabs';
import TwoWindingsTransformerCreationCharacteristicsPane from './characteristics-pane/two-windings-transformer-creation-characteristics-pane';
import {
    getTwoWindingsTransformerEmptyFormData,
    getTwoWindingsTransformerFormData,
    getTwoWindingsTransformerValidationSchema,
} from './characteristics-pane/two-windings-transformer-creation-characteristics-pane-utils';
import {
    getLimitsEmptyFormData,
    getAllLimitsFormData,
    getLimitsValidationSchema,
    sanitizeLimitsGroups,
} from '../../../limits/limits-pane-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import TwoWindingsTransformerCreationDialogHeader from './two-windings-transformer-creation-dialog-header';
import { addSelectedFieldToRows, computeHighTapPosition, formatCompleteCurrentLimit } from 'components/utils/utils';
import { createTwoWindingsTransformer } from '../../../../../services/study/network-modifications';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    getPropertiesFromModification,
    toModificationProperties,
} from '../../common/properties/property-utils';
import { TwoWindingsTransformerCreationDialogTab } from '../two-windings-transformer-utils';

/**
 * Dialog to create a two windings transformer in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    ...getTwoWindingsTransformerEmptyFormData(),
    ...getLimitsEmptyFormData(false),
    ...getRatioTapChangerEmptyFormData(),
    ...getPhaseTapChangerEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        ...getTwoWindingsTransformerValidationSchema(),
        ...getLimitsValidationSchema(false),
        ...getRatioTapChangerValidationSchema(),
        ...getPhaseTapChangerValidationSchema(),
    })
    .concat(creationPropertiesSchema)
    .required();

export const PHASE_TAP = 'dephasing';
export const RATIO_TAP = 'ratio';

const TwoWindingsTransformerCreationDialog = ({
    editData,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    const [tabIndex, setTabIndex] = useState(TwoWindingsTransformerCreationDialogTab.CHARACTERISTICS_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);
    const [dialogWidth, setDialogWidth] = useState('xl');

    const computeRatioTapChangerRegulationMode = (ratioTapChangerFormValues) => {
        if (ratioTapChangerFormValues?.[REGULATING]) {
            return RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id;
        } else {
            return RATIO_REGULATION_MODES.FIXED_RATIO.id;
        }
    };

    const getTapSideForEdit = (twt, tap) => {
        return tap?.regulatingTerminalId === twt.equipmentId
            ? tap?.regulatingTerminalVlId === twt?.voltageLevelId1
                ? SIDE.SIDE1.id
                : SIDE.SIDE2.id
            : null;
    };

    const getTapSideForCopy = (twt, tap) => {
        return tap?.regulatingTerminalConnectableId === twt.id
            ? tap?.regulatingTerminalVlId === twt?.voltageLevelId1
                ? SIDE.SIDE1.id
                : SIDE.SIDE2.id
            : null;
    };

    const getRegulationTypeForEdit = (twt, tap) => {
        return tap?.regulatingTerminalId != null
            ? tap?.regulatingTerminalId === twt.equipmentId
                ? REGULATION_TYPES.LOCAL.id
                : REGULATION_TYPES.DISTANT.id
            : null;
    };

    const getRegulationTypeForCopy = (twt, tap) => {
        return tap?.regulatingTerminalConnectableId != null
            ? tap?.regulatingTerminalConnectableId === twt.id
                ? REGULATION_TYPES.LOCAL.id
                : REGULATION_TYPES.DISTANT.id
            : null;
    };

    const fromEditDataToFormValues = useCallback(
        (twt) => {
            reset({
                [EQUIPMENT_ID]: twt.equipmentId,
                [EQUIPMENT_NAME]: twt.equipmentName,
                ...getTwoWindingsTransformerFormData({
                    r: twt.r,
                    x: twt.x,
                    g: convertInputValue(FieldType.G, twt.g),
                    b: convertInputValue(FieldType.B, twt.b),
                    ratedU1: twt.ratedU1,
                    ratedU2: twt.ratedU2,
                    ratedS: twt.ratedS,
                    permanentLimit1: twt.currentLimits1?.permanentLimit,
                    permanentLimit2: twt.currentLimits2?.permanentLimit,
                    ...getConnectivityFormData(
                        {
                            busbarSectionId: twt.busOrBusbarSectionId1,
                            connectionDirection: twt.connectionDirection1,
                            connectionName: twt.connectionName1,
                            connectionPosition: twt.connectionPosition1,
                            voltageLevelId: twt.voltageLevelId1,
                            terminalConnected: twt.connected1,
                        },
                        CONNECTIVITY_1
                    ),
                    ...getConnectivityFormData(
                        {
                            busbarSectionId: twt.busOrBusbarSectionId2,
                            connectionDirection: twt.connectionDirection2,
                            connectionName: twt.connectionName2,
                            connectionPosition: twt.connectionPosition2,
                            voltageLevelId: twt.voltageLevelId2,
                            terminalConnected: twt.connected2,
                        },
                        CONNECTIVITY_2
                    ),
                }),
                ...getAllLimitsFormData({
                    [OPERATIONAL_LIMITS_GROUPS_1]: twt.operationalLimitsGroups1,
                    [OPERATIONAL_LIMITS_GROUPS_2]: twt.operationalLimitsGroups2,
                    selectedOperationalLimitsGroup1: twt.selectedOperationalLimitsGroup1 ?? null,
                    selectedOperationalLimitsGroup2: twt.selectedOperationalLimitsGroup2 ?? null,
                }),
                ...getPhaseTapChangerFormData({
                    enabled: twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION] !== undefined,
                    regulationMode: twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE],
                    regulationType: getRegulationTypeForEdit(twt, twt?.[PHASE_TAP_CHANGER]),
                    regulationSide: getTapSideForEdit(twt, twt?.[PHASE_TAP_CHANGER]),
                    currentLimiterRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE] === PHASE_REGULATION_MODES.CURRENT_LIMITER.id
                            ? twt?.[PHASE_TAP_CHANGER]?.regulationValue
                            : null,
                    flowSetpointRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE] === PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                            ? twt?.[PHASE_TAP_CHANGER]?.regulationValue
                            : null,
                    targetDeadband: twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND],
                    lowTapPosition: twt?.[PHASE_TAP_CHANGER]?.[LOW_TAP_POSITION],
                    highTapPosition: computeHighTapPosition(twt?.[PHASE_TAP_CHANGER]?.[STEPS]),
                    tapPosition: twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION],
                    steps: addSelectedFieldToRows(twt?.[PHASE_TAP_CHANGER]?.[STEPS]),
                    equipmentId: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalId,
                    equipmentType: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalType,
                    voltageLevelId: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalVlId,
                }),
                ...getRatioTapChangerFormData({
                    enabled: twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION] !== undefined,
                    hasLoadTapChangingCapabilities: twt?.[RATIO_TAP_CHANGER]?.[LOAD_TAP_CHANGING_CAPABILITIES],
                    regulationMode: computeRatioTapChangerRegulationMode(twt?.[RATIO_TAP_CHANGER]),
                    regulationType: getRegulationTypeForEdit(twt, twt?.[RATIO_TAP_CHANGER]),
                    regulationSide: getTapSideForEdit(twt, twt?.[RATIO_TAP_CHANGER]),
                    targetV: twt?.[RATIO_TAP_CHANGER]?.[TARGET_V],
                    targetDeadband: twt?.[RATIO_TAP_CHANGER]?.[TARGET_DEADBAND],
                    lowTapPosition: twt?.[RATIO_TAP_CHANGER]?.[LOW_TAP_POSITION],
                    highTapPosition: computeHighTapPosition(twt?.[RATIO_TAP_CHANGER]?.[STEPS]),
                    tapPosition: twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION],
                    steps: addSelectedFieldToRows(twt?.[RATIO_TAP_CHANGER]?.[STEPS]),
                    equipmentId: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalId,
                    equipmentType: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalType,
                    voltageLevelId: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalVlId,
                }),
                ...getPropertiesFromModification(twt.properties),
            });
        },
        [reset]
    );

    const fromSearchCopyToFormValues = useCallback(
        (twt) => {
            reset(
                {
                    [EQUIPMENT_ID]: twt.id + '(1)',
                    [EQUIPMENT_NAME]: twt.name ?? '',
                    ...getTwoWindingsTransformerFormData({
                        r: twt.r,
                        x: twt.x,
                        g: convertInputValue(FieldType.G, twt.g),
                        b: convertInputValue(FieldType.B, twt.b),
                        ratedU1: twt.ratedU1,
                        ratedU2: twt.ratedU2,
                        ratedS: twt.ratedS,
                        permanentLimit1: twt.permanentLimit1,
                        permanentLimit2: twt.permanentLimit2,
                        ...getConnectivityFormData(
                            {
                                busbarSectionId: twt.busOrBusbarSectionId1,
                                connectionDirection: twt.connectablePosition1?.connectionDirection,
                                connectionName: twt.connectablePosition1?.connectionName,
                                voltageLevelId: twt.voltageLevelId1,
                            },
                            CONNECTIVITY_1
                        ),
                        ...getConnectivityFormData(
                            {
                                busbarSectionId: twt.busOrBusbarSectionId2,
                                connectionDirection: twt.connectablePosition2?.connectionDirection,
                                connectionName: twt.connectablePosition2?.connectionName,
                                voltageLevelId: twt.voltageLevelId2,
                            },
                            CONNECTIVITY_2
                        ),
                    }),
                    ...getAllLimitsFormData({
                        [OPERATIONAL_LIMITS_GROUPS_1]: formatCompleteCurrentLimit(twt.currentLimits1),
                        [OPERATIONAL_LIMITS_GROUPS_2]: formatCompleteCurrentLimit(twt.currentLimits2),
                        [SELECTED_LIMITS_GROUP_1]: twt.selectedOperationalLimitsGroup1 ?? null,
                        [SELECTED_LIMITS_GROUP_2]: twt.selectedOperationalLimitsGroup2 ?? null,
                    }),
                    ...getRatioTapChangerFormData({
                        enabled: twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION] !== undefined,
                        hasLoadTapChangingCapabilities: twt?.[RATIO_TAP_CHANGER]?.[LOAD_TAP_CHANGING_CAPABILITIES],
                        regulationMode: computeRatioTapChangerRegulationMode(twt?.[RATIO_TAP_CHANGER]),
                        regulationType: getRegulationTypeForCopy(twt, twt?.[RATIO_TAP_CHANGER]),
                        regulationSide: getTapSideForCopy(twt, twt?.[RATIO_TAP_CHANGER]),
                        targetV: twt?.[RATIO_TAP_CHANGER]?.[TARGET_V],
                        targetDeadband: isNaN(twt?.[RATIO_TAP_CHANGER]?.[TARGET_DEADBAND])
                            ? null
                            : twt?.[RATIO_TAP_CHANGER]?.[TARGET_DEADBAND],
                        lowTapPosition: twt?.[RATIO_TAP_CHANGER]?.[LOW_TAP_POSITION],
                        highTapPosition: computeHighTapPosition(twt?.[RATIO_TAP_CHANGER]?.[STEPS]),
                        tapPosition: twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION],
                        steps: addSelectedFieldToRows(twt?.[RATIO_TAP_CHANGER]?.[STEPS]),
                        equipmentId: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalConnectableId,
                        equipmentType: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalConnectableType,
                        voltageLevelId: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalVlId,
                    }),
                    ...getPhaseTapChangerFormData({
                        enabled: twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION] !== undefined,
                        regulationMode: twt?.[PHASE_TAP_CHANGER]?.[REGULATING]
                            ? twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE]
                            : PHASE_REGULATION_MODES.FIXED_TAP.id,
                        regulationType: getRegulationTypeForCopy(twt, twt?.[PHASE_TAP_CHANGER]),
                        regulationSide: getTapSideForCopy(twt, twt?.[PHASE_TAP_CHANGER]),
                        currentLimiterRegulatingValue:
                            twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE] === PHASE_REGULATION_MODES.CURRENT_LIMITER.id
                                ? twt?.[PHASE_TAP_CHANGER]?.regulationValue
                                : null,
                        flowSetpointRegulatingValue:
                            twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE] ===
                            PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                                ? twt?.[PHASE_TAP_CHANGER]?.regulationValue
                                : null,
                        targetDeadband: isNaN(twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND])
                            ? null
                            : twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND],
                        lowTapPosition: twt?.[PHASE_TAP_CHANGER]?.[LOW_TAP_POSITION],
                        highTapPosition: computeHighTapPosition(twt?.[PHASE_TAP_CHANGER]?.[STEPS]),
                        tapPosition: twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION],
                        steps: addSelectedFieldToRows(twt?.[PHASE_TAP_CHANGER]?.[STEPS]),
                        voltageLevelId: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalVlId,
                        equipmentId: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalConnectableId,
                        equipmentType: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalConnectableType,
                    }),
                    ...copyEquipmentPropertiesForCreation(twt),
                },
                { keepDefaultValues: true }
            );
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
    });

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const headerAndTabs = (
        <Grid container spacing={2}>
            <TwoWindingsTransformerCreationDialogHeader />
            <TwoWindingsTransformerCreationDialogTabs
                tabIndex={tabIndex}
                tabIndexesWithError={tabIndexesWithError}
                setTabIndex={setTabIndex}
                setDialogWidth={setDialogWidth}
            />
        </Grid>
    );

    const computeRatioTapChangerRegulating = (ratioTapChangerFormValues) => {
        return ratioTapChangerFormValues?.[REGULATION_MODE] === RATIO_REGULATION_MODES.VOLTAGE_REGULATION.id;
    };

    const computePhaseTapChangerRegulating = (phaseTapChangerFormValues) => {
        return (
            phaseTapChangerFormValues?.[REGULATION_MODE] === PHASE_REGULATION_MODES.CURRENT_LIMITER.id ||
            phaseTapChangerFormValues?.[REGULATION_MODE] === PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id
        );
    };

    const computePhaseTapChangerRegulationValue = (phaseTapChangerFormValues) => {
        switch (phaseTapChangerFormValues?.[REGULATION_MODE]) {
            case PHASE_REGULATION_MODES.ACTIVE_POWER_CONTROL.id:
                return phaseTapChangerFormValues?.[FLOW_SET_POINT_REGULATING_VALUE];
            case PHASE_REGULATION_MODES.CURRENT_LIMITER.id:
                return phaseTapChangerFormValues?.[CURRENT_LIMITER_REGULATING_VALUE];
            default:
                return undefined;
        }
    };

    const computeRegulatingTerminalType = (tapChangerValue) => {
        if (tapChangerValue?.[EQUIPMENT]?.type) {
            return tapChangerValue?.[EQUIPMENT]?.type;
        }

        if (tapChangerValue?.[REGULATION_TYPE] === REGULATION_TYPES.LOCAL.id) {
            return EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER;
        }

        return undefined;
    };

    const computeTapTerminalVlId = (tapChangerValue, connectivity1, connectivity2) => {
        if (tapChangerValue?.[REGULATION_TYPE] === REGULATION_TYPES.LOCAL.id) {
            if (tapChangerValue?.[REGULATION_SIDE] === SIDE.SIDE1.id) {
                return connectivity1?.[VOLTAGE_LEVEL]?.[ID];
            } else {
                return connectivity2?.[VOLTAGE_LEVEL]?.[ID];
            }
        } else {
            return tapChangerValue?.[VOLTAGE_LEVEL]?.[ID];
        }
    };

    const computeRegulatingTerminalId = (tapChangerValue, currentTwtId) => {
        if (tapChangerValue?.[REGULATION_TYPE] === REGULATION_TYPES.LOCAL.id) {
            return currentTwtId;
        } else {
            return tapChangerValue?.[EQUIPMENT]?.id;
        }
    };

    const onSubmit = useCallback(
        (twt) => {
            const enablePhaseTapChanger = twt[PHASE_TAP_CHANGER]?.[ENABLED];
            const enableRatioTapChanger = twt[RATIO_TAP_CHANGER]?.[ENABLED];
            const characteristics = twt[CHARACTERISTICS];
            const limits = twt[LIMITS];

            characteristics[G] = convertOutputValue(FieldType.G, characteristics[G]);
            characteristics[B] = convertOutputValue(FieldType.B, characteristics[B]);

            let ratioTap = undefined;
            if (enableRatioTapChanger) {
                const ratioTapChangerFormValues = twt[RATIO_TAP_CHANGER];
                const hasLoadTapCapabilities = ratioTapChangerFormValues[LOAD_TAP_CHANGING_CAPABILITIES];

                const getRegulatingValue = (computeFunc, ...args) => {
                    return hasLoadTapCapabilities ? computeFunc(...args) : null;
                };

                const getValueOrDefault = (key) => {
                    return hasLoadTapCapabilities ? ratioTapChangerFormValues[key] : null;
                };

                ratioTap = {
                    ...ratioTapChangerFormValues,
                    isRegulating: computeRatioTapChangerRegulating(ratioTapChangerFormValues),
                    regulatingTerminalId: getRegulatingValue(
                        computeRegulatingTerminalId,
                        ratioTapChangerFormValues,
                        twt[EQUIPMENT_ID]
                    ),
                    regulatingTerminalType: getRegulatingValue(
                        computeRegulatingTerminalType,
                        ratioTapChangerFormValues
                    ),
                    regulatingTerminalVlId: getRegulatingValue(
                        computeTapTerminalVlId,
                        ratioTapChangerFormValues,
                        characteristics[CONNECTIVITY_1],
                        characteristics[CONNECTIVITY_2]
                    ),
                    targetV: getValueOrDefault(TARGET_V),
                    targetDeadband: getValueOrDefault(TARGET_DEADBAND),
                    regulationMode: getValueOrDefault(REGULATION_MODE),
                    regulationType: getValueOrDefault(REGULATION_TYPE),
                };
            }
            let phaseTap = undefined;
            if (enablePhaseTapChanger) {
                const phaseTapChangerFormValues = twt[PHASE_TAP_CHANGER];
                phaseTap = {
                    isRegulating: computePhaseTapChangerRegulating(phaseTapChangerFormValues),
                    regulationValue: computePhaseTapChangerRegulationValue(phaseTapChangerFormValues),
                    regulatingTerminalId: computeRegulatingTerminalId(phaseTapChangerFormValues, twt[EQUIPMENT_ID]),
                    regulatingTerminalType: computeRegulatingTerminalType(phaseTapChangerFormValues),
                    regulatingTerminalVlId: computeTapTerminalVlId(
                        phaseTapChangerFormValues,
                        characteristics[CONNECTIVITY_1],
                        characteristics[CONNECTIVITY_2]
                    ),
                    ...twt[PHASE_TAP_CHANGER],
                };
            }

            createTwoWindingsTransformer({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                twoWindingsTransformerId: twt[EQUIPMENT_ID],
                twoWindingsTransformerName: sanitizeString(twt[EQUIPMENT_NAME]),
                r: characteristics[R],
                x: characteristics[X],
                g: characteristics[G],
                b: characteristics[B],
                ratedS: characteristics[RATED_S] ?? '',
                ratedU1: characteristics[RATED_U1],
                ratedU2: characteristics[RATED_U2],
                limitsGroups1: sanitizeLimitsGroups(limits[OPERATIONAL_LIMITS_GROUPS_1]),
                limitsGroups2: sanitizeLimitsGroups(limits[OPERATIONAL_LIMITS_GROUPS_2]),
                selectedLimitsGroup1: limits[SELECTED_LIMITS_GROUP_1],
                selectedLimitsGroup2: limits[SELECTED_LIMITS_GROUP_2],
                voltageLevelId1: characteristics[CONNECTIVITY_1]?.[VOLTAGE_LEVEL]?.[ID],
                busOrBusbarSectionId1: characteristics[CONNECTIVITY_1]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                voltageLevelId2: characteristics[CONNECTIVITY_2]?.[VOLTAGE_LEVEL]?.[ID],
                busOrBusbarSectionId2: characteristics[CONNECTIVITY_2]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                ratioTapChanger: ratioTap,
                phaseTapChanger: phaseTap,
                isUpdate: !!editData,
                modificationUuid: editData ? editData.uuid : undefined,
                connectionName1: sanitizeString(characteristics[CONNECTIVITY_1]?.[CONNECTION_NAME]),
                connectionDirection1:
                    characteristics[CONNECTIVITY_1]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionName2: sanitizeString(characteristics[CONNECTIVITY_2]?.[CONNECTION_NAME]),
                connectionDirection2:
                    characteristics[CONNECTIVITY_2]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionPosition1: characteristics[CONNECTIVITY_1]?.[CONNECTION_POSITION] ?? null,
                connectionPosition2: characteristics[CONNECTIVITY_2]?.[CONNECTION_POSITION] ?? null,
                connected1: characteristics[CONNECTIVITY_1]?.[CONNECTED] ?? null,
                connected2: characteristics[CONNECTIVITY_2]?.[CONNECTED] ?? null,
                properties: toModificationProperties(twt),
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'TwoWindingsTransformerCreationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const onValidationError = useCallback(
        (errors) => {
            const tabsInError = [];
            if (errors?.[PHASE_TAP_CHANGER] !== undefined) {
                tabsInError.push(TwoWindingsTransformerCreationDialogTab.PHASE_TAP_TAB);
            }
            if (errors?.[RATIO_TAP_CHANGER] !== undefined) {
                tabsInError.push(TwoWindingsTransformerCreationDialogTab.RATIO_TAP_TAB);
            }
            if (errors?.[CHARACTERISTICS] !== undefined) {
                tabsInError.push(TwoWindingsTransformerCreationDialogTab.CHARACTERISTICS_TAB);
            }
            if (errors?.[LIMITS] !== undefined) {
                tabsInError.push(TwoWindingsTransformerCreationDialogTab.LIMITS_TAB);
            }

            if (tabsInError.includes(tabIndex)) {
                // error in current tab => do not change tab systematically but remove current tab in error list
                setTabIndexesWithError(tabsInError.filter((errorTabIndex) => errorTabIndex !== tabIndex));
            } else if (tabsInError.length > 0) {
                // switch to the first tab in the list then remove the tab in the error list
                setTabIndex(tabsInError[0]);
                setTabIndexesWithError(tabsInError.filter((errorTabIndex, index, arr) => errorTabIndex !== arr[0]));
            }
        },
        [tabIndex]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onValidationError={onValidationError}
                onSave={onSubmit}
                aria-labelledby="dialog-create-two-windings-transformer"
                maxWidth={dialogWidth}
                titleId="CreateTwoWindingsTransformer"
                subtitle={headerAndTabs}
                searchCopy={searchCopy}
                PaperProps={{
                    sx: {
                        height: '95vh', // we want the dialog height to be fixed even when switching tabs
                    },
                }}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <TwoWindingsTransformerCreationCharacteristicsPane
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    tabIndex={tabIndex}
                />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

TwoWindingsTransformerCreationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    currentRootNetworkUuid: PropTypes.string,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default TwoWindingsTransformerCreationDialog;
