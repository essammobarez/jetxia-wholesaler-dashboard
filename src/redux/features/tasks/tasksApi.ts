import { baseApi } from "@/redux/api/baseApi";

const TASK_URL = "/task";

export const taskApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createTask: build.mutation({
      query: (data) => ({
        url: `${TASK_URL}`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["task", "user"],
    }),
    getAllTask: build.query({
      query: () => ({
        url: `${TASK_URL}`,
        method: "GET",
      }),

      providesTags: ["task"],
    }),
    getUserCreatedTask: build.query({
      query: () => ({
        url: `${TASK_URL}`,
        method: "GET",
      }),

      providesTags: ["task", "user"],
    }),
    deleteTask: build.mutation({
      query: (id) => ({
        url: `${TASK_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["task"],
    }),

    taskUpdate: build.mutation({
      query: ({ id, updatedData }) => {
        // Log the received parameters
        console.log("ID:", id);
        console.log("Updated Data:", updatedData);
    

        return {
          url: `${TASK_URL}/${id}`,
          method: "PUT",
          data: updatedData,
        };
      },
      invalidatesTags: ["task"],
    }),
  }),
});

export const {
useCreateTaskMutation,
useGetUserCreatedTaskQuery,
useTaskUpdateMutation,
useDeleteTaskMutation
} = taskApi;
