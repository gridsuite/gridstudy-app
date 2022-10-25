/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import { elementType } from '@gridsuite/commons-ui';
import {
    useInputForm,
    useDirectoryElements,
    useEnumValue,
    useDoubleValue,
} from './inputs/input-hooks';
import { filledTextField, gridItem, GridSection } from './dialogUtils';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/ControlPoint';
import {
    fetchConfigParameter,
    updateConfigParameter,
    getSensiDefaultResultsThreshold,
} from '../../utils/rest-api';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import DialogActions from '@mui/material/DialogActions';
import makeStyles from '@mui/styles/makeStyles';

export const GENERATOR_DISTRIBUTION_TYPES = [
    { id: 'PROPORTIONAL', label: 'Proportional' },
    { id: 'PROPORTIONAL_MAXP', label: 'ProportionalMaxP' },
    { id: 'REGULAR', label: 'Regular' },
    { id: 'VENTILATION', label: 'Ventilation' },
];

export const LOAD_DISTRIBUTION_TYPES = [
    { id: 'PROPORTIONAL', label: 'Proportional' },
    { id: 'REGULAR', label: 'Regular' },
    { id: 'VENTILATION', label: 'Ventilation' },
];

export const SENSITIVITY_TYPES = [
    { id: 'DELTA_MW', label: 'DeltaMW' },
    { id: 'DELTA_A', label: 'DeltaA' },
];

export const SENSI_PARAMETER_PREFIX_IN_DATABASE = 'sensi.';

const useStyles = makeStyles((theme) => ({
    checkedButton: {
        marginTop: 30,
    },
    deleteButton: {
        marginTop: 20,
    },
    button: {
        justifyContent: 'flex-start',
        fontSize: 'small',
        marginTop: theme.spacing(1),
    },
    emptyListError: {
        color: theme.palette.error.main,
        fontSize: 'small',
        textAlign: 'center',
        margin: theme.spacing(0.5),
    },
    chipElement: {
        maxWidth: 200,
    },
}));

const SensiChecked = ({ checked, onClick }) => {
    const classes = useStyles();
    return (
        <Checkbox
            checked={checked}
            size="small"
            onChange={onClick}
            className={classes.checkedButton}
        />
    );
};

