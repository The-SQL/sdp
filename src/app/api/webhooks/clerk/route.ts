import { NextResponse } from "next/server";
import { insertUser } from "@/utils/db/server";

export async function POST(req: Request) {
  try {
    const { data } = await req.json();

    if (
      data?.id &&
      Array.isArray(data.email_addresses) &&
      data.email_addresses.length > 0
    ) {
      await insertUser(
        data.id,
        data.first_name ?? "",
        data.email_addresses[0].email_address
      );
    }

    return NextResponse.json(
      { message: "User inserted successfully" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to insert user: ${err}` },
      { status: 500 }
    );
  }
}
