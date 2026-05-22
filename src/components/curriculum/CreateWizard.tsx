'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics/track'
import { slugify, uniqueSlug } from '@/lib/slugify'
import type { CurriculumDetail } from '@/lib/supabase/types'
import { PlusCircleIcon, RocketIcon, BookOpenIcon, AlertCircleIcon, CheckCircleIcon } from '@/components/ui/icons'

/* ─── 타입 ─── */
interface StepDraft {
  id: string
  title: string
  description: string
  estimatedDuration: string
  resources: ResourceDraft[]
}

interface ResourceDraft {
  id: string
  type: 'video' | 'article' | 'github' | 'other'
  url: string
  title: string
}

interface Props {
  userId: string
  curriculum?: CurriculumDetail
}

/* ─── 상수 ─── */
const CATEGORIES = ['AI·자동화', '프로그래밍', '디자인', '비즈니스', '생산성', '기타']
const LEVELS = [
  { value: 'beginner', label: '초급 (입문자)', icon: null },
  { value: 'intermediate', label: '중급 (기본 지식)', icon: null },
  { value: 'advanced', label: '고급 (실무 경험자)', icon: <RocketIcon size={16} /> },
]
const DURATION_OPTIONS = [
  { label: '1시간 미만', value: '50' },
  { label: '1~3시간', value: '120' },
  { label: '3~5시간', value: '240' },
  { label: '5~10시간', value: '450' },
  { label: '10~20시간', value: '900' },
  { label: '20시간 이상', value: '1200' },
]
const WIZARD_STEPS = [
  { label: '기본 정보', desc: '제목과 카테고리' },
  { label: '학습 목표', desc: '목표와 대상' },
  { label: 'Step 구성', desc: '단계별 학습 내용' },
  { label: '공개 설정', desc: '발행 준비' },
  { label: '미리보기', desc: '최종 확인' },
]
const TIPS: Record<number, string[]> = {
  0: [
    '제목은 "무엇을 배우는 과정인지" 명확하게 써주세요.',
    '한 줄 소개는 검색 결과에 노출되니 핵심을 담으세요.',
    '썸네일은 16:9 비율이 가장 잘 보입니다.',
  ],
  1: [
    '학습 목표는 "~할 수 있다" 형태로 구체적으로 써주세요.',
    '추천 대상은 2~4개가 적당합니다.',
    '선행 지식이 없어도 시작할 수 있다면 비워두세요.',
  ],
  2: [
    'Step은 3~7개가 가장 적절해요.',
    '하나의 Step은 하나의 주제에 집중하세요.',
    '기초 → 심화 순서로 구성하면 좋아요.',
    '각 Step의 학습 시간은 10~20분이 적당해요.',
  ],
  3: [
    '발행하면 탐색 페이지에 공개됩니다.',
    '초안으로 저장하면 본인만 볼 수 있어요.',
    '발행 후에도 수정은 언제든 가능합니다.',
  ],
  4: [
    '미리보기로 최종 상태를 확인하세요.',
    '문제가 있으면 이전 단계로 돌아가 수정하세요.',
  ],
}

/* ─── 유틸 ─── */
function uid() { return Math.random().toString(36).slice(2) }
function emptyStep(): StepDraft {
  return { id: uid(), title: '', description: '', estimatedDuration: '15', resources: [] }
}
function emptyResource(): ResourceDraft {
  return { id: uid(), type: 'article', url: '', title: '' }
}

/* ─── 스타일 ─── */
const inputStyle = {
  width: '100%', padding: '10px 12px',
  borderRadius: 8, border: '1px solid var(--border)',
  fontSize: 14, fontFamily: 'inherit',
  outline: 'none', background: '#fff',
  color: 'var(--text-primary)',
  transition: 'border-color 150ms',
} as const

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 700,
  marginBottom: 6, color: 'var(--text-primary)',
} as const

