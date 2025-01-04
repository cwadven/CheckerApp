import { NodeDetail } from "../../types/node";

export const mockNodeDetails: { [key: number]: NodeDetail } = {
  1: {
    id: 1,
    name: "HTML 기초",
    title: "HTML 마스터",
    description: "HTML의 기본 구조와 시맨틱 태그를 이해하고 활용할 수 있습니다",
    background_image: "https://example.com/images/html-background.jpg",
    status: "completed",
    statistic: {
      activated_member_count: 10,
      completed_member_count: 10,
    },
    active_rules: [
      {
        id: 1,
        name: "HTML 기초 학습하기",
        progress: {
          completed_questions: 5,
          total_questions: 5,
          percentage: 100,
        },
        questions: [
          {
            id: 1,
            title: "HTML 기본 이해하기",
            description: "HTML의 기본 구조와 태그들의 의미를 이해합니다",
            status: "completed",
            by_node_id: 1,
            my_answers: [
              {
                id: 1,
                answer: "제출한 답변 내용",
                is_correct: true,
                feedback: "정���하게 이해하고 있습니다!",
                reviewed_by: {
                  id: 1,
                  nickname: "강사A",
                },
                reviewed_at: "2024-01-21T00:00:00Z",
                submitted_at: "2024-01-20T00:00:00Z",
              },
            ],
          },
          {
            id: 2,
            title: "태그 사용법 익히기",
            description: "HTML 태그들의 올바른 사용법을 익힙니다",
            status: "completed",
            by_node_id: 1,
            my_answers: [
              {
                id: 2,
                answer: "태그 사용 실습 내용",
                is_correct: true,
                submitted_at: "2024-01-22T00:00:00Z",
              },
            ],
          },
          {
            id: 3,
            title: "시맨틱 태그 실습",
            description: "시맨틱 태그를 활용하여 웹 페이지 구조를 작성해보세요",
            status: "in_progress",
            by_node_id: 1,
            my_answers: [],
          },
          {
            id: 4,
            title: "폼 요소 다루기",
            description: "HTML 폼 요소들을 활용하여 입력 폼을 만들어봅니다",
            status: "locked",
            by_node_id: 1,
            my_answers: [],
          },
          {
            id: 5,
            title: "최종 테스트",
            description: "HTML 전반적인 이해도를 테스트합니다",
            status: "locked",
            by_node_id: 1,
            my_answers: [],
          },
        ],
      },
      {
        id: 2,
        name: "HTML 심화 학습하기",
        progress: {
          completed_questions: 3,
          total_questions: 3,
          percentage: 100,
        },
        questions: [],
      },
    ],
    active_history: [
      {
        active_rule_id: 1,
        activated_at: "2024-01-15T00:00:00Z",
      },
      {
        active_rule_id: 2,
        activated_at: "2024-01-25T00:00:00Z",
      },
    ],
  },
  2: {
    id: 2,
    name: "CSS 기초",
    title: "CSS 마스터",
    description:
      "웹 페이지의 레이아웃과 스타일링을 자유자재로 다룰 수 있습니다",
    background_image: "https://example.com/images/css-background.jpg",
    status: "in_progress",
    statistic: {
      activated_member_count: 15,
      completed_member_count: 5,
    },
    active_rules: [
      {
        id: 3,
        name: "CSS 기초 학습하기",
        progress: {
          completed_questions: 1,
          total_questions: 2,
          percentage: 50,
        },
        questions: [
          {
            id: 1,
            title: "HTML 기초 완료",
            description: "HTML 기초를 완료하시면 됩니다.",
            status: "completed",
            by_node_id: 1,
            my_answers: [],
          },
          {
            id: 2,
            title: "CSS 선택자 이해하기",
            description: "다양한 CSS 선택자의 사용법과 우선순위를 학습합니다",
            status: "in_progress",
            by_node_id: 2,
            my_answers: [],
          },
        ],
      },
    ],
    active_history: [],
  },
  3: {
    id: 3,
    name: "JS 기초",
    title: "JavaScript 마스터",
    description: "JavaScript의 핵심 개념과 DOM 조작을 이해합니다",
    background_image: "https://example.com/images/javascript-background.jpg",
    status: "completed",
    statistic: {
      activated_member_count: 12,
      completed_member_count: 8,
    },
    active_rules: [
      {
        id: 4,
        name: "JavaScript 기초 학습하기",
        progress: {
          completed_questions: 3,
          total_questions: 3,
          percentage: 100,
        },
        questions: [],
      },
    ],
    active_history: [
      {
        active_rule_id: 4,
        activated_at: "2024-01-18T00:00:00Z",
      },
    ],
  },
  4: {
    id: 4,
    name: "React",
    title: "React 마스터",
    description: "React의 기본 개념과 핵심 기능을 이해하고 활용할 수 있습니다",
    background_image: "https://example.com/images/react-background.jpg",
    status: "in_progress",
    statistic: {
      activated_member_count: 8,
      completed_member_count: 3,
    },
    active_rules: [
      {
        id: 3,
        name: "React 기초 학습하기",
        progress: {
          completed_questions: 1,
          total_questions: 4,
          percentage: 33,
        },
        questions: [
          {
            id: 1,
            title: "JS 기초 Node 해결",
            description: "JavaScript 기초 과정을 완료하세요",
            status: "completed",
            by_node_id: 3,
            my_answers: [],
          },
          {
            id: 2,
            title: "CSS 기초 Node 해결",
            description: "CSS 기초 과정을 완료하세요",
            status: "in_progress",
            by_node_id: 2,
            my_answers: [],
          },
          {
            id: 3,
            title: "React 컴포넌트 이해하기",
            description: "React 컴포넌트의 기본 개념과 생명주기를 학습합니다",
            status: "in_progress",
            by_node_id: 4,
            my_answers: [],
          },
          {
            id: 4,
            title: "React 컴포넌트 이해하기2",
            description: "React 컴포넌트의 기본 개념과 생명주기를 학습합니다2",
            status: "in_progress",
            by_node_id: 4,
            my_answers: [
              {
                id: 10,
                answer: "잘몰라요 뭐가 답이에요?",
                is_correct: null,
                submitted_at: "2024-01-22T00:00:00Z",
              },
            ],
          },
        ],
      },
    ],
    active_history: [
      {
        active_rule_id: 3,
        activated_at: "2024-01-30T00:00:00Z",
      },
    ],
  },
  5: {
    id: 5,
    name: "React Hooks",
    title: "React Hooks 마스터",
    description: "React Hooks의 동작 원리와 활용법을 배웁니다",
    background_image: "https://example.com/images/react-hooks-background.jpg",
    status: "locked",
    statistic: {
      activated_member_count: 3,
      completed_member_count: 1,
    },
    active_rules: [],
    active_history: [],
  },
  6: {
    id: 6,
    name: "상태 관리",
    title: "React 상태 관리 마스터",
    description: "Redux와 다양한 상태 관리 도구��� 사용법을 익힙니다",
    background_image:
      "https://example.com/images/state-management-background.jpg",
    status: "completed",
    statistic: {
      activated_member_count: 5,
      completed_member_count: 2,
    },
    active_rules: [
      {
        id: 5,
        name: "상태 관리 도구 학습하기",
        progress: {
          completed_questions: 2,
          total_questions: 2,
          percentage: 100,
        },
        questions: [],
      },
    ],
    active_history: [
      {
        active_rule_id: 5,
        activated_at: "2024-02-01T00:00:00Z",
      },
    ],
  },
  7: {
    id: 7,
    name: "React Router",
    title: "React Router 마스터",
    description: "React Router를 사용한 라우팅 구현 방법을 학습합니다",
    background_image: "https://example.com/images/react-router-background.jpg",
    status: "locked",
    statistic: {
      activated_member_count: 2,
      completed_member_count: 0,
    },
    active_rules: [],
    active_history: [],
  },
  8: {
    id: 8,
    name: "React Query",
    title: "React Query 마스터",
    description: "React Query를 사용한 서버 상태 관리를 학습합니다",
    background_image: "https://example.com/images/react-query-background.jpg",
    status: "locked",
    statistic: {
      activated_member_count: 1,
      completed_member_count: 0,
    },
    active_rules: [],
    active_history: [],
  },
  9: {
    id: 9,
    name: "실전 프로젝트",
    title: "React 실전 프로젝트",
    description: "지금까지 배운 내용을 활용하여 실전 프로젝트를 진행합니다",
    background_image: "https://example.com/images/project-background.jpg",
    status: "in_progress",
    statistic: {
      activated_member_count: 2,
      completed_member_count: 0,
    },
    active_rules: [
      {
        id: 10,
        name: "상태 관리 & Router 완료",
        progress: {
          completed_questions: 1,
          total_questions: 2,
          percentage: 50,
        },
        questions: [
          {
            id: 1,
            title: "상태 관리 구현하기",
            description: "Redux를 사용하여 상태 관리 구현",
            status: "completed",
            by_node_id: 6,
            my_answers: [],
          },
          {
            id: 2,
            title: "라우팅 구현하기",
            description: "React Router를 사용하여 라우팅 구현",
            status: "locked",
            by_node_id: 7,
            my_answers: [],
          },
        ],
      },
      {
        id: 11,
        name: "???",
        progress: {
          completed_questions: 0,
          total_questions: 1,
          percentage: 0,
        },
        questions: [
          {
            id: 3,
            title: "???",
            description: "???",
            status: "locked",
            by_node_id: 8,
            my_answers: [],
          },
        ],
      },
    ],
    active_history: [
      {
        active_rule_id: 10,
        activated_at: "2024-02-05T00:00:00Z",
      },
    ],
  },
};
