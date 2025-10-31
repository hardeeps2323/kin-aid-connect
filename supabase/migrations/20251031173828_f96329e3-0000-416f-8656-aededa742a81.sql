-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('family', 'hospital', 'police');

-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('submitted', 'hospital_review', 'forwarded_to_police', 'noc_created', 'hospital_approved', 'completed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  hospital_name TEXT,
  police_station TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create body release applications table
CREATE TABLE public.body_release_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_age INTEGER NOT NULL,
  patient_birthdate DATE NOT NULL,
  patient_aadhaar TEXT NOT NULL,
  patient_address TEXT NOT NULL,
  relation_to_applicant TEXT NOT NULL,
  incident_details TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'submitted',
  hospital_notes TEXT,
  police_notes TEXT,
  noc_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create NOC documents table for tracking
CREATE TABLE public.noc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.body_release_applications(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_release_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noc_documents ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Applications policies
CREATE POLICY "Users can view applications based on role"
  ON public.body_release_applications FOR SELECT
  USING (
    applicant_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hospital', 'police'))
  );

CREATE POLICY "Family can create applications"
  ON public.body_release_applications FOR INSERT
  WITH CHECK (
    applicant_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'family')
  );

CREATE POLICY "Hospital and police can update applications"
  ON public.body_release_applications FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hospital', 'police'))
  );

-- NOC documents policies
CREATE POLICY "Users can view NOC documents for their applications"
  ON public.noc_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.body_release_applications 
      WHERE id = application_id AND (
        applicant_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hospital', 'police'))
      )
    )
  );

CREATE POLICY "Hospital and police can create NOC documents"
  ON public.noc_documents FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('hospital', 'police'))
  );

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.body_release_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'family')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();