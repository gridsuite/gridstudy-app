import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { SelectInput, elementType } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { Identifier } from './../dialogs/parameters/voltageinit/voltage-init-utils';
import { FormProvider, useForm } from 'react-hook-form';
import { FILTER_NAME, NAME } from 'components/utils/field-constants';
import { GridSection } from 'components/dialogs/dialogUtils';
import { FormattedMessage, useIntl } from 'react-intl';
import { DirectoryItemSelector } from '@gridsuite/commons-ui';
import {
    fetchDirectoryContent,
    fetchPath,
    fetchRootFolders,
} from 'services/directory';
import { fetchElementsMetadata } from 'services/explore';
import { UniqueNameInput } from 'components/dialogs/commons/unique-name-input';
import { useSelector } from 'react-redux';
import { ParameterType } from 'components/dialogs/parameters/widget';

const EXPERT_FILTER_EQUIPMENTS = {
    GENERATOR: {
        id: 'GENERATOR',
        label: 'Generators',
    },
    LOAD: {
        id: 'LOAD',
        label: 'Loads',
    },
    BATTERY: {
        id: 'BATTERY',
        label: 'Batteries',
    },
    VOLTAGE_LEVEL: {
        id: 'VOLTAGE_LEVEL',
        label: 'VoltageLevels',
    },
    SUBSTATION: {
        id: 'SUBSTATION',
        label: 'Substations',
    },
    SHUNT_COMPENSATOR: {
        id: 'SHUNT_COMPENSATOR',
        label: 'ShuntCompensators',
    },
    LINE: {
        id: 'LINE',
        label: 'Lines',
    },
    TWO_WINDINGS_TRANSFORMER: {
        id: 'TWO_WINDINGS_TRANSFORMER',
        label: 'TwoWindingsTransformers',
    },
};

const formSchema = yup
    .object()
    .shape({
        [FILTER_NAME]: yup.string().nullable(),
        [NAME]: yup.string().nullable(),
        equipmentType: yup.string().nullable(),
    })
    .required();
const emptyFormData = {
    [FILTER_NAME]: '',
    [NAME]: '',
    equipmentType: '',
};
const FilterCreationPanel: React.FC = () => {
    const studyUuid = useSelector((state: any) => state.studyUuid);
    const [openDirectoryFolders, setOpenDirectoryFolders] = useState(false);
    const intl = useIntl();
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const handleValidationButtonClick = () => {
        // get the form data
        const formData = formMethods.getValues();
        console.log('debug', 'formData', formData);
    };

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
        if (studyUuid) {
            fetchDefaultDirectoryForStudy();
        }
    }, [fetchDefaultDirectoryForStudy, studyUuid]);

    const handleChangeFolder = () => {
        setOpenDirectoryFolders(true);
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
        setOpenDirectoryFolders(false);
    };

    const folderChooser = //compied from src/components/dialogs/parameters/common/parameters-creation-dialog.tsx
        (
            <Grid container item>
                <Grid item>
                    <Button onClick={handleChangeFolder} variant="contained">
                        <FormattedMessage id={'showSelectDirectoryDialog'} />
                    </Button>
                </Grid>
                <Typography m={1} component="span">
                    <Box fontWeight={'fontWeightBold'}>
                        {defaultFolder == null ? (
                            <CircularProgress />
                        ) : (
                            defaultFolder.name
                        )}
                    </Box>
                </Typography>
            </Grid>
        );

    return (
        <>
            <Grid container spacing={2}>
                <FormProvider
                    {...{
                        validationSchema: formSchema,
                        removeOptional: true,
                        ...formMethods,
                    }}
                >
                    <GridSection title="Filter creation" />
                    <Grid item>
                        <SelectInput
                            name={'equipmentType'}
                            options={Object.values(EXPERT_FILTER_EQUIPMENTS)}
                            label={'equipmentType'}
                            fullWidth
                            size={'small'}
                            disableClearable={true}
                            formProps={{ style: { fontStyle: 'italic' } }}
                        />
                    </Grid>

                    <UniqueNameInput
                        name={NAME}
                        label={'Name'}
                        elementType={'DIRECTORY'}
                        activeDirectory={defaultFolder.id}
                        autoFocus
                    />
                    {folderChooser}

                    <DirectoryItemSelector
                        open={openDirectoryFolders}
                        onClose={setSelectedFolder}
                        types={[elementType.DIRECTORY]}
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

                    <Grid item>
                        <Button
                            variant="contained"
                            onClick={handleValidationButtonClick}
                        >
                            Validate
                        </Button>
                    </Grid>
                </FormProvider>
            </Grid>
        </>
    );
};

export default FilterCreationPanel;
