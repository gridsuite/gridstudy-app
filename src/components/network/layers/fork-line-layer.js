/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LineLayer } from 'deck.gl';
import GL from '@luma.gl/constants';

const defaultProps = {
    getLineParallelIndex: { type: 'accessor', value: 0 },
    getLineAngle: { type: 'accessor', value: 0 },
    distanceBetweenLines: { type: 'number', value: 1000 },
    maxParallelOffset: { type: 'number', value: 100 },
    minParallelOffset: { type: 'number', value: 3 },
};

/**
 * A layer based on LineLayer that draws a fork line at a substation when there are multiple parallel lines
 * Needs to be kept in sync with ArrowLayer and ParallelPathLayer because connect to the end of the fork lines.
 * props : getLineParallelIndex: real number representing the parallel translation, normalized to distanceBetweenLines
 *         getLineAngle: line angle in radian
 *         distanceBetweenLines: distance in meters between line when no pixel clamping is applied
 *         maxParallelOffset: max pixel distance
 *         minParallelOffset: min pixel distance
 */
export default class ForkLineLayer extends LineLayer {
    getShaders() {
        const shaders = super.getShaders();
        shaders.inject = {
            'vs:#decl': `
attribute float instanceLineParallelIndex;
attribute float instanceLineAngle;
uniform float distanceBetweenLines;
uniform float maxParallelOffset;
uniform float minParallelOffset;
            `,
            'float segmentIndex = positions.x': `;
target = source ;
if( abs(instanceLineParallelIndex) != 9999. ) {
    float offsetPixels = clamp(project_size_to_pixel( distanceBetweenLines), minParallelOffset, maxParallelOffset );
    float offsetCommonSpace = project_pixel_size(offsetPixels);
    vec4 trans = vec4(cos(instanceLineAngle), -sin(instanceLineAngle ), 0, 0.) * instanceLineParallelIndex ;
    trans.x -= sin(instanceLineAngle) ;
    trans.y -= cos(instanceLineAngle) ;
    trans = trans * offsetCommonSpace;
    target+=project_common_position_to_clipspace(trans) - project_uCenter;
}
            `,
        };
        return shaders;
    }

    initializeState(params) {
        super.initializeState(params);

        const attributeManager = this.getAttributeManager();
        attributeManager.addInstanced({
            instanceLineParallelIndex: {
                size: 1,
                type: GL.FLOAT,
                accessor: 'getLineParallelIndex',
            },
            instanceLineAngle: {
                size: 1,
                type: GL.FLOAT,
                accessor: 'getLineAngle',
            },
        });
    }

    draw({ uniforms }) {
        super.draw({
            uniforms: {
                ...uniforms,
                distanceBetweenLines: this.props.getDistanceBetweenLines,
                maxParallelOffset: this.props.getMaxParallelOffset,
                minParallelOffset: this.props.getMinParallelOffset,
            },
        });
    }
}

ForkLineLayer.layerName = 'ForkLineLayer';
ForkLineLayer.defaultProps = defaultProps;
