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
    ACTIVE_POWER_SET_POINT,
    ADD_AUTOMATE,
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_SECTION_COUNT,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    REACTIVE_POWER_SET_POINT,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
    VOLTAGE_REGULATION,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import PropTypes from 'prop-types';
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
import { createStaticCompensator } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import { getSetPointsEmptyFormData, getSetPointsSchema } from '../../../set-points/set-points-utils';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
} from '../../common/properties/property-utils';
import StaticVarCompensatorCreationDialogTabs, {
    StaticVarCompensatorCreationDialogTab,
} from './static-var-compensator-creation-dialog-tabs';
import { Grid } from '@mui/material';
import StaticVarCompensatorCreationForm from './static-var-compensator-creation-form';
import StaticVarCompensatorCreationDialogHeader from './static-var-compensator-creation-dialog-header';
import { getReactiveFormEmptyFormData, getReactiveFormValidationSchema } from './set-points-limits-form.jsx';
import { getAutomateEmptyFormData, getAutomateFormValidationSchema } from './automate-form.jsx';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [ADD_AUTOMATE]: false,
    ...getReactiveFormEmptyFormData(),
    ...getSetPointsEmptyFormData(),
    ...getConnectivityWithPositionEmptyFormData(),
    ...getAutomateEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [ADD_AUTOMATE]: yup.boolean.required,
        ...getReactiveFormValidationSchema(),
        ...getSetPointsSchema(),
        ...getConnectivityWithPositionValidationSchema(),
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
                    busbarSectionId: staticCompensator.busOrBusbarSectionId,
                    connectionDirection: staticCompensator.connectablePosition.connectionDirection,
                    connectionName: staticCompensator.connectablePosition.connectionName,
                    voltageLevelId: staticCompensator.voltageLevelId,
                }),
                [ACTIVE_POWER_SET_POINT]: staticCompensator.targetP,
                [VOLTAGE_SET_POINT]: staticCompensator.targetV,
                [REACTIVE_POWER_SET_POINT]: staticCompensator.targetQ,
                [VOLTAGE_REGULATION]: staticCompensator.voltageRegulatorOn,
                [VOLTAGE_REGULATION_TYPE]:
                    staticCompensator?.regulatingTerminalId || staticCompensator?.regulatingTerminalConnectableId
                        ? REGULATION_TYPES.DISTANT.id
                        : REGULATION_TYPES.LOCAL.id,
                [MAX_Q_AT_NOMINAL_V]: staticCompensator.maxQAtNominalV,
                [MIN_Q_AT_NOMINAL_V]: staticCompensator.maxQAtNominalV,
                [MAX_SUSCEPTANCE]: staticCompensator.maxSusceptance,
                [MIN_SUSCEPTANCE]: staticCompensator.maxSusceptance,
                [CHARACTERISTICS_CHOICE]: staticCompensator.maxP,
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
                    busbarSectionId: staticCompensator.busOrBusbarSectionId,
                    connectionDirection: staticCompensator.connectionDirection,
                    connectionName: staticCompensator.connectionName,
                    connectionPosition: staticCompensator.connectionPosition,
                    voltageLevelId: staticCompensator.voltageLevelId,
                    connected: staticCompensator.connected,
                }),
            });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
    });

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (staticCompensator) => {
            createStaticCompensator(
                studyUuid,
                currentNodeUuid,
                staticCompensator[EQUIPMENT_ID],
                sanitizeString(staticCompensator[EQUIPMENT_NAME]),
                staticCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
                    ? staticCompensator[MAX_SUSCEPTANCE]
                    : null,
                staticCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                    ? staticCompensator[MAX_Q_AT_NOMINAL_V]
                    : null,
                staticCompensator[CHARACTERISTICS_CHOICE] === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
                    ? staticCompensator[SHUNT_COMPENSATOR_TYPE]
                    : null,
                staticCompensator[SECTION_COUNT],
                staticCompensator[MAXIMUM_SECTION_COUNT],
                staticCompensator[CONNECTIVITY],
                !!editData,
                editData ? editData.uuid : undefined,
                staticCompensator[CONNECTIVITY]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                sanitizeString(staticCompensator[CONNECTIVITY]?.[CONNECTION_NAME]),
                staticCompensator[CONNECTIVITY]?.[CONNECTION_POSITION] ?? null,
                staticCompensator[CONNECTIVITY]?.[CONNECTED]
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
            tabsInError.push(StaticVarCompensatorCreationDialogTabs.CONNECTIVITY_TAB);
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
                <StaticVarCompensatorCreationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    tabIndex={tabIndex}
                    tabIndexesWithError={tabIndexesWithError}
                    setTabIndex={setTabIndex}
                />
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

StaticVarCompensatorCreationDialog.propTypes = {
    editData: PropTypes.object,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default StaticVarCompensatorCreationDialog;
