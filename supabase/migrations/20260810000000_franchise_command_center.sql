-- Franchise Command Center & Expansion Intelligence Schema
-- Establishes the multi-unit franchisor/franchisee structural hierarchy branching from businesses.

-- 1. Expansion Projects
CREATE TABLE expansion_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'Planning' CHECK (status IN ('Planning', 'Active', 'Paused', 'Completed', 'Cancelled')),
  target_region text,
  budget numeric(12,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Market Candidates
CREATE TABLE market_candidates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES expansion_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  geography_polygon text, -- Storing as GeoJSON string for simplicity in this migration
  population_density integer,
  median_income numeric(12,2),
  competitive_index numeric(5,2),
  viability_score numeric(5,2),
  status text NOT NULL DEFAULT 'Evaluating' CHECK (status IN ('Evaluating', 'Approved', 'Rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Franchise Programs
CREATE TABLE franchise_programs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  initial_franchise_fee numeric(12,2),
  royalty_percentage numeric(5,2),
  minimum_liquid_capital numeric(12,2),
  minimum_net_worth numeric(12,2),
  term_length_years integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Franchise Candidates (Pipeline CRM)
CREATE TABLE franchise_candidates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  program_interest_id uuid REFERENCES franchise_programs(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Lead' CHECK (status IN ('Lead', 'Contacted', 'Application Submitted', 'Under Review', 'Approved', 'Rejected', 'Signed')),
  liquid_capital_available numeric(12,2),
  net_worth numeric(12,2),
  background_check_status text DEFAULT 'Pending' CHECK (background_check_status IN ('Pending', 'Cleared', 'Flagged')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Territories
CREATE TABLE territories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  geography_polygon text,
  assigned_franchisee_id uuid REFERENCES franchise_candidates(id) ON DELETE SET NULL,
  market_candidate_id uuid REFERENCES market_candidates(id) ON DELETE SET NULL,
  exclusivity_status text NOT NULL DEFAULT 'Exclusive' CHECK (exclusivity_status IN ('Exclusive', 'Non-Exclusive')),
  population_covered integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. FDD Versions (Document Control)
CREATE TABLE fdd_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  version_number text NOT NULL,
  effective_date date NOT NULL,
  expiration_date date,
  document_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Alter franchise_candidates to support target territory
ALTER TABLE franchise_candidates ADD COLUMN target_territory_id uuid REFERENCES territories(id) ON DELETE SET NULL;


-- RLS ENABLING
ALTER TABLE expansion_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fdd_versions ENABLE ROW LEVEL SECURITY;

-- POLICIES (Tenant Isolation)
CREATE POLICY "Tenant Isolation - Expansion Projects" ON expansion_projects FOR ALL USING (
  business_id IN (SELECT business_id FROM business_memberships WHERE user_id = auth.uid())
);

-- Market candidates belong to projects which belong to businesses
CREATE POLICY "Tenant Isolation - Market Candidates" ON market_candidates FOR ALL USING (
  project_id IN (
    SELECT id FROM expansion_projects 
    WHERE business_id IN (SELECT business_id FROM business_memberships WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Tenant Isolation - Franchise Programs" ON franchise_programs FOR ALL USING (
  business_id IN (SELECT business_id FROM business_memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Tenant Isolation - Franchise Candidates" ON franchise_candidates FOR ALL USING (
  business_id IN (SELECT business_id FROM business_memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Tenant Isolation - Territories" ON territories FOR ALL USING (
  business_id IN (SELECT business_id FROM business_memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Tenant Isolation - FDD Versions" ON fdd_versions FOR ALL USING (
  business_id IN (SELECT business_id FROM business_memberships WHERE user_id = auth.uid())
);
