"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Moon, Sun, Plus, Download, Sparkles, HeartCrack, Trash2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Navbar from "@/components/ui/Navbar";

interface Application {
  id: number;
  company: string;
  role: string;
  date_applied: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  job_description?: string;
  notes?: string;
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications/");
      setApplications(res.data || []);
    } catch (err: any) {
      if (err.response?.status === 401) router.push("/login");
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    await api.patch(`/applications/${draggableId}`, { status: destination.droppableId });
    fetchApplications();
    toast.success("Status updated!");
  };

  // Add Application + Auto JD Analysis
  const handleAddApp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      company: formData.get("company"),
      role: formData.get("role"),
      date_applied: new Date().toISOString(),
      job_description: formData.get("jd"),
    };

    const res = await api.post("/applications/", data);
    const appId = res.data.id;

    if (formData.get("jd")) {
      await api.post(`/applications/${appId}/analyze-jd`, {
        job_desc: formData.get("jd"),
      });
      toast.success("AI analyzed JD!", { icon: "Sparkles" });
    }

    toast.success("Application added!");
    form.reset();
    fetchApplications();
  };

  // Tailor Resume
  const tailorResume = async (appId: number) => {
    const resume = prompt("Paste your current resume text:");
    if (!resume) return;
    await api.post(`/applications/${appId}/tailor-resume`, { resume });
    toast.success("Resume tailored! Check notes");
    fetchApplications();
  };

  // Rejection Analyzer
  const handleRejection = async (appId: number) => {
    const email = prompt("Paste the rejection email:");
    if (!email) return;
    await api.post(`/applications/${appId}/rejection`, { email });
    toast.success("We got you — keep going!", { icon: "HuggingFace" });
    fetchApplications();
  };

  // Permanent Delete
  const handleDelete = async (appId: number) => {
    if (!confirm("Delete this application permanently?\nThis cannot be undone.")) return;

    try {
      await api.delete(`/applications/${appId}`);
      toast.success("Application deleted forever");
      fetchApplications();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  // Export PDF
  const exportPDF = (app: Application) => {
    const content = `Tailored Resume for ${app.company} - ${app.role}\n\n${app.notes || "No AI notes yet"}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${app.company}-${app.role}-resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20">
        <div className="container mx-auto px-6 py-10 max-w-7xl">

          {/* Hero Title + Dark Mode */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Welcome back, Hunter
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track smarter. Land faster.
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          <Tabs defaultValue="kanban" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
              <TabsTrigger value="stats">Stats (soon)</TabsTrigger>
            </TabsList>

            {/* LIST VIEW */}
            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>Your Applications</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" />Add New</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Add New Application</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddApp} className="space-y-4">
                          <div className="space-y-4">
                            <div>
                              <Label>Company</Label>
                              <Input name="company" required />
                            </div>
                            <div>
                              <Label>Role</Label>
                              <Input name="role" required />
                            </div>
                            <div>
                              <Label>Job Description (paste full JD)</Label>
                              <Textarea name="jd" rows={8} className="font-mono text-sm" />
                            </div>
                            <Button type="submit" className="w-full">
                              <Sparkles className="mr-2 h-4 w-4" /> Add & Analyze with AI
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <Card key={app.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{app.company}</h3>
                              <p className="text-gray-600">{app.role}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(app.date_applied).toLocaleDateString()}
                              </p>
                              {app.notes && (
                                <p className="mt-3 text-sm text-gray-700 line-clamp-3">
                                  {app.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={app.status === "Offer" ? "default" : "secondary"}>
                                {app.status}
                              </Badge>
                              <Button size="sm" onClick={() => tailorResume(app.id)}>
                                Tailor Resume
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleRejection(app.id)}>
                                <HeartCrack className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => exportPDF(app)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(app.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* KANBAN BOARD */}
            <TabsContent value="kanban">
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {["Applied", "Interview", "Offer", "Rejected"].map((status) => (
                    <div key={status} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5">
                      <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {status === "Offer" && "Trophy"}
                          {status}
                        </span>
                        <Badge variant="secondary">
                          {applications.filter(a => a.status === status).length}
                        </Badge>
                      </h3>
                      <Droppable droppableId={status}>
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-3 min-h-[100px]"
                          >
                            {applications
                              .filter((a) => a.status === status)
                              .map((app, index) => (
                                <Draggable key={app.id} draggableId={app.id.toString()} index={index}>
                                  {(provided, snapshot) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-4 cursor-move transition-all group
                                        ${snapshot.isDragging ? "shadow-2xl scale-105" : "hover:shadow-xl"}
                                        bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
                                      `}
                                    >
                                      <div className="flex justify-between items-start gap-3">
                                        <div>
                                          <p className="font-semibold text-lg">{app.company}</p>
                                          <p className="text-sm text-gray-600 dark:text-gray-400">{app.role}</p>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(app.id);
                                          }}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity 
                                            text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </Card>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
              </DragDropContext>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}