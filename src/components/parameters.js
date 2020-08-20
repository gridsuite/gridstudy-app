/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';

import { FormattedMessage } from 'react-intl';

import { useDispatch, useSelector } from 'react-redux';

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

import {
    DARK_THEME,
    LIGHT_THEME,
    selectLineFlowMode,
    selectTheme,
    toggleCenterLabelState,
    toggleDiagonalLabelState,
    toggleLineFullPathState,
    toggleLineParallelPathState,
    toggleUseNameState,
} from '../redux/actions';
import { LineFlowMode } from './network/line-layer';

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
    const dispatch = useDispatch();

    const classes = useStyles();

    const useName = useSelector((state) => state.useName);
    const centerLabel = useSelector((state) => state.centerLabel);
    const diagonalLabel = useSelector((state) => state.diagonalLabel);
    const lineFullPath = useSelector((state) => state.lineFullPath);
    const lineParallelPath = useSelector((state) => state.lineParallelPath);
    const lineFlowMode = useSelector((state) => state.lineFlowMode);
    const [tabIndex, setTabIndex] = React.useState(0);

    const theme = useSelector((state) => state.theme);

    const handleChangeTheme = (event) => {
        const theme = event.target.value;
        dispatch(selectTheme(theme));
    };

    const handleLineFlowModeChange = (event) => {
        const lineFlowMode = event.target.value;
        dispatch(selectLineFlowMode(lineFlowMode));
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
                <Grid item xs={6}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id={label} />:
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={6} className={classes.controlItem}>
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
                {MakeSwitch(useName, 'useName', () =>
                    dispatch(toggleUseNameState())
                )}
                <MakeLineSeparator />
                <Grid item xs={6}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id="theme" />:
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={6} className={classes.controlItem}>
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
                {MakeSwitch(diagonalLabel, 'diagonalLabel', () =>
                    dispatch(toggleDiagonalLabelState())
                )}
                <MakeLineSeparator />
                {MakeSwitch(centerLabel, 'centerLabel', () =>
                    dispatch(toggleCenterLabelState())
                )}
            </Grid>
        );
    }

    const MapParameters = () => {
        return (
            <Grid container spacing={2} className={classes.grid}>
                {MakeSwitch(lineFullPath, 'lineFullPath', () =>
                    dispatch(toggleLineFullPathState())
                )}
                <MakeLineSeparator />
                {MakeSwitch(lineParallelPath, 'lineParallelPath', () =>
                    dispatch(toggleLineParallelPathState())
                )}
                <MakeLineSeparator />
                <Grid item xs={6}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id="LineFlowMode" />:
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={6} className={classes.controlItem}>
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
            </Grid>
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
