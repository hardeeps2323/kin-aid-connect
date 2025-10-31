import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

const applicationSchema = z.object({
  patientName: z.string().min(2, "Name must be at least 2 characters").max(100),
  patientAge: z.number().min(0).max(150),
  patientBirthdate: z.string(),
  patientAadhaar: z.string().length(12, "Aadhaar must be 12 digits").regex(/^\d+$/, "Aadhaar must contain only numbers"),
  patientAddress: z.string().min(10, "Address must be at least 10 characters").max(500),
  relationToApplicant: z.string().min(2).max(100),
  incidentDetails: z.string().min(20, "Please provide detailed incident information").max(1000),
});

interface ApplicationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ApplicationForm = ({ onSuccess, onCancel }: ApplicationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientBirthdate: "",
    patientAadhaar: "",
    patientAddress: "",
    relationToApplicant: "",
    incidentDetails: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = applicationSchema.parse({
        ...formData,
        patientAge: parseInt(formData.patientAge),
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      const { error } = await supabase.from("body_release_applications").insert({
        applicant_id: session.user.id,
        patient_name: validatedData.patientName,
        patient_age: validatedData.patientAge,
        patient_birthdate: validatedData.patientBirthdate,
        patient_aadhaar: validatedData.patientAadhaar,
        patient_address: validatedData.patientAddress,
        relation_to_applicant: validatedData.relationToApplicant,
        incident_details: validatedData.incidentDetails,
      });

      if (error) throw error;

      toast.success("Application submitted successfully");
      onSuccess();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to submit application");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientName">Patient Name *</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="patientAge">Patient Age *</Label>
          <Input
            id="patientAge"
            type="number"
            value={formData.patientAge}
            onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="patientBirthdate">Date of Birth *</Label>
          <Input
            id="patientBirthdate"
            type="date"
            value={formData.patientBirthdate}
            onChange={(e) => setFormData({ ...formData, patientBirthdate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="patientAadhaar">Aadhaar Number *</Label>
          <Input
            id="patientAadhaar"
            value={formData.patientAadhaar}
            onChange={(e) => setFormData({ ...formData, patientAadhaar: e.target.value })}
            maxLength={12}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="patientAddress">Patient Address *</Label>
        <Textarea
          id="patientAddress"
          value={formData.patientAddress}
          onChange={(e) => setFormData({ ...formData, patientAddress: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="relationToApplicant">Your Relation to Patient *</Label>
        <Input
          id="relationToApplicant"
          value={formData.relationToApplicant}
          onChange={(e) => setFormData({ ...formData, relationToApplicant: e.target.value })}
          placeholder="e.g., Son, Daughter, Spouse"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="incidentDetails">Incident Details *</Label>
        <Textarea
          id="incidentDetails"
          value={formData.incidentDetails}
          onChange={(e) => setFormData({ ...formData, incidentDetails: e.target.value })}
          placeholder="Provide detailed information about the incident"
          rows={5}
          required
        />
      </div>
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  );
};

export default ApplicationForm;
