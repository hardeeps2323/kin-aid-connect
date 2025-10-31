import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Hospital, Shield, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">NOC Body Release System</h1>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16 space-y-4">
          <h2 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Streamlined Body Release Process
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Reducing the time from 24-36 hours to just a few hours through digital coordination between families, hospitals, and police.
          </p>
          <div className="pt-6">
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-elevated">
              Get Started
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="shadow-card hover:shadow-elevated transition-all">
            <CardHeader>
              <Clock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Faster Process</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Reduce waiting time from 24-36 hours to just a few hours through streamlined digital workflow
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all">
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Digital NOC</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                No Objection Certificates generated and approved digitally without physical document transfer
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all">
            <CardHeader>
              <Hospital className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Hospital Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Direct communication between hospital staff and police for faster verification and approval
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure & Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Maintains all legal requirements while ensuring data security and privacy for all parties
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        <section className="bg-card rounded-lg shadow-elevated p-8 md:p-12">
          <h3 className="text-3xl font-bold mb-8 text-center">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                1
              </div>
              <h4 className="font-semibold text-lg">Family Submits Request</h4>
              <p className="text-muted-foreground">
                Family members submit body release application with patient details and incident information
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                2
              </div>
              <h4 className="font-semibold text-lg">Hospital Reviews & Forwards</h4>
              <p className="text-muted-foreground">
                Hospital staff review the application and forward it digitally to police for NOC generation
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                3
              </div>
              <h4 className="font-semibold text-lg">Police Issues NOC</h4>
              <p className="text-muted-foreground">
                Police create NOC which is approved by hospital, and body is released to family
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 NOC Body Release System. Streamlining processes during difficult times.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
