"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { useUserLoginMutation } from "@/redux/features/auth/authApi";
import { verifyToken } from "@/utils/verifyToken";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/features/auth/authSlice";
import { useForm, SubmitHandler } from "react-hook-form";
import { storeUserInfo } from "@/services/auth.services";
import Link from "next/link";
import { toast } from "sonner";
type FormValues = {
  email: string;
  password: string;
};
const SignInForm = () => {
  const { register, handleSubmit, setValue } = useForm<FormValues>();
  const [userLogin] = useUserLoginMutation();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      console.log(data);
      const res = await userLogin({ ...data }).unwrap();
      console.log(res);
      if (res?.token) {
        toast.success("Login Successfully");
        storeUserInfo({ accessToken: res?.token });
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      // toast.error(err);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
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

        {/* Password Field */}
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

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </Form>
  );
};

export default SignInForm;
