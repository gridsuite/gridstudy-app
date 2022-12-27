import { IconButton, InputAdornment } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

export const getAdornmentInputProps = ({ position, text }) => {
    const adornmentProp = position + 'Adornment';
    return ({ value, isFocused }) => ({
        InputProps: {
            [adornmentProp]:
                (value !== undefined && value !== '') || isFocused ? (
                    <InputAdornment position={position}>{text}</InputAdornment>
                ) : (
                    <></>
                ),
        },
        sx: { input: { textAlign: position } },
    });
};

export const getClearAdornmentInputProps = ({ position }) => {
    const adornmentProp = position + 'Adornment';
    return ({ value, onChange }) => ({
        InputProps: {
            [adornmentProp]:
                value !== undefined && value !== '' ? (
                    <InputAdornment position="end">
                        <IconButton onClick={() => onChange('')}>
                            <ClearIcon />
                        </IconButton>
                    </InputAdornment>
                ) : (
                    <></>
                ),
        },
    });
};
