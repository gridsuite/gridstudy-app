//   /**

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

import {
    getLoadFlowParameters,
    setLoadFlowParameters,
    updateConfigParameter,
    fetchDefaultParametersValues,
} from '../../../utils/rest-api';

import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../../utils/messages';

import { SingleLineDiagramParameters } from './single-line-diagram-parameter';

import { LoadFlow } from './load-flow-parameter';
import { MapParameters } from './map-parameter';
import { NetworkParameters } from './network-parameter';

export const CloseButton = ({ hideParameters, classeStyleName }) => {
    console.info(hideParameters);
    return (
        <Button
            onClick={hideParameters}
            className={classeStyleName}
        >
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
export const LabelledButton = ({ callback, label, name }) => {
    return (
        <Button onClick={callback} className={name}>
            <FormattedMessage id={label} />
        </Button>
    );
};
export function useParameterState(paramName) {
    const classes = useStyles();
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

const Parameters = ({ showParameters, hideParameters }) => {
    const classes = useStyles();

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const [tabIndex, setTabIndex] = useState(0);

    const studyUuid = useSelector((state) => state.studyUuid);

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

    const resetNetworkParameters = () => {
        fetchDefaultParametersValues().then((defaultValues) => {
            const defaultFluxConvention = defaultValues.fluxConvention;
            if (
                Object.values(FluxConventions).includes(defaultFluxConvention)
            ) {
                this.props.NetworkParameters.handleChangeFluxConvention(
                    defaultFluxConvention
                );
            }
        });
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
                        {studyUuid && (
                            <LoadFlow hideParameters={hideParameters} />
                        )}
                    </TabPanel>
                    <TabPanel value={tabIndex} index={3}>
                        <NetworkParameters />
                    </TabPanel>
                    <Grid container className={classes.controlItem}>
                        {tabIndex === 3 && (
                            <LabelledButton
                                callback={resetNetworkParameters}
                                label="resetToDefault"
                                name={classes.button}
                            />
                        )}
                    </Grid>
                </Container>
            </DialogContent>
        </Dialog>
    );
};

export default Parameters;
