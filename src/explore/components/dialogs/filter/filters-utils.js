/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { createFilter, saveFilter } from '../../../utils/rest-api';
import { FilterType } from '../../../utils/elementType';
import { frontToBackTweak } from './criteria-based/criteria-based-filter-utils';
import { EQUIPMENT_ID, NAME } from '../../utils/field-constants';
import { Generator, Load } from '../../../utils/equipment-types';
import { DISTRIBUTION_KEY } from './explicit-naming/explicit-naming-filter-form';

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
        equipmentType === Generator.type || equipmentType === Load.type;
    if (isGeneratorOrLoad) {
        cleanedTableValues = tableValues.map((row) => ({
            [EQUIPMENT_ID]: row[EQUIPMENT_ID],
            [DISTRIBUTION_KEY]: row[DISTRIBUTION_KEY],
        }));
    } else {
        cleanedTableValues = tableValues.map((row) => ({
            [EQUIPMENT_ID]: row[EQUIPMENT_ID],
        }));
    }
    if (isFilterCreation) {
        createFilter(
            {
                type: FilterType.EXPLICIT_NAMING.id,
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
                type: FilterType.EXPLICIT_NAMING.id,
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
