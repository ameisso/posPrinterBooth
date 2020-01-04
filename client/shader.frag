#ifdef GL_ES
precision mediump float;
#endif

// grab texcoords from vert shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;
uniform float desat;

uniform float smoothCenter;
uniform float smoothDelta;

uniform bool invert;

float nrand( vec2 n )
{
	return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453 * (0.1+.001));
}

float n1rand( vec2 n )
{
	float nrnd0 = nrand( n + 1.0 );
	return nrnd0;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec2 uv = vTexCoord;
    vec4 tex = texture2D(tex0, uv);
	float N = n1rand(uv * 2.3);
 
	vec4 ditheredTex =  texture2D(tex0, uv);
	float desaturateTex = dot(vec3(0.3*desat,0.59*desat,0.11*desat),vec3(ditheredTex));
	desaturateTex = pow(1. - desaturateTex,1.);

	float min = smoothCenter-smoothDelta/2.;
	float max = smoothCenter+smoothDelta/2.;
   	desaturateTex = smoothstep(min,max, desaturateTex);
    
	vec3 final = vec3(step(desaturateTex,N)); 
if (invert){
	fragColor = vec4(1.-final,1);
}
else
{
	fragColor = vec4(final,1);
}
}

void main(void) {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}