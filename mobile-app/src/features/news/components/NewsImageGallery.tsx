import React, { useState, useRef, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, ScrollView, Modal, Dimensions, NativeScrollEvent, NativeSyntheticEvent, Platform } from 'react-native';
import { colors } from '../../../config/colors';

interface NewsImageGalleryProps {
  images: string[];
  maxDisplay?: number;
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Convert Google Drive sharing links to direct image URLs
const convertGoogleDriveLink = (url: string): string => {
  if (!url || typeof url !== 'string') return url;
  
  // Match Google Drive sharing link format: https://drive.google.com/file/d/FILE_ID/view
  // Also handles: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Also handle shortened Google Drive links
  const shortMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (shortMatch) {
    const fileId = shortMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  // Handle direct file ID in URL
  const directIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (directIdMatch && url.includes('drive.google.com')) {
    const fileId = directIdMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  return url; // Return as-is if not a Google Drive link
};

export function NewsImageGallery({ images, maxDisplay = 4, height = 400 }: NewsImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Validate and filter images
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }

  // Filter out invalid images and convert Google Drive links
  const convertedImages = images
    .filter((img) => img && typeof img === 'string' && img.trim().length > 0)
    .map(convertGoogleDriveLink)
    .filter((img) => img && typeof img === 'string' && img.trim().length > 0);

  if (convertedImages.length === 0) return null;

  // Single image - Instagram-style card (expansion disabled)
  if (convertedImages.length === 1) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.imageWrapper}>
          <Image 
            source={{ uri: convertedImages[0] }} 
            style={[styles.singleImage, { height }]} 
            resizeMode="cover"
            onError={(error) => {
              console.error('Single image load error:', error.nativeEvent.error, convertedImages[0]);
            }}
            onLoadStart={() => {
              console.log('Loading image:', convertedImages[0]);
            }}
          />
        </View>
      </View>
    );
  }

  // Multiple images - Instagram-style carousel card
  const carouselWidth = SCREEN_WIDTH - 48; // Account for container padding (24 on each side)
  
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / carouselWidth);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardContent}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.carousel}
          decelerationRate="fast"
          snapToInterval={carouselWidth}
          snapToAlignment="center"
        >
          {convertedImages.map((imageUrl, index) => (
            <View
              key={index}
              style={[styles.carouselItem, { width: carouselWidth }]}
            >
              <Image 
                source={{ uri: imageUrl }} 
                style={[styles.carouselImage, { height }]} 
                resizeMode="cover"
                onError={(error) => {
                  console.error('Carousel image load error:', error.nativeEvent.error, imageUrl);
                }}
              />
            </View>
          ))}
        </ScrollView>
        
        {/* Image counter - Instagram style */}
        {convertedImages.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentIndex + 1} / {convertedImages.length}
            </Text>
          </View>
        )}

        {/* Pagination dots - Instagram style */}
        {convertedImages.length > 1 && (
          <View style={styles.pagination}>
            {convertedImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

interface ImageViewerProps {
  visible: boolean;
  imageUri: string | null;
  images?: string[];
  initialIndex?: number;
  onClose: () => void;
}

function ImageViewer({ visible, imageUri, images, initialIndex = 0, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const horizontalScrollRef = useRef<ScrollView>(null);
  const zoomScrollRefs = useRef<{ [key: number]: ScrollView | null }>({});

  // Validate inputs
  if (!visible || !imageUri) return null;
  
  // Ensure images array is valid and filter out invalid URLs
  let validImages: string[] = [];
  if (images && Array.isArray(images) && images.length > 0) {
    validImages = images.filter((img) => img && typeof img === 'string' && img.trim().length > 0);
  }
  if (validImages.length === 0 && imageUri && typeof imageUri === 'string' && imageUri.trim().length > 0) {
    validImages = [imageUri];
  }
  
  if (validImages.length === 0) {
    console.warn('ImageViewer: No valid images provided');
    return null;
  }
  
  const safeInitialIndex = Math.max(0, Math.min(initialIndex || 0, validImages.length - 1));

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    try {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollPosition / SCREEN_WIDTH);
      if (index >= 0 && index < validImages.length) {
        setCurrentIndex(index);
      }
    } catch (error) {
      console.error('Error handling scroll:', error);
    }
  };

  // Reset to initial index when modal opens and clear errors
  useEffect(() => {
    if (visible) {
      setImageErrors(new Set()); // Clear errors when modal opens
      if (validImages.length > 1 && horizontalScrollRef.current) {
        const safeIndex = Math.max(0, Math.min(safeInitialIndex, validImages.length - 1));
        setCurrentIndex(safeIndex);
        setTimeout(() => {
          try {
            horizontalScrollRef.current?.scrollTo({ x: safeIndex * SCREEN_WIDTH, animated: false });
          } catch (error) {
            console.error('Error scrolling to initial index:', error);
          }
        }, 100);
      } else if (validImages.length === 1) {
        setCurrentIndex(0);
      }
    }
  }, [visible, safeInitialIndex, validImages.length]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        {validImages.length > 1 ? (
          <>
            <ScrollView
              ref={horizontalScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.modalCarousel}
              scrollEnabled={true}
            >
              {validImages.map((imageUrl, index) => {
                if (!imageUrl || typeof imageUrl !== 'string') return null;
                return (
                  <View key={`img-${index}`} style={styles.modalImageContainer}>
                    <ScrollView
                      ref={(ref) => {
                        if (ref) zoomScrollRefs.current[index] = ref;
                      }}
                      maximumZoomScale={3}
                      minimumZoomScale={1}
                      contentContainerStyle={styles.modalScrollContent}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                    >
                      {!imageErrors.has(index) ? (
                        <Image 
                          source={{ uri: imageUrl }} 
                          style={styles.fullImage} 
                          resizeMode="contain"
                          onError={(error) => {
                            console.error('Image load error in viewer:', error.nativeEvent.error, imageUrl);
                            setImageErrors((prev) => new Set(prev).add(index));
                          }}
                        />
                      ) : (
                        <View style={styles.errorContainer}>
                          <Text style={styles.errorText}>Failed to load image</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                );
              })}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonLeft]}
              onPress={() => {
                try {
                  const newIndex = currentIndex > 0 ? currentIndex - 1 : validImages.length - 1;
                  horizontalScrollRef.current?.scrollTo({ x: newIndex * SCREEN_WIDTH, animated: true });
                  setCurrentIndex(newIndex);
                } catch (error) {
                  console.error('Error navigating left:', error);
                }
              }}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonRight]}
              onPress={() => {
                try {
                  const newIndex = currentIndex < validImages.length - 1 ? currentIndex + 1 : 0;
                  horizontalScrollRef.current?.scrollTo({ x: newIndex * SCREEN_WIDTH, animated: true });
                  setCurrentIndex(newIndex);
                } catch (error) {
                  console.error('Error navigating right:', error);
                }
              }}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
            
            <View style={styles.modalImageCounter}>
              <Text style={styles.modalImageCounterText}>
                {currentIndex + 1} / {validImages.length}
              </Text>
            </View>
          </>
        ) : (
          <ScrollView
            maximumZoomScale={3}
            minimumZoomScale={1}
            contentContainerStyle={styles.scrollContent}
          >
            {!imageErrors.has(0) ? (
              <Image 
                source={{ uri: imageUri }} 
                style={styles.fullImage} 
                resizeMode="contain"
                onError={(error) => {
                  console.error('Single image load error in viewer:', error.nativeEvent.error, imageUri);
                  setImageErrors((prev) => new Set(prev).add(0));
                }}
              />
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load image</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = {
  cardContainer: {
    marginVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden' as const,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardContent: {
    position: 'relative' as const,
    backgroundColor: '#000',
  },
  imageWrapper: {
    width: '100%',
    backgroundColor: '#000',
  },
  singleImage: {
    width: '100%',
    backgroundColor: '#f1f5f9',
  },
  carousel: {
    backgroundColor: '#000',
  },
  carouselItem: {
    // Width set dynamically in component
  },
  carouselImage: {
    width: '100%',
    backgroundColor: '#f1f5f9',
  },
  pagination: {
    position: 'absolute' as const,
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: 6,
    zIndex: 2,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  imageCounter: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  closeButton: {
    position: 'absolute' as const,
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700' as const,
  },
  scrollContent: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalCarousel: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  modalImageContainer: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalScrollContent: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    width: SCREEN_WIDTH,
    height: '100%',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  modalImageCounter: {
    position: 'absolute' as const,
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
  },
  modalImageCounterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  navButton: {
    position: 'absolute' as const,
    top: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 10,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700' as const,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#1f2937',
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center' as const,
  },
};

