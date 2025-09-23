
import { EmailTemplate } from "@/components/email-templates/collab-invite";
import { NextRequest } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { data } = await req.json();

  if(!data.senderName || !data.courseTitle || !data.courseUrl || !data.to) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const emailData = {
    senderName: data.senderName,
    courseTitle: data.courseTitle,
    courseUrl: data.courseUrl,
    to: data.to
  };

  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [emailData.to],
      subject: "Invitation to collaborate on a course",
      react: EmailTemplate(emailData),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
