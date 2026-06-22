export interface Resume {
  id: string
  userId: string
  title: string
  sections: ResumeSection[]
  createdAt: string
  updatedAt: string
}

export interface ResumeSection {
  id: string
  type: SectionType
  title: string
  items: ResumeSectionItem[]
  order: number
}

export type SectionType =
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'summary'

export interface ResumeSectionItem {
  id: string
  [key: string]: unknown
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}
