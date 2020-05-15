export default `\
#version 300 es
#define SHADER_NAME arrow-layer-vertex-shader

in vec3 positions;

in float instanceSize;
in float instanceArrowDistance;
in vec4 instanceColor;
in float instanceSpeedFactor;
in int instanceLinePositionsTextureOffset;
in int instanceLineDistancesTextureOffset;
in int instanceLinePointCount;
in float instanceLineDistance;
in float instanceArrowDirection;

uniform float sizeMinPixels;
uniform float sizeMaxPixels;
uniform float timestamp;
uniform sampler2D linePositionsTexture;
uniform sampler2D lineDistancesTexture;
uniform float maxTextureSize;

out vec4 vFillColor;
out float shouldDiscard;

/**
 * Calculate 2 dimensions texture index from flat index. 
 */
ivec2 calulateTextureIndex(int flatIndex) {
  int x = int(mod(float(flatIndex), maxTextureSize));
  int y = int(trunc(float(flatIndex) / maxTextureSize));
  return ivec2(x, y);
}

/**
 * Fetch WGS84 position from texture for a given point of the line.  
 */
vec3 fetchLinePosition(int point) {
  int flatIndex = instanceLinePositionsTextureOffset + point;
  ivec2 textureIndex = calulateTextureIndex(flatIndex); 
  return vec3(texelFetch(linePositionsTexture, textureIndex, 0).xy, 0);
}

/**
 * Fetch distance (in meters from the start of the line) from texture for a point of the line.  
 */
float fetchLineDistance(int point) {
  int flatIndex = instanceLineDistancesTextureOffset + point;
  ivec2 textureIndex = calulateTextureIndex(flatIndex);
  return texelFetch(lineDistancesTexture, textureIndex, 0).x;
}

/**            
 * Find the first point of the line that is after a given distance from the start (first line point).
 * (implemented using a binary search)
 * The returned value is always between 1 and instanceLinePointCount - 1, even if the searched distance is out of bounds
 * Here are example returned values for a path having points at distance 0.0, 10.0, 20.0
 * -1 => 1
 *  0 => 1
 *  1 => 1
 *  9 => 1
 *  10 => 2
 *  11 => 2
 *  19 => 2
 *  20 => 2
 *  21 => 2
 */
int findFirstLinePointAfterDistance(float distance) {
  int firstPoint = 0;
  int lastPoint = instanceLinePointCount - 1;
  
  // variable length loops are not supported in GLSL, instanceLinePointCount is an upper bound that
  // will never be reached as binary search complexity is in O(log(instanceLinePointCount))
  for (int i = 0; i < instanceLinePointCount; i++) {
      if (firstPoint + 1 == lastPoint) {
          return lastPoint; 
      }   
      int middlePoint = (firstPoint + lastPoint) / 2;           
      float middlePointDistance = fetchLineDistance(middlePoint);      
      if (middlePointDistance <= distance) {
         firstPoint = middlePoint;
      } else {
         lastPoint = middlePoint;                            
      }  
  }   
} 

mat3 calculateRotation(vec3 commonPosition1, vec3 commonPosition2) {
  float angle = atan(commonPosition1.x - commonPosition2.x, commonPosition1.y - commonPosition2.y);
  if (instanceArrowDirection < 2.0) {
      angle += radians(180.0);
  }
  return mat3(cos(angle),  sin(angle),  0,
              -sin(angle), cos(angle),  0,
              0,           0,           0);
}

void main(void) {
  if (instanceArrowDirection < 1.0) {
      vFillColor = vec4(0, 0, 0, 0);
      shouldDiscard = 1.0;
  } else {
      // arrow distance from the line start shifted with current timestamp
      // instanceArrowDistance: a float in interval [0,1] describing the initial position of the arrow along the full path between two substations (0: begin, 1.0 end)
      float arrowDistance = mod(instanceLineDistance * instanceArrowDistance + (instanceArrowDirection < 2.0 ? 1.0 : -1.0) * timestamp * instanceSpeedFactor, instanceLineDistance);
    
      // look for first line point that is after arrow distance
      int linePoint = findFirstLinePointAfterDistance(arrowDistance);
    
      // position for the line point just before the arrow
      vec3 linePosition1 = fetchLinePosition(linePoint - 1);
    
      // position for the line point just after the arrow
      vec3 linePosition2 = fetchLinePosition(linePoint);
    
      // clamp to arrow size limits
      float sizePixels = clamp(project_size_to_pixel(instanceSize), sizeMinPixels, sizeMaxPixels);

      // project the 2 line points position to common space 
      vec3 position64Low = vec3(0, 0, 0);
      vec3 commonPosition1 = project_position(linePosition1, position64Low);
      vec3 commonPosition2 = project_position(linePosition2, position64Low);

      // calculate arrow position in the common space by interpolating the 2 line points position 
      float lineDistance1 = fetchLineDistance(linePoint - 1);
      float lineDistance2 = fetchLineDistance(linePoint);
      float interpolationValue = (arrowDistance - lineDistance1) / (lineDistance2 - lineDistance1);    
      vec3 arrowPosition = mix(commonPosition1, commonPosition2, interpolationValue);  

      // calculate rotation angle for aligning the arrow with the line segment
      // it has to be done in the common space to get the right angle!!!
      mat3 rotation = calculateRotation(commonPosition1, commonPosition2);
 
      // calculate vertex position in the clipspace
      vec3 offset = positions * project_pixel_size(sizePixels) * rotation;
      vec4 vertexPosition = project_common_position_to_clipspace(vec4(arrowPosition + offset, 1)); 

      // vertex shader output
      gl_Position = vertexPosition;

      // arrow fill color for fragment shader 
      vFillColor = instanceColor;
      shouldDiscard = 0.0;
  }
}
`;
