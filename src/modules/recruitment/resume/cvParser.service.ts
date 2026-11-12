import { IParsedResumeData, IEducationItem, IExperienceItem } from './resume.types';
import { VacancyModel } from '../vacancy/vacancy.model';

export class CvParserService {
  /**
   * Common technical and soft skills list for parsing extraction
   */
  private readonly COMMON_SKILLS = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Angular', 'Vue', 'Next.js',
    'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'Sass', 'Python', 'Django', 'Flask', 'FastAPI',
    'Java', 'Spring', 'Spring Boot', 'C#', '.NET', 'C++', 'Go', 'Golang', 'Rust', 'PHP',
    'Laravel', 'Ruby', 'Rails', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Git', 'GitHub', 'Linux',
    'Agile', 'Scrum', 'Jira', 'Figma', 'UI/UX', 'REST API', 'Microservices', 'Jest', 'Mocha',
    'Communication', 'Leadership', 'Project Management', 'Problem Solving', 'Teamwork'
  ];

  /**
   * Extracts structured information from raw resume text
   */
  parseText(rawText: string): IParsedResumeData {
    if (!rawText || !rawText.trim()) {
      return {
        skills: [],
        education: [],
        workExperience: [],
      };
    }

    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    // 1. Email extraction
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : undefined;

    // 2. Phone extraction
    const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : undefined;

    // 3. Name extraction (first non-empty line that doesn't look like contact/header)
    let name: string | undefined;
    for (const line of lines.slice(0, 5)) {
      if (!line.includes('@') && !line.match(/\d{5,}/) && line.length < 50 && !line.toLowerCase().includes('resume') && !line.toLowerCase().includes('curriculum')) {
        name = line;
        break;
      }
    }

    // 4. Skills extraction
    const extractedSkills: Set<string> = new Set();
    for (const skill of this.COMMON_SKILLS) {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(rawText)) {
        extractedSkills.add(skill);
      }
    }

    // 5. Experience Years extraction
    let experienceYears = 0;
    const expMatch = rawText.match(/(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/i);
    if (expMatch) {
      experienceYears = parseInt(expMatch[1], 10) || 0;
    }

    // 6. Education extraction
    const education: IEducationItem[] = [];
    const degreeKeywords = ['B.Tech', 'B.E.', 'Bachelor', 'Master', 'M.Tech', 'M.S.', 'MBA', 'PhD', 'B.Sc', 'M.Sc', 'Diploma', 'Associate'];
    for (const line of lines) {
      for (const degree of degreeKeywords) {
        if (line.toLowerCase().includes(degree.toLowerCase())) {
          education.push({
            degree: line,
          });
          break;
        }
      }
    }

    // 7. Work Experience extraction
    const workExperience: IExperienceItem[] = [];
    const roleKeywords = ['Software Engineer', 'Developer', 'Lead', 'Manager', 'Architect', 'Consultant', 'Specialist', 'Analyst', 'Intern', 'Designer'];
    for (const line of lines) {
      for (const role of roleKeywords) {
        if (line.toLowerCase().includes(role.toLowerCase()) && line.length < 80) {
          workExperience.push({
            company: 'Company / Project',
            role: line,
          });
          break;
        }
      }
    }

    // 8. Title / Role extraction
    const title = workExperience.length > 0 ? workExperience[0].role : (lines[1] || 'Candidate');

    return {
      name: name || 'Applicant',
      email,
      phone,
      title,
      skills: Array.from(extractedSkills),
      experienceYears,
      education,
      workExperience,
      summary: lines.slice(0, 4).join(' '),
    };
  }

  /**
   * Calculates a match score (0 - 100) based on vacancy skills and candidate profile
   */
  async calculateMatchScore(parsedData: IParsedResumeData, vacancyId?: string, targetSkills?: string[]): Promise<number> {
    const requiredSkills: string[] = [...(targetSkills || [])];

    if (vacancyId) {
      const vacancy = await VacancyModel.findById(vacancyId);
      if (vacancy) {
        if (vacancy.skillsRequired && vacancy.skillsRequired.length > 0) {
          requiredSkills.push(...vacancy.skillsRequired);
        }
        if (vacancy.title) {
          requiredSkills.push(vacancy.title);
        }
      }
    }

    if (requiredSkills.length === 0) {
      return parsedData.skills.length > 0 ? Math.min(85, 50 + parsedData.skills.length * 5) : 60;
    }

    const candidateSkillsLower = (parsedData.skills || []).map((s) => s.toLowerCase());
    const candidateText = `${parsedData.title || ''} ${parsedData.summary || ''} ${(parsedData.workExperience || []).map((w) => w.role).join(' ')}`.toLowerCase();

    let matchedCount = 0;
    for (const req of requiredSkills) {
      const reqLower = req.toLowerCase();
      if (candidateSkillsLower.some((s) => s.includes(reqLower) || reqLower.includes(s)) || candidateText.includes(reqLower)) {
        matchedCount++;
      }
    }

    const matchRatio = matchedCount / requiredSkills.length;
    const baseScore = Math.round(matchRatio * 80);
    const expBonus = Math.min(20, (parsedData.experienceYears || 0) * 4);

    return Math.min(100, Math.max(10, baseScore + expBonus));
  }
}

export const cvParserService = new CvParserService();
