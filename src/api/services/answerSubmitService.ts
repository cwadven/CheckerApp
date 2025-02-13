import { apiClient } from "../client";
import type { DocumentPickerAsset } from 'expo-document-picker';
import { Platform } from 'react-native';
import type { AnswerSubmitResponse } from '../../types/answer';

export const answerSubmitService = {
  submitAnswer: async (
    questionId: number,
    mapPlayMemberId: number | undefined,
    answer: string | null,
    files: DocumentPickerAsset[] | null
  ): Promise<AnswerSubmitResponse> => {
    console.log('Submitting answer:', { questionId, mapPlayMemberId, answer, files });

    const formData = new FormData();

    if (answer !== null && answer.trim() !== '') {
      formData.append('answer', answer);
    }
    
    if (files && files.length > 0) {
      if (Platform.OS === 'web') {
        await Promise.all(
          files.map(async (file) => {
            const response = await fetch(file.uri);
            const blob = await response.blob();
            formData.append('files', blob, file.name);
          })
        );
      } else {
        files.forEach((file) => {
          formData.append('files', {
            uri: file.uri,
            type: file.mimeType || 'application/octet-stream',
            name: file.name,
          } as any);
        });
      }
    }

    const url = mapPlayMemberId 
      ? `/v1/question/${questionId}/answer/${mapPlayMemberId}/submit`
      : `/v1/question/${questionId}/answer/submit`;

    return apiClient.post<AnswerSubmitResponse>(
      url,
      formData,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
  },
}; 