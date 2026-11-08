// بدّلي الأسماء والروابط هنا. [الاسم، المنصب، رابط LinkedIn ('' = بلا رابط)]
// الروبو يتولد وحدو من الاسم.
export type Member = readonly [name: string, role: string, link: string];
export type TeamKey = 'board' | 'tech' | 'cs' | 'sm' | 'hr' | 'logistics';
export type Team = { key: TeamKey; title: string; desc: string; members: readonly Member[] };

export const CREW: readonly Team[] = [
  { key: 'board', title: 'Board', desc: 'The people who run OTC.', members: [
    ['Manel Guerziz Houria', 'President', 'https://www.linkedin.com/in/manel-guerziz-469092374'],
    ['Fares Mabrouki', 'Vice President', 'https://www.linkedin.com/in/fares-mabrouki-50b1a1307/'],
  ] },
  { key: 'tech', title: 'Tech', desc: 'Robotics, electronics and embedded projects.', members: [
    ['Rami Zegrar', 'Leader', 'https://www.linkedin.com/in/rami-zegrar-76712736b'],
    ['Mohammed Gaouda Saleh', 'Co-leader', 'https://www.linkedin.com/in/mohamed-gaouda-b1602235b'],
  ] },
  { key: 'cs', title: 'CS', desc: 'Computer science, coding and software projects.', members: [
    ['Mouaid Yahiaoui', 'Leader', 'https://www.linkedin.com/in/mouaid-yahiaoui-a2bb2b284/'],
    ['Sarra Meraouche', 'Co-leader', 'https://dz.linkedin.com/in/sarra-meraouche-b16bb22a9'],
  ] },
  { key: 'sm', title: 'SM', desc: "Social media, content and the club's online image.", members: [
    ['Malak Yassamine Aouaichra', 'Leader', 'https://www.linkedin.com/in/malak-yassamine-38a725319'],
    ['Amina Lebbal', 'Co-leader', 'https://www.linkedin.com/in/amina-lebbal'],
  ] },
  { key: 'hr', title: 'HR', desc: 'Members, onboarding and team spirit.', members: [
    ['Khadidja Grabsi', 'Leader', 'https://www.linkedin.com/in/grabsi-khadidja-3859263a0'],
  ] },
  { key: 'logistics', title: 'Logistics', desc: 'Equipment, venues and event preparation.', members: [
    ['Bouchra Bensalah', 'Leader', ''],
    ['Manar Abdelouhab', 'Co-leader', 'https://www.linkedin.com/in/manar-abdelouahab-617041373'],
  ] },
];
