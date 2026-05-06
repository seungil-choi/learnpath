'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify, uniqueSlug } from '@/lib/slugify'
import type { CurriculumDetail } from '@/lib/supabase/types'

interface StepDraft {
  id: string
  title: string
  description: string
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

const CATEGORIES = ['AI·자동화', '프로그래밍', '디자인', '비즈니스', '생산성', '기타']
const LEVELS = [
  { value: 'beginner', label: '입문' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
]

function uid() {
  return Math.random().toString(36).slice(2)
}

function emptyStep(): StepDraft {
  return { id: uid(), title: '', description: '', resources: [] }
}

function emptyResource(): ResourceDraft {
  return { id: uid(), type: 'article', url: '', title: '' }
}

export default function CurriculumEditor({ userId, curriculum }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(curriculum?.title ?? '')
  const [description, setDescription] = useState(curriculum?.description ?? '')
  const [goal, setGoal] = useState(curriculum?.goal ?? '')
  const [level, setLevel] = useState<string>(curriculum?.level ?? 'beginner')
  const [category, setCategory] = useState(curriculum?.category ?? '')
  const [duration, setDuration] = useState(curriculum?.estimated_duration?.toString() ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState((curriculum as any)?.thumbnail_url ?? '')
  const [steps, setSteps] = useState<StepDraft[]>(
    curriculum?.steps?.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description ?? '',
      resources: s.resources.map(r => ({
        id: r.id,
        type: r.type,
        url: r.url,
        title: r.title ?? '',
      })),
    })) ?? [emptyStep()]
  )
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const addStep = () => setSteps(prev => [...prev, emptyStep()])

  const removeStep = (stepId: string) => {
    setSteps(prev => prev.filter(s => s.id !== stepId))
  }

