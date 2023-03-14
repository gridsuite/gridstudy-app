import { Grid, InputAdornment, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useIntl } from 'react-intl';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';

const useStyles = makeStyles((theme) => ({
    searchSection: {
        paddingRight: theme.spacing(1),
        alignItems: 'center',
    },
    containerInputSearch: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(1),
    },
}));

export const GlobalFilter = forwardRef(({ gridRef, disabled }, ref) => {
    const classes = useStyles();
    const intl = useIntl();

    const inputRef = useRef(null);
    const resetFilter = useCallback(() => {
        if (!inputRef.current.value || inputRef.current.value !== '') {
            inputRef.current.value = '';
            gridRef.current.api.setQuickFilter(null);
        }
    }, [gridRef]);

    useImperativeHandle(
        ref,
        () => {
            return {
                resetFilter: resetFilter,
            };
        },
        [resetFilter]
    );

    const handleChangeFilter = useCallback(
        (event) => {
            gridRef.current.api.setQuickFilter(event.target.value);
        },
        [gridRef]
    );

    return (
        <Grid item className={classes.containerInputSearch}>
            <TextField
                ref={ref}
                disabled={disabled}
                className={classes.textField}
                size="small"
                placeholder={intl.formatMessage({ id: 'filter' }) + '...'}
                onChange={handleChangeFilter}
                inputRef={inputRef}
                fullWidth
                InputProps={{
                    classes: {
                        input: classes.searchSection,
                    },
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon
                                color={disabled ? 'disabled' : 'inherit'}
                            />
                        </InputAdornment>
                    ),
                }}
            />
        </Grid>
    );
});
