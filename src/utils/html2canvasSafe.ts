import html2canvas, { Options } from 'html2canvas';

// Helper: Convert oklab to standard sRGB [0..255, 0..255, 0..255]
function oklabToSrgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  let r = +4.0767439362 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let b_out = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const gamma = (c: number) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(0, c), 1 / 2.4) - 0.055;

  r = Math.min(255, Math.max(0, Math.round(gamma(r) * 255)));
  g = Math.min(255, Math.max(0, Math.round(gamma(g) * 255)));
  b_out = Math.min(255, Math.max(0, Math.round(gamma(b_out) * 255)));

  return [r, g, b_out];
}

// Helper: Convert CIE Lab to sRGB [0..255, 0..255, 0..255]
function labToSrgb(L: number, a: number, b: number): [number, number, number] {
  let y = (L + 16) / 116;
  let x = a / 500 + y;
  let z = y - b / 200;

  const fn = (t: number) => (t > 0.2068965517 ? t * t * t : (t - 16 / 116) / 7.787);
  x = 0.95047 * fn(x);
  y = 1.0 * fn(y);
  z = 1.08883 * fn(z);

  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let b_out = x * 0.0557 + y * -0.204 + z * 1.057;

  const gamma = (c: number) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(0, c), 1 / 2.4) - 0.055;

  r = Math.min(255, Math.max(0, Math.round(gamma(r) * 255)));
  g = Math.min(255, Math.max(0, Math.round(gamma(g) * 255)));
  b_out = Math.min(255, Math.max(0, Math.round(gamma(b_out) * 255)));

  return [r, g, b_out];
}

// Helper: Convert Display P3 to sRGB
function displayP3ToSrgb(rP3: number, gP3: number, bP3: number): [number, number, number] {
  // Convert P3 gamma to linear
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = toLinear(rP3);
  const lg = toLinear(gP3);
  const lb = toLinear(bP3);

  // P3 linear to sRGB linear
  const rLin = 1.2249 * lr - 0.2247 * lg + 0.0000 * lb;
  const gLin = -0.0420 * lr + 1.0419 * lg + 0.0000 * lb;
  const bLin = -0.0197 * lr - 0.0786 * lg + 1.0979 * lb;

  // Gamma sRGB
  const toGamma = (c: number) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(0, c), 1 / 2.4) - 0.055;

  const r = Math.min(255, Math.max(0, Math.round(toGamma(rLin) * 255)));
  const g = Math.min(255, Math.max(0, Math.round(toGamma(gLin) * 255)));
  const b = Math.min(255, Math.max(0, Math.round(toGamma(bLin) * 255)));

  return [r, g, b];
}

/**
 * Converts any CSS color strings containing oklab, oklch, lab, lch, color(...), light-dark, color-mix
 * to standard rgb(...) / rgba(...) / #hex so html2canvas never crashes.
 */
