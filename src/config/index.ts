const ENV = {
  dev: {
    API_URL: "http://localhost:8000",
  },
  staging: {
    API_URL: "https://dev.qosmo.co.kr",
  },
  prod: {
    API_URL: "https://qosmo.co.kr",
  },
};

const getEnvVars = () => {
  // __DEV__는 React Native의 전역 변수
  if (__DEV__) {
    return ENV.dev;
  }
  // 추후 배포 환경에 따라 staging/prod 분기 처리
  return ENV.prod;
};

export default getEnvVars();
