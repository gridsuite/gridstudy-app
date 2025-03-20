import { Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';

export interface ChipCellRendererProps {
    isActivated: boolean;
    label: string;
    onClick: () => void;
    isDisabled?: boolean;
}

export const ChipCellRenderer = (props: ChipCellRendererProps) => {
    const { isActivated, label, onClick, isDisabled } = props;

    return (
        <Chip
            label={label}
            deleteIcon={isActivated ? <CheckCircleOutlineIcon /> : <CancelIcon />}
            color="primary"
            size="small"
            variant={isActivated ? 'filled' : 'outlined'}
            onDelete={onClick}
            onClick={onClick}
            disabled={isDisabled}
        />
    );
};
