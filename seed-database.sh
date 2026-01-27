#!/bin/bash

# REOS Database Seeding Script
# Seeds all tables with comprehensive mock data

echo "🌱 Starting comprehensive database seeding..."
echo ""
echo "This will seed:"
echo "  ✓ Service providers (brokers, mortgage advisors, lawyers)"
echo "  ✓ Properties with details and images"
echo "  ✓ Neighborhoods and price history"
echo "  ✓ Deals with full workflow"
echo "  ✓ Service requests and assignments"
echo "  ✓ Deal activities and messages"
echo "  ✓ Deal files (mock PDFs)"
echo "  ✓ Direct conversations (1-on-1 and group chats)"
echo "  ✓ Social feed posts, comments, likes, saves"
echo "  ✓ User follows and notifications"
echo ""
echo "⏳ Running seed:seedEverything..."
echo ""

npx convex run seed:seedEverything

echo ""
echo "✅ Database seeding complete!"
echo ""
echo "You can now:"
echo "  • View data in Convex dashboard: https://dashboard.convex.dev"
echo "  • Test the application with seeded data"
echo "  • Clear specific tables with: npx convex run seed:clear[TableName]"
echo "  • Clear ALL data with: npx convex run seed:clearAll"
echo ""
