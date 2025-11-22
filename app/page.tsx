import { ActivityPage } from "@/components/ActivityPage/ActivityPage";
import { getActivities } from "@/lib/activities";

export default async function Home() {
    const activities = await getActivities();
    return <ActivityPage activities={activities} />;
}
