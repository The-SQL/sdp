export type Course = {
  id?: string;
  author_id: string;
  language_id: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_duration: string;
  learning_objectives: string;
  profile_url: string;
  is_public: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Language = {
  id: string;
  name: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type Unit = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at?: string;
};

export type Lesson = {
  id: string;
  unit_id: string;
  title: string;
  content_type: string;
  content:object;
  order_index: number;
  created_at?: string;
};
