/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useRef,
} from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useInputForm, useTextValue } from './inputs/input-hooks';
import {
    gridItem,
    GridSection,
    compareById,
    sanitizeString,
} from './dialogUtils';
import { linesAttachToSplitLines } from '../../utils/rest-api';
import PropTypes from 'prop-types';
import { makeRefreshBusOrBusbarSectionsCallback } from './connectivity-edition';
import { useAutocompleteField } from './inputs/use-autocomplete-field';

const getId = (e) => e?.id || (typeof e === 'string' ? e : '');

/**
 * Dialog to attach a line to a (possibly new) voltage level.
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param lineOptionsPromise Promise handling list of network lines
 * @param voltageLevelOptionsPromise Promise handling list of network voltage levels
 * @param currentNodeUuid the currently selected tree node
 * @param substationOptionsPromise Promise handling list of network substations
 * @param editData the possible line split with voltage level creation record to edit
 */
const LinesAttachToSplitLinesDialog = ({
    open,
    onClose,
    lineOptionsPromise,
    voltageLevelOptionsPromise,
    currentNodeUuid,
    editData,
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const bobbsCb = useMemo(
        () =>
            makeRefreshBusOrBusbarSectionsCallback(studyUuid, currentNodeUuid),
        [studyUuid, currentNodeUuid]
    );

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const [lineOptions, setLineOptions] = useState([]);

    const [loadingLineOptions, setLoadingLineOptions] = useState(true);

    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    const [loadingVoltageLevelOptions, setLoadingVoltageLevelOptions] =
        useState(true);

    const clearValues = () => {
        setFormValues(null);
    };

    const [newVoltageLevel, setNewVoltageLevel] = useState(null);

    const allVoltageLevelOptions = useMemo(() => {
        if (!newVoltageLevel)
            if (voltageLevelOptions?.length) return voltageLevelOptions;
            else return [];
        const asVL = {
            id: newVoltageLevel.equipmentId,
            name: newVoltageLevel.equipmentName,
            substationId: newVoltageLevel.substationId,
            busbarSections: newVoltageLevel.busbarSections,
        };
        return [asVL, ...voltageLevelOptions.filter((vl) => vl.id !== asVL.id)];
    }, [newVoltageLevel, voltageLevelOptions]);

    useEffect(() => {
        if (editData) {
            setFormValues(editData);
            setNewVoltageLevel(editData.mayNewVoltageLevelInfos);
        }
    }, [editData]);

    useEffect(() => {
        if (!voltageLevelOptionsPromise) return;
        voltageLevelOptionsPromise.then((values) => {
            setVoltageLevelOptions(values);
            setLoadingVoltageLevelOptions(false);
        });
    }, [voltageLevelOptionsPromise]);

    useEffect(() => {
        if (!lineOptionsPromise) return;
        lineOptionsPromise.then((values) => {
            setLineOptions(values);
            setLoadingLineOptions(false);
        });
    }, [lineOptionsPromise]);

    const extractDefaultVoltageLevelId = (fv) => {
        if (fv) {
            if (fv.voltageLevelId) return fv.voltageLevelId;
        }
        return '';
    };
    const defaultVoltageLevelId = extractDefaultVoltageLevelId(formValues);

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
        label: 'Line1ID',
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
        label: 'Line2ID',
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
        label: 'AttachedLineId',
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

    const [voltageLevelOrId, voltageLevelIdField] = useAutocompleteField({
        id: 'VoltageLevelId',
        label: 'AttachedVoltageLevelId',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        values: allVoltageLevelOptions,
        allowNewValue: true,
        getLabel: getId,
        defaultValue: defaultVoltageLevelId,
        selectedValue:
            formValues && allVoltageLevelOptions
                ? allVoltageLevelOptions.find(
                      (value) => value.id === defaultVoltageLevelId
                  )
                : '',
        loading: loadingVoltageLevelOptions,
    });
    const voltageLevelOrIdRef = useRef(voltageLevelOrId);

    const [busbarSectionOptions, setBusOrBusbarSectionOptions] = useState([]);

    const [bbsOrNodeId, bbsOrNodeIdField, setBbsOrNodeId] =
        useAutocompleteField({
            id: 'BusbarOrNodeID',
            label: 'BusBarBus',
            validation: { isFieldRequired: true },
            inputForm: inputForm,
            values: busbarSectionOptions,
            allowNewValue: true,
            getLabel: getId,
            defaultValue: formValues?.bbsBusId || '',
            selectedValue: formValues
                ? busbarSectionOptions.find(
                      (value) => value.id === formValues.bbsOrBusId
                  )
                : '',
        });

    useEffect(() => {
        voltageLevelOrIdRef.current = voltageLevelOrId;
        const vlId =
            typeof voltageLevelOrId === 'string'
                ? voltageLevelOrId
                : voltageLevelOrId?.id;
        if (
            newVoltageLevel &&
            voltageLevelOrIdRef.current &&
            vlId !== newVoltageLevel.equipmentId
        ) {
            // switch from new voltage level to existing voltage level
            setNewVoltageLevel(null);
        }
    }, [voltageLevelOrId, newVoltageLevel]);

    useEffect(() => {
        if (!voltageLevelOrId?.id && !voltageLevelOrId) {
            setBbsOrNodeId('');
            setBusOrBusbarSectionOptions([]);
        } else {
            bobbsCb(voltageLevelOrId, (bobbss) => {
                if (!bobbss?.length && voltageLevelOrId?.busbarSections) {
                    bobbss = [...bobbss, ...voltageLevelOrId.busbarSections];
                }
                if (bobbss?.length) {
                    setBusOrBusbarSectionOptions(bobbss);
                    setBbsOrNodeId(bobbss[0]);
                }
            });
        }
    }, [voltageLevelOrId, bobbsCb, setBbsOrNodeId]);

    const [newLine1Id, newLine1IdField] = useTextValue({
        id: 'replacingLine1Id',
        label: 'Line1ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        defaultValue: formValues?.replacingLine1Id,
    });

    const [newLine2Id, newLine2IdField] = useTextValue({
        id: 'replacingLine2Id',
        label: 'Line2ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        defaultValue: formValues?.replacingLine2Id,
    });

    const [newLine1Name, newLine1NameField] = useTextValue({
        id: 'replacingLine1Name',
        label: 'Line1Name',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        defaultValue: formValues?.replacingLine1Name,
    });

    const [newLine2Name, newLine2NameField] = useTextValue({
        id: 'replacingLine2Name',
        label: 'Line2Name',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        defaultValue: formValues?.replacingLine2Name,
    });

    const handleSave = () => {
        if (inputForm.validate()) {
            linesAttachToSplitLines(
                studyUuid,
                currentNodeUuid,
                editData ? editData.uuid : undefined,
                lineToAttachTo1.id || lineToAttachTo1,
                lineToAttachTo2.id || lineToAttachTo2,
                attachedLine.id || attachedLine,
                voltageLevelOrId?.id || voltageLevelOrId,
                bbsOrNodeId?.id || bbsOrNodeId,
                newLine1Id,
                sanitizeString(newLine1Name),
                newLine2Id,
                sanitizeString(newLine2Name)
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LineAttachmentError',
                });
            });
            // do not wait fetch response and close dialog, errors will be shown in snackbar.
            handleCloseAndClear();
        }
    };

    const handleClose = useCallback(
        (event, reason) => {
            if (reason !== 'backdropClick') {
                inputForm.reset();
                onClose();
            }
        },
        [inputForm, onClose]
    );

    const handleCloseAndClear = () => {
        clearValues();
        handleClose();
    };

    return (
        <>
            <Dialog
                fullWidth
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-attach-lines-to-split-lines"
                maxWidth={'md'}
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={12}>
                            <FormattedMessage id="LinesAttachToSplitLines" />
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
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
                    <GridSection title="VoltageLevel" />
                    <Grid container spacing={2}>
                        {gridItem(voltageLevelIdField)}
                        {gridItem(bbsOrNodeIdField)}
                    </Grid>
                    <GridSection title="ReplacingLines" />
                    <Grid container spacing={2}>
                        {gridItem(newLine1IdField, 6)}
                        {gridItem(newLine1NameField, 6)}
                        <Box sx={{ width: '100%' }} />
                        {gridItem(newLine2IdField, 6)}
                        {gridItem(newLine2NameField, 6)}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAndClear} variant="text">
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="text"
                        disabled={!inputForm.hasChanged}
                    >
                        <FormattedMessage id="validate" />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

LinesAttachToSplitLinesDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    lineOptions: PropTypes.arrayOf(PropTypes.object),
    currentNodeUuid: PropTypes.string,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    lineOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    editData: PropTypes.object,
};

export default LinesAttachToSplitLinesDialog;
