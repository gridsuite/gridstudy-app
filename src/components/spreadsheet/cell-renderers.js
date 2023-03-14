import { OverflowableText } from '@gridsuite/commons-ui';
import { Checkbox, Tooltip, IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { RunningStatus } from 'components/util/running-status';
import { INVALID_LOADFLOW_OPACITY } from 'utils/colors';
import EditIcon from '@mui/icons-material/Edit';
import { useCallback, useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const useStyles = makeStyles((theme) => ({
    editCell: {
        '& button': {
            margin: 0,
            padding: 0,
            position: 'absolute',
            textAlign: 'center',
            bottom: theme.spacing(0.8),
        },
        '& button:first-child': {
            // Only applies to the first child
            left: theme.spacing(2),
        },
        '& button:nth-child(2)': {
            // Only applies to the second child
            right: theme.spacing(3),
        },
    },
    tableCell: {
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
    },
    valueInvalid: {
        opacity: INVALID_LOADFLOW_OPACITY,
    },
    numericValue: {
        marginLeft: 'inherit',
    },
    referenceEditRow: {
        '& button': {
            color: theme.palette.primary.main,
            cursor: 'initial',
        },
        padding: 0,
    },
    leftFade: {
        position: 'absolute',
        left: 0,
        width: '100%',
        height: '100%',
        background:
            'linear-gradient(to right, ' +
            theme.palette.primary.main +
            ' 0%, ' +
            theme.palette.primary.main +
            ' 2%, rgba(0,0,0,0) 12%)',
        borderBottomLeftRadius: theme.spacing(0.8),
        borderTopLeftRadius: theme.spacing(0.8),
    },
}));

export const BooleanCellRenderer = (rowData, key, style) => {
    const isChecked = rowData.value;
    return (
        <div key={key} style={style}>
            <div>
                {isChecked !== undefined && (
                    <Checkbox
                        color="default"
                        checked={isChecked}
                        disableRipple={true}
                    />
                )}
            </div>
        </div>
    );
};

export const DefaultCellRenderer = (props) => {
    const classes = useStyles();
    return (
        <OverflowableText
            className={clsx({
                [classes.valueInvalid]:
                    props.colDef.canBeInvalidated &&
                    props.loadFlowStatus !== RunningStatus.SUCCEED,
                [classes.numericValue]: props.colDef.numeric,
            })}
            text={props.value}
        />
    );
};

export const formatCell = (props) => {
    let value = props.value;
    let tooltipValue = undefined;
    if (props.colDef.valueGetter) {
        value = props.colDef.valueGetter(props, props.network);
    }
    if (props.colDef.normed) {
        value = props.colDef.normed(props.fluxConvention, value);
    }
    if (
        value !== undefined &&
        props.colDef.numeric &&
        props.colDef.fractionDigits
    ) {
        // only numeric rounded cells have a tooltip (their raw numeric value)
        tooltipValue = value;
        value = parseFloat(value).toFixed(props.colDef.fractionDigits);
    }
    return { value: value, tooltip: tooltipValue };
};

export const NumericCellRenderer = (props) => {
    const classes = useStyles();
    const cellValue = formatCell(props);
    return (
        <div key={props.rowIndex}>
            <div className={classes.tableCell}>
                {cellValue.tooltip !== undefined ? (
                    <Tooltip
                        disableFocusListener
                        disableTouchListener
                        title={cellValue.tooltip}
                    >
                        <div
                            children={cellValue.value}
                            className={clsx({
                                [classes.valueInvalid]:
                                    props.colDef.canBeInvalidated &&
                                    props.loadFlowStatus !==
                                        RunningStatus.SUCCEED,
                                [classes.numericValue]: props.colDef.numeric,
                            })}
                        />
                    </Tooltip>
                ) : (
                    <OverflowableText
                        className={clsx({
                            [classes.valueInvalid]:
                                props.colDef.canBeInvalidated &&
                                props.loadFlowStatus !== RunningStatus.SUCCEED,
                            [classes.numericValue]: props.colDef.numeric,
                        })}
                        text={cellValue.value}
                    />
                )}
            </div>
        </div>
    );
};

export const EditableCellRenderer = (props) => {
    const classes = useStyles();

    const handleStartEditing = useCallback(() => {
        props.setEditingData({
            ...props.data,
            metadata: {
                equipmentType: props.equipmentType,
            },
        });
    }, [props]);

    return (
        <div style={props.style}>
            <div className={classes.editCell}>
                <IconButton size={'small'} onClick={handleStartEditing}>
                    <EditIcon />
                </IconButton>
            </div>
        </div>
    );
};

export const DisabledEditCellRenderer = (props) => {
    const classes = useStyles();
    return (
        <div style={props.style}>
            <div className={classes.editCell}>
                <IconButton size={'small'} disabled>
                    <EditIcon />
                </IconButton>
            </div>
        </div>
    );
};

export const EditedLineCellRenderer = (props) => {
    const classes = useStyles();

    return (
        <div className={clsx(classes.referenceEditRow, classes.leftFade)}>
            <div className={classes.editCell}>
                <IconButton
                    size={'small'}
                    style={{ backgroundColor: 'transparent' }}
                    disableRipple
                >
                    <MoreHorizIcon />
                </IconButton>
            </div>
        </div>
    );
};

export const EditingCellRenderer = (props) => {
    const classes = useStyles();

    props.context.startEditing();

    const validateEdit = useCallback(() => {
        props.api?.stopEditing();
        props.setIsValidatingData(true);
    }, [props]);

    const resetEdit = useCallback(() => {
        props.api?.stopEditing(true);
        props.setEditingData();
    }, [props]);

    return (
        <span style={props.style} className={clsx(classes.leftFade)}>
            <div className={classes.editCell}>
                <>
                    <IconButton
                        size={'small'}
                        onClick={validateEdit}
                        disabled={
                            Object.entries(props.context.editErrors).length !==
                            0
                        }
                    >
                        <CheckIcon />
                    </IconButton>

                    <IconButton size={'small'} onClick={resetEdit}>
                        <ClearIcon />
                    </IconButton>
                </>
            </div>
        </span>
    );
};
