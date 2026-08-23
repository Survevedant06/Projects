import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// ─── Rich destination presets ───────────────────────────────────────────────────
const DESTINATION_PRESETS = {
  tokyo: {
    title: 'Vibrant Neon, Historic Shrines & Culinary Wonders in Tokyo',
    summary: 'Immerse yourself in the bustling metropolis of Tokyo, seamlessly blending ancient temples in Asakusa with futuristic digital art, world-class ramen alleys, and serene gardens.',
    bestTimeToVisit: 'March to May (Cherry Blossoms) & October to November (Autumn foliage)',
    weatherAdvice: 'Mild in spring and autumn. Carry comfortable walking shoes and light layers.',
    packingList: ['Comfortable walking sneakers', 'Suica / Pasmo IC card or app', 'Portable power bank', 'Universal adapter (Type A)', 'Coin purse for cash/vending machines', 'Pocket Wi-Fi / eSIM'],
    localEtiquette: [
      'Avoid walking while eating; consume street food near stalls.',
      'Keep your voice low on trains and subways.',
      'Always stand on the left side of escalators (in Tokyo) to let others pass.',
      'Tipping is not customary and may cause confusion.',
    ],
    days: [
      {
        title: 'Historic Asakusa & Digital Art Experience',
        theme: 'Ancient heritage meets futuristic digital wonders',
        breakfast: 'Asakusa Kagetsudo - Freshly baked warm melonpan & matcha latte',
        lunch: 'Daikokuya Tempura - Traditional crispy prawn tempura over rice',
        dinner: 'Ramen Street (Tokyo Station) - Rich tonkotsu broth at Rokurinsha',
        tip: 'Visit Senso-ji early in the morning before crowds arrive to get serene photos.',
        spots: [
          { timeSlot: 'morning',   name: 'Senso-ji Temple & Nakamise-dori', category: 'Sightseeing', location: '2 Chome-3-1 Asakusa, Taito City, Tokyo', cost: 0,  duration: 120, rating: 4.7, desc: 'Tokyo\'s oldest Buddhist temple dating to 645 AD. Walk through the iconic Kaminarimon gate and explore historic snack stalls.' },
          { timeSlot: 'afternoon', name: 'teamLab Planets TOKYO',            category: 'Art & Culture', location: '6 Chome-1-16 Toyosu, Koto City, Tokyo',    cost: 35, duration: 150, rating: 4.8, desc: 'Immersive body-interactive digital art museum where you walk through water and floating flower gardens.' },
          { timeSlot: 'evening',   name: 'Shibuya Crossing & Shibuya Sky',  category: 'Sightseeing & Nightlife', location: '2 Chome-24-12 Shibuya, Shibuya City, Tokyo', cost: 20, duration: 120, rating: 4.9, desc: 'Witness the world\'s busiest pedestrian crossing and view the sparkling 360-degree city skyline from Shibuya Sky rooftop observatory.' },
        ],
      },
      {
        title: 'Shrine Serenity & Pop Culture Energy',
        theme: 'Spiritual forest walks and trendy Harajuku fashion',
        breakfast: 'Bills Omotesando - Famous fluffy ricotta hotcakes and flat white',
        lunch: 'Afuri Ramen Harajuku - Refreshing Yuzu Shio ramen',
        dinner: 'Omoide Yokocho (Memory Lane) - Yakitori skewers in vintage alleys',
        tip: 'Purchase a Meiji Jingu ema wooden plaque to write your travel wishes.',
        spots: [
          { timeSlot: 'morning',   name: 'Meiji Jingu Shrine & Yoyogi Park',         category: 'Culture',    location: '1-1 Yoyogikamizonocho, Shibuya City, Tokyo',     cost: 0,  duration: 120, rating: 4.8, desc: 'Tranquil Shinto shrine nestled inside a 170-acre lush evergreen forest in the heart of Tokyo.' },
          { timeSlot: 'afternoon', name: 'Takeshita Street & Omotesando Avenue',      category: 'Shopping',   location: '1 Chome-19 Jingumae, Shibuya City, Tokyo',        cost: 15, duration: 150, rating: 4.6, desc: 'Vibrant hub of Japanese youth fashion, themed cafes, colorful cotton candy, and architectural flagships.' },
          { timeSlot: 'evening',   name: 'Shinjuku Gyoen & Omoide Yokocho',          category: 'Food & Nightlife', location: '1 Chome-2 Nishishinjuku, Shinjuku City, Tokyo', cost: 25, duration: 120, rating: 4.7, desc: 'Explore atmospheric lantern-lit alleyways of Shinjuku packed with smoky yakitori grills and cozy izakayas.' },
        ],
      },
      {
        title: 'Imperial Gardens & Waterfront Views',
        theme: 'Royal history and sunset over Tokyo Bay',
        breakfast: 'Sarabeth\'s Tokyo - Lemon ricotta pancakes and morning coffee',
        lunch: 'Tsukiji Outer Market - Fresh tuna sashimi bowls and tamagoyaki skewers',
        dinner: 'Gonpachi Nishi-Azabu - Famous Kill Bill-inspired izakaya feast',
        tip: 'Rent a rowboat in Chidorigafuchi moat if visiting during spring cherry blossoms.',
        spots: [
          { timeSlot: 'morning',   name: 'Tokyo Imperial Palace East Gardens', category: 'Sightseeing',         location: '1-1 Chiyoda, Chiyoda City, Tokyo',                cost: 0,  duration: 120, rating: 4.6, desc: 'Stroll along historical stone castle moats, ancient defense guardhouses, and tranquil Japanese zen gardens.' },
          { timeSlot: 'afternoon', name: 'Tsukiji Outer Market & Ginza',       category: 'Food & Shopping',     location: '4 Chome-16-2 Tsukiji, Chuo City, Tokyo',         cost: 25, duration: 150, rating: 4.7, desc: 'Sample freshly torched wagyu beef, grilled scallops, and browse high-end flagship department stores in Ginza.' },
          { timeSlot: 'evening',   name: 'Odaiba Seaside Park & Rainbow Bridge',category: 'Sightseeing',        location: '1 Chome-4 Daiba, Minato City, Tokyo',            cost: 15, duration: 120, rating: 4.8, desc: 'Watch the sunset illuminate Tokyo Bay, the life-sized Unicorn Gundam statue, and the iconic Rainbow Bridge.' },
        ],
      },
    ],
  },
  goa: {
    title: 'Sun, Sand, Seafood & Portuguese Heritage in Goa',
    summary: 'Experience the tropical charm of Goa, featuring golden beaches, vibrant beach shacks, historic churches of Old Goa, spice plantations, and lively night markets.',
    bestTimeToVisit: 'November to February (Pleasant coastal breezes and lively festivals)',
    weatherAdvice: 'Warm and sunny. Pack light cottons, swimwear, sunglasses, and high-SPF sunscreen.',
    packingList: ['Sunscreen & UV sunglasses', 'Beachwear & flip-flops', 'Light linen shirts', 'Mosquito repellent', 'Waterproof phone pouch', 'Cash for beach shacks'],
    localEtiquette: [
      'Dress respectfully when visiting churches and temples (cover shoulders and knees).',
      'Always negotiate taxi fares in advance or use GoaMiles.',
      'Keep beaches clean; avoid littering plastics.',
    ],
    days: [
      {
        title: 'North Goa Coastal Explorer & Sunset Shacks',
        theme: 'Beaches, water sports, and beachside dining',
        breakfast: 'Infantaria Cafe Calangute - Goan pork sausage rolls and freshly brewed coffee',
        lunch: 'Britto\'s Baga - Crab butter garlic and freshly grilled kingfish',
        dinner: 'Curlies Beach Shack Anjuna - Woodfired pizza, cocktails, and sunset trance beats',
        tip: 'Rent a scooter to easily navigate coastal roads and discover quiet coves.',
        spots: [
          { timeSlot: 'morning',   name: 'Aguada Fort & Lighthouse',          category: 'Sightseeing',             location: 'Aguada-Siolim Coastal Rd, Candolim, Goa', cost: 5,  duration: 120, rating: 4.6, desc: '17th-century Portuguese freshwater fort offering panoramic views of the Arabian Sea and Sinquerim beach.' },
          { timeSlot: 'afternoon', name: 'Anjuna Beach & Flea Market',        category: 'Relaxation & Shopping',   location: 'Anjuna Beach, Goa',                       cost: 10, duration: 180, rating: 4.5, desc: 'Relax under palm trees, enjoy water sports, and browse colorful bohemian handicrafts and beachwear.' },
          { timeSlot: 'evening',   name: 'Thalassa Siolim or Vagator Cliff',  category: 'Food & Nightlife',         location: 'Vaddy, Siolim, Goa',                      cost: 25, duration: 120, rating: 4.8, desc: 'Watch spectacular golden hour sunsets overlooking the Chapora river while enjoying authentic Greek and Goan dishes.' },
        ],
      },
      {
        title: 'Old Goa Heritage & Latin Quarter Walk',
        theme: 'Centuries of Portuguese culture and aromatic spice trails',
        breakfast: 'Cafe Bhonsle Panaji - Traditional Goan Mirchi Bhaji and Puri Bhaji with sweet tea',
        lunch: 'Viva Panjim - Authentic Goan fish curry thali with prawns in a heritage Portuguese house',
        dinner: 'Fisherman\'s Wharf - Seafood platter and live coastal music along the riverfront',
        tip: 'Wear comfortable walking shoes for the colorful cobblestone lanes of Fontainhas.',
        spots: [
          { timeSlot: 'morning',   name: 'Basilica of Bom Jesus & Se Cathedral', category: 'Culture & History',         location: 'Old Goa Rd, Bainguinim, Goa',    cost: 2,  duration: 120, rating: 4.8, desc: 'UNESCO World Heritage site containing the mortal remains of St. Francis Xavier, featuring ornate Baroque architecture.' },
          { timeSlot: 'afternoon', name: 'Fontainhas (Latin Quarter) Walking Tour', category: 'Culture & Photography',  location: 'Altinho, Panaji, Goa',           cost: 0,  duration: 150, rating: 4.7, desc: 'Walk through brightly colored yellow, blue, and terracotta Portuguese colonial villas, art galleries, and quaint bakeries.' },
          { timeSlot: 'evening',   name: 'Mandovi River Sunset Cruise',           category: 'Sightseeing & Culture',    location: 'Panaji Jetty, Mandovi River, Goa', cost: 15, duration: 120, rating: 4.6, desc: 'Enjoy scenic sunset views from the water with live Goan folk dance performances and music.' },
        ],
      },
      {
        title: 'South Goa Serenity & Scenic Spice Plantation',
        theme: 'Untouched pristine beaches and fragrant spices',
        breakfast: 'Fisherman\'s Corner Cavelossim - Continental breakfast and fresh tender coconut',
        lunch: 'Sahakari Spice Farm - Traditional buffet served on fresh banana leaves',
        dinner: 'Martin\'s Corner Betalbatim - Famous prawn balchão and live Goan guitar melodies',
        tip: 'Carry an extra set of clothes if taking part in the spice farm herbal shower.',
        spots: [
          { timeSlot: 'morning',   name: 'Sahakari Spice Farm Ponda',      category: 'Nature & Food',  location: 'Curti, Ponda, Goa',              cost: 10, duration: 150, rating: 4.7, desc: 'Guided walk through cardamom, pepper, and vanilla plantations with traditional Goan folk welcome and buffet.' },
          { timeSlot: 'afternoon', name: 'Palolem Beach & Butterfly Beach', category: 'Relaxation',     location: 'Palolem, Canacona, South Goa',   cost: 15, duration: 180, rating: 4.9, desc: 'Crescent-shaped white sand beach with calm waters, coconut palms, and optional dolphin boat trips.' },
          { timeSlot: 'evening',   name: 'Cabo de Rama Fort Sunset',        category: 'Sightseeing',    location: 'Cabo de Rama, South Goa',        cost: 0,  duration: 120, rating: 4.8, desc: 'Ancient clifftop fortress offering sweeping panoramic vistas of the southern ocean at twilight.' },
        ],
      },
    ],
  },
  paris: {
    title: 'Iconic Romance, World-Class Art & Gourmet Dining in Paris',
    summary: 'A curated journey through the City of Light, taking you from the Eiffel Tower to bohemian Montmartre, grand boulevards, and Michelin-worthy bakeries.',
    bestTimeToVisit: 'April to June & September to November',
    weatherAdvice: 'Pack an umbrella and chic layers for pleasant Parisian walking weather.',
    packingList: ['Comfortable walking shoes', 'Chic trench coat / sweater', 'Crossbody anti-theft bag', 'Universal EU plug adapter', 'Museum Pass voucher', 'Reusable water bottle'],
    localEtiquette: [
      'Always greet shopkeepers with "Bonjour Madame / Monsieur" upon entering.',
      'Keep speaking volume quiet in cafes, metros, and museums.',
      'Bread is placed directly on the table, not on the plate.',
    ],
    days: [
      {
        title: 'The Heart of Paris: Louvre & Seine River',
        theme: 'Masterpiece art and historic riverbanks',
        breakfast: 'Cafe de Flore - Croissant au beurre and rich chocolat chaud',
        lunch: 'Le Comptoir du Relais - Classic duck confit and French onion soup',
        dinner: 'Bistrot Paul Bert - Steak frites with peppercorn sauce and grand cru wine',
        tip: 'Book Louvre tickets in advance online for the 9:00 AM slot to enter through the Carrousel entrance.',
        spots: [
          { timeSlot: 'morning',   name: 'Louvre Museum & Tuileries Garden',        category: 'Art & Culture', location: 'Rue de Rivoli, 75001 Paris, France',                  cost: 22, duration: 180, rating: 4.8, desc: 'The world\'s largest art museum, home to the Mona Lisa, Venus de Milo, and Winged Victory.' },
          { timeSlot: 'afternoon', name: 'Sainte-Chapelle & Notre-Dame Square',      category: 'Sightseeing',   location: '10 Bd du Palais, 75001 Paris, France',               cost: 13, duration: 120, rating: 4.9, desc: 'Marvel at the breathtaking 13th-century stained glass windows that bathe the chapel in jewel-toned light.' },
          { timeSlot: 'evening',   name: 'Seine River Sunset Cruise & Pont Neuf',   category: 'Sightseeing',   location: 'Pont de l\'Alma, 75008 Paris, France',               cost: 18, duration: 120, rating: 4.8, desc: 'Glide past illuminated monuments and bridges as the Eiffel Tower begins its glittering sparkle.' },
        ],
      },
      {
        title: 'Bohemian Montmartre & Golden Arc de Triomphe',
        theme: 'Artists\' quarter and grand Parisian avenues',
        breakfast: 'La Maison Rose - Fresh pain au chocolat and espresso in Montmartre',
        lunch: 'Pink Mamma - Truffle pasta and fresh burrata in a glasshouse setting',
        dinner: 'Bouillon Pigalle - Traditional French fare in a lively brasserie',
        tip: 'Climb the dome of Sacre-Coeur for the highest panoramic view over all of Paris.',
        spots: [
          { timeSlot: 'morning',   name: 'Sacre-Coeur Basilica & Place du Tertre', category: 'Culture & Sightseeing',   location: '35 Rue du Chevalier de la Barre, 75018 Paris', cost: 0,  duration: 150, rating: 4.7, desc: 'White-domed basilica atop Montmartre hill where street artists paint portraits in the historic square.' },
          { timeSlot: 'afternoon', name: 'Champs-Elysees & Arc de Triomphe',       category: 'Sightseeing & Shopping', location: 'Pl. Charles de Gaulle, 75008 Paris',           cost: 16, duration: 150, rating: 4.8, desc: 'Walk down Paris\'s most famous avenue and ascend to the rooftop of the Arc for views of the 12 radiating avenues.' },
          { timeSlot: 'evening',   name: 'Eiffel Tower & Trocadero Viewpoint',     category: 'Sightseeing & Romance',  location: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris', cost: 30, duration: 120, rating: 4.9, desc: 'Watch the sunset from the Trocadero gardens and witness the Eiffel Tower light up in gold.' },
        ],
      },
    ],
  },
}

// ─── Currency conversion — keep ALL costs in USD internally, convert once ───────
function convertCost(usdAmount, currency) {
  if (currency === 'INR') return Math.round(usdAmount * 85)
  if (currency === 'EUR') return Math.round(usdAmount * 0.92)
  if (currency === 'GBP') return Math.round(usdAmount * 0.78)
  return Math.round(usdAmount)
}

// ─── Destination-aware activity cost index (raw USD per slot) ────────────────────
function destBaseCosts(normDest) {
  if (['dubai', 'abu dhabi', 'doha', 'singapore', 'zurich', 'geneva'].some(k => normDest.includes(k)))
    return { morning: 40, afternoon: 55, evening: 60 }
  if (['paris', 'london', 'amsterdam', 'rome', 'barcelona', 'tokyo', 'kyoto', 'osaka', 'sydney', 'new york', 'los angeles', 'san francisco'].some(k => normDest.includes(k)))
    return { morning: 25, afternoon: 35, evening: 40 }
  if (['bali', 'bangkok', 'phuket', 'ho chi minh', 'hanoi', 'kuala lumpur', 'istanbul', 'prague', 'budapest', 'mexico', 'cancun'].some(k => normDest.includes(k)))
    return { morning: 10, afternoon: 15, evening: 20 }
  if (['goa', 'mumbai', 'delhi', 'jaipur', 'agra', 'kerala', 'manali', 'kolkata', 'hyderabad', 'bangalore', 'pune', 'sri lanka', 'nepal', 'kathmandu', 'egypt', 'cairo'].some(k => normDest.includes(k)))
    return { morning: 4, afternoon: 6, evening: 8 }
  return { morning: 15, afternoon: 20, evening: 25 }
}

// ─── Per-person daily living costs in USD (accommodation + food + transport) ────
function dailyExpenses(normDest, budgetTier) {
  let base = { accommodation: 80, food: 40, transport: 20 }
  if (['dubai', 'abu dhabi', 'doha', 'singapore', 'zurich'].some(k => normDest.includes(k)))
    base = { accommodation: 180, food: 80, transport: 40 }
  else if (['paris', 'london', 'amsterdam', 'rome', 'barcelona', 'tokyo', 'sydney', 'new york'].some(k => normDest.includes(k)))
    base = { accommodation: 140, food: 60, transport: 30 }
  else if (['bali', 'bangkok', 'phuket', 'kuala lumpur', 'istanbul', 'prague', 'budapest', 'mexico'].some(k => normDest.includes(k)))
    base = { accommodation: 50, food: 25, transport: 12 }
  else if (['goa', 'mumbai', 'delhi', 'jaipur', 'kerala', 'manali', 'kolkata', 'hyderabad', 'bangalore'].some(k => normDest.includes(k)))
    base = { accommodation: 25, food: 12, transport: 6 }

  const tier = (budgetTier || '').toLowerCase()
  const m = tier.includes('luxury') ? 2.4 : tier.includes('budget') ? 0.45 : 1.0
  return {
    accommodation: Math.round(base.accommodation * m),
    food:          Math.round(base.food * m),
    transport:     Math.round(base.transport * m),
  }
}

// ─── 10-item pools — each day picks a different index so every day is unique ─────

const MORNING_POOL = [
  { label: 'Historic Old Town Walk',          category: 'Sightseeing',    desc: 'Wander through cobblestone lanes and centuries-old architecture in the historic heart of the city.' },
  { label: 'National Museum Visit',           category: 'Culture',        desc: 'Explore the flagship national museum housing priceless artefacts, traditional costumes, and historical exhibits.' },
  { label: 'Botanical Gardens & Park Stroll', category: 'Nature',         desc: 'Meander through beautifully curated gardens with rare flora, peaceful water features, and golden morning light.' },
  { label: 'Sunrise Viewpoint Hike',          category: 'Adventure',      desc: 'Trek up to the city\'s most celebrated viewpoint and catch breathtaking panoramic sunrise views.' },
  { label: 'Iconic Landmark Exploration',     category: 'Sightseeing',    desc: 'Visit the city\'s most recognisable landmark — an unmissable experience that defines the destination.' },
  { label: 'Traditional Morning Market',      category: 'Food & Culture', desc: 'Browse a lively local morning market brimming with fresh produce, spices, flowers, and street snacks.' },
  { label: 'Guided Heritage Walking Tour',    category: 'Culture',        desc: 'Discover stories behind grand colonial buildings, ancient squares, and hidden heritage laneways.' },
  { label: 'Sacred Temple or Shrine Visit',   category: 'Spiritual',      desc: 'Visit a revered place of worship — a serene spiritual landmark with stunning craftsmanship and local rituals.' },
  { label: 'City Panoramic Tower Ascent',     category: 'Sightseeing',    desc: 'Ascend the city\'s observation tower for sweeping bird\'s-eye-view photographs and city orientation.' },
  { label: 'Waterfront Promenade Walk',       category: 'Leisure',        desc: 'Enjoy a leisurely morning stroll along the scenic waterfront, watching boats and locals start their day.' },
]

const AFTERNOON_POOL = [
  { label: 'Local Artisan & Creative Quarter',    category: 'Culture & Shopping', desc: 'Stroll through a vibrant creative district lined with independent galleries, craft studios, and boutique cafes.' },
  { label: 'Archaeological Site Exploration',     category: 'History',            desc: 'Explore ancient ruins, archaeological digs, and outdoor heritage sites rich in historical significance.' },
  { label: 'Food Market & Culinary Tasting Tour', category: 'Food & Culture',     desc: 'Sample local cheeses, cured meats, pickled delicacies, and street snacks in a bustling covered market hall.' },
  { label: 'Scenic River or Harbour Cruise',      category: 'Sightseeing',        desc: 'Drift past the city\'s most iconic landmarks on a relaxing river or harbour cruise with live commentary.' },
  { label: 'Contemporary Art Museum',             category: 'Art',                desc: 'Discover thought-provoking contemporary art, design installations, and rotating international exhibitions.' },
  { label: 'Local Neighbourhood Discovery Walk',  category: 'Culture',            desc: 'Explore a residential neighbourhood loved by locals — cafes, murals, corner shops, and everyday life.' },
  { label: 'Hands-On Cooking or Craft Workshop',  category: 'Food & Culture',     desc: 'Learn to prepare 2–3 authentic local dishes or crafts under the guidance of a skilled local artisan.' },
  { label: 'Vintage Flea & Artisan Market',       category: 'Shopping',           desc: 'Hunt for unique souvenirs, vintage collectibles, handmade jewellery, and local crafts at a lively flea market.' },
  { label: 'Scenic Cable Car or Viewpoint Ride',  category: 'Adventure',          desc: 'Ride a scenic cable car or gondola up to elevated viewpoints for unforgettable aerial vistas over the landscape.' },
  { label: 'Royal Palace or Ancient Fort Tour',   category: 'History',            desc: 'Explore a grand royal palace or ancient fortress and learn about the dynasties that shaped the region.' },
]

const EVENING_POOL = [
  { label: 'Rooftop Bar & Sunset Views',            category: 'Nightlife',          desc: 'Sip signature cocktails while watching the sunset paint the city skyline in warm golden and pink hues.' },
  { label: 'Night Market & Street Food Trail',      category: 'Food & Nightlife',   desc: 'Dive into a vibrant night market packed with food stalls, grilled skewers, and dazzling festive lights.' },
  { label: 'Traditional Cultural Performance',      category: 'Culture',            desc: 'Attend a captivating evening performance of traditional dance, music, or theatrical arts unique to this region.' },
  { label: 'Waterfront Fine Dining & Stroll',       category: 'Food & Leisure',     desc: 'Enjoy a beautifully presented dinner at a waterfront restaurant as city lights reflect off the water.' },
  { label: 'Live Jazz or Local Music Venue',        category: 'Nightlife',          desc: 'Spend the evening in a cosy local bar featuring live acoustic or jazz music and artisan cocktails.' },
  { label: 'Illuminated Monuments Night Walk',      category: 'Sightseeing',        desc: 'Stroll past the city\'s grandest monuments beautifully lit at night — a photographer\'s perfect golden hour.' },
  { label: 'Sunset Harbour or River Evening Cruise',category: 'Sightseeing',        desc: 'Watch the sun dip below the horizon from the water as the city transforms into a glittering evening spectacle.' },
  { label: 'Atmospheric Evening Bazaar & Stroll',   category: 'Shopping & Leisure', desc: 'Wander through an atmospheric evening bazaar bustling with spice traders, lamp-lit stalls, and street performers.' },
  { label: 'Signature Restaurant Tasting Menu',     category: 'Food',               desc: 'Savour an exceptional tasting menu showcasing the very best of local and regional cuisine at an acclaimed restaurant.' },
  { label: 'Stargazing or Night Panorama Viewpoint',category: 'Leisure',            desc: 'Head to an elevated spot for stunning stargazing, night panoramas, and city light photography.' },
]

const BREAKFASTS = [
  'Neighbourhood Patisserie — Butter croissants, seasonal fruit tart & a rich café au lait',
  'Local Street Café — Traditional breakfast platter, fresh juice & regional bread with house-made jam',
  'Hotel Rooftop Buffet — Full spread of local & continental breakfast with panoramic city views',
  'Street-Side Food Cart — Freshly prepared local breakfast wrap & a steaming cup of spiced chai',
  'Artisan Bakery — Stone-baked sourdough with avocado, poached eggs & specialty cold brew',
  'Riverside Café — Fluffy pancakes drizzled with local honey & a refreshing fruit smoothie',
  'Old Town Tea House — Traditional savoury pastries paired with aromatic loose-leaf tea',
  'Local Market Stall — Steaming bowl of regional noodles or porridge with house condiments',
  'Garden Restaurant — Eggs Benedict, fresh-squeezed orange juice & a warm pastry basket',
  'Heritage Bungalow Café — Classic full breakfast with sausage, toast, beans & strong espresso',
]

const LUNCHES = [
  'Historic Bistro — Slow-cooked regional stew with crusty bread & a glass of house wine',
  'Covered Market Food Hall — Small plates: charcuterie, olives, cheeses & flavourful dips',
  'Waterfront Restaurant — Freshly caught fish of the day with seasonal vegetables & salad',
  'Local Thali House — Generous thali platter with six regional curries, rice, roti & pickle',
  'Street Food Lane — Mixed skewers, steamed dumplings & hand-pulled noodles from bustling stalls',
  'Garden Terrace Restaurant — Wood-fired flatbreads with mezze spreads & chilled lemonade',
  'Old Quarter Noodle Shop — Authentic noodle soup with aromatic broth, fresh herbs & crispy shallots',
  'Floating Restaurant — River fish, fried rice & fresh coconut water served on the water',
  'Artisan Kitchen — Thin-crust wood-fired pizza using locally sourced seasonal toppings',
  'Temple Town Eatery — Traditional vegetarian lunch: lentil soup, fresh bread & creamy yoghurt',
]

const DINNERS = [
  'Rooftop Fusion Terrace — Multi-course tasting menu with curated local wine pairings',
  'Family-Run Trattoria — Hearty home-style pasta, grilled meats & tiramisu by candlelight',
  'Night Market Feast — Graze across a dozen stalls of grilled meats, noodles & exotic desserts',
  'Riverside Seafood Grill — Freshest catch barbecued tableside with garlic butter & lemon wedges',
  'Heritage Mansion Dining — Dinner in a restored colonial mansion with live ambient music',
  'Spice Route Restaurant — Aromatic slow-cooked curries, fragrant biryani & flambéed desserts',
  'Wine Bar & Tapas Rooftop — Artisan charcuterie, bruschetta & local natural wines under the stars',
  'Harbour-View Steakhouse — Prime dry-aged steak with truffle butter & a view of glittering city lights',
  'Jazz Café & Supper Club — Dinner with live jazz trio, craft cocktails & seasonal sharing plates',
  'Beachside Barbecue — Lobster, tiger prawns & whole fish grilled over open flame at dusk',
]

const TIPS = [
  'Book popular attractions at least 24 hours in advance to skip queues and save money on the day.',
  'Download an offline city map the evening before — it\'s a lifesaver when data connectivity is poor.',
  'Start early (before 9 AM) to beat crowds at major sights and enjoy the best golden-hour light for photos.',
  'Ask your hotel concierge for a neighbourhood lunch spot — locals always know the hidden gems.',
  'Wear comfortable shoes today; you\'ll easily walk 10,000+ steps exploring the sights.',
  'Note down your accommodation\'s address in the local language — useful when hailing a taxi or tuk-tuk.',
  'Pay with exact change or small bills at market stalls — vendors appreciate it and you avoid overcharging.',
  'The best skyline shots are taken from the opposite riverbank or an elevated park, not tourist decks.',
  'Carry a light jacket — evenings can be surprisingly cool even in warm destinations.',
  'Visit the main landmark at dusk rather than midday for dramatic golden-hour photography and thinner crowds.',
]

const DAY_THEMES = [
  { title: 'Arrival & First Impressions',       theme: 'Settle in, orient yourself, and soak up the city\'s iconic welcome.' },
  { title: 'Historical Landmarks & Heritage',   theme: 'Uncover centuries of history through grand monuments and old quarters.' },
  { title: 'Local Markets & Culinary Trail',    theme: 'Follow your taste buds through street food stalls and authentic eateries.' },
  { title: 'Nature, Parks & Scenic Escapes',    theme: 'Breathe in the outdoors with gardens, viewpoints, and scenic trails.' },
  { title: 'Art, Culture & Museums',            theme: 'Immerse yourself in galleries, museums, and creative neighbourhoods.' },
  { title: 'Day Trip & Hidden Gems',            theme: 'Venture beyond the city centre to discover lesser-known local treasures.' },
  { title: 'Shopping, Fashion & Local Crafts',  theme: 'Explore local bazaars, designer lanes, and artisan workshops.' },
  { title: 'Relaxation & Wellness Day',         theme: 'Slow down, recharge, and indulge in the city\'s most peaceful corners.' },
  { title: 'Nightlife, Music & City Lights',    theme: 'Experience the city after dark — rooftop bars, live music, and panoramas.' },
  { title: 'Farewell Morning & Last Wanders',   theme: 'A gentle final morning to revisit favourites before heading home.' },
]

// ─── Content helpers ─────────────────────────────────────────────────────────────
function getDayTitle(destination, d, total) {
  if (d === 1)     return `Arrival Day — First Taste of ${destination}`
  if (d === total && total > 1) return `Farewell Day — Last Memories of ${destination}`
  return `${DAY_THEMES[(d - 1) % DAY_THEMES.length].title} in ${destination}`
}

function getDayTheme(d) { return DAY_THEMES[(d - 1) % DAY_THEMES.length].theme }
function getBreakfast(d) { return BREAKFASTS[(d - 1) % BREAKFASTS.length] }
function getLunch(d)     { return LUNCHES[(d - 1)    % LUNCHES.length] }
function getDinner(d)    { return DINNERS[(d - 1)    % DINNERS.length] }
function getTip(d)       { return TIPS[(d - 1)       % TIPS.length] }

function buildGenericActivities(destination, d, baseCosts) {
  // Each day uses a distinct pool index — 10 items ensure no repeats up to 10-day trips
  const mi = (d - 1) % MORNING_POOL.length
  const ai = (d - 1) % AFTERNOON_POOL.length
  const ei = (d - 1) % EVENING_POOL.length

  const m = MORNING_POOL[mi]
  const a = AFTERNOON_POOL[ai]
  const e = EVENING_POOL[ei]

  const ratingBase = (d % 4) * 0.1

  return [
    {
      timeSlot: 'morning',
      name:     m.label,
      category: m.category,
      location: `${m.label}, ${destination}`,
      cost:     baseCosts.morning,
      duration: 120,
      rating:   parseFloat((4.5 + ratingBase).toFixed(1)),
      desc:     m.desc,
    },
    {
      timeSlot: 'afternoon',
      name:     a.label,
      category: a.category,
      location: `${a.label}, ${destination}`,
      cost:     baseCosts.afternoon,
      duration: 150,
      rating:   parseFloat((4.4 + ratingBase).toFixed(1)),
      desc:     a.desc,
    },
    {
      timeSlot: 'evening',
      name:     e.label,
      category: e.category,
      location: `${e.label}, ${destination}`,
      cost:     baseCosts.evening,
      duration: 120,
      rating:   parseFloat((4.5 + ratingBase).toFixed(1)),
      desc:     e.desc,
    },
  ]
}

// ─── Main fallback generator ──────────────────────────────────────────────────────
export function generateSmartFallbackItinerary({
  destination,
  duration = 3,
  budgetTier = 'Moderate',
  currency = 'USD',
  groupSize = 2,
  travelStyle = 'Culture & Sightseeing',
  pace = 'Balanced',
}) {
  const normDest = destination.toLowerCase().trim()
  const presetKey = Object.keys(DESTINATION_PRESETS).find((k) => normDest.includes(k))
  const preset = presetKey ? DESTINATION_PRESETS[presetKey] : null

  const days = []
  let activityCostUSD = 0

  for (let d = 1; d <= duration; d++) {
    // Use preset day ONLY if it exists at this exact index — never loop/repeat
    const presetDay = preset?.days?.[d - 1] ?? null

    const dayTitle  = presetDay?.title     || getDayTitle(destination, d, duration)
    const dayTheme  = presetDay?.theme     || getDayTheme(d)
    const breakfast = presetDay?.breakfast || getBreakfast(d)
    const lunch     = presetDay?.lunch     || getLunch(d)
    const dinner    = presetDay?.dinner    || getDinner(d)
    const tip       = presetDay?.tip       || getTip(d)

    const baseCosts = destBaseCosts(normDest)
    const rawActivities = presetDay?.spots || buildGenericActivities(destination, d, baseCosts)

    const activities = rawActivities.map((act) => {
      const rawUSD  = Number(act.cost) || 0
      activityCostUSD += rawUSD
      return {
        timeSlot:        act.timeSlot,
        name:            act.name,
        description:     act.desc,
        category:        act.category,
        locationName:    act.location,
        estimatedCost:   convertCost(rawUSD, currency), // single conversion here
        durationMinutes: act.duration,
        rating:          act.rating,
      }
    })

    days.push({ dayNumber: d, title: dayTitle, theme: dayTheme, breakfastRecommendation: breakfast, lunchRecommendation: lunch, dinnerRecommendation: dinner, dailyTip: tip, activities })
  }

  const { accommodation, food, transport } = dailyExpenses(normDest, budgetTier)
  const totalUSD = activityCostUSD + (accommodation + food + transport) * duration * groupSize

  return {
    tripTitle:          preset?.title || `${duration}-Day ${travelStyle} Journey in ${destination}`,
    destination,
    duration,
    budgetTier,
    currency,
    totalEstimatedCost: convertCost(totalUSD, currency),
    summary:            preset?.summary || `A beautifully crafted ${duration}-day travel experience in ${destination}, balanced with top-rated attractions, authentic culinary gems, and smooth daily routes.`,
    bestTimeToVisit:    preset?.bestTimeToVisit || 'Spring & Autumn for pleasant sightseeing weather',
    weatherAdvice:      preset?.weatherAdvice   || 'Check local weather before packing; carry comfortable walking shoes and versatile layers.',
    packingList:        preset?.packingList     || ['Comfortable walking shoes', 'Universal power adapter', 'Portable power bank', 'Weather-appropriate jacket', 'Reusable water bottle', 'Daypack for daily excursions'],
    localEtiquette:     preset?.localEtiquette  || ['Always greet locals politely before asking for directions or ordering.', 'Check whether local transit tickets require validation before boarding.', 'Keep digital copies of passport and essential travel documents in cloud storage.', 'Carry some local cash for smaller vendors and public restrooms.'],
    days,
    isFallback: true,
  }
}

// ─── OpenAI generation with fallback ─────────────────────────────────────────────
export async function generateItinerary({
  destination,
  startDate,
  duration,
  budgetTier,
  currency = 'USD',
  groupSize = 1,
  travelStyle = 'Culture & Sightseeing',
  interests = [],
  dietaryRestrictions = 'None',
  pace = 'Balanced',
  specialNotes = '',
}) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  if (process.env.OPENAI_API_KEY) {
    try {
      const prompt = `You are a world-renowned local travel guide, concierge, and trip planner.
Generate a comprehensive, highly realistic, day-by-day travel itinerary based on the following traveler profile:

Travel Details:
- Destination: ${destination}
- Duration: ${duration} days
- Start Date: ${startDate || 'Flexible'}
- Group Size: ${groupSize} person(s) (${groupSize === 1 ? 'Solo Traveler' : groupSize === 2 ? 'Couple' : 'Group/Family'})
- Budget Tier: ${budgetTier} (Currency: ${currency})
- Travel Style: ${travelStyle}
- Specific Interests: ${interests.length > 0 ? interests.join(', ') : 'Popular Highlights, Local Hidden Gems, Food'}
- Pace of Travel: ${pace}
- Dietary Preferences: ${dietaryRestrictions}
- Special Notes / Must-See Spots: ${specialNotes || 'None provided'}

Instructions:
1. Provide an exact, high-quality, authentic day-by-day plan for all ${duration} days.
2. For EVERY day, provide exactly 3 distinct activity time slots: "morning", "afternoon", and "evening".
3. EVERY DAY MUST BE COMPLETELY DIFFERENT — different neighbourhoods, different categories, different vibes.
4. Use REAL, exact spot/attraction names that exist in Google Maps so they can be geolocated precisely.
5. Include accurate estimated costs in ${currency} matching the "${budgetTier}" budget tier.
6. Provide specific breakfast, lunch, and dinner recommendations (naming real local restaurants, cafes, food markets, or local specialties).
7. Include practical local advice: best time to visit, weather advice, 6-8 smart packing list items, and 4-6 local etiquette / cultural tips.

Format your entire response strictly as valid JSON conforming to this schema:
{
  "tripTitle": "Engaging, creative title for the trip",
  "destination": "${destination}",
  "duration": ${duration},
  "budgetTier": "${budgetTier}",
  "currency": "${currency}",
  "totalEstimatedCost": 1200,
  "summary": "2-3 sentences overview of the travel experience",
  "bestTimeToVisit": "Best months and seasons to visit",
  "weatherAdvice": "Expected climate and tips for dressing",
  "packingList": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"],
  "localEtiquette": [
    "Tip 1 regarding local customs, tipping, or transit etiquette",
    "Tip 2 regarding payments (cash vs card)",
    "Tip 3 regarding local phrases or safety"
  ],
  "days": [
    {
      "dayNumber": 1,
      "title": "Day 1 Theme Title",
      "theme": "Brief highlight of the day's focus",
      "breakfastRecommendation": "Cafe/Restaurant Name - What to order",
      "lunchRecommendation": "Restaurant/Bistro Name - Recommended dish",
      "dinnerRecommendation": "Dining Venue - Atmosphere and specialty",
      "dailyTip": "Insider transportation or timing tip for this specific day",
      "activities": [
        {
          "timeSlot": "morning",
          "name": "Exact Real Spot Name",
          "description": "2-3 sentences describing the experience, history, and what to see",
          "category": "Sightseeing",
          "locationName": "Real Landmark Name or Address, City, Country",
          "estimatedCost": 25,
          "durationMinutes": 120,
          "rating": 4.8
        },
        {
          "timeSlot": "afternoon",
          "name": "Exact Real Spot Name",
          "description": "Engaging description of afternoon activity",
          "category": "Culture",
          "locationName": "Real Landmark Name or Address, City, Country",
          "estimatedCost": 15,
          "durationMinutes": 150,
          "rating": 4.7
        },
        {
          "timeSlot": "evening",
          "name": "Exact Real Spot Name",
          "description": "Engaging description of evening activity/views/walk",
          "category": "Food & Nightlife",
          "locationName": "Real Landmark Name or Address, City, Country",
          "estimatedCost": 30,
          "durationMinutes": 120,
          "rating": 4.9
        }
      ]
    }
  ]
}`

      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are an expert AI travel itinerary planner. Always return clean, well-formatted JSON without any markdown formatting wrappers or commentary.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.85,
      })

      const content = response.choices[0]?.message?.content
      if (content) return JSON.parse(content)
    } catch (openaiError) {
      console.warn('OpenAI API request failed (using smart fallback generator):', openaiError?.message || openaiError)
    }
  }

  return generateSmartFallbackItinerary({ destination, duration, budgetTier, currency, groupSize, travelStyle, pace })
}

export default openai
