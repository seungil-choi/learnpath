'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { username: string | null } | null
}

interface Props {
  stepId: string
  userId: string | null
  curriculumId: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  return `${Math.floor(h / 24)}일 전`
}

export default function StepComments({ stepId, userId, curriculumId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const supabase = createClient()

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('step_comments')
      .select('*, profiles(username)')
      .eq('step_id', stepId)
      .order('created_at', { ascending: true })
    setComments((data as Comment[]) ?? [])
    setLoading(false)
  }, [stepId, supabase])

  useEffect(() => {
    setLoading(true)
    fetchComments()
  }, [fetchComments])

  const handlePost = async () => {
    if (!text.trim() || !userId) return
    setPosting(true)
    const { error } = await supabase.from('step_comments').insert({
      step_id: stepId,
      user_id: userId,
      content: text.trim(),
    })
    if (!error) {
      setText('')
      await fetchComments()
    }
    setPosting(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('step_comments').delete().eq('id', id)
    setComments(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div style={{ marginTop: 40, borderTop: '1px solid var(--divider)', paddingTop: 32 }}>
      <h3 style={{ fontSize: 16, marginBottom: 20, color: 'var(--text-primary)' }}>
        💬 학습 토론 {comments.length > 0 && <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-tertiary)' }}>({comments.length})</span>}
      </h3>

      {/* Comment input */}
      {userId ? (
        <div style={{ marginBottom: 28 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost()
            }}
            placeholder="이 단계에 대해 질문이나 메모를 남겨보세요 (Cmd+Enter로 제출)"
            rows={3}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              fontSize: 14,
              fontFamily: 'inherit',
              lineHeight: '22px',
              resize: 'vertical',
              outline: 'none',
              background: 'var(--background)',
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handlePost}
              disabled={!text.trim() || posting}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                background: text.trim() ? 'var(--accent)' : 'var(--border)',
                color: text.trim() ? '#fff' : 'var(--text-tertiary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: text.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                transition: 'background 150ms',
              }}
            >
              {posting ? '올리는 중...' : '댓글 달기'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          marginBottom: 24,
          padding: '14px 16px',
          borderRadius: 10,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          fontSize: 13,
          color: 'var(--text-secondary)',
        }}>
          <a
            href={`/auth?next=/curriculum/${curriculumId}/learn`}
            style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
          >
            로그인
          </a>
          하면 학습 토론에 참여할 수 있어요.
        </div>
      )}

      {/* Comment list */}
      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>불러오는 중...</p>
      ) : comments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '32px 0',
          color: 'var(--text-tertiary)',
          fontSize: 13,
        }}>
          아직 댓글이 없어요. 첫 번째로 의견을 남겨보세요!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {comments.map(c => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: 999,
                background: 'var(--accent-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: 'var(--accent)',
                flexShrink: 0,
              }}>
                {(c.profiles?.username?.[0] ?? '?').toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.profiles?.username ?? '익명'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {timeAgo(c.created_at)}
                  </span>
                  {c.user_id === userId && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      style={{
                        marginLeft: 'auto',
                        fontSize: 11,
                        color: 'var(--text-tertiary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        padding: 0,
                      }}
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p style={{
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: '22px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
