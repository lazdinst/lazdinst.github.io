import { FileText, Globe, Mail } from "lucide-react";
import type { LinkKind } from "../types";
import { GitHubIcon, LinkedInIcon } from "./BrandIcons";

interface LinkIconProps {
  kind: LinkKind;
  className?: string;
}

export function LinkIcon({ kind, className }: LinkIconProps) {
  switch (kind) {
    case "github":
      return <GitHubIcon className={className} />;
    case "linkedin":
      return <LinkedInIcon className={className} />;
    case "email":
      return <Mail className={className} />;
    case "resume":
      return <FileText className={className} />;
    default:
      return <Globe className={className} />;
  }
}
