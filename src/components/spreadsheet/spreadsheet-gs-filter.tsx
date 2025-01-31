/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
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

const styles = {
    inputContainer: {
        minWidth: '12em',
    },
};

interface SpreadsheetGsFilterProps {
    equipmentType: SpreadsheetEquipmentType;
}

export const SpreadsheetGsFilter = ({ equipmentType }: SpreadsheetGsFilterProps) => {
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
            dispatch(saveSpreadsheetGsFilters(equipmentType, mutableValues));
        },
        [dispatch, equipmentType]
    );

    useEffect(() => {
        reset(toFormFormat(gsFilterSpreadsheetState[equipmentType] ?? []));
    }, [equipmentType, reset, gsFilterSpreadsheetState]);

    return (
        <CustomFormProvider validationSchema={spreadsheetGsFilterFormSchema} {...formMethods}>
            <div style={styles.inputContainer}>
                <DirectoryItemsInput
                    selectorKey={equipmentType}
                    name={SPREADSHEET_GS_FILTER}
                    titleId="FiltersListsSelection"
                    label="filter"
                    elementType={ElementType.FILTER}
                    equipmentTypes={[equipmentType]}
                    labelRequiredFromContext={false}
                    onChange={handleChange}
                />
            </div>
        </CustomFormProvider>
    );
};
