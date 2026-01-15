import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Author } from '../../../types/models';
import { colors } from '../../../config/colors';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { ThemedText } from '../../../components/ThemedText';

interface PublisherProfileProps {
  author: Author;
  articlesCount: number;
  onFollow?: () => void;
  isFollowing?: boolean;
  activeTab?: 'posts' | 'about';
  onTabChange?: (tab: 'posts' | 'about') => void;
}

export function PublisherProfile({
  author,
  articlesCount,
  onFollow,
  isFollowing = false,
  activeTab: externalActiveTab,
  onTabChange,
}: PublisherProfileProps) {
  const { colors: themeColors, isDark } = useTheme();
  const [internalActiveTab, setInternalActiveTab] = useState<'posts' | 'about'>('posts');
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const activeTab = externalActiveTab ?? internalActiveTab;

  const handleTabChange = (tab: 'posts' | 'about') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // Format numbers for display
  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background.secondary }]}>
      {/* Cover Image Section */}
      <View style={[styles.coverContainer, { backgroundColor: themeColors.primary.main }]}>
        <View style={styles.coverImage}>
          <View style={[styles.coverGradient, { backgroundColor: themeColors.primary.dark }]} />
        </View>

        {/* Profile Picture Overlay */}
        <View style={styles.profilePictureContainer}>
          <View style={[styles.profilePictureBorder, { backgroundColor: themeColors.background.secondary, borderColor: themeColors.background.secondary }]}>
            <TouchableOpacity onPress={() => author.avatarUrl && setIsImageExpanded(true)}>
              <Image
                source={
                  author.avatarUrl
                    ? { uri: author.avatarUrl }
                    : require('../../../../assets/icon.png')
                }
                style={[styles.profilePicture, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Full Screen Image Modal */}
        <Modal
          visible={isImageExpanded}
          transparent={true}
          onRequestClose={() => setIsImageExpanded(false)}
          animationType="fade"
        >
          <TouchableWithoutFeedback onPress={() => setIsImageExpanded(false)}>
            <View style={styles.modalContainer}>
              <Image
                source={
                  author.avatarUrl
                    ? { uri: author.avatarUrl }
                    : require('../../../../assets/icon.png')
                }
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>

      {/* Profile Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.nameSection}>
          <ThemedText style={styles.name}>{author.name}</ThemedText>
          {author.title && (
            <ThemedText style={styles.title}>{author.title}</ThemedText>
          )}
        </View>

        {/* Stats Bar */}
        <View style={[styles.statsBar, { borderColor: themeColors.border.subtle }]}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{formatNumber(articlesCount)}</ThemedText>
            <ThemedText style={styles.statLabel}>Posts</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border.subtle }]} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{formatNumber(author.followers)}</ThemedText>
            <ThemedText style={styles.statLabel}>Followers</ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border.subtle }]} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{formatNumber(author.articlesCount)}</ThemedText>
            <ThemedText style={styles.statLabel}>Articles</ThemedText>
          </View>
        </View>

        {/* Bio Section */}
        {author.bio && (
          <View style={styles.bioSection}>
            <ThemedText style={styles.bio}>{author.bio}</ThemedText>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.followButton,
              { backgroundColor: isFollowing ? (isDark ? '#334155' : '#f1f5f9') : (isDark ? themeColors.secondary.main : themeColors.primary.main) }
            ]}
            onPress={onFollow}
          >
            <ThemedText style={[styles.followButtonText, { color: isFollowing ? themeColors.text.primary : '#fff' }]}>
              {isFollowing ? 'Following' : 'Follow'}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.messageButton, { backgroundColor: themeColors.background.secondary, borderColor: isDark ? themeColors.secondary.main : themeColors.border.subtle }]}>
            <Ionicons name="chatbubble-outline" size={20} color={isDark ? themeColors.secondary.main : themeColors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.moreButton, { backgroundColor: themeColors.background.secondary, borderColor: isDark ? themeColors.secondary.main : themeColors.border.subtle }]}>
            <Ionicons name="ellipsis-horizontal" size={20} color={isDark ? themeColors.secondary.main : themeColors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, { borderColor: themeColors.border.subtle }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && { borderBottomColor: isDark ? themeColors.secondary.main : themeColors.primary.main, borderBottomWidth: 2 }]}
            onPress={() => handleTabChange('posts')}
          >
            <Ionicons
              name={activeTab === 'posts' ? 'grid' : 'grid-outline'}
              size={24}
              color={activeTab === 'posts' ? (isDark ? themeColors.secondary.main : themeColors.primary.main) : themeColors.text.tertiary}
            />
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'posts' && { color: isDark ? themeColors.secondary.main : themeColors.primary.main, fontWeight: '700' },
              ]}
            >
              Posts
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && { borderBottomColor: isDark ? themeColors.secondary.main : themeColors.primary.main, borderBottomWidth: 2 }]}
            onPress={() => handleTabChange('about')}
          >
            <Ionicons
              name={activeTab === 'about' ? 'information-circle' : 'information-circle-outline'}
              size={24}
              color={activeTab === 'about' ? (isDark ? themeColors.secondary.main : themeColors.primary.main) : themeColors.text.tertiary}
            />
            <ThemedText
              style={[
                styles.tabText,
                activeTab === 'about' && { color: isDark ? themeColors.secondary.main : themeColors.primary.main, fontWeight: '700' },
              ]}
            >
              About
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
  },
  coverContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: colors.primary.main,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary.dark,
  },
  coverGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary.dark,
    opacity: 0.8,
  },
  profilePictureContainer: {
    position: 'absolute',
    bottom: -60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  profilePictureBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.background.primary,
    backgroundColor: colors.background.primary,
    padding: 4,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  infoSection: {
    marginTop: 70,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.7,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  bioSection: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  followButton: {
    flex: 1,
    backgroundColor: colors.primary.main,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: colors.neutral.gray[200],
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary.main,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
});

