/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {LineLayer} from "deck.gl";

const defaultProps = {
    getLineParallelIndex: {type: 'accessor', value: 0},
    getLineAngle: {type: 'accessor', value: 0},
    getDistanceBetweenLines: {type: 'accessor', value: 1000},
    getMaxParallelOffset: {type: 'accessor', value: 1},
    getMinParallelOffset: {type: 'accessor', value: 50}
};

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
            `
        };
        return shaders;
    }

    initializeState(params) {
        super.initializeState(params);

        const attributeManager = this.getAttributeManager();
        attributeManager.addInstanced({
            instanceLineParallelIndex: {
                size: 1,
                accessor: 'getLineParallelIndex'
            },
            instanceLineAngle: {
                size: 1,
                accessor: 'getLineAngle'
            },
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

ForkLineLayer.layerName = 'ForkLineLayer';
ForkLineLayer.defaultProps = defaultProps;
