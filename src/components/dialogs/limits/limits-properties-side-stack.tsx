/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { LimitsTagChip } from './limits-tag-chip';
import { Autocomplete, AutocompleteRenderInputParams, Box, Stack, TextField, IconButton } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { Delete } from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { LimitsProperty } from '../../../services/network-modification-types';
import { useFieldArray } from 'react-hook-form';
import { usePredefinedProperties } from '@gridsuite/commons-ui';
import AddIcon from '@mui/icons-material/ControlPoint';

export interface LimitsPropertiesSideStackProps {
    name: string;
    disabled?: boolean;
}
export function LimitsPropertiesSideStack({ name, disabled }: Readonly<LimitsPropertiesSideStackProps>) {
    const {
        fields: limitsProperties,
        append,
        remove,
    } = useFieldArray<{ [key: string]: LimitsProperty[] }>({ name: name });

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [hovered, setHovered] = useState<boolean>(false);
    const [propertyName, setPropertyName] = useState<string>('');
    const [propertyValue, setPropertyValue] = useState<string>('');
    const [nameEditorError, setNameEditorError] = useState<string>('');
    const [valueEditorError, setValueEditorError] = useState<string>('');
    const intl = useIntl();

    const [predefinedProperties] = usePredefinedProperties('limitsGroup');
    const predefinedPropertiesNames = useMemo(() => {
        return Object.keys(predefinedProperties ?? {}).sort((a, b) => a.localeCompare(b));
    }, [predefinedProperties]);

    const handleKeyPress = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                setNameEditorError('');
                setValueEditorError('');

                let error = false;
                if (propertyName.trim() === '') {
                    setNameEditorError(intl.formatMessage({ id: 'FieldNotEmpty' }));
                    error = true;
                }
                if (propertyValue.trim() === '') {
                    setValueEditorError(intl.formatMessage({ id: 'FieldNotEmpty' }));
                    error = true;
                }

                if (error) {
                    return;
                }

                if (limitsProperties.some((l) => l.name === propertyName)) {
                    setNameEditorError(intl.formatMessage({ id: 'UniqueName' }));
                    return;
                } else {
                    append({ name: propertyName, value: propertyValue });
                    setPropertyName('');
                    setPropertyValue('');
                }
                setIsEditing(false);
            }
        },
        [append, intl, limitsProperties, propertyName, propertyValue]
    );

    const handleOnChange = useCallback((value: string) => {
        setPropertyName(value);
        setNameEditorError('');
    }, []);

    return (
        <Stack direction="column" spacing={2} paddingBottom={2} flexWrap="wrap">
            <Stack direction="row" sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {limitsProperties?.map((property: LimitsProperty, index: number) => (
                    <LimitsTagChip
                        key={`${property.name}`}
                        limitsProperty={property}
                        onDelete={() => remove(index)}
                        disabled={disabled}
                        showTooltip
                    />
                ))}
                {!isEditing && (
                    <IconButton
                        color="primary"
                        sx={{ verticalAlign: 'center' }}
                        onClick={() => setIsEditing(true)}
                        disabled={disabled}
                    >
                        <AddIcon />
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
                        options={Object.values(predefinedPropertiesNames)}
                        size="small"
                        onChange={(event, value) => handleOnChange(value ?? '')}
                        renderInput={(params: AutocompleteRenderInputParams) => (
                            <TextField
                                label={intl.formatMessage({ id: 'PropertyName' })}
                                variant="outlined"
                                {...params}
                                onChange={(event) => handleOnChange(event.target.value)}
                                fullWidth
                                error={nameEditorError !== ''}
                                helperText={nameEditorError}
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
                        error={valueEditorError !== ''}
                        helperText={valueEditorError}
                    />
                    {hovered && (
                        <IconButton
                            sx={{ verticalAlign: 'center' }}
                            onClick={() => {
                                setIsEditing(false);
                                setNameEditorError('');
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
