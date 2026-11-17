import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../../hooks/useCourses";
import { useLanguage } from "../../i18n/useLanguage";
import { CourseLanguageBadge } from "../course/CourseLanguageBadge";
import "./HeroCourseCarousel.css";

const COURSE_LIMIT = 6;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function offsetFromCenter(index: number, activeIndex: number, total: number): number {
  let offset = index - activeIndex;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

function formatPrice(price: number): string {
  return `${price.toLocaleString("en-US")} ETB`;
}

export function HeroCourseCarousel() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: courses, status } = useCourses();
  const featuredCourses = courses.slice(0, COURSE_LIMIT);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number } | null>(null);
  const draggedRef = useRef(false);
  const wheelDistanceRef = useRef(0);
  const wheelLockedRef = useRef(false);
  const wheelTimerRef = useRef<number | null>(null);
  const recenterTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [physicalCenterIndex, setPhysicalCenterIndex] = useState(0);
  const [stageWidth, setStageWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);
  const viewportWidth = typeof window === "undefined" ? stageWidth : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 0 : window.innerHeight;
  const compactCarousel = viewportWidth < 640 || (viewportHeight <= 500 && viewportWidth < 960);

  const centerCourse = useCallback((index: number, preferredPhysicalIndex?: number) => {
    if (featuredCourses.length === 0) return;
    const targetIndex = (index + featuredCourses.length) % featuredCourses.length;
    const centerCopyStart = featuredCourses.length * 2;
    const currentPhysicalIndex = physicalCenterIndex || centerCopyStart + activeIndex;
    const shift = offsetFromCenter(targetIndex, activeIndex, featuredCourses.length);
    const nextPhysicalIndex = preferredPhysicalIndex ?? currentPhysicalIndex + shift;
    setPhysicalCenterIndex(nextPhysicalIndex);
    setActiveIndex(targetIndex);
    if (recenterTimerRef.current !== null) window.clearTimeout(recenterTimerRef.current);
    if (compactCarousel && (nextPhysicalIndex < centerCopyStart
      || nextPhysicalIndex >= centerCopyStart + featuredCourses.length)) {
      if (reduceMotion) {
        setPhysicalCenterIndex(centerCopyStart + targetIndex);
      } else {
        recenterTimerRef.current = window.setTimeout(() => {
          const middleIndex = centerCopyStart + targetIndex;
          const stage = stageRef.current;
          const slide = stage?.querySelector<HTMLElement>(`[data-physical-index="${middleIndex}"]`);
          if (stage && slide) {
            const left = slide.offsetLeft + slide.offsetWidth / 2 - stage.clientWidth / 2;
            stage.scrollTo({ left, behavior: "instant" });
          }
          setPhysicalCenterIndex(middleIndex);
        }, 450);
      }
    }
  }, [activeIndex, compactCarousel, featuredCourses.length, physicalCenterIndex, reduceMotion]);

  const moveBy = useCallback((amount: number) => {
    centerCourse(activeIndex + amount);
  }, [activeIndex, centerCourse]);

  const openCourse = useCallback((index = activeIndex) => {
    const course = featuredCourses[index];
    if (course) navigate(`/courses/${encodeURIComponent(course.slug)}`);
  }, [activeIndex, featuredCourses, navigate]);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const updatePreference = () => setReduceMotion(query.matches);
    query.addEventListener?.("change", updatePreference);
    return () => query.removeEventListener?.("change", updatePreference);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setStageWidth(stage.clientWidth));
    observer.observe(stage);
    setStageWidth(stage.clientWidth);
    return () => observer.disconnect();
  }, [featuredCourses.length]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !compactCarousel || featuredCourses.length === 0) return;
    const targetPhysicalIndex = physicalCenterIndex || featuredCourses.length * 2 + activeIndex;
    const slide = stage.querySelector<HTMLElement>(`[data-physical-index="${targetPhysicalIndex}"]`);
    if (!slide) return;
    const left = slide.offsetLeft + slide.offsetWidth / 2 - stage.clientWidth / 2;
    const behavior = reduceMotion || physicalCenterIndex === 0 ? "instant" : "smooth";
    stage.scrollTo({ left, behavior });
  }, [activeIndex, compactCarousel, featuredCourses.length, physicalCenterIndex, reduceMotion]);

  useEffect(() => () => {
    if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current);
    if (recenterTimerRef.current !== null) window.clearTimeout(recenterTimerRef.current);
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveBy(event.key === "ArrowLeft" ? -1 : 1);
    } else if (event.key === "Enter" && event.target instanceof HTMLElement
      && event.target.matches(".hero-course-carousel, .hero-course-carousel__slide, .hero-course-carousel__viewport")) {
      event.preventDefault();
      openCourse();
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, a")) return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX };
    draggedRef.current = false;
    const captureTarget = (event.target as HTMLElement)
      .closest<HTMLElement>(".hero-course-carousel__slide") ?? event.currentTarget;
    captureTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (drag?.pointerId === event.pointerId && Math.abs(event.clientX - drag.x) > 8) {
      draggedRef.current = true;
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 40) {
      moveBy(delta < 0 ? 1 : -1);
      draggedRef.current = true;
      window.setTimeout(() => { draggedRef.current = false; }, 0);
    }
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    draggedRef.current = false;
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.shiftKey ? event.deltaY : 0;
    if (delta === 0 || featuredCourses.length < 2) return;
    event.preventDefault();
    wheelDistanceRef.current += delta;
    if (!wheelLockedRef.current && Math.abs(wheelDistanceRef.current) > 45) {
      moveBy(wheelDistanceRef.current > 0 ? 1 : -1);
      wheelDistanceRef.current = 0;
      wheelLockedRef.current = true;
    }
    if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = window.setTimeout(() => {
      wheelDistanceRef.current = 0;
      wheelLockedRef.current = false;
    }, 420);
  }

  if (status === "loading") {
    return <div className="hero-visual hero-course-carousel__status" role="status">{t("Loading courses...")}</div>;
  }
  if (status === "error") {
    return <div className="hero-visual hero-course-carousel__status" role="alert">{t("Courses are temporarily unavailable. Please try again later.")}</div>;
  }
  if (featuredCourses.length === 0) {
    return (
      <div className="hero-visual hero-course-carousel__empty" role="status">
        <span aria-hidden="true">&gt;_</span>
        <strong>{t("Courses are coming soon")}</strong>
      </div>
    );
  }

  const cardWidth = viewportWidth >= 1024 && !compactCarousel
    ? Math.max(224, Math.min(viewportWidth * 0.27, 304))
    : compactCarousel
      ? Math.min(viewportWidth * 0.78, Math.max(0, viewportHeight * 0.576 - 32))
      : Math.min(viewportWidth * 0.8, 384);
  const shiftStep = viewportWidth < 672
    ? Math.max(0, (stageWidth - cardWidth) / 2 + 20)
    : cardWidth * 0.9;
  const maxDistance = viewportWidth >= 1024 ? 2 : 1;
  const renderedCourses = compactCarousel
    ? [...featuredCourses, ...featuredCourses, ...featuredCourses, ...featuredCourses, ...featuredCourses]
    : featuredCourses;
  const renderedCenterIndex = compactCarousel
    ? physicalCenterIndex || featuredCourses.length * 2 + activeIndex
    : activeIndex;

  return (
    <section
      className="hero-visual hero-course-carousel"
      role="region"
      aria-label="Featured courses"
      aria-roledescription="carousel"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={stageRef}
        className="hero-course-carousel__viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onWheel={handleWheel}
        onClickCapture={(event) => {
          if (!draggedRef.current) return;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <button type="button" className="hero-course-carousel__arrow hero-course-carousel__arrow--previous"
          aria-label={t("Previous course")} onClick={() => moveBy(-1)}>←</button>
        <button type="button" className="hero-course-carousel__arrow hero-course-carousel__arrow--next"
          aria-label={t("Next course")} onClick={() => moveBy(1)}>→</button>
        {renderedCourses.map((course, physicalIndex) => {
          const index = physicalIndex % featuredCourses.length;
          const offset = compactCarousel
            ? offsetFromCenter(physicalIndex, renderedCenterIndex, renderedCourses.length)
            : offsetFromCenter(index, activeIndex, featuredCourses.length);
          const distance = Math.abs(offset);
          const visible = distance <= maxDistance;
          const isCenter = physicalIndex === renderedCenterIndex;
          const scale = distance === 0 ? 1 : distance === 1 ? compactCarousel ? 0.88 : 0.82 : 0.66;
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.6 : 0.3;
          const rotation = reduceMotion || compactCarousel || featuredCourses.length < 3 || distance > 2
            ? 0
            : -Math.sign(offset) * (distance === 1 ? 15 : 20);
          const shift = offset * shiftStep;
          const price = course.discountPriceEtb ?? course.priceEtb ?? null;
          const originalPrice = course.priceEtb ?? null;
          const discounted = price !== null && originalPrice !== null && price < originalPrice;
          const enrollmentOpen = course.enrollmentOpen ?? false;
          return (
            <article
              key={`${physicalIndex}-${course.slug}`}
              className={`hero-course-carousel__slide${isCenter ? " is-active" : ""}`}
              data-course-index={index}
              data-physical-index={physicalIndex}
              style={{
                "--shift": `${shift}px`,
                "--depth": `${distance * -2}rem`,
                "--scale": scale,
                "--slide-opacity": opacity,
                "--rotation": `${rotation}deg`,
                zIndex: featuredCourses.length - distance,
                visibility: visible ? "visible" : "hidden",
                pointerEvents: visible ? "auto" : "none",
              } as CSSProperties}
              tabIndex={visible ? 0 : -1}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${featuredCourses.length}: ${course.title}`}
              aria-hidden={!visible}
              onFocus={() => {
                if (!dragRef.current) centerCourse(index);
              }}
              onClick={() => isCenter ? openCourse(index) : centerCourse(index, physicalIndex)}
              onDragStart={(event) => event.preventDefault()}
            >
              {course.cover
                ? <img className="hero-course-carousel__image" src={course.cover} alt={`${course.title} course cover`}
                    loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} draggable={false} />
                : <div className="hero-course-carousel__fallback" aria-hidden="true"><span>&gt;_</span></div>}
              <div className="hero-course-carousel__scrim" aria-hidden="true" />
              <div className="hero-course-carousel__content">
                <div className="hero-course-carousel__badges">
                  <CourseLanguageBadge language={course.language} />
                  {course.tag && <span className="hero-course-carousel__tag">{course.tag}</span>}
                </div>
                <div className="hero-course-carousel__details">
                  <h2>{course.title}</h2>
                  {isCenter && <p className="hero-course-carousel__description">{course.description}</p>}
                  <div className="hero-course-carousel__chips">
                    <span>{course.level}</span>
                    {course.duration && <span>{course.duration}</span>}
                  </div>
                  <div className="hero-course-carousel__footer">
                    <p className="hero-course-carousel__price">
                      {discounted && <del>{formatPrice(originalPrice)}</del>}
                      <strong>{price === null ? t("Price unavailable") : formatPrice(price)}</strong>
                    </p>
                    {isCenter && (enrollmentOpen ? (
                      <button type="button" className="hero-course-carousel__enroll"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/enroll?course=${encodeURIComponent(course.slug)}`);
                        }}>
                        {t("Enroll now")}
                      </button>
                    ) : <span className="hero-course-carousel__closed">{t("Closed")}</span>)}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="hero-course-carousel__controls">
        <div className="hero-course-carousel__dots" role="group" aria-label={t("Choose a course")}>
          {featuredCourses.map((course, index) => (
            <button type="button" key={course.slug}
              className={`hero-course-carousel__dot${index === activeIndex ? " is-active" : ""}`}
              aria-label={`${index + 1} of ${featuredCourses.length}: ${course.title}`}
              aria-current={index === activeIndex ? "step" : undefined}
              onClick={() => centerCourse(index)} />
          ))}
        </div>
      </div>
    </section>
  );
}
