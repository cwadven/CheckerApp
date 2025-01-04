export type RootStackParamList = {
  Main: undefined;
  MapList: { categoryId: number };
  MapGraph: { mapId: number };
  NodeDetail: { nodeId: number };
  QuestionSolve: {
    nodeId: number;
    questionId: number;
    question: {
      title: string;
      description: string;
      answer_types: {
        text: boolean;
        file: boolean;
      };
    };
  };
};

export type MainTabParamList = {
  Home: undefined;
  MySubscription: undefined;
  Profile: undefined;
};
