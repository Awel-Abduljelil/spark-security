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
  const touchTimerRef = useRef<number | null>(null);
  const dragRef = useRef<{ pointerId: number; x: number; scrollLeft: number } | null>(null);
  const draggedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activePhysicalIndex, setActivePhysicalIndex] = useState(mentors.length);
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);
  const [interacting, setInteracting] = useState(false);
  const copies = 3;
  const accessibilityCopy = mentors.length
    ? Math.floor(activePhysicalIndex / mentors.length)
    : 0;

  const measureSlides = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const slides = slideRefs.current.slice(0, mentors.length * copies);
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
    let nearestPhysicalIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, physicalIndex) => {
      if (!slide) return;
      const center = centers[physicalIndex];
      if (center == null) return;
      const offset = step > 0 ? (center - viewportCenter) / step : 0;
      const distance = Math.abs(offset);
      const scale = distance <= 1
        ? 1 - distance * 0.08
        : Math.max(0.78, 0.92 - (distance - 1) * 0.08);
      const opacity = distance <= 1
        ? 1 - distance * 0.12
        : Math.max(0.35, 0.88 - (distance - 1) * 0.18);
      const rotation = reduceMotion
        ? 0
        : -Math.sign(offset) * Math.min(20, distance <= 1 ? distance * 12 : 12 + (distance - 1) * 8);
      slide.style.setProperty("--offset", offset.toFixed(3));
      slide.style.setProperty("--distance", distance.toFixed(3));
      slide.style.setProperty("--scale", scale.toFixed(3));
      slide.style.setProperty("--slide-opacity", opacity.toFixed(3));
      slide.style.setProperty("--rotation", `${rotation.toFixed(2)}deg`);
      if (distance < nearestDistance) {
        nearestIndex = Number(slide.dataset.index);
        nearestPhysicalIndex = physicalIndex;
        nearestDistance = distance;
      }
    });

    if (viewport.clientWidth > 0 && nearestDistance < Number.POSITIVE_INFINITY) {
      setActiveIndex((previous) => previous === nearestIndex ? previous : nearestIndex);
      setActivePhysicalIndex((previous) => previous === nearestPhysicalIndex ? previous : nearestPhysicalIndex);
    }
  }, [mentors.length, reduceMotion]);

  const scheduleMeasure = useCallback(() => {
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      measureSlides();
    });
  }, [measureSlides]);

  const centerSlide = useCallback((
    index: number,
    behavior: ScrollBehavior = "smooth",
    preferredPhysicalIndex?: number,
  ) => {
    const viewport = viewportRef.current;
    const targetIndex = Math.max(0, Math.min(mentors.length - 1, index));
    const candidates = slideRefs.current
      .map((slide, physicalIndex) => ({ slide, physicalIndex }))
      .filter(({ slide }) => slide && Number(slide.dataset.index) === targetIndex);
    const viewportCenter = viewport ? viewport.getBoundingClientRect().left + viewport.clientWidth / 2 : 0;
    const closest = candidates.reduce<{ slide: HTMLElement | null; physicalIndex: number; distance: number }>(
      (nearest, candidate) => {
        const rect = candidate.slide?.getBoundingClientRect();
        const distance = rect ? Math.abs(rect.left + rect.width / 2 - viewportCenter) : Number.POSITIVE_INFINITY;
        return distance < nearest.distance ? { ...candidate, distance } : nearest;
      },
      { slide: null, physicalIndex: 0, distance: Number.POSITIVE_INFINITY },
    );
    const targetPhysicalIndex = preferredPhysicalIndex ?? closest.physicalIndex;
    const slide = preferredPhysicalIndex === undefined ? closest.slide : slideRefs.current[preferredPhysicalIndex];
    if (!viewport || !slide) return;
    setActiveIndex(targetIndex);
    setActivePhysicalIndex(targetPhysicalIndex);
    const left = slide.offsetLeft + slide.offsetWidth / 2 - viewport.clientWidth / 2;
    if (typeof viewport.scrollTo === "function") {
      viewport.scrollTo({ left, behavior: reduceMotion ? "auto" : behavior });
    } else {
      viewport.scrollLeft = left;
    }
    scheduleMeasure();
  }, [mentors.length, reduceMotion, scheduleMeasure]);

  useLayoutEffect(() => {
    if (mentors.length) centerSlide(0, "auto", mentors.length * (copies - 1));
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

  useEffect(() => () => {
    if (touchTimerRef.current !== null) window.clearTimeout(touchTimerRef.current);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(viewport);
    slideRefs.current.slice(0, mentors.length * copies).forEach((slide) => {
      if (slide) observer.observe(slide);
    });
    return () => observer.disconnect();
  }, [mentors.length, scheduleMeasure]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || reduceMotion || interacting || mentors.length < 2) return;
    const firstMiddleSlide = slideRefs.current[mentors.length];
    const firstLastSlide = slideRefs.current[mentors.length * (copies - 1)];
    if (!firstMiddleSlide || !firstLastSlide) return;
    const cycleWidth = firstLastSlide.offsetLeft - firstMiddleSlide.offsetLeft;
    if (cycleWidth <= 0) return;

    let animationFrame = 0;
    let previousTime: number | null = null;
    const animate = (time: number) => {
      const elapsed = previousTime === null ? 0 : Math.min(time - previousTime, 50);
      previousTime = time;
      viewport.scrollLeft -= elapsed * 0.04;
      if (viewport.scrollLeft < cycleWidth) viewport.scrollLeft += cycleWidth;
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [interacting, mentors.length, reduceMotion]);

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
    if (event.pointerType !== "mouse") {
      setInteracting(true);
      if (touchTimerRef.current !== null) window.clearTimeout(touchTimerRef.current);
      return;
    }
    if (event.button !== 0) return;
    setInteracting(true);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, scrollLeft: event.currentTarget.scrollLeft };
    draggedRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 3) draggedRef.current = true;
    if (draggedRef.current) event.currentTarget.scrollLeft = drag.scrollLeft - delta;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      if (draggedRef.current) window.setTimeout(() => { draggedRef.current = false; }, 0);
      setInteracting(false);
      return;
    }
    if (event.pointerType !== "mouse") {
      if (touchTimerRef.current !== null) window.clearTimeout(touchTimerRef.current);
      touchTimerRef.current = window.setTimeout(() => setInteracting(false), 2500);
    }
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.shiftKey) return;
    setInteracting(true);
    event.preventDefault();
    event.currentTarget.scrollLeft += event.deltaY;
    if (touchTimerRef.current !== null) window.clearTimeout(touchTimerRef.current);
    touchTimerRef.current = window.setTimeout(() => setInteracting(false), 2500);
  };

  if (mentors.length === 0) {
    return <div className="empty-state"><h3>{t("Mentor profiles are coming soon.")}</h3></div>;
  }

  return (
    <section
      className="mentor-carousel"
      data-autoplaying={!reduceMotion && !interacting && mentors.length > 1}
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
        {Array.from({ length: mentors.length * copies }, (_, physicalIndex) => {
          const index = physicalIndex % mentors.length;
          const copy = Math.floor(physicalIndex / mentors.length);
          const mentor = mentors[index];
          const isActive = physicalIndex === activePhysicalIndex;
          return (
            <article
              key={`${copy}-${mentor.id}`}
              ref={(node) => { slideRefs.current[physicalIndex] = node; }}
              className={`card mentor-card mentor-carousel__slide${isActive ? " is-active" : ""}`}
              data-index={index}
              data-copy={copy}
              tabIndex={copy === accessibilityCopy ? 0 : -1}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${mentors.length}: ${mentor.name}`}
              aria-current={isActive ? "true" : undefined}
              aria-hidden={copy !== accessibilityCopy}
              onFocusCapture={() => centerSlide(index, "smooth", physicalIndex)}
              onClick={() => centerSlide(index, "smooth", physicalIndex)}
            >
              {mentor.photo
                ? <img className="mentor-card__photo" src={mentor.photo} alt={mentor.name} loading="lazy" draggable={false} />
                : <div className="mentor-card__photo mentor-card__photo--empty" aria-hidden="true" />}
              <div className="mentor-card__body">
                <h3>{mentor.name}</h3>
                <span className="mentor-card__role">{mentor.role}</span>
                <p className="mentor-card__bio">{mentor.bio}</p>
                <div className="chips">
                  {mentor.specialties.map((specialty) => (
                    <span className="chip" key={specialty}>{specialty}</span>
                  ))}
                </div>
                {mentor.achievements.length > 0 && (
                  <div className="mentor-card__achievements">
                    <h4>{t("Verified achievements")}</h4>
                    <ul>{mentor.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}</ul>
                  </div>
                )}
                {mentor.links.length > 0 && (
                  <div className="mentor-card__links">
                    {mentor.links.map((link) => (
                      <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                        aria-label={link.label}
                        title={link.label}
                        tabIndex={copy === accessibilityCopy ? 0 : -1}>
                        {link.label.toLowerCase() === "linkedin" ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14Zm-10.7 7H5.6v8.4h2.7V10Zm8.5 0c-1.3 0-2.1.7-2.5 1.3V10h-2.7v8.4h2.7v-4.5c0-1.2.2-2.3 1.6-2.3s1.4 1.3 1.4 2.4v4.4H20v-5c0-2.5-.5-4.4-3.2-4.4ZM7 5.8a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
                          </svg>
                        ) : link.label.toLowerCase() === "github" ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M12 .9a11.1 11.1 0 0 0-3.5 21.6c.6.1.8-.2.8-.6v-2.1c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.8 2.2 3.7 1.5.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1a10.5 10.5 0 0 1 5.4 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.7 1.1 2.9 0 4.3-2.6 5.2-5.1 5.5.4.3.8 1 .8 2v2.7c0 .4.2.7.8.6A11.1 11.1 0 0 0 12 .9Z" />
                          </svg>
                        ) : (
                          <span className="mentor-card__social-fallback" aria-hidden="true">{link.label.slice(0, 1)}</span>
                        )}
                      </a>
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
