export interface AnswerSubmitResponse {
  status_code: string;
  data: {
    member_answer_id: number;
    answer: string;
    submitted_at: string;
    validation_type: string;
    status: string;
    feedback: string;
    going_to_in_progress_node_ids: number[];
    completed_node_ids: number[];
  };
} 