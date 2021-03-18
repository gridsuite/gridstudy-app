/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';

import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

import { DARK_THEME, LIGHT_THEME } from '../redux/actions';
import { LineFlowMode } from './network/line-layer';
import { LineFlowColorMode } from './network/line-layer';
import {
    getLoadFlowParameters,
    setLoadFlowParameters,
    updateConfigParameters,
} from '../utils/rest-api';
import { SubstationLayout } from './single-line-diagram';
import {
    PARAMS_CENTER_LABEL_KEY,
    PARAMS_DIAGONAL_LABEL_KEY,
    PARAMS_LINE_FLOW_ALERT_THRESHOLD_KEY,
    PARAMS_LINE_FLOW_COLOR_MODE_KEY,
    PARAMS_LINE_FLOW_MODE_KEY,
    PARAMS_LINE_FULL_PATH_KEY,
    PARAMS_LINE_PARALLEL_PATH_KEY,
    PARAMS_SUBSTATION_LAYOUT_KEY,
    PARAMS_THEME_KEY,
    PARAMS_USE_NAME_KEY,
    PARAMS_DISPLAY_OVERLOAD_TABLE_KEY,
} from '../utils/config-params';

const useStyles = makeStyles((theme) => ({
    title: {
        padding: theme.spacing(2),
    },
    grid: {
        padding: theme.spacing(2),
    },
    controlItem: {
        justifyContent: 'flex-end',
    },
    button: {
        marginBottom: '30px',
    },
}));

