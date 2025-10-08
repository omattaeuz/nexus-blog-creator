import { useEffect } from "react";

interface Props { html: string; }

export default function RichRenderer({ html }: Props) {
  useEffect(() => {
    // Enhance galleries marked as carousel with basic controls (no dependency)
    const containers = document.querySelectorAll<HTMLDivElement>("[data-gallery='carousel']");
    containers.forEach((c) => {
      if (c.querySelector("button[data-rr-nav]")) return;
      c.style.scrollSnapType = "x mandatory";
      const prev = document.createElement("button");
      prev.textContent = "‹";
      prev.setAttribute("data-rr-nav", "prev");
      const next = document.createElement("button");
      next.textContent = "›";
      next.setAttribute("data-rr-nav", "next");
      [prev, next].forEach(b => {
        b.style.position = "absolute";
        b.style.top = "50%";
        b.style.transform = "translateY(-50%)";
        b.style.background = "rgba(0,0,0,0.4)";
        b.style.color = "#fff";
        b.style.border = "none";
        b.style.padding = "6px 10px";
        b.style.cursor = "pointer";
        b.style.zIndex = "5";
      });
      prev.style.left = "6px"; next.style.right = "6px";
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      c.parentElement?.insertBefore(wrapper, c);
      wrapper.appendChild(c);
      wrapper.appendChild(prev); wrapper.appendChild(next);
      prev.addEventListener("click", () => c.scrollBy({ left: -c.clientWidth, behavior: "smooth" }));
      next.addEventListener("click", () => c.scrollBy({ left: c.clientWidth, behavior: "smooth" }));
    });
  }, [html]);

  return (
    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
  );
}


