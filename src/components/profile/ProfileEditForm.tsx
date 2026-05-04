'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  initialUsername: string | null
  initialBio: string | null
}

export default function ProfileEditForm({ userId, initialUsername, initialBio }: Props) {
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(initialUsername ?? '')
  const [bio, setBio] = useState(initialBio ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    if (!username.trim()) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim(), bio: bio.trim() || null })
      .eq('id', userId)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {saved && (
          <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>✓ 저장됨</span>
        )}
        <button
          onClick={() => setEditing(true)}
          style={{
            padding: '6px 14px', borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'border-color 150ms',
          }}
        >
          프로필 편집
        </button>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)', padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32,
        width: '100%', maxWidth: 420,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>프로필 편집</h3>
          <button onClick={() => setEditing(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, color: 'var(--text-tertiary)', fontFamily: 'inherit',
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              사용자 이름 <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="사용자 이름"
              maxLength={30}
              style={{
                width: '100%', padding: '11px 14px',
                borderRadius: 9, border: '1px solid var(--border)',
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
                transition: 'border-color 150ms',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              한 줄 소개 <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(선택)</span>
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="어떤 것을 배우고 있는지, 어떤 분야에 관심이 있는지 알려주세요"
              rows={3}
              maxLength={100}
              style={{
                width: '100%', padding: '11px 14px',
                borderRadius: 9, border: '1px solid var(--border)',
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
                resize: 'none', lineHeight: '22px',
                transition: 'border-color 150ms',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'right', marginTop: 3 }}>
              {bio.length}/100
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={() => setEditing(false)} style={{
            flex: 1, padding: '12px',
            borderRadius: 9, border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)',
            fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
          }}>
            취소
          </button>
          <button onClick={handleSave} disabled={saving || !username.trim()} style={{
            flex: 2, padding: '12px',
            borderRadius: 9, border: 'none',
            background: username.trim() ? 'var(--accent)' : 'var(--border)',
            color: username.trim() ? '#fff' : 'var(--text-tertiary)',
            fontSize: 14, fontWeight: 700, cursor: saving || !username.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
