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
import { fetchLine } from '../../utils/rest-api';
import { useSelector } from 'react-redux';
import { RunningStatus } from '../utils/running-status';

const LinePopover = ({ studyUuid, anchorEl, lineId, loadFlowStatus }) => {
    const currentNode = useSelector((state) => state.currentTreeNode);
    const [lineInfo, setLineInfo] = useState(null);
    const intl = useIntl();

    useEffect(() => {
        if (lineId !== '') {
            fetchLine(studyUuid, currentNode.id, lineId).then((value) => {
                setLineInfo(value);
            });
        } else {
            setLineInfo(null);
        }
    }, [lineId, currentNode.id, studyUuid]);

    const handlePopoverClose = () => {
        setLineInfo(null);
    };

    const checkValue = (value) => {
        if (value != null) {
            return value;
        } else {
            return '';
        }
    };

    const generateRows = (currentLimits, side) => {
        return (
            <>
                {currentLimits && (
                    <>
                        {currentLimits.permanentLimit && (
                            <TableRow key={currentLimits.permanentLimit + side}>
                                <TableCell>
                                    {intl.formatMessage({
                                        id: 'PermanentCurrentLimitText',
                                    })}
                                </TableCell>
                                <TableCell>
                                    {checkValue(currentLimits.permanentLimit)}
                                </TableCell>
                                <TableCell>
                                    {loadFlowStatus === RunningStatus.SUCCEED &&
                                        checkValue(
                                            Math.round(
                                                side === '1'
                                                    ? (lineInfo.i1 * 100) /
                                                          currentLimits.permanentLimit
                                                    : (lineInfo.i2 * 100) /
                                                          currentLimits.permanentLimit
                                            )
                                        )}
                                </TableCell>
                                <TableCell>
                                    {checkValue(
                                        side === '1'
                                            ? lineInfo.voltageLevelId1
                                            : lineInfo.voltageLevelId2
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
                                            <TableCell>
                                                {checkValue(
                                                    temporaryLimit.name
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {checkValue(
                                                    temporaryLimit.value
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {loadFlowStatus ===
                                                    RunningStatus.SUCCEED &&
                                                    (side === '1'
                                                        ? checkValue(
                                                              Math.round(
                                                                  (lineInfo.i1 *
                                                                      100) /
                                                                      temporaryLimit.value
                                                              )
                                                          )
                                                        : checkValue(
                                                              Math.round(
                                                                  (lineInfo.i2 *
                                                                      100) /
                                                                      temporaryLimit.value
                                                              )
                                                          ))}
                                            </TableCell>
                                            <TableCell>
                                                {checkValue(
                                                    side === '1'
                                                        ? lineInfo.voltageLevelId1
                                                        : lineInfo.voltageLevelId2
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
        <Popover
            anchorEl={anchorEl}
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
            open={Boolean(anchorEl)}
            disableRestoreFocus
        >
            {lineInfo === null && (
                <Box height={2} minWidth={100}>
                    <LinearProgress />
                </Box>
            )}

            {lineInfo !== null && (
                <Grid
                    container
                    rowSpacing={2}
                    direction={'column'}
                    alignItems={'center'}
                >
                    <>
                        <Grid item>
                            <Typography variant="h6">{lineId}</Typography>
                        </Grid>

                        <Grid item>
                            <TableContainer component={Paper}>
                                <Table size={'small'}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                {intl.formatMessage({
                                                    id: 'CURRENT',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {checkValue(
                                                    lineInfo.voltageLevelId1
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {checkValue(
                                                    lineInfo.voltageLevelId2
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                {intl.formatMessage({
                                                    id: 'I_(A)',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {loadFlowStatus ===
                                                RunningStatus.SUCCEED
                                                    ? checkValue(
                                                          Math.round(
                                                              lineInfo.i1
                                                          )
                                                      )
                                                    : null}
                                            </TableCell>
                                            <TableCell>
                                                {loadFlowStatus ===
                                                RunningStatus.SUCCEED
                                                    ? checkValue(
                                                          Math.round(
                                                              lineInfo.i2
                                                          )
                                                      )
                                                    : null}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                        <Grid item>
                            <TableContainer component={Paper}>
                                <Table size={'small'}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                {intl.formatMessage({
                                                    id: 'Limit_name',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {intl.formatMessage({
                                                    id: 'LimitLabel',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {intl.formatMessage({
                                                    id: 'Loading',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {intl.formatMessage({
                                                    id: 'Side',
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {generateRows(
                                            lineInfo.currentLimits1,
                                            '1'
                                        )}
                                        {generateRows(
                                            lineInfo.currentLimits2,
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
    );
};

LinePopover.propTypes = {
    studyUuid: PropTypes.string,
    anchorEl: PropTypes.any,
    lineId: PropTypes.string,
    loadFlowStatus: PropTypes.any,
};

export default LinePopover;
