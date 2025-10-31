import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import FamilyDashboard from "@/components/dashboard/FamilyDashboard";
import HospitalDashboard from "@/components/dashboard/HospitalDashboard";
import PoliceDashboard from "@/components/dashboard/PoliceDashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", session.user.id)
        .single();

      if (error) {
        toast.error("Failed to load profile");
        return;
      }

      setUserRole(profile.role);
      setUserName(profile.full_name);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">NOC Body Release System</h1>
            <p className="text-sm text-muted-foreground">Welcome, {userName}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {userRole === "family" && <FamilyDashboard />}
        {userRole === "hospital" && <HospitalDashboard />}
        {userRole === "police" && <PoliceDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
