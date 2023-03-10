import { useSnackMessage } from '@gridsuite/commons-ui';
import { Checkbox, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { SelectOptionsDialog } from 'utils/dialogs';
import { updateConfigParameter } from 'utils/rest-api';
import {
    DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    MAX_LOCKS_PER_TAB,
    TABLES_COLUMNS_NAMES,
    TABLES_NAMES,
} from './config-tables';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const useStyles = makeStyles((theme) => ({
    checkboxSelectAll: {
        padding: theme.spacing(0, 3, 2, 2),
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    checkboxItem: {
        cursor: 'pointer',
    },
    columnConfigClosedLock: {
        fontSize: '1.2em',
        color: theme.palette.action.active,
    },
    columnConfigOpenLock: {
        fontSize: '1.2em',
        color: theme.palette.action.disabled,
    },
}));

export const ColumnsSettingsDialog = ({
    popupSelectColumnNames,
    tabIndex,
    handleClose,
    reorderedTableDefinitionIndexes,
    selectedColumnsNames,
    setSelectedColumnsNames,
    lockedColumnsNames,
    setLockedColumnsNames,
    ...props
}) => {
    const allDisplayedColumnsNames = useSelector(
        (state) => state.allDisplayedColumnsNames
    );
    const allLockedColumnsNames = useSelector(
        (state) => state.allLockedColumnsNames
    );

    const { snackError } = useSnackMessage();
    const intl = useIntl();
    const classes = useStyles();

    const handleCancelPopupSelectColumnNames = useCallback(() => {
        const allDisplayedTemp = allDisplayedColumnsNames[tabIndex];
        setSelectedColumnsNames(
            new Set(allDisplayedTemp ? JSON.parse(allDisplayedTemp) : [])
        );
        const allLockedTemp = allLockedColumnsNames[tabIndex];
        setLockedColumnsNames(
            new Set(allLockedTemp ? JSON.parse(allLockedTemp) : [])
        );
        handleClose();
    }, [
        allDisplayedColumnsNames,
        tabIndex,
        setSelectedColumnsNames,
        allLockedColumnsNames,
        setLockedColumnsNames,
        handleClose,
    ]);

    const handleSaveSelectedColumnNames = useCallback(() => {
        updateConfigParameter(
            DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE +
                TABLES_NAMES[tabIndex],
            JSON.stringify([...selectedColumnsNames])
        ).catch((error) => {
            const allDisplayedTemp = allDisplayedColumnsNames[tabIndex];
            setSelectedColumnsNames(
                new Set(allDisplayedTemp ? JSON.parse(allDisplayedTemp) : [])
            );
            snackError({
                messageTxt: error.message,
                headerId: 'paramsChangingError',
            });
        });
        let lockedColumnsToSave = [...lockedColumnsNames].filter((name) =>
            selectedColumnsNames.has(name)
        );
        updateConfigParameter(
            LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE +
                TABLES_NAMES[tabIndex],
            JSON.stringify(lockedColumnsToSave)
        ).catch((error) => {
            const allLockedTemp = allLockedColumnsNames[tabIndex];
            setLockedColumnsNames(
                new Set(allLockedTemp ? JSON.parse(allLockedTemp) : [])
            );
            snackError({
                messageTxt: error.message,
                headerId: 'paramsChangingError',
            });
        });
        setLockedColumnsNames(lockedColumnsNames);
        handleClose();
    }, [
        tabIndex,
        selectedColumnsNames,
        lockedColumnsNames,
        setLockedColumnsNames,
        handleClose,
        allDisplayedColumnsNames,
        setSelectedColumnsNames,
        snackError,
        allLockedColumnsNames,
    ]);

    const handleToggle = (value) => () => {
        const newChecked = new Set(selectedColumnsNames.values());
        const newLocked = new Set(lockedColumnsNames.values());
        if (selectedColumnsNames.has(value)) {
            newChecked.delete(value);
            if (lockedColumnsNames.has(value)) {
                newLocked.delete(value);
            }
        } else {
            newChecked.add(value);
        }
        setSelectedColumnsNames(newChecked);
        setLockedColumnsNames(newLocked);
    };

    const handleToggleAll = () => {
        let isAllChecked =
            selectedColumnsNames.size === TABLES_COLUMNS_NAMES[tabIndex].size;
        // If all columns are selected/checked, then we hide all of them.
        setSelectedColumnsNames(
            isAllChecked ? new Set() : TABLES_COLUMNS_NAMES[tabIndex]
        );
        if (isAllChecked) {
            setLockedColumnsNames(new Set());
        }
    };

    const handleClickOnLock = (value) => () => {
        const newLocked = new Set(lockedColumnsNames.values());
        if (lockedColumnsNames.has(value)) {
            newLocked.delete(value);
        } else {
            if (lockedColumnsNames.size < MAX_LOCKS_PER_TAB) {
                newLocked.add(value);
            }
        }
        setLockedColumnsNames(newLocked);
    };

    const renderColumnConfigLockIcon = (value) => {
        if (selectedColumnsNames.has(value)) {
            if (lockedColumnsNames.has(value)) {
                return <LockIcon className={classes.columnConfigClosedLock} />;
            } else {
                if (lockedColumnsNames.size < MAX_LOCKS_PER_TAB) {
                    return (
                        <LockOpenIcon
                            className={classes.columnConfigOpenLock}
                        />
                    );
                }
            }
        }
    };

    const checkListColumnsNames = () => {
        let isAllChecked =
            selectedColumnsNames.size === TABLES_COLUMNS_NAMES[tabIndex].size;
        let isSomeChecked = selectedColumnsNames.size !== 0 && !isAllChecked;

        return (
            <>
                <ListItem
                    className={classes.checkboxSelectAll}
                    onClick={handleToggleAll}
                >
                    <Checkbox
                        style={{ marginLeft: '21px' }}
                        checked={isAllChecked}
                        indeterminate={isSomeChecked}
                    />
                    <FormattedMessage id="CheckAll" />
                </ListItem>

                {[...reorderedTableDefinitionIndexes].map((value, index) => (
                    <ListItem
                        key={index}
                        className={classes.checkboxItem}
                        style={{
                            padding: '0 16px',
                        }}
                    >
                        <ListItemIcon
                            onClick={handleClickOnLock(value)}
                            style={{
                                minWidth: 0,
                                width: '20px',
                            }}
                        >
                            {renderColumnConfigLockIcon(value)}
                        </ListItemIcon>
                        <ListItemIcon onClick={handleToggle(value)}>
                            <Checkbox
                                checked={selectedColumnsNames.has(value)}
                            />
                        </ListItemIcon>
                        <ListItemText
                            onClick={handleToggle(value)}
                            primary={intl.formatMessage({
                                id: `${value}`,
                            })}
                        />
                    </ListItem>
                ))}
            </>
        );
    };

    return (
        <SelectOptionsDialog
            open={popupSelectColumnNames}
            onClose={handleCancelPopupSelectColumnNames}
            onClick={handleSaveSelectedColumnNames}
            title={intl.formatMessage({
                id: 'ColumnsList',
            })}
            child={checkListColumnsNames()}
            //Replacing overflow default value 'auto' by 'visible' in order to prevent a react-beatiful-dnd warning related to nested scroll containers
            style={{
                '& .MuiPaper-root': {
                    overflowY: 'visible',
                },
            }}
        />
    );
};
