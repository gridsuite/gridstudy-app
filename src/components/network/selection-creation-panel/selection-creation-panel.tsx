/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    CustomFormProvider,
    EquipmentType,
    fetchDirectoryElementPath,
    TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { useForm } from 'react-hook-form';
import {
    NAME,
    EQUIPMENT_TYPE_FIELD,
    SELECTION_TYPE,
} from 'components/utils/field-constants';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import { useSaveMap } from './use-save-map';
import { SelectionCreationPanelForm } from './selection-creation-panel-form';
import { SelectionCreationPanelSubmitButton } from './selection-creation-panel-submit-button';
import { SELECTION_TYPES } from './selection-types';
import { useDispatch } from 'react-redux';
import { Equipment } from '@gridsuite/commons-ui/dist/utils/EquipmentType';
import { openNadList } from 'redux/actions';

const formSchema = yup
    .object()
    .shape({
        [NAME]: yup.string().required(),
        [SELECTION_TYPE]: yup.string().nullable().required(),
        [EQUIPMENT_TYPE_FIELD]: yup.string().nullable().required(),
    })
    .required();
const emptyFormData = {
    [NAME]: '',
    [EQUIPMENT_TYPE_FIELD]: '',
    [SELECTION_TYPE]: '',
};

export type SelectionCreationPanelFormFields = yup.InferType<typeof formSchema>;

type SelectionCreationPanelProps = {
    getEquipments: (equipmentType: string) => any[];
    onCancel: () => void;
    nominalVoltages: number[];
};

const SelectionCreationPanel: React.FC<SelectionCreationPanelProps> = ({
    getEquipments,
    onCancel,
    nominalVoltages,
}) => {
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const intl = useIntl();
    const { pendingState, onSaveSelection } = useSaveMap();
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const dispatch = useDispatch();

    const { setValue } = formMethods;

    const [destinationFolder, setDestinationFolder] =
        useState<TreeViewFinderNodeProps>();

    const fetchDefaultDirectoryForStudy = useCallback(() => {
        fetchDirectoryElementPath(studyUuid).then((res) => {
            if (res) {
                const parentFolderIndex = res.length - 2;
                setDestinationFolder({
                    id: res[parentFolderIndex].elementUuid,
                    name: res[parentFolderIndex].elementName,
                });
            }
        });
    }, [studyUuid]);

    useEffect(() => {
        if (studyUuid) {
            fetchDefaultDirectoryForStudy();
        }
    }, [fetchDefaultDirectoryForStudy, studyUuid]);

    const handleValidate = (formData: SelectionCreationPanelFormFields) => {
        if (formData.selectionType === SELECTION_TYPES.NAD) {
            const equ = getEquipments(
                EquipmentType.VOLTAGE_LEVEL
            ) as Equipment[]; // when getting anything but LINE equipment type, returned type is Equipment. Will need to be fixed after powsybl-diagram-viewer is migrated to TS
            console.log('TEST', equ);

            dispatch(
                openNadList(
                    equ
                        .flatMap((eq) => eq.voltageLevels?.map((vl) => vl.id))
                        .filter((id) => id)
                )
            );
            console.log(
                'SAVING',
                equ.flatMap((eq) => eq.voltageLevels?.map((vl) => vl.id))
            );
        }

        if (destinationFolder) {
            onSaveSelection(
                getEquipments(formData.equipmentType),
                formData,
                destinationFolder,
                nominalVoltages
            ).then((result) => {
                if (result) {
                    setValue(NAME, '', {
                        shouldDirty: true,
                    });
                }
            });
        }
    };

    return (
        <CustomFormProvider
            removeOptional={true}
            validationSchema={formSchema}
            {...formMethods}
        >
            <Box
                p={4}
                display="flex"
                justifyContent="space-between"
                flexDirection="column"
                height="100%"
            >
                <SelectionCreationPanelForm pendingState={pendingState} />
                <Grid container justifyContent="flex-end">
                    <Button onClick={onCancel} size={'large'}>
                        {intl.formatMessage({
                            id: 'cancel',
                        })}
                    </Button>
                    <Box m={1} />
                    <Button
                        onClick={() => {
                            const equ = getEquipments(
                                EquipmentType.VOLTAGE_LEVEL
                            ) as Equipment[]; // when getting anything but LINE equipment type, returned type is Equipment. Will need to be fixed after powsybl-diagram-viewer is migrated to TS
                            console.log('TEST', equ);

                            dispatch(
                                openNadList(
                                    equ
                                        .flatMap((eq) =>
                                            eq.voltageLevels?.map((vl) => vl.id)
                                        )
                                        .filter((id) => id)
                                )
                            );
                            console.log(
                                'SAVING',
                                equ.flatMap((eq) =>
                                    eq.voltageLevels?.map((vl) => vl.id)
                                )
                            );
                        }}
                    >
                        test
                    </Button>
                    <SelectionCreationPanelSubmitButton
                        handleValidate={handleValidate}
                        pendingState={pendingState}
                    />
                </Grid>
            </Box>
        </CustomFormProvider>
    );
};

export default SelectionCreationPanel;
