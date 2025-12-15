# Test Execution Guide

## Quick Start

### Backend Tests

```bash
cd backend
npm test
```

### Mobile App Tests

```bash
cd mobile-app
npm test
```

## Detailed Test Commands

### Backend Testing

#### Run All Tests
```bash
cd backend
npm test
```

#### Run Tests in Watch Mode
```bash
npm test -- --watch
```

#### Run Tests with Coverage
```bash
npm test -- --coverage
```

#### Run Specific Test File
```bash
npm test -- src/modules/news/services/news.service.spec.ts
```

#### Run Integration Tests
```bash
npm run test:e2e
```

#### Run Performance Tests
```bash
npm test -- test/performance/load.test.ts
```

#### Run Security Tests
```bash
npm test -- test/security/security.test.ts
```

### Mobile App Testing

#### Run All Tests
```bash
cd mobile-app
npm test
```

#### Run Tests in Watch Mode
```bash
npm test -- --watch
```

#### Run Tests with Coverage
```bash
npm test -- --coverage
```

#### Run Specific Test File
```bash
npm test -- src/__tests__/services/offline/cache.service.test.ts
```

#### Run Offline Tests
```bash
npm test -- src/__tests__/offline/offline.test.ts
```

## Test Output

### Successful Test Run
```
PASS  src/modules/news/services/news.service.spec.ts
  NewsService
    ✓ should create news article (15ms)
    ✓ should return news article (8ms)
    ✓ should throw NotFoundException if news not found (5ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Time:        2.345 s
```

### Failed Test Run
```
FAIL  src/modules/news/services/news.service.spec.ts
  NewsService
    ✓ should create news article (15ms)
    ✕ should return news article (8ms)

  ● NewsService › should return news article
    expect(received).toBe(expected)
    Expected: "Test News"
    Received: undefined

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
```

## Troubleshooting

### Tests Not Running

1. **Check Dependencies**
   ```bash
   npm install
   ```

2. **Check Jest Installation**
   ```bash
   npx jest --version
   ```

3. **Clear Jest Cache**
   ```bash
   npx jest --clearCache
   ```

### Tests Failing

1. **Check Test Database**
   - Ensure MongoDB is running (for integration tests)
   - Or use MongoDB Memory Server (automatic)

2. **Check Environment Variables**
   - Ensure `.env.test` exists (if needed)
   - Check required environment variables

3. **Check Mock Data**
   - Verify mock data is correct
   - Check mock function implementations

### Coverage Issues

1. **Low Coverage**
   ```bash
   npm test -- --coverage --collectCoverageFrom='src/**/*.ts'
   ```

2. **View Coverage Report**
   - Open `coverage/lcov-report/index.html` in browser

## Continuous Testing

### Watch Mode
```bash
# Backend
cd backend && npm test -- --watch

# Mobile App
cd mobile-app && npm test -- --watch
```

### Test on File Change
```bash
# Backend
cd backend && npm test -- --watch --onlyChanged

# Mobile App
cd mobile-app && npm test -- --watch --onlyChanged
```

## Test Categories

### Unit Tests
- Fast, isolated tests
- Mock dependencies
- Test individual functions/classes

### Integration Tests
- Test multiple components together
- Use test database
- Test API endpoints

### E2E Tests
- Test complete user flows
- Use real database (or test DB)
- Test full application

## Best Practices

1. **Run Tests Before Committing**
   ```bash
   npm test
   ```

2. **Fix Failing Tests Immediately**
   - Don't commit broken tests
   - Fix or skip (with reason)

3. **Write Tests for New Features**
   - Test happy path
   - Test error cases
   - Test edge cases

4. **Keep Tests Fast**
   - Mock slow operations
   - Use in-memory database
   - Avoid real API calls

5. **Keep Tests Independent**
   - Each test should be standalone
   - Don't rely on test order
   - Clean up after tests

## Next Steps

After running tests:

1. **Review Coverage Report**
   - Identify untested code
   - Add tests for critical paths

2. **Fix Failing Tests**
   - Understand why tests fail
   - Fix code or update tests

3. **Improve Test Quality**
   - Add more test cases
   - Improve test descriptions
   - Add edge case tests

