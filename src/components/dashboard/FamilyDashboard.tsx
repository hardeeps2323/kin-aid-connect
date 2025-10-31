import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import ApplicationForm from "./ApplicationForm";
import { toast } from "sonner";

interface Application {
  id: string;
  patient_name: string;
  patient_age: number;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  submitted: "bg-primary text-primary-foreground",
  hospital_review: "bg-warning text-warning-foreground",
  forwarded_to_police: "bg-secondary text-secondary-foreground",
  noc_created: "bg-accent text-accent-foreground",
  hospital_approved: "bg-accent text-accent-foreground",
  completed: "bg-accent text-accent-foreground",
};

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  hospital_review: "Under Hospital Review",
  forwarded_to_police: "Forwarded to Police",
  noc_created: "NOC Created",
  hospital_approved: "Approved by Hospital",
  completed: "Completed",
};

const FamilyDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("body_release_applications")
      .select("id, patient_name, patient_age, status, created_at")
      .eq("applicant_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load applications");
      return;
    }

    setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchApplications();
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading applications...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">My Applications</h2>
          <p className="text-muted-foreground">Track your body release requests</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>Submit New Application</CardTitle>
            <CardDescription>Fill in the patient details to request body release</CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationForm onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      {applications.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No applications yet. Click "New Application" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{app.patient_name}</CardTitle>
                    <CardDescription>Age: {app.patient_age} years</CardDescription>
                  </div>
                  <Badge className={statusColors[app.status]}>
                    {statusLabels[app.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Submitted: {new Date(app.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyDashboard;
