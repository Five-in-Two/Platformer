import ForumService from '@/services/ForumService/ForumService';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setComments, setTopics } from './forumSlice';
import { TCommentReq, TIdData, TTopicData } from './types';

const regExp = /[TZ]|[.-]|:|/g;

export const getTopics = createAsyncThunk('forum/setTopics', async function (_, { rejectWithValue, dispatch }) {
    try {
        const response = await ForumService.GetTopics();

        if (!response) {
            throw new Error('Ошибка получения топиков');
        }

        const topicsSorted = response.sort((a, b) => {
            return Number(a.createdAt.replace(regExp, '')) - Number(b.createdAt.replace(regExp, ''));
        });
        dispatch(setTopics({ topics: topicsSorted }));
    } catch (error) {
        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
    }
});

export const createTopic = createAsyncThunk(
    'forum/createTopic',
    async function (topicData: TTopicData, { rejectWithValue, dispatch }) {
        try {
            const response = await ForumService.CreateTopic(topicData);

            if (!response) {
                throw new Error('Ошибка создания топика');
            }

            dispatch(getTopics());
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
        }
    },
);

export const deleteTopic = createAsyncThunk(
    'forum/deleteTopic',
    async function (topicId: string, { rejectWithValue, dispatch }) {
        try {
            const response = await ForumService.DeleteTopic(topicId);

            if (!response) {
                throw new Error('Ошибка удаления топика');
            }

            dispatch(getTopics());
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
        }
    },
);

export const getComments = createAsyncThunk(
    'forum/getComments',
    async function (topicId: string, { rejectWithValue, dispatch }) {
        try {
            const response = await ForumService.GetComments(topicId);

            if (!response) {
                throw new Error('Ошибка получения комментариев');
            }

            const commentsSorted = response.sort((a, b) => {
                return Number(b.createdAt.replace(regExp, '')) - Number(a.createdAt.replace(regExp, ''));
            });

            dispatch(setComments({ comments: commentsSorted }));
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
        }
    },
);

export const createComment = createAsyncThunk(
    'forum/createComment',
    async function (commentData: TCommentReq, { rejectWithValue, dispatch }) {
        try {
            const response = await ForumService.CreateComment(commentData);

            if (!response) {
                throw new Error('Ошибка создания комментария');
            }

            dispatch(getComments(String(commentData.TopicId)));
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
        }
    },
);

export const deleteComment = createAsyncThunk(
    'forum/deleteComment',
    async function (idData: TIdData, { rejectWithValue, dispatch }) {
        try {
            const response = await ForumService.DeleteComment(idData.commentId);

            if (!response) {
                throw new Error('Ошибка удаления комментария');
            }

            dispatch(getComments(idData.topicId));
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
        }
    },
);
