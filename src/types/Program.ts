export interface ICourse {
  url: string,
  name?: string,
  city?: string,
  study_plan?: string,
  speed?: number,
  location?: string,
  code?: string,
  points?: number,
  languages?: string[],
  teachers?: string[],
  description?: string,
  requirements?: string,
  start: string,
  end: string
}

export interface IProgram {
  name: string,
  city: string,
  study_plan: string,
  speed: number,
  location: string,
  code: string,
  points: number,
  languages: string[],
  teacher: string,
  url: string,
  start: string,
  end: string,
  generated: string,
  required_courses: ICourse[],
  optional_courses: ICourse[]
}