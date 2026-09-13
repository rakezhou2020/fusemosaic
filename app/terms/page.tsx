import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Review the terms for using FuseMosaic and downloading free fuse bead patterns for personal craft projects.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <EditorialPage eyebrow="Legal" title="Terms of Use" copy="By accessing or using FuseMosaic, you agree to these terms.">
    <p><strong>Last updated: September 2026</strong></p>
    <h2>1. Purpose of the Website</h2>
    <p>FuseMosaic is a free hobby and creative-resource website focused on fuse-bead patterns, pixel-style artwork, crafts, and related educational or recreational content.</p>
    <p>No purchase is currently required to access or download the website’s free patterns.</p>
    <h2>2. Personal Use</h2>
    <p>Patterns may be downloaded and used for personal craft projects.</p>
    <p>Unless a pattern is specifically identified as carrying a separate license, downloading a file does not transfer ownership of FuseMosaic’s original artwork or any third-party intellectual property depicted or referenced in the pattern.</p>
    <h2>3. Third-Party Intellectual Property</h2>
    <p>Some content may depict, refer to, or be inspired by subjects owned or controlled by third parties.</p>
    <p>All copyrights, trademarks, names, likenesses, characters, brands, personality rights, publicity rights, and related rights belonging to third parties remain the property of their respective owners.</p>
    <p>FuseMosaic does not grant users any license to commercially exploit third-party intellectual property.</p>
    <h2>4. No Official Affiliation</h2>
    <p>FuseMosaic is independent and is not affiliated with or endorsed by third-party rights holders unless explicitly stated.</p>
    <h2>5. Prohibited Uses</h2>
    <p>Users may not:</p>
    <ul><li>falsely claim that FuseMosaic or its patterns are officially licensed or endorsed;</li><li>resell FuseMosaic files as officially licensed third-party merchandise;</li><li>remove notices in order to misrepresent ownership or origin;</li><li>use the website in a way that violates applicable law;</li><li>interfere with the operation or security of the website.</li></ul>
    <h2>6. Content Changes</h2>
    <p>FuseMosaic may add, update, restrict, or remove content at any time, including in response to intellectual-property concerns.</p>
    <p>Availability of a pattern at one time does not guarantee permanent availability.</p>
    <h2>7. Disclaimer of Warranties</h2>
    <p>FuseMosaic and its content are provided free of charge on an “as is” and “as available” basis.</p>
    <p>To the extent permitted by applicable law, we make no warranties regarding uninterrupted access, accuracy, suitability for a particular craft project, or continued availability of any content.</p>
    <h2>8. Limitation of Liability</h2>
    <p>To the extent permitted by applicable law, FuseMosaic will not be responsible for indirect or consequential losses arising solely from use of the website or downloaded craft materials.</p>
    <p>Nothing in these terms excludes liability that cannot lawfully be excluded.</p>
    <h2>9. Changes to These Terms</h2>
    <p>These terms may be updated when the website, its features, or applicable requirements change.</p>
    <p>The latest version will be published on this page.</p>
    <h2>10. Contact</h2>
    <p>Questions about these terms may be sent to:</p>
    <p><strong><a href="mailto:rakezhou@hotmail.com">rakezhou@hotmail.com</a></strong></p>
  </EditorialPage>;
}
