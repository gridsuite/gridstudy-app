/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    CustomFormProvider,
    Equipment,
    EquipmentType,
    fetchDirectoryElementPath,
    Identifiable,
    Nullable,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {
    DESTINATION_FOLDER,
    EQUIPMENT_TYPE_FIELD,
    FOLDER_ID,
    FOLDER_NAME,
    NAME,
    SELECTION_TYPE,
} from 'components/utils/field-constants';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useSaveMap } from './use-save-map';
import { SelectionCreationPanelSubmitButton } from './selection-creation-panel-submit-button';
import { SELECTION_TYPES } from './selection-types';
import { AppState } from 'redux/reducer.type';
import { SelectionCreationPanelForm } from './selection-creation-panel-form';
import {
    getSelectionCreationSchema,
    SelectionCreationPaneFields,
    SelectionCreationPanelFormSchema,
} from './selection-creation-schema';
import { VoltageLevel } from '../../utils/equipment-types';
import { useWorkspacePanelActions } from '../../workspace/hooks/use-workspace-panel-actions';

type SelectionCreationPanelProps = {
    getEquipments: (equipmentType: EquipmentType) => Equipment[];
    onCancel: () => void;
    nominalVoltages: number[];
};

const emptyFormData = {
    [NAME]: '',
    [EQUIPMENT_TYPE_FIELD]: null,
    [SELECTION_TYPE]: null,
    [DESTINATION_FOLDER]: null,
};

const formSchema = getSelectionCreationSchema();

function isVoltageLevel(obj: Identifiable): obj is VoltageLevel {
    return (obj as VoltageLevel).nominalV !== undefined;
}

const SelectionCreationPanel: React.FC<SelectionCreationPanelProps> = ({
    getEquipments,
    onCancel,
    nominalVoltages,
}) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const intl = useIntl();
    const { pendingState, onSaveSelection } = useSaveMap();
    const { openNAD } = useWorkspacePanelActions();
    const formMethods = useForm<Nullable<SelectionCreationPanelFormSchema>>({
        defaultValues: emptyFormData,
        // "Nullable" to allow null values as default values for required values
        // ("undefined" is accepted here in RHF, but it conflicts with MUI behaviour which does not like undefined values)
        resolver: yupResolver<Nullable<SelectionCreationPanelFormSchema>>(formSchema),
    });

    const { setValue } = formMethods;

    const fetchDefaultDirectoryForStudy = useCallback(() => {
        if (studyUuid) {
            fetchDirectoryElementPath(studyUuid).then((res) => {
                if (res) {
                    const parentFolderIndex = res.length - 2;
                    setValue(DESTINATION_FOLDER, {
                        [FOLDER_ID]: res[parentFolderIndex].elementUuid,
                        [FOLDER_NAME]: res[parentFolderIndex].elementName,
                    });
                }
            });
        }
    }, [studyUuid, setValue]);

    useEffect(() => {
        fetchDefaultDirectoryForStudy();
    }, [fetchDefaultDirectoryForStudy]);

    const handleValidate = (formData: SelectionCreationPaneFields) => {
        if (formData.selectionType === SELECTION_TYPES.NAD) {
            const selectedSubstationsWithVl = getEquipments(EquipmentType.VOLTAGE_LEVEL);
            const voltageLevelIds = selectedSubstationsWithVl
                .flatMap((selectedSubstation) =>
                    selectedSubstation.voltageLevels
                        ?.filter(
                            (vl): vl is VoltageLevel => isVoltageLevel(vl) && nominalVoltages.includes(vl.nominalV)
                        )
                        .map((vl) => vl.id)
                )
                .filter((id): id is string => !!id);

            openNAD({ title: formData.name, initialVoltageLevelIds: voltageLevelIds });
            return;
        }

        onSaveSelection(
            getEquipments(formData.equipmentType),
            formData,
            formData.destinationFolder,
            nominalVoltages
        ).then((result) => {
            if (result) {
                setValue(NAME, '', {
                    shouldDirty: true,
                });
            }
        });
    };

    return (
        <CustomFormProvider removeOptional={true} validationSchema={formSchema} {...formMethods}>
            <Box p={4} display="flex" justifyContent="space-between" flexDirection="column" height="100%">
                <SelectionCreationPanelForm pendingState={pendingState} />
                <Grid container justifyContent="flex-end">
                    <Button onClick={onCancel} size={'large'}>
                        {intl.formatMessage({
                            id: 'cancel',
                        })}
                    </Button>
                    <Box m={1} />
                    <SelectionCreationPanelSubmitButton handleValidate={handleValidate} pendingState={pendingState} />
                </Grid>
            </Box>
        </CustomFormProvider>
    );
};

export default SelectionCreationPanel;