/* ─── TagInput ─── */
function TagInput({
  label, tags, onChange, placeholder,
}: { label: string; tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if (v && !tags.includes(v)) onChange([...tags, v])
    setInput('')
  }
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {tags.map(t => (
          <span key={t} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999,
            background: 'var(--accent-light)', color: 'var(--accent)',
            fontSize: 13, fontWeight: 500,
          }}>
            {t}
            <button onClick={() => onChange(tags.filter(x => x !== t))} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontSize: 14, lineHeight: 1, padding: 0,
              fontFamily: 'inherit',
            }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={add} style={{
          padding: '10px 14px', borderRadius: 8,
          border: '1px solid var(--accent)', color: 'var(--accent)',
          background: 'var(--accent-light)', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
        }}>추가</button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════ */
export default function CreateWizard({ userId, curriculum }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()

  /* ── 편집 모드: duration을 옵션에서 가장 가까운 값으로 매핑 ── */
  const initDuration = (() => {
    const dur = (curriculum as any)?.estimated_duration ?? 0
    if (!dur) return '120'
    const sorted = [...DURATION_OPTIONS].sort((a, b) =>
      Math.abs(parseInt(a.value) - dur) - Math.abs(parseInt(b.value) - dur)
    )
    return sorted[0].value
  })()

  /* ── Form state ── */
  const [wizardStep, setWizardStep] = useState(0)
  const [title, setTitle] = useState(curriculum?.title ?? '')
  const [description, setDescription] = useState(curriculum?.description ?? '')
  const [category, setCategory] = useState(curriculum?.category ?? '')
  const [level, setLevel] = useState<string>(curriculum?.level ?? 'beginner')
  const [durationValue, setDurationValue] = useState(initDuration)
  const [thumbnailUrl, setThumbnailUrl] = useState((curriculum as any)?.thumbnail_url ?? '')
  const [goal, setGoal] = useState(curriculum?.goal ?? '')
  const [learningGoals, setLearningGoals] = useState<string[]>((curriculum as any)?.learning_goals ?? [])
  const [targetAudience, setTargetAudience] = useState<string[]>(curriculum?.target_audience ?? [])
  const [prerequisites, setPrerequisites] = useState<string[]>(curriculum?.prerequisites ?? [])
  const [steps, setSteps] = useState<StepDraft[]>(
    curriculum?.steps?.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description ?? '',
      estimatedDuration: String((s as any).estimated_duration ?? 15),
      resources: s.resources.map(r => ({
        id: r.id, type: r.type, url: r.url, title: r.title ?? '',
      })),
    })) ?? [emptyStep()]
  )
  const [saving, setSaving] = useState(false)

  /* ── Step management ── */
  const addStep = () => setSteps(p => [...p, emptyStep()])
  const removeStep = (id: string) => setSteps(p => p.filter(s => s.id !== id))
  const updateStep = (id: string, field: keyof StepDraft, val: string) =>
    setSteps(p => p.map(s => s.id === id ? { ...s, [field]: val } : s))
  const addResource = (stepId: string) =>
    setSteps(p => p.map(s => s.id === stepId ? { ...s, resources: [...s.resources, emptyResource()] } : s))
  const removeResource = (stepId: string, rId: string) =>
    setSteps(p => p.map(s => s.id === stepId ? { ...s, resources: s.resources.filter(r => r.id !== rId) } : s))
  const updateResource = (stepId: string, rId: string, field: keyof ResourceDraft, val: string) =>
    setSteps(p => p.map(s => s.id === stepId ? {
      ...s,
      resources: s.resources.map(r => r.id === rId ? { ...r, [field]: val } : r),
    } : s))

  /* ── Step 순서 변경 ── */
  const moveStep = (idx: number, dir: 'up' | 'down') => {
    setSteps(prev => {
      const next = [...prev]
      const target = dir === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  /* ── Validation ── */
  const canProceed = [
    () => title.trim().length >= 2,
    () => true,
    () => steps.length >= 1 && steps.every(s => s.title.trim()),
    () => true,
    () => true,
  ][wizardStep]?.() ?? true

  /* ── Save ── */
  const save = async (publish: boolean) => {
    if (!title.trim()) { showToast('제목을 입력하세요.', 'error'); return }
    if (steps.some(s => !s.title.trim())) { showToast('모든 Step에 제목을 입력하세요.', 'error'); return }
    setSaving(true)
    try {
      let curriculumId = curriculum?.id
      const durVal = parseInt(durationValue) || 0

      // publish 시 slug 자동 생성 (없는 경우만)
      let slug: string | undefined
      if (publish) {
        const existingSlug = (curriculum as any)?.slug
        if (!existingSlug) {
          const base = slugify(title.trim())
          slug = await uniqueSlug(base, async (candidate) => {
            const { data } = await supabase
              .from('curricula').select('id').eq('slug', candidate)
              .neq('id', curriculumId ?? '00000000-0000-0000-0000-000000000000')
              .maybeSingle()
            return !!data
          })
        }
      }

      if (curriculumId) {
        await supabase.from('curricula').update({
          title: title.trim(), description: description.trim() || null,
          goal: goal.trim() || null, level: level as any,
          category: category || null, estimated_duration: durVal,
          thumbnail_url: thumbnailUrl.trim() || null,
          target_audience: targetAudience, prerequisites,
          learning_goals: learningGoals, is_published: publish,
          published_at: publish ? new Date().toISOString() : null,
          ...(slug ? { slug } : {}),
        }).eq('id', curriculumId)
        await supabase.from('steps').delete().eq('curriculum_id', curriculumId)
      } else {
        const { data, error } = await supabase.from('curricula').insert({
          title: title.trim(), description: description.trim() || null,
          goal: goal.trim() || null, level: level as any,
          category: category || null, estimated_duration: durVal,
          thumbnail_url: thumbnailUrl.trim() || null,
          target_audience: targetAudience, prerequisites,
          learning_goals: learningGoals, creator_id: userId,
          is_published: publish,
          published_at: publish ? new Date().toISOString() : null,
          ...(slug ? { slug } : {}),
        }).select().single()
        if (error || !data) throw error
        curriculumId = data.id
      }

      for (let i = 0; i < steps.length; i++) {
        const s = steps[i]
        const { data: newStep } = await supabase.from('steps').insert({
          curriculum_id: curriculumId,
          title: s.title.trim(),
          description: s.description.trim() || null,
          order: i + 1,
          estimated_duration: parseInt(s.estimatedDuration) || null,
        }).select().single()
        if (newStep && s.resources.length > 0) {
          await supabase.from('resources').insert(
            s.resources.filter(r => r.url.trim()).map(r => ({
              step_id: newStep.id, type: r.type,
              url: r.url.trim(), title: r.title.trim() || null,
            }))
          )
        }
      }
      // 이벤트 트래킹
      if (publish) {
        track('curriculum_published', { step_count: steps.length, category }, curriculumId)
      } else if (!curriculum?.id) {
        track('curriculum_draft_created', { step_count: steps.length, category }, curriculumId)
      }
      showToast(publish ? '커리큘럼이 발행되었어요! 🎉' : '초안이 저장되었어요.', 'success')
      router.push(`/curriculum/${curriculumId}`)
    } catch {
      showToast('저장 중 오류가 발생했습니다. 다시 시도해주세요.', 'error')
    } finally {
      setSaving(false)
    }
  }

  /* ── Computed ── */
  const totalDuration = steps.reduce((a, s) => a + (parseInt(s.estimatedDuration) || 0), 0)
  const formatMins = (m: number) => m < 60 ? `${m}분` : `${Math.floor(m / 60)}시간 ${m % 60 > 0 ? `${m % 60}분` : ''}`

  /* ════════ STEP CONTENT ════════ */
  const stepContent = [
    /* Step 0: 기본 정보 */
    <div key="0" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={labelStyle}>커리큘럼 제목 <span style={{ color: 'var(--error)' }}>*</span></label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="예) Claude로 업무 생산성 200% 높이기" maxLength={60}
          style={inputStyle}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }} />
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right', marginTop: 3 }}>{title.length}/60</p>
      </div>
      <div>
        <label style={labelStyle}>한 줄 소개 <span style={{ color: 'var(--error)' }}>*</span></label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="이 커리큘럼을 통해 학습자가 무엇을 배우고 어떤 변화를 얻을 수 있는지 간단히 설명해 주세요."
          rows={3} maxLength={120}
          style={{ ...inputStyle, resize: 'none', lineHeight: '22px' }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }} />
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right', marginTop: 3 }}>{description.length}/120</p>
      </div>
      <div>
        <label style={labelStyle}>카테고리 <span style={{ color: 'var(--error)' }}>*</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '10px', borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
              border: `1.5px solid ${category === c ? 'var(--accent)' : 'var(--border)'}`,
              background: category === c ? 'var(--accent-light)' : '#fff',
              color: category === c ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: category === c ? 700 : 400, cursor: 'pointer',
              transition: 'all 150ms',
            }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>난이도</label>
          {LEVELS.map(l => (
            <label key={l.value} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, marginBottom: 6,
              border: `1.5px solid ${level === l.value ? 'var(--accent)' : 'var(--border)'}`,
              background: level === l.value ? 'var(--accent-light)' : '#fff',
              cursor: 'pointer', transition: 'all 150ms',
            }}>
              <input type="radio" name="level" value={l.value} checked={level === l.value}
                onChange={() => setLevel(l.value)} style={{ accentColor: 'var(--accent)' }} />
              <span style={{ fontSize: 14, fontWeight: level === l.value ? 600 : 400, color: level === l.value ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {l.icon} {l.label}
              </span>
            </label>
          ))}
        </div>
        <div>
          <label style={labelStyle}>예상 학습 시간</label>
          {DURATION_OPTIONS.map(opt => (
            <label key={opt.value} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, marginBottom: 6,
              border: `1.5px solid ${durationValue === opt.value ? 'var(--accent)' : 'var(--border)'}`,
              background: durationValue === opt.value ? 'var(--accent-light)' : '#fff',
              cursor: 'pointer', transition: 'all 150ms',
            }}>
              <input type="radio" name="duration" value={opt.value} checked={durationValue === opt.value}
                onChange={() => setDurationValue(opt.value)} style={{ accentColor: 'var(--accent)' }} />
              <span style={{ fontSize: 13, fontWeight: durationValue === opt.value ? 600 : 400, color: durationValue === opt.value ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>,

    /* Step 1: 학습 목표 */
    <div key="1" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <label style={labelStyle}>한 줄 학습 목표</label>
        <input value={goal} onChange={e => setGoal(e.target.value)}
          placeholder="예) 이 커리큘럼을 마치면 Claude로 실무 문서를 혼자 작성할 수 있어요"
          style={inputStyle}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }} />
      </div>
      <TagInput
        label="이런 걸 배울 수 있어요 (학습 목표 항목)"
        tags={learningGoals}
        onChange={setLearningGoals}
        placeholder="예) 프롬프트 작성 원칙 이해하기"
      />
      <TagInput
        label="이런 분들에게 추천해요"
        tags={targetAudience}
        onChange={setTargetAudience}
        placeholder="예) Claude를 처음 사용해보는 직장인"
      />
      <TagInput
        label="선행 지식 (없으면 비워두세요)"
        tags={prerequisites}
        onChange={setPrerequisites}
        placeholder="예) Python 기초 문법"
      />
    </div>,

    /* Step 2: Step 구성 */
    <div key="2">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
            총 {steps.length}개 Step · {totalDuration > 0 ? `예상 학습 시간: 약 ${formatMins(totalDuration)}` : ''}
          </p>
        </div>
        <button onClick={addStep} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8,
          border: 'none', background: 'var(--accent)', color: '#fff',
          fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          + Step 추가
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((step, idx) => (
          <StepCard
            key={step.id} step={step} idx={idx}
            isOnly={steps.length === 1}
            isFirst={idx === 0} isLast={idx === steps.length - 1}
            onUpdate={updateStep} onRemove={removeStep}
            onMove={moveStep}
            onAddResource={addResource} onRemoveResource={removeResource}
            onUpdateResource={updateResource}
          />
        ))}
      </div>

      <button onClick={addStep} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', marginTop: 12, padding: '14px',
        border: '1.5px dashed var(--border)', borderRadius: 8,
        background: 'var(--surface)', color: 'var(--text-tertiary)',
        cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
        transition: 'border-color 150ms, color 150ms',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--accent)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'
        }}
      >
        <PlusCircleIcon size={16} /> Step 추가하기
      </button>
    </div>,

    /* Step 3: 공개 설정 */
    <div key="3" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <label style={labelStyle}>커리큘럼 썸네일 URL (선택)</label>
        <input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)}
          placeholder="https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg"
          style={inputStyle}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }} />
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 5 }}>
          유튜브 영상 ID를 이용: https://img.youtube.com/vi/<strong>영상ID</strong>/hqdefault.jpg
        </p>
        {thumbnailUrl && (
          <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', maxWidth: 240, aspectRatio: '16/9', background: 'var(--surface)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnailUrl} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>

      {/* 발행 체크리스트 */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>발행 전 체크리스트</p>
        {[
          { label: '제목이 입력됐어요', ok: title.trim().length >= 2 },
          { label: '카테고리가 선택됐어요', ok: !!category },
          { label: 'Step이 1개 이상이에요', ok: steps.length >= 1 },
          { label: '모든 Step에 제목이 있어요', ok: steps.every(s => s.title.trim()) },
          { label: '한 줄 소개가 작성됐어요', ok: description.trim().length > 0 },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: 999, flexShrink: 0,
              background: item.ok ? 'var(--success)' : 'var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {item.ok && <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M2 5.5l2.5 2.5L9 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>}
            </div>
            <span style={{ fontSize: 14, color: item.ok ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>,

    /* Step 4: 미리보기 */
    <div key="4">
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
        발행 전 최종 상태를 확인하세요.
      </p>
      {/* Preview card */}
      <div style={{
        border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden',
        background: '#fff', maxWidth: 380, marginBottom: 24,
      }}>
        <div style={{
          aspectRatio: '16/9',
          background: 'linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', color: '#fff',
        }}>
          {thumbnailUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />
            : <BookOpenIcon size={28} style={{ color: '#fff' }} />}
        </div>
        <div style={{ padding: 16 }}>
          {category && <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>{category}</p>}
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{title || '(제목 없음)'}</p>
          {description && <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 10 }}>{description}</p>}
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>
            <span>{level === 'beginner' ? '초급' : level === 'intermediate' ? '중급' : '고급'}</span>
            <span>Step {steps.length}개</span>
            {totalDuration > 0 && <span>{formatMins(totalDuration)}</span>}
          </div>
        </div>
      </div>
      {/* Step list preview */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--divider)' }}>
          <p style={{ fontWeight: 700, fontSize: 14 }}>커리큘럼 구성</p>
        </div>
        {steps.map((s, i) => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderBottom: i < steps.length - 1 ? '1px solid var(--divider)' : 'none',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 999, background: 'var(--accent)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <span style={{ fontSize: 14, flex: 1 }}>{s.title || '(제목 없음)'}</span>
            {s.estimatedDuration && (
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{s.estimatedDuration}분</span>
            )}
          </div>
        ))}
      </div>
    </div>,
  ]

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>

      {/* ── Left sidebar: Wizard progress ── */}
      <aside style={{
        width: 260, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        padding: '28px 20px',
        position: 'sticky', top: 56,
        height: 'calc(100vh - 56px)', overflowY: 'auto',
        background: '#fafafa',
      }} className="wizard-sidebar">

        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
          새 커리큘럼 만들기
        </p>

        {WIZARD_STEPS.map((ws, i) => {
          const isDone = i < wizardStep
          const isCurrent = i === wizardStep
          return (
            <button key={i} onClick={() => i < wizardStep && setWizardStep(i)} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              width: '100%', padding: '10px 12px', borderRadius: 8, marginBottom: 4,
              border: 'none', background: isCurrent ? 'var(--accent-light)' : 'transparent',
              cursor: i < wizardStep ? 'pointer' : 'default',
              textAlign: 'left', fontFamily: 'inherit',
              transition: 'background 150ms',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 999, flexShrink: 0, marginTop: 1,
                background: isDone ? 'var(--success)' : isCurrent ? 'var(--accent)' : 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: isDone || isCurrent ? '#fff' : 'var(--text-tertiary)',
              }}>
                {isDone
                  ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : i + 1}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--accent)' : isDone ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                  {ws.label}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>{ws.desc}</p>
              </div>
            </button>
          )
        })}

        {/* Mini card preview */}
        {title && (
          <div style={{ marginTop: 20, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase' }}>미리보기</p>
            <div style={{
              aspectRatio: '16/9', borderRadius: 4, marginBottom: 8,
              background: 'linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)',
              overflow: 'hidden',
            }}>
              {thumbnailUrl && <img src={thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />}
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, lineHeight: '16px' }}>{title}</p>
            {category && <p style={{ fontSize: 11, color: 'var(--accent)', marginTop: 3 }}>{category}</p>}
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0, padding: '40px 48px 80px' }} className="wizard-main">
        <div style={{ maxWidth: 600 }}>
          {/* Step header */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 6, letterSpacing: '0.3px' }}>
              {wizardStep + 1} / {WIZARD_STEPS.length} — {WIZARD_STEPS[wizardStep].label}
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px' }}>
              {[
                '기본 정보를 입력해주세요',
                '학습 목표와 대상을 설정하세요',
                'Step을 구성해보세요',
                '공개 설정을 확인하세요',
                '최종 확인 후 발행하세요',
              ][wizardStep]}
            </h2>
          </div>

          {/* Form content */}
          {stepContent[wizardStep]}

          {/* Navigation */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--divider)',
          }}>
            <button
              onClick={() => wizardStep > 0 && setWizardStep(w => w - 1)}
              disabled={wizardStep === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '12px 20px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: wizardStep === 0 ? 'not-allowed' : 'pointer',
                opacity: wizardStep === 0 ? 0.4 : 1,
                fontSize: 14, fontFamily: 'inherit',
              }}
            >
              ← 이전 단계
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              {wizardStep === WIZARD_STEPS.length - 1 ? (
                <>
                  <button onClick={() => save(false)} disabled={saving} style={{
                    padding: '12px 20px', borderRadius: 8,
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontSize: 14, fontFamily: 'inherit', opacity: saving ? 0.6 : 1,
                  }}>
                    임시 저장
                  </button>
                  <button onClick={() => save(true)} disabled={saving} style={{
                    padding: '11px 24px', borderRadius: 8,
                    border: 'none', background: 'var(--accent)', color: '#fff',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    fontFamily: 'inherit', opacity: saving ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {saving ? '발행 중...' : <><RocketIcon size={16} /> 발행하기</>}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { if (canProceed) setWizardStep(w => w + 1) }}
                  disabled={!canProceed}
                  style={{
                    padding: '11px 24px', borderRadius: 8,
                    border: 'none', background: canProceed ? 'var(--accent)' : 'var(--border)',
                    color: canProceed ? '#fff' : 'var(--text-tertiary)',
                    fontWeight: 700, fontSize: 14,
                    cursor: canProceed ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit', transition: 'all 150ms',
                  }}
                >
                  다음 단계 →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right sidebar: Tips ── */}
      <aside style={{
        width: 260, flexShrink: 0,
        borderLeft: '1px solid var(--border)',
        padding: '28px 20px',
        position: 'sticky', top: 56,
        height: 'calc(100vh - 56px)', overflowY: 'auto',
        background: '#fafafa',
      }} className="wizard-sidebar">

        {/* Tips */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertCircleIcon size={14} style={{ color: 'var(--accent)' }} /> 커리큘럼 구성 팁
          </p>
          {(TIPS[wizardStep] ?? []).map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 18, height: 18, borderRadius: 999, flexShrink: 0, marginTop: 1,
                background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 4.5l2 2L7.5 2" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: '18px' }}>{tip}</p>
            </div>
          ))}
        </div>

        {/* Step flow preview */}
        {wizardStep === 2 && steps.length > 0 && (
          <div>
            <div style={{ height: 1, background: 'var(--divider)', marginBottom: 16 }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              학습 흐름 미리보기
            </p>
            {steps.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                  background: 'var(--accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title || '(제목 없음)'}
                  </p>
                  {s.estimatedDuration && (
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.estimatedDuration}분</p>
                  )}
                </div>
              </div>
            ))}
            {totalDuration > 0 && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--divider)' }}>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'right' }}>
                  총 {formatMins(totalDuration)}
                </p>
              </div>
            )}
          </div>
        )}
      </aside>

      <style>{`
        @media (max-width: 1100px) { .wizard-sidebar:last-child { display: none !important; } }
        @media (max-width: 768px) {
          .wizard-sidebar { display: none !important; }
          .wizard-main { padding: 24px 20px 80px !important; }
        }
      `}</style>
    </div>
  )
}

