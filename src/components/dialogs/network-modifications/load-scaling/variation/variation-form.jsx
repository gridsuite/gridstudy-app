/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DirectoryItemsInput } from '@gridsuite/commons-ui';
import {
    FILTERS,
    REACTIVE_VARIATION_MODE,
    VARIATION_MODE,
    VARIATION_TYPE,
    VARIATION_VALUE,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import React, { useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import { SelectInput } from '@gridsuite/commons-ui';
import {
    ACTIVE_VARIATION_MODES,
    REACTIVE_VARIATION_MODES,
    VARIATION_TYPES,
} from 'components/network/constants';
import { FloatInput } from '@gridsuite/commons-ui';
import { ActivePowerAdornment, gridItem } from '../../../dialogUtils';
import { ElementType } from '@gridsuite/commons-ui';
import { IDENTIFIER_LIST } from './variation-utils';
import { fetchDirectoryContent, fetchRootFolders } from 'services/directory';
import { fetchElementsMetadata } from 'services/explore';
import { fetchPath } from '../../../../../services/directory.js';

const LOADS = [EQUIPMENT_TYPES.LOAD];

const VariationForm = ({ name, index }) => {
    const variationMode = useWatch({
        name: `${name}.${index}.${VARIATION_MODE}`,
    });

    const variationType = useWatch({
        name: VARIATION_TYPE,
    });

    const itemFilter = useCallback(
        (value) => {
            if (
                value?.type === ElementType.FILTER &&
                variationMode === ACTIVE_VARIATION_MODES.VENTILATION.id
            ) {
                return (
                    value?.specificMetadata?.type === IDENTIFIER_LIST &&
                    value?.specificMetadata?.filterEquipmentsAttributes?.every(
                        (filter) => !!filter.distributionKey
                    )
                );
            }

            return true;
        },
        [variationMode]
    );

    const filtersField = (
        <DirectoryItemsInput
            name={`${name}.${index}.${FILTERS}`}
            equipmentTypes={LOADS}
            elementType={ElementType.FILTER}
            label={'filter'}
            titleId={'FiltersListsSelection'}
            itemFilter={itemFilter}
            fetchDirectoryContent={fetchDirectoryContent}
            fetchRootFolders={fetchRootFolders}
            fetchElementsInfos={fetchElementsMetadata}
            fetchDirectoryElementPath={fetchPath}
        />
    );

    const variationModeField = (
        <SelectInput
            name={`${name}.${index}.${VARIATION_MODE}`}
            label={'VariationMode'}
            options={Object.values(ACTIVE_VARIATION_MODES)}
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

    const reactiveVariationModeField = (
        <SelectInput
            name={`${name}.${index}.${REACTIVE_VARIATION_MODE}`}
            label={'ReactiveVariationMode'}
            options={Object.values(REACTIVE_VARIATION_MODES)}
            size={'small'}
            disableClearable
        />
    );

    return (
        <>
            {gridItem(filtersField, 3.25)}
            {gridItem(variationValueField, 1.75)}
            {gridItem(variationModeField, 3)}
            {gridItem(reactiveVariationModeField, 3)}
        </>
    );
};

export default VariationForm;
