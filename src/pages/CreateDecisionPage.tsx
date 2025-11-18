import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function CreateDecisionPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    area: "",
    description: "",
    requiredBy: "",
    assigneeId: "",
    options: [
      { title: "", specs: "", costDelta: "", prosCons: "", isDefault: false },
    ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement create decision logic
    console.log("Create decision:", formData);
    navigate("/dashboard");
  };

  const addOption = () => {
    if (formData.options.length < 3) {
      setFormData({
        ...formData,
        options: [
          ...formData.options,
          { title: "", specs: "", costDelta: "", prosCons: "", isDefault: false },
        ],
      });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index),
      });
    }
  };

  const updateOption = (index: number, field: string, value: string | boolean) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-3xl">Create New Decision</CardTitle>
            <CardDescription>
              Create a decision card with options for your client to review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project & Context */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project & Context</h3>
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, projectId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project1">Project Alpha</SelectItem>
                      <SelectItem value="project2">Project Beta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area / Context</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                    placeholder="e.g., Backend Architecture"
                  />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Decision Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="What decision needs to be made?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Provide context for this decision..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Options Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Options (1-3)</h3>
                  {formData.options.length < 3 && (
                    <Button type="button" variant="outline" onClick={addOption}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  )}
                </div>
                {formData.options.map((option, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Option {index + 1}</CardTitle>
                        {formData.options.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          value={option.title}
                          onChange={(e) =>
                            updateOption(index, "title", e.target.value)
                          }
                          placeholder="Option name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Specifications</Label>
                        <Textarea
                          value={option.specs}
                          onChange={(e) =>
                            updateOption(index, "specs", e.target.value)
                          }
                          placeholder="Technical specifications..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Cost Impact</Label>
                          <Input
                            value={option.costDelta}
                            onChange={(e) =>
                              updateOption(index, "costDelta", e.target.value)
                            }
                            placeholder="+$10k, -$5k, etc."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pros & Cons</Label>
                          <Input
                            value={option.prosCons}
                            onChange={(e) =>
                              updateOption(index, "prosCons", e.target.value)
                            }
                            placeholder="Brief pros/cons"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Required-by Date */}
              <div className="space-y-2">
                <Label htmlFor="requiredBy">Required By *</Label>
                <Input
                  id="requiredBy"
                  type="date"
                  value={formData.requiredBy}
                  onChange={(e) =>
                    setFormData({ ...formData, requiredBy: e.target.value })
                  }
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  Create Decision
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
