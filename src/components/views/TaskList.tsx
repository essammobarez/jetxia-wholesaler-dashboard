"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Trash } from "lucide-react";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UpdateEventForm from "./UpdateTaskForm";

import { toast } from "sonner";
import Loading from "@/app/loading";
import {
  useDeleteTaskMutation,
  useGetUserCreatedTaskQuery,
} from "@/redux/features/tasks/tasksApi";

const TaskList = () => {
  const { data: userTaskData, isLoading } =
    useGetUserCreatedTaskQuery(undefined);
  if (isLoading) {
    <Loading />;
  }
  const [deleteTask] = useDeleteTaskMutation();

  const handleDelete = async (id: string) => {
    toast.promise(deleteTask(id), {
      loading: "Deleting...",
      success: "Delete Successfully",
      error: "Could not delete.",
    });
  };

  return (
    <div className="">
      <Card x-chunk="dashboard-06-chunk-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Tasks created by <span className="text-primary">Me</span>
          </CardTitle>
          <CardDescription>
            Manage your tasks and view their details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="overflow-x-scroll">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userTaskData?.map((data: any) => (
                <TableRow key={data._id}>
                  <TableCell className="font-medium">{data.title}</TableCell>
                  <TableCell>{data.dueDate}</TableCell>

                  <TableCell>
                    <Badge variant="outline">{data.status}</Badge>
                  </TableCell>
                  <TableCell className="flex justify-start items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Edit className="h-4 w-4 cursor-pointer" />
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>
                            Update This{" "}
                            <span className="text-primary">Task</span>
                          </DialogTitle>
                          <DialogDescription>
                            Give Proper Information
                          </DialogDescription>
                        </DialogHeader>
                        <UpdateEventForm taskData={data} />
                      </DialogContent>
                    </Dialog>

                    <Popover>
                      <PopoverTrigger
                        onClick={() => handleDelete(data?._id)}
                        asChild
                      >
                        <Trash className="h-4 w-4 text-primary cursor-pointer" />
                      </PopoverTrigger>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskList;
