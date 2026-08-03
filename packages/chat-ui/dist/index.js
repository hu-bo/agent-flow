import { jsxs as Y, jsx as v, Fragment as br } from "react/jsx-runtime";
import * as N from "react";
import zt, { forwardRef as sn, createElement as ui, useLayoutEffect as hu, useState as rt, useMemo as Mi, useRef as ar, useEffect as Za } from "react";
import * as Xa from "react-dom";
import gu from "react-dom";
function ja(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var i = e.length;
    for (t = 0; t < i; t++) e[t] && (n = ja(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function Qa() {
  for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = ja(e)) && (r && (r += " "), r += t);
  return r;
}
function ln(...e) {
  return Qa(e);
}
const mu = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Ja = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
var bu = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const yu = sn(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: i = "",
    children: a,
    iconNode: o,
    ...s
  }, c) => ui(
    "svg",
    {
      ref: c,
      ...bu,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: Ja("lucide", i),
      ...s
    },
    [
      ...o.map(([l, u]) => ui(l, u)),
      ...Array.isArray(a) ? a : [a]
    ]
  )
);
const we = (e, t) => {
  const n = sn(
    ({ className: r, ...i }, a) => ui(yu, {
      ref: a,
      iconNode: t,
      className: Ja(`lucide-${mu(e)}`, r),
      ...i
    })
  );
  return n.displayName = `${e}`, n;
};
const Eu = we("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
const _u = we("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
const wu = we("Brain", [
  [
    "path",
    {
      d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",
      key: "l5xja"
    }
  ],
  [
    "path",
    {
      d: "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",
      key: "ep3f8r"
    }
  ],
  ["path", { d: "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4", key: "1p4c4q" }],
  ["path", { d: "M17.599 6.5a3 3 0 0 0 .399-1.375", key: "tmeiqw" }],
  ["path", { d: "M6.003 5.125A3 3 0 0 0 6.401 6.5", key: "105sqy" }],
  ["path", { d: "M3.477 10.896a4 4 0 0 1 .585-.396", key: "ql3yin" }],
  ["path", { d: "M19.938 10.5a4 4 0 0 1 .585.396", key: "1qfode" }],
  ["path", { d: "M6 18a4 4 0 0 1-1.967-.516", key: "2e4loj" }],
  ["path", { d: "M19.967 17.484A4 4 0 0 1 18 18", key: "159ez6" }]
]);
const es = we("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
const ts = we("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
const ns = we("CircleAlert", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
]);
const xu = we("CircleCheck", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
const ku = we("CircleHelp", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
]);
const vu = we("Clipboard", [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      key: "116196"
    }
  ]
]);
const Su = we("Copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
const Nu = we("FileCode2", [
  ["path", { d: "M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4", key: "1pf5j1" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "m5 12-3 3 3 3", key: "oke12k" }],
  ["path", { d: "m9 18 3-3-3-3", key: "112psh" }]
]);
const rs = we("File", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]
]);
const is = we("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
const Cu = we("Paperclip", [
  ["path", { d: "M13.234 20.252 21 12.3", key: "1cbrk9" }],
  [
    "path",
    {
      d: "m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486",
      key: "1pkts6"
    }
  ]
]);
const Tu = we("RefreshCcw", [
  ["path", { d: "M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "14sxne" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16", key: "1hlbsb" }],
  ["path", { d: "M16 16h5v5", key: "ccwih5" }]
]);
const Au = we("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
const Ru = we("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
const Ou = we("ShieldCheck", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
const Iu = we("Square", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
]);
const Mu = we("Terminal", [
  ["polyline", { points: "4 17 10 11 4 5", key: "akl6gq" }],
  ["line", { x1: "12", x2: "20", y1: "19", y2: "19", key: "q2wloq" }]
]);
const Du = we("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
const Lu = we("Wrench", [
  [
    "path",
    {
      d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
      key: "cbrjhi"
    }
  ]
]);
const Pu = we("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function Fu(e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let r;
  const i = (a) => {
    const o = n.get(a);
    if (o) return o;
    const s = { id: a, activities: [], responses: [] };
    return n.set(a, s), t.push(s), s;
  };
  return e.forEach((a, o) => {
    const s = a.metadata?.turnId;
    if (a.role === "user") {
      r = i(s ?? `legacy-${a.uuid}`), r.user = a;
      return;
    }
    const c = s ? i(s) : r ?? i(`orphan-${o}`);
    a.type === "thinking" && a.kind === "summary" ? c.summary = a : a.type === "thinking" || a.type === "tool_execution" || a.role === "tool" ? c.activities.push(a) : c.responses.push(a);
  }), t;
}
function Bu(e, t) {
  const n = {};
  return (e[e.length - 1] === "" ? [...e, ""] : e).join(
    (n.padRight ? " " : "") + "," + (n.padLeft === !1 ? "" : " ")
  ).trim();
}
const zu = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, Uu = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, $u = {};
function Ao(e, t) {
  return ($u.jsx ? Uu : zu).test(e);
}
const Hu = /[ \t\n\f\r]/g;
function Gu(e) {
  return typeof e == "object" ? e.type === "text" ? Ro(e.value) : !1 : Ro(e);
}
function Ro(e) {
  return e.replace(Hu, "") === "";
}
class Rn {
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
  constructor(t, n, r) {
    this.normal = n, this.property = t, r && (this.space = r);
  }
}
Rn.prototype.normal = {};
Rn.prototype.property = {};
Rn.prototype.space = void 0;
function os(e, t) {
  const n = {}, r = {};
  for (const i of e)
    Object.assign(n, i.property), Object.assign(r, i.normal);
  return new Rn(n, r, t);
}
function di(e) {
  return e.toLowerCase();
}
class qe {
  /**
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @returns
   *   Info.
   */
  constructor(t, n) {
    this.attribute = n, this.property = t;
  }
}
qe.prototype.attribute = "";
qe.prototype.booleanish = !1;
qe.prototype.boolean = !1;
qe.prototype.commaOrSpaceSeparated = !1;
qe.prototype.commaSeparated = !1;
qe.prototype.defined = !1;
qe.prototype.mustUseProperty = !1;
qe.prototype.number = !1;
qe.prototype.overloadedBoolean = !1;
qe.prototype.property = "";
qe.prototype.spaceSeparated = !1;
qe.prototype.space = void 0;
let Ku = 0;
const te = qt(), Se = qt(), fi = qt(), F = qt(), me = qt(), Ht = qt(), Ze = qt();
function qt() {
  return 2 ** ++Ku;
}
const pi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  boolean: te,
  booleanish: Se,
  commaOrSpaceSeparated: Ze,
  commaSeparated: Ht,
  number: F,
  overloadedBoolean: fi,
  spaceSeparated: me
}, Symbol.toStringTag, { value: "Module" })), Ur = (
  /** @type {ReadonlyArray<keyof typeof types>} */
  Object.keys(pi)
);
class Di extends qe {
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
  constructor(t, n, r, i) {
    let a = -1;
    if (super(t, n), Oo(this, "space", i), typeof r == "number")
      for (; ++a < Ur.length; ) {
        const o = Ur[a];
        Oo(this, Ur[a], (r & pi[o]) === pi[o]);
      }
  }
}
Di.prototype.defined = !0;
function Oo(e, t, n) {
  n && (e[t] = n);
}
function cn(e) {
  const t = {}, n = {};
  for (const [r, i] of Object.entries(e.properties)) {
    const a = new Di(
      r,
      e.transform(e.attributes || {}, r),
      i,
      e.space
    );
    e.mustUseProperty && e.mustUseProperty.includes(r) && (a.mustUseProperty = !0), t[r] = a, n[di(r)] = r, n[di(a.attribute)] = r;
  }
  return new Rn(t, n, e.space);
}
const as = cn({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: Se,
    ariaAutoComplete: null,
    ariaBusy: Se,
    ariaChecked: Se,
    ariaColCount: F,
    ariaColIndex: F,
    ariaColSpan: F,
    ariaControls: me,
    ariaCurrent: null,
    ariaDescribedBy: me,
    ariaDetails: null,
    ariaDisabled: Se,
    ariaDropEffect: me,
    ariaErrorMessage: null,
    ariaExpanded: Se,
    ariaFlowTo: me,
    ariaGrabbed: Se,
    ariaHasPopup: null,
    ariaHidden: Se,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: me,
    ariaLevel: F,
    ariaLive: null,
    ariaModal: Se,
    ariaMultiLine: Se,
    ariaMultiSelectable: Se,
    ariaOrientation: null,
    ariaOwns: me,
    ariaPlaceholder: null,
    ariaPosInSet: F,
    ariaPressed: Se,
    ariaReadOnly: Se,
    ariaRelevant: null,
    ariaRequired: Se,
    ariaRoleDescription: me,
    ariaRowCount: F,
    ariaRowIndex: F,
    ariaRowSpan: F,
    ariaSelected: Se,
    ariaSetSize: F,
    ariaSort: null,
    ariaValueMax: F,
    ariaValueMin: F,
    ariaValueNow: F,
    ariaValueText: null,
    role: null
  },
  transform(e, t) {
    return t === "role" ? t : "aria-" + t.slice(4).toLowerCase();
  }
});
function ss(e, t) {
  return t in e ? e[t] : t;
}
function ls(e, t) {
  return ss(e, t.toLowerCase());
}
const qu = cn({
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
    accept: Ht,
    acceptCharset: me,
    accessKey: me,
    action: null,
    allow: null,
    allowFullScreen: te,
    allowPaymentRequest: te,
    allowUserMedia: te,
    alpha: te,
    alt: null,
    as: null,
    async: te,
    autoCapitalize: null,
    autoComplete: me,
    autoFocus: te,
    autoPlay: te,
    blocking: me,
    capture: null,
    charSet: null,
    checked: te,
    cite: null,
    className: me,
    closedBy: null,
    colorSpace: null,
    cols: F,
    colSpan: F,
    command: null,
    commandFor: null,
    content: null,
    contentEditable: Se,
    controls: te,
    controlsList: me,
    coords: F | Ht,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: te,
    defer: te,
    dir: null,
    dirName: null,
    disabled: te,
    download: fi,
    draggable: Se,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: te,
    formTarget: null,
    headers: me,
    height: F,
    hidden: fi,
    high: F,
    href: null,
    hrefLang: null,
    htmlFor: me,
    httpEquiv: me,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: te,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: te,
    itemId: null,
    itemProp: me,
    itemRef: me,
    itemScope: te,
    itemType: me,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: te,
    low: F,
    manifest: null,
    max: null,
    maxLength: F,
    media: null,
    method: null,
    min: null,
    minLength: F,
    multiple: te,
    muted: te,
    name: null,
    nonce: null,
    noModule: te,
    noValidate: te,
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
    open: te,
    optimum: F,
    pattern: null,
    ping: me,
    placeholder: null,
    playsInline: te,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: te,
    referrerPolicy: null,
    rel: me,
    required: te,
    reversed: te,
    rows: F,
    rowSpan: F,
    sandbox: me,
    scope: null,
    scoped: te,
    seamless: te,
    selected: te,
    shadowRootClonable: te,
    shadowRootCustomElementRegistry: te,
    shadowRootDelegatesFocus: te,
    shadowRootMode: null,
    shadowRootSerializable: te,
    shape: null,
    size: F,
    sizes: null,
    slot: null,
    span: F,
    spellCheck: Se,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: F,
    step: null,
    style: null,
    tabIndex: F,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: te,
    useMap: null,
    value: Se,
    width: F,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: me,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: F,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: F,
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
    compact: te,
    // Lists. Use CSS to reduce space between items instead
    declare: te,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: F,
    // `<img>` and `<object>`
    leftMargin: F,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: F,
    // `<body>`
    marginWidth: F,
    // `<body>`
    noResize: te,
    // `<frame>`
    noHref: te,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: te,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: te,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: F,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: Se,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: F,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: F,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    credentialless: te,
    disablePictureInPicture: te,
    disableRemotePlayback: te,
    exportParts: Ht,
    part: me,
    prefix: null,
    property: null,
    results: F,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: ls
}), Wu = cn({
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
    about: Ze,
    accentHeight: F,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: F,
    amplitude: F,
    arabicForm: null,
    ascent: F,
    attributeName: null,
    attributeType: null,
    azimuth: F,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: F,
    by: null,
    calcMode: null,
    capHeight: F,
    className: me,
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
    descent: F,
    diffuseConstant: F,
    direction: null,
    display: null,
    dur: null,
    divisor: F,
    dominantBaseline: null,
    download: te,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: F,
    enableBackground: null,
    end: null,
    event: null,
    exponent: F,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: F,
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
    g1: Ht,
    g2: Ht,
    glyphName: Ht,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: F,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: F,
    horizOriginX: F,
    horizOriginY: F,
    id: null,
    ideographic: F,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: F,
    k: F,
    k1: F,
    k2: F,
    k3: F,
    k4: F,
    kernelMatrix: Ze,
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
    limitingConeAngle: F,
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
    mediaSize: F,
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
    overlinePosition: F,
    overlineThickness: F,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: F,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: me,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: F,
    pointsAtY: F,
    pointsAtZ: F,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: Ze,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: Ze,
    rev: Ze,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: Ze,
    requiredFeatures: Ze,
    requiredFonts: Ze,
    requiredFormats: Ze,
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
    specularConstant: F,
    specularExponent: F,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: F,
    strikethroughThickness: F,
    string: null,
    stroke: null,
    strokeDashArray: Ze,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: F,
    strokeOpacity: F,
    strokeWidth: null,
    style: null,
    surfaceScale: F,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: Ze,
    tabIndex: F,
    tableValues: null,
    target: null,
    targetX: F,
    targetY: F,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: Ze,
    to: null,
    transform: null,
    transformOrigin: null,
    u1: null,
    u2: null,
    underlinePosition: F,
    underlineThickness: F,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: F,
    values: null,
    vAlphabetic: F,
    vMathematical: F,
    vectorEffect: null,
    vHanging: F,
    vIdeographic: F,
    version: null,
    vertAdvY: F,
    vertOriginX: F,
    vertOriginY: F,
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
    xHeight: F,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  },
  space: "svg",
  transform: ss
}), cs = cn({
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
  transform(e, t) {
    return "xlink:" + t.slice(5).toLowerCase();
  }
}), us = cn({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: ls
}), ds = cn({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(e, t) {
    return "xml:" + t.slice(3).toLowerCase();
  }
}), Vu = {
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
}, Yu = /[A-Z]/g, Io = /-[a-z]/g, Zu = /^data[-\w.:]+$/i;
function Xu(e, t) {
  const n = di(t);
  let r = t, i = qe;
  if (n in e.normal)
    return e.property[e.normal[n]];
  if (n.length > 4 && n.slice(0, 4) === "data" && Zu.test(t)) {
    if (t.charAt(4) === "-") {
      const a = t.slice(5).replace(Io, Qu);
      r = "data" + a.charAt(0).toUpperCase() + a.slice(1);
    } else {
      const a = t.slice(4);
      if (!Io.test(a)) {
        let o = a.replace(Yu, ju);
        o.charAt(0) !== "-" && (o = "-" + o), t = "data" + o;
      }
    }
    i = Di;
  }
  return new i(r, t);
}
function ju(e) {
  return "-" + e.toLowerCase();
}
function Qu(e) {
  return e.charAt(1).toUpperCase();
}
const Ju = os([as, qu, cs, us, ds], "html"), Li = os([as, Wu, cs, us, ds], "svg");
function ed(e) {
  return e.join(" ").trim();
}
function Pi(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Xt = {}, $r, Mo;
function td() {
  if (Mo) return $r;
  Mo = 1;
  var e = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, t = /\n/g, n = /^\s*/, r = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/, i = /^:\s*/, a = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/, o = /^[;\s]*/, s = /^\s+|\s+$/g, c = `
`, l = "/", u = "*", d = "", p = "comment", f = "declaration";
  function h(b, g) {
    if (typeof b != "string")
      throw new TypeError("First argument must be a string");
    if (!b) return [];
    g = g || {};
    var x = 1, _ = 1;
    function C(P) {
      var D = P.match(t);
      D && (x += D.length);
      var K = P.lastIndexOf(c);
      _ = ~K ? P.length - K : _ + P.length;
    }
    function T() {
      var P = { line: x, column: _ };
      return function(D) {
        return D.position = new k(P), O(), D;
      };
    }
    function k(P) {
      this.start = P, this.end = { line: x, column: _ }, this.source = g.source;
    }
    k.prototype.content = b;
    function I(P) {
      var D = new Error(
        g.source + ":" + x + ":" + _ + ": " + P
      );
      if (D.reason = P, D.filename = g.source, D.line = x, D.column = _, D.source = b, !g.silent) throw D;
    }
    function A(P) {
      var D = P.exec(b);
      if (D) {
        var K = D[0];
        return C(K), b = b.slice(K.length), D;
      }
    }
    function O() {
      A(n);
    }
    function S(P) {
      var D;
      for (P = P || []; D = L(); )
        D !== !1 && P.push(D);
      return P;
    }
    function L() {
      var P = T();
      if (!(l != b.charAt(0) || u != b.charAt(1))) {
        for (var D = 2; d != b.charAt(D) && (u != b.charAt(D) || l != b.charAt(D + 1)); )
          ++D;
        if (D += 2, d === b.charAt(D - 1))
          return I("End of comment missing");
        var K = b.slice(2, D - 2);
        return _ += 2, C(K), b = b.slice(D), _ += 2, P({
          type: p,
          comment: K
        });
      }
    }
    function B() {
      var P = T(), D = A(r);
      if (D) {
        if (L(), !A(i)) return I("property missing ':'");
        var K = A(a), Q = P({
          type: f,
          property: m(D[0].replace(e, d)),
          value: K ? m(K[0].replace(e, d)) : d
        });
        return A(o), Q;
      }
    }
    function W() {
      var P = [];
      S(P);
      for (var D; D = B(); )
        D !== !1 && (P.push(D), S(P));
      return P;
    }
    return O(), W();
  }
  function m(b) {
    return b ? b.replace(s, d) : d;
  }
  return $r = h, $r;
}
var Do;
function nd() {
  if (Do) return Xt;
  Do = 1;
  var e = Xt && Xt.__importDefault || function(r) {
    return r && r.__esModule ? r : { default: r };
  };
  Object.defineProperty(Xt, "__esModule", { value: !0 }), Xt.default = n;
  const t = e(td());
  function n(r, i) {
    let a = null;
    if (!r || typeof r != "string")
      return a;
    const o = (0, t.default)(r), s = typeof i == "function";
    return o.forEach((c) => {
      if (c.type !== "declaration")
        return;
      const { property: l, value: u } = c;
      s ? i(l, u, c) : u && (a = a || {}, a[l] = u);
    }), a;
  }
  return Xt;
}
var mn = {}, Lo;
function rd() {
  if (Lo) return mn;
  Lo = 1, Object.defineProperty(mn, "__esModule", { value: !0 }), mn.camelCase = void 0;
  var e = /^--[a-zA-Z0-9_-]+$/, t = /-([a-z])/g, n = /^[^-]+$/, r = /^-(webkit|moz|ms|o|khtml)-/, i = /^-(ms)-/, a = function(l) {
    return !l || n.test(l) || e.test(l);
  }, o = function(l, u) {
    return u.toUpperCase();
  }, s = function(l, u) {
    return "".concat(u, "-");
  }, c = function(l, u) {
    return u === void 0 && (u = {}), a(l) ? l : (l = l.toLowerCase(), u.reactCompat ? l = l.replace(i, s) : l = l.replace(r, s), l.replace(t, o));
  };
  return mn.camelCase = c, mn;
}
var bn, Po;
function id() {
  if (Po) return bn;
  Po = 1;
  var e = bn && bn.__importDefault || function(i) {
    return i && i.__esModule ? i : { default: i };
  }, t = e(nd()), n = rd();
  function r(i, a) {
    var o = {};
    return !i || typeof i != "string" || (0, t.default)(i, function(s, c) {
      s && c && (o[(0, n.camelCase)(s, a)] = c);
    }), o;
  }
  return r.default = r, bn = r, bn;
}
var od = id();
const ad = /* @__PURE__ */ Pi(od), fs = ps("end"), Fi = ps("start");
function ps(e) {
  return t;
  function t(n) {
    const r = n && n.position && n.position[e] || {};
    if (typeof r.line == "number" && r.line > 0 && typeof r.column == "number" && r.column > 0)
      return {
        line: r.line,
        column: r.column,
        offset: typeof r.offset == "number" && r.offset > -1 ? r.offset : void 0
      };
  }
}
function sd(e) {
  const t = Fi(e), n = fs(e);
  if (t && n)
    return { start: t, end: n };
}
function wn(e) {
  return !e || typeof e != "object" ? "" : "position" in e || "type" in e ? Fo(e.position) : "start" in e || "end" in e ? Fo(e) : "line" in e || "column" in e ? hi(e) : "";
}
function hi(e) {
  return Bo(e && e.line) + ":" + Bo(e && e.column);
}
function Fo(e) {
  return hi(e && e.start) + "-" + hi(e && e.end);
}
function Bo(e) {
  return e && typeof e == "number" ? e : 1;
}
class Pe extends Error {
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
  constructor(t, n, r) {
    super(), typeof n == "string" && (r = n, n = void 0);
    let i = "", a = {}, o = !1;
    if (n && ("line" in n && "column" in n ? a = { place: n } : "start" in n && "end" in n ? a = { place: n } : "type" in n ? a = {
      ancestors: [n],
      place: n.position
    } : a = { ...n }), typeof t == "string" ? i = t : !a.cause && t && (o = !0, i = t.message, a.cause = t), !a.ruleId && !a.source && typeof r == "string") {
      const c = r.indexOf(":");
      c === -1 ? a.ruleId = r : (a.source = r.slice(0, c), a.ruleId = r.slice(c + 1));
    }
    if (!a.place && a.ancestors && a.ancestors) {
      const c = a.ancestors[a.ancestors.length - 1];
      c && (a.place = c.position);
    }
    const s = a.place && "start" in a.place ? a.place.start : a.place;
    this.ancestors = a.ancestors || void 0, this.cause = a.cause || void 0, this.column = s ? s.column : void 0, this.fatal = void 0, this.file = "", this.message = i, this.line = s ? s.line : void 0, this.name = wn(a.place) || "1:1", this.place = a.place || void 0, this.reason = this.message, this.ruleId = a.ruleId || void 0, this.source = a.source || void 0, this.stack = o && a.cause && typeof a.cause.stack == "string" ? a.cause.stack : "", this.actual = void 0, this.expected = void 0, this.note = void 0, this.url = void 0;
  }
}
Pe.prototype.file = "";
Pe.prototype.name = "";
Pe.prototype.reason = "";
Pe.prototype.message = "";
Pe.prototype.stack = "";
Pe.prototype.column = void 0;
Pe.prototype.line = void 0;
Pe.prototype.ancestors = void 0;
Pe.prototype.cause = void 0;
Pe.prototype.fatal = void 0;
Pe.prototype.place = void 0;
Pe.prototype.ruleId = void 0;
Pe.prototype.source = void 0;
const Bi = {}.hasOwnProperty, ld = /* @__PURE__ */ new Map(), cd = /[A-Z]/g, ud = /* @__PURE__ */ new Set(["table", "tbody", "thead", "tfoot", "tr"]), dd = /* @__PURE__ */ new Set(["td", "th"]), hs = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function fd(e, t) {
  if (!t || t.Fragment === void 0)
    throw new TypeError("Expected `Fragment` in options");
  const n = t.filePath || void 0;
  let r;
  if (t.development) {
    if (typeof t.jsxDEV != "function")
      throw new TypeError(
        "Expected `jsxDEV` in options when `development: true`"
      );
    r = _d(n, t.jsxDEV);
  } else {
    if (typeof t.jsx != "function")
      throw new TypeError("Expected `jsx` in production options");
    if (typeof t.jsxs != "function")
      throw new TypeError("Expected `jsxs` in production options");
    r = Ed(n, t.jsx, t.jsxs);
  }
  const i = {
    Fragment: t.Fragment,
    ancestors: [],
    components: t.components || {},
    create: r,
    elementAttributeNameCase: t.elementAttributeNameCase || "react",
    evaluater: t.createEvaluater ? t.createEvaluater() : void 0,
    filePath: n,
    ignoreInvalidStyle: t.ignoreInvalidStyle || !1,
    passKeys: t.passKeys !== !1,
    passNode: t.passNode || !1,
    schema: t.space === "svg" ? Li : Ju,
    stylePropertyNameCase: t.stylePropertyNameCase || "dom",
    tableCellAlignToStyle: t.tableCellAlignToStyle !== !1
  }, a = gs(i, e, void 0);
  return a && typeof a != "string" ? a : i.create(
    e,
    i.Fragment,
    { children: a || void 0 },
    void 0
  );
}
function gs(e, t, n) {
  if (t.type === "element")
    return pd(e, t, n);
  if (t.type === "mdxFlowExpression" || t.type === "mdxTextExpression")
    return hd(e, t);
  if (t.type === "mdxJsxFlowElement" || t.type === "mdxJsxTextElement")
    return md(e, t, n);
  if (t.type === "mdxjsEsm")
    return gd(e, t);
  if (t.type === "root")
    return bd(e, t, n);
  if (t.type === "text")
    return yd(e, t);
}
function pd(e, t, n) {
  const r = e.schema;
  let i = r;
  t.tagName.toLowerCase() === "svg" && r.space === "html" && (i = Li, e.schema = i), e.ancestors.push(t);
  const a = bs(e, t.tagName, !1), o = wd(e, t);
  let s = Ui(e, t);
  return ud.has(t.tagName) && (s = s.filter(function(c) {
    return typeof c == "string" ? !Gu(c) : !0;
  })), ms(e, o, a, t), zi(o, s), e.ancestors.pop(), e.schema = r, e.create(t, a, o, n);
}
function hd(e, t) {
  if (t.data && t.data.estree && e.evaluater) {
    const r = t.data.estree.body[0];
    return r.type, /** @type {Child | undefined} */
    e.evaluater.evaluateExpression(r.expression);
  }
  Sn(e, t.position);
}
function gd(e, t) {
  if (t.data && t.data.estree && e.evaluater)
    return (
      /** @type {Child | undefined} */
      e.evaluater.evaluateProgram(t.data.estree)
    );
  Sn(e, t.position);
}
function md(e, t, n) {
  const r = e.schema;
  let i = r;
  t.name === "svg" && r.space === "html" && (i = Li, e.schema = i), e.ancestors.push(t);
  const a = t.name === null ? e.Fragment : bs(e, t.name, !0), o = xd(e, t), s = Ui(e, t);
  return ms(e, o, a, t), zi(o, s), e.ancestors.pop(), e.schema = r, e.create(t, a, o, n);
}
function bd(e, t, n) {
  const r = {};
  return zi(r, Ui(e, t)), e.create(t, e.Fragment, r, n);
}
function yd(e, t) {
  return t.value;
}
function ms(e, t, n, r) {
  typeof n != "string" && n !== e.Fragment && e.passNode && (t.node = r);
}
function zi(e, t) {
  if (t.length > 0) {
    const n = t.length > 1 ? t : t[0];
    n && (e.children = n);
  }
}
function Ed(e, t, n) {
  return r;
  function r(i, a, o, s) {
    const l = Array.isArray(o.children) ? n : t;
    return s ? l(a, o, s) : l(a, o);
  }
}
function _d(e, t) {
  return n;
  function n(r, i, a, o) {
    const s = Array.isArray(a.children), c = Fi(r);
    return t(
      i,
      a,
      o,
      s,
      {
        columnNumber: c ? c.column - 1 : void 0,
        fileName: e,
        lineNumber: c ? c.line : void 0
      },
      void 0
    );
  }
}
function wd(e, t) {
  const n = {};
  let r, i;
  for (i in t.properties)
    if (i !== "children" && Bi.call(t.properties, i)) {
      const a = kd(e, i, t.properties[i]);
      if (a) {
        const [o, s] = a;
        e.tableCellAlignToStyle && o === "align" && typeof s == "string" && dd.has(t.tagName) ? r = s : n[o] = s;
      }
    }
  if (r) {
    const a = (
      /** @type {Style} */
      n.style || (n.style = {})
    );
    a[e.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = r;
  }
  return n;
}
function xd(e, t) {
  const n = {};
  for (const r of t.attributes)
    if (r.type === "mdxJsxExpressionAttribute")
      if (r.data && r.data.estree && e.evaluater) {
        const a = r.data.estree.body[0];
        a.type;
        const o = a.expression;
        o.type;
        const s = o.properties[0];
        s.type, Object.assign(
          n,
          e.evaluater.evaluateExpression(s.argument)
        );
      } else
        Sn(e, t.position);
    else {
      const i = r.name;
      let a;
      if (r.value && typeof r.value == "object")
        if (r.value.data && r.value.data.estree && e.evaluater) {
          const s = r.value.data.estree.body[0];
          s.type, a = e.evaluater.evaluateExpression(s.expression);
        } else
          Sn(e, t.position);
      else
        a = r.value === null ? !0 : r.value;
      n[i] = /** @type {Props[keyof Props]} */
      a;
    }
  return n;
}
function Ui(e, t) {
  const n = [];
  let r = -1;
  const i = e.passKeys ? /* @__PURE__ */ new Map() : ld;
  for (; ++r < t.children.length; ) {
    const a = t.children[r];
    let o;
    if (e.passKeys) {
      const c = a.type === "element" ? a.tagName : a.type === "mdxJsxFlowElement" || a.type === "mdxJsxTextElement" ? a.name : void 0;
      if (c) {
        const l = i.get(c) || 0;
        o = c + "-" + l, i.set(c, l + 1);
      }
    }
    const s = gs(e, a, o);
    s !== void 0 && n.push(s);
  }
  return n;
}
function kd(e, t, n) {
  const r = Xu(e.schema, t);
  if (!(n == null || typeof n == "number" && Number.isNaN(n))) {
    if (Array.isArray(n) && (n = r.commaSeparated ? Bu(n) : ed(n)), r.property === "style") {
      let i = typeof n == "object" ? n : vd(e, String(n));
      return e.stylePropertyNameCase === "css" && (i = Sd(i)), ["style", i];
    }
    return [
      e.elementAttributeNameCase === "react" && r.space ? Vu[r.property] || r.property : r.attribute,
      n
    ];
  }
}
function vd(e, t) {
  try {
    return ad(t, { reactCompat: !0 });
  } catch (n) {
    if (e.ignoreInvalidStyle)
      return {};
    const r = (
      /** @type {Error} */
      n
    ), i = new Pe("Cannot parse `style` attribute", {
      ancestors: e.ancestors,
      cause: r,
      ruleId: "style",
      source: "hast-util-to-jsx-runtime"
    });
    throw i.file = e.filePath || void 0, i.url = hs + "#cannot-parse-style-attribute", i;
  }
}
function bs(e, t, n) {
  let r;
  if (!n)
    r = { type: "Literal", value: t };
  else if (t.includes(".")) {
    const i = t.split(".");
    let a = -1, o;
    for (; ++a < i.length; ) {
      const s = Ao(i[a]) ? { type: "Identifier", name: i[a] } : { type: "Literal", value: i[a] };
      o = o ? {
        type: "MemberExpression",
        object: o,
        property: s,
        computed: !!(a && s.type === "Literal"),
        optional: !1
      } : s;
    }
    r = o;
  } else
    r = Ao(t) && !/^[a-z]/.test(t) ? { type: "Identifier", name: t } : { type: "Literal", value: t };
  if (r.type === "Literal") {
    const i = (
      /** @type {string | number} */
      r.value
    );
    return Bi.call(e.components, i) ? e.components[i] : i;
  }
  if (e.evaluater)
    return e.evaluater.evaluateExpression(r);
  Sn(e);
}
function Sn(e, t) {
  const n = new Pe(
    "Cannot handle MDX estrees without `createEvaluater`",
    {
      ancestors: e.ancestors,
      place: t,
      ruleId: "mdx-estree",
      source: "hast-util-to-jsx-runtime"
    }
  );
  throw n.file = e.filePath || void 0, n.url = hs + "#cannot-handle-mdx-estrees-without-createevaluater", n;
}
function Sd(e) {
  const t = {};
  let n;
  for (n in e)
    Bi.call(e, n) && (t[Nd(n)] = e[n]);
  return t;
}
function Nd(e) {
  let t = e.replace(cd, Cd);
  return t.slice(0, 3) === "ms-" && (t = "-" + t), t;
}
function Cd(e) {
  return "-" + e.toLowerCase();
}
const Hr = {
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
}, Td = {};
function $i(e, t) {
  const n = Td, r = typeof n.includeImageAlt == "boolean" ? n.includeImageAlt : !0, i = typeof n.includeHtml == "boolean" ? n.includeHtml : !0;
  return ys(e, r, i);
}
function ys(e, t, n) {
  if (Ad(e)) {
    if ("value" in e)
      return e.type === "html" && !n ? "" : e.value;
    if (t && "alt" in e && e.alt)
      return e.alt;
    if ("children" in e)
      return zo(e.children, t, n);
  }
  return Array.isArray(e) ? zo(e, t, n) : "";
}
function zo(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; )
    r[i] = ys(e[i], t, n);
  return r.join("");
}
function Ad(e) {
  return !!(e && typeof e == "object");
}
const Uo = document.createElement("i");
function Hi(e) {
  const t = "&" + e + ";";
  Uo.innerHTML = t;
  const n = Uo.textContent;
  return n.charCodeAt(n.length - 1) === 59 && e !== "semi" || n === t ? !1 : n;
}
function je(e, t, n, r) {
  const i = e.length;
  let a = 0, o;
  if (t < 0 ? t = -t > i ? 0 : i + t : t = t > i ? i : t, n = n > 0 ? n : 0, r.length < 1e4)
    o = Array.from(r), o.unshift(t, n), e.splice(...o);
  else
    for (n && e.splice(t, n); a < r.length; )
      o = r.slice(a, a + 1e4), o.unshift(t, 0), e.splice(...o), a += 1e4, t += 1e4;
}
function Je(e, t) {
  return e.length > 0 ? (je(e, e.length, 0, t), e) : t;
}
const $o = {}.hasOwnProperty;
function Es(e) {
  const t = {};
  let n = -1;
  for (; ++n < e.length; )
    Rd(t, e[n]);
  return t;
}
function Rd(e, t) {
  let n;
  for (n in t) {
    const i = ($o.call(e, n) ? e[n] : void 0) || (e[n] = {}), a = t[n];
    let o;
    if (a)
      for (o in a) {
        $o.call(i, o) || (i[o] = []);
        const s = a[o];
        Od(
          // @ts-expect-error Looks like a list.
          i[o],
          Array.isArray(s) ? s : s ? [s] : []
        );
      }
  }
}
function Od(e, t) {
  let n = -1;
  const r = [];
  for (; ++n < t.length; )
    (t[n].add === "after" ? e : r).push(t[n]);
  je(e, 0, 0, r);
}
function _s(e, t) {
  const n = Number.parseInt(e, t);
  return (
    // C0 except for HT, LF, FF, CR, space.
    n < 9 || n === 11 || n > 13 && n < 32 || // Control character (DEL) of C0, and C1 controls.
    n > 126 && n < 160 || // Lone high surrogates and low surrogates.
    n > 55295 && n < 57344 || // Noncharacters.
    n > 64975 && n < 65008 || /* eslint-disable no-bitwise */
    (n & 65535) === 65535 || (n & 65535) === 65534 || /* eslint-enable no-bitwise */
    // Out of range
    n > 1114111 ? "�" : String.fromCodePoint(n)
  );
}
function it(e) {
  return e.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
const He = Dt(/[A-Za-z]/), De = Dt(/[\dA-Za-z]/), Id = Dt(/[#-'*+\--9=?A-Z^-~]/);
function sr(e) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    e !== null && (e < 32 || e === 127)
  );
}
const gi = Dt(/\d/), Md = Dt(/[\dA-Fa-f]/), Dd = Dt(/[!-/:-@[-`{-~]/);
function j(e) {
  return e !== null && e < -2;
}
function be(e) {
  return e !== null && (e < 0 || e === 32);
}
function se(e) {
  return e === -2 || e === -1 || e === 32;
}
const yr = Dt(new RegExp("\\p{P}|\\p{S}", "u")), Gt = Dt(/\s/);
function Dt(e) {
  return t;
  function t(n) {
    return n !== null && n > -1 && e.test(String.fromCharCode(n));
  }
}
function un(e) {
  const t = [];
  let n = -1, r = 0, i = 0;
  for (; ++n < e.length; ) {
    const a = e.charCodeAt(n);
    let o = "";
    if (a === 37 && De(e.charCodeAt(n + 1)) && De(e.charCodeAt(n + 2)))
      i = 2;
    else if (a < 128)
      /[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(a)) || (o = String.fromCharCode(a));
    else if (a > 55295 && a < 57344) {
      const s = e.charCodeAt(n + 1);
      a < 56320 && s > 56319 && s < 57344 ? (o = String.fromCharCode(a, s), i = 1) : o = "�";
    } else
      o = String.fromCharCode(a);
    o && (t.push(e.slice(r, n), encodeURIComponent(o)), r = n + i + 1, o = ""), i && (n += i, i = 0);
  }
  return t.join("") + e.slice(r);
}
function ce(e, t, n, r) {
  const i = r ? r - 1 : Number.POSITIVE_INFINITY;
  let a = 0;
  return o;
  function o(c) {
    return se(c) ? (e.enter(n), s(c)) : t(c);
  }
  function s(c) {
    return se(c) && a++ < i ? (e.consume(c), s) : (e.exit(n), t(c));
  }
}
const Ld = {
  tokenize: Pd
};
function Pd(e) {
  const t = e.attempt(this.parser.constructs.contentInitial, r, i);
  let n;
  return t;
  function r(s) {
    if (s === null) {
      e.consume(s);
      return;
    }
    return e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), ce(e, t, "linePrefix");
  }
  function i(s) {
    return e.enter("paragraph"), a(s);
  }
  function a(s) {
    const c = e.enter("chunkText", {
      contentType: "text",
      previous: n
    });
    return n && (n.next = c), n = c, o(s);
  }
  function o(s) {
    if (s === null) {
      e.exit("chunkText"), e.exit("paragraph"), e.consume(s);
      return;
    }
    return j(s) ? (e.consume(s), e.exit("chunkText"), a) : (e.consume(s), o);
  }
}
const Fd = {
  tokenize: Bd
}, Ho = {
  tokenize: zd
};
function Bd(e) {
  const t = this, n = [];
  let r = 0, i, a, o;
  return s;
  function s(_) {
    if (r < n.length) {
      const C = n[r];
      return t.containerState = C[1], e.attempt(C[0].continuation, c, l)(_);
    }
    return l(_);
  }
  function c(_) {
    if (r++, t.containerState._closeFlow) {
      t.containerState._closeFlow = void 0, i && x();
      const C = t.events.length;
      let T = C, k;
      for (; T--; )
        if (t.events[T][0] === "exit" && t.events[T][1].type === "chunkFlow") {
          k = t.events[T][1].end;
          break;
        }
      g(r);
      let I = C;
      for (; I < t.events.length; )
        t.events[I][1].end = {
          ...k
        }, I++;
      return je(t.events, T + 1, 0, t.events.slice(C)), t.events.length = I, l(_);
    }
    return s(_);
  }
  function l(_) {
    if (r === n.length) {
      if (!i)
        return p(_);
      if (i.currentConstruct && i.currentConstruct.concrete)
        return h(_);
      t.interrupt = !!(i.currentConstruct && !i._gfmTableDynamicInterruptHack);
    }
    return t.containerState = {}, e.check(Ho, u, d)(_);
  }
  function u(_) {
    return i && x(), g(r), p(_);
  }
  function d(_) {
    return t.parser.lazy[t.now().line] = r !== n.length, o = t.now().offset, h(_);
  }
  function p(_) {
    return t.containerState = {}, e.attempt(Ho, f, h)(_);
  }
  function f(_) {
    return r++, n.push([t.currentConstruct, t.containerState]), p(_);
  }
  function h(_) {
    if (_ === null) {
      i && x(), g(0), e.consume(_);
      return;
    }
    return i = i || t.parser.flow(t.now()), e.enter("chunkFlow", {
      _tokenizer: i,
      contentType: "flow",
      previous: a
    }), m(_);
  }
  function m(_) {
    if (_ === null) {
      b(e.exit("chunkFlow"), !0), g(0), e.consume(_);
      return;
    }
    return j(_) ? (e.consume(_), b(e.exit("chunkFlow")), r = 0, t.interrupt = void 0, s) : (e.consume(_), m);
  }
  function b(_, C) {
    const T = t.sliceStream(_);
    if (C && T.push(null), _.previous = a, a && (a.next = _), a = _, i.defineSkip(_.start), i.write(T), t.parser.lazy[_.start.line]) {
      let k = i.events.length;
      for (; k--; )
        if (
          // The token starts before the line ending…
          i.events[k][1].start.offset < o && // …and either is not ended yet…
          (!i.events[k][1].end || // …or ends after it.
          i.events[k][1].end.offset > o)
        )
          return;
      const I = t.events.length;
      let A = I, O, S;
      for (; A--; )
        if (t.events[A][0] === "exit" && t.events[A][1].type === "chunkFlow") {
          if (O) {
            S = t.events[A][1].end;
            break;
          }
          O = !0;
        }
      for (g(r), k = I; k < t.events.length; )
        t.events[k][1].end = {
          ...S
        }, k++;
      je(t.events, A + 1, 0, t.events.slice(I)), t.events.length = k;
    }
  }
  function g(_) {
    let C = n.length;
    for (; C-- > _; ) {
      const T = n[C];
      t.containerState = T[1], T[0].exit.call(t, e);
    }
    n.length = _;
  }
  function x() {
    i.write([null]), a = void 0, i = void 0, t.containerState._closeFlow = void 0;
  }
}
function zd(e, t, n) {
  return ce(e, e.attempt(this.parser.constructs.document, t, n), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
}
function rn(e) {
  if (e === null || be(e) || Gt(e))
    return 1;
  if (yr(e))
    return 2;
}
function Er(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; ) {
    const a = e[i].resolveAll;
    a && !r.includes(a) && (t = a(t, n), r.push(a));
  }
  return t;
}
const mi = {
  name: "attention",
  resolveAll: Ud,
  tokenize: $d
};
function Ud(e, t) {
  let n = -1, r, i, a, o, s, c, l, u;
  for (; ++n < e.length; )
    if (e[n][0] === "enter" && e[n][1].type === "attentionSequence" && e[n][1]._close) {
      for (r = n; r--; )
        if (e[r][0] === "exit" && e[r][1].type === "attentionSequence" && e[r][1]._open && // If the markers are the same:
        t.sliceSerialize(e[r][1]).charCodeAt(0) === t.sliceSerialize(e[n][1]).charCodeAt(0)) {
          if ((e[r][1]._close || e[n][1]._open) && (e[n][1].end.offset - e[n][1].start.offset) % 3 && !((e[r][1].end.offset - e[r][1].start.offset + e[n][1].end.offset - e[n][1].start.offset) % 3))
            continue;
          c = e[r][1].end.offset - e[r][1].start.offset > 1 && e[n][1].end.offset - e[n][1].start.offset > 1 ? 2 : 1;
          const d = {
            ...e[r][1].end
          }, p = {
            ...e[n][1].start
          };
          Go(d, -c), Go(p, c), o = {
            type: c > 1 ? "strongSequence" : "emphasisSequence",
            start: d,
            end: {
              ...e[r][1].end
            }
          }, s = {
            type: c > 1 ? "strongSequence" : "emphasisSequence",
            start: {
              ...e[n][1].start
            },
            end: p
          }, a = {
            type: c > 1 ? "strongText" : "emphasisText",
            start: {
              ...e[r][1].end
            },
            end: {
              ...e[n][1].start
            }
          }, i = {
            type: c > 1 ? "strong" : "emphasis",
            start: {
              ...o.start
            },
            end: {
              ...s.end
            }
          }, e[r][1].end = {
            ...o.start
          }, e[n][1].start = {
            ...s.end
          }, l = [], e[r][1].end.offset - e[r][1].start.offset && (l = Je(l, [["enter", e[r][1], t], ["exit", e[r][1], t]])), l = Je(l, [["enter", i, t], ["enter", o, t], ["exit", o, t], ["enter", a, t]]), l = Je(l, Er(t.parser.constructs.insideSpan.null, e.slice(r + 1, n), t)), l = Je(l, [["exit", a, t], ["enter", s, t], ["exit", s, t], ["exit", i, t]]), e[n][1].end.offset - e[n][1].start.offset ? (u = 2, l = Je(l, [["enter", e[n][1], t], ["exit", e[n][1], t]])) : u = 0, je(e, r - 1, n - r + 3, l), n = r + l.length - u - 2;
          break;
        }
    }
  for (n = -1; ++n < e.length; )
    e[n][1].type === "attentionSequence" && (e[n][1].type = "data");
  return e;
}
function $d(e, t) {
  const n = this.parser.constructs.attentionMarkers.null, r = this.previous, i = rn(r);
  let a;
  return o;
  function o(c) {
    return a = c, e.enter("attentionSequence"), s(c);
  }
  function s(c) {
    if (c === a)
      return e.consume(c), s;
    const l = e.exit("attentionSequence"), u = rn(c), d = !u || u === 2 && i || n.includes(c), p = !i || i === 2 && u || n.includes(r);
    return l._open = !!(a === 42 ? d : d && (i || !p)), l._close = !!(a === 42 ? p : p && (u || !d)), t(c);
  }
}
function Go(e, t) {
  e.column += t, e.offset += t, e._bufferIndex += t;
}
const Hd = {
  name: "autolink",
  tokenize: Gd
};
function Gd(e, t, n) {
  let r = 0;
  return i;
  function i(f) {
    return e.enter("autolink"), e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.enter("autolinkProtocol"), a;
  }
  function a(f) {
    return He(f) ? (e.consume(f), o) : f === 64 ? n(f) : l(f);
  }
  function o(f) {
    return f === 43 || f === 45 || f === 46 || De(f) ? (r = 1, s(f)) : l(f);
  }
  function s(f) {
    return f === 58 ? (e.consume(f), r = 0, c) : (f === 43 || f === 45 || f === 46 || De(f)) && r++ < 32 ? (e.consume(f), s) : (r = 0, l(f));
  }
  function c(f) {
    return f === 62 ? (e.exit("autolinkProtocol"), e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.exit("autolink"), t) : f === null || f === 32 || f === 60 || sr(f) ? n(f) : (e.consume(f), c);
  }
  function l(f) {
    return f === 64 ? (e.consume(f), u) : Id(f) ? (e.consume(f), l) : n(f);
  }
  function u(f) {
    return De(f) ? d(f) : n(f);
  }
  function d(f) {
    return f === 46 ? (e.consume(f), r = 0, u) : f === 62 ? (e.exit("autolinkProtocol").type = "autolinkEmail", e.enter("autolinkMarker"), e.consume(f), e.exit("autolinkMarker"), e.exit("autolink"), t) : p(f);
  }
  function p(f) {
    if ((f === 45 || De(f)) && r++ < 63) {
      const h = f === 45 ? p : d;
      return e.consume(f), h;
    }
    return n(f);
  }
}
const On = {
  partial: !0,
  tokenize: Kd
};
function Kd(e, t, n) {
  return r;
  function r(a) {
    return se(a) ? ce(e, i, "linePrefix")(a) : i(a);
  }
  function i(a) {
    return a === null || j(a) ? t(a) : n(a);
  }
}
const ws = {
  continuation: {
    tokenize: Wd
  },
  exit: Vd,
  name: "blockQuote",
  tokenize: qd
};
function qd(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    if (o === 62) {
      const s = r.containerState;
      return s.open || (e.enter("blockQuote", {
        _container: !0
      }), s.open = !0), e.enter("blockQuotePrefix"), e.enter("blockQuoteMarker"), e.consume(o), e.exit("blockQuoteMarker"), a;
    }
    return n(o);
  }
  function a(o) {
    return se(o) ? (e.enter("blockQuotePrefixWhitespace"), e.consume(o), e.exit("blockQuotePrefixWhitespace"), e.exit("blockQuotePrefix"), t) : (e.exit("blockQuotePrefix"), t(o));
  }
}
function Wd(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return se(o) ? ce(e, a, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(o) : a(o);
  }
  function a(o) {
    return e.attempt(ws, t, n)(o);
  }
}
function Vd(e) {
  e.exit("blockQuote");
}
const xs = {
  name: "characterEscape",
  tokenize: Yd
};
function Yd(e, t, n) {
  return r;
  function r(a) {
    return e.enter("characterEscape"), e.enter("escapeMarker"), e.consume(a), e.exit("escapeMarker"), i;
  }
  function i(a) {
    return Dd(a) ? (e.enter("characterEscapeValue"), e.consume(a), e.exit("characterEscapeValue"), e.exit("characterEscape"), t) : n(a);
  }
}
const ks = {
  name: "characterReference",
  tokenize: Zd
};
function Zd(e, t, n) {
  const r = this;
  let i = 0, a, o;
  return s;
  function s(d) {
    return e.enter("characterReference"), e.enter("characterReferenceMarker"), e.consume(d), e.exit("characterReferenceMarker"), c;
  }
  function c(d) {
    return d === 35 ? (e.enter("characterReferenceMarkerNumeric"), e.consume(d), e.exit("characterReferenceMarkerNumeric"), l) : (e.enter("characterReferenceValue"), a = 31, o = De, u(d));
  }
  function l(d) {
    return d === 88 || d === 120 ? (e.enter("characterReferenceMarkerHexadecimal"), e.consume(d), e.exit("characterReferenceMarkerHexadecimal"), e.enter("characterReferenceValue"), a = 6, o = Md, u) : (e.enter("characterReferenceValue"), a = 7, o = gi, u(d));
  }
  function u(d) {
    if (d === 59 && i) {
      const p = e.exit("characterReferenceValue");
      return o === De && !Hi(r.sliceSerialize(p)) ? n(d) : (e.enter("characterReferenceMarker"), e.consume(d), e.exit("characterReferenceMarker"), e.exit("characterReference"), t);
    }
    return o(d) && i++ < a ? (e.consume(d), u) : n(d);
  }
}
const Ko = {
  partial: !0,
  tokenize: jd
}, qo = {
  concrete: !0,
  name: "codeFenced",
  tokenize: Xd
};
function Xd(e, t, n) {
  const r = this, i = {
    partial: !0,
    tokenize: T
  };
  let a = 0, o = 0, s;
  return c;
  function c(k) {
    return l(k);
  }
  function l(k) {
    const I = r.events[r.events.length - 1];
    return a = I && I[1].type === "linePrefix" ? I[2].sliceSerialize(I[1], !0).length : 0, s = k, e.enter("codeFenced"), e.enter("codeFencedFence"), e.enter("codeFencedFenceSequence"), u(k);
  }
  function u(k) {
    return k === s ? (o++, e.consume(k), u) : o < 3 ? n(k) : (e.exit("codeFencedFenceSequence"), se(k) ? ce(e, d, "whitespace")(k) : d(k));
  }
  function d(k) {
    return k === null || j(k) ? (e.exit("codeFencedFence"), r.interrupt ? t(k) : e.check(Ko, m, C)(k)) : (e.enter("codeFencedFenceInfo"), e.enter("chunkString", {
      contentType: "string"
    }), p(k));
  }
  function p(k) {
    return k === null || j(k) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), d(k)) : se(k) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), ce(e, f, "whitespace")(k)) : k === 96 && k === s ? n(k) : (e.consume(k), p);
  }
  function f(k) {
    return k === null || j(k) ? d(k) : (e.enter("codeFencedFenceMeta"), e.enter("chunkString", {
      contentType: "string"
    }), h(k));
  }
  function h(k) {
    return k === null || j(k) ? (e.exit("chunkString"), e.exit("codeFencedFenceMeta"), d(k)) : k === 96 && k === s ? n(k) : (e.consume(k), h);
  }
  function m(k) {
    return e.attempt(i, C, b)(k);
  }
  function b(k) {
    return e.enter("lineEnding"), e.consume(k), e.exit("lineEnding"), g;
  }
  function g(k) {
    return a > 0 && se(k) ? ce(e, x, "linePrefix", a + 1)(k) : x(k);
  }
  function x(k) {
    return k === null || j(k) ? e.check(Ko, m, C)(k) : (e.enter("codeFlowValue"), _(k));
  }
  function _(k) {
    return k === null || j(k) ? (e.exit("codeFlowValue"), x(k)) : (e.consume(k), _);
  }
  function C(k) {
    return e.exit("codeFenced"), t(k);
  }
  function T(k, I, A) {
    let O = 0;
    return S;
    function S(D) {
      return k.enter("lineEnding"), k.consume(D), k.exit("lineEnding"), L;
    }
    function L(D) {
      return k.enter("codeFencedFence"), se(D) ? ce(k, B, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(D) : B(D);
    }
    function B(D) {
      return D === s ? (k.enter("codeFencedFenceSequence"), W(D)) : A(D);
    }
    function W(D) {
      return D === s ? (O++, k.consume(D), W) : O >= o ? (k.exit("codeFencedFenceSequence"), se(D) ? ce(k, P, "whitespace")(D) : P(D)) : A(D);
    }
    function P(D) {
      return D === null || j(D) ? (k.exit("codeFencedFence"), I(D)) : A(D);
    }
  }
}
function jd(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return o === null ? n(o) : (e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), a);
  }
  function a(o) {
    return r.parser.lazy[r.now().line] ? n(o) : t(o);
  }
}
const Gr = {
  name: "codeIndented",
  tokenize: Jd
}, Qd = {
  partial: !0,
  tokenize: ef
};
function Jd(e, t, n) {
  const r = this;
  return i;
  function i(l) {
    return e.enter("codeIndented"), ce(e, a, "linePrefix", 5)(l);
  }
  function a(l) {
    const u = r.events[r.events.length - 1];
    return u && u[1].type === "linePrefix" && u[2].sliceSerialize(u[1], !0).length >= 4 ? o(l) : n(l);
  }
  function o(l) {
    return l === null ? c(l) : j(l) ? e.attempt(Qd, o, c)(l) : (e.enter("codeFlowValue"), s(l));
  }
  function s(l) {
    return l === null || j(l) ? (e.exit("codeFlowValue"), o(l)) : (e.consume(l), s);
  }
  function c(l) {
    return e.exit("codeIndented"), t(l);
  }
}
function ef(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return r.parser.lazy[r.now().line] ? n(o) : j(o) ? (e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), i) : ce(e, a, "linePrefix", 5)(o);
  }
  function a(o) {
    const s = r.events[r.events.length - 1];
    return s && s[1].type === "linePrefix" && s[2].sliceSerialize(s[1], !0).length >= 4 ? t(o) : j(o) ? i(o) : n(o);
  }
}
const tf = {
  name: "codeText",
  previous: rf,
  resolve: nf,
  tokenize: of
};
function nf(e) {
  let t = e.length - 4, n = 3, r, i;
  if ((e[n][1].type === "lineEnding" || e[n][1].type === "space") && (e[t][1].type === "lineEnding" || e[t][1].type === "space")) {
    for (r = n; ++r < t; )
      if (e[r][1].type === "codeTextData") {
        e[n][1].type = "codeTextPadding", e[t][1].type = "codeTextPadding", n += 2, t -= 2;
        break;
      }
  }
  for (r = n - 1, t++; ++r <= t; )
    i === void 0 ? r !== t && e[r][1].type !== "lineEnding" && (i = r) : (r === t || e[r][1].type === "lineEnding") && (e[i][1].type = "codeTextData", r !== i + 2 && (e[i][1].end = e[r - 1][1].end, e.splice(i + 2, r - i - 2), t -= r - i - 2, r = i + 2), i = void 0);
  return e;
}
function rf(e) {
  return e !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function of(e, t, n) {
  let r = 0, i, a;
  return o;
  function o(d) {
    return e.enter("codeText"), e.enter("codeTextSequence"), s(d);
  }
  function s(d) {
    return d === 96 ? (e.consume(d), r++, s) : (e.exit("codeTextSequence"), c(d));
  }
  function c(d) {
    return d === null ? n(d) : d === 32 ? (e.enter("space"), e.consume(d), e.exit("space"), c) : d === 96 ? (a = e.enter("codeTextSequence"), i = 0, u(d)) : j(d) ? (e.enter("lineEnding"), e.consume(d), e.exit("lineEnding"), c) : (e.enter("codeTextData"), l(d));
  }
  function l(d) {
    return d === null || d === 32 || d === 96 || j(d) ? (e.exit("codeTextData"), c(d)) : (e.consume(d), l);
  }
  function u(d) {
    return d === 96 ? (e.consume(d), i++, u) : i === r ? (e.exit("codeTextSequence"), e.exit("codeText"), t(d)) : (a.type = "codeTextData", l(d));
  }
}
class af {
  /**
   * @param {ReadonlyArray<T> | null | undefined} [initial]
   *   Initial items (optional).
   * @returns
   *   Splice buffer.
   */
  constructor(t) {
    this.left = t ? [...t] : [], this.right = [];
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
  get(t) {
    if (t < 0 || t >= this.left.length + this.right.length)
      throw new RangeError("Cannot access index `" + t + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
    return t < this.left.length ? this.left[t] : this.right[this.right.length - t + this.left.length - 1];
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
  slice(t, n) {
    const r = n ?? Number.POSITIVE_INFINITY;
    return r < this.left.length ? this.left.slice(t, r) : t > this.left.length ? this.right.slice(this.right.length - r + this.left.length, this.right.length - t + this.left.length).reverse() : this.left.slice(t).concat(this.right.slice(this.right.length - r + this.left.length).reverse());
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
  splice(t, n, r) {
    const i = n || 0;
    this.setCursor(Math.trunc(t));
    const a = this.right.splice(this.right.length - i, Number.POSITIVE_INFINITY);
    return r && yn(this.left, r), a.reverse();
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
  push(t) {
    this.setCursor(Number.POSITIVE_INFINITY), this.left.push(t);
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
  pushMany(t) {
    this.setCursor(Number.POSITIVE_INFINITY), yn(this.left, t);
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
  unshift(t) {
    this.setCursor(0), this.right.push(t);
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
  unshiftMany(t) {
    this.setCursor(0), yn(this.right, t.reverse());
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
  setCursor(t) {
    if (!(t === this.left.length || t > this.left.length && this.right.length === 0 || t < 0 && this.left.length === 0))
      if (t < this.left.length) {
        const n = this.left.splice(t, Number.POSITIVE_INFINITY);
        yn(this.right, n.reverse());
      } else {
        const n = this.right.splice(this.left.length + this.right.length - t, Number.POSITIVE_INFINITY);
        yn(this.left, n.reverse());
      }
  }
}
function yn(e, t) {
  let n = 0;
  if (t.length < 1e4)
    e.push(...t);
  else
    for (; n < t.length; )
      e.push(...t.slice(n, n + 1e4)), n += 1e4;
}
function vs(e) {
  const t = {};
  let n = -1, r, i, a, o, s, c, l;
  const u = new af(e);
  for (; ++n < u.length; ) {
    for (; n in t; )
      n = t[n];
    if (r = u.get(n), n && r[1].type === "chunkFlow" && u.get(n - 1)[1].type === "listItemPrefix" && (c = r[1]._tokenizer.events, a = 0, a < c.length && c[a][1].type === "lineEndingBlank" && (a += 2), a < c.length && c[a][1].type === "content"))
      for (; ++a < c.length && c[a][1].type !== "content"; )
        c[a][1].type === "chunkText" && (c[a][1]._isInFirstContentOfListItem = !0, a++);
    if (r[0] === "enter")
      r[1].contentType && (Object.assign(t, sf(u, n)), n = t[n], l = !0);
    else if (r[1]._container) {
      for (a = n, i = void 0; a--; )
        if (o = u.get(a), o[1].type === "lineEnding" || o[1].type === "lineEndingBlank")
          o[0] === "enter" && (i && (u.get(i)[1].type = "lineEndingBlank"), o[1].type = "lineEnding", i = a);
        else if (!(o[1].type === "linePrefix" || o[1].type === "listItemIndent")) break;
      i && (r[1].end = {
        ...u.get(i)[1].start
      }, s = u.slice(i, n), s.unshift(r), u.splice(i, n - i + 1, s));
    }
  }
  return je(e, 0, Number.POSITIVE_INFINITY, u.slice(0)), !l;
}
function sf(e, t) {
  const n = e.get(t)[1], r = e.get(t)[2];
  let i = t - 1;
  const a = [];
  let o = n._tokenizer;
  o || (o = r.parser[n.contentType](n.start), n._contentTypeTextTrailing && (o._contentTypeTextTrailing = !0));
  const s = o.events, c = [], l = {};
  let u, d, p = -1, f = n, h = 0, m = 0;
  const b = [m];
  for (; f; ) {
    for (; e.get(++i)[1] !== f; )
      ;
    a.push(i), f._tokenizer || (u = r.sliceStream(f), f.next || u.push(null), d && o.defineSkip(f.start), f._isInFirstContentOfListItem && (o._gfmTasklistFirstContentOfListItem = !0), o.write(u), f._isInFirstContentOfListItem && (o._gfmTasklistFirstContentOfListItem = void 0)), d = f, f = f.next;
  }
  for (f = n; ++p < s.length; )
    // Find a void token that includes a break.
    s[p][0] === "exit" && s[p - 1][0] === "enter" && s[p][1].type === s[p - 1][1].type && s[p][1].start.line !== s[p][1].end.line && (m = p + 1, b.push(m), f._tokenizer = void 0, f.previous = void 0, f = f.next);
  for (o.events = [], f ? (f._tokenizer = void 0, f.previous = void 0) : b.pop(), p = b.length; p--; ) {
    const g = s.slice(b[p], b[p + 1]), x = a.pop();
    c.push([x, x + g.length - 1]), e.splice(x, 2, g);
  }
  for (c.reverse(), p = -1; ++p < c.length; )
    l[h + c[p][0]] = h + c[p][1], h += c[p][1] - c[p][0] - 1;
  return l;
}
const lf = {
  resolve: uf,
  tokenize: df
}, cf = {
  partial: !0,
  tokenize: ff
};
function uf(e) {
  return vs(e), e;
}
function df(e, t) {
  let n;
  return r;
  function r(s) {
    return e.enter("content"), n = e.enter("chunkContent", {
      contentType: "content"
    }), i(s);
  }
  function i(s) {
    return s === null ? a(s) : j(s) ? e.check(cf, o, a)(s) : (e.consume(s), i);
  }
  function a(s) {
    return e.exit("chunkContent"), e.exit("content"), t(s);
  }
  function o(s) {
    return e.consume(s), e.exit("chunkContent"), n.next = e.enter("chunkContent", {
      contentType: "content",
      previous: n
    }), n = n.next, i;
  }
}
function ff(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return e.exit("chunkContent"), e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), ce(e, a, "linePrefix");
  }
  function a(o) {
    if (o === null || j(o))
      return n(o);
    const s = r.events[r.events.length - 1];
    return !r.parser.constructs.disable.null.includes("codeIndented") && s && s[1].type === "linePrefix" && s[2].sliceSerialize(s[1], !0).length >= 4 ? t(o) : e.interrupt(r.parser.constructs.flow, n, t)(o);
  }
}
function Ss(e, t, n, r, i, a, o, s, c) {
  const l = c || Number.POSITIVE_INFINITY;
  let u = 0;
  return d;
  function d(g) {
    return g === 60 ? (e.enter(r), e.enter(i), e.enter(a), e.consume(g), e.exit(a), p) : g === null || g === 32 || g === 41 || sr(g) ? n(g) : (e.enter(r), e.enter(o), e.enter(s), e.enter("chunkString", {
      contentType: "string"
    }), m(g));
  }
  function p(g) {
    return g === 62 ? (e.enter(a), e.consume(g), e.exit(a), e.exit(i), e.exit(r), t) : (e.enter(s), e.enter("chunkString", {
      contentType: "string"
    }), f(g));
  }
  function f(g) {
    return g === 62 ? (e.exit("chunkString"), e.exit(s), p(g)) : g === null || g === 60 || j(g) ? n(g) : (e.consume(g), g === 92 ? h : f);
  }
  function h(g) {
    return g === 60 || g === 62 || g === 92 ? (e.consume(g), f) : f(g);
  }
  function m(g) {
    return !u && (g === null || g === 41 || be(g)) ? (e.exit("chunkString"), e.exit(s), e.exit(o), e.exit(r), t(g)) : u < l && g === 40 ? (e.consume(g), u++, m) : g === 41 ? (e.consume(g), u--, m) : g === null || g === 32 || g === 40 || sr(g) ? n(g) : (e.consume(g), g === 92 ? b : m);
  }
  function b(g) {
    return g === 40 || g === 41 || g === 92 ? (e.consume(g), m) : m(g);
  }
}
function Ns(e, t, n, r, i, a) {
  const o = this;
  let s = 0, c;
  return l;
  function l(f) {
    return e.enter(r), e.enter(i), e.consume(f), e.exit(i), e.enter(a), u;
  }
  function u(f) {
    return s > 999 || f === null || f === 91 || f === 93 && !c || // To do: remove in the future once we’ve switched from
    // `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
    // which doesn’t need this.
    // Hidden footnotes hook.
    /* c8 ignore next 3 */
    f === 94 && !s && "_hiddenFootnoteSupport" in o.parser.constructs ? n(f) : f === 93 ? (e.exit(a), e.enter(i), e.consume(f), e.exit(i), e.exit(r), t) : j(f) ? (e.enter("lineEnding"), e.consume(f), e.exit("lineEnding"), u) : (e.enter("chunkString", {
      contentType: "string"
    }), d(f));
  }
  function d(f) {
    return f === null || f === 91 || f === 93 || j(f) || s++ > 999 ? (e.exit("chunkString"), u(f)) : (e.consume(f), c || (c = !se(f)), f === 92 ? p : d);
  }
  function p(f) {
    return f === 91 || f === 92 || f === 93 ? (e.consume(f), s++, d) : d(f);
  }
}
function Cs(e, t, n, r, i, a) {
  let o;
  return s;
  function s(p) {
    return p === 34 || p === 39 || p === 40 ? (e.enter(r), e.enter(i), e.consume(p), e.exit(i), o = p === 40 ? 41 : p, c) : n(p);
  }
  function c(p) {
    return p === o ? (e.enter(i), e.consume(p), e.exit(i), e.exit(r), t) : (e.enter(a), l(p));
  }
  function l(p) {
    return p === o ? (e.exit(a), c(o)) : p === null ? n(p) : j(p) ? (e.enter("lineEnding"), e.consume(p), e.exit("lineEnding"), ce(e, l, "linePrefix")) : (e.enter("chunkString", {
      contentType: "string"
    }), u(p));
  }
  function u(p) {
    return p === o || p === null || j(p) ? (e.exit("chunkString"), l(p)) : (e.consume(p), p === 92 ? d : u);
  }
  function d(p) {
    return p === o || p === 92 ? (e.consume(p), u) : u(p);
  }
}
function xn(e, t) {
  let n;
  return r;
  function r(i) {
    return j(i) ? (e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), n = !0, r) : se(i) ? ce(e, r, n ? "linePrefix" : "lineSuffix")(i) : t(i);
  }
}
const pf = {
  name: "definition",
  tokenize: gf
}, hf = {
  partial: !0,
  tokenize: mf
};
function gf(e, t, n) {
  const r = this;
  let i;
  return a;
  function a(f) {
    return e.enter("definition"), o(f);
  }
  function o(f) {
    return Ns.call(
      r,
      e,
      s,
      // Note: we don’t need to reset the way `markdown-rs` does.
      n,
      "definitionLabel",
      "definitionLabelMarker",
      "definitionLabelString"
    )(f);
  }
  function s(f) {
    return i = it(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1)), f === 58 ? (e.enter("definitionMarker"), e.consume(f), e.exit("definitionMarker"), c) : n(f);
  }
  function c(f) {
    return be(f) ? xn(e, l)(f) : l(f);
  }
  function l(f) {
    return Ss(
      e,
      u,
      // Note: we don’t need to reset the way `markdown-rs` does.
      n,
      "definitionDestination",
      "definitionDestinationLiteral",
      "definitionDestinationLiteralMarker",
      "definitionDestinationRaw",
      "definitionDestinationString"
    )(f);
  }
  function u(f) {
    return e.attempt(hf, d, d)(f);
  }
  function d(f) {
    return se(f) ? ce(e, p, "whitespace")(f) : p(f);
  }
  function p(f) {
    return f === null || j(f) ? (e.exit("definition"), r.parser.defined.push(i), t(f)) : n(f);
  }
}
function mf(e, t, n) {
  return r;
  function r(s) {
    return be(s) ? xn(e, i)(s) : n(s);
  }
  function i(s) {
    return Cs(e, a, n, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(s);
  }
  function a(s) {
    return se(s) ? ce(e, o, "whitespace")(s) : o(s);
  }
  function o(s) {
    return s === null || j(s) ? t(s) : n(s);
  }
}
const bf = {
  name: "hardBreakEscape",
  tokenize: yf
};
function yf(e, t, n) {
  return r;
  function r(a) {
    return e.enter("hardBreakEscape"), e.consume(a), i;
  }
  function i(a) {
    return j(a) ? (e.exit("hardBreakEscape"), t(a)) : n(a);
  }
}
const Ef = {
  name: "headingAtx",
  resolve: _f,
  tokenize: wf
};
function _f(e, t) {
  let n = e.length - 2, r = 3, i, a;
  return e[r][1].type === "whitespace" && (r += 2), n - 2 > r && e[n][1].type === "whitespace" && (n -= 2), e[n][1].type === "atxHeadingSequence" && (r === n - 1 || n - 4 > r && e[n - 2][1].type === "whitespace") && (n -= r + 1 === n ? 2 : 4), n > r && (i = {
    type: "atxHeadingText",
    start: e[r][1].start,
    end: e[n][1].end
  }, a = {
    type: "chunkText",
    start: e[r][1].start,
    end: e[n][1].end,
    contentType: "text"
  }, je(e, r, n - r + 1, [["enter", i, t], ["enter", a, t], ["exit", a, t], ["exit", i, t]])), e;
}
function wf(e, t, n) {
  let r = 0;
  return i;
  function i(u) {
    return e.enter("atxHeading"), a(u);
  }
  function a(u) {
    return e.enter("atxHeadingSequence"), o(u);
  }
  function o(u) {
    return u === 35 && r++ < 6 ? (e.consume(u), o) : u === null || be(u) ? (e.exit("atxHeadingSequence"), s(u)) : n(u);
  }
  function s(u) {
    return u === 35 ? (e.enter("atxHeadingSequence"), c(u)) : u === null || j(u) ? (e.exit("atxHeading"), t(u)) : se(u) ? ce(e, s, "whitespace")(u) : (e.enter("atxHeadingText"), l(u));
  }
  function c(u) {
    return u === 35 ? (e.consume(u), c) : (e.exit("atxHeadingSequence"), s(u));
  }
  function l(u) {
    return u === null || u === 35 || be(u) ? (e.exit("atxHeadingText"), s(u)) : (e.consume(u), l);
  }
}
const xf = [
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
], Wo = ["pre", "script", "style", "textarea"], kf = {
  concrete: !0,
  name: "htmlFlow",
  resolveTo: Nf,
  tokenize: Cf
}, vf = {
  partial: !0,
  tokenize: Af
}, Sf = {
  partial: !0,
  tokenize: Tf
};
function Nf(e) {
  let t = e.length;
  for (; t-- && !(e[t][0] === "enter" && e[t][1].type === "htmlFlow"); )
    ;
  return t > 1 && e[t - 2][1].type === "linePrefix" && (e[t][1].start = e[t - 2][1].start, e[t + 1][1].start = e[t - 2][1].start, e.splice(t - 2, 2)), e;
}
function Cf(e, t, n) {
  const r = this;
  let i, a, o, s, c;
  return l;
  function l(w) {
    return u(w);
  }
  function u(w) {
    return e.enter("htmlFlow"), e.enter("htmlFlowData"), e.consume(w), d;
  }
  function d(w) {
    return w === 33 ? (e.consume(w), p) : w === 47 ? (e.consume(w), a = !0, m) : w === 63 ? (e.consume(w), i = 3, r.interrupt ? t : y) : He(w) ? (e.consume(w), o = String.fromCharCode(w), b) : n(w);
  }
  function p(w) {
    return w === 45 ? (e.consume(w), i = 2, f) : w === 91 ? (e.consume(w), i = 5, s = 0, h) : He(w) ? (e.consume(w), i = 4, r.interrupt ? t : y) : n(w);
  }
  function f(w) {
    return w === 45 ? (e.consume(w), r.interrupt ? t : y) : n(w);
  }
  function h(w) {
    const Re = "CDATA[";
    return w === Re.charCodeAt(s++) ? (e.consume(w), s === Re.length ? r.interrupt ? t : B : h) : n(w);
  }
  function m(w) {
    return He(w) ? (e.consume(w), o = String.fromCharCode(w), b) : n(w);
  }
  function b(w) {
    if (w === null || w === 47 || w === 62 || be(w)) {
      const Re = w === 47, Ge = o.toLowerCase();
      return !Re && !a && Wo.includes(Ge) ? (i = 1, r.interrupt ? t(w) : B(w)) : xf.includes(o.toLowerCase()) ? (i = 6, Re ? (e.consume(w), g) : r.interrupt ? t(w) : B(w)) : (i = 7, r.interrupt && !r.parser.lazy[r.now().line] ? n(w) : a ? x(w) : _(w));
    }
    return w === 45 || De(w) ? (e.consume(w), o += String.fromCharCode(w), b) : n(w);
  }
  function g(w) {
    return w === 62 ? (e.consume(w), r.interrupt ? t : B) : n(w);
  }
  function x(w) {
    return se(w) ? (e.consume(w), x) : S(w);
  }
  function _(w) {
    return w === 47 ? (e.consume(w), S) : w === 58 || w === 95 || He(w) ? (e.consume(w), C) : se(w) ? (e.consume(w), _) : S(w);
  }
  function C(w) {
    return w === 45 || w === 46 || w === 58 || w === 95 || De(w) ? (e.consume(w), C) : T(w);
  }
  function T(w) {
    return w === 61 ? (e.consume(w), k) : se(w) ? (e.consume(w), T) : _(w);
  }
  function k(w) {
    return w === null || w === 60 || w === 61 || w === 62 || w === 96 ? n(w) : w === 34 || w === 39 ? (e.consume(w), c = w, I) : se(w) ? (e.consume(w), k) : A(w);
  }
  function I(w) {
    return w === c ? (e.consume(w), c = null, O) : w === null || j(w) ? n(w) : (e.consume(w), I);
  }
  function A(w) {
    return w === null || w === 34 || w === 39 || w === 47 || w === 60 || w === 61 || w === 62 || w === 96 || be(w) ? T(w) : (e.consume(w), A);
  }
  function O(w) {
    return w === 47 || w === 62 || se(w) ? _(w) : n(w);
  }
  function S(w) {
    return w === 62 ? (e.consume(w), L) : n(w);
  }
  function L(w) {
    return w === null || j(w) ? B(w) : se(w) ? (e.consume(w), L) : n(w);
  }
  function B(w) {
    return w === 45 && i === 2 ? (e.consume(w), K) : w === 60 && i === 1 ? (e.consume(w), Q) : w === 62 && i === 4 ? (e.consume(w), ue) : w === 63 && i === 3 ? (e.consume(w), y) : w === 93 && i === 5 ? (e.consume(w), ne) : j(w) && (i === 6 || i === 7) ? (e.exit("htmlFlowData"), e.check(vf, fe, W)(w)) : w === null || j(w) ? (e.exit("htmlFlowData"), W(w)) : (e.consume(w), B);
  }
  function W(w) {
    return e.check(Sf, P, fe)(w);
  }
  function P(w) {
    return e.enter("lineEnding"), e.consume(w), e.exit("lineEnding"), D;
  }
  function D(w) {
    return w === null || j(w) ? W(w) : (e.enter("htmlFlowData"), B(w));
  }
  function K(w) {
    return w === 45 ? (e.consume(w), y) : B(w);
  }
  function Q(w) {
    return w === 47 ? (e.consume(w), o = "", $) : B(w);
  }
  function $(w) {
    if (w === 62) {
      const Re = o.toLowerCase();
      return Wo.includes(Re) ? (e.consume(w), ue) : B(w);
    }
    return He(w) && o.length < 8 ? (e.consume(w), o += String.fromCharCode(w), $) : B(w);
  }
  function ne(w) {
    return w === 93 ? (e.consume(w), y) : B(w);
  }
  function y(w) {
    return w === 62 ? (e.consume(w), ue) : w === 45 && i === 2 ? (e.consume(w), y) : B(w);
  }
  function ue(w) {
    return w === null || j(w) ? (e.exit("htmlFlowData"), fe(w)) : (e.consume(w), ue);
  }
  function fe(w) {
    return e.exit("htmlFlow"), t(w);
  }
}
function Tf(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return j(o) ? (e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), a) : n(o);
  }
  function a(o) {
    return r.parser.lazy[r.now().line] ? n(o) : t(o);
  }
}
function Af(e, t, n) {
  return r;
  function r(i) {
    return e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), e.attempt(On, t, n);
  }
}
const Rf = {
  name: "htmlText",
  tokenize: Of
};
function Of(e, t, n) {
  const r = this;
  let i, a, o;
  return s;
  function s(y) {
    return e.enter("htmlText"), e.enter("htmlTextData"), e.consume(y), c;
  }
  function c(y) {
    return y === 33 ? (e.consume(y), l) : y === 47 ? (e.consume(y), T) : y === 63 ? (e.consume(y), _) : He(y) ? (e.consume(y), A) : n(y);
  }
  function l(y) {
    return y === 45 ? (e.consume(y), u) : y === 91 ? (e.consume(y), a = 0, h) : He(y) ? (e.consume(y), x) : n(y);
  }
  function u(y) {
    return y === 45 ? (e.consume(y), f) : n(y);
  }
  function d(y) {
    return y === null ? n(y) : y === 45 ? (e.consume(y), p) : j(y) ? (o = d, Q(y)) : (e.consume(y), d);
  }
  function p(y) {
    return y === 45 ? (e.consume(y), f) : d(y);
  }
  function f(y) {
    return y === 62 ? K(y) : y === 45 ? p(y) : d(y);
  }
  function h(y) {
    const ue = "CDATA[";
    return y === ue.charCodeAt(a++) ? (e.consume(y), a === ue.length ? m : h) : n(y);
  }
  function m(y) {
    return y === null ? n(y) : y === 93 ? (e.consume(y), b) : j(y) ? (o = m, Q(y)) : (e.consume(y), m);
  }
  function b(y) {
    return y === 93 ? (e.consume(y), g) : m(y);
  }
  function g(y) {
    return y === 62 ? K(y) : y === 93 ? (e.consume(y), g) : m(y);
  }
  function x(y) {
    return y === null || y === 62 ? K(y) : j(y) ? (o = x, Q(y)) : (e.consume(y), x);
  }
  function _(y) {
    return y === null ? n(y) : y === 63 ? (e.consume(y), C) : j(y) ? (o = _, Q(y)) : (e.consume(y), _);
  }
  function C(y) {
    return y === 62 ? K(y) : _(y);
  }
  function T(y) {
    return He(y) ? (e.consume(y), k) : n(y);
  }
  function k(y) {
    return y === 45 || De(y) ? (e.consume(y), k) : I(y);
  }
  function I(y) {
    return j(y) ? (o = I, Q(y)) : se(y) ? (e.consume(y), I) : K(y);
  }
  function A(y) {
    return y === 45 || De(y) ? (e.consume(y), A) : y === 47 || y === 62 || be(y) ? O(y) : n(y);
  }
  function O(y) {
    return y === 47 ? (e.consume(y), K) : y === 58 || y === 95 || He(y) ? (e.consume(y), S) : j(y) ? (o = O, Q(y)) : se(y) ? (e.consume(y), O) : K(y);
  }
  function S(y) {
    return y === 45 || y === 46 || y === 58 || y === 95 || De(y) ? (e.consume(y), S) : L(y);
  }
  function L(y) {
    return y === 61 ? (e.consume(y), B) : j(y) ? (o = L, Q(y)) : se(y) ? (e.consume(y), L) : O(y);
  }
  function B(y) {
    return y === null || y === 60 || y === 61 || y === 62 || y === 96 ? n(y) : y === 34 || y === 39 ? (e.consume(y), i = y, W) : j(y) ? (o = B, Q(y)) : se(y) ? (e.consume(y), B) : (e.consume(y), P);
  }
  function W(y) {
    return y === i ? (e.consume(y), i = void 0, D) : y === null ? n(y) : j(y) ? (o = W, Q(y)) : (e.consume(y), W);
  }
  function P(y) {
    return y === null || y === 34 || y === 39 || y === 60 || y === 61 || y === 96 ? n(y) : y === 47 || y === 62 || be(y) ? O(y) : (e.consume(y), P);
  }
  function D(y) {
    return y === 47 || y === 62 || be(y) ? O(y) : n(y);
  }
  function K(y) {
    return y === 62 ? (e.consume(y), e.exit("htmlTextData"), e.exit("htmlText"), t) : n(y);
  }
  function Q(y) {
    return e.exit("htmlTextData"), e.enter("lineEnding"), e.consume(y), e.exit("lineEnding"), $;
  }
  function $(y) {
    return se(y) ? ce(e, ne, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(y) : ne(y);
  }
  function ne(y) {
    return e.enter("htmlTextData"), o(y);
  }
}
const Gi = {
  name: "labelEnd",
  resolveAll: Lf,
  resolveTo: Pf,
  tokenize: Ff
}, If = {
  tokenize: Bf
}, Mf = {
  tokenize: zf
}, Df = {
  tokenize: Uf
};
function Lf(e) {
  let t = -1;
  const n = [];
  for (; ++t < e.length; ) {
    const r = e[t][1];
    if (n.push(e[t]), r.type === "labelImage" || r.type === "labelLink" || r.type === "labelEnd") {
      const i = r.type === "labelImage" ? 4 : 2;
      r.type = "data", t += i;
    }
  }
  return e.length !== n.length && je(e, 0, e.length, n), e;
}
function Pf(e, t) {
  let n = e.length, r = 0, i, a, o, s;
  for (; n--; )
    if (i = e[n][1], a) {
      if (i.type === "link" || i.type === "labelLink" && i._inactive)
        break;
      e[n][0] === "enter" && i.type === "labelLink" && (i._inactive = !0);
    } else if (o) {
      if (e[n][0] === "enter" && (i.type === "labelImage" || i.type === "labelLink") && !i._balanced && (a = n, i.type !== "labelLink")) {
        r = 2;
        break;
      }
    } else i.type === "labelEnd" && (o = n);
  const c = {
    type: e[a][1].type === "labelLink" ? "link" : "image",
    start: {
      ...e[a][1].start
    },
    end: {
      ...e[e.length - 1][1].end
    }
  }, l = {
    type: "label",
    start: {
      ...e[a][1].start
    },
    end: {
      ...e[o][1].end
    }
  }, u = {
    type: "labelText",
    start: {
      ...e[a + r + 2][1].end
    },
    end: {
      ...e[o - 2][1].start
    }
  };
  return s = [["enter", c, t], ["enter", l, t]], s = Je(s, e.slice(a + 1, a + r + 3)), s = Je(s, [["enter", u, t]]), s = Je(s, Er(t.parser.constructs.insideSpan.null, e.slice(a + r + 4, o - 3), t)), s = Je(s, [["exit", u, t], e[o - 2], e[o - 1], ["exit", l, t]]), s = Je(s, e.slice(o + 1)), s = Je(s, [["exit", c, t]]), je(e, a, e.length, s), e;
}
function Ff(e, t, n) {
  const r = this;
  let i = r.events.length, a, o;
  for (; i--; )
    if ((r.events[i][1].type === "labelImage" || r.events[i][1].type === "labelLink") && !r.events[i][1]._balanced) {
      a = r.events[i][1];
      break;
    }
  return s;
  function s(p) {
    return a ? a._inactive ? d(p) : (o = r.parser.defined.includes(it(r.sliceSerialize({
      start: a.end,
      end: r.now()
    }))), e.enter("labelEnd"), e.enter("labelMarker"), e.consume(p), e.exit("labelMarker"), e.exit("labelEnd"), c) : n(p);
  }
  function c(p) {
    return p === 40 ? e.attempt(If, u, o ? u : d)(p) : p === 91 ? e.attempt(Mf, u, o ? l : d)(p) : o ? u(p) : d(p);
  }
  function l(p) {
    return e.attempt(Df, u, d)(p);
  }
  function u(p) {
    return t(p);
  }
  function d(p) {
    return a._balanced = !0, n(p);
  }
}
function Bf(e, t, n) {
  return r;
  function r(d) {
    return e.enter("resource"), e.enter("resourceMarker"), e.consume(d), e.exit("resourceMarker"), i;
  }
  function i(d) {
    return be(d) ? xn(e, a)(d) : a(d);
  }
  function a(d) {
    return d === 41 ? u(d) : Ss(e, o, s, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(d);
  }
  function o(d) {
    return be(d) ? xn(e, c)(d) : u(d);
  }
  function s(d) {
    return n(d);
  }
  function c(d) {
    return d === 34 || d === 39 || d === 40 ? Cs(e, l, n, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(d) : u(d);
  }
  function l(d) {
    return be(d) ? xn(e, u)(d) : u(d);
  }
  function u(d) {
    return d === 41 ? (e.enter("resourceMarker"), e.consume(d), e.exit("resourceMarker"), e.exit("resource"), t) : n(d);
  }
}
function zf(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return Ns.call(r, e, a, o, "reference", "referenceMarker", "referenceString")(s);
  }
  function a(s) {
    return r.parser.defined.includes(it(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1))) ? t(s) : n(s);
  }
  function o(s) {
    return n(s);
  }
}
function Uf(e, t, n) {
  return r;
  function r(a) {
    return e.enter("reference"), e.enter("referenceMarker"), e.consume(a), e.exit("referenceMarker"), i;
  }
  function i(a) {
    return a === 93 ? (e.enter("referenceMarker"), e.consume(a), e.exit("referenceMarker"), e.exit("reference"), t) : n(a);
  }
}
const $f = {
  name: "labelStartImage",
  resolveAll: Gi.resolveAll,
  tokenize: Hf
};
function Hf(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return e.enter("labelImage"), e.enter("labelImageMarker"), e.consume(s), e.exit("labelImageMarker"), a;
  }
  function a(s) {
    return s === 91 ? (e.enter("labelMarker"), e.consume(s), e.exit("labelMarker"), e.exit("labelImage"), o) : n(s);
  }
  function o(s) {
    return s === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(s) : t(s);
  }
}
const Gf = {
  name: "labelStartLink",
  resolveAll: Gi.resolveAll,
  tokenize: Kf
};
function Kf(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return e.enter("labelLink"), e.enter("labelMarker"), e.consume(o), e.exit("labelMarker"), e.exit("labelLink"), a;
  }
  function a(o) {
    return o === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(o) : t(o);
  }
}
const Kr = {
  name: "lineEnding",
  tokenize: qf
};
function qf(e, t) {
  return n;
  function n(r) {
    return e.enter("lineEnding"), e.consume(r), e.exit("lineEnding"), ce(e, t, "linePrefix");
  }
}
const ir = {
  name: "thematicBreak",
  tokenize: Wf
};
function Wf(e, t, n) {
  let r = 0, i;
  return a;
  function a(l) {
    return e.enter("thematicBreak"), o(l);
  }
  function o(l) {
    return i = l, s(l);
  }
  function s(l) {
    return l === i ? (e.enter("thematicBreakSequence"), c(l)) : r >= 3 && (l === null || j(l)) ? (e.exit("thematicBreak"), t(l)) : n(l);
  }
  function c(l) {
    return l === i ? (e.consume(l), r++, c) : (e.exit("thematicBreakSequence"), se(l) ? ce(e, s, "whitespace")(l) : s(l));
  }
}
const Ke = {
  continuation: {
    tokenize: Xf
  },
  exit: Qf,
  name: "list",
  tokenize: Zf
}, Vf = {
  partial: !0,
  tokenize: Jf
}, Yf = {
  partial: !0,
  tokenize: jf
};
function Zf(e, t, n) {
  const r = this, i = r.events[r.events.length - 1];
  let a = i && i[1].type === "linePrefix" ? i[2].sliceSerialize(i[1], !0).length : 0, o = 0;
  return s;
  function s(f) {
    const h = r.containerState.type || (f === 42 || f === 43 || f === 45 ? "listUnordered" : "listOrdered");
    if (h === "listUnordered" ? !r.containerState.marker || f === r.containerState.marker : gi(f)) {
      if (r.containerState.type || (r.containerState.type = h, e.enter(h, {
        _container: !0
      })), h === "listUnordered")
        return e.enter("listItemPrefix"), f === 42 || f === 45 ? e.check(ir, n, l)(f) : l(f);
      if (!r.interrupt || f === 49)
        return e.enter("listItemPrefix"), e.enter("listItemValue"), c(f);
    }
    return n(f);
  }
  function c(f) {
    return gi(f) && ++o < 10 ? (e.consume(f), c) : (!r.interrupt || o < 2) && (r.containerState.marker ? f === r.containerState.marker : f === 41 || f === 46) ? (e.exit("listItemValue"), l(f)) : n(f);
  }
  function l(f) {
    return e.enter("listItemMarker"), e.consume(f), e.exit("listItemMarker"), r.containerState.marker = r.containerState.marker || f, e.check(
      On,
      // Can’t be empty when interrupting.
      r.interrupt ? n : u,
      e.attempt(Vf, p, d)
    );
  }
  function u(f) {
    return r.containerState.initialBlankLine = !0, a++, p(f);
  }
  function d(f) {
    return se(f) ? (e.enter("listItemPrefixWhitespace"), e.consume(f), e.exit("listItemPrefixWhitespace"), p) : n(f);
  }
  function p(f) {
    return r.containerState.size = a + r.sliceSerialize(e.exit("listItemPrefix"), !0).length, t(f);
  }
}
function Xf(e, t, n) {
  const r = this;
  return r.containerState._closeFlow = void 0, e.check(On, i, a);
  function i(s) {
    return r.containerState.furtherBlankLines = r.containerState.furtherBlankLines || r.containerState.initialBlankLine, ce(e, t, "listItemIndent", r.containerState.size + 1)(s);
  }
  function a(s) {
    return r.containerState.furtherBlankLines || !se(s) ? (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, o(s)) : (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, e.attempt(Yf, t, o)(s));
  }
  function o(s) {
    return r.containerState._closeFlow = !0, r.interrupt = void 0, ce(e, e.attempt(Ke, t, n), "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(s);
  }
}
function jf(e, t, n) {
  const r = this;
  return ce(e, i, "listItemIndent", r.containerState.size + 1);
  function i(a) {
    const o = r.events[r.events.length - 1];
    return o && o[1].type === "listItemIndent" && o[2].sliceSerialize(o[1], !0).length === r.containerState.size ? t(a) : n(a);
  }
}
function Qf(e) {
  e.exit(this.containerState.type);
}
function Jf(e, t, n) {
  const r = this;
  return ce(e, i, "listItemPrefixWhitespace", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
  function i(a) {
    const o = r.events[r.events.length - 1];
    return !se(a) && o && o[1].type === "listItemPrefixWhitespace" ? t(a) : n(a);
  }
}
const Vo = {
  name: "setextUnderline",
  resolveTo: ep,
  tokenize: tp
};
function ep(e, t) {
  let n = e.length, r, i, a;
  for (; n--; )
    if (e[n][0] === "enter") {
      if (e[n][1].type === "content") {
        r = n;
        break;
      }
      e[n][1].type === "paragraph" && (i = n);
    } else
      e[n][1].type === "content" && e.splice(n, 1), !a && e[n][1].type === "definition" && (a = n);
  const o = {
    type: "setextHeading",
    start: {
      ...e[r][1].start
    },
    end: {
      ...e[e.length - 1][1].end
    }
  };
  return e[i][1].type = "setextHeadingText", a ? (e.splice(i, 0, ["enter", o, t]), e.splice(a + 1, 0, ["exit", e[r][1], t]), e[r][1].end = {
    ...e[a][1].end
  }) : e[r][1] = o, e.push(["exit", o, t]), e;
}
function tp(e, t, n) {
  const r = this;
  let i;
  return a;
  function a(l) {
    let u = r.events.length, d;
    for (; u--; )
      if (r.events[u][1].type !== "lineEnding" && r.events[u][1].type !== "linePrefix" && r.events[u][1].type !== "content") {
        d = r.events[u][1].type === "paragraph";
        break;
      }
    return !r.parser.lazy[r.now().line] && (r.interrupt || d) ? (e.enter("setextHeadingLine"), i = l, o(l)) : n(l);
  }
  function o(l) {
    return e.enter("setextHeadingLineSequence"), s(l);
  }
  function s(l) {
    return l === i ? (e.consume(l), s) : (e.exit("setextHeadingLineSequence"), se(l) ? ce(e, c, "lineSuffix")(l) : c(l));
  }
  function c(l) {
    return l === null || j(l) ? (e.exit("setextHeadingLine"), t(l)) : n(l);
  }
}
const np = {
  tokenize: rp
};
function rp(e) {
  const t = this, n = e.attempt(
    // Try to parse a blank line.
    On,
    r,
    // Try to parse initial flow (essentially, only code).
    e.attempt(this.parser.constructs.flowInitial, i, ce(e, e.attempt(this.parser.constructs.flow, i, e.attempt(lf, i)), "linePrefix"))
  );
  return n;
  function r(a) {
    if (a === null) {
      e.consume(a);
      return;
    }
    return e.enter("lineEndingBlank"), e.consume(a), e.exit("lineEndingBlank"), t.currentConstruct = void 0, n;
  }
  function i(a) {
    if (a === null) {
      e.consume(a);
      return;
    }
    return e.enter("lineEnding"), e.consume(a), e.exit("lineEnding"), t.currentConstruct = void 0, n;
  }
}
const ip = {
  resolveAll: As()
}, op = Ts("string"), ap = Ts("text");
function Ts(e) {
  return {
    resolveAll: As(e === "text" ? sp : void 0),
    tokenize: t
  };
  function t(n) {
    const r = this, i = this.parser.constructs[e], a = n.attempt(i, o, s);
    return o;
    function o(u) {
      return l(u) ? a(u) : s(u);
    }
    function s(u) {
      if (u === null) {
        n.consume(u);
        return;
      }
      return n.enter("data"), n.consume(u), c;
    }
    function c(u) {
      return l(u) ? (n.exit("data"), a(u)) : (n.consume(u), c);
    }
    function l(u) {
      if (u === null)
        return !0;
      const d = i[u];
      let p = -1;
      if (d)
        for (; ++p < d.length; ) {
          const f = d[p];
          if (!f.previous || f.previous.call(r, r.previous))
            return !0;
        }
      return !1;
    }
  }
}
function As(e) {
  return t;
  function t(n, r) {
    let i = -1, a;
    for (; ++i <= n.length; )
      a === void 0 ? n[i] && n[i][1].type === "data" && (a = i, i++) : (!n[i] || n[i][1].type !== "data") && (i !== a + 2 && (n[a][1].end = n[i - 1][1].end, n.splice(a + 2, i - a - 2), i = a + 2), a = void 0);
    return e ? e(n, r) : n;
  }
}
function sp(e, t) {
  let n = 0;
  for (; ++n <= e.length; )
    if ((n === e.length || e[n][1].type === "lineEnding") && e[n - 1][1].type === "data") {
      const r = e[n - 1][1], i = t.sliceStream(r);
      let a = i.length, o = -1, s = 0, c;
      for (; a--; ) {
        const l = i[a];
        if (typeof l == "string") {
          for (o = l.length; l.charCodeAt(o - 1) === 32; )
            s++, o--;
          if (o) break;
          o = -1;
        } else if (l === -2)
          c = !0, s++;
        else if (l !== -1) {
          a++;
          break;
        }
      }
      if (t._contentTypeTextTrailing && n === e.length && (s = 0), s) {
        const l = {
          type: n === e.length || c || s < 2 ? "lineSuffix" : "hardBreakTrailing",
          start: {
            _bufferIndex: a ? o : r.start._bufferIndex + o,
            _index: r.start._index + a,
            line: r.end.line,
            column: r.end.column - s,
            offset: r.end.offset - s
          },
          end: {
            ...r.end
          }
        };
        r.end = {
          ...l.start
        }, r.start.offset === r.end.offset ? Object.assign(r, l) : (e.splice(n, 0, ["enter", l, t], ["exit", l, t]), n += 2);
      }
      n++;
    }
  return e;
}
const lp = {
  42: Ke,
  43: Ke,
  45: Ke,
  48: Ke,
  49: Ke,
  50: Ke,
  51: Ke,
  52: Ke,
  53: Ke,
  54: Ke,
  55: Ke,
  56: Ke,
  57: Ke,
  62: ws
}, cp = {
  91: pf
}, up = {
  [-2]: Gr,
  [-1]: Gr,
  32: Gr
}, dp = {
  35: Ef,
  42: ir,
  45: [Vo, ir],
  60: kf,
  61: Vo,
  95: ir,
  96: qo,
  126: qo
}, fp = {
  38: ks,
  92: xs
}, pp = {
  [-5]: Kr,
  [-4]: Kr,
  [-3]: Kr,
  33: $f,
  38: ks,
  42: mi,
  60: [Hd, Rf],
  91: Gf,
  92: [bf, xs],
  93: Gi,
  95: mi,
  96: tf
}, hp = {
  null: [mi, ip]
}, gp = {
  null: [42, 95]
}, mp = {
  null: []
}, bp = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attentionMarkers: gp,
  contentInitial: cp,
  disable: mp,
  document: lp,
  flow: dp,
  flowInitial: up,
  insideSpan: hp,
  string: fp,
  text: pp
}, Symbol.toStringTag, { value: "Module" }));
function yp(e, t, n) {
  let r = {
    _bufferIndex: -1,
    _index: 0,
    line: n && n.line || 1,
    column: n && n.column || 1,
    offset: n && n.offset || 0
  };
  const i = {}, a = [];
  let o = [], s = [];
  const c = {
    attempt: I(T),
    check: I(k),
    consume: x,
    enter: _,
    exit: C,
    interrupt: I(k, {
      interrupt: !0
    })
  }, l = {
    code: null,
    containerState: {},
    defineSkip: m,
    events: [],
    now: h,
    parser: e,
    previous: null,
    sliceSerialize: p,
    sliceStream: f,
    write: d
  };
  let u = t.tokenize.call(l, c);
  return t.resolveAll && a.push(t), l;
  function d(L) {
    return o = Je(o, L), b(), o[o.length - 1] !== null ? [] : (A(t, 0), l.events = Er(a, l.events, l), l.events);
  }
  function p(L, B) {
    return _p(f(L), B);
  }
  function f(L) {
    return Ep(o, L);
  }
  function h() {
    const {
      _bufferIndex: L,
      _index: B,
      line: W,
      column: P,
      offset: D
    } = r;
    return {
      _bufferIndex: L,
      _index: B,
      line: W,
      column: P,
      offset: D
    };
  }
  function m(L) {
    i[L.line] = L.column, S();
  }
  function b() {
    let L;
    for (; r._index < o.length; ) {
      const B = o[r._index];
      if (typeof B == "string")
        for (L = r._index, r._bufferIndex < 0 && (r._bufferIndex = 0); r._index === L && r._bufferIndex < B.length; )
          g(B.charCodeAt(r._bufferIndex));
      else
        g(B);
    }
  }
  function g(L) {
    u = u(L);
  }
  function x(L) {
    j(L) ? (r.line++, r.column = 1, r.offset += L === -3 ? 2 : 1, S()) : L !== -1 && (r.column++, r.offset++), r._bufferIndex < 0 ? r._index++ : (r._bufferIndex++, r._bufferIndex === // Points w/ non-negative `_bufferIndex` reference
    // strings.
    /** @type {string} */
    o[r._index].length && (r._bufferIndex = -1, r._index++)), l.previous = L;
  }
  function _(L, B) {
    const W = B || {};
    return W.type = L, W.start = h(), l.events.push(["enter", W, l]), s.push(W), W;
  }
  function C(L) {
    const B = s.pop();
    return B.end = h(), l.events.push(["exit", B, l]), B;
  }
  function T(L, B) {
    A(L, B.from);
  }
  function k(L, B) {
    B.restore();
  }
  function I(L, B) {
    return W;
    function W(P, D, K) {
      let Q, $, ne, y;
      return Array.isArray(P) ? (
        /* c8 ignore next 1 */
        fe(P)
      ) : "tokenize" in P ? (
        // Looks like a construct.
        fe([
          /** @type {Construct} */
          P
        ])
      ) : ue(P);
      function ue(_e) {
        return Fe;
        function Fe(Ie) {
          const et = Ie !== null && _e[Ie], Be = Ie !== null && _e.null, st = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(et) ? et : et ? [et] : [],
            ...Array.isArray(Be) ? Be : Be ? [Be] : []
          ];
          return fe(st)(Ie);
        }
      }
      function fe(_e) {
        return Q = _e, $ = 0, _e.length === 0 ? K : w(_e[$]);
      }
      function w(_e) {
        return Fe;
        function Fe(Ie) {
          return y = O(), ne = _e, _e.partial || (l.currentConstruct = _e), _e.name && l.parser.constructs.disable.null.includes(_e.name) ? Ge() : _e.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            B ? Object.assign(Object.create(l), B) : l,
            c,
            Re,
            Ge
          )(Ie);
        }
      }
      function Re(_e) {
        return L(ne, y), D;
      }
      function Ge(_e) {
        return y.restore(), ++$ < Q.length ? w(Q[$]) : K;
      }
    }
  }
  function A(L, B) {
    L.resolveAll && !a.includes(L) && a.push(L), L.resolve && je(l.events, B, l.events.length - B, L.resolve(l.events.slice(B), l)), L.resolveTo && (l.events = L.resolveTo(l.events, l));
  }
  function O() {
    const L = h(), B = l.previous, W = l.currentConstruct, P = l.events.length, D = Array.from(s);
    return {
      from: P,
      restore: K
    };
    function K() {
      r = L, l.previous = B, l.currentConstruct = W, l.events.length = P, s = D, S();
    }
  }
  function S() {
    r.line in i && r.column < 2 && (r.column = i[r.line], r.offset += i[r.line] - 1);
  }
}
function Ep(e, t) {
  const n = t.start._index, r = t.start._bufferIndex, i = t.end._index, a = t.end._bufferIndex;
  let o;
  if (n === i)
    o = [e[n].slice(r, a)];
  else {
    if (o = e.slice(n, i), r > -1) {
      const s = o[0];
      typeof s == "string" ? o[0] = s.slice(r) : o.shift();
    }
    a > 0 && o.push(e[i].slice(0, a));
  }
  return o;
}
function _p(e, t) {
  let n = -1;
  const r = [];
  let i;
  for (; ++n < e.length; ) {
    const a = e[n];
    let o;
    if (typeof a == "string")
      o = a;
    else switch (a) {
      case -5: {
        o = "\r";
        break;
      }
      case -4: {
        o = `
`;
        break;
      }
      case -3: {
        o = `\r
`;
        break;
      }
      case -2: {
        o = t ? " " : "	";
        break;
      }
      case -1: {
        if (!t && i) continue;
        o = " ";
        break;
      }
      default:
        o = String.fromCharCode(a);
    }
    i = a === -2, r.push(o);
  }
  return r.join("");
}
function wp(e) {
  const r = {
    constructs: (
      /** @type {FullNormalizedExtension} */
      Es([bp, ...(e || {}).extensions || []])
    ),
    content: i(Ld),
    defined: [],
    document: i(Fd),
    flow: i(np),
    lazy: {},
    string: i(op),
    text: i(ap)
  };
  return r;
  function i(a) {
    return o;
    function o(s) {
      return yp(r, a, s);
    }
  }
}
function xp(e) {
  for (; !vs(e); )
    ;
  return e;
}
const Yo = /[\0\t\n\r]/g;
function kp() {
  let e = 1, t = "", n = !0, r;
  return i;
  function i(a, o, s) {
    const c = [];
    let l, u, d, p, f;
    for (a = t + (typeof a == "string" ? a.toString() : new TextDecoder(o || void 0).decode(a)), d = 0, t = "", n && (a.charCodeAt(0) === 65279 && d++, n = void 0); d < a.length; ) {
      if (Yo.lastIndex = d, l = Yo.exec(a), p = l && l.index !== void 0 ? l.index : a.length, f = a.charCodeAt(p), !l) {
        t = a.slice(d);
        break;
      }
      if (f === 10 && d === p && r)
        c.push(-3), r = void 0;
      else
        switch (r && (c.push(-5), r = void 0), d < p && (c.push(a.slice(d, p)), e += p - d), f) {
          case 0: {
            c.push(65533), e++;
            break;
          }
          case 9: {
            for (u = Math.ceil(e / 4) * 4, c.push(-2); e++ < u; ) c.push(-1);
            break;
          }
          case 10: {
            c.push(-4), e = 1;
            break;
          }
          default:
            r = !0, e = 1;
        }
      d = p + 1;
    }
    return s && (r && c.push(-5), t && c.push(t), c.push(null)), c;
  }
}
const vp = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function Sp(e) {
  return e.replace(vp, Np);
}
function Np(e, t, n) {
  if (t)
    return t;
  if (n.charCodeAt(0) === 35) {
    const i = n.charCodeAt(1), a = i === 120 || i === 88;
    return _s(n.slice(a ? 2 : 1), a ? 16 : 10);
  }
  return Hi(n) || e;
}
const Rs = {}.hasOwnProperty;
function Cp(e, t, n) {
  return t && typeof t == "object" && (n = t, t = void 0), Tp(n)(xp(wp(n).document().write(kp()(e, t, !0))));
}
function Tp(e) {
  const t = {
    transforms: [],
    canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
    enter: {
      autolink: a(Yt),
      autolinkProtocol: O,
      autolinkEmail: O,
      atxHeading: a(Vt),
      blockQuote: a(Be),
      characterEscape: O,
      characterReference: O,
      codeFenced: a(st),
      codeFencedFenceInfo: o,
      codeFencedFenceMeta: o,
      codeIndented: a(st, o),
      codeText: a(Pt, o),
      codeTextData: O,
      data: O,
      codeFlowValue: O,
      definition: a(lt),
      definitionDestinationString: o,
      definitionLabelString: o,
      definitionTitleString: o,
      emphasis: a(pn),
      hardBreakEscape: a(de),
      hardBreakTrailing: a(de),
      htmlFlow: a(bt, o),
      htmlFlowData: O,
      htmlText: a(bt, o),
      htmlTextData: O,
      image: a(yt),
      label: o,
      link: a(Yt),
      listItem: a(Ir),
      listItemValue: p,
      listOrdered: a(hn, d),
      listUnordered: a(hn),
      paragraph: a(Mr),
      reference: w,
      referenceString: o,
      resourceDestinationString: o,
      resourceTitleString: o,
      setextHeading: a(Vt),
      strong: a(Un),
      thematicBreak: a($n)
    },
    exit: {
      atxHeading: c(),
      atxHeadingSequence: T,
      autolink: c(),
      autolinkEmail: et,
      autolinkProtocol: Ie,
      blockQuote: c(),
      characterEscapeValue: S,
      characterReferenceMarkerHexadecimal: Ge,
      characterReferenceMarkerNumeric: Ge,
      characterReferenceValue: _e,
      characterReference: Fe,
      codeFenced: c(b),
      codeFencedFence: m,
      codeFencedFenceInfo: f,
      codeFencedFenceMeta: h,
      codeFlowValue: S,
      codeIndented: c(g),
      codeText: c(D),
      codeTextData: S,
      data: S,
      definition: c(),
      definitionDestinationString: C,
      definitionLabelString: x,
      definitionTitleString: _,
      emphasis: c(),
      hardBreakEscape: c(B),
      hardBreakTrailing: c(B),
      htmlFlow: c(W),
      htmlFlowData: S,
      htmlText: c(P),
      htmlTextData: S,
      image: c(Q),
      label: ne,
      labelText: $,
      lineEnding: L,
      link: c(K),
      listItem: c(),
      listOrdered: c(),
      listUnordered: c(),
      paragraph: c(),
      referenceString: Re,
      resourceDestinationString: y,
      resourceTitleString: ue,
      resource: fe,
      setextHeading: c(A),
      setextHeadingLineSequence: I,
      setextHeadingText: k,
      strong: c(),
      thematicBreak: c()
    }
  };
  Os(t, (e || {}).mdastExtensions || []);
  const n = {};
  return r;
  function r(R) {
    let U = {
      type: "root",
      children: []
    };
    const J = {
      stack: [U],
      tokenStack: [],
      config: t,
      enter: s,
      exit: l,
      buffer: o,
      resume: u,
      data: n
    }, ae = [];
    let pe = -1;
    for (; ++pe < R.length; )
      if (R[pe][1].type === "listOrdered" || R[pe][1].type === "listUnordered")
        if (R[pe][0] === "enter")
          ae.push(pe);
        else {
          const We = ae.pop();
          pe = i(R, We, pe);
        }
    for (pe = -1; ++pe < R.length; ) {
      const We = t[R[pe][0]];
      Rs.call(We, R[pe][1].type) && We[R[pe][1].type].call(Object.assign({
        sliceSerialize: R[pe][2].sliceSerialize
      }, J), R[pe][1]);
    }
    if (J.tokenStack.length > 0) {
      const We = J.tokenStack[J.tokenStack.length - 1];
      (We[1] || Zo).call(J, void 0, We[0]);
    }
    for (U.position = {
      start: Ot(R.length > 0 ? R[0][1].start : {
        line: 1,
        column: 1,
        offset: 0
      }),
      end: Ot(R.length > 0 ? R[R.length - 2][1].end : {
        line: 1,
        column: 1,
        offset: 0
      })
    }, pe = -1; ++pe < t.transforms.length; )
      U = t.transforms[pe](U) || U;
    return U;
  }
  function i(R, U, J) {
    let ae = U - 1, pe = -1, We = !1, _t, tt, Ct, Ft;
    for (; ++ae <= J; ) {
      const ze = R[ae];
      switch (ze[1].type) {
        case "listUnordered":
        case "listOrdered":
        case "blockQuote": {
          ze[0] === "enter" ? pe++ : pe--, Ft = void 0;
          break;
        }
        case "lineEndingBlank": {
          ze[0] === "enter" && (_t && !Ft && !pe && !Ct && (Ct = ae), Ft = void 0);
          break;
        }
        case "linePrefix":
        case "listItemValue":
        case "listItemMarker":
        case "listItemPrefix":
        case "listItemPrefixWhitespace":
          break;
        default:
          Ft = void 0;
      }
      if (!pe && ze[0] === "enter" && ze[1].type === "listItemPrefix" || pe === -1 && ze[0] === "exit" && (ze[1].type === "listUnordered" || ze[1].type === "listOrdered")) {
        if (_t) {
          let Tt = ae;
          for (tt = void 0; Tt--; ) {
            const Ve = R[Tt];
            if (Ve[1].type === "lineEnding" || Ve[1].type === "lineEndingBlank") {
              if (Ve[0] === "exit") continue;
              tt && (R[tt][1].type = "lineEndingBlank", We = !0), Ve[1].type = "lineEnding", tt = Tt;
            } else if (!(Ve[1].type === "linePrefix" || Ve[1].type === "blockQuotePrefix" || Ve[1].type === "blockQuotePrefixWhitespace" || Ve[1].type === "blockQuoteMarker" || Ve[1].type === "listItemIndent")) break;
          }
          Ct && (!tt || Ct < tt) && (_t._spread = !0), _t.end = Object.assign({}, tt ? R[tt][1].start : ze[1].end), R.splice(tt || ae, 0, ["exit", _t, ze[2]]), ae++, J++;
        }
        if (ze[1].type === "listItemPrefix") {
          const Tt = {
            type: "listItem",
            _spread: !1,
            start: Object.assign({}, ze[1].start),
            // @ts-expect-error: we’ll add `end` in a second.
            end: void 0
          };
          _t = Tt, R.splice(ae, 0, ["enter", Tt, ze[2]]), ae++, J++, Ct = void 0, Ft = !0;
        }
      }
    }
    return R[U][1]._spread = We, J;
  }
  function a(R, U) {
    return J;
    function J(ae) {
      s.call(this, R(ae), ae), U && U.call(this, ae);
    }
  }
  function o() {
    this.stack.push({
      type: "fragment",
      children: []
    });
  }
  function s(R, U, J) {
    this.stack[this.stack.length - 1].children.push(R), this.stack.push(R), this.tokenStack.push([U, J || void 0]), R.position = {
      start: Ot(U.start),
      // @ts-expect-error: `end` will be patched later.
      end: void 0
    };
  }
  function c(R) {
    return U;
    function U(J) {
      R && R.call(this, J), l.call(this, J);
    }
  }
  function l(R, U) {
    const J = this.stack.pop(), ae = this.tokenStack.pop();
    if (ae)
      ae[0].type !== R.type && (U ? U.call(this, R, ae[0]) : (ae[1] || Zo).call(this, R, ae[0]));
    else throw new Error("Cannot close `" + R.type + "` (" + wn({
      start: R.start,
      end: R.end
    }) + "): it’s not open");
    J.position.end = Ot(R.end);
  }
  function u() {
    return $i(this.stack.pop());
  }
  function d() {
    this.data.expectingFirstListItemValue = !0;
  }
  function p(R) {
    if (this.data.expectingFirstListItemValue) {
      const U = this.stack[this.stack.length - 2];
      U.start = Number.parseInt(this.sliceSerialize(R), 10), this.data.expectingFirstListItemValue = void 0;
    }
  }
  function f() {
    const R = this.resume(), U = this.stack[this.stack.length - 1];
    U.lang = R;
  }
  function h() {
    const R = this.resume(), U = this.stack[this.stack.length - 1];
    U.meta = R;
  }
  function m() {
    this.data.flowCodeInside || (this.buffer(), this.data.flowCodeInside = !0);
  }
  function b() {
    const R = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = R.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, ""), this.data.flowCodeInside = void 0;
  }
  function g() {
    const R = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = R.replace(/(\r?\n|\r)$/g, "");
  }
  function x(R) {
    const U = this.resume(), J = this.stack[this.stack.length - 1];
    J.label = U, J.identifier = it(this.sliceSerialize(R)).toLowerCase();
  }
  function _() {
    const R = this.resume(), U = this.stack[this.stack.length - 1];
    U.title = R;
  }
  function C() {
    const R = this.resume(), U = this.stack[this.stack.length - 1];
    U.url = R;
  }
  function T(R) {
    const U = this.stack[this.stack.length - 1];
    if (!U.depth) {
      const J = this.sliceSerialize(R).length;
      U.depth = J;
    }
  }
  function k() {
    this.data.setextHeadingSlurpLineEnding = !0;
  }
  function I(R) {
    const U = this.stack[this.stack.length - 1];
    U.depth = this.sliceSerialize(R).codePointAt(0) === 61 ? 1 : 2;
  }
  function A() {
    this.data.setextHeadingSlurpLineEnding = void 0;
  }
  function O(R) {
    const J = this.stack[this.stack.length - 1].children;
    let ae = J[J.length - 1];
    (!ae || ae.type !== "text") && (ae = Et(), ae.position = {
      start: Ot(R.start),
      // @ts-expect-error: we’ll add `end` later.
      end: void 0
    }, J.push(ae)), this.stack.push(ae);
  }
  function S(R) {
    const U = this.stack.pop();
    U.value += this.sliceSerialize(R), U.position.end = Ot(R.end);
  }
  function L(R) {
    const U = this.stack[this.stack.length - 1];
    if (this.data.atHardBreak) {
      const J = U.children[U.children.length - 1];
      J.position.end = Ot(R.end), this.data.atHardBreak = void 0;
      return;
    }
    !this.data.setextHeadingSlurpLineEnding && t.canContainEols.includes(U.type) && (O.call(this, R), S.call(this, R));
  }
  function B() {
    this.data.atHardBreak = !0;
  }
  function W() {
    const R = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = R;
  }
  function P() {
    const R = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = R;
  }
  function D() {
    const R = this.resume(), U = this.stack[this.stack.length - 1];
    U.value = R;
  }
  function K() {
    const R = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const U = this.data.referenceType || "shortcut";
      R.type += "Reference", R.referenceType = U, delete R.url, delete R.title;
    } else
      delete R.identifier, delete R.label;
    this.data.referenceType = void 0;
  }
  function Q() {
    const R = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const U = this.data.referenceType || "shortcut";
      R.type += "Reference", R.referenceType = U, delete R.url, delete R.title;
    } else
      delete R.identifier, delete R.label;
    this.data.referenceType = void 0;
  }
  function $(R) {
    const U = this.sliceSerialize(R), J = this.stack[this.stack.length - 2];
    J.label = Sp(U), J.identifier = it(U).toLowerCase();
  }
  function ne() {
    const R = this.stack[this.stack.length - 1], U = this.resume(), J = this.stack[this.stack.length - 1];
    if (this.data.inReference = !0, J.type === "link") {
      const ae = R.children;
      J.children = ae;
    } else
      J.alt = U;
  }
  function y() {
    const R = this.resume(), U = this.stack[this.stack.length - 1];
    U.url = R;
  }
  function ue() {
    const R = this.resume(), U = this.stack[this.stack.length - 1];
    U.title = R;
  }
  function fe() {
    this.data.inReference = void 0;
  }
  function w() {
    this.data.referenceType = "collapsed";
  }
  function Re(R) {
    const U = this.resume(), J = this.stack[this.stack.length - 1];
    J.label = U, J.identifier = it(this.sliceSerialize(R)).toLowerCase(), this.data.referenceType = "full";
  }
  function Ge(R) {
    this.data.characterReferenceType = R.type;
  }
  function _e(R) {
    const U = this.sliceSerialize(R), J = this.data.characterReferenceType;
    let ae;
    J ? (ae = _s(U, J === "characterReferenceMarkerNumeric" ? 10 : 16), this.data.characterReferenceType = void 0) : ae = Hi(U);
    const pe = this.stack[this.stack.length - 1];
    pe.value += ae;
  }
  function Fe(R) {
    const U = this.stack.pop();
    U.position.end = Ot(R.end);
  }
  function Ie(R) {
    S.call(this, R);
    const U = this.stack[this.stack.length - 1];
    U.url = this.sliceSerialize(R);
  }
  function et(R) {
    S.call(this, R);
    const U = this.stack[this.stack.length - 1];
    U.url = "mailto:" + this.sliceSerialize(R);
  }
  function Be() {
    return {
      type: "blockquote",
      children: []
    };
  }
  function st() {
    return {
      type: "code",
      lang: null,
      meta: null,
      value: ""
    };
  }
  function Pt() {
    return {
      type: "inlineCode",
      value: ""
    };
  }
  function lt() {
    return {
      type: "definition",
      identifier: "",
      label: null,
      title: null,
      url: ""
    };
  }
  function pn() {
    return {
      type: "emphasis",
      children: []
    };
  }
  function Vt() {
    return {
      type: "heading",
      // @ts-expect-error `depth` will be set later.
      depth: 0,
      children: []
    };
  }
  function de() {
    return {
      type: "break"
    };
  }
  function bt() {
    return {
      type: "html",
      value: ""
    };
  }
  function yt() {
    return {
      type: "image",
      title: null,
      url: "",
      alt: null
    };
  }
  function Yt() {
    return {
      type: "link",
      title: null,
      url: "",
      children: []
    };
  }
  function hn(R) {
    return {
      type: "list",
      ordered: R.type === "listOrdered",
      start: null,
      spread: R._spread,
      children: []
    };
  }
  function Ir(R) {
    return {
      type: "listItem",
      spread: R._spread,
      checked: null,
      children: []
    };
  }
  function Mr() {
    return {
      type: "paragraph",
      children: []
    };
  }
  function Un() {
    return {
      type: "strong",
      children: []
    };
  }
  function Et() {
    return {
      type: "text",
      value: ""
    };
  }
  function $n() {
    return {
      type: "thematicBreak"
    };
  }
}
function Ot(e) {
  return {
    line: e.line,
    column: e.column,
    offset: e.offset
  };
}
function Os(e, t) {
  let n = -1;
  for (; ++n < t.length; ) {
    const r = t[n];
    Array.isArray(r) ? Os(e, r) : Ap(e, r);
  }
}
function Ap(e, t) {
  let n;
  for (n in t)
    if (Rs.call(t, n))
      switch (n) {
        case "canContainEols": {
          const r = t[n];
          r && e[n].push(...r);
          break;
        }
        case "transforms": {
          const r = t[n];
          r && e[n].push(...r);
          break;
        }
        case "enter":
        case "exit": {
          const r = t[n];
          r && Object.assign(e[n], r);
          break;
        }
      }
}
function Zo(e, t) {
  throw e ? new Error("Cannot close `" + e.type + "` (" + wn({
    start: e.start,
    end: e.end
  }) + "): a different token (`" + t.type + "`, " + wn({
    start: t.start,
    end: t.end
  }) + ") is open") : new Error("Cannot close document, a token (`" + t.type + "`, " + wn({
    start: t.start,
    end: t.end
  }) + ") is still open");
}
function Rp(e) {
  const t = this;
  t.parser = n;
  function n(r) {
    return Cp(r, {
      ...t.data("settings"),
      ...e,
      // Note: these options are not in the readme.
      // The goal is for them to be set by plugins on `data` instead of being
      // passed by users.
      extensions: t.data("micromarkExtensions") || [],
      mdastExtensions: t.data("fromMarkdownExtensions") || []
    });
  }
}
function Op(e, t) {
  const n = {
    type: "element",
    tagName: "blockquote",
    properties: {},
    children: e.wrap(e.all(t), !0)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Ip(e, t) {
  const n = { type: "element", tagName: "br", properties: {}, children: [] };
  return e.patch(t, n), [e.applyData(t, n), { type: "text", value: `
` }];
}
function Mp(e, t) {
  const n = t.value ? t.value + `
` : "", r = {}, i = t.lang ? t.lang.split(/\s+/) : [];
  i.length > 0 && (r.className = ["language-" + i[0]]);
  let a = {
    type: "element",
    tagName: "code",
    properties: r,
    children: [{ type: "text", value: n }]
  };
  return t.meta && (a.data = { meta: t.meta }), e.patch(t, a), a = e.applyData(t, a), a = { type: "element", tagName: "pre", properties: {}, children: [a] }, e.patch(t, a), a;
}
function Dp(e, t) {
  const n = {
    type: "element",
    tagName: "del",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Lp(e, t) {
  const n = {
    type: "element",
    tagName: "em",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Pp(e, t) {
  const n = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", r = String(t.identifier).toUpperCase(), i = un(r.toLowerCase()), a = e.footnoteOrder.indexOf(r);
  let o, s = e.footnoteCounts.get(r);
  s === void 0 ? (s = 0, e.footnoteOrder.push(r), o = e.footnoteOrder.length) : o = a + 1, s += 1, e.footnoteCounts.set(r, s);
  const c = {
    type: "element",
    tagName: "a",
    properties: {
      href: "#" + n + "fn-" + i,
      id: n + "fnref-" + i + (s > 1 ? "-" + s : ""),
      dataFootnoteRef: !0,
      ariaDescribedBy: ["footnote-label"]
    },
    children: [{ type: "text", value: String(o) }]
  };
  e.patch(t, c);
  const l = {
    type: "element",
    tagName: "sup",
    properties: {},
    children: [c]
  };
  return e.patch(t, l), e.applyData(t, l);
}
function Fp(e, t) {
  const n = {
    type: "element",
    tagName: "h" + t.depth,
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Bp(e, t) {
  if (e.options.allowDangerousHtml) {
    const n = { type: "raw", value: t.value };
    return e.patch(t, n), e.applyData(t, n);
  }
}
function Is(e, t) {
  const n = t.referenceType;
  let r = "]";
  if (n === "collapsed" ? r += "[]" : n === "full" && (r += "[" + (t.label || t.identifier) + "]"), t.type === "imageReference")
    return [{ type: "text", value: "![" + t.alt + r }];
  const i = e.all(t), a = i[0];
  a && a.type === "text" ? a.value = "[" + a.value : i.unshift({ type: "text", value: "[" });
  const o = i[i.length - 1];
  return o && o.type === "text" ? o.value += r : i.push({ type: "text", value: r }), i;
}
function zp(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return Is(e, t);
  const i = { src: un(r.url || ""), alt: t.alt };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const a = { type: "element", tagName: "img", properties: i, children: [] };
  return e.patch(t, a), e.applyData(t, a);
}
function Up(e, t) {
  const n = { src: un(t.url) };
  t.alt !== null && t.alt !== void 0 && (n.alt = t.alt), t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = { type: "element", tagName: "img", properties: n, children: [] };
  return e.patch(t, r), e.applyData(t, r);
}
function $p(e, t) {
  const n = { type: "text", value: t.value.replace(/\r?\n|\r/g, " ") };
  e.patch(t, n);
  const r = {
    type: "element",
    tagName: "code",
    properties: {},
    children: [n]
  };
  return e.patch(t, r), e.applyData(t, r);
}
function Hp(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return Is(e, t);
  const i = { href: un(r.url || "") };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const a = {
    type: "element",
    tagName: "a",
    properties: i,
    children: e.all(t)
  };
  return e.patch(t, a), e.applyData(t, a);
}
function Gp(e, t) {
  const n = { href: un(t.url) };
  t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = {
    type: "element",
    tagName: "a",
    properties: n,
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function Kp(e, t, n) {
  const r = e.all(t), i = n ? qp(n) : Ms(t), a = {}, o = [];
  if (typeof t.checked == "boolean") {
    const u = r[0];
    let d;
    u && u.type === "element" && u.tagName === "p" ? d = u : (d = { type: "element", tagName: "p", properties: {}, children: [] }, r.unshift(d)), d.children.length > 0 && d.children.unshift({ type: "text", value: " " }), d.children.unshift({
      type: "element",
      tagName: "input",
      properties: { type: "checkbox", checked: t.checked, disabled: !0 },
      children: []
    }), a.className = ["task-list-item"];
  }
  let s = -1;
  for (; ++s < r.length; ) {
    const u = r[s];
    (i || s !== 0 || u.type !== "element" || u.tagName !== "p") && o.push({ type: "text", value: `
` }), u.type === "element" && u.tagName === "p" && !i ? o.push(...u.children) : o.push(u);
  }
  const c = r[r.length - 1];
  c && (i || c.type !== "element" || c.tagName !== "p") && o.push({ type: "text", value: `
` });
  const l = { type: "element", tagName: "li", properties: a, children: o };
  return e.patch(t, l), e.applyData(t, l);
}
function qp(e) {
  let t = !1;
  if (e.type === "list") {
    t = e.spread || !1;
    const n = e.children;
    let r = -1;
    for (; !t && ++r < n.length; )
      t = Ms(n[r]);
  }
  return t;
}
function Ms(e) {
  const t = e.spread;
  return t ?? e.children.length > 1;
}
function Wp(e, t) {
  const n = {}, r = e.all(t);
  let i = -1;
  for (typeof t.start == "number" && t.start !== 1 && (n.start = t.start); ++i < r.length; ) {
    const o = r[i];
    if (o.type === "element" && o.tagName === "li" && o.properties && Array.isArray(o.properties.className) && o.properties.className.includes("task-list-item")) {
      n.className = ["contains-task-list"];
      break;
    }
  }
  const a = {
    type: "element",
    tagName: t.ordered ? "ol" : "ul",
    properties: n,
    children: e.wrap(r, !0)
  };
  return e.patch(t, a), e.applyData(t, a);
}
function Vp(e, t) {
  const n = {
    type: "element",
    tagName: "p",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Yp(e, t) {
  const n = { type: "root", children: e.wrap(e.all(t)) };
  return e.patch(t, n), e.applyData(t, n);
}
function Zp(e, t) {
  const n = {
    type: "element",
    tagName: "strong",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Xp(e, t) {
  const n = e.all(t), r = n.shift(), i = [];
  if (r) {
    const o = {
      type: "element",
      tagName: "thead",
      properties: {},
      children: e.wrap([r], !0)
    };
    e.patch(t.children[0], o), i.push(o);
  }
  if (n.length > 0) {
    const o = {
      type: "element",
      tagName: "tbody",
      properties: {},
      children: e.wrap(n, !0)
    }, s = Fi(t.children[1]), c = fs(t.children[t.children.length - 1]);
    s && c && (o.position = { start: s, end: c }), i.push(o);
  }
  const a = {
    type: "element",
    tagName: "table",
    properties: {},
    children: e.wrap(i, !0)
  };
  return e.patch(t, a), e.applyData(t, a);
}
function jp(e, t, n) {
  const r = n ? n.children : void 0, a = (r ? r.indexOf(t) : 1) === 0 ? "th" : "td", o = n && n.type === "table" ? n.align : void 0, s = o ? o.length : t.children.length;
  let c = -1;
  const l = [];
  for (; ++c < s; ) {
    const d = t.children[c], p = {}, f = o ? o[c] : void 0;
    f && (p.align = f);
    let h = { type: "element", tagName: a, properties: p, children: [] };
    d && (h.children = e.all(d), e.patch(d, h), h = e.applyData(d, h)), l.push(h);
  }
  const u = {
    type: "element",
    tagName: "tr",
    properties: {},
    children: e.wrap(l, !0)
  };
  return e.patch(t, u), e.applyData(t, u);
}
function Qp(e, t) {
  const n = {
    type: "element",
    tagName: "td",
    // Assume body cell.
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
const Xo = 9, jo = 32;
function Jp(e) {
  const t = String(e), n = /\r?\n|\r/g;
  let r = n.exec(t), i = 0;
  const a = [];
  for (; r; )
    a.push(
      Qo(t.slice(i, r.index), i > 0, !0),
      r[0]
    ), i = r.index + r[0].length, r = n.exec(t);
  return a.push(Qo(t.slice(i), i > 0, !1)), a.join("");
}
function Qo(e, t, n) {
  let r = 0, i = e.length;
  if (t) {
    let a = e.codePointAt(r);
    for (; a === Xo || a === jo; )
      r++, a = e.codePointAt(r);
  }
  if (n) {
    let a = e.codePointAt(i - 1);
    for (; a === Xo || a === jo; )
      i--, a = e.codePointAt(i - 1);
  }
  return i > r ? e.slice(r, i) : "";
}
function eh(e, t) {
  const n = { type: "text", value: Jp(String(t.value)) };
  return e.patch(t, n), e.applyData(t, n);
}
function th(e, t) {
  const n = {
    type: "element",
    tagName: "hr",
    properties: {},
    children: []
  };
  return e.patch(t, n), e.applyData(t, n);
}
const nh = {
  blockquote: Op,
  break: Ip,
  code: Mp,
  delete: Dp,
  emphasis: Lp,
  footnoteReference: Pp,
  heading: Fp,
  html: Bp,
  imageReference: zp,
  image: Up,
  inlineCode: $p,
  linkReference: Hp,
  link: Gp,
  listItem: Kp,
  list: Wp,
  paragraph: Vp,
  // @ts-expect-error: root is different, but hard to type.
  root: Yp,
  strong: Zp,
  table: Xp,
  tableCell: Qp,
  tableRow: jp,
  text: eh,
  thematicBreak: th,
  toml: Vn,
  yaml: Vn,
  definition: Vn,
  footnoteDefinition: Vn
};
function Vn() {
}
const Ds = -1, _r = 0, kn = 1, lr = 2, Ki = 3, qi = 4, Wi = 5, Vi = 6, Ls = 7, Ps = 8, rh = typeof self == "object" ? self : globalThis, Jo = (e, t) => {
  switch (e) {
    case "Function":
    case "SharedWorker":
    case "Worker":
    case "eval":
    case "setInterval":
    case "setTimeout":
      throw new TypeError("unable to deserialize " + e);
  }
  return new rh[e](t);
}, ih = (e, t) => {
  const n = (i, a) => (e.set(a, i), i), r = (i) => {
    if (e.has(i))
      return e.get(i);
    const [a, o] = t[i];
    switch (a) {
      case _r:
      case Ds:
        return n(o, i);
      case kn: {
        const s = n([], i);
        for (const c of o)
          s.push(r(c));
        return s;
      }
      case lr: {
        const s = n({}, i);
        for (const [c, l] of o)
          s[r(c)] = r(l);
        return s;
      }
      case Ki:
        return n(new Date(o), i);
      case qi: {
        const { source: s, flags: c } = o;
        return n(new RegExp(s, c), i);
      }
      case Wi: {
        const s = n(/* @__PURE__ */ new Map(), i);
        for (const [c, l] of o)
          s.set(r(c), r(l));
        return s;
      }
      case Vi: {
        const s = n(/* @__PURE__ */ new Set(), i);
        for (const c of o)
          s.add(r(c));
        return s;
      }
      case Ls: {
        const { name: s, message: c } = o;
        return n(Jo(s, c), i);
      }
      case Ps:
        return n(BigInt(o), i);
      case "BigInt":
        return n(Object(BigInt(o)), i);
      case "ArrayBuffer":
        return n(new Uint8Array(o).buffer, o);
      case "DataView": {
        const { buffer: s } = new Uint8Array(o);
        return n(new DataView(s), o);
      }
    }
    return n(Jo(a, o), i);
  };
  return r;
}, ea = (e) => ih(/* @__PURE__ */ new Map(), e)(0), jt = "", { toString: oh } = {}, { keys: ah } = Object, En = (e) => {
  const t = typeof e;
  if (t !== "object" || !e)
    return [_r, t];
  const n = oh.call(e).slice(8, -1);
  switch (n) {
    case "Array":
      return [kn, jt];
    case "Object":
      return [lr, jt];
    case "Date":
      return [Ki, jt];
    case "RegExp":
      return [qi, jt];
    case "Map":
      return [Wi, jt];
    case "Set":
      return [Vi, jt];
    case "DataView":
      return [kn, n];
  }
  return n.includes("Array") ? [kn, n] : n.includes("Error") ? [Ls, n] : [lr, n];
}, Yn = ([e, t]) => e === _r && (t === "function" || t === "symbol"), sh = (e, t, n, r) => {
  const i = (o, s) => {
    const c = r.push(o) - 1;
    return n.set(s, c), c;
  }, a = (o) => {
    if (n.has(o))
      return n.get(o);
    let [s, c] = En(o);
    switch (s) {
      case _r: {
        let u = o;
        switch (c) {
          case "bigint":
            s = Ps, u = o.toString();
            break;
          case "function":
          case "symbol":
            if (e)
              throw new TypeError("unable to serialize " + c);
            u = null;
            break;
          case "undefined":
            return i([Ds], o);
        }
        return i([s, u], o);
      }
      case kn: {
        if (c) {
          let p = o;
          return c === "DataView" ? p = new Uint8Array(o.buffer) : c === "ArrayBuffer" && (p = new Uint8Array(o)), i([c, [...p]], o);
        }
        const u = [], d = i([s, u], o);
        for (const p of o)
          u.push(a(p));
        return d;
      }
      case lr: {
        if (c)
          switch (c) {
            case "BigInt":
              return i([c, o.toString()], o);
            case "Boolean":
            case "Number":
            case "String":
              return i([c, o.valueOf()], o);
          }
        if (t && "toJSON" in o)
          return a(o.toJSON());
        const u = [], d = i([s, u], o);
        for (const p of ah(o))
          (e || !Yn(En(o[p]))) && u.push([a(p), a(o[p])]);
        return d;
      }
      case Ki:
        return i([s, o.toISOString()], o);
      case qi: {
        const { source: u, flags: d } = o;
        return i([s, { source: u, flags: d }], o);
      }
      case Wi: {
        const u = [], d = i([s, u], o);
        for (const [p, f] of o)
          (e || !(Yn(En(p)) || Yn(En(f)))) && u.push([a(p), a(f)]);
        return d;
      }
      case Vi: {
        const u = [], d = i([s, u], o);
        for (const p of o)
          (e || !Yn(En(p))) && u.push(a(p));
        return d;
      }
    }
    const { message: l } = o;
    return i([s, { name: c, message: l }], o);
  };
  return a;
}, ta = (e, { json: t, lossy: n } = {}) => {
  const r = [];
  return sh(!(t || n), !!t, /* @__PURE__ */ new Map(), r)(e), r;
}, cr = typeof structuredClone == "function" ? (
  /* c8 ignore start */
  (e, t) => t && ("json" in t || "lossy" in t) ? ea(ta(e, t)) : structuredClone(e)
) : (e, t) => ea(ta(e, t));
function lh(e, t) {
  const n = [{ type: "text", value: "↩" }];
  return t > 1 && n.push({
    type: "element",
    tagName: "sup",
    properties: {},
    children: [{ type: "text", value: String(t) }]
  }), n;
}
function ch(e, t) {
  return "Back to reference " + (e + 1) + (t > 1 ? "-" + t : "");
}
function uh(e) {
  const t = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", n = e.options.footnoteBackContent || lh, r = e.options.footnoteBackLabel || ch, i = e.options.footnoteLabel || "Footnotes", a = e.options.footnoteLabelTagName || "h2", o = e.options.footnoteLabelProperties || {
    className: ["sr-only"]
  }, s = [];
  let c = -1;
  for (; ++c < e.footnoteOrder.length; ) {
    const l = e.footnoteById.get(
      e.footnoteOrder[c]
    );
    if (!l)
      continue;
    const u = e.all(l), d = String(l.identifier).toUpperCase(), p = un(d.toLowerCase());
    let f = 0;
    const h = [], m = e.footnoteCounts.get(d);
    for (; m !== void 0 && ++f <= m; ) {
      h.length > 0 && h.push({ type: "text", value: " " });
      let x = typeof n == "string" ? n : n(c, f);
      typeof x == "string" && (x = { type: "text", value: x }), h.push({
        type: "element",
        tagName: "a",
        properties: {
          href: "#" + t + "fnref-" + p + (f > 1 ? "-" + f : ""),
          dataFootnoteBackref: "",
          ariaLabel: typeof r == "string" ? r : r(c, f),
          className: ["data-footnote-backref"]
        },
        children: Array.isArray(x) ? x : [x]
      });
    }
    const b = u[u.length - 1];
    if (b && b.type === "element" && b.tagName === "p") {
      const x = b.children[b.children.length - 1];
      x && x.type === "text" ? x.value += " " : b.children.push({ type: "text", value: " " }), b.children.push(...h);
    } else
      u.push(...h);
    const g = {
      type: "element",
      tagName: "li",
      properties: { id: t + "fn-" + p },
      children: e.wrap(u, !0)
    };
    e.patch(l, g), s.push(g);
  }
  if (s.length !== 0)
    return {
      type: "element",
      tagName: "section",
      properties: { dataFootnotes: !0, className: ["footnotes"] },
      children: [
        {
          type: "element",
          tagName: a,
          properties: {
            ...cr(o),
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
const In = (
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
      return hh;
    if (typeof e == "function")
      return wr(e);
    if (typeof e == "object")
      return Array.isArray(e) ? dh(e) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        fh(
          /** @type {Props} */
          e
        )
      );
    if (typeof e == "string")
      return ph(e);
    throw new Error("Expected function, string, or object as test");
  })
);
function dh(e) {
  const t = [];
  let n = -1;
  for (; ++n < e.length; )
    t[n] = In(e[n]);
  return wr(r);
  function r(...i) {
    let a = -1;
    for (; ++a < t.length; )
      if (t[a].apply(this, i)) return !0;
    return !1;
  }
}
function fh(e) {
  const t = (
    /** @type {Record<string, unknown>} */
    e
  );
  return wr(n);
  function n(r) {
    const i = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      r
    );
    let a;
    for (a in e)
      if (i[a] !== t[a]) return !1;
    return !0;
  }
}
function ph(e) {
  return wr(t);
  function t(n) {
    return n && n.type === e;
  }
}
function wr(e) {
  return t;
  function t(n, r, i) {
    return !!(gh(n) && e.call(
      this,
      n,
      typeof r == "number" ? r : void 0,
      i || void 0
    ));
  }
}
function hh() {
  return !0;
}
function gh(e) {
  return e !== null && typeof e == "object" && "type" in e;
}
const Fs = [], mh = !0, bi = !1, bh = "skip";
function Bs(e, t, n, r) {
  let i;
  typeof t == "function" && typeof n != "function" ? (r = n, n = t) : i = t;
  const a = In(i), o = r ? -1 : 1;
  s(e, void 0, [])();
  function s(c, l, u) {
    const d = (
      /** @type {Record<string, unknown>} */
      c && typeof c == "object" ? c : {}
    );
    if (typeof d.type == "string") {
      const f = (
        // `hast`
        typeof d.tagName == "string" ? d.tagName : (
          // `xast`
          typeof d.name == "string" ? d.name : void 0
        )
      );
      Object.defineProperty(p, "name", {
        value: "node (" + (c.type + (f ? "<" + f + ">" : "")) + ")"
      });
    }
    return p;
    function p() {
      let f = Fs, h, m, b;
      if ((!t || a(c, l, u[u.length - 1] || void 0)) && (f = yh(n(c, u)), f[0] === bi))
        return f;
      if ("children" in c && c.children) {
        const g = (
          /** @type {UnistParent} */
          c
        );
        if (g.children && f[0] !== bh)
          for (m = (r ? g.children.length : -1) + o, b = u.concat(g); m > -1 && m < g.children.length; ) {
            const x = g.children[m];
            if (h = s(x, m, b)(), h[0] === bi)
              return h;
            m = typeof h[1] == "number" ? h[1] : m + o;
          }
      }
      return f;
    }
  }
}
function yh(e) {
  return Array.isArray(e) ? e : typeof e == "number" ? [mh, e] : e == null ? Fs : [e];
}
function xr(e, t, n, r) {
  let i, a, o;
  typeof t == "function" && typeof n != "function" ? (a = void 0, o = t, i = n) : (a = t, o = n, i = r), Bs(e, a, s, i);
  function s(c, l) {
    const u = l[l.length - 1], d = u ? u.children.indexOf(c) : void 0;
    return o(c, d, u);
  }
}
const yi = {}.hasOwnProperty, Eh = {};
function _h(e, t) {
  const n = t || Eh, r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), o = { ...nh, ...n.handlers }, s = {
    all: l,
    applyData: xh,
    definitionById: r,
    footnoteById: i,
    footnoteCounts: a,
    footnoteOrder: [],
    handlers: o,
    one: c,
    options: n,
    patch: wh,
    wrap: vh
  };
  return xr(e, function(u) {
    if (u.type === "definition" || u.type === "footnoteDefinition") {
      const d = u.type === "definition" ? r : i, p = String(u.identifier).toUpperCase();
      d.has(p) || d.set(p, u);
    }
  }), s;
  function c(u, d) {
    const p = u.type, f = s.handlers[p];
    if (yi.call(s.handlers, p) && f)
      return f(s, u, d);
    if (s.options.passThrough && s.options.passThrough.includes(p)) {
      if ("children" in u) {
        const { children: m, ...b } = u, g = cr(b);
        return g.children = s.all(u), g;
      }
      return cr(u);
    }
    return (s.options.unknownHandler || kh)(s, u, d);
  }
  function l(u) {
    const d = [];
    if ("children" in u) {
      const p = u.children;
      let f = -1;
      for (; ++f < p.length; ) {
        const h = s.one(p[f], u);
        if (h) {
          if (f && p[f - 1].type === "break" && (!Array.isArray(h) && h.type === "text" && (h.value = na(h.value)), !Array.isArray(h) && h.type === "element")) {
            const m = h.children[0];
            m && m.type === "text" && (m.value = na(m.value));
          }
          Array.isArray(h) ? d.push(...h) : d.push(h);
        }
      }
    }
    return d;
  }
}
function wh(e, t) {
  e.position && (t.position = sd(e));
}
function xh(e, t) {
  let n = t;
  if (e && e.data) {
    const r = e.data.hName, i = e.data.hChildren, a = e.data.hProperties;
    if (typeof r == "string")
      if (n.type === "element")
        n.tagName = r;
      else {
        const o = "children" in n ? n.children : [n];
        n = { type: "element", tagName: r, properties: {}, children: o };
      }
    n.type === "element" && a && Object.assign(n.properties, cr(a)), "children" in n && n.children && i !== null && i !== void 0 && (n.children = i);
  }
  return n;
}
function kh(e, t) {
  const n = t.data || {}, r = "value" in t && !(yi.call(n, "hProperties") || yi.call(n, "hChildren")) ? { type: "text", value: t.value } : {
    type: "element",
    tagName: "div",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function vh(e, t) {
  const n = [];
  let r = -1;
  for (t && n.push({ type: "text", value: `
` }); ++r < e.length; )
    r && n.push({ type: "text", value: `
` }), n.push(e[r]);
  return t && e.length > 0 && n.push({ type: "text", value: `
` }), n;
}
function na(e) {
  let t = 0, n = e.charCodeAt(t);
  for (; n === 9 || n === 32; )
    t++, n = e.charCodeAt(t);
  return e.slice(t);
}
function ra(e, t) {
  const n = _h(e, t), r = n.one(e, void 0), i = uh(n), a = Array.isArray(r) ? { type: "root", children: r } : r || { type: "root", children: [] };
  return i && a.children.push({ type: "text", value: `
` }, i), a;
}
function Sh(e, t) {
  return e && "run" in e ? async function(n, r) {
    const i = (
      /** @type {HastRoot} */
      ra(n, { file: r, ...t })
    );
    await e.run(i, r);
  } : function(n, r) {
    return (
      /** @type {HastRoot} */
      ra(n, { file: r, ...e || t })
    );
  };
}
function ia(e) {
  if (e)
    throw e;
}
var qr, oa;
function Nh() {
  if (oa) return qr;
  oa = 1;
  var e = Object.prototype.hasOwnProperty, t = Object.prototype.toString, n = Object.defineProperty, r = Object.getOwnPropertyDescriptor, i = function(l) {
    return typeof Array.isArray == "function" ? Array.isArray(l) : t.call(l) === "[object Array]";
  }, a = function(l) {
    if (!l || t.call(l) !== "[object Object]")
      return !1;
    var u = e.call(l, "constructor"), d = l.constructor && l.constructor.prototype && e.call(l.constructor.prototype, "isPrototypeOf");
    if (l.constructor && !u && !d)
      return !1;
    var p;
    for (p in l)
      ;
    return typeof p > "u" || e.call(l, p);
  }, o = function(l, u) {
    n && u.name === "__proto__" ? n(l, u.name, {
      enumerable: !0,
      configurable: !0,
      value: u.newValue,
      writable: !0
    }) : l[u.name] = u.newValue;
  }, s = function(l, u) {
    if (u === "__proto__")
      if (e.call(l, u)) {
        if (r)
          return r(l, u).value;
      } else return;
    return l[u];
  };
  return qr = function c() {
    var l, u, d, p, f, h, m = arguments[0], b = 1, g = arguments.length, x = !1;
    for (typeof m == "boolean" && (x = m, m = arguments[1] || {}, b = 2), (m == null || typeof m != "object" && typeof m != "function") && (m = {}); b < g; ++b)
      if (l = arguments[b], l != null)
        for (u in l)
          d = s(m, u), p = s(l, u), m !== p && (x && p && (a(p) || (f = i(p))) ? (f ? (f = !1, h = d && i(d) ? d : []) : h = d && a(d) ? d : {}, o(m, { name: u, newValue: c(x, h, p) })) : typeof p < "u" && o(m, { name: u, newValue: p }));
    return m;
  }, qr;
}
var Ch = Nh();
const Wr = /* @__PURE__ */ Pi(Ch);
function Ei(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function Th() {
  const e = [], t = { run: n, use: r };
  return t;
  function n(...i) {
    let a = -1;
    const o = i.pop();
    if (typeof o != "function")
      throw new TypeError("Expected function as last argument, not " + o);
    s(null, ...i);
    function s(c, ...l) {
      const u = e[++a];
      let d = -1;
      if (c) {
        o(c);
        return;
      }
      for (; ++d < i.length; )
        (l[d] === null || l[d] === void 0) && (l[d] = i[d]);
      i = l, u ? Ah(u, s)(...l) : o(null, ...l);
    }
  }
  function r(i) {
    if (typeof i != "function")
      throw new TypeError(
        "Expected `middelware` to be a function, not " + i
      );
    return e.push(i), t;
  }
}
function Ah(e, t) {
  let n;
  return r;
  function r(...o) {
    const s = e.length > o.length;
    let c;
    s && o.push(i);
    try {
      c = e.apply(this, o);
    } catch (l) {
      const u = (
        /** @type {Error} */
        l
      );
      if (s && n)
        throw u;
      return i(u);
    }
    s || (c && c.then && typeof c.then == "function" ? c.then(a, i) : c instanceof Error ? i(c) : a(c));
  }
  function i(o, ...s) {
    n || (n = !0, t(o, ...s));
  }
  function a(o) {
    i(null, o);
  }
}
const ft = { basename: Rh, dirname: Oh, extname: Ih, join: Mh, sep: "/" };
function Rh(e, t) {
  if (t !== void 0 && typeof t != "string")
    throw new TypeError('"ext" argument must be a string');
  Mn(e);
  let n = 0, r = -1, i = e.length, a;
  if (t === void 0 || t.length === 0 || t.length > e.length) {
    for (; i--; )
      if (e.codePointAt(i) === 47) {
        if (a) {
          n = i + 1;
          break;
        }
      } else r < 0 && (a = !0, r = i + 1);
    return r < 0 ? "" : e.slice(n, r);
  }
  if (t === e)
    return "";
  let o = -1, s = t.length - 1;
  for (; i--; )
    if (e.codePointAt(i) === 47) {
      if (a) {
        n = i + 1;
        break;
      }
    } else
      o < 0 && (a = !0, o = i + 1), s > -1 && (e.codePointAt(i) === t.codePointAt(s--) ? s < 0 && (r = i) : (s = -1, r = o));
  return n === r ? r = o : r < 0 && (r = e.length), e.slice(n, r);
}
function Oh(e) {
  if (Mn(e), e.length === 0)
    return ".";
  let t = -1, n = e.length, r;
  for (; --n; )
    if (e.codePointAt(n) === 47) {
      if (r) {
        t = n;
        break;
      }
    } else r || (r = !0);
  return t < 0 ? e.codePointAt(0) === 47 ? "/" : "." : t === 1 && e.codePointAt(0) === 47 ? "//" : e.slice(0, t);
}
function Ih(e) {
  Mn(e);
  let t = e.length, n = -1, r = 0, i = -1, a = 0, o;
  for (; t--; ) {
    const s = e.codePointAt(t);
    if (s === 47) {
      if (o) {
        r = t + 1;
        break;
      }
      continue;
    }
    n < 0 && (o = !0, n = t + 1), s === 46 ? i < 0 ? i = t : a !== 1 && (a = 1) : i > -1 && (a = -1);
  }
  return i < 0 || n < 0 || // We saw a non-dot character immediately before the dot.
  a === 0 || // The (right-most) trimmed path component is exactly `..`.
  a === 1 && i === n - 1 && i === r + 1 ? "" : e.slice(i, n);
}
function Mh(...e) {
  let t = -1, n;
  for (; ++t < e.length; )
    Mn(e[t]), e[t] && (n = n === void 0 ? e[t] : n + "/" + e[t]);
  return n === void 0 ? "." : Dh(n);
}
function Dh(e) {
  Mn(e);
  const t = e.codePointAt(0) === 47;
  let n = Lh(e, !t);
  return n.length === 0 && !t && (n = "."), n.length > 0 && e.codePointAt(e.length - 1) === 47 && (n += "/"), t ? "/" + n : n;
}
function Lh(e, t) {
  let n = "", r = 0, i = -1, a = 0, o = -1, s, c;
  for (; ++o <= e.length; ) {
    if (o < e.length)
      s = e.codePointAt(o);
    else {
      if (s === 47)
        break;
      s = 47;
    }
    if (s === 47) {
      if (!(i === o - 1 || a === 1)) if (i !== o - 1 && a === 2) {
        if (n.length < 2 || r !== 2 || n.codePointAt(n.length - 1) !== 46 || n.codePointAt(n.length - 2) !== 46) {
          if (n.length > 2) {
            if (c = n.lastIndexOf("/"), c !== n.length - 1) {
              c < 0 ? (n = "", r = 0) : (n = n.slice(0, c), r = n.length - 1 - n.lastIndexOf("/")), i = o, a = 0;
              continue;
            }
          } else if (n.length > 0) {
            n = "", r = 0, i = o, a = 0;
            continue;
          }
        }
        t && (n = n.length > 0 ? n + "/.." : "..", r = 2);
      } else
        n.length > 0 ? n += "/" + e.slice(i + 1, o) : n = e.slice(i + 1, o), r = o - i - 1;
      i = o, a = 0;
    } else s === 46 && a > -1 ? a++ : a = -1;
  }
  return n;
}
function Mn(e) {
  if (typeof e != "string")
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(e)
    );
}
const Ph = { cwd: Fh };
function Fh() {
  return "/";
}
function _i(e) {
  return !!(e !== null && typeof e == "object" && "href" in e && e.href && "protocol" in e && e.protocol && // @ts-expect-error: indexing is fine.
  e.auth === void 0);
}
function Bh(e) {
  if (typeof e == "string")
    e = new URL(e);
  else if (!_i(e)) {
    const t = new TypeError(
      'The "path" argument must be of type string or an instance of URL. Received `' + e + "`"
    );
    throw t.code = "ERR_INVALID_ARG_TYPE", t;
  }
  if (e.protocol !== "file:") {
    const t = new TypeError("The URL must be of scheme file");
    throw t.code = "ERR_INVALID_URL_SCHEME", t;
  }
  return zh(e);
}
function zh(e) {
  if (e.hostname !== "") {
    const r = new TypeError(
      'File URL host must be "localhost" or empty on darwin'
    );
    throw r.code = "ERR_INVALID_FILE_URL_HOST", r;
  }
  const t = e.pathname;
  let n = -1;
  for (; ++n < t.length; )
    if (t.codePointAt(n) === 37 && t.codePointAt(n + 1) === 50) {
      const r = t.codePointAt(n + 2);
      if (r === 70 || r === 102) {
        const i = new TypeError(
          "File URL path must not include encoded / characters"
        );
        throw i.code = "ERR_INVALID_FILE_URL_PATH", i;
      }
    }
  return decodeURIComponent(t);
}
const Vr = (
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
class zs {
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
  constructor(t) {
    let n;
    t ? _i(t) ? n = { path: t } : typeof t == "string" || Uh(t) ? n = { value: t } : n = t : n = {}, this.cwd = "cwd" in n ? "" : Ph.cwd(), this.data = {}, this.history = [], this.messages = [], this.value, this.map, this.result, this.stored;
    let r = -1;
    for (; ++r < Vr.length; ) {
      const a = Vr[r];
      a in n && n[a] !== void 0 && n[a] !== null && (this[a] = a === "history" ? [...n[a]] : n[a]);
    }
    let i;
    for (i in n)
      Vr.includes(i) || (this[i] = n[i]);
  }
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   *
   * @returns {string | undefined}
   *   Basename.
   */
  get basename() {
    return typeof this.path == "string" ? ft.basename(this.path) : void 0;
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
  set basename(t) {
    Zr(t, "basename"), Yr(t, "basename"), this.path = ft.join(this.dirname || "", t);
  }
  /**
   * Get the parent path (example: `'~'`).
   *
   * @returns {string | undefined}
   *   Dirname.
   */
  get dirname() {
    return typeof this.path == "string" ? ft.dirname(this.path) : void 0;
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
  set dirname(t) {
    aa(this.basename, "dirname"), this.path = ft.join(t || "", this.basename);
  }
  /**
   * Get the extname (including dot) (example: `'.js'`).
   *
   * @returns {string | undefined}
   *   Extname.
   */
  get extname() {
    return typeof this.path == "string" ? ft.extname(this.path) : void 0;
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
  set extname(t) {
    if (Yr(t, "extname"), aa(this.dirname, "extname"), t) {
      if (t.codePointAt(0) !== 46)
        throw new Error("`extname` must start with `.`");
      if (t.includes(".", 1))
        throw new Error("`extname` cannot contain multiple dots");
    }
    this.path = ft.join(this.dirname, this.stem + (t || ""));
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
  set path(t) {
    _i(t) && (t = Bh(t)), Zr(t, "path"), this.path !== t && this.history.push(t);
  }
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   *
   * @returns {string | undefined}
   *   Stem.
   */
  get stem() {
    return typeof this.path == "string" ? ft.basename(this.path, this.extname) : void 0;
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
  set stem(t) {
    Zr(t, "stem"), Yr(t, "stem"), this.path = ft.join(this.dirname || "", t + (this.extname || ""));
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
  fail(t, n, r) {
    const i = this.message(t, n, r);
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
  info(t, n, r) {
    const i = this.message(t, n, r);
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
  message(t, n, r) {
    const i = new Pe(
      // @ts-expect-error: the overloads are fine.
      t,
      n,
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
  toString(t) {
    return this.value === void 0 ? "" : typeof this.value == "string" ? this.value : new TextDecoder(t || void 0).decode(this.value);
  }
}
function Yr(e, t) {
  if (e && e.includes(ft.sep))
    throw new Error(
      "`" + t + "` cannot be a path: did not expect `" + ft.sep + "`"
    );
}
function Zr(e, t) {
  if (!e)
    throw new Error("`" + t + "` cannot be empty");
}
function aa(e, t) {
  if (!e)
    throw new Error("Setting `" + t + "` requires `path` to be set too");
}
function Uh(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const $h = (
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
    ), i = r[e], a = function() {
      return i.apply(a, arguments);
    };
    return Object.setPrototypeOf(a, r), a;
  })
), Hh = {}.hasOwnProperty;
class Yi extends $h {
  /**
   * Create a processor.
   */
  constructor() {
    super("copy"), this.Compiler = void 0, this.Parser = void 0, this.attachers = [], this.compiler = void 0, this.freezeIndex = -1, this.frozen = void 0, this.namespace = {}, this.parser = void 0, this.transformers = Th();
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
    const t = (
      /** @type {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>} */
      new Yi()
    );
    let n = -1;
    for (; ++n < this.attachers.length; ) {
      const r = this.attachers[n];
      t.use(...r);
    }
    return t.data(Wr(!0, {}, this.namespace)), t;
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
  data(t, n) {
    return typeof t == "string" ? arguments.length === 2 ? (Qr("data", this.frozen), this.namespace[t] = n, this) : Hh.call(this.namespace, t) && this.namespace[t] || void 0 : t ? (Qr("data", this.frozen), this.namespace = t, this) : this.namespace;
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
    const t = (
      /** @type {Processor} */
      /** @type {unknown} */
      this
    );
    for (; ++this.freezeIndex < this.attachers.length; ) {
      const [n, ...r] = this.attachers[this.freezeIndex];
      if (r[0] === !1)
        continue;
      r[0] === !0 && (r[0] = void 0);
      const i = n.call(t, ...r);
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
  parse(t) {
    this.freeze();
    const n = Zn(t), r = this.parser || this.Parser;
    return Xr("parse", r), r(String(n), n);
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
  process(t, n) {
    const r = this;
    return this.freeze(), Xr("process", this.parser || this.Parser), jr("process", this.compiler || this.Compiler), n ? i(void 0, n) : new Promise(i);
    function i(a, o) {
      const s = Zn(t), c = (
        /** @type {HeadTree extends undefined ? Node : HeadTree} */
        /** @type {unknown} */
        r.parse(s)
      );
      r.run(c, s, function(u, d, p) {
        if (u || !d || !p)
          return l(u);
        const f = (
          /** @type {CompileTree extends undefined ? Node : CompileTree} */
          /** @type {unknown} */
          d
        ), h = r.stringify(f, p);
        qh(h) ? p.value = h : p.result = h, l(
          u,
          /** @type {VFileWithOutput<CompileResult>} */
          p
        );
      });
      function l(u, d) {
        u || !d ? o(u) : a ? a(d) : n(void 0, d);
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
  processSync(t) {
    let n = !1, r;
    return this.freeze(), Xr("processSync", this.parser || this.Parser), jr("processSync", this.compiler || this.Compiler), this.process(t, i), la("processSync", "process", n), r;
    function i(a, o) {
      n = !0, ia(a), r = o;
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
  run(t, n, r) {
    sa(t), this.freeze();
    const i = this.transformers;
    return !r && typeof n == "function" && (r = n, n = void 0), r ? a(void 0, r) : new Promise(a);
    function a(o, s) {
      const c = Zn(n);
      i.run(t, c, l);
      function l(u, d, p) {
        const f = (
          /** @type {TailTree extends undefined ? Node : TailTree} */
          d || t
        );
        u ? s(u) : o ? o(f) : r(void 0, f, p);
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
  runSync(t, n) {
    let r = !1, i;
    return this.run(t, n, a), la("runSync", "run", r), i;
    function a(o, s) {
      ia(o), i = s, r = !0;
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
  stringify(t, n) {
    this.freeze();
    const r = Zn(n), i = this.compiler || this.Compiler;
    return jr("stringify", i), sa(t), i(t, r);
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
  use(t, ...n) {
    const r = this.attachers, i = this.namespace;
    if (Qr("use", this.frozen), t != null) if (typeof t == "function")
      c(t, n);
    else if (typeof t == "object")
      Array.isArray(t) ? s(t) : o(t);
    else
      throw new TypeError("Expected usable value, not `" + t + "`");
    return this;
    function a(l) {
      if (typeof l == "function")
        c(l, []);
      else if (typeof l == "object")
        if (Array.isArray(l)) {
          const [u, ...d] = (
            /** @type {PluginTuple<Array<unknown>>} */
            l
          );
          c(u, d);
        } else
          o(l);
      else
        throw new TypeError("Expected usable value, not `" + l + "`");
    }
    function o(l) {
      if (!("plugins" in l) && !("settings" in l))
        throw new Error(
          "Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither"
        );
      s(l.plugins), l.settings && (i.settings = Wr(!0, i.settings, l.settings));
    }
    function s(l) {
      let u = -1;
      if (l != null) if (Array.isArray(l))
        for (; ++u < l.length; ) {
          const d = l[u];
          a(d);
        }
      else
        throw new TypeError("Expected a list of plugins, not `" + l + "`");
    }
    function c(l, u) {
      let d = -1, p = -1;
      for (; ++d < r.length; )
        if (r[d][0] === l) {
          p = d;
          break;
        }
      if (p === -1)
        r.push([l, ...u]);
      else if (u.length > 0) {
        let [f, ...h] = u;
        const m = r[p][1];
        Ei(m) && Ei(f) && (f = Wr(!0, m, f)), r[p] = [l, f, ...h];
      }
    }
  }
}
const Gh = new Yi().freeze();
function Xr(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `parser`");
}
function jr(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `compiler`");
}
function Qr(e, t) {
  if (t)
    throw new Error(
      "Cannot call `" + e + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`."
    );
}
function sa(e) {
  if (!Ei(e) || typeof e.type != "string")
    throw new TypeError("Expected node, got `" + e + "`");
}
function la(e, t, n) {
  if (!n)
    throw new Error(
      "`" + e + "` finished async. Use `" + t + "` instead"
    );
}
function Zn(e) {
  return Kh(e) ? e : new zs(e);
}
function Kh(e) {
  return !!(e && typeof e == "object" && "message" in e && "messages" in e);
}
function qh(e) {
  return typeof e == "string" || Wh(e);
}
function Wh(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const Vh = "https://github.com/remarkjs/react-markdown/blob/main/changelog.md", ca = [], ua = { allowDangerousHtml: !0 }, Yh = /^(https?|ircs?|mailto|xmpp)$/i, Zh = [
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
function wi(e) {
  const t = Xh(e), n = jh(e);
  return Qh(t.runSync(t.parse(n), n), e);
}
function Xh(e) {
  const t = e.rehypePlugins || ca, n = e.remarkPlugins || ca, r = e.remarkRehypeOptions ? { ...e.remarkRehypeOptions, ...ua } : ua;
  return Gh().use(Rp).use(n).use(Sh, r).use(t);
}
function jh(e) {
  const t = e.children || "", n = new zs();
  return typeof t == "string" && (n.value = t), n;
}
function Qh(e, t) {
  const n = t.allowedElements, r = t.allowElement, i = t.components, a = t.disallowedElements, o = t.skipHtml, s = t.unwrapDisallowed, c = t.urlTransform || Jh;
  for (const u of Zh)
    Object.hasOwn(t, u.from) && ("" + u.from + (u.to ? "use `" + u.to + "` instead" : "remove it") + Vh + u.id, void 0);
  return t.className && (e = {
    type: "element",
    tagName: "div",
    properties: { className: t.className },
    // Assume no doctypes.
    children: (
      /** @type {Array<ElementContent>} */
      e.type === "root" ? e.children : [e]
    )
  }), xr(e, l), fd(e, {
    Fragment: br,
    // @ts-expect-error
    // React components are allowed to return numbers,
    // but not according to the types in hast-util-to-jsx-runtime
    components: i,
    ignoreInvalidStyle: !0,
    jsx: v,
    jsxs: Y,
    passKeys: !0,
    passNode: !0
  });
  function l(u, d, p) {
    if (u.type === "raw" && p && typeof d == "number")
      return o ? p.children.splice(d, 1) : p.children[d] = { type: "text", value: u.value }, d;
    if (u.type === "element") {
      let f;
      for (f in Hr)
        if (Object.hasOwn(Hr, f) && Object.hasOwn(u.properties, f)) {
          const h = u.properties[f], m = Hr[f];
          (m === null || m.includes(u.tagName)) && (u.properties[f] = c(String(h || ""), f, u));
        }
    }
    if (u.type === "element") {
      let f = n ? !n.includes(u.tagName) : a ? a.includes(u.tagName) : !1;
      if (!f && r && typeof d == "number" && (f = !r(u, d, p)), f && p && typeof d == "number")
        return s && u.children ? p.children.splice(d, 1, ...u.children) : p.children.splice(d, 1), d;
    }
  }
}
function Jh(e) {
  const t = e.indexOf(":"), n = e.indexOf("?"), r = e.indexOf("#"), i = e.indexOf("/");
  return (
    // If there is no protocol, it’s relative.
    t === -1 || // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
    i !== -1 && t > i || n !== -1 && t > n || r !== -1 && t > r || // It is a protocol, it should be allowed.
    Yh.test(e.slice(0, t)) ? e : ""
  );
}
const da = (
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
  (function(e, t, n) {
    const r = In(n);
    if (!e || !e.type || !e.children)
      throw new Error("Expected parent node");
    if (typeof t == "number") {
      if (t < 0 || t === Number.POSITIVE_INFINITY)
        throw new Error("Expected positive finite number as index");
    } else if (t = e.children.indexOf(t), t < 0)
      throw new Error("Expected child node or index");
    for (; ++t < e.children.length; )
      if (r(e.children[t], t, e))
        return e.children[t];
  })
), Wt = (
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
      return ng;
    if (typeof e == "string")
      return tg(e);
    if (typeof e == "object")
      return eg(e);
    if (typeof e == "function")
      return Zi(e);
    throw new Error("Expected function, string, or array as `test`");
  })
);
function eg(e) {
  const t = [];
  let n = -1;
  for (; ++n < e.length; )
    t[n] = Wt(e[n]);
  return Zi(r);
  function r(...i) {
    let a = -1;
    for (; ++a < t.length; )
      if (t[a].apply(this, i)) return !0;
    return !1;
  }
}
function tg(e) {
  return Zi(t);
  function t(n) {
    return n.tagName === e;
  }
}
function Zi(e) {
  return t;
  function t(n, r, i) {
    return !!(rg(n) && e.call(
      this,
      n,
      typeof r == "number" ? r : void 0,
      i || void 0
    ));
  }
}
function ng(e) {
  return !!(e && typeof e == "object" && "type" in e && e.type === "element" && "tagName" in e && typeof e.tagName == "string");
}
function rg(e) {
  return e !== null && typeof e == "object" && "type" in e && "tagName" in e;
}
const fa = /\n/g, pa = /[\t ]+/g, xi = Wt("br"), ha = Wt(dg), ig = Wt("p"), ga = Wt("tr"), og = Wt([
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
  ug,
  // From: <https://html.spec.whatwg.org/multipage/rendering.html#flow-content-3>
  fg
]), Us = Wt([
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
function ag(e, t) {
  const n = t || {}, r = "children" in e ? e.children : [], i = Us(e), a = Gs(e, {
    whitespace: n.whitespace || "normal"
  }), o = [];
  (e.type === "text" || e.type === "comment") && o.push(
    ...Hs(e, {
      breakBefore: !0,
      breakAfter: !0
    })
  );
  let s = -1;
  for (; ++s < r.length; )
    o.push(
      ...$s(
        r[s],
        // @ts-expect-error: `tree` is a parent if we’re here.
        e,
        {
          whitespace: a,
          breakBefore: s ? void 0 : i,
          breakAfter: s < r.length - 1 ? xi(r[s + 1]) : i
        }
      )
    );
  const c = [];
  let l;
  for (s = -1; ++s < o.length; ) {
    const u = o[s];
    typeof u == "number" ? l !== void 0 && u > l && (l = u) : u && (l !== void 0 && l > -1 && c.push(`
`.repeat(l) || " "), l = -1, c.push(u));
  }
  return c.join("");
}
function $s(e, t, n) {
  return e.type === "element" ? sg(e, t, n) : e.type === "text" ? n.whitespace === "normal" ? Hs(e, n) : lg(e) : [];
}
function sg(e, t, n) {
  const r = Gs(e, n), i = e.children || [];
  let a = -1, o = [];
  if (og(e))
    return o;
  let s, c;
  for (xi(e) || ga(e) && // @ts-expect-error: something up with types of parents.
  da(t, e, ga) ? c = `
` : ig(e) ? (s = 2, c = 2) : Us(e) && (s = 1, c = 1); ++a < i.length; )
    o = o.concat(
      $s(i[a], e, {
        whitespace: r,
        breakBefore: a ? void 0 : s,
        breakAfter: a < i.length - 1 ? xi(i[a + 1]) : c
      })
    );
  return ha(e) && // @ts-expect-error: something up with types of parents.
  da(t, e, ha) && o.push("	"), s && o.unshift(s), c && o.push(c), o;
}
function Hs(e, t) {
  const n = String(e.value), r = [], i = [];
  let a = 0;
  for (; a <= n.length; ) {
    fa.lastIndex = a;
    const c = fa.exec(n), l = c && "index" in c ? c.index : n.length;
    r.push(
      // Any sequence of collapsible spaces and tabs immediately preceding or
      // following a segment break is removed.
      cg(
        // […] ignoring bidi formatting characters (characters with the
        // Bidi_Control property [UAX9]: ALM, LTR, RTL, LRE-RLO, LRI-PDI) as if
        // they were not there.
        n.slice(a, l).replace(/[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, ""),
        a === 0 ? t.breakBefore : !0,
        l === n.length ? t.breakAfter : !0
      )
    ), a = l + 1;
  }
  let o = -1, s;
  for (; ++o < r.length; )
    r[o].charCodeAt(r[o].length - 1) === 8203 || o < r.length - 1 && r[o + 1].charCodeAt(0) === 8203 ? (i.push(r[o]), s = void 0) : r[o] ? (typeof s == "number" && i.push(s), i.push(r[o]), s = 0) : (o === 0 || o === r.length - 1) && i.push(0);
  return i;
}
function lg(e) {
  return [String(e.value)];
}
function cg(e, t, n) {
  const r = [];
  let i = 0, a;
  for (; i < e.length; ) {
    pa.lastIndex = i;
    const o = pa.exec(e);
    a = o ? o.index : e.length, !i && !a && o && !t && r.push(""), i !== a && r.push(e.slice(i, a)), i = o ? a + o[0].length : a;
  }
  return i !== a && !n && r.push(""), r.join(" ");
}
function Gs(e, t) {
  if (e.type === "element") {
    const n = e.properties || {};
    switch (e.tagName) {
      case "listing":
      case "plaintext":
      case "xmp":
        return "pre";
      case "nobr":
        return "nowrap";
      case "pre":
        return n.wrap ? "pre-wrap" : "pre";
      case "td":
      case "th":
        return n.noWrap ? "nowrap" : t.whitespace;
      case "textarea":
        return "pre-wrap";
    }
  }
  return t.whitespace;
}
function ug(e) {
  return !!(e.properties || {}).hidden;
}
function dg(e) {
  return e.tagName === "td" || e.tagName === "th";
}
function fg(e) {
  return e.tagName === "dialog" && !(e.properties || {}).open;
}
function pg(e) {
  const t = e.regex, n = e.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] }), r = "decltype\\(auto\\)", i = "[a-zA-Z_]\\w*::", o = "(?!struct)(" + r + "|" + t.optional(i) + "[a-zA-Z_]\\w*" + t.optional("<[^<>]+>") + ")", s = {
    className: "type",
    begin: "\\b[a-z\\d_]*_t\\b"
  }, l = {
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
  }, u = {
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
  }, d = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      e.inherit(l, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      n,
      e.C_BLOCK_COMMENT_MODE
    ]
  }, p = {
    className: "title",
    begin: t.optional(i) + e.IDENT_RE,
    relevance: 0
  }, f = t.optional(i) + e.IDENT_RE + "\\s*\\(", h = [
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
  ], m = [
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
  ], b = [
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
  ], g = [
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
  ], C = {
    type: m,
    keyword: h,
    literal: [
      "NULL",
      "false",
      "nullopt",
      "nullptr",
      "true"
    ],
    built_in: ["_Pragma"],
    _type_hints: b
  }, T = {
    className: "function.dispatch",
    relevance: 0,
    keywords: {
      // Only for relevance, not highlighting.
      _hint: g
    },
    begin: t.concat(
      /\b/,
      /(?!decltype)/,
      /(?!if)/,
      /(?!for)/,
      /(?!switch)/,
      /(?!while)/,
      e.IDENT_RE,
      t.lookahead(/(<[^<>]+>|)\s*\(/)
    )
  }, k = [
    T,
    d,
    s,
    n,
    e.C_BLOCK_COMMENT_MODE,
    u,
    l
  ], I = {
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
    keywords: C,
    contains: k.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: C,
        contains: k.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  }, A = {
    className: "function",
    begin: "(" + o + "[\\*&\\s]+)+" + f,
    returnBegin: !0,
    end: /[{;=]/,
    excludeEnd: !0,
    keywords: C,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: r,
        keywords: C,
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
          l,
          u
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
        keywords: C,
        relevance: 0,
        contains: [
          n,
          e.C_BLOCK_COMMENT_MODE,
          l,
          u,
          s,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: C,
            relevance: 0,
            contains: [
              "self",
              n,
              e.C_BLOCK_COMMENT_MODE,
              l,
              u,
              s
            ]
          }
        ]
      },
      s,
      n,
      e.C_BLOCK_COMMENT_MODE,
      d
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
    keywords: C,
    illegal: "</",
    classNameAliases: { "function.dispatch": "built_in" },
    contains: [].concat(
      I,
      A,
      T,
      k,
      [
        d,
        {
          // containers: ie, `vector <int> rooms (9);`
          begin: "\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function|flat_map|flat_set)\\s*<(?!<)",
          end: ">",
          keywords: C,
          contains: [
            "self",
            s
          ]
        },
        {
          begin: e.IDENT_RE + "::",
          keywords: C
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
function hg(e) {
  const t = {
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
  }, n = pg(e), r = (
    /** @type {Record<string,any>} */
    n.keywords
  );
  return r.type = [
    ...r.type,
    ...t.type
  ], r.literal = [
    ...r.literal,
    ...t.literal
  ], r.built_in = [
    ...r.built_in,
    ...t.built_in
  ], r._hints = t._hints, n.name = "Arduino", n.aliases = ["ino"], n.supersetOf = "cpp", n;
}
function gg(e) {
  const t = e.regex, n = {}, r = {
    begin: /\$\{/,
    end: /\}/,
    contains: [
      "self",
      {
        begin: /:-/,
        contains: [n]
      }
      // default values
    ]
  };
  Object.assign(n, {
    className: "variable",
    variants: [
      { begin: t.concat(
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
  }, a = e.inherit(
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
  ), o = {
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
      n,
      i
    ]
  };
  i.contains.push(s);
  const c = {
    match: /\\"/
  }, l = {
    className: "string",
    begin: /'/,
    end: /'/
  }, u = {
    match: /\\'/
  }, d = {
    begin: /\$?\(\(/,
    end: /\)\)/,
    contains: [
      {
        begin: /\d+#[0-9a-f]+/,
        className: "number"
      },
      e.NUMBER_MODE,
      n
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
  }), h = {
    className: "function",
    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
    returnBegin: !0,
    contains: [e.inherit(e.TITLE_MODE, { begin: /\w[\w\d_]*/ })],
    relevance: 0
  }, m = [
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
  ], b = [
    "true",
    "false"
  ], g = { match: /(\/[a-z._-]+)+/ }, x = [
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
  ], _ = [
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
  ], C = [
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
  ], T = [
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
      keyword: m,
      literal: b,
      built_in: [
        ...x,
        ..._,
        // Shell modifiers
        "set",
        "shopt",
        ...C,
        ...T
      ]
    },
    contains: [
      f,
      // to catch known shells and boost relevancy
      e.SHEBANG(),
      // to catch unknown shells but still highlight the shebang
      h,
      d,
      a,
      o,
      g,
      s,
      c,
      l,
      u,
      n
    ]
  };
}
function mg(e) {
  const t = e.regex, n = e.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] }), r = "decltype\\(auto\\)", i = "[a-zA-Z_]\\w*::", o = "(" + r + "|" + t.optional(i) + "[a-zA-Z_]\\w*" + t.optional("<[^<>]+>") + ")", s = {
    className: "type",
    variants: [
      { begin: "\\b[a-z\\d_]*_t\\b" },
      { match: /\batomic_[a-z]{3,6}\b/ }
    ]
  }, l = {
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
  }, u = {
    className: "number",
    variants: [
      { match: /\b(0b[01']+)/ },
      { match: /(-?)\b([\d']+(\.[\d']*)?|\.[\d']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)/ },
      { match: /(-?)\b(0[xX][a-fA-F0-9]+(?:'[a-fA-F0-9]+)*(?:\.[a-fA-F0-9]*(?:'[a-fA-F0-9]*)*)?(?:[pP][-+]?[0-9]+)?(l|L)?(u|U)?)/ },
      { match: /(-?)\b\d+(?:'\d+)*(?:\.\d*(?:'\d*)*)?(?:[eE][-+]?\d+)?/ }
    ],
    relevance: 0
  }, d = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef elifdef elifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      e.inherit(l, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      n,
      e.C_BLOCK_COMMENT_MODE
    ]
  }, p = {
    className: "title",
    begin: t.optional(i) + e.IDENT_RE,
    relevance: 0
  }, f = t.optional(i) + e.IDENT_RE + "\\s*\\(", b = {
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
  }, g = [
    d,
    s,
    n,
    e.C_BLOCK_COMMENT_MODE,
    u,
    l
  ], x = {
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
    keywords: b,
    contains: g.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: b,
        contains: g.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  }, _ = {
    begin: "(" + o + "[\\*&\\s]+)+" + f,
    returnBegin: !0,
    end: /[{;=]/,
    excludeEnd: !0,
    keywords: b,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: r,
        keywords: b,
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
        keywords: b,
        relevance: 0,
        contains: [
          n,
          e.C_BLOCK_COMMENT_MODE,
          l,
          u,
          s,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: b,
            relevance: 0,
            contains: [
              "self",
              n,
              e.C_BLOCK_COMMENT_MODE,
              l,
              u,
              s
            ]
          }
        ]
      },
      s,
      n,
      e.C_BLOCK_COMMENT_MODE,
      d
    ]
  };
  return {
    name: "C",
    aliases: ["h"],
    keywords: b,
    // Until differentiations are added between `c` and `cpp`, `c` will
    // not be auto-detected to avoid auto-detect conflicts between C and C++
    disableAutodetect: !0,
    illegal: "</",
    contains: [].concat(
      x,
      _,
      g,
      [
        d,
        {
          begin: e.IDENT_RE + "::",
          keywords: b
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
      preprocessor: d,
      strings: l,
      keywords: b
    }
  };
}
function bg(e) {
  const t = e.regex, n = e.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] }), r = "decltype\\(auto\\)", i = "[a-zA-Z_]\\w*::", o = "(?!struct)(" + r + "|" + t.optional(i) + "[a-zA-Z_]\\w*" + t.optional("<[^<>]+>") + ")", s = {
    className: "type",
    begin: "\\b[a-z\\d_]*_t\\b"
  }, l = {
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
  }, u = {
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
  }, d = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      e.inherit(l, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      n,
      e.C_BLOCK_COMMENT_MODE
    ]
  }, p = {
    className: "title",
    begin: t.optional(i) + e.IDENT_RE,
    relevance: 0
  }, f = t.optional(i) + e.IDENT_RE + "\\s*\\(", h = [
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
  ], m = [
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
  ], b = [
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
  ], g = [
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
  ], C = {
    type: m,
    keyword: h,
    literal: [
      "NULL",
      "false",
      "nullopt",
      "nullptr",
      "true"
    ],
    built_in: ["_Pragma"],
    _type_hints: b
  }, T = {
    className: "function.dispatch",
    relevance: 0,
    keywords: {
      // Only for relevance, not highlighting.
      _hint: g
    },
    begin: t.concat(
      /\b/,
      /(?!decltype)/,
      /(?!if)/,
      /(?!for)/,
      /(?!switch)/,
      /(?!while)/,
      e.IDENT_RE,
      t.lookahead(/(<[^<>]+>|)\s*\(/)
    )
  }, k = [
    T,
    d,
    s,
    n,
    e.C_BLOCK_COMMENT_MODE,
    u,
    l
  ], I = {
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
    keywords: C,
    contains: k.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: C,
        contains: k.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  }, A = {
    className: "function",
    begin: "(" + o + "[\\*&\\s]+)+" + f,
    returnBegin: !0,
    end: /[{;=]/,
    excludeEnd: !0,
    keywords: C,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: r,
        keywords: C,
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
          l,
          u
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
        keywords: C,
        relevance: 0,
        contains: [
          n,
          e.C_BLOCK_COMMENT_MODE,
          l,
          u,
          s,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: C,
            relevance: 0,
            contains: [
              "self",
              n,
              e.C_BLOCK_COMMENT_MODE,
              l,
              u,
              s
            ]
          }
        ]
      },
      s,
      n,
      e.C_BLOCK_COMMENT_MODE,
      d
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
    keywords: C,
    illegal: "</",
    classNameAliases: { "function.dispatch": "built_in" },
    contains: [].concat(
      I,
      A,
      T,
      k,
      [
        d,
        {
          // containers: ie, `vector <int> rooms (9);`
          begin: "\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function|flat_map|flat_set)\\s*<(?!<)",
          end: ">",
          keywords: C,
          contains: [
            "self",
            s
          ]
        },
        {
          begin: e.IDENT_RE + "::",
          keywords: C
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
function yg(e) {
  const t = [
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
  ], n = [
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
  ], a = [
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
  ], o = {
    keyword: i.concat(a),
    built_in: t,
    literal: r
  }, s = e.inherit(e.TITLE_MODE, { begin: "[a-zA-Z](\\.?\\w)*" }), c = {
    className: "number",
    variants: [
      { begin: "\\b(0b[01']+)" },
      { begin: "(-?)\\b([\\d']+(\\.[\\d']*)?|\\.[\\d']+)(u|U|l|L|ul|UL|f|F|b|B)" },
      { begin: "(-?)(\\b0[xX][a-fA-F0-9']+|(\\b[\\d']+(\\.[\\d']*)?|\\.[\\d']+)([eE][-+]?[\\d']+)?)" }
    ],
    relevance: 0
  }, l = {
    className: "string",
    begin: /"""("*)(?!")(.|\n)*?"""\1/,
    relevance: 1
  }, u = {
    className: "string",
    begin: '@"',
    end: '"',
    contains: [{ begin: '""' }]
  }, d = e.inherit(u, { illegal: /\n/ }), p = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: o
  }, f = e.inherit(p, { illegal: /\n/ }), h = {
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
  }, m = {
    className: "string",
    begin: /\$@"/,
    end: '"',
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      p
    ]
  }, b = e.inherit(m, {
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      f
    ]
  });
  p.contains = [
    m,
    h,
    u,
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    c,
    e.C_BLOCK_COMMENT_MODE
  ], f.contains = [
    b,
    h,
    d,
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    c,
    e.inherit(e.C_BLOCK_COMMENT_MODE, { illegal: /\n/ })
  ];
  const g = { variants: [
    l,
    m,
    h,
    u,
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE
  ] }, x = {
    begin: "<",
    end: ">",
    contains: [
      { beginKeywords: "in out" },
      s
    ]
  }, _ = e.IDENT_RE + "(<" + e.IDENT_RE + "(\\s*,\\s*" + e.IDENT_RE + ")*>)?(\\[\\])?", C = {
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
    keywords: o,
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
      g,
      c,
      {
        beginKeywords: "class interface",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:,]/,
        contains: [
          { beginKeywords: "where class" },
          s,
          x,
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
          x,
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
        begin: "(" + _ + "\\s+)+" + e.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
        returnBegin: !0,
        end: /\s*[{;=]/,
        excludeEnd: !0,
        keywords: o,
        contains: [
          // prevents these from being highlighted `title`
          {
            beginKeywords: n.join(" "),
            relevance: 0
          },
          {
            begin: e.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
            returnBegin: !0,
            contains: [
              e.TITLE_MODE,
              x
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
            keywords: o,
            relevance: 0,
            contains: [
              g,
              c,
              e.C_BLOCK_COMMENT_MODE
            ]
          },
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      C
    ]
  };
}
const Eg = (e) => ({
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
}), _g = [
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
], wg = [
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
], xg = [
  ..._g,
  ...wg
], kg = [
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
].sort().reverse(), vg = [
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
].sort().reverse(), Sg = [
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
].sort().reverse(), Ng = [
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
function Cg(e) {
  const t = e.regex, n = Eg(e), r = { begin: /-(webkit|moz|ms|o)-(?=[a-z])/ }, i = "and or not only", a = /@-?\w[\w]*(-\w+)*/, o = "[a-zA-Z-][a-zA-Z0-9_-]*", s = [
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
      n.BLOCK_COMMENT,
      r,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      n.CSS_NUMBER_MODE,
      {
        className: "selector-id",
        begin: /#[A-Za-z0-9_-]+/,
        relevance: 0
      },
      {
        className: "selector-class",
        begin: "\\." + o,
        relevance: 0
      },
      n.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-pseudo",
        variants: [
          { begin: ":(" + vg.join("|") + ")" },
          { begin: ":(:)?(" + Sg.join("|") + ")" }
        ]
      },
      // we may actually need this (12/2020)
      // { // pseudo-selector params
      //   begin: /\(/,
      //   end: /\)/,
      //   contains: [ hljs.CSS_NUMBER_MODE ]
      // },
      n.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + Ng.join("|") + ")\\b"
      },
      // attribute values
      {
        begin: /:/,
        end: /[;}{]/,
        contains: [
          n.BLOCK_COMMENT,
          n.HEXCOLOR,
          n.IMPORTANT,
          n.CSS_NUMBER_MODE,
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
          n.FUNCTION_DISPATCH
        ]
      },
      {
        begin: t.lookahead(/@/),
        end: "[{;]",
        relevance: 0,
        illegal: /:/,
        // break on Less variables @var: ...
        contains: [
          {
            className: "keyword",
            begin: a
          },
          {
            begin: /\s/,
            endsWithParent: !0,
            excludeEnd: !0,
            relevance: 0,
            keywords: {
              $pattern: /[a-z-]+/,
              keyword: i,
              attribute: kg.join(" ")
            },
            contains: [
              {
                begin: /[a-z-]+(?=:)/,
                className: "attribute"
              },
              ...s,
              n.CSS_NUMBER_MODE
            ]
          }
        ]
      },
      {
        className: "selector-tag",
        begin: "\\b(" + xg.join("|") + ")\\b"
      }
    ]
  };
}
function Tg(e) {
  const t = e.regex;
  return {
    name: "Diff",
    aliases: ["patch"],
    contains: [
      {
        className: "meta",
        relevance: 10,
        match: t.either(
          /^@@ +-\d+,\d+ +\+\d+,\d+ +@@/,
          /^\*\*\* +\d+,\d+ +\*\*\*\*$/,
          /^--- +\d+,\d+ +----$/
        )
      },
      {
        className: "comment",
        variants: [
          {
            begin: t.either(
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
function Ag(e) {
  const a = {
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
    keywords: a,
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
            keywords: a,
            illegal: /["']/
          }
        ]
      }
    ]
  };
}
function Rg(e) {
  const t = e.regex, n = /[_A-Za-z][_0-9A-Za-z]*/;
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
        begin: t.concat(n, t.lookahead(/\s*:/)),
        relevance: 0
      }
    ],
    illegal: [
      /[;<']/,
      /BEGIN/
    ]
  };
}
function Og(e) {
  const t = e.regex, n = {
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
  }, a = {
    className: "literal",
    begin: /\bon|off|true|false|yes|no\b/
  }, o = {
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
      a,
      i,
      o,
      n,
      "self"
    ],
    relevance: 0
  }, c = /[A-Za-z0-9_-]+/, l = /"(\\"|[^"])*"/, u = /'[^']*'/, d = t.either(
    c,
    l,
    u
  ), p = t.concat(
    d,
    "(\\s*\\.\\s*",
    d,
    ")*",
    t.lookahead(/\s*=\s*[^#\s]/)
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
            a,
            i,
            o,
            n
          ]
        }
      }
    ]
  };
}
var Jt = "[0-9](_*[0-9])*", Xn = `\\.(${Jt})`, jn = "[0-9a-fA-F](_*[0-9a-fA-F])*", ma = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${Jt})((${Xn})|\\.)?|(${Xn}))[eE][+-]?(${Jt})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${Jt})((${Xn})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${Xn})[fFdD]?\\b` },
    { begin: `\\b(${Jt})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${jn})\\.?|(${jn})?\\.(${jn}))[pP][+-]?(${Jt})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${jn})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function Ks(e, t, n) {
  return n === -1 ? "" : e.replace(t, (r) => Ks(e, t, n - 1));
}
function Ig(e) {
  const t = e.regex, n = "[À-ʸa-zA-Z_$][À-ʸa-zA-Z_$0-9]*", r = n + Ks("(?:<" + n + "~~~(?:\\s*,\\s*" + n + "~~~)*>)?", /~~~/g, 2), c = {
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
  }, l = {
    className: "meta",
    begin: "@" + n,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: ["self"]
        // allow nested () inside our annotation
      }
    ]
  }, u = {
    className: "params",
    begin: /\(/,
    end: /\)/,
    keywords: c,
    relevance: 0,
    contains: [e.C_BLOCK_COMMENT_MODE],
    endsParent: !0
  };
  return {
    name: "Java",
    aliases: ["jsp"],
    keywords: c,
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
          n
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
          t.concat(/(?!else)/, n),
          /\s+/,
          n,
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
          n
        ],
        className: {
          1: "keyword",
          3: "title.class"
        },
        contains: [
          u,
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
        keywords: c,
        contains: [
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            keywords: c,
            relevance: 0,
            contains: [
              l,
              e.APOS_STRING_MODE,
              e.QUOTE_STRING_MODE,
              ma,
              e.C_BLOCK_COMMENT_MODE
            ]
          },
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      ma,
      l
    ]
  };
}
const ba = "[A-Za-z$_][0-9A-Za-z$_]*", Mg = [
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
], Dg = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
], qs = [
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
], Ws = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
], Vs = [
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
], Lg = [
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
], Pg = [].concat(
  Vs,
  qs,
  Ws
);
function Fg(e) {
  const t = e.regex, n = ($, { after: ne }) => {
    const y = "</" + $[0].slice(1);
    return $.input.indexOf(y, ne) !== -1;
  }, r = ba, i = {
    begin: "<>",
    end: "</>"
  }, a = /<[A-Za-z0-9\\._:-]+\s*\/>/, o = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: ($, ne) => {
      const y = $[0].length + $.index, ue = $.input[y];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        ue === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        ue === ","
      ) {
        ne.ignoreMatch();
        return;
      }
      ue === ">" && (n($, { after: y }) || ne.ignoreMatch());
      let fe;
      const w = $.input.substring(y);
      if (fe = w.match(/^\s*=/)) {
        ne.ignoreMatch();
        return;
      }
      if ((fe = w.match(/^\s+extends\s+/)) && fe.index === 0) {
        ne.ignoreMatch();
        return;
      }
    }
  }, s = {
    $pattern: ba,
    keyword: Mg,
    literal: Dg,
    built_in: Pg,
    "variable.language": Lg
  }, c = "[0-9](_?[0-9])*", l = `\\.(${c})`, u = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*", d = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${u})((${l})|\\.)?|(${l}))[eE][+-]?(${c})\\b` },
      { begin: `\\b(${u})\\b((${l})\\b|\\.)?|(${l})\\b` },
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
  }, h = {
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
  }, m = {
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
  }, b = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      e.BACKSLASH_ESCAPE,
      p
    ]
  }, x = {
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
  }, _ = [
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    f,
    h,
    m,
    b,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    d
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  p.contains = _.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: s,
    contains: [
      "self"
    ].concat(_)
  });
  const C = [].concat(x, p.contains), T = C.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: s,
      contains: ["self"].concat(C)
    }
  ]), k = {
    className: "params",
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/,
    // to match the parms with
    end: /\)/,
    excludeBegin: !0,
    excludeEnd: !0,
    keywords: s,
    contains: T
  }, I = {
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
          t.concat(r, "(", t.concat(/\./, r), ")*")
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
  }, A = {
    relevance: 0,
    match: t.either(
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
        ...qs,
        ...Ws
      ]
    }
  }, O = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  }, S = {
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
    contains: [k],
    illegal: /%/
  }, L = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function B($) {
    return t.concat("(?!", $.join("|"), ")");
  }
  const W = {
    match: t.concat(
      /\b/,
      B([
        ...Vs,
        "super",
        "import"
      ].map(($) => `${$}\\s*\\(`)),
      r,
      t.lookahead(/\s*\(/)
    ),
    className: "title.function",
    relevance: 0
  }, P = {
    begin: t.concat(/\./, t.lookahead(
      t.concat(r, /(?![0-9A-Za-z$_(])/)
    )),
    end: r,
    excludeBegin: !0,
    keywords: "prototype",
    className: "property",
    relevance: 0
  }, D = {
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
      k
    ]
  }, K = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + e.UNDERSCORE_IDENT_RE + ")\\s*=>", Q = {
    match: [
      /const|var|let/,
      /\s+/,
      r,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      t.lookahead(K)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      k
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: s,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS: T, CLASS_REFERENCE: A },
    illegal: /#(?![$_A-z])/,
    contains: [
      e.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      O,
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      f,
      h,
      m,
      b,
      x,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      d,
      A,
      {
        scope: "attr",
        match: r + t.lookahead(":"),
        relevance: 0
      },
      Q,
      {
        // "value" container
        begin: "(" + e.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          x,
          e.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: K,
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
                    contains: T
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
              { match: a },
              {
                begin: o.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": o.isTrulyOpeningTag,
                end: o.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: o.begin,
                end: o.end,
                skip: !0,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      S,
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
          k,
          e.inherit(e.TITLE_MODE, { begin: r, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      P,
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
        contains: [k]
      },
      W,
      L,
      I,
      D,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function Bg(e) {
  const t = {
    className: "attr",
    begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
    relevance: 1.01
  }, n = {
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
      t,
      n,
      e.QUOTE_STRING_MODE,
      i,
      e.C_NUMBER_MODE,
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE
    ],
    illegal: "\\S"
  };
}
var en = "[0-9](_*[0-9])*", Qn = `\\.(${en})`, Jn = "[0-9a-fA-F](_*[0-9a-fA-F])*", zg = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${en})((${Qn})|\\.)?|(${Qn}))[eE][+-]?(${en})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${en})((${Qn})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${Qn})[fFdD]?\\b` },
    { begin: `\\b(${en})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${Jn})\\.?|(${Jn})?\\.(${Jn}))[pP][+-]?(${en})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${Jn})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function Ug(e) {
  const t = {
    keyword: "abstract as val var vararg get set class object open private protected public noinline crossinline dynamic final enum if else do while for when throw try catch finally import package is in fun override companion reified inline lateinit init interface annotation data sealed internal infix operator out by constructor super tailrec where const inner suspend typealias external expect actual",
    built_in: "Byte Short Char Int Long Boolean Float Double Void Unit Nothing",
    literal: "true false null"
  }, n = {
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
  }, a = {
    className: "variable",
    begin: "\\$" + e.UNDERSCORE_IDENT_RE
  }, o = {
    className: "string",
    variants: [
      {
        begin: '"""',
        end: '"""(?=[^"])',
        contains: [
          a,
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
          a,
          i
        ]
      }
    ]
  };
  i.contains.push(o);
  const s = {
    className: "meta",
    begin: "@(?:file|property|field|get|set|receiver|param|setparam|delegate)\\s*:(?:\\s*" + e.UNDERSCORE_IDENT_RE + ")?"
  }, c = {
    className: "meta",
    begin: "@" + e.UNDERSCORE_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          e.inherit(o, { className: "string" }),
          "self"
        ]
      }
    ]
  }, l = zg, u = e.COMMENT(
    "/\\*",
    "\\*/",
    { contains: [e.C_BLOCK_COMMENT_MODE] }
  ), d = { variants: [
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
  ] }, p = d;
  return p.variants[1].contains = [d], d.variants[1].contains = [p], {
    name: "Kotlin",
    aliases: [
      "kt",
      "kts"
    ],
    keywords: t,
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
      u,
      n,
      r,
      s,
      c,
      {
        className: "function",
        beginKeywords: "fun",
        end: "[(]|$",
        returnBegin: !0,
        excludeEnd: !0,
        keywords: t,
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
            keywords: t,
            relevance: 0,
            contains: [
              {
                begin: /:/,
                end: /[=,\/]/,
                endsWithParent: !0,
                contains: [
                  d,
                  e.C_LINE_COMMENT_MODE,
                  u
                ],
                relevance: 0
              },
              e.C_LINE_COMMENT_MODE,
              u,
              s,
              c,
              o,
              e.C_NUMBER_MODE
            ]
          },
          u
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
          c
        ]
      },
      o,
      {
        className: "meta",
        begin: "^#!/usr/bin/env",
        end: "$",
        illegal: `
`
      },
      l
    ]
  };
}
const $g = (e) => ({
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
}), Hg = [
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
], Gg = [
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
], Kg = [
  ...Hg,
  ...Gg
], qg = [
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
].sort().reverse(), Ys = [
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
].sort().reverse(), Zs = [
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
].sort().reverse(), Wg = [
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
].sort().reverse(), Vg = Ys.concat(Zs).sort().reverse();
function Yg(e) {
  const t = $g(e), n = Vg, r = "and or not only", i = "[\\w-]+", a = "(" + i + "|@\\{" + i + "\\})", o = [], s = [], c = function(_) {
    return {
      // Less strings are not multiline (also include '~' for more consistent coloring of "escaped" strings)
      className: "string",
      begin: "~?" + _ + ".*?" + _
    };
  }, l = function(_, C, T) {
    return {
      className: _,
      begin: C,
      relevance: T
    };
  }, u = {
    $pattern: /[a-z-]+/,
    keyword: r,
    attribute: qg.join(" ")
  }, d = {
    // used only to properly balance nested parens inside mixin call, def. arg list
    begin: "\\(",
    end: "\\)",
    contains: s,
    keywords: u,
    relevance: 0
  };
  s.push(
    e.C_LINE_COMMENT_MODE,
    e.C_BLOCK_COMMENT_MODE,
    c("'"),
    c('"'),
    t.CSS_NUMBER_MODE,
    // fixme: it does not include dot for numbers like .5em :(
    {
      begin: "(url|data-uri)\\(",
      starts: {
        className: "string",
        end: "[\\)\\n]",
        excludeEnd: !0
      }
    },
    t.HEXCOLOR,
    d,
    l("variable", "@@?" + i, 10),
    l("variable", "@\\{" + i + "\\}"),
    l("built_in", "~?`[^`]*?`"),
    // inline javascript (or whatever host language) *multiline* string
    {
      // @media features (it’s here to not duplicate things in AT_RULE_MODE with extra PARENS_MODE overriding):
      className: "attribute",
      begin: i + "\\s*:",
      end: ":",
      returnBegin: !0,
      excludeEnd: !0
    },
    t.IMPORTANT,
    { beginKeywords: "and not" },
    t.FUNCTION_DISPATCH
  );
  const p = s.concat({
    begin: /\{/,
    end: /\}/,
    contains: o
  }), f = {
    beginKeywords: "when",
    endsWithParent: !0,
    contains: [{ beginKeywords: "and not" }].concat(s)
    // using this form to override VALUE’s 'function' match
  }, h = {
    begin: a + "\\s*:",
    returnBegin: !0,
    end: /[;}]/,
    relevance: 0,
    contains: [
      { begin: /-(webkit|moz|ms|o)-/ },
      t.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + Wg.join("|") + ")\\b",
        end: /(?=:)/,
        starts: {
          endsWithParent: !0,
          illegal: "[<=$]",
          relevance: 0,
          contains: s
        }
      }
    ]
  }, m = {
    className: "keyword",
    begin: "@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b",
    starts: {
      end: "[;{}]",
      keywords: u,
      returnEnd: !0,
      contains: s,
      relevance: 0
    }
  }, b = {
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
  }, g = {
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
        begin: a,
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
      l("keyword", "all\\b"),
      l("variable", "@\\{" + i + "\\}"),
      // otherwise it’s identified as tag
      {
        begin: "\\b(" + Kg.join("|") + ")\\b",
        className: "selector-tag"
      },
      t.CSS_NUMBER_MODE,
      l("selector-tag", a, 0),
      l("selector-id", "#" + a),
      l("selector-class", "\\." + a, 0),
      l("selector-tag", "&", 0),
      t.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-pseudo",
        begin: ":(" + Ys.join("|") + ")"
      },
      {
        className: "selector-pseudo",
        begin: ":(:)?(" + Zs.join("|") + ")"
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
      t.FUNCTION_DISPATCH
    ]
  }, x = {
    begin: i + `:(:)?(${n.join("|")})`,
    returnBegin: !0,
    contains: [g]
  };
  return o.push(
    e.C_LINE_COMMENT_MODE,
    e.C_BLOCK_COMMENT_MODE,
    m,
    b,
    x,
    h,
    g,
    f,
    t.FUNCTION_DISPATCH
  ), {
    name: "Less",
    case_insensitive: !0,
    illegal: `[=>'/<($"]`,
    contains: o
  };
}
function Zg(e) {
  const t = "\\[=*\\[", n = "\\]=*\\]", r = {
    begin: t,
    end: n,
    contains: ["self"]
  }, i = [
    e.COMMENT("--(?!" + t + ")", "$"),
    e.COMMENT(
      "--" + t,
      n,
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
        begin: t,
        end: n,
        contains: [r],
        relevance: 5
      }
    ])
  };
}
function Xg(e) {
  const t = {
    className: "variable",
    variants: [
      {
        begin: "\\$\\(" + e.UNDERSCORE_IDENT_RE + "\\)",
        contains: [e.BACKSLASH_ESCAPE]
      },
      { begin: /\$[@%<?\^\+\*]/ }
    ]
  }, n = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      e.BACKSLASH_ESCAPE,
      t
    ]
  }, r = {
    className: "variable",
    begin: /\$\([\w-]+\s/,
    end: /\)/,
    keywords: { built_in: "subst patsubst strip findstring filter filter-out sort word wordlist firstword lastword dir notdir suffix basename addsuffix addprefix join wildcard realpath abspath error warning shell origin flavor foreach if or and call eval file value" },
    contains: [
      t,
      n
      // Added QUOTE_STRING as they can be a part of functions
    ]
  }, i = { begin: "^" + e.UNDERSCORE_IDENT_RE + "\\s*(?=[:+?]?=)" }, a = {
    className: "meta",
    begin: /^\.PHONY:/,
    end: /$/,
    keywords: {
      $pattern: /[\.\w]+/,
      keyword: ".PHONY"
    }
  }, o = {
    className: "section",
    begin: /^[^\s]+:/,
    end: /$/,
    contains: [t]
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
      t,
      n,
      r,
      i,
      a,
      o
    ]
  };
}
function jg(e) {
  const t = e.regex, n = {
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
  }, a = {
    className: "bullet",
    begin: "^[ 	]*([*+-]|(\\d+\\.))(?=\\s+)",
    end: "\\s+",
    excludeEnd: !0
  }, o = {
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
  }, s = /[A-Za-z][A-Za-z0-9+.-]*/, c = {
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
        begin: t.concat(/\[.+?\]\(/, s, /:\/\/.*?\)/),
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
  }, l = {
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
  }, u = {
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
  }, d = e.inherit(l, { contains: [] }), p = e.inherit(u, { contains: [] });
  l.contains.push(p), u.contains.push(d);
  let f = [
    n,
    c
  ];
  return [
    l,
    u,
    d,
    p
  ].forEach((g) => {
    g.contains = g.contains.concat(f);
  }), f = f.concat(l, u), {
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
      n,
      a,
      l,
      u,
      {
        className: "quote",
        begin: "^>\\s+",
        contains: f,
        end: "$"
      },
      i,
      r,
      c,
      o,
      {
        //https://spec.commonmark.org/0.31.2/#entity-references
        scope: "literal",
        match: /&([a-zA-Z0-9]+|#[0-9]{1,7}|#[Xx][0-9a-fA-F]{1,6});/
      }
    ]
  };
}
function Qg(e) {
  const t = {
    className: "built_in",
    begin: "\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+"
  }, n = /[a-zA-Z@][a-zA-Z0-9_]*/, s = {
    "variable.language": [
      "this",
      "super"
    ],
    $pattern: n,
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
  }, c = {
    $pattern: n,
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
      t,
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
        begin: "(" + c.keyword.join("|") + ")\\b",
        end: /(\{|$)/,
        excludeEnd: !0,
        keywords: c,
        contains: [e.UNDERSCORE_TITLE_MODE]
      },
      {
        begin: "\\." + e.UNDERSCORE_IDENT_RE,
        relevance: 0
      }
    ]
  };
}
function Jg(e) {
  const t = e.regex, n = [
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
    keyword: n.join(" ")
  }, a = {
    className: "subst",
    begin: "[$@]\\{",
    end: "\\}",
    keywords: i
  }, o = {
    begin: /->\{/,
    end: /\}/
    // contains defined later
  }, s = {
    scope: "attr",
    match: /\s+:\s*\w+(\s*\(.*?\))?/
  }, c = {
    scope: "variable",
    variants: [
      { begin: /\$\d/ },
      {
        begin: t.concat(
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
  }, l = {
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
  }, u = [
    e.BACKSLASH_ESCAPE,
    a,
    c
  ], d = [
    /!/,
    /\//,
    /\|/,
    /\?/,
    /'/,
    /"/,
    // valid but infrequent and weird
    /#/
    // valid but infrequent and weird
  ], p = (m, b, g = "\\1") => {
    const x = g === "\\1" ? g : t.concat(g, b);
    return t.concat(
      t.concat("(?:", m, ")"),
      b,
      /(?:\\.|[^\\\/])*?/,
      x,
      /(?:\\.|[^\\\/])*?/,
      g,
      r
    );
  }, f = (m, b, g) => t.concat(
    t.concat("(?:", m, ")"),
    b,
    /(?:\\.|[^\\\/])*?/,
    g,
    r
  ), h = [
    c,
    e.HASH_COMMENT_MODE,
    e.COMMENT(
      /^=\w/,
      /=cut/,
      { endsWithParent: !0 }
    ),
    o,
    {
      className: "string",
      contains: u,
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
    l,
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
            { begin: p("s|tr|y", t.either(...d, { capture: !0 })) },
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
            { begin: f("m|qr", t.either(...d, { capture: !0 }), /\1/) },
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
      contains: [e.TITLE_MODE, s, l]
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
  return a.contains = h, o.contains = h, {
    name: "Perl",
    aliases: [
      "pl",
      "pm"
    ],
    keywords: i,
    contains: h
  };
}
function em(e) {
  const t = e.regex, n = /(?![A-Za-z0-9])(?![$])/, r = t.concat(
    /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
    n
  ), i = t.concat(
    /(\\?[A-Z][a-z0-9_\x7f-\xff]+|\\?[A-Z]+(?=[A-Z][a-z0-9_\x7f-\xff])){1,}/,
    n
  ), a = t.concat(
    /[A-Z]+/,
    n
  ), o = {
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
  }, c = {
    scope: "subst",
    variants: [
      { begin: /\$\w+/ },
      {
        begin: /\{\$/,
        end: /\}/
      }
    ]
  }, l = e.inherit(e.APOS_STRING_MODE, { illegal: null }), u = e.inherit(e.QUOTE_STRING_MODE, {
    illegal: null,
    contains: e.QUOTE_STRING_MODE.contains.concat(c)
  }), d = {
    begin: /<<<[ \t]*(?:(\w+)|"(\w+)")\n/,
    end: /[ \t]*(\w+)\b/,
    contains: e.QUOTE_STRING_MODE.contains.concat(c),
    "on:begin": (P, D) => {
      D.data._beginMatch = P[1] || P[2];
    },
    "on:end": (P, D) => {
      D.data._beginMatch !== P[1] && D.ignoreMatch();
    }
  }, p = e.END_SAME_AS_BEGIN({
    begin: /<<<[ \t]*'(\w+)'\n/,
    end: /[ \t]*(\w+)\b/
  }), f = `[ 	
]`, h = {
    scope: "string",
    variants: [
      u,
      l,
      d,
      p
    ]
  }, m = {
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
  }, b = [
    "false",
    "null",
    "true"
  ], g = [
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
  ], x = [
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
  ], C = {
    keyword: g,
    literal: ((P) => {
      const D = [];
      return P.forEach((K) => {
        D.push(K), K.toLowerCase() === K ? D.push(K.toUpperCase()) : D.push(K.toLowerCase());
      }), D;
    })(b),
    built_in: x
  }, T = (P) => P.map((D) => D.replace(/\|\d+$/, "")), k = { variants: [
    {
      match: [
        /new/,
        t.concat(f, "+"),
        // to prevent built ins from being confused as the class constructor call
        t.concat("(?!", T(x).join("\\b|"), "\\b)"),
        i
      ],
      scope: {
        1: "keyword",
        4: "title.class"
      }
    }
  ] }, I = t.concat(r, "\\b(?!\\()"), A = { variants: [
    {
      match: [
        t.concat(
          /::/,
          t.lookahead(/(?!class\b)/)
        ),
        I
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
        t.concat(
          /::/,
          t.lookahead(/(?!class\b)/)
        ),
        I
      ],
      scope: {
        1: "title.class",
        3: "variable.constant"
      }
    },
    {
      match: [
        i,
        t.concat(
          "::",
          t.lookahead(/(?!class\b)/)
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
  ] }, O = {
    scope: "attr",
    match: t.concat(r, t.lookahead(":"), t.lookahead(/(?!::)/))
  }, S = {
    relevance: 0,
    begin: /\(/,
    end: /\)/,
    keywords: C,
    contains: [
      O,
      o,
      A,
      e.C_BLOCK_COMMENT_MODE,
      h,
      m,
      k
    ]
  }, L = {
    relevance: 0,
    match: [
      /\b/,
      // to prevent keywords from being confused as the function title
      t.concat("(?!fn\\b|function\\b|", T(g).join("\\b|"), "|", T(x).join("\\b|"), "\\b)"),
      r,
      t.concat(f, "*"),
      t.lookahead(/(?=\()/)
    ],
    scope: { 3: "title.function.invoke" },
    contains: [S]
  };
  S.contains.push(L);
  const B = [
    O,
    A,
    e.C_BLOCK_COMMENT_MODE,
    h,
    m,
    k
  ], W = {
    begin: t.concat(
      /#\[\s*\\?/,
      t.either(
        i,
        a
      )
    ),
    beginScope: "meta",
    end: /]/,
    endScope: "meta",
    keywords: {
      literal: b,
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
          literal: b,
          keyword: [
            "new",
            "array"
          ]
        },
        contains: [
          "self",
          ...B
        ]
      },
      ...B,
      {
        scope: "meta",
        variants: [
          { match: i },
          { match: a }
        ]
      }
    ]
  };
  return {
    case_insensitive: !1,
    keywords: C,
    contains: [
      W,
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
      o,
      L,
      A,
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
      k,
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
            keywords: C,
            contains: [
              "self",
              W,
              o,
              A,
              e.C_BLOCK_COMMENT_MODE,
              h,
              m
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
      h,
      m
    ]
  };
}
function tm(e) {
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
function nm(e) {
  return {
    name: "Plain text",
    aliases: [
      "text",
      "txt"
    ],
    disableAutodetect: !0
  };
}
function rm(e) {
  const t = e.regex, n = new RegExp("[\\p{XID_Start}_]\\p{XID_Continue}*", "u"), r = [
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
  }, c = {
    className: "meta",
    begin: /^(>>>|\.\.\.) /
  }, l = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: s,
    illegal: /#/
  }, u = {
    begin: /\{\{/,
    relevance: 0
  }, d = {
    className: "string",
    contains: [e.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          c
        ],
        relevance: 10
      },
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          c
        ],
        relevance: 10
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          c,
          u,
          l
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          c,
          u,
          l
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
          u,
          l
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"/,
        end: /"/,
        contains: [
          e.BACKSLASH_ESCAPE,
          u,
          l
        ]
      },
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE
    ]
  }, p = "[0-9](_?[0-9])*", f = `(\\b(${p}))?\\.(${p})|\\b(${p})\\.`, h = `\\b|${r.join("|")}`, m = {
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
        begin: `(\\b(${p})|(${f}))[eE][+-]?(${p})[jJ]?(?=${h})`
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
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${h})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${h})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${h})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${h})`
      },
      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${p})[jJ](?=${h})`
      }
    ]
  }, b = {
    className: "comment",
    begin: t.lookahead(/# type:/),
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
  }, g = {
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
          c,
          m,
          d,
          e.HASH_COMMENT_MODE
        ]
      }
    ]
  };
  return l.contains = [
    d,
    m,
    c
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
      c,
      m,
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
      d,
      b,
      e.HASH_COMMENT_MODE,
      {
        match: [
          /\bdef/,
          /\s+/,
          n
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        },
        contains: [g]
      },
      {
        variants: [
          {
            match: [
              /\bclass/,
              /\s+/,
              n,
              /\s*/,
              /\(\s*/,
              n,
              /\s*\)/
            ]
          },
          {
            match: [
              /\bclass/,
              /\s+/,
              n
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
          m,
          g,
          d
        ]
      }
    ]
  };
}
function im(e) {
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
function om(e) {
  const t = e.regex, n = /(?:(?:[a-zA-Z]|\.[._a-zA-Z])[._a-zA-Z0-9]*)|\.(?!\d)/, r = t.either(
    // Special case: only hexadecimal binary powers can contain fractions
    /0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/,
    // Hexadecimal numbers without fraction and optional binary power
    /0[xX][0-9a-fA-F]+(?:[pP][+-]?\d+)?[Li]?/,
    // Decimal numbers
    /(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?[Li]?/
  ), i = /[=!<>:]=|\|\||&&|:::?|<-|<<-|->>|->|\|>|[-+*\/?!$&|:<=>@^~]|\*\*/, a = t.either(
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
      $pattern: n,
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
              end: t.lookahead(t.either(
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
                  { match: n },
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
              a,
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
          n,
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
        match: a
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
function am(e) {
  const t = e.regex, n = "([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)", r = t.either(
    /\b([A-Z]+[a-z0-9]+)+/,
    // ends in caps
    /\b([A-Z]+[a-z0-9]+)+[A-Z]+/
  ), i = t.concat(r, /(::\w+)*/), o = {
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
  }, c = {
    begin: "#<",
    end: ">"
  }, l = [
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
  ], u = {
    className: "subst",
    begin: /#\{/,
    end: /\}/,
    keywords: o
  }, d = {
    className: "string",
    contains: [
      e.BACKSLASH_ESCAPE,
      u
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
        begin: t.concat(
          /<<[-~]?'?/,
          t.lookahead(/(\w+)(?=\W)[^\n]*\n(?:[^\n]*\n)*?\s*\1\b/)
        ),
        contains: [
          e.END_SAME_AS_BEGIN({
            begin: /(\w+)/,
            end: /(\w+)/,
            contains: [
              e.BACKSLASH_ESCAPE,
              u
            ]
          })
        ]
      }
    ]
  }, p = "[1-9](_?[0-9])*|0", f = "[0-9](_?[0-9])*", h = {
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
  }, m = {
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
        keywords: o
      }
    ]
  }, k = [
    d,
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
      keywords: o
    },
    {
      match: [
        /(include|extend)\s+/,
        i
      ],
      scope: {
        2: "title.class"
      },
      keywords: o
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
        n
      ],
      scope: {
        1: "keyword",
        3: "title.function"
      },
      contains: [
        m
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
        d,
        { begin: n }
      ],
      relevance: 0
    },
    h,
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
      keywords: o
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
            u
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
      ].concat(c, l),
      relevance: 0
    }
  ].concat(c, l);
  u.contains = k, m.contains = k;
  const S = [
    {
      begin: /^\s*=>/,
      starts: {
        end: "$",
        contains: k
      }
    },
    {
      className: "meta.prompt",
      begin: "^(" + "[>?]>" + "|" + "[\\w#]+\\(\\w+\\):\\d+:\\d+[>*]" + "|" + "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>" + ")(?=[ ])",
      starts: {
        end: "$",
        keywords: o,
        contains: k
      }
    }
  ];
  return l.unshift(c), {
    name: "Ruby",
    aliases: [
      "rb",
      "gemspec",
      "podspec",
      "thor",
      "irb"
    ],
    keywords: o,
    illegal: /\/\*/,
    contains: [e.SHEBANG({ binary: "ruby" })].concat(S).concat(l).concat(k)
  };
}
function sm(e) {
  const t = e.regex, n = /(r#)?/, r = t.concat(n, e.UNDERSCORE_IDENT_RE), i = t.concat(n, e.IDENT_RE), a = {
    className: "title.function.invoke",
    relevance: 0,
    begin: t.concat(
      /\b/,
      /(?!let|for|while|if|else|match\b)/,
      i,
      t.lookahead(/\s*\(/)
    )
  }, o = "([ui](8|16|32|64|128|size)|f(32|64))?", s = [
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
  ], c = [
    "true",
    "false",
    "Some",
    "None",
    "Ok",
    "Err"
  ], l = [
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
  ], u = [
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
      type: u,
      keyword: s,
      literal: c,
      built_in: l
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
          { begin: "\\b0b([01_]+)" + o },
          { begin: "\\b0o([0-7_]+)" + o },
          { begin: "\\b0x([A-Fa-f0-9_]+)" + o },
          { begin: "\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)" + o }
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
          built_in: l,
          type: u
        }
      },
      {
        className: "punctuation",
        begin: "->"
      },
      a
    ]
  };
}
const lm = (e) => ({
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
}), cm = [
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
], um = [
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
], dm = [
  ...cm,
  ...um
], fm = [
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
].sort().reverse(), pm = [
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
].sort().reverse(), hm = [
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
].sort().reverse(), gm = [
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
function mm(e) {
  const t = lm(e), n = hm, r = pm, i = "@[a-z-]+", a = "and or not only", s = {
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
      t.CSS_NUMBER_MODE,
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
      t.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-tag",
        begin: "\\b(" + dm.join("|") + ")\\b",
        // was there, before, but why?
        relevance: 0
      },
      {
        className: "selector-pseudo",
        begin: ":(" + r.join("|") + ")"
      },
      {
        className: "selector-pseudo",
        begin: ":(:)?(" + n.join("|") + ")"
      },
      s,
      {
        // pseudo-selector params
        begin: /\(/,
        end: /\)/,
        contains: [t.CSS_NUMBER_MODE]
      },
      t.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + gm.join("|") + ")\\b"
      },
      { begin: "\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b" },
      {
        begin: /:/,
        end: /[;}{]/,
        relevance: 0,
        contains: [
          t.BLOCK_COMMENT,
          s,
          t.HEXCOLOR,
          t.CSS_NUMBER_MODE,
          e.QUOTE_STRING_MODE,
          e.APOS_STRING_MODE,
          t.IMPORTANT,
          t.FUNCTION_DISPATCH
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
          keyword: a,
          attribute: fm.join(" ")
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
          t.HEXCOLOR,
          t.CSS_NUMBER_MODE
        ]
      },
      t.FUNCTION_DISPATCH
    ]
  };
}
function bm(e) {
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
function ym(e) {
  const t = e.regex, n = e.COMMENT("--", "$"), r = {
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
  }, a = [
    "true",
    "false",
    // Not sure it's correct to call NULL literal, and clauses like IS [NOT] NULL look strange that way.
    // "null",
    "unknown"
  ], o = [
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
  ], c = [
    "add",
    "asc",
    "collation",
    "desc",
    "final",
    "first",
    "last",
    "view"
  ], l = [
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
  ], u = [
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
  ], d = [
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
  ], f = u, h = [
    ...l,
    ...c
  ].filter((T) => !u.includes(T)), m = {
    scope: "variable",
    match: /@[a-z0-9][a-z0-9_]*/
  }, b = {
    scope: "operator",
    match: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
    relevance: 0
  }, g = {
    match: t.concat(/\b/, t.either(...f), /\s*\(/),
    relevance: 0,
    keywords: { built_in: f }
  };
  function x(T) {
    return t.concat(
      /\b/,
      t.either(...T.map((k) => k.replace(/\s+/, "\\s+"))),
      /\b/
    );
  }
  const _ = {
    scope: "keyword",
    match: x(p),
    relevance: 0
  };
  function C(T, {
    exceptions: k,
    when: I
  } = {}) {
    const A = I;
    return k = k || [], T.map((O) => O.match(/\|\d+$/) || k.includes(O) ? O : A(O) ? `${O}|0` : O);
  }
  return {
    name: "SQL",
    case_insensitive: !0,
    // does not include {} or HTML tags `</`
    illegal: /[{}]|<\//,
    keywords: {
      $pattern: /\b[\w\.]+/,
      keyword: C(h, { when: (T) => T.length < 3 }),
      literal: a,
      type: s,
      built_in: d
    },
    contains: [
      {
        scope: "type",
        match: x(o)
      },
      _,
      g,
      m,
      r,
      i,
      e.C_NUMBER_MODE,
      e.C_BLOCK_COMMENT_MODE,
      n,
      b
    ]
  };
}
function Xs(e) {
  return e ? typeof e == "string" ? e : e.source : null;
}
function _n(e) {
  return ge("(?=", e, ")");
}
function ge(...e) {
  return e.map((n) => Xs(n)).join("");
}
function Em(e) {
  const t = e[e.length - 1];
  return typeof t == "object" && t.constructor === Object ? (e.splice(e.length - 1, 1), t) : {};
}
function Ue(...e) {
  return "(" + (Em(e).capture ? "" : "?:") + e.map((r) => Xs(r)).join("|") + ")";
}
const Xi = (e) => ge(
  /\b/,
  e,
  /\w$/.test(e) ? /\b/ : /\B/
), _m = [
  "Protocol",
  // contextual
  "Type"
  // contextual
].map(Xi), ya = [
  "init",
  "self"
].map(Xi), wm = [
  "Any",
  "Self"
], Jr = [
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
], Ea = [
  "false",
  "nil",
  "true"
], xm = [
  "assignment",
  "associativity",
  "higherThan",
  "left",
  "lowerThan",
  "none",
  "right"
], km = [
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
], _a = [
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
], js = Ue(
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
), Qs = Ue(
  js,
  /[\u0300-\u036F]/,
  /[\u1DC0-\u1DFF]/,
  /[\u20D0-\u20FF]/,
  /[\uFE00-\uFE0F]/,
  /[\uFE20-\uFE2F]/
  // TODO: The following characters are also allowed, but the regex isn't supported yet.
  // /[\u{E0100}-\u{E01EF}]/u
), ei = ge(js, Qs, "*"), Js = Ue(
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
), ur = Ue(
  Js,
  /\d/,
  /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/
), dt = ge(Js, ur, "*"), er = ge(/[A-Z]/, ur, "*"), vm = [
  "attached",
  "autoclosure",
  ge(/convention\(/, Ue("swift", "block", "c"), /\)/),
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
  ge(/objc\(/, dt, /\)/),
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
], Sm = [
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
function Nm(e) {
  const t = {
    match: /\s+/,
    relevance: 0
  }, n = e.COMMENT(
    "/\\*",
    "\\*/",
    { contains: ["self"] }
  ), r = [
    e.C_LINE_COMMENT_MODE,
    n
  ], i = {
    match: [
      /\./,
      Ue(..._m, ...ya)
    ],
    className: { 2: "keyword" }
  }, a = {
    // Consume .keyword to prevent highlighting properties and methods as keywords.
    match: ge(/\./, Ue(...Jr)),
    relevance: 0
  }, o = Jr.filter((de) => typeof de == "string").concat(["_|0"]), s = Jr.filter((de) => typeof de != "string").concat(wm).map(Xi), c = { variants: [
    {
      className: "keyword",
      match: Ue(...s, ...ya)
    }
  ] }, l = {
    $pattern: Ue(
      /\b\w+/,
      // regular keywords
      /#\w+/
      // number keywords
    ),
    keyword: o.concat(km),
    literal: Ea
  }, u = [
    i,
    a,
    c
  ], d = {
    // Consume .built_in to prevent highlighting properties and methods.
    match: ge(/\./, Ue(..._a)),
    relevance: 0
  }, p = {
    className: "built_in",
    match: ge(/\b/, Ue(..._a), /(?=\()/)
  }, f = [
    d,
    p
  ], h = {
    // Prevent -> from being highlighting as an operator.
    match: /->/,
    relevance: 0
  }, m = {
    className: "operator",
    relevance: 0,
    variants: [
      { match: ei },
      {
        // dot-operator: only operators that start with a dot are allowed to use dots as
        // characters (..., ...<, .*, etc). So there rule here is: a dot followed by one or more
        // characters that may also include dots.
        match: `\\.(\\.|${Qs})+`
      }
    ]
  }, b = [
    h,
    m
  ], g = "([0-9]_*)+", x = "([0-9a-fA-F]_*)+", _ = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal floating-point-literal (subsumes decimal-literal)
      { match: `\\b(${g})(\\.(${g}))?([eE][+-]?(${g}))?\\b` },
      // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
      { match: `\\b0x(${x})(\\.(${x}))?([pP][+-]?(${g}))?\\b` },
      // octal-literal
      { match: /\b0o([0-7]_*)+\b/ },
      // binary-literal
      { match: /\b0b([01]_*)+\b/ }
    ]
  }, C = (de = "") => ({
    className: "subst",
    variants: [
      { match: ge(/\\/, de, /[0\\tnr"']/) },
      { match: ge(/\\/, de, /u\{[0-9a-fA-F]{1,8}\}/) }
    ]
  }), T = (de = "") => ({
    className: "subst",
    match: ge(/\\/, de, /[\t ]*(?:[\r\n]|\r\n)/)
  }), k = (de = "") => ({
    className: "subst",
    label: "interpol",
    begin: ge(/\\/, de, /\(/),
    end: /\)/
  }), I = (de = "") => ({
    begin: ge(de, /"""/),
    end: ge(/"""/, de),
    contains: [
      C(de),
      T(de),
      k(de)
    ]
  }), A = (de = "") => ({
    begin: ge(de, /"/),
    end: ge(/"/, de),
    contains: [
      C(de),
      k(de)
    ]
  }), O = {
    className: "string",
    variants: [
      I(),
      I("#"),
      I("##"),
      I("###"),
      A(),
      A("#"),
      A("##"),
      A("###")
    ]
  }, S = [
    e.BACKSLASH_ESCAPE,
    {
      begin: /\[/,
      end: /\]/,
      relevance: 0,
      contains: [e.BACKSLASH_ESCAPE]
    }
  ], L = {
    begin: /\/[^\s](?=[^/\n]*\/)/,
    end: /\//,
    contains: S
  }, B = (de) => {
    const bt = ge(de, /\//), yt = ge(/\//, de);
    return {
      begin: bt,
      end: yt,
      contains: [
        ...S,
        {
          scope: "comment",
          begin: `#(?!.*${yt})`,
          end: /$/
        }
      ]
    };
  }, W = {
    scope: "regexp",
    variants: [
      B("###"),
      B("##"),
      B("#"),
      L
    ]
  }, P = { match: ge(/`/, dt, /`/) }, D = {
    className: "variable",
    match: /\$\d+/
  }, K = {
    className: "variable",
    match: `\\$${ur}+`
  }, Q = [
    P,
    D,
    K
  ], $ = {
    match: /(@|#(un)?)available/,
    scope: "keyword",
    starts: { contains: [
      {
        begin: /\(/,
        end: /\)/,
        keywords: Sm,
        contains: [
          ...b,
          _,
          O
        ]
      }
    ] }
  }, ne = {
    scope: "keyword",
    match: ge(/@/, Ue(...vm), _n(Ue(/\(/, /\s+/)))
  }, y = {
    scope: "meta",
    match: ge(/@/, dt)
  }, ue = [
    $,
    ne,
    y
  ], fe = {
    match: _n(/\b[A-Z]/),
    relevance: 0,
    contains: [
      {
        // Common Apple frameworks, for relevance boost
        className: "type",
        match: ge(/(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)/, ur, "+")
      },
      {
        // Type identifier
        className: "type",
        match: er,
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
        match: ge(/\s+&\s+/, _n(er)),
        relevance: 0
      }
    ]
  }, w = {
    begin: /</,
    end: />/,
    keywords: l,
    contains: [
      ...r,
      ...u,
      ...ue,
      h,
      fe
    ]
  };
  fe.contains.push(w);
  const Re = {
    match: ge(dt, /\s*:/),
    keywords: "_|0",
    relevance: 0
  }, Ge = {
    begin: /\(/,
    end: /\)/,
    relevance: 0,
    keywords: l,
    contains: [
      "self",
      Re,
      ...r,
      W,
      ...u,
      ...f,
      ...b,
      _,
      O,
      ...Q,
      ...ue,
      fe
    ]
  }, _e = {
    begin: /</,
    end: />/,
    keywords: "repeat each",
    contains: [
      ...r,
      fe
    ]
  }, Fe = {
    begin: Ue(
      _n(ge(dt, /\s*:/)),
      _n(ge(dt, /\s+/, dt, /\s*:/))
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
        match: dt
      }
    ]
  }, Ie = {
    begin: /\(/,
    end: /\)/,
    keywords: l,
    contains: [
      Fe,
      ...r,
      ...u,
      ...b,
      _,
      O,
      ...ue,
      fe,
      Ge
    ],
    endsParent: !0,
    illegal: /["']/
  }, et = {
    match: [
      /(func|macro)/,
      /\s+/,
      Ue(P.match, dt, ei)
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      _e,
      Ie,
      t
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
      _e,
      Ie,
      t
    ],
    illegal: /\[|%/
  }, st = {
    match: [
      /operator/,
      /\s+/,
      ei
    ],
    className: {
      1: "keyword",
      3: "title"
    }
  }, Pt = {
    begin: [
      /precedencegroup/,
      /\s+/,
      er
    ],
    className: {
      1: "keyword",
      3: "title"
    },
    contains: [fe],
    keywords: [
      ...xm,
      ...Ea
    ],
    end: /}/
  }, lt = {
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
  }, pn = {
    match: [
      /class\b/,
      /\s+/,
      /var\b/
    ],
    scope: {
      1: "keyword",
      3: "keyword"
    }
  }, Vt = {
    begin: [
      /(struct|protocol|class|extension|enum|actor)/,
      /\s+/,
      dt,
      /\s*/
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    },
    keywords: l,
    contains: [
      _e,
      ...u,
      {
        begin: /:/,
        end: /\{/,
        keywords: l,
        contains: [
          {
            scope: "title.class.inherited",
            match: er
          },
          ...u
        ],
        relevance: 0
      }
    ]
  };
  for (const de of O.variants) {
    const bt = de.contains.find((Yt) => Yt.label === "interpol");
    bt.keywords = l;
    const yt = [
      ...u,
      ...f,
      ...b,
      _,
      O,
      ...Q
    ];
    bt.contains = [
      ...yt,
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          "self",
          ...yt
        ]
      }
    ];
  }
  return {
    name: "Swift",
    keywords: l,
    contains: [
      ...r,
      et,
      Be,
      lt,
      pn,
      Vt,
      st,
      Pt,
      {
        beginKeywords: "import",
        end: /$/,
        contains: [...r],
        relevance: 0
      },
      W,
      ...u,
      ...f,
      ...b,
      _,
      O,
      ...Q,
      ...ue,
      fe,
      Ge
    ]
  };
}
const dr = "[A-Za-z$_][0-9A-Za-z$_]*", el = [
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
], tl = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
], nl = [
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
], rl = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
], il = [
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
], ol = [
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
], al = [].concat(
  il,
  nl,
  rl
);
function Cm(e) {
  const t = e.regex, n = ($, { after: ne }) => {
    const y = "</" + $[0].slice(1);
    return $.input.indexOf(y, ne) !== -1;
  }, r = dr, i = {
    begin: "<>",
    end: "</>"
  }, a = /<[A-Za-z0-9\\._:-]+\s*\/>/, o = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: ($, ne) => {
      const y = $[0].length + $.index, ue = $.input[y];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        ue === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        ue === ","
      ) {
        ne.ignoreMatch();
        return;
      }
      ue === ">" && (n($, { after: y }) || ne.ignoreMatch());
      let fe;
      const w = $.input.substring(y);
      if (fe = w.match(/^\s*=/)) {
        ne.ignoreMatch();
        return;
      }
      if ((fe = w.match(/^\s+extends\s+/)) && fe.index === 0) {
        ne.ignoreMatch();
        return;
      }
    }
  }, s = {
    $pattern: dr,
    keyword: el,
    literal: tl,
    built_in: al,
    "variable.language": ol
  }, c = "[0-9](_?[0-9])*", l = `\\.(${c})`, u = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*", d = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${u})((${l})|\\.)?|(${l}))[eE][+-]?(${c})\\b` },
      { begin: `\\b(${u})\\b((${l})\\b|\\.)?|(${l})\\b` },
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
  }, h = {
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
  }, m = {
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
  }, b = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      e.BACKSLASH_ESCAPE,
      p
    ]
  }, x = {
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
  }, _ = [
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    f,
    h,
    m,
    b,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    d
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  p.contains = _.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: s,
    contains: [
      "self"
    ].concat(_)
  });
  const C = [].concat(x, p.contains), T = C.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: s,
      contains: ["self"].concat(C)
    }
  ]), k = {
    className: "params",
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/,
    // to match the parms with
    end: /\)/,
    excludeBegin: !0,
    excludeEnd: !0,
    keywords: s,
    contains: T
  }, I = {
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
          t.concat(r, "(", t.concat(/\./, r), ")*")
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
  }, A = {
    relevance: 0,
    match: t.either(
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
        ...nl,
        ...rl
      ]
    }
  }, O = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  }, S = {
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
    contains: [k],
    illegal: /%/
  }, L = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function B($) {
    return t.concat("(?!", $.join("|"), ")");
  }
  const W = {
    match: t.concat(
      /\b/,
      B([
        ...il,
        "super",
        "import"
      ].map(($) => `${$}\\s*\\(`)),
      r,
      t.lookahead(/\s*\(/)
    ),
    className: "title.function",
    relevance: 0
  }, P = {
    begin: t.concat(/\./, t.lookahead(
      t.concat(r, /(?![0-9A-Za-z$_(])/)
    )),
    end: r,
    excludeBegin: !0,
    keywords: "prototype",
    className: "property",
    relevance: 0
  }, D = {
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
      k
    ]
  }, K = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + e.UNDERSCORE_IDENT_RE + ")\\s*=>", Q = {
    match: [
      /const|var|let/,
      /\s+/,
      r,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      t.lookahead(K)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      k
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: s,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS: T, CLASS_REFERENCE: A },
    illegal: /#(?![$_A-z])/,
    contains: [
      e.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      O,
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      f,
      h,
      m,
      b,
      x,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      d,
      A,
      {
        scope: "attr",
        match: r + t.lookahead(":"),
        relevance: 0
      },
      Q,
      {
        // "value" container
        begin: "(" + e.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          x,
          e.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: K,
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
                    contains: T
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
              { match: a },
              {
                begin: o.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": o.isTrulyOpeningTag,
                end: o.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: o.begin,
                end: o.end,
                skip: !0,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      S,
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
          k,
          e.inherit(e.TITLE_MODE, { begin: r, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      P,
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
        contains: [k]
      },
      W,
      L,
      I,
      D,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function Tm(e) {
  const t = e.regex, n = Cm(e), r = dr, i = [
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
  ], a = {
    begin: [
      /namespace/,
      /\s+/,
      e.IDENT_RE
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    }
  }, o = {
    beginKeywords: "interface",
    end: /\{/,
    excludeEnd: !0,
    keywords: {
      keyword: "interface extends",
      built_in: i
    },
    contains: [n.exports.CLASS_REFERENCE]
  }, s = {
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use strict['"]/
  }, c = [
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
  ], l = {
    $pattern: dr,
    keyword: el.concat(c),
    literal: tl,
    built_in: al.concat(i),
    "variable.language": ol
  }, u = {
    className: "meta",
    begin: "@" + r
  }, d = (m, b, g) => {
    const x = m.contains.findIndex((_) => _.label === b);
    if (x === -1)
      throw new Error("can not find mode to replace");
    m.contains.splice(x, 1, g);
  };
  Object.assign(n.keywords, l), n.exports.PARAMS_CONTAINS.push(u);
  const p = n.contains.find((m) => m.scope === "attr"), f = Object.assign(
    {},
    p,
    { match: t.concat(r, t.lookahead(/\s*\?:/)) }
  );
  n.exports.PARAMS_CONTAINS.push([
    n.exports.CLASS_REFERENCE,
    // class reference for highlighting the params types
    p,
    // highlight the params key
    f
    // Added for optional property assignment highlighting
  ]), n.contains = n.contains.concat([
    u,
    a,
    o,
    f
    // Added for optional property assignment highlighting
  ]), d(n, "shebang", e.SHEBANG()), d(n, "use_strict", s);
  const h = n.contains.find((m) => m.label === "func.def");
  return h.relevance = 0, Object.assign(n, {
    name: "TypeScript",
    aliases: [
      "ts",
      "tsx",
      "mts",
      "cts"
    ]
  }), n;
}
function Am(e) {
  const t = e.regex, n = {
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
  }, i = /\d{1,2}\/\d{1,2}\/\d{4}/, a = /\d{4}-\d{1,2}-\d{1,2}/, o = /(\d|1[012])(:\d+){0,2} *(AM|PM)/, s = /\d{1,2}(:\d{1,2}){1,2}/, c = {
    className: "literal",
    variants: [
      {
        // #YYYY-MM-DD# (ISO-Date) or #M/D/YYYY# (US-Date)
        begin: t.concat(/# */, t.either(a, i), / *#/)
      },
      {
        // #H:mm[:ss]# (24h Time)
        begin: t.concat(/# */, s, / *#/)
      },
      {
        // #h[:mm[:ss]] A# (12h Time)
        begin: t.concat(/# */, o, / *#/)
      },
      {
        // date plus time
        begin: t.concat(
          /# */,
          t.either(a, i),
          / +/,
          t.either(o, s),
          / *#/
        )
      }
    ]
  }, l = {
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
  }, u = {
    className: "label",
    begin: /^\w+:/
  }, d = e.COMMENT(/'''/, /$/, { contains: [
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
      n,
      r,
      c,
      l,
      u,
      d,
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
function Rm(e) {
  e.regex;
  const t = e.COMMENT(/\(;/, /;\)/);
  t.contains.push("self");
  const n = e.COMMENT(/;;/, /$/), r = [
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
  }, a = {
    className: "variable",
    begin: /\$[\w_]+/
  }, o = {
    match: /(\((?!;)|\))+/,
    className: "punctuation",
    relevance: 0
  }, s = {
    className: "number",
    relevance: 0,
    // borrowed from Prism, TODO: split out into variants
    match: /[+-]?\b(?:\d(?:_?\d)*(?:\.\d(?:_?\d)*)?(?:[eE][+-]?\d(?:_?\d)*)?|0x[\da-fA-F](?:_?[\da-fA-F])*(?:\.[\da-fA-F](?:_?[\da-fA-D])*)?(?:[pP][+-]?\d(?:_?\d)*)?)\b|\binf\b|\bnan(?::0x[\da-fA-F](?:_?[\da-fA-D])*)?\b/
  }, c = {
    // look-ahead prevents us from gobbling up opcodes
    match: /(i32|i64|f32|f64)(?!\.)/,
    className: "type"
  }, l = {
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
      n,
      t,
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
      a,
      o,
      i,
      e.QUOTE_STRING_MODE,
      c,
      l,
      s
    ]
  };
}
function Om(e) {
  const t = e.regex, n = t.concat(/[\p{L}_]/u, t.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u), r = /[\p{L}0-9._:-]+/u, i = {
    className: "symbol",
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
  }, a = {
    begin: /\s/,
    contains: [
      {
        className: "keyword",
        begin: /#?[a-z_][a-z1-9_-]+/,
        illegal: /\n/
      }
    ]
  }, o = e.inherit(a, {
    begin: /\(/,
    end: /\)/
  }), s = e.inherit(e.APOS_STRING_MODE, { className: "string" }), c = e.inherit(e.QUOTE_STRING_MODE, { className: "string" }), l = {
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
          a,
          c,
          s,
          o,
          {
            begin: /\[/,
            end: /\]/,
            contains: [
              {
                className: "meta",
                begin: /<![a-z]/,
                end: />/,
                contains: [
                  a,
                  o,
                  c,
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
              c
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
        contains: [l],
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
        contains: [l],
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
        begin: t.concat(
          /</,
          t.lookahead(t.concat(
            n,
            // <tag/>
            // <tag>
            // <tag ...
            t.either(/\/>/, />/, /\s/)
          ))
        ),
        end: /\/?>/,
        contains: [
          {
            className: "name",
            begin: n,
            relevance: 0,
            starts: l
          }
        ]
      },
      // close tag
      {
        className: "tag",
        begin: t.concat(
          /<\//,
          t.lookahead(t.concat(
            n,
            />/
          ))
        ),
        contains: [
          {
            className: "name",
            begin: n,
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
function Im(e) {
  const t = "true false yes no null", n = "[\\w#;/?:@&=+$,.~*'()[\\]]+", r = {
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
  }, a = {
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
  }, o = {
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
  }, s = e.inherit(o, { variants: [
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
    keywords: t,
    relevance: 0
  }, h = {
    begin: /\{/,
    end: /\}/,
    contains: [f],
    illegal: "\\n",
    relevance: 0
  }, m = {
    begin: "\\[",
    end: "\\]",
    contains: [f],
    illegal: "\\n",
    relevance: 0
  }, b = [
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
      begin: "!\\w+!" + n
    },
    // https://yaml.org/spec/1.2/spec.html#id2784064
    {
      // verbatim tags
      className: "type",
      begin: "!<" + n + ">"
    },
    {
      // primary tags
      className: "type",
      begin: "!" + n
    },
    {
      // secondary tags
      className: "type",
      begin: "!!" + n
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
      beginKeywords: t,
      keywords: { literal: t }
    },
    p,
    // numbers are any valid C-style number that
    // sit isolated from other words
    {
      className: "number",
      begin: e.C_NUMBER_RE + "\\b",
      relevance: 0
    },
    h,
    m,
    a,
    o
  ], g = [...b];
  return g.pop(), g.push(s), f.contains = g, {
    name: "YAML",
    case_insensitive: !0,
    aliases: ["yml"],
    contains: b
  };
}
const Mm = {
  arduino: hg,
  bash: gg,
  c: mg,
  cpp: bg,
  csharp: yg,
  css: Cg,
  diff: Tg,
  go: Ag,
  graphql: Rg,
  ini: Og,
  java: Ig,
  javascript: Fg,
  json: Bg,
  kotlin: Ug,
  less: Yg,
  lua: Zg,
  makefile: Xg,
  markdown: jg,
  objectivec: Qg,
  perl: Jg,
  php: em,
  "php-template": tm,
  plaintext: nm,
  python: rm,
  "python-repl": im,
  r: om,
  ruby: am,
  rust: sm,
  scss: mm,
  shell: bm,
  sql: ym,
  swift: Nm,
  typescript: Tm,
  vbnet: Am,
  wasm: Rm,
  xml: Om,
  yaml: Im
};
var ti, wa;
function Dm() {
  if (wa) return ti;
  wa = 1;
  function e(E) {
    return E instanceof Map ? E.clear = E.delete = E.set = function() {
      throw new Error("map is read-only");
    } : E instanceof Set && (E.add = E.clear = E.delete = function() {
      throw new Error("set is read-only");
    }), Object.freeze(E), Object.getOwnPropertyNames(E).forEach((M) => {
      const H = E[M], re = typeof H;
      (re === "object" || re === "function") && !Object.isFrozen(H) && e(H);
    }), E;
  }
  class t {
    /**
     * @param {CompiledMode} mode
     */
    constructor(M) {
      M.data === void 0 && (M.data = {}), this.data = M.data, this.isMatchIgnored = !1;
    }
    ignoreMatch() {
      this.isMatchIgnored = !0;
    }
  }
  function n(E) {
    return E.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  }
  function r(E, ...M) {
    const H = /* @__PURE__ */ Object.create(null);
    for (const re in E)
      H[re] = E[re];
    return M.forEach(function(re) {
      for (const xe in re)
        H[xe] = re[xe];
    }), /** @type {T} */
    H;
  }
  const i = "</span>", a = (E) => !!E.scope, o = (E, { prefix: M }) => {
    if (E.startsWith("language:"))
      return E.replace("language:", "language-");
    if (E.includes(".")) {
      const H = E.split(".");
      return [
        `${M}${H.shift()}`,
        ...H.map((re, xe) => `${re}${"_".repeat(xe + 1)}`)
      ].join(" ");
    }
    return `${M}${E}`;
  };
  class s {
    /**
     * Creates a new HTMLRenderer
     *
     * @param {Tree} parseTree - the parse tree (must support `walk` API)
     * @param {{classPrefix: string}} options
     */
    constructor(M, H) {
      this.buffer = "", this.classPrefix = H.classPrefix, M.walk(this);
    }
    /**
     * Adds texts to the output stream
     *
     * @param {string} text */
    addText(M) {
      this.buffer += n(M);
    }
    /**
     * Adds a node open to the output stream (if needed)
     *
     * @param {Node} node */
    openNode(M) {
      if (!a(M)) return;
      const H = o(
        M.scope,
        { prefix: this.classPrefix }
      );
      this.span(H);
    }
    /**
     * Adds a node close to the output stream (if needed)
     *
     * @param {Node} node */
    closeNode(M) {
      a(M) && (this.buffer += i);
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
    span(M) {
      this.buffer += `<span class="${M}">`;
    }
  }
  const c = (E = {}) => {
    const M = { children: [] };
    return Object.assign(M, E), M;
  };
  class l {
    constructor() {
      this.rootNode = c(), this.stack = [this.rootNode];
    }
    get top() {
      return this.stack[this.stack.length - 1];
    }
    get root() {
      return this.rootNode;
    }
    /** @param {Node} node */
    add(M) {
      this.top.children.push(M);
    }
    /** @param {string} scope */
    openNode(M) {
      const H = c({ scope: M });
      this.add(H), this.stack.push(H);
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
    walk(M) {
      return this.constructor._walk(M, this.rootNode);
    }
    /**
     * @param {Renderer} builder
     * @param {Node} node
     */
    static _walk(M, H) {
      return typeof H == "string" ? M.addText(H) : H.children && (M.openNode(H), H.children.forEach((re) => this._walk(M, re)), M.closeNode(H)), M;
    }
    /**
     * @param {Node} node
     */
    static _collapse(M) {
      typeof M != "string" && M.children && (M.children.every((H) => typeof H == "string") ? M.children = [M.children.join("")] : M.children.forEach((H) => {
        l._collapse(H);
      }));
    }
  }
  class u extends l {
    /**
     * @param {*} options
     */
    constructor(M) {
      super(), this.options = M;
    }
    /**
     * @param {string} text
     */
    addText(M) {
      M !== "" && this.add(M);
    }
    /** @param {string} scope */
    startScope(M) {
      this.openNode(M);
    }
    endScope() {
      this.closeNode();
    }
    /**
     * @param {Emitter & {root: DataNode}} emitter
     * @param {string} name
     */
    __addSublanguage(M, H) {
      const re = M.root;
      H && (re.scope = `language:${H}`), this.add(re);
    }
    toHTML() {
      return new s(this, this.options).value();
    }
    finalize() {
      return this.closeAllNodes(), !0;
    }
  }
  function d(E) {
    return E ? typeof E == "string" ? E : E.source : null;
  }
  function p(E) {
    return m("(?=", E, ")");
  }
  function f(E) {
    return m("(?:", E, ")*");
  }
  function h(E) {
    return m("(?:", E, ")?");
  }
  function m(...E) {
    return E.map((H) => d(H)).join("");
  }
  function b(E) {
    const M = E[E.length - 1];
    return typeof M == "object" && M.constructor === Object ? (E.splice(E.length - 1, 1), M) : {};
  }
  function g(...E) {
    return "(" + (b(E).capture ? "" : "?:") + E.map((re) => d(re)).join("|") + ")";
  }
  function x(E) {
    return new RegExp(E.toString() + "|").exec("").length - 1;
  }
  function _(E, M) {
    const H = E && E.exec(M);
    return H && H.index === 0;
  }
  const C = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
  function T(E, { joinWith: M }) {
    let H = 0;
    return E.map((re) => {
      H += 1;
      const xe = H;
      let ke = d(re), V = "";
      for (; ke.length > 0; ) {
        const q = C.exec(ke);
        if (!q) {
          V += ke;
          break;
        }
        V += ke.substring(0, q.index), ke = ke.substring(q.index + q[0].length), q[0][0] === "\\" && q[1] ? V += "\\" + String(Number(q[1]) + xe) : (V += q[0], q[0] === "(" && H++);
      }
      return V;
    }).map((re) => `(${re})`).join(M);
  }
  const k = /\b\B/, I = "[a-zA-Z]\\w*", A = "[a-zA-Z_]\\w*", O = "\\b\\d+(\\.\\d+)?", S = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", L = "\\b(0b[01]+)", B = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", W = (E = {}) => {
    const M = /^#![ ]*\//;
    return E.binary && (E.begin = m(
      M,
      /.*\b/,
      E.binary,
      /\b.*/
    )), r({
      scope: "meta",
      begin: M,
      end: /$/,
      relevance: 0,
      /** @type {ModeCallback} */
      "on:begin": (H, re) => {
        H.index !== 0 && re.ignoreMatch();
      }
    }, E);
  }, P = {
    begin: "\\\\[\\s\\S]",
    relevance: 0
  }, D = {
    scope: "string",
    begin: "'",
    end: "'",
    illegal: "\\n",
    contains: [P]
  }, K = {
    scope: "string",
    begin: '"',
    end: '"',
    illegal: "\\n",
    contains: [P]
  }, Q = {
    begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
  }, $ = function(E, M, H = {}) {
    const re = r(
      {
        scope: "comment",
        begin: E,
        end: M,
        contains: []
      },
      H
    );
    re.contains.push({
      scope: "doctag",
      // hack to avoid the space from being included. the space is necessary to
      // match here to prevent the plain text rule below from gobbling up doctags
      begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
      end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
      excludeBegin: !0,
      relevance: 0
    });
    const xe = g(
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
    return re.contains.push(
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
        begin: m(
          /[ ]+/,
          // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
          "(",
          xe,
          /[.]?[:]?([.][ ]|[ ])/,
          "){3}"
        )
        // look for 3 words in a row
      }
    ), re;
  }, ne = $("//", "$"), y = $("/\\*", "\\*/"), ue = $("#", "$"), fe = {
    scope: "number",
    begin: O,
    relevance: 0
  }, w = {
    scope: "number",
    begin: S,
    relevance: 0
  }, Re = {
    scope: "number",
    begin: L,
    relevance: 0
  }, Ge = {
    scope: "regexp",
    begin: /\/(?=[^/\n]*\/)/,
    end: /\/[gimuy]*/,
    contains: [
      P,
      {
        begin: /\[/,
        end: /\]/,
        relevance: 0,
        contains: [P]
      }
    ]
  }, _e = {
    scope: "title",
    begin: I,
    relevance: 0
  }, Fe = {
    scope: "title",
    begin: A,
    relevance: 0
  }, Ie = {
    // excludes method names from keyword processing
    begin: "\\.\\s*" + A,
    relevance: 0
  };
  var Be = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    APOS_STRING_MODE: D,
    BACKSLASH_ESCAPE: P,
    BINARY_NUMBER_MODE: Re,
    BINARY_NUMBER_RE: L,
    COMMENT: $,
    C_BLOCK_COMMENT_MODE: y,
    C_LINE_COMMENT_MODE: ne,
    C_NUMBER_MODE: w,
    C_NUMBER_RE: S,
    END_SAME_AS_BEGIN: function(E) {
      return Object.assign(
        E,
        {
          /** @type {ModeCallback} */
          "on:begin": (M, H) => {
            H.data._beginMatch = M[1];
          },
          /** @type {ModeCallback} */
          "on:end": (M, H) => {
            H.data._beginMatch !== M[1] && H.ignoreMatch();
          }
        }
      );
    },
    HASH_COMMENT_MODE: ue,
    IDENT_RE: I,
    MATCH_NOTHING_RE: k,
    METHOD_GUARD: Ie,
    NUMBER_MODE: fe,
    NUMBER_RE: O,
    PHRASAL_WORDS_MODE: Q,
    QUOTE_STRING_MODE: K,
    REGEXP_MODE: Ge,
    RE_STARTERS_RE: B,
    SHEBANG: W,
    TITLE_MODE: _e,
    UNDERSCORE_IDENT_RE: A,
    UNDERSCORE_TITLE_MODE: Fe
  });
  function st(E, M) {
    E.input[E.index - 1] === "." && M.ignoreMatch();
  }
  function Pt(E, M) {
    E.className !== void 0 && (E.scope = E.className, delete E.className);
  }
  function lt(E, M) {
    M && E.beginKeywords && (E.begin = "\\b(" + E.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", E.__beforeBegin = st, E.keywords = E.keywords || E.beginKeywords, delete E.beginKeywords, E.relevance === void 0 && (E.relevance = 0));
  }
  function pn(E, M) {
    Array.isArray(E.illegal) && (E.illegal = g(...E.illegal));
  }
  function Vt(E, M) {
    if (E.match) {
      if (E.begin || E.end) throw new Error("begin & end are not supported with match");
      E.begin = E.match, delete E.match;
    }
  }
  function de(E, M) {
    E.relevance === void 0 && (E.relevance = 1);
  }
  const bt = (E, M) => {
    if (!E.beforeMatch) return;
    if (E.starts) throw new Error("beforeMatch cannot be used with starts");
    const H = Object.assign({}, E);
    Object.keys(E).forEach((re) => {
      delete E[re];
    }), E.keywords = H.keywords, E.begin = m(H.beforeMatch, p(H.begin)), E.starts = {
      relevance: 0,
      contains: [
        Object.assign(H, { endsParent: !0 })
      ]
    }, E.relevance = 0, delete H.beforeMatch;
  }, yt = [
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
  ], Yt = "keyword";
  function hn(E, M, H = Yt) {
    const re = /* @__PURE__ */ Object.create(null);
    return typeof E == "string" ? xe(H, E.split(" ")) : Array.isArray(E) ? xe(H, E) : Object.keys(E).forEach(function(ke) {
      Object.assign(
        re,
        hn(E[ke], M, ke)
      );
    }), re;
    function xe(ke, V) {
      M && (V = V.map((q) => q.toLowerCase())), V.forEach(function(q) {
        const ee = q.split("|");
        re[ee[0]] = [ke, Ir(ee[0], ee[1])];
      });
    }
  }
  function Ir(E, M) {
    return M ? Number(M) : Mr(E) ? 0 : 1;
  }
  function Mr(E) {
    return yt.includes(E.toLowerCase());
  }
  const Un = {}, Et = (E) => {
    console.error(E);
  }, $n = (E, ...M) => {
    console.log(`WARN: ${E}`, ...M);
  }, R = (E, M) => {
    Un[`${E}/${M}`] || (console.log(`Deprecated as of ${E}. ${M}`), Un[`${E}/${M}`] = !0);
  }, U = new Error();
  function J(E, M, { key: H }) {
    let re = 0;
    const xe = E[H], ke = {}, V = {};
    for (let q = 1; q <= M.length; q++)
      V[q + re] = xe[q], ke[q + re] = !0, re += x(M[q - 1]);
    E[H] = V, E[H]._emit = ke, E[H]._multi = !0;
  }
  function ae(E) {
    if (Array.isArray(E.begin)) {
      if (E.skip || E.excludeBegin || E.returnBegin)
        throw Et("skip, excludeBegin, returnBegin not compatible with beginScope: {}"), U;
      if (typeof E.beginScope != "object" || E.beginScope === null)
        throw Et("beginScope must be object"), U;
      J(E, E.begin, { key: "beginScope" }), E.begin = T(E.begin, { joinWith: "" });
    }
  }
  function pe(E) {
    if (Array.isArray(E.end)) {
      if (E.skip || E.excludeEnd || E.returnEnd)
        throw Et("skip, excludeEnd, returnEnd not compatible with endScope: {}"), U;
      if (typeof E.endScope != "object" || E.endScope === null)
        throw Et("endScope must be object"), U;
      J(E, E.end, { key: "endScope" }), E.end = T(E.end, { joinWith: "" });
    }
  }
  function We(E) {
    E.scope && typeof E.scope == "object" && E.scope !== null && (E.beginScope = E.scope, delete E.scope);
  }
  function _t(E) {
    We(E), typeof E.beginScope == "string" && (E.beginScope = { _wrap: E.beginScope }), typeof E.endScope == "string" && (E.endScope = { _wrap: E.endScope }), ae(E), pe(E);
  }
  function tt(E) {
    function M(V, q) {
      return new RegExp(
        d(V),
        "m" + (E.case_insensitive ? "i" : "") + (E.unicodeRegex ? "u" : "") + (q ? "g" : "")
      );
    }
    class H {
      constructor() {
        this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0;
      }
      // @ts-ignore
      addRule(q, ee) {
        ee.position = this.position++, this.matchIndexes[this.matchAt] = ee, this.regexes.push([ee, q]), this.matchAt += x(q) + 1;
      }
      compile() {
        this.regexes.length === 0 && (this.exec = () => null);
        const q = this.regexes.map((ee) => ee[1]);
        this.matcherRe = M(T(q, { joinWith: "|" }), !0), this.lastIndex = 0;
      }
      /** @param {string} s */
      exec(q) {
        this.matcherRe.lastIndex = this.lastIndex;
        const ee = this.matcherRe.exec(q);
        if (!ee)
          return null;
        const Ae = ee.findIndex((gn, Dr) => Dr > 0 && gn !== void 0), ve = this.matchIndexes[Ae];
        return ee.splice(0, Ae), Object.assign(ee, ve);
      }
    }
    class re {
      constructor() {
        this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0;
      }
      // @ts-ignore
      getMatcher(q) {
        if (this.multiRegexes[q]) return this.multiRegexes[q];
        const ee = new H();
        return this.rules.slice(q).forEach(([Ae, ve]) => ee.addRule(Ae, ve)), ee.compile(), this.multiRegexes[q] = ee, ee;
      }
      resumingScanAtSamePosition() {
        return this.regexIndex !== 0;
      }
      considerAll() {
        this.regexIndex = 0;
      }
      // @ts-ignore
      addRule(q, ee) {
        this.rules.push([q, ee]), ee.type === "begin" && this.count++;
      }
      /** @param {string} s */
      exec(q) {
        const ee = this.getMatcher(this.regexIndex);
        ee.lastIndex = this.lastIndex;
        let Ae = ee.exec(q);
        if (this.resumingScanAtSamePosition() && !(Ae && Ae.index === this.lastIndex)) {
          const ve = this.getMatcher(0);
          ve.lastIndex = this.lastIndex + 1, Ae = ve.exec(q);
        }
        return Ae && (this.regexIndex += Ae.position + 1, this.regexIndex === this.count && this.considerAll()), Ae;
      }
    }
    function xe(V) {
      const q = new re();
      return V.contains.forEach((ee) => q.addRule(ee.begin, { rule: ee, type: "begin" })), V.terminatorEnd && q.addRule(V.terminatorEnd, { type: "end" }), V.illegal && q.addRule(V.illegal, { type: "illegal" }), q;
    }
    function ke(V, q) {
      const ee = (
        /** @type CompiledMode */
        V
      );
      if (V.isCompiled) return ee;
      [
        Pt,
        // do this early so compiler extensions generally don't have to worry about
        // the distinction between match/begin
        Vt,
        _t,
        bt
      ].forEach((ve) => ve(V, q)), E.compilerExtensions.forEach((ve) => ve(V, q)), V.__beforeBegin = null, [
        lt,
        // do this later so compiler extensions that come earlier have access to the
        // raw array if they wanted to perhaps manipulate it, etc.
        pn,
        // default to 1 relevance if not specified
        de
      ].forEach((ve) => ve(V, q)), V.isCompiled = !0;
      let Ae = null;
      return typeof V.keywords == "object" && V.keywords.$pattern && (V.keywords = Object.assign({}, V.keywords), Ae = V.keywords.$pattern, delete V.keywords.$pattern), Ae = Ae || /\w+/, V.keywords && (V.keywords = hn(V.keywords, E.case_insensitive)), ee.keywordPatternRe = M(Ae, !0), q && (V.begin || (V.begin = /\B|\b/), ee.beginRe = M(ee.begin), !V.end && !V.endsWithParent && (V.end = /\B|\b/), V.end && (ee.endRe = M(ee.end)), ee.terminatorEnd = d(ee.end) || "", V.endsWithParent && q.terminatorEnd && (ee.terminatorEnd += (V.end ? "|" : "") + q.terminatorEnd)), V.illegal && (ee.illegalRe = M(
        /** @type {RegExp | string} */
        V.illegal
      )), V.contains || (V.contains = []), V.contains = [].concat(...V.contains.map(function(ve) {
        return Ft(ve === "self" ? V : ve);
      })), V.contains.forEach(function(ve) {
        ke(
          /** @type Mode */
          ve,
          ee
        );
      }), V.starts && ke(V.starts, q), ee.matcher = xe(ee), ee;
    }
    if (E.compilerExtensions || (E.compilerExtensions = []), E.contains && E.contains.includes("self"))
      throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
    return E.classNameAliases = r(E.classNameAliases || {}), ke(
      /** @type Mode */
      E
    );
  }
  function Ct(E) {
    return E ? E.endsWithParent || Ct(E.starts) : !1;
  }
  function Ft(E) {
    return E.variants && !E.cachedVariants && (E.cachedVariants = E.variants.map(function(M) {
      return r(E, { variants: null }, M);
    })), E.cachedVariants ? E.cachedVariants : Ct(E) ? r(E, { starts: E.starts ? r(E.starts) : null }) : Object.isFrozen(E) ? r(E) : E;
  }
  var ze = "11.11.1";
  class Tt extends Error {
    constructor(M, H) {
      super(M), this.name = "HTMLInjectionError", this.html = H;
    }
  }
  const Ve = n, yo = r, Eo = /* @__PURE__ */ Symbol("nomatch"), Zc = 7, _o = function(E) {
    const M = /* @__PURE__ */ Object.create(null), H = /* @__PURE__ */ Object.create(null), re = [];
    let xe = !0;
    const ke = "Could not find the language '{}', did you forget to load/include a language module?", V = { disableAutodetect: !0, name: "Plain text", contains: [] };
    let q = {
      ignoreUnescapedHTML: !1,
      throwUnescapedHTML: !1,
      noHighlightRe: /^(no-?highlight)$/i,
      languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
      classPrefix: "hljs-",
      cssSelector: "pre code",
      languages: null,
      // beta configuration options, subject to change, welcome to discuss
      // https://github.com/highlightjs/highlight.js/issues/1086
      __emitter: u
    };
    function ee(z) {
      return q.noHighlightRe.test(z);
    }
    function Ae(z) {
      let X = z.className + " ";
      X += z.parentNode ? z.parentNode.className : "";
      const le = q.languageDetectRe.exec(X);
      if (le) {
        const ye = At(le[1]);
        return ye || ($n(ke.replace("{}", le[1])), $n("Falling back to no-highlight mode for this block.", z)), ye ? le[1] : "no-highlight";
      }
      return X.split(/\s+/).find((ye) => ee(ye) || At(ye));
    }
    function ve(z, X, le) {
      let ye = "", Ce = "";
      typeof X == "object" ? (ye = z, le = X.ignoreIllegals, Ce = X.language) : (R("10.7.0", "highlight(lang, code, ...args) has been deprecated."), R("10.7.0", `Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`), Ce = z, ye = X), le === void 0 && (le = !0);
      const nt = {
        code: ye,
        language: Ce
      };
      Gn("before:highlight", nt);
      const Rt = nt.result ? nt.result : gn(nt.language, nt.code, le);
      return Rt.code = nt.code, Gn("after:highlight", Rt), Rt;
    }
    function gn(z, X, le, ye) {
      const Ce = /* @__PURE__ */ Object.create(null);
      function nt(G, Z) {
        return G.keywords[Z];
      }
      function Rt() {
        if (!ie.keywords) {
          Oe.addText(Ee);
          return;
        }
        let G = 0;
        ie.keywordPatternRe.lastIndex = 0;
        let Z = ie.keywordPatternRe.exec(Ee), oe = "";
        for (; Z; ) {
          oe += Ee.substring(G, Z.index);
          const he = ut.case_insensitive ? Z[0].toLowerCase() : Z[0], Me = nt(ie, he);
          if (Me) {
            const [wt, fu] = Me;
            if (Oe.addText(oe), oe = "", Ce[he] = (Ce[he] || 0) + 1, Ce[he] <= Zc && (Wn += fu), wt.startsWith("_"))
              oe += Z[0];
            else {
              const pu = ut.classNameAliases[wt] || wt;
              ct(Z[0], pu);
            }
          } else
            oe += Z[0];
          G = ie.keywordPatternRe.lastIndex, Z = ie.keywordPatternRe.exec(Ee);
        }
        oe += Ee.substring(G), Oe.addText(oe);
      }
      function Kn() {
        if (Ee === "") return;
        let G = null;
        if (typeof ie.subLanguage == "string") {
          if (!M[ie.subLanguage]) {
            Oe.addText(Ee);
            return;
          }
          G = gn(ie.subLanguage, Ee, !0, To[ie.subLanguage]), To[ie.subLanguage] = /** @type {CompiledMode} */
          G._top;
        } else
          G = Lr(Ee, ie.subLanguage.length ? ie.subLanguage : null);
        ie.relevance > 0 && (Wn += G.relevance), Oe.__addSublanguage(G._emitter, G.language);
      }
      function Ye() {
        ie.subLanguage != null ? Kn() : Rt(), Ee = "";
      }
      function ct(G, Z) {
        G !== "" && (Oe.startScope(Z), Oe.addText(G), Oe.endScope());
      }
      function vo(G, Z) {
        let oe = 1;
        const he = Z.length - 1;
        for (; oe <= he; ) {
          if (!G._emit[oe]) {
            oe++;
            continue;
          }
          const Me = ut.classNameAliases[G[oe]] || G[oe], wt = Z[oe];
          Me ? ct(wt, Me) : (Ee = wt, Rt(), Ee = ""), oe++;
        }
      }
      function So(G, Z) {
        return G.scope && typeof G.scope == "string" && Oe.openNode(ut.classNameAliases[G.scope] || G.scope), G.beginScope && (G.beginScope._wrap ? (ct(Ee, ut.classNameAliases[G.beginScope._wrap] || G.beginScope._wrap), Ee = "") : G.beginScope._multi && (vo(G.beginScope, Z), Ee = "")), ie = Object.create(G, { parent: { value: ie } }), ie;
      }
      function No(G, Z, oe) {
        let he = _(G.endRe, oe);
        if (he) {
          if (G["on:end"]) {
            const Me = new t(G);
            G["on:end"](Z, Me), Me.isMatchIgnored && (he = !1);
          }
          if (he) {
            for (; G.endsParent && G.parent; )
              G = G.parent;
            return G;
          }
        }
        if (G.endsWithParent)
          return No(G.parent, Z, oe);
      }
      function su(G) {
        return ie.matcher.regexIndex === 0 ? (Ee += G[0], 1) : (zr = !0, 0);
      }
      function lu(G) {
        const Z = G[0], oe = G.rule, he = new t(oe), Me = [oe.__beforeBegin, oe["on:begin"]];
        for (const wt of Me)
          if (wt && (wt(G, he), he.isMatchIgnored))
            return su(Z);
        return oe.skip ? Ee += Z : (oe.excludeBegin && (Ee += Z), Ye(), !oe.returnBegin && !oe.excludeBegin && (Ee = Z)), So(oe, G), oe.returnBegin ? 0 : Z.length;
      }
      function cu(G) {
        const Z = G[0], oe = X.substring(G.index), he = No(ie, G, oe);
        if (!he)
          return Eo;
        const Me = ie;
        ie.endScope && ie.endScope._wrap ? (Ye(), ct(Z, ie.endScope._wrap)) : ie.endScope && ie.endScope._multi ? (Ye(), vo(ie.endScope, G)) : Me.skip ? Ee += Z : (Me.returnEnd || Me.excludeEnd || (Ee += Z), Ye(), Me.excludeEnd && (Ee = Z));
        do
          ie.scope && Oe.closeNode(), !ie.skip && !ie.subLanguage && (Wn += ie.relevance), ie = ie.parent;
        while (ie !== he.parent);
        return he.starts && So(he.starts, G), Me.returnEnd ? 0 : Z.length;
      }
      function uu() {
        const G = [];
        for (let Z = ie; Z !== ut; Z = Z.parent)
          Z.scope && G.unshift(Z.scope);
        G.forEach((Z) => Oe.openNode(Z));
      }
      let qn = {};
      function Co(G, Z) {
        const oe = Z && Z[0];
        if (Ee += G, oe == null)
          return Ye(), 0;
        if (qn.type === "begin" && Z.type === "end" && qn.index === Z.index && oe === "") {
          if (Ee += X.slice(Z.index, Z.index + 1), !xe) {
            const he = new Error(`0 width match regex (${z})`);
            throw he.languageName = z, he.badRule = qn.rule, he;
          }
          return 1;
        }
        if (qn = Z, Z.type === "begin")
          return lu(Z);
        if (Z.type === "illegal" && !le) {
          const he = new Error('Illegal lexeme "' + oe + '" for mode "' + (ie.scope || "<unnamed>") + '"');
          throw he.mode = ie, he;
        } else if (Z.type === "end") {
          const he = cu(Z);
          if (he !== Eo)
            return he;
        }
        if (Z.type === "illegal" && oe === "")
          return Ee += `
`, 1;
        if (Br > 1e5 && Br > Z.index * 3)
          throw new Error("potential infinite loop, way more iterations than matches");
        return Ee += oe, oe.length;
      }
      const ut = At(z);
      if (!ut)
        throw Et(ke.replace("{}", z)), new Error('Unknown language: "' + z + '"');
      const du = tt(ut);
      let Fr = "", ie = ye || du;
      const To = {}, Oe = new q.__emitter(q);
      uu();
      let Ee = "", Wn = 0, Bt = 0, Br = 0, zr = !1;
      try {
        if (ut.__emitTokens)
          ut.__emitTokens(X, Oe);
        else {
          for (ie.matcher.considerAll(); ; ) {
            Br++, zr ? zr = !1 : ie.matcher.considerAll(), ie.matcher.lastIndex = Bt;
            const G = ie.matcher.exec(X);
            if (!G) break;
            const Z = X.substring(Bt, G.index), oe = Co(Z, G);
            Bt = G.index + oe;
          }
          Co(X.substring(Bt));
        }
        return Oe.finalize(), Fr = Oe.toHTML(), {
          language: z,
          value: Fr,
          relevance: Wn,
          illegal: !1,
          _emitter: Oe,
          _top: ie
        };
      } catch (G) {
        if (G.message && G.message.includes("Illegal"))
          return {
            language: z,
            value: Ve(X),
            illegal: !0,
            relevance: 0,
            _illegalBy: {
              message: G.message,
              index: Bt,
              context: X.slice(Bt - 100, Bt + 100),
              mode: G.mode,
              resultSoFar: Fr
            },
            _emitter: Oe
          };
        if (xe)
          return {
            language: z,
            value: Ve(X),
            illegal: !1,
            relevance: 0,
            errorRaised: G,
            _emitter: Oe,
            _top: ie
          };
        throw G;
      }
    }
    function Dr(z) {
      const X = {
        value: Ve(z),
        illegal: !1,
        relevance: 0,
        _top: V,
        _emitter: new q.__emitter(q)
      };
      return X._emitter.addText(z), X;
    }
    function Lr(z, X) {
      X = X || q.languages || Object.keys(M);
      const le = Dr(z), ye = X.filter(At).filter(ko).map(
        (Ye) => gn(Ye, z, !1)
      );
      ye.unshift(le);
      const Ce = ye.sort((Ye, ct) => {
        if (Ye.relevance !== ct.relevance) return ct.relevance - Ye.relevance;
        if (Ye.language && ct.language) {
          if (At(Ye.language).supersetOf === ct.language)
            return 1;
          if (At(ct.language).supersetOf === Ye.language)
            return -1;
        }
        return 0;
      }), [nt, Rt] = Ce, Kn = nt;
      return Kn.secondBest = Rt, Kn;
    }
    function Xc(z, X, le) {
      const ye = X && H[X] || le;
      z.classList.add("hljs"), z.classList.add(`language-${ye}`);
    }
    function Pr(z) {
      let X = null;
      const le = Ae(z);
      if (ee(le)) return;
      if (Gn(
        "before:highlightElement",
        { el: z, language: le }
      ), z.dataset.highlighted) {
        console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", z);
        return;
      }
      if (z.children.length > 0 && (q.ignoreUnescapedHTML || (console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."), console.warn("https://github.com/highlightjs/highlight.js/wiki/security"), console.warn("The element with unescaped HTML:"), console.warn(z)), q.throwUnescapedHTML))
        throw new Tt(
          "One of your code blocks includes unescaped HTML.",
          z.innerHTML
        );
      X = z;
      const ye = X.textContent, Ce = le ? ve(ye, { language: le, ignoreIllegals: !0 }) : Lr(ye);
      z.innerHTML = Ce.value, z.dataset.highlighted = "yes", Xc(z, le, Ce.language), z.result = {
        language: Ce.language,
        // TODO: remove with version 11.0
        re: Ce.relevance,
        relevance: Ce.relevance
      }, Ce.secondBest && (z.secondBest = {
        language: Ce.secondBest.language,
        relevance: Ce.secondBest.relevance
      }), Gn("after:highlightElement", { el: z, result: Ce, text: ye });
    }
    function jc(z) {
      q = yo(q, z);
    }
    const Qc = () => {
      Hn(), R("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
    };
    function Jc() {
      Hn(), R("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
    }
    let wo = !1;
    function Hn() {
      function z() {
        Hn();
      }
      if (document.readyState === "loading") {
        wo || window.addEventListener("DOMContentLoaded", z, !1), wo = !0;
        return;
      }
      document.querySelectorAll(q.cssSelector).forEach(Pr);
    }
    function eu(z, X) {
      let le = null;
      try {
        le = X(E);
      } catch (ye) {
        if (Et("Language definition for '{}' could not be registered.".replace("{}", z)), xe)
          Et(ye);
        else
          throw ye;
        le = V;
      }
      le.name || (le.name = z), M[z] = le, le.rawDefinition = X.bind(null, E), le.aliases && xo(le.aliases, { languageName: z });
    }
    function tu(z) {
      delete M[z];
      for (const X of Object.keys(H))
        H[X] === z && delete H[X];
    }
    function nu() {
      return Object.keys(M);
    }
    function At(z) {
      return z = (z || "").toLowerCase(), M[z] || M[H[z]];
    }
    function xo(z, { languageName: X }) {
      typeof z == "string" && (z = [z]), z.forEach((le) => {
        H[le.toLowerCase()] = X;
      });
    }
    function ko(z) {
      const X = At(z);
      return X && !X.disableAutodetect;
    }
    function ru(z) {
      z["before:highlightBlock"] && !z["before:highlightElement"] && (z["before:highlightElement"] = (X) => {
        z["before:highlightBlock"](
          Object.assign({ block: X.el }, X)
        );
      }), z["after:highlightBlock"] && !z["after:highlightElement"] && (z["after:highlightElement"] = (X) => {
        z["after:highlightBlock"](
          Object.assign({ block: X.el }, X)
        );
      });
    }
    function iu(z) {
      ru(z), re.push(z);
    }
    function ou(z) {
      const X = re.indexOf(z);
      X !== -1 && re.splice(X, 1);
    }
    function Gn(z, X) {
      const le = z;
      re.forEach(function(ye) {
        ye[le] && ye[le](X);
      });
    }
    function au(z) {
      return R("10.7.0", "highlightBlock will be removed entirely in v12.0"), R("10.7.0", "Please use highlightElement now."), Pr(z);
    }
    Object.assign(E, {
      highlight: ve,
      highlightAuto: Lr,
      highlightAll: Hn,
      highlightElement: Pr,
      // TODO: Remove with v12 API
      highlightBlock: au,
      configure: jc,
      initHighlighting: Qc,
      initHighlightingOnLoad: Jc,
      registerLanguage: eu,
      unregisterLanguage: tu,
      listLanguages: nu,
      getLanguage: At,
      registerAliases: xo,
      autoDetection: ko,
      inherit: yo,
      addPlugin: iu,
      removePlugin: ou
    }), E.debugMode = function() {
      xe = !1;
    }, E.safeMode = function() {
      xe = !0;
    }, E.versionString = ze, E.regex = {
      concat: m,
      lookahead: p,
      either: g,
      optional: h,
      anyNumberOfTimes: f
    };
    for (const z in Be)
      typeof Be[z] == "object" && e(Be[z]);
    return Object.assign(E, Be), E;
  }, Zt = _o({});
  return Zt.newInstance = () => _o({}), ti = Zt, Zt.HighlightJS = Zt, Zt.default = Zt, ti;
}
var Lm = /* @__PURE__ */ Dm();
const Pm = /* @__PURE__ */ Pi(Lm), xa = {}, Fm = "hljs-";
function Bm(e) {
  const t = Pm.newInstance();
  return e && a(e), {
    highlight: n,
    highlightAuto: r,
    listLanguages: i,
    register: a,
    registerAlias: o,
    registered: s
  };
  function n(c, l, u) {
    const d = u || xa, p = typeof d.prefix == "string" ? d.prefix : Fm;
    if (!t.getLanguage(c))
      throw new Error("Unknown language: `" + c + "` is not registered");
    t.configure({ __emitter: zm, classPrefix: p });
    const f = (
      /** @type {HighlightResult & {_emitter: HastEmitter}} */
      t.highlight(l, { ignoreIllegals: !0, language: c })
    );
    if (f.errorRaised)
      throw new Error("Could not highlight with `Highlight.js`", {
        cause: f.errorRaised
      });
    const h = f._emitter.root, m = (
      /** @type {RootData} */
      h.data
    );
    return m.language = f.language, m.relevance = f.relevance, h;
  }
  function r(c, l) {
    const d = (l || xa).subset || i();
    let p = -1, f = 0, h;
    for (; ++p < d.length; ) {
      const m = d[p];
      if (!t.getLanguage(m)) continue;
      const b = n(m, c, l);
      b.data && b.data.relevance !== void 0 && b.data.relevance > f && (f = b.data.relevance, h = b);
    }
    return h || {
      type: "root",
      children: [],
      data: { language: void 0, relevance: f }
    };
  }
  function i() {
    return t.listLanguages();
  }
  function a(c, l) {
    if (typeof c == "string")
      t.registerLanguage(c, l);
    else {
      let u;
      for (u in c)
        Object.hasOwn(c, u) && t.registerLanguage(u, c[u]);
    }
  }
  function o(c, l) {
    if (typeof c == "string")
      t.registerAliases(
        // Note: copy needed because hljs doesn’t accept readonly arrays yet.
        typeof l == "string" ? l : [...l],
        { languageName: c }
      );
    else {
      let u;
      for (u in c)
        if (Object.hasOwn(c, u)) {
          const d = c[u];
          t.registerAliases(
            // Note: copy needed because hljs doesn’t accept readonly arrays yet.
            typeof d == "string" ? d : [...d],
            { languageName: u }
          );
        }
    }
  }
  function s(c) {
    return !!t.getLanguage(c);
  }
}
class zm {
  /**
   * @param {Readonly<HljsOptions>} options
   *   Configuration.
   * @returns
   *   Instance.
   */
  constructor(t) {
    this.options = t, this.root = {
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
  addText(t) {
    if (t === "") return;
    const n = this.stack[this.stack.length - 1], r = n.children[n.children.length - 1];
    r && r.type === "text" ? r.value += t : n.children.push({ type: "text", value: t });
  }
  /**
   *
   * @param {unknown} rawName
   *   Name to add.
   * @returns {undefined}
   *   Nothing.
   */
  startScope(t) {
    this.openNode(String(t));
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
  __addSublanguage(t, n) {
    const r = this.stack[this.stack.length - 1], i = (
      /** @type {Array<ElementContent>} */
      t.root.children
    );
    n ? r.children.push({
      type: "element",
      tagName: "span",
      properties: { className: [n] },
      children: i
    }) : r.children.push(...i);
  }
  /**
   * @param {string} name
   *   Name to add.
   * @returns {undefined}
   *   Nothing.
   */
  openNode(t) {
    const n = this, r = t.split(".").map(function(o, s) {
      return s ? o + "_".repeat(s) : n.options.classPrefix + o;
    }), i = this.stack[this.stack.length - 1], a = {
      type: "element",
      tagName: "span",
      properties: { className: r },
      children: []
    };
    i.children.push(a), this.stack.push(a);
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
const Um = {};
function sl(e) {
  const t = e || Um, n = t.aliases, r = t.detect || !1, i = t.languages || Mm, a = t.plainText, o = t.prefix, s = t.subset;
  let c = "hljs";
  const l = Bm(i);
  if (n && l.registerAlias(n), o) {
    const u = o.indexOf("-");
    c = u === -1 ? o : o.slice(0, u);
  }
  return function(u, d) {
    xr(u, "element", function(p, f, h) {
      if (p.tagName !== "code" || !h || h.type !== "element" || h.tagName !== "pre")
        return;
      const m = $m(p);
      if (m === !1 || !m && !r || m && a && a.includes(m))
        return;
      Array.isArray(p.properties.className) || (p.properties.className = []), p.properties.className.includes(c) || p.properties.className.unshift(c);
      const b = ag(p, { whitespace: "pre" });
      let g;
      try {
        g = m ? l.highlight(m, b, { prefix: o }) : l.highlightAuto(b, { prefix: o, subset: s });
      } catch (x) {
        const _ = (
          /** @type {Error} */
          x
        );
        if (m && /Unknown language/.test(_.message)) {
          d.message(
            "Cannot highlight as `" + m + "`, it’s not registered",
            {
              ancestors: [h, p],
              cause: _,
              place: p.position,
              ruleId: "missing-language",
              source: "rehype-highlight"
            }
          );
          return;
        }
        throw _;
      }
      !m && g.data && g.data.language && p.properties.className.push("language-" + g.data.language), g.children.length > 0 && (p.children = /** @type {Array<ElementContent>} */
      g.children);
    });
  };
}
function $m(e) {
  const t = e.properties.className;
  let n = -1;
  if (!Array.isArray(t))
    return;
  let r;
  for (; ++n < t.length; ) {
    const i = String(t[n]);
    if (i === "no-highlight" || i === "nohighlight")
      return !1;
    !r && i.slice(0, 5) === "lang-" && (r = i.slice(5)), !r && i.slice(0, 9) === "language-" && (r = i.slice(9));
  }
  return r;
}
function ka(e, t) {
  const n = String(e);
  if (typeof t != "string")
    throw new TypeError("Expected character");
  let r = 0, i = n.indexOf(t);
  for (; i !== -1; )
    r++, i = n.indexOf(t, i + t.length);
  return r;
}
function Hm(e) {
  if (typeof e != "string")
    throw new TypeError("Expected a string");
  return e.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function Gm(e, t, n) {
  const i = In((n || {}).ignore || []), a = Km(t);
  let o = -1;
  for (; ++o < a.length; )
    Bs(e, "text", s);
  function s(l, u) {
    let d = -1, p;
    for (; ++d < u.length; ) {
      const f = u[d], h = p ? p.children : void 0;
      if (i(
        f,
        h ? h.indexOf(f) : void 0,
        p
      ))
        return;
      p = f;
    }
    if (p)
      return c(l, u);
  }
  function c(l, u) {
    const d = u[u.length - 1], p = a[o][0], f = a[o][1];
    let h = 0;
    const b = d.children.indexOf(l);
    let g = !1, x = [];
    p.lastIndex = 0;
    let _ = p.exec(l.value);
    for (; _; ) {
      const C = _.index, T = {
        index: _.index,
        input: _.input,
        stack: [...u, l]
      };
      let k = f(..._, T);
      if (typeof k == "string" && (k = k.length > 0 ? { type: "text", value: k } : void 0), k === !1 ? p.lastIndex = C + 1 : (h !== C && x.push({
        type: "text",
        value: l.value.slice(h, C)
      }), Array.isArray(k) ? x.push(...k) : k && x.push(k), h = C + _[0].length, g = !0), !p.global)
        break;
      _ = p.exec(l.value);
    }
    return g ? (h < l.value.length && x.push({ type: "text", value: l.value.slice(h) }), d.children.splice(b, 1, ...x)) : x = [l], b + x.length;
  }
}
function Km(e) {
  const t = [];
  if (!Array.isArray(e))
    throw new TypeError("Expected find and replace tuple or list of tuples");
  const n = !e[0] || Array.isArray(e[0]) ? e : [e];
  let r = -1;
  for (; ++r < n.length; ) {
    const i = n[r];
    t.push([qm(i[0]), Wm(i[1])]);
  }
  return t;
}
function qm(e) {
  return typeof e == "string" ? new RegExp(Hm(e), "g") : e;
}
function Wm(e) {
  return typeof e == "function" ? e : function() {
    return e;
  };
}
const ni = "phrasing", ri = ["autolink", "link", "image", "label"];
function Vm() {
  return {
    transforms: [eb],
    enter: {
      literalAutolink: Zm,
      literalAutolinkEmail: ii,
      literalAutolinkHttp: ii,
      literalAutolinkWww: ii
    },
    exit: {
      literalAutolink: Jm,
      literalAutolinkEmail: Qm,
      literalAutolinkHttp: Xm,
      literalAutolinkWww: jm
    }
  };
}
function Ym() {
  return {
    unsafe: [
      {
        character: "@",
        before: "[+\\-.\\w]",
        after: "[\\-.\\w]",
        inConstruct: ni,
        notInConstruct: ri
      },
      {
        character: ".",
        before: "[Ww]",
        after: "[\\-.\\w]",
        inConstruct: ni,
        notInConstruct: ri
      },
      {
        character: ":",
        before: "[ps]",
        after: "\\/",
        inConstruct: ni,
        notInConstruct: ri
      }
    ]
  };
}
function Zm(e) {
  this.enter({ type: "link", title: null, url: "", children: [] }, e);
}
function ii(e) {
  this.config.enter.autolinkProtocol.call(this, e);
}
function Xm(e) {
  this.config.exit.autolinkProtocol.call(this, e);
}
function jm(e) {
  this.config.exit.data.call(this, e);
  const t = this.stack[this.stack.length - 1];
  t.type, t.url = "http://" + this.sliceSerialize(e);
}
function Qm(e) {
  this.config.exit.autolinkEmail.call(this, e);
}
function Jm(e) {
  this.exit(e);
}
function eb(e) {
  Gm(
    e,
    [
      [/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, tb],
      [new RegExp("(?<=^|\\s|\\p{P}|\\p{S})([-.\\w+]+)@([-\\w]+(?:\\.[-\\w]+)+)", "gu"), nb]
    ],
    { ignore: ["link", "linkReference"] }
  );
}
function tb(e, t, n, r, i) {
  let a = "";
  if (!ll(i) || (/^w/i.test(t) && (n = t + n, t = "", a = "http://"), !rb(n)))
    return !1;
  const o = ib(n + r);
  if (!o[0]) return !1;
  const s = {
    type: "link",
    title: null,
    url: a + t + o[0],
    children: [{ type: "text", value: t + o[0] }]
  };
  return o[1] ? [s, { type: "text", value: o[1] }] : s;
}
function nb(e, t, n, r) {
  return (
    // Not an expected previous character.
    !ll(r, !0) || // Label ends in not allowed character.
    /[-\d_]$/.test(n) ? !1 : {
      type: "link",
      title: null,
      url: "mailto:" + t + "@" + n,
      children: [{ type: "text", value: t + "@" + n }]
    }
  );
}
function rb(e) {
  const t = e.split(".");
  return !(t.length < 2 || t[t.length - 1] && (/_/.test(t[t.length - 1]) || !/[a-zA-Z\d]/.test(t[t.length - 1])) || t[t.length - 2] && (/_/.test(t[t.length - 2]) || !/[a-zA-Z\d]/.test(t[t.length - 2])));
}
function ib(e) {
  const t = /[!"&'),.:;<>?\]}]+$/.exec(e);
  if (!t)
    return [e, void 0];
  e = e.slice(0, t.index);
  let n = t[0], r = n.indexOf(")");
  const i = ka(e, "(");
  let a = ka(e, ")");
  for (; r !== -1 && i > a; )
    e += n.slice(0, r + 1), n = n.slice(r + 1), r = n.indexOf(")"), a++;
  return [e, n];
}
function ll(e, t) {
  const n = e.input.charCodeAt(e.index - 1);
  return (e.index === 0 || Gt(n) || yr(n)) && // If it’s an email, the previous character should not be a slash.
  (!t || n !== 47);
}
cl.peek = pb;
function ob() {
  this.buffer();
}
function ab(e) {
  this.enter({ type: "footnoteReference", identifier: "", label: "" }, e);
}
function sb() {
  this.buffer();
}
function lb(e) {
  this.enter(
    { type: "footnoteDefinition", identifier: "", label: "", children: [] },
    e
  );
}
function cb(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = it(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function ub(e) {
  this.exit(e);
}
function db(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = it(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function fb(e) {
  this.exit(e);
}
function pb() {
  return "[";
}
function cl(e, t, n, r) {
  const i = n.createTracker(r);
  let a = i.move("[^");
  const o = n.enter("footnoteReference"), s = n.enter("reference");
  return a += i.move(
    n.safe(n.associationId(e), { after: "]", before: a })
  ), s(), o(), a += i.move("]"), a;
}
function hb() {
  return {
    enter: {
      gfmFootnoteCallString: ob,
      gfmFootnoteCall: ab,
      gfmFootnoteDefinitionLabelString: sb,
      gfmFootnoteDefinition: lb
    },
    exit: {
      gfmFootnoteCallString: cb,
      gfmFootnoteCall: ub,
      gfmFootnoteDefinitionLabelString: db,
      gfmFootnoteDefinition: fb
    }
  };
}
function gb(e) {
  let t = !1;
  return e && e.firstLineBlank && (t = !0), {
    handlers: { footnoteDefinition: n, footnoteReference: cl },
    // This is on by default already.
    unsafe: [{ character: "[", inConstruct: ["label", "phrasing", "reference"] }]
  };
  function n(r, i, a, o) {
    const s = a.createTracker(o);
    let c = s.move("[^");
    const l = a.enter("footnoteDefinition"), u = a.enter("label");
    return c += s.move(
      a.safe(a.associationId(r), { before: c, after: "]" })
    ), u(), c += s.move("]:"), r.children && r.children.length > 0 && (s.shift(4), c += s.move(
      (t ? `
` : " ") + a.indentLines(
        a.containerFlow(r, s.current()),
        t ? ul : mb
      )
    )), l(), c;
  }
}
function mb(e, t, n) {
  return t === 0 ? e : ul(e, t, n);
}
function ul(e, t, n) {
  return (n ? "" : "    ") + e;
}
const bb = [
  "autolink",
  "destinationLiteral",
  "destinationRaw",
  "reference",
  "titleQuote",
  "titleApostrophe"
];
dl.peek = xb;
function yb() {
  return {
    canContainEols: ["delete"],
    enter: { strikethrough: _b },
    exit: { strikethrough: wb }
  };
}
function Eb() {
  return {
    unsafe: [
      {
        character: "~",
        inConstruct: "phrasing",
        notInConstruct: bb
      }
    ],
    handlers: { delete: dl }
  };
}
function _b(e) {
  this.enter({ type: "delete", children: [] }, e);
}
function wb(e) {
  this.exit(e);
}
function dl(e, t, n, r) {
  const i = n.createTracker(r), a = n.enter("strikethrough");
  let o = i.move("~~");
  return o += n.containerPhrasing(e, {
    ...i.current(),
    before: o,
    after: "~"
  }), o += i.move("~~"), a(), o;
}
function xb() {
  return "~";
}
function kb(e) {
  return e.length;
}
function vb(e, t) {
  const n = t || {}, r = (n.align || []).concat(), i = n.stringLength || kb, a = [], o = [], s = [], c = [];
  let l = 0, u = -1;
  for (; ++u < e.length; ) {
    const m = [], b = [];
    let g = -1;
    for (e[u].length > l && (l = e[u].length); ++g < e[u].length; ) {
      const x = Sb(e[u][g]);
      if (n.alignDelimiters !== !1) {
        const _ = i(x);
        b[g] = _, (c[g] === void 0 || _ > c[g]) && (c[g] = _);
      }
      m.push(x);
    }
    o[u] = m, s[u] = b;
  }
  let d = -1;
  if (typeof r == "object" && "length" in r)
    for (; ++d < l; )
      a[d] = va(r[d]);
  else {
    const m = va(r);
    for (; ++d < l; )
      a[d] = m;
  }
  d = -1;
  const p = [], f = [];
  for (; ++d < l; ) {
    const m = a[d];
    let b = "", g = "";
    m === 99 ? (b = ":", g = ":") : m === 108 ? b = ":" : m === 114 && (g = ":");
    let x = n.alignDelimiters === !1 ? 1 : Math.max(
      1,
      c[d] - b.length - g.length
    );
    const _ = b + "-".repeat(x) + g;
    n.alignDelimiters !== !1 && (x = b.length + x + g.length, x > c[d] && (c[d] = x), f[d] = x), p[d] = _;
  }
  o.splice(1, 0, p), s.splice(1, 0, f), u = -1;
  const h = [];
  for (; ++u < o.length; ) {
    const m = o[u], b = s[u];
    d = -1;
    const g = [];
    for (; ++d < l; ) {
      const x = m[d] || "";
      let _ = "", C = "";
      if (n.alignDelimiters !== !1) {
        const T = c[d] - (b[d] || 0), k = a[d];
        k === 114 ? _ = " ".repeat(T) : k === 99 ? T % 2 ? (_ = " ".repeat(T / 2 + 0.5), C = " ".repeat(T / 2 - 0.5)) : (_ = " ".repeat(T / 2), C = _) : C = " ".repeat(T);
      }
      n.delimiterStart !== !1 && !d && g.push("|"), n.padding !== !1 && // Don’t add the opening space if we’re not aligning and the cell is
      // empty: there will be a closing space.
      !(n.alignDelimiters === !1 && x === "") && (n.delimiterStart !== !1 || d) && g.push(" "), n.alignDelimiters !== !1 && g.push(_), g.push(x), n.alignDelimiters !== !1 && g.push(C), n.padding !== !1 && g.push(" "), (n.delimiterEnd !== !1 || d !== l - 1) && g.push("|");
    }
    h.push(
      n.delimiterEnd === !1 ? g.join("").replace(/ +$/, "") : g.join("")
    );
  }
  return h.join(`
`);
}
function Sb(e) {
  return e == null ? "" : String(e);
}
function va(e) {
  const t = typeof e == "string" ? e.codePointAt(0) : 0;
  return t === 67 || t === 99 ? 99 : t === 76 || t === 108 ? 108 : t === 82 || t === 114 ? 114 : 0;
}
function Nb(e, t, n, r) {
  const i = n.enter("blockquote"), a = n.createTracker(r);
  a.move("> "), a.shift(2);
  const o = n.indentLines(
    n.containerFlow(e, a.current()),
    Cb
  );
  return i(), o;
}
function Cb(e, t, n) {
  return ">" + (n ? "" : " ") + e;
}
function Tb(e, t) {
  return Sa(e, t.inConstruct, !0) && !Sa(e, t.notInConstruct, !1);
}
function Sa(e, t, n) {
  if (typeof t == "string" && (t = [t]), !t || t.length === 0)
    return n;
  let r = -1;
  for (; ++r < t.length; )
    if (e.includes(t[r]))
      return !0;
  return !1;
}
function Na(e, t, n, r) {
  let i = -1;
  for (; ++i < n.unsafe.length; )
    if (n.unsafe[i].character === `
` && Tb(n.stack, n.unsafe[i]))
      return /[ \t]/.test(r.before) ? "" : " ";
  return `\\
`;
}
function Ab(e, t) {
  const n = String(e);
  let r = n.indexOf(t), i = r, a = 0, o = 0;
  if (typeof t != "string")
    throw new TypeError("Expected substring");
  for (; r !== -1; )
    r === i ? ++a > o && (o = a) : a = 1, i = r + t.length, r = n.indexOf(t, i);
  return o;
}
function Rb(e, t) {
  return !!(t.options.fences === !1 && e.value && // If there’s no info…
  !e.lang && // And there’s a non-whitespace character…
  /[^ \r\n]/.test(e.value) && // And the value doesn’t start or end in a blank…
  !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(e.value));
}
function Ob(e) {
  const t = e.options.fence || "`";
  if (t !== "`" && t !== "~")
    throw new Error(
      "Cannot serialize code with `" + t + "` for `options.fence`, expected `` ` `` or `~`"
    );
  return t;
}
function Ib(e, t, n, r) {
  const i = Ob(n), a = e.value || "", o = i === "`" ? "GraveAccent" : "Tilde";
  if (Rb(e, n)) {
    const d = n.enter("codeIndented"), p = n.indentLines(a, Mb);
    return d(), p;
  }
  const s = n.createTracker(r), c = i.repeat(Math.max(Ab(a, i) + 1, 3)), l = n.enter("codeFenced");
  let u = s.move(c);
  if (e.lang) {
    const d = n.enter(`codeFencedLang${o}`);
    u += s.move(
      n.safe(e.lang, {
        before: u,
        after: " ",
        encode: ["`"],
        ...s.current()
      })
    ), d();
  }
  if (e.lang && e.meta) {
    const d = n.enter(`codeFencedMeta${o}`);
    u += s.move(" "), u += s.move(
      n.safe(e.meta, {
        before: u,
        after: `
`,
        encode: ["`"],
        ...s.current()
      })
    ), d();
  }
  return u += s.move(`
`), a && (u += s.move(a + `
`)), u += s.move(c), l(), u;
}
function Mb(e, t, n) {
  return (n ? "" : "    ") + e;
}
function ji(e) {
  const t = e.options.quote || '"';
  if (t !== '"' && t !== "'")
    throw new Error(
      "Cannot serialize title with `" + t + "` for `options.quote`, expected `\"`, or `'`"
    );
  return t;
}
function Db(e, t, n, r) {
  const i = ji(n), a = i === '"' ? "Quote" : "Apostrophe", o = n.enter("definition");
  let s = n.enter("label");
  const c = n.createTracker(r);
  let l = c.move("[");
  return l += c.move(
    n.safe(n.associationId(e), {
      before: l,
      after: "]",
      ...c.current()
    })
  ), l += c.move("]: "), s(), // If there’s no url, or…
  !e.url || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (s = n.enter("destinationLiteral"), l += c.move("<"), l += c.move(
    n.safe(e.url, { before: l, after: ">", ...c.current() })
  ), l += c.move(">")) : (s = n.enter("destinationRaw"), l += c.move(
    n.safe(e.url, {
      before: l,
      after: e.title ? " " : `
`,
      ...c.current()
    })
  )), s(), e.title && (s = n.enter(`title${a}`), l += c.move(" " + i), l += c.move(
    n.safe(e.title, {
      before: l,
      after: i,
      ...c.current()
    })
  ), l += c.move(i), s()), o(), l;
}
function Lb(e) {
  const t = e.options.emphasis || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize emphasis with `" + t + "` for `options.emphasis`, expected `*`, or `_`"
    );
  return t;
}
function Nn(e) {
  return "&#x" + e.toString(16).toUpperCase() + ";";
}
function fr(e, t, n) {
  const r = rn(e), i = rn(t);
  return r === void 0 ? i === void 0 ? (
    // Letter inside:
    // we have to encode *both* letters for `_` as it is looser.
    // it already forms for `*` (and GFMs `~`).
    n === "_" ? { inside: !0, outside: !0 } : { inside: !1, outside: !1 }
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
fl.peek = Pb;
function fl(e, t, n, r) {
  const i = Lb(n), a = n.enter("emphasis"), o = n.createTracker(r), s = o.move(i);
  let c = o.move(
    n.containerPhrasing(e, {
      after: i,
      before: s,
      ...o.current()
    })
  );
  const l = c.charCodeAt(0), u = fr(
    r.before.charCodeAt(r.before.length - 1),
    l,
    i
  );
  u.inside && (c = Nn(l) + c.slice(1));
  const d = c.charCodeAt(c.length - 1), p = fr(r.after.charCodeAt(0), d, i);
  p.inside && (c = c.slice(0, -1) + Nn(d));
  const f = o.move(i);
  return a(), n.attentionEncodeSurroundingInfo = {
    after: p.outside,
    before: u.outside
  }, s + c + f;
}
function Pb(e, t, n) {
  return n.options.emphasis || "*";
}
function Fb(e, t) {
  let n = !1;
  return xr(e, function(r) {
    if ("value" in r && /\r?\n|\r/.test(r.value) || r.type === "break")
      return n = !0, bi;
  }), !!((!e.depth || e.depth < 3) && $i(e) && (t.options.setext || n));
}
function Bb(e, t, n, r) {
  const i = Math.max(Math.min(6, e.depth || 1), 1), a = n.createTracker(r);
  if (Fb(e, n)) {
    const u = n.enter("headingSetext"), d = n.enter("phrasing"), p = n.containerPhrasing(e, {
      ...a.current(),
      before: `
`,
      after: `
`
    });
    return d(), u(), p + `
` + (i === 1 ? "=" : "-").repeat(
      // The whole size…
      p.length - // Minus the position of the character after the last EOL (or
      // 0 if there is none)…
      (Math.max(p.lastIndexOf("\r"), p.lastIndexOf(`
`)) + 1)
    );
  }
  const o = "#".repeat(i), s = n.enter("headingAtx"), c = n.enter("phrasing");
  a.move(o + " ");
  let l = n.containerPhrasing(e, {
    before: "# ",
    after: `
`,
    ...a.current()
  });
  return /^[\t ]/.test(l) && (l = Nn(l.charCodeAt(0)) + l.slice(1)), l = l ? o + " " + l : o, n.options.closeAtx && (l += " " + o), c(), s(), l;
}
pl.peek = zb;
function pl(e) {
  return e.value || "";
}
function zb() {
  return "<";
}
hl.peek = Ub;
function hl(e, t, n, r) {
  const i = ji(n), a = i === '"' ? "Quote" : "Apostrophe", o = n.enter("image");
  let s = n.enter("label");
  const c = n.createTracker(r);
  let l = c.move("![");
  return l += c.move(
    n.safe(e.alt, { before: l, after: "]", ...c.current() })
  ), l += c.move("]("), s(), // If there’s no url but there is a title…
  !e.url && e.title || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (s = n.enter("destinationLiteral"), l += c.move("<"), l += c.move(
    n.safe(e.url, { before: l, after: ">", ...c.current() })
  ), l += c.move(">")) : (s = n.enter("destinationRaw"), l += c.move(
    n.safe(e.url, {
      before: l,
      after: e.title ? " " : ")",
      ...c.current()
    })
  )), s(), e.title && (s = n.enter(`title${a}`), l += c.move(" " + i), l += c.move(
    n.safe(e.title, {
      before: l,
      after: i,
      ...c.current()
    })
  ), l += c.move(i), s()), l += c.move(")"), o(), l;
}
function Ub() {
  return "!";
}
gl.peek = $b;
function gl(e, t, n, r) {
  const i = e.referenceType, a = n.enter("imageReference");
  let o = n.enter("label");
  const s = n.createTracker(r);
  let c = s.move("![");
  const l = n.safe(e.alt, {
    before: c,
    after: "]",
    ...s.current()
  });
  c += s.move(l + "]["), o();
  const u = n.stack;
  n.stack = [], o = n.enter("reference");
  const d = n.safe(n.associationId(e), {
    before: c,
    after: "]",
    ...s.current()
  });
  return o(), n.stack = u, a(), i === "full" || !l || l !== d ? c += s.move(d + "]") : i === "shortcut" ? c = c.slice(0, -1) : c += s.move("]"), c;
}
function $b() {
  return "!";
}
ml.peek = Hb;
function ml(e, t, n) {
  let r = e.value || "", i = "`", a = -1;
  for (; new RegExp("(^|[^`])" + i + "([^`]|$)").test(r); )
    i += "`";
  for (/[^ \r\n]/.test(r) && (/^[ \r\n]/.test(r) && /[ \r\n]$/.test(r) || /^`|`$/.test(r)) && (r = " " + r + " "); ++a < n.unsafe.length; ) {
    const o = n.unsafe[a], s = n.compilePattern(o);
    let c;
    if (o.atBreak)
      for (; c = s.exec(r); ) {
        let l = c.index;
        r.charCodeAt(l) === 10 && r.charCodeAt(l - 1) === 13 && l--, r = r.slice(0, l) + " " + r.slice(c.index + 1);
      }
  }
  return i + r + i;
}
function Hb() {
  return "`";
}
function bl(e, t) {
  const n = $i(e);
  return !!(!t.options.resourceLink && // If there’s a url…
  e.url && // And there’s a no title…
  !e.title && // And the content of `node` is a single text node…
  e.children && e.children.length === 1 && e.children[0].type === "text" && // And if the url is the same as the content…
  (n === e.url || "mailto:" + n === e.url) && // And that starts w/ a protocol…
  /^[a-z][a-z+.-]+:/i.test(e.url) && // And that doesn’t contain ASCII control codes (character escapes and
  // references don’t work), space, or angle brackets…
  !/[\0- <>\u007F]/.test(e.url));
}
yl.peek = Gb;
function yl(e, t, n, r) {
  const i = ji(n), a = i === '"' ? "Quote" : "Apostrophe", o = n.createTracker(r);
  let s, c;
  if (bl(e, n)) {
    const u = n.stack;
    n.stack = [], s = n.enter("autolink");
    let d = o.move("<");
    return d += o.move(
      n.containerPhrasing(e, {
        before: d,
        after: ">",
        ...o.current()
      })
    ), d += o.move(">"), s(), n.stack = u, d;
  }
  s = n.enter("link"), c = n.enter("label");
  let l = o.move("[");
  return l += o.move(
    n.containerPhrasing(e, {
      before: l,
      after: "](",
      ...o.current()
    })
  ), l += o.move("]("), c(), // If there’s no url but there is a title…
  !e.url && e.title || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (c = n.enter("destinationLiteral"), l += o.move("<"), l += o.move(
    n.safe(e.url, { before: l, after: ">", ...o.current() })
  ), l += o.move(">")) : (c = n.enter("destinationRaw"), l += o.move(
    n.safe(e.url, {
      before: l,
      after: e.title ? " " : ")",
      ...o.current()
    })
  )), c(), e.title && (c = n.enter(`title${a}`), l += o.move(" " + i), l += o.move(
    n.safe(e.title, {
      before: l,
      after: i,
      ...o.current()
    })
  ), l += o.move(i), c()), l += o.move(")"), s(), l;
}
function Gb(e, t, n) {
  return bl(e, n) ? "<" : "[";
}
El.peek = Kb;
function El(e, t, n, r) {
  const i = e.referenceType, a = n.enter("linkReference");
  let o = n.enter("label");
  const s = n.createTracker(r);
  let c = s.move("[");
  const l = n.containerPhrasing(e, {
    before: c,
    after: "]",
    ...s.current()
  });
  c += s.move(l + "]["), o();
  const u = n.stack;
  n.stack = [], o = n.enter("reference");
  const d = n.safe(n.associationId(e), {
    before: c,
    after: "]",
    ...s.current()
  });
  return o(), n.stack = u, a(), i === "full" || !l || l !== d ? c += s.move(d + "]") : i === "shortcut" ? c = c.slice(0, -1) : c += s.move("]"), c;
}
function Kb() {
  return "[";
}
function Qi(e) {
  const t = e.options.bullet || "*";
  if (t !== "*" && t !== "+" && t !== "-")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bullet`, expected `*`, `+`, or `-`"
    );
  return t;
}
function qb(e) {
  const t = Qi(e), n = e.options.bulletOther;
  if (!n)
    return t === "*" ? "-" : "*";
  if (n !== "*" && n !== "+" && n !== "-")
    throw new Error(
      "Cannot serialize items with `" + n + "` for `options.bulletOther`, expected `*`, `+`, or `-`"
    );
  if (n === t)
    throw new Error(
      "Expected `bullet` (`" + t + "`) and `bulletOther` (`" + n + "`) to be different"
    );
  return n;
}
function Wb(e) {
  const t = e.options.bulletOrdered || ".";
  if (t !== "." && t !== ")")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bulletOrdered`, expected `.` or `)`"
    );
  return t;
}
function _l(e) {
  const t = e.options.rule || "*";
  if (t !== "*" && t !== "-" && t !== "_")
    throw new Error(
      "Cannot serialize rules with `" + t + "` for `options.rule`, expected `*`, `-`, or `_`"
    );
  return t;
}
function Vb(e, t, n, r) {
  const i = n.enter("list"), a = n.bulletCurrent;
  let o = e.ordered ? Wb(n) : Qi(n);
  const s = e.ordered ? o === "." ? ")" : "." : qb(n);
  let c = t && n.bulletLastUsed ? o === n.bulletLastUsed : !1;
  if (!e.ordered) {
    const u = e.children ? e.children[0] : void 0;
    if (
      // Bullet could be used as a thematic break marker:
      (o === "*" || o === "-") && // Empty first list item:
      u && (!u.children || !u.children[0]) && // Directly in two other list items:
      n.stack[n.stack.length - 1] === "list" && n.stack[n.stack.length - 2] === "listItem" && n.stack[n.stack.length - 3] === "list" && n.stack[n.stack.length - 4] === "listItem" && // That are each the first child.
      n.indexStack[n.indexStack.length - 1] === 0 && n.indexStack[n.indexStack.length - 2] === 0 && n.indexStack[n.indexStack.length - 3] === 0 && (c = !0), _l(n) === o && u
    ) {
      let d = -1;
      for (; ++d < e.children.length; ) {
        const p = e.children[d];
        if (p && p.type === "listItem" && p.children && p.children[0] && p.children[0].type === "thematicBreak") {
          c = !0;
          break;
        }
      }
    }
  }
  c && (o = s), n.bulletCurrent = o;
  const l = n.containerFlow(e, r);
  return n.bulletLastUsed = o, n.bulletCurrent = a, i(), l;
}
function Yb(e) {
  const t = e.options.listItemIndent || "one";
  if (t !== "tab" && t !== "one" && t !== "mixed")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`"
    );
  return t;
}
function Zb(e, t, n, r) {
  const i = Yb(n);
  let a = n.bulletCurrent || Qi(n);
  t && t.type === "list" && t.ordered && (a = (typeof t.start == "number" && t.start > -1 ? t.start : 1) + (n.options.incrementListMarker === !1 ? 0 : t.children.indexOf(e)) + a);
  let o = a.length + 1;
  (i === "tab" || i === "mixed" && (t && t.type === "list" && t.spread || e.spread)) && (o = Math.ceil(o / 4) * 4);
  const s = n.createTracker(r);
  s.move(a + " ".repeat(o - a.length)), s.shift(o);
  const c = n.enter("listItem"), l = n.indentLines(
    n.containerFlow(e, s.current()),
    u
  );
  return c(), l;
  function u(d, p, f) {
    return p ? (f ? "" : " ".repeat(o)) + d : (f ? a : a + " ".repeat(o - a.length)) + d;
  }
}
function Xb(e, t, n, r) {
  const i = n.enter("paragraph"), a = n.enter("phrasing"), o = n.containerPhrasing(e, r);
  return a(), i(), o;
}
const jb = (
  /** @type {(node?: unknown) => node is Exclude<PhrasingContent, Html>} */
  In([
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
function Qb(e, t, n, r) {
  return (e.children.some(function(o) {
    return jb(o);
  }) ? n.containerPhrasing : n.containerFlow).call(n, e, r);
}
function Jb(e) {
  const t = e.options.strong || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize strong with `" + t + "` for `options.strong`, expected `*`, or `_`"
    );
  return t;
}
wl.peek = ey;
function wl(e, t, n, r) {
  const i = Jb(n), a = n.enter("strong"), o = n.createTracker(r), s = o.move(i + i);
  let c = o.move(
    n.containerPhrasing(e, {
      after: i,
      before: s,
      ...o.current()
    })
  );
  const l = c.charCodeAt(0), u = fr(
    r.before.charCodeAt(r.before.length - 1),
    l,
    i
  );
  u.inside && (c = Nn(l) + c.slice(1));
  const d = c.charCodeAt(c.length - 1), p = fr(r.after.charCodeAt(0), d, i);
  p.inside && (c = c.slice(0, -1) + Nn(d));
  const f = o.move(i + i);
  return a(), n.attentionEncodeSurroundingInfo = {
    after: p.outside,
    before: u.outside
  }, s + c + f;
}
function ey(e, t, n) {
  return n.options.strong || "*";
}
function ty(e, t, n, r) {
  return n.safe(e.value, r);
}
function ny(e) {
  const t = e.options.ruleRepetition || 3;
  if (t < 3)
    throw new Error(
      "Cannot serialize rules with repetition `" + t + "` for `options.ruleRepetition`, expected `3` or more"
    );
  return t;
}
function ry(e, t, n) {
  const r = (_l(n) + (n.options.ruleSpaces ? " " : "")).repeat(ny(n));
  return n.options.ruleSpaces ? r.slice(0, -1) : r;
}
const xl = {
  blockquote: Nb,
  break: Na,
  code: Ib,
  definition: Db,
  emphasis: fl,
  hardBreak: Na,
  heading: Bb,
  html: pl,
  image: hl,
  imageReference: gl,
  inlineCode: ml,
  link: yl,
  linkReference: El,
  list: Vb,
  listItem: Zb,
  paragraph: Xb,
  root: Qb,
  strong: wl,
  text: ty,
  thematicBreak: ry
};
function iy() {
  return {
    enter: {
      table: oy,
      tableData: Ca,
      tableHeader: Ca,
      tableRow: sy
    },
    exit: {
      codeText: ly,
      table: ay,
      tableData: oi,
      tableHeader: oi,
      tableRow: oi
    }
  };
}
function oy(e) {
  const t = e._align;
  this.enter(
    {
      type: "table",
      align: t.map(function(n) {
        return n === "none" ? null : n;
      }),
      children: []
    },
    e
  ), this.data.inTable = !0;
}
function ay(e) {
  this.exit(e), this.data.inTable = void 0;
}
function sy(e) {
  this.enter({ type: "tableRow", children: [] }, e);
}
function oi(e) {
  this.exit(e);
}
function Ca(e) {
  this.enter({ type: "tableCell", children: [] }, e);
}
function ly(e) {
  let t = this.resume();
  this.data.inTable && (t = t.replace(/\\([\\|])/g, cy));
  const n = this.stack[this.stack.length - 1];
  n.type, n.value = t, this.exit(e);
}
function cy(e, t) {
  return t === "|" ? t : e;
}
function uy(e) {
  const t = e || {}, n = t.tableCellPadding, r = t.tablePipeAlign, i = t.stringLength, a = n ? " " : "|";
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
      table: o,
      tableCell: c,
      tableRow: s
    }
  };
  function o(f, h, m, b) {
    return l(u(f, m, b), f.align);
  }
  function s(f, h, m, b) {
    const g = d(f, m, b), x = l([g]);
    return x.slice(0, x.indexOf(`
`));
  }
  function c(f, h, m, b) {
    const g = m.enter("tableCell"), x = m.enter("phrasing"), _ = m.containerPhrasing(f, {
      ...b,
      before: a,
      after: a
    });
    return x(), g(), _;
  }
  function l(f, h) {
    return vb(f, {
      align: h,
      // @ts-expect-error: `markdown-table` types should support `null`.
      alignDelimiters: r,
      // @ts-expect-error: `markdown-table` types should support `null`.
      padding: n,
      // @ts-expect-error: `markdown-table` types should support `null`.
      stringLength: i
    });
  }
  function u(f, h, m) {
    const b = f.children;
    let g = -1;
    const x = [], _ = h.enter("table");
    for (; ++g < b.length; )
      x[g] = d(b[g], h, m);
    return _(), x;
  }
  function d(f, h, m) {
    const b = f.children;
    let g = -1;
    const x = [], _ = h.enter("tableRow");
    for (; ++g < b.length; )
      x[g] = c(b[g], f, h, m);
    return _(), x;
  }
  function p(f, h, m) {
    let b = xl.inlineCode(f, h, m);
    return m.stack.includes("tableCell") && (b = b.replace(/\|/g, "\\$&")), b;
  }
}
function dy() {
  return {
    exit: {
      taskListCheckValueChecked: Ta,
      taskListCheckValueUnchecked: Ta,
      paragraph: py
    }
  };
}
function fy() {
  return {
    unsafe: [{ atBreak: !0, character: "-", after: "[:|-]" }],
    handlers: { listItem: hy }
  };
}
function Ta(e) {
  const t = this.stack[this.stack.length - 2];
  t.type, t.checked = e.type === "taskListCheckValueChecked";
}
function py(e) {
  const t = this.stack[this.stack.length - 2];
  if (t && t.type === "listItem" && typeof t.checked == "boolean") {
    const n = this.stack[this.stack.length - 1];
    n.type;
    const r = n.children[0];
    if (r && r.type === "text") {
      const i = t.children;
      let a = -1, o;
      for (; ++a < i.length; ) {
        const s = i[a];
        if (s.type === "paragraph") {
          o = s;
          break;
        }
      }
      o === n && (r.value = r.value.slice(1), r.value.length === 0 ? n.children.shift() : n.position && r.position && typeof r.position.start.offset == "number" && (r.position.start.column++, r.position.start.offset++, n.position.start = Object.assign({}, r.position.start)));
    }
  }
  this.exit(e);
}
function hy(e, t, n, r) {
  const i = e.children[0], a = typeof e.checked == "boolean" && i && i.type === "paragraph", o = "[" + (e.checked ? "x" : " ") + "] ", s = n.createTracker(r);
  a && s.move(o);
  let c = xl.listItem(e, t, n, {
    ...r,
    ...s.current()
  });
  return a && (c = c.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, l)), c;
  function l(u) {
    return u + o;
  }
}
function gy() {
  return [
    Vm(),
    hb(),
    yb(),
    iy(),
    dy()
  ];
}
function my(e) {
  return {
    extensions: [
      Ym(),
      gb(e),
      Eb(),
      uy(e),
      fy()
    ]
  };
}
const by = {
  tokenize: ky,
  partial: !0
}, kl = {
  tokenize: vy,
  partial: !0
}, vl = {
  tokenize: Sy,
  partial: !0
}, Sl = {
  tokenize: Ny,
  partial: !0
}, yy = {
  tokenize: Cy,
  partial: !0
}, Nl = {
  name: "wwwAutolink",
  tokenize: wy,
  previous: Tl
}, Cl = {
  name: "protocolAutolink",
  tokenize: xy,
  previous: Al
}, St = {
  name: "emailAutolink",
  tokenize: _y,
  previous: Rl
}, gt = {};
function Ey() {
  return {
    text: gt
  };
}
let Ut = 48;
for (; Ut < 123; )
  gt[Ut] = St, Ut++, Ut === 58 ? Ut = 65 : Ut === 91 && (Ut = 97);
gt[43] = St;
gt[45] = St;
gt[46] = St;
gt[95] = St;
gt[72] = [St, Cl];
gt[104] = [St, Cl];
gt[87] = [St, Nl];
gt[119] = [St, Nl];
function _y(e, t, n) {
  const r = this;
  let i, a;
  return o;
  function o(d) {
    return !ki(d) || !Rl.call(r, r.previous) || Ji(r.events) ? n(d) : (e.enter("literalAutolink"), e.enter("literalAutolinkEmail"), s(d));
  }
  function s(d) {
    return ki(d) ? (e.consume(d), s) : d === 64 ? (e.consume(d), c) : n(d);
  }
  function c(d) {
    return d === 46 ? e.check(yy, u, l)(d) : d === 45 || d === 95 || De(d) ? (a = !0, e.consume(d), c) : u(d);
  }
  function l(d) {
    return e.consume(d), i = !0, c;
  }
  function u(d) {
    return a && i && He(r.previous) ? (e.exit("literalAutolinkEmail"), e.exit("literalAutolink"), t(d)) : n(d);
  }
}
function wy(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return o !== 87 && o !== 119 || !Tl.call(r, r.previous) || Ji(r.events) ? n(o) : (e.enter("literalAutolink"), e.enter("literalAutolinkWww"), e.check(by, e.attempt(kl, e.attempt(vl, a), n), n)(o));
  }
  function a(o) {
    return e.exit("literalAutolinkWww"), e.exit("literalAutolink"), t(o);
  }
}
function xy(e, t, n) {
  const r = this;
  let i = "", a = !1;
  return o;
  function o(d) {
    return (d === 72 || d === 104) && Al.call(r, r.previous) && !Ji(r.events) ? (e.enter("literalAutolink"), e.enter("literalAutolinkHttp"), i += String.fromCodePoint(d), e.consume(d), s) : n(d);
  }
  function s(d) {
    if (He(d) && i.length < 5)
      return i += String.fromCodePoint(d), e.consume(d), s;
    if (d === 58) {
      const p = i.toLowerCase();
      if (p === "http" || p === "https")
        return e.consume(d), c;
    }
    return n(d);
  }
  function c(d) {
    return d === 47 ? (e.consume(d), a ? l : (a = !0, c)) : n(d);
  }
  function l(d) {
    return d === null || sr(d) || be(d) || Gt(d) || yr(d) ? n(d) : e.attempt(kl, e.attempt(vl, u), n)(d);
  }
  function u(d) {
    return e.exit("literalAutolinkHttp"), e.exit("literalAutolink"), t(d);
  }
}
function ky(e, t, n) {
  let r = 0;
  return i;
  function i(o) {
    return (o === 87 || o === 119) && r < 3 ? (r++, e.consume(o), i) : o === 46 && r === 3 ? (e.consume(o), a) : n(o);
  }
  function a(o) {
    return o === null ? n(o) : t(o);
  }
}
function vy(e, t, n) {
  let r, i, a;
  return o;
  function o(l) {
    return l === 46 || l === 95 ? e.check(Sl, c, s)(l) : l === null || be(l) || Gt(l) || l !== 45 && yr(l) ? c(l) : (a = !0, e.consume(l), o);
  }
  function s(l) {
    return l === 95 ? r = !0 : (i = r, r = void 0), e.consume(l), o;
  }
  function c(l) {
    return i || r || !a ? n(l) : t(l);
  }
}
function Sy(e, t) {
  let n = 0, r = 0;
  return i;
  function i(o) {
    return o === 40 ? (n++, e.consume(o), i) : o === 41 && r < n ? a(o) : o === 33 || o === 34 || o === 38 || o === 39 || o === 41 || o === 42 || o === 44 || o === 46 || o === 58 || o === 59 || o === 60 || o === 63 || o === 93 || o === 95 || o === 126 ? e.check(Sl, t, a)(o) : o === null || be(o) || Gt(o) ? t(o) : (e.consume(o), i);
  }
  function a(o) {
    return o === 41 && r++, e.consume(o), i;
  }
}
function Ny(e, t, n) {
  return r;
  function r(s) {
    return s === 33 || s === 34 || s === 39 || s === 41 || s === 42 || s === 44 || s === 46 || s === 58 || s === 59 || s === 63 || s === 95 || s === 126 ? (e.consume(s), r) : s === 38 ? (e.consume(s), a) : s === 93 ? (e.consume(s), i) : (
      // `<` is an end.
      s === 60 || // So is whitespace.
      s === null || be(s) || Gt(s) ? t(s) : n(s)
    );
  }
  function i(s) {
    return s === null || s === 40 || s === 91 || be(s) || Gt(s) ? t(s) : r(s);
  }
  function a(s) {
    return He(s) ? o(s) : n(s);
  }
  function o(s) {
    return s === 59 ? (e.consume(s), r) : He(s) ? (e.consume(s), o) : n(s);
  }
}
function Cy(e, t, n) {
  return r;
  function r(a) {
    return e.consume(a), i;
  }
  function i(a) {
    return De(a) ? n(a) : t(a);
  }
}
function Tl(e) {
  return e === null || e === 40 || e === 42 || e === 95 || e === 91 || e === 93 || e === 126 || be(e);
}
function Al(e) {
  return !He(e);
}
function Rl(e) {
  return !(e === 47 || ki(e));
}
function ki(e) {
  return e === 43 || e === 45 || e === 46 || e === 95 || De(e);
}
function Ji(e) {
  let t = e.length, n = !1;
  for (; t--; ) {
    const r = e[t][1];
    if ((r.type === "labelLink" || r.type === "labelImage") && !r._balanced) {
      n = !0;
      break;
    }
    if (r._gfmAutolinkLiteralWalkedInto) {
      n = !1;
      break;
    }
  }
  return e.length > 0 && !n && (e[e.length - 1][1]._gfmAutolinkLiteralWalkedInto = !0), n;
}
const Ty = {
  tokenize: Py,
  partial: !0
};
function Ay() {
  return {
    document: {
      91: {
        name: "gfmFootnoteDefinition",
        tokenize: My,
        continuation: {
          tokenize: Dy
        },
        exit: Ly
      }
    },
    text: {
      91: {
        name: "gfmFootnoteCall",
        tokenize: Iy
      },
      93: {
        name: "gfmPotentialFootnoteCall",
        add: "after",
        tokenize: Ry,
        resolveTo: Oy
      }
    }
  };
}
function Ry(e, t, n) {
  const r = this;
  let i = r.events.length;
  const a = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let o;
  for (; i--; ) {
    const c = r.events[i][1];
    if (c.type === "labelImage") {
      o = c;
      break;
    }
    if (c.type === "gfmFootnoteCall" || c.type === "labelLink" || c.type === "label" || c.type === "image" || c.type === "link")
      break;
  }
  return s;
  function s(c) {
    if (!o || !o._balanced)
      return n(c);
    const l = it(r.sliceSerialize({
      start: o.end,
      end: r.now()
    }));
    return l.codePointAt(0) !== 94 || !a.includes(l.slice(1)) ? n(c) : (e.enter("gfmFootnoteCallLabelMarker"), e.consume(c), e.exit("gfmFootnoteCallLabelMarker"), t(c));
  }
}
function Oy(e, t) {
  let n = e.length;
  for (; n--; )
    if (e[n][1].type === "labelImage" && e[n][0] === "enter") {
      e[n][1];
      break;
    }
  e[n + 1][1].type = "data", e[n + 3][1].type = "gfmFootnoteCallLabelMarker";
  const r = {
    type: "gfmFootnoteCall",
    start: Object.assign({}, e[n + 3][1].start),
    end: Object.assign({}, e[e.length - 1][1].end)
  }, i = {
    type: "gfmFootnoteCallMarker",
    start: Object.assign({}, e[n + 3][1].end),
    end: Object.assign({}, e[n + 3][1].end)
  };
  i.end.column++, i.end.offset++, i.end._bufferIndex++;
  const a = {
    type: "gfmFootnoteCallString",
    start: Object.assign({}, i.end),
    end: Object.assign({}, e[e.length - 1][1].start)
  }, o = {
    type: "chunkString",
    contentType: "string",
    start: Object.assign({}, a.start),
    end: Object.assign({}, a.end)
  }, s = [
    // Take the `labelImageMarker` (now `data`, the `!`)
    e[n + 1],
    e[n + 2],
    ["enter", r, t],
    // The `[`
    e[n + 3],
    e[n + 4],
    // The `^`.
    ["enter", i, t],
    ["exit", i, t],
    // Everything in between.
    ["enter", a, t],
    ["enter", o, t],
    ["exit", o, t],
    ["exit", a, t],
    // The ending (`]`, properly parsed and labelled).
    e[e.length - 2],
    e[e.length - 1],
    ["exit", r, t]
  ];
  return e.splice(n, e.length - n + 1, ...s), e;
}
function Iy(e, t, n) {
  const r = this, i = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let a = 0, o;
  return s;
  function s(d) {
    return e.enter("gfmFootnoteCall"), e.enter("gfmFootnoteCallLabelMarker"), e.consume(d), e.exit("gfmFootnoteCallLabelMarker"), c;
  }
  function c(d) {
    return d !== 94 ? n(d) : (e.enter("gfmFootnoteCallMarker"), e.consume(d), e.exit("gfmFootnoteCallMarker"), e.enter("gfmFootnoteCallString"), e.enter("chunkString").contentType = "string", l);
  }
  function l(d) {
    if (
      // Too long.
      a > 999 || // Closing brace with nothing.
      d === 93 && !o || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      d === null || d === 91 || be(d)
    )
      return n(d);
    if (d === 93) {
      e.exit("chunkString");
      const p = e.exit("gfmFootnoteCallString");
      return i.includes(it(r.sliceSerialize(p))) ? (e.enter("gfmFootnoteCallLabelMarker"), e.consume(d), e.exit("gfmFootnoteCallLabelMarker"), e.exit("gfmFootnoteCall"), t) : n(d);
    }
    return be(d) || (o = !0), a++, e.consume(d), d === 92 ? u : l;
  }
  function u(d) {
    return d === 91 || d === 92 || d === 93 ? (e.consume(d), a++, l) : l(d);
  }
}
function My(e, t, n) {
  const r = this, i = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let a, o = 0, s;
  return c;
  function c(h) {
    return e.enter("gfmFootnoteDefinition")._container = !0, e.enter("gfmFootnoteDefinitionLabel"), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(h), e.exit("gfmFootnoteDefinitionLabelMarker"), l;
  }
  function l(h) {
    return h === 94 ? (e.enter("gfmFootnoteDefinitionMarker"), e.consume(h), e.exit("gfmFootnoteDefinitionMarker"), e.enter("gfmFootnoteDefinitionLabelString"), e.enter("chunkString").contentType = "string", u) : n(h);
  }
  function u(h) {
    if (
      // Too long.
      o > 999 || // Closing brace with nothing.
      h === 93 && !s || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      h === null || h === 91 || be(h)
    )
      return n(h);
    if (h === 93) {
      e.exit("chunkString");
      const m = e.exit("gfmFootnoteDefinitionLabelString");
      return a = it(r.sliceSerialize(m)), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(h), e.exit("gfmFootnoteDefinitionLabelMarker"), e.exit("gfmFootnoteDefinitionLabel"), p;
    }
    return be(h) || (s = !0), o++, e.consume(h), h === 92 ? d : u;
  }
  function d(h) {
    return h === 91 || h === 92 || h === 93 ? (e.consume(h), o++, u) : u(h);
  }
  function p(h) {
    return h === 58 ? (e.enter("definitionMarker"), e.consume(h), e.exit("definitionMarker"), i.includes(a) || i.push(a), ce(e, f, "gfmFootnoteDefinitionWhitespace")) : n(h);
  }
  function f(h) {
    return t(h);
  }
}
function Dy(e, t, n) {
  return e.check(On, t, e.attempt(Ty, t, n));
}
function Ly(e) {
  e.exit("gfmFootnoteDefinition");
}
function Py(e, t, n) {
  const r = this;
  return ce(e, i, "gfmFootnoteDefinitionIndent", 5);
  function i(a) {
    const o = r.events[r.events.length - 1];
    return o && o[1].type === "gfmFootnoteDefinitionIndent" && o[2].sliceSerialize(o[1], !0).length === 4 ? t(a) : n(a);
  }
}
function Fy(e) {
  let n = (e || {}).singleTilde;
  const r = {
    name: "strikethrough",
    tokenize: a,
    resolveAll: i
  };
  return n == null && (n = !0), {
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
  function i(o, s) {
    let c = -1;
    for (; ++c < o.length; )
      if (o[c][0] === "enter" && o[c][1].type === "strikethroughSequenceTemporary" && o[c][1]._close) {
        let l = c;
        for (; l--; )
          if (o[l][0] === "exit" && o[l][1].type === "strikethroughSequenceTemporary" && o[l][1]._open && // If the sizes are the same:
          o[c][1].end.offset - o[c][1].start.offset === o[l][1].end.offset - o[l][1].start.offset) {
            o[c][1].type = "strikethroughSequence", o[l][1].type = "strikethroughSequence";
            const u = {
              type: "strikethrough",
              start: Object.assign({}, o[l][1].start),
              end: Object.assign({}, o[c][1].end)
            }, d = {
              type: "strikethroughText",
              start: Object.assign({}, o[l][1].end),
              end: Object.assign({}, o[c][1].start)
            }, p = [["enter", u, s], ["enter", o[l][1], s], ["exit", o[l][1], s], ["enter", d, s]], f = s.parser.constructs.insideSpan.null;
            f && je(p, p.length, 0, Er(f, o.slice(l + 1, c), s)), je(p, p.length, 0, [["exit", d, s], ["enter", o[c][1], s], ["exit", o[c][1], s], ["exit", u, s]]), je(o, l - 1, c - l + 3, p), c = l + p.length - 2;
            break;
          }
      }
    for (c = -1; ++c < o.length; )
      o[c][1].type === "strikethroughSequenceTemporary" && (o[c][1].type = "data");
    return o;
  }
  function a(o, s, c) {
    const l = this.previous, u = this.events;
    let d = 0;
    return p;
    function p(h) {
      return l === 126 && u[u.length - 1][1].type !== "characterEscape" ? c(h) : (o.enter("strikethroughSequenceTemporary"), f(h));
    }
    function f(h) {
      const m = rn(l);
      if (h === 126)
        return d > 1 ? c(h) : (o.consume(h), d++, f);
      if (d < 2 && !n) return c(h);
      const b = o.exit("strikethroughSequenceTemporary"), g = rn(h);
      return b._open = !g || g === 2 && !!m, b._close = !m || m === 2 && !!g, s(h);
    }
  }
}
class By {
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
  add(t, n, r) {
    zy(this, t, n, r);
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
  consume(t) {
    if (this.map.sort(function(a, o) {
      return a[0] - o[0];
    }), this.map.length === 0)
      return;
    let n = this.map.length;
    const r = [];
    for (; n > 0; )
      n -= 1, r.push(t.slice(this.map[n][0] + this.map[n][1]), this.map[n][2]), t.length = this.map[n][0];
    r.push(t.slice()), t.length = 0;
    let i = r.pop();
    for (; i; ) {
      for (const a of i)
        t.push(a);
      i = r.pop();
    }
    this.map.length = 0;
  }
}
function zy(e, t, n, r) {
  let i = 0;
  if (!(n === 0 && r.length === 0)) {
    for (; i < e.map.length; ) {
      if (e.map[i][0] === t) {
        e.map[i][1] += n, e.map[i][2].push(...r);
        return;
      }
      i += 1;
    }
    e.map.push([t, n, r]);
  }
}
function Uy(e, t) {
  let n = !1;
  const r = [];
  for (; t < e.length; ) {
    const i = e[t];
    if (n) {
      if (i[0] === "enter")
        i[1].type === "tableContent" && r.push(e[t + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
      else if (i[1].type === "tableContent") {
        if (e[t - 1][1].type === "tableDelimiterMarker") {
          const a = r.length - 1;
          r[a] = r[a] === "left" ? "center" : "right";
        }
      } else if (i[1].type === "tableDelimiterRow")
        break;
    } else i[0] === "enter" && i[1].type === "tableDelimiterRow" && (n = !0);
    t += 1;
  }
  return r;
}
function $y() {
  return {
    flow: {
      null: {
        name: "table",
        tokenize: Hy,
        resolveAll: Gy
      }
    }
  };
}
function Hy(e, t, n) {
  const r = this;
  let i = 0, a = 0, o;
  return s;
  function s(S) {
    let L = r.events.length - 1;
    for (; L > -1; ) {
      const P = r.events[L][1].type;
      if (P === "lineEnding" || // Note: markdown-rs uses `whitespace` instead of `linePrefix`
      P === "linePrefix") L--;
      else break;
    }
    const B = L > -1 ? r.events[L][1].type : null, W = B === "tableHead" || B === "tableRow" ? k : c;
    return W === k && r.parser.lazy[r.now().line] ? n(S) : W(S);
  }
  function c(S) {
    return e.enter("tableHead"), e.enter("tableRow"), l(S);
  }
  function l(S) {
    return S === 124 || (o = !0, a += 1), u(S);
  }
  function u(S) {
    return S === null ? n(S) : j(S) ? a > 1 ? (a = 0, r.interrupt = !0, e.exit("tableRow"), e.enter("lineEnding"), e.consume(S), e.exit("lineEnding"), f) : n(S) : se(S) ? ce(e, u, "whitespace")(S) : (a += 1, o && (o = !1, i += 1), S === 124 ? (e.enter("tableCellDivider"), e.consume(S), e.exit("tableCellDivider"), o = !0, u) : (e.enter("data"), d(S)));
  }
  function d(S) {
    return S === null || S === 124 || be(S) ? (e.exit("data"), u(S)) : (e.consume(S), S === 92 ? p : d);
  }
  function p(S) {
    return S === 92 || S === 124 ? (e.consume(S), d) : d(S);
  }
  function f(S) {
    return r.interrupt = !1, r.parser.lazy[r.now().line] ? n(S) : (e.enter("tableDelimiterRow"), o = !1, se(S) ? ce(e, h, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(S) : h(S));
  }
  function h(S) {
    return S === 45 || S === 58 ? b(S) : S === 124 ? (o = !0, e.enter("tableCellDivider"), e.consume(S), e.exit("tableCellDivider"), m) : T(S);
  }
  function m(S) {
    return se(S) ? ce(e, b, "whitespace")(S) : b(S);
  }
  function b(S) {
    return S === 58 ? (a += 1, o = !0, e.enter("tableDelimiterMarker"), e.consume(S), e.exit("tableDelimiterMarker"), g) : S === 45 ? (a += 1, g(S)) : S === null || j(S) ? C(S) : T(S);
  }
  function g(S) {
    return S === 45 ? (e.enter("tableDelimiterFiller"), x(S)) : T(S);
  }
  function x(S) {
    return S === 45 ? (e.consume(S), x) : S === 58 ? (o = !0, e.exit("tableDelimiterFiller"), e.enter("tableDelimiterMarker"), e.consume(S), e.exit("tableDelimiterMarker"), _) : (e.exit("tableDelimiterFiller"), _(S));
  }
  function _(S) {
    return se(S) ? ce(e, C, "whitespace")(S) : C(S);
  }
  function C(S) {
    return S === 124 ? h(S) : S === null || j(S) ? !o || i !== a ? T(S) : (e.exit("tableDelimiterRow"), e.exit("tableHead"), t(S)) : T(S);
  }
  function T(S) {
    return n(S);
  }
  function k(S) {
    return e.enter("tableRow"), I(S);
  }
  function I(S) {
    return S === 124 ? (e.enter("tableCellDivider"), e.consume(S), e.exit("tableCellDivider"), I) : S === null || j(S) ? (e.exit("tableRow"), t(S)) : se(S) ? ce(e, I, "whitespace")(S) : (e.enter("data"), A(S));
  }
  function A(S) {
    return S === null || S === 124 || be(S) ? (e.exit("data"), I(S)) : (e.consume(S), S === 92 ? O : A);
  }
  function O(S) {
    return S === 92 || S === 124 ? (e.consume(S), A) : A(S);
  }
}
function Gy(e, t) {
  let n = -1, r = !0, i = 0, a = [0, 0, 0, 0], o = [0, 0, 0, 0], s = !1, c = 0, l, u, d;
  const p = new By();
  for (; ++n < e.length; ) {
    const f = e[n], h = f[1];
    f[0] === "enter" ? h.type === "tableHead" ? (s = !1, c !== 0 && (Aa(p, t, c, l, u), u = void 0, c = 0), l = {
      type: "table",
      start: Object.assign({}, h.start),
      // Note: correct end is set later.
      end: Object.assign({}, h.end)
    }, p.add(n, 0, [["enter", l, t]])) : h.type === "tableRow" || h.type === "tableDelimiterRow" ? (r = !0, d = void 0, a = [0, 0, 0, 0], o = [0, n + 1, 0, 0], s && (s = !1, u = {
      type: "tableBody",
      start: Object.assign({}, h.start),
      // Note: correct end is set later.
      end: Object.assign({}, h.end)
    }, p.add(n, 0, [["enter", u, t]])), i = h.type === "tableDelimiterRow" ? 2 : u ? 3 : 1) : i && (h.type === "data" || h.type === "tableDelimiterMarker" || h.type === "tableDelimiterFiller") ? (r = !1, o[2] === 0 && (a[1] !== 0 && (o[0] = o[1], d = tr(p, t, a, i, void 0, d), a = [0, 0, 0, 0]), o[2] = n)) : h.type === "tableCellDivider" && (r ? r = !1 : (a[1] !== 0 && (o[0] = o[1], d = tr(p, t, a, i, void 0, d)), a = o, o = [a[1], n, 0, 0])) : h.type === "tableHead" ? (s = !0, c = n) : h.type === "tableRow" || h.type === "tableDelimiterRow" ? (c = n, a[1] !== 0 ? (o[0] = o[1], d = tr(p, t, a, i, n, d)) : o[1] !== 0 && (d = tr(p, t, o, i, n, d)), i = 0) : i && (h.type === "data" || h.type === "tableDelimiterMarker" || h.type === "tableDelimiterFiller") && (o[3] = n);
  }
  for (c !== 0 && Aa(p, t, c, l, u), p.consume(t.events), n = -1; ++n < t.events.length; ) {
    const f = t.events[n];
    f[0] === "enter" && f[1].type === "table" && (f[1]._align = Uy(t.events, n));
  }
  return e;
}
function tr(e, t, n, r, i, a) {
  const o = r === 1 ? "tableHeader" : r === 2 ? "tableDelimiter" : "tableData", s = "tableContent";
  n[0] !== 0 && (a.end = Object.assign({}, tn(t.events, n[0])), e.add(n[0], 0, [["exit", a, t]]));
  const c = tn(t.events, n[1]);
  if (a = {
    type: o,
    start: Object.assign({}, c),
    // Note: correct end is set later.
    end: Object.assign({}, c)
  }, e.add(n[1], 0, [["enter", a, t]]), n[2] !== 0) {
    const l = tn(t.events, n[2]), u = tn(t.events, n[3]), d = {
      type: s,
      start: Object.assign({}, l),
      end: Object.assign({}, u)
    };
    if (e.add(n[2], 0, [["enter", d, t]]), r !== 2) {
      const p = t.events[n[2]], f = t.events[n[3]];
      if (p[1].end = Object.assign({}, f[1].end), p[1].type = "chunkText", p[1].contentType = "text", n[3] > n[2] + 1) {
        const h = n[2] + 1, m = n[3] - n[2] - 1;
        e.add(h, m, []);
      }
    }
    e.add(n[3] + 1, 0, [["exit", d, t]]);
  }
  return i !== void 0 && (a.end = Object.assign({}, tn(t.events, i)), e.add(i, 0, [["exit", a, t]]), a = void 0), a;
}
function Aa(e, t, n, r, i) {
  const a = [], o = tn(t.events, n);
  i && (i.end = Object.assign({}, o), a.push(["exit", i, t])), r.end = Object.assign({}, o), a.push(["exit", r, t]), e.add(n + 1, 0, a);
}
function tn(e, t) {
  const n = e[t], r = n[0] === "enter" ? "start" : "end";
  return n[1][r];
}
const Ky = {
  name: "tasklistCheck",
  tokenize: Wy
};
function qy() {
  return {
    text: {
      91: Ky
    }
  };
}
function Wy(e, t, n) {
  const r = this;
  return i;
  function i(c) {
    return (
      // Exit if there’s stuff before.
      r.previous !== null || // Exit if not in the first content that is the first child of a list
      // item.
      !r._gfmTasklistFirstContentOfListItem ? n(c) : (e.enter("taskListCheck"), e.enter("taskListCheckMarker"), e.consume(c), e.exit("taskListCheckMarker"), a)
    );
  }
  function a(c) {
    return be(c) ? (e.enter("taskListCheckValueUnchecked"), e.consume(c), e.exit("taskListCheckValueUnchecked"), o) : c === 88 || c === 120 ? (e.enter("taskListCheckValueChecked"), e.consume(c), e.exit("taskListCheckValueChecked"), o) : n(c);
  }
  function o(c) {
    return c === 93 ? (e.enter("taskListCheckMarker"), e.consume(c), e.exit("taskListCheckMarker"), e.exit("taskListCheck"), s) : n(c);
  }
  function s(c) {
    return j(c) ? t(c) : se(c) ? e.check({
      tokenize: Vy
    }, t, n)(c) : n(c);
  }
}
function Vy(e, t, n) {
  return ce(e, r, "whitespace");
  function r(i) {
    return i === null ? n(i) : t(i);
  }
}
function Yy(e) {
  return Es([
    Ey(),
    Ay(),
    Fy(e),
    $y(),
    qy()
  ]);
}
const Zy = {};
function vi(e) {
  const t = (
    /** @type {Processor<Root>} */
    this
  ), n = e || Zy, r = t.data(), i = r.micromarkExtensions || (r.micromarkExtensions = []), a = r.fromMarkdownExtensions || (r.fromMarkdownExtensions = []), o = r.toMarkdownExtensions || (r.toMarkdownExtensions = []);
  i.push(Yy(n)), a.push(gy()), o.push(my(n));
}
function Xy({ filename: e, hunks: t }) {
  return /* @__PURE__ */ v("div", { className: "chat-v2-diff", "aria-label": `Diff for ${e}`, children: t.map((n) => /* @__PURE__ */ Y("section", { className: "chat-v2-diff-hunk", children: [
    /* @__PURE__ */ v("div", { className: "chat-v2-diff-header", children: n.header }),
    n.lines.map((r, i) => /* @__PURE__ */ Y("div", { className: `chat-v2-diff-line is-${r.type}`, children: [
      /* @__PURE__ */ v("span", { children: r.oldLine ?? "" }),
      /* @__PURE__ */ v("span", { children: r.newLine ?? "" }),
      /* @__PURE__ */ Y("code", { children: [
        r.type === "add" ? "+" : r.type === "del" ? "-" : " ",
        r.text
      ] })
    ] }, `${n.header}:${i}`))
  ] }, `${e}:${n.header}`)) });
}
function Ne(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return function(i) {
    if (e?.(i), n === !1 || !i.defaultPrevented)
      return t?.(i);
  };
}
function Lt(e, t = []) {
  let n = [];
  function r(a, o) {
    const s = N.createContext(o), c = n.length;
    n = [...n, o];
    const l = (d) => {
      const { scope: p, children: f, ...h } = d, m = p?.[e]?.[c] || s, b = N.useMemo(() => h, Object.values(h));
      return /* @__PURE__ */ v(m.Provider, { value: b, children: f });
    };
    l.displayName = a + "Provider";
    function u(d, p) {
      const f = p?.[e]?.[c] || s, h = N.useContext(f);
      if (h) return h;
      if (o !== void 0) return o;
      throw new Error(`\`${d}\` must be used within \`${a}\``);
    }
    return [l, u];
  }
  const i = () => {
    const a = n.map((o) => N.createContext(o));
    return function(s) {
      const c = s?.[e] || a;
      return N.useMemo(
        () => ({ [`__scope${e}`]: { ...s, [e]: c } }),
        [s, c]
      );
    };
  };
  return i.scopeName = e, [r, jy(i, ...t)];
}
function jy(...e) {
  const t = e[0];
  if (e.length === 1) return t;
  const n = () => {
    const r = e.map((i) => ({
      useScope: i(),
      scopeName: i.scopeName
    }));
    return function(a) {
      const o = r.reduce((s, { useScope: c, scopeName: l }) => {
        const d = c(a)[`__scope${l}`];
        return { ...s, ...d };
      }, {});
      return N.useMemo(() => ({ [`__scope${t.scopeName}`]: o }), [o]);
    };
  };
  return n.scopeName = t.scopeName, n;
}
var xt = globalThis?.document ? N.useLayoutEffect : () => {
}, Qy = N[" useInsertionEffect ".trim().toString()] || xt;
function Dn({
  prop: e,
  defaultProp: t,
  onChange: n = () => {
  },
  caller: r
}) {
  const [i, a, o] = Jy({
    defaultProp: t,
    onChange: n
  }), s = e !== void 0, c = s ? e : i;
  {
    const u = N.useRef(e !== void 0);
    N.useEffect(() => {
      const d = u.current;
      d !== s && console.warn(
        `${r} is changing from ${d ? "controlled" : "uncontrolled"} to ${s ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), u.current = s;
    }, [s, r]);
  }
  const l = N.useCallback(
    (u) => {
      if (s) {
        const d = eE(u) ? u(e) : u;
        d !== e && o.current?.(d);
      } else
        a(u);
    },
    [s, e, a, o]
  );
  return [c, l];
}
function Jy({
  defaultProp: e,
  onChange: t
}) {
  const [n, r] = N.useState(e), i = N.useRef(n), a = N.useRef(t);
  return Qy(() => {
    a.current = t;
  }, [t]), N.useEffect(() => {
    i.current !== n && (a.current?.(n), i.current = n);
  }, [n, i]), [n, r, a];
}
function eE(e) {
  return typeof e == "function";
}
function Ra(e, t) {
  if (typeof e == "function")
    return e(t);
  e != null && (e.current = t);
}
function Ol(...e) {
  return (t) => {
    let n = !1;
    const r = e.map((i) => {
      const a = Ra(i, t);
      return !n && typeof a == "function" && (n = !0), a;
    });
    if (n)
      return () => {
        for (let i = 0; i < r.length; i++) {
          const a = r[i];
          typeof a == "function" ? a() : Ra(e[i], null);
        }
      };
  };
}
function Le(...e) {
  return N.useCallback(Ol(...e), e);
}
// @__NO_SIDE_EFFECTS__
function Si(e) {
  const t = /* @__PURE__ */ tE(e), n = N.forwardRef((r, i) => {
    const { children: a, ...o } = r, s = N.Children.toArray(a), c = s.find(rE);
    if (c) {
      const l = c.props.children, u = s.map((d) => d === c ? N.Children.count(l) > 1 ? N.Children.only(null) : N.isValidElement(l) ? l.props.children : null : d);
      return /* @__PURE__ */ v(t, { ...o, ref: i, children: N.isValidElement(l) ? N.cloneElement(l, void 0, u) : null });
    }
    return /* @__PURE__ */ v(t, { ...o, ref: i, children: a });
  });
  return n.displayName = `${e}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function tE(e) {
  const t = N.forwardRef((n, r) => {
    const { children: i, ...a } = n;
    if (N.isValidElement(i)) {
      const o = oE(i), s = iE(a, i.props);
      return i.type !== N.Fragment && (s.ref = r ? Ol(r, o) : o), N.cloneElement(i, s);
    }
    return N.Children.count(i) > 1 ? N.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var Il = /* @__PURE__ */ Symbol("radix.slottable");
// @__NO_SIDE_EFFECTS__
function nE(e) {
  const t = ({ children: n }) => /* @__PURE__ */ v(br, { children: n });
  return t.displayName = `${e}.Slottable`, t.__radixId = Il, t;
}
function rE(e) {
  return N.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Il;
}
function iE(e, t) {
  const n = { ...t };
  for (const r in t) {
    const i = e[r], a = t[r];
    /^on[A-Z]/.test(r) ? i && a ? n[r] = (...s) => {
      const c = a(...s);
      return i(...s), c;
    } : i && (n[r] = i) : r === "style" ? n[r] = { ...i, ...a } : r === "className" && (n[r] = [i, a].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function oE(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var aE = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
], Te = aE.reduce((e, t) => {
  const n = /* @__PURE__ */ Si(`Primitive.${t}`), r = N.forwardRef((i, a) => {
    const { asChild: o, ...s } = i, c = o ? n : t;
    return typeof window < "u" && (window[/* @__PURE__ */ Symbol.for("radix-ui")] = !0), /* @__PURE__ */ v(c, { ...s, ref: a });
  });
  return r.displayName = `Primitive.${t}`, { ...e, [t]: r };
}, {});
function sE(e, t) {
  e && Xa.flushSync(() => e.dispatchEvent(t));
}
function lE(e, t) {
  return N.useReducer((n, r) => t[n][r] ?? n, e);
}
var Ln = (e) => {
  const { present: t, children: n } = e, r = cE(t), i = typeof n == "function" ? n({ present: r.isPresent }) : N.Children.only(n), a = Le(r.ref, uE(i));
  return typeof n == "function" || r.isPresent ? N.cloneElement(i, { ref: a }) : null;
};
Ln.displayName = "Presence";
function cE(e) {
  const [t, n] = N.useState(), r = N.useRef(null), i = N.useRef(e), a = N.useRef("none"), o = e ? "mounted" : "unmounted", [s, c] = lE(o, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  return N.useEffect(() => {
    const l = nr(r.current);
    a.current = s === "mounted" ? l : "none";
  }, [s]), xt(() => {
    const l = r.current, u = i.current;
    if (u !== e) {
      const p = a.current, f = nr(l);
      e ? c("MOUNT") : f === "none" || l?.display === "none" ? c("UNMOUNT") : c(u && p !== f ? "ANIMATION_OUT" : "UNMOUNT"), i.current = e;
    }
  }, [e, c]), xt(() => {
    if (t) {
      let l;
      const u = t.ownerDocument.defaultView ?? window, d = (f) => {
        const m = nr(r.current).includes(CSS.escape(f.animationName));
        if (f.target === t && m && (c("ANIMATION_END"), !i.current)) {
          const b = t.style.animationFillMode;
          t.style.animationFillMode = "forwards", l = u.setTimeout(() => {
            t.style.animationFillMode === "forwards" && (t.style.animationFillMode = b);
          });
        }
      }, p = (f) => {
        f.target === t && (a.current = nr(r.current));
      };
      return t.addEventListener("animationstart", p), t.addEventListener("animationcancel", d), t.addEventListener("animationend", d), () => {
        u.clearTimeout(l), t.removeEventListener("animationstart", p), t.removeEventListener("animationcancel", d), t.removeEventListener("animationend", d);
      };
    } else
      c("ANIMATION_END");
  }, [t, c]), {
    isPresent: ["mounted", "unmountSuspended"].includes(s),
    ref: N.useCallback((l) => {
      r.current = l ? getComputedStyle(l) : null, n(l);
    }, [])
  };
}
function nr(e) {
  return e?.animationName || "none";
}
function uE(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var dE = N[" useId ".trim().toString()] || (() => {
}), fE = 0;
function eo(e) {
  const [t, n] = N.useState(dE());
  return xt(() => {
    n((r) => r ?? String(fE++));
  }, [e]), t ? `radix-${t}` : "";
}
var kr = "Collapsible", [pE] = Lt(kr), [hE, to] = pE(kr), Ml = N.forwardRef(
  (e, t) => {
    const {
      __scopeCollapsible: n,
      open: r,
      defaultOpen: i,
      disabled: a,
      onOpenChange: o,
      ...s
    } = e, [c, l] = Dn({
      prop: r,
      defaultProp: i ?? !1,
      onChange: o,
      caller: kr
    });
    return /* @__PURE__ */ v(
      hE,
      {
        scope: n,
        disabled: a,
        contentId: eo(),
        open: c,
        onOpenToggle: N.useCallback(() => l((u) => !u), [l]),
        children: /* @__PURE__ */ v(
          Te.div,
          {
            "data-state": ro(c),
            "data-disabled": a ? "" : void 0,
            ...s,
            ref: t
          }
        )
      }
    );
  }
);
Ml.displayName = kr;
var Dl = "CollapsibleTrigger", Ll = N.forwardRef(
  (e, t) => {
    const { __scopeCollapsible: n, ...r } = e, i = to(Dl, n);
    return /* @__PURE__ */ v(
      Te.button,
      {
        type: "button",
        "aria-controls": i.contentId,
        "aria-expanded": i.open || !1,
        "data-state": ro(i.open),
        "data-disabled": i.disabled ? "" : void 0,
        disabled: i.disabled,
        ...r,
        ref: t,
        onClick: Ne(e.onClick, i.onOpenToggle)
      }
    );
  }
);
Ll.displayName = Dl;
var no = "CollapsibleContent", Pl = N.forwardRef(
  (e, t) => {
    const { forceMount: n, ...r } = e, i = to(no, e.__scopeCollapsible);
    return /* @__PURE__ */ v(Ln, { present: n || i.open, children: ({ present: a }) => /* @__PURE__ */ v(gE, { ...r, ref: t, present: a }) });
  }
);
Pl.displayName = no;
var gE = N.forwardRef((e, t) => {
  const { __scopeCollapsible: n, present: r, children: i, ...a } = e, o = to(no, n), [s, c] = N.useState(r), l = N.useRef(null), u = Le(t, l), d = N.useRef(0), p = d.current, f = N.useRef(0), h = f.current, m = o.open || s, b = N.useRef(m), g = N.useRef(void 0);
  return N.useEffect(() => {
    const x = requestAnimationFrame(() => b.current = !1);
    return () => cancelAnimationFrame(x);
  }, []), xt(() => {
    const x = l.current;
    if (x) {
      g.current = g.current || {
        transitionDuration: x.style.transitionDuration,
        animationName: x.style.animationName
      }, x.style.transitionDuration = "0s", x.style.animationName = "none";
      const _ = x.getBoundingClientRect();
      d.current = _.height, f.current = _.width, b.current || (x.style.transitionDuration = g.current.transitionDuration, x.style.animationName = g.current.animationName), c(r);
    }
  }, [o.open, r]), /* @__PURE__ */ v(
    Te.div,
    {
      "data-state": ro(o.open),
      "data-disabled": o.disabled ? "" : void 0,
      id: o.contentId,
      hidden: !m,
      ...a,
      ref: u,
      style: {
        "--radix-collapsible-content-height": p ? `${p}px` : void 0,
        "--radix-collapsible-content-width": h ? `${h}px` : void 0,
        ...e.style
      },
      children: m && i
    }
  );
});
function ro(e) {
  return e ? "open" : "closed";
}
var mE = Ml, bE = Ll, yE = Pl;
function EE(e) {
  const t = e + "CollectionProvider", [n, r] = Lt(t), [i, a] = n(
    t,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), o = (m) => {
    const { scope: b, children: g } = m, x = zt.useRef(null), _ = zt.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ v(i, { scope: b, itemMap: _, collectionRef: x, children: g });
  };
  o.displayName = t;
  const s = e + "CollectionSlot", c = /* @__PURE__ */ Si(s), l = zt.forwardRef(
    (m, b) => {
      const { scope: g, children: x } = m, _ = a(s, g), C = Le(b, _.collectionRef);
      return /* @__PURE__ */ v(c, { ref: C, children: x });
    }
  );
  l.displayName = s;
  const u = e + "CollectionItemSlot", d = "data-radix-collection-item", p = /* @__PURE__ */ Si(u), f = zt.forwardRef(
    (m, b) => {
      const { scope: g, children: x, ..._ } = m, C = zt.useRef(null), T = Le(b, C), k = a(u, g);
      return zt.useEffect(() => (k.itemMap.set(C, { ref: C, ..._ }), () => {
        k.itemMap.delete(C);
      })), /* @__PURE__ */ v(p, { [d]: "", ref: T, children: x });
    }
  );
  f.displayName = u;
  function h(m) {
    const b = a(e + "CollectionConsumer", m);
    return zt.useCallback(() => {
      const x = b.collectionRef.current;
      if (!x) return [];
      const _ = Array.from(x.querySelectorAll(`[${d}]`));
      return Array.from(b.itemMap.values()).sort(
        (k, I) => _.indexOf(k.ref.current) - _.indexOf(I.ref.current)
      );
    }, [b.collectionRef, b.itemMap]);
  }
  return [
    { Provider: o, Slot: l, ItemSlot: f },
    h,
    r
  ];
}
function Pn(e) {
  const t = N.useRef(e);
  return N.useEffect(() => {
    t.current = e;
  }), N.useMemo(() => (...n) => t.current?.(...n), []);
}
var _E = N.createContext(void 0);
function Fl(e) {
  const t = N.useContext(_E);
  return e || t || "ltr";
}
var ai = "rovingFocusGroup.onEntryFocus", wE = { bubbles: !1, cancelable: !0 }, Fn = "RovingFocusGroup", [Ni, Bl, xE] = EE(Fn), [kE, zl] = Lt(
  Fn,
  [xE]
), [vE, SE] = kE(Fn), Ul = N.forwardRef(
  (e, t) => /* @__PURE__ */ v(Ni.Provider, { scope: e.__scopeRovingFocusGroup, children: /* @__PURE__ */ v(Ni.Slot, { scope: e.__scopeRovingFocusGroup, children: /* @__PURE__ */ v(NE, { ...e, ref: t }) }) })
);
Ul.displayName = Fn;
var NE = N.forwardRef((e, t) => {
  const {
    __scopeRovingFocusGroup: n,
    orientation: r,
    loop: i = !1,
    dir: a,
    currentTabStopId: o,
    defaultCurrentTabStopId: s,
    onCurrentTabStopIdChange: c,
    onEntryFocus: l,
    preventScrollOnEntryFocus: u = !1,
    ...d
  } = e, p = N.useRef(null), f = Le(t, p), h = Fl(a), [m, b] = Dn({
    prop: o,
    defaultProp: s ?? null,
    onChange: c,
    caller: Fn
  }), [g, x] = N.useState(!1), _ = Pn(l), C = Bl(n), T = N.useRef(!1), [k, I] = N.useState(0);
  return N.useEffect(() => {
    const A = p.current;
    if (A)
      return A.addEventListener(ai, _), () => A.removeEventListener(ai, _);
  }, [_]), /* @__PURE__ */ v(
    vE,
    {
      scope: n,
      orientation: r,
      dir: h,
      loop: i,
      currentTabStopId: m,
      onItemFocus: N.useCallback(
        (A) => b(A),
        [b]
      ),
      onItemShiftTab: N.useCallback(() => x(!0), []),
      onFocusableItemAdd: N.useCallback(
        () => I((A) => A + 1),
        []
      ),
      onFocusableItemRemove: N.useCallback(
        () => I((A) => A - 1),
        []
      ),
      children: /* @__PURE__ */ v(
        Te.div,
        {
          tabIndex: g || k === 0 ? -1 : 0,
          "data-orientation": r,
          ...d,
          ref: f,
          style: { outline: "none", ...e.style },
          onMouseDown: Ne(e.onMouseDown, () => {
            T.current = !0;
          }),
          onFocus: Ne(e.onFocus, (A) => {
            const O = !T.current;
            if (A.target === A.currentTarget && O && !g) {
              const S = new CustomEvent(ai, wE);
              if (A.currentTarget.dispatchEvent(S), !S.defaultPrevented) {
                const L = C().filter((K) => K.focusable), B = L.find((K) => K.active), W = L.find((K) => K.id === m), D = [B, W, ...L].filter(
                  Boolean
                ).map((K) => K.ref.current);
                Gl(D, u);
              }
            }
            T.current = !1;
          }),
          onBlur: Ne(e.onBlur, () => x(!1))
        }
      )
    }
  );
}), $l = "RovingFocusGroupItem", Hl = N.forwardRef(
  (e, t) => {
    const {
      __scopeRovingFocusGroup: n,
      focusable: r = !0,
      active: i = !1,
      tabStopId: a,
      children: o,
      ...s
    } = e, c = eo(), l = a || c, u = SE($l, n), d = u.currentTabStopId === l, p = Bl(n), { onFocusableItemAdd: f, onFocusableItemRemove: h, currentTabStopId: m } = u;
    return N.useEffect(() => {
      if (r)
        return f(), () => h();
    }, [r, f, h]), /* @__PURE__ */ v(
      Ni.ItemSlot,
      {
        scope: n,
        id: l,
        focusable: r,
        active: i,
        children: /* @__PURE__ */ v(
          Te.span,
          {
            tabIndex: d ? 0 : -1,
            "data-orientation": u.orientation,
            ...s,
            ref: t,
            onMouseDown: Ne(e.onMouseDown, (b) => {
              r ? u.onItemFocus(l) : b.preventDefault();
            }),
            onFocus: Ne(e.onFocus, () => u.onItemFocus(l)),
            onKeyDown: Ne(e.onKeyDown, (b) => {
              if (b.key === "Tab" && b.shiftKey) {
                u.onItemShiftTab();
                return;
              }
              if (b.target !== b.currentTarget) return;
              const g = AE(b, u.orientation, u.dir);
              if (g !== void 0) {
                if (b.metaKey || b.ctrlKey || b.altKey || b.shiftKey) return;
                b.preventDefault();
                let _ = p().filter((C) => C.focusable).map((C) => C.ref.current);
                if (g === "last") _.reverse();
                else if (g === "prev" || g === "next") {
                  g === "prev" && _.reverse();
                  const C = _.indexOf(b.currentTarget);
                  _ = u.loop ? RE(_, C + 1) : _.slice(C + 1);
                }
                setTimeout(() => Gl(_));
              }
            }),
            children: typeof o == "function" ? o({ isCurrentTabStop: d, hasTabStop: m != null }) : o
          }
        )
      }
    );
  }
);
Hl.displayName = $l;
var CE = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function TE(e, t) {
  return t !== "rtl" ? e : e === "ArrowLeft" ? "ArrowRight" : e === "ArrowRight" ? "ArrowLeft" : e;
}
function AE(e, t, n) {
  const r = TE(e.key, n);
  if (!(t === "vertical" && ["ArrowLeft", "ArrowRight"].includes(r)) && !(t === "horizontal" && ["ArrowUp", "ArrowDown"].includes(r)))
    return CE[r];
}
function Gl(e, t = !1) {
  const n = document.activeElement;
  for (const r of e)
    if (r === n || (r.focus({ preventScroll: t }), document.activeElement !== n)) return;
}
function RE(e, t) {
  return e.map((n, r) => e[(t + r) % e.length]);
}
var OE = Ul, IE = Hl;
function io(e) {
  const [t, n] = N.useState(void 0);
  return xt(() => {
    if (e) {
      n({ width: e.offsetWidth, height: e.offsetHeight });
      const r = new ResizeObserver((i) => {
        if (!Array.isArray(i) || !i.length)
          return;
        const a = i[0];
        let o, s;
        if ("borderBoxSize" in a) {
          const c = a.borderBoxSize, l = Array.isArray(c) ? c[0] : c;
          o = l.inlineSize, s = l.blockSize;
        } else
          o = e.offsetWidth, s = e.offsetHeight;
        n({ width: o, height: s });
      });
      return r.observe(e, { box: "border-box" }), () => r.unobserve(e);
    } else
      n(void 0);
  }, [e]), t;
}
function Kl(e) {
  const t = N.useRef({ value: e, previous: e });
  return N.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
var oo = "Radio", [ME, ql] = Lt(oo), [DE, LE] = ME(oo), Wl = N.forwardRef(
  (e, t) => {
    const {
      __scopeRadio: n,
      name: r,
      checked: i = !1,
      required: a,
      disabled: o,
      value: s = "on",
      onCheck: c,
      form: l,
      ...u
    } = e, [d, p] = N.useState(null), f = Le(t, (b) => p(b)), h = N.useRef(!1), m = d ? l || !!d.closest("form") : !0;
    return /* @__PURE__ */ Y(DE, { scope: n, checked: i, disabled: o, children: [
      /* @__PURE__ */ v(
        Te.button,
        {
          type: "button",
          role: "radio",
          "aria-checked": i,
          "data-state": Xl(i),
          "data-disabled": o ? "" : void 0,
          disabled: o,
          value: s,
          ...u,
          ref: f,
          onClick: Ne(e.onClick, (b) => {
            i || c?.(), m && (h.current = b.isPropagationStopped(), h.current || b.stopPropagation());
          })
        }
      ),
      m && /* @__PURE__ */ v(
        Zl,
        {
          control: d,
          bubbles: !h.current,
          name: r,
          value: s,
          checked: i,
          required: a,
          disabled: o,
          form: l,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Wl.displayName = oo;
var Vl = "RadioIndicator", Yl = N.forwardRef(
  (e, t) => {
    const { __scopeRadio: n, forceMount: r, ...i } = e, a = LE(Vl, n);
    return /* @__PURE__ */ v(Ln, { present: r || a.checked, children: /* @__PURE__ */ v(
      Te.span,
      {
        "data-state": Xl(a.checked),
        "data-disabled": a.disabled ? "" : void 0,
        ...i,
        ref: t
      }
    ) });
  }
);
Yl.displayName = Vl;
var PE = "RadioBubbleInput", Zl = N.forwardRef(
  ({
    __scopeRadio: e,
    control: t,
    checked: n,
    bubbles: r = !0,
    ...i
  }, a) => {
    const o = N.useRef(null), s = Le(o, a), c = Kl(n), l = io(t);
    return N.useEffect(() => {
      const u = o.current;
      if (!u) return;
      const d = window.HTMLInputElement.prototype, f = Object.getOwnPropertyDescriptor(
        d,
        "checked"
      ).set;
      if (c !== n && f) {
        const h = new Event("click", { bubbles: r });
        f.call(u, n), u.dispatchEvent(h);
      }
    }, [c, n, r]), /* @__PURE__ */ v(
      Te.input,
      {
        type: "radio",
        "aria-hidden": !0,
        defaultChecked: n,
        ...i,
        tabIndex: -1,
        ref: s,
        style: {
          ...i.style,
          ...l,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
Zl.displayName = PE;
function Xl(e) {
  return e ? "checked" : "unchecked";
}
var FE = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], vr = "RadioGroup", [BE] = Lt(vr, [
  zl,
  ql
]), jl = zl(), Ql = ql(), [zE, UE] = BE(vr), Jl = N.forwardRef(
  (e, t) => {
    const {
      __scopeRadioGroup: n,
      name: r,
      defaultValue: i,
      value: a,
      required: o = !1,
      disabled: s = !1,
      orientation: c,
      dir: l,
      loop: u = !0,
      onValueChange: d,
      ...p
    } = e, f = jl(n), h = Fl(l), [m, b] = Dn({
      prop: a,
      defaultProp: i ?? null,
      onChange: d,
      caller: vr
    });
    return /* @__PURE__ */ v(
      zE,
      {
        scope: n,
        name: r,
        required: o,
        disabled: s,
        value: m,
        onValueChange: b,
        children: /* @__PURE__ */ v(
          OE,
          {
            asChild: !0,
            ...f,
            orientation: c,
            dir: h,
            loop: u,
            children: /* @__PURE__ */ v(
              Te.div,
              {
                role: "radiogroup",
                "aria-required": o,
                "aria-orientation": c,
                "data-disabled": s ? "" : void 0,
                dir: h,
                ...p,
                ref: t
              }
            )
          }
        )
      }
    );
  }
);
Jl.displayName = vr;
var ec = "RadioGroupItem", tc = N.forwardRef(
  (e, t) => {
    const { __scopeRadioGroup: n, disabled: r, ...i } = e, a = UE(ec, n), o = a.disabled || r, s = jl(n), c = Ql(n), l = N.useRef(null), u = Le(t, l), d = a.value === i.value, p = N.useRef(!1);
    return N.useEffect(() => {
      const f = (m) => {
        FE.includes(m.key) && (p.current = !0);
      }, h = () => p.current = !1;
      return document.addEventListener("keydown", f), document.addEventListener("keyup", h), () => {
        document.removeEventListener("keydown", f), document.removeEventListener("keyup", h);
      };
    }, []), /* @__PURE__ */ v(
      IE,
      {
        asChild: !0,
        ...s,
        focusable: !o,
        active: d,
        children: /* @__PURE__ */ v(
          Wl,
          {
            disabled: o,
            required: a.required,
            checked: d,
            ...c,
            ...i,
            name: a.name,
            ref: u,
            onCheck: () => a.onValueChange(i.value),
            onKeyDown: Ne((f) => {
              f.key === "Enter" && f.preventDefault();
            }),
            onFocus: Ne(i.onFocus, () => {
              p.current && l.current?.click();
            })
          }
        )
      }
    );
  }
);
tc.displayName = ec;
var $E = "RadioGroupIndicator", nc = N.forwardRef(
  (e, t) => {
    const { __scopeRadioGroup: n, ...r } = e, i = Ql(n);
    return /* @__PURE__ */ v(Yl, { ...i, ...r, ref: t });
  }
);
nc.displayName = $E;
var HE = Jl, GE = tc, KE = nc, Sr = "Switch", [qE] = Lt(Sr), [WE, VE] = qE(Sr), rc = N.forwardRef(
  (e, t) => {
    const {
      __scopeSwitch: n,
      name: r,
      checked: i,
      defaultChecked: a,
      required: o,
      disabled: s,
      value: c = "on",
      onCheckedChange: l,
      form: u,
      ...d
    } = e, [p, f] = N.useState(null), h = Le(t, (_) => f(_)), m = N.useRef(!1), b = p ? u || !!p.closest("form") : !0, [g, x] = Dn({
      prop: i,
      defaultProp: a ?? !1,
      onChange: l,
      caller: Sr
    });
    return /* @__PURE__ */ Y(WE, { scope: n, checked: g, disabled: s, children: [
      /* @__PURE__ */ v(
        Te.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": g,
          "aria-required": o,
          "data-state": sc(g),
          "data-disabled": s ? "" : void 0,
          disabled: s,
          value: c,
          ...d,
          ref: h,
          onClick: Ne(e.onClick, (_) => {
            x((C) => !C), b && (m.current = _.isPropagationStopped(), m.current || _.stopPropagation());
          })
        }
      ),
      b && /* @__PURE__ */ v(
        ac,
        {
          control: p,
          bubbles: !m.current,
          name: r,
          value: c,
          checked: g,
          required: o,
          disabled: s,
          form: u,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
rc.displayName = Sr;
var ic = "SwitchThumb", oc = N.forwardRef(
  (e, t) => {
    const { __scopeSwitch: n, ...r } = e, i = VE(ic, n);
    return /* @__PURE__ */ v(
      Te.span,
      {
        "data-state": sc(i.checked),
        "data-disabled": i.disabled ? "" : void 0,
        ...r,
        ref: t
      }
    );
  }
);
oc.displayName = ic;
var YE = "SwitchBubbleInput", ac = N.forwardRef(
  ({
    __scopeSwitch: e,
    control: t,
    checked: n,
    bubbles: r = !0,
    ...i
  }, a) => {
    const o = N.useRef(null), s = Le(o, a), c = Kl(n), l = io(t);
    return N.useEffect(() => {
      const u = o.current;
      if (!u) return;
      const d = window.HTMLInputElement.prototype, f = Object.getOwnPropertyDescriptor(
        d,
        "checked"
      ).set;
      if (c !== n && f) {
        const h = new Event("click", { bubbles: r });
        f.call(u, n), u.dispatchEvent(h);
      }
    }, [c, n, r]), /* @__PURE__ */ v(
      "input",
      {
        type: "checkbox",
        "aria-hidden": !0,
        defaultChecked: n,
        ...i,
        tabIndex: -1,
        ref: s,
        style: {
          ...i.style,
          ...l,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
ac.displayName = YE;
function sc(e) {
  return e ? "checked" : "unchecked";
}
var ZE = rc, XE = oc;
function jE(e, t = globalThis?.document) {
  const n = Pn(e);
  N.useEffect(() => {
    const r = (i) => {
      i.key === "Escape" && n(i);
    };
    return t.addEventListener("keydown", r, { capture: !0 }), () => t.removeEventListener("keydown", r, { capture: !0 });
  }, [n, t]);
}
var QE = "DismissableLayer", Ci = "dismissableLayer.update", JE = "dismissableLayer.pointerDownOutside", e_ = "dismissableLayer.focusOutside", Oa, lc = N.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
}), cc = N.forwardRef(
  (e, t) => {
    const {
      disableOutsidePointerEvents: n = !1,
      onEscapeKeyDown: r,
      onPointerDownOutside: i,
      onFocusOutside: a,
      onInteractOutside: o,
      onDismiss: s,
      ...c
    } = e, l = N.useContext(lc), [u, d] = N.useState(null), p = u?.ownerDocument ?? globalThis?.document, [, f] = N.useState({}), h = Le(t, (I) => d(I)), m = Array.from(l.layers), [b] = [...l.layersWithOutsidePointerEventsDisabled].slice(-1), g = m.indexOf(b), x = u ? m.indexOf(u) : -1, _ = l.layersWithOutsidePointerEventsDisabled.size > 0, C = x >= g, T = r_((I) => {
      const A = I.target, O = [...l.branches].some((S) => S.contains(A));
      !C || O || (i?.(I), o?.(I), I.defaultPrevented || s?.());
    }, p), k = i_((I) => {
      const A = I.target;
      [...l.branches].some((S) => S.contains(A)) || (a?.(I), o?.(I), I.defaultPrevented || s?.());
    }, p);
    return jE((I) => {
      x === l.layers.size - 1 && (r?.(I), !I.defaultPrevented && s && (I.preventDefault(), s()));
    }, p), N.useEffect(() => {
      if (u)
        return n && (l.layersWithOutsidePointerEventsDisabled.size === 0 && (Oa = p.body.style.pointerEvents, p.body.style.pointerEvents = "none"), l.layersWithOutsidePointerEventsDisabled.add(u)), l.layers.add(u), Ia(), () => {
          n && l.layersWithOutsidePointerEventsDisabled.size === 1 && (p.body.style.pointerEvents = Oa);
        };
    }, [u, p, n, l]), N.useEffect(() => () => {
      u && (l.layers.delete(u), l.layersWithOutsidePointerEventsDisabled.delete(u), Ia());
    }, [u, l]), N.useEffect(() => {
      const I = () => f({});
      return document.addEventListener(Ci, I), () => document.removeEventListener(Ci, I);
    }, []), /* @__PURE__ */ v(
      Te.div,
      {
        ...c,
        ref: h,
        style: {
          pointerEvents: _ ? C ? "auto" : "none" : void 0,
          ...e.style
        },
        onFocusCapture: Ne(e.onFocusCapture, k.onFocusCapture),
        onBlurCapture: Ne(e.onBlurCapture, k.onBlurCapture),
        onPointerDownCapture: Ne(
          e.onPointerDownCapture,
          T.onPointerDownCapture
        )
      }
    );
  }
);
cc.displayName = QE;
var t_ = "DismissableLayerBranch", n_ = N.forwardRef((e, t) => {
  const n = N.useContext(lc), r = N.useRef(null), i = Le(t, r);
  return N.useEffect(() => {
    const a = r.current;
    if (a)
      return n.branches.add(a), () => {
        n.branches.delete(a);
      };
  }, [n.branches]), /* @__PURE__ */ v(Te.div, { ...e, ref: i });
});
n_.displayName = t_;
function r_(e, t = globalThis?.document) {
  const n = Pn(e), r = N.useRef(!1), i = N.useRef(() => {
  });
  return N.useEffect(() => {
    const a = (s) => {
      if (s.target && !r.current) {
        let c = function() {
          uc(
            JE,
            n,
            l,
            { discrete: !0 }
          );
        };
        const l = { originalEvent: s };
        s.pointerType === "touch" ? (t.removeEventListener("click", i.current), i.current = c, t.addEventListener("click", i.current, { once: !0 })) : c();
      } else
        t.removeEventListener("click", i.current);
      r.current = !1;
    }, o = window.setTimeout(() => {
      t.addEventListener("pointerdown", a);
    }, 0);
    return () => {
      window.clearTimeout(o), t.removeEventListener("pointerdown", a), t.removeEventListener("click", i.current);
    };
  }, [t, n]), {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => r.current = !0
  };
}
function i_(e, t = globalThis?.document) {
  const n = Pn(e), r = N.useRef(!1);
  return N.useEffect(() => {
    const i = (a) => {
      a.target && !r.current && uc(e_, n, { originalEvent: a }, {
        discrete: !1
      });
    };
    return t.addEventListener("focusin", i), () => t.removeEventListener("focusin", i);
  }, [t, n]), {
    onFocusCapture: () => r.current = !0,
    onBlurCapture: () => r.current = !1
  };
}
function Ia() {
  const e = new CustomEvent(Ci);
  document.dispatchEvent(e);
}
function uc(e, t, n, { discrete: r }) {
  const i = n.originalEvent.target, a = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: n });
  t && i.addEventListener(e, t, { once: !0 }), r ? sE(i, a) : i.dispatchEvent(a);
}
const o_ = ["top", "right", "bottom", "left"], It = Math.min, Xe = Math.max, pr = Math.round, rr = Math.floor, ht = (e) => ({
  x: e,
  y: e
}), a_ = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function Ti(e, t, n) {
  return Xe(e, It(t, n));
}
function kt(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function vt(e) {
  return e.split("-")[0];
}
function dn(e) {
  return e.split("-")[1];
}
function ao(e) {
  return e === "x" ? "y" : "x";
}
function so(e) {
  return e === "y" ? "height" : "width";
}
function pt(e) {
  const t = e[0];
  return t === "t" || t === "b" ? "y" : "x";
}
function lo(e) {
  return ao(pt(e));
}
function s_(e, t, n) {
  n === void 0 && (n = !1);
  const r = dn(e), i = lo(e), a = so(i);
  let o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
  return t.reference[a] > t.floating[a] && (o = hr(o)), [o, hr(o)];
}
function l_(e) {
  const t = hr(e);
  return [Ai(e), t, Ai(t)];
}
function Ai(e) {
  return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
const Ma = ["left", "right"], Da = ["right", "left"], c_ = ["top", "bottom"], u_ = ["bottom", "top"];
function d_(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? Da : Ma : t ? Ma : Da;
    case "left":
    case "right":
      return t ? c_ : u_;
    default:
      return [];
  }
}
function f_(e, t, n, r) {
  const i = dn(e);
  let a = d_(vt(e), n === "start", r);
  return i && (a = a.map((o) => o + "-" + i), t && (a = a.concat(a.map(Ai)))), a;
}
function hr(e) {
  const t = vt(e);
  return a_[t] + e.slice(t.length);
}
function p_(e) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...e
  };
}
function dc(e) {
  return typeof e != "number" ? p_(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function gr(e) {
  const {
    x: t,
    y: n,
    width: r,
    height: i
  } = e;
  return {
    width: r,
    height: i,
    top: n,
    left: t,
    right: t + r,
    bottom: n + i,
    x: t,
    y: n
  };
}
function La(e, t, n) {
  let {
    reference: r,
    floating: i
  } = e;
  const a = pt(t), o = lo(t), s = so(o), c = vt(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, p = r[s] / 2 - i[s] / 2;
  let f;
  switch (c) {
    case "top":
      f = {
        x: u,
        y: r.y - i.height
      };
      break;
    case "bottom":
      f = {
        x: u,
        y: r.y + r.height
      };
      break;
    case "right":
      f = {
        x: r.x + r.width,
        y: d
      };
      break;
    case "left":
      f = {
        x: r.x - i.width,
        y: d
      };
      break;
    default:
      f = {
        x: r.x,
        y: r.y
      };
  }
  switch (dn(t)) {
    case "start":
      f[o] -= p * (n && l ? -1 : 1);
      break;
    case "end":
      f[o] += p * (n && l ? -1 : 1);
      break;
  }
  return f;
}
async function h_(e, t) {
  var n;
  t === void 0 && (t = {});
  const {
    x: r,
    y: i,
    platform: a,
    rects: o,
    elements: s,
    strategy: c
  } = e, {
    boundary: l = "clippingAncestors",
    rootBoundary: u = "viewport",
    elementContext: d = "floating",
    altBoundary: p = !1,
    padding: f = 0
  } = kt(t, e), h = dc(f), b = s[p ? d === "floating" ? "reference" : "floating" : d], g = gr(await a.getClippingRect({
    element: (n = await (a.isElement == null ? void 0 : a.isElement(b))) == null || n ? b : b.contextElement || await (a.getDocumentElement == null ? void 0 : a.getDocumentElement(s.floating)),
    boundary: l,
    rootBoundary: u,
    strategy: c
  })), x = d === "floating" ? {
    x: r,
    y: i,
    width: o.floating.width,
    height: o.floating.height
  } : o.reference, _ = await (a.getOffsetParent == null ? void 0 : a.getOffsetParent(s.floating)), C = await (a.isElement == null ? void 0 : a.isElement(_)) ? await (a.getScale == null ? void 0 : a.getScale(_)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  }, T = gr(a.convertOffsetParentRelativeRectToViewportRelativeRect ? await a.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: s,
    rect: x,
    offsetParent: _,
    strategy: c
  }) : x);
  return {
    top: (g.top - T.top + h.top) / C.y,
    bottom: (T.bottom - g.bottom + h.bottom) / C.y,
    left: (g.left - T.left + h.left) / C.x,
    right: (T.right - g.right + h.right) / C.x
  };
}
const g_ = 50, m_ = async (e, t, n) => {
  const {
    placement: r = "bottom",
    strategy: i = "absolute",
    middleware: a = [],
    platform: o
  } = n, s = o.detectOverflow ? o : {
    ...o,
    detectOverflow: h_
  }, c = await (o.isRTL == null ? void 0 : o.isRTL(t));
  let l = await o.getElementRects({
    reference: e,
    floating: t,
    strategy: i
  }), {
    x: u,
    y: d
  } = La(l, r, c), p = r, f = 0;
  const h = {};
  for (let m = 0; m < a.length; m++) {
    const b = a[m];
    if (!b)
      continue;
    const {
      name: g,
      fn: x
    } = b, {
      x: _,
      y: C,
      data: T,
      reset: k
    } = await x({
      x: u,
      y: d,
      initialPlacement: r,
      placement: p,
      strategy: i,
      middlewareData: h,
      rects: l,
      platform: s,
      elements: {
        reference: e,
        floating: t
      }
    });
    u = _ ?? u, d = C ?? d, h[g] = {
      ...h[g],
      ...T
    }, k && f < g_ && (f++, typeof k == "object" && (k.placement && (p = k.placement), k.rects && (l = k.rects === !0 ? await o.getElementRects({
      reference: e,
      floating: t,
      strategy: i
    }) : k.rects), {
      x: u,
      y: d
    } = La(l, p, c)), m = -1);
  }
  return {
    x: u,
    y: d,
    placement: p,
    strategy: i,
    middlewareData: h
  };
}, b_ = (e) => ({
  name: "arrow",
  options: e,
  async fn(t) {
    const {
      x: n,
      y: r,
      placement: i,
      rects: a,
      platform: o,
      elements: s,
      middlewareData: c
    } = t, {
      element: l,
      padding: u = 0
    } = kt(e, t) || {};
    if (l == null)
      return {};
    const d = dc(u), p = {
      x: n,
      y: r
    }, f = lo(i), h = so(f), m = await o.getDimensions(l), b = f === "y", g = b ? "top" : "left", x = b ? "bottom" : "right", _ = b ? "clientHeight" : "clientWidth", C = a.reference[h] + a.reference[f] - p[f] - a.floating[h], T = p[f] - a.reference[f], k = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l));
    let I = k ? k[_] : 0;
    (!I || !await (o.isElement == null ? void 0 : o.isElement(k))) && (I = s.floating[_] || a.floating[h]);
    const A = C / 2 - T / 2, O = I / 2 - m[h] / 2 - 1, S = It(d[g], O), L = It(d[x], O), B = S, W = I - m[h] - L, P = I / 2 - m[h] / 2 + A, D = Ti(B, P, W), K = !c.arrow && dn(i) != null && P !== D && a.reference[h] / 2 - (P < B ? S : L) - m[h] / 2 < 0, Q = K ? P < B ? P - B : P - W : 0;
    return {
      [f]: p[f] + Q,
      data: {
        [f]: D,
        centerOffset: P - D - Q,
        ...K && {
          alignmentOffset: Q
        }
      },
      reset: K
    };
  }
}), y_ = function(e) {
  return e === void 0 && (e = {}), {
    name: "flip",
    options: e,
    async fn(t) {
      var n, r;
      const {
        placement: i,
        middlewareData: a,
        rects: o,
        initialPlacement: s,
        platform: c,
        elements: l
      } = t, {
        mainAxis: u = !0,
        crossAxis: d = !0,
        fallbackPlacements: p,
        fallbackStrategy: f = "bestFit",
        fallbackAxisSideDirection: h = "none",
        flipAlignment: m = !0,
        ...b
      } = kt(e, t);
      if ((n = a.arrow) != null && n.alignmentOffset)
        return {};
      const g = vt(i), x = pt(s), _ = vt(s) === s, C = await (c.isRTL == null ? void 0 : c.isRTL(l.floating)), T = p || (_ || !m ? [hr(s)] : l_(s)), k = h !== "none";
      !p && k && T.push(...f_(s, m, h, C));
      const I = [s, ...T], A = await c.detectOverflow(t, b), O = [];
      let S = ((r = a.flip) == null ? void 0 : r.overflows) || [];
      if (u && O.push(A[g]), d) {
        const P = s_(i, o, C);
        O.push(A[P[0]], A[P[1]]);
      }
      if (S = [...S, {
        placement: i,
        overflows: O
      }], !O.every((P) => P <= 0)) {
        var L, B;
        const P = (((L = a.flip) == null ? void 0 : L.index) || 0) + 1, D = I[P];
        if (D && (!(d === "alignment" ? x !== pt(D) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        S.every(($) => pt($.placement) === x ? $.overflows[0] > 0 : !0)))
          return {
            data: {
              index: P,
              overflows: S
            },
            reset: {
              placement: D
            }
          };
        let K = (B = S.filter((Q) => Q.overflows[0] <= 0).sort((Q, $) => Q.overflows[1] - $.overflows[1])[0]) == null ? void 0 : B.placement;
        if (!K)
          switch (f) {
            case "bestFit": {
              var W;
              const Q = (W = S.filter(($) => {
                if (k) {
                  const ne = pt($.placement);
                  return ne === x || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  ne === "y";
                }
                return !0;
              }).map(($) => [$.placement, $.overflows.filter((ne) => ne > 0).reduce((ne, y) => ne + y, 0)]).sort(($, ne) => $[1] - ne[1])[0]) == null ? void 0 : W[0];
              Q && (K = Q);
              break;
            }
            case "initialPlacement":
              K = s;
              break;
          }
        if (i !== K)
          return {
            reset: {
              placement: K
            }
          };
      }
      return {};
    }
  };
};
function Pa(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function Fa(e) {
  return o_.some((t) => e[t] >= 0);
}
const E_ = function(e) {
  return e === void 0 && (e = {}), {
    name: "hide",
    options: e,
    async fn(t) {
      const {
        rects: n,
        platform: r
      } = t, {
        strategy: i = "referenceHidden",
        ...a
      } = kt(e, t);
      switch (i) {
        case "referenceHidden": {
          const o = await r.detectOverflow(t, {
            ...a,
            elementContext: "reference"
          }), s = Pa(o, n.reference);
          return {
            data: {
              referenceHiddenOffsets: s,
              referenceHidden: Fa(s)
            }
          };
        }
        case "escaped": {
          const o = await r.detectOverflow(t, {
            ...a,
            altBoundary: !0
          }), s = Pa(o, n.floating);
          return {
            data: {
              escapedOffsets: s,
              escaped: Fa(s)
            }
          };
        }
        default:
          return {};
      }
    }
  };
}, fc = /* @__PURE__ */ new Set(["left", "top"]);
async function __(e, t) {
  const {
    placement: n,
    platform: r,
    elements: i
  } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = vt(n), s = dn(n), c = pt(n) === "y", l = fc.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = kt(t, e);
  let {
    mainAxis: p,
    crossAxis: f,
    alignmentAxis: h
  } = typeof d == "number" ? {
    mainAxis: d,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: d.mainAxis || 0,
    crossAxis: d.crossAxis || 0,
    alignmentAxis: d.alignmentAxis
  };
  return s && typeof h == "number" && (f = s === "end" ? h * -1 : h), c ? {
    x: f * u,
    y: p * l
  } : {
    x: p * l,
    y: f * u
  };
}
const w_ = function(e) {
  return e === void 0 && (e = 0), {
    name: "offset",
    options: e,
    async fn(t) {
      var n, r;
      const {
        x: i,
        y: a,
        placement: o,
        middlewareData: s
      } = t, c = await __(t, e);
      return o === ((n = s.offset) == null ? void 0 : n.placement) && (r = s.arrow) != null && r.alignmentOffset ? {} : {
        x: i + c.x,
        y: a + c.y,
        data: {
          ...c,
          placement: o
        }
      };
    }
  };
}, x_ = function(e) {
  return e === void 0 && (e = {}), {
    name: "shift",
    options: e,
    async fn(t) {
      const {
        x: n,
        y: r,
        placement: i,
        platform: a
      } = t, {
        mainAxis: o = !0,
        crossAxis: s = !1,
        limiter: c = {
          fn: (g) => {
            let {
              x,
              y: _
            } = g;
            return {
              x,
              y: _
            };
          }
        },
        ...l
      } = kt(e, t), u = {
        x: n,
        y: r
      }, d = await a.detectOverflow(t, l), p = pt(vt(i)), f = ao(p);
      let h = u[f], m = u[p];
      if (o) {
        const g = f === "y" ? "top" : "left", x = f === "y" ? "bottom" : "right", _ = h + d[g], C = h - d[x];
        h = Ti(_, h, C);
      }
      if (s) {
        const g = p === "y" ? "top" : "left", x = p === "y" ? "bottom" : "right", _ = m + d[g], C = m - d[x];
        m = Ti(_, m, C);
      }
      const b = c.fn({
        ...t,
        [f]: h,
        [p]: m
      });
      return {
        ...b,
        data: {
          x: b.x - n,
          y: b.y - r,
          enabled: {
            [f]: o,
            [p]: s
          }
        }
      };
    }
  };
}, k_ = function(e) {
  return e === void 0 && (e = {}), {
    options: e,
    fn(t) {
      const {
        x: n,
        y: r,
        placement: i,
        rects: a,
        middlewareData: o
      } = t, {
        offset: s = 0,
        mainAxis: c = !0,
        crossAxis: l = !0
      } = kt(e, t), u = {
        x: n,
        y: r
      }, d = pt(i), p = ao(d);
      let f = u[p], h = u[d];
      const m = kt(s, t), b = typeof m == "number" ? {
        mainAxis: m,
        crossAxis: 0
      } : {
        mainAxis: 0,
        crossAxis: 0,
        ...m
      };
      if (c) {
        const _ = p === "y" ? "height" : "width", C = a.reference[p] - a.floating[_] + b.mainAxis, T = a.reference[p] + a.reference[_] - b.mainAxis;
        f < C ? f = C : f > T && (f = T);
      }
      if (l) {
        var g, x;
        const _ = p === "y" ? "width" : "height", C = fc.has(vt(i)), T = a.reference[d] - a.floating[_] + (C && ((g = o.offset) == null ? void 0 : g[d]) || 0) + (C ? 0 : b.crossAxis), k = a.reference[d] + a.reference[_] + (C ? 0 : ((x = o.offset) == null ? void 0 : x[d]) || 0) - (C ? b.crossAxis : 0);
        h < T ? h = T : h > k && (h = k);
      }
      return {
        [p]: f,
        [d]: h
      };
    }
  };
}, v_ = function(e) {
  return e === void 0 && (e = {}), {
    name: "size",
    options: e,
    async fn(t) {
      var n, r;
      const {
        placement: i,
        rects: a,
        platform: o,
        elements: s
      } = t, {
        apply: c = () => {
        },
        ...l
      } = kt(e, t), u = await o.detectOverflow(t, l), d = vt(i), p = dn(i), f = pt(i) === "y", {
        width: h,
        height: m
      } = a.floating;
      let b, g;
      d === "top" || d === "bottom" ? (b = d, g = p === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (g = d, b = p === "end" ? "top" : "bottom");
      const x = m - u.top - u.bottom, _ = h - u.left - u.right, C = It(m - u[b], x), T = It(h - u[g], _), k = !t.middlewareData.shift;
      let I = C, A = T;
      if ((n = t.middlewareData.shift) != null && n.enabled.x && (A = _), (r = t.middlewareData.shift) != null && r.enabled.y && (I = x), k && !p) {
        const S = Xe(u.left, 0), L = Xe(u.right, 0), B = Xe(u.top, 0), W = Xe(u.bottom, 0);
        f ? A = h - 2 * (S !== 0 || L !== 0 ? S + L : Xe(u.left, u.right)) : I = m - 2 * (B !== 0 || W !== 0 ? B + W : Xe(u.top, u.bottom));
      }
      await c({
        ...t,
        availableWidth: A,
        availableHeight: I
      });
      const O = await o.getDimensions(s.floating);
      return h !== O.width || m !== O.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function Nr() {
  return typeof window < "u";
}
function fn(e) {
  return pc(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Qe(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function mt(e) {
  var t;
  return (t = (pc(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function pc(e) {
  return Nr() ? e instanceof Node || e instanceof Qe(e).Node : !1;
}
function ot(e) {
  return Nr() ? e instanceof Element || e instanceof Qe(e).Element : !1;
}
function Nt(e) {
  return Nr() ? e instanceof HTMLElement || e instanceof Qe(e).HTMLElement : !1;
}
function Ba(e) {
  return !Nr() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Qe(e).ShadowRoot;
}
function Bn(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: r,
    display: i
  } = at(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function S_(e) {
  return /^(table|td|th)$/.test(fn(e));
}
function Cr(e) {
  try {
    if (e.matches(":popover-open"))
      return !0;
  } catch {
  }
  try {
    return e.matches(":modal");
  } catch {
    return !1;
  }
}
const N_ = /transform|translate|scale|rotate|perspective|filter/, C_ = /paint|layout|strict|content/, $t = (e) => !!e && e !== "none";
let si;
function co(e) {
  const t = ot(e) ? at(e) : e;
  return $t(t.transform) || $t(t.translate) || $t(t.scale) || $t(t.rotate) || $t(t.perspective) || !uo() && ($t(t.backdropFilter) || $t(t.filter)) || N_.test(t.willChange || "") || C_.test(t.contain || "");
}
function T_(e) {
  let t = Mt(e);
  for (; Nt(t) && !on(t); ) {
    if (co(t))
      return t;
    if (Cr(t))
      return null;
    t = Mt(t);
  }
  return null;
}
function uo() {
  return si == null && (si = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), si;
}
function on(e) {
  return /^(html|body|#document)$/.test(fn(e));
}
function at(e) {
  return Qe(e).getComputedStyle(e);
}
function Tr(e) {
  return ot(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function Mt(e) {
  if (fn(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Ba(e) && e.host || // Fallback.
    mt(e)
  );
  return Ba(t) ? t.host : t;
}
function hc(e) {
  const t = Mt(e);
  return on(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Nt(t) && Bn(t) ? t : hc(t);
}
function Cn(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const i = hc(e), a = i === ((r = e.ownerDocument) == null ? void 0 : r.body), o = Qe(i);
  if (a) {
    const s = Ri(o);
    return t.concat(o, o.visualViewport || [], Bn(i) ? i : [], s && n ? Cn(s) : []);
  } else
    return t.concat(i, Cn(i, [], n));
}
function Ri(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function gc(e) {
  const t = at(e);
  let n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0;
  const i = Nt(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = pr(n) !== a || pr(r) !== o;
  return s && (n = a, r = o), {
    width: n,
    height: r,
    $: s
  };
}
function fo(e) {
  return ot(e) ? e : e.contextElement;
}
function nn(e) {
  const t = fo(e);
  if (!Nt(t))
    return ht(1);
  const n = t.getBoundingClientRect(), {
    width: r,
    height: i,
    $: a
  } = gc(t);
  let o = (a ? pr(n.width) : n.width) / r, s = (a ? pr(n.height) : n.height) / i;
  return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
    x: o,
    y: s
  };
}
const A_ = /* @__PURE__ */ ht(0);
function mc(e) {
  const t = Qe(e);
  return !uo() || !t.visualViewport ? A_ : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function R_(e, t, n) {
  return t === void 0 && (t = !1), !n || t && n !== Qe(e) ? !1 : t;
}
function Kt(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const i = e.getBoundingClientRect(), a = fo(e);
  let o = ht(1);
  t && (r ? ot(r) && (o = nn(r)) : o = nn(e));
  const s = R_(a, n, r) ? mc(a) : ht(0);
  let c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
  if (a) {
    const p = Qe(a), f = r && ot(r) ? Qe(r) : r;
    let h = p, m = Ri(h);
    for (; m && r && f !== h; ) {
      const b = nn(m), g = m.getBoundingClientRect(), x = at(m), _ = g.left + (m.clientLeft + parseFloat(x.paddingLeft)) * b.x, C = g.top + (m.clientTop + parseFloat(x.paddingTop)) * b.y;
      c *= b.x, l *= b.y, u *= b.x, d *= b.y, c += _, l += C, h = Qe(m), m = Ri(h);
    }
  }
  return gr({
    width: u,
    height: d,
    x: c,
    y: l
  });
}
function Ar(e, t) {
  const n = Tr(e).scrollLeft;
  return t ? t.left + n : Kt(mt(e)).left + n;
}
function bc(e, t) {
  const n = e.getBoundingClientRect(), r = n.left + t.scrollLeft - Ar(e, n), i = n.top + t.scrollTop;
  return {
    x: r,
    y: i
  };
}
function O_(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: r,
    strategy: i
  } = e;
  const a = i === "fixed", o = mt(r), s = t ? Cr(t.floating) : !1;
  if (r === o || s && a)
    return n;
  let c = {
    scrollLeft: 0,
    scrollTop: 0
  }, l = ht(1);
  const u = ht(0), d = Nt(r);
  if ((d || !d && !a) && ((fn(r) !== "body" || Bn(o)) && (c = Tr(r)), d)) {
    const f = Kt(r);
    l = nn(r), u.x = f.x + r.clientLeft, u.y = f.y + r.clientTop;
  }
  const p = o && !d && !a ? bc(o, c) : ht(0);
  return {
    width: n.width * l.x,
    height: n.height * l.y,
    x: n.x * l.x - c.scrollLeft * l.x + u.x + p.x,
    y: n.y * l.y - c.scrollTop * l.y + u.y + p.y
  };
}
function I_(e) {
  return Array.from(e.getClientRects());
}
function M_(e) {
  const t = mt(e), n = Tr(e), r = e.ownerDocument.body, i = Xe(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), a = Xe(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
  let o = -n.scrollLeft + Ar(e);
  const s = -n.scrollTop;
  return at(r).direction === "rtl" && (o += Xe(t.clientWidth, r.clientWidth) - i), {
    width: i,
    height: a,
    x: o,
    y: s
  };
}
const za = 25;
function D_(e, t) {
  const n = Qe(e), r = mt(e), i = n.visualViewport;
  let a = r.clientWidth, o = r.clientHeight, s = 0, c = 0;
  if (i) {
    a = i.width, o = i.height;
    const u = uo();
    (!u || u && t === "fixed") && (s = i.offsetLeft, c = i.offsetTop);
  }
  const l = Ar(r);
  if (l <= 0) {
    const u = r.ownerDocument, d = u.body, p = getComputedStyle(d), f = u.compatMode === "CSS1Compat" && parseFloat(p.marginLeft) + parseFloat(p.marginRight) || 0, h = Math.abs(r.clientWidth - d.clientWidth - f);
    h <= za && (a -= h);
  } else l <= za && (a += l);
  return {
    width: a,
    height: o,
    x: s,
    y: c
  };
}
function L_(e, t) {
  const n = Kt(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Nt(e) ? nn(e) : ht(1), o = e.clientWidth * a.x, s = e.clientHeight * a.y, c = i * a.x, l = r * a.y;
  return {
    width: o,
    height: s,
    x: c,
    y: l
  };
}
function Ua(e, t, n) {
  let r;
  if (t === "viewport")
    r = D_(e, n);
  else if (t === "document")
    r = M_(mt(e));
  else if (ot(t))
    r = L_(t, n);
  else {
    const i = mc(e);
    r = {
      x: t.x - i.x,
      y: t.y - i.y,
      width: t.width,
      height: t.height
    };
  }
  return gr(r);
}
function yc(e, t) {
  const n = Mt(e);
  return n === t || !ot(n) || on(n) ? !1 : at(n).position === "fixed" || yc(n, t);
}
function P_(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let r = Cn(e, [], !1).filter((s) => ot(s) && fn(s) !== "body"), i = null;
  const a = at(e).position === "fixed";
  let o = a ? Mt(e) : e;
  for (; ot(o) && !on(o); ) {
    const s = at(o), c = co(o);
    !c && s.position === "fixed" && (i = null), (a ? !c && !i : !c && s.position === "static" && !!i && (i.position === "absolute" || i.position === "fixed") || Bn(o) && !c && yc(e, o)) ? r = r.filter((u) => u !== o) : i = s, o = Mt(o);
  }
  return t.set(e, r), r;
}
function F_(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: r,
    strategy: i
  } = e;
  const o = [...n === "clippingAncestors" ? Cr(t) ? [] : P_(t, this._c) : [].concat(n), r], s = Ua(t, o[0], i);
  let c = s.top, l = s.right, u = s.bottom, d = s.left;
  for (let p = 1; p < o.length; p++) {
    const f = Ua(t, o[p], i);
    c = Xe(f.top, c), l = It(f.right, l), u = It(f.bottom, u), d = Xe(f.left, d);
  }
  return {
    width: l - d,
    height: u - c,
    x: d,
    y: c
  };
}
function B_(e) {
  const {
    width: t,
    height: n
  } = gc(e);
  return {
    width: t,
    height: n
  };
}
function z_(e, t, n) {
  const r = Nt(t), i = mt(t), a = n === "fixed", o = Kt(e, !0, a, t);
  let s = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const c = ht(0);
  function l() {
    c.x = Ar(i);
  }
  if (r || !r && !a)
    if ((fn(t) !== "body" || Bn(i)) && (s = Tr(t)), r) {
      const f = Kt(t, !0, a, t);
      c.x = f.x + t.clientLeft, c.y = f.y + t.clientTop;
    } else i && l();
  a && !r && i && l();
  const u = i && !r && !a ? bc(i, s) : ht(0), d = o.left + s.scrollLeft - c.x - u.x, p = o.top + s.scrollTop - c.y - u.y;
  return {
    x: d,
    y: p,
    width: o.width,
    height: o.height
  };
}
function li(e) {
  return at(e).position === "static";
}
function $a(e, t) {
  if (!Nt(e) || at(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return mt(e) === n && (n = n.ownerDocument.body), n;
}
function Ec(e, t) {
  const n = Qe(e);
  if (Cr(e))
    return n;
  if (!Nt(e)) {
    let i = Mt(e);
    for (; i && !on(i); ) {
      if (ot(i) && !li(i))
        return i;
      i = Mt(i);
    }
    return n;
  }
  let r = $a(e, t);
  for (; r && S_(r) && li(r); )
    r = $a(r, t);
  return r && on(r) && li(r) && !co(r) ? n : r || T_(e) || n;
}
const U_ = async function(e) {
  const t = this.getOffsetParent || Ec, n = this.getDimensions, r = await n(e.floating);
  return {
    reference: z_(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: r.width,
      height: r.height
    }
  };
};
function $_(e) {
  return at(e).direction === "rtl";
}
const H_ = {
  convertOffsetParentRelativeRectToViewportRelativeRect: O_,
  getDocumentElement: mt,
  getClippingRect: F_,
  getOffsetParent: Ec,
  getElementRects: U_,
  getClientRects: I_,
  getDimensions: B_,
  getScale: nn,
  isElement: ot,
  isRTL: $_
};
function _c(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function G_(e, t) {
  let n = null, r;
  const i = mt(e);
  function a() {
    var s;
    clearTimeout(r), (s = n) == null || s.disconnect(), n = null;
  }
  function o(s, c) {
    s === void 0 && (s = !1), c === void 0 && (c = 1), a();
    const l = e.getBoundingClientRect(), {
      left: u,
      top: d,
      width: p,
      height: f
    } = l;
    if (s || t(), !p || !f)
      return;
    const h = rr(d), m = rr(i.clientWidth - (u + p)), b = rr(i.clientHeight - (d + f)), g = rr(u), _ = {
      rootMargin: -h + "px " + -m + "px " + -b + "px " + -g + "px",
      threshold: Xe(0, It(1, c)) || 1
    };
    let C = !0;
    function T(k) {
      const I = k[0].intersectionRatio;
      if (I !== c) {
        if (!C)
          return o();
        I ? o(!1, I) : r = setTimeout(() => {
          o(!1, 1e-7);
        }, 1e3);
      }
      I === 1 && !_c(l, e.getBoundingClientRect()) && o(), C = !1;
    }
    try {
      n = new IntersectionObserver(T, {
        ..._,
        // Handle <iframe>s
        root: i.ownerDocument
      });
    } catch {
      n = new IntersectionObserver(T, _);
    }
    n.observe(e);
  }
  return o(!0), a;
}
function K_(e, t, n, r) {
  r === void 0 && (r = {});
  const {
    ancestorScroll: i = !0,
    ancestorResize: a = !0,
    elementResize: o = typeof ResizeObserver == "function",
    layoutShift: s = typeof IntersectionObserver == "function",
    animationFrame: c = !1
  } = r, l = fo(e), u = i || a ? [...l ? Cn(l) : [], ...t ? Cn(t) : []] : [];
  u.forEach((g) => {
    i && g.addEventListener("scroll", n, {
      passive: !0
    }), a && g.addEventListener("resize", n);
  });
  const d = l && s ? G_(l, n) : null;
  let p = -1, f = null;
  o && (f = new ResizeObserver((g) => {
    let [x] = g;
    x && x.target === l && f && t && (f.unobserve(t), cancelAnimationFrame(p), p = requestAnimationFrame(() => {
      var _;
      (_ = f) == null || _.observe(t);
    })), n();
  }), l && !c && f.observe(l), t && f.observe(t));
  let h, m = c ? Kt(e) : null;
  c && b();
  function b() {
    const g = Kt(e);
    m && !_c(m, g) && n(), m = g, h = requestAnimationFrame(b);
  }
  return n(), () => {
    var g;
    u.forEach((x) => {
      i && x.removeEventListener("scroll", n), a && x.removeEventListener("resize", n);
    }), d?.(), (g = f) == null || g.disconnect(), f = null, c && cancelAnimationFrame(h);
  };
}
const q_ = w_, W_ = x_, V_ = y_, Y_ = v_, Z_ = E_, Ha = b_, X_ = k_, j_ = (e, t, n) => {
  const r = /* @__PURE__ */ new Map(), i = {
    platform: H_,
    ...n
  }, a = {
    ...i.platform,
    _c: r
  };
  return m_(e, t, {
    ...i,
    platform: a
  });
};
var Q_ = typeof document < "u", J_ = function() {
}, or = Q_ ? hu : J_;
function mr(e, t) {
  if (e === t)
    return !0;
  if (typeof e != typeof t)
    return !1;
  if (typeof e == "function" && e.toString() === t.toString())
    return !0;
  let n, r, i;
  if (e && t && typeof e == "object") {
    if (Array.isArray(e)) {
      if (n = e.length, n !== t.length) return !1;
      for (r = n; r-- !== 0; )
        if (!mr(e[r], t[r]))
          return !1;
      return !0;
    }
    if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length)
      return !1;
    for (r = n; r-- !== 0; )
      if (!{}.hasOwnProperty.call(t, i[r]))
        return !1;
    for (r = n; r-- !== 0; ) {
      const a = i[r];
      if (!(a === "_owner" && e.$$typeof) && !mr(e[a], t[a]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function wc(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Ga(e, t) {
  const n = wc(e);
  return Math.round(t * n) / n;
}
function ci(e) {
  const t = N.useRef(e);
  return or(() => {
    t.current = e;
  }), t;
}
function ew(e) {
  e === void 0 && (e = {});
  const {
    placement: t = "bottom",
    strategy: n = "absolute",
    middleware: r = [],
    platform: i,
    elements: {
      reference: a,
      floating: o
    } = {},
    transform: s = !0,
    whileElementsMounted: c,
    open: l
  } = e, [u, d] = N.useState({
    x: 0,
    y: 0,
    strategy: n,
    placement: t,
    middlewareData: {},
    isPositioned: !1
  }), [p, f] = N.useState(r);
  mr(p, r) || f(r);
  const [h, m] = N.useState(null), [b, g] = N.useState(null), x = N.useCallback(($) => {
    $ !== k.current && (k.current = $, m($));
  }, []), _ = N.useCallback(($) => {
    $ !== I.current && (I.current = $, g($));
  }, []), C = a || h, T = o || b, k = N.useRef(null), I = N.useRef(null), A = N.useRef(u), O = c != null, S = ci(c), L = ci(i), B = ci(l), W = N.useCallback(() => {
    if (!k.current || !I.current)
      return;
    const $ = {
      placement: t,
      strategy: n,
      middleware: p
    };
    L.current && ($.platform = L.current), j_(k.current, I.current, $).then((ne) => {
      const y = {
        ...ne,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: B.current !== !1
      };
      P.current && !mr(A.current, y) && (A.current = y, Xa.flushSync(() => {
        d(y);
      }));
    });
  }, [p, t, n, L, B]);
  or(() => {
    l === !1 && A.current.isPositioned && (A.current.isPositioned = !1, d(($) => ({
      ...$,
      isPositioned: !1
    })));
  }, [l]);
  const P = N.useRef(!1);
  or(() => (P.current = !0, () => {
    P.current = !1;
  }), []), or(() => {
    if (C && (k.current = C), T && (I.current = T), C && T) {
      if (S.current)
        return S.current(C, T, W);
      W();
    }
  }, [C, T, W, S, O]);
  const D = N.useMemo(() => ({
    reference: k,
    floating: I,
    setReference: x,
    setFloating: _
  }), [x, _]), K = N.useMemo(() => ({
    reference: C,
    floating: T
  }), [C, T]), Q = N.useMemo(() => {
    const $ = {
      position: n,
      left: 0,
      top: 0
    };
    if (!K.floating)
      return $;
    const ne = Ga(K.floating, u.x), y = Ga(K.floating, u.y);
    return s ? {
      ...$,
      transform: "translate(" + ne + "px, " + y + "px)",
      ...wc(K.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: ne,
      top: y
    };
  }, [n, s, K.floating, u.x, u.y]);
  return N.useMemo(() => ({
    ...u,
    update: W,
    refs: D,
    elements: K,
    floatingStyles: Q
  }), [u, W, D, K, Q]);
}
const tw = (e) => {
  function t(n) {
    return {}.hasOwnProperty.call(n, "current");
  }
  return {
    name: "arrow",
    options: e,
    fn(n) {
      const {
        element: r,
        padding: i
      } = typeof e == "function" ? e(n) : e;
      return r && t(r) ? r.current != null ? Ha({
        element: r.current,
        padding: i
      }).fn(n) : {} : r ? Ha({
        element: r,
        padding: i
      }).fn(n) : {};
    }
  };
}, nw = (e, t) => {
  const n = q_(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, rw = (e, t) => {
  const n = W_(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, iw = (e, t) => ({
  fn: X_(e).fn,
  options: [e, t]
}), ow = (e, t) => {
  const n = V_(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, aw = (e, t) => {
  const n = Y_(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, sw = (e, t) => {
  const n = Z_(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, lw = (e, t) => {
  const n = tw(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
};
var cw = "Arrow", xc = N.forwardRef((e, t) => {
  const { children: n, width: r = 10, height: i = 5, ...a } = e;
  return /* @__PURE__ */ v(
    Te.svg,
    {
      ...a,
      ref: t,
      width: r,
      height: i,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: e.asChild ? n : /* @__PURE__ */ v("polygon", { points: "0,0 30,0 15,10" })
    }
  );
});
xc.displayName = cw;
var uw = xc, po = "Popper", [kc, vc] = Lt(po), [dw, Sc] = kc(po), Nc = (e) => {
  const { __scopePopper: t, children: n } = e, [r, i] = N.useState(null);
  return /* @__PURE__ */ v(dw, { scope: t, anchor: r, onAnchorChange: i, children: n });
};
Nc.displayName = po;
var Cc = "PopperAnchor", Tc = N.forwardRef(
  (e, t) => {
    const { __scopePopper: n, virtualRef: r, ...i } = e, a = Sc(Cc, n), o = N.useRef(null), s = Le(t, o), c = N.useRef(null);
    return N.useEffect(() => {
      const l = c.current;
      c.current = r?.current || o.current, l !== c.current && a.onAnchorChange(c.current);
    }), r ? null : /* @__PURE__ */ v(Te.div, { ...i, ref: s });
  }
);
Tc.displayName = Cc;
var ho = "PopperContent", [fw, pw] = kc(ho), Ac = N.forwardRef(
  (e, t) => {
    const {
      __scopePopper: n,
      side: r = "bottom",
      sideOffset: i = 0,
      align: a = "center",
      alignOffset: o = 0,
      arrowPadding: s = 0,
      avoidCollisions: c = !0,
      collisionBoundary: l = [],
      collisionPadding: u = 0,
      sticky: d = "partial",
      hideWhenDetached: p = !1,
      updatePositionStrategy: f = "optimized",
      onPlaced: h,
      ...m
    } = e, b = Sc(ho, n), [g, x] = N.useState(null), _ = Le(t, (Fe) => x(Fe)), [C, T] = N.useState(null), k = io(C), I = k?.width ?? 0, A = k?.height ?? 0, O = r + (a !== "center" ? "-" + a : ""), S = typeof u == "number" ? u : { top: 0, right: 0, bottom: 0, left: 0, ...u }, L = Array.isArray(l) ? l : [l], B = L.length > 0, W = {
      padding: S,
      boundary: L.filter(gw),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: B
    }, { refs: P, floatingStyles: D, placement: K, isPositioned: Q, middlewareData: $ } = ew({
      // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
      strategy: "fixed",
      placement: O,
      whileElementsMounted: (...Fe) => K_(...Fe, {
        animationFrame: f === "always"
      }),
      elements: {
        reference: b.anchor
      },
      middleware: [
        nw({ mainAxis: i + A, alignmentAxis: o }),
        c && rw({
          mainAxis: !0,
          crossAxis: !1,
          limiter: d === "partial" ? iw() : void 0,
          ...W
        }),
        c && ow({ ...W }),
        aw({
          ...W,
          apply: ({ elements: Fe, rects: Ie, availableWidth: et, availableHeight: Be }) => {
            const { width: st, height: Pt } = Ie.reference, lt = Fe.floating.style;
            lt.setProperty("--radix-popper-available-width", `${et}px`), lt.setProperty("--radix-popper-available-height", `${Be}px`), lt.setProperty("--radix-popper-anchor-width", `${st}px`), lt.setProperty("--radix-popper-anchor-height", `${Pt}px`);
          }
        }),
        C && lw({ element: C, padding: s }),
        mw({ arrowWidth: I, arrowHeight: A }),
        p && sw({ strategy: "referenceHidden", ...W })
      ]
    }), [ne, y] = Ic(K), ue = Pn(h);
    xt(() => {
      Q && ue?.();
    }, [Q, ue]);
    const fe = $.arrow?.x, w = $.arrow?.y, Re = $.arrow?.centerOffset !== 0, [Ge, _e] = N.useState();
    return xt(() => {
      g && _e(window.getComputedStyle(g).zIndex);
    }, [g]), /* @__PURE__ */ v(
      "div",
      {
        ref: P.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...D,
          transform: Q ? D.transform : "translate(0, -200%)",
          // keep off the page when measuring
          minWidth: "max-content",
          zIndex: Ge,
          "--radix-popper-transform-origin": [
            $.transformOrigin?.x,
            $.transformOrigin?.y
          ].join(" "),
          // hide the content if using the hide middleware and should be hidden
          // set visibility to hidden and disable pointer events so the UI behaves
          // as if the PopperContent isn't there at all
          ...$.hide?.referenceHidden && {
            visibility: "hidden",
            pointerEvents: "none"
          }
        },
        dir: e.dir,
        children: /* @__PURE__ */ v(
          fw,
          {
            scope: n,
            placedSide: ne,
            onArrowChange: T,
            arrowX: fe,
            arrowY: w,
            shouldHideArrow: Re,
            children: /* @__PURE__ */ v(
              Te.div,
              {
                "data-side": ne,
                "data-align": y,
                ...m,
                ref: _,
                style: {
                  ...m.style,
                  // if the PopperContent hasn't been placed yet (not all measurements done)
                  // we prevent animations so that users's animation don't kick in too early referring wrong sides
                  animation: Q ? void 0 : "none"
                }
              }
            )
          }
        )
      }
    );
  }
);
Ac.displayName = ho;
var Rc = "PopperArrow", hw = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
}, Oc = N.forwardRef(function(t, n) {
  const { __scopePopper: r, ...i } = t, a = pw(Rc, r), o = hw[a.placedSide];
  return (
    // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
    // doesn't report size as we'd expect on SVG elements.
    // it reports their bounding box which is effectively the largest path inside the SVG.
    /* @__PURE__ */ v(
      "span",
      {
        ref: a.onArrowChange,
        style: {
          position: "absolute",
          left: a.arrowX,
          top: a.arrowY,
          [o]: 0,
          transformOrigin: {
            top: "",
            right: "0 0",
            bottom: "center 0",
            left: "100% 0"
          }[a.placedSide],
          transform: {
            top: "translateY(100%)",
            right: "translateY(50%) rotate(90deg) translateX(-50%)",
            bottom: "rotate(180deg)",
            left: "translateY(50%) rotate(-90deg) translateX(50%)"
          }[a.placedSide],
          visibility: a.shouldHideArrow ? "hidden" : void 0
        },
        children: /* @__PURE__ */ v(
          uw,
          {
            ...i,
            ref: n,
            style: {
              ...i.style,
              // ensures the element can be measured correctly (mostly for if SVG)
              display: "block"
            }
          }
        )
      }
    )
  );
});
Oc.displayName = Rc;
function gw(e) {
  return e !== null;
}
var mw = (e) => ({
  name: "transformOrigin",
  options: e,
  fn(t) {
    const { placement: n, rects: r, middlewareData: i } = t, o = i.arrow?.centerOffset !== 0, s = o ? 0 : e.arrowWidth, c = o ? 0 : e.arrowHeight, [l, u] = Ic(n), d = { start: "0%", center: "50%", end: "100%" }[u], p = (i.arrow?.x ?? 0) + s / 2, f = (i.arrow?.y ?? 0) + c / 2;
    let h = "", m = "";
    return l === "bottom" ? (h = o ? d : `${p}px`, m = `${-c}px`) : l === "top" ? (h = o ? d : `${p}px`, m = `${r.floating.height + c}px`) : l === "right" ? (h = `${-c}px`, m = o ? d : `${f}px`) : l === "left" && (h = `${r.floating.width + c}px`, m = o ? d : `${f}px`), { data: { x: h, y: m } };
  }
});
function Ic(e) {
  const [t, n = "center"] = e.split("-");
  return [t, n];
}
var bw = Nc, yw = Tc, Ew = Ac, _w = Oc, ww = "Portal", Mc = N.forwardRef((e, t) => {
  const { container: n, ...r } = e, [i, a] = N.useState(!1);
  xt(() => a(!0), []);
  const o = n || i && globalThis?.document?.body;
  return o ? gu.createPortal(/* @__PURE__ */ v(Te.div, { ...r, ref: t }), o) : null;
});
Mc.displayName = ww;
var xw = Object.freeze({
  // See: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss
  position: "absolute",
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  wordWrap: "normal"
}), kw = "VisuallyHidden", Dc = N.forwardRef(
  (e, t) => /* @__PURE__ */ v(
    Te.span,
    {
      ...e,
      ref: t,
      style: { ...xw, ...e.style }
    }
  )
);
Dc.displayName = kw;
var vw = Dc, [Rr] = Lt("Tooltip", [
  vc
]), Or = vc(), Lc = "TooltipProvider", Sw = 700, Oi = "tooltip.open", [Nw, go] = Rr(Lc), Pc = (e) => {
  const {
    __scopeTooltip: t,
    delayDuration: n = Sw,
    skipDelayDuration: r = 300,
    disableHoverableContent: i = !1,
    children: a
  } = e, o = N.useRef(!0), s = N.useRef(!1), c = N.useRef(0);
  return N.useEffect(() => {
    const l = c.current;
    return () => window.clearTimeout(l);
  }, []), /* @__PURE__ */ v(
    Nw,
    {
      scope: t,
      isOpenDelayedRef: o,
      delayDuration: n,
      onOpen: N.useCallback(() => {
        window.clearTimeout(c.current), o.current = !1;
      }, []),
      onClose: N.useCallback(() => {
        window.clearTimeout(c.current), c.current = window.setTimeout(
          () => o.current = !0,
          r
        );
      }, [r]),
      isPointerInTransitRef: s,
      onPointerInTransitChange: N.useCallback((l) => {
        s.current = l;
      }, []),
      disableHoverableContent: i,
      children: a
    }
  );
};
Pc.displayName = Lc;
var Tn = "Tooltip", [Cw, zn] = Rr(Tn), Fc = (e) => {
  const {
    __scopeTooltip: t,
    children: n,
    open: r,
    defaultOpen: i,
    onOpenChange: a,
    disableHoverableContent: o,
    delayDuration: s
  } = e, c = go(Tn, e.__scopeTooltip), l = Or(t), [u, d] = N.useState(null), p = eo(), f = N.useRef(0), h = o ?? c.disableHoverableContent, m = s ?? c.delayDuration, b = N.useRef(!1), [g, x] = Dn({
    prop: r,
    defaultProp: i ?? !1,
    onChange: (I) => {
      I ? (c.onOpen(), document.dispatchEvent(new CustomEvent(Oi))) : c.onClose(), a?.(I);
    },
    caller: Tn
  }), _ = N.useMemo(() => g ? b.current ? "delayed-open" : "instant-open" : "closed", [g]), C = N.useCallback(() => {
    window.clearTimeout(f.current), f.current = 0, b.current = !1, x(!0);
  }, [x]), T = N.useCallback(() => {
    window.clearTimeout(f.current), f.current = 0, x(!1);
  }, [x]), k = N.useCallback(() => {
    window.clearTimeout(f.current), f.current = window.setTimeout(() => {
      b.current = !0, x(!0), f.current = 0;
    }, m);
  }, [m, x]);
  return N.useEffect(() => () => {
    f.current && (window.clearTimeout(f.current), f.current = 0);
  }, []), /* @__PURE__ */ v(bw, { ...l, children: /* @__PURE__ */ v(
    Cw,
    {
      scope: t,
      contentId: p,
      open: g,
      stateAttribute: _,
      trigger: u,
      onTriggerChange: d,
      onTriggerEnter: N.useCallback(() => {
        c.isOpenDelayedRef.current ? k() : C();
      }, [c.isOpenDelayedRef, k, C]),
      onTriggerLeave: N.useCallback(() => {
        h ? T() : (window.clearTimeout(f.current), f.current = 0);
      }, [T, h]),
      onOpen: C,
      onClose: T,
      disableHoverableContent: h,
      children: n
    }
  ) });
};
Fc.displayName = Tn;
var Ii = "TooltipTrigger", Bc = N.forwardRef(
  (e, t) => {
    const { __scopeTooltip: n, ...r } = e, i = zn(Ii, n), a = go(Ii, n), o = Or(n), s = N.useRef(null), c = Le(t, s, i.onTriggerChange), l = N.useRef(!1), u = N.useRef(!1), d = N.useCallback(() => l.current = !1, []);
    return N.useEffect(() => () => document.removeEventListener("pointerup", d), [d]), /* @__PURE__ */ v(yw, { asChild: !0, ...o, children: /* @__PURE__ */ v(
      Te.button,
      {
        "aria-describedby": i.open ? i.contentId : void 0,
        "data-state": i.stateAttribute,
        ...r,
        ref: c,
        onPointerMove: Ne(e.onPointerMove, (p) => {
          p.pointerType !== "touch" && !u.current && !a.isPointerInTransitRef.current && (i.onTriggerEnter(), u.current = !0);
        }),
        onPointerLeave: Ne(e.onPointerLeave, () => {
          i.onTriggerLeave(), u.current = !1;
        }),
        onPointerDown: Ne(e.onPointerDown, () => {
          i.open && i.onClose(), l.current = !0, document.addEventListener("pointerup", d, { once: !0 });
        }),
        onFocus: Ne(e.onFocus, () => {
          l.current || i.onOpen();
        }),
        onBlur: Ne(e.onBlur, i.onClose),
        onClick: Ne(e.onClick, i.onClose)
      }
    ) });
  }
);
Bc.displayName = Ii;
var mo = "TooltipPortal", [Tw, Aw] = Rr(mo, {
  forceMount: void 0
}), zc = (e) => {
  const { __scopeTooltip: t, forceMount: n, children: r, container: i } = e, a = zn(mo, t);
  return /* @__PURE__ */ v(Tw, { scope: t, forceMount: n, children: /* @__PURE__ */ v(Ln, { present: n || a.open, children: /* @__PURE__ */ v(Mc, { asChild: !0, container: i, children: r }) }) });
};
zc.displayName = mo;
var an = "TooltipContent", Uc = N.forwardRef(
  (e, t) => {
    const n = Aw(an, e.__scopeTooltip), { forceMount: r = n.forceMount, side: i = "top", ...a } = e, o = zn(an, e.__scopeTooltip);
    return /* @__PURE__ */ v(Ln, { present: r || o.open, children: o.disableHoverableContent ? /* @__PURE__ */ v($c, { side: i, ...a, ref: t }) : /* @__PURE__ */ v(Rw, { side: i, ...a, ref: t }) });
  }
), Rw = N.forwardRef((e, t) => {
  const n = zn(an, e.__scopeTooltip), r = go(an, e.__scopeTooltip), i = N.useRef(null), a = Le(t, i), [o, s] = N.useState(null), { trigger: c, onClose: l } = n, u = i.current, { onPointerInTransitChange: d } = r, p = N.useCallback(() => {
    s(null), d(!1);
  }, [d]), f = N.useCallback(
    (h, m) => {
      const b = h.currentTarget, g = { x: h.clientX, y: h.clientY }, x = Lw(g, b.getBoundingClientRect()), _ = Pw(g, x), C = Fw(m.getBoundingClientRect()), T = zw([..._, ...C]);
      s(T), d(!0);
    },
    [d]
  );
  return N.useEffect(() => () => p(), [p]), N.useEffect(() => {
    if (c && u) {
      const h = (b) => f(b, u), m = (b) => f(b, c);
      return c.addEventListener("pointerleave", h), u.addEventListener("pointerleave", m), () => {
        c.removeEventListener("pointerleave", h), u.removeEventListener("pointerleave", m);
      };
    }
  }, [c, u, f, p]), N.useEffect(() => {
    if (o) {
      const h = (m) => {
        const b = m.target, g = { x: m.clientX, y: m.clientY }, x = c?.contains(b) || u?.contains(b), _ = !Bw(g, o);
        x ? p() : _ && (p(), l());
      };
      return document.addEventListener("pointermove", h), () => document.removeEventListener("pointermove", h);
    }
  }, [c, u, o, l, p]), /* @__PURE__ */ v($c, { ...e, ref: a });
}), [Ow, Iw] = Rr(Tn, { isInside: !1 }), Mw = /* @__PURE__ */ nE("TooltipContent"), $c = N.forwardRef(
  (e, t) => {
    const {
      __scopeTooltip: n,
      children: r,
      "aria-label": i,
      onEscapeKeyDown: a,
      onPointerDownOutside: o,
      ...s
    } = e, c = zn(an, n), l = Or(n), { onClose: u } = c;
    return N.useEffect(() => (document.addEventListener(Oi, u), () => document.removeEventListener(Oi, u)), [u]), N.useEffect(() => {
      if (c.trigger) {
        const d = (p) => {
          p.target?.contains(c.trigger) && u();
        };
        return window.addEventListener("scroll", d, { capture: !0 }), () => window.removeEventListener("scroll", d, { capture: !0 });
      }
    }, [c.trigger, u]), /* @__PURE__ */ v(
      cc,
      {
        asChild: !0,
        disableOutsidePointerEvents: !1,
        onEscapeKeyDown: a,
        onPointerDownOutside: o,
        onFocusOutside: (d) => d.preventDefault(),
        onDismiss: u,
        children: /* @__PURE__ */ Y(
          Ew,
          {
            "data-state": c.stateAttribute,
            ...l,
            ...s,
            ref: t,
            style: {
              ...s.style,
              "--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)",
              "--radix-tooltip-content-available-width": "var(--radix-popper-available-width)",
              "--radix-tooltip-content-available-height": "var(--radix-popper-available-height)",
              "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
              "--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)"
            },
            children: [
              /* @__PURE__ */ v(Mw, { children: r }),
              /* @__PURE__ */ v(Ow, { scope: n, isInside: !0, children: /* @__PURE__ */ v(vw, { id: c.contentId, role: "tooltip", children: i || r }) })
            ]
          }
        )
      }
    );
  }
);
Uc.displayName = an;
var Hc = "TooltipArrow", Dw = N.forwardRef(
  (e, t) => {
    const { __scopeTooltip: n, ...r } = e, i = Or(n);
    return Iw(
      Hc,
      n
    ).isInside ? null : /* @__PURE__ */ v(_w, { ...i, ...r, ref: t });
  }
);
Dw.displayName = Hc;
function Lw(e, t) {
  const n = Math.abs(t.top - e.y), r = Math.abs(t.bottom - e.y), i = Math.abs(t.right - e.x), a = Math.abs(t.left - e.x);
  switch (Math.min(n, r, i, a)) {
    case a:
      return "left";
    case i:
      return "right";
    case n:
      return "top";
    case r:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function Pw(e, t, n = 5) {
  const r = [];
  switch (t) {
    case "top":
      r.push(
        { x: e.x - n, y: e.y + n },
        { x: e.x + n, y: e.y + n }
      );
      break;
    case "bottom":
      r.push(
        { x: e.x - n, y: e.y - n },
        { x: e.x + n, y: e.y - n }
      );
      break;
    case "left":
      r.push(
        { x: e.x + n, y: e.y - n },
        { x: e.x + n, y: e.y + n }
      );
      break;
    case "right":
      r.push(
        { x: e.x - n, y: e.y - n },
        { x: e.x - n, y: e.y + n }
      );
      break;
  }
  return r;
}
function Fw(e) {
  const { top: t, right: n, bottom: r, left: i } = e;
  return [
    { x: i, y: t },
    { x: n, y: t },
    { x: n, y: r },
    { x: i, y: r }
  ];
}
function Bw(e, t) {
  const { x: n, y: r } = e;
  let i = !1;
  for (let a = 0, o = t.length - 1; a < t.length; o = a++) {
    const s = t[a], c = t[o], l = s.x, u = s.y, d = c.x, p = c.y;
    u > r != p > r && n < (d - l) * (r - u) / (p - u) + l && (i = !i);
  }
  return i;
}
function zw(e) {
  const t = e.slice();
  return t.sort((n, r) => n.x < r.x ? -1 : n.x > r.x ? 1 : n.y < r.y ? -1 : n.y > r.y ? 1 : 0), Uw(t);
}
function Uw(e) {
  if (e.length <= 1) return e.slice();
  const t = [];
  for (let r = 0; r < e.length; r++) {
    const i = e[r];
    for (; t.length >= 2; ) {
      const a = t[t.length - 1], o = t[t.length - 2];
      if ((a.x - o.x) * (i.y - o.y) >= (a.y - o.y) * (i.x - o.x)) t.pop();
      else break;
    }
    t.push(i);
  }
  t.pop();
  const n = [];
  for (let r = e.length - 1; r >= 0; r--) {
    const i = e[r];
    for (; n.length >= 2; ) {
      const a = n[n.length - 1], o = n[n.length - 2];
      if ((a.x - o.x) * (i.y - o.y) >= (a.y - o.y) * (i.x - o.x)) n.pop();
      else break;
    }
    n.push(i);
  }
  return n.pop(), t.length === 1 && n.length === 1 && t[0].x === n[0].x && t[0].y === n[0].y ? t : t.concat(n);
}
var $w = Pc, Hw = Fc, Gw = Bc, Kw = zc, qw = Uc;
const Ka = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, qa = Qa, Ww = (e, t) => (n) => {
  var r;
  if (t?.variants == null) return qa(e, n?.class, n?.className);
  const { variants: i, defaultVariants: a } = t, o = Object.keys(i).map((l) => {
    const u = n?.[l], d = a?.[l];
    if (u === null) return null;
    const p = Ka(u) || Ka(d);
    return i[l][p];
  }), s = n && Object.entries(n).reduce((l, u) => {
    let [d, p] = u;
    return p === void 0 || (l[d] = p), l;
  }, {}), c = t == null || (r = t.compoundVariants) === null || r === void 0 ? void 0 : r.reduce((l, u) => {
    let { class: d, className: p, ...f } = u;
    return Object.entries(f).every((h) => {
      let [m, b] = h;
      return Array.isArray(b) ? b.includes({
        ...a,
        ...s
      }[m]) : {
        ...a,
        ...s
      }[m] === b;
    }) ? [
      ...l,
      d,
      p
    ] : l;
  }, []);
  return qa(e, o, c, n?.class, n?.className);
}, Vw = Ww("chat-v2-button", {
  variants: { variant: { default: "is-default", ghost: "is-ghost", outline: "is-outline", danger: "is-danger" }, size: { sm: "is-sm", md: "is-md", icon: "is-icon" } },
  defaultVariants: { variant: "default", size: "md" }
}), $e = sn(({ className: e, variant: t, size: n, ...r }, i) => /* @__PURE__ */ v("button", { ref: i, className: ln(Vw({ variant: t, size: n }), e), ...r }));
$e.displayName = "Button";
const bo = sn(({ className: e, ...t }, n) => /* @__PURE__ */ v("textarea", { ref: n, className: ln("chat-v2-textarea", e), ...t }));
bo.displayName = "Textarea";
function Gc({ children: e, className: t }) {
  return /* @__PURE__ */ v("span", { className: ln("chat-v2-badge", t), children: e });
}
const Kc = mE, qc = bE, Wc = yE, Yw = HE, Vc = sn(({ className: e, ...t }, n) => /* @__PURE__ */ v(GE, { ref: n, className: ln("chat-v2-radio-item", e), ...t, children: /* @__PURE__ */ v(KE, { className: "chat-v2-radio-indicator" }) }));
Vc.displayName = "RadioGroupItem";
const Yc = sn(({ className: e, ...t }, n) => /* @__PURE__ */ v(ZE, { ref: n, className: ln("chat-v2-switch", e), ...t, children: /* @__PURE__ */ v(XE, { className: "chat-v2-switch-thumb" }) }));
Yc.displayName = "Switch";
function vn({ label: e, children: t }) {
  return /* @__PURE__ */ v($w, { delayDuration: 300, children: /* @__PURE__ */ Y(Hw, { children: [
    /* @__PURE__ */ v(Gw, { asChild: !0, children: t }),
    /* @__PURE__ */ v(Kw, { children: /* @__PURE__ */ v(qw, { className: "chat-v2-tooltip", sideOffset: 6, children: e }) })
  ] }) });
}
const Zw = 8192, Xw = 20;
function An(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Wa(e) {
  if (e == null) return "";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e, null, 2);
  } catch {
    return String(e);
  }
}
function jw(e) {
  const t = An(e), n = An(t?.task) ?? t, r = typeof n?.command == "string" ? n.command : void 0, i = Array.isArray(n?.args) ? n.args.map(String) : [], a = [n?.cwd, n?.workdir, t?.cwd, t?.workdir].find((o) => typeof o == "string");
  return { command: r ? `${r}${i.length ? ` ${i.join(" ")}` : ""}` : void 0, cwd: a };
}
function Qw(e) {
  const t = An(e), n = An(t?.result) ?? t, r = [n?.stdout, n?.output, t?.stdout].find((o) => typeof o == "string"), i = [n?.stderr, t?.stderr, t?.error].find((o) => typeof o == "string"), a = n?.exitCode ?? n?.exit_code ?? t?.exitCode ?? t?.exit_code;
  return { stdout: r, stderr: i, exitCode: a == null ? void 0 : String(a) };
}
function Jw(e) {
  const n = e.split(`
`).slice(0, Xw).join(`
`).slice(0, Zw);
  return { text: n, truncated: n.length < e.length };
}
function ex(e) {
  const t = An(e);
  return t?.type === "runner-files-changed" && t.version === 1 && Array.isArray(t.files) ? e : null;
}
function tx(e) {
  return e.includes("exec") || e.includes("shell") ? /* @__PURE__ */ v(Mu, { size: 15 }) : e.includes("search") ? /* @__PURE__ */ v(Ru, { size: 15 }) : e.includes("write") || e.includes("patch") ? /* @__PURE__ */ v(Nu, { size: 15 }) : /* @__PURE__ */ v(Lu, { size: 15 });
}
function nx({ message: e }) {
  const t = e.status === "error" || !!e.tool.error, n = e.status === "running" || e.status === "pending", [r, i] = rt(t || n), [a, o] = rt(!1), [s, c] = rt(!1), l = jw(e.tool.input), u = Qw(e.tool.output), d = ex(e.tool.output), p = Wa(e.tool.input), f = Wa(e.tool.output), h = u.stdout ?? f, m = Mi(() => Jw(h), [h]), b = l.command ?? e.title ?? e.tool.name.replace(/[._]/g, " "), g = [l.cwd && `cwd: ${l.cwd}`, l.command, h, u.stderr, e.tool.error].filter(Boolean).join(`

`);
  return /* @__PURE__ */ Y(Kc, { open: r, onOpenChange: i, className: `chat-v2-tool ${t ? "is-error" : n ? "is-running" : "is-success"}`, children: [
    /* @__PURE__ */ v(qc, { asChild: !0, children: /* @__PURE__ */ Y("button", { type: "button", className: "chat-v2-tool-trigger", children: [
      /* @__PURE__ */ v("span", { className: "chat-v2-timeline-dot", children: tx(e.tool.name) }),
      /* @__PURE__ */ v("span", { className: "chat-v2-tool-title", children: b }),
      u.exitCode !== void 0 && /* @__PURE__ */ Y(Gc, { children: [
        "exit ",
        u.exitCode
      ] }),
      /* @__PURE__ */ v("span", { className: "chat-v2-tool-status", children: n ? "Running" : t ? "Failed" : "Completed" }),
      /* @__PURE__ */ v(ts, { size: 14, className: "chat-v2-chevron" })
    ] }) }),
    /* @__PURE__ */ Y(Wc, { className: "chat-v2-tool-content", children: [
      l.cwd && /* @__PURE__ */ v(Qt, { label: "Working directory", value: l.cwd }),
      l.command && /* @__PURE__ */ v(Qt, { label: "Command", value: l.command, code: !0 }),
      !l.command && p && /* @__PURE__ */ v(Qt, { label: "Input", value: p, code: !0 }),
      d ? /* @__PURE__ */ v(rx, { payload: d }) : h && /* @__PURE__ */ v(Qt, { label: "Output", value: a ? h : m.text, code: !0 }),
      u.stderr && /* @__PURE__ */ v(Qt, { label: "Error output", value: u.stderr, code: !0, tone: "error" }),
      e.tool.error && e.tool.error !== u.stderr && /* @__PURE__ */ v(Qt, { label: "Error", value: e.tool.error, tone: "error" }),
      /* @__PURE__ */ Y("div", { className: "chat-v2-tool-footer", children: [
        m.truncated && /* @__PURE__ */ v($e, { variant: "ghost", size: "sm", onClick: () => o((x) => !x), children: a ? "Show less" : "Show full output" }),
        g && /* @__PURE__ */ v(vn, { label: "Copy tool details", children: /* @__PURE__ */ Y($e, { variant: "ghost", size: "sm", onClick: () => {
          navigator.clipboard?.writeText(g), c(!0), window.setTimeout(() => c(!1), 1500);
        }, children: [
          s ? /* @__PURE__ */ v(es, { size: 13 }) : /* @__PURE__ */ v(vu, { size: 13 }),
          " ",
          s ? "Copied" : "Copy"
        ] }) })
      ] })
    ] })
  ] });
}
function Qt({ label: e, value: t, code: n, tone: r }) {
  return /* @__PURE__ */ Y("section", { className: `chat-v2-detail ${r === "error" ? "is-error" : ""}`, children: [
    /* @__PURE__ */ v("span", { className: "chat-v2-detail-label", children: e }),
    n ? /* @__PURE__ */ v("pre", { children: t }) : /* @__PURE__ */ v("p", { children: t })
  ] });
}
function rx({ payload: e }) {
  return /* @__PURE__ */ Y("div", { className: "chat-v2-files", children: [
    /* @__PURE__ */ Y("div", { className: "chat-v2-files-summary", children: [
      /* @__PURE__ */ Y("span", { children: [
        e.summary.filesChanged,
        " files changed"
      ] }),
      /* @__PURE__ */ Y("b", { className: "is-add", children: [
        "+",
        e.summary.additions
      ] }),
      /* @__PURE__ */ Y("b", { className: "is-del", children: [
        "-",
        e.summary.deletions
      ] })
    ] }),
    e.files.map((t) => /* @__PURE__ */ Y("details", { className: "chat-v2-file", children: [
      /* @__PURE__ */ Y("summary", { children: [
        t.path,
        /* @__PURE__ */ Y("span", { children: [
          "+",
          t.additions,
          " -",
          t.deletions
        ] })
      ] }),
      t.diffPreview?.hunks.length ? /* @__PURE__ */ v(Xy, { filename: t.path, hunks: t.diffPreview.hunks }) : /* @__PURE__ */ v("p", { children: t.unavailableReason ?? "No textual diff available." })
    ] }, t.path))
  ] });
}
function ix({ summary: e, activities: t }) {
  const n = ax(e, t), r = n === "running" || n === "error", [i, a] = rt(r), o = ar(!1);
  if (Za(() => {
    o.current || a(r);
  }, [r]), !e && t.length === 0) return null;
  const s = sx(e?.durationMs), c = n === "running" ? "Working..." : n === "error" ? `Stopped after ${s || "a moment"}` : `Worked for ${s || "a moment"}`;
  return /* @__PURE__ */ Y(
    Kc,
    {
      open: i,
      onOpenChange: (l) => {
        o.current = !0, a(l);
      },
      className: `chat-v2-execution is-${n}`,
      children: [
        /* @__PURE__ */ v(qc, { asChild: !0, children: /* @__PURE__ */ Y("button", { type: "button", className: "chat-v2-execution-trigger", children: [
          n === "running" ? /* @__PURE__ */ v(is, { size: 15, className: "is-spinning" }) : n === "error" ? /* @__PURE__ */ v(ns, { size: 15 }) : /* @__PURE__ */ v(xu, { size: 15 }),
          /* @__PURE__ */ v("span", { children: c }),
          /* @__PURE__ */ v(ts, { size: 14, className: "chat-v2-chevron" })
        ] }) }),
        /* @__PURE__ */ v(Wc, { className: "chat-v2-execution-content", children: /* @__PURE__ */ v("div", { className: "chat-v2-timeline", children: t.map((l) => l.type === "tool_execution" ? /* @__PURE__ */ v(nx, { message: l }, l.uuid) : l.type === "thinking" ? /* @__PURE__ */ v(ox, { message: l }, l.uuid) : null) }) })
      ]
    }
  );
}
function ox({ message: e }) {
  const t = e.kind === "recovery" ? /* @__PURE__ */ v(Tu, { size: 14 }) : e.kind === "verification" ? /* @__PURE__ */ v(Ou, { size: 14 }) : e.status === "error" ? /* @__PURE__ */ v(ns, { size: 14 }) : /* @__PURE__ */ v(wu, { size: 14 });
  return /* @__PURE__ */ Y("article", { className: `chat-v2-thinking is-${e.status ?? "success"}`, children: [
    /* @__PURE__ */ v("span", { className: "chat-v2-timeline-dot", children: t }),
    /* @__PURE__ */ Y("div", { className: "chat-v2-thinking-main", children: [
      /* @__PURE__ */ Y("div", { className: "chat-v2-thinking-title", children: [
        /* @__PURE__ */ v("span", { children: e.title ?? (e.kind === "step" ? "Step" : "Thinking") }),
        e.status === "running" && /* @__PURE__ */ v(is, { size: 13, className: "is-spinning" })
      ] }),
      e.text && /* @__PURE__ */ v("div", { className: "chat-v2-thinking-body", children: /* @__PURE__ */ v(wi, { remarkPlugins: [vi], rehypePlugins: [sl], children: e.text }) }),
      e.items?.map((n) => /* @__PURE__ */ Y("details", { className: "chat-v2-legacy-thinking", children: [
        /* @__PURE__ */ v("summary", { children: n.title ?? n.key }),
        n.content && /* @__PURE__ */ v(wi, { remarkPlugins: [vi], children: n.content })
      ] }, n.key))
    ] })
  ] });
}
function ax(e, t) {
  return e?.status === "running" || e?.status === "pending" ? "running" : e?.status === "error" ? "error" : t.some((n) => n.type === "tool_execution" && (n.status === "running" || n.status === "pending")) ? "running" : t.some((n) => n.type === "tool_execution" && n.status === "error") ? "error" : "success";
}
function sx(e) {
  return e == null ? "" : e < 1e3 ? `${e}ms` : e < 6e4 ? `${Math.max(1, Math.round(e / 1e3))}s` : `${Math.floor(e / 6e4)}m ${Math.round(e % 6e4 / 1e3)}s`;
}
function Va({ message: e, onRetry: t, onCopy: n, onDelete: r, disabled: i }) {
  const [a, o] = rt(!1), s = e.role === "user", c = async () => {
    n ? await n(e) : await navigator.clipboard?.writeText(ux(e)), o(!0), window.setTimeout(() => o(!1), 1500);
  };
  return /* @__PURE__ */ v("article", { className: `chat-v2-message ${s ? "is-user" : "is-assistant"}`, children: /* @__PURE__ */ Y("div", { className: "chat-v2-message-content", children: [
    /* @__PURE__ */ v(lx, { message: e }),
    /* @__PURE__ */ Y("div", { className: "chat-v2-message-actions", children: [
      !s && t && /* @__PURE__ */ v(vn, { label: "Retry", children: /* @__PURE__ */ v($e, { variant: "ghost", size: "icon", disabled: i, onClick: () => {
        t(e);
      }, "aria-label": "Retry", children: /* @__PURE__ */ v(Au, { size: 14 }) }) }),
      /* @__PURE__ */ v(vn, { label: "Copy", children: /* @__PURE__ */ v($e, { variant: "ghost", size: "icon", disabled: i, onClick: () => {
        c();
      }, "aria-label": "Copy", children: a ? /* @__PURE__ */ v(es, { size: 14 }) : /* @__PURE__ */ v(Su, { size: 14 }) }) }),
      r && /* @__PURE__ */ v(vn, { label: "Delete", children: /* @__PURE__ */ v($e, { variant: "ghost", size: "icon", disabled: i, onClick: () => {
        r(e);
      }, "aria-label": "Delete", children: /* @__PURE__ */ v(Du, { size: 14 }) }) })
    ] })
  ] }) });
}
function lx({ message: e }) {
  if (e.type === "text")
    return /* @__PURE__ */ Y(br, { children: [
      /* @__PURE__ */ v("div", { className: "chat-v2-markdown", children: /* @__PURE__ */ v(wi, { remarkPlugins: [vi], rehypePlugins: [sl], children: e.text }) }),
      e.attachments?.length ? /* @__PURE__ */ v(cx, { attachments: e.attachments }) : null
    ] });
  if (e.type === "image") {
    const t = e.source.type === "url" ? e.source.url : `data:${e.source.mediaType};base64,${e.source.data}`;
    return /* @__PURE__ */ Y("figure", { className: "chat-v2-image", children: [
      /* @__PURE__ */ v("img", { src: t, alt: e.text ?? "Attached image" }),
      e.text && /* @__PURE__ */ v("figcaption", { children: e.text })
    ] });
  }
  return null;
}
function cx({ attachments: e }) {
  return /* @__PURE__ */ v("div", { className: "chat-v2-message-files", children: e.map((t, n) => {
    const r = t.mimeType.startsWith("image/"), i = `data:${t.mimeType};base64,${t.data}`;
    return r ? /* @__PURE__ */ v("img", { src: i, alt: `Attachment ${n + 1}` }, `${t.mimeType}:${n}`) : /* @__PURE__ */ Y("a", { href: i, download: `attachment-${n + 1}`, children: [
      /* @__PURE__ */ v(rs, { size: 15 }),
      /* @__PURE__ */ v("span", { children: t.mimeType })
    ] }, `${t.mimeType}:${n}`);
  }) });
}
function ux(e) {
  return e.type === "text" ? e.text : e.type === "image" ? e.text ?? "" : "";
}
function dx({ turn: e, onRetry: t, onCopy: n, onDelete: r, disabled: i }) {
  return /* @__PURE__ */ Y("section", { className: "chat-v2-turn", "data-turn-id": e.id, children: [
    e.user && /* @__PURE__ */ v(Va, { message: e.user, onCopy: n, onDelete: r, disabled: i }),
    /* @__PURE__ */ Y("div", { className: "chat-v2-assistant-turn", children: [
      /* @__PURE__ */ v(ix, { summary: e.summary, activities: e.activities }),
      e.responses.map((a) => /* @__PURE__ */ v(Va, { message: a, onRetry: t, onCopy: n, onDelete: r, disabled: i }, a.uuid))
    ] })
  ] });
}
function fx({ messages: e, onRetryMessage: t, onCopyMessage: n, onDeleteMessage: r, messageActionDisabled: i }) {
  const a = Mi(() => Fu(e), [e]), o = ar(null), s = ar(!0), [c, l] = rt(!0), u = (d = "smooth") => {
    const p = o.current;
    p && p.scrollTo({ top: p.scrollHeight, behavior: d });
  };
  return Za(() => {
    s.current && u(e.length < 2 ? "auto" : "smooth");
  }, [e]), /* @__PURE__ */ Y("div", { className: "chat-v2-list-shell", children: [
    /* @__PURE__ */ v("div", { ref: o, className: "chat-v2-list", onScroll: (d) => {
      const p = d.currentTarget, f = p.scrollHeight - p.scrollTop - p.clientHeight < 96;
      s.current = f, l(f);
    }, children: /* @__PURE__ */ Y("div", { className: "chat-v2-list-inner", children: [
      a.length === 0 && /* @__PURE__ */ Y("div", { className: "chat-v2-empty", children: [
        /* @__PURE__ */ v("strong", { children: "Start a conversation" }),
        /* @__PURE__ */ v("span", { children: "Ask a question, explore a repository, or run a task." })
      ] }),
      a.map((d) => /* @__PURE__ */ v(dx, { turn: d, onRetry: t, onCopy: n, onDelete: r, disabled: i }, d.id))
    ] }) }),
    !c && /* @__PURE__ */ v($e, { className: "chat-v2-scroll-bottom", variant: "outline", size: "icon", onClick: () => {
      s.current = !0, l(!0), u();
    }, "aria-label": "Scroll to bottom", children: /* @__PURE__ */ v(Eu, { size: 16 }) })
  ] });
}
function Ya(e) {
  return e == null ? "--" : e >= 1e6 ? `${(e / 1e6).toFixed(1)}M` : e >= 1e3 ? `${(e / 1e3).toFixed(1)}K` : String(e);
}
function px({ status: e, onSend: t, onStop: n, selectedModel: r, modelOptions: i, onModelChange: a, reasoningEffort: o = "medium", onReasoningEffortChange: s, tokenUsage: c, suggestions: l, onSuggestionSelect: u, onFileSelect: d, onCompactContext: p, compactContextDisabled: f, compactContextLabel: h = "Compact", placeholder: m = "Ask anything" }) {
  const [b, g] = rt(""), [x, _] = rt([]), C = ar(null), T = e !== "idle", k = () => {
    const O = b.trim();
    !O || T || (t(O, x.length ? x : void 0), g(""), _([]));
  }, I = (O) => {
    O.key === "Enter" && !O.shiftKey && !O.nativeEvent.isComposing && (O.preventDefault(), k());
  }, A = async (O) => {
    if (!O.target.files?.length || !d) return;
    const S = await d(Array.from(O.target.files));
    _((L) => [...L, ...S]), O.target.value = "";
  };
  return /* @__PURE__ */ v("div", { className: "chat-v2-composer-shell", children: /* @__PURE__ */ Y("div", { className: "chat-v2-composer", children: [
    l?.length ? /* @__PURE__ */ v("div", { className: "chat-v2-suggestions", children: l.map((O, S) => /* @__PURE__ */ v($e, { variant: "outline", size: "sm", disabled: T, title: O.description ?? O.prompt, onClick: () => {
      u?.(O), O.behavior === "fill" ? g(O.prompt) : t(O.prompt);
    }, children: O.label }, O.id ?? S)) }) : null,
    x.length ? /* @__PURE__ */ v("div", { className: "chat-v2-attachments", children: x.map((O) => /* @__PURE__ */ Y("div", { className: "chat-v2-attachment", children: [
      O.previewUrl ? /* @__PURE__ */ v("img", { src: O.previewUrl, alt: "" }) : /* @__PURE__ */ v(rs, { size: 16 }),
      /* @__PURE__ */ v("span", { children: O.name }),
      /* @__PURE__ */ v($e, { variant: "ghost", size: "icon", onClick: () => _((S) => S.filter((L) => L.id !== O.id)), "aria-label": `Remove ${O.name}`, children: /* @__PURE__ */ v(Pu, { size: 13 }) })
    ] }, O.id)) }) : null,
    /* @__PURE__ */ v(bo, { rows: 2, value: b, onChange: (O) => g(O.target.value), onKeyDown: I, disabled: e === "connecting", placeholder: e === "connecting" ? "Connecting…" : m }),
    /* @__PURE__ */ Y("div", { className: "chat-v2-composer-toolbar", children: [
      /* @__PURE__ */ Y("div", { className: "chat-v2-composer-left", children: [
        d && /* @__PURE__ */ Y(br, { children: [
          /* @__PURE__ */ v(vn, { label: "Attach files", children: /* @__PURE__ */ v($e, { variant: "ghost", size: "icon", disabled: T, onClick: () => C.current?.click(), "aria-label": "Attach files", children: /* @__PURE__ */ v(Cu, { size: 16 }) }) }),
          /* @__PURE__ */ v("input", { ref: C, className: "chat-v2-file-input", type: "file", multiple: !0, onChange: A })
        ] }),
        i?.length ? /* @__PURE__ */ v("select", { className: "chat-v2-native-select", value: r ?? i[0]?.value, disabled: T, onChange: (O) => a?.(O.target.value), "aria-label": "Model", children: i.map((O) => /* @__PURE__ */ v("option", { value: O.value, children: O.label }, O.value)) }) : null,
        /* @__PURE__ */ Y("select", { className: "chat-v2-native-select", value: o, disabled: T, onChange: (O) => s?.(O.target.value), "aria-label": "Reasoning effort", children: [
          /* @__PURE__ */ v("option", { value: "low", children: "Low" }),
          /* @__PURE__ */ v("option", { value: "medium", children: "Medium" }),
          /* @__PURE__ */ v("option", { value: "high", children: "High" })
        ] })
      ] }),
      /* @__PURE__ */ Y("div", { className: "chat-v2-composer-right", children: [
        p && /* @__PURE__ */ v($e, { variant: "ghost", size: "sm", disabled: f ?? T, onClick: () => {
          p();
        }, children: h }),
        c && /* @__PURE__ */ Y("span", { className: "chat-v2-token-usage", children: [
          Ya(c.usedTokens),
          " / ",
          Ya(c.tokenBudget)
        ] }),
        e === "streaming" ? /* @__PURE__ */ v($e, { size: "icon", variant: "default", disabled: !n, onClick: n, "aria-label": "Stop generating", children: /* @__PURE__ */ v(Iu, { size: 13, fill: "currentColor" }) }) : /* @__PURE__ */ v($e, { size: "icon", variant: "default", disabled: !b.trim() || T, onClick: k, "aria-label": "Send message", children: /* @__PURE__ */ v(_u, { size: 18 }) })
      ] })
    ] })
  ] }) });
}
function _x({ messages: e, status: t = "idle", composer: n = {}, actions: r, actionPrompt: i, theme: a = "light", className: o }) {
  return /* @__PURE__ */ Y("div", { className: ln("chat-v2-root", o), "data-theme": a, children: [
    /* @__PURE__ */ v(fx, { messages: e, onRetryMessage: r.onRetryMessage, onCopyMessage: r.onCopyMessage, onDeleteMessage: r.onDeleteMessage, messageActionDisabled: r.messageActionDisabled }),
    i,
    /* @__PURE__ */ v(px, { ...n, status: t, onSend: r.onSend, onStop: r.onStop })
  ] });
}
function hx(e, t) {
  const n = e.find((i) => i.id === t && !i.disabled);
  if (n) return n.id;
  const r = e.find((i) => i.recommended && !i.disabled);
  return r ? r.id : e.find((i) => !i.disabled)?.id ?? e[0]?.id ?? "";
}
function gx(e) {
  return Object.fromEntries(
    e.map((t) => [
      t.id,
      Object.fromEntries(
        (t.toggles ?? []).map((n) => [n.id, n.defaultSelected ?? !0])
      )
    ])
  );
}
function mx(e) {
  return Object.fromEntries(
    e.map((t) => [t.id, t.customInput?.defaultValue ?? ""])
  );
}
function wx({
  title: e = "Input required",
  question: t,
  options: n,
  defaultOptionId: r,
  submitLabel: i = "Submit answer",
  cancelLabel: a = "Cancel",
  disabled: o,
  className: s,
  onSubmit: c,
  onCancel: l
}) {
  const u = Mi(
    () => hx(n, r),
    [r, n]
  ), [d, p] = rt(u), [f, h] = rt(() => gx(n)), [m, b] = rt(() => mx(n)), g = n.find((A) => A.id === d) ?? n[0], x = Object.entries(f[g?.id ?? ""] ?? {}).filter(([, A]) => A).map(([A]) => A), _ = m[g?.id ?? ""] ?? "", C = !!(g?.customInput?.required && _.trim().length === 0), T = !!(o || !g || g.disabled || C), k = (A, O, S) => {
    o || O.disabled || h((L) => ({
      ...L,
      [A]: {
        ...L[A] ?? {},
        [O.id]: S
      }
    }));
  }, I = () => {
    T || !g || c({
      optionId: g.id,
      selectedToggleIds: x,
      customInput: _.trim()
    });
  };
  return /* @__PURE__ */ Y("section", { className: `chat-ui-action-prompt ${s ?? ""}`, "aria-label": e, children: [
    /* @__PURE__ */ Y("header", { className: "chat-ui-action-prompt-header", children: [
      /* @__PURE__ */ v(ku, { className: "chat-ui-action-prompt-icon", "aria-hidden": "true" }),
      /* @__PURE__ */ v("span", { children: e })
    ] }),
    /* @__PURE__ */ Y("div", { className: "chat-ui-action-prompt-body", children: [
      /* @__PURE__ */ v("p", { className: "chat-ui-action-prompt-question", children: t }),
      /* @__PURE__ */ v(
        Yw,
        {
          className: "chat-ui-action-prompt-options",
          "aria-label": t,
          value: d,
          onValueChange: p,
          disabled: o,
          children: n.map((A) => {
            const O = d === A.id;
            return /* @__PURE__ */ Y(
              "article",
              {
                className: `chat-ui-action-option${O ? " is-selected" : ""}${A.disabled ? " is-disabled" : ""}`,
                children: [
                  /* @__PURE__ */ Y(
                    "label",
                    {
                      className: "chat-ui-action-option-main",
                      children: [
                        /* @__PURE__ */ v(Vc, { value: A.id, disabled: A.disabled, "aria-label": A.title }),
                        /* @__PURE__ */ Y("span", { className: "chat-ui-action-option-copy", children: [
                          /* @__PURE__ */ v("span", { className: "chat-ui-action-option-title", children: A.title }),
                          A.description && /* @__PURE__ */ v("span", { className: "chat-ui-action-option-description", children: A.description })
                        ] }),
                        A.recommended && /* @__PURE__ */ v(Gc, { className: "chat-ui-action-option-badge", children: "Recommended" })
                      ]
                    }
                  ),
                  O && A.toggles && A.toggles.length > 0 && /* @__PURE__ */ Y("div", { className: "chat-ui-action-toggle-group", children: [
                    A.toggleGroupLabel && /* @__PURE__ */ v("div", { className: "chat-ui-action-toggle-title", children: A.toggleGroupLabel }),
                    A.toggles.map((S) => {
                      const L = f[A.id]?.[S.id] ?? S.defaultSelected ?? !0;
                      return /* @__PURE__ */ Y("label", { className: "chat-ui-action-toggle", children: [
                        /* @__PURE__ */ v(
                          Yc,
                          {
                            checked: L,
                            disabled: o || S.disabled,
                            onCheckedChange: (B) => k(A.id, S, B),
                            "aria-label": S.label
                          }
                        ),
                        /* @__PURE__ */ Y("span", { className: "chat-ui-action-toggle-copy", children: [
                          /* @__PURE__ */ v("span", { className: "chat-ui-action-toggle-label", children: S.label }),
                          S.description && /* @__PURE__ */ v("span", { className: "chat-ui-action-toggle-description", children: S.description })
                        ] })
                      ] }, S.id);
                    })
                  ] }),
                  O && A.customInput && /* @__PURE__ */ Y("label", { className: "chat-ui-action-custom-input", children: [
                    A.customInput.label && /* @__PURE__ */ v("span", { className: "chat-ui-action-custom-label", children: A.customInput.label }),
                    /* @__PURE__ */ v(
                      bo,
                      {
                        className: "chat-ui-action-custom-textarea",
                        rows: A.customInput.minRows ?? 4,
                        placeholder: A.customInput.placeholder,
                        disabled: o || A.disabled,
                        value: m[A.id] ?? "",
                        onChange: (S) => {
                          b((L) => ({
                            ...L,
                            [A.id]: S.target.value
                          }));
                        }
                      }
                    )
                  ] })
                ]
              },
              A.id
            );
          })
        }
      )
    ] }),
    /* @__PURE__ */ Y("footer", { className: "chat-ui-action-prompt-footer", children: [
      l && /* @__PURE__ */ v(
        $e,
        {
          type: "button",
          variant: "ghost",
          size: "sm",
          className: "chat-ui-action-prompt-cancel",
          disabled: o,
          onClick: () => {
            l();
          },
          children: a
        }
      ),
      /* @__PURE__ */ v(
        $e,
        {
          type: "button",
          size: "sm",
          className: "chat-ui-action-prompt-submit",
          disabled: T,
          onClick: I,
          children: i
        }
      )
    ] })
  ] });
}
export {
  wx as ActionPrompt,
  _x as ChatPanel
};
