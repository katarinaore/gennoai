// Public terms of service — required for TikTok Display API app review.
// NOTE: Plain-language template for a personal, single-user tool. Review before
// submitting and replace the contact email; this is not legal advice.
export const metadata = { title: "Terms of Service — gennoai" };

const CONTACT_EMAIL = "your-contact@example.com"; // TODO: replace with a real address
const LAST_UPDATED = "23 July 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 prose prose-sm space-y-4">
      <h1 className="text-2xl font-semibold">Terms of Service</h1>
      <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

      <p>
        gennoai is a private, single-user analytics tool operated by its owner for
        personal use. By using it, the owner agrees to the terms below.
      </p>

      <h2 className="text-lg font-medium">Use of the service</h2>
      <p>
        gennoai retrieves the owner's own TikTok content metrics and App Store data
        for display in a private dashboard. It is provided for the owner's personal
        analytics use only and is not offered to the public.
      </p>

      <h2 className="text-lg font-medium">Third-party platforms</h2>
      <p>
        gennoai accesses TikTok data through the official TikTok API and use of that
        data is subject to TikTok's Developer Terms of Service and Community
        Guidelines. gennoai is not affiliated with, endorsed by, or sponsored by
        TikTok or Apple.
      </p>

      <h2 className="text-lg font-medium">No warranty</h2>
      <p>
        gennoai is provided "as is," without warranty of any kind. The owner uses it
        at their own risk, and it may be changed or discontinued at any time.
      </p>

      <h2 className="text-lg font-medium">Contact</h2>
      <p>Questions about these terms can be sent to {CONTACT_EMAIL}.</p>
    </main>
  );
}
