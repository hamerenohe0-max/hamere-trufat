#!/bin/bash

echo "🧪 Running All Tests for Hamere Trufat"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend Tests
echo -e "${YELLOW}📦 Running Backend Tests...${NC}"
cd backend
if npm test; then
    echo -e "${GREEN}✅ Backend tests passed!${NC}"
else
    echo -e "${RED}❌ Backend tests failed!${NC}"
    exit 1
fi
cd ..

echo ""

# Mobile App Tests
echo -e "${YELLOW}📱 Running Mobile App Tests...${NC}"
cd mobile-app
if npm test; then
    echo -e "${GREEN}✅ Mobile app tests passed!${NC}"
else
    echo -e "${RED}❌ Mobile app tests failed!${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${GREEN}🎉 All tests completed!${NC}"

