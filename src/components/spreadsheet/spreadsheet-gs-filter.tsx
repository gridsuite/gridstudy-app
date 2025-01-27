/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, DirectoryItemsInput, ElementType, useStateBoolean } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { SPREADSHEET_GS_FILTER } from '../utils/field-constants';
import { useCallback, useEffect, useState } from 'react';
import { ExpertFilter } from '../../services/study/filter';
import { Badge, Button, Popover } from '@mui/material';
import { spreadsheetStyles } from './utils/style';
import { FormattedMessage } from 'react-intl';
import ArticleIcon from '@mui/icons-material/Article';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';
import { saveSpreadsheetGsFilters } from '../../redux/actions';
import { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import {
    convertToExpertFilter,
    convertToExpertFilterForm,
    initialSpreadsheetGsFilterForm,
    SpreadsheetGsFilterForm,
    spreadsheetGsFilterFormSchema,
} from './utils/spreadsheet-gs-filter-utils';

interface SpreadsheetGsFilterProps {
    equipmentType: SpreadsheetEquipmentType;
    applyGsFilter: (filter: ExpertFilter[]) => void;
}

export const SpreadsheetGsFilter = ({ equipmentType, applyGsFilter }: SpreadsheetGsFilterProps) => {
    const dispatch = useDispatch();
    const gsFilterSpreadsheetState = useSelector((state: AppState) => state.gsFilterSpreadsheetState);

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const filterConfigOpen = useStateBoolean(false);
    const formMethods = useForm<SpreadsheetGsFilterForm>({
        defaultValues: initialSpreadsheetGsFilterForm,
        resolver: yupResolver(spreadsheetGsFilterFormSchema),
    });
    const { reset, watch } = formMethods;
    const spreadsheetGsFilterWatcher = watch()[SPREADSHEET_GS_FILTER];

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        filterConfigOpen.setTrue();
    };

    const handleClose = useCallback(() => {
        setAnchorEl(null);
        filterConfigOpen.setFalse();
        dispatch(saveSpreadsheetGsFilters(equipmentType, convertToExpertFilter(spreadsheetGsFilterWatcher)));
    }, [dispatch, equipmentType, filterConfigOpen, spreadsheetGsFilterWatcher]);

    useEffect(() => {
        let filters: ExpertFilter[] = [];
        if (gsFilterSpreadsheetState[equipmentType]?.length > 0) {
            filters = gsFilterSpreadsheetState[equipmentType];
            reset(convertToExpertFilterForm(filters));
        } else {
            reset(initialSpreadsheetGsFilterForm);
        }
        applyGsFilter(convertToExpertFilter(filters));
    }, [equipmentType, reset, gsFilterSpreadsheetState, applyGsFilter]);

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
                onClose={handleClose}
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
