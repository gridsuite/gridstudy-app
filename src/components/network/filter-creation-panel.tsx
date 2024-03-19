import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { SelectInput, elementType } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { Identifier } from '../dialogs/parameters/voltageinit/voltage-init-utils';
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
import { createFilter, fetchElementsMetadata } from 'services/explore';
import { UniqueNameInput } from 'components/dialogs/commons/unique-name-input';
import { useSelector } from 'react-redux';
import { UUID } from 'crypto';
import { EQUIPMENT_TYPES } from '../utils/equipment-types';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { GeoData } from '@powsybl/diagram-viewer';

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
        [NAME]: yup.string(),
        equipmentType: yup.string().nullable(),
    })
    .required();
const emptyFormData = {
    [FILTER_NAME]: '',
    [NAME]: '',
    equipmentType: '',
};

function getVoltageLevelInPolygon(
    features: any,
    mapEquipments: any,
    geoData: GeoData
) {
    const firstPolygonFeatures: any = Object.values(features)[0];
    const polygoneCoordinates = firstPolygonFeatures?.geometry;
    if (!polygoneCoordinates || polygoneCoordinates.coordinates < 3) {
        return null;
    }
    //get the list of substation
    const substationsList = mapEquipments?.substations ?? [];

    const positions = substationsList // we need a list of substation and their positions
        .map((substation: any) => {
            return {
                substation: substation,
                pos: geoData.getSubstationPosition(substation.id),
            };
        });
    if (!positions) {
        return null;
    }

    const substationsInsidePolygone = positions.filter((substation: any) => {
        return booleanPointInPolygon(substation.pos, polygoneCoordinates);
    });

    const voltageLevels = substationsInsidePolygone
        .map((substation: any) => {
            return substation.substation.voltageLevels;
        })
        .flat();

    return voltageLevels;
}

function createVoltageLevelIdentifierList(
    equipmentType: string,
    equipementsList: any
) {
    return {
        type: 'IDENTIFIER_LIST',
        equipmentType: equipmentType,
        filterEquipmentsAttributes: equipementsList.map((eq: any) => {
            return { equipmentID: eq.id };
        }),
    };
}
async function createVoltageLevelFilterInStudyPath(
    studyUuid: UUID,
    voltageLevels: any
) {
    try {
        const studyPath = await fetchPath(studyUuid);
        if (!studyPath || studyPath.length < 2) {
            return;
        }

        const PARENT_DIRECTORY_INDEX = 1;
        const studyDirectoryUuid =
            studyPath[PARENT_DIRECTORY_INDEX].elementUuid;

        const substationParam = createVoltageLevelIdentifierList(
            EQUIPMENT_TYPES.VOLTAGE_LEVEL,
            voltageLevels
        );

        return createFilter(
            substationParam,
            'polygoneFilter',
            'description',
            studyDirectoryUuid
        );
    } catch (error) {
        return Promise.reject(error);
    }
}
const FilterCreationPanel: React.FC = () => {
    const studyUuid = useSelector((state: any) => state.studyUuid);
    const polygoneCoordinates = useSelector(
        (state: any) => state.polygonCoordinate
    );
    const mapEquipments = useSelector((state) => state.mapEquipments);
    const [openDirectoryFolders, setOpenDirectoryFolders] = useState(false);
    const geoData = useSelector((state: any) => state.geoData);
    const intl = useIntl();
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const [defaultFolder, setDefaultFolder] = useState<Identifier>({
        id: null,
        name: null,
    });

    const handleValidationButtonClick = () => {
        // get the form data
        const formData = formMethods.getValues();
        console.log('debug', 'formData', formData);
        const vlsInPolygon = getVoltageLevelInPolygon(
            polygoneCoordinates,
            mapEquipments,
            geoData
        );
        const filterData = createVoltageLevelIdentifierList(
            EQUIPMENT_TYPES.VOLTAGE_LEVEL,
            vlsInPolygon
        );
        //create the filter
        createFilter(
            filterData,
            formData[NAME],
            'description',
            defaultFolder.id?.toString() ?? ''
        )
            .then((res) => {
                console.log('debug', 'createFilter', res);
            })
            .catch((err) => {
                console.error('debug', 'createFilter', err);
            });
    };
    function handleCancelButtonClick() {}
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
            <Grid container>
                <FormProvider
                    {...{
                        validationSchema: formSchema,
                        removeOptional: true,
                        ...formMethods,
                    }}
                >
                    <GridSection title="Filter creation" />
                    <Grid container paddingTop={2}>
                        <SelectInput
                            name={'equipmentType'}
                            options={Object.values(EXPERT_FILTER_EQUIPMENTS)}
                            label={'equipmentType'}
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
                            elementType={'DIRECTORY'}
                            activeDirectory={defaultFolder.id}
                            autoFocus
                        />
                        {folderChooser}
                    </Grid>
                    <Grid container paddingTop={2}>
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
                    </Grid>

                    <Grid container paddingTop={2}>
                        <Button
                            variant="contained"
                            onClick={handleValidationButtonClick}
                            size={'large'}
                        >
                            {intl.formatMessage({
                                id: 'validate',
                            })}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCancelButtonClick}
                            size={'large'}
                        >
                            {intl.formatMessage({
                                id: 'cancel',
                            })}
                        </Button>
                    </Grid>
                </FormProvider>
            </Grid>
        </>
    );
};

export default FilterCreationPanel;