export const useExpandableSensitivityFactors = ({
    id,
    labelAddValue,
    Field,
    inputForm,
    validateItem,
    isRequired,
    initialValues,
}) => {
    const classes = useStyles();
    const [values, setValues] = useState([]);
    const [errors, setErrors] = useState();
    const [itemListError, setItemListError] = useState({
        show: false,
        type: '',
    });

    useEffect(() => {
        if (initialValues !== null) {
            setValues(initialValues);
        }
    }, [initialValues]);

    const handleDeleteItem = useCallback((index) => {
        setValues((oldValues) => {
            let newValues = [...oldValues];
            newValues.splice(index, 1);
            return newValues;
        });
    }, []);

    const handleSetValue = useCallback((index, newValue) => {
        setValues((oldValues) => {
            let newValues = [...oldValues];
            newValues[index] = newValue;
            return newValues;
        });
    }, []);

    const handleAddValue = useCallback(() => {
        setValues((oldValues) => [...oldValues, {}]);
        setItemListError({
            show: false,
            type: '',
        });
    }, []);

    useEffect(() => {
        function validation() {
            const res = validateItem(values);
            setErrors(res);
            if (res?.size !== 0) {
                return false;
            }
            setItemListError({
                show: false,
                type: '',
            });

            return true;
        }

        inputForm.addValidation(id, validation);
    }, [inputForm, values, id, validateItem, isRequired]);

    const isEmptyListError =
        itemListError.show && itemListError.type === 'empty';

    const field = useMemo(() => {
        return (
            <Grid item container spacing={2}>
                {values.map((value, idx) => (
                    <Grid key={id + idx} container spacing={2} item>
                        <Field
                            defaultValue={value}
                            onChange={handleSetValue}
                            index={idx}
                            inputForm={inputForm}
                            errors={errors?.get(idx)}
                        />
                        <Grid item xs={1}>
                            <IconButton
                                className={classes.deleteButton}
                                key={id + idx}
                                onClick={() => handleDeleteItem(idx)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <Button
                            fullWidth
                            className={classes.button}
                            startIcon={<AddIcon />}
                            onClick={handleAddValue}
                        >
                            <FormattedMessage id={labelAddValue} />
                        </Button>
                        {isEmptyListError && (
                            <div className={classes.emptyListError}>
                                <FormattedMessage id={'EmptyList/' + id} />
                            </div>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        );
    }, [
        values,
        classes.button,
        classes.deleteButton,
        classes.emptyListError,
        handleAddValue,
        labelAddValue,
        isEmptyListError,
        id,
        handleSetValue,
        inputForm,
        errors,
        handleDeleteItem,
    ]);

    return [values, field];
};

const SensiInjectionsSet = ({ index, onChange, defaultValue, inputForm }) => {
    const classes = useStyles();
    const [checked, setChecked] = useState(defaultValue.checked ?? true);

    const onClickChecked = () => {
        setChecked(!checked);
    };

    const [monitoredBranches, monitoredBranchesField] = useDirectoryElements({
        label: 'SupervisedBranches',
        initialValues: defaultValue.monitoredBranches
            ? defaultValue.monitoredBranches
            : [],
        elementType: elementType.FILTER,
        equipmentTypes: ['LINE', 'TWO_WINDINGS_TRANSFORMER'],
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [injections, injectionsField] = useDirectoryElements({
        label: 'Injections',
        initialValues: defaultValue.injections ? defaultValue.injections : [],
        elementType: elementType.FILTER,
        equipmentTypes: ['GENERATOR', 'LOAD'],
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [distributionType, distributionTypeField] = useEnumValue({
        label: 'DistributionType',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        enumValues: GENERATOR_DISTRIBUTION_TYPES,
        defaultValue: defaultValue.distributionType
            ? defaultValue.distributionType
            : 'PROPORTIONAL',
    });

    const [contingencies, contingenciesField] = useDirectoryElements({
        label: 'ContingencyLists',
        initialValues: defaultValue.contingencies
            ? defaultValue.contingencies
            : [],
        elementType: elementType.CONTINGENCY_LIST,
        titleId: 'ContingencyListsSelection',
        elementClassName: classes.chipElement,
    });

    useEffect(() => {
        onChange(index, {
            checked,
            monitoredBranches,
            injections,
            distributionType,
            contingencies,
        });
    }, [
        index,
        onChange,
        checked,
        monitoredBranches,
        injections,
        distributionType,
        contingencies,
    ]);

    return (
        <>
            <SensiChecked checked={checked} onClick={onClickChecked} />
            {gridItem(monitoredBranchesField, 2.5)}
            {gridItem(injectionsField, 2.5)}
            {gridItem(distributionTypeField, 2.5)}
            {gridItem(contingenciesField, 2.5)}
        </>
    );
};

const SensiInjections = ({ index, onChange, defaultValue }) => {
    const classes = useStyles();
    const [checked, setChecked] = useState(defaultValue.checked ?? true);

    const onClickChecked = () => {
        setChecked(!checked);
    };

    const [monitoredBranches, monitoredBranchesField] = useDirectoryElements({
        label: 'SupervisedBranches',
        initialValues: defaultValue.monitoredBranches
            ? defaultValue.monitoredBranches
            : [],
        elementType: elementType.FILTER,
        equipmentTypes: ['LINE', 'TWO_WINDINGS_TRANSFORMER'],
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [injections, injectionsField] = useDirectoryElements({
        label: 'Injections',
        initialValues: defaultValue.injections ? defaultValue.injections : [],
        elementType: elementType.FILTER,
        equipmentTypes: ['GENERATOR', 'LOAD'],
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [contingencies, contingenciesField] = useDirectoryElements({
        label: 'ContingencyLists',
        initialValues: defaultValue.contingencies
            ? defaultValue.contingencies
            : [],
        elementType: elementType.CONTINGENCY_LIST,
        titleId: 'ContingencyListsSelection',
        elementClassName: classes.chipElement,
    });

    useEffect(() => {
        onChange(index, {
            checked,
            monitoredBranches,
            injections,
            contingencies,
        });
    }, [
        index,
        onChange,
        checked,
        monitoredBranches,
        injections,
        contingencies,
    ]);

    return (
        <>
            <SensiChecked checked={checked} onClick={onClickChecked} />
            {gridItem(monitoredBranchesField, 2.5)}
            {gridItem(injectionsField, 2.5)}
            {gridItem(contingenciesField, 2.5)}
        </>
    );
};

const SensiHVDCs = ({ index, onChange, defaultValue, inputForm }) => {
    const classes = useStyles();
    const [checked, setChecked] = useState(defaultValue.checked ?? true);

    const onClickChecked = () => {
        setChecked(!checked);
    };

    const [monitoredBranches, monitoredBranchesField] = useDirectoryElements({
        label: 'SupervisedBranches',
        initialValues: defaultValue.monitoredBranches
            ? defaultValue.monitoredBranches
            : [],
        elementType: elementType.FILTER,
        equipmentTypes: ['LINE', 'TWO_WINDINGS_TRANSFORMER'],
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [hvdcs, hvdcsField] = useDirectoryElements({
        label: 'HvdcLines',
        initialValues: defaultValue.hvdcs ? defaultValue.hvdcs : [],
        elementType: elementType.FILTER,
        equipmentTypes: ['HVDC_LINE'],
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [sensitivityType, sensitivityTypeField] = useEnumValue({
        label: 'SensitivityType',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: defaultValue.sensitivityType
            ? defaultValue.sensitivityType
            : 'DELTA_MW',
        enumValues: SENSITIVITY_TYPES,
    });

    const [contingencies, contingenciesField] = useDirectoryElements({
        label: 'ContingencyLists',
        initialValues: defaultValue.contingencies
            ? defaultValue.contingencies
            : [],
        elementType: elementType.CONTINGENCY_LIST,
        titleId: 'ContingencyListsSelection',
        elementClassName: classes.chipElement,
    });

    useEffect(() => {
        onChange(index, {
            checked,
            monitoredBranches,
            hvdcs,
            sensitivityType,
            contingencies,
        });
    }, [
        index,
        onChange,
        checked,
        monitoredBranches,
        hvdcs,
        sensitivityType,
        contingencies,
    ]);

    return (
        <>
            <SensiChecked checked={checked} onClick={onClickChecked} />
            {gridItem(monitoredBranchesField, 2.5)}
            {gridItem(sensitivityTypeField, 2.5)}
            {gridItem(hvdcsField, 2.5)}
            {gridItem(contingenciesField, 2.5)}
        </>
    );
};

const SensiPSTs = ({ index, onChange, defaultValue, inputForm }) => {
    const classes = useStyles();
    const [checked, setChecked] = useState(defaultValue.checked ?? true);

    const onClickChecked = () => {
        setChecked(!checked);
    };

    const [monitoredBranches, monitoredBranchesField] = useDirectoryElements({
        label: 'SupervisedBranches',
        initialValues: defaultValue.monitoredBranches
            ? defaultValue.monitoredBranches
            : [],
        elementType: elementType.FILTER,
        equipmentTypes: ['LINE', 'TWO_WINDINGS_TRANSFORMER'],
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [psts, pstsField] = useDirectoryElements({
        label: 'PSTS',
        initialValues: defaultValue.psts ? defaultValue.psts : [],
        elementType: elementType.FILTER,
        equipmentTypes: ['TWO_WINDINGS_TRANSFORMER'],
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [sensitivityType, sensitivityTypeField] = useEnumValue({
        label: 'SensitivityType',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: defaultValue.sensitivityType
            ? defaultValue.sensitivityType
            : 'DELTA_MW',
        enumValues: SENSITIVITY_TYPES,
    });

    const [contingencies, contingenciesField] = useDirectoryElements({
        label: 'ContingencyLists',
        initialValues: defaultValue.contingencies
            ? defaultValue.contingencies
            : [],
        elementType: elementType.CONTINGENCY_LIST,
        titleId: 'ContingencyListsSelection',
        elementClassName: classes.chipElement,
    });

    useEffect(() => {
        onChange(index, {
            checked,
            monitoredBranches,
            psts,
            sensitivityType,
            contingencies,
        });
    }, [
        index,
        onChange,
        checked,
        monitoredBranches,
        psts,
        sensitivityType,
        contingencies,
    ]);

    return (
        <>
            <SensiChecked checked={checked} onClick={onClickChecked} />
            {gridItem(monitoredBranchesField, 2.5)}
            {gridItem(sensitivityTypeField, 2.5)}
            {gridItem(pstsField, 2.5)}
            {gridItem(contingenciesField, 2.5)}
        </>
    );
};

const SensiNodes = ({ index, onChange, defaultValue }) => {
    const classes = useStyles();
    const [checked, setChecked] = useState(defaultValue.checked ?? true);

    const onClickChecked = () => {
        setChecked(!checked);
    };

    const [monitoredVoltageLevels, monitoredVoltageLevelsField] =
        useDirectoryElements({
            label: 'SupervisedVoltageLevels',
            initialValues: defaultValue.monitoredVoltageLevels
                ? defaultValue.monitoredVoltageLevels
                : [],
            elementType: elementType.FILTER,
            equipmentTypes: ['VOLTAGE_LEVEL'],
            titleId: 'FiltersListsSelection',
            elementClassName: classes.chipElement,
        });

    const [equipmentsInVoltageRegulation, equipmentsInVoltageRegulationField] =
        useDirectoryElements({
            label: 'EquipmentsInVoltageRegulation',
            initialValues: defaultValue.equipmentsInVoltageRegulation
                ? defaultValue.equipmentsInVoltageRegulation
                : [],
            elementType: elementType.FILTER,
            equipmentTypes: [
                'GENERATOR',
                'TWO_WINDINGS_TRANSFORMER',
                'VSC_CONVERTER_STATION',
                'STATIC_VAR_COMPENSATOR',
                'SHUNT_COMPENSATOR',
            ],
            titleId: 'FiltersListsSelection',
            elementClassName: classes.chipElement,
        });

    const [contingencies, contingenciesField] = useDirectoryElements({
        label: 'ContingencyLists',
        initialValues: defaultValue.contingencies
            ? defaultValue.contingencies
            : [],
        elementType: elementType.CONTINGENCY_LIST,
        titleId: 'ContingencyListsSelection',
        elementClassName: classes.chipElement,
    });

    useEffect(() => {
        onChange(index, {
            checked,
            monitoredVoltageLevels,
            equipmentsInVoltageRegulation,
            contingencies,
        });
    }, [
        index,
        onChange,
        checked,
        monitoredVoltageLevels,
        equipmentsInVoltageRegulation,
        contingencies,
    ]);

    return (
        <>
            <SensiChecked checked={checked} onClick={onClickChecked} />
            {gridItem(monitoredVoltageLevelsField, 2.5)}
            {gridItem(equipmentsInVoltageRegulationField, 2.5)}
            {gridItem(contingenciesField, 2.5)}
        </>
    );
};

function validateFactor(values) {
    const res = new Map();
    return res;
}

export const useSensitivityFactors = ({ id, Field, initialValues }) => {
    const inputForm = useInputForm();

    const [factors, factorsField] = useExpandableSensitivityFactors({
        id: id,
        labelAddValue: 'AddSensitivityFactor',
        validateItem: validateFactor,
        Field: Field,
        inputForm: inputForm,
        isRequired: false,
        initialValues: initialValues,
    });

    const field = useMemo(() => {
        return (
            <>
                <Grid container item direction="row" spacing={2}>
                    {factorsField}
                </Grid>
            </>
        );
    }, [factorsField]);

    return [factors, field];
};

const SensiParametersSelector = (props) => {
    const { enqueueSnackbar } = useSnackbar();
    const intlRef = useIntlRef();

    const inputForm = useInputForm();

    const [defaultResultsThreshold, setDefaultResultsThreshold] =
        useState(0.01);
    const [paramResultsThreshold, setParamResultsThreshold] = useState(0.01);
    const [paramSensiInjectionsSet, setParamSensiInjectionsSet] =
        useState(null);
    const [paramSensiInjections, setParamSensiInjections] = useState(null);
    const [paramSensiHVDCs, setParamSensiHVDCs] = useState(null);
    const [paramSensiPSTs, setParamSensiPSTs] = useState(null);
    const [paramSensiNodes, setParamSensiNodes] = useState(null);

    const [resultsThreshold, resultsThresholdField] = useDoubleValue({
        label: 'resultsThreshold',
        validation: {
            isFieldRequired: true,
            isFieldNumeric: true,
            isValueGreaterOrEqualThan: defaultResultsThreshold,
            errorMsgId: 'ResultsThresholdGreaterOrEqualDefaultValue',
        },
        inputForm: inputForm,
        defaultValue: paramResultsThreshold,
        formProps: filledTextField,
    });

    const [sensiInjectionsSet, SensiInjectionsSetsField] =
        useSensitivityFactors({
            id: 'sensiInjectionsSet',
            Field: SensiInjectionsSet,
            initialValues: paramSensiInjectionsSet,
        });

    const [sensiInjections, SensiInjectionsField] = useSensitivityFactors({
        id: 'sensiInjections',
        Field: SensiInjections,
        initialValues: paramSensiInjections,
    });

    const [sensiHVDCs, SensiHVDCsField] = useSensitivityFactors({
        id: 'sensiHVDCs',
        Field: SensiHVDCs,
        initialValues: paramSensiHVDCs,
    });

    const [sensiPSTs, SensiPSTsField] = useSensitivityFactors({
        id: 'sensiPSTs',
        Field: SensiPSTs,
        initialValues: paramSensiPSTs,
    });

    const [sensiNodes, SensiNodesField] = useSensitivityFactors({
        id: 'sensiNodes',
        Field: SensiNodes,
        initialValues: paramSensiNodes,
    });

    const handleClose = () => {
        props.onClose();
    };

    const handleStart = () => {
        if (inputForm.validate()) {
            // TODO : remove 'name' property when storing the parameters in config-server
            // fetch name from uuid when fetching parameters from config-server

            handleSaveSensiConfigurationParam(
                'resultsThreshold',
                resultsThreshold
            );
            handleSaveSensiConfigurationParam(
                'sensiInjectionsSet',
                sensiInjectionsSet
            );
            handleSaveSensiConfigurationParam(
                'sensiInjections',
                sensiInjections
            );
            handleSaveSensiConfigurationParam('sensiHVDCs', sensiHVDCs);
            handleSaveSensiConfigurationParam('sensiPSTs', sensiPSTs);
            handleSaveSensiConfigurationParam('sensiNodes', sensiNodes);

            // we provide to the sensitivity analysis service only the checked items in the configuration
            const sensiConfiguration = {
                resultsThreshold: resultsThreshold,
                sensitivityInjectionsSets: sensiInjectionsSet.filter(
                    (e) => e.checked
                ),
                sensitivityInjections: sensiInjections.filter((e) => e.checked),
                sensitivityHVDCs: sensiHVDCs.filter((e) => e.checked),
                sensitivityPSTs: sensiPSTs.filter((e) => e.checked),
                sensitivityNodes: sensiNodes.filter((e) => e.checked),
            };

            props.onStart(sensiConfiguration);
        }
    };

    const handleSaveSensiConfigurationParam = useCallback(
        (paramName, paramValue) => {
            updateConfigParameter(
                SENSI_PARAMETER_PREFIX_IN_DATABASE + paramName,
                JSON.stringify(paramValue)
            ).catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'paramsChangingError',
                        intlRef: intlRef,
                    },
                });
            });
        },
        [enqueueSnackbar, intlRef]
    );

    function fetchSensiConfigurationParam(paramName) {
        return fetchConfigParameter(
            SENSI_PARAMETER_PREFIX_IN_DATABASE + paramName
        );
    }

    const displayError = useCallback(
        (errorMessage) =>
            displayErrorMessageWithSnackbar({
                errorMessage: errorMessage,
                enqueueSnackbar: enqueueSnackbar,
                headerMessage: {
                    headerMessageId: 'paramsRetrievingError',
                    intlRef: intlRef,
                },
            }),
        [enqueueSnackbar, intlRef]
    );

    useEffect(() => {
        // get default results threshold value
        getSensiDefaultResultsThreshold()
            .then((value) => setDefaultResultsThreshold(value))
            .catch((errorMessage) => displayError(errorMessage));

        // fetch configuration in config database
        fetchSensiConfigurationParam('resultsThreshold')
            .then((p) => {
                setParamResultsThreshold(parseFloat(JSON.parse(p.value)));
            })
            .catch((errorMessage) => displayError(errorMessage));

        fetchSensiConfigurationParam('sensiInjectionsSet')
            .then((p) => setParamSensiInjectionsSet(JSON.parse(p.value)))
            .catch((errorMessage) => displayError(errorMessage));

        fetchSensiConfigurationParam('sensiInjections')
            .then((p) => setParamSensiInjections(JSON.parse(p.value)))
            .catch((errorMessage) => displayError(errorMessage));

        fetchSensiConfigurationParam('sensiHVDCs')
            .then((p) => setParamSensiHVDCs(JSON.parse(p.value)))
            .catch((errorMessage) => displayError(errorMessage));

        fetchSensiConfigurationParam('sensiPSTs')
            .then((p) => setParamSensiPSTs(JSON.parse(p.value)))
            .catch((errorMessage) => displayError(errorMessage));

        fetchSensiConfigurationParam('sensiNodes')
            .then((p) => setParamSensiNodes(JSON.parse(p.value)))
            .catch((errorMessage) => displayError(errorMessage));
    }, [displayError]);

    return (
        <>
            <Dialog
                open={props.open}
                onClose={handleClose}
                maxWidth={'lg'}
                fullWidth={true}
            >
                <DialogTitle>
                    <Typography component="span" variant="h5">
                        <FormattedMessage id="SensibilityAnalysisParameters" />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} direction="column" item xs={12}>
                        <Grid item>{gridItem(resultsThresholdField, 3)}</Grid>
                        <GridSection title="SensitivityBranches" heading="3" />
                        <GridSection
                            title="SensitivityInjectionsSet"
                            heading="4"
                        />
                        {SensiInjectionsSetsField}

                        <GridSection title="SensitivityInjection" heading="4" />
                        {SensiInjectionsField}

                        <GridSection title="SensitivityHvdc" heading="4" />
                        {SensiHVDCsField}

                        <GridSection title="SensitivityTD" heading="4" />
                        {SensiPSTsField}

                        <GridSection title="SensitivityNodes" heading="3" />
                        {SensiNodesField}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        disabled={false}
                    >
                        <FormattedMessage id="close" />
                    </Button>
                    <Button
                        onClick={handleStart}
                        variant="contained"
                        disabled={false}
                    >
                        <FormattedMessage id="Execute" />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

SensiParametersSelector.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onStart: PropTypes.func.isRequired,
};

export default SensiParametersSelector;
