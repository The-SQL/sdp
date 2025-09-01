import { NextResponse, NextRequest } from "next/server";
import { insertUser } from "@/utils/db/server";
import { getAllCourses, getCourseById, getRecommendedCourses } from "@/utils/db/client";

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

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (id) {
      const course = await getCourseById(id);
      return NextResponse.json(course);
    } else {
      const courses = await getAllCourses();
      return NextResponse.json(courses);
    }
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}