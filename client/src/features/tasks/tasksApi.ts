import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types/task';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      query: () => '/tasks',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Task' as const, id })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
    }),

    getTask: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),

    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (task) => ({
        url: '/tasks',
        method: 'POST',
        body: task,
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),

    updateTask: builder.mutation<Task, { id: string; updates: UpdateTaskRequest }>({
      query: ({ id, updates }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
      async onQueryStarted({ id, updates }, { dispatch, queryFulfilled }) {
        const optimisticUpdatedAt = new Date().toISOString();
        const patches: Array<{ undo: () => void }> = [];

        try {
          patches.push(
            dispatch(
              tasksApi.util.updateQueryData('getTasks', undefined, (draft) => {
                const existing = draft.find((t) => t.id === id);
                if (!existing) return;
                Object.assign(existing, updates, { updatedAt: optimisticUpdatedAt });
              })
            )
          );
        } catch {
          // If cache entry doesn't exist yet, skip.
        }

        try {
          patches.push(
            dispatch(
              tasksApi.util.updateQueryData('getTask', id, (draft) => {
                Object.assign(draft, updates, { updatedAt: optimisticUpdatedAt });
              })
            )
          );
        } catch {
          // If cache entry doesn't exist yet, skip.
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    deleteTask: builder.mutation<{ message: string; id: string }, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
