/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import {
    useDirectoryElements,
    useEnumValue,
} from '../../util/inputs/input-hooks';
import { elementType } from '@gridsuite/commons-ui';
import { filledTextField, gridItem } from '../dialogUtils';
import {
    MONITORED_BRANCHES_EQUIPMENT_TYPES,
    PSTS_EQUIPMENT_TYPES,
    SensiChecked,
    SENSITIVITY_TYPES,
    useStyles,
} from './sensi-parameters-selector';

export const SensiPSTs = ({ index, onChange, defaultValue, inputForm }) => {
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
        equipmentTypes: MONITORED_BRANCHES_EQUIPMENT_TYPES,
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [psts, pstsField] = useDirectoryElements({
        label: 'PSTS',
        initialValues: defaultValue.psts ? defaultValue.psts : [],
        elementType: elementType.FILTER,
        equipmentTypes: PSTS_EQUIPMENT_TYPES,
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [sensitivityType, sensitivityTypeField] = useEnumValue({
        label: 'SensitivityType',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: defaultValue.sensitivityType
            ? defaultValue.sensitivityType
            : 'DELTA_MW',
        enumValues: SENSITIVITY_TYPES,
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
            psts,
            sensitivityType,
            contingencies,
        });
    }, [
        index,
        onChange,
        checked,
        monitoredBranches,
        psts,
        sensitivityType,
        contingencies,
    ]);

    return (
        <>
            <SensiChecked checked={checked} onClick={onClickChecked} />
            {gridItem(monitoredBranchesField, 2.5)}
            {gridItem(sensitivityTypeField, 2.5)}
            {gridItem(pstsField, 2.5)}
            {gridItem(contingenciesField, 2.5)}
        </>
    );
};
