/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { Autocomplete, TextField, Popover } from '@mui/material';
import { useIntl } from 'react-intl';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';
import { SHUNT_COMPENSATOR_TYPES } from 'components/utils/field-constants';
import { log } from 'console';

interface EnumFilterProps {
    enumValues: Record<string, { id: string; label: string }>;
}

export const EmunFilter = forwardRef(
    (
        props: IFilterParams & EnumFilterProps,
        ref: React.ForwardedRef<unknown>
    ) => {
        const intl = useIntl();

        const [selectedValues, setSelectedValues] = useState<
            Array<{ id: string; label: string }>
        >([]);
        const [openPopup, setOpenPopup] = useState<boolean>(true);
        const buttonAddRef = useRef();

        const enumList = SHUNT_COMPENSATOR_TYPES;

        const handleCloseFilter = () => {
            setOpenPopup(false);
        };

        useImperativeHandle(ref, () => {
            return {
                doesFilterPass(params: IDoesFilterPassParams) {
                    const { node } = params;

                    // make sure each word passes separately, ie search for firstname, lastname
                    let passed = false;
                    if (selectedValues.length) {
                        selectedValues.forEach(() => {
                            const value = props.getValue(node); // ag-grid 31 change to 29

                            console.log(value)
                            if (
                                selectedValues
                                    .map((selected) => selected.id)
                                    .includes(value)
                            ) {
                                passed = true;
                            }
                        });
                    }

                    return passed;
                },
                isFilterActive() {
                    return !!selectedValues.length;
                },
                afterGuiAttached() {
                    setOpenPopup(true);
                },
            };
        });

        useEffect(() => {
            props.filterChangedCallback();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [selectedValues]);

        return (
            <Popover
                id={`shunt-filter-popover`}
                open={openPopup}
                onClose={handleCloseFilter}
                // anchorEl={buttonAddRef.current}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'center',
                }}
                // transformOrigin={{
                //     vertical: 'top',
                //     horizontal: 'left',
                // }}
                PaperProps={{
                    sx: { width: '300px' },
                }}
            >
                <Autocomplete
                    multiple
                    disableCloseOnSelect
                    value={selectedValues || []}
                    options={Object.values(enumList)}
                    getOptionLabel={(option) => {
                        return intl.formatMessage({ id: option.label });
                    }}
                    onChange={(_, data) => setSelectedValues(data)}
                    size="small"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder={
                                !selectedValues?.length
                                    ? intl.formatMessage({
                                          id: 'customAgGridFilter.filterOoo',
                                      })
                                    : ''
                            }
                        />
                    )}
                    fullWidth
                />
            </Popover>
        );
    }
);
