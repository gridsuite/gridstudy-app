/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { Grid } from '@mui/material';
import {
    CustomFormProvider,
    type EquipmentType,
    equipmentTypesForPredefinedPropertiesMapper,
    type MuiStyles,
    type UseStateBooleanReturn,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import PropertiesForm from './properties-form';
import {
    propertiesSchema,
    emptyProperties,
    PropertiesFormType,
    buildPredefinedProperties,
    TabularProperty,
} from './property-utils';
import { TABULAR_PROPERTIES } from '../../../../utils/field-constants';
import { PredefinedEquipmentProperties } from '../tabular-common';

const styles = {
    dialogContent: {
        width: '35%',
        height: '50%',
        maxWidth: 'none',
        margin: 'auto',
    },
} as const satisfies MuiStyles;

export type DefinePropertiesDialogProps = {
    open: UseStateBooleanReturn;
    equipmentType: EquipmentType;
    currentProperties: TabularProperty[];
    predefinedEquipmentProperties: PredefinedEquipmentProperties;
    onValidate: (formData: PropertiesFormType) => void;
};

export default function DefinePropertiesDialog({
    open,
    equipmentType,
    currentProperties,
    predefinedEquipmentProperties,
    onValidate,
    ...dialogProps
}: Readonly<DefinePropertiesDialogProps>) {
    const formMethods = useForm<PropertiesFormType>({
        defaultValues: emptyProperties,
        resolver: yupResolver(propertiesSchema),
    });

    const { reset } = formMethods;

    const onClose = () => {
        open.setFalse();
        reset(emptyProperties);
    };

    useEffect(() => {
        if (open.value && equipmentType) {
            if (currentProperties?.length) {
                reset({
                    [TABULAR_PROPERTIES]: currentProperties,
                });
            } else {
                // init case when no property has been selected before: propose predefined properties
                const networkEquipmentType = equipmentTypesForPredefinedPropertiesMapper(equipmentType);
                if (networkEquipmentType && predefinedEquipmentProperties?.[networkEquipmentType]) {
                    const propertyNames = Object.keys(predefinedEquipmentProperties[networkEquipmentType] ?? {}).sort(
                        (a, b) => a.localeCompare(b)
                    );
                    reset(buildPredefinedProperties(propertyNames));
                }
            }
        }
    }, [currentProperties, equipmentType, open, predefinedEquipmentProperties, reset]);

    return (
        <CustomFormProvider validationSchema={propertiesSchema} {...formMethods}>
            <ModificationDialog
                titleId={'DefinePropertiesTitle'}
                open={open.value}
                onClose={onClose}
                onSave={onValidate}
                onClear={() => null}
                PaperProps={{ sx: styles.dialogContent }}
                {...dialogProps}
            >
                <Grid container>
                    <PropertiesForm />
                </Grid>
            </ModificationDialog>
        </CustomFormProvider>
    );
}
