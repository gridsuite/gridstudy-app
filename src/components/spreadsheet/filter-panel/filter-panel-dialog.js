import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';

export const FilterPanelDialog = (props) => {
    const { open, onClose } = props;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>title</DialogTitle>
            <DialogContent style={{ padding: '8px 32px 8px 15px' }}>
                child
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    <FormattedMessage id="cancel" />
                </Button>
                <Button variant="outlined">
                    <FormattedMessage id="validate" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};
