/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import DirectoryItemsInput from '../../../rhf-inputs/directory-items-input';
import {
    FILTERS,
    ID,
    NAME,
    SPECIFIC_METADATA,
    VARIATION_MODE,
    VARIATION_TYPE,
    VARIATION_VALUE,
} from '../../../utils/field-constants';
import { EQUIPMENT_TYPES } from '../../../../util/equipment-types';
import { useCallback, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import SelectInput from '../../../rhf-inputs/select-input';
import { VARIATION_MODES } from '../../../../network/constants';
import FloatInput from '../../../rhf-inputs/float-input';
import {
    ActivePowerAdornment,
    gridItem,
} from '../../../../dialogs/dialogUtils';
import { elementType } from '@gridsuite/commons-ui';
import { fetchElementsMetadata } from '../../../../../utils/rest-api';

const IDENTIFIER_LIST = 'IDENTIFIER_LIST';
const VENTILATION = 'VENTILATION';
const STACKING_UP = 'STACKING_UP';
const GENERATORS = [EQUIPMENT_TYPES.GENERATOR.type];

const VariationForm = ({ name, index }) => {
    const variationMode = useWatch({
        name: `${name}.${index}.${VARIATION_MODE}`,
    });

    const filters = useWatch({
        name: `${name}.${index}.${FILTERS}`,
    });

    const variationType = useWatch({
        name: VARIATION_TYPE,
    });

    const fieldName = `${name}.${index}.${FILTERS}`;
    const { setValue } = useFormContext();

    const updateMetadata = useCallback(
        (filtersWithoutMetadata) => {
            const ids = filtersWithoutMetadata.map((f) => f.id);
            fetchElementsMetadata(ids, [], []).then((results) => {
                const newFilters = filters.map((filter) => {
                    const filterWithMetadata = results.find(
                        (f) => f.elementUuid === filter.id
                    );
                    if (filterWithMetadata) {
                        return {
                            [ID]: filterWithMetadata.elementUuid,
                            [NAME]: filterWithMetadata.elementName,
                            [SPECIFIC_METADATA]:
                                filterWithMetadata.specificMetadata,
                        };
                    }
                    return filter;
                });
                setValue(fieldName, newFilters);
            });
        },
        [fieldName, filters, setValue]
    );

    useEffect(() => {
        // when variation mode is STACKING_UP or VENTILATION, all filters types must be 'explicit naming'
        if (
            (variationMode === STACKING_UP || variationMode === VENTILATION) &&
            filters.length > 0
        ) {
            // collect all filters without metadata
            const filtersWithoutMetadata = filters.filter((filter) => {
                return !filter?.specificMetadata;
            });

            if (filtersWithoutMetadata.length > 0) {
                updateMetadata(filtersWithoutMetadata);
            }
        }
    }, [variationMode, filters, updateMetadata]);

    const itemFilter = useCallback(
        (value) => {
            if (value?.type === elementType.FILTER) {
                if (variationMode === STACKING_UP) {
                    return value?.specificMetadata?.type === IDENTIFIER_LIST;
                }

                if (variationMode === VENTILATION) {
                    return (
                        value?.specificMetadata?.type === IDENTIFIER_LIST &&
                        value?.specificMetadata?.filterEquipmentsAttributes?.every(
                            (fil) => !!fil.distributionKey
                        )
                    );
                }
            }

            return true;
        },
        [variationMode]
    );

    const filtersField = (
        <DirectoryItemsInput
            name={`${name}.${index}.${FILTERS}`}
            equipmentTypes={GENERATORS}
            elementType={elementType.FILTER}
            label={'filter'}
            titleId={'FiltersListsSelection'}
            itemFilter={itemFilter}
        />
    );

    const variationModeField = (
        <SelectInput
            name={`${name}.${index}.${VARIATION_MODE}`}
            label={'VariationMode'}
            options={VARIATION_MODES}
            size={'small'}
            disableClearable
        />
    );

    const variationValueField = (
        <FloatInput
            name={`${name}.${index}.${VARIATION_VALUE}`}
            label={variationType === 'DELTA_P' ? 'DeltaP' : 'TargetPText'}
            adornment={ActivePowerAdornment}
        />
    );

    return (
        <>
            {gridItem(filtersField, 4)}
            {gridItem(variationValueField, 2)}
            {gridItem(variationModeField, 4)}
        </>
    );
};

export default VariationForm;
