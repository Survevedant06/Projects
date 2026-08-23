import { PrismaClient } from '@prisma/client';
import { initialCafes, sampleCuratedLists } from '../src/lib/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Cafe Finder database...');

  // Create demo users
  const alex = await prisma.user.upsert({
    where: { email: 'alex.nomad@example.com' },
    update: {},
    create: {
      email: 'alex.nomad@example.com',
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'CURATOR',
      reputation: 85
    }
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah.design@example.com' },
    update: {},
    create: {
      email: 'sarah.design@example.com',
      name: 'Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      role: 'NOMAD',
      reputation: 42
    }
  });

  // Seed cafes
  const createdCafes = [];
  for (const cafeData of initialCafes) {
    // Strip runtime-only fields not in Prisma schema
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { source, distanceKm, ...cafeDbData } = cafeData as typeof cafeData & { source?: string; distanceKm?: number };
    const cafe = await prisma.cafe.upsert({
      where: { slug: cafeData.slug },
      update: {},
      create: {
        ...cafeDbData,
        submitterId: alex.id
      }
    });
    createdCafes.push(cafe);

    // Create sample reviews for each cafe
    await prisma.review.createMany({
      data: [
        {
          cafeId: cafe.id,
          userId: alex.id,
          authorName: 'Alex Rivera',
          authorAvatar: alex.avatarUrl,
          overallRating: 5,
          wifiRating: 5,
          noiseRating: cafe.noiseLevel === 'SILENT' ? 5 : 4,
          outletRating: cafe.powerPlugDensity === 'AT_EVERY_SEAT' ? 5 : 4,
          comfortRating: 5,
          coffeeRating: 5,
          reportedWifiSpeed: cafe.wifiSpeedMbps,
          comment: `Phenomenal workspace. WiFi measured consistently at ${cafe.wifiSpeedMbps} Mbps. Plenty of outlets and the staff doesn't rush you if you stay for hours. Highly recommended for software development and async work.`,
          bestForTags: JSON.stringify(['Coding', 'Deep Focus', 'Pour Over Coffee']),
          visitTiming: 'Afternoon'
        },
        {
          cafeId: cafe.id,
          userId: sarah.id,
          authorName: 'Sarah Chen',
          authorAvatar: sarah.avatarUrl,
          overallRating: 4,
          wifiRating: 4,
          noiseRating: 4,
          outletRating: 4,
          comfortRating: 5,
          coffeeRating: 5,
          reportedWifiSpeed: cafe.wifiSpeedMbps * 0.95,
          comment: 'Super aesthetic interior, friendly baristas, and comfortable ergonomic seating. Great natural light for design work and video editing.',
          bestForTags: JSON.stringify(['Design Work', 'Natural Light', 'Pastries']),
          visitTiming: 'Morning'
        }
      ]
    });

    // Add speed test telemetry logs
    await prisma.speedTestLog.createMany({
      data: [
        {
          cafeId: cafe.id,
          userId: alex.id,
          downloadMbps: cafe.wifiSpeedMbps,
          uploadMbps: cafe.wifiUploadMbps,
          pingMs: 14.2,
          deviceType: 'MacBook Pro M2'
        },
        {
          cafeId: cafe.id,
          userId: sarah.id,
          downloadMbps: cafe.wifiSpeedMbps * 0.96,
          uploadMbps: cafe.wifiUploadMbps * 0.92,
          pingMs: 16.5,
          deviceType: 'iPad Pro'
        }
      ]
    });
  }

  // Seed Curated Lists
  for (let i = 0; i < sampleCuratedLists.length; i++) {
    const listData = sampleCuratedLists[i];
    const list = await prisma.curatedList.upsert({
      where: { slug: listData.slug },
      update: {},
      create: {
        title: listData.title,
        slug: listData.slug,
        description: listData.description,
        coverImage: listData.coverImage,
        isPublic: listData.isPublic,
        tags: listData.tags,
        authorName: listData.authorName,
        userId: i === 0 ? alex.id : sarah.id
      }
    });

    // Add items to list
    const itemsToAdd = createdCafes.slice(0, 3);
    for (let j = 0; j < itemsToAdd.length; j++) {
      await prisma.curatedListItem.upsert({
        where: {
          listId_cafeId: {
            listId: list.id,
            cafeId: itemsToAdd[j].id
          }
        },
        update: {},
        create: {
          listId: list.id,
          cafeId: itemsToAdd[j].id,
          curatorNote: `Must try the signature roast and sit by the sunlit window. Speed tested ${itemsToAdd[j].wifiSpeedMbps} Mbps!`,
          order: j
        }
      });
    }
  }

  console.log('Database seeded successfully with workspace cafes, reviews, speed tests, and curated lists.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
