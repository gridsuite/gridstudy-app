/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import {
    useAutocompleteField,
    useButtonWithTooltip,
    useInputForm,
    useTextValue,
} from './input-hooks';
import { gridItem, GridSection } from './dialogUtils';
import { divideLine } from '../../utils/rest-api';
import PropTypes from 'prop-types';
import AddIcon from '@mui/icons-material/ControlPoint';
import {
    makeVoltageLevelCreationParams,
    useComplementaryPercentage,
} from './line-split-or-attach-utils';
import VoltageLevelCreationDialog from './voltage-level-creation-dialog';
import { makeRefreshBusOrBusbarSectionsCallback } from './connectivity-edition';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';

const getId = (e) => e?.id || (typeof e === 'string' ? e : '');

/**
 * Dialog to cut a line in two parts with in insertion of (possibly new) voltage level.
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param lineOptions the available network lines
 * @param selectedNodeUuid the currently selected tree node
 * @param substationOptions available substations
 * @param editData the possible line split with voltage level creation record to edit
 */
const LineSplitWithVoltageLevelDialog = ({
    open,
    onClose,
    lineOptions,
    voltageLevelOptions,
    selectedNodeUuid,
    substationOptions,
    editData,
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const bobbsCb = useMemo(
        () =>
            makeRefreshBusOrBusbarSectionsCallback(studyUuid, selectedNodeUuid),
        [studyUuid, selectedNodeUuid]
    );

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const clearValues = () => {
        setFormValues(null);
    };

    const toFormValues = (lineSplit) => {
        return {
            lineToSplitId: lineSplit.id + '(1)',
            percentage: lineSplit.percentage,
        };
    };

    const equipmentPath = 'line-split';

    const searchCopy = useFormSearchCopy({
        studyUuid,
        selectedNodeUuid,
        equipmentPath,
        toFormValues,
        setFormValues,
        clearValues,
    });

    const copyEquipmentButton = useButtonWithTooltip({
        label: 'CopyFromExisting',
        handleClick: searchCopy.handleOpenSearchDialog,
    });

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

    const extractDefaultVoltageLevelId = (fv) => {
        if (fv) {
            if (fv.existingVoltageLevelId) return fv.existingVoltageLevelId;
            if (fv.mayNewVoltageLevelInfos)
                return fv.mayNewVoltageLevelInfos.equipmentId;
        }
        return '';
    };
    const defaultVoltageLevelId = extractDefaultVoltageLevelId(formValues);

    const [lineToDivide, lineToDivideField] = useAutocompleteField({
        id: 'lineToDivide',
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        values: lineOptions,
        allowNewValue: true,
        getLabel: getId,
        defaultValue: formValues?.lineToSplitId || '',
        selectedValue: formValues
            ? lineOptions.find((value) => value.id === formValues.lineToSplitId)
            : '',
    });

    const [percentage, percentageArea] = useComplementaryPercentage({
        validation: {
            isFieldRequired: true,
            isValueGreaterThan: 0.0,
            isValueLessOrEqualTo: 99.9,
            errorMsgId: 'OutOfBoundsPercentage',
        },
        upperLeftText: <FormattedMessage id="Line1"></FormattedMessage>,
        upperRightText: <FormattedMessage id="Line2"></FormattedMessage>,
        inputForm: inputForm,
        defaultValue: formValues?.percent,
    });

    const [voltageLevelOrId, voltageLevelIdField, setVoltageLevelOrId] =
        useAutocompleteField({
            id: 'VoltageLevelId',
            label: 'ID',
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
        });

    const [busbarSectionOptions, setBusOrBusbarSectionOptions] = useState([]);

    const [bbsOrNodeId, bbsOrNodeIdField, setBbsOrNodeId] =
        useAutocompleteField({
            id: 'BusbarOrNodeID',
            label: 'BusbarOrNodeID',
            validation: { isFieldRequired: true },
            inputForm: inputForm,
            values: busbarSectionOptions,
            allowNewValue: true,
            getLabel: getId,
            defaultValue: formValues?.bbsOrBusId || '',
            selectedValue: formValues
                ? busbarSectionOptions.find(
                      (value) => value.id === formValues.bbsOrBusId
                  )
                : '',
        });

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

    const voltageLevelToEdit = useMemo(() => {
        if (
            typeof voltageLevelOrId === 'string' &&
            newVoltageLevel &&
            newVoltageLevel.equipmentId !== voltageLevelOrId
        ) {
            const ret = makeVoltageLevelCreationParams(
                voltageLevelOrId,
                bbsOrNodeId?.id || bbsOrNodeId,
                newVoltageLevel
            );
            return ret;
        }

        if (!newVoltageLevel && formValues?.mayNewVoltageLevelInfos) {
            return formValues?.mayNewVoltageLevelInfos;
        }

        return newVoltageLevel;
    }, [voltageLevelOrId, bbsOrNodeId, newVoltageLevel, formValues]);

    const [newLine1Id, newLine1IdField] = useTextValue({
        id: 'newLine1Id',
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        defaultValue: formValues?.newLine1Id,
    });

    const [newLine2Id, newLine2IdField] = useTextValue({
        id: 'newLine2Id',
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        defaultValue: formValues?.newLine2Id,
    });

    const [newLine1Name, newLine1NameField] = useTextValue({
        id: 'newLine1Name',
        label: 'Name',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        defaultValue: formValues?.newLine1Name,
    });

    const [newLine2Name, newLine2NameField] = useTextValue({
        id: 'newLine2Name',
        label: 'Name',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        defaultValue: formValues?.newLine2Name,
    });

    const [voltageLevelDialogOpen, setVoltageLevelDialogOpen] = useState(false);

    const handleSave = () => {
        if (inputForm.validate()) {
            divideLine(
                studyUuid,
                selectedNodeUuid,
                editData ? editData.uuid : undefined,
                lineToDivide.id || lineToDivide,
                parseFloat(percentage),
                newVoltageLevel,
                newVoltageLevel
                    ? null
                    : voltageLevelOrId?.id || voltageLevelOrId,
                bbsOrNodeId?.id || bbsOrNodeId,
                newLine1Id,
                newLine1Name || null,
                newLine2Id,
                newLine2Name || null
            )
                .then(() => {
                    // until whole treatment path is OK, we let close only on ... "Close"
                    // handleCloseAndClear();
                })
                .catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'LineDivisionError',
                            intlRef: intlRef,
                        },
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

    const onVoltageLevelDo = useCallback(
        ({
            studyUuid,
            selectedNodeUuid,
            voltageLevelId,
            voltageLevelName,
            nominalVoltage,
            substationId,
            busbarSections,
            busbarConnections,
        }) => {
            return new Promise(() => {
                const preparedVoltageLevel = {
                    equipmentId: voltageLevelId,
                    equipmentName: voltageLevelName,
                    nominalVoltage: nominalVoltage,
                    substationId: substationId,
                    busbarSections: busbarSections,
                    busbarConnections: busbarConnections,
                };
                setNewVoltageLevel(preparedVoltageLevel);
                setVoltageLevelOrId(voltageLevelId);
                if (
                    busbarSections.find(
                        (bbs) => bbs.id === (bbsOrNodeId?.id || bbsOrNodeId)
                    )
                ) {
                    setBusOrBusbarSectionOptions(busbarSections);
                } else {
                    setBusOrBusbarSectionOptions(busbarSections);
                    setBbsOrNodeId(busbarSections[0].id);
                }
            });
        },
        [bbsOrNodeId, setBbsOrNodeId, setVoltageLevelOrId]
    );

    const onVoltageLevelDialogClose = () => {
        setVoltageLevelDialogOpen(false);
    };

    const openVoltageLevelDialog = () => {
        setVoltageLevelDialogOpen(true);
    };

    const lineSubstation = (isFirst) => {
        if (!lineToDivide) return '';
        let vlId = '';
        if (typeof lineToDivide === 'object') {
            vlId = isFirst
                ? lineToDivide.voltageLevelId1
                : lineToDivide.voltageLevelId2;
        } else if (isFirst) {
            const mayLine = lineOptions.find((l) => l?.id === newLine1Id);
            vlId = mayLine?.voltageLevelId1;
        } else {
            const mayLine = lineOptions.find((l) => l?.id === newLine2Id);
            vlId = mayLine?.voltageLevelId2;
        }
        if (vlId) {
            const mayVl = allVoltageLevelOptions.find((vl) => vl.id === vlId);
            if (mayVl) return mayVl.name;
        }
        return '';
    };

    return (
        <>
            <Dialog
                fullWidth
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-create-voltage-level-amidst-a-line"
                maxWidth={'md'}
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={11}>
                            <FormattedMessage id="LineSplitWithVoltageLevel" />
                        </Grid>
                        <Grid item> {copyEquipmentButton} </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <GridSection title="LineToSplit" />
                    <Grid container spacing={2} alignItems="center">
                        {gridItem(lineToDivideField, 5)}
                        {gridItem(
                            <Typography>{lineSubstation(true)}</Typography>,
                            1
                        )}
                        {gridItem(percentageArea, 5)}
                        {gridItem(
                            <Typography>{lineSubstation(false)}</Typography>,
                            1
                        )}
                    </Grid>
                    <GridSection title="VoltageLevelToSplitAt" />
                    <Grid container spacing={2}>
                        {gridItem(voltageLevelIdField, 6)}
                        {gridItem(bbsOrNodeIdField, 6)}
                        {gridItem(
                            <Button
                                onClick={openVoltageLevelDialog}
                                startIcon={<AddIcon />}
                            >
                                <Typography align="left">
                                    <FormattedMessage id="NewVoltageLevel" />
                                </Typography>
                            </Button>,
                            6
                        )}
                    </Grid>
                    <GridSection title="Line1" />
                    <Grid container spacing={2}>
                        {gridItem(newLine1IdField, 6)}
                        {gridItem(newLine1NameField, 6)}
                    </Grid>
                    <GridSection title="Line2" />
                    <Grid container spacing={2}>
                        {gridItem(newLine2IdField, 6)}
                        {gridItem(newLine2NameField, 6)}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAndClear} variant="text">
                        <FormattedMessage id="close" />
                    </Button>
                    <Button onClick={handleSave} variant="text">
                        <FormattedMessage id="save" />
                    </Button>
                </DialogActions>
                {voltageLevelDialogOpen && (
                    <VoltageLevelCreationDialog
                        open={true}
                        onClose={onVoltageLevelDialogClose}
                        selectedNodeUuid={selectedNodeUuid}
                        substationOptions={substationOptions}
                        onCreateVoltageLevel={onVoltageLevelDo}
                        editData={voltageLevelToEdit}
                    />
                )}
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={'VOLTAGE_LEVEL'}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    selectedNodeUuid={selectedNodeUuid}
                />
            </Dialog>
        </>
    );
};

LineSplitWithVoltageLevelDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    lineOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
    substationOptions: PropTypes.arrayOf(PropTypes.object),
    editData: PropTypes.object,
};

export default LineSplitWithVoltageLevelDialog;
