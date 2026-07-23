// Public privacy policy — required for TikTok Display API app review.
// NOTE: This is a plain-language template for a personal, single-user tool.
// Review it and replace the contact email before submitting; it is not legal advice.
export const metadata = { title: "Privacy Policy — gennoai" };

const CONTACT_EMAIL = "your-contact@example.com"; // TODO: replace with a real address
const LAST_UPDATED = "23 July 2026";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 prose prose-sm space-y-4">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

      <p>
        gennoai is a private, single-user analytics dashboard operated by its owner
        to track the performance of their own TikTok content and their app's App
        Store download data. It is not a public service and has no other users.
      </p>

      <h2 className="text-lg font-medium">Information we access</h2>
      <p>With the account owner's explicit authorization via TikTok Login Kit, gennoai accesses:</p>
      <ul className="list-disc pl-6">
        <li>Basic TikTok profile information (open ID and display name), used only to identify the account being displayed.</li>
        <li>The owner's own videos and their public performance metrics (view, like, comment, and share counts).</li>
      </ul>
      <p>
        gennoai does not access private messages, follower lists, or any data
        belonging to other TikTok users.
      </p>

      <h2 className="text-lg font-medium">How we use it</h2>
      <p>
        This information is shown in a private dashboard and stored as periodic
        snapshots so the owner can see how content trends over time. It is used for
        no other purpose.
      </p>

      <h2 className="text-lg font-medium">Storage and sharing</h2>
      <p>
        Data is stored in the owner's own private database and is never sold,
        shared, or disclosed to any third party. Access tokens are stored securely
        and used only to make read-only requests to TikTok on the owner's behalf.
      </p>

      <h2 className="text-lg font-medium">Data deletion</h2>
      <p>
        The owner may revoke gennoai's access at any time from their TikTok account
        settings, after which no further data is collected. Stored data can be
        deleted from the owner's database on request.
      </p>

      <h2 className="text-lg font-medium">Contact</h2>
      <p>Questions about this policy can be sent to {CONTACT_EMAIL}.</p>
    </main>
  );
}
