/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPE, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/material';
import {
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS,
    DIRECTION,
    LABEL,
    ORDER,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    CURRENT_LIMITER_REGULATING_VALUE,
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    ENABLED,
    EQUIPMENT,
    NAME,
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
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    STEPS,
    STEPS_TAP,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
    VOLTAGE_LEVEL,
    POSITION,
} from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { createTwoWindingsTransformer } from '../../../../utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import EquipmentSearchDialog from '../../../dialogs/equipment-search-dialog';
import { useFormSearchCopy } from '../../../dialogs/form-search-copy-hook';
import {
    REGULATION_MODES,
    UNDEFINED_CONNECTION_DIRECTION,
} from '../../../network/constants';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import { getConnectivityFormData } from '../connectivity/connectivity-form-utils';
import PhaseTapChangerPane from './phase-tap-changer-pane/phase-tap-changer-pane';
import {
    getPhaseTapChangerEmptyFormData,
    getPhaseTapChangerFormData,
    getPhaseTapChangerValidationSchema,
} from './phase-tap-changer-pane/phase-tap-changer-pane-utils';
import RatioTapChangerPane from './ratio-tap-changer-pane/ratio-tap-changer-pane';
import {
    getRatioTapChangerEmptyFormData,
    getRatioTapChangerFormData,
    getRatioTapChangerValidationSchema,
} from './ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import TwoWindingsTransformerCreationDialogTabs from './two-windings-transformer-creation-dialog-tabs';
import TwoWindingsTransformerPane from './two-windings-transformer-pane/two-windings-transformer-pane';
import {
    getTwoWindingsTransformerEmptyFormData,
    getTwoWindingsTransformerFormData,
    getTwoWindingsTransformerValidationSchema,
} from './two-windings-transformer-pane/two-windings-transformer-pane-utils';

/**
 * Dialog to create a two windings transformer in the network
 * @param currentNodeUuid The node we are currently working on
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
export const MAX_TAP_NUMBER = 100;

const TwoWindingsTransformerCreationDialog = ({
    editData,
    currentNodeUuid,
    voltageLevelOptionsPromise,
    voltageLevelsEquipmentsOptionsPromise,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);
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

    const computeHighTapPosition = (steps) => {
        const values = steps?.map((step) => step[STEPS_TAP]);
        return Array.isArray(values) && values.length > 0
            ? Math.max(...values)
            : null;
    };

    const fromEditDataToFormValues = useCallback(
        (twt) => {
            reset({
                ...getTwoWindingsTransformerFormData({
                    id: twt.id,
                    name: twt.name,
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
                    id: twt.id + '(1)',
                    name: twt.name ?? '',
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
                            connectionDirection: twt.connectionDirection1,
                            connectionName: twt.connectionName1,
                            connectionPosition: twt.connectionPosition1,
                            voltageLevelId: twt.voltageLevelId1,
                        },
                        CONNECTIVITY_1
                    ),
                    ...getConnectivityFormData(
                        {
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
                    equipmentId:
                        twt?.[PHASE_TAP_CHANGER]
                            ?.regulatingTerminalConnectableId,
                    equipmentType:
                        twt?.[PHASE_TAP_CHANGER]
                            ?.regulatingTerminalConnectableType,
                    voltageLevelId:
                        twt?.[PHASE_TAP_CHANGER]?.regulatingTerminalVlId,
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

    const computeRegulatinTerminalType = (
        tapChangerValue,
        currentEquipmentId
    ) => {
        if (tapChangerValue?.[EQUIPMENT]?.type) {
            return tapChangerValue?.[EQUIPMENT]?.type;
        }

        if (currentEquipmentId === tapChangerValue?.[EQUIPMENT]?.id) {
            return EQUIPMENT_TYPE.TWO_WINDINGS_TRANSFORMER.name;
        }

        return undefined;
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
                    regulatingTerminalId:
                        ratioTapChangerFormValues?.[EQUIPMENT]?.id,
                    regulatingTerminalType: computeRegulatinTerminalType(
                        ratioTapChangerFormValues,
                        characteristics[ID]
                    ),
                    regulatingTerminalVlId:
                        ratioTapChangerFormValues?.[VOLTAGE_LEVEL]?.[ID],
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
                    regulatingTerminalId:
                        phaseTapChangerFormValues?.[EQUIPMENT]?.id,
                    regulatingTerminalType: computeRegulatinTerminalType(
                        phaseTapChangerFormValues,
                        characteristics[ID]
                    ),
                    regulatingTerminalVlId:
                        phaseTapChangerFormValues?.[VOLTAGE_LEVEL]?.[ID],
                    ...twt[PHASE_TAP_CHANGER],
                };
            }

            createTwoWindingsTransformer(
                studyUuid,
                currentNodeUuid,
                characteristics[ID],
                sanitizeString(characteristics[NAME]),
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
                characteristics[CONNECTIVITY_1]?.[POSITION]?.[LABEL] ?? null,
                characteristics[CONNECTIVITY_1]?.[POSITION]?.[DIRECTION] ??
                    UNDEFINED_CONNECTION_DIRECTION,
                characteristics[CONNECTIVITY_2]?.[POSITION]?.[LABEL] ?? null,
                characteristics[CONNECTIVITY_2]?.[POSITION]?.[DIRECTION] ??
                    UNDEFINED_CONNECTION_DIRECTION,
                characteristics[CONNECTIVITY_1]?.[POSITION]?.[ORDER] ?? null,
                characteristics[CONNECTIVITY_2]?.[POSITION]?.[ORDER] ?? null
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
                        voltageLevelOptionsPromise={voltageLevelOptionsPromise}
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
                        voltageLevelOptionsPromise={voltageLevelOptionsPromise}
                        voltageLevelsEquipmentsOptionsPromise={
                            voltageLevelsEquipmentsOptionsPromise
                        }
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
                        voltageLevelOptionsPromise={voltageLevelOptionsPromise}
                        voltageLevelsEquipmentsOptionsPromise={
                            voltageLevelsEquipmentsOptionsPromise
                        }
                    />
                </Box>

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EQUIPMENT_TYPE.TWO_WINDINGS_TRANSFORMER.name}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

TwoWindingsTransformerCreationDialog.propTypes = {
    editData: PropTypes.object,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    voltageLevelsEquipmentsOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
};

export default TwoWindingsTransformerCreationDialog;
