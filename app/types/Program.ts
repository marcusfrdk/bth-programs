export type ProgramType = {
    name: string;
    code: string;
    semester: string;
};

export type CourseType = {
    name: string;
    points: number;
    semester: string;
    start_week: number;
    end_week: number;
    period: number;
    type: string;
    academic_focus: string | null;
    prerequisites: string;
    teacher: string;
    replacement: string | null;
    next_instance: string | null;
    syllabus_url: string;
    education_plan_url: string;
    start_year: number;
    end_year: number;
    course_duration: number;
    is_double: boolean;
};

export type CodeType = string; // ABCDE
export type SemesterType = string; // 12a