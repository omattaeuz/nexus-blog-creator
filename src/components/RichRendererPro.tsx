import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
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

    // Enhance images with lazy loading and responsive behavior
    const images = containerRef.current.querySelectorAll("img");
    images.forEach((img) => {
      img.loading = "lazy";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.borderRadius = "8px";
      img.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1)";
    });

    // Enhance galleries marked as carousel with Swiper
    const carouselContainers = containerRef.current.querySelectorAll<HTMLDivElement>("[data-gallery='carousel']");
    carouselContainers.forEach((container) => {
      if (container.querySelector(".swiper")) return; // Already enhanced
      
      const images = container.querySelectorAll("img");
      if (images.length === 0) return;

      // Create Swiper wrapper
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

      // Add navigation
      const prevBtn = document.createElement("div");
      prevBtn.className = "swiper-button-prev";
      prevBtn.style.color = "#374151";
      
      const nextBtn = document.createElement("div");
      nextBtn.className = "swiper-button-next";
      nextBtn.style.color = "#374151";

      // Add pagination
      const pagination = document.createElement("div");
      pagination.className = "swiper-pagination";
      pagination.style.position = "relative";
      pagination.style.marginTop = "16px";

      swiperWrapper.appendChild(prevBtn);
      swiperWrapper.appendChild(nextBtn);
      swiperWrapper.appendChild(pagination);

      // Replace original container
      container.parentNode?.replaceChild(swiperWrapper, container);

      // Initialize Swiper
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

    // Enhance grid galleries
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

    // Enhance Notion-style tables
    const notionTables = containerRef.current.querySelectorAll<HTMLDivElement>(".notion-table-block");
    notionTables.forEach((tableBlock) => {
      // Remove the menu controls for read-only view
      const menu = tableBlock.querySelector(".notion-table-menu");
      if (menu) {
        menu.remove();
      }
      
      // Make cells non-editable in read-only view
      const cells = tableBlock.querySelectorAll(".notion-cell");
      cells.forEach((cell) => {
        cell.removeAttribute("contenteditable");
        cell.style.cursor = "default";
      });
    });

  }, [html]);

  return (
    <div 
      ref={containerRef}
      className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-800 prose-p:leading-relaxed prose-p:text-base prose-strong:text-gray-900 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:text-gray-700 prose-table:border prose-table:border-gray-300 prose-th:bg-gray-100 prose-th:font-semibold prose-th:text-gray-900 prose-td:border prose-td:border-gray-300 prose-td:text-gray-800 prose-img:rounded-lg prose-img:shadow-lg prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-ul:text-gray-800 prose-ol:text-gray-800 prose-li:text-gray-800"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
