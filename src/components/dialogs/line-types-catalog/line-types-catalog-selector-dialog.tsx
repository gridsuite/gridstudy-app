/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useRef, useState } from 'react';
import { CustomFormProvider, Option, useSnackMessage } from '@gridsuite/commons-ui';
import { AgGridReact } from 'ag-grid-react';
import { CATEGORIES_TABS, CurrentLimitsInfo, LineTypeInfo } from './line-catalog.type';
import {
    AERIAL_AREAS,
    AERIAL_TEMPERATURES,
    ID,
    SELECTED_CATEGORIES_TAB,
    UNDERGROUND_AREAS,
    UNDERGROUND_SHAPE_FACTORS,
} from '../../utils/field-constants';
import { useForm } from 'react-hook-form';
import { getLineTypeWithLimits } from '../../../services/network-modification';
import { ModificationDialog } from '../commons/modificationDialog';
import yup from '../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import { DeepNullable } from 'components/utils/ts-utils';
import LineTypesCatalogSelectorForm from './line-types-catalog-selector-form';

const formSchema = yup
    .object()
    .shape({
        [AERIAL_AREAS]: yup
            .object()
            .nullable()
            .when([SELECTED_CATEGORIES_TAB], {
                is: (selectedCategoryTab: number) => selectedCategoryTab === CATEGORIES_TABS.AERIAL.id,
                then: (schema) => schema.required(),
            })
            .shape({
                [ID]: yup.string(),
            }),
        [AERIAL_TEMPERATURES]: yup
            .object()
            .nullable()
            .when([SELECTED_CATEGORIES_TAB], {
                is: (selectedCategoryTab: number) => selectedCategoryTab === CATEGORIES_TABS.AERIAL.id,
                then: (schema) => schema.required(),
            })
            .shape({
                [ID]: yup.string(),
            }),
        [UNDERGROUND_AREAS]: yup
            .object()
            .nullable()
            .when([SELECTED_CATEGORIES_TAB], {
                is: (selectedCategoryTab: number) => selectedCategoryTab === CATEGORIES_TABS.UNDERGROUND.id,
                then: (schema) => schema.required(),
            })
            .shape({
                [ID]: yup.string(),
            }),
        [UNDERGROUND_SHAPE_FACTORS]: yup
            .object()
            .nullable()
            .when([SELECTED_CATEGORIES_TAB], {
                is: (selectedCategoryTab: number) => selectedCategoryTab === CATEGORIES_TABS.UNDERGROUND.id,
                then: (schema) => schema.required(),
            })
            .shape({
                [ID]: yup.string(),
            }),
        [SELECTED_CATEGORIES_TAB]: yup.number().nullable(),
    })
    .required();

const emptyFormData = {
    [AERIAL_AREAS]: null,
    [AERIAL_TEMPERATURES]: null,
    [UNDERGROUND_AREAS]: null,
    [UNDERGROUND_SHAPE_FACTORS]: null,
    [SELECTED_CATEGORIES_TAB]: null,
};

export type LineTypesCatalogSelectorDialogSchemaForm = yup.InferType<typeof formSchema>;

export type LineTypesCatalogSelectorDialogProps = {
    onSelectLine: (selectedLine: LineTypeInfo) => void;
    preselectedRowId: string;
    rowData: LineTypeInfo[];
    onClose: () => void;
};