  const updateStep = (stepId: string, field: keyof StepDraft, value: string) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, [field]: value } : s))
  }

  const addResource = (stepId: string) => {
    setSteps(prev => prev.map(s =>
      s.id === stepId ? { ...s, resources: [...s.resources, emptyResource()] } : s
    ))
  }

  const removeResource = (stepId: string, resourceId: string) => {
    setSteps(prev => prev.map(s =>
      s.id === stepId ? { ...s, resources: s.resources.filter(r => r.id !== resourceId) } : s
    ))
  }

  const updateResource = (stepId: string, resourceId: string, field: keyof ResourceDraft, value: string) => {
    setSteps(prev => prev.map(s =>
      s.id === stepId ? {
        ...s,
        resources: s.resources.map(r => r.id === resourceId ? { ...r, [field]: value } : r)
      } : s
    ))
  }

  const save = async (publish: boolean) => {
    if (!title.trim()) { alert('제목을 입력하세요.'); return }
    if (steps.some(s => !s.title.trim())) { alert('모든 Step에 제목을 입력하세요.'); return }

    publish ? setPublishing(true) : setSaving(true)

    try {
      let curriculumId = curriculum?.id

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
        // Update
        await supabase.from('curricula').update({
          title: title.trim(),
          description: description.trim() || null,
          goal: goal.trim() || null,
          level: level as any,
          category: category || null,
          estimated_duration: parseInt(duration) || 0,
          thumbnail_url: thumbnailUrl.trim() || null,
          is_published: publish,
          ...(slug ? { slug } : {}),
        }).eq('id', curriculumId)

        // Delete old steps (cascade deletes resources)
        await supabase.from('steps').delete().eq('curriculum_id', curriculumId)
      } else {
        // Create
        const { data, error } = await supabase.from('curricula').insert({
          title: title.trim(),
          description: description.trim() || null,
          goal: goal.trim() || null,
          level: level as any,
          category: category || null,
          estimated_duration: parseInt(duration) || 0,
          thumbnail_url: thumbnailUrl.trim() || null,
          creator_id: userId,
          is_published: publish,
          ...(slug ? { slug } : {}),
        }).select().single()

        if (error || !data) throw error
        curriculumId = data.id
      }

      // Insert steps + resources
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        const { data: newStep } = await supabase.from('steps').insert({
          curriculum_id: curriculumId,
          title: step.title.trim(),
          description: step.description.trim() || null,
          order: i + 1,
        }).select().single()

        if (newStep && step.resources.length > 0) {
          await supabase.from('resources').insert(
            step.resources
              .filter(r => r.url.trim())
              .map(r => ({
                step_id: newStep.id,
                type: r.type,
                url: r.url.trim(),
                title: r.title.trim() || null,
              }))
          )
        }
      }

      router.push(`/curriculum/${curriculumId}`)
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
      setPublishing(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    background: 'var(--background)',
    color: 'var(--text-primary)',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    color: 'var(--text-primary)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Basic Info */}
      <section style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ marginBottom: 20, fontSize: 16 }}>기본 정보</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>제목 *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="어떤 것을 배우는 커리큘럼인가요?" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>설명</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="커리큘럼을 간단히 소개해주세요"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '22px' }} />
          </div>
          <div>
            <label style={labelStyle}>학습 목표</label>
            <input value={goal} onChange={e => setGoal(e.target.value)}
              placeholder="이 커리큘럼을 마치면 무엇을 할 수 있나요?" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>썸네일 이미지 URL</label>
            <input
              value={thumbnailUrl}
              onChange={e => setThumbnailUrl(e.target.value)}
              placeholder="https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg"
              style={inputStyle}
            />
            {thumbnailUrl && (
              <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', maxWidth: 320, aspectRatio: '16/9', background: 'var(--surface)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbnailUrl} alt="썸네일 미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 5 }}>
              YouTube 영상 URL을 추가하면 자동으로 썸네일을 가져올 수 있어요: https://img.youtube.com/vi/<strong>영상ID</strong>/hqdefault.jpg
            </p>
          </div>

          <div className="editor-meta-grid">
            <div>
              <label style={labelStyle}>난이도</label>
              <select value={level} onChange={e => setLevel(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>카테고리</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">선택</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>예상 시간 (분)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                placeholder="60" style={inputStyle} min={0} />
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16 }}>Step 구성 ({steps.length}개)</h3>
          <button onClick={addStep} style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            background: '#eff6ff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'inherit',
          }}>
            + Step 추가
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {steps.map((step, idx) => (
            <div key={step.id} style={{
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)' }}>
                  Step {idx + 1}
                </span>
                {steps.length > 1 && (
                  <button onClick={() => removeStep(step.id)} style={{
                    fontSize: 12,
                    color: 'var(--error)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}>삭제</button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  value={step.title}
                  onChange={e => updateStep(step.id, 'title', e.target.value)}
                  placeholder="Step 제목 *"
                  style={inputStyle}
                />
                <textarea
                  value={step.description}
                  onChange={e => updateStep(step.id, 'description', e.target.value)}
                  placeholder="이 단계에서 무엇을 배우나요? (선택)"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '22px' }}
                />

                {/* Resources */}
                {step.resources.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    {step.resources.map(resource => (
                      <div key={resource.id} className="resource-row">
                        <select
                          value={resource.type}
                          onChange={e => updateResource(step.id, resource.id, 'type', e.target.value)}
                          style={{ ...inputStyle, minWidth: 90, width: 'auto' }}
                        >
                          <option value="article">글</option>
                          <option value="video">영상</option>
                          <option value="github">GitHub</option>
                          <option value="other">기타</option>
                        </select>
                        <input
                          value={resource.url}
                          onChange={e => updateResource(step.id, resource.id, 'url', e.target.value)}
                          placeholder="URL"
                          style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                        />
                        <input
                          value={resource.title}
                          onChange={e => updateResource(step.id, resource.id, 'title', e.target.value)}
                          placeholder="제목 (선택)"
                          style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                        />
                        <button onClick={() => removeResource(step.id, resource.id)} style={{
                          padding: '10px',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-tertiary)',
                          fontSize: 16,
                          flexShrink: 0,
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={() => addResource(step.id)} style={{
                  padding: '7px 12px',
                  borderRadius: 6,
                  border: '1px dashed var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  alignSelf: 'flex-start',
                }}>
                  + 자료 추가
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingBottom: 40 }}>
        <button
          onClick={() => save(false)}
          disabled={saving || publishing}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 14,
            fontFamily: 'inherit',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? '저장 중...' : '임시 저장'}
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving || publishing}
          style={{
            padding: '10px 24px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'inherit',
            opacity: publishing ? 0.6 : 1,
          }}
        >
          {publishing ? '발행 중...' : '발행하기'}
        </button>
      </div>
    </div>
  )
}
