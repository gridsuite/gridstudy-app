/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
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
    useDirectoryElements,
    useDoubleValue,
    useEnumValue,
    useInputForm,
} from '../inputs/input-hooks';
import { filledTextField, gridItem, GridSection } from '../dialogUtils';
import {
    fetchConfigParameter,
    getSensiDefaultResultsThreshold,
    updateConfigParameter,
} from '../../../utils/rest-api';
import { useSnackMessage } from '../../../utils/messages';
import DialogActions from '@mui/material/DialogActions';
import makeStyles from '@mui/styles/makeStyles';
import { useSensitivityFactors } from './sensitivity-factors';

export const INJECTION_DISTRIBUTION_TYPES = [
    { id: 'PROPORTIONAL', label: 'Proportional' },
    { id: 'PROPORTIONAL_MAXP', label: 'ProportionalMaxP' },
    { id: 'REGULAR', label: 'Regular' },
    { id: 'VENTILATION', label: 'Ventilation' },
];

export const SENSITIVITY_TYPES = [
    { id: 'DELTA_MW', label: 'DeltaMW' },
    { id: 'DELTA_A', label: 'DeltaA' },
];

export const SENSI_PARAMETER_PREFIX_IN_DATABASE = 'sensi.';

const PARAMETER_RESULTS_THRESHOLD = 'resultsthreshold';
const PARAMETER_SENSI_INJECTIONS_SET = 'sensiInjectionsSet';
const PARAMETER_SENSI_INJECTIONS = 'sensiInjections';
const PARAMETER_SENSI_HVDCS = 'sensiHVDCs';
const PARAMETER_SENSI_PSTS = 'sensiPSTs';
const PARAMETER_SENSI_NODES = 'sensiNodes';

const EquipmentType = {
    LINE: 'LINE',
    GENERATOR: 'GENERATOR',
    LOAD: 'LOAD',
    SHUNT_COMPENSATOR: 'SHUNT_COMPENSATOR',
    STATIC_VAR_COMPENSATOR: 'STATIC_VAR_COMPENSATOR',
    BATTERY: 'BATTERY',
    BUSBAR_SECTION: 'BUSBAR_SECTION',
    DANGLING_LINE: 'DANGLING_LINE',
    LCC_CONVERTER_STATION: 'LCC_CONVERTER_STATION',
    VSC_CONVERTER_STATION: 'VSC_CONVERTER_STATION',
    TWO_WINDINGS_TRANSFORMER: 'TWO_WINDINGS_TRANSFORMER',
    THREE_WINDINGS_TRANSFORMER: 'THREE_WINDINGS_TRANSFORMER',
    HVDC_LINE: 'HVDC_LINE',
    VOLTAGE_LEVEL: 'VOLTAGE_LEVEL',
    SUBSTATION: 'SUBSTATION',
};

