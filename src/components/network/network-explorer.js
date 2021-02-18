/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from 'react-intl';

import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import { darken, lighten, makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';

import Network from './network';
import Divider from '@material-ui/core/Divider';
import {
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache,
    List,
} from 'react-virtualized';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import GpsFixedIcon from '@material-ui/icons/GpsFixed';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { selectItemNetwork } from '../../redux/actions';

const itemSize = 48;

const useStyles = makeStyles((theme) => ({
    textField: {
        margin: theme.spacing(1),
        width: 'calc(100% - 64px)', // to fix an issue with fullWidth of textfield and get << on the same line
    },
    listSubHeaderRoot: {
        backgroundColor: darken(theme.palette.background.default, 0.2),
        textAlign: 'left',
        height: (itemSize * 3) / 4,
        justifyContent: 'space-between',
        '&:hover': {
            backgroundColor: lighten(theme.palette.background.paper, 0.1),
        },
    },
    listItem: {
        backgroundColor: theme.palette.background.default,
        '&:hover': {
            backgroundColor: darken(theme.palette.background.paper, 0.1),
        },
        textIndent: theme.spacing(2),
    },
    substationText: {
        marginLeft: -theme.spacing(1),
    },
    countryText: {
        marginLeft: theme.spacing(1),
    },
    noCRGrid: {
        flexFlow: 'row',
    },
    selectedVoltage: {
        backgroundColor: '#ababab !important',
        textIndent: 16,
        '& p': {
            color: theme.palette.type === 'dark' ? '#000' : '',
        },
    },
    selectedSubstation: {
        height: (itemSize * 3) / 4,
        backgroundColor: '#7c7c7c !important',
        '& p': {
            color: theme.palette.type === 'dark' ? '#000' : '#FFF',
        },
    },
}));

const NetworkExplorer = ({
    network,
    onVoltageLevelDisplayClick,
    onSubstationDisplayClick,
    onSubstationFocus,
    hideExplorer,
    visibleSubstation,
}) => {
    const intl = useIntl();

    const dispatch = useDispatch();

    const selectItem = useSelector((state) => state.selectItemNetwork);

    const useName = useSelector((state) => state.useName);

    const filterMsg = intl.formatMessage({ id: 'filter' }) + '...';

    const classes = useStyles();

    const [currentFilter, setCurrentFilter] = React.useState('');

    const [filteredVoltageLevels, setFilteredVoltageLevels] = React.useState(
        []
    );
    const [substationsLoaded, setSubstationsLoaded] = React.useState(false);

    useEffect(() => {
        if (
            network &&
            network.substations.getOrFetch(() => setSubstationsLoaded(true)) ===
                undefined
        )
            setSubstationsLoaded(false);
    }, [network]);

    const identifiedElementComparator = useCallback(
        (vl1, vl2) => {
            return useName
                ? vl1.name.localeCompare(vl2.name)
                : vl1.id.localeCompare(vl2.id);
        },
        [useName]
    );

    const [cache] = React.useState(
        new CellMeasurerCache({
            fixedWidth: true,
            defaultHeight: itemSize,
            minHeight: itemSize /* mandatory, as the computation when display:none will cause 'Maximum update depth exceeded' */,
        })
    );

    const listeRef = useRef(null);

    const generateFilteredSubstation = useCallback(
        (entry) => {
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
        },
        [identifiedElementComparator, network, useName]
    );

    useEffect(() => {
        if (network && substationsLoaded) {
            generateFilteredSubstation(currentFilter);
        }
    }, [
        network,
        identifiedElementComparator,
        generateFilteredSubstation,
        substationsLoaded,
        currentFilter,
    ]);

    useEffect(() => {
        if (visibleSubstation && listeRef.current) {
            // calculate row index to scroll
            let index = 0;
            for (let i = 0; i < filteredVoltageLevels.length; i++) {
                if (filteredVoltageLevels[i][0].id === visibleSubstation) {
                    break;
                } else {
                    index++;
                }
            }
            listeRef.current.scrollToRow(index);
            // Workaround, remove when https://github.com/bvaughn/react-virtualized/issues/995 is resolved
            setTimeout(() => {
                listeRef.current.scrollToRow(index);
            }, 0);
        }
    }, [visibleSubstation, filteredVoltageLevels, substationsLoaded]);

    function onDisplayClickHandler(vl) {
        if (onVoltageLevelDisplayClick !== null) {
            onVoltageLevelDisplayClick(vl.id);
            dispatch(selectItemNetwork(vl.id));
        }
    }

    function onDisplaySubstationFocusHandler(event, substation) {
        event.stopPropagation();
        if (onSubstationFocus !== null) {
            onSubstationFocus(substation.id);
        }
    }

    const voltagelevelInfo = (vl) => {
        return vl.nominalVoltage + ' kV';
    };

    const substationInfo = (substation) => {
        if (substation.countryName) return ' — ' + substation.countryName;
        return '';
    };

    const voltageLevelRow = (vl) => (
        <ListItem
            button
            key={vl.id}
            className={
                selectItem === vl.id
                    ? classes.selectedVoltage
                    : classes.listItem
            }
            onClick={() => onDisplayClickHandler(vl)}
        >
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
            />
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
                            className={
                                selectItem === substation.id
                                    ? classes.selectedSubstation
                                    : classes.listSubHeaderRoot
                            }
                            onClick={() =>
                                onSubstationDisplayClick &&
                                onSubstationDisplayClick(substation.id)
                            }
                        >
                            <Grid
                                container
                                direction={'row'}
                                className={classes.noCRGrid}
                            >
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
                                        primary={
                                            <Typography
                                                style={{ overflow: 'hidden' }}
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
                                onClick={(e) =>
                                    onDisplaySubstationFocusHandler(
                                        e,
                                        substation
                                    )
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
        const filterText = event.target.value.toLowerCase();
        generateFilteredSubstation(filterText);
        cache.clearAll();
        setCurrentFilter(filterText);
    };

    return (
        <Grid container direction="column" style={{ height: '100%' }}>
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
                <IconButton onClick={hideExplorer}>
                    <ChevronLeftIcon />
                </IconButton>
            </Grid>
            <Divider />
            <Grid item style={{ flex: '1 1 auto' }}>
                <AutoSizer>
                    {({ width, height }) => {
                        return (
                            <List
                                height={height}
                                rowHeight={cache.rowHeight}
                                rowRenderer={subStationRow}
                                rowCount={filteredVoltageLevels.length}
                                width={width}
                                subheader={<li />}
                            />
                        );
                    }}
                </AutoSizer>
            </Grid>
        </Grid>
    );
};

NetworkExplorer.defaultProps = {
    network: null,
    visibleSubstation: null,
};

NetworkExplorer.propTypes = {
    network: PropTypes.instanceOf(Network),
    onVoltageLevelDisplayClick: PropTypes.func,
    onSubstationDisplayClick: PropTypes.func,
    onSubstationFocus: PropTypes.func,
    visibleSubstation: PropTypes.string,
};

export default React.memo(NetworkExplorer);
