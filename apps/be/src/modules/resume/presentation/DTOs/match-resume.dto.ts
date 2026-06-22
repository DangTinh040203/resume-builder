import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class MatchResumeDto {
  @IsUUID()
  resumeId: string;

  @IsNotEmpty({ message: 'Please provide a Job Description (text or file)' })
  @IsString()
  @MaxLength(20000, {
    message: 'Job description must not exceed 20000 characters',
  })
  jobDescription: string;
}
