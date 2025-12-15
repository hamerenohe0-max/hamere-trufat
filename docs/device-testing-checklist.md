# Device Testing Checklist

## Android Phone Testing

### Setup
1. Enable Developer Options
2. Enable USB Debugging
3. Connect device via USB
4. Run `npm run android`

### Test Devices
- **Pixel 6** (Android 13) - Primary test device
- **Samsung Galaxy S21** (Android 12) - Secondary
- **OnePlus 9** (Android 11) - Legacy support

### Test Checklist

#### Installation
- [ ] App installs from APK
- [ ] App installs from Play Store (when available)
- [ ] App updates correctly
- [ ] App uninstalls cleanly

#### Launch & Performance
- [ ] App launches in < 3 seconds
- [ ] No crashes on launch
- [ ] Smooth animations (60fps)
- [ ] Memory usage reasonable (< 200MB idle)

#### Authentication
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Password reset works
- [ ] OTP verification works
- [ ] Guest mode works

#### Navigation
- [ ] Bottom tabs work
- [ ] Drawer navigation works
- [ ] Back button works
- [ ] Deep linking works

#### Content Screens
- [ ] Home dashboard loads
- [ ] News list scrolls smoothly
- [ ] News detail displays correctly
- [ ] Articles load correctly
- [ ] Daily readings display
- [ ] Feasts calendar works
- [ ] Events list works
- [ ] Progress reports display

#### Interactions
- [ ] Comments can be added
- [ ] Likes/dislikes work
- [ ] Bookmarks save
- [ ] Share functionality works
- [ ] Translation works
- [ ] Audio player works

#### Offline Mode
- [ ] App works in airplane mode
- [ ] Cached content loads
- [ ] Offline banner shows
- [ ] Actions queue correctly
- [ ] Sync works when reconnected

#### Notifications
- [ ] Push notifications received
- [ ] Notifications open app
- [ ] Notification badges work
- [ ] Notification sounds play

#### Permissions
- [ ] Camera permission (if needed)
- [ ] Storage permission
- [ ] Location permission (if needed)
- [ ] Notification permission

## iPhone Testing

### Setup
1. Install Xcode
2. Connect iPhone via USB
3. Trust computer on iPhone
4. Run `npm run ios`

### Test Devices
- **iPhone 14 Pro** (iOS 17) - Primary
- **iPhone 12** (iOS 15) - Secondary
- **iPhone SE** (iOS 14) - Legacy

### Test Checklist

#### Installation
- [ ] App installs via Xcode
- [ ] App installs from TestFlight
- [ ] App installs from App Store (when available)
- [ ] App updates correctly

#### Launch & Performance
- [ ] App launches in < 3 seconds
- [ ] No crashes on launch
- [ ] Smooth animations (60fps)
- [ ] Memory usage reasonable

#### Authentication
- [ ] Registration works
- [ ] Login works
- [ ] Face ID / Touch ID (if implemented)
- [ ] Logout works
- [ ] Password reset works

#### Navigation
- [ ] Tab navigation works
- [ ] Swipe gestures work
- [ ] Back navigation works
- [ ] Deep linking works

#### Content Screens
- [ ] All screens render correctly
- [ ] Safe area respected
- [ ] Notch handled correctly
- [ ] Dynamic Island handled (iPhone 14 Pro)

#### Interactions
- [ ] All interactions work
- [ ] Haptic feedback works
- [ ] Share sheet works
- [ ] Audio player works

#### Offline Mode
- [ ] Same as Android checklist

#### Notifications
- [ ] Push notifications work
- [ ] Notification badges work
- [ ] Notification sounds work

## Tablet Testing

### Android Tablets

#### Test Devices
- **Samsung Galaxy Tab S7** (Android 12)
- **Lenovo Tab P11** (Android 11)

#### Tablet-Specific Tests
- [ ] Layout adapts to larger screen
- [ ] Two-column layouts work
- [ ] Touch targets appropriate size
- [ ] Keyboard handling works
- [ ] Split-screen mode works
- [ ] Landscape orientation works

### iPad Testing

#### Test Devices
- **iPad Pro 12.9"** (iOS 17)
- **iPad Air** (iOS 15)

#### iPad-Specific Tests
- [ ] Layout adapts to larger screen
- [ ] Split view works
- [ ] Slide over works
- [ ] Keyboard shortcuts work (if implemented)
- [ ] Apple Pencil support (if implemented)

## Common Issues to Check

### Performance
- [ ] No lag when scrolling
- [ ] Images load quickly
- [ ] Animations smooth
- [ ] No memory leaks
- [ ] Battery usage reasonable

### UI/UX
- [ ] Text readable on all screen sizes
- [ ] Buttons easily tappable
- [ ] Colors have good contrast
- [ ] Dark mode works (if implemented)
- [ ] RTL support (if needed)

### Network
- [ ] Works on WiFi
- [ ] Works on cellular data
- [ ] Handles network errors gracefully
- [ ] Retries on failure
- [ ] Shows loading states

### Edge Cases
- [ ] Very long content displays
- [ ] Empty states show correctly
- [ ] Error states show correctly
- [ ] Low storage handling
- [ ] Low memory handling

## Reporting Test Results

When reporting device test results, include:

1. **Device Information**:
   - Device model
   - OS version
   - Screen size
   - RAM

2. **Test Results**:
   - Passed tests
   - Failed tests
   - Screenshots of issues
   - Error logs

3. **Performance Metrics**:
   - Launch time
   - Memory usage
   - Battery impact

4. **Issues Found**:
   - Description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/videos

