import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Application {
  id: string;
  patient_name: string;
  patient_age: number;
  patient_aadhaar: string;
  patient_address: string;
  incident_details: string;
  hospital_notes: string | null;
  status: string;
  police_notes: string | null;
  noc_number: string | null;
  created_at: string;
}

const PoliceDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [policeNotes, setPoliceNotes] = useState("");
  const [nocNumber, setNocNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("body_release_applications")
      .select("*")
      .eq("status", "forwarded_to_police")
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

  const handleCreateNOC = async () => {
    if (!selectedApp || !nocNumber.trim()) {
      toast.error("Please enter NOC number");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from("body_release_applications")
        .update({
          status: "noc_created",
          police_notes: policeNotes,
          noc_number: nocNumber,
        })
        .eq("id", selectedApp.id);

      if (updateError) throw updateError;

      const { error: docError } = await supabase.from("noc_documents").insert({
        application_id: selectedApp.id,
        document_type: "NOC",
        created_by: session.user.id,
        content: `NOC Number: ${nocNumber}\n\nPolice Notes:\n${policeNotes}`,
      });

      if (docError) throw docError;

      toast.success("NOC created successfully");
      setSelectedApp(null);
      setPoliceNotes("");
      setNocNumber("");
      fetchApplications();
    } catch (error: any) {
      toast.error(error.message || "Failed to create NOC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Police Dashboard</h2>
        <p className="text-muted-foreground">Review applications and issue NOC</p>
      </div>

      {applications.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No applications pending review</p>
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
                  <Badge variant="outline">FORWARDED FROM HOSPITAL</Badge>
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
                {app.hospital_notes && (
                  <div>
                    <p className="text-sm font-medium">Hospital Notes:</p>
                    <p className="text-sm text-muted-foreground">{app.hospital_notes}</p>
                  </div>
                )}
                <Button
                  onClick={() => {
                    setSelectedApp(app);
                    setPoliceNotes(app.police_notes || "");
                    setNocNumber(app.noc_number || "");
                  }}
                >
                  Create NOC
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create NOC</DialogTitle>
            <DialogDescription>Issue No Objection Certificate for body release</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>NOC Number *</Label>
              <Input
                value={nocNumber}
                onChange={(e) => setNocNumber(e.target.value)}
                placeholder="Enter NOC reference number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Police Notes</Label>
              <Textarea
                value={policeNotes}
                onChange={(e) => setPoliceNotes(e.target.value)}
                placeholder="Add investigation notes or remarks"
                rows={4}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNOC} disabled={loading}>
                {loading ? "Creating..." : "Create NOC"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PoliceDashboard;
