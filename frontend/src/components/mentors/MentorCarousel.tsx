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
  const detailDialogRef = useRef<HTMLDialogElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activePhysicalIndex, setActivePhysicalIndex] = useState(mentors.length);
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);
  const [interacting, setInteracting] = useState(false);
  const copies = 3;
  const accessibilityCopy = mentors.length
    ? Math.floor(activePhysicalIndex / mentors.length)
    : 0;

  useEffect(() => {
    const dialog = detailDialogRef.current;
    if (!selectedMentor || !dialog || dialog.open) return;
    dialog.showModal();
  }, [selectedMentor]);

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
    if (!viewport || reduceMotion || interacting || selectedMentor || mentors.length < 2) return;
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
  }, [interacting, mentors.length, reduceMotion, selectedMentor]);

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
      data-autoplaying={!reduceMotion && !interacting && !selectedMentor && mentors.length > 1}
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
              onClick={() => {
                if (isActive) setSelectedMentor(mentor);
                else centerSlide(index, "smooth", physicalIndex);
              }}
            >
              {mentor.photo
                ? <img className="mentor-card__photo" src={mentor.photo} alt={mentor.name} loading="lazy" draggable={false} />
                : <div className="mentor-card__photo mentor-card__photo--empty" aria-hidden="true" />}
              <div className="mentor-card__body">
                <h3>{mentor.name}</h3>
                <span className="mentor-card__role">{mentor.role}</span>
                <p className="mentor-card__bio mentor-card__bio--clamped">{mentor.bio}</p>
                <div className="chips mentor-card__specialties">
                  {mentor.specialties.slice(0, 3).map((specialty) => (
                    <span className="chip" key={specialty}>{specialty}</span>
                  ))}
                  {mentor.specialties.length > 3 && (
                    <span className="chip">+{mentor.specialties.length - 3}</span>
                  )}
                </div>
                <button className="mentor-card__details" type="button"
                  aria-haspopup="dialog"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedMentor(mentor);
                  }}>
                  {t("View details")}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {selectedMentor && (
        <dialog
          className="mentor-detail-dialog"
          ref={detailDialogRef}
          aria-labelledby="mentor-detail-dialog-title"
          onClose={() => setSelectedMentor(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) detailDialogRef.current?.close();
          }}
        >
          <article className="mentor-detail-dialog__panel">
            <button
              className="mentor-detail-dialog__close"
              type="button"
              aria-label={t("Close mentor details")}
              onClick={() => detailDialogRef.current?.close()}
            >
              ×
            </button>
            {selectedMentor.photo && (
              <img className="mentor-detail-dialog__photo" src={selectedMentor.photo} alt="" />
            )}
            <div className="mentor-detail-dialog__content">
              <h2 id="mentor-detail-dialog-title">{selectedMentor.name}</h2>
              <span className="mentor-card__role">{selectedMentor.role}</span>
              <p>{selectedMentor.bio}</p>
              {selectedMentor.specialties.length > 0 && (
                <div className="mentor-detail-dialog__section">
                  <h3>{t("Specialties")}</h3>
                  <div className="chips">
                    {selectedMentor.specialties.map((specialty) => (
                      <span className="chip" key={specialty}>{specialty}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedMentor.achievements.length > 0 && (
                <div className="mentor-detail-dialog__section">
                  <h3>{t("Verified achievements")}</h3>
                  <ul>
                    {selectedMentor.achievements.map((achievement) => (
                      <li key={achievement}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedMentor.links.length > 0 && (
                <div className="mentor-detail-dialog__section">
                  <h3>{t("Connect")}</h3>
                  <div className="mentor-detail-dialog__links">
                    {selectedMentor.links.map((link) => (
                      <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </dialog>
      )}
    </section>
  );
}
