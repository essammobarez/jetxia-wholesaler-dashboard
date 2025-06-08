"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { Textarea } from "../ui/textarea";
import { useTaskUpdateMutation } from "@/redux/features/tasks/tasksApi";

const UpdateEventForm = ({ taskData }: any) => {

  const { _id } = taskData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: taskData?.title,
      description: taskData?.description,
   
      status: taskData?.status,
      dueDate: taskData?.dueDate,
    },
  });

  const [updateTaskData] = useTaskUpdateMutation();

  const onSubmit = async (data: any) => {
    // toast.loading("Updating....");

    try {
      const res = await updateTaskData({
        id: _id,
        updatedData: data,
      });
      console.log(res);
      if (res) {
        toast.success("Updated Successfully");
      }
    } catch (err) {
      toast.error("failed");
      console.log(err);
    }
  };
  return (
    <>
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="title"
            type="text"
            defaultValue={taskData?.title}
            placeholder="Event Name"
            {...register("title")}
          />
          {errors.title && (
            <span className="text-red-600">{errors.title.message}</span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="location">Description</Label>
          <Textarea
            id="description"
            defaultValue={taskData?.description}
            placeholder="e.g. Roof"
            {...register("description")}
          />
          {errors.description && (
            <span className="text-red-600">{errors.description.message}</span>
          )}
        </div>



        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            {...register("status")}
            id="status"
            className="p-1.5 bg-inherit border border-muted rounded-md"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          {errors.status && (
            <span className="text-red-600">{errors.status.message}</span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="dueDate"
            type="date"
            placeholder="Event Date"
            {...register("dueDate")}
          />
          {errors.dueDate && (
            <span className="text-red-600">{errors.dueDate.message}</span>
          )}
        </div>

        <Button type="submit" className="w-full">
          Confirm
        </Button>
      </form>
    </>
  );
};

export default UpdateEventForm;
