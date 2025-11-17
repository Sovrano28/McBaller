"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { createTeam } from "@/lib/actions/teams";

interface CreateTeamFormProps {
  organizationId: string;
  divisions: any[];
  ageGroups: any[];
  seasons: any[];
}

export default function CreateTeamForm({
  organizationId,
  divisions,
  ageGroups,
  seasons,
}: CreateTeamFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
    divisionId: "none",
    ageGroupId: "none",
    seasonId: "none",
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll just store the file name/path
      // In production, you'd upload to cloud storage and get URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        // Store as base64 data URL for now
        // TODO: In production, upload to S3/Cloudinary/etc and store the returned URL
        setFormData({ ...formData, logo: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createTeam(organizationId, {
        name: formData.name,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
        logo: formData.logo || undefined,
        divisionId:
          formData.divisionId && formData.divisionId !== "none"
            ? formData.divisionId
            : undefined,
        ageGroupId:
          formData.ageGroupId && formData.ageGroupId !== "none"
            ? formData.ageGroupId
            : undefined,
        seasonId:
          formData.seasonId && formData.seasonId !== "none"
            ? formData.seasonId
            : undefined,
      });

      if (result.success && result.team) {
        toast({
          title: "Team Created",
          description: "Team has been created successfully",
        });
        router.push(`/org/teams/${result.team.id}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to create team",
        });
      }
    } catch (error) {
      console.error("Create team error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/org/teams">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Team</h1>
          <p className="text-muted-foreground">Create a new team for your organization</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
          <CardDescription>
            Enter the team information below. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Senior Team A"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="auto-generated-from-name"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier (auto-generated from name)
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Team description, goals, or notes..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo">Team Logo</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="cursor-pointer"
                />
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-16 w-16 rounded object-cover"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Optional: Upload a team logo (PNG, JPG, or GIF)
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="divisionId">Division</Label>
                <Select
                  value={formData.divisionId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, divisionId: value })
                  }
                >
                  <SelectTrigger id="divisionId">
                    <SelectValue placeholder="Select division (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Division</SelectItem>
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.name}
                        {division.level && ` (Level ${division.level})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ageGroupId">Age Group</Label>
                <Select
                  value={formData.ageGroupId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, ageGroupId: value })
                  }
                >
                  <SelectTrigger id="ageGroupId">
                    <SelectValue placeholder="Select age group (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Age Group</SelectItem>
                    {ageGroups.map((ageGroup) => (
                      <SelectItem key={ageGroup.id} value={ageGroup.id}>
                        {ageGroup.name}
                        {ageGroup.minAge &&
                          ageGroup.maxAge &&
                          ` (${ageGroup.minAge}-${ageGroup.maxAge} years)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seasonId">Season</Label>
                <Select
                  value={formData.seasonId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, seasonId: value })
                  }
                >
                  <SelectTrigger id="seasonId">
                    <SelectValue placeholder="Select season (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Season</SelectItem>
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={season.id}>
                        {season.name}
                        {season.isActive && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Active)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Team"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/org/teams">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

