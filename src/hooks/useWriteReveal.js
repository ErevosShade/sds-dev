import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * useWriteReveal
 * A word-by-word "writing" reveal for headings — each word rises + fades in on
 * a stagger as the heading scrolls into view, so the title reads like it's
 * being written in rather than just appearing.
 *
 * Splits only text nodes into <span> words and recurses into inline children
 * (e.g. <em>), leaving elements like <br/> untouched — safe for headings with
 * nested markup. Restores the original markup on cleanup (and StrictMode
 * re-mounts), so it never compounds.
 *
 * @param {object} options - GSAP fromVars / scrollTrigger override
 * @returns ref to attach to the heading element
 */
export const useWriteReveal = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const original = el.innerHTML;
    const words = [];

    const split = (parent) => {
      Array.from(parent.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const parts = node.textContent.split(/(\s+)/); // keep whitespace tokens
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (part === "" ) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const span = document.createElement("span");
            span.textContent = part;
            span.style.display = "inline-block";
            span.style.willChange = "transform, opacity";
            words.push(span);
            frag.appendChild(span);
          });
          parent.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "BR") {
          split(node); // recurse into <em>, <span>, etc.
        }
      });
    };
    split(el);
    if (words.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from(words, {
        opacity: 0,
        y: reduce ? 0 : "0.45em",
        duration: reduce ? 0.2 : 0.6,
        ease: "power3.out",
        stagger: reduce ? 0 : 0.045,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
          ...options.scrollTrigger,
        },
        ...options,
      });
    }, el);

    return () => { ctx.revert(); el.innerHTML = original; };
  }, []);

  return ref;
};
