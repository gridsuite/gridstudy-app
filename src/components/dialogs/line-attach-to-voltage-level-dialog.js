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
import ModificationDialog from './modificationDialog';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useInputForm, useTextValue } from './inputs/input-hooks';
import {
    gridItem,
    GridSection,
    removeNullDataValues,
    compareById,
} from './dialogUtils';
import { attachLine } from '../../utils/rest-api';
import PropTypes from 'prop-types';
import AddIcon from '@mui/icons-material/ControlPoint';
import EditIcon from '@mui/icons-material/Edit';
import LineCreationDialog from './line-creation-dialog';
import {
    makeVoltageLevelCreationParams,
    useComplementaryPercentage,
} from './line-split-or-attach-utils';
import VoltageLevelCreationDialog from './voltage-level-creation-dialog';
import { makeRefreshBusOrBusbarSectionsCallback } from './connectivity-edition';
import { Box } from '@mui/system';
import { useAutocompleteField } from './inputs/use-autocomplete-field';

const getId = (e) => e?.id || (typeof e === 'string' ? e : '');

/**
 * Dialog to attach a line to a (possibly new) voltage level.
 * @param lineOptionsPromise Promise handling list of network lines
 * @param voltageLevelOptionsPromise Promise handling list of network voltage levels
 * @param currentNodeUuid the currently selected tree node
 * @param substationOptionsPromise Promise handling list of network substations
 * @param editData the possible line split with voltage level creation record to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const LineAttachToVoltageLevelDialog = ({
    lineOptionsPromise,
    voltageLevelOptionsPromise,
    currentNodeUuid,
    substationOptionsPromise,
    editData,
    ...dialogProps
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

    const [newVoltageLevel, setNewVoltageLevel] = useState(null);

    const [attachmentLine, setAttachmentLine] = useState(null);

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
            setAttachmentLine(editData.attachmentLine);
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

    const formValueLineToAttachId = useMemo(() => {
        return formValues?.lineToAttachToId
            ? { id: formValues?.lineToAttachToId }
            : { id: '' };
    }, [formValues]);

    const [lineToAttachTo, lineToAttachToField] = useAutocompleteField({
        id: 'lineToAttachTo',
        label: 'LineToAttachTo',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        values: lineOptions?.sort(compareById),
        allowNewValue: true,
        getLabel: getId,
        defaultValue:
            lineOptions.find(
                (value) => value.id === formValues?.lineToAttachToId
            ) || formValueLineToAttachId,
        loading: loadingLineOptions,
    });

    const [percentage, percentageArea] = useComplementaryPercentage({
        validation: {
            isFieldRequired: true,
            valueGreaterThan: 0.0,
            valueLessThanOrEqualTo: 99.9,
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

    const lineToEdit = useMemo(() => {
        let lineData;
        if (!attachmentLine && formValues?.attachmentLine) {
            lineData = formValues.attachmentLine;
        } else {
            lineData = attachmentLine;
        }
        lineData && removeNullDataValues(lineData);
        return lineData;
    }, [attachmentLine, formValues]);

    const [, lineToIdField] = useTextValue({
        id: 'attachedLineId',
        label: 'AttachedLineId',
        inputForm: inputForm,
        validation: { isFieldRequired: true },
        defaultValue: lineToEdit?.equipmentId,
    });

    const [attachmentPointId, attachmentPointIdField] = useTextValue({
        id: 'attachmentPointId',
        label: 'AttachmentPointId',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        defaultValue: formValues?.attachmentPointId,
    });

    const [attachmentPointName, attachmentPointNameField] = useTextValue({
        id: 'attachmentPointName',
        label: 'AttachmentPointName',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        defaultValue: formValues?.attachmentPointName,
    });

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

    const [voltageLevelDialogOpen, setVoltageLevelDialogOpen] = useState(false);

    const [lineDialogOpen, setLineDialogOpen] = useState(false);

    const handleValidation = () => {
        return inputForm.validate();
    };

    const handleSave = () => {
        attachLine(
            studyUuid,
            currentNodeUuid,
            editData ? editData.uuid : undefined,
            lineToAttachTo.id || lineToAttachTo,
            parseFloat(percentage),
            attachmentPointId,
            attachmentPointName,
            newVoltageLevel,
            newVoltageLevel ? null : voltageLevelOrId?.id || voltageLevelOrId,
            bbsOrNodeId?.id || bbsOrNodeId,
            attachmentLine,
            newLine1Id,
            newLine1Name || null,
            newLine2Id,
            newLine2Name || null
        ).catch((errorMessage) => {
            snackError({
                messageTxt: errorMessage,
                headerId: 'LineAttachmentError',
            });
        });
    };

    const clear = () => {
        inputForm.reset();
        setFormValues(null);
    };

    const onVoltageLevelDo = useCallback(
        ({
            studyUuid,
            currentNodeUuid,
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
                voltageLevelOrIdRef.current = voltageLevelId;
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

    const onLineDo = useCallback(
        (
            studyUuid,
            currentNodeUuid,
            lineId,
            lineName,
            seriesResistance,
            seriesReactance,
            shuntConductance1,
            shuntSusceptance1,
            shuntConductance2,
            shuntSusceptance2,
            connectivity1VlId,
            connectivity1BobbsId,
            connectivity2VlId,
            connectivity2BobbsId,
            permanentCurrentLimit1,
            permanentCurrentLimit2,
            isUpdate,
            modificationUuid
        ) => {
            return new Promise(() => {
                const preparedLine = {
                    equipmentId: lineId,
                    equipmentName: lineName,
                    seriesResistance: seriesResistance,
                    seriesReactance: seriesReactance,
                    shuntConductance1: shuntConductance1,
                    shuntSusceptance1: shuntSusceptance1,
                    shuntConductance2: shuntConductance2,
                    shuntSusceptance2: shuntSusceptance2,
                    currentLimits1: {
                        permanentLimit: permanentCurrentLimit1,
                    },
                    currentLimits2: {
                        permanentLimit: permanentCurrentLimit2,
                    },
                };
                setAttachmentLine(preparedLine);
            });
        },
        []
    );

    const onLineDialogClose = () => {
        setLineDialogOpen(false);
    };

    const openLineDialog = () => {
        setLineDialogOpen(true);
    };

    const lineSubstation = (isFirst) => {
        if (!lineToAttachTo) return '';
        let vlId = '';
        if (typeof lineToAttachTo === 'object') {
            vlId = isFirst
                ? lineToAttachTo.voltageLevelId1
                : lineToAttachTo.voltageLevelId2;
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
            <ModificationDialog
                fullWidth
                onClear={clear}
                onValidation={handleValidation}
                onSave={handleSave}
                disabledSave={!inputForm.hasChanged}
                aria-labelledby="dialog-attach-voltage-level-to-a-line"
                maxWidth={'md'}
                titleId="LineAttachToVoltageLevel"
                {...dialogProps}
            >
                <GridSection title="LineToAttachTo" />
                <Grid container spacing={2} alignItems="center">
                    {gridItem(lineToAttachToField, 5)}
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
                <GridSection title="AttachmentPoint" />
                <Grid container spacing={2}>
                    {gridItem(attachmentPointIdField, 6)}
                    {gridItem(attachmentPointNameField, 6)}
                </Grid>
                <GridSection title="VoltageLevel" />
                <Grid container spacing={2}>
                    {gridItem(voltageLevelIdField)}
                    {gridItem(bbsOrNodeIdField)}
                    {gridItem(
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
                    )}
                </Grid>
                <GridSection title="AttachedLine" />
                <Grid container spacing={2}>
                    {gridItem(lineToIdField)}
                    <Box width="100%" />
                    {gridItem(
                        <Button
                            onClick={openLineDialog}
                            startIcon={
                                attachmentLine ? <EditIcon /> : <AddIcon />
                            }
                        >
                            <Typography align="left">
                                <FormattedMessage id="AttachedLine" />
                            </Typography>
                        </Button>
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
                {voltageLevelDialogOpen && (
                    <VoltageLevelCreationDialog
                        open={true}
                        onClose={onVoltageLevelDialogClose}
                        currentNodeUuid={currentNodeUuid}
                        substationOptionsPromise={substationOptionsPromise}
                        onCreateVoltageLevel={onVoltageLevelDo}
                        editData={voltageLevelToEdit}
                    />
                )}
                {lineDialogOpen && (
                    <LineCreationDialog
                        open={true}
                        onClose={onLineDialogClose}
                        currentNodeUuid={currentNodeUuid}
                        substationOptionsPromise={substationOptionsPromise}
                        displayConnectivity={false}
                        onCreateLine={onLineDo}
                        editData={lineToEdit}
                    />
                )}
            </ModificationDialog>
        </>
    );
};

LineAttachToVoltageLevelDialog.propTypes = {
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

export default LineAttachToVoltageLevelDialog;
