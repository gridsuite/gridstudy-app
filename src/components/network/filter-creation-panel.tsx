import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    DirectoryItemSelector,
    ElementType,
    SelectInput,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { Identifier } from '../dialogs/parameters/voltageinit/voltage-init-utils';
import { FormProvider, useForm } from 'react-hook-form';
import { FILTER_NAME, NAME } from 'components/utils/field-constants';
import { GridSection } from 'components/dialogs/dialogUtils';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    fetchDirectoryContent,
    fetchPath,
    fetchRootFolders,
} from 'services/directory';
import { fetchElementsMetadata } from 'services/explore';
import { UniqueNameInput } from 'components/dialogs/commons/unique-name-input';
import { useSelector } from 'react-redux';
import {
    equipementTypeToLabel,
    EQUIPMENT_TYPES,
} from '../utils/equipment-types';

interface IFilterCreation {
    [FILTER_NAME]: string | null;
    [NAME]: string;
    equipmentType: string | null;
}

const formSchema = yup
    .object()
    .shape({
        [FILTER_NAME]: yup.string().nullable(),
        [NAME]: yup.string().required(),
        equipmentType: yup.string().required(),
    })
    .required();
const emptyFormData = {
    [FILTER_NAME]: '',
    [NAME]: '',
    equipmentType: '',
};

type FilterCreationPanelProps = {
    onSaveFilter: (data: IFilterCreation, distDir: Identifier) => void;
    onCancel: () => void;
};

const FilterCreationPanel: React.FC<FilterCreationPanelProps> = ({
    onSaveFilter,
    onCancel,
}) => {
    const studyUuid = useSelector((state: any) => state.studyUuid);
    const [openDirectorySelector, setOpenDirectorySelector] = useState(false);
    const intl = useIntl();
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const [defaultFolder, setDefaultFolder] = useState<Identifier>({
        id: null,
        name: null,
    });

    const fetchDefaultDirectoryForStudy = useCallback(() => {
        fetchPath(studyUuid).then((res) => {
            if (res) {
                setDefaultFolder({
                    id: res[1].elementUuid,
                    name: res[1].elementName,
                });
            }
        });
    }, [studyUuid]);

    useEffect(() => {
        //Generate a new name every time the component is mounted
        formMethods.setValue(
            NAME,
            'Generated-filter - ' + new Date().toISOString()
        );
    }, [formMethods]);

    useEffect(() => {
        if (studyUuid) {
            fetchDefaultDirectoryForStudy();
        }
    }, [fetchDefaultDirectoryForStudy, studyUuid]);

    const handleChangeFolder = () => {
        setOpenDirectorySelector(true);
    };
    const setSelectedFolder = (folder: Identifier[]) => {
        if (folder && folder.length > 0) {
            if (folder[0].id !== defaultFolder?.id) {
                setDefaultFolder({
                    id: folder[0].id,
                    name: folder[0].name,
                });
            }
        }
        setOpenDirectorySelector(false);
    };

    return (
        <Box p={4}>
            <Grid container>
                <FormProvider
                    {...{
                        validationSchema: formSchema,
                        removeOptional: true,
                        ...formMethods,
                    }}
                >
                    <GridSection title="createNewFilter" />
                    <Grid container paddingTop={2}>
                        <SelectInput
                            name={'equipmentType'}
                            options={Object.values(EQUIPMENT_TYPES).map(
                                (value) => {
                                    return {
                                        id: value,
                                        label: equipementTypeToLabel(value),
                                    };
                                }
                            )}
                            label={'EquipmentType'}
                            fullWidth
                            size={'medium'}
                            disableClearable={true}
                            formProps={{ style: { fontStyle: 'italic' } }}
                        />
                    </Grid>

                    <Grid container paddingTop={2}>
                        <UniqueNameInput
                            name={NAME}
                            label={'Name'}
                            elementType={ElementType.DIRECTORY}
                            activeDirectory={defaultFolder.id}
                            autoFocus
                        />
                    </Grid>
                    <Grid container paddingTop={2}>
                        <Button
                            onClick={handleChangeFolder}
                            variant="contained"
                        >
                            <FormattedMessage
                                id={'showSelectDirectoryDialog'}
                            />
                        </Button>

                        <Typography m={1} component="span">
                            <Box fontWeight={'fontWeightBold'}>
                                {defaultFolder.name}
                            </Box>
                        </Typography>
                    </Grid>
                    <Grid container paddingTop={2}>
                        <DirectoryItemSelector
                            open={openDirectorySelector}
                            onClose={setSelectedFolder}
                            types={[ElementType.DIRECTORY]}
                            onlyLeaves={false}
                            multiselect={false}
                            validationButtonText={intl.formatMessage({
                                id: 'validate',
                            })}
                            title={intl.formatMessage({
                                id: 'showSelectDirectoryDialog',
                            })}
                            fetchDirectoryContent={fetchDirectoryContent}
                            fetchRootFolders={fetchRootFolders}
                            fetchElementsInfos={fetchElementsMetadata}
                        />
                    </Grid>

                    <Grid
                        container
                        paddingTop={2}
                        justifyContent="space-between"
                    >
                        <Button
                            variant="contained"
                            onClick={onCancel}
                            size={'large'}
                        >
                            {intl.formatMessage({
                                id: 'cancel',
                            })}
                        </Button>
                        <Button
                            variant="contained"
                            type={'submit'}
                            onClick={() => {
                                formMethods.trigger().then((isValid) => {
                                    if (isValid) {
                                        onSaveFilter(
                                            formMethods.getValues() as IFilterCreation,
                                            defaultFolder
                                        );
                                    }
                                });
                            }}
                            size={'large'}
                        >
                            {intl.formatMessage({
                                id: 'validate',
                            })}
                        </Button>
                    </Grid>
                </FormProvider>
            </Grid>
        </Box>
    );
};

export default FilterCreationPanel;
