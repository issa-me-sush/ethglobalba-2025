 "use client";

import type { SVGProps } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Heart,
  MessageCircle,
  Repeat2,
  Eye,
  User,
} from "lucide-react";

export const IconCheck = (props: SVGProps<SVGSVGElement>) => (
  <Check aria-hidden {...props} />
);

export const IconCopy = (props: SVGProps<SVGSVGElement>) => (
  <Copy aria-hidden {...props} />
);

export const IconUser = (props: SVGProps<SVGSVGElement>) => (
  <User aria-hidden {...props} />
);

export const IconExternalLink = (props: SVGProps<SVGSVGElement>) => (
  <ExternalLink aria-hidden {...props} />
);

export const IconLike = (props: SVGProps<SVGSVGElement>) => <Heart aria-hidden {...props} />;

export const IconRetweet = (props: SVGProps<SVGSVGElement>) => <Repeat2 aria-hidden {...props} />;

export const IconReply = (props: SVGProps<SVGSVGElement>) => (
  <MessageCircle aria-hidden {...props} />
);

export const IconViews = (props: SVGProps<SVGSVGElement>) => <Eye aria-hidden {...props} />;
