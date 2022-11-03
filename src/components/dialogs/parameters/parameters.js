/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import {
    Grid,
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Tab,
    Tabs,
    Typography,
    Switch,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { updateConfigParameter } from '../../../utils/rest-api';

import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../../utils/messages';

import {
    SingleLineDiagramParameters,
    useGetAvailableComponentLibraries,
} from './single-line-diagram-parameters';

import {
    LoadFlowParameters,
    useGetLfParamsAndProvider,
} from './load-flow-parameters';
import { MapParameters } from './map-parameters';
import { NetworkParameters } from './network-parameters';
import {
    ShortCircuitParameters,
    useGetShortCircuitParameters,
} from './short-circuit-parameters';
import { PARAM_DEVELOPER_MODE } from '../../../utils/config-params';

export const CloseButton = ({ hideParameters, classeStyleName }) => {
    return (
        <Button onClick={hideParameters} className={classeStyleName}>
            <FormattedMessage id="close" />
        </Button>
    );
};

export const SwitchWithLabel = ({ value, label, callback }) => {
    const classes = useStyles();
    return (
        <>
            <Grid item xs={8}>
                <Typography component="span" variant="body1">
                    <Box fontWeight="fontWeightBold" m={1}>
                        <FormattedMessage id={label} />
                    </Box>
                </Typography>
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <Switch
                    checked={value}
                    onChange={callback}
                    value={value}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
            </Grid>
        </>
    );
};
export const useStyles = makeStyles((theme) => ({
    title: {
        padding: theme.spacing(2),
    },
    grid: {
        paddingTop: theme.spacing(2),
        padding: theme.spacing(0),
        flexGrow: 1,
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
    marginTopButton: {
        marginTop: 10,
    },
}));

export const FluxConventions = {
    IIDM: 'iidm',
    TARGET: 'target',
};
export const LabelledButton = ({ callback, label, name }) => {
    return (
        <Button onClick={callback} className={name}>
            <FormattedMessage id={label} />
        </Button>
    );
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

const sldParamsTabIndex = 0;
const mapParamsTabIndex = 1;
const lfParamsTabIndex = 2;
const shortCircuitParamsTabIndex = 3;
const advancedParamsTabIndex = 4;

const Parameters = ({ user, isParametersOpen, hideParameters }) => {
    const classes = useStyles();

    const [tabIndex, setTabIndex] = useState(0);

    const studyUuid = useSelector((state) => state.studyUuid);

    const lfParamsAndLfProvider = useGetLfParamsAndProvider();

    const useShortCircuitParameters = useGetShortCircuitParameters();

    const componentLibraries = useGetAvailableComponentLibraries(user);

    const [showAdvancedLfParams, setShowAdvancedLfParams] = useState(false);

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

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

    //To be removed when ShortCircuit is not in developer mode only.
    useEffect(() => {
        setTabIndex(
            enableDeveloperMode
                ? advancedParamsTabIndex
                : advancedParamsTabIndex - 1
        );
    }, [enableDeveloperMode]);

    return (
        <Dialog
            open={isParametersOpen}
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
                        {enableDeveloperMode && (
                            <Tab
                                disabled={!studyUuid}
                                label={<FormattedMessage id="ShortCircuit" />}
                            />
                        )}
                        <Tab label={<FormattedMessage id="Advanced" />} />
                    </Tabs>

                    <TabPanel value={tabIndex} index={sldParamsTabIndex}>
                        <SingleLineDiagramParameters
                            hideParameters={hideParameters}
                            componentLibraries={componentLibraries}
                        />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={mapParamsTabIndex}>
                        <MapParameters hideParameters={hideParameters} />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={lfParamsTabIndex}>
                        {studyUuid && (
                            <LoadFlowParameters
                                hideParameters={hideParameters}
                                lfParamsAndLfProvider={lfParamsAndLfProvider}
                                showAdvancedLfParams={showAdvancedLfParams}
                                setShowAdvancedLfParams={
                                    setShowAdvancedLfParams
                                }
                            />
                        )}
                    </TabPanel>
                    {
                        //To be removed when ShortCircuit is not in developer mode only.
                        enableDeveloperMode && (
                            <TabPanel
                                value={tabIndex}
                                index={shortCircuitParamsTabIndex}
                            >
                                {studyUuid && (
                                    <ShortCircuitParameters
                                        hideParameters={hideParameters}
                                        useShortCircuitParameters={
                                            useShortCircuitParameters
                                        }
                                    />
                                )}
                            </TabPanel>
                        )
                    }
                    <TabPanel
                        value={tabIndex}
                        //Ternary to be removed when ShortCircuit is not in developer mode only.
                        index={
                            enableDeveloperMode
                                ? advancedParamsTabIndex
                                : advancedParamsTabIndex - 1
                        }
                    >
                        <NetworkParameters hideParameters={hideParameters} />
                    </TabPanel>
                </Container>
            </DialogContent>
        </Dialog>
    );
};

export default Parameters;
