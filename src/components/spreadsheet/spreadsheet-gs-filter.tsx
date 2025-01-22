/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, DirectoryItemsInput, ElementType, useStateBoolean } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../utils/yup-config';
import { FILTERS, ID, NAME } from '../utils/field-constants';
import { EQUIPMENT_TYPES } from '../utils/equipment-types';
import { useCallback, useEffect, useState } from 'react';
import { ExpertFilter } from '../../services/study/filter';
import { Badge, Button, Popover } from '@mui/material';
import { spreadsheetStyles } from './utils/style';
import { FormattedMessage } from 'react-intl';
import ArticleIcon from '@mui/icons-material/Article';

export const SPREADSHEET_GS_FILTER = 'SpreadsheetGsFilter';

export const spreadsheetGsFilterFormSchema = yup.object().shape({
    [SPREADSHEET_GS_FILTER]: yup.array().of(
        yup
            .object()
            .shape({
                [FILTERS]: yup
                    .array()
                    .of(
                        yup.object().shape({
                            [ID]: yup.string().required(),
                            [NAME]: yup.string().required(),
                        })
                    )
                    .min(1, 'FilterInputMinError'),
            })
            .required()
    ),
});

export type SpreadsheetGsFilterForm = yup.InferType<typeof spreadsheetGsFilterFormSchema>;

export const initialSpreadsheetGsFilterForm: Record<string, ExpertFilter[]> = {
    [SPREADSHEET_GS_FILTER]: [],
};

function isExpertFilter(obj: unknown): obj is ExpertFilter {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    const expertFilter = obj as ExpertFilter;
    if (expertFilter.id !== undefined && typeof expertFilter.id !== 'string') {
        return false;
    }
    return true;
}

export function convertToExpertFilter(input: unknown): ExpertFilter[] {
    if (Array.isArray(input) && input.every(isExpertFilter)) {
        return input;
    }
    throw new Error('Invalid ExpertFilter object');
}

interface SpreadsheetGsFilterProps {
    equipmentType: EQUIPMENT_TYPES;
    applyGsFilter: (filter: ExpertFilter[]) => void;
}

export const SpreadsheetGsFilter = ({ equipmentType, applyGsFilter }: SpreadsheetGsFilterProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const filterConfigOpen = useStateBoolean(false);
    const formMethods = useForm<SpreadsheetGsFilterForm>({
        defaultValues: initialSpreadsheetGsFilterForm,
        resolver: yupResolver(spreadsheetGsFilterFormSchema),
    });

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        filterConfigOpen.setTrue();
    };

    const { reset, watch } = formMethods;

    const spreadsheetGsFilterWatcher = watch()[SPREADSHEET_GS_FILTER];
    const handleApplyFilter = useCallback(() => {
        setAnchorEl(null);
        filterConfigOpen.setFalse();

        let convertedFilters: ExpertFilter[];
        if ((convertedFilters = convertToExpertFilter(spreadsheetGsFilterWatcher))) {
            applyGsFilter(convertedFilters);
        }
    }, [applyGsFilter, filterConfigOpen, spreadsheetGsFilterWatcher]);

    useEffect(() => {
        reset(initialSpreadsheetGsFilterForm);
    }, [equipmentType, reset]);

    return (
        <>
            <Badge
                color="secondary"
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                badgeContent={spreadsheetGsFilterWatcher?.length}
            >
                <Button sx={spreadsheetStyles.spreadsheetButton} size={'small'} onClick={handlePopoverOpen}>
                    <ArticleIcon />
                    <FormattedMessage id="spreadsheet/filter/config" />
                </Button>
            </Badge>

            <Popover
                id={'pop'}
                open={filterConfigOpen.value}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                onClose={handleApplyFilter}
                slotProps={{
                    paper: { sx: { minWidth: '200px' } },
                }}
            >
                <CustomFormProvider validationSchema={spreadsheetGsFilterFormSchema} {...formMethods}>
                    <DirectoryItemsInput
                        name={SPREADSHEET_GS_FILTER}
                        titleId={'FiltersListsSelection'}
                        label="filter"
                        elementType={ElementType.FILTER}
                        equipmentTypes={[equipmentType]}
                        labelRequiredFromContext={false}
                    />
                </CustomFormProvider>
            </Popover>
        </>
    );
};
