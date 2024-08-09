/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Checkbox, Tooltip, IconButton } from '@mui/material';
import { INVALID_LOADFLOW_OPACITY } from 'utils/colors';
import EditIcon from '@mui/icons-material/Edit';
import { useCallback, useMemo } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useSelector } from 'react-redux';
import { isNodeReadOnly } from '../../graph/util/model-functions';
import { Box } from '@mui/system';
import { mergeSx } from '../../utils/functions';
import { isBlankOrEmpty } from 'components/utils/validation-functions';

const styles = {
    editCell: {
        position: 'absolute',
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    referenceEditRow: (theme) => ({
        '& button': {
            color: theme.palette.primary.main,
            cursor: 'initial',
        },
    }),
    tableCell: (theme) => ({
        fontSize: 'small',
        cursor: 'initial',
        display: 'flex',
        '&:before': {
            content: '""',
            position: 'absolute',
            left: theme.spacing(0.5),
            right: theme.spacing(0.5),
            bottom: 0,
        },
    }),
    overflow: {
        whiteSpace: 'pre',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    valueInvalid: {
        opacity: INVALID_LOADFLOW_OPACITY,
    },
    numericValue: {
        marginLeft: 'inherit',
    },
    leftFade: (theme) => ({
        background:
            'linear-gradient(to right, ' +
            theme.palette.primary.main +
            ' 0%, ' +
            theme.palette.primary.main +
            ' 2%, rgba(0,0,0,0) 12%)',
        borderBottomLeftRadius: theme.spacing(0.8),
        borderTopLeftRadius: theme.spacing(0.8),
    }),
};

export const NA_Value = 'N/A';

export const BooleanCellRenderer = (props) => {
    const isChecked = Boolean(props.value);
    return (
        <div>
            {isChecked !== undefined && (
                <Checkbox style={{ padding: 0 }} color="default" checked={isChecked} disableRipple={true} />
            )}
        </div>
    );
};

export const BooleanNullableCellRenderer = (props) => {
    return (
        <div>
            <Checkbox
                style={{ padding: 0 }}
                color="default"
                checked={props.value === true}
                indeterminate={isBlankOrEmpty(props.value)}
                disableRipple={true}
            />
        </div>
    );
};

export const formatCell = (props) => {
    let value = props?.valueFormatted || props.value;
    let tooltipValue = undefined;
    if (props.colDef.valueGetter) {
        value = props?.context?.network
            ? props.colDef.valueGetter(props, props.context.network)
            : props.colDef.valueGetter(props);
    }
    if (props.colDef.normed) {
        value = props.colDef.normed(props.fluxConvention, value);
    }
    if (value != null && props.colDef.numeric && props.colDef.fractionDigits) {
        // only numeric rounded cells have a tooltip (their raw numeric value)
        tooltipValue = value;
        value = parseFloat(value).toFixed(props.colDef.fractionDigits);
    }
    if (props.colDef.numeric && isNaN(value)) {
        value = null;
    }
    return { value: value, tooltip: tooltipValue };
};

export const convertDuration = (duration) => {
    if (!duration || isNaN(duration)) {
        return '';
    }

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    if (seconds === 0) {
        return minutes + ' mn';
    }

    if (minutes === 0) {
        return seconds + ' s';
    }

    return `${minutes}' ${seconds}"`;
};

export const parseDuration = (formattedDuration) => {
    if (!formattedDuration || typeof formattedDuration !== 'string') {
        return NaN;
    }

    const parts = formattedDuration.split(/[ '"]/).filter(Boolean);
    let totalSeconds = 0;

    if (parts.length === 2) {
        // Assume the format is "X' Y"", where X is minutes and Y is seconds
        totalSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else if (parts.length === 1) {
        // Only one part, could be either minutes or seconds
        if (formattedDuration.includes("'")) {
            // It's minutes
            totalSeconds = parseInt(parts[0]) * 60;
        } else if (formattedDuration.includes('"')) {
            // It's seconds
            totalSeconds = parseInt(parts[0]);
        }
    }
    return isNaN(totalSeconds) ? '' : totalSeconds.toString();
};

export const DefaultCellRenderer = (props) => {
    const cellValue = formatCell(props);
    return (
        <Box sx={styles.tableCell}>
            <Tooltip
                disableFocusListener
                disableTouchListener
                title={cellValue.tooltip ? cellValue.tooltip : cellValue.value}
            >
                <Box
                    sx={mergeSx(
                        styles.overflow,
                        props?.colDef?.cellRendererParams?.isValueInvalid ? styles.valueInvalid : undefined
                    )}
                    children={cellValue.value}
                />
            </Tooltip>
        </Box>
    );
};

export const PropertiesCellRenderer = (props) => {
    const cellValue = formatCell(props);
    // different properties are seperated with |
    // tooltip message contains properties in seperated lines
    return (
        <Box sx={styles.tableCell}>
            <Tooltip
                title={
                    <div style={{ whiteSpace: 'pre-line' }}>
                        {cellValue.value && cellValue.value.replaceAll(' | ', '\n')}
                    </div>
                }
            >
                <Box sx={styles.overflow} children={cellValue.value} />
            </Tooltip>
        </Box>
    );
};

export const ContingencyCellRenderer = ({ value }) => {
    const { cellValue, tooltipValue } = value ?? {};

    if (cellValue == null || tooltipValue == null) {
        return null;
    }

    return (
        <Box sx={styles.tableCell}>
            <Tooltip title={<div style={{ whiteSpace: 'pre-line' }}>{tooltipValue}</div>}>
                <Box sx={styles.overflow} children={cellValue} />
            </Tooltip>
        </Box>
    );
};

export const EditableCellRenderer = (props) => {
    const currentNode = useSelector((state) => state.currentTreeNode);
    const isRootNode = useMemo(() => isNodeReadOnly(currentNode), [currentNode]);

    const handleStartEditing = useCallback(() => {
        props.setEditingData({
            ...props.data,
            metadata: {
                equipmentType: props.equipmentType,
            },
        });
    }, [props]);

    return (
        <Box sx={styles.editCell}>
            <IconButton size={'small'} onClick={handleStartEditing} disabled={isRootNode || props.context.isEditing}>
                <EditIcon />
            </IconButton>
        </Box>
    );
};

export const ReferenceLineCellRenderer = (props) => {
    return (
        <Box sx={mergeSx(styles.referenceEditRow, styles.leftFade, styles.editCell)}>
            <IconButton size={'small'} style={{ backgroundColor: 'transparent' }} disableRipple>
                <MoreHorizIcon />
            </IconButton>
        </Box>
    );
};

export const EditingCellRenderer = (props) => {
    const validateEdit = useCallback(() => {
        props.handleSubmitEditing(props);
    }, [props]);

    const resetEdit = useCallback(() => {
        props.rollbackEdit();
    }, [props]);

    const isFormInvalid = useMemo(
        () => Object.entries(props.context.editErrors).length !== 0,
        [props.context.editErrors]
    );

    return (
        <Box sx={mergeSx(styles.leftFade, styles.editCell)}>
            <IconButton size={'small'} onClick={validateEdit} disabled={isFormInvalid}>
                <CheckIcon />
            </IconButton>

            <IconButton size={'small'} onClick={resetEdit}>
                <ClearIcon />
            </IconButton>
        </Box>
    );
};

export const formatNAValue = (value, intl) => {
    return value === NA_Value ? intl.formatMessage({ id: 'Undefined' }) : value;
};
