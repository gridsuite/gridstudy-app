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
import { SensiChecked, useStyles } from './sensi-parameters-selector';
import { EQUIPMENT_TYPES } from '../../util/equipment-types';

export const SensiInjections = ({ index, onChange, defaultValue }) => {
    const classes = useStyles();
    const [checked, setChecked] = useState(defaultValue.checked ?? true);

    const onClickChecked = () => {
        setChecked(!checked);
    };

    const [monitoredBranches, monitoredBranchesField] = useDirectoryElements({
        label: 'SupervisedBranches',
        initialValues: defaultValue.monitoredBranches
            ? defaultValue.monitoredBranches
            : [],
        elementType: elementType.FILTER,
        equipmentTypes: [
            EQUIPMENT_TYPES.LINE.type,
            EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type,
        ],
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [injections, injectionsField] = useDirectoryElements({
        label: 'Injections',
        initialValues: defaultValue.injections ? defaultValue.injections : [],
        elementType: elementType.FILTER,
        equipmentTypes: [
            EQUIPMENT_TYPES.GENERATOR.type,
            EQUIPMENT_TYPES.LOAD.type,
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
            monitoredBranches,
            injections,
            contingencies,
        });
    }, [
        index,
        onChange,
        checked,
        monitoredBranches,
        injections,
        contingencies,
    ]);

    return (
        <>
            <SensiChecked checked={checked} onClick={onClickChecked} />
            {gridItem(monitoredBranchesField, 2.5)}
            {gridItem(injectionsField, 2.5)}
            {gridItem(contingenciesField, 2.5)}
        </>
    );
};
