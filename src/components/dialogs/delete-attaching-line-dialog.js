/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useInputForm, useTextValue } from './inputs/input-hooks';
import {
    gridItem,
    GridSection,
    compareById,
    sanitizeString,
} from './dialogUtils';
import { deleteAttachingLine } from '../../utils/rest-api';
import PropTypes from 'prop-types';
import { useAutocompleteField } from './inputs/use-autocomplete-field';
import ModificationDialog from './modificationDialog';

const getId = (e) => e?.id || (typeof e === 'string' ? e : '');

/**
 * Dialog to delete attaching line.
 * @param lineOptionsPromise Promise handling list of network lines
 * @param currentNode the currently selected tree node
 * @param editData record to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const DeleteAttachingLineDialog = ({
    lineOptionsPromise,
    currentNode,
    editData,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const [lineOptions, setLineOptions] = useState([]);

    const [loadingLineOptions, setLoadingLineOptions] = useState(true);

    useEffect(() => {
        if (editData) {
            setFormValues(editData);
        }
    }, [editData]);

    useEffect(() => {
        if (!lineOptionsPromise) return;
        lineOptionsPromise.then((values) => {
            setLineOptions(values);
            setLoadingLineOptions(false);
        });
    }, [lineOptionsPromise]);

    const formValueLineTo1AttachId = useMemo(() => {
        return formValues?.lineToAttachTo1Id
            ? { id: formValues?.lineToAttachTo1Id }
            : { id: '' };
    }, [formValues]);

    const formValueLineTo2AttachId = useMemo(() => {
        return formValues?.lineToAttachTo2Id
            ? { id: formValues?.lineToAttachTo2Id }
            : { id: '' };
    }, [formValues]);

    const formValueAttachedLineId = useMemo(() => {
        return formValues?.attachedLineId
            ? { id: formValues?.attachedLineId }
            : { id: '' };
    }, [formValues]);

    const [lineToAttachTo1, lineToAttachTo1Field] = useAutocompleteField({
        id: 'lineToAttachTo1',
        label: 'Line1',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        values: lineOptions?.sort(compareById),
        allowNewValue: true,
        getLabel: getId,
        defaultValue:
            lineOptions.find(
                (value) => value.id === formValues?.lineToAttachTo1Id
            ) || formValueLineTo1AttachId,
        loading: loadingLineOptions,
    });

    const [lineToAttachTo2, lineToAttachTo2Field] = useAutocompleteField({
        id: 'lineToAttachTo2',
        label: 'Line2',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        values: lineOptions?.sort(compareById),
        allowNewValue: true,
        getLabel: getId,
        defaultValue:
            lineOptions.find(
                (value) => value.id === formValues?.lineToAttachTo2Id
            ) || formValueLineTo2AttachId,
        loading: loadingLineOptions,
    });

    const [attachedLine, attachedLineField] = useAutocompleteField({
        id: 'attachedLine',
        label: 'LineAttached',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        values: lineOptions?.sort(compareById),
        allowNewValue: true,
        getLabel: getId,
        defaultValue:
            lineOptions.find(
                (value) => value.id === formValues?.attachedLineId
            ) || formValueAttachedLineId,
        loading: loadingLineOptions,
    });

    const [newLine1Id, newLine1IdField] = useTextValue({
        id: 'replacingLine1Id',
        label: 'ReplacingLineId',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        defaultValue: formValues?.replacingLine1Id,
    });

    const [newLine1Name, newLine1NameField] = useTextValue({
        id: 'replacingLine1Name',
        label: 'ReplacingLineName',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        defaultValue: formValues?.replacingLine1Name,
    });

    const handleSave = () => {
        if (inputForm.validate()) {
            deleteAttachingLine(
                studyUuid,
                currentNode?.id,
                editData ? editData.uuid : undefined,
                lineToAttachTo1.id || lineToAttachTo1,
                lineToAttachTo2.id || lineToAttachTo2,
                attachedLine.id || attachedLine,
                newLine1Id,
                sanitizeString(newLine1Name)
            ).catch((errorMessage) => {
                snackError({
                    messageTxt: errorMessage,
                    headerId: 'DeleteAttachingLineError',
                });
            });
        }
    };

    const handleValidation = () => {
        return inputForm.validate();
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
            aria-labelledby="dialog-delete-voltage-level-on-line"
            maxWidth={'md'}
            titleId="DeleteAttachingLine"
            {...dialogProps}
        >
            <GridSection title="Line1" />
            <Grid container spacing={2} alignItems="center">
                {gridItem(lineToAttachTo1Field, 5)}
            </Grid>
            <GridSection title="Line2" />
            <Grid container spacing={2} alignItems="center">
                {gridItem(lineToAttachTo2Field, 5)}
            </Grid>
            <GridSection title="LineAttached" />
            <Grid container spacing={2} alignItems="center">
                {gridItem(attachedLineField, 5)}
            </Grid>
            <GridSection title="ReplacingLine" />
            <Grid container spacing={2}>
                {gridItem(newLine1IdField, 6)}
                {gridItem(newLine1NameField, 6)}
            </Grid>
        </ModificationDialog>
    );
};

DeleteAttachingLineDialog.propTypes = {
    currentNode: PropTypes.object,
    lineOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    editData: PropTypes.object,
};

export default DeleteAttachingLineDialog;
