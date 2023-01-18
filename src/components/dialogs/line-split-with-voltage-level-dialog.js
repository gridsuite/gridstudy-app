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
import Button from '@mui/material/Button';
import ModificationDialog from './modificationDialog';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useInputForm, useTextValue } from './inputs/input-hooks';
import {
    gridItem,
    GridSection,
    compareById,
    sanitizeString,
    getIdOrSelf,
} from './dialogUtils';
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
import EditIcon from '@mui/icons-material/Edit';
import { useAutocompleteField } from './inputs/use-autocomplete-field';
import {MODIFICATION_TYPE} from '../../util/enums'

/**
 * Dialog to cut a line in two parts with in insertion of (possibly new) voltage level.
 * @param lineOptionsPromise Promise handling list of network lines
 * @param voltageLevelOptionsPromise Promise handling list of network voltage levels
 * @param currentNodeUuid the currently selected tree node
 * @param substationOptionsPromise Promise handling list of network substations
 * @param editData the possible line split with voltage level creation record to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const LineSplitWithVoltageLevelDialog = ({
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

    const toFormValues = (lineSplit) => {
        return {
            lineToSplitId: lineSplit.id + '(1)',
            percentage: lineSplit.percentage,
        };
    };

    const equipmentPath = 'line-split';

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues,
        setFormValues,
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

    const formValueLineToSplitId = useMemo(() => {
        return formValues?.lineToSplitId
            ? { id: formValues?.lineToSplitId }
            : { id: '' };
    }, [formValues]);

    const [lineToDivide, lineToDivideField] = useAutocompleteField({
        id: 'lineToDivide',
        label: 'LineToSplit',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        values: lineOptions?.sort(compareById),
        allowNewValue: true,
        getLabel: getIdOrSelf,
        defaultValue:
            lineOptions.find(
                (value) => value.id === formValues?.lineToSplitId
            ) || formValueLineToSplitId,
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
            label: 'VoltageLevelToSplitAt',
            validation: { isFieldRequired: true },
            inputForm: inputForm,
            values: allVoltageLevelOptions,
            allowNewValue: true,
            getLabel: getIdOrSelf,
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
            getLabel: getIdOrSelf,
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

    const handleValidation = () => {
        return inputForm.validate();
    };

    const handleSave = () => {
        divideLine(
            studyUuid,
            currentNodeUuid,
            editData ? editData.uuid : undefined,
            lineToDivide.id || lineToDivide,
            parseFloat(percentage),
            newVoltageLevel,
            newVoltageLevel ? null : voltageLevelOrId?.id || voltageLevelOrId,
            bbsOrNodeId?.id || bbsOrNodeId,
            newLine1Id,
            sanitizeString(newLine1Name),
            newLine2Id,
            sanitizeString(newLine2Name)
        ).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'LineDivisionError',
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
                    type: [MODIFICATION_TYPE.VOLTAGE_LEVEL_CREATION],
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
                inputForm.setHasChanged(true);
            });
        },
        [bbsOrNodeId, setBbsOrNodeId, setVoltageLevelOrId, inputForm]
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
        <ModificationDialog
            fullWidth
            onClear={clear}
            onValidation={handleValidation}
            onSave={handleSave}
            disabledSave={!inputForm.hasChanged}
            aria-labelledby="dialog-create-voltage-level-amidst-a-line"
            maxWidth={'md'}
            titleId="LineSplitWithVoltageLevel"
            searchCopy={searchCopy}
            {...dialogProps}
        >
            <GridSection title="LineToSplit" />
            <Grid container spacing={2} alignItems="center">
                {gridItem(lineToDivideField, 5)}
                {gridItem(<Typography>{lineSubstation(true)}</Typography>, 1)}
                {gridItem(percentageArea, 5)}
                {gridItem(<Typography>{lineSubstation(false)}</Typography>, 1)}
            </Grid>
            <GridSection title="VoltageLevel" />
            <Grid container spacing={2}>
                {gridItem(voltageLevelIdField)}
                {gridItem(bbsOrNodeIdField)}
                {gridItem(
                    <Button
                        onClick={openVoltageLevelDialog}
                        startIcon={newVoltageLevel ? <EditIcon /> : <AddIcon />}
                    >
                        <Typography align="left">
                            <FormattedMessage id="NewVoltageLevel" />
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
            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={'VOLTAGE_LEVEL'}
                onSelectionChange={searchCopy.handleSelectionChange}
                currentNodeUuid={currentNodeUuid}
            />
        </ModificationDialog>
    );
};

LineSplitWithVoltageLevelDialog.propTypes = {
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
    currentNodeUuid: PropTypes.string,
    editData: PropTypes.object,
};

export default LineSplitWithVoltageLevelDialog;