export function modernColorToRgb(str: string): string {
  if (!str || typeof str !== 'string') {
    return str;
  }

  // Fast path: does this string contain any modern color syntax?
  if (!/(?:oklab|oklch|lab|lch|color|light-dark|color-mix)\s*\(/i.test(str)) {
    return str;
  }

  let result = str;

  // 1. Replace light-dark(val1, val2) -> val1
  result = result.replace(/light-dark\s*\(\s*([^,]+)\s*,\s*[^)]+\s*\)/gi, '$1');

  // 2. Replace oklab(L a b [/ alpha]) or oklab(L, a, b, alpha)
  result = result.replace(/oklab\s*\(\s*([^)]+)\s*\)/gi, (_fullMatch, inner) => {
    try {
      const parts = inner.trim().split(/[\s/,]+/).filter(Boolean);
      if (parts.length >= 3) {
        let L = parseFloat(parts[0]);
        if (parts[0].endsWith('%')) L /= 100;

        let a = parseFloat(parts[1]);
        if (parts[1].endsWith('%')) a = (parseFloat(parts[1]) / 100) * 0.4;

        let b = parseFloat(parts[2]);
        if (parts[2].endsWith('%')) b = (parseFloat(parts[2]) / 100) * 0.4;

        let alpha = 1;
        if (parts[3] !== undefined) {
          alpha = parseFloat(parts[3]);
          if (parts[3].endsWith('%')) alpha /= 100;
        }

        const [r, g, b_out] = oklabToSrgb(L, a, b);
        if (alpha < 1) {
          return `rgba(${r}, ${g}, ${b_out}, ${alpha})`;
        }
        return `rgb(${r}, ${g}, ${b_out})`;
      }
    } catch {
      // fallback
    }
    return '#333333';
  });

  // 3. Replace oklch(L C H [/ alpha]) or oklch(L, C, H, alpha)
  result = result.replace(/oklch\s*\(\s*([^)]+)\s*\)/gi, (_fullMatch, inner) => {
    try {
      const parts = inner.trim().split(/[\s/,]+/).filter(Boolean);
      if (parts.length >= 3) {
        let L = parseFloat(parts[0]);
        if (parts[0].endsWith('%')) L /= 100;

        let C = parseFloat(parts[1]);
        if (parts[1].endsWith('%')) C = (parseFloat(parts[1]) / 100) * 0.4;

        let H = 0;
        if (parts[2].includes('deg')) {
          H = parseFloat(parts[2]);
        } else if (parts[2].includes('rad')) {
          H = (parseFloat(parts[2]) * 180) / Math.PI;
        } else if (parts[2].includes('turn')) {
          H = parseFloat(parts[2]) * 360;
        } else {
          H = parseFloat(parts[2]) || 0;
        }

        let alpha = 1;
        if (parts[3] !== undefined) {
          alpha = parseFloat(parts[3]);
          if (parts[3].endsWith('%')) alpha /= 100;
        }

        const hRad = (H * Math.PI) / 180;
        const a = C * Math.cos(hRad);
        const b = C * Math.sin(hRad);
        const [r, g, b_out] = oklabToSrgb(L, a, b);

        if (alpha < 1) {
          return `rgba(${r}, ${g}, ${b_out}, ${alpha})`;
        }
        return `rgb(${r}, ${g}, ${b_out})`;
      }
    } catch {
      // fallback
    }
    return '#333333';
  });

  // 4. Replace lab(L a b [/ alpha])
  result = result.replace(/lab\s*\(\s*([^)]+)\s*\)/gi, (_fullMatch, inner) => {
    try {
      const parts = inner.trim().split(/[\s/,]+/).filter(Boolean);
      if (parts.length >= 3) {
        let L = parseFloat(parts[0]);
        if (parts[0].endsWith('%')) L = (parseFloat(parts[0]) / 100) * 100;
        const a = parseFloat(parts[1]);
        const b = parseFloat(parts[2]);
        let alpha = 1;
        if (parts[3] !== undefined) {
          alpha = parseFloat(parts[3]);
          if (parts[3].endsWith('%')) alpha /= 100;
        }
        const [r, g, b_out] = labToSrgb(L, a, b);
        if (alpha < 1) {
          return `rgba(${r}, ${g}, ${b_out}, ${alpha})`;
        }
        return `rgb(${r}, ${g}, ${b_out})`;
      }
    } catch {
      // fallback
    }
    return '#333333';
  });

  // 5. Replace lch(L C H [/ alpha])
  result = result.replace(/lch\s*\(\s*([^)]+)\s*\)/gi, (_fullMatch, inner) => {
    try {
      const parts = inner.trim().split(/[\s/,]+/).filter(Boolean);
      if (parts.length >= 3) {
        let L = parseFloat(parts[0]);
        if (parts[0].endsWith('%')) L = (parseFloat(parts[0]) / 100) * 100;
        const C = parseFloat(parts[1]);
        let H = 0;
        if (parts[2].includes('deg')) H = parseFloat(parts[2]);
        else if (parts[2].includes('rad')) H = (parseFloat(parts[2]) * 180) / Math.PI;
        else if (parts[2].includes('turn')) H = parseFloat(parts[2]) * 360;
        else H = parseFloat(parts[2]) || 0;

        let alpha = 1;
        if (parts[3] !== undefined) {
          alpha = parseFloat(parts[3]);
          if (parts[3].endsWith('%')) alpha /= 100;
        }

        const hRad = (H * Math.PI) / 180;
        const a = C * Math.cos(hRad);
        const b = C * Math.sin(hRad);
        const [r, g, b_out] = labToSrgb(L, a, b);
        if (alpha < 1) {
          return `rgba(${r}, ${g}, ${b_out}, ${alpha})`;
        }
        return `rgb(${r}, ${g}, ${b_out})`;
      }
    } catch {
      // fallback
    }
    return '#333333';
  });

  // 6. Replace color(space r g b [/ alpha])
  result = result.replace(/color\s*\(\s*([^)]+)\s*\)/gi, (_fullMatch, inner) => {
    try {
      const parts = inner.trim().split(/[\s/,]+/).filter(Boolean);
      if (parts.length >= 4) {
        const space = parts[0].toLowerCase();
        let rVal = parseFloat(parts[1]);
        if (parts[1].endsWith('%')) rVal /= 100;

        let gVal = parseFloat(parts[2]);
        if (parts[2].endsWith('%')) gVal /= 100;

        let bVal = parseFloat(parts[3]);
        if (parts[3].endsWith('%')) bVal /= 100;

        let alpha = 1;
        if (parts[4] !== undefined) {
          alpha = parseFloat(parts[4]);
          if (parts[4].endsWith('%')) alpha /= 100;
        }

        if (space === 'display-p3') {
          const [r, g, b] = displayP3ToSrgb(rVal, gVal, bVal);
          if (alpha < 1) return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          return `rgb(${r}, ${g}, ${b})`;
        }

        // Standard srgb / other
        const r = Math.min(255, Math.max(0, Math.round(rVal * 255)));
        const g = Math.min(255, Math.max(0, Math.round(gVal * 255)));
        const b = Math.min(255, Math.max(0, Math.round(bVal * 255)));
        if (alpha < 1) return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        return `rgb(${r}, ${g}, ${b})`;
      }
    } catch {
      // fallback
    }
    return '#333333';
  });

  // 7. Replace any remaining color-mix(...)
  result = result.replace(/color-mix\s*\(\s*([^)]+)\s*\)/gi, () => {
    return 'rgba(0, 0, 0, 0.1)';
  });

  return result;
}

