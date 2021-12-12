// Shader Created with Shadertoy -> https://www.shadertoy.com/view/ftdSRB

const SphericalMorphShader = {

	uniforms: {

		'tDiffuse': { value: null },
		'blur': { value: 2.0 },
        'blend': { value: 1.0 },
		'kernelSizeX': { value: 5 },
        'kernelSizeY': { value: 5 },
        'resolutionW': { value: 800.0 },
        'resolutionH': { value: 600.0 },
	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

    uniform float blur;

    uniform int kernelSizeX;

    uniform int kernelSizeY;

    uniform float resolutionW;

    uniform float resolutionH;

    uniform float blend;

    uniform sampler2D tDiffuse;
    
    varying vec2 vUv;

    vec2 cuv2uv(vec2 cuv){
        cuv.x *= resolutionH/resolutionW;
        return cuv + .5;
    }
    
    
    void main(){    

        vec2 uv = vUv;
        //uv.x /= resolutionW;
        //uv.y /= resolutionH;
        
        vec2 cuv = uv - .5;
        cuv.x = cuv.x*resolutionW/resolutionH;
        
        float mask = clamp(length(cuv)* blur*sin(blend), 0., 1.);
        
        vec3 finalColour = vec3(0.0);   

        int counter = 0;       
        
        vec2 tuv = clamp(cuv2uv(cuv - cuv * length(cuv) * .3 * sin(blend)), 0., 1.);
        
        for (int x=-kernelSizeX; x <= kernelSizeX; ++x){
           for (int y=-kernelSizeY; y <= kernelSizeY; ++y){      
                finalColour += texture(tDiffuse, tuv + vec2(float(x)/float(resolutionW), float(y)/float(resolutionH))).rgb;
                counter += 1;
            } 
        }
        
        finalColour = finalColour / float(counter);
        
        vec4 tex = texture(tDiffuse, tuv);
        
        finalColour = mix(tex.rgb, finalColour, mask);    
        
        gl_FragColor = vec4(finalColour, 1.0);
    }`

};

export { SphericalMorphShader };