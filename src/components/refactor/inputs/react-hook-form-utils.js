import { IconButton, InputAdornment } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

export const getClearAdornment = (handleClearValue) => {
    return (
        <InputAdornment>
            <IconButton onClick={handleClearValue}>
                <ClearIcon />
            </IconButton>
        </InputAdornment>
    );
};
