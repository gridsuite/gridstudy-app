/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { useDirectoryElements } from '../../utils/inputs/input-hooks';
import { elementType } from '@gridsuite/commons-ui';
import { gridItem } from '../dialogUtils';
import {
    EQUIPMENTS_IN_VOLTAGE_REGULATION_TYPES,
    MONITORED_VOLTAGE_LEVELS_EQUIPMENT_TYPES,
    SensiChecked,
    styles,
} from './sensi-parameters-selector';

export const SensiNodes = ({ index, onChange, defaultValue }) => {
    const [checked, setChecked] = useState(defaultValue.checked ?? true);

    const onClickChecked = () => {
        setChecked(!checked);
    };

    const [monitoredVoltageLevels, monitoredVoltageLevelsField] =
        useDirectoryElements({
            label: 'SupervisedVoltageLevels',
            initialValues: defaultValue.monitoredVoltageLevels
                ? defaultValue.monitoredVoltageLevels
                : [],
            elementType: elementType.FILTER,
            equipmentTypes: MONITORED_VOLTAGE_LEVELS_EQUIPMENT_TYPES,
            titleId: 'FiltersListsSelection',
            elementStyle: styles.chipElement,
        });

    const [equipmentsInVoltageRegulation, equipmentsInVoltageRegulationField] =
        useDirectoryElements({
            label: 'EquipmentsInVoltageRegulation',
            initialValues: defaultValue.equipmentsInVoltageRegulation
                ? defaultValue.equipmentsInVoltageRegulation
                : [],
            elementType: elementType.FILTER,
            equipmentTypes: EQUIPMENTS_IN_VOLTAGE_REGULATION_TYPES,
            titleId: 'FiltersListsSelection',
            elementStyle: styles.chipElement,
        });

    const [contingencies, contingenciesField] = useDirectoryElements({
        label: 'ContingencyLists',
        initialValues: defaultValue.contingencies
            ? defaultValue.contingencies
            : [],
        elementType: elementType.CONTINGENCY_LIST,
        titleId: 'ContingencyListsSelection',
        elementStyle: styles.chipElement,
    });

    useEffect(() => {
        onChange(index, {
            checked,
            monitoredVoltageLevels,
            equipmentsInVoltageRegulation,
            contingencies,
        });
    }, [
        index,
        onChange,
        checked,
        monitoredVoltageLevels,
        equipmentsInVoltageRegulation,
        contingencies,
    ]);

    return (
        <>
            <SensiChecked checked={checked} onClick={onClickChecked} />
            {gridItem(monitoredVoltageLevelsField, 3)}
            {gridItem(equipmentsInVoltageRegulationField, 3.5)}
            {gridItem(contingenciesField, 2.5)}
        </>
    );
};
