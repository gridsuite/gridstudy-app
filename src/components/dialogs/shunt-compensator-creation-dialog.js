/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import ModificationDialog from './modificationDialog';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    useDoubleValue,
    useInputForm,
    useIntegerValue,
    useTextValue,
} from './inputs/input-hooks';
import { createShuntCompensator } from '../../utils/rest-api';
import {
    filledTextField,
    gridItem,
    GridSection,
    sanitizeString,
    SusceptanceAdornment,
    toPositiveIntValue,
} from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';
import { useBooleanValue } from './inputs/boolean';
import { useConnectivityValue } from './connectivity-edition';
import { UNDEFINED_CONNECTION_DIRECTION } from '../network/constants';

const disabledChecked = { disabled: true };

/**
 * Dialog to create a shunt compensator in the network
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param currentNodeUuid the node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const ShuntCompensatorCreationDialog = ({
    voltageLevelOptionsPromise,
    currentNodeUuid,
    editData,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const equipmentPath = 'shunt-compensators';

    const toFormValues = (shuntCompensator) => {
        return {
            equipmentId: shuntCompensator.id + '(1)',
            equipmentName: shuntCompensator.name ?? '',
            maximumNumberOfSections: shuntCompensator.maximumSectionCount,
            currentNumberOfSections: shuntCompensator.sectionCount,
            susceptancePerSection: shuntCompensator.bperSection,
            voltageLevelId: shuntCompensator.voltageLevelId,
            busOrBusbarSectionId: null,
            connectionDirection: shuntCompensator.connectionDirection,
            connectionName: shuntCompensator.connectionName,
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

    const [shuntCompensatorId, shuntCompensatorIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentId,
    });

    const [shuntCompensatorName, shuntCompensatorNameField] = useTextValue({
        label: 'Name',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName,
    });

    const [maximumNumberOfSections, maximumNumberOfSectionsField] =
        useIntegerValue({
            label: 'ShuntMaximumNumberOfSections',
            validation: {
                isFieldRequired: true,
                valueGreaterThan: '0',
                errorMsgId: 'ShuntCompensatorErrorMaximumLessThanOne',
            },
            transformValue: toPositiveIntValue,
            inputForm: inputForm,
            defaultValue: formValues?.maximumNumberOfSections || 1,
        });

    const [currentNumberOfSections, currentNumberOfSectionsField] =
        useIntegerValue({
            label: 'ShuntCurrentNumberOfSections',
            validation: {
                valueLessThanOrEqualTo: maximumNumberOfSections,
                valueGreaterThan: '-1',
                errorMsgId: 'ShuntCompensatorErrorCurrentLessThanMaximum',
                isFieldRequired: true,
            },
            transformValue: toPositiveIntValue,
            inputForm: inputForm,
            defaultValue: formValues?.currentNumberOfSections || 0,
        });

    const [identicalSections, identicalSectionsField] = useBooleanValue({
        label: 'ShuntIdenticalSections',
        validation: { isFieldRequired: true },
        formProps: disabledChecked,
        inputForm: inputForm,
        defaultValue: formValues?.identicalSections || true,
    });

    const [susceptancePerSection, susceptancePerSectionField] = useDoubleValue({
        label: 'ShuntSusceptancePerSection',
        validation: { isFieldRequired: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.susceptancePerSection,
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
        withPosition: true,
    });

    const handleValidation = () => {
        return inputForm.validate();
    };

    const handleSave = () => {
        createShuntCompensator(
            studyUuid,
            currentNodeUuid,
            shuntCompensatorId,
            sanitizeString(shuntCompensatorName),
            maximumNumberOfSections,
            currentNumberOfSections,
            identicalSections,
            susceptancePerSection,
            connectivity,
            editData ? true : false,
            editData ? editData.uuid : undefined,
            connectivity?.connectionDirection?.id ??
                UNDEFINED_CONNECTION_DIRECTION,
            connectivity?.connectionName?.id ?? null
        ).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'ShuntCompensatorCreationError',
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
            aria-labelledby="dialog-create-shuntCompensator"
            titleId="CreateShuntCompensator"
            searchCopy={searchCopy}
            {...dialogProps}
        >
            <Grid container spacing={2}>
                {gridItem(shuntCompensatorIdField)}
                {gridItem(shuntCompensatorNameField)}
            </Grid>
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                {gridItem(connectivityField, 12)}
            </Grid>
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                {gridItem(maximumNumberOfSectionsField)}
                {gridItem(currentNumberOfSectionsField)}
                {gridItem(identicalSectionsField)}
                {gridItem(susceptancePerSectionField)}
            </Grid>

            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={'SHUNT_COMPENSATOR'}
                onSelectionChange={searchCopy.handleSelectionChange}
                currentNodeUuid={currentNodeUuid}
            />
        </ModificationDialog>
    );
};

ShuntCompensatorCreationDialog.propTypes = {
    editData: PropTypes.object,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
};

export default ShuntCompensatorCreationDialog;
