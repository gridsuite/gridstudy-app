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
    useRef,
    useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Slider, Typography } from '@mui/material';
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
import { filledTextField, gridItem, GridSection } from './dialogUtils';
import { divideLine } from '../../utils/rest-api';
import PropTypes from 'prop-types';
import AddIcon from '@mui/icons-material/Add';
import TextFieldWithAdornment from '../util/text-field-with-adornment';
import VoltageLevelCreationDialog from './voltage-level-creation-dialog';
import { makeRefreshBusOrBusbarSectionsCallback } from './connectivity-edition';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';
import { validateField } from '../util/validation-functions';

const getId = (e) => e?.id || (typeof e === 'string' ? e : '');

function genHelperError(...errors) {
    const inError = errors.find((e) => e);
    if (inError)
        return {
            error: true,
            helperText: <FormattedMessage id={inError} />,
        };
    return {};
}

// functiuons for useComplementaryPercentage

const maxDecimals = 1;

function asMostlyPercentStr(value) {
    if (value < 0) return '0';
    if (value > 100) return '100';
    if (typeof value === 'number') return value.toFixed(maxDecimals);
    if (typeof value !== 'string') return '';
    const rgxra = /^([0-9]*)([.,]*)([0-9]*)/.exec(value);
    if (!rgxra) return '';
    return (
        rgxra[1] + rgxra[2].substring(0, 1) + rgxra[3].substring(0, maxDecimals)
    );
}

function leftSideValue(str) {
    if (typeof str === 'string' && str.substring(0, 4) === '100-')
        return str.substring(0, 3) - str.substring(4);
    return str;
}

function slideValue(str) {
    if (typeof str === 'string' && str.substring(0, 4) === '100-') {
        const rest = str.substring(4);
        if (isNaN(rest)) return 100;
        return str.substring(0, 3) - rest;
    }
    return parseFloat(str);
}

function rightSideValue(str) {
    if (typeof str === 'string' && str.substring(0, 4) === '100-')
        return str.substring(4);
    const diff = 100 - str;
    return isNaN(diff) || diff === 100.0 ? '100' : diff.toFixed(maxDecimals);
}

const useComplementaryPercentage = ({
    upperLeftText,
    upperRightText,
    validation,
    defaultValue,
    inputForm,
    formProps,
    errorMsg,
    id,
    label,
    ...props
}) => {
    function initValue(defaultValue) {
        return typeof defaultValue === 'number'
            ? defaultValue.toFixed(maxDecimals)
            : '50';
    }

    //const classes = useStyles();
    const [mostlyFloatStrValue, setMostlyFloatStrValue] = useState(
        initValue(defaultValue)
    );

    useEffect(() => {
        setMostlyFloatStrValue(initValue(defaultValue));
    }, [defaultValue]);

    const [error, setError] = useState();
    const validationRef = useRef();
    validationRef.current = validation;

    useEffect(() => {
        function validate() {
            const res = validateField(
                '' + mostlyFloatStrValue,
                validationRef.current
            );
            setError(res?.errorMsgId);
            return !res.error;
        }
        inputForm.addValidation(id ? id : label, validate);
    }, [validation, mostlyFloatStrValue, id, inputForm, label]);

    const handleChangeLeftValue = (event) => {
        setMostlyFloatStrValue(asMostlyPercentStr(event.target.value));
    };

    const handleChangeRightValue = (event) => {
        const floatValueStr = asMostlyPercentStr(event.target.value);
        const nextValue = '100-' + floatValueStr;
        setMostlyFloatStrValue(nextValue);
    };

    const handleSliderChange = (event, newValue) => {
        setMostlyFloatStrValue(asMostlyPercentStr(newValue));
    };

    return [
        mostlyFloatStrValue,
        <Grid container spacing={2}>
            <Grid container spacing={2} item>
                <Grid item xs={5} align={'start'}>
                    <Typography>{upperLeftText}</Typography>
                </Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={5} align={'end'}>
                    <Typography align="right">{upperRightText}</Typography>
                </Grid>
            </Grid>
            <Slider
                size="small"
                min={0.0}
                max={100.0}
                step={0.1}
                value={slideValue(mostlyFloatStrValue)}
                onChange={handleSliderChange}
            />
            <Grid container spacing={2} item>
                <Grid item xs={3} align={'start'}>
                    <TextFieldWithAdornment
                        size="small"
                        variant="standard"
                        adornmentText="%"
                        adornmentPosition="end"
                        fullWidth
                        value={leftSideValue(mostlyFloatStrValue)}
                        onChange={handleChangeLeftValue}
                        // FormHelperTextProps={{
                        //     className: classes.helperText,
                        // }}
                        {...genHelperError(error, errorMsg)}
                        {...formProps}
                    />
                </Grid>
                <Grid item xs={6}></Grid>
                <Grid item xs={3} align={'end'}>
                    <TextFieldWithAdornment
                        size="small"
                        adornmentText="%"
                        adornmentPosition="end"
                        fullWidth
                        value={rightSideValue(mostlyFloatStrValue)} // handle numerical mostlyFloatStrValue
                        onChange={handleChangeRightValue}
                        // FormHelperTextProps={{
                        //     className: classes.helperText,
                        // }}
                        {...genHelperError(error, errorMsg)}
                        {...formProps}
                    />
                </Grid>
            </Grid>
        </Grid>,
    ];
};

