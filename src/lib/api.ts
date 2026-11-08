import { API_URL } from '../content/config';

export type Registration = {
  fullName: string; birthDate: string; email: string; phone: string;
  university: string; faculty: string; department: string; specialty: string; level: string; studentId: string;
  interests: string[]; csChoice: string; techChoice: string; socialChoice: string; logisticsChoice: string; firstTeam: string; secondTeam: string; skillLevel: string; skills: string;
  days: string[]; hours: string; laptop: string; heardFrom: string;
  motivation: string; goal: string; experience: string; discord: string; linkedin: string; portfolio: string;
  agreeRules: boolean; agreeData: boolean; photoOk: boolean;
};

export async function submitApplication(data: Registration) {
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 1200));
    return { demo: true };
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    // text/plain باش المتصفح ما يدير preflight (Google ما يقبلوش)
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.ok) throw new Error(result.error === 'duplicate' ? 'duplicate' : 'not saved');
  return { demo: false };
}
