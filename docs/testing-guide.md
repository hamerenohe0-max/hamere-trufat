# Testing Guide - Phase 8

## Overview

This guide covers all testing strategies for the Hamere Trufat platform, including unit tests, integration tests, performance tests, security tests, and device testing.

## Test Structure

```
backend/
├── src/
│   └── **/*.spec.ts          # Unit tests
├── test/
│   ├── integration/          # Integration tests
│   ├── performance/          # Performance tests
│   └── security/             # Security tests

mobile-app/
├── src/
│   └── __tests__/            # Unit tests
│       ├── services/
│       ├── hooks/
│       └── offline/
```

## 1. Unit Tests

### Backend Unit Tests

**Location**: `backend/src/**/*.spec.ts`

**Example**: `backend/src/modules/news/services/news.service.spec.ts`

```bash
cd backend
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage
```

**Coverage Targets**:
- Services: >80%
- Controllers: >70%
- Utilities: >90%

### Mobile App Unit Tests

**Location**: `mobile-app/src/__tests__/**/*.test.ts`

**Example**: `mobile-app/src/__tests__/services/offline/cache.service.test.ts`

```bash
cd mobile-app
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage
```

**Coverage Targets**:
- Services: >80%
- Hooks: >75%
- Components: >70%

## 2. Integration Tests

### Backend Integration Tests

**Location**: `backend/test/integration/*.spec.ts`

**Example**: `backend/test/integration/news.integration.spec.ts`

```bash
cd backend
npm run test:e2e
```

**Test Coverage**:
- API endpoints
- Database operations
- Authentication flows
- File uploads

## 3. UX Acceptance Tests

### Manual Testing Checklist

#### Authentication Flow
- [ ] User can register
- [ ] User can login
- [ ] User can logout
- [ ] Password reset works
- [ ] OTP verification works
- [ ] Guest mode works

#### Content Consumption
- [ ] News list loads
- [ ] News detail displays correctly
- [ ] Articles load and display
- [ ] Daily readings show correct content
- [ ] Feasts calendar displays
- [ ] Events list and detail work

#### Interactions
- [ ] Comments can be added
- [ ] Likes/dislikes work
- [ ] Bookmarks save correctly
- [ ] Share functionality works
- [ ] Translation works

#### Offline Mode
- [ ] App works offline
- [ ] Cached content loads
- [ ] Actions queue when offline
- [ ] Sync works when back online

## 4. Performance Tests

### Backend Performance Tests

**Location**: `backend/test/performance/load.test.ts`

```bash
cd backend
npm test -- load.test.ts
```

**Metrics**:
- Response time < 500ms for list endpoints
- Response time < 300ms for detail endpoints
- 100 concurrent requests < 5 seconds
- 50 sequential requests < 10 seconds

### Mobile App Performance

**Manual Testing**:
- App startup < 3 seconds
- Screen transitions smooth (60fps)
- List scrolling smooth
- Image loading optimized
- Memory usage reasonable

## 5. Security Tests

### Backend Security Tests

**Location**: `backend/test/security/security.test.ts`

```bash
cd backend
npm test -- security.test.ts
```

**Test Coverage**:
- Authentication required for protected routes
- Invalid tokens rejected
- Input validation
- SQL injection protection
- XSS protection
- Rate limiting
- CORS headers

### Security Checklist

- [ ] JWT tokens properly validated
- [ ] Passwords hashed (bcrypt)
- [ ] Input sanitized
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] Rate limiting active
- [ ] CORS configured
- [ ] Secrets not in code

## 6. Offline Tests

### Offline Test Suite

**Location**: `mobile-app/src/__tests__/offline/offline.test.ts`

```bash
cd mobile-app
npm test -- offline.test.ts
```

**Test Scenarios**:
1. Cache persistence
2. Bookmark persistence
3. Offline queue
4. Audio caching
5. Sync on reconnect

### Manual Offline Testing

