import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptsService {
  getResumeAnalysisPrompt(resumeText: string): { system: string; user: string } {
    return {
      system: 
        `You are an expert technical recruiter and ATS (Applicant Tracking System) algorithm. ` +
        `Analyze the candidate's resume and return a highly detailed, professional analysis. ` +
        `You MUST respond with a valid JSON object matching this schema exactly:\n` +
        `{\n` +
        `  "score": number (1 to 100 representing ATS match and overall strength),\n` +
        `  "strengths": string[] (minimum 3 key technical/professional strengths),\n` +
        `  "weaknesses": string[] (minimum 3 areas of improvement or formatting errors),\n` +
        `  "missingSkills": string[] (skills they should have but aren't visible or are weak),\n` +
        `  "recommendations": string[] (actionable steps to improve employability)\n` +
        `}`,
      user: `Analyze the following resume text:\n\n${resumeText}`,
    };
  }

  getSkillGapPrompt(resumeText: string, targetRole: string): { system: string; user: string } {
    return {
      system:
        `You are a career development coach. Compare the candidate's resume against the target role of "${targetRole}". ` +
        `Identify specific gaps in their skill set (technical, soft, or tools) and suggest learning resources. ` +
        `You MUST respond with a valid JSON object matching this schema exactly:\n` +
        `{\n` +
        `  "identifiedGaps": [\n` +
        `    { "skill": "string", "category": "technical|soft|tool", "currentLevel": "none|beginner|intermediate", "importance": "high|medium|low" }\n` +
        `  ],\n` +
        `  "recommendations": [\n` +
        `    { "skill": "string", "resourceType": "course|certification|project", "title": "string", "providerOrDescription": "string" }\n` +
        `  ]\n` +
        `}`,
      user: `Compare the target role: "${targetRole}" with this resume:\n\n${resumeText}`,
    };
  }

  getRoadmapPrompt(targetRole: string, missingSkills: string[]): { system: string; user: string } {
    const missingSkillsList = missingSkills.join(', ');
    return {
      system:
        `You are an elite career development architect. Design a personalized career roadmap to help a candidate transition into the role of "${targetRole}". ` +
        `Address these specific missing skills: [${missingSkillsList}]. ` +
        `You MUST respond with a valid JSON object matching this schema exactly:\n` +
        `{\n` +
        `  "targetRole": "string",\n` +
        `  "steps": [\n` +
        `    {\n` +
        `      "title": "string",\n` +
        `      "description": "string",\n` +
        `      "estimatedDuration": "string (e.g., 2 weeks, 1 month)",\n` +
        `      "resources": string[] (links or course names),\n` +
        `      "completed": false\n` +
        `    }\n` +
        `  ]\n` +
        `}`,
      user: `Generate a step-by-step roadmap to become a "${targetRole}" by mastering: [${missingSkillsList}]`,
    };
  }

  getInterviewPrompt(role: string, topic: string): { system: string; user: string } {
    return {
      system:
        `You are a senior technical interviewer. Generate a mock interview session for the role: "${role}" on the topic/focus area: "${topic}". ` +
        `Provide 5 highly relevant, challenging questions (a mix of behavioral, conceptual, and technical coding/problem-solving). ` +
        `You MUST respond with a valid JSON object matching this schema exactly:\n` +
        `{\n` +
        `  "role": "string",\n` +
        `  "topic": "string",\n` +
        `  "questions": [\n` +
        `    { "id": "string (unique string/UUID style)", "questionText": "string", "context": "string (brief hint/focus of the question)" }\n` +
        `  ]\n` +
        `}`,
      user: `Create 5 interview questions for the role: "${role}" with topic focus: "${topic}"`,
    };
  }
}
