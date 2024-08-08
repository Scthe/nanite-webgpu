(()=>{var Mu=Object.create;var Pa=Object.defineProperty;var Su=Object.getOwnPropertyDescriptor;var Pu=Object.getOwnPropertyNames;var Tu=Object.getPrototypeOf,Au=Object.prototype.hasOwnProperty;var Ta=(n=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(n,{get:(e,t)=>(typeof require<"u"?require:e)[t]}):n)(function(n){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+n+'" is not supported')});var Iu=(n,e)=>()=>(e||n((e={exports:{}}).exports,e),e.exports);var Ru=(n,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of Pu(e))!Au.call(n,o)&&o!==t&&Pa(n,o,{get:()=>e[o],enumerable:!(r=Su(e,o))||r.enumerable});return n};var Cu=(n,e,t)=>(t=n!=null?Mu(Tu(n)):{},Ru(e||!n||!n.__esModule?Pa(t,"default",{value:n,enumerable:!0}):t,n));var pu=Iu((exports,module)=>{(function(n,e){if(typeof exports=="object"&&typeof module=="object")module.exports=e();else if(typeof define=="function"&&define.amd)define([],e);else{var t=e();for(var r in t)(typeof exports=="object"?exports:n)[r]=t[r]}})(typeof self<"u"?self:exports,function(){return function(n){var e={};function t(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return n[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}return t.m=n,t.c=e,t.d=function(r,o,i){t.o(r,o)||Object.defineProperty(r,o,{enumerable:!0,get:i})},t.r=function(r){typeof Symbol<"u"&&Symbol.toStringTag&&Object.defineProperty(r,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(r,"__esModule",{value:!0})},t.t=function(r,o){if(1&o&&(r=t(r)),8&o||4&o&&typeof r=="object"&&r&&r.__esModule)return r;var i=Object.create(null);if(t.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:r}),2&o&&typeof r!="string")for(var l in r)t.d(i,l,(function(c){return r[c]}).bind(null,l));return i},t.n=function(r){var o=r&&r.__esModule?function(){return r.default}:function(){return r};return t.d(o,"a",o),o},t.o=function(r,o){return Object.prototype.hasOwnProperty.call(r,o)},t.p="/",t(t.s=0)}({"./src/index.ts":function(module,__webpack_exports__,__webpack_require__){"use strict";eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OBJ", function() { return OBJ; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "version", function() { return version; });
/* harmony import */ var _mesh__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mesh */ "./src/mesh.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Mesh", function() { return _mesh__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _material__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./material */ "./src/material.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Material", function() { return _material__WEBPACK_IMPORTED_MODULE_1__["Material"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MaterialLibrary", function() { return _material__WEBPACK_IMPORTED_MODULE_1__["MaterialLibrary"]; });

/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./layout */ "./src/layout.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Attribute", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["Attribute"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DuplicateAttributeException", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["DuplicateAttributeException"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Layout", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["Layout"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TYPES", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["TYPES"]; });

/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "downloadModels", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["downloadModels"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "downloadMeshes", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["downloadMeshes"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "initMeshBuffers", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["initMeshBuffers"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "deleteMeshBuffers", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["deleteMeshBuffers"]; });





const version = "2.0.3";
const OBJ = {
    Attribute: _layout__WEBPACK_IMPORTED_MODULE_2__["Attribute"],
    DuplicateAttributeException: _layout__WEBPACK_IMPORTED_MODULE_2__["DuplicateAttributeException"],
    Layout: _layout__WEBPACK_IMPORTED_MODULE_2__["Layout"],
    Material: _material__WEBPACK_IMPORTED_MODULE_1__["Material"],
    MaterialLibrary: _material__WEBPACK_IMPORTED_MODULE_1__["MaterialLibrary"],
    Mesh: _mesh__WEBPACK_IMPORTED_MODULE_0__["default"],
    TYPES: _layout__WEBPACK_IMPORTED_MODULE_2__["TYPES"],
    downloadModels: _utils__WEBPACK_IMPORTED_MODULE_3__["downloadModels"],
    downloadMeshes: _utils__WEBPACK_IMPORTED_MODULE_3__["downloadMeshes"],
    initMeshBuffers: _utils__WEBPACK_IMPORTED_MODULE_3__["initMeshBuffers"],
    deleteMeshBuffers: _utils__WEBPACK_IMPORTED_MODULE_3__["deleteMeshBuffers"],
    version,
};
/**
 * @namespace
 */



//# sourceURL=webpack:///./src/index.ts?`)},"./src/layout.ts":function(module,__webpack_exports__,__webpack_require__){"use strict";eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TYPES", function() { return TYPES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DuplicateAttributeException", function() { return DuplicateAttributeException; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Attribute", function() { return Attribute; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Layout", function() { return Layout; });
var TYPES;
(function (TYPES) {
    TYPES["BYTE"] = "BYTE";
    TYPES["UNSIGNED_BYTE"] = "UNSIGNED_BYTE";
    TYPES["SHORT"] = "SHORT";
    TYPES["UNSIGNED_SHORT"] = "UNSIGNED_SHORT";
    TYPES["FLOAT"] = "FLOAT";
})(TYPES || (TYPES = {}));
/**
 * An exception for when two or more of the same attributes are found in the
 * same layout.
 * @private
 */
class DuplicateAttributeException extends Error {
    /**
     * Create a DuplicateAttributeException
     * @param {Attribute} attribute - The attribute that was found more than
     *        once in the {@link Layout}
     */
    constructor(attribute) {
        super(\`found duplicate attribute: \${attribute.key}\`);
    }
}
/**
 * Represents how a vertex attribute should be packed into an buffer.
 * @private
 */
class Attribute {
    /**
     * Create an attribute. Do not call this directly, use the predefined
     * constants.
     * @param {string} key - The name of this attribute as if it were a key in
     *        an Object. Use the camel case version of the upper snake case
     *        const name.
     * @param {number} size - The number of components per vertex attribute.
     *        Must be 1, 2, 3, or 4.
     * @param {string} type - The data type of each component for this
     *        attribute. Possible values:<br/>
     *        "BYTE": signed 8-bit integer, with values in [-128, 127]<br/>
     *        "SHORT": signed 16-bit integer, with values in
     *            [-32768, 32767]<br/>
     *        "UNSIGNED_BYTE": unsigned 8-bit integer, with values in
     *            [0, 255]<br/>
     *        "UNSIGNED_SHORT": unsigned 16-bit integer, with values in
     *            [0, 65535]<br/>
     *        "FLOAT": 32-bit floating point number
     * @param {boolean} normalized - Whether integer data values should be
     *        normalized when being casted to a float.<br/>
     *        If true, signed integers are normalized to [-1, 1].<br/>
     *        If true, unsigned integers are normalized to [0, 1].<br/>
     *        For type "FLOAT", this parameter has no effect.
     */
    constructor(key, size, type, normalized = false) {
        this.key = key;
        this.size = size;
        this.type = type;
        this.normalized = normalized;
        switch (type) {
            case "BYTE":
            case "UNSIGNED_BYTE":
                this.sizeOfType = 1;
                break;
            case "SHORT":
            case "UNSIGNED_SHORT":
                this.sizeOfType = 2;
                break;
            case "FLOAT":
                this.sizeOfType = 4;
                break;
            default:
                throw new Error(\`Unknown gl type: \${type}\`);
        }
        this.sizeInBytes = this.sizeOfType * size;
    }
}
/**
 * A class to represent the memory layout for a vertex attribute array. Used by
 * {@link Mesh}'s TBD(...) method to generate a packed array from mesh data.
 * <p>
 * Layout can sort of be thought of as a C-style struct declaration.
 * {@link Mesh}'s TBD(...) method will use the {@link Layout} instance to
 * pack an array in the given attribute order.
 * <p>
 * Layout also is very helpful when calling a WebGL context's
 * <code>vertexAttribPointer</code> method. If you've created a buffer using
 * a Layout instance, then the same Layout instance can be used to determine
 * the size, type, normalized, stride, and offset parameters for
 * <code>vertexAttribPointer</code>.
 * <p>
 * For example:
 * <pre><code>
 *
 * const index = glctx.getAttribLocation(shaderProgram, "pos");
 * glctx.vertexAttribPointer(
 *   layout.position.size,
 *   glctx[layout.position.type],
 *   layout.position.normalized,
 *   layout.position.stride,
 *   layout.position.offset);
 * </code></pre>
 * @see {@link Mesh}
 */
class Layout {
    /**
     * Create a Layout object. This constructor will throw if any duplicate
     * attributes are given.
     * @param {Array} ...attributes - An ordered list of attributes that
     *        describe the desired memory layout for each vertex attribute.
     *        <p>
     *
     * @see {@link Mesh}
     */
    constructor(...attributes) {
        this.attributes = attributes;
        this.attributeMap = {};
        let offset = 0;
        let maxStrideMultiple = 0;
        for (const attribute of attributes) {
            if (this.attributeMap[attribute.key]) {
                throw new DuplicateAttributeException(attribute);
            }
            // Add padding to satisfy WebGL's requirement that all
            // vertexAttribPointer calls have an offset that is a multiple of
            // the type size.
            if (offset % attribute.sizeOfType !== 0) {
                offset += attribute.sizeOfType - (offset % attribute.sizeOfType);
                console.warn("Layout requires padding before " + attribute.key + " attribute");
            }
            this.attributeMap[attribute.key] = {
                attribute: attribute,
                size: attribute.size,
                type: attribute.type,
                normalized: attribute.normalized,
                offset: offset,
            };
            offset += attribute.sizeInBytes;
            maxStrideMultiple = Math.max(maxStrideMultiple, attribute.sizeOfType);
        }
        // Add padding to the end to satisfy WebGL's requirement that all
        // vertexAttribPointer calls have a stride that is a multiple of the
        // type size. Because we're putting differently sized attributes into
        // the same buffer, it must be padded to a multiple of the largest
        // type size.
        if (offset % maxStrideMultiple !== 0) {
            offset += maxStrideMultiple - (offset % maxStrideMultiple);
            console.warn("Layout requires padding at the back");
        }
        this.stride = offset;
        for (const attribute of attributes) {
            this.attributeMap[attribute.key].stride = this.stride;
        }
    }
}
// Geometry attributes
/**
 * Attribute layout to pack a vertex's x, y, & z as floats
 *
 * @see {@link Layout}
 */
Layout.POSITION = new Attribute("position", 3, TYPES.FLOAT);
/**
 * Attribute layout to pack a vertex's normal's x, y, & z as floats
 *
 * @see {@link Layout}
 */
Layout.NORMAL = new Attribute("normal", 3, TYPES.FLOAT);
/**
 * Attribute layout to pack a vertex's normal's x, y, & z as floats.
 * <p>
 * This value will be computed on-the-fly based on the texture coordinates.
 * If no texture coordinates are available, the generated value will default to
 * 0, 0, 0.
 *
 * @see {@link Layout}
 */
Layout.TANGENT = new Attribute("tangent", 3, TYPES.FLOAT);
/**
 * Attribute layout to pack a vertex's normal's bitangent x, y, & z as floats.
 * <p>
 * This value will be computed on-the-fly based on the texture coordinates.
 * If no texture coordinates are available, the generated value will default to
 * 0, 0, 0.
 * @see {@link Layout}
 */
Layout.BITANGENT = new Attribute("bitangent", 3, TYPES.FLOAT);
/**
 * Attribute layout to pack a vertex's texture coordinates' u & v as floats
 *
 * @see {@link Layout}
 */
Layout.UV = new Attribute("uv", 2, TYPES.FLOAT);
// Material attributes
/**
 * Attribute layout to pack an unsigned short to be interpreted as a the index
 * into a {@link Mesh}'s materials list.
 * <p>
 * The intention of this value is to send all of the {@link Mesh}'s materials
 * into multiple shader uniforms and then reference the current one by this
 * vertex attribute.
 * <p>
 * example glsl code:
 *
 * <pre><code>
 *  // this is bound using MATERIAL_INDEX
 *  attribute int materialIndex;
 *
 *  struct Material {
 *    vec3 diffuse;
 *    vec3 specular;
 *    vec3 specularExponent;
 *  };
 *
 *  uniform Material materials[MAX_MATERIALS];
 *
 *  // ...
 *
 *  vec3 diffuse = materials[materialIndex];
 *
 * </code></pre>
 * TODO: More description & test to make sure subscripting by attributes even
 * works for webgl
 *
 * @see {@link Layout}
 */
Layout.MATERIAL_INDEX = new Attribute("materialIndex", 1, TYPES.SHORT);
Layout.MATERIAL_ENABLED = new Attribute("materialEnabled", 1, TYPES.UNSIGNED_SHORT);
Layout.AMBIENT = new Attribute("ambient", 3, TYPES.FLOAT);
Layout.DIFFUSE = new Attribute("diffuse", 3, TYPES.FLOAT);
Layout.SPECULAR = new Attribute("specular", 3, TYPES.FLOAT);
Layout.SPECULAR_EXPONENT = new Attribute("specularExponent", 3, TYPES.FLOAT);
Layout.EMISSIVE = new Attribute("emissive", 3, TYPES.FLOAT);
Layout.TRANSMISSION_FILTER = new Attribute("transmissionFilter", 3, TYPES.FLOAT);
Layout.DISSOLVE = new Attribute("dissolve", 1, TYPES.FLOAT);
Layout.ILLUMINATION = new Attribute("illumination", 1, TYPES.UNSIGNED_SHORT);
Layout.REFRACTION_INDEX = new Attribute("refractionIndex", 1, TYPES.FLOAT);
Layout.SHARPNESS = new Attribute("sharpness", 1, TYPES.FLOAT);
Layout.MAP_DIFFUSE = new Attribute("mapDiffuse", 1, TYPES.SHORT);
Layout.MAP_AMBIENT = new Attribute("mapAmbient", 1, TYPES.SHORT);
Layout.MAP_SPECULAR = new Attribute("mapSpecular", 1, TYPES.SHORT);
Layout.MAP_SPECULAR_EXPONENT = new Attribute("mapSpecularExponent", 1, TYPES.SHORT);
Layout.MAP_DISSOLVE = new Attribute("mapDissolve", 1, TYPES.SHORT);
Layout.ANTI_ALIASING = new Attribute("antiAliasing", 1, TYPES.UNSIGNED_SHORT);
Layout.MAP_BUMP = new Attribute("mapBump", 1, TYPES.SHORT);
Layout.MAP_DISPLACEMENT = new Attribute("mapDisplacement", 1, TYPES.SHORT);
Layout.MAP_DECAL = new Attribute("mapDecal", 1, TYPES.SHORT);
Layout.MAP_EMISSIVE = new Attribute("mapEmissive", 1, TYPES.SHORT);


//# sourceURL=webpack:///./src/layout.ts?`)},"./src/material.ts":function(module,__webpack_exports__,__webpack_require__){"use strict";eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Material", function() { return Material; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MaterialLibrary", function() { return MaterialLibrary; });
/**
 * The Material class.
 */
class Material {
    constructor(name) {
        this.name = name;
        /**
         * Constructor
         * @param {String} name the unique name of the material
         */
        // The values for the following attibutes
        // are an array of R, G, B normalized values.
        // Ka - Ambient Reflectivity
        this.ambient = [0, 0, 0];
        // Kd - Defuse Reflectivity
        this.diffuse = [0, 0, 0];
        // Ks
        this.specular = [0, 0, 0];
        // Ke
        this.emissive = [0, 0, 0];
        // Tf
        this.transmissionFilter = [0, 0, 0];
        // d
        this.dissolve = 0;
        // valid range is between 0 and 1000
        this.specularExponent = 0;
        // either d or Tr; valid values are normalized
        this.transparency = 0;
        // illum - the enum of the illumination model to use
        this.illumination = 0;
        // Ni - Set to "normal" (air).
        this.refractionIndex = 1;
        // sharpness
        this.sharpness = 0;
        // map_Kd
        this.mapDiffuse = emptyTextureOptions();
        // map_Ka
        this.mapAmbient = emptyTextureOptions();
        // map_Ks
        this.mapSpecular = emptyTextureOptions();
        // map_Ns
        this.mapSpecularExponent = emptyTextureOptions();
        // map_d
        this.mapDissolve = emptyTextureOptions();
        // map_aat
        this.antiAliasing = false;
        // map_bump or bump
        this.mapBump = emptyTextureOptions();
        // disp
        this.mapDisplacement = emptyTextureOptions();
        // decal
        this.mapDecal = emptyTextureOptions();
        // map_Ke
        this.mapEmissive = emptyTextureOptions();
        // refl - when the reflection type is a cube, there will be multiple refl
        //        statements for each side of the cube. If it's a spherical
        //        reflection, there should only ever be one.
        this.mapReflections = [];
    }
}
const SENTINEL_MATERIAL = new Material("sentinel");
/**
 * https://en.wikipedia.org/wiki/Wavefront_.obj_file
 * http://paulbourke.net/dataformats/mtl/
 */
class MaterialLibrary {
    constructor(data) {
        this.data = data;
        /**
         * Constructs the Material Parser
         * @param mtlData the MTL file contents
         */
        this.currentMaterial = SENTINEL_MATERIAL;
        this.materials = {};
        this.parse();
    }
    /* eslint-disable camelcase */
    /* the function names here disobey camelCase conventions
     to make parsing/routing easier. see the parse function
     documentation for more information. */
    /**
     * Creates a new Material object and adds to the registry.
     * @param tokens the tokens associated with the directive
     */
    parse_newmtl(tokens) {
        const name = tokens[0];
        // console.info('Parsing new Material:', name);
        this.currentMaterial = new Material(name);
        this.materials[name] = this.currentMaterial;
    }
    /**
     * See the documenation for parse_Ka below for a better understanding.
     *
     * Given a list of possible color tokens, returns an array of R, G, and B
     * color values.
     *
     * @param tokens the tokens associated with the directive
     * @return {*} a 3 element array containing the R, G, and B values
     * of the color.
     */
    parseColor(tokens) {
        if (tokens[0] == "spectral") {
            throw new Error("The MTL parser does not support spectral curve files. You will " +
                "need to convert the MTL colors to either RGB or CIEXYZ.");
        }
        if (tokens[0] == "xyz") {
            throw new Error("The MTL parser does not currently support XYZ colors. Either convert the " +
                "XYZ values to RGB or create an issue to add support for XYZ");
        }
        // from my understanding of the spec, RGB values at this point
        // will either be 3 floats or exactly 1 float, so that's the check
        // that i'm going to perform here
        if (tokens.length == 3) {
            const [x, y, z] = tokens;
            return [parseFloat(x), parseFloat(y), parseFloat(z)];
        }
        // Since tokens at this point has a length of 3, we're going to assume
        // it's exactly 1, skipping the check for 2.
        const value = parseFloat(tokens[0]);
        // in this case, all values are equivalent
        return [value, value, value];
    }
    /**
     * Parse the ambient reflectivity
     *
     * A Ka directive can take one of three forms:
     *   - Ka r g b
     *   - Ka spectral file.rfl
     *   - Ka xyz x y z
     * These three forms are mutually exclusive in that only one
     * declaration can exist per material. It is considered a syntax
     * error otherwise.
     *
     * The "Ka" form specifies the ambient reflectivity using RGB values.
     * The "g" and "b" values are optional. If only the "r" value is
     * specified, then the "g" and "b" values are assigned the value of
     * "r". Values are normally in the range 0.0 to 1.0. Values outside
     * of this range increase or decrease the reflectivity accordingly.
     *
     * The "Ka spectral" form specifies the ambient reflectivity using a
     * spectral curve. "file.rfl" is the name of the ".rfl" file containing
     * the curve data. "factor" is an optional argument which is a multiplier
     * for the values in the .rfl file and defaults to 1.0 if not specified.
     *
     * The "Ka xyz" form specifies the ambient reflectivity using CIEXYZ values.
     * "x y z" are the values of the CIEXYZ color space. The "y" and "z" arguments
     * are optional and take on the value of the "x" component if only "x" is
     * specified. The "x y z" values are normally in the range of 0.0 to 1.0 and
     * increase or decrease ambient reflectivity accordingly outside of that
     * range.
     *
     * @param tokens the tokens associated with the directive
     */
    parse_Ka(tokens) {
        this.currentMaterial.ambient = this.parseColor(tokens);
    }
    /**
     * Diffuse Reflectivity
     *
     * Similar to the Ka directive. Simply replace "Ka" with "Kd" and the rules
     * are the same
     *
     * @param tokens the tokens associated with the directive
     */
    parse_Kd(tokens) {
        this.currentMaterial.diffuse = this.parseColor(tokens);
    }
    /**
     * Spectral Reflectivity
     *
     * Similar to the Ka directive. Simply replace "Ks" with "Kd" and the rules
     * are the same
     *
     * @param tokens the tokens associated with the directive
     */
    parse_Ks(tokens) {
        this.currentMaterial.specular = this.parseColor(tokens);
    }
    /**
     * Emissive
     *
     * The amount and color of light emitted by the object.
     *
     * @param tokens the tokens associated with the directive
     */
    parse_Ke(tokens) {
        this.currentMaterial.emissive = this.parseColor(tokens);
    }
    /**
     * Transmission Filter
     *
     * Any light passing through the object is filtered by the transmission
     * filter, which only allows specific colors to pass through. For example, Tf
     * 0 1 0 allows all of the green to pass through and filters out all of the
     * red and blue.
     *
     * Similar to the Ka directive. Simply replace "Ks" with "Tf" and the rules
     * are the same
     *
     * @param tokens the tokens associated with the directive
     */
    parse_Tf(tokens) {
        this.currentMaterial.transmissionFilter = this.parseColor(tokens);
    }
    /**
     * Specifies the dissolve for the current material.
     *
     * Statement: d [-halo] \`factor\`
     *
     * Example: "d 0.5"
     *
     * The factor is the amount this material dissolves into the background. A
     * factor of 1.0 is fully opaque. This is the default when a new material is
     * created. A factor of 0.0 is fully dissolved (completely transparent).
     *
     * Unlike a real transparent material, the dissolve does not depend upon
     * material thickness nor does it have any spectral character. Dissolve works
     * on all illumination models.
     *
     * The dissolve statement allows for an optional "-halo" flag which indicates
     * that a dissolve is dependent on the surface orientation relative to the
     * viewer. For example, a sphere with the following dissolve, "d -halo 0.0",
     * will be fully dissolved at its center and will appear gradually more opaque
     * toward its edge.
     *
     * "factor" is the minimum amount of dissolve applied to the material. The
     * amount of dissolve will vary between 1.0 (fully opaque) and the specified
     * "factor". The formula is:
     *
     *    dissolve = 1.0 - (N*v)(1.0-factor)
     *
     * @param tokens the tokens associated with the directive
     */
    parse_d(tokens) {
        // this ignores the -halo option as I can't find any documentation on what
        // it's supposed to be.
        this.currentMaterial.dissolve = parseFloat(tokens.pop() || "0");
    }
    /**
     * The "illum" statement specifies the illumination model to use in the
     * material. Illumination models are mathematical equations that represent
     * various material lighting and shading effects.
     *
     * The illumination number can be a number from 0 to 10. The following are
     * the list of illumination enumerations and their summaries:
     * 0. Color on and Ambient off
     * 1. Color on and Ambient on
     * 2. Highlight on
     * 3. Reflection on and Ray trace on
     * 4. Transparency: Glass on, Reflection: Ray trace on
     * 5. Reflection: Fresnel on and Ray trace on
     * 6. Transparency: Refraction on, Reflection: Fresnel off and Ray trace on
     * 7. Transparency: Refraction on, Reflection: Fresnel on and Ray trace on
     * 8. Reflection on and Ray trace off
     * 9. Transparency: Glass on, Reflection: Ray trace off
     * 10. Casts shadows onto invisible surfaces
     *
     * Example: "illum 2" to specify the "Highlight on" model
     *
     * @param tokens the tokens associated with the directive
     */
    parse_illum(tokens) {
        this.currentMaterial.illumination = parseInt(tokens[0]);
    }
    /**
     * Optical Density (AKA Index of Refraction)
     *
     * Statement: Ni \`index\`
     *
     * Example: Ni 1.0
     *
     * Specifies the optical density for the surface. \`index\` is the value
     * for the optical density. The values can range from 0.001 to 10.  A value of
     * 1.0 means that light does not bend as it passes through an object.
     * Increasing the optical_density increases the amount of bending. Glass has
     * an index of refraction of about 1.5. Values of less than 1.0 produce
     * bizarre results and are not recommended
     *
     * @param tokens the tokens associated with the directive
     */
    parse_Ni(tokens) {
        this.currentMaterial.refractionIndex = parseFloat(tokens[0]);
    }
    /**
     * Specifies the specular exponent for the current material. This defines the
     * focus of the specular highlight.
     *
     * Statement: Ns \`exponent\`
     *
     * Example: "Ns 250"
     *
     * \`exponent\` is the value for the specular exponent. A high exponent results
     * in a tight, concentrated highlight. Ns Values normally range from 0 to
     * 1000.
     *
     * @param tokens the tokens associated with the directive
     */
    parse_Ns(tokens) {
        this.currentMaterial.specularExponent = parseInt(tokens[0]);
    }
    /**
     * Specifies the sharpness of the reflections from the local reflection map.
     *
     * Statement: sharpness \`value\`
     *
     * Example: "sharpness 100"
     *
     * If a material does not have a local reflection map defined in its material
     * defintions, sharpness will apply to the global reflection map defined in
     * PreView.
     *
     * \`value\` can be a number from 0 to 1000. The default is 60. A high value
     * results in a clear reflection of objects in the reflection map.
     *
     * Tip: sharpness values greater than 100 introduce aliasing effects in
     * flat surfaces that are viewed at a sharp angle.
     *
     * @param tokens the tokens associated with the directive
     */
    parse_sharpness(tokens) {
        this.currentMaterial.sharpness = parseInt(tokens[0]);
    }
    /**
     * Parses the -cc flag and updates the options object with the values.
     *
     * @param values the values passed to the -cc flag
     * @param options the Object of all image options
     */
    parse_cc(values, options) {
        options.colorCorrection = values[0] == "on";
    }
    /**
     * Parses the -blendu flag and updates the options object with the values.
     *
     * @param values the values passed to the -blendu flag
     * @param options the Object of all image options
     */
    parse_blendu(values, options) {
        options.horizontalBlending = values[0] == "on";
    }
    /**
     * Parses the -blendv flag and updates the options object with the values.
     *
     * @param values the values passed to the -blendv flag
     * @param options the Object of all image options
     */
    parse_blendv(values, options) {
        options.verticalBlending = values[0] == "on";
    }
    /**
     * Parses the -boost flag and updates the options object with the values.
     *
     * @param values the values passed to the -boost flag
     * @param options the Object of all image options
     */
    parse_boost(values, options) {
        options.boostMipMapSharpness = parseFloat(values[0]);
    }
    /**
     * Parses the -mm flag and updates the options object with the values.
     *
     * @param values the values passed to the -mm flag
     * @param options the Object of all image options
     */
    parse_mm(values, options) {
        options.modifyTextureMap.brightness = parseFloat(values[0]);
        options.modifyTextureMap.contrast = parseFloat(values[1]);
    }
    /**
     * Parses and sets the -o, -s, and -t  u, v, and w values
     *
     * @param values the values passed to the -o, -s, -t flag
     * @param {Object} option the Object of either the -o, -s, -t option
     * @param {Integer} defaultValue the Object of all image options
     */
    parse_ost(values, option, defaultValue) {
        while (values.length < 3) {
            values.push(defaultValue.toString());
        }
        option.u = parseFloat(values[0]);
        option.v = parseFloat(values[1]);
        option.w = parseFloat(values[2]);
    }
    /**
     * Parses the -o flag and updates the options object with the values.
     *
     * @param values the values passed to the -o flag
     * @param options the Object of all image options
     */
    parse_o(values, options) {
        this.parse_ost(values, options.offset, 0);
    }
    /**
     * Parses the -s flag and updates the options object with the values.
     *
     * @param values the values passed to the -s flag
     * @param options the Object of all image options
     */
    parse_s(values, options) {
        this.parse_ost(values, options.scale, 1);
    }
    /**
     * Parses the -t flag and updates the options object with the values.
     *
     * @param values the values passed to the -t flag
     * @param options the Object of all image options
     */
    parse_t(values, options) {
        this.parse_ost(values, options.turbulence, 0);
    }
    /**
     * Parses the -texres flag and updates the options object with the values.
     *
     * @param values the values passed to the -texres flag
     * @param options the Object of all image options
     */
    parse_texres(values, options) {
        options.textureResolution = parseFloat(values[0]);
    }
    /**
     * Parses the -clamp flag and updates the options object with the values.
     *
     * @param values the values passed to the -clamp flag
     * @param options the Object of all image options
     */
    parse_clamp(values, options) {
        options.clamp = values[0] == "on";
    }
    /**
     * Parses the -bm flag and updates the options object with the values.
     *
     * @param values the values passed to the -bm flag
     * @param options the Object of all image options
     */
    parse_bm(values, options) {
        options.bumpMultiplier = parseFloat(values[0]);
    }
    /**
     * Parses the -imfchan flag and updates the options object with the values.
     *
     * @param values the values passed to the -imfchan flag
     * @param options the Object of all image options
     */
    parse_imfchan(values, options) {
        options.imfChan = values[0];
    }
    /**
     * This only exists for relection maps and denotes the type of reflection.
     *
     * @param values the values passed to the -type flag
     * @param options the Object of all image options
     */
    parse_type(values, options) {
        options.reflectionType = values[0];
    }
    /**
     * Parses the texture's options and returns an options object with the info
     *
     * @param tokens all of the option tokens to pass to the texture
     * @return {Object} a complete object of objects to apply to the texture
     */
    parseOptions(tokens) {
        const options = emptyTextureOptions();
        let option;
        let values;
        const optionsToValues = {};
        tokens.reverse();
        while (tokens.length) {
            // token is guaranteed to exists here, hence the explicit "as"
            const token = tokens.pop();
            if (token.startsWith("-")) {
                option = token.substr(1);
                optionsToValues[option] = [];
            }
            else if (option) {
                optionsToValues[option].push(token);
            }
        }
        for (option in optionsToValues) {
            if (!optionsToValues.hasOwnProperty(option)) {
                continue;
            }
            values = optionsToValues[option];
            const optionMethod = this[\`parse_\${option}\`];
            if (optionMethod) {
                optionMethod.bind(this)(values, options);
            }
        }
        return options;
    }
    /**
     * Parses the given texture map line.
     *
     * @param tokens all of the tokens representing the texture
     * @return a complete object of objects to apply to the texture
     */
    parseMap(tokens) {
        // according to wikipedia:
        // (https://en.wikipedia.org/wiki/Wavefront_.obj_file#Vendor_specific_alterations)
        // there is at least one vendor that places the filename before the options
        // rather than after (which is to spec). All options start with a '-'
        // so if the first token doesn't start with a '-', we're going to assume
        // it's the name of the map file.
        let optionsString;
        let filename = "";
        if (!tokens[0].startsWith("-")) {
            [filename, ...optionsString] = tokens;
        }
        else {
            filename = tokens.pop();
            optionsString = tokens;
        }
        const options = this.parseOptions(optionsString);
        options.filename = filename.replace(/\\\\/g, "/");
        return options;
    }
    /**
     * Parses the ambient map.
     *
     * @param tokens list of tokens for the map_Ka direcive
     */
    parse_map_Ka(tokens) {
        this.currentMaterial.mapAmbient = this.parseMap(tokens);
    }
    /**
     * Parses the diffuse map.
     *
     * @param tokens list of tokens for the map_Kd direcive
     */
    parse_map_Kd(tokens) {
        this.currentMaterial.mapDiffuse = this.parseMap(tokens);
    }
    /**
     * Parses the specular map.
     *
     * @param tokens list of tokens for the map_Ks direcive
     */
    parse_map_Ks(tokens) {
        this.currentMaterial.mapSpecular = this.parseMap(tokens);
    }
    /**
     * Parses the emissive map.
     *
     * @param tokens list of tokens for the map_Ke direcive
     */
    parse_map_Ke(tokens) {
        this.currentMaterial.mapEmissive = this.parseMap(tokens);
    }
    /**
     * Parses the specular exponent map.
     *
     * @param tokens list of tokens for the map_Ns direcive
     */
    parse_map_Ns(tokens) {
        this.currentMaterial.mapSpecularExponent = this.parseMap(tokens);
    }
    /**
     * Parses the dissolve map.
     *
     * @param tokens list of tokens for the map_d direcive
     */
    parse_map_d(tokens) {
        this.currentMaterial.mapDissolve = this.parseMap(tokens);
    }
    /**
     * Parses the anti-aliasing option.
     *
     * @param tokens list of tokens for the map_aat direcive
     */
    parse_map_aat(tokens) {
        this.currentMaterial.antiAliasing = tokens[0] == "on";
    }
    /**
     * Parses the bump map.
     *
     * @param tokens list of tokens for the map_bump direcive
     */
    parse_map_bump(tokens) {
        this.currentMaterial.mapBump = this.parseMap(tokens);
    }
    /**
     * Parses the bump map.
     *
     * @param tokens list of tokens for the bump direcive
     */
    parse_bump(tokens) {
        this.parse_map_bump(tokens);
    }
    /**
     * Parses the disp map.
     *
     * @param tokens list of tokens for the disp direcive
     */
    parse_disp(tokens) {
        this.currentMaterial.mapDisplacement = this.parseMap(tokens);
    }
    /**
     * Parses the decal map.
     *
     * @param tokens list of tokens for the map_decal direcive
     */
    parse_decal(tokens) {
        this.currentMaterial.mapDecal = this.parseMap(tokens);
    }
    /**
     * Parses the refl map.
     *
     * @param tokens list of tokens for the refl direcive
     */
    parse_refl(tokens) {
        this.currentMaterial.mapReflections.push(this.parseMap(tokens));
    }
    /**
     * Parses the MTL file.
     *
     * Iterates line by line parsing each MTL directive.
     *
     * This function expects the first token in the line
     * to be a valid MTL directive. That token is then used
     * to try and run a method on this class. parse_[directive]
     * E.g., the \`newmtl\` directive would try to call the method
     * parse_newmtl. Each parsing function takes in the remaining
     * list of tokens and updates the currentMaterial class with
     * the attributes provided.
     */
    parse() {
        const lines = this.data.split(/\\r?\\n/);
        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith("#")) {
                continue;
            }
            const [directive, ...tokens] = line.split(/\\s/);
            const parseMethod = this[\`parse_\${directive}\`];
            if (!parseMethod) {
                console.warn(\`Don't know how to parse the directive: "\${directive}"\`);
                continue;
            }
            // console.log(\`Parsing "\${directive}" with tokens: \${tokens}\`);
            parseMethod.bind(this)(tokens);
        }
        // some cleanup. These don't need to be exposed as public data.
        delete this.data;
        this.currentMaterial = SENTINEL_MATERIAL;
    }
}
function emptyTextureOptions() {
    return {
        colorCorrection: false,
        horizontalBlending: true,
        verticalBlending: true,
        boostMipMapSharpness: 0,
        modifyTextureMap: {
            brightness: 0,
            contrast: 1,
        },
        offset: { u: 0, v: 0, w: 0 },
        scale: { u: 1, v: 1, w: 1 },
        turbulence: { u: 0, v: 0, w: 0 },
        clamp: false,
        textureResolution: null,
        bumpMultiplier: 1,
        imfChan: null,
        filename: "",
    };
}


//# sourceURL=webpack:///./src/material.ts?`)},"./src/mesh.ts":function(module,__webpack_exports__,__webpack_require__){"use strict";eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Mesh; });
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./layout */ "./src/layout.ts");

/**
 * The main Mesh class. The constructor will parse through the OBJ file data
 * and collect the vertex, vertex normal, texture, and face information. This
 * information can then be used later on when creating your VBOs. See
 * OBJ.initMeshBuffers for an example of how to use the newly created Mesh
 */
class Mesh {
    /**
     * Create a Mesh
     * @param {String} objectData - a string representation of an OBJ file with
     *     newlines preserved.
     * @param {Object} options - a JS object containing valid options. See class
     *     documentation for options.
     * @param {bool} options.enableWTextureCoord - Texture coordinates can have
     *     an optional "w" coordinate after the u and v coordinates. This extra
     *     value can be used in order to perform fancy transformations on the
     *     textures themselves. Default is to truncate to only the u an v
     *     coordinates. Passing true will provide a default value of 0 in the
     *     event that any or all texture coordinates don't provide a w value.
     *     Always use the textureStride attribute in order to determine the
     *     stride length of the texture coordinates when rendering the element
     *     array.
     * @param {bool} options.calcTangentsAndBitangents - Calculate the tangents
     *     and bitangents when loading of the OBJ is completed. This adds two new
     *     attributes to the Mesh instance: \`tangents\` and \`bitangents\`.
     */
    constructor(objectData, options) {
        this.name = "";
        this.indicesPerMaterial = [];
        this.materialsByIndex = {};
        this.tangents = [];
        this.bitangents = [];
        options = options || {};
        options.materials = options.materials || {};
        options.enableWTextureCoord = !!options.enableWTextureCoord;
        // the list of unique vertex, normal, texture, attributes
        this.vertexNormals = [];
        this.textures = [];
        // the indicies to draw the faces
        this.indices = [];
        this.textureStride = options.enableWTextureCoord ? 3 : 2;
        /*
        The OBJ file format does a sort of compression when saving a model in a
        program like Blender. There are at least 3 sections (4 including textures)
        within the file. Each line in a section begins with the same string:
          * 'v': indicates vertex section
          * 'vn': indicates vertex normal section
          * 'f': indicates the faces section
          * 'vt': indicates vertex texture section (if textures were used on the model)
        Each of the above sections (except for the faces section) is a list/set of
        unique vertices.

        Each line of the faces section contains a list of
        (vertex, [texture], normal) groups.

        **Note:** The following documentation will use a capital "V" Vertex to
        denote the above (vertex, [texture], normal) groups whereas a lowercase
        "v" vertex is used to denote an X, Y, Z coordinate.

        Some examples:
            // the texture index is optional, both formats are possible for models
            // without a texture applied
            f 1/25 18/46 12/31
            f 1//25 18//46 12//31

            // A 3 vertex face with texture indices
            f 16/92/11 14/101/22 1/69/1

            // A 4 vertex face
            f 16/92/11 40/109/40 38/114/38 14/101/22

        The first two lines are examples of a 3 vertex face without a texture applied.
        The second is an example of a 3 vertex face with a texture applied.
        The third is an example of a 4 vertex face. Note: a face can contain N
        number of vertices.

        Each number that appears in one of the groups is a 1-based index
        corresponding to an item from the other sections (meaning that indexing
        starts at one and *not* zero).

        For example:
            \`f 16/92/11\` is saying to
              - take the 16th element from the [v] vertex array
              - take the 92nd element from the [vt] texture array
              - take the 11th element from the [vn] normal array
            and together they make a unique vertex.
        Using all 3+ unique Vertices from the face line will produce a polygon.

        Now, you could just go through the OBJ file and create a new vertex for
        each face line and WebGL will draw what appears to be the same model.
        However, vertices will be overlapped and duplicated all over the place.

        Consider a cube in 3D space centered about the origin and each side is
        2 units long. The front face (with the positive Z-axis pointing towards
        you) would have a Top Right vertex (looking orthogonal to its normal)
        mapped at (1,1,1) The right face would have a Top Left vertex (looking
        orthogonal to its normal) at (1,1,1) and the top face would have a Bottom
        Right vertex (looking orthogonal to its normal) at (1,1,1). Each face
        has a vertex at the same coordinates, however, three distinct vertices
        will be drawn at the same spot.

        To solve the issue of duplicate Vertices (the \`(vertex, [texture], normal)\`
        groups), while iterating through the face lines, when a group is encountered
        the whole group string ('16/92/11') is checked to see if it exists in the
        packed.hashindices object, and if it doesn't, the indices it specifies
        are used to look up each attribute in the corresponding attribute arrays
        already created. The values are then copied to the corresponding unpacked
        array (flattened to play nice with WebGL's ELEMENT_ARRAY_BUFFER indexing),
        the group string is added to the hashindices set and the current unpacked
        index is used as this hashindices value so that the group of elements can
        be reused. The unpacked index is incremented. If the group string already
        exists in the hashindices object, its corresponding value is the index of
        that group and is appended to the unpacked indices array.
       */
        const verts = [];
        const vertNormals = [];
        const textures = [];
        const materialNamesByIndex = [];
        const materialIndicesByName = {};
        // keep track of what material we've seen last
        let currentMaterialIndex = -1;
        let currentObjectByMaterialIndex = 0;
        // unpacking stuff
        const unpacked = {
            verts: [],
            norms: [],
            textures: [],
            hashindices: {},
            indices: [[]],
            materialIndices: [],
            index: 0,
        };
        const VERTEX_RE = /^v\\s/;
        const NORMAL_RE = /^vn\\s/;
        const TEXTURE_RE = /^vt\\s/;
        const FACE_RE = /^f\\s/;
        const WHITESPACE_RE = /\\s+/;
        const USE_MATERIAL_RE = /^usemtl/;
        // array of lines separated by the newline
        const lines = objectData.split("\\n");
        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith("#")) {
                continue;
            }
            const elements = line.split(WHITESPACE_RE);
            elements.shift();
            if (VERTEX_RE.test(line)) {
                // if this is a vertex
                verts.push(...elements);
            }
            else if (NORMAL_RE.test(line)) {
                // if this is a vertex normal
                vertNormals.push(...elements);
            }
            else if (TEXTURE_RE.test(line)) {
                let coords = elements;
                // by default, the loader will only look at the U and V
                // coordinates of the vt declaration. So, this truncates the
                // elements to only those 2 values. If W texture coordinate
                // support is enabled, then the texture coordinate is
                // expected to have three values in it.
                if (elements.length > 2 && !options.enableWTextureCoord) {
                    coords = elements.slice(0, 2);
                }
                else if (elements.length === 2 && options.enableWTextureCoord) {
                    // If for some reason W texture coordinate support is enabled
                    // and only the U and V coordinates are given, then we supply
                    // the default value of 0 so that the stride length is correct
                    // when the textures are unpacked below.
                    coords.push("0");
                }
                textures.push(...coords);
            }
            else if (USE_MATERIAL_RE.test(line)) {
                const materialName = elements[0];
                // check to see if we've ever seen it before
                if (!(materialName in materialIndicesByName)) {
                    // new material we've never seen
                    materialNamesByIndex.push(materialName);
                    materialIndicesByName[materialName] = materialNamesByIndex.length - 1;
                    // push new array into indices
                    // already contains an array at index zero, don't add
                    if (materialIndicesByName[materialName] > 0) {
                        unpacked.indices.push([]);
                    }
                }
                // keep track of the current material index
                currentMaterialIndex = materialIndicesByName[materialName];
                // update current index array
                currentObjectByMaterialIndex = currentMaterialIndex;
            }
            else if (FACE_RE.test(line)) {
                // if this is a face
                /*
                split this face into an array of Vertex groups
                for example:
                   f 16/92/11 14/101/22 1/69/1
                becomes:
                  ['16/92/11', '14/101/22', '1/69/1'];
                */
                const triangles = triangulate(elements);
                for (const triangle of triangles) {
                    for (let j = 0, eleLen = triangle.length; j < eleLen; j++) {
                        const hash = triangle[j] + "," + currentMaterialIndex;
                        if (hash in unpacked.hashindices) {
                            unpacked.indices[currentObjectByMaterialIndex].push(unpacked.hashindices[hash]);
                        }
                        else {
                            /*
                        Each element of the face line array is a Vertex which has its
                        attributes delimited by a forward slash. This will separate
                        each attribute into another array:
                            '19/92/11'
                        becomes:
                            Vertex = ['19', '92', '11'];
                        where
                            Vertex[0] is the vertex index
                            Vertex[1] is the texture index
                            Vertex[2] is the normal index
                         Think of faces having Vertices which are comprised of the
                         attributes location (v), texture (vt), and normal (vn).
                         */
                            const vertex = triangle[j].split("/");
                            // it's possible for faces to only specify the vertex
                            // and the normal. In this case, vertex will only have
                            // a length of 2 and not 3 and the normal will be the
                            // second item in the list with an index of 1.
                            const normalIndex = vertex.length - 1;
                            /*
                         The verts, textures, and vertNormals arrays each contain a
                         flattend array of coordinates.

                         Because it gets confusing by referring to Vertex and then
                         vertex (both are different in my descriptions) I will explain
                         what's going on using the vertexNormals array:

                         vertex[2] will contain the one-based index of the vertexNormals
                         section (vn). One is subtracted from this index number to play
                         nice with javascript's zero-based array indexing.

                         Because vertexNormal is a flattened array of x, y, z values,
                         simple pointer arithmetic is used to skip to the start of the
                         vertexNormal, then the offset is added to get the correct
                         component: +0 is x, +1 is y, +2 is z.

                         This same process is repeated for verts and textures.
                         */
                            // Vertex position
                            unpacked.verts.push(+verts[(+vertex[0] - 1) * 3 + 0]);
                            unpacked.verts.push(+verts[(+vertex[0] - 1) * 3 + 1]);
                            unpacked.verts.push(+verts[(+vertex[0] - 1) * 3 + 2]);
                            // Vertex textures
                            if (textures.length) {
                                const stride = options.enableWTextureCoord ? 3 : 2;
                                unpacked.textures.push(+textures[(+vertex[1] - 1) * stride + 0]);
                                unpacked.textures.push(+textures[(+vertex[1] - 1) * stride + 1]);
                                if (options.enableWTextureCoord) {
                                    unpacked.textures.push(+textures[(+vertex[1] - 1) * stride + 2]);
                                }
                            }
                            // Vertex normals
                            unpacked.norms.push(+vertNormals[(+vertex[normalIndex] - 1) * 3 + 0]);
                            unpacked.norms.push(+vertNormals[(+vertex[normalIndex] - 1) * 3 + 1]);
                            unpacked.norms.push(+vertNormals[(+vertex[normalIndex] - 1) * 3 + 2]);
                            // Vertex material indices
                            unpacked.materialIndices.push(currentMaterialIndex);
                            // add the newly created Vertex to the list of indices
                            unpacked.hashindices[hash] = unpacked.index;
                            unpacked.indices[currentObjectByMaterialIndex].push(unpacked.hashindices[hash]);
                            // increment the counter
                            unpacked.index += 1;
                        }
                    }
                }
            }
        }
        this.vertices = unpacked.verts;
        this.vertexNormals = unpacked.norms;
        this.textures = unpacked.textures;
        this.vertexMaterialIndices = unpacked.materialIndices;
        this.indices = unpacked.indices[currentObjectByMaterialIndex];
        this.indicesPerMaterial = unpacked.indices;
        this.materialNames = materialNamesByIndex;
        this.materialIndices = materialIndicesByName;
        this.materialsByIndex = {};
        if (options.calcTangentsAndBitangents) {
            this.calculateTangentsAndBitangents();
        }
    }
    /**
     * Calculates the tangents and bitangents of the mesh that forms an orthogonal basis together with the
     * normal in the direction of the texture coordinates. These are useful for setting up the TBN matrix
     * when distorting the normals through normal maps.
     * Method derived from: http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-13-normal-mapping/
     *
     * This method requires the normals and texture coordinates to be parsed and set up correctly.
     * Adds the tangents and bitangents as members of the class instance.
     */
    calculateTangentsAndBitangents() {
        console.assert(!!(this.vertices &&
            this.vertices.length &&
            this.vertexNormals &&
            this.vertexNormals.length &&
            this.textures &&
            this.textures.length), "Missing attributes for calculating tangents and bitangents");
        const unpacked = {
            tangents: [...new Array(this.vertices.length)].map(_ => 0),
            bitangents: [...new Array(this.vertices.length)].map(_ => 0),
        };
        // Loop through all faces in the whole mesh
        const indices = this.indices;
        const vertices = this.vertices;
        const normals = this.vertexNormals;
        const uvs = this.textures;
        for (let i = 0; i < indices.length; i += 3) {
            const i0 = indices[i + 0];
            const i1 = indices[i + 1];
            const i2 = indices[i + 2];
            const x_v0 = vertices[i0 * 3 + 0];
            const y_v0 = vertices[i0 * 3 + 1];
            const z_v0 = vertices[i0 * 3 + 2];
            const x_uv0 = uvs[i0 * 2 + 0];
            const y_uv0 = uvs[i0 * 2 + 1];
            const x_v1 = vertices[i1 * 3 + 0];
            const y_v1 = vertices[i1 * 3 + 1];
            const z_v1 = vertices[i1 * 3 + 2];
            const x_uv1 = uvs[i1 * 2 + 0];
            const y_uv1 = uvs[i1 * 2 + 1];
            const x_v2 = vertices[i2 * 3 + 0];
            const y_v2 = vertices[i2 * 3 + 1];
            const z_v2 = vertices[i2 * 3 + 2];
            const x_uv2 = uvs[i2 * 2 + 0];
            const y_uv2 = uvs[i2 * 2 + 1];
            const x_deltaPos1 = x_v1 - x_v0;
            const y_deltaPos1 = y_v1 - y_v0;
            const z_deltaPos1 = z_v1 - z_v0;
            const x_deltaPos2 = x_v2 - x_v0;
            const y_deltaPos2 = y_v2 - y_v0;
            const z_deltaPos2 = z_v2 - z_v0;
            const x_uvDeltaPos1 = x_uv1 - x_uv0;
            const y_uvDeltaPos1 = y_uv1 - y_uv0;
            const x_uvDeltaPos2 = x_uv2 - x_uv0;
            const y_uvDeltaPos2 = y_uv2 - y_uv0;
            const rInv = x_uvDeltaPos1 * y_uvDeltaPos2 - y_uvDeltaPos1 * x_uvDeltaPos2;
            const r = 1.0 / Math.abs(rInv < 0.0001 ? 1.0 : rInv);
            // Tangent
            const x_tangent = (x_deltaPos1 * y_uvDeltaPos2 - x_deltaPos2 * y_uvDeltaPos1) * r;
            const y_tangent = (y_deltaPos1 * y_uvDeltaPos2 - y_deltaPos2 * y_uvDeltaPos1) * r;
            const z_tangent = (z_deltaPos1 * y_uvDeltaPos2 - z_deltaPos2 * y_uvDeltaPos1) * r;
            // Bitangent
            const x_bitangent = (x_deltaPos2 * x_uvDeltaPos1 - x_deltaPos1 * x_uvDeltaPos2) * r;
            const y_bitangent = (y_deltaPos2 * x_uvDeltaPos1 - y_deltaPos1 * x_uvDeltaPos2) * r;
            const z_bitangent = (z_deltaPos2 * x_uvDeltaPos1 - z_deltaPos1 * x_uvDeltaPos2) * r;
            // Gram-Schmidt orthogonalize
            //t = glm::normalize(t - n * glm:: dot(n, t));
            const x_n0 = normals[i0 * 3 + 0];
            const y_n0 = normals[i0 * 3 + 1];
            const z_n0 = normals[i0 * 3 + 2];
            const x_n1 = normals[i1 * 3 + 0];
            const y_n1 = normals[i1 * 3 + 1];
            const z_n1 = normals[i1 * 3 + 2];
            const x_n2 = normals[i2 * 3 + 0];
            const y_n2 = normals[i2 * 3 + 1];
            const z_n2 = normals[i2 * 3 + 2];
            // Tangent
            const n0_dot_t = x_tangent * x_n0 + y_tangent * y_n0 + z_tangent * z_n0;
            const n1_dot_t = x_tangent * x_n1 + y_tangent * y_n1 + z_tangent * z_n1;
            const n2_dot_t = x_tangent * x_n2 + y_tangent * y_n2 + z_tangent * z_n2;
            const x_resTangent0 = x_tangent - x_n0 * n0_dot_t;
            const y_resTangent0 = y_tangent - y_n0 * n0_dot_t;
            const z_resTangent0 = z_tangent - z_n0 * n0_dot_t;
            const x_resTangent1 = x_tangent - x_n1 * n1_dot_t;
            const y_resTangent1 = y_tangent - y_n1 * n1_dot_t;
            const z_resTangent1 = z_tangent - z_n1 * n1_dot_t;
            const x_resTangent2 = x_tangent - x_n2 * n2_dot_t;
            const y_resTangent2 = y_tangent - y_n2 * n2_dot_t;
            const z_resTangent2 = z_tangent - z_n2 * n2_dot_t;
            const magTangent0 = Math.sqrt(x_resTangent0 * x_resTangent0 + y_resTangent0 * y_resTangent0 + z_resTangent0 * z_resTangent0);
            const magTangent1 = Math.sqrt(x_resTangent1 * x_resTangent1 + y_resTangent1 * y_resTangent1 + z_resTangent1 * z_resTangent1);
            const magTangent2 = Math.sqrt(x_resTangent2 * x_resTangent2 + y_resTangent2 * y_resTangent2 + z_resTangent2 * z_resTangent2);
            // Bitangent
            const n0_dot_bt = x_bitangent * x_n0 + y_bitangent * y_n0 + z_bitangent * z_n0;
            const n1_dot_bt = x_bitangent * x_n1 + y_bitangent * y_n1 + z_bitangent * z_n1;
            const n2_dot_bt = x_bitangent * x_n2 + y_bitangent * y_n2 + z_bitangent * z_n2;
            const x_resBitangent0 = x_bitangent - x_n0 * n0_dot_bt;
            const y_resBitangent0 = y_bitangent - y_n0 * n0_dot_bt;
            const z_resBitangent0 = z_bitangent - z_n0 * n0_dot_bt;
            const x_resBitangent1 = x_bitangent - x_n1 * n1_dot_bt;
            const y_resBitangent1 = y_bitangent - y_n1 * n1_dot_bt;
            const z_resBitangent1 = z_bitangent - z_n1 * n1_dot_bt;
            const x_resBitangent2 = x_bitangent - x_n2 * n2_dot_bt;
            const y_resBitangent2 = y_bitangent - y_n2 * n2_dot_bt;
            const z_resBitangent2 = z_bitangent - z_n2 * n2_dot_bt;
            const magBitangent0 = Math.sqrt(x_resBitangent0 * x_resBitangent0 +
                y_resBitangent0 * y_resBitangent0 +
                z_resBitangent0 * z_resBitangent0);
            const magBitangent1 = Math.sqrt(x_resBitangent1 * x_resBitangent1 +
                y_resBitangent1 * y_resBitangent1 +
                z_resBitangent1 * z_resBitangent1);
            const magBitangent2 = Math.sqrt(x_resBitangent2 * x_resBitangent2 +
                y_resBitangent2 * y_resBitangent2 +
                z_resBitangent2 * z_resBitangent2);
            unpacked.tangents[i0 * 3 + 0] += x_resTangent0 / magTangent0;
            unpacked.tangents[i0 * 3 + 1] += y_resTangent0 / magTangent0;
            unpacked.tangents[i0 * 3 + 2] += z_resTangent0 / magTangent0;
            unpacked.tangents[i1 * 3 + 0] += x_resTangent1 / magTangent1;
            unpacked.tangents[i1 * 3 + 1] += y_resTangent1 / magTangent1;
            unpacked.tangents[i1 * 3 + 2] += z_resTangent1 / magTangent1;
            unpacked.tangents[i2 * 3 + 0] += x_resTangent2 / magTangent2;
            unpacked.tangents[i2 * 3 + 1] += y_resTangent2 / magTangent2;
            unpacked.tangents[i2 * 3 + 2] += z_resTangent2 / magTangent2;
            unpacked.bitangents[i0 * 3 + 0] += x_resBitangent0 / magBitangent0;
            unpacked.bitangents[i0 * 3 + 1] += y_resBitangent0 / magBitangent0;
            unpacked.bitangents[i0 * 3 + 2] += z_resBitangent0 / magBitangent0;
            unpacked.bitangents[i1 * 3 + 0] += x_resBitangent1 / magBitangent1;
            unpacked.bitangents[i1 * 3 + 1] += y_resBitangent1 / magBitangent1;
            unpacked.bitangents[i1 * 3 + 2] += z_resBitangent1 / magBitangent1;
            unpacked.bitangents[i2 * 3 + 0] += x_resBitangent2 / magBitangent2;
            unpacked.bitangents[i2 * 3 + 1] += y_resBitangent2 / magBitangent2;
            unpacked.bitangents[i2 * 3 + 2] += z_resBitangent2 / magBitangent2;
            // TODO: check handedness
        }
        this.tangents = unpacked.tangents;
        this.bitangents = unpacked.bitangents;
    }
    /**
     * @param layout - A {@link Layout} object that describes the
     * desired memory layout of the generated buffer
     * @return The packed array in the ... TODO
     */
    makeBufferData(layout) {
        const numItems = this.vertices.length / 3;
        const buffer = new ArrayBuffer(layout.stride * numItems);
        buffer.numItems = numItems;
        const dataView = new DataView(buffer);
        for (let i = 0, vertexOffset = 0; i < numItems; i++) {
            vertexOffset = i * layout.stride;
            // copy in the vertex data in the order and format given by the
            // layout param
            for (const attribute of layout.attributes) {
                const offset = vertexOffset + layout.attributeMap[attribute.key].offset;
                switch (attribute.key) {
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].POSITION.key:
                        dataView.setFloat32(offset, this.vertices[i * 3], true);
                        dataView.setFloat32(offset + 4, this.vertices[i * 3 + 1], true);
                        dataView.setFloat32(offset + 8, this.vertices[i * 3 + 2], true);
                        break;
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].UV.key:
                        dataView.setFloat32(offset, this.textures[i * 2], true);
                        dataView.setFloat32(offset + 4, this.textures[i * 2 + 1], true);
                        break;
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].NORMAL.key:
                        dataView.setFloat32(offset, this.vertexNormals[i * 3], true);
                        dataView.setFloat32(offset + 4, this.vertexNormals[i * 3 + 1], true);
                        dataView.setFloat32(offset + 8, this.vertexNormals[i * 3 + 2], true);
                        break;
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].MATERIAL_INDEX.key:
                        dataView.setInt16(offset, this.vertexMaterialIndices[i], true);
                        break;
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].AMBIENT.key: {
                        const materialIndex = this.vertexMaterialIndices[i];
                        const material = this.materialsByIndex[materialIndex];
                        if (!material) {
                            console.warn('Material "' +
                                this.materialNames[materialIndex] +
                                '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                            break;
                        }
                        dataView.setFloat32(offset, material.ambient[0], true);
                        dataView.setFloat32(offset + 4, material.ambient[1], true);
                        dataView.setFloat32(offset + 8, material.ambient[2], true);
                        break;
                    }
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].DIFFUSE.key: {
                        const materialIndex = this.vertexMaterialIndices[i];
                        const material = this.materialsByIndex[materialIndex];
                        if (!material) {
                            console.warn('Material "' +
                                this.materialNames[materialIndex] +
                                '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                            break;
                        }
                        dataView.setFloat32(offset, material.diffuse[0], true);
                        dataView.setFloat32(offset + 4, material.diffuse[1], true);
                        dataView.setFloat32(offset + 8, material.diffuse[2], true);
                        break;
                    }
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].SPECULAR.key: {
                        const materialIndex = this.vertexMaterialIndices[i];
                        const material = this.materialsByIndex[materialIndex];
                        if (!material) {
                            console.warn('Material "' +
                                this.materialNames[materialIndex] +
                                '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                            break;
                        }
                        dataView.setFloat32(offset, material.specular[0], true);
                        dataView.setFloat32(offset + 4, material.specular[1], true);
                        dataView.setFloat32(offset + 8, material.specular[2], true);
                        break;
                    }
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].SPECULAR_EXPONENT.key: {
                        const materialIndex = this.vertexMaterialIndices[i];
                        const material = this.materialsByIndex[materialIndex];
                        if (!material) {
                            console.warn('Material "' +
                                this.materialNames[materialIndex] +
                                '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                            break;
                        }
                        dataView.setFloat32(offset, material.specularExponent, true);
                        break;
                    }
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].EMISSIVE.key: {
                        const materialIndex = this.vertexMaterialIndices[i];
                        const material = this.materialsByIndex[materialIndex];
                        if (!material) {
                            console.warn('Material "' +
                                this.materialNames[materialIndex] +
                                '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                            break;
                        }
                        dataView.setFloat32(offset, material.emissive[0], true);
                        dataView.setFloat32(offset + 4, material.emissive[1], true);
                        dataView.setFloat32(offset + 8, material.emissive[2], true);
                        break;
                    }
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].TRANSMISSION_FILTER.key: {
                        const materialIndex = this.vertexMaterialIndices[i];
                        const material = this.materialsByIndex[materialIndex];
                        if (!material) {
                            console.warn('Material "' +
                                this.materialNames[materialIndex] +
                                '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                            break;
                        }
                        dataView.setFloat32(offset, material.transmissionFilter[0], true);
                        dataView.setFloat32(offset + 4, material.transmissionFilter[1], true);
                        dataView.setFloat32(offset + 8, material.transmissionFilter[2], true);
                        break;
                    }
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].DISSOLVE.key: {
                        const materialIndex = this.vertexMaterialIndices[i];
                        const material = this.materialsByIndex[materialIndex];
                        if (!material) {
                            console.warn('Material "' +
                                this.materialNames[materialIndex] +
                                '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                            break;
                        }
                        dataView.setFloat32(offset, material.dissolve, true);
                        break;
                    }
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].ILLUMINATION.key: {
                        const materialIndex = this.vertexMaterialIndices[i];
                        const material = this.materialsByIndex[materialIndex];
                        if (!material) {
                            console.warn('Material "' +
                                this.materialNames[materialIndex] +
                                '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                            break;
                        }
                        dataView.setInt16(offset, material.illumination, true);
                        break;
                    }
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].REFRACTION_INDEX.key: {
                        const materialIndex = this.vertexMaterialIndices[i];
                        const material = this.materialsByIndex[materialIndex];
                        if (!material) {
                            console.warn('Material "' +
                                this.materialNames[materialIndex] +
                                '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                            break;
                        }
                        dataView.setFloat32(offset, material.refractionIndex, true);
                        break;
                    }
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].SHARPNESS.key: {
                        const materialIndex = this.vertexMaterialIndices[i];
                        const material = this.materialsByIndex[materialIndex];
                        if (!material) {
                            console.warn('Material "' +
                                this.materialNames[materialIndex] +
                                '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                            break;
                        }
                        dataView.setFloat32(offset, material.sharpness, true);
                        break;
                    }
                    case _layout__WEBPACK_IMPORTED_MODULE_0__["Layout"].ANTI_ALIASING.key: {
                        const materialIndex = this.vertexMaterialIndices[i];
                        const material = this.materialsByIndex[materialIndex];
                        if (!material) {
                            console.warn('Material "' +
                                this.materialNames[materialIndex] +
                                '" not found in mesh. Did you forget to call addMaterialLibrary(...)?"');
                            break;
                        }
                        dataView.setInt16(offset, material.antiAliasing ? 1 : 0, true);
                        break;
                    }
                }
            }
        }
        return buffer;
    }
    makeIndexBufferData() {
        const buffer = new Uint16Array(this.indices);
        buffer.numItems = this.indices.length;
        return buffer;
    }
    makeIndexBufferDataForMaterials(...materialIndices) {
        const indices = new Array().concat(...materialIndices.map(mtlIdx => this.indicesPerMaterial[mtlIdx]));
        const buffer = new Uint16Array(indices);
        buffer.numItems = indices.length;
        return buffer;
    }
    addMaterialLibrary(mtl) {
        for (const name in mtl.materials) {
            if (!(name in this.materialIndices)) {
                // This material is not referenced by the mesh
                continue;
            }
            const material = mtl.materials[name];
            // Find the material index for this material
            const materialIndex = this.materialIndices[material.name];
            // Put the material into the materialsByIndex object at the right
            // spot as determined when the obj file was parsed
            this.materialsByIndex[materialIndex] = material;
        }
    }
}
function* triangulate(elements) {
    if (elements.length <= 3) {
        yield elements;
    }
    else if (elements.length === 4) {
        yield [elements[0], elements[1], elements[2]];
        yield [elements[2], elements[3], elements[0]];
    }
    else {
        for (let i = 1; i < elements.length - 1; i++) {
            yield [elements[0], elements[i], elements[i + 1]];
        }
    }
}


//# sourceURL=webpack:///./src/mesh.ts?`)},"./src/utils.ts":function(module,__webpack_exports__,__webpack_require__){"use strict";eval(`__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "downloadModels", function() { return downloadModels; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "downloadMeshes", function() { return downloadMeshes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "initMeshBuffers", function() { return initMeshBuffers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deleteMeshBuffers", function() { return deleteMeshBuffers; });
/* harmony import */ var _mesh__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mesh */ "./src/mesh.ts");
/* harmony import */ var _material__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./material */ "./src/material.ts");


function downloadMtlTextures(mtl, root) {
    const mapAttributes = [
        "mapDiffuse",
        "mapAmbient",
        "mapSpecular",
        "mapDissolve",
        "mapBump",
        "mapDisplacement",
        "mapDecal",
        "mapEmissive",
    ];
    if (!root.endsWith("/")) {
        root += "/";
    }
    const textures = [];
    for (const materialName in mtl.materials) {
        if (!mtl.materials.hasOwnProperty(materialName)) {
            continue;
        }
        const material = mtl.materials[materialName];
        for (const attr of mapAttributes) {
            const mapData = material[attr];
            if (!mapData || !mapData.filename) {
                continue;
            }
            const url = root + mapData.filename;
            textures.push(fetch(url)
                .then(response => {
                if (!response.ok) {
                    throw new Error();
                }
                return response.blob();
            })
                .then(function (data) {
                const image = new Image();
                image.src = URL.createObjectURL(data);
                mapData.texture = image;
                return new Promise(resolve => (image.onload = resolve));
            })
                .catch(() => {
                console.error(\`Unable to download texture: \${url}\`);
            }));
        }
    }
    return Promise.all(textures);
}
function getMtl(modelOptions) {
    if (!(typeof modelOptions.mtl === "string")) {
        return modelOptions.obj.replace(/\\.obj$/, ".mtl");
    }
    return modelOptions.mtl;
}
/**
 * Accepts a list of model request objects and returns a Promise that
 * resolves when all models have been downloaded and parsed.
 *
 * The list of model objects follow this interface:
 * {
 *  obj: 'path/to/model.obj',
 *  mtl: true | 'path/to/model.mtl',
 *  downloadMtlTextures: true | false
 *  mtlTextureRoot: '/models/suzanne/maps'
 *  name: 'suzanne'
 * }
 *
 * The \`obj\` attribute is required and should be the path to the
 * model's .obj file relative to the current repo (absolute URLs are
 * suggested).
 *
 * The \`mtl\` attribute is optional and can either be a boolean or
 * a path to the model's .mtl file relative to the current URL. If
 * the value is \`true\`, then the path and basename given for the \`obj\`
 * attribute is used replacing the .obj suffix for .mtl
 * E.g.: {obj: 'models/foo.obj', mtl: true} would search for 'models/foo.mtl'
 *
 * The \`name\` attribute is optional and is a human friendly name to be
 * included with the parsed OBJ and MTL files. If not given, the base .obj
 * filename will be used.
 *
 * The \`downloadMtlTextures\` attribute is a flag for automatically downloading
 * any images found in the MTL file and attaching them to each Material
 * created from that file. For example, if material.mapDiffuse is set (there
 * was data in the MTL file), then material.mapDiffuse.texture will contain
 * the downloaded image. This option defaults to \`true\`. By default, the MTL's
 * URL will be used to determine the location of the images.
 *
 * The \`mtlTextureRoot\` attribute is optional and should point to the location
 * on the server that this MTL's texture files are located. The default is to
 * use the MTL file's location.
 *
 * @returns {Promise} the result of downloading the given list of models. The
 * promise will resolve with an object whose keys are the names of the models
 * and the value is its Mesh object. Each Mesh object will automatically
 * have its addMaterialLibrary() method called to set the given MTL data (if given).
 */
function downloadModels(models) {
    const finished = [];
    for (const model of models) {
        if (!model.obj) {
            throw new Error('"obj" attribute of model object not set. The .obj file is required to be set ' +
                "in order to use downloadModels()");
        }
        const options = {
            indicesPerMaterial: !!model.indicesPerMaterial,
            calcTangentsAndBitangents: !!model.calcTangentsAndBitangents,
        };
        // if the name is not provided, dervive it from the given OBJ
        let name = model.name;
        if (!name) {
            const parts = model.obj.split("/");
            name = parts[parts.length - 1].replace(".obj", "");
        }
        const namePromise = Promise.resolve(name);
        const meshPromise = fetch(model.obj)
            .then(response => response.text())
            .then(data => {
            return new _mesh__WEBPACK_IMPORTED_MODULE_0__["default"](data, options);
        });
        let mtlPromise;
        // Download MaterialLibrary file?
        if (model.mtl) {
            const mtl = getMtl(model);
            mtlPromise = fetch(mtl)
                .then(response => response.text())
                .then((data) => {
                const material = new _material__WEBPACK_IMPORTED_MODULE_1__["MaterialLibrary"](data);
                if (model.downloadMtlTextures !== false) {
                    let root = model.mtlTextureRoot;
                    if (!root) {
                        // get the directory of the MTL file as default
                        root = mtl.substr(0, mtl.lastIndexOf("/"));
                    }
                    // downloadMtlTextures returns a Promise that
                    // is resolved once all of the images it
                    // contains are downloaded. These are then
                    // attached to the map data objects
                    return Promise.all([Promise.resolve(material), downloadMtlTextures(material, root)]);
                }
                return Promise.all([Promise.resolve(material), undefined]);
            })
                .then((value) => {
                return value[0];
            });
        }
        const parsed = [namePromise, meshPromise, mtlPromise];
        finished.push(Promise.all(parsed));
    }
    return Promise.all(finished).then(ms => {
        // the "finished" promise is a list of name, Mesh instance,
        // and MaterialLibary instance. This unpacks and returns an
        // object mapping name to Mesh (Mesh points to MTL).
        const models = {};
        for (const model of ms) {
            const [name, mesh, mtl] = model;
            mesh.name = name;
            if (mtl) {
                mesh.addMaterialLibrary(mtl);
            }
            models[name] = mesh;
        }
        return models;
    });
}
/**
 * Takes in an object of \`mesh_name\`, \`'/url/to/OBJ/file'\` pairs and a callback
 * function. Each OBJ file will be ajaxed in and automatically converted to
 * an OBJ.Mesh. When all files have successfully downloaded the callback
 * function provided will be called and passed in an object containing
 * the newly created meshes.
 *
 * **Note:** In order to use this function as a way to download meshes, a
 * webserver of some sort must be used.
 *
 * @param {Object} nameAndAttrs an object where the key is the name of the mesh and the value is the url to that mesh's OBJ file
 *
 * @param {Function} completionCallback should contain a function that will take one parameter: an object array where the keys will be the unique object name and the value will be a Mesh object
 *
 * @param {Object} meshes In case other meshes are loaded separately or if a previously declared variable is desired to be used, pass in a (possibly empty) json object of the pattern: { '<mesh_name>': OBJ.Mesh }
 *
 */
function downloadMeshes(nameAndURLs, completionCallback, meshes) {
    if (meshes === undefined) {
        meshes = {};
    }
    const completed = [];
    for (const mesh_name in nameAndURLs) {
        if (!nameAndURLs.hasOwnProperty(mesh_name)) {
            continue;
        }
        const url = nameAndURLs[mesh_name];
        completed.push(fetch(url)
            .then(response => response.text())
            .then(data => {
            return [mesh_name, new _mesh__WEBPACK_IMPORTED_MODULE_0__["default"](data)];
        }));
    }
    Promise.all(completed).then(ms => {
        for (const [name, mesh] of ms) {
            meshes[name] = mesh;
        }
        return completionCallback(meshes);
    });
}
function _buildBuffer(gl, type, data, itemSize) {
    const buffer = gl.createBuffer();
    const arrayView = type === gl.ARRAY_BUFFER ? Float32Array : Uint16Array;
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, new arrayView(data), gl.STATIC_DRAW);
    buffer.itemSize = itemSize;
    buffer.numItems = data.length / itemSize;
    return buffer;
}
/**
 * Takes in the WebGL context and a Mesh, then creates and appends the buffers
 * to the mesh object as attributes.
 *
 * @param {WebGLRenderingContext} gl the \`canvas.getContext('webgl')\` context instance
 * @param {Mesh} mesh a single \`OBJ.Mesh\` instance
 *
 * The newly created mesh attributes are:
 *
 * Attrbute | Description
 * :--- | ---
 * **normalBuffer**       |contains the model&#39;s Vertex Normals
 * normalBuffer.itemSize  |set to 3 items
 * normalBuffer.numItems  |the total number of vertex normals
 * |
 * **textureBuffer**      |contains the model&#39;s Texture Coordinates
 * textureBuffer.itemSize |set to 2 items
 * textureBuffer.numItems |the number of texture coordinates
 * |
 * **vertexBuffer**       |contains the model&#39;s Vertex Position Coordinates (does not include w)
 * vertexBuffer.itemSize  |set to 3 items
 * vertexBuffer.numItems  |the total number of vertices
 * |
 * **indexBuffer**        |contains the indices of the faces
 * indexBuffer.itemSize   |is set to 1
 * indexBuffer.numItems   |the total number of indices
 *
 * A simple example (a lot of steps are missing, so don't copy and paste):
 *
 *     const gl   = canvas.getContext('webgl'),
 *         mesh = OBJ.Mesh(obj_file_data);
 *     // compile the shaders and create a shader program
 *     const shaderProgram = gl.createProgram();
 *     // compilation stuff here
 *     ...
 *     // make sure you have vertex, vertex normal, and texture coordinate
 *     // attributes located in your shaders and attach them to the shader program
 *     shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
 *     gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
 *
 *     shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
 *     gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
 *
 *     shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
 *     gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
 *
 *     // create and initialize the vertex, vertex normal, and texture coordinate buffers
 *     // and save on to the mesh object
 *     OBJ.initMeshBuffers(gl, mesh);
 *
 *     // now to render the mesh
 *     gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
 *     gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
 *     // it's possible that the mesh doesn't contain
 *     // any texture coordinates (e.g. suzanne.obj in the development branch).
 *     // in this case, the texture vertexAttribArray will need to be disabled
 *     // before the call to drawElements
 *     if(!mesh.textures.length){
 *       gl.disableVertexAttribArray(shaderProgram.textureCoordAttribute);
 *     }
 *     else{
 *       // if the texture vertexAttribArray has been previously
 *       // disabled, then it needs to be re-enabled
 *       gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
 *       gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
 *       gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, mesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
 *     }
 *
 *     gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
 *     gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, mesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
 *
 *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.mesh.indexBuffer);
 *     gl.drawElements(gl.TRIANGLES, model.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
 */
function initMeshBuffers(gl, mesh) {
    mesh.normalBuffer = _buildBuffer(gl, gl.ARRAY_BUFFER, mesh.vertexNormals, 3);
    mesh.textureBuffer = _buildBuffer(gl, gl.ARRAY_BUFFER, mesh.textures, mesh.textureStride);
    mesh.vertexBuffer = _buildBuffer(gl, gl.ARRAY_BUFFER, mesh.vertices, 3);
    mesh.indexBuffer = _buildBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, mesh.indices, 1);
    return mesh;
}
function deleteMeshBuffers(gl, mesh) {
    gl.deleteBuffer(mesh.normalBuffer);
    gl.deleteBuffer(mesh.textureBuffer);
    gl.deleteBuffer(mesh.vertexBuffer);
    gl.deleteBuffer(mesh.indexBuffer);
}


//# sourceURL=webpack:///./src/utils.ts?`)},0:function(module,exports,__webpack_require__){eval(`module.exports = __webpack_require__(/*! /home/aaron/google_drive/projects/webgl-obj-loader/src/index.ts */"./src/index.ts");


//# sourceURL=webpack:///multi_./src/index.ts?`)}})})});var Se=1e-6;var $=Float32Array;function Bu(n){let e=$;return $=n,e}function Je(n,e,t){let r=new $(3);return n!==void 0&&(r[0]=n,e!==void 0&&(r[1]=e,t!==void 0&&(r[2]=t))),r}var Du=new Map([[Float32Array,()=>new Float32Array(12)],[Float64Array,()=>new Float64Array(12)],[Array,()=>new Array(12).fill(0)]]),Jm=Du.get(Float32Array);var Ou=Je;function Nu(n,e,t,r){return r=r||new $(3),r[0]=n,r[1]=e,r[2]=t,r}function Uu(n,e){return e=e||new $(3),e[0]=Math.ceil(n[0]),e[1]=Math.ceil(n[1]),e[2]=Math.ceil(n[2]),e}function Fu(n,e){return e=e||new $(3),e[0]=Math.floor(n[0]),e[1]=Math.floor(n[1]),e[2]=Math.floor(n[2]),e}function Lu(n,e){return e=e||new $(3),e[0]=Math.round(n[0]),e[1]=Math.round(n[1]),e[2]=Math.round(n[2]),e}function ku(n,e=0,t=1,r){return r=r||new $(3),r[0]=Math.min(t,Math.max(e,n[0])),r[1]=Math.min(t,Math.max(e,n[1])),r[2]=Math.min(t,Math.max(e,n[2])),r}function Gu(n,e,t){return t=t||new $(3),t[0]=n[0]+e[0],t[1]=n[1]+e[1],t[2]=n[2]+e[2],t}function zu(n,e,t,r){return r=r||new $(3),r[0]=n[0]+e[0]*t,r[1]=n[1]+e[1]*t,r[2]=n[2]+e[2]*t,r}function Vu(n,e){let t=n[0],r=n[1],o=n[2],i=e[0],l=e[1],c=e[2],m=Math.sqrt(t*t+r*r+o*o),h=Math.sqrt(i*i+l*l+c*c),g=m*h,_=g&&Ra(n,e)/g;return Math.acos(_)}function dr(n,e,t){return t=t||new $(3),t[0]=n[0]-e[0],t[1]=n[1]-e[1],t[2]=n[2]-e[2],t}var $u=dr;function Hu(n,e){return Math.abs(n[0]-e[0])<Se&&Math.abs(n[1]-e[1])<Se&&Math.abs(n[2]-e[2])<Se}function ju(n,e){return n[0]===e[0]&&n[1]===e[1]&&n[2]===e[2]}function Aa(n,e,t,r){return r=r||new $(3),r[0]=n[0]+t*(e[0]-n[0]),r[1]=n[1]+t*(e[1]-n[1]),r[2]=n[2]+t*(e[2]-n[2]),r}function Wu(n,e,t,r){return r=r||new $(3),r[0]=n[0]+t[0]*(e[0]-n[0]),r[1]=n[1]+t[1]*(e[1]-n[1]),r[2]=n[2]+t[2]*(e[2]-n[2]),r}function Yu(n,e,t){return t=t||new $(3),t[0]=Math.max(n[0],e[0]),t[1]=Math.max(n[1],e[1]),t[2]=Math.max(n[2],e[2]),t}function qu(n,e,t){return t=t||new $(3),t[0]=Math.min(n[0],e[0]),t[1]=Math.min(n[1],e[1]),t[2]=Math.min(n[2],e[2]),t}function Ai(n,e,t){return t=t||new $(3),t[0]=n[0]*e,t[1]=n[1]*e,t[2]=n[2]*e,t}var Xu=Ai;function Ku(n,e,t){return t=t||new $(3),t[0]=n[0]/e,t[1]=n[1]/e,t[2]=n[2]/e,t}function Ia(n,e){return e=e||new $(3),e[0]=1/n[0],e[1]=1/n[1],e[2]=1/n[2],e}var Ju=Ia;function un(n,e,t){t=t||new $(3);let r=n[2]*e[0]-n[0]*e[2],o=n[0]*e[1]-n[1]*e[0];return t[0]=n[1]*e[2]-n[2]*e[1],t[1]=r,t[2]=o,t}function Ra(n,e){return n[0]*e[0]+n[1]*e[1]+n[2]*e[2]}function Ii(n){let e=n[0],t=n[1],r=n[2];return Math.sqrt(e*e+t*t+r*r)}var Zu=Ii;function Ca(n){let e=n[0],t=n[1],r=n[2];return e*e+t*t+r*r}var Qu=Ca;function Ba(n,e){let t=n[0]-e[0],r=n[1]-e[1],o=n[2]-e[2];return Math.sqrt(t*t+r*r+o*o)}var ec=Ba;function Da(n,e){let t=n[0]-e[0],r=n[1]-e[1],o=n[2]-e[2];return t*t+r*r+o*o}var tc=Da;function dt(n,e){e=e||new $(3);let t=n[0],r=n[1],o=n[2],i=Math.sqrt(t*t+r*r+o*o);return i>1e-5?(e[0]=t/i,e[1]=r/i,e[2]=o/i):(e[0]=0,e[1]=0,e[2]=0),e}function nc(n,e){return e=e||new $(3),e[0]=-n[0],e[1]=-n[1],e[2]=-n[2],e}function Ri(n,e){return e=e||new $(3),e[0]=n[0],e[1]=n[1],e[2]=n[2],e}var rc=Ri;function Oa(n,e,t){return t=t||new $(3),t[0]=n[0]*e[0],t[1]=n[1]*e[1],t[2]=n[2]*e[2],t}var oc=Oa;function Na(n,e,t){return t=t||new $(3),t[0]=n[0]/e[0],t[1]=n[1]/e[1],t[2]=n[2]/e[2],t}var ic=Na;function ac(n=1,e){e=e||new $(3);let t=Math.random()*2*Math.PI,r=Math.random()*2-1,o=Math.sqrt(1-r*r)*n;return e[0]=Math.cos(t)*o,e[1]=Math.sin(t)*o,e[2]=r*n,e}function sc(n){return n=n||new $(3),n[0]=0,n[1]=0,n[2]=0,n}function lc(n,e,t){t=t||new $(3);let r=n[0],o=n[1],i=n[2],l=e[3]*r+e[7]*o+e[11]*i+e[15]||1;return t[0]=(e[0]*r+e[4]*o+e[8]*i+e[12])/l,t[1]=(e[1]*r+e[5]*o+e[9]*i+e[13])/l,t[2]=(e[2]*r+e[6]*o+e[10]*i+e[14])/l,t}function uc(n,e,t){t=t||new $(3);let r=n[0],o=n[1],i=n[2];return t[0]=r*e[0*4+0]+o*e[1*4+0]+i*e[2*4+0],t[1]=r*e[0*4+1]+o*e[1*4+1]+i*e[2*4+1],t[2]=r*e[0*4+2]+o*e[1*4+2]+i*e[2*4+2],t}function cc(n,e,t){t=t||new $(3);let r=n[0],o=n[1],i=n[2];return t[0]=r*e[0]+o*e[4]+i*e[8],t[1]=r*e[1]+o*e[5]+i*e[9],t[2]=r*e[2]+o*e[6]+i*e[10],t}function fc(n,e,t){t=t||new $(3);let r=e[0],o=e[1],i=e[2],l=e[3]*2,c=n[0],m=n[1],h=n[2],g=o*h-i*m,_=i*c-r*h,x=r*m-o*c;return t[0]=c+g*l+(o*x-i*_)*2,t[1]=m+_*l+(i*g-r*x)*2,t[2]=h+x*l+(r*_-o*g)*2,t}function dc(n,e){return e=e||new $(3),e[0]=n[12],e[1]=n[13],e[2]=n[14],e}function mc(n,e,t){t=t||new $(3);let r=e*4;return t[0]=n[r+0],t[1]=n[r+1],t[2]=n[r+2],t}function pc(n,e){e=e||new $(3);let t=n[0],r=n[1],o=n[2],i=n[4],l=n[5],c=n[6],m=n[8],h=n[9],g=n[10];return e[0]=Math.sqrt(t*t+r*r+o*o),e[1]=Math.sqrt(i*i+l*l+c*c),e[2]=Math.sqrt(m*m+h*h+g*g),e}function hc(n,e,t,r){r=r||new $(3);let o=[],i=[];return o[0]=n[0]-e[0],o[1]=n[1]-e[1],o[2]=n[2]-e[2],i[0]=o[0],i[1]=o[1]*Math.cos(t)-o[2]*Math.sin(t),i[2]=o[1]*Math.sin(t)+o[2]*Math.cos(t),r[0]=i[0]+e[0],r[1]=i[1]+e[1],r[2]=i[2]+e[2],r}function _c(n,e,t,r){r=r||new $(3);let o=[],i=[];return o[0]=n[0]-e[0],o[1]=n[1]-e[1],o[2]=n[2]-e[2],i[0]=o[2]*Math.sin(t)+o[0]*Math.cos(t),i[1]=o[1],i[2]=o[2]*Math.cos(t)-o[0]*Math.sin(t),r[0]=i[0]+e[0],r[1]=i[1]+e[1],r[2]=i[2]+e[2],r}function gc(n,e,t,r){r=r||new $(3);let o=[],i=[];return o[0]=n[0]-e[0],o[1]=n[1]-e[1],o[2]=n[2]-e[2],i[0]=o[0]*Math.cos(t)-o[1]*Math.sin(t),i[1]=o[0]*Math.sin(t)+o[1]*Math.cos(t),i[2]=o[2],r[0]=i[0]+e[0],r[1]=i[1]+e[1],r[2]=i[2]+e[2],r}function Ua(n,e,t){return t=t||new $(3),dt(n,t),Ai(t,e,t)}function bc(n,e,t){return t=t||new $(3),Ii(n)>e?Ua(n,e,t):Ri(n,t)}function vc(n,e,t){return t=t||new $(3),Aa(n,e,.5,t)}var Y={__proto__:null,add:Gu,addScaled:zu,angle:Vu,ceil:Uu,clamp:ku,clone:rc,copy:Ri,create:Je,cross:un,dist:ec,distSq:tc,distance:Ba,distanceSq:Da,div:ic,divScalar:Ku,divide:Na,dot:Ra,equals:ju,equalsApproximately:Hu,floor:Fu,fromValues:Ou,getAxis:mc,getScaling:pc,getTranslation:dc,inverse:Ia,invert:Ju,len:Zu,lenSq:Qu,length:Ii,lengthSq:Ca,lerp:Aa,lerpV:Wu,max:Yu,midpoint:vc,min:qu,mul:oc,mulScalar:Ai,multiply:Oa,negate:nc,normalize:dt,random:ac,rotateX:hc,rotateY:_c,rotateZ:gc,round:Lu,scale:Xu,set:Nu,setDefaultType:Bu,setLength:Ua,sub:$u,subtract:dr,transformMat3:cc,transformMat4:lc,transformMat4Upper3x3:uc,transformQuat:fc,truncate:bc,zero:sc},Q=Float32Array;function xc(n){let e=Q;return Q=n,e}function yc(n,e,t,r,o,i,l,c,m,h,g,_,x,T,S,w){let E=new Q(16);return n!==void 0&&(E[0]=n,e!==void 0&&(E[1]=e,t!==void 0&&(E[2]=t,r!==void 0&&(E[3]=r,o!==void 0&&(E[4]=o,i!==void 0&&(E[5]=i,l!==void 0&&(E[6]=l,c!==void 0&&(E[7]=c,m!==void 0&&(E[8]=m,h!==void 0&&(E[9]=h,g!==void 0&&(E[10]=g,_!==void 0&&(E[11]=_,x!==void 0&&(E[12]=x,T!==void 0&&(E[13]=T,S!==void 0&&(E[14]=S,w!==void 0&&(E[15]=w)))))))))))))))),E}function wc(n,e,t,r,o,i,l,c,m,h,g,_,x,T,S,w,E){return E=E||new Q(16),E[0]=n,E[1]=e,E[2]=t,E[3]=r,E[4]=o,E[5]=i,E[6]=l,E[7]=c,E[8]=m,E[9]=h,E[10]=g,E[11]=_,E[12]=x,E[13]=T,E[14]=S,E[15]=w,E}function Ec(n,e){return e=e||new Q(16),e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=0,e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=0,e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function Mc(n,e){e=e||new Q(16);let t=n[0],r=n[1],o=n[2],i=n[3],l=t+t,c=r+r,m=o+o,h=t*l,g=r*l,_=r*c,x=o*l,T=o*c,S=o*m,w=i*l,E=i*c,R=i*m;return e[0]=1-_-S,e[1]=g+R,e[2]=x-E,e[3]=0,e[4]=g-R,e[5]=1-h-S,e[6]=T+w,e[7]=0,e[8]=x+E,e[9]=T-w,e[10]=1-h-_,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function Sc(n,e){return e=e||new Q(16),e[0]=-n[0],e[1]=-n[1],e[2]=-n[2],e[3]=-n[3],e[4]=-n[4],e[5]=-n[5],e[6]=-n[6],e[7]=-n[7],e[8]=-n[8],e[9]=-n[9],e[10]=-n[10],e[11]=-n[11],e[12]=-n[12],e[13]=-n[13],e[14]=-n[14],e[15]=-n[15],e}function Ci(n,e){return e=e||new Q(16),e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],e}var Pc=Ci;function Tc(n,e){return Math.abs(n[0]-e[0])<Se&&Math.abs(n[1]-e[1])<Se&&Math.abs(n[2]-e[2])<Se&&Math.abs(n[3]-e[3])<Se&&Math.abs(n[4]-e[4])<Se&&Math.abs(n[5]-e[5])<Se&&Math.abs(n[6]-e[6])<Se&&Math.abs(n[7]-e[7])<Se&&Math.abs(n[8]-e[8])<Se&&Math.abs(n[9]-e[9])<Se&&Math.abs(n[10]-e[10])<Se&&Math.abs(n[11]-e[11])<Se&&Math.abs(n[12]-e[12])<Se&&Math.abs(n[13]-e[13])<Se&&Math.abs(n[14]-e[14])<Se&&Math.abs(n[15]-e[15])<Se}function Ac(n,e){return n[0]===e[0]&&n[1]===e[1]&&n[2]===e[2]&&n[3]===e[3]&&n[4]===e[4]&&n[5]===e[5]&&n[6]===e[6]&&n[7]===e[7]&&n[8]===e[8]&&n[9]===e[9]&&n[10]===e[10]&&n[11]===e[11]&&n[12]===e[12]&&n[13]===e[13]&&n[14]===e[14]&&n[15]===e[15]}function Fa(n){return n=n||new Q(16),n[0]=1,n[1]=0,n[2]=0,n[3]=0,n[4]=0,n[5]=1,n[6]=0,n[7]=0,n[8]=0,n[9]=0,n[10]=1,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,n}function Ic(n,e){if(e=e||new Q(16),e===n){let C;return C=n[1],n[1]=n[4],n[4]=C,C=n[2],n[2]=n[8],n[8]=C,C=n[3],n[3]=n[12],n[12]=C,C=n[6],n[6]=n[9],n[9]=C,C=n[7],n[7]=n[13],n[13]=C,C=n[11],n[11]=n[14],n[14]=C,e}let t=n[0*4+0],r=n[0*4+1],o=n[0*4+2],i=n[0*4+3],l=n[1*4+0],c=n[1*4+1],m=n[1*4+2],h=n[1*4+3],g=n[2*4+0],_=n[2*4+1],x=n[2*4+2],T=n[2*4+3],S=n[3*4+0],w=n[3*4+1],E=n[3*4+2],R=n[3*4+3];return e[0]=t,e[1]=l,e[2]=g,e[3]=S,e[4]=r,e[5]=c,e[6]=_,e[7]=w,e[8]=o,e[9]=m,e[10]=x,e[11]=E,e[12]=i,e[13]=h,e[14]=T,e[15]=R,e}function La(n,e){e=e||new Q(16);let t=n[0*4+0],r=n[0*4+1],o=n[0*4+2],i=n[0*4+3],l=n[1*4+0],c=n[1*4+1],m=n[1*4+2],h=n[1*4+3],g=n[2*4+0],_=n[2*4+1],x=n[2*4+2],T=n[2*4+3],S=n[3*4+0],w=n[3*4+1],E=n[3*4+2],R=n[3*4+3],C=x*R,N=E*T,L=m*R,D=E*h,H=m*T,J=x*h,re=o*R,oe=E*i,B=o*T,ee=x*i,X=o*h,he=m*i,de=g*w,ie=S*_,j=l*w,ye=S*c,Re=l*_,st=g*c,te=t*w,we=S*r,et=t*_,qe=g*r,He=t*c,Tt=l*r,Qt=C*c+D*_+H*w-(N*c+L*_+J*w),en=N*r+re*_+ee*w-(C*r+oe*_+B*w),tn=L*r+oe*c+X*w-(D*r+re*c+he*w),nn=J*r+B*c+he*_-(H*r+ee*c+X*_),Be=1/(t*Qt+l*en+g*tn+S*nn);return e[0]=Be*Qt,e[1]=Be*en,e[2]=Be*tn,e[3]=Be*nn,e[4]=Be*(N*l+L*g+J*S-(C*l+D*g+H*S)),e[5]=Be*(C*t+oe*g+B*S-(N*t+re*g+ee*S)),e[6]=Be*(D*t+re*l+he*S-(L*t+oe*l+X*S)),e[7]=Be*(H*t+ee*l+X*g-(J*t+B*l+he*g)),e[8]=Be*(de*h+ye*T+Re*R-(ie*h+j*T+st*R)),e[9]=Be*(ie*i+te*T+qe*R-(de*i+we*T+et*R)),e[10]=Be*(j*i+we*h+He*R-(ye*i+te*h+Tt*R)),e[11]=Be*(st*i+et*h+Tt*T-(Re*i+qe*h+He*T)),e[12]=Be*(j*x+st*E+ie*m-(Re*E+de*m+ye*x)),e[13]=Be*(et*E+de*o+we*x-(te*x+qe*E+ie*o)),e[14]=Be*(te*m+Tt*E+ye*o-(He*E+j*o+we*m)),e[15]=Be*(He*x+Re*o+qe*m-(et*m+Tt*x+st*o)),e}function Rc(n){let e=n[0],t=n[0*4+1],r=n[0*4+2],o=n[0*4+3],i=n[1*4+0],l=n[1*4+1],c=n[1*4+2],m=n[1*4+3],h=n[2*4+0],g=n[2*4+1],_=n[2*4+2],x=n[2*4+3],T=n[3*4+0],S=n[3*4+1],w=n[3*4+2],E=n[3*4+3],R=_*E,C=w*x,N=c*E,L=w*m,D=c*x,H=_*m,J=r*E,re=w*o,oe=r*x,B=_*o,ee=r*m,X=c*o,he=R*l+L*g+D*S-(C*l+N*g+H*S),de=C*t+J*g+B*S-(R*t+re*g+oe*S),ie=N*t+re*l+ee*S-(L*t+J*l+X*S),j=H*t+oe*l+X*g-(D*t+B*l+ee*g);return e*he+i*de+h*ie+T*j}var Cc=La;function ka(n,e,t){t=t||new Q(16);let r=n[0],o=n[1],i=n[2],l=n[3],c=n[4],m=n[5],h=n[6],g=n[7],_=n[8],x=n[9],T=n[10],S=n[11],w=n[12],E=n[13],R=n[14],C=n[15],N=e[0],L=e[1],D=e[2],H=e[3],J=e[4],re=e[5],oe=e[6],B=e[7],ee=e[8],X=e[9],he=e[10],de=e[11],ie=e[12],j=e[13],ye=e[14],Re=e[15];return t[0]=r*N+c*L+_*D+w*H,t[1]=o*N+m*L+x*D+E*H,t[2]=i*N+h*L+T*D+R*H,t[3]=l*N+g*L+S*D+C*H,t[4]=r*J+c*re+_*oe+w*B,t[5]=o*J+m*re+x*oe+E*B,t[6]=i*J+h*re+T*oe+R*B,t[7]=l*J+g*re+S*oe+C*B,t[8]=r*ee+c*X+_*he+w*de,t[9]=o*ee+m*X+x*he+E*de,t[10]=i*ee+h*X+T*he+R*de,t[11]=l*ee+g*X+S*he+C*de,t[12]=r*ie+c*j+_*ye+w*Re,t[13]=o*ie+m*j+x*ye+E*Re,t[14]=i*ie+h*j+T*ye+R*Re,t[15]=l*ie+g*j+S*ye+C*Re,t}var Bc=ka;function Dc(n,e,t){return t=t||Fa(),n!==t&&(t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11]),t[12]=e[0],t[13]=e[1],t[14]=e[2],t[15]=1,t}function Oc(n,e){return e=e||Je(),e[0]=n[12],e[1]=n[13],e[2]=n[14],e}function Nc(n,e,t){t=t||Je();let r=e*4;return t[0]=n[r+0],t[1]=n[r+1],t[2]=n[r+2],t}function Uc(n,e,t,r){r!==n&&(r=Ci(n,r));let o=t*4;return r[o+0]=e[0],r[o+1]=e[1],r[o+2]=e[2],r}function Fc(n,e){e=e||Je();let t=n[0],r=n[1],o=n[2],i=n[4],l=n[5],c=n[6],m=n[8],h=n[9],g=n[10];return e[0]=Math.sqrt(t*t+r*r+o*o),e[1]=Math.sqrt(i*i+l*l+c*c),e[2]=Math.sqrt(m*m+h*h+g*g),e}function Lc(n,e,t,r,o){o=o||new Q(16);let i=Math.tan(Math.PI*.5-.5*n);if(o[0]=i/e,o[1]=0,o[2]=0,o[3]=0,o[4]=0,o[5]=i,o[6]=0,o[7]=0,o[8]=0,o[9]=0,o[11]=-1,o[12]=0,o[13]=0,o[15]=0,Number.isFinite(r)){let l=1/(t-r);o[10]=r*l,o[14]=r*t*l}else o[10]=-1,o[14]=-t;return o}function kc(n,e,t,r=1/0,o){o=o||new Q(16);let i=1/Math.tan(n*.5);if(o[0]=i/e,o[1]=0,o[2]=0,o[3]=0,o[4]=0,o[5]=i,o[6]=0,o[7]=0,o[8]=0,o[9]=0,o[11]=-1,o[12]=0,o[13]=0,o[15]=0,r===1/0)o[10]=0,o[14]=t;else{let l=1/(r-t);o[10]=t*l,o[14]=r*t*l}return o}function Gc(n,e,t,r,o,i,l){return l=l||new Q(16),l[0]=2/(e-n),l[1]=0,l[2]=0,l[3]=0,l[4]=0,l[5]=2/(r-t),l[6]=0,l[7]=0,l[8]=0,l[9]=0,l[10]=1/(o-i),l[11]=0,l[12]=(e+n)/(n-e),l[13]=(r+t)/(t-r),l[14]=o/(o-i),l[15]=1,l}function zc(n,e,t,r,o,i,l){l=l||new Q(16);let c=e-n,m=r-t,h=o-i;return l[0]=2*o/c,l[1]=0,l[2]=0,l[3]=0,l[4]=0,l[5]=2*o/m,l[6]=0,l[7]=0,l[8]=(n+e)/c,l[9]=(r+t)/m,l[10]=i/h,l[11]=-1,l[12]=0,l[13]=0,l[14]=o*i/h,l[15]=0,l}function Vc(n,e,t,r,o,i=1/0,l){l=l||new Q(16);let c=e-n,m=r-t;if(l[0]=2*o/c,l[1]=0,l[2]=0,l[3]=0,l[4]=0,l[5]=2*o/m,l[6]=0,l[7]=0,l[8]=(n+e)/c,l[9]=(r+t)/m,l[11]=-1,l[12]=0,l[13]=0,l[15]=0,i===1/0)l[10]=0,l[14]=o;else{let h=1/(i-o);l[10]=o*h,l[14]=i*o*h}return l}var me,Ee,ae;function $c(n,e,t,r){return r=r||new Q(16),me=me||Je(),Ee=Ee||Je(),ae=ae||Je(),dt(dr(e,n,ae),ae),dt(un(t,ae,me),me),dt(un(ae,me,Ee),Ee),r[0]=me[0],r[1]=me[1],r[2]=me[2],r[3]=0,r[4]=Ee[0],r[5]=Ee[1],r[6]=Ee[2],r[7]=0,r[8]=ae[0],r[9]=ae[1],r[10]=ae[2],r[11]=0,r[12]=n[0],r[13]=n[1],r[14]=n[2],r[15]=1,r}function Hc(n,e,t,r){return r=r||new Q(16),me=me||Je(),Ee=Ee||Je(),ae=ae||Je(),dt(dr(n,e,ae),ae),dt(un(t,ae,me),me),dt(un(ae,me,Ee),Ee),r[0]=me[0],r[1]=me[1],r[2]=me[2],r[3]=0,r[4]=Ee[0],r[5]=Ee[1],r[6]=Ee[2],r[7]=0,r[8]=ae[0],r[9]=ae[1],r[10]=ae[2],r[11]=0,r[12]=n[0],r[13]=n[1],r[14]=n[2],r[15]=1,r}function jc(n,e,t,r){return r=r||new Q(16),me=me||Je(),Ee=Ee||Je(),ae=ae||Je(),dt(dr(n,e,ae),ae),dt(un(t,ae,me),me),dt(un(ae,me,Ee),Ee),r[0]=me[0],r[1]=Ee[0],r[2]=ae[0],r[3]=0,r[4]=me[1],r[5]=Ee[1],r[6]=ae[1],r[7]=0,r[8]=me[2],r[9]=Ee[2],r[10]=ae[2],r[11]=0,r[12]=-(me[0]*n[0]+me[1]*n[1]+me[2]*n[2]),r[13]=-(Ee[0]*n[0]+Ee[1]*n[1]+Ee[2]*n[2]),r[14]=-(ae[0]*n[0]+ae[1]*n[1]+ae[2]*n[2]),r[15]=1,r}function Wc(n,e){return e=e||new Q(16),e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=n[0],e[13]=n[1],e[14]=n[2],e[15]=1,e}function Yc(n,e,t){t=t||new Q(16);let r=e[0],o=e[1],i=e[2],l=n[0],c=n[1],m=n[2],h=n[3],g=n[1*4+0],_=n[1*4+1],x=n[1*4+2],T=n[1*4+3],S=n[2*4+0],w=n[2*4+1],E=n[2*4+2],R=n[2*4+3],C=n[3*4+0],N=n[3*4+1],L=n[3*4+2],D=n[3*4+3];return n!==t&&(t[0]=l,t[1]=c,t[2]=m,t[3]=h,t[4]=g,t[5]=_,t[6]=x,t[7]=T,t[8]=S,t[9]=w,t[10]=E,t[11]=R),t[12]=l*r+g*o+S*i+C,t[13]=c*r+_*o+w*i+N,t[14]=m*r+x*o+E*i+L,t[15]=h*r+T*o+R*i+D,t}function qc(n,e){e=e||new Q(16);let t=Math.cos(n),r=Math.sin(n);return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=t,e[6]=r,e[7]=0,e[8]=0,e[9]=-r,e[10]=t,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function Xc(n,e,t){t=t||new Q(16);let r=n[4],o=n[5],i=n[6],l=n[7],c=n[8],m=n[9],h=n[10],g=n[11],_=Math.cos(e),x=Math.sin(e);return t[4]=_*r+x*c,t[5]=_*o+x*m,t[6]=_*i+x*h,t[7]=_*l+x*g,t[8]=_*c-x*r,t[9]=_*m-x*o,t[10]=_*h-x*i,t[11]=_*g-x*l,n!==t&&(t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15]),t}function Kc(n,e){e=e||new Q(16);let t=Math.cos(n),r=Math.sin(n);return e[0]=t,e[1]=0,e[2]=-r,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=r,e[9]=0,e[10]=t,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function Jc(n,e,t){t=t||new Q(16);let r=n[0*4+0],o=n[0*4+1],i=n[0*4+2],l=n[0*4+3],c=n[2*4+0],m=n[2*4+1],h=n[2*4+2],g=n[2*4+3],_=Math.cos(e),x=Math.sin(e);return t[0]=_*r-x*c,t[1]=_*o-x*m,t[2]=_*i-x*h,t[3]=_*l-x*g,t[8]=_*c+x*r,t[9]=_*m+x*o,t[10]=_*h+x*i,t[11]=_*g+x*l,n!==t&&(t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15]),t}function Zc(n,e){e=e||new Q(16);let t=Math.cos(n),r=Math.sin(n);return e[0]=t,e[1]=r,e[2]=0,e[3]=0,e[4]=-r,e[5]=t,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function Qc(n,e,t){t=t||new Q(16);let r=n[0*4+0],o=n[0*4+1],i=n[0*4+2],l=n[0*4+3],c=n[1*4+0],m=n[1*4+1],h=n[1*4+2],g=n[1*4+3],_=Math.cos(e),x=Math.sin(e);return t[0]=_*r+x*c,t[1]=_*o+x*m,t[2]=_*i+x*h,t[3]=_*l+x*g,t[4]=_*c-x*r,t[5]=_*m-x*o,t[6]=_*h-x*i,t[7]=_*g-x*l,n!==t&&(t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15]),t}function Ga(n,e,t){t=t||new Q(16);let r=n[0],o=n[1],i=n[2],l=Math.sqrt(r*r+o*o+i*i);r/=l,o/=l,i/=l;let c=r*r,m=o*o,h=i*i,g=Math.cos(e),_=Math.sin(e),x=1-g;return t[0]=c+(1-c)*g,t[1]=r*o*x+i*_,t[2]=r*i*x-o*_,t[3]=0,t[4]=r*o*x-i*_,t[5]=m+(1-m)*g,t[6]=o*i*x+r*_,t[7]=0,t[8]=r*i*x+o*_,t[9]=o*i*x-r*_,t[10]=h+(1-h)*g,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t}var ef=Ga;function za(n,e,t,r){r=r||new Q(16);let o=e[0],i=e[1],l=e[2],c=Math.sqrt(o*o+i*i+l*l);o/=c,i/=c,l/=c;let m=o*o,h=i*i,g=l*l,_=Math.cos(t),x=Math.sin(t),T=1-_,S=m+(1-m)*_,w=o*i*T+l*x,E=o*l*T-i*x,R=o*i*T-l*x,C=h+(1-h)*_,N=i*l*T+o*x,L=o*l*T+i*x,D=i*l*T-o*x,H=g+(1-g)*_,J=n[0],re=n[1],oe=n[2],B=n[3],ee=n[4],X=n[5],he=n[6],de=n[7],ie=n[8],j=n[9],ye=n[10],Re=n[11];return r[0]=S*J+w*ee+E*ie,r[1]=S*re+w*X+E*j,r[2]=S*oe+w*he+E*ye,r[3]=S*B+w*de+E*Re,r[4]=R*J+C*ee+N*ie,r[5]=R*re+C*X+N*j,r[6]=R*oe+C*he+N*ye,r[7]=R*B+C*de+N*Re,r[8]=L*J+D*ee+H*ie,r[9]=L*re+D*X+H*j,r[10]=L*oe+D*he+H*ye,r[11]=L*B+D*de+H*Re,n!==r&&(r[12]=n[12],r[13]=n[13],r[14]=n[14],r[15]=n[15]),r}var tf=za;function nf(n,e){return e=e||new Q(16),e[0]=n[0],e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=n[1],e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=n[2],e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function rf(n,e,t){t=t||new Q(16);let r=e[0],o=e[1],i=e[2];return t[0]=r*n[0*4+0],t[1]=r*n[0*4+1],t[2]=r*n[0*4+2],t[3]=r*n[0*4+3],t[4]=o*n[1*4+0],t[5]=o*n[1*4+1],t[6]=o*n[1*4+2],t[7]=o*n[1*4+3],t[8]=i*n[2*4+0],t[9]=i*n[2*4+1],t[10]=i*n[2*4+2],t[11]=i*n[2*4+3],n!==t&&(t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15]),t}function of(n,e){return e=e||new Q(16),e[0]=n,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=n,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=n,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function af(n,e,t){return t=t||new Q(16),t[0]=e*n[0*4+0],t[1]=e*n[0*4+1],t[2]=e*n[0*4+2],t[3]=e*n[0*4+3],t[4]=e*n[1*4+0],t[5]=e*n[1*4+1],t[6]=e*n[1*4+2],t[7]=e*n[1*4+3],t[8]=e*n[2*4+0],t[9]=e*n[2*4+1],t[10]=e*n[2*4+2],t[11]=e*n[2*4+3],n!==t&&(t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15]),t}var _e={__proto__:null,aim:$c,axisRotate:za,axisRotation:Ga,cameraAim:Hc,clone:Pc,copy:Ci,create:yc,determinant:Rc,equals:Ac,equalsApproximately:Tc,fromMat3:Ec,fromQuat:Mc,frustum:zc,frustumReverseZ:Vc,getAxis:Nc,getScaling:Fc,getTranslation:Oc,identity:Fa,inverse:La,invert:Cc,lookAt:jc,mul:Bc,multiply:ka,negate:Sc,ortho:Gc,perspective:Lc,perspectiveReverseZ:kc,rotate:tf,rotateX:Xc,rotateY:Jc,rotateZ:Qc,rotation:ef,rotationX:qc,rotationY:Kc,rotationZ:Zc,scale:rf,scaling:nf,set:wc,setAxis:Uc,setDefaultType:xc,setTranslation:Dc,translate:Yc,translation:Wc,transpose:Ic,uniformScale:af,uniformScaling:of};var ce=Float32Array;function sf(n){let e=ce;return ce=n,e}function Va(n,e,t,r){let o=new ce(4);return n!==void 0&&(o[0]=n,e!==void 0&&(o[1]=e,t!==void 0&&(o[2]=t,r!==void 0&&(o[3]=r)))),o}var lf=Va;function uf(n,e,t,r,o){return o=o||new ce(4),o[0]=n,o[1]=e,o[2]=t,o[3]=r,o}function cf(n,e){return e=e||new ce(4),e[0]=Math.ceil(n[0]),e[1]=Math.ceil(n[1]),e[2]=Math.ceil(n[2]),e[3]=Math.ceil(n[3]),e}function ff(n,e){return e=e||new ce(4),e[0]=Math.floor(n[0]),e[1]=Math.floor(n[1]),e[2]=Math.floor(n[2]),e[3]=Math.floor(n[3]),e}function df(n,e){return e=e||new ce(4),e[0]=Math.round(n[0]),e[1]=Math.round(n[1]),e[2]=Math.round(n[2]),e[3]=Math.round(n[3]),e}function mf(n,e=0,t=1,r){return r=r||new ce(4),r[0]=Math.min(t,Math.max(e,n[0])),r[1]=Math.min(t,Math.max(e,n[1])),r[2]=Math.min(t,Math.max(e,n[2])),r[3]=Math.min(t,Math.max(e,n[3])),r}function pf(n,e,t){return t=t||new ce(4),t[0]=n[0]+e[0],t[1]=n[1]+e[1],t[2]=n[2]+e[2],t[3]=n[3]+e[3],t}function hf(n,e,t,r){return r=r||new ce(4),r[0]=n[0]+e[0]*t,r[1]=n[1]+e[1]*t,r[2]=n[2]+e[2]*t,r[3]=n[3]+e[3]*t,r}function $a(n,e,t){return t=t||new ce(4),t[0]=n[0]-e[0],t[1]=n[1]-e[1],t[2]=n[2]-e[2],t[3]=n[3]-e[3],t}var _f=$a;function gf(n,e){return Math.abs(n[0]-e[0])<Se&&Math.abs(n[1]-e[1])<Se&&Math.abs(n[2]-e[2])<Se&&Math.abs(n[3]-e[3])<Se}function bf(n,e){return n[0]===e[0]&&n[1]===e[1]&&n[2]===e[2]&&n[3]===e[3]}function Ha(n,e,t,r){return r=r||new ce(4),r[0]=n[0]+t*(e[0]-n[0]),r[1]=n[1]+t*(e[1]-n[1]),r[2]=n[2]+t*(e[2]-n[2]),r[3]=n[3]+t*(e[3]-n[3]),r}function vf(n,e,t,r){return r=r||new ce(4),r[0]=n[0]+t[0]*(e[0]-n[0]),r[1]=n[1]+t[1]*(e[1]-n[1]),r[2]=n[2]+t[2]*(e[2]-n[2]),r[3]=n[3]+t[3]*(e[3]-n[3]),r}function xf(n,e,t){return t=t||new ce(4),t[0]=Math.max(n[0],e[0]),t[1]=Math.max(n[1],e[1]),t[2]=Math.max(n[2],e[2]),t[3]=Math.max(n[3],e[3]),t}function yf(n,e,t){return t=t||new ce(4),t[0]=Math.min(n[0],e[0]),t[1]=Math.min(n[1],e[1]),t[2]=Math.min(n[2],e[2]),t[3]=Math.min(n[3],e[3]),t}function Bi(n,e,t){return t=t||new ce(4),t[0]=n[0]*e,t[1]=n[1]*e,t[2]=n[2]*e,t[3]=n[3]*e,t}var wf=Bi;function Ef(n,e,t){return t=t||new ce(4),t[0]=n[0]/e,t[1]=n[1]/e,t[2]=n[2]/e,t[3]=n[3]/e,t}function ja(n,e){return e=e||new ce(4),e[0]=1/n[0],e[1]=1/n[1],e[2]=1/n[2],e[3]=1/n[3],e}var Mf=ja;function Sf(n,e){return n[0]*e[0]+n[1]*e[1]+n[2]*e[2]+n[3]*e[3]}function Di(n){let e=n[0],t=n[1],r=n[2],o=n[3];return Math.sqrt(e*e+t*t+r*r+o*o)}var Pf=Di;function Wa(n){let e=n[0],t=n[1],r=n[2],o=n[3];return e*e+t*t+r*r+o*o}var Tf=Wa;function Ya(n,e){let t=n[0]-e[0],r=n[1]-e[1],o=n[2]-e[2],i=n[3]-e[3];return Math.sqrt(t*t+r*r+o*o+i*i)}var Af=Ya;function qa(n,e){let t=n[0]-e[0],r=n[1]-e[1],o=n[2]-e[2],i=n[3]-e[3];return t*t+r*r+o*o+i*i}var If=qa;function Xa(n,e){e=e||new ce(4);let t=n[0],r=n[1],o=n[2],i=n[3],l=Math.sqrt(t*t+r*r+o*o+i*i);return l>1e-5?(e[0]=t/l,e[1]=r/l,e[2]=o/l,e[3]=i/l):(e[0]=0,e[1]=0,e[2]=0,e[3]=0),e}function Rf(n,e){return e=e||new ce(4),e[0]=-n[0],e[1]=-n[1],e[2]=-n[2],e[3]=-n[3],e}function Oi(n,e){return e=e||new ce(4),e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e}var Cf=Oi;function Ka(n,e,t){return t=t||new ce(4),t[0]=n[0]*e[0],t[1]=n[1]*e[1],t[2]=n[2]*e[2],t[3]=n[3]*e[3],t}var Bf=Ka;function Ja(n,e,t){return t=t||new ce(4),t[0]=n[0]/e[0],t[1]=n[1]/e[1],t[2]=n[2]/e[2],t[3]=n[3]/e[3],t}var Df=Ja;function Of(n){return n=n||new ce(4),n[0]=0,n[1]=0,n[2]=0,n[3]=0,n}function Nf(n,e,t){t=t||new ce(4);let r=n[0],o=n[1],i=n[2],l=n[3];return t[0]=e[0]*r+e[4]*o+e[8]*i+e[12]*l,t[1]=e[1]*r+e[5]*o+e[9]*i+e[13]*l,t[2]=e[2]*r+e[6]*o+e[10]*i+e[14]*l,t[3]=e[3]*r+e[7]*o+e[11]*i+e[15]*l,t}function Za(n,e,t){return t=t||new ce(4),Xa(n,t),Bi(t,e,t)}function Uf(n,e,t){return t=t||new ce(4),Di(n)>e?Za(n,e,t):Oi(n,t)}function Ff(n,e,t){return t=t||new ce(4),Ha(n,e,.5,t)}var Bt={__proto__:null,add:pf,addScaled:hf,ceil:cf,clamp:mf,clone:Cf,copy:Oi,create:Va,dist:Af,distSq:If,distance:Ya,distanceSq:qa,div:Df,divScalar:Ef,divide:Ja,dot:Sf,equals:bf,equalsApproximately:gf,floor:ff,fromValues:lf,inverse:ja,invert:Mf,len:Pf,lenSq:Tf,length:Di,lengthSq:Wa,lerp:Ha,lerpV:vf,max:xf,midpoint:Ff,min:yf,mul:Bf,mulScalar:Bi,multiply:Ka,negate:Rf,normalize:Xa,round:df,scale:wf,set:uf,setDefaultType:sf,setLength:Za,sub:_f,subtract:$a,transformMat4:Nf,truncate:Uf,zero:Of};var Qa=async n=>{let e=await fetch(n);if(!e.ok)throw`Could not download mesh file '${n}'`;return e.text()},es=async n=>(await fetch(n)).arrayBuffer(),ts=async(n,e,t,r)=>{let o=await fetch(e),i=await createImageBitmap(await o.blob()),l=n.createTexture({label:e,dimension:"2d",size:[i.width,i.height,1],format:t,usage:r});return n.queue.copyExternalImageToTexture({source:i},{texture:l},[i.width,i.height]),l};var De={position:{position:[1.5,1.9,2.3],rotation:[-.6,.3]},fovDgr:45,near:.01,far:100},Lf=1,Pe=4,q=4,ns=8,Ni=Pe*2,mr=Pe*3,Dt=Pe*4,rs=q*2,os=q*4,is=Lf*4,it=Pe*16,as=1e-6,ss=.001,cn=window.Deno!==void 0;var zr=cn,pr=cn?"static/models":"models",Tn="depth24plus",bt=cn?"rgba16float":"rgba32float",fn=3,le=3,hr=0,Vr=1,$r=2,Hr=3,vt=4,zt=5,P={isTest:!1,isExporting:!1,githubRepoLink:"https://github.com/Scthe/nanite-webgpu",githubDemoLink:"https://scthe.github.io/nanite-webgpu",loaders:{textFileReader:Qa,binaryFileReader:es,createTextureFromFile:ts},clearColor:[.2,.2,.2,0],clearColorAlt:[.03,.25,.4,0],useAlternativeClearColor:!1,lightsCount:2,useVertexQuantization:!1,drawGround:!0,rotationSpeed:1,movementSpeed:3,movementSpeedFaster:20,displayMode:"nanite",dbgMeshoptimizerLodLevel:0,dbgNaniteLodLevel:1,dbgDepthPyramidLevel:0,colors:{gamma:2.2,ditherStrength:1,exposure:.45},cullingInstances:{enabled:!0,frustumCulling:!0,occlusionCulling:!0},impostors:{views:12,textureSize:64,billboardThreshold:4e3,forceOnlyBillboards:!1,ditherStrength:.4},cullingMeshlets:{frustumCulling:!0,occlusionCulling:!0},softwareRasterizer:{enabled:!0,threshold:1360},nanite:{preprocess:{meshletMaxVertices:64,meshletMaxTriangles:124,meshletBackfaceCullingConeWeight:1,simplificationDecimateFactor:2,simplificationFactorRequirement:1.1,simplificationFactorRequirementBetweenLevels:.97,simplificationTargetError:.05,simplificationTargetErrorMultiplier:1.1,maxLods:20,useMapToFindAdjacentEdges:!0,enableProfiler:!1},render:{naniteDevice:"gpu",errorThreshold:.5,useVisibilityImpl_Iter:!0,freezeGPU_Visibilty:!1,nextFrameDebugDrawnMeshletsBuffer:!1,shadingMode:hr,isOverrideOcclusionCullMipmap:!1,occlusionCullOverrideMipmapLevel:0,hasValidDepthPyramid:!1,allowHardwareBackfaceCull:!0}}};function jr(){let n=P.softwareRasterizer,e=n.enabled,t=n.threshold>0,r=P.nanite.render.freezeGPU_Visibilty,o=P.cullingInstances,i=o.enabled&&(o.frustumCulling||o.occlusionCulling),l=P.cullingMeshlets,c=l.frustumCulling||l.occlusionCulling;return e&&t&&!r&&(i||c)}var dn=n=>n*Math.PI/180;function Ui(n){let e=n.width/n.height;return _e.perspective(dn(De.fovDgr),e,De.near,De.far)}function ls(n,e,t){return _e.multiply(e,n,t)}function us(n,e,t,r){return r=_e.multiply(e,n,r),r=_e.multiply(t,r,r),r}function mn(n,e,t){let r;if(e.length===4){if(e[3]!==1)throw new Error("Tried to project a point, but provided Vec4 has .w !== 1");r=e}else r=Bt.create(e[0],e[1],e[2],1);return Bt.transformMat4(r,n,t)}function Fi(n){return n.constructor.name}function Wr(n){return Array.isArray(n)?"Array":typeof n=="object"?Fi(n):typeof n}var Ve=n=>Array(n).fill(0);function _r(n,e){let t=new n(e.length);return e.forEach((r,o)=>t[o]=r),t}function Ot(n,e){return e instanceof n?e:_r(n,e)}var kf=(n,e,t)=>(t=Math.max(0,Math.min(1,t)),n*(1-t)+e*t),Ce=n=>typeof n=="number"?n/le:n.length/le,Vt=n=>typeof n=="number"?n/fn:n.length/fn,Yr=n=>n*le*q;function $t(n,e=2){if(n<=0)return"0 Bytes";let t=["Bytes","KiB","MiB","GiB","TiB","PiB","EiB","ZiB","YiB"],r=1024,o=Math.floor(Math.log(n)/Math.log(r));return`${(n/Math.pow(r,o)).toFixed(e)} ${t[o]}`}function An(n,e=2){if(n===0)return"0";let t=n<0?"-":"";n=Math.abs(n);let r=["","k","m","b"],o=1e3,i=Math.floor(Math.log(n)/Math.log(o)),l=(n/Math.pow(o,i)).toFixed(e);return`${t}${l}${r[i]}`}function mt(n,e){let t=e>0?n/e*100:0;return`${An(n)} (${t.toFixed(1)}%)`}var qr=n=>n&&n.style.display!=="none",Nt=(n,e="block")=>{n&&(n.style.display=e)},In=n=>{n&&(n.style.display="none")},cs=(n,e)=>{qr(n)!==e&&(e?Nt(n):In(n))},fs=(n,e)=>kf(n,e,Math.random());function pn(n,e,t){return Math.min(Math.max(n,e),t)}function ds(n,e){let t;return(...r)=>{clearTimeout(t),t=setTimeout(()=>n(...r),e)}}function ms(n,e){let t=n.includes(".")?n.lastIndexOf("."):n.length,r=n.substring(0,t);return e=e.startsWith(".")?e:`.${e}`,`${r}${e}`}var hn=256;async function ps(){try{let n=await navigator.gpu.requestAdapter({powerPreference:"high-performance"}),e=i=>console.error(`WebGPU init error: '${i}'`);if(!n){e("No adapter found. WebGPU seems to be unavailable.");return}let t=n.features.has("timestamp-query"),r=["float32-filterable"];t&&r.push("timestamp-query");let o=await n?.requestDevice({requiredFeatures:r});if(!o){e("Failed to get GPUDevice from the adapter.");return}return o}catch(n){console.error(n);return}}var hs=GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST;function Ht(n,e,t,r){let o=n.createBuffer({label:e,size:r.byteLength,usage:t});return n.queue.writeBuffer(o,0,r),o}function Xr(n,e,t,r=0){let o=Ot(Float32Array,t);return Ht(n,e,GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST|r,o)}function gr(n,e,t){let r=Ot(Uint32Array,t);return Ht(n,e,GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,r)}function _s(n,e,t,r){let o=r;n.queue.writeBuffer(e,t,o.buffer,0)}var Rn=(n,e)=>Math.ceil(n/e);function Gf(n,e){return n.createBuffer({label:`${e}-readback-buffer`,size:e.size,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST})}function zf(n,e,t){n.copyBufferToBuffer(e,0,t,0,e.size)}async function Vf(n,e){await e.mapAsync(GPUMapMode.READ);let t=e.getMappedRange(),r=new n(t.slice(0));return e.unmap(),r}async function br(n,e,t){P.isTest||console.warn(`Reading '${t.label}' buffer back to CPU. This is slow!`);let r;try{r=Gf(n,t);let o=n.createCommandEncoder({label:`${t.label}-readback`});return zf(o,t,r),n.queue.submit([o.finish()]),await Vf(e,r)}catch(o){throw o}finally{r&&r.destroy()}}var $f=n=>typeof n=="object"&&Fi(n)===GPUTextureView.name,Ie=n=>{if(!$f(n))throw new Error(`Expected ${GPUTextureView.name}, got ${Wr(n)}`)};function Hf(n){if(n&&!(typeof window>"u")){var e=document.createElement("style");return e.setAttribute("type","text/css"),e.innerHTML=n,document.head.appendChild(e),n}}function Dn(n,e){var t=n.__state.conversionName.toString(),r=Math.round(n.r),o=Math.round(n.g),i=Math.round(n.b),l=n.a,c=Math.round(n.h),m=n.s.toFixed(1),h=n.v.toFixed(1);if(e||t==="THREE_CHAR_HEX"||t==="SIX_CHAR_HEX"){for(var g=n.hex.toString(16);g.length<6;)g="0"+g;return"#"+g}else{if(t==="CSS_RGB")return"rgb("+r+","+o+","+i+")";if(t==="CSS_RGBA")return"rgba("+r+","+o+","+i+","+l+")";if(t==="HEX")return"0x"+n.hex.toString(16);if(t==="RGB_ARRAY")return"["+r+","+o+","+i+"]";if(t==="RGBA_ARRAY")return"["+r+","+o+","+i+","+l+"]";if(t==="RGB_OBJ")return"{r:"+r+",g:"+o+",b:"+i+"}";if(t==="RGBA_OBJ")return"{r:"+r+",g:"+o+",b:"+i+",a:"+l+"}";if(t==="HSV_OBJ")return"{h:"+c+",s:"+m+",v:"+h+"}";if(t==="HSVA_OBJ")return"{h:"+c+",s:"+m+",v:"+h+",a:"+l+"}"}return"unknown format"}var gs=Array.prototype.forEach,vr=Array.prototype.slice,I={BREAK:{},extend:function(e){return this.each(vr.call(arguments,1),function(t){var r=this.isObject(t)?Object.keys(t):[];r.forEach((function(o){this.isUndefined(t[o])||(e[o]=t[o])}).bind(this))},this),e},defaults:function(e){return this.each(vr.call(arguments,1),function(t){var r=this.isObject(t)?Object.keys(t):[];r.forEach((function(o){this.isUndefined(e[o])&&(e[o]=t[o])}).bind(this))},this),e},compose:function(){var e=vr.call(arguments);return function(){for(var t=vr.call(arguments),r=e.length-1;r>=0;r--)t=[e[r].apply(this,t)];return t[0]}},each:function(e,t,r){if(e){if(gs&&e.forEach&&e.forEach===gs)e.forEach(t,r);else if(e.length===e.length+0){var o=void 0,i=void 0;for(o=0,i=e.length;o<i;o++)if(o in e&&t.call(r,e[o],o)===this.BREAK)return}else for(var l in e)if(t.call(r,e[l],l)===this.BREAK)return}},defer:function(e){setTimeout(e,0)},debounce:function(e,t,r){var o=void 0;return function(){var i=this,l=arguments;function c(){o=null,r||e.apply(i,l)}var m=r||!o;clearTimeout(o),o=setTimeout(c,t),m&&e.apply(i,l)}},toArray:function(e){return e.toArray?e.toArray():vr.call(e)},isUndefined:function(e){return e===void 0},isNull:function(e){return e===null},isNaN:function(n){function e(t){return n.apply(this,arguments)}return e.toString=function(){return n.toString()},e}(function(n){return isNaN(n)}),isArray:Array.isArray||function(n){return n.constructor===Array},isObject:function(e){return e===Object(e)},isNumber:function(e){return e===e+0},isString:function(e){return e===e+""},isBoolean:function(e){return e===!1||e===!0},isFunction:function(e){return e instanceof Function}},jf=[{litmus:I.isString,conversions:{THREE_CHAR_HEX:{read:function(e){var t=e.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);return t===null?!1:{space:"HEX",hex:parseInt("0x"+t[1].toString()+t[1].toString()+t[2].toString()+t[2].toString()+t[3].toString()+t[3].toString(),0)}},write:Dn},SIX_CHAR_HEX:{read:function(e){var t=e.match(/^#([A-F0-9]{6})$/i);return t===null?!1:{space:"HEX",hex:parseInt("0x"+t[1].toString(),0)}},write:Dn},CSS_RGB:{read:function(e){var t=e.match(/^rgb\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);return t===null?!1:{space:"RGB",r:parseFloat(t[1]),g:parseFloat(t[2]),b:parseFloat(t[3])}},write:Dn},CSS_RGBA:{read:function(e){var t=e.match(/^rgba\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);return t===null?!1:{space:"RGB",r:parseFloat(t[1]),g:parseFloat(t[2]),b:parseFloat(t[3]),a:parseFloat(t[4])}},write:Dn}}},{litmus:I.isNumber,conversions:{HEX:{read:function(e){return{space:"HEX",hex:e,conversionName:"HEX"}},write:function(e){return e.hex}}}},{litmus:I.isArray,conversions:{RGB_ARRAY:{read:function(e){return e.length!==3?!1:{space:"RGB",r:e[0],g:e[1],b:e[2]}},write:function(e){return[e.r,e.g,e.b]}},RGBA_ARRAY:{read:function(e){return e.length!==4?!1:{space:"RGB",r:e[0],g:e[1],b:e[2],a:e[3]}},write:function(e){return[e.r,e.g,e.b,e.a]}}}},{litmus:I.isObject,conversions:{RGBA_OBJ:{read:function(e){return I.isNumber(e.r)&&I.isNumber(e.g)&&I.isNumber(e.b)&&I.isNumber(e.a)?{space:"RGB",r:e.r,g:e.g,b:e.b,a:e.a}:!1},write:function(e){return{r:e.r,g:e.g,b:e.b,a:e.a}}},RGB_OBJ:{read:function(e){return I.isNumber(e.r)&&I.isNumber(e.g)&&I.isNumber(e.b)?{space:"RGB",r:e.r,g:e.g,b:e.b}:!1},write:function(e){return{r:e.r,g:e.g,b:e.b}}},HSVA_OBJ:{read:function(e){return I.isNumber(e.h)&&I.isNumber(e.s)&&I.isNumber(e.v)&&I.isNumber(e.a)?{space:"HSV",h:e.h,s:e.s,v:e.v,a:e.a}:!1},write:function(e){return{h:e.h,s:e.s,v:e.v,a:e.a}}},HSV_OBJ:{read:function(e){return I.isNumber(e.h)&&I.isNumber(e.s)&&I.isNumber(e.v)?{space:"HSV",h:e.h,s:e.s,v:e.v}:!1},write:function(e){return{h:e.h,s:e.s,v:e.v}}}}}],xr=void 0,Kr=void 0,ki=function(){Kr=!1;var e=arguments.length>1?I.toArray(arguments):arguments[0];return I.each(jf,function(t){if(t.litmus(e))return I.each(t.conversions,function(r,o){if(xr=r.read(e),Kr===!1&&xr!==!1)return Kr=xr,xr.conversionName=o,xr.conversion=r,I.BREAK}),I.BREAK}),Kr},bs=void 0,Zr={hsv_to_rgb:function(e,t,r){var o=Math.floor(e/60)%6,i=e/60-Math.floor(e/60),l=r*(1-t),c=r*(1-i*t),m=r*(1-(1-i)*t),h=[[r,m,l],[c,r,l],[l,r,m],[l,c,r],[m,l,r],[r,l,c]][o];return{r:h[0]*255,g:h[1]*255,b:h[2]*255}},rgb_to_hsv:function(e,t,r){var o=Math.min(e,t,r),i=Math.max(e,t,r),l=i-o,c=void 0,m=void 0;if(i!==0)m=l/i;else return{h:NaN,s:0,v:0};return e===i?c=(t-r)/l:t===i?c=2+(r-e)/l:c=4+(e-t)/l,c/=6,c<0&&(c+=1),{h:c*360,s:m,v:i/255}},rgb_to_hex:function(e,t,r){var o=this.hex_with_component(0,2,e);return o=this.hex_with_component(o,1,t),o=this.hex_with_component(o,0,r),o},component_from_hex:function(e,t){return e>>t*8&255},hex_with_component:function(e,t,r){return r<<(bs=t*8)|e&~(255<<bs)}},Wf=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(n){return typeof n}:function(n){return n&&typeof Symbol=="function"&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},pt=function(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")},ht=function(){function n(e,t){for(var r=0;r<t.length;r++){var o=t[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),e}}(),jt=function n(e,t,r){e===null&&(e=Function.prototype);var o=Object.getOwnPropertyDescriptor(e,t);if(o===void 0){var i=Object.getPrototypeOf(e);return i===null?void 0:n(i,t,r)}else{if("value"in o)return o.value;var l=o.get;return l===void 0?void 0:l.call(r)}},Wt=function(n,e){if(typeof e!="function"&&e!==null)throw new TypeError("Super expression must either be null or a function, not "+typeof e);n.prototype=Object.create(e&&e.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(n,e):n.__proto__=e)},Yt=function(n,e){if(!n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e&&(typeof e=="object"||typeof e=="function")?e:n},Fe=function(){function n(){if(pt(this,n),this.__state=ki.apply(this,arguments),this.__state===!1)throw new Error("Failed to interpret color arguments");this.__state.a=this.__state.a||1}return ht(n,[{key:"toString",value:function(){return Dn(this)}},{key:"toHexString",value:function(){return Dn(this,!0)}},{key:"toOriginal",value:function(){return this.__state.conversion.write(this)}}]),n}();function ji(n,e,t){Object.defineProperty(n,e,{get:function(){return this.__state.space==="RGB"?this.__state[e]:(Fe.recalculateRGB(this,e,t),this.__state[e])},set:function(o){this.__state.space!=="RGB"&&(Fe.recalculateRGB(this,e,t),this.__state.space="RGB"),this.__state[e]=o}})}function Wi(n,e){Object.defineProperty(n,e,{get:function(){return this.__state.space==="HSV"?this.__state[e]:(Fe.recalculateHSV(this),this.__state[e])},set:function(r){this.__state.space!=="HSV"&&(Fe.recalculateHSV(this),this.__state.space="HSV"),this.__state[e]=r}})}Fe.recalculateRGB=function(n,e,t){if(n.__state.space==="HEX")n.__state[e]=Zr.component_from_hex(n.__state.hex,t);else if(n.__state.space==="HSV")I.extend(n.__state,Zr.hsv_to_rgb(n.__state.h,n.__state.s,n.__state.v));else throw new Error("Corrupted color state")};Fe.recalculateHSV=function(n){var e=Zr.rgb_to_hsv(n.r,n.g,n.b);I.extend(n.__state,{s:e.s,v:e.v}),I.isNaN(e.h)?I.isUndefined(n.__state.h)&&(n.__state.h=0):n.__state.h=e.h};Fe.COMPONENTS=["r","g","b","h","s","v","hex","a"];ji(Fe.prototype,"r",2);ji(Fe.prototype,"g",1);ji(Fe.prototype,"b",0);Wi(Fe.prototype,"h");Wi(Fe.prototype,"s");Wi(Fe.prototype,"v");Object.defineProperty(Fe.prototype,"a",{get:function(){return this.__state.a},set:function(e){this.__state.a=e}});Object.defineProperty(Fe.prototype,"hex",{get:function(){return this.__state.space!=="HEX"&&(this.__state.hex=Zr.rgb_to_hex(this.r,this.g,this.b),this.__state.space="HEX"),this.__state.hex},set:function(e){this.__state.space="HEX",this.__state.hex=e}});var _n=function(){function n(e,t){pt(this,n),this.initialValue=e[t],this.domElement=document.createElement("div"),this.object=e,this.property=t,this.__onChange=void 0,this.__onFinishChange=void 0}return ht(n,[{key:"onChange",value:function(t){return this.__onChange=t,this}},{key:"onFinishChange",value:function(t){return this.__onFinishChange=t,this}},{key:"setValue",value:function(t){return this.object[this.property]=t,this.__onChange&&this.__onChange.call(this,t),this.updateDisplay(),this}},{key:"getValue",value:function(){return this.object[this.property]}},{key:"updateDisplay",value:function(){return this}},{key:"isModified",value:function(){return this.initialValue!==this.getValue()}}]),n}(),Yf={HTMLEvents:["change"],MouseEvents:["click","mousemove","mousedown","mouseup","mouseover"],KeyboardEvents:["keydown"]},As={};I.each(Yf,function(n,e){I.each(n,function(t){As[t]=e})});var qf=/(\d+(\.\d+)?)px/;function xt(n){if(n==="0"||I.isUndefined(n))return 0;var e=n.match(qf);return I.isNull(e)?0:parseFloat(e[1])}var M={makeSelectable:function(e,t){e===void 0||e.style===void 0||(e.onselectstart=t?function(){return!1}:function(){},e.style.MozUserSelect=t?"auto":"none",e.style.KhtmlUserSelect=t?"auto":"none",e.unselectable=t?"on":"off")},makeFullscreen:function(e,t,r){var o=r,i=t;I.isUndefined(i)&&(i=!0),I.isUndefined(o)&&(o=!0),e.style.position="absolute",i&&(e.style.left=0,e.style.right=0),o&&(e.style.top=0,e.style.bottom=0)},fakeEvent:function(e,t,r,o){var i=r||{},l=As[t];if(!l)throw new Error("Event type "+t+" not supported.");var c=document.createEvent(l);switch(l){case"MouseEvents":{var m=i.x||i.clientX||0,h=i.y||i.clientY||0;c.initMouseEvent(t,i.bubbles||!1,i.cancelable||!0,window,i.clickCount||1,0,0,m,h,!1,!1,!1,!1,0,null);break}case"KeyboardEvents":{var g=c.initKeyboardEvent||c.initKeyEvent;I.defaults(i,{cancelable:!0,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,keyCode:void 0,charCode:void 0}),g(t,i.bubbles||!1,i.cancelable,window,i.ctrlKey,i.altKey,i.shiftKey,i.metaKey,i.keyCode,i.charCode);break}default:{c.initEvent(t,i.bubbles||!1,i.cancelable||!0);break}}I.defaults(c,o),e.dispatchEvent(c)},bind:function(e,t,r,o){var i=o||!1;return e.addEventListener?e.addEventListener(t,r,i):e.attachEvent&&e.attachEvent("on"+t,r),M},unbind:function(e,t,r,o){var i=o||!1;return e.removeEventListener?e.removeEventListener(t,r,i):e.detachEvent&&e.detachEvent("on"+t,r),M},addClass:function(e,t){if(e.className===void 0)e.className=t;else if(e.className!==t){var r=e.className.split(/ +/);r.indexOf(t)===-1&&(r.push(t),e.className=r.join(" ").replace(/^\s+/,"").replace(/\s+$/,""))}return M},removeClass:function(e,t){if(t)if(e.className===t)e.removeAttribute("class");else{var r=e.className.split(/ +/),o=r.indexOf(t);o!==-1&&(r.splice(o,1),e.className=r.join(" "))}else e.className=void 0;return M},hasClass:function(e,t){return new RegExp("(?:^|\\s+)"+t+"(?:\\s+|$)").test(e.className)||!1},getWidth:function(e){var t=getComputedStyle(e);return xt(t["border-left-width"])+xt(t["border-right-width"])+xt(t["padding-left"])+xt(t["padding-right"])+xt(t.width)},getHeight:function(e){var t=getComputedStyle(e);return xt(t["border-top-width"])+xt(t["border-bottom-width"])+xt(t["padding-top"])+xt(t["padding-bottom"])+xt(t.height)},getOffset:function(e){var t=e,r={left:0,top:0};if(t.offsetParent)do r.left+=t.offsetLeft,r.top+=t.offsetTop,t=t.offsetParent;while(t);return r},isActive:function(e){return e===document.activeElement&&(e.type||e.href)}},Is=function(n){Wt(e,n);function e(t,r){pt(this,e);var o=Yt(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,r)),i=o;o.__prev=o.getValue(),o.__checkbox=document.createElement("input"),o.__checkbox.setAttribute("type","checkbox");function l(){i.setValue(!i.__prev)}return M.bind(o.__checkbox,"change",l,!1),o.domElement.appendChild(o.__checkbox),o.updateDisplay(),o}return ht(e,[{key:"setValue",value:function(r){var o=jt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"setValue",this).call(this,r);return this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue()),this.__prev=this.getValue(),o}},{key:"updateDisplay",value:function(){return this.getValue()===!0?(this.__checkbox.setAttribute("checked","checked"),this.__checkbox.checked=!0,this.__prev=!0):(this.__checkbox.checked=!1,this.__prev=!1),jt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this)}}]),e}(_n),Xf=function(n){Wt(e,n);function e(t,r,o){pt(this,e);var i=Yt(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,r)),l=o,c=i;if(i.__select=document.createElement("select"),I.isArray(l)){var m={};I.each(l,function(h){m[h]=h}),l=m}return I.each(l,function(h,g){var _=document.createElement("option");_.innerHTML=g,_.setAttribute("value",h),c.__select.appendChild(_)}),i.updateDisplay(),M.bind(i.__select,"change",function(){var h=this.options[this.selectedIndex].value;c.setValue(h)}),i.domElement.appendChild(i.__select),i}return ht(e,[{key:"setValue",value:function(r){var o=jt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"setValue",this).call(this,r);return this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue()),o}},{key:"updateDisplay",value:function(){return M.isActive(this.__select)?this:(this.__select.value=this.getValue(),jt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this))}}]),e}(_n),Kf=function(n){Wt(e,n);function e(t,r){pt(this,e);var o=Yt(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,r)),i=o;function l(){i.setValue(i.__input.value)}function c(){i.__onFinishChange&&i.__onFinishChange.call(i,i.getValue())}return o.__input=document.createElement("input"),o.__input.setAttribute("type","text"),M.bind(o.__input,"keyup",l),M.bind(o.__input,"change",l),M.bind(o.__input,"blur",c),M.bind(o.__input,"keydown",function(m){m.keyCode===13&&this.blur()}),o.updateDisplay(),o.domElement.appendChild(o.__input),o}return ht(e,[{key:"updateDisplay",value:function(){return M.isActive(this.__input)||(this.__input.value=this.getValue()),jt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this)}}]),e}(_n);function vs(n){var e=n.toString();return e.indexOf(".")>-1?e.length-e.indexOf(".")-1:0}var Rs=function(n){Wt(e,n);function e(t,r,o){pt(this,e);var i=Yt(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,r)),l=o||{};return i.__min=l.min,i.__max=l.max,i.__step=l.step,I.isUndefined(i.__step)?i.initialValue===0?i.__impliedStep=1:i.__impliedStep=Math.pow(10,Math.floor(Math.log(Math.abs(i.initialValue))/Math.LN10))/10:i.__impliedStep=i.__step,i.__precision=vs(i.__impliedStep),i}return ht(e,[{key:"setValue",value:function(r){var o=r;return this.__min!==void 0&&o<this.__min?o=this.__min:this.__max!==void 0&&o>this.__max&&(o=this.__max),this.__step!==void 0&&o%this.__step!==0&&(o=Math.round(o/this.__step)*this.__step),jt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"setValue",this).call(this,o)}},{key:"min",value:function(r){return this.__min=r,this}},{key:"max",value:function(r){return this.__max=r,this}},{key:"step",value:function(r){return this.__step=r,this.__impliedStep=r,this.__precision=vs(r),this}}]),e}(_n);function Jf(n,e){var t=Math.pow(10,e);return Math.round(n*t)/t}var Qr=function(n){Wt(e,n);function e(t,r,o){pt(this,e);var i=Yt(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,r,o));i.__truncationSuspended=!1;var l=i,c=void 0;function m(){var S=parseFloat(l.__input.value);I.isNaN(S)||l.setValue(S)}function h(){l.__onFinishChange&&l.__onFinishChange.call(l,l.getValue())}function g(){h()}function _(S){var w=c-S.clientY;l.setValue(l.getValue()+w*l.__impliedStep),c=S.clientY}function x(){M.unbind(window,"mousemove",_),M.unbind(window,"mouseup",x),h()}function T(S){M.bind(window,"mousemove",_),M.bind(window,"mouseup",x),c=S.clientY}return i.__input=document.createElement("input"),i.__input.setAttribute("type","text"),M.bind(i.__input,"change",m),M.bind(i.__input,"blur",g),M.bind(i.__input,"mousedown",T),M.bind(i.__input,"keydown",function(S){S.keyCode===13&&(l.__truncationSuspended=!0,this.blur(),l.__truncationSuspended=!1,h())}),i.updateDisplay(),i.domElement.appendChild(i.__input),i}return ht(e,[{key:"updateDisplay",value:function(){return this.__input.value=this.__truncationSuspended?this.getValue():Jf(this.getValue(),this.__precision),jt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this)}}]),e}(Rs);function xs(n,e,t,r,o){return r+(o-r)*((n-e)/(t-e))}var Gi=function(n){Wt(e,n);function e(t,r,o,i,l){pt(this,e);var c=Yt(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,r,{min:o,max:i,step:l})),m=c;c.__background=document.createElement("div"),c.__foreground=document.createElement("div"),M.bind(c.__background,"mousedown",h),M.bind(c.__background,"touchstart",x),M.addClass(c.__background,"slider"),M.addClass(c.__foreground,"slider-fg");function h(w){document.activeElement.blur(),M.bind(window,"mousemove",g),M.bind(window,"mouseup",_),g(w)}function g(w){w.preventDefault();var E=m.__background.getBoundingClientRect();return m.setValue(xs(w.clientX,E.left,E.right,m.__min,m.__max)),!1}function _(){M.unbind(window,"mousemove",g),M.unbind(window,"mouseup",_),m.__onFinishChange&&m.__onFinishChange.call(m,m.getValue())}function x(w){w.touches.length===1&&(M.bind(window,"touchmove",T),M.bind(window,"touchend",S),T(w))}function T(w){var E=w.touches[0].clientX,R=m.__background.getBoundingClientRect();m.setValue(xs(E,R.left,R.right,m.__min,m.__max))}function S(){M.unbind(window,"touchmove",T),M.unbind(window,"touchend",S),m.__onFinishChange&&m.__onFinishChange.call(m,m.getValue())}return c.updateDisplay(),c.__background.appendChild(c.__foreground),c.domElement.appendChild(c.__background),c}return ht(e,[{key:"updateDisplay",value:function(){var r=(this.getValue()-this.__min)/(this.__max-this.__min);return this.__foreground.style.width=r*100+"%",jt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"updateDisplay",this).call(this)}}]),e}(Rs),Cs=function(n){Wt(e,n);function e(t,r,o){pt(this,e);var i=Yt(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,r)),l=i;return i.__button=document.createElement("div"),i.__button.innerHTML=o===void 0?"Fire":o,M.bind(i.__button,"click",function(c){return c.preventDefault(),l.fire(),!1}),M.addClass(i.__button,"button"),i.domElement.appendChild(i.__button),i}return ht(e,[{key:"fire",value:function(){this.__onChange&&this.__onChange.call(this),this.getValue().call(this.object),this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue())}}]),e}(_n),zi=function(n){Wt(e,n);function e(t,r){pt(this,e);var o=Yt(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,r));o.__color=new Fe(o.getValue()),o.__temp=new Fe(0);var i=o;o.domElement=document.createElement("div"),M.makeSelectable(o.domElement,!1),o.__selector=document.createElement("div"),o.__selector.className="selector",o.__saturation_field=document.createElement("div"),o.__saturation_field.className="saturation-field",o.__field_knob=document.createElement("div"),o.__field_knob.className="field-knob",o.__field_knob_border="2px solid ",o.__hue_knob=document.createElement("div"),o.__hue_knob.className="hue-knob",o.__hue_field=document.createElement("div"),o.__hue_field.className="hue-field",o.__input=document.createElement("input"),o.__input.type="text",o.__input_textShadow="0 1px 1px ",M.bind(o.__input,"keydown",function(w){w.keyCode===13&&_.call(this)}),M.bind(o.__input,"blur",_),M.bind(o.__selector,"mousedown",function(){M.addClass(this,"drag").bind(window,"mouseup",function(){M.removeClass(i.__selector,"drag")})}),M.bind(o.__selector,"touchstart",function(){M.addClass(this,"drag").bind(window,"touchend",function(){M.removeClass(i.__selector,"drag")})});var l=document.createElement("div");I.extend(o.__selector.style,{width:"122px",height:"102px",padding:"3px",backgroundColor:"#222",boxShadow:"0px 1px 3px rgba(0,0,0,0.3)"}),I.extend(o.__field_knob.style,{position:"absolute",width:"12px",height:"12px",border:o.__field_knob_border+(o.__color.v<.5?"#fff":"#000"),boxShadow:"0px 1px 3px rgba(0,0,0,0.5)",borderRadius:"12px",zIndex:1}),I.extend(o.__hue_knob.style,{position:"absolute",width:"15px",height:"2px",borderRight:"4px solid #fff",zIndex:1}),I.extend(o.__saturation_field.style,{width:"100px",height:"100px",border:"1px solid #555",marginRight:"3px",display:"inline-block",cursor:"pointer"}),I.extend(l.style,{width:"100%",height:"100%",background:"none"}),ys(l,"top","rgba(0,0,0,0)","#000"),I.extend(o.__hue_field.style,{width:"15px",height:"100px",border:"1px solid #555",cursor:"ns-resize",position:"absolute",top:"3px",right:"3px"}),Qf(o.__hue_field),I.extend(o.__input.style,{outline:"none",textAlign:"center",color:"#fff",border:0,fontWeight:"bold",textShadow:o.__input_textShadow+"rgba(0,0,0,0.7)"}),M.bind(o.__saturation_field,"mousedown",c),M.bind(o.__saturation_field,"touchstart",c),M.bind(o.__field_knob,"mousedown",c),M.bind(o.__field_knob,"touchstart",c),M.bind(o.__hue_field,"mousedown",m),M.bind(o.__hue_field,"touchstart",m);function c(w){T(w),M.bind(window,"mousemove",T),M.bind(window,"touchmove",T),M.bind(window,"mouseup",h),M.bind(window,"touchend",h)}function m(w){S(w),M.bind(window,"mousemove",S),M.bind(window,"touchmove",S),M.bind(window,"mouseup",g),M.bind(window,"touchend",g)}function h(){M.unbind(window,"mousemove",T),M.unbind(window,"touchmove",T),M.unbind(window,"mouseup",h),M.unbind(window,"touchend",h),x()}function g(){M.unbind(window,"mousemove",S),M.unbind(window,"touchmove",S),M.unbind(window,"mouseup",g),M.unbind(window,"touchend",g),x()}function _(){var w=ki(this.value);w!==!1?(i.__color.__state=w,i.setValue(i.__color.toOriginal())):this.value=i.__color.toString()}function x(){i.__onFinishChange&&i.__onFinishChange.call(i,i.__color.toOriginal())}o.__saturation_field.appendChild(l),o.__selector.appendChild(o.__field_knob),o.__selector.appendChild(o.__saturation_field),o.__selector.appendChild(o.__hue_field),o.__hue_field.appendChild(o.__hue_knob),o.domElement.appendChild(o.__input),o.domElement.appendChild(o.__selector),o.updateDisplay();function T(w){w.type.indexOf("touch")===-1&&w.preventDefault();var E=i.__saturation_field.getBoundingClientRect(),R=w.touches&&w.touches[0]||w,C=R.clientX,N=R.clientY,L=(C-E.left)/(E.right-E.left),D=1-(N-E.top)/(E.bottom-E.top);return D>1?D=1:D<0&&(D=0),L>1?L=1:L<0&&(L=0),i.__color.v=D,i.__color.s=L,i.setValue(i.__color.toOriginal()),!1}function S(w){w.type.indexOf("touch")===-1&&w.preventDefault();var E=i.__hue_field.getBoundingClientRect(),R=w.touches&&w.touches[0]||w,C=R.clientY,N=1-(C-E.top)/(E.bottom-E.top);return N>1?N=1:N<0&&(N=0),i.__color.h=N*360,i.setValue(i.__color.toOriginal()),!1}return o}return ht(e,[{key:"updateDisplay",value:function(){var r=ki(this.getValue());if(r!==!1){var o=!1;I.each(Fe.COMPONENTS,function(c){if(!I.isUndefined(r[c])&&!I.isUndefined(this.__color.__state[c])&&r[c]!==this.__color.__state[c])return o=!0,{}},this),o&&I.extend(this.__color.__state,r)}I.extend(this.__temp.__state,this.__color.__state),this.__temp.a=1;var i=this.__color.v<.5||this.__color.s>.5?255:0,l=255-i;I.extend(this.__field_knob.style,{marginLeft:100*this.__color.s-7+"px",marginTop:100*(1-this.__color.v)-7+"px",backgroundColor:this.__temp.toHexString(),border:this.__field_knob_border+"rgb("+i+","+i+","+i+")"}),this.__hue_knob.style.marginTop=(1-this.__color.h/360)*100+"px",this.__temp.s=1,this.__temp.v=1,ys(this.__saturation_field,"left","#fff",this.__temp.toHexString()),this.__input.value=this.__color.toString(),I.extend(this.__input.style,{backgroundColor:this.__color.toHexString(),color:"rgb("+i+","+i+","+i+")",textShadow:this.__input_textShadow+"rgba("+l+","+l+","+l+",.7)"})}}]),e}(_n),Zf=["-moz-","-o-","-webkit-","-ms-",""];function ys(n,e,t,r){n.style.background="",I.each(Zf,function(o){n.style.cssText+="background: "+o+"linear-gradient("+e+", "+t+" 0%, "+r+" 100%); "})}function Qf(n){n.style.background="",n.style.cssText+="background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);",n.style.cssText+="background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",n.style.cssText+="background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",n.style.cssText+="background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",n.style.cssText+="background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);"}var ed={load:function(e,t){var r=t||document,o=r.createElement("link");o.type="text/css",o.rel="stylesheet",o.href=e,r.getElementsByTagName("head")[0].appendChild(o)},inject:function(e,t){var r=t||document,o=document.createElement("style");o.type="text/css",o.innerHTML=e;var i=r.getElementsByTagName("head")[0];try{i.appendChild(o)}catch{}}},td=`<div id="dg-save" class="dg dialogue">

  Here's the new load parameter for your <code>GUI</code>'s constructor:

  <textarea id="dg-new-constructor"></textarea>

  <div id="dg-save-locally">

    <input id="dg-local-storage" type="checkbox"/> Automatically save
    values to <code>localStorage</code> on exit.

    <div id="dg-local-explain">The values saved to <code>localStorage</code> will
      override those passed to <code>dat.GUI</code>'s constructor. This makes it
      easier to work incrementally, but <code>localStorage</code> is fragile,
      and your friends may not see the same values you do.

    </div>

  </div>

</div>`,nd=function(e,t){var r=e[t];return I.isArray(arguments[2])||I.isObject(arguments[2])?new Xf(e,t,arguments[2]):I.isNumber(r)?I.isNumber(arguments[2])&&I.isNumber(arguments[3])?I.isNumber(arguments[4])?new Gi(e,t,arguments[2],arguments[3],arguments[4]):new Gi(e,t,arguments[2],arguments[3]):I.isNumber(arguments[4])?new Qr(e,t,{min:arguments[2],max:arguments[3],step:arguments[4]}):new Qr(e,t,{min:arguments[2],max:arguments[3]}):I.isString(r)?new Kf(e,t):I.isFunction(r)?new Cs(e,t,""):I.isBoolean(r)?new Is(e,t):null};function rd(n){setTimeout(n,1e3/60)}var od=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||rd,id=function(){function n(){pt(this,n),this.backgroundElement=document.createElement("div"),I.extend(this.backgroundElement.style,{backgroundColor:"rgba(0,0,0,0.8)",top:0,left:0,display:"none",zIndex:"1000",opacity:0,WebkitTransition:"opacity 0.2s linear",transition:"opacity 0.2s linear"}),M.makeFullscreen(this.backgroundElement),this.backgroundElement.style.position="fixed",this.domElement=document.createElement("div"),I.extend(this.domElement.style,{position:"fixed",display:"none",zIndex:"1001",opacity:0,WebkitTransition:"-webkit-transform 0.2s ease-out, opacity 0.2s linear",transition:"transform 0.2s ease-out, opacity 0.2s linear"}),document.body.appendChild(this.backgroundElement),document.body.appendChild(this.domElement);var e=this;M.bind(this.backgroundElement,"click",function(){e.hide()})}return ht(n,[{key:"show",value:function(){var t=this;this.backgroundElement.style.display="block",this.domElement.style.display="block",this.domElement.style.opacity=0,this.domElement.style.webkitTransform="scale(1.1)",this.layout(),I.defer(function(){t.backgroundElement.style.opacity=1,t.domElement.style.opacity=1,t.domElement.style.webkitTransform="scale(1)"})}},{key:"hide",value:function(){var t=this,r=function o(){t.domElement.style.display="none",t.backgroundElement.style.display="none",M.unbind(t.domElement,"webkitTransitionEnd",o),M.unbind(t.domElement,"transitionend",o),M.unbind(t.domElement,"oTransitionEnd",o)};M.bind(this.domElement,"webkitTransitionEnd",r),M.bind(this.domElement,"transitionend",r),M.bind(this.domElement,"oTransitionEnd",r),this.backgroundElement.style.opacity=0,this.domElement.style.opacity=0,this.domElement.style.webkitTransform="scale(1.1)"}},{key:"layout",value:function(){this.domElement.style.left=window.innerWidth/2-M.getWidth(this.domElement)/2+"px",this.domElement.style.top=window.innerHeight/2-M.getHeight(this.domElement)/2+"px"}}]),n}(),ad=Hf(`.dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .cr.function .property-name{width:100%}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}
`);ed.inject(ad);var ws="dg",Es=72,Ms=20,Mr="Default",yr=function(){try{return!!window.localStorage}catch{return!1}}(),wr=void 0,Ss=!0,Cn=void 0,Li=!1,Bs=[],ge=function n(e){var t=this,r=e||{};this.domElement=document.createElement("div"),this.__ul=document.createElement("ul"),this.domElement.appendChild(this.__ul),M.addClass(this.domElement,ws),this.__folders={},this.__controllers=[],this.__rememberedObjects=[],this.__rememberedObjectIndecesToControllers=[],this.__listening=[],r=I.defaults(r,{closeOnTop:!1,autoPlace:!0,width:n.DEFAULT_WIDTH}),r=I.defaults(r,{resizable:r.autoPlace,hideable:r.autoPlace}),I.isUndefined(r.load)?r.load={preset:Mr}:r.preset&&(r.load.preset=r.preset),I.isUndefined(r.parent)&&r.hideable&&Bs.push(this),r.resizable=I.isUndefined(r.parent)&&r.resizable,r.autoPlace&&I.isUndefined(r.scrollable)&&(r.scrollable=!0);var o=yr&&localStorage.getItem(Bn(this,"isLocal"))==="true",i=void 0,l=void 0;if(Object.defineProperties(this,{parent:{get:function(){return r.parent}},scrollable:{get:function(){return r.scrollable}},autoPlace:{get:function(){return r.autoPlace}},closeOnTop:{get:function(){return r.closeOnTop}},preset:{get:function(){return t.parent?t.getRoot().preset:r.load.preset},set:function(x){t.parent?t.getRoot().preset=x:r.load.preset=x,cd(this),t.revert()}},width:{get:function(){return r.width},set:function(x){r.width=x,Hi(t,x)}},name:{get:function(){return r.name},set:function(x){r.name=x,l&&(l.innerHTML=r.name)}},closed:{get:function(){return r.closed},set:function(x){r.closed=x,r.closed?M.addClass(t.__ul,n.CLASS_CLOSED):M.removeClass(t.__ul,n.CLASS_CLOSED),this.onResize(),t.__closeButton&&(t.__closeButton.innerHTML=x?n.TEXT_OPEN:n.TEXT_CLOSED)}},load:{get:function(){return r.load}},useLocalStorage:{get:function(){return o},set:function(x){yr&&(o=x,x?M.bind(window,"unload",i):M.unbind(window,"unload",i),localStorage.setItem(Bn(t,"isLocal"),x))}}}),I.isUndefined(r.parent)){if(this.closed=r.closed||!1,M.addClass(this.domElement,n.CLASS_MAIN),M.makeSelectable(this.domElement,!1),yr&&o){t.useLocalStorage=!0;var c=localStorage.getItem(Bn(this,"gui"));c&&(r.load=JSON.parse(c))}this.__closeButton=document.createElement("div"),this.__closeButton.innerHTML=n.TEXT_CLOSED,M.addClass(this.__closeButton,n.CLASS_CLOSE_BUTTON),r.closeOnTop?(M.addClass(this.__closeButton,n.CLASS_CLOSE_TOP),this.domElement.insertBefore(this.__closeButton,this.domElement.childNodes[0])):(M.addClass(this.__closeButton,n.CLASS_CLOSE_BOTTOM),this.domElement.appendChild(this.__closeButton)),M.bind(this.__closeButton,"click",function(){t.closed=!t.closed})}else{r.closed===void 0&&(r.closed=!0);var m=document.createTextNode(r.name);M.addClass(m,"controller-name"),l=Yi(t,m);var h=function(x){return x.preventDefault(),t.closed=!t.closed,!1};M.addClass(this.__ul,n.CLASS_CLOSED),M.addClass(l,"title"),M.bind(l,"click",h),r.closed||(this.closed=!1)}r.autoPlace&&(I.isUndefined(r.parent)&&(Ss&&(Cn=document.createElement("div"),M.addClass(Cn,ws),M.addClass(Cn,n.CLASS_AUTO_PLACE_CONTAINER),document.body.appendChild(Cn),Ss=!1),Cn.appendChild(this.domElement),M.addClass(this.domElement,n.CLASS_AUTO_PLACE)),this.parent||Hi(t,r.width)),this.__resizeHandler=function(){t.onResizeDebounced()},M.bind(window,"resize",this.__resizeHandler),M.bind(this.__ul,"webkitTransitionEnd",this.__resizeHandler),M.bind(this.__ul,"transitionend",this.__resizeHandler),M.bind(this.__ul,"oTransitionEnd",this.__resizeHandler),this.onResize(),r.resizable&&ud(this),i=function(){yr&&localStorage.getItem(Bn(t,"isLocal"))==="true"&&localStorage.setItem(Bn(t,"gui"),JSON.stringify(t.getSaveObject()))},this.saveToLocalStorageIfPossible=i;function g(){var _=t.getRoot();_.width+=1,I.defer(function(){_.width-=1})}r.parent||g()};ge.toggleHide=function(){Li=!Li,I.each(Bs,function(n){n.domElement.style.display=Li?"none":""})};ge.CLASS_AUTO_PLACE="a";ge.CLASS_AUTO_PLACE_CONTAINER="ac";ge.CLASS_MAIN="main";ge.CLASS_CONTROLLER_ROW="cr";ge.CLASS_TOO_TALL="taller-than-window";ge.CLASS_CLOSED="closed";ge.CLASS_CLOSE_BUTTON="close-button";ge.CLASS_CLOSE_TOP="close-top";ge.CLASS_CLOSE_BOTTOM="close-bottom";ge.CLASS_DRAG="drag";ge.DEFAULT_WIDTH=245;ge.TEXT_CLOSED="Close Controls";ge.TEXT_OPEN="Open Controls";ge._keydownHandler=function(n){document.activeElement.type!=="text"&&(n.which===Es||n.keyCode===Es)&&ge.toggleHide()};M.bind(window,"keydown",ge._keydownHandler,!1);I.extend(ge.prototype,{add:function(e,t){return Er(this,e,t,{factoryArgs:Array.prototype.slice.call(arguments,2)})},addColor:function(e,t){return Er(this,e,t,{color:!0})},remove:function(e){this.__ul.removeChild(e.__li),this.__controllers.splice(this.__controllers.indexOf(e),1);var t=this;I.defer(function(){t.onResize()})},destroy:function(){if(this.parent)throw new Error("Only the root GUI should be removed with .destroy(). For subfolders, use gui.removeFolder(folder) instead.");this.autoPlace&&Cn.removeChild(this.domElement);var e=this;I.each(this.__folders,function(t){e.removeFolder(t)}),M.unbind(window,"keydown",ge._keydownHandler,!1),Ps(this)},addFolder:function(e){if(this.__folders[e]!==void 0)throw new Error('You already have a folder in this GUI by the name "'+e+'"');var t={name:e,parent:this};t.autoPlace=this.autoPlace,this.load&&this.load.folders&&this.load.folders[e]&&(t.closed=this.load.folders[e].closed,t.load=this.load.folders[e]);var r=new ge(t);this.__folders[e]=r;var o=Yi(this,r.domElement);return M.addClass(o,"folder"),r},removeFolder:function(e){this.__ul.removeChild(e.domElement.parentElement),delete this.__folders[e.name],this.load&&this.load.folders&&this.load.folders[e.name]&&delete this.load.folders[e.name],Ps(e);var t=this;I.each(e.__folders,function(r){e.removeFolder(r)}),I.defer(function(){t.onResize()})},open:function(){this.closed=!1},close:function(){this.closed=!0},hide:function(){this.domElement.style.display="none"},show:function(){this.domElement.style.display=""},onResize:function(){var e=this.getRoot();if(e.scrollable){var t=M.getOffset(e.__ul).top,r=0;I.each(e.__ul.childNodes,function(o){e.autoPlace&&o===e.__save_row||(r+=M.getHeight(o))}),window.innerHeight-t-Ms<r?(M.addClass(e.domElement,ge.CLASS_TOO_TALL),e.__ul.style.height=window.innerHeight-t-Ms+"px"):(M.removeClass(e.domElement,ge.CLASS_TOO_TALL),e.__ul.style.height="auto")}e.__resize_handle&&I.defer(function(){e.__resize_handle.style.height=e.__ul.offsetHeight+"px"}),e.__closeButton&&(e.__closeButton.style.width=e.width+"px")},onResizeDebounced:I.debounce(function(){this.onResize()},50),remember:function(){if(I.isUndefined(wr)&&(wr=new id,wr.domElement.innerHTML=td),this.parent)throw new Error("You can only call remember on a top level GUI.");var e=this;I.each(Array.prototype.slice.call(arguments),function(t){e.__rememberedObjects.length===0&&ld(e),e.__rememberedObjects.indexOf(t)===-1&&e.__rememberedObjects.push(t)}),this.autoPlace&&Hi(this,this.width)},getRoot:function(){for(var e=this;e.parent;)e=e.parent;return e},getSaveObject:function(){var e=this.load;return e.closed=this.closed,this.__rememberedObjects.length>0&&(e.preset=this.preset,e.remembered||(e.remembered={}),e.remembered[this.preset]=Jr(this)),e.folders={},I.each(this.__folders,function(t,r){e.folders[r]=t.getSaveObject()}),e},save:function(){this.load.remembered||(this.load.remembered={}),this.load.remembered[this.preset]=Jr(this),Vi(this,!1),this.saveToLocalStorageIfPossible()},saveAs:function(e){this.load.remembered||(this.load.remembered={},this.load.remembered[Mr]=Jr(this,!0)),this.load.remembered[e]=Jr(this),this.preset=e,$i(this,e,!0),this.saveToLocalStorageIfPossible()},revert:function(e){I.each(this.__controllers,function(t){this.getRoot().load.remembered?Ds(e||this.getRoot(),t):t.setValue(t.initialValue),t.__onFinishChange&&t.__onFinishChange.call(t,t.getValue())},this),I.each(this.__folders,function(t){t.revert(t)}),e||Vi(this.getRoot(),!1)},listen:function(e){var t=this.__listening.length===0;this.__listening.push(e),t&&Os(this.__listening)},updateDisplay:function(){I.each(this.__controllers,function(e){e.updateDisplay()}),I.each(this.__folders,function(e){e.updateDisplay()})}});function Yi(n,e,t){var r=document.createElement("li");return e&&r.appendChild(e),t?n.__ul.insertBefore(r,t):n.__ul.appendChild(r),n.onResize(),r}function Ps(n){M.unbind(window,"resize",n.__resizeHandler),n.saveToLocalStorageIfPossible&&M.unbind(window,"unload",n.saveToLocalStorageIfPossible)}function Vi(n,e){var t=n.__preset_select[n.__preset_select.selectedIndex];e?t.innerHTML=t.value+"*":t.innerHTML=t.value}function sd(n,e,t){if(t.__li=e,t.__gui=n,I.extend(t,{options:function(l){if(arguments.length>1){var c=t.__li.nextElementSibling;return t.remove(),Er(n,t.object,t.property,{before:c,factoryArgs:[I.toArray(arguments)]})}if(I.isArray(l)||I.isObject(l)){var m=t.__li.nextElementSibling;return t.remove(),Er(n,t.object,t.property,{before:m,factoryArgs:[l]})}},name:function(l){return t.__li.firstElementChild.firstElementChild.innerHTML=l,t},listen:function(){return t.__gui.listen(t),t},remove:function(){return t.__gui.remove(t),t}}),t instanceof Gi){var r=new Qr(t.object,t.property,{min:t.__min,max:t.__max,step:t.__step});I.each(["updateDisplay","onChange","onFinishChange","step","min","max"],function(i){var l=t[i],c=r[i];t[i]=r[i]=function(){var m=Array.prototype.slice.call(arguments);return c.apply(r,m),l.apply(t,m)}}),M.addClass(e,"has-slider"),t.domElement.insertBefore(r.domElement,t.domElement.firstElementChild)}else if(t instanceof Qr){var o=function(l){if(I.isNumber(t.__min)&&I.isNumber(t.__max)){var c=t.__li.firstElementChild.firstElementChild.innerHTML,m=t.__gui.__listening.indexOf(t)>-1;t.remove();var h=Er(n,t.object,t.property,{before:t.__li.nextElementSibling,factoryArgs:[t.__min,t.__max,t.__step]});return h.name(c),m&&h.listen(),h}return l};t.min=I.compose(o,t.min),t.max=I.compose(o,t.max)}else t instanceof Is?(M.bind(e,"click",function(){M.fakeEvent(t.__checkbox,"click")}),M.bind(t.__checkbox,"click",function(i){i.stopPropagation()})):t instanceof Cs?(M.bind(e,"click",function(){M.fakeEvent(t.__button,"click")}),M.bind(e,"mouseover",function(){M.addClass(t.__button,"hover")}),M.bind(e,"mouseout",function(){M.removeClass(t.__button,"hover")})):t instanceof zi&&(M.addClass(e,"color"),t.updateDisplay=I.compose(function(i){return e.style.borderLeftColor=t.__color.toString(),i},t.updateDisplay),t.updateDisplay());t.setValue=I.compose(function(i){return n.getRoot().__preset_select&&t.isModified()&&Vi(n.getRoot(),!0),i},t.setValue)}function Ds(n,e){var t=n.getRoot(),r=t.__rememberedObjects.indexOf(e.object);if(r!==-1){var o=t.__rememberedObjectIndecesToControllers[r];if(o===void 0&&(o={},t.__rememberedObjectIndecesToControllers[r]=o),o[e.property]=e,t.load&&t.load.remembered){var i=t.load.remembered,l=void 0;if(i[n.preset])l=i[n.preset];else if(i[Mr])l=i[Mr];else return;if(l[r]&&l[r][e.property]!==void 0){var c=l[r][e.property];e.initialValue=c,e.setValue(c)}}}}function Er(n,e,t,r){if(e[t]===void 0)throw new Error('Object "'+e+'" has no property "'+t+'"');var o=void 0;if(r.color)o=new zi(e,t);else{var i=[e,t].concat(r.factoryArgs);o=nd.apply(n,i)}r.before instanceof _n&&(r.before=r.before.__li),Ds(n,o),M.addClass(o.domElement,"c");var l=document.createElement("span");M.addClass(l,"property-name"),l.innerHTML=o.property;var c=document.createElement("div");c.appendChild(l),c.appendChild(o.domElement);var m=Yi(n,c,r.before);return M.addClass(m,ge.CLASS_CONTROLLER_ROW),o instanceof zi?M.addClass(m,"color"):M.addClass(m,Wf(o.getValue())),sd(n,m,o),n.__controllers.push(o),o}function Bn(n,e){return document.location.href+"."+e}function $i(n,e,t){var r=document.createElement("option");r.innerHTML=e,r.value=e,n.__preset_select.appendChild(r),t&&(n.__preset_select.selectedIndex=n.__preset_select.length-1)}function Ts(n,e){e.style.display=n.useLocalStorage?"block":"none"}function ld(n){var e=n.__save_row=document.createElement("li");M.addClass(n.domElement,"has-save"),n.__ul.insertBefore(e,n.__ul.firstChild),M.addClass(e,"save-row");var t=document.createElement("span");t.innerHTML="&nbsp;",M.addClass(t,"button gears");var r=document.createElement("span");r.innerHTML="Save",M.addClass(r,"button"),M.addClass(r,"save");var o=document.createElement("span");o.innerHTML="New",M.addClass(o,"button"),M.addClass(o,"save-as");var i=document.createElement("span");i.innerHTML="Revert",M.addClass(i,"button"),M.addClass(i,"revert");var l=n.__preset_select=document.createElement("select");if(n.load&&n.load.remembered?I.each(n.load.remembered,function(_,x){$i(n,x,x===n.preset)}):$i(n,Mr,!1),M.bind(l,"change",function(){for(var _=0;_<n.__preset_select.length;_++)n.__preset_select[_].innerHTML=n.__preset_select[_].value;n.preset=this.value}),e.appendChild(l),e.appendChild(t),e.appendChild(r),e.appendChild(o),e.appendChild(i),yr){var c=document.getElementById("dg-local-explain"),m=document.getElementById("dg-local-storage"),h=document.getElementById("dg-save-locally");h.style.display="block",localStorage.getItem(Bn(n,"isLocal"))==="true"&&m.setAttribute("checked","checked"),Ts(n,c),M.bind(m,"change",function(){n.useLocalStorage=!n.useLocalStorage,Ts(n,c)})}var g=document.getElementById("dg-new-constructor");M.bind(g,"keydown",function(_){_.metaKey&&(_.which===67||_.keyCode===67)&&wr.hide()}),M.bind(t,"click",function(){g.innerHTML=JSON.stringify(n.getSaveObject(),void 0,2),wr.show(),g.focus(),g.select()}),M.bind(r,"click",function(){n.save()}),M.bind(o,"click",function(){var _=prompt("Enter a new preset name.");_&&n.saveAs(_)}),M.bind(i,"click",function(){n.revert()})}function ud(n){var e=void 0;n.__resize_handle=document.createElement("div"),I.extend(n.__resize_handle.style,{width:"6px",marginLeft:"-3px",height:"200px",cursor:"ew-resize",position:"absolute"});function t(i){return i.preventDefault(),n.width+=e-i.clientX,n.onResize(),e=i.clientX,!1}function r(){M.removeClass(n.__closeButton,ge.CLASS_DRAG),M.unbind(window,"mousemove",t),M.unbind(window,"mouseup",r)}function o(i){return i.preventDefault(),e=i.clientX,M.addClass(n.__closeButton,ge.CLASS_DRAG),M.bind(window,"mousemove",t),M.bind(window,"mouseup",r),!1}M.bind(n.__resize_handle,"mousedown",o),M.bind(n.__closeButton,"mousedown",o),n.domElement.insertBefore(n.__resize_handle,n.domElement.firstElementChild)}function Hi(n,e){n.domElement.style.width=e+"px",n.__save_row&&n.autoPlace&&(n.__save_row.style.width=e+"px"),n.__closeButton&&(n.__closeButton.style.width=e+"px")}function Jr(n,e){var t={};return I.each(n.__rememberedObjects,function(r,o){var i={},l=n.__rememberedObjectIndecesToControllers[o];I.each(l,function(c,m){i[m]=e?c.initialValue:c.getValue()}),t[o]=i}),t}function cd(n){for(var e=0;e<n.__preset_select.length;e++)n.__preset_select[e].value===n.preset&&(n.__preset_select.selectedIndex=e)}function Os(n){n.length!==0&&od.call(window,function(){Os(n)}),I.each(n,function(e){e.updateDisplay()})}var Ns=ge;function gn(n){return[n.debugMeshes,n.naniteObjects[0]]}var eo=(n,e)=>e.diffuseTextureView||n.fallbackDiffuseTextureView;var dd=1024,On=2,md=dd*On,$e=()=>performance.now(),Sr=n=>$e()-n,to=class{_profileThisFrame=!1;hasRequiredFeature;queryPool;queryInProgressBuffer;resultsBuffer;currentFrameScopes=[];get enabled(){return this._profileThisFrame&&this.hasRequiredFeature}constructor(e){if(this.hasRequiredFeature=e.features.has("timestamp-query"),!this.hasRequiredFeature){this.queryPool=void 0,this.queryInProgressBuffer=void 0,this.resultsBuffer=void 0;return}this.queryPool=e.createQuerySet({type:"timestamp",count:md}),this.queryInProgressBuffer=e.createBuffer({label:"profiler-in-progress",size:this.queryPool.count*ns,usage:GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC}),this.resultsBuffer=e.createBuffer({label:"profiler-results",size:this.queryInProgressBuffer.size,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ})}profileNextFrame(e){this._profileThisFrame=e}beginFrame(){for(;this.currentFrameScopes.length>0;)this.currentFrameScopes.pop()}endFrame(e){if(!this.enabled)return;let t=this.currentFrameScopes.length*On;e.resolveQuerySet(this.queryPool,0,t,this.queryInProgressBuffer,0),this.resultsBuffer.mapState==="unmapped"&&e.copyBufferToBuffer(this.queryInProgressBuffer,0,this.resultsBuffer,0,this.resultsBuffer.size)}async scheduleRaportIfNeededAsync(e){if(!this.enabled||this.currentFrameScopes.length==0){this._profileThisFrame=!1;return}this._profileThisFrame=!1;let t=this.currentFrameScopes.slice();if(this.resultsBuffer.mapState==="unmapped"){await this.resultsBuffer.mapAsync(GPUMapMode.READ);let r=new BigInt64Array(this.resultsBuffer.getMappedRange()),o=t.map(([i,l,c],m)=>{let h=0;if(l==="gpu"){let g=r[m*On],_=r[m*On+1];h=Number(_-g)*as}else h=c;return[i,h]});this.resultsBuffer.unmap(),e?.(o)}}createScopeGpu(e){if(!this.enabled)return;let t=this.currentFrameScopes.length;return this.currentFrameScopes.push([e,"gpu",0]),{querySet:this.queryPool,beginningOfPassWriteIndex:t*On,endOfPassWriteIndex:t*On+1}}startRegionCpu(e){if(!this.enabled)return;let t=this.currentFrameScopes.length,r=performance.now();return this.currentFrameScopes.push([e,"cpu",r]),t}endRegionCpu(e){if(!this.enabled||e===void 0)return;let t=this.currentFrameScopes[e];if(t){let[r,o,i]=t;t[2]=Sr(i)}}};var pd={fps:{hideLabel:!0},ms:{hideLabel:!0},"Camera pos WS":{},"Camera rot":{},s0:{categoryName:"Memory"},"Index buffer":{},"Meshlets data":{visibilityDevice:"gpu"},"Instance tfxs":{visibilityDevice:"gpu"},"Drawn instances":{visibilityDevice:"gpu"},"Drawn impostors":{visibilityDevice:"gpu"},"Drawn meshlets":{visibilityDevice:"gpu"},s1:{categoryName:"Geometry"},Preprocessing:{},"Scene meshlets":{},"Scene triangles":{},"Rendered impostors":{visibilityDevice:"gpu"},"Rendered meshlets":{},"Rendered triangles":{},"HW: Rendered meshlets":{visibilityDevice:"gpu"},"HW: Rendered triangles":{visibilityDevice:"gpu"},"SW: Rendered meshlets":{visibilityDevice:"gpu"},"SW: Rendered triangles":{visibilityDevice:"gpu"}},Us=.95,hd=1e3,qi=class{values={};lastRenderedValues={};frameStart=0;deltaTimeMS=0;deltaTimeSmoothMS=void 0;parentEl;lastDOMUpdate=0;constructor(){window&&window.document?(this.parentEl=window.document.getElementById("stats-window"),this.frameStart=$e(),this.lastDOMUpdate=this.frameStart):this.parentEl=void 0}update(e,t){this.values[e]=t}show=()=>Nt(this.parentEl);onBeginFrame=()=>{this.frameStart=$e()};onEndFrame=()=>{let e=$e();this.deltaTimeMS=e-this.frameStart,this.deltaTimeSmoothMS===void 0?this.deltaTimeSmoothMS=this.deltaTimeMS:this.deltaTimeSmoothMS=this.deltaTimeSmoothMS*Us+this.deltaTimeMS*(1-Us);let t=1/this.deltaTimeMS*1e3;this.update("fps",`${t.toFixed(2)} fps`),this.update("ms",`${this.deltaTimeMS.toFixed(2)}ms`),e-this.lastDOMUpdate>hd&&(this.lastDOMUpdate=e,setTimeout(this.renderStats,0))};renderStats=()=>{let e=Array.from(this.parentEl.children);Object.entries(pd).forEach(([t,r])=>{let o=t,i=this.getStatsHtmlEl(e,o,r);if(r.categoryName){i.textContent!==r.categoryName&&(i.innerHTML=r.categoryName),i.classList.add("stats-category-name");return}if(!this.checkVisibility(r,i))return;let l=this.values[o],c=this.lastRenderedValues[o];if(l==c)return;let m=`${o}: ${l}`;r.hideLabel&&(m=String(l)),i.innerHTML=m}),this.lastRenderedValues={...this.values}};getStatsHtmlEl=(e,t,r)=>{let o="data-stats-attr";if(r.el)return r.el;let i=e.find(l=>l.getAttribute(o)===t);return i||(i=document.createElement("p"),i.setAttribute(o,t),this.parentEl.appendChild(i)),r.el=i,i};checkVisibility(e,t){if(!e.visibilityDevice)return!0;let r=e.visibilityDevice===P.nanite.render.naniteDevice;return this.setElVisible(t,r),r}setElVisible(e,t){t&&!qr(e)&&(Nt(e),this.lastRenderedValues={}),!t&&qr(e)&&(In(e),this.lastRenderedValues={})}},ne=new qi;var Ut=(n,e="")=>`${n.NAME}${e?"-"+e:""}`,be=n=>`${n.NAME}-shader`,ve=(n,e="")=>`${Ut(n,e)}-pipeline`,_d=(n,e="")=>`${Ut(n,e)}-uniforms`,Le=()=>P.useAlternativeClearColor?P.clearColorAlt:P.clearColor,yt={cullMode:P.nanite.render.allowHardwareBackfaceCull?"back":"none",topology:"triangle-list",stripIndexFormat:void 0},Ze={depthWriteEnabled:!0,depthCompare:"less",format:Tn},xe=(n,e,t,r,o)=>{let i=r.getBindGroupLayout(0);return t.createBindGroup({label:_d(n,e),layout:i,entries:o})},no=(n,e,t,r)=>xe(n,"",e,t,r),Oe=(n,e,t="clear")=>({view:n,loadOp:t,storeOp:"store",clearValue:[e[0],e[1],e[2],e[3]===void 0?1:e[3]]}),je=(n,e="clear")=>({view:n,depthClearValue:1,depthLoadOp:e,depthStoreOp:"store"}),Me=class{cache={};getBindings(e,t){let r=this.cache[e];if(r)return r;let o=t();return this.cache[e]=o,o}clear(){this.cache={}}};function Fs(){ne.update("Rendered meshlets","-"),ne.update("Rendered triangles","-"),ne.update("HW: Rendered meshlets","-"),ne.update("HW: Rendered triangles","-"),ne.update("SW: Rendered meshlets","-"),ne.update("SW: Rendered triangles","-"),ne.update("Rendered impostors","-")}function ro(n,e,t){ne.update("Rendered meshlets",mt(e,n.naiveMeshletCount)),ne.update("Rendered triangles",mt(t,n.naiveTriangleCount))}function Ls(n,e,t,r){let o=n+t,i=e+r;ne.update("HW: Rendered meshlets",mt(n,o)),ne.update("HW: Rendered triangles",mt(e,i)),ne.update("SW: Rendered meshlets",mt(t,o)),ne.update("SW: Rendered triangles",mt(r,i))}function ks(n,e){ne.update("Rendered impostors",mt(n,e))}var Gs=14,Ki;function zs(n,e,t){let r,o,i,l=new Ns,c={openGithub:()=>{window.location.href=P.githubRepoLink},profile:()=>{n.profileNextFrame(!0)},resetCamera:()=>{t.resetPosition()},getGpuDrawStats:()=>{P.nanite.render.nextFrameDebugDrawnMeshletsBuffer=!0},showSwRasterAlert:()=>{alert("WebGPU does not support atomic<u64> yet. I can't output both depth and color data with just 32 bits. Depth and normals are the best we get. And even that is a squeeze. What you see is the default white color affected by lights.")}};l.add(c,"openGithub").name("GITHUB"),l.add(c,"profile").name("Profile");let m=l.add(c,"getGpuDrawStats").name("Get GPU stats");g(),_(),x(),T(),S(),h();function h(){let E=P.nanite.render.naniteDevice;Fs(),Nn(m,E=="gpu"),Nn(r,E=="gpu"),Nn(i,E=="gpu")}function g(){let E=l.addFolder("Nanite");E.open();let R=Xi(P.nanite.render,"naniteDevice",[{label:"GPU",value:"gpu"},{label:"CPU",value:"cpu"}]);E.add(R,"naniteDevice",R.values).name("Nanite device").onFinishChange(h),E.add(P.nanite.render,"errorThreshold",0,10).name("Error threshold");let C=Xi(P.nanite.render,"shadingMode",[{label:"Shaded",value:hr},{label:"Normals",value:vt},{label:"Triangles",value:Vr},{label:"Meshlets",value:$r},{label:"LOD levels",value:Hr},{label:"HW/SW/Impostor",value:zt}]);o=E.add(C,"shadingMode",C.values).name("Shading mode"),r=E.add(P.nanite.render,"freezeGPU_Visibilty").name("Freeze culling"),E.add(c,"showSwRasterAlert").name("Software rasterizer - README");let N=P.softwareRasterizer;E.add(N,"enabled").name("Softw. raster. enable"),i=E.add(N,"threshold",0,2500).name("Softw. raster. threshold [px]")}function _(){let E=l.addFolder("Instances culling");E.open();let R=P.cullingInstances,C=P.impostors;E.add(R,"enabled").name("Enabled"),E.add(R,"frustumCulling").name("Frustum culling"),E.add(R,"occlusionCulling").name("Occlusion culling"),E.add(C,"billboardThreshold",0,8e3).name("Billboard threshold [px]"),E.add(C,"forceOnlyBillboards").name("Force billboards"),E.add(C,"ditherStrength",0,1).name("Billboard dither")}function x(){let E=l.addFolder("Meshlet culling");E.open();let R=P.cullingMeshlets,C=P.nanite.render;E.add(R,"frustumCulling").name("Frustum culling"),E.add(R,"occlusionCulling").name("Occlusion culling"),E.add(C,"isOverrideOcclusionCullMipmap").name("OC override"),E.add(C,"occlusionCullOverrideMipmapLevel",0,Gs).step(1).name("OC ov-ride lvl")}function T(){let E=l.addFolder("Color mgmt"),R=P.colors;E.add(R,"gamma",1,3).name("Gamma"),E.add(R,"exposure",0,2).name("Exposure"),E.add(R,"ditherStrength",0,2).name("Dithering")}function S(){let E=l.addFolder("DEBUG");E.open(),w(E,P,"clearColor","Bg color"),E.add(P,"useAlternativeClearColor").name("Alt. bg"),E.add(P,"drawGround").name("Draw ground");let R=Xi(P,"displayMode",[{label:"Nanite",value:"nanite"},{label:"DBG: lod",value:"dbg-lod"},{label:"DBG: lod meshlets",value:"dbg-lod-meshlets"},{label:"DBG: nanite meshlets",value:"dbg-nanite-meshlets"},{label:"DBG: depth pyramid",value:"dbg-depth-pyramid"}]),C=E.add(R,"displayMode",R.values).name("Display mode");Ki=B=>{P.displayMode=B,C.__onFinishChange(),C.updateDisplay()};let[N,L]=gn(e),D=N.meshoptimizerLODs.length-1,H=E.add(P,"dbgMeshoptimizerLodLevel",0,D).step(1).name("LOD level");D=L.lodLevelCount-1;let J=E.add(P,"dbgNaniteLodLevel",0,D).step(1).name("Nanite LOD"),re=E.add(P,"dbgDepthPyramidLevel",0,Gs).step(1).name("Pyramid level");C.onFinishChange(oe),E.add(c,"resetCamera").name("Reset camera"),oe();function oe(){P.nanite.render.hasValidDepthPyramid=!1;let B=P.displayMode,ee=["dbg-lod","dbg-lod-meshlets"].includes(B);Nn(H,ee),Nn(J,B==="dbg-nanite-meshlets"),Nn(re,B==="dbg-depth-pyramid")}}function w(E,R,C,N){let L={value:[]};Object.defineProperty(L,"value",{enumerable:!0,get:()=>{let D=R[C];return[D[0]*255,D[1]*255,D[2]*255]},set:D=>{let H=R[C];H[0]=D[0]/255,H[1]=D[1]/255,H[2]=D[2]/255}}),E.addColor(L,"value").name(N)}}function Nn(n,e){if(!n){console.error("Not controller for gui element found!");return}let t=n.__li;e?t.style.display="":t.style.display="none"}var Xi=(n,e,t)=>{let r={values:t.map(o=>o.label)};return Object.defineProperty(r,e,{enumerable:!0,get:()=>{let o=n[e];return(t.find(l=>l.value===o)||t[0]).label},set:o=>{let i=t.find(l=>l.label===o)||t[0];n[e]=i.value}}),r};function Vs(n){console.log("Profiler:",n);let e=document.getElementById("profiler-results");e.innerHTML="",Nt(e.parentNode);let t={},r=new Set;n.forEach(([o,i])=>{let l=t[o]||0;t[o]=l+i,r.add(o)}),r.forEach(o=>{let i=t[o],l=document.createElement("li");l.innerHTML=`${o}: ${i.toFixed(2)}ms`,e.appendChild(l)})}var qt={CAMERA_FORWARD:"w",CAMERA_BACK:"s",CAMERA_LEFT:"a",CAMERA_RIGHT:"d",CAMERA_UP:" ",CAMERA_DOWN:"z",CAMERA_GO_FASTER:"shift",DEBUG_DEPTH:"e"},gd=()=>({directions:{forward:!1,backward:!1,left:!1,right:!1,up:!1,down:!1,goFaster:!1},mouse:{x:0,y:0,zoom:0,touching:!1}});function $s(n,e){let{directions:t,mouse:r}=gd(),o=(i,l)=>{switch(i.key.toLowerCase()){case qt.CAMERA_FORWARD:t.forward=l,i.preventDefault(),i.stopPropagation();break;case qt.CAMERA_BACK:t.backward=l,i.preventDefault(),i.stopPropagation();break;case qt.CAMERA_LEFT:t.left=l,i.preventDefault(),i.stopPropagation();break;case qt.CAMERA_RIGHT:t.right=l,i.preventDefault(),i.stopPropagation();break;case qt.CAMERA_UP:t.up=l,i.preventDefault(),i.stopPropagation();break;case qt.CAMERA_DOWN:t.down=l,i.preventDefault(),i.stopPropagation();break;case qt.CAMERA_GO_FASTER:t.goFaster=l,i.preventDefault(),i.stopPropagation();break;case qt.DEBUG_DEPTH:{l||Ki?.(P.displayMode==="dbg-depth-pyramid"?"nanite":"dbg-depth-pyramid"),i.preventDefault(),i.stopPropagation();break}}};return n.addEventListener("keydown",i=>o(i,!0)),n.addEventListener("keyup",i=>o(i,!1)),e.style.touchAction="pinch-zoom",e.addEventListener("pointerdown",()=>{r.touching=!0}),e.addEventListener("pointerup",()=>{r.touching=!1}),e.addEventListener("pointermove",i=>{r.touching=i.pointerType=="mouse"?(i.buttons&1)!==0:!0,r.touching&&(r.x+=i.movementX,r.y+=i.movementY)}),e.addEventListener("wheel",i=>{r.touching=(i.buttons&1)!==0,r.touching&&(r.zoom+=Math.sign(i.deltaY),i.preventDefault(),i.stopPropagation())},{passive:!1}),()=>{let i={directions:{...t},mouse:{...r}};return r.x=0,r.y=0,r.zoom=0,i}}function Hs(n,e,t,r){if(!bd(n.cameraFrustum,t,r.bounds))return 0;let o=[...r.roots],i=r.naniteVisibilityBufferCPU;i.prepareForDraw();let l=xd(n,e,i,t);for(;o.length>0;){let c=o.pop();i.setVisited(c.id);let m=vd(l,c);if(m===0)i.setDrawn(c);else if(m===1)for(let h=0;h<c.createdFrom.length;h++){let g=c.createdFrom[h];g&&!i.wasVisited(g.id)&&(i.setVisited(c.id),o.push(g))}}return i.drawnMeshletsCount}var Un=Bt.create();function bd(n,e,t){if(!P.cullingMeshlets.frustumCulling)return!0;Un[0]=t.sphere.center[0],Un[1]=t.sphere.center[1],Un[2]=t.sphere.center[2],Un[3]=1;let r=mn(e,Un,Un);return r[3]=t.sphere.radius,n.isInside(r)}function vd(n,e){let t=n(e.sharedSiblingsBounds,e.maxSiblingsError),r=n(e.parentBounds,e.parentError),o=P.nanite.render.errorThreshold;return r>o&&t<=o?0:1}function xd(n,e,t,r){let o=us(r,n.viewMatrix,n.projMatrix,t.mvpMatrix),i=n.viewport.height;return function(c,m){if(m===1/0||c==null)return 1/0;let h=yd(o,c.center),g=m;return e*g/Math.sqrt(h-g*g)*i/2}}var oo=(n=De.fovDgr)=>{let e=dn(n);return 1/Math.tan(e/2)};function yd(n,e){let t=n[0]*e[0]+n[4]*e[1]+n[8]*e[2]+n[12],r=n[1]*e[0]+n[5]*e[1]+n[9]*e[2]+n[13],o=n[2]*e[0]+n[6]*e[1]+n[10]*e[2]+n[14];return t*t+r*r+o*o}var js=1,Ws=2,Ys=32,qs=64,Xs=65536,fe=class n{static SHADER_SNIPPET=e=>`
    const b11 = 3u; // binary 0b11
    const b111 = 7u; // binary 0b111
    const b1111 = 15u; // binary 0b1111
    const b11111 = 31u; // binary 0b11111
    const b111111 = 63u; // binary 0b111111

    struct Uniforms {
      vpMatrix: mat4x4<f32>,
      vpMatrixInv: mat4x4<f32>,
      viewMatrix: mat4x4<f32>,
      projMatrix: mat4x4<f32>,
      viewport: vec4f,
      cameraPosition: vec4f,
      cameraFrustumPlane0: vec4f, // TODO [LOW] there are much more efficient ways for frustum culling
      cameraFrustumPlane1: vec4f, // https://github.com/zeux/niagara/blob/master/src/shaders/drawcull.comp.glsl#L72
      cameraFrustumPlane2: vec4f,
      cameraFrustumPlane3: vec4f,
      cameraFrustumPlane4: vec4f,
      cameraFrustumPlane5: vec4f,
      // b1 - frustom cull
      // b2 - occlusion cull (ends at: 1 << 1)
      // b3,4,5 - shading mode (1 << 2 to 1 << 4)
      // b6,7 - instances culling (1 << 5, 1 << 6)
      // b8,9,10,11 - debug render depty pyramid level (value 0-15)
      // b12,13,14,15 - debug override occlusion cull depth mipmap (value 0-15). 0b1111 means OFF
      // b16 - force billboards
      // b17,b18,b19,b20,b21,b22 - billboard dithering
      // b23..32 - not used
      flags: u32,
      billboardThreshold: f32,
      softwareRasterizerThreshold: f32,
      padding0: u32,
      colorMgmt: vec4f,
    };
    @binding(0) @group(${e})
    var<uniform> _uniforms: Uniforms;

    fn checkFlag(flags: u32, bit: u32) -> bool { return (flags & bit) > 0; }
    fn useFrustumCulling(flags: u32) -> bool { return checkFlag(flags, ${js}u); }
    fn useOcclusionCulling(flags: u32) -> bool { return checkFlag(flags, ${Ws}u); }
    fn useInstancesFrustumCulling(flags: u32) -> bool { return checkFlag(flags, ${Ys}u); }
    fn useInstancesOcclusionCulling(flags: u32) -> bool { return checkFlag(flags, ${qs}u); }
    fn useForceBillboards(flags: u32) -> bool { return checkFlag(flags, ${Xs}u); }
    fn getShadingMode(flags: u32) -> u32 {
      return (flags >> 2u) & b111;
    }
    fn getDbgPyramidMipmapLevel(flags: u32) -> i32 {
      return i32(clamp((flags >> 8u) & b1111, 0u, 15u));
    }
    fn getOverrideOcclusionCullMipmap(flags: u32) -> i32 {
      let v: u32 = clamp((flags >> 12u) & b1111, 0u, 15u);
      if (v == 15u) { return -1; }
      return i32(v);
    }
    fn getBillboardDitheringStrength(flags: u32) -> f32 {
      let v: u32 = (flags >> 17u) & b111111; // [0-64]
      return f32(v) / 63.0;
    }
  `;static BUFFER_SIZE=it+it+it+it+Dt+Dt+6*Dt+4*q+Dt;gpuBuffer;data=new ArrayBuffer(n.BUFFER_SIZE);dataAsF32;dataAsU32;constructor(e){this.gpuBuffer=e.createBuffer({label:"render-uniforms-buffer",size:n.BUFFER_SIZE,usage:hs}),this.dataAsF32=new Float32Array(this.data),this.dataAsU32=new Uint32Array(this.data)}createBindingDesc=e=>({binding:e,resource:{buffer:this.gpuBuffer}});update(e){let{device:t,vpMatrix:r,viewMatrix:o,projMatrix:i,viewport:l,cameraFrustum:c,cameraPositionWorldSpace:m,softwareRasterizerEnabled:h}=e,g=P,_=g.nanite.render,x=g.impostors,T=g.colors,S=g.softwareRasterizer,w=0;w=this.writeMat4(w,r),w=this.writeMat4(w,_e.invert(r)),w=this.writeMat4(w,o),w=this.writeMat4(w,i),w=this.writeF32(w,l.width),w=this.writeF32(w,l.height),w=this.writeF32(w,_.errorThreshold),w=this.writeF32(w,oo());let E=m;w=this.writeF32(w,E[0]),w=this.writeF32(w,E[1]),w=this.writeF32(w,E[2]),w=this.writeF32(w,0);for(let C=0;C<c.planes.length;C++)w=this.writeF32(w,c.planes[C]);w=this.writeU32(w,this.encodeFlags()),w=this.writeF32(w,x.billboardThreshold);let R=h?S.threshold:0;if(w=this.writeF32(w,R),w+=1*q,w=this.writeF32(w,T.gamma),w=this.writeF32(w,T.exposure),w=this.writeF32(w,T.ditherStrength),w+=Pe,w!==n.BUFFER_SIZE)throw new Error(`Invalid write to RenderUniformsBuffer. Buffer has ${n.BUFFER_SIZE}bytes, but tried to write ${w} bytes.`);t.queue.writeBuffer(this.gpuBuffer,0,this.data,0,w)}writeMat4(e,t){let r=e/Pe;for(let o=0;o<16;o++)this.dataAsF32[r+o]=t[o];return e+it}writeF32(e,t){let r=e/Pe;return this.dataAsF32[r]=t,e+Pe}writeU32(e,t){let r=e/q;return this.dataAsU32[r]=Math.floor(t),e+q}encodeFlags(){let e=P.nanite.render,t=P.cullingInstances,r=P.cullingMeshlets,o=P.impostors,i=0,l=(h,g)=>{i=i|(g?h:0)};l(js,r.frustumCulling);let c=e.hasValidDepthPyramid&&r.occlusionCulling;l(Ws,c);let m=e.shadingMode&7;return i=i|m<<2,c=e.hasValidDepthPyramid&&t.occlusionCulling,l(Ys,t.frustumCulling),l(qs,c),m=P.dbgDepthPyramidLevel&15,i=i|m<<8,m=e.isOverrideOcclusionCullMipmap?e.occlusionCullOverrideMipmapLevel&15:15,i=i|m<<12,l(Xs,o.forceOnlyBillboards),m=Math.floor(o.ditherStrength*63),i=i|m<<17,i}};var at=n=>`

@group(0) @binding(${n})
var<storage, read> _instanceTransforms: array<mat4x4<f32>>;

fn _getInstanceTransform(idx: u32) -> mat4x4<f32> {
  return _instanceTransforms[idx];
}

fn _getInstanceCount() -> u32 {
  return arrayLength(&_instanceTransforms);
}
`;var Xt=`

const DIELECTRIC_FRESNEL = vec3f(0.04, 0.04, 0.04); // nearly black
const METALLIC_DIFFUSE_CONTRIBUTION = vec3(0.0, 0.0, 0.0); // none


fn pbr_LambertDiffuse(material: Material) -> vec3f {
  // return material.albedo / PI;
  return material.albedo;
}


/**
 * Fresnel (F): Schlick's version
 *
 * If cosTheta 0 means 90dgr, so return big value, if is 1 means 0dgr return
 * just F0. Function modeled to have shape of most common fresnel
 * reflectance function shape.
 *
 * @param float cosTheta - cos(viewDirection V, halfway vector H),
 * @param vec3 F0 - surface reflectance at 0dgr. vec3 somewhat models wavelengths
 */
fn FresnelSchlick(cosTheta: f32, F0: vec3f) -> vec3f {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

/**
 * Normal distribution function (D): GGX
 *
 * Just standard implementation ('Real Shading in Unreal Engine 4' equation 2)
 *
 * @param vec3 N - normalized normal
 * @param vec3 H - halfway vector
 * @param float roughness [0,1]
 */
fn DistributionGGX(N: vec3f, H: vec3f, roughness: f32) -> f32 {
    let a      = roughness * roughness;
    let a2     = a * a;
    let NdotH  = dotMax0(N, H);
    let NdotH2 = NdotH * NdotH;

    var denom = NdotH2 * (a2 - 1.0) + 1.0;
    denom = PI * denom * denom;
    return a2 / denom;
}

/**
 * Self-shadowing Smith helper function.
 *
 * @see 'Real Shading in Unreal Engine 4' equation 4 line 1,2
 *
 * @param vec3 NdotV dot prod. between normal and vector to camera/light source
 * @param float roughness material property
 */
fn GeometrySchlickGGX(NdotV: f32, roughness: f32) -> f32 {
    let r = (roughness + 1.0);
    let k = (r * r) / 8.0;
    let denom = NdotV * (1.0 - k) + k;
    return NdotV / denom;
}

/**
 * Self-shadowing (G): GGX
 *
 * Just standard implementation ('Real Shading in Unreal Engine 4' equation 4 line 3). We do calculate self-shadowing in directions light-point and point-camera, then mul.
 *
 * @param vec3 N normal at current frag
 * @param vec3 V frag -> point
 * @param vec3 L frag -> light
 * @param float roughness material property
 *
 */
fn GeometrySmith(N: vec3f, V: vec3f, L: vec3f, roughness: f32) -> f32 {
    let NdotV = dotMax0(N, V);
    let NdotL = dotMax0(N, L);
    let ggx2  = GeometrySchlickGGX(NdotV, roughness);
    let ggx1  = GeometrySchlickGGX(NdotL, roughness);
    return ggx1 * ggx2;
}

fn pbr_CookTorrance(
  material: Material,
  V: vec3f,
  L: vec3f,
  // out parameter
  // https://www.w3.org/TR/WGSL/#ref-ptr-use-cases
  F: ptr<function,vec3f>
) -> vec3f {
  let H = normalize(V + L); // halfway vector
  let N = material.normal; // normal at fragment

  // F - Fresnel
  let F0 = mix(DIELECTRIC_FRESNEL, material.albedo, material.isMetallic);
  *F = FresnelSchlick(dotMax0(H, V), F0);
  // G - microfacet self-shadowing
  let G = GeometrySmith(N, V, L, material.roughness);
  // D - Normals distribution
  let NDF = DistributionGGX(N, H, material.roughness);

  // Cook-Torrance BRDF using NDF,G,F
  let numerator = NDF * G * (*F);
  let denominator = 4.0 * dotMax0(N, V) * dotMax0(N, L);
  return numerator / max(denominator, 0.001);
}

fn pbr_mixDiffuseAndSpecular(material: Material, diffuse: vec3f, specular: vec3f, F: vec3f) -> vec3f {
  let kS = F;
  // kD for metalics is ~0 (means they have pure black diffuse color, but take color of specular)
  let kD = mix(vec3f(1.0, 1.0, 1.0) - kS, METALLIC_DIFFUSE_CONTRIBUTION, material.isMetallic);
  return kD * diffuse + specular;
}


fn disneyPBR(material: Material, light: Light) -> vec3f {
  let N = material.normal; // normal at fragment
  let V = material.toEye; // viewDir
  let L = normalize(light.position - material.positionWS); // wi in integral
  let attenuation = 1.0; // hardcoded for this demo

  // diffuse
  let lambert = pbr_LambertDiffuse(material);

  // specular
  var F: vec3f = vec3f();
  let specular = pbr_CookTorrance(material, V, L, &F);

  // final light calc.
  let NdotL = dotMax0(N, L);
  let brdfFinal = pbr_mixDiffuseAndSpecular(material, lambert, specular, F);
  let radiance = light.color * attenuation * light.intensity; // incoming color from light
  return brdfFinal * radiance * NdotL;
}
`;var wd=(n,e,t,r)=>{let o=(i,l)=>{let c=`${n}[${l}u]`,m=l==0?", default":"";return`case ${l}u ${m}: { ${r(c)} }`};return`
  switch (${t}) {
      ${Ve(e).map(o).join(`
`)}
  }`},Ks=(n,e,t,r)=>{let[o,i]=n.split(":").map(c=>c?.trim());if(o==null||i==null)throw new Error(`assignValueFromConstArray expected newVarDecl param to include variable name and type e.g. 'normal: vec3f'. Got '${n}', where name='${o}', type=${i}`);if(!zr)return`let ${n} = ${e}[${r}];`;let l=wd(e,t,r,c=>`${o} = ${c};`);return`var ${n};
  ${l}`};var io="mat4x4<f32>",wt=`
fn getMVP_Mat(modelMat: ${io}, viewMat: ${io}, projMat: ${io}) -> ${io} {
  let a = viewMat * modelMat;
  return projMat * a;
}
`,Qe=`
fn normalFromDerivatives(wsPosition: vec4f) -> vec3f{
  let posWsDx = dpdxFine(wsPosition);
  let posWsDy = dpdyFine(wsPosition);
  return normalize(cross(posWsDy.xyz, posWsDx.xyz));
}
`,Fn=`
fn fakeLighting(wsPosition: vec4f) -> f32{
  let AMBIENT_LIGHT = 0.1;
  let LIGHT_DIR = vec3(5., 5., 5.);

  let normal = normalFromDerivatives(wsPosition);
  let lightDir = normalize(LIGHT_DIR);
  let NdotL = max(0.0, dot(normal.xyz, lightDir));
  return mix(AMBIENT_LIGHT, 1.0, NdotL);
}
`,Ln=`
const COLOR_COUNT = 14u;
const COLORS = array<vec3f, COLOR_COUNT>(
    vec3f(1., 1., 1.),
    vec3f(1., 0., 0.),
    vec3f(0., 1., 0.),
    vec3f(0., 0., 1.),
    vec3f(1., 1., 0.),
    vec3f(0., 1., 1.),
    vec3f(1., 0., 1.),

    vec3f(.5, .5, .5),
    vec3f(.5, 0., 0.),
    vec3f(.5, .5, 0.),
    vec3f(0., 0., .5),
    vec3f(.5, .5, 0.),
    vec3f(0., .5, .5),
    vec3f(.5, 0., .5),
);

fn getRandomColor(idx: u32) -> vec3f {
  ${Ks("color: vec3f","COLORS",14,"idx % COLOR_COUNT")}
  return color;
}
`,ao=`
fn clampToMipLevels(v: i32, _texture: texture_2d<f32>) -> i32 {
  let mipLevels = textureNumLevels(_texture);
  return clamp(v, 0, i32(mipLevels - 1)); // 8 mip levels mean indices 0-7
}
`,Et=`

// WARNING: This is true only when you do not have scale (only rotation and transpose).
// https://paroj.github.io/gltut/Illumination/Tut09%20Normal%20Transformation.html
fn transformNormalToWorldSpace(modelMat: mat4x4f, normalV: vec3f) -> vec3f {
  let normalMatrix = modelMat; // !
  let normalWS = normalMatrix * vec4f(normalV, 0.0);
  return normalize(normalWS.xyz);
}

/** https://knarkowicz.wordpress.com/2014/04/16/octahedron-normal-vector-encoding/
 * 
 * NOTE: I'm running of of patience writing this code, do not judge */
fn OctWrap(v: vec2f) -> vec2f {
  // https://gpuweb.github.io/gpuweb/wgsl/#select-builtin
  // select(f, t, cond); // yes, this is the actuall syntax..
  let signX = select(-1.0, 1.0, v.x >= 0.0);
  let signY = select(-1.0, 1.0, v.y >= 0.0);
  return (1.0 - abs(v.yx)) * vec2f(signX, signY);
}
 
/** https://knarkowicz.wordpress.com/2014/04/16/octahedron-normal-vector-encoding/
 * 
 * Result is in [0 .. 1]
 * 
 * NOTE: I'm running of of patience writing this code, do not judge */
fn encodeOctahedronNormal(n0: vec3f) -> vec2f {
  var n = n0 / (abs(n0.x) + abs(n0.y) + abs(n0.z));
  if (n.z < 0.0) {
    let a = OctWrap(n.xy);
    n.x = a.x;
    n.y = a.y;
  }
  return n.xy * 0.5 + 0.5;
}

/** https://knarkowicz.wordpress.com/2014/04/16/octahedron-normal-vector-encoding/ */
fn decodeOctahedronNormal(f_: vec2f) -> vec3f {
  let f = f_ * 2.0 - 1.0;
 
  // https://twitter.com/Stubbesaurus/status/937994790553227264
  var n = vec3f(f.x, f.y, 1.0 - abs(f.x) - abs(f.y));
  let t = saturate(-n.z);
  if (n.x >= 0.0){ n.x -= t; } else { n.x += t; }
  if (n.y >= 0.0){ n.y -= t; } else { n.y += t; }
  return normalize(n);
}
`,kn=`

fn ceilDivideU32(numerator: u32, denominator: u32) -> u32 {
  return (numerator + denominator - 1) / denominator;
}
`;var Js=P.lightsCount,Pr=[.9,.9,.9],Kt=`

const LIGHT_COUNT = ${Js}u;
const PI: f32 = ${Math.PI};


struct Material {
  positionWS: vec3f,
  normal: vec3f,
  toEye: vec3f,
  // disney pbr:
  albedo: vec3f,
  roughness: f32,
  isMetallic: f32,
  // ao: f32
};

struct Light {
  position: vec3f,
  color: vec3f,
  intensity: f32
};

fn unpackLight(pos: vec3f, color: vec4f, light: ptr<function, Light>) {
  (*light).position = pos;
  (*light).color = color.rgb;
  (*light).intensity = color.a;
}


fn dotMax0 (n: vec3f, toEye: vec3f) -> f32 {
  return max(0.0, dot(n, toEye));
}

fn doShading(
  material: Material,
  ambientLight: vec4f,
  lights: array<Light, ${Js}>
) -> vec3f {
  let ambient = ambientLight.rgb * ambientLight.a; // * material.ao;
  var radianceSum = vec3(0.0);

  // this used to be a for-loop, but wgpu's Naga complains:
  // let light = lights[i];
  //                    ^ The expression may only be indexed by a constant
  radianceSum += disneyPBR(material, lights[0]);
  radianceSum += disneyPBR(material, lights[1]);

  return ambient + radianceSum;
}

/////////////////////////////
/////////////////////////////
/// Config

const AMBIENT_LIGHT = vec4f(1., 1., 1., 0.05);
const LIGHT_FAR = 99999.0;

fn fillLightsData(
  lights: ptr<function, array<Light, LIGHT_COUNT>>
){
  (*lights)[0].position = vec3f(LIGHT_FAR, LIGHT_FAR, 0); // world space
  (*lights)[0].color = vec3f(1., 0.95, 0.8);
  // (*lights)[0].color = vec3f(1., 0.0, 0.0); // RED for testing
  (*lights)[0].intensity = 1.5;

  (*lights)[1].position = vec3f(-LIGHT_FAR, -LIGHT_FAR / 3.0, LIGHT_FAR / 3.0); // world space
  (*lights)[1].color = vec3f(0.8, 0.8, 1.);
  // (*lights)[1].color = vec3f(0.0, 0.0, 1.); // BLUE for testing
  (*lights)[1].intensity = 0.7;
}

fn createDefaultMaterial(
  material: ptr<function, Material>,
  positionWS: vec4f
){
  let cameraPos = _uniforms.cameraPosition.xyz;
  
  (*material).positionWS = positionWS.xyz;
  (*material).normal = normalFromDerivatives(positionWS);
  (*material).toEye = normalize(cameraPos - positionWS.xyz);
  // brdf params:
  (*material).albedo = vec3f(${Pr[0]}, ${Pr[1]}, ${Pr[2]});
  (*material).roughness = 0.8;
  (*material).isMetallic = 0.0; // oops!
  // material.ao = 1.0;
}

`;var Ji={bindings:{renderUniforms:0,instancesTransforms:1,diffuseTexture:2,sampler:3}},so=Ji.bindings,Zs=()=>`

${wt}
${Ln}
${Qe}
${Et}
${Xt}
${Kt}

${fe.SHADER_SNIPPET(so.renderUniforms)}
${at(so.instancesTransforms)}

@group(0) @binding(${so.diffuseTexture})
var _diffuseTexture: texture_2d<f32>;

@group(0) @binding(${so.sampler})
var _sampler: sampler;


struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) positionWS: vec4f,
  @location(1) normalWS: vec3f,
  @location(2) uv: vec2f,
  @location(3) @interpolate(flat) instanceIdx: u32,
};


@vertex
fn main_vs(
  @location(0) inWorldPos : vec3f,
  @location(1) inNormal : vec3f,
  @location(2) inUV : vec2f,
  @builtin(vertex_index) inVertexIndex: u32,
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  var result: VertexOutput;

  let modelMat = _getInstanceTransform(inInstanceIndex);
  let mvpMatrix = getMVP_Mat(modelMat, _uniforms.viewMatrix, _uniforms.projMatrix); // either here or upload from CPU
  let vertexPos = vec4<f32>(inWorldPos.xyz, 1.0);
  var projectedPosition = mvpMatrix * vertexPos;
  let positionWS = modelMat * vertexPos;
  result.position = projectedPosition;
  result.positionWS = positionWS;
  result.instanceIdx = inInstanceIndex;
  result.normalWS = transformNormalToWorldSpace(modelMat, inNormal);
  result.uv = inUV;

  return result;
}


@fragment
fn main_fs(fragIn: VertexOutput) -> @location(0) vec4<f32> {
  // not enough data for most of debug modes
  let shadingMode = getShadingMode(_uniforms.flags);
  var color: vec3f;

  if (shadingMode == ${vt}u) {
    color = abs(normalize(fragIn.normalWS));
    
  } else {
    var material: Material;
    createDefaultMaterial(&material, fragIn.positionWS);
    material.normal = normalize(fragIn.normalWS);
    material.albedo = textureSample(_diffuseTexture, _sampler, fragIn.uv).rgb;
    
    // shading
    var lights = array<Light, LIGHT_COUNT>();
    fillLightsData(&lights);
    color = doShading(material, AMBIENT_LIGHT, lights);
  }

  return vec4(color.xyz, 1.0);
}
`;var Tr={attributes:[{shaderLocation:0,offset:0,format:"float32x3"}],arrayStride:mr,stepMode:"vertex"},lo=[Tr,{attributes:[{shaderLocation:1,offset:0,format:"float32x3"}],arrayStride:mr,stepMode:"vertex"},{attributes:[{shaderLocation:2,offset:0,format:"float32x2"}],arrayStride:Ni,stepMode:"vertex"}];var uo=class n{static NAME="DrawNanitesPass";renderPipeline;bindingsCache=new Me;drawnMeshletsCount=0;drawnTriangleCount=0;culledInstancesCount=0;constructor(e,t){this.renderPipeline=n.createRenderPipeline(e,t)}static createRenderPipeline(e,t){let r=e.createShaderModule({label:be(n),code:Zs()});return e.createRenderPipeline({label:ve(n),layout:"auto",vertex:{module:r,entryPoint:"main_vs",buffers:lo},fragment:{module:r,entryPoint:"main_fs",targets:[{format:t}]},primitive:yt,depthStencil:Ze})}initFrameStats(){this.drawnMeshletsCount=0,this.drawnTriangleCount=0,this.culledInstancesCount=0}uploadFrameStats({scene:e}){ro(e,this.drawnMeshletsCount,this.drawnTriangleCount)}draw(e,t,r){let{cmdBuf:o,profiler:i,depthTexture:l,hdrRenderTexture:c}=e,m=i?.startRegionCpu("VisibilityCheckCPU"),h=o.beginRenderPass({label:n.NAME,colorAttachments:[Oe(c,Le(),r)],depthStencilAttachment:je(l,r),timestampWrites:i?.createScopeGpu(n.NAME)});h.setPipeline(this.renderPipeline),this.renderNaniteObject(e,h,t),i?.endRegionCpu(m),h.end()}renderNaniteObject(e,t,r){let o=r.instances.transforms,i=this.bindingsCache.getBindings(r.name,()=>this.createBindings(e,r));t.setBindGroup(0,i),t.setVertexBuffer(0,r.originalMesh.vertexBuffer),t.setVertexBuffer(1,r.originalMesh.normalsBuffer),t.setVertexBuffer(2,r.originalMesh.uvBuffer),t.setIndexBuffer(r.buffers.indexBuffer,"uint32");let l=oo();for(let c=0;c<o.length;c++){let m=o[c],h=Hs(e,l,m,r);if(h===0){this.culledInstancesCount+=1;continue}this.drawnMeshletsCount+=h;for(let g=0;g<h;g++){let _=r.naniteVisibilityBufferCPU.drawnMeshlets[g],x=_.triangleCount,T=x*le;t.drawIndexed(T,1,_.firstIndexOffset,0,c),this.drawnTriangleCount+=x}}}createBindings=({device:e,globalUniforms:t,scene:r},o)=>{let i=Ji.bindings,l=eo(r,o);return Ie(l),xe(n,o.name,e,this.renderPipeline,[t.createBindingDesc(i.renderUniforms),{binding:i.instancesTransforms,resource:{buffer:o.instances.transformsBuffer}},{binding:i.diffuseTexture,resource:l},{binding:i.sampler,resource:r.samplerLinear}])}};var Ed=Math.PI/2,Gn=0,co=1,fo=class{_viewMatrix=_e.identity();_tmpMatrix=_e.identity();_angles=[0,0];_position=[0,0,0];constructor(e=De.position){this.resetPosition(e)}get positionWorldSpace(){return this._position}resetPosition=(e=De.position)=>{e.position?.length===3&&(this._position[0]=e.position[0],this._position[1]=e.position[1],this._position[2]=e.position[2]),e.rotation?.length===2&&(this._angles[Gn]=e.rotation[1],this._angles[co]=e.rotation[0])};update(e,t){this.applyMovement(e,t),this.applyRotation(e,t),this.updateShownStats()}applyMovement(e,t){let r=(h,g)=>(h?1:0)-(g?1:0),o=t.directions,i=e*(o.goFaster?P.movementSpeedFaster:P.movementSpeed),l=[0,0,0,1];l[0]=i*r(o.right,o.left),l[1]=i*r(o.up,o.down),l[2]=i*r(o.backward,o.forward);let c=_e.transpose(this.getRotationMat(),this._tmpMatrix),m=mn(c,l,l);Y.add(this._position,m,this._position)}applyRotation(e,t){let r=t.mouse.x*e*P.rotationSpeed,o=t.mouse.y*e*P.rotationSpeed;this._angles[co]+=r,this._angles[Gn]+=o;let i=Ed*.95;this._angles[Gn]=pn(this._angles[Gn],-i,i)}updateShownStats(){let e=o=>o.toFixed(1),t=this._position,r=this._angles;ne.update("Camera pos WS",`[${e(t[0])}, ${e(t[1])}, ${e(t[2])}]`),ne.update("Camera rot",`[${e(r[co])}, ${e(r[Gn])}]`)}getRotationMat(){let e=this._angles,t=_e.identity(this._tmpMatrix);return _e.rotateX(t,e[Gn],t),_e.rotateY(t,e[co],t),t}get viewMatrix(){let e=this.getRotationMat(),t=this._position;return _e.translate(e,[-t[0],-t[1],-t[2]],this._viewMatrix)}};var Md={bindings:{renderUniforms:0}},Sd=Md.bindings,Qs=()=>`

${fe.SHADER_SNIPPET(Sd.renderUniforms)}
${Fn}
${Qe}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) wsPosition: vec4f,
};

@vertex
fn main_vs(
  @location(0) inWorldPos : vec3f,
  @builtin(vertex_index) inVertexIndex: u32,
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  var result: VertexOutput;

  var worldPos = vec4<f32>(inWorldPos.xyz, 1.0);
  var projectedPosition = _uniforms.vpMatrix * worldPos;
  projectedPosition /= projectedPosition.w;
  result.position = vec4<f32>(projectedPosition.xyz, 1.0);
  result.wsPosition = worldPos;

  return result;
}

@fragment
fn main_fs(fragIn: VertexOutput) -> @location(0) vec4<f32> {
  let c = fakeLighting(fragIn.wsPosition);
  return vec4(c, c, c, 1.0);
}
`;var mo=class n{static NAME="DbgMeshoptimizerPass";renderPipeline;uniformsBindings;constructor(e,t,r){this.renderPipeline=n.createRenderPipeline(e,t),this.uniformsBindings=no(n,e,this.renderPipeline,[r.createBindingDesc(0)])}static createRenderPipeline(e,t){let r=e.createShaderModule({label:be(n),code:Qs()});return e.createRenderPipeline({label:ve(n),layout:"auto",vertex:{module:r,entryPoint:"main_vs",buffers:[Tr]},fragment:{module:r,entryPoint:"main_fs",targets:[{format:t}]},primitive:yt,depthStencil:Ze})}draw(e){let{cmdBuf:t,profiler:r,depthTexture:o,hdrRenderTexture:i,scene:l}=e,c=t.beginRenderPass({label:n.NAME,colorAttachments:[Oe(i,Le())],depthStencilAttachment:je(o),timestampWrites:r?.createScopeGpu(n.NAME)});c.setPipeline(this.renderPipeline),c.setBindGroup(0,this.uniformsBindings);let[m,h]=gn(l),g=m.meshoptimizerLODs[P.dbgMeshoptimizerLodLevel];c.setVertexBuffer(0,g.vertexBuffer),c.setIndexBuffer(g.indexBuffer,"uint32");let _=g.triangleCount*le;c.drawIndexed(_,1,0,0,0),c.end()}};var Zi={bindings:{renderUniforms:0}},Pd=Zi.bindings,el=()=>`

${fe.SHADER_SNIPPET(Pd.renderUniforms)}
${Fn}
${Ln}
${Qe}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) wsPosition: vec4f,
  @location(1) @interpolate(flat) instanceIndex: u32,
};


@vertex
fn main_vs(
  @location(0) inWorldPos : vec3f,
  @builtin(vertex_index) inVertexIndex: u32,
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  var result: VertexOutput;

  var worldPos = vec4<f32>(inWorldPos.xyz, 1.0);
  var projectedPosition = _uniforms.vpMatrix * worldPos;
  projectedPosition /= projectedPosition.w;
  result.position = vec4<f32>(projectedPosition.xyz, 1.0);
  result.wsPosition = worldPos;
  result.instanceIndex = inInstanceIndex;

  return result;
}


@fragment
fn main_fs(fragIn: VertexOutput) -> @location(0) vec4<f32> {
  let c = fakeLighting(fragIn.wsPosition);
  var color = getRandomColor(fragIn.instanceIndex);
  color = color * c;
  return vec4(color.xyz, 1.0);
}
`;var po=class n{static NAME="DbgMeshoptimizerMeshletsPass";renderPipeline;uniformsBindings;constructor(e,t,r){this.renderPipeline=n.createRenderPipeline(e,t),this.uniformsBindings=no(n,e,this.renderPipeline,[r.createBindingDesc(Zi.bindings.renderUniforms)])}static createRenderPipeline(e,t){let r=e.createShaderModule({label:be(n),code:el()});return e.createRenderPipeline({label:ve(n),layout:"auto",vertex:{module:r,entryPoint:"main_vs",buffers:[Tr]},fragment:{module:r,entryPoint:"main_fs",targets:[{format:t}]},primitive:yt,depthStencil:Ze})}draw(e){let{cmdBuf:t,profiler:r,depthTexture:o,hdrRenderTexture:i,scene:l}=e,c=t.beginRenderPass({label:n.NAME,colorAttachments:[Oe(i,Le())],depthStencilAttachment:je(o),timestampWrites:r?.createScopeGpu(n.NAME)});c.setPipeline(this.renderPipeline),c.setBindGroup(0,this.uniformsBindings),P.displayMode==="dbg-nanite-meshlets"?this.drawNaniteDbg(c,l):this.drawMeshoptimizerMeshletLODs(c,l),c.end()}drawMeshoptimizerMeshletLODs(e,t){let[r,o]=gn(t),i=r.meshoptimizerMeshletLODs[P.dbgMeshoptimizerLodLevel];e.setVertexBuffer(0,i.vertexBuffer),e.setIndexBuffer(i.indexBuffer,"uint32");let l=0;i.meshlets.forEach((c,m)=>{let h=c.triangleCount*le,g=l;e.drawIndexed(h,1,g,0,m),l+=h})}drawNaniteDbg(e,t){let[r,o]=gn(t);e.setVertexBuffer(0,o.originalMesh.vertexBuffer),e.setIndexBuffer(o.buffers.indexBuffer,"uint32"),o.allMeshlets.filter(l=>l.lodLevel===P.dbgNaniteLodLevel).forEach((l,c)=>{let m=l.triangleCount*le;e.drawIndexed(m,1,l.firstIndexOffset,0,c)})}};var Vn=n=>`

struct NaniteMeshletTreeNode {
  boundsMidPointAndError: vec4f, // sharedSiblingsBounds.xyz + maxSiblingsError
  parentBoundsMidPointAndError: vec4f, // parentBounds.xyz + parentError
  ownBoundingSphere: vec4f, // ownBounds
  triangleCount: u32,
  firstIndexOffset: u32,
  lodLevel: u32, // meshlet level + padding
  padding0: u32, // padding to fill uvec4
}
@group(0) @binding(${n})
var<storage, read> _meshlets: array<NaniteMeshletTreeNode>;
`,zn=3*Dt+os;function tl(n,e,t){return n.createBuffer({label:`${e}-nanite-meshlets`,size:t*zn,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.STORAGE})}function nl(n,e,t){let r=t.length,o=r*zn;if(o!==e.size)throw new Error(`GPU meshlet data preallocated ${e.size} bytes, but ${o} bytes (${r} meshlets * ${zn}) are needed`);let i=0,l=new ArrayBuffer(zn),c=new Float32Array(l),m=new Uint32Array(l);t.forEach(h=>{c[0]=h.sharedSiblingsBounds.center[0],c[1]=h.sharedSiblingsBounds.center[1],c[2]=h.sharedSiblingsBounds.center[2],c[3]=h.maxSiblingsError,c[4]=h.parentBounds?.center[0]||0,c[5]=h.parentBounds?.center[1]||0,c[6]=h.parentBounds?.center[2]||0,c[7]=h.parentError===1/0?9999999:h.parentError;let g=h.ownBounds.sphere;c[8]=g.center[0],c[9]=g.center[1],c[10]=g.center[2],c[11]=g.radius,m[12]=h.triangleCount,m[13]=h.firstIndexOffset,m[14]=h.lodLevel,n.queue.writeBuffer(e,i,l,0,zn),i+=zn})}var ho=class{visitedMeshlets=[];drawnMeshlets=[];drawnMeshletsCount=0;mvpMatrix=_e.identity();initialize(e){this.visitedMeshlets=Array(e),this.drawnMeshlets=Array(e)}prepareForDraw(){for(let e=0;e<this.visitedMeshlets.length;e++)this.visitedMeshlets[e]=!1;this.drawnMeshletsCount=0}wasVisited=e=>this.visitedMeshlets[e];setVisited=e=>{this.visitedMeshlets[e]=!0};setDrawn=e=>{this.drawnMeshlets[this.drawnMeshletsCount]=e,this.drawnMeshletsCount+=1}};var _o=0,$n=class{constructor(e,t,r,o,i,l){this.name=e;this.bounds=t;this.originalMesh=r;this.buffers=o;this.impostor=i;this.instances=l}allMeshlets=[];naniteVisibilityBufferCPU=new ho;diffuseTexture=void 0;diffuseTextureView=void 0;roots=[];lodLevelCount=0;find=e=>this.allMeshlets.find(t=>t.id===e);contains=e=>this.find(e)!==void 0;get totalTriangleCount(){return this.allMeshlets.reduce((e,t)=>e+t.triangleCount,0)}get totalIndicesCount(){return le*this.totalTriangleCount}get meshletCount(){return this.allMeshlets.length}get instancesCount(){return this.instances.transforms.length}get bottomTriangleCount(){return this.allMeshlets.reduce((e,t)=>t.lodLevel===_o?e+t.triangleCount:e,0)}get bottomMeshletCount(){return this.allMeshlets.reduce((e,t)=>t.lodLevel===_o?e+1:e,0)}bindInstanceTransforms=e=>({binding:e,resource:{buffer:this.instances.transformsBuffer}});finalizeNaniteObject(e){this.naniteVisibilityBufferCPU.initialize(this.meshletCount),nl(e,this.buffers.meshletsDataBuffer,this.allMeshlets)}addMeshlet(e,t,r,o){let i=this.find(t.id);if(i)return i;let l={id:t.id,lodLevel:t.lodLevel,sharedSiblingsBounds:t.sharedSiblingsBounds,maxSiblingsError:t.maxSiblingsError,parentBounds:t.parentBounds,parentError:t.parentError,firstIndexOffset:r,triangleCount:Ce(t.indices),createdFrom:[],ownBounds:o};return this.allMeshlets.push(l),this.lodLevelCount=Math.max(this.lodLevelCount,l.lodLevel+1),e?e.createdFrom.push(l):this.roots.push(l),l}printStats(){cn||(console.log("All meshlets:",this.allMeshlets),console.log("Root meshlets:",this.roots));let e=this.bottomTriangleCount,t=this.roots.reduce((o,i)=>o+i.triangleCount,0),r=t/e*100;console.log(`Created ${this.lodLevelCount} LOD levels. Total ${this.meshletCount} meshlets.`),console.log(`There are ${this.bottomMeshletCount} bottom level meshlets with ${e} triangles.`),console.log(`There are ${this.roots.length} root meshlets with ${t} triangles. Simplification: ${r.toFixed(1)}%.`)}};var rl=(n,e)=>`

/** arg for https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPassEncoder/drawIndirect */
struct DrawIndirect{
  vertexCount: u32,
  instanceCount: atomic<u32>,
  firstVertex: u32,
  firstInstance : u32,
}
@group(0) @binding(${n})
var<storage, ${e}> _drawnMeshletsParams: DrawIndirect;
`,_t=Math.max(hn,4*q),go=(n,e)=>`

/** arg for https://developer.mozilla.org/en-US/docs/Web/API/GPUComputePassEncoder/dispatchWorkgroupsIndirect */
struct DrawnMeshletsSw{
  // dispatch params
  workgroupsX: u32, // modified only by globalId=0
  workgroupsY: ${e==="read"?"u32":"atomic<u32>"},
  workgroupsZ: u32, // not modified
  /** when not limited by dispatch workgroup requirements */
  actuallyDrawnMeshlets: ${e==="read"?"u32":"atomic<u32>"},
}
@group(0) @binding(${n})
var<storage, ${e}> _drawnMeshletsSwParams: DrawnMeshletsSw;
`,Hn=Math.max(hn,4*q),Td=`

fn _storeMeshletHardwareDraw(idx: u32, tfxIdx: u32, meshletIdx: u32) {
  _drawnMeshletsList[idx] = vec2u(tfxIdx, meshletIdx);
}
fn _storeMeshletSoftwareDraw(idx: u32, tfxIdx: u32, meshletIdx: u32) {
  let len: u32 = arrayLength(&_drawnMeshletsList);
  let idx2: u32 = len - 1u - idx; // stored at the back of the list
  _drawnMeshletsList[idx2] = vec2u(tfxIdx, meshletIdx);
}
`,Ad=`
fn _getMeshletHardwareDraw(idx: u32) -> vec2u {
  return _drawnMeshletsList[idx];
}
fn _getMeshletSoftwareDraw(idx: u32) -> vec2u {
  let len: u32 = arrayLength(&_drawnMeshletsList);
  let idx2: u32 = len - 1u - idx; // stored at the back of the list
  return _drawnMeshletsList[idx2];
}
`,jn=(n,e)=>`

@group(0) @binding(${n})
var<storage, ${e}> _drawnMeshletsList: array<vec2<u32>>;

// WGSL compile error if we even HAVE (not ever called) code for 'write' if access is 'read'
${e=="read"?Ad:Td}
`;function ol(n,e,t,r){let i=t.filter(l=>l.lodLevel===_o).length*r*rs;return n.createBuffer({label:`${e}-nanite-drawn-meshlets`,size:_t+Hn+i,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.INDIRECT|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC})}async function il(n,e){let t=e.buffers.drawnMeshletsBuffer,r=await br(n,Uint32Array,t),o=Id(r);return console.log(`[${e.name}] Drawn meshlets buffer`,o),o}function Id(n){let e=(_t+Hn)/q,t=_=>({transformId:n[e+2*_],meshletId:n[e+2*_+1]}),r=n.slice(0,4),o=r[1],i=Ve(o).map((_,x)=>t(x)),l=_t/q,c=n.slice(l,l+4),m=c[3],h=(n.length-e)/2,g=Ve(m).map((_,x)=>t(h-1-x));return{hardwareRaster:{vertexCount:r[0],meshletCount:o,firstVertex:r[2],firstInstance:r[3],meshletIds:i},softwareRaster:{workgroupsX:c[0],workgroupsY:c[1],workgroupsZ:c[2],meshletCount:m,meshletIds:g}}}function bn(n,e){let t=e?Bd(n,e):vo(n);return{box:t,sphere:Dd(t)}}function Rd(n,e=fn,t){let r=n.length/e,o=[0,0,0];for(let i=0;i<r;i++){let l=i*e;o[0]=n[l],o[1]=n[l+1],o[2]=n[l+2],t(o)}}function Cd(n,e,t){let r=[0,0,0];for(let o=0;o<e.length;o++){let i=e[o]*le;r[0]=n[i],r[1]=n[i+1],r[2]=n[i+2],t(r)}}function bo(){let n=[void 0,void 0,void 0],e=[void 0,void 0,void 0];return[[e,n],r=>{for(let o=0;o<3;o++)n[o]=n[o]!==void 0?Math.max(n[o],r[o]):r[o],e[o]=e[o]!==void 0?Math.min(e[o],r[o]):r[o]}]}function vo(n,e=fn){let[t,r]=bo();return Rd(n,e,r),t}function Bd(n,e){let[t,r]=bo();return Cd(n,e,r),t}function al(n,e){return n?.center[0]===e?.center[0]&&n?.center[1]===e?.center[1]&&n?.center[2]===e?.center[2]&&n?.radius===e?.radius}function Dd([n,e]){let t=Y.midpoint(n,e),r=Y.distance(t,e);return{center:t,radius:r}}function sl(n,e=fn){let[t,r]=vo(n,e),o=i=>"["+i.map(l=>l.toFixed(2)).join(",")+"]";console.log("Bounding box min:",o(t)),console.log("Bounding box max:",o(r))}var ll=n=>`

struct VertexPositionsQuant{
  dqFac: vec4f,
  dqSummand: vec4f,
  data: array<vec2u>,
}

@group(0) @binding(${n})
// var<storage, read> _vertexPositions: array<vec2u>;
var<storage, read> _vertexPositionsQuant: VertexPositionsQuant;

/** get vertex position. Has .w=1 */
fn _getVertexPosition(idx: u32) -> vec4f {
  // let dequantFactor = _objectData.dequantFactor;
  // let dequantSummand = _objectData.dequantSummand;
  /*let dequantFactor = vec3f(
    5.918854526498762e-7, 5.862659691047156e-7, 4.5926591951683804e-7
  );
  let dequantSummand = vec3f(
    -0.755043089389801, 0.2664794921875, -0.4934331178665161
  );*/
  let dequantFactor = _vertexPositionsQuant.dqFac.xyz;
  let dequantSummand = _vertexPositionsQuant.dqSummand.xyz;
  let positionQuant = _vertexPositionsQuant.data[idx];

  let positionU32 = vec3u(
    positionQuant[0] & 0x1FFFFF,
    ((positionQuant[0] & 0xFFE00000) >> 21) | ((positionQuant[1] & 0x3FF) << 11),
    (positionQuant[1] >> 10) & 0x1FFFFF
  );
  let positionF32 = vec3f(positionU32) * dequantFactor + dequantSummand;
  return vec4f(positionF32.xyz, 1.0);
}
`;function ul(n,e,t){let r=t.length/3,o=2**21,[i,l]=vo(t),c=Y.sub(l,i),m=Y.create(o/c[0],o/c[1],o/c[2]),h=Y.mul(i,Y.negate(m)),g=Y.create(),_=R=>Math.floor(Math.min(R,o-1)),x=8,T=new Uint32Array(x+r*2);for(let R=0;R<r;R++){Y.set(t[R*3],t[R*3+1],t[R*3+2],g),Y.mul(g,m,g),Y.add(g,h,g);let C=_(g[0]),N=_(g[1]),L=_(g[2]);T[x+R*2+0]=C,T[x+R*2+0]+=(N&2047)<<21,T[x+R*2+1]=(N&2095104)>>11,T[x+R*2+1]+=L<<10}let S=Y.inverse(m),w=Y.addScaled(i,S,.5),E=new Float32Array(T.buffer,0,8);return E[0]=S[0],E[1]=S[1],E[2]=S[2],E[4]=w[0],E[5]=w[1],E[6]=w[2],Ht(n,`${e}-nanite-vertex-buffer-vec4`,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,T)}var cl=P.useVertexQuantization,Od=n=>`

// WARNING: SSBO with 'array<vec3f>' does not work. Forces 'array<vec4f>'.
// DO NOT ASK HOW I HAVE DEBUGGED THIS.
@group(0) @binding(${n})
var<storage, read> _vertexPositionsNative: array<vec4f>;

fn _getVertexPosition(idx: u32) -> vec4f { return _vertexPositionsNative[idx]; }
`,xo=cl?ll:Od;function Nd(n,e,t){let r=t.length/3,o=new Float32Array(r*4);for(let i=0;i<r;i++)o[i*4]=t[i*3],o[i*4+1]=t[i*3+1],o[i*4+2]=t[i*3+2],o[i*4+3]=1;return Ht(n,`${e}-nanite-vertex-buffer-vec4`,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,o)}var fl=cl?ul:Nd;var yo=n=>`

@group(0) @binding(${n})
var<storage, read> _vertexNormals: array<vec2f>;

fn _getVertexNormal(idx: u32) -> vec3f {
  return decodeOctahedronNormal(_vertexNormals[idx]);
}
`;function dl(n,e,t){let r=t.length/3,o=new Float32Array(r*2),i=Y.create();for(let l=0;l<r;l++){Y.set(t[l*3],t[l*3+1],t[l*3+2],i);let c=Math.abs(i[0])+Math.abs(i[1])+Math.abs(i[2]);if(Y.mulScalar(i,1/c,i),i[2]<0){let m=i[0],h=i[1];i[0]=(1-Math.abs(h))*(m>=0?1:-1),i[1]=(1-Math.abs(m))*(h>=0?1:-1)}o[2*l]=i[0]*.5+.5,o[2*l+1]=i[1]*.5+.5}return Ht(n,`${e}-nanite-octahedron-normals`,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,o)}var ml=n=>`

@group(0) @binding(${n})
var<storage, read> _vertexUV: array<vec2f>;

fn _getVertexUV(idx: u32) -> vec2f { return _vertexUV[idx]; }
`;var pl=(n,e)=>`

/** arg for https://developer.mozilla.org/en-US/docs/Web/API/GPUComputePassEncoder/dispatchWorkgroupsIndirect */
struct DrawIndirect{
  vertexCount: u32,
  instanceCount: atomic<u32>,
  firstVertex: u32,
  firstInstance : u32,
}
@group(0) @binding(${n})
var<storage, ${e}> _drawnImpostorsParams: DrawIndirect;
`,wo=(n,e)=>`
@group(0) @binding(${n})
var<storage, ${e}> _drawnImpostorsList: array<u32>;
`,Ar=Math.max(hn,4*q);function hl(n,e,t){let r=q*t;return n.createBuffer({label:`${e}-nanite-billboards`,size:Ar+r,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.INDIRECT|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC})}async function _l(n,e){let t=e.buffers.drawnImpostorsBuffer,r=await br(n,Uint32Array,t),o=r[1],i=Ar/q,l=r.slice(i,i+o),c={vertexCount:r[0],impostorCount:o,firstVertex:r[2],firstInstance:r[3],idsList:l};return console.log(`[${e.name}] Drawn impostors buffer`,c),c}var Yn=(n,e)=>`

/** arg for https://developer.mozilla.org/en-US/docs/Web/API/GPUComputePassEncoder/dispatchWorkgroupsIndirect */
struct CullParams{
  // dispatch params
  workgroupsX: u32, // modified only by globalId=0
  workgroupsY: ${e==="read"?"u32":"atomic<u32>"},
  workgroupsZ: u32, // not modified
  /** when not limited by dispatch workgroup requirements */
  actuallyDrawnInstances: ${e==="read"?"u32":"atomic<u32>"},
  // other params:
  objectBoundingSphere: vec4f,
  allMeshletsCount: u32,
}
@group(0) @binding(${n})
var<storage, ${e}> _drawnInstancesParams: CullParams;
`,Wn=Math.max(hn,3*q+q+q+Dt),Eo=(n,e)=>`
@group(0) @binding(${n})
var<storage, ${e}> _drawnInstancesList: array<u32>;
`;function gl(n,e,t,r,o){let i=q*r,l=n.createBuffer({label:`${e}-nanite-drawn-instances-ids`,size:Wn+i,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.INDIRECT|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC});return Ud(n,l,t,o),l}function Ud(n,e,t,r){let o=new ArrayBuffer(Wn),i=new Float32Array(o),l=new Uint32Array(o),c=4;i[c+0]=r.center[0],i[c+1]=r.center[1],i[c+2]=r.center[2],i[c+3]=r.radius,l[c+4]=t,n.queue.writeBuffer(e,0,o,0,Wn)}var Mo=n=>`

@group(0) @binding(${n})
var<storage, read> _indexBuffer: array<u32>;
`,qn=class{indexBuffer=void 0;meshletsDataBuffer=void 0;vertexPositionsBuffer=void 0;vertexNormalsBuffer=void 0;vertexUVsBuffer=void 0;drawnInstancesBuffer=void 0;drawnImpostorsBuffer=void 0;drawnMeshletsBuffer=void 0;constructor(e,t,r,o,i,l){P.isTest&&e==null||(this.indexBuffer=Fd(e,t,i),this.vertexPositionsBuffer=fl(e,t,o.positions),this.vertexNormalsBuffer=dl(e,t,o.normals),this.vertexUVsBuffer=r.uvBuffer,this.meshletsDataBuffer=tl(e,t,i.length),this.drawnMeshletsBuffer=ol(e,t,i,l),this.drawnInstancesBuffer=gl(e,t,i.length,l,o.bounds.sphere),this.drawnImpostorsBuffer=hl(e,t,l))}bindIndexBuffer=e=>({binding:e,resource:{buffer:this.indexBuffer}});bindVertexPositions=e=>({binding:e,resource:{buffer:this.vertexPositionsBuffer}});bindVertexNormals=e=>({binding:e,resource:{buffer:this.vertexNormalsBuffer}});bindVertexUVs=e=>({binding:e,resource:{buffer:this.vertexUVsBuffer}});bindMeshletData=e=>({binding:e,resource:{buffer:this.meshletsDataBuffer}});cmdClearDrawnMeshletsParams(e){let t=0;e.clearBuffer(this.drawnMeshletsBuffer,t,4*q),t=_t,e.clearBuffer(this.drawnMeshletsBuffer,t,4*q)}cmdDrawMeshletsHardwareIndirect(e){e.drawIndirect(this.drawnMeshletsBuffer,0)}cmdDrawMeshletsSoftwareIndirect(e){e.dispatchWorkgroupsIndirect(this.drawnMeshletsBuffer,_t)}bindDrawnMeshletsParams=e=>({binding:e,resource:{buffer:this.drawnMeshletsBuffer,offset:0,size:_t}});bindDrawnMeshletsSwParams=e=>({binding:e,resource:{buffer:this.drawnMeshletsBuffer,offset:_t,size:Hn}});bindDrawnMeshletsList=e=>({binding:e,resource:{buffer:this.drawnMeshletsBuffer,offset:_t+Hn}});_mockMeshletSoftwareDraw(e,t){e.queue.writeBuffer(this.drawnMeshletsBuffer,_t,t)}_mockMeshletsDrawList(e,t){if(t.length%2!==0)throw new Error("Invalid list provided to _mockMeshletsDrawList(). Should have even length.");e.queue.writeBuffer(this.drawnMeshletsBuffer,_t+Hn,t)}cmdClearDrawnInstancesDispatchParams(e){e.clearBuffer(this.drawnInstancesBuffer,0,4*q)}bindDrawnInstancesParams=e=>({binding:e,resource:{buffer:this.drawnInstancesBuffer,offset:0,size:Wn}});bindDrawnInstancesList=e=>({binding:e,resource:{buffer:this.drawnInstancesBuffer,offset:Wn}});cmdClearDrawnImpostorsParams(e){e.clearBuffer(this.drawnImpostorsBuffer,0,4*q)}bindDrawnImpostorsParams=e=>({binding:e,resource:{buffer:this.drawnImpostorsBuffer,offset:0,size:Ar}});bindDrawnImpostorsList=e=>({binding:e,resource:{buffer:this.drawnImpostorsBuffer,offset:Ar}})};function Fd(n,e,t){let r=t.reduce((i,l)=>i+Ce(l.indices),0),o=P.isExporting?GPUBufferUsage.COPY_SRC:0;return n.createBuffer({label:`${e}-nanite-index-buffer`,size:Yr(r),usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST|GPUBufferUsage.STORAGE|o})}var Qi={bindings:{renderUniforms:0,meshlets:1,drawnMeshletIds:2,instancesTransforms:3,vertexPositions:4,vertexNormals:5,vertexUV:6,indexBuffer:7,diffuseTexture:8,sampler:9}},Mt=Qi.bindings,bl=()=>`

${wt}
${Fn}
${Ln}
${Qe}
${Et}
${Xt}
${Kt}

${fe.SHADER_SNIPPET(Mt.renderUniforms)}
${Vn(Mt.meshlets)}
${jn(Mt.drawnMeshletIds,"read")}
${xo(Mt.vertexPositions)}
${yo(Mt.vertexNormals)}
${ml(Mt.vertexUV)}
${at(Mt.instancesTransforms)}
${Mo(Mt.indexBuffer)}

@group(0) @binding(${Mt.diffuseTexture})
var _diffuseTexture: texture_2d<f32>;

@group(0) @binding(${Mt.sampler})
var _sampler: sampler;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) positionWS: vec4f,
  @location(1) normalWS: vec3f,
  @location(2) uv: vec2f,
  @location(3) @interpolate(flat) instanceIdx: u32,
  @location(4) @interpolate(flat) meshletId: u32,
  @location(5) @interpolate(flat) triangleIdx: u32,
};

const OUT_OF_SIGHT = 9999999.0;

@vertex
fn main_vs(
  @builtin(vertex_index) inVertexIndex: u32, // [0, triangleCount * VERTS_IN_TRIANGLE]
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  var result: VertexOutput;
  let drawData: vec2u = _getMeshletHardwareDraw(inInstanceIndex); // .x - transformIdx, .y - meshletIdx
  let meshlet = _meshlets[drawData.y];
  result.meshletId = drawData.y;
  let modelMat = _getInstanceTransform(drawData.x);

  // We always draw MAX_MESHLET_TRIANGLES * 3u, but meshlet might have less: discard.
  // While this is not the most performant approach, it has tiny memory footprint
  // (uvec2 * instances count * meshlets count).
  // We just say: draw X instances, each is (MAX_MESHLET_TRIANGLES * 3u) verts.
  if (inVertexIndex >= meshlet.triangleCount * 3) {
    result.position.x = OUT_OF_SIGHT; // NOTE: the spec does not say NaN would discard.
    result.position.y = OUT_OF_SIGHT; //       Suprised? Let's just say, I do not have 'mixed'
    result.position.z = OUT_OF_SIGHT; //       feelings about WGSL.
    result.position.w = 1.0;
    return result;
  }

  let vertexIdx = _indexBuffer[meshlet.firstIndexOffset + inVertexIndex];
  let vertexPos = _getVertexPosition(vertexIdx); // assumes .w=1
  let vertexN = _getVertexNormal(vertexIdx);
  let vertexUV = _getVertexUV(vertexIdx);

  let mvpMatrix = getMVP_Mat(modelMat, _uniforms.viewMatrix, _uniforms.projMatrix);
  let projectedPosition = mvpMatrix * vertexPos;
  let positionWS = modelMat * vertexPos;
  result.position = projectedPosition;
  result.positionWS = positionWS;
  result.normalWS = transformNormalToWorldSpace(modelMat, vertexN);
  result.uv = vertexUV;
  result.instanceIdx = drawData.x;
  result.triangleIdx = inVertexIndex;

  return result;
}


@fragment
fn main_fs(fragIn: VertexOutput) -> @location(0) vec4<f32> {
  let shadingMode = getShadingMode(_uniforms.flags);
  var color: vec3f;
  
  if (shadingMode == ${Vr}u) {
    color = getRandomColor(fragIn.triangleIdx);
  
  } else if (shadingMode == ${$r}u) {
    color = getRandomColor(fragIn.meshletId);

  } else if (shadingMode == ${Hr}u) {
    let meshlet = _meshlets[fragIn.meshletId];
    let lodLevel = meshlet.lodLevel;
    color = getRandomColor(lodLevel);
  
  } else if (shadingMode == ${vt}u) {
    color = abs(normalize(fragIn.normalWS));
    
  } else if (shadingMode == ${zt}u) {
    color = vec3f(1., 0., 0.);
    
  } else {
    var material: Material;
    createDefaultMaterial(&material, fragIn.positionWS);
    material.normal = normalize(fragIn.normalWS);
    material.albedo = textureSample(_diffuseTexture, _sampler, fragIn.uv).rgb;

    // shading
    var lights = array<Light, LIGHT_COUNT>();
    fillLightsData(&lights);
    color = doShading(material, AMBIENT_LIGHT, lights);
  }

  return vec4(color.xyz, 1.0);
}
`;var So=class n{static NAME="RasterizeHwPass";renderPipeline;bindingsCache=new Me;constructor(e,t){this.renderPipeline=n.createRenderPipeline(e,t)}static createRenderPipeline(e,t){let r=e.createShaderModule({label:be(n),code:bl()});return e.createRenderPipeline({label:ve(n),layout:"auto",vertex:{module:r,entryPoint:"main_vs",buffers:[]},fragment:{module:r,entryPoint:"main_fs",targets:[{format:t}]},primitive:yt,depthStencil:Ze})}cmdHardwareRasterize(e,t,r){let{cmdBuf:o,profiler:i,depthTexture:l,hdrRenderTexture:c}=e,m=o.beginRenderPass({label:n.NAME,colorAttachments:[Oe(c,Le(),r)],depthStencilAttachment:je(l,r),timestampWrites:i?.createScopeGpu(n.NAME)}),h=this.bindingsCache.getBindings(t.name,()=>this.createBindings(e,t));m.setPipeline(this.renderPipeline),m.setBindGroup(0,h),t.buffers.cmdDrawMeshletsHardwareIndirect(m),m.end()}createBindings=({device:e,globalUniforms:t,scene:r},o)=>{let i=Qi.bindings,l=o.buffers,c=eo(r,o);return Ie(c),xe(n,o.name,e,this.renderPipeline,[t.createBindingDesc(i.renderUniforms),l.bindMeshletData(i.meshlets),l.bindDrawnMeshletsList(i.drawnMeshletIds),o.bindInstanceTransforms(i.instancesTransforms),l.bindVertexPositions(i.vertexPositions),l.bindVertexNormals(i.vertexNormals),l.bindVertexUVs(i.vertexUV),l.bindIndexBuffer(i.indexBuffer),{binding:i.diffuseTexture,resource:c},{binding:i.sampler,resource:r.samplerLinear}])}};var Xn=`
/** Returns value [zNear, zFar] */
fn linearizeDepth(depth: f32) -> f32 {
  let zNear: f32 = ${De.near}f;
  let zFar: f32 = ${De.far}f;
  
  // PP := projection matrix
  // PP[10] = zFar / (zNear - zFar);
  // PP[14] = (zFar * zNear) / (zNear - zFar);
  // PP[11] = -1 ; PP[15] = 0 ; w = 1 
  // z = PP[10] * p.z + PP[14] * w; // matrix mul, but x,y do not matter for z,w coords
  // w = PP[11] * p.z + PP[15] * w;
  // z' = z / w = (zFar / (zNear - zFar) * p.z + (zFar * zNear) / (zNear - zFar)) / (-p.z)
  // p.z = (zFar * zNear) / (zFar + (zNear - zFar) * z')
  return zNear * zFar / (zFar + (zNear - zFar) * depth);
  
  // OpenGL:
  // let z = depth * 2.0 - 1.0; // back to NDC
  // let z = depth;
  // return (2.0 * zNear * zFar) / (zFar + zNear - z * (zFar - zNear));
}

/** Returns value [0, 1] */
fn linearizeDepth_0_1(depth: f32) -> f32 {
  let zNear: f32 = ${De.near}f;
  let zFar: f32 = ${De.far}f;
  let d2 = linearizeDepth(depth);
  return d2 / (zFar - zNear);
}
`;var Po=`

${ao}
${Xn}

/**
 * Everything closer than this will always pass the occlusion culling.
 * This fixes the AABB projection problems when sphere is near/intersecting zNear.
 * Most 'simple' sphere projection formulas just do not work in that case.
 * Technically we could test in view-space, smth like:
 *    'sphere.z < zNear && sphere.z + r > zNear'.
 * You will get flicker and instabilities.
 * 
 * Look, 1h ago I have rewritten bounding sphere radius calc and had 1e-9
 * differences to old approach. The math sometimes..
 * 
 * I DON'T HAVE TO DEAL WITH THIS.
 * 
 * Exact value choosen cause I say so.
 */
const CLOSE_RANGE_NEAR_CAMERA: f32 = 4.0;

/** 
 * https://www.youtube.com/live/Fj1E1A4CPCM?si=PJmBhKd_TQk1GMOb&t=2462 - triangles
 * https://www.youtube.com/watch?v=5sBpo5wKmEM - meshlets
*/
fn isPassingOcclusionCulling(
  modelMat: mat4x4<f32>,
  boundingSphere: vec4f,
  dbgOverrideMipmapLevel: i32 // if >=0 then overrides mipmap level for debug
) -> bool {
  let viewportSize = _uniforms.viewport.xy;
  let viewMat = _uniforms.viewMatrix;
  let projMat = _uniforms.projMatrix;

  // project meshlet's center to view space
  // NOTE: view space is weird, e.g. .z is NEGATIVE!
  let center = viewMat * modelMat * vec4f(boundingSphere.xyz, 1.);
  let r = boundingSphere.w;

  let closestPointZ = abs(center.z) - r;

  // get AABB in projection space
  var aabb = vec4f();
  let projectionOK = projectSphereView(projMat, center.xyz, r, &aabb);
  if (!projectionOK) { return true; } // if is close to near plane, it's always visible
  // let aabb = getAABBfrom8ProjectedPoints(projMat, center.xyz, r);

  // calc pixel span at fullscreen
  let pixelSpanW = abs(aabb.z - aabb.x) * viewportSize.x;
  let pixelSpanH = abs(aabb.w - aabb.y) * viewportSize.y;
  let pixelSpan = max(pixelSpanW, pixelSpanH);
  // return pixelSpanW * pixelSpanH > 100.; // death by thousand triangles..

  // Calc. mip level. If meshlet spans 50px, we round it to 64px and then sample log2(64) = 6 mip.
  // But, we calculated span in fullscreen, and pyramid level 0 is half. So add extra 1 level.
  var mipLevel = i32(ceil(log2(pixelSpan))); // i32 cause wgpu/deno
  if (dbgOverrideMipmapLevel >= 0) { mipLevel = dbgOverrideMipmapLevel; } // debug
  mipLevel = clampToMipLevels(mipLevel + 1, _depthPyramidTexture);
  // return mipLevel == 8; // 4 - far, 5/6 - far/mid, 8 - close

  // get the value from depth buffer (range: [0, 1]).
  // let mipSize = vec2f(textureDimensions(_depthPyramidTexture, mipLevel));
  // let samplePointAtMip = vec2u(aabb.xy * mipSize.xy);
  // let depthFromDepthBuffer = textureLoad(_depthPyramidTexture, samplePointAtMip, mipLevel).x;
  let depthFromDepthBuffer = textureSampleLevel(_depthPyramidTexture, _depthSampler, aabb.xy, f32(mipLevel)).x;
  // let depthFromDepthBuffer = 1.0;
  // return depthFromDepthBuffer == 1.0;

  /*
  // project the bounding sphere
  // PP[10 or 2|2] = -1.000100016593933
  // PP[14 or 3|2] = -0.010001000016927719
  let d = center.z - r; // INVESTIGATE: +/- to get closest?
  var depthMeshlet = (projMat[2][2] * d + projMat[3][2]) / -d; // in [0, 1]
  
  return depthMeshlet <= depthFromDepthBuffer;
  */
  let depthFromDepthBufferVS = linearizeDepth(depthFromDepthBuffer); // range [zNear .. zFar]
  return closestPointZ <= depthFromDepthBufferVS; // if there is any pixel that is closer than 'prepass-like' depth
}

/** project view-space AABB */
fn getAABBfrom8ProjectedPoints(projMat: mat4x4f, center: vec3f, r: f32) -> vec4f {
  let bb0 = getBB(projMat, center.xyz, r, vec3f( 1.,  1., 1.));
  let bb1 = getBB(projMat, center.xyz, r, vec3f(-1., -1., 1.));
  let bb2 = getBB(projMat, center.xyz, r, vec3f(-1.,  1., 1.));
  let bb3 = getBB(projMat, center.xyz, r, vec3f( 1., -1., 1.));
  //
  let bb4 = getBB(projMat, center.xyz, r, vec3f( 1.,  1., -1.));
  let bb5 = getBB(projMat, center.xyz, r, vec3f(-1., -1., -1.));
  let bb6 = getBB(projMat, center.xyz, r, vec3f(-1.,  1., -1.));
  let bb7 = getBB(projMat, center.xyz, r, vec3f( 1., -1., -1.));
  // aabb in [-1, 1]
  let aabbClip = vec4(
    min(min(min(bb0.x, bb1.x), min(bb2.x, bb3.x)), min(min(bb4.x, bb5.x), min(bb6.x, bb7.x))), // min x
    min(min(min(bb0.y, bb1.y), min(bb2.y, bb3.y)), min(min(bb4.y, bb5.y), min(bb6.y, bb7.y))), // min y
    max(max(max(bb0.x, bb1.x), max(bb2.x, bb3.x)), max(max(bb4.x, bb5.x), max(bb6.x, bb7.x))), // max x
    max(max(max(bb0.y, bb1.y), max(bb2.y, bb3.y)), max(max(bb4.y, bb5.y), max(bb6.y, bb7.y))), // max y
  );
  return (aabbClip + 1.0) * 0.5; // UV space
}

/** Calc in view space */
fn getBB(projMat: mat4x4f, center: vec3f, r: f32, dir: vec3f) -> vec4f {
  let p = center + r * dir;
  let pProj = projMat * vec4f(p, 1.);
  return pProj / pProj.w;
}

/**
 * https://github.com/zeux/niagara/blob/master/src/shaders/math.h#L2
 * https://zeux.io/2023/01/12/approximate-projected-bounds/
 * 2D Polyhedral Bounds of a Clipped, Perspective-Projected 3D Sphere. Michael Mara, Morgan McGuire. 2013
 * 
 * @param centerViewSpace sphere center (view space)
 * @param r radius
 */
fn projectSphereView(
  projMat: mat4x4f,
  centerViewSpace: vec3f,
  r: f32,
  pixelSpan: ptr<function, vec4f>
) -> bool {
  // abs cause view space is ???
  let zNear: f32 = ${De.near};
  // if (abs(center.z) < r + ${De.near}){
  // let distanceToNearPlane = abs(center.z) - zNear;
  // if (distanceToNearPlane < r){
  let closestPointZ = abs(centerViewSpace.z) - r;
  if (closestPointZ < zNear + CLOSE_RANGE_NEAR_CAMERA){
    return false;
  }

  // WARNING: This code only works for perspective camera
  // For ortho I think you would have [c.x-r, c.y-r, c.x+r, c.y+r]?
  let c = vec3f(centerViewSpace.xy, -centerViewSpace.z); // see camera.ts
  let cr = c * r;
  let czr2 = c.z * c.z - r * r;

  let vx = sqrt(c.x * c.x + czr2);
  let minX = (vx * c.x - cr.z) / (vx * c.z + cr.x);
  let maxX = (vx * c.x + cr.z) / (vx * c.z - cr.x);

  let vy = sqrt(c.y * c.y + czr2);
  let minY = (vy * c.y - cr.z) / (vy * c.z + cr.y);
  let maxY = (vy * c.y + cr.z) / (vy * c.z - cr.y);

  
  let P00 = projMat[0][0];
  let P11 = projMat[1][1];
  var aabb = vec4(minX * P00, minY * P11, maxX * P00, maxY * P11);
  // swizzle cause Y-axis is down. We will do abs() regardless. Then convert to [0, 1]
  aabb = aabb.xwzy * vec4(0.5, -0.5, 0.5, -0.5) + vec4(0.5);
  *pixelSpan = aabb;

  return true;
}


fn projectSphereToScreen(
  modelMat: mat4x4<f32>,
  boundingSphere: vec4f,
  pixelSpan: ptr<function,vec2f>
) -> bool {
  // get AABB in projection space
  // TODO [LOW] duplicate from occlusion culling
  let viewportSize = _uniforms.viewport.xy;
  let viewMat = _uniforms.viewMatrix;
  let projMat = _uniforms.projMatrix;
  var aabb = vec4f();
  let center = viewMat * modelMat * vec4f(boundingSphere.xyz, 1.);
  let r = boundingSphere.w;
  let projectionOK = projectSphereView(projMat, center.xyz, r, &aabb);
  *pixelSpan = vec2f(
    abs(aabb.z - aabb.x) * viewportSize.x,
    abs(aabb.w - aabb.y) * viewportSize.y
  );
  return projectionOK;
}
`;var To=`

fn isInsideCameraFrustum(
  modelMat: mat4x4<f32>,
  boundingSphere: vec4f
) -> bool {
  var center = vec4f(boundingSphere.xyz, 1.);
  center = modelMat * center;
  let r = boundingSphere.w;
  let r0 = dot(center, _uniforms.cameraFrustumPlane0) <= r;
  let r1 = dot(center, _uniforms.cameraFrustumPlane1) <= r;
  let r2 = dot(center, _uniforms.cameraFrustumPlane2) <= r;
  let r3 = dot(center, _uniforms.cameraFrustumPlane3) <= r;
  let r4 = dot(center, _uniforms.cameraFrustumPlane4) <= r;
  let r5 = dot(center, _uniforms.cameraFrustumPlane5) <= r;
  return r0 && r1 && r2 && r3 && r4 && r5;
}
`;var vl=`

fn isCorrectNaniteLOD (
  modelMat: mat4x4<f32>,
  meshlet: NaniteMeshletTreeNode
) -> bool {
  let flags = _uniforms.flags;

  let threshold = _uniforms.viewport.z;
  let screenHeight = _uniforms.viewport.y;
  let cotHalfFov = _uniforms.viewport.w;
  let mvpMatrix = getMVP_Mat(modelMat, _uniforms.viewMatrix, _uniforms.projMatrix);

  // getVisibilityStatus
  let clusterError = getProjectedError(
    mvpMatrix,
    screenHeight,
    cotHalfFov,
    meshlet.boundsMidPointAndError,
  );
  let parentError = getProjectedError(
    mvpMatrix,
    screenHeight,
    cotHalfFov,
    meshlet.parentBoundsMidPointAndError,
  );

  return parentError > threshold && clusterError <= threshold;
}


fn getProjectedError(
  mvpMatrix: mat4x4<f32>,
  screenHeight: f32,
  cotHalfFov: f32,
  boundsMidPointAndError: vec4f
) -> f32 {
  // return 1000.0 * boundsMidPointAndError.w; // used to debug tests, see calcs at the top of 'cullMeshletsPass.test.ts'
  
  let r = boundsMidPointAndError.w; // error
  
  // WARNING: .parentError is INFINITY at top level
  // This is implemented as GPU meshlet just having some absurd high value
  if (r >= PARENT_ERROR_INFINITY) {
    return PARENT_ERROR_INFINITY;
  }

  let center = mvpMatrix * vec4f(boundsMidPointAndError.xyz, 1.0f);
  let d2 = dot(center.xyz, center.xyz); // 
  let projectedR = (cotHalfFov * r) / sqrt(d2 - r * r);
  return (projectedR * screenHeight) / 2.0;
}
`;var vn={workgroupSizeX:32,maxWorkgroupsY:32768,bindings:{renderUniforms:0,resultBuffer:1,vertexPositions:2,indexBuffer:3,meshletsData:4,drawnMeshletIds:5,drawnMeshletParams:6,instancesTransforms:7,vertexNormals:8}},ea=(n,e)=>`

@group(0) @binding(${n})
var<storage, ${e}> _softwareRasterizerResult: ${e==="read_write"?"array<atomic<u32>>":"array<u32>"};
`,xl=vn,Lt=vn.bindings,yl=()=>`

${wt}
${kn}
${Et}
${Xn}

${fe.SHADER_SNIPPET(Lt.renderUniforms)}
${Vn(Lt.meshletsData)}
${go(Lt.drawnMeshletParams,"read")}
${jn(Lt.drawnMeshletIds,"read")}
${xo(Lt.vertexPositions)}
${yo(Lt.vertexNormals)}
${Mo(Lt.indexBuffer)}
${at(Lt.instancesTransforms)}
${ea(Lt.resultBuffer,"read_write")}

// test colors in ABGR
const COLOR_RED: u32 = 0xff0000ffu;
const COLOR_GREEN: u32 = 0xff00ff00u;
const COLOR_BLUE: u32 = 0xffff0000u;
const COLOR_TEAL: u32 = 0xffffff00u;
const COLOR_PINK: u32 = 0xffff00ffu;
const COLOR_YELLOW: u32 = 0xff00ffffu;

@compute
@workgroup_size(${xl.workgroupSizeX}, 1, 1)
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  // x - triangle id inside meshlet, always 0-124. You might have to discard
  // y - entry index into drawn meshlets SW list
  // z - 1

  let viewportSize: vec2f = _uniforms.viewport.xy;
  let viewMatrix = _uniforms.viewMatrix;
  let projMatrix = _uniforms.projMatrix;

  let triangleIdx: u32 = global_id.x;

  // prepare iters
  let drawnMeshletCnt: u32 = _drawnMeshletsSwParams.actuallyDrawnMeshlets;
  let iterCount: u32 = ceilDivideU32(drawnMeshletCnt, ${xl.maxWorkgroupsY}u);
  let tfxOffset: u32 = global_id.y * iterCount;

  for(var i: u32 = 0u; i < iterCount; i++){
    let iterOffset: u32 = tfxOffset + i;
    if (iterOffset >= drawnMeshletCnt) { continue; }

    // get meshlet
    let drawData: vec2u = _getMeshletSoftwareDraw(iterOffset); // .x - transfromIdx, .y - meshletIdx
    let meshlet = _meshlets[drawData.y];
    if (triangleIdx >= meshlet.triangleCount) { continue; }

    // get tfx
    let modelMat = _getInstanceTransform(drawData.x);
    let mvpMat = getMVP_Mat(modelMat, viewMatrix, projMatrix);

    // draw
    let indexOffset = meshlet.firstIndexOffset;
    rasterize(
      modelMat,
      mvpMat,
      viewportSize,
      indexOffset,
      triangleIdx
    );
  } 
}

fn rasterize(
  modelMat: mat4x4f,
  mvpMat: mat4x4f,
  viewportSizeF32: vec2f,
  indexOffset: u32,
  triangleIdx: u32
) {
  let viewportSize = vec2u(viewportSizeF32);

  let idx0 = _indexBuffer[indexOffset + triangleIdx * 3u];
  let idx1 = _indexBuffer[indexOffset + triangleIdx * 3u + 1u]; // swap idx1 and idx2 for CCW
  let idx2 = _indexBuffer[indexOffset + triangleIdx * 3u + 2u];
  let vertexPos0 = _getVertexPosition(idx0); // assumes .w=1
  let vertexPos1 = _getVertexPosition(idx1); // assumes .w=1
  let vertexPos2 = _getVertexPosition(idx2); // assumes .w=1
  let v0_NDC: vec3f = projectVertex(mvpMat, vertexPos0);
  let v1_NDC: vec3f = projectVertex(mvpMat, vertexPos1);
  let v2_NDC: vec3f = projectVertex(mvpMat, vertexPos2);
  let v0: vec2f = ndc2viewportPx(viewportSizeF32.xy, v0_NDC); // in pixels
  let v1: vec2f = ndc2viewportPx(viewportSizeF32.xy, v1_NDC); // in pixels
  let v2: vec2f = ndc2viewportPx(viewportSizeF32.xy, v2_NDC); // in pixels
  // storeResult(viewportSize, vec2u(v0.xy), COLOR_RED); // dbg
  // storeResult(viewportSize, vec2u(v1.xy), COLOR_GREEN); // dbg
  // storeResult(viewportSize, vec2u(v2.xy), COLOR_BLUE); // dbg
  let vertexN0 = _getVertexNormal(idx0);
  let vertexN1 = _getVertexNormal(idx1);
  let vertexN2 = _getVertexNormal(idx2);
  let n0 = transformNormalToWorldSpace(modelMat, vertexN0);
  let n1 = transformNormalToWorldSpace(modelMat, vertexN1);
  let n2 = transformNormalToWorldSpace(modelMat, vertexN2);
  
  // backface culling - CCW is OK, CW fails
  let triangleArea = -edgeFunction(v0, v1, v2); // negative cause CCW is default in WebGPU
  if (triangleArea < 0.) { return; }
  // NOTE: to handle CW, just swap v1 and v2

  // get bounding box XY points. All values in pixels as f32
  // MAX: top right on screen, but remember Y is inverted!
  var boundRectMax: vec2f = ceil(max(max(v0, v1), v2));
  // MIN: bottom left on screen, but remember Y is inverted!
  var boundRectMin: vec2f = floor(min(min(v0, v1), v2));
  // scissor
  boundRectMax = min(boundRectMax, viewportSizeF32.xy);
  boundRectMin = max(boundRectMin, vec2f(0.0, 0.0));
  // storeResult(viewportSize, vec2u(boundRectMax), COLOR_PINK); // dbg
  // storeResult(viewportSize, vec2u(boundRectMin), COLOR_PINK); // dbg

  // check if triangle covers only 1 pixel. It would do 0 iters.
  // But most code (incl. UE5) ignore this case?
  /*if(boundRectMin.x == boundRectMax.x && boundRectMin.y == boundRectMax.y) {
    let depth: f32 = (v0_NDC.z + v1_NDC.z + v2_NDC.z) / 3.0; // ?
    let n: vec3f = normalize(n0 + n1 + n2); // [-1, 1] // ?
    let value = createPayload(depth, n);
    storeResult(viewportSize, vec2u(u32(boundRectMin.x), u32(boundRectMin.y)), value);
  }*/



  let CC0 = edgeC(v2, v1);
  let CC1 = edgeC(v0, v2);
  let CC2 = edgeC(v1, v0);
  var CY0 = boundRectMin.x * CC0.A + boundRectMin.y * CC0.B + CC0.C;
	var CY1 = boundRectMin.x * CC1.A + boundRectMin.y * CC1.B + CC1.C;
	var CY2 = boundRectMin.x * CC2.A + boundRectMin.y * CC2.B + CC2.C;
  let triangleArea2 = CY0 + CY1 + CY2; // I wish I had debugger to preview the difference between both..

  // iterate row-by-row
  for (var y: f32 = boundRectMin.y; y < boundRectMax.y; y+=1.0) {
    var CX0 = CY0;
		var CX1 = CY1;
		var CX2 = CY2;

    // iterate columns
    for (var x: f32 = boundRectMin.x; x < boundRectMax.x; x+=1.0) {
      // barycentric coordinates (using simplest possible impl.)
      // let p = vec2f(x, y);
      // let C0 = edgeFunction(v2, v1, p) / triangleArea; // for vertex 0
      // let C1 = edgeFunction(v0, v2, p) / triangleArea; // for vertex 1
      // let C2 = edgeFunction(v1, v0, p) / triangleArea; // for vertex 2

      // if (C0 >= 0 && C1 >= 0 && C2 >= 0) {
      if (CX0 >= 0 && CX1 >= 0 && CX2 >= 0) {
        // barycentric coordinates
        let C0 = CX0 / triangleArea2; // for vertex 0
        let C1 = CX1 / triangleArea2; // for vertex 1
        let C2 = CX2 / triangleArea2; // for vertex 2
        
        let depth: f32 = v0_NDC.z * C0 + v1_NDC.z * C1 + v2_NDC.z * C2;
        let n: vec3f = normalize(n0 * C0 + n1 * C1 + n2 * C2); // [-1, 1]
        
        let value = createPayload(depth, n);
        storeResult(viewportSize, vec2u(u32(x), u32(y)), value);
      }

      CX0 += CC0.A;
			CX1 += CC1.A;
			CX2 += CC2.A;
    }

    CY0 += CC0.B;
    CY1 += CC1.B;
    CY2 += CC2.B;
  }
}

struct EdgeC{ A: f32, B: f32, C: f32 }
fn edgeC(v0: vec2f, v1: vec2f) -> EdgeC{
  // from edgeFunction() formula we extract: A * p.x + B * p.y + C.
  // This way, when we iterate over x-axis, we can just add A for
  // next pixel, as the "B * p.y + C" part does not change
  var result: EdgeC;
  result.A = v1.y - v0.y; // for p.x
  result.B = -v1.x + v0.x; // for p.y
  result.C = -v0.x * v1.y + v0.y * v1.x; // rest
  return result;
}

fn edgeFunction(v0: vec2f, v1: vec2f, p: vec2f) -> f32 {
  return (p.x - v0.x) * (v1.y - v0.y) - (p.y - v0.y) * (v1.x - v0.x);
}

const U16_MAX: f32 = 65535.0;

fn createPayload(depth0: f32, n: vec3f) -> u32 {
  // TODO [IGNORE] We could also store color data in 565 format instead of normals.
  //      But HDR would wreck us. So tonemap here (and also in hw rasterizer)?
  //      Feels like crap.

  // encode depth in 16bits
  // let depth = linearizeDepth_0_1(depth0); // debug, otherwise non-linear depth is not visible
  let depth = 1.0 - depth0; // reverse so we can take max instead of min. The buffer clear set all values to 0, so can't use min
  let depthU16 = clamp(depth * U16_MAX, 0., U16_MAX - 1); // depth in range fit for u16

  // encode normals. We could use pack4x8snorm(), but too lazy to debug
  // let n_0_1 = n * 0.5 + 0.5; // [0-1] // VERSION 0: NO OCT. ENCODED, XY ONLY
  let n_0_1 = encodeOctahedronNormal(n); // this has some edge cases, but as entire thing is a hack around lack of atomic<u64>, I do not care
  let nPacked: u32 = (
    (u32(n_0_1.x * 255) << 8) |
     u32(n_0_1.y * 255)
  );

  return (u32(depthU16) << 16) | nPacked;
}

fn debugBarycentric(C0: f32, C1: f32, C2: f32) -> u32 {
  let color0: u32 = u32(C0 * 255); // 0-255 as u32
  let color1: u32 = u32(C1 * 255); // 0-255 as u32
  let color2: u32 = u32(C2 * 255); // 0-255 as u32
  return (0xff000000u | // alpha
     color0 | // red
    (color1 << 8) | // green
    (color2 << 16) // blue
  );
}

fn projectVertex(mvpMat:mat4x4f, pos: vec4f) -> vec3f {
  let posClip = mvpMat * pos;
  let posNDC = posClip / posClip.w;
  return posNDC.xyz;
}

fn ndc2viewportPx(viewportSize: vec2f, pos: vec3f) -> vec2f {
  let pos_0_1 = pos.xy * 0.5 + 0.5; // to [0-1]
  return pos_0_1 * viewportSize.xy;
}

/** NOTE: if you want to store color for .png file, it's in ABGR format */
fn storeResult(viewportSize: vec2u, posPx: vec2u, value: u32) {
  // bitcast<u32>(value); <- if needed
  if(
    posPx.x < 0 || posPx.x >= viewportSize.x ||
    posPx.y < 0 || posPx.y >= viewportSize.y
  ) {
    return;
  }
  let y = viewportSize.y - posPx.y; // invert cause WebGPU coordinates
  let idx: u32 = y * viewportSize.x + posPx.x;
  // WebGPU clears to 0. So atomicMin is pointless..
  atomicMax(&_softwareRasterizerResult[idx], value);
}
`;var tt={workgroupSizeX:32,maxWorkgroupsY:32768,maxMeshletTriangles:`${P.nanite.preprocess.meshletMaxTriangles}u`,bindings:{renderUniforms:0,meshletsData:1,instancesTransforms:2,drawnMeshletsParams:3,drawnMeshletsSwParams:4,drawnMeshletsList:5,depthPyramidTexture:6,depthSampler:7,drawnInstancesParams:8,drawnInstancesList:9}},xn=tt,St=tt.bindings,wl=()=>`

${wt}
${kn}
${Po}
${To}
${vl}

${fe.SHADER_SNIPPET(St.renderUniforms)}
${Vn(St.meshletsData)}
${rl(St.drawnMeshletsParams,"read_write")}
${go(St.drawnMeshletsSwParams,"read_write")}
${jn(St.drawnMeshletsList,"read_write")}
${at(St.instancesTransforms)}

@group(0) @binding(${St.depthPyramidTexture})
var _depthPyramidTexture: texture_2d<f32>;

@group(0) @binding(${St.depthSampler})
var _depthSampler: sampler;


/** JS uses errorValue=Infnity when parent does not exist. I don't want to risk CPU->GPU transfer for infinity, so I use ridiculous value */
const PARENT_ERROR_INFINITY: f32 = 99990.0f;



///////////////////////////
/// SHADER VARIANT 1: use (global_id.y, global_id.z) to get the instance id
///////////////////////////

@compute
@workgroup_size(${xn.workgroupSizeX}, 1, 1)
fn main_SpreadYZ(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  // set rest of the indirect draw params. Has to be first line in the shader in case we ooopsie and do early return by accident somewhere.
  resetOtherDrawParams(global_id);

  // get meshlet
  let meshletIdx: u32 = global_id.x;
  if (meshletIdx >= arrayLength(&_meshlets)) {
    return;
  }
  let meshlet = _meshlets[meshletIdx];

  // reconstruct instanceId
  let tfxIdx: u32 = (global_id.z * ${xn.maxWorkgroupsY}u) + global_id.y;
  if (tfxIdx >= _getInstanceCount()) {
    return;
  }
  let modelMat = _getInstanceTransform(tfxIdx);

  let settingsFlags = _uniforms.flags;
  if (isMeshletRendered(settingsFlags, modelMat, meshlet)){
    registerDraw(modelMat, meshlet.ownBoundingSphere, tfxIdx, meshletIdx);
  }
}


///////////////////////////
/// SHADER VARIANT 2: iterate inside shader
///////////////////////////

@compute
@workgroup_size(${xn.workgroupSizeX}, 1, 1)
fn main_Iter(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  // set rest of the indirect draw params. Has to be first line in the shader in case we ooopsie and do early return by accident somewhere.
  resetOtherDrawParams(global_id);

  // get meshlet
  let meshletIdx: u32 = global_id.x;
  if (meshletIdx >= arrayLength(&_meshlets)) {
    return;
  }
  let meshlet = _meshlets[meshletIdx];
  let settingsFlags = _uniforms.flags;

  // prepare iters
  let instanceCount: u32 = _getInstanceCount();
  let iterCount: u32 = ceilDivideU32(instanceCount, ${xn.maxWorkgroupsY}u);
  let tfxOffset: u32 = global_id.y * iterCount;
  for(var i: u32 = 0u; i < iterCount; i++){
    let tfxIdx: u32 = tfxOffset + i;
    let modelMat = _getInstanceTransform(tfxIdx);

    if (isMeshletRendered(settingsFlags, modelMat, meshlet)){
      registerDraw(modelMat, meshlet.ownBoundingSphere, tfxIdx, meshletIdx);
    }
  } 
}

///////////////////////////
/// SHADER VARIANT 2: iterate inside shader INDIRECT DISPATCH
///////////////////////////



// cull params
${Yn(St.drawnInstancesParams,"read")}
// array with results
${Eo(St.drawnInstancesList,"read")}

@compute
@workgroup_size(${xn.workgroupSizeX}, 1, 1)
fn main_Indirect(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  // set rest of the indirect draw params. Has to be first line in the shader in case we ooopsie and do early return by accident somewhere.
  resetOtherDrawParams(global_id);

  // get meshlet
  let meshletIdx: u32 = global_id.x;
  if (meshletIdx >= arrayLength(&_meshlets)) {
    return;
  }
  let meshlet = _meshlets[meshletIdx];
  let settingsFlags = _uniforms.flags;

  // prepare iters
  let instanceCount: u32 = _drawnInstancesParams.actuallyDrawnInstances;
  let iterCount: u32 = ceilDivideU32(instanceCount, ${xn.maxWorkgroupsY}u);
  let tfxOffset: u32 = global_id.y * iterCount;
  for(var i: u32 = 0u; i < iterCount; i++){
    let iterOffset: u32 = tfxOffset + i;
    let tfxIdx: u32 = _drawnInstancesList[iterOffset];
    let modelMat = _getInstanceTransform(tfxIdx);

    if (isMeshletRendered(settingsFlags, modelMat, meshlet)){
      registerDraw(modelMat, meshlet.ownBoundingSphere, tfxIdx, meshletIdx);
    }
  } 
}

///////////////////////////
/// UTILS
///////////////////////////

fn isMeshletRendered(
  settingsFlags: u32,
  modelMat: mat4x4<f32>,
  meshlet: NaniteMeshletTreeNode
) -> bool {
  if (
    useFrustumCulling(settingsFlags) &&
    !isInsideCameraFrustum(modelMat, meshlet.ownBoundingSphere)
  ) {
    return false;
  }

  let overrideMipmap = getOverrideOcclusionCullMipmap(settingsFlags);
  if (
    useOcclusionCulling(settingsFlags) &&
    !isPassingOcclusionCulling(modelMat, meshlet.ownBoundingSphere, overrideMipmap)
  ) {
    return false;
  }

  return isCorrectNaniteLOD(modelMat, meshlet);
}

fn resetOtherDrawParams(global_id: vec3<u32>){
  if (global_id.x == 0u) {
    // We always draw 'MAX_MESHLET_TRIANGLES * VERTS_PER_TRIANGLE(3)' verts. Draw pass will discard if the meshlet has less.
    _drawnMeshletsParams.vertexCount = ${xn.maxMeshletTriangles} * 3u;
    _drawnMeshletsParams.firstVertex = 0u;
    _drawnMeshletsParams.firstInstance = 0u;

    _drawnMeshletsSwParams.workgroupsX = ceilDivideU32(
      ${P.nanite.preprocess.meshletMaxTriangles}u,
      ${vn.workgroupSizeX}u
    );
    _drawnMeshletsSwParams.workgroupsZ = 1u;
  }
}

fn registerDraw(
  modelMat: mat4x4f,
  boundingSphere: vec4f,
  tfxIdx: u32,
  meshletIdx: u32
){
  // TODO [LOW] Aggregate atomic writes. Use ballot like [Wihlidal 2015]:
  // "Optimizing the Graphics Pipeline with Compute"
  // 
  // TBH this *could* be optimized by the shader compiler. It can assume that
  // some threads in a warp add 1 to the atomic. It *COULD* then add
  // to the global atomic the sum ONCE and re-distribute result among the threads.
  // See NV_shader_thread_group, functionality 4.

  
  var pixelSpan = vec2f();
  let projectionOK = projectSphereToScreen(modelMat, boundingSphere, &pixelSpan);
  // let useSoftwareRasterizer = true; // mock
  let useSoftwareRasterizer = projectionOK &&
    pixelSpan.x * pixelSpan.y < _uniforms.softwareRasterizerThreshold; 

  if (useSoftwareRasterizer) {
    // (software rasterizer)
    // add 1, but no more than MAX_WORKGROUPS_Y.
    // meh impl, but..
    let MAX_WORKGROUPS_Y: u32 = ${vn.maxWorkgroupsY}u;
    atomicAdd(&_drawnMeshletsSwParams.workgroupsY, 1u);
    atomicMin(&_drawnMeshletsSwParams.workgroupsY, MAX_WORKGROUPS_Y);
      
    // add to the ACTUALL total counter
    let idx = atomicAdd(&_drawnMeshletsSwParams.actuallyDrawnMeshlets, 1u);
    _storeMeshletSoftwareDraw(idx, tfxIdx, meshletIdx);

  } else {
     // (hardware rasterizer)
    let idx = atomicAdd(&_drawnMeshletsParams.instanceCount, 1u);
    _storeMeshletHardwareDraw(idx, tfxIdx, meshletIdx);
  }
}
`;var Ao=class n{static NAME="CullMeshletsPass";pipeline_SpreadYZ;bindingsCache_SpreadYZ=new Me;pipeline_Iter;bindingsCache_Iter=new Me;pipeline_Indirect;bindingsCache_Indirect=new Me;constructor(e){let t=e.createShaderModule({label:be(n),code:wl()});this.pipeline_SpreadYZ=n.createPipeline(e,t,"main_SpreadYZ"),this.pipeline_Iter=n.createPipeline(e,t,"main_Iter"),this.pipeline_Indirect=n.createPipeline(e,t,"main_Indirect")}static createPipeline(e,t,r){return e.createComputePipeline({label:ve(n,r),layout:"auto",compute:{module:t,entryPoint:r}})}onViewportResize=()=>{this.bindingsCache_SpreadYZ.clear(),this.bindingsCache_Iter.clear(),this.bindingsCache_Indirect.clear()};cmdCullMeshlets(e,t){let{cmdBuf:r,profiler:o}=e;t.buffers.cmdClearDrawnMeshletsParams(r);let i=r.beginComputePass({label:n.NAME,timestampWrites:o?.createScopeGpu(n.NAME)});P.cullingInstances.enabled?this.dispatchVariant_Indirect(e,i,t):P.nanite.render.useVisibilityImpl_Iter?this.dispatchVariant_Iter(e,i,t):this.dispatchVariant_SpreadYZ(e,i,t),i.end()}dispatchVariant_SpreadYZ(e,t,r){let o=this.pipeline_SpreadYZ,i=this.bindingsCache_SpreadYZ.getBindings(r.name,()=>this.createBindings(e,o,r));t.setPipeline(o),t.setBindGroup(0,i);let l=Rn(r.meshletCount,tt.workgroupSizeX),c=Math.ceil(Math.min(r.instancesCount,tt.maxWorkgroupsY)),m=Math.ceil(r.instancesCount/tt.maxWorkgroupsY);t.dispatchWorkgroups(l,c,m)}dispatchVariant_Iter(e,t,r){let o=this.pipeline_Iter,i=this.bindingsCache_Iter.getBindings(r.name,()=>this.createBindings(e,o,r));t.setPipeline(o),t.setBindGroup(0,i);let l=Rn(r.meshletCount,tt.workgroupSizeX),c=Math.min(r.instancesCount,tt.maxWorkgroupsY);t.dispatchWorkgroups(l,c,1)}dispatchVariant_Indirect(e,t,r){let o=this.pipeline_Indirect,i=this.bindingsCache_Indirect.getBindings(r.name,()=>this.createBindingsIndirect(e,o,r));t.setPipeline(o),t.setBindGroup(0,i),t.dispatchWorkgroupsIndirect(r.buffers.drawnInstancesBuffer,0)}getTheUsuallBindGroups({globalUniforms:e,prevFrameDepthPyramidTexture:t,depthPyramidSampler:r},o){let i=tt.bindings,l=o.buffers;return Ie(t),[e.createBindingDesc(i.renderUniforms),l.bindMeshletData(i.meshletsData),l.bindDrawnMeshletsParams(i.drawnMeshletsParams),l.bindDrawnMeshletsList(i.drawnMeshletsList),l.bindDrawnMeshletsSwParams(i.drawnMeshletsSwParams),o.bindInstanceTransforms(i.instancesTransforms),{binding:i.depthPyramidTexture,resource:t},{binding:i.depthSampler,resource:r}]}createBindings=(e,t,r)=>{let{device:o}=e,i=this.getTheUsuallBindGroups(e,r);return xe(n,r.name,o,t,i)};createBindingsIndirect=(e,t,r)=>{let{device:o}=e,i=tt.bindings,l=this.getTheUsuallBindGroups(e,r),c=r.buffers;return xe(n,r.name,o,t,[...l,c.bindDrawnInstancesParams(i.drawnInstancesParams),c.bindDrawnInstancesList(i.drawnInstancesList)])}};var se=Bt.create(),Io=class n{static PLANE_NAMES=["left","right","top","bottom","near","far"];planes=new Float32Array(24);update(e){let t=e;Y.set(-(t[0]+t[3]),-(t[4]+t[7]),-(t[8]+t[11]),se);let r=Y.length(se);this.planes[0]=se[0]/r,this.planes[1]=se[1]/r,this.planes[2]=se[2]/r,this.planes[3]=-(t[12]+t[15])/r,Y.set(t[0]-t[3],t[4]-t[7],t[8]-t[11],se),r=Y.length(se),this.planes[4]=se[0]/r,this.planes[5]=se[1]/r,this.planes[6]=se[2]/r,this.planes[7]=(t[12]-t[15])/r,Y.set(-(t[1]+t[3]),-(t[5]+t[7]),-(t[9]+t[11]),se),r=Y.length(se),this.planes[8]=se[0]/r,this.planes[9]=se[1]/r,this.planes[10]=se[2]/r,this.planes[11]=-(t[13]+t[15])/r,Y.set(t[1]-t[3],t[5]-t[7],t[9]-t[11],se),r=Y.length(se),this.planes[12]=se[0]/r,this.planes[13]=se[1]/r,this.planes[14]=se[2]/r,this.planes[15]=(t[13]-t[15])/r,Y.set(-(t[2]+t[3]),-(t[6]+t[7]),-(t[10]+t[11]),se),r=Y.length(se),this.planes[16]=se[0]/r,this.planes[17]=se[1]/r,this.planes[18]=se[2]/r,this.planes[19]=-(t[14]+t[15])/r,Y.set(t[2]-t[3],t[6]-t[7],t[10]-t[11],se),r=Y.length(se),this.planes[20]=se[0]/r,this.planes[21]=se[1]/r,this.planes[22]=se[2]/r,this.planes[23]=(t[14]-t[15])/r}isInside(e){let t=e,r=!0;for(let o=0;o<6;o++){let l=t[0]*this.planes[o*4]+t[1]*this.planes[o*4+1]+t[2]*this.planes[o*4+2]+this.planes[o*4+3]<=t[3];r=r&&l}return r}toStr(){let e=o=>this.planes[o].toFixed(2),t=o=>`[${e(o)}, ${e(o+1)}, ${e(o+2)},  d=${e(o+3)}]`;return`Frustum:( 
${n.PLANE_NAMES.map((o,i)=>"  "+o+": "+t(i*4)).join(`
`)}
)`}};var Kn={workgroupSizeX:8,workgroupSizeY:8,bindings:{textureSrc:0,textureDst:1}},El=Kn,Ml=Kn.bindings,Sl=()=>`

@group(0) @binding(${Ml.textureSrc})
var _textureSrc: texture_2d<f32>;

@group(0) @binding(${Ml.textureDst})
var _textureDst: texture_storage_2d<r32float, write>;


@compute
@workgroup_size(${El.workgroupSizeX}, ${El.workgroupSizeY}, 1)
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  let index = global_id.xy;
  let dimSrc = vec2u(textureDimensions(_textureSrc, 0));

  if (index.x >= dimSrc.x || index.y >= dimSrc.y){
    return;
  }

  // sample
  var depth = 0.0;
  let pos = index * 2;
  // max cause we have: depthCompare='less',
  // so everything closer (less depth) will be rendered.
  // "Culled if the closest mesh vertex is still further than depthmap"
  // TBH we could also use textureGather() here
  depth = max(depth, textureLoad(_textureSrc, pos                , 0).x);
  depth = max(depth, textureLoad(_textureSrc, pos + vec2u(0u, 1u), 0).x);
  depth = max(depth, textureLoad(_textureSrc, pos + vec2u(1u, 0u), 0).x);
  depth = max(depth, textureLoad(_textureSrc, pos + vec2u(1u, 1u), 0).x);

  // write
  textureStore(_textureDst, index, vec4(depth));
}
`;var Ro=n=>Math.floor(n/2),Ld=n=>n.createSampler({label:Ut(Ir,"depth-sampler"),magFilter:"nearest",minFilter:"nearest",mipmapFilter:"nearest",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"}),Ir=class n{static NAME="DepthPyramidPass";pipeline;resultTexture=void 0;resultTextureView=void 0;depthSampler;pyramidLevels=[];constructor(e){this.pipeline=n.createPipeline(e),this.depthSampler=Ld(e)}static createPipeline(e){let t=e.createShaderModule({label:be(n),code:Sl()});return e.createComputePipeline({label:ve(n),layout:"auto",compute:{module:t,entryPoint:"main"}})}verifyResultTexture(e,t,r,o=!1){Ie(r);let i=Ro(t.width),l=Ro(t.height);if(this.resultTexture?.width===i&&this.resultTexture?.height===l&&this.pyramidLevels.length>0&&this.resultTextureView!=null&&!o)return[this.resultTexture,this.resultTextureView];this.resultTexture&&this.resultTexture.destroy();let c=Math.ceil(Math.log2(Math.min(i,l)));console.log(`${n.NAME}: Create depth pyramid: ${i}x${l} with ${c} mip levels`),this.resultTexture=e.createTexture({label:Ut(n,`result-${i}-${l}`),dimension:"2d",size:[i,l,1],format:"r32float",usage:GPUTextureUsage.COPY_SRC|GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.TEXTURE_BINDING,mipLevelCount:c}),this.resultTextureView=this.resultTexture.createView({label:`${this.resultTexture.label}-view`}),this.pyramidLevels=[];let m=i,h=l,g=r;this.runtimeEnvSupportsDepthPyramid()||(console.warn("Current runtime environment does not support depth pyramid"),c=0);for(let _=0;_<c;_++){let x=this.resultTexture.createView({label:Ut(n,`mip-${_}`),baseMipLevel:_,mipLevelCount:1}),T=this.createBindings(e,`mip-${_}`,g,x);this.pyramidLevels.push({level:_,textureView:x,bindings:T,width:m,height:h}),g=x,m=Ro(m),h=Ro(h)}return[this.resultTexture,this.resultTextureView]}runtimeEnvSupportsDepthPyramid(){return!(cn&&!P.isTest)}cmdCreateDepthPyramid(e,t,r){if(!this.runtimeEnvSupportsDepthPyramid())return!1;let{cmdBuf:o,profiler:i}=e;Ie(r),this.verifyResultTexture(e.device,t,r);let l=o.beginComputePass({label:n.NAME,timestampWrites:i?.createScopeGpu(n.NAME)});return l.setPipeline(this.pipeline),this.pyramidLevels.forEach(c=>this.dispatchPyramidLevel(l,c)),l.end(),!0}dispatchPyramidLevel(e,t){e.setBindGroup(0,t.bindings);let r=Rn(t.width,Kn.workgroupSizeX),o=Rn(t.height,Kn.workgroupSizeY);e.dispatchWorkgroups(r,o,1)}createBindings=(e,t,r,o)=>{Ie(r),Ie(o);let i=Kn.bindings;return xe(n,t,e,this.pipeline,[{binding:i.textureSrc,resource:r},{binding:i.textureDst,resource:o}])}};var Jn=`

/** https://www.saschawillems.de/blog/2016/08/13/vulkan-tutorial-on-rendering-a-fullscreen-quad-without-buffers/ */
fn getFullscreenTrianglePosition(vertIdx: u32) -> vec4f {
  let outUV = vec2u((vertIdx << 1) & 2, vertIdx & 2);
  return vec4f(vec2f(outUV) * 2.0 - 1.0, 0.0, 1.0);
}
`;function Zn(n){n.draw(3)}var Tl={bindings:{renderUniforms:0,depthPyramidTexture:1}},Pl=Tl.bindings,kd=()=>`

${fe.SHADER_SNIPPET(Pl.renderUniforms)}
@group(0) @binding(${Pl.depthPyramidTexture})
var _depthPyramidTexture: texture_2d<f32>;

${ao}
${Jn}
${Xn}

@vertex
fn main_vs(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {
  return getFullscreenTrianglePosition(VertexIndex);
}


@fragment
fn main_fs(
  // this is not uv, it's in pixels
  @builtin(position) coord: vec4<f32>
) -> @location(0) vec4<f32> {
  let viewportSize = vec2f(_uniforms.viewport.x, _uniforms.viewport.y);
  var mipLevel: i32 = getDbgPyramidMipmapLevel(_uniforms.flags);
  mipLevel = clampToMipLevels(mipLevel, _depthPyramidTexture);
  let mipSize = vec2f(textureDimensions(_depthPyramidTexture, mipLevel));
  let mipCoord = coord.xy / viewportSize * mipSize;

  var depth = textureLoad(_depthPyramidTexture, vec2u(mipCoord.xy), mipLevel).x;
  
  var c = vec3f(0., 0., 0.);
  if (depth < 1.0) {
    c.g = linearizeDepth_0_1(depth);
    c.b = 0.2; // some color so it's not black regardless of depth
  }

  return vec4(c, 1.0);
}
`,Co=class n{static NAME="DepthPyramidDebugDrawPass";renderPipeline;bindingsCache=new Me;constructor(e,t){this.renderPipeline=n.createRenderPipeline(e,t)}static createRenderPipeline(e,t){let r=e.createShaderModule({label:be(n),code:kd()});return e.createRenderPipeline({label:ve(n),layout:"auto",vertex:{module:r,entryPoint:"main_vs",buffers:[]},fragment:{module:r,entryPoint:"main_fs",targets:[{format:t}]},primitive:{topology:"triangle-list"}})}onViewportResize=()=>this.bindingsCache.clear();cmdDraw(e){let{cmdBuf:t,profiler:r,hdrRenderTexture:o,depthTexture:i}=e,l=t.beginRenderPass({label:n.NAME,colorAttachments:[Oe(o,Le())],timestampWrites:r?.createScopeGpu(n.NAME)}),c=this.bindingsCache.getBindings(i.label,()=>this.createBindings(e));l.setBindGroup(0,c),l.setPipeline(this.renderPipeline),Zn(l),l.end()}createBindings=({device:e,globalUniforms:t,prevFrameDepthPyramidTexture:r})=>{let o=Tl.bindings;return xe(n,"000",e,this.renderPipeline,[t.createBindingDesc(o.renderUniforms),{binding:o.depthPyramidTexture,resource:r}])}};var Rr={workgroupSizeX:32,maxWorkgroupsY:32768,maxMeshletTriangles:`${P.nanite.preprocess.meshletMaxTriangles}u`,bindings:{renderUniforms:0,instancesTransforms:1,dispatchIndirectParams:2,drawnInstanceIdsResult:3,billboardsParams:4,billboardsIdsResult:5,depthPyramidTexture:6,depthSampler:7}},Al=Rr,Jt=Rr.bindings,Il=()=>`

${fe.SHADER_SNIPPET(Jt.renderUniforms)}
${wt}
${kn}
${To}
${Po}

// instance transforms
${at(Jt.instancesTransforms)}

// cull params
${Yn(Jt.dispatchIndirectParams,"read_write")}
// cull: array with results
${Eo(Jt.drawnInstanceIdsResult,"read_write")}

// billboard params
${pl(Jt.billboardsParams,"read_write")}
// billboard: array with results
${wo(Jt.billboardsIdsResult,"read_write")}

// depth pyramid + sampler
@group(0) @binding(${Jt.depthPyramidTexture})
var _depthPyramidTexture: texture_2d<f32>;
@group(0) @binding(${Jt.depthSampler})
var _depthSampler: sampler;



@compute
@workgroup_size(${Al.workgroupSizeX}, 1, 1)
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  // set rest of the indirect draw params. Has to be first line in the shader in case we ooopsie and do early return by accident somewhere.
  resetOtherDrawParams(global_id);

  let settingsFlags = _uniforms.flags;
  let boundingSphere = _drawnInstancesParams.objectBoundingSphere;
  let MAX_WORKGROUPS_Y: u32 = ${tt.maxWorkgroupsY}u;

  
  // prepare iters
  let instanceCount: u32 = _getInstanceCount();
  let iterCount: u32 = ceilDivideU32(instanceCount, ${Al.maxWorkgroupsY}u);
  let tfxOffset: u32 = global_id.x * iterCount;

  for(var i: u32 = 0u; i < iterCount; i++){
    let tfxIdx: u32 = tfxOffset + i;
    if (tfxIdx >= instanceCount) { continue; }
    let modelMat = _getInstanceTransform(tfxIdx);

    if (!isInstanceRendered(settingsFlags, modelMat, boundingSphere)){
      continue;
    }

    if (renderAsBillboard(settingsFlags, modelMat, boundingSphere)) {
      let idx = atomicAdd(&_drawnImpostorsParams.instanceCount, 1u);
      _drawnImpostorsList[idx] = tfxIdx;

    } else {
      // add 1, but no more than MAX_WORKGROUPS_Y.
      // meh impl, but..
      atomicAdd(&_drawnInstancesParams.workgroupsY, 1u);
      atomicMin(&_drawnInstancesParams.workgroupsY, MAX_WORKGROUPS_Y);
      
      // add to the ACTUALL total counter
      let idx = atomicAdd(&_drawnInstancesParams.actuallyDrawnInstances, 1u);
      _drawnInstancesList[idx] = tfxIdx;
    }
  } 
}

///////////////////////////
/// UTILS
///////////////////////////

fn isInstanceRendered(
  settingsFlags: u32,
  modelMat: mat4x4<f32>,
  boundingSphere: vec4f
) -> bool {
  if (
    useInstancesFrustumCulling(settingsFlags) &&
    !isInsideCameraFrustum(modelMat, boundingSphere)
  ) {
    return false;
  }

  let overrideMipmap = getOverrideOcclusionCullMipmap(settingsFlags);
  if (
    useInstancesOcclusionCulling(settingsFlags) &&
    !isPassingOcclusionCulling(modelMat, boundingSphere, overrideMipmap)
  ) {
    return false;
  }

  return true;
}


fn renderAsBillboard(
  settingsFlags: u32,
  modelMat: mat4x4<f32>,
  boundingSphere: vec4f
) -> bool {
  if (useForceBillboards(settingsFlags)) {
    return true;
  }

  var pixelSpan = vec2f();
  let projectionOK = projectSphereToScreen(modelMat, boundingSphere, &pixelSpan);
  return (
    projectionOK &&
    pixelSpan.x * pixelSpan.y < _uniforms.billboardThreshold
  );
}

fn resetOtherDrawParams(global_id: vec3<u32>){
  if (global_id.x == 0u) {
    _drawnInstancesParams.workgroupsX = ceilDivideU32(
      _drawnInstancesParams.allMeshletsCount,
      ${tt.workgroupSizeX}u
    );
    _drawnInstancesParams.workgroupsZ = 1u;

    _drawnImpostorsParams.vertexCount = 6u; // billboard
    _drawnImpostorsParams.firstVertex = 0u;
    _drawnImpostorsParams.firstInstance = 0u;
  }
}

`;var Bo=class n{static NAME="CullInstancesPass";pipeline;bindingsCache=new Me;constructor(e){let t=e.createShaderModule({label:be(n),code:Il()});this.pipeline=e.createComputePipeline({label:ve(n),layout:"auto",compute:{module:t,entryPoint:"main"}})}onViewportResize=()=>{this.bindingsCache.clear()};cmdCullInstances(e,t){let{cmdBuf:r,profiler:o}=e;t.buffers.cmdClearDrawnInstancesDispatchParams(r),t.buffers.cmdClearDrawnImpostorsParams(r);let i=r.beginComputePass({label:n.NAME,timestampWrites:o?.createScopeGpu(n.NAME)}),l=this.pipeline,c=this.bindingsCache.getBindings(t.name,()=>this.createBindings(e,l,t));i.setPipeline(l),i.setBindGroup(0,c);let m=Math.min(t.instancesCount,Rr.maxWorkgroupsY);i.dispatchWorkgroups(m,1,1),i.end()}createBindings=({device:e,globalUniforms:t,prevFrameDepthPyramidTexture:r,depthPyramidSampler:o},i,l)=>{let c=Rr.bindings;Ie(r);let m=l.buffers;return xe(n,l.name,e,i,[t.createBindingDesc(c.renderUniforms),l.bindInstanceTransforms(c.instancesTransforms),m.bindDrawnInstancesParams(c.dispatchIndirectParams),m.bindDrawnInstancesList(c.drawnInstanceIdsResult),m.bindDrawnImpostorsParams(c.billboardsParams),m.bindDrawnImpostorsList(c.billboardsIdsResult),{binding:c.depthPyramidTexture,resource:r},{binding:c.depthSampler,resource:o}])}};var Do=`

const DITHER_ELEMENT_RANGE: f32 = 63.0;

/** No. of possible colors in u8 color value */
const DITHER_LINEAR_COLORSPACE_COLORS: f32 = 256.0;

// Too lazy to use texture or smth
const DITHER_MATRIX = array<u32, 64>(
  0, 32,  8, 40,  2, 34, 10, 42,
 48, 16, 56, 24, 50, 18, 58, 26,
 12, 44,  4, 36, 14, 46,  6, 38,
 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43,  1, 33,  9, 41,
 51, 19, 59, 27, 49, 17, 57, 25,
 15, 47,  7, 39, 13, 45,  5, 37,
 63, 31, 55, 23, 61, 29, 53, 21
);

/** Returns 0-1 dithered value
 * @ Param gl_FragCoord - fragment coordinate (in pixels)
 */
fn getDitherForPixel(gl_FragCoord: vec2u) -> f32 {
  let pxPos = vec2u(
    gl_FragCoord.x % 8u,
    gl_FragCoord.y % 8u
  );
  let idx = pxPos.y * 8u + pxPos.x;
  // Disabled on Deno, as Naga does not allow indexing 'array<u32, 64>'
  // with nonconst values. See 'nagaFixes.ts'.
  let matValue = DITHER_MATRIX[${zr?"0":"idx"}]; // [1-64]
  return f32(matValue) / DITHER_ELEMENT_RANGE;
}

/**
 * Add some random value to each pixel,
 * hoping it would make it different than neighbours
 */
fn ditherColor (
  gl_FragCoord: vec2u,
  originalColor: vec3f,
  strength: f32
) -> vec3f {
  let ditherMod = getDitherForPixel(gl_FragCoord) * strength  / DITHER_LINEAR_COLORSPACE_COLORS;
  return originalColor + ditherMod;
}

`;var Oo=`

fn packNormal(n: vec4f) -> f32 {
  return bitcast<f32>(pack4x8snorm(n));
}

fn unpackNormal(p: f32) -> vec3f {
  let v = unpack4x8snorm(bitcast<u32>(p));
  return normalize(v.xyz);
}

fn packColor8888(color: vec4f) -> f32 {
  return bitcast<f32>(pack4x8unorm(color));
}

fn unpackColor8888(p: f32) -> vec4f {
  return unpack4x8unorm(bitcast<u32>(p));
}
`;var ta={bindings:{renderUniforms:0,instancesTransforms:1,wholeObjectCullData:2,billboardsIdsResult:3,impostorTexture:4,sampler:5}},Qn=ta.bindings,Rl=()=>`

${fe.SHADER_SNIPPET(Qn.renderUniforms)}
${Do}
${Oo}
${Et}
${Xt}
${Kt}
${Qe}

// for bounding sphere
${Yn(Qn.wholeObjectCullData,"read")}

// instance transforms
${at(Qn.instancesTransforms)}

// billboard: array with results
${wo(Qn.billboardsIdsResult,"read")}

@group(0) @binding(${Qn.impostorTexture})
var _diffuseTexture: texture_2d<f32>;

@group(0) @binding(${Qn.sampler})
var _sampler: sampler;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) positionWS: vec4f,
  @location(1) uv: vec2f,
  @location(2) @interpolate(flat) facingAngleDgr: f32,
  @location(3) @interpolate(flat) tfxIdx: u32,
};

@vertex
fn main_vs(
  @builtin(vertex_index) inVertexIndex: u32,
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  // I would love to have this outside main_vs() as const,
  // but wgpu's Naga does not like it.
  var BILLBOARD_VERTICES = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(-1.0, 1.0),
    vec2<f32>(1.0, -1.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(-1.0, 1.0),
    vec2<f32>(1.0, -1.0),
  );

  var result: VertexOutput;
  
  let quadOffset = BILLBOARD_VERTICES[inVertexIndex];
  let tfxIdx = _drawnImpostorsList[inInstanceIndex];
  let modelMat = _getInstanceTransform(tfxIdx);
  
  let boundingSphere = _drawnInstancesParams.objectBoundingSphere;
  let r = boundingSphere.w;
  let viewMat = _uniforms.viewMatrix;
  let projMat = _uniforms.projMatrix;
  
  // See './mathPlayground.test.ts' for test for math on this part
  // center -> view, then move corners in view space by radius, then project
  let center = viewMat * modelMat * vec4f(boundingSphere.xyz, 1.);
  let cornerVS = vec4f(center.xy + r * quadOffset, center.z, 1.);
  // TODO modify .z to bring closer/FURTHER in view space? Further means occ. cull will be more conservative

  result.position = projMat * cornerVS;
  result.positionWS = modelMat * vec4f(boundingSphere.xyz, 1.); // TODO [IGNORE] viewMatInv * cornerVS; would be better
  result.uv = (quadOffset.xy + 1.0) / 2.0;
  result.uv.y = 1.0 - result.uv.y;
  result.tfxIdx = tfxIdx;

  // calculate 2d angle (ignore Y-axis) between camera-to-object and where model is facing
  // used to calculate which impostor image to use
  let cameraPos = _uniforms.cameraPosition.xyz;
  let centerWS = (modelMat * vec4f(boundingSphere.xyz, 1.)).xyz;
  var camera2ModelDir: vec3f = cameraPos - centerWS;
  // var camera2ModelDir: vec3f = cameraPos; // mock
  var objectFrontDir: vec3f = (modelMat * vec4f(0., 0., 1., 0.)).xyz;
  // let objectFrontDir = vec3f(0., 0., 1.0); // mock
  result.facingAngleDgr = angleDgr_axisXZ(objectFrontDir, camera2ModelDir);

  return result;
}

/** https://math.stackexchange.com/questions/878785/how-to-find-an-angle-in-range0-360-between-2-vectors
 * 
 * Consult 'srcpasses
aniteBillboardmathPlayground.test.ts' before making any changes!
 */
fn angleDgr_axisXZ(vecA: vec3f, vecB: vec3f) -> f32 {
  let vecAn = normalize(vec2f(vecA.x, vecA.z));
  let vecBn = normalize(vec2f(vecB.x, vecB.z));
  let dot = vecAn.x * vecBn.x + vecAn.y * vecBn.y;
  let det = vecAn.x * vecBn.y - vecAn.y * vecBn.x;
  var dgr = degrees(atan2(det, dot));

  while (dgr < 0.0) { dgr += 360.0; }
  return dgr;
}


const IMPOSTOR_COUNT: u32 = ${P.impostors.views};
const IMPOSTOR_COUNT_INV: f32 = 1.0 / f32(${P.impostors.views});


struct ImpostorSample {
  diffuse: vec4f,
  normal: vec3f,
};

@fragment
fn main_fs(
  fragIn: VertexOutput
) -> @location(0) vec4<f32> {
  let modelMat = _getInstanceTransform(fragIn.tfxIdx);
  let delta = 360.0 * IMPOSTOR_COUNT_INV; // 30dgr
  let shownImageF32 = fragIn.facingAngleDgr / delta;

  // do blend between 2 consecutive billboard images. Not amazing, but..
  let shownImage0 = u32(floor(shownImageF32));
  let shownImage1 = u32(ceil(shownImageF32)); // to hipster to +1
  let impostor0 = impostorSample(modelMat, shownImage0, fragIn.uv);
  let impostor1 = impostorSample(modelMat, shownImage1, fragIn.uv);

  // mix factor between both images
  let ditherStr = getBillboardDitheringStrength(_uniforms.flags);
  let dither = getDitherForPixel(vec2u(fragIn.position.xy)) - 0.5; // range: [-0.5 .. 0.5]
  let modStr = saturate(mix(fract(shownImageF32), dither, ditherStr));

  let shadingMode = getShadingMode(_uniforms.flags);
  var color: vec4f;

  if (shadingMode == ${vt}u) {
    // ignores impostor1, but it's just a debug mode so..
    color = vec4f(abs(impostor0.normal), impostor0.diffuse.a);
    
  } else if (shadingMode == ${zt}u) {
    color = vec4f(0., 0., 1., impostor0.diffuse.a);

  } else {
    // shading
    var material: Material;
    createDefaultMaterial(&material, fragIn.positionWS);
    var lights = array<Light, LIGHT_COUNT>();
    fillLightsData(&lights);

    // impostor 0
    material.normal = impostor0.normal;
    material.albedo = impostor0.diffuse.rgb;
    let c0 = doShading(material, AMBIENT_LIGHT, lights);
    // impostor 1
    material.normal = impostor1.normal;
    material.albedo = impostor1.diffuse.rgb;
    let c1 = doShading(material, AMBIENT_LIGHT, lights);

    // mix
    let a = mix(impostor0.diffuse.a, impostor1.diffuse.a, modStr);
    color = vec4f(mix(c0, c1, modStr), a);
  }

  if (color.a < 0.5) { discard; }
  return vec4(color.xyz, 1.0);
}


fn impostorSample(modelMat: mat4x4f, idx: u32, uv: vec2f) -> ImpostorSample {
  // e.g. for idx=4 and uv.x=0.7 turn into 4.7 and then divide by IMPOSTOR_COUNT
  let uvX = (f32(idx % IMPOSTOR_COUNT) + uv.x) * IMPOSTOR_COUNT_INV;
  let texValues = textureSample(_diffuseTexture, _sampler, vec2f(uvX, uv.y));

  var result: ImpostorSample;
  result.diffuse = unpackColor8888(texValues.r);
  result.normal = transformNormalToWorldSpace(modelMat, unpackNormal(texValues.g));
  return result;
}
`;var No=class n{static NAME="NaniteBillboardPass";pipeline;bindingsCache=new Me;constructor(e,t){let r=e.createShaderModule({label:be(n),code:Rl()});this.pipeline=e.createRenderPipeline({label:ve(n),layout:"auto",vertex:{module:r,entryPoint:"main_vs",buffers:[]},fragment:{module:r,entryPoint:"main_fs",targets:[{format:t}]},primitive:{cullMode:"none",topology:"triangle-list",stripIndexFormat:void 0},depthStencil:{depthWriteEnabled:!0,depthCompare:"less",format:Tn}})}cmdRenderBillboards(e,t,r){let{cmdBuf:o,profiler:i,depthTexture:l,hdrRenderTexture:c}=e,m=o.beginRenderPass({label:n.NAME,colorAttachments:[Oe(c,Le(),r)],depthStencilAttachment:je(l,r),timestampWrites:i?.createScopeGpu(n.NAME)}),h=this.bindingsCache.getBindings(t.name,()=>this.createBindings(e,t));m.setPipeline(this.pipeline),m.setBindGroup(0,h),m.drawIndirect(t.buffers.drawnImpostorsBuffer,0),m.end()}createBindings=({device:e,globalUniforms:t,scene:r},o)=>{let i=ta.bindings,l=o.buffers;return xe(n,o.name,e,this.pipeline,[t.createBindingDesc(i.renderUniforms),o.bindInstanceTransforms(i.instancesTransforms),l.bindDrawnInstancesParams(i.wholeObjectCullData),l.bindDrawnImpostorsList(i.billboardsIdsResult),o.impostor.bind(i.impostorTexture),{binding:i.sampler,resource:r.samplerNearest}])}};var Cl=`

fn doACES_Tonemapping(x: vec3f) -> vec3f {
  let a = 2.51;
  let b = 0.03;
  let c = 2.43;
  let d = 0.59;
  let e = 0.14;
  return saturate((x*(a*x+b)) / (x*(c*x+d)+e));
}
`;var na={bindings:{renderUniforms:0,textureSrc:1}},Bl=na.bindings,Dl=()=>`

${Jn}
${Do}
${Cl}

${fe.SHADER_SNIPPET(Bl.renderUniforms)}

@group(0) @binding(${Bl.textureSrc})
var _textureSrc: texture_2d<f32>;


@vertex
fn main_vs(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {
  return getFullscreenTrianglePosition(VertexIndex);
}

fn doGamma (color: vec3f, gammaValue: f32) -> vec3f {
  return pow(color, vec3f(1.0 / gammaValue));
}

@fragment
fn main_fs(
  @builtin(position) positionPxF32: vec4<f32>
) -> @location(0) vec4<f32> {
  let fragPositionPx = vec2u(positionPxF32.xy);
  var color = textureLoad(_textureSrc, fragPositionPx, 0).rgb;
  
  let shadingMode = getShadingMode(_uniforms.flags);
  if (shadingMode == ${hr}u) {
    let gamma = _uniforms.colorMgmt.x;
    let exposure = _uniforms.colorMgmt.y;
    let ditherStr = _uniforms.colorMgmt.z;
  
    color = ditherColor(fragPositionPx, color, ditherStr);
    color = color * exposure;
    color = saturate(doACES_Tonemapping(color));
    color = doGamma(color, gamma);
  }

  return vec4(color.xyz, 1.0);
}

`;var Uo=class n{static NAME="PresentPass";renderPipeline;bindingsCache=new Me;constructor(e,t){let r=e.createShaderModule({label:be(n),code:Dl()});this.renderPipeline=e.createRenderPipeline({label:ve(n),layout:"auto",vertex:{module:r,entryPoint:"main_vs",buffers:[]},fragment:{module:r,entryPoint:"main_fs",targets:[{format:t}]},primitive:{topology:"triangle-list"}})}onViewportResize=()=>this.bindingsCache.clear();cmdDraw(e,t){let{cmdBuf:r,profiler:o,depthTexture:i}=e;Ie(t);let l=r.beginRenderPass({label:n.NAME,colorAttachments:[Oe(t,Le())],timestampWrites:o?.createScopeGpu(n.NAME)}),c=this.bindingsCache.getBindings(i.label,()=>this.createBindings(e));l.setBindGroup(0,c),l.setPipeline(this.renderPipeline),Zn(l),l.end()}createBindings=({device:e,globalUniforms:t,hdrRenderTexture:r})=>{let o=na.bindings;return xe(n,"000",e,this.renderPipeline,[t.createBindingDesc(o.renderUniforms),{binding:o.textureSrc,resource:r}])}};var Fo=class n{static NAME="RasterizeSwPass";pipeline;bindingsCache=new Me;resultBuffer=void 0;constructor(e){let t=e.createShaderModule({label:be(n),code:yl()});this.pipeline=e.createComputePipeline({label:ve(n),layout:"auto",compute:{module:t,entryPoint:"main"}})}clearFramebuffer(e){e.cmdBuf.clearBuffer(this.resultBuffer)}onViewportResize=(e,t)=>{this.bindingsCache.clear(),this.resultBuffer&&this.resultBuffer.destroy(),this.resultBuffer=e.createBuffer({label:"rasterize-sw",size:q*t.width*t.height,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.INDIRECT|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC})};cmdSoftwareRasterize(e,t){let{cmdBuf:r,profiler:o}=e,i=r.beginComputePass({label:n.NAME,timestampWrites:o?.createScopeGpu(n.NAME)}),l=this.bindingsCache.getBindings(t.name,()=>this.createBindings(e,this.resultBuffer,t));i.setPipeline(this.pipeline),i.setBindGroup(0,l),t.buffers.cmdDrawMeshletsSoftwareIndirect(i),i.end()}createBindings=({device:e,globalUniforms:t},r,o)=>{let i=vn.bindings,l=o.buffers;return xe(n,o.name,e,this.pipeline,[t.createBindingDesc(i.renderUniforms),{binding:i.resultBuffer,resource:{buffer:r}},l.bindVertexPositions(i.vertexPositions),l.bindVertexNormals(i.vertexNormals),l.bindIndexBuffer(i.indexBuffer),l.bindMeshletData(i.meshletsData),l.bindDrawnMeshletsList(i.drawnMeshletIds),l.bindDrawnMeshletsSwParams(i.drawnMeshletParams),o.bindInstanceTransforms(i.instancesTransforms)])}};var ra={bindings:{renderUniforms:0,softwareRasterizerResult:1}},Ol=ra.bindings,Nl=()=>`

${Jn}
${Et}
${Qe}
${Xt}
${Kt}

${fe.SHADER_SNIPPET(Ol.renderUniforms)}
${ea(Ol.softwareRasterizerResult,"read")}


@vertex
fn main_vs(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {
  return getFullscreenTrianglePosition(VertexIndex);
}

struct FragmentOutput {
  @builtin(frag_depth) fragDepth: f32,
  @location(0) color: vec4<f32>,
};

@fragment
fn main_fs(
  @builtin(position) positionPxF32: vec4<f32>
) -> FragmentOutput {
  var result: FragmentOutput;

  let fragPositionPx = vec2u(positionPxF32.xy);
  // var colorHw = textureLoad(_textureHDR, fragPositionPx, 0).rgb;
  // var color = vec4f(0., 0., 0., 0.,);

  // sample software rasterizer
  let viewportSize: vec2f = _uniforms.viewport.xy;
  // let yInv = viewportSize.y - positionPxF32.y;
  let swRasterizerIdx: u32 = u32(positionPxF32.y) * u32(viewportSize.x) + u32(positionPxF32.x);
  let swRasterizerResU32: u32 = _softwareRasterizerResult[swRasterizerIdx];
  // let swRasterizerRes: vec4f = unpack4x8unorm(swRasterizerResU32);

  if (swRasterizerResU32 == 0u){
    // no pixel for software rasterizer, do not override.
    // 0 is the value we cleared the buffer to, so any write with atomicMax()
    // would affect the result. And it's not possible to try to write 0
    // given what software rasterizer stores. E.g. if depth bits were
    // 0, then the point would be on near plane, which is no AS terrible to cull.
    // Oct. encoded normal would also have to be 0, and there would have to be
    // no pixels directly behind that one (cause atomicMax would used them instead).
    discard;
  }

  // color = vec4f(swRasterizerRes.rgb, 1.0);
  
  // decode depth
  let swRasterDepth: u32 = swRasterizerResU32 >> 16;
  let swRasterDepthF32: f32 = 1.0 - f32(swRasterDepth) / 65535.0;
  // Not writing depth here would REALLY screws us in next frame occlusion culling
  result.fragDepth = swRasterDepthF32; // this pass has depth test ON!
  // result.color = vec4f(swRasterDepthF32, swRasterDepthF32, swRasterDepthF32, 1.0); // dbg

  // decode normal
  let nx = f32((swRasterizerResU32 >> 8) & 0xff) / 255.0; // [0, 1]
  let ny = f32(swRasterizerResU32 & 0xff) / 255.0; // [0, 1]
  // let nUnpacked: vec3f = vec3f(vec2f(nx, ny) * 2.0 - 1.0, 0.0); // [-1 .. 1] // VERSION 0: NO OCT. ENCODED, XY ONLY
  let nUnpacked: vec3f = normalize(decodeOctahedronNormal(vec2f(nx, ny)));

  let shadingMode = getShadingMode(_uniforms.flags);
  
  if (shadingMode == ${vt}u) {
    result.color = vec4f(abs(nUnpacked.xyz), 1.0);
    // result.color = vec4f(nUnpacked.xyz, 1.0);
    // result.color = vec4f(-nUnpacked.xyz, 1.0);
   
  } else if (shadingMode == ${zt}u) {
    result.color = vec4f(0., 1., 0., 1.);

  } else {
    // material
    var material: Material;
    let positionProj = vec4(
      (positionPxF32.x / viewportSize.x) * 2.0 - 1.0, // [-1, 1]
      (positionPxF32.y / viewportSize.y) * 2.0 - 1.0, // [-1, 1]
      swRasterDepthF32,
      1.0
    );
    var positionWs = _uniforms.vpMatrixInv * positionProj;
    positionWs = positionWs / positionWs.w;
    createDefaultMaterial(&material, positionWs);
    material.normal = nUnpacked;
    material.roughness = 0.0;

    // shading
    var lights = array<Light, LIGHT_COUNT>();
    fillLightsData(&lights);
    result.color = vec4f(doShading(material, AMBIENT_LIGHT, lights), 1.0);
  }

  return result;
}

`;var Lo=class n{static NAME="RasterizeCombine";pipeline;bindingsCache=new Me;constructor(e,t){let r=e.createShaderModule({label:be(n),code:Nl()});this.pipeline=e.createRenderPipeline({label:ve(n),layout:"auto",vertex:{module:r,entryPoint:"main_vs",buffers:[]},fragment:{module:r,entryPoint:"main_fs",targets:[{format:t,blend:{color:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one",operation:"add"}}}]},primitive:{topology:"triangle-list"},depthStencil:Ze})}onViewportResize=()=>this.bindingsCache.clear();cmdCombineRasterResults(e){let{cmdBuf:t,profiler:r,hdrRenderTexture:o,rasterizerSwResult:i,depthTexture:l}=e;Ie(o);let c=t.beginRenderPass({label:n.NAME,colorAttachments:[Oe(o,Le(),"load")],depthStencilAttachment:je(l,"load"),timestampWrites:r?.createScopeGpu(n.NAME)}),m=this.bindingsCache.getBindings(l.label,()=>this.createBindings(e,i));c.setBindGroup(0,m),c.setPipeline(this.pipeline),Zn(c),c.end()}createBindings=({device:e,globalUniforms:t},r)=>{let o=ra.bindings;return xe(n,n.NAME,e,this.pipeline,[t.createBindingDesc(o.renderUniforms),{binding:o.softwareRasterizerResult,resource:{buffer:r}}])}};var Gd=(De.far-De.near)/65535*100,Ul={bindings:{renderUniforms:0}},zd=Ul.bindings,Vd=(n,e,t)=>`

${fe.SHADER_SNIPPET(zd.renderUniforms)}

const H = ${t};
const OFFSET = ${n};
const SPAN = ${e};


struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) positionWS: vec4f,
};

@vertex
fn main_vs(
  @builtin(vertex_index) in_vertex_index : u32
) -> VertexOutput {
  let offset0 = vec2f(
    f32(i32(in_vertex_index / 2u )), // [-1, -1, 0, 0]
    f32(i32(in_vertex_index & 1u)) // [-1, 1, -1, 1, ...]
  );
  
  let height = H - ${Gd};
  let offset = offset0 * SPAN + OFFSET;
  var pos = vec4<f32>(offset.x, height, offset.y, 1.);
  
  var result: VertexOutput;
  result.position = _uniforms.vpMatrix * pos;
  result.positionWS = pos;
  return result;
}

const C0: f32 = 0.15;
const C1: f32 = 0.3;
const BLUE  = vec3f(0.,   121., 255.) / 255.;
const RED   = vec3f(255., 0.,     0.) / 255.;
const GREEN = vec3f(143., 204.,  18.) / 255.;
const SATURATION = 0.6;

@fragment
fn main_fs(fragIn: VertexOutput) -> @location(0) vec4f {
  let offsetFrom0 = SPAN + OFFSET;
  let posFromStart = fragIn.positionWS.xz - offsetFrom0;

  /*
  let patternMask = fract((floor(posFromStart.y) + floor(posFromStart.x)) / 2.0);
  let col0 = vec4f(C0, C0, C0, 1.0);
  let col1 = vec4f(C1, C1, C1, 1.0);
  return select(col0, col1, patternMask > 0.0);*/
  
  let mm = fract(floor(posFromStart) / 2.0);
  var color = vec3f(0.8);
  if(mm.x > 0.0 && mm.y > 0.0) { color = BLUE; }
  if(mm.x > 0.0 && mm.y == 0.0) { color = RED; }
  if(mm.x == 0.0 && mm.y > 0.0) { color = GREEN; }
  return vec4f(color * SATURATION, 1.0);
}
`,ko=class n{constructor(e){this.outTextureFormat=e}static NAME="DrawGroundPass";pipeline;bindingsCache=new Me;getRenderPipeline(e){if(this.pipeline!==void 0)return this.pipeline;let{device:t}=e,[r,o,i]=$d(e),l=Vd(r,o,i),c=t.createShaderModule({code:l}),m=t.createRenderPipeline({label:"ground-render",layout:"auto",vertex:{module:c,entryPoint:"main_vs",buffers:[]},fragment:{module:c,entryPoint:"main_fs",targets:[{format:this.outTextureFormat,blend:{color:{srcFactor:"one-minus-dst-alpha",dstFactor:"dst-alpha",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one",operation:"add"}}}]},primitive:{cullMode:"back",topology:"triangle-strip",stripIndexFormat:void 0},depthStencil:Ze});return this.pipeline=m,m}cmdDrawGround(e,t){let{cmdBuf:r,profiler:o,depthTexture:i,hdrRenderTexture:l}=e,c=r.beginRenderPass({label:n.NAME,colorAttachments:[Oe(l,Le(),t)],depthStencilAttachment:je(i,t),timestampWrites:o?.createScopeGpu(n.NAME)}),m=this.getRenderPipeline(e),h=this.bindingsCache.getBindings(n.NAME,()=>this.createBindings(e,m));c.setPipeline(m),c.setBindGroup(0,h),c.draw(4,1,0,0),c.end()}createBindings=({device:e,globalUniforms:t},r)=>{let o=Ul.bindings;return xe(n,"",e,r,[t.createBindingDesc(o.renderUniforms)])}};function $d({scene:n}){let[e,t]=bo(),r=Bt.create();n.naniteObjects.forEach(m=>{let h=m.bounds.box;m.instances.transforms.forEach(g=>{t(mn(g,h[0],r)),t(mn(g,h[1],r))})});let o=`vec2f(${e[0][0]}, ${e[0][2]})`,i=[e[1][0]-e[0][0],e[1][2]-e[0][2]],l=`vec2f(${i[0]}, ${i[1]})`,c=`f32(${e[0][1]})`;return[o,l,c]}var Go=class{constructor(e,t,r,o){this.device=e;this.profiler=o;this.renderUniformBuffer=new fe(e),this.drawMeshPass=new uo(e,bt),this.rasterizeHwPass=new So(e,bt),this.rasterizeSwPass=new Fo(e),this.cullMeshletsPass=new Ao(e),this.cullInstancesPass=new Bo(e),this.naniteBillboardPass=new No(e,bt),this.rasterizeCombine=new Lo(e,bt),this.depthPyramidPass=new Ir(e),this.depthPyramidDebugDrawPass=new Co(e,bt),this.drawGroundPass=new ko(bt),this.presentPass=new Uo(e,r),this.dbgMeshoptimizerPass=new mo(e,bt,this.renderUniformBuffer),this.dbgMeshoptimizerMeshletsPass=new po(e,bt,this.renderUniformBuffer),this.cameraCtrl=new fo,this.projectionMat=Ui(t),this.handleViewportResize(t)}renderUniformBuffer;cameraCtrl;cameraFrustum=new Io;projectionMat;_viewMatrix=_e.identity();viewportSize={width:0,height:0};frameIdx=0;depthTexture=void 0;depthTextureView=void 0;hdrRenderTexture=void 0;hdrRenderTextureView=void 0;drawMeshPass;rasterizeHwPass;rasterizeSwPass;cullMeshletsPass;cullInstancesPass;naniteBillboardPass;rasterizeCombine;drawGroundPass;presentPass;depthPyramidPass;depthPyramidDebugDrawPass;dbgMeshoptimizerPass;dbgMeshoptimizerMeshletsPass;updateCamera(e,t){this.cameraCtrl.update(e,t)}cmdRender(e,t,r){Ie(r);let o=this.cameraCtrl.viewMatrix,i=ls(o,this.projectionMat,this._viewMatrix);this.cameraFrustum.update(i);let[l,c]=this.depthPyramidPass.verifyResultTexture(this.device,this.depthTexture,this.depthTextureView),m={frameIdx:this.frameIdx,cmdBuf:e,viewport:this.viewportSize,scene:t,hdrRenderTexture:this.hdrRenderTextureView,rasterizerSwResult:this.rasterizeSwPass.resultBuffer,softwareRasterizerEnabled:jr(),device:this.device,profiler:this.profiler,viewMatrix:o,vpMatrix:i,projMatrix:this.projectionMat,cameraFrustum:this.cameraFrustum,cameraPositionWorldSpace:this.cameraCtrl.positionWorldSpace,depthTexture:this.depthTextureView,prevFrameDepthPyramidTexture:c,globalUniforms:this.renderUniformBuffer,depthPyramidSampler:this.depthPyramidPass.depthSampler};this.renderUniformBuffer.update(m),P.displayMode==="dbg-lod"?this.dbgMeshoptimizerPass.draw(m):P.displayMode==="dbg-lod-meshlets"||P.displayMode==="dbg-nanite-meshlets"?this.dbgMeshoptimizerMeshletsPass.draw(m):P.nanite.render.naniteDevice==="gpu"?this.cmdDrawNanite_GPU(m):this.cmdDrawNanite_CPU(m),this.presentPass.cmdDraw(m,r),this.frameIdx+=1}cmdDrawNanite_CPU(e){let{naniteObjects:t}=e.scene;this.drawMeshPass.initFrameStats();for(let r=0;r<t.length;r++){let o=t[r],i=r==0?"clear":"load";this.drawMeshPass.draw(e,o,i)}P.drawGround&&this.drawGroundPass.cmdDrawGround(e,"load"),this.drawMeshPass.uploadFrameStats(e)}cmdDrawNanite_GPU(e){let{naniteObjects:t}=e.scene,r=e.softwareRasterizerEnabled;r&&this.rasterizeSwPass.clearFramebuffer(e);for(let i=0;i<t.length;i++){let l=t[i],c=i==0?"clear":"load";P.nanite.render.freezeGPU_Visibilty||(P.cullingInstances.enabled&&this.cullInstancesPass.cmdCullInstances(e,l),this.cullMeshletsPass.cmdCullMeshlets(e,l)),this.rasterizeHwPass.cmdHardwareRasterize(e,l,c),r&&this.rasterizeSwPass.cmdSoftwareRasterize(e,l),P.cullingInstances.enabled&&this.naniteBillboardPass.cmdRenderBillboards(e,l,"load")}r&&this.rasterizeCombine.cmdCombineRasterResults(e),P.drawGround&&this.drawGroundPass.cmdDrawGround(e,"load");let o=this.depthPyramidPass.cmdCreateDepthPyramid(e,this.depthTexture,this.depthTextureView);P.nanite.render.hasValidDepthPyramid=o,P.displayMode==="dbg-depth-pyramid"&&this.depthPyramidDebugDrawPass.cmdDraw(e)}handleViewportResize=e=>{console.log("Viewport resize",e),P.nanite.render.hasValidDepthPyramid=!1,this.viewportSize.width=e.width,this.viewportSize.height=e.height,this.projectionMat=Ui(e),this.depthTexture&&this.depthTexture.destroy(),this.hdrRenderTexture&&this.hdrRenderTexture.destroy();let t=`${e.width}x${e.height}`;this.hdrRenderTexture=this.device.createTexture({label:`hdr-texture-${t}`,size:[e.width,e.height],format:bt,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),this.hdrRenderTextureView=this.hdrRenderTexture.createView(),this.depthTexture=this.device.createTexture({label:`depth-texture-${t}`,size:[e.width,e.height],format:Tn,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),this.depthTextureView=this.depthTexture.createView(),this.depthPyramidDebugDrawPass.onViewportResize(),this.cullMeshletsPass.onViewportResize(),this.cullInstancesPass.onViewportResize(),this.rasterizeSwPass.onViewportResize(this.device,e),this.depthPyramidPass.verifyResultTexture(this.device,this.depthTexture,this.depthTextureView,!0),this.rasterizeCombine.onViewportResize(),this.presentPass.onViewportResize()};onCanvasResize=ds(this.handleViewportResize,500)};function Fl(n,e){let t=m();n.width=t.width,n.height=t.height,console.log("Init canvas size:",t);let r=[];return{revalidateCanvasSize:l,addListener:h=>r.push(h),getViewportSize:m,getScreenTextureView:()=>e.getCurrentTexture().createView()};function l(){let h=m();(h.width!==n.width||h.height!==n.height)&&h.width&&h.height&&c(h)}function c(h){n.width=h.width,n.height=h.height,r.forEach(g=>g(h))}function m(){let h=window.devicePixelRatio||1;return{width:n.clientWidth*h,height:n.clientHeight*h}}}function Ll(n){let e=["internal","out-of-memory","validation"],t=e.toReversed(),r="-";return{startErrorScope:o,reportErrorScopeAsync:i};function o(l="-"){r=l,e.forEach(c=>n.pushErrorScope(c))}async function i(l){let c;for(let m of t){let h=await n.popErrorScope();if(h){let g=`WebGPU error [${r}][${m}]: ${h.message}`;c=g,l?l(g):console.error(g)}}return c}}var kl=!1,Hd=!0,oa=(n,e,t)=>`${n._meshopt_buildMeshlets==null?"metis":"meshoptimizer"}@0x${t.toString(16)}: ${e.byteLength} bytes (${Wr(e)}: ${e.length} items)`,pe=(n,e="in")=>({arr:n,inout:e});function jd(n,e,t){let r="_create_buffer"in n?"_create_buffer":"_malloc",o=n[r](t.length*t.BYTES_PER_ELEMENT);return n[e].set(t,o/t.BYTES_PER_ELEMENT),kl&&console.log(`Alloc ${oa(n,t,o)}`),o}function Gl(n){if(n instanceof Float32Array)return"HEAPF32";if(n instanceof Uint32Array)return"HEAPU32";if(n instanceof Int32Array)return"HEAP32";if(n instanceof Uint8Array)return"HEAPU8"}function Wd(n,e,t){if(typeof t=="number"||typeof t=="string"||t===null)return t;let r=Gl(t.arr);if(r)return jd(n,r,t.arr);let o=JSON.stringify(t);throw new Error(`Wasm function '${e}' received invalid argument: ${o}`)}var zl=(n,e,t,r)=>{let o=r.map(c=>Wd(n,t,c)),i=r.map(c=>typeof c=="string"?"string":"number"),l;return"ccall"in n?l=n.ccall(t,e,i,o):l=n[`_${t}`](...o),r.forEach((c,m)=>{let h=o[m];if(typeof c=="number"||typeof c=="string"||typeof h=="string"||c===null)return;let g=Gl(c.arr),_=h/c.arr.BYTES_PER_ELEMENT;if(c.inout==="out"){let x=c.arr.length;c.arr.set(n[g].subarray(_,_+x))}kl&&console.log(`[${t}] Will free  ${oa(n,c.arr,h)}`),n._free!==void 0?n._free(h):Hd||console.error(`Memory leak [${t}]: ${oa(n,c.arr,h)}`,{module:n,fnName:t})}),l},Pt=(n,e,t,r)=>zl(n,e,t,r),Vl=(n,e,t,r)=>zl(n,e,t,r);var $l={};var Yd=(()=>{var n=$l.url;return function(e={}){var t,r=e,o,i,l=new Promise((a,u)=>{o=a,i=u});["_malloc","_free","_meshopt_buildMeshletsBound","_meshopt_buildMeshlets","_meshopt_buildMeshletsScan","_meshopt_simplify","_meshopt_generateVertexRemap","_meshopt_remapIndexBuffer","_meshopt_remapVertexBuffer","_meshopt_simplifyScale","_meshopt_computeMeshletBounds","_memory","___indirect_function_table","onRuntimeInitialized"].forEach(a=>{Object.getOwnPropertyDescriptor(l,a)||Object.defineProperty(l,a,{get:()=>Te("You are getting "+a+" on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js"),set:()=>Te("You are setting "+a+" on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js")})});var c=!0,m=!1,h=!1,g=!1;if(r.ENVIRONMENT)throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");var _=Object.assign({},r),x=[],T="./this.program",S=(a,u)=>{throw u},w="";function E(a){return r.locateFile?r.locateFile(a,w):w+a}var R,C,N;if(g){if(typeof process=="object"&&typeof Ta=="function"||typeof window=="object"||typeof importScripts=="function")throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)")}else if(c||m){if(m?w=self.location.href:typeof document<"u"&&document.currentScript&&(w=document.currentScript.src),n&&(w=n),w.startsWith("blob:")?w="":w=w.substr(0,w.replace(/[?#].*/,"").lastIndexOf("/")+1),!(typeof window=="object"||typeof importScripts=="function"))throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");R=a=>{var u=new XMLHttpRequest;return u.open("GET",a,!1),u.send(null),u.responseText},m&&(N=a=>{var u=new XMLHttpRequest;return u.open("GET",a,!1),u.responseType="arraybuffer",u.send(null),new Uint8Array(u.response)}),C=(a,u,d)=>{B(!wn(a),"readAsync does not work with file:// URLs"),fetch(a,{credentials:"same-origin"}).then(p=>p.ok?p.arrayBuffer():Promise.reject(new Error(p.status+" : "+p.url))).then(u,d)}}else throw new Error("environment detection error");var L=r.print||console.log.bind(console),D=r.printErr||console.error.bind(console);Object.assign(r,_),_=null,yi(),r.arguments&&(x=r.arguments),ue("arguments","arguments_"),r.thisProgram&&(T=r.thisProgram),ue("thisProgram","thisProgram"),r.quit&&(S=r.quit),ue("quit","quit_"),B(typeof r.memoryInitializerPrefixURL>"u","Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead"),B(typeof r.pthreadMainPrefixURL>"u","Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead"),B(typeof r.cdInitializerPrefixURL>"u","Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead"),B(typeof r.filePackagePrefixURL>"u","Module.filePackagePrefixURL option was removed, use Module.locateFile instead"),B(typeof r.read>"u","Module.read option was removed (modify read_ in JS)"),B(typeof r.readAsync>"u","Module.readAsync option was removed (modify readAsync in JS)"),B(typeof r.readBinary>"u","Module.readBinary option was removed (modify readBinary in JS)"),B(typeof r.setWindowTitle>"u","Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)"),B(typeof r.TOTAL_MEMORY>"u","Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY"),ue("asm","wasmExports"),ue("read","read_"),ue("readAsync","readAsync"),ue("readBinary","readBinary"),ue("setWindowTitle","setWindowTitle"),B(!m,"worker environment detected but not enabled at build time.  Add `worker` to `-sENVIRONMENT` to enable."),B(!h,"node environment detected but not enabled at build time.  Add `node` to `-sENVIRONMENT` to enable."),B(!g,"shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");var H;r.wasmBinary&&(H=r.wasmBinary),ue("wasmBinary","wasmBinary"),typeof WebAssembly!="object"&&D("no native wasm support detected");var J,re=!1,oe;function B(a,u){a||Te("Assertion failed"+(u?": "+u:""))}var ee,X,he,de,ie,j,ye,Re;function st(){var a=J.buffer;r.HEAP8=ee=new Int8Array(a),r.HEAP16=he=new Int16Array(a),r.HEAPU8=X=new Uint8Array(a),r.HEAPU16=de=new Uint16Array(a),r.HEAP32=ie=new Int32Array(a),r.HEAPU32=j=new Uint32Array(a),r.HEAPF32=ye=new Float32Array(a),r.HEAPF64=Re=new Float64Array(a)}B(!r.STACK_SIZE,"STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time"),B(typeof Int32Array<"u"&&typeof Float64Array<"u"&&Int32Array.prototype.subarray!=null&&Int32Array.prototype.set!=null,"JS engine does not provide full typed array support"),B(!r.wasmMemory,"Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally"),B(!r.INITIAL_MEMORY,"Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");function te(){var a=cr();B((a&3)==0),a==0&&(a+=4),j[a>>2]=34821223,j[a+4>>2]=2310721022,j[0]=1668509029}function we(){if(!re){var a=cr();a==0&&(a+=4);var u=j[a>>2],d=j[a+4>>2];(u!=34821223||d!=2310721022)&&Te(`Stack overflow! Stack cookie has been overwritten at ${Gt(a)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${Gt(d)} ${Gt(u)}`),j[0]!=1668509029&&Te("Runtime error: The application has corrupted its heap memory area (address zero)!")}}(function(){var a=new Int16Array(1),u=new Int8Array(a.buffer);if(a[0]=25459,u[0]!==115||u[1]!==99)throw"Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)"})();var et=[],qe=[],He=[],Tt=!1;function Qt(){if(r.preRun)for(typeof r.preRun=="function"&&(r.preRun=[r.preRun]);r.preRun.length;)nn(r.preRun.shift());Ke(et)}function en(){B(!Tt),Tt=!0,we(),Ke(qe)}function tn(){if(we(),r.postRun)for(typeof r.postRun=="function"&&(r.postRun=[r.postRun]);r.postRun.length;)Zo(r.postRun.shift());Ke(He)}function nn(a){et.unshift(a)}function Be(a){qe.unshift(a)}function Zo(a){He.unshift(a)}B(Math.imul,"This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"),B(Math.fround,"This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"),B(Math.clz32,"This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"),B(Math.trunc,"This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");var At=0,It=null,rn=null,on={};function Qo(a){At++,r.monitorRunDependencies?.(At),a?(B(!on[a]),on[a]=1,It===null&&typeof setInterval<"u"&&(It=setInterval(()=>{if(re){clearInterval(It),It=null;return}var u=!1;for(var d in on)u||(u=!0,D("still waiting on run dependencies:")),D(`dependency: ${d}`);u&&D("(end of list)")},1e4))):D("warning: run dependency added without ID")}function ei(a){if(At--,r.monitorRunDependencies?.(At),a?(B(on[a]),delete on[a]):D("warning: run dependency removed without ID"),At==0&&(It!==null&&(clearInterval(It),It=null),rn)){var u=rn;rn=null,u()}}function Te(a){r.onAbort?.(a),a="Aborted("+a+")",D(a),re=!0,oe=1;var u=new WebAssembly.RuntimeError(a);throw i(u),u}var We={error(){Te("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM")},init(){We.error()},createDataFile(){We.error()},createPreloadedFile(){We.error()},createLazyFile(){We.error()},open(){We.error()},mkdev(){We.error()},registerDevice(){We.error()},analyzePath(){We.error()},ErrnoError(){We.error()}};r.FS_createDataFile=We.createDataFile,r.FS_createPreloadedFile=We.createPreloadedFile;var an="data:application/octet-stream;base64,",ti=a=>a.startsWith(an),wn=a=>a.startsWith("file://");function Ne(a,u){return(...d)=>{B(Tt,`native function \`${a}\` called before runtime initialization`);var p=Ye[a];return B(p,`exported native function \`${a}\` not found`),B(d.length<=u,`native function \`${a}\` called with ${d.length} args but expects ${u}`),p(...d)}}function Rt(){if(r.locateFile){var a="meshoptimizer.wasm";return ti(a)?a:E(a)}return new URL("meshoptimizer.wasm",$l.url).href}var kt;function rr(a){if(a==kt&&H)return new Uint8Array(H);if(N)return N(a);throw"both async and sync fetching of the wasm failed"}function Xe(a){return H?Promise.resolve().then(()=>rr(a)):new Promise((u,d)=>{C(a,p=>u(new Uint8Array(p)),p=>{try{u(rr(a))}catch(b){d(b)}})})}function or(a,u,d){return Xe(a).then(p=>WebAssembly.instantiate(p,u)).then(d,p=>{D(`failed to asynchronously prepare wasm: ${p}`),wn(kt)&&D(`warning: Loading from a file URI (${kt}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`),Te(p)})}function ni(a,u,d,p){return!a&&typeof WebAssembly.instantiateStreaming=="function"&&!ti(u)&&typeof fetch=="function"?fetch(u,{credentials:"same-origin"}).then(b=>{var v=WebAssembly.instantiateStreaming(b,d);return v.then(p,function(y){return D(`wasm streaming compile failed: ${y}`),D("falling back to ArrayBuffer instantiation"),or(u,d,p)})}):or(u,d,p)}function ri(){return{env:sr,wasi_snapshot_preview1:sr}}function W(){var a=ri();function u(b,v){return Ye=b.exports,J=Ye.memory,B(J,"memory not found in wasm exports"),st(),Be(Ye.__wasm_call_ctors),ei("wasm-instantiate"),Ye}Qo("wasm-instantiate");var d=r;function p(b){B(r===d,"the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?"),d=null,u(b.instance)}if(r.instantiateWasm)try{return r.instantiateWasm(a,u)}catch(b){D(`Module.instantiateWasm callback failed with error: ${b}`),i(b)}return kt||(kt=Rt()),ni(H,kt,a,p).catch(i),{}}function ue(a,u,d=!0){Object.getOwnPropertyDescriptor(r,a)||Object.defineProperty(r,a,{configurable:!0,get(){let p=d?" (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)":"";Te(`\`Module.${a}\` has been replaced by \`${u}\``+p)}})}function oi(a){Object.getOwnPropertyDescriptor(r,a)&&Te(`\`Module.${a}\` was supplied but \`${a}\` not included in INCOMING_MODULE_JS_API`)}function En(a){return a==="FS_createPath"||a==="FS_createDataFile"||a==="FS_createPreloadedFile"||a==="FS_unlink"||a==="addRunDependency"||a==="FS_createLazyFile"||a==="FS_createDevice"||a==="removeRunDependency"}function Or(a,u){typeof globalThis<"u"&&Object.defineProperty(globalThis,a,{configurable:!0,get(){Ge(`\`${a}\` is not longer defined by emscripten. ${u}`)}})}Or("buffer","Please use HEAP8.buffer or wasmMemory.buffer"),Or("asm","Please use wasmExports instead");function ii(a){typeof globalThis<"u"&&!Object.getOwnPropertyDescriptor(globalThis,a)&&Object.defineProperty(globalThis,a,{configurable:!0,get(){var u=`\`${a}\` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line`,d=a;d.startsWith("_")||(d="$"+a),u+=` (e.g. -sDEFAULT_LIBRARY_FUNCS_TO_INCLUDE='${d}')`,En(a)&&(u+=". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"),Ge(u)}}),sn(a)}function sn(a){Object.getOwnPropertyDescriptor(r,a)||Object.defineProperty(r,a,{configurable:!0,get(){var u=`'${a}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;En(a)&&(u+=". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you"),Te(u)}})}var Ke=a=>{for(;a.length>0;)a.shift()(r)},ba=r.noExitRuntime||!0,Gt=a=>(B(typeof a=="number"),a>>>=0,"0x"+a.toString(16).padStart(8,"0")),Z=a=>Fr(a),ai=()=>kr(),Ge=a=>{Ge.shown||={},Ge.shown[a]||(Ge.shown[a]=1,D(a))},Mn=typeof TextDecoder<"u"?new TextDecoder("utf8"):void 0,lt=(a,u,d)=>{for(var p=u+d,b=u;a[b]&&!(b>=p);)++b;if(b-u>16&&a.buffer&&Mn)return Mn.decode(a.subarray(u,b));for(var v="";u<b;){var y=a[u++];if(!(y&128)){v+=String.fromCharCode(y);continue}var A=a[u++]&63;if((y&224)==192){v+=String.fromCharCode((y&31)<<6|A);continue}var O=a[u++]&63;if((y&240)==224?y=(y&15)<<12|A<<6|O:((y&248)!=240&&Ge("Invalid UTF-8 leading byte "+Gt(y)+" encountered when deserializing a UTF-8 string in wasm memory to a JS string!"),y=(y&7)<<18|A<<12|O<<6|a[u++]&63),y<65536)v+=String.fromCharCode(y);else{var F=y-65536;v+=String.fromCharCode(55296|F>>10,56320|F&1023)}}return v},ln=(a,u)=>(B(typeof a=="number",`UTF8ToString expects a number (got ${typeof a})`),a?lt(X,a,u):""),z=(a,u,d,p)=>{Te(`Assertion failed: ${ln(a)}, at: `+[u?ln(u):"unknown filename",d,p?ln(p):"unknown function"])},si=()=>{Te("native code called abort()")},f=(a,u,d)=>X.copyWithin(a,u,u+d),Ae=()=>2147483648,li=a=>{var u=J.buffer,d=(a-u.byteLength+65535)/65536;try{return J.grow(d),st(),1}catch(p){D(`growMemory: Attempted to grow heap from ${u.byteLength} bytes to ${a} bytes, but got error: ${p}`)}},ui=a=>{var u=X.length;a>>>=0,B(a>u);var d=Ae();if(a>d)return D(`Cannot enlarge memory, requested ${a} bytes, but the limit is ${d} bytes!`),!1;for(var p=(O,F)=>O+(F-O%F)%F,b=1;b<=4;b*=2){var v=u*(1+.2/b);v=Math.min(v,a+100663296);var y=Math.min(d,p(Math.max(a,v),65536)),A=li(y);if(A)return!0}return D(`Failed to grow the heap from ${u} bytes to ${y} bytes, not enough memory!`),!1},ci=a=>{Te("fd_close called without SYSCALLS_REQUIRE_FILESYSTEM")},fi=(a,u)=>(B(a==a>>>0||a==(a|0)),B(u===(u|0)),u+2097152>>>0<4194305-!!a?(a>>>0)+u*4294967296:NaN);function di(a,u,d,p,b){var v=fi(u,d);return 70}var ir=[null,[],[]],ar=(a,u)=>{var d=ir[a];B(d),u===0||u===10?((a===1?L:D)(lt(d,0)),d.length=0):d.push(u)},va=()=>{nt(0),ir[1].length&&ar(1,10),ir[2].length&&ar(2,10)},mi=(a,u,d,p)=>{for(var b=0,v=0;v<d;v++){var y=j[u>>2],A=j[u+4>>2];u+=8;for(var O=0;O<A;O++)ar(a,X[y+O]);b+=A}return j[p>>2]=b,0},pi=a=>{var u=r["_"+a];return B(u,"Cannot call unknown function "+a+", make sure it is exported"),u},hi=(a,u)=>{B(a.length>=0,"writeArrayToMemory array must have a length (should be an array or typed array)"),ee.set(a,u)},_i=a=>{for(var u=0,d=0;d<a.length;++d){var p=a.charCodeAt(d);p<=127?u++:p<=2047?u+=2:p>=55296&&p<=57343?(u+=4,++d):u+=3}return u},gi=(a,u,d,p)=>{if(B(typeof a=="string",`stringToUTF8Array expects a string (got ${typeof a})`),!(p>0))return 0;for(var b=d,v=d+p-1,y=0;y<a.length;++y){var A=a.charCodeAt(y);if(A>=55296&&A<=57343){var O=a.charCodeAt(++y);A=65536+((A&1023)<<10)|O&1023}if(A<=127){if(d>=v)break;u[d++]=A}else if(A<=2047){if(d+1>=v)break;u[d++]=192|A>>6,u[d++]=128|A&63}else if(A<=65535){if(d+2>=v)break;u[d++]=224|A>>12,u[d++]=128|A>>6&63,u[d++]=128|A&63}else{if(d+3>=v)break;A>1114111&&Ge("Invalid Unicode code point "+Gt(A)+" encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF)."),u[d++]=240|A>>18,u[d++]=128|A>>12&63,u[d++]=128|A>>6&63,u[d++]=128|A&63}}return u[d]=0,d-b},bi=(a,u,d)=>(B(typeof d=="number","stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"),gi(a,X,u,d)),Nr=a=>Lr(a),vi=a=>{var u=_i(a)+1,d=Nr(u);return bi(a,d,u),d},Ur=(a,u,d,p,b)=>{var v={string:K=>{var Ue=0;return K!=null&&K!==0&&(Ue=vi(K)),Ue},array:K=>{var Ue=Nr(K.length);return hi(K,Ue),Ue}};function y(K){return u==="string"?ln(K):u==="boolean"?!!K:K}var A=pi(a),O=[],F=0;if(B(u!=="array",'Return type should not be "array".'),p)for(var V=0;V<p.length;V++){var G=v[d[V]];G?(F===0&&(F=ai()),O[V]=G(p[V])):O[V]=p[V]}var U=A(...O);function k(K){return F!==0&&Z(F),y(K)}return U=k(U),U},xi=(a,u,d,p)=>(...b)=>Ur(a,u,d,b,p);function yi(){oi("fetchSettings")}var sr={__assert_fail:z,_abort_js:si,_emscripten_memcpy_js:f,emscripten_resize_heap:ui,fd_close:ci,fd_seek:di,fd_write:mi},Ye=W(),xa=Ne("__wasm_call_ctors",0),wi=r._meshopt_buildMeshletsBound=Ne("meshopt_buildMeshletsBound",3),lr=r._meshopt_buildMeshlets=Ne("meshopt_buildMeshlets",11),ur=r._meshopt_buildMeshletsScan=Ne("meshopt_buildMeshletsScan",8),ya=r._meshopt_computeMeshletBounds=Ne("meshopt_computeMeshletBounds",7),Eu=r._meshopt_simplify=Ne("meshopt_simplify",10),wa=r._meshopt_simplifyScale=Ne("meshopt_simplifyScale",3),Ea=r._meshopt_generateVertexRemap=Ne("meshopt_generateVertexRemap",6),Ma=r._meshopt_remapVertexBuffer=Ne("meshopt_remapVertexBuffer",5),Ei=r._meshopt_remapIndexBuffer=Ne("meshopt_remapIndexBuffer",4),nt=Ne("fflush",1),rt=r._malloc=Ne("malloc",1),ot=r._free=Ne("free",1),Sn=()=>(Sn=Ye.emscripten_stack_init)(),Mi=()=>(Mi=Ye.emscripten_stack_get_free)(),Si=()=>(Si=Ye.emscripten_stack_get_base)(),cr=()=>(cr=Ye.emscripten_stack_get_end)(),Fr=a=>(Fr=Ye._emscripten_stack_restore)(a),Lr=a=>(Lr=Ye._emscripten_stack_alloc)(a),kr=()=>(kr=Ye.emscripten_stack_get_current)(),Sa=r.dynCall_jiji=Ne("dynCall_jiji",5);r.ccall=Ur,r.cwrap=xi;var Pi=["writeI53ToI64","writeI53ToI64Clamped","writeI53ToI64Signaling","writeI53ToU64Clamped","writeI53ToU64Signaling","readI53FromI64","readI53FromU64","convertI32PairToI53","convertU32PairToI53","getTempRet0","setTempRet0","zeroMemory","exitJS","isLeapYear","ydayFromDate","arraySum","addDays","inetPton4","inetNtop4","inetPton6","inetNtop6","readSockaddr","writeSockaddr","initRandomFill","randomFill","emscriptenLog","readEmAsmArgs","jstoi_q","getExecutableName","listenOnce","autoResumeAudioContext","dynCallLegacy","getDynCaller","dynCall","handleException","keepRuntimeAlive","runtimeKeepalivePush","runtimeKeepalivePop","callUserCallback","maybeExit","asmjsMangle","asyncLoad","alignMemory","mmapAlloc","HandleAllocator","getNativeTypeSize","STACK_SIZE","STACK_ALIGN","POINTER_SIZE","ASSERTIONS","uleb128Encode","sigToWasmTypes","generateFuncType","convertJsFunctionToWasm","getEmptyTableSlot","updateTableMap","getFunctionAddress","addFunction","removeFunction","reallyNegative","unSign","strLen","reSign","formatString","intArrayFromString","intArrayToString","AsciiToString","stringToAscii","UTF16ToString","stringToUTF16","lengthBytesUTF16","UTF32ToString","stringToUTF32","lengthBytesUTF32","stringToNewUTF8","registerKeyEventCallback","maybeCStringToJsString","findEventTarget","getBoundingClientRect","fillMouseEventData","registerMouseEventCallback","registerWheelEventCallback","registerUiEventCallback","registerFocusEventCallback","fillDeviceOrientationEventData","registerDeviceOrientationEventCallback","fillDeviceMotionEventData","registerDeviceMotionEventCallback","screenOrientation","fillOrientationChangeEventData","registerOrientationChangeEventCallback","fillFullscreenChangeEventData","registerFullscreenChangeEventCallback","JSEvents_requestFullscreen","JSEvents_resizeCanvasForFullscreen","registerRestoreOldStyle","hideEverythingExceptGivenElement","restoreHiddenElements","setLetterbox","softFullscreenResizeWebGLRenderTarget","doRequestFullscreen","fillPointerlockChangeEventData","registerPointerlockChangeEventCallback","registerPointerlockErrorEventCallback","requestPointerLock","fillVisibilityChangeEventData","registerVisibilityChangeEventCallback","registerTouchEventCallback","fillGamepadEventData","registerGamepadEventCallback","registerBeforeUnloadEventCallback","fillBatteryEventData","battery","registerBatteryEventCallback","setCanvasElementSize","getCanvasElementSize","jsStackTrace","getCallstack","convertPCtoSourceLocation","getEnvStrings","checkWasiClock","wasiRightsToMuslOFlags","wasiOFlagsToMuslOFlags","createDyncallWrapper","safeSetTimeout","setImmediateWrapped","clearImmediateWrapped","polyfillSetImmediate","getPromise","makePromise","idsToPromises","makePromiseCallback","ExceptionInfo","findMatchingCatch","Browser_asyncPrepareDataCounter","setMainLoop","getSocketFromFD","getSocketAddress","FS_createPreloadedFile","FS_modeStringToFlags","FS_getMode","FS_stdin_getChar","FS_unlink","FS_createDataFile","FS_mkdirTree","_setNetworkCallback","heapObjectForWebGLType","toTypedArrayIndex","webgl_enable_ANGLE_instanced_arrays","webgl_enable_OES_vertex_array_object","webgl_enable_WEBGL_draw_buffers","webgl_enable_WEBGL_multi_draw","emscriptenWebGLGet","computeUnpackAlignedImageSize","colorChannelsInGlTextureFormat","emscriptenWebGLGetTexPixelData","emscriptenWebGLGetUniform","webglGetUniformLocation","webglPrepareUniformLocationsBeforeFirstUse","webglGetLeftBracePos","emscriptenWebGLGetVertexAttrib","__glGetActiveAttribOrUniform","writeGLArray","registerWebGlEventCallback","runAndAbortIfError","ALLOC_NORMAL","ALLOC_STACK","allocate","writeStringToMemory","writeAsciiToMemory","setErrNo","demangle","stackTrace"];Pi.forEach(ii);var Ti=["run","addOnPreRun","addOnInit","addOnPreMain","addOnExit","addOnPostRun","addRunDependency","removeRunDependency","out","err","callMain","abort","wasmMemory","wasmExports","writeStackCookie","checkStackCookie","convertI32PairToI53Checked","stackSave","stackRestore","stackAlloc","ptrToString","getHeapMax","growMemory","ENV","MONTH_DAYS_REGULAR","MONTH_DAYS_LEAP","MONTH_DAYS_REGULAR_CUMULATIVE","MONTH_DAYS_LEAP_CUMULATIVE","ERRNO_CODES","ERRNO_MESSAGES","DNS","Protocols","Sockets","timers","warnOnce","readEmAsmArgsArray","jstoi_s","wasmTable","noExitRuntime","getCFunc","freeTableIndexes","functionsInTableMap","setValue","getValue","PATH","PATH_FS","UTF8Decoder","UTF8ArrayToString","UTF8ToString","stringToUTF8Array","stringToUTF8","lengthBytesUTF8","UTF16Decoder","stringToUTF8OnStack","writeArrayToMemory","JSEvents","specialHTMLTargets","findCanvasEventTarget","currentFullscreenStrategy","restoreOldWindowedStyle","UNWIND_CACHE","ExitStatus","flush_NO_FILESYSTEM","promiseMap","uncaughtExceptionCount","exceptionLast","exceptionCaught","Browser","getPreloadedImageData__data","wget","SYSCALLS","preloadPlugins","FS_stdin_getChar_buffer","FS_createPath","FS_createDevice","FS_readFile","FS","FS_createLazyFile","MEMFS","TTY","PIPEFS","SOCKFS","tempFixedLengthArray","miniTempWebGLFloatBuffers","miniTempWebGLIntBuffers","GL","AL","GLUT","EGL","GLEW","IDBStore","SDL","SDL_gfx","allocateUTF8","allocateUTF8OnStack","print","printErr"];Ti.forEach(sn);var Ct;rn=function a(){Ct||s(),Ct||(rn=a)};function Gr(){Sn(),te()}function s(){if(At>0||(Gr(),Qt(),At>0))return;function a(){Ct||(Ct=!0,r.calledRun=!0,!re&&(en(),o(r),r.onRuntimeInitialized&&r.onRuntimeInitialized(),B(!r._main,'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'),tn()))}r.setStatus?(r.setStatus("Running..."),setTimeout(function(){setTimeout(function(){r.setStatus("")},1),a()},1)):a(),we()}if(r.preInit)for(typeof r.preInit=="function"&&(r.preInit=[r.preInit]);r.preInit.length>0;)r.preInit.pop()();s(),t=l;for(let a of Object.keys(r))a in e||Object.defineProperty(e,a,{configurable:!0,get(){Te(`Access to module property ('${a}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`)}});return t}})(),Hl=Yd;var qd={value:void 0},ia;async function er(){if(ia!==void 0)return ia;let e=await Hl({locateFile:t=>qd.value||t});return ia=e,e}var Xd=3*Pe+Pe+3*Pe+3*Pe+Pe+3+1,aa=4;async function zo(n,e,t){let r=await er(),o=e.length;t.maxVertices=t.maxVertices||64,t.maxTriangles=t.maxTriangles||124,t.coneWeight=t.coneWeight===void 0?0:t.coneWeight,t.rewriteIndicesToReferenceOriginalVertexBuffer=t.rewriteIndicesToReferenceOriginalVertexBuffer!==!1;let i=Jd(r,o,t),[l,c,m,h]=Kd(r,n.positions,n.vertexCount,n.positionsStride,e,o,t,i),g=[];for(let w=0;w<l;w+=1){let E=w*aa,R={vertexOffset:c[E+0],triangleOffset:c[E+1],vertexCount:c[E+2],triangleCount:c[E+3]};g.push(R)}let _=g.at(-1),x=_.vertexOffset+_.vertexCount,T=_.triangleOffset+(_.triangleCount*3+3&-4),S=new Uint32Array(T);for(let w=0;w<T;w++)S[w]=h[w];if(t.rewriteIndicesToReferenceOriginalVertexBuffer){let w=Zd(g,m,S);S=_r(Uint32Array,w)}else console.warn("'rewriteIndicesToReferenceOriginalVertexBuffer' is OFF. You are stupid. I will not crash the app. I will enjoy watching you fail.");return{meshlets:g,meshletVertices:m.slice(0,x),meshletTriangles:S}}function Kd(n,e,t,r,o,i,l,c){let m=new Uint32Array(c*aa),h=new Uint32Array(c*l.maxVertices),g=new Uint8Array(c*l.maxTriangles*3);return[Pt(n,"number","meshopt_buildMeshlets",[pe(m,"out"),pe(h,"out"),pe(g,"out"),pe(o),i,pe(e),t,r,l.maxVertices,l.maxTriangles,l.coneWeight]),m,h,g]}function Jd(n,e,t){return Pt(n,"number","meshopt_buildMeshletsBound",[e,t.maxVertices,t.maxTriangles])}function Zd(n,e,t){let r=[];for(let o=0;o<n.length;o++){let i=n[o];for(let l=0;l<i.triangleCount*le;l++){let c=i.triangleOffset+l,m=t[c],h=e[i.vertexOffset+m];r.push(h)}}return r}function jl(n){let e=0;return n.meshlets.map(t=>{let r=t.triangleCount*le,o=e,i=n.meshletTriangles.slice(o,o+r);return e+=r,i})}var Qd=1,Wl=n=>Math.floor(n/3)*3,Yl=(n,e)=>Wl(n/e);async function Vo(n,e,t){let r=await er(),o=e.length;t.targetIndexCount=Wl(t.targetIndexCount),t.targetError=t.targetError||.01,t.lockBorders=t.lockBorders!=!1;let[i,l,c]=em(r,n.verticesAndAttributes,n.vertexCount,n.verticesAndAttributesStride,e,o,t),m=tm(r,n.verticesAndAttributes,n.vertexCount,n.verticesAndAttributesStride);return{error:i,errorScale:m,indexBuffer:c.slice(0,l)}}function em(n,e,t,r,o,i,l){let c=new Uint32Array(i),m=new Float32Array(1),h=l.lockBorders?Qd:0,g=Pt(n,"number","meshopt_simplify",[pe(c,"out"),pe(o),i,pe(e),t,r,l.targetIndexCount,l.targetError,h,pe(m,"out")]);return[m[0],g,c]}function tm(n,e,t,r){return Pt(n,"number","meshopt_simplifyScale",[pe(e),t,r])}async function Xl(n,e,t){let r=t.indices,o=await ql(n,e,t,r),i=await nm(n,e,t,r),l=i.map(([m,h],g)=>ql(n,m,t,h,`-lod${g}`)),c=await Promise.all(l);return{mesh:e,meshlets:o,meshoptimizerLODs:i.map(m=>m[0]),meshoptimizerMeshletLODs:c}}async function nm(n,e,t,r){let i=t.positions,l=Ce(r),c=l/10,m=l,h=[],g=(_,x)=>{h.push([_,x])};for(g(e,r);m>c&&h.length<10;){let _=h.length,x=m*le/2,T=await Vo(t,r,{targetIndexCount:x,targetError:.05}),S=Ce(T.indexBuffer);if(S===l)break;m=S;let w=gr(n,`dbg-lod-test-index-buffer-${_}`,T.indexBuffer),E={...e,indexBuffer:w,vertexCount:Vt(i),triangleCount:Ce(T.indexBuffer)};g(E,T.indexBuffer)}return h}async function ql(n,e,t,r,o=""){let i=await zo(t,r,{}),l=gr(n,`dbg-meshlets-indices${o}`,i.meshletTriangles);return{...i,vertexBuffer:e.vertexBuffer,indexBuffer:l}}var rm=n=>n.countX*n.countY;function $o(n=10,e=10,t=1.3,r=0,o=0){return{countX:n,countY:e,spacing:t,offsetX:r,offsetY:o}}function sa(n,e,t){let r=n.createBuffer({label:`${e}-nanite-transforms`,size:it*t.countX*t.countY,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),o=[],i=0;for(let c=0;c<t.countX;c++)for(let m=0;m<t.countY;m++){let h=_e.translation([-c*t.spacing+t.offsetX,0,-m*t.spacing+t.offsetY]),g=c==0&&m==0?0:fs(0,360),_=_e.rotationY(dn(g)),x=_e.multiply(h,_);o.push(x),_s(n,r,i,x),i+=it}let l=rm(t);return{transforms:o,transformsBuffer:r,count:l}}var om={bunny:{file:"bunny.obj",scale:8},lucy:{file:"lucy.obj",scale:1},lucyJson:{file:"lucy.json",scale:1},dragon:{file:"xyzrgb_dragon.obj",scale:.01},dragonJson:{file:"xyzrgb_dragon.json",scale:.01},robot:{file:"robot.obj",scale:1},robotJson:{file:"robot.json",scale:1},cube:{file:"cube.obj",scale:1},plane:{file:"plane.obj",scale:1,texture:"test-texture.png"},planeSubdiv:{file:"plane-subdiv.obj",scale:.5},displacedPlane:{file:"displaced-plane.obj",scale:.2,texture:"test-texture.png"},displacedPlaneFlat:{file:"displaced-plane-flat.obj",scale:.2},jinxBackpack:{file:"jinx/jinx_backpack.obj",scale:1,texture:"jinx/jinx_backpack.png"},jinxBody:{file:"jinx/jinx_body.obj",scale:1,texture:"jinx/jinx_body.png"},jinxFace:{file:"jinx/jinx_face.obj",scale:1,texture:"jinx/jinx_face.png"},jinxHair:{file:"jinx/jinx_hair.obj",scale:1,texture:"jinx/jinx_hair.png"},jinxCombined:{file:"jinx-combined/jinx-combined.obj",scale:1,texture:"jinx-combined/jinx-combined.png"}};function Ho(n){let e=om[n];if(!e)throw new Error(`Nonexistent object '${n}'`);return e}var Br={bunnySingle:[ke("bunny",1,1)],bunny:[ke("bunny")],bunnyRow:[ke("bunny",32768,1)],bunny1b:[ke("bunny",500,500,.8)],bunny1b_dense:[ke("bunny",500,500,.5)],lucySingle:[ke("lucy",1,1)],lucySingleJson:[ke("lucyJson",1,1)],lucy:[ke("lucy",10,10,0)],lucy1b:[ke("lucyJson",110,110,.7)],dragon:[ke("dragon",1,1)],dragonJson:[ke("dragonJson",70,70)],robot:[ke("robot",1,1)],robotJson:[ke("robotJson",1,1)],cube:[ke("cube",1,1)],plane:[ke("plane",1,1)],planeSubdiv:[ke("planeSubdiv",1,1)],displacedPlane:[ke("displacedPlane",1,1)],displacedPlaneFlat:[ke("displacedPlaneFlat",1,1)],manyObjects:[Cr("displacedPlane",10,2,0),Cr("bunny",10,2,1)],manyObjects2:[Cr("lucyJson",70,1.2,0),Cr("dragonJson",70,1.2,.6)],jinxCombined:[Cr("jinxCombined",120,.7)],jinx:{models:["jinxBody","jinxFace","jinxHair","jinxBackpack"],instances:$o(100,100,1)}};function ke(n,...e){let t=$o(...e);return Kl(n,t)}function Cr(n,e,t,r=0){let o=$o(e,e,t,r,r);return Kl(n,o)}function Kl(n,e){return{model:n,instances:e}}function Jl(n){return typeof n=="string"&&Object.keys(Br).includes(n)}var ua={bindings:{matrices:0,diffuseTexture:1,sampler:2}},la=ua.bindings,Zl=()=>`

@group(0) @binding(${la.matrices})
var<storage, read> _matrices: array<mat4x4<f32>>;

@group(0) @binding(${la.diffuseTexture})
var _diffuseTexture: texture_2d<f32>;

@group(0) @binding(${la.sampler})
var _sampler: sampler;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) positionWS: vec4f,
  @location(1) normalWS: vec3f,
  @location(2) uv: vec2f,
};

@vertex
fn main_vs(
  @location(0) positionWS: vec3f,
  @location(1) inNormal : vec3f,
  @location(2) inUV : vec2f,
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  // NOTE: we render the model as-is, so no model matrix.
  let projMat = _matrices[0];
  let viewMat = _matrices[1 + inInstanceIndex];
  let positionWS_4 = vec4f(positionWS.xyz, 1.0);
  let positionProj = projMat * viewMat * positionWS_4;
  
  var result: VertexOutput;
  result.position = positionProj;
  result.positionWS = positionWS_4;
  result.normalWS = inNormal;
  result.uv = inUV;
  return result;
}

${Qe}
${Oo}

@fragment
fn main_fs(
  fragIn: VertexOutput
) -> @location(0) vec2f {
  let c = textureSample(_diffuseTexture, _sampler, fragIn.uv).rgb;
  // TODO [IGNORE] store diffuse texture's alpha instead of override with 1.0

  let normalWS = normalize(fragIn.normalWS.xyz);
  return vec2f(
    packColor8888(vec4f(c.rgb, 1.0)),
    packNormal(vec4f(normalWS, 0.0))
  );
}
`;var ca=n=>(n=n<1?n*255:n,Math.floor(pn(n,0,255)));function Ql(n,e){let t={width:4,height:4},r=4,o=n.createTexture({label:"fallback-texture-0",dimension:"2d",size:[t.width,t.height,1],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),i=new Uint8Array(t.width*t.height*r);for(let l=0;l<t.width;l++)for(let c=0;c<t.height;c++){let m=(l*t.width+c)*r;i[m]=ca(e[0]),i[m+1]=ca(e[1]),i[m+2]=ca(e[2]),i[m+3]=255}return n.queue.writeTexture({texture:o},i,{bytesPerRow:t.width*is},[t.width,t.height]),o}function Dr(n,e){return n.createSampler({label:"default-sampler",magFilter:e,minFilter:e,mipmapFilter:"nearest",addressModeU:"repeat",addressModeV:"repeat"})}var fa=class{constructor(e){this.texture=e;this.textureView=e.createView()}textureView;bind=e=>({binding:e,resource:this.textureView})},eu="rg32float",tu="depth24plus";var jo=class n{constructor(e,t,r=P.impostors.views,o=P.impostors.textureSize){this.fallbackTexture=t;this.viewCount=r;this.textureSize=o;Ie(this.fallbackTexture);let i=e.createShaderModule({label:be(n),code:Zl()});this.pipeline=e.createRenderPipeline({label:ve(n),layout:"auto",vertex:{module:i,entryPoint:"main_vs",buffers:lo},fragment:{module:i,entryPoint:"main_fs",targets:[{format:eu}]},primitive:yt,depthStencil:{...Ze,format:tu}}),this.matricesBuffer=e.createBuffer({label:`${n.NAME}-matrices`,size:it*(1+this.viewCount),usage:GPUBufferUsage.STORAGE|GPUBufferUsage.INDIRECT|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),this.matricesF32=new Float32Array(this.matricesBuffer.size/Pe),this.sampler=Dr(e,"linear"),this.depthTexture=e.createTexture({label:Ut(n,"depth"),size:[this.textureSize*this.viewCount,this.textureSize],format:tu,usage:GPUTextureUsage.RENDER_ATTACHMENT}),this.depthTextureView=this.depthTexture.createView()}static NAME="ImpostorRenderer";static CLEAR_COLOR=[0,0,0,0];pipeline;matricesBuffer;matricesF32;sampler;depthTexture;depthTextureView;createImpostorTexture(e,t){let r=this.createResultTexture(e,t),o=e.createCommandEncoder({label:`${n.NAME}-${t.name}-cmd-buffer`}),i=this.renderImpostorTexture(e,o,r,t);return e.queue.submit([o.finish()]),i}createResultTexture(e,t){let r=this.textureSize*this.viewCount,o=P.isTest?GPUTextureUsage.COPY_SRC:0;return e.createTexture({label:Ut(n,t.name),dimension:"2d",size:[r,this.textureSize,1],format:eu,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT|o})}renderImpostorTexture(e,t,r,o){let i=r.createView(),l=t.beginRenderPass({label:n.NAME,colorAttachments:[Oe(i,n.CLEAR_COLOR,"clear")],depthStencilAttachment:je(this.depthTextureView,"clear")}),c=this.createBindings(e,o);l.setVertexBuffer(0,o.vertexBuffer),l.setVertexBuffer(1,o.normalsBuffer),l.setVertexBuffer(2,o.uvBuffer),l.setIndexBuffer(o.indexBuffer,"uint32"),l.setPipeline(this.pipeline),l.setBindGroup(0,c);let m=this.textureSize;for(let h=0;h<this.viewCount;h++)l.setViewport(m*h,0,m,m,0,1),l.drawIndexed(o.triangleCount*3,1,0,0,h);return l.end(),new fa(r)}createBindings=(e,t)=>{let r=ua.bindings,o=this.getProjectionMat(t),i=360/this.viewCount,l=Ve(this.viewCount).map((m,h)=>_e.rotationY(dn(i*h)));this.writeUniforms(e,o,l);let c=t.texture||this.fallbackTexture;return Ie(c),xe(n,`${n.NAME}-${t.name}`,e,this.pipeline,[{binding:r.matrices,resource:{buffer:this.matricesBuffer}},{binding:r.diffuseTexture,resource:c},{binding:r.sampler,resource:this.sampler}])};writeUniforms(e,t,r){let o=0;if(o=this.writeMat4(o,t),r.forEach(i=>{o=this.writeMat4(o,i)}),o!==this.matricesF32.byteLength||o!==this.matricesBuffer.size)throw new Error(`Impostor matrices write error. GPUBuffer has ${this.matricesBuffer.size} bytes, CPU buffer is ${this.matricesF32.byteLength}, but have used ${o} bytes.`);e.queue.writeBuffer(this.matricesBuffer,0,this.matricesF32)}writeMat4(e,t){let r=e/Pe;for(let o=0;o<16;o++)this.matricesF32[r+o]=t[o];return e+it}getProjectionMat(e){let t=e.bounds,r=t.radius;return _e.ortho(t.center[0]-r,t.center[0]+r,t.center[1]-r,t.center[1]+r,t.center[2]-r,t.center[2]+r)}};var im=(n,e)=>`${Math.min(n,e)}-${Math.max(n,e)}`;function nu(n){if(n.length%le!==0)throw new Error(`Index buffer has ${n.length} indices, cannot make triangles from this`);let e=[],t=Ce(n),r=(o,i)=>e.push(im(o,i));for(let o=0;o<t;o++){let i=n[le*o],l=n[le*o+1],c=n[le*o+2];r(i,l),r(i,c),r(l,c)}return e}var am=(n,e)=>n===e;function ru(n){let e=t=>{let r=0;return n.forEach(o=>{am(t,o)&&(r+=1)}),r};return n.filter(t=>e(t)==1)}function ou(n){let e=n.map(o=>new Set(o)),t=(o,i)=>{for(let l of o)if(i.has(l))return!0;return!1},r=Ve(e.length).map(()=>[]);for(let o=0;o<e.length;o++){let i=e[o];for(let l=o+1;l<e.length;l++){let c=e[l];o!==l&&t(i,c)&&(r[o].push(l),r[l].push(o))}}return r}function iu(n){let e=new Map;for(let r=0;r<n.length;r++){let o=n[r];for(let i=0;i<o.length;i++){let l=o[i],c=e.get(l)||[];c.push(r),e.set(l,c)}}let t=Ve(n.length).map(()=>[]);return e.forEach(r=>{let o=Array.from(r),i=o.length;for(let l=0;l<i;l++)for(let c=l+1;c<i;c++){let m=o[l],h=o[c];t[m].includes(h)||t[m].push(h),t[h].includes(m)||t[h].push(m)}}),t}var au={},sm=(()=>{var n=au.url;return function(t){t=t||{};var t=typeof t<"u"?t:{},r,o;t.ready=new Promise(function(s,a){r=s,o=a});var i=Object.assign({},t),l=[],c="./this.program",m=(s,a)=>{throw a},h=!0,g=!1,_="";function x(s){return t.locateFile?t.locateFile(s,_):_+s}var T,S,w,E;(h||g)&&(g?_=self.location.href:typeof document<"u"&&document.currentScript&&(_=document.currentScript.src),n&&(_=n),_.indexOf("blob:")!==0?_=_.substr(0,_.replace(/[?#].*/,"").lastIndexOf("/")+1):_="",T=s=>{var a=new XMLHttpRequest;return a.open("GET",s,!1),a.send(null),a.responseText},g&&(w=s=>{var a=new XMLHttpRequest;return a.open("GET",s,!1),a.responseType="arraybuffer",a.send(null),new Uint8Array(a.response)}),S=(s,a,u)=>{var d=new XMLHttpRequest;d.open("GET",s,!0),d.responseType="arraybuffer",d.onload=()=>{if(d.status==200||d.status==0&&d.response){a(d.response);return}u()},d.onerror=u,d.send(null)},E=s=>document.title=s);var R=t.print||console.log.bind(console),C=t.printErr||console.warn.bind(console);Object.assign(t,i),i=null,t.arguments&&(l=t.arguments),t.thisProgram&&(c=t.thisProgram),t.quit&&(m=t.quit);var N;t.wasmBinary&&(N=t.wasmBinary);var L=t.noExitRuntime||!0;typeof WebAssembly!="object"&&Rt("no native wasm support detected");var D,H=!1,J;function re(s,a){s||Rt(a)}var oe=typeof TextDecoder<"u"?new TextDecoder("utf8"):void 0;function B(s,a,u){for(var d=a+u,p=a;s[p]&&!(p>=d);)++p;if(p-a>16&&s.buffer&&oe)return oe.decode(s.subarray(a,p));for(var b="";a<p;){var v=s[a++];if(!(v&128)){b+=String.fromCharCode(v);continue}var y=s[a++]&63;if((v&224)==192){b+=String.fromCharCode((v&31)<<6|y);continue}var A=s[a++]&63;if((v&240)==224?v=(v&15)<<12|y<<6|A:v=(v&7)<<18|y<<12|A<<6|s[a++]&63,v<65536)b+=String.fromCharCode(v);else{var O=v-65536;b+=String.fromCharCode(55296|O>>10,56320|O&1023)}}return b}function ee(s,a){return s?B(ye,s,a):""}function X(s,a,u,d){if(!(d>0))return 0;for(var p=u,b=u+d-1,v=0;v<s.length;++v){var y=s.charCodeAt(v);if(y>=55296&&y<=57343){var A=s.charCodeAt(++v);y=65536+((y&1023)<<10)|A&1023}if(y<=127){if(u>=b)break;a[u++]=y}else if(y<=2047){if(u+1>=b)break;a[u++]=192|y>>6,a[u++]=128|y&63}else if(y<=65535){if(u+2>=b)break;a[u++]=224|y>>12,a[u++]=128|y>>6&63,a[u++]=128|y&63}else{if(u+3>=b)break;a[u++]=240|y>>18,a[u++]=128|y>>12&63,a[u++]=128|y>>6&63,a[u++]=128|y&63}}return a[u]=0,u-p}function he(s,a,u){return X(s,ye,a,u)}function de(s){for(var a=0,u=0;u<s.length;++u){var d=s.charCodeAt(u);d<=127?a++:d<=2047?a+=2:d>=55296&&d<=57343?(a+=4,++u):a+=3}return a}var ie,j,ye,Re,st,te,we,et,qe;function He(s){ie=s,t.HEAP8=j=new Int8Array(s),t.HEAP16=Re=new Int16Array(s),t.HEAP32=te=new Int32Array(s),t.HEAPU8=ye=new Uint8Array(s),t.HEAPU16=st=new Uint16Array(s),t.HEAPU32=we=new Uint32Array(s),t.HEAPF32=et=new Float32Array(s),t.HEAPF64=qe=new Float64Array(s)}var Tt=t.INITIAL_MEMORY||16777216,Qt,en=[],tn=[],nn=[],Be=!1;function Zo(){return L}function At(){if(t.preRun)for(typeof t.preRun=="function"&&(t.preRun=[t.preRun]);t.preRun.length;)on(t.preRun.shift());En(en)}function It(){Be=!0,!t.noFSInit&&!f.init.initialized&&f.init(),f.ignorePermissions=!1,lt.init(),En(tn)}function rn(){if(t.postRun)for(typeof t.postRun=="function"&&(t.postRun=[t.postRun]);t.postRun.length;)ei(t.postRun.shift());En(nn)}function on(s){en.unshift(s)}function Qo(s){tn.unshift(s)}function ei(s){nn.unshift(s)}var Te=0,We=null,an=null;function ti(s){return s}function wn(s){Te++,t.monitorRunDependencies&&t.monitorRunDependencies(Te)}function Ne(s){if(Te--,t.monitorRunDependencies&&t.monitorRunDependencies(Te),Te==0&&(We!==null&&(clearInterval(We),We=null),an)){var a=an;an=null,a()}}function Rt(s){t.onAbort&&t.onAbort(s),s="Aborted("+s+")",C(s),H=!0,J=1,s+=". Build with -sASSERTIONS for more info.";var a=new WebAssembly.RuntimeError(s);throw o(a),a}var kt="data:application/octet-stream;base64,";function rr(s){return s.startsWith(kt)}var Xe;t.locateFile?(Xe="metis.wasm",rr(Xe)||(Xe=x(Xe))):Xe=new URL("metis.wasm",au.url).toString();function or(s){try{if(s==Xe&&N)return new Uint8Array(N);if(w)return w(s);throw"both async and sync fetching of the wasm failed"}catch(a){Rt(a)}}function ni(){return!N&&(h||g)&&typeof fetch=="function"?fetch(Xe,{credentials:"same-origin"}).then(function(s){if(!s.ok)throw"failed to load wasm binary file at '"+Xe+"'";return s.arrayBuffer()}).catch(function(){return or(Xe)}):Promise.resolve().then(function(){return or(Xe)})}function ri(){var s={a:ya};function a(v,y){var A=v.exports;t.asm=A,D=t.asm.x,He(D.buffer),Qt=t.asm.z,Qo(t.asm.y),Ne("wasm-instantiate")}wn("wasm-instantiate");function u(v){a(v.instance)}function d(v){return ni().then(function(y){return WebAssembly.instantiate(y,s)}).then(function(y){return y}).then(v,function(y){C("failed to asynchronously prepare wasm: "+y),Rt(y)})}function p(){return!N&&typeof WebAssembly.instantiateStreaming=="function"&&!rr(Xe)&&typeof fetch=="function"?fetch(Xe,{credentials:"same-origin"}).then(function(v){var y=WebAssembly.instantiateStreaming(v,s);return y.then(u,function(A){return C("wasm streaming compile failed: "+A),C("falling back to ArrayBuffer instantiation"),d(u)})}):d(u)}if(t.instantiateWasm)try{var b=t.instantiateWasm(s,a);return b}catch(v){C("Module.instantiateWasm callback failed with error: "+v),o(v)}return p().catch(o),{}}var W,ue;function oi(s){this.name="ExitStatus",this.message="Program terminated with exit("+s+")",this.status=s}function En(s){for(;s.length>0;)s.shift()(t)}function Or(s,a){j.set(s,a)}function ii(s,a,u,d){Rt("Assertion failed: "+ee(s)+", at: "+[a?ee(a):"unknown filename",u,d?ee(d):"unknown function"])}var sn=[];function Ke(s){var a=sn[s];return a||(s>=sn.length&&(sn.length=s+1),sn[s]=a=Qt.get(s)),a}function ba(s,a){Ke(s)(a)}function Gt(s){return te[Ei()>>2]=s,s}var Z={isAbs:s=>s.charAt(0)==="/",splitPath:s=>{var a=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return a.exec(s).slice(1)},normalizeArray:(s,a)=>{for(var u=0,d=s.length-1;d>=0;d--){var p=s[d];p==="."?s.splice(d,1):p===".."?(s.splice(d,1),u++):u&&(s.splice(d,1),u--)}if(a)for(;u;u--)s.unshift("..");return s},normalize:s=>{var a=Z.isAbs(s),u=s.substr(-1)==="/";return s=Z.normalizeArray(s.split("/").filter(d=>!!d),!a).join("/"),!s&&!a&&(s="."),s&&u&&(s+="/"),(a?"/":"")+s},dirname:s=>{var a=Z.splitPath(s),u=a[0],d=a[1];return!u&&!d?".":(d&&(d=d.substr(0,d.length-1)),u+d)},basename:s=>{if(s==="/")return"/";s=Z.normalize(s),s=s.replace(/\/$/,"");var a=s.lastIndexOf("/");return a===-1?s:s.substr(a+1)},join:function(){var s=Array.prototype.slice.call(arguments);return Z.normalize(s.join("/"))},join2:(s,a)=>Z.normalize(s+"/"+a)};function ai(){if(typeof crypto=="object"&&typeof crypto.getRandomValues=="function"){var s=new Uint8Array(1);return()=>(crypto.getRandomValues(s),s[0])}else return()=>Rt("randomDevice")}var Ge={resolve:function(){for(var s="",a=!1,u=arguments.length-1;u>=-1&&!a;u--){var d=u>=0?arguments[u]:f.cwd();if(typeof d!="string")throw new TypeError("Arguments to path.resolve must be strings");if(!d)return"";s=d+"/"+s,a=Z.isAbs(d)}return s=Z.normalizeArray(s.split("/").filter(p=>!!p),!a).join("/"),(a?"/":"")+s||"."},relative:(s,a)=>{s=Ge.resolve(s).substr(1),a=Ge.resolve(a).substr(1);function u(O){for(var F=0;F<O.length&&O[F]==="";F++);for(var V=O.length-1;V>=0&&O[V]==="";V--);return F>V?[]:O.slice(F,V-F+1)}for(var d=u(s.split("/")),p=u(a.split("/")),b=Math.min(d.length,p.length),v=b,y=0;y<b;y++)if(d[y]!==p[y]){v=y;break}for(var A=[],y=v;y<d.length;y++)A.push("..");return A=A.concat(p.slice(v)),A.join("/")}};function Mn(s,a,u){var d=u>0?u:de(s)+1,p=new Array(d),b=X(s,p,0,p.length);return a&&(p.length=b),p}var lt={ttys:[],init:function(){},shutdown:function(){},register:function(s,a){lt.ttys[s]={input:[],output:[],ops:a},f.registerDevice(s,lt.stream_ops)},stream_ops:{open:function(s){var a=lt.ttys[s.node.rdev];if(!a)throw new f.ErrnoError(43);s.tty=a,s.seekable=!1},close:function(s){s.tty.ops.fsync(s.tty)},fsync:function(s){s.tty.ops.fsync(s.tty)},read:function(s,a,u,d,p){if(!s.tty||!s.tty.ops.get_char)throw new f.ErrnoError(60);for(var b=0,v=0;v<d;v++){var y;try{y=s.tty.ops.get_char(s.tty)}catch{throw new f.ErrnoError(29)}if(y===void 0&&b===0)throw new f.ErrnoError(6);if(y==null)break;b++,a[u+v]=y}return b&&(s.node.timestamp=Date.now()),b},write:function(s,a,u,d,p){if(!s.tty||!s.tty.ops.put_char)throw new f.ErrnoError(60);try{for(var b=0;b<d;b++)s.tty.ops.put_char(s.tty,a[u+b])}catch{throw new f.ErrnoError(29)}return d&&(s.node.timestamp=Date.now()),b}},default_tty_ops:{get_char:function(s){if(!s.input.length){var a=null;if(typeof window<"u"&&typeof window.prompt=="function"?(a=window.prompt("Input: "),a!==null&&(a+=`
`)):typeof readline=="function"&&(a=readline(),a!==null&&(a+=`
`)),!a)return null;s.input=Mn(a,!0)}return s.input.shift()},put_char:function(s,a){a===null||a===10?(R(B(s.output,0)),s.output=[]):a!=0&&s.output.push(a)},fsync:function(s){s.output&&s.output.length>0&&(R(B(s.output,0)),s.output=[])}},default_tty1_ops:{put_char:function(s,a){a===null||a===10?(C(B(s.output,0)),s.output=[]):a!=0&&s.output.push(a)},fsync:function(s){s.output&&s.output.length>0&&(C(B(s.output,0)),s.output=[])}}};function ln(s){Rt()}var z={ops_table:null,mount:function(s){return z.createNode(null,"/",16895,0)},createNode:function(s,a,u,d){if(f.isBlkdev(u)||f.isFIFO(u))throw new f.ErrnoError(63);z.ops_table||(z.ops_table={dir:{node:{getattr:z.node_ops.getattr,setattr:z.node_ops.setattr,lookup:z.node_ops.lookup,mknod:z.node_ops.mknod,rename:z.node_ops.rename,unlink:z.node_ops.unlink,rmdir:z.node_ops.rmdir,readdir:z.node_ops.readdir,symlink:z.node_ops.symlink},stream:{llseek:z.stream_ops.llseek}},file:{node:{getattr:z.node_ops.getattr,setattr:z.node_ops.setattr},stream:{llseek:z.stream_ops.llseek,read:z.stream_ops.read,write:z.stream_ops.write,allocate:z.stream_ops.allocate,mmap:z.stream_ops.mmap,msync:z.stream_ops.msync}},link:{node:{getattr:z.node_ops.getattr,setattr:z.node_ops.setattr,readlink:z.node_ops.readlink},stream:{}},chrdev:{node:{getattr:z.node_ops.getattr,setattr:z.node_ops.setattr},stream:f.chrdev_stream_ops}});var p=f.createNode(s,a,u,d);return f.isDir(p.mode)?(p.node_ops=z.ops_table.dir.node,p.stream_ops=z.ops_table.dir.stream,p.contents={}):f.isFile(p.mode)?(p.node_ops=z.ops_table.file.node,p.stream_ops=z.ops_table.file.stream,p.usedBytes=0,p.contents=null):f.isLink(p.mode)?(p.node_ops=z.ops_table.link.node,p.stream_ops=z.ops_table.link.stream):f.isChrdev(p.mode)&&(p.node_ops=z.ops_table.chrdev.node,p.stream_ops=z.ops_table.chrdev.stream),p.timestamp=Date.now(),s&&(s.contents[a]=p,s.timestamp=p.timestamp),p},getFileDataAsTypedArray:function(s){return s.contents?s.contents.subarray?s.contents.subarray(0,s.usedBytes):new Uint8Array(s.contents):new Uint8Array(0)},expandFileStorage:function(s,a){var u=s.contents?s.contents.length:0;if(!(u>=a)){var d=1024*1024;a=Math.max(a,u*(u<d?2:1.125)>>>0),u!=0&&(a=Math.max(a,256));var p=s.contents;s.contents=new Uint8Array(a),s.usedBytes>0&&s.contents.set(p.subarray(0,s.usedBytes),0)}},resizeFileStorage:function(s,a){if(s.usedBytes!=a)if(a==0)s.contents=null,s.usedBytes=0;else{var u=s.contents;s.contents=new Uint8Array(a),u&&s.contents.set(u.subarray(0,Math.min(a,s.usedBytes))),s.usedBytes=a}},node_ops:{getattr:function(s){var a={};return a.dev=f.isChrdev(s.mode)?s.id:1,a.ino=s.id,a.mode=s.mode,a.nlink=1,a.uid=0,a.gid=0,a.rdev=s.rdev,f.isDir(s.mode)?a.size=4096:f.isFile(s.mode)?a.size=s.usedBytes:f.isLink(s.mode)?a.size=s.link.length:a.size=0,a.atime=new Date(s.timestamp),a.mtime=new Date(s.timestamp),a.ctime=new Date(s.timestamp),a.blksize=4096,a.blocks=Math.ceil(a.size/a.blksize),a},setattr:function(s,a){a.mode!==void 0&&(s.mode=a.mode),a.timestamp!==void 0&&(s.timestamp=a.timestamp),a.size!==void 0&&z.resizeFileStorage(s,a.size)},lookup:function(s,a){throw f.genericErrors[44]},mknod:function(s,a,u,d){return z.createNode(s,a,u,d)},rename:function(s,a,u){if(f.isDir(s.mode)){var d;try{d=f.lookupNode(a,u)}catch{}if(d)for(var p in d.contents)throw new f.ErrnoError(55)}delete s.parent.contents[s.name],s.parent.timestamp=Date.now(),s.name=u,a.contents[u]=s,a.timestamp=s.parent.timestamp,s.parent=a},unlink:function(s,a){delete s.contents[a],s.timestamp=Date.now()},rmdir:function(s,a){var u=f.lookupNode(s,a);for(var d in u.contents)throw new f.ErrnoError(55);delete s.contents[a],s.timestamp=Date.now()},readdir:function(s){var a=[".",".."];for(var u in s.contents)s.contents.hasOwnProperty(u)&&a.push(u);return a},symlink:function(s,a,u){var d=z.createNode(s,a,41471,0);return d.link=u,d},readlink:function(s){if(!f.isLink(s.mode))throw new f.ErrnoError(28);return s.link}},stream_ops:{read:function(s,a,u,d,p){var b=s.node.contents;if(p>=s.node.usedBytes)return 0;var v=Math.min(s.node.usedBytes-p,d);if(v>8&&b.subarray)a.set(b.subarray(p,p+v),u);else for(var y=0;y<v;y++)a[u+y]=b[p+y];return v},write:function(s,a,u,d,p,b){if(a.buffer===j.buffer&&(b=!1),!d)return 0;var v=s.node;if(v.timestamp=Date.now(),a.subarray&&(!v.contents||v.contents.subarray)){if(b)return v.contents=a.subarray(u,u+d),v.usedBytes=d,d;if(v.usedBytes===0&&p===0)return v.contents=a.slice(u,u+d),v.usedBytes=d,d;if(p+d<=v.usedBytes)return v.contents.set(a.subarray(u,u+d),p),d}if(z.expandFileStorage(v,p+d),v.contents.subarray&&a.subarray)v.contents.set(a.subarray(u,u+d),p);else for(var y=0;y<d;y++)v.contents[p+y]=a[u+y];return v.usedBytes=Math.max(v.usedBytes,p+d),d},llseek:function(s,a,u){var d=a;if(u===1?d+=s.position:u===2&&f.isFile(s.node.mode)&&(d+=s.node.usedBytes),d<0)throw new f.ErrnoError(28);return d},allocate:function(s,a,u){z.expandFileStorage(s.node,a+u),s.node.usedBytes=Math.max(s.node.usedBytes,a+u)},mmap:function(s,a,u,d,p){if(!f.isFile(s.node.mode))throw new f.ErrnoError(43);var b,v,y=s.node.contents;if(!(p&2)&&y.buffer===ie)v=!1,b=y.byteOffset;else{if((u>0||u+a<y.length)&&(y.subarray?y=y.subarray(u,u+a):y=Array.prototype.slice.call(y,u,u+a)),v=!0,b=ln(a),!b)throw new f.ErrnoError(48);j.set(y,b)}return{ptr:b,allocated:v}},msync:function(s,a,u,d,p){return z.stream_ops.write(s,a,0,d,u,!1),0}}};function si(s,a,u,d){var p=d?"":"al "+s;S(s,b=>{re(b,'Loading data file "'+s+'" failed (no arrayBuffer).'),a(new Uint8Array(b)),p&&Ne(p)},b=>{if(u)u();else throw'Loading data file "'+s+'" failed.'}),p&&wn(p)}var f={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:!1,ignorePermissions:!0,ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,lookupPath:(s,a={})=>{if(s=Ge.resolve(f.cwd(),s),!s)return{path:"",node:null};var u={follow_mount:!0,recurse_count:0};if(a=Object.assign(u,a),a.recurse_count>8)throw new f.ErrnoError(32);for(var d=Z.normalizeArray(s.split("/").filter(V=>!!V),!1),p=f.root,b="/",v=0;v<d.length;v++){var y=v===d.length-1;if(y&&a.parent)break;if(p=f.lookupNode(p,d[v]),b=Z.join2(b,d[v]),f.isMountpoint(p)&&(!y||y&&a.follow_mount)&&(p=p.mounted.root),!y||a.follow)for(var A=0;f.isLink(p.mode);){var O=f.readlink(b);b=Ge.resolve(Z.dirname(b),O);var F=f.lookupPath(b,{recurse_count:a.recurse_count+1});if(p=F.node,A++>40)throw new f.ErrnoError(32)}}return{path:b,node:p}},getPath:s=>{for(var a;;){if(f.isRoot(s)){var u=s.mount.mountpoint;return a?u[u.length-1]!=="/"?u+"/"+a:u+a:u}a=a?s.name+"/"+a:s.name,s=s.parent}},hashName:(s,a)=>{for(var u=0,d=0;d<a.length;d++)u=(u<<5)-u+a.charCodeAt(d)|0;return(s+u>>>0)%f.nameTable.length},hashAddNode:s=>{var a=f.hashName(s.parent.id,s.name);s.name_next=f.nameTable[a],f.nameTable[a]=s},hashRemoveNode:s=>{var a=f.hashName(s.parent.id,s.name);if(f.nameTable[a]===s)f.nameTable[a]=s.name_next;else for(var u=f.nameTable[a];u;){if(u.name_next===s){u.name_next=s.name_next;break}u=u.name_next}},lookupNode:(s,a)=>{var u=f.mayLookup(s);if(u)throw new f.ErrnoError(u,s);for(var d=f.hashName(s.id,a),p=f.nameTable[d];p;p=p.name_next){var b=p.name;if(p.parent.id===s.id&&b===a)return p}return f.lookup(s,a)},createNode:(s,a,u,d)=>{var p=new f.FSNode(s,a,u,d);return f.hashAddNode(p),p},destroyNode:s=>{f.hashRemoveNode(s)},isRoot:s=>s===s.parent,isMountpoint:s=>!!s.mounted,isFile:s=>(s&61440)===32768,isDir:s=>(s&61440)===16384,isLink:s=>(s&61440)===40960,isChrdev:s=>(s&61440)===8192,isBlkdev:s=>(s&61440)===24576,isFIFO:s=>(s&61440)===4096,isSocket:s=>(s&49152)===49152,flagModes:{r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090},modeStringToFlags:s=>{var a=f.flagModes[s];if(typeof a>"u")throw new Error("Unknown file open mode: "+s);return a},flagsToPermissionString:s=>{var a=["r","w","rw"][s&3];return s&512&&(a+="w"),a},nodePermissions:(s,a)=>f.ignorePermissions?0:a.includes("r")&&!(s.mode&292)||a.includes("w")&&!(s.mode&146)||a.includes("x")&&!(s.mode&73)?2:0,mayLookup:s=>{var a=f.nodePermissions(s,"x");return a||(s.node_ops.lookup?0:2)},mayCreate:(s,a)=>{try{var u=f.lookupNode(s,a);return 20}catch{}return f.nodePermissions(s,"wx")},mayDelete:(s,a,u)=>{var d;try{d=f.lookupNode(s,a)}catch(b){return b.errno}var p=f.nodePermissions(s,"wx");if(p)return p;if(u){if(!f.isDir(d.mode))return 54;if(f.isRoot(d)||f.getPath(d)===f.cwd())return 10}else if(f.isDir(d.mode))return 31;return 0},mayOpen:(s,a)=>s?f.isLink(s.mode)?32:f.isDir(s.mode)&&(f.flagsToPermissionString(a)!=="r"||a&512)?31:f.nodePermissions(s,f.flagsToPermissionString(a)):44,MAX_OPEN_FDS:4096,nextfd:(s=0,a=f.MAX_OPEN_FDS)=>{for(var u=s;u<=a;u++)if(!f.streams[u])return u;throw new f.ErrnoError(33)},getStream:s=>f.streams[s],createStream:(s,a,u)=>{f.FSStream||(f.FSStream=function(){this.shared={}},f.FSStream.prototype={},Object.defineProperties(f.FSStream.prototype,{object:{get:function(){return this.node},set:function(p){this.node=p}},isRead:{get:function(){return(this.flags&2097155)!==1}},isWrite:{get:function(){return(this.flags&2097155)!==0}},isAppend:{get:function(){return this.flags&1024}},flags:{get:function(){return this.shared.flags},set:function(p){this.shared.flags=p}},position:{get:function(){return this.shared.position},set:function(p){this.shared.position=p}}})),s=Object.assign(new f.FSStream,s);var d=f.nextfd(a,u);return s.fd=d,f.streams[d]=s,s},closeStream:s=>{f.streams[s]=null},chrdev_stream_ops:{open:s=>{var a=f.getDevice(s.node.rdev);s.stream_ops=a.stream_ops,s.stream_ops.open&&s.stream_ops.open(s)},llseek:()=>{throw new f.ErrnoError(70)}},major:s=>s>>8,minor:s=>s&255,makedev:(s,a)=>s<<8|a,registerDevice:(s,a)=>{f.devices[s]={stream_ops:a}},getDevice:s=>f.devices[s],getMounts:s=>{for(var a=[],u=[s];u.length;){var d=u.pop();a.push(d),u.push.apply(u,d.mounts)}return a},syncfs:(s,a)=>{typeof s=="function"&&(a=s,s=!1),f.syncFSRequests++,f.syncFSRequests>1&&C("warning: "+f.syncFSRequests+" FS.syncfs operations in flight at once, probably just doing extra work");var u=f.getMounts(f.root.mount),d=0;function p(v){return f.syncFSRequests--,a(v)}function b(v){if(v)return b.errored?void 0:(b.errored=!0,p(v));++d>=u.length&&p(null)}u.forEach(v=>{if(!v.type.syncfs)return b(null);v.type.syncfs(v,s,b)})},mount:(s,a,u)=>{var d=u==="/",p=!u,b;if(d&&f.root)throw new f.ErrnoError(10);if(!d&&!p){var v=f.lookupPath(u,{follow_mount:!1});if(u=v.path,b=v.node,f.isMountpoint(b))throw new f.ErrnoError(10);if(!f.isDir(b.mode))throw new f.ErrnoError(54)}var y={type:s,opts:a,mountpoint:u,mounts:[]},A=s.mount(y);return A.mount=y,y.root=A,d?f.root=A:b&&(b.mounted=y,b.mount&&b.mount.mounts.push(y)),A},unmount:s=>{var a=f.lookupPath(s,{follow_mount:!1});if(!f.isMountpoint(a.node))throw new f.ErrnoError(28);var u=a.node,d=u.mounted,p=f.getMounts(d);Object.keys(f.nameTable).forEach(v=>{for(var y=f.nameTable[v];y;){var A=y.name_next;p.includes(y.mount)&&f.destroyNode(y),y=A}}),u.mounted=null;var b=u.mount.mounts.indexOf(d);u.mount.mounts.splice(b,1)},lookup:(s,a)=>s.node_ops.lookup(s,a),mknod:(s,a,u)=>{var d=f.lookupPath(s,{parent:!0}),p=d.node,b=Z.basename(s);if(!b||b==="."||b==="..")throw new f.ErrnoError(28);var v=f.mayCreate(p,b);if(v)throw new f.ErrnoError(v);if(!p.node_ops.mknod)throw new f.ErrnoError(63);return p.node_ops.mknod(p,b,a,u)},create:(s,a)=>(a=a!==void 0?a:438,a&=4095,a|=32768,f.mknod(s,a,0)),mkdir:(s,a)=>(a=a!==void 0?a:511,a&=1023,a|=16384,f.mknod(s,a,0)),mkdirTree:(s,a)=>{for(var u=s.split("/"),d="",p=0;p<u.length;++p)if(u[p]){d+="/"+u[p];try{f.mkdir(d,a)}catch(b){if(b.errno!=20)throw b}}},mkdev:(s,a,u)=>(typeof u>"u"&&(u=a,a=438),a|=8192,f.mknod(s,a,u)),symlink:(s,a)=>{if(!Ge.resolve(s))throw new f.ErrnoError(44);var u=f.lookupPath(a,{parent:!0}),d=u.node;if(!d)throw new f.ErrnoError(44);var p=Z.basename(a),b=f.mayCreate(d,p);if(b)throw new f.ErrnoError(b);if(!d.node_ops.symlink)throw new f.ErrnoError(63);return d.node_ops.symlink(d,p,s)},rename:(s,a)=>{var u=Z.dirname(s),d=Z.dirname(a),p=Z.basename(s),b=Z.basename(a),v,y,A;if(v=f.lookupPath(s,{parent:!0}),y=v.node,v=f.lookupPath(a,{parent:!0}),A=v.node,!y||!A)throw new f.ErrnoError(44);if(y.mount!==A.mount)throw new f.ErrnoError(75);var O=f.lookupNode(y,p),F=Ge.relative(s,d);if(F.charAt(0)!==".")throw new f.ErrnoError(28);if(F=Ge.relative(a,u),F.charAt(0)!==".")throw new f.ErrnoError(55);var V;try{V=f.lookupNode(A,b)}catch{}if(O!==V){var G=f.isDir(O.mode),U=f.mayDelete(y,p,G);if(U)throw new f.ErrnoError(U);if(U=V?f.mayDelete(A,b,G):f.mayCreate(A,b),U)throw new f.ErrnoError(U);if(!y.node_ops.rename)throw new f.ErrnoError(63);if(f.isMountpoint(O)||V&&f.isMountpoint(V))throw new f.ErrnoError(10);if(A!==y&&(U=f.nodePermissions(y,"w"),U))throw new f.ErrnoError(U);f.hashRemoveNode(O);try{y.node_ops.rename(O,A,b)}catch(k){throw k}finally{f.hashAddNode(O)}}},rmdir:s=>{var a=f.lookupPath(s,{parent:!0}),u=a.node,d=Z.basename(s),p=f.lookupNode(u,d),b=f.mayDelete(u,d,!0);if(b)throw new f.ErrnoError(b);if(!u.node_ops.rmdir)throw new f.ErrnoError(63);if(f.isMountpoint(p))throw new f.ErrnoError(10);u.node_ops.rmdir(u,d),f.destroyNode(p)},readdir:s=>{var a=f.lookupPath(s,{follow:!0}),u=a.node;if(!u.node_ops.readdir)throw new f.ErrnoError(54);return u.node_ops.readdir(u)},unlink:s=>{var a=f.lookupPath(s,{parent:!0}),u=a.node;if(!u)throw new f.ErrnoError(44);var d=Z.basename(s),p=f.lookupNode(u,d),b=f.mayDelete(u,d,!1);if(b)throw new f.ErrnoError(b);if(!u.node_ops.unlink)throw new f.ErrnoError(63);if(f.isMountpoint(p))throw new f.ErrnoError(10);u.node_ops.unlink(u,d),f.destroyNode(p)},readlink:s=>{var a=f.lookupPath(s),u=a.node;if(!u)throw new f.ErrnoError(44);if(!u.node_ops.readlink)throw new f.ErrnoError(28);return Ge.resolve(f.getPath(u.parent),u.node_ops.readlink(u))},stat:(s,a)=>{var u=f.lookupPath(s,{follow:!a}),d=u.node;if(!d)throw new f.ErrnoError(44);if(!d.node_ops.getattr)throw new f.ErrnoError(63);return d.node_ops.getattr(d)},lstat:s=>f.stat(s,!0),chmod:(s,a,u)=>{var d;if(typeof s=="string"){var p=f.lookupPath(s,{follow:!u});d=p.node}else d=s;if(!d.node_ops.setattr)throw new f.ErrnoError(63);d.node_ops.setattr(d,{mode:a&4095|d.mode&-4096,timestamp:Date.now()})},lchmod:(s,a)=>{f.chmod(s,a,!0)},fchmod:(s,a)=>{var u=f.getStream(s);if(!u)throw new f.ErrnoError(8);f.chmod(u.node,a)},chown:(s,a,u,d)=>{var p;if(typeof s=="string"){var b=f.lookupPath(s,{follow:!d});p=b.node}else p=s;if(!p.node_ops.setattr)throw new f.ErrnoError(63);p.node_ops.setattr(p,{timestamp:Date.now()})},lchown:(s,a,u)=>{f.chown(s,a,u,!0)},fchown:(s,a,u)=>{var d=f.getStream(s);if(!d)throw new f.ErrnoError(8);f.chown(d.node,a,u)},truncate:(s,a)=>{if(a<0)throw new f.ErrnoError(28);var u;if(typeof s=="string"){var d=f.lookupPath(s,{follow:!0});u=d.node}else u=s;if(!u.node_ops.setattr)throw new f.ErrnoError(63);if(f.isDir(u.mode))throw new f.ErrnoError(31);if(!f.isFile(u.mode))throw new f.ErrnoError(28);var p=f.nodePermissions(u,"w");if(p)throw new f.ErrnoError(p);u.node_ops.setattr(u,{size:a,timestamp:Date.now()})},ftruncate:(s,a)=>{var u=f.getStream(s);if(!u)throw new f.ErrnoError(8);if(!(u.flags&2097155))throw new f.ErrnoError(28);f.truncate(u.node,a)},utime:(s,a,u)=>{var d=f.lookupPath(s,{follow:!0}),p=d.node;p.node_ops.setattr(p,{timestamp:Math.max(a,u)})},open:(s,a,u)=>{if(s==="")throw new f.ErrnoError(44);a=typeof a=="string"?f.modeStringToFlags(a):a,u=typeof u>"u"?438:u,a&64?u=u&4095|32768:u=0;var d;if(typeof s=="object")d=s;else{s=Z.normalize(s);try{var p=f.lookupPath(s,{follow:!(a&131072)});d=p.node}catch{}}var b=!1;if(a&64)if(d){if(a&128)throw new f.ErrnoError(20)}else d=f.mknod(s,u,0),b=!0;if(!d)throw new f.ErrnoError(44);if(f.isChrdev(d.mode)&&(a&=-513),a&65536&&!f.isDir(d.mode))throw new f.ErrnoError(54);if(!b){var v=f.mayOpen(d,a);if(v)throw new f.ErrnoError(v)}a&512&&!b&&f.truncate(d,0),a&=-131713;var y=f.createStream({node:d,path:f.getPath(d),flags:a,seekable:!0,position:0,stream_ops:d.stream_ops,ungotten:[],error:!1});return y.stream_ops.open&&y.stream_ops.open(y),t.logReadFiles&&!(a&1)&&(f.readFiles||(f.readFiles={}),s in f.readFiles||(f.readFiles[s]=1)),y},close:s=>{if(f.isClosed(s))throw new f.ErrnoError(8);s.getdents&&(s.getdents=null);try{s.stream_ops.close&&s.stream_ops.close(s)}catch(a){throw a}finally{f.closeStream(s.fd)}s.fd=null},isClosed:s=>s.fd===null,llseek:(s,a,u)=>{if(f.isClosed(s))throw new f.ErrnoError(8);if(!s.seekable||!s.stream_ops.llseek)throw new f.ErrnoError(70);if(u!=0&&u!=1&&u!=2)throw new f.ErrnoError(28);return s.position=s.stream_ops.llseek(s,a,u),s.ungotten=[],s.position},read:(s,a,u,d,p)=>{if(d<0||p<0)throw new f.ErrnoError(28);if(f.isClosed(s))throw new f.ErrnoError(8);if((s.flags&2097155)===1)throw new f.ErrnoError(8);if(f.isDir(s.node.mode))throw new f.ErrnoError(31);if(!s.stream_ops.read)throw new f.ErrnoError(28);var b=typeof p<"u";if(!b)p=s.position;else if(!s.seekable)throw new f.ErrnoError(70);var v=s.stream_ops.read(s,a,u,d,p);return b||(s.position+=v),v},write:(s,a,u,d,p,b)=>{if(d<0||p<0)throw new f.ErrnoError(28);if(f.isClosed(s))throw new f.ErrnoError(8);if(!(s.flags&2097155))throw new f.ErrnoError(8);if(f.isDir(s.node.mode))throw new f.ErrnoError(31);if(!s.stream_ops.write)throw new f.ErrnoError(28);s.seekable&&s.flags&1024&&f.llseek(s,0,2);var v=typeof p<"u";if(!v)p=s.position;else if(!s.seekable)throw new f.ErrnoError(70);var y=s.stream_ops.write(s,a,u,d,p,b);return v||(s.position+=y),y},allocate:(s,a,u)=>{if(f.isClosed(s))throw new f.ErrnoError(8);if(a<0||u<=0)throw new f.ErrnoError(28);if(!(s.flags&2097155))throw new f.ErrnoError(8);if(!f.isFile(s.node.mode)&&!f.isDir(s.node.mode))throw new f.ErrnoError(43);if(!s.stream_ops.allocate)throw new f.ErrnoError(138);s.stream_ops.allocate(s,a,u)},mmap:(s,a,u,d,p)=>{if(d&2&&!(p&2)&&(s.flags&2097155)!==2)throw new f.ErrnoError(2);if((s.flags&2097155)===1)throw new f.ErrnoError(2);if(!s.stream_ops.mmap)throw new f.ErrnoError(43);return s.stream_ops.mmap(s,a,u,d,p)},msync:(s,a,u,d,p)=>s.stream_ops.msync?s.stream_ops.msync(s,a,u,d,p):0,munmap:s=>0,ioctl:(s,a,u)=>{if(!s.stream_ops.ioctl)throw new f.ErrnoError(59);return s.stream_ops.ioctl(s,a,u)},readFile:(s,a={})=>{if(a.flags=a.flags||0,a.encoding=a.encoding||"binary",a.encoding!=="utf8"&&a.encoding!=="binary")throw new Error('Invalid encoding type "'+a.encoding+'"');var u,d=f.open(s,a.flags),p=f.stat(s),b=p.size,v=new Uint8Array(b);return f.read(d,v,0,b,0),a.encoding==="utf8"?u=B(v,0):a.encoding==="binary"&&(u=v),f.close(d),u},writeFile:(s,a,u={})=>{u.flags=u.flags||577;var d=f.open(s,u.flags,u.mode);if(typeof a=="string"){var p=new Uint8Array(de(a)+1),b=X(a,p,0,p.length);f.write(d,p,0,b,void 0,u.canOwn)}else if(ArrayBuffer.isView(a))f.write(d,a,0,a.byteLength,void 0,u.canOwn);else throw new Error("Unsupported data type");f.close(d)},cwd:()=>f.currentPath,chdir:s=>{var a=f.lookupPath(s,{follow:!0});if(a.node===null)throw new f.ErrnoError(44);if(!f.isDir(a.node.mode))throw new f.ErrnoError(54);var u=f.nodePermissions(a.node,"x");if(u)throw new f.ErrnoError(u);f.currentPath=a.path},createDefaultDirectories:()=>{f.mkdir("/tmp"),f.mkdir("/home"),f.mkdir("/home/web_user")},createDefaultDevices:()=>{f.mkdir("/dev"),f.registerDevice(f.makedev(1,3),{read:()=>0,write:(a,u,d,p,b)=>p}),f.mkdev("/dev/null",f.makedev(1,3)),lt.register(f.makedev(5,0),lt.default_tty_ops),lt.register(f.makedev(6,0),lt.default_tty1_ops),f.mkdev("/dev/tty",f.makedev(5,0)),f.mkdev("/dev/tty1",f.makedev(6,0));var s=ai();f.createDevice("/dev","random",s),f.createDevice("/dev","urandom",s),f.mkdir("/dev/shm"),f.mkdir("/dev/shm/tmp")},createSpecialDirectories:()=>{f.mkdir("/proc");var s=f.mkdir("/proc/self");f.mkdir("/proc/self/fd"),f.mount({mount:()=>{var a=f.createNode(s,"fd",16895,73);return a.node_ops={lookup:(u,d)=>{var p=+d,b=f.getStream(p);if(!b)throw new f.ErrnoError(8);var v={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:()=>b.path}};return v.parent=v,v}},a}},{},"/proc/self/fd")},createStandardStreams:()=>{t.stdin?f.createDevice("/dev","stdin",t.stdin):f.symlink("/dev/tty","/dev/stdin"),t.stdout?f.createDevice("/dev","stdout",null,t.stdout):f.symlink("/dev/tty","/dev/stdout"),t.stderr?f.createDevice("/dev","stderr",null,t.stderr):f.symlink("/dev/tty1","/dev/stderr");var s=f.open("/dev/stdin",0),a=f.open("/dev/stdout",1),u=f.open("/dev/stderr",1)},ensureErrnoError:()=>{f.ErrnoError||(f.ErrnoError=function(a,u){this.node=u,this.setErrno=function(d){this.errno=d},this.setErrno(a),this.message="FS error"},f.ErrnoError.prototype=new Error,f.ErrnoError.prototype.constructor=f.ErrnoError,[44].forEach(s=>{f.genericErrors[s]=new f.ErrnoError(s),f.genericErrors[s].stack="<generic error, no stack>"}))},staticInit:()=>{f.ensureErrnoError(),f.nameTable=new Array(4096),f.mount(z,{},"/"),f.createDefaultDirectories(),f.createDefaultDevices(),f.createSpecialDirectories(),f.filesystems={MEMFS:z}},init:(s,a,u)=>{f.init.initialized=!0,f.ensureErrnoError(),t.stdin=s||t.stdin,t.stdout=a||t.stdout,t.stderr=u||t.stderr,f.createStandardStreams()},quit:()=>{f.init.initialized=!1;for(var s=0;s<f.streams.length;s++){var a=f.streams[s];a&&f.close(a)}},getMode:(s,a)=>{var u=0;return s&&(u|=365),a&&(u|=146),u},findObject:(s,a)=>{var u=f.analyzePath(s,a);return u.exists?u.object:null},analyzePath:(s,a)=>{try{var u=f.lookupPath(s,{follow:!a});s=u.path}catch{}var d={isRoot:!1,exists:!1,error:0,name:null,path:null,object:null,parentExists:!1,parentPath:null,parentObject:null};try{var u=f.lookupPath(s,{parent:!0});d.parentExists=!0,d.parentPath=u.path,d.parentObject=u.node,d.name=Z.basename(s),u=f.lookupPath(s,{follow:!a}),d.exists=!0,d.path=u.path,d.object=u.node,d.name=u.node.name,d.isRoot=u.path==="/"}catch(p){d.error=p.errno}return d},createPath:(s,a,u,d)=>{s=typeof s=="string"?s:f.getPath(s);for(var p=a.split("/").reverse();p.length;){var b=p.pop();if(b){var v=Z.join2(s,b);try{f.mkdir(v)}catch{}s=v}}return v},createFile:(s,a,u,d,p)=>{var b=Z.join2(typeof s=="string"?s:f.getPath(s),a),v=f.getMode(d,p);return f.create(b,v)},createDataFile:(s,a,u,d,p,b)=>{var v=a;s&&(s=typeof s=="string"?s:f.getPath(s),v=a?Z.join2(s,a):s);var y=f.getMode(d,p),A=f.create(v,y);if(u){if(typeof u=="string"){for(var O=new Array(u.length),F=0,V=u.length;F<V;++F)O[F]=u.charCodeAt(F);u=O}f.chmod(A,y|146);var G=f.open(A,577);f.write(G,u,0,u.length,0,b),f.close(G),f.chmod(A,y)}return A},createDevice:(s,a,u,d)=>{var p=Z.join2(typeof s=="string"?s:f.getPath(s),a),b=f.getMode(!!u,!!d);f.createDevice.major||(f.createDevice.major=64);var v=f.makedev(f.createDevice.major++,0);return f.registerDevice(v,{open:y=>{y.seekable=!1},close:y=>{d&&d.buffer&&d.buffer.length&&d(10)},read:(y,A,O,F,V)=>{for(var G=0,U=0;U<F;U++){var k;try{k=u()}catch{throw new f.ErrnoError(29)}if(k===void 0&&G===0)throw new f.ErrnoError(6);if(k==null)break;G++,A[O+U]=k}return G&&(y.node.timestamp=Date.now()),G},write:(y,A,O,F,V)=>{for(var G=0;G<F;G++)try{d(A[O+G])}catch{throw new f.ErrnoError(29)}return F&&(y.node.timestamp=Date.now()),G}}),f.mkdev(p,b,v)},forceLoadFile:s=>{if(s.isDevice||s.isFolder||s.link||s.contents)return!0;if(typeof XMLHttpRequest<"u")throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");if(T)try{s.contents=Mn(T(s.url),!0),s.usedBytes=s.contents.length}catch{throw new f.ErrnoError(29)}else throw new Error("Cannot load without read() or XMLHttpRequest.")},createLazyFile:(s,a,u,d,p)=>{function b(){this.lengthKnown=!1,this.chunks=[]}if(b.prototype.get=function(U){if(!(U>this.length-1||U<0)){var k=U%this.chunkSize,K=U/this.chunkSize|0;return this.getter(K)[k]}},b.prototype.setDataGetter=function(U){this.getter=U},b.prototype.cacheLength=function(){var U=new XMLHttpRequest;if(U.open("HEAD",u,!1),U.send(null),!(U.status>=200&&U.status<300||U.status===304))throw new Error("Couldn't load "+u+". Status: "+U.status);var k=Number(U.getResponseHeader("Content-length")),K,Ue=(K=U.getResponseHeader("Accept-Ranges"))&&K==="bytes",ut=(K=U.getResponseHeader("Content-Encoding"))&&K==="gzip",ct=1024*1024;Ue||(ct=k);var ft=(gt,Pn)=>{if(gt>Pn)throw new Error("invalid range ("+gt+", "+Pn+") or no bytes requested!");if(Pn>k-1)throw new Error("only "+k+" bytes available! programmer error!");var ze=new XMLHttpRequest;if(ze.open("GET",u,!1),k!==ct&&ze.setRequestHeader("Range","bytes="+gt+"-"+Pn),ze.responseType="arraybuffer",ze.overrideMimeType&&ze.overrideMimeType("text/plain; charset=x-user-defined"),ze.send(null),!(ze.status>=200&&ze.status<300||ze.status===304))throw new Error("Couldn't load "+u+". Status: "+ze.status);return ze.response!==void 0?new Uint8Array(ze.response||[]):Mn(ze.responseText||"",!0)},fr=this;fr.setDataGetter(gt=>{var Pn=gt*ct,ze=(gt+1)*ct-1;if(ze=Math.min(ze,k-1),typeof fr.chunks[gt]>"u"&&(fr.chunks[gt]=ft(Pn,ze)),typeof fr.chunks[gt]>"u")throw new Error("doXHR failed!");return fr.chunks[gt]}),(ut||!k)&&(ct=k=1,k=this.getter(0).length,ct=k,R("LazyFiles on gzip forces download of the whole file when length is accessed")),this._length=k,this._chunkSize=ct,this.lengthKnown=!0},typeof XMLHttpRequest<"u"){if(!g)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var v=new b;Object.defineProperties(v,{length:{get:function(){return this.lengthKnown||this.cacheLength(),this._length}},chunkSize:{get:function(){return this.lengthKnown||this.cacheLength(),this._chunkSize}}});var y={isDevice:!1,contents:v}}else var y={isDevice:!1,url:u};var A=f.createFile(s,a,y,d,p);y.contents?A.contents=y.contents:y.url&&(A.contents=null,A.url=y.url),Object.defineProperties(A,{usedBytes:{get:function(){return this.contents.length}}});var O={},F=Object.keys(A.stream_ops);F.forEach(G=>{var U=A.stream_ops[G];O[G]=function(){return f.forceLoadFile(A),U.apply(null,arguments)}});function V(G,U,k,K,Ue){var ut=G.node.contents;if(Ue>=ut.length)return 0;var ct=Math.min(ut.length-Ue,K);if(ut.slice)for(var ft=0;ft<ct;ft++)U[k+ft]=ut[Ue+ft];else for(var ft=0;ft<ct;ft++)U[k+ft]=ut.get(Ue+ft);return ct}return O.read=(G,U,k,K,Ue)=>(f.forceLoadFile(A),V(G,U,k,K,Ue)),O.mmap=(G,U,k,K,Ue)=>{f.forceLoadFile(A);var ut=ln(U);if(!ut)throw new f.ErrnoError(48);return V(G,j,ut,U,k),{ptr:ut,allocated:!0}},A.stream_ops=O,A},createPreloadedFile:(s,a,u,d,p,b,v,y,A,O)=>{var F=a?Ge.resolve(Z.join2(s,a)):s,V="cp "+F;function G(U){function k(K){O&&O(),y||f.createDataFile(s,a,K,d,p,A),b&&b(),Ne(V)}Browser.handledByPreloadPlugin(U,F,k,()=>{v&&v(),Ne(V)})||k(U)}wn(V),typeof u=="string"?si(u,U=>G(U),v):G(u)},indexedDB:()=>window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB,DB_NAME:()=>"EM_FS_"+window.location.pathname,DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:(s,a,u)=>{a=a||(()=>{}),u=u||(()=>{});var d=f.indexedDB();try{var p=d.open(f.DB_NAME(),f.DB_VERSION)}catch(b){return u(b)}p.onupgradeneeded=()=>{R("creating db");var b=p.result;b.createObjectStore(f.DB_STORE_NAME)},p.onsuccess=()=>{var b=p.result,v=b.transaction([f.DB_STORE_NAME],"readwrite"),y=v.objectStore(f.DB_STORE_NAME),A=0,O=0,F=s.length;function V(){O==0?a():u()}s.forEach(G=>{var U=y.put(f.analyzePath(G).object.contents,G);U.onsuccess=()=>{A++,A+O==F&&V()},U.onerror=()=>{O++,A+O==F&&V()}}),v.onerror=u},p.onerror=u},loadFilesFromDB:(s,a,u)=>{a=a||(()=>{}),u=u||(()=>{});var d=f.indexedDB();try{var p=d.open(f.DB_NAME(),f.DB_VERSION)}catch(b){return u(b)}p.onupgradeneeded=u,p.onsuccess=()=>{var b=p.result;try{var v=b.transaction([f.DB_STORE_NAME],"readonly")}catch(G){u(G);return}var y=v.objectStore(f.DB_STORE_NAME),A=0,O=0,F=s.length;function V(){O==0?a():u()}s.forEach(G=>{var U=y.get(G);U.onsuccess=()=>{f.analyzePath(G).exists&&f.unlink(G),f.createDataFile(Z.dirname(G),Z.basename(G),U.result,!0,!0,!0),A++,A+O==F&&V()},U.onerror=()=>{O++,A+O==F&&V()}}),v.onerror=u},p.onerror=u}},Ae={DEFAULT_POLLMASK:5,calculateAt:function(s,a,u){if(Z.isAbs(a))return a;var d;if(s===-100)d=f.cwd();else{var p=Ae.getStreamFromFD(s);d=p.path}if(a.length==0){if(!u)throw new f.ErrnoError(44);return d}return Z.join2(d,a)},doStat:function(s,a,u){try{var d=s(a)}catch(p){if(p&&p.node&&Z.normalize(a)!==Z.normalize(f.getPath(p.node)))return-54;throw p}return te[u>>2]=d.dev,te[u+8>>2]=d.ino,te[u+12>>2]=d.mode,we[u+16>>2]=d.nlink,te[u+20>>2]=d.uid,te[u+24>>2]=d.gid,te[u+28>>2]=d.rdev,ue=[d.size>>>0,(W=d.size,+Math.abs(W)>=1?W>0?(Math.min(+Math.floor(W/4294967296),4294967295)|0)>>>0:~~+Math.ceil((W-+(~~W>>>0))/4294967296)>>>0:0)],te[u+40>>2]=ue[0],te[u+44>>2]=ue[1],te[u+48>>2]=4096,te[u+52>>2]=d.blocks,ue=[Math.floor(d.atime.getTime()/1e3)>>>0,(W=Math.floor(d.atime.getTime()/1e3),+Math.abs(W)>=1?W>0?(Math.min(+Math.floor(W/4294967296),4294967295)|0)>>>0:~~+Math.ceil((W-+(~~W>>>0))/4294967296)>>>0:0)],te[u+56>>2]=ue[0],te[u+60>>2]=ue[1],we[u+64>>2]=0,ue=[Math.floor(d.mtime.getTime()/1e3)>>>0,(W=Math.floor(d.mtime.getTime()/1e3),+Math.abs(W)>=1?W>0?(Math.min(+Math.floor(W/4294967296),4294967295)|0)>>>0:~~+Math.ceil((W-+(~~W>>>0))/4294967296)>>>0:0)],te[u+72>>2]=ue[0],te[u+76>>2]=ue[1],we[u+80>>2]=0,ue=[Math.floor(d.ctime.getTime()/1e3)>>>0,(W=Math.floor(d.ctime.getTime()/1e3),+Math.abs(W)>=1?W>0?(Math.min(+Math.floor(W/4294967296),4294967295)|0)>>>0:~~+Math.ceil((W-+(~~W>>>0))/4294967296)>>>0:0)],te[u+88>>2]=ue[0],te[u+92>>2]=ue[1],we[u+96>>2]=0,ue=[d.ino>>>0,(W=d.ino,+Math.abs(W)>=1?W>0?(Math.min(+Math.floor(W/4294967296),4294967295)|0)>>>0:~~+Math.ceil((W-+(~~W>>>0))/4294967296)>>>0:0)],te[u+104>>2]=ue[0],te[u+108>>2]=ue[1],0},doMsync:function(s,a,u,d,p){if(!f.isFile(a.node.mode))throw new f.ErrnoError(43);if(d&2)return 0;var b=ye.slice(s,s+u);f.msync(a,b,p,u,d)},varargs:void 0,get:function(){Ae.varargs+=4;var s=te[Ae.varargs-4>>2];return s},getStr:function(s){var a=ee(s);return a},getStreamFromFD:function(s){var a=f.getStream(s);if(!a)throw new f.ErrnoError(8);return a}};function li(s,a,u){Ae.varargs=u;try{var d=Ae.getStreamFromFD(s);switch(a){case 0:{var p=Ae.get();if(p<0)return-28;var b;return b=f.createStream(d,p),b.fd}case 1:case 2:return 0;case 3:return d.flags;case 4:{var p=Ae.get();return d.flags|=p,0}case 5:{var p=Ae.get(),v=0;return Re[p+v>>1]=2,0}case 6:case 7:return 0;case 16:case 8:return-28;case 9:return Gt(28),-1;default:return-28}}catch(y){if(typeof f>"u"||!(y instanceof f.ErrnoError))throw y;return-y.errno}}function ui(s,a,u){Ae.varargs=u;try{var d=Ae.getStreamFromFD(s);switch(a){case 21509:case 21505:return d.tty?0:-59;case 21510:case 21511:case 21512:case 21506:case 21507:case 21508:return d.tty?0:-59;case 21519:{if(!d.tty)return-59;var p=Ae.get();return te[p>>2]=0,0}case 21520:return d.tty?-28:-59;case 21531:{var p=Ae.get();return f.ioctl(d,a,p)}case 21523:return d.tty?0:-59;case 21524:return d.tty?0:-59;default:return-28}}catch(b){if(typeof f>"u"||!(b instanceof f.ErrnoError))throw b;return-b.errno}}function ci(s,a,u,d){Ae.varargs=d;try{a=Ae.getStr(a),a=Ae.calculateAt(s,a);var p=d?Ae.get():0;return f.open(a,u,p).fd}catch(b){if(typeof f>"u"||!(b instanceof f.ErrnoError))throw b;return-b.errno}}function fi(){throw 1/0}function di(s,a,u){ye.copyWithin(s,a,a+u)}function ir(){return 2147483648}function ar(s){try{return D.grow(s-ie.byteLength+65535>>>16),He(D.buffer),1}catch{}}function va(s){var a=ye.length;s=s>>>0;var u=ir();if(s>u)return!1;let d=(A,O)=>A+(O-A%O)%O;for(var p=1;p<=4;p*=2){var b=a*(1+.2/p);b=Math.min(b,s+100663296);var v=Math.min(u,d(Math.max(s,b),65536)),y=ar(v);if(y)return!0}return!1}function mi(s){J=s,Zo()||(t.onExit&&t.onExit(s),H=!0),m(s,new oi(s))}function pi(s,a){J=s,mi(s)}var hi=pi;function _i(s){try{var a=Ae.getStreamFromFD(s);return f.close(a),0}catch(u){if(typeof f>"u"||!(u instanceof f.ErrnoError))throw u;return u.errno}}function gi(s,a,u,d){for(var p=0,b=0;b<u;b++){var v=we[a>>2],y=we[a+4>>2];a+=8;var A=f.read(s,j,v,y,d);if(A<0)return-1;if(p+=A,A<y)break}return p}function bi(s,a,u,d){try{var p=Ae.getStreamFromFD(s),b=gi(p,a,u);return we[d>>2]=b,0}catch(v){if(typeof f>"u"||!(v instanceof f.ErrnoError))throw v;return v.errno}}function Nr(s,a){return a+2097152>>>0<4194305-!!s?(s>>>0)+a*4294967296:NaN}function vi(s,a,u,d,p){try{var b=Nr(a,u);if(isNaN(b))return 61;var v=Ae.getStreamFromFD(s);return f.llseek(v,b,d),ue=[v.position>>>0,(W=v.position,+Math.abs(W)>=1?W>0?(Math.min(+Math.floor(W/4294967296),4294967295)|0)>>>0:~~+Math.ceil((W-+(~~W>>>0))/4294967296)>>>0:0)],te[p>>2]=ue[0],te[p+4>>2]=ue[1],v.getdents&&b===0&&d===0&&(v.getdents=null),0}catch(y){if(typeof f>"u"||!(y instanceof f.ErrnoError))throw y;return y.errno}}function Ur(s,a,u,d){for(var p=0,b=0;b<u;b++){var v=we[a>>2],y=we[a+4>>2];a+=8;var A=f.write(s,j,v,y,d);if(A<0)return-1;p+=A}return p}function xi(s,a,u,d){try{var p=Ae.getStreamFromFD(s),b=Ur(p,a,u);return we[d>>2]=b,0}catch(v){if(typeof f>"u"||!(v instanceof f.ErrnoError))throw v;return v.errno}}function yi(s){return s?(Gt(52),-1):0}function sr(s){var a=t["_"+s];return a}function Ye(s,a,u,d,p){var b={string:k=>{var K=0;if(k!=null&&k!==0){var Ue=(k.length<<2)+1;K=Sn(Ue),he(k,K,Ue)}return K},array:k=>{var K=Sn(k.length);return Or(k,K),K}};function v(k){return a==="string"?ee(k):a==="boolean"?!!k:k}var y=sr(s),A=[],O=0;if(d)for(var F=0;F<d.length;F++){var V=b[u[F]];V?(O===0&&(O=rt()),A[F]=V(d[F])):A[F]=d[F]}var G=y.apply(null,A);function U(k){return O!==0&&ot(O),v(k)}return G=U(G),G}function xa(s,a,u,d){u=u||[];var p=u.every(v=>v==="number"||v==="boolean"),b=a!=="string";return b&&p&&!d?sr(s):function(){return Ye(s,a,u,arguments,d)}}var wi=function(s,a,u,d){s||(s=this),this.parent=s,this.mount=s.mount,this.mounted=null,this.id=f.nextInode++,this.name=a,this.mode=u,this.node_ops={},this.stream_ops={},this.rdev=d},lr=365,ur=146;Object.defineProperties(wi.prototype,{read:{get:function(){return(this.mode&lr)===lr},set:function(s){s?this.mode|=lr:this.mode&=~lr}},write:{get:function(){return(this.mode&ur)===ur},set:function(s){s?this.mode|=ur:this.mode&=~ur}},isFolder:{get:function(){return f.isDir(this.mode)}},isDevice:{get:function(){return f.isChrdev(this.mode)}}}),f.FSNode=wi,f.staticInit();var ya={a:ii,r:ba,j:li,t:ui,u:ci,o:fi,v:di,p:va,w:hi,h:_i,s:bi,n:vi,i:xi,d:Pi,b:Mi,l:kr,k:Ti,e:Si,g:Fr,c:Sa,f:Lr,m:cr,q:yi},Eu=ri(),wa=t.___wasm_call_ctors=function(){return(wa=t.___wasm_call_ctors=t.asm.y).apply(null,arguments)},Ea=t._malloc=function(){return(Ea=t._malloc=t.asm.A).apply(null,arguments)},Ma=t._METIS_PartGraphKway=function(){return(Ma=t._METIS_PartGraphKway=t.asm.B).apply(null,arguments)},Ei=t.___errno_location=function(){return(Ei=t.___errno_location=t.asm.C).apply(null,arguments)},nt=t._setThrew=function(){return(nt=t._setThrew=t.asm.D).apply(null,arguments)},rt=t.stackSave=function(){return(rt=t.stackSave=t.asm.E).apply(null,arguments)},ot=t.stackRestore=function(){return(ot=t.stackRestore=t.asm.F).apply(null,arguments)},Sn=t.stackAlloc=function(){return(Sn=t.stackAlloc=t.asm.G).apply(null,arguments)};function Mi(s){var a=rt();try{return Ke(s)()}catch(u){if(ot(a),u!==u+0)throw u;nt(1,0)}}function Si(s,a,u,d,p,b,v){var y=rt();try{return Ke(s)(a,u,d,p,b,v)}catch(A){if(ot(y),A!==A+0)throw A;nt(1,0)}}function cr(s,a,u,d){var p=rt();try{Ke(s)(a,u,d)}catch(b){if(ot(p),b!==b+0)throw b;nt(1,0)}}function Fr(s,a,u,d,p,b,v,y,A){var O=rt();try{return Ke(s)(a,u,d,p,b,v,y,A)}catch(F){if(ot(O),F!==F+0)throw F;nt(1,0)}}function Lr(s,a,u){var d=rt();try{Ke(s)(a,u)}catch(p){if(ot(d),p!==p+0)throw p;nt(1,0)}}function kr(s,a,u){var d=rt();try{return Ke(s)(a,u)}catch(p){if(ot(d),p!==p+0)throw p;nt(1,0)}}function Sa(s,a){var u=rt();try{Ke(s)(a)}catch(d){if(ot(u),d!==d+0)throw d;nt(1,0)}}function Pi(s){var a=rt();try{return Ke(s)()}catch(u){if(ot(a),u!==u+0)throw u;nt(1,0)}}function Ti(s,a,u,d){var p=rt();try{return Ke(s)(a,u,d)}catch(b){if(ot(p),b!==b+0)throw b;nt(1,0)}}t.ccall=Ye,t.cwrap=xa;var Ct;an=function s(){Ct||Gr(),Ct||(an=s)};function Gr(s){if(s=s||l,Te>0||(At(),Te>0))return;function a(){Ct||(Ct=!0,t.calledRun=!0,!H&&(It(),r(t),t.onRuntimeInitialized&&t.onRuntimeInitialized(),rn()))}t.setStatus?(t.setStatus("Running..."),setTimeout(function(){setTimeout(function(){t.setStatus("")},1),a()},1)):a()}if(t.preInit)for(typeof t.preInit=="function"&&(t.preInit=[t.preInit]);t.preInit.length>0;)t.preInit.pop()();return Gr(),t.ready}})(),su=sm;var Wo,um={value:void 0};async function cm(){if(Wo!==void 0)return Wo;let n=await su({locateFile:e=>um.value||e});return Wo=n,n}function lu(){Wo=void 0}var fm=40,dm=1,mm=-2,pm=-3,hm=-4;function uu(n,e,t={}){let[r,o]=vm(n);return _m(r,o,e,t)}async function _m(n,e,t,r={}){let o=await cm(),i=S=>pe(new Int32Array(S)),l=S=>i([S]),c=n.length-1,m=1;t=Math.ceil(t);let h=new Int32Array(1),g=new Int32Array(c),_=gm(r),x=Vl(o,"number","METIS_PartGraphKway",[l(c),l(m),i(n),i(e),null,null,null,l(t),null,null,pe(_),pe(h,"out"),pe(g,"out")]);bm(x);let T=Ve(t).map(S=>[]);return g.forEach((S,w)=>{T[S].push(w)}),T}function gm(n){let e=new Int32Array(fm);return e.fill(-1),Object.entries(n).forEach(([t,r])=>{r!==void 0&&(e[parseInt(t,10)]=r)}),e}function bm(n){switch(n){case dm:return;case mm:throw new Error("[Metis error] METIS_ERROR_INPUT (Returned due to erroneous inputs and/or options)");case pm:throw new Error("[Metis error] METIS_ERROR_MEMORY (Returned due to insufficient memory)");case hm:default:throw new Error(`[Metis error] code=${n} (Some other error)`)}}function vm(n){let e=[],t=[0];for(let r=0;r<n.length;r++)e.push(...n[r]),t.push(e.length);return[t,e]}var xm=P.nanite.preprocess.useMapToFindAdjacentEdges?iu:ou,cu=!1,ym=1e-9,da=0,fu=n=>n.parentBounds===void 0;async function du(n,e,t){let r=P.nanite.preprocess,o=r.simplificationDecimateFactor,i=r.simplificationFactorRequirement,l=1-r.simplificationFactorRequirementBetweenLevels,c=r.simplificationTargetErrorMultiplier,m=r.maxLods;da=0;let h=Em(e),g=[],_=0,x=bn(n.positions,e).sphere,S=await R(e,0,[],x);_+=1;let w=P.nanite.preprocess.simplificationTargetError,E=-1;for(;_<m+1&&!(S.length<=1);_++){let L=Mm(S);if(L===E){console.warn(`LOD iteration failed to simplify even a single triangle at level ${_}. Stopping at ${S.length} meshlets.`);break}let D=_==1?"":`Previous level removed ${mt(E-L,E)} of the remaining triangles.`,J=1-L/E>=l;if(_>1&&!J){console.warn(`LOD iteration became too ineffective at level ${_}. ${D} Stopping at ${S.length} meshlets.`);break}console.log(`Creating LOD level ${_}. Starting with ${L} triangles (${S.length} meshlets). ${D}`),E=L;let re=4,oe=Math.ceil(S.length/re),B=[S];if(S.length>re){let X=xm(S.map(de=>de.boundaryEdges));B=(await uu(X,oe,{})).map(de=>de.map(ie=>S[ie]))}cu&&console.log(`[LOD ${_}] Starting with ${S.length} meshlets.`,"Partition into groups of <=4 meshlets:",B);let ee=[];for(let X of B){let he=wm(...X),de=Yl(he.length,o),ie=await Vo(n,he,{targetIndexCount:de,targetError:w,lockBorders:!0}),j=Ce(he),ye=Ce(ie.indexBuffer),Re=ye/j;if(Re>i){console.warn(`Part of the mesh could not be simplified more (LOD level=${_}). Reduced from ${j} to ${mt(ye,j)} triangles`);continue}let st=Math.max(ie.error*ie.errorScale,ym),te=Math.max(...X.map(He=>He.maxSiblingsError)),we=st+te,et=bn(n.positions,he).sphere,qe;B.length===1?qe=[await C(ie.indexBuffer,we,X,et)]:qe=await R(ie.indexBuffer,we,X,et),cu&&console.log(`	Try simplify (intial=${Ce(he)} into target=${Ce(de)} tris), got ${Ce(ie.indexBuffer)} tris (${(100*Re).toFixed(2)}%).`,"Meshlets:",qe),X.forEach(He=>{He.parentError=we,He.parentBounds=et}),ee.push(...qe)}if(_==1&&ee.length==0)throw new ma(_-1,n.vertexCount);S=ee,w*=c}return lu(),g;async function R(L,D,H,J){let re=await zo(n,L,{maxVertices:P.nanite.preprocess.meshletMaxVertices,maxTriangles:P.nanite.preprocess.meshletMaxTriangles,coneWeight:P.nanite.preprocess.meshletBackfaceCullingConeWeight}),oe=jl(re);return await Promise.all(oe.map(ee=>C(ee,D,H,J)))}async function C(L,D,H,J){let re=nu(L),oe=ru(re),B={id:da,indices:L,boundaryEdges:oe,maxSiblingsError:D,parentError:1/0,sharedSiblingsBounds:J,parentBounds:void 0,lodLevel:_,createdFrom:H};return da+=1,g.push(B),await N(),B}async function N(){let L=pn(g.length/h,0,1);await t?.(L)}}function wm(...n){let e=n.reduce((o,i)=>o+i.indices.length,0),t=new Uint32Array(e),r=0;return n.forEach(o=>{o.indices.forEach(i=>{t[r]=i,r+=1})}),t}function Em(n){let r=n.length/le,o=Math.ceil(r/P.nanite.preprocess.meshletMaxTriangles)*1.5,i=o;for(;o>1;){let l=Math.floor(o*.66);i+=l,o=l}return i}var ma=class extends Error{constructor(e,t){super(`Failed to simplify the mesh. Was not able to simplify beyond LOD level ${e}. This usually happens if you have duplicated vertices (${t}, should roughly match Blender's). One cause could be a flat shading or tons of UV islands.`)}};function Mm(n){let e=n.reduce((t,r)=>t+r.indices.length,0);return Ce(e)}var Zt=n=>{throw new Error(`Internal error, invalid nanite LOD tree. ${n}`)};function Yo(n){let e=[...n.roots],t=new Set([]);for(;e.length>0;){let r=e.pop();t.has(r.id)||(t.add(r.id),Pm(r.createdFrom),Sm(r),Tm(n,r),r.createdFrom.forEach(o=>{e.push(o)}))}t.size!==n.meshletCount&&Zt(`Some meshlets were not added to LOD tree. Tree contains ${t.size} nodes, while expected ${n.meshletCount}`)}function Sm(n){let e=n.maxSiblingsError;n.createdFrom.forEach(t=>{let r=t.maxSiblingsError;e<=r&&Zt(`The error should increase as we go higher. My error if ${e}, while child's is ${r} (+${r-e})`)})}function Pm(n){if(n.length<=1)return;let e=n[0];for(let t=1;t<n.length;t++){let r=n[t];al(r.parentBounds,e.parentBounds)||Zt("Meshlets should have same 'parentBounds'"),!P.isTest&&r.parentError!==e.parentError&&Zt("Meshlets should have same 'parentError'")}}function Tm(n,e){n.roots.includes(e)?(isFinite(e.parentError)&&Zt(`Root node should have parent error INFINITY, was ${e.parentError}`),e.parentBounds!==void 0&&Zt(`Root node should have no parent bounds, was ${JSON.stringify(e.parentBounds)}`)):(!P.isTest&&!isFinite(e.parentError)&&Zt("Child node should have valid parent error, was INFINITY"),e.parentBounds===void 0&&Zt("Child node should have valid parent bounds"))}function mu(n,e,t,r,o,i,l){let c=new qn(n,e,t,r,o,i.count),m=new $n(e,r.bounds,t,c,l,i),h=0,g=0,_=Ve(m.meshletCount),T=o.filter(fu).map(S=>[void 0,S]);for(;T.length>0;){let[S,w]=T.shift();if(m.contains(w.id))continue;let E=bn(r.positions,w.indices),R=m.addMeshlet(S,w,h/q,E);n.queue.writeBuffer(c.indexBuffer,h,w.indices,0),h+=Yr(R.triangleCount),_[w.id]=g,g+=1,w.createdFrom.forEach(C=>{C&&T.push([R,C])})}if(o.length!==m.allMeshlets.length)throw new Error(`Created ${o.length} meshlets, but only ${m.allMeshlets.length} were added to the LOD tree? Please verify '.createdFrom' for all meshlets.`);return m.allMeshlets.forEach(S=>{S.id=_[S.id]}),m.finalizeNaniteObject(n),Yo(m),P.isTest||m.printStats(),m}var yn=Cu(pu());async function hu(n,e,t,r){let o=await er(),i=r.length,[l,c]=Am(o,n,e,t,r,i),m=Im(o,r,i,c);return[Rm(o,n,e,t,l,c),m]}function Am(n,e,t,r,o,i){let l=new Uint32Array(i);return[Pt(n,"number","meshopt_generateVertexRemap",[pe(l,"out"),pe(o),i,pe(e),t,r]),l]}function Im(n,e,t,r){let o=new Uint32Array(t);return Pt(n,"number","meshopt_remapIndexBuffer",[pe(o,"out"),pe(e),t,pe(r)]),o}function Rm(n,e,t,r,o,i){let l=new Float32Array(o*r/Pe);return Pt(n,"number","meshopt_remapVertexBuffer",[pe(l,"out"),pe(e),t,r,pe(i)]),l}var Cm=yn.default?.Mesh||yn.Mesh,qo=yn.default?.Layout||yn.Layout,_u=n=>Math.ceil(n.vertices.length/3);async function gu(n,e){let t=new Cm(n);Om(t,e);let r=Vt(t.vertices),o=_r(Uint32Array,t.indices),i=new qo(qo.POSITION,qo.NORMAL,qo.UV),l=t.makeBufferData(i),c=new Float32Array(l),m=i.stride,h=m/Pe,[g,_]=await hu(c,r,m,o),x=pa(g,h);return{vertexCount:x.vertexCount,positions:x.positions,positionsStride:mr,normals:x.normals,uv:x.uv,indices:_,indicesCount:_.length,verticesAndAttributes:g,verticesAndAttributesStride:m,bounds:bn(x.positions)}}var Bm=n=>{if(!n.vertexNormals||!Array.isArray(n.vertexNormals))return!1;let e=n.vertexNormals[0];return typeof e=="number"&&!isNaN(e)},Dm=n=>{if(!n.textures||!Array.isArray(n.textures))return!1;let e=n.textures[0];return typeof e=="number"&&!isNaN(e)};function Om(n,e){if(n.vertices=n.vertices.map(t=>t*e),Bm(n)||Nm(n),Dm(n))for(let t=0;t<n.textures.length;t+=1){let r=n.textures[t];r=r%1,r=r<0?1-Math.abs(r):r,r=(t&1)==1?1-r:r,n.textures[t]=r}else{let t=_u(n);n.textures=Ve(t*2).fill(.5)}}function Nm(n){let e=_u(n);n.vertexNormals=Ve(e*3).fill(0);let t=l=>n.vertices[3*l],r=l=>n.vertices[3*l+1],o=l=>n.vertices[3*l+2];for(let l=0;l<n.indices.length;l+=3){let c=n.indices[l],m=n.indices[l+1],h=n.indices[l+2],g=(r(m)-r(c))*(o(h)-o(c))-(o(m)-o(c))*(r(h)-r(c)),_=(o(m)-o(c))*(t(h)-t(c))-(t(m)-t(c))*(o(h)-o(c)),x=(t(m)-t(c))*(r(h)-r(c))-(r(m)-r(c))*(t(h)-t(c));for(let T=0;T<3;++T){let S=n.indices[l+T];n.vertexNormals[S*3+0]+=g,n.vertexNormals[S*3+1]+=_,n.vertexNormals[S*3+2]+=x}}let i=Y.create();for(let l=0;l<e;l++){let c=Y.set(n.vertexNormals[l*3+0],n.vertexNormals[l*3+1],n.vertexNormals[l*3+2],i);i=Y.normalize(c,i),n.vertexNormals[l*3+0]=i[0],n.vertexNormals[l*3+1]=i[1],n.vertexNormals[l*3+2]=i[2]}}function pa(n,e=8){let t=n.length/e,r=new Float32Array(t*3),o=new Float32Array(t*3),i=new Float32Array(t*2);for(let l=0;l<t;l++){let c=l*e;r[3*l+0]=n[c+0],r[3*l+1]=n[c+1],r[3*l+2]=n[c+2],o[3*l+0]=n[c+3],o[3*l+1]=n[c+4],o[3*l+2]=n[c+5],i[2*l+0]=n[c+6],i[2*l+1]=n[c+7]}return{vertexCount:t,positions:r,normals:o,uv:i}}function Xo(n,e,t){let r=Xr(n,`${e}-original-vertices`,t.positions),o=Xr(n,`${e}-original-normals`,t.normals),i=Xr(n,`${e}-original-uvs`,t.uv,GPUBufferUsage.STORAGE);return{indexBuffer:gr(n,`${e}-original-indices`,t.indices),uvBuffer:i,normalsBuffer:o,vertexBuffer:r,vertexCount:Vt(t.positions),triangleCount:Ce(t.indices)}}function bu(n){let e=t=>{let r=n.find(o=>o.id===t);if(r==null)throw new tr(`CreatedFrom node with id='${t}' does not exist`);return r};return n.forEach(t=>{t.createdFrom=t.createdFrom.map(e),t.parentError===null&&(t.parentError=1/0)}),n}var tr=class extends Error{constructor(e){super(`Invalid file to import. ${e}`)}};async function vu(n,e){let{device:t,instances:r,name:o,objectDef:i,progressCb:l,addTimer:c}=n,m=$e(),h=JSON.parse(e);c("JSON parsing",m);let g=ms(`${pr}/${i.file}`,".bin"),_=await Um(h,g),x=pa(_.verticesAndAttributes),T={...h.parsedMesh,positions:Ot(Float32Array,x.positions),normals:Ot(Float32Array,x.normals),uv:Ot(Float32Array,x.uv),verticesAndAttributes:Ot(Float32Array,_.verticesAndAttributes),indices:Ot(Uint32Array,_.indices)},S=Xo(t,o,T),w=new qn(t,o,S,T,h.allMeshlets.map(N=>({indices:N.triangleCount*3,lodLevel:N.lodLevel})),r.count),E=await _a(n,o,S,T);await l?.(o,`Uploading '${o}' data to the GPU`),m=$e();let R=new $n(o,h.bounds,S,w,E,r);t.queue.writeBuffer(R.buffers.indexBuffer,0,_.meshletIndices,0);let C=bu(h.allMeshlets);return R.allMeshlets.push(...C),h.roots.forEach(N=>{let L=C.find(D=>D.id===N);if(L==null)throw new tr(`Root node with id='${N}' does not exist`);R.roots.push(L)}),R.lodLevelCount=C.reduce((N,L)=>Math.max(N,L.lodLevel),0)+1,R.finalizeNaniteObject(t),c("Finalize nanite object",m),Yo(R),P.isTest||R.printStats(),{originalMesh:S,parsedMesh:T,naniteObject:R}}async function Um(n,e){let t=n.parsedMesh,r=t.vertexCount*t.verticesAndAttributesStride,o=t.indicesCount*q,l=n.allMeshlets.reduce((x,T)=>x+T.triangleCount,0)*le*q,c=await P.loaders.binaryFileReader(e),m=0,h=new Float32Array(c.slice(m,m+r));m+=r,ha("vertex buffer",h,r);let g=new Uint32Array(c.slice(m,m+o));m+=o,ha("index buffer",g,o);let _=new Uint32Array(c.slice(m));return ha("meshlet indices buffer",_,l),{verticesAndAttributes:h,indices:g,meshletIndices:_}}function ha(n,e,t){if(e.byteLength!==t)throw new tr(`Invalid binary ${n}. Expected ${t} bytes, got ${e.byteLength}`)}async function xu(n,e,t,r,o){console.groupCollapsed(`Object '${e}'`),await o?.(e,`Loading object: '${e}'`);let i=$e(),l=[],c=(S,w)=>l.push(`${S}: ${Sr(w).toFixed(2)}ms`),m=Ho(e),h=await P.loaders.textFileReader(`${pr}/${m.file}`);c("File content fetch",i);let g=await Lm(n,c,m.texture),_={name:e,objectDef:m,device:n,instances:t,impostorRenderer:r,progressCb:o,addTimer:c,start:i,diffuseTextureView:g.diffuseTextureView},T=await(m.file.endsWith(".json")?vu(_,h):Fm(_,h));return T.naniteObject.diffuseTexture=g.diffuseTexture,T.naniteObject.diffuseTextureView=g.diffuseTextureView,c("---TOTAL---",i),console.log(`Object '${e}' loaded. Timers:`,l),console.groupEnd(),T}async function Fm(n,e){let{device:t,instances:r,name:o,objectDef:i,progressCb:l,addTimer:c}=n,m=$e(),h=await gu(e,i.scale);c("OBJ parsing",m),console.log(`Object '${o}': ${Vt(h.positions)} vertices, ${Ce(h.indices)} triangles`),sl(h.positions);let g=Xo(t,o,h);m=$e();let _=await du(h,h.indices,l!=null?S=>l(o,S):void 0);c("Nanite LOD tree build",m);let x=await _a(n,o,g,h);await l?.(o,`Uploading '${o}' data to the GPU`),m=$e();let T=mu(t,o,g,h,_,r,x);return c("Finalize nanite object",m),{originalMesh:g,parsedMesh:h,naniteObject:T}}async function _a(n,e,t,r){let{device:o,impostorRenderer:i,progressCb:l,addTimer:c,diffuseTextureView:m}=n;await l?.(e,"Creating impostors");let h=$e(),g=i.createImpostorTexture(o,{name:e,vertexBuffer:t.vertexBuffer,normalsBuffer:t.normalsBuffer,uvBuffer:t.uvBuffer,indexBuffer:t.indexBuffer,triangleCount:t.triangleCount,bounds:r.bounds.sphere,texture:m});return c("Creating impostors",h),g}async function Lm(n,e,t){if(!t)return{diffuseTexture:void 0,diffuseTextureView:void 0};let r=$e(),o=`${pr}/${t}`,i=GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT,l=await P.loaders.createTextureFromFile(n,o,"rgba8unorm-srgb",i);console.log(`Texture: '${o}'`);let c=l.createView();return e("Load texture",r),{diffuseTexture:l,diffuseTextureView:c}}async function yu(n,e,t,r){let o=Gm(n,e),i=Ql(n,Pr),l=i.createView(),c=Dr(n,"nearest"),m=Dr(n,"linear"),h=new jo(n,l),g,_=[],x=$e(),{enableProfiler:T}=P.nanite.preprocess;T&&console.profile("scene-loading");for(let E=0;E<o.length;E++){let R=o[E],C=await xu(n,R.model,R.instances,h,t);_.push(C.naniteObject),await r?.({...C,fileName:Ho(R.model).file}),g==null&&(g=await Xl(n,C.originalMesh,C.parsedMesh))}T&&console.profileEnd(),zm(_);let S=Sr(x);ne.update("Preprocessing",`${S.toFixed(0)}ms`);let w=km(_);return{naniteObjects:_,debugMeshes:g,fallbackDiffuseTexture:i,fallbackDiffuseTextureView:l,samplerNearest:c,samplerLinear:m,...w}}function km(n){let e=0,t=0,r=0,o=0,i=0,l=0,c=0,m=0,h=0,g=0;for(let x of n)e+=x.bottomTriangleCount*x.instancesCount,t+=x.bottomMeshletCount*x.instancesCount,r+=x.instancesCount,o+=x.roots.reduce((T,S)=>T+S.triangleCount,0)*x.instancesCount,i+=x.buffers.indexBuffer.size,l+=x.buffers.meshletsDataBuffer.size,c+=x.instances.transformsBuffer.size,m+=x.buffers.drawnInstancesBuffer.size,h+=x.buffers.drawnImpostorsBuffer.size,g+=x.buffers.drawnMeshletsBuffer.size;ne.update("Index buffer",$t(i)),ne.update("Meshlets data",$t(l)),ne.update("Instance tfxs",$t(c)),ne.update("Drawn instances",$t(m)),ne.update("Drawn impostors",$t(h)),ne.update("Drawn meshlets",$t(g)),ne.update("Scene meshlets",An(t,1)),ne.update("Scene triangles",An(e,1));let _=100*o/e;return console.log(`Scene simplification is ${_.toFixed(1)}% (${An(e)} -> ${An(o)} triangles)`),{naiveTriangleCount:e,naiveMeshletCount:t,totalInstancesCount:r}}function Gm(n,e){let t=Br[e],r=`Scene '${e}' is empty`;if(!t)throw new Error(`Scene '${e}' is empty`);if(Array.isArray(t)){if(t.length<1)throw new Error(r);return t.map(c=>{let m=sa(n,c.model,c.instances);return{model:c.model,instances:m}})}let{models:o,instances:i}=t,l=sa(n,e,i);return o.map(c=>({model:c,instances:l}))}function zm(n){let e=new Set;n.forEach((t,r)=>{for(;e.has(t.name);)t.name+=r})}var nr={sceneFile:"scene_file",softwareRasterizerThreshold:"softwarerasterizer_threshold",impostorsThreshold:"impostors_threshold",impostorsTextureSize:"impostors_texturesize",impostorsForceOnlyBillboards:"impostors_forceonlybillboards",naniteErrorThreshold:"nanite_errorthreshold"},ga=[];function wu(n,e){if(new URLSearchParams(window.location.search).forEach((r,o)=>{if(o=o.toLowerCase(),r=r.trim(),o===nr.sceneFile)Jl(r)?e=r:console.warn(`Invalid scene name '${r}', try one of: `,Object.keys(Br));else if(o===nr.softwareRasterizerThreshold){let[i,l]=Ko(r);i&&(l===0?n.softwareRasterizer.enabled=!1:n.softwareRasterizer.threshold=Math.abs(l))}else if(o===nr.impostorsThreshold){let[i,l]=Ko(r);i&&(n.impostors.billboardThreshold=Math.abs(l))}else if(o===nr.impostorsTextureSize){let[i,l]=Ko(r);i&&(n.impostors.textureSize=Math.abs(l))}else if(o===nr.naniteErrorThreshold){let[i,l]=Ko(r);i&&(n.nanite.render.errorThreshold=Math.abs(l))}else o===nr.impostorsForceOnlyBillboards?n.impostors.forceOnlyBillboards=!0:ga.push(o)}),!P.isTest){if(ga.length>0){let r=ga.join(", ");console.warn(`Unrecognised query params: [${r}]`)}console.log(`Loading scene '${e}', config: `,n)}return e}function Ko(n){if(typeof n!="string")return[!1,0];let e=parseFloat(n);return[!isNaN(e)&&isFinite(e),e]}var Vm="jinxCombined";(async function(){let n=wu(P,Vm),e=await ps();if(!e){Jo();return}let t=Ll(e);t.startErrorScope("init");let r=navigator.gpu.getPreferredCanvasFormat(),[o,i]=$m("#gpuCanvas",e,r),l=Fl(o,i),c=$s(window,o),m,h=null;try{h=document.getElementById("loader-wrapper"),Nt(h),m=await Hm(e,n)}catch(R){throw Jo(R.message),R}finally{In(h)}let g=new to(e),_=new Go(e,l.getViewportSize(),r,g);l.addListener(_.onCanvasResize),zs(g,m,_.cameraCtrl),ne.show();let x=!1,T=await t.reportErrorScopeAsync();if(T){Jo(T);return}let S={label:"main-frame-cmd-buffer"},w=()=>{t.startErrorScope("frame"),ne.onEndFrame(),ne.onBeginFrame(),g.beginFrame();let R=ne.deltaTimeMS*ss;l.revalidateCanvasSize();let C=c();_.updateCamera(R,C);let N=e.createCommandEncoder(S),L=l.getScreenTextureView();_.cmdRender(N,m,L),g.endFrame(N),e.queue.submit([N.finish()]),g.scheduleRaportIfNeededAsync(Vs),P.nanite.render.nextFrameDebugDrawnMeshletsBuffer&&(P.nanite.render.nextFrameDebugDrawnMeshletsBuffer=!1,jm(e,m)),x||(t.reportErrorScopeAsync(E),requestAnimationFrame(w))};requestAnimationFrame(w);function E(R){throw Jo(R),x=!0,new Error(R)}})();function $m(n,e,t){let r=document.querySelector(n),o=r.getContext("webgpu");return o.configure({device:e,format:t,alphaMode:"premultiplied"}),[r,o]}function Hm(n,e){let t=document.getElementById("loader-text"),r=l=>(t!=null&&(t.textContent=l),new Promise(c=>setTimeout(c))),o=-1;return yu(n,e,async(l,c)=>{if(typeof c=="string")await r(c);else{let m=Math.floor(c*100);m!==o&&m%10===0&&(o=m,await r(`Loading '${l}': ${m}%`))}})}function Jo(n){In(document.getElementById("gpuCanvas")),Nt(document.getElementById("no-webgpu"),"flex"),n&&(document.getElementById("error-msg").textContent=n)}function jm(n,e){Ym(n,e),Wm(n,e)}async function Wm(n,e){let t=0,r=0,o=e.naniteObjects.map(async i=>{let l=await _l(n,i);t+=i.instancesCount,r+=l.impostorCount});await Promise.all(o),ks(r,t)}async function Ym(n,e){let t=0,r=0,o=0,i=0,l=0,c=0,m=e.naniteObjects.map(async h=>{let{hardwareRaster:g,softwareRaster:_}=await il(n,h);t+=g.meshletCount+_.meshletCount,o+=g.meshletCount,l+=_.meshletCount;let x=T=>{let S=h.find(T);return S?S.triangleCount:0};for(let T=0;T<g.meshletCount;T++){let S=g.meshletIds[T].meshletId,w=x(S);r+=w,i+=w}for(let T=0;T<_.meshletCount;T++){let S=_.meshletIds[T].meshletId,w=x(S);r+=w,c+=w}});await Promise.all(m),ro(e,t,r),Ls(o,i,l,c)}setInterval(Xm,1e3);var qm=document.getElementById("software-rasterizer");function Xm(){let n=P.softwareRasterizer.enabled,e=jr();cs(qm,n&&!e)}})();
//# sourceMappingURL=index.web.js.map
