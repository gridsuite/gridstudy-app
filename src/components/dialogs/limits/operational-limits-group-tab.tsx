import { useCallback, useEffect, useState } from 'react';
import { OperationalLimitsGroupFormInfos } from '../network-modifications/line/modification/line-modification-type';
import { Stack, TextField, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { grey } from '@mui/material/colors';
import { APPLICABILITY } from '../../network/constants';
import { LimitsPropertiesStack } from './limits-properties-stack';
import { LIMITS_PROPERTIES, OPERATIONAL_LIMITS_GROUPS } from '../../utils/field-constants';

export interface OperationalLimitsGroupTabProps {
    editing: boolean;
    opLg: OperationalLimitsGroupFormInfos;
    isAModification: boolean;
    editionError: string;
    parentFormName: string;
    editedLimitGroupName: string;
    index: number;
    finishEditingLimitsGroup: () => void;
    setEditedLimitGroupName: React.Dispatch<React.SetStateAction<string>>;
}

export function OperationalLimitsGroupTab({
    editing,
    opLg,
    isAModification,
    finishEditingLimitsGroup,
    editionError,
    parentFormName,
    editedLimitGroupName,
    setEditedLimitGroupName,
    index,
}: Readonly<OperationalLimitsGroupTabProps>) {
    // control of the focus on the edited tab
    const [editLimitGroupRef, setEditLimitGroupRef] = useState<HTMLInputElement>();
    useEffect(() => {
        if (editing && editLimitGroupRef) {
            editLimitGroupRef.focus();
        }
    }, [editing, editLimitGroupRef]);
    const onRefSet = useCallback((ref: HTMLInputElement) => {
        setEditLimitGroupRef(ref);
    }, []);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
                finishEditingLimitsGroup();
            }
        },
        [finishEditingLimitsGroup]
    );

    return (
        <>
            {editing ? (
                <TextField
                    value={editedLimitGroupName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setEditedLimitGroupName(event.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    inputRef={onRefSet}
                    onBlur={() => finishEditingLimitsGroup()}
                    error={!!editionError}
                    helperText={!!editionError && <FormattedMessage id={editionError} />}
                    size="small"
                    fullWidth
                />
            ) : (
                <Stack direction="row" spacing={1}>
                    <Stack spacing={0}>
                        {opLg.name}
                        {opLg?.applicability ? (
                            <Typography noWrap align="left" color={grey[500]}>
                                <FormattedMessage
                                    id={
                                        Object.values(APPLICABILITY).find((item) => item.id === opLg.applicability)
                                            ?.label
                                    }
                                />
                            </Typography>
                        ) : (
                            ''
                        )}
                    </Stack>
                    {!isAModification && (
                        <LimitsPropertiesStack
                            name={`${parentFormName}.${OPERATIONAL_LIMITS_GROUPS}[${index}].${LIMITS_PROPERTIES}`}
                        />
                    )}
                </Stack>
            )}
        </>
    );
}