export const useStyles = makeStyles((theme) => ({
    checkedButton: {
        marginTop: 20,
    },
    deleteButton: {
        marginTop: 10,
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
        margin: 3,
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
        enumValues: INJECTION_DISTRIBUTION_TYPES,
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
        equipmentTypes: [
            EquipmentType.LINE,
            EquipmentType.TWO_WINDINGS_TRANSFORMER,
        ],
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [hvdcs, hvdcsField] = useDirectoryElements({
        label: 'HvdcLines',
        initialValues: defaultValue.hvdcs ? defaultValue.hvdcs : [],
        elementType: elementType.FILTER,
        equipmentTypes: [EquipmentType.HVDC_LINE],
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
        equipmentTypes: [
            EquipmentType.LINE,
            EquipmentType.TWO_WINDINGS_TRANSFORMER,
        ],
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [psts, pstsField] = useDirectoryElements({
        label: 'PSTS',
        initialValues: defaultValue.psts ? defaultValue.psts : [],
        elementType: elementType.FILTER,
        equipmentTypes: [EquipmentType.TWO_WINDINGS_TRANSFORMER],
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
            equipmentTypes: [EquipmentType.VOLTAGE_LEVEL],
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
                EquipmentType.GENERATOR,
                EquipmentType.TWO_WINDINGS_TRANSFORMER,
                EquipmentType.VSC_CONVERTER_STATION,
                EquipmentType.STATIC_VAR_COMPENSATOR,
                EquipmentType.SHUNT_COMPENSATOR,
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
            {gridItem(monitoredVoltageLevelsField, 3)}
            {gridItem(equipmentsInVoltageRegulationField, 3.5)}
            {gridItem(contingenciesField, 2.5)}
        </>
    );
};

const SensiParametersSelector = (props) => {
    const { snackError } = useSnackMessage();

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
        label: PARAMETER_RESULTS_THRESHOLD,
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
            id: PARAMETER_SENSI_INJECTIONS_SET,
            Field: SensiInjectionsSet,
            initialValues: paramSensiInjectionsSet,
        });

    const [sensiInjections, SensiInjectionsField] = useSensitivityFactors({
        id: PARAMETER_SENSI_INJECTIONS,
        Field: SensiInjections,
        initialValues: paramSensiInjections,
    });

    const [sensiHVDCs, SensiHVDCsField] = useSensitivityFactors({
        id: PARAMETER_SENSI_HVDCS,
        Field: SensiHVDCs,
        initialValues: paramSensiHVDCs,
    });

    const [sensiPSTs, SensiPSTsField] = useSensitivityFactors({
        id: PARAMETER_SENSI_PSTS,
        Field: SensiPSTs,
        initialValues: paramSensiPSTs,
    });

    const [sensiNodes, SensiNodesField] = useSensitivityFactors({
        id: PARAMETER_SENSI_NODES,
        Field: SensiNodes,
        initialValues: paramSensiNodes,
    });

    const handleClose = () => {
        props.onClose();
    };

    const handleStart = () => {
        if (inputForm.validate()) {
            handleSaveSensiConfigurationParam(
                PARAMETER_RESULTS_THRESHOLD,
                resultsThreshold
            );
            handleSaveSensiConfigurationParam(
                PARAMETER_SENSI_INJECTIONS_SET,
                sensiInjectionsSet
            );
            handleSaveSensiConfigurationParam(
                PARAMETER_SENSI_INJECTIONS,
                sensiInjections
            );
            handleSaveSensiConfigurationParam(
                PARAMETER_SENSI_HVDCS,
                sensiHVDCs
            );
            handleSaveSensiConfigurationParam(PARAMETER_SENSI_PSTS, sensiPSTs);
            handleSaveSensiConfigurationParam(
                PARAMETER_SENSI_NODES,
                sensiNodes
            );

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
                snackError({
                    messageTxt: errorMessage,
                    headerId: 'paramsChangingError',
                });
            });
        },
        [snackError]
    );

    function fetchSensiConfigurationParam(paramName) {
        return fetchConfigParameter(
            SENSI_PARAMETER_PREFIX_IN_DATABASE + paramName
        );
    }

    useEffect(() => {
        // get default results threshold value
        getSensiDefaultResultsThreshold().then((value) =>
            setDefaultResultsThreshold(value)
        );

        // fetch configuration in config database
        fetchSensiConfigurationParam(PARAMETER_RESULTS_THRESHOLD).then((p) =>
            setParamResultsThreshold(parseFloat(JSON.parse(p.value)))
        );

        fetchSensiConfigurationParam(PARAMETER_SENSI_INJECTIONS_SET).then((p) =>
            setParamSensiInjectionsSet(JSON.parse(p.value))
        );

        fetchSensiConfigurationParam(PARAMETER_SENSI_INJECTIONS).then((p) =>
            setParamSensiInjections(JSON.parse(p.value))
        );

        fetchSensiConfigurationParam(PARAMETER_SENSI_HVDCS).then((p) =>
            setParamSensiHVDCs(JSON.parse(p.value))
        );

        fetchSensiConfigurationParam(PARAMETER_SENSI_PSTS).then((p) =>
            setParamSensiPSTs(JSON.parse(p.value))
        );

        fetchSensiConfigurationParam(PARAMETER_SENSI_NODES).then((p) =>
            setParamSensiNodes(JSON.parse(p.value))
        );
    }, []);

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
