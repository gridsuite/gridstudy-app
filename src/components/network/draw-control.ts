import { useSnackMessage } from '@gridsuite/commons-ui';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { UUID } from 'crypto';
import { useCallback, useEffect, useState } from 'react';
import { useControl } from 'react-map-gl';

import type { ControlPosition } from 'react-map-gl';
import { fetchPath } from 'services/directory';
import { createFilter } from 'services/explore';
import GeoData from './geo-data';
import { error } from 'console';

// FIXME: to speed up the development, i skiped the type definitions
var draw: MapboxDraw | undefined = undefined;

//source: https://github.com/visgl/react-map-gl/blob/master/examples/draw-polygon/src/
type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
    position?: ControlPosition;
    readyToDisplay: boolean;
    studyUuid: UUID;
    mapEquipments: any;
    geoData: any;
};

function getVoltageLevelInPolygone(
    features: any,
    mapEquipments: any,
    geoData: GeoData,
    readyToDisplay: boolean
) {
    // in case we want to handle multiple polygons drawing, we need to handle the features as an array
    const firstPolygonFeatures: any = Object.values(features)[0];
    const polygoneCoordinates = firstPolygonFeatures?.geometry;
    if (!polygoneCoordinates || polygoneCoordinates.coordinates < 3) {
        return null;
    }
    //get the list of substation
    const substationsList = readyToDisplay ? mapEquipments?.substations : [];

    const positions = substationsList // we need a list of substation and their positions
        .map((substation: any) => {
            return {
                substation: substation,
                pos: geoData.getSubstationPosition(substation.id),
            };
        });
    if (!positions ) {
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

async function processFeatures(studyUuid: UUID, voltageLevels: any) {
    try {
        const studyPath = await fetchPath(studyUuid);
        if (!studyPath || studyPath.length < 2) {
            return;
        }

        const PARENT_DIRECTORY_INDEX = 1;
        const studyDirectoryUuid =
            studyPath[PARENT_DIRECTORY_INDEX].elementUuid;

        const substationParam = {
            type: 'IDENTIFIER_LIST',
            equipmentType: EQUIPMENT_TYPES.VOLTAGE_LEVEL,
            filterEquipmentsAttributes: voltageLevels.map((eq: any) => {
                return { equipmentID: eq.id };
            }),
        };

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

export default function DrawControl(props: DrawControlProps | any) {
    const [features, setFeatures] = useState<any>({});
    const { snackError, snackInfo } = useSnackMessage();

    const onUpdate = useCallback((e: any) => {
        setFeatures((currFeatures: any) => {
            // draw?.deleteAll(); // to delete the polygone
            const newFeatures: any = { ...currFeatures };
            for (const f of e.features) {
                newFeatures[f.id] = f;
            }

            return newFeatures;
        });
    }, []);

    const onDelete = useCallback((e: any) => {
        setFeatures((currFeatures: any) => {
            const newFeatures = { ...currFeatures };
            for (const f of e.features) {
                delete newFeatures[f.id];
            }
            return newFeatures;
        });
    }, []);

    useEffect(() => {
        const voltageLevels = getVoltageLevelInPolygone(
            features,
            props.mapEquipments,
            props.geoData,
            props.readyToDisplay
        );
        if (!voltageLevels) {
            return;
        }

        processFeatures(props.studyUuid, voltageLevels)
            .then((value) => {
                snackInfo({
                    messageTxt: 'Filter creation succeed.',
                    headerId: 'createFilterMsg',
                });
            })
            .catch((error) => {
                snackError({
                    messageTxt: error,
                    headerId: 'errCreateModificationsMsg',
                });
            });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [features]);

    useControl<MapboxDraw>(
        //onCreate
        () => {
            draw = new MapboxDraw({ ...props });
            return draw;
        },
        //on add
        ({ map }) => {
            map.on('draw.create', onUpdate);
            map.on('draw.update', onUpdate);
            map.on('draw.delete', onDelete);

            // add keybinding to save the filter ?? 
            // map.getContainer().addEventListener()
        },
        //onRemove
        ({ map }) => {
            map.off('draw.create', onUpdate);
            map.off('draw.update', onUpdate);
            map.off('draw.delete', onDelete);
        },
        {
            // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
            position: props.position,
        }
    );

    return null;
}

DrawControl.defaultProps = {
    // onCreate: () => {},
    // onUpdate: () => {},
    // onDelete: () => {},
};
