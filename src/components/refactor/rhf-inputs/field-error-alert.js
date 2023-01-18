import { Alert, Grid } from '@mui/material';
import { useController } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

// component to display alert when a specific rhf field is in error
// this component needs to be isolated to avoid too many rerenders
const FieldErrorAlert = ({ name }) => {
    const {
        fieldState: { error },
    } = useController({
        name,
    });
    return (
        error && (
            <Grid item xs={12}>
                <Alert severity="error">
                    <FormattedMessage id={error.message} />
                </Alert>
            </Grid>
        )
    );
};

export default FieldErrorAlert;
