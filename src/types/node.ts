export interface NodeDetail {
  id: number;
  name: string;
  title: string;
  description: string;
  background_image: string | null;
  status: "in_progress" | "locked" | "completed";
  statistic: {
    activated_member_count: number;
    completed_member_count: number;
  };
  active_rules: Array<{
    id: number;
    name: string;
    by_arrow?: {
      start_node_id: number;
      end_node_id: number;
      start_node_name: string;
      end_node_name: string;
    };
    progress: {
      completed_questions: number;
      total_questions: number;
      percentage: number;
    };
    questions: Array<{
      id: number;
      arrow_id: number;
      title: string;
      description: string;
      status: string;
      by_node_id: number;
      answer_submit_with_text: boolean;
      answer_submit_with_file: boolean;
      my_answers: Array<{
        id: number;
        answer: string;
        is_correct: boolean;
        feedback: string;
        reviewed_by?: {
          id: number;
          nickname: string;
        };
        reviewed_at?: string;
        submitted_at: string;
        files: Array<{
          id: number;
          file: string;
        }>;
      }>;
    }>;
  }>;
}
