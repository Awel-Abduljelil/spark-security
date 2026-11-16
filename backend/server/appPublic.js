import { Router } from 'express';
import { db } from './db.js';
import { parseJ } from './security.js';

const r = Router();

function cohortSeats(cohort) {
  const verified = db.prepare("SELECT COUNT(*) n FROM enrollments WHERE cohort_id=? AND status='approved'")
    .get(cohort.id).n;
  return {
    totalSeats: cohort.total_seats,
    seatsLeft: cohort.total_seats === 0 ? 0 : Math.max(0, cohort.total_seats - verified),
  };
}

function cohortIsAvailable(cohort) {
  const { seatsLeft, totalSeats } = cohortSeats(cohort);
  return !!cohort.is_open && (totalSeats === 0 || seatsLeft > 0);
}

function nextCohort(courseId) {
  const cohorts = db.prepare(`SELECT * FROM cohorts WHERE course_id=? AND is_open=1
    ORDER BY CASE WHEN start_date IS NULL OR start_date='' THEN 1 ELSE 0 END, start_date, id`).all(courseId);
  const cohort = cohorts.find(cohortIsAvailable);
  if (!cohort) return null;
  const { totalSeats, seatsLeft } = cohortSeats(cohort);
  return {
    startDate: cohort.start_date ?? '',
    label: cohort.label,
    priceEtb: cohort.price_etb,
    seatsLeft,
    totalSeats,
    schedule: cohort.schedule,
  };
}

function courseContent(course) {
  try {
    const saved = JSON.parse(course.content_json || '{}');
    if (saved && Array.isArray(saved.outcomes) && Array.isArray(saved.weeks)
      && Array.isArray(saved.requirements) && Array.isArray(saved.audience)
      && Array.isArray(saved.instructors)) return saved;
  } catch {
    // Older course records use the separate legacy list columns below.
  }
  const topics = parseJ(course.topics);
  return {
    outcomes: parseJ(course.objectives),
    weeks: topics.length ? [{ title: 'Course topics', topics }] : [],
    requirements: parseJ(course.prereqs),
    audience: parseJ(course.audience),
    instructors: course.instructor ? [{ name: course.instructor, role: 'Instructor', bio: '' }] : [],
  };
}

function card(course) {
  return {
    slug: course.slug,
    title: course.title,
    level: course.level,
    duration: course.duration ?? '',
    sessions: course.sessions ?? 0,
    labs: course.labs ?? 0,
    language: course.language || 'en',
    tag: course.tag || null,
    description: course.short || course.description || '',
    skills: parseJ(course.skills).length ? parseJ(course.skills) : parseJ(course.topics),
    nextCohort: nextCohort(course.id),
  };
}

function detail(course) {
  return {
    ...card(course),
    description: course.description || course.short || '',
    cover: course.cover || null,
    content: courseContent(course),
    platform: course.format || null,
    language: course.language || 'en',
    cohortsPerYear: course.cohorts_per_year ?? null,
  };
}

r.get('/courses', (q, s) => {
  const language = q.query.lang === undefined ? 'en' : q.query.lang;
  if (typeof language !== 'string' || !['en', 'om', 'am'].includes(language)) {
    return s.status(400).json({ error: 'Language must be en, om, or am.' });
  }
  const whereLanguage = language === 'om' ? "AND language IN ('en','om')"
    : language === 'am' ? "AND language IN ('en','am')" : '';
  const courses = db.prepare(`SELECT * FROM courses WHERE status='published' ${whereLanguage} ORDER BY sort,id DESC`).all();
  s.json(courses.map(card));
});

r.get('/courses/:slug', (q, s) => {
  const course = db.prepare("SELECT * FROM courses WHERE slug=? AND status='published'").get(q.params.slug);
  if (!course) return s.status(404).json({ error: 'Course was not found.' });
  s.json(detail(course));
});

r.get('/cohorts/:slug', (q, s) => {
  const course = db.prepare("SELECT id FROM courses WHERE slug=? AND status='published'").get(q.params.slug);
  if (!course) return s.status(404).json({ error: 'Cohort was not found.' });
  const cohorts = db.prepare(`SELECT * FROM cohorts WHERE course_id=? AND is_open=1
    ORDER BY CASE WHEN start_date IS NULL OR start_date='' THEN 1 ELSE 0 END, start_date, id`).all(course.id);
  const cohort = cohorts.find(cohortIsAvailable);
  if (!cohort) return s.status(404).json({ error: 'Cohort was not found.' });
  const { totalSeats, seatsLeft } = cohortSeats(cohort);
  s.json({
    id: cohort.id,
    courseSlug: q.params.slug,
    startDate: cohort.start_date ?? '',
    label: cohort.label,
    totalSeats,
    seatsLeft,
    priceEtb: cohort.price_etb,
    schedule: cohort.schedule,
  });
});

r.get('/site', (q, s) => {
  const settings = Object.fromEntries(db.prepare('SELECT key,value FROM settings').all().map(({ key, value }) => [key, value]));
  delete settings.group_instructions;
  s.json({
    settings,
    mentors: db.prepare('SELECT id,name,role,bio,specialties,achievements,photo,linkedin,github FROM mentors WHERE published=1 ORDER BY sort,id').all()
      .map((mentor) => ({
        ...mentor,
        role: mentor.role ?? '',
        bio: mentor.bio ?? '',
        specialties: parseJ(mentor.specialties),
        achievements: parseJ(mentor.achievements),
      })),
    faqs: db.prepare('SELECT question,answer FROM faqs WHERE published=1 ORDER BY sort,id').all(),
  });
});

export default r;
