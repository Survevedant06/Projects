const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const lists = await prisma.curatedList.findMany({
    include: {
      items: {
        include: {
          cafe: true
        }
      }
    }
  });

  console.log(`Found ${lists.length} curated lists:\n`);
  for (const list of lists) {
    console.log(`=== ${list.title} (${list.items.length} items) ===`);
    for (const item of list.items) {
      console.log(`  - ${item.cafe.name} (${item.cafe.city}) -> "${item.curatorNote}"`);
    }
    console.log('');
  }
}

check().finally(() => prisma.$disconnect());
