/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import { useCallback, useEffect, useMemo } from 'react';
import { Box, debounce } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { CustomFormProvider, DirectoryItemsInput, ElementType } from '@gridsuite/commons-ui';
import { saveSpreadsheetGsFilters } from '../../../../../redux/actions';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import { initialSpreadsheetGsFilterForm, toFormFormat } from './spreadsheet-gs-filter.utils';
import { FILTERS, ID, NAME, SPREADSHEET_GS_FILTER } from '../../../../utils/field-constants';
import { AppState } from '../../../../../redux/reducer';
import { ExpertFilter, SpreadsheetGlobalFilter } from '../../../../../services/study/filter';
import { setGlobalFiltersToSpreadsheetConfig } from 'services/study/study-config';
import type { InferType } from 'yup';
import * as yup from 'yup';
import { useIntl } from 'react-intl';

export type SpreadsheetGsFilterProps = {
    equipmentType: SpreadsheetEquipmentType;
    uuid: UUID;
};

export default function SpreadsheetGsFilter({ equipmentType, uuid }: Readonly<SpreadsheetGsFilterProps>) {
    const intl = useIntl();
    const dispatch = useDispatch();
    const gsFilterSpreadsheetState = useSelector((state: AppState) => state.gsFilterSpreadsheetState[uuid]);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const spreadsheetGsFilterFormSchema = useMemo(
        () =>
            yup.object({
                [SPREADSHEET_GS_FILTER]: yup
                    .array()
                    .of(
                        yup.object({
                            [FILTERS]: yup
                                .array()
                                .of(
                                    yup.object({
                                        [ID]: yup.string().required(),
                                        [NAME]: yup.string().required(),
                                    })
                                )
                                .min(1, intl.formatMessage({ id: 'FilterInputMinError' })),
                        })
                    )
                    .required(),
            }),
        [intl]
    );
    type SpreadsheetGsFilterForm = InferType<typeof spreadsheetGsFilterFormSchema>;

    const formMethods = useForm<SpreadsheetGsFilterForm>({
        defaultValues: initialSpreadsheetGsFilterForm,
        resolver: yupResolver(spreadsheetGsFilterFormSchema),
    });
    const { reset } = formMethods;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSetFilters = useCallback(
        debounce((uuid: UUID, filters: SpreadsheetGlobalFilter[]) => {
            if (!studyUuid) {
                return;
            }
            setGlobalFiltersToSpreadsheetConfig(studyUuid, uuid, filters).catch((error) =>
                console.error('Failed to update global filters:', error)
            );
        }, 300),
        []
    );

    const handleChange = useCallback(
        (values: ExpertFilter[]) => {
            const filters = values.map(({ id, name }) => ({ filterId: id, name }) as SpreadsheetGlobalFilter);
            dispatch(saveSpreadsheetGsFilters(uuid, filters));
            debouncedSetFilters(uuid, filters);
        },
        [dispatch, uuid, debouncedSetFilters]
    );

    useEffect(() => {
        reset(toFormFormat(gsFilterSpreadsheetState ?? []));
    }, [uuid, reset, gsFilterSpreadsheetState]);

    return (
        <CustomFormProvider validationSchema={spreadsheetGsFilterFormSchema} {...formMethods}>
            <Box minWidth="12em" /* TODO add sx props to DirectoryItemsInput in commons-ui to remove this div */>
                <DirectoryItemsInput
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
