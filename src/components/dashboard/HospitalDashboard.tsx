import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Application {
  id: string;
  patient_name: string;
  patient_age: number;
  patient_aadhaar: string;
  patient_address: string;
  relation_to_applicant: string;
  incident_details: string;
  status: string;
  hospital_notes: string | null;
  created_at: string;
}

const HospitalDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [hospitalNotes, setHospitalNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("body_release_applications")
      .select("*")
      .in("status", ["submitted", "hospital_review", "noc_created"])
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load applications");
      return;
    }

    setApplications(data || []);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleForwardToPolice = async () => {
    if (!selectedApp) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("body_release_applications")
        .update({
          status: "forwarded_to_police",
          hospital_notes: hospitalNotes,
        })
        .eq("id", selectedApp.id);

      if (error) throw error;

      toast.success("Application forwarded to police");
      setSelectedApp(null);
      setHospitalNotes("");
      fetchApplications();
    } catch (error: any) {
      toast.error(error.message || "Failed to forward application");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRelease = async () => {
    if (!selectedApp) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("body_release_applications")
        .update({
          status: "completed",
          hospital_notes: hospitalNotes,
        })
        .eq("id", selectedApp.id);

      if (error) throw error;

      toast.success("Body release approved");
      setSelectedApp(null);
      setHospitalNotes("");
      fetchApplications();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve release");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Hospital Dashboard</h2>
        <p className="text-muted-foreground">Review and process body release applications</p>
      </div>

      {applications.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No pending applications</p>
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
                    <CardDescription>Age: {app.patient_age} years • Aadhaar: {app.patient_aadhaar}</CardDescription>
                  </div>
                  <Badge variant="outline">{app.status.replace(/_/g, " ").toUpperCase()}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Address:</p>
                  <p className="text-sm text-muted-foreground">{app.patient_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Incident Details:</p>
                  <p className="text-sm text-muted-foreground">{app.incident_details}</p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedApp(app);
                    setHospitalNotes(app.hospital_notes || "");
                  }}
                  variant={app.status === "noc_created" ? "default" : "outline"}
                >
                  {app.status === "submitted" || app.status === "hospital_review"
                    ? "Review & Forward to Police"
                    : "Approve Body Release"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Application</DialogTitle>
            <DialogDescription>
              {selectedApp?.status === "noc_created"
                ? "Review NOC and approve body release"
                : "Add notes and forward to police"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hospital Notes</Label>
              <Textarea
                value={hospitalNotes}
                onChange={(e) => setHospitalNotes(e.target.value)}
                placeholder="Add any relevant notes or observations"
                rows={4}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Cancel
              </Button>
              <Button
                onClick={
                  selectedApp?.status === "noc_created"
                    ? handleApproveRelease
                    : handleForwardToPolice
                }
                disabled={loading}
              >
                {loading ? "Processing..." : selectedApp?.status === "noc_created" ? "Approve Release" : "Forward to Police"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HospitalDashboard;
