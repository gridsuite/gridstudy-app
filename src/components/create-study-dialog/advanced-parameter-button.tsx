import { Button, Grid } from '@mui/material';
import { FunctionComponent } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import { makeStyles } from '@mui/styles';
import { FormattedMessage } from 'react-intl';

interface AdvancedParameterButtonProps {
    showOpenIcon: boolean;
    label: string;
    callback: () => void;
    disabled?: boolean;
}

const useStyles = makeStyles((theme) => ({
    advancedParameterButton: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(1),
    },
}));

export const AdvancedParameterButton: FunctionComponent<
    AdvancedParameterButtonProps
> = ({ disabled = false, ...props }) => {
    const classes = useStyles();
    const { showOpenIcon, callback, label } = props;

    return (
        <>
            <Grid item xs={12} className={classes.advancedParameterButton}>
                <Button
                    startIcon={<SettingsIcon />}
                    endIcon={
                        showOpenIcon && <CheckIcon style={{ color: 'green' }} />
                    }
                    onClick={callback}
                    disabled={disabled}
                >
                    <FormattedMessage id={label} />
                </Button>
            </Grid>
        </>
    );
};
