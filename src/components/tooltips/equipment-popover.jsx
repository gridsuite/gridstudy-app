/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Paper, Popover, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useIntl } from 'react-intl';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { RunningStatus } from '../utils/running-status';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { fetchNetworkElementInfos } from '../../services/study/network';
import { convertInputValue, FieldType, mergeSx, useDebounce } from '@gridsuite/commons-ui';

const styles = {
    tableCells: {
        fontSize: 10,
    },
    table: (theme) => ({
        backgroundColor: theme.tooltipTable.background,
    }),
};

const EquipmentPopover = ({ studyUuid, anchorEl, anchorPosition, equipmentId, equipmentType, loadFlowStatus }) => {
    const currentNode = useSelector((state) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state) => state.currentRootNetworkUuid);
    const [equipmentInfo, setEquipmentInfo] = useState(null);
    const intl = useIntl();
    const [localAnchorEl, setLocalAnchorEl] = useState(null);
    const [localAnchorPosition, setLocalAnchorPosition] = useState(null);
    const getNetworkElementInfos = useCallback(
        (equipmentId, equipmentType, currentRootNetworkUuid, currentNodeId, studyUuid) => {
            fetchNetworkElementInfos(
                studyUuid,
                currentNodeId,
                currentRootNetworkUuid,
                equipmentType,
                EQUIPMENT_INFOS_TYPES.TOOLTIP.type,
                equipmentId,
                true
            ).then((value) => {
                setEquipmentInfo(value);
                if (anchorPosition) {
                    setLocalAnchorPosition(anchorPosition);
                    setLocalAnchorEl(null);
                }
                // When multiple rerender happens on the svg, the anchorEl can be already removed from the DOM
                // which will cause the popover to jump all over the place during a few frames, so we wait for the
                // debounced fetch to end to fix that effect.
                if (document.contains(anchorEl)) {
                    setLocalAnchorEl(anchorEl);
                    setLocalAnchorPosition(null);
                } else {
                    setLocalAnchorEl(null);
                }
            });
        },
        [anchorEl, anchorPosition]
    );

    const debouncedNetworkElementInfos = useDebounce(getNetworkElementInfos, 200);

    useEffect(() => {
        if (equipmentId && equipmentId !== '') {
            debouncedNetworkElementInfos(equipmentId, equipmentType, currentRootNetworkUuid, currentNode.id, studyUuid);
        } else {
            setEquipmentInfo(null);
        }
    }, [debouncedNetworkElementInfos, equipmentId, equipmentType, currentNode.id, studyUuid, currentRootNetworkUuid]);

    const handlePopoverClose = () => {
        setEquipmentInfo(null);
    };

    const formatValue = (value, fixed) => {
        if (value != null && !Number.isNaN(value)) {
            if (typeof value === 'number') {
                if (typeof fixed === 'number') {
                    return value.toFixed(fixed);
                } else {
                    return value.toString();
                }
            } else {
                return value;
            }
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
                                <TableCell sx={styles.tableCells}>
                                    {intl.formatMessage({
                                        id: 'PermanentCurrentLimitText',
                                    })}
                                </TableCell>
                                <TableCell sx={styles.tableCells}>
                                    {formatValue(Math.round(currentLimits.permanentLimit))}
                                </TableCell>
                                <TableCell
                                    sx={mergeSx(styles.tableCells, {
                                        opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                                    })}
                                >
                                    {formatValue(
                                        Math.round(
                                            side === '1'
                                                ? (Math.abs(equipmentInfo?.i1) * 100) / currentLimits.permanentLimit
                                                : (Math.abs(equipmentInfo?.i2) * 100) / currentLimits.permanentLimit
                                        )
                                    )}
                                </TableCell>
                                <TableCell sx={styles.tableCells}>
                                    {formatValue(
                                        side === '1' ? equipmentInfo?.voltageLevelId1 : equipmentInfo?.voltageLevelId2
                                    )}
                                </TableCell>
                            </TableRow>
                        )}

                        {currentLimits.temporaryLimits &&
                            currentLimits.temporaryLimits.map(
                                (temporaryLimit) =>
                                    //This check is needed since some temporary limits are defined with no value so the row makes no sense
                                    temporaryLimit.value && (
                                        <TableRow key={temporaryLimit.name + side}>
                                            <TableCell sx={styles.tableCells}>
                                                {formatValue(temporaryLimit.name)}
                                            </TableCell>
                                            <TableCell sx={styles.tableCells}>
                                                {formatValue(Math.round(temporaryLimit.value))}
                                            </TableCell>
                                            <TableCell
                                                sx={mergeSx(styles.tableCells, {
                                                    opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                                                })}
                                            >
                                                {side === '1'
                                                    ? formatValue(
                                                          Math.round(
                                                              (Math.abs(equipmentInfo?.i1) * 100) / temporaryLimit.value
                                                          )
                                                      )
                                                    : formatValue(
                                                          Math.round(
                                                              (Math.abs(equipmentInfo?.i2) * 100) / temporaryLimit.value
                                                          )
                                                      )}
                                            </TableCell>
                                            <TableCell sx={styles.tableCells}>
                                                {formatValue(
                                                    side === '1'
                                                        ? equipmentInfo?.voltageLevelId1
                                                        : equipmentInfo?.voltageLevelId2
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

    const renderTableCell = ({ label, value, isLabel }) => {
        return isLabel ? (
            <TableCell sx={styles.tableCells}>
                {intl.formatMessage({
                    id: label,
                })}
            </TableCell>
        ) : (
            <TableCell sx={styles.tableCells}>{value}</TableCell>
        );
    };

    const renderCommonCharacteristics = (equipmentInfo) => {
        return (
            <>
                {equipmentInfo.r && (
                    <TableRow>
                        <TableCell />
                        {renderTableCell({
                            label: 'seriesResistance',
                            isLabel: true,
                        })}
                        {renderTableCell({
                            value: formatValue(equipmentInfo.r, 2),
                            isLabel: false,
                        })}
                    </TableRow>
                )}
                {equipmentInfo.x && (
                    <TableRow>
                        <TableCell />
                        {renderTableCell({
                            label: 'seriesReactance',
                            isLabel: true,
                        })}
                        {renderTableCell({
                            value: formatValue(equipmentInfo.x, 2),
                            isLabel: false,
                        })}
                    </TableRow>
                )}
            </>
        );
    };

    const renderVoltageLevelCharacteristics = (equipmentInfo, equipmentType) => {
        const renderShuntSusceptanceRow = (voltageLevelId, susceptanceValue, fieldType) => (
            <TableRow>
                {renderTableCell({ value: voltageLevelId, isLabel: false })}
                {renderTableCell({ label: 'shuntSusceptance', isLabel: true })}
                {renderTableCell({
                    value: convertInputValue(fieldType, susceptanceValue)?.toFixed(2),
                    isLabel: false,
                })}
            </TableRow>
        );

        return (
            <>
                {equipmentType === EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER ? (
                    renderShuntSusceptanceRow(equipmentInfo.voltageLevelId2, equipmentInfo?.b, FieldType.B)
                ) : (
                    <>
                        {renderShuntSusceptanceRow(equipmentInfo.voltageLevelId1, equipmentInfo.b1, FieldType.B1)}
                        {renderShuntSusceptanceRow(equipmentInfo.voltageLevelId2, equipmentInfo?.b2, FieldType.B2)}
                    </>
                )}
            </>
        );
    };
    const anchorProps = localAnchorPosition
        ? {
              anchorReference: 'anchorPosition', // Define reference to anchorPosition
              anchorPosition: localAnchorPosition, // Use position directly
          }
        : {
              anchorEl: localAnchorEl, // Use anchorEl when no position is provided
              anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
              },
              transformOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
              },
          };
    return (
        <>
            {(localAnchorPosition || localAnchorEl) && (
                <Popover
                    {...anchorProps}
                    sx={{
                        pointerEvents: 'none',
                    }}
                    onClose={handlePopoverClose}
                    open={Boolean(localAnchorPosition || localAnchorEl)}
                    disableRestoreFocus
                >
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
                                    <Typography variant="caption">{equipmentId}</Typography>
                                </Grid>
                                <Grid item>
                                    <TableContainer component={Paper} sx={styles.table}>
                                        <Table size={'small'}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell />
                                                    {renderTableCell({
                                                        label: 'characteristic',
                                                        isLabel: true,
                                                    })}
                                                    {renderTableCell({
                                                        label: 'values',
                                                        isLabel: true,
                                                    })}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {renderCommonCharacteristics(equipmentInfo)}
                                                {renderVoltageLevelCharacteristics(equipmentInfo, equipmentType)}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                                <Grid item>
                                    <TableContainer component={Paper} sx={styles.table}>
                                        <Table size={'small'}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={styles.tableCells}>
                                                        {intl.formatMessage({
                                                            id: 'CURRENT',
                                                        })}
                                                    </TableCell>
                                                    <TableCell sx={styles.tableCells}>
                                                        {formatValue(equipmentInfo?.voltageLevelId1)}
                                                    </TableCell>
                                                    <TableCell sx={styles.tableCells}>
                                                        {formatValue(equipmentInfo?.voltageLevelId2)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell sx={styles.tableCells}>
                                                        {intl.formatMessage({
                                                            id: 'I_(A)',
                                                        })}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={mergeSx(styles.tableCells, {
                                                            opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                                                        })}
                                                    >
                                                        {formatValue(Math.round(equipmentInfo?.i1))}
                                                    </TableCell>
                                                    <TableCell
                                                        sx={mergeSx(styles.tableCells, {
                                                            opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                                                        })}
                                                    >
                                                        {formatValue(Math.round(equipmentInfo?.i2))}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>

                                <Grid item>
                                    <TableContainer component={Paper} sx={styles.table}>
                                        <Table size={'small'}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={styles.tableCells}>
                                                        {intl.formatMessage({
                                                            id: 'Limit_name',
                                                        })}
                                                    </TableCell>
                                                    <TableCell sx={styles.tableCells}>
                                                        {intl.formatMessage({
                                                            id: 'LimitLabel',
                                                        })}
                                                    </TableCell>
                                                    <TableCell sx={styles.tableCells}>
                                                        {intl.formatMessage({
                                                            id: 'Loading',
                                                        })}
                                                    </TableCell>
                                                    <TableCell sx={styles.tableCells}>
                                                        {intl.formatMessage({
                                                            id: 'Side',
                                                        })}
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {generateRows(equipmentInfo?.currentLimits1, '1')}
                                                {generateRows(equipmentInfo?.currentLimits2, '2')}
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
    anchorEl: PropTypes.any,
    anchorPosition: PropTypes.any,
    equipmentId: PropTypes.string,
    equipmentType: PropTypes.string,
    loadFlowStatus: PropTypes.any,
};

export default EquipmentPopover;
