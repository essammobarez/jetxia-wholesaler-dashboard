"use client"
import React from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalTrigger,
} from "../ui/animated-modal";

import { Calendar } from "../ui/calendar";

import { Textarea } from "../ui/textarea";

import { useCreateTaskMutation } from "@/redux/features/tasks/tasksApi";

const AddTaskForm = () => {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      dueDate: null,
    },
  });
  const [addTask] = useCreateTaskMutation();
  const onSubmit = async (data: any) => {
    try {
      const formattedData = {
        ...data,
        dueDate: data.dueDate ? format(new Date(data.dueDate), "dd-MM-yyyy") : null,

      };

      console.log(formattedData);

      const res = await addTask(formattedData).unwrap();
      console.log(res);

      if (res?._id) {
        toast.success("Task Created Successfully");
      }
    } catch (err) {
      console.log(err);
      alert(err);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Modal>
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
          <span>Add Task</span>
        </ModalTrigger>
        <ModalBody>
          <ModalContent className="overflow-y-auto">
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
              Add A{" "}
              <span className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                Task
              </span>{" "}
              now!
            </h4>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
                {/* Event Name */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter event name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Picker */}
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => field.onChange(date)}
                        initialFocus
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          // type="text"
                          placeholder="Task Details"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              
       

                {/* Submit Button */}
                <button
                  type="submit"
                  className="bg-black text-white dark:bg-white dark:text-black text-sm px-4 py-2 rounded-md border border-black w-full"
                >
                  Submit
                </button>
              </form>
            </Form>
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AddTaskForm;
