import { HttpService, type HttpServiceOptions } from "@/services/http.service";
import {
  type GenerateEmailResponse,
  type MatchResult,
  type ParseResumeResponse,
  type Resume,
  type UpdateResumeDto,
} from "@/types/resume.type";

export class ResumeService extends HttpService {
  constructor(options?: HttpServiceOptions) {
    super(options);
  }

  async getResume(): Promise<Resume> {
    const { data } = await this.get<Resume>("/resumes");
    return data;
  }

  async updateResume(id: string, payload: UpdateResumeDto): Promise<Resume> {
    const { data } = await this.post<UpdateResumeDto, Resume>(
      `/resumes/${id}`,
      payload,
    );
    return data;
  }

  async resumeParse(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await this.post<FormData, ParseResumeResponse>(
      "/resumes/parse",
      formData,
    );
    return data;
  }

  async generateEmail(
    resumeId: string,
    jobDescription: string,
    matchResult: MatchResult,
  ): Promise<GenerateEmailResponse> {
    const payload = {
      jobDescription,
      matchContext: {
        strengths: matchResult.strengths,
        suggestions: matchResult.suggestions,
        overallScore: matchResult.overallScore,
      },
    };

    const { data } = await this.post<typeof payload, GenerateEmailResponse>(
      `/resumes/${resumeId}/generate-email`,
      payload,
    );
    return data;
  }

  async matchResume(
    resumeId: string,
    jobDescription?: string,
    file?: File,
  ): Promise<MatchResult> {
    const formData = new FormData();
    formData.append("resumeId", resumeId);

    if (file) {
      formData.append("file", file);
    } else if (jobDescription) {
      formData.append("jobDescription", jobDescription);
    }

    const { data } = await this.post<FormData, MatchResult>(
      "/resumes/match",
      formData,
    );
    return data;
  }
}
