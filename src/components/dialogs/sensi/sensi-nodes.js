/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import { useDirectoryElements } from '../inputs/input-hooks';
import { elementType } from '@gridsuite/commons-ui';
import { gridItem } from '../dialogUtils';
import {
    SensiChecked,
    useStyles,
} from './sensi-parameters-selector';
import { EQUIPMENT_TYPES } from '../../util/equipment-types'

export const SensiNodes = ({ index, onChange, defaultValue }) => {
    const classes = useStyles();
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
            equipmentTypes: [EQUIPMENT_TYPES.VOLTAGE_LEVEL.type],
            titleId: 'FiltersListsSelection',
            elementClassName: classes.chipElement,
        });

    const [equipmentsInVoltageRegulation, equipmentsInVoltageRegulationField] =
        useDirectoryElements({
            label: 'EquipmentsInVoltageRegulation',
            initialValues: defaultValue.equipmentsInVoltageRegulation
                ? defaultValue.equipmentsInVoltageRegulation
                : [],
            elementType: elementType.FILTER,
            equipmentTypes: [
                EQUIPMENT_TYPES.GENERATOR.type,
                EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type,
                EQUIPMENT_TYPES.VSC_CONVERTER_STATION.type,
                EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR.type,
                EQUIPMENT_TYPES.SHUNT_COMPENSATOR.type,
            ],
            titleId: 'FiltersListsSelection',
            elementClassName: classes.chipElement,
        });

    const [contingencies, contingenciesField] = useDirectoryElements({
        label: 'ContingencyLists',
        initialValues: defaultValue.contingencies
            ? defaultValue.contingencies
            : [],
        elementType: elementType.CONTINGENCY_LIST,
        titleId: 'ContingencyListsSelection',
        elementClassName: classes.chipElement,
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
