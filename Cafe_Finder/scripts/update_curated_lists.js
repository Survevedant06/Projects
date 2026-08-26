const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '../src/lib/mockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

const updatedCuratedLists = `
export interface CuratedListSeedItem {
  cafeSlug: string;
  curatorNote: string;
}

export interface CuratedListSeed {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  isPublic: boolean;
  tags: string;
  authorName: string;
  items: CuratedListSeedItem[];
}

export const sampleCuratedLists: CuratedListSeed[] = [
  {
    title: 'Best Cafes for Coding & High-Speed Fiber',
    slug: 'best-cafes-for-coding-and-deep-work',
    description: 'Vetted workspaces with 100+ Mbps symmetric fiber, ergonomic chairs, and plentiful power outlets.',
    coverImage: IMAGES.cafe2,
    isPublic: true,
    tags: JSON.stringify(['Coding', 'Gigabit Fiber', 'Quiet Zones', 'Outlets']),
    authorName: 'Alex Rivera (Lead Nomad Engineer)',
    items: [
      {
        cafeSlug: 'the-assembly-working-cafe-sf',
        curatorNote: 'Sit in the rear greenhouse room for ergonomic Herman Miller chairs, strict quiet policy, and 280 Mbps symmetric fiber.',
      },
      {
        cafeSlug: 'the-fern-courtyard-cafe-ratnagiri',
        curatorNote: 'Executive business lounge in Ratnagiri with 110 Mbps fiber, AC work desks, and silent atmosphere.',
      },
      {
        cafeSlug: 'hearth-loom-workspace-brooklyn',
        curatorNote: 'Williamsburg converted industrial loft with private call pods and gigabit mesh WiFi.',
      },
      {
        cafeSlug: 'blue-tokai-indiranagar-bangalore',
        curatorNote: 'Bengaluru tech hub with strong WiFi, plentiful power outlets, and single-origin pour-overs.',
      },
      {
        cafeSlug: 'citrus-cafe-lemon-tree-dapoli',
        curatorNote: '24/7 high-speed fiber workspace with all-day specialty coffee and ergonomic chairs.',
      },
    ],
  },
  {
    title: 'Top Ratnagiri & Coastal Workspaces',
    slug: 'top-ratnagiri-and-konkan-workspaces',
    description: 'The finest work-ready cafes, beachside terraces, and study lounges across Ratnagiri, Mandvi, and Bhatye.',
    coverImage: IMAGES.seaside1,
    isPublic: true,
    tags: JSON.stringify(['Ratnagiri', 'Mandvi', 'Beachfront', 'Konkan']),
    authorName: 'Priya Sharma (Freelance Developer)',
    items: [
      {
        cafeSlug: 'masala-kitchen-mandvi-beach-ratnagiri',
        curatorNote: 'Direct beachfront tables by Gateway of Ratnagiri with sea breeze, fresh coffee, and sunset outdoor dining.',
      },
      {
        cafeSlug: 'hotel-amantran-juna-malnaka-ratnagiri',
        curatorNote: 'Ratnagiri celebrated institution at Juna Malnaka with air conditioning, fast service, and authentic filter coffee.',
      },
      {
        cafeSlug: 'ovenly-cakes-cafe-gharkul-ratnagiri',
        curatorNote: 'Quiet artisan bakery in Maruti Mandir with handcrafted pastries, cappuccino, and laptop study tables.',
      },
      {
        cafeSlug: 'shree-swami-bhatye-beach-cafe-ratnagiri',
        curatorNote: 'Beachfront shaded gazebos on Bhatye Beach with coconut cold coffee and ocean sounds.',
      },
      {
        cafeSlug: 'cafe-creme-maruti-mandir-ratnagiri',
        curatorNote: 'Central student & nomad hub near Maruti Mandir with thick chocolate cold coffee, AC, and wall power outlets.',
      },
      {
        cafeSlug: 'hotel-vivek-juna-malnaka-ratnagiri',
        curatorNote: 'Centrally located business cafe lounge with ergonomic tables and reliable fiber WiFi.',
      },
    ],
  },
  {
    title: 'Late-Night Think Tanks & Evening Cafes',
    slug: 'late-night-think-tanks-study-spots',
    description: 'Quiet spots open past 9 PM with stable WiFi, cozy lighting, and late-night sustenance.',
    coverImage: IMAGES.cafe1,
    isPublic: true,
    tags: JSON.stringify(['Open Late', 'Night Owls', 'Students', 'Dinner']),
    authorName: 'Sarah Chen (UI/UX Designer)',
    items: [
      {
        cafeSlug: 'the-clove-wine-n-dine-maruti-mandir-ratnagiri',
        curatorNote: 'First-floor lounge in Ashirwad Complex open late with comfortable booth seating and multi-cuisine sustenance.',
      },
      {
        cafeSlug: 'pokket-cafe-maruti-mandir-ratnagiri',
        curatorNote: 'Open late into the evening with pizza, thick shakes, and energized late-night study atmosphere.',
      },
      {
        cafeSlug: 'the-belgian-waffle-co-maruti-mandir-ratnagiri',
        curatorNote: 'Freshly baked chocolate waffles and cold brews open late in Maruti Mandir.',
      },
      {
        cafeSlug: 'patika-coffee-south-congress-austin',
        curatorNote: 'Pecan-shaded patio with outdoor power strips and evening coffee service.',
      },
      {
        cafeSlug: 'cafe-mh-08-chiplun-ratnagiri',
        curatorNote: 'Highway nomad stop open late with burgers, mocktails, and power sockets.',
      },
    ],
  },
  {
    title: 'Silent Sanctums & Deep Focus Retreats',
    slug: 'silent-sanctums-and-deep-focus-retreats',
    description: 'Library-quiet sanctuaries and garden spaces with minimal distraction for deep async writing.',
    coverImage: IMAGES.cafe3,
    isPublic: true,
    tags: JSON.stringify(['Silent', 'No Calls', 'Focus', 'Minimalist']),
    authorName: 'Marcus Lindqvist (Systems Architect)',
    items: [
      {
        cafeSlug: 'kurasu-kyoto-roastery',
        curatorNote: 'Minimalist machiya townhouse with Japanese pour-overs and library-quiet contemplative focus.',
      },
      {
        cafeSlug: 'konkan-swad-cafe-thiba-palace-ratnagiri',
        curatorNote: 'Hilltop garden overlooking Someshwar creek; exceptionally calm during afternoons for async writing.',
      },
      {
        cafeSlug: 'cafe-cloud-nachane-ratnagiri',
        curatorNote: 'Tucked-away residential corner cafe near Salvi Stop with zero street noise and ergonomic seating.',
      },
      {
        cafeSlug: 'the-barn-berlin-prenzlauer',
        curatorNote: 'Nordic light roast pioneers with strict focus-friendly atmosphere and laser-quiet rear room.',
      },
      {
        cafeSlug: 'ratnadurg-fort-view-cafe-ratnagiri',
        curatorNote: 'Cliffside oceanfront peacefulness near Bhagwati Temple for deep creative thinking.',
      },
    ],
  },
  {
    title: 'Coastal Nomad Beach Hubs',
    slug: 'coastal-nomad-beach-hubs',
    description: 'Sunlit cafes and beach clubs with ocean breezes, coconut brews, and productive setups.',
    coverImage: IMAGES.seaside2,
    isPublic: true,
    tags: JSON.stringify(['Beachfront', 'Sea Views', 'Nomads', 'Outdoor']),
    authorName: 'Elena Rostova (Travel Writer)',
    items: [
      {
        cafeSlug: 'dojo-bali-canggu',
        curatorNote: 'Legendary beachside nomad hub in Canggu with dual Starlink, call pods, and pool desks.',
      },
      {
        cafeSlug: 'hotel-sea-fans-mandvi-beach-ratnagiri',
        curatorNote: 'Work right on the sand of Mandvi Beach with direct sea views and coastal hospitality.',
      },
      {
        cafeSlug: 'mtdc-beach-resort-cafe-ganpatipule',
        curatorNote: 'Expansive seafront lawn seating under beach canopies directly on Ganpatipule beach.',
      },
      {
        cafeSlug: 'artjuna-garden-cafe-goa',
        curatorNote: 'Tropical garden open-air workspace with healthy Mediterranean menu and nomad community.',
      },
      {
        cafeSlug: 'blue-ocean-resort-lounge-malgund',
        curatorNote: 'Luxury poolside cabanas with 100 Mbps fiber internet for high-bandwidth engineering tasks.',
      },
    ],
  },
];
`;

const marker = 'export const sampleCuratedLists';
const idx = content.indexOf(marker);
if (idx !== -1) {
  content = content.slice(0, idx) + updatedCuratedLists.trim() + '\n';
  fs.writeFileSync(mockDataPath, content, 'utf8');
  console.log('Successfully updated sampleCuratedLists with distinct cafes and notes in mockData.ts!');
} else {
  console.error('Marker not found in mockData.ts');
}
