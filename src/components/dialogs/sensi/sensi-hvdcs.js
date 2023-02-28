/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import { useDirectoryElements, useEnumValue } from '../inputs/input-hooks';
import { elementType } from '@gridsuite/commons-ui';
import { filledTextField, gridItem } from '../dialogUtils';
import {
    HVDC_EQUIPMENT_TYPES,
    MONITORED_BRANCHES_EQUIPMENT_TYPES,
    SensiChecked,
    SENSITIVITY_TYPES,
    useStyles,
} from './sensi-parameters-selector';
import { EQUIPMENT_TYPES } from '../../util/equipment-types';

export const SensiHVDCs = ({ index, onChange, defaultValue, inputForm }) => {
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

    const [hvdcs, hvdcsField] = useDirectoryElements({
        label: 'HvdcLines',
        initialValues: defaultValue.hvdcs ? defaultValue.hvdcs : [],
        elementType: elementType.FILTER,
        equipmentTypes: HVDC_EQUIPMENT_TYPES,
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
            hvdcs,
            sensitivityType,
            contingencies,
        });
    }, [
        index,
        onChange,
        checked,
        monitoredBranches,
        hvdcs,
        sensitivityType,
        contingencies,
    ]);

    return (
        <>
            <SensiChecked checked={checked} onClick={onClickChecked} />
            {gridItem(monitoredBranchesField, 2.5)}
            {gridItem(sensitivityTypeField, 2.5)}
            {gridItem(hvdcsField, 2.5)}
            {gridItem(contingenciesField, 2.5)}
        </>
    );
};
