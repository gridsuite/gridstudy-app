/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import {
    ADD_AUTOMATE,
    ADDIONAL_INFOS,
    AUTOMATE,
    B0,
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    EQUIPMENT,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HIGH_VOLTAGE_SET_POINT,
    HIGH_VOLTAGE_THRESHOLD,
    ID,
    LOW_VOLTAGE_SET_LIMIT,
    LOW_VOLTAGE_THRESHOLD,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    Q0,
    REACTIVE_POWER_SET_POINT,
    REGULATION_MODE,
    SETPOINTS_LIMITS,
    STAND_BY_AUTOMATE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { sanitizeString } from '../../../dialogUtils';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useFormSearchCopy } from '../../../form-search-copy-hook';
import { FORM_LOADING_DELAY, REGULATION_TYPES, UNDEFINED_CONNECTION_DIRECTION } from 'components/network/constants';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../../commons/modificationDialog';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';
import { createStaticVarCompensator } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    getPropertiesFromModification,
    toModificationProperties,
} from '../../common/properties/property-utils';
import StaticVarCompensatorCreationDialogTabs, {
    StaticVarCompensatorCreationDialogTab,
} from './static-var-compensator-creation-dialog-tabs';
import { Grid } from '@mui/material';
import StaticVarCompensatorCreationForm from './static-var-compensator-creation-form';
import StaticVarCompensatorCreationDialogHeader from './static-var-compensator-creation-dialog-header';
import {
    getReactiveFormData,
    getReactiveFormEmptyFormData,
    getReactiveFormValidationSchema,
} from './set-points-limits-form';
import { getAutomateEmptyFormData, getAutomateFormData, getAutomateFormValidationSchema } from './automate-form';
import { getRegulatingTerminalFormData } from '../../../regulating-terminal/regulating-terminal-form-utils.js';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [ADD_AUTOMATE]: false,
    ...getConnectivityWithPositionEmptyFormData(),
    ...getReactiveFormEmptyFormData(),
    ...getAutomateEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        ...getConnectivityWithPositionValidationSchema(),
        ...getReactiveFormValidationSchema(),
        ...getAutomateFormValidationSchema(),
    })
    .concat(creationPropertiesSchema)
    .required();

