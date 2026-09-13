import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Read the FuseMosaic disclaimer for information about our independent fan-made fuse bead patterns, third-party rights, and personal-use resources.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return <EditorialPage eyebrow="Legal" title="Disclaimer" copy="FuseMosaic is an independent, non-commercial hobby project created for people who enjoy fuse beads, pixel art, crafts, and creative pattern making.">
    <p><strong>Last updated: September 2026</strong></p>
    <p>All patterns and artwork published on this website are currently provided free of charge for personal, educational, and recreational use.</p>
    <h2>Independent Fan-Made Project</h2>
    <p>FuseMosaic is not affiliated with, endorsed by, sponsored by, or officially connected with any celebrity, artist, studio, game publisher, entertainment company, trademark owner, or other rights holder unless expressly stated otherwise.</p>
    <p>Some patterns may be inspired by popular culture, historical figures, public figures, fictional characters, games, films, television, animation, or other recognizable subjects.</p>
    <p>Any names, characters, trademarks, logos, images, likenesses, or other intellectual property referenced on this website remain the property of their respective owners.</p>
    <p>Their appearance or mention on FuseMosaic does not imply sponsorship, endorsement, authorization, or official partnership.</p>
    <h2>Fan Art and Creative Interpretation</h2>
    <p>Patterns presented on this website are intended as fan-made or independently created craft interpretations.</p>
    <p>FuseMosaic does not claim ownership of third-party characters, brands, personalities, trademarks, copyrighted works, or other underlying intellectual property.</p>
    <p>Where third-party subjects are referenced, our intention is to celebrate craft culture and provide free personal-use patterns rather than replace or compete with official merchandise.</p>
    <h2>No Sale of Third-Party Intellectual Property</h2>
    <p>FuseMosaic does not charge users to access or download its current pattern library.</p>
    <p>Unless explicitly stated otherwise, no pattern featuring or referring to third-party intellectual property is presented as officially licensed merchandise.</p>
    <p>Availability of a pattern on FuseMosaic does not grant users permission from the underlying rights holder to commercially reproduce, distribute, or sell third-party intellectual property.</p>
    <h2>Personal Use</h2>
    <p>Downloads are intended primarily for personal and non-commercial craft use.</p>
    <p>Users are responsible for ensuring that their own use of any downloaded material complies with applicable copyright, trademark, publicity, personality-rights, and other laws in their jurisdiction.</p>
    <h2>Accuracy and Availability</h2>
    <p>Content is provided on an “as is” and “as available” basis.</p>
    <p>We make reasonable efforts to keep the website useful and accurate but do not guarantee that every pattern, description, attribution, link, or other piece of information will always be complete or error-free.</p>
    <p>We may modify, restrict, or remove content at any time.</p>
    <h2>Rights Holders</h2>
    <p>FuseMosaic respects intellectual property rights.</p>
    <p>If you are a copyright owner, trademark owner, authorized representative, or other rights holder and believe that material available on FuseMosaic infringes your rights, please contact us through our Copyright &amp; Takedown process.</p>
    <p>We will review legitimate requests promptly and may temporarily restrict or remove disputed material while the matter is reviewed.</p>
    <p><strong>Contact: <a href="mailto:rakezhou@hotmail.com">rakezhou@hotmail.com</a></strong></p>
    <h2>No Legal Advice</h2>
    <p>Nothing on this website constitutes legal advice.</p>
    <p>Questions about the legal use of copyrighted, trademarked, or personality-related material should be directed to a qualified legal professional.</p>
  </EditorialPage>;
}
