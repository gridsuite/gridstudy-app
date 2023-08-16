import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Grid } from 'ag-grid-community';
import { FormProvider } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import SubmitButton from '../commons/submitButton';

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    dialogPaper: {
        width: 'auto',
        minWidth: '800px',
        margin: 'auto',
    },
    content: {
        overflow: 'auto',
        justifyContent: 'space-around',
        flexGrow: 1,
    },
}));

const CustomMuiDialog = ({
    name,
    open,
    formSchema,
    formMethods,
    onClose,
    onSave,
    onValidationError,
    titleId,
    disabledSave,
    removeOptional,
    ...dialogProps
}) => {
    const classes = useStyles();
    const { handleSubmit } = formMethods;

    const handleClose = (event) => {
        onClose(event);
    };

    const handleCancel = (event) => {
        onClose(event);
    };

    const handleValidate = (data) => {
        onSave(data);
        onClose(data);
    };

    const handleValidationError = (errors) => {
        onValidationError && onValidationError(errors);
    };
    return (
        <FormProvider
            validationSchema={formSchema}
            {...formMethods}
            removeOptional={removeOptional}
        >
            <Dialog
                classes={{ paper: classes.dialogPaper }}
                open={open}
                onClose={handleClose}
                fullWidth
            >
                <DialogTitle>
                    <Grid item xs={11}>
                        <FormattedMessage id={titleId} />
                    </Grid>
                </DialogTitle>
                <DialogContent>{dialogProps.children}</DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <SubmitButton
                        disabled={disabledSave}
                        onClick={handleSubmit(
                            handleValidate,
                            handleValidationError
                        )}
                    >
                        <FormattedMessage id="validate" />
                    </SubmitButton>
                </DialogActions>
            </Dialog>
        </FormProvider>
    );
};

export default CustomMuiDialog;