1. **Enable Airplane Mode**
2. **Test cached content**:
   - Open app
   - Navigate to news/articles
   - Verify content loads from cache
3. **Test offline actions**:
   - Add comment (should queue)
   - Like news (should queue)
   - Bookmark article (should save locally)
4. **Test sync**:
   - Disable Airplane Mode
   - Verify queued actions sync
   - Verify cache refreshes

## 7. Push Notifications Tests

### Notification Testing

**Setup**:
1. Register device for notifications
2. Send test notification from admin panel
3. Verify notification received
4. Verify notification opens correct screen

**Test Cases**:
- [ ] Notification received on device
- [ ] Notification displays correctly
- [ ] Tapping notification opens app
- [ ] Deep linking works
- [ ] Notification badge updates
- [ ] Notification sound plays

## 8. Device Testing

### Android Phone Testing

**Requirements**:
- Android 8.0+ (API 26+)
- Test on multiple screen sizes
- Test on different Android versions

**Test Devices**:
- Pixel 6 (Android 13)
- Samsung Galaxy S21 (Android 12)
- OnePlus 9 (Android 11)

**Test Checklist**:
- [ ] App installs correctly
- [ ] App launches without crashes
- [ ] All screens render correctly
- [ ] Navigation works
- [ ] Notifications work
- [ ] Offline mode works
- [ ] Performance is good

### iPhone Testing

**Requirements**:
- iOS 13.0+
- Test on multiple screen sizes
- Test on different iOS versions

**Test Devices**:
- iPhone 14 Pro (iOS 17)
- iPhone 12 (iOS 15)
- iPhone SE (iOS 14)

**Test Checklist**:
- [ ] App installs from App Store
- [ ] App launches without crashes
- [ ] All screens render correctly
- [ ] Navigation works
- [ ] Notifications work
- [ ] Offline mode works
- [ ] Performance is good

### Tablet Testing

**Android Tablets**:
- Samsung Galaxy Tab S7 (Android 12)
- Lenovo Tab P11 (Android 11)

**iPad Testing**:
- iPad Pro 12.9" (iOS 17)
- iPad Air (iOS 15)

**Tablet-Specific Tests**:
- [ ] Layout adapts to larger screen
- [ ] Two-column layouts work
- [ ] Touch targets appropriate size
- [ ] Keyboard handling works
- [ ] Split-screen mode works (Android)

## Running All Tests

### Backend

```bash
cd backend
npm test                    # Unit tests
npm run test:e2e           # Integration tests
npm run test:cov           # Coverage report
```

### Mobile App

```bash
cd mobile-app
npm test                    # Unit tests
npm test -- --coverage     # Coverage report
```

## Test Coverage Goals

- **Overall Coverage**: >75%
- **Critical Paths**: >90%
- **Services**: >80%
- **Components**: >70%

## Continuous Integration

### GitHub Actions (Example)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm test
      
  test-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd mobile-app && npm test
```

## Test Data

### Mock Data
- Use mock data for unit tests
- Use test database for integration tests
- Clean up test data after tests

### Test Users
- `test@example.com` / `password123` - Regular user
- `admin@example.com` / `admin123` - Admin user
- `publisher@example.com` / `publisher123` - Publisher user

## Debugging Tests

### Backend
```bash
npm run test:debug
```

### Mobile App
```bash
npm test -- --verbose
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Mock External Services**: Don't call real APIs in tests
3. **Clean Up**: Remove test data after tests
4. **Fast Tests**: Unit tests should run quickly
5. **Clear Names**: Test names should describe what they test
6. **AAA Pattern**: Arrange, Act, Assert
7. **Cover Edge Cases**: Test error conditions
8. **Test User Flows**: Integration tests for critical paths

## Reporting Issues

When reporting test failures:
1. Include test name
2. Include error message
3. Include stack trace
4. Include environment details
5. Include steps to reproduce

