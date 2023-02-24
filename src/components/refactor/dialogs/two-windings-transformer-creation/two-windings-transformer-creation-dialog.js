/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/material';
import {
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    CURRENT_LIMITER_REGULATING_VALUE,
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    ENABLED,
    EQUIPMENT,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FLOW_SET_POINT_REGULATING_VALUE,
    ID,
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    MAGNETIZING_CONDUCTANCE,
    MAGNETIZING_SUSCEPTANCE,
    PERMANENT_LIMIT,
    PHASE_TAP_CHANGER,
    RATED_S,
    RATED_VOLTAGE_1,
    RATED_VOLTAGE_2,
    RATIO_TAP_CHANGER,
    REGULATING,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    STEPS,
    STEPS_TAP,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
    VOLTAGE_LEVEL,
} from 'components/refactor/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/util/equipment-types';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    createTwoWindingsTransformer,
    fetchVoltageLevelsIdAndTopology,
} from 'utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import EquipmentSearchDialog from '../../../dialogs/equipment-search-dialog';
import { useFormSearchCopy } from '../../../dialogs/form-search-copy-hook';
import {
    REGULATION_MODES,
    REGULATION_TYPES,
    SIDE,
    UNDEFINED_CONNECTION_DIRECTION,
} from '../../../network/constants';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import { getConnectivityFormData } from '../connectivity/connectivity-form-utils';
import PhaseTapChangerPane from './tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane';
import {
    getPhaseTapChangerEmptyFormData,
    getPhaseTapChangerFormData,
    getPhaseTapChangerValidationSchema,
} from './tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane-utils';
import RatioTapChangerPane from './tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane';
import {
    getRatioTapChangerEmptyFormData,
    getRatioTapChangerFormData,
    getRatioTapChangerValidationSchema,
} from './tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import TwoWindingsTransformerCreationDialogTabs from './two-windings-transformer-creation-dialog-tabs';
import TwoWindingsTransformerPane from './two-windings-transformer-pane/two-windings-transformer-pane';
import {
    getTwoWindingsTransformerEmptyFormData,
    getTwoWindingsTransformerFormData,
    getTwoWindingsTransformerValidationSchema,
} from './two-windings-transformer-pane/two-windings-transformer-pane-utils';

