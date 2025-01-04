import { Map } from "../../types/map";

// 카테고리별 Map 데이터 생성 함수
const generateMapsForCategory = (
  categoryId: number,
  startId: number
): Map[] => {
  const maps: Map[] = [];
  const categoryIcons = {
    1: [
      "logo-python",
      "logo-javascript",
      "logo-java",
      "code",
      "terminal",
      "code-working",
      "logo-typescript",
      "code-slash",
    ],
    2: [
      "logo-react",
      "logo-vue",
      "logo-angular",
      "server",
      "globe",
      "leaf",
      "server-outline",
      "layers",
    ],
    3: [
      "logo-apple",
      "logo-android",
      "phone-portrait",
      "phone-landscape",
      "tablet-portrait",
      "tablet-landscape",
      "apps",
      "phone-portrait-outline",
    ],
    4: [
      "analytics",
      "bar-chart",
      "pie-chart",
      "stats-chart",
      "trending-up",
      "calculator",
      "grid",
      "prism",
    ],
    5: [
      "cloud",
      "cloud-done",
      "cloud-upload",
      "cloud-download",
      "server",
      "git-branch",
      "construct",
      "build",
    ],
    6: [
      "shield",
      "lock-closed",
      "key",
      "finger-print",
      "eye",
      "scan",
      "shield-checkmark",
      "lock-open",
    ],
    7: [
      "game-controller",
      "cube",
      "shapes",
      "color-palette",
      "compass",
      "construct",
      "prism",
      "diamond",
    ],
    8: [
      "link",
      "git-network",
      "cube",
      "diamond",
      "flash",
      "infinite",
      "layers",
      "prism",
    ],
  };

  const categoryNames = {
    1: [
      "Python",
      "JavaScript",
      "Java",
      "C++",
      "Go",
      "Rust",
      "TypeScript",
      "Kotlin",
    ],
    2: [
      "React",
      "Vue",
      "Angular",
      "Node.js",
      "Django",
      "Spring",
      "Express",
      "Laravel",
    ],
    3: [
      "Swift",
      "Kotlin",
      "React Native",
      "Flutter",
      "iOS",
      "Android",
      "Xamarin",
      "Unity Mobile",
    ],
    4: [
      "TensorFlow",
      "PyTorch",
      "Scikit-learn",
      "Pandas",
      "NumPy",
      "R",
      "Jupyter",
      "Tableau",
    ],
    5: [
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "GCP",
      "Jenkins",
      "Terraform",
      "Ansible",
    ],
    6: [
      "네트워크 보안",
      "암호학",
      "웹 보안",
      "시스템 보안",
      "모의해킹",
      "포렌식",
      "보안 감사",
      "취약점 분석",
    ],
    7: [
      "Unity",
      "Unreal Engine",
      "Godot",
      "GameMaker",
      "Phaser",
      "Three.js",
      "Babylon.js",
      "PlayCanvas",
    ],
    8: [
      "이더리움",
      "솔리디티",
      "하이퍼레저",
      "코스모스",
      "폴카닷",
      "카르다노",
      "테조스",
      "니어",
    ],
  };

  for (let i = 0; i < 30; i++) {
    const baseNameIndex =
      i % categoryNames[categoryId as keyof typeof categoryNames].length;
    const baseName =
      categoryNames[categoryId as keyof typeof categoryNames][baseNameIndex];
    const icon =
      categoryIcons[categoryId as keyof typeof categoryIcons][baseNameIndex];
    const level = Math.floor(i / 10) + 1; // 1, 2, 3 레벨

    // 구독자 수와 조회수를 연관성 있게 생성
    const subscriberCount = Math.floor(Math.random() * 10000) + 1000;
    const viewCount = subscriberCount + Math.floor(Math.random() * 20000); // 구독자보다 항상 많은 조회수

    maps.push({
      id: startId + i,
      name: `${baseName} ${level}단계 마스터하기`,
      description: `${baseName}의 ${level}단계 학습 로드맵입니다. 실전 프로젝트와 함께 배워보세요.`,
      icon,
      subscriber_count: subscriberCount,
      view_count: viewCount,
      is_subscribed: Math.random() > 0.5,
      created_by: {
        id: Math.floor(Math.random() * 100) + 1,
        name: `Creator${Math.floor(Math.random() * 100) + 1}`,
      },
      created_at: new Date(
        2024,
        0,
        Math.floor(Math.random() * 30) + 1
      ).toISOString(),
    });
  }
  return maps;
};

// 전체 Map 데이터 생성 (8개 카테고리 x 30개 = 240개)
export const mockMaps: Map[] = [
  ...generateMapsForCategory(1, 0),
  ...generateMapsForCategory(2, 30),
  ...generateMapsForCategory(3, 60),
  ...generateMapsForCategory(4, 90),
  ...generateMapsForCategory(5, 120),
  ...generateMapsForCategory(6, 150),
  ...generateMapsForCategory(7, 180),
  ...generateMapsForCategory(8, 210),
];