// Alias for backwards compatibility
export const oklchToRgb = modernColorToRgb;

/**
 * Creates a proxied CSSStyleDeclaration that returns modernColorToRgb on any color property.
 */
function createProxiedDeclaration(origDecl: CSSStyleDeclaration): CSSStyleDeclaration {
  return new Proxy(origDecl, {
    get(target, prop) {
      if (prop === 'getPropertyValue') {
        return (propertyName: string) => {
          const val = target.getPropertyValue(propertyName);
          if (typeof val === 'string' && /(?:oklab|oklch|lab|lch|color|light-dark|color-mix)\s*\(/i.test(val)) {
            return modernColorToRgb(val);
          }
          return val;
        };
      }
      if (prop === 'item') {
        return (idx: number) => target.item(idx);
      }
      if (prop === 'cssText') {
        return modernColorToRgb(target.cssText);
      }
      const rawVal = (target as any)[prop];
      if (typeof rawVal === 'function') {
        return rawVal.bind(target);
      }
      if (typeof rawVal === 'string') {
        if (/(?:oklab|oklch|lab|lch|color|light-dark|color-mix)\s*\(/i.test(rawVal)) {
          return modernColorToRgb(rawVal);
        }
        return rawVal;
      }
      if (typeof prop === 'string') {
        const kebab = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        const valFromKebab = target.getPropertyValue(kebab);
        if (typeof valFromKebab === 'string' && valFromKebab) {
          return modernColorToRgb(valFromKebab);
        }
      }
      return rawVal;
    },
  });
}

/**
 * Patches window.getComputedStyle to always wrap returned CSSStyleDeclaration with color sanitizer.
 */
function patchWindowGetComputedStyle(win: Window) {
  const originalGetComputedStyle = win.getComputedStyle;
  if (!originalGetComputedStyle) return () => {};

  win.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
    const origDecl = originalGetComputedStyle.call(win, elt, pseudoElt);
    return createProxiedDeclaration(origDecl);
  };

  return () => {
    win.getComputedStyle = originalGetComputedStyle;
  };
}

/**
 * Sanitizes a cloned Document for html2canvas to ensure no modern colors crash the parser.
 */
export function sanitizeClonedDocForHtml2Canvas(clonedDoc: Document) {
  try {
    // 1. Sanitize all <style> tags in cloned document
    const styleTags = clonedDoc.querySelectorAll('style');
    styleTags.forEach((styleTag) => {
      if (styleTag.textContent && /(?:oklab|oklch|lab|lch|color|light-dark|color-mix)\s*\(/i.test(styleTag.textContent)) {
        styleTag.textContent = modernColorToRgb(styleTag.textContent);
      }
    });

    // 2. Sanitize <link rel="stylesheet"> rules if accessible
    const linkTags = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
    linkTags.forEach((linkTag) => {
      try {
        const sheet = (linkTag as HTMLLinkElement).sheet;
        if (sheet && sheet.cssRules) {
          let cssText = '';
          for (let i = 0; i < sheet.cssRules.length; i++) {
            cssText += sheet.cssRules[i].cssText + '\n';
          }
          const inlineStyle = clonedDoc.createElement('style');
          inlineStyle.textContent = modernColorToRgb(cssText);
          linkTag.parentNode?.replaceChild(inlineStyle, linkTag);
        }
      } catch {
        // Cross-origin link sheets cannot be accessed, which is safe to ignore
      }
    });

    // 3. Sanitize all elements' inline style attributes and SVG attributes
    const allElements = clonedDoc.querySelectorAll('*');
    allElements.forEach((node) => {
      const el = node as HTMLElement;
      if (el.style) {
        for (let i = 0; i < el.style.length; i++) {
          const prop = el.style[i];
          const val = el.style.getPropertyValue(prop);
          if (val && /(?:oklab|oklch|lab|lch|color|light-dark|color-mix)\s*\(/i.test(val)) {
            el.style.setProperty(prop, modernColorToRgb(val));
          }
        }
      }

      ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color'].forEach((attr) => {
        const attrVal = el.getAttribute(attr);
        if (attrVal && /(?:oklab|oklch|lab|lch|color|light-dark|color-mix)\s*\(/i.test(attrVal)) {
          el.setAttribute(attr, modernColorToRgb(attrVal));
        }
      });
    });

    // 4. Patch getComputedStyle in the cloned iframe window
    const win = clonedDoc.defaultView || (typeof window !== 'undefined' ? window : null);
    if (win) {
      patchWindowGetComputedStyle(win);
    }
  } catch (err) {
    console.warn('Could not sanitize cloned doc:', err);
  }
}

/**
 * html2canvas wrapper that automatically adds modern color sanitization.
 * Patches global window.getComputedStyle and the cloned iframe during execution.
 */
export async function safeHtml2Canvas(
  element: HTMLElement,
  options?: Partial<Options>
): Promise<HTMLCanvasElement> {
  // 1. Temporarily patch main window getComputedStyle during html2canvas run
  let restoreMainWindow: (() => void) | null = null;
  if (typeof window !== 'undefined') {
    restoreMainWindow = patchWindowGetComputedStyle(window);
  }

  const userOnClone = options?.onclone;
  const mergedOptions: Partial<Options> = {
    ...options,
    onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
      sanitizeClonedDocForHtml2Canvas(clonedDoc);
      if (userOnClone) {
        userOnClone(clonedDoc, clonedElement);
      }
    },
  };

  try {
    return await html2canvas(element, mergedOptions);
  } finally {
    if (restoreMainWindow) {
      restoreMainWindow();
    }
  }
}
