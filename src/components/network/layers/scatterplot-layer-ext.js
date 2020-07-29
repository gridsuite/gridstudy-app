/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ScatterplotLayer } from 'deck.gl';
import GL from '@luma.gl/constants';

const defaultProps = {
    getRadiusMaxPixels: { type: 'accessor', value: 1 },
};

/**
 * An extended scatter plot layer that allows a radius max pixels to be different for each object.
 */
export default class ScatterplotLayerExt extends ScatterplotLayer {
    getShaders() {
        const shaders = super.getShaders();
        return Object.assign({}, shaders, {
            vs: shaders.vs.replace(
                ', radiusMaxPixels',
                ', instanceRadiusMaxPixels'
            ), // hack to replace the uniform variable to corresponding attribute
            inject: {
                'vs:#decl': `\
attribute float instanceRadiusMaxPixels;
`,
            },
        });
    }

    initializeState(params) {
        super.initializeState(params);

        const attributeManager = this.getAttributeManager();
        attributeManager.addInstanced({
            instanceRadiusMaxPixels: {
                size: 1,
                transition: true,
                accessor: 'getRadiusMaxPixels',
                type: GL.FLOAT,
                defaultValue: 0,
            },
        });
    }
}

ScatterplotLayerExt.layerName = 'ScatterplotLayerExt';
ScatterplotLayerExt.defaultProps = defaultProps;
