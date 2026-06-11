-- ============================================================
-- LearnPath PMF 지표 쿼리 세트 (Phase 1: ~100명)
-- Supabase SQL Editor에 붙여넣어 실행
--
-- 합격 기준 (Phase 1):
--   D7 리텐션 ≥ 25% / Step 완료율 ≥ 40% / Path 완성률 ≥ 15%
-- ============================================================

-- ────────────────────────────────────────────
-- 1. 주간 핵심 대시보드 (한 번에 보기)
-- ────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM auth.users)                                            AS total_users,
  (SELECT COUNT(*) FROM auth.users WHERE created_at > now() - interval '7 days') AS new_users_7d,
  (SELECT COUNT(DISTINCT user_id) FROM progress
     WHERE last_accessed_at > now() - interval '7 days')                        AS weekly_active_learners,
  (SELECT COUNT(*) FROM progress WHERE progress_percent > 0)                    AS learning_started,
  (SELECT COUNT(*) FROM progress WHERE progress_percent = 100)                  AS paths_completed,
  (SELECT COUNT(*) FROM curricula WHERE is_published = true)                    AS published_paths,
  (SELECT COUNT(*) FROM curricula
     WHERE is_published = true AND created_at > now() - interval '7 days')      AS new_paths_7d;

-- ────────────────────────────────────────────
-- 2. D1 / D7 / D30 리텐션 (가입 코호트 기준)
--    "가입 후 N일째에 학습 활동이 있었는가"
-- ────────────────────────────────────────────
WITH cohort AS (
  SELECT id AS user_id, created_at::date AS signup_date
  FROM auth.users
  WHERE created_at < now() - interval '1 day'
),
activity AS (
  SELECT DISTINCT user_id, last_accessed_at::date AS active_date
  FROM progress
)
SELECT
  c.signup_date,
  COUNT(DISTINCT c.user_id) AS signups,
  COUNT(DISTINCT CASE WHEN a.active_date = c.signup_date + 1 THEN c.user_id END)  AS d1_retained,
  COUNT(DISTINCT CASE WHEN a.active_date BETWEEN c.signup_date + 5 AND c.signup_date + 9 THEN c.user_id END)  AS d7_retained,
  COUNT(DISTINCT CASE WHEN a.active_date BETWEEN c.signup_date + 25 AND c.signup_date + 35 THEN c.user_id END) AS d30_retained
FROM cohort c
LEFT JOIN activity a ON a.user_id = c.user_id
GROUP BY c.signup_date
ORDER BY c.signup_date DESC
LIMIT 30;

-- ────────────────────────────────────────────
-- 3. Step 완료율 (학습을 시작한 사람 중 Step을 1개 이상 끝낸 비율)
-- ────────────────────────────────────────────
SELECT
  COUNT(*)                                                          AS learners,
  COUNT(*) FILTER (WHERE array_length(completed_steps, 1) >= 1)     AS completed_1plus_step,
  ROUND(
    COUNT(*) FILTER (WHERE array_length(completed_steps, 1) >= 1)::numeric
    / NULLIF(COUNT(*), 0) * 100, 1
  )                                                                 AS step_completion_rate_pct
FROM progress;

-- ────────────────────────────────────────────
-- 4. Path 완성률 (시작 대비 100% 도달)
-- ────────────────────────────────────────────
SELECT
  COUNT(*) FILTER (WHERE progress_percent > 0)    AS started,
  COUNT(*) FILTER (WHERE progress_percent = 100)  AS completed,
  ROUND(
    COUNT(*) FILTER (WHERE progress_percent = 100)::numeric
    / NULLIF(COUNT(*) FILTER (WHERE progress_percent > 0), 0) * 100, 1
  )                                               AS path_completion_rate_pct
FROM progress;

-- ────────────────────────────────────────────
-- 5. 가입 → 온보딩 → 학습 시작 퍼널
-- ────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM auth.users)                                   AS signed_up,
  (SELECT COUNT(*) FROM profiles WHERE onboarded_at IS NOT NULL)      AS onboarded,
  (SELECT COUNT(DISTINCT user_id) FROM progress)                      AS started_learning,
  (SELECT COUNT(DISTINCT user_id) FROM progress
     WHERE array_length(completed_steps, 1) >= 1)                     AS completed_a_step;

-- ────────────────────────────────────────────
-- 6. Resume First 검증 — 돌아온 학습자
--    (첫 학습일과 다른 날에 다시 접속한 비율)
-- ────────────────────────────────────────────
WITH first_seen AS (
  SELECT user_id, MIN(last_accessed_at::date) AS first_date, MAX(last_accessed_at::date) AS last_date
  FROM progress GROUP BY user_id
)
SELECT
  COUNT(*)                                          AS learners,
  COUNT(*) FILTER (WHERE last_date > first_date)    AS returned_learners,
  ROUND(COUNT(*) FILTER (WHERE last_date > first_date)::numeric / NULLIF(COUNT(*),0) * 100, 1) AS return_rate_pct
FROM first_seen;

-- ────────────────────────────────────────────
-- 7. Path별 성과 (어떤 길이 잘 걷히는가)
-- ────────────────────────────────────────────
SELECT
  c.title,
  c.category,
  COUNT(p.id)                                         AS learners,
  ROUND(AVG(p.progress_percent), 0)                   AS avg_progress_pct,
  COUNT(p.id) FILTER (WHERE p.progress_percent = 100) AS completions
FROM curricula c
LEFT JOIN progress p ON p.curriculum_id = c.id
WHERE c.is_published = true
GROUP BY c.id, c.title, c.category
ORDER BY learners DESC, avg_progress_pct DESC;

-- ────────────────────────────────────────────
-- 8. 이벤트 로그 점검 (analytics_events 최근 7일)
-- ────────────────────────────────────────────
SELECT event_name, COUNT(*) AS cnt
FROM analytics_events
WHERE created_at > now() - interval '7 days'
GROUP BY event_name
ORDER BY cnt DESC;
