import { useState } from 'react';
import { View, Image, TouchableOpacity, Text, ScrollView, Modal, Dimensions } from 'react-native';

interface NewsImageGalleryProps {
  images: string[];
  maxDisplay?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function NewsImageGallery({ images, maxDisplay = 4 }: NewsImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  if (images.length === 0) return null;

  // Single image - full width
  if (images.length === 1) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setSelectedImage(images[0])} activeOpacity={0.9}>
          <Image source={{ uri: images[0] }} style={styles.singleImage} resizeMode="cover" />
        </TouchableOpacity>
        <ImageViewer
          visible={selectedImage !== null}
          imageUri={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      </View>
    );
  }

  // Two images - side by side
  if (images.length === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.twoImageContainer}>
          {displayImages.map((imageUrl, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedImage(imageUrl)}
              activeOpacity={0.9}
              style={styles.twoImageItem}
            >
              <Image source={{ uri: imageUrl }} style={styles.twoImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
        <ImageViewer
          visible={selectedImage !== null}
          imageUri={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      </View>
    );
  }

  // Three images - first large, two small below
  if (images.length === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.gridContainer}>
          <TouchableOpacity
            onPress={() => setSelectedImage(images[0])}
            activeOpacity={0.9}
            style={styles.gridItemLarge}
          >
            <Image source={{ uri: images[0] }} style={styles.gridImage} resizeMode="cover" />
          </TouchableOpacity>
          <View style={styles.twoImageRow}>
            {images.slice(1, 3).map((imageUrl, index) => (
              <TouchableOpacity
                key={index + 1}
                onPress={() => setSelectedImage(imageUrl)}
                activeOpacity={0.9}
                style={styles.gridItemSmall}
              >
                <Image source={{ uri: imageUrl }} style={styles.gridImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <ImageViewer
          visible={selectedImage !== null}
          imageUri={selectedImage}
          images={images}
          initialIndex={images.findIndex((img) => img === selectedImage)}
          onClose={() => setSelectedImage(null)}
        />
      </View>
    );
  }

  // Four or more images - 2x2 grid
  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {displayImages.map((imageUrl, index) => {
          const isLast = index === maxDisplay - 1;
          const showOverlay = isLast && remainingCount > 0;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedImage(imageUrl)}
              activeOpacity={0.9}
              style={styles.gridItemSmall}
            >
              <Image source={{ uri: imageUrl }} style={styles.gridImage} resizeMode="cover" />
              {showOverlay && (
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>+{remainingCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <ImageViewer
        visible={selectedImage !== null}
        imageUri={selectedImage}
        images={images}
        initialIndex={images.findIndex((img) => img === selectedImage)}
        onClose={() => setSelectedImage(null)}
      />
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
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const imageList = images || (imageUri ? [imageUri] : []);

  if (!visible || !imageUri) return null;

  const currentImage = images ? images[currentIndex] : imageUri;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        {images && images.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonLeft]}
              onPress={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonRight]}
              onPress={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentIndex + 1} / {images.length}
              </Text>
            </View>
          </>
        )}

        <ScrollView
          maximumZoomScale={3}
          minimumZoomScale={1}
          contentContainerStyle={styles.scrollContent}
        >
          <Image source={{ uri: currentImage }} style={styles.fullImage} resizeMode="contain" />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = {
  container: {
    marginVertical: 12,
  },
  singleImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  twoImageContainer: {
    flexDirection: 'row' as const,
    gap: 4,
  },
  twoImageItem: {
    flex: 1,
  },
  twoImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  gridContainer: {
    gap: 4,
  },
  twoImageRow: {
    flexDirection: 'row' as const,
    gap: 4,
  },
  gridItemLarge: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden' as const,
    backgroundColor: '#f1f5f9',
    marginBottom: 4,
  },
  gridItemSmall: {
    width: '48%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden' as const,
    backgroundColor: '#f1f5f9',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  overlayText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700' as const,
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
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
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
  imageCounter: {
    position: 'absolute' as const,
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
};

