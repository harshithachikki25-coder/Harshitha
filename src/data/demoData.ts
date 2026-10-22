import { StandardEventRecord } from '../types';

// Deterministic Pseudo-Random Number Generator (PRNG) to ensure consistent, reproducible 1,000+ rows
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const DEPARTMENTS = [
  'Computer Science',
  'Electronics & Comm',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Biotechnology',
  'Management Studies',
];

const CATEGORIES = [
  'Technical',
  'Workshop',
  'Hackathon',
  'Cultural',
  'Seminar',
  'Sports',
  'Guest Lecture',
  'Exhibition',
];

const VENUES = [
  'Main Auditorium',
  'Tech Park Hall 1',
  'Tech Park Hall 2',
  'Central Seminar Hall',
  'Open Air Amphitheatre',
  'Sports Complex',
  'Computer Center Lab A',
  'Mechanical Block Arena',
  'Biotech Research Floor',
];

const EVENT_TITLE_PREFIXES: Record<string, string[]> = {
  Technical: ['AI & Neural Nets', 'Quantum Computing', 'Cloud Architecture', 'Cybersecurity', 'Web3 & Blockchain', 'Robotics Showcase', 'Autonomous Systems', 'Data Science', 'Embedded IoT', 'Fullstack'],
  Workshop: ['Hands-on Flutter', 'Docker & Kubernetes', 'VLSI Design', 'CATIA 3D Modeling', 'Ethical Hacking', 'PCB Fabrication', 'CRISPR Gene Editing', 'Financial Modeling', 'React & Node', 'CNC Machining'],
  Hackathon: ['CodeSprint', 'Hack-AI-Thon', 'Smart India Prep', 'ByteQuest', 'Makeathon 24hr', 'FinTech Challenge', 'GreenTech Hack', 'DevHacks', 'CodeWars', 'CyberStrike'],
  Cultural: ['Tarang Spring Fest', 'Classical Raga Eve', 'Battle of Bands', 'Theatrics Drama Fest', 'Choreography Night', 'Literary Debate', 'Monologue Slam', 'Acoustic Unplugged', 'Film Screening', 'Street Play'],
  Seminar: ['Clean Energy Future', 'Smart Cities Infrastructure', 'AI in Healthcare', 'Microgrids Integration', 'Nanotechnology Frontiers', 'Space Tech & Satellites', 'Semiconductor Policy', 'Supply Chain 4.0'],
  Sports: ['Inter-Dept Cricket Cup', 'Badminton Smash League', 'Intra-College Football', 'Basketball Showdown', 'Table Tennis Championship', 'Chess Grand Prix', 'Volleyball Clash', 'Annual Athletics Sprint'],
  'Guest Lecture': ['Industry 5.0 with Google Lead', 'Venture Capital 101', 'Space Exploration by ISRO Scientist', 'Intel Hardware Architecture', 'Bio-Informatics Horizons', 'Patents and IP Law', 'Leadership & Ethics'],
  Exhibition: ['Engineers Day Expo', 'Sustainable Tech Project Expo', 'Autonomous Drones Display', 'RoboWars Arena Exhibition', 'Civil Bridge Model Contest', 'Biotech Innovation Fair', 'Design Thinking Showcase'],
};

export function generateDemoDataset(count: number = 1050): StandardEventRecord[] {
  const rand = seededRandom(42);
  const records: StandardEventRecord[] = [];

  const startYear = 2025;

  for (let i = 1; i <= count; i++) {
    const id = `EVT-${String(i).padStart(4, '0')}`;
    const category = CATEGORIES[Math.floor(rand() * CATEGORIES.length)];
    const department = DEPARTMENTS[Math.floor(rand() * DEPARTMENTS.length)];
    const venue = VENUES[Math.floor(rand() * VENUES.length)];

    const prefixes = EVENT_TITLE_PREFIXES[category] || ['Campus'];
    const prefix = prefixes[Math.floor(rand() * prefixes.length)];
    const suffixTypes = ['Summit', 'Workshop', 'Challenge', 'Conclave', 'Symposium', 'Meet', 'Championship', 'Forum', 'Camp'];
    const suffix = suffixTypes[Math.floor(rand() * suffixTypes.length)];
    const eventName = `${prefix} ${suffix} ${i % 12 === 0 ? 'Annual' : ''}`.trim();

    // Date generation across 2025
    const month = Math.floor(rand() * 12);
    const day = Math.floor(rand() * 28) + 1;
    const dateStr = `${startYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Capacity based on venue
    let baseCapacity = 100;
    if (venue.includes('Auditorium')) baseCapacity = 600 + Math.floor(rand() * 400);
    else if (venue.includes('Amphitheatre')) baseCapacity = 500 + Math.floor(rand() * 300);
    else if (venue.includes('Sports')) baseCapacity = 300 + Math.floor(rand() * 400);
    else if (venue.includes('Tech Park')) baseCapacity = 150 + Math.floor(rand() * 150);
    else if (venue.includes('Lab')) baseCapacity = 40 + Math.floor(rand() * 40);
    else baseCapacity = 80 + Math.floor(rand() * 100);

    // Participants with realistic utilization (normally 60% to 110%)
    let utilizationRatio = 0.5 + rand() * 0.65;
    // occasional overflow or under-attended
    if (rand() < 0.08) utilizationRatio = 0.2 + rand() * 0.25; // low attendance
    if (rand() < 0.08) utilizationRatio = 1.05 + rand() * 0.25; // oversubscribed

    const participants = Math.max(12, Math.round(baseCapacity * utilizationRatio));
    const capacity = baseCapacity;

    // Rating: 3.2 to 4.9, correlated mildly with attendance
    const baseRating = 3.6 + rand() * 1.2;
    const rating = Math.min(5.0, Math.max(2.8, Number((baseRating + (utilizationRatio > 0.8 ? 0.2 : -0.2)).toFixed(1))));

    // Budget: $200 - $12,000 depending on category
    let budgetFactor = 1.0;
    if (category === 'Hackathon') budgetFactor = 3.5;
    if (category === 'Cultural') budgetFactor = 4.0;
    if (category === 'Technical') budgetFactor = 2.0;
    if (category === 'Sports') budgetFactor = 2.2;
    if (category === 'Guest Lecture') budgetFactor = 1.2;

    const budget = Math.round((400 + rand() * 2500) * budgetFactor);

    // Duration in hours: 1 to 24 (hackathons)
    let durationHours = category === 'Hackathon' ? (rand() > 0.5 ? 24 : 12) : Math.round((1.5 + rand() * 4.5) * 2) / 2;

    // Feedback count: ~20% - 65% of participants
    const feedbackRatio = 0.25 + rand() * 0.45;
    const feedbackCount = Math.round(participants * feedbackRatio);

    const capacityUtilization = Number(((participants / capacity) * 100).toFixed(1));
    const budgetPerParticipant = Number((budget / participants).toFixed(1));

    records.push({
      id,
      eventName,
      category,
      department,
      eventDate: dateStr,
      participants,
      capacity,
      rating,
      budget,
      venue,
      durationHours,
      feedbackCount,
      capacityUtilization,
      budgetPerParticipant,
      feedbackRatio: Number((feedbackCount / participants).toFixed(2)),
    });
  }

  return records;
}

// Generate default 1,050 records
export const DEMO_DATASET: StandardEventRecord[] = generateDemoDataset(1050);
