/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {PathLayer} from "deck.gl";
import GL from '@luma.gl/constants';

const defaultProps = {
    getParallelIndex: {type: 'accessor', value: 0},
    getLineAngle: {type: 'accessor', value: 0},
    getDistanceBetweenLines: {type: 'accessor', value: 1000.},
    getMaxParallelOffset: {type: 'accessor', value: 1.},
    getPinParallelOffset: {type: 'accessor', value: 50.}
};

/**
 * A layer based on PathLayer allowing to shift path by an offset + angle
 * props : parallelIndex
 *         lineAngle
 *         distanceBetweenLines
 *         maxParallelOffset
 *         minParallelOffset
 */
export default class ParallelPathLayer extends PathLayer {

    getShaders() {
        const shaders = super.getShaders();
        shaders.inject = {
            'vs:#decl': `\
attribute float instanceOffsets;
attribute float angleLine;
uniform float distanceBetweenLines;
uniform float maxParallelOffset;
uniform float minParallelOffset;

`,
    'vs:DECKGL_FILTER_GL_POSITION': `\
            if ( instanceOffsets == 0.) return;

      float offsetPixels = clamp(project_pixel_size( distanceBetweenLines), minParallelOffset, maxParallelOffset);
      vec4 trans = project_common_position_to_clipspace(vec4(-cos(angleLine), sin(angleLine), 0, 0.) * instanceOffsets) * project_size_to_pixel(offsetPixels);
      position += trans ;
`
        };
        return shaders;
    }

    initializeState(params) {
        super.initializeState(params);

        const attributeManager = this.getAttributeManager();
        attributeManager.addInstanced({
            instanceOffsets: {
                size: 1,
            type: GL.FLOAT,
                accessor: 'getParallelIndex'},

            angleLine: {
                size: 1,
                type: GL.FLOAT,
                accessor: 'getLineAngle'}



        });
    }

    draw({uniforms}) {
        super.draw({
            uniforms:
                {
                    ...uniforms,
                    distanceBetweenLines: this.props.getDistanceBetweenLines(),
                    maxParallelOffset: this.props.getMaxParallelOffset(),
                    minParallelOffset: this.props.getMinParallelOffset()
                }
        })
    }

}

ParallelPathLayer.layerName = 'ParallelPathLayer';
ParallelPathLayer.defaultProps = defaultProps;
