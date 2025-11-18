import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProjectSelectorProps {
  value?: string;
  onValueChange?: (projectId: string) => void;
  onCreateNew?: () => void;
  className?: string;
}

export function ProjectSelector({
  value,
  onValueChange,
  onCreateNew,
  className,
}: ProjectSelectorProps) {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return <Skeleton className={cn("h-10 w-48", className)} />;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={value || "all"} onValueChange={onValueChange}>
        <SelectTrigger className="w-[200px] md:w-[240px]">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          {projects?.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={onCreateNew}
        variant="outline"
        size="sm"
        className="rounded-full"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
