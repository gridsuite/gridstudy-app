import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useControl } from 'react-map-gl';

import type { ControlPosition } from 'react-map-gl';


var draw: MapboxDraw | undefined = undefined;

//source: https://github.com/visgl/react-map-gl/blob/master/examples/draw-polygon/src/
type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
    position?: ControlPosition;

    onCreate?: (evt: { features: object[] }) => void;
    onUpdate?: (evt: { features: object[]; action: string }) => void;
    onDelete?: (evt: { features: object[] }) => void;
};




export default function DrawControl(props: DrawControlProps | any) {
    // static modes: MapboxDraw.Modes;
    useControl<MapboxDraw>(
        //onCreate
        () => {
            draw = new MapboxDraw({ ...props });
            return draw;
        },
        //on add
        ({ map }) => {
            const onUpdate = (evt: { features: object[]; action: string }) => {
                props.onUpdate(evt);
                // draw?.deleteAll();
            };
            map.on('draw.create', props.onCreate);
            map.on('draw.update', onUpdate);
            map.on('draw.delete', props.onDelete);

            // add keybinding to save the filter ?? 
            // map.getContainer().addEventListener()
        },
        //onRemove
        ({ map }) => {
            map.off('draw.create', props.onCreate);
            map.off('draw.update', props.onUpdate);
            map.off('draw.delete', props.onDelete);
        },
        {
            // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
            position: props.position,
        }
    );

    return null;
}

DrawControl.defaultProps = {
    onCreate: () => {},
    onUpdate: () => {},
    onDelete: () => {},
};
