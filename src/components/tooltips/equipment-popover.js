/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import {
    Paper,
    Popover,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { useIntl } from 'react-intl';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { fetchNetworkElementInfos } from 'utils/rest-api';
import { useSelector } from 'react-redux';
import { RunningStatus } from '../utils/running-status';
import makeStyles from '@mui/styles/makeStyles';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';

const useStyles = makeStyles((theme) => ({
    tableCells: {
        fontSize: 10,
    },
    table: {
        backgroundColor: theme.tooltipTable.background,
    },
}));

const EquipmentPopover = ({
    studyUuid,
    equipmentInfos,
    anchorEl,
    equipmentId,
    equipmentType,
    loadFlowStatus,
}) => {
    const currentNode = useSelector((state) => state.currentTreeNode);
    const [equipmentInfo, setEquipmentInfo] = useState(null);
    const intl = useIntl();
    const classes = useStyles();
    const [localAnchorEl, setLocalAnchorEl] = useState(null);

    useEffect(() => {
        if (equipmentInfos) {
            setEquipmentInfo(equipmentInfos);
        } else if (equipmentId && equipmentId !== '') {
            fetchNetworkElementInfos(
                studyUuid,
                currentNode.id,
                equipmentType,
                EQUIPMENT_INFOS_TYPES.TOOLTIP.type,
                equipmentId,
                true
            ).then((value) => {
                setEquipmentInfo(value);
            });
        } else {
            setEquipmentInfo(null);
        }
    }, [equipmentId, equipmentType, equipmentInfos, currentNode.id, studyUuid]);

    const handlePopoverClose = () => {
        setEquipmentInfo(null);
    };

    //When multiple rerender happens on the svg the anchorEl can be already removed from the dom
    //which will cause the popover to jump all over the place during a few frames so we wait a little to avoid
    //that effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (document.contains(anchorEl)) {
                setLocalAnchorEl(anchorEl);
            } else {
                setLocalAnchorEl(null);
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [anchorEl]);

    const checkValue = (value) => {
        if (value != null && !Number.isNaN(value)) {
            return value;
        } else {
            return '_';
        }
    };

    const generateRows = (currentLimits, side) => {
        return (
            <>
                {currentLimits && (
                    <>
                        {currentLimits.permanentLimit && (
                            <TableRow key={currentLimits.permanentLimit + side}>
                                <TableCell className={classes.tableCells}>
                                    {intl.formatMessage({
                                        id: 'PermanentCurrentLimitText',
                                    })}
                                </TableCell>
                                <TableCell className={classes.tableCells}>
                                    {checkValue(
                                        Math.round(currentLimits.permanentLimit)
                                    )}
                                </TableCell>
                                <TableCell
                                    className={classes.tableCells}
                                    sx={{
                                        opacity:
                                            loadFlowStatus ===
                                            RunningStatus.SUCCEED
                                                ? 1
                                                : 0.2,
                                    }}
                                >
                                    {checkValue(
                                        Math.round(
                                            side === '1'
                                                ? (equipmentInfo.i1 * 100) /
                                                      currentLimits.permanentLimit
                                                : (equipmentInfo.i2 * 100) /
                                                      currentLimits.permanentLimit
                                        )
                                    )}
                                </TableCell>
                                <TableCell className={classes.tableCells}>
                                    {checkValue(
                                        side === '1'
                                            ? equipmentInfo.voltageLevelId1
                                            : equipmentInfo.voltageLevelId2
                                    )}
                                </TableCell>
                            </TableRow>
                        )}

                        {currentLimits.temporaryLimits &&
                            currentLimits.temporaryLimits.map(
                                (temporaryLimit) =>
                                    //This check is needed since some temporary limits are defined with no value so the row makes no sense
                                    temporaryLimit.value && (
                                        <TableRow
                                            key={temporaryLimit.name + side}
                                        >
                                            <TableCell
                                                className={classes.tableCells}
                                            >
                                                {checkValue(
                                                    temporaryLimit.name
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className={classes.tableCells}
                                            >
                                                {checkValue(
                                                    Math.round(
                                                        temporaryLimit.value
                                                    )
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className={classes.tableCells}
                                                sx={{
                                                    opacity:
                                                        loadFlowStatus ===
                                                        RunningStatus.SUCCEED
                                                            ? 1
                                                            : 0.2,
                                                }}
                                            >
                                                {side === '1'
                                                    ? checkValue(
                                                          Math.round(
                                                              (equipmentInfo.i1 *
                                                                  100) /
                                                                  temporaryLimit.value
                                                          )
                                                      )
                                                    : checkValue(
                                                          Math.round(
                                                              (equipmentInfo.i2 *
                                                                  100) /
                                                                  temporaryLimit.value
                                                          )
                                                      )}
                                            </TableCell>
                                            <TableCell
                                                className={classes.tableCells}
                                            >
                                                {checkValue(
                                                    side === '1'
                                                        ? equipmentInfo.voltageLevelId1
                                                        : equipmentInfo.voltageLevelId2
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                            )}
                    </>
                )}
            </>
        );
    };

    return (
        <>
            {localAnchorEl && (
                <Popover
                    anchorEl={localAnchorEl}
                    sx={{
                        pointerEvents: 'none',
                    }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    onClose={handlePopoverClose}
                    open={Boolean(localAnchorEl)}
                    disableRestoreFocus
                >
                    {equipmentInfo === null && (
                        <Box height={2} minWidth={100}>
                            <LinearProgress />
                        </Box>
                    )}

                    {equipmentInfo !== null && (
                        <Grid
                            container
                            rowSpacing={2}
                            direction={'column'}
                            alignItems={'center'}
                            sx={{ marginRight: '10px', marginBottom: '5px' }}
                        >
                            <>
                                <Grid item>
                                    <Typography variant="caption">
                                        {equipmentId}
                                    </Typography>
                                </Grid>

                                <Grid item>
                                    <TableContainer
                                        component={Paper}
                                        className={classes.table}
                                    >
                                        <Table size={'small'}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell
                                                        className={
                                                            classes.tableCells
                                                        }
                                                    >
                                                        {intl.formatMessage({
                                                            id: 'CURRENT',
                                                        })}
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            classes.tableCells
                                                        }
                                                    >
                                                        {checkValue(
                                                            equipmentInfo.voltageLevelId1
                                                        )}
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            classes.tableCells
                                                        }
                                                    >
                                                        {checkValue(
                                                            equipmentInfo.voltageLevelId2
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell
                                                        className={
                                                            classes.tableCells
                                                        }
                                                    >
                                                        {intl.formatMessage({
                                                            id: 'I_(A)',
                                                        })}
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            classes.tableCells
                                                        }
                                                        sx={{
                                                            opacity:
                                                                loadFlowStatus ===
                                                                RunningStatus.SUCCEED
                                                                    ? 1
                                                                    : 0.2,
                                                        }}
                                                    >
                                                        {checkValue(
                                                            Math.round(
                                                                equipmentInfo.i1
                                                            )
                                                        )}
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            classes.tableCells
                                                        }
                                                        sx={{
                                                            opacity:
                                                                loadFlowStatus ===
                                                                RunningStatus.SUCCEED
                                                                    ? 1
                                                                    : 0.2,
                                                        }}
                                                    >
                                                        {checkValue(
                                                            Math.round(
                                                                equipmentInfo.i2
                                                            )
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>

                                <Grid item>
                                    <TableContainer
                                        component={Paper}
                                        className={classes.table}
                                    >
                                        <Table size={'small'}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell
                                                        className={
                                                            classes.tableCells
                                                        }
                                                    >
                                                        {intl.formatMessage({
                                                            id: 'Limit_name',
                                                        })}
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            classes.tableCells
                                                        }
                                                    >
                                                        {intl.formatMessage({
                                                            id: 'LimitLabel',
                                                        })}
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            classes.tableCells
                                                        }
                                                    >
                                                        {intl.formatMessage({
                                                            id: 'Loading',
                                                        })}
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            classes.tableCells
                                                        }
                                                    >
                                                        {intl.formatMessage({
                                                            id: 'Side',
                                                        })}
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {generateRows(
                                                    equipmentInfo.currentLimits1,
                                                    '1'
                                                )}
                                                {generateRows(
                                                    equipmentInfo.currentLimits2,
                                                    '2'
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </>
                        </Grid>
                    )}
                </Popover>
            )}
        </>
    );
};

EquipmentPopover.propTypes = {
    studyUuid: PropTypes.string,
    equipmentInfos: PropTypes.object,
    anchorEl: PropTypes.any,
    equipmentId: PropTypes.string,
    equipmentType: PropTypes.string,
    loadFlowStatus: PropTypes.any,
};

export default EquipmentPopover;
