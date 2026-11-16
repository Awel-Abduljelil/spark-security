import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import "./MentorCarousel.css";

export interface MentorProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  achievements: string[];
  photo?: string;
  links: { label: string; url: string }[];
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function MentorCarousel({ mentors }: { mentors: MentorProfile[] }) {
  const { t } = useLanguage();
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const dragRef = useRef<{ pointerId: number; x: number; scrollLeft: number } | null>(null);
  const draggedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);

  const measureSlides = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const slides = slideRefs.current.slice(0, mentors.length);
    const centers = slides.map((slide) => {
      if (!slide) return null;
      const rect = slide.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
    const gaps = centers.slice(1).flatMap((center, index) => {
      const previous = centers[index];
      return center != null && previous != null ? [center - previous] : [];
    });
    const step = gaps.length ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length : 0;
    const viewportCenter = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      if (!slide) return;
      const center = centers[index];
      if (center == null) return;
      const offset = step > 0 ? (center - viewportCenter) / step : 0;
      const distance = Math.abs(offset);
      const scale = distance <= 1
        ? 1 - distance * 0.18
        : Math.max(0.3, 0.82 - (distance - 1) * 0.16);
      const opacity = distance <= 1
        ? 1 - distance * 0.35
        : Math.max(0.05, 0.65 - (distance - 1) * 0.3);
      const rotation = reduceMotion
        ? 0
        : -Math.sign(offset) * Math.min(20, distance <= 1 ? distance * 12 : 12 + (distance - 1) * 8);
      slide.style.setProperty("--offset", offset.toFixed(3));
      slide.style.setProperty("--distance", distance.toFixed(3));
      slide.style.setProperty("--scale", scale.toFixed(3));
      slide.style.setProperty("--slide-opacity", opacity.toFixed(3));
      slide.style.setProperty("--rotation", `${rotation.toFixed(2)}deg`);
      if (distance < nearestDistance) {
        nearestIndex = index;
        nearestDistance = distance;
      }
    });

    if (viewport.clientWidth > 0 && nearestDistance < Number.POSITIVE_INFINITY) {
      setActiveIndex((previous) => previous === nearestIndex ? previous : nearestIndex);
    }
  }, [mentors.length, reduceMotion]);

  const scheduleMeasure = useCallback(() => {
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      measureSlides();
    });
  }, [measureSlides]);

  const centerSlide = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const viewport = viewportRef.current;
    const slide = slideRefs.current[index];
    if (!viewport || !slide) return;
    setActiveIndex(index);
    const left = slide.offsetLeft + slide.offsetWidth / 2 - viewport.clientWidth / 2;
    if (typeof viewport.scrollTo === "function") {
      viewport.scrollTo({ left, behavior: reduceMotion ? "auto" : behavior });
    } else {
      viewport.scrollLeft = left;
    }
    scheduleMeasure();
  }, [reduceMotion, scheduleMeasure]);

  useLayoutEffect(() => {
    if (mentors.length) centerSlide(0, "auto");
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
  }, [centerSlide, mentors.length]);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const updatePreference = () => setReduceMotion(query.matches);
    query.addEventListener?.("change", updatePreference);
    return () => query.removeEventListener?.("change", updatePreference);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(viewport);
    slideRefs.current.slice(0, mentors.length).forEach((slide) => {
      if (slide) observer.observe(slide);
    });
    return () => observer.disconnect();
  }, [mentors.length, scheduleMeasure]);

  const moveBy = (amount: number) => {
    centerSlide(Math.max(0, Math.min(mentors.length - 1, activeIndex + amount)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveBy(event.key === "ArrowLeft" ? -1 : 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      centerSlide(0);
    } else if (event.key === "End") {
      event.preventDefault();
      centerSlide(mentors.length - 1);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, scrollLeft: event.currentTarget.scrollLeft };
    draggedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 3) draggedRef.current = true;
    if (draggedRef.current) event.currentTarget.scrollLeft = drag.scrollLeft - delta;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (draggedRef.current) window.setTimeout(() => { draggedRef.current = false; }, 0);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.shiftKey) return;
    event.preventDefault();
    event.currentTarget.scrollLeft += event.deltaY;
  };

  if (mentors.length === 0) {
    return <div className="empty-state"><h3>{t("Mentor profiles are coming soon.")}</h3></div>;
  }

  return (
    <section
      className="mentor-carousel"
      role="region"
      aria-label="Mentors"
      aria-roledescription="carousel"
      onKeyDown={handleKeyDown}
    >
      <div className="mentor-carousel__controls">
        <button type="button" className="mentor-carousel__arrow" aria-label={t("Previous mentor")}
          onClick={() => moveBy(-1)} disabled={activeIndex === 0}>←</button>
        <div className="mentor-carousel__dots" role="group" aria-label={t("Choose a mentor")}>
          {mentors.map((mentor, index) => (
            <button type="button" key={mentor.id}
              className={`mentor-carousel__dot${index === activeIndex ? " is-active" : ""}`}
              aria-label={`${index + 1} of ${mentors.length}: ${mentor.name}`}
              aria-current={index === activeIndex ? "step" : undefined}
              onClick={() => centerSlide(index)} />
          ))}
        </div>
        <button type="button" className="mentor-carousel__arrow" aria-label={t("Next mentor")}
          onClick={() => moveBy(1)} disabled={activeIndex === mentors.length - 1}>→</button>
      </div>

      <div
        ref={viewportRef}
        className="mentor-carousel__viewport"
        onScroll={scheduleMeasure}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onClickCapture={(event) => {
          if (!draggedRef.current) return;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {mentors.map((mentor, index) => {
          const isActive = index === activeIndex;
          return (
            <article
              key={mentor.id}
              ref={(node) => { slideRefs.current[index] = node; }}
              className={`card mentor-card mentor-carousel__slide${isActive ? " is-active" : ""}`}
              data-index={index}
              tabIndex={0}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${mentors.length}: ${mentor.name}`}
              aria-current={isActive ? "true" : undefined}
              onFocusCapture={() => centerSlide(index)}
              onClick={() => centerSlide(index)}
            >
              {mentor.photo
                ? <img className="mentor-card__photo" src={mentor.photo} alt={mentor.name} loading="lazy" draggable={false} />
                : <div className="mentor-card__photo mentor-card__photo--empty" aria-hidden="true" />}
              <div className="mentor-card__body">
                <h3>{mentor.name}</h3>
                <span className="mentor-card__role">{mentor.role}</span>
                <p className={isActive ? "mentor-card__bio" : "mentor-card__bio mentor-card__bio--clamped"}>{mentor.bio}</p>
                <div className="chips">
                  {mentor.specialties.map((specialty) => (
                    <span className="chip" key={specialty}>{specialty}</span>
                  ))}
                </div>
                {isActive && mentor.achievements.length > 0 && (
                  <div className="mentor-card__achievements">
                    <h4>{t("Verified achievements")}</h4>
                    <ul>{mentor.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}</ul>
                  </div>
                )}
                {isActive && mentor.links.length > 0 && (
                  <div className="mentor-card__links">
                    {mentor.links.map((link) => (
                      <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                        tabIndex={isActive ? 0 : -1}>{link.label}</a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
