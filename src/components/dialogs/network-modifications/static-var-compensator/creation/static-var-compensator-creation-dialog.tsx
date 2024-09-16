/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, EquipmentType, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import {
    ADD_STAND_BY_AUTOMATON,
    ADDIONAL_INFOS,
    ADDITIONAL_PROPERTIES,
    AUTOMATON,
    B0,
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICE_AUTOMATON,
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
    LOW_VOLTAGE_SET_POINT,
    LOW_VOLTAGE_THRESHOLD,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    Q0,
    REACTIVE_POWER_SET_POINT,
    SETPOINTS_LIMITS,
    SLIDER_Q_NOMINAL,
    SLIDER_SUSCEPTANCE,
    STAND_BY_AUTOMATON,
    TYPE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION_MODE,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import React, { FC, useCallback, useEffect, useState } from 'react';
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
    getConnectivityWithPositionSchema,
} from '../../../connectivity/connectivity-form-utils';
import { createStaticVarCompensator } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    getPropertiesFromModification,
    Property,
    toModificationProperties,
} from '../../common/properties/property-utils';
import StaticVarCompensatorCreationDialogTabs, {
    StaticVarCompensatorCreationDialogTab,
} from './static-var-compensator-creation-dialog-tabs';
import { Grid } from '@mui/material';
import StaticVarCompensatorCreationForm from './static-var-compensator-creation-form';
import StaticVarCompensatorCreationDialogHeader from './static-var-compensator-creation-dialog-header';
import { getRegulatingTerminalFormData } from '../../../regulating-terminal/regulating-terminal-form-utils';
import {
    getReactiveFormData,
    getReactiveFormDataValues,
    getReactiveFormEmptyFormData,
    getReactiveFormValidationSchema,
} from './set-points-limits-form-utils';
import {
    getStandbyAutomatonEmptyFormData,
    getStandbyAutomatonFormData,
    getStandbyAutomatonFormDataValues,
    getStandbyAutomatonFormValidationSchema,
} from './stand-by-automaton-form-utils';
import { DeepNullable } from '../../../../utils/ts-utils';

export type StaticVarCompensatorCreationSchemaForm = {
    [EQUIPMENT_ID]: string;
    [EQUIPMENT_NAME]?: string;
    // Connectivity
    [CONNECTIVITY]: {
        [CONNECTION_DIRECTION]?: string;
        [CONNECTION_NAME]?: string;
        [CONNECTION_POSITION]?: number;
        [CONNECTED]?: boolean;
    };
    // Reactive
    [MAX_SUSCEPTANCE]?: number;
    [MIN_SUSCEPTANCE]?: number;
    [MAX_Q_AT_NOMINAL_V]?: number;
    [MIN_Q_AT_NOMINAL_V]?: number;
    [VOLTAGE_SET_POINT]?: number;
    [REACTIVE_POWER_SET_POINT]?: number;
    [CHARACTERISTICS_CHOICE]?: string;
    [VOLTAGE_REGULATION_MODE]?: string;
    [VOLTAGE_REGULATION_TYPE]?: string;
    [VOLTAGE_LEVEL]?: {
        [ID]: string;
    };
    [EQUIPMENT]?: {
        [ID]: string;
        [TYPE]: string;
    };
    // Standby automaton
    [ADD_STAND_BY_AUTOMATON]?: boolean;
    [STAND_BY_AUTOMATON]?: boolean;
    [LOW_VOLTAGE_SET_POINT]?: number;
    [HIGH_VOLTAGE_SET_POINT]?: number;
    [LOW_VOLTAGE_THRESHOLD]?: number;
    [HIGH_VOLTAGE_THRESHOLD]?: number;
    [CHARACTERISTICS_CHOICE_AUTOMATON]?: string;
    [B0]?: number;
    [Q0]?: number;
    [SLIDER_SUSCEPTANCE]?: number;
    [SLIDER_Q_NOMINAL]?: number;
    // Properties
    [ADDITIONAL_PROPERTIES]?: Property[];
};

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    ...getConnectivityWithPositionEmptyFormData(),
    ...getReactiveFormEmptyFormData(),
    ...getStandbyAutomatonEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [CONNECTIVITY]: getConnectivityWithPositionSchema(false),
        ...getReactiveFormValidationSchema(),
        ...getStandbyAutomatonFormValidationSchema(),
    })
    .concat(creationPropertiesSchema)
    .required();

