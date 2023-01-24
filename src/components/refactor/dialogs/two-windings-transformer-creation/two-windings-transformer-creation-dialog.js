/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ModificationDialog from '../commons/modificationDialog';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EQUIPMENT_TYPE, useSnackMessage } from '@gridsuite/commons-ui';

import { FormProvider, useForm } from 'react-hook-form';
import yup from '../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    BUS_OR_BUSBAR_SECTION,
    BUS_OR_BUSBAR_SECTION_ID,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    getConnectivityEmptyFormData,
    getConnectivityFormData,
    getConnectivityFormValidationSchema,
    VOLTAGE_LEVEL_ID,
} from '../connectivity/connectivity-form-utils';
import { Box } from '@mui/material';
import TwoWindingsTransformerPane from './two-windings-transformer-pane/two-windings-transformer-pane';
import RatioTapChangerPane from './ratio-tap-changer-pane/ratio-tap-changer-pane';
import PhaseTapChangerPane from './phase-tap-changer-pane/phase-tap-changer-pane';
import {
    getPhaseTapChangerEmptyFormData,
    getPhaseTapChangerFormData,
    getPhaseTapChangerValidationSchema,
    PHASE_TAP_CHANGER,
    REGULATION_MODE,
} from './phase-tap-changer-pane/phase-tap-changer-pane-utils';
import {
    getRatioTapChangerEmptyFormData,
    getRatioTapChangerFormData,
    getRatioTapChangerValidationSchema,
    LOAD_TAP_CHANGING_CAPABILITIES,
    RATIO_TAP_CHANGER,
    TARGET_V,
} from './ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import {
    getTwoWindingsTransformerEmptyFormData,
    getTwoWindingsTransformerFormData,
    getTwoWindingsTransformerValidationSchema,
} from './two-windings-transformer-pane/two-windings-transformer-pane-utils';
import {
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    ENABLED,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LOW_TAP_POSITION,
    MAGNETIZING_CONDUCTANCE,
    MAGNETIZING_SUSCEPTANCE,
    PERMANENT_LIMIT,
    RATED_S,
    RATED_VOLTAGE_1,
    RATED_VOLTAGE_2,
    REGULATING,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    STEPS,
    STEPS_TAP,
    TAP_POSITION,
    TARGET_DEADBAND,
} from './two-windings-transformer-creation-dialog-utils';
import { useFormSearchCopy } from '../../../dialogs/form-search-copy-hook';
import EquipmentSearchDialog from '../../../dialogs/equipment-search-dialog';
import { createTwoWindingsTransformer } from '../../../../utils/rest-api';
import { VOLTAGE_LEVEL } from '../regulating-terminal/regulating-terminal-form-utils';
import { UNDEFINED_CONNECTION_DIRECTION } from '../../../network/constants';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import TwoWindingsTransformerCreationDialogTabs from './two-windings-transformer-creation-dialog-tabs';

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
    ...getConnectivityEmptyFormData(CONNECTIVITY_1),
    ...getConnectivityEmptyFormData(CONNECTIVITY_2),
};

const schema = yup
    .object()
    .shape({
        ...getTwoWindingsTransformerValidationSchema(),
        ...getRatioTapChangerValidationSchema(),
        ...getPhaseTapChangerValidationSchema(),
        ...getConnectivityFormValidationSchema(CONNECTIVITY_1),
        ...getConnectivityFormValidationSchema(CONNECTIVITY_2),
    })
    .required();

export const TwoWindingsTransformerCreationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    RATIO_TAP_TAB: 1,
    PHASE_TAP_TAB: 2,
};

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
                    equipmentId: twt.equipmentId,
                    equipmentName: twt.equipmentName,
                    seriesResistance: twt.seriesResistance,
                    seriesReactance: twt.seriesReactance,
                    magnetizingConductance: twt.magnetizingConductance,
                    magnetizingSusceptance: twt.magnetizingSusceptance,
                    ratedVoltageLevel1: twt.ratedVoltageLevel1,
                    ratedVoltageLevel2: twt.ratedVoltageLevel2,
                    ratedS: twt.ratedS,
                    permanentLimit1: twt.currentLimits1?.permanentLimit,
                    permanentLimit2: twt.currentLimits2?.permanentLimit,
                }),
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
                    equipmentId: twt.id,
                    equipmentName: twt.name,
                    seriesResistance: twt.r,
                    seriesReactance: twt.x,
                    magnetizingConductance: twt.g,
                    magnetizingSusceptance: twt.b,
                    ratedVoltageLevel1: twt.ratedU1,
                    ratedVoltageLevel2: twt.ratedU2,
                    ratedS: twt.ratedS,
                    permanentLimit1: twt.permanentLimit1,
                    permanentLimit2: twt.permanentLimit2,
                }),
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
                ...twt,
            });
        },
        [reset]
    );

    // const toFormValues = (twt) => {
    //     return {
    //         equipmentId: twt.id + '(1)',
    //         equipmentName: twt.name ?? '',
    //         seriesResistance: twt.r,
    //         seriesReactance: twt.x,
    //         magnetizingConductance: twt.g,
    //         magnetizingSusceptance: twt.b,
    //         ratedVoltage1: twt.ratedU1,
    //         ratedVoltage2: twt.ratedU2,
    //         ratedS: twt.ratedS,
    //         voltageLevelId1: twt.voltageLevelId1,
    //         busOrBusbarSectionId1: null,
    //         voltageLevelId2: twt.voltageLevelId2,
    //         busOrBusbarSectionId2: null,
    //         currentLimits1: {
    //             permanentLimit: twt.permanentLimit1,
    //         },
    //         currentLimits2: {
    //             permanentLimit: twt.permanentLimit2,
    //         },
    //         ratioTapChanger: {
    //             regulating: twt.ratioTapChanger?.regulating,
    //             loadTapChangingCapabilities:
    //                 twt.ratioTapChanger?.loadTapChangingCapabilities,
    //             targetV: twt.ratioTapChanger?.targetV,
    //             targetDeadband: isNaN(twt.ratioTapChanger?.targetDeadBand)
    //                 ? ''
    //                 : twt.ratioTapChanger?.targetDeadBand,
    //             regulatingTerminalVlId:
    //                 twt.ratioTapChanger?.regulatingTerminalVlId,
    //             regulatingTerminalType:
    //                 twt.ratioTapChanger?.regulatingTerminalConnectableType,
    //             regulatingTerminalId:
    //                 twt.ratioTapChanger?.regulatingTerminalConnectableId,
    //             lowTapPosition: twt.ratioTapChanger?.lowTapPosition,
    //             tapPosition: twt.ratioTapChanger?.tapPosition,
    //         },
    //         phaseTapChanger: {
    //             regulationMode: twt.phaseTapChanger?.regulationMode,
    //             regulating: twt.phaseTapChanger?.regulating,
    //             loadTapChangingCapabilities:
    //                 twt.phaseTapChanger?.loadTapChangingCapabilities,
    //             regulationValue: twt.phaseTapChanger?.regulationValue,
    //             targetDeadband: isNaN(twt.phaseTapChanger?.targetDeadBand)
    //                 ? ''
    //                 : twt.phaseTapChanger?.targetDeadBand,
    //             regulatingTerminalVlId:
    //                 twt.phaseTapChanger?.regulatingTerminalVlId,
    //             regulatingTerminalType:
    //                 twt.phaseTapChanger?.regulatingTerminalConnectableType,
    //             regulatingTerminalId:
    //                 twt.phaseTapChanger?.regulatingTerminalConnectableId,
    //             lowTapPosition: twt.phaseTapChanger?.lowTapPosition,
    //             tapPosition: twt.phaseTapChanger?.tapPosition,
    //         },
    //         connectionDirection1: twt.connectionDirection1,
    //         connectionName1: twt.connectionName1,
    //         connectionDirection2: twt.connectionDirection2,
    //         connectionName2: twt.connectionName2,
    //         connectionPosition1: twt.connectionPosition1,
    //         connectionPosition2: twt.connectionPosition2,
    //     };
    // };

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

    const renderSubtitle = useMemo(() => {
        return (
            <TwoWindingsTransformerCreationDialogTabs
                tabIndex={tabIndex}
                tabIndexesWithError={tabIndexesWithError}
                setTabIndex={setTabIndex}
                setDialogWidth={setDialogWidth}
            />
        );
    }, [tabIndex, tabIndexesWithError]);

    const onSubmit = useCallback(
        (twt) => {
            const enablePhaseTapChanger = twt[PHASE_TAP_CHANGER]?.[ENABLED];
            const enableRatioTapChanger = twt[RATIO_TAP_CHANGER]?.[ENABLED];
            createTwoWindingsTransformer(
                studyUuid,
                currentNodeUuid,
                twt[EQUIPMENT_ID],
                sanitizeString(twt[EQUIPMENT_NAME]),
                twt[SERIES_RESISTANCE],
                twt[SERIES_REACTANCE],
                twt[MAGNETIZING_CONDUCTANCE],
                twt[MAGNETIZING_SUSCEPTANCE],
                twt[RATED_S],
                twt[RATED_VOLTAGE_1],
                twt[RATED_VOLTAGE_2],
                twt[CURRENT_LIMITS_1]?.[PERMANENT_LIMIT],
                twt[CURRENT_LIMITS_2]?.[PERMANENT_LIMIT],
                twt[CONNECTIVITY_1]?.[VOLTAGE_LEVEL]?.[VOLTAGE_LEVEL_ID],
                twt[CONNECTIVITY_1]?.[BUS_OR_BUSBAR_SECTION]?.[
                    BUS_OR_BUSBAR_SECTION_ID
                ],
                twt[CONNECTIVITY_2]?.[VOLTAGE_LEVEL]?.[VOLTAGE_LEVEL_ID],
                twt[CONNECTIVITY_2]?.[BUS_OR_BUSBAR_SECTION]?.[
                    BUS_OR_BUSBAR_SECTION_ID
                ],
                enableRatioTapChanger ? twt[RATIO_TAP_CHANGER] : undefined,
                enablePhaseTapChanger ? twt[PHASE_TAP_CHANGER] : undefined,
                editData ? true : false,
                editData ? editData.uuid : undefined,
                twt[CONNECTIVITY_1]?.[CONNECTION_NAME] ?? null,
                twt[CONNECTIVITY_1]?.[CONNECTION_DIRECTION] ??
                    UNDEFINED_CONNECTION_DIRECTION,
                twt[CONNECTIVITY_2]?.[CONNECTION_NAME] ?? null,
                twt[CONNECTIVITY_2]?.[CONNECTION_DIRECTION] ??
                    UNDEFINED_CONNECTION_DIRECTION,
                twt[CONNECTIVITY_1]?.[CONNECTION_POSITION] ?? null,
                twt[CONNECTIVITY_2]?.[CONNECTION_POSITION] ?? null
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
        // alert(JSON.stringify(errors, null, 4));
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
        if (true) {
            //TODO: change to accurate test
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
                subtitle={renderSubtitle}
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
