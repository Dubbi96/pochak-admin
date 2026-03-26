import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {colors} from '../../theme';

interface MatchInfoCardProps {
  title: string;
  round: string;
  broadcastDate: string;
  tags: string[];
  competition: string;
  likeCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onDetailPress?: () => void;
  onBookmarkPress?: () => void;
  onLikePress?: () => void;
  onClipPress?: () => void;
  onSharePress?: () => void;
  onMorePress?: () => void;
}

const MatchInfoCard: React.FC<MatchInfoCardProps> = ({
  title,
  round,
  broadcastDate,
  tags,
  competition,
  likeCount,
  isLiked: externalIsLiked,
  isBookmarked: externalIsBookmarked,
  onDetailPress,
  onBookmarkPress,
  onLikePress,
  onClipPress,
  onSharePress,
  onMorePress,
}) => {
  const [internalIsLiked, setInternalIsLiked] = useState(false);
  const [internalIsBookmarked, setInternalIsBookmarked] = useState(false);

  // Use external state if provided, otherwise fall back to internal
  const isLiked = externalIsLiked ?? internalIsLiked;
  const isBookmarked = externalIsBookmarked ?? internalIsBookmarked;

  const handleLike = () => {
    if (externalIsLiked === undefined) {
      setInternalIsLiked(prev => !prev);
    }
    onLikePress?.();
  };

  const handleBookmark = () => {
    if (externalIsBookmarked === undefined) {
      setInternalIsBookmarked(prev => !prev);
    }
    onBookmarkPress?.();
  };

  return (
    <View style={styles.container}>
      {/* Match title */}
      <Text style={styles.title}>{title}</Text>

      {/* Round, broadcast date, detail link */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>{round}</Text>
        <Text style={styles.infoDivider}>|</Text>
        <Text style={styles.infoText}>{broadcastDate}</Text>
        <TouchableOpacity onPress={onDetailPress} style={styles.detailLink}>
          <Text style={styles.detailLinkText}>상세</Text>
          <MaterialIcons name="chevron-right" size={16} color={colors.green} />
        </TouchableOpacity>
      </View>

      {/* Tags */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagScroll}
        contentContainerStyle={styles.tagContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tagChip}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Competition + Bookmark */}
      <View style={styles.competitionRow}>
        <Text style={styles.competitionText}>{competition}</Text>
        <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkButton}>
          <MaterialIcons
            name={isBookmarked ? 'bookmark' : 'bookmark-border'}
            size={20}
            color={colors.green}
          />
          <Text style={styles.bookmarkLabel}>즐겨찾기</Text>
        </TouchableOpacity>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? colors.green : colors.white}
          />
          <Text style={[styles.actionLabel, isLiked && styles.actionLabelActive]}>
            좋아요 {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onClipPress}>
          <MaterialIcons name="content-cut" size={20} color={colors.white} />
          <Text style={styles.actionLabel}>클립</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onSharePress}>
          <MaterialIcons name="share" size={20} color={colors.white} />
          <Text style={styles.actionLabel}>공유</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onMorePress}>
          <MaterialIcons name="more-horiz" size={20} color={colors.white} />
          <Text style={styles.actionLabel}>더보기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: colors.grayLight,
  },
  infoDivider: {
    fontSize: 13,
    color: colors.grayDark,
    marginHorizontal: 8,
  },
  detailLink: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.grayDark,
    borderRadius: 4,
  },
  detailLinkText: {
    fontSize: 12,
    color: colors.green,
    fontWeight: '600',
  },
  tagScroll: {
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00CC33',
    marginRight: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#00CC33',
  },
  competitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  competitionText: {
    fontSize: 14,
    color: colors.grayLight,
    fontWeight: '500',
  },
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookmarkLabel: {
    fontSize: 12,
    color: colors.grayLight,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.grayDark,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    fontSize: 11,
    color: colors.grayLight,
  },
  actionLabelActive: {
    color: colors.green,
  },
});

export default MatchInfoCard;
