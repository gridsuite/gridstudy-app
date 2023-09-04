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
import { useInputForm } from '../../utils/inputs/input-hooks';
import { GridSection } from '../dialogUtils';
import { useSnackMessage } from '@gridsuite/commons-ui';
import DialogActions from '@mui/material/DialogActions';
import makeStyles from '@mui/styles/makeStyles';
import { useSensitivityFactors } from './sensitivity-factors';
import { SensiInjectionsSet } from './sensi-injections-set';
import { SensiInjections } from './sensi-injections';
import { SensiHVDCs } from './sensi-hvdcs';
import { SensiPSTs } from './sensi-psts';
import { SensiNodes } from './sensi-nodes';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import {
    fetchConfigParameter,
    updateConfigParameter,
} from '../../../services/config';

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

const SENSI_PARAMETER_PREFIX_IN_DATABASE = 'sensi.';

const PARAMETER_SENSI_INJECTIONS_SET = 'sensiInjectionsSet';
const PARAMETER_SENSI_INJECTIONS = 'sensiInjections';
const PARAMETER_SENSI_HVDCS = 'sensiHVDCs';
const PARAMETER_SENSI_PSTS = 'sensiPSTs';
const PARAMETER_SENSI_NODES = 'sensiNodes';

export const MONITORED_BRANCHES_EQUIPMENT_TYPES = [
    EQUIPMENT_TYPES.LINE,
    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
];

export const PSTS_EQUIPMENT_TYPES = [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORME];

export const MONITORED_VOLTAGE_LEVELS_EQUIPMENT_TYPES = [
    EQUIPMENT_TYPES.VOLTAGE_LEVEL,
];

export const EQUIPMENTS_IN_VOLTAGE_REGULATION_TYPES = [
    EQUIPMENT_TYPES.GENERATOR,
    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
    EQUIPMENT_TYPES.VSC_CONVERTER_STATION,
    EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR,
    EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
];

export const HVDC_EQUIPMENT_TYPES = [EQUIPMENT_TYPES.HVDC_LINE];
export const INJECTIONS_EQUIPMENT_TYPES = [
    EQUIPMENT_TYPES.GENERATOR,
    EQUIPMENT_TYPES.LOAD,
];

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

export const SensiChecked = ({ checked, onClick }) => {
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

const SensiParametersSelector = (props) => {
    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [paramSensiInjectionsSet, setParamSensiInjectionsSet] =
        useState(null);
    const [paramSensiInjections, setParamSensiInjections] = useState(null);
    const [paramSensiHVDCs, setParamSensiHVDCs] = useState(null);
    const [paramSensiPSTs, setParamSensiPSTs] = useState(null);
    const [paramSensiNodes, setParamSensiNodes] = useState(null);

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
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsChangingError',
                });
            });
        },
        [snackError]
    );

    const fetchSensiConfigurationParam = useCallback(
        (paramName) => {
            return fetchConfigParameter(
                SENSI_PARAMETER_PREFIX_IN_DATABASE + paramName
            )
                .then((p) => p && JSON.parse(p.value))
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsRetrievingError',
                    });
                });
        },
        [snackError]
    );

    useEffect(() => {
        fetchSensiConfigurationParam(PARAMETER_SENSI_INJECTIONS_SET).then((p) =>
            setParamSensiInjectionsSet(p)
        );

        fetchSensiConfigurationParam(PARAMETER_SENSI_INJECTIONS).then((p) =>
            setParamSensiInjections(p)
        );

        fetchSensiConfigurationParam(PARAMETER_SENSI_HVDCS).then((p) =>
            setParamSensiHVDCs(p)
        );

        fetchSensiConfigurationParam(PARAMETER_SENSI_PSTS).then((p) =>
            setParamSensiPSTs(p)
        );

        fetchSensiConfigurationParam(PARAMETER_SENSI_NODES).then((p) =>
            setParamSensiNodes(p)
        );
    }, [fetchSensiConfigurationParam]);

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
                        <GridSection title="SensitivityBranches" />
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

                        <GridSection title="SensitivityNodes" />
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
