import React, { FunctionComponent } from 'react';
import { Checkbox, ListItemIcon } from '@mui/material';
import { SxProps } from '@mui/material';
import { OverflowableText } from '@gridsuite/commons-ui';

export interface CheckBoxItemProps {
    item: any;
    checkBoxIconSx?: SxProps;
    labelSx?: SxProps;
    checked: boolean;
    label: string;
    onClick: (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        item: any
    ) => void;
    secondaryAction?: React.ReactElement | undefined;
    disabled: boolean | undefined;
}

const CheckBoxItem: FunctionComponent<CheckBoxItemProps> = ({
    item,
    checkBoxIconSx,
    checked,
    labelSx,
    label,
    onClick,
    disabled = false,
    secondaryAction,
    ...props
}) => {
    return (
        <>
            <ListItemIcon sx={checkBoxIconSx}>
                <Checkbox
                    color={'primary'}
                    edge="start"
                    checked={checked}
                    onClick={(event) => onClick(event, item)}
                    disableRipple
                    disabled={disabled}
                    {...props}
                />
            </ListItemIcon>
            <OverflowableText sx={labelSx} text={label} />
            {secondaryAction && secondaryAction}
        </>
    );
};

export default CheckBoxItem;
