import 'dotenv/config';

export default {
  expo: {
    name: "Qosmo",
    // ... 기존 app.json의 다른 설정들
    extra: {
      eas: {
        projectId: process.env.EXPO_PROJECT_ID
      }
    }
  }
};
