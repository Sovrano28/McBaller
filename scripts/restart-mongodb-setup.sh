#!/bin/bash
# Restart MongoDB Setup Script
# This clears cache and regenerates Prisma client for MongoDB

echo "🔄 Restarting MongoDB Setup..."
echo ""

echo "1️⃣  Clearing Next.js cache..."
rm -rf .next
echo "✅ Cache cleared"
echo ""

echo "2️⃣  Regenerating Prisma client for MongoDB..."
npx prisma generate
echo "✅ Prisma client regenerated"
echo ""

echo "3️⃣  Testing MongoDB connection..."
npm run db:verify
echo ""

echo "✅ Setup complete! Now restart your dev server:"
echo "   npm run dev"

