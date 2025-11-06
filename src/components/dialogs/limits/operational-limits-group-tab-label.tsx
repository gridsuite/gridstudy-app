import { Box, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { APPLICABILITY } from '../../network/constants';
import { OperationalLimitsGroupFormInfos } from '../network-modifications/line/modification/line-modification-type';
import { LimitsPropertiesStack } from './limits-properties-stack';
import IconButton from '@mui/material/IconButton';
import { grey } from '@mui/material/colors';
import MenuIcon from '@mui/icons-material/Menu';
import { useFormState } from 'react-hook-form';

interface OperationalLimitsGroupTabLabelProps {
    operationalLimitsGroup: OperationalLimitsGroupFormInfos;
    showIconButton: boolean;
    disabled: boolean;
    limitsPropertiesName: string;
    handleOpenMenu: (event: React.MouseEvent<HTMLButtonElement>, index: number) => void;
    index: number;
    isAModification?: boolean;
}

export function OperationalLimitsGroupTabLabel({
    operationalLimitsGroup,
    showIconButton,
    disabled,
    limitsPropertiesName,
    handleOpenMenu,
    index,
    isAModification,
}: Readonly<OperationalLimitsGroupTabLabelProps>) {
    return (
        <Box
            sx={{ display: 'inline-flex', alignItems: 'center', boxSizing: 'inherit', justifyContent: 'space-between' }}
        >
            <Stack direction="row" spacing={1}>
                <Stack spacing={0}>
                    {operationalLimitsGroup.name}
                    {operationalLimitsGroup?.applicability ? (
                        <Typography noWrap align="left" color={grey[500]}>
                            <FormattedMessage
                                id={
                                    Object.values(APPLICABILITY).find(
                                        (item) => item.id === operationalLimitsGroup.applicability
                                    )?.label
                                }
                            />
                        </Typography>
                    ) : (
                        ''
                    )}
                </Stack>
                {!isAModification && (
                    <LimitsPropertiesStack
                        name={
                            limitsPropertiesName /*`${parentFormName}.${OPERATIONAL_LIMITS_GROUPS}[${index}].${LIMITS_PROPERTIES}`*/
                        }
                    />
                )}
            </Stack>

            {showIconButton && (
                <IconButton
                    size="small"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleOpenMenu(e, index)}
                    disabled={disabled}
                >
                    <MenuIcon fontSize="small" />
                </IconButton>
            )}
        </Box>
    );
}