/**
 * Dialog to create a static compensator in the network
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const StaticVarCompensatorCreationDialog = ({
    studyUuid,
    currentNode,
    editData,
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
    const [tabIndex, setTabIndex] = useState(StaticVarCompensatorCreationDialogTab.CONNECTIVITY_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);
    const fromSearchCopyToFormValues = useCallback(
        (staticCompensator) => {
            reset({
                [EQUIPMENT_ID]: staticCompensator.id + '(1)',
                [EQUIPMENT_NAME]: staticCompensator.name ?? '',
                ...getConnectivityFormData({
                    voltageLevelId: staticCompensator.voltageLevelId,
                    busbarSectionId: staticCompensator.busOrBusbarSectionId,
                    connectionDirection: staticCompensator.connectablePosition.connectionDirection,
                    connectionName: staticCompensator.connectablePosition.connectionName,
                    connectionPosition: staticCompensator.connectionPosition,
                }),
                ...getReactiveFormData({
                    maxSusceptance: staticCompensator.maxSusceptance,
                    minSusceptance: staticCompensator.minSusceptance,
                    maxQAtNominalV: staticCompensator.maxQAtNominalV,
                    minQAtNominalV: staticCompensator.minQAtNominalV,
                    voltageSetpoint: staticCompensator.targetV,
                    reactivePowerSetPoint: staticCompensator.targetQ,
                }),
                [VOLTAGE_REGULATION_TYPE]:
                    staticCompensator?.regulatingTerminalId || staticCompensator?.regulatingTerminalConnectableId
                        ? REGULATION_TYPES.DISTANT.id
                        : REGULATION_TYPES.LOCAL.id,
                ...getRegulatingTerminalFormData({
                    equipmentId:
                        staticCompensator.regulatingTerminalConnectableId || staticCompensator.regulatingTerminalId,
                    equipmentType: staticCompensator.regulatingTerminalConnectableType,
                    voltageLevelId: staticCompensator.regulatingTerminalVlId,
                }),
                ...getAutomateFormData({
                    addAutomate: staticCompensator.addAutomate,
                    standBy: staticCompensator.standBy,
                    lVoltageSetPoint: staticCompensator.lowVoltageSetPoint,
                    hVoltageSetPoint: staticCompensator.highVoltageSetPoint,
                    lVoltageThreshold: staticCompensator.lowVoltageThreshold,
                    hVoltageThreshold: staticCompensator.highVoltageThreshold,
                    minSusceptance: staticCompensator.minSusceptance,
                    maxSusceptance: staticCompensator.maxSusceptance,
                    minQAtNormalV: staticCompensator.minQAtNormalV,
                    maxQAtNormalV: staticCompensator.maxQAtNominalV,
                    q0: staticCompensator.q0,
                    b0: staticCompensator.b0,
                }),
                ...copyEquipmentPropertiesForCreation(staticCompensator),
            });
        },
        [reset]
    );

    const fromEditDataToFormValues = useCallback(
        (staticCompensator) => {
            reset({
                [EQUIPMENT_ID]: staticCompensator.equipmentId,
                [EQUIPMENT_NAME]: staticCompensator.equipmentName ?? '',
                ...getConnectivityFormData({
                    voltageLevelId: staticCompensator.voltageLevelId,
                    busbarSectionId: staticCompensator.busOrBusbarSectionId,
                    connectionDirection: staticCompensator.connectionDirection,
                    connectionName: staticCompensator.connectionName,
                    connectionPosition: staticCompensator.connectionPosition,
                    terminalConnected: staticCompensator.terminalConnected,
                }),
                ...getReactiveFormData({
                    maxSusceptance: staticCompensator.maxSusceptance,
                    minSusceptance: staticCompensator.minSusceptance,
                    maxQAtNominalV: staticCompensator.maxQAtNominalV,
                    minQAtNominalV: staticCompensator.minQAtNominalV,
                    voltageSetpoint: staticCompensator.targetV,
                    reactivePowerSetPoint: staticCompensator.targetQ,
                }),
                [VOLTAGE_REGULATION_TYPE]:
                    staticCompensator?.regulatingTerminalId || staticCompensator?.regulatingTerminalConnectableId
                        ? REGULATION_TYPES.DISTANT.id
                        : REGULATION_TYPES.LOCAL.id,
                ...getRegulatingTerminalFormData({
                    equipmentId:
                        staticCompensator.regulatingTerminalConnectableId || staticCompensator.regulatingTerminalId,
                    equipmentType: staticCompensator.regulatingTerminalConnectableType,
                    voltageLevelId: staticCompensator.regulatingTerminalVlId,
                }),
                ...getAutomateFormData({
                    addAutomate: staticCompensator.addAutomate,
                    standBy: staticCompensator.standBy,
                    lVoltageSetPoint: staticCompensator.lowVoltageSetPoint,
                    hVoltageSetPoint: staticCompensator.highVoltageSetPoint,
                    lVoltageThreshold: staticCompensator.lowVoltageThreshold,
                    hVoltageThreshold: staticCompensator.highVoltageThreshold,
                    minSusceptance: staticCompensator.minSusceptance,
                    maxSusceptance: staticCompensator.maxSusceptance,
                    minQAtNormalV: staticCompensator.minQAtNormalV,
                    maxQAtNormalV: staticCompensator.maxQAtNominalV,
                    q0: staticCompensator.q0,
                    b0: staticCompensator.b0,
                }),
                ...getPropertiesFromModification(staticCompensator.properties),
            });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR,
    });

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (staticCompensator) => {
            const isDistantRegulation = staticCompensator[VOLTAGE_REGULATION_TYPE] === REGULATION_TYPES.DISTANT.id;
            createStaticVarCompensator(
                studyUuid,
                currentNodeUuid,
                staticCompensator[EQUIPMENT_ID],
                sanitizeString(staticCompensator[EQUIPMENT_NAME]),
                staticCompensator[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                staticCompensator[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                sanitizeString(staticCompensator[CONNECTIVITY]?.[CONNECTION_NAME]),
                staticCompensator[CONNECTIVITY]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                staticCompensator[CONNECTIVITY]?.[CONNECTION_POSITION],
                staticCompensator[CONNECTIVITY]?.[CONNECTED],
                staticCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
                    ? staticCompensator[MAX_SUSCEPTANCE]
                    : null,
                staticCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
                    ? staticCompensator[MIN_SUSCEPTANCE]
                    : null,
                staticCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                    ? staticCompensator[MAX_Q_AT_NOMINAL_V]
                    : null,
                staticCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                    ? staticCompensator[MIN_Q_AT_NOMINAL_V]
                    : null,
                sanitizeString(staticCompensator[REGULATION_MODE]),
                staticCompensator[VOLTAGE_SET_POINT],
                staticCompensator[REACTIVE_POWER_SET_POINT],
                staticCompensator[VOLTAGE_REGULATION_TYPE],
                isDistantRegulation ? staticCompensator[EQUIPMENT]?.id : null,
                isDistantRegulation ? staticCompensator[EQUIPMENT]?.type : null,
                isDistantRegulation ? staticCompensator[VOLTAGE_LEVEL]?.id : null,
                staticCompensator[ADD_AUTOMATE] ? staticCompensator[STAND_BY_AUTOMATE] : null,
                staticCompensator[ADD_AUTOMATE] ? staticCompensator[LOW_VOLTAGE_SET_LIMIT] : null,
                staticCompensator[ADD_AUTOMATE] ? staticCompensator[HIGH_VOLTAGE_SET_POINT] : null,
                staticCompensator[ADD_AUTOMATE] ? staticCompensator[LOW_VOLTAGE_THRESHOLD] : null,
                staticCompensator[ADD_AUTOMATE] ? staticCompensator[HIGH_VOLTAGE_THRESHOLD] : null,
                staticCompensator[ADD_AUTOMATE] ? staticCompensator[B0] : null,
                staticCompensator[ADD_AUTOMATE] ? staticCompensator[Q0] : null,
                !!editData,
                editData ? editData.uuid : undefined,
                toModificationProperties(staticCompensator)
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'ShuntCompensatorCreationError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const onValidationError = (errors) => {
        let tabsInError = [];
        if (errors?.[CONNECTIVITY] !== undefined) {
            tabsInError.push(StaticVarCompensatorCreationDialogTab.CONNECTIVITY_TAB);
        }
        if (errors?.[SETPOINTS_LIMITS] !== undefined) {
            tabsInError.push(StaticVarCompensatorCreationDialogTab.SET_POINTS_LIMITS_TAB);
        }
        if (errors?.[AUTOMATE] !== undefined) {
            tabsInError.push(StaticVarCompensatorCreationDialogTab.AUTOMATON_TAB);
        }
        if (errors?.[ADDIONAL_INFOS] !== undefined) {
            tabsInError.push(StaticVarCompensatorCreationDialogTab.ADDITIONAL_INFO_TAB);
        }
        if (tabsInError.length > 0) {
            setTabIndex(tabsInError[0]);
        }
        setTabIndexesWithError(tabsInError);
    };

    const headerAndTabs = (
        <Grid container spacing={2}>
            <StaticVarCompensatorCreationDialogHeader />
            <StaticVarCompensatorCreationDialogTabs
                tabIndex={tabIndex}
                tabIndexesWithError={tabIndexesWithError}
                setTabIndex={setTabIndex}
            />
        </Grid>
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'md'}
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-staticCompensator"
                titleId="CreateStaticVarCompensator"
                subtitle={headerAndTabs}
                searchCopy={searchCopy}
                onValidationError={onValidationError}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                PaperProps={{
                    sx: {
                        height: '55vh', // we want the dialog height to be fixed even when switching tabs
                    },
                }}
                {...dialogProps}
            >
                <StaticVarCompensatorCreationForm studyUuid={studyUuid} currentNode={currentNode} tabIndex={tabIndex} />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default StaticVarCompensatorCreationDialog;
