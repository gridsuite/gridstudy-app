/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import { useCallback, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { CustomFormProvider, DirectoryItemsInput, ElementType } from '@gridsuite/commons-ui';
import { saveSpreadsheetGsFilters } from '../../redux/actions';
import { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import {
    toFormFormat,
    initialSpreadsheetGsFilterForm,
    SpreadsheetGsFilterForm,
    spreadsheetGsFilterFormSchema,
} from './utils/spreadsheet-gs-filter-utils';
import { SPREADSHEET_GS_FILTER } from '../utils/field-constants';
import { AppState } from '../../redux/reducer';
import { ExpertFilter } from '../../services/study/filter';

export type SpreadsheetGsFilterProps = {
    equipmentType: SpreadsheetEquipmentType;
    uuid: UUID;
    index: number;
    name: string;
};

export default function SpreadsheetGsFilter({ equipmentType, index, name, uuid }: Readonly<SpreadsheetGsFilterProps>) {
    const dispatch = useDispatch();
    const gsFilterSpreadsheetState = useSelector((state: AppState) => state.gsFilterSpreadsheetState);

    const formMethods = useForm<SpreadsheetGsFilterForm>({
        defaultValues: initialSpreadsheetGsFilterForm,
        resolver: yupResolver(spreadsheetGsFilterFormSchema),
    });
    const { reset } = formMethods;

    const handleChange = useCallback(
        (values: ExpertFilter[]) => {
            //Converts readonly values to a mutable one, prevents read-only type error
            const mutableValues = values.map((f) => ({ ...f }));
            dispatch(saveSpreadsheetGsFilters(uuid, mutableValues));
        },
        [dispatch, uuid]
    );

    useEffect(() => {
        reset(toFormFormat(gsFilterSpreadsheetState[uuid] ?? []));
    }, [uuid, reset, gsFilterSpreadsheetState]);

    return (
        <CustomFormProvider validationSchema={spreadsheetGsFilterFormSchema} {...formMethods}>
            <Box minWidth="12em" /* TODO add sx props to DirectoryItemsInput in commons-ui to remove this div */>
                <DirectoryItemsInput
                    key={`filter-spreadsheet-${uuid || index + name + equipmentType}`} // force refresh on equipment type change
                    name={SPREADSHEET_GS_FILTER}
                    titleId="FiltersListsSelection"
                    label="filter"
                    elementType={ElementType.FILTER}
                    equipmentTypes={useMemo(() => [equipmentType], [equipmentType])}
                    labelRequiredFromContext={false}
                    onChange={handleChange}
                />
            </Box>
        </CustomFormProvider>
    );
}
