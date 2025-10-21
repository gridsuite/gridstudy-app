/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { LimitsTagChip } from './limits-tag-chip';
import { Autocomplete, AutocompleteRenderInputParams, Box, Stack, TextField, IconButton } from '@mui/material';
import { useCallback, useState } from 'react';
import { AddCircle, Delete } from '@mui/icons-material';
import { LimitsPropertyName } from './limits-constants';
import { useIntl } from 'react-intl';
import { LimitsProperty } from '../../../services/network-modification-types';
import { useFormContext, useWatch } from 'react-hook-form';

export interface LimitsPropertiesSideStackProps {
    formName: string;
    disabled?: boolean;
}
export function LimitsPropertiesSideStack({ formName, disabled }: Readonly<LimitsPropertiesSideStackProps>) {
    const { setValue } = useFormContext();
    const limitsProperties: LimitsProperty[] = useWatch({ name: formName });

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [hovered, setHovered] = useState<boolean>(false);
    const [propertyName, setPropertyName] = useState<string>('');
    const [propertyValue, setPropertyValue] = useState<string>('');
    const [editorError, setEditorError] = useState<string>('');
    const intl = useIntl();

    const handleKeyPress = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                if (!propertyName.trim() || !propertyValue.trim()) {
                    return;
                }
                if (!limitsProperties?.length) {
                    setValue(formName, [{ name: propertyName, value: propertyValue }]);
                } else if (limitsProperties.some((l) => l.name === propertyName)) {
                    setEditorError(intl.formatMessage({ id: 'NameUnique' }));
                    return;
                } else {
                    setValue(formName, [...limitsProperties, { name: propertyName, value: propertyValue }]);
                }
                setIsEditing(false);
            }
        },
        [formName, intl, limitsProperties, propertyName, propertyValue, setValue]
    );

    const handleOnChange = useCallback((value: string) => {
        setPropertyName(value);
        setEditorError('');
    }, []);

    const handleDelete = useCallback(
        (index: number) => {
            if (limitsProperties?.length <= index) {
                return;
            }
            setValue(formName, [...limitsProperties.slice(0, index), ...limitsProperties.slice(index + 1)]);
        },
        [formName, limitsProperties, setValue]
    );

    return (
        <Stack direction="column" spacing={2} paddingBottom={2} flexWrap="wrap">
            <Stack direction="row" sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {limitsProperties?.map((property: LimitsProperty, index: number) => (
                    <LimitsTagChip
                        key={`${property.name}`}
                        limitsProperty={property}
                        onDelete={() => handleDelete(index)}
                        disabled={disabled}
                    />
                ))}
                {!isEditing && (
                    <IconButton
                        color="primary"
                        sx={{ verticalAlign: 'center' }}
                        onClick={() => setIsEditing(true)}
                        disabled={disabled}
                    >
                        <AddCircle />
                    </IconButton>
                )}
            </Stack>
            {isEditing && !disabled ? (
                <Box
                    display="flex"
                    gap={2}
                    width="100%"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <Autocomplete
                        options={Object.values(LimitsPropertyName)}
                        size="small"
                        onChange={(event, value) => handleOnChange(value ?? '')}
                        renderInput={(params: AutocompleteRenderInputParams) => (
                            <TextField
                                label={intl.formatMessage({ id: 'PropertyName' })}
                                variant="outlined"
                                {...params}
                                onChange={(event) => handleOnChange(event.target.value)}
                                fullWidth
                                error={!!editorError?.length}
                                helperText={editorError}
                                onKeyDown={handleKeyPress}
                            />
                        )}
                        sx={{ flex: 1 }}
                        freeSolo={true}
                    />
                    <TextField
                        size="small"
                        label={intl.formatMessage({ id: 'PropertyValue' })}
                        sx={{ flex: 1, verticalAlign: 'center' }}
                        onKeyDown={handleKeyPress}
                        onChange={(event) => setPropertyValue(event.target.value)}
                    />
                    {hovered && (
                        <IconButton
                            sx={{ verticalAlign: 'center' }}
                            onClick={() => {
                                setIsEditing(false);
                                setEditorError('');
                            }}
                        >
                            <Delete />
                        </IconButton>
                    )}
                </Box>
            ) : (
                ''
            )}
        </Stack>
    );
}
