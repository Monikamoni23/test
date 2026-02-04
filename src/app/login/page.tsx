"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import { useToast } from "@/components/toast-provider";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = () => {
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as "email" | "password";
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    pushToast({
      title: "Login successful",
      description: "Redirecting to your dashboard",
      variant: "success",
    });
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Sign in to access the Contract Management prototype.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Email" error={errors.email}>
            <Input
              placeholder="olivia@contractos.com"
              value={values.email}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Password" error={errors.password}>
            <Input
              type="password"
              placeholder="••••••••"
              value={values.password}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, password: event.target.value }))
              }
            />
          </FormField>
          <Button className="w-full" onClick={handleSubmit}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
