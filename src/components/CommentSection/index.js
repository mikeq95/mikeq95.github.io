import React, { useState, useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import styles from './styles.module.css';

const MAX_LEN = 2000;

function timeAgo(dateStr, isEn) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return isEn ? 'just now' : '刚刚';
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return isEn ? `${m}m ago` : `${m}分钟前`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return isEn ? `${h}h ago` : `${h}小时前`;
  }
  const d = Math.floor(diff / 86400);
  return isEn ? `${d}d ago` : `${d}天前`;
}

function Avatar({ user, size = 36 }) {
  const url = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '?';
  if (url) {
    return <img src={url} alt={name} className={styles.avatar} style={{ width: size, height: size }} />;
  }
  return (
    <div className={styles.avatarFallback} style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

function CommentSectionInner({ postId }) {
  const { user } = useAuth();
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef(null);

  const t = {
    placeholder: isEn ? 'Add a comment...' : '写下你的评论...',
    post: isEn ? 'Post' : '发布',
    posting: isEn ? 'Posting...' : '发布中...',
    loginPrompt: isEn ? 'Login to join the discussion' : '登录后参与评论',
    login: isEn ? 'Login' : '登录',
    noComments: isEn ? 'No comments yet. Be the first!' : '还没有评论，来第一个吧！',
    delete: isEn ? 'Delete' : '删除',
    comments: isEn ? 'Comments' : '评论',
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('id, content, created_at, user_id, user_name, user_avatar')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    setComments(data ?? []);
    setLoading(false);
  };

  const submit = async () => {
    if (!content.trim() || !user || submitting) return;
    setSubmitting(true);
    const meta = user.user_metadata ?? {};
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
      user_name: meta.full_name || meta.name || meta.user_name || user.email,
      user_avatar: meta.avatar_url ?? null,
    });
    if (!error) {
      setContent('');
      await fetchComments();
    }
    setSubmitting(false);
  };

  const deleteComment = async (id) => {
    await supabase.from('comments').delete().eq('id', id);
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const triggerLogin = () => {
    document.querySelector('[data-auth-trigger]')?.click();
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>{t.comments}</span>
        {!loading && <span className={styles.count}>{comments.length}</span>}
      </div>

      {user ? (
        <div className={styles.inputRow}>
          <Avatar user={user} size={36} />
          <div className={styles.inputBox}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder={t.placeholder}
              value={content}
              onChange={e => setContent(e.target.value.slice(0, MAX_LEN))}
              onKeyDown={handleKeyDown}
              rows={1}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            {content.length > 0 && (
              <div className={styles.inputFooter}>
                <span className={`${styles.charCount} ${content.length > MAX_LEN * 0.9 ? styles.charWarn : ''}`}>
                  {MAX_LEN - content.length}
                </span>
                <button
                  className={styles.submitBtn}
                  onClick={submit}
                  disabled={!content.trim() || submitting}
                >
                  {submitting ? t.posting : t.post}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.loginPrompt}>
          <span>{t.loginPrompt}</span>
          <button className={styles.loginBtn} onClick={triggerLogin}>{t.login}</button>
        </div>
      )}

      <div className={styles.list}>
        {loading ? null : comments.length === 0 ? (
          <p className={styles.empty}>{t.noComments}</p>
        ) : (
          comments.map(c => {
            const name = c.user_name || (isEn ? 'User' : '用户');
            const avatarUrl = c.user_avatar;
            const isOwn = user?.id === c.user_id;

            return (
              <div key={c.id} className={styles.comment}>
                <div className={styles.commentAvatar}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt={name} className={styles.avatar} style={{ width: 36, height: 36 }} />
                    : <div className={styles.avatarFallback} style={{ width: 36, height: 36, fontSize: 14 }}>{name[0]?.toUpperCase()}</div>
                  }
                </div>
                <div className={styles.commentBody}>
                  <div className={styles.commentMeta}>
                    <span className={styles.commentName}>{name}</span>
                    <span className={styles.commentTime}>{timeAgo(c.created_at, isEn)}</span>
                    {isOwn && (
                      <button className={styles.deleteBtn} onClick={() => deleteComment(c.id)}>
                        {t.delete}
                      </button>
                    )}
                  </div>
                  <p className={styles.commentContent}>{c.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ postId }) {
  return (
    <BrowserOnly fallback={null}>
      {() => <CommentSectionInner postId={postId} />}
    </BrowserOnly>
  );
}
