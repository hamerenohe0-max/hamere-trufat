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
    <View style={styles.container}>
      {/* Cover Image Section */}
      <View style={styles.coverContainer}>
        <View style={styles.coverImage}>
          <View style={styles.coverGradient} />
        </View>

        {/* Profile Picture Overlay */}
        <View style={styles.profilePictureContainer}>
          <View style={styles.profilePictureBorder}>
            <TouchableOpacity onPress={() => author.avatarUrl && setIsImageExpanded(true)}>
              <Image
                source={
                  author.avatarUrl
                    ? { uri: author.avatarUrl }
                    : require('../../../../assets/icon.png')
                }
                style={styles.profilePicture}
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
          <Text style={styles.name}>{author.name}</Text>
          {author.title && (
            <Text style={styles.title}>{author.title}</Text>
          )}
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(articlesCount)}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(author.followers)}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(author.articlesCount)}</Text>
            <Text style={styles.statLabel}>Articles</Text>
          </View>
        </View>

        {/* Bio Section */}
        {author.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.bio}>{author.bio}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={onFollow}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => handleTabChange('posts')}
          >
            <Ionicons
              name={activeTab === 'posts' ? 'grid' : 'grid-outline'}
              size={24}
              color={activeTab === 'posts' ? colors.primary.main : colors.text.tertiary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'posts' && styles.activeTabText,
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => handleTabChange('about')}
          >
            <Ionicons
              name={activeTab === 'about' ? 'information-circle' : 'information-circle-outline'}
              size={24}
              color={activeTab === 'about' ? colors.primary.main : colors.text.tertiary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'about' && styles.activeTabText,
              ]}
            >
              About
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
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
    backgroundColor: colors.neutral.gray[200],
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
    color: colors.text.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border.light,
  },
  bioSection: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  bio: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
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
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  followingButtonText: {
    color: colors.text.primary,
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  moreButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: colors.border.light,
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
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary.main,
    fontWeight: '600',
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

