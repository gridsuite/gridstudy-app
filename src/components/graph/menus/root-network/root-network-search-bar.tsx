/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import React, { useState } from 'react';

interface SearchBarProps {
    readonly placeholder: string;
    readonly value: string;
    readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readonly onClear: () => void;
    readonly onStartEditing?: () => void;
}

export default function SearchBar({ placeholder, value, onChange, onClear, onStartEditing }: SearchBarProps) {
    const [isEditing, setIsEditing] = useState(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isEditing) {
            setIsEditing(true);
            onStartEditing?.(); // fire once at the beginning
        }
        onChange(e);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };
    return (
        <>
            <TextField
                fullWidth
                variant="outlined"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                size="small"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />
            <IconButton size="small" onClick={onClear}>
                <CloseIcon />
            </IconButton>
        </>
    );
}