export default function LineTypesCatalogSelectorDialog({
    onSelectLine,
    preselectedRowId,
    rowData,
    onClose,
    ...dialogProps
}: Readonly<LineTypesCatalogSelectorDialogProps>) {
    const { snackError } = useSnackMessage();
    const gridRef = useRef<AgGridReact>(null);
    const [selectedRow, setSelectedRow] = useState<LineTypeInfo | null>(null);
    const [areasOptions, setAreasOptions] = useState<Option[]>([]);
    const [aerialTemperatures, setAerialTemperatures] = useState<Option[]>([]);
    const [undergroundShapeFactors, setUndergroundShapeFactors] = useState<Option[]>([]);

    const formMethods = useForm<DeepNullable<LineTypesCatalogSelectorDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LineTypesCatalogSelectorDialogSchemaForm>>(formSchema),
    });
    const { setValue, getValues } = formMethods;

    const handleSelectedAerial = useCallback(
        (selectedAerialRow: LineTypeInfo) => {
            const selectedArea = getValues(AERIAL_AREAS);
            const selectedTemperature = getValues(AERIAL_TEMPERATURES);

            if (areasOptions?.length > 0 && aerialTemperatures?.length > 0) {
                const filteredLimits = selectedAerialRow?.limitsForLineType?.filter(
                    (limit) => limit?.area === selectedArea?.id && limit?.temperature === selectedTemperature?.id
                );
                selectedAerialRow.limitsForLineType = filteredLimits ? filteredLimits : [];
            }
        },
        [getValues, areasOptions?.length, aerialTemperatures?.length]
    );

    const handleSelectedUnderground = useCallback(
        (selectedUndergroundRow: LineTypeInfo) => {
            const selectedArea = getValues(UNDERGROUND_AREAS);
            const selectedShapeFactor = getValues(UNDERGROUND_SHAPE_FACTORS);

            const areaId = selectedArea?.id;
            const shapeFactorId = selectedShapeFactor?.id;

            if (areasOptions.length > 0 && areaId && shapeFactorId) {
                const filteredLimits = selectedUndergroundRow?.limitsForLineType?.filter(
                    (limit) => limit?.area === areaId
                );

                if (filteredLimits) {
                    const shapeFactorValue = parseFloat(shapeFactorId);
                    if (!isNaN(shapeFactorValue) && shapeFactorValue !== 0) {
                        filteredLimits.forEach((limit) => {
                            limit.permanentLimit = Math.floor(limit.permanentLimit / shapeFactorValue);
                        });
                        selectedUndergroundRow.limitsForLineType = filteredLimits;
                    }
                } else {
                    selectedUndergroundRow.limitsForLineType = [];
                }
            }
        },
        [getValues, areasOptions]
    );

    const onSubmit = useCallback(() => {
        if (selectedRow?.category === CATEGORIES_TABS.AERIAL.name) {
            handleSelectedAerial(selectedRow);
        } else if (selectedRow?.category === CATEGORIES_TABS.UNDERGROUND.name) {
            handleSelectedUnderground(selectedRow);
        }

        selectedRow && onSelectLine?.(selectedRow);
    }, [selectedRow, handleSelectedAerial, handleSelectedUnderground, onSelectLine]);

    const createOptionsFromAreas = (limitsData?: CurrentLimitsInfo[]) => {
        if (!limitsData?.length) {
            return [];
        }

        const uniqueAreas = [...new Set(limitsData.map((limit) => limit.area))];
        return uniqueAreas
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
            .map((area) => ({ id: area, label: area }));
    };

    const createOptionsFromTemperatures = (limitsData?: CurrentLimitsInfo[]) => {
        if (!limitsData?.length) {
            return [];
        }

        const uniqueTemperatures = [...new Set(limitsData.map((limit) => limit.temperature))];
        return uniqueTemperatures
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
            .map((temp) => ({ id: temp, label: temp }));
    };

    const createOptionsFromUndergroundShapeFactors = (lineInfo: LineTypeInfo): Option[] => {
        return lineInfo.shapeFactors
            .sort()
            .map((shapeFactor) => ({ id: String(shapeFactor), label: String(shapeFactor) }));
    };

    const handleSelectedRowData = useCallback(
        async (selectedData: LineTypeInfo) => {
            try {
                const lineTypeWithLimits = await getLineTypeWithLimits(selectedData.id);
                selectedData.limitsForLineType = lineTypeWithLimits.limitsForLineType;
                selectedData.shapeFactors = lineTypeWithLimits.shapeFactors;
                setSelectedRow(selectedData);
                const newTabIndex =
                    selectedData.category === CATEGORIES_TABS.AERIAL.name
                        ? CATEGORIES_TABS.AERIAL.id
                        : CATEGORIES_TABS.UNDERGROUND.id;

                setValue(SELECTED_CATEGORIES_TAB, newTabIndex);
                if (selectedData.category === CATEGORIES_TABS.AERIAL.name) {
                    setAreasOptions(createOptionsFromAreas(selectedData.limitsForLineType));
                    setAerialTemperatures(createOptionsFromTemperatures(selectedData.limitsForLineType));
                } else if (selectedData.category === CATEGORIES_TABS.UNDERGROUND.name) {
                    setAreasOptions(createOptionsFromAreas(selectedData.limitsForLineType));
                    setUndergroundShapeFactors(createOptionsFromUndergroundShapeFactors(selectedData));
                }
            } catch (error) {
                snackError({
                    messageTxt: (error as Error).message,
                    headerId: 'LineTypesCatalogFetchingError',
                });
            }
        },
        [setValue, snackError]
    );

    const onSelectionChanged = useCallback(() => {
        const selectedRows = gridRef.current?.api?.getSelectedRows();
        if (selectedRows?.length) {
            setValue(AERIAL_AREAS, null);
            setValue(AERIAL_TEMPERATURES, null);
            setValue(UNDERGROUND_AREAS, null);
            setValue(UNDERGROUND_SHAPE_FACTORS, null);
            handleSelectedRowData(selectedRows[0]).then();
        }
    }, [handleSelectedRowData, setValue]);

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="xl"
                onClear={onClose}
                onClose={onClose}
                onSave={onSubmit}
                open={true}
                PaperProps={{
                    sx: { height: '95vh' },
                }}
                titleId="SelectType"
                {...dialogProps}
            >
                <LineTypesCatalogSelectorForm
                    gridRef={gridRef}
                    selectedRow={selectedRow}
                    preselectedRowId={preselectedRowId}
                    rowData={rowData}
                    onSelectionChanged={onSelectionChanged}
                    areasOptions={areasOptions}
                    aerialTemperatures={aerialTemperatures}
                    undergroundShapeFactor={undergroundShapeFactors}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
