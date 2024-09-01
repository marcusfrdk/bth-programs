export type ProgramType = {
    name: string;
    code: string;
    semester: string;
};

export type CourseType = {
    code: string;
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
    color: string;
};

export type TeacherType = {
    code: string,
    name: string,
    email: string,
    phone: string,
    room: string,
    unit: string,
    location: string
};

export type TeachersType = Record<string, TeacherType>;

export type CodeType = string; // ABCDE
export type SemesterType = string; // 12a