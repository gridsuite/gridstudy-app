import { Grid, IconButton, Select } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { FormattedMessage } from 'react-intl';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { useState } from 'react';
import { FilterPanelDialog } from './filter-panel-dialog';

const useStyles = makeStyles((theme) => ({
    filterData: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(6),
    },
}));

export const FilterPanelOld = () => {
    const classes = useStyles();
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const handleCloseFilterPanel = () => {
        setIsFilterPanelOpen(false);
    };

    return (
        <Grid item className={classes.filterData}>
            <span
                className={clsx({
                    // [classes.disabledLabel]: disabled,
                })}
            >
                <FormattedMessage id="FilterData" />
            </span>
            <IconButton
                // disabled={disabled}
                // className={clsx({
                //     [classes.blink]: selectedColumnsNames.size === 0,
                // })}
                aria-label="dialog"
                onClick={() => setIsFilterPanelOpen(true)}
            >
                <FilterAltIcon />
            </IconButton>
            <FilterPanelDialog
                open={isFilterPanelOpen}
                onClose={handleCloseFilterPanel}
            />
        </Grid>
    );
};
