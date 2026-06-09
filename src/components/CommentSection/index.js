import React, { useState, useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Icon } from '@iconify/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useAuth } from '@site/src/context/AuthContext';
import { supabase } from '@site/src/lib/supabase';
import styles from './styles.module.css';

const AVATAR_COLORS = [
  '#f97316', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#3b82f6', '#ec4899',
];

function hashAvatarColor(str) {
  let h = 0;
  for (let i = 0; i < (str?.length ?? 0); i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

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
  const bg = hashAvatarColor(user?.id || name);
  return (
    <div className={styles.avatarFallback} style={{ width: size, height: size, fontSize: size * 0.4, background: bg }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

function CommentSectionInner({ postId }) {
  const { user } = useAuth();
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const isEn = currentLocale === 'en';
  const [tree, setTree] = useState([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const textareaRef = useRef(null);

  const t = {
    placeholder: isEn ? 'Add a comment...' : '写下你的评论...',
    replyPlaceholder: isEn ? 'Write a reply...' : '写下你的回复...',
    post: isEn ? 'Post' : '发布',
    posting: isEn ? 'Posting...' : '发布中...',
    reply: isEn ? 'Reply' : '回复',
    cancel: isEn ? 'Cancel' : '取消',
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
      .select('id, content, created_at, user_id, user_name, user_avatar, parent_id')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    const all = data ?? [];
    const roots = all.filter(c => !c.parent_id);
    const replies = all.filter(c => c.parent_id);
    setTree(roots.map(root => ({
      ...root,
      replies: replies.filter(r => r.parent_id === root.id),
    })));
    setLoading(false);
  };

  const submit = async (parentId = null, replyText = null) => {
    const text = parentId ? replyText : content;
    if (!text?.trim() || !user) return;
    if (parentId) setReplySubmitting(true); else setSubmitting(true);

    const meta = user.user_metadata ?? {};
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      content: text.trim(),
      user_name: meta.full_name || meta.name || meta.user_name || user.email,
      user_avatar: meta.avatar_url ?? null,
      parent_id: parentId ?? null,
    });
    if (!error) {
      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setContent('');
      }
      await fetchComments();
    }
    if (parentId) setReplySubmitting(false); else setSubmitting(false);
  };

  const deleteComment = async (id) => {
    await supabase.from('comments').delete().eq('id', id);
    setTree(prev =>
      prev
        .filter(c => c.id !== id)
        .map(c => ({ ...c, replies: c.replies.filter(r => r.id !== id) }))
    );
  };

  const triggerLogin = () => {
    document.querySelector('[data-auth-trigger]')?.click();
  };

  const totalCount = tree.reduce((sum, c) => sum + 1 + c.replies.length, 0);

  const renderComment = (c, isReply = false) => {
    const name = c.user_name || (isEn ? 'User' : '用户');
    const isOwn = user?.id === c.user_id;

    return (
      <div key={c.id} className={isReply ? styles.reply : styles.comment}>
        <div className={styles.commentAvatar}>
          {c.user_avatar
            ? <img src={c.user_avatar} alt={name} className={styles.avatar} style={{ width: isReply ? 28 : 36, height: isReply ? 28 : 36 }} />
            : <div className={styles.avatarFallback} style={{ width: isReply ? 28 : 36, height: isReply ? 28 : 36, fontSize: isReply ? 11 : 14, background: hashAvatarColor(c.user_id || name) }}>{name[0]?.toUpperCase()}</div>
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
          {!isReply && user && (
            <button
              className={styles.replyBtn}
              onClick={() => {
                setReplyingTo(replyingTo === c.id ? null : c.id);
                setReplyContent('');
              }}
            >
              {replyingTo === c.id ? t.cancel : t.reply}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>{t.comments}</span>
        {!loading && <span className={styles.count}>{totalCount}</span>}
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
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(); }}
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
                  onClick={() => submit()}
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
          <Icon icon="mdi:comment-account" className={styles.loginIcon} />
          <span className={styles.loginText}>{t.loginPrompt}</span>
          <button className={styles.loginBtn} onClick={triggerLogin}>{t.login}</button>
        </div>
      )}

      <div className={styles.list}>
        {loading ? null : tree.length === 0 ? (
          <p className={styles.empty}>{t.noComments}</p>
        ) : (
          tree.map(c => (
            <div key={c.id} className={styles.commentThread}>
              {renderComment(c, false)}

              {/* Inline reply form */}
              {replyingTo === c.id && (
                <div className={styles.replyForm}>
                  <Avatar user={user} size={28} />
                  <div className={styles.inputBox}>
                    <textarea
                      className={styles.textarea}
                      placeholder={t.replyPlaceholder}
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value.slice(0, MAX_LEN))}
                      onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(c.id, replyContent); }}
                      rows={1}
                      autoFocus
                      onInput={e => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                    />
                    {replyContent.length > 0 && (
                      <div className={styles.inputFooter}>
                        <span className={`${styles.charCount} ${replyContent.length > MAX_LEN * 0.9 ? styles.charWarn : ''}`}>
                          {MAX_LEN - replyContent.length}
                        </span>
                        <button
                          className={styles.submitBtn}
                          onClick={() => submit(c.id, replyContent)}
                          disabled={!replyContent.trim() || replySubmitting}
                        >
                          {replySubmitting ? t.posting : t.post}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nested replies */}
              {c.replies.length > 0 && (
                <div className={styles.replies}>
                  {c.replies.map(r => renderComment(r, true))}
                </div>
              )}
            </div>
          ))
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
