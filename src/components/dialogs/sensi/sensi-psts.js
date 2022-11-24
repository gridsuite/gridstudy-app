import React, { useEffect, useState } from 'react';
import { useDirectoryElements, useEnumValue } from '../inputs/input-hooks';
import { elementType } from '@gridsuite/commons-ui';
import { filledTextField, gridItem } from '../dialogUtils';
import {
    SensiChecked,
    SENSITIVITY_TYPES,
    useStyles,
    EquipmentType,
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
        equipmentTypes: [
            EquipmentType.LINE,
            EquipmentType.TWO_WINDINGS_TRANSFORMER,
        ],
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [psts, pstsField] = useDirectoryElements({
        label: 'PSTS',
        initialValues: defaultValue.psts ? defaultValue.psts : [],
        elementType: elementType.FILTER,
        equipmentTypes: [EquipmentType.TWO_WINDINGS_TRANSFORMER],
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
