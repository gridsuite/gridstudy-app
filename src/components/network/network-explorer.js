/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { FormattedMessage, useIntl } from 'react-intl';

import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import { darken, lighten, makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';

import Network from './network';
import Divider from '@material-ui/core/Divider';
import {
    List,
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache,
} from 'react-virtualized';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import GpsFixedIcon from '@material-ui/icons/GpsFixed';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import DashboardIcon from '@material-ui/icons/Dashboard';

const itemSize = 48;

const useStyles = makeStyles((theme) => ({
    textField: {
        margin: theme.spacing(1),
        width: 'calc(100% - 16px)', // to fix an issue with fullWidth of textfield
    },
    listSubHeaderRoot: {
        backgroundColor: darken(theme.palette.background.default, 0.2),
        textAlign: 'left',
        height: itemSize / 2,
        justifyContent: 'space-between',
        '&:hover': {
            backgroundColor: lighten(theme.palette.background.paper, 0.1),
        },
    },
    iconHeader: {
        marginRight: -theme.spacing(1),
    },
    listItem: {
        backgroundColor: theme.palette.background.default,
        '&:hover': {
            backgroundColor: darken(theme.palette.background.paper, 0.1),
        },
        marginLeft: theme.spacing(2),
    },
    substationText: {
        marginLeft: -theme.spacing(1),
    },
    countryText: {
        marginLeft:theme.spacing(1),
    }
}));

const NetworkExplorer = ({
    network,
    onVoltageLevelDisplayClick,
    onSubstationDisplayClick,
    onSubstationFocus,
}) => {
    const intl = useIntl();

    const useName = useSelector((state) => state.useName);

    const filterMsg = intl.formatMessage({ id: 'filter' }) + '...';

    const classes = useStyles();

    const [filteredVoltageLevels, setFilteredVoltageLevels] = React.useState(
        []
    );

    const buttonRef = React.useRef();
    const [voltageLevelMenuIndex, setVoltageLevelMenuIndex] = React.useState(
        undefined
    );

    const identifiedElementComparator = useCallback(
        (vl1, vl2) => {
            return useName
                ? vl1.name.localeCompare(vl2.name)
                : vl1.id.localeCompare(vl2.id);
        },
        [useName]
    );

    const cache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: itemSize,
    });

    function generateFilteredSubstation(entry) {
        const subs = [];
        const match = (item) => {
            const lc = useName
                ? item.name.toLowerCase()
                : item.id.toLowerCase();
            return lc.includes(entry);
        };

        network.getSubstations().forEach((item) => {
            let subVoltagesLevel = entry
                ? item.voltageLevels.filter(match)
                : item.voltageLevels;
            if (
                entry === undefined ||
                entry === '' ||
                subVoltagesLevel.length > 0 ||
                match(item)
            ) {
                subs.push([
                    item,
                    subVoltagesLevel.sort(identifiedElementComparator),
                ]);
            }
        });
        subs.sort((a, b) => identifiedElementComparator(a[0], b[0]));
        setFilteredVoltageLevels(subs);
    }

    useEffect(() => {
        if (network) {
            generateFilteredSubstation();
        }
    }, [network, identifiedElementComparator]);

    function handleVoltageLevelButtonClick(vl) {
        setVoltageLevelMenuIndex(vl);
    }

    function handleClose() {
        setVoltageLevelMenuIndex(undefined);
    }

    function onDisplayClickHandler(vl = voltageLevelMenuIndex) {
        if (onVoltageLevelDisplayClick !== null) {
            onVoltageLevelDisplayClick(vl.id);
        }
        handleClose();
    }

    function onDisplaySubstationClickHandler(vl = voltageLevelMenuIndex) {
        if (onSubstationDisplayClick !== null) {
            onSubstationDisplayClick(vl.substationId);
        }
        handleClose();
    }

    function onDisplaySubstationFocusHandler(substation) {
        if (onSubstationFocus !== null) {
            onSubstationFocus(substation.id);
        }
    }

    function onFocusVoltageLevelClickHandler() {
        if (onSubstationFocus !== null) {
            onSubstationFocus(voltageLevelMenuIndex.substationId);
        }
        handleClose();
    }

    const voltagelevelInfo = (vl) => {
        let info = vl.nominalVoltage + ' kV';
        return info;
    };

    const substationInfo = (substation) => {
        return ' — ' + substation.countryName;
    };

    const voltageLevelRow = (vl) => (
        <ListItem button key={vl.id} className={classes.listItem}>
            <ListItemText
                primary={
                    <Typography color="textPrimary" noWrap>
                        {useName ? vl.name : vl.id}
                    </Typography>
                }
                secondary={
                    <Typography
                        style={{ fontSize: 'small' }}
                        color="textSecondary"
                        noWrap
                    >
                        {voltagelevelInfo(vl)}
                    </Typography>
                }
                onClick={() => onDisplayClickHandler(vl)}
            />
{/*
            <IconButton
                aria-owns={
                    voltageLevelMenuIndex === vl
                        ? 'voltageLevel-menu'
                        : undefined
                }
                aria-haspopup="true"
                ref={voltageLevelMenuIndex === vl ? buttonRef : undefined}
                onClick={() => handleVoltageLevelButtonClick(vl)}
            >
                <MoreVertIcon />
            </IconButton>
*/}
        </ListItem>
    );

    const subStationRow = ({ index, key, parent, style }) => {
        const substation = filteredVoltageLevels[index][0];
        return (
            <CellMeasurer
                cache={cache}
                columnIndex={0}
                key={key}
                parent={parent}
                rowIndex={index}
            >
                {({ measure, registerChild }) => (
                    <div ref={registerChild} style={style}>
                        <ListItem
                            component={'li'}
                            button
                            key={substation.id}
                            className={classes.listSubHeaderRoot}
                            onClick={() =>
                                onSubstationDisplayClick &&
                                onSubstationDisplayClick(substation.id)
                            }
                        >
                            <Grid container>
                                <Grid item>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                color="textPrimary"
                                                className={
                                                    classes.substationText
                                                }
                                                noWrap
                                            >
                                                {useName
                                                    ? substation.name
                                                    : substation.id}
                                            </Typography>
                                        }
                                    />
                                </Grid>
                                <Grid item>
                                    <ListItemText
                                        className={classes.countryText}
                                        primary={ <Typography
                                            //style={{ marginLeft:  }}
                                            color="textSecondary"
                                            noWrap
                                        >
                                            {substationInfo(substation)}
                                        </Typography>
                                        }
                                    />
                                </Grid>
                            </Grid>
                            <IconButton
                                className={classes.iconHeader}
                                size={'small'}
                                onClick={() =>
                                    onDisplaySubstationFocusHandler(substation)
                                }
                            >
                                <GpsFixedIcon />
                            </IconButton>
                        </ListItem>
                        {filteredVoltageLevels[index][1].map((vl) =>
                            voltageLevelRow(vl)
                        )}

                        <Grid onLoad={measure} />
                    </div>
                )}
            </CellMeasurer>
        );
    };

    const filter = (event) => {
        generateFilteredSubstation(event.target.value.toLowerCase());
    };

    return (
        <AutoSizer>
            {({ width, height }) => {
                return (
                    <div style={{ width: width, height: height }}>
                        <Grid container direction="column">
                            <Grid item>
                                <TextField
                                    className={classes.textField}
                                    size="small"
                                    placeholder={filterMsg}
                                    onChange={filter}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Divider />
                            <Grid item>
                                <List
                                    height={height}
                                    rowHeight={cache.rowHeight}
                                    rowRenderer={subStationRow}
                                    rowCount={filteredVoltageLevels.length}
                                    width={width}
                                    subheader={<li />}
                                />
                            </Grid>
                        </Grid>
                        <Menu
                            id="voltageLevel-menu"
                            anchorEl={() => buttonRef.current}
                            open={voltageLevelMenuIndex !== undefined}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={onFocusVoltageLevelClickHandler}>
                                <ListItemIcon>
                                    <GpsFixedIcon />
                                </ListItemIcon>
                                <ListItemText>
                                    <FormattedMessage id="centerOnMap" />
                                </ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => onDisplayClickHandler()}>
                                <ListItemIcon>
                                    <DeviceHubIcon />
                                </ListItemIcon>
                                <ListItemText>
                                    <FormattedMessage id="openVoltageLevel" />
                                </ListItemText>
                            </MenuItem>
                            <MenuItem
                                onClick={() =>
                                    onDisplaySubstationClickHandler()
                                }
                            >
                                <ListItemIcon>
                                    <DashboardIcon />
                                </ListItemIcon>
                                <ListItemText>
                                    <FormattedMessage id="openSubstation" />
                                </ListItemText>
                            </MenuItem>
                        </Menu>
                    </div>
                );
            }}
        </AutoSizer>
    );
};

NetworkExplorer.defaultProps = {
    network: null,
};

NetworkExplorer.propTypes = {
    network: PropTypes.instanceOf(Network),
    onVoltageLevelDisplayClick: PropTypes.func,
    onSubstationDisplayClick: PropTypes.func,
    onSubstationFocus: PropTypes.func,
};

export default React.memo(NetworkExplorer);
