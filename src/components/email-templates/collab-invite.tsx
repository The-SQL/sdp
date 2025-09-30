interface EmailTemplateProps {
  senderName: string;
  courseTitle: string;
  courseUrl?: string;
}

export function EmailTemplate({
  senderName,
  courseTitle,
  courseUrl,
}: EmailTemplateProps) {
  return (
    <div
      style={{
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        color: "#111",
        lineHeight: 1.5,
      }}
    >
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>
        Invitation to collaborate on “{courseTitle}”
      </h1>

      <p>Hi,</p>

      <p>
        <strong>{senderName}</strong> has invited you to collaborate on the
        course <strong>“{courseTitle}”</strong>.
      </p>

      <p>
        {courseUrl ? (
          <a href={courseUrl} style={{ color: "#2563eb" }}>
            Open the course
          </a>
        ) : (
          "Open the course in your dashboard to accept the invite."
        )}
      </p>

      <p style={{ marginTop: 20 }}>
        Thanks,
        <br />
        {senderName}
      </p>
    </div>
  );
}
