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
attribute vec2 start;
attribute float moveOriginPoint;
uniform float distanceBetweenLines;
uniform float maxParallelOffset;
uniform float minParallelOffset;

`,
    'vs:#main-end': `\
            if ( instanceOffsets == 0. ) return;
      
      float offsetPixels = clamp(project_pixel_size( distanceBetweenLines), minParallelOffset, maxParallelOffset );
      float radius = 6.1;
      float angleMove = angleLine ;
      vec4 trans = vec4(cos(angleMove), -sin(angleMove ), 0, 0.) * instanceOffsets ;
      float  x = sqrt( (radius* radius) - (instanceOffsets * instanceOffsets) ) / radius ;

      if( moveOriginPoint > 0.0 ) {
          if( isEnd > EPSILON ) {
              trans.x += x * sin(angleMove) ;
              trans.y += x * cos(angleMove) ;
          }
          else
          {
              trans.x -= x * sin(angleMove ) ;
              trans.y -= x * cos(angleMove ) ;
          }
      }
      trans = project_common_position_to_clipspace( trans )   ;
             
      gl_Position += ( trans   ) * project_size_to_pixel(offsetPixels);
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
                accessor: 'getLineAngle'},
            moveOriginPoint: {
                size: 1,
                accessor:'getMoveOriginPoint',
            }
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
