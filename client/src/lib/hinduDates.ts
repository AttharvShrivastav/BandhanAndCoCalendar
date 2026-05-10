// Hindu Calendar Data for 2026 — Auspicious Wedding Muhurats + Major Festivals

export interface HinduEvent {
  date: string; // YYYY-MM-DD
  name: string;
  type: "muhurat" | "festival" | "vrat" | "inauspicious";
  nakshatra?: string;
  timing?: string;
}

// Major Hindu festivals 2026
export const hinduFestivals: HinduEvent[] = [
  { date: "2026-01-13", name: "Lohri", type: "festival" },
  { date: "2026-01-14", name: "Makar Sankranti / Pongal", type: "festival" },
  { date: "2026-01-23", name: "Vasant Panchami", type: "festival" },
  { date: "2026-02-01", name: "Thaipusam", type: "festival" },
  { date: "2026-02-15", name: "Maha Shivaratri", type: "festival" },
  { date: "2026-03-03", name: "Holika Dahan", type: "festival" },
  { date: "2026-03-04", name: "Holi", type: "festival" },
  { date: "2026-03-19", name: "Ugadi / Gudi Padwa", type: "festival" },
  { date: "2026-03-27", name: "Ram Navami", type: "festival" },
  { date: "2026-04-02", name: "Hanuman Jayanti", type: "festival" },
  { date: "2026-04-14", name: "Vaisakhi / Tamil New Year", type: "festival" },
  { date: "2026-04-19", name: "Akshaya Tritiya", type: "festival" },
  { date: "2026-07-16", name: "Rath Yatra", type: "festival" },
  { date: "2026-07-29", name: "Guru Purnima", type: "festival" },
  { date: "2026-08-17", name: "Nag Panchami", type: "festival" },
  { date: "2026-08-26", name: "Onam", type: "festival" },
  { date: "2026-08-28", name: "Raksha Bandhan", type: "festival" },
  { date: "2026-09-04", name: "Janmashtami", type: "festival" },
  { date: "2026-09-14", name: "Ganesh Chaturthi", type: "festival" },
  { date: "2026-10-10", name: "Mahalaya Amavasya", type: "inauspicious" },
  { date: "2026-10-11", name: "Sharad Navratri Begins", type: "festival" },
  { date: "2026-10-19", name: "Maha Navami / Navratri Ends", type: "festival" },
  { date: "2026-10-20", name: "Dussehra", type: "festival" },
  { date: "2026-10-25", name: "Sharad Purnima", type: "festival" },
  { date: "2026-10-29", name: "Karwa Chauth", type: "festival" },
  { date: "2026-11-06", name: "Dhanteras", type: "festival" },
  { date: "2026-11-08", name: "Diwali", type: "festival" },
  { date: "2026-11-11", name: "Bhai Dooj", type: "festival" },
  { date: "2026-11-15", name: "Chhath Puja", type: "festival" },
  { date: "2026-11-24", name: "Kartik Poornima", type: "festival" },
  // Inauspicious periods (no weddings)
  { date: "2026-07-10", name: "Devshayani Ekadashi (Chaturmas begins)", type: "inauspicious" },
  { date: "2026-11-05", name: "Prabodhini Ekadashi (Chaturmas ends)", type: "festival" },
];

