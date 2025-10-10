import { useEffect, useRef } from "react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Props { 
  html: string; 
}

export default function RichRendererPro({ html }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const images = containerRef.current.querySelectorAll("img");
    images.forEach((img) => {
      img.loading = "lazy";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.borderRadius = "8px";
      img.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1)";
    });

    const carouselContainers = containerRef.current.querySelectorAll<HTMLDivElement>("[data-gallery='carousel']");
    carouselContainers.forEach((container) => {
      if (container.querySelector(".swiper")) return; // Already enhanced
      
      const images = container.querySelectorAll("img");
      if (images.length === 0) return;

      const swiperWrapper = document.createElement("div");
      swiperWrapper.className = "swiper";
      swiperWrapper.style.width = "100%";
      swiperWrapper.style.height = "400px";

      const swiperContainer = document.createElement("div");
      swiperContainer.className = "swiper-wrapper";

      images.forEach((img) => {
        const slide = document.createElement("div");
        slide.className = "swiper-slide";
        slide.style.display = "flex";
        slide.style.alignItems = "center";
        slide.style.justifyContent = "center";
        slide.style.background = "#f8f9fa";
        slide.style.borderRadius = "8px";
        slide.style.overflow = "hidden";
        
        const imgClone = img.cloneNode(true) as HTMLImageElement;
        imgClone.style.width = "100%";
        imgClone.style.height = "100%";
        imgClone.style.objectFit = "cover";
        
        slide.appendChild(imgClone);
        swiperContainer.appendChild(slide);
      });

      swiperWrapper.appendChild(swiperContainer);

      const prevBtn = document.createElement("div");
      prevBtn.className = "swiper-button-prev";
      prevBtn.style.color = "#374151";
      
      const nextBtn = document.createElement("div");
      nextBtn.className = "swiper-button-next";
      nextBtn.style.color = "#374151";

      const pagination = document.createElement("div");
      pagination.className = "swiper-pagination";
      pagination.style.position = "relative";
      pagination.style.marginTop = "16px";

      swiperWrapper.appendChild(prevBtn);
      swiperWrapper.appendChild(nextBtn);
      swiperWrapper.appendChild(pagination);

      container.parentNode?.replaceChild(swiperWrapper, container);

      import("swiper").then(({ Swiper: SwiperClass }) => {
        new SwiperClass(swiperWrapper, {
          modules: [Navigation, Pagination, Autoplay],
          navigation: {
            nextEl: nextBtn,
            prevEl: prevBtn,
          },
          pagination: {
            el: pagination,
            clickable: true,
          },
          autoplay: {
            delay: 5000,
            disableOnInteraction: false,
          },
          loop: images.length > 1,
          spaceBetween: 20,
          slidesPerView: 1,
          breakpoints: {
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          },
        });
      });
    });

    const gridContainers = containerRef.current.querySelectorAll<HTMLDivElement>("[data-gallery='grid']");
    gridContainers.forEach((container) => {
      container.style.display = "grid";
      container.style.gridTemplateColumns = "repeat(auto-fit, minmax(200px, 1fr))";
      container.style.gap = "16px";
      container.style.margin = "16px 0";
      
      const images = container.querySelectorAll("img");
      images.forEach((img) => {
        img.style.width = "100%";
        img.style.height = "200px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";
        img.style.boxShadow = "0 2px 4px -1px rgb(0 0 0 / 0.1)";
      });
    });

    const notionTables = containerRef.current.querySelectorAll<HTMLDivElement>(".notion-table-block");
    notionTables.forEach((tableBlock) => {
      const menu = tableBlock.querySelector(".notion-table-menu");
      if (menu) menu.remove();
      
      const cells = tableBlock.querySelectorAll<HTMLElement>(".notion-cell");
      cells.forEach((cell) => {
        cell.removeAttribute("contenteditable");
        cell.style.cursor = "default";
      });
    });

  }, [html]);

  return (
    <>
      <style>{`
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: white !important;
        }
        .prose strong, .prose b {
          color: white !important;
        }
        .prose p {
          color: #d1d5db !important;
        }
        .prose ul, .prose ol, .prose li {
          color: #d1d5db !important;
        }
        .prose code {
          color: #d1d5db !important;
          background-color: #334155 !important;
        }
        .prose pre {
          background-color: #1e293b !important;
          color: #f1f5f9 !important;
        }
        .prose blockquote {
          color: #d1d5db !important;
          background-color: rgba(30, 41, 59, 0.5) !important;
          border-left-color: #22d3ee !important;
        }
        .prose table {
          border-color: #475569 !important;
        }
        .prose th {
          background-color: #334155 !important;
          color: white !important;
        }
        .prose td {
          border-color: #475569 !important;
          color: #d1d5db !important;
        }
        .prose a {
          color: #22d3ee !important;
        }
        .prose a:hover {
          text-decoration: underline !important;
        }
      `}</style>
      <div 
        ref={containerRef}
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}