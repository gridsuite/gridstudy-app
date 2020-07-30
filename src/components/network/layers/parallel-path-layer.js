/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {PathLayer} from "deck.gl";
import GL from '@luma.gl/constants';

const defaultProps = {
    getParallelAttribsOffsetAngleOrigin: {type: 'accessor', value: [0., 0., 1000.]},
    getDistanceBetweenLines: {type: 'accessor', value: 1000.},
    getMaxParallelOffset: {type: 'accessor', value: 1.},
    getPinParallelOffset: {type: 'accessor', value: 50.}
};

/**
 * A layer based on PathLayer allowing to shift path by an offset + angle
 * props : parallelAttribsOffsetAngleOrigin : [parallelIndex, lineAngle, moveOriginPoint]
 *         distanceBetweenLines
 *         maxParallelOffset
 *         minParallelOffset
 *
 * Note: the  parallelAttribsOffsetAngleOrigin are packed together in a single attribute to
 * workaround the low limit of the number of vertex attrbutes (16 on most platforms).
 * The PathLayer that this class extends already uses 13 attributes (14 with the dash extension),
 * so this leaves us with only 2 attribute slots.
 * Note2: packing the attributes together, in addition to not beeing very readable, also has the downside
 * that you can't update one attribute and reconstruct only its buffer, so it hurts performance in this case.
 */
export default class ParallelPathLayer extends PathLayer {

    getShaders() {
        const shaders = super.getShaders();
        shaders.inject = {
            'vs:#decl': `\
attribute vec3 parallelAttribsOffsetAngleOrigin;
uniform float distanceBetweenLines;
uniform float maxParallelOffset;
uniform float minParallelOffset;

`,
    'vs:#main-end': `\
      float instanceOffsets = parallelAttribsOffsetAngleOrigin.x;
      float angleLine = parallelAttribsOffsetAngleOrigin.y;
      float moveOriginPoint = parallelAttribsOffsetAngleOrigin.z;
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
            parallelAttribsOffsetAngleOrigin: {
                size: 3,
                type: GL.FLOAT,
                accessor: 'getParallelAttribsOffsetAngleOrigin'
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
