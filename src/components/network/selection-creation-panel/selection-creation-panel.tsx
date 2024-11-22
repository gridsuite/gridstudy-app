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
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {
    NAME,
    EQUIPMENT_TYPE_FIELD,
    SELECTION_TYPE,
    DESTINATION_FOLDER,
    FOLDER_ID,
    FOLDER_NAME,
} from 'components/utils/field-constants';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { useSaveMap } from './use-save-map';
import { SelectionCreationPanelSubmitButton } from './selection-creation-panel-submit-button';
import { SELECTION_TYPES } from './selection-types';
import { openNadList } from 'redux/actions';
import { Nullable } from 'components/utils/ts-utils';
import { AppState } from 'redux/reducer';
import { SelectionCreationPanelForm } from './selection-creation-panel-form';
import {
    SelectionCreationPaneFields,
    SelectionCreationPanelFormSchema,
    getSelectionCreationSchema,
} from './selection-creation-schema';
import { VoltageLevel } from '../../utils/equipment-types';

type SelectionCreationPanelProps = {
    getEquipments: (equipmentType: EquipmentType) => Equipment[];
    onCancel: () => void;
    leaveDrawingMode: () => void;
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
    leaveDrawingMode,
    nominalVoltages,
}) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const intl = useIntl();
    const { pendingState, onSaveSelection } = useSaveMap();
    const formMethods = useForm<Nullable<SelectionCreationPanelFormSchema>>({
        defaultValues: emptyFormData,
        // "Nullable" to allow null values as default values for required values
        // ("undefined" is accepted here in RHF, but it conflicts with MUI behaviour which does not like undefined values)
        resolver: yupResolver<Nullable<SelectionCreationPanelFormSchema>>(formSchema),
    });

    const dispatch = useDispatch();

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
            const selectedSubstationsWithVl = getEquipments(EquipmentType.VOLTAGE_LEVEL); // when getting anything but LINE equipment type, returned type is Equipment. Will need to be fixed after powsybl-network-viewer is migrated to TS

            dispatch(
                openNadList(
                    selectedSubstationsWithVl
                        .flatMap((selectedSubstation) =>
                            selectedSubstation.voltageLevels
                                ?.filter(
                                    (vl): vl is VoltageLevel =>
                                        isVoltageLevel(vl) && nominalVoltages.includes(vl.nominalV)
                                )
                                .map((vl) => vl.id)
                        )
                        .filter((id): id is string => !!id)
                )
            );
            leaveDrawingMode();
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