function makeVoltageLevelCreationParams(vlId, bobbsId, vl) {
    if (!vlId) return null;
    if (!bobbsId) return { id: vlId };
    return {
        ...(vl || {}),
        equipmentId: vlId,
        //topologyKind: 'NODE_BEAKER',
        busbarSections: [{ id: bobbsId, horizPos: 1, vertPos: 1 }],
    };
}

/**
 * Dialog to cut a line in two parts with in insertion of (possibly new) voltage level.
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param lineOptions the available network lines
 * @param selectedNodeUuid the currently selected tree node
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
    // const studyUuid = useSelector((state) => state.studyUuid);

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
        return [asVL, ...voltageLevelOptions];
    }, [newVoltageLevel, voltageLevelOptions]);

    useEffect(() => {
        if (editData) {
            setFormValues(editData);
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
        formProps: filledTextField,
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
        formProps: filledTextField,
        defaultValue: formValues?.percent,
    });

    const [voltageLevelOrId, voltageLevelIdField, setVoltageLevelOrId] =
        useAutocompleteField({
            id: 'VoltageLevelId',
            label: 'ID',
            validation: { isFieldRequired: true },
            inputForm: inputForm,
            formProps: filledTextField,
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
            formProps: filledTextField,
            values: busbarSectionOptions,
            allowNewValue: true,
            getLabel: getId,
            defaultValue: formValues?.bbsOrNodeId || '',
            selectedValue: formValues
                ? busbarSectionOptions.find(
                      (value) => value.id === formValues.bbsOrNodeId
                  )
                : '',
        });
    console.log('meuh3', bbsOrNodeId, formValues);

    useEffect(() => {
        if (!voltageLevelOrId?.id && !voltageLevelOrId) {
            console.log('meuh4', voltageLevelOrId);
            setBbsOrNodeId('');
            setBusOrBusbarSectionOptions([]);
        } else {
            console.log('meuh5', voltageLevelOrId);
            bobbsCb(voltageLevelOrId, (bobbss) => {
                console.log('meuh6', bobbss, voltageLevelOrId);
                if (!bobbss?.length && voltageLevelOrId?.busbarSections) {
                    bobbss.push(...voltageLevelOrId.busbarSections);
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
        if (!voltageLevelOrId) {
            return null;
        }

        if (
            typeof voltageLevelOrId === 'string' &&
            newVoltageLevel?.equipmentId !== voltageLevelOrId
        ) {
            const ret = makeVoltageLevelCreationParams(
                voltageLevelOrId,
                bbsOrNodeId?.id || bbsOrNodeId,
                newVoltageLevel
            );
            return ret;
        }

        return newVoltageLevel;
    }, [voltageLevelOrId, bbsOrNodeId, newVoltageLevel]);

    const [newLine1Id, newLine1IdField] = useTextValue({
        id: 'newLine1Id',
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.newLine1Id,
    });

    const [newLine2Id, newLine2IdField] = useTextValue({
        id: 'newLine2Id',
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.newLine2Id,
    });

    const [newLine1Name, newLine1NameField] = useTextValue({
        id: 'newLine1Name',
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.newLine1Name,
    });

    const [newLine2Name, newLine2NameField] = useTextValue({
        id: 'newLine2Name',
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.newLine2Name,
    });

    const [voltageLevelDialogOpen, setVoltageLevelDialogOpen] = useState(false);

    const handleSave = () => {
        console.log(
            'handleSave newVoltageLevel:',
            newVoltageLevel,
            'voltageLevelOrId:',
            voltageLevelOrId
        );
        if (inputForm.validate()) {
            divideLine(
                studyUuid,
                selectedNodeUuid,
                editData ? editData.uuid : undefined,
                lineToDivide.id,
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
                    // tant qu'on n'a pas implémenté, on ne ferme que par ... "fermer"
                    handleCloseAndClear();
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
            // handleCloseAndClear();
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
            busBarSections,
            connections,
        }) => {
            return new Promise(() => {
                const preparedVoltageLevel = {
                    equipmentId: voltageLevelId,
                    voltageLevelName: voltageLevelName,
                    nominalVoltage: nominalVoltage,
                    substationId: substationId,
                    busbarSections: busBarSections,
                    connections: connections,
                };
                setNewVoltageLevel(preparedVoltageLevel);
                setVoltageLevelOrId(voltageLevelId);
                if (
                    busBarSections.find(
                        (bbs) => bbs.id === (bbsOrNodeId?.id || bbsOrNodeId)
                    )
                ) {
                    setBusOrBusbarSectionOptions(busBarSections);
                } else {
                    setBusOrBusbarSectionOptions(busBarSections);
                    setBbsOrNodeId(busBarSections[0].id);
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
        const vlId = isFirst
            ? lineToDivide.voltageLevelId1
            : lineToDivide.voltageLevelId2;
        const mayVl = allVoltageLevelOptions.filter((vl) => vl.id === vlId);
        if (mayVl && mayVl.length) return mayVl[0].name;
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
                    <GridSection title="LineToDivide" />
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
                    <GridSection title="VoltageLevel" />
                    <Grid container spacing={2}>
                        {gridItem(voltageLevelIdField, 5)}
                        {gridItem(
                            <Button
                                onClick={openVoltageLevelDialog}
                                startIcon={<AddIcon />}
                                variant="outlined"
                            >
                                <Typography align="left">
                                    <FormattedMessage id="NewVoltageLevel" />
                                </Typography>
                            </Button>,
                            2
                        )}
                        {gridItem(bbsOrNodeIdField, 5)}
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
};

export default LineSplitWithVoltageLevelDialog;
