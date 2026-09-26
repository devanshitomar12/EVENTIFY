const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');
const { generateBookingId } = require('./utils/generateId');
const { generateBookingQRCode } = require('./services/qrService');
const logger = require('./utils/logger');

const seedData = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    logger.info('Database connected. Clearing existing collections...');

    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();

    logger.info('Creating standard users and organizers...');

    // 1. Create Users
    const admin = await User.create({
      name: 'Elena Rostova',
      email: 'admin@eventify.com',
      password: 'Admin@123',
      role: 'ADMIN',
      phone: '+1 (555) 019-2834',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    });

    const organizer1 = await User.create({
      name: 'Nexus Summit Group',
      email: 'organizer@eventify.com',
      password: 'Organizer@123',
      role: 'ORGANIZER',
      phone: '+1 (555) 349-8120',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    });

    const organizer2 = await User.create({
      name: 'Vanguard Audio & Live',
      email: 'live@vanguardevents.io',
      password: 'Organizer@123',
      role: 'ORGANIZER',
      phone: '+1 (555) 872-4519',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
    });

    const organizer3 = await User.create({
      name: 'Catalyst Labs Global',
      email: 'events@catalystlabs.org',
      password: 'Organizer@123',
      role: 'ORGANIZER',
      phone: '+1 (555) 923-1029',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
    });

    const attendeeUser = await User.create({
      name: 'Marcus Vance',
      email: 'user@eventify.com',
      password: 'User@123',
      role: 'USER',
      phone: '+1 (555) 438-9921',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
    });

    const attendeeUser2 = await User.create({
      name: 'Sophia Chen',
      email: 'sophia.chen@gmail.com',
      password: 'User@123',
      role: 'USER',
      phone: '+1 (555) 781-3401',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
    });

    logger.info('Creating 12 realistic events across diverse categories...');

    // 2. Create Events
    const eventsData = [
      {
        title: 'Global AI & Deep Tech Summit 2026',
        description: 'Explore the vanguard of Artificial General Intelligence, foundation models, spatial computing, and robotic autonomy. Featuring keynote speeches from world-leading researchers, hands-on workshop labs, and exclusive VIP venture capital matchmaking.',
        category: 'Technology',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // in 18 days
        startTime: '09:00 AM',
        endTime: '06:00 PM',
        venue: 'Moscone Convention Center',
        address: '747 Howard St',
        city: 'San Francisco',
        organizer: organizer1._id,
        featured: true,
        status: 'APPROVED',
        rules: [
          'Badge pickup opens at 08:00 AM on Day 1.',
          'Laptops permitted in all workshop tracks.',
          'Live video recording is prohibited without a Press credential.'
        ],
        ticketTypes: [
          { name: 'General Admission', price: 199, quantity: 500, sold: 142, description: 'Access to all keynotes and expo hall' },
          { name: 'VIP Pass', price: 499, quantity: 150, sold: 68, description: 'VIP lounge, speaker meet-and-greet, lunch included' },
          { name: 'Executive All-Access', price: 899, quantity: 50, sold: 24, description: 'Private investor salon, evening gala, full recordings' }
        ]
      },
      {
        title: 'Neon Horizon Symphony & Electronic Festival',
        description: 'An immersive fusion of a 60-piece philharmonic orchestra with boundary-pushing modular synthesizer soundscapes and synchronized volumetric laser projection. An audio-visual experience unlike anything else.',
        category: 'Music',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        startTime: '07:30 PM',
        endTime: '11:45 PM',
        venue: 'Red Rocks Amphitheatre',
        address: '18300 W Alameda Pkwy',
        city: 'Denver',
        organizer: organizer2._id,
        featured: true,
        status: 'APPROVED',
        rules: [
          'Age restriction: 18+ only with government-issued photo ID.',
          'Event takes place rain or shine under open skies.',
          'No outside alcoholic beverages or glass containers.'
        ],
        ticketTypes: [
          { name: 'General Lawn', price: 85, quantity: 800, sold: 410, description: 'Open lawn seating with panoramic amphitheatre views' },
          { name: 'Reserved Pavilion', price: 145, quantity: 300, sold: 195, description: 'Numbered tiered seating with prime acoustics' },
          { name: 'Backstage VIP', price: 295, quantity: 80, sold: 55, description: 'Backstage lounge, open bar, artist pass' }
        ]
      },
      {
        title: 'Venture Velocity: Founder & Investor Forum',
        description: 'Where hyper-growth startups meet tier-1 institutional capital. Over $2B in venture capital represented across SaaS, climate tech, fintech, and biomedical engineering. Includes structured 1-on-1 pitch sessions.',
        category: 'Business',
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        startTime: '08:30 AM',
        endTime: '05:00 PM',
        venue: 'The Glasshouse',
        address: '660 12th Ave',
        city: 'New York',
        organizer: organizer1._id,
        featured: true,
        status: 'APPROVED',
        rules: [
          'Business professional or smart casual attire recommended.',
          'Digital business card exchange available through Eventify app.',
          'NDA signed on entry for closed-door pitch sessions.'
        ],
        ticketTypes: [
          { name: 'Founder Pass', price: 249, quantity: 200, sold: 90, description: 'Full access to pitches, workshops and networking app' },
          { name: 'Investor Pass', price: 650, quantity: 100, sold: 62, description: 'Includes deal-flow directory and private deal room access' }
        ]
      },
      {
        title: 'Apex Half Marathon & 10K City Run',
        description: 'Run through scenic coastal roadways, historic downtown plazas, and finishing along the iconic waterfront promenade. Certified Boston Marathon qualifier with pacers, hydration stations, and a vibrant post-race festival.',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
        startTime: '06:00 AM',
        endTime: '12:00 PM',
        venue: 'Marina Green Park',
        address: 'Marina Blvd & Scott St',
        city: 'San Francisco',
        organizer: organizer3._id,
        featured: false,
        status: 'APPROVED',
        rules: [
          'Bib pickup takes place the day prior at the Health Expo.',
          'Bicycles, rollerblades, and unregistered pets are prohibited on course.',
          'Course cutoff time is 3 hours 30 minutes.'
        ],
        ticketTypes: [
          { name: '10K Race Entry', price: 65, quantity: 600, sold: 340, description: 'Includes finisher medal, technical race t-shirt, chip timing' },
          { name: 'Half Marathon Entry', price: 110, quantity: 800, sold: 580, description: 'Includes premium medal, finisher jacket, post-race recovery zone' }
        ]
      },
      {
        title: 'NextGen Design Systems & UI Architecture Masterclass',
        description: 'A comprehensive intensive workshop for senior product designers and frontend engineers. Dive deep into scalable token architecture, atomic design, cross-framework interoperability, accessibility compliance, and micro-motion choreography.',
        category: 'Workshops',
        image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        startTime: '10:00 AM',
        endTime: '04:30 PM',
        venue: 'Studio 45 Creative Hub',
        address: '45 Main Street',
        city: 'Seattle',
        organizer: organizer3._id,
        featured: false,
        status: 'APPROVED',
        rules: [
          'Please bring a laptop with Figma and Node.js installed.',
          'All design system kits and code repositories provided prior to the session.'
        ],
        ticketTypes: [
          { name: 'Standard Workshop Seat', price: 175, quantity: 60, sold: 38, description: 'Full day hands-on lab with take-home codebases and Figma assets' },
          { name: 'Group Duo Pass (2 Seats)', price: 300, quantity: 20, sold: 12, description: 'Discounted admission for two colleagues' }
        ]
      },
      {
        title: 'Culinary Alchemy: Modern Gastronomy & Wine Tasting',
        description: 'Seven courses crafted by Michelin-starred culinary innovators celebrating molecular gastronomy, paired with vintage biodynamic wines. Meet the chefs, explore sensory gastronomy, and enjoy live acoustic jazz.',
        category: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        startTime: '06:30 PM',
        endTime: '10:00 PM',
        venue: 'The Grand Conservatory',
        address: '120 Commonwealth Ave',
        city: 'Boston',
        organizer: organizer2._id,
        featured: false,
        status: 'APPROVED',
        rules: [
          'Guests must be 21+ with government photo identification.',
          'Please inform organizers of severe allergies 48 hours in advance.'
        ],
        ticketTypes: [
          { name: '7-Course Tasting Menu', price: 160, quantity: 80, sold: 64, description: 'Full course dinner with welcome cocktail' },
          { name: 'Sommelier Wine Pairing Tier', price: 235, quantity: 50, sold: 42, description: 'Includes cellar reserve wine pairings per course' }
        ]
      },
      {
        title: 'Future of Education & EdTech Leadership Conference',
        description: 'Bringing together university deans, digital learning pioneers, curriculum architects, and policymakers to debate generative AI in the classroom, adaptive learning analytics, and global micro-credentialing standards.',
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        startTime: '09:00 AM',
        endTime: '05:30 PM',
        venue: 'McCormick Place',
        address: '2301 S King Dr',
        city: 'Chicago',
        organizer: organizer1._id,
        featured: false,
        status: 'APPROVED',
        rules: [
          'Academic and student discounts require verified institution credentials.',
          'All presentations and research papers will be archived in the digital library.'
        ],
        ticketTypes: [
          { name: 'Educator Pass', price: 120, quantity: 250, sold: 98, description: 'Subsidized pass for verified educators and academic staff' },
          { name: 'Corporate Delegate', price: 340, quantity: 150, sold: 82, description: 'For technology vendors and corporate training leads' }
        ]
      },
      {
        title: 'International Cybersecurity & Ethical Hacking Summit',
        description: 'Two days of deep-dive zero-day vulnerability analysis, live red-team vs blue-team cyber defense simulations, hardware hacking villages, and discussions on nation-state cyber threats.',
        category: 'Conferences',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        startTime: '08:00 AM',
        endTime: '06:00 PM',
        venue: 'Austin Convention Center',
        address: '500 E Cesar Chavez St',
        city: 'Austin',
        organizer: organizer1._id,
        featured: true,
        status: 'APPROVED',
        rules: [
          'Strict no-unauthorized-network-scanning policy on public summit Wi-Fi.',
          'CTF competition rules provided during morning briefing.'
        ],
        ticketTypes: [
          { name: 'Standard Conference Pass', price: 275, quantity: 400, sold: 215, description: 'Access to all keynote auditoriums and expo floor' },
          { name: 'CTF Competitor & Workshop Pass', price: 420, quantity: 120, sold: 88, description: 'Includes hardware hacking kit and CTF registration' }
        ]
      },
      {
        title: 'Sunset Rooftop Indie Film Showcase & Panel',
        description: 'An open-air evening screening of award-winning independent cinema shorts from Cannes, Sundance, and Tribeca. Includes an interactive Q&A discussion with directors and cinematographers over craft cocktails.',
        category: 'Entertainment',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        startTime: '07:00 PM',
        endTime: '10:30 PM',
        venue: 'Skyline Terrace Lounge',
        address: '800 Wilshire Blvd',
        city: 'Los Angeles',
        organizer: organizer2._id,
        featured: false,
        status: 'APPROVED',
        rules: [
          'Seating is first-come, first-served within each ticket tier.',
          'Heaters and fleece blankets provided for cooler evening temperatures.'
        ],
        ticketTypes: [
          { name: 'General Admission', price: 45, quantity: 120, sold: 84, description: 'Rooftop seating with complimentary artisanal popcorn' },
          { name: 'Reserved Lounge Sofa + Cocktails', price: 95, quantity: 40, sold: 35, description: 'Prime cushioned lounge seating with two signature drinks' }
        ]
      },
      {
        title: 'Cloud Native & Kubernetes DevOps Bootcamp',
        description: 'Master enterprise-scale container orchestration, GitOps workflows with ArgoCD, service mesh telemetry with Istio, and multi-cloud resilience architecture in an intensive hands-on environment.',
        category: 'Workshops',
        image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        startTime: '09:30 AM',
        endTime: '04:00 PM',
        venue: 'TechForward Labs',
        address: '100 South Wacker Dr',
        city: 'Chicago',
        organizer: organizer3._id,
        featured: false,
        status: 'APPROVED',
        rules: [
          'Familiarity with Docker and basic Linux shell commands is expected.',
          'Free cloud sandboxes will be provisioned for each attendee.'
        ],
        ticketTypes: [
          { name: 'Developer Seat', price: 210, quantity: 70, sold: 45, description: 'Includes live sandbox clusters and cloud credits' }
        ]
      },
      {
        title: 'Pacific Coast Gravel Cycling Challenge',
        description: 'Tackle 75 miles of rugged coastal bluffs, redwood canopy climbs, and fire-road gravel descents. Includes timing chip, mechanical neutral support, aid stations, and post-ride barbecue.',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        startTime: '07:00 AM',
        endTime: '03:00 PM',
        venue: 'Point Reyes Station Grounds',
        address: '11101 CA-1',
        city: 'San Francisco',
        organizer: organizer3._id,
        featured: false,
        status: 'APPROVED',
        rules: [
          'Helmets mandatory at all times during the ride.',
          'Gravel or mountain bike with minimum 38mm tire width strongly recommended.'
        ],
        ticketTypes: [
          { name: 'Rider Registration', price: 89, quantity: 300, sold: 180, description: 'Includes official jersey, timing chip, and post-ride lunch' }
        ]
      },
      {
        title: 'Global Fintech & Decentralized Banking Forum',
        description: 'Examining real-time payment rails, FedNow integrations, CBDCs, cross-border remittance compliance, and institutional asset tokenization.',
        category: 'Conferences',
        image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        startTime: '08:30 AM',
        endTime: '05:00 PM',
        venue: 'Financial District Marriott Ballroom',
        address: '85 West St',
        city: 'New York',
        organizer: organizer1._id,
        featured: false,
        status: 'APPROVED',
        rules: [
          'Pre-registration required. Photo identification verified at reception.'
        ],
        ticketTypes: [
          { name: 'Delegate Pass', price: 320, quantity: 250, sold: 110, description: 'Access to all panels and cocktail networking reception' },
          { name: 'VIP Banker Pass', price: 750, quantity: 60, sold: 34, description: 'Exclusive breakfast roundtable with keynote regulators' }
        ]
      }
    ];

    const createdEvents = await Event.insertMany(eventsData);
    logger.info(`Inserted ${createdEvents.length} events successfully.`);

    // 3. Create Sample Bookings with real QR Codes for test accounts
    logger.info('Generating realistic sample bookings...');

    const sampleBookingSpecs = [
      {
        user: attendeeUser,
        event: createdEvents[0], // Global AI Summit
        tickets: [
          { ticketType: 'General Admission', price: 199, quantity: 2 }
        ],
        totalAmount: 398,
        status: 'Confirmed'
      },
      {
        user: attendeeUser,
        event: createdEvents[1], // Neon Horizon Symphony
        tickets: [
          { ticketType: 'Reserved Pavilion', price: 145, quantity: 1 }
        ],
        totalAmount: 145,
        status: 'Confirmed'
      },
      {
        user: attendeeUser2,
        event: createdEvents[2], // Venture Velocity
        tickets: [
          { ticketType: 'Founder Pass', price: 249, quantity: 1 }
        ],
        totalAmount: 249,
        status: 'Confirmed'
      }
    ];

    for (const spec of sampleBookingSpecs) {
      const bId = generateBookingId();
      const qrData = await generateBookingQRCode({
        bookingId: bId,
        eventId: spec.event._id,
        eventTitle: spec.event.title,
        attendeeName: spec.user.name,
        tickets: spec.tickets,
        totalAmount: spec.totalAmount,
        verified: true
      });

      await Booking.create({
        bookingId: bId,
        user: spec.user._id,
        event: spec.event._id,
        tickets: spec.tickets,
        totalAmount: spec.totalAmount,
        status: spec.status,
        qrCode: qrData,
        attendeeDetails: {
          name: spec.user.name,
          email: spec.user.email,
          phone: spec.user.phone
        }
      });
    }

    logger.info('✅ Database seeded successfully with users, events, and bookings!');
    logger.info('----------------------------------------------------');
    logger.info('Test Credentials:');
    logger.info('  Admin:     admin@eventify.com     / Admin@123');
    logger.info('  Organizer: organizer@eventify.com / Organizer@123');
    logger.info('  User:      user@eventify.com      / User@123');
    logger.info('----------------------------------------------------');

    return { success: true };
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
};

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedData };
