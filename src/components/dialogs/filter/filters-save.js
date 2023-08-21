/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_IDD, NAME } from 'components/utils/field-constants';
import { DISTRIBUTION_KEY } from './creation/explicit-naming/explicit-naming-filter-form';
import { createFilter, saveFilter } from 'services/explore';
import { FILTER_TYPES } from 'components/network/constants';
import { frontToBackTweak } from './creation/criteria-based/criteria-based-filter-dialog-utils';

export const saveExplicitNamingFilter = (
    tableValues,
    isFilterCreation,
    equipmentType,
    name,
    id,
    setCreateFilterErr,
    activeDirectory,
    handleClose
) => {
    // we remove unnecessary fields from the table
    let cleanedTableValues;
    const isGeneratorOrLoad =
        equipmentType === 'GENERATOR' || equipmentType === 'LOAD';
    if (isGeneratorOrLoad) {
        cleanedTableValues = tableValues.map((row) => ({
            [EQUIPMENT_IDD]: row[EQUIPMENT_IDD],
            [DISTRIBUTION_KEY]: row[DISTRIBUTION_KEY],
        }));
    } else {
        cleanedTableValues = tableValues.map((row) => ({
            [EQUIPMENT_IDD]: row[EQUIPMENT_IDD],
        }));
    }
    if (isFilterCreation) {
        createFilter(
            {
                type: FILTER_TYPES.EXPLICIT_NAMING.id,
                equipmentType: equipmentType,
                filterEquipmentsAttributes: cleanedTableValues,
            },
            name,
            activeDirectory
        )
            .then(() => {
                handleClose();
            })
            .catch((error) => {
                setCreateFilterErr(error.message);
            });
    } else {
        saveFilter(
            {
                id: id,
                type: FILTER_TYPES.EXPLICIT_NAMING.id,
                equipmentType: equipmentType,
                filterEquipmentsAttributes: cleanedTableValues,
            },
            name
        )
            .then(() => {
                handleClose();
            })
            .catch((error) => {
                setCreateFilterErr(error.message);
            });
    }
};

export const saveCriteriaBasedFilter = (
    filter,
    activeDirectory,
    onClose,
    onError
) => {
    const filterForBack = frontToBackTweak(undefined, filter); // no need ID for creation
    createFilter(filterForBack, filter[NAME], activeDirectory)
        .then(() => {
            onClose();
        })
        .catch((error) => {
            onError(error.message);
        });
};
