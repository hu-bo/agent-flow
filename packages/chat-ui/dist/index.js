import { jsxs as q, jsx as A, Fragment as ya } from "react/jsx-runtime";
import { useState as Ke, useRef as Ln, useEffect as xt, useMemo as un, Children as gs, isValidElement as hs } from "react";
function ms(e, n) {
  const t = {};
  return (e[e.length - 1] === "" ? [...e, ""] : e).join(
    (t.padRight ? " " : "") + "," + (t.padLeft === !1 ? "" : " ")
  ).trim();
}
const bs = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, Es = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, ys = {};
function si(e, n) {
  return (ys.jsx ? Es : bs).test(e);
}
const _s = /[ \t\n\f\r]/g;
function ks(e) {
  return typeof e == "object" ? e.type === "text" ? li(e.value) : !1 : li(e);
}
function li(e) {
  return e.replace(_s, "") === "";
}
class nt {
  /**
   * @param {SchemaType['property']} property
   *   Property.
   * @param {SchemaType['normal']} normal
   *   Normal.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Schema.
   */
  constructor(n, t, r) {
    this.normal = t, this.property = n, r && (this.space = r);
  }
}
nt.prototype.normal = {};
nt.prototype.property = {};
nt.prototype.space = void 0;
function _a(e, n) {
  const t = {}, r = {};
  for (const i of e)
    Object.assign(t, i.property), Object.assign(r, i.normal);
  return new nt(t, r, n);
}
function fr(e) {
  return e.toLowerCase();
}
class De {
  /**
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @returns
   *   Info.
   */
  constructor(n, t) {
    this.attribute = t, this.property = n;
  }
}
De.prototype.attribute = "";
De.prototype.booleanish = !1;
De.prototype.boolean = !1;
De.prototype.commaOrSpaceSeparated = !1;
De.prototype.commaSeparated = !1;
De.prototype.defined = !1;
De.prototype.mustUseProperty = !1;
De.prototype.number = !1;
De.prototype.overloadedBoolean = !1;
De.prototype.property = "";
De.prototype.spaceSeparated = !1;
De.prototype.space = void 0;
let ws = 0;
const j = Nn(), xe = Nn(), pr = Nn(), R = Nn(), he = Nn(), wn = Nn(), $e = Nn();
function Nn() {
  return 2 ** ++ws;
}
const gr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  boolean: j,
  booleanish: xe,
  commaOrSpaceSeparated: $e,
  commaSeparated: wn,
  number: R,
  overloadedBoolean: pr,
  spaceSeparated: he
}, Symbol.toStringTag, { value: "Module" })), Wt = (
  /** @type {ReadonlyArray<keyof typeof types>} */
  Object.keys(gr)
);
class Ir extends De {
  /**
   * @constructor
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @param {number | null | undefined} [mask]
   *   Mask.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Info.
   */
  constructor(n, t, r, i) {
    let o = -1;
    if (super(n, t), ci(this, "space", i), typeof r == "number")
      for (; ++o < Wt.length; ) {
        const a = Wt[o];
        ci(this, Wt[o], (r & gr[a]) === gr[a]);
      }
  }
}
Ir.prototype.defined = !0;
function ci(e, n, t) {
  t && (e[n] = t);
}
function Pn(e) {
  const n = {}, t = {};
  for (const [r, i] of Object.entries(e.properties)) {
    const o = new Ir(
      r,
      e.transform(e.attributes || {}, r),
      i,
      e.space
    );
    e.mustUseProperty && e.mustUseProperty.includes(r) && (o.mustUseProperty = !0), n[r] = o, t[fr(r)] = r, t[fr(o.attribute)] = r;
  }
  return new nt(n, t, e.space);
}
const ka = Pn({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: xe,
    ariaAutoComplete: null,
    ariaBusy: xe,
    ariaChecked: xe,
    ariaColCount: R,
    ariaColIndex: R,
    ariaColSpan: R,
    ariaControls: he,
    ariaCurrent: null,
    ariaDescribedBy: he,
    ariaDetails: null,
    ariaDisabled: xe,
    ariaDropEffect: he,
    ariaErrorMessage: null,
    ariaExpanded: xe,
    ariaFlowTo: he,
    ariaGrabbed: xe,
    ariaHasPopup: null,
    ariaHidden: xe,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: he,
    ariaLevel: R,
    ariaLive: null,
    ariaModal: xe,
    ariaMultiLine: xe,
    ariaMultiSelectable: xe,
    ariaOrientation: null,
    ariaOwns: he,
    ariaPlaceholder: null,
    ariaPosInSet: R,
    ariaPressed: xe,
    ariaReadOnly: xe,
    ariaRelevant: null,
    ariaRequired: xe,
    ariaRoleDescription: he,
    ariaRowCount: R,
    ariaRowIndex: R,
    ariaRowSpan: R,
    ariaSelected: xe,
    ariaSetSize: R,
    ariaSort: null,
    ariaValueMax: R,
    ariaValueMin: R,
    ariaValueNow: R,
    ariaValueText: null,
    role: null
  },
  transform(e, n) {
    return n === "role" ? n : "aria-" + n.slice(4).toLowerCase();
  }
});
function wa(e, n) {
  return n in e ? e[n] : n;
}
function xa(e, n) {
  return wa(e, n.toLowerCase());
}
const xs = Pn({
  attributes: {
    acceptcharset: "accept-charset",
    classname: "class",
    htmlfor: "for",
    httpequiv: "http-equiv"
  },
  mustUseProperty: ["checked", "multiple", "muted", "selected"],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: wn,
    acceptCharset: he,
    accessKey: he,
    action: null,
    allow: null,
    allowFullScreen: j,
    allowPaymentRequest: j,
    allowUserMedia: j,
    alpha: j,
    alt: null,
    as: null,
    async: j,
    autoCapitalize: null,
    autoComplete: he,
    autoFocus: j,
    autoPlay: j,
    blocking: he,
    capture: null,
    charSet: null,
    checked: j,
    cite: null,
    className: he,
    closedBy: null,
    colorSpace: null,
    cols: R,
    colSpan: R,
    command: null,
    commandFor: null,
    content: null,
    contentEditable: xe,
    controls: j,
    controlsList: he,
    coords: R | wn,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: j,
    defer: j,
    dir: null,
    dirName: null,
    disabled: j,
    download: pr,
    draggable: xe,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: j,
    formTarget: null,
    headers: he,
    height: R,
    hidden: pr,
    high: R,
    href: null,
    hrefLang: null,
    htmlFor: he,
    httpEquiv: he,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: j,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: j,
    itemId: null,
    itemProp: he,
    itemRef: he,
    itemScope: j,
    itemType: he,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: j,
    low: R,
    manifest: null,
    max: null,
    maxLength: R,
    media: null,
    method: null,
    min: null,
    minLength: R,
    multiple: j,
    muted: j,
    name: null,
    nonce: null,
    noModule: j,
    noValidate: j,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforeMatch: null,
    onBeforePrint: null,
    onBeforeToggle: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextLost: null,
    onContextMenu: null,
    onContextRestored: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onScrollEnd: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: j,
    optimum: R,
    pattern: null,
    ping: he,
    placeholder: null,
    playsInline: j,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: j,
    referrerPolicy: null,
    rel: he,
    required: j,
    reversed: j,
    rows: R,
    rowSpan: R,
    sandbox: he,
    scope: null,
    scoped: j,
    seamless: j,
    selected: j,
    shadowRootClonable: j,
    shadowRootCustomElementRegistry: j,
    shadowRootDelegatesFocus: j,
    shadowRootMode: null,
    shadowRootSerializable: j,
    shape: null,
    size: R,
    sizes: null,
    slot: null,
    span: R,
    spellCheck: xe,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: R,
    step: null,
    style: null,
    tabIndex: R,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: j,
    useMap: null,
    value: xe,
    width: R,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: he,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: R,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: R,
    // `<body>`
    cellPadding: null,
    // `<table>`
    cellSpacing: null,
    // `<table>`
    char: null,
    // Several table elements. When `align=char`, sets the character to align on
    charOff: null,
    // Several table elements. When `char`, offsets the alignment
    classId: null,
    // `<object>`
    clear: null,
    // `<br>`. Use CSS `clear` instead
    code: null,
    // `<object>`
    codeBase: null,
    // `<object>`
    codeType: null,
    // `<object>`
    color: null,
    // `<font>` and `<hr>`. Use CSS instead
    compact: j,
    // Lists. Use CSS to reduce space between items instead
    declare: j,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: R,
    // `<img>` and `<object>`
    leftMargin: R,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: R,
    // `<body>`
    marginWidth: R,
    // `<body>`
    noResize: j,
    // `<frame>`
    noHref: j,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: j,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: j,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: R,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: xe,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: R,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: R,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    credentialless: j,
    disablePictureInPicture: j,
    disableRemotePlayback: j,
    exportParts: wn,
    part: he,
    prefix: null,
    property: null,
    results: R,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: xa
}), Ns = Pn({
  attributes: {
    accentHeight: "accent-height",
    alignmentBaseline: "alignment-baseline",
    arabicForm: "arabic-form",
    baselineShift: "baseline-shift",
    capHeight: "cap-height",
    className: "class",
    clipPath: "clip-path",
    clipRule: "clip-rule",
    colorInterpolation: "color-interpolation",
    colorInterpolationFilters: "color-interpolation-filters",
    colorProfile: "color-profile",
    colorRendering: "color-rendering",
    crossOrigin: "crossorigin",
    dataType: "datatype",
    dominantBaseline: "dominant-baseline",
    enableBackground: "enable-background",
    fillOpacity: "fill-opacity",
    fillRule: "fill-rule",
    floodColor: "flood-color",
    floodOpacity: "flood-opacity",
    fontFamily: "font-family",
    fontSize: "font-size",
    fontSizeAdjust: "font-size-adjust",
    fontStretch: "font-stretch",
    fontStyle: "font-style",
    fontVariant: "font-variant",
    fontWeight: "font-weight",
    glyphName: "glyph-name",
    glyphOrientationHorizontal: "glyph-orientation-horizontal",
    glyphOrientationVertical: "glyph-orientation-vertical",
    hrefLang: "hreflang",
    horizAdvX: "horiz-adv-x",
    horizOriginX: "horiz-origin-x",
    horizOriginY: "horiz-origin-y",
    imageRendering: "image-rendering",
    letterSpacing: "letter-spacing",
    lightingColor: "lighting-color",
    markerEnd: "marker-end",
    markerMid: "marker-mid",
    markerStart: "marker-start",
    maskType: "mask-type",
    navDown: "nav-down",
    navDownLeft: "nav-down-left",
    navDownRight: "nav-down-right",
    navLeft: "nav-left",
    navNext: "nav-next",
    navPrev: "nav-prev",
    navRight: "nav-right",
    navUp: "nav-up",
    navUpLeft: "nav-up-left",
    navUpRight: "nav-up-right",
    onAbort: "onabort",
    onActivate: "onactivate",
    onAfterPrint: "onafterprint",
    onBeforePrint: "onbeforeprint",
    onBegin: "onbegin",
    onCancel: "oncancel",
    onCanPlay: "oncanplay",
    onCanPlayThrough: "oncanplaythrough",
    onChange: "onchange",
    onClick: "onclick",
    onClose: "onclose",
    onCopy: "oncopy",
    onCueChange: "oncuechange",
    onCut: "oncut",
    onDblClick: "ondblclick",
    onDrag: "ondrag",
    onDragEnd: "ondragend",
    onDragEnter: "ondragenter",
    onDragExit: "ondragexit",
    onDragLeave: "ondragleave",
    onDragOver: "ondragover",
    onDragStart: "ondragstart",
    onDrop: "ondrop",
    onDurationChange: "ondurationchange",
    onEmptied: "onemptied",
    onEnd: "onend",
    onEnded: "onended",
    onError: "onerror",
    onFocus: "onfocus",
    onFocusIn: "onfocusin",
    onFocusOut: "onfocusout",
    onHashChange: "onhashchange",
    onInput: "oninput",
    onInvalid: "oninvalid",
    onKeyDown: "onkeydown",
    onKeyPress: "onkeypress",
    onKeyUp: "onkeyup",
    onLoad: "onload",
    onLoadedData: "onloadeddata",
    onLoadedMetadata: "onloadedmetadata",
    onLoadStart: "onloadstart",
    onMessage: "onmessage",
    onMouseDown: "onmousedown",
    onMouseEnter: "onmouseenter",
    onMouseLeave: "onmouseleave",
    onMouseMove: "onmousemove",
    onMouseOut: "onmouseout",
    onMouseOver: "onmouseover",
    onMouseUp: "onmouseup",
    onMouseWheel: "onmousewheel",
    onOffline: "onoffline",
    onOnline: "ononline",
    onPageHide: "onpagehide",
    onPageShow: "onpageshow",
    onPaste: "onpaste",
    onPause: "onpause",
    onPlay: "onplay",
    onPlaying: "onplaying",
    onPopState: "onpopstate",
    onProgress: "onprogress",
    onRateChange: "onratechange",
    onRepeat: "onrepeat",
    onReset: "onreset",
    onResize: "onresize",
    onScroll: "onscroll",
    onSeeked: "onseeked",
    onSeeking: "onseeking",
    onSelect: "onselect",
    onShow: "onshow",
    onStalled: "onstalled",
    onStorage: "onstorage",
    onSubmit: "onsubmit",
    onSuspend: "onsuspend",
    onTimeUpdate: "ontimeupdate",
    onToggle: "ontoggle",
    onUnload: "onunload",
    onVolumeChange: "onvolumechange",
    onWaiting: "onwaiting",
    onZoom: "onzoom",
    overlinePosition: "overline-position",
    overlineThickness: "overline-thickness",
    paintOrder: "paint-order",
    panose1: "panose-1",
    pointerEvents: "pointer-events",
    referrerPolicy: "referrerpolicy",
    renderingIntent: "rendering-intent",
    shapeRendering: "shape-rendering",
    stopColor: "stop-color",
    stopOpacity: "stop-opacity",
    strikethroughPosition: "strikethrough-position",
    strikethroughThickness: "strikethrough-thickness",
    strokeDashArray: "stroke-dasharray",
    strokeDashOffset: "stroke-dashoffset",
    strokeLineCap: "stroke-linecap",
    strokeLineJoin: "stroke-linejoin",
    strokeMiterLimit: "stroke-miterlimit",
    strokeOpacity: "stroke-opacity",
    strokeWidth: "stroke-width",
    tabIndex: "tabindex",
    textAnchor: "text-anchor",
    textDecoration: "text-decoration",
    textRendering: "text-rendering",
    transformOrigin: "transform-origin",
    typeOf: "typeof",
    underlinePosition: "underline-position",
    underlineThickness: "underline-thickness",
    unicodeBidi: "unicode-bidi",
    unicodeRange: "unicode-range",
    unitsPerEm: "units-per-em",
    vAlphabetic: "v-alphabetic",
    vHanging: "v-hanging",
    vIdeographic: "v-ideographic",
    vMathematical: "v-mathematical",
    vectorEffect: "vector-effect",
    vertAdvY: "vert-adv-y",
    vertOriginX: "vert-origin-x",
    vertOriginY: "vert-origin-y",
    wordSpacing: "word-spacing",
    writingMode: "writing-mode",
    xHeight: "x-height",
    // These were camelcased in Tiny. Now lowercased in SVG 2
    playbackOrder: "playbackorder",
    timelineBegin: "timelinebegin"
  },
  properties: {
    about: $e,
    accentHeight: R,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: R,
    amplitude: R,
    arabicForm: null,
    ascent: R,
    attributeName: null,
    attributeType: null,
    azimuth: R,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: R,
    by: null,
    calcMode: null,
    capHeight: R,
    className: he,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: R,
    diffuseConstant: R,
    direction: null,
    display: null,
    dur: null,
    divisor: R,
    dominantBaseline: null,
    download: j,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: R,
    enableBackground: null,
    end: null,
    event: null,
    exponent: R,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: R,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: wn,
    g2: wn,
    glyphName: wn,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: R,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: R,
    horizOriginX: R,
    horizOriginY: R,
    id: null,
    ideographic: R,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: R,
    k: R,
    k1: R,
    k2: R,
    k3: R,
    k4: R,
    kernelMatrix: $e,
    kernelUnitLength: null,
    keyPoints: null,
    // SEMI_COLON_SEPARATED
    keySplines: null,
    // SEMI_COLON_SEPARATED
    keyTimes: null,
    // SEMI_COLON_SEPARATED
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: R,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskType: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: R,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: R,
    overlineThickness: R,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: R,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: he,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: R,
    pointsAtY: R,
    pointsAtZ: R,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: $e,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: $e,
    rev: $e,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: $e,
    requiredFeatures: $e,
    requiredFonts: $e,
    requiredFormats: $e,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: R,
    specularExponent: R,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: R,
    strikethroughThickness: R,
    string: null,
    stroke: null,
    strokeDashArray: $e,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: R,
    strokeOpacity: R,
    strokeWidth: null,
    style: null,
    surfaceScale: R,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: $e,
    tabIndex: R,
    tableValues: null,
    target: null,
    targetX: R,
    targetY: R,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: $e,
    to: null,
    transform: null,
    transformOrigin: null,
    u1: null,
    u2: null,
    underlinePosition: R,
    underlineThickness: R,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: R,
    values: null,
    vAlphabetic: R,
    vMathematical: R,
    vectorEffect: null,
    vHanging: R,
    vIdeographic: R,
    version: null,
    vertAdvY: R,
    vertOriginX: R,
    vertOriginY: R,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: R,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  },
  space: "svg",
  transform: wa
}), Na = Pn({
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  },
  space: "xlink",
  transform(e, n) {
    return "xlink:" + n.slice(5).toLowerCase();
  }
}), Sa = Pn({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: xa
}), va = Pn({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(e, n) {
    return "xml:" + n.slice(3).toLowerCase();
  }
}), Ss = {
  classId: "classID",
  dataType: "datatype",
  itemId: "itemID",
  strokeDashArray: "strokeDasharray",
  strokeDashOffset: "strokeDashoffset",
  strokeLineCap: "strokeLinecap",
  strokeLineJoin: "strokeLinejoin",
  strokeMiterLimit: "strokeMiterlimit",
  typeOf: "typeof",
  xLinkActuate: "xlinkActuate",
  xLinkArcRole: "xlinkArcrole",
  xLinkHref: "xlinkHref",
  xLinkRole: "xlinkRole",
  xLinkShow: "xlinkShow",
  xLinkTitle: "xlinkTitle",
  xLinkType: "xlinkType",
  xmlnsXLink: "xmlnsXlink"
}, vs = /[A-Z]/g, ui = /-[a-z]/g, Ts = /^data[-\w.:]+$/i;
function Cs(e, n) {
  const t = fr(n);
  let r = n, i = De;
  if (t in e.normal)
    return e.property[e.normal[t]];
  if (t.length > 4 && t.slice(0, 4) === "data" && Ts.test(n)) {
    if (n.charAt(4) === "-") {
      const o = n.slice(5).replace(ui, Is);
      r = "data" + o.charAt(0).toUpperCase() + o.slice(1);
    } else {
      const o = n.slice(4);
      if (!ui.test(o)) {
        let a = o.replace(vs, As);
        a.charAt(0) !== "-" && (a = "-" + a), n = "data" + a;
      }
    }
    i = Ir;
  }
  return new i(r, n);
}
function As(e) {
  return "-" + e.toLowerCase();
}
function Is(e) {
  return e.charAt(1).toUpperCase();
}
const Os = _a([ka, xs, Na, Sa, va], "html"), Or = _a([ka, Ns, Na, Sa, va], "svg");
function Rs(e) {
  return e.join(" ").trim();
}
function Rr(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var An = {}, Vt, di;
function Ms() {
  if (di) return Vt;
  di = 1;
  var e = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, n = /\n/g, t = /^\s*/, r = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/, i = /^:\s*/, o = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/, a = /^[;\s]*/, s = /^\s+|\s+$/g, l = `
`, c = "/", d = "*", u = "", p = "comment", f = "declaration";
  function g(_, h) {
    if (typeof _ != "string")
      throw new TypeError("First argument must be a string");
    if (!_) return [];
    h = h || {};
    var N = 1, k = 1;
    function v(z) {
      var O = z.match(n);
      O && (N += O.length);
      var X = z.lastIndexOf(l);
      k = ~X ? z.length - X : k + z.length;
    }
    function I() {
      var z = { line: N, column: k };
      return function(O) {
        return O.position = new w(z), B(), O;
      };
    }
    function w(z) {
      this.start = z, this.end = { line: N, column: k }, this.source = h.source;
    }
    w.prototype.content = _;
    function P(z) {
      var O = new Error(
        h.source + ":" + N + ":" + k + ": " + z
      );
      if (O.reason = z, O.filename = h.source, O.line = N, O.column = k, O.source = _, !h.silent) throw O;
    }
    function C(z) {
      var O = z.exec(_);
      if (O) {
        var X = O[0];
        return v(X), _ = _.slice(X.length), O;
      }
    }
    function B() {
      C(t);
    }
    function x(z) {
      var O;
      for (z = z || []; O = D(); )
        O !== !1 && z.push(O);
      return z;
    }
    function D() {
      var z = I();
      if (!(c != _.charAt(0) || d != _.charAt(1))) {
        for (var O = 2; u != _.charAt(O) && (d != _.charAt(O) || c != _.charAt(O + 1)); )
          ++O;
        if (O += 2, u === _.charAt(O - 1))
          return P("End of comment missing");
        var X = _.slice(2, O - 2);
        return k += 2, v(X), _ = _.slice(O), k += 2, z({
          type: p,
          comment: X
        });
      }
    }
    function $() {
      var z = I(), O = C(r);
      if (O) {
        if (D(), !C(i)) return P("property missing ':'");
        var X = C(o), H = z({
          type: f,
          property: E(O[0].replace(e, u)),
          value: X ? E(X[0].replace(e, u)) : u
        });
        return C(a), H;
      }
    }
    function ne() {
      var z = [];
      x(z);
      for (var O; O = $(); )
        O !== !1 && (z.push(O), x(z));
      return z;
    }
    return B(), ne();
  }
  function E(_) {
    return _ ? _.replace(s, u) : u;
  }
  return Vt = g, Vt;
}
var fi;
function Ls() {
  if (fi) return An;
  fi = 1;
  var e = An && An.__importDefault || function(r) {
    return r && r.__esModule ? r : { default: r };
  };
  Object.defineProperty(An, "__esModule", { value: !0 }), An.default = t;
  const n = e(Ms());
  function t(r, i) {
    let o = null;
    if (!r || typeof r != "string")
      return o;
    const a = (0, n.default)(r), s = typeof i == "function";
    return a.forEach((l) => {
      if (l.type !== "declaration")
        return;
      const { property: c, value: d } = l;
      s ? i(c, d, l) : d && (o = o || {}, o[c] = d);
    }), o;
  }
  return An;
}
var Gn = {}, pi;
function Ds() {
  if (pi) return Gn;
  pi = 1, Object.defineProperty(Gn, "__esModule", { value: !0 }), Gn.camelCase = void 0;
  var e = /^--[a-zA-Z0-9_-]+$/, n = /-([a-z])/g, t = /^[^-]+$/, r = /^-(webkit|moz|ms|o|khtml)-/, i = /^-(ms)-/, o = function(c) {
    return !c || t.test(c) || e.test(c);
  }, a = function(c, d) {
    return d.toUpperCase();
  }, s = function(c, d) {
    return "".concat(d, "-");
  }, l = function(c, d) {
    return d === void 0 && (d = {}), o(c) ? c : (c = c.toLowerCase(), d.reactCompat ? c = c.replace(i, s) : c = c.replace(r, s), c.replace(n, a));
  };
  return Gn.camelCase = l, Gn;
}
var qn, gi;
function Ps() {
  if (gi) return qn;
  gi = 1;
  var e = qn && qn.__importDefault || function(i) {
    return i && i.__esModule ? i : { default: i };
  }, n = e(Ls()), t = Ds();
  function r(i, o) {
    var a = {};
    return !i || typeof i != "string" || (0, n.default)(i, function(s, l) {
      s && l && (a[(0, t.camelCase)(s, o)] = l);
    }), a;
  }
  return r.default = r, qn = r, qn;
}
var Bs = Ps();
const Fs = /* @__PURE__ */ Rr(Bs), Ta = Ca("end"), Mr = Ca("start");
function Ca(e) {
  return n;
  function n(t) {
    const r = t && t.position && t.position[e] || {};
    if (typeof r.line == "number" && r.line > 0 && typeof r.column == "number" && r.column > 0)
      return {
        line: r.line,
        column: r.column,
        offset: typeof r.offset == "number" && r.offset > -1 ? r.offset : void 0
      };
  }
}
function zs(e) {
  const n = Mr(e), t = Ta(e);
  if (n && t)
    return { start: n, end: t };
}
function Zn(e) {
  return !e || typeof e != "object" ? "" : "position" in e || "type" in e ? hi(e.position) : "start" in e || "end" in e ? hi(e) : "line" in e || "column" in e ? hr(e) : "";
}
function hr(e) {
  return mi(e && e.line) + ":" + mi(e && e.column);
}
function hi(e) {
  return hr(e && e.start) + "-" + hr(e && e.end);
}
function mi(e) {
  return e && typeof e == "number" ? e : 1;
}
class Ae extends Error {
  /**
   * Create a message for `reason`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {Options | null | undefined} [options]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns
   *   Instance of `VFileMessage`.
   */
  // eslint-disable-next-line complexity
  constructor(n, t, r) {
    super(), typeof t == "string" && (r = t, t = void 0);
    let i = "", o = {}, a = !1;
    if (t && ("line" in t && "column" in t ? o = { place: t } : "start" in t && "end" in t ? o = { place: t } : "type" in t ? o = {
      ancestors: [t],
      place: t.position
    } : o = { ...t }), typeof n == "string" ? i = n : !o.cause && n && (a = !0, i = n.message, o.cause = n), !o.ruleId && !o.source && typeof r == "string") {
      const l = r.indexOf(":");
      l === -1 ? o.ruleId = r : (o.source = r.slice(0, l), o.ruleId = r.slice(l + 1));
    }
    if (!o.place && o.ancestors && o.ancestors) {
      const l = o.ancestors[o.ancestors.length - 1];
      l && (o.place = l.position);
    }
    const s = o.place && "start" in o.place ? o.place.start : o.place;
    this.ancestors = o.ancestors || void 0, this.cause = o.cause || void 0, this.column = s ? s.column : void 0, this.fatal = void 0, this.file = "", this.message = i, this.line = s ? s.line : void 0, this.name = Zn(o.place) || "1:1", this.place = o.place || void 0, this.reason = this.message, this.ruleId = o.ruleId || void 0, this.source = o.source || void 0, this.stack = a && o.cause && typeof o.cause.stack == "string" ? o.cause.stack : "", this.actual = void 0, this.expected = void 0, this.note = void 0, this.url = void 0;
  }
}
Ae.prototype.file = "";
Ae.prototype.name = "";
Ae.prototype.reason = "";
Ae.prototype.message = "";
Ae.prototype.stack = "";
Ae.prototype.column = void 0;
Ae.prototype.line = void 0;
Ae.prototype.ancestors = void 0;
Ae.prototype.cause = void 0;
Ae.prototype.fatal = void 0;
Ae.prototype.place = void 0;
Ae.prototype.ruleId = void 0;
Ae.prototype.source = void 0;
const Lr = {}.hasOwnProperty, Us = /* @__PURE__ */ new Map(), $s = /[A-Z]/g, Hs = /* @__PURE__ */ new Set(["table", "tbody", "thead", "tfoot", "tr"]), Gs = /* @__PURE__ */ new Set(["td", "th"]), Aa = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function qs(e, n) {
  if (!n || n.Fragment === void 0)
    throw new TypeError("Expected `Fragment` in options");
  const t = n.filePath || void 0;
  let r;
  if (n.development) {
    if (typeof n.jsxDEV != "function")
      throw new TypeError(
        "Expected `jsxDEV` in options when `development: true`"
      );
    r = Js(t, n.jsxDEV);
  } else {
    if (typeof n.jsx != "function")
      throw new TypeError("Expected `jsx` in production options");
    if (typeof n.jsxs != "function")
      throw new TypeError("Expected `jsxs` in production options");
    r = Qs(t, n.jsx, n.jsxs);
  }
  const i = {
    Fragment: n.Fragment,
    ancestors: [],
    components: n.components || {},
    create: r,
    elementAttributeNameCase: n.elementAttributeNameCase || "react",
    evaluater: n.createEvaluater ? n.createEvaluater() : void 0,
    filePath: t,
    ignoreInvalidStyle: n.ignoreInvalidStyle || !1,
    passKeys: n.passKeys !== !1,
    passNode: n.passNode || !1,
    schema: n.space === "svg" ? Or : Os,
    stylePropertyNameCase: n.stylePropertyNameCase || "dom",
    tableCellAlignToStyle: n.tableCellAlignToStyle !== !1
  }, o = Ia(i, e, void 0);
  return o && typeof o != "string" ? o : i.create(
    e,
    i.Fragment,
    { children: o || void 0 },
    void 0
  );
}
function Ia(e, n, t) {
  if (n.type === "element")
    return Ks(e, n, t);
  if (n.type === "mdxFlowExpression" || n.type === "mdxTextExpression")
    return Ws(e, n);
  if (n.type === "mdxJsxFlowElement" || n.type === "mdxJsxTextElement")
    return Ys(e, n, t);
  if (n.type === "mdxjsEsm")
    return Vs(e, n);
  if (n.type === "root")
    return Zs(e, n, t);
  if (n.type === "text")
    return Xs(e, n);
}
function Ks(e, n, t) {
  const r = e.schema;
  let i = r;
  n.tagName.toLowerCase() === "svg" && r.space === "html" && (i = Or, e.schema = i), e.ancestors.push(n);
  const o = Ra(e, n.tagName, !1), a = js(e, n);
  let s = Pr(e, n);
  return Hs.has(n.tagName) && (s = s.filter(function(l) {
    return typeof l == "string" ? !ks(l) : !0;
  })), Oa(e, a, o, n), Dr(a, s), e.ancestors.pop(), e.schema = r, e.create(n, o, a, t);
}
function Ws(e, n) {
  if (n.data && n.data.estree && e.evaluater) {
    const r = n.data.estree.body[0];
    return r.type, /** @type {Child | undefined} */
    e.evaluater.evaluateExpression(r.expression);
  }
  Jn(e, n.position);
}
function Vs(e, n) {
  if (n.data && n.data.estree && e.evaluater)
    return (
      /** @type {Child | undefined} */
      e.evaluater.evaluateProgram(n.data.estree)
    );
  Jn(e, n.position);
}
function Ys(e, n, t) {
  const r = e.schema;
  let i = r;
  n.name === "svg" && r.space === "html" && (i = Or, e.schema = i), e.ancestors.push(n);
  const o = n.name === null ? e.Fragment : Ra(e, n.name, !0), a = el(e, n), s = Pr(e, n);
  return Oa(e, a, o, n), Dr(a, s), e.ancestors.pop(), e.schema = r, e.create(n, o, a, t);
}
function Zs(e, n, t) {
  const r = {};
  return Dr(r, Pr(e, n)), e.create(n, e.Fragment, r, t);
}
function Xs(e, n) {
  return n.value;
}
function Oa(e, n, t, r) {
  typeof t != "string" && t !== e.Fragment && e.passNode && (n.node = r);
}
function Dr(e, n) {
  if (n.length > 0) {
    const t = n.length > 1 ? n : n[0];
    t && (e.children = t);
  }
}
function Qs(e, n, t) {
  return r;
  function r(i, o, a, s) {
    const c = Array.isArray(a.children) ? t : n;
    return s ? c(o, a, s) : c(o, a);
  }
}
function Js(e, n) {
  return t;
  function t(r, i, o, a) {
    const s = Array.isArray(o.children), l = Mr(r);
    return n(
      i,
      o,
      a,
      s,
      {
        columnNumber: l ? l.column - 1 : void 0,
        fileName: e,
        lineNumber: l ? l.line : void 0
      },
      void 0
    );
  }
}
function js(e, n) {
  const t = {};
  let r, i;
  for (i in n.properties)
    if (i !== "children" && Lr.call(n.properties, i)) {
      const o = nl(e, i, n.properties[i]);
      if (o) {
        const [a, s] = o;
        e.tableCellAlignToStyle && a === "align" && typeof s == "string" && Gs.has(n.tagName) ? r = s : t[a] = s;
      }
    }
  if (r) {
    const o = (
      /** @type {Style} */
      t.style || (t.style = {})
    );
    o[e.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = r;
  }
  return t;
}
function el(e, n) {
  const t = {};
  for (const r of n.attributes)
    if (r.type === "mdxJsxExpressionAttribute")
      if (r.data && r.data.estree && e.evaluater) {
        const o = r.data.estree.body[0];
        o.type;
        const a = o.expression;
        a.type;
        const s = a.properties[0];
        s.type, Object.assign(
          t,
          e.evaluater.evaluateExpression(s.argument)
        );
      } else
        Jn(e, n.position);
    else {
      const i = r.name;
      let o;
      if (r.value && typeof r.value == "object")
        if (r.value.data && r.value.data.estree && e.evaluater) {
          const s = r.value.data.estree.body[0];
          s.type, o = e.evaluater.evaluateExpression(s.expression);
        } else
          Jn(e, n.position);
      else
        o = r.value === null ? !0 : r.value;
      t[i] = /** @type {Props[keyof Props]} */
      o;
    }
  return t;
}
function Pr(e, n) {
  const t = [];
  let r = -1;
  const i = e.passKeys ? /* @__PURE__ */ new Map() : Us;
  for (; ++r < n.children.length; ) {
    const o = n.children[r];
    let a;
    if (e.passKeys) {
      const l = o.type === "element" ? o.tagName : o.type === "mdxJsxFlowElement" || o.type === "mdxJsxTextElement" ? o.name : void 0;
      if (l) {
        const c = i.get(l) || 0;
        a = l + "-" + c, i.set(l, c + 1);
      }
    }
    const s = Ia(e, o, a);
    s !== void 0 && t.push(s);
  }
  return t;
}
function nl(e, n, t) {
  const r = Cs(e.schema, n);
  if (!(t == null || typeof t == "number" && Number.isNaN(t))) {
    if (Array.isArray(t) && (t = r.commaSeparated ? ms(t) : Rs(t)), r.property === "style") {
      let i = typeof t == "object" ? t : tl(e, String(t));
      return e.stylePropertyNameCase === "css" && (i = rl(i)), ["style", i];
    }
    return [
      e.elementAttributeNameCase === "react" && r.space ? Ss[r.property] || r.property : r.attribute,
      t
    ];
  }
}
function tl(e, n) {
  try {
    return Fs(n, { reactCompat: !0 });
  } catch (t) {
    if (e.ignoreInvalidStyle)
      return {};
    const r = (
      /** @type {Error} */
      t
    ), i = new Ae("Cannot parse `style` attribute", {
      ancestors: e.ancestors,
      cause: r,
      ruleId: "style",
      source: "hast-util-to-jsx-runtime"
    });
    throw i.file = e.filePath || void 0, i.url = Aa + "#cannot-parse-style-attribute", i;
  }
}
function Ra(e, n, t) {
  let r;
  if (!t)
    r = { type: "Literal", value: n };
  else if (n.includes(".")) {
    const i = n.split(".");
    let o = -1, a;
    for (; ++o < i.length; ) {
      const s = si(i[o]) ? { type: "Identifier", name: i[o] } : { type: "Literal", value: i[o] };
      a = a ? {
        type: "MemberExpression",
        object: a,
        property: s,
        computed: !!(o && s.type === "Literal"),
        optional: !1
      } : s;
    }
    r = a;
  } else
    r = si(n) && !/^[a-z]/.test(n) ? { type: "Identifier", name: n } : { type: "Literal", value: n };
  if (r.type === "Literal") {
    const i = (
      /** @type {string | number} */
      r.value
    );
    return Lr.call(e.components, i) ? e.components[i] : i;
  }
  if (e.evaluater)
    return e.evaluater.evaluateExpression(r);
  Jn(e);
}
function Jn(e, n) {
  const t = new Ae(
    "Cannot handle MDX estrees without `createEvaluater`",
    {
      ancestors: e.ancestors,
      place: n,
      ruleId: "mdx-estree",
      source: "hast-util-to-jsx-runtime"
    }
  );
  throw t.file = e.filePath || void 0, t.url = Aa + "#cannot-handle-mdx-estrees-without-createevaluater", t;
}
function rl(e) {
  const n = {};
  let t;
  for (t in e)
    Lr.call(e, t) && (n[il(t)] = e[t]);
  return n;
}
function il(e) {
  let n = e.replace($s, al);
  return n.slice(0, 3) === "ms-" && (n = "-" + n), n;
}
function al(e) {
  return "-" + e.toLowerCase();
}
const Yt = {
  action: ["form"],
  cite: ["blockquote", "del", "ins", "q"],
  data: ["object"],
  formAction: ["button", "input"],
  href: ["a", "area", "base", "link"],
  icon: ["menuitem"],
  itemId: null,
  manifest: ["html"],
  ping: ["a", "area"],
  poster: ["video"],
  src: [
    "audio",
    "embed",
    "iframe",
    "img",
    "input",
    "script",
    "source",
    "track",
    "video"
  ]
}, ol = {};
function Br(e, n) {
  const t = ol, r = typeof t.includeImageAlt == "boolean" ? t.includeImageAlt : !0, i = typeof t.includeHtml == "boolean" ? t.includeHtml : !0;
  return Ma(e, r, i);
}
function Ma(e, n, t) {
  if (sl(e)) {
    if ("value" in e)
      return e.type === "html" && !t ? "" : e.value;
    if (n && "alt" in e && e.alt)
      return e.alt;
    if ("children" in e)
      return bi(e.children, n, t);
  }
  return Array.isArray(e) ? bi(e, n, t) : "";
}
function bi(e, n, t) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; )
    r[i] = Ma(e[i], n, t);
  return r.join("");
}
function sl(e) {
  return !!(e && typeof e == "object");
}
const Ei = document.createElement("i");
function Fr(e) {
  const n = "&" + e + ";";
  Ei.innerHTML = n;
  const t = Ei.textContent;
  return t.charCodeAt(t.length - 1) === 59 && e !== "semi" || t === n ? !1 : t;
}
function He(e, n, t, r) {
  const i = e.length;
  let o = 0, a;
  if (n < 0 ? n = -n > i ? 0 : i + n : n = n > i ? i : n, t = t > 0 ? t : 0, r.length < 1e4)
    a = Array.from(r), a.unshift(n, t), e.splice(...a);
  else
    for (t && e.splice(n, t); o < r.length; )
      a = r.slice(o, o + 1e4), a.unshift(n, 0), e.splice(...a), o += 1e4, n += 1e4;
}
function qe(e, n) {
  return e.length > 0 ? (He(e, e.length, 0, n), e) : n;
}
const yi = {}.hasOwnProperty;
function La(e) {
  const n = {};
  let t = -1;
  for (; ++t < e.length; )
    ll(n, e[t]);
  return n;
}
function ll(e, n) {
  let t;
  for (t in n) {
    const i = (yi.call(e, t) ? e[t] : void 0) || (e[t] = {}), o = n[t];
    let a;
    if (o)
      for (a in o) {
        yi.call(i, a) || (i[a] = []);
        const s = o[a];
        cl(
          // @ts-expect-error Looks like a list.
          i[a],
          Array.isArray(s) ? s : s ? [s] : []
        );
      }
  }
}
function cl(e, n) {
  let t = -1;
  const r = [];
  for (; ++t < n.length; )
    (n[t].add === "after" ? e : r).push(n[t]);
  He(e, 0, 0, r);
}
function Da(e, n) {
  const t = Number.parseInt(e, n);
  return (
    // C0 except for HT, LF, FF, CR, space.
    t < 9 || t === 11 || t > 13 && t < 32 || // Control character (DEL) of C0, and C1 controls.
    t > 126 && t < 160 || // Lone high surrogates and low surrogates.
    t > 55295 && t < 57344 || // Noncharacters.
    t > 64975 && t < 65008 || /* eslint-disable no-bitwise */
    (t & 65535) === 65535 || (t & 65535) === 65534 || /* eslint-enable no-bitwise */
    // Out of range
    t > 1114111 ? "�" : String.fromCodePoint(t)
  );
}
function Ye(e) {
  return e.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
const Me = En(/[A-Za-z]/), Ce = En(/[\dA-Za-z]/), ul = En(/[#-'*+\--9=?A-Z^-~]/);
function Nt(e) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    e !== null && (e < 32 || e === 127)
  );
}
const mr = En(/\d/), dl = En(/[\dA-Fa-f]/), fl = En(/[!-/:-@[-`{-~]/);
function Y(e) {
  return e !== null && e < -2;
}
function me(e) {
  return e !== null && (e < 0 || e === 32);
}
function ae(e) {
  return e === -2 || e === -1 || e === 32;
}
const Ot = En(new RegExp("\\p{P}|\\p{S}", "u")), xn = En(/\s/);
function En(e) {
  return n;
  function n(t) {
    return t !== null && t > -1 && e.test(String.fromCharCode(t));
  }
}
function Bn(e) {
  const n = [];
  let t = -1, r = 0, i = 0;
  for (; ++t < e.length; ) {
    const o = e.charCodeAt(t);
    let a = "";
    if (o === 37 && Ce(e.charCodeAt(t + 1)) && Ce(e.charCodeAt(t + 2)))
      i = 2;
    else if (o < 128)
      /[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(o)) || (a = String.fromCharCode(o));
    else if (o > 55295 && o < 57344) {
      const s = e.charCodeAt(t + 1);
      o < 56320 && s > 56319 && s < 57344 ? (a = String.fromCharCode(o, s), i = 1) : a = "�";
    } else
      a = String.fromCharCode(o);
    a && (n.push(e.slice(r, t), encodeURIComponent(a)), r = t + i + 1, a = ""), i && (t += i, i = 0);
  }
  return n.join("") + e.slice(r);
}
function se(e, n, t, r) {
  const i = r ? r - 1 : Number.POSITIVE_INFINITY;
  let o = 0;
  return a;
  function a(l) {
    return ae(l) ? (e.enter(t), s(l)) : n(l);
  }
  function s(l) {
    return ae(l) && o++ < i ? (e.consume(l), s) : (e.exit(t), n(l));
  }
}
const pl = {
  tokenize: gl
};
function gl(e) {
  const n = e.attempt(this.parser.constructs.contentInitial, r, i);
  let t;
  return n;
  function r(s) {
    if (s === null) {
      e.consume(s);
      return;
    }
    return e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), se(e, n, "linePrefix");
  }
  function i(s) {
    return e.enter("paragraph"), o(s);
  }
  function o(s) {
    const l = e.enter("chunkText", {
      contentType: "text",
      previous: t
    });
    return t && (t.next = l), t = l, a(s);
  }
  function a(s) {
    if (s === null) {
      e.exit("chunkText"), e.exit("paragraph"), e.consume(s);
      return;
    }
    return Y(s) ? (e.consume(s), e.exit("chunkText"), o) : (e.consume(s), a);
  }
}
const hl = {
  tokenize: ml
}, _i = {
  tokenize: bl
};
function ml(e) {
  const n = this, t = [];
  let r = 0, i, o, a;
  return s;
  function s(k) {
    if (r < t.length) {
      const v = t[r];
      return n.containerState = v[1], e.attempt(v[0].continuation, l, c)(k);
    }
    return c(k);
  }
  function l(k) {
    if (r++, n.containerState._closeFlow) {
      n.containerState._closeFlow = void 0, i && N();
      const v = n.events.length;
      let I = v, w;
      for (; I--; )
        if (n.events[I][0] === "exit" && n.events[I][1].type === "chunkFlow") {
          w = n.events[I][1].end;
          break;
        }
      h(r);
      let P = v;
      for (; P < n.events.length; )
        n.events[P][1].end = {
          ...w
        }, P++;
      return He(n.events, I + 1, 0, n.events.slice(v)), n.events.length = P, c(k);
    }
    return s(k);
  }
  function c(k) {
    if (r === t.length) {
      if (!i)
        return p(k);
      if (i.currentConstruct && i.currentConstruct.concrete)
        return g(k);
      n.interrupt = !!(i.currentConstruct && !i._gfmTableDynamicInterruptHack);
    }
    return n.containerState = {}, e.check(_i, d, u)(k);
  }
  function d(k) {
    return i && N(), h(r), p(k);
  }
  function u(k) {
    return n.parser.lazy[n.now().line] = r !== t.length, a = n.now().offset, g(k);
  }
  function p(k) {
    return n.containerState = {}, e.attempt(_i, f, g)(k);
  }
  function f(k) {
    return r++, t.push([n.currentConstruct, n.containerState]), p(k);
  }
  function g(k) {
    if (k === null) {
      i && N(), h(0), e.consume(k);
      return;
    }
    return i = i || n.parser.flow(n.now()), e.enter("chunkFlow", {
      _tokenizer: i,
      contentType: "flow",
      previous: o
    }), E(k);
  }
  function E(k) {
    if (k === null) {
      _(e.exit("chunkFlow"), !0), h(0), e.consume(k);
      return;
    }
    return Y(k) ? (e.consume(k), _(e.exit("chunkFlow")), r = 0, n.interrupt = void 0, s) : (e.consume(k), E);
  }
  function _(k, v) {
    const I = n.sliceStream(k);
    if (v && I.push(null), k.previous = o, o && (o.next = k), o = k, i.defineSkip(k.start), i.write(I), n.parser.lazy[k.start.line]) {
      let w = i.events.length;
      for (; w--; )
        if (
          // The token starts before the line ending…
          i.events[w][1].start.offset < a && // …and either is not ended yet…
          (!i.events[w][1].end || // …or ends after it.
          i.events[w][1].end.offset > a)
        )
          return;
      const P = n.events.length;
      let C = P, B, x;
      for (; C--; )
        if (n.events[C][0] === "exit" && n.events[C][1].type === "chunkFlow") {
          if (B) {
            x = n.events[C][1].end;
            break;
          }
          B = !0;
        }
      for (h(r), w = P; w < n.events.length; )
        n.events[w][1].end = {
          ...x
        }, w++;
      He(n.events, C + 1, 0, n.events.slice(P)), n.events.length = w;
    }
  }
  function h(k) {
    let v = t.length;
    for (; v-- > k; ) {
      const I = t[v];
      n.containerState = I[1], I[0].exit.call(n, e);
    }
    t.length = k;
  }
  function N() {
    i.write([null]), o = void 0, i = void 0, n.containerState._closeFlow = void 0;
  }
}
function bl(e, n, t) {
  return se(e, e.attempt(this.parser.constructs.document, n, t), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
}
function Dn(e) {
  if (e === null || me(e) || xn(e))
    return 1;
  if (Ot(e))
    return 2;
}
function Rt(e, n, t) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; ) {
    const o = e[i].resolveAll;
    o && !r.includes(o) && (n = o(n, t), r.push(o));
  }
  return n;
}
const br = {
  name: "attention",
  resolveAll: El,
  tokenize: yl
};
function El(e, n) {
  let t = -1, r, i, o, a, s, l, c, d;
  for (; ++t < e.length; )
    if (e[t][0] === "enter" && e[t][1].type === "attentionSequence" && e[t][1]._close) {
      for (r = t; r--; )
        if (e[r][0] === "exit" && e[r][1].type === "attentionSequence" && e[r][1]._open && // If the markers are the same:
        n.sliceSerialize(e[r][1]).charCodeAt(0) === n.sliceSerialize(e[t][1]).charCodeAt(0)) {
          if ((e[r][1]._close || e[t][1]._open) && (e[t][1].end.offset - e[t][1].start.offset) % 3 && !((e[r][1].end.offset - e[r][1].start.offset + e[t][1].end.offset - e[t][1].start.offset) % 3))
            continue;
          l = e[r][1].end.offset - e[r][1].start.offset > 1 && e[t][1].end.offset - e[t][1].start.offset > 1 ? 2 : 1;
          const u = {
            ...e[r][1].end
          }, p = {
            ...e[t][1].start
          };
          ki(u, -l), ki(p, l), a = {
            type: l > 1 ? "strongSequence" : "emphasisSequence",
            start: u,
            end: {
              ...e[r][1].end
            }
          }, s = {
            type: l > 1 ? "strongSequence" : "emphasisSequence",
            start: {
              ...e[t][1].start
            },
            end: p
          }, o = {
            type: l > 1 ? "strongText" : "emphasisText",
            start: {
              ...e[r][1].end
            },
            end: {
              ...e[t][1].start
            }
          }, i = {
            type: l > 1 ? "strong" : "emphasis",
            start: {
              ...a.start
            },
            end: {
              ...s.end
            }
          }, e[r][1].end = {
            ...a.start
          }, e[t][1].start = {
            ...s.end
          }, c = [], e[r][1].end.offset - e[r][1].start.offset && (c = qe(c, [["enter", e[r][1], n], ["exit", e[r][1], n]])), c = qe(c, [["enter", i, n], ["enter", a, n], ["exit", a, n], ["enter", o, n]]), c = qe(c, Rt(n.parser.constructs.insideSpan.null, e.slice(r + 1, t), n)), c = qe(c, [["exit", o, n], ["enter", s, n], ["exit", s, n], ["exit", i, n]]), e[t][1].end.offset - e[t][1].start.offset ? (d = 2, c = qe(c, [["enter", e[t][1], n], ["exit", e[t][1], n]])) : d = 0, He(e, r - 1, t - r + 3, c), t = r + c.length - d - 2;
          break;
        }
    }
  for (t = -1; ++t < e.length; )
    e[t][1].type === "attentionSequence" && (e[t][1].type = "data");
  return e;
}
function yl(e, n) {
  const t = this.parser.constructs.attentionMarkers.null, r = this.previous, i = Dn(r);
  let o;
  return a;
  function a(l) {
    return o = l, e.enter("attentionSequence"), s(l);
  }
  function s(l) {
    if (l === o)
      return e.consume(l), s;
    const c = e.exit("attentionSequence"), d = Dn(l), u = !d || d === 2 && i || t.includes(l), p = !i || i === 2 && d || t.includes(r);
    return c._open = !!(o === 42 ? u : u && (i || !p)), c._close = !!(o === 42 ? p : p && (d || !u)), n(l);
  }
}
function ki(e, n) {
  e.column += n, e.offset += n, e._bufferIndex += n;
}
const _l = {
  name: "autolink",
  tokenize: kl
};
function kl(e, n, t) {
  let r = 0;
  return i;
  function i(f) {
    return e.enter("autolink"), e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.enter("autolinkProtocol"), o;
  }
  function o(f) {
    return Me(f) ? (e.consume(f), a) : f === 64 ? t(f) : c(f);
  }
  function a(f) {
    return f === 43 || f === 45 || f === 46 || Ce(f) ? (r = 1, s(f)) : c(f);
  }
  function s(f) {
    return f === 58 ? (e.consume(f), r = 0, l) : (f === 43 || f === 45 || f === 46 || Ce(f)) && r++ < 32 ? (e.consume(f), s) : (r = 0, c(f));
  }
  function l(f) {
    return f === 62 ? (e.exit("autolinkProtocol"), e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.exit("autolink"), n) : f === null || f === 32 || f === 60 || Nt(f) ? t(f) : (e.consume(f), l);
  }
  function c(f) {
    return f === 64 ? (e.consume(f), d) : ul(f) ? (e.consume(f), c) : t(f);
  }
  function d(f) {
    return Ce(f) ? u(f) : t(f);
  }
  function u(f) {
    return f === 46 ? (e.consume(f), r = 0, d) : f === 62 ? (e.exit("autolinkProtocol").type = "autolinkEmail", e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.exit("autolink"), n) : p(f);
  }
  function p(f) {
    if ((f === 45 || Ce(f)) && r++ < 63) {
      const g = f === 45 ? p : u;
      return e.consume(f), g;
    }
    return t(f);
  }
}
const tt = {
  partial: !0,
  tokenize: wl
};
function wl(e, n, t) {
  return r;
  function r(o) {
    return ae(o) ? se(e, i, "linePrefix")(o) : i(o);
  }
  function i(o) {
    return o === null || Y(o) ? n(o) : t(o);
  }
}
const Pa = {
  continuation: {
    tokenize: Nl
  },
  exit: Sl,
  name: "blockQuote",
  tokenize: xl
};
function xl(e, n, t) {
  const r = this;
  return i;
  function i(a) {
    if (a === 62) {
      const s = r.containerState;
      return s.open || (e.enter("blockQuote", {
        _container: !0
      }), s.open = !0), e.enter("blockQuotePrefix"), e.enter("blockQuoteMarker"), e.consume(a), e.exit("blockQuoteMarker"), o;
    }
    return t(a);
  }
  function o(a) {
    return ae(a) ? (e.enter("blockQuotePrefixWhitespace"), e.consume(a), e.exit("blockQuotePrefixWhitespace"), e.exit("blockQuotePrefix"), n) : (e.exit("blockQuotePrefix"), n(a));
  }
}
function Nl(e, n, t) {
  const r = this;
  return i;
  function i(a) {
    return ae(a) ? se(e, o, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(a) : o(a);
  }
  function o(a) {
    return e.attempt(Pa, n, t)(a);
  }
}
function Sl(e) {
  e.exit("blockQuote");
}
const Ba = {
  name: "characterEscape",
  tokenize: vl
};
function vl(e, n, t) {
  return r;
  function r(o) {
    return e.enter("characterEscape"), e.enter("escapeMarker"), e.consume(o), e.exit("escapeMarker"), i;
  }
  function i(o) {
    return fl(o) ? (e.enter("characterEscapeValue"), e.consume(o), e.exit("characterEscapeValue"), e.exit("characterEscape"), n) : t(o);
  }
}
const Fa = {
  name: "characterReference",
  tokenize: Tl
};
function Tl(e, n, t) {
  const r = this;
  let i = 0, o, a;
  return s;
  function s(u) {
    return e.enter("characterReference"), e.enter("characterReferenceMarker"), e.consume(u), e.exit("characterReferenceMarker"), l;
  }
  function l(u) {
    return u === 35 ? (e.enter("characterReferenceMarkerNumeric"), e.consume(u), e.exit("characterReferenceMarkerNumeric"), c) : (e.enter("characterReferenceValue"), o = 31, a = Ce, d(u));
  }
  function c(u) {
    return u === 88 || u === 120 ? (e.enter("characterReferenceMarkerHexadecimal"), e.consume(u), e.exit("characterReferenceMarkerHexadecimal"), e.enter("characterReferenceValue"), o = 6, a = dl, d) : (e.enter("characterReferenceValue"), o = 7, a = mr, d(u));
  }
  function d(u) {
    if (u === 59 && i) {
      const p = e.exit("characterReferenceValue");
      return a === Ce && !Fr(r.sliceSerialize(p)) ? t(u) : (e.enter("characterReferenceMarker"), e.consume(u), e.exit("characterReferenceMarker"), e.exit("characterReference"), n);
    }
    return a(u) && i++ < o ? (e.consume(u), d) : t(u);
  }
}
const wi = {
  partial: !0,
  tokenize: Al
}, xi = {
  concrete: !0,
  name: "codeFenced",
  tokenize: Cl
};
function Cl(e, n, t) {
  const r = this, i = {
    partial: !0,
    tokenize: I
  };
  let o = 0, a = 0, s;
  return l;
  function l(w) {
    return c(w);
  }
  function c(w) {
    const P = r.events[r.events.length - 1];
    return o = P && P[1].type === "linePrefix" ? P[2].sliceSerialize(P[1], !0).length : 0, s = w, e.enter("codeFenced"), e.enter("codeFencedFence"), e.enter("codeFencedFenceSequence"), d(w);
  }
  function d(w) {
    return w === s ? (a++, e.consume(w), d) : a < 3 ? t(w) : (e.exit("codeFencedFenceSequence"), ae(w) ? se(e, u, "whitespace")(w) : u(w));
  }
  function u(w) {
    return w === null || Y(w) ? (e.exit("codeFencedFence"), r.interrupt ? n(w) : e.check(wi, E, v)(w)) : (e.enter("codeFencedFenceInfo"), e.enter("chunkString", {
      contentType: "string"
    }), p(w));
  }
  function p(w) {
    return w === null || Y(w) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), u(w)) : ae(w) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), se(e, f, "whitespace")(w)) : w === 96 && w === s ? t(w) : (e.consume(w), p);
  }
  function f(w) {
    return w === null || Y(w) ? u(w) : (e.enter("codeFencedFenceMeta"), e.enter("chunkString", {
      contentType: "string"
    }), g(w));
  }
  function g(w) {
    return w === null || Y(w) ? (e.exit("chunkString"), e.exit("codeFencedFenceMeta"), u(w)) : w === 96 && w === s ? t(w) : (e.consume(w), g);
  }
  function E(w) {
    return e.attempt(i, v, _)(w);
  }
  function _(w) {
    return e.enter("lineEnding"), e.consume(w), e.exit("lineEnding"), h;
  }
  function h(w) {
    return o > 0 && ae(w) ? se(e, N, "linePrefix", o + 1)(w) : N(w);
  }
  function N(w) {
    return w === null || Y(w) ? e.check(wi, E, v)(w) : (e.enter("codeFlowValue"), k(w));
  }
  function k(w) {
    return w === null || Y(w) ? (e.exit("codeFlowValue"), N(w)) : (e.consume(w), k);
  }
  function v(w) {
    return e.exit("codeFenced"), n(w);
  }
  function I(w, P, C) {
    let B = 0;
    return x;
    function x(O) {
      return w.enter("lineEnding"), w.consume(O), w.exit("lineEnding"), D;
    }
    function D(O) {
      return w.enter("codeFencedFence"), ae(O) ? se(w, $, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(O) : $(O);
    }
    function $(O) {
      return O === s ? (w.enter("codeFencedFenceSequence"), ne(O)) : C(O);
    }
    function ne(O) {
      return O === s ? (B++, w.consume(O), ne) : B >= a ? (w.exit("codeFencedFenceSequence"), ae(O) ? se(w, z, "whitespace")(O) : z(O)) : C(O);
    }
    function z(O) {
      return O === null || Y(O) ? (w.exit("codeFencedFence"), P(O)) : C(O);
    }
  }
}
function Al(e, n, t) {
  const r = this;
  return i;
  function i(a) {
    return a === null ? t(a) : (e.enter("lineEnding"), e.consume(a), e.exit("lineEnding"), o);
  }
  function o(a) {
    return r.parser.lazy[r.now().line] ? t(a) : n(a);
  }
}
const Zt = {
  name: "codeIndented",
  tokenize: Ol
}, Il = {
  partial: !0,
  tokenize: Rl
};
function Ol(e, n, t) {
  const r = this;
  return i;
  function i(c) {
    return e.enter("codeIndented"), se(e, o, "linePrefix", 5)(c);
  }
  function o(c) {
    const d = r.events[r.events.length - 1];
    return d && d[1].type === "linePrefix" && d[2].sliceSerialize(d[1], !0).length >= 4 ? a(c) : t(c);
  }
  function a(c) {
    return c === null ? l(c) : Y(c) ? e.attempt(Il, a, l)(c) : (e.enter("codeFlowValue"), s(c));
  }
  function s(c) {
    return c === null || Y(c) ? (e.exit("codeFlowValue"), a(c)) : (e.consume(c), s);
  }
  function l(c) {
    return e.exit("codeIndented"), n(c);
  }
}
function Rl(e, n, t) {
  const r = this;
  return i;
  function i(a) {
    return r.parser.lazy[r.now().line] ? t(a) : Y(a) ? (e.enter("lineEnding"), e.consume(a), e.exit("lineEnding"), i) : se(e, o, "linePrefix", 5)(a);
  }
  function o(a) {
    const s = r.events[r.events.length - 1];
    return s && s[1].type === "linePrefix" && s[2].sliceSerialize(s[1], !0).length >= 4 ? n(a) : Y(a) ? i(a) : t(a);
  }
}
const Ml = {
  name: "codeText",
  previous: Dl,
  resolve: Ll,
  tokenize: Pl
};
function Ll(e) {
  let n = e.length - 4, t = 3, r, i;
  if ((e[t][1].type === "lineEnding" || e[t][1].type === "space") && (e[n][1].type === "lineEnding" || e[n][1].type === "space")) {
    for (r = t; ++r < n; )
      if (e[r][1].type === "codeTextData") {
        e[t][1].type = "codeTextPadding", e[n][1].type = "codeTextPadding", t += 2, n -= 2;
        break;
      }
  }
  for (r = t - 1, n++; ++r <= n; )
    i === void 0 ? r !== n && e[r][1].type !== "lineEnding" && (i = r) : (r === n || e[r][1].type === "lineEnding") && (e[i][1].type = "codeTextData", r !== i + 2 && (e[i][1].end = e[r - 1][1].end, e.splice(i + 2, r - i - 2), n -= r - i - 2, r = i + 2), i = void 0);
  return e;
}
function Dl(e) {
  return e !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function Pl(e, n, t) {
  let r = 0, i, o;
  return a;
  function a(u) {
    return e.enter("codeText"), e.enter("codeTextSequence"), s(u);
  }
  function s(u) {
    return u === 96 ? (e.consume(u), r++, s) : (e.exit("codeTextSequence"), l(u));
  }
  function l(u) {
    return u === null ? t(u) : u === 32 ? (e.enter("space"), e.consume(u), e.exit("space"), l) : u === 96 ? (o = e.enter("codeTextSequence"), i = 0, d(u)) : Y(u) ? (e.enter("lineEnding"), e.consume(u), e.exit("lineEnding"), l) : (e.enter("codeTextData"), c(u));
  }
  function c(u) {
    return u === null || u === 32 || u === 96 || Y(u) ? (e.exit("codeTextData"), l(u)) : (e.consume(u), c);
  }
  function d(u) {
    return u === 96 ? (e.consume(u), i++, d) : i === r ? (e.exit("codeTextSequence"), e.exit("codeText"), n(u)) : (o.type = "codeTextData", c(u));
  }
}
class Bl {
  /**
   * @param {ReadonlyArray<T> | null | undefined} [initial]
   *   Initial items (optional).
   * @returns
   *   Splice buffer.
   */
  constructor(n) {
    this.left = n ? [...n] : [], this.right = [];
  }
  /**
   * Array access;
   * does not move the cursor.
   *
   * @param {number} index
   *   Index.
   * @return {T}
   *   Item.
   */
  get(n) {
    if (n < 0 || n >= this.left.length + this.right.length)
      throw new RangeError("Cannot access index `" + n + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
    return n < this.left.length ? this.left[n] : this.right[this.right.length - n + this.left.length - 1];
  }
  /**
   * The length of the splice buffer, one greater than the largest index in the
   * array.
   */
  get length() {
    return this.left.length + this.right.length;
  }
  /**
   * Remove and return `list[0]`;
   * moves the cursor to `0`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  shift() {
    return this.setCursor(0), this.right.pop();
  }
  /**
   * Slice the buffer to get an array;
   * does not move the cursor.
   *
   * @param {number} start
   *   Start.
   * @param {number | null | undefined} [end]
   *   End (optional).
   * @returns {Array<T>}
   *   Array of items.
   */
  slice(n, t) {
    const r = t ?? Number.POSITIVE_INFINITY;
    return r < this.left.length ? this.left.slice(n, r) : n > this.left.length ? this.right.slice(this.right.length - r + this.left.length, this.right.length - n + this.left.length).reverse() : this.left.slice(n).concat(this.right.slice(this.right.length - r + this.left.length).reverse());
  }
  /**
   * Mimics the behavior of Array.prototype.splice() except for the change of
   * interface necessary to avoid segfaults when patching in very large arrays.
   *
   * This operation moves cursor is moved to `start` and results in the cursor
   * placed after any inserted items.
   *
   * @param {number} start
   *   Start;
   *   zero-based index at which to start changing the array;
   *   negative numbers count backwards from the end of the array and values
   *   that are out-of bounds are clamped to the appropriate end of the array.
   * @param {number | null | undefined} [deleteCount=0]
   *   Delete count (default: `0`);
   *   maximum number of elements to delete, starting from start.
   * @param {Array<T> | null | undefined} [items=[]]
   *   Items to include in place of the deleted items (default: `[]`).
   * @return {Array<T>}
   *   Any removed items.
   */
  splice(n, t, r) {
    const i = t || 0;
    this.setCursor(Math.trunc(n));
    const o = this.right.splice(this.right.length - i, Number.POSITIVE_INFINITY);
    return r && Kn(this.left, r), o.reverse();
  }
  /**
   * Remove and return the highest-numbered item in the array, so
   * `list[list.length - 1]`;
   * Moves the cursor to `length`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  pop() {
    return this.setCursor(Number.POSITIVE_INFINITY), this.left.pop();
  }
  /**
   * Inserts a single item to the high-numbered side of the array;
   * moves the cursor to `length`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  push(n) {
    this.setCursor(Number.POSITIVE_INFINITY), this.left.push(n);
  }
  /**
   * Inserts many items to the high-numbered side of the array.
   * Moves the cursor to `length`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  pushMany(n) {
    this.setCursor(Number.POSITIVE_INFINITY), Kn(this.left, n);
  }
  /**
   * Inserts a single item to the low-numbered side of the array;
   * Moves the cursor to `0`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  unshift(n) {
    this.setCursor(0), this.right.push(n);
  }
  /**
   * Inserts many items to the low-numbered side of the array;
   * moves the cursor to `0`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  unshiftMany(n) {
    this.setCursor(0), Kn(this.right, n.reverse());
  }
  /**
   * Move the cursor to a specific position in the array. Requires
   * time proportional to the distance moved.
   *
   * If `n < 0`, the cursor will end up at the beginning.
   * If `n > length`, the cursor will end up at the end.
   *
   * @param {number} n
   *   Position.
   * @return {undefined}
   *   Nothing.
   */
  setCursor(n) {
    if (!(n === this.left.length || n > this.left.length && this.right.length === 0 || n < 0 && this.left.length === 0))
      if (n < this.left.length) {
        const t = this.left.splice(n, Number.POSITIVE_INFINITY);
        Kn(this.right, t.reverse());
      } else {
        const t = this.right.splice(this.left.length + this.right.length - n, Number.POSITIVE_INFINITY);
        Kn(this.left, t.reverse());
      }
  }
}
function Kn(e, n) {
  let t = 0;
  if (n.length < 1e4)
    e.push(...n);
  else
    for (; t < n.length; )
      e.push(...n.slice(t, t + 1e4)), t += 1e4;
}
function za(e) {
  const n = {};
  let t = -1, r, i, o, a, s, l, c;
  const d = new Bl(e);
  for (; ++t < d.length; ) {
    for (; t in n; )
      t = n[t];
    if (r = d.get(t), t && r[1].type === "chunkFlow" && d.get(t - 1)[1].type === "listItemPrefix" && (l = r[1]._tokenizer.events, o = 0, o < l.length && l[o][1].type === "lineEndingBlank" && (o += 2), o < l.length && l[o][1].type === "content"))
      for (; ++o < l.length && l[o][1].type !== "content"; )
        l[o][1].type === "chunkText" && (l[o][1]._isInFirstContentOfListItem = !0, o++);
    if (r[0] === "enter")
      r[1].contentType && (Object.assign(n, Fl(d, t)), t = n[t], c = !0);
    else if (r[1]._container) {
      for (o = t, i = void 0; o--; )
        if (a = d.get(o), a[1].type === "lineEnding" || a[1].type === "lineEndingBlank")
          a[0] === "enter" && (i && (d.get(i)[1].type = "lineEndingBlank"), a[1].type = "lineEnding", i = o);
        else if (!(a[1].type === "linePrefix" || a[1].type === "listItemIndent")) break;
      i && (r[1].end = {
        ...d.get(i)[1].start
      }, s = d.slice(i, t), s.unshift(r), d.splice(i, t - i + 1, s));
    }
  }
  return He(e, 0, Number.POSITIVE_INFINITY, d.slice(0)), !c;
}
function Fl(e, n) {
  const t = e.get(n)[1], r = e.get(n)[2];
  let i = n - 1;
  const o = [];
  let a = t._tokenizer;
  a || (a = r.parser[t.contentType](t.start), t._contentTypeTextTrailing && (a._contentTypeTextTrailing = !0));
  const s = a.events, l = [], c = {};
  let d, u, p = -1, f = t, g = 0, E = 0;
  const _ = [E];
  for (; f; ) {
    for (; e.get(++i)[1] !== f; )
      ;
    o.push(i), f._tokenizer || (d = r.sliceStream(f), f.next || d.push(null), u && a.defineSkip(f.start), f._isInFirstContentOfListItem && (a._gfmTasklistFirstContentOfListItem = !0), a.write(d), f._isInFirstContentOfListItem && (a._gfmTasklistFirstContentOfListItem = void 0)), u = f, f = f.next;
  }
  for (f = t; ++p < s.length; )
    // Find a void token that includes a break.
    s[p][0] === "exit" && s[p - 1][0] === "enter" && s[p][1].type === s[p - 1][1].type && s[p][1].start.line !== s[p][1].end.line && (E = p + 1, _.push(E), f._tokenizer = void 0, f.previous = void 0, f = f.next);
  for (a.events = [], f ? (f._tokenizer = void 0, f.previous = void 0) : _.pop(), p = _.length; p--; ) {
    const h = s.slice(_[p], _[p + 1]), N = o.pop();
    l.push([N, N + h.length - 1]), e.splice(N, 2, h);
  }
  for (l.reverse(), p = -1; ++p < l.length; )
    c[g + l[p][0]] = g + l[p][1], g += l[p][1] - l[p][0] - 1;
  return c;
}
const zl = {
  resolve: $l,
  tokenize: Hl
}, Ul = {
  partial: !0,
  tokenize: Gl
};
function $l(e) {
  return za(e), e;
}
function Hl(e, n) {
  let t;
  return r;
  function r(s) {
    return e.enter("content"), t = e.enter("chunkContent", {
      contentType: "content"
    }), i(s);
  }
  function i(s) {
    return s === null ? o(s) : Y(s) ? e.check(Ul, a, o)(s) : (e.consume(s), i);
  }
  function o(s) {
    return e.exit("chunkContent"), e.exit("content"), n(s);
  }
  function a(s) {
    return e.consume(s), e.exit("chunkContent"), t.next = e.enter("chunkContent", {
      contentType: "content",
      previous: t
    }), t = t.next, i;
  }
}
function Gl(e, n, t) {
  const r = this;
  return i;
  function i(a) {
    return e.exit("chunkContent"), e.enter("lineEnding"), e.consume(a), e.exit("lineEnding"), se(e, o, "linePrefix");
  }
  function o(a) {
    if (a === null || Y(a))
      return t(a);
    const s = r.events[r.events.length - 1];
    return !r.parser.constructs.disable.null.includes("codeIndented") && s && s[1].type === "linePrefix" && s[2].sliceSerialize(s[1], !0).length >= 4 ? n(a) : e.interrupt(r.parser.constructs.flow, t, n)(a);
  }
}
function Ua(e, n, t, r, i, o, a, s, l) {
  const c = l || Number.POSITIVE_INFINITY;
  let d = 0;
  return u;
  function u(h) {
    return h === 60 ? (e.enter(r), e.enter(i), e.enter(o), e.consume(h), e.exit(o), p) : h === null || h === 32 || h === 41 || Nt(h) ? t(h) : (e.enter(r), e.enter(a), e.enter(s), e.enter("chunkString", {
      contentType: "string"
    }), E(h));
  }
  function p(h) {
    return h === 62 ? (e.enter(o), e.consume(h), e.exit(o), e.exit(i), e.exit(r), n) : (e.enter(s), e.enter("chunkString", {
      contentType: "string"
    }), f(h));
  }
  function f(h) {
    return h === 62 ? (e.exit("chunkString"), e.exit(s), p(h)) : h === null || h === 60 || Y(h) ? t(h) : (e.consume(h), h === 92 ? g : f);
  }
  function g(h) {
    return h === 60 || h === 62 || h === 92 ? (e.consume(h), f) : f(h);
  }
  function E(h) {
    return !d && (h === null || h === 41 || me(h)) ? (e.exit("chunkString"), e.exit(s), e.exit(a), e.exit(r), n(h)) : d < c && h === 40 ? (e.consume(h), d++, E) : h === 41 ? (e.consume(h), d--, E) : h === null || h === 32 || h === 40 || Nt(h) ? t(h) : (e.consume(h), h === 92 ? _ : E);
  }
  function _(h) {
    return h === 40 || h === 41 || h === 92 ? (e.consume(h), E) : E(h);
  }
}
function $a(e, n, t, r, i, o) {
  const a = this;
  let s = 0, l;
  return c;
  function c(f) {
    return e.enter(r), e.enter(i), e.consume(f), e.exit(i), e.enter(o), d;
  }
  function d(f) {
    return s > 999 || f === null || f === 91 || f === 93 && !l || // To do: remove in the future once we’ve switched from
    // `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
    // which doesn’t need this.
    // Hidden footnotes hook.
    /* c8 ignore next 3 */
    f === 94 && !s && "_hiddenFootnoteSupport" in a.parser.constructs ? t(f) : f === 93 ? (e.exit(o), e.enter(i), e.consume(f), e.exit(i), e.exit(r), n) : Y(f) ? (e.enter("lineEnding"), e.consume(f), e.exit("lineEnding"), d) : (e.enter("chunkString", {
      contentType: "string"
    }), u(f));
  }
  function u(f) {
    return f === null || f === 91 || f === 93 || Y(f) || s++ > 999 ? (e.exit("chunkString"), d(f)) : (e.consume(f), l || (l = !ae(f)), f === 92 ? p : u);
  }
  function p(f) {
    return f === 91 || f === 92 || f === 93 ? (e.consume(f), s++, u) : u(f);
  }
}
function Ha(e, n, t, r, i, o) {
  let a;
  return s;
  function s(p) {
    return p === 34 || p === 39 || p === 40 ? (e.enter(r), e.enter(i), e.consume(p), e.exit(i), a = p === 40 ? 41 : p, l) : t(p);
  }
  function l(p) {
    return p === a ? (e.enter(i), e.consume(p), e.exit(i), e.exit(r), n) : (e.enter(o), c(p));
  }
  function c(p) {
    return p === a ? (e.exit(o), l(a)) : p === null ? t(p) : Y(p) ? (e.enter("lineEnding"), e.consume(p), e.exit("lineEnding"), se(e, c, "linePrefix")) : (e.enter("chunkString", {
      contentType: "string"
    }), d(p));
  }
  function d(p) {
    return p === a || p === null || Y(p) ? (e.exit("chunkString"), c(p)) : (e.consume(p), p === 92 ? u : d);
  }
  function u(p) {
    return p === a || p === 92 ? (e.consume(p), d) : d(p);
  }
}
function Xn(e, n) {
  let t;
  return r;
  function r(i) {
    return Y(i) ? (e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), t = !0, r) : ae(i) ? se(e, r, t ? "linePrefix" : "lineSuffix")(i) : n(i);
  }
}
const ql = {
  name: "definition",
  tokenize: Wl
}, Kl = {
  partial: !0,
  tokenize: Vl
};
function Wl(e, n, t) {
  const r = this;
  let i;
  return o;
  function o(f) {
    return e.enter("definition"), a(f);
  }
  function a(f) {
    return $a.call(
      r,
      e,
      s,
      // Note: we don’t need to reset the way `markdown-rs` does.
      t,
      "definitionLabel",
      "definitionLabelMarker",
      "definitionLabelString"
    )(f);
  }
  function s(f) {
    return i = Ye(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1)), f === 58 ? (e.enter("definitionMarker"), e.consume(f), e.exit("definitionMarker"), l) : t(f);
  }
  function l(f) {
    return me(f) ? Xn(e, c)(f) : c(f);
  }
  function c(f) {
    return Ua(
      e,
      d,
      // Note: we don’t need to reset the way `markdown-rs` does.
      t,
      "definitionDestination",
      "definitionDestinationLiteral",
      "definitionDestinationLiteralMarker",
      "definitionDestinationRaw",
      "definitionDestinationString"
    )(f);
  }
  function d(f) {
    return e.attempt(Kl, u, u)(f);
  }
  function u(f) {
    return ae(f) ? se(e, p, "whitespace")(f) : p(f);
  }
  function p(f) {
    return f === null || Y(f) ? (e.exit("definition"), r.parser.defined.push(i), n(f)) : t(f);
  }
}
function Vl(e, n, t) {
  return r;
  function r(s) {
    return me(s) ? Xn(e, i)(s) : t(s);
  }
  function i(s) {
    return Ha(e, o, t, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(s);
  }
  function o(s) {
    return ae(s) ? se(e, a, "whitespace")(s) : a(s);
  }
  function a(s) {
    return s === null || Y(s) ? n(s) : t(s);
  }
}
const Yl = {
  name: "hardBreakEscape",
  tokenize: Zl
};
function Zl(e, n, t) {
  return r;
  function r(o) {
    return e.enter("hardBreakEscape"), e.consume(o), i;
  }
  function i(o) {
    return Y(o) ? (e.exit("hardBreakEscape"), n(o)) : t(o);
  }
}
const Xl = {
  name: "headingAtx",
  resolve: Ql,
  tokenize: Jl
};
function Ql(e, n) {
  let t = e.length - 2, r = 3, i, o;
  return e[r][1].type === "whitespace" && (r += 2), t - 2 > r && e[t][1].type === "whitespace" && (t -= 2), e[t][1].type === "atxHeadingSequence" && (r === t - 1 || t - 4 > r && e[t - 2][1].type === "whitespace") && (t -= r + 1 === t ? 2 : 4), t > r && (i = {
    type: "atxHeadingText",
    start: e[r][1].start,
    end: e[t][1].end
  }, o = {
    type: "chunkText",
    start: e[r][1].start,
    end: e[t][1].end,
    contentType: "text"
  }, He(e, r, t - r + 1, [["enter", i, n], ["enter", o, n], ["exit", o, n], ["exit", i, n]])), e;
}
function Jl(e, n, t) {
  let r = 0;
  return i;
  function i(d) {
    return e.enter("atxHeading"), o(d);
  }
  function o(d) {
    return e.enter("atxHeadingSequence"), a(d);
  }
  function a(d) {
    return d === 35 && r++ < 6 ? (e.consume(d), a) : d === null || me(d) ? (e.exit("atxHeadingSequence"), s(d)) : t(d);
  }
  function s(d) {
    return d === 35 ? (e.enter("atxHeadingSequence"), l(d)) : d === null || Y(d) ? (e.exit("atxHeading"), n(d)) : ae(d) ? se(e, s, "whitespace")(d) : (e.enter("atxHeadingText"), c(d));
  }
  function l(d) {
    return d === 35 ? (e.consume(d), l) : (e.exit("atxHeadingSequence"), s(d));
  }
  function c(d) {
    return d === null || d === 35 || me(d) ? (e.exit("atxHeadingText"), s(d)) : (e.consume(d), c);
  }
}
const jl = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
], Ni = ["pre", "script", "style", "textarea"], ec = {
  concrete: !0,
  name: "htmlFlow",
  resolveTo: rc,
  tokenize: ic
}, nc = {
  partial: !0,
  tokenize: oc
}, tc = {
  partial: !0,
  tokenize: ac
};
function rc(e) {
  let n = e.length;
  for (; n-- && !(e[n][0] === "enter" && e[n][1].type === "htmlFlow"); )
    ;
  return n > 1 && e[n - 2][1].type === "linePrefix" && (e[n][1].start = e[n - 2][1].start, e[n + 1][1].start = e[n - 2][1].start, e.splice(n - 2, 2)), e;
}
function ic(e, n, t) {
  const r = this;
  let i, o, a, s, l;
  return c;
  function c(y) {
    return d(y);
  }
  function d(y) {
    return e.enter("htmlFlow"), e.enter("htmlFlowData"), e.consume(y), u;
  }
  function u(y) {
    return y === 33 ? (e.consume(y), p) : y === 47 ? (e.consume(y), o = !0, E) : y === 63 ? (e.consume(y), i = 3, r.interrupt ? n : m) : Me(y) ? (e.consume(y), a = String.fromCharCode(y), _) : t(y);
  }
  function p(y) {
    return y === 45 ? (e.consume(y), i = 2, f) : y === 91 ? (e.consume(y), i = 5, s = 0, g) : Me(y) ? (e.consume(y), i = 4, r.interrupt ? n : m) : t(y);
  }
  function f(y) {
    return y === 45 ? (e.consume(y), r.interrupt ? n : m) : t(y);
  }
  function g(y) {
    const Ie = "CDATA[";
    return y === Ie.charCodeAt(s++) ? (e.consume(y), s === Ie.length ? r.interrupt ? n : $ : g) : t(y);
  }
  function E(y) {
    return Me(y) ? (e.consume(y), a = String.fromCharCode(y), _) : t(y);
  }
  function _(y) {
    if (y === null || y === 47 || y === 62 || me(y)) {
      const Ie = y === 47, Ge = a.toLowerCase();
      return !Ie && !o && Ni.includes(Ge) ? (i = 1, r.interrupt ? n(y) : $(y)) : jl.includes(a.toLowerCase()) ? (i = 6, Ie ? (e.consume(y), h) : r.interrupt ? n(y) : $(y)) : (i = 7, r.interrupt && !r.parser.lazy[r.now().line] ? t(y) : o ? N(y) : k(y));
    }
    return y === 45 || Ce(y) ? (e.consume(y), a += String.fromCharCode(y), _) : t(y);
  }
  function h(y) {
    return y === 62 ? (e.consume(y), r.interrupt ? n : $) : t(y);
  }
  function N(y) {
    return ae(y) ? (e.consume(y), N) : x(y);
  }
  function k(y) {
    return y === 47 ? (e.consume(y), x) : y === 58 || y === 95 || Me(y) ? (e.consume(y), v) : ae(y) ? (e.consume(y), k) : x(y);
  }
  function v(y) {
    return y === 45 || y === 46 || y === 58 || y === 95 || Ce(y) ? (e.consume(y), v) : I(y);
  }
  function I(y) {
    return y === 61 ? (e.consume(y), w) : ae(y) ? (e.consume(y), I) : k(y);
  }
  function w(y) {
    return y === null || y === 60 || y === 61 || y === 62 || y === 96 ? t(y) : y === 34 || y === 39 ? (e.consume(y), l = y, P) : ae(y) ? (e.consume(y), w) : C(y);
  }
  function P(y) {
    return y === l ? (e.consume(y), l = null, B) : y === null || Y(y) ? t(y) : (e.consume(y), P);
  }
  function C(y) {
    return y === null || y === 34 || y === 39 || y === 47 || y === 60 || y === 61 || y === 62 || y === 96 || me(y) ? I(y) : (e.consume(y), C);
  }
  function B(y) {
    return y === 47 || y === 62 || ae(y) ? k(y) : t(y);
  }
  function x(y) {
    return y === 62 ? (e.consume(y), D) : t(y);
  }
  function D(y) {
    return y === null || Y(y) ? $(y) : ae(y) ? (e.consume(y), D) : t(y);
  }
  function $(y) {
    return y === 45 && i === 2 ? (e.consume(y), X) : y === 60 && i === 1 ? (e.consume(y), H) : y === 62 && i === 4 ? (e.consume(y), fe) : y === 63 && i === 3 ? (e.consume(y), m) : y === 93 && i === 5 ? (e.consume(y), le) : Y(y) && (i === 6 || i === 7) ? (e.exit("htmlFlowData"), e.check(nc, ge, ne)(y)) : y === null || Y(y) ? (e.exit("htmlFlowData"), ne(y)) : (e.consume(y), $);
  }
  function ne(y) {
    return e.check(tc, z, ge)(y);
  }
  function z(y) {
    return e.enter("lineEnding"), e.consume(y), e.exit("lineEnding"), O;
  }
  function O(y) {
    return y === null || Y(y) ? ne(y) : (e.enter("htmlFlowData"), $(y));
  }
  function X(y) {
    return y === 45 ? (e.consume(y), m) : $(y);
  }
  function H(y) {
    return y === 47 ? (e.consume(y), a = "", Z) : $(y);
  }
  function Z(y) {
    if (y === 62) {
      const Ie = a.toLowerCase();
      return Ni.includes(Ie) ? (e.consume(y), fe) : $(y);
    }
    return Me(y) && a.length < 8 ? (e.consume(y), a += String.fromCharCode(y), Z) : $(y);
  }
  function le(y) {
    return y === 93 ? (e.consume(y), m) : $(y);
  }
  function m(y) {
    return y === 62 ? (e.consume(y), fe) : y === 45 && i === 2 ? (e.consume(y), m) : $(y);
  }
  function fe(y) {
    return y === null || Y(y) ? (e.exit("htmlFlowData"), ge(y)) : (e.consume(y), fe);
  }
  function ge(y) {
    return e.exit("htmlFlow"), n(y);
  }
}
function ac(e, n, t) {
  const r = this;
  return i;
  function i(a) {
    return Y(a) ? (e.enter("lineEnding"), e.consume(a), e.exit("lineEnding"), o) : t(a);
  }
  function o(a) {
    return r.parser.lazy[r.now().line] ? t(a) : n(a);
  }
}
function oc(e, n, t) {
  return r;
  function r(i) {
    return e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), e.attempt(tt, n, t);
  }
}
const sc = {
  name: "htmlText",
  tokenize: lc
};
function lc(e, n, t) {
  const r = this;
  let i, o, a;
  return s;
  function s(m) {
    return e.enter("htmlText"), e.enter("htmlTextData"), e.consume(m), l;
  }
  function l(m) {
    return m === 33 ? (e.consume(m), c) : m === 47 ? (e.consume(m), I) : m === 63 ? (e.consume(m), k) : Me(m) ? (e.consume(m), C) : t(m);
  }
  function c(m) {
    return m === 45 ? (e.consume(m), d) : m === 91 ? (e.consume(m), o = 0, g) : Me(m) ? (e.consume(m), N) : t(m);
  }
  function d(m) {
    return m === 45 ? (e.consume(m), f) : t(m);
  }
  function u(m) {
    return m === null ? t(m) : m === 45 ? (e.consume(m), p) : Y(m) ? (a = u, H(m)) : (e.consume(m), u);
  }
  function p(m) {
    return m === 45 ? (e.consume(m), f) : u(m);
  }
  function f(m) {
    return m === 62 ? X(m) : m === 45 ? p(m) : u(m);
  }
  function g(m) {
    const fe = "CDATA[";
    return m === fe.charCodeAt(o++) ? (e.consume(m), o === fe.length ? E : g) : t(m);
  }
  function E(m) {
    return m === null ? t(m) : m === 93 ? (e.consume(m), _) : Y(m) ? (a = E, H(m)) : (e.consume(m), E);
  }
  function _(m) {
    return m === 93 ? (e.consume(m), h) : E(m);
  }
  function h(m) {
    return m === 62 ? X(m) : m === 93 ? (e.consume(m), h) : E(m);
  }
  function N(m) {
    return m === null || m === 62 ? X(m) : Y(m) ? (a = N, H(m)) : (e.consume(m), N);
  }
  function k(m) {
    return m === null ? t(m) : m === 63 ? (e.consume(m), v) : Y(m) ? (a = k, H(m)) : (e.consume(m), k);
  }
  function v(m) {
    return m === 62 ? X(m) : k(m);
  }
  function I(m) {
    return Me(m) ? (e.consume(m), w) : t(m);
  }
  function w(m) {
    return m === 45 || Ce(m) ? (e.consume(m), w) : P(m);
  }
  function P(m) {
    return Y(m) ? (a = P, H(m)) : ae(m) ? (e.consume(m), P) : X(m);
  }
  function C(m) {
    return m === 45 || Ce(m) ? (e.consume(m), C) : m === 47 || m === 62 || me(m) ? B(m) : t(m);
  }
  function B(m) {
    return m === 47 ? (e.consume(m), X) : m === 58 || m === 95 || Me(m) ? (e.consume(m), x) : Y(m) ? (a = B, H(m)) : ae(m) ? (e.consume(m), B) : X(m);
  }
  function x(m) {
    return m === 45 || m === 46 || m === 58 || m === 95 || Ce(m) ? (e.consume(m), x) : D(m);
  }
  function D(m) {
    return m === 61 ? (e.consume(m), $) : Y(m) ? (a = D, H(m)) : ae(m) ? (e.consume(m), D) : B(m);
  }
  function $(m) {
    return m === null || m === 60 || m === 61 || m === 62 || m === 96 ? t(m) : m === 34 || m === 39 ? (e.consume(m), i = m, ne) : Y(m) ? (a = $, H(m)) : ae(m) ? (e.consume(m), $) : (e.consume(m), z);
  }
  function ne(m) {
    return m === i ? (e.consume(m), i = void 0, O) : m === null ? t(m) : Y(m) ? (a = ne, H(m)) : (e.consume(m), ne);
  }
  function z(m) {
    return m === null || m === 34 || m === 39 || m === 60 || m === 61 || m === 96 ? t(m) : m === 47 || m === 62 || me(m) ? B(m) : (e.consume(m), z);
  }
  function O(m) {
    return m === 47 || m === 62 || me(m) ? B(m) : t(m);
  }
  function X(m) {
    return m === 62 ? (e.consume(m), e.exit("htmlTextData"), e.exit("htmlText"), n) : t(m);
  }
  function H(m) {
    return e.exit("htmlTextData"), e.enter("lineEnding"), e.consume(m), e.exit("lineEnding"), Z;
  }
  function Z(m) {
    return ae(m) ? se(e, le, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(m) : le(m);
  }
  function le(m) {
    return e.enter("htmlTextData"), a(m);
  }
}
const zr = {
  name: "labelEnd",
  resolveAll: fc,
  resolveTo: pc,
  tokenize: gc
}, cc = {
  tokenize: hc
}, uc = {
  tokenize: mc
}, dc = {
  tokenize: bc
};
function fc(e) {
  let n = -1;
  const t = [];
  for (; ++n < e.length; ) {
    const r = e[n][1];
    if (t.push(e[n]), r.type === "labelImage" || r.type === "labelLink" || r.type === "labelEnd") {
      const i = r.type === "labelImage" ? 4 : 2;
      r.type = "data", n += i;
    }
  }
  return e.length !== t.length && He(e, 0, e.length, t), e;
}
function pc(e, n) {
  let t = e.length, r = 0, i, o, a, s;
  for (; t--; )
    if (i = e[t][1], o) {
      if (i.type === "link" || i.type === "labelLink" && i._inactive)
        break;
      e[t][0] === "enter" && i.type === "labelLink" && (i._inactive = !0);
    } else if (a) {
      if (e[t][0] === "enter" && (i.type === "labelImage" || i.type === "labelLink") && !i._balanced && (o = t, i.type !== "labelLink")) {
        r = 2;
        break;
      }
    } else i.type === "labelEnd" && (a = t);
  const l = {
    type: e[o][1].type === "labelLink" ? "link" : "image",
    start: {
      ...e[o][1].start
    },
    end: {
      ...e[e.length - 1][1].end
    }
  }, c = {
    type: "label",
    start: {
      ...e[o][1].start
    },
    end: {
      ...e[a][1].end
    }
  }, d = {
    type: "labelText",
    start: {
      ...e[o + r + 2][1].end
    },
    end: {
      ...e[a - 2][1].start
    }
  };
  return s = [["enter", l, n], ["enter", c, n]], s = qe(s, e.slice(o + 1, o + r + 3)), s = qe(s, [["enter", d, n]]), s = qe(s, Rt(n.parser.constructs.insideSpan.null, e.slice(o + r + 4, a - 3), n)), s = qe(s, [["exit", d, n], e[a - 2], e[a - 1], ["exit", c, n]]), s = qe(s, e.slice(a + 1)), s = qe(s, [["exit", l, n]]), He(e, o, e.length, s), e;
}
function gc(e, n, t) {
  const r = this;
  let i = r.events.length, o, a;
  for (; i--; )
    if ((r.events[i][1].type === "labelImage" || r.events[i][1].type === "labelLink") && !r.events[i][1]._balanced) {
      o = r.events[i][1];
      break;
    }
  return s;
  function s(p) {
    return o ? o._inactive ? u(p) : (a = r.parser.defined.includes(Ye(r.sliceSerialize({
      start: o.end,
      end: r.now()
    }))), e.enter("labelEnd"), e.enter("labelMarker"), e.consume(p), e.exit("labelMarker"), e.exit("labelEnd"), l) : t(p);
  }
  function l(p) {
    return p === 40 ? e.attempt(cc, d, a ? d : u)(p) : p === 91 ? e.attempt(uc, d, a ? c : u)(p) : a ? d(p) : u(p);
  }
  function c(p) {
    return e.attempt(dc, d, u)(p);
  }
  function d(p) {
    return n(p);
  }
  function u(p) {
    return o._balanced = !0, t(p);
  }
}
function hc(e, n, t) {
  return r;
  function r(u) {
    return e.enter("resource"), e.enter("resourceMarker"), e.consume(u), e.exit("resourceMarker"), i;
  }
  function i(u) {
    return me(u) ? Xn(e, o)(u) : o(u);
  }
  function o(u) {
    return u === 41 ? d(u) : Ua(e, a, s, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(u);
  }
  function a(u) {
    return me(u) ? Xn(e, l)(u) : d(u);
  }
  function s(u) {
    return t(u);
  }
  function l(u) {
    return u === 34 || u === 39 || u === 40 ? Ha(e, c, t, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(u) : d(u);
  }
  function c(u) {
    return me(u) ? Xn(e, d)(u) : d(u);
  }
  function d(u) {
    return u === 41 ? (e.enter("resourceMarker"), e.consume(u), e.exit("resourceMarker"), e.exit("resource"), n) : t(u);
  }
}
function mc(e, n, t) {
  const r = this;
  return i;
  function i(s) {
    return $a.call(r, e, o, a, "reference", "referenceMarker", "referenceString")(s);
  }
  function o(s) {
    return r.parser.defined.includes(Ye(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1))) ? n(s) : t(s);
  }
  function a(s) {
    return t(s);
  }
}
function bc(e, n, t) {
  return r;
  function r(o) {
    return e.enter("reference"), e.enter("referenceMarker"), e.consume(o), e.exit("referenceMarker"), i;
  }
  function i(o) {
    return o === 93 ? (e.enter("referenceMarker"), e.consume(o), e.exit("referenceMarker"), e.exit("reference"), n) : t(o);
  }
}
const Ec = {
  name: "labelStartImage",
  resolveAll: zr.resolveAll,
  tokenize: yc
};
function yc(e, n, t) {
  const r = this;
  return i;
  function i(s) {
    return e.enter("labelImage"), e.enter("labelImageMarker"), e.consume(s), e.exit("labelImageMarker"), o;
  }
  function o(s) {
    return s === 91 ? (e.enter("labelMarker"), e.consume(s), e.exit("labelMarker"), e.exit("labelImage"), a) : t(s);
  }
  function a(s) {
    return s === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? t(s) : n(s);
  }
}
const _c = {
  name: "labelStartLink",
  resolveAll: zr.resolveAll,
  tokenize: kc
};
function kc(e, n, t) {
  const r = this;
  return i;
  function i(a) {
    return e.enter("labelLink"), e.enter("labelMarker"), e.consume(a), e.exit("labelMarker"), e.exit("labelLink"), o;
  }
  function o(a) {
    return a === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? t(a) : n(a);
  }
}
const Xt = {
  name: "lineEnding",
  tokenize: wc
};
function wc(e, n) {
  return t;
  function t(r) {
    return e.enter("lineEnding"), e.consume(r), e.exit("lineEnding"), se(e, n, "linePrefix");
  }
}
const wt = {
  name: "thematicBreak",
  tokenize: xc
};
function xc(e, n, t) {
  let r = 0, i;
  return o;
  function o(c) {
    return e.enter("thematicBreak"), a(c);
  }
  function a(c) {
    return i = c, s(c);
  }
  function s(c) {
    return c === i ? (e.enter("thematicBreakSequence"), l(c)) : r >= 3 && (c === null || Y(c)) ? (e.exit("thematicBreak"), n(c)) : t(c);
  }
  function l(c) {
    return c === i ? (e.consume(c), r++, l) : (e.exit("thematicBreakSequence"), ae(c) ? se(e, s, "whitespace")(c) : s(c));
  }
}
const Le = {
  continuation: {
    tokenize: Tc
  },
  exit: Ac,
  name: "list",
  tokenize: vc
}, Nc = {
  partial: !0,
  tokenize: Ic
}, Sc = {
  partial: !0,
  tokenize: Cc
};
function vc(e, n, t) {
  const r = this, i = r.events[r.events.length - 1];
  let o = i && i[1].type === "linePrefix" ? i[2].sliceSerialize(i[1], !0).length : 0, a = 0;
  return s;
  function s(f) {
    const g = r.containerState.type || (f === 42 || f === 43 || f === 45 ? "listUnordered" : "listOrdered");
    if (g === "listUnordered" ? !r.containerState.marker || f === r.containerState.marker : mr(f)) {
      if (r.containerState.type || (r.containerState.type = g, e.enter(g, {
        _container: !0
      })), g === "listUnordered")
        return e.enter("listItemPrefix"), f === 42 || f === 45 ? e.check(wt, t, c)(f) : c(f);
      if (!r.interrupt || f === 49)
        return e.enter("listItemPrefix"), e.enter("listItemValue"), l(f);
    }
    return t(f);
  }
  function l(f) {
    return mr(f) && ++a < 10 ? (e.consume(f), l) : (!r.interrupt || a < 2) && (r.containerState.marker ? f === r.containerState.marker : f === 41 || f === 46) ? (e.exit("listItemValue"), c(f)) : t(f);
  }
  function c(f) {
    return e.enter("listItemMarker"), e.consume(f), e.exit("listItemMarker"), r.containerState.marker = r.containerState.marker || f, e.check(
      tt,
      // Can’t be empty when interrupting.
      r.interrupt ? t : d,
      e.attempt(Nc, p, u)
    );
  }
  function d(f) {
    return r.containerState.initialBlankLine = !0, o++, p(f);
  }
  function u(f) {
    return ae(f) ? (e.enter("listItemPrefixWhitespace"), e.consume(f), e.exit("listItemPrefixWhitespace"), p) : t(f);
  }
  function p(f) {
    return r.containerState.size = o + r.sliceSerialize(e.exit("listItemPrefix"), !0).length, n(f);
  }
}
function Tc(e, n, t) {
  const r = this;
  return r.containerState._closeFlow = void 0, e.check(tt, i, o);
  function i(s) {
    return r.containerState.furtherBlankLines = r.containerState.furtherBlankLines || r.containerState.initialBlankLine, se(e, n, "listItemIndent", r.containerState.size + 1)(s);
  }
  function o(s) {
    return r.containerState.furtherBlankLines || !ae(s) ? (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, a(s)) : (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, e.attempt(Sc, n, a)(s));
  }
  function a(s) {
    return r.containerState._closeFlow = !0, r.interrupt = void 0, se(e, e.attempt(Le, n, t), "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(s);
  }
}
function Cc(e, n, t) {
  const r = this;
  return se(e, i, "listItemIndent", r.containerState.size + 1);
  function i(o) {
    const a = r.events[r.events.length - 1];
    return a && a[1].type === "listItemIndent" && a[2].sliceSerialize(a[1], !0).length === r.containerState.size ? n(o) : t(o);
  }
}
function Ac(e) {
  e.exit(this.containerState.type);
}
function Ic(e, n, t) {
  const r = this;
  return se(e, i, "listItemPrefixWhitespace", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
  function i(o) {
    const a = r.events[r.events.length - 1];
    return !ae(o) && a && a[1].type === "listItemPrefixWhitespace" ? n(o) : t(o);
  }
}
const Si = {
  name: "setextUnderline",
  resolveTo: Oc,
  tokenize: Rc
};
function Oc(e, n) {
  let t = e.length, r, i, o;
  for (; t--; )
    if (e[t][0] === "enter") {
      if (e[t][1].type === "content") {
        r = t;
        break;
      }
      e[t][1].type === "paragraph" && (i = t);
    } else
      e[t][1].type === "content" && e.splice(t, 1), !o && e[t][1].type === "definition" && (o = t);
  const a = {
    type: "setextHeading",
    start: {
      ...e[r][1].start
    },
    end: {
      ...e[e.length - 1][1].end
    }
  };
  return e[i][1].type = "setextHeadingText", o ? (e.splice(i, 0, ["enter", a, n]), e.splice(o + 1, 0, ["exit", e[r][1], n]), e[r][1].end = {
    ...e[o][1].end
  }) : e[r][1] = a, e.push(["exit", a, n]), e;
}
function Rc(e, n, t) {
  const r = this;
  let i;
  return o;
  function o(c) {
    let d = r.events.length, u;
    for (; d--; )
      if (r.events[d][1].type !== "lineEnding" && r.events[d][1].type !== "linePrefix" && r.events[d][1].type !== "content") {
        u = r.events[d][1].type === "paragraph";
        break;
      }
    return !r.parser.lazy[r.now().line] && (r.interrupt || u) ? (e.enter("setextHeadingLine"), i = c, a(c)) : t(c);
  }
  function a(c) {
    return e.enter("setextHeadingLineSequence"), s(c);
  }
  function s(c) {
    return c === i ? (e.consume(c), s) : (e.exit("setextHeadingLineSequence"), ae(c) ? se(e, l, "lineSuffix")(c) : l(c));
  }
  function l(c) {
    return c === null || Y(c) ? (e.exit("setextHeadingLine"), n(c)) : t(c);
  }
}
const Mc = {
  tokenize: Lc
};
function Lc(e) {
  const n = this, t = e.attempt(
    // Try to parse a blank line.
    tt,
    r,
    // Try to parse initial flow (essentially, only code).
    e.attempt(this.parser.constructs.flowInitial, i, se(e, e.attempt(this.parser.constructs.flow, i, e.attempt(zl, i)), "linePrefix"))
  );
  return t;
  function r(o) {
    if (o === null) {
      e.consume(o);
      return;
    }
    return e.enter("lineEndingBlank"), e.consume(o), e.exit("lineEndingBlank"), n.currentConstruct = void 0, t;
  }
  function i(o) {
    if (o === null) {
      e.consume(o);
      return;
    }
    return e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), n.currentConstruct = void 0, t;
  }
}
const Dc = {
  resolveAll: qa()
}, Pc = Ga("string"), Bc = Ga("text");
function Ga(e) {
  return {
    resolveAll: qa(e === "text" ? Fc : void 0),
    tokenize: n
  };
  function n(t) {
    const r = this, i = this.parser.constructs[e], o = t.attempt(i, a, s);
    return a;
    function a(d) {
      return c(d) ? o(d) : s(d);
    }
    function s(d) {
      if (d === null) {
        t.consume(d);
        return;
      }
      return t.enter("data"), t.consume(d), l;
    }
    function l(d) {
      return c(d) ? (t.exit("data"), o(d)) : (t.consume(d), l);
    }
    function c(d) {
      if (d === null)
        return !0;
      const u = i[d];
      let p = -1;
      if (u)
        for (; ++p < u.length; ) {
          const f = u[p];
          if (!f.previous || f.previous.call(r, r.previous))
            return !0;
        }
      return !1;
    }
  }
}
function qa(e) {
  return n;
  function n(t, r) {
    let i = -1, o;
    for (; ++i <= t.length; )
      o === void 0 ? t[i] && t[i][1].type === "data" && (o = i, i++) : (!t[i] || t[i][1].type !== "data") && (i !== o + 2 && (t[o][1].end = t[i - 1][1].end, t.splice(o + 2, i - o - 2), i = o + 2), o = void 0);
    return e ? e(t, r) : t;
  }
}
function Fc(e, n) {
  let t = 0;
  for (; ++t <= e.length; )
    if ((t === e.length || e[t][1].type === "lineEnding") && e[t - 1][1].type === "data") {
      const r = e[t - 1][1], i = n.sliceStream(r);
      let o = i.length, a = -1, s = 0, l;
      for (; o--; ) {
        const c = i[o];
        if (typeof c == "string") {
          for (a = c.length; c.charCodeAt(a - 1) === 32; )
            s++, a--;
          if (a) break;
          a = -1;
        } else if (c === -2)
          l = !0, s++;
        else if (c !== -1) {
          o++;
          break;
        }
      }
      if (n._contentTypeTextTrailing && t === e.length && (s = 0), s) {
        const c = {
          type: t === e.length || l || s < 2 ? "lineSuffix" : "hardBreakTrailing",
          start: {
            _bufferIndex: o ? a : r.start._bufferIndex + a,
            _index: r.start._index + o,
            line: r.end.line,
            column: r.end.column - s,
            offset: r.end.offset - s
          },
          end: {
            ...r.end
          }
        };
        r.end = {
          ...c.start
        }, r.start.offset === r.end.offset ? Object.assign(r, c) : (e.splice(t, 0, ["enter", c, n], ["exit", c, n]), t += 2);
      }
      t++;
    }
  return e;
}
const zc = {
  42: Le,
  43: Le,
  45: Le,
  48: Le,
  49: Le,
  50: Le,
  51: Le,
  52: Le,
  53: Le,
  54: Le,
  55: Le,
  56: Le,
  57: Le,
  62: Pa
}, Uc = {
  91: ql
}, $c = {
  [-2]: Zt,
  [-1]: Zt,
  32: Zt
}, Hc = {
  35: Xl,
  42: wt,
  45: [Si, wt],
  60: ec,
  61: Si,
  95: wt,
  96: xi,
  126: xi
}, Gc = {
  38: Fa,
  92: Ba
}, qc = {
  [-5]: Xt,
  [-4]: Xt,
  [-3]: Xt,
  33: Ec,
  38: Fa,
  42: br,
  60: [_l, sc],
  91: _c,
  92: [Yl, Ba],
  93: zr,
  95: br,
  96: Ml
}, Kc = {
  null: [br, Dc]
}, Wc = {
  null: [42, 95]
}, Vc = {
  null: []
}, Yc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attentionMarkers: Wc,
  contentInitial: Uc,
  disable: Vc,
  document: zc,
  flow: Hc,
  flowInitial: $c,
  insideSpan: Kc,
  string: Gc,
  text: qc
}, Symbol.toStringTag, { value: "Module" }));
function Zc(e, n, t) {
  let r = {
    _bufferIndex: -1,
    _index: 0,
    line: t && t.line || 1,
    column: t && t.column || 1,
    offset: t && t.offset || 0
  };
  const i = {}, o = [];
  let a = [], s = [];
  const l = {
    attempt: P(I),
    check: P(w),
    consume: N,
    enter: k,
    exit: v,
    interrupt: P(w, {
      interrupt: !0
    })
  }, c = {
    code: null,
    containerState: {},
    defineSkip: E,
    events: [],
    now: g,
    parser: e,
    previous: null,
    sliceSerialize: p,
    sliceStream: f,
    write: u
  };
  let d = n.tokenize.call(c, l);
  return n.resolveAll && o.push(n), c;
  function u(D) {
    return a = qe(a, D), _(), a[a.length - 1] !== null ? [] : (C(n, 0), c.events = Rt(o, c.events, c), c.events);
  }
  function p(D, $) {
    return Qc(f(D), $);
  }
  function f(D) {
    return Xc(a, D);
  }
  function g() {
    const {
      _bufferIndex: D,
      _index: $,
      line: ne,
      column: z,
      offset: O
    } = r;
    return {
      _bufferIndex: D,
      _index: $,
      line: ne,
      column: z,
      offset: O
    };
  }
  function E(D) {
    i[D.line] = D.column, x();
  }
  function _() {
    let D;
    for (; r._index < a.length; ) {
      const $ = a[r._index];
      if (typeof $ == "string")
        for (D = r._index, r._bufferIndex < 0 && (r._bufferIndex = 0); r._index === D && r._bufferIndex < $.length; )
          h($.charCodeAt(r._bufferIndex));
      else
        h($);
    }
  }
  function h(D) {
    d = d(D);
  }
  function N(D) {
    Y(D) ? (r.line++, r.column = 1, r.offset += D === -3 ? 2 : 1, x()) : D !== -1 && (r.column++, r.offset++), r._bufferIndex < 0 ? r._index++ : (r._bufferIndex++, r._bufferIndex === // Points w/ non-negative `_bufferIndex` reference
    // strings.
    /** @type {string} */
    a[r._index].length && (r._bufferIndex = -1, r._index++)), c.previous = D;
  }
  function k(D, $) {
    const ne = $ || {};
    return ne.type = D, ne.start = g(), c.events.push(["enter", ne, c]), s.push(ne), ne;
  }
  function v(D) {
    const $ = s.pop();
    return $.end = g(), c.events.push(["exit", $, c]), $;
  }
  function I(D, $) {
    C(D, $.from);
  }
  function w(D, $) {
    $.restore();
  }
  function P(D, $) {
    return ne;
    function ne(z, O, X) {
      let H, Z, le, m;
      return Array.isArray(z) ? (
        /* c8 ignore next 1 */
        ge(z)
      ) : "tokenize" in z ? (
        // Looks like a construct.
        ge([
          /** @type {Construct} */
          z
        ])
      ) : fe(z);
      function fe(ye) {
        return tn;
        function tn(Pe) {
          const rn = Pe !== null && ye[Pe], Be = Pe !== null && ye.null, fn = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(rn) ? rn : rn ? [rn] : [],
            ...Array.isArray(Be) ? Be : Be ? [Be] : []
          ];
          return ge(fn)(Pe);
        }
      }
      function ge(ye) {
        return H = ye, Z = 0, ye.length === 0 ? X : y(ye[Z]);
      }
      function y(ye) {
        return tn;
        function tn(Pe) {
          return m = B(), le = ye, ye.partial || (c.currentConstruct = ye), ye.name && c.parser.constructs.disable.null.includes(ye.name) ? Ge() : ye.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            $ ? Object.assign(Object.create(c), $) : c,
            l,
            Ie,
            Ge
          )(Pe);
        }
      }
      function Ie(ye) {
        return D(le, m), O;
      }
      function Ge(ye) {
        return m.restore(), ++Z < H.length ? y(H[Z]) : X;
      }
    }
  }
  function C(D, $) {
    D.resolveAll && !o.includes(D) && o.push(D), D.resolve && He(c.events, $, c.events.length - $, D.resolve(c.events.slice($), c)), D.resolveTo && (c.events = D.resolveTo(c.events, c));
  }
  function B() {
    const D = g(), $ = c.previous, ne = c.currentConstruct, z = c.events.length, O = Array.from(s);
    return {
      from: z,
      restore: X
    };
    function X() {
      r = D, c.previous = $, c.currentConstruct = ne, c.events.length = z, s = O, x();
    }
  }
  function x() {
    r.line in i && r.column < 2 && (r.column = i[r.line], r.offset += i[r.line] - 1);
  }
}
function Xc(e, n) {
  const t = n.start._index, r = n.start._bufferIndex, i = n.end._index, o = n.end._bufferIndex;
  let a;
  if (t === i)
    a = [e[t].slice(r, o)];
  else {
    if (a = e.slice(t, i), r > -1) {
      const s = a[0];
      typeof s == "string" ? a[0] = s.slice(r) : a.shift();
    }
    o > 0 && a.push(e[i].slice(0, o));
  }
  return a;
}
function Qc(e, n) {
  let t = -1;
  const r = [];
  let i;
  for (; ++t < e.length; ) {
    const o = e[t];
    let a;
    if (typeof o == "string")
      a = o;
    else switch (o) {
      case -5: {
        a = "\r";
        break;
      }
      case -4: {
        a = `
`;
        break;
      }
      case -3: {
        a = `\r
`;
        break;
      }
      case -2: {
        a = n ? " " : "	";
        break;
      }
      case -1: {
        if (!n && i) continue;
        a = " ";
        break;
      }
      default:
        a = String.fromCharCode(o);
    }
    i = o === -2, r.push(a);
  }
  return r.join("");
}
function Jc(e) {
  const r = {
    constructs: (
      /** @type {FullNormalizedExtension} */
      La([Yc, ...(e || {}).extensions || []])
    ),
    content: i(pl),
    defined: [],
    document: i(hl),
    flow: i(Mc),
    lazy: {},
    string: i(Pc),
    text: i(Bc)
  };
  return r;
  function i(o) {
    return a;
    function a(s) {
      return Zc(r, o, s);
    }
  }
}
function jc(e) {
  for (; !za(e); )
    ;
  return e;
}
const vi = /[\0\t\n\r]/g;
function eu() {
  let e = 1, n = "", t = !0, r;
  return i;
  function i(o, a, s) {
    const l = [];
    let c, d, u, p, f;
    for (o = n + (typeof o == "string" ? o.toString() : new TextDecoder(a || void 0).decode(o)), u = 0, n = "", t && (o.charCodeAt(0) === 65279 && u++, t = void 0); u < o.length; ) {
      if (vi.lastIndex = u, c = vi.exec(o), p = c && c.index !== void 0 ? c.index : o.length, f = o.charCodeAt(p), !c) {
        n = o.slice(u);
        break;
      }
      if (f === 10 && u === p && r)
        l.push(-3), r = void 0;
      else
        switch (r && (l.push(-5), r = void 0), u < p && (l.push(o.slice(u, p)), e += p - u), f) {
          case 0: {
            l.push(65533), e++;
            break;
          }
          case 9: {
            for (d = Math.ceil(e / 4) * 4, l.push(-2); e++ < d; ) l.push(-1);
            break;
          }
          case 10: {
            l.push(-4), e = 1;
            break;
          }
          default:
            r = !0, e = 1;
        }
      u = p + 1;
    }
    return s && (r && l.push(-5), n && l.push(n), l.push(null)), l;
  }
}
const nu = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function tu(e) {
  return e.replace(nu, ru);
}
function ru(e, n, t) {
  if (n)
    return n;
  if (t.charCodeAt(0) === 35) {
    const i = t.charCodeAt(1), o = i === 120 || i === 88;
    return Da(t.slice(o ? 2 : 1), o ? 16 : 10);
  }
  return Fr(t) || e;
}
const Ka = {}.hasOwnProperty;
function iu(e, n, t) {
  return n && typeof n == "object" && (t = n, n = void 0), au(t)(jc(Jc(t).document().write(eu()(e, n, !0))));
}
function au(e) {
  const n = {
    transforms: [],
    canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
    enter: {
      autolink: o(Tn),
      autolinkProtocol: B,
      autolinkEmail: B,
      atxHeading: o(vn),
      blockQuote: o(Be),
      characterEscape: B,
      characterReference: B,
      codeFenced: o(fn),
      codeFencedFenceInfo: a,
      codeFencedFenceMeta: a,
      codeIndented: o(fn, a),
      codeText: o(Fn, a),
      codeTextData: B,
      data: B,
      codeFlowValue: B,
      definition: o(zn),
      definitionDestinationString: a,
      definitionLabelString: a,
      definitionTitleString: a,
      emphasis: o(Un),
      hardBreakEscape: o(ce),
      hardBreakTrailing: o(ce),
      htmlFlow: o(an, a),
      htmlFlowData: B,
      htmlText: o(an, a),
      htmlTextData: B,
      image: o(on),
      label: a,
      link: o(Tn),
      listItem: o(Ft),
      listItemValue: p,
      listOrdered: o($n, u),
      listUnordered: o($n),
      paragraph: o(zt),
      reference: y,
      referenceString: a,
      resourceDestinationString: a,
      resourceTitleString: a,
      setextHeading: o(vn),
      strong: o(at),
      thematicBreak: o(ot)
    },
    exit: {
      atxHeading: l(),
      atxHeadingSequence: I,
      autolink: l(),
      autolinkEmail: rn,
      autolinkProtocol: Pe,
      blockQuote: l(),
      characterEscapeValue: x,
      characterReferenceMarkerHexadecimal: Ge,
      characterReferenceMarkerNumeric: Ge,
      characterReferenceValue: ye,
      characterReference: tn,
      codeFenced: l(_),
      codeFencedFence: E,
      codeFencedFenceInfo: f,
      codeFencedFenceMeta: g,
      codeFlowValue: x,
      codeIndented: l(h),
      codeText: l(O),
      codeTextData: x,
      data: x,
      definition: l(),
      definitionDestinationString: v,
      definitionLabelString: N,
      definitionTitleString: k,
      emphasis: l(),
      hardBreakEscape: l($),
      hardBreakTrailing: l($),
      htmlFlow: l(ne),
      htmlFlowData: x,
      htmlText: l(z),
      htmlTextData: x,
      image: l(H),
      label: le,
      labelText: Z,
      lineEnding: D,
      link: l(X),
      listItem: l(),
      listOrdered: l(),
      listUnordered: l(),
      paragraph: l(),
      referenceString: Ie,
      resourceDestinationString: m,
      resourceTitleString: fe,
      resource: ge,
      setextHeading: l(C),
      setextHeadingLineSequence: P,
      setextHeadingText: w,
      strong: l(),
      thematicBreak: l()
    }
  };
  Wa(n, (e || {}).mdastExtensions || []);
  const t = {};
  return r;
  function r(S) {
    let L = {
      type: "root",
      children: []
    };
    const Q = {
      stack: [L],
      tokenStack: [],
      config: n,
      enter: s,
      exit: c,
      buffer: a,
      resume: d,
      data: t
    }, ie = [];
    let ue = -1;
    for (; ++ue < S.length; )
      if (S[ue][1].type === "listOrdered" || S[ue][1].type === "listUnordered")
        if (S[ue][0] === "enter")
          ie.push(ue);
        else {
          const Fe = ie.pop();
          ue = i(S, Fe, ue);
        }
    for (ue = -1; ++ue < S.length; ) {
      const Fe = n[S[ue][0]];
      Ka.call(Fe, S[ue][1].type) && Fe[S[ue][1].type].call(Object.assign({
        sliceSerialize: S[ue][2].sliceSerialize
      }, Q), S[ue][1]);
    }
    if (Q.tokenStack.length > 0) {
      const Fe = Q.tokenStack[Q.tokenStack.length - 1];
      (Fe[1] || Ti).call(Q, void 0, Fe[0]);
    }
    for (L.position = {
      start: bn(S.length > 0 ? S[0][1].start : {
        line: 1,
        column: 1,
        offset: 0
      }),
      end: bn(S.length > 0 ? S[S.length - 2][1].end : {
        line: 1,
        column: 1,
        offset: 0
      })
    }, ue = -1; ++ue < n.transforms.length; )
      L = n.transforms[ue](L) || L;
    return L;
  }
  function i(S, L, Q) {
    let ie = L - 1, ue = -1, Fe = !1, ln, We, pn, yn;
    for (; ++ie <= Q; ) {
      const Oe = S[ie];
      switch (Oe[1].type) {
        case "listUnordered":
        case "listOrdered":
        case "blockQuote": {
          Oe[0] === "enter" ? ue++ : ue--, yn = void 0;
          break;
        }
        case "lineEndingBlank": {
          Oe[0] === "enter" && (ln && !yn && !ue && !pn && (pn = ie), yn = void 0);
          break;
        }
        case "linePrefix":
        case "listItemValue":
        case "listItemMarker":
        case "listItemPrefix":
        case "listItemPrefixWhitespace":
          break;
        default:
          yn = void 0;
      }
      if (!ue && Oe[0] === "enter" && Oe[1].type === "listItemPrefix" || ue === -1 && Oe[0] === "exit" && (Oe[1].type === "listUnordered" || Oe[1].type === "listOrdered")) {
        if (ln) {
          let gn = ie;
          for (We = void 0; gn--; ) {
            const ze = S[gn];
            if (ze[1].type === "lineEnding" || ze[1].type === "lineEndingBlank") {
              if (ze[0] === "exit") continue;
              We && (S[We][1].type = "lineEndingBlank", Fe = !0), ze[1].type = "lineEnding", We = gn;
            } else if (!(ze[1].type === "linePrefix" || ze[1].type === "blockQuotePrefix" || ze[1].type === "blockQuotePrefixWhitespace" || ze[1].type === "blockQuoteMarker" || ze[1].type === "listItemIndent")) break;
          }
          pn && (!We || pn < We) && (ln._spread = !0), ln.end = Object.assign({}, We ? S[We][1].start : Oe[1].end), S.splice(We || ie, 0, ["exit", ln, Oe[2]]), ie++, Q++;
        }
        if (Oe[1].type === "listItemPrefix") {
          const gn = {
            type: "listItem",
            _spread: !1,
            start: Object.assign({}, Oe[1].start),
            // @ts-expect-error: we’ll add `end` in a second.
            end: void 0
          };
          ln = gn, S.splice(ie, 0, ["enter", gn, Oe[2]]), ie++, Q++, pn = void 0, yn = !0;
        }
      }
    }
    return S[L][1]._spread = Fe, Q;
  }
  function o(S, L) {
    return Q;
    function Q(ie) {
      s.call(this, S(ie), ie), L && L.call(this, ie);
    }
  }
  function a() {
    this.stack.push({
      type: "fragment",
      children: []
    });
  }
  function s(S, L, Q) {
    this.stack[this.stack.length - 1].children.push(S), this.stack.push(S), this.tokenStack.push([L, Q || void 0]), S.position = {
      start: bn(L.start),
      // @ts-expect-error: `end` will be patched later.
      end: void 0
    };
  }
  function l(S) {
    return L;
    function L(Q) {
      S && S.call(this, Q), c.call(this, Q);
    }
  }
  function c(S, L) {
    const Q = this.stack.pop(), ie = this.tokenStack.pop();
    if (ie)
      ie[0].type !== S.type && (L ? L.call(this, S, ie[0]) : (ie[1] || Ti).call(this, S, ie[0]));
    else throw new Error("Cannot close `" + S.type + "` (" + Zn({
      start: S.start,
      end: S.end
    }) + "): it’s not open");
    Q.position.end = bn(S.end);
  }
  function d() {
    return Br(this.stack.pop());
  }
  function u() {
    this.data.expectingFirstListItemValue = !0;
  }
  function p(S) {
    if (this.data.expectingFirstListItemValue) {
      const L = this.stack[this.stack.length - 2];
      L.start = Number.parseInt(this.sliceSerialize(S), 10), this.data.expectingFirstListItemValue = void 0;
    }
  }
  function f() {
    const S = this.resume(), L = this.stack[this.stack.length - 1];
    L.lang = S;
  }
  function g() {
    const S = this.resume(), L = this.stack[this.stack.length - 1];
    L.meta = S;
  }
  function E() {
    this.data.flowCodeInside || (this.buffer(), this.data.flowCodeInside = !0);
  }
  function _() {
    const S = this.resume(), L = this.stack[this.stack.length - 1];
    L.value = S.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, ""), this.data.flowCodeInside = void 0;
  }
  function h() {
    const S = this.resume(), L = this.stack[this.stack.length - 1];
    L.value = S.replace(/(\r?\n|\r)$/g, "");
  }
  function N(S) {
    const L = this.resume(), Q = this.stack[this.stack.length - 1];
    Q.label = L, Q.identifier = Ye(this.sliceSerialize(S)).toLowerCase();
  }
  function k() {
    const S = this.resume(), L = this.stack[this.stack.length - 1];
    L.title = S;
  }
  function v() {
    const S = this.resume(), L = this.stack[this.stack.length - 1];
    L.url = S;
  }
  function I(S) {
    const L = this.stack[this.stack.length - 1];
    if (!L.depth) {
      const Q = this.sliceSerialize(S).length;
      L.depth = Q;
    }
  }
  function w() {
    this.data.setextHeadingSlurpLineEnding = !0;
  }
  function P(S) {
    const L = this.stack[this.stack.length - 1];
    L.depth = this.sliceSerialize(S).codePointAt(0) === 61 ? 1 : 2;
  }
  function C() {
    this.data.setextHeadingSlurpLineEnding = void 0;
  }
  function B(S) {
    const Q = this.stack[this.stack.length - 1].children;
    let ie = Q[Q.length - 1];
    (!ie || ie.type !== "text") && (ie = sn(), ie.position = {
      start: bn(S.start),
      // @ts-expect-error: we’ll add `end` later.
      end: void 0
    }, Q.push(ie)), this.stack.push(ie);
  }
  function x(S) {
    const L = this.stack.pop();
    L.value += this.sliceSerialize(S), L.position.end = bn(S.end);
  }
  function D(S) {
    const L = this.stack[this.stack.length - 1];
    if (this.data.atHardBreak) {
      const Q = L.children[L.children.length - 1];
      Q.position.end = bn(S.end), this.data.atHardBreak = void 0;
      return;
    }
    !this.data.setextHeadingSlurpLineEnding && n.canContainEols.includes(L.type) && (B.call(this, S), x.call(this, S));
  }
  function $() {
    this.data.atHardBreak = !0;
  }
  function ne() {
    const S = this.resume(), L = this.stack[this.stack.length - 1];
    L.value = S;
  }
  function z() {
    const S = this.resume(), L = this.stack[this.stack.length - 1];
    L.value = S;
  }
  function O() {
    const S = this.resume(), L = this.stack[this.stack.length - 1];
    L.value = S;
  }
  function X() {
    const S = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const L = this.data.referenceType || "shortcut";
      S.type += "Reference", S.referenceType = L, delete S.url, delete S.title;
    } else
      delete S.identifier, delete S.label;
    this.data.referenceType = void 0;
  }
  function H() {
    const S = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const L = this.data.referenceType || "shortcut";
      S.type += "Reference", S.referenceType = L, delete S.url, delete S.title;
    } else
      delete S.identifier, delete S.label;
    this.data.referenceType = void 0;
  }
  function Z(S) {
    const L = this.sliceSerialize(S), Q = this.stack[this.stack.length - 2];
    Q.label = tu(L), Q.identifier = Ye(L).toLowerCase();
  }
  function le() {
    const S = this.stack[this.stack.length - 1], L = this.resume(), Q = this.stack[this.stack.length - 1];
    if (this.data.inReference = !0, Q.type === "link") {
      const ie = S.children;
      Q.children = ie;
    } else
      Q.alt = L;
  }
  function m() {
    const S = this.resume(), L = this.stack[this.stack.length - 1];
    L.url = S;
  }
  function fe() {
    const S = this.resume(), L = this.stack[this.stack.length - 1];
    L.title = S;
  }
  function ge() {
    this.data.inReference = void 0;
  }
  function y() {
    this.data.referenceType = "collapsed";
  }
  function Ie(S) {
    const L = this.resume(), Q = this.stack[this.stack.length - 1];
    Q.label = L, Q.identifier = Ye(this.sliceSerialize(S)).toLowerCase(), this.data.referenceType = "full";
  }
  function Ge(S) {
    this.data.characterReferenceType = S.type;
  }
  function ye(S) {
    const L = this.sliceSerialize(S), Q = this.data.characterReferenceType;
    let ie;
    Q ? (ie = Da(L, Q === "characterReferenceMarkerNumeric" ? 10 : 16), this.data.characterReferenceType = void 0) : ie = Fr(L);
    const ue = this.stack[this.stack.length - 1];
    ue.value += ie;
  }
  function tn(S) {
    const L = this.stack.pop();
    L.position.end = bn(S.end);
  }
  function Pe(S) {
    x.call(this, S);
    const L = this.stack[this.stack.length - 1];
    L.url = this.sliceSerialize(S);
  }
  function rn(S) {
    x.call(this, S);
    const L = this.stack[this.stack.length - 1];
    L.url = "mailto:" + this.sliceSerialize(S);
  }
  function Be() {
    return {
      type: "blockquote",
      children: []
    };
  }
  function fn() {
    return {
      type: "code",
      lang: null,
      meta: null,
      value: ""
    };
  }
  function Fn() {
    return {
      type: "inlineCode",
      value: ""
    };
  }
  function zn() {
    return {
      type: "definition",
      identifier: "",
      label: null,
      title: null,
      url: ""
    };
  }
  function Un() {
    return {
      type: "emphasis",
      children: []
    };
  }
  function vn() {
    return {
      type: "heading",
      // @ts-expect-error `depth` will be set later.
      depth: 0,
      children: []
    };
  }
  function ce() {
    return {
      type: "break"
    };
  }
  function an() {
    return {
      type: "html",
      value: ""
    };
  }
  function on() {
    return {
      type: "image",
      title: null,
      url: "",
      alt: null
    };
  }
  function Tn() {
    return {
      type: "link",
      title: null,
      url: "",
      children: []
    };
  }
  function $n(S) {
    return {
      type: "list",
      ordered: S.type === "listOrdered",
      start: null,
      spread: S._spread,
      children: []
    };
  }
  function Ft(S) {
    return {
      type: "listItem",
      spread: S._spread,
      checked: null,
      children: []
    };
  }
  function zt() {
    return {
      type: "paragraph",
      children: []
    };
  }
  function at() {
    return {
      type: "strong",
      children: []
    };
  }
  function sn() {
    return {
      type: "text",
      value: ""
    };
  }
  function ot() {
    return {
      type: "thematicBreak"
    };
  }
}
function bn(e) {
  return {
    line: e.line,
    column: e.column,
    offset: e.offset
  };
}
function Wa(e, n) {
  let t = -1;
  for (; ++t < n.length; ) {
    const r = n[t];
    Array.isArray(r) ? Wa(e, r) : ou(e, r);
  }
}
function ou(e, n) {
  let t;
  for (t in n)
    if (Ka.call(n, t))
      switch (t) {
        case "canContainEols": {
          const r = n[t];
          r && e[t].push(...r);
          break;
        }
        case "transforms": {
          const r = n[t];
          r && e[t].push(...r);
          break;
        }
        case "enter":
        case "exit": {
          const r = n[t];
          r && Object.assign(e[t], r);
          break;
        }
      }
}
function Ti(e, n) {
  throw e ? new Error("Cannot close `" + e.type + "` (" + Zn({
    start: e.start,
    end: e.end
  }) + "): a different token (`" + n.type + "`, " + Zn({
    start: n.start,
    end: n.end
  }) + ") is open") : new Error("Cannot close document, a token (`" + n.type + "`, " + Zn({
    start: n.start,
    end: n.end
  }) + ") is still open");
}
function su(e) {
  const n = this;
  n.parser = t;
  function t(r) {
    return iu(r, {
      ...n.data("settings"),
      ...e,
      // Note: these options are not in the readme.
      // The goal is for them to be set by plugins on `data` instead of being
      // passed by users.
      extensions: n.data("micromarkExtensions") || [],
      mdastExtensions: n.data("fromMarkdownExtensions") || []
    });
  }
}
function lu(e, n) {
  const t = {
    type: "element",
    tagName: "blockquote",
    properties: {},
    children: e.wrap(e.all(n), !0)
  };
  return e.patch(n, t), e.applyData(n, t);
}
function cu(e, n) {
  const t = { type: "element", tagName: "br", properties: {}, children: [] };
  return e.patch(n, t), [e.applyData(n, t), { type: "text", value: `
` }];
}
function uu(e, n) {
  const t = n.value ? n.value + `
` : "", r = {}, i = n.lang ? n.lang.split(/\s+/) : [];
  i.length > 0 && (r.className = ["language-" + i[0]]);
  let o = {
    type: "element",
    tagName: "code",
    properties: r,
    children: [{ type: "text", value: t }]
  };
  return n.meta && (o.data = { meta: n.meta }), e.patch(n, o), o = e.applyData(n, o), o = { type: "element", tagName: "pre", properties: {}, children: [o] }, e.patch(n, o), o;
}
function du(e, n) {
  const t = {
    type: "element",
    tagName: "del",
    properties: {},
    children: e.all(n)
  };
  return e.patch(n, t), e.applyData(n, t);
}
function fu(e, n) {
  const t = {
    type: "element",
    tagName: "em",
    properties: {},
    children: e.all(n)
  };
  return e.patch(n, t), e.applyData(n, t);
}
function pu(e, n) {
  const t = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", r = String(n.identifier).toUpperCase(), i = Bn(r.toLowerCase()), o = e.footnoteOrder.indexOf(r);
  let a, s = e.footnoteCounts.get(r);
  s === void 0 ? (s = 0, e.footnoteOrder.push(r), a = e.footnoteOrder.length) : a = o + 1, s += 1, e.footnoteCounts.set(r, s);
  const l = {
    type: "element",
    tagName: "a",
    properties: {
      href: "#" + t + "fn-" + i,
      id: t + "fnref-" + i + (s > 1 ? "-" + s : ""),
      dataFootnoteRef: !0,
      ariaDescribedBy: ["footnote-label"]
    },
    children: [{ type: "text", value: String(a) }]
  };
  e.patch(n, l);
  const c = {
    type: "element",
    tagName: "sup",
    properties: {},
    children: [l]
  };
  return e.patch(n, c), e.applyData(n, c);
}
function gu(e, n) {
  const t = {
    type: "element",
    tagName: "h" + n.depth,
    properties: {},
    children: e.all(n)
  };
  return e.patch(n, t), e.applyData(n, t);
}
function hu(e, n) {
  if (e.options.allowDangerousHtml) {
    const t = { type: "raw", value: n.value };
    return e.patch(n, t), e.applyData(n, t);
  }
}
function Va(e, n) {
  const t = n.referenceType;
  let r = "]";
  if (t === "collapsed" ? r += "[]" : t === "full" && (r += "[" + (n.label || n.identifier) + "]"), n.type === "imageReference")
    return [{ type: "text", value: "![" + n.alt + r }];
  const i = e.all(n), o = i[0];
  o && o.type === "text" ? o.value = "[" + o.value : i.unshift({ type: "text", value: "[" });
  const a = i[i.length - 1];
  return a && a.type === "text" ? a.value += r : i.push({ type: "text", value: r }), i;
}
function mu(e, n) {
  const t = String(n.identifier).toUpperCase(), r = e.definitionById.get(t);
  if (!r)
    return Va(e, n);
  const i = { src: Bn(r.url || ""), alt: n.alt };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const o = { type: "element", tagName: "img", properties: i, children: [] };
  return e.patch(n, o), e.applyData(n, o);
}
function bu(e, n) {
  const t = { src: Bn(n.url) };
  n.alt !== null && n.alt !== void 0 && (t.alt = n.alt), n.title !== null && n.title !== void 0 && (t.title = n.title);
  const r = { type: "element", tagName: "img", properties: t, children: [] };
  return e.patch(n, r), e.applyData(n, r);
}
function Eu(e, n) {
  const t = { type: "text", value: n.value.replace(/\r?\n|\r/g, " ") };
  e.patch(n, t);
  const r = {
    type: "element",
    tagName: "code",
    properties: {},
    children: [t]
  };
  return e.patch(n, r), e.applyData(n, r);
}
function yu(e, n) {
  const t = String(n.identifier).toUpperCase(), r = e.definitionById.get(t);
  if (!r)
    return Va(e, n);
  const i = { href: Bn(r.url || "") };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const o = {
    type: "element",
    tagName: "a",
    properties: i,
    children: e.all(n)
  };
  return e.patch(n, o), e.applyData(n, o);
}
function _u(e, n) {
  const t = { href: Bn(n.url) };
  n.title !== null && n.title !== void 0 && (t.title = n.title);
  const r = {
    type: "element",
    tagName: "a",
    properties: t,
    children: e.all(n)
  };
  return e.patch(n, r), e.applyData(n, r);
}
function ku(e, n, t) {
  const r = e.all(n), i = t ? wu(t) : Ya(n), o = {}, a = [];
  if (typeof n.checked == "boolean") {
    const d = r[0];
    let u;
    d && d.type === "element" && d.tagName === "p" ? u = d : (u = { type: "element", tagName: "p", properties: {}, children: [] }, r.unshift(u)), u.children.length > 0 && u.children.unshift({ type: "text", value: " " }), u.children.unshift({
      type: "element",
      tagName: "input",
      properties: { type: "checkbox", checked: n.checked, disabled: !0 },
      children: []
    }), o.className = ["task-list-item"];
  }
  let s = -1;
  for (; ++s < r.length; ) {
    const d = r[s];
    (i || s !== 0 || d.type !== "element" || d.tagName !== "p") && a.push({ type: "text", value: `
` }), d.type === "element" && d.tagName === "p" && !i ? a.push(...d.children) : a.push(d);
  }
  const l = r[r.length - 1];
  l && (i || l.type !== "element" || l.tagName !== "p") && a.push({ type: "text", value: `
` });
  const c = { type: "element", tagName: "li", properties: o, children: a };
  return e.patch(n, c), e.applyData(n, c);
}
function wu(e) {
  let n = !1;
  if (e.type === "list") {
    n = e.spread || !1;
    const t = e.children;
    let r = -1;
    for (; !n && ++r < t.length; )
      n = Ya(t[r]);
  }
  return n;
}
function Ya(e) {
  const n = e.spread;
  return n ?? e.children.length > 1;
}
function xu(e, n) {
  const t = {}, r = e.all(n);
  let i = -1;
  for (typeof n.start == "number" && n.start !== 1 && (t.start = n.start); ++i < r.length; ) {
    const a = r[i];
    if (a.type === "element" && a.tagName === "li" && a.properties && Array.isArray(a.properties.className) && a.properties.className.includes("task-list-item")) {
      t.className = ["contains-task-list"];
      break;
    }
  }
  const o = {
    type: "element",
    tagName: n.ordered ? "ol" : "ul",
    properties: t,
    children: e.wrap(r, !0)
  };
  return e.patch(n, o), e.applyData(n, o);
}
function Nu(e, n) {
  const t = {
    type: "element",
    tagName: "p",
    properties: {},
    children: e.all(n)
  };
  return e.patch(n, t), e.applyData(n, t);
}
function Su(e, n) {
  const t = { type: "root", children: e.wrap(e.all(n)) };
  return e.patch(n, t), e.applyData(n, t);
}
function vu(e, n) {
  const t = {
    type: "element",
    tagName: "strong",
    properties: {},
    children: e.all(n)
  };
  return e.patch(n, t), e.applyData(n, t);
}
function Tu(e, n) {
  const t = e.all(n), r = t.shift(), i = [];
  if (r) {
    const a = {
      type: "element",
      tagName: "thead",
      properties: {},
      children: e.wrap([r], !0)
    };
    e.patch(n.children[0], a), i.push(a);
  }
  if (t.length > 0) {
    const a = {
      type: "element",
      tagName: "tbody",
      properties: {},
      children: e.wrap(t, !0)
    }, s = Mr(n.children[1]), l = Ta(n.children[n.children.length - 1]);
    s && l && (a.position = { start: s, end: l }), i.push(a);
  }
  const o = {
    type: "element",
    tagName: "table",
    properties: {},
    children: e.wrap(i, !0)
  };
  return e.patch(n, o), e.applyData(n, o);
}
function Cu(e, n, t) {
  const r = t ? t.children : void 0, o = (r ? r.indexOf(n) : 1) === 0 ? "th" : "td", a = t && t.type === "table" ? t.align : void 0, s = a ? a.length : n.children.length;
  let l = -1;
  const c = [];
  for (; ++l < s; ) {
    const u = n.children[l], p = {}, f = a ? a[l] : void 0;
    f && (p.align = f);
    let g = { type: "element", tagName: o, properties: p, children: [] };
    u && (g.children = e.all(u), e.patch(u, g), g = e.applyData(u, g)), c.push(g);
  }
  const d = {
    type: "element",
    tagName: "tr",
    properties: {},
    children: e.wrap(c, !0)
  };
  return e.patch(n, d), e.applyData(n, d);
}
function Au(e, n) {
  const t = {
    type: "element",
    tagName: "td",
    // Assume body cell.
    properties: {},
    children: e.all(n)
  };
  return e.patch(n, t), e.applyData(n, t);
}
const Ci = 9, Ai = 32;
function Iu(e) {
  const n = String(e), t = /\r?\n|\r/g;
  let r = t.exec(n), i = 0;
  const o = [];
  for (; r; )
    o.push(
      Ii(n.slice(i, r.index), i > 0, !0),
      r[0]
    ), i = r.index + r[0].length, r = t.exec(n);
  return o.push(Ii(n.slice(i), i > 0, !1)), o.join("");
}
function Ii(e, n, t) {
  let r = 0, i = e.length;
  if (n) {
    let o = e.codePointAt(r);
    for (; o === Ci || o === Ai; )
      r++, o = e.codePointAt(r);
  }
  if (t) {
    let o = e.codePointAt(i - 1);
    for (; o === Ci || o === Ai; )
      i--, o = e.codePointAt(i - 1);
  }
  return i > r ? e.slice(r, i) : "";
}
function Ou(e, n) {
  const t = { type: "text", value: Iu(String(n.value)) };
  return e.patch(n, t), e.applyData(n, t);
}
function Ru(e, n) {
  const t = {
    type: "element",
    tagName: "hr",
    properties: {},
    children: []
  };
  return e.patch(n, t), e.applyData(n, t);
}
const Mu = {
  blockquote: lu,
  break: cu,
  code: uu,
  delete: du,
  emphasis: fu,
  footnoteReference: pu,
  heading: gu,
  html: hu,
  imageReference: mu,
  image: bu,
  inlineCode: Eu,
  linkReference: yu,
  link: _u,
  listItem: ku,
  list: xu,
  paragraph: Nu,
  // @ts-expect-error: root is different, but hard to type.
  root: Su,
  strong: vu,
  table: Tu,
  tableCell: Au,
  tableRow: Cu,
  text: Ou,
  thematicBreak: Ru,
  toml: ft,
  yaml: ft,
  definition: ft,
  footnoteDefinition: ft
};
function ft() {
}
const Za = -1, Mt = 0, Qn = 1, St = 2, Ur = 3, $r = 4, Hr = 5, Gr = 6, Xa = 7, Qa = 8, Lu = typeof self == "object" ? self : globalThis, Oi = (e, n) => {
  switch (e) {
    case "Function":
    case "SharedWorker":
    case "Worker":
    case "eval":
    case "setInterval":
    case "setTimeout":
      throw new TypeError("unable to deserialize " + e);
  }
  return new Lu[e](n);
}, Du = (e, n) => {
  const t = (i, o) => (e.set(o, i), i), r = (i) => {
    if (e.has(i))
      return e.get(i);
    const [o, a] = n[i];
    switch (o) {
      case Mt:
      case Za:
        return t(a, i);
      case Qn: {
        const s = t([], i);
        for (const l of a)
          s.push(r(l));
        return s;
      }
      case St: {
        const s = t({}, i);
        for (const [l, c] of a)
          s[r(l)] = r(c);
        return s;
      }
      case Ur:
        return t(new Date(a), i);
      case $r: {
        const { source: s, flags: l } = a;
        return t(new RegExp(s, l), i);
      }
      case Hr: {
        const s = t(/* @__PURE__ */ new Map(), i);
        for (const [l, c] of a)
          s.set(r(l), r(c));
        return s;
      }
      case Gr: {
        const s = t(/* @__PURE__ */ new Set(), i);
        for (const l of a)
          s.add(r(l));
        return s;
      }
      case Xa: {
        const { name: s, message: l } = a;
        return t(Oi(s, l), i);
      }
      case Qa:
        return t(BigInt(a), i);
      case "BigInt":
        return t(Object(BigInt(a)), i);
      case "ArrayBuffer":
        return t(new Uint8Array(a).buffer, a);
      case "DataView": {
        const { buffer: s } = new Uint8Array(a);
        return t(new DataView(s), a);
      }
    }
    return t(Oi(o, a), i);
  };
  return r;
}, Ri = (e) => Du(/* @__PURE__ */ new Map(), e)(0), In = "", { toString: Pu } = {}, { keys: Bu } = Object, Wn = (e) => {
  const n = typeof e;
  if (n !== "object" || !e)
    return [Mt, n];
  const t = Pu.call(e).slice(8, -1);
  switch (t) {
    case "Array":
      return [Qn, In];
    case "Object":
      return [St, In];
    case "Date":
      return [Ur, In];
    case "RegExp":
      return [$r, In];
    case "Map":
      return [Hr, In];
    case "Set":
      return [Gr, In];
    case "DataView":
      return [Qn, t];
  }
  return t.includes("Array") ? [Qn, t] : t.includes("Error") ? [Xa, t] : [St, t];
}, pt = ([e, n]) => e === Mt && (n === "function" || n === "symbol"), Fu = (e, n, t, r) => {
  const i = (a, s) => {
    const l = r.push(a) - 1;
    return t.set(s, l), l;
  }, o = (a) => {
    if (t.has(a))
      return t.get(a);
    let [s, l] = Wn(a);
    switch (s) {
      case Mt: {
        let d = a;
        switch (l) {
          case "bigint":
            s = Qa, d = a.toString();
            break;
          case "function":
          case "symbol":
            if (e)
              throw new TypeError("unable to serialize " + l);
            d = null;
            break;
          case "undefined":
            return i([Za], a);
        }
        return i([s, d], a);
      }
      case Qn: {
        if (l) {
          let p = a;
          return l === "DataView" ? p = new Uint8Array(a.buffer) : l === "ArrayBuffer" && (p = new Uint8Array(a)), i([l, [...p]], a);
        }
        const d = [], u = i([s, d], a);
        for (const p of a)
          d.push(o(p));
        return u;
      }
      case St: {
        if (l)
          switch (l) {
            case "BigInt":
              return i([l, a.toString()], a);
            case "Boolean":
            case "Number":
            case "String":
              return i([l, a.valueOf()], a);
          }
        if (n && "toJSON" in a)
          return o(a.toJSON());
        const d = [], u = i([s, d], a);
        for (const p of Bu(a))
          (e || !pt(Wn(a[p]))) && d.push([o(p), o(a[p])]);
        return u;
      }
      case Ur:
        return i([s, a.toISOString()], a);
      case $r: {
        const { source: d, flags: u } = a;
        return i([s, { source: d, flags: u }], a);
      }
      case Hr: {
        const d = [], u = i([s, d], a);
        for (const [p, f] of a)
          (e || !(pt(Wn(p)) || pt(Wn(f)))) && d.push([o(p), o(f)]);
        return u;
      }
      case Gr: {
        const d = [], u = i([s, d], a);
        for (const p of a)
          (e || !pt(Wn(p))) && d.push(o(p));
        return u;
      }
    }
    const { message: c } = a;
    return i([s, { name: l, message: c }], a);
  };
  return o;
}, Mi = (e, { json: n, lossy: t } = {}) => {
  const r = [];
  return Fu(!(n || t), !!n, /* @__PURE__ */ new Map(), r)(e), r;
}, vt = typeof structuredClone == "function" ? (
  /* c8 ignore start */
  (e, n) => n && ("json" in n || "lossy" in n) ? Ri(Mi(e, n)) : structuredClone(e)
) : (e, n) => Ri(Mi(e, n));
function zu(e, n) {
  const t = [{ type: "text", value: "↩" }];
  return n > 1 && t.push({
    type: "element",
    tagName: "sup",
    properties: {},
    children: [{ type: "text", value: String(n) }]
  }), t;
}
function Uu(e, n) {
  return "Back to reference " + (e + 1) + (n > 1 ? "-" + n : "");
}
function $u(e) {
  const n = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", t = e.options.footnoteBackContent || zu, r = e.options.footnoteBackLabel || Uu, i = e.options.footnoteLabel || "Footnotes", o = e.options.footnoteLabelTagName || "h2", a = e.options.footnoteLabelProperties || {
    className: ["sr-only"]
  }, s = [];
  let l = -1;
  for (; ++l < e.footnoteOrder.length; ) {
    const c = e.footnoteById.get(
      e.footnoteOrder[l]
    );
    if (!c)
      continue;
    const d = e.all(c), u = String(c.identifier).toUpperCase(), p = Bn(u.toLowerCase());
    let f = 0;
    const g = [], E = e.footnoteCounts.get(u);
    for (; E !== void 0 && ++f <= E; ) {
      g.length > 0 && g.push({ type: "text", value: " " });
      let N = typeof t == "string" ? t : t(l, f);
      typeof N == "string" && (N = { type: "text", value: N }), g.push({
        type: "element",
        tagName: "a",
        properties: {
          href: "#" + n + "fnref-" + p + (f > 1 ? "-" + f : ""),
          dataFootnoteBackref: "",
          ariaLabel: typeof r == "string" ? r : r(l, f),
          className: ["data-footnote-backref"]
        },
        children: Array.isArray(N) ? N : [N]
      });
    }
    const _ = d[d.length - 1];
    if (_ && _.type === "element" && _.tagName === "p") {
      const N = _.children[_.children.length - 1];
      N && N.type === "text" ? N.value += " " : _.children.push({ type: "text", value: " " }), _.children.push(...g);
    } else
      d.push(...g);
    const h = {
      type: "element",
      tagName: "li",
      properties: { id: n + "fn-" + p },
      children: e.wrap(d, !0)
    };
    e.patch(c, h), s.push(h);
  }
  if (s.length !== 0)
    return {
      type: "element",
      tagName: "section",
      properties: { dataFootnotes: !0, className: ["footnotes"] },
      children: [
        {
          type: "element",
          tagName: o,
          properties: {
            ...vt(a),
            id: "footnote-label"
          },
          children: [{ type: "text", value: i }]
        },
        { type: "text", value: `
` },
        {
          type: "element",
          tagName: "ol",
          properties: {},
          children: e.wrap(s, !0)
        },
        { type: "text", value: `
` }
      ]
    };
}
const rt = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {Check}
   */
  (function(e) {
    if (e == null)
      return Ku;
    if (typeof e == "function")
      return Lt(e);
    if (typeof e == "object")
      return Array.isArray(e) ? Hu(e) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        Gu(
          /** @type {Props} */
          e
        )
      );
    if (typeof e == "string")
      return qu(e);
    throw new Error("Expected function, string, or object as test");
  })
);
function Hu(e) {
  const n = [];
  let t = -1;
  for (; ++t < e.length; )
    n[t] = rt(e[t]);
  return Lt(r);
  function r(...i) {
    let o = -1;
    for (; ++o < n.length; )
      if (n[o].apply(this, i)) return !0;
    return !1;
  }
}
function Gu(e) {
  const n = (
    /** @type {Record<string, unknown>} */
    e
  );
  return Lt(t);
  function t(r) {
    const i = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      r
    );
    let o;
    for (o in e)
      if (i[o] !== n[o]) return !1;
    return !0;
  }
}
function qu(e) {
  return Lt(n);
  function n(t) {
    return t && t.type === e;
  }
}
function Lt(e) {
  return n;
  function n(t, r, i) {
    return !!(Wu(t) && e.call(
      this,
      t,
      typeof r == "number" ? r : void 0,
      i || void 0
    ));
  }
}
function Ku() {
  return !0;
}
function Wu(e) {
  return e !== null && typeof e == "object" && "type" in e;
}
const Ja = [], Vu = !0, Er = !1, Yu = "skip";
function ja(e, n, t, r) {
  let i;
  typeof n == "function" && typeof t != "function" ? (r = t, t = n) : i = n;
  const o = rt(i), a = r ? -1 : 1;
  s(e, void 0, [])();
  function s(l, c, d) {
    const u = (
      /** @type {Record<string, unknown>} */
      l && typeof l == "object" ? l : {}
    );
    if (typeof u.type == "string") {
      const f = (
        // `hast`
        typeof u.tagName == "string" ? u.tagName : (
          // `xast`
          typeof u.name == "string" ? u.name : void 0
        )
      );
      Object.defineProperty(p, "name", {
        value: "node (" + (l.type + (f ? "<" + f + ">" : "")) + ")"
      });
    }
    return p;
    function p() {
      let f = Ja, g, E, _;
      if ((!n || o(l, c, d[d.length - 1] || void 0)) && (f = Zu(t(l, d)), f[0] === Er))
        return f;
      if ("children" in l && l.children) {
        const h = (
          /** @type {UnistParent} */
          l
        );
        if (h.children && f[0] !== Yu)
          for (E = (r ? h.children.length : -1) + a, _ = d.concat(h); E > -1 && E < h.children.length; ) {
            const N = h.children[E];
            if (g = s(N, E, _)(), g[0] === Er)
              return g;
            E = typeof g[1] == "number" ? g[1] : E + a;
          }
      }
      return f;
    }
  }
}
function Zu(e) {
  return Array.isArray(e) ? e : typeof e == "number" ? [Vu, e] : e == null ? Ja : [e];
}
function Dt(e, n, t, r) {
  let i, o, a;
  typeof n == "function" && typeof t != "function" ? (o = void 0, a = n, i = t) : (o = n, a = t, i = r), ja(e, o, s, i);
  function s(l, c) {
    const d = c[c.length - 1], u = d ? d.children.indexOf(l) : void 0;
    return a(l, u, d);
  }
}
const yr = {}.hasOwnProperty, Xu = {};
function Qu(e, n) {
  const t = n || Xu, r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), a = { ...Mu, ...t.handlers }, s = {
    all: c,
    applyData: ju,
    definitionById: r,
    footnoteById: i,
    footnoteCounts: o,
    footnoteOrder: [],
    handlers: a,
    one: l,
    options: t,
    patch: Ju,
    wrap: nd
  };
  return Dt(e, function(d) {
    if (d.type === "definition" || d.type === "footnoteDefinition") {
      const u = d.type === "definition" ? r : i, p = String(d.identifier).toUpperCase();
      u.has(p) || u.set(p, d);
    }
  }), s;
  function l(d, u) {
    const p = d.type, f = s.handlers[p];
    if (yr.call(s.handlers, p) && f)
      return f(s, d, u);
    if (s.options.passThrough && s.options.passThrough.includes(p)) {
      if ("children" in d) {
        const { children: E, ..._ } = d, h = vt(_);
        return h.children = s.all(d), h;
      }
      return vt(d);
    }
    return (s.options.unknownHandler || ed)(s, d, u);
  }
  function c(d) {
    const u = [];
    if ("children" in d) {
      const p = d.children;
      let f = -1;
      for (; ++f < p.length; ) {
        const g = s.one(p[f], d);
        if (g) {
          if (f && p[f - 1].type === "break" && (!Array.isArray(g) && g.type === "text" && (g.value = Li(g.value)), !Array.isArray(g) && g.type === "element")) {
            const E = g.children[0];
            E && E.type === "text" && (E.value = Li(E.value));
          }
          Array.isArray(g) ? u.push(...g) : u.push(g);
        }
      }
    }
    return u;
  }
}
function Ju(e, n) {
  e.position && (n.position = zs(e));
}
function ju(e, n) {
  let t = n;
  if (e && e.data) {
    const r = e.data.hName, i = e.data.hChildren, o = e.data.hProperties;
    if (typeof r == "string")
      if (t.type === "element")
        t.tagName = r;
      else {
        const a = "children" in t ? t.children : [t];
        t = { type: "element", tagName: r, properties: {}, children: a };
      }
    t.type === "element" && o && Object.assign(t.properties, vt(o)), "children" in t && t.children && i !== null && i !== void 0 && (t.children = i);
  }
  return t;
}
function ed(e, n) {
  const t = n.data || {}, r = "value" in n && !(yr.call(t, "hProperties") || yr.call(t, "hChildren")) ? { type: "text", value: n.value } : {
    type: "element",
    tagName: "div",
    properties: {},
    children: e.all(n)
  };
  return e.patch(n, r), e.applyData(n, r);
}
function nd(e, n) {
  const t = [];
  let r = -1;
  for (n && t.push({ type: "text", value: `
` }); ++r < e.length; )
    r && t.push({ type: "text", value: `
` }), t.push(e[r]);
  return n && e.length > 0 && t.push({ type: "text", value: `
` }), t;
}
function Li(e) {
  let n = 0, t = e.charCodeAt(n);
  for (; t === 9 || t === 32; )
    n++, t = e.charCodeAt(n);
  return e.slice(n);
}
function Di(e, n) {
  const t = Qu(e, n), r = t.one(e, void 0), i = $u(t), o = Array.isArray(r) ? { type: "root", children: r } : r || { type: "root", children: [] };
  return i && o.children.push({ type: "text", value: `
` }, i), o;
}
function td(e, n) {
  return e && "run" in e ? async function(t, r) {
    const i = (
      /** @type {HastRoot} */
      Di(t, { file: r, ...n })
    );
    await e.run(i, r);
  } : function(t, r) {
    return (
      /** @type {HastRoot} */
      Di(t, { file: r, ...e || n })
    );
  };
}
function Pi(e) {
  if (e)
    throw e;
}
var Qt, Bi;
function rd() {
  if (Bi) return Qt;
  Bi = 1;
  var e = Object.prototype.hasOwnProperty, n = Object.prototype.toString, t = Object.defineProperty, r = Object.getOwnPropertyDescriptor, i = function(c) {
    return typeof Array.isArray == "function" ? Array.isArray(c) : n.call(c) === "[object Array]";
  }, o = function(c) {
    if (!c || n.call(c) !== "[object Object]")
      return !1;
    var d = e.call(c, "constructor"), u = c.constructor && c.constructor.prototype && e.call(c.constructor.prototype, "isPrototypeOf");
    if (c.constructor && !d && !u)
      return !1;
    var p;
    for (p in c)
      ;
    return typeof p > "u" || e.call(c, p);
  }, a = function(c, d) {
    t && d.name === "__proto__" ? t(c, d.name, {
      enumerable: !0,
      configurable: !0,
      value: d.newValue,
      writable: !0
    }) : c[d.name] = d.newValue;
  }, s = function(c, d) {
    if (d === "__proto__")
      if (e.call(c, d)) {
        if (r)
          return r(c, d).value;
      } else return;
    return c[d];
  };
  return Qt = function l() {
    var c, d, u, p, f, g, E = arguments[0], _ = 1, h = arguments.length, N = !1;
    for (typeof E == "boolean" && (N = E, E = arguments[1] || {}, _ = 2), (E == null || typeof E != "object" && typeof E != "function") && (E = {}); _ < h; ++_)
      if (c = arguments[_], c != null)
        for (d in c)
          u = s(E, d), p = s(c, d), E !== p && (N && p && (o(p) || (f = i(p))) ? (f ? (f = !1, g = u && i(u) ? u : []) : g = u && o(u) ? u : {}, a(E, { name: d, newValue: l(N, g, p) })) : typeof p < "u" && a(E, { name: d, newValue: p }));
    return E;
  }, Qt;
}
var id = rd();
const Jt = /* @__PURE__ */ Rr(id);
function _r(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const n = Object.getPrototypeOf(e);
  return (n === null || n === Object.prototype || Object.getPrototypeOf(n) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function ad() {
  const e = [], n = { run: t, use: r };
  return n;
  function t(...i) {
    let o = -1;
    const a = i.pop();
    if (typeof a != "function")
      throw new TypeError("Expected function as last argument, not " + a);
    s(null, ...i);
    function s(l, ...c) {
      const d = e[++o];
      let u = -1;
      if (l) {
        a(l);
        return;
      }
      for (; ++u < i.length; )
        (c[u] === null || c[u] === void 0) && (c[u] = i[u]);
      i = c, d ? od(d, s)(...c) : a(null, ...c);
    }
  }
  function r(i) {
    if (typeof i != "function")
      throw new TypeError(
        "Expected `middelware` to be a function, not " + i
      );
    return e.push(i), n;
  }
}
function od(e, n) {
  let t;
  return r;
  function r(...a) {
    const s = e.length > a.length;
    let l;
    s && a.push(i);
    try {
      l = e.apply(this, a);
    } catch (c) {
      const d = (
        /** @type {Error} */
        c
      );
      if (s && t)
        throw d;
      return i(d);
    }
    s || (l && l.then && typeof l.then == "function" ? l.then(o, i) : l instanceof Error ? i(l) : o(l));
  }
  function i(a, ...s) {
    t || (t = !0, n(a, ...s));
  }
  function o(a) {
    i(null, a);
  }
}
const je = { basename: sd, dirname: ld, extname: cd, join: ud, sep: "/" };
function sd(e, n) {
  if (n !== void 0 && typeof n != "string")
    throw new TypeError('"ext" argument must be a string');
  it(e);
  let t = 0, r = -1, i = e.length, o;
  if (n === void 0 || n.length === 0 || n.length > e.length) {
    for (; i--; )
      if (e.codePointAt(i) === 47) {
        if (o) {
          t = i + 1;
          break;
        }
      } else r < 0 && (o = !0, r = i + 1);
    return r < 0 ? "" : e.slice(t, r);
  }
  if (n === e)
    return "";
  let a = -1, s = n.length - 1;
  for (; i--; )
    if (e.codePointAt(i) === 47) {
      if (o) {
        t = i + 1;
        break;
      }
    } else
      a < 0 && (o = !0, a = i + 1), s > -1 && (e.codePointAt(i) === n.codePointAt(s--) ? s < 0 && (r = i) : (s = -1, r = a));
  return t === r ? r = a : r < 0 && (r = e.length), e.slice(t, r);
}
function ld(e) {
  if (it(e), e.length === 0)
    return ".";
  let n = -1, t = e.length, r;
  for (; --t; )
    if (e.codePointAt(t) === 47) {
      if (r) {
        n = t;
        break;
      }
    } else r || (r = !0);
  return n < 0 ? e.codePointAt(0) === 47 ? "/" : "." : n === 1 && e.codePointAt(0) === 47 ? "//" : e.slice(0, n);
}
function cd(e) {
  it(e);
  let n = e.length, t = -1, r = 0, i = -1, o = 0, a;
  for (; n--; ) {
    const s = e.codePointAt(n);
    if (s === 47) {
      if (a) {
        r = n + 1;
        break;
      }
      continue;
    }
    t < 0 && (a = !0, t = n + 1), s === 46 ? i < 0 ? i = n : o !== 1 && (o = 1) : i > -1 && (o = -1);
  }
  return i < 0 || t < 0 || // We saw a non-dot character immediately before the dot.
  o === 0 || // The (right-most) trimmed path component is exactly `..`.
  o === 1 && i === t - 1 && i === r + 1 ? "" : e.slice(i, t);
}
function ud(...e) {
  let n = -1, t;
  for (; ++n < e.length; )
    it(e[n]), e[n] && (t = t === void 0 ? e[n] : t + "/" + e[n]);
  return t === void 0 ? "." : dd(t);
}
function dd(e) {
  it(e);
  const n = e.codePointAt(0) === 47;
  let t = fd(e, !n);
  return t.length === 0 && !n && (t = "."), t.length > 0 && e.codePointAt(e.length - 1) === 47 && (t += "/"), n ? "/" + t : t;
}
function fd(e, n) {
  let t = "", r = 0, i = -1, o = 0, a = -1, s, l;
  for (; ++a <= e.length; ) {
    if (a < e.length)
      s = e.codePointAt(a);
    else {
      if (s === 47)
        break;
      s = 47;
    }
    if (s === 47) {
      if (!(i === a - 1 || o === 1)) if (i !== a - 1 && o === 2) {
        if (t.length < 2 || r !== 2 || t.codePointAt(t.length - 1) !== 46 || t.codePointAt(t.length - 2) !== 46) {
          if (t.length > 2) {
            if (l = t.lastIndexOf("/"), l !== t.length - 1) {
              l < 0 ? (t = "", r = 0) : (t = t.slice(0, l), r = t.length - 1 - t.lastIndexOf("/")), i = a, o = 0;
              continue;
            }
          } else if (t.length > 0) {
            t = "", r = 0, i = a, o = 0;
            continue;
          }
        }
        n && (t = t.length > 0 ? t + "/.." : "..", r = 2);
      } else
        t.length > 0 ? t += "/" + e.slice(i + 1, a) : t = e.slice(i + 1, a), r = a - i - 1;
      i = a, o = 0;
    } else s === 46 && o > -1 ? o++ : o = -1;
  }
  return t;
}
function it(e) {
  if (typeof e != "string")
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(e)
    );
}
const pd = { cwd: gd };
function gd() {
  return "/";
}
function kr(e) {
  return !!(e !== null && typeof e == "object" && "href" in e && e.href && "protocol" in e && e.protocol && // @ts-expect-error: indexing is fine.
  e.auth === void 0);
}
function hd(e) {
  if (typeof e == "string")
    e = new URL(e);
  else if (!kr(e)) {
    const n = new TypeError(
      'The "path" argument must be of type string or an instance of URL. Received `' + e + "`"
    );
    throw n.code = "ERR_INVALID_ARG_TYPE", n;
  }
  if (e.protocol !== "file:") {
    const n = new TypeError("The URL must be of scheme file");
    throw n.code = "ERR_INVALID_URL_SCHEME", n;
  }
  return md(e);
}
function md(e) {
  if (e.hostname !== "") {
    const r = new TypeError(
      'File URL host must be "localhost" or empty on darwin'
    );
    throw r.code = "ERR_INVALID_FILE_URL_HOST", r;
  }
  const n = e.pathname;
  let t = -1;
  for (; ++t < n.length; )
    if (n.codePointAt(t) === 37 && n.codePointAt(t + 1) === 50) {
      const r = n.codePointAt(t + 2);
      if (r === 70 || r === 102) {
        const i = new TypeError(
          "File URL path must not include encoded / characters"
        );
        throw i.code = "ERR_INVALID_FILE_URL_PATH", i;
      }
    }
  return decodeURIComponent(n);
}
const jt = (
  /** @type {const} */
  [
    "history",
    "path",
    "basename",
    "stem",
    "extname",
    "dirname"
  ]
);
class eo {
  /**
   * Create a new virtual file.
   *
   * `options` is treated as:
   *
   * *   `string` or `Uint8Array` — `{value: options}`
   * *   `URL` — `{path: options}`
   * *   `VFile` — shallow copies its data over to the new file
   * *   `object` — all fields are shallow copied over to the new file
   *
   * Path related fields are set in the following order (least specific to
   * most specific): `history`, `path`, `basename`, `stem`, `extname`,
   * `dirname`.
   *
   * You cannot set `dirname` or `extname` without setting either `history`,
   * `path`, `basename`, or `stem` too.
   *
   * @param {Compatible | null | undefined} [value]
   *   File value.
   * @returns
   *   New instance.
   */
  constructor(n) {
    let t;
    n ? kr(n) ? t = { path: n } : typeof n == "string" || bd(n) ? t = { value: n } : t = n : t = {}, this.cwd = "cwd" in t ? "" : pd.cwd(), this.data = {}, this.history = [], this.messages = [], this.value, this.map, this.result, this.stored;
    let r = -1;
    for (; ++r < jt.length; ) {
      const o = jt[r];
      o in t && t[o] !== void 0 && t[o] !== null && (this[o] = o === "history" ? [...t[o]] : t[o]);
    }
    let i;
    for (i in t)
      jt.includes(i) || (this[i] = t[i]);
  }
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   *
   * @returns {string | undefined}
   *   Basename.
   */
  get basename() {
    return typeof this.path == "string" ? je.basename(this.path) : void 0;
  }
  /**
   * Set basename (including extname) (`'index.min.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} basename
   *   Basename.
   * @returns {undefined}
   *   Nothing.
   */
  set basename(n) {
    nr(n, "basename"), er(n, "basename"), this.path = je.join(this.dirname || "", n);
  }
  /**
   * Get the parent path (example: `'~'`).
   *
   * @returns {string | undefined}
   *   Dirname.
   */
  get dirname() {
    return typeof this.path == "string" ? je.dirname(this.path) : void 0;
  }
  /**
   * Set the parent path (example: `'~'`).
   *
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} dirname
   *   Dirname.
   * @returns {undefined}
   *   Nothing.
   */
  set dirname(n) {
    Fi(this.basename, "dirname"), this.path = je.join(n || "", this.basename);
  }
  /**
   * Get the extname (including dot) (example: `'.js'`).
   *
   * @returns {string | undefined}
   *   Extname.
   */
  get extname() {
    return typeof this.path == "string" ? je.extname(this.path) : void 0;
  }
  /**
   * Set the extname (including dot) (example: `'.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} extname
   *   Extname.
   * @returns {undefined}
   *   Nothing.
   */
  set extname(n) {
    if (er(n, "extname"), Fi(this.dirname, "extname"), n) {
      if (n.codePointAt(0) !== 46)
        throw new Error("`extname` must start with `.`");
      if (n.includes(".", 1))
        throw new Error("`extname` cannot contain multiple dots");
    }
    this.path = je.join(this.dirname, this.stem + (n || ""));
  }
  /**
   * Get the full path (example: `'~/index.min.js'`).
   *
   * @returns {string}
   *   Path.
   */
  get path() {
    return this.history[this.history.length - 1];
  }
  /**
   * Set the full path (example: `'~/index.min.js'`).
   *
   * Cannot be nullified.
   * You can set a file URL (a `URL` object with a `file:` protocol) which will
   * be turned into a path with `url.fileURLToPath`.
   *
   * @param {URL | string} path
   *   Path.
   * @returns {undefined}
   *   Nothing.
   */
  set path(n) {
    kr(n) && (n = hd(n)), nr(n, "path"), this.path !== n && this.history.push(n);
  }
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   *
   * @returns {string | undefined}
   *   Stem.
   */
  get stem() {
    return typeof this.path == "string" ? je.basename(this.path, this.extname) : void 0;
  }
  /**
   * Set the stem (basename w/o extname) (example: `'index.min'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} stem
   *   Stem.
   * @returns {undefined}
   *   Nothing.
   */
  set stem(n) {
    nr(n, "stem"), er(n, "stem"), this.path = je.join(this.dirname || "", n + (this.extname || ""));
  }
  // Normal prototypal methods.
  /**
   * Create a fatal message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `true` (error; file not usable)
   * and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {never}
   *   Never.
   * @throws {VFileMessage}
   *   Message.
   */
  fail(n, t, r) {
    const i = this.message(n, t, r);
    throw i.fatal = !0, i;
  }
  /**
   * Create an info message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `undefined` (info; change
   * likely not needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  info(n, t, r) {
    const i = this.message(n, t, r);
    return i.fatal = void 0, i;
  }
  /**
   * Create a message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `false` (warning; change may be
   * needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  message(n, t, r) {
    const i = new Ae(
      // @ts-expect-error: the overloads are fine.
      n,
      t,
      r
    );
    return this.path && (i.name = this.path + ":" + i.name, i.file = this.path), i.fatal = !1, this.messages.push(i), i;
  }
  /**
   * Serialize the file.
   *
   * > **Note**: which encodings are supported depends on the engine.
   * > For info on Node.js, see:
   * > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
   *
   * @param {string | null | undefined} [encoding='utf8']
   *   Character encoding to understand `value` as when it’s a `Uint8Array`
   *   (default: `'utf-8'`).
   * @returns {string}
   *   Serialized file.
   */
  toString(n) {
    return this.value === void 0 ? "" : typeof this.value == "string" ? this.value : new TextDecoder(n || void 0).decode(this.value);
  }
}
function er(e, n) {
  if (e && e.includes(je.sep))
    throw new Error(
      "`" + n + "` cannot be a path: did not expect `" + je.sep + "`"
    );
}
function nr(e, n) {
  if (!e)
    throw new Error("`" + n + "` cannot be empty");
}
function Fi(e, n) {
  if (!e)
    throw new Error("Setting `" + n + "` requires `path` to be set too");
}
function bd(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const Ed = (
  /**
   * @type {new <Parameters extends Array<unknown>, Result>(property: string | symbol) => (...parameters: Parameters) => Result}
   */
  /** @type {unknown} */
  /**
   * @this {Function}
   * @param {string | symbol} property
   * @returns {(...parameters: Array<unknown>) => unknown}
   */
  (function(e) {
    const r = (
      /** @type {Record<string | symbol, Function>} */
      // Prototypes do exist.
      // type-coverage:ignore-next-line
      this.constructor.prototype
    ), i = r[e], o = function() {
      return i.apply(o, arguments);
    };
    return Object.setPrototypeOf(o, r), o;
  })
), yd = {}.hasOwnProperty;
class qr extends Ed {
  /**
   * Create a processor.
   */
  constructor() {
    super("copy"), this.Compiler = void 0, this.Parser = void 0, this.attachers = [], this.compiler = void 0, this.freezeIndex = -1, this.frozen = void 0, this.namespace = {}, this.parser = void 0, this.transformers = ad();
  }
  /**
   * Copy a processor.
   *
   * @deprecated
   *   This is a private internal method and should not be used.
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   New *unfrozen* processor ({@linkcode Processor}) that is
   *   configured to work the same as its ancestor.
   *   When the descendant processor is configured in the future it does not
   *   affect the ancestral processor.
   */
  copy() {
    const n = (
      /** @type {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>} */
      new qr()
    );
    let t = -1;
    for (; ++t < this.attachers.length; ) {
      const r = this.attachers[t];
      n.use(...r);
    }
    return n.data(Jt(!0, {}, this.namespace)), n;
  }
  /**
   * Configure the processor with info available to all plugins.
   * Information is stored in an object.
   *
   * Typically, options can be given to a specific plugin, but sometimes it
   * makes sense to have information shared with several plugins.
   * For example, a list of HTML elements that are self-closing, which is
   * needed during all phases.
   *
   * > **Note**: setting information cannot occur on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * > **Note**: to register custom data in TypeScript, augment the
   * > {@linkcode Data} interface.
   *
   * @example
   *   This example show how to get and set info:
   *
   *   ```js
   *   import {unified} from 'unified'
   *
   *   const processor = unified().data('alpha', 'bravo')
   *
   *   processor.data('alpha') // => 'bravo'
   *
   *   processor.data() // => {alpha: 'bravo'}
   *
   *   processor.data({charlie: 'delta'})
   *
   *   processor.data() // => {charlie: 'delta'}
   *   ```
   *
   * @template {keyof Data} Key
   *
   * @overload
   * @returns {Data}
   *
   * @overload
   * @param {Data} dataset
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {Key} key
   * @returns {Data[Key]}
   *
   * @overload
   * @param {Key} key
   * @param {Data[Key]} value
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @param {Data | Key} [key]
   *   Key to get or set, or entire dataset to set, or nothing to get the
   *   entire dataset (optional).
   * @param {Data[Key]} [value]
   *   Value to set (optional).
   * @returns {unknown}
   *   The current processor when setting, the value at `key` when getting, or
   *   the entire dataset when getting without key.
   */
  data(n, t) {
    return typeof n == "string" ? arguments.length === 2 ? (ir("data", this.frozen), this.namespace[n] = t, this) : yd.call(this.namespace, n) && this.namespace[n] || void 0 : n ? (ir("data", this.frozen), this.namespace = n, this) : this.namespace;
  }
  /**
   * Freeze a processor.
   *
   * Frozen processors are meant to be extended and not to be configured
   * directly.
   *
   * When a processor is frozen it cannot be unfrozen.
   * New processors working the same way can be created by calling the
   * processor.
   *
   * It’s possible to freeze processors explicitly by calling `.freeze()`.
   * Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
   * `.stringify()`, `.process()`, or `.processSync()` are called.
   *
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   The current processor.
   */
  freeze() {
    if (this.frozen)
      return this;
    const n = (
      /** @type {Processor} */
      /** @type {unknown} */
      this
    );
    for (; ++this.freezeIndex < this.attachers.length; ) {
      const [t, ...r] = this.attachers[this.freezeIndex];
      if (r[0] === !1)
        continue;
      r[0] === !0 && (r[0] = void 0);
      const i = t.call(n, ...r);
      typeof i == "function" && this.transformers.use(i);
    }
    return this.frozen = !0, this.freezeIndex = Number.POSITIVE_INFINITY, this;
  }
  /**
   * Parse text to a syntax tree.
   *
   * > **Note**: `parse` freezes the processor if not already *frozen*.
   *
   * > **Note**: `parse` performs the parse phase, not the run phase or other
   * > phases.
   *
   * @param {Compatible | undefined} [file]
   *   file to parse (optional); typically `string` or `VFile`; any value
   *   accepted as `x` in `new VFile(x)`.
   * @returns {ParseTree extends undefined ? Node : ParseTree}
   *   Syntax tree representing `file`.
   */
  parse(n) {
    this.freeze();
    const t = gt(n), r = this.parser || this.Parser;
    return tr("parse", r), r(String(t), t);
  }
  /**
   * Process the given file as configured on the processor.
   *
   * > **Note**: `process` freezes the processor if not already *frozen*.
   *
   * > **Note**: `process` performs the parse, run, and stringify phases.
   *
   * @overload
   * @param {Compatible | undefined} file
   * @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
   * @returns {undefined}
   *
   * @overload
   * @param {Compatible | undefined} [file]
   * @returns {Promise<VFileWithOutput<CompileResult>>}
   *
   * @param {Compatible | undefined} [file]
   *   File (optional); typically `string` or `VFile`]; any value accepted as
   *   `x` in `new VFile(x)`.
   * @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
   *   Callback (optional).
   * @returns {Promise<VFile> | undefined}
   *   Nothing if `done` is given.
   *   Otherwise a promise, rejected with a fatal error or resolved with the
   *   processed file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  process(n, t) {
    const r = this;
    return this.freeze(), tr("process", this.parser || this.Parser), rr("process", this.compiler || this.Compiler), t ? i(void 0, t) : new Promise(i);
    function i(o, a) {
      const s = gt(n), l = (
        /** @type {HeadTree extends undefined ? Node : HeadTree} */
        /** @type {unknown} */
        r.parse(s)
      );
      r.run(l, s, function(d, u, p) {
        if (d || !u || !p)
          return c(d);
        const f = (
          /** @type {CompileTree extends undefined ? Node : CompileTree} */
          /** @type {unknown} */
          u
        ), g = r.stringify(f, p);
        wd(g) ? p.value = g : p.result = g, c(
          d,
          /** @type {VFileWithOutput<CompileResult>} */
          p
        );
      });
      function c(d, u) {
        d || !u ? a(d) : o ? o(u) : t(void 0, u);
      }
    }
  }
  /**
   * Process the given file as configured on the processor.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > **Note**: `processSync` freezes the processor if not already *frozen*.
   *
   * > **Note**: `processSync` performs the parse, run, and stringify phases.
   *
   * @param {Compatible | undefined} [file]
   *   File (optional); typically `string` or `VFile`; any value accepted as
   *   `x` in `new VFile(x)`.
   * @returns {VFileWithOutput<CompileResult>}
   *   The processed file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  processSync(n) {
    let t = !1, r;
    return this.freeze(), tr("processSync", this.parser || this.Parser), rr("processSync", this.compiler || this.Compiler), this.process(n, i), Ui("processSync", "process", t), r;
    function i(o, a) {
      t = !0, Pi(o), r = a;
    }
  }
  /**
   * Run *transformers* on a syntax tree.
   *
   * > **Note**: `run` freezes the processor if not already *frozen*.
   *
   * > **Note**: `run` performs the run phase, not other phases.
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
   * @returns {undefined}
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {Compatible | undefined} file
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
   * @returns {undefined}
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {Compatible | undefined} [file]
   * @returns {Promise<TailTree extends undefined ? Node : TailTree>}
   *
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   *   Tree to transform and inspect.
   * @param {(
   *   RunCallback<TailTree extends undefined ? Node : TailTree> |
   *   Compatible
   * )} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
   *   Callback (optional).
   * @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
   *   Nothing if `done` is given.
   *   Otherwise, a promise rejected with a fatal error or resolved with the
   *   transformed tree.
   */
  run(n, t, r) {
    zi(n), this.freeze();
    const i = this.transformers;
    return !r && typeof t == "function" && (r = t, t = void 0), r ? o(void 0, r) : new Promise(o);
    function o(a, s) {
      const l = gt(t);
      i.run(n, l, c);
      function c(d, u, p) {
        const f = (
          /** @type {TailTree extends undefined ? Node : TailTree} */
          u || n
        );
        d ? s(d) : a ? a(f) : r(void 0, f, p);
      }
    }
  }
  /**
   * Run *transformers* on a syntax tree.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > **Note**: `runSync` freezes the processor if not already *frozen*.
   *
   * > **Note**: `runSync` performs the run phase, not other phases.
   *
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   *   Tree to transform and inspect.
   * @param {Compatible | undefined} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns {TailTree extends undefined ? Node : TailTree}
   *   Transformed tree.
   */
  runSync(n, t) {
    let r = !1, i;
    return this.run(n, t, o), Ui("runSync", "run", r), i;
    function o(a, s) {
      Pi(a), i = s, r = !0;
    }
  }
  /**
   * Compile a syntax tree.
   *
   * > **Note**: `stringify` freezes the processor if not already *frozen*.
   *
   * > **Note**: `stringify` performs the stringify phase, not the run phase
   * > or other phases.
   *
   * @param {CompileTree extends undefined ? Node : CompileTree} tree
   *   Tree to compile.
   * @param {Compatible | undefined} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns {CompileResult extends undefined ? Value : CompileResult}
   *   Textual representation of the tree (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most compilers
   *   > return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  stringify(n, t) {
    this.freeze();
    const r = gt(t), i = this.compiler || this.Compiler;
    return rr("stringify", i), zi(n), i(n, r);
  }
  /**
   * Configure the processor to use a plugin, a list of usable values, or a
   * preset.
   *
   * If the processor is already using a plugin, the previous plugin
   * configuration is changed based on the options that are passed in.
   * In other words, the plugin is not added a second time.
   *
   * > **Note**: `use` cannot be called on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * @example
   *   There are many ways to pass plugins to `.use()`.
   *   This example gives an overview:
   *
   *   ```js
   *   import {unified} from 'unified'
   *
   *   unified()
   *     // Plugin with options:
   *     .use(pluginA, {x: true, y: true})
   *     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
   *     .use(pluginA, {y: false, z: true})
   *     // Plugins:
   *     .use([pluginB, pluginC])
   *     // Two plugins, the second with options:
   *     .use([pluginD, [pluginE, {}]])
   *     // Preset with plugins and settings:
   *     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
   *     // Settings only:
   *     .use({settings: {position: false}})
   *   ```
   *
   * @template {Array<unknown>} [Parameters=[]]
   * @template {Node | string | undefined} [Input=undefined]
   * @template [Output=Input]
   *
   * @overload
   * @param {Preset | null | undefined} [preset]
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {PluggableList} list
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {Plugin<Parameters, Input, Output>} plugin
   * @param {...(Parameters | [boolean])} parameters
   * @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
   *
   * @param {PluggableList | Plugin | Preset | null | undefined} value
   *   Usable value.
   * @param {...unknown} parameters
   *   Parameters, when a plugin is given as a usable value.
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   Current processor.
   */
  use(n, ...t) {
    const r = this.attachers, i = this.namespace;
    if (ir("use", this.frozen), n != null) if (typeof n == "function")
      l(n, t);
    else if (typeof n == "object")
      Array.isArray(n) ? s(n) : a(n);
    else
      throw new TypeError("Expected usable value, not `" + n + "`");
    return this;
    function o(c) {
      if (typeof c == "function")
        l(c, []);
      else if (typeof c == "object")
        if (Array.isArray(c)) {
          const [d, ...u] = (
            /** @type {PluginTuple<Array<unknown>>} */
            c
          );
          l(d, u);
        } else
          a(c);
      else
        throw new TypeError("Expected usable value, not `" + c + "`");
    }
    function a(c) {
      if (!("plugins" in c) && !("settings" in c))
        throw new Error(
          "Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither"
        );
      s(c.plugins), c.settings && (i.settings = Jt(!0, i.settings, c.settings));
    }
    function s(c) {
      let d = -1;
      if (c != null) if (Array.isArray(c))
        for (; ++d < c.length; ) {
          const u = c[d];
          o(u);
        }
      else
        throw new TypeError("Expected a list of plugins, not `" + c + "`");
    }
    function l(c, d) {
      let u = -1, p = -1;
      for (; ++u < r.length; )
        if (r[u][0] === c) {
          p = u;
          break;
        }
      if (p === -1)
        r.push([c, ...d]);
      else if (d.length > 0) {
        let [f, ...g] = d;
        const E = r[p][1];
        _r(E) && _r(f) && (f = Jt(!0, E, f)), r[p] = [c, f, ...g];
      }
    }
  }
}
const _d = new qr().freeze();
function tr(e, n) {
  if (typeof n != "function")
    throw new TypeError("Cannot `" + e + "` without `parser`");
}
function rr(e, n) {
  if (typeof n != "function")
    throw new TypeError("Cannot `" + e + "` without `compiler`");
}
function ir(e, n) {
  if (n)
    throw new Error(
      "Cannot call `" + e + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`."
    );
}
function zi(e) {
  if (!_r(e) || typeof e.type != "string")
    throw new TypeError("Expected node, got `" + e + "`");
}
function Ui(e, n, t) {
  if (!t)
    throw new Error(
      "`" + e + "` finished async. Use `" + n + "` instead"
    );
}
function gt(e) {
  return kd(e) ? e : new eo(e);
}
function kd(e) {
  return !!(e && typeof e == "object" && "message" in e && "messages" in e);
}
function wd(e) {
  return typeof e == "string" || xd(e);
}
function xd(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const Nd = "https://github.com/remarkjs/react-markdown/blob/main/changelog.md", $i = [], Hi = { allowDangerousHtml: !0 }, Sd = /^(https?|ircs?|mailto|xmpp)$/i, vd = [
  { from: "astPlugins", id: "remove-buggy-html-in-markdown-parser" },
  { from: "allowDangerousHtml", id: "remove-buggy-html-in-markdown-parser" },
  {
    from: "allowNode",
    id: "replace-allownode-allowedtypes-and-disallowedtypes",
    to: "allowElement"
  },
  {
    from: "allowedTypes",
    id: "replace-allownode-allowedtypes-and-disallowedtypes",
    to: "allowedElements"
  },
  {
    from: "disallowedTypes",
    id: "replace-allownode-allowedtypes-and-disallowedtypes",
    to: "disallowedElements"
  },
  { from: "escapeHtml", id: "remove-buggy-html-in-markdown-parser" },
  { from: "includeElementIndex", id: "#remove-includeelementindex" },
  {
    from: "includeNodeIndex",
    id: "change-includenodeindex-to-includeelementindex"
  },
  { from: "linkTarget", id: "remove-linktarget" },
  { from: "plugins", id: "change-plugins-to-remarkplugins", to: "remarkPlugins" },
  { from: "rawSourcePos", id: "#remove-rawsourcepos" },
  { from: "renderers", id: "change-renderers-to-components", to: "components" },
  { from: "source", id: "change-source-to-children", to: "children" },
  { from: "sourcePos", id: "#remove-sourcepos" },
  { from: "transformImageUri", id: "#add-urltransform", to: "urlTransform" },
  { from: "transformLinkUri", id: "#add-urltransform", to: "urlTransform" }
];
function no(e) {
  const n = Td(e), t = Cd(e);
  return Ad(n.runSync(n.parse(t), t), e);
}
function Td(e) {
  const n = e.rehypePlugins || $i, t = e.remarkPlugins || $i, r = e.remarkRehypeOptions ? { ...e.remarkRehypeOptions, ...Hi } : Hi;
  return _d().use(su).use(t).use(td, r).use(n);
}
function Cd(e) {
  const n = e.children || "", t = new eo();
  return typeof n == "string" && (t.value = n), t;
}
function Ad(e, n) {
  const t = n.allowedElements, r = n.allowElement, i = n.components, o = n.disallowedElements, a = n.skipHtml, s = n.unwrapDisallowed, l = n.urlTransform || Id;
  for (const d of vd)
    Object.hasOwn(n, d.from) && ("" + d.from + (d.to ? "use `" + d.to + "` instead" : "remove it") + Nd + d.id, void 0);
  return n.className && (e = {
    type: "element",
    tagName: "div",
    properties: { className: n.className },
    // Assume no doctypes.
    children: (
      /** @type {Array<ElementContent>} */
      e.type === "root" ? e.children : [e]
    )
  }), Dt(e, c), qs(e, {
    Fragment: ya,
    // @ts-expect-error
    // React components are allowed to return numbers,
    // but not according to the types in hast-util-to-jsx-runtime
    components: i,
    ignoreInvalidStyle: !0,
    jsx: A,
    jsxs: q,
    passKeys: !0,
    passNode: !0
  });
  function c(d, u, p) {
    if (d.type === "raw" && p && typeof u == "number")
      return a ? p.children.splice(u, 1) : p.children[u] = { type: "text", value: d.value }, u;
    if (d.type === "element") {
      let f;
      for (f in Yt)
        if (Object.hasOwn(Yt, f) && Object.hasOwn(d.properties, f)) {
          const g = d.properties[f], E = Yt[f];
          (E === null || E.includes(d.tagName)) && (d.properties[f] = l(String(g || ""), f, d));
        }
    }
    if (d.type === "element") {
      let f = t ? !t.includes(d.tagName) : o ? o.includes(d.tagName) : !1;
      if (!f && r && typeof u == "number" && (f = !r(d, u, p)), f && p && typeof u == "number")
        return s && d.children ? p.children.splice(u, 1, ...d.children) : p.children.splice(u, 1), u;
    }
  }
}
function Id(e) {
  const n = e.indexOf(":"), t = e.indexOf("?"), r = e.indexOf("#"), i = e.indexOf("/");
  return (
    // If there is no protocol, it’s relative.
    n === -1 || // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
    i !== -1 && n > i || t !== -1 && n > t || r !== -1 && n > r || // It is a protocol, it should be allowed.
    Sd.test(e.slice(0, n)) ? e : ""
  );
}
function Gi(e, n) {
  const t = String(e);
  if (typeof n != "string")
    throw new TypeError("Expected character");
  let r = 0, i = t.indexOf(n);
  for (; i !== -1; )
    r++, i = t.indexOf(n, i + n.length);
  return r;
}
function Od(e) {
  if (typeof e != "string")
    throw new TypeError("Expected a string");
  return e.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function Rd(e, n, t) {
  const i = rt((t || {}).ignore || []), o = Md(n);
  let a = -1;
  for (; ++a < o.length; )
    ja(e, "text", s);
  function s(c, d) {
    let u = -1, p;
    for (; ++u < d.length; ) {
      const f = d[u], g = p ? p.children : void 0;
      if (i(
        f,
        g ? g.indexOf(f) : void 0,
        p
      ))
        return;
      p = f;
    }
    if (p)
      return l(c, d);
  }
  function l(c, d) {
    const u = d[d.length - 1], p = o[a][0], f = o[a][1];
    let g = 0;
    const _ = u.children.indexOf(c);
    let h = !1, N = [];
    p.lastIndex = 0;
    let k = p.exec(c.value);
    for (; k; ) {
      const v = k.index, I = {
        index: k.index,
        input: k.input,
        stack: [...d, c]
      };
      let w = f(...k, I);
      if (typeof w == "string" && (w = w.length > 0 ? { type: "text", value: w } : void 0), w === !1 ? p.lastIndex = v + 1 : (g !== v && N.push({
        type: "text",
        value: c.value.slice(g, v)
      }), Array.isArray(w) ? N.push(...w) : w && N.push(w), g = v + k[0].length, h = !0), !p.global)
        break;
      k = p.exec(c.value);
    }
    return h ? (g < c.value.length && N.push({ type: "text", value: c.value.slice(g) }), u.children.splice(_, 1, ...N)) : N = [c], _ + N.length;
  }
}
function Md(e) {
  const n = [];
  if (!Array.isArray(e))
    throw new TypeError("Expected find and replace tuple or list of tuples");
  const t = !e[0] || Array.isArray(e[0]) ? e : [e];
  let r = -1;
  for (; ++r < t.length; ) {
    const i = t[r];
    n.push([Ld(i[0]), Dd(i[1])]);
  }
  return n;
}
function Ld(e) {
  return typeof e == "string" ? new RegExp(Od(e), "g") : e;
}
function Dd(e) {
  return typeof e == "function" ? e : function() {
    return e;
  };
}
const ar = "phrasing", or = ["autolink", "link", "image", "label"];
function Pd() {
  return {
    transforms: [Gd],
    enter: {
      literalAutolink: Fd,
      literalAutolinkEmail: sr,
      literalAutolinkHttp: sr,
      literalAutolinkWww: sr
    },
    exit: {
      literalAutolink: Hd,
      literalAutolinkEmail: $d,
      literalAutolinkHttp: zd,
      literalAutolinkWww: Ud
    }
  };
}
function Bd() {
  return {
    unsafe: [
      {
        character: "@",
        before: "[+\\-.\\w]",
        after: "[\\-.\\w]",
        inConstruct: ar,
        notInConstruct: or
      },
      {
        character: ".",
        before: "[Ww]",
        after: "[\\-.\\w]",
        inConstruct: ar,
        notInConstruct: or
      },
      {
        character: ":",
        before: "[ps]",
        after: "\\/",
        inConstruct: ar,
        notInConstruct: or
      }
    ]
  };
}
function Fd(e) {
  this.enter({ type: "link", title: null, url: "", children: [] }, e);
}
function sr(e) {
  this.config.enter.autolinkProtocol.call(this, e);
}
function zd(e) {
  this.config.exit.autolinkProtocol.call(this, e);
}
function Ud(e) {
  this.config.exit.data.call(this, e);
  const n = this.stack[this.stack.length - 1];
  n.type, n.url = "http://" + this.sliceSerialize(e);
}
function $d(e) {
  this.config.exit.autolinkEmail.call(this, e);
}
function Hd(e) {
  this.exit(e);
}
function Gd(e) {
  Rd(
    e,
    [
      [/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, qd],
      [new RegExp("(?<=^|\\s|\\p{P}|\\p{S})([-.\\w+]+)@([-\\w]+(?:\\.[-\\w]+)+)", "gu"), Kd]
    ],
    { ignore: ["link", "linkReference"] }
  );
}
function qd(e, n, t, r, i) {
  let o = "";
  if (!to(i) || (/^w/i.test(n) && (t = n + t, n = "", o = "http://"), !Wd(t)))
    return !1;
  const a = Vd(t + r);
  if (!a[0]) return !1;
  const s = {
    type: "link",
    title: null,
    url: o + n + a[0],
    children: [{ type: "text", value: n + a[0] }]
  };
  return a[1] ? [s, { type: "text", value: a[1] }] : s;
}
function Kd(e, n, t, r) {
  return (
    // Not an expected previous character.
    !to(r, !0) || // Label ends in not allowed character.
    /[-\d_]$/.test(t) ? !1 : {
      type: "link",
      title: null,
      url: "mailto:" + n + "@" + t,
      children: [{ type: "text", value: n + "@" + t }]
    }
  );
}
function Wd(e) {
  const n = e.split(".");
  return !(n.length < 2 || n[n.length - 1] && (/_/.test(n[n.length - 1]) || !/[a-zA-Z\d]/.test(n[n.length - 1])) || n[n.length - 2] && (/_/.test(n[n.length - 2]) || !/[a-zA-Z\d]/.test(n[n.length - 2])));
}
function Vd(e) {
  const n = /[!"&'),.:;<>?\]}]+$/.exec(e);
  if (!n)
    return [e, void 0];
  e = e.slice(0, n.index);
  let t = n[0], r = t.indexOf(")");
  const i = Gi(e, "(");
  let o = Gi(e, ")");
  for (; r !== -1 && i > o; )
    e += t.slice(0, r + 1), t = t.slice(r + 1), r = t.indexOf(")"), o++;
  return [e, t];
}
function to(e, n) {
  const t = e.input.charCodeAt(e.index - 1);
  return (e.index === 0 || xn(t) || Ot(t)) && // If it’s an email, the previous character should not be a slash.
  (!n || t !== 47);
}
ro.peek = tf;
function Yd() {
  this.buffer();
}
function Zd(e) {
  this.enter({ type: "footnoteReference", identifier: "", label: "" }, e);
}
function Xd() {
  this.buffer();
}
function Qd(e) {
  this.enter(
    { type: "footnoteDefinition", identifier: "", label: "", children: [] },
    e
  );
}
function Jd(e) {
  const n = this.resume(), t = this.stack[this.stack.length - 1];
  t.type, t.identifier = Ye(
    this.sliceSerialize(e)
  ).toLowerCase(), t.label = n;
}
function jd(e) {
  this.exit(e);
}
function ef(e) {
  const n = this.resume(), t = this.stack[this.stack.length - 1];
  t.type, t.identifier = Ye(
    this.sliceSerialize(e)
  ).toLowerCase(), t.label = n;
}
function nf(e) {
  this.exit(e);
}
function tf() {
  return "[";
}
function ro(e, n, t, r) {
  const i = t.createTracker(r);
  let o = i.move("[^");
  const a = t.enter("footnoteReference"), s = t.enter("reference");
  return o += i.move(
    t.safe(t.associationId(e), { after: "]", before: o })
  ), s(), a(), o += i.move("]"), o;
}
function rf() {
  return {
    enter: {
      gfmFootnoteCallString: Yd,
      gfmFootnoteCall: Zd,
      gfmFootnoteDefinitionLabelString: Xd,
      gfmFootnoteDefinition: Qd
    },
    exit: {
      gfmFootnoteCallString: Jd,
      gfmFootnoteCall: jd,
      gfmFootnoteDefinitionLabelString: ef,
      gfmFootnoteDefinition: nf
    }
  };
}
function af(e) {
  let n = !1;
  return e && e.firstLineBlank && (n = !0), {
    handlers: { footnoteDefinition: t, footnoteReference: ro },
    // This is on by default already.
    unsafe: [{ character: "[", inConstruct: ["label", "phrasing", "reference"] }]
  };
  function t(r, i, o, a) {
    const s = o.createTracker(a);
    let l = s.move("[^");
    const c = o.enter("footnoteDefinition"), d = o.enter("label");
    return l += s.move(
      o.safe(o.associationId(r), { before: l, after: "]" })
    ), d(), l += s.move("]:"), r.children && r.children.length > 0 && (s.shift(4), l += s.move(
      (n ? `
` : " ") + o.indentLines(
        o.containerFlow(r, s.current()),
        n ? io : of
      )
    )), c(), l;
  }
}
function of(e, n, t) {
  return n === 0 ? e : io(e, n, t);
}
function io(e, n, t) {
  return (t ? "" : "    ") + e;
}
const sf = [
  "autolink",
  "destinationLiteral",
  "destinationRaw",
  "reference",
  "titleQuote",
  "titleApostrophe"
];
ao.peek = ff;
function lf() {
  return {
    canContainEols: ["delete"],
    enter: { strikethrough: uf },
    exit: { strikethrough: df }
  };
}
function cf() {
  return {
    unsafe: [
      {
        character: "~",
        inConstruct: "phrasing",
        notInConstruct: sf
      }
    ],
    handlers: { delete: ao }
  };
}
function uf(e) {
  this.enter({ type: "delete", children: [] }, e);
}
function df(e) {
  this.exit(e);
}
function ao(e, n, t, r) {
  const i = t.createTracker(r), o = t.enter("strikethrough");
  let a = i.move("~~");
  return a += t.containerPhrasing(e, {
    ...i.current(),
    before: a,
    after: "~"
  }), a += i.move("~~"), o(), a;
}
function ff() {
  return "~";
}
function pf(e) {
  return e.length;
}
function gf(e, n) {
  const t = n || {}, r = (t.align || []).concat(), i = t.stringLength || pf, o = [], a = [], s = [], l = [];
  let c = 0, d = -1;
  for (; ++d < e.length; ) {
    const E = [], _ = [];
    let h = -1;
    for (e[d].length > c && (c = e[d].length); ++h < e[d].length; ) {
      const N = hf(e[d][h]);
      if (t.alignDelimiters !== !1) {
        const k = i(N);
        _[h] = k, (l[h] === void 0 || k > l[h]) && (l[h] = k);
      }
      E.push(N);
    }
    a[d] = E, s[d] = _;
  }
  let u = -1;
  if (typeof r == "object" && "length" in r)
    for (; ++u < c; )
      o[u] = qi(r[u]);
  else {
    const E = qi(r);
    for (; ++u < c; )
      o[u] = E;
  }
  u = -1;
  const p = [], f = [];
  for (; ++u < c; ) {
    const E = o[u];
    let _ = "", h = "";
    E === 99 ? (_ = ":", h = ":") : E === 108 ? _ = ":" : E === 114 && (h = ":");
    let N = t.alignDelimiters === !1 ? 1 : Math.max(
      1,
      l[u] - _.length - h.length
    );
    const k = _ + "-".repeat(N) + h;
    t.alignDelimiters !== !1 && (N = _.length + N + h.length, N > l[u] && (l[u] = N), f[u] = N), p[u] = k;
  }
  a.splice(1, 0, p), s.splice(1, 0, f), d = -1;
  const g = [];
  for (; ++d < a.length; ) {
    const E = a[d], _ = s[d];
    u = -1;
    const h = [];
    for (; ++u < c; ) {
      const N = E[u] || "";
      let k = "", v = "";
      if (t.alignDelimiters !== !1) {
        const I = l[u] - (_[u] || 0), w = o[u];
        w === 114 ? k = " ".repeat(I) : w === 99 ? I % 2 ? (k = " ".repeat(I / 2 + 0.5), v = " ".repeat(I / 2 - 0.5)) : (k = " ".repeat(I / 2), v = k) : v = " ".repeat(I);
      }
      t.delimiterStart !== !1 && !u && h.push("|"), t.padding !== !1 && // Don’t add the opening space if we’re not aligning and the cell is
      // empty: there will be a closing space.
      !(t.alignDelimiters === !1 && N === "") && (t.delimiterStart !== !1 || u) && h.push(" "), t.alignDelimiters !== !1 && h.push(k), h.push(N), t.alignDelimiters !== !1 && h.push(v), t.padding !== !1 && h.push(" "), (t.delimiterEnd !== !1 || u !== c - 1) && h.push("|");
    }
    g.push(
      t.delimiterEnd === !1 ? h.join("").replace(/ +$/, "") : h.join("")
    );
  }
  return g.join(`
`);
}
function hf(e) {
  return e == null ? "" : String(e);
}
function qi(e) {
  const n = typeof e == "string" ? e.codePointAt(0) : 0;
  return n === 67 || n === 99 ? 99 : n === 76 || n === 108 ? 108 : n === 82 || n === 114 ? 114 : 0;
}
function mf(e, n, t, r) {
  const i = t.enter("blockquote"), o = t.createTracker(r);
  o.move("> "), o.shift(2);
  const a = t.indentLines(
    t.containerFlow(e, o.current()),
    bf
  );
  return i(), a;
}
function bf(e, n, t) {
  return ">" + (t ? "" : " ") + e;
}
function Ef(e, n) {
  return Ki(e, n.inConstruct, !0) && !Ki(e, n.notInConstruct, !1);
}
function Ki(e, n, t) {
  if (typeof n == "string" && (n = [n]), !n || n.length === 0)
    return t;
  let r = -1;
  for (; ++r < n.length; )
    if (e.includes(n[r]))
      return !0;
  return !1;
}
function Wi(e, n, t, r) {
  let i = -1;
  for (; ++i < t.unsafe.length; )
    if (t.unsafe[i].character === `
` && Ef(t.stack, t.unsafe[i]))
      return /[ \t]/.test(r.before) ? "" : " ";
  return `\\
`;
}
function yf(e, n) {
  const t = String(e);
  let r = t.indexOf(n), i = r, o = 0, a = 0;
  if (typeof n != "string")
    throw new TypeError("Expected substring");
  for (; r !== -1; )
    r === i ? ++o > a && (a = o) : o = 1, i = r + n.length, r = t.indexOf(n, i);
  return a;
}
function _f(e, n) {
  return !!(n.options.fences === !1 && e.value && // If there’s no info…
  !e.lang && // And there’s a non-whitespace character…
  /[^ \r\n]/.test(e.value) && // And the value doesn’t start or end in a blank…
  !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(e.value));
}
function kf(e) {
  const n = e.options.fence || "`";
  if (n !== "`" && n !== "~")
    throw new Error(
      "Cannot serialize code with `" + n + "` for `options.fence`, expected `` ` `` or `~`"
    );
  return n;
}
function wf(e, n, t, r) {
  const i = kf(t), o = e.value || "", a = i === "`" ? "GraveAccent" : "Tilde";
  if (_f(e, t)) {
    const u = t.enter("codeIndented"), p = t.indentLines(o, xf);
    return u(), p;
  }
  const s = t.createTracker(r), l = i.repeat(Math.max(yf(o, i) + 1, 3)), c = t.enter("codeFenced");
  let d = s.move(l);
  if (e.lang) {
    const u = t.enter(`codeFencedLang${a}`);
    d += s.move(
      t.safe(e.lang, {
        before: d,
        after: " ",
        encode: ["`"],
        ...s.current()
      })
    ), u();
  }
  if (e.lang && e.meta) {
    const u = t.enter(`codeFencedMeta${a}`);
    d += s.move(" "), d += s.move(
      t.safe(e.meta, {
        before: d,
        after: `
`,
        encode: ["`"],
        ...s.current()
      })
    ), u();
  }
  return d += s.move(`
`), o && (d += s.move(o + `
`)), d += s.move(l), c(), d;
}
function xf(e, n, t) {
  return (t ? "" : "    ") + e;
}
function Kr(e) {
  const n = e.options.quote || '"';
  if (n !== '"' && n !== "'")
    throw new Error(
      "Cannot serialize title with `" + n + "` for `options.quote`, expected `\"`, or `'`"
    );
  return n;
}
function Nf(e, n, t, r) {
  const i = Kr(t), o = i === '"' ? "Quote" : "Apostrophe", a = t.enter("definition");
  let s = t.enter("label");
  const l = t.createTracker(r);
  let c = l.move("[");
  return c += l.move(
    t.safe(t.associationId(e), {
      before: c,
      after: "]",
      ...l.current()
    })
  ), c += l.move("]: "), s(), // If there’s no url, or…
  !e.url || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (s = t.enter("destinationLiteral"), c += l.move("<"), c += l.move(
    t.safe(e.url, { before: c, after: ">", ...l.current() })
  ), c += l.move(">")) : (s = t.enter("destinationRaw"), c += l.move(
    t.safe(e.url, {
      before: c,
      after: e.title ? " " : `
`,
      ...l.current()
    })
  )), s(), e.title && (s = t.enter(`title${o}`), c += l.move(" " + i), c += l.move(
    t.safe(e.title, {
      before: c,
      after: i,
      ...l.current()
    })
  ), c += l.move(i), s()), a(), c;
}
function Sf(e) {
  const n = e.options.emphasis || "*";
  if (n !== "*" && n !== "_")
    throw new Error(
      "Cannot serialize emphasis with `" + n + "` for `options.emphasis`, expected `*`, or `_`"
    );
  return n;
}
function jn(e) {
  return "&#x" + e.toString(16).toUpperCase() + ";";
}
function Tt(e, n, t) {
  const r = Dn(e), i = Dn(n);
  return r === void 0 ? i === void 0 ? (
    // Letter inside:
    // we have to encode *both* letters for `_` as it is looser.
    // it already forms for `*` (and GFMs `~`).
    t === "_" ? { inside: !0, outside: !0 } : { inside: !1, outside: !1 }
  ) : i === 1 ? (
    // Whitespace inside: encode both (letter, whitespace).
    { inside: !0, outside: !0 }
  ) : (
    // Punctuation inside: encode outer (letter)
    { inside: !1, outside: !0 }
  ) : r === 1 ? i === void 0 ? (
    // Letter inside: already forms.
    { inside: !1, outside: !1 }
  ) : i === 1 ? (
    // Whitespace inside: encode both (whitespace).
    { inside: !0, outside: !0 }
  ) : (
    // Punctuation inside: already forms.
    { inside: !1, outside: !1 }
  ) : i === void 0 ? (
    // Letter inside: already forms.
    { inside: !1, outside: !1 }
  ) : i === 1 ? (
    // Whitespace inside: encode inner (whitespace).
    { inside: !0, outside: !1 }
  ) : (
    // Punctuation inside: already forms.
    { inside: !1, outside: !1 }
  );
}
oo.peek = vf;
function oo(e, n, t, r) {
  const i = Sf(t), o = t.enter("emphasis"), a = t.createTracker(r), s = a.move(i);
  let l = a.move(
    t.containerPhrasing(e, {
      after: i,
      before: s,
      ...a.current()
    })
  );
  const c = l.charCodeAt(0), d = Tt(
    r.before.charCodeAt(r.before.length - 1),
    c,
    i
  );
  d.inside && (l = jn(c) + l.slice(1));
  const u = l.charCodeAt(l.length - 1), p = Tt(r.after.charCodeAt(0), u, i);
  p.inside && (l = l.slice(0, -1) + jn(u));
  const f = a.move(i);
  return o(), t.attentionEncodeSurroundingInfo = {
    after: p.outside,
    before: d.outside
  }, s + l + f;
}
function vf(e, n, t) {
  return t.options.emphasis || "*";
}
function Tf(e, n) {
  let t = !1;
  return Dt(e, function(r) {
    if ("value" in r && /\r?\n|\r/.test(r.value) || r.type === "break")
      return t = !0, Er;
  }), !!((!e.depth || e.depth < 3) && Br(e) && (n.options.setext || t));
}
function Cf(e, n, t, r) {
  const i = Math.max(Math.min(6, e.depth || 1), 1), o = t.createTracker(r);
  if (Tf(e, t)) {
    const d = t.enter("headingSetext"), u = t.enter("phrasing"), p = t.containerPhrasing(e, {
      ...o.current(),
      before: `
`,
      after: `
`
    });
    return u(), d(), p + `
` + (i === 1 ? "=" : "-").repeat(
      // The whole size…
      p.length - // Minus the position of the character after the last EOL (or
      // 0 if there is none)…
      (Math.max(p.lastIndexOf("\r"), p.lastIndexOf(`
`)) + 1)
    );
  }
  const a = "#".repeat(i), s = t.enter("headingAtx"), l = t.enter("phrasing");
  o.move(a + " ");
  let c = t.containerPhrasing(e, {
    before: "# ",
    after: `
`,
    ...o.current()
  });
  return /^[\t ]/.test(c) && (c = jn(c.charCodeAt(0)) + c.slice(1)), c = c ? a + " " + c : a, t.options.closeAtx && (c += " " + a), l(), s(), c;
}
so.peek = Af;
function so(e) {
  return e.value || "";
}
function Af() {
  return "<";
}
lo.peek = If;
function lo(e, n, t, r) {
  const i = Kr(t), o = i === '"' ? "Quote" : "Apostrophe", a = t.enter("image");
  let s = t.enter("label");
  const l = t.createTracker(r);
  let c = l.move("![");
  return c += l.move(
    t.safe(e.alt, { before: c, after: "]", ...l.current() })
  ), c += l.move("]("), s(), // If there’s no url but there is a title…
  !e.url && e.title || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (s = t.enter("destinationLiteral"), c += l.move("<"), c += l.move(
    t.safe(e.url, { before: c, after: ">", ...l.current() })
  ), c += l.move(">")) : (s = t.enter("destinationRaw"), c += l.move(
    t.safe(e.url, {
      before: c,
      after: e.title ? " " : ")",
      ...l.current()
    })
  )), s(), e.title && (s = t.enter(`title${o}`), c += l.move(" " + i), c += l.move(
    t.safe(e.title, {
      before: c,
      after: i,
      ...l.current()
    })
  ), c += l.move(i), s()), c += l.move(")"), a(), c;
}
function If() {
  return "!";
}
co.peek = Of;
function co(e, n, t, r) {
  const i = e.referenceType, o = t.enter("imageReference");
  let a = t.enter("label");
  const s = t.createTracker(r);
  let l = s.move("![");
  const c = t.safe(e.alt, {
    before: l,
    after: "]",
    ...s.current()
  });
  l += s.move(c + "]["), a();
  const d = t.stack;
  t.stack = [], a = t.enter("reference");
  const u = t.safe(t.associationId(e), {
    before: l,
    after: "]",
    ...s.current()
  });
  return a(), t.stack = d, o(), i === "full" || !c || c !== u ? l += s.move(u + "]") : i === "shortcut" ? l = l.slice(0, -1) : l += s.move("]"), l;
}
function Of() {
  return "!";
}
uo.peek = Rf;
function uo(e, n, t) {
  let r = e.value || "", i = "`", o = -1;
  for (; new RegExp("(^|[^`])" + i + "([^`]|$)").test(r); )
    i += "`";
  for (/[^ \r\n]/.test(r) && (/^[ \r\n]/.test(r) && /[ \r\n]$/.test(r) || /^`|`$/.test(r)) && (r = " " + r + " "); ++o < t.unsafe.length; ) {
    const a = t.unsafe[o], s = t.compilePattern(a);
    let l;
    if (a.atBreak)
      for (; l = s.exec(r); ) {
        let c = l.index;
        r.charCodeAt(c) === 10 && r.charCodeAt(c - 1) === 13 && c--, r = r.slice(0, c) + " " + r.slice(l.index + 1);
      }
  }
  return i + r + i;
}
function Rf() {
  return "`";
}
function fo(e, n) {
  const t = Br(e);
  return !!(!n.options.resourceLink && // If there’s a url…
  e.url && // And there’s a no title…
  !e.title && // And the content of `node` is a single text node…
  e.children && e.children.length === 1 && e.children[0].type === "text" && // And if the url is the same as the content…
  (t === e.url || "mailto:" + t === e.url) && // And that starts w/ a protocol…
  /^[a-z][a-z+.-]+:/i.test(e.url) && // And that doesn’t contain ASCII control codes (character escapes and
  // references don’t work), space, or angle brackets…
  !/[\0- <>\u007F]/.test(e.url));
}
po.peek = Mf;
function po(e, n, t, r) {
  const i = Kr(t), o = i === '"' ? "Quote" : "Apostrophe", a = t.createTracker(r);
  let s, l;
  if (fo(e, t)) {
    const d = t.stack;
    t.stack = [], s = t.enter("autolink");
    let u = a.move("<");
    return u += a.move(
      t.containerPhrasing(e, {
        before: u,
        after: ">",
        ...a.current()
      })
    ), u += a.move(">"), s(), t.stack = d, u;
  }
  s = t.enter("link"), l = t.enter("label");
  let c = a.move("[");
  return c += a.move(
    t.containerPhrasing(e, {
      before: c,
      after: "](",
      ...a.current()
    })
  ), c += a.move("]("), l(), // If there’s no url but there is a title…
  !e.url && e.title || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (l = t.enter("destinationLiteral"), c += a.move("<"), c += a.move(
    t.safe(e.url, { before: c, after: ">", ...a.current() })
  ), c += a.move(">")) : (l = t.enter("destinationRaw"), c += a.move(
    t.safe(e.url, {
      before: c,
      after: e.title ? " " : ")",
      ...a.current()
    })
  )), l(), e.title && (l = t.enter(`title${o}`), c += a.move(" " + i), c += a.move(
    t.safe(e.title, {
      before: c,
      after: i,
      ...a.current()
    })
  ), c += a.move(i), l()), c += a.move(")"), s(), c;
}
function Mf(e, n, t) {
  return fo(e, t) ? "<" : "[";
}
go.peek = Lf;
function go(e, n, t, r) {
  const i = e.referenceType, o = t.enter("linkReference");
  let a = t.enter("label");
  const s = t.createTracker(r);
  let l = s.move("[");
  const c = t.containerPhrasing(e, {
    before: l,
    after: "]",
    ...s.current()
  });
  l += s.move(c + "]["), a();
  const d = t.stack;
  t.stack = [], a = t.enter("reference");
  const u = t.safe(t.associationId(e), {
    before: l,
    after: "]",
    ...s.current()
  });
  return a(), t.stack = d, o(), i === "full" || !c || c !== u ? l += s.move(u + "]") : i === "shortcut" ? l = l.slice(0, -1) : l += s.move("]"), l;
}
function Lf() {
  return "[";
}
function Wr(e) {
  const n = e.options.bullet || "*";
  if (n !== "*" && n !== "+" && n !== "-")
    throw new Error(
      "Cannot serialize items with `" + n + "` for `options.bullet`, expected `*`, `+`, or `-`"
    );
  return n;
}
function Df(e) {
  const n = Wr(e), t = e.options.bulletOther;
  if (!t)
    return n === "*" ? "-" : "*";
  if (t !== "*" && t !== "+" && t !== "-")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bulletOther`, expected `*`, `+`, or `-`"
    );
  if (t === n)
    throw new Error(
      "Expected `bullet` (`" + n + "`) and `bulletOther` (`" + t + "`) to be different"
    );
  return t;
}
function Pf(e) {
  const n = e.options.bulletOrdered || ".";
  if (n !== "." && n !== ")")
    throw new Error(
      "Cannot serialize items with `" + n + "` for `options.bulletOrdered`, expected `.` or `)`"
    );
  return n;
}
function ho(e) {
  const n = e.options.rule || "*";
  if (n !== "*" && n !== "-" && n !== "_")
    throw new Error(
      "Cannot serialize rules with `" + n + "` for `options.rule`, expected `*`, `-`, or `_`"
    );
  return n;
}
function Bf(e, n, t, r) {
  const i = t.enter("list"), o = t.bulletCurrent;
  let a = e.ordered ? Pf(t) : Wr(t);
  const s = e.ordered ? a === "." ? ")" : "." : Df(t);
  let l = n && t.bulletLastUsed ? a === t.bulletLastUsed : !1;
  if (!e.ordered) {
    const d = e.children ? e.children[0] : void 0;
    if (
      // Bullet could be used as a thematic break marker:
      (a === "*" || a === "-") && // Empty first list item:
      d && (!d.children || !d.children[0]) && // Directly in two other list items:
      t.stack[t.stack.length - 1] === "list" && t.stack[t.stack.length - 2] === "listItem" && t.stack[t.stack.length - 3] === "list" && t.stack[t.stack.length - 4] === "listItem" && // That are each the first child.
      t.indexStack[t.indexStack.length - 1] === 0 && t.indexStack[t.indexStack.length - 2] === 0 && t.indexStack[t.indexStack.length - 3] === 0 && (l = !0), ho(t) === a && d
    ) {
      let u = -1;
      for (; ++u < e.children.length; ) {
        const p = e.children[u];
        if (p && p.type === "listItem" && p.children && p.children[0] && p.children[0].type === "thematicBreak") {
          l = !0;
          break;
        }
      }
    }
  }
  l && (a = s), t.bulletCurrent = a;
  const c = t.containerFlow(e, r);
  return t.bulletLastUsed = a, t.bulletCurrent = o, i(), c;
}
function Ff(e) {
  const n = e.options.listItemIndent || "one";
  if (n !== "tab" && n !== "one" && n !== "mixed")
    throw new Error(
      "Cannot serialize items with `" + n + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`"
    );
  return n;
}
function zf(e, n, t, r) {
  const i = Ff(t);
  let o = t.bulletCurrent || Wr(t);
  n && n.type === "list" && n.ordered && (o = (typeof n.start == "number" && n.start > -1 ? n.start : 1) + (t.options.incrementListMarker === !1 ? 0 : n.children.indexOf(e)) + o);
  let a = o.length + 1;
  (i === "tab" || i === "mixed" && (n && n.type === "list" && n.spread || e.spread)) && (a = Math.ceil(a / 4) * 4);
  const s = t.createTracker(r);
  s.move(o + " ".repeat(a - o.length)), s.shift(a);
  const l = t.enter("listItem"), c = t.indentLines(
    t.containerFlow(e, s.current()),
    d
  );
  return l(), c;
  function d(u, p, f) {
    return p ? (f ? "" : " ".repeat(a)) + u : (f ? o : o + " ".repeat(a - o.length)) + u;
  }
}
function Uf(e, n, t, r) {
  const i = t.enter("paragraph"), o = t.enter("phrasing"), a = t.containerPhrasing(e, r);
  return o(), i(), a;
}
const $f = (
  /** @type {(node?: unknown) => node is Exclude<PhrasingContent, Html>} */
  rt([
    "break",
    "delete",
    "emphasis",
    // To do: next major: removed since footnotes were added to GFM.
    "footnote",
    "footnoteReference",
    "image",
    "imageReference",
    "inlineCode",
    // Enabled by `mdast-util-math`:
    "inlineMath",
    "link",
    "linkReference",
    // Enabled by `mdast-util-mdx`:
    "mdxJsxTextElement",
    // Enabled by `mdast-util-mdx`:
    "mdxTextExpression",
    "strong",
    "text",
    // Enabled by `mdast-util-directive`:
    "textDirective"
  ])
);
function Hf(e, n, t, r) {
  return (e.children.some(function(a) {
    return $f(a);
  }) ? t.containerPhrasing : t.containerFlow).call(t, e, r);
}
function Gf(e) {
  const n = e.options.strong || "*";
  if (n !== "*" && n !== "_")
    throw new Error(
      "Cannot serialize strong with `" + n + "` for `options.strong`, expected `*`, or `_`"
    );
  return n;
}
mo.peek = qf;
function mo(e, n, t, r) {
  const i = Gf(t), o = t.enter("strong"), a = t.createTracker(r), s = a.move(i + i);
  let l = a.move(
    t.containerPhrasing(e, {
      after: i,
      before: s,
      ...a.current()
    })
  );
  const c = l.charCodeAt(0), d = Tt(
    r.before.charCodeAt(r.before.length - 1),
    c,
    i
  );
  d.inside && (l = jn(c) + l.slice(1));
  const u = l.charCodeAt(l.length - 1), p = Tt(r.after.charCodeAt(0), u, i);
  p.inside && (l = l.slice(0, -1) + jn(u));
  const f = a.move(i + i);
  return o(), t.attentionEncodeSurroundingInfo = {
    after: p.outside,
    before: d.outside
  }, s + l + f;
}
function qf(e, n, t) {
  return t.options.strong || "*";
}
function Kf(e, n, t, r) {
  return t.safe(e.value, r);
}
function Wf(e) {
  const n = e.options.ruleRepetition || 3;
  if (n < 3)
    throw new Error(
      "Cannot serialize rules with repetition `" + n + "` for `options.ruleRepetition`, expected `3` or more"
    );
  return n;
}
function Vf(e, n, t) {
  const r = (ho(t) + (t.options.ruleSpaces ? " " : "")).repeat(Wf(t));
  return t.options.ruleSpaces ? r.slice(0, -1) : r;
}
const bo = {
  blockquote: mf,
  break: Wi,
  code: wf,
  definition: Nf,
  emphasis: oo,
  hardBreak: Wi,
  heading: Cf,
  html: so,
  image: lo,
  imageReference: co,
  inlineCode: uo,
  link: po,
  linkReference: go,
  list: Bf,
  listItem: zf,
  paragraph: Uf,
  root: Hf,
  strong: mo,
  text: Kf,
  thematicBreak: Vf
};
function Yf() {
  return {
    enter: {
      table: Zf,
      tableData: Vi,
      tableHeader: Vi,
      tableRow: Qf
    },
    exit: {
      codeText: Jf,
      table: Xf,
      tableData: lr,
      tableHeader: lr,
      tableRow: lr
    }
  };
}
function Zf(e) {
  const n = e._align;
  this.enter(
    {
      type: "table",
      align: n.map(function(t) {
        return t === "none" ? null : t;
      }),
      children: []
    },
    e
  ), this.data.inTable = !0;
}
function Xf(e) {
  this.exit(e), this.data.inTable = void 0;
}
function Qf(e) {
  this.enter({ type: "tableRow", children: [] }, e);
}
function lr(e) {
  this.exit(e);
}
function Vi(e) {
  this.enter({ type: "tableCell", children: [] }, e);
}
function Jf(e) {
  let n = this.resume();
  this.data.inTable && (n = n.replace(/\\([\\|])/g, jf));
  const t = this.stack[this.stack.length - 1];
  t.type, t.value = n, this.exit(e);
}
function jf(e, n) {
  return n === "|" ? n : e;
}
function ep(e) {
  const n = e || {}, t = n.tableCellPadding, r = n.tablePipeAlign, i = n.stringLength, o = t ? " " : "|";
  return {
    unsafe: [
      { character: "\r", inConstruct: "tableCell" },
      { character: `
`, inConstruct: "tableCell" },
      // A pipe, when followed by a tab or space (padding), or a dash or colon
      // (unpadded delimiter row), could result in a table.
      { atBreak: !0, character: "|", after: "[	 :-]" },
      // A pipe in a cell must be encoded.
      { character: "|", inConstruct: "tableCell" },
      // A colon must be followed by a dash, in which case it could start a
      // delimiter row.
      { atBreak: !0, character: ":", after: "-" },
      // A delimiter row can also start with a dash, when followed by more
      // dashes, a colon, or a pipe.
      // This is a stricter version than the built in check for lists, thematic
      // breaks, and setex heading underlines though:
      // <https://github.com/syntax-tree/mdast-util-to-markdown/blob/51a2038/lib/unsafe.js#L57>
      { atBreak: !0, character: "-", after: "[:|-]" }
    ],
    handlers: {
      inlineCode: p,
      table: a,
      tableCell: l,
      tableRow: s
    }
  };
  function a(f, g, E, _) {
    return c(d(f, E, _), f.align);
  }
  function s(f, g, E, _) {
    const h = u(f, E, _), N = c([h]);
    return N.slice(0, N.indexOf(`
`));
  }
  function l(f, g, E, _) {
    const h = E.enter("tableCell"), N = E.enter("phrasing"), k = E.containerPhrasing(f, {
      ..._,
      before: o,
      after: o
    });
    return N(), h(), k;
  }
  function c(f, g) {
    return gf(f, {
      align: g,
      // @ts-expect-error: `markdown-table` types should support `null`.
      alignDelimiters: r,
      // @ts-expect-error: `markdown-table` types should support `null`.
      padding: t,
      // @ts-expect-error: `markdown-table` types should support `null`.
      stringLength: i
    });
  }
  function d(f, g, E) {
    const _ = f.children;
    let h = -1;
    const N = [], k = g.enter("table");
    for (; ++h < _.length; )
      N[h] = u(_[h], g, E);
    return k(), N;
  }
  function u(f, g, E) {
    const _ = f.children;
    let h = -1;
    const N = [], k = g.enter("tableRow");
    for (; ++h < _.length; )
      N[h] = l(_[h], f, g, E);
    return k(), N;
  }
  function p(f, g, E) {
    let _ = bo.inlineCode(f, g, E);
    return E.stack.includes("tableCell") && (_ = _.replace(/\|/g, "\\$&")), _;
  }
}
function np() {
  return {
    exit: {
      taskListCheckValueChecked: Yi,
      taskListCheckValueUnchecked: Yi,
      paragraph: rp
    }
  };
}
function tp() {
  return {
    unsafe: [{ atBreak: !0, character: "-", after: "[:|-]" }],
    handlers: { listItem: ip }
  };
}
function Yi(e) {
  const n = this.stack[this.stack.length - 2];
  n.type, n.checked = e.type === "taskListCheckValueChecked";
}
function rp(e) {
  const n = this.stack[this.stack.length - 2];
  if (n && n.type === "listItem" && typeof n.checked == "boolean") {
    const t = this.stack[this.stack.length - 1];
    t.type;
    const r = t.children[0];
    if (r && r.type === "text") {
      const i = n.children;
      let o = -1, a;
      for (; ++o < i.length; ) {
        const s = i[o];
        if (s.type === "paragraph") {
          a = s;
          break;
        }
      }
      a === t && (r.value = r.value.slice(1), r.value.length === 0 ? t.children.shift() : t.position && r.position && typeof r.position.start.offset == "number" && (r.position.start.column++, r.position.start.offset++, t.position.start = Object.assign({}, r.position.start)));
    }
  }
  this.exit(e);
}
function ip(e, n, t, r) {
  const i = e.children[0], o = typeof e.checked == "boolean" && i && i.type === "paragraph", a = "[" + (e.checked ? "x" : " ") + "] ", s = t.createTracker(r);
  o && s.move(a);
  let l = bo.listItem(e, n, t, {
    ...r,
    ...s.current()
  });
  return o && (l = l.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, c)), l;
  function c(d) {
    return d + a;
  }
}
function ap() {
  return [
    Pd(),
    rf(),
    lf(),
    Yf(),
    np()
  ];
}
function op(e) {
  return {
    extensions: [
      Bd(),
      af(e),
      cf(),
      ep(e),
      tp()
    ]
  };
}
const sp = {
  tokenize: pp,
  partial: !0
}, Eo = {
  tokenize: gp,
  partial: !0
}, yo = {
  tokenize: hp,
  partial: !0
}, _o = {
  tokenize: mp,
  partial: !0
}, lp = {
  tokenize: bp,
  partial: !0
}, ko = {
  name: "wwwAutolink",
  tokenize: dp,
  previous: xo
}, wo = {
  name: "protocolAutolink",
  tokenize: fp,
  previous: No
}, dn = {
  name: "emailAutolink",
  tokenize: up,
  previous: So
}, en = {};
function cp() {
  return {
    text: en
  };
}
let kn = 48;
for (; kn < 123; )
  en[kn] = dn, kn++, kn === 58 ? kn = 65 : kn === 91 && (kn = 97);
en[43] = dn;
en[45] = dn;
en[46] = dn;
en[95] = dn;
en[72] = [dn, wo];
en[104] = [dn, wo];
en[87] = [dn, ko];
en[119] = [dn, ko];
function up(e, n, t) {
  const r = this;
  let i, o;
  return a;
  function a(u) {
    return !wr(u) || !So.call(r, r.previous) || Vr(r.events) ? t(u) : (e.enter("literalAutolink"), e.enter("literalAutolinkEmail"), s(u));
  }
  function s(u) {
    return wr(u) ? (e.consume(u), s) : u === 64 ? (e.consume(u), l) : t(u);
  }
  function l(u) {
    return u === 46 ? e.check(lp, d, c)(u) : u === 45 || u === 95 || Ce(u) ? (o = !0, e.consume(u), l) : d(u);
  }
  function c(u) {
    return e.consume(u), i = !0, l;
  }
  function d(u) {
    return o && i && Me(r.previous) ? (e.exit("literalAutolinkEmail"), e.exit("literalAutolink"), n(u)) : t(u);
  }
}
function dp(e, n, t) {
  const r = this;
  return i;
  function i(a) {
    return a !== 87 && a !== 119 || !xo.call(r, r.previous) || Vr(r.events) ? t(a) : (e.enter("literalAutolink"), e.enter("literalAutolinkWww"), e.check(sp, e.attempt(Eo, e.attempt(yo, o), t), t)(a));
  }
  function o(a) {
    return e.exit("literalAutolinkWww"), e.exit("literalAutolink"), n(a);
  }
}
function fp(e, n, t) {
  const r = this;
  let i = "", o = !1;
  return a;
  function a(u) {
    return (u === 72 || u === 104) && No.call(r, r.previous) && !Vr(r.events) ? (e.enter("literalAutolink"), e.enter("literalAutolinkHttp"), i += String.fromCodePoint(u), e.consume(u), s) : t(u);
  }
  function s(u) {
    if (Me(u) && i.length < 5)
      return i += String.fromCodePoint(u), e.consume(u), s;
    if (u === 58) {
      const p = i.toLowerCase();
      if (p === "http" || p === "https")
        return e.consume(u), l;
    }
    return t(u);
  }
  function l(u) {
    return u === 47 ? (e.consume(u), o ? c : (o = !0, l)) : t(u);
  }
  function c(u) {
    return u === null || Nt(u) || me(u) || xn(u) || Ot(u) ? t(u) : e.attempt(Eo, e.attempt(yo, d), t)(u);
  }
  function d(u) {
    return e.exit("literalAutolinkHttp"), e.exit("literalAutolink"), n(u);
  }
}
function pp(e, n, t) {
  let r = 0;
  return i;
  function i(a) {
    return (a === 87 || a === 119) && r < 3 ? (r++, e.consume(a), i) : a === 46 && r === 3 ? (e.consume(a), o) : t(a);
  }
  function o(a) {
    return a === null ? t(a) : n(a);
  }
}
function gp(e, n, t) {
  let r, i, o;
  return a;
  function a(c) {
    return c === 46 || c === 95 ? e.check(_o, l, s)(c) : c === null || me(c) || xn(c) || c !== 45 && Ot(c) ? l(c) : (o = !0, e.consume(c), a);
  }
  function s(c) {
    return c === 95 ? r = !0 : (i = r, r = void 0), e.consume(c), a;
  }
  function l(c) {
    return i || r || !o ? t(c) : n(c);
  }
}
function hp(e, n) {
  let t = 0, r = 0;
  return i;
  function i(a) {
    return a === 40 ? (t++, e.consume(a), i) : a === 41 && r < t ? o(a) : a === 33 || a === 34 || a === 38 || a === 39 || a === 41 || a === 42 || a === 44 || a === 46 || a === 58 || a === 59 || a === 60 || a === 63 || a === 93 || a === 95 || a === 126 ? e.check(_o, n, o)(a) : a === null || me(a) || xn(a) ? n(a) : (e.consume(a), i);
  }
  function o(a) {
    return a === 41 && r++, e.consume(a), i;
  }
}
function mp(e, n, t) {
  return r;
  function r(s) {
    return s === 33 || s === 34 || s === 39 || s === 41 || s === 42 || s === 44 || s === 46 || s === 58 || s === 59 || s === 63 || s === 95 || s === 126 ? (e.consume(s), r) : s === 38 ? (e.consume(s), o) : s === 93 ? (e.consume(s), i) : (
      // `<` is an end.
      s === 60 || // So is whitespace.
      s === null || me(s) || xn(s) ? n(s) : t(s)
    );
  }
  function i(s) {
    return s === null || s === 40 || s === 91 || me(s) || xn(s) ? n(s) : r(s);
  }
  function o(s) {
    return Me(s) ? a(s) : t(s);
  }
  function a(s) {
    return s === 59 ? (e.consume(s), r) : Me(s) ? (e.consume(s), a) : t(s);
  }
}
function bp(e, n, t) {
  return r;
  function r(o) {
    return e.consume(o), i;
  }
  function i(o) {
    return Ce(o) ? t(o) : n(o);
  }
}
function xo(e) {
  return e === null || e === 40 || e === 42 || e === 95 || e === 91 || e === 93 || e === 126 || me(e);
}
function No(e) {
  return !Me(e);
}
function So(e) {
  return !(e === 47 || wr(e));
}
function wr(e) {
  return e === 43 || e === 45 || e === 46 || e === 95 || Ce(e);
}
function Vr(e) {
  let n = e.length, t = !1;
  for (; n--; ) {
    const r = e[n][1];
    if ((r.type === "labelLink" || r.type === "labelImage") && !r._balanced) {
      t = !0;
      break;
    }
    if (r._gfmAutolinkLiteralWalkedInto) {
      t = !1;
      break;
    }
  }
  return e.length > 0 && !t && (e[e.length - 1][1]._gfmAutolinkLiteralWalkedInto = !0), t;
}
const Ep = {
  tokenize: vp,
  partial: !0
};
function yp() {
  return {
    document: {
      91: {
        name: "gfmFootnoteDefinition",
        tokenize: xp,
        continuation: {
          tokenize: Np
        },
        exit: Sp
      }
    },
    text: {
      91: {
        name: "gfmFootnoteCall",
        tokenize: wp
      },
      93: {
        name: "gfmPotentialFootnoteCall",
        add: "after",
        tokenize: _p,
        resolveTo: kp
      }
    }
  };
}
function _p(e, n, t) {
  const r = this;
  let i = r.events.length;
  const o = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let a;
  for (; i--; ) {
    const l = r.events[i][1];
    if (l.type === "labelImage") {
      a = l;
      break;
    }
    if (l.type === "gfmFootnoteCall" || l.type === "labelLink" || l.type === "label" || l.type === "image" || l.type === "link")
      break;
  }
  return s;
  function s(l) {
    if (!a || !a._balanced)
      return t(l);
    const c = Ye(r.sliceSerialize({
      start: a.end,
      end: r.now()
    }));
    return c.codePointAt(0) !== 94 || !o.includes(c.slice(1)) ? t(l) : (e.enter("gfmFootnoteCallLabelMarker"), e.consume(l), e.exit("gfmFootnoteCallLabelMarker"), n(l));
  }
}
function kp(e, n) {
  let t = e.length;
  for (; t--; )
    if (e[t][1].type === "labelImage" && e[t][0] === "enter") {
      e[t][1];
      break;
    }
  e[t + 1][1].type = "data", e[t + 3][1].type = "gfmFootnoteCallLabelMarker";
  const r = {
    type: "gfmFootnoteCall",
    start: Object.assign({}, e[t + 3][1].start),
    end: Object.assign({}, e[e.length - 1][1].end)
  }, i = {
    type: "gfmFootnoteCallMarker",
    start: Object.assign({}, e[t + 3][1].end),
    end: Object.assign({}, e[t + 3][1].end)
  };
  i.end.column++, i.end.offset++, i.end._bufferIndex++;
  const o = {
    type: "gfmFootnoteCallString",
    start: Object.assign({}, i.end),
    end: Object.assign({}, e[e.length - 1][1].start)
  }, a = {
    type: "chunkString",
    contentType: "string",
    start: Object.assign({}, o.start),
    end: Object.assign({}, o.end)
  }, s = [
    // Take the `labelImageMarker` (now `data`, the `!`)
    e[t + 1],
    e[t + 2],
    ["enter", r, n],
    // The `[`
    e[t + 3],
    e[t + 4],
    // The `^`.
    ["enter", i, n],
    ["exit", i, n],
    // Everything in between.
    ["enter", o, n],
    ["enter", a, n],
    ["exit", a, n],
    ["exit", o, n],
    // The ending (`]`, properly parsed and labelled).
    e[e.length - 2],
    e[e.length - 1],
    ["exit", r, n]
  ];
  return e.splice(t, e.length - t + 1, ...s), e;
}
function wp(e, n, t) {
  const r = this, i = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let o = 0, a;
  return s;
  function s(u) {
    return e.enter("gfmFootnoteCall"), e.enter("gfmFootnoteCallLabelMarker"), e.consume(u), e.exit("gfmFootnoteCallLabelMarker"), l;
  }
  function l(u) {
    return u !== 94 ? t(u) : (e.enter("gfmFootnoteCallMarker"), e.consume(u), e.exit("gfmFootnoteCallMarker"), e.enter("gfmFootnoteCallString"), e.enter("chunkString").contentType = "string", c);
  }
  function c(u) {
    if (
      // Too long.
      o > 999 || // Closing brace with nothing.
      u === 93 && !a || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      u === null || u === 91 || me(u)
    )
      return t(u);
    if (u === 93) {
      e.exit("chunkString");
      const p = e.exit("gfmFootnoteCallString");
      return i.includes(Ye(r.sliceSerialize(p))) ? (e.enter("gfmFootnoteCallLabelMarker"), e.consume(u), e.exit("gfmFootnoteCallLabelMarker"), e.exit("gfmFootnoteCall"), n) : t(u);
    }
    return me(u) || (a = !0), o++, e.consume(u), u === 92 ? d : c;
  }
  function d(u) {
    return u === 91 || u === 92 || u === 93 ? (e.consume(u), o++, c) : c(u);
  }
}
function xp(e, n, t) {
  const r = this, i = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let o, a = 0, s;
  return l;
  function l(g) {
    return e.enter("gfmFootnoteDefinition")._container = !0, e.enter("gfmFootnoteDefinitionLabel"), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(g), e.exit("gfmFootnoteDefinitionLabelMarker"), c;
  }
  function c(g) {
    return g === 94 ? (e.enter("gfmFootnoteDefinitionMarker"), e.consume(g), e.exit("gfmFootnoteDefinitionMarker"), e.enter("gfmFootnoteDefinitionLabelString"), e.enter("chunkString").contentType = "string", d) : t(g);
  }
  function d(g) {
    if (
      // Too long.
      a > 999 || // Closing brace with nothing.
      g === 93 && !s || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      g === null || g === 91 || me(g)
    )
      return t(g);
    if (g === 93) {
      e.exit("chunkString");
      const E = e.exit("gfmFootnoteDefinitionLabelString");
      return o = Ye(r.sliceSerialize(E)), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(g), e.exit("gfmFootnoteDefinitionLabelMarker"), e.exit("gfmFootnoteDefinitionLabel"), p;
    }
    return me(g) || (s = !0), a++, e.consume(g), g === 92 ? u : d;
  }
  function u(g) {
    return g === 91 || g === 92 || g === 93 ? (e.consume(g), a++, d) : d(g);
  }
  function p(g) {
    return g === 58 ? (e.enter("definitionMarker"), e.consume(g), e.exit("definitionMarker"), i.includes(o) || i.push(o), se(e, f, "gfmFootnoteDefinitionWhitespace")) : t(g);
  }
  function f(g) {
    return n(g);
  }
}
function Np(e, n, t) {
  return e.check(tt, n, e.attempt(Ep, n, t));
}
function Sp(e) {
  e.exit("gfmFootnoteDefinition");
}
function vp(e, n, t) {
  const r = this;
  return se(e, i, "gfmFootnoteDefinitionIndent", 5);
  function i(o) {
    const a = r.events[r.events.length - 1];
    return a && a[1].type === "gfmFootnoteDefinitionIndent" && a[2].sliceSerialize(a[1], !0).length === 4 ? n(o) : t(o);
  }
}
function Tp(e) {
  let t = (e || {}).singleTilde;
  const r = {
    name: "strikethrough",
    tokenize: o,
    resolveAll: i
  };
  return t == null && (t = !0), {
    text: {
      126: r
    },
    insideSpan: {
      null: [r]
    },
    attentionMarkers: {
      null: [126]
    }
  };
  function i(a, s) {
    let l = -1;
    for (; ++l < a.length; )
      if (a[l][0] === "enter" && a[l][1].type === "strikethroughSequenceTemporary" && a[l][1]._close) {
        let c = l;
        for (; c--; )
          if (a[c][0] === "exit" && a[c][1].type === "strikethroughSequenceTemporary" && a[c][1]._open && // If the sizes are the same:
          a[l][1].end.offset - a[l][1].start.offset === a[c][1].end.offset - a[c][1].start.offset) {
            a[l][1].type = "strikethroughSequence", a[c][1].type = "strikethroughSequence";
            const d = {
              type: "strikethrough",
              start: Object.assign({}, a[c][1].start),
              end: Object.assign({}, a[l][1].end)
            }, u = {
              type: "strikethroughText",
              start: Object.assign({}, a[c][1].end),
              end: Object.assign({}, a[l][1].start)
            }, p = [["enter", d, s], ["enter", a[c][1], s], ["exit", a[c][1], s], ["enter", u, s]], f = s.parser.constructs.insideSpan.null;
            f && He(p, p.length, 0, Rt(f, a.slice(c + 1, l), s)), He(p, p.length, 0, [["exit", u, s], ["enter", a[l][1], s], ["exit", a[l][1], s], ["exit", d, s]]), He(a, c - 1, l - c + 3, p), l = c + p.length - 2;
            break;
          }
      }
    for (l = -1; ++l < a.length; )
      a[l][1].type === "strikethroughSequenceTemporary" && (a[l][1].type = "data");
    return a;
  }
  function o(a, s, l) {
    const c = this.previous, d = this.events;
    let u = 0;
    return p;
    function p(g) {
      return c === 126 && d[d.length - 1][1].type !== "characterEscape" ? l(g) : (a.enter("strikethroughSequenceTemporary"), f(g));
    }
    function f(g) {
      const E = Dn(c);
      if (g === 126)
        return u > 1 ? l(g) : (a.consume(g), u++, f);
      if (u < 2 && !t) return l(g);
      const _ = a.exit("strikethroughSequenceTemporary"), h = Dn(g);
      return _._open = !h || h === 2 && !!E, _._close = !E || E === 2 && !!h, s(g);
    }
  }
}
class Cp {
  /**
   * Create a new edit map.
   */
  constructor() {
    this.map = [];
  }
  /**
   * Create an edit: a remove and/or add at a certain place.
   *
   * @param {number} index
   * @param {number} remove
   * @param {Array<Event>} add
   * @returns {undefined}
   */
  add(n, t, r) {
    Ap(this, n, t, r);
  }
  // To do: add this when moving to `micromark`.
  // /**
  //  * Create an edit: but insert `add` before existing additions.
  //  *
  //  * @param {number} index
  //  * @param {number} remove
  //  * @param {Array<Event>} add
  //  * @returns {undefined}
  //  */
  // addBefore(index, remove, add) {
  //   addImplementation(this, index, remove, add, true)
  // }
  /**
   * Done, change the events.
   *
   * @param {Array<Event>} events
   * @returns {undefined}
   */
  consume(n) {
    if (this.map.sort(function(o, a) {
      return o[0] - a[0];
    }), this.map.length === 0)
      return;
    let t = this.map.length;
    const r = [];
    for (; t > 0; )
      t -= 1, r.push(n.slice(this.map[t][0] + this.map[t][1]), this.map[t][2]), n.length = this.map[t][0];
    r.push(n.slice()), n.length = 0;
    let i = r.pop();
    for (; i; ) {
      for (const o of i)
        n.push(o);
      i = r.pop();
    }
    this.map.length = 0;
  }
}
function Ap(e, n, t, r) {
  let i = 0;
  if (!(t === 0 && r.length === 0)) {
    for (; i < e.map.length; ) {
      if (e.map[i][0] === n) {
        e.map[i][1] += t, e.map[i][2].push(...r);
        return;
      }
      i += 1;
    }
    e.map.push([n, t, r]);
  }
}
function Ip(e, n) {
  let t = !1;
  const r = [];
  for (; n < e.length; ) {
    const i = e[n];
    if (t) {
      if (i[0] === "enter")
        i[1].type === "tableContent" && r.push(e[n + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
      else if (i[1].type === "tableContent") {
        if (e[n - 1][1].type === "tableDelimiterMarker") {
          const o = r.length - 1;
          r[o] = r[o] === "left" ? "center" : "right";
        }
      } else if (i[1].type === "tableDelimiterRow")
        break;
    } else i[0] === "enter" && i[1].type === "tableDelimiterRow" && (t = !0);
    n += 1;
  }
  return r;
}
function Op() {
  return {
    flow: {
      null: {
        name: "table",
        tokenize: Rp,
        resolveAll: Mp
      }
    }
  };
}
function Rp(e, n, t) {
  const r = this;
  let i = 0, o = 0, a;
  return s;
  function s(x) {
    let D = r.events.length - 1;
    for (; D > -1; ) {
      const z = r.events[D][1].type;
      if (z === "lineEnding" || // Note: markdown-rs uses `whitespace` instead of `linePrefix`
      z === "linePrefix") D--;
      else break;
    }
    const $ = D > -1 ? r.events[D][1].type : null, ne = $ === "tableHead" || $ === "tableRow" ? w : l;
    return ne === w && r.parser.lazy[r.now().line] ? t(x) : ne(x);
  }
  function l(x) {
    return e.enter("tableHead"), e.enter("tableRow"), c(x);
  }
  function c(x) {
    return x === 124 || (a = !0, o += 1), d(x);
  }
  function d(x) {
    return x === null ? t(x) : Y(x) ? o > 1 ? (o = 0, r.interrupt = !0, e.exit("tableRow"), e.enter("lineEnding"), e.consume(x), e.exit("lineEnding"), f) : t(x) : ae(x) ? se(e, d, "whitespace")(x) : (o += 1, a && (a = !1, i += 1), x === 124 ? (e.enter("tableCellDivider"), e.consume(x), e.exit("tableCellDivider"), a = !0, d) : (e.enter("data"), u(x)));
  }
  function u(x) {
    return x === null || x === 124 || me(x) ? (e.exit("data"), d(x)) : (e.consume(x), x === 92 ? p : u);
  }
  function p(x) {
    return x === 92 || x === 124 ? (e.consume(x), u) : u(x);
  }
  function f(x) {
    return r.interrupt = !1, r.parser.lazy[r.now().line] ? t(x) : (e.enter("tableDelimiterRow"), a = !1, ae(x) ? se(e, g, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(x) : g(x));
  }
  function g(x) {
    return x === 45 || x === 58 ? _(x) : x === 124 ? (a = !0, e.enter("tableCellDivider"), e.consume(x), e.exit("tableCellDivider"), E) : I(x);
  }
  function E(x) {
    return ae(x) ? se(e, _, "whitespace")(x) : _(x);
  }
  function _(x) {
    return x === 58 ? (o += 1, a = !0, e.enter("tableDelimiterMarker"), e.consume(x), e.exit("tableDelimiterMarker"), h) : x === 45 ? (o += 1, h(x)) : x === null || Y(x) ? v(x) : I(x);
  }
  function h(x) {
    return x === 45 ? (e.enter("tableDelimiterFiller"), N(x)) : I(x);
  }
  function N(x) {
    return x === 45 ? (e.consume(x), N) : x === 58 ? (a = !0, e.exit("tableDelimiterFiller"), e.enter("tableDelimiterMarker"), e.consume(x), e.exit("tableDelimiterMarker"), k) : (e.exit("tableDelimiterFiller"), k(x));
  }
  function k(x) {
    return ae(x) ? se(e, v, "whitespace")(x) : v(x);
  }
  function v(x) {
    return x === 124 ? g(x) : x === null || Y(x) ? !a || i !== o ? I(x) : (e.exit("tableDelimiterRow"), e.exit("tableHead"), n(x)) : I(x);
  }
  function I(x) {
    return t(x);
  }
  function w(x) {
    return e.enter("tableRow"), P(x);
  }
  function P(x) {
    return x === 124 ? (e.enter("tableCellDivider"), e.consume(x), e.exit("tableCellDivider"), P) : x === null || Y(x) ? (e.exit("tableRow"), n(x)) : ae(x) ? se(e, P, "whitespace")(x) : (e.enter("data"), C(x));
  }
  function C(x) {
    return x === null || x === 124 || me(x) ? (e.exit("data"), P(x)) : (e.consume(x), x === 92 ? B : C);
  }
  function B(x) {
    return x === 92 || x === 124 ? (e.consume(x), C) : C(x);
  }
}
function Mp(e, n) {
  let t = -1, r = !0, i = 0, o = [0, 0, 0, 0], a = [0, 0, 0, 0], s = !1, l = 0, c, d, u;
  const p = new Cp();
  for (; ++t < e.length; ) {
    const f = e[t], g = f[1];
    f[0] === "enter" ? g.type === "tableHead" ? (s = !1, l !== 0 && (Zi(p, n, l, c, d), d = void 0, l = 0), c = {
      type: "table",
      start: Object.assign({}, g.start),
      // Note: correct end is set later.
      end: Object.assign({}, g.end)
    }, p.add(t, 0, [["enter", c, n]])) : g.type === "tableRow" || g.type === "tableDelimiterRow" ? (r = !0, u = void 0, o = [0, 0, 0, 0], a = [0, t + 1, 0, 0], s && (s = !1, d = {
      type: "tableBody",
      start: Object.assign({}, g.start),
      // Note: correct end is set later.
      end: Object.assign({}, g.end)
    }, p.add(t, 0, [["enter", d, n]])), i = g.type === "tableDelimiterRow" ? 2 : d ? 3 : 1) : i && (g.type === "data" || g.type === "tableDelimiterMarker" || g.type === "tableDelimiterFiller") ? (r = !1, a[2] === 0 && (o[1] !== 0 && (a[0] = a[1], u = ht(p, n, o, i, void 0, u), o = [0, 0, 0, 0]), a[2] = t)) : g.type === "tableCellDivider" && (r ? r = !1 : (o[1] !== 0 && (a[0] = a[1], u = ht(p, n, o, i, void 0, u)), o = a, a = [o[1], t, 0, 0])) : g.type === "tableHead" ? (s = !0, l = t) : g.type === "tableRow" || g.type === "tableDelimiterRow" ? (l = t, o[1] !== 0 ? (a[0] = a[1], u = ht(p, n, o, i, t, u)) : a[1] !== 0 && (u = ht(p, n, a, i, t, u)), i = 0) : i && (g.type === "data" || g.type === "tableDelimiterMarker" || g.type === "tableDelimiterFiller") && (a[3] = t);
  }
  for (l !== 0 && Zi(p, n, l, c, d), p.consume(n.events), t = -1; ++t < n.events.length; ) {
    const f = n.events[t];
    f[0] === "enter" && f[1].type === "table" && (f[1]._align = Ip(n.events, t));
  }
  return e;
}
function ht(e, n, t, r, i, o) {
  const a = r === 1 ? "tableHeader" : r === 2 ? "tableDelimiter" : "tableData", s = "tableContent";
  t[0] !== 0 && (o.end = Object.assign({}, On(n.events, t[0])), e.add(t[0], 0, [["exit", o, n]]));
  const l = On(n.events, t[1]);
  if (o = {
    type: a,
    start: Object.assign({}, l),
    // Note: correct end is set later.
    end: Object.assign({}, l)
  }, e.add(t[1], 0, [["enter", o, n]]), t[2] !== 0) {
    const c = On(n.events, t[2]), d = On(n.events, t[3]), u = {
      type: s,
      start: Object.assign({}, c),
      end: Object.assign({}, d)
    };
    if (e.add(t[2], 0, [["enter", u, n]]), r !== 2) {
      const p = n.events[t[2]], f = n.events[t[3]];
      if (p[1].end = Object.assign({}, f[1].end), p[1].type = "chunkText", p[1].contentType = "text", t[3] > t[2] + 1) {
        const g = t[2] + 1, E = t[3] - t[2] - 1;
        e.add(g, E, []);
      }
    }
    e.add(t[3] + 1, 0, [["exit", u, n]]);
  }
  return i !== void 0 && (o.end = Object.assign({}, On(n.events, i)), e.add(i, 0, [["exit", o, n]]), o = void 0), o;
}
function Zi(e, n, t, r, i) {
  const o = [], a = On(n.events, t);
  i && (i.end = Object.assign({}, a), o.push(["exit", i, n])), r.end = Object.assign({}, a), o.push(["exit", r, n]), e.add(t + 1, 0, o);
}
function On(e, n) {
  const t = e[n], r = t[0] === "enter" ? "start" : "end";
  return t[1][r];
}
const Lp = {
  name: "tasklistCheck",
  tokenize: Pp
};
function Dp() {
  return {
    text: {
      91: Lp
    }
  };
}
function Pp(e, n, t) {
  const r = this;
  return i;
  function i(l) {
    return (
      // Exit if there’s stuff before.
      r.previous !== null || // Exit if not in the first content that is the first child of a list
      // item.
      !r._gfmTasklistFirstContentOfListItem ? t(l) : (e.enter("taskListCheck"), e.enter("taskListCheckMarker"), e.consume(l), e.exit("taskListCheckMarker"), o)
    );
  }
  function o(l) {
    return me(l) ? (e.enter("taskListCheckValueUnchecked"), e.consume(l), e.exit("taskListCheckValueUnchecked"), a) : l === 88 || l === 120 ? (e.enter("taskListCheckValueChecked"), e.consume(l), e.exit("taskListCheckValueChecked"), a) : t(l);
  }
  function a(l) {
    return l === 93 ? (e.enter("taskListCheckMarker"), e.consume(l), e.exit("taskListCheckMarker"), e.exit("taskListCheck"), s) : t(l);
  }
  function s(l) {
    return Y(l) ? n(l) : ae(l) ? e.check({
      tokenize: Bp
    }, n, t)(l) : t(l);
  }
}
function Bp(e, n, t) {
  return se(e, r, "whitespace");
  function r(i) {
    return i === null ? t(i) : n(i);
  }
}
function Fp(e) {
  return La([
    cp(),
    yp(),
    Tp(e),
    Op(),
    Dp()
  ]);
}
const zp = {};
function vo(e) {
  const n = (
    /** @type {Processor<Root>} */
    this
  ), t = e || zp, r = n.data(), i = r.micromarkExtensions || (r.micromarkExtensions = []), o = r.fromMarkdownExtensions || (r.fromMarkdownExtensions = []), a = r.toMarkdownExtensions || (r.toMarkdownExtensions = []);
  i.push(Fp(t)), o.push(ap()), a.push(op(t));
}
const Xi = (
  // Note: overloads like this are needed to support optional generics.
  /**
   * @type {(
   *   (<Kind extends UnistParent, Check extends Test>(parent: Kind, index: Child<Kind> | number, test: Check) => Matches<Child<Kind>, Check> | undefined) &
   *   (<Kind extends UnistParent>(parent: Kind, index: Child<Kind> | number, test?: null | undefined) => Child<Kind> | undefined)
   * )}
   */
  /**
   * @param {UnistParent} parent
   * @param {UnistNode | number} index
   * @param {Test} [test]
   * @returns {UnistNode | undefined}
   */
  (function(e, n, t) {
    const r = rt(t);
    if (!e || !e.type || !e.children)
      throw new Error("Expected parent node");
    if (typeof n == "number") {
      if (n < 0 || n === Number.POSITIVE_INFINITY)
        throw new Error("Expected positive finite number as index");
    } else if (n = e.children.indexOf(n), n < 0)
      throw new Error("Expected child node or index");
    for (; ++n < e.children.length; )
      if (r(e.children[n], n, e))
        return e.children[n];
  })
), Sn = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends TestFunction>(test: Condition) => (element: unknown, index?: number | null | undefined, parent?: Parents | null | undefined, context?: unknown) => element is Element & Predicate<Condition, Element>) &
   *   (<Condition extends string>(test: Condition) => (element: unknown, index?: number | null | undefined, parent?: Parents | null | undefined, context?: unknown) => element is Element & {tagName: Condition}) &
   *   ((test?: null | undefined) => (element?: unknown, index?: number | null | undefined, parent?: Parents | null | undefined, context?: unknown) => element is Element) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test | null | undefined} [test]
   * @returns {Check}
   */
  (function(e) {
    if (e == null)
      return Hp;
    if (typeof e == "string")
      return $p(e);
    if (typeof e == "object")
      return Up(e);
    if (typeof e == "function")
      return Yr(e);
    throw new Error("Expected function, string, or array as `test`");
  })
);
function Up(e) {
  const n = [];
  let t = -1;
  for (; ++t < e.length; )
    n[t] = Sn(e[t]);
  return Yr(r);
  function r(...i) {
    let o = -1;
    for (; ++o < n.length; )
      if (n[o].apply(this, i)) return !0;
    return !1;
  }
}
function $p(e) {
  return Yr(n);
  function n(t) {
    return t.tagName === e;
  }
}
function Yr(e) {
  return n;
  function n(t, r, i) {
    return !!(Gp(t) && e.call(
      this,
      t,
      typeof r == "number" ? r : void 0,
      i || void 0
    ));
  }
}
function Hp(e) {
  return !!(e && typeof e == "object" && "type" in e && e.type === "element" && "tagName" in e && typeof e.tagName == "string");
}
function Gp(e) {
  return e !== null && typeof e == "object" && "type" in e && "tagName" in e;
}
const Qi = /\n/g, Ji = /[\t ]+/g, xr = Sn("br"), ji = Sn(Qp), qp = Sn("p"), ea = Sn("tr"), Kp = Sn([
  // List from: <https://html.spec.whatwg.org/multipage/rendering.html#hidden-elements>
  "datalist",
  "head",
  "noembed",
  "noframes",
  "noscript",
  // Act as if we support scripting.
  "rp",
  "script",
  "style",
  "template",
  "title",
  // Hidden attribute.
  Xp,
  // From: <https://html.spec.whatwg.org/multipage/rendering.html#flow-content-3>
  Jp
]), To = Sn([
  "address",
  // Flow content
  "article",
  // Sections and headings
  "aside",
  // Sections and headings
  "blockquote",
  // Flow content
  "body",
  // Page
  "caption",
  // `table-caption`
  "center",
  // Flow content (legacy)
  "dd",
  // Lists
  "dialog",
  // Flow content
  "dir",
  // Lists (legacy)
  "dl",
  // Lists
  "dt",
  // Lists
  "div",
  // Flow content
  "figure",
  // Flow content
  "figcaption",
  // Flow content
  "footer",
  // Flow content
  "form,",
  // Flow content
  "h1",
  // Sections and headings
  "h2",
  // Sections and headings
  "h3",
  // Sections and headings
  "h4",
  // Sections and headings
  "h5",
  // Sections and headings
  "h6",
  // Sections and headings
  "header",
  // Flow content
  "hgroup",
  // Sections and headings
  "hr",
  // Flow content
  "html",
  // Page
  "legend",
  // Flow content
  "li",
  // Lists (as `display: list-item`)
  "listing",
  // Flow content (legacy)
  "main",
  // Flow content
  "menu",
  // Lists
  "nav",
  // Sections and headings
  "ol",
  // Lists
  "p",
  // Flow content
  "plaintext",
  // Flow content (legacy)
  "pre",
  // Flow content
  "section",
  // Sections and headings
  "ul",
  // Lists
  "xmp"
  // Flow content (legacy)
]);
function Wp(e, n) {
  const t = n || {}, r = "children" in e ? e.children : [], i = To(e), o = Io(e, {
    whitespace: t.whitespace || "normal"
  }), a = [];
  (e.type === "text" || e.type === "comment") && a.push(
    ...Ao(e, {
      breakBefore: !0,
      breakAfter: !0
    })
  );
  let s = -1;
  for (; ++s < r.length; )
    a.push(
      ...Co(
        r[s],
        // @ts-expect-error: `tree` is a parent if we’re here.
        e,
        {
          whitespace: o,
          breakBefore: s ? void 0 : i,
          breakAfter: s < r.length - 1 ? xr(r[s + 1]) : i
        }
      )
    );
  const l = [];
  let c;
  for (s = -1; ++s < a.length; ) {
    const d = a[s];
    typeof d == "number" ? c !== void 0 && d > c && (c = d) : d && (c !== void 0 && c > -1 && l.push(`
`.repeat(c) || " "), c = -1, l.push(d));
  }
  return l.join("");
}
function Co(e, n, t) {
  return e.type === "element" ? Vp(e, n, t) : e.type === "text" ? t.whitespace === "normal" ? Ao(e, t) : Yp(e) : [];
}
function Vp(e, n, t) {
  const r = Io(e, t), i = e.children || [];
  let o = -1, a = [];
  if (Kp(e))
    return a;
  let s, l;
  for (xr(e) || ea(e) && // @ts-expect-error: something up with types of parents.
  Xi(n, e, ea) ? l = `
` : qp(e) ? (s = 2, l = 2) : To(e) && (s = 1, l = 1); ++o < i.length; )
    a = a.concat(
      Co(i[o], e, {
        whitespace: r,
        breakBefore: o ? void 0 : s,
        breakAfter: o < i.length - 1 ? xr(i[o + 1]) : l
      })
    );
  return ji(e) && // @ts-expect-error: something up with types of parents.
  Xi(n, e, ji) && a.push("	"), s && a.unshift(s), l && a.push(l), a;
}
function Ao(e, n) {
  const t = String(e.value), r = [], i = [];
  let o = 0;
  for (; o <= t.length; ) {
    Qi.lastIndex = o;
    const l = Qi.exec(t), c = l && "index" in l ? l.index : t.length;
    r.push(
      // Any sequence of collapsible spaces and tabs immediately preceding or
      // following a segment break is removed.
      Zp(
        // […] ignoring bidi formatting characters (characters with the
        // Bidi_Control property [UAX9]: ALM, LTR, RTL, LRE-RLO, LRI-PDI) as if
        // they were not there.
        t.slice(o, c).replace(/[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, ""),
        o === 0 ? n.breakBefore : !0,
        c === t.length ? n.breakAfter : !0
      )
    ), o = c + 1;
  }
  let a = -1, s;
  for (; ++a < r.length; )
    r[a].charCodeAt(r[a].length - 1) === 8203 || a < r.length - 1 && r[a + 1].charCodeAt(0) === 8203 ? (i.push(r[a]), s = void 0) : r[a] ? (typeof s == "number" && i.push(s), i.push(r[a]), s = 0) : (a === 0 || a === r.length - 1) && i.push(0);
  return i;
}
function Yp(e) {
  return [String(e.value)];
}
function Zp(e, n, t) {
  const r = [];
  let i = 0, o;
  for (; i < e.length; ) {
    Ji.lastIndex = i;
    const a = Ji.exec(e);
    o = a ? a.index : e.length, !i && !o && a && !n && r.push(""), i !== o && r.push(e.slice(i, o)), i = a ? o + a[0].length : o;
  }
  return i !== o && !t && r.push(""), r.join(" ");
}
function Io(e, n) {
  if (e.type === "element") {
    const t = e.properties || {};
    switch (e.tagName) {
      case "listing":
      case "plaintext":
      case "xmp":
        return "pre";
      case "nobr":
        return "nowrap";
      case "pre":
        return t.wrap ? "pre-wrap" : "pre";
      case "td":
      case "th":
        return t.noWrap ? "nowrap" : n.whitespace;
      case "textarea":
        return "pre-wrap";
    }
  }
  return n.whitespace;
}
function Xp(e) {
  return !!(e.properties || {}).hidden;
}
function Qp(e) {
  return e.tagName === "td" || e.tagName === "th";
}
function Jp(e) {
  return e.tagName === "dialog" && !(e.properties || {}).open;
}
function jp(e) {
  const n = e.regex, t = e.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] }), r = "decltype\\(auto\\)", i = "[a-zA-Z_]\\w*::", a = "(?!struct)(" + r + "|" + n.optional(i) + "[a-zA-Z_]\\w*" + n.optional("<[^<>]+>") + ")", s = {
    className: "type",
    begin: "\\b[a-z\\d_]*_t\\b"
  }, c = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [e.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)" + "|.)",
        end: "'",
        illegal: "."
      },
      e.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  }, d = {
    className: "number",
    variants: [
      // Floating-point literal.
      {
        begin: "[+-]?(?:(?:[0-9](?:'?[0-9])*\\.(?:[0-9](?:'?[0-9])*)?|\\.[0-9](?:'?[0-9])*)(?:[Ee][+-]?[0-9](?:'?[0-9])*)?|[0-9](?:'?[0-9])*[Ee][+-]?[0-9](?:'?[0-9])*|0[Xx](?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*(?:\\.(?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)?)?|\\.[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)[Pp][+-]?[0-9](?:'?[0-9])*)(?:[Ff](?:16|32|64|128)?|(BF|bf)16|[Ll]|)"
      },
      // Integer literal.
      {
        begin: "[+-]?\\b(?:0[Bb][01](?:'?[01])*|0[Xx][0-9A-Fa-f](?:'?[0-9A-Fa-f])*|0(?:'?[0-7])*|[1-9](?:'?[0-9])*)(?:[Uu](?:LL?|ll?)|[Uu][Zz]?|(?:LL?|ll?)[Uu]?|[Zz][Uu]|)"
        // Note: there are user-defined literal suffixes too, but perhaps having the custom suffix not part of the
        // literal highlight actually makes it stand out more.
      }
    ],
    relevance: 0
  }, u = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      e.inherit(c, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      t,
      e.C_BLOCK_COMMENT_MODE
    ]
  }, p = {
    className: "title",
    begin: n.optional(i) + e.IDENT_RE,
    relevance: 0
  }, f = n.optional(i) + e.IDENT_RE + "\\s*\\(", g = [
    "alignas",
    "alignof",
    "and",
    "and_eq",
    "asm",
    "atomic_cancel",
    "atomic_commit",
    "atomic_noexcept",
    "auto",
    "bitand",
    "bitor",
    "break",
    "case",
    "catch",
    "class",
    "co_await",
    "co_return",
    "co_yield",
    "compl",
    "concept",
    "const_cast|10",
    "consteval",
    "constexpr",
    "constinit",
    "continue",
    "decltype",
    "default",
    "delete",
    "do",
    "dynamic_cast|10",
    "else",
    "enum",
    "explicit",
    "export",
    "extern",
    "false",
    "final",
    "for",
    "friend",
    "goto",
    "if",
    "import",
    "inline",
    "module",
    "mutable",
    "namespace",
    "new",
    "noexcept",
    "not",
    "not_eq",
    "nullptr",
    "operator",
    "or",
    "or_eq",
    "override",
    "private",
    "protected",
    "public",
    "reflexpr",
    "register",
    "reinterpret_cast|10",
    "requires",
    "return",
    "sizeof",
    "static_assert",
    "static_cast|10",
    "struct",
    "switch",
    "synchronized",
    "template",
    "this",
    "thread_local",
    "throw",
    "transaction_safe",
    "transaction_safe_dynamic",
    "true",
    "try",
    "typedef",
    "typeid",
    "typename",
    "union",
    "using",
    "virtual",
    "volatile",
    "while",
    "xor",
    "xor_eq"
  ], E = [
    "bool",
    "char",
    "char16_t",
    "char32_t",
    "char8_t",
    "double",
    "float",
    "int",
    "long",
    "short",
    "void",
    "wchar_t",
    "unsigned",
    "signed",
    "const",
    "static"
  ], _ = [
    "any",
    "auto_ptr",
    "barrier",
    "binary_semaphore",
    "bitset",
    "complex",
    "condition_variable",
    "condition_variable_any",
    "counting_semaphore",
    "deque",
    "false_type",
    "flat_map",
    "flat_set",
    "future",
    "imaginary",
    "initializer_list",
    "istringstream",
    "jthread",
    "latch",
    "lock_guard",
    "multimap",
    "multiset",
    "mutex",
    "optional",
    "ostringstream",
    "packaged_task",
    "pair",
    "promise",
    "priority_queue",
    "queue",
    "recursive_mutex",
    "recursive_timed_mutex",
    "scoped_lock",
    "set",
    "shared_future",
    "shared_lock",
    "shared_mutex",
    "shared_timed_mutex",
    "shared_ptr",
    "stack",
    "string_view",
    "stringstream",
    "timed_mutex",
    "thread",
    "true_type",
    "tuple",
    "unique_lock",
    "unique_ptr",
    "unordered_map",
    "unordered_multimap",
    "unordered_multiset",
    "unordered_set",
    "variant",
    "vector",
    "weak_ptr",
    "wstring",
    "wstring_view"
  ], h = [
    "abort",
    "abs",
    "acos",
    "apply",
    "as_const",
    "asin",
    "atan",
    "atan2",
    "calloc",
    "ceil",
    "cerr",
    "cin",
    "clog",
    "cos",
    "cosh",
    "cout",
    "declval",
    "endl",
    "exchange",
    "exit",
    "exp",
    "fabs",
    "floor",
    "fmod",
    "forward",
    "fprintf",
    "fputs",
    "free",
    "frexp",
    "fscanf",
    "future",
    "invoke",
    "isalnum",
    "isalpha",
    "iscntrl",
    "isdigit",
    "isgraph",
    "islower",
    "isprint",
    "ispunct",
    "isspace",
    "isupper",
    "isxdigit",
    "labs",
    "launder",
    "ldexp",
    "log",
    "log10",
    "make_pair",
    "make_shared",
    "make_shared_for_overwrite",
    "make_tuple",
    "make_unique",
    "malloc",
    "memchr",
    "memcmp",
    "memcpy",
    "memset",
    "modf",
    "move",
    "pow",
    "printf",
    "putchar",
    "puts",
    "realloc",
    "scanf",
    "sin",
    "sinh",
    "snprintf",
    "sprintf",
    "sqrt",
    "sscanf",
    "std",
    "stderr",
    "stdin",
    "stdout",
    "strcat",
    "strchr",
    "strcmp",
    "strcpy",
    "strcspn",
    "strlen",
    "strncat",
    "strncmp",
    "strncpy",
    "strpbrk",
    "strrchr",
    "strspn",
    "strstr",
    "swap",
    "tan",
    "tanh",
    "terminate",
    "to_underlying",
    "tolower",
    "toupper",
    "vfprintf",
    "visit",
    "vprintf",
    "vsprintf"
  ], v = {
    type: E,
    keyword: g,
    literal: [
      "NULL",
      "false",
      "nullopt",
      "nullptr",
      "true"
    ],
    built_in: ["_Pragma"],
    _type_hints: _
  }, I = {
    className: "function.dispatch",
    relevance: 0,
    keywords: {
      // Only for relevance, not highlighting.
      _hint: h
    },
    begin: n.concat(
      /\b/,
      /(?!decltype)/,
      /(?!if)/,
      /(?!for)/,
      /(?!switch)/,
      /(?!while)/,
      e.IDENT_RE,
      n.lookahead(/(<[^<>]+>|)\s*\(/)
    )
  }, w = [
    I,
    u,
    s,
    t,
    e.C_BLOCK_COMMENT_MODE,
    d,
    c
  ], P = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: v,
    contains: w.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: v,
        contains: w.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  }, C = {
    className: "function",
    begin: "(" + a + "[\\*&\\s]+)+" + f,
    returnBegin: !0,
    end: /[{;=]/,
    excludeEnd: !0,
    keywords: v,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: r,
        keywords: v,
        relevance: 0
      },
      {
        begin: f,
        returnBegin: !0,
        contains: [p],
        relevance: 0
      },
      // needed because we do not have look-behind on the below rule
      // to prevent it from grabbing the final : in a :: pair
      {
        begin: /::/,
        relevance: 0
      },
      // initializers
      {
        begin: /:/,
        endsWithParent: !0,
        contains: [
          c,
          d
        ]
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: v,
        relevance: 0,
        contains: [
          t,
          e.C_BLOCK_COMMENT_MODE,
          c,
          d,
          s,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: v,
            relevance: 0,
            contains: [
              "self",
              t,
              e.C_BLOCK_COMMENT_MODE,
              c,
              d,
              s
            ]
          }
        ]
      },
      s,
      t,
      e.C_BLOCK_COMMENT_MODE,
      u
    ]
  };
  return {
    name: "C++",
    aliases: [
      "cc",
      "c++",
      "h++",
      "hpp",
      "hh",
      "hxx",
      "cxx"
    ],
    keywords: v,
    illegal: "</",
    classNameAliases: { "function.dispatch": "built_in" },
    contains: [].concat(
      P,
      C,
      I,
      w,
      [
        u,
        {
          // containers: ie, `vector <int> rooms (9);`
          begin: "\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function|flat_map|flat_set)\\s*<(?!<)",
          end: ">",
          keywords: v,
          contains: [
            "self",
            s
          ]
        },
        {
          begin: e.IDENT_RE + "::",
          keywords: v
        },
        {
          match: [
            // extra complexity to deal with `enum class` and `enum struct`
            /\b(?:enum(?:\s+(?:class|struct))?|class|struct|union)/,
            /\s+/,
            /\w+/
          ],
          className: {
            1: "keyword",
            3: "title.class"
          }
        }
      ]
    )
  };
}
function eg(e) {
  const n = {
    type: [
      "boolean",
      "byte",
      "word",
      "String"
    ],
    built_in: [
      "KeyboardController",
      "MouseController",
      "SoftwareSerial",
      "EthernetServer",
      "EthernetClient",
      "LiquidCrystal",
      "RobotControl",
      "GSMVoiceCall",
      "EthernetUDP",
      "EsploraTFT",
      "HttpClient",
      "RobotMotor",
      "WiFiClient",
      "GSMScanner",
      "FileSystem",
      "Scheduler",
      "GSMServer",
      "YunClient",
      "YunServer",
      "IPAddress",
      "GSMClient",
      "GSMModem",
      "Keyboard",
      "Ethernet",
      "Console",
      "GSMBand",
      "Esplora",
      "Stepper",
      "Process",
      "WiFiUDP",
      "GSM_SMS",
      "Mailbox",
      "USBHost",
      "Firmata",
      "PImage",
      "Client",
      "Server",
      "GSMPIN",
      "FileIO",
      "Bridge",
      "Serial",
      "EEPROM",
      "Stream",
      "Mouse",
      "Audio",
      "Servo",
      "File",
      "Task",
      "GPRS",
      "WiFi",
      "Wire",
      "TFT",
      "GSM",
      "SPI",
      "SD"
    ],
    _hints: [
      "setup",
      "loop",
      "runShellCommandAsynchronously",
      "analogWriteResolution",
      "retrieveCallingNumber",
      "printFirmwareVersion",
      "analogReadResolution",
      "sendDigitalPortPair",
      "noListenOnLocalhost",
      "readJoystickButton",
      "setFirmwareVersion",
      "readJoystickSwitch",
      "scrollDisplayRight",
      "getVoiceCallStatus",
      "scrollDisplayLeft",
      "writeMicroseconds",
      "delayMicroseconds",
      "beginTransmission",
      "getSignalStrength",
      "runAsynchronously",
      "getAsynchronously",
      "listenOnLocalhost",
      "getCurrentCarrier",
      "readAccelerometer",
      "messageAvailable",
      "sendDigitalPorts",
      "lineFollowConfig",
      "countryNameWrite",
      "runShellCommand",
      "readStringUntil",
      "rewindDirectory",
      "readTemperature",
      "setClockDivider",
      "readLightSensor",
      "endTransmission",
      "analogReference",
      "detachInterrupt",
      "countryNameRead",
      "attachInterrupt",
      "encryptionType",
      "readBytesUntil",
      "robotNameWrite",
      "readMicrophone",
      "robotNameRead",
      "cityNameWrite",
      "userNameWrite",
      "readJoystickY",
      "readJoystickX",
      "mouseReleased",
      "openNextFile",
      "scanNetworks",
      "noInterrupts",
      "digitalWrite",
      "beginSpeaker",
      "mousePressed",
      "isActionDone",
      "mouseDragged",
      "displayLogos",
      "noAutoscroll",
      "addParameter",
      "remoteNumber",
      "getModifiers",
      "keyboardRead",
      "userNameRead",
      "waitContinue",
      "processInput",
      "parseCommand",
      "printVersion",
      "readNetworks",
      "writeMessage",
      "blinkVersion",
      "cityNameRead",
      "readMessage",
      "setDataMode",
      "parsePacket",
      "isListening",
      "setBitOrder",
      "beginPacket",
      "isDirectory",
      "motorsWrite",
      "drawCompass",
      "digitalRead",
      "clearScreen",
      "serialEvent",
      "rightToLeft",
      "setTextSize",
      "leftToRight",
      "requestFrom",
      "keyReleased",
      "compassRead",
      "analogWrite",
      "interrupts",
      "WiFiServer",
      "disconnect",
      "playMelody",
      "parseFloat",
      "autoscroll",
      "getPINUsed",
      "setPINUsed",
      "setTimeout",
      "sendAnalog",
      "readSlider",
      "analogRead",
      "beginWrite",
      "createChar",
      "motorsStop",
      "keyPressed",
      "tempoWrite",
      "readButton",
      "subnetMask",
      "debugPrint",
      "macAddress",
      "writeGreen",
      "randomSeed",
      "attachGPRS",
      "readString",
      "sendString",
      "remotePort",
      "releaseAll",
      "mouseMoved",
      "background",
      "getXChange",
      "getYChange",
      "answerCall",
      "getResult",
      "voiceCall",
      "endPacket",
      "constrain",
      "getSocket",
      "writeJSON",
      "getButton",
      "available",
      "connected",
      "findUntil",
      "readBytes",
      "exitValue",
      "readGreen",
      "writeBlue",
      "startLoop",
      "IPAddress",
      "isPressed",
      "sendSysex",
      "pauseMode",
      "gatewayIP",
      "setCursor",
      "getOemKey",
      "tuneWrite",
      "noDisplay",
      "loadImage",
      "switchPIN",
      "onRequest",
      "onReceive",
      "changePIN",
      "playFile",
      "noBuffer",
      "parseInt",
      "overflow",
      "checkPIN",
      "knobRead",
      "beginTFT",
      "bitClear",
      "updateIR",
      "bitWrite",
      "position",
      "writeRGB",
      "highByte",
      "writeRed",
      "setSpeed",
      "readBlue",
      "noStroke",
      "remoteIP",
      "transfer",
      "shutdown",
      "hangCall",
      "beginSMS",
      "endWrite",
      "attached",
      "maintain",
      "noCursor",
      "checkReg",
      "checkPUK",
      "shiftOut",
      "isValid",
      "shiftIn",
      "pulseIn",
      "connect",
      "println",
      "localIP",
      "pinMode",
      "getIMEI",
      "display",
      "noBlink",
      "process",
      "getBand",
      "running",
      "beginSD",
      "drawBMP",
      "lowByte",
      "setBand",
      "release",
      "bitRead",
      "prepare",
      "pointTo",
      "readRed",
      "setMode",
      "noFill",
      "remove",
      "listen",
      "stroke",
      "detach",
      "attach",
      "noTone",
      "exists",
      "buffer",
      "height",
      "bitSet",
      "circle",
      "config",
      "cursor",
      "random",
      "IRread",
      "setDNS",
      "endSMS",
      "getKey",
      "micros",
      "millis",
      "begin",
      "print",
      "write",
      "ready",
      "flush",
      "width",
      "isPIN",
      "blink",
      "clear",
      "press",
      "mkdir",
      "rmdir",
      "close",
      "point",
      "yield",
      "image",
      "BSSID",
      "click",
      "delay",
      "read",
      "text",
      "move",
      "peek",
      "beep",
      "rect",
      "line",
      "open",
      "seek",
      "fill",
      "size",
      "turn",
      "stop",
      "home",
      "find",
      "step",
      "tone",
      "sqrt",
      "RSSI",
      "SSID",
      "end",
      "bit",
      "tan",
      "cos",
      "sin",
      "pow",
      "map",
      "abs",
      "max",
      "min",
      "get",
      "run",
      "put"
    ],
    literal: [
      "DIGITAL_MESSAGE",
      "FIRMATA_STRING",
      "ANALOG_MESSAGE",
      "REPORT_DIGITAL",
      "REPORT_ANALOG",
      "INPUT_PULLUP",
      "SET_PIN_MODE",
      "INTERNAL2V56",
      "SYSTEM_RESET",
      "LED_BUILTIN",
      "INTERNAL1V1",
      "SYSEX_START",
      "INTERNAL",
      "EXTERNAL",
      "DEFAULT",
      "OUTPUT",
      "INPUT",
      "HIGH",
      "LOW"
    ]
  }, t = jp(e), r = (
    /** @type {Record<string,any>} */
    t.keywords
  );
  return r.type = [
    ...r.type,
    ...n.type
  ], r.literal = [
    ...r.literal,
    ...n.literal
  ], r.built_in = [
    ...r.built_in,
    ...n.built_in
  ], r._hints = n._hints, t.name = "Arduino", t.aliases = ["ino"], t.supersetOf = "cpp", t;
}
function ng(e) {
  const n = e.regex, t = {}, r = {
    begin: /\$\{/,
    end: /\}/,
    contains: [
      "self",
      {
        begin: /:-/,
        contains: [t]
      }
      // default values
    ]
  };
  Object.assign(t, {
    className: "variable",
    variants: [
      { begin: n.concat(
        /\$[\w\d#@][\w\d_]*/,
        // negative look-ahead tries to avoid matching patterns that are not
        // Perl at all like $ident$, @ident@, etc.
        "(?![\\w\\d])(?![$])"
      ) },
      r
    ]
  });
  const i = {
    className: "subst",
    begin: /\$\(/,
    end: /\)/,
    contains: [e.BACKSLASH_ESCAPE]
  }, o = e.inherit(
    e.COMMENT(),
    {
      match: [
        /(^|\s)/,
        /#.*$/
      ],
      scope: {
        2: "comment"
      }
    }
  ), a = {
    begin: /<<-?\s*(?=\w+)/,
    starts: { contains: [
      e.END_SAME_AS_BEGIN({
        begin: /(\w+)/,
        end: /(\w+)/,
        className: "string"
      })
    ] }
  }, s = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      e.BACKSLASH_ESCAPE,
      t,
      i
    ]
  };
  i.contains.push(s);
  const l = {
    match: /\\"/
  }, c = {
    className: "string",
    begin: /'/,
    end: /'/
  }, d = {
    match: /\\'/
  }, u = {
    begin: /\$?\(\(/,
    end: /\)\)/,
    contains: [
      {
        begin: /\d+#[0-9a-f]+/,
        className: "number"
      },
      e.NUMBER_MODE,
      t
    ]
  }, p = [
    "fish",
    "bash",
    "zsh",
    "sh",
    "csh",
    "ksh",
    "tcsh",
    "dash",
    "scsh"
  ], f = e.SHEBANG({
    binary: `(${p.join("|")})`,
    relevance: 10
  }), g = {
    className: "function",
    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
    returnBegin: !0,
    contains: [e.inherit(e.TITLE_MODE, { begin: /\w[\w\d_]*/ })],
    relevance: 0
  }, E = [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "time",
    "for",
    "while",
    "until",
    "in",
    "do",
    "done",
    "case",
    "esac",
    "coproc",
    "function",
    "select"
  ], _ = [
    "true",
    "false"
  ], h = { match: /(\/[a-z._-]+)+/ }, N = [
    "break",
    "cd",
    "continue",
    "eval",
    "exec",
    "exit",
    "export",
    "getopts",
    "hash",
    "pwd",
    "readonly",
    "return",
    "shift",
    "test",
    "times",
    "trap",
    "umask",
    "unset"
  ], k = [
    "alias",
    "bind",
    "builtin",
    "caller",
    "command",
    "declare",
    "echo",
    "enable",
    "help",
    "let",
    "local",
    "logout",
    "mapfile",
    "printf",
    "read",
    "readarray",
    "source",
    "sudo",
    "type",
    "typeset",
    "ulimit",
    "unalias"
  ], v = [
    "autoload",
    "bg",
    "bindkey",
    "bye",
    "cap",
    "chdir",
    "clone",
    "comparguments",
    "compcall",
    "compctl",
    "compdescribe",
    "compfiles",
    "compgroups",
    "compquote",
    "comptags",
    "comptry",
    "compvalues",
    "dirs",
    "disable",
    "disown",
    "echotc",
    "echoti",
    "emulate",
    "fc",
    "fg",
    "float",
    "functions",
    "getcap",
    "getln",
    "history",
    "integer",
    "jobs",
    "kill",
    "limit",
    "log",
    "noglob",
    "popd",
    "print",
    "pushd",
    "pushln",
    "rehash",
    "sched",
    "setcap",
    "setopt",
    "stat",
    "suspend",
    "ttyctl",
    "unfunction",
    "unhash",
    "unlimit",
    "unsetopt",
    "vared",
    "wait",
    "whence",
    "where",
    "which",
    "zcompile",
    "zformat",
    "zftp",
    "zle",
    "zmodload",
    "zparseopts",
    "zprof",
    "zpty",
    "zregexparse",
    "zsocket",
    "zstyle",
    "ztcp"
  ], I = [
    "chcon",
    "chgrp",
    "chown",
    "chmod",
    "cp",
    "dd",
    "df",
    "dir",
    "dircolors",
    "ln",
    "ls",
    "mkdir",
    "mkfifo",
    "mknod",
    "mktemp",
    "mv",
    "realpath",
    "rm",
    "rmdir",
    "shred",
    "sync",
    "touch",
    "truncate",
    "vdir",
    "b2sum",
    "base32",
    "base64",
    "cat",
    "cksum",
    "comm",
    "csplit",
    "cut",
    "expand",
    "fmt",
    "fold",
    "head",
    "join",
    "md5sum",
    "nl",
    "numfmt",
    "od",
    "paste",
    "ptx",
    "pr",
    "sha1sum",
    "sha224sum",
    "sha256sum",
    "sha384sum",
    "sha512sum",
    "shuf",
    "sort",
    "split",
    "sum",
    "tac",
    "tail",
    "tr",
    "tsort",
    "unexpand",
    "uniq",
    "wc",
    "arch",
    "basename",
    "chroot",
    "date",
    "dirname",
    "du",
    "echo",
    "env",
    "expr",
    "factor",
    // "false", // keyword literal already
    "groups",
    "hostid",
    "id",
    "link",
    "logname",
    "nice",
    "nohup",
    "nproc",
    "pathchk",
    "pinky",
    "printenv",
    "printf",
    "pwd",
    "readlink",
    "runcon",
    "seq",
    "sleep",
    "stat",
    "stdbuf",
    "stty",
    "tee",
    "test",
    "timeout",
    // "true", // keyword literal already
    "tty",
    "uname",
    "unlink",
    "uptime",
    "users",
    "who",
    "whoami",
    "yes"
  ];
  return {
    name: "Bash",
    aliases: [
      "sh",
      "zsh"
    ],
    keywords: {
      $pattern: /\b[a-z][a-z0-9._-]+\b/,
      keyword: E,
      literal: _,
      built_in: [
        ...N,
        ...k,
        // Shell modifiers
        "set",
        "shopt",
        ...v,
        ...I
      ]
    },
    contains: [
      f,
      // to catch known shells and boost relevancy
      e.SHEBANG(),
      // to catch unknown shells but still highlight the shebang
      g,
      u,
      o,
      a,
      h,
      s,
      l,
      c,
      d,
      t
    ]
  };
}
function tg(e) {
  const n = e.regex, t = e.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] }), r = "decltype\\(auto\\)", i = "[a-zA-Z_]\\w*::", a = "(" + r + "|" + n.optional(i) + "[a-zA-Z_]\\w*" + n.optional("<[^<>]+>") + ")", s = {
    className: "type",
    variants: [
      { begin: "\\b[a-z\\d_]*_t\\b" },
      { match: /\batomic_[a-z]{3,6}\b/ }
    ]
  }, c = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [e.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)" + "|.)",
        end: "'",
        illegal: "."
      },
      e.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  }, d = {
    className: "number",
    variants: [
      { match: /\b(0b[01']+)/ },
      { match: /(-?)\b([\d']+(\.[\d']*)?|\.[\d']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)/ },
      { match: /(-?)\b(0[xX][a-fA-F0-9]+(?:'[a-fA-F0-9]+)*(?:\.[a-fA-F0-9]*(?:'[a-fA-F0-9]*)*)?(?:[pP][-+]?[0-9]+)?(l|L)?(u|U)?)/ },
      { match: /(-?)\b\d+(?:'\d+)*(?:\.\d*(?:'\d*)*)?(?:[eE][-+]?\d+)?/ }
    ],
    relevance: 0
  }, u = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef elifdef elifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      e.inherit(c, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      t,
      e.C_BLOCK_COMMENT_MODE
    ]
  }, p = {
    className: "title",
    begin: n.optional(i) + e.IDENT_RE,
    relevance: 0
  }, f = n.optional(i) + e.IDENT_RE + "\\s*\\(", _ = {
    keyword: [
      "asm",
      "auto",
      "break",
      "case",
      "continue",
      "default",
      "do",
      "else",
      "enum",
      "extern",
      "for",
      "fortran",
      "goto",
      "if",
      "inline",
      "register",
      "restrict",
      "return",
      "sizeof",
      "typeof",
      "typeof_unqual",
      "struct",
      "switch",
      "typedef",
      "union",
      "volatile",
      "while",
      "_Alignas",
      "_Alignof",
      "_Atomic",
      "_Generic",
      "_Noreturn",
      "_Static_assert",
      "_Thread_local",
      // aliases
      "alignas",
      "alignof",
      "noreturn",
      "static_assert",
      "thread_local",
      // not a C keyword but is, for all intents and purposes, treated exactly like one.
      "_Pragma"
    ],
    type: [
      "float",
      "double",
      "signed",
      "unsigned",
      "int",
      "short",
      "long",
      "char",
      "void",
      "_Bool",
      "_BitInt",
      "_Complex",
      "_Imaginary",
      "_Decimal32",
      "_Decimal64",
      "_Decimal96",
      "_Decimal128",
      "_Decimal64x",
      "_Decimal128x",
      "_Float16",
      "_Float32",
      "_Float64",
      "_Float128",
      "_Float32x",
      "_Float64x",
      "_Float128x",
      // modifiers
      "const",
      "static",
      "constexpr",
      // aliases
      "complex",
      "bool",
      "imaginary"
    ],
    literal: "true false NULL",
    // TODO: apply hinting work similar to what was done in cpp.js
    built_in: "std string wstring cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set pair bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap priority_queue make_pair array shared_ptr abort terminate abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf future isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf endl initializer_list unique_ptr"
  }, h = [
    u,
    s,
    t,
    e.C_BLOCK_COMMENT_MODE,
    d,
    c
  ], N = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: _,
    contains: h.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: _,
        contains: h.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  }, k = {
    begin: "(" + a + "[\\*&\\s]+)+" + f,
    returnBegin: !0,
    end: /[{;=]/,
    excludeEnd: !0,
    keywords: _,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: r,
        keywords: _,
        relevance: 0
      },
      {
        begin: f,
        returnBegin: !0,
        contains: [e.inherit(p, { className: "title.function" })],
        relevance: 0
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: _,
        relevance: 0,
        contains: [
          t,
          e.C_BLOCK_COMMENT_MODE,
          c,
          d,
          s,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: _,
            relevance: 0,
            contains: [
              "self",
              t,
              e.C_BLOCK_COMMENT_MODE,
              c,
              d,
              s
            ]
          }
        ]
      },
      s,
      t,
      e.C_BLOCK_COMMENT_MODE,
      u
    ]
  };
  return {
    name: "C",
    aliases: ["h"],
    keywords: _,
    // Until differentiations are added between `c` and `cpp`, `c` will
    // not be auto-detected to avoid auto-detect conflicts between C and C++
    disableAutodetect: !0,
    illegal: "</",
    contains: [].concat(
      N,
      k,
      h,
      [
        u,
        {
          begin: e.IDENT_RE + "::",
          keywords: _
        },
        {
          className: "class",
          beginKeywords: "enum class struct union",
          end: /[{;:<>=]/,
          contains: [
            { beginKeywords: "final class struct" },
            e.TITLE_MODE
          ]
        }
      ]
    ),
    exports: {
      preprocessor: u,
      strings: c,
      keywords: _
    }
  };
}
function rg(e) {
  const n = e.regex, t = e.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] }), r = "decltype\\(auto\\)", i = "[a-zA-Z_]\\w*::", a = "(?!struct)(" + r + "|" + n.optional(i) + "[a-zA-Z_]\\w*" + n.optional("<[^<>]+>") + ")", s = {
    className: "type",
    begin: "\\b[a-z\\d_]*_t\\b"
  }, c = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [e.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)" + "|.)",
        end: "'",
        illegal: "."
      },
      e.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  }, d = {
    className: "number",
    variants: [
      // Floating-point literal.
      {
        begin: "[+-]?(?:(?:[0-9](?:'?[0-9])*\\.(?:[0-9](?:'?[0-9])*)?|\\.[0-9](?:'?[0-9])*)(?:[Ee][+-]?[0-9](?:'?[0-9])*)?|[0-9](?:'?[0-9])*[Ee][+-]?[0-9](?:'?[0-9])*|0[Xx](?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*(?:\\.(?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)?)?|\\.[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)[Pp][+-]?[0-9](?:'?[0-9])*)(?:[Ff](?:16|32|64|128)?|(BF|bf)16|[Ll]|)"
      },
      // Integer literal.
      {
        begin: "[+-]?\\b(?:0[Bb][01](?:'?[01])*|0[Xx][0-9A-Fa-f](?:'?[0-9A-Fa-f])*|0(?:'?[0-7])*|[1-9](?:'?[0-9])*)(?:[Uu](?:LL?|ll?)|[Uu][Zz]?|(?:LL?|ll?)[Uu]?|[Zz][Uu]|)"
        // Note: there are user-defined literal suffixes too, but perhaps having the custom suffix not part of the
        // literal highlight actually makes it stand out more.
      }
    ],
    relevance: 0
  }, u = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      e.inherit(c, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      t,
      e.C_BLOCK_COMMENT_MODE
    ]
  }, p = {
    className: "title",
    begin: n.optional(i) + e.IDENT_RE,
    relevance: 0
  }, f = n.optional(i) + e.IDENT_RE + "\\s*\\(", g = [
    "alignas",
    "alignof",
    "and",
    "and_eq",
    "asm",
    "atomic_cancel",
    "atomic_commit",
    "atomic_noexcept",
    "auto",
    "bitand",
    "bitor",
    "break",
    "case",
    "catch",
    "class",
    "co_await",
    "co_return",
    "co_yield",
    "compl",
    "concept",
    "const_cast|10",
    "consteval",
    "constexpr",
    "constinit",
    "continue",
    "decltype",
    "default",
    "delete",
    "do",
    "dynamic_cast|10",
    "else",
    "enum",
    "explicit",
    "export",
    "extern",
    "false",
    "final",
    "for",
    "friend",
    "goto",
    "if",
    "import",
    "inline",
    "module",
    "mutable",
    "namespace",
    "new",
    "noexcept",
    "not",
    "not_eq",
    "nullptr",
    "operator",
    "or",
    "or_eq",
    "override",
    "private",
    "protected",
    "public",
    "reflexpr",
    "register",
    "reinterpret_cast|10",
    "requires",
    "return",
    "sizeof",
    "static_assert",
    "static_cast|10",
    "struct",
    "switch",
    "synchronized",
    "template",
    "this",
    "thread_local",
    "throw",
    "transaction_safe",
    "transaction_safe_dynamic",
    "true",
    "try",
    "typedef",
    "typeid",
    "typename",
    "union",
    "using",
    "virtual",
    "volatile",
    "while",
    "xor",
    "xor_eq"
  ], E = [
    "bool",
    "char",
    "char16_t",
    "char32_t",
    "char8_t",
    "double",
    "float",
    "int",
    "long",
    "short",
    "void",
    "wchar_t",
    "unsigned",
    "signed",
    "const",
    "static"
  ], _ = [
    "any",
    "auto_ptr",
    "barrier",
    "binary_semaphore",
    "bitset",
    "complex",
    "condition_variable",
    "condition_variable_any",
    "counting_semaphore",
    "deque",
    "false_type",
    "flat_map",
    "flat_set",
    "future",
    "imaginary",
    "initializer_list",
    "istringstream",
    "jthread",
    "latch",
    "lock_guard",
    "multimap",
    "multiset",
    "mutex",
    "optional",
    "ostringstream",
    "packaged_task",
    "pair",
    "promise",
    "priority_queue",
    "queue",
    "recursive_mutex",
    "recursive_timed_mutex",
    "scoped_lock",
    "set",
    "shared_future",
    "shared_lock",
    "shared_mutex",
    "shared_timed_mutex",
    "shared_ptr",
    "stack",
    "string_view",
    "stringstream",
    "timed_mutex",
    "thread",
    "true_type",
    "tuple",
    "unique_lock",
    "unique_ptr",
    "unordered_map",
    "unordered_multimap",
    "unordered_multiset",
    "unordered_set",
    "variant",
    "vector",
    "weak_ptr",
    "wstring",
    "wstring_view"
  ], h = [
    "abort",
    "abs",
    "acos",
    "apply",
    "as_const",
    "asin",
    "atan",
    "atan2",
    "calloc",
    "ceil",
    "cerr",
    "cin",
    "clog",
    "cos",
    "cosh",
    "cout",
    "declval",
    "endl",
    "exchange",
    "exit",
    "exp",
    "fabs",
    "floor",
    "fmod",
    "forward",
    "fprintf",
    "fputs",
    "free",
    "frexp",
    "fscanf",
    "future",
    "invoke",
    "isalnum",
    "isalpha",
    "iscntrl",
    "isdigit",
    "isgraph",
    "islower",
    "isprint",
    "ispunct",
    "isspace",
    "isupper",
    "isxdigit",
    "labs",
    "launder",
    "ldexp",
    "log",
    "log10",
    "make_pair",
    "make_shared",
    "make_shared_for_overwrite",
    "make_tuple",
    "make_unique",
    "malloc",
    "memchr",
    "memcmp",
    "memcpy",
    "memset",
    "modf",
    "move",
    "pow",
    "printf",
    "putchar",
    "puts",
    "realloc",
    "scanf",
    "sin",
    "sinh",
    "snprintf",
    "sprintf",
    "sqrt",
    "sscanf",
    "std",
    "stderr",
    "stdin",
    "stdout",
    "strcat",
    "strchr",
    "strcmp",
    "strcpy",
    "strcspn",
    "strlen",
    "strncat",
    "strncmp",
    "strncpy",
    "strpbrk",
    "strrchr",
    "strspn",
    "strstr",
    "swap",
    "tan",
    "tanh",
    "terminate",
    "to_underlying",
    "tolower",
    "toupper",
    "vfprintf",
    "visit",
    "vprintf",
    "vsprintf"
  ], v = {
    type: E,
    keyword: g,
    literal: [
      "NULL",
      "false",
      "nullopt",
      "nullptr",
      "true"
    ],
    built_in: ["_Pragma"],
    _type_hints: _
  }, I = {
    className: "function.dispatch",
    relevance: 0,
    keywords: {
      // Only for relevance, not highlighting.
      _hint: h
    },
    begin: n.concat(
      /\b/,
      /(?!decltype)/,
      /(?!if)/,
      /(?!for)/,
      /(?!switch)/,
      /(?!while)/,
      e.IDENT_RE,
      n.lookahead(/(<[^<>]+>|)\s*\(/)
    )
  }, w = [
    I,
    u,
    s,
    t,
    e.C_BLOCK_COMMENT_MODE,
    d,
    c
  ], P = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: v,
    contains: w.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: v,
        contains: w.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  }, C = {
    className: "function",
    begin: "(" + a + "[\\*&\\s]+)+" + f,
    returnBegin: !0,
    end: /[{;=]/,
    excludeEnd: !0,
    keywords: v,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: r,
        keywords: v,
        relevance: 0
      },
      {
        begin: f,
        returnBegin: !0,
        contains: [p],
        relevance: 0
      },
      // needed because we do not have look-behind on the below rule
      // to prevent it from grabbing the final : in a :: pair
      {
        begin: /::/,
        relevance: 0
      },
      // initializers
      {
        begin: /:/,
        endsWithParent: !0,
        contains: [
          c,
          d
        ]
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: v,
        relevance: 0,
        contains: [
          t,
          e.C_BLOCK_COMMENT_MODE,
          c,
          d,
          s,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: v,
            relevance: 0,
            contains: [
              "self",
              t,
              e.C_BLOCK_COMMENT_MODE,
              c,
              d,
              s
            ]
          }
        ]
      },
      s,
      t,
      e.C_BLOCK_COMMENT_MODE,
      u
    ]
  };
  return {
    name: "C++",
    aliases: [
      "cc",
      "c++",
      "h++",
      "hpp",
      "hh",
      "hxx",
      "cxx"
    ],
    keywords: v,
    illegal: "</",
    classNameAliases: { "function.dispatch": "built_in" },
    contains: [].concat(
      P,
      C,
      I,
      w,
      [
        u,
        {
          // containers: ie, `vector <int> rooms (9);`
          begin: "\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function|flat_map|flat_set)\\s*<(?!<)",
          end: ">",
          keywords: v,
          contains: [
            "self",
            s
          ]
        },
        {
          begin: e.IDENT_RE + "::",
          keywords: v
        },
        {
          match: [
            // extra complexity to deal with `enum class` and `enum struct`
            /\b(?:enum(?:\s+(?:class|struct))?|class|struct|union)/,
            /\s+/,
            /\w+/
          ],
          className: {
            1: "keyword",
            3: "title.class"
          }
        }
      ]
    )
  };
}
function ig(e) {
  const n = [
    "bool",
    "byte",
    "char",
    "decimal",
    "delegate",
    "double",
    "dynamic",
    "enum",
    "float",
    "int",
    "long",
    "nint",
    "nuint",
    "object",
    "sbyte",
    "short",
    "string",
    "ulong",
    "uint",
    "ushort"
  ], t = [
    "public",
    "private",
    "protected",
    "static",
    "internal",
    "protected",
    "abstract",
    "async",
    "extern",
    "override",
    "unsafe",
    "virtual",
    "new",
    "sealed",
    "partial"
  ], r = [
    "default",
    "false",
    "null",
    "true"
  ], i = [
    "abstract",
    "as",
    "base",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "do",
    "else",
    "event",
    "explicit",
    "extern",
    "finally",
    "fixed",
    "for",
    "foreach",
    "goto",
    "if",
    "implicit",
    "in",
    "interface",
    "internal",
    "is",
    "lock",
    "namespace",
    "new",
    "operator",
    "out",
    "override",
    "params",
    "private",
    "protected",
    "public",
    "readonly",
    "record",
    "ref",
    "return",
    "scoped",
    "sealed",
    "sizeof",
    "stackalloc",
    "static",
    "struct",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "unchecked",
    "unsafe",
    "using",
    "virtual",
    "void",
    "volatile",
    "while"
  ], o = [
    "add",
    "alias",
    "and",
    "ascending",
    "args",
    "async",
    "await",
    "by",
    "descending",
    "dynamic",
    "equals",
    "file",
    "from",
    "get",
    "global",
    "group",
    "init",
    "into",
    "join",
    "let",
    "nameof",
    "not",
    "notnull",
    "on",
    "or",
    "orderby",
    "partial",
    "record",
    "remove",
    "required",
    "scoped",
    "select",
    "set",
    "unmanaged",
    "value|0",
    "var",
    "when",
    "where",
    "with",
    "yield"
  ], a = {
    keyword: i.concat(o),
    built_in: n,
    literal: r
  }, s = e.inherit(e.TITLE_MODE, { begin: "[a-zA-Z](\\.?\\w)*" }), l = {
    className: "number",
    variants: [
      { begin: "\\b(0b[01']+)" },
      { begin: "(-?)\\b([\\d']+(\\.[\\d']*)?|\\.[\\d']+)(u|U|l|L|ul|UL|f|F|b|B)" },
      { begin: "(-?)(\\b0[xX][a-fA-F0-9']+|(\\b[\\d']+(\\.[\\d']*)?|\\.[\\d']+)([eE][-+]?[\\d']+)?)" }
    ],
    relevance: 0
  }, c = {
    className: "string",
    begin: /"""("*)(?!")(.|\n)*?"""\1/,
    relevance: 1
  }, d = {
    className: "string",
    begin: '@"',
    end: '"',
    contains: [{ begin: '""' }]
  }, u = e.inherit(d, { illegal: /\n/ }), p = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: a
  }, f = e.inherit(p, { illegal: /\n/ }), g = {
    className: "string",
    begin: /\$"/,
    end: '"',
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      e.BACKSLASH_ESCAPE,
      f
    ]
  }, E = {
    className: "string",
    begin: /\$@"/,
    end: '"',
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      p
    ]
  }, _ = e.inherit(E, {
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      f
    ]
  });
  p.contains = [
    E,
    g,
    d,
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    l,
    e.C_BLOCK_COMMENT_MODE
  ], f.contains = [
    _,
    g,
    u,
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    l,
    e.inherit(e.C_BLOCK_COMMENT_MODE, { illegal: /\n/ })
  ];
  const h = { variants: [
    c,
    E,
    g,
    d,
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE
  ] }, N = {
    begin: "<",
    end: ">",
    contains: [
      { beginKeywords: "in out" },
      s
    ]
  }, k = e.IDENT_RE + "(<" + e.IDENT_RE + "(\\s*,\\s*" + e.IDENT_RE + ")*>)?(\\[\\])?", v = {
    // prevents expressions like `@class` from incorrect flagging
    // `class` as a keyword
    begin: "@" + e.IDENT_RE,
    relevance: 0
  };
  return {
    name: "C#",
    aliases: [
      "cs",
      "c#"
    ],
    keywords: a,
    illegal: /::/,
    contains: [
      e.COMMENT(
        "///",
        "$",
        {
          returnBegin: !0,
          contains: [
            {
              className: "doctag",
              variants: [
                {
                  begin: "///",
                  relevance: 0
                },
                { begin: "<!--|-->" },
                {
                  begin: "</?",
                  end: ">"
                }
              ]
            }
          ]
        }
      ),
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      {
        className: "meta",
        begin: "#",
        end: "$",
        keywords: { keyword: "if else elif endif define undef warning error line region endregion pragma checksum" }
      },
      h,
      l,
      {
        beginKeywords: "class interface",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:,]/,
        contains: [
          { beginKeywords: "where class" },
          s,
          N,
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: "namespace",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          s,
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: "record",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          s,
          N,
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // [Attributes("")]
        className: "meta",
        begin: "^\\s*\\[(?=[\\w])",
        excludeBegin: !0,
        end: "\\]",
        excludeEnd: !0,
        contains: [
          {
            className: "string",
            begin: /"/,
            end: /"/
          }
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: "new return throw await else",
        relevance: 0
      },
      {
        className: "function",
        begin: "(" + k + "\\s+)+" + e.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
        returnBegin: !0,
        end: /\s*[{;=]/,
        excludeEnd: !0,
        keywords: a,
        contains: [
          // prevents these from being highlighted `title`
          {
            beginKeywords: t.join(" "),
            relevance: 0
          },
          {
            begin: e.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
            returnBegin: !0,
            contains: [
              e.TITLE_MODE,
              N
            ],
            relevance: 0
          },
          { match: /\(\)/ },
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            excludeBegin: !0,
            excludeEnd: !0,
            keywords: a,
            relevance: 0,
            contains: [
              h,
              l,
              e.C_BLOCK_COMMENT_MODE
            ]
          },
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      v
    ]
  };
}
const ag = (e) => ({
  IMPORTANT: {
    scope: "meta",
    begin: "!important"
  },
  BLOCK_COMMENT: e.C_BLOCK_COMMENT_MODE,
  HEXCOLOR: {
    scope: "number",
    begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
  },
  FUNCTION_DISPATCH: {
    className: "built_in",
    begin: /[\w-]+(?=\()/
  },
  ATTRIBUTE_SELECTOR_MODE: {
    scope: "selector-attr",
    begin: /\[/,
    end: /\]/,
    illegal: "$",
    contains: [
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE
    ]
  },
  CSS_NUMBER_MODE: {
    scope: "number",
    begin: e.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
    relevance: 0
  },
  CSS_VARIABLE: {
    className: "attr",
    begin: /--[A-Za-z_][A-Za-z0-9_-]*/
  }
}), og = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
], sg = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
], lg = [
  ...og,
  ...sg
], cg = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse(), ug = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse(), dg = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse(), fg = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse();
function pg(e) {
  const n = e.regex, t = ag(e), r = { begin: /-(webkit|moz|ms|o)-(?=[a-z])/ }, i = "and or not only", o = /@-?\w[\w]*(-\w+)*/, a = "[a-zA-Z-][a-zA-Z0-9_-]*", s = [
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE
  ];
  return {
    name: "CSS",
    case_insensitive: !0,
    illegal: /[=|'\$]/,
    keywords: { keyframePosition: "from to" },
    classNameAliases: {
      // for visual continuity with `tag {}` and because we
      // don't have a great class for this?
      keyframePosition: "selector-tag"
    },
    contains: [
      t.BLOCK_COMMENT,
      r,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      t.CSS_NUMBER_MODE,
      {
        className: "selector-id",
        begin: /#[A-Za-z0-9_-]+/,
        relevance: 0
      },
      {
        className: "selector-class",
        begin: "\\." + a,
        relevance: 0
      },
      t.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-pseudo",
        variants: [
          { begin: ":(" + ug.join("|") + ")" },
          { begin: ":(:)?(" + dg.join("|") + ")" }
        ]
      },
      // we may actually need this (12/2020)
      // { // pseudo-selector params
      //   begin: /\(/,
      //   end: /\)/,
      //   contains: [ hljs.CSS_NUMBER_MODE ]
      // },
      t.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + fg.join("|") + ")\\b"
      },
      // attribute values
      {
        begin: /:/,
        end: /[;}{]/,
        contains: [
          t.BLOCK_COMMENT,
          t.HEXCOLOR,
          t.IMPORTANT,
          t.CSS_NUMBER_MODE,
          ...s,
          // needed to highlight these as strings and to avoid issues with
          // illegal characters that might be inside urls that would tigger the
          // languages illegal stack
          {
            begin: /(url|data-uri)\(/,
            end: /\)/,
            relevance: 0,
            // from keywords
            keywords: { built_in: "url data-uri" },
            contains: [
              ...s,
              {
                className: "string",
                // any character other than `)` as in `url()` will be the start
                // of a string, which ends with `)` (from the parent mode)
                begin: /[^)]/,
                endsWithParent: !0,
                excludeEnd: !0
              }
            ]
          },
          t.FUNCTION_DISPATCH
        ]
      },
      {
        begin: n.lookahead(/@/),
        end: "[{;]",
        relevance: 0,
        illegal: /:/,
        // break on Less variables @var: ...
        contains: [
          {
            className: "keyword",
            begin: o
          },
          {
            begin: /\s/,
            endsWithParent: !0,
            excludeEnd: !0,
            relevance: 0,
            keywords: {
              $pattern: /[a-z-]+/,
              keyword: i,
              attribute: cg.join(" ")
            },
            contains: [
              {
                begin: /[a-z-]+(?=:)/,
                className: "attribute"
              },
              ...s,
              t.CSS_NUMBER_MODE
            ]
          }
        ]
      },
      {
        className: "selector-tag",
        begin: "\\b(" + lg.join("|") + ")\\b"
      }
    ]
  };
}
function gg(e) {
  const n = e.regex;
  return {
    name: "Diff",
    aliases: ["patch"],
    contains: [
      {
        className: "meta",
        relevance: 10,
        match: n.either(
          /^@@ +-\d+,\d+ +\+\d+,\d+ +@@/,
          /^\*\*\* +\d+,\d+ +\*\*\*\*$/,
          /^--- +\d+,\d+ +----$/
        )
      },
      {
        className: "comment",
        variants: [
          {
            begin: n.either(
              /Index: /,
              /^index/,
              /={3,}/,
              /^-{3}/,
              /^\*{3} /,
              /^\+{3}/,
              /^diff --git/
            ),
            end: /$/
          },
          { match: /^\*{15}$/ }
        ]
      },
      {
        className: "addition",
        begin: /^\+/,
        end: /$/
      },
      {
        className: "deletion",
        begin: /^-/,
        end: /$/
      },
      {
        className: "addition",
        begin: /^!/,
        end: /$/
      }
    ]
  };
}
function hg(e) {
  const o = {
    keyword: [
      "break",
      "case",
      "chan",
      "const",
      "continue",
      "default",
      "defer",
      "else",
      "fallthrough",
      "for",
      "func",
      "go",
      "goto",
      "if",
      "import",
      "interface",
      "map",
      "package",
      "range",
      "return",
      "select",
      "struct",
      "switch",
      "type",
      "var"
    ],
    type: [
      "bool",
      "byte",
      "complex64",
      "complex128",
      "error",
      "float32",
      "float64",
      "int8",
      "int16",
      "int32",
      "int64",
      "string",
      "uint8",
      "uint16",
      "uint32",
      "uint64",
      "int",
      "uint",
      "uintptr",
      "rune"
    ],
    literal: [
      "true",
      "false",
      "iota",
      "nil"
    ],
    built_in: [
      "append",
      "cap",
      "close",
      "complex",
      "copy",
      "imag",
      "len",
      "make",
      "new",
      "panic",
      "print",
      "println",
      "real",
      "recover",
      "delete"
    ]
  };
  return {
    name: "Go",
    aliases: ["golang"],
    keywords: o,
    illegal: "</",
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      {
        className: "string",
        variants: [
          e.QUOTE_STRING_MODE,
          e.APOS_STRING_MODE,
          {
            begin: "`",
            end: "`"
          }
        ]
      },
      {
        className: "number",
        variants: [
          {
            match: /-?\b0[xX]\.[a-fA-F0-9](_?[a-fA-F0-9])*[pP][+-]?\d(_?\d)*i?/,
            // hex without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b0[xX](_?[a-fA-F0-9])+((\.([a-fA-F0-9](_?[a-fA-F0-9])*)?)?[pP][+-]?\d(_?\d)*)?i?/,
            // hex with a present digit before . (making a digit afterwards optional)
            relevance: 0
          },
          {
            match: /-?\b0[oO](_?[0-7])*i?/,
            // leading 0o octal
            relevance: 0
          },
          {
            match: /-?\.\d(_?\d)*([eE][+-]?\d(_?\d)*)?i?/,
            // decimal without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b\d(_?\d)*(\.(\d(_?\d)*)?)?([eE][+-]?\d(_?\d)*)?i?/,
            // decimal with a present digit before . (making a digit afterwards optional)
            relevance: 0
          }
        ]
      },
      {
        begin: /:=/
        // relevance booster
      },
      {
        className: "function",
        beginKeywords: "func",
        end: "\\s*(\\{|$)",
        excludeEnd: !0,
        contains: [
          e.TITLE_MODE,
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: !0,
            keywords: o,
            illegal: /["']/
          }
        ]
      }
    ]
  };
}
function mg(e) {
  const n = e.regex, t = /[_A-Za-z][_0-9A-Za-z]*/;
  return {
    name: "GraphQL",
    aliases: ["gql"],
    case_insensitive: !0,
    disableAutodetect: !1,
    keywords: {
      keyword: [
        "query",
        "mutation",
        "subscription",
        "type",
        "input",
        "schema",
        "directive",
        "interface",
        "union",
        "scalar",
        "fragment",
        "enum",
        "on"
      ],
      literal: [
        "true",
        "false",
        "null"
      ]
    },
    contains: [
      e.HASH_COMMENT_MODE,
      e.QUOTE_STRING_MODE,
      e.NUMBER_MODE,
      {
        scope: "punctuation",
        match: /[.]{3}/,
        relevance: 0
      },
      {
        scope: "punctuation",
        begin: /[\!\(\)\:\=\[\]\{\|\}]{1}/,
        relevance: 0
      },
      {
        scope: "variable",
        begin: /\$/,
        end: /\W/,
        excludeEnd: !0,
        relevance: 0
      },
      {
        scope: "meta",
        match: /@\w+/,
        excludeEnd: !0
      },
      {
        scope: "symbol",
        begin: n.concat(t, n.lookahead(/\s*:/)),
        relevance: 0
      }
    ],
    illegal: [
      /[;<']/,
      /BEGIN/
    ]
  };
}
function bg(e) {
  const n = e.regex, t = {
    className: "number",
    relevance: 0,
    variants: [
      { begin: /([+-]+)?[\d]+_[\d_]+/ },
      { begin: e.NUMBER_RE }
    ]
  }, r = e.COMMENT();
  r.variants = [
    {
      begin: /;/,
      end: /$/
    },
    {
      begin: /#/,
      end: /$/
    }
  ];
  const i = {
    className: "variable",
    variants: [
      { begin: /\$[\w\d"][\w\d_]*/ },
      { begin: /\$\{(.*?)\}/ }
    ]
  }, o = {
    className: "literal",
    begin: /\bon|off|true|false|yes|no\b/
  }, a = {
    className: "string",
    contains: [e.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: "'''",
        end: "'''",
        relevance: 10
      },
      {
        begin: '"""',
        end: '"""',
        relevance: 10
      },
      {
        begin: '"',
        end: '"'
      },
      {
        begin: "'",
        end: "'"
      }
    ]
  }, s = {
    begin: /\[/,
    end: /\]/,
    contains: [
      r,
      o,
      i,
      a,
      t,
      "self"
    ],
    relevance: 0
  }, l = /[A-Za-z0-9_-]+/, c = /"(\\"|[^"])*"/, d = /'[^']*'/, u = n.either(
    l,
    c,
    d
  ), p = n.concat(
    u,
    "(\\s*\\.\\s*",
    u,
    ")*",
    n.lookahead(/\s*=\s*[^#\s]/)
  );
  return {
    name: "TOML, also INI",
    aliases: ["toml"],
    case_insensitive: !0,
    illegal: /\S/,
    contains: [
      r,
      {
        className: "section",
        begin: /\[+/,
        end: /\]+/
      },
      {
        begin: p,
        className: "attr",
        starts: {
          end: /$/,
          contains: [
            r,
            s,
            o,
            i,
            a,
            t
          ]
        }
      }
    ]
  };
}
var Rn = "[0-9](_*[0-9])*", mt = `\\.(${Rn})`, bt = "[0-9a-fA-F](_*[0-9a-fA-F])*", na = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${Rn})((${mt})|\\.)?|(${mt}))[eE][+-]?(${Rn})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${Rn})((${mt})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${mt})[fFdD]?\\b` },
    { begin: `\\b(${Rn})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${bt})\\.?|(${bt})?\\.(${bt}))[pP][+-]?(${Rn})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${bt})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function Oo(e, n, t) {
  return t === -1 ? "" : e.replace(n, (r) => Oo(e, n, t - 1));
}
function Eg(e) {
  const n = e.regex, t = "[À-ʸa-zA-Z_$][À-ʸa-zA-Z_$0-9]*", r = t + Oo("(?:<" + t + "~~~(?:\\s*,\\s*" + t + "~~~)*>)?", /~~~/g, 2), l = {
    keyword: [
      "synchronized",
      "abstract",
      "private",
      "var",
      "static",
      "if",
      "const ",
      "for",
      "while",
      "strictfp",
      "finally",
      "protected",
      "import",
      "native",
      "final",
      "void",
      "enum",
      "else",
      "break",
      "transient",
      "catch",
      "instanceof",
      "volatile",
      "case",
      "assert",
      "package",
      "default",
      "public",
      "try",
      "switch",
      "continue",
      "throws",
      "protected",
      "public",
      "private",
      "module",
      "requires",
      "exports",
      "do",
      "sealed",
      "yield",
      "permits",
      "goto",
      "when"
    ],
    literal: [
      "false",
      "true",
      "null"
    ],
    type: [
      "char",
      "boolean",
      "long",
      "float",
      "int",
      "byte",
      "short",
      "double"
    ],
    built_in: [
      "super",
      "this"
    ]
  }, c = {
    className: "meta",
    begin: "@" + t,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: ["self"]
        // allow nested () inside our annotation
      }
    ]
  }, d = {
    className: "params",
    begin: /\(/,
    end: /\)/,
    keywords: l,
    relevance: 0,
    contains: [e.C_BLOCK_COMMENT_MODE],
    endsParent: !0
  };
  return {
    name: "Java",
    aliases: ["jsp"],
    keywords: l,
    illegal: /<\/|#/,
    contains: [
      e.COMMENT(
        "/\\*\\*",
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              // eat up @'s in emails to prevent them to be recognized as doctags
              begin: /\w+@/,
              relevance: 0
            },
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            }
          ]
        }
      ),
      // relevance boost
      {
        begin: /import java\.[a-z]+\./,
        keywords: "import",
        relevance: 2
      },
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      {
        begin: /"""/,
        end: /"""/,
        className: "string",
        contains: [e.BACKSLASH_ESCAPE]
      },
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      {
        match: [
          /\b(?:class|interface|enum|extends|implements|new)/,
          /\s+/,
          t
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        // Exceptions for hyphenated keywords
        match: /non-sealed/,
        scope: "keyword"
      },
      {
        begin: [
          n.concat(/(?!else)/, t),
          /\s+/,
          t,
          /\s+/,
          /=(?!=)/
        ],
        className: {
          1: "type",
          3: "variable",
          5: "operator"
        }
      },
      {
        begin: [
          /record/,
          /\s+/,
          t
        ],
        className: {
          1: "keyword",
          3: "title.class"
        },
        contains: [
          d,
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: "new throw return else",
        relevance: 0
      },
      {
        begin: [
          "(?:" + r + "\\s+)",
          e.UNDERSCORE_IDENT_RE,
          /\s*(?=\()/
        ],
        className: { 2: "title.function" },
        keywords: l,
        contains: [
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            keywords: l,
            relevance: 0,
            contains: [
              c,
              e.APOS_STRING_MODE,
              e.QUOTE_STRING_MODE,
              na,
              e.C_BLOCK_COMMENT_MODE
            ]
          },
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      na,
      c
    ]
  };
}
const ta = "[A-Za-z$_][0-9A-Za-z$_]*", yg = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends",
  // It's reached stage 3, which is "recommended for implementation":
  "using"
], _g = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
], Ro = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
], Mo = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
], Lo = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
], kg = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "global"
  // Node.js
], wg = [].concat(
  Lo,
  Ro,
  Mo
);
function xg(e) {
  const n = e.regex, t = (Z, { after: le }) => {
    const m = "</" + Z[0].slice(1);
    return Z.input.indexOf(m, le) !== -1;
  }, r = ta, i = {
    begin: "<>",
    end: "</>"
  }, o = /<[A-Za-z0-9\\._:-]+\s*\/>/, a = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (Z, le) => {
      const m = Z[0].length + Z.index, fe = Z.input[m];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        fe === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        fe === ","
      ) {
        le.ignoreMatch();
        return;
      }
      fe === ">" && (t(Z, { after: m }) || le.ignoreMatch());
      let ge;
      const y = Z.input.substring(m);
      if (ge = y.match(/^\s*=/)) {
        le.ignoreMatch();
        return;
      }
      if ((ge = y.match(/^\s+extends\s+/)) && ge.index === 0) {
        le.ignoreMatch();
        return;
      }
    }
  }, s = {
    $pattern: ta,
    keyword: yg,
    literal: _g,
    built_in: wg,
    "variable.language": kg
  }, l = "[0-9](_?[0-9])*", c = `\\.(${l})`, d = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*", u = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${d})((${c})|\\.)?|(${c}))[eE][+-]?(${l})\\b` },
      { begin: `\\b(${d})\\b((${c})\\b|\\.)?|(${c})\\b` },
      // DecimalBigIntegerLiteral
      { begin: "\\b(0|[1-9](_?[0-9])*)n\\b" },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  }, p = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: s,
    contains: []
    // defined later
  }, f = {
    begin: ".?html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        p
      ],
      subLanguage: "xml"
    }
  }, g = {
    begin: ".?css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        p
      ],
      subLanguage: "css"
    }
  }, E = {
    begin: ".?gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        p
      ],
      subLanguage: "graphql"
    }
  }, _ = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      e.BACKSLASH_ESCAPE,
      p
    ]
  }, N = {
    className: "comment",
    variants: [
      e.COMMENT(
        /\/\*\*(?!\/)/,
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              begin: "(?=@[A-Za-z]+)",
              relevance: 0,
              contains: [
                {
                  className: "doctag",
                  begin: "@[A-Za-z]+"
                },
                {
                  className: "type",
                  begin: "\\{",
                  end: "\\}",
                  excludeEnd: !0,
                  excludeBegin: !0,
                  relevance: 0
                },
                {
                  className: "variable",
                  begin: r + "(?=\\s*(-)|$)",
                  endsParent: !0,
                  relevance: 0
                },
                // eat spaces (not newlines) so we can find
                // types or variables
                {
                  begin: /(?=[^\n])\s/,
                  relevance: 0
                }
              ]
            }
          ]
        }
      ),
      e.C_BLOCK_COMMENT_MODE,
      e.C_LINE_COMMENT_MODE
    ]
  }, k = [
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    f,
    g,
    E,
    _,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    u
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  p.contains = k.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: s,
    contains: [
      "self"
    ].concat(k)
  });
  const v = [].concat(N, p.contains), I = v.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: s,
      contains: ["self"].concat(v)
    }
  ]), w = {
    className: "params",
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/,
    // to match the parms with
    end: /\)/,
    excludeBegin: !0,
    excludeEnd: !0,
    keywords: s,
    contains: I
  }, P = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          r,
          /\s+/,
          /extends/,
          /\s+/,
          n.concat(r, "(", n.concat(/\./, r), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          r
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  }, C = {
    relevance: 0,
    match: n.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...Ro,
        ...Mo
      ]
    }
  }, B = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  }, x = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          r,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [w],
    illegal: /%/
  }, D = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function $(Z) {
    return n.concat("(?!", Z.join("|"), ")");
  }
  const ne = {
    match: n.concat(
      /\b/,
      $([
        ...Lo,
        "super",
        "import"
      ].map((Z) => `${Z}\\s*\\(`)),
      r,
      n.lookahead(/\s*\(/)
    ),
    className: "title.function",
    relevance: 0
  }, z = {
    begin: n.concat(/\./, n.lookahead(
      n.concat(r, /(?![0-9A-Za-z$_(])/)
    )),
    end: r,
    excludeBegin: !0,
    keywords: "prototype",
    className: "property",
    relevance: 0
  }, O = {
    match: [
      /get|set/,
      /\s+/,
      r,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      w
    ]
  }, X = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + e.UNDERSCORE_IDENT_RE + ")\\s*=>", H = {
    match: [
      /const|var|let/,
      /\s+/,
      r,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      n.lookahead(X)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      w
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: s,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS: I, CLASS_REFERENCE: C },
    illegal: /#(?![$_A-z])/,
    contains: [
      e.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      B,
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      f,
      g,
      E,
      _,
      N,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      u,
      C,
      {
        scope: "attr",
        match: r + n.lookahead(":"),
        relevance: 0
      },
      H,
      {
        // "value" container
        begin: "(" + e.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          N,
          e.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: X,
            returnBegin: !0,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: e.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: !0
                  },
                  {
                    begin: /(\s*)\(/,
                    end: /\)/,
                    excludeBegin: !0,
                    excludeEnd: !0,
                    keywords: s,
                    contains: I
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: i.begin, end: i.end },
              { match: o },
              {
                begin: a.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": a.isTrulyOpeningTag,
                end: a.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: a.begin,
                end: a.end,
                skip: !0,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      x,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + e.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: !0,
        label: "func.def",
        contains: [
          w,
          e.inherit(e.TITLE_MODE, { begin: r, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      z,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + r,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [w]
      },
      ne,
      D,
      P,
      O,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function Ng(e) {
  const n = {
    className: "attr",
    begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
    relevance: 1.01
  }, t = {
    match: /[{}[\],:]/,
    className: "punctuation",
    relevance: 0
  }, r = [
    "true",
    "false",
    "null"
  ], i = {
    scope: "literal",
    beginKeywords: r.join(" ")
  };
  return {
    name: "JSON",
    aliases: ["jsonc"],
    keywords: {
      literal: r
    },
    contains: [
      n,
      t,
      e.QUOTE_STRING_MODE,
      i,
      e.C_NUMBER_MODE,
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE
    ],
    illegal: "\\S"
  };
}
var Mn = "[0-9](_*[0-9])*", Et = `\\.(${Mn})`, yt = "[0-9a-fA-F](_*[0-9a-fA-F])*", Sg = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${Mn})((${Et})|\\.)?|(${Et}))[eE][+-]?(${Mn})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${Mn})((${Et})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${Et})[fFdD]?\\b` },
    { begin: `\\b(${Mn})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${yt})\\.?|(${yt})?\\.(${yt}))[pP][+-]?(${Mn})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${yt})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function vg(e) {
  const n = {
    keyword: "abstract as val var vararg get set class object open private protected public noinline crossinline dynamic final enum if else do while for when throw try catch finally import package is in fun override companion reified inline lateinit init interface annotation data sealed internal infix operator out by constructor super tailrec where const inner suspend typealias external expect actual",
    built_in: "Byte Short Char Int Long Boolean Float Double Void Unit Nothing",
    literal: "true false null"
  }, t = {
    className: "keyword",
    begin: /\b(break|continue|return|this)\b/,
    starts: { contains: [
      {
        className: "symbol",
        begin: /@\w+/
      }
    ] }
  }, r = {
    className: "symbol",
    begin: e.UNDERSCORE_IDENT_RE + "@"
  }, i = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    contains: [e.C_NUMBER_MODE]
  }, o = {
    className: "variable",
    begin: "\\$" + e.UNDERSCORE_IDENT_RE
  }, a = {
    className: "string",
    variants: [
      {
        begin: '"""',
        end: '"""(?=[^"])',
        contains: [
          o,
          i
        ]
      },
      // Can't use built-in modes easily, as we want to use STRING in the meta
      // context as 'meta-string' and there's no syntax to remove explicitly set
      // classNames in built-in modes.
      {
        begin: "'",
        end: "'",
        illegal: /\n/,
        contains: [e.BACKSLASH_ESCAPE]
      },
      {
        begin: '"',
        end: '"',
        illegal: /\n/,
        contains: [
          e.BACKSLASH_ESCAPE,
          o,
          i
        ]
      }
    ]
  };
  i.contains.push(a);
  const s = {
    className: "meta",
    begin: "@(?:file|property|field|get|set|receiver|param|setparam|delegate)\\s*:(?:\\s*" + e.UNDERSCORE_IDENT_RE + ")?"
  }, l = {
    className: "meta",
    begin: "@" + e.UNDERSCORE_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          e.inherit(a, { className: "string" }),
          "self"
        ]
      }
    ]
  }, c = Sg, d = e.COMMENT(
    "/\\*",
    "\\*/",
    { contains: [e.C_BLOCK_COMMENT_MODE] }
  ), u = { variants: [
    {
      className: "type",
      begin: e.UNDERSCORE_IDENT_RE
    },
    {
      begin: /\(/,
      end: /\)/,
      contains: []
      // defined later
    }
  ] }, p = u;
  return p.variants[1].contains = [u], u.variants[1].contains = [p], {
    name: "Kotlin",
    aliases: [
      "kt",
      "kts"
    ],
    keywords: n,
    contains: [
      e.COMMENT(
        "/\\*\\*",
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            }
          ]
        }
      ),
      e.C_LINE_COMMENT_MODE,
      d,
      t,
      r,
      s,
      l,
      {
        className: "function",
        beginKeywords: "fun",
        end: "[(]|$",
        returnBegin: !0,
        excludeEnd: !0,
        keywords: n,
        relevance: 5,
        contains: [
          {
            begin: e.UNDERSCORE_IDENT_RE + "\\s*\\(",
            returnBegin: !0,
            relevance: 0,
            contains: [e.UNDERSCORE_TITLE_MODE]
          },
          {
            className: "type",
            begin: /</,
            end: />/,
            keywords: "reified",
            relevance: 0
          },
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: !0,
            keywords: n,
            relevance: 0,
            contains: [
              {
                begin: /:/,
                end: /[=,\/]/,
                endsWithParent: !0,
                contains: [
                  u,
                  e.C_LINE_COMMENT_MODE,
                  d
                ],
                relevance: 0
              },
              e.C_LINE_COMMENT_MODE,
              d,
              s,
              l,
              a,
              e.C_NUMBER_MODE
            ]
          },
          d
        ]
      },
      {
        begin: [
          /class|interface|trait/,
          /\s+/,
          e.UNDERSCORE_IDENT_RE
        ],
        beginScope: {
          3: "title.class"
        },
        keywords: "class interface trait",
        end: /[:\{(]|$/,
        excludeEnd: !0,
        illegal: "extends implements",
        contains: [
          { beginKeywords: "public protected internal private constructor" },
          e.UNDERSCORE_TITLE_MODE,
          {
            className: "type",
            begin: /</,
            end: />/,
            excludeBegin: !0,
            excludeEnd: !0,
            relevance: 0
          },
          {
            className: "type",
            begin: /[,:]\s*/,
            end: /[<\(,){\s]|$/,
            excludeBegin: !0,
            returnEnd: !0
          },
          s,
          l
        ]
      },
      a,
      {
        className: "meta",
        begin: "^#!/usr/bin/env",
        end: "$",
        illegal: `
`
      },
      c
    ]
  };
}
const Tg = (e) => ({
  IMPORTANT: {
    scope: "meta",
    begin: "!important"
  },
  BLOCK_COMMENT: e.C_BLOCK_COMMENT_MODE,
  HEXCOLOR: {
    scope: "number",
    begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
  },
  FUNCTION_DISPATCH: {
    className: "built_in",
    begin: /[\w-]+(?=\()/
  },
  ATTRIBUTE_SELECTOR_MODE: {
    scope: "selector-attr",
    begin: /\[/,
    end: /\]/,
    illegal: "$",
    contains: [
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE
    ]
  },
  CSS_NUMBER_MODE: {
    scope: "number",
    begin: e.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
    relevance: 0
  },
  CSS_VARIABLE: {
    className: "attr",
    begin: /--[A-Za-z_][A-Za-z0-9_-]*/
  }
}), Cg = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
], Ag = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
], Ig = [
  ...Cg,
  ...Ag
], Og = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse(), Do = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse(), Po = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse(), Rg = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse(), Mg = Do.concat(Po).sort().reverse();
function Lg(e) {
  const n = Tg(e), t = Mg, r = "and or not only", i = "[\\w-]+", o = "(" + i + "|@\\{" + i + "\\})", a = [], s = [], l = function(k) {
    return {
      // Less strings are not multiline (also include '~' for more consistent coloring of "escaped" strings)
      className: "string",
      begin: "~?" + k + ".*?" + k
    };
  }, c = function(k, v, I) {
    return {
      className: k,
      begin: v,
      relevance: I
    };
  }, d = {
    $pattern: /[a-z-]+/,
    keyword: r,
    attribute: Og.join(" ")
  }, u = {
    // used only to properly balance nested parens inside mixin call, def. arg list
    begin: "\\(",
    end: "\\)",
    contains: s,
    keywords: d,
    relevance: 0
  };
  s.push(
    e.C_LINE_COMMENT_MODE,
    e.C_BLOCK_COMMENT_MODE,
    l("'"),
    l('"'),
    n.CSS_NUMBER_MODE,
    // fixme: it does not include dot for numbers like .5em :(
    {
      begin: "(url|data-uri)\\(",
      starts: {
        className: "string",
        end: "[\\)\\n]",
        excludeEnd: !0
      }
    },
    n.HEXCOLOR,
    u,
    c("variable", "@@?" + i, 10),
    c("variable", "@\\{" + i + "\\}"),
    c("built_in", "~?`[^`]*?`"),
    // inline javascript (or whatever host language) *multiline* string
    {
      // @media features (it’s here to not duplicate things in AT_RULE_MODE with extra PARENS_MODE overriding):
      className: "attribute",
      begin: i + "\\s*:",
      end: ":",
      returnBegin: !0,
      excludeEnd: !0
    },
    n.IMPORTANT,
    { beginKeywords: "and not" },
    n.FUNCTION_DISPATCH
  );
  const p = s.concat({
    begin: /\{/,
    end: /\}/,
    contains: a
  }), f = {
    beginKeywords: "when",
    endsWithParent: !0,
    contains: [{ beginKeywords: "and not" }].concat(s)
    // using this form to override VALUE’s 'function' match
  }, g = {
    begin: o + "\\s*:",
    returnBegin: !0,
    end: /[;}]/,
    relevance: 0,
    contains: [
      { begin: /-(webkit|moz|ms|o)-/ },
      n.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + Rg.join("|") + ")\\b",
        end: /(?=:)/,
        starts: {
          endsWithParent: !0,
          illegal: "[<=$]",
          relevance: 0,
          contains: s
        }
      }
    ]
  }, E = {
    className: "keyword",
    begin: "@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b",
    starts: {
      end: "[;{}]",
      keywords: d,
      returnEnd: !0,
      contains: s,
      relevance: 0
    }
  }, _ = {
    className: "variable",
    variants: [
      // using more strict pattern for higher relevance to increase chances of Less detection.
      // this is *the only* Less specific statement used in most of the sources, so...
      // (we’ll still often loose to the css-parser unless there's '//' comment,
      // simply because 1 variable just can't beat 99 properties :)
      {
        begin: "@" + i + "\\s*:",
        relevance: 15
      },
      { begin: "@" + i }
    ],
    starts: {
      end: "[;}]",
      returnEnd: !0,
      contains: p
    }
  }, h = {
    // first parse unambiguous selectors (i.e. those not starting with tag)
    // then fall into the scary lookahead-discriminator variant.
    // this mode also handles mixin definitions and calls
    variants: [
      {
        begin: "[\\.#:&\\[>]",
        end: "[;{}]"
        // mixin calls end with ';'
      },
      {
        begin: o,
        end: /\{/
      }
    ],
    returnBegin: !0,
    returnEnd: !0,
    illegal: `[<='$"]`,
    relevance: 0,
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      f,
      c("keyword", "all\\b"),
      c("variable", "@\\{" + i + "\\}"),
      // otherwise it’s identified as tag
      {
        begin: "\\b(" + Ig.join("|") + ")\\b",
        className: "selector-tag"
      },
      n.CSS_NUMBER_MODE,
      c("selector-tag", o, 0),
      c("selector-id", "#" + o),
      c("selector-class", "\\." + o, 0),
      c("selector-tag", "&", 0),
      n.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-pseudo",
        begin: ":(" + Do.join("|") + ")"
      },
      {
        className: "selector-pseudo",
        begin: ":(:)?(" + Po.join("|") + ")"
      },
      {
        begin: /\(/,
        end: /\)/,
        relevance: 0,
        contains: p
      },
      // argument list of parametric mixins
      { begin: "!important" },
      // eat !important after mixin call or it will be colored as tag
      n.FUNCTION_DISPATCH
    ]
  }, N = {
    begin: i + `:(:)?(${t.join("|")})`,
    returnBegin: !0,
    contains: [h]
  };
  return a.push(
    e.C_LINE_COMMENT_MODE,
    e.C_BLOCK_COMMENT_MODE,
    E,
    _,
    N,
    g,
    h,
    f,
    n.FUNCTION_DISPATCH
  ), {
    name: "Less",
    case_insensitive: !0,
    illegal: `[=>'/<($"]`,
    contains: a
  };
}
function Dg(e) {
  const n = "\\[=*\\[", t = "\\]=*\\]", r = {
    begin: n,
    end: t,
    contains: ["self"]
  }, i = [
    e.COMMENT("--(?!" + n + ")", "$"),
    e.COMMENT(
      "--" + n,
      t,
      {
        contains: [r],
        relevance: 10
      }
    )
  ];
  return {
    name: "Lua",
    aliases: ["pluto"],
    keywords: {
      $pattern: e.UNDERSCORE_IDENT_RE,
      literal: "true false nil",
      keyword: "and break do else elseif end for goto if in local not or repeat return then until while",
      built_in: (
        // Metatags and globals:
        "_G _ENV _VERSION __index __newindex __mode __call __metatable __tostring __len __gc __add __sub __mul __div __mod __pow __concat __unm __eq __lt __le assert collectgarbage dofile error getfenv getmetatable ipairs load loadfile loadstring module next pairs pcall print rawequal rawget rawset require select setfenv setmetatable tonumber tostring type unpack xpcall arg self coroutine resume yield status wrap create running debug getupvalue debug sethook getmetatable gethook setmetatable setlocal traceback setfenv getinfo setupvalue getlocal getregistry getfenv io lines write close flush open output type read stderr stdin input stdout popen tmpfile math log max acos huge ldexp pi cos tanh pow deg tan cosh sinh random randomseed frexp ceil floor rad abs sqrt modf asin min mod fmod log10 atan2 exp sin atan os exit setlocale date getenv difftime remove time clock tmpname rename execute package preload loadlib loaded loaders cpath config path seeall string sub upper len gfind rep find match char dump gmatch reverse byte format gsub lower table setn insert getn foreachi maxn foreach concat sort remove"
      )
    },
    contains: i.concat([
      {
        className: "function",
        beginKeywords: "function",
        end: "\\)",
        contains: [
          e.inherit(e.TITLE_MODE, { begin: "([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*" }),
          {
            className: "params",
            begin: "\\(",
            endsWithParent: !0,
            contains: i
          }
        ].concat(i)
      },
      e.C_NUMBER_MODE,
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      {
        className: "string",
        begin: n,
        end: t,
        contains: [r],
        relevance: 5
      }
    ])
  };
}
function Pg(e) {
  const n = {
    className: "variable",
    variants: [
      {
        begin: "\\$\\(" + e.UNDERSCORE_IDENT_RE + "\\)",
        contains: [e.BACKSLASH_ESCAPE]
      },
      { begin: /\$[@%<?\^\+\*]/ }
    ]
  }, t = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      e.BACKSLASH_ESCAPE,
      n
    ]
  }, r = {
    className: "variable",
    begin: /\$\([\w-]+\s/,
    end: /\)/,
    keywords: { built_in: "subst patsubst strip findstring filter filter-out sort word wordlist firstword lastword dir notdir suffix basename addsuffix addprefix join wildcard realpath abspath error warning shell origin flavor foreach if or and call eval file value" },
    contains: [
      n,
      t
      // Added QUOTE_STRING as they can be a part of functions
    ]
  }, i = { begin: "^" + e.UNDERSCORE_IDENT_RE + "\\s*(?=[:+?]?=)" }, o = {
    className: "meta",
    begin: /^\.PHONY:/,
    end: /$/,
    keywords: {
      $pattern: /[\.\w]+/,
      keyword: ".PHONY"
    }
  }, a = {
    className: "section",
    begin: /^[^\s]+:/,
    end: /$/,
    contains: [n]
  };
  return {
    name: "Makefile",
    aliases: [
      "mk",
      "mak",
      "make"
    ],
    keywords: {
      $pattern: /[\w-]+/,
      keyword: "define endef undefine ifdef ifndef ifeq ifneq else endif include -include sinclude override export unexport private vpath"
    },
    contains: [
      e.HASH_COMMENT_MODE,
      n,
      t,
      r,
      i,
      o,
      a
    ]
  };
}
function Bg(e) {
  const n = e.regex, t = {
    begin: /<\/?[A-Za-z_]/,
    end: ">",
    subLanguage: "xml",
    relevance: 0
  }, r = {
    begin: "^[-\\*]{3,}",
    end: "$"
  }, i = {
    className: "code",
    variants: [
      // TODO: fix to allow these to work with sublanguage also
      { begin: "(`{3,})[^`](.|\\n)*?\\1`*[ ]*" },
      { begin: "(~{3,})[^~](.|\\n)*?\\1~*[ ]*" },
      // needed to allow markdown as a sublanguage to work
      {
        begin: "```",
        end: "```+[ ]*$"
      },
      {
        begin: "~~~",
        end: "~~~+[ ]*$"
      },
      { begin: "`.+?`" },
      {
        begin: "(?=^( {4}|\\t))",
        // use contains to gobble up multiple lines to allow the block to be whatever size
        // but only have a single open/close tag vs one per line
        contains: [
          {
            begin: "^( {4}|\\t)",
            end: "(\\n)$"
          }
        ],
        relevance: 0
      }
    ]
  }, o = {
    className: "bullet",
    begin: "^[ 	]*([*+-]|(\\d+\\.))(?=\\s+)",
    end: "\\s+",
    excludeEnd: !0
  }, a = {
    begin: /^\[[^\n]+\]:/,
    returnBegin: !0,
    contains: [
      {
        className: "symbol",
        begin: /\[/,
        end: /\]/,
        excludeBegin: !0,
        excludeEnd: !0
      },
      {
        className: "link",
        begin: /:\s*/,
        end: /$/,
        excludeBegin: !0
      }
    ]
  }, s = /[A-Za-z][A-Za-z0-9+.-]*/, l = {
    variants: [
      // too much like nested array access in so many languages
      // to have any real relevance
      {
        begin: /\[.+?\]\[.*?\]/,
        relevance: 0
      },
      // popular internet URLs
      {
        begin: /\[.+?\]\(((data|javascript|mailto):|(?:http|ftp)s?:\/\/).*?\)/,
        relevance: 2
      },
      {
        begin: n.concat(/\[.+?\]\(/, s, /:\/\/.*?\)/),
        relevance: 2
      },
      // relative urls
      {
        begin: /\[.+?\]\([./?&#].*?\)/,
        relevance: 1
      },
      // whatever else, lower relevance (might not be a link at all)
      {
        begin: /\[.*?\]\(.*?\)/,
        relevance: 0
      }
    ],
    returnBegin: !0,
    contains: [
      {
        // empty strings for alt or link text
        match: /\[(?=\])/
      },
      {
        className: "string",
        relevance: 0,
        begin: "\\[",
        end: "\\]",
        excludeBegin: !0,
        returnEnd: !0
      },
      {
        className: "link",
        relevance: 0,
        begin: "\\]\\(",
        end: "\\)",
        excludeBegin: !0,
        excludeEnd: !0
      },
      {
        className: "symbol",
        relevance: 0,
        begin: "\\]\\[",
        end: "\\]",
        excludeBegin: !0,
        excludeEnd: !0
      }
    ]
  }, c = {
    className: "strong",
    contains: [],
    // defined later
    variants: [
      {
        begin: /_{2}(?!\s)/,
        end: /_{2}/
      },
      {
        begin: /\*{2}(?!\s)/,
        end: /\*{2}/
      }
    ]
  }, d = {
    className: "emphasis",
    contains: [],
    // defined later
    variants: [
      {
        begin: /\*(?![*\s])/,
        end: /\*/
      },
      {
        begin: /_(?![_\s])/,
        end: /_/,
        relevance: 0
      }
    ]
  }, u = e.inherit(c, { contains: [] }), p = e.inherit(d, { contains: [] });
  c.contains.push(p), d.contains.push(u);
  let f = [
    t,
    l
  ];
  return [
    c,
    d,
    u,
    p
  ].forEach((h) => {
    h.contains = h.contains.concat(f);
  }), f = f.concat(c, d), {
    name: "Markdown",
    aliases: [
      "md",
      "mkdown",
      "mkd"
    ],
    contains: [
      {
        className: "section",
        variants: [
          {
            begin: "^#{1,6}",
            end: "$",
            contains: f
          },
          {
            begin: "(?=^.+?\\n[=-]{2,}$)",
            contains: [
              { begin: "^[=-]*$" },
              {
                begin: "^",
                end: "\\n",
                contains: f
              }
            ]
          }
        ]
      },
      t,
      o,
      c,
      d,
      {
        className: "quote",
        begin: "^>\\s+",
        contains: f,
        end: "$"
      },
      i,
      r,
      l,
      a,
      {
        //https://spec.commonmark.org/0.31.2/#entity-references
        scope: "literal",
        match: /&([a-zA-Z0-9]+|#[0-9]{1,7}|#[Xx][0-9a-fA-F]{1,6});/
      }
    ]
  };
}
function Fg(e) {
  const n = {
    className: "built_in",
    begin: "\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+"
  }, t = /[a-zA-Z@][a-zA-Z0-9_]*/, s = {
    "variable.language": [
      "this",
      "super"
    ],
    $pattern: t,
    keyword: [
      "while",
      "export",
      "sizeof",
      "typedef",
      "const",
      "struct",
      "for",
      "union",
      "volatile",
      "static",
      "mutable",
      "if",
      "do",
      "return",
      "goto",
      "enum",
      "else",
      "break",
      "extern",
      "asm",
      "case",
      "default",
      "register",
      "explicit",
      "typename",
      "switch",
      "continue",
      "inline",
      "readonly",
      "assign",
      "readwrite",
      "self",
      "@synchronized",
      "id",
      "typeof",
      "nonatomic",
      "IBOutlet",
      "IBAction",
      "strong",
      "weak",
      "copy",
      "in",
      "out",
      "inout",
      "bycopy",
      "byref",
      "oneway",
      "__strong",
      "__weak",
      "__block",
      "__autoreleasing",
      "@private",
      "@protected",
      "@public",
      "@try",
      "@property",
      "@end",
      "@throw",
      "@catch",
      "@finally",
      "@autoreleasepool",
      "@synthesize",
      "@dynamic",
      "@selector",
      "@optional",
      "@required",
      "@encode",
      "@package",
      "@import",
      "@defs",
      "@compatibility_alias",
      "__bridge",
      "__bridge_transfer",
      "__bridge_retained",
      "__bridge_retain",
      "__covariant",
      "__contravariant",
      "__kindof",
      "_Nonnull",
      "_Nullable",
      "_Null_unspecified",
      "__FUNCTION__",
      "__PRETTY_FUNCTION__",
      "__attribute__",
      "getter",
      "setter",
      "retain",
      "unsafe_unretained",
      "nonnull",
      "nullable",
      "null_unspecified",
      "null_resettable",
      "class",
      "instancetype",
      "NS_DESIGNATED_INITIALIZER",
      "NS_UNAVAILABLE",
      "NS_REQUIRES_SUPER",
      "NS_RETURNS_INNER_POINTER",
      "NS_INLINE",
      "NS_AVAILABLE",
      "NS_DEPRECATED",
      "NS_ENUM",
      "NS_OPTIONS",
      "NS_SWIFT_UNAVAILABLE",
      "NS_ASSUME_NONNULL_BEGIN",
      "NS_ASSUME_NONNULL_END",
      "NS_REFINED_FOR_SWIFT",
      "NS_SWIFT_NAME",
      "NS_SWIFT_NOTHROW",
      "NS_DURING",
      "NS_HANDLER",
      "NS_ENDHANDLER",
      "NS_VALUERETURN",
      "NS_VOIDRETURN"
    ],
    literal: [
      "false",
      "true",
      "FALSE",
      "TRUE",
      "nil",
      "YES",
      "NO",
      "NULL"
    ],
    built_in: [
      "dispatch_once_t",
      "dispatch_queue_t",
      "dispatch_sync",
      "dispatch_async",
      "dispatch_once"
    ],
    type: [
      "int",
      "float",
      "char",
      "unsigned",
      "signed",
      "short",
      "long",
      "double",
      "wchar_t",
      "unichar",
      "void",
      "bool",
      "BOOL",
      "id|0",
      "_Bool"
    ]
  }, l = {
    $pattern: t,
    keyword: [
      "@interface",
      "@class",
      "@protocol",
      "@implementation"
    ]
  };
  return {
    name: "Objective-C",
    aliases: [
      "mm",
      "objc",
      "obj-c",
      "obj-c++",
      "objective-c++"
    ],
    keywords: s,
    illegal: "</",
    contains: [
      n,
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      e.C_NUMBER_MODE,
      e.QUOTE_STRING_MODE,
      e.APOS_STRING_MODE,
      {
        className: "string",
        variants: [
          {
            begin: '@"',
            end: '"',
            illegal: "\\n",
            contains: [e.BACKSLASH_ESCAPE]
          }
        ]
      },
      {
        className: "meta",
        begin: /#\s*[a-z]+\b/,
        end: /$/,
        keywords: { keyword: "if else elif endif define undef warning error line pragma ifdef ifndef include" },
        contains: [
          {
            begin: /\\\n/,
            relevance: 0
          },
          e.inherit(e.QUOTE_STRING_MODE, { className: "string" }),
          {
            className: "string",
            begin: /<.*?>/,
            end: /$/,
            illegal: "\\n"
          },
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        className: "class",
        begin: "(" + l.keyword.join("|") + ")\\b",
        end: /(\{|$)/,
        excludeEnd: !0,
        keywords: l,
        contains: [e.UNDERSCORE_TITLE_MODE]
      },
      {
        begin: "\\." + e.UNDERSCORE_IDENT_RE,
        relevance: 0
      }
    ]
  };
}
function zg(e) {
  const n = e.regex, t = [
    "abs",
    "accept",
    "alarm",
    "and",
    "atan2",
    "bind",
    "binmode",
    "bless",
    "break",
    "caller",
    "chdir",
    "chmod",
    "chomp",
    "chop",
    "chown",
    "chr",
    "chroot",
    "class",
    "close",
    "closedir",
    "connect",
    "continue",
    "cos",
    "crypt",
    "dbmclose",
    "dbmopen",
    "defined",
    "delete",
    "die",
    "do",
    "dump",
    "each",
    "else",
    "elsif",
    "endgrent",
    "endhostent",
    "endnetent",
    "endprotoent",
    "endpwent",
    "endservent",
    "eof",
    "eval",
    "exec",
    "exists",
    "exit",
    "exp",
    "fcntl",
    "field",
    "fileno",
    "flock",
    "for",
    "foreach",
    "fork",
    "format",
    "formline",
    "getc",
    "getgrent",
    "getgrgid",
    "getgrnam",
    "gethostbyaddr",
    "gethostbyname",
    "gethostent",
    "getlogin",
    "getnetbyaddr",
    "getnetbyname",
    "getnetent",
    "getpeername",
    "getpgrp",
    "getpriority",
    "getprotobyname",
    "getprotobynumber",
    "getprotoent",
    "getpwent",
    "getpwnam",
    "getpwuid",
    "getservbyname",
    "getservbyport",
    "getservent",
    "getsockname",
    "getsockopt",
    "given",
    "glob",
    "gmtime",
    "goto",
    "grep",
    "gt",
    "hex",
    "if",
    "index",
    "int",
    "ioctl",
    "join",
    "keys",
    "kill",
    "last",
    "lc",
    "lcfirst",
    "length",
    "link",
    "listen",
    "local",
    "localtime",
    "log",
    "lstat",
    "lt",
    "ma",
    "map",
    "method",
    "mkdir",
    "msgctl",
    "msgget",
    "msgrcv",
    "msgsnd",
    "my",
    "ne",
    "next",
    "no",
    "not",
    "oct",
    "open",
    "opendir",
    "or",
    "ord",
    "our",
    "pack",
    "package",
    "pipe",
    "pop",
    "pos",
    "print",
    "printf",
    "prototype",
    "push",
    "q|0",
    "qq",
    "quotemeta",
    "qw",
    "qx",
    "rand",
    "read",
    "readdir",
    "readline",
    "readlink",
    "readpipe",
    "recv",
    "redo",
    "ref",
    "rename",
    "require",
    "reset",
    "return",
    "reverse",
    "rewinddir",
    "rindex",
    "rmdir",
    "say",
    "scalar",
    "seek",
    "seekdir",
    "select",
    "semctl",
    "semget",
    "semop",
    "send",
    "setgrent",
    "sethostent",
    "setnetent",
    "setpgrp",
    "setpriority",
    "setprotoent",
    "setpwent",
    "setservent",
    "setsockopt",
    "shift",
    "shmctl",
    "shmget",
    "shmread",
    "shmwrite",
    "shutdown",
    "sin",
    "sleep",
    "socket",
    "socketpair",
    "sort",
    "splice",
    "split",
    "sprintf",
    "sqrt",
    "srand",
    "stat",
    "state",
    "study",
    "sub",
    "substr",
    "symlink",
    "syscall",
    "sysopen",
    "sysread",
    "sysseek",
    "system",
    "syswrite",
    "tell",
    "telldir",
    "tie",
    "tied",
    "time",
    "times",
    "tr",
    "truncate",
    "uc",
    "ucfirst",
    "umask",
    "undef",
    "unless",
    "unlink",
    "unpack",
    "unshift",
    "untie",
    "until",
    "use",
    "utime",
    "values",
    "vec",
    "wait",
    "waitpid",
    "wantarray",
    "warn",
    "when",
    "while",
    "write",
    "x|0",
    "xor",
    "y|0"
  ], r = /[dualxmsipngr]{0,12}/, i = {
    $pattern: /[\w.]+/,
    keyword: t.join(" ")
  }, o = {
    className: "subst",
    begin: "[$@]\\{",
    end: "\\}",
    keywords: i
  }, a = {
    begin: /->\{/,
    end: /\}/
    // contains defined later
  }, s = {
    scope: "attr",
    match: /\s+:\s*\w+(\s*\(.*?\))?/
  }, l = {
    scope: "variable",
    variants: [
      { begin: /\$\d/ },
      {
        begin: n.concat(
          /[$%@](?!")(\^\w\b|#\w+(::\w+)*|\{\w+\}|\w+(::\w*)*)/,
          // negative look-ahead tries to avoid matching patterns that are not
          // Perl at all like $ident$, @ident@, etc.
          "(?![A-Za-z])(?![@$%])"
        )
      },
      {
        // Only $= is a special Perl variable and one can't declare @= or %=.
        begin: /[$%@](?!")[^\s\w{=]|\$=/,
        relevance: 0
      }
    ],
    contains: [s]
  }, c = {
    className: "number",
    variants: [
      // decimal numbers:
      // include the case where a number starts with a dot (eg. .9), and
      // the leading 0? avoids mixing the first and second match on 0.x cases
      { match: /0?\.[0-9][0-9_]+\b/ },
      // include the special versioned number (eg. v5.38)
      { match: /\bv?(0|[1-9][0-9_]*(\.[0-9_]+)?|[1-9][0-9_]*)\b/ },
      // non-decimal numbers:
      { match: /\b0[0-7][0-7_]*\b/ },
      { match: /\b0x[0-9a-fA-F][0-9a-fA-F_]*\b/ },
      { match: /\b0b[0-1][0-1_]*\b/ }
    ],
    relevance: 0
  }, d = [
    e.BACKSLASH_ESCAPE,
    o,
    l
  ], u = [
    /!/,
    /\//,
    /\|/,
    /\?/,
    /'/,
    /"/,
    // valid but infrequent and weird
    /#/
    // valid but infrequent and weird
  ], p = (E, _, h = "\\1") => {
    const N = h === "\\1" ? h : n.concat(h, _);
    return n.concat(
      n.concat("(?:", E, ")"),
      _,
      /(?:\\.|[^\\\/])*?/,
      N,
      /(?:\\.|[^\\\/])*?/,
      h,
      r
    );
  }, f = (E, _, h) => n.concat(
    n.concat("(?:", E, ")"),
    _,
    /(?:\\.|[^\\\/])*?/,
    h,
    r
  ), g = [
    l,
    e.HASH_COMMENT_MODE,
    e.COMMENT(
      /^=\w/,
      /=cut/,
      { endsWithParent: !0 }
    ),
    a,
    {
      className: "string",
      contains: d,
      variants: [
        {
          begin: "q[qwxr]?\\s*\\(",
          end: "\\)",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\[",
          end: "\\]",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\{",
          end: "\\}",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\|",
          end: "\\|",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*<",
          end: ">",
          relevance: 5
        },
        {
          begin: "qw\\s+q",
          end: "q",
          relevance: 5
        },
        {
          begin: "'",
          end: "'",
          contains: [e.BACKSLASH_ESCAPE]
        },
        {
          begin: '"',
          end: '"'
        },
        {
          begin: "`",
          end: "`",
          contains: [e.BACKSLASH_ESCAPE]
        },
        {
          begin: /\{\w+\}/,
          relevance: 0
        },
        {
          begin: "-?\\w+\\s*=>",
          relevance: 0
        }
      ]
    },
    c,
    {
      // regexp container
      begin: "(\\/\\/|" + e.RE_STARTERS_RE + "|\\b(split|return|print|reverse|grep)\\b)\\s*",
      keywords: "split return print reverse grep",
      relevance: 0,
      contains: [
        e.HASH_COMMENT_MODE,
        {
          className: "regexp",
          variants: [
            // allow matching common delimiters
            { begin: p("s|tr|y", n.either(...u, { capture: !0 })) },
            // and then paired delmis
            { begin: p("s|tr|y", "\\(", "\\)") },
            { begin: p("s|tr|y", "\\[", "\\]") },
            { begin: p("s|tr|y", "\\{", "\\}") }
          ],
          relevance: 2
        },
        {
          className: "regexp",
          variants: [
            {
              // could be a comment in many languages so do not count
              // as relevant
              begin: /(m|qr)\/\//,
              relevance: 0
            },
            // prefix is optional with /regex/
            { begin: f("(?:m|qr)?", /\//, /\//) },
            // allow matching common delimiters
            { begin: f("m|qr", n.either(...u, { capture: !0 }), /\1/) },
            // allow common paired delmins
            { begin: f("m|qr", /\(/, /\)/) },
            { begin: f("m|qr", /\[/, /\]/) },
            { begin: f("m|qr", /\{/, /\}/) }
          ]
        }
      ]
    },
    {
      className: "function",
      beginKeywords: "sub method",
      end: "(\\s*\\(.*?\\))?[;{]",
      excludeEnd: !0,
      relevance: 5,
      contains: [e.TITLE_MODE, s]
    },
    {
      className: "class",
      beginKeywords: "class",
      end: "[;{]",
      excludeEnd: !0,
      relevance: 5,
      contains: [e.TITLE_MODE, s, c]
    },
    {
      begin: "-\\w\\b",
      relevance: 0
    },
    {
      begin: "^__DATA__$",
      end: "^__END__$",
      subLanguage: "mojolicious",
      contains: [
        {
          begin: "^@@.*",
          end: "$",
          className: "comment"
        }
      ]
    }
  ];
  return o.contains = g, a.contains = g, {
    name: "Perl",
    aliases: [
      "pl",
      "pm"
    ],
    keywords: i,
    contains: g
  };
}
function Ug(e) {
  const n = e.regex, t = /(?![A-Za-z0-9])(?![$])/, r = n.concat(
    /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
    t
  ), i = n.concat(
    /(\\?[A-Z][a-z0-9_\x7f-\xff]+|\\?[A-Z]+(?=[A-Z][a-z0-9_\x7f-\xff])){1,}/,
    t
  ), o = n.concat(
    /[A-Z]+/,
    t
  ), a = {
    scope: "variable",
    match: "\\$+" + r
  }, s = {
    scope: "meta",
    variants: [
      { begin: /<\?php/, relevance: 10 },
      // boost for obvious PHP
      { begin: /<\?=/ },
      // less relevant per PSR-1 which says not to use short-tags
      { begin: /<\?/, relevance: 0.1 },
      { begin: /\?>/ }
      // end php tag
    ]
  }, l = {
    scope: "subst",
    variants: [
      { begin: /\$\w+/ },
      {
        begin: /\{\$/,
        end: /\}/
      }
    ]
  }, c = e.inherit(e.APOS_STRING_MODE, { illegal: null }), d = e.inherit(e.QUOTE_STRING_MODE, {
    illegal: null,
    contains: e.QUOTE_STRING_MODE.contains.concat(l)
  }), u = {
    begin: /<<<[ \t]*(?:(\w+)|"(\w+)")\n/,
    end: /[ \t]*(\w+)\b/,
    contains: e.QUOTE_STRING_MODE.contains.concat(l),
    "on:begin": (z, O) => {
      O.data._beginMatch = z[1] || z[2];
    },
    "on:end": (z, O) => {
      O.data._beginMatch !== z[1] && O.ignoreMatch();
    }
  }, p = e.END_SAME_AS_BEGIN({
    begin: /<<<[ \t]*'(\w+)'\n/,
    end: /[ \t]*(\w+)\b/
  }), f = `[ 	
]`, g = {
    scope: "string",
    variants: [
      d,
      c,
      u,
      p
    ]
  }, E = {
    scope: "number",
    variants: [
      { begin: "\\b0[bB][01]+(?:_[01]+)*\\b" },
      // Binary w/ underscore support
      { begin: "\\b0[oO][0-7]+(?:_[0-7]+)*\\b" },
      // Octals w/ underscore support
      { begin: "\\b0[xX][\\da-fA-F]+(?:_[\\da-fA-F]+)*\\b" },
      // Hex w/ underscore support
      // Decimals w/ underscore support, with optional fragments and scientific exponent (e) suffix.
      { begin: "(?:\\b\\d+(?:_\\d+)*(\\.(?:\\d+(?:_\\d+)*))?|\\B\\.\\d+)(?:[eE][+-]?\\d+)?" }
    ],
    relevance: 0
  }, _ = [
    "false",
    "null",
    "true"
  ], h = [
    // Magic constants:
    // <https://www.php.net/manual/en/language.constants.predefined.php>
    "__CLASS__",
    "__DIR__",
    "__FILE__",
    "__FUNCTION__",
    "__COMPILER_HALT_OFFSET__",
    "__LINE__",
    "__METHOD__",
    "__NAMESPACE__",
    "__TRAIT__",
    // Function that look like language construct or language construct that look like function:
    // List of keywords that may not require parenthesis
    "die",
    "echo",
    "exit",
    "include",
    "include_once",
    "print",
    "require",
    "require_once",
    // These are not language construct (function) but operate on the currently-executing function and can access the current symbol table
    // 'compact extract func_get_arg func_get_args func_num_args get_called_class get_parent_class ' +
    // Other keywords:
    // <https://www.php.net/manual/en/reserved.php>
    // <https://www.php.net/manual/en/language.types.type-juggling.php>
    "array",
    "abstract",
    "and",
    "as",
    "binary",
    "bool",
    "boolean",
    "break",
    "callable",
    "case",
    "catch",
    "class",
    "clone",
    "const",
    "continue",
    "declare",
    "default",
    "do",
    "double",
    "else",
    "elseif",
    "empty",
    "enddeclare",
    "endfor",
    "endforeach",
    "endif",
    "endswitch",
    "endwhile",
    "enum",
    "eval",
    "extends",
    "final",
    "finally",
    "float",
    "for",
    "foreach",
    "from",
    "global",
    "goto",
    "if",
    "implements",
    "instanceof",
    "insteadof",
    "int",
    "integer",
    "interface",
    "isset",
    "iterable",
    "list",
    "match|0",
    "mixed",
    "new",
    "never",
    "object",
    "or",
    "private",
    "protected",
    "public",
    "readonly",
    "real",
    "return",
    "string",
    "switch",
    "throw",
    "trait",
    "try",
    "unset",
    "use",
    "var",
    "void",
    "while",
    "xor",
    "yield"
  ], N = [
    // Standard PHP library:
    // <https://www.php.net/manual/en/book.spl.php>
    "Error|0",
    "AppendIterator",
    "ArgumentCountError",
    "ArithmeticError",
    "ArrayIterator",
    "ArrayObject",
    "AssertionError",
    "BadFunctionCallException",
    "BadMethodCallException",
    "CachingIterator",
    "CallbackFilterIterator",
    "CompileError",
    "Countable",
    "DirectoryIterator",
    "DivisionByZeroError",
    "DomainException",
    "EmptyIterator",
    "ErrorException",
    "Exception",
    "FilesystemIterator",
    "FilterIterator",
    "GlobIterator",
    "InfiniteIterator",
    "InvalidArgumentException",
    "IteratorIterator",
    "LengthException",
    "LimitIterator",
    "LogicException",
    "MultipleIterator",
    "NoRewindIterator",
    "OutOfBoundsException",
    "OutOfRangeException",
    "OuterIterator",
    "OverflowException",
    "ParentIterator",
    "ParseError",
    "RangeException",
    "RecursiveArrayIterator",
    "RecursiveCachingIterator",
    "RecursiveCallbackFilterIterator",
    "RecursiveDirectoryIterator",
    "RecursiveFilterIterator",
    "RecursiveIterator",
    "RecursiveIteratorIterator",
    "RecursiveRegexIterator",
    "RecursiveTreeIterator",
    "RegexIterator",
    "RuntimeException",
    "SeekableIterator",
    "SplDoublyLinkedList",
    "SplFileInfo",
    "SplFileObject",
    "SplFixedArray",
    "SplHeap",
    "SplMaxHeap",
    "SplMinHeap",
    "SplObjectStorage",
    "SplObserver",
    "SplPriorityQueue",
    "SplQueue",
    "SplStack",
    "SplSubject",
    "SplTempFileObject",
    "TypeError",
    "UnderflowException",
    "UnexpectedValueException",
    "UnhandledMatchError",
    // Reserved interfaces:
    // <https://www.php.net/manual/en/reserved.interfaces.php>
    "ArrayAccess",
    "BackedEnum",
    "Closure",
    "Fiber",
    "Generator",
    "Iterator",
    "IteratorAggregate",
    "Serializable",
    "Stringable",
    "Throwable",
    "Traversable",
    "UnitEnum",
    "WeakReference",
    "WeakMap",
    // Reserved classes:
    // <https://www.php.net/manual/en/reserved.classes.php>
    "Directory",
    "__PHP_Incomplete_Class",
    "parent",
    "php_user_filter",
    "self",
    "static",
    "stdClass"
  ], v = {
    keyword: h,
    literal: ((z) => {
      const O = [];
      return z.forEach((X) => {
        O.push(X), X.toLowerCase() === X ? O.push(X.toUpperCase()) : O.push(X.toLowerCase());
      }), O;
    })(_),
    built_in: N
  }, I = (z) => z.map((O) => O.replace(/\|\d+$/, "")), w = { variants: [
    {
      match: [
        /new/,
        n.concat(f, "+"),
        // to prevent built ins from being confused as the class constructor call
        n.concat("(?!", I(N).join("\\b|"), "\\b)"),
        i
      ],
      scope: {
        1: "keyword",
        4: "title.class"
      }
    }
  ] }, P = n.concat(r, "\\b(?!\\()"), C = { variants: [
    {
      match: [
        n.concat(
          /::/,
          n.lookahead(/(?!class\b)/)
        ),
        P
      ],
      scope: { 2: "variable.constant" }
    },
    {
      match: [
        /::/,
        /class/
      ],
      scope: { 2: "variable.language" }
    },
    {
      match: [
        i,
        n.concat(
          /::/,
          n.lookahead(/(?!class\b)/)
        ),
        P
      ],
      scope: {
        1: "title.class",
        3: "variable.constant"
      }
    },
    {
      match: [
        i,
        n.concat(
          "::",
          n.lookahead(/(?!class\b)/)
        )
      ],
      scope: { 1: "title.class" }
    },
    {
      match: [
        i,
        /::/,
        /class/
      ],
      scope: {
        1: "title.class",
        3: "variable.language"
      }
    }
  ] }, B = {
    scope: "attr",
    match: n.concat(r, n.lookahead(":"), n.lookahead(/(?!::)/))
  }, x = {
    relevance: 0,
    begin: /\(/,
    end: /\)/,
    keywords: v,
    contains: [
      B,
      a,
      C,
      e.C_BLOCK_COMMENT_MODE,
      g,
      E,
      w
    ]
  }, D = {
    relevance: 0,
    match: [
      /\b/,
      // to prevent keywords from being confused as the function title
      n.concat("(?!fn\\b|function\\b|", I(h).join("\\b|"), "|", I(N).join("\\b|"), "\\b)"),
      r,
      n.concat(f, "*"),
      n.lookahead(/(?=\()/)
    ],
    scope: { 3: "title.function.invoke" },
    contains: [x]
  };
  x.contains.push(D);
  const $ = [
    B,
    C,
    e.C_BLOCK_COMMENT_MODE,
    g,
    E,
    w
  ], ne = {
    begin: n.concat(
      /#\[\s*\\?/,
      n.either(
        i,
        o
      )
    ),
    beginScope: "meta",
    end: /]/,
    endScope: "meta",
    keywords: {
      literal: _,
      keyword: [
        "new",
        "array"
      ]
    },
    contains: [
      {
        begin: /\[/,
        end: /]/,
        keywords: {
          literal: _,
          keyword: [
            "new",
            "array"
          ]
        },
        contains: [
          "self",
          ...$
        ]
      },
      ...$,
      {
        scope: "meta",
        variants: [
          { match: i },
          { match: o }
        ]
      }
    ]
  };
  return {
    case_insensitive: !1,
    keywords: v,
    contains: [
      ne,
      e.HASH_COMMENT_MODE,
      e.COMMENT("//", "$"),
      e.COMMENT(
        "/\\*",
        "\\*/",
        { contains: [
          {
            scope: "doctag",
            match: "@[A-Za-z]+"
          }
        ] }
      ),
      {
        match: /__halt_compiler\(\);/,
        keywords: "__halt_compiler",
        starts: {
          scope: "comment",
          end: e.MATCH_NOTHING_RE,
          contains: [
            {
              match: /\?>/,
              scope: "meta",
              endsParent: !0
            }
          ]
        }
      },
      s,
      {
        scope: "variable.language",
        match: /\$this\b/
      },
      a,
      D,
      C,
      {
        match: [
          /const/,
          /\s/,
          r
        ],
        scope: {
          1: "keyword",
          3: "variable.constant"
        }
      },
      w,
      {
        scope: "function",
        relevance: 0,
        beginKeywords: "fn function",
        end: /[;{]/,
        excludeEnd: !0,
        illegal: "[$%\\[]",
        contains: [
          { beginKeywords: "use" },
          e.UNDERSCORE_TITLE_MODE,
          {
            begin: "=>",
            // No markup, just a relevance booster
            endsParent: !0
          },
          {
            scope: "params",
            begin: "\\(",
            end: "\\)",
            excludeBegin: !0,
            excludeEnd: !0,
            keywords: v,
            contains: [
              "self",
              ne,
              a,
              C,
              e.C_BLOCK_COMMENT_MODE,
              g,
              E
            ]
          }
        ]
      },
      {
        scope: "class",
        variants: [
          {
            beginKeywords: "enum",
            illegal: /[($"]/
          },
          {
            beginKeywords: "class interface trait",
            illegal: /[:($"]/
          }
        ],
        relevance: 0,
        end: /\{/,
        excludeEnd: !0,
        contains: [
          { beginKeywords: "extends implements" },
          e.UNDERSCORE_TITLE_MODE
        ]
      },
      // both use and namespace still use "old style" rules (vs multi-match)
      // because the namespace name can include `\` and we still want each
      // element to be treated as its own *individual* title
      {
        beginKeywords: "namespace",
        relevance: 0,
        end: ";",
        illegal: /[.']/,
        contains: [e.inherit(e.UNDERSCORE_TITLE_MODE, { scope: "title.class" })]
      },
      {
        beginKeywords: "use",
        relevance: 0,
        end: ";",
        contains: [
          // TODO: title.function vs title.class
          {
            match: /\b(as|const|function)\b/,
            scope: "keyword"
          },
          // TODO: could be title.class or title.function
          e.UNDERSCORE_TITLE_MODE
        ]
      },
      g,
      E
    ]
  };
}
function $g(e) {
  return {
    name: "PHP template",
    subLanguage: "xml",
    contains: [
      {
        begin: /<\?(php|=)?/,
        end: /\?>/,
        subLanguage: "php",
        contains: [
          // We don't want the php closing tag ?> to close the PHP block when
          // inside any of the following blocks:
          {
            begin: "/\\*",
            end: "\\*/",
            skip: !0
          },
          {
            begin: 'b"',
            end: '"',
            skip: !0
          },
          {
            begin: "b'",
            end: "'",
            skip: !0
          },
          e.inherit(e.APOS_STRING_MODE, {
            illegal: null,
            className: null,
            contains: null,
            skip: !0
          }),
          e.inherit(e.QUOTE_STRING_MODE, {
            illegal: null,
            className: null,
            contains: null,
            skip: !0
          })
        ]
      }
    ]
  };
}
function Hg(e) {
  return {
    name: "Plain text",
    aliases: [
      "text",
      "txt"
    ],
    disableAutodetect: !0
  };
}
function Gg(e) {
  const n = e.regex, t = new RegExp("[\\p{XID_Start}_]\\p{XID_Continue}*", "u"), r = [
    "and",
    "as",
    "assert",
    "async",
    "await",
    "break",
    "case",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "finally",
    "for",
    "from",
    "global",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "match",
    "nonlocal|10",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "try",
    "while",
    "with",
    "yield"
  ], s = {
    $pattern: /[A-Za-z]\w+|__\w+__/,
    keyword: r,
    built_in: [
      "__import__",
      "abs",
      "all",
      "any",
      "ascii",
      "bin",
      "bool",
      "breakpoint",
      "bytearray",
      "bytes",
      "callable",
      "chr",
      "classmethod",
      "compile",
      "complex",
      "delattr",
      "dict",
      "dir",
      "divmod",
      "enumerate",
      "eval",
      "exec",
      "filter",
      "float",
      "format",
      "frozenset",
      "getattr",
      "globals",
      "hasattr",
      "hash",
      "help",
      "hex",
      "id",
      "input",
      "int",
      "isinstance",
      "issubclass",
      "iter",
      "len",
      "list",
      "locals",
      "map",
      "max",
      "memoryview",
      "min",
      "next",
      "object",
      "oct",
      "open",
      "ord",
      "pow",
      "print",
      "property",
      "range",
      "repr",
      "reversed",
      "round",
      "set",
      "setattr",
      "slice",
      "sorted",
      "staticmethod",
      "str",
      "sum",
      "super",
      "tuple",
      "type",
      "vars",
      "zip"
    ],
    literal: [
      "__debug__",
      "Ellipsis",
      "False",
      "None",
      "NotImplemented",
      "True"
    ],
    type: [
      "Any",
      "Callable",
      "Coroutine",
      "Dict",
      "List",
      "Literal",
      "Generic",
      "Optional",
      "Sequence",
      "Set",
      "Tuple",
      "Type",
      "Union"
    ]
  }, l = {
    className: "meta",
    begin: /^(>>>|\.\.\.) /
  }, c = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: s,
    illegal: /#/
  }, d = {
    begin: /\{\{/,
    relevance: 0
  }, u = {
    className: "string",
    contains: [e.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          l
        ],
        relevance: 10
      },
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          l
        ],
        relevance: 10
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          l,
          d,
          c
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          l,
          d,
          c
        ]
      },
      {
        begin: /([uU]|[rR])'/,
        end: /'/,
        relevance: 10
      },
      {
        begin: /([uU]|[rR])"/,
        end: /"/,
        relevance: 10
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])'/,
        end: /'/
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])"/,
        end: /"/
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'/,
        end: /'/,
        contains: [
          e.BACKSLASH_ESCAPE,
          d,
          c
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"/,
        end: /"/,
        contains: [
          e.BACKSLASH_ESCAPE,
          d,
          c
        ]
      },
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE
    ]
  }, p = "[0-9](_?[0-9])*", f = `(\\b(${p}))?\\.(${p})|\\b(${p})\\.`, g = `\\b|${r.join("|")}`, E = {
    className: "number",
    relevance: 0,
    variants: [
      // exponentfloat, pointfloat
      // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
      // optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      // Note: no leading \b because floats can start with a decimal point
      // and we don't want to mishandle e.g. `fn(.5)`,
      // no trailing \b for pointfloat because it can end with a decimal point
      // and we don't want to mishandle e.g. `0..hex()`; this should be safe
      // because both MUST contain a decimal point and so cannot be confused with
      // the interior part of an identifier
      {
        begin: `(\\b(${p})|(${f}))[eE][+-]?(${p})[jJ]?(?=${g})`
      },
      {
        begin: `(${f})[jJ]?`
      },
      // decinteger, bininteger, octinteger, hexinteger
      // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
      // optionally "long" in Python 2
      // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
      // decinteger is optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${g})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${g})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${g})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${g})`
      },
      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${p})[jJ](?=${g})`
      }
    ]
  }, _ = {
    className: "comment",
    begin: n.lookahead(/# type:/),
    end: /$/,
    keywords: s,
    contains: [
      {
        // prevent keywords from coloring `type`
        begin: /# type:/
      },
      // comment within a datatype comment includes no keywords
      {
        begin: /#/,
        end: /\b\B/,
        endsWithParent: !0
      }
    ]
  }, h = {
    className: "params",
    variants: [
      // Exclude params in functions without params
      {
        className: "",
        begin: /\(\s*\)/,
        skip: !0
      },
      {
        begin: /\(/,
        end: /\)/,
        excludeBegin: !0,
        excludeEnd: !0,
        keywords: s,
        contains: [
          "self",
          l,
          E,
          u,
          e.HASH_COMMENT_MODE
        ]
      }
    ]
  };
  return c.contains = [
    u,
    E,
    l
  ], {
    name: "Python",
    aliases: [
      "py",
      "gyp",
      "ipython"
    ],
    unicodeRegex: !0,
    keywords: s,
    illegal: /(<\/|\?)|=>/,
    contains: [
      l,
      E,
      {
        // very common convention
        scope: "variable.language",
        match: /\bself\b/
      },
      {
        // eat "if" prior to string so that it won't accidentally be
        // labeled as an f-string
        beginKeywords: "if",
        relevance: 0
      },
      { match: /\bor\b/, scope: "keyword" },
      u,
      _,
      e.HASH_COMMENT_MODE,
      {
        match: [
          /\bdef/,
          /\s+/,
          t
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        },
        contains: [h]
      },
      {
        variants: [
          {
            match: [
              /\bclass/,
              /\s+/,
              t,
              /\s*/,
              /\(\s*/,
              t,
              /\s*\)/
            ]
          },
          {
            match: [
              /\bclass/,
              /\s+/,
              t
            ]
          }
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          6: "title.class.inherited"
        }
      },
      {
        className: "meta",
        begin: /^[\t ]*@/,
        end: /(?=#)|$/,
        contains: [
          E,
          h,
          u
        ]
      }
    ]
  };
}
function qg(e) {
  return {
    aliases: ["pycon"],
    contains: [
      {
        className: "meta.prompt",
        starts: {
          // a space separates the REPL prefix from the actual code
          // this is purely for cleaner HTML output
          end: / |$/,
          starts: {
            end: "$",
            subLanguage: "python"
          }
        },
        variants: [
          { begin: /^>>>(?=[ ]|$)/ },
          { begin: /^\.\.\.(?=[ ]|$)/ }
        ]
      }
    ]
  };
}
function Kg(e) {
  const n = e.regex, t = /(?:(?:[a-zA-Z]|\.[._a-zA-Z])[._a-zA-Z0-9]*)|\.(?!\d)/, r = n.either(
    // Special case: only hexadecimal binary powers can contain fractions
    /0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/,
    // Hexadecimal numbers without fraction and optional binary power
    /0[xX][0-9a-fA-F]+(?:[pP][+-]?\d+)?[Li]?/,
    // Decimal numbers
    /(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?[Li]?/
  ), i = /[=!<>:]=|\|\||&&|:::?|<-|<<-|->>|->|\|>|[-+*\/?!$&|:<=>@^~]|\*\*/, o = n.either(
    /[()]/,
    /[{}]/,
    /\[\[/,
    /[[\]]/,
    /\\/,
    /,/
  );
  return {
    name: "R",
    keywords: {
      $pattern: t,
      keyword: "function if in break next repeat else for while",
      literal: "NULL NA TRUE FALSE Inf NaN NA_integer_|10 NA_real_|10 NA_character_|10 NA_complex_|10",
      built_in: (
        // Builtin constants
        "LETTERS letters month.abb month.name pi T F abs acos acosh all any anyNA Arg as.call as.character as.complex as.double as.environment as.integer as.logical as.null.default as.numeric as.raw asin asinh atan atanh attr attributes baseenv browser c call ceiling class Conj cos cosh cospi cummax cummin cumprod cumsum digamma dim dimnames emptyenv exp expression floor forceAndCall gamma gc.time globalenv Im interactive invisible is.array is.atomic is.call is.character is.complex is.double is.environment is.expression is.finite is.function is.infinite is.integer is.language is.list is.logical is.matrix is.na is.name is.nan is.null is.numeric is.object is.pairlist is.raw is.recursive is.single is.symbol lazyLoadDBfetch length lgamma list log max min missing Mod names nargs nzchar oldClass on.exit pos.to.env proc.time prod quote range Re rep retracemem return round seq_along seq_len seq.int sign signif sin sinh sinpi sqrt standardGeneric substitute sum switch tan tanh tanpi tracemem trigamma trunc unclass untracemem UseMethod xtfrm"
      )
    },
    contains: [
      // Roxygen comments
      e.COMMENT(
        /#'/,
        /$/,
        { contains: [
          {
            // Handle `@examples` separately to cause all subsequent code
            // until the next `@`-tag on its own line to be kept as-is,
            // preventing highlighting. This code is example R code, so nested
            // doctags shouldn’t be treated as such. See
            // `test/markup/r/roxygen.txt` for an example.
            scope: "doctag",
            match: /@examples/,
            starts: {
              end: n.lookahead(n.either(
                // end if another doc comment
                /\n^#'\s*(?=@[a-zA-Z]+)/,
                // or a line with no comment
                /\n^(?!#')/
              )),
              endsParent: !0
            }
          },
          {
            // Handle `@param` to highlight the parameter name following
            // after.
            scope: "doctag",
            begin: "@param",
            end: /$/,
            contains: [
              {
                scope: "variable",
                variants: [
                  { match: t },
                  { match: /`(?:\\.|[^`\\])+`/ }
                ],
                endsParent: !0
              }
            ]
          },
          {
            scope: "doctag",
            match: /@[a-zA-Z]+/
          },
          {
            scope: "keyword",
            match: /\\[a-zA-Z]+/
          }
        ] }
      ),
      e.HASH_COMMENT_MODE,
      {
        scope: "string",
        contains: [e.BACKSLASH_ESCAPE],
        variants: [
          e.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\(/,
            end: /\)(-*)"/
          }),
          e.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\{/,
            end: /\}(-*)"/
          }),
          e.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\[/,
            end: /\](-*)"/
          }),
          e.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\(/,
            end: /\)(-*)'/
          }),
          e.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\{/,
            end: /\}(-*)'/
          }),
          e.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\[/,
            end: /\](-*)'/
          }),
          {
            begin: '"',
            end: '"',
            relevance: 0
          },
          {
            begin: "'",
            end: "'",
            relevance: 0
          }
        ]
      },
      // Matching numbers immediately following punctuation and operators is
      // tricky since we need to look at the character ahead of a number to
      // ensure the number is not part of an identifier, and we cannot use
      // negative look-behind assertions. So instead we explicitly handle all
      // possible combinations of (operator|punctuation), number.
      // TODO: replace with negative look-behind when available
      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/ },
      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+([pP][+-]?\d+)?[Li]?/ },
      // { begin: /(?<![a-zA-Z0-9._])(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?[Li]?/ }
      {
        relevance: 0,
        variants: [
          {
            scope: {
              1: "operator",
              2: "number"
            },
            match: [
              i,
              r
            ]
          },
          {
            scope: {
              1: "operator",
              2: "number"
            },
            match: [
              /%[^%]*%/,
              r
            ]
          },
          {
            scope: {
              1: "punctuation",
              2: "number"
            },
            match: [
              o,
              r
            ]
          },
          {
            scope: { 2: "number" },
            match: [
              /[^a-zA-Z0-9._]|^/,
              // not part of an identifier, or start of document
              r
            ]
          }
        ]
      },
      // Operators/punctuation when they're not directly followed by numbers
      {
        // Relevance boost for the most common assignment form.
        scope: { 3: "operator" },
        match: [
          t,
          /\s+/,
          /<-/,
          /\s+/
        ]
      },
      {
        scope: "operator",
        relevance: 0,
        variants: [
          { match: i },
          { match: /%[^%]*%/ }
        ]
      },
      {
        scope: "punctuation",
        relevance: 0,
        match: o
      },
      {
        // Escaped identifier
        begin: "`",
        end: "`",
        contains: [{ begin: /\\./ }]
      }
    ]
  };
}
function Wg(e) {
  const n = e.regex, t = "([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)", r = n.either(
    /\b([A-Z]+[a-z0-9]+)+/,
    // ends in caps
    /\b([A-Z]+[a-z0-9]+)+[A-Z]+/
  ), i = n.concat(r, /(::\w+)*/), a = {
    "variable.constant": [
      "__FILE__",
      "__LINE__",
      "__ENCODING__"
    ],
    "variable.language": [
      "self",
      "super"
    ],
    keyword: [
      "alias",
      "and",
      "begin",
      "BEGIN",
      "break",
      "case",
      "class",
      "defined",
      "do",
      "else",
      "elsif",
      "end",
      "END",
      "ensure",
      "for",
      "if",
      "in",
      "module",
      "next",
      "not",
      "or",
      "redo",
      "require",
      "rescue",
      "retry",
      "return",
      "then",
      "undef",
      "unless",
      "until",
      "when",
      "while",
      "yield",
      ...[
        "include",
        "extend",
        "prepend",
        "public",
        "private",
        "protected",
        "raise",
        "throw"
      ]
    ],
    built_in: [
      "proc",
      "lambda",
      "attr_accessor",
      "attr_reader",
      "attr_writer",
      "define_method",
      "private_constant",
      "module_function"
    ],
    literal: [
      "true",
      "false",
      "nil"
    ]
  }, s = {
    className: "doctag",
    begin: "@[A-Za-z]+"
  }, l = {
    begin: "#<",
    end: ">"
  }, c = [
    e.COMMENT(
      "#",
      "$",
      { contains: [s] }
    ),
    e.COMMENT(
      "^=begin",
      "^=end",
      {
        contains: [s],
        relevance: 10
      }
    ),
    e.COMMENT("^__END__", e.MATCH_NOTHING_RE)
  ], d = {
    className: "subst",
    begin: /#\{/,
    end: /\}/,
    keywords: a
  }, u = {
    className: "string",
    contains: [
      e.BACKSLASH_ESCAPE,
      d
    ],
    variants: [
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /"/,
        end: /"/
      },
      {
        begin: /`/,
        end: /`/
      },
      {
        begin: /%[qQwWx]?\(/,
        end: /\)/
      },
      {
        begin: /%[qQwWx]?\[/,
        end: /\]/
      },
      {
        begin: /%[qQwWx]?\{/,
        end: /\}/
      },
      {
        begin: /%[qQwWx]?</,
        end: />/
      },
      {
        begin: /%[qQwWx]?\//,
        end: /\//
      },
      {
        begin: /%[qQwWx]?%/,
        end: /%/
      },
      {
        begin: /%[qQwWx]?-/,
        end: /-/
      },
      {
        begin: /%[qQwWx]?\|/,
        end: /\|/
      },
      // in the following expressions, \B in the beginning suppresses recognition of ?-sequences
      // where ? is the last character of a preceding identifier, as in: `func?4`
      { begin: /\B\?(\\\d{1,3})/ },
      { begin: /\B\?(\\x[A-Fa-f0-9]{1,2})/ },
      { begin: /\B\?(\\u\{?[A-Fa-f0-9]{1,6}\}?)/ },
      { begin: /\B\?(\\M-\\C-|\\M-\\c|\\c\\M-|\\M-|\\C-\\M-)[\x20-\x7e]/ },
      { begin: /\B\?\\(c|C-)[\x20-\x7e]/ },
      { begin: /\B\?\\?\S/ },
      // heredocs
      {
        // this guard makes sure that we have an entire heredoc and not a false
        // positive (auto-detect, etc.)
        begin: n.concat(
          /<<[-~]?'?/,
          n.lookahead(/(\w+)(?=\W)[^\n]*\n(?:[^\n]*\n)*?\s*\1\b/)
        ),
        contains: [
          e.END_SAME_AS_BEGIN({
            begin: /(\w+)/,
            end: /(\w+)/,
            contains: [
              e.BACKSLASH_ESCAPE,
              d
            ]
          })
        ]
      }
    ]
  }, p = "[1-9](_?[0-9])*|0", f = "[0-9](_?[0-9])*", g = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal integer/float, optionally exponential or rational, optionally imaginary
      { begin: `\\b(${p})(\\.(${f}))?([eE][+-]?(${f})|r)?i?\\b` },
      // explicit decimal/binary/octal/hexadecimal integer,
      // optionally rational and/or imaginary
      { begin: "\\b0[dD][0-9](_?[0-9])*r?i?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*r?i?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*r?i?\\b" },
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*r?i?\\b" },
      // 0-prefixed implicit octal integer, optionally rational and/or imaginary
      { begin: "\\b0(_?[0-7])+r?i?\\b" }
    ]
  }, E = {
    variants: [
      {
        match: /\(\)/
      },
      {
        className: "params",
        begin: /\(/,
        end: /(?=\))/,
        excludeBegin: !0,
        endsParent: !0,
        keywords: a
      }
    ]
  }, w = [
    u,
    {
      variants: [
        {
          match: [
            /class\s+/,
            i,
            /\s+<\s+/,
            i
          ]
        },
        {
          match: [
            /\b(class|module)\s+/,
            i
          ]
        }
      ],
      scope: {
        2: "title.class",
        4: "title.class.inherited"
      },
      keywords: a
    },
    {
      match: [
        /(include|extend)\s+/,
        i
      ],
      scope: {
        2: "title.class"
      },
      keywords: a
    },
    {
      relevance: 0,
      match: [
        i,
        /\.new[. (]/
      ],
      scope: {
        1: "title.class"
      }
    },
    {
      relevance: 0,
      match: /\b[A-Z][A-Z_0-9]+\b/,
      className: "variable.constant"
    },
    {
      relevance: 0,
      match: r,
      scope: "title.class"
    },
    {
      match: [
        /def/,
        /\s+/,
        t
      ],
      scope: {
        1: "keyword",
        3: "title.function"
      },
      contains: [
        E
      ]
    },
    {
      // swallow namespace qualifiers before symbols
      begin: e.IDENT_RE + "::"
    },
    {
      className: "symbol",
      begin: e.UNDERSCORE_IDENT_RE + "(!|\\?)?:",
      relevance: 0
    },
    {
      className: "symbol",
      begin: ":(?!\\s)",
      contains: [
        u,
        { begin: t }
      ],
      relevance: 0
    },
    g,
    {
      // negative-look forward attempts to prevent false matches like:
      // @ident@ or $ident$ that might indicate this is not ruby at all
      className: "variable",
      begin: "(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])(?![A-Za-z])(?![@$?'])"
    },
    {
      className: "params",
      begin: /\|(?!=)/,
      end: /\|/,
      excludeBegin: !0,
      excludeEnd: !0,
      relevance: 0,
      // this could be a lot of things (in other languages) other than params
      keywords: a
    },
    {
      // regexp container
      begin: "(" + e.RE_STARTERS_RE + "|unless)\\s*",
      keywords: "unless",
      contains: [
        {
          className: "regexp",
          contains: [
            e.BACKSLASH_ESCAPE,
            d
          ],
          illegal: /\n/,
          variants: [
            {
              begin: "/",
              end: "/[a-z]*"
            },
            {
              begin: /%r\{/,
              end: /\}[a-z]*/
            },
            {
              begin: "%r\\(",
              end: "\\)[a-z]*"
            },
            {
              begin: "%r!",
              end: "![a-z]*"
            },
            {
              begin: "%r\\[",
              end: "\\][a-z]*"
            }
          ]
        }
      ].concat(l, c),
      relevance: 0
    }
  ].concat(l, c);
  d.contains = w, E.contains = w;
  const x = [
    {
      begin: /^\s*=>/,
      starts: {
        end: "$",
        contains: w
      }
    },
    {
      className: "meta.prompt",
      begin: "^(" + "[>?]>" + "|" + "[\\w#]+\\(\\w+\\):\\d+:\\d+[>*]" + "|" + "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>" + ")(?=[ ])",
      starts: {
        end: "$",
        keywords: a,
        contains: w
      }
    }
  ];
  return c.unshift(l), {
    name: "Ruby",
    aliases: [
      "rb",
      "gemspec",
      "podspec",
      "thor",
      "irb"
    ],
    keywords: a,
    illegal: /\/\*/,
    contains: [e.SHEBANG({ binary: "ruby" })].concat(x).concat(c).concat(w)
  };
}
function Vg(e) {
  const n = e.regex, t = /(r#)?/, r = n.concat(t, e.UNDERSCORE_IDENT_RE), i = n.concat(t, e.IDENT_RE), o = {
    className: "title.function.invoke",
    relevance: 0,
    begin: n.concat(
      /\b/,
      /(?!let|for|while|if|else|match\b)/,
      i,
      n.lookahead(/\s*\(/)
    )
  }, a = "([ui](8|16|32|64|128|size)|f(32|64))?", s = [
    "abstract",
    "as",
    "async",
    "await",
    "become",
    "box",
    "break",
    "const",
    "continue",
    "crate",
    "do",
    "dyn",
    "else",
    "enum",
    "extern",
    "false",
    "final",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "macro",
    "match",
    "mod",
    "move",
    "mut",
    "override",
    "priv",
    "pub",
    "ref",
    "return",
    "self",
    "Self",
    "static",
    "struct",
    "super",
    "trait",
    "true",
    "try",
    "type",
    "typeof",
    "union",
    "unsafe",
    "unsized",
    "use",
    "virtual",
    "where",
    "while",
    "yield"
  ], l = [
    "true",
    "false",
    "Some",
    "None",
    "Ok",
    "Err"
  ], c = [
    // functions
    "drop ",
    // traits
    "Copy",
    "Send",
    "Sized",
    "Sync",
    "Drop",
    "Fn",
    "FnMut",
    "FnOnce",
    "ToOwned",
    "Clone",
    "Debug",
    "PartialEq",
    "PartialOrd",
    "Eq",
    "Ord",
    "AsRef",
    "AsMut",
    "Into",
    "From",
    "Default",
    "Iterator",
    "Extend",
    "IntoIterator",
    "DoubleEndedIterator",
    "ExactSizeIterator",
    "SliceConcatExt",
    "ToString",
    // macros
    "assert!",
    "assert_eq!",
    "bitflags!",
    "bytes!",
    "cfg!",
    "col!",
    "concat!",
    "concat_idents!",
    "debug_assert!",
    "debug_assert_eq!",
    "env!",
    "eprintln!",
    "panic!",
    "file!",
    "format!",
    "format_args!",
    "include_bytes!",
    "include_str!",
    "line!",
    "local_data_key!",
    "module_path!",
    "option_env!",
    "print!",
    "println!",
    "select!",
    "stringify!",
    "try!",
    "unimplemented!",
    "unreachable!",
    "vec!",
    "write!",
    "writeln!",
    "macro_rules!",
    "assert_ne!",
    "debug_assert_ne!"
  ], d = [
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "isize",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "usize",
    "f32",
    "f64",
    "str",
    "char",
    "bool",
    "Box",
    "Option",
    "Result",
    "String",
    "Vec"
  ];
  return {
    name: "Rust",
    aliases: ["rs"],
    keywords: {
      $pattern: e.IDENT_RE + "!?",
      type: d,
      keyword: s,
      literal: l,
      built_in: c
    },
    illegal: "</",
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.COMMENT("/\\*", "\\*/", { contains: ["self"] }),
      e.inherit(e.QUOTE_STRING_MODE, {
        begin: /b?"/,
        illegal: null
      }),
      {
        className: "symbol",
        // negative lookahead to avoid matching `'`
        begin: /'[a-zA-Z_][a-zA-Z0-9_]*(?!')/
      },
      {
        scope: "string",
        variants: [
          { begin: /b?r(#*)"(.|\n)*?"\1(?!#)/ },
          {
            begin: /b?'/,
            end: /'/,
            contains: [
              {
                scope: "char.escape",
                match: /\\('|\w|x\w{2}|u\w{4}|U\w{8})/
              }
            ]
          }
        ]
      },
      {
        className: "number",
        variants: [
          { begin: "\\b0b([01_]+)" + a },
          { begin: "\\b0o([0-7_]+)" + a },
          { begin: "\\b0x([A-Fa-f0-9_]+)" + a },
          { begin: "\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)" + a }
        ],
        relevance: 0
      },
      {
        begin: [
          /fn/,
          /\s+/,
          r
        ],
        className: {
          1: "keyword",
          3: "title.function"
        }
      },
      {
        className: "meta",
        begin: "#!?\\[",
        end: "\\]",
        contains: [
          {
            className: "string",
            begin: /"/,
            end: /"/,
            contains: [
              e.BACKSLASH_ESCAPE
            ]
          }
        ]
      },
      {
        begin: [
          /let/,
          /\s+/,
          /(?:mut\s+)?/,
          r
        ],
        className: {
          1: "keyword",
          3: "keyword",
          4: "variable"
        }
      },
      // must come before impl/for rule later
      {
        begin: [
          /for/,
          /\s+/,
          r,
          /\s+/,
          /in/
        ],
        className: {
          1: "keyword",
          3: "variable",
          5: "keyword"
        }
      },
      {
        begin: [
          /type/,
          /\s+/,
          r
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: [
          /(?:trait|enum|struct|union|impl|for)/,
          /\s+/,
          r
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: e.IDENT_RE + "::",
        keywords: {
          keyword: "Self",
          built_in: c,
          type: d
        }
      },
      {
        className: "punctuation",
        begin: "->"
      },
      o
    ]
  };
}
const Yg = (e) => ({
  IMPORTANT: {
    scope: "meta",
    begin: "!important"
  },
  BLOCK_COMMENT: e.C_BLOCK_COMMENT_MODE,
  HEXCOLOR: {
    scope: "number",
    begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
  },
  FUNCTION_DISPATCH: {
    className: "built_in",
    begin: /[\w-]+(?=\()/
  },
  ATTRIBUTE_SELECTOR_MODE: {
    scope: "selector-attr",
    begin: /\[/,
    end: /\]/,
    illegal: "$",
    contains: [
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE
    ]
  },
  CSS_NUMBER_MODE: {
    scope: "number",
    begin: e.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
    relevance: 0
  },
  CSS_VARIABLE: {
    className: "attr",
    begin: /--[A-Za-z_][A-Za-z0-9_-]*/
  }
}), Zg = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
], Xg = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
], Qg = [
  ...Zg,
  ...Xg
], Jg = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse(), jg = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse(), eh = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse(), nh = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse();
function th(e) {
  const n = Yg(e), t = eh, r = jg, i = "@[a-z-]+", o = "and or not only", s = {
    className: "variable",
    begin: "(\\$" + "[a-zA-Z-][a-zA-Z0-9_-]*" + ")\\b",
    relevance: 0
  };
  return {
    name: "SCSS",
    case_insensitive: !0,
    illegal: "[=/|']",
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      n.CSS_NUMBER_MODE,
      {
        className: "selector-id",
        begin: "#[A-Za-z0-9_-]+",
        relevance: 0
      },
      {
        className: "selector-class",
        begin: "\\.[A-Za-z0-9_-]+",
        relevance: 0
      },
      n.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-tag",
        begin: "\\b(" + Qg.join("|") + ")\\b",
        // was there, before, but why?
        relevance: 0
      },
      {
        className: "selector-pseudo",
        begin: ":(" + r.join("|") + ")"
      },
      {
        className: "selector-pseudo",
        begin: ":(:)?(" + t.join("|") + ")"
      },
      s,
      {
        // pseudo-selector params
        begin: /\(/,
        end: /\)/,
        contains: [n.CSS_NUMBER_MODE]
      },
      n.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + nh.join("|") + ")\\b"
      },
      { begin: "\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b" },
      {
        begin: /:/,
        end: /[;}{]/,
        relevance: 0,
        contains: [
          n.BLOCK_COMMENT,
          s,
          n.HEXCOLOR,
          n.CSS_NUMBER_MODE,
          e.QUOTE_STRING_MODE,
          e.APOS_STRING_MODE,
          n.IMPORTANT,
          n.FUNCTION_DISPATCH
        ]
      },
      // matching these here allows us to treat them more like regular CSS
      // rules so everything between the {} gets regular rule highlighting,
      // which is what we want for page and font-face
      {
        begin: "@(page|font-face)",
        keywords: {
          $pattern: i,
          keyword: "@page @font-face"
        }
      },
      {
        begin: "@",
        end: "[{;]",
        returnBegin: !0,
        keywords: {
          $pattern: /[a-z-]+/,
          keyword: o,
          attribute: Jg.join(" ")
        },
        contains: [
          {
            begin: i,
            className: "keyword"
          },
          {
            begin: /[a-z-]+(?=:)/,
            className: "attribute"
          },
          s,
          e.QUOTE_STRING_MODE,
          e.APOS_STRING_MODE,
          n.HEXCOLOR,
          n.CSS_NUMBER_MODE
        ]
      },
      n.FUNCTION_DISPATCH
    ]
  };
}
function rh(e) {
  return {
    name: "Shell Session",
    aliases: [
      "console",
      "shellsession"
    ],
    contains: [
      {
        className: "meta.prompt",
        // We cannot add \s (spaces) in the regular expression otherwise it will be too broad and produce unexpected result.
        // For instance, in the following example, it would match "echo /path/to/home >" as a prompt:
        // echo /path/to/home > t.exe
        begin: /^\s{0,3}[/~\w\d[\]()@-]*[>%$#][ ]?/,
        starts: {
          end: /[^\\](?=\s*$)/,
          subLanguage: "bash"
        }
      }
    ]
  };
}
function ih(e) {
  const n = e.regex, t = e.COMMENT("--", "$"), r = {
    scope: "string",
    variants: [
      {
        begin: /'/,
        end: /'/,
        contains: [{ match: /''/ }]
      }
    ]
  }, i = {
    begin: /"/,
    end: /"/,
    contains: [{ match: /""/ }]
  }, o = [
    "true",
    "false",
    // Not sure it's correct to call NULL literal, and clauses like IS [NOT] NULL look strange that way.
    // "null",
    "unknown"
  ], a = [
    "double precision",
    "large object",
    "with timezone",
    "without timezone"
  ], s = [
    "bigint",
    "binary",
    "blob",
    "boolean",
    "char",
    "character",
    "clob",
    "date",
    "dec",
    "decfloat",
    "decimal",
    "float",
    "int",
    "integer",
    "interval",
    "nchar",
    "nclob",
    "national",
    "numeric",
    "real",
    "row",
    "smallint",
    "time",
    "timestamp",
    "varchar",
    "varying",
    // modifier (character varying)
    "varbinary"
  ], l = [
    "add",
    "asc",
    "collation",
    "desc",
    "final",
    "first",
    "last",
    "view"
  ], c = [
    "abs",
    "acos",
    "all",
    "allocate",
    "alter",
    "and",
    "any",
    "are",
    "array",
    "array_agg",
    "array_max_cardinality",
    "as",
    "asensitive",
    "asin",
    "asymmetric",
    "at",
    "atan",
    "atomic",
    "authorization",
    "avg",
    "begin",
    "begin_frame",
    "begin_partition",
    "between",
    "bigint",
    "binary",
    "blob",
    "boolean",
    "both",
    "by",
    "call",
    "called",
    "cardinality",
    "cascaded",
    "case",
    "cast",
    "ceil",
    "ceiling",
    "char",
    "char_length",
    "character",
    "character_length",
    "check",
    "classifier",
    "clob",
    "close",
    "coalesce",
    "collate",
    "collect",
    "column",
    "commit",
    "condition",
    "connect",
    "constraint",
    "contains",
    "convert",
    "copy",
    "corr",
    "corresponding",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "create",
    "cross",
    "cube",
    "cume_dist",
    "current",
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_row",
    "current_schema",
    "current_time",
    "current_timestamp",
    "current_path",
    "current_role",
    "current_transform_group_for_type",
    "current_user",
    "cursor",
    "cycle",
    "date",
    "day",
    "deallocate",
    "dec",
    "decimal",
    "decfloat",
    "declare",
    "default",
    "define",
    "delete",
    "dense_rank",
    "deref",
    "describe",
    "deterministic",
    "disconnect",
    "distinct",
    "double",
    "drop",
    "dynamic",
    "each",
    "element",
    "else",
    "empty",
    "end",
    "end_frame",
    "end_partition",
    "end-exec",
    "equals",
    "escape",
    "every",
    "except",
    "exec",
    "execute",
    "exists",
    "exp",
    "external",
    "extract",
    "false",
    "fetch",
    "filter",
    "first_value",
    "float",
    "floor",
    "for",
    "foreign",
    "frame_row",
    "free",
    "from",
    "full",
    "function",
    "fusion",
    "get",
    "global",
    "grant",
    "group",
    "grouping",
    "groups",
    "having",
    "hold",
    "hour",
    "identity",
    "in",
    "indicator",
    "initial",
    "inner",
    "inout",
    "insensitive",
    "insert",
    "int",
    "integer",
    "intersect",
    "intersection",
    "interval",
    "into",
    "is",
    "join",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "language",
    "large",
    "last_value",
    "lateral",
    "lead",
    "leading",
    "left",
    "like",
    "like_regex",
    "listagg",
    "ln",
    "local",
    "localtime",
    "localtimestamp",
    "log",
    "log10",
    "lower",
    "match",
    "match_number",
    "match_recognize",
    "matches",
    "max",
    "member",
    "merge",
    "method",
    "min",
    "minute",
    "mod",
    "modifies",
    "module",
    "month",
    "multiset",
    "national",
    "natural",
    "nchar",
    "nclob",
    "new",
    "no",
    "none",
    "normalize",
    "not",
    "nth_value",
    "ntile",
    "null",
    "nullif",
    "numeric",
    "octet_length",
    "occurrences_regex",
    "of",
    "offset",
    "old",
    "omit",
    "on",
    "one",
    "only",
    "open",
    "or",
    "order",
    "out",
    "outer",
    "over",
    "overlaps",
    "overlay",
    "parameter",
    "partition",
    "pattern",
    "per",
    "percent",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "period",
    "portion",
    "position",
    "position_regex",
    "power",
    "precedes",
    "precision",
    "prepare",
    "primary",
    "procedure",
    "ptf",
    "range",
    "rank",
    "reads",
    "real",
    "recursive",
    "ref",
    "references",
    "referencing",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "release",
    "result",
    "return",
    "returns",
    "revoke",
    "right",
    "rollback",
    "rollup",
    "row",
    "row_number",
    "rows",
    "running",
    "savepoint",
    "scope",
    "scroll",
    "search",
    "second",
    "seek",
    "select",
    "sensitive",
    "session_user",
    "set",
    "show",
    "similar",
    "sin",
    "sinh",
    "skip",
    "smallint",
    "some",
    "specific",
    "specifictype",
    "sql",
    "sqlexception",
    "sqlstate",
    "sqlwarning",
    "sqrt",
    "start",
    "static",
    "stddev_pop",
    "stddev_samp",
    "submultiset",
    "subset",
    "substring",
    "substring_regex",
    "succeeds",
    "sum",
    "symmetric",
    "system",
    "system_time",
    "system_user",
    "table",
    "tablesample",
    "tan",
    "tanh",
    "then",
    "time",
    "timestamp",
    "timezone_hour",
    "timezone_minute",
    "to",
    "trailing",
    "translate",
    "translate_regex",
    "translation",
    "treat",
    "trigger",
    "trim",
    "trim_array",
    "true",
    "truncate",
    "uescape",
    "union",
    "unique",
    "unknown",
    "unnest",
    "update",
    "upper",
    "user",
    "using",
    "value",
    "values",
    "value_of",
    "var_pop",
    "var_samp",
    "varbinary",
    "varchar",
    "varying",
    "versioning",
    "when",
    "whenever",
    "where",
    "width_bucket",
    "window",
    "with",
    "within",
    "without",
    "year"
  ], d = [
    "abs",
    "acos",
    "array_agg",
    "asin",
    "atan",
    "avg",
    "cast",
    "ceil",
    "ceiling",
    "coalesce",
    "corr",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "cume_dist",
    "dense_rank",
    "deref",
    "element",
    "exp",
    "extract",
    "first_value",
    "floor",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "last_value",
    "lead",
    "listagg",
    "ln",
    "log",
    "log10",
    "lower",
    "max",
    "min",
    "mod",
    "nth_value",
    "ntile",
    "nullif",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "position",
    "position_regex",
    "power",
    "rank",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "row_number",
    "sin",
    "sinh",
    "sqrt",
    "stddev_pop",
    "stddev_samp",
    "substring",
    "substring_regex",
    "sum",
    "tan",
    "tanh",
    "translate",
    "translate_regex",
    "treat",
    "trim",
    "trim_array",
    "unnest",
    "upper",
    "value_of",
    "var_pop",
    "var_samp",
    "width_bucket"
  ], u = [
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_schema",
    "current_transform_group_for_type",
    "current_user",
    "session_user",
    "system_time",
    "system_user",
    "current_time",
    "localtime",
    "current_timestamp",
    "localtimestamp"
  ], p = [
    "create table",
    "insert into",
    "primary key",
    "foreign key",
    "not null",
    "alter table",
    "add constraint",
    "grouping sets",
    "on overflow",
    "character set",
    "respect nulls",
    "ignore nulls",
    "nulls first",
    "nulls last",
    "depth first",
    "breadth first"
  ], f = d, g = [
    ...c,
    ...l
  ].filter((I) => !d.includes(I)), E = {
    scope: "variable",
    match: /@[a-z0-9][a-z0-9_]*/
  }, _ = {
    scope: "operator",
    match: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
    relevance: 0
  }, h = {
    match: n.concat(/\b/, n.either(...f), /\s*\(/),
    relevance: 0,
    keywords: { built_in: f }
  };
  function N(I) {
    return n.concat(
      /\b/,
      n.either(...I.map((w) => w.replace(/\s+/, "\\s+"))),
      /\b/
    );
  }
  const k = {
    scope: "keyword",
    match: N(p),
    relevance: 0
  };
  function v(I, {
    exceptions: w,
    when: P
  } = {}) {
    const C = P;
    return w = w || [], I.map((B) => B.match(/\|\d+$/) || w.includes(B) ? B : C(B) ? `${B}|0` : B);
  }
  return {
    name: "SQL",
    case_insensitive: !0,
    // does not include {} or HTML tags `</`
    illegal: /[{}]|<\//,
    keywords: {
      $pattern: /\b[\w\.]+/,
      keyword: v(g, { when: (I) => I.length < 3 }),
      literal: o,
      type: s,
      built_in: u
    },
    contains: [
      {
        scope: "type",
        match: N(a)
      },
      k,
      h,
      E,
      r,
      i,
      e.C_NUMBER_MODE,
      e.C_BLOCK_COMMENT_MODE,
      t,
      _
    ]
  };
}
function Bo(e) {
  return e ? typeof e == "string" ? e : e.source : null;
}
function Vn(e) {
  return pe("(?=", e, ")");
}
function pe(...e) {
  return e.map((t) => Bo(t)).join("");
}
function ah(e) {
  const n = e[e.length - 1];
  return typeof n == "object" && n.constructor === Object ? (e.splice(e.length - 1, 1), n) : {};
}
function Re(...e) {
  return "(" + (ah(e).capture ? "" : "?:") + e.map((r) => Bo(r)).join("|") + ")";
}
const Zr = (e) => pe(
  /\b/,
  e,
  /\w$/.test(e) ? /\b/ : /\B/
), oh = [
  "Protocol",
  // contextual
  "Type"
  // contextual
].map(Zr), ra = [
  "init",
  "self"
].map(Zr), sh = [
  "Any",
  "Self"
], cr = [
  // strings below will be fed into the regular `keywords` engine while regex
  // will result in additional modes being created to scan for those keywords to
  // avoid conflicts with other rules
  "actor",
  "any",
  // contextual
  "associatedtype",
  "async",
  "await",
  /as\?/,
  // operator
  /as!/,
  // operator
  "as",
  // operator
  "borrowing",
  // contextual
  "break",
  "case",
  "catch",
  "class",
  "consume",
  // contextual
  "consuming",
  // contextual
  "continue",
  "convenience",
  // contextual
  "copy",
  // contextual
  "default",
  "defer",
  "deinit",
  "didSet",
  // contextual
  "distributed",
  "do",
  "dynamic",
  // contextual
  "each",
  "else",
  "enum",
  "extension",
  "fallthrough",
  /fileprivate\(set\)/,
  "fileprivate",
  "final",
  // contextual
  "for",
  "func",
  "get",
  // contextual
  "guard",
  "if",
  "import",
  "indirect",
  // contextual
  "infix",
  // contextual
  /init\?/,
  /init!/,
  "inout",
  /internal\(set\)/,
  "internal",
  "in",
  "is",
  // operator
  "isolated",
  // contextual
  "nonisolated",
  // contextual
  "lazy",
  // contextual
  "let",
  "macro",
  "mutating",
  // contextual
  "nonmutating",
  // contextual
  /open\(set\)/,
  // contextual
  "open",
  // contextual
  "operator",
  "optional",
  // contextual
  "override",
  // contextual
  "package",
  "postfix",
  // contextual
  "precedencegroup",
  "prefix",
  // contextual
  /private\(set\)/,
  "private",
  "protocol",
  /public\(set\)/,
  "public",
  "repeat",
  "required",
  // contextual
  "rethrows",
  "return",
  "set",
  // contextual
  "some",
  // contextual
  "static",
  "struct",
  "subscript",
  "super",
  "switch",
  "throws",
  "throw",
  /try\?/,
  // operator
  /try!/,
  // operator
  "try",
  // operator
  "typealias",
  /unowned\(safe\)/,
  // contextual
  /unowned\(unsafe\)/,
  // contextual
  "unowned",
  // contextual
  "var",
  "weak",
  // contextual
  "where",
  "while",
  "willSet"
  // contextual
], ia = [
  "false",
  "nil",
  "true"
], lh = [
  "assignment",
  "associativity",
  "higherThan",
  "left",
  "lowerThan",
  "none",
  "right"
], ch = [
  "#colorLiteral",
  "#column",
  "#dsohandle",
  "#else",
  "#elseif",
  "#endif",
  "#error",
  "#file",
  "#fileID",
  "#fileLiteral",
  "#filePath",
  "#function",
  "#if",
  "#imageLiteral",
  "#keyPath",
  "#line",
  "#selector",
  "#sourceLocation",
  "#warning"
], aa = [
  "abs",
  "all",
  "any",
  "assert",
  "assertionFailure",
  "debugPrint",
  "dump",
  "fatalError",
  "getVaList",
  "isKnownUniquelyReferenced",
  "max",
  "min",
  "numericCast",
  "pointwiseMax",
  "pointwiseMin",
  "precondition",
  "preconditionFailure",
  "print",
  "readLine",
  "repeatElement",
  "sequence",
  "stride",
  "swap",
  "swift_unboxFromSwiftValueWithType",
  "transcode",
  "type",
  "unsafeBitCast",
  "unsafeDowncast",
  "withExtendedLifetime",
  "withUnsafeMutablePointer",
  "withUnsafePointer",
  "withVaList",
  "withoutActuallyEscaping",
  "zip"
], Fo = Re(
  /[/=\-+!*%<>&|^~?]/,
  /[\u00A1-\u00A7]/,
  /[\u00A9\u00AB]/,
  /[\u00AC\u00AE]/,
  /[\u00B0\u00B1]/,
  /[\u00B6\u00BB\u00BF\u00D7\u00F7]/,
  /[\u2016-\u2017]/,
  /[\u2020-\u2027]/,
  /[\u2030-\u203E]/,
  /[\u2041-\u2053]/,
  /[\u2055-\u205E]/,
  /[\u2190-\u23FF]/,
  /[\u2500-\u2775]/,
  /[\u2794-\u2BFF]/,
  /[\u2E00-\u2E7F]/,
  /[\u3001-\u3003]/,
  /[\u3008-\u3020]/,
  /[\u3030]/
), zo = Re(
  Fo,
  /[\u0300-\u036F]/,
  /[\u1DC0-\u1DFF]/,
  /[\u20D0-\u20FF]/,
  /[\uFE00-\uFE0F]/,
  /[\uFE20-\uFE2F]/
  // TODO: The following characters are also allowed, but the regex isn't supported yet.
  // /[\u{E0100}-\u{E01EF}]/u
), ur = pe(Fo, zo, "*"), Uo = Re(
  /[a-zA-Z_]/,
  /[\u00A8\u00AA\u00AD\u00AF\u00B2-\u00B5\u00B7-\u00BA]/,
  /[\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/,
  /[\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF]/,
  /[\u1E00-\u1FFF]/,
  /[\u200B-\u200D\u202A-\u202E\u203F-\u2040\u2054\u2060-\u206F]/,
  /[\u2070-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793]/,
  /[\u2C00-\u2DFF\u2E80-\u2FFF]/,
  /[\u3004-\u3007\u3021-\u302F\u3031-\u303F\u3040-\uD7FF]/,
  /[\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44]/,
  /[\uFE47-\uFEFE\uFF00-\uFFFD]/
  // Should be /[\uFE47-\uFFFD]/, but we have to exclude FEFF.
  // The following characters are also allowed, but the regexes aren't supported yet.
  // /[\u{10000}-\u{1FFFD}\u{20000-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}]/u,
  // /[\u{50000}-\u{5FFFD}\u{60000-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}]/u,
  // /[\u{90000}-\u{9FFFD}\u{A0000-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}]/u,
  // /[\u{D0000}-\u{DFFFD}\u{E0000-\u{EFFFD}]/u
), Ct = Re(
  Uo,
  /\d/,
  /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/
), Je = pe(Uo, Ct, "*"), _t = pe(/[A-Z]/, Ct, "*"), uh = [
  "attached",
  "autoclosure",
  pe(/convention\(/, Re("swift", "block", "c"), /\)/),
  "discardableResult",
  "dynamicCallable",
  "dynamicMemberLookup",
  "escaping",
  "freestanding",
  "frozen",
  "GKInspectable",
  "IBAction",
  "IBDesignable",
  "IBInspectable",
  "IBOutlet",
  "IBSegueAction",
  "inlinable",
  "main",
  "nonobjc",
  "NSApplicationMain",
  "NSCopying",
  "NSManaged",
  pe(/objc\(/, Je, /\)/),
  "objc",
  "objcMembers",
  "propertyWrapper",
  "requires_stored_property_inits",
  "resultBuilder",
  "Sendable",
  "testable",
  "UIApplicationMain",
  "unchecked",
  "unknown",
  "usableFromInline",
  "warn_unqualified_access"
], dh = [
  "iOS",
  "iOSApplicationExtension",
  "macOS",
  "macOSApplicationExtension",
  "macCatalyst",
  "macCatalystApplicationExtension",
  "watchOS",
  "watchOSApplicationExtension",
  "tvOS",
  "tvOSApplicationExtension",
  "swift"
];
function fh(e) {
  const n = {
    match: /\s+/,
    relevance: 0
  }, t = e.COMMENT(
    "/\\*",
    "\\*/",
    { contains: ["self"] }
  ), r = [
    e.C_LINE_COMMENT_MODE,
    t
  ], i = {
    match: [
      /\./,
      Re(...oh, ...ra)
    ],
    className: { 2: "keyword" }
  }, o = {
    // Consume .keyword to prevent highlighting properties and methods as keywords.
    match: pe(/\./, Re(...cr)),
    relevance: 0
  }, a = cr.filter((ce) => typeof ce == "string").concat(["_|0"]), s = cr.filter((ce) => typeof ce != "string").concat(sh).map(Zr), l = { variants: [
    {
      className: "keyword",
      match: Re(...s, ...ra)
    }
  ] }, c = {
    $pattern: Re(
      /\b\w+/,
      // regular keywords
      /#\w+/
      // number keywords
    ),
    keyword: a.concat(ch),
    literal: ia
  }, d = [
    i,
    o,
    l
  ], u = {
    // Consume .built_in to prevent highlighting properties and methods.
    match: pe(/\./, Re(...aa)),
    relevance: 0
  }, p = {
    className: "built_in",
    match: pe(/\b/, Re(...aa), /(?=\()/)
  }, f = [
    u,
    p
  ], g = {
    // Prevent -> from being highlighting as an operator.
    match: /->/,
    relevance: 0
  }, E = {
    className: "operator",
    relevance: 0,
    variants: [
      { match: ur },
      {
        // dot-operator: only operators that start with a dot are allowed to use dots as
        // characters (..., ...<, .*, etc). So there rule here is: a dot followed by one or more
        // characters that may also include dots.
        match: `\\.(\\.|${zo})+`
      }
    ]
  }, _ = [
    g,
    E
  ], h = "([0-9]_*)+", N = "([0-9a-fA-F]_*)+", k = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal floating-point-literal (subsumes decimal-literal)
      { match: `\\b(${h})(\\.(${h}))?([eE][+-]?(${h}))?\\b` },
      // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
      { match: `\\b0x(${N})(\\.(${N}))?([pP][+-]?(${h}))?\\b` },
      // octal-literal
      { match: /\b0o([0-7]_*)+\b/ },
      // binary-literal
      { match: /\b0b([01]_*)+\b/ }
    ]
  }, v = (ce = "") => ({
    className: "subst",
    variants: [
      { match: pe(/\\/, ce, /[0\\tnr"']/) },
      { match: pe(/\\/, ce, /u\{[0-9a-fA-F]{1,8}\}/) }
    ]
  }), I = (ce = "") => ({
    className: "subst",
    match: pe(/\\/, ce, /[\t ]*(?:[\r\n]|\r\n)/)
  }), w = (ce = "") => ({
    className: "subst",
    label: "interpol",
    begin: pe(/\\/, ce, /\(/),
    end: /\)/
  }), P = (ce = "") => ({
    begin: pe(ce, /"""/),
    end: pe(/"""/, ce),
    contains: [
      v(ce),
      I(ce),
      w(ce)
    ]
  }), C = (ce = "") => ({
    begin: pe(ce, /"/),
    end: pe(/"/, ce),
    contains: [
      v(ce),
      w(ce)
    ]
  }), B = {
    className: "string",
    variants: [
      P(),
      P("#"),
      P("##"),
      P("###"),
      C(),
      C("#"),
      C("##"),
      C("###")
    ]
  }, x = [
    e.BACKSLASH_ESCAPE,
    {
      begin: /\[/,
      end: /\]/,
      relevance: 0,
      contains: [e.BACKSLASH_ESCAPE]
    }
  ], D = {
    begin: /\/[^\s](?=[^/\n]*\/)/,
    end: /\//,
    contains: x
  }, $ = (ce) => {
    const an = pe(ce, /\//), on = pe(/\//, ce);
    return {
      begin: an,
      end: on,
      contains: [
        ...x,
        {
          scope: "comment",
          begin: `#(?!.*${on})`,
          end: /$/
        }
      ]
    };
  }, ne = {
    scope: "regexp",
    variants: [
      $("###"),
      $("##"),
      $("#"),
      D
    ]
  }, z = { match: pe(/`/, Je, /`/) }, O = {
    className: "variable",
    match: /\$\d+/
  }, X = {
    className: "variable",
    match: `\\$${Ct}+`
  }, H = [
    z,
    O,
    X
  ], Z = {
    match: /(@|#(un)?)available/,
    scope: "keyword",
    starts: { contains: [
      {
        begin: /\(/,
        end: /\)/,
        keywords: dh,
        contains: [
          ..._,
          k,
          B
        ]
      }
    ] }
  }, le = {
    scope: "keyword",
    match: pe(/@/, Re(...uh), Vn(Re(/\(/, /\s+/)))
  }, m = {
    scope: "meta",
    match: pe(/@/, Je)
  }, fe = [
    Z,
    le,
    m
  ], ge = {
    match: Vn(/\b[A-Z]/),
    relevance: 0,
    contains: [
      {
        // Common Apple frameworks, for relevance boost
        className: "type",
        match: pe(/(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)/, Ct, "+")
      },
      {
        // Type identifier
        className: "type",
        match: _t,
        relevance: 0
      },
      {
        // Optional type
        match: /[?!]+/,
        relevance: 0
      },
      {
        // Variadic parameter
        match: /\.\.\./,
        relevance: 0
      },
      {
        // Protocol composition
        match: pe(/\s+&\s+/, Vn(_t)),
        relevance: 0
      }
    ]
  }, y = {
    begin: /</,
    end: />/,
    keywords: c,
    contains: [
      ...r,
      ...d,
      ...fe,
      g,
      ge
    ]
  };
  ge.contains.push(y);
  const Ie = {
    match: pe(Je, /\s*:/),
    keywords: "_|0",
    relevance: 0
  }, Ge = {
    begin: /\(/,
    end: /\)/,
    relevance: 0,
    keywords: c,
    contains: [
      "self",
      Ie,
      ...r,
      ne,
      ...d,
      ...f,
      ..._,
      k,
      B,
      ...H,
      ...fe,
      ge
    ]
  }, ye = {
    begin: /</,
    end: />/,
    keywords: "repeat each",
    contains: [
      ...r,
      ge
    ]
  }, tn = {
    begin: Re(
      Vn(pe(Je, /\s*:/)),
      Vn(pe(Je, /\s+/, Je, /\s*:/))
    ),
    end: /:/,
    relevance: 0,
    contains: [
      {
        className: "keyword",
        match: /\b_\b/
      },
      {
        className: "params",
        match: Je
      }
    ]
  }, Pe = {
    begin: /\(/,
    end: /\)/,
    keywords: c,
    contains: [
      tn,
      ...r,
      ...d,
      ..._,
      k,
      B,
      ...fe,
      ge,
      Ge
    ],
    endsParent: !0,
    illegal: /["']/
  }, rn = {
    match: [
      /(func|macro)/,
      /\s+/,
      Re(z.match, Je, ur)
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      ye,
      Pe,
      n
    ],
    illegal: [
      /\[/,
      /%/
    ]
  }, Be = {
    match: [
      /\b(?:subscript|init[?!]?)/,
      /\s*(?=[<(])/
    ],
    className: { 1: "keyword" },
    contains: [
      ye,
      Pe,
      n
    ],
    illegal: /\[|%/
  }, fn = {
    match: [
      /operator/,
      /\s+/,
      ur
    ],
    className: {
      1: "keyword",
      3: "title"
    }
  }, Fn = {
    begin: [
      /precedencegroup/,
      /\s+/,
      _t
    ],
    className: {
      1: "keyword",
      3: "title"
    },
    contains: [ge],
    keywords: [
      ...lh,
      ...ia
    ],
    end: /}/
  }, zn = {
    match: [
      /class\b/,
      /\s+/,
      /func\b/,
      /\s+/,
      /\b[A-Za-z_][A-Za-z0-9_]*\b/
    ],
    scope: {
      1: "keyword",
      3: "keyword",
      5: "title.function"
    }
  }, Un = {
    match: [
      /class\b/,
      /\s+/,
      /var\b/
    ],
    scope: {
      1: "keyword",
      3: "keyword"
    }
  }, vn = {
    begin: [
      /(struct|protocol|class|extension|enum|actor)/,
      /\s+/,
      Je,
      /\s*/
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    },
    keywords: c,
    contains: [
      ye,
      ...d,
      {
        begin: /:/,
        end: /\{/,
        keywords: c,
        contains: [
          {
            scope: "title.class.inherited",
            match: _t
          },
          ...d
        ],
        relevance: 0
      }
    ]
  };
  for (const ce of B.variants) {
    const an = ce.contains.find((Tn) => Tn.label === "interpol");
    an.keywords = c;
    const on = [
      ...d,
      ...f,
      ..._,
      k,
      B,
      ...H
    ];
    an.contains = [
      ...on,
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          "self",
          ...on
        ]
      }
    ];
  }
  return {
    name: "Swift",
    keywords: c,
    contains: [
      ...r,
      rn,
      Be,
      zn,
      Un,
      vn,
      fn,
      Fn,
      {
        beginKeywords: "import",
        end: /$/,
        contains: [...r],
        relevance: 0
      },
      ne,
      ...d,
      ...f,
      ..._,
      k,
      B,
      ...H,
      ...fe,
      ge,
      Ge
    ]
  };
}
const At = "[A-Za-z$_][0-9A-Za-z$_]*", $o = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends",
  // It's reached stage 3, which is "recommended for implementation":
  "using"
], Ho = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
], Go = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
], qo = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
], Ko = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
], Wo = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "global"
  // Node.js
], Vo = [].concat(
  Ko,
  Go,
  qo
);
function ph(e) {
  const n = e.regex, t = (Z, { after: le }) => {
    const m = "</" + Z[0].slice(1);
    return Z.input.indexOf(m, le) !== -1;
  }, r = At, i = {
    begin: "<>",
    end: "</>"
  }, o = /<[A-Za-z0-9\\._:-]+\s*\/>/, a = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (Z, le) => {
      const m = Z[0].length + Z.index, fe = Z.input[m];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        fe === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        fe === ","
      ) {
        le.ignoreMatch();
        return;
      }
      fe === ">" && (t(Z, { after: m }) || le.ignoreMatch());
      let ge;
      const y = Z.input.substring(m);
      if (ge = y.match(/^\s*=/)) {
        le.ignoreMatch();
        return;
      }
      if ((ge = y.match(/^\s+extends\s+/)) && ge.index === 0) {
        le.ignoreMatch();
        return;
      }
    }
  }, s = {
    $pattern: At,
    keyword: $o,
    literal: Ho,
    built_in: Vo,
    "variable.language": Wo
  }, l = "[0-9](_?[0-9])*", c = `\\.(${l})`, d = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*", u = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${d})((${c})|\\.)?|(${c}))[eE][+-]?(${l})\\b` },
      { begin: `\\b(${d})\\b((${c})\\b|\\.)?|(${c})\\b` },
      // DecimalBigIntegerLiteral
      { begin: "\\b(0|[1-9](_?[0-9])*)n\\b" },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  }, p = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: s,
    contains: []
    // defined later
  }, f = {
    begin: ".?html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        p
      ],
      subLanguage: "xml"
    }
  }, g = {
    begin: ".?css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        p
      ],
      subLanguage: "css"
    }
  }, E = {
    begin: ".?gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        p
      ],
      subLanguage: "graphql"
    }
  }, _ = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      e.BACKSLASH_ESCAPE,
      p
    ]
  }, N = {
    className: "comment",
    variants: [
      e.COMMENT(
        /\/\*\*(?!\/)/,
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              begin: "(?=@[A-Za-z]+)",
              relevance: 0,
              contains: [
                {
                  className: "doctag",
                  begin: "@[A-Za-z]+"
                },
                {
                  className: "type",
                  begin: "\\{",
                  end: "\\}",
                  excludeEnd: !0,
                  excludeBegin: !0,
                  relevance: 0
                },
                {
                  className: "variable",
                  begin: r + "(?=\\s*(-)|$)",
                  endsParent: !0,
                  relevance: 0
                },
                // eat spaces (not newlines) so we can find
                // types or variables
                {
                  begin: /(?=[^\n])\s/,
                  relevance: 0
                }
              ]
            }
          ]
        }
      ),
      e.C_BLOCK_COMMENT_MODE,
      e.C_LINE_COMMENT_MODE
    ]
  }, k = [
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    f,
    g,
    E,
    _,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    u
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  p.contains = k.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: s,
    contains: [
      "self"
    ].concat(k)
  });
  const v = [].concat(N, p.contains), I = v.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: s,
      contains: ["self"].concat(v)
    }
  ]), w = {
    className: "params",
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/,
    // to match the parms with
    end: /\)/,
    excludeBegin: !0,
    excludeEnd: !0,
    keywords: s,
    contains: I
  }, P = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          r,
          /\s+/,
          /extends/,
          /\s+/,
          n.concat(r, "(", n.concat(/\./, r), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          r
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  }, C = {
    relevance: 0,
    match: n.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...Go,
        ...qo
      ]
    }
  }, B = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  }, x = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          r,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [w],
    illegal: /%/
  }, D = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function $(Z) {
    return n.concat("(?!", Z.join("|"), ")");
  }
  const ne = {
    match: n.concat(
      /\b/,
      $([
        ...Ko,
        "super",
        "import"
      ].map((Z) => `${Z}\\s*\\(`)),
      r,
      n.lookahead(/\s*\(/)
    ),
    className: "title.function",
    relevance: 0
  }, z = {
    begin: n.concat(/\./, n.lookahead(
      n.concat(r, /(?![0-9A-Za-z$_(])/)
    )),
    end: r,
    excludeBegin: !0,
    keywords: "prototype",
    className: "property",
    relevance: 0
  }, O = {
    match: [
      /get|set/,
      /\s+/,
      r,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      w
    ]
  }, X = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + e.UNDERSCORE_IDENT_RE + ")\\s*=>", H = {
    match: [
      /const|var|let/,
      /\s+/,
      r,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      n.lookahead(X)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      w
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: s,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS: I, CLASS_REFERENCE: C },
    illegal: /#(?![$_A-z])/,
    contains: [
      e.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      B,
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      f,
      g,
      E,
      _,
      N,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      u,
      C,
      {
        scope: "attr",
        match: r + n.lookahead(":"),
        relevance: 0
      },
      H,
      {
        // "value" container
        begin: "(" + e.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          N,
          e.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: X,
            returnBegin: !0,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: e.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: !0
                  },
                  {
                    begin: /(\s*)\(/,
                    end: /\)/,
                    excludeBegin: !0,
                    excludeEnd: !0,
                    keywords: s,
                    contains: I
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: i.begin, end: i.end },
              { match: o },
              {
                begin: a.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": a.isTrulyOpeningTag,
                end: a.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: a.begin,
                end: a.end,
                skip: !0,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      x,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + e.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: !0,
        label: "func.def",
        contains: [
          w,
          e.inherit(e.TITLE_MODE, { begin: r, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      z,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + r,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [w]
      },
      ne,
      D,
      P,
      O,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function gh(e) {
  const n = e.regex, t = ph(e), r = At, i = [
    "any",
    "void",
    "number",
    "boolean",
    "string",
    "object",
    "never",
    "symbol",
    "bigint",
    "unknown"
  ], o = {
    begin: [
      /namespace/,
      /\s+/,
      e.IDENT_RE
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    }
  }, a = {
    beginKeywords: "interface",
    end: /\{/,
    excludeEnd: !0,
    keywords: {
      keyword: "interface extends",
      built_in: i
    },
    contains: [t.exports.CLASS_REFERENCE]
  }, s = {
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use strict['"]/
  }, l = [
    "type",
    // "namespace",
    "interface",
    "public",
    "private",
    "protected",
    "implements",
    "declare",
    "abstract",
    "readonly",
    "enum",
    "override",
    "satisfies"
  ], c = {
    $pattern: At,
    keyword: $o.concat(l),
    literal: Ho,
    built_in: Vo.concat(i),
    "variable.language": Wo
  }, d = {
    className: "meta",
    begin: "@" + r
  }, u = (E, _, h) => {
    const N = E.contains.findIndex((k) => k.label === _);
    if (N === -1)
      throw new Error("can not find mode to replace");
    E.contains.splice(N, 1, h);
  };
  Object.assign(t.keywords, c), t.exports.PARAMS_CONTAINS.push(d);
  const p = t.contains.find((E) => E.scope === "attr"), f = Object.assign(
    {},
    p,
    { match: n.concat(r, n.lookahead(/\s*\?:/)) }
  );
  t.exports.PARAMS_CONTAINS.push([
    t.exports.CLASS_REFERENCE,
    // class reference for highlighting the params types
    p,
    // highlight the params key
    f
    // Added for optional property assignment highlighting
  ]), t.contains = t.contains.concat([
    d,
    o,
    a,
    f
    // Added for optional property assignment highlighting
  ]), u(t, "shebang", e.SHEBANG()), u(t, "use_strict", s);
  const g = t.contains.find((E) => E.label === "func.def");
  return g.relevance = 0, Object.assign(t, {
    name: "TypeScript",
    aliases: [
      "ts",
      "tsx",
      "mts",
      "cts"
    ]
  }), t;
}
function hh(e) {
  const n = e.regex, t = {
    className: "string",
    begin: /"(""|[^/n])"C\b/
  }, r = {
    className: "string",
    begin: /"/,
    end: /"/,
    illegal: /\n/,
    contains: [
      {
        // double quote escape
        begin: /""/
      }
    ]
  }, i = /\d{1,2}\/\d{1,2}\/\d{4}/, o = /\d{4}-\d{1,2}-\d{1,2}/, a = /(\d|1[012])(:\d+){0,2} *(AM|PM)/, s = /\d{1,2}(:\d{1,2}){1,2}/, l = {
    className: "literal",
    variants: [
      {
        // #YYYY-MM-DD# (ISO-Date) or #M/D/YYYY# (US-Date)
        begin: n.concat(/# */, n.either(o, i), / *#/)
      },
      {
        // #H:mm[:ss]# (24h Time)
        begin: n.concat(/# */, s, / *#/)
      },
      {
        // #h[:mm[:ss]] A# (12h Time)
        begin: n.concat(/# */, a, / *#/)
      },
      {
        // date plus time
        begin: n.concat(
          /# */,
          n.either(o, i),
          / +/,
          n.either(a, s),
          / *#/
        )
      }
    ]
  }, c = {
    className: "number",
    relevance: 0,
    variants: [
      {
        // Float
        begin: /\b\d[\d_]*((\.[\d_]+(E[+-]?[\d_]+)?)|(E[+-]?[\d_]+))[RFD@!#]?/
      },
      {
        // Integer (base 10)
        begin: /\b\d[\d_]*((U?[SIL])|[%&])?/
      },
      {
        // Integer (base 16)
        begin: /&H[\dA-F_]+((U?[SIL])|[%&])?/
      },
      {
        // Integer (base 8)
        begin: /&O[0-7_]+((U?[SIL])|[%&])?/
      },
      {
        // Integer (base 2)
        begin: /&B[01_]+((U?[SIL])|[%&])?/
      }
    ]
  }, d = {
    className: "label",
    begin: /^\w+:/
  }, u = e.COMMENT(/'''/, /$/, { contains: [
    {
      className: "doctag",
      begin: /<\/?/,
      end: />/
    }
  ] }), p = e.COMMENT(null, /$/, { variants: [
    { begin: /'/ },
    {
      // TODO: Use multi-class for leading spaces
      begin: /([\t ]|^)REM(?=\s)/
    }
  ] });
  return {
    name: "Visual Basic .NET",
    aliases: ["vb"],
    case_insensitive: !0,
    classNameAliases: { label: "symbol" },
    keywords: {
      keyword: "addhandler alias aggregate ansi as async assembly auto binary by byref byval call case catch class compare const continue custom declare default delegate dim distinct do each equals else elseif end enum erase error event exit explicit finally for friend from function get global goto group handles if implements imports in inherits interface into iterator join key let lib loop me mid module mustinherit mustoverride mybase myclass namespace narrowing new next notinheritable notoverridable of off on operator option optional order overloads overridable overrides paramarray partial preserve private property protected public raiseevent readonly redim removehandler resume return select set shadows shared skip static step stop structure strict sub synclock take text then throw to try unicode until using when where while widening with withevents writeonly yield",
      built_in: (
        // Operators https://docs.microsoft.com/dotnet/visual-basic/language-reference/operators
        "addressof and andalso await directcast gettype getxmlnamespace is isfalse isnot istrue like mod nameof new not or orelse trycast typeof xor cbool cbyte cchar cdate cdbl cdec cint clng cobj csbyte cshort csng cstr cuint culng cushort"
      ),
      type: (
        // Data types https://docs.microsoft.com/dotnet/visual-basic/language-reference/data-types
        "boolean byte char date decimal double integer long object sbyte short single string uinteger ulong ushort"
      ),
      literal: "true false nothing"
    },
    illegal: "//|\\{|\\}|endif|gosub|variant|wend|^\\$ ",
    contains: [
      t,
      r,
      l,
      c,
      d,
      u,
      p,
      {
        className: "meta",
        // TODO: Use multi-class for indentation once available
        begin: /[\t ]*#(const|disable|else|elseif|enable|end|externalsource|if|region)\b/,
        end: /$/,
        keywords: { keyword: "const disable else elseif enable end externalsource if region then" },
        contains: [p]
      }
    ]
  };
}
function mh(e) {
  e.regex;
  const n = e.COMMENT(/\(;/, /;\)/);
  n.contains.push("self");
  const t = e.COMMENT(/;;/, /$/), r = [
    "anyfunc",
    "block",
    "br",
    "br_if",
    "br_table",
    "call",
    "call_indirect",
    "data",
    "drop",
    "elem",
    "else",
    "end",
    "export",
    "func",
    "global.get",
    "global.set",
    "local.get",
    "local.set",
    "local.tee",
    "get_global",
    "get_local",
    "global",
    "if",
    "import",
    "local",
    "loop",
    "memory",
    "memory.grow",
    "memory.size",
    "module",
    "mut",
    "nop",
    "offset",
    "param",
    "result",
    "return",
    "select",
    "set_global",
    "set_local",
    "start",
    "table",
    "tee_local",
    "then",
    "type",
    "unreachable"
  ], i = {
    begin: [
      /(?:func|call|call_indirect)/,
      /\s+/,
      /\$[^\s)]+/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    }
  }, o = {
    className: "variable",
    begin: /\$[\w_]+/
  }, a = {
    match: /(\((?!;)|\))+/,
    className: "punctuation",
    relevance: 0
  }, s = {
    className: "number",
    relevance: 0,
    // borrowed from Prism, TODO: split out into variants
    match: /[+-]?\b(?:\d(?:_?\d)*(?:\.\d(?:_?\d)*)?(?:[eE][+-]?\d(?:_?\d)*)?|0x[\da-fA-F](?:_?[\da-fA-F])*(?:\.[\da-fA-F](?:_?[\da-fA-D])*)?(?:[pP][+-]?\d(?:_?\d)*)?)\b|\binf\b|\bnan(?::0x[\da-fA-F](?:_?[\da-fA-D])*)?\b/
  }, l = {
    // look-ahead prevents us from gobbling up opcodes
    match: /(i32|i64|f32|f64)(?!\.)/,
    className: "type"
  }, c = {
    className: "keyword",
    // borrowed from Prism, TODO: split out into variants
    match: /\b(f32|f64|i32|i64)(?:\.(?:abs|add|and|ceil|clz|const|convert_[su]\/i(?:32|64)|copysign|ctz|demote\/f64|div(?:_[su])?|eqz?|extend_[su]\/i32|floor|ge(?:_[su])?|gt(?:_[su])?|le(?:_[su])?|load(?:(?:8|16|32)_[su])?|lt(?:_[su])?|max|min|mul|nearest|neg?|or|popcnt|promote\/f32|reinterpret\/[fi](?:32|64)|rem_[su]|rot[lr]|shl|shr_[su]|store(?:8|16|32)?|sqrt|sub|trunc(?:_[su]\/f(?:32|64))?|wrap\/i64|xor))\b/
  };
  return {
    name: "WebAssembly",
    keywords: {
      $pattern: /[\w.]+/,
      keyword: r
    },
    contains: [
      t,
      n,
      {
        match: [
          /(?:offset|align)/,
          /\s*/,
          /=/
        ],
        className: {
          1: "keyword",
          3: "operator"
        }
      },
      o,
      a,
      i,
      e.QUOTE_STRING_MODE,
      l,
      c,
      s
    ]
  };
}
function bh(e) {
  const n = e.regex, t = n.concat(/[\p{L}_]/u, n.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u), r = /[\p{L}0-9._:-]+/u, i = {
    className: "symbol",
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
  }, o = {
    begin: /\s/,
    contains: [
      {
        className: "keyword",
        begin: /#?[a-z_][a-z1-9_-]+/,
        illegal: /\n/
      }
    ]
  }, a = e.inherit(o, {
    begin: /\(/,
    end: /\)/
  }), s = e.inherit(e.APOS_STRING_MODE, { className: "string" }), l = e.inherit(e.QUOTE_STRING_MODE, { className: "string" }), c = {
    endsWithParent: !0,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: "attr",
        begin: r,
        relevance: 0
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [
          {
            className: "string",
            endsParent: !0,
            variants: [
              {
                begin: /"/,
                end: /"/,
                contains: [i]
              },
              {
                begin: /'/,
                end: /'/,
                contains: [i]
              },
              { begin: /[^\s"'=<>`]+/ }
            ]
          }
        ]
      }
    ]
  };
  return {
    name: "HTML, XML",
    aliases: [
      "html",
      "xhtml",
      "rss",
      "atom",
      "xjb",
      "xsd",
      "xsl",
      "plist",
      "wsf",
      "svg"
    ],
    case_insensitive: !0,
    unicodeRegex: !0,
    contains: [
      {
        className: "meta",
        begin: /<![a-z]/,
        end: />/,
        relevance: 10,
        contains: [
          o,
          l,
          s,
          a,
          {
            begin: /\[/,
            end: /\]/,
            contains: [
              {
                className: "meta",
                begin: /<![a-z]/,
                end: />/,
                contains: [
                  o,
                  a,
                  l,
                  s
                ]
              }
            ]
          }
        ]
      },
      e.COMMENT(
        /<!--/,
        /-->/,
        { relevance: 10 }
      ),
      {
        begin: /<!\[CDATA\[/,
        end: /\]\]>/,
        relevance: 10
      },
      i,
      // xml processing instructions
      {
        className: "meta",
        end: /\?>/,
        variants: [
          {
            begin: /<\?xml/,
            relevance: 10,
            contains: [
              l
            ]
          },
          {
            begin: /<\?[a-z][a-z0-9]+/
          }
        ]
      },
      {
        className: "tag",
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending bracket.
        */
        begin: /<style(?=\s|>)/,
        end: />/,
        keywords: { name: "style" },
        contains: [c],
        starts: {
          end: /<\/style>/,
          returnEnd: !0,
          subLanguage: [
            "css",
            "xml"
          ]
        }
      },
      {
        className: "tag",
        // See the comment in the <style tag about the lookahead pattern
        begin: /<script(?=\s|>)/,
        end: />/,
        keywords: { name: "script" },
        contains: [c],
        starts: {
          end: /<\/script>/,
          returnEnd: !0,
          subLanguage: [
            "javascript",
            "handlebars",
            "xml"
          ]
        }
      },
      // we need this for now for jSX
      {
        className: "tag",
        begin: /<>|<\/>/
      },
      // open tag
      {
        className: "tag",
        begin: n.concat(
          /</,
          n.lookahead(n.concat(
            t,
            // <tag/>
            // <tag>
            // <tag ...
            n.either(/\/>/, />/, /\s/)
          ))
        ),
        end: /\/?>/,
        contains: [
          {
            className: "name",
            begin: t,
            relevance: 0,
            starts: c
          }
        ]
      },
      // close tag
      {
        className: "tag",
        begin: n.concat(
          /<\//,
          n.lookahead(n.concat(
            t,
            />/
          ))
        ),
        contains: [
          {
            className: "name",
            begin: t,
            relevance: 0
          },
          {
            begin: />/,
            relevance: 0,
            endsParent: !0
          }
        ]
      }
    ]
  };
}
function Eh(e) {
  const n = "true false yes no null", t = "[\\w#;/?:@&=+$,.~*'()[\\]]+", r = {
    className: "attr",
    variants: [
      // added brackets support and special char support
      { begin: /[\w*@][\w*@ :()\./-]*:(?=[ \t]|$)/ },
      {
        // double quoted keys - with brackets and special char support
        begin: /"[\w*@][\w*@ :()\./-]*":(?=[ \t]|$)/
      },
      {
        // single quoted keys - with brackets and special char support
        begin: /'[\w*@][\w*@ :()\./-]*':(?=[ \t]|$)/
      }
    ]
  }, i = {
    className: "template-variable",
    variants: [
      {
        // jinja templates Ansible
        begin: /\{\{/,
        end: /\}\}/
      },
      {
        // Ruby i18n
        begin: /%\{/,
        end: /\}/
      }
    ]
  }, o = {
    className: "string",
    relevance: 0,
    begin: /'/,
    end: /'/,
    contains: [
      {
        match: /''/,
        scope: "char.escape",
        relevance: 0
      }
    ]
  }, a = {
    className: "string",
    relevance: 0,
    variants: [
      {
        begin: /"/,
        end: /"/
      },
      { begin: /\S+/ }
    ],
    contains: [
      e.BACKSLASH_ESCAPE,
      i
    ]
  }, s = e.inherit(a, { variants: [
    {
      begin: /'/,
      end: /'/,
      contains: [
        {
          begin: /''/,
          relevance: 0
        }
      ]
    },
    {
      begin: /"/,
      end: /"/
    },
    { begin: /[^\s,{}[\]]+/ }
  ] }), p = {
    className: "number",
    begin: "\\b" + "[0-9]{4}(-[0-9][0-9]){0,2}" + "([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?" + "(\\.[0-9]*)?" + "([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?" + "\\b"
  }, f = {
    end: ",",
    endsWithParent: !0,
    excludeEnd: !0,
    keywords: n,
    relevance: 0
  }, g = {
    begin: /\{/,
    end: /\}/,
    contains: [f],
    illegal: "\\n",
    relevance: 0
  }, E = {
    begin: "\\[",
    end: "\\]",
    contains: [f],
    illegal: "\\n",
    relevance: 0
  }, _ = [
    r,
    {
      className: "meta",
      begin: "^---\\s*$",
      relevance: 10
    },
    {
      // multi line string
      // Blocks start with a | or > followed by a newline
      //
      // Indentation of subsequent lines must be the same to
      // be considered part of the block
      className: "string",
      begin: "[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*"
    },
    {
      // Ruby/Rails erb
      begin: "<%[%=-]?",
      end: "[%-]?%>",
      subLanguage: "ruby",
      excludeBegin: !0,
      excludeEnd: !0,
      relevance: 0
    },
    {
      // named tags
      className: "type",
      begin: "!\\w+!" + t
    },
    // https://yaml.org/spec/1.2/spec.html#id2784064
    {
      // verbatim tags
      className: "type",
      begin: "!<" + t + ">"
    },
    {
      // primary tags
      className: "type",
      begin: "!" + t
    },
    {
      // secondary tags
      className: "type",
      begin: "!!" + t
    },
    {
      // fragment id &ref
      className: "meta",
      begin: "&" + e.UNDERSCORE_IDENT_RE + "$"
    },
    {
      // fragment reference *ref
      className: "meta",
      begin: "\\*" + e.UNDERSCORE_IDENT_RE + "$"
    },
    {
      // array listing
      className: "bullet",
      // TODO: remove |$ hack when we have proper look-ahead support
      begin: "-(?=[ ]|$)",
      relevance: 0
    },
    e.HASH_COMMENT_MODE,
    {
      beginKeywords: n,
      keywords: { literal: n }
    },
    p,
    // numbers are any valid C-style number that
    // sit isolated from other words
    {
      className: "number",
      begin: e.C_NUMBER_RE + "\\b",
      relevance: 0
    },
    g,
    E,
    o,
    a
  ], h = [..._];
  return h.pop(), h.push(s), f.contains = h, {
    name: "YAML",
    case_insensitive: !0,
    aliases: ["yml"],
    contains: _
  };
}
const yh = {
  arduino: eg,
  bash: ng,
  c: tg,
  cpp: rg,
  csharp: ig,
  css: pg,
  diff: gg,
  go: hg,
  graphql: mg,
  ini: bg,
  java: Eg,
  javascript: xg,
  json: Ng,
  kotlin: vg,
  less: Lg,
  lua: Dg,
  makefile: Pg,
  markdown: Bg,
  objectivec: Fg,
  perl: zg,
  php: Ug,
  "php-template": $g,
  plaintext: Hg,
  python: Gg,
  "python-repl": qg,
  r: Kg,
  ruby: Wg,
  rust: Vg,
  scss: th,
  shell: rh,
  sql: ih,
  swift: fh,
  typescript: gh,
  vbnet: hh,
  wasm: mh,
  xml: bh,
  yaml: Eh
};
var dr, oa;
function _h() {
  if (oa) return dr;
  oa = 1;
  function e(b) {
    return b instanceof Map ? b.clear = b.delete = b.set = function() {
      throw new Error("map is read-only");
    } : b instanceof Set && (b.add = b.clear = b.delete = function() {
      throw new Error("set is read-only");
    }), Object.freeze(b), Object.getOwnPropertyNames(b).forEach((T) => {
      const F = b[T], ee = typeof F;
      (ee === "object" || ee === "function") && !Object.isFrozen(F) && e(F);
    }), b;
  }
  class n {
    /**
     * @param {CompiledMode} mode
     */
    constructor(T) {
      T.data === void 0 && (T.data = {}), this.data = T.data, this.isMatchIgnored = !1;
    }
    ignoreMatch() {
      this.isMatchIgnored = !0;
    }
  }
  function t(b) {
    return b.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  }
  function r(b, ...T) {
    const F = /* @__PURE__ */ Object.create(null);
    for (const ee in b)
      F[ee] = b[ee];
    return T.forEach(function(ee) {
      for (const _e in ee)
        F[_e] = ee[_e];
    }), /** @type {T} */
    F;
  }
  const i = "</span>", o = (b) => !!b.scope, a = (b, { prefix: T }) => {
    if (b.startsWith("language:"))
      return b.replace("language:", "language-");
    if (b.includes(".")) {
      const F = b.split(".");
      return [
        `${T}${F.shift()}`,
        ...F.map((ee, _e) => `${ee}${"_".repeat(_e + 1)}`)
      ].join(" ");
    }
    return `${T}${b}`;
  };
  class s {
    /**
     * Creates a new HTMLRenderer
     *
     * @param {Tree} parseTree - the parse tree (must support `walk` API)
     * @param {{classPrefix: string}} options
     */
    constructor(T, F) {
      this.buffer = "", this.classPrefix = F.classPrefix, T.walk(this);
    }
    /**
     * Adds texts to the output stream
     *
     * @param {string} text */
    addText(T) {
      this.buffer += t(T);
    }
    /**
     * Adds a node open to the output stream (if needed)
     *
     * @param {Node} node */
    openNode(T) {
      if (!o(T)) return;
      const F = a(
        T.scope,
        { prefix: this.classPrefix }
      );
      this.span(F);
    }
    /**
     * Adds a node close to the output stream (if needed)
     *
     * @param {Node} node */
    closeNode(T) {
      o(T) && (this.buffer += i);
    }
    /**
     * returns the accumulated buffer
    */
    value() {
      return this.buffer;
    }
    // helpers
    /**
     * Builds a span element
     *
     * @param {string} className */
    span(T) {
      this.buffer += `<span class="${T}">`;
    }
  }
  const l = (b = {}) => {
    const T = { children: [] };
    return Object.assign(T, b), T;
  };
  class c {
    constructor() {
      this.rootNode = l(), this.stack = [this.rootNode];
    }
    get top() {
      return this.stack[this.stack.length - 1];
    }
    get root() {
      return this.rootNode;
    }
    /** @param {Node} node */
    add(T) {
      this.top.children.push(T);
    }
    /** @param {string} scope */
    openNode(T) {
      const F = l({ scope: T });
      this.add(F), this.stack.push(F);
    }
    closeNode() {
      if (this.stack.length > 1)
        return this.stack.pop();
    }
    closeAllNodes() {
      for (; this.closeNode(); ) ;
    }
    toJSON() {
      return JSON.stringify(this.rootNode, null, 4);
    }
    /**
     * @typedef { import("./html_renderer").Renderer } Renderer
     * @param {Renderer} builder
     */
    walk(T) {
      return this.constructor._walk(T, this.rootNode);
    }
    /**
     * @param {Renderer} builder
     * @param {Node} node
     */
    static _walk(T, F) {
      return typeof F == "string" ? T.addText(F) : F.children && (T.openNode(F), F.children.forEach((ee) => this._walk(T, ee)), T.closeNode(F)), T;
    }
    /**
     * @param {Node} node
     */
    static _collapse(T) {
      typeof T != "string" && T.children && (T.children.every((F) => typeof F == "string") ? T.children = [T.children.join("")] : T.children.forEach((F) => {
        c._collapse(F);
      }));
    }
  }
  class d extends c {
    /**
     * @param {*} options
     */
    constructor(T) {
      super(), this.options = T;
    }
    /**
     * @param {string} text
     */
    addText(T) {
      T !== "" && this.add(T);
    }
    /** @param {string} scope */
    startScope(T) {
      this.openNode(T);
    }
    endScope() {
      this.closeNode();
    }
    /**
     * @param {Emitter & {root: DataNode}} emitter
     * @param {string} name
     */
    __addSublanguage(T, F) {
      const ee = T.root;
      F && (ee.scope = `language:${F}`), this.add(ee);
    }
    toHTML() {
      return new s(this, this.options).value();
    }
    finalize() {
      return this.closeAllNodes(), !0;
    }
  }
  function u(b) {
    return b ? typeof b == "string" ? b : b.source : null;
  }
  function p(b) {
    return E("(?=", b, ")");
  }
  function f(b) {
    return E("(?:", b, ")*");
  }
  function g(b) {
    return E("(?:", b, ")?");
  }
  function E(...b) {
    return b.map((F) => u(F)).join("");
  }
  function _(b) {
    const T = b[b.length - 1];
    return typeof T == "object" && T.constructor === Object ? (b.splice(b.length - 1, 1), T) : {};
  }
  function h(...b) {
    return "(" + (_(b).capture ? "" : "?:") + b.map((ee) => u(ee)).join("|") + ")";
  }
  function N(b) {
    return new RegExp(b.toString() + "|").exec("").length - 1;
  }
  function k(b, T) {
    const F = b && b.exec(T);
    return F && F.index === 0;
  }
  const v = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
  function I(b, { joinWith: T }) {
    let F = 0;
    return b.map((ee) => {
      F += 1;
      const _e = F;
      let ke = u(ee), K = "";
      for (; ke.length > 0; ) {
        const G = v.exec(ke);
        if (!G) {
          K += ke;
          break;
        }
        K += ke.substring(0, G.index), ke = ke.substring(G.index + G[0].length), G[0][0] === "\\" && G[1] ? K += "\\" + String(Number(G[1]) + _e) : (K += G[0], G[0] === "(" && F++);
      }
      return K;
    }).map((ee) => `(${ee})`).join(T);
  }
  const w = /\b\B/, P = "[a-zA-Z]\\w*", C = "[a-zA-Z_]\\w*", B = "\\b\\d+(\\.\\d+)?", x = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", D = "\\b(0b[01]+)", $ = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", ne = (b = {}) => {
    const T = /^#![ ]*\//;
    return b.binary && (b.begin = E(
      T,
      /.*\b/,
      b.binary,
      /\b.*/
    )), r({
      scope: "meta",
      begin: T,
      end: /$/,
      relevance: 0,
      /** @type {ModeCallback} */
      "on:begin": (F, ee) => {
        F.index !== 0 && ee.ignoreMatch();
      }
    }, b);
  }, z = {
    begin: "\\\\[\\s\\S]",
    relevance: 0
  }, O = {
    scope: "string",
    begin: "'",
    end: "'",
    illegal: "\\n",
    contains: [z]
  }, X = {
    scope: "string",
    begin: '"',
    end: '"',
    illegal: "\\n",
    contains: [z]
  }, H = {
    begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
  }, Z = function(b, T, F = {}) {
    const ee = r(
      {
        scope: "comment",
        begin: b,
        end: T,
        contains: []
      },
      F
    );
    ee.contains.push({
      scope: "doctag",
      // hack to avoid the space from being included. the space is necessary to
      // match here to prevent the plain text rule below from gobbling up doctags
      begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
      end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
      excludeBegin: !0,
      relevance: 0
    });
    const _e = h(
      // list of common 1 and 2 letter words in English
      "I",
      "a",
      "is",
      "so",
      "us",
      "to",
      "at",
      "if",
      "in",
      "it",
      "on",
      // note: this is not an exhaustive list of contractions, just popular ones
      /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
      // contractions - can't we'd they're let's, etc
      /[A-Za-z]+[-][a-z]+/,
      // `no-way`, etc.
      /[A-Za-z][a-z]{2,}/
      // allow capitalized words at beginning of sentences
    );
    return ee.contains.push(
      {
        // TODO: how to include ", (, ) without breaking grammars that use these for
        // comment delimiters?
        // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
        // ---
        // this tries to find sequences of 3 english words in a row (without any
        // "programming" type syntax) this gives us a strong signal that we've
        // TRULY found a comment - vs perhaps scanning with the wrong language.
        // It's possible to find something that LOOKS like the start of the
        // comment - but then if there is no readable text - good chance it is a
        // false match and not a comment.
        //
        // for a visual example please see:
        // https://github.com/highlightjs/highlight.js/issues/2827
        begin: E(
          /[ ]+/,
          // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
          "(",
          _e,
          /[.]?[:]?([.][ ]|[ ])/,
          "){3}"
        )
        // look for 3 words in a row
      }
    ), ee;
  }, le = Z("//", "$"), m = Z("/\\*", "\\*/"), fe = Z("#", "$"), ge = {
    scope: "number",
    begin: B,
    relevance: 0
  }, y = {
    scope: "number",
    begin: x,
    relevance: 0
  }, Ie = {
    scope: "number",
    begin: D,
    relevance: 0
  }, Ge = {
    scope: "regexp",
    begin: /\/(?=[^/\n]*\/)/,
    end: /\/[gimuy]*/,
    contains: [
      z,
      {
        begin: /\[/,
        end: /\]/,
        relevance: 0,
        contains: [z]
      }
    ]
  }, ye = {
    scope: "title",
    begin: P,
    relevance: 0
  }, tn = {
    scope: "title",
    begin: C,
    relevance: 0
  }, Pe = {
    // excludes method names from keyword processing
    begin: "\\.\\s*" + C,
    relevance: 0
  };
  var Be = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    APOS_STRING_MODE: O,
    BACKSLASH_ESCAPE: z,
    BINARY_NUMBER_MODE: Ie,
    BINARY_NUMBER_RE: D,
    COMMENT: Z,
    C_BLOCK_COMMENT_MODE: m,
    C_LINE_COMMENT_MODE: le,
    C_NUMBER_MODE: y,
    C_NUMBER_RE: x,
    END_SAME_AS_BEGIN: function(b) {
      return Object.assign(
        b,
        {
          /** @type {ModeCallback} */
          "on:begin": (T, F) => {
            F.data._beginMatch = T[1];
          },
          /** @type {ModeCallback} */
          "on:end": (T, F) => {
            F.data._beginMatch !== T[1] && F.ignoreMatch();
          }
        }
      );
    },
    HASH_COMMENT_MODE: fe,
    IDENT_RE: P,
    MATCH_NOTHING_RE: w,
    METHOD_GUARD: Pe,
    NUMBER_MODE: ge,
    NUMBER_RE: B,
    PHRASAL_WORDS_MODE: H,
    QUOTE_STRING_MODE: X,
    REGEXP_MODE: Ge,
    RE_STARTERS_RE: $,
    SHEBANG: ne,
    TITLE_MODE: ye,
    UNDERSCORE_IDENT_RE: C,
    UNDERSCORE_TITLE_MODE: tn
  });
  function fn(b, T) {
    b.input[b.index - 1] === "." && T.ignoreMatch();
  }
  function Fn(b, T) {
    b.className !== void 0 && (b.scope = b.className, delete b.className);
  }
  function zn(b, T) {
    T && b.beginKeywords && (b.begin = "\\b(" + b.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", b.__beforeBegin = fn, b.keywords = b.keywords || b.beginKeywords, delete b.beginKeywords, b.relevance === void 0 && (b.relevance = 0));
  }
  function Un(b, T) {
    Array.isArray(b.illegal) && (b.illegal = h(...b.illegal));
  }
  function vn(b, T) {
    if (b.match) {
      if (b.begin || b.end) throw new Error("begin & end are not supported with match");
      b.begin = b.match, delete b.match;
    }
  }
  function ce(b, T) {
    b.relevance === void 0 && (b.relevance = 1);
  }
  const an = (b, T) => {
    if (!b.beforeMatch) return;
    if (b.starts) throw new Error("beforeMatch cannot be used with starts");
    const F = Object.assign({}, b);
    Object.keys(b).forEach((ee) => {
      delete b[ee];
    }), b.keywords = F.keywords, b.begin = E(F.beforeMatch, p(F.begin)), b.starts = {
      relevance: 0,
      contains: [
        Object.assign(F, { endsParent: !0 })
      ]
    }, b.relevance = 0, delete F.beforeMatch;
  }, on = [
    "of",
    "and",
    "for",
    "in",
    "not",
    "or",
    "if",
    "then",
    "parent",
    // common variable name
    "list",
    // common variable name
    "value"
    // common variable name
  ], Tn = "keyword";
  function $n(b, T, F = Tn) {
    const ee = /* @__PURE__ */ Object.create(null);
    return typeof b == "string" ? _e(F, b.split(" ")) : Array.isArray(b) ? _e(F, b) : Object.keys(b).forEach(function(ke) {
      Object.assign(
        ee,
        $n(b[ke], T, ke)
      );
    }), ee;
    function _e(ke, K) {
      T && (K = K.map((G) => G.toLowerCase())), K.forEach(function(G) {
        const J = G.split("|");
        ee[J[0]] = [ke, Ft(J[0], J[1])];
      });
    }
  }
  function Ft(b, T) {
    return T ? Number(T) : zt(b) ? 0 : 1;
  }
  function zt(b) {
    return on.includes(b.toLowerCase());
  }
  const at = {}, sn = (b) => {
    console.error(b);
  }, ot = (b, ...T) => {
    console.log(`WARN: ${b}`, ...T);
  }, S = (b, T) => {
    at[`${b}/${T}`] || (console.log(`Deprecated as of ${b}. ${T}`), at[`${b}/${T}`] = !0);
  }, L = new Error();
  function Q(b, T, { key: F }) {
    let ee = 0;
    const _e = b[F], ke = {}, K = {};
    for (let G = 1; G <= T.length; G++)
      K[G + ee] = _e[G], ke[G + ee] = !0, ee += N(T[G - 1]);
    b[F] = K, b[F]._emit = ke, b[F]._multi = !0;
  }
  function ie(b) {
    if (Array.isArray(b.begin)) {
      if (b.skip || b.excludeBegin || b.returnBegin)
        throw sn("skip, excludeBegin, returnBegin not compatible with beginScope: {}"), L;
      if (typeof b.beginScope != "object" || b.beginScope === null)
        throw sn("beginScope must be object"), L;
      Q(b, b.begin, { key: "beginScope" }), b.begin = I(b.begin, { joinWith: "" });
    }
  }
  function ue(b) {
    if (Array.isArray(b.end)) {
      if (b.skip || b.excludeEnd || b.returnEnd)
        throw sn("skip, excludeEnd, returnEnd not compatible with endScope: {}"), L;
      if (typeof b.endScope != "object" || b.endScope === null)
        throw sn("endScope must be object"), L;
      Q(b, b.end, { key: "endScope" }), b.end = I(b.end, { joinWith: "" });
    }
  }
  function Fe(b) {
    b.scope && typeof b.scope == "object" && b.scope !== null && (b.beginScope = b.scope, delete b.scope);
  }
  function ln(b) {
    Fe(b), typeof b.beginScope == "string" && (b.beginScope = { _wrap: b.beginScope }), typeof b.endScope == "string" && (b.endScope = { _wrap: b.endScope }), ie(b), ue(b);
  }
  function We(b) {
    function T(K, G) {
      return new RegExp(
        u(K),
        "m" + (b.case_insensitive ? "i" : "") + (b.unicodeRegex ? "u" : "") + (G ? "g" : "")
      );
    }
    class F {
      constructor() {
        this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0;
      }
      // @ts-ignore
      addRule(G, J) {
        J.position = this.position++, this.matchIndexes[this.matchAt] = J, this.regexes.push([J, G]), this.matchAt += N(G) + 1;
      }
      compile() {
        this.regexes.length === 0 && (this.exec = () => null);
        const G = this.regexes.map((J) => J[1]);
        this.matcherRe = T(I(G, { joinWith: "|" }), !0), this.lastIndex = 0;
      }
      /** @param {string} s */
      exec(G) {
        this.matcherRe.lastIndex = this.lastIndex;
        const J = this.matcherRe.exec(G);
        if (!J)
          return null;
        const Se = J.findIndex((Hn, Ut) => Ut > 0 && Hn !== void 0), we = this.matchIndexes[Se];
        return J.splice(0, Se), Object.assign(J, we);
      }
    }
    class ee {
      constructor() {
        this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0;
      }
      // @ts-ignore
      getMatcher(G) {
        if (this.multiRegexes[G]) return this.multiRegexes[G];
        const J = new F();
        return this.rules.slice(G).forEach(([Se, we]) => J.addRule(Se, we)), J.compile(), this.multiRegexes[G] = J, J;
      }
      resumingScanAtSamePosition() {
        return this.regexIndex !== 0;
      }
      considerAll() {
        this.regexIndex = 0;
      }
      // @ts-ignore
      addRule(G, J) {
        this.rules.push([G, J]), J.type === "begin" && this.count++;
      }
      /** @param {string} s */
      exec(G) {
        const J = this.getMatcher(this.regexIndex);
        J.lastIndex = this.lastIndex;
        let Se = J.exec(G);
        if (this.resumingScanAtSamePosition() && !(Se && Se.index === this.lastIndex)) {
          const we = this.getMatcher(0);
          we.lastIndex = this.lastIndex + 1, Se = we.exec(G);
        }
        return Se && (this.regexIndex += Se.position + 1, this.regexIndex === this.count && this.considerAll()), Se;
      }
    }
    function _e(K) {
      const G = new ee();
      return K.contains.forEach((J) => G.addRule(J.begin, { rule: J, type: "begin" })), K.terminatorEnd && G.addRule(K.terminatorEnd, { type: "end" }), K.illegal && G.addRule(K.illegal, { type: "illegal" }), G;
    }
    function ke(K, G) {
      const J = (
        /** @type CompiledMode */
        K
      );
      if (K.isCompiled) return J;
      [
        Fn,
        // do this early so compiler extensions generally don't have to worry about
        // the distinction between match/begin
        vn,
        ln,
        an
      ].forEach((we) => we(K, G)), b.compilerExtensions.forEach((we) => we(K, G)), K.__beforeBegin = null, [
        zn,
        // do this later so compiler extensions that come earlier have access to the
        // raw array if they wanted to perhaps manipulate it, etc.
        Un,
        // default to 1 relevance if not specified
        ce
      ].forEach((we) => we(K, G)), K.isCompiled = !0;
      let Se = null;
      return typeof K.keywords == "object" && K.keywords.$pattern && (K.keywords = Object.assign({}, K.keywords), Se = K.keywords.$pattern, delete K.keywords.$pattern), Se = Se || /\w+/, K.keywords && (K.keywords = $n(K.keywords, b.case_insensitive)), J.keywordPatternRe = T(Se, !0), G && (K.begin || (K.begin = /\B|\b/), J.beginRe = T(J.begin), !K.end && !K.endsWithParent && (K.end = /\B|\b/), K.end && (J.endRe = T(J.end)), J.terminatorEnd = u(J.end) || "", K.endsWithParent && G.terminatorEnd && (J.terminatorEnd += (K.end ? "|" : "") + G.terminatorEnd)), K.illegal && (J.illegalRe = T(
        /** @type {RegExp | string} */
        K.illegal
      )), K.contains || (K.contains = []), K.contains = [].concat(...K.contains.map(function(we) {
        return yn(we === "self" ? K : we);
      })), K.contains.forEach(function(we) {
        ke(
          /** @type Mode */
          we,
          J
        );
      }), K.starts && ke(K.starts, G), J.matcher = _e(J), J;
    }
    if (b.compilerExtensions || (b.compilerExtensions = []), b.contains && b.contains.includes("self"))
      throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
    return b.classNameAliases = r(b.classNameAliases || {}), ke(
      /** @type Mode */
      b
    );
  }
  function pn(b) {
    return b ? b.endsWithParent || pn(b.starts) : !1;
  }
  function yn(b) {
    return b.variants && !b.cachedVariants && (b.cachedVariants = b.variants.map(function(T) {
      return r(b, { variants: null }, T);
    })), b.cachedVariants ? b.cachedVariants : pn(b) ? r(b, { starts: b.starts ? r(b.starts) : null }) : Object.isFrozen(b) ? r(b) : b;
  }
  var Oe = "11.11.1";
  class gn extends Error {
    constructor(T, F) {
      super(T), this.name = "HTMLInjectionError", this.html = F;
    }
  }
  const ze = t, Xr = r, Qr = /* @__PURE__ */ Symbol("nomatch"), Zo = 7, Jr = function(b) {
    const T = /* @__PURE__ */ Object.create(null), F = /* @__PURE__ */ Object.create(null), ee = [];
    let _e = !0;
    const ke = "Could not find the language '{}', did you forget to load/include a language module?", K = { disableAutodetect: !0, name: "Plain text", contains: [] };
    let G = {
      ignoreUnescapedHTML: !1,
      throwUnescapedHTML: !1,
      noHighlightRe: /^(no-?highlight)$/i,
      languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
      classPrefix: "hljs-",
      cssSelector: "pre code",
      languages: null,
      // beta configuration options, subject to change, welcome to discuss
      // https://github.com/highlightjs/highlight.js/issues/1086
      __emitter: d
    };
    function J(M) {
      return G.noHighlightRe.test(M);
    }
    function Se(M) {
      let V = M.className + " ";
      V += M.parentNode ? M.parentNode.className : "";
      const oe = G.languageDetectRe.exec(V);
      if (oe) {
        const be = hn(oe[1]);
        return be || (ot(ke.replace("{}", oe[1])), ot("Falling back to no-highlight mode for this block.", M)), be ? oe[1] : "no-highlight";
      }
      return V.split(/\s+/).find((be) => J(be) || hn(be));
    }
    function we(M, V, oe) {
      let be = "", Ne = "";
      typeof V == "object" ? (be = M, oe = V.ignoreIllegals, Ne = V.language) : (S("10.7.0", "highlight(lang, code, ...args) has been deprecated."), S("10.7.0", `Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`), Ne = M, be = V), oe === void 0 && (oe = !0);
      const Ve = {
        code: be,
        language: Ne
      };
      lt("before:highlight", Ve);
      const mn = Ve.result ? Ve.result : Hn(Ve.language, Ve.code, oe);
      return mn.code = Ve.code, lt("after:highlight", mn), mn;
    }
    function Hn(M, V, oe, be) {
      const Ne = /* @__PURE__ */ Object.create(null);
      function Ve(U, W) {
        return U.keywords[W];
      }
      function mn() {
        if (!te.keywords) {
          ve.addText(Ee);
          return;
        }
        let U = 0;
        te.keywordPatternRe.lastIndex = 0;
        let W = te.keywordPatternRe.exec(Ee), re = "";
        for (; W; ) {
          re += Ee.substring(U, W.index);
          const de = Xe.case_insensitive ? W[0].toLowerCase() : W[0], Te = Ve(te, de);
          if (Te) {
            const [cn, fs] = Te;
            if (ve.addText(re), re = "", Ne[de] = (Ne[de] || 0) + 1, Ne[de] <= Zo && (dt += fs), cn.startsWith("_"))
              re += W[0];
            else {
              const ps = Xe.classNameAliases[cn] || cn;
              Ze(W[0], ps);
            }
          } else
            re += W[0];
          U = te.keywordPatternRe.lastIndex, W = te.keywordPatternRe.exec(Ee);
        }
        re += Ee.substring(U), ve.addText(re);
      }
      function ct() {
        if (Ee === "") return;
        let U = null;
        if (typeof te.subLanguage == "string") {
          if (!T[te.subLanguage]) {
            ve.addText(Ee);
            return;
          }
          U = Hn(te.subLanguage, Ee, !0, oi[te.subLanguage]), oi[te.subLanguage] = /** @type {CompiledMode} */
          U._top;
        } else
          U = $t(Ee, te.subLanguage.length ? te.subLanguage : null);
        te.relevance > 0 && (dt += U.relevance), ve.__addSublanguage(U._emitter, U.language);
      }
      function Ue() {
        te.subLanguage != null ? ct() : mn(), Ee = "";
      }
      function Ze(U, W) {
        U !== "" && (ve.startScope(W), ve.addText(U), ve.endScope());
      }
      function ti(U, W) {
        let re = 1;
        const de = W.length - 1;
        for (; re <= de; ) {
          if (!U._emit[re]) {
            re++;
            continue;
          }
          const Te = Xe.classNameAliases[U[re]] || U[re], cn = W[re];
          Te ? Ze(cn, Te) : (Ee = cn, mn(), Ee = ""), re++;
        }
      }
      function ri(U, W) {
        return U.scope && typeof U.scope == "string" && ve.openNode(Xe.classNameAliases[U.scope] || U.scope), U.beginScope && (U.beginScope._wrap ? (Ze(Ee, Xe.classNameAliases[U.beginScope._wrap] || U.beginScope._wrap), Ee = "") : U.beginScope._multi && (ti(U.beginScope, W), Ee = "")), te = Object.create(U, { parent: { value: te } }), te;
      }
      function ii(U, W, re) {
        let de = k(U.endRe, re);
        if (de) {
          if (U["on:end"]) {
            const Te = new n(U);
            U["on:end"](W, Te), Te.isMatchIgnored && (de = !1);
          }
          if (de) {
            for (; U.endsParent && U.parent; )
              U = U.parent;
            return U;
          }
        }
        if (U.endsWithParent)
          return ii(U.parent, W, re);
      }
      function ss(U) {
        return te.matcher.regexIndex === 0 ? (Ee += U[0], 1) : (Kt = !0, 0);
      }
      function ls(U) {
        const W = U[0], re = U.rule, de = new n(re), Te = [re.__beforeBegin, re["on:begin"]];
        for (const cn of Te)
          if (cn && (cn(U, de), de.isMatchIgnored))
            return ss(W);
        return re.skip ? Ee += W : (re.excludeBegin && (Ee += W), Ue(), !re.returnBegin && !re.excludeBegin && (Ee = W)), ri(re, U), re.returnBegin ? 0 : W.length;
      }
      function cs(U) {
        const W = U[0], re = V.substring(U.index), de = ii(te, U, re);
        if (!de)
          return Qr;
        const Te = te;
        te.endScope && te.endScope._wrap ? (Ue(), Ze(W, te.endScope._wrap)) : te.endScope && te.endScope._multi ? (Ue(), ti(te.endScope, U)) : Te.skip ? Ee += W : (Te.returnEnd || Te.excludeEnd || (Ee += W), Ue(), Te.excludeEnd && (Ee = W));
        do
          te.scope && ve.closeNode(), !te.skip && !te.subLanguage && (dt += te.relevance), te = te.parent;
        while (te !== de.parent);
        return de.starts && ri(de.starts, U), Te.returnEnd ? 0 : W.length;
      }
      function us() {
        const U = [];
        for (let W = te; W !== Xe; W = W.parent)
          W.scope && U.unshift(W.scope);
        U.forEach((W) => ve.openNode(W));
      }
      let ut = {};
      function ai(U, W) {
        const re = W && W[0];
        if (Ee += U, re == null)
          return Ue(), 0;
        if (ut.type === "begin" && W.type === "end" && ut.index === W.index && re === "") {
          if (Ee += V.slice(W.index, W.index + 1), !_e) {
            const de = new Error(`0 width match regex (${M})`);
            throw de.languageName = M, de.badRule = ut.rule, de;
          }
          return 1;
        }
        if (ut = W, W.type === "begin")
          return ls(W);
        if (W.type === "illegal" && !oe) {
          const de = new Error('Illegal lexeme "' + re + '" for mode "' + (te.scope || "<unnamed>") + '"');
          throw de.mode = te, de;
        } else if (W.type === "end") {
          const de = cs(W);
          if (de !== Qr)
            return de;
        }
        if (W.type === "illegal" && re === "")
          return Ee += `
`, 1;
        if (qt > 1e5 && qt > W.index * 3)
          throw new Error("potential infinite loop, way more iterations than matches");
        return Ee += re, re.length;
      }
      const Xe = hn(M);
      if (!Xe)
        throw sn(ke.replace("{}", M)), new Error('Unknown language: "' + M + '"');
      const ds = We(Xe);
      let Gt = "", te = be || ds;
      const oi = {}, ve = new G.__emitter(G);
      us();
      let Ee = "", dt = 0, _n = 0, qt = 0, Kt = !1;
      try {
        if (Xe.__emitTokens)
          Xe.__emitTokens(V, ve);
        else {
          for (te.matcher.considerAll(); ; ) {
            qt++, Kt ? Kt = !1 : te.matcher.considerAll(), te.matcher.lastIndex = _n;
            const U = te.matcher.exec(V);
            if (!U) break;
            const W = V.substring(_n, U.index), re = ai(W, U);
            _n = U.index + re;
          }
          ai(V.substring(_n));
        }
        return ve.finalize(), Gt = ve.toHTML(), {
          language: M,
          value: Gt,
          relevance: dt,
          illegal: !1,
          _emitter: ve,
          _top: te
        };
      } catch (U) {
        if (U.message && U.message.includes("Illegal"))
          return {
            language: M,
            value: ze(V),
            illegal: !0,
            relevance: 0,
            _illegalBy: {
              message: U.message,
              index: _n,
              context: V.slice(_n - 100, _n + 100),
              mode: U.mode,
              resultSoFar: Gt
            },
            _emitter: ve
          };
        if (_e)
          return {
            language: M,
            value: ze(V),
            illegal: !1,
            relevance: 0,
            errorRaised: U,
            _emitter: ve,
            _top: te
          };
        throw U;
      }
    }
    function Ut(M) {
      const V = {
        value: ze(M),
        illegal: !1,
        relevance: 0,
        _top: K,
        _emitter: new G.__emitter(G)
      };
      return V._emitter.addText(M), V;
    }
    function $t(M, V) {
      V = V || G.languages || Object.keys(T);
      const oe = Ut(M), be = V.filter(hn).filter(ni).map(
        (Ue) => Hn(Ue, M, !1)
      );
      be.unshift(oe);
      const Ne = be.sort((Ue, Ze) => {
        if (Ue.relevance !== Ze.relevance) return Ze.relevance - Ue.relevance;
        if (Ue.language && Ze.language) {
          if (hn(Ue.language).supersetOf === Ze.language)
            return 1;
          if (hn(Ze.language).supersetOf === Ue.language)
            return -1;
        }
        return 0;
      }), [Ve, mn] = Ne, ct = Ve;
      return ct.secondBest = mn, ct;
    }
    function Xo(M, V, oe) {
      const be = V && F[V] || oe;
      M.classList.add("hljs"), M.classList.add(`language-${be}`);
    }
    function Ht(M) {
      let V = null;
      const oe = Se(M);
      if (J(oe)) return;
      if (lt(
        "before:highlightElement",
        { el: M, language: oe }
      ), M.dataset.highlighted) {
        console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", M);
        return;
      }
      if (M.children.length > 0 && (G.ignoreUnescapedHTML || (console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."), console.warn("https://github.com/highlightjs/highlight.js/wiki/security"), console.warn("The element with unescaped HTML:"), console.warn(M)), G.throwUnescapedHTML))
        throw new gn(
          "One of your code blocks includes unescaped HTML.",
          M.innerHTML
        );
      V = M;
      const be = V.textContent, Ne = oe ? we(be, { language: oe, ignoreIllegals: !0 }) : $t(be);
      M.innerHTML = Ne.value, M.dataset.highlighted = "yes", Xo(M, oe, Ne.language), M.result = {
        language: Ne.language,
        // TODO: remove with version 11.0
        re: Ne.relevance,
        relevance: Ne.relevance
      }, Ne.secondBest && (M.secondBest = {
        language: Ne.secondBest.language,
        relevance: Ne.secondBest.relevance
      }), lt("after:highlightElement", { el: M, result: Ne, text: be });
    }
    function Qo(M) {
      G = Xr(G, M);
    }
    const Jo = () => {
      st(), S("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
    };
    function jo() {
      st(), S("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
    }
    let jr = !1;
    function st() {
      function M() {
        st();
      }
      if (document.readyState === "loading") {
        jr || window.addEventListener("DOMContentLoaded", M, !1), jr = !0;
        return;
      }
      document.querySelectorAll(G.cssSelector).forEach(Ht);
    }
    function es(M, V) {
      let oe = null;
      try {
        oe = V(b);
      } catch (be) {
        if (sn("Language definition for '{}' could not be registered.".replace("{}", M)), _e)
          sn(be);
        else
          throw be;
        oe = K;
      }
      oe.name || (oe.name = M), T[M] = oe, oe.rawDefinition = V.bind(null, b), oe.aliases && ei(oe.aliases, { languageName: M });
    }
    function ns(M) {
      delete T[M];
      for (const V of Object.keys(F))
        F[V] === M && delete F[V];
    }
    function ts() {
      return Object.keys(T);
    }
    function hn(M) {
      return M = (M || "").toLowerCase(), T[M] || T[F[M]];
    }
    function ei(M, { languageName: V }) {
      typeof M == "string" && (M = [M]), M.forEach((oe) => {
        F[oe.toLowerCase()] = V;
      });
    }
    function ni(M) {
      const V = hn(M);
      return V && !V.disableAutodetect;
    }
    function rs(M) {
      M["before:highlightBlock"] && !M["before:highlightElement"] && (M["before:highlightElement"] = (V) => {
        M["before:highlightBlock"](
          Object.assign({ block: V.el }, V)
        );
      }), M["after:highlightBlock"] && !M["after:highlightElement"] && (M["after:highlightElement"] = (V) => {
        M["after:highlightBlock"](
          Object.assign({ block: V.el }, V)
        );
      });
    }
    function is(M) {
      rs(M), ee.push(M);
    }
    function as(M) {
      const V = ee.indexOf(M);
      V !== -1 && ee.splice(V, 1);
    }
    function lt(M, V) {
      const oe = M;
      ee.forEach(function(be) {
        be[oe] && be[oe](V);
      });
    }
    function os(M) {
      return S("10.7.0", "highlightBlock will be removed entirely in v12.0"), S("10.7.0", "Please use highlightElement now."), Ht(M);
    }
    Object.assign(b, {
      highlight: we,
      highlightAuto: $t,
      highlightAll: st,
      highlightElement: Ht,
      // TODO: Remove with v12 API
      highlightBlock: os,
      configure: Qo,
      initHighlighting: Jo,
      initHighlightingOnLoad: jo,
      registerLanguage: es,
      unregisterLanguage: ns,
      listLanguages: ts,
      getLanguage: hn,
      registerAliases: ei,
      autoDetection: ni,
      inherit: Xr,
      addPlugin: is,
      removePlugin: as
    }), b.debugMode = function() {
      _e = !1;
    }, b.safeMode = function() {
      _e = !0;
    }, b.versionString = Oe, b.regex = {
      concat: E,
      lookahead: p,
      either: h,
      optional: g,
      anyNumberOfTimes: f
    };
    for (const M in Be)
      typeof Be[M] == "object" && e(Be[M]);
    return Object.assign(b, Be), b;
  }, Cn = Jr({});
  return Cn.newInstance = () => Jr({}), dr = Cn, Cn.HighlightJS = Cn, Cn.default = Cn, dr;
}
var kh = /* @__PURE__ */ _h();
const wh = /* @__PURE__ */ Rr(kh), sa = {}, xh = "hljs-";
function Nh(e) {
  const n = wh.newInstance();
  return e && o(e), {
    highlight: t,
    highlightAuto: r,
    listLanguages: i,
    register: o,
    registerAlias: a,
    registered: s
  };
  function t(l, c, d) {
    const u = d || sa, p = typeof u.prefix == "string" ? u.prefix : xh;
    if (!n.getLanguage(l))
      throw new Error("Unknown language: `" + l + "` is not registered");
    n.configure({ __emitter: Sh, classPrefix: p });
    const f = (
      /** @type {HighlightResult & {_emitter: HastEmitter}} */
      n.highlight(c, { ignoreIllegals: !0, language: l })
    );
    if (f.errorRaised)
      throw new Error("Could not highlight with `Highlight.js`", {
        cause: f.errorRaised
      });
    const g = f._emitter.root, E = (
      /** @type {RootData} */
      g.data
    );
    return E.language = f.language, E.relevance = f.relevance, g;
  }
  function r(l, c) {
    const u = (c || sa).subset || i();
    let p = -1, f = 0, g;
    for (; ++p < u.length; ) {
      const E = u[p];
      if (!n.getLanguage(E)) continue;
      const _ = t(E, l, c);
      _.data && _.data.relevance !== void 0 && _.data.relevance > f && (f = _.data.relevance, g = _);
    }
    return g || {
      type: "root",
      children: [],
      data: { language: void 0, relevance: f }
    };
  }
  function i() {
    return n.listLanguages();
  }
  function o(l, c) {
    if (typeof l == "string")
      n.registerLanguage(l, c);
    else {
      let d;
      for (d in l)
        Object.hasOwn(l, d) && n.registerLanguage(d, l[d]);
    }
  }
  function a(l, c) {
    if (typeof l == "string")
      n.registerAliases(
        // Note: copy needed because hljs doesn’t accept readonly arrays yet.
        typeof c == "string" ? c : [...c],
        { languageName: l }
      );
    else {
      let d;
      for (d in l)
        if (Object.hasOwn(l, d)) {
          const u = l[d];
          n.registerAliases(
            // Note: copy needed because hljs doesn’t accept readonly arrays yet.
            typeof u == "string" ? u : [...u],
            { languageName: d }
          );
        }
    }
  }
  function s(l) {
    return !!n.getLanguage(l);
  }
}
class Sh {
  /**
   * @param {Readonly<HljsOptions>} options
   *   Configuration.
   * @returns
   *   Instance.
   */
  constructor(n) {
    this.options = n, this.root = {
      type: "root",
      children: [],
      data: { language: void 0, relevance: 0 }
    }, this.stack = [this.root];
  }
  /**
   * @param {string} value
   *   Text to add.
   * @returns {undefined}
   *   Nothing.
   *
   */
  addText(n) {
    if (n === "") return;
    const t = this.stack[this.stack.length - 1], r = t.children[t.children.length - 1];
    r && r.type === "text" ? r.value += n : t.children.push({ type: "text", value: n });
  }
  /**
   *
   * @param {unknown} rawName
   *   Name to add.
   * @returns {undefined}
   *   Nothing.
   */
  startScope(n) {
    this.openNode(String(n));
  }
  /**
   * @returns {undefined}
   *   Nothing.
   */
  endScope() {
    this.closeNode();
  }
  /**
   * @param {HastEmitter} other
   *   Other emitter.
   * @param {string} name
   *   Name of the sublanguage.
   * @returns {undefined}
   *   Nothing.
   */
  __addSublanguage(n, t) {
    const r = this.stack[this.stack.length - 1], i = (
      /** @type {Array<ElementContent>} */
      n.root.children
    );
    t ? r.children.push({
      type: "element",
      tagName: "span",
      properties: { className: [t] },
      children: i
    }) : r.children.push(...i);
  }
  /**
   * @param {string} name
   *   Name to add.
   * @returns {undefined}
   *   Nothing.
   */
  openNode(n) {
    const t = this, r = n.split(".").map(function(a, s) {
      return s ? a + "_".repeat(s) : t.options.classPrefix + a;
    }), i = this.stack[this.stack.length - 1], o = {
      type: "element",
      tagName: "span",
      properties: { className: r },
      children: []
    };
    i.children.push(o), this.stack.push(o);
  }
  /**
   * @returns {undefined}
   *   Nothing.
   */
  closeNode() {
    this.stack.pop();
  }
  /**
   * @returns {undefined}
   *   Nothing.
   */
  finalize() {
  }
  /**
   * @returns {string}
   *   Nothing.
   */
  toHTML() {
    return "";
  }
}
const vh = {};
function Yo(e) {
  const n = e || vh, t = n.aliases, r = n.detect || !1, i = n.languages || yh, o = n.plainText, a = n.prefix, s = n.subset;
  let l = "hljs";
  const c = Nh(i);
  if (t && c.registerAlias(t), a) {
    const d = a.indexOf("-");
    l = d === -1 ? a : a.slice(0, d);
  }
  return function(d, u) {
    Dt(d, "element", function(p, f, g) {
      if (p.tagName !== "code" || !g || g.type !== "element" || g.tagName !== "pre")
        return;
      const E = Th(p);
      if (E === !1 || !E && !r || E && o && o.includes(E))
        return;
      Array.isArray(p.properties.className) || (p.properties.className = []), p.properties.className.includes(l) || p.properties.className.unshift(l);
      const _ = Wp(p, { whitespace: "pre" });
      let h;
      try {
        h = E ? c.highlight(E, _, { prefix: a }) : c.highlightAuto(_, { prefix: a, subset: s });
      } catch (N) {
        const k = (
          /** @type {Error} */
          N
        );
        if (E && /Unknown language/.test(k.message)) {
          u.message(
            "Cannot highlight as `" + E + "`, it’s not registered",
            {
              ancestors: [g, p],
              cause: k,
              place: p.position,
              ruleId: "missing-language",
              source: "rehype-highlight"
            }
          );
          return;
        }
        throw k;
      }
      !E && h.data && h.data.language && p.properties.className.push("language-" + h.data.language), h.children.length > 0 && (p.children = /** @type {Array<ElementContent>} */
      h.children);
    });
  };
}
function Th(e) {
  const n = e.properties.className;
  let t = -1;
  if (!Array.isArray(n))
    return;
  let r;
  for (; ++t < n.length; ) {
    const i = String(n[t]);
    if (i === "no-highlight" || i === "nohighlight")
      return !1;
    !r && i.slice(0, 5) === "lang-" && (r = i.slice(5)), !r && i.slice(0, 9) === "language-" && (r = i.slice(9));
  }
  return r;
}
function Ch(e) {
  for (const n of gs.toArray(e)) {
    if (!hs(n)) continue;
    const r = (typeof n.props.className == "string" ? n.props.className : "").match(/language-([a-z0-9_-]+)/i);
    if (r?.[1])
      return r[1].toLowerCase();
  }
  return "text";
}
async function Ah(e) {
  if (e) {
    if (typeof navigator < "u" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(e);
      return;
    }
    if (typeof document < "u") {
      const n = document.createElement("textarea");
      n.value = e, n.style.position = "fixed", n.style.opacity = "0", document.body.appendChild(n), n.focus(), n.select(), document.execCommand("copy"), document.body.removeChild(n);
    }
  }
}
function Ih({ children: e }) {
  const n = Ln(null), t = Ln(null), [r, i] = Ke(!1), o = un(() => Ch(e), [e]);
  return xt(() => () => {
    t.current && window.clearTimeout(t.current);
  }, []), /* @__PURE__ */ q("div", { className: "chat-ui-code-block", children: [
    /* @__PURE__ */ q("div", { className: "chat-ui-code-toolbar", children: [
      /* @__PURE__ */ A("span", { className: "chat-ui-code-language", children: o }),
      /* @__PURE__ */ A("button", { type: "button", className: "chat-ui-copy-btn", onClick: async () => {
        const l = n.current?.querySelector("code")?.innerText ?? n.current?.innerText ?? "";
        l.trim() && (await Ah(l), i(!0), t.current && window.clearTimeout(t.current), t.current = window.setTimeout(() => {
          i(!1), t.current = null;
        }, 1200));
      }, children: r ? "Copied" : "Copy" })
    ] }),
    /* @__PURE__ */ A("pre", { ref: n, children: e })
  ] });
}
function Oh({ part: e, message: n, index: t, context: r }) {
  const { text: i } = e, o = n.role === "assistant", a = !!n.metadata?.isMeta, s = !!r?.chatUiIsLatest, l = typeof r?.chatUiTypingMessageId == "string" ? r.chatUiTypingMessageId : null, c = o && !a && s && l === n.uuid && i.length > 0, [d, u] = Ke(i), p = Ln(""), f = Ln(null);
  xt(() => () => {
    f.current && window.clearInterval(f.current);
  }, []), xt(() => {
    const E = `${n.uuid}:${t}`;
    if (!c) {
      u(i);
      return;
    }
    if (p.current === E) {
      u(i);
      return;
    }
    p.current = E, f.current && (window.clearInterval(f.current), f.current = null), u("");
    let _ = 0;
    const h = () => {
      _ = Math.min(i.length, _ + 2), u(i.slice(0, _)), _ >= i.length && f.current && (window.clearInterval(f.current), f.current = null);
    };
    return h(), f.current = window.setInterval(h, 18), () => {
      f.current && (window.clearInterval(f.current), f.current = null);
    };
  }, [t, n.uuid, c, i]);
  const g = un(
    () => ({
      pre: ({ children: E }) => /* @__PURE__ */ A(Ih, { children: E })
    }),
    []
  );
  return /* @__PURE__ */ A("div", { className: "chat-ui-markdown break-words", children: /* @__PURE__ */ A(
    no,
    {
      remarkPlugins: [vo],
      rehypePlugins: [Yo],
      components: g,
      children: d
    }
  ) });
}
function Rh(e) {
  return Array.from(new Set(e));
}
function Mh(e) {
  return e == null ? null : e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(1)}s`;
}
function Qe(...e) {
  return e.filter(Boolean).join(" ");
}
function Lh({
  items: e,
  defaultExpandedKeys: n,
  expandedKeys: t,
  onExpand: r,
  collapsible: i = !0,
  line: o = !0,
  size: a = "md",
  renderContent: s,
  renderHeader: l,
  className: c,
  classNames: d,
  style: u,
  styles: p
}) {
  const f = un(() => n || e.filter((k) => k.status === "running").map((k) => k.key), [n, e]), [g, E] = Ke(f), _ = t ?? g, h = un(() => new Set(_), [_]), N = (k) => {
    if (!(k.collapsible ?? i) || k.disabled) return;
    const I = !h.has(k.key), w = I ? Rh([..._, k.key]) : _.filter((P) => P !== k.key);
    t == null && E(w), r?.(w, { key: k.key, expanded: I });
  };
  return /* @__PURE__ */ A(
    "div",
    {
      className: Qe(
        "chat-ui-thought-chain",
        `chat-ui-thought-chain-${a}`,
        o && "has-line",
        d?.root,
        c
      ),
      style: { ...p?.root, ...u },
      children: e.map((k, v) => {
        const I = h.has(k.key), w = k.collapsible ?? i, P = k.content != null, C = w && P && !k.disabled, B = Mh(k.durationMs), x = k.status ?? "success";
        return /* @__PURE__ */ q(
          "section",
          {
            className: Qe(
              "chat-ui-thought-chain-item",
              `is-${x}`,
              I && "is-expanded",
              w && P && !k.disabled && "is-collapsible",
              k.disabled && "is-disabled",
              k.className,
              d?.item
            ),
            style: p?.item,
            children: [
              /* @__PURE__ */ q(
                "div",
                {
                  className: Qe("chat-ui-thought-chain-header", d?.header),
                  style: p?.header,
                  role: C ? "button" : void 0,
                  tabIndex: C ? 0 : void 0,
                  "aria-expanded": C ? I : void 0,
                  "aria-disabled": k.disabled ? !0 : void 0,
                  onClick: () => N(k),
                  onKeyDown: (D) => {
                    C && (D.key === "Enter" || D.key === " ") && (D.preventDefault(), N(k));
                  },
                  children: [
                    /* @__PURE__ */ A("span", { className: Qe("chat-ui-thought-chain-icon", d?.icon), style: p?.icon, children: k.icon ?? /* @__PURE__ */ A("span", { className: "chat-ui-thought-chain-status-dot" }) }),
                    /* @__PURE__ */ A("span", { className: Qe("chat-ui-thought-chain-main", d?.main), style: p?.main, children: l ? l(k, v, { expanded: I }) : /* @__PURE__ */ q(ya, { children: [
                      /* @__PURE__ */ A("span", { className: Qe("chat-ui-thought-chain-title", d?.title), style: p?.title, children: k.title ?? "Thought" }),
                      (k.description || B) && /* @__PURE__ */ q(
                        "span",
                        {
                          className: Qe("chat-ui-thought-chain-description", d?.description),
                          style: p?.description,
                          children: [
                            k.description,
                            k.description && B ? " · " : null,
                            B
                          ]
                        }
                      )
                    ] }) }),
                    k.extra && /* @__PURE__ */ A("span", { className: Qe("chat-ui-thought-chain-extra", d?.extra), style: p?.extra, children: k.extra }),
                    w && P && /* @__PURE__ */ A("span", { className: "chat-ui-thought-chain-arrow", "aria-hidden": "true", children: I ? "v" : ">" })
                  ]
                }
              ),
              P && I && /* @__PURE__ */ A("div", { className: Qe("chat-ui-thought-chain-content", d?.content), style: p?.content, children: s ? s(k.content, k, v) : k.content }),
              k.footer && /* @__PURE__ */ A("div", { className: Qe("chat-ui-thought-chain-footer", d?.footer), style: p?.footer, children: k.footer })
            ]
          },
          k.key
        );
      })
    }
  );
}
function Dh(e) {
  const n = {};
  for (const t of e) {
    const r = t.status ?? "success";
    n[r] = (n[r] ?? 0) + 1;
  }
  return n;
}
function Ph({ part: e, message: n, index: t }) {
  const r = e, i = r.items && r.items.length > 0 ? r.items : [
    {
      key: "thinking",
      title: r.title ?? "Thinking",
      description: r.description,
      content: r.text,
      footer: r.footer,
      icon: r.icon,
      status: r.status ?? "success",
      durationMs: r.durationMs
    }
  ], o = r.title ?? (r.items && r.items.length > 0 ? "Trace" : "Thinking"), a = un(() => {
    const u = Dh(i), p = [];
    return r.durationMs != null && p.push(r.durationMs < 1e3 ? `${r.durationMs}ms` : `${(r.durationMs / 1e3).toFixed(1)}s`), u.running && p.push(`running=${u.running}`), u.error && p.push(`error=${u.error}`), i.length > 0 && p.push(`items=${i.length}`), p.join("  ");
  }, [i, r.durationMs]), [s, l] = Ke(!!r.defaultOpen), c = `chat-ui-thinking-${n.uuid}-${t}`, d = r.defaultExpandedKeys ?? (r.defaultOpen ? i.map((u) => u.key) : void 0);
  return /* @__PURE__ */ q("div", { className: "chat-ui-thinking-wrap", children: [
    /* @__PURE__ */ q(
      "button",
      {
        type: "button",
        className: `chat-ui-thinking-toggle${s ? " is-open" : ""}`,
        onClick: () => l((u) => !u),
        "aria-expanded": s,
        "aria-controls": c,
        children: [
          /* @__PURE__ */ A("span", { className: "chat-ui-thinking-arrow", "aria-hidden": "true", children: s ? "v" : ">" }),
          /* @__PURE__ */ A("span", { className: "chat-ui-thinking-label", children: o }),
          a ? /* @__PURE__ */ A("span", { className: "chat-ui-thinking-meta", children: a }) : null
        ]
      }
    ),
    /* @__PURE__ */ A("div", { id: c, hidden: !s, children: /* @__PURE__ */ A(
      Lh,
      {
        items: i,
        defaultExpandedKeys: d,
        className: "chat-ui-thinking",
        classNames: { content: "chat-ui-thinking-body chat-ui-markdown" },
        renderContent: (u) => typeof u == "string" ? /* @__PURE__ */ A(no, { remarkPlugins: [vo], rehypePlugins: [Yo], children: u }) : u
      }
    ) })
  ] });
}
function Bh({ part: e }) {
  const { source: n } = e, t = n.type === "url" ? n.url : `data:${n.mediaType};base64,${n.data}`;
  return /* @__PURE__ */ A(
    "img",
    {
      src: t,
      alt: "message image",
      className: "chat-ui-inline-image",
      loading: "lazy"
    }
  );
}
function nn() {
}
nn.prototype = {
  diff: function(n, t) {
    var r, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, o = i.callback;
    typeof i == "function" && (o = i, i = {});
    var a = this;
    function s(v) {
      return v = a.postProcess(v, i), o ? (setTimeout(function() {
        o(v);
      }, 0), !0) : v;
    }
    n = this.castInput(n, i), t = this.castInput(t, i), n = this.removeEmpty(this.tokenize(n, i)), t = this.removeEmpty(this.tokenize(t, i));
    var l = t.length, c = n.length, d = 1, u = l + c;
    i.maxEditLength != null && (u = Math.min(u, i.maxEditLength));
    var p = (r = i.timeout) !== null && r !== void 0 ? r : 1 / 0, f = Date.now() + p, g = [{
      oldPos: -1,
      lastComponent: void 0
    }], E = this.extractCommon(g[0], t, n, 0, i);
    if (g[0].oldPos + 1 >= c && E + 1 >= l)
      return s(la(a, g[0].lastComponent, t, n, a.useLongestToken));
    var _ = -1 / 0, h = 1 / 0;
    function N() {
      for (var v = Math.max(_, -d); v <= Math.min(h, d); v += 2) {
        var I = void 0, w = g[v - 1], P = g[v + 1];
        w && (g[v - 1] = void 0);
        var C = !1;
        if (P) {
          var B = P.oldPos - v;
          C = P && 0 <= B && B < l;
        }
        var x = w && w.oldPos + 1 < c;
        if (!C && !x) {
          g[v] = void 0;
          continue;
        }
        if (!x || C && w.oldPos < P.oldPos ? I = a.addToPath(P, !0, !1, 0, i) : I = a.addToPath(w, !1, !0, 1, i), E = a.extractCommon(I, t, n, v, i), I.oldPos + 1 >= c && E + 1 >= l)
          return s(la(a, I.lastComponent, t, n, a.useLongestToken));
        g[v] = I, I.oldPos + 1 >= c && (h = Math.min(h, v - 1)), E + 1 >= l && (_ = Math.max(_, v + 1));
      }
      d++;
    }
    if (o)
      (function v() {
        setTimeout(function() {
          if (d > u || Date.now() > f)
            return o();
          N() || v();
        }, 0);
      })();
    else
      for (; d <= u && Date.now() <= f; ) {
        var k = N();
        if (k)
          return k;
      }
  },
  addToPath: function(n, t, r, i, o) {
    var a = n.lastComponent;
    return a && !o.oneChangePerToken && a.added === t && a.removed === r ? {
      oldPos: n.oldPos + i,
      lastComponent: {
        count: a.count + 1,
        added: t,
        removed: r,
        previousComponent: a.previousComponent
      }
    } : {
      oldPos: n.oldPos + i,
      lastComponent: {
        count: 1,
        added: t,
        removed: r,
        previousComponent: a
      }
    };
  },
  extractCommon: function(n, t, r, i, o) {
    for (var a = t.length, s = r.length, l = n.oldPos, c = l - i, d = 0; c + 1 < a && l + 1 < s && this.equals(r[l + 1], t[c + 1], o); )
      c++, l++, d++, o.oneChangePerToken && (n.lastComponent = {
        count: 1,
        previousComponent: n.lastComponent,
        added: !1,
        removed: !1
      });
    return d && !o.oneChangePerToken && (n.lastComponent = {
      count: d,
      previousComponent: n.lastComponent,
      added: !1,
      removed: !1
    }), n.oldPos = l, c;
  },
  equals: function(n, t, r) {
    return r.comparator ? r.comparator(n, t) : n === t || r.ignoreCase && n.toLowerCase() === t.toLowerCase();
  },
  removeEmpty: function(n) {
    for (var t = [], r = 0; r < n.length; r++)
      n[r] && t.push(n[r]);
    return t;
  },
  castInput: function(n) {
    return n;
  },
  tokenize: function(n) {
    return Array.from(n);
  },
  join: function(n) {
    return n.join("");
  },
  postProcess: function(n) {
    return n;
  }
};
function la(e, n, t, r, i) {
  for (var o = [], a; n; )
    o.push(n), a = n.previousComponent, delete n.previousComponent, n = a;
  o.reverse();
  for (var s = 0, l = o.length, c = 0, d = 0; s < l; s++) {
    var u = o[s];
    if (u.removed)
      u.value = e.join(r.slice(d, d + u.count)), d += u.count;
    else {
      if (!u.added && i) {
        var p = t.slice(c, c + u.count);
        p = p.map(function(f, g) {
          var E = r[d + g];
          return E.length > f.length ? E : f;
        }), u.value = e.join(p);
      } else
        u.value = e.join(t.slice(c, c + u.count));
      c += u.count, u.added || (d += u.count);
    }
  }
  return o;
}
function ca(e, n) {
  var t;
  for (t = 0; t < e.length && t < n.length; t++)
    if (e[t] != n[t])
      return e.slice(0, t);
  return e.slice(0, t);
}
function ua(e, n) {
  var t;
  if (!e || !n || e[e.length - 1] != n[n.length - 1])
    return "";
  for (t = 0; t < e.length && t < n.length; t++)
    if (e[e.length - (t + 1)] != n[n.length - (t + 1)])
      return e.slice(-t);
  return e.slice(-t);
}
function Nr(e, n, t) {
  if (e.slice(0, n.length) != n)
    throw Error("string ".concat(JSON.stringify(e), " doesn't start with prefix ").concat(JSON.stringify(n), "; this is a bug"));
  return t + e.slice(n.length);
}
function Sr(e, n, t) {
  if (!n)
    return e + t;
  if (e.slice(-n.length) != n)
    throw Error("string ".concat(JSON.stringify(e), " doesn't end with suffix ").concat(JSON.stringify(n), "; this is a bug"));
  return e.slice(0, -n.length) + t;
}
function Yn(e, n) {
  return Nr(e, n, "");
}
function kt(e, n) {
  return Sr(e, n, "");
}
function da(e, n) {
  return n.slice(0, Fh(e, n));
}
function Fh(e, n) {
  var t = 0;
  e.length > n.length && (t = e.length - n.length);
  var r = n.length;
  e.length < n.length && (r = e.length);
  var i = Array(r), o = 0;
  i[0] = 0;
  for (var a = 1; a < r; a++) {
    for (n[a] == n[o] ? i[a] = i[o] : i[a] = o; o > 0 && n[a] != n[o]; )
      o = i[o];
    n[a] == n[o] && o++;
  }
  o = 0;
  for (var s = t; s < e.length; s++) {
    for (; o > 0 && e[s] != n[o]; )
      o = i[o];
    e[s] == n[o] && o++;
  }
  return o;
}
var It = "a-zA-Z0-9_\\u{C0}-\\u{FF}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}", zh = new RegExp("[".concat(It, "]+|\\s+|[^").concat(It, "]"), "ug"), Pt = new nn();
Pt.equals = function(e, n, t) {
  return t.ignoreCase && (e = e.toLowerCase(), n = n.toLowerCase()), e.trim() === n.trim();
};
Pt.tokenize = function(e) {
  var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, t;
  if (n.intlSegmenter) {
    if (n.intlSegmenter.resolvedOptions().granularity != "word")
      throw new Error('The segmenter passed must have a granularity of "word"');
    t = Array.from(n.intlSegmenter.segment(e), function(o) {
      return o.segment;
    });
  } else
    t = e.match(zh) || [];
  var r = [], i = null;
  return t.forEach(function(o) {
    /\s/.test(o) ? i == null ? r.push(o) : r.push(r.pop() + o) : /\s/.test(i) ? r[r.length - 1] == i ? r.push(r.pop() + o) : r.push(i + o) : r.push(o), i = o;
  }), r;
};
Pt.join = function(e) {
  return e.map(function(n, t) {
    return t == 0 ? n : n.replace(/^\s+/, "");
  }).join("");
};
Pt.postProcess = function(e, n) {
  if (!e || n.oneChangePerToken)
    return e;
  var t = null, r = null, i = null;
  return e.forEach(function(o) {
    o.added ? r = o : o.removed ? i = o : ((r || i) && fa(t, i, r, o), t = o, r = null, i = null);
  }), (r || i) && fa(t, i, r, null), e;
};
function fa(e, n, t, r) {
  if (n && t) {
    var i = n.value.match(/^\s*/)[0], o = n.value.match(/\s*$/)[0], a = t.value.match(/^\s*/)[0], s = t.value.match(/\s*$/)[0];
    if (e) {
      var l = ca(i, a);
      e.value = Sr(e.value, a, l), n.value = Yn(n.value, l), t.value = Yn(t.value, l);
    }
    if (r) {
      var c = ua(o, s);
      r.value = Nr(r.value, s, c), n.value = kt(n.value, c), t.value = kt(t.value, c);
    }
  } else if (t)
    e && (t.value = t.value.replace(/^\s*/, "")), r && (r.value = r.value.replace(/^\s*/, ""));
  else if (e && r) {
    var d = r.value.match(/^\s*/)[0], u = n.value.match(/^\s*/)[0], p = n.value.match(/\s*$/)[0], f = ca(d, u);
    n.value = Yn(n.value, f);
    var g = ua(Yn(d, f), p);
    n.value = kt(n.value, g), r.value = Nr(r.value, d, g), e.value = Sr(e.value, d, d.slice(0, d.length - g.length));
  } else if (r) {
    var E = r.value.match(/^\s*/)[0], _ = n.value.match(/\s*$/)[0], h = da(_, E);
    n.value = kt(n.value, h);
  } else if (e) {
    var N = e.value.match(/\s*$/)[0], k = n.value.match(/^\s*/)[0], v = da(N, k);
    n.value = Yn(n.value, v);
  }
}
var Uh = new nn();
Uh.tokenize = function(e) {
  var n = new RegExp("(\\r?\\n)|[".concat(It, "]+|[^\\S\\n\\r]+|[^").concat(It, "]"), "ug");
  return e.match(n) || [];
};
var Bt = new nn();
Bt.tokenize = function(e, n) {
  n.stripTrailingCr && (e = e.replace(/\r\n/g, `
`));
  var t = [], r = e.split(/(\n|\r\n)/);
  r[r.length - 1] || r.pop();
  for (var i = 0; i < r.length; i++) {
    var o = r[i];
    i % 2 && !n.newlineIsToken ? t[t.length - 1] += o : t.push(o);
  }
  return t;
};
Bt.equals = function(e, n, t) {
  return t.ignoreWhitespace ? ((!t.newlineIsToken || !e.includes(`
`)) && (e = e.trim()), (!t.newlineIsToken || !n.includes(`
`)) && (n = n.trim())) : t.ignoreNewlineAtEof && !t.newlineIsToken && (e.endsWith(`
`) && (e = e.slice(0, -1)), n.endsWith(`
`) && (n = n.slice(0, -1))), nn.prototype.equals.call(this, e, n, t);
};
function $h(e, n, t) {
  return Bt.diff(e, n, t);
}
var Hh = new nn();
Hh.tokenize = function(e) {
  return e.split(/(\S.+?[.!?])(?=\s+|$)/);
};
var Gh = new nn();
Gh.tokenize = function(e) {
  return e.split(/([{}:;,]|\s+)/);
};
function vr(e) {
  "@babel/helpers - typeof";
  return vr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, vr(e);
}
var et = new nn();
et.useLongestToken = !0;
et.tokenize = Bt.tokenize;
et.castInput = function(e, n) {
  var t = n.undefinedReplacement, r = n.stringifyReplacer, i = r === void 0 ? function(o, a) {
    return typeof a > "u" ? t : a;
  } : r;
  return typeof e == "string" ? e : JSON.stringify(Tr(e, null, null, i), i, "  ");
};
et.equals = function(e, n, t) {
  return nn.prototype.equals.call(et, e.replace(/,([\r\n])/g, "$1"), n.replace(/,([\r\n])/g, "$1"), t);
};
function Tr(e, n, t, r, i) {
  n = n || [], t = t || [], r && (e = r(i, e));
  var o;
  for (o = 0; o < n.length; o += 1)
    if (n[o] === e)
      return t[o];
  var a;
  if (Object.prototype.toString.call(e) === "[object Array]") {
    for (n.push(e), a = new Array(e.length), t.push(a), o = 0; o < e.length; o += 1)
      a[o] = Tr(e[o], n, t, r, i);
    return n.pop(), t.pop(), a;
  }
  if (e && e.toJSON && (e = e.toJSON()), vr(e) === "object" && e !== null) {
    n.push(e), a = {}, t.push(a);
    var s = [], l;
    for (l in e)
      Object.prototype.hasOwnProperty.call(e, l) && s.push(l);
    for (s.sort(), o = 0; o < s.length; o += 1)
      l = s[o], a[l] = Tr(e[l], n, t, r, l);
    n.pop(), t.pop();
  } else
    a = e;
  return a;
}
var Cr = new nn();
Cr.tokenize = function(e) {
  return e.slice();
};
Cr.join = Cr.removeEmpty = function(e) {
  return e;
};
function pa(e) {
  return e === null ? "" : String(e);
}
function qh({ filename: e, language: n, hunks: t }) {
  return /* @__PURE__ */ q("div", { className: "chat-ui-diff", children: [
    e && /* @__PURE__ */ q("div", { className: "chat-ui-diff-header", children: [
      e,
      n && /* @__PURE__ */ A("span", { className: "chat-ui-diff-language", children: n })
    ] }),
    /* @__PURE__ */ A("div", { className: "chat-ui-diff-hunks", children: t.map((r, i) => /* @__PURE__ */ q("div", { className: "chat-ui-diff-hunk", children: [
      /* @__PURE__ */ A("div", { className: "chat-ui-diff-hunk-header", children: r.header }),
      /* @__PURE__ */ A("div", { className: "chat-ui-diff-hunk-lines", children: r.lines.map((o, a) => /* @__PURE__ */ q("div", { className: `chat-ui-diff-hunk-line is-${o.type}`, children: [
        /* @__PURE__ */ A("span", { className: "chat-ui-diff-line-no", children: pa(o.oldLine) }),
        /* @__PURE__ */ A("span", { className: "chat-ui-diff-line-no", children: pa(o.newLine) }),
        /* @__PURE__ */ A("span", { className: "chat-ui-diff-line-prefix", children: o.type === "add" ? "+" : o.type === "del" ? "-" : " " }),
        /* @__PURE__ */ A("span", { className: "chat-ui-diff-line-text", children: o.text || " " })
      ] }, a)) })
    ] }, i)) })
  ] });
}
function Kh({ part: e }) {
  const { oldCode: n, newCode: t, filename: r, language: i } = e, o = un(() => $h(n, t), [n, t]);
  return /* @__PURE__ */ q("div", { className: "chat-ui-diff", children: [
    r && /* @__PURE__ */ q("div", { className: "chat-ui-diff-header", children: [
      r,
      i && /* @__PURE__ */ A("span", { className: "chat-ui-diff-language", children: i })
    ] }),
    /* @__PURE__ */ A("pre", { className: "chat-ui-diff-body", children: /* @__PURE__ */ A("code", { children: o.map((a, s) => {
      const l = a.added ? "is-added" : a.removed ? "is-removed" : "is-common", c = a.added ? "+" : a.removed ? "-" : " ";
      return /* @__PURE__ */ A("span", { className: `chat-ui-diff-block ${l}`, children: a.value.replace(/\n$/, "").split(`
`).map((d, u) => /* @__PURE__ */ q("span", { className: "chat-ui-diff-line", children: [
        /* @__PURE__ */ A("span", { className: "chat-ui-diff-prefix", children: c }),
        d
      ] }, u)) }, s);
    }) }) })
  ] });
}
function Wh(e) {
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
function Ar(e) {
  return typeof e == "object" && e !== null;
}
function ga(e) {
  if (!Ar(e) || typeof e.command != "string")
    return null;
  const n = Array.isArray(e.args) ? e.args.map((t) => String(t)) : [];
  return { command: e.command, args: n };
}
function Vh(e) {
  const n = ga(e);
  if (n)
    return `${n.command}${n.args.length > 0 ? ` ${n.args.join(" ")}` : ""}`;
  if (Ar(e) && Ar(e.task)) {
    const t = ga(e.task);
    if (t)
      return `${t.command}${t.args.length > 0 ? ` ${t.args.join(" ")}` : ""}`;
  }
  return null;
}
function Yh(e, n) {
  return e.length <= n ? e : `${e.slice(0, n)}...`;
}
function Zh({ part: e }) {
  const { toolName: n, input: t } = e, [r, i] = Ke(!1), o = Vh(t), a = o ? `${n} :: ${Yh(o, 120)}` : n;
  return /* @__PURE__ */ q("div", { className: "chat-ui-tool-block", children: [
    /* @__PURE__ */ q("button", { onClick: () => i(!r), className: "chat-ui-tool-toggle", type: "button", children: [
      /* @__PURE__ */ A("span", { className: "chat-ui-tool-arrow", children: r ? "v" : ">" }),
      /* @__PURE__ */ q("span", { children: [
        "Tool: ",
        a
      ] })
    ] }),
    r && /* @__PURE__ */ A("pre", { className: "chat-ui-tool-payload", children: Wh(t) })
  ] });
}
function Xh(e) {
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
function ha(e) {
  return typeof e == "object" && e !== null;
}
function Qh(e) {
  return !ha(e) || e.type !== "runner-files-changed" || e.version !== 1 || e.source !== "runner-host" || !ha(e.summary) || !Array.isArray(e.files) ? null : e;
}
function Jh({ part: e }) {
  const { toolName: n, output: t, isError: r } = e, [i, o] = Ke(!1), [a, s] = Ke({}), l = r ? null : Qh(t);
  if (l) {
    const { summary: u, files: p } = l, f = (g, E) => {
      const _ = `${g}#${E}`;
      s((h) => ({
        ...h,
        [_]: !h[_]
      }));
    };
    return /* @__PURE__ */ q("div", { className: "chat-ui-tool-diff-card", children: [
      /* @__PURE__ */ q(
        "button",
        {
          onClick: () => o(!i),
          className: "chat-ui-tool-diff-header",
          type: "button",
          children: [
            /* @__PURE__ */ A("span", { className: "chat-ui-tool-arrow", children: i ? "v" : ">" }),
            /* @__PURE__ */ A("span", { className: "chat-ui-tool-diff-title", children: "Files changed" }),
            /* @__PURE__ */ q("span", { className: "chat-ui-tool-diff-stats", children: [
              /* @__PURE__ */ q("span", { className: "chat-ui-tool-diff-pill", children: [
                u.filesChanged,
                " files changed"
              ] }),
              /* @__PURE__ */ q("span", { className: "chat-ui-tool-diff-pill is-add", children: [
                "+",
                u.additions
              ] }),
              /* @__PURE__ */ q("span", { className: "chat-ui-tool-diff-pill is-del", children: [
                "-",
                u.deletions
              ] })
            ] })
          ]
        }
      ),
      i && /* @__PURE__ */ q("div", { className: "chat-ui-tool-diff-body", children: [
        u.truncated && /* @__PURE__ */ A("div", { className: "chat-ui-tool-diff-banner", children: "Diff preview was truncated due to output limits." }),
        p.map((g, E) => {
          const _ = `${g.path}#${E}`, h = a[_] ?? E === 0;
          return /* @__PURE__ */ q("div", { className: "chat-ui-tool-file", children: [
            /* @__PURE__ */ q(
              "button",
              {
                type: "button",
                className: "chat-ui-tool-file-header",
                onClick: () => f(g.path, E),
                children: [
                  /* @__PURE__ */ A("span", { className: "chat-ui-tool-arrow", children: h ? "v" : ">" }),
                  /* @__PURE__ */ A("span", { className: "chat-ui-tool-file-path", children: g.path }),
                  /* @__PURE__ */ q("span", { className: "chat-ui-tool-file-stats", children: [
                    /* @__PURE__ */ q("span", { className: "chat-ui-tool-file-add", children: [
                      "+",
                      g.additions
                    ] }),
                    /* @__PURE__ */ q("span", { className: "chat-ui-tool-file-del", children: [
                      "-",
                      g.deletions
                    ] })
                  ] })
                ]
              }
            ),
            h && /* @__PURE__ */ q("div", { className: "chat-ui-tool-file-content", children: [
              g.unavailableReason ? /* @__PURE__ */ q("div", { className: "chat-ui-tool-diff-banner is-warning", children: [
                "Diff unavailable: ",
                g.unavailableReason
              ] }) : g.diffPreview && g.diffPreview.hunks.length > 0 ? /* @__PURE__ */ A(
                qh,
                {
                  filename: g.path,
                  language: "diff",
                  hunks: g.diffPreview.hunks.map((N) => ({
                    header: N.header,
                    lines: N.lines
                  }))
                }
              ) : /* @__PURE__ */ A("div", { className: "chat-ui-tool-diff-banner", children: "No textual changes detected." }),
              g.truncated && !g.unavailableReason && /* @__PURE__ */ A("div", { className: "chat-ui-tool-diff-banner is-warning", children: "This file preview was truncated." })
            ] })
          ] }, _);
        })
      ] })
    ] });
  }
  const c = Xh(t), d = c.length > 200;
  return /* @__PURE__ */ q("div", { className: "chat-ui-tool-block", children: [
    /* @__PURE__ */ q(
      "button",
      {
        onClick: () => o(!i),
        className: `chat-ui-tool-toggle ${r ? "is-error" : ""}`,
        type: "button",
        children: [
          /* @__PURE__ */ A("span", { className: "chat-ui-tool-arrow", children: i ? "v" : ">" }),
          /* @__PURE__ */ q("span", { children: [
            "Result: ",
            n,
            r ? " (error)" : ""
          ] })
        ]
      }
    ),
    (i || !d) && /* @__PURE__ */ A("pre", { className: `chat-ui-tool-payload ${r ? "is-error" : ""}`, children: c }),
    !i && d && /* @__PURE__ */ q("span", { className: "chat-ui-tool-hint", children: [
      "(",
      c.length,
      " chars - click to expand)"
    ] })
  ] });
}
function jh({ part: e }) {
  const { mimeType: n, data: t } = e, r = n.startsWith("image/"), i = `data:${n};base64,${t}`;
  return r ? /* @__PURE__ */ A("img", { src: i, alt: "attached file", className: "chat-ui-inline-image", loading: "lazy" }) : /* @__PURE__ */ q("div", { className: "chat-ui-file-card", children: [
    /* @__PURE__ */ A("span", { className: "chat-ui-file-icon", children: "FILE" }),
    /* @__PURE__ */ q("div", { className: "chat-ui-file-meta", children: [
      /* @__PURE__ */ A("div", { className: "chat-ui-file-type", children: n }),
      /* @__PURE__ */ q("div", { className: "chat-ui-file-size", children: [
        Math.ceil(t.length * 0.75 / 1024),
        " KB"
      ] })
    ] })
  ] });
}
class em {
  renderers = /* @__PURE__ */ new Map();
  register(n, t) {
    return this.renderers.set(n, t), this;
  }
  get(n) {
    return this.renderers.get(n) ?? null;
  }
  has(n) {
    return this.renderers.has(n);
  }
}
function nm() {
  return new em().register("text", Oh).register("thinking", Ph).register("image", Bh).register("code-diff", Kh).register("tool-call", Zh).register("tool-result", Jh).register("file", jh);
}
function tm() {
  return /* @__PURE__ */ q("svg", { viewBox: "0 0 24 24", className: "chat-ui-action-icon", "aria-hidden": "true", children: [
    /* @__PURE__ */ A(
      "path",
      {
        d: "M20 11a8 8 0 1 0-2.34 5.66",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ A(
      "path",
      {
        d: "M20 4v7h-7",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    )
  ] });
}
function rm() {
  return /* @__PURE__ */ q("svg", { viewBox: "0 0 24 24", className: "chat-ui-action-icon", "aria-hidden": "true", children: [
    /* @__PURE__ */ A(
      "rect",
      {
        x: "9",
        y: "9",
        width: "11",
        height: "11",
        rx: "2",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8"
      }
    ),
    /* @__PURE__ */ A(
      "path",
      {
        d: "M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.8",
        strokeLinecap: "round"
      }
    )
  ] });
}
function im({
  message: e,
  isStreaming: n,
  isLatest: t,
  registry: r,
  rendererContext: i,
  onRetry: o,
  onCopy: a,
  onDelete: s,
  actionDisabled: l
}) {
  const c = un(() => r ?? nm(), [r]), d = un(
    () => ({
      ...i ?? {},
      chatUiIsStreaming: !!n,
      chatUiIsLatest: !!t
    }),
    [t, n, i]
  ), u = e.role === "user", p = e.role === "tool", f = u ? "is-user" : p ? "is-tool" : "is-assistant", g = !u && !p && !e.metadata?.isMeta && !!(o || a);
  return /* @__PURE__ */ A("div", { className: `chat-ui-message-row ${f}`, children: /* @__PURE__ */ q("div", { className: `chat-ui-bubble ${f}`, children: [
    e.content.map((E, _) => {
      const h = c.get(E.type);
      return h ? /* @__PURE__ */ A(
        h,
        {
          part: E,
          message: e,
          index: _,
          context: d
        },
        _
      ) : /* @__PURE__ */ A("pre", { className: "chat-ui-fallback-pre", children: JSON.stringify(E, null, 2) }, _);
    }),
    g && /* @__PURE__ */ q("div", { className: "chat-ui-message-actions", role: "group", "aria-label": "Message actions", children: [
      o && /* @__PURE__ */ A(
        "button",
        {
          type: "button",
          className: "chat-ui-action-btn",
          onClick: () => {
            o(e);
          },
          disabled: l,
          "aria-label": "Retry message",
          title: "Retry",
          children: /* @__PURE__ */ A(tm, {})
        }
      ),
      a && /* @__PURE__ */ A(
        "button",
        {
          type: "button",
          className: "chat-ui-action-btn",
          onClick: () => {
            a(e);
          },
          disabled: l,
          "aria-label": "Copy message",
          title: "Copy",
          children: /* @__PURE__ */ A(rm, {})
        }
      )
    ] })
  ] }) });
}
function am({
  messages: e,
  isStreaming: n,
  registry: t,
  rendererContext: r,
  onRetryMessage: i,
  onCopyMessage: o,
  onDeleteMessage: a,
  messageActionDisabled: s
}) {
  const l = Ln(null);
  return xt(() => {
    l.current?.scrollIntoView({ behavior: "smooth" });
  }, [e]), /* @__PURE__ */ q("div", { className: "chat-ui-list", children: [
    e.length === 0 && /* @__PURE__ */ A("div", { className: "chat-ui-empty", children: "Send a message to start chatting." }),
    e.map((c, d) => /* @__PURE__ */ A(
      im,
      {
        message: c,
        isStreaming: !!n,
        isLatest: d === e.length - 1,
        registry: t,
        rendererContext: r,
        onRetry: i,
        onCopy: o,
        onDelete: a,
        actionDisabled: s
      },
      c.uuid
    )),
    n && /* @__PURE__ */ q("div", { className: "chat-ui-streaming", "aria-live": "polite", children: [
      /* @__PURE__ */ A("span", { className: "chat-ui-stream-dot" }),
      /* @__PURE__ */ A("span", { className: "chat-ui-stream-dot [animation-delay:0.2s]" }),
      /* @__PURE__ */ A("span", { className: "chat-ui-stream-dot [animation-delay:0.4s]" })
    ] }),
    /* @__PURE__ */ A("div", { ref: l })
  ] });
}
const om = "peer h-8 w-full appearance-none rounded-xl border border-transparent bg-[color:var(--chat-panel-soft)] pl-3 pr-8 text-[11px] font-medium tracking-[0.01em] text-[color:var(--chat-text-muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.68),0_1px_2px_rgba(15,23,42,0.08)] transition hover:bg-[color:var(--chat-panel)] focus-visible:border-[color:var(--chat-brand-500)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55";
function ma(...e) {
  return e.filter(Boolean).join(" ");
}
function ba({
  value: e,
  options: n,
  onChange: t,
  ariaLabel: r,
  disabled: i,
  wrapperClassName: o,
  selectClassName: a
}) {
  return /* @__PURE__ */ q("div", { className: ma("relative", o), children: [
    /* @__PURE__ */ A(
      "select",
      {
        className: ma(om, a),
        value: e,
        onChange: (s) => t(s.target.value),
        disabled: i,
        "aria-label": r,
        children: n.map((s) => /* @__PURE__ */ A("option", { value: s.value, children: s.label }, s.value))
      }
    ),
    /* @__PURE__ */ A(
      "svg",
      {
        viewBox: "0 0 16 16",
        "aria-hidden": "true",
        className: "pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[color:var(--chat-text-subtle)] transition peer-disabled:opacity-45",
        children: /* @__PURE__ */ A(
          "path",
          {
            d: "M4 6.25L8 10.25L12 6.25",
            fill: "none",
            stroke: "currentColor",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "1.4"
          }
        )
      }
    )
  ] });
}
const sm = [
  { value: "low", label: "LOW" },
  { value: "medium", label: "MEDIUM" },
  { value: "high", label: "HIGH" }
];
function Ea(e) {
  return e >= 1e6 ? `${(e / 1e6).toFixed(1)}M` : e >= 1e3 ? `${(e / 1e3).toFixed(1)}K` : String(e);
}
function lm({
  onSend: e,
  selectedModel: n,
  modelOptions: t,
  onModelChange: r,
  reasoningEffort: i = "medium",
  onReasoningEffortChange: o,
  tokenUsage: a,
  isStreaming: s,
  isConnecting: l,
  onCompactContext: c,
  compactContextDisabled: d,
  compactContextLabel: u = "Compact Context",
  onFileSelect: p,
  suggestions: f,
  onSuggestionSelect: g
}) {
  const [E, _] = Ke(""), [h, N] = Ke([]), k = Ln(null), v = () => {
    const H = E.trim();
    !H || s || (e(H, h.length > 0 ? h : void 0), _(""), N([]));
  }, I = (H) => {
    H.key === "Enter" && !H.shiftKey && (H.preventDefault(), v());
  }, w = async (H) => {
    const Z = H.target.files;
    if (!Z?.length || !p) return;
    const le = await p(Array.from(Z));
    N((m) => [...m, ...le]), H.target.value = "";
  }, P = (H) => {
    N((Z) => Z.filter((le) => le.id !== H));
  }, C = (H) => {
    if (!(l || s)) {
      if (g?.(H), H.behavior === "fill") {
        _(H.prompt);
        return;
      }
      e(H.prompt, h.length > 0 ? h : void 0), _(""), N([]);
    }
  }, B = l || s || !E.trim(), x = l || s, D = d ?? x, $ = n ?? t?.[0]?.value ?? "", ne = t?.map((H) => ({ value: H.value, label: H.label })) ?? [], z = sm, O = a?.usedTokens ?? 0, X = a?.remainingTokens === null || a?.remainingTokens === void 0 ? "--" : Ea(Math.max(0, a.remainingTokens));
  return /* @__PURE__ */ A("div", { className: "chat-ui-input-shell", children: /* @__PURE__ */ q("div", { className: "chat-ui-composer", children: [
    /* @__PURE__ */ A(
      "textarea",
      {
        className: "chat-ui-textarea",
        rows: 2,
        placeholder: l ? "Connecting..." : "Type a message...",
        disabled: l,
        value: E,
        onChange: (H) => _(H.target.value),
        onKeyDown: I
      }
    ),
    f && f.length > 0 && /* @__PURE__ */ A("div", { className: "chat-ui-suggestion-row", "aria-label": "Suggestions", children: f.map((H, Z) => {
      const le = H.id ?? `${H.label}-${Z}`;
      return /* @__PURE__ */ A(
        "button",
        {
          type: "button",
          className: "chat-ui-suggestion-chip",
          disabled: l || s,
          onClick: () => C(H),
          title: H.description ?? H.prompt,
          children: H.label
        },
        le
      );
    }) }),
    h.length > 0 && /* @__PURE__ */ A("div", { className: "chat-ui-attachments", children: h.map((H) => /* @__PURE__ */ q("div", { className: "chat-ui-attachment-chip", children: [
      H.previewUrl ? /* @__PURE__ */ A("img", { src: H.previewUrl, alt: "", className: "chat-ui-attachment-thumb" }) : /* @__PURE__ */ A("span", { className: "chat-ui-attachment-icon", children: "FILE" }),
      /* @__PURE__ */ A("span", { className: "chat-ui-attachment-name", children: H.name }),
      /* @__PURE__ */ A(
        "button",
        {
          onClick: () => P(H.id),
          className: "chat-ui-attachment-remove",
          "aria-label": `Remove ${H.name}`,
          children: "x"
        }
      )
    ] }, H.id)) }),
    /* @__PURE__ */ q("div", { className: "chat-ui-control-row", children: [
      /* @__PURE__ */ q("div", { className: "chat-ui-control-left", children: [
        p && /* @__PURE__ */ A(
          "button",
          {
            onClick: () => k.current?.click(),
            className: "chat-ui-file-trigger",
            "aria-label": "Attach file",
            disabled: x,
            children: "+"
          }
        ),
        /* @__PURE__ */ A(
          "input",
          {
            ref: k,
            type: "file",
            multiple: !0,
            className: "chat-ui-file-input",
            onChange: w
          }
        ),
        t && t.length > 0 && /* @__PURE__ */ A(
          ba,
          {
            value: $,
            options: ne,
            onChange: (H) => r?.(H),
            disabled: x,
            ariaLabel: "Model selection",
            wrapperClassName: "min-w-40 max-w-[min(15rem,56vw)]"
          }
        ),
        /* @__PURE__ */ A(
          ba,
          {
            value: i,
            options: z,
            onChange: (H) => o?.(H),
            disabled: x,
            ariaLabel: "Reasoning effort",
            wrapperClassName: "min-w-24 max-w-[min(9rem,36vw)]"
          }
        )
      ] }),
      /* @__PURE__ */ q("div", { className: "chat-ui-control-right", children: [
        c && /* @__PURE__ */ A(
          "button",
          {
            className: "chat-ui-compact-btn",
            disabled: D,
            onClick: () => {
              c();
            },
            children: u
          }
        ),
        /* @__PURE__ */ q("span", { className: "chat-ui-token-usage", children: [
          "Tokens ",
          Ea(O),
          " / ",
          X
        ] }),
        /* @__PURE__ */ A(
          "button",
          {
            className: "chat-ui-send-btn",
            disabled: B,
            onClick: v,
            "aria-label": "Send message",
            children: "Send"
          }
        )
      ] })
    ] })
  ] }) });
}
function gm({
  messages: e,
  onSend: n,
  onRetryMessage: t,
  onCopyMessage: r,
  onDeleteMessage: i,
  messageActionDisabled: o,
  selectedModel: a,
  modelOptions: s,
  onModelChange: l,
  reasoningEffort: c = "medium",
  onReasoningEffortChange: d,
  tokenUsage: u,
  isStreaming: p,
  isConnecting: f,
  onCompactContext: g,
  compactContextDisabled: E,
  compactContextLabel: _,
  suggestions: h,
  onSuggestionSelect: N,
  actionPrompt: k,
  theme: v = "light",
  registry: I,
  rendererContext: w,
  onFileSelect: P,
  className: C
}) {
  return /* @__PURE__ */ q("div", { className: `chat-ui-root flex flex-1 min-w-0 flex-col ${C ?? ""}`, "data-theme": v, children: [
    /* @__PURE__ */ A(
      am,
      {
        messages: e,
        isStreaming: p,
        registry: I,
        rendererContext: w,
        onRetryMessage: t,
        onCopyMessage: r,
        onDeleteMessage: i,
        messageActionDisabled: o
      }
    ),
    k,
    /* @__PURE__ */ A(
      lm,
      {
        onSend: n,
        selectedModel: a,
        modelOptions: s,
        onModelChange: l,
        reasoningEffort: c,
        onReasoningEffortChange: d,
        tokenUsage: u,
        isStreaming: p,
        isConnecting: f,
        onCompactContext: g,
        compactContextDisabled: E,
        compactContextLabel: _,
        onFileSelect: P,
        suggestions: h,
        onSuggestionSelect: N
      }
    )
  ] });
}
function cm(e, n) {
  const t = e.find((i) => i.id === n && !i.disabled);
  if (t) return t.id;
  const r = e.find((i) => i.recommended && !i.disabled);
  return r ? r.id : e.find((i) => !i.disabled)?.id ?? e[0]?.id ?? "";
}
function um(e) {
  return Object.fromEntries(
    e.map((n) => [
      n.id,
      Object.fromEntries(
        (n.toggles ?? []).map((t) => [t.id, t.defaultSelected ?? !0])
      )
    ])
  );
}
function dm(e) {
  return Object.fromEntries(
    e.map((n) => [n.id, n.customInput?.defaultValue ?? ""])
  );
}
function hm({
  title: e = "Input required",
  question: n,
  options: t,
  defaultOptionId: r,
  submitLabel: i = "Submit answer",
  cancelLabel: o = "Cancel",
  disabled: a,
  className: s,
  onSubmit: l,
  onCancel: c
}) {
  const d = un(
    () => cm(t, r),
    [r, t]
  ), [u, p] = Ke(d), [f, g] = Ke(() => um(t)), [E, _] = Ke(() => dm(t)), h = t.find((C) => C.id === u) ?? t[0], N = Object.entries(f[h?.id ?? ""] ?? {}).filter(([, C]) => C).map(([C]) => C), k = E[h?.id ?? ""] ?? "", v = !!(h?.customInput?.required && k.trim().length === 0), I = !!(a || !h || h.disabled || v), w = (C, B) => {
    a || B.disabled || g((x) => ({
      ...x,
      [C]: {
        ...x[C] ?? {},
        [B.id]: !(x[C]?.[B.id] ?? B.defaultSelected ?? !0)
      }
    }));
  }, P = () => {
    I || !h || l({
      optionId: h.id,
      selectedToggleIds: N,
      customInput: k.trim()
    });
  };
  return /* @__PURE__ */ q("section", { className: `chat-ui-action-prompt ${s ?? ""}`, "aria-label": e, children: [
    /* @__PURE__ */ q("header", { className: "chat-ui-action-prompt-header", children: [
      /* @__PURE__ */ A("span", { className: "chat-ui-action-prompt-icon", "aria-hidden": "true", children: "?" }),
      /* @__PURE__ */ A("span", { children: e })
    ] }),
    /* @__PURE__ */ q("div", { className: "chat-ui-action-prompt-body", children: [
      /* @__PURE__ */ A("p", { className: "chat-ui-action-prompt-question", children: n }),
      /* @__PURE__ */ A("div", { className: "chat-ui-action-prompt-options", role: "radiogroup", "aria-label": n, children: t.map((C) => {
        const B = u === C.id;
        return /* @__PURE__ */ q(
          "article",
          {
            className: `chat-ui-action-option${B ? " is-selected" : ""}${C.disabled ? " is-disabled" : ""}`,
            children: [
              /* @__PURE__ */ q(
                "button",
                {
                  type: "button",
                  className: "chat-ui-action-option-main",
                  role: "radio",
                  "aria-checked": B,
                  disabled: a || C.disabled,
                  onClick: () => p(C.id),
                  children: [
                    /* @__PURE__ */ q("span", { className: "chat-ui-action-option-copy", children: [
                      /* @__PURE__ */ A("span", { className: "chat-ui-action-option-title", children: C.title }),
                      C.description && /* @__PURE__ */ A("span", { className: "chat-ui-action-option-description", children: C.description })
                    ] }),
                    C.recommended && /* @__PURE__ */ A("span", { className: "chat-ui-action-option-badge", children: "Recommended" })
                  ]
                }
              ),
              B && C.toggles && C.toggles.length > 0 && /* @__PURE__ */ q("div", { className: "chat-ui-action-toggle-group", children: [
                C.toggleGroupLabel && /* @__PURE__ */ A("div", { className: "chat-ui-action-toggle-title", children: C.toggleGroupLabel }),
                C.toggles.map((x) => {
                  const D = f[C.id]?.[x.id] ?? x.defaultSelected ?? !0;
                  return /* @__PURE__ */ q(
                    "button",
                    {
                      type: "button",
                      role: "switch",
                      "aria-checked": D,
                      className: `chat-ui-action-toggle${D ? " is-on" : ""}`,
                      disabled: a || x.disabled,
                      onClick: () => w(C.id, x),
                      children: [
                        /* @__PURE__ */ A("span", { className: "chat-ui-action-toggle-control", "aria-hidden": "true" }),
                        /* @__PURE__ */ q("span", { className: "chat-ui-action-toggle-copy", children: [
                          /* @__PURE__ */ A("span", { className: "chat-ui-action-toggle-label", children: x.label }),
                          x.description && /* @__PURE__ */ A("span", { className: "chat-ui-action-toggle-description", children: x.description })
                        ] })
                      ]
                    },
                    x.id
                  );
                })
              ] }),
              B && C.customInput && /* @__PURE__ */ q("label", { className: "chat-ui-action-custom-input", children: [
                C.customInput.label && /* @__PURE__ */ A("span", { className: "chat-ui-action-custom-label", children: C.customInput.label }),
                /* @__PURE__ */ A(
                  "textarea",
                  {
                    className: "chat-ui-action-custom-textarea",
                    rows: C.customInput.minRows ?? 4,
                    placeholder: C.customInput.placeholder,
                    disabled: a || C.disabled,
                    value: E[C.id] ?? "",
                    onChange: (x) => {
                      _((D) => ({
                        ...D,
                        [C.id]: x.target.value
                      }));
                    }
                  }
                )
              ] })
            ]
          },
          C.id
        );
      }) })
    ] }),
    /* @__PURE__ */ q("footer", { className: "chat-ui-action-prompt-footer", children: [
      c && /* @__PURE__ */ A(
        "button",
        {
          type: "button",
          className: "chat-ui-action-prompt-cancel",
          disabled: a,
          onClick: () => {
            c();
          },
          children: o
        }
      ),
      /* @__PURE__ */ A(
        "button",
        {
          type: "button",
          className: "chat-ui-action-prompt-submit",
          disabled: I,
          onClick: P,
          children: i
        }
      )
    ] })
  ] });
}
export {
  hm as ActionPrompt,
  gm as ChatPanel,
  Kh as CodeDiffRenderer,
  em as ContentRendererRegistry,
  jh as FileAttachmentRenderer,
  Bh as ImageRenderer,
  lm as InputArea,
  im as MessageBubble,
  am as MessageList,
  ba as SelectField,
  Oh as TextRenderer,
  Ph as ThinkingRenderer,
  Lh as ThoughtChain,
  Zh as ToolCallRenderer,
  Jh as ToolResultRenderer,
  nm as createDefaultRegistry
};
