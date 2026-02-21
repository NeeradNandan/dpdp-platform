"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface OrgState {
  orgId: string | null;
  orgName: string | null;
  loading: boolean;
}

export function useOrg(): OrgState {
  const [state, setState] = useState<OrgState>({
    orgId: null,
    orgName: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setState({ orgId: null, orgName: null, loading: false });
        return;
      }

      supabase
        .from("org_members")
        .select("org_id, organizations(name)")
        .eq("user_id", user.id)
        .limit(1)
        .single()
        .then(({ data }) => {
          const orgs = data?.organizations as unknown as
            | { name: string }
            | null;
          setState({
            orgId: data?.org_id ?? null,
            orgName: orgs?.name ?? null,
            loading: false,
          });
        });
    });
  }, []);

  return state;
}
