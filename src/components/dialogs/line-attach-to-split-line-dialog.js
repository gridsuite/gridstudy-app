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
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '../../utils/messages';
import { useInputForm, useTextValue } from './inputs/input-hooks';
import { gridItem, GridSection, compareById } from './dialogUtils';
import { attachLineToSplitLine } from '../../utils/rest-api';
import PropTypes from 'prop-types';
import AddIcon from '@mui/icons-material/ControlPoint';
import EditIcon from '@mui/icons-material/Edit';
import { makeVoltageLevelCreationParams } from './line-split-or-attach-utils';
import VoltageLevelCreationDialog from './voltage-level-creation-dialog';
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
const LineAttachToSplitLineDialog = ({
    open,
    onClose,
    lineOptionsPromise,
    voltageLevelOptionsPromise,
    currentNodeUuid,
    substationOptionsPromise,
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
            if (fv.existingVoltageLevelId) return fv.existingVoltageLevelId;
            if (fv.mayNewVoltageLevelInfos)
                return fv.mayNewVoltageLevelInfos.equipmentId;
        }
        return '';
    };
    const defaultVoltageLevelId = extractDefaultVoltageLevelId(formValues);

    const formValueLineTo1AttachId = useMemo(() => {
        return formValues?.lineToAttachToId
            ? { id: formValues?.lineToAttachToId }
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
                (value) => value.id === formValues?.lineToAttachToId
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
                (value) => value.id === formValues?.lineToAttachToId
            ) || formValueLineTo1AttachId,
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
                (value) => value.id === formValues?.lineToAttachToId
            ) || formValueLineTo1AttachId,
        loading: loadingLineOptions,
    });

    const [voltageLevelOrId, voltageLevelIdField, setVoltageLevelOrId] =
        useAutocompleteField({
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
            defaultValue: formValues?.bbsOrBusId || '',
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

    // const voltageLevelToEdit = useMemo(() => {
    //     if (
    //         typeof voltageLevelOrId === 'string' &&
    //         newVoltageLevel &&
    //         newVoltageLevel.equipmentId !== voltageLevelOrId
    //     ) {
    //         const ret = makeVoltageLevelCreationParams(
    //             voltageLevelOrId,
    //             bbsOrNodeId?.id || bbsOrNodeId,
    //             newVoltageLevel
    //         );
    //         return ret;
    //     }

    //     if (!newVoltageLevel && formValues?.mayNewVoltageLevelInfos) {
    //         return formValues?.mayNewVoltageLevelInfos;
    //     }

    //     return newVoltageLevel;
    // }, [voltageLevelOrId, bbsOrNodeId, newVoltageLevel, formValues]);

    const [newLine1Id, newLine1IdField] = useTextValue({
        id: 'newLine1Id',
        label: 'Line1ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        defaultValue: formValues?.newLine1Id,
    });

    const [newLine2Id, newLine2IdField] = useTextValue({
        id: 'newLine2Id',
        label: 'Line2ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        defaultValue: formValues?.newLine2Id,
    });

    const [newLine1Name, newLine1NameField] = useTextValue({
        id: 'newLine1Name',
        label: 'Line1Name',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        defaultValue: formValues?.newLine1Name,
    });

    const [newLine2Name, newLine2NameField] = useTextValue({
        id: 'newLine2Name',
        label: 'Line2Name',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        defaultValue: formValues?.newLine2Name,
    });

    // const [voltageLevelDialogOpen, setVoltageLevelDialogOpen] = useState(false);

    const handleSave = () => {
        if (inputForm.validate()) {
            attachLineToSplitLine(
                studyUuid,
                currentNodeUuid,
                editData ? editData.uuid : undefined,
                lineToAttachTo1.id || lineToAttachTo1,
                lineToAttachTo2.id || lineToAttachTo2,
                attachedLine.id || attachedLine,
                // newVoltageLevel,
                // newVoltageLevel
                //     ? null
                //     : voltageLevelOrId?.id || voltageLevelOrId,
                voltageLevelOrId?.id || voltageLevelOrId,
                bbsOrNodeId?.id || bbsOrNodeId,
                newLine1Id,
                newLine1Name || null,
                newLine2Id,
                newLine2Name || null
            ).catch((errorMessage) => {
                snackError(errorMessage, 'LineAttachmentError');
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

    // const onVoltageLevelDo = useCallback(
    //     ({
    //         studyUuid,
    //         currentNodeUuid,
    //         voltageLevelId,
    //         voltageLevelName,
    //         nominalVoltage,
    //         substationId,
    //         busbarSections,
    //         busbarConnections,
    //     }) => {
    //         return new Promise(() => {
    //             const preparedVoltageLevel = {
    //                 equipmentId: voltageLevelId,
    //                 equipmentName: voltageLevelName,
    //                 nominalVoltage: nominalVoltage,
    //                 substationId: substationId,
    //                 busbarSections: busbarSections,
    //                 busbarConnections: busbarConnections,
    //             };
    //             setNewVoltageLevel(preparedVoltageLevel);
    //             setVoltageLevelOrId(voltageLevelId);
    //             voltageLevelOrIdRef.current = voltageLevelId;
    //             if (
    //                 busbarSections.find(
    //                     (bbs) => bbs.id === (bbsOrNodeId?.id || bbsOrNodeId)
    //                 )
    //             ) {
    //                 setBusOrBusbarSectionOptions(busbarSections);
    //             } else {
    //                 setBusOrBusbarSectionOptions(busbarSections);
    //                 setBbsOrNodeId(busbarSections[0].id);
    //             }
    //         });
    //     },
    //     [bbsOrNodeId, setBbsOrNodeId, setVoltageLevelOrId]
    // );

    // const onVoltageLevelDialogClose = () => {
    //     setVoltageLevelDialogOpen(false);
    // };

    // const openVoltageLevelDialog = () => {
    //     setVoltageLevelDialogOpen(true);
    // };

    const lineSubstation = (isFirst, line) => {
        if (!line) return '';
        let vlId = '';
        if (typeof line === 'object') {
            vlId = isFirst ? line.voltageLevelId1 : line.voltageLevelId2;
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
                aria-labelledby="dialog-attach-voltage-level-to-a-line"
                maxWidth={'md'}
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={12}>
                            <FormattedMessage id="LineAttachToVoltageLevel" />
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <GridSection title="Line1" />
                    <Grid container spacing={2} alignItems="center">
                        {gridItem(lineToAttachTo1Field, 5)}
                        {gridItem(
                            <Typography>
                                {lineSubstation(true, lineToAttachTo1)}
                            </Typography>,
                            1
                        )}
                    </Grid>
                    <GridSection title="Line2" />
                    <Grid container spacing={2} alignItems="center">
                        {gridItem(lineToAttachTo2Field, 5)}
                        {gridItem(
                            <Typography>
                                {lineSubstation(true, lineToAttachTo2)}
                            </Typography>,
                            1
                        )}
                    </Grid>
                    <GridSection title="LineAttached" />
                    <Grid container spacing={2} alignItems="center">
                        {gridItem(attachedLineField, 5)}
                        {gridItem(
                            <Typography>
                                {lineSubstation(true, attachedLine)}
                            </Typography>,
                            1
                        )}
                    </Grid>
                    <GridSection title="VoltageLevel" />
                    <Grid container spacing={2}>
                        {gridItem(voltageLevelIdField)}
                        {gridItem(bbsOrNodeIdField)}
                        {/* {gridItem(
                            <Button
                                onClick={openVoltageLevelDialog}
                                startIcon={
                                    newVoltageLevel ? <EditIcon /> : <AddIcon />
                                }
                            >
                                <Typography align="left">
                                    <FormattedMessage id="NewVoltageLevel" />
                                </Typography>
                            </Button>
                        )} */}
                    </Grid>
                    <GridSection title="ReplacingLines" />
                    <Grid container spacing={2}>
                        {gridItem(newLine1IdField, 6)}
                        {gridItem(newLine1NameField, 6)}
                    </Grid>
                    <Grid container spacing={2}>
                        {gridItem(newLine2IdField, 6)}
                        {gridItem(newLine2NameField, 6)}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAndClear} variant="text">
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button onClick={handleSave} variant="text">
                        <FormattedMessage id="validate" />
                    </Button>
                </DialogActions>
                {/* {voltageLevelDialogOpen && (
                    <VoltageLevelCreationDialog
                        open={true}
                        onClose={onVoltageLevelDialogClose}
                        currentNodeUuid={currentNodeUuid}
                        substationOptionsPromise={substationOptionsPromise}
                        onCreateVoltageLevel={onVoltageLevelDo}
                        editData={voltageLevelToEdit}
                    />
                )} */}
            </Dialog>
        </>
    );
};

LineAttachToSplitLineDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    lineOptions: PropTypes.arrayOf(PropTypes.object),
    currentNodeUuid: PropTypes.string,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    substationOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    lineOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    editData: PropTypes.object,
};

export default LineAttachToSplitLineDialog;