/**
 * Dialog to create a two windings transformer in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const emptyFormData = {
    ...getTwoWindingsTransformerEmptyFormData(),
    ...getRatioTapChangerEmptyFormData(),
    ...getPhaseTapChangerEmptyFormData(),
};

const schema = yup
    .object()
    .shape({
        ...getTwoWindingsTransformerValidationSchema(),
        ...getRatioTapChangerValidationSchema(),
        ...getPhaseTapChangerValidationSchema(),
    })
    .required();

export const TwoWindingsTransformerCreationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    RATIO_TAP_TAB: 1,
    PHASE_TAP_TAB: 2,
};

export const PHASE_TAP = 'dephasing';
export const RATIO_TAP = 'ratio';
export const MAX_TAP_CHANGER_STEPS_NUMBER = 100;

const TwoWindingsTransformerCreationDialog = ({
    editData,
    studyUuid,
    currentNode,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const equipmentPath = '2-windings-transformers';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const [tabIndex, setTabIndex] = useState(
        TwoWindingsTransformerCreationDialogTab.CHARACTERISTICS_TAB
    );
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);
    const [dialogWidth, setDialogWidth] = useState('sm');
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    const computeHighTapPosition = (steps) => {
        const values = steps?.map((step) => step[STEPS_TAP]);
        return Array.isArray(values) && values.length > 0
            ? Math.max(...values)
            : null;
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
                ...getTwoWindingsTransformerFormData({
                    equipmentId: twt.equipmentId,
                    equipmentName: twt.equipmentName,
                    seriesResistance: twt.seriesResistance,
                    seriesReactance: twt.seriesReactance,
                    magnetizingConductance: twt.magnetizingConductance,
                    magnetizingSusceptance: twt.magnetizingSusceptance,
                    ratedVoltage1: twt.ratedVoltage1,
                    ratedVoltage2: twt.ratedVoltage2,
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
                        },
                        CONNECTIVITY_2
                    ),
                }),
                ...getPhaseTapChangerFormData({
                    enabled:
                        twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION] !== undefined,
                    regulationMode: twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE],
                    regulating: twt?.[PHASE_TAP_CHANGER]?.[REGULATING],
                    regulationType: getRegulationTypeForEdit(
                        twt,
                        twt?.[PHASE_TAP_CHANGER]
                    ),
                    regulationSide: getTapSideForEdit(
                        twt,
                        twt?.[PHASE_TAP_CHANGER]
                    ),
                    currentLimiterRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.regulationValue,
                    flowSetpointRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.regulationValue,
                    targetDeadband: twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND],
                    lowTapPosition:
                        twt?.[PHASE_TAP_CHANGER]?.[LOW_TAP_POSITION],
                    highTapPosition: computeHighTapPosition(
                        twt?.[PHASE_TAP_CHANGER]?.[STEPS]
                    ),
                    tapPosition: twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION],
                    steps: twt?.[PHASE_TAP_CHANGER]?.[STEPS],
                    equipmentId: twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalId,
                    equipmentType:
                        twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalType,
                    voltageLevelId:
                        twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalVlId,
                }),
                ...getRatioTapChangerFormData({
                    enabled:
                        twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION] !== undefined,
                    loadTapChangingCapabilities:
                        twt?.[RATIO_TAP_CHANGER]?.[
                            LOAD_TAP_CHANGING_CAPABILITIES
                        ],
                    regulating: twt?.[RATIO_TAP_CHANGER]?.[REGULATING],
                    regulationType: getRegulationTypeForEdit(
                        twt,
                        twt?.[RATIO_TAP_CHANGER]
                    ),
                    regulationSide: getTapSideForEdit(
                        twt,
                        twt?.[RATIO_TAP_CHANGER]
                    ),
                    targetV: twt?.[RATIO_TAP_CHANGER]?.[TARGET_V],
                    targetDeadband: twt?.[RATIO_TAP_CHANGER]?.[TARGET_DEADBAND],
                    lowTapPosition:
                        twt?.[RATIO_TAP_CHANGER]?.[LOW_TAP_POSITION],
                    highTapPosition: computeHighTapPosition(
                        twt?.[RATIO_TAP_CHANGER]?.[STEPS]
                    ),
                    tapPosition: twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION],
                    steps: twt?.[RATIO_TAP_CHANGER]?.[STEPS],
                    equipmentId: twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalId,
                    equipmentType:
                        twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalType,
                    voltageLevelId:
                        twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalVlId,
                }),
            });
        },
        [reset]
    );

    const fromSearchCopyToFormValues = useCallback(
        (twt) => {
            reset({
                ...getTwoWindingsTransformerFormData({
                    equipmentId: twt.id + '(1)',
                    equipmentName: twt.name ?? '',
                    seriesResistance: twt.r,
                    seriesReactance: twt.x,
                    magnetizingConductance: twt.g,
                    magnetizingSusceptance: twt.b,
                    ratedVoltage1: twt.ratedU1,
                    ratedVoltage2: twt.ratedU2,
                    ratedS: twt.ratedS,
                    permanentLimit1: twt.permanentLimit1,
                    permanentLimit2: twt.permanentLimit2,
                    ...getConnectivityFormData(
                        {
                            busbarSectionId: twt.busOrBusbarSectionId1,
                            connectionDirection: twt.connectionDirection1,
                            connectionName: twt.connectionName1,
                            connectionPosition: twt.connectionPosition1,
                            voltageLevelId: twt.voltageLevelId1,
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
                        },
                        CONNECTIVITY_2
                    ),
                }),
                ...getRatioTapChangerFormData({
                    enabled:
                        twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION] !== undefined,
                    loadTapChangingCapabilities:
                        twt?.[RATIO_TAP_CHANGER]?.[
                            LOAD_TAP_CHANGING_CAPABILITIES
                        ],
                    regulating: twt?.[RATIO_TAP_CHANGER]?.[REGULATING],
                    regulationType: getRegulationTypeForCopy(
                        twt,
                        twt?.[RATIO_TAP_CHANGER]
                    ),
                    regulationSide: getTapSideForCopy(
                        twt,
                        twt?.[RATIO_TAP_CHANGER]
                    ),
                    targetV: twt?.[RATIO_TAP_CHANGER]?.[TARGET_V],
                    targetDeadband: isNaN(
                        twt?.[RATIO_TAP_CHANGER]?.[TARGET_DEADBAND]
                    )
                        ? null
                        : twt?.[RATIO_TAP_CHANGER]?.[TARGET_DEADBAND],
                    lowTapPosition:
                        twt?.[RATIO_TAP_CHANGER]?.[LOW_TAP_POSITION],
                    highTapPosition: computeHighTapPosition(
                        twt?.[RATIO_TAP_CHANGER]?.[STEPS]
                    ),
                    tapPosition: twt?.[RATIO_TAP_CHANGER]?.[TAP_POSITION],
                    steps: twt?.[RATIO_TAP_CHANGER]?.[STEPS],
                    equipmentId:
                        twt?.[RATIO_TAP_CHANGER]
                            ?.regulatingTerminalConnectableId,
                    equipmentType:
                        twt?.[RATIO_TAP_CHANGER]
                            ?.regulatingTerminalConnectableType,
                    voltageLevelId:
                        twt?.[RATIO_TAP_CHANGER]?.regulatingTerminalVlId,
                }),
                ...getPhaseTapChangerFormData({
                    enabled:
                        twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION] !== undefined,
                    regulationMode: twt?.[PHASE_TAP_CHANGER]?.[REGULATION_MODE],
                    regulating: twt?.[PHASE_TAP_CHANGER]?.[REGULATING],
                    regulationType: getRegulationTypeForCopy(
                        twt,
                        twt?.[PHASE_TAP_CHANGER]
                    ),
                    regulationSide: getTapSideForCopy(
                        twt,
                        twt?.[PHASE_TAP_CHANGER]
                    ),
                    currentLimiterRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.regulationValue,
                    flowSetpointRegulatingValue:
                        twt?.[PHASE_TAP_CHANGER]?.regulationValue,
                    targetDeadband: isNaN(
                        twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND]
                    )
                        ? null
                        : twt?.[PHASE_TAP_CHANGER]?.[TARGET_DEADBAND],
                    lowTapPosition:
                        twt?.[PHASE_TAP_CHANGER]?.[LOW_TAP_POSITION],
                    highTapPosition: computeHighTapPosition(
                        twt?.[PHASE_TAP_CHANGER]?.[STEPS]
                    ),
                    tapPosition: twt?.[PHASE_TAP_CHANGER]?.[TAP_POSITION],
                    steps: twt?.[PHASE_TAP_CHANGER]?.[STEPS],
                    voltageLevelId:
                        twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalVlId,
                    equipmentId:
                        twt?.[PHASE_TAP_CHANGER]
                            ?.regulatingTerminalConnectableId,
                    equipmentType:
                        twt?.[PHASE_TAP_CHANGER]
                            ?.regulatingTerminalConnectableType,
                }),
            });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
    });

    useEffect(() => {
        if (studyUuid && currentNodeUuid)
            fetchVoltageLevelsIdAndTopology(studyUuid, currentNodeUuid).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a.id.localeCompare(b.id))
                    );
                }
            );
    }, [studyUuid, currentNodeUuid]);

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const tabs = useMemo(() => {
        return (
            <TwoWindingsTransformerCreationDialogTabs
                tabIndex={tabIndex}
                tabIndexesWithError={tabIndexesWithError}
                setTabIndex={setTabIndex}
                setDialogWidth={setDialogWidth}
            />
        );
    }, [tabIndex, tabIndexesWithError]);

    const computePhaseTapChangerRegulationValue = (
        phaseTapChangerFormValues
    ) => {
        switch (phaseTapChangerFormValues?.[REGULATION_MODE]) {
            case REGULATION_MODES.ACTIVE_POWER_CONTROL.id:
                return phaseTapChangerFormValues?.[
                    FLOW_SET_POINT_REGULATING_VALUE
                ];
            case REGULATION_MODES.CURRENT_LIMITER.id:
                return phaseTapChangerFormValues?.[
                    CURRENT_LIMITER_REGULATING_VALUE
                ];
            default:
                return undefined;
        }
    };

    const computeRegulatingTerminalType = (tapChangerValue) => {
        if (tapChangerValue?.[EQUIPMENT]?.type) {
            return tapChangerValue?.[EQUIPMENT]?.type;
        }

        if (tapChangerValue?.[REGULATION_TYPE] === REGULATION_TYPES.LOCAL.id) {
            return EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type;
        }

        return undefined;
    };

    const computeTapTerminalVlId = (
        tapChangerValue,
        connectivity1,
        connectivity2
    ) => {
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

            const currentLimits1 = {
                permanentLimit:
                    characteristics[CURRENT_LIMITS_1]?.[PERMANENT_LIMIT],
            };

            const currentLimits2 = {
                permanentLimit:
                    characteristics[CURRENT_LIMITS_2]?.[PERMANENT_LIMIT],
            };

            let ratioTap = undefined;
            if (enableRatioTapChanger) {
                const ratioTapChangerFormValues = twt[RATIO_TAP_CHANGER];
                ratioTap = {
                    regulatingTerminalId: computeRegulatingTerminalId(
                        ratioTapChangerFormValues,
                        characteristics[EQUIPMENT_ID]
                    ),
                    regulatingTerminalType: computeRegulatingTerminalType(
                        ratioTapChangerFormValues
                    ),
                    regulatingTerminalVlId: computeTapTerminalVlId(
                        ratioTapChangerFormValues,
                        characteristics[CONNECTIVITY_1],
                        characteristics[CONNECTIVITY_2]
                    ),
                    ...ratioTapChangerFormValues,
                };
            }

            let phaseTap = undefined;
            if (enablePhaseTapChanger) {
                const phaseTapChangerFormValues = twt[PHASE_TAP_CHANGER];
                phaseTap = {
                    regulationValue: computePhaseTapChangerRegulationValue(
                        phaseTapChangerFormValues
                    ),
                    regulatingTerminalId: computeRegulatingTerminalId(
                        phaseTapChangerFormValues,
                        characteristics[EQUIPMENT_ID]
                    ),
                    regulatingTerminalType: computeRegulatingTerminalType(
                        phaseTapChangerFormValues
                    ),
                    regulatingTerminalVlId: computeTapTerminalVlId(
                        phaseTapChangerFormValues,
                        characteristics[CONNECTIVITY_1],
                        characteristics[CONNECTIVITY_2]
                    ),
                    ...twt[PHASE_TAP_CHANGER],
                };
            }
            createTwoWindingsTransformer(
                studyUuid,
                currentNodeUuid,
                characteristics[EQUIPMENT_ID],
                sanitizeString(characteristics[EQUIPMENT_NAME]),
                characteristics[SERIES_RESISTANCE],
                characteristics[SERIES_REACTANCE],
                characteristics[MAGNETIZING_CONDUCTANCE],
                characteristics[MAGNETIZING_SUSCEPTANCE],
                characteristics[RATED_S] ?? '',
                characteristics[RATED_VOLTAGE_1],
                characteristics[RATED_VOLTAGE_2],
                currentLimits1,
                currentLimits2,
                characteristics[CONNECTIVITY_1]?.[VOLTAGE_LEVEL]?.[ID],
                characteristics[CONNECTIVITY_1]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                characteristics[CONNECTIVITY_2]?.[VOLTAGE_LEVEL]?.[ID],
                characteristics[CONNECTIVITY_2]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                ratioTap,
                phaseTap,
                editData ? true : false,
                editData ? editData.uuid : undefined,
                characteristics[CONNECTIVITY_1]?.[CONNECTION_NAME] ?? null,
                characteristics[CONNECTIVITY_1]?.[CONNECTION_DIRECTION] ??
                    UNDEFINED_CONNECTION_DIRECTION,
                characteristics[CONNECTIVITY_2]?.[CONNECTION_NAME] ?? null,
                characteristics[CONNECTIVITY_2]?.[CONNECTION_DIRECTION] ??
                    UNDEFINED_CONNECTION_DIRECTION,
                characteristics[CONNECTIVITY_1]?.[CONNECTION_POSITION] ?? null,
                characteristics[CONNECTIVITY_2]?.[CONNECTION_POSITION] ?? null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'TwoWindingsTransformerCreationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const onValidationError = (errors) => {
        let tabsInError = [];
        if (errors?.[PHASE_TAP_CHANGER] !== undefined) {
            tabsInError.push(
                TwoWindingsTransformerCreationDialogTab.PHASE_TAP_TAB
            );
        }
        if (errors?.[RATIO_TAP_CHANGER] !== undefined) {
            tabsInError.push(
                TwoWindingsTransformerCreationDialogTab.RATIO_TAP_TAB
            );
        }
        if (errors?.[CHARACTERISTICS] !== undefined) {
            tabsInError.push(
                TwoWindingsTransformerCreationDialogTab.CHARACTERISTICS_TAB
            );
        }
        setTabIndexesWithError(tabsInError);
    };

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onValidationError={onValidationError}
                onSave={onSubmit}
                aria-labelledby="dialog-create-two-windings-transformer"
                maxWidth={dialogWidth}
                titleId="CreateTwoWindingsTransformer"
                subtitle={tabs}
                searchCopy={searchCopy}
                {...dialogProps}
            >
                <Box
                    hidden={
                        tabIndex !==
                        TwoWindingsTransformerCreationDialogTab.CHARACTERISTICS_TAB
                    }
                    p={1}
                >
                    <TwoWindingsTransformerPane
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        voltageLevelOptions={voltageLevelOptions}
                    />
                </Box>

                <Box
                    hidden={
                        tabIndex !==
                        TwoWindingsTransformerCreationDialogTab.RATIO_TAP_TAB
                    }
                    p={1}
                >
                    <RatioTapChangerPane
                        studyUuid={studyUuid}
                        currentNodeUuid={currentNodeUuid}
                        voltageLevelOptions={voltageLevelOptions}
                    />
                </Box>

                <Box
                    hidden={
                        tabIndex !==
                        TwoWindingsTransformerCreationDialogTab.PHASE_TAP_TAB
                    }
                    p={1}
                >
                    <PhaseTapChangerPane
                        studyUuid={studyUuid}
                        currentNodeUuid={currentNodeUuid}
                        voltageLevelOptions={voltageLevelOptions}
                    />
                </Box>

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={
                        EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type
                    }
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

TwoWindingsTransformerCreationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
};

export default TwoWindingsTransformerCreationDialog;
