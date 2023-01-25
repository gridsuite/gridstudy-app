/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import ModificationDialog from './modificationDialog';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    LOAD_TYPES,
    UNDEFINED_CONNECTION_DIRECTION,
    UNDEFINED_LOAD_TYPE,
} from '../network/constants';
import {
    useDoubleValue,
    useOptionalEnumValue,
    useInputForm,
    useTextValue,
} from './inputs/input-hooks';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
    sanitizeString,
} from './dialogUtils';

import { createLoad } from '../../utils/rest-api';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';
import { useConnectivityValue } from './connectivity-edition';
import { EQUIPMENT_TYPES } from '../util/equipment-types';

/**
 * Dialog to create a load in the network
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param currentNodeUuid The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const LoadCreationDialog = ({
    editData,
    voltageLevelOptionsPromise,
    currentNodeUuid,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const equipmentPath = 'loads';

    const toFormValues = (load) => {
        return {
            equipmentId: load.id + '(1)',
            equipmentName: load.name ?? '',
            loadType: load.type,
            activePower: load.p0,
            reactivePower: load.q0,
            voltageLevelId: load.voltageLevelId,
            busOrBusbarSectionId: null,
            connectionDirection: load.connectionDirection,
            connectionName: load.connectionName,
            connectionPosition: load.connectionPosition,
        };
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues,
        setFormValues,
    });

    useEffect(() => {
        if (editData) {
            setFormValues(editData);
        }
    }, [editData]);

    const [loadId, loadIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentId,
    });

    const [loadName, loadNameField] = useTextValue({
        label: 'Name',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName,
    });

    const [loadType, loadTypeField] = useOptionalEnumValue({
        label: 'Type',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        formProps: filledTextField,
        enumObjects: LOAD_TYPES,
        defaultValue:
            formValues?.loadType && formValues.loadType !== UNDEFINED_LOAD_TYPE
                ? formValues.loadType
                : null,
    });

    const [activePower, activePowerField] = useDoubleValue({
        label: 'ActivePowerText',
        validation: {
            isFieldRequired: true,
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues ? String(formValues.activePower) : undefined,
    });

    const [reactivePower, reactivePowerField] = useDoubleValue({
        label: 'ReactivePowerText',
        validation: {
            isFieldRequired: true,
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues ? String(formValues.reactivePower) : undefined,
    });

    const [connectivity, connectivityField] = useConnectivityValue({
        label: 'Connectivity',
        inputForm: inputForm,
        voltageLevelOptionsPromise: voltageLevelOptionsPromise,
        currentNodeUuid: currentNodeUuid,
        voltageLevelIdDefaultValue: formValues?.voltageLevelId || null,
        busOrBusbarSectionIdDefaultValue:
            formValues?.busOrBusbarSectionId || null,
        connectionDirectionValue: formValues
            ? formValues.connectionDirection
            : '',
        connectionNameValue: formValues?.connectionName,
        connectionPositionValue: formValues?.connectionPosition,
        withPosition: true,
    });

    const handleValidation = () => {
        return inputForm.validate();
    };

    const handleSave = () => {
        createLoad(
            studyUuid,
            currentNodeUuid,
            loadId,
            sanitizeString(loadName),
            !loadType ? UNDEFINED_LOAD_TYPE : loadType,
            activePower,
            reactivePower,
            connectivity.voltageLevel.id,
            connectivity.busOrBusbarSection.id,
            editData ? true : false,
            editData ? editData.uuid : undefined,
            connectivity?.connectionDirection?.id ??
                UNDEFINED_CONNECTION_DIRECTION,
            connectivity?.connectionName?.id ?? null,
            connectivity?.connectionPosition?.id ?? null
        ).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'LoadCreationError',
            });
        });
    };

    const clear = () => {
        inputForm.reset();
        setFormValues(null);
    };

    return (
        <ModificationDialog
            fullWidth
            onClear={clear}
            onValidation={handleValidation}
            onSave={handleSave}
            disabledSave={!inputForm.hasChanged}
            aria-labelledby="dialog-create-load"
            maxWidth={'md'}
            titleId="CreateLoad"
            searchCopy={searchCopy}
            {...dialogProps}
        >
            <Grid container spacing={2}>
                {gridItem(loadIdField, 4)}
                {gridItem(loadNameField, 4)}
                {gridItem(loadTypeField, 4)}
            </Grid>
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                {gridItem(connectivityField, 12)}
            </Grid>
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {gridItem(activePowerField, 4)}
                {gridItem(reactivePowerField, 4)}
            </Grid>
            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={EQUIPMENT_TYPES.LOAD.type}
                onSelectionChange={searchCopy.handleSelectionChange}
                currentNodeUuid={currentNodeUuid}
            />
        </ModificationDialog>
    );
};

LoadCreationDialog.propTypes = {
    editData: PropTypes.object,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
};

export default LoadCreationDialog;
