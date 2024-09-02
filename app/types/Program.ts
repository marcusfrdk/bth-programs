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
    email: string | null,
    phone: string | null,
    room: string | null,
    unit: string | null,
    location: string | null,
};

export type TeachersType = Record<string, TeacherType>;

export type CodeType = string; // ABCDE
export type SemesterType = string; // 12a
export type IndexType = Record<string, string[]>;
export type NamesType = Record<string, string>;