/**
 * Dialog to create a static compensator in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const StaticVarCompensatorCreationDialog: FC<any> = ({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<StaticVarCompensatorCreationSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<StaticVarCompensatorCreationSchemaForm>>(formSchema),
    });

    const { reset } = formMethods;
    const [tabIndex, setTabIndex] = useState(StaticVarCompensatorCreationDialogTab.CONNECTIVITY_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);
    const fromSearchCopyToFormValues = useCallback(
        (staticCompensator: any) => {
            reset({
                [EQUIPMENT_ID]: staticCompensator.id + '(1)',
                [EQUIPMENT_NAME]: staticCompensator.name ?? '',
                ...getConnectivityFormData({
                    voltageLevelId: staticCompensator.voltageLevelId ?? null,
                    busbarSectionId: staticCompensator.busOrBusbarSectionId ?? null,
                    busbarSectionName: undefined,
                    connectionDirection: staticCompensator.connectablePosition.connectionDirection ?? null,
                    connectionName: staticCompensator.connectablePosition.connectionName ?? null,
                    connectionPosition: staticCompensator.connectablePosition.connectionPosition ?? null,
                    terminalConnected: undefined,
                    isEquipmentModification: false,
                }),
                ...getReactiveFormData({
                    maxSusceptance: staticCompensator.maxSusceptance ?? null,
                    minSusceptance: staticCompensator.minSusceptance ?? null,
                    nominalV: staticCompensator.nominalV,
                    regulationMode: staticCompensator.regulationMode,
                    voltageSetpoint: staticCompensator.voltageSetpoint,
                    reactivePowerSetpoint: staticCompensator.reactivePowerSetpoint,
                    voltageRegulationType:
                        staticCompensator?.regulatingTerminalId || staticCompensator?.regulatingTerminalConnectableId
                            ? REGULATION_TYPES.DISTANT.id
                            : REGULATION_TYPES.LOCAL.id,
                }),
                ...getRegulatingTerminalFormData({
                    voltageLevelId: staticCompensator.regulatingTerminalVlId,
                    voltageLevelName: undefined,
                    voltageLevelNominalVoltage: undefined,
                    voltageLevelSubstationId: undefined,
                    voltageLevelTopologyKind: undefined,
                    equipmentId:
                        staticCompensator.regulatingTerminalConnectableId || staticCompensator.regulatingTerminalId,
                    equipmentName: undefined,
                    equipmentType: staticCompensator.regulatingTerminalConnectableType,
                }),
                ...getStandbyAutomatonFormData({
                    addStandbyAutomaton: !!staticCompensator.standbyAutomatonInfos,
                    standby: staticCompensator.standbyAutomatonInfos?.standby,
                    b0: staticCompensator.standbyAutomatonInfos?.b0,
                    nominalV: staticCompensator.nominalV,
                    lVoltageSetpoint: staticCompensator.standbyAutomatonInfos?.lowVoltageSetpoint,
                    hVoltageSetpoint: staticCompensator.standbyAutomatonInfos?.highVoltageSetpoint,
                    lVoltageThreshold: staticCompensator.standbyAutomatonInfos?.lowVoltageThreshold,
                    hVoltageThreshold: staticCompensator.standbyAutomatonInfos?.highVoltageThreshold,
                }),
                ...copyEquipmentPropertiesForCreation(staticCompensator),
            });
        },
        [reset]
    );

    const fromEditDataToFormValues = useCallback(
        (staticCompensator: any) => {
            reset({
                [EQUIPMENT_ID]: staticCompensator.equipmentId,
                [EQUIPMENT_NAME]: staticCompensator.equipmentName ?? '',
                ...getConnectivityFormData({
                    voltageLevelId: staticCompensator.voltageLevelId,
                    busbarSectionId: staticCompensator.busOrBusbarSectionId,
                    busbarSectionName: undefined,
                    connectionDirection: staticCompensator.connectionDirection,
                    connectionName: staticCompensator.connectionName,
                    connectionPosition: staticCompensator.connectionPosition,
                    terminalConnected: staticCompensator.terminalConnected,
                    isEquipmentModification: false,
                }),
                ...getReactiveFormDataValues({
                    maxSusceptance: staticCompensator.maxSusceptance,
                    minSusceptance: staticCompensator.minSusceptance,
                    maxQAtNominalV: staticCompensator.maxQAtNominalV,
                    minQAtNominalV: staticCompensator.minQAtNominalV,
                    regulationMode: staticCompensator.regulationMode,
                    voltageSetpoint: staticCompensator.voltageSetpoint,
                    reactivePowerSetpoint: staticCompensator.reactivePowerSetpoint,
                    voltageRegulationType:
                        staticCompensator?.regulatingTerminalId || staticCompensator?.regulatingTerminalConnectableId
                            ? REGULATION_TYPES.DISTANT.id
                            : REGULATION_TYPES.LOCAL.id,
                }),
                ...getRegulatingTerminalFormData({
                    equipmentId:
                        staticCompensator.regulatingTerminalConnectableId || staticCompensator.regulatingTerminalId,
                    voltageLevelName: undefined,
                    equipmentType: staticCompensator.regulatingTerminalType,
                    voltageLevelId: staticCompensator.regulatingTerminalVlId,
                    voltageLevelNominalVoltage: undefined,
                    voltageLevelSubstationId: undefined,
                    voltageLevelTopologyKind: undefined,
                    equipmentName: undefined,
                }),
                ...getStandbyAutomatonFormDataValues({
                    standbyAutomatonOn: staticCompensator.standbyAutomatonOn,
                    standby: staticCompensator.standby,
                    lVoltageSetpoint: staticCompensator.lowVoltageSetpoint ?? null,
                    hVoltageSetpoint: staticCompensator.highVoltageSetpoint ?? null,
                    lVoltageThreshold: staticCompensator.lowVoltageThreshold ?? null,
                    hVoltageThreshold: staticCompensator.highVoltageThreshold ?? null,
                    b0: staticCompensator.b0,
                    q0: staticCompensator.q0,
                }),
                ...getPropertiesFromModification(staticCompensator.properties),
            });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: (data: StaticVarCompensatorCreationSchemaForm) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR,
        operation: undefined,
    });

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (staticCompensator: any) => {
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
                staticCompensator[VOLTAGE_REGULATION_MODE],
                staticCompensator[VOLTAGE_SET_POINT],
                staticCompensator[REACTIVE_POWER_SET_POINT],
                staticCompensator[VOLTAGE_REGULATION_TYPE],
                isDistantRegulation ? staticCompensator[EQUIPMENT]?.id : null,
                isDistantRegulation ? staticCompensator[EQUIPMENT]?.type : null,
                isDistantRegulation ? staticCompensator[VOLTAGE_LEVEL]?.id : null,
                staticCompensator[ADD_STAND_BY_AUTOMATON],
                staticCompensator[STAND_BY_AUTOMATON],
                staticCompensator[ADD_STAND_BY_AUTOMATON] ? staticCompensator[LOW_VOLTAGE_SET_POINT] : null,
                staticCompensator[ADD_STAND_BY_AUTOMATON] ? staticCompensator[HIGH_VOLTAGE_SET_POINT] : null,
                staticCompensator[ADD_STAND_BY_AUTOMATON] ? staticCompensator[LOW_VOLTAGE_THRESHOLD] : null,
                staticCompensator[ADD_STAND_BY_AUTOMATON] ? staticCompensator[HIGH_VOLTAGE_THRESHOLD] : null,
                staticCompensator[ADD_STAND_BY_AUTOMATON] ? staticCompensator[B0] : null,
                staticCompensator[ADD_STAND_BY_AUTOMATON] ? staticCompensator[Q0] : null,
                !!editData,
                editData ? editData.uuid : undefined,
                toModificationProperties(staticCompensator)
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'StaticVarCompensatorCreationError',
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

    const onValidationError = (errors: any) => {
        let tabsInError = [];
        if (errors?.[CONNECTIVITY] !== undefined) {
            tabsInError.push(StaticVarCompensatorCreationDialogTab.CONNECTIVITY_TAB);
        }
        if (errors?.[SETPOINTS_LIMITS] !== undefined) {
            tabsInError.push(StaticVarCompensatorCreationDialogTab.SET_POINTS_LIMITS_TAB);
        }
        if (errors?.[AUTOMATON] !== undefined) {
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
                    onSelectionChange={searchCopy.handleSelectionChange}
                    equipmentType={EquipmentType.STATIC_VAR_COMPENSATOR}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default StaticVarCompensatorCreationDialog;