/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import { useSelector } from 'react-redux';

import makeStyles from '@mui/styles/makeStyles';
import {
    Chip,
    Grid,
    MenuItem,
    Autocomplete,
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    TextField,
    Select,
    Switch,
    Tab,
    Tabs,
    Typography,
    Slider,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import { useSnackbar } from 'notistack';

import { LineFlowMode } from './network/line-layer';
import { LineFlowColorMode } from './network/line-layer';
import {
    getLoadFlowParameters,
    setLoadFlowParameters,
    getLoadFlowProvider,
    setLoadFlowProvider,
    updateConfigParameter,
    getAvailableComponentLibraries,
    getDefaultLoadFlowProvider,
    fetchDefaultParametersValues,
} from '../utils/rest-api';
import { SubstationLayout } from './diagrams/singleLineDiagram/single-line-diagram';
import {
    PARAM_CENTER_LABEL,
    PARAM_DIAGONAL_LABEL,
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_DISPLAY_OVERLOAD_TABLE,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_COMPONENT_LIBRARY,
    PARAM_FLUX_CONVENTION,
} from '../utils/config-params';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';
import { NetworkParameters } from './dialogs/parameters/network-parameter';
import { LoadFlow } from './dialogs/parameters/load-flow-parameter';
import { SingleLineDiagramParameters } from './dialogs/parameters/single-line-diagram-parameter';
import { MapParameters } from './dialogs/parameters/map-parameter';
import { LabelledButton } from './dialogs/parameters/parameters-V2';

const useStyles = makeStyles((theme) => ({
    title: {
        padding: theme.spacing(2),
    },
    grid: {
        paddingTop: theme.spacing(2),
        padding: theme.spacing(0),
    },
    minWidthMedium: {
        minWidth: theme.spacing(20),
    },
    controlItem: {
        justifyContent: 'flex-end',
    },
    button: {
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1),
    },
    advancedParameterButton: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(1),
    },
}));

export const FluxConventions = {
    IIDM: 'iidm',
    TARGET: 'target',
};

export function useParameterState(paramName) {
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const paramGlobalState = useSelector((state) => state[paramName]);

    const [paramLocalState, setParamLocalState] = useState(paramGlobalState);

    useEffect(() => {
        setParamLocalState(paramGlobalState);
    }, [paramGlobalState]);

    const handleChangeParamLocalState = useCallback(
        (value) => {
            setParamLocalState(value);
            updateConfigParameter(paramName, value).catch((errorMessage) => {
                setParamLocalState(paramGlobalState);
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
        [
            paramName,
            enqueueSnackbar,
            intlRef,
            setParamLocalState,
            paramGlobalState,
        ]
    );

    return [paramLocalState, handleChangeParamLocalState];
}

const LF_PROVIDER_VALUES = {
    OpenLoadFlow: 'OpenLoadFlow',
    Hades2: 'Hades2',
};

const Parameters = ({ showParameters, hideParameters, user }) => {
    const classes = useStyles();

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const [fluxConventionLocal, handleChangeFluxConvention] = useParameterState(
        PARAM_FLUX_CONVENTION
    );

    const studyUuid = useSelector((state) => state.studyUuid);

    const [lfProvider, setLfProvider] = useState(null);

    const [lfParams, setLfParams] = useState(null);

    const [tabIndex, setTabIndex] = useState(0);

    const updateLfProvider = useCallback(
        (newProvider) => {
            setLoadFlowProvider(studyUuid, newProvider)
                .then(() => setLfProvider(newProvider))
                .catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'setLoadFlowProviderError',
                            intlRef: intlRef,
                        },
                    });
                });
        },
        [studyUuid, enqueueSnackbar, intlRef]
    );

    function TabPanel(props) {
        const { children, value, index, ...other } = props;
        return (
            <Typography
                component="div"
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && <Box p={1}>{children}</Box>}
            </Typography>
        );
    }

    function MakeButton(callback, label) {
        return (
            <Button onClick={callback} className={classes.button}>
                <FormattedMessage id={label} />
            </Button>
        );
    }

    const resetNetworkParameters = () => {
        fetchDefaultParametersValues().then((defaultValues) => {
            const defaultFluxConvention = defaultValues.fluxConvention;
            if (
                Object.values(FluxConventions).includes(defaultFluxConvention)
            ) {
                handleChangeFluxConvention(defaultFluxConvention);
            }
        });
    };

    const resetLfParameters = () => {
        setLoadFlowParameters(studyUuid, null)
            .then(() => {
                return getLoadFlowParameters(studyUuid)
                    .then((params) => setLfParams(params))
                    .catch((errorMessage) =>
                        displayErrorMessageWithSnackbar({
                            errorMessage: errorMessage,
                            enqueueSnackbar: enqueueSnackbar,
                            headerMessage: {
                                headerMessageId: 'paramsRetrievingError',
                                intlRef: intlRef,
                            },
                        })
                    );
            })
            .catch((errorMessage) =>
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'paramsChangingError',
                        intlRef: intlRef,
                    },
                })
            );

        this.props.LoadFlow.setLoadFlowProviderToDefault();
    };

    return (
        <Dialog
            open={showParameters}
            onClose={hideParameters}
            aria-labelledby="form-dialog-title"
            maxWidth={'md'}
            fullWidth={true}
        >
            <DialogTitle id="form-dialog-title">
                <Typography
                    component="span"
                    variant="h5"
                    className={classes.title}
                >
                    <FormattedMessage id="parameters" />
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Container maxWidth="md">
                    <Tabs
                        value={tabIndex}
                        variant="scrollable"
                        onChange={(event, newValue) => setTabIndex(newValue)}
                        aria-label="parameters"
                    >
                        <Tab
                            label={<FormattedMessage id="SingleLineDiagram" />}
                        />
                        <Tab label={<FormattedMessage id="Map" />} />
                        <Tab
                            disabled={!studyUuid}
                            label={<FormattedMessage id="LoadFlow" />}
                        />
                        <Tab label={<FormattedMessage id="Network" />} />
                    </Tabs>

                    <TabPanel value={tabIndex} index={0}>
                        <SingleLineDiagramParameters />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={1}>
                        <MapParameters />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={2}>
                        {studyUuid && <LoadFlow />}
                    </TabPanel>
                    <TabPanel value={tabIndex} index={3}>
                        <NetworkParameters />
                    </TabPanel>
                    <Grid container className={classes.controlItem}>
                        {tabIndex === 2 && (
                            <LabelledButton
                                callback={resetLfParameters}
                                label="resetToDefault"
                            />
                        )}
                        {tabIndex === 3 && (
                            <LabelledButton
                                callback={resetNetworkParameters}
                                label="resetToDefault"
                            />
                        )}

                        <Button
                            onClick={hideParameters}
                            className={classes.button}
                        >
                            <FormattedMessage id="close" />
                        </Button>
                    </Grid>
                </Container>
            </DialogContent>
        </Dialog>
    );
};

export default Parameters;