const Parameters = ({ showParameters, hideParameters }) => {
    const classes = useStyles();

    const useName = useSelector((state) => state.useName);
    const centerLabel = useSelector((state) => state.centerLabel);
    const diagonalLabel = useSelector((state) => state.diagonalLabel);
    const lineFullPath = useSelector((state) => state.lineFullPath);
    const lineParallelPath = useSelector((state) => state.lineParallelPath);
    const lineFlowMode = useSelector((state) => state.lineFlowMode);
    const lineFlowColorMode = useSelector((state) => state.lineFlowColorMode);
    const studyName = useSelector((state) => state.studyName);
    const userId = useSelector((state) => state.userId);

    const [lfParams, setLfParams] = React.useState(null);

    const lineFlowAlertThreshold = useSelector(
        (state) => state.lineFlowAlertThreshold
    );
    const displayOverloadTable = useSelector(
        (state) => state.displayOverloadTable
    );

    const [
        disabledFlowAlertThreshold,
        setDisabledFlowAlertThreshold,
    ] = React.useState(
        lineFlowColorMode === 'nominalVoltage' && !displayOverloadTable
    );

    const [tabIndex, setTabIndex] = React.useState(0);

    useEffect(() => {
        if (userId) {
            getLoadFlowParameters(studyName, userId).then((params) =>
                setLfParams(params)
            );
        }
    }, [studyName, userId]);

    useEffect(() => {
        setDisabledFlowAlertThreshold(
            lineFlowColorMode === 'nominalVoltage' && !displayOverloadTable
        );
    }, [lineFlowColorMode, displayOverloadTable]);

    const theme = useSelector((state) => state.theme);

    const substationLayout = useSelector((state) => state.substationLayout);

    const alertThresholdMarks = [
        {
            value: 0,
            label: '0',
        },
        {
            value: 100,
            label: '100',
        },
    ];

    const handleChangeTheme = (event) => {
        const theme = event.target.value;
        updateConfigParameters(PARAMS_THEME_KEY, theme);
    };

    const handleLineFlowModeChange = (event) => {
        const lineFlowMode = event.target.value;
        updateConfigParameters(PARAMS_LINE_FLOW_MODE_KEY, lineFlowMode);
    };

    const handleLineFlowColorModeChange = (event) => {
        const lineFlowColorMode = event.target.value;
        updateConfigParameters(
            PARAMS_LINE_FLOW_COLOR_MODE_KEY,
            lineFlowColorMode
        );
    };

    const handleLineFlowAlertThresholdChange = (event, value) => {
        updateConfigParameters(PARAMS_LINE_FLOW_ALERT_THRESHOLD_KEY, value);
    };

    const handleSubstationLayoutChange = (event) => {
        const substationLayout = event.target.value;
        updateConfigParameters(PARAMS_SUBSTATION_LAYOUT_KEY, substationLayout);
    };

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
                {value === index && <Box p={3}>{children}</Box>}
            </Typography>
        );
    }

    function MakeSwitch(prop, label, callback) {
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
                        checked={prop}
                        onChange={callback}
                        value={prop}
                        color="primary"
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                </Grid>
            </>
        );
    }

    function MakeDropDown(prop, label, values, callback) {
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
                    <Select labelId={label} value={prop} onChange={callback}>
                        {Object.keys(values).map((key) => (
                            <MenuItem key={key} value={key}>
                                <FormattedMessage id={values[key]} />
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
            </>
        );
    }

    function MakeButton(callback, label) {
        return (
            <Grid item>
                <Button
                    onClick={callback}
                    variant="contained"
                    color="primary"
                    className={classes.button}
                >
                    <FormattedMessage id={label} />
                </Button>
            </Grid>
        );
    }

    function MakeSlider(
        threshold,
        label,
        disabled,
        onCommitCallback,
        thresholdMarks
    ) {
        const [sliderValue, setSliderValue] = React.useState(threshold);

        const handleValueChanged = (event, newValue) => {
            setSliderValue(newValue);
        };

        return (
            <>
                <Grid item xs={7}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id={label} />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={5} className={classes.controlItem}>
                    <Slider
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                        onChange={handleValueChanged}
                        onChangeCommitted={onCommitCallback}
                        value={sliderValue}
                        disabled={disabled}
                        marks={thresholdMarks}
                    />
                </Grid>
            </>
        );
    }

    function MakeLineSeparator() {
        return (
            <Grid item xs={12}>
                <Divider />
            </Grid>
        );
    }

    function GeneralTab() {
        return (
            <Grid container spacing={2} className={classes.grid}>
                {MakeSwitch(useName, 'useName', () => {
                    updateConfigParameters(PARAMS_USE_NAME_KEY, !useName);
                })}

                <MakeLineSeparator />
                <Grid item xs={8}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id="theme" />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    <RadioGroup row value={theme} onChange={handleChangeTheme}>
                        <FormControlLabel
                            value={DARK_THEME}
                            control={<Radio color="primary" />}
                            label={DARK_THEME}
                        />
                        <FormControlLabel
                            value={LIGHT_THEME}
                            control={<Radio color="primary" />}
                            label={LIGHT_THEME}
                        />
                    </RadioGroup>
                </Grid>
            </Grid>
        );
    }

    function SingleLineDiagramParameters() {
        return (
            <Grid container spacing={2} className={classes.grid}>
                {MakeSwitch(diagonalLabel, 'diagonalLabel', () => {
                    updateConfigParameters(
                        PARAMS_DIAGONAL_LABEL_KEY,
                        !diagonalLabel
                    );
                })}
                <MakeLineSeparator />
                {MakeSwitch(centerLabel, 'centerLabel', () => {
                    updateConfigParameters(
                        PARAMS_CENTER_LABEL_KEY,
                        !centerLabel
                    );
                })}
                <MakeLineSeparator />
                <Grid item xs={8}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id="SubstationLayout" />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    <Select
                        labelId="substation-layout-select-label"
                        value={substationLayout}
                        onChange={handleSubstationLayoutChange}
                    >
                        <MenuItem value={SubstationLayout.HORIZONTAL}>
                            <FormattedMessage id="HorizontalSubstationLayout" />
                        </MenuItem>
                        <MenuItem value={SubstationLayout.VERTICAL}>
                            <FormattedMessage id="VerticalSubstationLayout" />
                        </MenuItem>
                        <MenuItem value={SubstationLayout.SMART}>
                            <FormattedMessage id="SmartSubstationLayout" />
                        </MenuItem>
                        <MenuItem
                            value={SubstationLayout.SMARTHORIZONTALCOMPACTION}
                        >
                            <FormattedMessage id="SmartWithHorizontalCompactionSubstationLayout" />
                        </MenuItem>
                        <MenuItem
                            value={SubstationLayout.SMARTVERTICALCOMPACTION}
                        >
                            <FormattedMessage id="SmartWithVerticalCompactionSubstationLayout" />
                        </MenuItem>
                    </Select>
                </Grid>
            </Grid>
        );
    }

    const MapParameters = () => {
        return (
            <Grid container spacing={2} className={classes.grid}>
                {MakeSwitch(lineFullPath, 'lineFullPath', () => {
                    updateConfigParameters(
                        PARAMS_LINE_FULL_PATH_KEY,
                        !lineFullPath
                    );
                })}
                <MakeLineSeparator />
                {MakeSwitch(lineParallelPath, 'lineParallelPath', () => {
                    updateConfigParameters(
                        PARAMS_LINE_PARALLEL_PATH_KEY,
                        !lineParallelPath
                    );
                })}
                <MakeLineSeparator />
                <Grid item xs={8}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id="LineFlowMode" />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    <Select
                        labelId="line-flow-mode-select-label"
                        value={lineFlowMode}
                        onChange={handleLineFlowModeChange}
                    >
                        <MenuItem value={LineFlowMode.STATIC_ARROWS}>
                            <FormattedMessage id="StaticArrows" />
                        </MenuItem>
                        <MenuItem value={LineFlowMode.ANIMATED_ARROWS}>
                            <FormattedMessage id="AnimatedArrows" />
                        </MenuItem>
                        <MenuItem value={LineFlowMode.FEEDERS}>
                            <FormattedMessage id="Feeders" />
                        </MenuItem>
                    </Select>
                </Grid>
                <MakeLineSeparator />
                <Grid item xs={8}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id="LineFlowColorMode" />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    <Select
                        labelId="line-flow-color-mode-select-label"
                        value={lineFlowColorMode}
                        onChange={handleLineFlowColorModeChange}
                    >
                        <MenuItem value={LineFlowColorMode.NOMINAL_VOLTAGE}>
                            <FormattedMessage id="NominalVoltage" />
                        </MenuItem>
                        <MenuItem value={LineFlowColorMode.OVERLOADS}>
                            <FormattedMessage id="Overloads" />
                        </MenuItem>
                    </Select>
                </Grid>
                <MakeLineSeparator />
                {MakeSlider(
                    Number(lineFlowAlertThreshold),
                    'AlertThresholdLabel',
                    disabledFlowAlertThreshold,
                    handleLineFlowAlertThresholdChange,
                    alertThresholdMarks
                )}
                <MakeLineSeparator />
                {MakeSwitch(
                    displayOverloadTable,
                    'displayOverloadTable',
                    () => {
                        updateConfigParameters(
                            PARAMS_DISPLAY_OVERLOAD_TABLE_KEY,
                            !displayOverloadTable
                        );
                    }
                )}
            </Grid>
        );
    };

    const TYPES = {
        enum: 'Enum',
        bool: 'Bool',
    };

    function makeComponentFor(defParam, key, lfParams, setter) {
        if (defParam.type === TYPES.bool) {
            return MakeSwitch(lfParams[key], defParam.description, (ev) =>
                setter({ ...lfParams, [key]: ev.target.checked })
            );
        } else if (defParam.type === TYPES.enum) {
            return MakeDropDown(
                lfParams[key],
                defParam.description,
                defParam.values,
                (ev) => setter({ ...lfParams, [key]: ev.target.value })
            );
        }
    }

    function makeComponentsFor(defParams, params, setter) {
        return Object.keys(defParams).map((key) => (
            <Grid container key={key}>
                {makeComponentFor(defParams[key], key, params, setter)}
                <MakeLineSeparator />
            </Grid>
        ));
    }

    const resetLfParameters = () => {
        setLoadFlowParameters(studyName, userId, null)
            .then(() => {
                return getLoadFlowParameters(studyName, userId);
            })
            .then((params) => setLfParams(params));
    };

    const commitLFParameter = (newParams) => {
        setLfParams(newParams);
        setLoadFlowParameters(studyName, userId, newParams).then();
    };

    const LoadFlowParameters = () => {
        const defParams = {
            voltageInitMode: {
                type: TYPES.enum,
                description: 'descLfVoltageInitMode',
                values: {
                    UNIFORM_VALUES: 'descLfUniformValues',
                    PREVIOUS_VALUES: 'descLfPreviousValues',
                    DC_VALUES: 'descLfDcValues',
                },
            },
            transformerVoltageControlOn: {
                type: TYPES.bool,
                description: 'descLfTransformerVoltageControlOn',
            },
            noGeneratorReactiveLimits: {
                type: TYPES.bool,
                description: 'descLfNoGeneratorReactiveLimits',
            },
            phaseShifterRegulationOn: {
                type: TYPES.bool,
                description: 'descLfPhaseShifterRegulationOn',
            },
            twtSplitShuntAdmittance: {
                type: TYPES.bool,
                description: 'descLfTwtSplitShuntAdmittance',
            },
            simulShunt: {
                type: TYPES.bool,
                description: 'descLfSimulShunt',
            },
            readSlackBus: {
                type: TYPES.bool,
                description: 'descLfReadSlackBus',
            },
            writeSlackBus: {
                type: TYPES.bool,
                description: 'descLfWriteSlackBus',
            },
        };

        return (
            lfParams && (
                <Grid
                    container
                    spacing={2}
                    className={classes.grid}
                    justify="flex-end"
                >
                    {makeComponentsFor(defParams, lfParams, commitLFParameter)}
                    {MakeButton(() => resetLfParameters(), 'resetToDefault')}
                </Grid>
            )
        );
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
                        indicatorColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        onChange={(event, newValue) => setTabIndex(newValue)}
                        aria-label="parameters"
                    >
                        <Tab label={<FormattedMessage id="General" />} />
                        <Tab
                            label={<FormattedMessage id="SingleLineDiagram" />}
                        />
                        <Tab label={<FormattedMessage id="Map" />} />
                        <Tab
                            disabled={!studyName}
                            label={<FormattedMessage id="LoadFlow" />}
                        />
                    </Tabs>

                    <TabPanel value={tabIndex} index={0}>
                        <GeneralTab />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={1}>
                        <SingleLineDiagramParameters />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={2}>
                        <MapParameters />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={3}>
                        {studyName && <LoadFlowParameters />}
                    </TabPanel>
                    <Grid item xs={12}>
                        <Button
                            onClick={hideParameters}
                            variant="contained"
                            color="primary"
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
