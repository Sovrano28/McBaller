# 🎉 McUnited FC - Quick Start Guide

## ✅ Your Database is Ready!

McUnited FC has been successfully seeded with **comprehensive, realistic data** for a Nigerian football club!

---

## 🔑 Login Credentials

### 🎯 Organization Admin
```
Email: admin@mcunitedfc.ng
Password: mcunited123
```
**Use this to access the full organization dashboard**

### ⚽ Sample Players
```
Email: abdullahi_bakare_0@mcunited.test
Password: mcunited123

OR any player email following pattern:
{firstname}_{lastname}_{number}@mcunited.test
```

---

## 📊 What's Included

| Feature | Count | Details |
|---------|-------|---------|
| **Teams** | 4 | Senior Men, Senior Women, U17 Men, U17 Women |
| **Players** | 92 | 23 players per team (all positions covered) |
| **Contracts** | 92 | Active contracts with salary & bonuses |
| **Calendar Events** | 67 | Training, matches, meetings |
| **Venues** | 3 | Stadium, sports complex, training ground |
| **Announcements** | 5 | Season start, equipment, protocols, etc. |
| **Assignments** | 5 | Tasks and duties for players |
| **Media Files** | 8 | Football images and documents |
| **Invoices** | 15 | Registration, kits, tournament fees |
| **Payments** | 8 | Processed payments via various methods |
| **Waivers** | 3 | Liability, consent, media release |
| **Signatures** | 70 | Players who signed waivers |
| **Background Checks** | 5 | Compliance checks |
| **Documents** | 4 | Constitution, insurance, procedures |
| **Audit Logs** | 50 | Complete activity tracking |
| **Availabilities** | 360 | Player responses to events |
| **Attendances** | 598 | Training and match attendance |

---

## 🎯 Test These Features

### 1️⃣ **Organization Dashboard**
Login as admin and explore:
- View all 4 teams and 92 players
- Check active 2024/2025 season
- Browse calendar with 67 events
- Review contracts and financial data
- Check compliance documents

### 2️⃣ **Player View**
Login as any player to see:
- Personal profile and stats
- Team information
- Upcoming events
- Contract details
- Assignments

### 3️⃣ **Analytics**
The dashboard will show:
- Player attendance rates (~90%)
- Availability responses (~78%)
- Team performance metrics
- Financial summaries

---

## 📂 Team Structure

### **Senior Men's Team** (23 players)
- 2 Goalkeepers
- 8 Defenders
- 8 Midfielders
- 5 Forwards

### **Senior Women's Team** (23 players)
- Same composition

### **U17 Men's Team** (23 players)
- Same composition

### **U17 Women's Team** (23 players)
- Same composition

---

## 🏟️ Venues

1. **McUnited Stadium** (15,000 capacity)
   - Home matches and main events
   
2. **Lagos Sports Complex** (25,000 capacity)
   - Major tournaments

3. **Training Ground Alpha** (500 capacity)
   - Daily training sessions

---

## 📅 Calendar Events

- **Training Sessions:** 48 events (3x per week per team)
- **League Matches:** 16 matches (weekly, Saturdays)
- **Team Meetings:** 3 monthly meetings

Events include past (completed), current, and future dates.

---

## 💰 Financial Data

**Invoices:**
- Registration Fee: ₦25,000
- Training Kit: ₦15,000
- Tournament Entry: ₦50,000
- Monthly Dues: ₦10,000

**Status:**
- ✅ 70% Paid
- ⏳ 20% Pending
- ⚠️ 10% Overdue

---

## 🔄 Re-seed Database

To run the seed again (if needed):

```bash
npx tsx prisma/seed-mcunited.ts
```

To verify data:

```bash
npx tsx scripts/verify-mcunited.ts
```

---

## 📖 Full Documentation

For complete details, see: **`docs/MCUNITED-FC-SEED-INFO.md`**

---

## 🇳🇬 Nigerian Context

Everything is authentic:
- ✅ Nigerian names (Chukwuemeka, Amina, Blessing, etc.)
- ✅ Nigerian locations (Lagos, Kano, Enugu, etc.)
- ✅ Nigerian phone numbers (+234)
- ✅ NGN currency (₦)
- ✅ Lagos-based club
- ✅ Nigerian football culture

---

## ⚽ Player Images

All player profile pictures are **football-related images** from Unsplash:
- Players in action
- Football training scenes
- Match moments
- Football equipment

---

## 🎓 Perfect For

- ✅ **Demo purposes** - Show comprehensive features
- ✅ **Development** - Test with realistic data
- ✅ **Testing** - Full coverage of all features
- ✅ **Presentations** - Professional Nigerian context

---

## 🚀 Start Exploring!

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** `http://localhost:9002`

3. **Login as admin:**
   - Email: `admin@mcunitedfc.ng`
   - Password: `mcunited123`

4. **Explore all features!** Everything is populated with real data.

---

## 💡 Tips

- All players can login with password: `mcunited123`
- Admin has full access to organization features
- Players see their personal dashboard
- All dates are relative to current date
- Analytics work with real attendance/availability data

---

**Enjoy your fully-populated McUnited FC database! ⚽🇳🇬✨**

Need help? Check `docs/MCUNITED-FC-SEED-INFO.md` for detailed documentation.

