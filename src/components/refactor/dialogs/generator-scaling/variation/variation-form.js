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
import {
    VARIATION_MODES,
    VARIATION_TYPES,
} from '../../../../network/constants';
import FloatInput from '../../../rhf-inputs/float-input';
import {
    ActivePowerAdornment,
    gridItem,
} from '../../../../dialogs/dialogUtils';
import { elementType, useSnackMessage } from '@gridsuite/commons-ui';
import { fetchElementsMetadata } from '../../../../../utils/rest-api';
import { IDENTIFIER_LIST } from './variation-utils';
import { useMemo } from 'react';

const GENERATORS = [EQUIPMENT_TYPES.GENERATOR.type];

const VariationForm = ({ name, index }) => {
    const { snackError } = useSnackMessage();
    const filterFieldName = useMemo(
        () => `${name}.${index}.${FILTERS}`,
        [name, index]
    );

    const variationMode = useWatch({
        name: `${name}.${index}.${VARIATION_MODE}`,
    });

    const filters = useWatch({
        name: filterFieldName,
    });

    const variationType = useWatch({
        name: VARIATION_TYPE,
    });

    const { setValue } = useFormContext();

    const updateMetadata = useCallback(
        (filtersWithoutMetadata) => {
            const ids = filtersWithoutMetadata.map((f) => f.id);
            fetchElementsMetadata(ids, [], [])
                .then((results) => {
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
                    setValue(filterFieldName, newFilters);
                })
                .catch((errorMessage) => {
                    snackError({
                        messageTxt: errorMessage,
                        headerId: 'GeneratorScalingError',
                    });
                });
        },
        [filterFieldName, filters, setValue, snackError]
    );

    useEffect(() => {
        // When editing the modification, filters does not have specific metadata which contain filter type
        // If variation mode is STACKING_UP or VENTILATION, all filters types must be 'explicit naming'
        if (
            (variationMode === VARIATION_MODES.STACKING_UP.id ||
                variationMode === VARIATION_MODES.VENTILATION.id) &&
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
                if (variationMode === VARIATION_MODES.STACKING_UP.id) {
                    return value?.specificMetadata?.type === IDENTIFIER_LIST;
                }

                if (variationMode === VARIATION_MODES.VENTILATION.id) {
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
            options={Object.values(VARIATION_MODES)}
            size={'small'}
            disableClearable
        />
    );

    const variationValueField = (
        <FloatInput
            name={`${name}.${index}.${VARIATION_VALUE}`}
            label={VARIATION_TYPES[variationType].label}
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
