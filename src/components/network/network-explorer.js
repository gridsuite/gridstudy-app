/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

import { FormattedMessage, useIntl } from 'react-intl';

import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';

import { FixedSizeList as List } from 'react-window';

import Network from './network';
import Divider from '@material-ui/core/Divider';
import { AutoSizer } from 'react-virtualized';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import GpsFixedIcon from '@material-ui/icons/GpsFixed';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DeviceHubIcon from '@material-ui/icons/DeviceHub';

const itemSize = 48;

const useStyles = makeStyles((theme) => ({
    textField: {
        margin: theme.spacing(1),
        width: 'calc(100% - 16px)', // to fix an issue with fullWidth of textfield
    },
}));

const NetworkExplorer = ({
    network,
    onVoltageLevelDisplayClick,
    onVoltageLevelFocusClick,
}) => {
    const intl = useIntl();

    const useName = useSelector((state) => state.useName);

    const filterMsg = intl.formatMessage({ id: 'filter' }) + '...';

    const classes = useStyles();

    const [filteredVoltageLevels, setFilteredVoltageLevels] = React.useState(
        []
    );
    const [currentVoltageLevel, setCurrentVoltageLevel] = React.useState(null);

    const buttonRef = React.useRef();
    const [voltageLevelMenuIndex, setVoltageLevelMenuIndex] = React.useState(
        -1
    );

    const voltageLevelComparator = (vl1, vl2) => {
        return useName
            ? vl1.name.localeCompare(vl2.name)
            : vl1.id.localeCompare(vl2.id);
    };

    useEffect(() => {
        if (network) {
            setFilteredVoltageLevels(
                network.getVoltageLevels().sort(voltageLevelComparator)
            );
        }
    }, [network]);

    useEffect(() => {
        if (currentVoltageLevel !== null) {
            onVoltageLevelDisplayClick(
                currentVoltageLevel.id,
                currentVoltageLevel.name
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useName]);

    function handleClick(index) {
        setVoltageLevelMenuIndex(index);
    }

    function handleClose() {
        setVoltageLevelMenuIndex(-1);
    }

    function onDisplayClickHandler(index = voltageLevelMenuIndex) {
        if (onVoltageLevelDisplayClick !== null) {
            const vl = filteredVoltageLevels[index];
            onVoltageLevelDisplayClick(vl.id);
            setCurrentVoltageLevel(vl);
        }
        handleClose();
    }

    function onFocusClickHandler() {
        if (onVoltageLevelFocusClick !== null) {
            const vl = filteredVoltageLevels[voltageLevelMenuIndex];
            onVoltageLevelFocusClick(vl.id);
        }
        handleClose();
    }

    const voltagelevelInfo = (index) => {
        if (network.getSubstation(filteredVoltageLevels[index].substationId)) {
            let info = filteredVoltageLevels[index].nominalVoltage + ' kV';
            if (
                network.getSubstation(filteredVoltageLevels[index].substationId)
                    .countryName !== undefined
            ) {
                info +=
                    ' — ' +
                    network.getSubstation(
                        filteredVoltageLevels[index].substationId
                    ).countryName;
            }
            return info;
        }
    };

    const Row = ({ index, style }) => (
        <ListItem button style={style} key={index}>
            <ListItemText
                primary={
                    <Typography color="textPrimary" noWrap>
                        {useName
                            ? filteredVoltageLevels[index].name
                            : filteredVoltageLevels[index].id}
                    </Typography>
                }
                secondary={
                    <Typography
                        style={{ fontSize: 'small' }}
                        color="textSecondary"
                        noWrap
                    >
                        {voltagelevelInfo(index)}
                    </Typography>
                }
                onClick={() => onDisplayClickHandler(index)}
            />
            <IconButton
                aria-owns={
                    voltageLevelMenuIndex === index ? 'simple-menu' : undefined
                }
                aria-haspopup="true"
                ref={voltageLevelMenuIndex === index ? buttonRef : undefined}
                onClick={() => handleClick(index)}
            >
                <MoreVertIcon />
            </IconButton>
        </ListItem>
    );

    const filter = (event) => {
        const entry = event.target.value.toLowerCase();
        setFilteredVoltageLevels(
            network
                .getVoltageLevels()
                .filter((item) => {
                    const lc = useName
                        ? item.name.toLowerCase()
                        : item.id.toLowerCase();
                    return lc.includes(entry);
                })
                .sort(voltageLevelComparator)
        );
    };

    return (
        <AutoSizer>
            {({ width, height }) => (
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
                                height={height - 57}
                                itemCount={filteredVoltageLevels.length}
                                itemSize={itemSize}
                                width="100%"
                            >
                                {Row}
                            </List>
                        </Grid>
                    </Grid>
                    <Menu
                        id="simple-menu"
                        anchorEl={() => buttonRef.current}
                        open={voltageLevelMenuIndex !== -1}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={onFocusClickHandler}>
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
                    </Menu>
                </div>
            )}
        </AutoSizer>
    );
};

NetworkExplorer.defaultProps = {
    network: null,
};

NetworkExplorer.propTypes = {
    network: PropTypes.instanceOf(Network),
    onVoltageLevelDisplayClick: PropTypes.func,
    onVoltageLevelFocusClick: PropTypes.func,
};

export default React.memo(NetworkExplorer);