// Auspicious Wedding Muhurats 2026 (from Drik Panchang / GaneshaSpeaks)
export const weddingMuhurats: HinduEvent[] = [
  // January
  { date: "2026-01-14", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Anuradha", timing: "7:55 PM – 3:03 AM" },
  { date: "2026-01-23", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttara Bhadrapada", timing: "3:58 PM – 1:46 AM" },
  { date: "2026-01-25", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Revati", timing: "6:14 AM – 1:35 PM" },
  { date: "2026-01-28", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Rohini", timing: "9:26 AM – 11:53 PM" },
  // February
  { date: "2026-02-04", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttara Phalguni", timing: "1:05 AM – 7:17 AM" },
  { date: "2026-02-05", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttara Phalguni / Hasta", timing: "7:19 AM – 7:17 AM (next day)" },
  { date: "2026-02-06", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Hasta", timing: "7:17 AM – 11:36 PM" },
  { date: "2026-02-08", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Swati", timing: "12:08 AM – 5:02 AM" },
  { date: "2026-02-10", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Anuradha", timing: "7:56 AM – 1:40 AM" },
  { date: "2026-02-12", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Moola", timing: "8:20 PM – 3:04 AM" },
  { date: "2026-02-14", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttarashada", timing: "6:16 PM – 3:16 AM" },
  { date: "2026-02-19", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttara Bhadrapada", timing: "8:52 PM – 7:07 AM" },
  { date: "2026-02-20", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Revati", timing: "7:09 AM – 1:50 AM" },
  { date: "2026-02-21", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Revati", timing: "1:00 PM – 1:21 PM" },
  // March
  { date: "2026-03-02", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Magha", timing: "1:46 PM – 5:53 PM" },
  { date: "2026-03-03", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Purva Phalguni / Magha", timing: "7:00 AM – 7:30 AM" },
  { date: "2026-03-04", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttara Phalguni", timing: "7:39 AM – 8:50 AM" },
  { date: "2026-03-07", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Swati", timing: "11:16 AM – 6:53 AM" },
  { date: "2026-03-09", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Anuradha", timing: "4:14 PM – 11:27 PM" },
  { date: "2026-03-11", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Moola", timing: "4:41 AM – 6:51 AM" },
  { date: "2026-03-12", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Moola", timing: "6:54 AM – 9:59 AM" },
  // April
  { date: "2026-04-15", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttara Bhadrapada", timing: "3:22 PM – 10:30 PM" },
  { date: "2026-04-20", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Rohini", timing: "6:15 AM – 5:45 PM" },
  { date: "2026-04-21", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Mrigashira", timing: "6:14 AM – 12:30 PM" },
  { date: "2026-04-25", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Magha", timing: "2:10 AM – 6:10 AM" },
  { date: "2026-04-26", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Magha", timing: "6:10 AM – 8:25 PM" },
  { date: "2026-04-27", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Purva / Uttara Phalguni", timing: "9:18 PM – 9:33 PM" },
  { date: "2026-04-28", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttara Phalguni / Hasta", timing: "9:04 PM – 6:08 AM" },
  // May
  { date: "2026-05-01", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Swati", timing: "10:00 AM – 9:11 PM" },
  { date: "2026-05-03", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Anuradha", timing: "7:10 AM – 10:26 PM" },
  { date: "2026-05-05", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Moola", timing: "7:39 PM – 6:04 AM" },
  { date: "2026-05-06", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Moola", timing: "6:05 AM – 3:54 PM" },
  { date: "2026-05-07", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttarashada", timing: "6:47 PM – 6:02 AM" },
  { date: "2026-05-08", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttarashada", timing: "6:06 AM – 12:21 PM" },
  { date: "2026-05-13", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttara Bhadrapada / Revati", timing: "8:55 PM – 5:57 AM" },
  { date: "2026-05-14", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Revati", timing: "5:31 AM – 4:59 PM" },
  // June
  { date: "2026-06-21", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttara Phalguni", timing: "9:31 AM – 11:20 AM" },
  { date: "2026-06-22", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Hasta", timing: "10:31 AM – 5:54 AM" },
  { date: "2026-06-23", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Hasta", timing: "5:55 AM – 10:12 AM" },
  { date: "2026-06-24", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Swati", timing: "1:59 PM – 5:54 AM" },
  { date: "2026-06-25", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Swati", timing: "5:56 AM – 7:08 AM" },
  { date: "2026-06-26", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Anuradha", timing: "7:16 PM – 5:54 AM" },
  { date: "2026-06-27", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Anuradha", timing: "5:56 AM – 10:10 PM" },
  { date: "2026-06-29", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Moola", timing: "4:16 PM – 4:03 AM" },
  // July
  { date: "2026-07-01", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttarashada", timing: "6:51 AM – 4:03 PM" },
  { date: "2026-07-06", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttara Bhadrapada", timing: "1:43 AM – 6:00 AM" },
  { date: "2026-07-07", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttara Bhadrapada", timing: "6:01 AM – 2:31 PM" },
  { date: "2026-07-11", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Rohini", timing: "12:06 AM – 6:02 AM" },
  { date: "2026-07-12", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Rohini / Mrigashira", timing: "6:05 AM – 10:29 PM" },
  // November (post-Chaturmas)
  { date: "2026-11-21", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Revati", timing: "6:57 AM – 12:06 AM" },
  { date: "2026-11-24", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Rohini", timing: "11:27 PM – 7:00 AM" },
  { date: "2026-11-25", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Rohini / Mrigashira", timing: "7:00 AM – 7:00 AM" },
  // December
  { date: "2026-12-02", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttara Phalguni", timing: "10:32 AM – 7:06 AM" },
  { date: "2026-12-03", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttara Phalguni / Hasta", timing: "7:05 AM – 10:52 AM" },
  { date: "2026-12-04", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Hasta", timing: "7:07 AM – 10:22 AM" },
  { date: "2026-12-05", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Swati", timing: "11:48 AM – 7:00 AM" },
  { date: "2026-12-06", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Swati", timing: "7:00 AM – 7:42 AM" },
  { date: "2026-12-11", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttarashada", timing: "3:04 AM – 7:04 AM" },
  { date: "2026-12-12", name: "Shubh Muhurat", type: "muhurat", nakshatra: "Uttarashada", timing: "7:04 AM – 3:27 AM" },
];

export function getEventsForDate(dateStr: string): HinduEvent[] {
  const events: HinduEvent[] = [];
  events.push(...hinduFestivals.filter(e => e.date === dateStr));
  events.push(...weddingMuhurats.filter(e => e.date === dateStr));
  return events;
}

export function isAuspicious(dateStr: string): boolean {
  return weddingMuhurats.some(e => e.date === dateStr);
}

export function isFestival(dateStr: string): boolean {
  return hinduFestivals.some(e => e.date === dateStr && e.type === "festival");
}

export function isInauspicious(dateStr: string): boolean {
  return hinduFestivals.some(e => e.date === dateStr && e.type === "inauspicious");
}
