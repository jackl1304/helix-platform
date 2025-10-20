import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { RocketIcon, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the form schema using Zod for validation
const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters long.'),
  description: z.string().optional(),
  productArea: z.string().min(1, 'Please select a product area.'),
  deviceClass: z.string().min(1, 'Please select a device class.'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const createProject = async (data: ProjectFormData) => {
  // Assumption: Hardcoding tenantId and createdBy for now.
  // In a real app, this would come from the user's session.
  const payload = {
    ...data,
    tenantId: 'demo-medical-tech',
    createdBy: 'user-123',
  };

  const response = await fetch('/api/project-notebooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create project notebook');
  }

  return response.json();
};

export default function ProjectKickstarter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      toast({
        title: "Project Created Successfully!",
        description: `Your new project "${data.name}" is ready.`,
      });
      queryClient.invalidateQueries({ queryKey: ['project-notebooks'] });
      reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not create the project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <RocketIcon className="h-6 w-6" />
            Project Kickstarter
          </CardTitle>
          <CardDescription>Define your new product to generate a structured project notebook.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" placeholder="e.g., AI-Powered Stethoscope" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" placeholder="Briefly describe the product and its intended use." {...register('description')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Area</Label>
                <Controller
                  name="productArea"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Diagnostics">Diagnostics</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Software as a Medical Device (SaMD)">Software as a Medical Device (SaMD)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.productArea && <p className="text-sm text-red-500">{errors.productArea.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceClass">Device Class (EU MDR)</Label>
                <Controller
                  name="deviceClass"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a device class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Class I">Class I</SelectItem>
                        <SelectItem value="Class IIa">Class IIa</SelectItem>
                        <SelectItem value="Class IIb">Class IIb</SelectItem>
                        <SelectItem value="Class III">Class III</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.deviceClass && <p className="text-sm text-red-500">{errors.deviceClass.message}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Project...
                </>
              ) : (
                'Create Project Notebook'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
