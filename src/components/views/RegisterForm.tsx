"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useUserSignupMutation } from "@/redux/features/auth/authApi";

// import { useSignUPMutation } from "@/redux/features/auth/authApi";
// import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const RegisterForm = () => {
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",

    },
  });
  const router = useRouter();
  //   const navigate = useNavigate();
  const [signUP] = useUserSignupMutation();
  const onSubmit = async (data: any) => {
    console.log(data);
    try {
      const res = await signUP(data).unwrap();

      console.log(res);
      if (res?._id) {
        toast.success("Register Successful login now!!!");
        router.push(`/login`);
      }
    } catch (error) {
      console.log(error);
    }
    // Add your form submission logic here
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="name" placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
