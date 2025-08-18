import { ExploreLayout } from "@/components/ui/explore/explore-layout";
import { CoursesView } from "@/components/courses/courses-view";

export default function ExplorePage(){
    return (
        <ExploreLayout>
            <CoursesView/>
        </ExploreLayout>
    )
}

export const metadata = {
    title: "Dashboard | My WebApp",
};