import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';
import {
  Comment,
  fetchComments,
  postComment,
  deleteComment,
} from '../../services/commentApi';

export interface CommentSectionProps {
  contentType: string;
  contentId: string;
}

// ---- Avatar ---------------------------------------------------------------

function UserAvatar({initial, size = 32}: {initial: string; size?: number}) {
  return (
    <View
      style={[
        avatarStyles.circle,
        {width: size, height: size, borderRadius: size / 2},
      ]}>
      <Text style={[avatarStyles.initial, {fontSize: size * 0.4}]}>
        {initial}
      </Text>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  circle: {
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: '#000',
    fontWeight: '700',
  },
});

// ---- Single comment row ---------------------------------------------------

function CommentRow({
  comment,
  indent,
  onDelete,
  onReply,
}: {
  comment: Comment;
  indent: boolean;
  onDelete: (id: string) => void;
  onReply: (parentId: string, username: string) => void;
}) {
  return (
    <View style={[rowStyles.container, indent && rowStyles.indented]}>
      <UserAvatar initial={comment.userInitial} size={indent ? 26 : 32} />
      <View style={rowStyles.body}>
        <View style={rowStyles.headerRow}>
          <Text style={rowStyles.username}>{comment.username}</Text>
          <Text style={rowStyles.time}>{comment.createdAt}</Text>
        </View>
        <Text style={rowStyles.text}>{comment.body}</Text>
        <View style={rowStyles.actionsRow}>
          <TouchableOpacity
            onPress={() => onReply(comment.id, comment.username)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={rowStyles.replyLabel}>답글</Text>
          </TouchableOpacity>
          {comment.isOwn && (
            <TouchableOpacity
              onPress={() => onDelete(comment.id)}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <MaterialIcons name="delete-outline" size={16} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  indented: {
    paddingLeft: 56,
  },
  body: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  username: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  time: {
    fontSize: 11,
    color: colors.gray,
  },
  text: {
    fontSize: 13,
    color: colors.grayLight,
    lineHeight: 19,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
  },
  replyLabel: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '600',
  },
});

// ---- Main component -------------------------------------------------------

export default function CommentSection({
  contentType,
  contentId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyTarget, setReplyTarget] = useState<{
    parentId: string;
    username: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchComments(contentType, contentId).then(setComments);
  }, [contentType, contentId]);

  const totalCount = comments.reduce(
    (sum, c) => sum + 1 + c.children.length,
    0,
  );

  const handleSubmit = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;

    const newComment = await postComment(
      contentType,
      contentId,
      text,
      replyTarget?.parentId,
    );

    if (replyTarget) {
      setComments(prev =>
        prev.map(c => {
          if (c.id === replyTarget.parentId) {
            return {...c, children: [...c.children, newComment]};
          }
          return c;
        }),
      );
    } else {
      setComments(prev => [...prev, newComment]);
    }

    setInputText('');
    setReplyTarget(null);
  }, [inputText, contentType, contentId, replyTarget]);

  const handleDelete = useCallback(
    async (commentId: string) => {
      Alert.alert('댓글 삭제', '이 댓글을 삭제하시겠습니까?', [
        {text: '취소', style: 'cancel'},
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await deleteComment(contentType, contentId, commentId);
            setComments(prev => {
              // Remove from top-level
              const filtered = prev.filter(c => c.id !== commentId);
              // Remove from children
              return filtered.map(c => ({
                ...c,
                children: c.children.filter(ch => ch.id !== commentId),
              }));
            });
          },
        },
      ]);
    },
    [contentType, contentId],
  );

  const handleReply = useCallback((parentId: string, username: string) => {
    setReplyTarget({parentId, username});
  }, []);

  return (
    <View style={styles.container}>
      {/* Header toggle */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsOpen(prev => !prev)}
        activeOpacity={0.7}>
        <Text style={styles.headerTitle}>댓글 {totalCount}개</Text>
        <MaterialIcons
          name={isOpen ? 'expand-less' : 'expand-more'}
          size={24}
          color={colors.grayLight}
        />
      </TouchableOpacity>

      {isOpen && (
        <View>
          {/* Comment list */}
          {comments.map(comment => (
            <React.Fragment key={comment.id}>
              <CommentRow
                comment={comment}
                indent={false}
                onDelete={handleDelete}
                onReply={handleReply}
              />
              {comment.children.map(child => (
                <CommentRow
                  key={child.id}
                  comment={child}
                  indent
                  onDelete={handleDelete}
                  onReply={handleReply}
                />
              ))}
            </React.Fragment>
          ))}

          {/* Input */}
          <View style={styles.inputContainer}>
            {replyTarget && (
              <View style={styles.replyBanner}>
                <Text style={styles.replyBannerText}>
                  @{replyTarget.username} 에게 답글
                </Text>
                <TouchableOpacity onPress={() => setReplyTarget(null)}>
                  <MaterialIcons name="close" size={16} color={colors.gray} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="댓글 작성"
                placeholderTextColor={colors.gray}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!inputText.trim()}>
                <MaterialIcons
                  name="send"
                  size={20}
                  color={inputText.trim() ? '#000' : colors.gray}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.grayDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  inputContainer: {
    borderTopWidth: 0.5,
    borderTopColor: colors.grayDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  replyBannerText: {
    fontSize: 12,
    color: colors.green,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.white,
    maxHeight: 80,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.grayDark,
  },
});
