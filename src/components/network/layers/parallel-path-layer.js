/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {PathLayer} from "deck.gl";
import GL from '@luma.gl/constants';

const defaultProps = {
    getParallelIndex: {type: 'accessor', value: 0}
};

/**
 * An extended scatter plot layer that allows a radius max pixels to be different for each object.
 */
export default class ParallelPathLayer extends PathLayer {

    getShaders() {
        const shaders = super.getShaders();
        shaders.inject = {
            'vs:#decl': `\
attribute float instanceParallelIndex;
`,
            'vs:DECKGL_FILTER_GL_POSITION': `\
position += vec4(0.1 * instanceParallelIndex, 0.1 * instanceParallelIndex, 0, 0);
`
        };
        return shaders;
    }

    initializeState(params) {
        super.initializeState(params);

        const attributeManager = this.getAttributeManager();
        attributeManager.addInstanced({
            instanceParallelIndex: {
                size: 1,
                transition: true,
                accessor: 'getParallelIndex',
                type: GL.FLOAT,
                defaultValue: 0
            }
        });
    }
}

ParallelPathLayer.layerName = 'ParallelPathLayer';
ParallelPathLayer.defaultProps = defaultProps;