/* ─── StepCard sub-component ─── */
function StepCard({ step, idx, isOnly, isFirst, isLast, onUpdate, onRemove, onMove, onAddResource, onRemoveResource, onUpdateResource }: {
  step: StepDraft; idx: number; isOnly: boolean; isFirst: boolean; isLast: boolean
  onUpdate: (id: string, f: keyof StepDraft, v: string) => void
  onRemove: (id: string) => void
  onMove: (idx: number, dir: 'up' | 'down') => void
  onAddResource: (stepId: string) => void
  onRemoveResource: (stepId: string, rId: string) => void
  onUpdateResource: (stepId: string, rId: string, f: keyof ResourceDraft, v: string) => void
}) {
  const [expanded, setExpanded] = useState(true)

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 26, height: 26, borderRadius: 4,
    border: `1px solid ${disabled ? 'var(--border)' : 'var(--border)'}`,
    background: 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, color: disabled ? 'var(--border)' : 'var(--text-tertiary)',
    opacity: disabled ? 0.3 : 1,
    padding: 0,
  })

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px',
        background: expanded ? 'var(--surface)' : '#fff',
        borderBottom: expanded ? '1px solid var(--divider)' : 'none',
      }}>
        {/* 순서 변경 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          <button onClick={() => onMove(idx, 'up')} disabled={isFirst} style={btnStyle(isFirst)} title="위로">
            ▲
          </button>
          <button onClick={() => onMove(idx, 'down')} disabled={isLast} style={btnStyle(isLast)} title="아래로">
            ▼
          </button>
        </div>
        <div style={{
          width: 26, height: 26, borderRadius: 999, flexShrink: 0,
          background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
        }}>
          {idx + 1}
        </div>
        <p style={{ flex: 1, fontWeight: step.title ? 600 : 400, fontSize: 14, color: step.title ? 'var(--text-primary)' : 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {step.title || '(제목을 입력해주세요)'}
        </p>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
          background: 'var(--accent-light)', color: 'var(--accent)', flexShrink: 0,
        }}>필수</span>
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          <button onClick={() => setExpanded(e => !e)} style={{
            width: 28, height: 28, borderRadius: 4, border: '1px solid var(--border)',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: 'var(--text-tertiary)',
          }}>
            {expanded ? '∧' : '∨'}
          </button>
          {!isOnly && (
            <button onClick={() => onRemove(step.id)} style={{
              width: 28, height: 28, borderRadius: 4, border: '1px solid #fca5a5',
              background: '#fff1f1', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: 'var(--error)',
            }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ ...{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5, color: 'var(--text-secondary)' } }}>
              Step 제목 *
            </label>
            <input
              value={step.title}
              onChange={e => onUpdate(step.id, 'title', e.target.value)}
              placeholder="이 단계의 주제를 한 문장으로"
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </div>
          <div>
            <label style={{ ...{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 5, color: 'var(--text-secondary)' } }}>
              설명 (선택)
            </label>
            <textarea
              value={step.description}
              onChange={e => onUpdate(step.id, 'description', e.target.value)}
              placeholder="이 단계에서 무엇을 배우나요?"
              rows={2}
              style={{ ...inputStyle, resize: 'none', lineHeight: '22px' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>예상 시간</label>
            <input
              type="number" min={1} max={120}
              value={step.estimatedDuration}
              onChange={e => onUpdate(step.id, 'estimatedDuration', e.target.value)}
              style={{ ...inputStyle, width: 80 }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>분</span>
          </div>

          {/* Resources */}
          {step.resources.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>학습 자료</label>
              {step.resources.map(r => (
                <div key={r.id} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={r.type} onChange={e => onUpdateResource(step.id, r.id, 'type', e.target.value)}
                    style={{ ...inputStyle, width: 80, flexShrink: 0 }}>
                    <option value="video">영상</option>
                    <option value="article">글</option>
                    <option value="github">GitHub</option>
                    <option value="other">기타</option>
                  </select>
                  <input value={r.url} onChange={e => onUpdateResource(step.id, r.id, 'url', e.target.value)}
                    placeholder="URL" style={{ ...inputStyle, flex: 1, minWidth: 120 }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }} />
                  <input value={r.title} onChange={e => onUpdateResource(step.id, r.id, 'title', e.target.value)}
                    placeholder="제목" style={{ ...inputStyle, flex: 1, minWidth: 80 }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }} />
                  <button onClick={() => onRemoveResource(step.id, r.id)} style={{
                    width: 28, height: 28, borderRadius: 4, border: '1px solid var(--border)',
                    background: 'transparent', cursor: 'pointer',
                    color: 'var(--text-tertiary)', fontSize: 14, flexShrink: 0,
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => onAddResource(step.id)} style={{
            alignSelf: 'flex-start', padding: '6px 12px',
            borderRadius: 4, border: '1px dashed var(--border)',
            background: 'var(--surface)', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
          }}>
            + 자료 추가
          </button>
        </div>
      )}
    </div>
  )
}
