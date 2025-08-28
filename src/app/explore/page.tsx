import { CoursesView } from "@/components/courses/courses-view";
import { ExploreLayout } from "@/components/ui/explore/explore-layout";

export default async function ExplorePage() {
//   const user = await currentUser();

//   if (!user) {
//     redirect("/");
//   }

  return (
    <ExploreLayout>
      <CoursesView />
    </ExploreLayout>
  );
}

export const metadata = {
  title: "Dashboard | My WebApp",
};
